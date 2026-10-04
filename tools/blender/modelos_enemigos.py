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
def harrier(T, K, atras=None):
    raiz = _raiz(T, 'Sea Harrier')
    P = dict(arriba=['#535d60', '#4a5457'], corte=0.5, escala=0.45, panza='#626d70',
             marcas=[dict(x=(0.42, 0.66), z=(1.30, 1.62), y=(0.02, 0.34), color='#2c4a7a', arriba=False)])
    piel = mat_pintura(K, 'pintura', P)
    oscuro = K['mat_cel']('metal', '#333b3e')
    negro = K['mat_emisivo']('boca', '#14191b')
    vidrio = K['mat_cel']('vidrio', CANOPY, brillo=True)
    # EL FUSELAJE: radomo corto y romo, se ENSANCHA hasta la cintura y de ahi se afina a la cola
    _subdiv(loft('fuselaje', [(-3.55, 0.02, 0.02, 0.07), (-3.30, 0.17, 0.16, 0.07), (-2.90, 0.30, 0.29, 0.06),
                              (-2.40, 0.39, 0.40, 0.05), (-1.90, 0.45, 0.48, 0.04), (-1.20, 0.51, 0.54, 0.03),
                              (-0.40, 0.56, 0.58, 0.01), (0.50, 0.57, 0.56, -0.01), (1.30, 0.49, 0.48, 0.0),
                              (2.10, 0.39, 0.38, 0.0), (2.80, 0.29, 0.28, 0.01), (3.20, 0.18, 0.18, 0.02),
                              (3.60, 0.09, 0.09, 0.02), (4.10, 0.05, 0.05, 0.02)],
                 raiz, piel, n=20, expo=2.3, cerrar=(True, True)), 2)
    # el espinazo detras de la cabina, hasta la deriva
    _subdiv(loft('lomo', [(-1.70, 0.10, 0.05, 0.50), (-1.10, 0.20, 0.13, 0.52), (0.10, 0.19, 0.12, 0.52),
                          (1.40, 0.11, 0.08, 0.42), (2.40, 0.05, 0.04, 0.30)], raiz, piel, n=12, expo=2.0, cerrar=(True, True)), 1)
    # LA BURBUJA, alta y adelantada: nariz, piloto, tomas
    elipsoide('cabina', (0, 0.52, -2.0), (0.26, 0.31, 0.52), raiz, vidrio)
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
    superficie('deriva', [(0.30, 2.00, 1.50, 0.08, 0.0), (1.60, 3.05, 0.55, 0.09, 0.0)], raiz, piel, eje='y')
    elipsoide('rwr', (0, 1.58, 3.20), (0.07, 0.07, 0.32), raiz, oscuro, seg=10, anillos=6)
    superficie('estab', [(0.0, 2.425, 0.95, 0.09, 0.11), (1.10, 3.125, 0.42, 0.10, 0.11 - 1.10 * td(13))], raiz, piel, eje='x', espejo=True)
    return raiz

# ============================ EL CAZA GENERICO DEL PASILLO ============================
# modelJet de tools/models/enemies.js: punto por punto lo contrario del Harrier — fuselaje FINO, ala al
# medio con DIEDRO (puntas arriba), tomas chatas, UNA tobera atras. Gris neutro, sin bandera.
def caza(T, K):
    S = dict(
        fuselaje=[(-3.95, 0.015, 0.015, 0.0), (-3.60, 0.08, 0.08, 0.0), (-3.00, 0.18, 0.18, 0.0), (-2.30, 0.28, 0.29, 0.0),
                  (-1.50, 0.32, 0.34, 0.0), (-0.50, 0.33, 0.34, 0.0), (0.80, 0.33, 0.33, 0.0), (1.80, 0.31, 0.31, 0.0),
                  (2.70, 0.29, 0.28, 0.0)],
        lomo=[(-1.20, 0.08, 0.05, 0.30), (-0.70, 0.12, 0.08, 0.30), (0.60, 0.10, 0.07, 0.29), (1.80, 0.05, 0.04, 0.26)],
        cabina=((0, 0.31, -1.65), (0.23, 0.25, 0.57)),
        tomas=dict(x0=0.38, yc=0.02, est=[(-1.65, 0.15, 0.18), (-1.30, 0.16, 0.19), (-0.60, 0.13, 0.16), (0.10, 0.07, 0.09), (0.50, 0.03, 0.04)]),
        ala=[(0.0, -0.25, 2.00, 0.07, 0.09), (0.45, 0.07, 1.77, 0.07, 0.09 + 0.45 * td(4)), (2.80, 1.75, 0.55, 0.09, 0.09 + 2.80 * td(4))],
        deriva=[(0.16, 1.55, 1.30, 0.07, 0.0), (1.66, 2.55, 0.45, 0.08, 0.0)],
        estab=[(0.0, 1.925, 0.85, 0.08, 0.09), (1.10, 2.675, 0.40, 0.09, 0.09 + 1.10 * td(4))],
        tobera=dict(z0=2.65, z1=3.10, r=0.28, y=0.0),
        pintura=dict(arriba=['#6a7570', '#5f6a65'], corte=0.5, escala=0.4, panza='#9aa5a0'),
        metal='#454f4b', de_frente=True,
    )
    return M.jet(T, K, S)

# ============================ KC-130 HERCULES — LA CHANCHA ============================
# modelHercules de tools/models/enemies.js, con las mismas medidas (los motores en CH_MOT: es un
# contrato con render/chancha.js, que dibuja las helices encima). El fuselaje es UN loft que se
# REMANGA atras —la panza sube para dejar salir la rampa— en vez de un tubo con un cono girado; la
# pintura (verde con manchones arena, panza gris) y las ventanas de la cabina van pintadas.
CH_MOT = [2.9, 5.9]
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
    _subdiv(loft('fuselaje', [(-7.72, 0.10, 0.10, -0.18), (-7.55, 0.60, 0.58, -0.12), (-7.25, 0.95, 0.92, -0.06),
                              (-6.80, 1.18, 1.15, -0.02), (-6.10, 1.29, 1.28, 0.0), (-4.50, 1.31, 1.30, 0.0),
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
    # LOS PODS DE MANGUERA (Mk 32), colgados del motor interno: lo que la hace CHANCHA
    for sg in (-1, 1):
        x = sg * CH_MOT[0]
        _subdiv(loft('pod', [(-0.75, 0.02, 0.02, 0.10), (-0.30, 0.25, 0.25, 0.10), (1.80, 0.30, 0.30, 0.10),
                             (2.30, 0.17, 0.17, 0.10)], raiz, gris, n=12, expo=2.0, cerrar=(True, True), x0=x), 1)
        disco('boca_pod', (x, 0.10, 2.31), 0.12, raiz, negro)
        caja('pilon_pod', (x, 0.62, 0.90), (0.13, 0.90, 0.80), raiz, gondola)
    return raiz
