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
def seaKing(T, K, ph='0', verde=False, roto=False):
    """`roto` (el resto, tools/blender/modelos_restos.py): el botalon cortado a un tercio, sin cola
    ni rotor — esas piezas las tira el resto por separado."""
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
    # LAS VENTANAS de la cabina de carga: la FILA de ventanillas cuadradas a los dos costados (15/10)
    P['marcas'] = [dict(z=(z0, z0 + 0.26), y=(0.12, 0.40), x=(0.6, 1.2), color=VIDRIO_OSC, arriba=False)
                   for z0 in (-1.55, -1.05, -0.55, -0.05, 0.45)]
    # EL PARABRISAS pintado sobre la pendiente ALTA de la trompa (la trompa maciza queda abajo), con sus
    # PARANTES: el del medio y dos a los costados — cuatro paños, como el de verdad
    P['marcas'] = [dict(z=(-3.10, -2.38), y=(0.36, 0.95), color=CANOPY, arriba=False)] + P['marcas'] + [
        dict(z=(-3.10, -2.38), y=(0.36, 0.95), x=(-0.025, 0.025), sim=False, color='#2f363c', arriba=False),
        dict(z=(-3.10, -2.38), y=(0.36, 0.95), x=(0.40, 0.44), color='#2f363c', arriba=False),
        dict(z=(-3.10, -2.38), y=(0.34, 0.38), color='#2f363c', arriba=False)]
    piel = mat_pintura(K, 'pintura', P)
    oscuro = K['mat_cel']('oscuro', '#2f363c')
    vidrio = K['mat_cel']('vidrio', CANOPY, brillo=True)
    # EL FRENTE (15/10, "mas fiel"): el parabrisas va pintado en la trompa (ver las marcas, arriba) y aca
    # las VENTANILLAS de los pilotos, enmarcadas, a los costados de la cabina
    for sg in (-1, 1):
        _pieza('ventanilla', raiz, vidrio, (0.03, 0.34, 0.50), (sg * 0.955, 0.42, -2.42))
        _pieza('marco_vt', raiz, oscuro, (0.035, 0.36, 0.04), (sg * 0.96, 0.42, -2.42))
    # EL CASCO: seccion cuadrada (expo alto), la nariz redonda, el lomo alto, y la cola que se afina
    # SUBIENDO hacia el botalon (la quilla del bote es la linea de abajo)
    est = [(-3.20, 0.10, 0.10, -0.08), (-3.05, 0.48, 0.44, -0.04), (-2.75, 0.76, 0.70, 0.02),
           (-2.30, 0.92, 0.88, 0.07), (-1.50, 0.97, 0.94, 0.10), (0.20, 0.97, 0.94, 0.10),
           (1.00, 0.88, 0.82, 0.18), (1.60, 0.62, 0.56, 0.38), (2.30, 0.38, 0.34, 0.58),
           (3.30, 0.25, 0.24, 0.74), (4.05, 0.21, 0.21, 0.80)]
    if roto: est = est[:8] + [(1.85, 0.52, 0.47, 0.45)]
    _subdiv(loft('fuselaje', est, raiz, piel, n=20, expo=3.0, cerrar=(True, True)), 2)
    # los dos motores en el lomo, en un carenado, y el radomo detras del rotor
    _subdiv(loft('motores', [(-2.05, 0.05, 0.05, 0.98), (-1.80, 0.50, 0.26, 1.02), (-0.10, 0.52, 0.28, 1.04),
                             (0.40, 0.30, 0.18, 1.00), (0.70, 0.05, 0.05, 0.98)], raiz, piel, n=14, expo=2.4, cerrar=(True, True)), 1)
    for sg in (-1, 1):
        elipsoide('escape', (sg * 0.45, 1.05, 0.38), (0.10, 0.09, 0.18), raiz, oscuro, seg=10, anillos=6)
        # las TOMAS de los motores, al frente del carenado (15/10)
        elipsoide('toma', (sg * 0.26, 1.02, -1.86), (0.14, 0.13, 0.06), raiz, oscuro, seg=12, anillos=6)
    # EL RADOMO del radar Sea Searcher (14/10, "mas fieles"): la JOROBA grande y chata detras del rotor,
    # la firma del HAS.5 — antes era un botoncito
    # (solo el HAS.5 antisubmarino: el HC.4 verde de los comandos no lleva radar)
    if not verde:
        _subdiv(loft('base_radomo', [(0.30, 0.30, 0.10, 1.04), (0.55, 0.36, 0.12, 1.06), (1.05, 0.34, 0.11, 1.02), (1.30, 0.10, 0.05, 0.98)],
                     raiz, piel, n=12, expo=2.4, cerrar=(True, True)), 1)
        elipsoide('radomo', (0, 1.22, 0.80), (0.62, 0.32, 0.66), raiz, K['mat_cel']('radomo', '#8f979e'), seg=20, anillos=10)
    # LOS SPONSONS de flotacion, con la rueda abajo
    for sg in (-1, 1):
        _subdiv(loft('sponson', [(-0.90, 0.04, 0.04, -0.36), (-0.70, 0.22, 0.16, -0.38), (0.25, 0.24, 0.17, -0.38),
                                 (0.55, 0.05, 0.05, -0.34)], raiz, piel, n=12, expo=2.4, cerrar=(True, True), x0=sg * 1.08), 1)
        rueda(raiz, K, sg * 1.10, -0.70, -0.25, 0.22, 0.16)
    escarapela(raiz, K, 0.965, 0.40, 0.25, 0.28)
    if roto: return exterior
    # LA COLA: deriva (con la punta en flecha), el estabilizador chico a un costado y el rotor de cola
    deriva(raiz, piel, 0.60, 1.85, 3.55, 0.85, 3.95, 0.48, 0.14)
    superficie('estab', [(0.10, 3.70, 0.40, 0.12, 1.20), (0.75, 3.80, 0.30, 0.12, 1.22)], raiz, piel, eje='x')
    rotor_cola(raiz, K, 0.62, 5, 0.18, 1.45, 4.00, ph)
    # la rueda de cola, bajo el arranque del botalon (antes colgaba en el aire, lejos de la cola)
    _pieza('pata_cola', raiz, oscuro, (0.07, 0.80, 0.07), (0, -0.15, 2.10))
    rueda(raiz, K, 0, -0.55, 2.10, 0.16, 0.12)
    rotor(raiz, K, 3.0, 5, 1.6, -0.6, ph)
    return exterior

