# EXPERIMENTO BLENDER: arma la hoja (9 alabeos x 3 cabeceos de 84x84, el layout de sheet.png) con
# los cuadros que renderizo tools/blender/hornear.py, y una LAMINA DE COMPARACION contra la hoja
# que el juego usa hoy.
#
#   .venv-art/bin/python3 tools/blender/armar_hoja.py out/sky_cel [--contorno] [--actual a4-skyhawk]
#
# El CONTORNO es el de pixel art "selectivo": el pixel del borde de la silueta se OSCURECE con su
# propio color (no se pinta de negro) — lo que esta en luz queda con un filo de su tono y lo que
# esta en sombra se hunde. Ademas, con --lineas, una linea interior donde dos piezas se separan
# (el ala sobre el fuselaje): sale de la ALTURA del pixel (el alfa no la tiene), asi que la marca
# el cambio brusco de luminancia entre vecinos.
import os, sys
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
def arg(n, d=None):
    return sys.argv[sys.argv.index(n) + 1] if n in sys.argv else d

COLS, FILAS = 9, 3
FW = int(arg('--fw', '84'))          # 84 la hoja base, 168 la del poder RASANTE
FH = None                            # el alto del cuadro, si no es cuadrado (las hojas de enemigos)

def hoja(carpeta):
    s = Image.new('RGBA', (FW * COLS, FW * FILAS), (0, 0, 0, 0))
    for r in range(FILAS):
        for c in range(COLS):
            s.paste(Image.open(os.path.join(carpeta, 'f_%d_%d.png' % (r, c))).convert('RGBA'), (c * FW, r * FW))
    s.prof = hoja_z(carpeta)
    return s

def hoja_z(carpeta):
    """LA PROFUNDIDAD de la hoja (hornear.py, `f_<f>_<c>_z.png`: cerca = oscuro), o None si no se horneo."""
    if not os.path.exists(os.path.join(carpeta, 'f_0_0_z.png')): return None
    z = Image.new('L', (FW * COLS, FW * FILAS), 255)
    for r in range(FILAS):
        for c in range(COLS):
            z.paste(Image.open(os.path.join(carpeta, 'f_%d_%d_z.png' % (r, c))).convert('L'), (c * FW, r * FW))
    return z

def simetriza(s):
    """La columna nivelada, simetrica: la mitad derecha espejada sobre la izquierda (como el horno).
    La profundidad (`s.prof`), igual."""
    for im in (s, getattr(s, 'prof', None)):
        if im is None: continue
        px = im.load()
        for r in range(FILAS):
            x0, y0 = (COLS // 2) * FW, r * FW
            for y in range(FW):
                for x in range(FW // 2):
                    px[x0 + x, y0 + y] = px[x0 + FW - 1 - x, y0 + y]
    return s

def oscurecer(c, k):
    return (int(c[0] * k), int(c[1] * k), int(c[2] * k), 255)

# EL SALTO DE PROFUNDIDAD que hace linea (niveles de gris de la `_z`: 14 unidades en 255, ~0,05 por nivel):
# 6 niveles (de MAS sobre la pendiente) = 0,3 unidades, mas que el espesor de un ala y menos que lo que hay entre ala y fuselaje
SALTO_Z = 6

def contorno(s, lineas=False, prof=None):
    """EL CONTORNO DE PIXEL: el borde de la silueta se oscurece con su propio color; con `lineas`,
    tambien donde la luz salta entre dos piezas; y con `prof` (la profundidad horneada, 14/10) donde
    una pieza pasa POR DELANTE de otra aunque sean del mismo color — el ala delante del fuselaje
    banqueado: se marca el pixel de ADELANTE, como el borde de la silueta."""
    pz = prof.load() if prof is not None else None
    px = s.load(); W, H = s.size
    def salto(x, y, dx, dy):
        """Cuanto se aleja el vecino MAS de lo que ya venia alejandose la superficie: una superficie que
        se va de canto (el fuselaje visto de cola) cambia de profundidad de a poco y parejo — eso no es
        borde; una pieza por delante de otra es un escalon que la pendiente no explica."""
        if not op(x + dx, y + dy): return 0
        j = pz[x + dx, y + dy] - pz[x, y]
        prev = pz[x, y] - pz[x - dx, y - dy] if op(x - dx, y - dy) else 0
        return j - max(0, prev)
    fh = FH or FW
    orig = s.copy().load()
    op = lambda x, y: 0 <= x < W and 0 <= y < H and orig[x, y][3] > 8 and (x // FW == cx and y // fh == cy)
    lum = lambda c: 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]
    for y in range(H):
        for x in range(W):
            c = orig[x, y]
            if c[3] <= 8: continue
            global cx, cy
            cx, cy = x // FW, y // fh
            borde = not all(op(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if borde:
                px[x, y] = oscurecer(c, 0.45)[:3] + (c[3],)   # el alfa se respeta (el barrido del rotor)
            elif pz is not None and any(salto(x, y, dx, dy) > SALTO_Z for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                px[x, y] = oscurecer(c, 0.42)[:3] + (c[3],)
            elif lineas:
                # una linea INTERIOR donde la luz salta de golpe entre vecinos (dos piezas): se marca
                # el pixel MAS OSCURO del par, que es el que esta "detras"
                for dx, dy in ((1, 0), (0, 1)):
                    if not op(x + dx, y + dy): continue
                    v = orig[x + dx, y + dy]
                    if abs(lum(c) - lum(v)) > 70 and lum(c) < lum(v):
                        px[x, y] = oscurecer(c, 0.55)
    return s

def lamina(paneles, salida, esc=3):
    """Las hojas una debajo de la otra, ampliadas sin suavizar, sobre el gris del juego."""
    W = max(p.size[0] for _, p in paneles) * esc
    H = sum(p.size[1] * esc + 22 for _, p in paneles)
    out = Image.new('RGB', (W, H), (52, 64, 72))
    d = ImageDraw.Draw(out); y = 0
    for titulo, p in paneles:
        d.text((6, y + 5), titulo, fill=(232, 163, 61))
        out.paste(p.resize((p.size[0] * esc, p.size[1] * esc), Image.NEAREST), (0, y + 22), p.resize((p.size[0] * esc, p.size[1] * esc), Image.NEAREST))
        y += p.size[1] * esc + 22
    out.save(salida)

if __name__ == '__main__':
    carpeta = os.path.join(AQUI, sys.argv[1])
    s = simetriza(hoja(carpeta))
    s.save(os.path.join(carpeta, 'sheet.png'))
    paneles = []
    actual = arg('--actual')
    if actual:
        paneles.append(('HOY (three.js)', Image.open(os.path.join(RAIZ, 'assets/planes', actual, 'sheet.png')).convert('RGBA')))
    paneles.append(('BLENDER cel', s))
    if '--contorno' in sys.argv:
        c = contorno(s.copy(), lineas='--lineas' in sys.argv)
        c.save(os.path.join(carpeta, 'sheet_contorno.png'))
        paneles.append(('BLENDER cel + contorno', c))
    lamina(paneles, os.path.join(carpeta, 'lamina.png'))
    print('OK', carpeta)
