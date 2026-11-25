# LAS HOJAS DE CERCA (23/11/2026, el autor: "como hago para que los aviones en el despegue que estan cerca se vean mejor?
# … y con fade se intercambien entre un sprite y otro"). La vista BASE (9 alabeos x 3 cabeceos) horneada al DOBLE (168
# en vez de 84): mismo modelo, misma camara y mismo encuadre que la de siempre, asi el juego puede fundir una con la otra
# segun el tamaño en pantalla (render/plane.js y render/squad.js, `hojaCerca`). Por ahora el A-4B, sus cinco pinturas y
# su tren.
#
#
# …Y LA FINA (23/11, el autor: "no veo que los A-4 se vean mejor antes de despegar, de cerca"): volando nivelado —la
# pista, el despegue— el lider se dibuja con la hoja FINA (13 alabeos x 5 cabeceos, sheet5), no con la base; sin su
# version al doble la de cerca nunca entraba. Va igual: sheet5_hd.png, skin_<x>5_hd.png, tren5_hd.png.
# …Y TODOS LOS AVIONES (23/11, el autor: "hornear todas las variantes de aviones disponibles tal como armamos recien la de
# SKYHAWK"): cada jugable con su base, su fina, su tren (los helicopteros no tienen) y las cuatro variantes del escuadron
# de cada celula. Los que el juego ya dibuja al doble (`px` 2: Hercules, Neptune, Guarani, Chinook, Skyvan) van a 336.
#
#   python3 tools/blender/hornear_hd.py [clave ...]          hornea con Blender (sin claves: todas)
#   .venv-art/bin/python3 tools/blender/hornear_hd.py --armar [clave ...]   arma con PIL lo horneado
import os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'
OUT = os.path.join('out', 'aviones_hd')
# clave -> carpeta (la misma tabla que DESTINO en armar_juego.py)
CARPETA = {
    'sky': 'a4-skyhawk', 'a4q': 'a4q', 'dagger': 'iai-dagger', 'supere': 'super-etendard', 'pampa': 'pampa-63',
    'mirage': 'mirage-5p', 'herc': 'hercules-bombardero', 'learjet': 'learjet-35a', 'citation': 'cessna-citation',
    'merlin': 'swearingen-merlin', 'mu2': 'mitsubishi-mu2', 'aerostar': 'aerostar-601', 'commander': 'turbo-commander',
    'guarani': 'ia50-guarani', 'pucara': 'ia58-pucara', 'mb339': 'mb-339a', 'neptune': 'sp2h-neptune',
    'chinook_faa': 'ch47c-chinook-faa', 'chinook_ej': 'ch47c-chinook-ejercito', 'uh1h': 'uh-1h', 'bell212': 'bell-212',
    'puma_ej': 'sa330-puma-ejercito', 'puma_pna': 'sa330-puma-prefectura', 'a109': 'a109-hirundo',
    't34c': 't34c-turbo-mentor', 'skyvan': 'sc7-skyvan',
}
SKINS = ('skin_tero', 'skin_puma', 'skin_gitano', 'skin_pichon', 'skin_vasco')       # las pinturas de los Fieles (A-4B)
CELULAS = ('sky', 'a4q', 'dagger', 'supere', 'pampa', 'mirage')                       # las que tienen variantes
HELIS = ('chinook_faa', 'chinook_ej', 'uh1h', 'bell212', 'puma_ej', 'puma_pna', 'a109')   # sin tren
PX2 = ('herc', 'neptune', 'guarani', 'chinook_faa', 'chinook_ej', 'skyvan')
SONDA = ('sky', 'a4q')                                                                 # la sonda de un lado
px_de = lambda k: 336 if k in PX2 else 168
# (25/11) y LA HOJA 3, la del poder RASANTE (la camara a 45°): su cuadro ya es el doble del base, asi que la de cerca va
# al cuadruple (`px_vista`). Sin tren: el poder se vuela con las ruedas guardadas
VISTAS = (('base', 3, 9, ''), ('fino', 5, 13, '5'), ('ras', 5, 25, '3'))
px_vista = lambda k, v: px_de(k) * (2 if v == 'ras' else 1)
# `--solo ras` hornea / arma una sola vista (las otras ya estan)
SOLO = sys.argv[sys.argv.index('--solo') + 1] if '--solo' in sys.argv else None
vistas = lambda: [x for x in VISTAS if not SOLO or x[0] == SOLO]

