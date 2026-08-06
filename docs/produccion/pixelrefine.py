#!/usr/bin/env python3
"""
pixelrefine — devuelve el pixel art crocante a un video generado por IA.

Pensado para RASANTE: los modelos de video (Kling, Veo, Runway) suavizan el pixel
art — bordes con anti-aliasing, dithering convertido en degradé, motion blur, y la
paleta "hirviendo" de frame a frame.

Diferencia clave contra las herramientas de navegador tipo PixelRefiner: esas
procesan cada imagen POR SEPARADO. En video eso es fatal: la grilla y la paleta se
re-detectan en cada frame, cambian un poquito, y el resultado titila. Acá la grilla
y la paleta se calculan UNA vez y se bloquean para toda la secuencia.

Uso:
    python3 pixelrefine.py entrada.mp4 salida.mp4 --colors 48 --upscale 4
    python3 pixelrefine.py entrada.mp4 salida.mp4 --grid 6      # grilla forzada
    python3 pixelrefine.py frames_dir/ salida_dir/              # imágenes sueltas
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

IMG_EXT = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}


# ---------------------------------------------------------------- grilla

def detect_grid(img, lo=2, hi=16):
    """Encuentra el tamaño de bloque del pixel art original.

    Un pixel art escalado tiene los bordes alineados a una grilla regular. Se
    proyecta la magnitud del gradiente sobre cada eje y se busca el periodo con
    mayor energía: el periodo real hace que casi todos los bordes caigan en los
    mismos índices módulo N.
    """
    g = np.asarray(img.convert("L"), dtype=np.float32)
    dx = np.abs(np.diff(g, axis=1)).sum(axis=0)
    dy = np.abs(np.diff(g, axis=0)).sum(axis=1)

    def best_period(sig):
        if sig.size < hi * 3:
            return 1, 0.0, {}
        sig = sig - sig.mean()
        scores = {}
        for n in range(lo, hi + 1):
            # energía concentrada en una sola fase de la grilla
            phases = [sig[p::n].sum() for p in range(n)]
            scores[n] = max(phases) / (np.abs(sig).sum() / n + 1e-6)
        n = max(scores, key=scores.get)
        return n, scores[n], scores

    nx, sx, best_scores_x = best_period(dx)
    ny, sy, best_scores_y = best_period(dy)
    n, scores = (nx, best_scores_x) if sx >= sy else (ny, best_scores_y)

    # Preferir la FUNDAMENTAL sobre sus armónicos: 12px suele ser en realidad 6px
    # medido de a dos bloques. Si un divisor puntúa casi igual, ese es el real.
    for d in range(lo, n):
        if n % d == 0 and scores.get(d, 0) >= 0.80 * scores[n]:
            n = d
            break
    return max(1, int(n))


def detect_phase(img, n):
    """Offset de la grilla: dónde arranca el primer bloque completo."""
    if n <= 1:
        return 0, 0
    g = np.asarray(img.convert("L"), dtype=np.float32)
    dx = np.abs(np.diff(g, axis=1)).sum(axis=0)
    dy = np.abs(np.diff(g, axis=0)).sum(axis=1)
    px = int(np.argmax([dx[p::n].sum() for p in range(n)]))
    py = int(np.argmax([dy[p::n].sum() for p in range(n)]))
    return (px + 1) % n, (py + 1) % n


# ---------------------------------------------------------------- bloques

def block_reduce(img, n, ox=0, oy=0):
    """Baja a resolución nativa tomando la MEDIANA de cada bloque.

    La mediana es lo importante: el promedio conserva el anti-aliasing (es
    justamente lo que el AA hizo), la mediana lo tira a la basura y se queda con
    el color dominante real del bloque.
    """
    if n <= 1:
        return img.convert("RGB")
    a = np.asarray(img.convert("RGB"), dtype=np.uint8)
    a = a[oy:, ox:]
    h, w = a.shape[0] // n * n, a.shape[1] // n * n
    if h == 0 or w == 0:
        return img.convert("RGB")
    a = a[:h, :w].reshape(h // n, n, w // n, n, 3).swapaxes(1, 2)
    med = np.median(a.reshape(h // n, w // n, n * n, 3), axis=2)
    return Image.fromarray(med.astype(np.uint8), "RGB")


# ---------------------------------------------------------------- paleta

def build_palette(frames, colors, samples=16):
    """UNA paleta para toda la secuencia — esto es lo que mata el titileo.

    Dos decisiones importantes:

    1. Se muestrean frames a lo largo de TODO el video, no solo el primero: así
       ningún frame estrena colores propios a mitad de camino.

    2. **Pesado por raíz cuadrada de la frecuencia.** Sin esto, un cielo enorme y
       plano se come toda la paleta y los objetos chicos —un avión, una cara, una
       llama— se hunden en el color del fondo. La raíz cuadrada le baja el precio
       a las áreas grandes sin ignorarlas: el cielo se lleva los colores que
       necesita, no todos.
    """
    idx = np.linspace(0, len(frames) - 1, min(samples, len(frames))).astype(int)
    px = np.concatenate([
        np.asarray(frames[i].convert("RGB"), dtype=np.uint8).reshape(-1, 3) for i in idx
    ])

    # agrupar en una grilla gruesa (5 bits/canal) para contar colores parecidos juntos
    coarse = (px >> 3).astype(np.int32)
    key = (coarse[:, 0] << 10) | (coarse[:, 1] << 5) | coarse[:, 2]
    uniq, inv, cnt = np.unique(key, return_inverse=True, return_counts=True)

    # color medio real de cada grupo (no el centro del bin: conserva el tono exacto)
    reps = np.zeros((uniq.size, 3), dtype=np.float64)
    np.add.at(reps, inv, px)
    reps = (reps / cnt[:, None]).round().astype(np.uint8)

    weights = np.maximum(1, np.sqrt(cnt)).astype(np.int64)
    weights = np.maximum(1, weights * 4096 // max(1, weights.max()))  # acotar el tamaño
    sample = np.repeat(reps, weights, axis=0)

    side = int(np.ceil(np.sqrt(sample.shape[0])))
    pad = np.zeros((side * side - sample.shape[0], 3), dtype=np.uint8)
    if pad.size:
        pad[:] = sample[-1]
    grid = np.concatenate([sample, pad]).reshape(side, side, 3)

    return Image.fromarray(grid, "RGB").quantize(
        colors=colors, method=Image.MEDIANCUT, dither=Image.Dither.NONE)


def apply_palette(img, pal):
    return img.quantize(palette=pal, dither=Image.Dither.NONE).convert("RGB")


# ---------------------------------------------------------------- pipeline

def temporal_denoise(frames, window=3, thresh=14.0):
    """Mata el titileo SIN arrastrar el movimiento.

    El problema: el modelo de video hace variar un poquito el color de zonas que
    deberían estar quietas, y al cuantizar esos píxeles saltan de un color de la
    paleta a otro y de vuelta. El cielo "hierve".

    La solución no es promediar todo —eso deja estelas detrás de lo que se mueve—
    sino aplicar la mediana temporal **solo donde el píxel casi no cambió**. Si
    cambió mucho, es movimiento real y se respeta tal cual.
    """
    a = np.stack([np.asarray(f.convert("RGB"), dtype=np.float32) for f in frames])
    r = window // 2
    out = []
    for i in range(a.shape[0]):
        lo, hi = max(0, i - r), min(a.shape[0], i + r + 1)
        med = np.median(a[lo:hi], axis=0)
        moving = (np.abs(a[i] - med).max(axis=2, keepdims=True) > thresh)
        merged = np.where(moving, a[i], med)
        out.append(Image.fromarray(merged.astype(np.uint8), "RGB"))
    return out


def refine_sequence(images, colors=48, grid=None, upscale=1, native=None,
                    temporal=3, verbose=True):
    ref = images[len(images) // 2]

    if native:
        # Camino recomendado: vos SABÉS la resolución nativa del juego. Es inmune a
        # que el modelo haya reescalado con un factor no entero (pasa siempre).
        nw, nh = native
        if verbose:
            print(f"  resolución nativa forzada: {nw}x{nh}", file=sys.stderr)
        small = [im.resize((nw, nh), Image.BOX) for im in images]
    else:
        n = grid or detect_grid(ref)
        ox, oy = detect_phase(ref, n)
        if verbose:
            auto = "forzada" if grid else "detectada (verificá — si falla, usá --native)"
            print(f"  grilla {auto}: {n}px  (fase {ox},{oy})", file=sys.stderr)
        small = [block_reduce(im, n, ox, oy) for im in images]

    if temporal > 1 and len(small) >= temporal:
        small = temporal_denoise(small, temporal)
        if verbose:
            print(f"  estabilizado temporal: ventana {temporal}", file=sys.stderr)

    pal = build_palette(small, colors)
    if verbose:
        print(f"  paleta bloqueada: {colors} colores", file=sys.stderr)

    out = []
    for im in small:
        q = apply_palette(im, pal)
        if upscale > 1:
            q = q.resize((q.width * upscale, q.height * upscale), Image.NEAREST)
        out.append(q)
    return out


# ---------------------------------------------------------------- io

def load_dir(p):
    files = sorted(f for f in Path(p).iterdir() if f.suffix.lower() in IMG_EXT)
    if not files:
        sys.exit(f"No hay imágenes en {p}")
    return files, [Image.open(f).convert("RGB") for f in files]


def video_to_frames(src, workdir):
    fps = subprocess.run(
        ["ffprobe", "-v", "0", "-of", "csv=p=0", "-select_streams", "v:0",
         "-show_entries", "stream=r_frame_rate", str(src)],
        capture_output=True, text=True).stdout.strip()
    try:
        num, den = fps.split("/")
        fps = float(num) / float(den)
    except Exception:
        fps = 24.0
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(src),
                    str(workdir / "f_%06d.png")], check=True)
    return fps


def frames_to_video(workdir, dst, fps):
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-framerate", str(fps),
        "-i", str(workdir / "o_%06d.png"),
        "-c:v", "libx264", "-preset", "slow", "-crf", "12",
        "-pix_fmt", "yuv420p",
        # sin escalado suave: el video final tiene que respetar el píxel
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=neighbor",
        str(dst)], check=True)


def main():
    ap = argparse.ArgumentParser(description="Devuelve el pixel art crocante a video generado por IA.")
    ap.add_argument("entrada", help="video o carpeta de frames")
    ap.add_argument("salida", help="video o carpeta de salida")
    ap.add_argument("--colors", type=int, default=48, help="colores de la paleta bloqueada (default 48)")
    ap.add_argument("--grid", type=int, default=None, help="tamaño de bloque forzado (default: autodetectar)")
    ap.add_argument("--upscale", type=int, default=1, help="reescalado entero nearest-neighbor al final")
    ap.add_argument("--temporal", type=int, default=3,
                    help="ventana de estabilizacion temporal, 1 = apagado (default 3)")
    ap.add_argument("--native", default=None, metavar="WxH",
                    help="RECOMENDADO: resolución nativa del juego, ej. 480x270. Inmune a reescalados no enteros.")
    args = ap.parse_args()
    native = tuple(int(v) for v in args.native.lower().split("x")) if args.native else None

    src = Path(args.entrada)
    dst = Path(args.salida)

    if src.is_dir():
        names, imgs = load_dir(src)
        print(f"{len(imgs)} frames", file=sys.stderr)
        out = refine_sequence(imgs, args.colors, args.grid, args.upscale, native, args.temporal)
        dst.mkdir(parents=True, exist_ok=True)
        for f, im in zip(names, out):
            im.save(dst / f.name)
        print(f"listo → {dst}/", file=sys.stderr)
        return

    tmp = Path(tempfile.mkdtemp())
    try:
        fps = video_to_frames(src, tmp)
        files = sorted(tmp.glob("f_*.png"))
        print(f"{len(files)} frames @ {fps:.2f} fps", file=sys.stderr)
        imgs = [Image.open(f).convert("RGB") for f in files]
        out = refine_sequence(imgs, args.colors, args.grid, args.upscale, native, args.temporal)
        for i, im in enumerate(out, 1):
            im.save(tmp / f"o_{i:06d}.png")
        frames_to_video(tmp, dst, fps)
        print(f"listo → {dst}", file=sys.stderr)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
