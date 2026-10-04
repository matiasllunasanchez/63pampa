# LOS SOLDADOS Y LA EYECCION, HECHOS EN BLENDER (4/10/2026, fase 6 del horno). Reemplazan a
# tools/models/soldiers.js (la hoja de infanteria) y tools/models/eyeccion.js (el piloto eyectado, el
# asiento y la cupula), que pasaban por el puente tal cual.
#
# MISMOS ANGULOS Y MEDIDAS que esos rigs (el paso de la carrera, el cuerpo a tierra, el piloto sentado y
# colgado, la escala 1,4 del asiento, el arnes en el ORIGEN — es el ancla de la hoja), con forma: torso y
# cabeza redondos, miembros que se afinan, el casco con su ala, el chaleco salvavidas, el asiento
# biselado con sus rieles, y la CUPULA DE GAJOS de verdad (una media esfera cortada en husos que
# alternan color, abierta abajo) con las cuerdas al arnes.
#
# Los rigs de three encadenan rotaciones en GRUPOS (x primero, z adentro): aca se componen igual, con
# matrices en el orden de three (Rx · Rz), y cada miembro se dibuja de articulacion a articulacion.
import importlib.util, math, os
import bpy, bmesh
from mathutils import Matrix, Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
def _mod(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(AQUI, archivo))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m
M = _mod('modelos_bl_base_s', 'modelos.py')
TI = _mod('modelos_bl_tierra_s', 'modelos_tierra.py')
elipsoide, loft, _subdiv, mat_pintura, _obj = M.elipsoide, M.loft, M._subdiv, M.mat_pintura, M._obj
vacio, pieza, bloque, hueso = TI.vacio, TI.pieza, TI.bloque, TI.hueso

def R3(rx=0.0, rz=0.0):
    """La rotacion de un grupo de three con `rotation.x` y `rotation.z` (orden XYZ de three: Rx · Rz)."""
    return Matrix.Rotation(rx, 3, 'X') @ Matrix.Rotation(rz, 3, 'Z')

def miembro(padre, mat, origen, Rp, rx, rz, largo, r0, r1):
    """Un hueso del rig: cuelga hacia -y desde `origen`, girado por la rotacion acumulada del padre `Rp`
    y la suya. Devuelve el extremo y la rotacion acumulada (para encadenar el siguiente)."""
    R = Rp @ R3(rx, rz)
    fin = Vector(origen) + R @ Vector((0, -largo, 0))
    hueso('miembro', padre, mat, tuple(origen), tuple(fin), r0, r1, seg=8)
    return fin, R

# ============================ EL SOLDADO DE INFANTERIA ============================
# soldiers.js: mira hacia -x, la cadera a 1,02, el hombro a 1,60.
C = dict(U='#6d6f48', UL='#8d8f60', UD='#43452c', GEAR='#3c3e29', BOOT='#2a2c1f', HELM='#7f8256', SKIN='#b08a5e', GUN='#191c12')
Y_HOMBRO, Y_CADERA, MUSLO, PIERNA, BRAZO, ANTEBRAZO, ANCHO = 1.60, 1.02, 0.52, 0.48, 0.36, 0.32, 0.46

# EL CONSCRIPTO ARGENTINO (pedido del autor 4/10: "los soldados argentinos tienen cascos y son mas
# petisos"): verde oliva LISO (sin camuflaje), el casco M1 redondo con su ala, el FAL, y un 90 % de alto.
ARG = dict(U='#5b5f3d', UL='#6f7450', UD='#474a30', HELM='#4f5435')
ESC_ARG = 0.90

def _mats(K, bando='brit'):
    if bando == 'arg':
        m = {k: K['mat_cel']('arg_' + k, ARG.get(k, v)) for k, v in C.items()}
        return m
    m = {k: K['mat_cel']('sold_' + k, v) for k, v in C.items()}
    # EL DPM DE LA FOTO: manchones grandes MARRONES sobre verde caqui (el de 1982 es mucho mas marron
    # que verde); manchas grandes, que a 24 px se lean como camuflaje y no como ruido
    m['U'] = mat_pintura(K, 'dpm', dict(arriba=['#6f6b48', '#5a4630'], corte=0.52, escala=3.0, panza='#5a5539'))
    m['UL'] = m['U']
    return m

