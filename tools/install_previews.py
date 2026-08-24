#!/usr/bin/env python3
"""
install_previews — convierte las ilustraciones generadas por IA en las previews del menu.

Que hace, por cada avion:
  1. Le devuelve el pixel art crocante con docs/produccion/pixelrefine.py (grilla y paleta
     bloqueadas, cuantizacion) — una IA no entrega pixel art de verdad, entrega algo que se
     PARECE: bordes con anti-aliasing y degrades donde deberia haber dithering.
  2. Lo lleva al ancho EXACTO con el que el juego lo dibuja: 390 px.
     No es un numero arbitrario. En render/menus.js la preview se dibuja a PW = 130 unidades
     de DISEÑO, y U (1.5) x SC (2) = 3 exacto, asi que en el buffer ocupa 130*3 = 390 px.
     A ese tamaño el mapeo es 1:1 y el pixel art se ve como fue dibujado. Si el asset mide
     otra cosa, el navegador lo reescala por un factor no entero y lo arruina.
  3. Lo guarda como .webp (el build web tiene techo de 16 MB — ver tools/build_web.py).

Uso:
    python3 tools/install_previews.py <carpeta_con_pngs> [--colors 48] [--dry-run]

La carpeta lleva un archivo por avion, nombrado con su KEY de data/planes.js:
    sky.png  dagger.png  supere.png  a4q.png  mirage.png  pampa.png
Los que falten se saltean, asi se puede instalar de a uno.

Necesita numpy y Pillow. Si no estan:
    python3 -m venv .venv-art && ./.venv-art/bin/pip install numpy Pillow
    ./.venv-art/bin/python tools/install_previews.py ...
"""

# entra al venv de arte si hace falta (ver tools/_venv.py). VA PRIMERO, antes de PIL.
import _venv  # noqa: F401
import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'docs' / 'produccion'))

import numpy as np                         # noqa: E402
from PIL import Image                      # noqa: E402
from pixelrefine import refine_sequence    # noqa: E402

# key de data/planes.js -> carpeta en assets/planes/
SLUG = {'sky': 'a4-skyhawk', 'dagger': 'iai-dagger', 'supere': 'super-etendard',
        'a4q': 'a4q', 'pampa': 'pampa-63', 'mirage': 'mirage-5p'}

# ANCHO CANONICO: PW (130, render/menus.js) * U*SC (3, render/ctx.js). Ver el docstring.
ANCHO = 390
BLANCO = 232        # a partir de aca se considera "fondo blanco" (los tres canales)


def alpha_por_inundacion(rgb):
    """Alfa a partir de un fondo blanco, inundando desde los BORDES.

    Las previews del menu se dibujan sobre el panel, asi que necesitan transparencia — pero
    una IA no entrega alfa: entrega el avion sobre blanco. Se podria borrar "todo lo blanco",
    y ahi esta la trampa: el avion TIENE blanco adentro (brillos, la escarapela, los rotulos
    de las bombas). Por eso se inunda desde el marco: solo desaparece el blanco CONECTADO al
    borde, y el de adentro del avion se queda donde esta.
    """
    a = np.asarray(rgb, dtype=np.uint8)
    h, w = a.shape[:2]
    claro = (a[:, :, 0] >= BLANCO) & (a[:, :, 1] >= BLANCO) & (a[:, :, 2] >= BLANCO)
    fondo = np.zeros((h, w), dtype=bool)
    pila = [(0, x) for x in range(w) if claro[0, x]] + [(h - 1, x) for x in range(w) if claro[h - 1, x]]
    pila += [(y, 0) for y in range(h) if claro[y, 0]] + [(y, w - 1) for y in range(h) if claro[y, w - 1]]
    for y, x in pila:
        fondo[y, x] = True
    while pila:
        y, x = pila.pop()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and claro[ny, nx] and not fondo[ny, nx]:
                fondo[ny, nx] = True
                pila.append((ny, nx))
    return Image.fromarray(np.where(fondo, 0, 255).astype(np.uint8), 'L')


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('entrada', help='carpeta con <key>.png')
    ap.add_argument('--colors', type=int, default=48, help='colores de la paleta (default 48)')
    ap.add_argument('--dry-run', action='store_true', help='no escribe nada, solo informa')
    ap.add_argument('--keep-bg', action='store_true',
                    help='no recortar el fondo (por defecto se vuelve transparente)')
    args = ap.parse_args()

    src = Path(args.entrada)
    if not src.is_dir():
        sys.exit(f'no es una carpeta: {src}')

    hechos = 0
    for key, slug in SLUG.items():
        entrada = next((src / f'{key}{e}' for e in ('.png', '.jpg', '.jpeg', '.webp')
                        if (src / f'{key}{e}').exists()), None)
        if entrada is None:
            continue
        im = Image.open(entrada)
        alto = round(ANCHO * im.height / im.width)
        # el alfa viaja APARTE: pixelrefine trabaja en RGB, y si se le pasa la imagen aplastada
        # el fondo transparente sale negro (pasó en la primera prueba).
        alfa_src = im.getchannel('A') if im.mode in ('RGBA', 'LA') else None
        im = im.convert('RGB')
        # UNO POR UNO y no los seis juntos: refine_sequence BLOQUEA una paleta para toda la
        # tanda, y compartirla entre el camo verde del A-4, el azul naval del Etendard y el
        # gris nuevo del Mirage aplastaria justo lo que distingue a cada avion.
        out = refine_sequence([im], colors=args.colors, grid=None, upscale=1,
                              native=(ANCHO, alto), temporal=1)[0]
        if out.size != (ANCHO, alto):
            out = out.resize((ANCHO, alto), Image.NEAREST)
        if not args.keep_bg:
            # alfa DURO (0 o 255), nunca degradado: un borde semitransparente en pixel art se
            # ve como un halo sucio alrededor del avion.
            if alfa_src is not None:
                a = alfa_src.resize((ANCHO, alto), Image.BOX).point(lambda v: 255 if v >= 128 else 0)
            else:
                a = alpha_por_inundacion(out)
            out = out.convert('RGBA')
            out.putalpha(a)
        destino = ROOT / 'assets' / 'planes' / slug / 'preview.webp'
        print(f'  {key:8s} {entrada.name:22s} {im.width}x{im.height} -> {ANCHO}x{alto}  '
              f'-> {destino.relative_to(ROOT)}')
        if not args.dry_run:
            out.save(destino, 'WEBP', quality=92, method=6)
            print(f'           {destino.stat().st_size / 1024:.0f} KB')
        hechos += 1

    if not hechos:
        sys.exit(f'no se encontro ningun <key>.png en {src}. Keys validas: {", ".join(SLUG)}')
    print(f'\nlisto: {hechos} preview(s).'
          f'{"  (dry-run: no se escribio nada)" if args.dry_run else ""}')
    print('Despues: npm run build:game  y mirar el menu de avion con las seis juntas.')


if __name__ == '__main__':
    main()
