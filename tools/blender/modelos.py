# LOS AVIONES HORNEADOS EN BLENDER (desde el 3/10/2026). Los usa tools/blender/hornear.py con
# `--modelo <clave>`: las mismas claves que tools/models/planes.js (sky, a4q, dagger, supere, pampa,
# mirage y las skins de los Fieles). Cada avion es una FICHA de datos (ver FICHAS al final) que arma
# `jet()`: no hay un modelo escrito a mano por avion, hay secciones, perfiles y una pintura.
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
# cola de aletas. Los pilones se cuelgan SOLOS de cada avion: se calcula la cara de abajo de SU ala
# y de SU panza (ver `bajo_ala` y `bajo_panza`), asi ningun avion necesita numeros de carga a mano.
def tanque(nombre, c, r, largo, padre, mat, mat_aleta):
    x, y, z0 = c[0], c[1], c[2] - largo / 2
    perfil_ = [(0.00, 0.03), (0.10, 0.55), (0.26, 0.90), (0.42, 1.0), (0.62, 1.0), (0.82, 0.72), (1.00, 0.10)]
    ob = loft(nombre, [(z0 + f * largo, r * k, r * k, y) for f, k in perfil_], padre, mat, n=14, expo=2.0, cerrar=(True, True), x0=x)
    _subdiv(ob, 1)
    # las aletas en cruz de la cola, a 45°
    for a in (math.pi / 4, -math.pi / 4):
        f = caja(nombre + '_aleta', (0, 0, 0), (r * 2.6, 0.025, largo * 0.16), padre, mat_aleta)
        f.rotation_euler = (0, 0, a)
        f.location = (x, y, z0 + 0.86 * largo)
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

def _interp(est, k, v):
    """Interpola linealmente la tabla `est` (ordenada por la columna 0) en `v`, columna `k`."""
    for a, b in zip(est, est[1:]):
        if a[0] <= v <= b[0]:
            f = (v - a[0]) / ((b[0] - a[0]) or 1)
            return a[k] + (b[k] - a[k]) * f
    return est[0][k] if v < est[0][0] else est[-1][k]

def bajo_ala(S, x):
    """La cara de ABAJO del ala en la envergadura `x`: (y, z del pilon). El perfil NACA tiene su
    espesor maximo (t*c/2 de cada lado) al 30% de la cuerda, que es donde va el pilon."""
    est = S['ala']
    zle, c, t, d = (_interp(est, k, x) for k in (1, 2, 3, 4))
    return d - t * c / 2, zle + 0.32 * c

def bajo_panza(S, z):
    est = S['fuselaje']
    return _interp(est, 3, z) - _interp(est, 2, z)

def cargas(raiz, K, S):
    """Los cuatro puntos de carga, como en el juego (data/cargas.js): el PAR de pilones del ala
    (tanques o bombas) y el del centro (tanque o bomba). En el .blend se muestran u ocultan con las
    perillas `carga_ala` y `carga_centro`."""
    C = S['carga']
    tq = K['mat_cel']('tanque', C['tanque'])
    tq_aleta = K['mat_cel']('tanque_aleta', C.get('aleta', '#8ea4b6'))
    cu, an, co = K['mat_cel']('bomba', BOMBA), K['mat_cel']('bomba_anillo', BOMBA_ANILLO), K['mat_cel']('bomba_cola', BOMBA_COLA)
    pi_ = K['mat_cel']('pilon', PILON)
    piezas = {k: [] for k in ('pilon_ala', 'tanques_ala', 'bombas_ala', 'pilon_centro', 'tanque_centro', 'bomba_centro')}
    def antes(lista):
        n0 = set(o.name for o in raiz.children)
        return lambda: lista.extend(o for o in raiz.children if o.name not in n0)
    yb, zp = bajo_ala(S, C['ala_x'])
    for sg in (-1, 1):
        x = sg * C['ala_x']
        f = antes(piezas['pilon_ala']); pilon('pilon_ala%d' % sg, x, yb + 0.03, yb - 0.14, zp, 0.85, raiz, pi_); f()
        f = antes(piezas['tanques_ala']); tanque('tanque_ala%d' % sg, (x, yb - 0.14 - 0.17, zp - 0.15), 0.17, 1.95, raiz, tq, tq_aleta); f()
        f = antes(piezas['bombas_ala']); bomba('bomba_ala%d' % sg, (x, yb - 0.14 - 0.15, zp - 0.05), 0.15, 1.35, raiz, cu, an, co); f()
    zc = C['centro_z']; yp = bajo_panza(S, zc)
    f = antes(piezas['pilon_centro']); pilon('pilon_centro', 0, yp + 0.03, yp - 0.15, zc + 0.05, 0.95, raiz, pi_); f()
    f = antes(piezas['tanque_centro']); tanque('tanque_centro', (0, yp - 0.15 - 0.19, zc), 0.19, 2.2, raiz, tq, tq_aleta); f()
    f = antes(piezas['bomba_centro']); bomba('bomba_centro', (0, yp - 0.15 - 0.16, zc + 0.07), 0.16, 1.45, raiz, cu, an, co); f()
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

