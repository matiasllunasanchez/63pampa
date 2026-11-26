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

def carta_ter(T, K):
    """EL SOPORTE MULTIPLE (TER): la viga con tres bombas, dos en los hombros y una abajo."""
    raiz, p = _marco(T, 'ter')
    caja('viga', (0, 0.42, 0), (0.22, 0.2, 2.4), p, _mat(K, 'ter_v', GRIS2))
    caja('pilon', (0, 0.75, 0.1), (0.1, 0.35, 1.2), p, _mat(K, 'ter_p', GRIS))
    for i, (x, y) in enumerate(((-0.34, 0.02), (0.34, 0.02), (0, -0.28))):
        g = _vacio(p, 'b%d' % i); g.location = (x, y, 0.0 if i < 2 else 0.15)
        _bomba(g, K, 'ter%d' % i, largo=2.0, r=0.2)
    return _encuadrar(raiz, p, (0.35, 2.4, 0))

def carta_chafitas(T, K):
    """LAS CHAFITAS: la maquina de fideos DETRAS (20/10, el autor: "la card con chafitas siempre tendra la
    maquina de fideos detras") y adelante el cajon lanzador con sus tubos, dos cartuchos saliendo y la nube."""
    raiz, p = _marco(T, 'chafitas')
    atras = _vacio(p, 'chf_atras'); atras.location = (-0.9, 0.9, -2.2); atras.scale = (0.8, 0.8, 0.8)
    _maquina_fideos(atras, K, 'chm')
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

def _maquina_fideos(p, K, nombre='fid'):
    """LA MAQUINA DE TALLARINES, la clasica de manivela (20/10, el autor: "que sea claro que es una maquina de
    fideos y no un coso de hojas"): cuerpo de acero cromado, la manivela grande con su puño de madera, la
    perilla del grosor, la prensa que la agarra a la mesa, una tira de aluminio entrando por arriba y los
    tallarines —largos, ondulados, plateados— colgando por delante. Mira hacia +z; la manivela va en +x."""
    cromo, cromo2 = _mat(K, nombre + 'c', '#c3cacd'), _mat(K, nombre + 'c2', '#8b9497')
    madera, madera2 = _mat(K, nombre + 'm', MADERA), _mat(K, nombre + 'm2', MADERA2)
    # la MESA (un canto de madera) y la PRENSA en C que la agarra
    caja(nombre + '_mesa', (0, -0.55, -0.1), (3.0, 0.22, 1.7), p, madera2)
    caja(nombre + '_prensa', (-0.55, -0.85, 0.0), (0.18, 0.5, 0.18), p, cromo2)
    caja(nombre + '_prensa2', (-0.55, -1.05, -0.2), (0.18, 0.12, 0.55), p, cromo2)
    # EL CUERPO: una caja cromada con los dos laterales mas oscuros, y la boca de los tallarines abajo
    caja(nombre + '_cuerpo', (0, 0.35, 0), (1.5, 0.9, 0.95), p, cromo)
    for sx in (-1, 1):
        caja(nombre + '_lat%d' % sx, (sx * 0.78, 0.35, 0), (0.08, 0.95, 1.0), p, cromo2)
    caja(nombre + '_boca', (0, -0.05, 0.5), (1.2, 0.14, 0.08), p, _mat(K, nombre + 'b', NEGRO))
    # la PERILLA del grosor, del lado izquierdo
    gp = _vacio(p, nombre + '_per'); gp.location = (-0.9, 0.55, 0.15); gp.rotation_euler = (0, 0, math.pi / 2)
    _cil(nombre + '_perilla', gp, cromo2, [(-0.08, 0.16), (0.08, 0.16)])
    # LA MANIVELA: eje que sale del costado derecho, el brazo en diagonal y el puño de madera — la silueta
    # que dice "maquina de fideos" de un vistazo
    _barra(nombre + '_eje', p, cromo2, (0.8, 0.45, 0.1), (1.15, 0.45, 0.1), 0.09)
    _barra(nombre + '_brazo', p, cromo, (1.15, 0.45, 0.1), (1.2, 1.35, 0.35), 0.1)
    _barra(nombre + '_espiga', p, cromo2, (1.2, 1.35, 0.35), (1.55, 1.35, 0.35), 0.06)
    gm = _vacio(p, nombre + '_mg'); gm.location = (1.72, 1.35, 0.35); gm.rotation_euler = (0, 0, math.pi / 2)
    _cil(nombre + '_puno', gm, madera, [(-0.2, 0.09), (-0.12, 0.12), (0.12, 0.12), (0.2, 0.09)])
    # (SIN la tira de aluminio entrando por arriba: una placa blanca encima se leia como "un coso de hojas" —
    # el autor, 20/10 —; queda la ranura, y lo que dice ALUMINIO son los tallarines plateados)
    plata = [_mat(K, nombre + 'p%d' % i, c) for i, c in enumerate(('#e6eaec', '#c4cbce', '#f7f8f8'))]
    caja(nombre + '_ranura', (0, 0.82, 0), (1.1, 0.04, 0.16), p, _mat(K, nombre + 'r', NEGRO))
    # LOS TALLARINES: salen de la boca, pasan por arriba del canto de la mesa y cuelgan largos y ondulados
    rnd = random.Random(5)
    for i in range(14):
        x = -0.52 + i * 0.08
        pts = [Vector((x, -0.05, 0.52)), Vector((x, -0.36, 0.86))]
        for k in range(4):
            q = pts[-1]
            pts.append(Vector((x + (0.07 if k % 2 else -0.07) + rnd.uniform(-0.02, 0.02), q.y - 0.4, q.z + 0.03)))
        for k in range(len(pts) - 1):
            _barra(nombre + '_t%d_%d' % (i, k), p, plata[(i + k) % 3], pts[k], pts[k + 1], 0.04)

def carta_fideos(T, K):
    """LA MAQUINA DE FIDEOS (20/10/2026, el autor): la carta que habilita las primeras chafitas. Las de la II
    Brigada se cortaron con una maquina de tallarines prestada por una fabrica de pastas de Parana; hoy esta en
    su museo. Sola, en grande: es el origen."""
    raiz, p = _marco(T, 'fideos')
    _maquina_fideos(p, K)
    return _encuadrar(raiz, p, (0.3, 0.55, 0), tam=3.3)

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

