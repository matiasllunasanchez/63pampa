#!/usr/bin/env python3
"""
install_retratos — saca los retratos de la caja de dialogo de una LAMINA de personaje.

De donde salen los retratos: las laminas finales de docs/historia/characters_examples/final/
YA TRAEN, abajo, una tira de cabezas con las expresiones del personaje, dibujadas en el estilo
de la casa. Ese es el material bueno. Este script corta esa tira y deja cada cabeza en
assets/portraits/<id>.png con el tamaño exacto que el motor dibuja.

  python3 tools/install_retratos.py final/tero3.png --region 0.565,0.775,1,1 \
      tero_sonrisa tero_preocupado tero_ceno tero_roto

Que hace, y por que cada paso existe:

  1. --region recorta LA TIRA de la lamina completa (fracciones 0..1 o pixeles). Sin esto habria
     que recortar a mano en un editor antes de cada corrida.
  2. CORTA la tira en N columnas iguales.
  3. LIMPIA EL FONDO DESDE EL BORDE HACIA ADENTRO, y el color de fondo LO APRENDE de las esquinas
     — las laminas de la casa van sobre gris plano, no sobre verde de croma. Rellenar desde el
     borde ademas se lleva los marcos y las canaletas que el generador dibuja entre celdas, y NO
     toca el negro de adentro, que es el contorno del personaje y es lo que hace al estilo.
  4. RECORTA AL CONTENIDO y lo CUADRA ANCLADO ARRIBA: si la celda trae mas cuerpo del necesario,
     el cuadrado de arriba es justo el busto.
  5. ESCALA A 108x108. No es arbitrario: render/screens.js dibuja el busto a 36x36 px de diseño
     (screens.js:482) y U*SC = 3 exacto, asi que ocupa 108x108 px de buffer.

La lamina original NO se toca.

Con --preview escribe una tira de control al lado en vez de tocar assets/, para poder mirar el
recorte antes de instalarlo.
"""

# entra al venv de arte si hace falta (ver tools/_venv.py). VA PRIMERO, antes de PIL.
import _venv  # noqa: F401
import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
DESTINO = ROOT / 'assets' / 'portraits'
LADO = 108                      # ver el docstring: 36 px de diseño x U*SC(3)


