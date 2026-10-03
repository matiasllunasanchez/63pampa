# EXPERIMENTO BLENDER -> EL JUEGO: arma las hojas del A-4 nuevo con el layout EXACTO de las que el
# juego ya usa, y su tabla de anclas, para probarlo con el interruptor `?horno=blender` (PRUEBAS).
#
#   .venv-art/bin/python3 tools/blender/armar_juego.py
#
# Lee lo que horneo tools/blender/hornear.py (out/a4nuevo, out/a4nuevo_emp, out/a4nuevo_ras y
# out/capas/<capa>_<vista>) y escribe, SIN PISAR NADA de lo de hoy:
#   assets/planes/a4-skyhawk/blender/      sheet.png, sheet2.png, sheet3.png y las 12 capas de
#                                          carga — CON el contorno de pixel (armar_hoja.py)
#   assets/planes/a4-skyhawk/blender_sin/  lo mismo SIN contorno
#   src/data/anclas_blender.js             las anclas medidas sobre estas hojas (mismo formato que
#                                          anclas_horno.js): las puntas de ala salen del MODELO
#                                          (hornear.py las proyecta), el resto del alfa y del naranja
#                                          de la tobera, con el mismo metodo que bake_planes.html.
import json, os, sys
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
sys.path.insert(0, AQUI)
import armar_hoja as A

OUT = os.path.join(AQUI, 'out')
DESTINO = os.path.join(RAIZ, 'assets', 'planes', 'a4-skyhawk')
VISTAS = {  # vista -> (carpeta de cuadros, filas, lado del cuadro, sufijo de la hoja, simetrizar)
    'base': ('a4nuevo', 3, 84, '', True),
    'empinada': ('a4nuevo_emp', 2, 84, '2', True),
    'ras': ('a4nuevo_ras', 3, 168, '3', False),
}
CAPAS = ('tanques_ala', 'bombas_ala', 'tanque_centro', 'bomba_centro')

def hoja(carpeta, filas, fw, sim):
    A.FW, A.FILAS = fw, filas
    h = A.hoja(os.path.join(OUT, carpeta))
    return A.simetriza(h) if sim else h

def con_contorno(h, filas, fw):
    A.FW, A.FILAS = fw, filas
    return A.contorno(h.copy(), lineas=True)

# ---------------- las anclas (port de anclasDe, tools/bake_planes.html) ----------------
def anclas(h, fw, fh, filas, tips):
    px = h.load()
    W = h.size[0]
    a = lambda x, y: px[x, y][3] > 8
    tob, box = [], []
    for row in range(filas):
        fo, fb = [], []
        for col in range(9):
            x0, y0 = col * fw, row * fh
            ox = oy = on = 0
            by0, by1 = 10 ** 9, -1
            for y in range(fh):
                for x in range(fw):
                    r, g, b, al = px[x0 + x, y0 + y]
                    if al <= 8: continue
                    if y < by0: by0 = y
                    if y > by1: by1 = y
                    if r > 190 and 90 < g < 190 and b < 90:
                        ox += x; oy += y; on += 1
            f = lambda v: round(v, 3)
            fo.append([f((ox / on - fw / 2) / fw), f((oy / on - fh / 2) / fh)] if on else None)
            fb.append([0, 0] if by1 < 0 else [f((by0 - fh / 2) / fh), f((by1 - fh / 2) / fh)])
        tob.append(fo); box.append(fb)
    cx, cy = 4 * fw, 1 * fh
    y0, y1 = 10 ** 9, -1
    for y in range(fh):
        for x in range(fw):
            if a(cx + x, cy + y):
                y0 = min(y0, y); y1 = max(y1, y)
    alto = 0 if y1 < 0 else round((y1 - y0 + 1) / fh, 4)
    perfil = []
    for m in range(13):
        xa, xb = m * fw // 13, (m + 1) * fw // 13
        lo, hi = 10 ** 9, -1
        for x in range(xa, xb):
            for y in range(fh):
                if a(cx + x, cy + y):
                    lo = min(lo, y); hi = max(hi, y)
        perfil.append([0, 0] if hi < 0 else [round((lo - fh / 2) / fh, 3), round((hi - fh / 2) / fh, 3)])
    return dict(tips=tips, tob=tob, box=box, perfil=perfil, alto=alto)

def js(v):
    return json.dumps(v, separators=(',', ':')).replace('null', 'null')

if __name__ == '__main__':
    for d in ('blender', 'blender_sin'):
        os.makedirs(os.path.join(DESTINO, d), exist_ok=True)
    medidas = {}
    for vista, (carpeta, filas, fw, suf, sim) in VISTAS.items():
        h = hoja(carpeta, filas, fw, sim)
        h.save(os.path.join(DESTINO, 'blender_sin', 'sheet%s.png' % suf))
        con_contorno(h, filas, fw).save(os.path.join(DESTINO, 'blender', 'sheet%s.png' % suf))
        for capa in CAPAS:
            c = hoja('capas/%s_%s' % (capa, vista), filas, fw, sim)
            c.save(os.path.join(DESTINO, 'blender_sin', 'carga_%s%s.png' % (capa, suf)))
            con_contorno(c, filas, fw).save(os.path.join(DESTINO, 'blender', 'carga_%s%s.png' % (capa, suf)))
        if vista in ('base', 'ras'):
            tips = json.load(open(os.path.join(OUT, carpeta, 'tips.json')))['tips']
            medidas[vista] = anclas(h, fw, fw, filas, tips)
        print('OK', vista)
    B, R = medidas['base'], medidas['ras']
    linea = lambda M: '{ tips: %s, tob: %s, box: %s, perfil: %s, alto: %s }' % (js(M['tips']), js(M['tob']), js(M['box']), js(M['perfil']), M['alto'])
    open(os.path.join(RAIZ, 'src', 'data', 'anclas_blender.js'), 'w').write(
        """// ANCLAS DEL A-4 HORNEADO EN BLENDER — GENERADO, NO EDITAR A MANO (experimento 3/10/2026).
// Lo escribe tools/blender/armar_juego.py midiendo las hojas de assets/planes/a4-skyhawk/blender*/,
// con el MISMO formato y el MISMO metodo que src/data/anclas_horno.js (ver alli que es cada campo).
// Solo se usa con el interruptor `?horno=blender` (data/horno.js); sin el, el juego no lo lee.
export const HORNO_BLENDER = {
  base: %s,
  ras:  %s,
};
""" % (linea(B), linea(R)))
    print('ANCLAS -> src/data/anclas_blender.js  (base alto %s · ras alto %s)' % (B['alto'], R['alto']))
