# LOS ICONOS FINOS DEL TABLERO (9/10/2026). Genera src/data/iconos_finos.js — no se edita a mano.
#
# El autor, con el reloj del cañon atornillado: "las balas y los iconos mejoralos en los indicadores
# base". Los iconos de los relojes eran de UN color a pixel de diseño (7x5); estos van en PIXELES REALES
# (un tercio del de diseño, 3x el detalle) y se dibujan COMO LAS BALAS DEL CAÑON (el autor, 9/10: "tenes
# que REDISEÑARLO como hiciste con las balas"): la luz viene de arriba —banda clara en la cara de arriba,
# sombra en la de abajo—, el borde es un tono oscuro del mismo color y no negro, y cada uno lleva sus
# detalles de construccion. Hubo antes un bisel automatico (luz arriba-izquierda, sombra abajo-derecha,
# borde negro) y "quedo feo": se leian como botones en relieve. Siguen en el color de cada reloj: el
# dibujo dice 'g', 'h', 's', 'o' y render/iconos.js pone los tonos del color que pase quien dibuja.
#
#   .venv-art/bin/python3 tools/iconos_finos.py            reescribe src/data/iconos_finos.js
#   .venv-art/bin/python3 tools/iconos_finos.py hoja.png   ademas, una hoja de prueba ampliada
#
# Para cambiar uno: se dibuja la FORMA (blanco = relleno) en su lienzo y se corre de nuevo. `extra` son
# huecos calados ('x', del color del fondo): la ventanita del surtidor, la cruz de la gota.
import os, sys
import numpy as np
from PIL import Image, ImageDraw

def lienzo(w, h):
    im = Image.new('L', (w, h), 0); return im, ImageDraw.Draw(im)

def terminar(forma, hueco=None, detalle=None, brillo=None, mats=()):
    """La forma (blanco = relleno) con la LUZ DE LAS BALAS: viene de ARRIBA, asi que el pixel de arriba
    de cada tramo vertical es luz ('h'), el de abajo sombra ('s') y el resto cuerpo ('g') — como la
    vaina, que es un cilindro acostado. El borde ('o') es un tono oscuro del mismo color, por los cuatro
    lados y sin esquinas (la esquina abierta redondea, como en la bala). `hueco` se cala ('x', el fondo),
    `detalle` son lineas de construccion en el tono del borde (el engarce de la bala) y `brillo` un
    reflejo puntual. `mats` = [(mascara, 'ABC')]: OTRO MATERIAL con sus tres letras (luz, cuerpo,
    sombra) — las aletas doradas y las fajas rojas de la bomba —; la luz sale de la forma entera."""
    def m(im):
        if im is None: return None
        a = np.zeros((im.size[1] + 2, im.size[0] + 2), bool); a[1:-1, 1:-1] = np.array(im) > 127; return a
    A, Hh, D, B = m(forma), m(hueco), m(detalle), m(brillo)
    M = [(m(mk), tri) for mk, tri in mats]
    lleno = A.copy()
    if Hh is not None: lleno &= ~Hh
    if D is not None: lleno &= ~D
    h, w = A.shape
    out = [['.'] * w for _ in range(h)]
    for j in range(h):
        for i in range(w):
            if A[j, i]:
                if Hh is not None and Hh[j, i]: out[j][i] = 'x'; continue
                if D is not None and D[j, i]: out[j][i] = 'o'; continue
                if B is not None and B[j, i]: out[j][i] = 'h'; continue
                arr = j == 0 or not lleno[j - 1, i]; aba = j == h - 1 or not lleno[j + 1, i]
                out[j][i] = 'g' if arr and aba else 'h' if arr else 's' if aba else 'g'
                for mk, tri in M:
                    if mk[j, i]: out[j][i] = tri['hgs'.index(out[j][i])]
            elif any(0 <= y < h and 0 <= x < w and A[y, x] for y, x in ((j - 1, i), (j + 1, i), (j, i - 1), (j, i + 1))):
                out[j][i] = 'o'
    return [''.join(r) for r in out]

