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
LAMINAS = {
    'ui_busca':   ('su_busca',   [250, 0, 1250, 562]),     # la zona azul de la cinta, el radar prendido, "el horizonte lo tapa"
    'ui_ubicado': ('su_ubicado', [250, 0, 1250, 562]),     # BLANCO UBICADO: la flecha roja con los km, y el Sea Dart que te pinta
    'ui_pulso':   ('su_pulso',   [600, 0, 1720, 630]),     # el PULSO del Exocet: distancia, rumbo, potencia
    'ui_escolta': ('a4_escolta', [500, 60, 1400, 566]),   # los A-4C a los costados del Exocet, rumbo al portaaviones
}

def armar(nombre, cap, caja):
    x0, y0, x1, y1 = [round(v * K) for v in caja]
    c = Image.open(os.path.join(CAPTURAS, cap + '.png')).convert('RGB').crop((x0, y0, x1, y1)).resize((W * ESC, H * ESC), Image.LANCZOS)
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
    fosforo(reducir(linea), reducir(relleno), k_relleno=0.45, k_brillo=0.4, radio=2.5).save(os.path.join(SALIDA, nombre + '.png'))
    print('ok', nombre)

if __name__ == '__main__':
    pedidas = sys.argv[1:] or list(LAMINAS)
    for n in pedidas: armar(n, *LAMINAS[n])
