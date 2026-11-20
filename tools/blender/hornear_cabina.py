# LA CABINA EN PRIMERA PERSONA — F2 del plan (docs/sistemas/PLAN_PRIMERA_PERSONA.md, 14/10/2026).
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
#       --python tools/blender/hornear_cabina.py -- [--out out/cabina]
#   .venv-art/bin/python3 tools/blender/armar_cabina.py      (la copia al juego con sus anclas)
#
# Una cabina GENERAL (el autor: "por ahora es una cabina general para todo"), modelada desde el ojo del
# piloto y horneada con LA MISMA PROYECCION DEL JUEGO: el ojo en el origen mirando a -z, foco F = 135 px
# sobre un cuadro de 480x270 y el horizonte en la fila HOR = 96 (render/ctx.js). Asi el morro, el
# parabrisas y el colimador caen exactamente donde el mundo los espera. Se hornea al doble (960x540), el
# buffer del juego.
#
# Sale una imagen con fondo transparente (lo que se ve del mundo) y un JSON con las ANCLAS: el centro y el
# radio, en pixeles de 480x270, de cada reloj del tablero — ahi el juego dibuja los relojes vivos de
# render/hud.js (F3), y del colimador (la mira).
import bpy, importlib.util, json, math, os, sys
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
def _cargar(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(AQUI, archivo))
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod

H = _cargar('horno_bl_cab', 'hornear.py')
M = _cargar('modelos_bl_cab', 'modelos.py')
B = _cargar('modelos_bl_buques_cab', 'modelos_buques.py')
caja, elipsoide, loft = M.caja, M.elipsoide, M.loft
bloque, pieza = B.bloque, B.pieza
hueso = _cargar('modelos_bl_tierra_cab', 'modelos_tierra.py').hueso
OUT = os.path.join(AQUI, H.arg('--out', 'out/cabina'))

# LA PROYECCION DEL JUEGO (render/ctx.js): W x H, foco F, horizonte HOR
W_J, H_J, F_J, HOR_J = 480, 270, 135, 96
ESC = 2

# LOS COLORES (la referencia del autor, 15/10: la cabina del A-4 de verdad): tablero gris metal con los
# relojes NEGROS hundidos y marcas blancas, la visera y las consolas negras, palanca gris con empuñadura
# negra y gatillo rojo, rotulos amarillos con franjas negras, piso azul gris gastado.
PANEL, VISERA, MARCO, CONSOLA = '#59636a', '#17191b', '#202426', '#1e2224'
BISEL, ESFERA, MARCA, METAL, GOMA = '#2b3033', '#0c0e0f', '#d9d8cc', '#8e969a', '#141617'
AMARILLO, ROJO, PISO, ACOLCHADO = '#d4ad33', '#b3281f', '#34434e', '#3a3f3c'

# LOS RELOJES: nombre -> (x, y, radio) sobre la cara del tablero (z = Z_TABLERO), en metros. Los VIVOS
# (los del HUD, que el juego dibuja encima) y los DECORATIVOS (esfera con marcas, horneados) — la "T"
# del A-4: fila de arriba chica a los lados del colimador, la del medio con el horizonte al centro y la
# de abajo.
Z_TABLERO = -0.50
RELOJES = {
    'velocidad': (-0.235, -0.270, 0.047), 'nafta': (-0.118, -0.270, 0.047), 'adi': (0.000, -0.268, 0.052),
    'altitud': (0.118, -0.270, 0.047), 'mach': (0.235, -0.270, 0.047),
    'salud': (-0.235, -0.385, 0.047), 'gas': (-0.118, -0.385, 0.047), 'canon': (0.000, -0.385, 0.047),
}
DECORATIVOS = [(-0.200, -0.170, 0.032), (0.120, -0.170, 0.032), (0.200, -0.170, 0.032),
               (0.118, -0.385, 0.047), (0.235, -0.385, 0.047)]
# …LA CHANCHA (el reloj del tanque de la Chancha) en la fila chica de arriba, y EL ESTANTE de la carga
# (tanques, bombas y chapitas: render/hud.js drawEstante) en un PANELITO PROPIO al costado derecho del
# tablero (el autor, 15/10: "las bombas y demas como parte del panel"; arriba al medio quedaba achatado).
# El recuadro tiene LA PROPORCION DEL ESTANTE (16 x 26 del HUD): se dibuja sin deformar.
RELOJES['chancha'] = (-0.120, -0.170, 0.032)
ESTANTE = (0.352, -0.305, 0.074, 0.120)          # centro x, centro y, ancho, alto  (0.088 / 0.143 = 16 / 26)