def carta_bidon(T, K):
    """LA CHANCHA, EL BIDON (23/11/2026, el autor: "acompañar la gota con un tanque de nafta, o literal un bidon de esos,
    el rojo — usemos verde, pero el mismo pico"): el bidon de chapa de tres manijas con la X estampada, verde, el
    pico flexible negro saliendo de la esquina y doblando para afuera, y la gota verde cayendo de la punta."""
    raiz, p = _marco(T, 'bidon')
    verde, verde2, verde3 = _mat(K, 'bd_v', '#3f9a4c'), _mat(K, 'bd_v2', '#2a6a33'), _mat(K, 'bd_v3', '#5fc46a')
    negro, acero = _mat(K, 'bd_n', NEGRO), _mat(K, 'bd_s', ACERO2)
    # el cuerpo: la chapa, con el borde de la costura alrededor (un poco mas ancho y oscuro)
    caja('cuerpo', (0, 0, 0), (2.2, 2.9, 1.0), p, verde)
    caja('costura', (0, 0, 0), (2.3, 3.0, 0.24), p, verde2)
    # la X estampada en las dos caras, en relieve
    for z in (0.52, -0.52):
        _barra('x1', p, verde3, (-0.78, -1.1, z), (0.78, 1.05, z), 0.16)
        _barra('x2', p, verde3, (0.78, -1.1, z), (-0.78, 1.05, z), 0.16)
    # las tres manijas arriba: la barra y sus tres patas
    _barra('manija', p, verde2, (-0.98, 1.95, 0), (0.32, 1.95, 0), 0.2)
    for x in (-0.95, -0.32, 0.3):
        _barra('pata', p, verde2, (x, 1.42, 0), (x, 1.95, 0), 0.18)
    # la boca en la esquina de adelante, la tuerca, y el PICO: sube y se dobla para afuera
    _cil('boca', p, acero, [(1.42, 0.3), (1.72, 0.3), (1.76, 0.24)], x=0.72, expo=2.0)
    _barra('pico1', p, negro, (0.72, 1.7, 0), (1.25, 2.55, 0), 0.2)
    _barra('pico2', p, negro, (1.25, 2.55, 0), (1.95, 2.62, 0), 0.18)
    elipsoide('punta', (2.0, 2.62, 0), (0.13, 0.13, 0.13), p, acero, seg=10, anillos=6)
    # LA GOTA, cayendo de la punta: la panza abajo y la punta arriba (un elipsoide estirado y un cono chico)
    gota = _mat(K, 'bd_g', '#7fe08d')
    elipsoide('gota', (2.05, 1.92, 0), (0.2, 0.22, 0.2), p, gota, seg=12, anillos=8)
    _cil('gota_punta', p, gota, [(2.08, 0.17), (2.32, 0.02)], x=2.05, expo=2.0)
    return _encuadrar(raiz, p, (0.22, -0.5, 0))

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

def carta_aerosol(T, K):
    """EL M-60 (17/11/2026, el autor: "la imagen de este aerosol con la tapita tirada abajo, sin la marca, que
    diga M-60"): el siliconado del parabrisas — la lata azul con la faja amarilla, el pico blanco con el
    caño rojo y la tapa roja tirada al pie."""
    raiz, p = _marco(T, 'aerosol')
    azul, azul2 = _mat(K, 'aer_b', '#2b4da6'), _mat(K, 'aer_b2', '#1c2f6e')
    acero = _mat(K, 'aer_s', ACERO)
    rojo, rojo2 = _mat(K, 'aer_r', '#c9312a'), _mat(K, 'aer_r2', '#8e2019')
    _cil('lata', p, azul, [(-1.5, 0.6), (-1.46, 0.62), (1.02, 0.62), (1.26, 0.5), (1.38, 0.32)], expo=2.0)
    _cil('fondo', p, acero, [(-1.58, 0.57), (-1.46, 0.61)], expo=2.0)
    _cil('cuello', p, acero, [(1.34, 0.36), (1.48, 0.36), (1.5, 0.26)], expo=2.0)
    _cil('pico', p, _mat(K, 'aer_w', '#e9e9e4'), [(1.48, 0.16), (1.72, 0.16), (1.75, 0.12)], expo=2.0)
    _barra('cano', p, rojo, (0.05, 1.66, 0.1), (-1.25, 2.05, 0.75), 0.07)          # el caño rojo
    _cil('faja', p, _mat(K, 'aer_y', '#f2c230'), [(0.02, 0.635), (0.92, 0.635)], expo=2.0)
    # la cara de la etiqueta mira a la camara (la pose gira la lata 0,5 rad: la etiqueta va girada al reves)
    a = -0.5
    cara = _vacio(p, 'cara'); cara.location = (0.645 * math.sin(a), 0, 0.645 * math.cos(a)); cara.rotation_euler = (0, a, 0)
    _texto('marca', 'M-60', 0.56, azul2, cara, (0, 0.47, 0.02))
    blanco = _mat(K, 'aer_t', '#e6e2d6')
    for i, w in enumerate((0.62, 0.7, 0.56, 0.66, 0.5)):                        # los renglones de la etiqueta
        caja('renglon%d' % i, (0.0, -0.2 - i * 0.2, 0.0), (w, 0.06, 0.02), cara, blanco)
    # la TAPA, tirada al pie: de costado, con la boca mirando a la camara
    t = _vacio(p, 'tapa'); t.location = (0.95, -1.28, 0.55); t.rotation_euler = (0, 0.5, math.pi / 2)
    _cil('tapa_c', t, rojo, [(-0.32, 0.36), (0.3, 0.36), (0.34, 0.3)], expo=2.0)
    _cil('tapa_b', t, rojo2, [(-0.33, 0.3), (-0.31, 0.3)], expo=2.0)
    return _encuadrar(raiz, p, (0.18, 0.5, 0))

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

# ============================ 25/11/2026: LA TANDA DEL ALBUM ============================
# (el autor, con fotos: el Exocet como el AM39 de verdad, la eyeccion con el asiento y pinta de piloto, el rasante
# de atras a 45°, la espoleta que sea una espoleta, las chafitas sumando cartuchos, la llave inglesa sobre la chapa
# remachada, la ITB de costado, el ataque coordinado de costado, el Rapier con el Blowpipe y cada pirueta la suya)
from mathutils import Quaternion

