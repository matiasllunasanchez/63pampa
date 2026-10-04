# LOS HELICOPTEROS BRITANICOS, HECHOS EN BLENDER (4/10/2026). Reemplazan a los de tools/models/helos.js
# que hasta ahora pasaban por el puente tal cual — y arrastraban sus errores: el Sea King era un
# racimo de domos pegados, los sponsons cajas, las palas tablas sueltas. Pedido del autor: "estas
# rediseñando exactamente los mismos diseños pero con Blender, y arrastrando los errores. three.js
# estaba limitado, Blender no".
#
# LO QUE CAMBIA: cada fuselaje es UNA pieza (loft de secciones suavizado) con la forma de su tipo —
# el casco de bote del Sea King, la nariz caida del Wessex, la trompa en cuña del Lynx, la burbuja de
# la Gazelle, la cabina de montantes del Scout—; el vidriado va PINTADO en el fuselaje (no un domo
# encima), los sponsons y las patas tienen forma, las palas son palas (afinadas, con cubo) y el
# barrido del rotor sigue translucido. Las escarapelas son discos de verdad.
#
# LO QUE NO CAMBIA: las MEDIDAS de cada tipo (radio del rotor, largo, alto, donde va cada cosa) son
# las de helos.js — la hoja sale del mismo tamaño, con las mismas 8 vistas x 2 fases del rotor, y el
# juego no se entera. Espacio de three: y arriba, nariz hacia -z. `ph` (0/1) es la fase del rotor.
import importlib.util, math, os

AQUI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('modelos_bl_base_h', os.path.join(AQUI, 'modelos.py'))
M = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(M)
loft, superficie, elipsoide, caja, _subdiv, mat_pintura = M.loft, M.superficie, M.elipsoide, M.caja, M._subdiv, M.mat_pintura

CANOPY = '#8fd0e0'
PALA, CUBO, GOMA = '#22272a', '#3a403d', '#191d18'
VIDRIO_OSC = '#2b4552'          # las ventanas laterales de la cabina de carga: vidrio en sombra

def _raiz(T, nombre):
    import bpy
    r = bpy.data.objects.new(nombre, None)
    bpy.context.scene.collection.objects.link(r)
    r.parent = T
    return r

def _pieza(nombre, raiz, mat, dims, lugar, giro=(0, 0, 0)):
    """Una caja armada en el ORIGEN y despues ubicada y girada (girar una caja ya corrida la haria
    orbitar alrededor del origen del modelo)."""
    ob = caja(nombre, (0, 0, 0), dims, raiz, mat)
    ob.rotation_euler = giro
    ob.location = lugar
    if nombre.startswith('pala'):
        # LAS PALAS NO HACEN SOMBRA: en un cuadro quieto la sombra de una pala sobre el fuselaje es
        # una raya oscura que se lee como pintura
        ob.visible_shadow = False
    return ob

# ============================ LAS PIEZAS COMUNES ============================
def rotor(raiz, K, r, n, y, z, ph, cuerda=0.17):
    """EL ROTOR PRINCIPAL: mastil, cubo, `n` palas AFINADAS hacia la punta (dos tramos) y el barrido
    translucido. `ph` alterna el angulo de las palas: dos fases = el rotor BATE."""
    pala, cubo = K['mat_cel']('pala', PALA), K['mat_cel']('cubo', CUBO)
    elipsoide('cubo', (0, y - 0.04, z), (0.22, 0.10, 0.22), raiz, cubo, seg=12, anillos=6)
    elipsoide('eje', (0, y - 0.22, z), (0.09, 0.20, 0.09), raiz, cubo, seg=8, anillos=6)
    for i in range(n):
        a = (math.pi / n if ph else 0) + i * 2 * math.pi / n
        for (f0, f1, c) in ((0.06, 0.55, cuerda), (0.55, 1.0, cuerda * 0.8)):
            L = (f1 - f0) * r
            _pieza('pala', raiz, pala, (c, 0.035, L), (math.sin(a) * r * (f0 + f1) / 2, y + 0.01, z + math.cos(a) * r * (f0 + f1) / 2), (0, a, 0))
    # EL BARRIDO: el disco que dibujan las palas al girar, translucido como en el juego
    m = K['mat_cel']('barrido', '#aeb6ae')
    K['translucido'](m, 0.16)
    ob = elipsoide('barrido', (0, y, z), (r, 0.015, r), raiz, m, seg=28, anillos=4)
    ob.visible_shadow = False
    return ob