# ============================ LA PINTURA ============================
def _mezcla(N, L, a, b, f):
    """a * (1 - f) + b * f con nodos de vectores (el nodo Mix cambia sus entradas entre versiones)."""
    inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
    L.new(f, inv.inputs[1])
    pa = N.new('ShaderNodeVectorMath'); pa.operation = 'SCALE'; L.new(a, pa.inputs[0]); L.new(inv.outputs[0], pa.inputs['Scale'])
    pb = N.new('ShaderNodeVectorMath'); pb.operation = 'SCALE'; L.new(b, pb.inputs[0]); L.new(f, pb.inputs['Scale'])
    s = N.new('ShaderNodeVectorMath'); s.operation = 'ADD'; L.new(pa.outputs[0], s.inputs[0]); L.new(pb.outputs[0], s.inputs[1])
    return s.outputs[0]

def _rango(N, L, v, lo, hi):
    """1 si lo < v < hi (None = sin borde de ese lado), 0 si no."""
    salida = None
    for lim, op in ((lo, 'GREATER_THAN'), (hi, 'LESS_THAN')):
        if lim is None: continue
        m = N.new('ShaderNodeMath'); m.operation = op; m.inputs[1].default_value = lim
        L.new(v, m.inputs[0])
        if salida is None: salida = m.outputs[0]
        else:
            p = N.new('ShaderNodeMath'); p.operation = 'MULTIPLY'
            L.new(salida, p.inputs[0]); L.new(m.outputs[0], p.inputs[1]); salida = p.outputs[0]
    return salida

