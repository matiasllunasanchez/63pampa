# EXPERIMENTO: HORNEAR LOS AVIONES CON BLENDER (pedido del autor 3/10/2026: "rehornear los aviones
# para ver si cambian y mejoran — formas mas complejas, luz, contorno, pixelado — sin tirar nada").
# La referencia que pidio: Dead Cells / Replaced. De Dead Cells sale el metodo: el modelo 3D se
# renderiza CHICO, sin antialias y con luz en BANDAS (cel shading), cuadro por cuadro.
#
# NO REEMPLAZA NADA. Escribe en tools/blender/out/ y el juego sigue usando las hojas de siempre.
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
#       --python tools/blender/hornear.py -- --modelo out/sky.json --out out/sky_cel
#   ...  -- --modelo a4nuevo --out out/a4nuevo
#
# EL MISMO ENCUADRE QUE tools/bake_planes.html, numero por numero, para que la comparacion sea
# cuadro contra cuadro: 9 alabeos x 3 cabeceos, frames de 84x84, la camara en (0, 2.4, 12.5)
# mirando a (0, 0.15, 0) con 24° verticales recalculados para el frame cuadrado (`ref` 84/48).
#
# TODO SE ARMA EN EL ESPACIO DE THREE.JS (y arriba, nariz hacia -z) adentro de un vacio girado 90°
# en X, que es la conversion a Blender (z arriba). Asi los numeros de los modelos, de la camara y de
# las luces se copian tal cual del horno de three sin traducir nada a mano.
import bpy, bmesh, json, math, os, sys
from mathutils import Matrix, Vector

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(nombre, defecto=None):
    return ARGS[ARGS.index(nombre) + 1] if nombre in ARGS else defecto

AQUI = os.path.dirname(os.path.abspath(__file__))
# `--guardar ruta.blend`: en vez de hornear, guarda la escena para ABRIRLA EN BLENDER y mirarla
# (pedido del autor 3/10: "probar el A-4 nuevo en Blender y rotarlo, con y sin contorno y con y
# sin luz"). Ahi los materiales leen tres perillas de la escena (luz, bandas, contorno) por
# drivers; horneando, esas perillas no existen y valen 1, asi que la hoja sale identica.
GUARDAR = arg('--guardar')
CONTROLES = bool(GUARDAR)
# `--capa tanques_ala|bombas_ala|tanque_centro|bomba_centro`: hornea UNA CAPA DE CARGA, con el
# avion de OCLUSOR (holdout: tapa pero no pinta) — el mismo truco que bake_planes.html con
# `colorWrite = false`. Asi la capa sale recortada donde el ala la tapa, desde cada camara.
CAPA = arg('--capa')
PIEZAS_CAPA = {'tanques_ala': ('tanques_ala', 'pilon_ala'), 'bombas_ala': ('bombas_ala', 'pilon_ala'),
               'tanque_centro': ('tanque_centro', 'pilon_centro'), 'bomba_centro': ('bomba_centro', 'pilon_centro')}
MODELO = arg('--modelo', 'out/sky.json')
OUT = os.path.join(AQUI, arg('--out', 'out/sky_cel'))
FW = FH = int(arg('--px', '84'))

ANGLES = [-60, -45, -30, -15, 0, 15, 30, 45, 60]
PITCHES = [14, 0, -14]
CAM = dict(fov=24, ref=84 / 48, pos=(0, 2.4, 12.5), lookY=0.15)
# `--vista ras`: LA HOJA 3 (sheet3.png), la del poder RASANTE — la misma camara girada 35,5° al
# costado y 10° por DEBAJO, el frame al doble (168) y las dos compensaciones de pose (cabeceo +20,
# alabeo -8). Todo copiado de tools/bake_planes.html (RAS_*), donde esta explicado por que.
VISTA = arg('--vista', 'base')
RAS_YAW, RAS_ELEV, RAS_PITCH, RAS_ROLL = 35.5, -10, 20, -8
if VISTA == 'empinada':
    PITCHES = [32, -32]            # la HOJA 2 (sheet2.png): los cabeceos de las piruetas