def cilindro_z(nombre, padre, mat, c, r, largo, seg=24):
    """Un cilindro con el eje en z (de cara al ojo): un bisel, una esfera."""
    return loft(nombre, [(c[2] - largo / 2, r, r, c[1]), (c[2] + largo / 2, r, r, c[1])], padre, mat, n=seg, expo=2.0,
                cerrar=(True, True), x0=c[0])

def tubo(nombre, padre, mat, pts, r):
    """Un caño por una lista de puntos (los arcos del canopy)."""
    from mathutils import Vector as V
    obs = []
    for a, b in zip(pts, pts[1:]):
        d = V(b) - V(a); largo = d.length
        o = caja(nombre, (0, 0, 0), (r * 2, r * 2, largo), padre, mat)
        o.location = (V(a) + V(b)) / 2
        o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = d.to_track_quat('Z', 'Y')
        obs.append(o)
    return obs

def marcas(raiz, mat, x, y, z, r, n=24):
    """Las marcas blancas de una esfera: rayitas radiales, las de cada cuarto mas largas."""
    for k in range(n):
        a = 2 * math.pi * k / n
        largo = r * (0.22 if k % 6 == 0 else 0.12)
        rr = r * 0.86 - largo / 2
        o = caja('marca', (0, 0, 0), (r * 0.05, largo, 0.002), raiz, mat)
        o.location = (x + math.sin(a) * rr, y + math.cos(a) * rr, z)
        o.rotation_euler = (0, 0, -a)

def reloj_hundido(raiz, m, x, y, r, vivo):
    """Un reloj REDONDO hundido en el tablero: el aro, la esfera negra y (si es decorativo) sus marcas y
    una aguja. Los vivos quedan con la esfera limpia: la aguja y las marcas las pone el juego."""
    cilindro_z('aro', raiz, m['bisel'], (x, y, Z_TABLERO + 0.003), r * 1.14, 0.006, seg=28)
    cilindro_z('esfera', raiz, m['esfera'], (x, y, Z_TABLERO + 0.0065), r, 0.002, seg=28)
    if not vivo:
        marcas(raiz, m['marca'], x, y, Z_TABLERO + 0.0085, r)
        o = caja('aguja', (0, 0, 0), (r * 0.06, r * 0.75, 0.002), raiz, m['marca'])
        a = (x * 37 + y * 11) % 6.28
        o.location = (x + math.sin(a) * r * 0.32, y + math.cos(a) * r * 0.32, Z_TABLERO + 0.009); o.rotation_euler = (0, 0, -a)

def franjas(raiz, m, c, w, h):
    """Un rotulo de EMERGENCIA: chapa amarilla con franjas negras en diagonal."""
    pieza('rotulo', raiz, m['amarillo'], (w, h, 0.004), c)
    n = int(w / (h * 0.9))
    for i in range(n):
        pieza('franja', raiz, m['visera'], (h * 0.28, h * 1.05, 0.005),
              (c[0] - w / 2 + (i + 0.5) * w / n, c[1], c[2] + 0.001), (0, 0, math.radians(35)))

def tecla(raiz, m, x, y, z):
    """Un interruptor de palanquita: la base negra y la punta clara."""
    cilindro_z('base_t', raiz, m['goma'], (x, y, z), 0.009, 0.006, seg=8)
    tubo('palanquita', raiz, m['metal'], [(x, y, z + 0.003), (x, y + 0.016, z + 0.012)], 0.0028)

# LAS MANOS (el autor, 15/10): guantes de cuero marron sobre la palanca y el acelerador, con la manga
# del mameluco verde oliva que se va hacia el piloto.
# …MAS REALES (20/11, el autor: "mejorar mucho mas las manos del piloto, mas reales, asi como los brazos"):
# cada dedo son TRES FALANGES que abrazan la empuñadura en arco (con los nudillos marcados y las yemas), el
# pulgar dos, la palma y el dorso con su volumen, el puño del guante acampanado con la correa, y el antebrazo
# con la manga: pliegues, el puño elastico y un parche.
GUANTE, GUANTE_SOMBRA, GUANTE_LUZ, MANGA, MANGA_SOMBRA, PUÑO = '#5a4331', '#47352a', '#6e543f', '#5d6040', '#4a4c33', '#3e3f2b'
from mathutils import Vector as _V