def mat_pintura(K, nombre, P, bandera=None):
    """LA PINTURA de un avion, en el espacio del MODELO (las piezas comparten el dibujo y la pintura
    rola con el avion):
      P['arriba']  [color] liso, o [color A, color B] en manchas (ruido cortado en `corte`)
      P['panza']   el color de las caras que miran hacia abajo
      P['marcas']  rectangulos pintados: dict(x, z, y = (min, max) o None, color, sim = espejo en x,
                   arriba = solo caras que miran hacia arriba). Las marcas de los Fieles, las puntas
                   naranjas del Pampa.
      P['alterna'] (solo el .blend) otra pintura a la que se pasa con la perilla `esquema`
    `bandera` = (y0, y1): la bandera celeste y blanca pintada en esa banda de alturas (la deriva)."""
    def base(nt):
        N, L = nt.nodes, nt.links
        tc = N.new('ShaderNodeTexCoord')
        pos = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], pos.inputs['Vector'])
        geo = N.new('ShaderNodeNewGeometry')
        vt = N.new('ShaderNodeVectorTransform'); vt.vector_type = 'NORMAL'
        vt.convert_from = 'WORLD'; vt.convert_to = 'OBJECT'
        L.new(geo.outputs['Normal'], vt.inputs['Vector'])
        nor = N.new('ShaderNodeSeparateXYZ'); L.new(vt.outputs['Vector'], nor.inputs['Vector'])
        abajo = N.new('ShaderNodeMath'); abajo.operation = 'LESS_THAN'; abajo.inputs[1].default_value = P.get('umbral_panza', -0.28)
        L.new(nor.outputs['Y'], abajo.inputs[0])
        def capa(Q):
            arr = Q['arriba']
            if len(arr) == 1:
                col = _rgb(nt, K, arr[0])
            else:
                nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = Q.get('escala', 0.32)
                nz.inputs['Detail'].default_value = 1.2; nz.inputs['Roughness'].default_value = 0.45
                # la SEMILLA mueve el dibujo por la 4ta dimension del ruido. Solo si la ficha la pide: las
                # celulas de siempre siguen en 3D y no cambian. (En Blender 5 la entrada W no aparece por
                # clave —`'W' in nz.inputs`, `.get('W')`— aunque exista: se la busca por nombre)
                if Q.get('semilla') is not None:
                    nz.noise_dimensions = '4D'
                    w = next((i for i in nz.inputs if i.name == 'W'), None)
                    if w is not None: w.default_value = Q['semilla']
                L.new(tc.outputs['Object'], nz.inputs['Vector'])
                rp = N.new('ShaderNodeValToRGB'); rp.color_ramp.interpolation = 'CONSTANT'
                e = rp.color_ramp.elements
                e[0].position = 0.0; e[0].color = (*K['lin'](arr[0]), 1)
                e[1].position = Q.get('corte', 0.5); e[1].color = (*K['lin'](arr[1]), 1)
                L.new(nz.outputs['Fac'], rp.inputs['Fac'])
                col = rp.outputs['Color']
            col = _mezcla(N, L, col, _rgb(nt, K, Q['panza']), abajo.outputs[0])
            for M in Q.get('marcas', []):
                vx = pos.outputs['X']
                if M.get('sim', True):
                    ab = N.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'; L.new(vx, ab.inputs[0]); vx = ab.outputs[0]
                masc = None
                for v, r in ((vx, M.get('x')), (pos.outputs['Z'], M.get('z')), (pos.outputs['Y'], M.get('y'))):
                    if not r: continue
                    m = _rango(N, L, v, r[0], r[1])
                    if masc is None: masc = m
                    else:
                        p = N.new('ShaderNodeMath'); p.operation = 'MULTIPLY'; L.new(masc, p.inputs[0]); L.new(m, p.inputs[1]); masc = p.outputs[0]
                if M.get('arriba', True):
                    up = _rango(N, L, nor.outputs['Y'], 0.25, None)
                    p = N.new('ShaderNodeMath'); p.operation = 'MULTIPLY'; L.new(masc, p.inputs[0]); L.new(up, p.inputs[1]); masc = p.outputs[0]
                col = _mezcla(N, L, col, _rgb(nt, K, M['color']), masc)
            return col
        col = capa(P)
        if P.get('alterna') and 'perilla' in K:
            col = _mezcla(N, L, col, capa(P['alterna']), K['perilla'](nt, 'esquema', 0.0))
        if not bandera:
            return col
        # LA BANDERA PINTADA en la deriva: tres franjas (celeste, blanco, celeste). Pintada y no
        # pegada: las cajitas de antes flotaban al costado de la deriva fuera de la vista de cola.
        y0, y1 = bandera
        mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = y0; mr.inputs['From Max'].default_value = y1
        L.new(pos.outputs['Y'], mr.inputs['Value'])
        fr = N.new('ShaderNodeValToRGB'); fr.color_ramp.interpolation = 'CONSTANT'
        fe = fr.color_ramp.elements
        fe.new(0.5)
        for e, (p_, c) in zip(fe, [(0.0, CELESTE), (0.34, BLANCO), (0.67, CELESTE)]): e.position = p_; e.color = (*K['lin'](c), 1)
        L.new(mr.outputs['Result'], fr.inputs['Fac'])
        return _mezcla(N, L, col, fr.outputs['Color'], _rango(N, L, pos.outputs['Y'], y0, y1))
    return K['mat_cel_nodo'](nombre, base)