# `--vista cobra`: LA HOJA 4 (sheet4.png), la de LA COBRA (el freno, pedido del autor 4/10/2026): la
# trompa sube hasta pasar la vertical — 40°, 75° y 100° (un poco hacia atras, como en la foto que
# mando). Vertical, el avion mide su LARGO en el cuadro y no su envergadura, y no entra en 84: el
# cuadro va a 126 (x1,5) con la camara abierta en la misma proporcion, asi que el avion sale con los
# MISMOS pixeles que en la hoja base y el juego lo dibuja x1,5.
# EL MORTAL (4/10, "la cobra pero va hacia arriba y hace una vuelta tipo loop hacia atras, un mortal
# hacia atras, con freno"): la misma hoja sigue de largo la vuelta entera — 130° ya de espaldas, 190°
# boca abajo con la trompa hacia la camara, 280° picando, 335° casi nivelado. Las tres primeras filas
# no cambian, asi que la cobra lee la hoja igual que antes.
COBRA_K = 1.5
if VISTA == 'cobra':
    # …y al FINAL la del DERRAPE (4/10, "no tan hacia arriba la trompa"): 25°, la cobra a medias. Va
    # ultima para no correr las filas que ya leen la cobra y el mortal.
    PITCHES = [40, 75, 100, 130, 160, 190, 220, 250, 280, 310, 335, 25]
    FW = FH = int(arg('--px', str(round(84 * COBRA_K))))
    CAM = dict(CAM, ref=CAM['ref'] * COBRA_K)
# `--vista seleccion`: LA ILUSTRACION DEL SELECTOR DE AVION (CICLO DE MUERTE / POR LA PATRIA; pedido del
# autor 4/10: "los aviones del selector, armar nuevos segun lo hecho en Blender, uno para cada variante").
# Una sola pose —de cola, un poco desde arriba— a 130 px: el menu la dibuja a 130 unidades de
# diseño (= 390 px reales), asi que tools/blender/armar_seleccion.py la agranda x3 con vecino mas cercano
# y sale pixel art nitido a la MISMA densidad del juego (el metodo de Dead Cells: renderizar chico).
if VISTA == 'seleccion':
    ANGLES, PITCHES = [0], [22]      # la trompa arriba: se ve el LOMO, el camuflaje y el ala entera
    FW = FH = int(arg('--px', '130'))
if VISTA == 'ras':
    FW = FH = int(arg('--px', '168'))
    _d = math.hypot(CAM['pos'][1] - CAM['lookY'], CAM['pos'][2])
    _e, _a = math.radians(RAS_ELEV), math.radians(RAS_YAW)
    CAM = dict(CAM, pos=(_d * math.cos(_e) * math.sin(_a), CAM['lookY'] + _d * math.sin(_e), _d * math.cos(_e) * math.cos(_a)))

# ---------------- utilidades de color ----------------
def lin(hexs):
    """sRGB hex -> lineal (los nodos de Blender trabajan en lineal)."""
    h = hexs.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

# ---------------- la escena ----------------
def limpiar():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_EEVEE'
    sc.render.resolution_x, sc.render.resolution_y = FW, FH
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = True
    # SIN ANTIALIAS: una sola muestra y filtro cero. Es la mitad del metodo de Dead Cells — el
    # borde duro sale del render, no de un retoque.
    sc.render.filter_size = 0.0
    sc.eevee.taa_render_samples = 1
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    # LOS COLORES COMO SE ESCRIBEN: sin curva filmica ni "look" — el color de la paleta tiene que
    # salir tal cual en las zonas de luz plena
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.view_settings.exposure = 0
    sc.view_settings.gamma = 1
    w = bpy.data.worlds.new('negro'); w.color = (0, 0, 0); sc.world = w
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0, 0, 0, 1)
    return sc

def vacio_tres():
    """El espacio de three.js: y arriba. Girarlo +90° en X lleva (x, y, z) de three a (x, -z, y)."""
    e = bpy.data.objects.new('TRES', None)
    bpy.context.scene.collection.objects.link(e)
    e.rotation_euler = (math.radians(90), 0, 0)
    return e