I = {}
# VELOCIDAD: dos cheurones de barra (3 de grueso)
im, d = lienzo(17, 13)
for x0 in (0, 7):
    d.polygon([(x0, 0), (x0 + 3, 0), (x0 + 9, 6), (x0 + 3, 12), (x0, 12), (x0 + 6, 6)], fill=255)
I['vel'] = terminar(im)
# TURBO: los mismos, gruesos (5)
im, d = lienzo(19, 13)
for x0 in (0, 8):
    d.polygon([(x0, 0), (x0 + 5, 0), (x0 + 11, 6), (x0 + 5, 12), (x0, 12), (x0 + 6, 6)], fill=255)
I['turbo'] = terminar(im)
# MACH: la M de patas rectas, con la V clavada al medio
im, d = lienzo(15, 13)
d.rectangle([0, 0, 2, 12], fill=255); d.rectangle([12, 0, 14, 12], fill=255)
d.polygon([(2, 0), (4, 0), (7, 4), (10, 0), (12, 0), (12, 2), (8, 8), (6, 8), (2, 2)], fill=255)
I['mach'] = terminar(im)
# ALTITUD: la flecha que sube desde el NIVEL DEL MAR — una ola gruesa con su cresta iluminada
im, d = lienzo(19, 19)
d.polygon([(9, 0), (15, 6), (12, 6), (12, 10), (6, 10), (6, 6), (3, 6)], fill=255)
d.line([(k, 15.6 + 1.0 * np.sin(k / 18 * 2 * np.pi * 2)) for k in range(19)], fill=255, width=3)
I['alt'] = terminar(im)
# GAS: la palanca — la bocha con su reflejo, el vastago y la guia ranurada
im, d = lienzo(15, 19); det, dd = lienzo(15, 19); br, db = lienzo(15, 19)
d.ellipse([3, 0, 11, 7], fill=255)
d.rectangle([6, 7, 8, 13], fill=255)
d.rectangle([0, 13, 14, 18], fill=255)
dd.rectangle([3, 15, 11, 15], fill=255)                 # la ranura de la guia
db.rectangle([5, 2, 6, 2], fill=255)                     # el reflejo de la bocha
I['gas'] = terminar(im, detalle=det, brillo=br)
# NAFTA: el surtidor — cuerpo de techo redondo, el visor, la base, y la manguera con su pico
im, d = lienzo(19, 19); hu, dh = lienzo(19, 19); det, dd = lienzo(19, 19)
d.rounded_rectangle([0, 0, 10, 16], radius=2, fill=255)
d.rectangle([0, 16, 12, 18], fill=255)                   # la base, un poco mas ancha
d.rectangle([11, 3, 12, 4], fill=255)                    # la salida de la manguera
d.rectangle([13, 4, 14, 13], fill=255)                   # la manguera, bajando
d.rectangle([15, 3, 17, 5], fill=255)                    # el pico colgado arriba
dh.rectangle([2, 3, 8, 7], fill=255)                     # el visor
dd.rectangle([2, 10, 8, 10], fill=255)                   # la junta de la tapa
I['nafta'] = terminar(im, hueco=hu, detalle=det)
# CHANCHA: el Hercules de costado — cola alta, ala alta con su motor colgado, panza gorda, la cabina
im, d = lienzo(23, 13); hu, dh = lienzo(23, 13); det, dd = lienzo(23, 13)
d.polygon([(0, 0), (3, 0), (7, 6), (1, 6)], fill=255)    # la deriva, alta
d.polygon([(1, 6), (8, 5), (8, 10), (4, 8)], fill=255)   # la cola que sube (la rampa del Hercules)
d.rounded_rectangle([6, 5, 22, 11], radius=3, fill=255)  # el fuselaje, un cilindro como la vaina
d.rectangle([9, 2, 16, 3], fill=255)                     # el ala ALTA, despegada por su linea
d.rectangle([11, 4, 13, 4], fill=255)                    # el pilon del motor
dd.rectangle([9, 4, 10, 4], fill=255); dd.rectangle([14, 4, 16, 4], fill=255)   # la luz entre ala y fuselaje
dh.rectangle([19, 6, 20, 6], fill=255)                   # la cabina
I['chancha'] = terminar(im, hueco=hu, detalle=det)
# EMERGENCIA: la gota con la cruz calada y su reflejo
im, d = lienzo(13, 19); hu, dh = lienzo(13, 19); br, db = lienzo(13, 19)
d.polygon([(6, 0), (11, 9), (1, 9)], fill=255); d.ellipse([0, 6, 12, 18], fill=255)
dh.rectangle([5, 9, 7, 16], fill=255); dh.rectangle([3, 11, 9, 13], fill=255)
db.rectangle([3, 7, 3, 8], fill=255)
I['emergencia'] = terminar(im, hueco=hu, brillo=br)
# VIDA: la cruz
im, d = lienzo(16, 16)
d.rectangle([5, 0, 10, 15], fill=255); d.rectangle([0, 5, 15, 10], fill=255)
I['vida'] = terminar(im)
# ESCUDO: con la costura del medio
im, d = lienzo(13, 15); det, dd = lienzo(13, 15)
d.polygon([(0, 0), (12, 0), (12, 7), (6, 14), (0, 7)], fill=255)
dd.rectangle([6, 2, 6, 11], fill=255)
I['escudo'] = terminar(im, detalle=det)
# OLA: el NIVEL DEL MAR — dos crestas gruesas, la espuma arriba
im, d = lienzo(19, 7)
d.line([(k, 3 + 2 * np.sin(k / 18 * 2 * np.pi * 2 + np.pi / 2)) for k in range(19)], fill=255, width=3)
I['ola'] = terminar(im)