# ============================ EL ARMADOR ============================
def jet(T, K, S):
    """Arma un avion desde su FICHA `S` (ver FICHAS). Todo en el espacio de three: y arriba, nariz
    hacia -z, y en la escala de tools/models/planes.js — el sprite sale del mismo tamaño."""
    raiz = bpy.data.objects.new('modelo', None)
    bpy.context.scene.collection.objects.link(raiz)
    raiz.parent = T
    P = S['pintura']
    piel = mat_pintura(K, 'pintura', P)
    deriva = mat_pintura(K, 'deriva', S.get('pintura_deriva', P), bandera=S.get('bandera'))
    vidrio = K['mat_cel']('vidrio', CANOPY, brillo=True)
    oscuro = K['mat_cel']('metal', S.get('metal', '#3a3f38'))
    boca = K['mat_emisivo']('boca', '#14170f')
    tomas = K['mat_cel']('tomas', S['tomas']['color']) if S['tomas'].get('color') else piel

    _subdiv(loft('fuselaje', S['fuselaje'], raiz, piel, n=20, expo=S.get('expo', 2.3), cerrar=(True, True)), 2)
    if S.get('lomo'):
        _subdiv(loft('lomo', S['lomo'], raiz, piel, n=12, expo=2.0, cerrar=(True, True)), 1)
    elipsoide('cabina', S['cabina'][0], S['cabina'][1], raiz, vidrio)
    # LAS TOMAS DE AIRE: "orejas" que nacen a la altura de la cabina y se funden atras. Las del
    # Dagger y el Mirage llevan el CONO de choque asomando por la boca.
    Tm = S['tomas']
    for sg in (-1, 1):
        x0 = sg * Tm['x0']
        ob = loft('toma%d' % sg, [(z, w, h, Tm['yc']) for (z, w, h) in Tm['est']], raiz, tomas, n=14, expo=2.0, cerrar=(False, True), x0=x0)
        _subdiv(ob, 1)
        z0 = Tm['est'][0][0]
        b = disco('boca%d' % sg, (x0, Tm['yc'], z0 - 0.005), Tm['est'][0][1] * 0.78, raiz, boca)
        # (el giro es alrededor del ORIGEN del modelo y manda el disco atras, adentro del fuselaje:
        # de cola no se nota, y las hojas de los aviones jugables quedaron horneadas asi. Los que
        # se ven DE FRENTE — el caza del pasillo — lo dejan en la boca.)
        if not S.get('de_frente'): b.rotation_euler = (math.pi, 0, 0)
        if Tm.get('cono'):
            _subdiv(loft('cono%d' % sg, [(z0 - 0.22, 0.01, 0.01, Tm['yc']), (z0 - 0.05, 0.08, 0.08, Tm['yc']), (z0 + 0.05, 0.10, 0.10, Tm['yc'])],
                         raiz, oscuro, n=10, expo=2.0, cerrar=(True, False), x0=x0), 1)
    superficie('ala', S['ala'], raiz, piel, eje='x', espejo=True)
    superficie('deriva', S['deriva'], raiz, deriva, eje='y')
    if S.get('estab'):
        superficie('estab', S['estab'], raiz, piel, eje='x', espejo=True)
    if S.get('sonda'):
        So = S['sonda']
        _subdiv(loft('sonda', So['est'], raiz, oscuro, n=8, expo=2.0, cerrar=(True, True), x0=So['x0']), 0)
    # LA TOBERA: el anillo y las tres capas de calor de cara a la camara
    To = S['tobera']; y = To['y']
    _subdiv(loft('anillo', [(To['z0'], To['r'], To['r'], y), (To['z1'], To['r'] * 0.94, To['r'] * 0.94, y)], raiz, oscuro, n=20, cerrar=(False, False)), 0)
    z1 = To['z1'] - 0.03
    disco('fondo', (0, y, z1), To['r'] * 0.72, raiz, K['mat_emisivo']('f1', '#b8341a'))
    disco('medio', (0, y, z1 + 0.01), To['r'] * 0.49, raiz, K['mat_emisivo']('f2', '#f07a22'))
    disco('nucleo', (0, y, z1 + 0.02), To['r'] * 0.23, raiz, K['mat_emisivo']('f3', '#ffe6a8'))
    if K.get('cargas'): K['piezas'] = cargas(raiz, K, S)
    return raiz

