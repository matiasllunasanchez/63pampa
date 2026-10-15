# LOS AVIONES ENEMIGOS HECHOS EN BLENDER (fase 2, 3/10/2026). Los usa tools/blender/hornear_hoja.py
# (`bl:<funcion>` en tools/blender/hojas.py). Los helicopteros no estan aca: van por el puente, el
# modelo de three.js tal cual (ver hojas.py).
#
# MISMAS MEDIDAS Y LUGARES QUE tools/models/harrier.js y tools/models/enemies.js (las alas, la deriva
# y el estabilizador salen de los numeros de WING/FIN pasados a estaciones), para que cada sprite
# ocupe lo mismo en su cuadro. Lo que cambia es la FORMA, como en los aviones jugables: fuselajes
# lofteados, superficies con perfil, la pintura en el espacio del modelo.
#
# Espacio de three: y arriba, nariz hacia -z.
import importlib.util, math, os

AQUI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('modelos_bl_base', os.path.join(AQUI, 'modelos.py'))
M = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(M)
loft, superficie, elipsoide, disco, caja, _subdiv, mat_pintura = M.loft, M.superficie, M.elipsoide, M.disco, M.caja, M._subdiv, M.mat_pintura

FUEGO = ('#b8341a', '#f07a22', '#ffe6a8')      # las tres capas de calor (BAKE.PAL.fuego*)
CANOPY = '#8fd0e0'
td = lambda g: math.tan(math.radians(g))

def _raiz(T, nombre):
    import bpy
    r = bpy.data.objects.new(nombre, None)
    bpy.context.scene.collection.objects.link(r)
    r.parent = T
    return r

def _fuego(raiz, K, x, y, z, r):
    """La boca encendida mirando a la camara de cola: tres discos de calor (los de jet())."""
    for i, (c, f) in enumerate(zip(FUEGO, (1.0, 0.62, 0.30))):
        disco('fuego%d' % i, (x, y, z + 0.01 * i), r * f, raiz, K['mat_emisivo']('fuego%d' % i, c))

