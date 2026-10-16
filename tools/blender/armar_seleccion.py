# LAS ILUSTRACIONES DEL SELECTOR DE AVION, desde el horno de Blender (4/10/2026, pedido del autor: "los
# aviones PNG del selector en por la patria, armar nuevos segun lo hecho en Blender, uno para cada
# variante"). Antes eran dibujos de 977 px que el menu achicaba suavizando.
#
#   for k in sky dagger supere a4q mirage pampa; do Blender --background --factory-startup --python \
#     tools/blender/hornear.py -- --modelo $k --vista seleccion --out out/aviones/$k/seleccion; done
#   .venv-art/bin/python3 tools/blender/armar_seleccion.py
#
# Toma el cuadro de 195 px (antes 130), le pone EL CONTORNO DE PIXEL de las hojas (armar_hoja.py), lo agranda x2 con
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
           'mirage': 'mirage-5p', 'pampa': 'pampa-63', 'herc': 'hercules-bombardero',
           'learjet': 'learjet-35a', 'citation': 'cessna-citation', 'merlin': 'swearingen-merlin', 'mu2': 'mitsubishi-mu2',
           'aerostar': 'aerostar-601', 'commander': 'turbo-commander', 'guarani': 'ia50-guarani', 'pucara': 'ia58-pucara',
           'mb339': 'mb-339a', 'neptune': 'sp2h-neptune'}
X = 2          # 195 → 390 (14/10: de tres cuartos y al doble de detalle; antes 130 x3, de cola)
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
    x = 390 // im.size[0] or 1       # (el Hercules se hornea directo a 390: hornear.py --px 390)
    im = im.resize((im.size[0] * x, im.size[1] * x), Image.NEAREST)
    out = os.path.join(RAIZ, 'assets', 'planes', carpeta, 'seleccion.png')
    im.save(out)
    print('OK', clave, im.size)

# EL SELECTOR ANIMADO (16/10, ver hornear.py `sel_anim` / `sel_tonel`): las dos hojas, a 336 nativos (1:1 en
# el menu), cada cuadro con su contorno. Las dos se recortan al MISMO alto —la union de lo que ocupa el avion
# en todos los cuadros de las dos— para que el menu pase de una a la otra sin que el avion salte.
#   seleccion_anim.png   15 alabeos (-35..+35) x 5 cabeceos (+8..-8)
#   seleccion_tonel.png  24 cuadros de la vuelta entera, nivelado
HOJAS_ANIM = (('sel_anim', 'seleccion_anim', 15, 5), ('sel_tonel', 'seleccion_tonel', 24, 1))
for clave, carpeta in CARPETA.items():
    cuadros = {}
    for vista, _, cols, filas in HOJAS_ANIM:
        d = os.path.join(AQUI, 'out', 'aviones', clave, vista)
        if not os.path.isdir(d): break
        lista = []
        for r in range(filas):
            for c in range(cols):
                im = Image.open(os.path.join(d, 'f_%d_%d.png' % (r, c))).convert('RGBA')
                A.FW, A.FILAS, A.FH = im.size[0], 1, im.size[1]
                lista.append(A.contorno(im, lineas=True))
        cuadros[vista] = lista
    if len(cuadros) != len(HOJAS_ANIM):
        print('FALTA ANIM', clave); continue
    cajas = [im.getbbox() for l in cuadros.values() for im in l if im.getbbox()]
    y0 = max(0, min(b[1] for b in cajas) - AIRE * 2)
    y1 = max(b[3] for b in cajas) + AIRE * 2
    for vista, nombre, cols, filas in HOJAS_ANIM:
        lista = cuadros[vista]
        fw = lista[0].size[0]; fh = min(lista[0].size[1], y1) - y0
        hoja = Image.new('RGBA', (fw * cols, fh * filas), (0, 0, 0, 0))
        for i, im in enumerate(lista):
            hoja.paste(im.crop((0, y0, fw, y0 + fh)), ((i % cols) * fw, (i // cols) * fh))
        hoja.save(os.path.join(RAIZ, 'assets', 'planes', carpeta, nombre + '.png'), optimize=True)
        print('OK ANIM', clave, nombre, hoja.size)

# LA ILUSTRACION GRANDE de la pantalla del avion (seleccion_grande.png, la que dibuja render/menus.js a 1:1):
# horneada directo a su tamaño (hornear.py --vista seleccion --px 495, o 540 los grandes) en
# out/aviones/<clave>/seleccion_g/. Solo la arman los aviones de las misiones secundarias y el Pampa (16/10):
# las de los demas ya estan hechas.
GRANDES = ('learjet', 'citation', 'merlin', 'mu2', 'aerostar', 'commander', 'guarani', 'pucara', 'mb339', 'neptune', 'pampa')
for clave in GRANDES:
    f = os.path.join(AQUI, 'out', 'aviones', clave, 'seleccion_g', 'f_0_0.png')
    if not os.path.exists(f):
        print('FALTA GRANDE', clave); continue
    im = Image.open(f).convert('RGBA')
    A.FW, A.FILAS, A.FH = im.size[0], 1, im.size[1]
    im = A.contorno(im, lineas=True)
    x0, y0, x1, y1 = im.getbbox()
    im = im.crop((0, max(0, y0 - AIRE * 2), im.size[0], min(im.size[1], y1 + AIRE * 2)))
    im.save(os.path.join(RAIZ, 'assets', 'planes', CARPETA[clave], 'seleccion_grande.png'))
    print('OK GRANDE', clave, im.size)
