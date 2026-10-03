# EXPERIMENTO BLENDER: modelos hechos en Blender (no en primitivas de three). Los usa
# tools/blender/hornear.py con `--modelo <nombre>`.
#
# MISMO ESPACIO Y MISMA ESCALA QUE tools/models/planes.js (y arriba, nariz hacia -z, el A-4 de la
# trompa en -3,95 a la tobera en 3,0 y 5,1 de envergadura), para que la hoja salga del mismo tamaño
# y en el mismo lugar del cuadro que la de hoy, y se puedan comparar cuadro contra cuadro.
#
# LO QUE CAMBIA RESPECTO DE LAS PRIMITIVAS:
#   · EL FUSELAJE ES UN LOFT de secciones (ancho, alto y altura de cada estacion) suavizado con
#     subdivision: el morro afinado y apenas caido, la cabina mas alta que ancha, la cola que se
#     angosta hasta la tobera — en vez de un cilindro con un cono pegado.
#   · ALAS, DERIVA Y ESTABILIZADOR CON PERFIL ALAR (NACA simetrico), no placas extruidas: el borde
#     de ataque redondo toma la luz distinto que el de fuga, y eso es lo que se lee a 84 px.
#   · LAS TOMAS DE AIRE son "orejas" lofteadas que nacen de la cabina y se funden en el fuselaje.
#   · EL CAMUFLAJE NO SON CAJAS APOYADAS: es ruido en el espacio del modelo cortado en dos tonos
#     (marron y verde) en las caras que miran arriba, y la panza CELESTE en las que miran abajo. Se
#     pinta solo sobre cualquier pieza, y sigue al avion cuando rola.
import bpy, bmesh, math
from mathutils import Vector

# la paleta del A-4 de la FAA (CAMO_FAA de tools/models/planes.js)
MARRON, VERDE, PANZA = '#6b5136', '#4c5a39', '#a6bed2'
CANOPY, ESCAPE = '#8fd0e0', '#2b2f28'
CELESTE, BLANCO = '#7fb2d8', '#e8eef0'
# el A-4Q de la Armada: plateado / gris claro arriba, panza casi blanca (tools/models/planes.js)
ARMADA, ARMADA_PANZA = '#b9c1c7', '#dfe3e6'
# la carga (tools/models/planes.js: BOMBA, BOMBA_ANILLO, BOMBA_COLA; el tanque va del color de la panza)
BOMBA, BOMBA_ANILLO, BOMBA_COLA, PILON = '#9a9c6c', '#d8c25a', '#6f7250', '#3a3f38'

