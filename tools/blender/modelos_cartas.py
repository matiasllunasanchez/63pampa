# LOS DIBUJOS DE LAS CARTAS DEL BANCO (18/10/2026, el autor: "mejorar sustancialmente las cartas, mostrando
# algun icono o dibujo diseñado en Blender de la mejora"). Un modelito por carta (o por familia de cartas:
# las tres de MOMENTUM comparten reloj de arena), posado en tres cuartos y ENCUADRADO solo: cada funcion
# arma su objeto, lo gira y `_encuadrar` lo escala y centra para que llene el cuadro de la hoja `cartas`
# (tools/blender/hojas.py). El juego elige el cuadro con src/data/iconos_cartas.js.
#
# Reusa lo que ya esta modelado: el A-4, el Mirage, el Learjet y el Neptune de modelos.py, la Chancha de
# modelos_enemigos.py y el radar de modelos_tierra.py. Lo demas (bombas, espoletas, herramientas…) es nuevo.
#
# Espacio de three: y arriba, x a la derecha, la camara en +z.
import bpy, bmesh, importlib.util, math, os, random
from mathutils import Matrix, Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
def _mod(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(AQUI, archivo))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m
M = _mod('modelos_bl_base_c', 'modelos.py')
B = _mod('modelos_bl_buques_c', 'modelos_buques.py')
loft, elipsoide, caja, disco, _subdiv, _obj = M.loft, M.elipsoide, M.caja, M.disco, M._subdiv, M._obj
columna = B.columna

# la paleta: la del juego (verde oliva, gris naval, laton, el amarillo de las marcas)
OLIVA, OLIVA2 = '#56603a', '#3f4729'
GRIS, GRIS2 = '#8d969b', '#5d666b'
ACERO, ACERO2 = '#a9b2b7', '#6f787c'
LATON, LATON2 = '#c9a043', '#8e6c26'
AMARILLO, ROJO, NARANJA, BLANCO = '#e2b93b', '#b23a2c', '#e0702c', '#e6e2d6'
MADERA, MADERA2 = '#8a6a3e', '#634a2a'
NEGRO = '#22262a'

# ---------------- el marco: raiz (la posa el horno) > pose (la giramos y encuadramos aca) ----------------
def _vacio(padre, nombre):
    e = bpy.data.objects.new(nombre, None)
    bpy.context.scene.collection.objects.link(e)
    e.parent = padre
    return e

def _marco(T, nombre):
    raiz = _vacio(T, 'carta_' + nombre)
    return raiz, _vacio(raiz, 'pose_' + nombre)

def _adoptar(hijo, padre):
    """Un modelo que ya existe (lo arma otra funcion colgado de T) pasa a colgar de la pose."""
    hijo.parent = padre
    return hijo

def _encuadrar(raiz, pose, giro=(0, 0, 0), tam=3.0):
    """Gira la pose (euler XYZ, en el espacio de three) y la escala/centra para que el contenido ocupe
    `tam` en su lado mas largo vista desde la camara (x e y de three)."""
    pose.rotation_euler = giro
    bpy.context.view_layer.update()
    inv = raiz.matrix_world.inverted()
    xs, ys = [], []
    for o in pose.children_recursive:
        if o.type != 'MESH' or o.hide_render: continue
        m = inv @ o.matrix_world
        for v in o.data.vertices:
            p = m @ v.co
            xs.append(p.x); ys.append(p.y)
    if not xs: return raiz
    w, h = max(xs) - min(xs), max(ys) - min(ys)
    s = tam / max(w, h, 1e-6)
    cx, cy = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2
    pose.scale = (s, s, s)
    pose.location = (-cx * s, -cy * s, 0)
    return raiz

def _mat(K, nombre, color):
    return K['mat_cel']('c_' + nombre, color)

def _girar(ob, rx=0, ry=0, rz=0):
    ob.rotation_euler = (rx, ry, rz)
    return ob

def _cil(nombre, padre, mat, est, x=0, z=0, expo=2.0):
    """Un cuerpo vertical por secciones [(y, radio)] — el torno."""
    return columna(nombre, padre, mat, x, z, [(y, r, r) for y, r in est], expo=expo)

def _barra(nombre, padre, mat, a, b, r):
    """Un palito (caja) de `a` a `b`, de grosor `r`."""
    a, b = Vector(a), Vector(b)
    d = b - a
    ob = caja(nombre, (0, 0, 0), (r, d.length, r), padre, mat)
    ob.location = (a + b) / 2
    ob.rotation_mode = 'QUATERNION'
    ob.rotation_quaternion = Vector((0, 1, 0)).rotation_difference(d.normalized())
    return ob