# ============================ EL SEA HARRIER FRS.1 ============================
# Las seis señas de tools/models/harrier.js, ahora con forma: el fuselaje PANZON (gordo en la cintura,
# donde va el Pegasus), las TOMAS como dos barriles tan anchos como el fuselaje, las CUATRO TOBERAS,
# el ala ALTA y ANHEDRA (las puntas caen), los BALANCINES colgando casi en la punta y la burbuja alta
# adelante de las tomas. Gris oscuro de mar, panza un punto mas clara, la escarapela azul.
def harrier(T, K, atras=None, version='sea'):
    """El Sea Harrier FRS.1 de la Armada britanica, o (`version='gr3'`) el Harrier GR.3 de la RAF: la
    misma celula con la trompa LARGA del telemetro laser (la "nariz de Snoopy", con su ventana), la cabina
    mas BAJA y el camuflaje verde y gris de la RAF con la panza clara."""
    gr3 = version == 'gr3'
    raiz = _raiz(T, 'Harrier GR.3' if gr3 else 'Sea Harrier')
    P = (dict(arriba=['#4b5a3e', '#4d5559'], corte=0.5, escala=0.42, panza='#9aa3a6',
              marcas=[dict(z=(-4.4, -3.75), y=(-0.12, 0.10), color='#20262a', arriba=False)])   # la ventana del laser
         if gr3 else
         dict(arriba=['#535d60', '#4a5457'], corte=0.5, escala=0.45, panza='#626d70',
              marcas=[dict(x=(0.42, 0.66), z=(1.30, 1.62), y=(0.02, 0.34), color='#2c4a7a', arriba=False)]))
    piel = mat_pintura(K, 'pintura', P)
    oscuro = K['mat_cel']('metal', '#333b3e')
    negro = K['mat_emisivo']('boca', '#14191b')
    vidrio = K['mat_cel']('vidrio', CANOPY, brillo=True)
    # EL FUSELAJE (14/10, "que sean fieles"): el perfil del FRS.1 — el radomo del Blue Fox cae en punta
    # adelante, la trompa SUBE hasta la cabina ELEVADA (la del Sea Harrier va mas alta que la del GR.3:
    # es lo que lo hace reconocible de costado), se ensancha en la cintura de las tomas y se afina hasta
    # el aguijon de la cola.
    trompa = ([(-4.45, 0.02, 0.02, -0.02), (-4.30, 0.09, 0.08, -0.01), (-3.95, 0.15, 0.13, 0.0), (-3.55, 0.20, 0.18, 0.03),
               (-3.20, 0.25, 0.24, 0.06)] if gr3 else
              [(-3.70, 0.02, 0.02, 0.00), (-3.55, 0.08, 0.08, 0.02), (-3.25, 0.20, 0.20, 0.05)])
    _subdiv(loft('fuselaje', trompa + [
                              (-2.85, 0.30, 0.30, 0.10), (-2.40, 0.38, 0.40, 0.15), (-1.90, 0.44, 0.50, 0.17),
                              (-1.40, 0.52, 0.56, 0.12), (-0.60, 0.57, 0.58, 0.04), (0.40, 0.58, 0.56, 0.0),
                              (1.30, 0.50, 0.48, 0.0), (2.10, 0.40, 0.38, 0.02), (2.80, 0.29, 0.28, 0.04),
                              (3.30, 0.17, 0.17, 0.06), (3.80, 0.08, 0.08, 0.06), (4.20, 0.04, 0.04, 0.06)],
                 raiz, piel, n=20, expo=2.3, cerrar=(True, True)), 2)
    # el LOMO: nace alto detras de la cabina y BAJA hasta la deriva
    dy = -0.14 if gr3 else 0.0            # el GR.3: la cabina y el lomo mas BAJOS que en el Sea Harrier
    _subdiv(loft('lomo', [(-1.55, 0.14, 0.10, 0.66 + dy), (-1.00, 0.22, 0.16, 0.62 + dy), (0.10, 0.20, 0.13, 0.56 + dy * 0.5),
                          (1.40, 0.12, 0.08, 0.44), (2.40, 0.05, 0.04, 0.32)], raiz, piel, n=12, expo=2.0, cerrar=(True, True)), 1)
    # LA BURBUJA, adelantada, con el arco del parabrisas
    elipsoide('cabina', (0, 0.78 + dy, -1.95), (0.25, 0.30, 0.55), raiz, vidrio)
    _subdiv(loft('marco', [(-2.29, 0.21, 0.25, 0.78 + dy), (-2.24, 0.21, 0.25, 0.78 + dy)], raiz, oscuro, n=16, expo=2.0, cerrar=(False, False)), 0)
    # LAS TOMAS: dos barriles pegados al fuselaje, la boca negra y ovalada adelante
    for sg in (-1, 1):
        x0 = sg * 0.64
        _subdiv(loft('toma%d' % sg, [(-1.43, 0.42, 0.50, 0.08), (-1.20, 0.45, 0.51, 0.08), (-0.40, 0.42, 0.47, 0.06),
                                     (0.35, 0.28, 0.32, 0.03), (0.90, 0.08, 0.09, 0.0)],
                     raiz, piel, n=16, expo=2.0, cerrar=(False, True), x0=x0), 1)
        disco('boca%d' % sg, (x0, 0.08, -1.435), 0.36, raiz, negro)      # (la emision se ve de los dos lados)
    # EL ALA ALTA Y ANHEDRA: WING(4.8, 2.1, 0.7, 1.5, y 0.36, z 0.35, 15°) en estaciones
    superficie('ala', [(0.0, -0.70, 2.10, 0.09, 0.46), (0.55, -0.36, 1.78, 0.09, 0.46 - 0.55 * td(15)),
                       (2.40, 0.80, 0.70, 0.10, 0.46 - 2.40 * td(15))], raiz, piel, eje='x', espejo=True)
    # LOS BALANCINES, colgando bajo el ala casi en la punta
    for sg in (-1, 1):
        elipsoide('balancin%d' % sg, (sg * 1.95, 0.46 - 1.95 * td(15) - 0.16, 0.55), (0.10, 0.11, 0.42), raiz, oscuro, seg=12, anillos=8)
    # LAS CUATRO TOBERAS: muñones achatados al costado; las de atras, calientes
    for sg in (-1, 1):
        elipsoide('tobera_fria%d' % sg, (sg * 0.66, -0.16, 0.05), (0.26, 0.24, 0.20), raiz, piel, seg=14, anillos=8)
        elipsoide('tobera_cal%d' % sg, (sg * 0.62, -0.22, 1.30), (0.28, 0.27, 0.22), raiz, oscuro, seg=14, anillos=8)
        disco('boca_cal%d' % sg, (sg * 0.74, -0.24, 1.505), 0.16, raiz, negro)
        if atras: _fuego(raiz, K, sg * 0.74, -0.24, 1.515, 0.16)
    # LA COLA: deriva en flecha con el carenado del RWR, estabilizador tambien caido, el aguijon
    superficie('deriva', [(0.30, 1.85, 1.70, 0.08, 0.0), (1.80, 3.15, 0.60, 0.09, 0.0)], raiz, piel, eje='y')
    elipsoide('rwr', (0, 1.78, 3.30), (0.07, 0.07, 0.32), raiz, oscuro, seg=10, anillos=6)
    superficie('estab', [(0.0, 2.425, 0.95, 0.09, 0.11), (1.10, 3.125, 0.42, 0.10, 0.11 - 1.10 * td(13))], raiz, piel, eje='x', espejo=True)
    return raiz

