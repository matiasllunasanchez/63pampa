# LAS HOJAS DE CERCA (23/11/2026, el autor: "como hago para que los aviones en el despegue que estan cerca se vean mejor?
# … y con fade se intercambien entre un sprite y otro"). La vista BASE (9 alabeos x 3 cabeceos) horneada al DOBLE (168
# en vez de 84): mismo modelo, misma camara y mismo encuadre que la de siempre, asi el juego puede fundir una con la otra
# segun el tamaño en pantalla (render/plane.js y render/squad.js, `hojaCerca`). Por ahora el A-4B, sus cinco pinturas y
# su tren.
#
#   python3 tools/blender/hornear_hd.py            hornea (Blender) y arma (PIL) — sheet_hd.png, skin_<x>_hd.png, tren_hd.png
#   python3 tools/blender/hornear_hd.py --armar    solo arma lo ya horneado
import os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'
PX = 168
CLAVES = ('sky', 'skin_tero', 'skin_puma', 'skin_gitano', 'skin_pichon', 'skin_vasco')
OUT = os.path.join('out', 'aviones_hd')
DEST = os.path.join(RAIZ, 'assets', 'planes', 'a4-skyhawk')
NOMBRE = {'sky': 'sheet_hd', **{k: k + '_hd' for k in CLAVES if k.startswith('skin_')}}

def trabajos():
    for k in CLAVES:
        yield (k, None)
        yield (k, 'sinsonda')          # la sonda va de un lado (ver hornear_todo.py SONDA_LATERAL)
    yield ('sky', 'tren')

def hornear(t):
    k, c = t
    out = os.path.join(OUT, k, 'base' if not c else 'base_sinsonda' if c == 'sinsonda' else 'capas/%s_base' % c)
    args = [BLENDER, '--background', '--factory-startup', '--python', 'hornear.py', '--', '--modelo', k, '--vista', 'base',
            '--out', out, '--px', str(PX)]
    if c == 'sinsonda': args += ['--sin-sonda']
    elif c: args += ['--capa', c]
    r = subprocess.run(args, cwd=AQUI, capture_output=True, text=True)
    return out, 'HORNEADO' in r.stdout, [l for l in (r.stdout + r.stderr).splitlines() if 'Error' in l or 'Traceback' in l][:3]

def armar():
    sys.path.insert(0, AQUI)
    import armar_juego as J
    for k in CLAVES:
        h = J.hoja(os.path.join(AQUI, OUT, k, 'base'), 3, PX, True)
        J.con_contorno(h, 3, PX).save(os.path.join(DEST, NOMBRE[k] + '.png'))
        print('->', NOMBRE[k] + '.png')
    t = J.hoja(os.path.join(AQUI, OUT, 'sky', 'capas', 'tren_base'), 3, PX, True)
    J.con_contorno(t, 3, PX).save(os.path.join(DEST, 'tren_hd.png'))
    print('-> tren_hd.png')

if __name__ == '__main__':
    if '--armar' not in sys.argv:
        t0 = time.time(); fallas = 0
        with ThreadPoolExecutor(max_workers=4) as ex:
            for out, ok, err in ex.map(hornear, list(trabajos())):
                if not ok: fallas += 1; print('FALLA', out, err)
        print('horneado en %.0f s, %d fallas' % (time.time() - t0, fallas))
        sys.exit(1 if fallas else 0)   # (armar va aparte, con el python que tiene PIL: .venv-art/bin/python3 … --armar)
    armar()
