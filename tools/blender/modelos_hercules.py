# EL HERCULES BOMBARDERO — el TC-68 jugable (16/10/2026, el autor: "quiero agregar al Hercules como
# jugable en POR LA PATRIA y CICLO DE MUERTE… este Hercules modificado llevaba hasta 12 bombas de 250 kg
# o 6 de 500 kg"). Es OTRO MODELO, hecho a partir de la Chancha (modelos_enemigos.hercules), que queda
# como esta: es la original y la sigue horneando hojas.py.
#
# Lo que cambia contra la Chancha, segun las fotos del TC-68 que mando el autor:
#   · SIN LOS PODS DE MANGUERA: el TC-68 era un C-130H de transporte, no un KC-130
#   · LOS DOS AFUSTES SUBALARES (Aviacionline / the48ers: "dos afustes subalares", "un portabombas multiple
#     MER, de seis bombas de 250 kg"): un pilon LARGO bajo la raiz del ala, pegado al fuselaje, que baja
#     hasta media altura del casco, y de el un MER con dos triples (adelante y atras) — 6 por lado, 12 en
#     total. La otra carga, 6 de 500 kg: un triple por lado. Grises con el anillo amarillo, como en la foto
#   · la PINTURA de la foto de la plataforma: verde oscuro y arena arriba, la panza gris clara
#   · las HELICES: en la Chancha las dibuja el juego (render/chancha.js); aca van horneadas, cuatro palas
#
# LAS PROPORCIONES SON LAS DEL C-130H (29,8 m de largo, 40,4 de envergadura, 11,7 de alto): las de la
# Chancha, que ya las respetaba. (La primera version engordaba el fuselaje para que se leyera en el cuadro
# de un caza y quedo "una garrafa de gas con alas": el autor la rechazo.) Lo que lo hace legible es el
# TAMAÑO: se hornea al DOBLE de resolucion (hornear_todo.py, PX) y el juego lo dibuja al doble que un caza
# (data/planes.js `escala`). ESCALA lo acomoda en el encuadre de la camara de los cazas.
#
# Espacio de three: y arriba, nariz hacia -z.
import importlib.util, math, os
from mathutils import Matrix

AQUI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('modelos_bl_base_h', os.path.join(AQUI, 'modelos.py'))
M = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(M)
loft, superficie, elipsoide, disco, caja, _subdiv, mat_pintura, bomba = (M.loft, M.superficie, M.elipsoide, M.disco, M.caja,
                                                                          M._subdiv, M.mat_pintura, M.bomba)
td = lambda g: math.tan(math.radians(g))

ESCALA = 0.36            # envergadura 2 x 11 x 0,36 ≈ 8 (el A-4: 5,1)
BOMBA_K = 1.3            # las bombas apenas mas grandes que las de verdad (BRP-250: 2 m x 0,33)
GORDO, CUERDA, GONDOLA = 1.0, 1.0, 1.0     # sin exagerar: la celula es la de verdad
CH_MOT = [2.9, 5.9]      # los motores donde los tiene la Chancha
# EL RACK: la viga sale del costado del fuselaje (x) a la altura (y), y los triples cuelgan en z
# EL AFUSTE: el pilon cuelga del ala en (RACK_X) y baja hasta el MER, a la altura RACK_Y (la mitad del casco)
RACK_X, RACK_Y = 2.00, 0.10
RACK_Z_250 = (-1.75, -0.45)    # el MER: dos triples por lado, adelante y atras
RACK_Z_500 = (-1.10,)          # un triple por lado

def _texto(cuerpo, raiz, K, sg, z, y, alto, x):
    """Letras pintadas al costado del fuselaje (una curva de texto de Blender, apenas en relieve). Se leen
    de punta a punta de cada lado: a la derecha avanzan hacia la trompa, a la izquierda hacia la cola."""
    import bpy
    cu = bpy.data.curves.new('texto', 'FONT'); cu.body = cuerpo; cu.size = alto
    cu.align_x = 'CENTER'; cu.align_y = 'CENTER'; cu.extrude = 0.004
    cu.materials.append(K['mat_cel']('letras', '#121416'))
    # pasada a MALLA: el horno solo sabe tapar (holdout) y medir mallas
    tmp = bpy.data.objects.new('letras_tmp', cu)
    bpy.context.scene.collection.objects.link(tmp)
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(tmp)
    ob = bpy.data.objects.new('letras', me)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = raiz
    ob.rotation_euler = (0, sg * math.pi / 2, 0)
    ob.location = (sg * x, y, z)
    return ob

