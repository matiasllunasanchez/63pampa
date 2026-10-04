# HORNEA TODAS LAS HOJAS DE ENEMIGOS QUE HACE BLENDER (fase 2 del horno de Blender, 3/10/2026): las
# de tools/blender/hojas.py.
#
#   python3 tools/blender/hornear_hojas.py [hoja ...]        (sin hojas: todas)
#
# 1. Vuelca a JSON los modelos de three.js que van por el puente (`puente:` en hojas.py), con
#    tools/blender/exportar_run.js — asi un cambio en tools/models/*.js llega solo.
# 2. Hornea cada hoja (un Blender por hoja, varios a la vez) en tools/blender/out/hojas/<hoja>/.
# Despues, tools/blender/armar_enemigos.py las arma para el juego.
import os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
sys.path.insert(0, AQUI)
from hojas import HOJAS
BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'

# que catalogo de tools/models/ tiene cada modelo del puente
FAMILIA = {'modelHelo': 'enemies', 'modelHercules': 'enemies', 'modelJet': 'enemies',
           'seaKing': 'helos', 'wessex': 'helos', 'seaLynx': 'helos', 'gazelle': 'helos', 'scout': 'helos',
           'harrier': 'harrier', 'harrierRear': 'harrier',
           't42': 'buques', 't21': 'buques', 'log': 'buques', 'cv': 'buques', 'hundido': 'buques',
           'modelFragata': 'enemies', 'modelLcu': 'enemies'}

def puente(hojas):
    pedidos = set()
    for k in hojas:
        for fr in HOJAS[k]['frames']:
            tipo, nombre = fr['modelo'].split(':', 1)
            if tipo != 'puente': continue
            nom, *args = nombre.split('_')
            pedidos.add(':'.join([FAMILIA[nom], nom] + args))
    if pedidos:
        subprocess.run(['npx', 'electron', 'tools/blender/exportar_run.js'] + sorted(pedidos), cwd=RAIZ, check=True,
                       stdout=subprocess.DEVNULL)

def hornear(k):
    r = subprocess.run([BLENDER, '--background', '--factory-startup', '--python', 'hornear_hoja.py', '--', '--hoja', k],
                       cwd=AQUI, capture_output=True, text=True)
    return k, 'HORNEADO' in r.stdout, [l for l in (r.stdout + r.stderr).splitlines() if 'Error' in l or 'Traceback' in l][:3]

if __name__ == '__main__':
    hojas = [a for a in sys.argv[1:] if a in HOJAS] or list(HOJAS)
    t0 = time.time()
    puente(hojas)
    fallas = 0
    with ThreadPoolExecutor(max_workers=4) as ex:
        for k, ok, err in ex.map(hornear, hojas):
            if not ok: fallas += 1; print('FALLA', k, err)
    print('%d hojas, %d fallas, %.0f s' % (len(hojas), fallas, time.time() - t0))
    sys.exit(1 if fallas else 0)
