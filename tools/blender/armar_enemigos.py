# EL HORNO DE BLENDER -> EL JUEGO, LAS HOJAS DE ENEMIGOS (fase 2, 3/10/2026: los aviones enemigos).
# Arma, con los cuadros que horneo tools/blender/hornear_hoja.py, las hojas que el juego usa — en las
# MISMAS rutas (assets/world/enemies/<hoja>.png) y con el MISMO layout — y mide sus cajas.
#
#   .venv-art/bin/python3 tools/blender/armar_enemigos.py [hoja...]     (por defecto: todas las de hojas.py)
#   ...  --lamina out/fase2.png     ademas, una lamina HOY contra BLENDER
#
# Todo con EL CONTORNO DE PIXEL de los aviones (armar_hoja.py).
#
# NO SE TIRA NADA: la primera vez que se arma una hoja, la de three.js se MUEVE (git mv) a
# assets/world/enemies/three/ y su caja se guarda en src/data/cajas_three.js. El juego vuelve a eso
# con `?horno=three` (data/horno.js; PRUEBAS > EL HORNO). tools/bake_enemies_run.js, el horno viejo,
# sabe que hojas son de Blender (las de cajas_three.js) y las escribe ahi.
#
# LAS CAJAS: las de Blender reemplazan a las de three en assets/world/enemies/cajas.json y
# src/data/cajas.js, que siguen siendo UNA tabla (la que mide `npm run unit`).
import json, os, re, subprocess, sys
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
sys.path.insert(0, AQUI)
import armar_hoja as A
from hojas import HOJAS

OUT = os.path.join(AQUI, 'out', 'hojas')
ENEM = os.path.join(RAIZ, 'assets', 'world', 'enemies')
CAJAS_JSON = os.path.join(ENEM, 'cajas.json')
CAJAS_JS = os.path.join(RAIZ, 'src', 'data', 'cajas.js')
CAJAS_THREE = os.path.join(RAIZ, 'src', 'data', 'cajas_three.js')

def arg(n, d=None):
    return sys.argv[sys.argv.index(n) + 1] if n in sys.argv else d