def rotor_cola(raiz, K, r, n, x, y, z, ph):
    """Palas en el plano VERTICAL, al costado de la deriva, con su cubo."""
    pala, cubo = K['mat_cel']('pala_cola', PALA), K['mat_cel']('cubo_cola', CUBO)
    elipsoide('cubo_cola', (x, y, z), (0.07, 0.07, 0.07), raiz, cubo, seg=8, anillos=6)
    for i in range(n):
        a = (math.pi / n if ph else 0) + i * 2 * math.pi / n
        _pieza('pala_cola', raiz, pala, (0.03, r, 0.10), (x + 0.03, y + math.cos(a) * r / 2, z + math.sin(a) * r / 2), (a, 0, 0))

def rueda(raiz, K, x, y, z, r, ancho):
    elipsoide('rueda', (x, y, z), (ancho / 2, r, r), raiz, K['mat_cel']('goma', GOMA), seg=14, anillos=8)
    elipsoide('llanta', (x + math.copysign(ancho * 0.3, x or 1), y, z), (ancho * 0.25, r * 0.45, r * 0.45), raiz, K['mat_cel']('llanta', '#4a514c'), seg=10, anillos=6)

def escarapela(raiz, K, x, y, z, r):
    """La escarapela de la RAF a los DOS costados: azul, blanco, rojo — tres discos apilados."""
    for sg in (-1, 1):
        for i, (c, f) in enumerate((('#2d4a8a', 1.0), ('#e8e6e0', 0.66), ('#b8302a', 0.33))):
            elipsoide('escarapela', (sg * (x + 0.006 * i), y, z), (0.008, r * f, r * f), raiz, K['mat_cel']('esc%d' % i, c), seg=16, anillos=8)

def patines(raiz, K, x, y, z0, z1, color):
    """Los patines: el tubo con la punta levantada y dos montantes por lado."""
    m = K['mat_cel']('patin', color)
    for sg in (-1, 1):
        _subdiv(loft('patin', [(z0 - 0.15, 0.03, 0.03, y + 0.14), (z0, 0.045, 0.045, y + 0.02), (z0 + 0.2, 0.045, 0.045, y),
                               (z1, 0.045, 0.045, y), (z1 + 0.05, 0.03, 0.03, y + 0.01)], raiz, m, n=8, cerrar=(True, True), x0=sg * x), 1)
        for zz in (z0 + 0.3, z1 - 0.3):
            _pieza('montante', raiz, m, (0.05, 0.42, 0.06), (sg * (x - 0.07), y + 0.2, zz), (0, 0, sg * 0.3))

def deriva(raiz, mat, y0, y1, z0, cuerda0, z1, cuerda1, grosor=0.12):
    return superficie('deriva', [(y0, z0, cuerda0, grosor, 0.0), (y1, z1, cuerda1, grosor, 0.0)], raiz, mat, eje='y')

