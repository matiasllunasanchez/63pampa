# LO DE TIERRA, HECHO EN BLENDER (4/10/2026). Reemplaza a los modelos de tools/models/enemies.js que
# pasaban por el puente tal cual (cajas y cilindros): el Rapier y su nido, el equipo de misil al hombro,
# el camion AA, el radar, el globo de barrera, la carpa, el deposito y el puesto.
#
# LO QUE CAMBIA: el Rapier con su tambor, el radar de vigilancia con tapa, los cuatro misiles (punta
# blanca, dos anillos amarillos, aletas en cruz) y el plato del seguidor; camiones de verdad (cabina
# con parabrisas inclinado, cubiertas con llanta, guardabarros, paragolpes); parapetos de BOLSAS una por
# una; la carpa a dos aguas con la cumbrera vencida y los vientos; el galpon Nissen de chapa ondulada;
# la casa de las islas (tablas, techo de chapa a dos aguas, chimenea); el globo con sus tres aletas
# infladas; y los SOLDADOS arrodillados con miembros de verdad y camuflaje DPM.
#
# LO QUE NO CAMBIA: el tamaño de cada cosa y DONDE va cada pieza son los de enemies.js (la hoja sale
# del mismo tamaño), y las poses (el yaw del lanzador, del plato, del equipo) son las mismas. Espacio de
# three: y arriba, el frente hacia -z, apoyado en y = 0.
import importlib.util, math, os
import bpy, bmesh
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
def _mod(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(AQUI, archivo))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m
M = _mod('modelos_bl_base_t', 'modelos.py')
B = _mod('modelos_bl_buques_t', 'modelos_buques.py')
loft, elipsoide, caja, _subdiv, mat_pintura, _obj = M.loft, M.elipsoide, M.caja, M._subdiv, M.mat_pintura, M._obj
columna, bloque, pieza, poste = B.columna, B.bloque, B.pieza, B.poste

VIDRIO = '#9fb6bd'
GOMA, LLANTA = '#191d18', '#3c423a'

def vacio(padre, nombre='grupo', lugar=(0, 0, 0), giro=(0, 0, 0), escala=1.0):
    e = bpy.data.objects.new(nombre, None)
    bpy.context.scene.collection.objects.link(e)
    e.parent = padre; e.location = lugar; e.rotation_euler = giro; e.scale = (escala,) * 3
    return e

def _raiz(T, nombre):
    return vacio(T, nombre)

def hueso(nombre, padre, mat, p0, p1, r0, r1, seg=8):
    """Un miembro (o un caño) de `p0` a `p1`, afinandose de `r0` a `r1`."""
    v = Vector(p1) - Vector(p0); largo = v.length
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r0, radius2=r1, depth=largo)
    for vv in bm.verts: vv.co.z += largo / 2
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    me.shade_smooth()
    ob = _obj(nombre, me, padre, mat)
    ob.location = p0
    ob.rotation_mode = 'QUATERNION'; ob.rotation_quaternion = v.to_track_quat('Z', 'Y')
    return ob

def rueda(padre, K, x, y, z, r, ancho):
    """Cubierta con la banda de rodamiento y la llanta clara: de costado se lee como rueda."""
    elipsoide('cubierta', (x, y, z), (ancho / 2, r, r), padre, K['mat_cel']('goma', GOMA), seg=18, anillos=10)
    sg = 1 if x >= 0 else -1
    elipsoide('llanta', (x + sg * ancho * 0.32, y, z), (ancho * 0.22, r * 0.52, r * 0.52), padre, K['mat_cel']('llanta', LLANTA), seg=12, anillos=6)

def bolsas(padre, K, puntos, colores=('#8a7c58', '#a4956e', '#7b6e4d')):
    """BOLSAS DE ARENA, una por una: almohadones achatados, en hilera y apilados."""
    mats = [K['mat_cel']('bolsa%d' % i, c) for i, c in enumerate(colores)]
    for i, (x, y, z, a) in enumerate(puntos):
        b = elipsoide('bolsa', (0, 0, 0), (0.30, 0.13, 0.19), padre, mats[i % len(mats)], seg=10, anillos=6)
        b.rotation_euler = (0, a, 0); b.location = (x, y, z)

def arco_bolsas(padre, K, r, a0, a1, n, filas=2, cx=0, cz=0):
    pts = []
    for f in range(filas):
        for i in range(n - f):
            a = a0 + (a1 - a0) * (i + 0.5 * (f + 1)) / n
            pts.append((cx + math.cos(a) * r, 0.12 + f * 0.24, cz + math.sin(a) * r, -a + math.pi / 2))
    bolsas(padre, K, pts)

