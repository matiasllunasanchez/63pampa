# LOS ESCUDOS DE LA FICHA DEL AVION (16/10/2026): de assets/source/ui/escudo_<id>.png (el original, del tamaño
# que sea) a assets/ui/escudo_<id>.png, el que dibuja render/menus.js a la izquierda del nombre del avion.
#   fenix   el Escuadron Fenix        faa   la Fuerza Aerea Argentina (las alas)        armada   la Armada
# Le saca el fondo (blanco o casi blanco, rellenando desde los bordes: el blanco de adentro queda), lo recorta
# y lo deja a ALTO px — 54 = 18 de diseño, el alto del nombre y la linea del avion, a 1:1.
#   .venv-art/bin/python3 tools/escudos.py [id ...]          (sin ids: los que esten)
import os, sys
from PIL import Image, ImageDraw

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
FUENTE, DESTINO = os.path.join(RAIZ, 'assets', 'source', 'ui'), os.path.join(RAIZ, 'assets', 'ui')
ALTO = 108
ANCHO_MAX = 192    # 64 de diseño
MARCA = (255, 0, 255, 255)

def sin_fondo(im):
    im = im.convert('RGBA'); W, H = im.size; px = im.load()
    for x, y in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (W // 2, 0), (W // 2, H - 1), (0, H // 2), (W - 1, H // 2)]:
        c = px[x, y]
        # el fondo: blanco (o casi), o el gris oscuro de una captura de pantalla
        if c[3] < 16 or sum(c[:3]) > 690 or sum(c[:3]) < 110: ImageDraw.floodfill(im, (x, y), MARCA, thresh=45)
    for y in range(H):
        for x in range(W):
            if px[x, y] == MARCA: px[x, y] = (0, 0, 0, 0)
    return im.crop(im.getbbox())

if __name__ == '__main__':
    ids = sys.argv[1:] or [f[7:-4] for f in os.listdir(FUENTE) if f.startswith('escudo_') and f.endswith('.png')]
    for i in ids:
        f = os.path.join(FUENTE, 'escudo_%s.png' % i)
        if not os.path.exists(f): print('FALTA', f); continue
        im = sin_fondo(Image.open(f))
        # (los anchos —las alas de la Fuerza Aerea— se topean en ANCHO_MAX: si no, empujan el nombre fuera de la ficha)
        k = min(ALTO / im.size[1], ANCHO_MAX / im.size[0])
        ch = im.resize((round(im.size[0] * k), round(im.size[1] * k)), Image.LANCZOS)
        ch.save(os.path.join(DESTINO, 'escudo_%s.png' % i))
        print('OK', i, ch.size)