def mirando(pos, target, up=Vector((0, 1, 0))):
    """La matriz de un objeto en `pos` que mira hacia `target` por su -Z, con +Y arriba (la
    convencion de las camaras de three y de Blender, que es la misma)."""
    pos, target = Vector(pos), Vector(target)
    z = (pos - target).normalized()
    x = up.cross(z).normalized()
    y = z.cross(x)
    m = Matrix((x, y, z)).transposed().to_4x4()
    m.translation = pos
    return m

def cam_ras():
    """La camara de la HOJA 3 (poder RASANTE), en polares alrededor del mismo punto de mira."""
    d = math.hypot(CAM['pos'][1] - CAM['lookY'], CAM['pos'][2])
    e, a = math.radians(RAS_ELEV), math.radians(RAS_YAW)
    return dict(CAM, pos=(d * math.cos(e) * math.sin(a), CAM['lookY'] + d * math.sin(e), d * math.cos(e) * math.cos(a)))

def camara(padre, cam=None, nombre='cam', activa=True):
    cam = cam or CAM
    asp = FW / FH
    half = math.tan(math.radians(cam['fov'] / 2)) * cam['ref'] / asp
    fov = 2 * math.atan(half)
    cd = bpy.data.cameras.new(nombre)
    cd.sensor_fit = 'VERTICAL'
    cd.lens_unit = 'FOV'
    cd.angle_y = fov
    cd.clip_start, cd.clip_end = 1, 100
    c = bpy.data.objects.new(nombre, cd)
    bpy.context.scene.collection.objects.link(c)
    c.parent = padre
    c.matrix_basis = mirando(cam['pos'], (0, cam['lookY'], 0))
    if activa: bpy.context.scene.camera = c
    return c

# LA LUZ: el sol del horno de siempre — de arriba a la izquierda y desde atras del avion, del
# lado de la camara (-3, 5, 4). Calido. La fuerza es PI para que la difusa blanca de plena cara
# valga 1.0 en el ShaderToRGB, que es la escala en la que se cortan las bandas.
SOL = (-3, 5, 4)
CONTRALUZ = (2, 1, -4)          # el rojizo de atras: ese no es lampara, lo calcula el material

def sol(padre):
    ld = bpy.data.lights.new('sol', 'SUN')
    ld.energy = math.pi
    ld.angle = 0.0                  # sombra dura: es pixel art
    l = bpy.data.objects.new('sol', ld)
    bpy.context.scene.collection.objects.link(l)
    l.parent = padre
    l.matrix_basis = mirando(SOL, (0, 0, 0))
    return l

# ---------------- el material: cel shading ----------------
# Tres bandas cortadas con un ColorRamp CONSTANTE sobre la luz que recibe la cara (ShaderToRGB,
# sombras incluidas): SOMBRA (fria), MEDIO y LUZ (calida). Arriba de eso, un FILO del contraluz
# rojizo en las caras que miran hacia atras — el `rim` del horno de three, ahora en una banda dura.
BANDAS = [(0.00, (0.52, 0.57, 0.70)),     # sombra: el color hundido hacia el azul del cielo
          (0.12, (0.86, 0.87, 0.90)),     # medio
          (0.60, (1.04, 1.00, 0.94))]     # luz: el sol calido, apenas por encima del color base
RIM = (0.85, 0.42, 0.16)                  # el contraluz (P.sunGlow, lineal aprox.)

def dir_blender(v3):
    """Una direccion de three llevada al mundo de Blender (la misma rotacion que el vacio)."""
    x, y, z = v3
    return Vector((x, -z, y)).normalized()

def perilla(nt, prop, defecto=1.0):
    """Un valor que en el .blend LEE una perilla de la escena (driver sin Python: anda aunque
    Blender tenga los scripts bloqueados) y horneando es una constante."""
    v = nt.nodes.new('ShaderNodeValue'); v.outputs[0].default_value = defecto
    if CONTROLES:
        d = v.outputs[0].driver_add('default_value').driver
        d.type = 'AVERAGE'
        var = d.variables.new(); var.name = 'v'; var.type = 'SINGLE_PROP'
        var.targets[0].id_type = 'SCENE'; var.targets[0].id = bpy.context.scene
        var.targets[0].data_path = '["%s"]' % prop
    return v.outputs[0]