def _raiz(T):
    import bpy
    r = bpy.data.objects.new('Hercules bombardero', None)
    bpy.context.scene.collection.objects.link(r)
    r.parent = T
    return r

def _anota(raiz, lista):
    n0 = set(o.name for o in raiz.children)
    return lambda: lista.extend(o for o in raiz.children if o.name not in n0)

def _triple(nombre, raiz, x, z, r, largo, cu, an, co, viga):
    """Un lanzador TRIPLE: la viga corta y tres bombas — dos arriba, lado a lado, y una debajo."""
    y0 = RACK_Y - 0.08
    caja(nombre + '_mer', (x, y0, z), (r * 1.4, 0.08, largo * 0.85), raiz, viga)
    for i, (dx, dy) in enumerate(((-r * 1.05, -r * 1.05), (r * 1.05, -r * 1.05), (0, -r * 2.95))):
        bomba('%s%d' % (nombre, i), (x + dx, y0 + dy, z), r, largo, raiz, cu, an, co)

def hercules_bombardero(T, K):
    raiz = _raiz(T)
    VERDE, ARENA, PANZA, GRIS, NEG = '#46543c', '#8d7c52', '#a9b0ab', '#8e9a95', '#1c221d'
    # LA TROMPA DEL TC-68 (16/10, el autor con la foto: "la trompa es negra encima y no tiene vidrio de
    # cabina?"): el PARABRISAS inclinado, que baja del techo de la cabina hasta el radomo, y las ventanas
    # laterales del puesto de pilotaje, pintados de vidrio sobre la chapa
    VIDRIO = '#25404d'
    piel = mat_pintura(K, 'pintura', dict(arriba=[VERDE, ARENA], corte=0.55, escala=0.20, panza=PANZA, ola=(-0.62, 0.13, 0.95),
                                          marcas=[dict(z=(-7.40, -6.78), y=(0.30, 1.30), color=VIDRIO, arriba=False),     # el parabrisas
                                                  dict(z=(-6.80, -6.20), y=(0.62, 0.98), color=VIDRIO, arriba=False),     # las laterales
                                                  dict(z=(-6.52, -6.46), y=(0.55, 1.05), color=VERDE, arriba=False),     # el parante
                                                  # la PUERTA de la tripulacion, solo a babor, detras de la cabina
                                                  dict(x=(-1.6, -0.9), z=(-6.05, -5.62), y=(-1.05, 0.15), sim=False, color='#23291f', arriba=False)]))
    # LAS ESCARAPELAS arriba de cada ala (celeste, blanco, celeste)
    alas = mat_pintura(K, 'alas', dict(arriba=[VERDE, ARENA], corte=0.58, escala=0.20, panza='#7d8580',
                                       marcas=[dict(disco=(7.6, -0.95, 0.80 * f), color=c)
                                               for f, c in ((1.0, M.CELESTE), (0.66, M.BLANCO), (0.33, M.CELESTE))]))
    # LA BANDERA en lo alto de la deriva (la foto de la plataforma)
    deriva = mat_pintura(K, 'deriva', dict(arriba=[VERDE, ARENA], corte=0.58, escala=0.20, panza='#7d8580'), bandera=(4.45, 5.15))
    gondola = mat_pintura(K, 'gondola', dict(arriba=[VERDE, ARENA], corte=0.55, escala=0.20, panza='#7d8580'))
    gris = K['mat_cel']('gris', GRIS)
    negro = K['mat_cel']('negro', NEG)
    pala = K['mat_cel']('pala', '#2a2e2b')
    # LA CELULA DE LA CHANCHA (modelos_enemigos.hercules), con las mismas medidas
    G = GORDO; ALA_Y = 1.62 * G; dY = ALA_Y - 1.62     # el ala sube con el lomo, y todo lo que cuelga de ella
    fus = lambda est: [(z, w * G, h * G, yc * G) for (z, w, h, yc) in est]
    ala = lambda est: [(e, zle - c * (CUERDA - 1) * 0.35, c * CUERDA, t, d) for (e, zle, c, t, d) in est]
    # LA TROMPA: el fuselaje termina en el aro del radomo (z -7,45), con el techo de la cabina que cae en el
    # parabrisas; adelante, el RADOMO NEGRO, redondo y saliente, un poco por debajo del eje (la "nariz de chancho")
    _subdiv(loft('fuselaje', fus([(-7.48, 0.62, 0.55, -0.22), (-7.30, 0.92, 0.80, -0.12), (-7.00, 1.14, 1.05, -0.06),
                              (-6.70, 1.25, 1.22, -0.01), (-6.10, 1.29, 1.28, 0.0), (-4.50, 1.31, 1.30, 0.0),
                              (2.50, 1.31, 1.30, 0.0), (4.00, 1.29, 1.24, 0.06), (5.40, 1.10, 0.95, 0.38),
                              (6.80, 0.82, 0.64, 0.70), (8.00, 0.48, 0.36, 0.96), (8.70, 0.18, 0.16, 1.06)]),
                 raiz, piel, n=24, expo=2.2, cerrar=(True, True)), 2)
    superficie('deriva', [(1.00 * G, 2.60, 4.60 * CUERDA, 0.10, 0.0), (5.50 * G, 5.10, 2.10 * CUERDA, 0.12, 0.0)], raiz, deriva, eje='y')
    superficie('filete', [(1.05 * G, 0.00, 4.40, 0.06, 0.0), (2.20 * G, 4.10, 0.40, 0.25, 0.0)], raiz, alas, eje='y')
    superficie('estab', ala([(0.0, 4.25, 2.50, 0.11, 1.59 * G), (4.40, 4.85, 1.30, 0.12, 1.59 * G)]), raiz, alas, eje='x', espejo=True)
    superficie('ala', ala([(0.0, -2.15, 3.10, 0.14, ALA_Y), (5.0, -1.99, 2.49, 0.14, ALA_Y + 5.0 * td(1.6)),
                           (11.0, -1.80, 1.75, 0.14, ALA_Y + 11.0 * td(1.6))]), raiz, alas, eje='x', espejo=True)
    radomo = K['mat_cel']('radomo', '#141617')
    _subdiv(loft('radomo', [(-8.12, 0.06, 0.06, -0.30), (-8.02, 0.38, 0.34, -0.28), (-7.82, 0.60, 0.54, -0.25),
                            (-7.60, 0.68, 0.62, -0.23), (-7.44, 0.64, 0.58, -0.22)], raiz, radomo, n=20, expo=2.1,
                 cerrar=(True, True)), 2)
    # LAS LETRAS (16/10, el autor: "faltan etiquetas y bandera argentina"): FUERZA AEREA ARGENTINA en el
    # lomo y la matricula TC-68 en la trompa, de los dos lados, y la escarapela atras de la puerta
    for sg in (-1, 1):
        _texto('FUERZA AEREA ARGENTINA', raiz, K, sg, z=-5.05, y=0.66, alto=0.21, x=1.19)
        _texto('TC-68', raiz, K, sg, z=-6.30, y=-0.25, alto=0.34, x=1.27)
        for f, c in ((1.0, M.CELESTE), (0.66, M.BLANCO), (0.33, M.CELESTE)):
            elipsoide('escarapela', (sg * (1.315 + 0.012 * (1 - f) * 3), -0.05, -4.75), (0.02, 0.28 * f, 0.28 * f), raiz,
                      K['mat_cel']('escarapela_' + c, c), seg=18, anillos=8)
    for sg in (-1, 1):
        _subdiv(loft('carenado%d' % sg, fus([(-3.20, 0.10, 0.10, -0.62), (-2.60, 0.42, 0.52, -0.55), (1.40, 0.42, 0.52, -0.55),
                                             (2.00, 0.10, 0.12, -0.60)]), raiz, piel, n=14, expo=2.6, cerrar=(True, True), x0=sg * 1.20 * G), 1)
    for sg in (-1, 1):
        for mx in CH_MOT:
            x = sg * mx
            gon = lambda est: [(z, w * GONDOLA, h * GONDOLA, yc + dY) for (z, w, h, yc) in est]
            _subdiv(loft('gondola', gon([(-4.00, 0.30, 0.32, 1.05), (-3.80, 0.44, 0.50, 1.03), (-2.40, 0.47, 0.56, 1.00),
                                         (-0.60, 0.42, 0.50, 1.12), (0.50, 0.20, 0.24, 1.30)]),
                         raiz, gondola, n=16, expo=2.2, cerrar=(True, True), x0=x), 1)
            _subdiv(loft('cono', gon([(-4.85, 0.02, 0.02, 1.10), (-4.60, 0.22, 0.22, 1.10), (-4.00, 0.33, 0.33, 1.10)]),
                         raiz, gris, n=12, expo=2.0, cerrar=(True, True), x0=x), 1)
            elipsoide('escape', (x, 0.92 + dY - 0.10, 0.20), (0.24, 0.16, 0.50), raiz, negro, seg=10, anillos=6)
            # LAS HELICES: cuatro palas en X, delante del cono (la Chancha las deja al juego)
            for a in (45, 135):
                p = caja('pala', (0, 0, 0), (2.10, 0.20, 0.06), raiz, pala)
                p.rotation_euler = (0, 0, math.radians(a + (15 if sg > 0 else -15)))
                p.location = (x, 1.10 + dY, -4.62)
    # LA CARGA, cada una en su capa (hornear.py --capa herc_250 | herc_500) y el TREN. Solo si se hornea
    # una capa (o se guarda el .blend): la hoja del avion sale limpia, como la de los cazas
    if K.get('cargas'): K['piezas'] = _carga(raiz, K)
    elif K.get('insignias'):
        # EN EL SELECTOR va CARGADO, con las 12 de 250 kg: es lo que lo hace bombardero
        for ob in _carga(raiz, K)['herc_500'] + []: ob.hide_render = True
    # A LA ESCALA DEL CUADRO DE LOS CAZAS: cada pieza se achica alrededor del origen del modelo
    S = Matrix.Scale(ESCALA, 4)
    for ob in raiz.children:
        ob.matrix_basis = S @ ob.matrix_basis
    return raiz

