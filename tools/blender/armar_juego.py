# EL HORNO DE BLENDER -> EL JUEGO (fase 1, 3/10/2026: los aviones). Arma, con lo que horneo
# tools/blender/hornear_todo.py, las hojas que el juego usa — en las MISMAS rutas y con el MISMO
# layout de siempre — y su tabla de anclas.
#
#   .venv-art/bin/python3 tools/blender/armar_juego.py
#
# Escribe, por avion (assets/planes/<carpeta>/): sheet.png, sheet2.png, sheet3.png y las doce capas
# de carga (carga_<capa>{,2,3}.png); las skins de los Fieles van en a4-skyhawk/skin_<nombre>{,2,3}.png.
# Todo con EL CONTORNO DE PIXEL (armar_hoja.py: el borde se oscurece con su propio color).
#
# NO SE TIRA NADA: la primera vez, lo que habia horneado three.js se MUEVE (git mv) a
# assets/planes/<carpeta>/three/, y src/data/anclas_horno.js se guarda como anclas_three.js. El juego
# vuelve a eso con `?horno=three` (data/horno.js; PRUEBAS > EL HORNO).
#
# LAS ANCLAS se miden sobre el A-4 (`sky`), como siempre (la tabla es una sola para el roster): las
# puntas de ala salen del MODELO (hornear.py las proyecta), la tobera del naranja del escape, la
# caja y el perfil del alfa — el mismo metodo que anclasDe() de tools/bake_planes.html.
import json, os, subprocess, sys
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
sys.path.insert(0, AQUI)
import armar_hoja as A

OUT = os.path.join(AQUI, 'out', 'aviones')
PLANES = os.path.join(RAIZ, 'assets', 'planes')
# clave -> (carpeta, nombre base de la hoja). La misma tabla que SLUG en tools/bake_planes_run.js.
DESTINO = {
    'sky': ('a4-skyhawk', 'sheet'), 'dagger': ('iai-dagger', 'sheet'), 'supere': ('super-etendard', 'sheet'),
    'a4q': ('a4q', 'sheet'), 'pampa': ('pampa-63', 'sheet'), 'mirage': ('mirage-5p', 'sheet'),
    'skin_tero': ('a4-skyhawk', 'skin_tero'), 'skin_puma': ('a4-skyhawk', 'skin_puma'),
    'skin_gitano': ('a4-skyhawk', 'skin_gitano'), 'skin_vasco': ('a4-skyhawk', 'skin_vasco'),
    'skin_pichon': ('a4-skyhawk', 'skin_pichon'),
}
CELULAS = ('sky', 'a4q', 'dagger', 'supere', 'pampa', 'mirage')
CAPAS = ('tanques_ala', 'bombas_ala', 'tanque_centro', 'bomba_centro')
VISTAS = {  # vista -> (filas, lado del cuadro, sufijo, simetrizar)
    'base': (3, 84, '', True), 'empinada': (2, 84, '2', True), 'ras': (3, 168, '3', False),
    # LA COBRA (4/10): 40/75/100° de cabeceo, cuadro de 126 (x1,5: vertical, el avion mide su largo);
    # desde el MORTAL sigue la vuelta entera: 130…335° (once filas, ver hornear.py)
    'cobra': (12, 126, '4', True),   # + la fila 11: 25°, la del DERRAPE
}
# `VISTAS=cobra .venv-art/bin/python3 armar_juego.py`: arma SOLO esas vistas (las anclas de las otras
# se leen de lo que ya escribio la ultima armada completa — ver escribir_anclas)
if os.environ.get('VISTAS'): VISTAS = {k: v for k, v in VISTAS.items() if k in os.environ['VISTAS'].split(',')}

def hoja(carpeta, filas, fw, sim):
    A.FW, A.FILAS = fw, filas
    h = A.hoja(carpeta)
    return A.simetriza(h) if sim else h

def con_contorno(h, filas, fw):
    A.FW, A.FILAS = fw, filas
    return A.contorno(h.copy(), lineas=True)

# ---------------- no se tira nada: lo de three.js a three/ ----------------
def archivar_three():
    """La PRIMERA vez: mueve (git mv) cada hoja y capa horneada por three.js a <carpeta>/three/, y
    guarda las anclas de three como src/data/anclas_three.js. Despues no hace nada."""
    movidos = 0
    for carpeta in sorted(set(d for d, _ in DESTINO.values())):
        base = os.path.join(PLANES, carpeta)
        tres = os.path.join(base, 'three')
        if os.path.isdir(tres): continue
        os.makedirs(tres)
        for f in sorted(os.listdir(base)):
            if f.endswith('.png') and (f.startswith('sheet') or f.startswith('carga_') or f.startswith('skin_')):
                subprocess.run(['git', 'mv', os.path.join(base, f), os.path.join(tres, f)], cwd=RAIZ, check=True)
                movidos += 1
    vieja = os.path.join(RAIZ, 'src', 'data', 'anclas_three.js')
    if not os.path.exists(vieja):
        src = open(os.path.join(RAIZ, 'src', 'data', 'anclas_horno.js')).read()
        src = src.replace('export const HORNO = {', 'export const HORNO_THREE = {')
        open(vieja, 'w').write(
            '// LAS ANCLAS DEL HORNO DE THREE.JS — las de las hojas que el juego uso hasta el 3/10/2026, guardadas\n'
            '// para comparar (`?horno=three`, data/horno.js). Las de hoy son las de anclas_horno.js (Blender).\n' + src)
    if movidos: print('archivado en three/:', movidos, 'archivos')