def mezcla(N, L, a, b, f):
    """a * (1 - f) + b * f, en vectores (el nodo Mix cambia sus entradas entre versiones)."""
    inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
    L.new(f, inv.inputs[1])
    pa = N.new('ShaderNodeVectorMath'); pa.operation = 'SCALE'; L.new(a, pa.inputs[0]); L.new(inv.outputs[0], pa.inputs['Scale'])
    pb = N.new('ShaderNodeVectorMath'); pb.operation = 'SCALE'; L.new(b, pb.inputs[0]); L.new(f, pb.inputs['Scale'])
    s = N.new('ShaderNodeVectorMath'); s.operation = 'ADD'; L.new(pa.outputs[0], s.inputs[0]); L.new(pb.outputs[0], s.inputs[1])
    return s.outputs[0]

def mat_cel_nodo(nombre, fbase, brillo=False):
    """El material de bandas sobre un COLOR BASE que arma `fbase(node_tree)` (un socket de color
    lineal): un color plano, o el camuflaje. `brillo` agrega el destello duro del vidrio."""
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    dif = N.new('ShaderNodeBsdfDiffuse'); dif.inputs['Color'].default_value = (1, 1, 1, 1)
    s2r = N.new('ShaderNodeShaderToRGB')
    L.new(dif.outputs[0], s2r.inputs[0])
    ramp = N.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'CONSTANT'
    el = ramp.color_ramp.elements
    while len(el) < len(BANDAS): el.new(0.5)
    for e, (p, c) in zip(el, BANDAS): e.position = p; e.color = (*c, 1)
    L.new(s2r.outputs['Color'], ramp.inputs['Fac'])
    base = fbase(nt)
    # LA LUZ SUAVE, para comparar contra las bandas: el mismo tinte pero en degrade continuo entre
    # el de sombra y el de luz (perilla `bandas`: 1 bandas, 0 suave)
    vc = N.new('ShaderNodeMath'); vc.operation = 'ADD'; vc.use_clamp = True; vc.inputs[1].default_value = 0.0
    L.new(s2r.outputs['Color'], vc.inputs[0])
    dif_t = N.new('ShaderNodeVectorMath'); dif_t.operation = 'SCALE'
    dif_t.inputs[0].default_value = tuple(l - o for l, o in zip(BANDAS[-1][1], BANDAS[0][1]))
    L.new(vc.outputs[0], dif_t.inputs['Scale'])
    suave = N.new('ShaderNodeVectorMath'); suave.operation = 'ADD'
    suave.inputs[1].default_value = BANDAS[0][1]
    L.new(dif_t.outputs[0], suave.inputs[0])
    tinte = mezcla(N, L, suave.outputs[0], ramp.outputs['Color'], perilla(nt, 'bandas'))
    mul = N.new('ShaderNodeVectorMath'); mul.operation = 'MULTIPLY'
    L.new(tinte, mul.inputs[0])
    L.new(base, mul.inputs[1])
    # el FILO DEL CONTRALUZ: caras que miran hacia el contraluz (producto escalar alto) Y de canto
    # a la camara (fresnel alto) — un borde, no una cara entera
    geo = N.new('ShaderNodeNewGeometry')
    dot = N.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'
    dot.inputs[1].default_value = dir_blender(CONTRALUZ)
    L.new(geo.outputs['Normal'], dot.inputs[0])
    lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.5
    g1 = N.new('ShaderNodeMath'); g1.operation = 'GREATER_THAN'; g1.inputs[1].default_value = 0.45
    L.new(dot.outputs['Value'], g1.inputs[0])
    g2 = N.new('ShaderNodeMath'); g2.operation = 'GREATER_THAN'; g2.inputs[1].default_value = 0.85
    L.new(lw.outputs['Facing'], g2.inputs[0])
    both = N.new('ShaderNodeMath'); both.operation = 'MULTIPLY'
    L.new(g1.outputs[0], both.inputs[0]); L.new(g2.outputs[0], both.inputs[1])
    rimc = N.new('ShaderNodeVectorMath'); rimc.operation = 'SCALE'
    rimc.inputs[0].default_value = tuple(r * 0.30 for r in RIM)
    L.new(both.outputs[0], rimc.inputs['Scale'])
    suma = N.new('ShaderNodeVectorMath'); suma.operation = 'ADD'
    L.new(mul.outputs[0], suma.inputs[0]); L.new(rimc.outputs[0], suma.inputs[1])
    ultimo = suma.outputs[0]
    if brillo:
        # EL DESTELLO DEL VIDRIO: el especular del sol, cortado en una mancha blanca dura
        gl = N.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = 0.25
        s2 = N.new('ShaderNodeShaderToRGB'); L.new(gl.outputs[0], s2.inputs[0])
        gt = N.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; gt.inputs[1].default_value = 0.35
        L.new(s2.outputs['Color'], gt.inputs[0])
        bc = N.new('ShaderNodeVectorMath'); bc.operation = 'SCALE'
        bc.inputs[0].default_value = (0.75, 0.75, 0.70)
        L.new(gt.outputs[0], bc.inputs['Scale'])
        s3 = N.new('ShaderNodeVectorMath'); s3.operation = 'ADD'
        L.new(ultimo, s3.inputs[0]); L.new(bc.outputs[0], s3.inputs[1])
        ultimo = s3.outputs[0]
    # SIN LUZ (perilla `luz` en 0): el color plano del modelo, sin bandas, filo ni destello
    ultimo = mezcla(N, L, base, ultimo, perilla(nt, 'luz'))
    em = N.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1
    L.new(ultimo, em.inputs['Color'])
    L.new(em.outputs[0], out.inputs['Surface'])
    return m