# ============================ EL CAZA DEL PASILLO: EL HARRIER GR.3 ============================
# (14/10/2026, el autor: "hacelo Harrier GR.3"). Hasta hoy era un caza GENERICO — "punto por punto lo
# contrario del Harrier" para distinguirlos —, un avion que no existio. Ahora es el GR.3 de la RAF que
# volo en Malvinas: la misma celula que el Sea Harrier, con la nariz larga del laser, la cabina baja y
# el camuflaje verde y gris. Se lo distingue del Sea Harrier por el color y la trompa.
def caza(T, K):
    return harrier(T, K, version='gr3')

# ============================ KC-130 HERCULES — LA CHANCHA ============================
# modelHercules de tools/models/enemies.js, con las mismas medidas (los motores en CH_MOT: es un
# contrato con render/chancha.js, que dibuja las helices encima). El fuselaje es UN loft que se
# REMANGA atras —la panza sube para dejar salir la rampa— en vez de un tubo con un cono girado; la
# pintura (verde con manchones arena, panza gris) y las ventanas de la cabina van pintadas.
CH_MOT = [2.9, 5.9]
# la BOCA de cada pod de manguera (x, y, z): afuera del motor externo, colgado bajo el ala. Es el
# mismo numero que CH_POD de hojas.py (el ancla que proyecta el horno)
CH_POD = (8.0, 0.80, 1.15)
def hercules(T, K):
    raiz = _raiz(T, 'Hercules')
    VERDE, ARENA, GRIS, GRIS_D, NEG = '#4a5842', '#8f8055', '#8e9a95', '#6d7975', '#1c221d'
    # LA CAMARA LA VE DESDE ABAJO (elev 12), asi que la panza es media hoja: gris SOLO en lo que mira
    # bien abajo, y alas y cola por debajo en un verde de sombra (con el gris de la panza toda la
    # Chancha se leia como una mancha celeste y perdia el verde que la hace de la FAA)
    piel = mat_pintura(K, 'pintura', dict(arriba=[VERDE, ARENA], corte=0.60, escala=0.11, panza='#76827d', umbral_panza=-0.80,
                                          marcas=[dict(z=(-7.15, -6.55), y=(0.30, 0.80), color='#2a3a44', arriba=False)]))
    alas = mat_pintura(K, 'alas', dict(arriba=[VERDE, ARENA], corte=0.62, escala=0.11, panza='#3f4a3a'))
    gondola = mat_pintura(K, 'gondola', dict(arriba=['#5a684e'], panza=GRIS_D))
    gris = K['mat_cel']('gris', GRIS)
    negro = K['mat_cel']('negro', NEG)
    # LA TROMPA ROMA (14/10, "mas fieles"): el radomo redondo del C-130 abajo y la cabina encima — antes
    # terminaba en punta, como un caza
    _subdiv(loft('fuselaje', [(-7.78, 0.20, 0.18, -0.30), (-7.64, 0.66, 0.60, -0.22), (-7.38, 1.00, 0.94, -0.12),
                              (-6.92, 1.20, 1.16, -0.04), (-6.10, 1.29, 1.28, 0.0), (-4.50, 1.31, 1.30, 0.0),
                              (2.50, 1.31, 1.30, 0.0), (4.00, 1.29, 1.24, 0.06), (5.40, 1.10, 0.95, 0.38),
                              (6.80, 0.82, 0.64, 0.70), (8.00, 0.48, 0.36, 0.96), (8.70, 0.18, 0.16, 1.06)],
                 raiz, piel, n=24, expo=2.2, cerrar=(True, True)), 2)
    # LA DERIVA, alta y ancha, con el FILETE dorsal que sube del lomo
    superficie('deriva', [(1.00, 2.60, 4.60, 0.10, 0.0), (5.50, 5.10, 2.10, 0.12, 0.0)], raiz, alas, eje='y')
    superficie('filete', [(1.05, 0.00, 4.40, 0.06, 0.0), (2.20, 4.10, 0.40, 0.25, 0.0)], raiz, alas, eje='y')
    # el estabilizador a la base de la deriva (no es cola en T)
    superficie('estab', [(0.0, 4.25, 2.50, 0.11, 1.59), (4.40, 4.85, 1.30, 0.12, 1.59)], raiz, alas, eje='x', espejo=True)
    # EL ALA ALTA de punta a punta, recta, diedro leve (las puntas suben)
    superficie('ala', [(0.0, -2.15, 3.10, 0.14, 1.62), (5.0, -1.99, 2.49, 0.14, 1.62 + 5.0 * td(1.6)),
                       (11.0, -1.80, 1.75, 0.14, 1.62 + 11.0 * td(1.6))], raiz, alas, eje='x', espejo=True)
    # LOS CARENADOS DEL TREN a los costados de la panza
    for sg in (-1, 1):
        _subdiv(loft('tren%d' % sg, [(-3.20, 0.10, 0.10, -0.62), (-2.60, 0.42, 0.52, -0.55), (1.40, 0.42, 0.52, -0.55),
                                     (2.00, 0.10, 0.12, -0.60)], raiz, piel, n=14, expo=2.6, cerrar=(True, True), x0=sg * 1.20), 1)
    # LOS CUATRO MOTORES: gondola, cono de la helice (el disco lo dibuja el juego) y el escape
    for sg in (-1, 1):
        for mx in CH_MOT:
            x = sg * mx
            _subdiv(loft('gondola', [(-4.00, 0.30, 0.32, 1.05), (-3.80, 0.44, 0.50, 1.03), (-2.40, 0.47, 0.56, 1.00),
                                     (-0.60, 0.42, 0.50, 1.12), (0.50, 0.20, 0.24, 1.30)],
                         raiz, gondola, n=16, expo=2.2, cerrar=(True, True), x0=x), 1)
            _subdiv(loft('cono', [(-4.85, 0.02, 0.02, 1.10), (-4.60, 0.22, 0.22, 1.10), (-4.00, 0.33, 0.33, 1.10)],
                         raiz, gris, n=12, expo=2.0, cerrar=(True, True), x0=x), 1)
            elipsoide('escape', (x, 0.92, 0.20), (0.18, 0.12, 0.45), raiz, negro, seg=10, anillos=6)
    # LOS PODS DE MANGUERA, donde van en el KC-130 de verdad: AFUERA DEL MOTOR EXTERNO, en el ala
    # exterior, colgados de un pilon corto (8/10, el autor: "hay cuadrados que tiene la chancha").
    # Hasta hoy colgaban del motor interno porque la canasta del juego salia a 3 m del eje; ahora es
    # al reves: la canasta sale de donde esta el pod (CH_HOSE_X en src/data/tuning.js). Un cuerpo
    # gordo y CUADRADO (expo 3) —a 4 px de diametro un cilindro fino no se lee—, colgado mas abajo
    # que las gondolas y en gris claro, para que no se lea como un quinto y sexto motor. Adelante la
    # ojiva de la turbina de aire; atras la BOCA, de donde el juego larga la manguera naranja
    # (render/chancha.js). La boca es un ancla: CH_POD en hojas.py.
    for sg in (-1, 1):
        x = sg * CH_POD[0]
        _subdiv(loft('pod', [(-3.05, 0.03, 0.03, CH_POD[1]), (-2.75, 0.18, 0.18, CH_POD[1]), (-2.35, 0.32, 0.32, CH_POD[1]),
                             (0.55, 0.33, 0.33, CH_POD[1]), (CH_POD[2] - 0.05, 0.20, 0.20, CH_POD[1])],
                     raiz, gris, n=12, expo=3.0, cerrar=(True, True), x0=x), 1)
        disco('ojiva_pod', (x, CH_POD[1], -3.06), 0.06, raiz, negro)
        disco('boca_pod', (x, CH_POD[1], CH_POD[2]), 0.15, raiz, negro)
        caja('pilon_pod', (x, 1.45, -0.85), (0.14, 0.75, 1.70), raiz, gondola)
    return raiz
