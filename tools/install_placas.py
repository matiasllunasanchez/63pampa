#!/usr/bin/env python3
"""
install_placas — deja listos para el juego los FONDOS de pantalla completa generados por IA.

Sirve a las DOS carpetas de fondos, porque el trabajo es identico y tener dos copias del script
solo garantizaba que se despegaran:

    --que placas    assets/plates  · los fondos reutilizables (la linea de vuelo, el hangar…)
    --que cuadros   assets/story   · el cuadro propio de UNA escena. Es donde van los dibujos de
                                     Mateo: uno distinto por carta, con el nombre del `img` que
                                     declara esa escena en data/story.js

Que hace, por cada imagen de assets/plates/:
  1. La ESCALA para que entre en 960x540 sin deformarla ni recortarla. No se recorta al 16:9
     porque las paginas del cuaderno son 3:4 VERTICAL: recortarlas les come mas de la mitad.
     Las verticales quedan mas angostas y el motor las centra.
  2. 960x540 es el tamaño 1:1. No es arbitrario: render/screens.js dibuja la
     placa a DW x DH (320x180) y U*SC = 3 exacto, asi que ocupa 960x540 px de buffer.
  3. La guarda como .webp.

     OJO CON EL PORQUE, que cambio: esto NO se hace por el techo de 16 MB del build web. El juego
     se empaqueta con Electron para Steam y ese techo no le aplica. La razon que si vale, y que
     vale en cualquier plataforma, es LA RESOLUCION: las fuentes vienen en 2752x1536 o mas, y el
     motor las dibuja a 960x540. Mandar una imagen tres veces mas grande de lo que se ve significa
     decodificar tres veces mas pixeles en cada transicion de escena y que Chromium la reduzca al
     vuelo, cada vez. Reducirla una sola vez, aca, sale gratis en calidad y se paga solo en carga.

     Que ademas pesen ~100 KB en vez de ~3 MB es una consecuencia, no el motivo — pero no es poca
     cosa para el tamaño de descarga y de parche en Steam: 246 MB de fuentes contra 4 MB de webp.

Las fuentes NO se tocan: quedan en assets/source/, por si hay que rehacer la conversion.

Uso:
    python3 tools/install_placas.py [--calidad 88] [--dry-run]
"""

# entra al venv de arte si hace falta (ver tools/_venv.py). VA PRIMERO, antes de PIL.
import _venv  # noqa: F401
import argparse
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
# DE DONDE LEE Y DONDE ESCRIBE. Las FUENTES viven apartadas en assets/source/: son de 2 a 8 MB
# cada una y el juego no las usa, asi que quedan fuera de la lista blanca de electron-builder y no
# viajan a Steam. Lo que si viaja es el .webp, que se escribe en la carpeta que lee el motor.
CARPETAS = {'placas': ('source/plates', 'plates'), 'cuadros': ('source/story', 'story')}
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
    ap.add_argument('--que', choices=sorted(CARPETAS), default='placas',
                    help='placas = assets/plates, los fondos reutilizables · cuadros = '
                         'assets/story, el cuadro propio de UNA escena (los dibujos de Mateo en '
                         'cada carta). Mismo tamaño y mismo formato: solo cambia la carpeta')
    ap.add_argument('--dry-run', action='store_true', help='no escribe nada')
    args = ap.parse_args()
    sub_fuente, sub_salida = CARPETAS[args.que]
    DIR = ROOT / 'assets' / sub_fuente
    SALIDA = ROOT / 'assets' / sub_salida
    SALIDA.mkdir(parents=True, exist_ok=True)

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
        destino = SALIDA / (src.stem + '.webp')
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
        print('\nLas fuentes quedaron intactas en assets/source/.')
    else:
        print('  (dry-run: no se escribio nada)')


if __name__ == '__main__':
    main()
