# LAS LAMINAS DEL LIBRO DE VUELO (23/11/2026): dibujos de LINEA para las tarjetas de contexto de las
# misiones reales — el monitor de fosforo verde. El autor: "agregarles graficos e imagenes de elementos,
# bombas, barcos, aviones… no llenar pero si ayudar, con ese efecto verde, todo lineas o vectorizado".
#
# Este es el paso de BLENDER: arma el modelo (los mismos de modelos*.py que hornea el juego), lo ve con
# una camara ORTOGRAFICA (plano tecnico) y lo dibuja con FREESTYLE: silueta, contorno, bordes y pliegues,
# con las lineas ocultas sacadas. Sale un PNG crudo: lineas blancas sobre la silueta negra opaca (el
# relleno lo usa el paso siguiente para el tono tenue). El verde, el resplandor y la reduccion a 480x270
# los hace tools/blender/armar_laminas.py (que ademas corre este script por cada lamina).
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
#       --python tools/blender/hornear_laminas.py -- --lamina supere_exocet --out tools/blender/out/laminas/supere_exocet.png
import bpy, math, os, sys, importlib.util
from mathutils import Vector, Matrix

AQUI = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
LAMINA = arg('--lamina', 'supere_exocet')
OUT = arg('--out', os.path.join(AQUI, 'out', 'laminas', LAMINA + '.png'))
ESC = int(arg('--esc', '3'))            # se renderiza a ESC x 480x270 y armar_laminas.py lo reduce (antialias)
GROSOR = float(arg('--grosor', '2.0'))  # grosor de linea en pixeles de la lamina final

def cargar(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(AQUI, archivo))
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod

H = cargar('horno_lam', 'hornear.py')
MOD = cargar('modelos_lam', 'modelos.py')

def K_nuevo(cargas=True):
    return dict(mat_cel=H.mat_cel, mat_cel_nodo=H.mat_cel_nodo, mat_emisivo=H.mat_emisivo, lin=H.lin,
                perilla=H.perilla, mezcla=H.mezcla, ocultar_si=H.ocultar_si,
                cargas=cargas, controles=False, insignias=False)

def solo_capas(raiz, K, capas):
    """De las cargas armadas por modelos.cargas, deja SOLO las de `capas` (y saca el tren)."""
    if 'piezas' not in K: return
    quedan = set()
    for g in capas: quedan.update(o.name for o in K['piezas'].get(g, []))
    for g, obs in K['piezas'].items():
        for o in obs:
            if o.name not in quedan:
                o.hide_render = True
                for ch in o.children_recursive: ch.hide_render = True

# ============================ LOS MODELOS DE CADA LAMINA ============================
def m_supere(T):
    K = K_nuevo()
    raiz = MOD.construir('supere', T, K)
    solo_capas(raiz, K, ('exocet', 'pilon_exocet', 'tanque_babor', 'pilon_babor'))
    return raiz

def m_a4c(T):
    K = K_nuevo()
    raiz = MOD.construir('sky', T, K)
    solo_capas(raiz, K, ('tanques_ala', 'pilon_ala'))
    return raiz

def m_exocet(T):
    return cargar('modelos_libro_lam', 'modelos_libro.py').exocet_am39(T, K_nuevo(cargas=False))

