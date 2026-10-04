# LA VEGETACION DE LAS ISLAS, HECHA EN BLENDER (4/10/2026). Pedido del autor: "¿arboles y arbustos se
# pueden hacer en Blender? — dale, hace la vegetacion", con una foto del campo malvinense: MATAS DE PASTO
# BLANCO / TUSSAC (fuentes de hojas finas, verde palido, las puntas secas casi blancas) y, entre ellas,
# manchones bajos ROJIZOS de murtilla. Hasta hoy la vegetacion se dibujaba por codigo con dos
# rectangulos por mata (render/paredes.js, render/colinas.js).
#
#   pasto(variante)     LA MATA DE PASTO BLANCO / TUSSAC — la de la foto, la que mas se ve. Va en GRIS:
#                       el juego la tiñe con el verde del clima (render/vegetacion.js), y la punta mas
#                       clara queda mas clara despues del tinte.
#   murtilla(variante)  la murtilla (diddle-dee): un colchon bajo y apretado, ROJIZO, con sus bayas
#   tojo(variante)      el tojo (gorse): la mata redonda y espinosa con las flores amarillas
#   cipres(variante)    EL ARBOL: los pocos de las islas son cipreses de cortaviento junto a los
#                       caserios, todos VENCIDOS hacia el mismo lado por el viento
# Las tres ultimas van en su color: no son "el pasto del clima", son plantas puntuales.
# Todo determinista (senos y angulo aureo): la hoja sale igual cada horneada. Base en y = 0.
import importlib.util, math, os
import bpy

AQUI = os.path.dirname(os.path.abspath(__file__))
def _mod(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(AQUI, archivo))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m
M = _mod('modelos_bl_base_v', 'modelos.py')
TI = _mod('modelos_bl_tierra_v', 'modelos_tierra.py')
elipsoide, mat_pintura = M.elipsoide, M.mat_pintura
vacio, hueso = TI.vacio, TI.hueso
AUREO = 2.39996

def _ruido(ob, fuerza=0.08, escala=0.25, nombre='hojas'):
    tx = bpy.data.textures.get(nombre) or bpy.data.textures.new(nombre, 'CLOUDS')
    tx.noise_scale = escala
    d = ob.modifiers.new('ruido', 'DISPLACE'); d.texture = tx; d.strength = fuerza
    return ob

def pasto(T, K, variante='0'):
    """LA MATA DE PASTO BLANCO: un pedestal fibroso y una FUENTE de hojas finas que salen paradas y se
    abren arqueandose, cada una en tres tramos (base oscura, medio, PUNTA SECA casi blanca)."""
    v = int(variante)
    g = vacio(T, 'pasto')
    tonos = [K['mat_cel']('pasto%d' % i, c) for i, c in enumerate(('#8c8c86', '#b4b4ac', '#e8e4d2'))]
    alto = 1.05 + 0.25 * math.sin(v * 1.7)
    ancho = 0.55 + 0.12 * math.cos(v * 2.3)
    elipsoide('pedestal', (0, 0.10, 0), (0.26 * ancho / 0.55, 0.16, 0.24), g, tonos[0], seg=12, anillos=6)
    # DENSA, como en las fotos del autor: una fuente apretada de hojas que se abren hasta caer
    N = 96
    for i in range(N):
        a = i * AUREO + v
        r0 = 0.20 * math.sqrt((i + 0.5) / N)                      # de donde sale, en la mata
        inc = 0.20 + 1.05 * ((i * 7 + v) % 11) / 11               # cuanto se abre (las de afuera, mas)
        largo = alto * (0.70 + 0.30 * ((i * 5 + v) % 7) / 7)
        p = (math.cos(a) * r0, 0.18, math.sin(a) * r0)
        for k, (f, r) in enumerate(((0.45, 0.026), (0.33, 0.018), (0.22, 0.010))):
            ang = inc * (0.30 + 0.65 * k)                          # se ARQUEA: cada tramo mas tumbado
            d = (math.cos(a) * math.sin(ang), math.cos(ang), math.sin(a) * math.sin(ang))
            q = (p[0] + d[0] * largo * f, p[1] + d[1] * largo * f, p[2] + d[2] * largo * f)
            hueso('hoja', g, tonos[k], p, q, r, r * 0.7, seg=4)
            p = q
    return g

def murtilla(T, K, variante='0'):
    """LA MURTILLA: un colchon bajo, apretado y rojizo, con bayas oscuras."""
    v = int(variante)
    g = vacio(T, 'murtilla')
    # EN GRIS (el autor, 4/10: "variar los colores de los arbustos entre verdes y amarillos o marrones
    # claros segun el dia y la luz"): el color lo pone el juego, render/vegetacion.js
    hoja = mat_pintura(K, 'murtilla', dict(arriba=['#bcbcb6', '#9c9c96'], corte=0.5, escala=4.0, panza='#86867f'))
    for i in range(5 + v % 3):
        a = i * AUREO + v; d = 0.0 if i == 0 else 0.28 + 0.06 * (i % 3)
        r = 0.36 - 0.03 * i
        _ruido(elipsoide('colchon', (math.cos(a) * d, 0.10, math.sin(a) * d * 0.8), (r, 0.16 + 0.03 * (i % 2), r * 0.9), g, hoja, seg=14, anillos=8), 0.05, 0.08, 'murtilla')
    baya = K['mat_cel']('baya', '#2a1418')
    for i in range(9):
        a = i * AUREO * 1.3 + v; d = 0.15 + 0.3 * ((i * 3) % 5) / 5
        elipsoide('baya', (math.cos(a) * d, 0.24 + 0.03 * (i % 2), math.sin(a) * d * 0.8), (0.03, 0.03, 0.03), g, baya, seg=6, anillos=4)
    return g