# ============================ SEA KING ============================
# EL GRANDE: casco de BOTE (anfibio de verdad: la panza es una quilla con los sponsons de flotacion a
# los costados, y ahi van las ruedas), los dos motores en el lomo, el radomo del radar, el botalon
# que sube y rotor de cinco palas. Gris azulado de la Royal Navy. `verde`: el HC.4 de los comandos.
def seaKing(T, K, ph='0', verde=False):
    ph = int(ph)
    exterior = _raiz(T, 'Sea King')
    raiz = exterior
    if verde:
        # en la hoja chica (64x48) el Sea King entero no entra: el de siempre era mas corto. Se achica
        # el MODELO (el tamaño en pantalla lo pone el `wu` sobre el ancho del contenido, no cambia)
        import bpy
        raiz = bpy.data.objects.new('escala', None)
        bpy.context.scene.collection.objects.link(raiz)
        raiz.parent = exterior; raiz.scale = (0.85, 0.85, 0.85)
    if verde:
        P = dict(arriba=['#5b6d55'], panza='#46543f')
    else:
        P = dict(arriba=['#56626d'], panza='#454f58')        # liso: la Armada no camuflaba
    P['marcas'] = [dict(z=(-3.02, -2.62), y=(0.10, 0.62), color=CANOPY, arriba=False),          # el parabrisas
                   dict(z=(-2.55, -2.15), y=(0.30, 0.62), x=(0.55, 1.2), color=CANOPY, arriba=False),  # las ventanillas de cabina
                   dict(z=(-1.35, -1.05), y=(0.08, 0.40), x=(0.6, 1.2), color=VIDRIO_OSC, arriba=False),
                   dict(z=(-0.55, -0.25), y=(0.08, 0.40), x=(0.6, 1.2), color=VIDRIO_OSC, arriba=False)]
    piel = mat_pintura(K, 'pintura', P)
    oscuro = K['mat_cel']('oscuro', '#2f363c')
    # EL CASCO: seccion cuadrada (expo alto), la nariz redonda, el lomo alto, y la cola que se afina
    # SUBIENDO hacia el botalon (la quilla del bote es la linea de abajo)
    _subdiv(loft('fuselaje', [(-3.20, 0.10, 0.10, -0.08), (-3.05, 0.48, 0.44, -0.04), (-2.75, 0.76, 0.70, 0.02),
                              (-2.30, 0.92, 0.88, 0.07), (-1.50, 0.97, 0.94, 0.10), (0.20, 0.97, 0.94, 0.10),
                              (1.00, 0.88, 0.82, 0.18), (1.60, 0.62, 0.56, 0.38), (2.30, 0.38, 0.34, 0.58),
                              (3.30, 0.25, 0.24, 0.74), (4.05, 0.21, 0.21, 0.80)],
                 raiz, piel, n=20, expo=3.0, cerrar=(True, True)), 2)
    # los dos motores en el lomo, en un carenado, y el radomo detras del rotor
    _subdiv(loft('motores', [(-2.05, 0.05, 0.05, 0.98), (-1.80, 0.50, 0.26, 1.02), (-0.10, 0.52, 0.28, 1.04),
                             (0.40, 0.30, 0.18, 1.00), (0.70, 0.05, 0.05, 0.98)], raiz, piel, n=14, expo=2.4, cerrar=(True, True)), 1)
    for sg in (-1, 1):
        elipsoide('escape', (sg * 0.45, 1.05, 0.38), (0.10, 0.09, 0.18), raiz, oscuro, seg=10, anillos=6)
    elipsoide('radomo', (0, 1.12, 0.70), (0.45, 0.24, 0.45), raiz, K['mat_cel']('radomo', '#8f979e'), seg=18, anillos=8)
    # LOS SPONSONS de flotacion, con la rueda abajo
    for sg in (-1, 1):
        _subdiv(loft('sponson', [(-0.90, 0.04, 0.04, -0.36), (-0.70, 0.22, 0.16, -0.38), (0.25, 0.24, 0.17, -0.38),
                                 (0.55, 0.05, 0.05, -0.34)], raiz, piel, n=12, expo=2.4, cerrar=(True, True), x0=sg * 1.08), 1)
        rueda(raiz, K, sg * 1.10, -0.70, -0.25, 0.22, 0.16)
    # LA COLA: deriva (con la punta en flecha), el estabilizador chico a un costado y el rotor de cola
    deriva(raiz, piel, 0.60, 1.85, 3.55, 0.85, 3.95, 0.48, 0.14)
    superficie('estab', [(0.10, 3.70, 0.40, 0.12, 1.20), (0.75, 3.80, 0.30, 0.12, 1.22)], raiz, piel, eje='x')
    rotor_cola(raiz, K, 0.62, 5, 0.18, 1.45, 4.00, ph)
    _pieza('pata_cola', raiz, oscuro, (0.07, 0.75, 0.07), (0, 0.15 - 0.62, 3.10))
    rueda(raiz, K, 0, -0.55, 3.10, 0.16, 0.12)
    escarapela(raiz, K, 0.965, 0.40, 0.25, 0.28)
    rotor(raiz, K, 3.0, 5, 1.6, -0.6, ph)
    return exterior