def _texto(nombre, cadena, tam, mat, padre, lugar, giro=(0, 0, 0)):
    cu = bpy.data.curves.new(nombre, 'FONT'); cu.body = cadena; cu.size = tam
    cu.align_x = 'CENTER'; cu.align_y = 'CENTER'; cu.extrude = 0.01
    try:
        cu.font = bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Arial Black.ttf', check_existing=True)
    except Exception:
        pass
    tmp = bpy.data.objects.new(nombre + '_tmp', cu); bpy.context.scene.collection.objects.link(tmp)
    me = bpy.data.meshes.new_from_object(tmp.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(tmp)
    ob = _obj(nombre, me, padre, mat)
    ob.location = lugar; ob.rotation_euler = giro
    return ob

def _bomba(padre, K, nombre, largo=2.4, r=0.26, cuerpo=OLIVA, anillo=AMARILLO, cola=OLIVA2, y=0.0):
    """La bomba de modelos.py (ojiva, anillo de la espoleta y aletas en X), con la nariz hacia -z."""
    return M.bomba(nombre, (0, y, 0), r, largo, padre, _mat(K, nombre + 'c', cuerpo), _mat(K, nombre + 'a', anillo), _mat(K, nombre + 'k', cola))

def _humo(padre, K, puntos, r0, r1, color='#d9dcd8'):
    mat = _mat(K, 'humo', color)
    n = len(puntos)
    for i, p in enumerate(puntos):
        r = r0 + (r1 - r0) * i / max(1, n - 1)
        elipsoide('humo%d' % i, p, (r, r * 0.9, r), padre, mat, seg=10, anillos=6)

def _fogonazo(padre, K, lugar, r=0.35):
    """El destello de boca: una estrella de tres capas de calor."""
    x, y, z = lugar
    for i, (c, k) in enumerate((('#f07a22', 1.0), ('#ffd36a', 0.62), ('#fff4d0', 0.3))):
        m = K['mat_emisivo']('fog%d' % i, c)
        elipsoide('fog%d' % i, (x, y, z), (r * k, r * k, r * k * 1.6), padre, m, seg=8, anillos=5)
        for a in range(4):
            p = _barra('rayo%d_%d' % (i, a), padre, m, (x, y, z),
                       (x + r * 1.9 * k * math.cos(a * math.pi / 2 + 0.4), y + r * 1.9 * k * math.sin(a * math.pi / 2 + 0.4), z - r * 0.4), r * 0.18 * k)

def _avion(T, K, clave, insignias=True):
    K2 = dict(K, insignias=insignias)
    if clave in M.AVIONES_SECUNDARIAS:
        return getattr(M, clave)(T, K2)
    return M.construir(clave, T, K2)

# ============================ ARMAS ============================
def carta_canon(T, K):
    """EL CAÑON: el cajon del mecanismo, el caño largo con su freno de boca y el fogonazo."""
    raiz, p = _marco(T, 'canon')
    acero, oscuro = _mat(K, 'can_a', ACERO2), _mat(K, 'can_o', NEGRO)
    caja('cajon', (0, 0, 0.8), (1.0, 0.7, 1.6), p, _mat(K, 'can_c', GRIS2))
    caja('tapa', (0, 0.4, 0.8), (0.9, 0.1, 1.4), p, _mat(K, 'can_t', GRIS))
    for y in (0.22, -0.22):
        loft('cano', [(-2.2, 0.13, 0.13, y), (0.2, 0.16, 0.16, y)], p, acero, n=12, expo=2.0, cerrar=(True, True))
        loft('freno', [(-2.55, 0.2, 0.2, y), (-2.15, 0.2, 0.2, y)], p, oscuro, n=10, expo=3.0, cerrar=(True, True))
        _fogonazo(p, K, (0, y, -2.8), 0.28)
    caja('cargador', (0.0, -0.6, 1.0), (0.6, 0.5, 0.7), p, _mat(K, 'can_k', OLIVA2))
    return _encuadrar(raiz, p, (0.35, 2.0, 0))

def carta_cinta(T, K):
    """LA CINTA: siete tiros eslabonados, en arco."""
    raiz, p = _marco(T, 'cinta')
    laton, punta, eslabon = _mat(K, 'cin_l', LATON), _mat(K, 'cin_p', ACERO2), _mat(K, 'cin_e', GRIS2)
    for i in range(6):
        a = -0.75 + i * 0.3
        x, z = 1.3 * math.sin(a), 1.3 * math.cos(a) - 1.3
        g = _vacio(p, 'tiro%d' % i); g.location = (x, 0, z); g.rotation_euler = (0, a, 0)
        _cil('vaina', g, laton, [(-0.7, 0.17), (0.25, 0.17), (0.32, 0.14)])
        _cil('bala', g, punta, [(0.32, 0.14), (0.55, 0.13), (0.75, 0.07), (0.85, 0.01)])
        caja('eslabon', (0, -0.3, 0), (0.15, 0.08, 0.28), g, eslabon)
        caja('eslabon2', (0, 0.05, 0), (0.15, 0.08, 0.28), g, eslabon)
    return _encuadrar(raiz, p, (0.45, 0.15, -0.3))

def carta_bala(T, K):
    """LA BALA PERFORANTE: un tiro grande, vaina de laton, nucleo de acero y la banda roja."""
    raiz, p = _marco(T, 'bala')
    _cil('vaina', p, _mat(K, 'bal_l', LATON), [(-1.6, 0.42), (-1.45, 0.46), (-1.35, 0.4), (0.5, 0.4), (0.7, 0.34)])
    _cil('banda', p, _mat(K, 'bal_b', ROJO), [(0.7, 0.35), (0.85, 0.35)])
    _cil('nucleo', p, _mat(K, 'bal_n', ACERO), [(0.85, 0.34), (1.3, 0.32), (1.8, 0.2), (2.15, 0.06), (2.25, 0.0)])
    _cil('culote', p, _mat(K, 'bal_c', LATON2), [(-1.62, 0.2), (-1.58, 0.2)], z=0.0)
    return _encuadrar(raiz, p, (0.25, 0.5, -0.5))

def carta_brp(T, K):
    """LA BRP-250: la bomba con el paracaidas de frenado abierto atras."""
    raiz, p = _marco(T, 'brp')
    _bomba(p, K, 'brp', largo=2.2, r=0.28, cuerpo='#6b7350', anillo=AMARILLO)
    cuerpo, raya = _mat(K, 'par_b', BLANCO), _mat(K, 'par_n', NARANJA)
    # el casquete del paracaidas: gajos blancos y naranja, abierto hacia la bomba
    bm = bmesh.new(); n, anillos, R, H = 12, 5, 1.0, 0.75
    filas = [[bm.verts.new((R * math.sin(t) * math.cos(2 * math.pi * i / n), R * math.sin(t) * math.sin(2 * math.pi * i / n), 2.6 + H * math.cos(t)))
              for i in range(n)] for t in [k * (math.pi / 2) / anillos for k in range(1, anillos + 1)]]
    cima = bm.verts.new((0, 0, 2.6 + H))
    for i in range(n):
        f = bm.faces.new((cima, filas[0][i], filas[0][(i + 1) % n])); f.material_index = i % 2
    for a, b in zip(filas, filas[1:]):
        for i in range(n):
            f = bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i])); f.material_index = i % 2
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('casquete'); bm.to_mesh(me); bm.free()
    me.materials.append(cuerpo); me.materials.append(raya)
    ob = bpy.data.objects.new('casquete', me); bpy.context.scene.collection.objects.link(ob); ob.parent = p
    s = ob.modifiers.new('s', 'SOLIDIFY'); s.thickness = 0.04
    cuerda = _mat(K, 'par_c', '#cfc8b4')
    for i in range(0, n, 2):
        a = 2 * math.pi * i / n
        _barra('cuerda%d' % i, p, cuerda, (0, 0, 1.2), (R * math.cos(a), R * math.sin(a), 2.6), 0.02)
    return _encuadrar(raiz, p, (0.35, 2.2, 0.2))