def tojo(T, K, variante='0', flores='0'):
    """EL TOJO: una mata redonda de bultos ESPINOSOS (ruido fino y fuerte) verde oscuro, salpicada de
    flores amarillas."""
    v = int(variante)
    g = vacio(T, 'tojo')
    # la mata EN GRIS (la tiñe el juego) — y con `flores='1'` la misma mata de OCLUSOR (tapa sin pintar)
    # y solo las flores en su amarillo: una capa aparte que el juego dibuja encima SIN teñir
    hoja = mat_pintura(K, 'tojo', dict(arriba=['#a8a8a2', '#8e8e88'], corte=0.5, escala=6.0, panza='#7a7a74'))
    solo_flores = flores == '1'
    R = 0.55 + 0.1 * math.sin(v * 1.3)
    for i in range(6 + v % 2):
        a = i * AUREO + v; d = 0.0 if i == 0 else R * 0.55
        r = R * (0.7 if i == 0 else 0.48)
        b = _ruido(elipsoide('bulto', (math.cos(a) * d, r * 0.85 + (0.1 if i else 0), math.sin(a) * d * 0.8), (r, r * 0.9, r), g, hoja, seg=16, anillos=10), 0.10, 0.035, 'espinas')
        b.is_holdout = solo_flores
    # LAS FLORES, SOBRE la mata (la cupula de radio R alrededor del centro de los bultos); en la capa
    # gris no van: las pone la capa de flores, encima y en su amarillo
    if solo_flores:
        flor = K['mat_cel']('flor', '#e8c43a')
        for i in range(40):
            a = i * AUREO + v; t = (i + 0.5) / 40
            th = math.acos(1 - t * 0.85)                            # del tope hacia los costados
            x, y, z = math.sin(th) * math.cos(a), math.cos(th), math.sin(th) * math.sin(a)
            elipsoide('flor', (x * R * 1.08, R * 0.85 + y * R * 0.98, z * R * 0.92), (0.05, 0.05, 0.05), g, flor, seg=6, anillos=4)
    return g

def cipres(T, K, variante='0'):
    """EL CIPRES DE CORTAVIENTO: el tronco que se inclina y la copa de bultos corrida a SOTAVENTO (+x):
    un arbol bandera, como todos los que hay junto a los caserios de las islas."""
    v = int(variante)
    g = vacio(T, 'cipres')
    alto = 3.4 + 0.5 * math.sin(v * 1.9)
    hoja = mat_pintura(K, 'cipres', dict(arriba=['#2f3d29', '#273322'], corte=0.5, escala=3.0, panza='#202a1c'))
    tronco = K['mat_cel']('tronco', '#4a3a2a')
    hueso('tronco', g, tronco, (0, 0, 0), (0.45, alto * 0.75, 0), 0.13, 0.06, seg=8)
    for i in range(9):
        t = i / 8
        y = alto * (0.25 + 0.72 * t)
        x = 0.15 + 0.75 * t + 0.55 * t * t                         # la copa se va con el viento
        r = 0.62 * (1 - 0.55 * t) + 0.12
        for j in range(2):                                          # bultos REDONDOS, no panqueques
            dx = (j - 0.5) * r * 0.9 + 0.15 * math.sin(i * 2.1 + v)
            _ruido(elipsoide('copa', (x + dx + 0.25 * t, y + 0.12 * j, 0.15 * math.cos(i * 1.7 + v + j)), (r, r * 0.85, r * 0.9), g, hoja, seg=14, anillos=8), 0.12, 0.10, 'copa')
    return g