def seaKingVerde(T, K, ph='0'):
    """EL HELICOPTERO DE SIEMPRE (`helo`): el Sea King HC.4 de los comandos, verde."""
    return seaKing(T, K, ph, verde=True)

# ============================ WESSEX ============================
# LA NARIZ CAIDA: el motor va adelante, en una trompa larga que baja, y la cabina de los pilotos
# queda TREPADA arriba y atras — un perro olfateando. Verde oscuro de los comandos.
def wessex(T, K, ph='0'):
    ph = int(ph)
    raiz = _raiz(T, 'Wessex')
    piel = mat_pintura(K, 'pintura', dict(arriba=['#3f5b3f'], panza='#304630',
                                          marcas=[dict(z=(-0.25, 0.15), y=(0.05, 0.45), x=(0.7, 1.2), color=VIDRIO_OSC, arriba=False),
                                                  dict(z=(0.45, 0.85), y=(0.05, 0.45), x=(0.7, 1.2), color=VIDRIO_OSC, arriba=False)]))
    vidrio = K['mat_cel']('vidrio', CANOPY, brillo=True)
    oscuro = K['mat_cel']('oscuro', '#20251f')
    _subdiv(loft('fuselaje', [(-2.60, 0.10, 0.10, -0.50), (-2.45, 0.40, 0.36, -0.46), (-2.05, 0.60, 0.54, -0.36),
                              (-1.55, 0.72, 0.68, -0.20), (-1.00, 0.86, 0.86, -0.02), (-0.40, 0.95, 0.98, 0.12),
                              (0.60, 0.95, 0.96, 0.14), (1.35, 0.80, 0.78, 0.22), (1.90, 0.52, 0.48, 0.40),
                              (2.60, 0.32, 0.28, 0.56), (3.55, 0.22, 0.20, 0.70), (3.90, 0.18, 0.18, 0.72)],
                 raiz, piel, n=20, expo=2.6, cerrar=(True, True)), 2)
    # LA CABINA TREPADA: una joroba sobre la nariz, con el parabrisas
    _subdiv(loft('cabina', [(-1.65, 0.08, 0.05, 0.45), (-1.40, 0.50, 0.32, 0.58), (-0.80, 0.56, 0.42, 0.72),
                            (-0.20, 0.46, 0.36, 0.84), (0.25, 0.15, 0.12, 0.92)], raiz, piel, n=14, expo=2.4, cerrar=(True, True)), 1)
    elipsoide('parabrisas', (0, 0.80, -1.18), (0.50, 0.30, 0.34), raiz, vidrio, seg=18, anillos=10)
    for sg in (-1, 1):
        elipsoide('escape', (sg * 0.60, -0.10, -1.25), (0.10, 0.11, 0.26), raiz, oscuro, seg=10, anillos=6)
        _pieza('pata', raiz, oscuro, (0.07, 0.55, 0.07), (sg * 0.80, -0.68, -0.40), (0, 0, sg * 0.25))
        rueda(raiz, K, sg * 0.86, -0.95, -0.40, 0.22, 0.16)
    deriva(raiz, piel, 0.55, 1.60, 3.30, 0.75, 3.62, 0.42, 0.14)
    rotor_cola(raiz, K, 0.55, 4, 0.16, 1.30, 3.70, ph)
    _pieza('pata_cola', raiz, oscuro, (0.08, 0.80, 0.08), (0, 0.05, 3.30))
    rueda(raiz, K, 0, -0.35, 3.30, 0.14, 0.10)
    escarapela(raiz, K, 0.955, 0.25, 0.40, 0.27)
    rotor(raiz, K, 2.7, 4, 1.4, -0.25, ph)
    return raiz