def seaKingVerde(T, K, ph='0'):
    """EL HELICOPTERO DE SIEMPRE (`helo`): el Sea King HC.4 de los comandos, verde."""
    return seaKing(T, K, ph, verde=True)

# ============================ WESSEX ============================
# LA NARIZ CAIDA: el motor va adelante, en una trompa larga que baja, y la cabina de los pilotos
# queda TREPADA arriba y atras — un perro olfateando. Verde oscuro de los comandos.
def wessex(T, K, ph='0'):
    """EL WESSEX HU.5, REHECHO DE FOTO (15/10/2026, el autor, con una foto de tres cuartos y el perfil
    de Italeri del 874 NAS en Malvinas): la TROMPA ROMA y baja con su tapa oscura adelante —ahi va el
    motor—, desde donde la linea de arriba TREPA empinada hasta la CABINA ALTA de techo plano con el
    parabrisas de varios paños enmarcados; el fuselaje de CAJON con la panza plana, los ESCAPES redondos
    a los costados de la trompa, el tren principal ADELANTE en V y la rueda de cola, el botalon que SUBE
    hasta el pilon de cola con el rotor arriba a babor y el estabilizador a estribor. Verde oliva."""
    ph = int(ph)
    raiz = _raiz(T, 'Wessex')
    piel = mat_pintura(K, 'pintura', dict(arriba=['#4a5a36'], panza='#3c4a2c',
                                          marcas=[dict(z=(-0.25, 0.15), y=(-0.25, 0.20), x=(0.8, 1.2), color=VIDRIO_OSC, arriba=False),
                                                  dict(z=(0.45, 0.85), y=(-0.25, 0.20), x=(0.8, 1.2), color=VIDRIO_OSC, arriba=False),
                                                  dict(z=(-2.80, -2.46), color='#262c22', arriba=False)]))   # la tapa oscura de la trompa
    vidrio = K['mat_cel']('vidrio', CANOPY, brillo=True)
    oscuro = K['mat_cel']('oscuro', '#20251f')
    # EL FUSELAJE de perfil (arriba, abajo) -> estaciones (z, medio ancho, medio alto, centro)
    perfil = [(-2.68, 0.20, -0.36, -0.68), (-2.52, 0.48, -0.10, -0.86), (-2.22, 0.70, 0.15, -0.93), (-1.86, 0.85, 0.38, -0.96),
              (-1.50, 0.92, 0.55, -0.98), (-1.00, 0.97, 0.60, -0.99), (0.00, 0.98, 0.62, -0.99), (0.80, 0.92, 0.60, -0.93),
              (1.40, 0.78, 0.52, -0.70), (2.00, 0.50, 0.48, -0.30), (2.80, 0.30, 0.55, 0.05), (3.55, 0.22, 0.70, 0.35), (3.90, 0.18, 0.76, 0.48)]
    _subdiv(loft('fuselaje', [(z, w, (a - b) / 2, (a + b) / 2) for z, w, a, b in perfil], raiz, piel, n=20, expo=3.2, cerrar=(True, True)), 2)
    # LA CABINA ALTA de techo plano y el carenado del motor detras, hasta el rotor
    # (nace ANCHA y a ras del lomo: la trompa sube y se funde con el FRENTE INCLINADO de la cabina)
    _subdiv(loft('cabina', [(-1.58, 0.70, 0.03, 0.54), (-1.28, 0.72, 0.26, 0.78), (-1.05, 0.74, 0.32, 0.86), (-0.60, 0.74, 0.32, 0.88),
                            (0.10, 0.66, 0.28, 0.86), (0.70, 0.46, 0.18, 0.76), (1.20, 0.10, 0.05, 0.64)],
                 raiz, piel, n=16, expo=3.6, cerrar=(True, True)), 1)
    # EL PARABRISAS: el paño inclinado del frente de la cabina con TRES parantes, y las ventanas laterales
    _pieza('parabrisas', raiz, vidrio, (1.26, 0.46, 0.03), (0, 0.80, -1.46), (0.78, 0, 0))
    for x in (-0.40, 0.0, 0.40):
        _pieza('parante', raiz, oscuro, (0.045, 0.48, 0.05), (x, 0.80, -1.475), (0.78, 0, 0))
    _pieza('marco_sup', raiz, oscuro, (1.28, 0.05, 0.05), (0, 0.99, -1.30))
    for sg in (-1, 1):
        _pieza('ventana', raiz, vidrio, (0.03, 0.26, 0.58), (sg * 0.74, 0.90, -1.02))
        _pieza('marco_v', raiz, oscuro, (0.035, 0.28, 0.04), (sg * 0.745, 0.90, -1.02))
        # los ESCAPES redondos a los costados de la trompa, y su aro
        elipsoide('escape', (sg * 0.80, -0.28, -1.62), (0.10, 0.20, 0.20), raiz, oscuro, seg=14, anillos=8)
        # EL TREN PRINCIPAL adelante: la rueda y su V de patas al costado del fuselaje
        rueda(raiz, K, sg * 0.95, -1.30, -0.85, 0.24, 0.18)
        _pieza('pata', raiz, oscuro, (0.06, 0.62, 0.06), (sg * 0.86, -1.02, -0.98), (0.35, 0, sg * 0.30))
        _pieza('pata', raiz, oscuro, (0.06, 0.62, 0.06), (sg * 0.86, -1.02, -0.70), (-0.35, 0, sg * 0.30))
    # LA RUEDA DE COLA, bajo el arranque del botalon
    _pieza('pata_cola', raiz, oscuro, (0.07, 0.95, 0.07), (0, -0.78, 2.25), (0.25, 0, 0))
    rueda(raiz, K, 0, -1.30, 2.35, 0.14, 0.10)
    # EL PILON DE COLA con el rotor arriba (babor) y el estabilizador (estribor)
    deriva(raiz, piel, 0.55, 1.70, 3.30, 0.75, 3.70, 0.40, 0.14)
    rotor_cola(raiz, K, 0.55, 4, 0.16, 1.40, 3.78, ph)
    _pieza('estabilizador', raiz, piel, (0.62, 0.04, 0.24), (0.36, 1.00, 3.55))
    escarapela(raiz, K, 0.975, -0.10, 0.40, 0.30)
    rotor(raiz, K, 2.7, 4, 1.45, -0.25, ph)
    return raiz