# ============================ LAS FICHAS ============================
# Los numeros salen de tools/models/planes.js (las mismas medidas y lugares que las primitivas de
# hoy, para que cada sprite ocupe lo mismo en su cuadro); lo que se agrega es la FORMA.
#   fuselaje  (z, medio ancho, medio alto, y del centro), de la trompa a la cola
#   ala / estab  (x de envergadura, z del borde de ataque, cuerda, espesor relativo, y)
#   deriva    (y de altura, z del borde de ataque, cuerda, espesor relativo, x)
#   tomas     x0 (centro lateral), yc (altura), est = (z, medio ancho, medio alto)
#   carga     ala_x (donde va el par de pilones), centro_z, tanque (color: el de data/cargas del juego)
CAIDA_A4 = math.tan(math.radians(3))
A4 = dict(
    fuselaje=[(-3.95, 0.015, 0.015, -0.06), (-3.75, 0.10, 0.09, -0.05), (-3.40, 0.20, 0.19, -0.03), (-2.95, 0.29, 0.28, -0.01),
              (-2.45, 0.35, 0.36, 0.02), (-1.95, 0.38, 0.43, 0.06), (-1.45, 0.40, 0.47, 0.08), (-0.95, 0.42, 0.48, 0.08),
              (-0.40, 0.43, 0.47, 0.07), (0.20, 0.43, 0.45, 0.06), (0.80, 0.41, 0.42, 0.05), (1.40, 0.38, 0.38, 0.05),
              (2.00, 0.34, 0.34, 0.06), (2.50, 0.31, 0.30, 0.06), (2.86, 0.30, 0.28, 0.06)],
    lomo=[(-1.05, 0.10, 0.06, 0.48), (-0.70, 0.15, 0.10, 0.47), (0.20, 0.14, 0.10, 0.44), (1.20, 0.11, 0.08, 0.40), (2.10, 0.06, 0.05, 0.36)],
    cabina=((0, 0.49, -1.55), (0.27, 0.24, 0.66)),
    tomas=dict(x0=0.42, yc=0.05, est=[(-1.30, 0.19, 0.23), (-0.95, 0.20, 0.24), (-0.35, 0.17, 0.20), (0.25, 0.11, 0.13), (0.70, 0.05, 0.06)]),
    ala=[(0.00, -0.40, 2.50, 0.110, -0.16), (0.45, -0.14, 2.24, 0.105, -0.16 - 0.45 * CAIDA_A4),
         (1.50, 0.42, 1.60, 0.100, -0.16 - 1.50 * CAIDA_A4), (2.55, 1.05, 0.85, 0.120, -0.16 - 2.55 * CAIDA_A4)],
    deriva=[(0.20, 1.30, 1.50, 0.075, 0.0), (0.80, 1.78, 1.10, 0.075, 0.0), (1.70, 2.36, 0.62, 0.08, 0.0)],
    bandera=(1.16, 1.50),
    estab=[(0.00, 1.80, 0.95, 0.09, 0.95), (1.15, 2.28, 0.50, 0.10, 0.95)],
    sonda=dict(x0=0.46, est=[(-4.45, 0.02, 0.02, 0.08), (-4.30, 0.05, 0.05, 0.08), (-2.40, 0.045, 0.045, 0.08), (-2.15, 0.08, 0.08, 0.06)]),
    tobera=dict(z0=2.80, z1=3.02, r=0.31, y=0.06),
    pintura=dict(arriba=[MARRON, VERDE], panza=PANZA, alterna=dict(arriba=[ARMADA], panza=ARMADA_PANZA)),
    carga=dict(ala_x=1.45, centro_z=0.25, tanque=PANZA),
)

def _variante(base, **cambios):
    d = dict(base); d.update(cambios); return d

def _con_pintura(base, **p):
    d = dict(base); d['pintura'] = _variante(base['pintura'], **p); d['pintura'].pop('alterna', None)
    return d