# ============================ SEA LYNX ============================
# CHICO Y COMPACTO: la trompa en CUÑA con el vidriado grande, la cabina corta, la deriva ALTA con el
# estabilizador arriba y tren de triciclo. Azul de la flota.
def seaLynx(T, K, ph='0'):
    ph = int(ph)
    raiz = _raiz(T, 'Sea Lynx')
    piel = mat_pintura(K, 'pintura', dict(arriba=['#4d6280'], panza='#3e5069',
                                          marcas=[dict(z=(-2.00, -1.35), y=(-0.05, 0.62), color=CANOPY, arriba=False),
                                                  dict(z=(-0.75, -0.25), y=(0.05, 0.45), x=(0.55, 1.0), color=VIDRIO_OSC, arriba=False)]))
    oscuro = K['mat_cel']('oscuro', '#262d36')
    _subdiv(loft('fuselaje', [(-2.08, 0.08, 0.08, -0.32), (-1.88, 0.36, 0.30, -0.26), (-1.50, 0.58, 0.52, -0.12),
                              (-1.00, 0.72, 0.72, 0.03), (-0.30, 0.75, 0.76, 0.07), (0.40, 0.70, 0.70, 0.09),
                              (0.90, 0.50, 0.48, 0.22), (1.40, 0.30, 0.28, 0.35), (2.45, 0.20, 0.18, 0.40),
                              (3.05, 0.16, 0.15, 0.42)], raiz, piel, n=20, expo=2.7, cerrar=(True, True)), 2)
    _subdiv(loft('motores', [(-0.65, 0.05, 0.05, 0.74), (-0.45, 0.42, 0.20, 0.80), (0.40, 0.40, 0.20, 0.80),
                             (0.75, 0.06, 0.06, 0.74)], raiz, piel, n=14, expo=2.4, cerrar=(True, True)), 1)
    deriva(raiz, piel, 0.35, 1.50, 2.70, 0.70, 2.95, 0.42, 0.14)
    superficie('estab', [(0.0, 2.95, 0.36, 0.12, 1.22), (0.55, 3.02, 0.26, 0.12, 1.22)], raiz, piel, eje='x', espejo=True)
    rotor_cola(raiz, K, 0.48, 4, 0.15, 1.05, 3.10, ph)
    rueda(raiz, K, 0, -0.78, -1.25, 0.15, 0.11)
    _pieza('pata_nariz', raiz, oscuro, (0.06, 0.40, 0.06), (0, -0.55, -1.25))
    for sg in (-1, 1):
        rueda(raiz, K, sg * 0.72, -0.78, 0.25, 0.19, 0.13)
        _pieza('pata', raiz, oscuro, (0.06, 0.35, 0.30), (sg * 0.66, -0.55, 0.25))
    escarapela(raiz, K, 0.745, 0.15, 0.10, 0.23)
    rotor(raiz, K, 2.03, 4, 1.2, -0.3, ph, cuerda=0.15)
    return raiz

# ============================ GAZELLE ============================
# LA BURBUJA: el frente es todo vidrio, y atras el cuerpo chico, el motor al aire, el botalon flaco y
# el FENESTRON (el rotor de cola metido adentro de la deriva). Camuflado verde y negro del Ejercito.
def gazelle(T, K, ph='0'):
    ph = int(ph)
    raiz = _raiz(T, 'Gazelle')
    piel = mat_pintura(K, 'pintura', dict(arriba=['#4c5b3b', '#25291f'], corte=0.58, escala=0.9, panza='#3c4930'))
    vidrio = K['mat_cel']('vidrio', CANOPY, brillo=True)
    oscuro = K['mat_cel']('oscuro', '#25291f')
    # LA BURBUJA: alta y AFINADA hacia la trompa (no una bola), apoyada sobre la panza del morro
    _subdiv(loft('burbuja', [(-1.20, 0.06, 0.06, 0.02), (-1.08, 0.30, 0.34, 0.10), (-0.85, 0.44, 0.50, 0.17),
                             (-0.50, 0.50, 0.56, 0.20), (-0.15, 0.50, 0.55, 0.18), (0.05, 0.46, 0.50, 0.15)],
                 raiz, vidrio, n=18, expo=2.2, cerrar=(True, True)), 2)
    _subdiv(loft('morro', [(-1.10, 0.06, 0.04, -0.22), (-0.95, 0.34, 0.16, -0.24), (-0.50, 0.46, 0.20, -0.26),
                           (-0.10, 0.48, 0.22, -0.24)], raiz, piel, n=14, expo=2.4, cerrar=(True, True)), 1)
    _pieza('montante', raiz, oscuro, (0.05, 0.06, 1.05), (0, 0.66, -0.55), (0.30, 0, 0))
    _subdiv(loft('fuselaje', [(-0.55, 0.40, 0.46, 0.08), (-0.15, 0.52, 0.55, 0.12), (0.40, 0.50, 0.52, 0.15),
                              (0.85, 0.32, 0.30, 0.25), (1.30, 0.17, 0.16, 0.30), (2.70, 0.11, 0.11, 0.34)],
                 raiz, piel, n=18, expo=2.3, cerrar=(True, True)), 2)
    _subdiv(loft('motor', [(-0.05, 0.05, 0.05, 0.62), (0.10, 0.26, 0.17, 0.66), (0.75, 0.24, 0.16, 0.66),
                           (1.00, 0.10, 0.08, 0.62)], raiz, oscuro, n=12, expo=2.4, cerrar=(True, True)), 1)
    # la deriva con el FENESTRON: el aro oscuro en el medio, a los dos lados
    deriva(raiz, piel, -0.05, 1.00, 2.45, 0.80, 2.80, 0.50, 0.16)
    elipsoide('fenestron', (0, 0.40, 2.85), (0.075, 0.25, 0.25), raiz, oscuro, seg=16, anillos=8)
    superficie('estab', [(0.0, 2.35, 0.30, 0.12, 0.16), (0.48, 2.40, 0.24, 0.12, 0.16)], raiz, piel, eje='x', espejo=True)
    patines(raiz, K, 0.52, -0.62, -1.0, 0.8, '#25291f')
    rotor(raiz, K, 1.67, 3, 1.0, -0.05, ph, cuerda=0.13)
    return raiz