# LA BOINA, no el casco (pedido del autor 4/10: "se deben parecer a los ingleses, deben tener boinas"):
# la VERDE de los comandos de la Royal Marines y la BORDO de los paracaidistas (Goose Green), caida
# hacia un costado, con la banda de cuero y el escudo.
# Con la foto que paso el autor (dos Royal Marines en Malvinas): la boina de comando es un verde MUY
# oscuro, casi negro, grande y tirada sobre un costado.
BOINAS = {'verde': '#25311f', 'bordo': '#6e2630'}

def boina(padre, K, color, x, y, z=0.0):
    b = elipsoide('boina', (0, 0, 0), (0.17, 0.06, 0.16), padre, K['mat_cel']('boina_' + color, BOINAS[color]), seg=14, anillos=8)
    b.rotation_euler = (0.55, 0, 0.25); b.location = (x + 0.02, y - 0.01, z + 0.05)
    elipsoide('banda', (x - 0.01, y - 0.035, z), (0.115, 0.022, 0.105), padre, K['mat_cel']('banda', '#2a2118'), seg=12, anillos=4)
    elipsoide('escudo', (x - 0.10, y - 0.01, z - 0.03), (0.02, 0.025, 0.02), padre, K['mat_cel']('escudo', '#c9b98a'), seg=6, anillos=4)

def casco_m1(padre, m, x, y, z=0.0):
    """El casco M1 del conscripto: la cupula redonda que baja sobre las orejas y el ala corta. Le
    queda GRANDE: son pibes de 18 años (la clase 63), y el casco es del talle de un adulto."""
    elipsoide('casco', (x, y, z), (0.18, 0.14, 0.18), padre, m['HELM'], seg=14, anillos=8)
    elipsoide('ala', (x, y - 0.065, z), (0.195, 0.025, 0.195), padre, m['HELM'], seg=14, anillos=4)

def _cabeza(padre, m, y, x=0.0, K=None, color='verde'):
    elipsoide('cuello', (x - 0.01, y + 0.09, 0), (0.06, 0.06, 0.07), padre, m['SKIN'], seg=8, anillos=6)
    elipsoide('cabeza', (x - 0.02, y + 0.23, 0), (0.11, 0.12, 0.10), padre, m['SKIN'], seg=12, anillos=8)
    if color == 'casco': casco_m1(padre, m, x - 0.01, y + 0.30)
    else: boina(padre, K, color, x - 0.01, y + 0.33)