def m_kc130(T):
    E = cargar('modelos_enemigos_lam', 'modelos_enemigos.py')
    K = K_nuevo(cargas=False)
    raiz = E.hercules(T, K)
    gris = H.mat_cel('gris', '#8e9a95')
    # (las HELICES no: a este tamaño un disco por motor es una mancha; quedan los conos)
    # LA MANGUERA Y LA CANASTA del pod de ESTRIBOR, en catenaria hacia atras y abajo
    px, py, pz = E.CH_POD
    largo, caida = 6.0, 1.3
    est = []
    for i in range(13):
        t = i / 12
        est.append((pz + t * largo, 0.07, 0.07, py - caida * (t ** 1.6)))
    MOD.loft('manguera', est, raiz, gris, n=8, expo=2.0, cerrar=(True, True), x0=px)
    zc, yc = pz + largo, py - caida
    MOD.loft('canasta', [(zc - 0.05, 0.10, 0.10, yc), (zc + 0.25, 0.22, 0.22, yc), (zc + 0.9, 0.62, 0.62, yc), (zc + 0.95, 0.60, 0.60, yc)],
             raiz, gris, n=16, expo=2.0, cerrar=(True, False), x0=px)
    # EL SUPER ETENDARD, detras y abajo, con la SONDA metida en la canasta. La Chancha esta en su escala
    # (16,5 unidades = 29,8 m: 0,554 por metro) y el caza en la del A-4 (0,61 por metro)
    K2 = K_nuevo()
    piv = bpy.data.objects.new('se_piv', None); bpy.context.scene.collection.objects.link(piv); piv.parent = raiz
    se = MOD.construir('supere', piv, K2)
    solo_capas(se, K2, ('exocet', 'pilon_exocet', 'tanque_babor', 'pilon_babor'))
    k = 0.554 / 0.61
    piv.scale = (k, k, k)
    punta = Vector((0.0, 0.36, -3.95)) * k          # la punta de la sonda (modelos.py, ficha supere)
    piv.location = Vector((px, yc, zc + 0.55)) - punta
    return raiz

def m_belgrano(T):
    L_ = cargar('modelos_libro_lam', 'modelos_libro.py')
    return L_.belgrano_hundiendose(T, K_nuevo(cargas=False))

def m_invincible(T):
    L_ = cargar('modelos_libro_lam', 'modelos_libro.py')
    return L_.invincible(T, K_nuevo(cargas=False))

# EL SHEFFIELD (26/11): el Tipo 42 del juego (modelos_buques.py `t42`), el mismo que se hornea para el pasillo
def m_sheffield(T):
    L_ = cargar('modelos_libro_lam', 'modelos_libro.py')
    return L_.B.t42(T, K_nuevo(cargas=False))

# EL NEPTUNE (26/11): el SP-2H del juego, sin cargas (el que encontro a la flota el 4 de mayo)
def m_neptune(T):
    return MOD.neptune(T, K_nuevo(cargas=False))

# LAS BALSAS (26/11): cinco balsas de cerca, para la hoja LAS BALSAS del Belgrano
def m_balsas(T):
    L_ = cargar('modelos_libro_lam', 'modelos_libro.py')
    return L_.balsas_grupo(T, K_nuevo(cargas=False))

# (modelo, azimut, elevacion, margen): el azimut se mide desde ESTRIBOR (+x de three) hacia la PROA;
# la elevacion, positiva desde arriba. Ortografica: es un plano, no una foto.
LAMINAS = {
    'supere_exocet': (m_supere, 32, -14, 0.06),
    'a4c':           (m_a4c, 30, -12, 0.06),
    'exocet':        (m_exocet, 18, 16, 0.05),
    'kc130':         (m_kc130, -58, 22, 0.04),
    'invincible':    (m_invincible, 32, 24, 0.04),
    # (25/11) el Belgrano hundiendose, visto desde su aleta de BABOR como la foto (escorado hacia la camara)
    'belgrano':      (m_belgrano, -135, 12, 0.05),
    # (26/11) EL SHEFFIELD de tres cuartos de proa por estribor, y el NEPTUNE de tres cuartos desde abajo-adelante
    'sheffield':     (m_sheffield, 34, 18, 0.05),
    'neptune':       (m_neptune, 30, -12, 0.06),
    'balsas':        (m_balsas, 20, 26, 0.06),
}