# ============================ SEA LYNX ============================
# CHICO Y COMPACTO: la trompa en CUÑA con el vidriado grande, la cabina corta, la deriva ALTA con el
# estabilizador arriba y tren de triciclo. Azul de la flota.
def seaLynx(T, K, ph='0'):
    ph = int(ph)
    raiz = _raiz(T, 'Sea Lynx')
    # (15/10, "mas fiel") el PARABRISAS partido por sus parantes, las ventanas grandes de las PUERTAS de
    # la cabina, el RADOMO del Sea Spray bajo la trompa, y la ventana de la cabina de carga
    OSC_L = '#262d36'
    piel = mat_pintura(K, 'pintura', dict(arriba=['#4d6280'], panza='#3e5069',
                                          marcas=[dict(z=(-2.00, -1.35), y=(0.02, 0.62), color=CANOPY, arriba=False),
                                                  dict(z=(-1.35, -0.85), y=(0.05, 0.55), x=(0.50, 1.0), color=CANOPY, arriba=False),
                                                  dict(z=(-0.70, -0.25), y=(0.05, 0.45), x=(0.55, 1.0), color=VIDRIO_OSC, arriba=False),
                                                  dict(z=(-2.10, -1.70), y=(-0.60, -0.08), color='#36475e', arriba=False),
                                                  dict(z=(-2.00, -0.85), y=(0.02, 0.62), x=(-0.025, 0.025), sim=False, color=OSC_L, arriba=False),
                                                  dict(z=(-2.00, -1.35), y=(0.02, 0.62), x=(0.42, 0.47), color=OSC_L, arriba=False),
                                                  dict(z=(-1.38, -1.32), y=(0.02, 0.62), x=(0.45, 1.0), color=OSC_L, arriba=False),
                                                  dict(z=(-2.00, -0.85), y=(-0.02, 0.03), color=OSC_L, arriba=False)]))
    oscuro = K['mat_cel']('oscuro', OSC_L)
    _subdiv(loft('fuselaje', [(-2.08, 0.08, 0.08, -0.32), (-1.88, 0.36, 0.30, -0.26), (-1.50, 0.58, 0.52, -0.12),
                              (-1.00, 0.72, 0.72, 0.03), (-0.30, 0.75, 0.76, 0.07), (0.40, 0.70, 0.70, 0.09),
                              (0.90, 0.50, 0.48, 0.22), (1.40, 0.30, 0.28, 0.35), (2.45, 0.20, 0.18, 0.40),
                              (3.05, 0.16, 0.15, 0.42)], raiz, piel, n=20, expo=2.7, cerrar=(True, True)), 2)
    _subdiv(loft('motores', [(-0.65, 0.05, 0.05, 0.74), (-0.45, 0.42, 0.20, 0.80), (0.40, 0.40, 0.20, 0.80),
                             (0.75, 0.06, 0.06, 0.74)], raiz, piel, n=14, expo=2.4, cerrar=(True, True)), 1)
    deriva(raiz, piel, 0.35, 1.50, 2.70, 0.70, 2.95, 0.42, 0.14)
    # el estabilizador va de UN solo lado, a estribor (el rotor de cola, a babor)
    superficie('estab', [(0.10, 2.95, 0.36, 0.12, 1.22), (0.65, 3.02, 0.26, 0.12, 1.22)], raiz, piel, eje='x')
    rotor_cola(raiz, K, 0.48, 4, 0.15, 1.05, 3.10, ph)
    rueda(raiz, K, 0, -0.78, -1.25, 0.15, 0.11)
    _pieza('pata_nariz', raiz, oscuro, (0.06, 0.40, 0.06), (0, -0.55, -1.25))
    for sg in (-1, 1):
        # el tren principal en sus MUÑONES, abiertos hacia afuera, y los escapes de los motores arriba
        _subdiv(loft('munon', [(-0.05, 0.05, 0.05, -0.50), (0.10, 0.16, 0.12, -0.52), (0.45, 0.16, 0.12, -0.52), (0.60, 0.05, 0.05, -0.50)],
                     raiz, piel, n=10, expo=2.4, cerrar=(True, True), x0=sg * 0.78), 1)
        rueda(raiz, K, sg * 0.86, -0.78, 0.25, 0.19, 0.13)
        _pieza('pata', raiz, oscuro, (0.06, 0.30, 0.06), (sg * 0.84, -0.62, 0.25), (0, 0, sg * 0.30))
        elipsoide('escape', (sg * 0.30, 0.86, 0.62), (0.08, 0.07, 0.14), raiz, oscuro, seg=10, anillos=6)
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
