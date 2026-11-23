# LAS LAMINAS DE CAPTURA (23/11/2026): el autor, para la tarjeta de EL INVINCIBLE: "explicar los roles… con capturas
# de UI o lo que sea para ser claro". Son capturas del juego real (Electron, 1280x900, la mision r5 volada con sondas:
# __libroVolar, __dist, __alto, la F sostenida y la Z) pasadas al MISMO fosforo que las laminas de Blender
# (armar_laminas.fosforo): los bordes de la captura son la linea y la luz es el relleno, a 480x270.
#
#   .venv-art/bin/python3 tools/blender/laminas_ui.py            # todas, desde tools/blender/out/laminas_ui/<captura>.png
#
# Cada lamina: (captura, recorte en px de la captura [x0, y0, x1, y1], 16:9).
import os, sys
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from armar_laminas import fosforo, reducir, ESC, W, H, SALIDA, AQUI

CAPTURAS = os.path.join(AQUI, 'out', 'laminas_ui')
K = 1.28   # las cajas se midieron en la captura vista a 2000 px de ancho; la captura es de 2560
# (23/11, el autor: "no es claro, mostrar la barra de objetivo nomas con la zona"): las tres del Super Etendard son UN
# SOLO ELEMENTO del HUD, agrandado y centrado en negro (`solo`), no la pantalla entera
LAMINAS = {
    'ui_busca':   ('su_busca',   [612, 6, 1190, 62], True),     # la BARRA DEL OBJETIVO con la zona azul (el radar)
    'ui_ubicado': ('su_ubicado', [855, 182, 1135, 282], True),  # BLANCO UBICADO: el nombre, los km y la flecha roja
    'ui_pulso':   ('su_pulso',   [612, 8, 1720, 410], True),    # el PULSO: el panel distancia/rumbo/potencia y las flechas
    'ui_escolta': ('a4_escolta', [500, 60, 1400, 566]),   # los A-4C a los costados del Exocet, rumbo al portaaviones
}

MARGEN = 0.88   # (solo) lo que ocupa el elemento de la lamina, como mucho, en cada eje

def armar(nombre, cap, caja, solo=False):
    x0, y0, x1, y1 = [round(v * K) for v in caja]
    c = Image.open(os.path.join(CAPTURAS, cap + '.png')).convert('RGB').crop((x0, y0, x1, y1))
    if solo:
        k = min(W * ESC * MARGEN / c.width, H * ESC * MARGEN / c.height)
        cw, ch = round(c.width * k), round(c.height * k)
        c = c.resize((cw, ch), Image.LANCZOS)
    else:
        c = c.resize((W * ESC, H * ESC), Image.LANCZOS)
    g = c.convert('L')
    rgb = np.asarray(c, np.float32) / 255
    # LO AZUL DEL HUD (la zona de busqueda en la cinta, el radar): en gris se perdia; sale lleno
    azul = np.clip((rgb[..., 2] - rgb[..., 0] - 0.12) * 4, 0, 1)
    a = np.asarray(g, np.float32) / 255
    # la LINEA: el borde (gradiente) de la captura, apretado para que el ruido del mar y la lluvia no la ensucien
    b = np.asarray(g.filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
    gx = np.zeros_like(b); gy = np.zeros_like(b)
    gx[:, 1:-1] = b[:, 2:] - b[:, :-2]; gy[1:-1, :] = b[2:, :] - b[:-2, :]
    borde = np.sqrt(gx * gx + gy * gy)
    linea = np.clip((borde - 0.035) * 9, 0, 1)
    # el RELLENO: la luz de la captura (el texto claro del HUD sale lleno, el cielo apenas)
    relleno = np.maximum(np.clip((a - 0.25) * 1.6, 0, 1), azul)
    if solo:
        relleno = np.maximum(np.clip((a - 0.55) * 2.2, 0, 1), azul)   # solo lo que brilla (el HUD), no las nubes de fondo
        # al centro de la lamina, en negro (el canto del recorte no dibuja linea: se procesa antes de pegarlo)
        L = np.zeros((H * ESC, W * ESC), np.float32); R = np.zeros_like(L)
        ox, oy = (W * ESC - c.width) // 2, (H * ESC - c.height) // 2
        linea[:2, :] = linea[-2:, :] = 0; linea[:, :2] = linea[:, -2:] = 0
        L[oy:oy + c.height, ox:ox + c.width] = linea; R[oy:oy + c.height, ox:ox + c.width] = relleno
        linea, relleno = L, R
    fosforo(reducir(linea), reducir(relleno), k_relleno=0.45, k_brillo=0.4, radio=2.5).save(os.path.join(SALIDA, nombre + '.png'))
    print('ok', nombre)

if __name__ == '__main__':
    pedidas = sys.argv[1:] or list(LAMINAS)
    for n in pedidas: armar(n, *LAMINAS[n])