# ============================ SCOUT ============================
# EL MAS CHICO: la cabina de montantes (vidrio con marcos), el motor AL AIRE atras de la cabina, el
# botalon fino y los patines. Verde oliva del Ejercito.
def scout(T, K, ph='0'):
    ph = int(ph)
    raiz = _raiz(T, 'Scout')
    piel = mat_pintura(K, 'pintura', dict(arriba=['#56613f'], panza='#444d33'))
    vidrio = K['mat_cel']('vidrio', CANOPY, brillo=True)
    oscuro = K['mat_cel']('oscuro', '#23271d')
    _subdiv(loft('fuselaje', [(-1.15, 0.10, 0.10, -0.08), (-0.98, 0.40, 0.42, -0.04), (-0.60, 0.52, 0.52, -0.02),
                              (-0.10, 0.53, 0.52, -0.02), (0.35, 0.45, 0.42, 0.04), (0.65, 0.20, 0.18, 0.14),
                              (1.20, 0.13, 0.12, 0.15), (2.50, 0.10, 0.10, 0.16)], raiz, piel, n=18, expo=2.6, cerrar=(True, True)), 2)
    elipsoide('cabina', (0, 0.16, -0.62), (0.50, 0.48, 0.52), raiz, vidrio, seg=20, anillos=12)
    for z in (-0.95, -0.55):                                   # LOS MONTANTES del vidrio
        _pieza('montante', raiz, oscuro, (1.02, 0.05, 0.05), (0, 0.55, z))
        for sg in (-1, 1): _pieza('montante', raiz, oscuro, (0.05, 0.6, 0.05), (sg * 0.47, 0.22, z))
    # EL MOTOR AL AIRE: el bloque, los caños y el escape, sobre el lomo y detras de la cabina
    _subdiv(caja('motor', (0, 0.55, 0.40), (0.48, 0.38, 0.90), raiz, K['mat_cel']('motor', '#444d33')), 1)
    elipsoide('escape', (0, 0.58, 0.98), (0.11, 0.11, 0.22), raiz, oscuro, seg=10, anillos=6)
    for sg in (-1, 1):
        _pieza('cano', raiz, oscuro, (0.05, 0.05, 0.75), (sg * 0.26, 0.48, 0.42))
    deriva(raiz, piel, 0.10, 0.70, 2.30, 0.45, 2.48, 0.30, 0.14)
    rotor_cola(raiz, K, 0.42, 2, 0.10, 0.48, 2.60, ph)
    patines(raiz, K, 0.50, -0.62, -0.9, 0.6, '#23271d')
    rotor(raiz, K, 1.56, 4, 0.9, -0.3, ph, cuerda=0.13)
    return raiz