# LAS MARCAS DE LOS FIELES (MARCAS de tools/models/planes.js): todas en el ALA, que es lo unico que
# se lee desde la camara de cola. Mismos lugares y colores; ahora pintadas sobre el ala nueva.
BLANCO_M, ROJO_M, GRIS_M = '#e8eef0', '#c4402c', '#9aa3a8'
MARCAS = {
    'tero': [dict(x=(0.78, 1.12), z=(0.20, 1.30), color=BLANCO_M)],
    'puma': [dict(x=(0.60, 2.20), z=(0.80, 1.10), color=BLANCO_M)],
    'gitano': [dict(x=(2.00, 2.60), z=(0.60, 1.40), color=ROJO_M)],
    'pichon': [dict(x=(-1.95, -1.15), z=(0.45, 1.15), color=GRIS_M, sim=False),
               dict(x=(1.10, 1.50), z=(0.15, 0.55), color='#b6bcc0', sim=False)],
}
DAGGER = dict(
    fuselaje=[(-4.30, 0.015, 0.015, 0.02), (-4.00, 0.09, 0.085, 0.025), (-3.50, 0.19, 0.18, 0.03), (-3.00, 0.26, 0.26, 0.035),
              (-2.50, 0.31, 0.33, 0.05), (-2.00, 0.34, 0.38, 0.07), (-1.50, 0.36, 0.40, 0.08), (-0.90, 0.37, 0.39, 0.07),
              (-0.20, 0.37, 0.37, 0.06), (0.60, 0.36, 0.36, 0.05), (1.40, 0.35, 0.35, 0.05), (2.20, 0.34, 0.34, 0.05), (2.95, 0.32, 0.31, 0.05)],
    lomo=[(-1.30, 0.09, 0.05, 0.42), (-0.90, 0.13, 0.08, 0.42), (0.20, 0.12, 0.08, 0.40), (1.40, 0.09, 0.06, 0.37), (2.30, 0.05, 0.04, 0.34)],
    cabina=((0, 0.45, -1.85), (0.25, 0.24, 0.62)),
    tomas=dict(x0=0.40, yc=0.10, cono=True, est=[(-1.45, 0.19, 0.23), (-1.10, 0.20, 0.24), (-0.40, 0.17, 0.20), (0.30, 0.10, 0.12), (0.80, 0.04, 0.05)]),
    ala=[(0.0, -1.40, 4.60, 0.055, -0.14), (0.5, -0.75, 3.90, 0.055, -0.14), (1.5, 0.55, 2.48, 0.060, -0.14),
         (2.4, 1.72, 1.20, 0.070, -0.14), (3.0, 2.50, 0.36, 0.120, -0.14)],
    deriva=[(0.20, 1.35, 1.48, 0.07, 0.0), (1.00, 1.90, 1.05, 0.07, 0.0), (1.81, 2.45, 0.60, 0.08, 0.0)],
    bandera=(1.46, 1.78),
    tobera=dict(z0=2.90, z1=3.12, r=0.31, y=0.05),
    pintura=dict(arriba=['#4e6136', '#c0ab5e'], corte=0.52, escala=0.28, panza='#93a3ae'),
    carga=dict(ala_x=1.50, centro_z=0.30, tanque='#a9b8c0'),
)
MIRAGE = _variante(DAGGER,
    fuselaje=[(-4.40, 0.015, 0.015, 0.02), (-4.05, 0.08, 0.075, 0.025), (-3.55, 0.18, 0.17, 0.03), (-3.00, 0.26, 0.26, 0.035),
              (-2.50, 0.31, 0.33, 0.05), (-2.00, 0.34, 0.38, 0.07), (-1.50, 0.36, 0.40, 0.08), (-0.90, 0.37, 0.39, 0.07),
              (-0.20, 0.37, 0.37, 0.06), (0.60, 0.36, 0.36, 0.05), (1.40, 0.35, 0.35, 0.05), (2.20, 0.34, 0.34, 0.05), (3.00, 0.32, 0.31, 0.05)],
    cabina=((0, 0.46, -1.90), (0.25, 0.25, 0.60)),
    tomas=dict(x0=0.40, yc=0.10, cono=True, est=[(-1.50, 0.19, 0.23), (-1.15, 0.20, 0.24), (-0.45, 0.17, 0.20), (0.25, 0.10, 0.12), (0.75, 0.04, 0.05)]),
    ala=[(0.0, -1.40, 4.70, 0.055, -0.14), (0.5, -0.73, 3.98, 0.055, -0.14), (1.5, 0.60, 2.52, 0.060, -0.14),
         (2.45, 1.86, 1.15, 0.070, -0.14), (3.05, 2.60, 0.36, 0.120, -0.14)],
    deriva=[(0.20, 1.37, 1.53, 0.07, 0.0), (1.00, 1.92, 1.08, 0.07, 0.0), (1.86, 2.52, 0.60, 0.08, 0.0)],
    bandera=(1.51, 1.83),
    tobera=dict(z0=2.95, z1=3.17, r=0.31, y=0.05),
    pintura=dict(arriba=['#a9b1b6', '#c4b796'], corte=0.55, escala=0.22, panza='#c9d0d4'),
    carga=dict(ala_x=1.50, centro_z=0.30, tanque='#8e979d'),
)
SUPERE = dict(
    fuselaje=[(-4.40, 0.015, 0.015, -0.02), (-4.10, 0.10, 0.10, -0.02), (-3.60, 0.22, 0.22, -0.01), (-3.00, 0.31, 0.31, 0.0),
              (-2.40, 0.37, 0.38, 0.02), (-1.90, 0.39, 0.43, 0.05), (-1.30, 0.40, 0.45, 0.06), (-0.60, 0.41, 0.44, 0.05),
              (0.20, 0.41, 0.42, 0.04), (1.00, 0.39, 0.40, 0.03), (1.80, 0.36, 0.36, 0.03), (2.40, 0.33, 0.32, 0.03), (2.72, 0.32, 0.30, 0.03)],
    lomo=[(-1.00, 0.10, 0.06, 0.46), (-0.60, 0.14, 0.09, 0.45), (0.40, 0.13, 0.09, 0.42), (1.40, 0.10, 0.07, 0.38), (2.20, 0.05, 0.04, 0.34)],
    cabina=((0, 0.45, -1.60), (0.27, 0.25, 0.63)),
    tomas=dict(x0=0.42, yc=0.12, color='#7b8a94', est=[(-1.25, 0.19, 0.22), (-0.90, 0.20, 0.23), (-0.30, 0.17, 0.19), (0.30, 0.10, 0.12), (0.75, 0.04, 0.05)]),
    ala=[(0.0, -0.55, 2.20, 0.080, 0.02), (0.45, -0.28, 1.97, 0.080, 0.02), (1.5, 0.35, 1.42, 0.085, 0.02), (2.5, 0.95, 0.90, 0.100, 0.02)],
    deriva=[(0.20, 1.55, 1.27, 0.07, 0.0), (0.90, 2.00, 0.90, 0.07, 0.0), (1.59, 2.45, 0.55, 0.08, 0.0)],
    bandera=(1.22, 1.54),
    estab=[(0.0, 1.70, 0.90, 0.08, 0.50), (1.2, 2.20, 0.45, 0.10, 0.50)],
    sonda=dict(x0=0.0, est=[(-3.90, 0.02, 0.02, 0.37), (-3.80, 0.06, 0.06, 0.37), (-2.90, 0.06, 0.06, 0.35), (-2.70, 0.09, 0.07, 0.30)]),
    tobera=dict(z0=2.66, z1=2.90, r=0.31, y=0.03),
    pintura=dict(arriba=['#4d5b66', '#3e4b56'], corte=0.55, escala=0.25, panza='#c3cad0',
                 marcas=[dict(x=(-2.15, -0.55), z=(0.0, 0.9), color='#7b8a94', sim=False)]),
    metal='#2d353c',
    carga=dict(ala_x=1.50, centro_z=0.20, tanque='#3e4b56', aleta='#2f3a44'),
)
NARANJA = '#e07030'
PAMPA = dict(
    fuselaje=[(-3.75, 0.015, 0.015, -0.02), (-3.50, 0.10, 0.10, -0.02), (-3.10, 0.21, 0.21, -0.01), (-2.60, 0.30, 0.31, 0.0),
              (-2.10, 0.35, 0.38, 0.03), (-1.60, 0.37, 0.43, 0.05), (-1.00, 0.38, 0.45, 0.06), (-0.30, 0.39, 0.44, 0.05),
              (0.40, 0.38, 0.41, 0.04), (1.10, 0.36, 0.38, 0.03), (1.80, 0.33, 0.34, 0.03), (2.30, 0.30, 0.30, 0.03), (2.48, 0.29, 0.28, 0.03)],
    lomo=[(-0.20, 0.12, 0.07, 0.40), (0.60, 0.13, 0.08, 0.40), (1.50, 0.09, 0.06, 0.36), (2.10, 0.05, 0.04, 0.32)],
    cabina=((0, 0.44, -1.20), (0.29, 0.27, 0.94)),
    tomas=dict(x0=0.40, yc=0.18, est=[(-0.98, 0.17, 0.20), (-0.65, 0.18, 0.21), (-0.10, 0.15, 0.18), (0.45, 0.09, 0.11), (0.85, 0.04, 0.05)]),
    ala=[(0.0, -0.33, 1.35, 0.13, 0.30), (1.3, -0.25, 1.18, 0.13, 0.30), (2.65, -0.17, 1.00, 0.13, 0.30)],
    deriva=[(0.20, 1.42, 1.12, 0.08, 0.0), (0.80, 1.74, 0.88, 0.08, 0.0), (1.44, 2.075, 0.60, 0.09, 0.0)],
    bandera=(1.02, 1.32),
    estab=[(0.0, 1.575, 0.85, 0.10, 0.36), (1.2, 1.875, 0.55, 0.11, 0.36)],
    tobera=dict(z0=2.42, z1=2.64, r=0.27, y=0.03),
    pintura=dict(arriba=['#8e979e', '#55663d'], corte=0.5, panza='#b8bec2',
                 marcas=[dict(x=(1.85, 2.75), z=(-0.5, 1.2), color=NARANJA),          # puntas de ala (escuela)
                         dict(x=(0.75, 1.30), z=(1.4, 2.6), y=(0.2, 0.6), color=NARANJA),  # puntas del estabilizador
                         dict(z=(-2.75, -2.30), color=NARANJA, arriba=False)]),          # la franja del morro
    pintura_deriva=dict(arriba=['#8e979e'], panza='#b8bec2', marcas=[dict(y=(1.34, 1.60), color=NARANJA, arriba=False)]),
    carga=dict(ala_x=1.40, centro_z=0.20, tanque='#b8bec2'),
)

