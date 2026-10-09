# HORNEA TODOS LOS AVIONES con Blender (fase 1 del horno de Blender, 3/10/2026): las tres hojas de
# cada clave de tools/blender/modelos.py (FICHAS) y las doce capas de carga de cada CELULA.
#
#   python3 tools/blender/hornear_todo.py [clave ...]        (sin claves: todas)
#
# Deja los cuadros en tools/blender/out/aviones/<clave>/<vista>/ y las capas en
# .../<clave>/capas/<capa>_<vista>/. Despues, tools/blender/armar_juego.py los arma para el juego.
# Corre varios Blender a la vez (cada horneada es un proceso aparte, `--background`).
import os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'
VISTAS = ('base', 'empinada', 'ras', 'cobra')
# `VISTAS=cobra python3 hornear_todo.py`: hornea SOLO esas vistas (la cobra se sumo el 4/10 y no hacia
# falta rehornear las otras tres para estrenarla)
if os.environ.get('VISTAS'): VISTAS = tuple(os.environ['VISTAS'].split(','))
CAPAS = ('tanques_ala', 'bombas_ala', 'tanque_centro', 'bomba_centro')
CELULAS = ('sky', 'a4q', 'dagger', 'supere', 'pampa', 'mirage')   # las que llevan capas de carga
TODAS = CELULAS + ('skin_tero', 'skin_puma', 'skin_gitano', 'skin_pichon', 'skin_vasco')

# LA SONDA DE UN LADO (autor, 8/10: "el avion tiene DOS varas en la trompa y deberia tener UNA SOLA").
# El A-4 lleva la sonda de reabastecimiento a la DERECHA de la trompa, y las vistas que se simetrizan
# (armar_juego.py) la copiaban al otro lado. Esas claves se hornean ademas SIN sonda: se simetriza la
# version sin sonda y despues se le pega la sonda de la de verdad.
SONDA_LATERAL = lambda k: k in ('sky', 'a4q') or k.startswith(('skin_', 'var_sky_', 'var_a4q_'))
VISTAS_SIM = ('base', 'empinada', 'cobra')
SIN = 'sinsonda'

def trabajos(claves):
    for k in claves:
        for v in VISTAS:
            if k.startswith('var_') and v != 'base': continue      # las variantes: solo la base
            yield [k, v, None]
            if SONDA_LATERAL(k) and v in VISTAS_SIM: yield [k, v, SIN]
            if k in CELULAS:
                for c in CAPAS: yield [k, v, c]

def hornear(t):
    k, v, c = t
    out = ('out/aviones/%s/%s' % (k, v) if not c else 'out/aviones/%s/%s_%s' % (k, v, SIN) if c == SIN
           else 'out/aviones/%s/capas/%s_%s' % (k, c, v))
    args = [BLENDER, '--background', '--factory-startup', '--python', 'hornear.py', '--', '--modelo', k, '--vista', v, '--out', out]
    if c == SIN: args += ['--sin-sonda']
    elif c: args += ['--capa', c]
    r = subprocess.run(args, cwd=AQUI, capture_output=True, text=True)
    ok = 'HORNEADO' in r.stdout
    return (out, ok, [l for l in (r.stdout + r.stderr).splitlines() if 'Error' in l or 'Traceback' in l][:3])

if __name__ == '__main__':
    claves = [a for a in sys.argv[1:]] or list(TODAS)
    t0 = time.time(); lista = list(trabajos(claves)); fallas = 0
    with ThreadPoolExecutor(max_workers=4) as ex:
        for out, ok, err in ex.map(hornear, lista):
            if not ok: fallas += 1; print('FALLA', out, err)
    print('%d horneadas, %d fallas, %.0f s' % (len(lista), fallas, time.time() - t0))
    sys.exit(1 if fallas else 0)