def claves_de(k):
    """(clave de Blender, carpeta, nombre base de la hoja) de todo lo que cuelga de la celula `k`."""
    out = [(k, CARPETA[k], 'sheet')]
    if k == 'sky': out += [(s, 'a4-skyhawk', s) for s in SKINS]
    return out

def trabajos(celulas):
    for v, _, _, _ in vistas():
        for k in celulas:
            for b, _, _ in claves_de(k):
                yield (b, None, v, px_vista(k, v))
                if k in SONDA and v != 'ras': yield (b, 'sinsonda', v, px_vista(k, v))
            if k not in HELIS and v != 'ras': yield (k, 'tren', v, px_vista(k, v))
    for k in celulas:
        if k in CELULAS and not SOLO:
            for n in range(1, 5): yield ('var_%s_%d' % (k, n), None, 'base', px_de(k))

def hornear(t):
    k, c, v, px = t
    out = os.path.join(OUT, k, v if not c else v + '_sinsonda' if c == 'sinsonda' else 'capas/%s_%s' % (c, v))
    args = [BLENDER, '--background', '--factory-startup', '--python', 'hornear.py', '--', '--modelo', k, '--vista', v,
            '--out', out, '--px', str(px)]
    if c == 'sinsonda': args += ['--sin-sonda']
    elif c: args += ['--capa', c]
    r = subprocess.run(args, cwd=AQUI, capture_output=True, text=True)
    return out, 'HORNEADO' in r.stdout, [l for l in (r.stdout + r.stderr).splitlines() if 'Error' in l or 'Traceback' in l][:3]

def armar(celulas):
    sys.path.insert(0, AQUI)
    import armar_juego as J
    def una(src, filas, px, cols, dest, sim=True):
        if not os.path.isdir(src): return
        J.con_contorno(J.hoja(src, filas, px, sim, cols), filas, px).save(dest)
        print('->', os.path.relpath(dest, RAIZ))
    for k in celulas:
        px = px_de(k)
        for v, filas, cols, suf in vistas():
            for b, carpeta, nombre in claves_de(k):
                # (la de 45° NO se espeja: vista de costado, el avion no es simetrico en el cuadro)
                una(os.path.join(AQUI, OUT, b, v), filas, px_vista(k, v), cols, os.path.join(RAIZ, 'assets', 'planes', carpeta, nombre + suf + '_hd.png'), v != 'ras')
            if k not in HELIS:
                una(os.path.join(AQUI, OUT, k, 'capas', 'tren_' + v), filas, px, cols, os.path.join(RAIZ, 'assets', 'planes', CARPETA[k], 'tren' + suf + '_hd.png'))
        if k in CELULAS and not SOLO:
            for n in range(1, 5):
                una(os.path.join(AQUI, OUT, 'var_%s_%d' % (k, n), 'base'), 3, px, 9, os.path.join(RAIZ, 'assets', 'planes', CARPETA[k], 'variante%d_hd.png' % n))

if __name__ == '__main__':
    pedidas = [a for a in sys.argv[1:] if not a.startswith('--') and a != SOLO] or list(CARPETA)
    if '--armar' not in sys.argv:
        t0 = time.time(); fallas = 0; lista = list(trabajos(pedidas))
        with ThreadPoolExecutor(max_workers=4) as ex:
            for out, ok, err in ex.map(hornear, lista):
                if not ok: fallas += 1; print('FALLA', out, err)
        print('%d horneadas en %.0f s, %d fallas' % (len(lista), time.time() - t0, fallas))
        sys.exit(1 if fallas else 0)   # (armar va aparte, con el python que tiene PIL: .venv-art/bin/python3 … --armar)
    armar(pedidas)