def carta_snakeye(T, K):
    """LA SNAKEYE: la MK-82 con las cuatro aletas de frenado abiertas en paraguas."""
    raiz, p = _marco(T, 'snakeye')
    _bomba(p, K, 'snk', largo=2.3, r=0.24, cuerpo='#5c6447', anillo=AMARILLO, cola=OLIVA2)
    aleta = _mat(K, 'snk_a', '#6f7756')
    for i in range(4):
        a = math.pi / 4 + i * math.pi / 2
        g = _vacio(p, 'aleta%d' % i); g.location = (0, 0, 1.05); g.rotation_euler = (0, 0, a)
        h = _vacio(g, 'bisagra'); h.location = (0.2, 0, 0); h.rotation_euler = (0, 0.75, 0)
        f = caja('hoja', (0, 0, 0), (0.05, 0.34, 0.9), h, aleta); f.location = (0, 0, 0.45)
    return _encuadrar(raiz, p, (0.4, 2.3, 0.15))

def carta_espoleta(T, K):
    """LA ESPOLETA: rosca de laton, el cuerpo y la helice de armado de la nariz."""
    raiz, p = _marco(T, 'espoleta')
    laton, laton2, acero = _mat(K, 'esp_l', LATON), _mat(K, 'esp_l2', LATON2), _mat(K, 'esp_a', ACERO2)
    for i in range(7):                                                     # la rosca
        _cil('rosca%d' % i, p, laton2 if i % 2 else laton, [(-1.4 + i * 0.14, 0.42 if i % 2 else 0.47), (-1.26 + i * 0.14, 0.42 if i % 2 else 0.47)])
    _cil('cuerpo', p, laton, [(-0.42, 0.55), (0.3, 0.55), (0.9, 0.38), (1.25, 0.2)])
    _cil('anillo', p, _mat(K, 'esp_r', ROJO), [(0.3, 0.56), (0.42, 0.56)])
    _cil('eje', p, acero, [(1.25, 0.06), (1.55, 0.06)])
    for a in (0.0, math.pi):                                                # la helice de armado
        g = _vacio(p, 'pala'); g.location = (0, 1.5, 0); g.rotation_euler = (0, a, 0)
        f = caja('pala', (0.48, 0, 0), (0.45, 0.04, 0.16), g, acero); f.rotation_euler = (0.45, 0, 0)
    return _encuadrar(raiz, p, (0.45, 0.6, -0.55))

def carta_ter(T, K):
    """EL SOPORTE MULTIPLE (TER): la viga con tres bombas, dos en los hombros y una abajo."""
    raiz, p = _marco(T, 'ter')
    caja('viga', (0, 0.42, 0), (0.22, 0.2, 2.4), p, _mat(K, 'ter_v', GRIS2))
    caja('pilon', (0, 0.75, 0.1), (0.1, 0.35, 1.2), p, _mat(K, 'ter_p', GRIS))
    for i, (x, y) in enumerate(((-0.34, 0.02), (0.34, 0.02), (0, -0.28))):
        g = _vacio(p, 'b%d' % i); g.location = (x, y, 0.0 if i < 2 else 0.15)
        _bomba(g, K, 'ter%d' % i, largo=2.0, r=0.2)
    return _encuadrar(raiz, p, (0.35, 2.4, 0))

def carta_exocet(T, K):
    """EL EXOCET AM39: el de modelos.py, con el chorro del motor."""
    raiz, p = _marco(T, 'exocet')
    M.exocet('exo', (0, 0, 0), 0.22, 3.6, p, _mat(K, 'exo_c', '#e1dcc8'), _mat(K, 'exo_a', '#bdb7a2'))
    loft('banda', [(-1.25, 0.225, 0.225, 0), (-1.1, 0.225, 0.225, 0)], p, _mat(K, 'exo_r', ROJO), n=14, cerrar=(False, False))
    for i, (c, r, l) in enumerate((('#f07a22', 0.2, 0.9), ('#ffe6a8', 0.11, 0.5))):
        loft('chorro%d' % i, [(1.8, r, r, 0), (1.8 + l, 0.01, 0.01, 0)], p, K['mat_emisivo']('exo_f%d' % i, c), n=10, cerrar=(True, True))
    _humo(p, K, [(0, 0.05 * i, 2.8 + 0.55 * i) for i in range(5)], 0.22, 0.45)
    return _encuadrar(raiz, p, (-0.3, 2.7, 0.75), tam=3.3)

# ============================ DEFENSA ============================
def carta_chafitas(T, K):
    """LAS CHAFITAS: el cajon lanzador con sus tubos, dos cartuchos saliendo y la nube de tiras."""
    raiz, p = _marco(T, 'chafitas')
    caja('lanzador', (0, 0, 0), (1.3, 0.55, 0.9), p, _mat(K, 'chf_l', OLIVA2))
    tubo = _mat(K, 'chf_t', '#2f3328')
    for i in range(4):
        for j in range(2):
            disco('boca%d%d' % (i, j), (-0.48 + i * 0.32, -0.14 + j * 0.3, 0.46), 0.12, p, tubo, seg=10)
    cart = _mat(K, 'chf_c', '#7a5a34')
    for i, (x, y, z) in enumerate(((-0.2, 0.3, 1.4), (0.35, 0.6, 2.2))):
        g = _vacio(p, 'cart%d' % i); g.location = (x, y, z); g.rotation_euler = (math.pi / 2 + 0.3 * i, 0, 0.4)
        _cil('cart', g, cart, [(-0.3, 0.12), (0.3, 0.12)])
    rnd = random.Random(7)
    plata = [_mat(K, 'chf_p%d' % i, c) for i, c in enumerate(('#d9dee0', '#aeb5b8', '#f2f4f4'))]
    for i in range(18):
        c = Vector((rnd.uniform(-1.2, 1.2), rnd.uniform(0.4, 2.0), rnd.uniform(1.0, 2.6)))
        t = caja('tira%d' % i, (0, 0, 0), (0.07, 0.42, 0.02), p, plata[i % 3])
        t.location = c; t.rotation_euler = (rnd.uniform(0, 3), rnd.uniform(0, 3), rnd.uniform(0, 3))
    return _encuadrar(raiz, p, (0.45, 0.3, 0), tam=3.2)