def soldado_corre(T, K, paso='0', bergen='0', bando='brit'):
    p, bergen = int(paso) / 6, bergen == '1'
    g = vacio(T, 'soldado', escala=ESC_ARG if bando == 'arg' else 1.0); m = _mats(K, bando)
    s, c = math.sin(p * 2 * math.pi), math.cos(p * 2 * math.pi)
    yc = Y_HOMBRO - Y_CADERA
    # EL CONSCRIPTO ES UN PIBE DE 18 AÑOS (el autor, 4/10): flaco y desgarbado — torso angosto,
    # brazos y piernas finos, la mochila chica. El casco le queda grande (ver casco_m1).
    f = 0.78 if bando == 'arg' else 1.0
    tr = vacio(g, 'tronco', (0, Y_CADERA, 0), (0, 0, 0.16))                    # inclinado hacia adelante
    elipsoide('torso', (0.0, yc / 2 - 0.02, 0), (0.17 * f, yc / 2 + 0.10, ANCHO / 2 * f), tr, m['U'], seg=14, anillos=10)
    elipsoide('cinto', (0.0, yc - 0.30, 0), (0.18 * f, 0.05, (ANCHO / 2 + 0.01) * f), tr, m['GEAR'], seg=12, anillos=6)
    if bando != 'arg':                       # la BUFANDA oscura al cuello (la de la foto)
        elipsoide('bufanda', (-0.02, yc + 0.04, 0), (0.12, 0.06, 0.13), tr, K['mat_cel']('bufanda', '#2e2b22'), seg=12, anillos=6)
    if bergen: bloque('bergen', tr, m['GEAR'], (0.26, yc - 0.20, 0), (0.28, 0.64, ANCHO * 0.84), bisel=0.06)
    else: bloque('mochila', tr, m['GEAR'], (0.21 * f, yc - 0.16, 0), (0.17 * f, 0.32 * f, ANCHO * 0.74 * f), bisel=0.04)
    _cabeza(tr, m, yc, K=K, color='casco' if bando == 'arg' else 'bordo' if bergen else 'verde')
    for lado in (-1, 1):                                                       # los brazos, braceando
        zH = lado * ANCHO * 0.42
        tono = m['UL'] if lado < 0 else m['U']
        codo, R = miembro(tr, tono, (0, yc - 0.02, zH * f), Matrix.Identity(3), 0, s * 0.5 * lado + 0.15, BRAZO, 0.065 * f, 0.055 * f)
        miembro(tr, tono, codo, R, 0, -0.85, ANTEBRAZO, 0.055 * f, 0.045 * f)
    # el FUSIL cruzado al pecho
    d = Vector((-math.sin(0.55), math.cos(0.55), 0)) * 0.31
    o = Vector((-0.18, yc - 0.26, -ANCHO * 0.30))
    hueso('fusil', tr, m['GUN'], tuple(o - d), tuple(o + d), 0.035, 0.03, seg=6)
    for lado in (-1, 1):                                                       # las piernas, el paso
        a = -s * 0.62 * lado
        flex = 0.15 + 0.9 * max(0.0, c * lado)
        rod, R = miembro(g, m['UD'], (0, Y_CADERA, lado * ANCHO * 0.24 * f), Matrix.Identity(3), 0, a, MUSLO, 0.085 * f, 0.07 * f)
        # LA RODILLA SE DOBLA HACIA ATRAS (+x, el soldado mira a -x). Con -flex se doblaba para adelante
        # y el autor lo vio enseguida: "tiene las rodillas torcidas al reves"
        pie, R2 = miembro(g, m['UD'], rod, R, 0, flex, PIERNA, 0.07 * f, 0.055 * f)
        b = pieza('bota', g, m['BOOT'], (0.21, 0.10, 0.13), tuple(pie + Vector((-0.04, -0.02, 0))))
        b.rotation_euler = (0, 0, math.atan2(R2[1][0], R2[0][0]))
    return g

def soldado_tierra(T, K, bergen='0', bando='brit'):
    """CUERPO A TIERRA: tendido boca abajo, la cabeza adelante (-x), el fusil apoyado."""
    bergen = bergen == '1'
    g = vacio(T, 'tendido', escala=ESC_ARG if bando == 'arg' else 1.0); m = _mats(K, bando)
    LARGO, Y = 1.72, 0.16
    elipsoide('cuerpo', (0.05, Y, 0), (LARGO / 2 - 0.05, 0.12, ANCHO / 2), g, m['U'], seg=16, anillos=10)
    for lado in (-1, 1):
        hueso('pierna', g, m['UD'], (0.25, Y, lado * 0.11), (LARGO / 2 + 0.02, Y - 0.04, lado * 0.15), 0.085, 0.065)
    pieza('botas', g, m['BOOT'], (0.24, 0.14, ANCHO * 0.94), (LARGO / 2 + 0.06, Y - 0.02, 0))
    bloque('mochila', g, m['GEAR'], (0.16, Y + 0.17, 0), (0.52 if bergen else 0.34, 0.19, ANCHO * 0.8), bisel=0.04)
    elipsoide('cabeza', (-LARGO / 2 + 0.06, Y + 0.17, 0), (0.11, 0.10, 0.10), g, m['SKIN'], seg=12, anillos=8)
    if bando == 'arg': casco_m1(g, m, -LARGO / 2 + 0.03, Y + 0.24)
    else: boina(g, K, 'bordo' if bergen else 'verde', -LARGO / 2 + 0.03, Y + 0.27)
    hueso('fusil', g, m['GUN'], (-LARGO / 2 - 0.15, Y + 0.06, -ANCHO * 0.3), (-LARGO / 2 + 0.35, Y + 0.06, -ANCHO * 0.3), 0.03, 0.03, seg=6)
    return g