# ---- EL ESTANTE (lo que cuelga): 27x13 de forma, 29x15 con el borde = 10x5 de diseño, como antes ----
# TANQUE: el lanzable de costado — punta, cola con sus aletas y las dos costuras del cuerpo
im, d = lienzo(27, 13); det, dd = lienzo(27, 13)
# un CIGARRO: lo mas ancho adelante de la mitad, punta corta y cola larga que se afina
d.polygon([(26, 6), (24, 4), (20, 3), (10, 3), (4, 4), (1, 6), (4, 8), (10, 9), (20, 9), (24, 8)], fill=255)
d.polygon([(1, 1), (3, 1), (6, 4), (3, 4)], fill=255); d.polygon([(1, 11), (3, 11), (6, 8), (3, 8)], fill=255)   # aletas chicas
dd.rectangle([10, 4, 10, 8], fill=255); dd.rectangle([18, 4, 18, 8], fill=255)   # las costuras
I['tanque'] = terminar(im, detalle=det)
# BOMBA: aletas DORADAS, cuerpo crema, dos fajas ROJAS y la espoleta AMARILLA en la punta
im, d = lienzo(27, 13); ale, da = lienzo(27, 13); faj, df = lienzo(27, 13); esp, de = lienzo(27, 13); hu, dh = lienzo(27, 13)
d.rectangle([0, 0, 5, 12], fill=255)                                       # las aletas de CAJA, de costado
d.polygon([(5, 4), (8, 3), (8, 9), (5, 8)], fill=255)                      # el cono de cola
d.rounded_rectangle([7, 2, 22, 10], radius=3, fill=255)                    # el cuerpo
d.polygon([(20, 2), (24, 4), (26, 6), (24, 8), (20, 10)], fill=255)        # la ojiva
da.rectangle([0, 0, 5, 12], fill=255); da.polygon([(5, 4), (8, 3), (8, 9), (5, 8)], fill=255)
dh.rectangle([1, 2, 4, 4], fill=255); dh.rectangle([1, 8, 4, 10], fill=255)   # la caja es un marco: se ve a traves
df.rectangle([12, 2, 13, 10], fill=255); df.rectangle([16, 2, 17, 10], fill=255)
de.rectangle([24, 5, 26, 7], fill=255)
I['bomba'] = terminar(im, hueco=hu, mats=[(ale, 'ABC'), (faj, 'DEF'), (esp, 'JKL')])
# CHAFITAS: cuatro tiras de aluminio cruzadas, con el destello en la punta
im, d = lienzo(27, 13); br, db = lienzo(27, 13)
for x0 in (1, 8, 15, 22):
    d.line([(x0 - 1, 12), (x0 + 4, 0)], fill=255, width=2)
    db.rectangle([x0 + 3, 0, x0 + 4, 1], fill=255)