def _carga(raiz, K):
    piezas = {k: [] for k in ('herc_250', 'herc_500', 'tren')}
    # GRISES CON EL ANILLO AMARILLO, como en la foto del rack (las oliva de los cazas se perdian contra el verde)
    cu, an, co = K['mat_cel']('bomba', '#9aa0a2'), K['mat_cel']('bomba_anillo', '#e0b43a'), K['mat_cel']('bomba_cola', '#e0b43a')
    viga = K['mat_cel']('viga', '#3e463a')
    for capa, zs, r, largo in (('herc_250', RACK_Z_250, 0.09 * BOMBA_K, 1.10 * BOMBA_K), ('herc_500', RACK_Z_500, 0.12 * BOMBA_K, 1.40 * BOMBA_K)):
        f = _anota(raiz, piezas[capa])
        for sg in (-1, 1):
            # el PILON: de la cara de abajo del ala (y 1,42) hasta el MER; y el larguero del MER
            z0, z1 = min(zs) - largo * 0.45, max(zs) + largo * 0.45
            caja('pilon_%s%d' % (capa, sg), (sg * RACK_X, (1.42 + RACK_Y) / 2, (z0 + z1) / 2 - 0.2), (0.14, 1.42 - RACK_Y, 1.60), raiz, viga)
            caja('larguero_%s%d' % (capa, sg), (sg * RACK_X, RACK_Y, (z0 + z1) / 2), (0.16, 0.12, z1 - z0), raiz, viga)
            for z in zs:
                _triple('%s_%d_%d' % (capa, sg, round(z * 10)), raiz, sg * RACK_X, z, r, largo, cu, an, co, viga)
        f()
    # EL TREN: dos ruedas en tandem bajo cada carenado y la doble de proa
    f = _anota(raiz, piezas['tren'])
    goma, llanta, pata = K['mat_cel']('tren_goma', M.TREN_GOMA), K['mat_cel']('tren_llanta', M.TREN_LLANTA), K['mat_cel']('tren_pata', M.TREN_PATA)
    for sg in (-1, 1):
        for z in (-1.70, 0.20):
            x, y = sg * 1.25 * GORDO, -1.25 * GORDO
            caja('tren_pata', (x, -1.00 * GORDO, z), (0.12, 0.40, 0.12), raiz, pata)
            elipsoide('tren_rueda', (x, y, z), (0.22, 0.36, 0.36), raiz, goma, seg=16, anillos=10)
            elipsoide('tren_llanta', (x, y, z), (0.23, 0.18, 0.18), raiz, llanta, seg=12, anillos=8)
    caja('tren_pata', (0, -1.25 * GORDO, -6.30), (0.16, 0.70, 0.16), raiz, pata)
    for sg in (-1, 1):
        elipsoide('tren_rueda', (sg * 0.20, -1.50 * GORDO, -6.30), (0.14, 0.28, 0.28), raiz, goma, seg=16, anillos=10)
    f()
    return piezas
