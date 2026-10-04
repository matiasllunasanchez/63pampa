# LOS RESTOS, HECHOS EN BLENDER (4/10/2026). Reemplazan a tools/models/restos.js, que pasaba por el
# puente tal cual. Se arman CON LOS MODELOS NUEVOS (el Rapier y los camiones de modelos_tierra.py, el
# Sea King de modelos_helos.py, el caza de modelos_enemigos.py, la barcaza de modelos_buques.py) en
# configuracion de naufragio — las tres reglas de restos.js siguen mandando:
#   1. SE RECONOCE: conserva la masa y la proporcion del vivo.
#   2. LE FALTA LO QUE LO DEFINIA: al radar el plato, al globo el aire, a la carpa los parantes.
#   3. ESTA QUEMADO, NO PINTADO DE GRIS: cada color del modelo se empuja hacia el hollin CONSERVANDO SU
#      TONO (`quemado`, poco en las masas grandes) y el negro se gasta en MANCHAS (`tiznar`: ruido sobre
#      el material, lamparones de humo) — el contraste entre lo tiznado y lo que conserva el color es
#      lo que se lee quemado; un resto oscuro parejo se pierde contra la turba.
# Y NADA SE INCLINA EN ANGULO RECTO: los angulos son los de restos.js, feos a proposito.
import importlib.util, math, os
import bpy
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
def _mod(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(AQUI, archivo))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m
M = _mod('modelos_bl_base_r', 'modelos.py')
TI = _mod('modelos_bl_tierra_r', 'modelos_tierra.py')
HE = _mod('modelos_bl_helos_r', 'modelos_helos.py')
EN = _mod('modelos_bl_enem_r', 'modelos_enemigos.py')
BU = _mod('modelos_bl_buques_r', 'modelos_buques.py')
elipsoide, loft, _subdiv, superficie = M.elipsoide, M.loft, M._subdiv, M.superficie
vacio, pieza, bloque, hueso, poste, columna = TI.vacio, TI.pieza, TI.bloque, TI.hueso, TI.poste, TI.columna

HOLLIN = (0x22, 0x1d, 0x19)
VIDRIOS = ('#8fd0e0', '#9fb6bd', '#2b4552')

def quemar(hexs, k):
    h = hexs.lstrip('#')
    rgb = [int(h[i:i + 2], 16) for i in (0, 2, 4)]
    return '#' + ''.join('%02x' % round(v * (1 - k) + HOLLIN[i] * k) for i, v in enumerate(rgb))

def quemado(K, k=0.2):
    """El MISMO kit de materiales, pero todo color que pasa sale quemado `k` (los vidrios, ciegos de
    humo: 0,55). Los modelos vivos se arman con este K y salen chamuscados sin tocarlos."""
    q = dict(K)
    kk = lambda c: 0.55 if c.lower() in VIDRIOS else k
    q['mat_cel'] = lambda n, c, brillo=False: K['mat_cel'](n, quemar(c, kk(c)), False)
    q['lin'] = lambda c: K['lin'](quemar(c, kk(c)))
    q['mat_emisivo'] = lambda n, c: K['mat_cel'](n, quemar(c, 0.5))      # ya no hay luz adentro
    return q