I['chapitas'] = terminar(im, brillo=br)

# los que tienen colores PROPIOS (y no el de quien dibuja): la bomba. En `mono` se dibujan igual con los
# tonos de un solo color (ver render/iconos.js).
PAL = {'bomba': {'o': '#3a2a14', 'h': '#fffaf0', 'g': '#efe3c6', 's': '#c4b28e',
                 'A': '#f2cf4a', 'B': '#e0a92e', 'C': '#a8781c', 'D': '#f0553a', 'E': '#d93a22', 'F': '#9e2414',
                 'J': '#fff2a0', 'K': '#f2cf4a', 'L': '#c9a020', 'x': '#0a0e11'}}

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js = ['// GENERADO por tools/iconos_finos.py — no editar a mano: se cambia la forma alla y se corre de nuevo.',
      '// Iconos de los relojes del tablero en PIXELES REALES (1/3 del de diseño). Letras, como las balas del',
      '// cañon: \'g\' el color del reloj, \'h\' su luz, \'s\' su sombra, \'o\' su borde, \'x\' un hueco. Los',
      '// dibuja render/iconos.js.',
      'export const ICONOS_FINOS = {']
for k, v in I.items():
    js.append('  ' + k + ': [')
    js += ["    '" + r + "'," for r in v]
    js.append('  ],')
js.append('};')
js.append('// los de colores propios (la bomba): letra → color. Las mayusculas son otros materiales.')
js.append('export const ICONOS_FINOS_PAL = {')
for k, v in PAL.items():
    js.append('  ' + k + ': { ' + ', '.join(c + ": '" + col + "'" for c, col in v.items()) + ' },')
js.append('};')
open(os.path.join(RAIZ, 'src', 'data', 'iconos_finos.js'), 'w').write('\n'.join(js) + '\n')
if len(sys.argv) < 2: sys.exit(0)
# hoja de prueba, en dos colores (el apagado de siempre y el acento)
cols = {'g': (138, 151, 158), 'h': (197, 205, 209), 's': (97, 106, 111), 'o': (52, 57, 60), 'x': (10, 14, 17),
        'A': (242, 207, 74), 'B': (224, 169, 46), 'C': (168, 120, 28), 'D': (240, 85, 58), 'E': (217, 58, 34), 'F': (158, 36, 20),
        'J': (255, 242, 160), 'K': (242, 207, 74), 'L': (201, 160, 32)}
S = 10
filas = list(I.items())
W = sum(len(v[0]) + 3 for _, v in filas)
H = max(len(v) for _, v in filas) + 2
hoja = Image.new('RGB', (W * S, H * S), (24, 30, 34))
x = 1
for n, v in filas:
    for j, r in enumerate(v):
        for i, c in enumerate(r):
            if c in cols: hoja.paste(cols[c], ((x + i) * S, (j + 1) * S, (x + i + 1) * S, (j + 2) * S))
    x += len(v[0]) + 3
hoja.save(sys.argv[1])
print({k: (len(v[0]), len(v)) for k, v in I.items()})