def carta_chapa(T, K):
    """LA CHAPA REFORZADA: una plancha de blindaje remachada, con la marca de un impacto que no paso."""
    raiz, p = _marco(T, 'chapa')
    caja('plancha', (0, 0, 0), (2.0, 2.6, 0.22), p, _mat(K, 'chp_p', '#7b8489'))
    caja('canto', (0, 0, -0.05), (2.1, 2.7, 0.16), p, _mat(K, 'chp_c', GRIS2))
    rem = _mat(K, 'chp_r', ACERO)
    for i in range(6):
        for x, y in ((-0.85, -1.1 + i * 0.44), (0.85, -1.1 + i * 0.44)):
            elipsoide('remache', (x, y, 0.12), (0.07, 0.07, 0.05), p, rem, seg=8, anillos=4)
    for j in range(4):
        elipsoide('remache', (-0.42 + j * 0.28, 1.1, 0.12), (0.07, 0.07, 0.05), p, rem, seg=8, anillos=4)
        elipsoide('remache', (-0.42 + j * 0.28, -1.1, 0.12), (0.07, 0.07, 0.05), p, rem, seg=8, anillos=4)
    elipsoide('golpe', (0.2, 0.25, 0.1), (0.3, 0.3, 0.06), p, _mat(K, 'chp_g', '#c9ced0'), seg=12, anillos=5)
    elipsoide('hueco', (0.2, 0.25, 0.13), (0.12, 0.12, 0.04), p, _mat(K, 'chp_h', '#3a3f42'), seg=10, anillos=4)
    for a in range(5):
        _barra('raya%d' % a, p, _mat(K, 'chp_g', '#c9ced0'), (0.2, 0.25, 0.12),
               (0.2 + 0.55 * math.cos(a * 1.25), 0.25 + 0.55 * math.sin(a * 1.25), 0.12), 0.035)
    return _encuadrar(raiz, p, (-0.25, 0.55, 0.12))

def carta_casco(T, K):
    """EL RELEVO VETERANO: el casco del piloto, con el visor bajo y la mascara de oxigeno colgando."""
    raiz, p = _marco(T, 'casco')
    elipsoide('casco', (0, 0, 0), (1.0, 1.05, 1.15), p, _mat(K, 'cas_c', '#e4e1d5'), seg=24, anillos=14)
    elipsoide('franja', (0, 0.08, 0), (1.02, 0.18, 1.17), p, _mat(K, 'cas_f', '#6fa9d4'), seg=24, anillos=8)
    caja('visera', (0, 0.62, -0.95), (0.95, 0.1, 0.28), p, _mat(K, 'cas_v', '#ece9df'))
    elipsoide('visor', (0, 0.0, -0.9), (0.78, 0.48, 0.4), p, _mat(K, 'cas_vi', '#2b3d48'), seg=18, anillos=10)
    elipsoide('mascara', (0, -0.62, -0.95), (0.42, 0.35, 0.4), p, _mat(K, 'cas_m', '#4a4f47'), seg=14, anillos=8)
    goma = _mat(K, 'cas_g', '#2c302a')
    for i in range(6):
        elipsoide('manguera%d' % i, (0.15 * i, -0.95 - 0.22 * i, -0.85 + 0.12 * i), (0.12, 0.12, 0.12), p, goma, seg=8, anillos=5)
    return _encuadrar(raiz, p, (-0.1, math.pi - 1.0, 0))

def carta_llave(T, K):
    """LA REPARACION: la llave fija cruzada con un tornillo y unos remaches."""
    raiz, p = _marco(T, 'llave')
    acero = _mat(K, 'lla_a', ACERO)
    caja('mango', (0, 0, 0), (0.32, 2.6, 0.12), p, acero)
    caja('mango2', (0, 0, 0.0), (0.2, 2.2, 0.16), p, _mat(K, 'lla_m', ROJO))
    for s in (1, -1):                                                       # las dos bocas, una a cada punta
        y = s * 1.45
        caja('boca', (0, y, 0), (0.7, 0.42, 0.12), p, acero)
        caja('diente_a', (-0.25, y + s * 0.32, 0), (0.18, 0.32, 0.12), p, acero)
        caja('diente_b', (0.25, y + s * 0.32, 0), (0.18, 0.32, 0.12), p, acero)
    t = _vacio(p, 'tornillo'); t.location = (0.95, -0.6, 0.15); t.rotation_euler = (math.pi / 2, 0, 0.3)
    columna('cabeza', t, _mat(K, 'lla_t', LATON), 0, 0, [(0, 0.24, 0.24), (0.18, 0.24, 0.24)], expo=1.0)
    _cil('rosca', t, _mat(K, 'lla_r', LATON2), [(-0.7, 0.1), (0, 0.1)])
    return _encuadrar(raiz, p, (0.35, 0.3, 0.7))

def carta_a4(T, K):
    """EL AVION AMIGO: el A-4 de la escuadrilla, con las escarapelas, de tres cuartos por arriba."""
    raiz, p = _marco(T, 'a4')
    _adoptar(_avion(T, K, 'sky'), p)
    return _encuadrar(raiz, p, (-0.6, 2.5, -0.15))