def tiznar(raiz, escala=2.6, corte=0.60, hollin='#191512'):
    """LAS MANCHAS DE HOLLIN: sobre CADA material del resto, un ruido fino en el espacio del objeto, en
    DOS NIVELES — chamuscado (a medias) arriba de `corte` y carbon arriba de `corte` + 0,08. Es donde se
    gasta el negro. (Con un solo nivel y manchas grandes salia un CAMUFLAJE, no un incendio.)"""
    hechos = set()
    for ob in [raiz] + list(raiz.children_recursive):
        if ob.type != 'MESH': continue
        for m in ob.data.materials:
            if not m or m.name in hechos or not m.use_nodes: continue
            hechos.add(m.name)
            nt = m.node_tree; N = nt.nodes; L = nt.links
            em = next((n for n in N if n.type == 'EMISSION'), None)
            if not em or not em.inputs['Color'].links: continue
            col = em.inputs['Color'].links[0].from_socket
            tc = N.new('ShaderNodeTexCoord')
            nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = escala
            nz.inputs['Detail'].default_value = 6.0; nz.inputs['Roughness'].default_value = 0.65
            L.new(tc.outputs['Object'], nz.inputs['Vector'])
            c1 = N.new('ShaderNodeMath'); c1.operation = 'GREATER_THAN'; c1.inputs[1].default_value = corte
            c2 = N.new('ShaderNodeMath'); c2.operation = 'GREATER_THAN'; c2.inputs[1].default_value = corte + 0.08
            L.new(nz.outputs['Fac'], c1.inputs[0]); L.new(nz.outputs['Fac'], c2.inputs[0])
            cut = N.new('ShaderNodeMath'); cut.operation = 'MULTIPLY_ADD'
            cut.inputs[1].default_value = 0.55; L.new(c1.outputs[0], cut.inputs[0])   # 0,55 chamuscado
            L.new(c2.outputs[0], cut.inputs[2])
            tope = N.new('ShaderNodeMath'); tope.operation = 'MINIMUM'; tope.inputs[1].default_value = 1.0
            L.new(cut.outputs[0], tope.inputs[0]); cut = tope
            h = hollin.lstrip('#'); hl = tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))
            inv = N.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
            L.new(cut.outputs[0], inv.inputs[1])
            a = N.new('ShaderNodeVectorMath'); a.operation = 'SCALE'; L.new(col, a.inputs[0]); L.new(inv.outputs[0], a.inputs['Scale'])
            b = N.new('ShaderNodeVectorMath'); b.operation = 'SCALE'; b.inputs[0].default_value = hl; L.new(cut.outputs[0], b.inputs['Scale'])
            s = N.new('ShaderNodeVectorMath'); s.operation = 'ADD'; L.new(a.outputs[0], s.inputs[0]); L.new(b.outputs[0], s.inputs[1])
            L.new(s.outputs[0], em.inputs['Color'])

def chapas(padre, K, n, r, color, x, y, z):
    """CHAPA RETORCIDA: placas finas en angulos distintos saliendo de un punto (deterministas: angulo
    aureo). Es lo que separa "roto" de "apagado"."""
    m = K['mat_cel']('chapa_rota', color)
    for i in range(n):
        a = i * 2.399
        pieza('chapa', padre, m, (r * (0.5 + (i % 3) * 0.22), 0.05, r * (0.6 + (i % 2) * 0.3)),
              (x + math.cos(a) * r * 0.6, y + (i % 2) * 0.08, z + math.sin(a) * r * 0.6),
              (-0.2 + (i % 3) * 0.3, a, 0.3 + (i % 4) * 0.24))

def crater(padre, K, r, color='#5a5442'):
    """El CRATER: tierra removida en terrones alrededor — apoya al resto en el suelo."""
    ms = [K['mat_cel']('tierra', color), K['mat_cel']('tierra_q', quemar(color, 0.35))]
    for i in range(13):
        a = i * 2 * math.pi / 13
        rr = r * (1 + 0.08 * math.sin(i * 2.7))
        t = elipsoide('terron', (0, 0, 0), (r * 0.30, 0.13 + 0.04 * (i % 3), r * 0.20), padre, ms[i % 2], seg=10, anillos=6)
        t.rotation_euler = (0, -a, 0); t.location = (math.cos(a) * rr, 0.06, math.sin(a) * rr)
    elipsoide('quemado', (0, 0.0, 0), (r * 0.9, 0.02, r * 0.9), padre, K['mat_cel']('suelo_q', '#2a2620'), seg=18, anillos=4)

def pivotar(ob):
    """Lleva el ORIGEN de la pieza a su centro (los bloques se arman con el origen en el del modelo):
    asi girarla la vuelca en su lugar en vez de hacerla orbitar."""
    c = sum((v.co for v in ob.data.vertices), Vector()) / len(ob.data.vertices)
    for v in ob.data.vertices: v.co -= c
    ob.location = ob.location + c
    return ob