# ============================ LA EYECCION ============================
# eyeccion.js: el piloto argentino (traje oliva, chaleco salvavidas ambar, casco blanco) y el britanico;
# el asiento Martin-Baker; la cupula de gajos (naranja y blanco el argentino). EL ARNES EN EL ORIGEN.
PIEL = {
    'arg': dict(traje='#5e6746', traje2='#737c58', chaleco='#b98d3e', casco='#e6e4dc', bota='#1f211c', gajo=('#d9652b', '#ece6d6')),
    'brit': dict(traje='#667064', traje2='#7a8577', chaleco='#3d4838', casco='#9ea39a', bota='#1f211c', gajo=('#6c7354', '#cfc6a6')),
}
ASIENTO, ASIENTO2, MANIJA, CINCHA, CUERDA = '#2d312f', '#3f4441', '#e0c024', '#2a2c26', '#d8d2c2'
ESC = 1.4

def piloto(g, K, c, sentado):
    m = {k: K['mat_cel']('pil_' + k, v) for k, v in c.items() if k != 'gajo'}
    cincha = K['mat_cel']('cincha', CINCHA)
    elipsoide('torso', (0, 0.28, 0), (0.23, 0.33, 0.15), g, m['traje'], seg=14, anillos=10)
    # EL CHALECO SALVAVIDAS: el bulto inflable alrededor del pecho
    _subdiv(loft('chaleco', [(-0.17, 0.20, 0.12, 0.44), (0.0, 0.25, 0.16, 0.44), (0.17, 0.20, 0.12, 0.44)], g, m['chaleco'], n=12, cerrar=(True, True)), 1).rotation_euler = (0, math.pi / 2, 0)
    for sx in (-1, 1): pieza('cincha', g, cincha, (0.06, 0.62, 0.32), (sx * 0.12, 0.28, -0.01))
    pieza('cinturon', g, cincha, (0.48, 0.09, 0.32), (0, 0.0, 0))
    # EL CASCO con el visor bajo y la mascara de oxigeno
    elipsoide('casco', (0, 0.80, 0), (0.17, 0.19, 0.18), g, m['casco'], seg=16, anillos=10)
    pieza('visor', g, K['mat_cel']('visor', '#1d2326'), (0.24, 0.08, 0.05), (0, 0.80, -0.165))
    elipsoide('mascara', (0, 0.68, -0.15), (0.06, 0.06, 0.05), g, K['mat_cel']('mascara', '#4a4f4c'), seg=10, anillos=6)
    hueso('manguera', g, K['mat_cel']('mascara', '#4a4f4c'), (0, 0.64, -0.17), (0.12, 0.45, -0.17), 0.025, 0.025, seg=5)
    I = Matrix.Identity(3)
    for sx in (-1, 1):
        if sentado:
            rod, R = miembro(g, m['traje2'], (sx * 0.12, -0.02, 0), I, math.pi / 2 - 0.1, 0, 0.44, 0.08, 0.07)
            pie, R2 = miembro(g, m['traje2'], rod, R, -math.pi / 2 + 0.2, 0, 0.42, 0.07, 0.06)
            codo, R = miembro(g, m['traje'], (sx * 0.27, 0.54, 0), I, 0.5, sx * 0.25, 0.30, 0.065, 0.055)
            miembro(g, m['traje'], codo, R, 0.9, 0, 0.28, 0.055, 0.05)
        else:
            rod, R = miembro(g, m['traje2'], (sx * 0.12, -0.02, 0), I, 0.55, sx * 0.1, 0.36, 0.09, 0.08)
            pie, R2 = miembro(g, m['traje2'], rod, R, -0.85, 0, 0.33, 0.08, 0.07)
            codo, R = miembro(g, m['traje'], (sx * 0.27, 0.54, 0), I, math.pi - 0.15, -sx * 0.35, 0.30, 0.065, 0.055)
            miembro(g, m['traje'], codo, R, 0.2, 0, 0.28, 0.055, 0.05)
        pieza('bota', g, m['bota'], (0.13, 0.11, 0.22), tuple(pie + Vector((0, -0.02, -0.05))))