# ============================ LA ESCENA ============================
def mat_relleno():
    """Relleno NEGRO opaco: tapa lo de atras (Freestyle ya saca las ocultas) y deja la silueta en el alfa."""
    m = bpy.data.materials.new('relleno'); m.use_nodes = True
    N = m.node_tree.nodes; N.clear()
    out = N.new('ShaderNodeOutputMaterial'); em = N.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (0, 0, 0, 1); em.inputs['Strength'].default_value = 1
    m.node_tree.links.new(em.outputs[0], out.inputs['Surface'])
    return m

def freestyle(sc):
    sc.render.use_freestyle = True
    sc.render.line_thickness_mode = 'ABSOLUTE'
    sc.render.line_thickness = 1.0
    vl = sc.view_layers[0]
    fs = vl.freestyle_settings
    fs.crease_angle = math.radians(140)
    fs.use_smoothness = True
    ls = fs.linesets[0] if len(fs.linesets) else fs.linesets.new('lineas')
    ls.select_by_visibility = True; ls.visibility = 'VISIBLE'
    ls.select_by_edge_types = True
    ls.select_silhouette = True; ls.select_border = True; ls.select_crease = True
    ls.select_external_contour = True; ls.select_contour = True
    st = ls.linestyle or bpy.data.linestyles.new('linea')
    ls.linestyle = st
    st.color = (1, 1, 1)
    st.thickness = GROSOR * ESC
    st.caps = 'ROUND'
    st.chaining = 'PLAIN'
    st.use_same_object = False

def visibles(raiz):
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for ob in raiz.children_recursive:
        if ob.type != 'MESH' or ob.hide_render: continue
        ev = ob.evaluated_get(dg)
        me = ev.to_mesh()
        mw = ob.matrix_world
        pts.extend(mw @ v.co for v in me.vertices)
        ev.to_mesh_clear()
    return pts

def camara(sc, pts, az, el, margen):
    a, e = math.radians(az), math.radians(el)
    # three (x, y, z) -> blender (x, -z, y): estribor +x, proa (three -z) = +y, arriba +z
    d = Vector((math.cos(e) * math.cos(a), math.cos(e) * math.sin(a), math.sin(e)))
    c = sum(pts, Vector()) / len(pts)
    cd = bpy.data.cameras.new('cam'); cd.type = 'ORTHO'
    cam = bpy.data.objects.new('cam', cd); sc.collection.objects.link(cam)
    cam.location = c + d * 200
    cam.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    cd.clip_start, cd.clip_end = 1, 400
    sc.camera = cam
    bpy.context.view_layer.update()
    inv = cam.matrix_world.inverted()
    loc = [inv @ p for p in pts]
    x0, x1 = min(p.x for p in loc), max(p.x for p in loc)
    y0, y1 = min(p.y for p in loc), max(p.y for p in loc)
    asp = sc.render.resolution_x / sc.render.resolution_y
    ancho = max(x1 - x0, (y1 - y0) * asp) * (1 + 2 * margen)
    cd.ortho_scale = ancho
    cd.shift_x = (x0 + x1) / 2 / ancho
    cd.shift_y = (y0 + y1) / 2 / ancho
    return cam

if __name__ == '__main__':
    sc = H.limpiar()
    sc.render.resolution_x, sc.render.resolution_y = 480 * ESC, 270 * ESC
    sc.render.filter_size = 1.5
    sc.eevee.taa_render_samples = 4
    T = H.vacio_tres()
    fn, az, el, margen = LAMINAS[LAMINA]
    if arg('--vista'): az, el = (float(v) for v in arg('--vista').split(','))   # para probar encuadres
    raiz = fn(T)
    bpy.context.view_layer.update()
    rel = mat_relleno()
    for ob in raiz.children_recursive:
        if ob.type != 'MESH': continue
        ob.data.materials.clear(); ob.data.materials.append(rel)
        for ms in ob.material_slots: ms.link = 'DATA'
    camara(sc, visibles(raiz), az, el, margen)
    freestyle(sc)
    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    sc.render.filepath = os.path.abspath(OUT)
    bpy.ops.render.render(write_still=True)
    print('LAMINA', LAMINA, OUT)
