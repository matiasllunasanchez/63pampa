#!/usr/bin/env python3
"""
install_placas — deja listas para el juego las placas generadas por IA.

Que hace, por cada imagen de assets/plates/:
  1. La ESCALA para que entre en 960x540 sin deformarla ni recortarla. No se recorta al 16:9
     porque las paginas del cuaderno son 3:4 VERTICAL: recortarlas les come mas de la mitad.
     Las verticales quedan mas angostas y el motor las centra.
  2. 960x540 es el tamaño 1:1. No es arbitrario: render/screens.js dibuja la
     placa a DW x DH (320x180) y U*SC = 3 exacto, asi que ocupa 960x540 px de buffer.
  3. La guarda como .webp. Las fuentes pesan ~3 MB cada una (109 MB en total) y el build web
     tiene techo de 16 MB; en webp quedan en ~100 KB sin perder nada visible a ese tamaño.

Las originales NO se tocan: quedan al lado, por si hay que rehacer la conversion.

Uso:
    python3 tools/install_placas.py [--calidad 88] [--dry-run]
"""
import argparse
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
DIR = ROOT / 'assets' / 'plates'
ANCHO, ALTO = 960, 540          # ver el docstring: es el tamaño 1:1
FUENTES = {'.jpeg', '.jpg', '.png'}


def encajar(im):
    """Escala la imagen para que ENTRE en 960x540 sin deformarla ni recortarla.

    No se recorta al 16:9 a proposito: las paginas del cuaderno son 3:4 VERTICAL (registro
    TIERRA) y recortarlas les come mas de la mitad. El que centra y deja las bandas oscuras
    a los costados es render/screens.js, que dibuja la placa respetando su relacion de
    aspecto — una hoja vertical sobre pantalla negra se lee como una hoja, y estirada a
    16:9 no se lee como nada.
    """
    w, h = im.size
    esc = min(ANCHO / w, ALTO / h)
    return im.resize((max(1, round(w * esc)), max(1, round(h * esc))), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--calidad', type=int, default=88, help='calidad webp (default 88)')
    ap.add_argument('--dry-run', action='store_true', help='no escribe nada')
    args = ap.parse_args()

    if not DIR.is_dir():
        sys.exit(f'no existe {DIR}')
    fuentes = sorted(p for p in DIR.iterdir() if p.suffix.lower() in FUENTES)
    if not fuentes:
        sys.exit(f'no hay imagenes en {DIR}')

    total_antes = total_despues = 0
    for src in fuentes:
        im = Image.open(src).convert('RGB')
        antes = src.stat().st_size
        out = encajar(im)
        destino = src.with_suffix('.webp')
        vert = out.width / out.height < 1.5
        nota = '  · VERTICAL, el motor la centra' if vert else ''
        if args.dry_run:
            print(f'  {src.name:26s} {im.width}x{im.height} -> {out.width}x{out.height}{nota}')
            total_antes += antes
            continue
        out.save(destino, 'WEBP', quality=args.calidad, method=6)
        despues = destino.stat().st_size
        total_antes += antes; total_despues += despues
        print(f'  {src.name:26s} {antes/1e6:5.1f} MB -> {despues/1024:4.0f} KB  {out.width}x{out.height}{nota}')

    print(f'\n{len(fuentes)} placas · {total_antes/1e6:.0f} MB', end='')
    if not args.dry_run:
        print(f' -> {total_despues/1e6:.1f} MB')
        print('\nLas originales quedaron al lado, sin tocar.')
    else:
        print('  (dry-run: no se escribio nada)')


if __name__ == '__main__':
    main()
