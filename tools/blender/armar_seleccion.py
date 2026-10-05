# LAS ILUSTRACIONES DEL SELECTOR DE AVION, desde el horno de Blender (4/10/2026, pedido del autor: "los
# aviones PNG del selector en por la patria, armar nuevos segun lo hecho en Blender, uno para cada
# variante"). Antes eran dibujos de 977 px que el menu achicaba suavizando.
#
#   for k in sky dagger supere a4q mirage pampa; do Blender --background --factory-startup --python \
#     tools/blender/hornear.py -- --modelo $k --vista seleccion --out out/aviones/$k/seleccion; done
#   .venv-art/bin/python3 tools/blender/armar_seleccion.py
#
# Toma el cuadro de 130 px, le pone EL CONTORNO DE PIXEL de las hojas (armar_hoja.py), lo agranda x3 con
# vecino mas cercano (390 = el ancho real del menu: render/menus.js lo detecta y no suaviza) y recorta el
# alto a lo que ocupa el avion. Escribe assets/planes/<carpeta>/seleccion.png; los dibujos viejos
# (preview.*) quedan donde estaban.
import os, sys
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
sys.path.insert(0, AQUI)
import armar_hoja as A

CARPETA = {'sky': 'a4-skyhawk', 'dagger': 'iai-dagger', 'supere': 'super-etendard', 'a4q': 'a4q',
           'mirage': 'mirage-5p', 'pampa': 'pampa-63'}
X = 3          # 130 → 390
AIRE = 4       # px (antes de agrandar) de aire arriba y abajo del avion

for clave, carpeta in CARPETA.items():
    f = os.path.join(AQUI, 'out', 'aviones', clave, 'seleccion', 'f_0_0.png')
    if not os.path.exists(f):
        print('FALTA', clave); continue
    im = Image.open(f).convert('RGBA')
    A.FW, A.FILAS, A.FH = im.size[0], 1, im.size[1]
    im = A.contorno(im, lineas=True)
    x0, y0, x1, y1 = im.getbbox()
    im = im.crop((0, max(0, y0 - AIRE), im.size[0], min(im.size[1], y1 + AIRE)))
    im = im.resize((im.size[0] * X, im.size[1] * X), Image.NEAREST)
    out = os.path.join(RAIZ, 'assets', 'planes', carpeta, 'seleccion.png')
    im.save(out)
    print('OK', clave, im.size)