FICHAS = {
    'sky': A4,
    'a4q': _con_pintura(A4, arriba=['#b4bcc2', '#c2c9ce'], corte=0.5, panza='#dfe3e6'),
    'dagger': DAGGER, 'mirage': MIRAGE, 'supere': SUPERE, 'pampa': PAMPA,
    'skin_tero': _con_pintura(A4, marcas=MARCAS['tero']),
    'skin_puma': _con_pintura(A4, marcas=MARCAS['puma']),
    'skin_gitano': _con_pintura(A4, marcas=MARCAS['gitano']),
    'skin_pichon': _con_pintura(A4, marcas=MARCAS['pichon']),
    # VASCO no lleva marca: su distintivo es el CAMUFLAJE LAVADO (CAMO_LAVADO), el avion mas viejo
    'skin_vasco': _con_pintura(A4, arriba=['#7d6449', '#616d51'], panza='#bed0de'),
}
FICHAS['a4q']['carga'] = dict(A4['carga'], tanque='#dfe3e6')

# LAS VARIANTES DEL ESCUADRON (autor, 8/10: "no veo variedad de aviones del escuadron, todos tienen el
# mismo avion — deberian tener variantes"). Cada celula trae CUATRO, una por numeral (la formacion es
# de cinco: el lider vuela la hoja de siempre). A la distancia de la formacion la marca chica de un ala
# no se lee; lo que SI se lee es el DIBUJO del camuflaje (manchas grandes) y el TONO de la chapa. Asi
# que cada variante cambia las tres cosas que sobreviven a 84 px:
#   · la SEMILLA del ruido del camuflaje: otras manchas en otro lugar — cada avion se pintaba a mano
#   · el REPARTO del camuflaje (`corte`): uno mas marron, otro mas verde. Desde la cola el ala se ve
#     escorzada y la semilla sola casi no se nota; el color que DOMINA si
#   · el TONO: uno lavado por el sol y la sal, uno recien repintado (mas oscuro)
#   · las BANDAS AMARILLAS de identificacion en las alas, en dos de los cuatro (ver
#     docs/historia/PREGUNTAS_HISTORICAS.md: que aviones las llevaban y desde cuando)
# Solo la vista BASE: los numerales se dibujan con la hoja base (render/squad.js). Fuera de campaña;
# en campaña cada numeral es un Fiel y lleva su skin (arriba).
AMARILLO_ID = '#d9b03a'