def cortadera(T, K, variante='0'):
    """LA CORTADERA (foto del autor): una mata de hojas largas que caen arqueadas y, arriba, las varas
    con los PENACHOS blancos. Va en su color."""
    v = int(variante)
    g = vacio(T, 'cortadera')
    hoja = [K['mat_cel']('cort%d' % i, c) for i, c in enumerate(('#8c8c86', '#a8a8a0', '#d0cec4'))]     # en gris: la tiñe el juego
    N = 60
    for i in range(N):
        a = i * AUREO + v; inc = 0.35 + 1.1 * ((i * 7 + v) % 11) / 11
        largo = 1.15 * (0.7 + 0.3 * ((i * 5) % 7) / 7)
        p = (math.cos(a) * 0.12, 0.05, math.sin(a) * 0.12)
        for k, (f, r) in enumerate(((0.4, 0.02), (0.35, 0.014), (0.25, 0.008))):
            ang = inc * (0.3 + 0.7 * k)
            d = (math.cos(a) * math.sin(ang), math.cos(ang), math.sin(a) * math.sin(ang))
            q = (p[0] + d[0] * largo * f, p[1] + d[1] * largo * f, p[2] + d[2] * largo * f)
            hueso('hoja', g, hoja[k], p, q, r, r * 0.7, seg=4); p = q
    vara, penacho = K['mat_cel']('vara', '#c8c6ba'), K['mat_cel']('penacho', '#f2f0e8')
    for i in range(5 + v % 3):
        a = i * AUREO * 1.4 + v; lean = 0.10 + 0.08 * (i % 3)
        alto = 1.45 + 0.25 * math.sin(i * 1.9 + v)
        top = (math.cos(a) * lean * alto, alto, math.sin(a) * lean * alto * 0.6)
        hueso('vara', g, vara, (0, 0.1, 0), top, 0.02, 0.015, seg=4)
        pl = _ruido(elipsoide('penacho', (0, 0, 0), (0.09, 0.32, 0.09), g, penacho, seg=10, anillos=8), 0.04, 0.05, 'penacho')
        pl.location = (top[0] * 1.06, top[1] + 0.22, top[2] * 1.06); pl.rotation_euler = (top[2] * 0.4, 0, -top[0] * 0.4)
    return g

def piedra(T, K, variante='0'):
    """LAS PIEDRAS BLANCAS de las islas (la cuarcita que aflora en las lomas, foto del autor): bloques
    angulosos y claros, de a dos o tres, asomando de la turba."""
    v = int(variante)
    g = vacio(T, 'piedra')
    roca = mat_pintura(K, 'cuarcita', dict(arriba=['#d4d3cb', '#b9b8ae'], corte=0.55, escala=3.0, panza='#8f8e86'))
    # un AFLORAMIENTO: de tres a cinco bloques angulosos, el grande atras (las fotos de las lomas)
    for i in range(3 + v % 3):
        a = i * AUREO + v; d = 0.0 if i == 0 else 0.5 + 0.1 * (i % 2)
        r = 0.62 - 0.08 * i
        b = elipsoide('roca', (0, 0, 0), (r, r * 0.7, r * 0.8), g, roca, seg=8, anillos=5)
        b.data.shade_flat()
        _ruido(b, 0.14, 0.4, 'roca')
        b.location = (math.cos(a) * d, r * 0.62, math.sin(a) * d * 0.7); b.rotation_euler = (0.3 * i, a, 0.2 * (i % 2))
    return g

# ============================ EL PASTO DEL SUELO ============================
# Pedido del autor el mismo dia ("¿conviene alguna tecnica para el pasto?" — "dale, hace el pasto"). Los
# matojos del suelo eran trazos de color (render/world.js, miles por cuadro); ahora, de cerca, son
# MATOJOS DE VERDAD: un manojo de briznas finas que se abren desde la base, la punta mas clara. En GRIS
# (los tiñe el juego con los seis tonos de pasto del clima) y en TRES ESTADOS DE VIENTO: parado, doblado y
# acostado por la tormenta — el juego elige con el mismo `pastoLean` que ya doblaba los trazos, asi la
# racha que cruza el campo se ve. El viento empuja hacia +x (el mismo lado del corrimiento de la punta).
DOBLEZ = (0.0, 0.34, 0.68)

def brizna(T, K, variante='0', viento='0'):
    v, w = int(variante), DOBLEZ[int(viento)]
    g = vacio(T, 'matojo')
    tonos = [K['mat_cel']('briz%d' % i, c) for i, c in enumerate(('#8a8a84', '#b0b0a8', '#e0ded2'))]
    alto = 0.55 + 0.12 * math.sin(v * 1.9)
    N = 24 + (v % 3) * 4
    for i in range(N):
        a = i * AUREO + v
        r0 = 0.06 * math.sqrt((i + 0.5) / N)
        inc = 0.10 + 0.55 * ((i * 7 + v) % 9) / 9                 # cuanto se abre cada brizna
        largo = alto * (0.65 + 0.35 * ((i * 5 + v) % 7) / 7)
        p = (math.cos(a) * r0, 0.0, math.sin(a) * r0)
        for k, (f, r) in enumerate(((0.45, 0.016), (0.33, 0.011), (0.22, 0.006))):
            # la apertura propia de la brizna + EL VIENTO, que la dobla hacia +x mas cuanto mas arriba
            ang = inc * (0.4 + 0.5 * k)
            dx, dz = math.cos(a) * math.sin(ang), math.sin(a) * math.sin(ang)
            dy = math.cos(ang)
            vk = w * (0.6 + 0.9 * k)                                 # el doblez crece hacia la punta
            dx, dy = dx * math.cos(vk) + dy * math.sin(vk), dy * math.cos(vk) - dx * math.sin(vk)
            q = (p[0] + dx * largo * f, p[1] + dy * largo * f, p[2] + dz * largo * f)
            hueso('brizna', g, tonos[k], p, q, r, r * 0.7, seg=4)
            p = q
    return g