def _raiz(T, nombre):
    return vacio(T, nombre)

def techo_dos_aguas(padre, mat, W, D, cumbre, nombre='techo'):
    """El techo de chapa a dos aguas de la casa (modelos_tierra.puesto), suelto: con la base en y = 0
    y centrado, para poder correrlo y volcarlo."""
    import bmesh
    bm = bmesh.new(); ax, az = W / 2 + 0.22, D / 2 + 0.22
    vs = [bm.verts.new(c) for c in ((-ax, 0, -az), (ax, 0, -az), (ax, 0, az), (-ax, 0, az), (-ax, cumbre, 0), (ax, cumbre, 0))]
    for f in ((0, 1, 5, 4), (2, 3, 4, 5), (3, 0, 4), (1, 2, 5), (0, 3, 2, 1)):
        bm.faces.new([vs[i] for i in f])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    return M._obj(nombre, me, padre, mat)

# ============================ RAPIER VOLCADO ============================
def restoAA(T, K):
    raiz = _raiz(T, 'resto Rapier'); Q = quemado(K, 0.25)
    # el parapeto REVENTADO: la mitad de las bolsas en su lugar, las otras volcadas hacia afuera
    pts = []
    for f in range(2):
        for i in range(9 - f):
            a = math.pi * 0.12 + math.pi * 0.76 * (i + 0.5 * (f + 1)) / 9
            roto = 2 <= i <= 4
            rr = 2.1 + (0.5 + 0.2 * i if roto else 0)
            if roto and f: continue
            pts.append((math.cos(a) * rr, 0.12 + (0 if roto else f * 0.24), math.sin(a) * rr, -a + math.pi / 2 + (0.8 * i if roto else 0)))
    TI.bolsas(raiz, Q, pts)
    tur = vacio(raiz, 'lanzador', (-0.3, 0.85, 0.2), (0, 0.5, 0))
    tumbado = vacio(tur, 'tumbado', (0, 0, 0), (0, 0, 1.35))                     # de costado, no a 90°
    TI.rapier(tumbado, Q, 0.4)
    chapas(raiz, Q, 5, 1.0, '#3d423b', 0.6, 0.1, -0.5)
    tiznar(raiz)
    return raiz

# ============================ EL POZO ABANDONADO ============================
def restoManpad(T, K):
    raiz = _raiz(T, 'resto Blowpipe'); Q = quemado(K, 0.2)
    red = [Q['mat_cel']('red%d' % i, c) for i, c in enumerate(('#5b5e3e', '#4a4d33', '#6a6c48', '#3f4230'))]
    for i in range(14):
        a = i * 2 * math.pi / 14 + 0.3
        roto = i in (3, 4, 10)
        rr = (1.7 if roto else 1.22) + 0.06 * math.sin(i * 2.7)
        b = elipsoide('borde', (0, 0, 0), (0.38, (0.10 if roto else 0.17) + 0.04 * ((i * 5) % 3), 0.26), raiz, red[i % 4], seg=10, anillos=6)
        b.rotation_euler = (0, -a + math.pi / 2 + (0.7 if roto else 0), 0); b.location = (math.cos(a) * rr, 0.08, math.sin(a) * rr)
    elipsoide('fondo', (0, 0.0, 0), (1.15, 0.03, 1.1), raiz, Q['mat_cel']('fondo', '#3a3527'), seg=18, anillos=4)
    # el TUBO tirado y los dos soldados CAIDOS (el soldado arrodillado, volcado de costado)
    t = vacio(raiz, 'tubo', (0.3, 0.12, 0.2), (0, 0.8, 0))
    hueso('tubo', t, Q['mat_cel']('tubo', '#23271c'), (-0.72, 0, 0), (0.72, 0.05, 0), 0.085, 0.085, seg=10)
    for x, z, ry, rz in ((-0.4, -0.2, 0.4, 1.45), (0.6, 0.6, 2.6, -1.40)):
        caido = vacio(raiz, 'caido', (x, 0.22, z), (0, ry, rz))
        TI.soldado(caido, Q, 0, 0, 0)
    tiznar(raiz, corte=0.62)
    return raiz