# ============================ EL TALLER ============================
def carta_caja_herr(T, K):
    """EL TALLER LIVIANO: la caja de herramientas abierta, con la llave asomando."""
    raiz, p = _marco(T, 'caja_herr')
    roja, roja2 = _mat(K, 'cj_r', '#a8392c'), _mat(K, 'cj_r2', '#7d2a20')
    caja('cuerpo', (0, 0, 0), (2.4, 1.1, 1.1), p, roja)
    caja('bandeja', (0, 0.68, 0), (2.3, 0.25, 1.0), p, roja2)
    tapa = caja('tapa', (0, 0, 0), (2.4, 0.08, 1.1), p, roja); tapa.location = (0, 1.05, -0.75); tapa.rotation_euler = (-1.1, 0, 0)
    caja('asa', (0, 1.25, 0), (1.0, 0.08, 0.1), p, _mat(K, 'cj_a', NEGRO))
    acero = _mat(K, 'cj_ac', ACERO)
    for i, (x, a) in enumerate(((-0.6, 0.25), (0.1, -0.15), (0.65, 0.35))):
        h = caja('herr%d' % i, (0, 0, 0), (0.14, 1.3, 0.08), p, acero); h.location = (x, 1.2, 0.1 * i); h.rotation_euler = (0, 0, a)
    caja('mango', (0, 0, 0), (0.18, 0.55, 0.18), p, _mat(K, 'cj_m', AMARILLO)).location = (0.1, 0.75, 0.1)
    for x in (-0.95, 0.95):
        caja('cierre', (x, 0.35, 0.56), (0.18, 0.2, 0.04), p, _mat(K, 'cj_c', ACERO2))
    return _encuadrar(raiz, p, (0.4, 0.55, 0))

def carta_motor(T, K):
    """EL TALLER PESADO: el reactor afuera del avion, en su carro, con la cara del compresor."""
    raiz, p = _marco(T, 'motor')
    loft('motor', [(-1.6, 0.62, 0.62, 0), (-1.2, 0.7, 0.7, 0), (0.8, 0.66, 0.66, 0), (1.6, 0.48, 0.48, 0)], p,
         _mat(K, 'mot_c', '#8a8f86'), n=18, cerrar=(False, True))
    loft('anillos', [(-0.4, 0.71, 0.71, 0), (-0.3, 0.71, 0.71, 0)], p, _mat(K, 'mot_a', '#5d6158'), n=18, cerrar=(False, False))
    disco('cara', (0, 0, -1.55), 0.6, p, _mat(K, 'mot_f', '#3a3d38'), seg=18)
    acero = _mat(K, 'mot_p', ACERO)
    for i in range(12):                                                     # los alabes
        a = i * math.pi / 6
        f = caja('alabe', (0, 0, 0), (0.07, 0.5, 0.02), p, acero)
        f.location = (0.28 * math.cos(a), 0.28 * math.sin(a), -1.5); f.rotation_euler = (0, 0.5, a - math.pi / 2)
    elipsoide('cono', (0, 0, -1.5), (0.18, 0.18, 0.22), p, acero, seg=10, anillos=6)
    am = _mat(K, 'mot_y', AMARILLO)
    for z in (-1.0, 1.0):                                                   # el carro amarillo
        caja('cuna', (0, -0.72, z), (1.1, 0.12, 0.18), p, am)
        for x in (-0.45, 0.45): caja('pata', (x, -1.05, z), (0.12, 0.6, 0.12), p, am)
    caja('larguero', (0, -1.35, 0), (1.3, 0.1, 2.4), p, am)
    for x in (-0.6, 0.6):
        for z in (-1.1, 1.1):
            g = _vacio(p, 'r'); g.location = (x, -1.55, z); g.rotation_euler = (0, 0, math.pi / 2)
            _cil('rueda', g, _mat(K, 'mot_r', NEGRO), [(-0.08, 0.16), (0.08, 0.16)])
    return _encuadrar(raiz, p, (0.35, 2.5, 0))

def carta_reloj(T, K):
    """LA VUELTA RAPIDA: el cronometro del jefe de linea."""
    raiz, p = _marco(T, 'reloj')
    g = _vacio(p, 'cuerpo'); g.rotation_euler = (math.pi / 2, 0, 0)
    _cil('caja', g, _mat(K, 'rel_c', ACERO2), [(-0.2, 1.2), (0.18, 1.2)])
    _cil('esfera', g, _mat(K, 'rel_e', '#ece8dc'), [(0.18, 1.05), (0.2, 1.05)])
    caja('corona', (0, 1.38, 0), (0.25, 0.3, 0.25), p, _mat(K, 'rel_k', ACERO))
    caja('boton', (0, 1.6, 0), (0.42, 0.1, 0.3), p, _mat(K, 'rel_b', ACERO))
    negro, rojo = _mat(K, 'rel_n', NEGRO), _mat(K, 'rel_r', ROJO)
    for i in range(12):
        a = i * math.pi / 6
        caja('marca', (0.88 * math.cos(a), 0.88 * math.sin(a), 0.22), (0.06 if i % 3 else 0.1, 0.06 if i % 3 else 0.1, 0.02), p, negro)
    _barra('aguja', p, rojo, (0, 0, 0.24), (0.55, 0.62, 0.24), 0.07)
    _barra('aguja2', p, negro, (0, 0, 0.25), (-0.15, 0.48, 0.25), 0.09)
    elipsoide('eje', (0, 0, 0.26), (0.08, 0.08, 0.04), p, negro, seg=8, anillos=4)
    for i in range(3):                                                      # las rayas de apuro
        caja('apuro%d' % i, (-1.6 - 0.15 * i, -0.4 + i * 0.4, 0), (0.7 - 0.15 * i, 0.07, 0.04), p, _mat(K, 'rel_a', '#cfd3cf'))
    return _encuadrar(raiz, p, (-0.2, 0.35, 0.1))