def _tono(hexs, f):
    """`f` > 0 aclara y destiñe hacia un gris calido (lavado); `f` < 0 oscurece (repintado)."""
    c = [int(hexs[i:i + 2], 16) for i in (1, 3, 5)]
    if f >= 0: c = [v + (o - v) * f for v, o in zip(c, (0xb8, 0xb4, 0xa6))]
    else: c = [v * (1 + f) for v in c]
    return '#%02x%02x%02x' % tuple(max(0, min(255, round(v))) for v in c)

def _variantes(base):
    P = base['pintura']
    envergadura = max(e[0] for e in base['ala'])
    banda = dict(x=(0.56 * envergadura, 0.70 * envergadura), color=AMARILLO_ID)
    marcas = list(P.get('marcas', []))
    corte = P.get('corte', 0.5)
    def v(semilla, tono=0.0, bandas=False, reparto=0.0):
        return _con_pintura(base, semilla=semilla, corte=corte + reparto, arriba=[_tono(c, tono) for c in P['arriba']],
                            panza=_tono(P['panza'], tono * 0.5), marcas=marcas + ([banda] if bandas else []))
    return [v(1.9, reparto=-0.16), v(3.7, 0.26), v(5.3, bandas=True, reparto=0.16), v(7.1, -0.18, bandas=True)]

for _clave in ('sky', 'a4q', 'dagger', 'mirage', 'supere', 'pampa'):
    for _n, _f in enumerate(_variantes(FICHAS[_clave]), 1):
        FICHAS['var_%s_%d' % (_clave, _n)] = _f

# …Y LOS FIELES TAMBIEN (8/10). En campaña y en las pruebas los numerales son los Fieles, y su skin
# era la misma chapa con una marquita en el ala: cinco aviones iguales a la distancia de la
# formacion. Cada uno toma el reparto/tono/bandas de una variante y CONSERVA su marca. TERO, el
# que arranca de lider, queda con el camuflaje de siempre; VASCO conserva su camuflaje lavado.
_VAR_A4 = _variantes(A4)
for _nom, _n in (('puma', 1), ('gitano', 3), ('pichon', 4)):
    _p = dict(_VAR_A4[_n - 1]['pintura'])
    _p['marcas'] = MARCAS[_nom] + [m for m in _p['marcas'] if m['color'] == AMARILLO_ID]
    FICHAS['skin_' + _nom] = dict(A4, pintura=_p)
FICHAS['skin_vasco'] = _con_pintura(A4, arriba=['#7d6449', '#616d51'], panza='#bed0de', semilla=3.7)

def construir(clave, T, K):
    return jet(T, K, FICHAS[clave])

# el nombre del experimento, que sigue andando (el A-4 de la FAA)
def a4nuevo(T, K):
    return construir('sky', T, K)