def mat_cel(nombre, color_hex, brillo=False):
    def base(nt):
        rgb = nt.nodes.new('ShaderNodeRGB'); rgb.outputs[0].default_value = (*lin(color_hex), 1)
        return rgb.outputs[0]
    return mat_cel_nodo(nombre, base, brillo)

def mat_emisivo(nombre, color_hex):
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    nt = m.node_tree; N = nt.nodes
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (*lin(color_hex), 1)
    nt.links.new(em.outputs[0], out.inputs['Surface'])
    return m

# ---------------- el modelo, desde el JSON de three ----------------
def modelo_json(ruta, padre):
    d = json.load(open(ruta if os.path.isabs(ruta) else os.path.join(AQUI, ruta)))
    raiz = bpy.data.objects.new('modelo', None)
    bpy.context.scene.collection.objects.link(raiz)
    raiz.parent = padre
    mats = {}
    for i, p in enumerate(d['piezas']):
        me = bpy.data.meshes.new('p%d' % i)
        me.from_pydata([tuple(v) for v in p['verts']], [], [tuple(t) for t in p['tris']])
        me.validate()
        # las piezas de three vienen con vertices partidos en los bordes duros; se sueldan para que
        # el sombreado suave tenga de donde promediar, y el angulo decide que borde queda duro
        bm = bmesh.new(); bm.from_mesh(me)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
        bm.to_mesh(me); bm.free()
        me.shade_smooth()
        me.set_sharp_from_angle(angle=math.radians(35))
        k = (p['color'], p['emisiva'])
        if k not in mats:
            mats[k] = (mat_emisivo if p['emisiva'] else mat_cel)('m%d' % len(mats), p['color'])
        me.materials.append(mats[k])
        ob = bpy.data.objects.new('p%d' % i, me)
        bpy.context.scene.collection.objects.link(ob)
        ob.parent = raiz
    return raiz