def hoja(k):
    S = HOJAS[k]; fw, fh, cols = S['fw'], S['fh'], S['cols']
    n = len(S['frames']); filas = (n + cols - 1) // cols
    h = Image.new('RGBA', (fw * cols, fh * filas), (0, 0, 0, 0))
    for i in range(n):
        h.paste(Image.open(os.path.join(OUT, k, 'f_%d.png' % i)).convert('RGBA'), ((i % cols) * fw, (i // cols) * fh))
    A.FW, A.FH = fw, fh
    # `contorno=False` (la municion): a 16-32 px el cuerpo de un misil mide 1-2 px y es TODO borde —
    # el contorno lo oscurecia entero y el misil blanco salia gris
    return A.contorno(h, lineas=True) if S.get('contorno', True) else h

def medir(h, fw, fh):
    """BAKE.medir de tools/bake_common.js: la caja del contenido en la UNION de las poses."""
    px = h.load(); W, Hh = h.size
    x0 = y0 = 10 ** 9; x1 = y1 = -1
    for y in range(Hh):
        for x in range(W):
            if px[x, y][3] < 8: continue
            lx, ly = x % fw, y % fh
            x0, x1, y0, y1 = min(x0, lx), max(x1, lx), min(y0, ly), max(y1, ly)
    return dict(fw=fw, fh=fh, cols=round(W / fw), rows=round(Hh / fh),
                box=dict(x0=x0, y0=y0, x1=x1, y1=y1), margen=min(x0, y0, fw - 1 - x1, fh - 1 - y1))

def num(v):
    return int(v) if float(v).is_integer() else v

def linea_js(k, c):
    pts = (', puntos: [%s]' % ', '.join('[%s, %s]' % (num(p[0]), num(p[1])) for p in c['puntos'])) if c.get('puntos') else ''
    b = c['box']
    return ('  %s: { fw: %d, fh: %d, cols: %d, rows: %d, box: { x0: %d, y0: %d, x1: %d, y1: %d }, margen: %d%s },'
            % (k, c['fw'], c['fh'], c['cols'], c['rows'], b['x0'], b['y0'], b['x1'], b['y1'], c['margen'], pts))

def escribir_cajas(cajas):
    """El JSON y el modulo, como los escribe tools/bake_enemies_run.js (misma forma, mismo orden)."""
    limpio = {k: {kk: ([[num(a), num(b)] for a, b in vv] if kk == 'puntos' else vv) for kk, vv in cajas[k].items()} for k in cajas}
    open(CAJAS_JSON, 'w').write(json.dumps(limpio, indent=2, ensure_ascii=False) + '\n')
    src = open(CAJAS_JS).read()
    cabecera = src[:src.index('export const CAJAS = {')]
    cuerpo = '\n'.join(linea_js(k, limpio[k]) for k in sorted(limpio))
    open(CAJAS_JS, 'w').write(cabecera + 'export const CAJAS = {\n' + cuerpo + '\n};\n')

def destino(k):
    """Donde vive la hoja en el juego, y donde queda la de three.js. Las de enemigos van en
    assets/world/enemies/; las que declaran `destino` (las partes, la municion), ahi."""
    d = HOJAS[k].get('destino')
    nueva = os.path.join(RAIZ, d) if d else os.path.join(ENEM, k + '.png')
    return nueva, os.path.join(os.path.dirname(nueva), 'three', os.path.basename(nueva))

def archivar(claves, cajas):
    """La PRIMERA vez de cada hoja: la de three.js a three/ (git mv) y su caja a cajas_three.js."""
    tres = os.path.join(ENEM, 'three')
    os.makedirs(tres, exist_ok=True)
    viejas = leer_three()
    for k in claves:
        if not HOJAS[k].get('cajas', True):
            # sin caja: la marca de "ya archivada" es que exista la de three
            nueva, vieja = destino(k)
            if not os.path.exists(vieja) and subprocess.run(['git', 'ls-files', '--error-unmatch', nueva], cwd=RAIZ, capture_output=True).returncode == 0:
                os.makedirs(os.path.dirname(vieja), exist_ok=True)
                subprocess.run(['git', 'mv', nueva, vieja], cwd=RAIZ, check=True)
                print('archivado en three/:', k)
            continue
        if k in viejas: continue
        subprocess.run(['git', 'mv', os.path.join(ENEM, k + '.png'), os.path.join(tres, k + '.png')], cwd=RAIZ, check=True)
        viejas[k] = cajas[k]
        print('archivado en three/:', k)
    cuerpo = '\n'.join(linea_js(k, viejas[k]) for k in sorted(viejas))
    open(CAJAS_THREE, 'w').write(
        '// LAS CAJAS DEL HORNO DE THREE.JS de las hojas que hoy hornea Blender — GENERADO, NO EDITAR A MANO.\n'
        '// Las escriben tools/blender/armar_enemigos.py (la primera vez que Blender hornea una hoja) y\n'
        '// tools/bake_enemies_run.js (el horno viejo, que desde la fase 2 escribe esas hojas en\n'
        '// assets/world/enemies/three/). El juego las usa con `?horno=three` (data/horno.js).\n'
        'export const CAJAS_THREE = {\n' + cuerpo + '\n};\n')

def leer_three():
    if not os.path.exists(CAJAS_THREE): return {}
    out = {}
    for m in re.finditer(r'^  (\w+): \{ fw: (\d+), fh: (\d+), cols: (\d+), rows: (\d+), box: \{ x0: (\d+), y0: (\d+), x1: (\d+), y1: (\d+) \}, margen: (-?\d+)(?:, puntos: (\[.*\]))? \},$',
                         open(CAJAS_THREE).read(), re.M):
        g = m.groups()
        c = dict(fw=int(g[1]), fh=int(g[2]), cols=int(g[3]), rows=int(g[4]),
                 box=dict(x0=int(g[5]), y0=int(g[6]), x1=int(g[7]), y1=int(g[8])), margen=int(g[9]))
        if g[10]: c['puntos'] = json.loads(g[10])
        out[g[0]] = c
    return out

if __name__ == '__main__':
    claves = [a for a in sys.argv[1:] if a in HOJAS] or list(HOJAS)
    cajas = json.load(open(CAJAS_JSON))
    archivar(claves, cajas)
    paneles = []
    for k in claves:
        S = HOJAS[k]
        h = hoja(k)
        nueva, vieja = destino(k)
        h.save(nueva)
        # (las hojas NUEVAS —el fuego, el humo— no tienen version de three.js con que comparar)
        if os.path.exists(vieja): paneles.append((k + ' — HOY (three.js)', Image.open(vieja).convert('RGBA')))
        paneles.append((k + ' — BLENDER', h))
        if not S.get('cajas', True):
            print('OK %s -> %s' % (k, os.path.relpath(nueva, RAIZ)))
            continue
        c = medir(h, S['fw'], S['fh'])
        p = json.load(open(os.path.join(OUT, k, 'puntos.json')))['puntos']
        if p: c['puntos'] = p
        cajas[k] = c
        aviso = '  ⚠ MARGEN %d px (el plan pide 2)' % c['margen'] if c['margen'] < 2 else ''
        print('OK %s: box %s · margen %d%s' % (k, c['box'], c['margen'], aviso))
    escribir_cajas(cajas)
    if arg('--lamina'):
        A.lamina(paneles, os.path.join(AQUI, arg('--lamina')), esc=int(arg('--esc', '2')))
        print('LAMINA', arg('--lamina'))
