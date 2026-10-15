# LA CABINA -> EL JUEGO (docs/sistemas/PLAN_PRIMERA_PERSONA.md). Arma lo que horneo hornear_cabina.py:
#
#   .venv-art/bin/python3 tools/blender/armar_cabina.py
#
# · assets/planes/cabina.png            la base (960x540), sin palanca ni acelerador
# · assets/planes/cabina_palanca.png    la palanca con la mano derecha, 3x3 poses (fila = cabeceo:
#                                       picar, centro, trepar; columna = lado: izq, centro, der)
# · assets/planes/cabina_acelerador.png el acelerador con la izquierda, 3 poses (freno, normal, turbo)
# · src/data/cabina_anclas.js           las anclas de los relojes y el recorte de cada capa
# Cada capa se recorta a la caja que ocupa en TODAS sus poses (asi no pesa un cuadro entero de aire).
import json, os
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
OUT = os.path.join(AQUI, 'out', 'cabina')
PLANES = os.path.join(RAIZ, 'assets', 'planes')
ESC = 2

def capa(nombres, cols, destino):
    ims = [Image.open(os.path.join(OUT, n)).convert('RGBA') for n in nombres]
    caja = None
    for im in ims:
        b = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        if b: caja = b if not caja else (min(caja[0], b[0]), min(caja[1], b[1]), max(caja[2], b[2]), max(caja[3], b[3]))
    w, h = caja[2] - caja[0], caja[3] - caja[1]
    filas = (len(ims) + cols - 1) // cols
    hoja = Image.new('RGBA', (w * cols, h * filas), (0, 0, 0, 0))
    for i, im in enumerate(ims):
        hoja.paste(im.crop(caja), ((i % cols) * w, (i // cols) * h))
    hoja.save(os.path.join(PLANES, destino))
    # en pixeles de MUNDO (480x270): donde va el recorte y cuanto mide cada cuadro
    return dict(x=caja[0] / ESC, y=caja[1] / ESC, w=w / ESC, h=h / ESC, fw=w, fh=h, cols=cols)

if __name__ == '__main__':
    Image.open(os.path.join(OUT, 'cabina.png')).save(os.path.join(PLANES, 'cabina.png'))
    capas = {
        'palanca': capa(['palanca_%d_%d.png' % (j, i) for j in range(3) for i in range(3)], 3, 'cabina_palanca.png'),
        'acelerador': capa(['acelerador_%d.png' % k for k in range(3)], 3, 'cabina_acelerador.png'),
    }
    anclas = json.load(open(os.path.join(OUT, 'anclas.json')))
    open(os.path.join(RAIZ, 'src', 'data', 'cabina_anclas.js'), 'w').write(
        "// LAS ANCLAS DE LA CABINA — GENERADO por tools/blender/armar_cabina.py, NO EDITAR A MANO.\n"
        "// En pixeles de mundo (480x270): [x, y, radio] de cada reloj del tablero, [x0, y0, x1, y1] del\n"
        "// recuadro del estante (`rack`) y [x, y] del colimador. La imagen es assets/planes/cabina.png.\n"
        "export const CABINA_ANCLAS = %s;\n\n"
        "// LAS CAPAS QUE SE MUEVEN (palanca y acelerador, con sus manos): donde va el recorte (x, y, w, h en\n"
        "// pixeles de mundo) y la grilla de poses de su hoja (fw x fh por cuadro, `cols` columnas).\n"
        "export const CABINA_CAPAS = %s;\n" % (json.dumps(anclas), json.dumps(capas)))
    print('OK', capas)
