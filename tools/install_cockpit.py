#!/usr/bin/env python3
"""
install_cockpit — convierte una cabina generada por IA en el asset del juego.

Que hace:
  1. RECORTA EL VERDE CROMA en TODA la imagen, no solo desde los bordes. Es a proposito: los
     espejos son islas de verde rodeadas de marco, y un recorte por inundacion desde el borde
     no llegaria a ellas. Recortando por color salen huecos sin trabajo extra — que es la
     razon por la que la cabina se pide con fondo verde y no transparente.
  2. Deja el ALFA DURO (0 o 255). Un borde semitransparente contra el mar deja un halo sucio.
  3. Lleva la imagen a 984 x 564, que es el tamaño 1:1: render/momentum.js dibuja la cabina a
     W+12 x H+12 y el buffer es SC=2. Con otro tamaño el reescalado no entero rompe el pixel art.

Uso:
    python3 tools/install_cockpit.py cabina.png a4-skyhawk
    python3 tools/install_cockpit.py cabina.png a4-skyhawk --dry-run --verde 00ff2a

Necesita numpy y Pillow:
    python3 -m venv .venv-art && ./.venv-art/bin/pip install numpy Pillow
"""

# entra al venv de arte si hace falta (ver tools/_venv.py). VA PRIMERO, antes de PIL.
import _venv  # noqa: F401
import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ANCHO, ALTO = 984, 564          # ver el docstring: es el tamaño 1:1, no una preferencia
TOLERANCIA = 90                 # distancia euclidea al croma por debajo de la cual se recorta


def recortar_croma(im, croma, tol):
    """Alfa 0 donde el pixel se parece al croma. Devuelve (imagen RGBA, cuantos recorto)."""
    # int32 y no int16: (255-0)**2 = 65025 desborda int16 (tope 32767) y la distancia sale
    # basura justo en los pixeles MAS lejanos al croma — o sea, en el avion.
    a = np.asarray(im.convert('RGB'), dtype=np.int32)
    d = np.sqrt(((a - np.array(croma, dtype=np.int32)) ** 2).sum(axis=2))
    fuera = d < tol
    # ALFA DURO: 0 o 255, nunca un degradado. Es lo que evita el halo verde en el borde.
    alfa = np.where(fuera, 0, 255).astype(np.uint8)
    out = im.convert('RGBA')
    out.putalpha(Image.fromarray(alfa, 'L'))
    return out, int(fuera.sum())


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('entrada', help='PNG de la cabina, con fondo verde croma')
    ap.add_argument('slug', help='carpeta destino en assets/planes/ (ej: a4-skyhawk)')
    ap.add_argument('--verde', default='00ff00', help='color a recortar en hex (default 00ff00)')
    ap.add_argument('--tol', type=int, default=TOLERANCIA, help=f'tolerancia (default {TOLERANCIA})')
    ap.add_argument('--dry-run', action='store_true', help='no escribe nada, solo informa')
    args = ap.parse_args()

    src = Path(args.entrada)
    if not src.is_file():
        sys.exit(f'no existe: {src}')
    destino = ROOT / 'assets' / 'planes' / args.slug / 'cockpit.png'
    if not destino.parent.is_dir():
        sys.exit(f'no existe la carpeta del avion: {destino.parent}')

    h = args.verde.lstrip('#')
    croma = tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

    im = Image.open(src)
    out, n = recortar_croma(im, croma, args.tol)
    total = im.width * im.height
    print(f'  {src.name}  {im.width}x{im.height}')
    print(f'  croma #{h} tol {args.tol} -> recortado {n / total * 100:.0f}% de la imagen')
    if n / total < 0.15:
        print('  ⚠ se recorto muy poco: revisa el color con --verde, o el generador no uso croma')
    if out.size != (ANCHO, ALTO):
        # LANCZOS y no NEAREST: viene de una imagen grande y hay que BAJARLA. El pixel art se
        # recupera despues con docs/produccion/pixelrefine.py, no aca.
        out = out.resize((ANCHO, ALTO), Image.LANCZOS)
        # el resize suaviza el alfa: se vuelve a endurecer
        out.putalpha(out.getchannel('A').point(lambda v: 255 if v >= 128 else 0))
        print(f'  -> {ANCHO}x{ALTO}')

    if args.dry_run:
        print('\n(dry-run: no se escribio nada)')
        return
    out.save(destino, 'PNG')
    print(f'  -> {destino.relative_to(ROOT)}  ({destino.stat().st_size / 1024:.0f} KB)')
    print('\nDespues: npm run build:game y mirar la cabina en el juego.')


if __name__ == '__main__':
    main()