# ---------------- el horneado ----------------
def puntas(raiz):
    """LAS DOS PUNTAS DE ALA del modelo: los vertices de |x| minimo y maximo de toda la geometria
    EVALUADA (con espejo y subdivision), en el espacio del modelo. Mismo criterio que puntasDe() de
    bake_planes.html: la punta es la punta mire la camara desde donde mire."""
    dg = bpy.context.evaluated_depsgraph_get()
    L = R = None
    for ob in raiz.children_recursive:
        if ob.type != 'MESH' or ob.hide_render: continue
        ev = ob.evaluated_get(dg); me = ev.to_mesh()
        for v in me.vertices:
            p = ob.matrix_local @ v.co
            if L is None or p.x < L.x: L = p.copy()
            if R is None or p.x > R.x: R = p.copy()
        ev.to_mesh_clear()
    return L, R

def al_cuadro(p_mundo):
    """Donde cae un punto en el cuadro: fraccion desde el CENTRO, y hacia abajo (como alFrame)."""
    from bpy_extras.object_utils import world_to_camera_view
    sc = bpy.context.scene
    c = world_to_camera_view(sc, sc.camera, p_mundo)
    return [round(c.x - 0.5, 3), round(0.5 - c.y, 3)]

def hornear(raiz):
    sc = bpy.context.scene
    os.makedirs(OUT, exist_ok=True)
    L, R = puntas(raiz) if not CAPA else (Vector((0, 0, 0)), Vector((0, 0, 0)))
    tips = []
    for row, pa in enumerate(PITCHES):
        tips.append([])
        for col, a in enumerate(ANGLES):
            # LA POSE, como en three: rotation.x = cabeceo, rotation.z = alabeo, orden XYZ
            dp, dr = (RAS_PITCH, RAS_ROLL) if VISTA == 'ras' else (0, 0)
            raiz.matrix_basis = Matrix.Rotation(math.radians(pa + dp), 4, 'X') @ Matrix.Rotation(math.radians(a + dr), 4, 'Z')
            bpy.context.view_layer.update()
            mw = raiz.matrix_world
            tips[-1].append(al_cuadro(mw @ L) + al_cuadro(mw @ R))
            sc.render.filepath = os.path.join(OUT, 'f_%d_%d.png' % (row, col))
            bpy.ops.render.render(write_still=True)
    json.dump({'tips': tips}, open(os.path.join(OUT, 'tips.json'), 'w'))

# ============================ EL .blend PARA MIRARLO ============================
NO_CONTORNO = ('boca', 'fondo', 'medio', 'nucleo', 'sonda')   # discos planos y la lanza: sin casco

def perilla_escena(sc, nombre, valor, descripcion, maximo=1.0):
    sc[nombre] = valor
    sc.id_properties_ui(nombre).update(min=0, max=maximo, soft_min=0, soft_max=maximo, description=descripcion)

def driver_escena(dueno, ruta, prop):
    d = dueno.driver_add(ruta).driver
    d.type = 'AVERAGE'
    var = d.variables.new(); var.name = 'v'; var.type = 'SINGLE_PROP'
    var.targets[0].id_type = 'SCENE'; var.targets[0].id = bpy.context.scene
    var.targets[0].data_path = '["%s"]' % prop

def contorno_casco(raiz):
    """EL CONTORNO EN 3D: el truco del CASCO INVERTIDO. Cada pieza lleva una copia apenas mas
    gruesa (Solidify), con las normales al reves y un material oscuro que descarta las caras que
    miran a la camara: lo unico que queda a la vista es el borde que asoma alrededor de la silueta.
    Se ve en vivo al rotar. (El contorno de las HOJAS es otro: un retoque al pixel en
    armar_hoja.py; este es para mirar el modelo.)"""
    m = bpy.data.materials.new('contorno')
    m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links; N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (*lin('#1b1814'), 1)
    tr = N.new('ShaderNodeBsdfTransparent')
    lp = N.new('ShaderNodeLightPath')
    mx = N.new('ShaderNodeMixShader')
    L.new(lp.outputs['Is Shadow Ray'], mx.inputs[0])       # el casco no hace sombra sobre el avion
    L.new(em.outputs[0], mx.inputs[1]); L.new(tr.outputs[0], mx.inputs[2])
    L.new(mx.outputs[0], out.inputs['Surface'])
    m.use_backface_culling = True
    for ob in [o for o in raiz.children_recursive if o.type == 'MESH']:
        if ob.name.startswith(NO_CONTORNO): continue
        ob.data.materials.append(m)
        sol_ = ob.modifiers.new('contorno', 'SOLIDIFY')
        sol_.thickness = 0.03; sol_.offset = 1.0
        sol_.use_flip_normals = True; sol_.use_rim = False; sol_.use_even_offset = True
        sol_.material_offset = len(ob.data.materials) - 1
        driver_escena(sol_, 'show_viewport', 'contorno')
        driver_escena(sol_, 'show_render', 'contorno')
        driver_escena(sol_, 'thickness', 'grosor_contorno')