def _mezcla(a, b, t): return tuple(a[k] + (b[k] - a[k]) * t for k in range(3))

def dedo(raiz, mg, c, ea, e1, e2, s, desde, hasta, R, r0, largo_k=1.0, n=3):
    """Un dedo que abraza un eje: `c` el centro de la empuñadura, `ea` su eje (los dedos se apilan sobre el),
    `e1`/`e2` el plano del abrazo (0° = del lado de la palma, 90° = por delante), `s` donde cae sobre el eje.
    `n` falanges de `desde` a `hasta` (grados), cada una mas fina; una esfera en cada nudillo."""
    pts = []
    for i in range(n + 1):
        t = math.radians(desde + (hasta - desde) * (i / n) * largo_k)
        pts.append(tuple(c[k] + ea[k] * s + (math.cos(t) * e1[k] + math.sin(t) * e2[k]) * R for k in range(3)))
    for i in range(n):
        ra, rb = r0 * (1 - 0.12 * i), r0 * (1 - 0.12 * (i + 1))
        hueso('falange', raiz, mg['guante'] if i else mg['luz'], pts[i], pts[i + 1], ra, rb, seg=10)
        elipsoide('nudillo', pts[i], (ra * 1.08,) * 3, raiz, mg['luz'] if i == 0 else mg['guante'], seg=10, anillos=6)
    elipsoide('yema', pts[-1], (r0 * 0.78,) * 3, raiz, mg['sombra'], seg=10, anillos=6)
    return pts

def brazo(raiz, mg, muñeca, codo, r_m=0.033, r_c=0.052):
    """El puño del guante (acampanado, con su correa) y el antebrazo con la manga, sus pliegues y el puño elastico."""
    a = _mezcla(muñeca, codo, 0.14)
    hueso('guantelete', raiz, mg['guante'], muñeca, a, r_m, r_m * 1.32, seg=14)
    hueso('correa', raiz, mg['sombra'], _mezcla(muñeca, codo, 0.05), _mezcla(muñeca, codo, 0.08), r_m * 1.13, r_m * 1.17, seg=14)
    b = _mezcla(muñeca, codo, 0.17)
    hueso('elastico', raiz, mg['puño'], a, b, r_m * 1.36, r_m * 1.42, seg=14)
    hueso('manga', raiz, mg['manga'], b, codo, r_m * 1.42, r_c, seg=14)
    # los pliegues de la tela: anillos un poco mas gruesos, mas juntos cerca de la muñeca
    for t in (0.22, 0.29, 0.38, 0.50, 0.64):
        p0, p1 = _mezcla(muñeca, codo, t), _mezcla(muñeca, codo, t + 0.025)
        r = r_m * 1.42 + (r_c - r_m * 1.42) * t
        hueso('pliegue', raiz, mg['manga_s'], p0, p1, r * 1.06, r * 1.04, seg=14)
    # el parche del brazo (la bandera de la manga), del lado de afuera
    p = _mezcla(muñeca, codo, 0.56)
    elipsoide('parche', (p[0] + 0.0, p[1] + 0.045, p[2]), (0.018, 0.006, 0.022), raiz, mg['puño'], seg=10, anillos=6)

def manos(raiz, K, lado):
    mg = {n: K['mat_cel']('mano_' + n, c) for n, c in (('guante', GUANTE), ('sombra', GUANTE_SOMBRA), ('luz', GUANTE_LUZ),
                                                       ('manga', MANGA), ('manga_s', MANGA_SOMBRA), ('puño', PUÑO))}
    if lado == 'der': mano_der(raiz, mg)
    else: mano_izq(raiz, mg)

