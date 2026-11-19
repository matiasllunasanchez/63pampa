# EXPORTA TODOS LOS AVIONES COMO MALLAS 3D (las islas reales, prototipo I0 — docs/proyecto/ANALISIS_ISLAS_REALES.md).
#
#   python3 tools/blender/exportar_mallas_todas.py [clave ... | cargas | aviones]        (sin claves: todas)
#
# Los mismos modelos de Blender del selector y de las hojas (modelos.py / modelos_aviones.py), uno por
# proceso de Blender en paralelo, con tools/blender/exportar_malla.py. Deja assets/mallas/<clave>.js.
#   · todos los aviones jugables de data/planes.js (cazas, los de las misiones sueltas, los helicopteros);
#   · LAS CUATRO VARIANTES DE NUMERAL de los cazas (var_<clave>_<n>, modelos.py `_variantes`): el compañero
#     que entra en el relevo vuela otra pintura, como en el pasillo (render/squad.js).
import os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.join(AQUI, '..', '..')
BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'
AVIONES = ['sky', 'dagger', 'supere', 'a4q', 'pampa', 'herc', 'mirage', 'pucara', 'mb339', 'neptune', 'learjet', 'citation',
           'merlin', 'mu2', 'aerostar', 'commander', 'guarani', 'chinook_faa', 'chinook_ej', 'uh1h', 'bell212', 'puma_ej',
           'puma_pna', 'a109', 't34c', 'skyvan']
CON_VARIANTES = ('sky', 'a4q', 'dagger', 'mirage', 'supere', 'pampa')
# LAS CAPAS DE CARGA, por celula (las mismas listas que tools/blender/hornear_todo.py): <clave>__<capa>.js
CAPAS = ('tanques_ala', 'bombas_ala', 'tanque_centro', 'bomba_centro')
CAPAS_EXTRA = {'dagger': ('bombas_ext',), 'supere': ('exocet', 'tanque_babor')}
CAPAS_SOLO = {'herc': ('herc_250', 'herc_500'), 'pucara': CAPAS, 'mb339': CAPAS}
CON_CARGA = CON_VARIANTES + ('herc', 'pucara', 'mb339')
capas_de = lambda k: CAPAS_SOLO.get(k, CAPAS + CAPAS_EXTRA.get(k, ()))
CARGAS = [k + '__' + c for k in CON_CARGA for c in capas_de(k)]
TODAS = AVIONES + ['var_%s_%d' % (c, n) for c in CON_VARIANTES for n in (1, 2, 3, 4)] + CARGAS
# los grandes y los helicopteros tienen mas piezas chicas: un poco mas de presupuesto para que no se deshagan
TRIS = {'herc': 9000, **{k: 3200 for k in ('neptune', 'chinook_faa', 'chinook_ej', 'puma_ej', 'puma_pna', 'skyvan')}}

def una(clave):
    out = os.path.join(RAIZ, 'assets', 'mallas', clave + '.js')
    modelo, capa = (clave.split('__') + [None])[:2]
    t0 = time.time()
    r = subprocess.run([BLENDER, '--background', '--factory-startup', '--python', os.path.join(AQUI, 'exportar_malla.py'), '--',
                        '--modelo', modelo, '--out', out, '--max-tris', str(600 if capa else TRIS.get(modelo, 2400))] + (['--capa', capa] if capa else []), capture_output=True, text=True)
    tris = [l for l in r.stdout.splitlines() if l.startswith('TRIANGULOS ')]
    ok = r.returncode == 0 and os.path.exists(out)
    return clave, ok, (tris[-1] if tris else ''), round(time.time() - t0), (r.stderr[-400:] if not ok else '')

if __name__ == '__main__':
    # `cargas`: solo las capas de carga; `aviones`: solo los aviones y sus variantes
    claves = CARGAS if sys.argv[1:] == ['cargas'] else [k for k in TODAS if k not in CARGAS] if sys.argv[1:] == ['aviones'] else sys.argv[1:] or TODAS
    os.makedirs(os.path.join(RAIZ, 'assets', 'mallas'), exist_ok=True)
    with ThreadPoolExecutor(max_workers=6) as ex:
        for clave, ok, tris, seg, err in ex.map(una, claves):
            print(('OK   ' if ok else 'FALLO'), clave.ljust(16), tris.ljust(18), str(seg) + ' s', err)