# ============================ EL SOLDADO ARRODILLADO ============================
# El de `rodilla` de tools/models/soldiers.js (mismas medidas, mismos angulos), con forma: torso y
# cabeza redondos, el casco con su ala, brazos y piernas que se afinan, y el uniforme DPM manchado.
# Mira hacia -x en su espacio, como el rig de three; `ry` lo gira.
YC, YH = 0.62, 0.56            # la cadera (arrodillado) y del hombro a la cadera
def soldado(padre, K, x, z, ry, arma='prismaticos', y=0.0):
    s = vacio(padre, 'soldado', (x, y, z), (0, ry, 0))
    dpm = mat_pintura(K, 'dpm', dict(arriba=['#6d6f48', '#4c4f31'], corte=0.48, escala=7.0, panza='#585a3b'))
    oscuro = K['mat_cel']('pantalon', '#4a4c30')
    piel, casco_m, equipo = K['mat_cel']('piel', '#b08a5e'), K['mat_cel']('casco', '#7f8256'), K['mat_cel']('equipo', '#3c3e29')
    elipsoide('torso', (0.02, YC + 0.30, 0), (0.16, 0.33, 0.23), s, dpm, seg=14, anillos=10)
    elipsoide('cinto', (0.02, YC + 0.12, 0), (0.17, 0.05, 0.24), s, equipo, seg=12, anillos=6)
    pieza('mochila', s, equipo, (0.16, 0.30, 0.32), (0.19, YC + 0.40, 0))
    elipsoide('cuello', (-0.01, YC + YH + 0.07, 0), (0.06, 0.06, 0.06), s, piel, seg=8, anillos=6)
    elipsoide('cabeza', (-0.02, YC + YH + 0.20, 0), (0.105, 0.115, 0.10), s, piel, seg=12, anillos=8)
    # LA BOINA verde de los comandos (pedido del autor 4/10: boinas, no cascos)
    b = elipsoide('boina', (0, 0, 0), (0.15, 0.055, 0.14), s, K['mat_cel']('boina_verde', '#3f5a36'), seg=14, anillos=8)
    b.rotation_euler = (0.45, 0, 0.25); b.location = (0.01, YC + YH + 0.32, 0.04)
    elipsoide('banda', (-0.02, YC + YH + 0.285, 0), (0.115, 0.022, 0.105), s, K['mat_cel']('banda', '#2a2118'), seg=12, anillos=4)
    # las PIERNAS: la de aca con la rodilla al piso, la de alla con el pie adelante (rodilla() de three)
    for zz, rod, pie in ((-0.11, (0.18, 0.13), (0.66, 0.15)), (0.11, (-0.51, 0.51), (-0.48, 0.03))):
        hueso('muslo', s, oscuro, (0, YC, zz), (rod[0], rod[1], zz), 0.085, 0.07)
        hueso('pierna', s, oscuro, (rod[0], rod[1], zz), (pie[0], pie[1], zz), 0.07, 0.055)
        pieza('bota', s, K['mat_cel']('bota', '#2a2c1f'), (0.20, 0.10, 0.13), (pie[0] - 0.05, max(0.05, pie[1]), zz))
    hombro = YC + YH - 0.02
    if arma == 'tubo':
        # EL BLOWPIPE al hombro de alla, apuntando 34° arriba hacia adelante, con la caja de punteria
        t = vacio(s, 'tubo', (0.02, YC + YH + 0.08, 0.16), (0, 0, -0.6))
        tubo = K['mat_cel']('tubo', '#23271c')
        hueso('tubo', t, tubo, (0.74, 0, 0), (-0.72, 0, 0), 0.085, 0.085, seg=10)
        hueso('boca', t, K['mat_cel']('boca', '#1a1d15'), (0.80, 0, 0), (0.68, 0, 0), 0.11, 0.09, seg=10)
        pieza('punteria', t, K['mat_cel']('punteria', '#3a3f30'), (0.34, 0.24, 0.2), (-0.42, -0.14, 0))
        for zz, codo, mano in ((-0.10, (-0.28, 0.96), (-0.57, 1.09)), (0.10, (-0.32, 1.02), (-0.62, 1.12))):
            hueso('brazo', s, dpm, (0, hombro, zz), (codo[0], codo[1], zz), 0.065, 0.055)
            hueso('antebrazo', s, dpm, (codo[0], codo[1], zz), (mano[0], mano[1], zz * 0.6), 0.055, 0.045)
    else:
        # PRISMATICOS: los codos arriba y las manos a la cara
        for zz in (-0.10, 0.10):
            hueso('brazo', s, dpm, (0, hombro, zz), (-0.34, hombro + 0.10, zz * 1.3), 0.065, 0.055)
            hueso('antebrazo', s, dpm, (-0.34, hombro + 0.10, zz * 1.3), (-0.20, YC + YH + 0.18, zz * 0.5), 0.055, 0.045)
        pieza('prismaticos', s, K['mat_cel']('prismaticos', '#191c12'), (0.14, 0.09, 0.22), (-0.20, YC + YH + 0.21, 0))
    return s

# ============================ EL RAPIER ============================
# `rapier(padre, K, elev, quemado)`: el lanzador con la base en y = 0 y los misiles hacia -z. Lo usan el
# nido y el camion (y, quemado, sus restos).
RAPIER_C = dict(tambor='#5b6253', tambor2='#6d7464', tapa='#4b5145', misil='#5d6a45', punta='#e4e2d6',
                anillo='#d9b93a', brazo='#3d423b', plato='#7c847a')
def rapier(padre, K, elev, c=None):
    c = c or RAPIER_C
    m = {k: K['mat_cel']('rapier_' + k, v) for k, v in c.items()}
    columna('tambor', padre, m['tambor'], 0, 0, [(0.0, 0.84, 0.84), (1.25, 0.80, 0.80), (1.7, 0.78, 0.78)], expo=2.0)
    columna('aro', padre, m['tambor2'], 0, 0, [(1.24, 0.87, 0.87), (1.36, 0.87, 0.87)], expo=2.0)
    columna('radar', padre, m['tambor2'], 0, 0.05, [(1.7, 0.62, 0.62), (2.44, 0.58, 0.58)], expo=2.0)
    columna('tapa', padre, m['tapa'], 0, 0.05, [(2.44, 0.66, 0.66), (2.56, 0.62, 0.62)], expo=2.0)
    bloque('afuste', padre, m['tapa'], (0, 1.0, -0.55), (1.1, 0.55, 0.9), bisel=0.06)
    for sg in (-1, 1):
        bloque('brazo', padre, m['brazo'], (sg * 0.95, 1.15, -0.2), (0.5, 0.18, 0.3), bisel=0.03)
        for dy, dx in ((0, 0), (0.42, 0.12)):
            e = vacio(padre, 'misil', (sg * (1.12 + dx), 1.0 + dy, -0.2), (elev, 0, 0))
            loft('misil', [(0.70, 0.02, 0.02, 0), (0.62, 0.15, 0.15, 0), (-1.75, 0.17, 0.17, 0)], e, m['misil'], n=10, cerrar=(True, True))
            _subdiv(loft('punta', [(-1.75, 0.17, 0.17, 0), (-2.05, 0.12, 0.12, 0), (-2.27, 0.02, 0.02, 0)], e, m['punta'], n=10, cerrar=(False, True)), 1)
            for zr in (-1.35, -1.08):
                loft('anillo', [(zr + 0.06, 0.185, 0.185, 0), (zr - 0.06, 0.185, 0.185, 0)], e, m['anillo'], n=10, cerrar=(True, True))
            pieza('aleta', e, m['misil'], (0.55, 0.035, 0.28), (0, 0, 0.52))
            pieza('aleta', e, m['misil'], (0.035, 0.55, 0.28), (0, 0, 0.52))
            pieza('riel', e, m['brazo'], (0.1, 0.1, 1.9), (0, -0.19, -0.35))
    # el plato del seguidor, a un costado y atras
    pieza('pie_plato', padre, m['brazo'], (0.12, 0.7, 0.12), (-0.95, 1.55, 0.45))
    pl = vacio(padre, 'plato', (-1.15, 1.95, 0.35), (-0.3, 0, math.pi / 2 - 0.35))
    columna('plato', pl, m['plato'], 0, 0, [(-0.10, 0.20, 0.20), (0.10, 0.56, 0.56)], expo=2.0)