def mano_der(raiz, mg):
    # LA DERECHA en la palanca (empuñadura en (0, -0.40, -0.40), su eje casi vertical). Como la ve el piloto,
    # desde atras y arriba: el DORSO del lado de afuera (+x) mirando hacia atras, los dedos que salen de los
    # nudillos por delante y vuelven por el lado de adentro (las yemas se ven a la izquierda), y el PULGAR que
    # cruza por detras, arriba, sobre los dedos. La empuñadura casi no se ve: es una mano cerrada.
    c, ea, e1, e2 = (0.0, -0.40, -0.40), (0.0, 1.0, 0.0), (1.0, 0.0, 0.0), (0.0, 0.0, -1.0)
    for i, (sy, k) in enumerate(((0.026, 0.97), (0.006, 1.0), (-0.014, 0.97), (-0.032, 0.86))):
        dedo(raiz, mg, c, ea, e1, e2, sy - 0.006, -35, 235, 0.033, 0.0108 - 0.0008 * i, largo_k=k, n=4)
    # el DORSO (afuera y atras) y la base de la palma (la eminencia del pulgar) detras de la empuñadura
    elipsoide('dorso', (0.036, -0.402, -0.388), (0.024, 0.050, 0.034), raiz, mg['luz'], seg=18, anillos=12)
    elipsoide('palma', (0.016, -0.415, -0.370), (0.026, 0.038, 0.016), raiz, mg['guante'], seg=18, anillos=12)
    # el PULGAR, por detras y arriba, de derecha a izquierda
    p0, p1, p2 = (0.030, -0.372, -0.374), (0.008, -0.362, -0.369), (-0.016, -0.360, -0.374)
    hueso('pulgar', raiz, mg['guante'], p0, p1, 0.0125, 0.011, seg=10); elipsoide('nud_p', p1, (0.0118,) * 3, raiz, mg['luz'], seg=10, anillos=6)
    hueso('pulgar2', raiz, mg['guante'], p1, p2, 0.011, 0.0095, seg=10); elipsoide('yema_p', p2, (0.009,) * 3, raiz, mg['sombra'], seg=10, anillos=6)
    brazo(raiz, mg, (0.048, -0.440, -0.362), (0.20, -0.72, 0.02))

def mano_izq(raiz, mg):
    # LA IZQUIERDA en el acelerador (mango en (-0.34, -0.235, -0.335), ancho en x): la palma apoyada arriba, los
    # dedos por delante y abajo; el pulgar del lado de adentro (hacia el centro de la cabina).
    c, ea, e1, e2 = (-0.345, -0.235, -0.335), (1.0, 0.0, 0.0), (0.0, 1.0, 0.0), (0.0, 0.0, -1.0)
    for i, (sx, k) in enumerate(((-0.026, 0.9), (-0.008, 1.0), (0.010, 1.03), (0.027, 0.95))):
        dedo(raiz, mg, c, ea, e1, e2, sx, -25, 205, 0.029, 0.0102 - 0.0006 * i, largo_k=k, n=4)
    elipsoide('palma', (-0.345, -0.207, -0.322), (0.044, 0.018, 0.038), raiz, mg['guante'], seg=16, anillos=10)
    elipsoide('dorso', (-0.348, -0.199, -0.312), (0.038, 0.014, 0.032), raiz, mg['luz'], seg=16, anillos=10)
    p0, p1, p2 = (-0.312, -0.212, -0.318), (-0.298, -0.222, -0.338), (-0.296, -0.230, -0.356)
    hueso('pulgar', raiz, mg['guante'], p0, p1, 0.012, 0.0105, seg=10); elipsoide('nud_p', p1, (0.0112,) * 3, raiz, mg['luz'], seg=10, anillos=6)
    hueso('pulgar2', raiz, mg['guante'], p1, p2, 0.0105, 0.0092, seg=10); elipsoide('yema_p', p2, (0.0085,) * 3, raiz, mg['sombra'], seg=10, anillos=6)
    brazo(raiz, mg, (-0.352, -0.212, -0.282), (-0.30, -0.47, 0.03))

G = {}                     # los grupos que se mueven: 'palanca' y 'acelerador'
# LAS POSES (15/10, el autor: "que las manos se muevan con el joystick"): la palanca en 3x3 —izquierda,
# centro, derecha por adelante (picar), centro, atras (trepar)— y el acelerador en 3 (freno, normal,
# turbo). Radianes del grupo alrededor de su pivote.
PALANCA_LADO, PALANCA_CABECEO, ACELERADOR_RECORRIDO = 0.17, 0.10, 0.30