def silla(g, K):
    """EL MARTIN-BAKER: respaldo, cabezal (adentro va el paracaidas), cubeta, los dos rieles y la
    MANIJA DE LA CORTINA arriba, amarilla y negra — que es lo que se ve."""
    a, a2 = K['mat_cel']('asiento', ASIENTO), K['mat_cel']('asiento2', ASIENTO2)
    bloque('respaldo', g, a, (0, 0.5, 0.22), (0.6, 1.2, 0.12), bisel=0.03)
    bloque('cabezal', g, a2, (0, 1.18, 0.14), (0.56, 0.4, 0.3), bisel=0.05)
    bloque('cubeta', g, a, (0, -0.1, -0.05), (0.62, 0.12, 0.6), bisel=0.03)
    for sx in (-1, 1): bloque('riel', g, a2, (sx * 0.33, 0.52, 0.2), (0.06, 1.35, 0.1), bisel=0.015)
    hueso('manija', g, K['mat_cel']('manija', MANIJA), (-0.15, 1.42, 0.02), (0.15, 1.42, 0.02), 0.035, 0.035, seg=8)
    for sx in (-1, 1): pieza('franja', g, K['mat_cel']('negro', '#141414'), (0.08, 0.075, 0.075), (sx * 0.08, 1.42, 0.02))

def asiento(T, K, bando='arg'):
    g = vacio(T, 'asiento', escala=ESC)
    piloto(g, K, PIEL[bando], True)
    silla(g, K)
    return g

def asientoSolo(T, K):
    g = vacio(T, 'asiento solo', escala=ESC)
    silla(g, K)
    bloque('almohadon', g, K['mat_cel']('almohadon', '#4a4f3a'), (0, -0.01, -0.05), (0.5, 0.08, 0.46), bisel=0.02)
    for sx in (-1, 1): pieza('cincha_suelta', g, K['mat_cel']('cincha', CINCHA), (0.06, 0.5, 0.05), (sx * 0.14, 0.3, 0.14))
    return g

def cupula(T, K, bando='arg'):
    """ACTO 2: bajo la cupula. Media esfera cortada en 14 GAJOS que alternan color, achatada, abierta
    abajo (se le ve el adentro), la chimenea del tope, las cuerdas al arnes y el bolso colgando."""
    c = PIEL[bando]
    g = vacio(T, 'cupula')
    pg = vacio(g, 'piloto', escala=ESC)
    piloto(pg, K, c, False)
    R, Y, TH, SY, N = 2.3, 3.9, math.pi * 0.42, 0.62, 14
    bm = bmesh.new()
    filas, cols = 7, N * 3
    vs = [[bm.verts.new((R * math.sin(TH * i / filas) * math.cos(2 * math.pi * j / cols), Y + R * math.cos(TH * i / filas) * SY,
                         R * math.sin(TH * i / filas) * math.sin(2 * math.pi * j / cols))) for j in range(cols)] for i in range(filas + 1)]
    for i in range(filas):
        for j in range(cols):
            f = bm.faces.new((vs[i][j], vs[i][(j + 1) % cols], vs[i + 1][(j + 1) % cols], vs[i + 1][j]))
            f.material_index = (j // 3) % 2                                   # el GAJO: 3 columnas por huso
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('cupula'); bm.to_mesh(me); bm.free(); me.shade_smooth()
    me.materials.append(K['mat_cel']('gajo0', c['gajo'][0])); me.materials.append(K['mat_cel']('gajo1', c['gajo'][1]))
    ob = bpy.data.objects.new('cupula', me); bpy.context.scene.collection.objects.link(ob); ob.parent = g
    # el BORDE de la cupula, apenas recogido hacia adentro (se lee la boca abierta)
    yb, rb = Y + R * math.cos(TH) * SY, R * math.sin(TH)
    elipsoide('chimenea', (0, Y + R * SY - 0.02, 0), (0.32, 0.15, 0.32), g, K['mat_cel']('gajo0', c['gajo'][0]), seg=12, anillos=6)
    cuerda = K['mat_cel']('cuerda', CUERDA)
    for i in range(8):
        a = i * 2 * math.pi / 8 + 0.2
        hueso('cuerda', g, cuerda, (math.cos(a) * rb, yb, math.sin(a) * rb), ((1 if math.cos(a) > 0 else -1) * 0.22 * ESC, 0.62 * ESC, 0), 0.012, 0.012, seg=4)
    YK = -2.5
    hueso('cuerda', g, cuerda, (0.1 * ESC, -0.02 * ESC, 0), (0, YK + 0.15, 0), 0.012, 0.012, seg=4)
    bloque('bolso', g, K['mat_cel']('bolso', '#4f5638'), (0, YK, 0), (0.5, 0.3, 0.36), bisel=0.04)
    pieza('franja_bolso', g, K['mat_cel']('franja_bolso', '#d8b62a'), (0.52, 0.08, 0.38), (0, YK + 0.12, 0))
    return g