def carta_cajon(T, K):
    """LA MUNICION: el cajon de madera de la armeria con la marca en amarillo y dos tiros arriba."""
    raiz, p = _marco(T, 'cajon')
    madera, madera2 = _mat(K, 'cjn_m', '#5a6340'), _mat(K, 'cjn_m2', '#454d30')
    caja('cajon', (0, 0, 0), (2.6, 1.3, 1.4), p, madera)
    for x in (-1.2, 1.2): caja('refuerzo', (x, 0, 0), (0.2, 1.34, 1.44), p, madera2)
    caja('tapa', (0, 0.7, 0), (2.64, 0.12, 1.44), p, madera2)
    _texto('marca', 'MK 17', 0.42, _mat(K, 'cjn_t', AMARILLO), p, (0, 0, 0.72))
    for i in range(2):
        g = _vacio(p, 'b%d' % i); g.location = (-0.45 + i * 0.9, 1.05, 0); g.rotation_euler = (0, 0.15, 0)
        _bomba(g, K, 'cjb%d' % i, largo=2.2, r=0.22)
    return _encuadrar(raiz, p, (0.35, 0.6, 0))

# ============================ ALCANCE ============================
def carta_tanques(T, K):
    """LOS TANQUES DE ALA: los dos tanques externos, con sus pilones."""
    raiz, p = _marco(T, 'tanques')
    cuerpo, aleta = _mat(K, 'tq_c', '#c3c9cc'), _mat(K, 'tq_a', '#9aa1a4')
    for x in (-0.65, 0.65):
        M.tanque('tanque', (x, 0, 0), 0.42, 3.4, p, cuerpo, aleta)
        caja('pilon', (x, 0.5, -0.2), (0.08, 0.25, 1.1), p, _mat(K, 'tq_p', GRIS2))
    return _encuadrar(raiz, p, (0.45, 2.35, 0))

def carta_hercules(T, K):
    """LA CHANCHA: el KC-130 de modelos_enemigos.py, de tres cuartos."""
    raiz, p = _marco(T, 'hercules')
    E = _mod('modelos_bl_enemigos_c', 'modelos_enemigos.py')
    _adoptar(E.hercules(T, K), p)
    return _encuadrar(raiz, p, (0.55, 2.55, 0.15))

# ============================ PODERES ============================
def carta_arena(T, K):
    """EL MOMENTUM: el reloj de arena, con la arena cayendo."""
    raiz, p = _marco(T, 'arena')
    madera = _mat(K, 'are_m', MADERA)
    for y in (-1.45, 1.45): _cil('tapa', p, madera, [(y - 0.12, 1.0), (y + 0.12, 1.0)])
    for a in range(3):
        x, z = 0.82 * math.cos(a * 2.1), 0.82 * math.sin(a * 2.1)
        _cil('columna', p, _mat(K, 'are_c', MADERA2), [(-1.35, 0.07), (1.35, 0.07)], x=x, z=z)
    vidrio = _mat(K, 'are_v', '#bfe0ea'); K['translucido'](vidrio, 0.35)
    _cil('vidrio', p, vidrio, [(-1.33, 0.7), (-0.9, 0.68), (-0.2, 0.18), (0, 0.08), (0.2, 0.18), (0.9, 0.68), (1.33, 0.7)])
    arena = _mat(K, 'are_a', '#e0b46a')
    _cil('arriba', p, arena, [(0.25, 0.2), (0.6, 0.5), (0.7, 0.04)])
    _cil('abajo', p, arena, [(-1.33, 0.66), (-1.0, 0.6), (-0.7, 0.05)])
    _cil('chorro', p, arena, [(-0.7, 0.03), (0.25, 0.03)])
    return _encuadrar(raiz, p, (0.2, 0.3, 0.12))

def carta_rasante(T, K):
    """EL RASANTE: el A-4 al ras del mar, con la estela de rocio."""
    raiz, p = _marco(T, 'rasante')
    av = _adoptar(_avion(T, K, 'sky'), p); av.location = (0, 0.9, 0)
    agua, cresta = _mat(K, 'ras_a', '#3f6f86'), _mat(K, 'ras_c', '#cfe3e8')
    caja('mar', (0, -0.2, 0.6), (3.4, 0.2, 5.6), p, agua)
    for i in range(6):
        caja('ola%d' % i, (0, 0, 0), (1.4 - 0.1 * i, 0.06, 0.12), p, cresta).location = ((i % 3 - 1) * 0.9, -0.08, -1.8 + i * 0.85)
    _humo(p, K, [(0.4 * math.sin(i), 0.05 + 0.18 * i, 1.8 + 0.6 * i) for i in range(6)], 0.18, 0.5, '#e8f1f2')
    return _encuadrar(raiz, p, (0.3, 2.45, 0.05))

def carta_radar(T, K):
    """EL RADAR: la antena de modelos_tierra.py."""
    raiz, p = _marco(T, 'radar')
    Ti = _mod('modelos_bl_tierra_c', 'modelos_tierra.py')
    _adoptar(Ti.radar(T, K, '0.6'), p)
    return _encuadrar(raiz, p, (0.25, 0.5, 0))

# ============================ INTELIGENCIA ============================
def carta_neptune(T, K):
    """EL NEPTUNE: el explorador de la Armada que encontraba la flota."""
    raiz, p = _marco(T, 'neptune')
    _adoptar(_avion(T, K, 'neptune'), p)
    return _encuadrar(raiz, p, (-0.6, 2.5, -0.15))