# ============================ EL CAMION AA VOLCADO ============================
def restoAATruck(T, K):
    raiz = _raiz(T, 'resto camion AA'); Q = quemado(K, 0.2)
    crater(raiz, Q, 2.2)
    v = vacio(raiz, 'volcado', (0, 1.30, 0.1), (0.1, 0, -1.44))                 # 82°: caido, no colocado
    piso, mv, mv2 = TI.camion(v, Q, '#575b48', '#696d58', '#43473a', (-1.8, 1.2, 2.2), largo_caja=4.0, z_caja=0.6)
    tur = vacio(v, 'lanzador', (0, piso, 1.0), (0, 0.6, 0), escala=0.72)
    TI.rapier(tur, Q, 0.5)
    chapas(raiz, Q, 4, 1.1, '#696d58', -1.6, 0.1, 1.4)
    tiznar(raiz)
    return raiz

# ============================ EL RADAR SIN PLATO ============================
def restoRadar(T, K):
    raiz = _raiz(T, 'resto radar'); Q = quemado(K, 0.16)
    piso, mv, mv2 = TI.camion(raiz, Q, '#5d6152', '#6f7362', '#4a4e42', (-1.6, 1.5), largo_caja=4.2, z_caja=0.3)
    bloque('shelter', raiz, mv, (0, piso + 0.55, 0.3), (2.4, 1.10, 4.0), bisel=0.06)
    # el MASTIL quebrado y torcido, y el PLATO caido al costado del camion
    p = vacio(raiz, 'mastil', (0, piso + 1.12, 0.6), (0, 0, 0.35))
    poste('mastil', p, Q['mat_cel']('mastil', '#3a3e34'), 0, 0, 0.45, 0, 0.18, 0.15)
    chapas(raiz, Q, 3, 0.3, '#8a9299', 0, piso + 1.5, 0.6)
    pl = vacio(raiz, 'plato', (1.95, 0.55, 1.2), (0.25, 0.7, 0.92))
    columna('plato', pl, Q['mat_cel']('plato', '#8a9299'), 0, 0, [(0.0, 0.32, 0.20), (0.20, 0.95, 0.64), (0.36, 1.32, 0.90)], expo=2.0)
    tiznar(raiz)
    return raiz

# ============================ EL DEPOSITO HECHO CARCASA ============================
def restoDepot(T, K):
    raiz = _raiz(T, 'resto deposito'); Q = quemado(K, 0.28)
    R, LARGO, BASE = 1.7, 4.6, 0.30
    chapa, carbon = Q['mat_cel']('chapa', '#75705c'), Q['mat_cel']('carbon', '#241f1a')
    # lo que queda de la boveda: los dos arranques de chapa y las COSTILLAS sueltas, peladas
    for sg, a0, a1 in ((-1, 0.0, 0.42), (1, 0.0, 0.28)):
        for i in range(10):
            z = -LARGO / 2 + LARGO * (i + 0.5) / 10
            a = a0 + (a1 - a0) * (0.6 + 0.4 * math.sin(i * 1.7))
            hueso('chapa', raiz, chapa, (sg * R, 0, z), (sg * R * math.cos(a * math.pi), BASE + R * math.sin(a * math.pi), z), 0.24, 0.24, seg=4)
    for z in (-1.6, -0.4, 1.1):
        prev = None
        for k in range(9):
            a = math.pi * k / 8
            p = (R * math.cos(a), BASE + R * math.sin(a) - (0.25 * math.sin(a) if z > 0 else 0), z)
            if prev and not (z == -0.4 and 3 <= k <= 5): hueso('costilla', raiz, carbon, prev, p, 0.05, 0.05, seg=5)
            prev = p
    pieza('porton', raiz, Q['mat_cel']('porton', '#2a2d24'), (1.2, 1.15, 0.03), (0, 0.58, -LARGO / 2 - 0.02))
    chapas(raiz, Q, 6, 1.3, '#5a5444', -2.1, 0.1, -1.0)
    chapas(raiz, Q, 5, 1.0, '#75705c', 0.3, 0.1, 0.4)
    for x, y, z, giro in ((2.1, 0.0, -0.8, (0, 0, 0)), (2.4, 0.28, 0.3, (0, 0, 1.4)), (1.9, 0.28, 1.1, (1.5, 0, 0.3))):
        t = vacio(raiz, 'tambor', (x, y, z), giro)
        columna('tambor', t, Q['mat_cel']('tambor', '#6d7a4a'), 0, 0, [(-0.4 if y else 0, 0.28, 0.28), (0.4 if y else 0.8, 0.28, 0.28)], expo=2.0)
    tiznar(raiz, corte=0.5)
    return raiz