def ocultar_si(ob, prop, expr):
    """Oculta `ob` (visor y render) cuando la expresion sobre la perilla `prop` (la variable `v`)
    da verdadero. Expresion SIMPLE (comparaciones): Blender la evalua sin Python, asi que anda
    aunque tenga los scripts bloqueados."""
    for ruta in ('hide_viewport', 'hide_render'):
        d = ob.driver_add(ruta).driver
        d.type = 'SCRIPTED'; d.expression = expr
        var = d.variables.new(); var.name = 'v'; var.type = 'SINGLE_PROP'
        var.targets[0].id_type = 'SCENE'; var.targets[0].id = bpy.context.scene
        var.targets[0].data_path = '["%s"]' % prop

def guardar(T, raiz):
    sc = bpy.context.scene
    perilla_escena(sc, 'luz', 1.0, '1 = con luz (bandas o suave) · 0 = color plano, sin luz')
    perilla_escena(sc, 'bandas', 1.0, '1 = luz en BANDAS (cel shading, lo del horno) · 0 = luz suave')
    perilla_escena(sc, 'contorno', 1, 'con (1) o sin (0) contorno oscuro alrededor de cada pieza', 1)
    perilla_escena(sc, 'grosor_contorno', 0.03, 'grosor del contorno, en unidades del modelo', 0.2)
    perilla_escena(sc, 'carga_ala', 1, 'pilones del ALA: 0 = nada · 1 = dos tanques · 2 = dos bombas', 2)
    perilla_escena(sc, 'carga_centro', 2, 'pilon del CENTRO: 0 = nada · 1 = tanque · 2 = bomba', 2)
    perilla_escena(sc, 'esquema', 0, 'pintura: 0 = camuflaje de la FAA · 1 = gris de la Armada (A-4Q)', 1)
    contorno_casco(raiz)
    # EL GIRO: un vacio entre el espacio de three y el avion, que da una vuelta en 240 cuadros
    # (barra espaciadora). El avion queda libre debajo para posarlo a mano (R para rotar).
    giro = bpy.data.objects.new('giro (barra espaciadora)', None)
    sc.collection.objects.link(giro); giro.parent = T
    raiz.parent = giro
    bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'
    giro.rotation_euler = (0, 0, 0); giro.keyframe_insert('rotation_euler', index=1, frame=1)
    giro.rotation_euler = (0, 2 * math.pi, 0); giro.keyframe_insert('rotation_euler', index=1, frame=241)
    giro.rotation_euler = (0, 0, 0)
    sc.frame_start, sc.frame_end, sc.frame_current = 1, 240, 1
    # LAS DOS CAMARAS DEL HORNO: la de cola (hoja base) y la del poder RASANTE
    cr = camara(T, cam_ras(), 'camara poder RASANTE', activa=False)
    # LAS COMPENSACIONES DE LA HOJA 3 VAN EN LA CAMARA: el horno levanta la nariz +20° y rola -8°
    # el MODELO (ver RAS_PITCH/RAS_ROLL); aca el avion queda quieto para que lo poses vos, asi que
    # se gira la camara al reves alrededor del avion — que es exactamente la misma vista.
    comp = Matrix.Rotation(math.radians(RAS_PITCH), 4, 'X') @ Matrix.Rotation(math.radians(RAS_ROLL), 4, 'Z')
    cr.matrix_basis = comp.inverted() @ cr.matrix_basis
    # EL FONDO: gris del pasillo para la camara, NEGRO para la luz — si el cielo iluminara, las
    # bandas se correrian y no se veria lo mismo que hornea el horno
    sc.render.film_transparent = False
    nt = sc.world.node_tree; N = nt.nodes; N.clear()
    out = N.new('ShaderNodeOutputWorld')
    b0 = N.new('ShaderNodeBackground'); b0.inputs['Color'].default_value = (0, 0, 0, 1)
    b1 = N.new('ShaderNodeBackground'); b1.inputs['Color'].default_value = (*lin('#34404a'), 1)
    lp = N.new('ShaderNodeLightPath'); mx = N.new('ShaderNodeMixShader')
    nt.links.new(lp.outputs['Is Camera Ray'], mx.inputs[0])
    nt.links.new(b0.outputs[0], mx.inputs[1]); nt.links.new(b1.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs['Surface'])
    # 168x168 (el pixel de la hoja del poder): F12 lo renderiza pixelado, como en el juego
    sc.render.resolution_x = sc.render.resolution_y = 168
    sc.eevee.taa_render_samples = 1
    # nombres legibles en el Outliner
    T.name = 'espacio three (no tocar)'; raiz.name = 'A-4 nuevo'
    for o in bpy.data.objects:
        if o.name == 'cam': o.name = 'camara cola (hoja base)'
    # el visor abre RENDERIZADO y mirando por la camara del horno
    for scr in bpy.data.screens:
        for area in scr.areas:
            if area.type != 'VIEW_3D': continue
            sp = area.spaces.active
            sp.shading.type = 'RENDERED'
            sp.region_3d.view_perspective = 'CAMERA'
    # EL BOTON "VER EN EL JUEGO": el script va embebido; en la pestaña Scripting queda abierto
    txt = bpy.data.texts.new('VER EN EL JUEGO.py')
    txt.write(open(os.path.join(AQUI, 'ver_en_el_juego.py')).read())
    for scr in bpy.data.screens:
        for area in scr.areas:
            if area.type == 'TEXT_EDITOR': area.spaces.active.text = txt
    ruta = GUARDAR if os.path.isabs(GUARDAR) else os.path.join(AQUI, GUARDAR)
    bpy.ops.wm.save_as_mainfile(filepath=ruta, compress=True)
    print('GUARDADO', ruta)