def carta_auriculares(T, K):
    """EL TRACKER QUE ESCUCHABA: los auriculares sobre la consola, con la onda en la pantalla."""
    raiz, p = _marco(T, 'auriculares')
    negro, goma = _mat(K, 'aur_n', '#2c302c'), _mat(K, 'aur_g', '#45493f')
    for i in range(15):                                                      # el arco
        a = math.pi * i / 14
        elipsoide('arco%d' % i, (1.0 * math.cos(a), 0.4 + 1.0 * math.sin(a), 0), (0.12, 0.12, 0.16), p, negro, seg=8, anillos=5)
    for x in (-1.0, 1.0):
        g = _vacio(p, 'copa'); g.location = (x, 0.3, 0); g.rotation_euler = (0, 0, math.pi / 2)
        _cil('copa', g, goma, [(-0.25, 0.42), (0.25, 0.46)])
    caja('consola', (0, -0.9, 0.2), (2.8, 0.9, 0.9), p, _mat(K, 'aur_c', OLIVA2))
    caja('pantalla', (0, -0.85, 0.66), (1.4, 0.6, 0.02), p, _mat(K, 'aur_p', '#13261a'))
    verde = K['mat_emisivo']('aur_o', '#6fe08a')
    for i in range(10):
        x0, x1 = -0.6 + i * 0.12, -0.48 + i * 0.12
        y0, y1 = -0.85 + 0.2 * math.sin(i * 1.4), -0.85 + 0.2 * math.sin((i + 1) * 1.4)
        _barra('onda%d' % i, p, verde, (x0, y0, 0.68), (x1, y1, 0.68), 0.03)
    for i in range(3): elipsoide('perilla', (0.95, -1.0 + i * 0.22, 0.66), (0.07, 0.07, 0.04), p, _mat(K, 'aur_k', ACERO), seg=8, anillos=4)
    return _encuadrar(raiz, p, (0.2, 0.4, 0))

def carta_antena(T, K):
    """LA GUERRA ELECTRONICA: el mastil con la antena y las ondas que ensucian la pantalla del otro."""
    raiz, p = _marco(T, 'antena')
    acero = _mat(K, 'ant_a', ACERO2)
    caja('mastil', (0, 0, 0), (0.22, 3.0, 0.22), p, acero)
    caja('base', (0, -1.6, 0), (1.6, 0.6, 1.1), p, _mat(K, 'ant_b', OLIVA2))
    caja('puerta', (0.2, -1.6, 0.56), (0.5, 0.4, 0.02), p, _mat(K, 'ant_p', OLIVA))
    caja('brazo', (0.6, 1.2, 0), (1.3, 0.14, 0.14), p, acero)
    for i in range(5):
        caja('elemento%d' % i, (0.05 + i * 0.28, 1.2, 0), (0.09, 0.09, 1.0 - 0.1 * i), p, acero)
    rojo = K['mat_emisivo']('ant_o', '#f2c531')
    for k in range(3):                                                      # las ondas: arcos en zigzag
        r = 0.7 + k * 0.45
        pts = [(1.3 + r * math.cos(a), 1.2 + r * math.sin(a) * (1 if j % 2 else 0.85), 0) for j, a in enumerate([-0.9 + 0.3 * j for j in range(7)])]
        for j in range(len(pts) - 1): _barra('onda%d%d' % (k, j), p, rojo, pts[j], pts[j + 1], 0.11)
    return _encuadrar(raiz, p, (0.1, 0.45, 0))

def carta_mirage(T, K):
    """EL BARRIDO DE MIRAGE: el Mirage III, alto y en viraje."""
    raiz, p = _marco(T, 'mirage')
    av = _adoptar(_avion(T, K, 'mirage'), p); av.rotation_euler = (0, 0, -0.5)
    return _encuadrar(raiz, p, (-0.75, 2.6, -0.3))

def carta_learjet(T, K):
    """EL ESCUADRON FENIX: el Learjet, solo, haciendose pasar por una escuadrilla."""
    raiz, p = _marco(T, 'learjet')
    _adoptar(_avion(T, K, 'learjet'), p)
    return _encuadrar(raiz, p, (-0.6, 2.5, -0.15))

def carta_pinza(T, K):
    """EL ATAQUE COORDINADO: dos A-4 que entran por dos rumbos sobre el mismo punto."""
    raiz, p = _marco(T, 'pinza')
    for i, (x, a) in enumerate(((-2.3, -0.6), (2.3, 0.6))):
        g = _vacio(p, 'av%d' % i); g.location = (x, 0, 0.6); g.rotation_euler = (0, a, 0)
        _adoptar(_avion(T, K, 'sky'), g)
    roja = K['mat_emisivo']('pin_r', '#e05a3c')
    for s in (1, -1):
        pts = [(s * (1.8 - 0.3 * j), 0, -1.2 - 0.6 * j + 0.06 * j * j) for j in range(6)]
        for j in range(5): _barra('flecha%d' % j, p, roja, pts[j], pts[j + 1], 0.09)
    _cil('blanco', p, roja, [(-0.05, 0.5), (0.05, 0.5)], z=-4.4)
    _cil('blanco2', p, _mat(K, 'pin_b', BLANCO), [(-0.04, 0.32), (0.07, 0.32)], z=-4.4)
    return _encuadrar(raiz, p, (0.9, 0, 0))

def carta_terreno(T, K):
    """CONOCER EL TERRENO: un bloque de la isla con sus lomas, cortado como una maqueta."""
    raiz, p = _marco(T, 'terreno')
    N, L = 24, 3.2
    lomas = [(-0.6, -0.4, 0.75, 0.55), (0.7, 0.3, 0.55, 0.45), (0.1, 0.9, 0.35, 0.35), (-0.9, 0.8, 0.3, 0.4)]
    alto = lambda x, z: 0.12 + sum(h * math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * r * r)) for cx, cz, h, r in lomas)
    cols = ['#5f7a45', '#7b8c4c', '#9a9156', '#b8b39a']
    bm = bmesh.new()
    V = [[bm.verts.new(((i / N - 0.5) * L, alto((i / N - 0.5) * L / 1.6, (j / N - 0.5) * L / 1.6), (j / N - 0.5) * L)) for j in range(N + 1)] for i in range(N + 1)]
    for i in range(N):
        for j in range(N):
            f = bm.faces.new((V[i][j], V[i][j + 1], V[i + 1][j + 1], V[i + 1][j]))
            h = sum(v.co.y for v in f.verts) / 4
            f.material_index = 0 if h < 0.25 else 1 if h < 0.45 else 2 if h < 0.65 else 3
    # los costados de la maqueta (la tierra cortada)
    bordes = [[V[i][0] for i in range(N + 1)], [V[N][j] for j in range(N + 1)], [V[i][N] for i in range(N, -1, -1)], [V[0][j] for j in range(N, -1, -1)]]
    for b in bordes:
        abajo = [bm.verts.new((v.co.x, -0.35, v.co.z)) for v in b]
        for k in range(len(b) - 1):
            f = bm.faces.new((b[k], abajo[k], abajo[k + 1], b[k + 1])); f.material_index = 4
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('terreno'); bm.to_mesh(me); bm.free()
    for i, c in enumerate(cols + ['#5a4632']): me.materials.append(_mat(K, 'ter%d' % i, c))
    ob = bpy.data.objects.new('terreno', me); bpy.context.scene.collection.objects.link(ob); ob.parent = p
    caja('mar', (0, 0.0, 0), (L * 1.0, 0.1, L * 1.0), p, _mat(K, 'ter_mar', '#3f6f86'))
    return _encuadrar(raiz, p, (0.6, 0.6, 0))