def cabina(T, K):
    raiz = bpy.data.objects.new('cabina', None)
    bpy.context.scene.collection.objects.link(raiz); raiz.parent = T
    m = {n: K['mat_cel'](n, c) for n, c in (('panel', PANEL), ('visera', VISERA), ('marco', MARCO), ('consola', CONSOLA),
                                              ('bisel', BISEL), ('marca', MARCA), ('metal', METAL), ('goma', GOMA),
                                              ('amarillo', AMARILLO), ('rojo', ROJO), ('piso', PISO), ('acolchado', ACOLCHADO))}
    m['esfera'] = K['mat_emisivo']('esfera', ESFERA)
    # EL TABLERO: la chapa con el escalon de arriba (mas angosto, donde va la fila chica y el colimador)
    bloque('tablero', raiz, m['panel'], (0, -0.330, Z_TABLERO - 0.02), (0.62, 0.20, 0.04), bisel=0.012)
    # (20/11, el autor: "hay espacios vacios en los costados a nivel superior"): el escalon de arriba va de punta
    # a punta del tablero —antes era mas angosto y dejaba ver el mamparo en las esquinas—, con un relojito y
    # luces de aviso a cada lado; a la izquierda un panelito gemelo del estante, con dos relojes y llaves
    bloque('tablero_alto', raiz, m['panel'], (0, -0.175, Z_TABLERO - 0.02), (0.66, 0.11, 0.04), bisel=0.012)
    for sg in (-1, 1):
        reloj_hundido(raiz, m, sg * 0.282, -0.200, 0.024, False)
        for k in range(3):
            cilindro_z('aviso', raiz, K['mat_emisivo']('aviso_%d' % k, ('#c9a23a', '#7d2a22', '#3f7d48')[k]),
                       (sg * (0.262 + k * 0.02), -0.150, Z_TABLERO + 0.004), 0.006, 0.004, seg=8)
    bloque('tablero_izq', raiz, m['panel'], (-0.352, -0.305, Z_TABLERO - 0.015), (0.10, 0.16, 0.04), bisel=0.012)
    reloj_hundido(raiz, m, -0.352, -0.262, 0.030, False)
    reloj_hundido(raiz, m, -0.352, -0.335, 0.030, False)
    for k in range(3): tecla(raiz, m, -0.380 + k * 0.028, -0.375, Z_TABLERO + 0.004)
    # LOS COSTADOS DE ARRIBA: una chapa entre la oreja de la visera y el zocalo del canopy, que cierra el hueco
    for sg in (-1, 1):
        bloque('cierre_alto', raiz, m['consola'], (sg * 0.405, -0.20, -0.47), (0.06, 0.16, 0.10), bisel=0.01)
        cilindro_z('perilla_alta', raiz, m['metal'], (sg * 0.405, -0.225, -0.418), 0.009, 0.012, seg=8)
    bloque('tablero_lado', raiz, m['panel'], (0.352, -0.305, Z_TABLERO - 0.015), (0.10, 0.16, 0.04), bisel=0.012)
    bloque('tablero_bajo', raiz, m['panel'], (0, -0.475, Z_TABLERO + 0.01), (0.66, 0.09, 0.05), bisel=0.008)
    for n, (x, y, r) in RELOJES.items(): reloj_hundido(raiz, m, x, y, r, True)
    for (x, y, r) in DECORATIVOS: reloj_hundido(raiz, m, x, y, r, False)
    ex, ey, ew, eh = ESTANTE
    bloque('estante_marco', raiz, m['bisel'], (ex, ey, Z_TABLERO + 0.002), (ew + 0.012, eh + 0.012, 0.005), bisel=0.002)
    pieza('estante_fondo', raiz, m['esfera'], (ew, eh, 0.002), (ex, ey, Z_TABLERO + 0.0055))
    # LA VISERA: el capo negro que se curva sobre el tablero, de punta a punta, con el labio hacia el ojo
    for sg in (-1, 1):
        bloque('visera_lado', raiz, m['visera'], (sg * 0.33, -0.17, -0.47), (0.10, 0.08, 0.16), bisel=0.03)
    bloque('visera', raiz, m['visera'], (0, -0.112, -0.50), (0.58, 0.04, 0.14), bisel=0.02)
    # EL COLIMADOR: la caja sobre la visera, los dos parantes y el vidrio (que no se hornea: ahi va la mira)
    bloque('colimador', raiz, m['visera'], (0, -0.075, -0.50), (0.10, 0.05, 0.10), bisel=0.01)
    for sg in (-1, 1):
        tubo('parante_col', raiz, m['visera'], [(sg * 0.045, -0.05, -0.50), (sg * 0.047, 0.035, -0.53)], 0.0045)
    tubo('techo_col', raiz, m['visera'], [(-0.047, 0.035, -0.53), (0.047, 0.035, -0.53)], 0.0045)
    # LA CONSOLA DEL MEDIO, bajo el tablero: los interruptores y los dos rotulos de emergencia
    for i in range(9):
        if i == 4: continue
        tecla(raiz, m, -0.26 + i * 0.065, -0.455, -0.464)
    franjas(raiz, m, (-0.17, -0.49, -0.463), 0.14, 0.02)
    franjas(raiz, m, (0.17, -0.49, -0.463), 0.14, 0.02)
    cilindro_z('luz_verde', raiz, K['mat_emisivo']('verde', '#4fbf5a'), (-0.05, -0.49, -0.462), 0.008, 0.004, seg=8)
    cilindro_z('fuego', raiz, m['rojo'], (0.28, -0.455, -0.462), 0.012, 0.02, seg=10)
    # EL MARCO DEL PARABRISAS: grueso, negro, con las esquinas de arriba redondeadas
    for sg in (-1, 1):
        tubo('parante', raiz, m['marco'], [(sg * 0.40, -0.13, -0.52), (sg * 0.37, 0.08, -0.47), (sg * 0.33, 0.22, -0.43),
                                         (sg * 0.25, 0.30, -0.40), (sg * 0.10, 0.33, -0.39), (0, 0.335, -0.39)], 0.018)
    # LOS ZOCALOS DEL CANOPY con su acolchado, que bajan desde los costados del parabrisas
    for sg in (-1, 1):
        tubo('zocalo', raiz, m['marco'], [(sg * 0.42, -0.13, -0.52), (sg * 0.46, -0.16, -0.20), (sg * 0.47, -0.17, 0.05)], 0.04)
        bloque('acolchado', raiz, m['acolchado'], (sg * 0.44, -0.24, -0.22), (0.05, 0.12, 0.55), bisel=0.03)
    # LAS CONSOLAS DE LOS COSTADOS: negras, con perillas y relojitos; el ACELERADOR a la izquierda
    for sg in (-1, 1):
        bloque('consola', raiz, m['consola'], (sg * 0.37, -0.36, -0.24), (0.16, 0.06, 0.46), bisel=0.01)
        for i in range(5):
            cilindro_z('perilla', raiz, m['metal'], (sg * (0.33 + (i % 2) * 0.05), -0.322, -0.40 + i * 0.07), 0.010, 0.016, seg=8)
        if sg > 0:
            for i in range(3):
                reloj_hundido_c = (0.40, -0.322, -0.36 + i * 0.09)
                cilindro_z('aro_c', raiz, m['bisel'], reloj_hundido_c, 0.024, 0.01, seg=16)
    # EL ACELERADOR Y LA PALANCA, CADA UNO CON SU MANO, en un GRUPO con su PIVOTE: se hornean aparte y en
    # varias posiciones (ver POSES), y el juego elige la que corresponde a lo que el jugador aprieta
    def grupo(nombre, pivote, construir):
        antes = set(o.name for o in raiz.children)
        construir()
        nuevos = [o for o in raiz.children if o.name not in antes]
        e = bpy.data.objects.new(nombre, None); bpy.context.scene.collection.objects.link(e)
        e.parent = raiz; e.location = pivote
        bpy.context.view_layer.update()
        for o in nuevos:
            mw = o.matrix_world.copy(); o.parent = e; o.matrix_world = mw
        return e
    def acelerador():
        tubo('acelerador', raiz, m['metal'], [(-0.34, -0.33, -0.28), (-0.34, -0.25, -0.33)], 0.010)
        bloque('mango', raiz, m['goma'], (-0.34, -0.235, -0.335), (0.07, 0.035, 0.05), bisel=0.012)
        manos(raiz, K, 'izq')
    G['acelerador'] = grupo('g_acelerador', (-0.34, -0.33, -0.28), acelerador)
    pieza('rotulo_flap', raiz, m['amarillo'], (0.05, 0.016, 0.004), (-0.40, -0.32, -0.46))
    # LA PALANCA: el fuste gris, la empuñadura negra y el gatillo rojo
    def palanca():
        tubo('palanca', raiz, m['metal'], [(0, -0.95, -0.30), (0, -0.46, -0.40)], 0.018)
        bloque('empuñadura', raiz, m['goma'], (0, -0.40, -0.40), (0.05, 0.11, 0.045), bisel=0.018)
        pieza('gatillo', raiz, m['rojo'], (0.022, 0.03, 0.014), (0, -0.435, -0.424))
        manos(raiz, K, 'der')
    G['palanca'] = grupo('g_palanca', (0, -0.80, -0.33), palanca)
    # EL PISO entre las piernas, al fondo
    pieza('piso', raiz, m['piso'], (0.40, 0.01, 0.40), (0, -0.70, -0.45))
    tina(raiz, K)
    return raiz