# ============================ EL NIDO DEL RAPIER ============================
def nido_rapier(T, K, ang='0.55'):
    raiz = _raiz(T, 'Rapier')
    arco_bolsas(raiz, K, 2.1, math.pi * 0.12, math.pi * 0.88, 9)        # el parapeto: media luna atras
    tur = vacio(raiz, 'lanzador', (0, 0.25, 0), (0, float(ang), 0))
    metal = K['mat_cel']('metal', '#3d423b')
    for i in range(4):                                               # las patas niveladoras con su pie
        a = math.pi / 4 + i * math.pi / 2
        pieza('pata', tur, metal, (1.3, 0.12, 0.16), (math.cos(a) * 0.95, -0.12, math.sin(a) * 0.95), (0, -a, 0))
        elipsoide('pie', (math.cos(a) * 1.55, -0.20, math.sin(a) * 1.55), (0.16, 0.05, 0.16), tur, metal, seg=10, anillos=4)
    rapier(tur, K, 0.9)
    soldado(raiz, K, -1.55, 0.9, -math.pi / 2 - 0.5)
    soldado(raiz, K, 1.7, -0.9, -math.pi / 2 + 0.6)
    return raiz

# ============================ EL EQUIPO DE MISIL AL HOMBRO ============================
def manpad(T, K, ang='0.7'):
    raiz = _raiz(T, 'Blowpipe')
    # el borde del POZO: tierra levantada con la red de camuflaje encima, en montones irregulares
    red = [K['mat_cel']('red%d' % i, c) for i, c in enumerate(('#5b5e3e', '#4a4d33', '#6a6c48', '#3f4230'))]
    for i in range(14):
        a = i * 2 * math.pi / 14 + 0.3
        rr = 1.22 + 0.06 * math.sin(i * 2.7)
        b = elipsoide('borde', (0, 0, 0), (0.38, 0.17 + 0.05 * ((i * 5) % 3), 0.26), raiz, red[i % 4], seg=10, anillos=6)
        b.rotation_euler = (0, -a + math.pi / 2, 0); b.location = (math.cos(a) * rr, 0.10, math.sin(a) * rr * 0.98)
    elipsoide('fondo', (0, 0.0, 0), (1.15, 0.03, 1.1), raiz, K['mat_cel']('fondo', '#3a3527'), seg=18, anillos=4)
    eq = vacio(raiz, 'equipo', (0, -0.1, 0), (0, float(ang), 0))
    soldado(eq, K, 0.25, -0.1, -math.pi / 2 + 0.25, 'tubo')
    soldado(eq, K, -0.55, 0.45, -math.pi / 2 - 0.2)
    return raiz

# ============================ LOS CAMIONES ============================
def camion(raiz, K, verde, verde2, cabina, ejes, largo_caja=4.6, z_caja=0.2):
    """El chasis de los camiones militares: largueros, la CABINA con el parabrisas inclinado, las
    puertas y el techo, el paragolpes y los guardabarros, las cubiertas con llanta. Devuelve la altura
    del piso de la caja."""
    mv, mv2, mc = K['mat_cel']('verde', verde), K['mat_cel']('verde2', verde2), K['mat_cel']('cabina', cabina)
    oscuro = K['mat_cel']('chasis', '#2c3027')
    R, Y = 0.52, 0.52
    for sg in (-1, 1):
        pieza('larguero', raiz, oscuro, (0.14, 0.22, 6.0), (sg * 0.55, Y + 0.10, -0.2))
    for z in ejes:
        pieza('eje', raiz, oscuro, (2.0, 0.12, 0.12), (0, Y, z))
        for sg in (-1, 1):
            rueda(raiz, K, sg * 1.08, R, z, R, 0.38)
            bloque('guardabarros', raiz, mv2, (sg * 1.08, R * 2 + 0.06, z), (0.46, 0.06, 1.15), bisel=0.02)
    # LA CABINA DEL BEDFORD MK (15/10, "mas fieles"): el camion de 4 t del ejercito britanico en Malvinas
    # es de CABINA AVANZADA — sin capot: el frente PLANO y alto sobre el motor, el parabrisas partido en
    # dos con el parante al medio, la parrilla oscura abajo y los faros en el paragolpes
    zc = -2.45
    bloque('cabina', raiz, mc, (0, Y + 1.10, zc), (2.35, 1.60, 1.50), bisel=0.07)
    bloque('techo', raiz, mv2, (0, Y + 1.93, zc + 0.05), (2.25, 0.07, 1.40), bisel=0.02)
    vid = K['mat_cel']('vidrio', VIDRIO)
    for sg in (-1, 1):
        pieza('parabrisas', raiz, vid, (1.00, 0.58, 0.03), (sg * 0.55, Y + 1.50, zc - 0.76), (-0.06, 0, 0))
        pieza('ventanilla', raiz, vid, (0.02, 0.50, 0.70), (sg * 1.18, Y + 1.48, zc + 0.10))
        pieza('puerta', raiz, oscuro, (0.02, 0.02, 0.80), (sg * 1.185, Y + 0.95, zc + 0.10))
        elipsoide('faro', (sg * 0.85, Y + 0.35, zc - 0.82), (0.11, 0.11, 0.04), raiz, K['mat_cel']('faro', '#c9c2a0'), seg=10, anillos=6)
        pieza('escalon', raiz, oscuro, (0.30, 0.05, 0.40), (sg * 1.05, Y + 0.30, zc + 0.10))
    pieza('parante', raiz, mc, (0.08, 0.60, 0.04), (0, Y + 1.50, zc - 0.77))
    pieza('parrilla', raiz, K['mat_cel']('parrilla', '#23261f'), (1.50, 0.45, 0.03), (0, Y + 0.80, zc - 0.76))
    bloque('paragolpes', raiz, oscuro, (0, Y + 0.30, zc - 0.85), (2.4, 0.22, 0.16), bisel=0.02)
    # la CAJA: el piso y las barandas rebatibles
    piso = Y + 0.55
    bloque('piso', raiz, mv, (0, piso - 0.06, z_caja), (2.5, 0.14, largo_caja), bisel=0.02)
    return piso, mv, mv2