def _obj(nombre, me, padre, mat):
    me.materials.append(mat)
    ob = bpy.data.objects.new(nombre, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = padre
    return ob

def _subdiv(ob, n=2):
    m = ob.modifiers.new('sub', 'SUBSURF'); m.levels = n; m.render_levels = n
    ob.data.shade_smooth()
    return ob

def loft(nombre, estaciones, padre, mat, n=20, expo=2.2, cerrar=(True, False), x0=0.0):
    """Un cuerpo de revolucion deformado: `estaciones` = [(z, medio_ancho, medio_alto, y_centro)].
    Cada seccion es una superelipse (expo 2 = elipse; mas = mas cuadrada). Tapa adelante con un
    punto (la trompa) y atras abierto o cerrado."""
    bm = bmesh.new(); anillos = []
    for (z, w, h, yc) in estaciones:
        anillo = []
        for i in range(n):
            t = 2 * math.pi * i / n
            c, s = math.cos(t), math.sin(t)
            x = x0 + w * math.copysign(abs(c) ** (2 / expo), c)
            y = yc + h * math.copysign(abs(s) ** (2 / expo), s)
            anillo.append(bm.verts.new((x, y, z)))
        anillos.append(anillo)
    for a, b in zip(anillos, anillos[1:]):
        for i in range(n):
            bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    if cerrar[0]: bm.faces.new(list(reversed(anillos[0])))
    if cerrar[1]: bm.faces.new(anillos[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    return _obj(nombre, me, padre, mat)

def perfil(t, n=9):
    """Perfil NACA simetrico de espesor relativo `t`: lista de (s, y) de borde de fuga a borde de
    ataque por arriba y de vuelta por abajo. s = 0 en el borde de ataque, 1 en el de fuga."""
    xs = [(1 - math.cos(math.pi * i / n)) / 2 for i in range(n + 1)]   # mas puntos en las puntas
    yt = lambda x: 5 * t * (0.2969 * math.sqrt(x) - 0.1260 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4)
    arriba = [(x, yt(x)) for x in reversed(xs)]
    abajo = [(x, -yt(x)) for x in xs[1:-1]]
    return arriba + abajo

def superficie(nombre, estaciones, padre, mat, eje='x', espejo=False):
    """Un ala (o deriva) por estaciones a lo largo de la envergadura. `estaciones` =
    [(e, z_borde_ataque, cuerda, espesor_rel, desplazamiento)], con `e` la coordenada sobre el eje
    de envergadura ('x' para alas y estabilizador, 'y' para la deriva) y `desplazamiento` la otra
    coordenada (la altura del ala, con su diedro; el corrimiento lateral de la deriva)."""
    bm = bmesh.new(); anillos = []
    for (e, zle, c, t, d) in estaciones:
        anillo = []
        for (s, y) in perfil(t):
            z = zle + s * c
            v = (e, d + y * c, z) if eje == 'x' else (d + y * c, e, z)
            anillo.append(bm.verts.new(v))
        anillos.append(anillo)
    n = len(anillos[0])
    for a, b in zip(anillos, anillos[1:]):
        for i in range(n):
            bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    bm.faces.new(anillos[-1])                      # la puntera
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    me.shade_smooth()
    me.set_sharp_from_angle(angle=math.radians(50))   # el borde de fuga y la puntera quedan duros
    ob = _obj(nombre, me, padre, mat)
    if espejo:
        mm = ob.modifiers.new('espejo', 'MIRROR'); mm.use_axis[0] = True; mm.use_bisect_axis[0] = False
    return ob

def elipsoide(nombre, centro, radios, padre, mat, seg=20, anillos=12):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=anillos, radius=1.0)
    for v in bm.verts:
        v.co = Vector((centro[0] + v.co.x * radios[0], centro[1] + v.co.z * radios[1], centro[2] + v.co.y * radios[2]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    me.shade_smooth()
    return _obj(nombre, me, padre, mat)

def disco(nombre, centro, r, padre, mat, seg=14):
    """Un disco de cara a +z (la camara de cola): las capas de calor de la tobera."""
    bm = bmesh.new()
    vs = [bm.verts.new((centro[0] + r * math.cos(2 * math.pi * i / seg), centro[1] + r * math.sin(2 * math.pi * i / seg), centro[2])) for i in range(seg)]
    bm.faces.new(vs)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    return _obj(nombre, me, padre, mat)

def caja(nombre, centro, medidas, padre, mat):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((centro[0] + v.co.x * medidas[0], centro[1] + v.co.y * medidas[1], centro[2] + v.co.z * medidas[2]))
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    return _obj(nombre, me, padre, mat)

# ============================ LA CARGA ============================
# Las mismas piezas que tools/models/planes.js (tank, bomb, pilon), pero con forma: el tanque es una
# GOTA lofteada con aletas en cruz, y la bomba lleva ojiva, el anillo amarillo de la espoleta y la
# cola de aletas. Colgadas de ESTE modelo: los pilones bajan del ala y de la panza nuevas.
def tanque(nombre, c, r, largo, padre, mat, mat_aleta):
    x, y, z0 = c[0], c[1], c[2] - largo / 2
    perfil_ = [(0.00, 0.03), (0.10, 0.55), (0.26, 0.90), (0.42, 1.0), (0.62, 1.0), (0.82, 0.72), (1.00, 0.10)]
    ob = loft(nombre, [(z0 + f * largo, r * k, r * k, y) for f, k in perfil_], padre, mat, n=14, expo=2.0, cerrar=(True, True), x0=x)
    _subdiv(ob, 1)
    # las aletas en cruz de la cola, a 45° (las de abajo no tocan el piso al rodar)
    for a in (math.pi / 4, -math.pi / 4):
        f = caja(nombre + '_aleta', (x, y, z0 + 0.86 * largo), (r * 2.6, 0.025, largo * 0.16), padre, mat_aleta)
        f.rotation_euler = (0, 0, a)
        f.location = (x, y, z0 + 0.86 * largo)
        for v in f.data.vertices: v.co.x -= x; v.co.y -= y; v.co.z -= z0 + 0.86 * largo
    return ob

def bomba(nombre, c, r, largo, padre, cuerpo, anillo, cola):
    x, y, z0 = c[0], c[1], c[2] - largo / 2
    perfil_ = [(0.00, 0.20), (0.07, 0.65), (0.20, 0.95), (0.30, 1.0), (0.66, 1.0), (0.86, 0.62), (1.00, 0.40)]
    ob = loft(nombre, [(z0 + f * largo, r * k, r * k, y) for f, k in perfil_], padre, cuerpo, n=14, expo=2.0, cerrar=(True, True), x0=x)
    _subdiv(ob, 1)
    _subdiv(loft(nombre + '_anillo', [(z0 + 0.17 * largo, r * 1.03, r * 1.03, y), (z0 + 0.24 * largo, r * 1.03, r * 1.03, y)],
                 padre, anillo, n=14, expo=2.0, cerrar=(False, False), x0=x), 1)
    # las aletas de cola en X: lo que hace que una bomba no se lea como un tanque chico
    for a in (math.pi / 4, -math.pi / 4):
        f = caja(nombre + '_aleta', (0, 0, 0), (r * 3.0, 0.03, largo * 0.20), padre, cola)
        f.rotation_euler = (0, 0, a)
        f.location = (x, y, z0 + 0.90 * largo)
    return ob

def pilon(nombre, x, y_arriba, y_abajo, z, largo, padre, mat):
    return caja(nombre, (x, (y_arriba + y_abajo) / 2, z), (0.07, y_arriba - y_abajo, largo), padre, mat)

def cargas(raiz, K):
    """Los cuatro puntos de carga, como en el juego (data/cargas.js): el PAR de pilones del ala
    (tanques o bombas) y el del centro (tanque o bomba). Cada pieza se muestra u oculta con las
    perillas `carga_ala` y `carga_centro` del .blend."""
    tq = K['mat_cel_nodo']('tanque', lambda nt: K['mezcla'](nt.nodes, nt.links, _rgb(nt, K, PANZA), _rgb(nt, K, ARMADA_PANZA), K['perilla'](nt, 'esquema', 0.0)))
    tq_aleta = K['mat_cel']('tanque_aleta', '#8ea4b6')
    cu, an, co = K['mat_cel']('bomba', BOMBA), K['mat_cel']('bomba_anillo', BOMBA_ANILLO), K['mat_cel']('bomba_cola', BOMBA_COLA)
    pi_ = K['mat_cel']('pilon', PILON)
    piezas = {k: [] for k in ('pilon_ala', 'tanques_ala', 'bombas_ala', 'pilon_centro', 'tanque_centro', 'bomba_centro')}
    def antes(lista):
        n0 = set(o.name for o in raiz.children)
        return lambda: lista.extend(o for o in raiz.children if o.name not in n0)
    for sg in (-1, 1):
        x = sg * 1.45
        f = antes(piezas['pilon_ala']); pilon('pilon_ala%d' % sg, x, -0.29, -0.43, 0.95, 0.85, raiz, pi_); f()
        f = antes(piezas['tanques_ala']); tanque('tanque_ala%d' % sg, (x, -0.57, 0.80), 0.17, 1.95, raiz, tq, tq_aleta); f()
        f = antes(piezas['bombas_ala']); bomba('bomba_ala%d' % sg, (x, -0.55, 0.90), 0.15, 1.35, raiz, cu, an, co); f()
    f = antes(piezas['pilon_centro']); pilon('pilon_centro', 0, -0.36, -0.52, 0.30, 0.95, raiz, pi_); f()
    f = antes(piezas['tanque_centro']); tanque('tanque_centro', (0, -0.71, 0.25), 0.19, 2.2, raiz, tq, tq_aleta); f()
    f = antes(piezas['bomba_centro']); bomba('bomba_centro', (0, -0.66, 0.32), 0.16, 1.45, raiz, cu, an, co); f()
    if K.get('controles'):
        reglas = {'pilon_ala': ('carga_ala', 'v == 0'), 'tanques_ala': ('carga_ala', 'v != 1'), 'bombas_ala': ('carga_ala', 'v != 2'),
                  'pilon_centro': ('carga_centro', 'v == 0'), 'tanque_centro': ('carga_centro', 'v != 1'), 'bomba_centro': ('carga_centro', 'v != 2')}
        for k, obs in piezas.items():
            prop, expr = reglas[k]
            for o in obs: K['ocultar_si'](o, prop, expr)
    return piezas

def _rgb(nt, K, hexs):
    n = nt.nodes.new('ShaderNodeRGB'); n.outputs[0].default_value = (*K['lin'](hexs), 1)
    return n.outputs[0]

# ============================ EL MATERIAL DEL CAMUFLAJE ============================
def mat_camo(K, nombre='camo', escala=0.32, semilla=0.0, bandera=None):
    """Marron/verde en manchas (ruido en el espacio del MODELO: las piezas comparten el dibujo y el
    camuflaje rola con el avion) y la panza celeste donde la cara mira hacia abajo."""
    def base(nt):
        N, L = nt.nodes, nt.links
        tc = N.new('ShaderNodeTexCoord')
        nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = escala
        nz.inputs['Detail'].default_value = 1.2; nz.inputs['Roughness'].default_value = 0.45
        if 'W' in nz.inputs: nz.noise_dimensions = '4D'; nz.inputs['W'].default_value = semilla
        L.new(tc.outputs['Object'], nz.inputs['Vector'])
        rp = N.new('ShaderNodeValToRGB'); rp.color_ramp.interpolation = 'CONSTANT'
        e = rp.color_ramp.elements
        e[0].position = 0.0; e[0].color = (*K['lin'](MARRON), 1)
        e[1].position = 0.5; e[1].color = (*K['lin'](VERDE), 1)
        L.new(nz.outputs['Fac'], rp.inputs['Fac'])
        # LA PANZA: la normal en el espacio del modelo; su Y (la vertical de three) negativa = abajo
        geo = N.new('ShaderNodeNewGeometry')
        vt = N.new('ShaderNodeVectorTransform'); vt.vector_type = 'NORMAL'
        vt.convert_from = 'WORLD'; vt.convert_to = 'OBJECT'
        L.new(geo.outputs['Normal'], vt.inputs['Vector'])
        sep = N.new('ShaderNodeSeparateXYZ'); L.new(vt.outputs['Vector'], sep.inputs['Vector'])
        abajo = N.new('ShaderNodeMath'); abajo.operation = 'LESS_THAN'; abajo.inputs[1].default_value = -0.28
        L.new(sep.outputs['Y'], abajo.inputs[0])
        # mezcla a mano (camo * (1 - abajo) + panza * abajo): el nodo Mix cambia el orden de sus
        # entradas entre versiones de Blender, la cuenta no
        inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
        L.new(abajo.outputs[0], inv.inputs[1])
        a = N.new('ShaderNodeVectorMath'); a.operation = 'SCALE'
        L.new(rp.outputs['Color'], a.inputs[0]); L.new(inv.outputs[0], a.inputs['Scale'])
        b = N.new('ShaderNodeVectorMath'); b.operation = 'SCALE'
        b.inputs[0].default_value = K['lin'](PANZA)
        L.new(abajo.outputs[0], b.inputs['Scale'])
        suma = N.new('ShaderNodeVectorMath'); suma.operation = 'ADD'
        L.new(a.outputs[0], suma.inputs[0]); L.new(b.outputs[0], suma.inputs[1])
        # EL ESQUEMA DE LA ARMADA (perilla `esquema`): gris parejo arriba y la panza casi blanca, sin
        # manchas. Horneando la perilla vale 0 y esto no cambia nada.
        if 'perilla' in K:
            g1 = N.new('ShaderNodeRGB'); g1.outputs[0].default_value = (*K['lin'](ARMADA), 1)
            g2 = N.new('ShaderNodeRGB'); g2.outputs[0].default_value = (*K['lin'](ARMADA_PANZA), 1)
            armada = K['mezcla'](N, L, g1.outputs[0], g2.outputs[0], abajo.outputs[0])
            suma = K['mezcla'](N, L, suma.outputs[0], armada, K['perilla'](nt, 'esquema', 0.0)).node
        if not bandera:
            return suma.outputs[0]
        # LA BANDERA PINTADA en la deriva: tres franjas (celeste, blanco, celeste) en la banda de
        # alturas `bandera` = (y0, y1) del modelo. Pintada y no pegada: las cajitas de antes
        # flotaban al costado de la deriva en cuanto la camara se corria de la cola.
        y0, y1 = bandera
        sep2 = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep2.inputs['Vector'])
        mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = y0; mr.inputs['From Max'].default_value = y1
        L.new(sep2.outputs['Y'], mr.inputs['Value'])
        fr = N.new('ShaderNodeValToRGB'); fr.color_ramp.interpolation = 'CONSTANT'
        fe = fr.color_ramp.elements
        fe.new(0.5)
        for e, (p_, c) in zip(fe, [(0.0, CELESTE), (0.34, BLANCO), (0.67, CELESTE)]): e.position = p_; e.color = (*K['lin'](c), 1)
        L.new(mr.outputs['Result'], fr.inputs['Fac'])
        dentro = N.new('ShaderNodeMath'); dentro.operation = 'MULTIPLY'
        ga = N.new('ShaderNodeMath'); ga.operation = 'GREATER_THAN'; ga.inputs[1].default_value = y0
        gb = N.new('ShaderNodeMath'); gb.operation = 'LESS_THAN'; gb.inputs[1].default_value = y1
        L.new(sep2.outputs['Y'], ga.inputs[0]); L.new(sep2.outputs['Y'], gb.inputs[0])
        L.new(ga.outputs[0], dentro.inputs[0]); L.new(gb.outputs[0], dentro.inputs[1])
        inv2 = N.new('ShaderNodeMath'); inv2.operation = 'SUBTRACT'; inv2.inputs[0].default_value = 1.0
        L.new(dentro.outputs[0], inv2.inputs[1])
        p1 = N.new('ShaderNodeVectorMath'); p1.operation = 'SCALE'
        L.new(suma.outputs[0], p1.inputs[0]); L.new(inv2.outputs[0], p1.inputs['Scale'])
        p2 = N.new('ShaderNodeVectorMath'); p2.operation = 'SCALE'
        L.new(fr.outputs['Color'], p2.inputs[0]); L.new(dentro.outputs[0], p2.inputs['Scale'])
        tot = N.new('ShaderNodeVectorMath'); tot.operation = 'ADD'
        L.new(p1.outputs[0], tot.inputs[0]); L.new(p2.outputs[0], tot.inputs[1])
        return tot.outputs[0]
    return K['mat_cel_nodo'](nombre, base)

# ============================ EL A-4 SKYHAWK ============================
def a4nuevo(T, K):
    raiz = bpy.data.objects.new('modelo', None)
    bpy.context.scene.collection.objects.link(raiz)
    raiz.parent = T
    camo = mat_camo(K)
    vidrio = K['mat_cel']('vidrio', CANOPY, brillo=True)
    oscuro = K['mat_cel']('metal', '#3a3f38')
    boca = K['mat_emisivo']('boca', '#14170f')

    # EL FUSELAJE: (z, medio ancho, medio alto, y del centro). Trompa afinada y apenas caida, la
    # cabina mas alta que ancha, la cola que se angosta hacia la tobera.
    _subdiv(loft('fuselaje', [
        (-3.95, 0.015, 0.015, -0.06),
        (-3.75, 0.10, 0.09, -0.05),
        (-3.40, 0.20, 0.19, -0.03),
        (-2.95, 0.29, 0.28, -0.01),
        (-2.45, 0.35, 0.36, 0.02),
        (-1.95, 0.38, 0.43, 0.06),
        (-1.45, 0.40, 0.47, 0.08),
        (-0.95, 0.42, 0.48, 0.08),
        (-0.40, 0.43, 0.47, 0.07),
        (0.20, 0.43, 0.45, 0.06),
        (0.80, 0.41, 0.42, 0.05),
        (1.40, 0.38, 0.38, 0.05),
        (2.00, 0.34, 0.34, 0.06),
        (2.50, 0.31, 0.30, 0.06),
        (2.86, 0.30, 0.28, 0.06),
    ], raiz, camo, n=20, expo=2.3, cerrar=(True, True)), 2)

    # EL LOMO detras de la cabina, que corre hasta la deriva
    _subdiv(loft('lomo', [
        (-1.05, 0.10, 0.06, 0.48),
        (-0.70, 0.15, 0.10, 0.47),
        (0.20, 0.14, 0.10, 0.44),
        (1.20, 0.11, 0.08, 0.40),
        (2.10, 0.06, 0.05, 0.36),
    ], raiz, camo, n=12, expo=2.0, cerrar=(True, True)), 1)

    # LA CABINA: burbuja baja y larga, apoyada sobre el lomo delantero
    elipsoide('cabina', (0, 0.49, -1.55), (0.27, 0.24, 0.66), raiz, vidrio)

    # LAS TOMAS DE AIRE: "orejas" que nacen a la altura de la cabina y se funden atras
    for sg in (-1, 1):
        est = []
        for (z, w, h) in [(-1.30, 0.19, 0.23), (-0.95, 0.20, 0.24), (-0.35, 0.17, 0.20), (0.25, 0.11, 0.13), (0.70, 0.05, 0.06)]:
            est.append((z, w, h, 0.05))
        ob = loft('toma%d' % sg, est, raiz, camo, n=14, expo=2.0, cerrar=(False, True), x0=sg * 0.42)
        _subdiv(ob, 1)
        disco('boca%d' % sg, (sg * 0.42, 0.05, -1.305), 0.15, raiz, boca).rotation_euler = (math.pi, 0, 0)

    # EL ALA: delta recortado, baja, con perfil y una caida apenas hacia la punta (anhedral leve)
    caida = math.tan(math.radians(3))
    ala = superficie('ala', [
        (0.00, -0.40, 2.50, 0.110, -0.16),
        (0.45, -0.14, 2.24, 0.105, -0.16 - 0.45 * caida),
        (1.50, 0.42, 1.60, 0.100, -0.16 - 1.50 * caida),
        (2.55, 1.05, 0.85, 0.120, -0.16 - 2.55 * caida),
    ], raiz, camo, eje='x', espejo=True)

    # LA DERIVA, alta y ancha, en flecha, con la bandera PINTADA (no pegada: ver mat_camo)
    deriva = mat_camo(K, 'deriva', bandera=(1.16, 1.50))
    superficie('deriva', [
        (0.20, 1.30, 1.50, 0.075, 0.0),
        (0.80, 1.78, 1.10, 0.075, 0.0),
        (1.70, 2.36, 0.62, 0.08, 0.0),
    ], raiz, deriva, eje='y')

    # EL ESTABILIZADOR ALTO, cruzado sobre la deriva: la firma del Skyhawk
    superficie('estab', [
        (0.00, 1.80, 0.95, 0.09, 0.95),
        (1.15, 2.28, 0.50, 0.10, 0.95),
    ], raiz, camo, eje='x', espejo=True)

    # LA SONDA DE REABASTECIMIENTO, a la derecha del morro
    _subdiv(loft('sonda', [(-4.45, 0.02, 0.02, 0.08), (-4.30, 0.05, 0.05, 0.08), (-2.40, 0.045, 0.045, 0.08), (-2.15, 0.08, 0.08, 0.06)],
                 raiz, oscuro, n=8, expo=2.0, cerrar=(True, True), x0=0.46), 0)

    # LA TOBERA: el anillo y las tres capas de calor de cara a la camara
    _subdiv(loft('anillo', [(2.80, 0.31, 0.31, 0.06), (3.02, 0.29, 0.29, 0.06)], raiz, oscuro, n=20, cerrar=(False, False)), 0)
    disco('fondo', (0, 0.06, 2.99), 0.22, raiz, K['mat_emisivo']('f1', '#b8341a'))
    disco('medio', (0, 0.06, 3.00), 0.15, raiz, K['mat_emisivo']('f2', '#f07a22'))
    disco('nucleo', (0, 0.06, 3.01), 0.07, raiz, K['mat_emisivo']('f3', '#ffe6a8'))
    if K.get('cargas'): K['piezas'] = cargas(raiz, K)
    return raiz