# LA TINA (el autor, 14/11: "la parte de abajo se ve transparente, rellenar con material"): la cabina es
# una bañera cerrada — el mamparo detras del tablero, las paredes bajo las consolas y el piso — en chapa
# gris oscuro con cuadernas, larguerillos, remaches, mazos de cables y los pedales. Abajo no se ve el
# mundo: solo el parabrisas y el canopy dejan pasar.
CHAPA, CUADERNA, REMACHE, CABLE, CABLE2 = '#2f363b', '#22282c', '#5b656b', '#1a1c1d', '#6b5a2e'

def tina(raiz, K):
    m = {n: K['mat_cel']('tina_' + n, c) for n, c in (('chapa', CHAPA), ('cuaderna', CUADERNA), ('remache', REMACHE),
                                                      ('cable', CABLE), ('cable2', CABLE2), ('piso', PISO), ('metal', METAL))}
    ZM = -0.60                                                    # el mamparo, detras del tablero
    pieza('mamparo', raiz, m['chapa'], (1.04, 0.74, 0.02), (0, -0.62, ZM))
    for sg in (-1, 1):
        pieza('pared', raiz, m['chapa'], (0.02, 0.80, 0.90), (sg * 0.48, -0.61, -0.15))   # sube hasta el zocalo
        pieza('bajo_consola', raiz, m['cuaderna'], (0.16, 0.02, 0.90), (sg * 0.42, -0.40, -0.15))
    pieza('piso_tina', raiz, m['piso'], (1.0, 0.02, 0.90), (0, -0.90, -0.15))
    # las CUADERNAS del mamparo (verticales) y los LARGUERILLOS (horizontales), con sus remaches
    for i in range(-4, 5):
        x = i * 0.115
        if abs(x) < 0.05: continue                                # el hueco de la palanca
        pieza('cuaderna', raiz, m['cuaderna'], (0.022, 0.70, 0.02), (x, -0.62, ZM + 0.015))
        for k in range(10):
            pieza('remache', raiz, m['remache'], (0.006, 0.006, 0.004), (x + 0.017, -0.30 - k * 0.065, ZM + 0.012))
    for y in (-0.55, -0.74):
        pieza('larguerillo', raiz, m['cuaderna'], (1.02, 0.018, 0.016), (0, y, ZM + 0.024))
    # las paredes de los costados: cuadernas que bajan y remaches en fila
    for sg in (-1, 1):
        for k in range(8):
            z = 0.22 - k * 0.11
            pieza('cuaderna_l', raiz, m['cuaderna'], (0.02, 0.76, 0.022), (sg * 0.468, -0.61, z))
            for j in range(7):
                pieza('remache_l', raiz, m['remache'], (0.004, 0.006, 0.006), (sg * 0.469, -0.30 - j * 0.08, z + 0.03))
        # los MAZOS DE CABLES que corren por la pared, con sus abrazaderas
        for (y0, mat) in ((-0.47, 'cable'), (-0.50, 'cable2'), (-0.53, 'cable')):
            tubo('mazo', raiz, m[mat], [(sg * 0.455, y0, 0.25), (sg * 0.455, y0 - 0.02, -0.30),
                                      (sg * 0.46, y0 - 0.06, ZM + 0.04)], 0.009)
        for k in range(4):
            pieza('abrazadera', raiz, m['remache'], (0.03, 0.10, 0.012), (sg * 0.45, -0.51, 0.15 - k * 0.20))
    # el mazo grande que cruza el mamparo bajo el tablero
    tubo('mazo_m', raiz, m['cable'], [(-0.48, -0.58, ZM + 0.04), (-0.15, -0.60, ZM + 0.04), (0.15, -0.60, ZM + 0.04),
                                      (0.48, -0.58, ZM + 0.04)], 0.014)
    tubo('mazo_m2', raiz, m['cable'], [(-0.48, -0.62, ZM + 0.05), (0.48, -0.62, ZM + 0.05)], 0.008)
    # LOS PEDALES del timon, al fondo
    for sg in (-1, 1):
        tubo('brazo_pedal', raiz, m['metal'], [(sg * 0.17, -0.70, ZM + 0.02), (sg * 0.17, -0.80, -0.50)], 0.010)
        bloque('pedal', raiz, m['cuaderna'], (sg * 0.17, -0.81, -0.50), (0.10, 0.12, 0.02), bisel=0.006)
        for k in range(3):
            pieza('estria', raiz, m['remache'], (0.08, 0.008, 0.004), (sg * 0.17, -0.77 - k * 0.035, -0.488))