# ---------------- las anclas (port de anclasDe, tools/bake_planes.html) ----------------
def anclas(h, fw, filas, tips):
    fh = fw
    px = h.load()
    a = lambda x, y: px[x, y][3] > 8
    tob, box = [], []
    f = lambda v: round(v, 3)
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
                    by0 = min(by0, y); by1 = max(by1, y)
                    if r > 190 and 90 < g < 190 and b < 90:
                        ox += x; oy += y; on += 1
            fo.append([f((ox / on - fw / 2) / fw), f((oy / on - fh / 2) / fh)] if on else None)
            fb.append([0, 0] if by1 < 0 else [f((by0 - fh / 2) / fh), f((by1 - fh / 2) / fh)])
        tob.append(fo); box.append(fb)
    cx, cy = 4 * fw, 1 * fh
    y0, y1 = 10 ** 9, -1
    for y in range(fh):
        for x in range(fw):
            if a(cx + x, cy + y): y0 = min(y0, y); y1 = max(y1, y)
    alto = 0 if y1 < 0 else round((y1 - y0 + 1) / fh, 4)
    perfil = []
    for m in range(13):
        xa, xb = m * fw // 13, (m + 1) * fw // 13
        lo, hi = 10 ** 9, -1
        for x in range(xa, xb):
            for y in range(fh):
                if a(cx + x, cy + y): lo = min(lo, y); hi = max(hi, y)
        perfil.append([0, 0] if hi < 0 else [round((lo - fh / 2) / fh, 3), round((hi - fh / 2) / fh, 3)])
    return dict(tips=tips, tob=tob, box=box, perfil=perfil, alto=alto)

def anclas_previas():
    """Las anclas que ya estan escritas, para armar solo algunas vistas sin perder las otras."""
    import re
    src = open(os.path.join(RAIZ, 'src', 'data', 'anclas_horno.js')).read()
    out = {}
    for vista in ('base', 'ras', 'cobra'):
        m = re.search(r'\n  %s: *\{ tips: (\[.*?\]), tob: (\[.*?\]), box: (\[.*?\]), perfil: (\[.*?\]), alto: ([0-9.]+) \},' % vista, src, re.S)
        if m:
            j = lambda t: json.loads(re.sub(r',\s*\]', ']', t))
            out[vista] = dict(tips=j(m.group(1)), tob=j(m.group(2)), box=j(m.group(3)), perfil=j(m.group(4)), alto=float(m.group(5)))
    return out

def escribir_anclas(B, R, C=None):
    js = lambda v: json.dumps(v, separators=(',', ':'))
    tabla = lambda t: '[\n' + ''.join('  ' + js(f) + ',\n' for f in t) + ']'
    linea = lambda M: '{ tips: %s, tob: %s, box: %s, perfil: %s, alto: %s }' % (tabla(M['tips']), tabla(M['tob']), tabla(M['box']), js(M['perfil']), M['alto'])
    open(os.path.join(RAIZ, 'src', 'data', 'anclas_horno.js'), 'w').write("""// ANCLAS DE LAS HOJAS DE AVIONES — GENERADO, NO EDITAR A MANO.
// Para retocar un valor a mano NO se toca este archivo: se pone el ajuste en src/data/anclas.js,
// que es el que el juego importa y el unico que sobrevive a la proxima horneada.
// Lo escribe tools/blender/armar_juego.py (EL HORNO DE BLENDER, desde el 3/10/2026) midiendo las
// hojas del A-4 (`sky`): la tabla es UNA para todo el roster. Las del horno de three.js quedaron en
// anclas_three.js, para comparar con `?horno=three`.
//
//   tips[fila][columna] = [ix, iy, dx, dy]   las dos puntas de ala, en fraccion del frame y desde
//                                            su centro. SALEN DE LA GEOMETRIA: el vertice de |x|
//                                            maximo del modelo de Blender, proyectado con la camara.
//   perfil[13]          = [arriba, abajo]    la silueta opaca de la pose nivelada en 13 franjas a
//                                            lo ancho: el tope real de los parches.
//   tob[fila][columna]  = [x, y] | null      el centroide del naranja del escape: donde nace la
//                                            llama del turbo. `null` = en esta pose no se ve.
//   box[fila][columna]  = [arriba, abajo]    hasta donde llega el avion en vertical en esa pose.
//   alto                                     cuanto ocupa el avion en vertical en el frame nivelado.
export const HORNO = {
  base: %s,
  ras:  %s,%s
};
""" % (linea(B), linea(R), ('\n  cobra: %s,' % linea(C)) if C else ''))

if __name__ == '__main__':
    archivar_three()
    medidas = anclas_previas()
    for clave, (carpeta, base) in DESTINO.items():
        dest = os.path.join(PLANES, carpeta)
        for vista, (filas, fw, suf, sim) in VISTAS.items():
            h = hoja(os.path.join(OUT, clave, vista), filas, fw, sim)
            con_contorno(h, filas, fw).save(os.path.join(dest, '%s%s.png' % (base, suf)))
            if clave in CELULAS:
                for capa in CAPAS:
                    c = hoja(os.path.join(OUT, clave, 'capas', '%s_%s' % (capa, vista)), filas, fw, sim)
                    con_contorno(c, filas, fw).save(os.path.join(dest, 'carga_%s%s.png' % (capa, suf)))
            if clave == 'sky' and vista in ('base', 'ras', 'cobra'):
                tips = json.load(open(os.path.join(OUT, clave, vista, 'tips.json')))['tips']
                medidas[vista] = anclas(h, fw, filas, tips)
        print('OK', clave)
    escribir_anclas(medidas['base'], medidas['ras'], medidas.get('cobra'))
    print('ANCLAS -> src/data/anclas_horno.js  (base alto %s · ras alto %s)' % (medidas['base']['alto'], medidas['ras']['alto']))