def camion_aa(T, K, ang='0'):
    raiz = _raiz(T, 'Camion AA')
    piso, mv, mv2 = camion(raiz, K, '#575b48', '#696d58', '#43473a', (-1.8, 1.2, 2.2), largo_caja=4.0, z_caja=0.6)
    for sg in (-1, 1):
        bloque('baranda', raiz, mv2, (sg * 1.22, piso + 0.22, 0.6), (0.08, 0.42, 4.0), bisel=0.02)
    bloque('baranda', raiz, mv2, (0, piso + 0.22, 2.58), (2.5, 0.42, 0.08), bisel=0.02)
    tur = vacio(raiz, 'lanzador', (0, piso, 1.0), (0, float(ang), 0), escala=0.8)
    rapier(tur, K, 0.8)
    return raiz

def radar(T, K, ang='0'):
    raiz = _raiz(T, 'Radar')
    piso, mv, mv2 = camion(raiz, K, '#5d6152', '#6f7362', '#4a4e42', (-1.6, 1.5), largo_caja=4.2, z_caja=0.3)
    # EL SHELTER: la caja de los equipos, con la puerta, la escalerita y las rejillas
    bloque('shelter', raiz, mv, (0, piso + 0.55, 0.3), (2.4, 1.10, 4.0), bisel=0.06)
    bloque('techo_shelter', raiz, mv2, (0, piso + 1.12, 0.3), (2.3, 0.06, 3.9), bisel=0.02)
    oscuro = K['mat_cel']('puerta', '#2f3329')
    pieza('puerta', raiz, oscuro, (0.02, 0.85, 0.6), (-1.21, piso + 0.5, 1.4))
    for i in range(3): pieza('rejilla', raiz, oscuro, (0.02, 0.14, 0.42), (-1.21, piso + 0.85, -0.5 + i * 0.55))
    # EL MASTIL y EL PLATO: una antena parabolica de verdad, con su bocina al frente
    poste('mastil', raiz, K['mat_cel']('mastil', '#3a3e34'), 0, piso + 1.12, piso + 1.95, 0.6, 0.18, 0.13)
    pl = vacio(raiz, 'plato', (0, piso + 1.95, 0.6), (0, float(ang), 0))
    # el plato se arma con la boca hacia +y: se lo acuesta para que mire ADELANTE (-z), 17° arriba
    inc = vacio(pl, 'inclinacion', (0, 0, 0), (-(math.pi / 2 - 0.30), 0, 0))
    columna('plato', inc, K['mat_cel']('plato', '#8a9299'), 0, 0, [(0.0, 0.32, 0.20), (0.20, 0.95, 0.64), (0.36, 1.32, 0.90)], expo=2.0)
    hueso('brazo_bocina', inc, K['mat_cel']('mastil', '#3a3e34'), (0, 0.4, 0), (0, 1.05, -0.05), 0.03, 0.03)
    pieza('bocina', inc, K['mat_cel']('bocina', '#aab2b8'), (0.40, 0.14, 0.26), (0, 1.08, -0.05))
    return raiz

# ============================ EL GLOBO DE BARRERA ============================
def globo(T, K):
    raiz = _raiz(T, 'Globo')
    plata = mat_pintura(K, 'globo', dict(arriba=['#b3bec4'], panza='#8c979d'))
    _subdiv(loft('bolsa', [(-2.05, 0.05, 0.05, 0), (-1.85, 0.55, 0.46, 0), (-1.30, 0.90, 0.75, 0), (-0.40, 1.0, 0.82, 0),
                           (0.50, 0.94, 0.77, 0), (1.30, 0.66, 0.55, 0), (2.05, 0.32, 0.28, 0), (2.40, 0.06, 0.06, 0)],
                 raiz, plata, n=20, expo=2.0, cerrar=(True, True)), 2)
    # LAS TRES ALETAS INFLADAS a 120° (una arriba, dos abajo), como almohadones
    for i in range(3):
        a = i * 2 * math.pi / 3 + math.pi / 2
        f = elipsoide('aleta', (0, 0, 0), (0.16, 0.55, 0.78), raiz, plata, seg=14, anillos=10)
        f.rotation_euler = (0, 0, a - math.pi / 2); f.location = (math.cos(a) * 0.72, math.sin(a) * 0.72, 1.75)
    # las costuras de los paneles (bandas apenas mas oscuras) y el cable que lo ata
    for z in (-1.0, 0.0, 1.0):
        loft('costura', [(z - 0.03, 1.0 - abs(z + 0.4) * 0.12 + 0.012, 0.82 - abs(z + 0.4) * 0.1 + 0.012, 0),
                         (z + 0.03, 1.0 - abs(z + 0.4) * 0.12 + 0.012, 0.82 - abs(z + 0.4) * 0.1 + 0.012, 0)],
             raiz, K['mat_cel']('costura', '#7d888e'), n=20, cerrar=(False, False))
    hueso('cable', raiz, K['mat_cel']('cable', '#2c3034'), (0, -0.78, -0.2), (0, -1.25, -0.3), 0.02, 0.02, seg=4)
    return raiz