def fondo_de(im):
    """Aprende el color de fondo mirando las esquinas, en vez de asumirlo.

    Las laminas de la casa van sobre GRIS PLANO (ver characters_examples/final/) y las hojas
    pedidas para recorte, sobre verde de croma. Dar por sentado uno de los dos rompia con el
    otro, y el dato esta ahi: las cuatro esquinas de una celda son fondo por construccion.
    """
    w, h = im.size
    esq = [im.getpixel(p)[:3] for p in ((1, 1), (w - 2, 1), (1, h - 2), (w - 2, h - 2))]
    return tuple(sorted(c[i] for c in esq)[len(esq) // 2] for i in range(3))


def es_fondo(p, fondo, tol):
    """¿Este pixel del borde parece fondo? El color aprendido, o el oscuro de un marco."""
    r, g, b = p[:3]
    cerca = abs(r - fondo[0]) + abs(g - fondo[1]) + abs(b - fondo[2]) < tol * 2
    oscuro = r + g + b < 110
    return cerca or oscuro


def limpiar_borde(im, tol):
    """Rellena el fondo DESDE EL BORDE HACIA ADENTRO. Ver punto 2 del docstring.

    Se siembra en los cuatro vertices y en el medio de cada lado, y solo donde el pixel ya
    parece fondo — sembrar sobre el personaje se lo comeria entero. Cada semilla arrastra su
    region conectada, asi que una canaleta negra se va completa y el contorno negro del
    personaje, que no toca el borde, se queda.
    """
    im = im.convert('RGBA')
    w, h = im.size
    fondo = fondo_de(im)
    semillas = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
                (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2),
                (w // 4, 0), (3 * w // 4, 0), (w // 4, h - 1), (3 * w // 4, h - 1)]
    px = im.load()
    for s in semillas:
        if px[s][3] and es_fondo(px[s], fondo, tol):
            ImageDraw.floodfill(im, s, (0, 0, 0, 0), thresh=tol)
    return im


def sacar_orla(im, tol, fondo):
    """La orla del contorno: pixeles a medio camino entre el fondo y el personaje.

    El relleno de borde deja un anillo de un pixel contaminado con el color del fondo. Sin esta
    pasada queda un halo que a 108 px se ve. No se borra —eso se comeria el contorno— se le baja
    la contaminacion.
    """
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            d = abs(r - fondo[0]) + abs(g - fondo[1]) + abs(b - fondo[2])
            if d < tol // 2:
                px[x, y] = (0, 0, 0, 0)        # islas de fondo que el relleno no alcanzo
            elif d < tol:
                px[x, y] = (r, g, b, 170)      # la orla: se afina, no se borra
    return im


def cuadrar(im, anclaje):
    """Recorta al contenido y lo lleva a cuadrado. Ver punto 3 del docstring.

    Tres anclajes, y cual sirve depende de QUE trae la celda:

      top    — la celda vino de cuerpo entero y sobra cuerpo: el cuadrado de arriba es el busto.
      centro — la celda trae mas o menos un busto y se recorta parejo arriba y abajo.
      pad    — la celda YA ES una cabeza justa: recortar le come el pelo o el menton, asi que en
               vez de recortar se RELLENA a los costados. Es el que va para las tiras cosechadas
               de las laminas, que vienen ajustadas al milimetro.
    """
    from PIL import Image as _I
    caja = im.getbbox()
    if caja:
        im = im.crop(caja)
    w, h = im.size
    if anclaje == 'pad':
        lado = max(w, h)
        fondo = _I.new('RGBA', (lado, lado), (0, 0, 0, 0))
        fondo.alpha_composite(im, ((lado - w) // 2, (lado - h) // 2))
        return fondo
    if h > w:                       # figura mas alta que ancha: sobra cuerpo
        y = 0 if anclaje == 'top' else (h - w) // 2
        return im.crop((0, y, w, y + w))
    if w > h:                       # mas ancha que alta: se centra
        x = (w - h) // 2
        return im.crop((x, 0, x + h, h))
    return im


def main():
    ap = argparse.ArgumentParser(description='Corta una hoja de rostros en retratos sueltos.')
    ap.add_argument('hoja', help='la tira generada (png/jpg)')
    ap.add_argument('ids', nargs='+', help='un id por celda, de izquierda a derecha')
    ap.add_argument('--tol', type=int, default=180, help='tolerancia del verde (default 180)')
    ap.add_argument('--borde', type=int, default=90, help='tolerancia del relleno de borde (default 90)')
    ap.add_argument('--anclaje', choices=['top', 'centro', 'pad'], default='top',
                    help='top = el busto de una celda de cuerpo entero (default) · centro = recorte parejo · '
                         'pad = no recorta, rellena a los costados (para tiras de cabezas ya ajustadas)')
    ap.add_argument('--region', help='recorte de la tira dentro de la lamina: x,y,x2,y2 '
                                     '(fracciones 0..1, o pixeles si alguno supera 1)')
    ap.add_argument('--preview', action='store_true',
                    help='escribe una tira de control al lado de la lamina en vez de tocar assets/')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    src = Path(args.hoja)
    if not src.exists():
        sys.exit(f'ERROR: no encuentro {src}')
    im = Image.open(src)
    if args.region:
        f = [float(v) for v in args.region.split(',')]
        if len(f) != 4:
            sys.exit('ERROR: --region necesita x,y,x2,y2')
        if max(f) <= 1:                       # fracciones
            f = [f[0] * im.width, f[1] * im.height, f[2] * im.width, f[3] * im.height]
        im = im.crop(tuple(int(v) for v in f))
        print(f'region -> {im.width}x{im.height}')
    n = len(args.ids)
    ancho = im.width / n

    prop = (im.width / n) / im.height
    if prop < 0.8:
        print(f'AVISO: cada celda mide {im.width // n}x{im.height} — es VERTICAL, no cuadrada.\n'
              f'       La hoja salio de cuerpo entero. Se rescata el busto con --anclaje top\n'
              f'       (lo que estas usando), pero conviene regenerarla con el encuadre bien.\n')

    DESTINO.mkdir(parents=True, exist_ok=True)
    hechas = []
    print(f'{src.name} · {n} celdas · {im.width}x{im.height}\n')
    for i, cid in enumerate(args.ids):
        celda = im.crop((round(i * ancho), 0, round((i + 1) * ancho), im.height))
        fondo = fondo_de(celda)
        celda = limpiar_borde(celda, args.borde)
        celda = sacar_orla(celda, args.tol, fondo)
        celda = cuadrar(celda, args.anclaje)
        out = DESTINO / f'{cid}.png'
        if args.dry_run:
            print(f'  {cid:24s} {celda.width}x{celda.height} -> {LADO}x{LADO}  (no escrito)')
            continue
        chico = celda.resize((LADO, LADO), Image.LANCZOS)
        if args.preview:
            hechas.append(chico)
            print(f'  {cid:24s} (preview)')
            continue
        chico.save(out)
        print(f'  {cid:24s} -> assets/portraits/{cid}.png  {LADO}x{LADO}')

    if args.preview and hechas:
        # tira de control sobre damero, que es la unica forma de VER si quedo halo
        tira = Image.new('RGBA', (LADO * len(hechas), LADO))
        for i, c in enumerate(hechas):
            for y in range(0, LADO, 12):
                for x in range(0, LADO, 12):
                    if (x // 12 + y // 12) % 2:
                        tira.paste((70, 70, 78, 255), (i * LADO + x, y, i * LADO + x + 12, y + 12))
            tira.alpha_composite(c, (i * LADO, 0))
        pv = src.with_name(src.stem + '_preview.png')
        tira.save(pv)
        print(f'\npreview -> {pv}  (nada escrito en assets/)')
    elif not args.dry_run:
        print(f'\n{n} retratos. La lamina original quedo intacta en {src}.')


if __name__ == '__main__':
    main()