# ============================ LA CASA EN TRES ESTADOS DE DERRUMBE ============================
def restoBldg(T, K, n='0'):
    n = int(n)
    raiz = _raiz(T, 'resto puesto'); Q = quemado(K, 0.14 + n * 0.07)
    W, D = 3.0, 2.4
    alt = (2.0, 1.35, 0.75)[n]                                                   # lo que queda parado
    tablas, techo = Q['mat_cel']('tablas', '#9d9781'), Q['mat_cel']('techo', '#7a3d30')
    oscuro, carbon = Q['mat_cel']('vano', '#23271f'), Q['mat_cel']('carbon', '#241f1a')
    bloque('cuerpo', raiz, tablas, (0, alt / 2, 0), (W, alt, D), bisel=0.03)
    # el BORDE ROTO de las paredes: dientes de distinta altura, carbonizados en la punta
    for i in range(7):
        x = -W / 2 + W * (i + 0.5) / 7
        h = 0.15 + 0.35 * abs(math.sin(i * 2.3 + n))
        bloque('diente', raiz, tablas, (x, alt + h / 2, -D / 2 + 0.06), (W / 7 * 0.9, h, 0.12), bisel=0.01)
        pieza('carbon', raiz, carbon, (W / 7 * 0.9, 0.06, 0.13), (x, alt + h, -D / 2 + 0.06))
    for sg in (-1, 1):
        h = 0.3 + 0.25 * (1 + sg) / 2
        bloque('diente', raiz, tablas, (sg * (W / 2 - 0.06), alt + h / 2, 0), (0.12, h, D * 0.8), bisel=0.01)
    pieza('corte', raiz, carbon, (W, 0.10, D), (0, alt + 0.02, 0))
    if n == 0:
        # el TECHO resbalado, entero pero corrido; el boquete y la ventana que queda
        t = techo_dos_aguas(raiz, techo, W, D, 0.75)
        t.location = (0.35, alt + 0.05, 0.1); t.rotation_euler = (0.08, 0, -0.20)
        pieza('boquete', raiz, oscuro, (0.9, 0.8, 0.03), (-0.9, 1.1, -D / 2 - 0.02))
        pieza('ventana', raiz, oscuro, (0.54, 0.42, 0.03), (1.0, 1.4, -D / 2 - 0.02))
    else:
        # un faldon del techo CAIDO adentro, apoyado en la pared
        pieza('techo', raiz, techo, (2.4, 0.10, 2.0), (0.1, alt * 0.55, 0.1), (-0.2, 0, 0.3))
    pieza('puerta', raiz, oscuro, (0.6, min(0.95, alt), 0.03), (0, min(0.48, alt / 2), -D / 2 - 0.02))
    # LOS ESCOMBROS alrededor: tablas, chapas del techo
    for i in range(4 + n * 3):
        a = i * 2.399; r = 1.5 + (i % 3) * 0.45
        pieza('escombro', raiz, techo if i % 2 else tablas, (0.55, 0.22, 0.4), (math.cos(a) * r, 0.12, math.sin(a) * r * 0.8 - 0.2), (0, a, 0.15 * (i % 3)))
    TI.bolsas(raiz, Q, [(-1.3 + i * 0.6, 0.13, -1.45, 0) for i in range(5)])          # las bolsas siguen ahi
    tiznar(raiz, corte=0.55 - n * 0.04)
    return raiz