# ============================ LA CARPA ============================
def carpa(T, K):
    raiz = _raiz(T, 'Carpa')
    lona = mat_pintura(K, 'lona', dict(arriba=['#6d6f4e', '#64664a'], corte=0.5, escala=1.5, panza='#5a5c42'))
    HALF, PARED, RIDGE, LARGO, SAG = 1.15, 0.30, 1.30, 3.2, 0.10
    bm = bmesh.new(); secs = []
    for i in range(9):
        t = i / 8; z = -LARGO / 2 + LARGO * t
        sag = SAG * math.sin(math.pi * t)                       # la cumbrera VENCIDA en el medio
        secs.append([bm.verts.new(c) for c in ((-HALF, 0, z), (-HALF, PARED, z), (0, RIDGE - sag, z), (HALF, PARED, z), (HALF, 0, z))])
    for a, b in zip(secs, secs[1:]):
        for k in range(4): bm.faces.new((a[k], a[k + 1], b[k + 1], b[k]))
    bm.faces.new(list(reversed(secs[0]))); bm.faces.new(secs[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('carpa'); bm.to_mesh(me); bm.free()
    me.shade_flat()
    _obj('carpa', me, raiz, lona)
    oscuro = K['mat_cel']('entrada', '#20241c')
    # la ENTRADA: el triangulo oscuro de la puerta abierta en el hastial de adelante
    bm = bmesh.new()
    vs = [bm.verts.new(c) for c in ((-0.38, 0.0, -LARGO / 2 - 0.01), (0.38, 0.0, -LARGO / 2 - 0.01), (0, 0.95, -LARGO / 2 - 0.01))]
    bm.faces.new(vs); me = bpy.data.meshes.new('entrada'); bm.to_mesh(me); bm.free()
    _obj('entrada', me, raiz, oscuro)
    # LOS VIENTOS: de los aleros a las estacas, a los dos lados
    cuerda = K['mat_cel']('cuerda', '#9c9677')
    for sg in (-1, 1):
        for z in (-1.2, 0, 1.2):
            hueso('viento', raiz, cuerda, (sg * HALF, PARED, z), (sg * (HALF + 0.75), 0.02, z), 0.015, 0.015, seg=4)
    for z in (-LARGO / 2 - 0.02, LARGO / 2 + 0.02):
        hueso('palo', raiz, K['mat_cel']('palo', '#3c3a2c'), (0, 0, z), (0, RIDGE + 0.12, z), 0.03, 0.03, seg=6)
    elipsoide('faldon', (0, 0.0, 0), (1.45, 0.05, 1.8), raiz, K['mat_cel']('faldon', '#5a5c42'), seg=16, anillos=4)
    return raiz

# ============================ EL DEPOSITO: GALPON NISSEN ============================
def deposito(T, K):
    raiz = _raiz(T, 'Deposito')
    R, LARGO, BASE, N = 1.7, 4.6, 0.30, 26
    chapa = K['mat_cel']('chapa', '#75705c')
    # LA BOVEDA DE CHAPA ONDULADA: medio cilindro con la onda a lo largo — en bandas de luz
    bm = bmesh.new(); secs = []
    for i in range(N + 1):
        z = -LARGO / 2 + LARGO * i / N
        rr = R * (1 + 0.012 * math.cos(i * math.pi))            # la ONDA de la chapa
        sec = [bm.verts.new((-rr, 0, z))]
        for k in range(13):
            a = math.pi - math.pi * k / 12
            sec.append(bm.verts.new((rr * math.cos(a), BASE + rr * math.sin(a), z)))
        sec.append(bm.verts.new((rr, 0, z)))
        secs.append(sec)
    for a, b in zip(secs, secs[1:]):
        for k in range(len(a) - 1): bm.faces.new((a[k], a[k + 1], b[k + 1], b[k]))
    bm.faces.new(list(reversed(secs[0]))); bm.faces.new(secs[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('boveda'); bm.to_mesh(me); bm.free()
    me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(30))
    _obj('boveda', me, raiz, chapa)
    oscuro = K['mat_cel']('porton', '#2a2d24')
    pieza('porton', raiz, oscuro, (1.2, 1.15, 0.03), (0, 0.58, -LARGO / 2 - 0.02))
    pieza('marco', raiz, K['mat_cel']('marco', '#5a5444'), (1.36, 0.08, 0.05), (0, 1.18, -LARGO / 2 - 0.03))
    for sg in (-1, 1):
        pieza('ventana', raiz, oscuro, (0.32, 0.30, 0.03), (sg * 0.95, 1.05, -LARGO / 2 - 0.02))
    # LOS TAMBORES con sus aros, y los cajones
    for i in range(3):
        x, z = 2.15 + (i % 2) * 0.5, -0.8 + i * 0.7
        columna('tambor', raiz, K['mat_cel']('tambor%d' % (i % 2), '#6d7a4a' if i % 2 else '#7d8a55'), x, z,
                [(0, 0.28, 0.28), (0.8, 0.28, 0.28)], expo=2.0)
        for y in (0.27, 0.53):
            columna('aro', raiz, K['mat_cel']('aro', '#56603a'), x, z, [(y - 0.02, 0.29, 0.29), (y + 0.02, 0.29, 0.29)], expo=2.0)
    bloque('cajon', raiz, K['mat_cel']('cajon', '#7a6b4e'), (-2.25, 0.35, -1.2), (0.8, 0.7, 0.8), bisel=0.04)
    bloque('cajon', raiz, K['mat_cel']('cajon2', '#8a7a5a'), (-2.2, 0.95, -1.15), (0.6, 0.5, 0.6), bisel=0.04)
    return raiz

# ============================ EL PUESTO: LA CASA DE LAS ISLAS ============================
# Las casas de Goose Green y Puerto Argentino: paredes de tablas claras, techo de chapa a dos aguas
# (rojo apagado), ventanas con marco, la chimenea; tomada como puesto, con bolsas al pie.
def puesto(T, K):
    raiz = _raiz(T, 'Puesto')
    W, D, H, CUMBRE = 3.0, 2.4, 2.2, 0.75
    tablas = K['mat_cel']('tablas', '#9d9781')
    bloque('cuerpo', raiz, tablas, (0, H / 2, 0), (W, H, D), bisel=0.03)
    # las TABLAS: listones horizontales apenas salidos, en los dos frentes visibles
    liston = K['mat_cel']('liston', '#8a846e')
    for k in range(1, 9):
        y = H * k / 9
        pieza('liston', raiz, liston, (W + 0.02, 0.025, 0.02), (0, y, -D / 2 - 0.005))
        for sg in (-1, 1): pieza('liston', raiz, liston, (0.02, 0.025, D + 0.02), (sg * (W / 2 + 0.005), y, 0))
    # EL TECHO a dos aguas, con alero, de chapa
    techo = K['mat_cel']('techo', '#7a3d30')
    bm = bmesh.new()
    ax, az = W / 2 + 0.22, D / 2 + 0.22
    vs = [bm.verts.new(c) for c in ((-ax, H - 0.05, -az), (ax, H - 0.05, -az), (ax, H - 0.05, az), (-ax, H - 0.05, az),
                                    (-ax, H + CUMBRE, 0), (ax, H + CUMBRE, 0))]
    for f in ((0, 1, 5, 4), (2, 3, 4, 5), (3, 0, 4), (1, 2, 5), (0, 3, 2, 1)):
        bm.faces.new([vs[i] for i in f])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('techo'); bm.to_mesh(me); bm.free()
    _obj('techo', me, raiz, techo)
    bloque('chimenea', raiz, K['mat_cel']('chimenea', '#6e6656'), (0.9, H + CUMBRE * 0.9, 0.3), (0.32, 0.8, 0.32), bisel=0.02)
    # PUERTA y VENTANAS con marco blanco
    oscuro, marco = K['mat_cel']('vano', '#23271f'), K['mat_cel']('marco', '#d6d3c4')
    pieza('puerta', raiz, oscuro, (0.6, 0.95, 0.03), (0, 0.48, -D / 2 - 0.02))
    pieza('marco_puerta', raiz, marco, (0.72, 0.06, 0.04), (0, 0.98, -D / 2 - 0.025))
    for sx in (-1.0, 1.0):
        for y in (0.75, 1.65):
            if y < 1 and abs(sx) < 0.5: continue
            pieza('marco', raiz, marco, (0.66, 0.54, 0.03), (sx, y, -D / 2 - 0.02))
            pieza('ventana', raiz, oscuro, (0.54, 0.42, 0.03), (sx, y, -D / 2 - 0.03))
    for sg in (-1, 1):
        pieza('marco', raiz, marco, (0.03, 0.54, 0.66), (sg * (W / 2 + 0.02), 1.65, 0))
        pieza('ventana', raiz, oscuro, (0.03, 0.42, 0.54), (sg * (W / 2 + 0.03), 1.65, 0))
    bolsas(raiz, K, [(-1.3 + i * 0.6, 0.13, -1.45, 0) for i in range(5)] + [(-1.0 + i * 0.6, 0.37, -1.45, 0) for i in range(4)])
    return raiz

# ============================ LA BASE COSTERA (el blanco en tierra) ============================
# (12/10/2026, el autor: "LA BASE SE VE HORRIBLE, HORNEALA Y MEJORALA"). Hasta hoy la dibujaba el canvas
# desde el perfil (render/blanco.js drawEstructura): rectangulos y un arco plano. Ahora es una hoja como
# las de los buques (hojas.py `base_costera`: el mismo teleobjetivo de costado, 10 unidades de punta a
# punta = la eslora del blanco) y el perfil de la bomba se re-mide de ella (data/blanco.js PERFIL.base).
# La MISMA composicion de izquierda a derecha que las piezas de data/estructuras.js — cerco, tanques,
# barracas, deposito, el HANGAR y la TORRE al centro, taller, deposito, barracas, la antena, tanque —
# pero con forma: las bovedas Nissen de chapa ondulada con su frente y su porton, la torre de control
# con la cabina encendida, los tanques de combustible con su escalera, el cerco de alambre, la antena
# reticulada con su plato, el radomo detras, bolsas de arena y la bandera.
# La camara ve el lado -x del modelo y -z queda a la IZQUIERDA (ver hornear_hoja.py, quarter = pi/2).
CHAPA_B, FRENTE_B, OSCURO_B = '#6e6a55', '#8c8771', '#1b1d18'
HORMIGON, TORRE_B, TECHO_B = '#85837a', '#aeab9f', '#4a4a43'

def _boveda(nombre, raiz, mat, cz, x0, x1, R, base=0.0, N=18, onda=0.018):
    """Una BOVEDA NISSEN con el eje en x (el frente mira a la camara): medio cilindro de chapa
    ondulada — la onda va a lo largo, en bandas de luz."""
    bm = bmesh.new(); secs = []
    for i in range(N + 1):
        x = x0 + (x1 - x0) * i / N
        rr = R * (1 + onda * math.cos(i * math.pi))
        sec = [bm.verts.new((x, 0, cz - rr))]
        for k in range(17):
            a = math.pi - math.pi * k / 16
            sec.append(bm.verts.new((x, base + rr * math.sin(a), cz + rr * math.cos(a))))
        sec.append(bm.verts.new((x, 0, cz + rr)))
        secs.append(sec)
    for a, b in zip(secs, secs[1:]):
        for k in range(len(a) - 1): bm.faces.new((a[k], a[k + 1], b[k + 1], b[k]))
    bm.faces.new(list(reversed(secs[0]))); bm.faces.new(secs[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(30))
    return _obj(nombre, me, raiz, mat)

def _frente(raiz, K, cz, x, R, base, porton, ventanas=0):
    """El FRENTE de una boveda: la pared en semicirculo, el porton oscuro y las ventanas."""
    pared = K['mat_cel']('frente_b', FRENTE_B)
    bm = bmesh.new()
    vs = [bm.verts.new((x, 0, cz - R))] + [bm.verts.new((x, base + R * math.sin(math.pi - math.pi * k / 16), cz + R * math.cos(math.pi - math.pi * k / 16))) for k in range(17)] + [bm.verts.new((x, 0, cz + R))]
    bm.faces.new(vs)
    me = bpy.data.meshes.new('frente'); bm.to_mesh(me); bm.free()
    _obj('frente', me, raiz, pared)
    oscuro = K['mat_cel']('porton_b', OSCURO_B)
    pw, ph = porton
    pieza('porton', raiz, oscuro, (0.03, ph, pw), (x - 0.02, ph / 2, cz))
    pieza('dintel', raiz, K['mat_cel']('marco_b', '#5b5848'), (0.05, 0.05, pw + 0.08), (x - 0.03, ph + 0.02, cz))
    for k in range(ventanas):
        dz = (k - (ventanas - 1) / 2) * (pw + 0.30)
        if abs(dz) < 1e-6: continue
        pieza('ventana', raiz, K['mat_cel']('vidrio_b', '#3d4a4e'), (0.03, 0.16, 0.16), (x - 0.02, ph * 0.62, cz + dz))

def _nissen(raiz, K, cz, R, prof, porton, ventanas=0, x_frente=-1.2, base=0.06):
    _boveda('nissen', raiz, K['mat_cel']('chapa_b', CHAPA_B), cz, x_frente, x_frente + prof, R, base)
    _frente(raiz, K, cz, x_frente - 0.005, R, base, porton, ventanas)

def _tanque_comb(raiz, K, x, z, r, alto):
    """El TANQUE DE COMBUSTIBLE: cilindro con el techo apenas conico, una franja y la escalera."""
    columna('tanque_comb', raiz, K['mat_cel']('tanque_b', '#a4a796'), x, z,
            [(0, r, r), (alto, r, r), (alto + 0.08, r * 0.86, r * 0.86), (alto + 0.16, r * 0.25, r * 0.25)], expo=2.0)
    columna('franja', raiz, K['mat_cel']('franja_b', '#5f6a44'), x, z, [(alto * 0.62, r + 0.005, r + 0.005), (alto * 0.72, r + 0.005, r + 0.005)], expo=2.0)
    for dz in (-0.07, 0.07):
        poste('escalera', raiz, K['mat_cel']('escalera_b', '#4a4c44'), x - r - 0.02, 0, alto, z + dz, 0.012, 0.012, seg=4)
    columna('muro', raiz, K['mat_cel']('muro_b', '#7f7c69'), x, z, [(0, r * 1.45, r * 1.45), (0.14, r * 1.45, r * 1.45)], expo=6.0)

def _cerco(raiz, K, z0, z1, x=-2.1, alto=0.5):
    """EL CERCO: postes y tres hilos de alambre (a 240 px, alambre es una linea)."""
    m = K['mat_cel']('cerco_b', '#4d4f47')
    n = max(2, int(round((z1 - z0) / 0.32)) + 1)
    for i in range(n):
        poste('poste_c', raiz, m, x, 0, alto, z0 + (z1 - z0) * i / (n - 1), 0.022, 0.018, seg=5)
    for y in (alto * 0.35, alto * 0.65, alto * 0.95):
        pieza('alambre', raiz, m, (0.012, 0.012, z1 - z0), (x, y, (z0 + z1) / 2))

def base_costera(T, K):
    raiz = _raiz(T, 'Base costera')
    # LA PLAYA DE HORMIGON donde se apoya todo, con su cordon
    bloque('playa', raiz, K['mat_cel']('hormigon_b', HORMIGON), (0.2, 0.025, 0), (4.6, 0.05, 10.1), bisel=0.01)
    # cercos de las puntas y la tranquera
    _cerco(raiz, K, -5.0, -4.55); _cerco(raiz, K, -3.55, -3.05); _cerco(raiz, K, 3.55, 4.0); _cerco(raiz, K, 4.55, 5.0)
    pieza('barrera', raiz, K['mat_cel']('barrera_b', '#c9c2a8'), (0.03, 0.03, 0.42), (-2.1, 0.42, -3.3), (0.35, 0, 0))
    # col 1-2 y 18: los TANQUES DE COMBUSTIBLE
    _tanque_comb(raiz, K, -0.6, -4.18, 0.34, 0.86)
    _tanque_comb(raiz, K, 0.2, -3.80, 0.30, 0.74)
    _tanque_comb(raiz, K, -0.6, 4.25, 0.30, 0.80)
    # col 4-5 y 14-15: las BARRACAS (Nissen chicas, puerta y dos ventanas)
    _nissen(raiz, K, -2.50, 0.52, 2.4, (0.22, 0.34), ventanas=3, x_frente=-1.5)
    _nissen(raiz, K, 2.50, 0.52, 2.4, (0.22, 0.34), ventanas=3, x_frente=-1.5)
    # col 6 y 13: los DEPOSITOS — bloques de techo plano con porton enrollable
    for cz, alto in ((-1.75, 0.95), (1.75, 0.85)):
        bloque('deposito_b', raiz, K['mat_cel']('depo_b', '#7c7966'), (-0.4, alto / 2, cz), (2.0, alto, 0.48), bisel=0.02)
        bloque('techo_d', raiz, K['mat_cel']('techo_d', TECHO_B), (-0.4, alto + 0.03, cz), (2.1, 0.06, 0.56), bisel=0.01)
        pieza('porton_d', raiz, K['mat_cel']('roll_b', '#56574c'), (0.03, alto * 0.62, 0.30), (-1.42, alto * 0.31, cz))
    # col 7-9: EL HANGAR GRANDE, abierto, con un avion asomando en la sombra
    _nissen(raiz, K, -0.75, 1.45, 3.4, (2.0, 1.15), x_frente=-1.65, base=0.10)
    pieza('interior', raiz, K['mat_emisivo']('interior_b', '#2a2a22'), (0.02, 0.10, 1.6), (-1.66, 0.05, -0.75))
    # col 10-11: LA TORRE DE CONTROL — fuste, cabina vidriada encendida, techo, baranda y antenas
    torre = K['mat_cel']('torre_b', TORRE_B)
    bloque('fuste', raiz, torre, (-0.9, 1.15, 0.62), (0.55, 2.3, 0.55), bisel=0.02)
    bloque('cabina_t', raiz, torre, (-0.9, 2.52, 0.62), (0.90, 0.46, 0.90), bisel=0.02)
    pieza('vidrio_t', raiz, K['mat_emisivo']('vidrio_t', '#e8d79a'), (0.92, 0.20, 0.92), (-0.9, 2.56, 0.62))
    bloque('techo_t', raiz, K['mat_cel']('techo_t', TECHO_B), (-0.9, 2.80, 0.62), (1.05, 0.08, 1.05), bisel=0.01)
    pieza('baranda', raiz, K['mat_cel']('baranda_t', '#5a5b52'), (1.0, 0.03, 1.0), (-0.9, 2.30, 0.62))
    poste('antena_t', raiz, K['mat_cel']('metal_t', '#4b4d47'), -0.9, 2.84, 3.35, 0.45, 0.018, 0.008, seg=5)
    # la MANGA de viento, naranja y blanca, en su palo
    poste('palo_manga', raiz, K['mat_cel']('metal_t', '#4b4d47'), -1.45, 0, 1.1, 1.05, 0.02, 0.015, seg=5)
    manga = loft('manga', [(1.05, 0.05, 0.05, 1.08), (1.35, 0.03, 0.03, 1.06)], raiz, K['mat_cel']('manga', '#e07a3a'), n=8, cerrar=(True, True), x0=-1.45)
    # col 12: el TALLER — galpon a dos aguas
    bm = bmesh.new()
    W, H0, H1, z0 = 0.9, 0.95, 1.40, 1.25
    pts = [(z0 - W / 2, 0), (z0 + W / 2, 0), (z0 + W / 2, H0), (z0, H1), (z0 - W / 2, H0)]
    fr = [bm.verts.new((-1.45, y, z)) for z, y in pts]; at = [bm.verts.new((0.8, y, z)) for z, y in pts]
    bm.faces.new(fr); bm.faces.new(list(reversed(at)))
    for i in range(5): bm.faces.new((fr[i], fr[(i + 1) % 5], at[(i + 1) % 5], at[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('taller'); bm.to_mesh(me); bm.free()
    _obj('taller', me, raiz, K['mat_cel']('taller_b', '#8a8571'))
    pieza('porton_t', raiz, K['mat_cel']('porton_b', OSCURO_B), (0.03, 0.70, 0.55), (-1.47, 0.35, 1.25))
    # col 16: LA ANTENA reticulada, con su plato y los vientos
    m = K['mat_cel']('reticula', '#55574f')
    for dz, dx in ((-0.14, -0.08), (0.14, -0.08), (0, 0.14)):
        hueso('pata_a', raiz, m, (-0.3 + dx, 0, 3.25 + dz), (-0.3, 2.65, 3.25), 0.03, 0.012, seg=4)
    for y in (0.5, 1.0, 1.5, 2.0):
        k = 1 - y / 2.65
        pieza('travesano', raiz, m, (0.02, 0.02, 0.28 * k + 0.02), (-0.3 - 0.08 * k, y, 3.25))
    plato = elipsoide('plato', (0, 0, 0), (0.05, 0.22, 0.22), raiz, K['mat_cel']('plato', '#c8c9c0'), seg=14, anillos=8)
    plato.location = (-0.42, 1.95, 3.25)
    for dz in (-0.9, 0.9):
        hueso('viento', raiz, m, (-0.3, 2.4, 3.25), (-0.3, 0, 3.25 + dz), 0.005, 0.005, seg=3)
    # EL RADOMO detras, asomando entre el taller y la antena
    bloque('base_radomo', raiz, K['mat_cel']('hormigon_b', HORMIGON), (1.6, 0.35, 2.4), (0.8, 0.7, 0.8), bisel=0.02)
    elipsoide('radomo', (1.6, 0.98, 2.4), (0.55, 0.52, 0.55), raiz, K['mat_cel']('radomo', '#d6d5cb'), seg=20, anillos=12)
    # LA BANDERA en su mastil, junto a la torre
    poste('mastil', raiz, K['mat_cel']('metal_t', '#4b4d47'), -1.8, 0, 1.9, -0.25, 0.018, 0.012, seg=5)
    pieza('bandera', raiz, K['mat_cel']('union_az', '#2d4a8a'), (0.02, 0.22, 0.36), (-1.8, 1.76, -0.07))
    pieza('cruz_h', raiz, K['mat_cel']('union_rj', '#c4302a'), (0.025, 0.05, 0.36), (-1.81, 1.76, -0.07))
    pieza('cruz_v', raiz, K['mat_cel']('union_rj', '#c4302a'), (0.025, 0.22, 0.06), (-1.81, 1.76, -0.07))
    # BOLSAS DE ARENA: un pozo con su ametralladora delante de las barracas de la derecha
    nido = vacio(raiz, 'nido', (-2.05, 0, 2.45), escala=0.32)
    arco_bolsas(nido, K, 0.75, math.pi * 0.55, math.pi * 1.45, 7, filas=2)
    hueso('ametralladora', nido, K['mat_cel']('metal_t', '#4b4d47'), (0, 0.42, 0), (-0.7, 0.5, 0), 0.04, 0.03, seg=5)
    # tambores sueltos junto al deposito de la izquierda
    for i, (x, z) in enumerate(((-1.75, -1.35), (-1.8, -1.12), (-1.6, -1.22))):
        columna('tambor_b', raiz, K['mat_cel']('tambor_b%d' % (i % 2), '#6d7a4a' if i % 2 else '#7d8a55'), x, z, [(0, 0.075, 0.075), (0.2, 0.075, 0.075)], expo=2.0)
    return raiz