def _poli(nombre, padre, mat, pts, espesor, u=(1, 0, 0), v=(0, 1, 0), o=(0, 0, 0)):
    """Una PLACA de contorno libre: `pts` [(a, b)] en el plano o + a·u + b·v, con espesor sobre la normal."""
    u, v, o = Vector(u), Vector(v), Vector(o)
    n = u.cross(v).normalized() * (espesor / 2)
    bm = bmesh.new()
    A = [bm.verts.new(o + a * u + b * v - n) for a, b in pts]
    B = [bm.verts.new(o + a * u + b * v + n) for a, b in pts]
    bm.faces.new(list(reversed(A))); bm.faces.new(B)
    k = len(pts)
    for i in range(k): bm.faces.new((A[i], A[(i + 1) % k], B[(i + 1) % k], B[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    return _obj(nombre, me, padre, mat)

def _aleta_eje(nombre, padre, mat, pts, espesor, ang):
    """Una aleta en el plano que contiene al eje z, a `ang` alrededor de el: `pts` [(radial, z)]."""
    return _poli(nombre, padre, mat, pts, espesor, (math.cos(ang), math.sin(ang), 0), (0, 0, 1))

def _apuntar(ob, d, rolido=0.0):
    """Gira `ob` (con la trompa en -z, como los aviones) para que apunte a `d`, con `rolido` sobre ese eje."""
    d = Vector(d).normalized()
    q = Vector((0, 0, -1)).rotation_difference(d)
    # que el "arriba" del avion quede lo mas arriba posible antes de rolar
    arriba = q @ Vector((0, 1, 0))
    quiero = Vector((0, 1, 0)) - d * d.y
    if quiero.length > 1e-4:
        quiero.normalize()
        ang = arriba.angle(quiero)
        if d.dot(arriba.cross(quiero)) < 0: ang = -ang
        q = Quaternion(d, ang) @ q
    q = Quaternion(d, rolido) @ q
    ob.rotation_mode = 'QUATERNION'; ob.rotation_quaternion = q
    return ob

def _remaches(padre, mat, pts, r=0.05):
    for (x, y, z) in pts: elipsoide('remache', (x, y, z), (r, r, r * 0.6), padre, mat, seg=8, anillos=4)

def _exocet_am39(p, K, n='exo'):
    """EL AM39 de las fotos del autor: blanco, la ojiva del radar GRIS con su banda NEGRA detras, las rayitas negra
    y amarilla a media eslora, las cuatro alas delta de punta cortada en X atras de la mitad, las cuatro aletas de
    cola alineadas con ellas, las orejas de enganche arriba y la tobera oscura. Nariz en -z."""
    blanco, ala = _mat(K, n + 'b', '#eef0ec'), _mat(K, n + 'w', '#dfe2df')
    gris, negro, amar = _mat(K, n + 'g', '#8d959a'), _mat(K, n + 'n', '#24282b'), _mat(K, n + 'y', '#e0b63a')
    r = 0.15
    _subdiv(loft(n + '_ojiva', [(-2.0, 0.01, 0.01, 0), (-1.96, 0.045, 0.045, 0), (-1.86, 0.085, 0.085, 0), (-1.72, 0.117, 0.117, 0),
                                (-1.58, 0.139, 0.139, 0), (-1.45, r, r, 0)], p, gris, n=20, cerrar=(True, False)), 1)
    loft(n + '_banda', [(-1.45, r, r, 0), (-1.31, r, r, 0)], p, negro, n=20, cerrar=(False, False))
    loft(n + '_cuerpo', [(-1.31, r, r, 0), (1.86, r, r, 0), (1.98, r * 0.86, r * 0.86, 0)], p, blanco, n=20, cerrar=(False, False))
    loft(n + '_tobera', [(1.98, r * 0.86, r * 0.86, 0), (2.02, r * 0.7, r * 0.7, 0)], p, negro, n=20, cerrar=(False, True))
    for z0, m in ((-0.30, negro), (-0.26, amar), (-0.22, negro)):
        loft(n + '_raya', [(z0, r + 0.003, r + 0.003, 0), (z0 + 0.025, r + 0.003, r + 0.003, 0)], p, m, n=20, cerrar=(False, False))
    loft(n + '_junta', [(0.55, r + 0.002, r + 0.002, 0), (0.565, r + 0.002, r + 0.002, 0)], p, _mat(K, n + 'j', '#b7bcb9'), n=20, cerrar=(False, False))
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        _aleta_eje(n + '_ala', p, ala, [(r * 0.9, 0.05), (r + 0.48, 0.98), (r + 0.48, 1.18), (r * 0.9, 1.26)], 0.03, a)
        _aleta_eje(n + '_cola', p, ala, [(r * 0.9, 1.56), (r + 0.26, 1.84), (r + 0.26, 1.97), (r * 0.9, 1.98)], 0.025, a)
    for z in (-0.6, 0.35):
        caja(n + '_oreja', (0, r + 0.03, z), (0.05, 0.06, 0.12), p, gris)
    return p

def carta_exocet(T, K):
    """EL EXOCET AM39 (rehecho 25/11/2026 con las fotos del autor): de costado y en tres cuartos, quieto, como en el
    museo — se lee entero: la ojiva gris, la banda negra, las alas en X."""
    raiz, p = _marco(T, 'exocet')
    _exocet_am39(p, K)
    return _encuadrar(raiz, p, (0.32, -1.95, 0.2), tam=3.5)

def carta_eyeccion(T, K):
    """LA EYECCION (25/11/2026, el autor: "con el asiento y pinta de piloto"): el asiento eyectable Martin-Baker
    saliendo con el cohete encendido abajo; el piloto sentado, atado, con
    el casco blanco y el visor bajo, el buzo de vuelo, el chaleco y las dos manos tirando de la manija de cara
    (la cortina, amarilla y negra) por encima del casco."""
    raiz, p = _marco(T, 'eyeccion')
    asiento, asiento2 = _mat(K, 'ey_a', '#3d4246'), _mat(K, 'ey_a2', '#2a2e31')
    gris, amar, negro = _mat(K, 'ey_g', '#7d868b'), _mat(K, 'ey_y', '#e8c23a'), _mat(K, 'ey_n', NEGRO)
    buzo, buzo2 = _mat(K, 'ey_b', '#5f6a4a'), _mat(K, 'ey_b2', '#4b5539')
    chaleco, casco, visor = _mat(K, 'ey_c', '#c9822e'), _mat(K, 'ey_k', '#eceae2'), _mat(K, 'ey_v', '#1e2a33')
    # EL ASIENTO: el respaldo alto con los rieles, la cubeta, el cajon del paracaidas arriba (headbox)
    caja('respaldo', (0, 0.75, -0.45), (1.0, 1.9, 0.22), p, asiento)
    for sx in (-0.56, 0.56):
        caja('riel', (sx, 0.85, -0.52), (0.1, 2.2, 0.14), p, gris)
        caja('lateral', (sx * 0.95, -0.05, 0.02), (0.08, 0.45, 0.95), p, asiento2)
    caja('cubeta', (0, -0.25, 0.05), (1.0, 0.16, 0.95), p, asiento2)
    caja('cajon', (0, 1.95, -0.38), (0.8, 0.5, 0.42), p, asiento)
    caja('franja', (0, 1.95, -0.16), (0.8, 0.08, 0.02), p, amar)
    # el COHETE abajo: el tubo y el fuego hacia abajo-atras, con el humo
    caja('cohete', (0, -0.48, -0.15), (0.5, 0.22, 0.6), p, gris)
    ll = _vacio(p, 'llama'); ll.location = (0, -0.6, -0.15); ll.rotation_euler = (math.pi / 2 - 0.2, 0, 0)
    for i, (c, k) in enumerate((('#f07a22', 1.0), ('#ffd36a', 0.62), ('#fff4d0', 0.3))):
        loft('llama%d' % i, [(0, 0.24 * k, 0.24 * k, 0), (0.95 * k + 0.25, 0.02, 0.02, 0)], ll, K['mat_emisivo']('ey_f%d' % i, c), n=10, cerrar=(True, True))
    _humo(p, K, [(0.05 * math.sin(i * 1.7), -1.45 - 0.3 * i, -0.4 - 0.12 * i) for i in range(2)], 0.2, 0.3, '#d9d6d0')
    # EL PILOTO: piernas sobre la cubeta, el torso contra el respaldo
    for sx in (-0.2, 0.2):
        _barra('muslo', p, buzo2, (sx, -0.02, -0.15), (sx * 1.1, 0.0, 0.62), 0.24)
        _barra('pierna', p, buzo2, (sx * 1.1, 0.0, 0.62), (sx * 1.15, -0.72, 0.78), 0.2)
        caja('bota', (sx * 1.15, -0.85, 0.86), (0.2, 0.18, 0.36), p, negro)
    elipsoide('torso', (0, 0.42, -0.18), (0.36, 0.5, 0.24), p, buzo, seg=14, anillos=10)
    elipsoide('chaleco', (0, 0.5, -0.12), (0.38, 0.36, 0.25), p, chaleco, seg=14, anillos=10)
    for sx in (-0.17, 0.17):                                                # el arnes
        _barra('arnes', p, gris, (sx, 0.85, -0.02), (sx * 0.6, 0.05, 0.08), 0.06)
    _barra('cinturon', p, gris, (-0.38, 0.08, 0.05), (0.38, 0.08, 0.05), 0.07)
    elipsoide('cuello', (0, 0.98, -0.2), (0.12, 0.1, 0.12), p, buzo, seg=10, anillos=6)
    elipsoide('casco', (0, 1.22, -0.18), (0.26, 0.28, 0.27), p, casco, seg=18, anillos=12)
    elipsoide('visor', (0, 1.2, 0.02), (0.2, 0.12, 0.1), p, visor, seg=14, anillos=8)
    elipsoide('mascara', (0, 1.02, 0.06), (0.1, 0.1, 0.1), p, _mat(K, 'ey_m', '#4a4f47'), seg=10, anillos=6)
    # los BRAZOS para arriba tirando de la manija de cara, y la manija rayada amarilla y negra
    for sx in (-1, 1):
        _barra('brazo', p, buzo, (sx * 0.33, 0.8, -0.15), (sx * 0.34, 1.35, 0.1), 0.15)
        _barra('antebrazo', p, buzo, (sx * 0.34, 1.35, 0.1), (sx * 0.16, 1.68, 0.02), 0.13)
        elipsoide('guante', (sx * 0.14, 1.72, 0.0), (0.08, 0.08, 0.08), p, negro, seg=8, anillos=6)
    pts = [(-0.32, 2.12, -0.2), (-0.26, 1.75, 0.0), (0.0, 1.7, 0.02), (0.26, 1.75, 0.0), (0.32, 2.12, -0.2)]
    for i in range(len(pts) - 1):
        _barra('manija%d' % i, p, amar if i % 2 == 0 else negro, pts[i], pts[i + 1], 0.06)
    # (25/11, el autor: "el paracaidas debe ser mas grande o no estar"): el paracaidas piloto se saco — chiquito arriba
    # no se leia y achicaba al asiento. Sin el, el encuadre llena el cuadro con el asiento y el piloto.
    return _encuadrar(raiz, p, (0.22, 0.85, -0.18), tam=3.4)

def carta_rasante(T, K):
    """EL RASANTE (25/11/2026, el autor: "camara desde atras a 45°, como el poder RASANTE"): el A-4 de cola, visto de
    atras y de arriba, pegado al mar, con el rocio que levanta y la estela que deja en el agua."""
    raiz, p = _marco(T, 'rasante')
    av = _adoptar(_avion(T, K, 'sky'), p); av.location = (0, 0.55, 0)
    agua, agua2, cresta = _mat(K, 'ras_a', '#3f6f86'), _mat(K, 'ras_a2', '#335d72'), _mat(K, 'ras_c', '#cfe3e8')
    caja('mar', (0, -0.1, -0.5), (4.6, 0.12, 6.0), p, agua)
    rnd = random.Random(3)
    for i in range(16):
        caja('ola%d' % i, (0, 0, 0), (rnd.uniform(0.5, 1.3), 0.03, 0.08), p, cresta if i % 2 else agua2).location = (
            rnd.uniform(-2.1, 2.1), -0.03, rnd.uniform(-3.3, 2.3))
    # la ESTELA en el agua: dos surcos blancos que se abren detras
    for s in (-1, 1):
        for i in range(7):
            caja('surco', (0, 0, 0), (0.12, 0.03, 0.5), p, cresta).location = (s * (0.15 + 0.11 * i), -0.02, 1.0 + 0.55 * i)
    _nube_rocio = [(s * (0.35 + 0.12 * i), 0.08 + 0.05 * i, 0.9 + 0.35 * i) for s in (-1, 1) for i in range(3)]
    _humo(p, K, _nube_rocio, 0.1, 0.18, '#e8f1f2')
    return _encuadrar(raiz, p, (0.3, 0.55, 0), tam=3.4)

def carta_espoleta(T, K):
    """LA ESPOLETA (rehecha 25/11/2026: "¿es correcta historicamente? quiza conviene hacer una espoleta"): la de NARIZ
    de las bombas de 1982, mecanica, desenroscada de la ojiva y por delante de ella — la rosca, el cuerpo de acero,
    el anillo de seguro y la HELICE de armado (el molinete que el viento hace girar al caer y arma la bomba), con el
    alambre de seguro que la traba hasta que se suelta. Detras, la nariz de la bomba verde con su faja amarilla, para
    que se lea que es la espoleta DE UNA BOMBA."""
    raiz, p = _marco(T, 'espoleta')
    verde, faja = _mat(K, 'es_v', '#5c6447'), _mat(K, 'es_y', AMARILLO)
    acero, acero2, laton = _mat(K, 'es_a', ACERO), _mat(K, 'es_a2', ACERO2), _mat(K, 'es_l', LATON)
    # la NARIZ de la bomba (la mitad de adelante, nariz hacia -z) con la boca roscada vacia
    _subdiv(loft('nariz', [(-1.2, 0.2, 0.2, 0), (-1.05, 0.42, 0.42, 0), (-0.7, 0.68, 0.68, 0), (-0.2, 0.8, 0.8, 0), (1.4, 0.8, 0.8, 0)],
                 p, verde, n=22, cerrar=(True, True)), 1)
    loft('faja', [(-0.55, 0.78, 0.78, 0), (-0.4, 0.78, 0.78, 0)], p, faja, n=22, cerrar=(False, False))
    loft('faja2', [(-0.2, 0.815, 0.815, 0), (-0.08, 0.815, 0.815, 0)], p, faja, n=22, cerrar=(False, False))
    loft('boca', [(-1.215, 0.15, 0.15, 0), (-1.2, 0.15, 0.15, 0)], p, _mat(K, 'es_n', NEGRO), n=14, cerrar=(True, False))
    # LA ESPOLETA, afuera, sobre el mismo eje
    e = _vacio(p, 'espoleta'); e.location = (0, 0.25, -2.35); e.scale = (2.0, 2.0, 2.0)
    for i in range(6):                                                     # la rosca
        z = 0.55 - i * 0.07
        loft('rosca%d' % i, [(z, 0.14 if i % 2 else 0.16, 0.14 if i % 2 else 0.16, 0), (z - 0.07, 0.14 if i % 2 else 0.16, 0.14 if i % 2 else 0.16, 0)],
             e, acero2, n=14, cerrar=(False, False))
    loft('cuerpo', [(0.13, 0.23, 0.23, 0), (-0.25, 0.23, 0.23, 0), (-0.45, 0.17, 0.17, 0), (-0.6, 0.1, 0.1, 0)], e, acero, n=18, cerrar=(True, True))
    loft('seguro', [(0.02, 0.245, 0.245, 0), (-0.06, 0.245, 0.245, 0)], e, laton, n=18, cerrar=(False, False))
    loft('eje', [(-0.6, 0.035, 0.035, 0), (-0.78, 0.035, 0.035, 0)], e, acero2, n=8, cerrar=(True, True))
    for k in range(4):                                                     # la helice de armado
        a = k * math.pi / 2 + 0.3
        pa = _vacio(e, 'pala%d' % k); pa.location = (0, 0, -0.74); pa.rotation_euler = (0, 0, a)
        f = caja('pala', (0.22, 0, 0), (0.36, 0.13, 0.025), pa, laton); f.rotation_euler = (0.55, 0, 0)
    # el ALAMBRE de seguro: pasa por la helice y se va hacia atras, con su chapita
    alambre = _mat(K, 'es_w', '#c9b27a')
    pts = [(0.0, 0.5, -3.85), (0.15, 0.95, -3.6), (0.3, 1.35, -3.0), (0.4, 1.55, -2.3), (0.45, 1.65, -1.7)]
    for i in range(len(pts) - 1): _barra('alambre%d' % i, p, alambre, pts[i], pts[i + 1], 0.03)
    c = caja('chapita', (0.47, 1.72, -1.5), (0.03, 0.3, 0.45), p, _mat(K, 'es_t', ROJO))
    return _encuadrar(raiz, p, (0.3, 1.25, 0.2), tam=3.4)

def _cartucho(p, K, x, z, y=0.0, n='ct'):
    """Un cartucho de chafitas (como municion_chafita): el tubo de aluminio parado, las costuras, la faja y la tapa."""
    alu, cost = _mat(K, n + 'a', '#d4dce1'), _mat(K, n + 'c', '#8f9aa1')
    _cil('tubo', p, alu, [(y, 0.24), (y + 1.2, 0.24)], x=x, z=z)
    for yy in (0.3, 0.9):
        _cil('costura', p, cost, [(y + yy - 0.02, 0.245), (y + yy + 0.02, 0.245)], x=x, z=z)
    _cil('faja', p, _mat(K, n + 'f', '#e2dcc4'), [(y + 0.5, 0.25), (y + 0.7, 0.25)], x=x, z=z)
    _cil('tapa', p, _mat(K, n + 't', '#a8865a'), [(y + 1.2, 0.235), (y + 1.25, 0.235)], x=x, z=z)

def _nube(p, K, centro, n, ancho, semilla=7):
    rnd = random.Random(semilla)
    plata = [_mat(K, 'nb%d' % i, c) for i, c in enumerate(('#d9dee0', '#aeb5b8', '#f2f4f4'))]
    cx, cy, cz = centro
    for i in range(n):
        t = caja('tira%d' % i, (0, 0, 0), (0.05, 0.3, 0.015), p, plata[i % 3])
        t.location = (cx + rnd.uniform(-ancho, ancho), cy + rnd.uniform(0, ancho * 1.2), cz + rnd.uniform(-ancho * 0.5, ancho * 0.5))
        t.rotation_euler = (rnd.uniform(0, 3), rnd.uniform(0, 3), rnd.uniform(0, 3))

def _chafitas_n(T, K, nombre, n, tiras=22, recarga=False):
    raiz, p = _marco(T, nombre)
    lugares = [(0, 0), (0.62, 0.2), (-0.62, 0.2), (0.3, -0.55)][:n]
    for i, (x, z) in enumerate(lugares): _cartucho(p, K, x, z, n='ct%d' % i)
    _nube(p, K, (0, 1.6, 0), tiras, 0.7 + 0.15 * n)
    if recarga:                                                            # la flecha que da la vuelta: se recargan solas
        verde = K['mat_emisivo']('rec', '#6fe08a')
        pts = [(1.25 * math.cos(a), 0.6 + 1.25 * math.sin(a) * 0.5, 0.9) for a in [0.4 + k * 0.42 for k in range(12)]]
        for i in range(len(pts) - 1): _barra('flecha%d' % i, p, verde, pts[i], pts[i + 1], 0.12)
        x, y, z = pts[-1]
        _barra('punta1', p, verde, (x, y, z), (x + 0.35, y + 0.05, z), 0.12)
        _barra('punta2', p, verde, (x, y, z), (x + 0.1, y + 0.35, z), 0.12)
    return _encuadrar(raiz, p, (0.3, 0.5, 0), tam=3.1)

def carta_chaf2(T, K): return _chafitas_n(T, K, 'chaf2', 2)
def carta_chaf3(T, K): return _chafitas_n(T, K, 'chaf3', 3)
def carta_chaf4(T, K): return _chafitas_n(T, K, 'chaf4', 4)
def carta_chaf_rec(T, K): return _chafitas_n(T, K, 'chaf_rec', 2, recarga=True)
def carta_chaf_den(T, K): return _chafitas_n(T, K, 'chaf_den', 1, tiras=70)

def carta_llave(T, K):
    """LA REPARACION (rehecha 25/11/2026: "una llave inglesa mucho mejor diseñada, y una chapa con remaches"): la llave
    inglesa —el mango con su nervio, la cabeza con la mandibula fija, la movil y el tornillo sin fin moleteado que la
    abre— apoyada en diagonal sobre una chapa del avion con las costuras y las filas de remaches."""
    raiz, p = _marco(T, 'llave')
    chapa, chapa2, rem = _mat(K, 'll_c', '#6f7a80'), _mat(K, 'll_c2', '#545d62'), _mat(K, 'll_r', '#aab3b7')
    caja('chapa', (0, 0, -0.25), (3.4, 3.4, 0.14), p, chapa)
    for y in (-0.85, 0.85): caja('costura', (0, y, -0.17), (3.4, 0.05, 0.02), p, chapa2)
    caja('costura_v', (0.4, 0, -0.17), (0.05, 3.4, 0.02), p, chapa2)
    pts = [(-1.55 + 0.24 * i, y, -0.16) for i in range(14) for y in (-0.72, 0.72, -1.58, 1.58)]
    pts += [(0.28, -1.5 + 0.24 * i, -0.16) for i in range(13)] + [(0.52, -1.5 + 0.24 * i, -0.16) for i in range(13)]
    _remaches(p, rem, pts, 0.045)
    # LA LLAVE INGLESA, en el plano xy, con espesor en z (la boca arriba)
    g = _vacio(p, 'llave'); g.rotation_euler = (0, 0, -0.75)
    acero, acero2, oscuro = _mat(K, 'll_a', '#c9d0d3'), _mat(K, 'll_a2', '#8f989c'), _mat(K, 'll_o', NEGRO)
    mango = [(-0.16, -1.75), (-0.1, -1.85), (0.1, -1.85), (0.16, -1.75), (0.2, 0.25), (0.42, 0.5), (0.42, 0.95), (0.18, 1.0),
             (0.18, 0.72), (-0.2, 0.72), (-0.2, 1.55), (-0.42, 1.55), (-0.5, 0.95), (-0.42, 0.45), (-0.2, 0.25)]
    _poli('mango', g, acero, mango, 0.18)
    _poli('nervio', g, acero2, [(-0.06, -1.5), (0.06, -1.5), (0.08, 0.15), (-0.08, 0.15)], 0.22)
    disco('agujero', (0, -1.68, 0.1), 0.07, g, oscuro, seg=12)
    # la mandibula movil (corre sobre la cabeza) y el sin fin
    _poli('movil', g, acero2, [(0.1, 0.72), (0.44, 0.72), (0.44, 1.32), (0.26, 1.32), (0.26, 0.95), (0.1, 0.95)], 0.16)
    sf = _vacio(g, 'sinfin'); sf.location = (0.1, 0.6, 0.1); sf.rotation_euler = (0, 0, math.pi / 2)
    for i in range(6):
        _cil('estria%d' % i, sf, acero2 if i % 2 else _mat(K, 'll_e', '#5b6468'), [(-0.2 + i * 0.07, 0.13), (-0.13 + i * 0.07, 0.13)])
    return _encuadrar(raiz, p, (-0.55, 0.3, 0.0), tam=3.3)

def carta_rapier(T, K):
    """RAPIER Y BLOWPIPE (25/11/2026): el lanzador Rapier de cuatro misiles en su loma, y adelante el soldado con el
    Blowpipe al hombro — los dos que te tiraban desde la costa a la salida."""
    raiz, p = _marco(T, 'rapier')
    Ti = _mod('modelos_bl_tierra_c2', 'modelos_tierra.py')
    pasto, pasto2 = _mat(K, 'rp_p', '#5f6f42'), _mat(K, 'rp_p2', '#4c5a34')
    elipsoide('loma', (0, -0.3, 0), (3.4, 0.45, 2.6), p, pasto, seg=24, anillos=10)
    rnd = random.Random(11)
    for i in range(10):
        elipsoide('mata', (rnd.uniform(-2.6, 2.6), 0.05, rnd.uniform(-1.8, 1.8)), (0.3, 0.15, 0.3), p, pasto2, seg=8, anillos=5)
    r = _vacio(p, 'rapier'); r.location = (-0.9, 0.05, -0.6); r.rotation_euler = (0, 0.5, 0); r.scale = (0.7, 0.7, 0.7)
    Ti.rapier(r, K, 0.45)
    s = _vacio(p, 'soldado'); s.location = (1.4, 0.05, 0.9); s.scale = (1.5, 1.5, 1.5)
    Ti.soldado(s, K, 0, 0, -math.pi / 2 + 0.5, 'tubo')
    return _encuadrar(raiz, p, (0.32, 0.55, 0), tam=3.3)

def carta_itb(T, K):
    """LA ITB (rehecha 25/11/2026, de costado: "desde abajo no se aprecia"): la Instalacion de Tiro Berreta — el
    contenedor-lanzador de un Exocet MM38 sacado de un destructor, armado en Puerto Argentino sobre un trailer, con
    los gatos clavados al piso. El 12 de junio alcanzo al HMS Glamorgan. El cajon con sus costillas y la tapa de
    adelante, levantado unos grados, y la nariz gris del misil asomando."""
    raiz, p = _marco(T, 'itb')
    verde, verde2, negro = _mat(K, 'itb_v', OLIVA), _mat(K, 'itb_v2', OLIVA2), _mat(K, 'itb_n', NEGRO)
    naval, naval2 = _mat(K, 'itb_g', '#8a9297'), _mat(K, 'itb_g2', '#646d72')
    # el TRAILER, a lo largo de x (de costado), con la lanza y las ruedas
    caja('chasis', (0, 0, 0), (4.2, 0.24, 1.4), p, verde)
    for z in (-0.62, 0.62): caja('larguero', (0, -0.18, z), (4.2, 0.14, 0.14), p, verde2)
    _barra('lanza', p, verde2, (-2.1, -0.05, 0), (-3.1, -0.3, 0), 0.14)
    elipsoide('ojo', (-3.15, -0.3, 0), (0.12, 0.12, 0.12), p, negro, seg=8, anillos=5)
    for x in (0.5, 1.25):
        for z in (-0.8, 0.8):
            g = _vacio(p, 'r'); g.location = (x, -0.45, z); g.rotation_euler = (math.pi / 2, 0, 0)
            _cil('rueda', g, negro, [(-0.13, 0.36), (0.13, 0.36)])
            _cil('llanta', g, naval2, [(-0.14, 0.18), (0.14, 0.18)])
    for x in (-1.8, 1.9):                                                  # los gatos al piso
        _barra('gato', p, naval2, (x, -0.1, 0.6), (x, -0.8, 0.75), 0.1)
        caja('pie', (x, -0.82, 0.75), (0.3, 0.05, 0.3), p, naval2)
    # el AFUSTE y el CONTENEDOR del MM38, inclinado
    caja('afuste', (0.4, 0.45, 0), (1.2, 0.7, 0.9), p, naval2)
    c = _vacio(p, 'contenedor'); c.location = (0.2, 1.15, 0); c.rotation_euler = (0, 0, 0.18)
    caja('cajon', (0, 0, 0), (4.6, 0.72, 0.72), c, naval)
    for i in range(9): caja('costilla%d' % i, (-2.1 + i * 0.52, 0, 0), (0.07, 0.8, 0.8), c, naval2)
    caja('tapa', (-2.33, 0, 0), (0.05, 0.62, 0.62), c, negro)
    # la nariz del misil asomando de la boca abierta
    n = _vacio(c, 'nariz'); n.location = (-2.35, 0, 0); n.rotation_euler = (0, -math.pi / 2, 0)
    _subdiv(loft('ojiva', [(-0.45, 0.01, 0.01, 0), (-0.3, 0.1, 0.1, 0), (-0.1, 0.17, 0.17, 0), (0.05, 0.18, 0.18, 0)], n,
                 _mat(K, 'itb_o', '#8d959a'), n=16, cerrar=(True, True)), 1)
    return _encuadrar(raiz, p, (0.18, -0.35, 0), tam=3.4)

def carta_pinza(T, K):
    """EL ATAQUE COORDINADO (rehecho 25/11/2026: "2 aviones volando a 45° o de costado, y la camara ve los dos de
    costado"): dos A-4 en escalon, de perfil, bajando juntos sobre el blanco — uno adelante y abajo, el otro atras y
    arriba — con las rayas de velocidad detras."""
    raiz, p = _marco(T, 'pinza')
    estela = _mat(K, 'pin_e', '#d9dcd8')
    for i, (x, y, z) in enumerate(((-0.9, -1.0, 0.6), (1.2, 1.1, -0.6))):
        g = _vacio(p, 'av%d' % i); g.location = (x, y, z)
        _apuntar(g, (-1, -0.42, 0), 0.25)
        _adoptar(_avion(T, K, 'sky'), g)
        for k in range(3):
            _barra('raya%d%d' % (i, k), p, estela, (x + 2.0, y + 0.85 + 0.25 * (k - 1), z), (x + 3.6, y + 1.5 + 0.25 * (k - 1), z), 0.05)
    return _encuadrar(raiz, p, (0.2, 0.25, 0), tam=3.4)

# ---------------- LAS PIRUETAS, una por una ----------------
def _maniobra(T, K, nombre, camino, giro=(0.35, 0.3, 0), rolido=0.0, mar=False, techo=None, esc=0.62):
    """Una pirueta: el CAMINO que hace el avion como una estela de humo que engorda hacia atras, y el A-4 al final,
    apuntando hacia donde sigue. `mar`: el agua abajo (lo rasante). `techo`: la raya punteada roja del radar."""
    raiz, p = _marco(T, nombre)
    return _maniobra_en(raiz, p, T, K, nombre, camino, giro, rolido, mar, techo, esc)

def _maniobra_en(raiz, p, T, K, nombre, camino, giro=(0.35, 0.3, 0), rolido=0.0, mar=False, techo=None, esc=0.62):
    pts = [Vector(q) for q in camino]
    # suavizar: Catmull-Rom con 6 pasos por tramo
    fino = []
    for i in range(len(pts) - 1):
        p0, p1, p2, p3 = pts[max(0, i - 1)], pts[i], pts[i + 1], pts[min(len(pts) - 1, i + 2)]
        for s in range(6):
            t = s / 6
            fino.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    fino.append(pts[-1])
    humo = [_mat(K, nombre + 'h%d' % i, c) for i, c in enumerate(('#f4f6f2', '#dfe3de', '#c9cec9'))]
    n = len(fino)
    for i in range(n - 2):
        r = 0.07 + 0.16 * (1 - i / n)
        _barra('humo%d' % i, p, humo[min(2, int(3 * (1 - i / n)))], fino[i], fino[i + 1], r)
    g = _vacio(p, 'avion'); g.location = fino[-1]; g.scale = (esc, esc, esc)
    _apuntar(g, fino[-1] - fino[-3], rolido)
    _adoptar(_avion(T, K, 'sky'), g)
    if mar:
        ys = min(q.y for q in fino) - 0.35
        xs = [q.x for q in fino]; zs = [q.z for q in fino]
        caja('mar', ((max(xs) + min(xs)) / 2, ys, (max(zs) + min(zs)) / 2), (max(xs) - min(xs) + 2.5, 0.08, max(zs) - min(zs) + 2.0), p, _mat(K, nombre + 'm', '#3f6f86'))
    if techo is not None:
        rojo = K['mat_emisivo'](nombre + 'r', '#e05a3c')
        xs = [q.x for q in fino]
        x0, x1 = min(xs) - 0.8, max(xs) + 0.8
        k = 0
        x = x0
        while x < x1:
            _barra('techo%d' % k, p, rojo, (x, techo, 0), (min(x1, x + 0.35), techo, 0), 0.06); x += 0.6; k += 1
    return _encuadrar(raiz, p, giro, tam=3.4)

def carta_pir_mask(T, K):
    return _maniobra(T, K, 'pir_mask', [(4, 2.0, 0), (2.5, 1.2, 0), (1.2, 0.35, 0), (-0.5, 0.15, 0), (-2.5, 0.15, 0)], (0.45, 0.35, 0), mar=True)
def carta_pir_splits(T, K):
    c = [(4.0, 3.0, 0), (2.3, 3.0, 0)] + [(1.0 + 1.25 * math.cos(a), 1.75 + 1.25 * math.sin(a), 0) for a in [math.pi / 2 + k * math.pi / 6 for k in range(1, 7)]] + [(2.6, 0.5, 0), (3.8, 0.5, 0)]
    return _maniobra(T, K, 'pir_splits', c, (0.2, 0.35, 0))
def carta_pir_breakt(T, K):
    c = [(3.5, 0, 2.0), (1.5, 0, 2.0)] + [(0.5 + 1.6 * math.cos(a), 0, 0.4 + 1.6 * math.sin(a)) for a in [math.pi / 2 + k * 0.4 for k in range(1, 7)]]
    return _maniobra(T, K, 'pir_breakt', c, (0.9, 0.0, 0), rolido=-1.2)
def carta_pir_loyo(T, K):
    return _maniobra(T, K, 'pir_loyo', [(4, 2.2, 0), (2.4, 2.0, 0), (1.0, 0.7, 0), (-0.4, 0.6, 0), (-1.8, 1.4, 0), (-2.8, 2.3, 0)], (0.25, 0.3, 0))
def carta_pir_sturn(T, K):
    return _maniobra(T, K, 'pir_sturn', [(4, 0, 0), (2.6, 0, 1.0), (1.2, 0, 0), (-0.2, 0, -1.0), (-1.6, 0, 0), (-2.8, 0, 0.6)], (0.95, 0, 0), rolido=0.5)
def carta_pir_popup(T, K):
    return _maniobra(T, K, 'pir_popup', [(4.5, 0.3, 0), (2.6, 0.3, 0), (1.4, 1.4, 0), (0.4, 2.3, 0), (-0.6, 2.2, 0), (-1.6, 1.4, 0)], (0.3, 0.35, 0), mar=True)
def carta_pir_hiyo(T, K):
    return _maniobra(T, K, 'pir_hiyo', [(4, 0.8, 0), (2.4, 1.0, 0), (1.2, 2.3, 0), (0, 2.9, 0), (-1.2, 2.4, 0), (-2.2, 1.3, 0)], (0.25, 0.3, 0))
def carta_pir_jink(T, K):
    return _maniobra(T, K, 'pir_jink', [(4, 0, 0), (3.0, 0, 0.9), (2.0, 0, -0.9), (1.0, 0, 0.9), (0.0, 0, -0.9), (-1.2, 0, 0.3)], (0.95, 0, 0), rolido=-0.6)
def carta_pir_spin(T, K):
    c = [(1.5 * math.cos(a), 5.0 - 0.5 * a, 1.5 * math.sin(a)) for a in [k * 0.5 for k in range(18)]]
    return _maniobra(T, K, 'pir_spin', c, (0.35, 0.2, 0), rolido=1.0, esc=0.3)
def carta_pir_climb(T, K):
    return _maniobra(T, K, 'pir_climb', [(4, 0.3, 0), (2.6, 0.35, 0), (1.6, 0.9, 0), (0.9, 1.8, 0), (0.5, 2.6, 0)], (0.2, 0.3, 0), mar=True, techo=3.1)
def carta_pir_climbmax(T, K):
    return _maniobra(T, K, 'pir_climbmax', [(4, 0.3, 0), (2.6, 0.35, 0), (1.6, 0.9, 0), (0.9, 2.0, 0), (0.5, 3.2, 0), (0.3, 4.2, 0)], (0.2, 0.3, 0), mar=True, techo=2.8)
def carta_pir_barrel(T, K):
    c = [(5.0 - 0.45 * k, 1.5 + 1.4 * math.cos(k * 0.55), 1.4 * math.sin(k * 0.55)) for k in range(17)]
    return _maniobra(T, K, 'pir_barrel', c, (0.25, 0.85, 0), rolido=0.8, esc=0.32)
def carta_pir_salto(T, K):
    """EL SALTO DE OLA (25/11/2026): al ras, un saltito por encima de la cresta de una ola y otra vez abajo."""
    raiz, p = _marco(T, 'pir_salto_ola')
    ola, cresta = _mat(K, 'sal_o', '#4f87a0'), _mat(K, 'sal_c', '#e6f1f3')
    for i in range(9):                                                       # la ola: una loma de agua con espuma arriba
        a = (i - 4) / 4
        elipsoide('ola%d' % i, (0.35 * a, 0.25 + 0.7 * (1 - a * a), 0.6 * a), (0.55, 0.55, 0.9), p, ola, seg=10, anillos=6)
    for i in range(6):
        elipsoide('espuma%d' % i, (0.1 * i - 0.25, 1.05 + 0.05 * (i % 2), -0.5 + 0.2 * i), (0.22, 0.12, 0.2), p, cresta, seg=8, anillos=5)
    return _maniobra_en(raiz, p, T, K, 'pir_salto', [(4.2, 0.35, 0), (2.4, 0.35, 0), (1.0, 2.2, 0), (-0.4, 2.3, 0), (-1.6, 0.6, 0), (-3.2, 0.35, 0)],
                        (0.3, 0.35, 0), mar=True)