def anclas(cam):
    """El centro y el radio de cada reloj (y el colimador), proyectados con LA camara: pixeles de 480x270."""
    from bpy_extras.object_utils import world_to_camera_view
    sc = bpy.context.scene
    T = bpy.data.objects['TRES']
    def px(p):
        c = world_to_camera_view(sc, cam, T.matrix_world @ Vector(p))
        return (c.x * W_J, (1 - c.y) * H_J)
    out = {}
    for n, (x, y, r) in RELOJES.items():
        cx, cy = px((x, y, Z_TABLERO + 0.0075)); ex, _ = px((x + r, y, Z_TABLERO + 0.0075))
        out[n] = [round(cx, 2), round(cy, 2), round(ex - cx, 2)]
    ex, ey, ew, eh = ESTANTE
    x0, y0 = px((ex - ew / 2, ey + eh / 2, Z_TABLERO + 0.0075)); x1, y1 = px((ex + ew / 2, ey - eh / 2, Z_TABLERO + 0.0075))
    out['rack'] = [round(x0, 2), round(y0, 2), round(x1, 2), round(y1, 2)]
    out['colimador'] = [round(v, 2) for v in px((0, -0.01, -0.52))]
    return out

if __name__ == '__main__':
    H.FW, H.FH = W_J * ESC, H_J * ESC
    sc = H.limpiar()
    T = H.vacio_tres()
    # LA CAMARA DEL JUEGO: en el ojo, mirando a -z; fov horizontal 2·atan(W/2 / F) y el punto principal
    # corrido a la fila HOR (shift: en unidades del lado mayor)
    cd = bpy.data.cameras.new('ojo')
    cd.sensor_fit = 'HORIZONTAL'; cd.lens_unit = 'FOV'
    cd.angle_x = 2 * math.atan((W_J / 2) / F_J)
    cd.shift_y = -(H_J / 2 - HOR_J) / W_J     # el eje cae ARRIBA del centro: el cuadro se corre para abajo
    cd.clip_start, cd.clip_end = 0.01, 20
    cam = bpy.data.objects.new('ojo', cd); sc.collection.objects.link(cam); cam.parent = T
    cam.matrix_basis = H.mirando((0, 0, 0), (0, 0, -1))
    sc.camera = cam
    H.sol(T)
    K = dict(mat_cel=H.mat_cel, mat_cel_nodo=H.mat_cel_nodo, mat_emisivo=H.mat_emisivo, lin=H.lin,
             perilla=H.perilla, mezcla=H.mezcla, ocultar_si=H.ocultar_si, controles=False)
    cabina(T, K)
    os.makedirs(OUT, exist_ok=True)
    todos = [o for o in bpy.data.objects if o.type == 'MESH']
    de = lambda g: set(o.name for o in g.children_recursive)
    def solo(nombres):
        for o in todos: o.hide_render = o.name not in nombres
    def foto(nombre):
        bpy.context.view_layer.update()
        sc.render.filepath = os.path.join(OUT, nombre)
        bpy.ops.render.render(write_still=True)
    # LA BASE, sin palanca ni acelerador (van en sus capas)
    movil = de(G['palanca']) | de(G['acelerador'])
    solo(set(o.name for o in todos) - movil); foto('cabina.png')
    # LA PALANCA, fila = cabeceo (0 picar, 1 centro, 2 trepar), columna = lado (0 izq, 1 centro, 2 der)
    solo(de(G['palanca']))
    for j in (-1, 0, 1):
        for i in (-1, 0, 1):
            G['palanca'].rotation_euler = (j * PALANCA_CABECEO, 0, -i * PALANCA_LADO)
            foto('palanca_%d_%d.png' % (j + 1, i + 1))
    G['palanca'].rotation_euler = (0, 0, 0)
    # EL ACELERADOR: 0 freno (atras), 1 normal, 2 turbo (adelante)
    solo(de(G['acelerador']))
    for k in (-1, 0, 1):
        G['acelerador'].rotation_euler = (-k * ACELERADOR_RECORRIDO, 0, 0)
        foto('acelerador_%d.png' % (k + 1))
    G['acelerador'].rotation_euler = (0, 0, 0)
    json.dump(anclas(cam), open(os.path.join(OUT, 'anclas.json'), 'w'), indent=1)
    print('HORNEADO', OUT)