# ============================ LA CARPA CAIDA ============================
def restoTent(T, K):
    raiz = _raiz(T, 'resto carpa'); Q = quemado(K, 0.14)
    lona = M.mat_pintura(Q, 'lona', dict(arriba=['#6d6f4e', '#64664a'], corte=0.5, escala=1.5, panza='#5a5c42'))
    # la lona DESPLOMADA: la misma carpa aplastada sobre si misma, con pliegues
    import bmesh
    bm = bmesh.new(); secs = []
    for i in range(9):
        t = i / 8; z = -1.6 + 3.2 * t
        cumbre = 0.30 + 0.12 * math.sin(i * 2.1)
        secs.append([bm.verts.new(c) for c in ((-1.35, 0, z), (-0.9, 0.10 + 0.06 * (i % 2), z), (0.1 * math.sin(i), cumbre, z),
                                               (0.95, 0.08 + 0.05 * ((i + 1) % 2), z), (1.4, 0, z))])
    for a, b in zip(secs, secs[1:]):
        for k in range(4): bm.faces.new((a[k], a[k + 1], b[k + 1], b[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('lona'); bm.to_mesh(me); bm.free()
    M._obj('lona', me, raiz, lona)
    for x, y, z, rz, ry in ((-1.3, 0.08, 1.3, 1.35, 0.4), (1.15, 0.08, -1.05, 1.5, -0.7)):     # los parantes, tirados
        hueso('palo', raiz, Q['mat_cel']('palo', '#5b4630'), (x, y, z), (x + math.cos(ry) * 1.3, y, z + math.sin(ry) * 1.3), 0.03, 0.03, seg=6)
    elipsoide('huella', (0, 0.0, 0), (1.45, 0.04, 1.8), raiz, Q['mat_cel']('huella', '#5a5c42'), seg=16, anillos=4)
    tiznar(raiz, corte=0.6)
    return raiz

# ============================ EL HELICOPTERO ESTRELLADO ============================
def restoHelo(T, K):
    raiz = _raiz(T, 'resto helo'); Q = quemado(K, 0.22)
    crater(raiz, Q, 2.6)
    b = vacio(raiz, 'tumbado', (0.15, 0.95, -0.2), (-0.16, 0.2, 1.1))           # de costado, la cola cortada
    cuerpo = vacio(b, 'escala', (0, 0, 0), (0, 0, 0), escala=0.85)          # la escala del helo de siempre
    HE.seaKing(b, Q, '0', verde=True, roto=True)
    chapas(cuerpo, Q, 4, 0.35, '#52624f', 0, 0.4, 1.9)
    pala = Q['mat_cel']('pala', '#3d4740')
    for i in range(3):                                                           # las palas, dobladas
        a = 0.9 + i * 2 * math.pi / 3
        pieza('pala', cuerpo, pala, (0.17, 0.04, 2.9), (math.sin(a) * 1.45, 1.6, -0.6 + math.cos(a) * 1.45),
              ((0, 0.4, -0.3)[i], a, (0.5, -0.75, 0.28)[i]))
    # EL BOTALON con la deriva, tirado mas alla
    t = vacio(raiz, 'cola', (2.2, 0.3, 1.8), (0, 1.1, 0.25))
    piel = M.mat_pintura(Q, 'pintura_cola', dict(arriba=['#5b6d55'], panza='#46543f'))
    _subdiv(loft('botalon', [(-0.9, 0.30, 0.28, 0), (0.9, 0.18, 0.17, 0.15)], t, piel, n=14, expo=2.6, cerrar=(True, True)), 1)
    superficie('deriva', [(0.10, 0.75, 0.75, 0.12, 0.0), (1.10, 1.05, 0.42, 0.12, 0.0)], t, piel, eje='y')
    tiznar(raiz)
    return raiz

# ============================ EL CAZA ESTRELLADO ============================
def restoJet(T, K):
    raiz = _raiz(T, 'resto caza'); Q = quemado(K, 0.22)
    crater(raiz, Q, 3.0)
    f = vacio(raiz, 'fuselaje', (0, 0.85, 0.6), (-0.62, 0.2, 0.34))             # nariz abajo, clavado
    EN.caza(f, Q)
    for ob in f.children_recursive:                                             # el ala de babor, arrancada
        if ob.name.startswith('ala'):
            for md in list(ob.modifiers):
                if md.type == 'MIRROR': ob.modifiers.remove(md)
    w = vacio(raiz, 'ala_suelta', (-2.6, 0.45, 0.9), (0, -0.5, 1.15))
    superficie('ala', [(0.0, -0.25, 2.00, 0.07, 0), (0.45, 0.07, 1.77, 0.07, 0), (2.80, 1.75, 0.55, 0.09, 0)], w,
               M.mat_pintura(Q, 'ala_suelta', dict(arriba=['#6a7570'], panza='#9aa5a0')), eje='x')
    chapas(raiz, Q, 5, 1.2, '#59645f', 1.6, 0.1, -1.4)
    tiznar(raiz)
    return raiz

# ============================ LA BARCAZA HUNDIDA ============================
def restoLcu(T, K, n='0'):
    n = int(n)
    raiz = _raiz(T, 'resto barcaza'); Q = quemado(K, 0.18)
    b = vacio(raiz, 'escorada', (0, -0.35, 0) if n else (0, -0.25, 0), (-0.34, 0, 0.14) if n else (0, 0, 0.62))
    BU.lcu(b, Q)
    for ob in list(b.children_recursive):
        if ob.name.startswith('rampa'): ob.rotation_euler = (0.95, 0, 0); ob.location = (0, 0.75, -3.6)   # caida del todo
        if ob.name.startswith('borda') and pivotar(ob).location.x > 0: ob.rotation_euler = (0, 0, -0.5)   # rota
        if ob.name.startswith('timonera'): pivotar(ob).rotation_euler = (0, 0, -0.16)
    chapas(b, Q, 4, 0.9, '#7f8975', 0.3, 1.05, -1.2)
    tiznar(raiz)
    return raiz

# ============================ EL GLOBO DESINFLADO ============================
def restoBalloon(T, K):
    raiz = _raiz(T, 'resto globo'); Q = quemado(K, 0.1)
    plata = M.mat_pintura(Q, 'globo', dict(arriba=['#b3bec4'], panza='#8c979d'))
    # LA BOLSA SIN AIRE: la misma forma aplastada contra el piso, ARRUGADA (desplazamiento de ruido)
    bolsa = _subdiv(loft('bolsa', [(-2.05, 0.05, 0.03, 0.10), (-1.6, 0.90, 0.10, 0.12), (-0.4, 1.25, 0.16, 0.16),
                                   (0.8, 1.15, 0.14, 0.14), (1.9, 0.70, 0.10, 0.12), (2.4, 0.08, 0.03, 0.10)],
                         raiz, plata, n=20, expo=2.0, cerrar=(True, True)), 2)
    tx = bpy.data.textures.new('arrugas', 'CLOUDS'); tx.noise_scale = 0.35
    d = bolsa.modifiers.new('arrugas', 'DISPLACE'); d.texture = tx; d.strength = 0.12; d.direction = 'Y'
    bolsa.rotation_euler = (0, 0.25, 0)
    for i in range(3):                                                           # las aletas, dobladas al piso
        a = i * 2.4
        f = elipsoide('aleta', (0, 0, 0), (0.55, 0.08, 0.75), raiz, plata, seg=12, anillos=8)
        f.rotation_euler = (0.1 * i, a * 0.6, 0.08); f.location = (math.cos(a) * 1.0 + 0.4, 0.10, math.sin(a) * 0.7 + 1.9)
    cable = Q['mat_cel']('cable', '#7e8a90')
    for i in range(3):
        a = 0.6 + i * 0.9
        hueso('cable', raiz, cable, (-1.2 + i * 0.2, 0.04, -1.4 + i * 0.35), (-1.2 + i * 0.2 + math.cos(a) * 1.3, 0.04, -1.4 + i * 0.35 + math.sin(a) * 1.3), 0.025, 0.025, seg=4)
    tiznar(raiz, corte=0.68)
    return raiz