if __name__ == '__main__':
    limpiar()
    T = vacio_tres()
    camara(T)
    sol(T)
    if MODELO.endswith('.json'):
        raiz = modelo_json(MODELO, T)
    else:
        import importlib.util
        spec = importlib.util.spec_from_file_location('modelos_bl', os.path.join(AQUI, 'modelos.py'))
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
        K = dict(mat_cel=mat_cel, mat_cel_nodo=mat_cel_nodo, mat_emisivo=mat_emisivo, lin=lin,
                 perilla=perilla, mezcla=mezcla, ocultar_si=ocultar_si,
                 cargas=bool(GUARDAR or CAPA), controles=CONTROLES)
        raiz = mod.construir(MODELO, T, K) if MODELO in getattr(mod, 'FICHAS', {}) else getattr(mod, MODELO)(T, K)
        if CAPA:
            # LA CAPA: solo sus piezas (la carga y su pilon) se pintan; el avion queda de OCLUSOR
            mias = set()
            for grupo in PIEZAS_CAPA[CAPA]: mias.update(o.name for o in K['piezas'][grupo])
            todas = set(o.name for g in K['piezas'].values() for o in g)
            for ob in raiz.children_recursive:
                if ob.type != 'MESH': continue
                if ob.name in mias: continue
                if ob.name in todas: ob.hide_render = True        # las otras cargas: afuera
                else: ob.is_holdout = True                        # el avion: tapa sin pintar
    if GUARDAR:
        guardar(T, raiz)
    else:
        hornear(raiz)
        print('HORNEADO', OUT)