def carta_itb(T, K):
    """LA ITB: el Exocet de un destructor, montado en un trailer."""
    raiz, p = _marco(T, 'itb')
    verde = _mat(K, 'itb_v', OLIVA)
    caja('chasis', (0, 0, 0), (1.5, 0.22, 3.6), p, verde)
    caja('lanza', (0, -0.05, -2.3), (0.15, 0.12, 1.2), p, _mat(K, 'itb_l', OLIVA2))
    for x in (-0.8, 0.8):
        for z in (0.6, 1.3):
            g = _vacio(p, 'r'); g.location = (x, -0.35, z); g.rotation_euler = (0, 0, math.pi / 2)
            _cil('rueda', g, _mat(K, 'itb_r', NEGRO), [(-0.14, 0.32), (0.14, 0.32)])
    caja('soporte', (0, 0.45, 0.3), (0.5, 0.7, 0.5), p, _mat(K, 'itb_s', GRIS2))
    g = _vacio(p, 'riel'); g.location = (0, 0.95, 0.2); g.rotation_euler = (0.3, 0, 0)
    caja('riel', (0, -0.08, 0), (0.6, 0.12, 3.4), g, _mat(K, 'itb_ri', GRIS))
    M.exocet('exo', (0, 0.25, 0), 0.24, 3.4, g, _mat(K, 'itb_e', '#e1dcc8'), _mat(K, 'itb_ea', '#bdb7a2'))
    return _encuadrar(raiz, p, (0.4, 2.3, 0))

def carta_paracaidas(T, K):
    """EL KIT DE SUPERVIVENCIA: el piloto bajando colgado del paracaidas, con la bengala encendida."""
    raiz, p = _marco(T, 'paracaidas')
    bm = bmesh.new(); n, anillos, R, H, y0 = 14, 5, 1.6, 0.9, 1.4
    filas = [[bm.verts.new((R * math.sin(t) * math.cos(2 * math.pi * i / n), y0 + H * math.cos(t), R * math.sin(t) * math.sin(2 * math.pi * i / n)))
              for i in range(n)] for t in [k * (math.pi / 2.2) / anillos for k in range(1, anillos + 1)]]
    cima = bm.verts.new((0, y0 + H, 0))
    for i in range(n):
        f = bm.faces.new((cima, filas[0][(i + 1) % n], filas[0][i])); f.material_index = i % 2
    for a, b in zip(filas, filas[1:]):
        for i in range(n):
            f = bm.faces.new((a[(i + 1) % n], a[i], b[i], b[(i + 1) % n])); f.material_index = i % 2
    borde = [tuple(v.co) for v in filas[-1]]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('vela'); bm.to_mesh(me); bm.free()
    me.materials.append(_mat(K, 'pc_b', BLANCO)); me.materials.append(_mat(K, 'pc_n', NARANJA))
    ob = bpy.data.objects.new('vela', me); bpy.context.scene.collection.objects.link(ob); ob.parent = p
    s = ob.modifiers.new('s', 'SOLIDIFY'); s.thickness = 0.04
    cuerda = _mat(K, 'pc_c', '#cfc8b4')
    for i in range(0, n, 2): _barra('cuerda%d' % i, p, cuerda, borde[i], (0, -0.85, 0), 0.02)
    verde = _mat(K, 'pc_v', '#5a6448')
    elipsoide('cuerpo', (0, -1.35, 0), (0.22, 0.45, 0.18), p, verde, seg=10, anillos=8)
    elipsoide('cabeza', (0, -0.78, 0), (0.17, 0.17, 0.17), p, _mat(K, 'pc_k', '#e4e1d5'), seg=10, anillos=8)
    for s_ in (1, -1):
        _barra('brazo', p, verde, (s_ * 0.18, -1.05, 0), (s_ * 0.45, -0.75, 0.05), 0.09)
        _barra('pierna', p, verde, (s_ * 0.1, -1.7, 0), (s_ * 0.18, -2.25, 0.1), 0.1)
    _barra('bengala', p, _mat(K, 'pc_bg', '#7a5a34'), (0.45, -0.75, 0.05), (0.6, -0.5, 0.1), 0.06)
    _fogonazo(p, K, (0.65, -0.4, 0.1), 0.18)
    _humo(p, K, [(0.75 + 0.15 * i, -0.2 + 0.25 * i, 0.1) for i in range(4)], 0.08, 0.2, '#e8d9d4')
    return _encuadrar(raiz, p, (0.15, 0.4, 0))

def carta_pirueta(T, K):
    """LAS PIRUETAS: el A-4 rolando, con la estela en espiral."""
    raiz, p = _marco(T, 'pirueta')
    av = _adoptar(_avion(T, K, 'sky'), p); av.rotation_euler = (0, 0, 1.0)
    mat = _mat(K, 'pir_h', '#e9ece6')
    for i in range(26):
        a = i * 0.42
        r = 0.08 + 0.012 * i
        elipsoide('estela%d' % i, (1.1 * math.cos(a), 1.1 * math.sin(a), 2.0 + i * 0.24), (r, r, r * 1.3), p, mat, seg=8, anillos=5)
    return _encuadrar(raiz, p, (0.35, 2.75, 0))
