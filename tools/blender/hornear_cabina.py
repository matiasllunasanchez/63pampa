# LA CABINA EN PRIMERA PERSONA — F2 del plan (docs/sistemas/PLAN_PRIMERA_PERSONA.md, 14/10/2026).
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
#       --python tools/blender/hornear_cabina.py -- [--out out/cabina]
#   .venv-art/bin/python3 tools/blender/armar_cabina.py      (la copia al juego con sus anclas)
#
# Una cabina GENERAL (el autor: "por ahora es una cabina general para todo"), modelada desde el ojo del
# piloto y horneada con LA MISMA PROYECCION DEL JUEGO: el ojo en el origen mirando a -z, foco F = 135 px
# sobre un cuadro de 480x270 y el horizonte en la fila HOR = 96 (render/ctx.js). Asi el morro, el
# parabrisas y el colimador caen exactamente donde el mundo los espera. Se hornea al doble (960x540), el
# buffer del juego.
#
# Sale una imagen con fondo transparente (lo que se ve del mundo) y un JSON con las ANCLAS: el centro y el
# radio, en pixeles de 480x270, de cada reloj del tablero — ahi el juego dibuja los relojes vivos de
# render/hud.js (F3), y del colimador (la mira).
import bpy, importlib.util, json, math, os, sys
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
def _cargar(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(AQUI, archivo))
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod

H = _cargar('horno_bl_cab', 'hornear.py')
M = _cargar('modelos_bl_cab', 'modelos.py')
B = _cargar('modelos_bl_buques_cab', 'modelos_buques.py')
caja, elipsoide, loft = M.caja, M.elipsoide, M.loft
bloque, pieza = B.bloque, B.pieza
hueso = _cargar('modelos_bl_tierra_cab', 'modelos_tierra.py').hueso
OUT = os.path.join(AQUI, H.arg('--out', 'out/cabina'))

# LA PROYECCION DEL JUEGO (render/ctx.js): W x H, foco F, horizonte HOR
W_J, H_J, F_J, HOR_J = 480, 270, 135, 96
ESC = 2

# LOS COLORES (la referencia del autor, 15/10: la cabina del A-4 de verdad): tablero gris metal con los
# relojes NEGROS hundidos y marcas blancas, la visera y las consolas negras, palanca gris con empuñadura
# negra y gatillo rojo, rotulos amarillos con franjas negras, piso azul gris gastado.
PANEL, VISERA, MARCO, CONSOLA = '#59636a', '#17191b', '#202426', '#1e2224'
BISEL, ESFERA, MARCA, METAL, GOMA = '#2b3033', '#0c0e0f', '#d9d8cc', '#8e969a', '#141617'
AMARILLO, ROJO, PISO, ACOLCHADO = '#d4ad33', '#b3281f', '#34434e', '#3a3f3c'
FUELLE = '#2c302c'                               # la goma del fuelle de la palanca, mas gastada que la empuñadura

# LOS RELOJES: nombre -> (x, y, radio) sobre la cara del tablero (z = Z_TABLERO), en metros. Los VIVOS
# (los del HUD, que el juego dibuja encima) y los DECORATIVOS (esfera con marcas, horneados) — la "T"
# del A-4: fila de arriba chica a los lados del colimador, la del medio con el horizonte al centro y la
# de abajo.
Z_TABLERO = -0.50
RELOJES = {
    'velocidad': (-0.235, -0.270, 0.047), 'nafta': (-0.118, -0.270, 0.047), 'adi': (0.000, -0.268, 0.052),
    'altitud': (0.118, -0.270, 0.047), 'mach': (0.235, -0.270, 0.047),
    'salud': (-0.235, -0.385, 0.047), 'gas': (-0.118, -0.385, 0.047), 'canon': (0.000, -0.385, 0.047),
}
DECORATIVOS = [(-0.200, -0.170, 0.032), (0.120, -0.170, 0.032), (0.200, -0.170, 0.032),
               (0.118, -0.385, 0.047), (0.235, -0.385, 0.047)]
# …LA CHANCHA (el reloj del tanque de la Chancha) en la fila chica de arriba, y EL ESTANTE de la carga
# (tanques, bombas y chapitas: render/hud.js drawEstante) en un PANELITO PROPIO al costado derecho del
# tablero (el autor, 15/10: "las bombas y demas como parte del panel"; arriba al medio quedaba achatado).
# El recuadro tiene LA PROPORCION DEL ESTANTE (16 x 26 del HUD): se dibuja sin deformar.
RELOJES['chancha'] = (-0.120, -0.170, 0.032)
ESTANTE = (0.352, -0.305, 0.074, 0.120)          # centro x, centro y, ancho, alto  (0.088 / 0.143 = 16 / 26)

def cilindro_z(nombre, padre, mat, c, r, largo, seg=24):
    """Un cilindro con el eje en z (de cara al ojo): un bisel, una esfera."""
    return loft(nombre, [(c[2] - largo / 2, r, r, c[1]), (c[2] + largo / 2, r, r, c[1])], padre, mat, n=seg, expo=2.0,
                cerrar=(True, True), x0=c[0])

def tubo(nombre, padre, mat, pts, r):
    """Un caño por una lista de puntos (los arcos del canopy)."""
    from mathutils import Vector as V
    obs = []
    for a, b in zip(pts, pts[1:]):
        d = V(b) - V(a); largo = d.length
        o = caja(nombre, (0, 0, 0), (r * 2, r * 2, largo), padre, mat)
        o.location = (V(a) + V(b)) / 2
        o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = d.to_track_quat('Z', 'Y')
        obs.append(o)
    return obs

def marcas(raiz, mat, x, y, z, r, n=24):
    """Las marcas blancas de una esfera: rayitas radiales, las de cada cuarto mas largas."""
    for k in range(n):
        a = 2 * math.pi * k / n
        largo = r * (0.22 if k % 6 == 0 else 0.12)
        rr = r * 0.86 - largo / 2
        o = caja('marca', (0, 0, 0), (r * 0.05, largo, 0.002), raiz, mat)
        o.location = (x + math.sin(a) * rr, y + math.cos(a) * rr, z)
        o.rotation_euler = (0, 0, -a)

# LOS RELOJES DE RELLENO ANDAN (20/11, el autor: "las agujas que no tienen indicador y son solo relleno, que se muevan,
# tiemblen y cada tanto bajen o suban"): se hornean SIN aguja y se anotan aca; el juego les pone la aguja viva
# (render/cabina.js, con la ancla `deco` de cada uno)
DECO = []

def reloj_hundido(raiz, m, x, y, r, vivo):
    """Un reloj REDONDO hundido en el tablero: el aro, la esfera negra y (si es decorativo) sus marcas y
    una aguja. Los vivos quedan con la esfera limpia: la aguja y las marcas las pone el juego."""
    cilindro_z('aro', raiz, m['bisel'], (x, y, Z_TABLERO + 0.003), r * 1.14, 0.006, seg=28)
    cilindro_z('esfera', raiz, m['esfera'], (x, y, Z_TABLERO + 0.0065), r, 0.002, seg=28)
    if not vivo:
        marcas(raiz, m['marca'], x, y, Z_TABLERO + 0.0085, r)
        DECO.append((x, y, r))

def franjas(raiz, m, c, w, h):
    """Un rotulo de EMERGENCIA: chapa amarilla con franjas negras en diagonal."""
    pieza('rotulo', raiz, m['amarillo'], (w, h, 0.004), c)
    n = int(w / (h * 0.9))
    for i in range(n):
        pieza('franja', raiz, m['visera'], (h * 0.28, h * 1.05, 0.005),
              (c[0] - w / 2 + (i + 0.5) * w / n, c[1], c[2] + 0.001), (0, 0, math.radians(35)))

def tecla(raiz, m, x, y, z):
    """Un interruptor de palanquita: la base negra y la punta clara."""
    cilindro_z('base_t', raiz, m['goma'], (x, y, z), 0.009, 0.006, seg=8)
    tubo('palanquita', raiz, m['metal'], [(x, y, z + 0.003), (x, y + 0.016, z + 0.012)], 0.0028)

# LAS MANOS (el autor, 15/10): guantes de cuero marron sobre la palanca y el acelerador, con la manga
# del mameluco verde oliva que se va hacia el piloto.
# …MAS REALES (20/11, dos veces: "mejorar mucho mas las manos y los controles"): ya no son esferas pegadas.
# Cada mano es UNA MASA: falanges, metacarpos, palma, eminencias y muñeca se tiran como primitivas en un solo
# bmesh, un REMESH DE VOXELES las funde en una superficie continua y un SUAVIZADO redondea las uniones (el
# dorso pasa a los dedos sin costura, los nudillos quedan como bultos y entre dedo y dedo queda el surco).
# Despues se PINTA por cara: el refuerzo de cuero claro sobre los nudillos, las tres costuras del dorso, las
# yemas gastadas. Los dedos se calculan como un POLIGONO alrededor del eje del mando: cada falange es una
# cuerda tangente a la empuñadura, asi abrazan sin huecos y los nudillos sobresalen donde tienen que estar.
# El puño del guante (con su correa y hebilla) y la manga son LOFTS con pliegues que caen con el peso.
GUANTE, GUANTE_SOMBRA, GUANTE_LUZ, MANGA, MANGA_SOMBRA, PUÑO = '#5a4331', '#3f2f25', '#7a5d45', '#5d6040', '#4a4c33', '#3e3f2b'
COSTURA = '#2e231b'
from mathutils import Vector as _V, Matrix as _M
import bmesh

def _mezcla(a, b, t): return tuple(a[k] + (b[k] - a[k]) * t for k in range(3))

class Masa:
    """Una MASA de barro: primitivas sueltas (que se pisan) en un solo bmesh, que `cerrar` funde con un remesh
    de voxeles y suaviza. Asi una mano no son bolitas: es un volumen."""
    def __init__(s): s.bm = bmesh.new()
    def elip(s, c, radios, ejes=None, seg=16, anillos=10):
        R = _M.Identity(3) if ejes is None else _M([_V(e) for e in ejes]).transposed()
        M = _M.Translation(_V(c)) @ R.to_4x4() @ _M.Diagonal((radios[0], radios[1], radios[2], 1.0))
        bmesh.ops.create_uvsphere(s.bm, u_segments=seg, v_segments=anillos, radius=1.0, matrix=M)
    def capsula(s, p0, p1, r0, r1, seg=14):
        p0, p1 = _V(p0), _V(p1); d = p1 - p0
        M = _M.Translation((p0 + p1) / 2) @ d.to_track_quat('Z', 'Y').to_matrix().to_4x4()
        bmesh.ops.create_cone(s.bm, cap_ends=True, segments=seg, radius1=r0, radius2=r1, depth=d.length, matrix=M)
        s.elip(p0, (r0,) * 3, seg=seg, anillos=8); s.elip(p1, (r1,) * 3, seg=seg, anillos=8)
    def cerrar(s, nombre, raiz, mats, pintar, voxel=0.0013, suave=8, factor=0.6):
        me = bpy.data.meshes.new(nombre); s.bm.to_mesh(me); s.bm.free()
        ob = bpy.data.objects.new(nombre, me); bpy.context.scene.collection.objects.link(ob); ob.parent = raiz
        rm = ob.modifiers.new('voxel', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = voxel; rm.adaptivity = 0.0
        sm = ob.modifiers.new('suave', 'SMOOTH'); sm.factor = factor; sm.iterations = suave
        bpy.context.view_layer.update()
        nuevo = bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
        ob.modifiers.clear(); ob.data = nuevo; bpy.data.meshes.remove(me)
        for m in mats: nuevo.materials.append(m)
        for p in nuevo.polygons: p.material_index = pintar(_V(p.center), _V(p.normal))
        nuevo.shade_smooth()
        return ob

def tubo_libre(nombre, raiz, mat, estaciones, n=20, expo=2.0, forma=None, tapas=(True, True), sub=1, mats=None, pintar=None):
    """Un LOFT por cualquier camino: `estaciones` = [(centro, u, v, ru, rv)], la seccion es la superelipse de
    semiejes ru (sobre u) y rv (sobre v). `forma(i, t, ang)` multiplica el radio de cada vertice (los pliegues
    de una manga, las estrias de una empuñadura). Con subdivision encima: sale liso."""
    bm = bmesh.new(); anillos = []
    N = len(estaciones)
    for i, (c, u, v, ru, rv) in enumerate(estaciones):
        c, u, v = _V(c), _V(u), _V(v); anillo = []
        for k in range(n):
            a = 2 * math.pi * k / n; co, si = math.cos(a), math.sin(a)
            f = forma(i, i / max(1, N - 1), a) if forma else 1.0
            x = math.copysign(abs(co) ** (2 / expo), co) * ru * f
            y = math.copysign(abs(si) ** (2 / expo), si) * rv * f
            anillo.append(bm.verts.new(c + u * x + v * y))
        anillos.append(anillo)
    for A, B in zip(anillos, anillos[1:]):
        for k in range(n): bm.faces.new((A[k], A[(k + 1) % n], B[(k + 1) % n], B[k]))
    if tapas[0]: bm.faces.new(list(reversed(anillos[0])))
    if tapas[1]: bm.faces.new(anillos[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    me.materials.append(mat)
    for m in (mats or []): me.materials.append(m)
    if pintar:
        for p in me.polygons: p.material_index = pintar(_V(p.center), _V(p.normal))
    me.shade_smooth()
    ob = bpy.data.objects.new(nombre, me); bpy.context.scene.collection.objects.link(ob); ob.parent = raiz
    if sub:
        md = ob.modifiers.new('sub', 'SUBSURF'); md.levels = sub; md.render_levels = sub
    return ob

def ejes_de(d, arriba=(0, 1, 0)):
    """Dos ejes perpendiculares a la direccion `d`: u lo mas horizontal posible, v lo mas 'arriba' posible."""
    d = _V(d).normalized(); u = d.cross(_V(arriba))
    if u.length < 1e-4: u = d.cross(_V((1, 0, 0)))
    u.normalize(); v = u.cross(d).normalized()
    return u, v

def placa(nombre, raiz, mat, c, u, v, w, d, bisel=0.0):
    """Una caja orientada con los ejes (u, v, w) y medidas `d`: un parche, una hebilla, un bolsillo."""
    from mathutils import Matrix
    ob = caja(nombre, (0, 0, 0), d, raiz, mat)
    R = Matrix([_V(u).normalized(), _V(v).normalized(), _V(w).normalized()]).transposed()
    ob.matrix_basis = Matrix.Translation(_V(c)) @ R.to_4x4()
    if bisel:
        bv = ob.modifiers.new('bisel', 'BEVEL'); bv.width = bisel; bv.segments = 2
    return ob

# LOS DEDOS: (nombre, posicion sobre el eje, angulo del nudillo en grados, largos de las tres falanges, radio).
# Medidas de una mano grande con guante (el cuero suma un par de milimetros por lado).
DEDOS = (('indice', 0.025, 16, (0.040, 0.025, 0.021), 0.0098),
         ('mayor', 0.005, 20, (0.044, 0.028, 0.022), 0.0102),
         ('anular', -0.0145, 18, (0.042, 0.026, 0.021), 0.0097),
         ('meñique', -0.0320, 12, (0.034, 0.021, 0.018), 0.0086))

def mano(raiz, mg, C, ea, e1, e2, Rg, pulgar, separa_indice=0.0, cierre=1.36):
    """UNA MANO CERRADA sobre un mando. `C` el centro de la empuñadura, `ea` su eje (los dedos se apilan sobre
    el, el indice hacia +ea), `e1` hacia donde queda la palma, `e2` hacia donde arrancan a abrazar los dedos
    (por delante). `Rg` el radio de lo que se agarra. `pulgar` = 4 puntos locales (a, b, c) del pulgar.
    Devuelve el punto de la muñeca y los ejes del dorso (para el puño del guante)."""
    C, ea, e1, e2 = _V(C), _V(ea).normalized(), _V(e1).normalized(), _V(e2).normalized()
    P = lambda a, b, c: C + ea * a + e1 * b + e2 * c
    rad = lambda th: (math.cos(th), math.sin(th))
    masa = Masa()
    dedos, nudillos, puntas = [], [], []
    for (nom, a0, th0, L, r) in DEDOS:
        d = Rg + r + (separa_indice if nom == 'indice' else 0.0)
        th = math.radians(th0); rho = Rg + 0.017
        pts = [(a0, rho, th)]
        for k, l in enumerate(L):
            th += 2 * math.atan(l / 2 / d) * cierre
            rho = math.sqrt(d * d + (l / 2) ** 2) * (0.97 if k < 2 else 0.92)   # la yema se mete contra el mando
            pts.append((a0 - 0.0025 * (k + 1), rho, th))
        W = [P(a, rh * rad(t)[0], rh * rad(t)[1]) for (a, rh, t) in pts]
        radios = (r * 1.06, r * 0.97, r * 0.88, r * 0.78)
        for k in range(3):
            masa.capsula(W[k], W[k + 1], radios[k], radios[k + 1])
            if k:                                                       # el bulto del nudillo de cada falange
                o = (W[k] - (C + ea * ea.dot(W[k] - C))).normalized()
                masa.elip(W[k] + o * 0.0028, (radios[k] * 0.92,) * 3)
        # el METACARPO: del nudillo hacia la muñeca, por el dorso (abriendose apenas)
        base = P(-0.004 + a0 * 0.42, Rg + 0.016, -0.062)
        masa.capsula(W[0], base, r * 1.22, r * 1.05)
        dedos.append(W); nudillos.append(W[0]); puntas.append((W[3], radios[3]))
    # la PALMA que llena entre metacarpos y empuñadura, las dos EMINENCIAS (pulgar y meñique) y la MUÑECA
    masa.elip(P(-0.003, Rg + 0.009, -0.026), (0.039, 0.012, 0.034), (ea, e1, e2))
    masa.elip(P(-0.026, Rg + 0.004, -0.048), (0.017, 0.013, 0.024), (ea, e1, e2))
    masa.elip(P(0.014, Rg - 0.002, -0.040), (0.020, 0.016, 0.020), (ea, e1, e2))
    masa.elip(P(0.004, -0.002, -Rg - 0.007), (0.024, 0.017, 0.010), (ea, e1, e2))   # la palma que tapa por detras
    muñeca = P(-0.004, Rg + 0.012, -0.078)
    masa.elip(muñeca, (0.029, 0.019, 0.018), (ea, e1, e2))
    # EL PULGAR: metacarpo, falange y falange distal, mas grueso que los dedos
    T = [P(*p) for p in pulgar]
    for k, (ra, rb) in enumerate(((0.0145, 0.0125), (0.0125, 0.0112), (0.0112, 0.0094))):
        masa.capsula(T[k], T[k + 1], ra, rb)
    masa.elip(T[2] + (T[2] - C - ea * ea.dot(T[2] - C)).normalized() * 0.002, (0.0112,) * 3)
    puntas.append((T[3], 0.0094))
    # LA PINTURA: costuras del dorso (de entre los nudillos hacia la muñeca), refuerzo claro sobre los nudillos
    # y la falange del medio, yemas gastadas
    costuras = [((nudillos[k] + nudillos[k + 1]) / 2, P(-0.004 + (DEDOS[k][1] + DEDOS[k + 1][1]) * 0.21, Rg + 0.03, -0.060))
                for k in range(3)]
    def pintar(p, n):
        a, b, c = ea.dot(p - C), e1.dot(p - C), e2.dot(p - C)
        for (q, rr) in puntas:
            if (p - q).length < rr * 1.35: return 2                     # yema
        if b > Rg + 0.012 and n.dot(e1) > 0.35 and -0.058 < c < -0.008:
            for (q0, q1) in costuras:
                a0, c0, a1, c1 = ea.dot(q0 - C), e2.dot(q0 - C), ea.dot(q1 - C), e2.dot(q1 - C)
                t = (c - c0) / (c1 - c0)
                if 0.15 < t < 1.0 and abs(a - (a0 + (a1 - a0) * t)) < 0.0011: return 3
        for W in dedos:
            for k in (0, 1):
                o = (W[k] - (C + ea * ea.dot(W[k] - C))).normalized()
                if (p - W[k]).length < 0.0125 and n.dot(o) > 0.25: return 1   # refuerzo de los nudillos
        return 0
    ob = masa.cerrar('mano', raiz, [mg['guante'], mg['luz'], mg['sombra'], mg['costura']], pintar)
    return muñeca, ea, e1

def antebrazo(raiz, mg, muñeca, codo, ancho, grueso, extra=0.35, bolsillo=False):
    """EL PUÑO DEL GUANTE (acampanado, con la correa y su hebilla y el borde vuelto) y LA MANGA del mameluco:
    un loft que engorda hacia el codo, CAE con el peso de la tela (el centro baja entre muñeca y codo), se
    arruga en anillos junto al puño —la tela amontonada— y en pliegues en diagonal mas arriba. `ancho` y
    `grueso` orientan la muñeca (el eje de los dedos y el de la palma)."""
    W, E = _V(muñeca), _V(codo)
    d = (E - W); largo = d.length * (1 + extra); d.normalize()
    u = (_V(ancho) - d * d.dot(_V(ancho))).normalized(); v = d.cross(u).normalized()
    if v.dot(_V(grueso)) < 0: v = -v
    abajo = _V((0, -1, 0)); abajo = (abajo - d * d.dot(abajo)).normalized()
    # EL PUÑO DEL GUANTE: de la muñeca (ancha y chata) a la boca redonda y abierta
    est = []
    for i in range(9):
        t = i / 8; s = -0.012 + 0.056 * t
        est.append((W + d * s, u, v, 0.027 + 0.011 * t ** 1.3, 0.020 + 0.017 * t ** 1.1))
    tubo_libre('guantelete', raiz, mg['guante'], est, n=28, tapas=(True, False), sub=2)
    # el borde vuelto de la boca y la CORREA con su hebilla, del lado que mira al piloto
    tubo_libre('borde', raiz, mg['sombra'], [(W + d * s, u, v, 0.0385 + k, 0.0375 + k) for s, k in ((0.040, 0.0), (0.0435, 0.0016), (0.047, 0.0010))],
               n=22, tapas=(False, False))
    tubo_libre('correa', raiz, mg['sombra'], [(W + d * s, u, v, 0.031 + 0.0025 * j, 0.0245 + 0.0025 * j) for j, s in enumerate((0.010, 0.016, 0.022))],
               n=22, tapas=(False, False))
    lado = v if v.dot(_V((0, 1, 0.3))) > 0 else -v
    placa('hebilla', raiz, mg['metal'], W + d * 0.016 + lado * 0.0275, u, d, lado, (0.012, 0.009, 0.003), bisel=0.001)
    placa('pasador', raiz, mg['sombra'], W + d * 0.016 + lado * 0.0285, u, d, lado, (0.004, 0.011, 0.003))
    # LA MANGA: nace adentro del puño del guante
    n_est = 34; est = []
    for i in range(n_est):
        t = i / (n_est - 1); s = 0.040 + (largo - 0.040) * t
        tt = min(1.0, s / d.length if d.length else 1)
        caida = 0.012 * math.sin(math.pi * min(1.0, tt))
        r = 0.035 + 0.020 * min(1.0, tt)
        est.append((W + d * s + abajo * caida, u, v, r * 1.07, r * 0.96))
    def pliegues(i, t, ang):
        junto = max(0.0, 1 - t * 3.2) * min(1.0, t * 9)                 # la tela amontonada contra el puño (no asoma por el guante)
        f = 1 + 0.075 * junto * math.sin(t * 2 * math.pi * 11 + 0.9 * math.sin(ang))
        f += 0.035 * math.sin(3 * ang + t * 19) * (0.4 + 0.6 * (1 - t))   # los pliegues en diagonal
        f += 0.02 * math.sin(2 * ang - t * 7)
        return f
    tubo_libre('manga', raiz, mg['manga'], est, n=36, forma=pliegues, tapas=(False, True), sub=2)
    # EL BOLSILLO DE LAS BIROMES (el del antebrazo izquierdo del mameluco), con dos lapiceras asomando
    if bolsillo:
        arriba = _V((0, 1, 0)); arriba = (arriba - d * d.dot(arriba)).normalized()
        afuera = (arriba * 0.8 - u * 0.6).normalized()
        c = W + d * 0.21 + afuera * 0.052 + abajo * 0.004
        w = afuera; uu = d.cross(w).normalized()
        placa('bolsillo', raiz, mg['manga_s'], c, uu, d, w, (0.042, 0.075, 0.008), bisel=0.002)
        placa('tapa_b', raiz, mg['manga'], c - d * 0.031 + w * 0.0045, uu, d, w, (0.044, 0.018, 0.006), bisel=0.002)
        for k, (x, mat) in enumerate(((-0.010, 'metal'), (0.006, 'goma'))):
            p0 = c - d * 0.040 + uu * x + w * 0.003
            hueso('birome', raiz, mg[mat], p0, p0 - d * 0.014, 0.0035, 0.003, seg=8)

def manos(raiz, K, lado):
    mg = {n: K['mat_cel']('mano_' + n, c) for n, c in (('guante', GUANTE), ('sombra', GUANTE_SOMBRA), ('luz', GUANTE_LUZ),
                                                       ('costura', COSTURA), ('manga', MANGA), ('manga_s', MANGA_SOMBRA),
                                                       ('puño', PUÑO), ('metal', METAL), ('goma', GOMA))}
    if lado == 'der': mano_der(raiz, mg)
    else: mano_izq(raiz, mg)

# LA PALANCA: el centro de la empuñadura (donde abraza la mano) y su eje, que se vence un poco hacia adelante
PALANCA_C, PALANCA_EJE = (0.0, -0.40, -0.40), (0.0, 0.966, -0.259)
# EL ACELERADOR: el centro del mango (atravesado, de afuera hacia adentro de la cabina)
ACEL_C = (-0.345, -0.236, -0.335)

def mano_der(raiz, mg):
    # LA DERECHA en la palanca. Como la ve el piloto, desde atras y arriba: el dorso del lado de afuera, los
    # dedos que salen de los nudillos por delante y vuelven por el lado de adentro (las yemas asoman a la
    # izquierda), y el PULGAR que cruza por detras, arriba de todo, hacia el boton de bombas. El indice va un
    # poco mas abierto: abraza el gatillo.
    ea = _V(PALANCA_EJE); e1 = _V((1.0, 0.0, -0.10)); e1 = (e1 - ea * ea.dot(e1)).normalized(); e2 = ea.cross(e1)
    pulgar = ((0.010, 0.022, -0.050), (0.030, 0.010, -0.036), (0.040, -0.008, -0.030), (0.046, -0.022, -0.018))
    w, a, b = mano(raiz, mg, PALANCA_C, ea, e1, e2, 0.0185, pulgar, separa_indice=0.004)
    antebrazo(raiz, mg, w, (0.20, -0.72, 0.02), a, b)

def mano_izq(raiz, mg):
    # LA IZQUIERDA en el acelerador: la palma apoyada arriba del mango, los dedos por delante y por debajo, y el
    # pulgar estirado hacia la punta de adentro, sobre la llave del freno aerodinamico.
    ea, e1, e2 = _V((1, 0, 0)), _V((0, 1, 0.15)).normalized(), _V((0, 0.15, -1)).normalized()
    pulgar = ((0.016, 0.026, -0.044), (0.036, 0.026, -0.028), (0.050, 0.025, -0.012), (0.058, 0.024, 0.002))
    w, a, b = mano(raiz, mg, ACEL_C, ea, e1, e2, 0.019, pulgar)
    antebrazo(raiz, mg, w, (-0.30, -0.47, 0.03), a, b, bolsillo=True)

# LOS MANDOS (20/11): la PALANCA del A-4 —el fuste con su fuelle de goma, el collar, la empuñadura moldeada con
# la cabeza que se vuelca hacia adelante, el gatillo rojo, el boton de bombas, el del cañon y el trim de cuatro
# vias arriba— y el ACELERADOR con su cuadrante sobre la consola (ver cuadrante), el brazo, el mango torneado,
# la llave del freno aerodinamico donde apoya el pulgar y el boton del microfono.
def empuñadura(raiz, m):
    ea = _V(PALANCA_EJE); C = _V(PALANCA_C)
    x = _V((1, 0, 0)); f = ea.cross(x).normalized()                     # f: hacia adelante (y un poco abajo)
    if f.z > 0: f = -f
    b0 = C - ea * 0.062                                                 # el pie de la empuñadura
    # (s sobre el eje desde el pie, medio ancho, medio fondo, corrimiento hacia adelante)
    perfil = ((0.000, 0.0125, 0.0125, 0.000), (0.006, 0.0160, 0.0165, 0.000), (0.020, 0.0172, 0.0195, 0.002),
              (0.044, 0.0180, 0.0205, 0.003), (0.064, 0.0178, 0.0200, 0.002), (0.084, 0.0182, 0.0205, 0.004),
              (0.096, 0.0205, 0.0235, 0.009), (0.106, 0.0212, 0.0250, 0.013), (0.114, 0.0195, 0.0230, 0.014),
              (0.1195, 0.0140, 0.0170, 0.013), (0.122, 0.006, 0.008, 0.012))
    est = [(b0 + ea * s + f * o, x, f, w, h) for (s, w, h, o) in perfil]
    tubo_libre('empuñadura', raiz, m['goma'], est, n=24, expo=2.5, sub=2)
    top = lambda s, o, lat: b0 + ea * s + f * o + x * lat
    # el COLLAR de metal donde la empuñadura se atornilla al fuste
    tubo_libre('collar', raiz, m['metal'], [(b0 - ea * s, x, f, r, r) for s, r in ((0.000, 0.0135), (0.006, 0.0150), (0.014, 0.0150), (0.018, 0.0125))],
               n=18, sub=1)
    # EL TRIM de cuatro vias arriba al frente (el sombrerito), el BOTON DE BOMBAS rojo arriba a la izquierda
    # (bajo el pulgar) y el del CAÑON al costado
    hueso('trim_base', raiz, m['visera'], top(0.112, 0.022, 0.0), top(0.1225, 0.025, 0.0), 0.0065, 0.0060, seg=12)
    hueso('trim', raiz, m['metal'], top(0.1225, 0.025, 0.0), top(0.1265, 0.026, 0.0), 0.0045, 0.0035, seg=4)
    elipsoide('bombas_aro', top(0.1195, 0.002, -0.009), (0.0062, 0.0030, 0.0062), raiz, m['metal'], seg=14, anillos=6)
    elipsoide('bombas', top(0.1215, 0.002, -0.009), (0.0048, 0.0032, 0.0048), raiz, m['rojo'], seg=14, anillos=6)
    hueso('cañon', raiz, m['amarillo'], top(0.096, 0.014, -0.020), top(0.096, 0.014, -0.0255), 0.0045, 0.0040, seg=10)
    # EL GATILLO: una uña curva por delante, a la altura del indice, con su guarda
    g = [top(0.088, 0.030, 0), top(0.078, 0.034, 0), top(0.067, 0.032, 0), top(0.060, 0.027, 0)]
    for p0, p1 in zip(g, g[1:]): hueso('gatillo', raiz, m['rojo'], p0, p1, 0.0042, 0.0038, seg=8)
    # EL FUSTE y el FUELLE de goma: los acordeones que se pierden abajo, hacia el piso
    hueso('fuste', raiz, m['metal'], (0, -0.95, -0.30), b0 - ea * 0.016, 0.0115, 0.0105, seg=16)
    fd = (_V((0, -0.95, -0.30)) - b0).normalized()
    u, v = ejes_de(fd)
    fu = []
    for k in range(25):
        s = 0.075 + k * 0.0075
        r = 0.030 + 0.0015 * k if k % 2 == 0 else 0.022 + 0.0015 * k
        fu.append((b0 + fd * s, u, v, r, r))
    tubo_libre('fuelle', raiz, m['fuelle'], fu, n=22, tapas=(True, False), sub=1)

def mango_acelerador(raiz, m):
    C = _V(ACEL_C); ea = _V((1, 0, 0)); up = _V((0, 1, 0)); fr = _V((0, 0, -1))
    # (x desde el centro, medio alto, medio fondo): el torneado del mango, mas gordo bajo el meñique
    perfil = ((-0.049, 0.008, 0.009), (-0.046, 0.015, 0.016), (-0.040, 0.0205, 0.0215), (-0.030, 0.0210, 0.0220),
              (-0.016, 0.0190, 0.0200), (0.000, 0.0180, 0.0192), (0.016, 0.0186, 0.0198), (0.030, 0.0200, 0.0212),
              (0.040, 0.0205, 0.0218), (0.047, 0.0170, 0.0185), (0.051, 0.008, 0.010))
    tubo_libre('mango', raiz, m['goma'], [(C + ea * s, up, fr, h, w) for (s, h, w) in perfil], n=22, expo=2.3, sub=2)
    # en la punta de adentro: la LLAVE DEL FRENO AERODINAMICO (corredera con estrias, bajo el pulgar) y el boton
    # del MICROFONO por delante
    p = C + ea * 0.046
    placa('freno_aero_ranura', raiz, m['visera'], p + up * 0.0175, ea, fr, up, (0.010, 0.020, 0.004))
    placa('freno_aero', raiz, m['metal'], p + up * 0.0205 + fr * 0.003, ea, fr, up, (0.008, 0.009, 0.004), bisel=0.001)
    for k in range(3):
        placa('estria', raiz, m['visera'], p + up * 0.0228 + fr * (0.0 + k * 0.003), ea, fr, up, (0.0085, 0.0008, 0.001))
    hueso('microfono', raiz, m['visera'], p + fr * 0.017 + up * 0.006, p + fr * 0.0235 + up * 0.007, 0.0055, 0.0055, seg=12)
    hueso('microfono_b', raiz, m['metal'], p + fr * 0.0235 + up * 0.007, p + fr * 0.0255 + up * 0.007, 0.0042, 0.0038, seg=12)
    # EL BRAZO: baja por la punta de afuera hasta la ranura del cuadrante (donde pivotea)
    xb = C.x - 0.050
    bz = [(xb, C.y - 0.004, C.z), (xb, C.y - 0.040, C.z + 0.012), (xb, -0.312, -0.290), (xb, -0.345, -0.282)]
    for p0, p1 in zip(bz, bz[1:]):
        tubo_libre('brazo_acel', raiz, m['metal'], [(_V(p0), _V((1, 0, 0)), ejes_de(_V(p1) - _V(p0), (1, 0, 0))[0], 0.0055, 0.008),
                                                    (_V(p1), _V((1, 0, 0)), ejes_de(_V(p1) - _V(p0), (1, 0, 0))[0], 0.0055, 0.008)],
                   n=12, expo=3.0, sub=0)
        elipsoide('codo_acel', p1, (0.0062, 0.0085, 0.0085), raiz, m['metal'], seg=10, anillos=6)

def cuadrante(raiz, m):
    """EL CUADRANTE DEL ACELERADOR sobre la consola izquierda (fijo, va en la base): la chapa con la ranura por
    donde corre el brazo, los rieles, las marcas de los topes (CORTE, RALENTI, MILITAR) y la perilla de friccion."""
    xb = ACEL_C[0] - 0.050; yc = -0.330
    bloque('cuadrante', raiz, m['consola'], (xb, yc + 0.006, -0.290), (0.050, 0.012, 0.300), bisel=0.004)
    pieza('ranura', raiz, m['goma'], (0.009, 0.004, 0.270), (xb, yc + 0.0115, -0.290))
    for sg in (-1, 1):
        tubo('riel', raiz, m['metal'], [(xb + sg * 0.0085, yc + 0.0128, -0.425), (xb + sg * 0.0085, yc + 0.0128, -0.155)], 0.0016)
    for k in range(9):
        z = -0.410 + k * 0.030
        largo = 0.012 if k % 4 == 0 else 0.007
        pieza('marca_q', raiz, m['marca'], (largo, 0.002, 0.0022), (xb - 0.0105 - largo / 2, yc + 0.0122, z))
    for z, mat in ((-0.400, 'rojo'), (-0.285, 'amarillo'), (-0.170, 'amarillo')):
        pieza('tope', raiz, m[mat], (0.010, 0.003, 0.008), (xb + 0.017, yc + 0.0125, z))
    hueso('friccion', raiz, m['metal'], (xb + 0.024, yc + 0.010, -0.215), (xb + 0.024, yc + 0.026, -0.215), 0.007, 0.006, seg=10)
    elipsoide('friccion_t', (xb + 0.024, yc + 0.027, -0.215), (0.0075, 0.003, 0.0075), raiz, m['visera'], seg=12, anillos=6)

G = {}                     # los grupos que se mueven: 'palanca' y 'acelerador'
# LAS POSES (15/10, el autor: "que las manos se muevan con el joystick"): la palanca en 3x3 —izquierda,
# centro, derecha por adelante (picar), centro, atras (trepar)— y el acelerador en 3 (freno, normal,
# turbo). Radianes del grupo alrededor de su pivote.
PALANCA_LADO, PALANCA_CABECEO, ACELERADOR_RECORRIDO = 0.17, 0.10, 0.30

def cabina(T, K):
    raiz = bpy.data.objects.new('cabina', None)
    bpy.context.scene.collection.objects.link(raiz); raiz.parent = T
    m = {n: K['mat_cel'](n, c) for n, c in (('panel', PANEL), ('visera', VISERA), ('marco', MARCO), ('consola', CONSOLA),
                                              ('bisel', BISEL), ('marca', MARCA), ('metal', METAL), ('goma', GOMA),
                                              ('amarillo', AMARILLO), ('rojo', ROJO), ('piso', PISO), ('acolchado', ACOLCHADO),
                                              ('fuelle', FUELLE))}
    m['esfera'] = K['mat_emisivo']('esfera', ESFERA)
    # EL TABLERO: la chapa con el escalon de arriba (mas angosto, donde va la fila chica y el colimador)
    bloque('tablero', raiz, m['panel'], (0, -0.330, Z_TABLERO - 0.02), (0.62, 0.20, 0.04), bisel=0.012)
    # (20/11, el autor: "hay espacios vacios en los costados a nivel superior"): el escalon de arriba va de punta
    # a punta del tablero —antes era mas angosto y dejaba ver el mamparo en las esquinas—, con un relojito y
    # luces de aviso a cada lado; a la izquierda un panelito gemelo del estante, con dos relojes y llaves
    bloque('tablero_alto', raiz, m['panel'], (0, -0.175, Z_TABLERO - 0.02), (0.66, 0.11, 0.04), bisel=0.012)
    for sg in (-1, 1):
        reloj_hundido(raiz, m, sg * 0.282, -0.200, 0.024, False)
        for k in range(3):
            cilindro_z('aviso', raiz, K['mat_emisivo']('aviso_%d' % k, ('#c9a23a', '#7d2a22', '#3f7d48')[k]),
                       (sg * (0.262 + k * 0.02), -0.150, Z_TABLERO + 0.004), 0.006, 0.004, seg=8)
    bloque('tablero_izq', raiz, m['panel'], (-0.352, -0.305, Z_TABLERO - 0.015), (0.10, 0.16, 0.04), bisel=0.012)
    reloj_hundido(raiz, m, -0.352, -0.262, 0.030, False)
    reloj_hundido(raiz, m, -0.352, -0.335, 0.030, False)
    for k in range(3): tecla(raiz, m, -0.380 + k * 0.028, -0.375, Z_TABLERO + 0.004)
    # LOS COSTADOS DE ARRIBA: una chapa entre la oreja de la visera y el zocalo del canopy, que cierra el hueco
    for sg in (-1, 1):
        bloque('cierre_alto', raiz, m['consola'], (sg * 0.405, -0.20, -0.47), (0.06, 0.16, 0.10), bisel=0.01)
        cilindro_z('perilla_alta', raiz, m['metal'], (sg * 0.405, -0.225, -0.418), 0.009, 0.012, seg=8)
    bloque('tablero_lado', raiz, m['panel'], (0.352, -0.305, Z_TABLERO - 0.015), (0.10, 0.16, 0.04), bisel=0.012)
    bloque('tablero_bajo', raiz, m['panel'], (0, -0.475, Z_TABLERO + 0.01), (0.66, 0.09, 0.05), bisel=0.008)
    for n, (x, y, r) in RELOJES.items(): reloj_hundido(raiz, m, x, y, r, True)
    for (x, y, r) in DECORATIVOS: reloj_hundido(raiz, m, x, y, r, False)
    ex, ey, ew, eh = ESTANTE
    bloque('estante_marco', raiz, m['bisel'], (ex, ey, Z_TABLERO + 0.002), (ew + 0.012, eh + 0.012, 0.005), bisel=0.002)
    pieza('estante_fondo', raiz, m['esfera'], (ew, eh, 0.002), (ex, ey, Z_TABLERO + 0.0055))
    # LA VISERA: el capo negro que se curva sobre el tablero, de punta a punta, con el labio hacia el ojo
    for sg in (-1, 1):
        bloque('visera_lado', raiz, m['visera'], (sg * 0.33, -0.17, -0.47), (0.10, 0.08, 0.16), bisel=0.03)
    bloque('visera', raiz, m['visera'], (0, -0.112, -0.50), (0.58, 0.04, 0.14), bisel=0.02)
    # EL COLIMADOR: la caja sobre la visera, los dos parantes y el vidrio (que no se hornea: ahi va la mira)
    bloque('colimador', raiz, m['visera'], (0, -0.075, -0.50), (0.10, 0.05, 0.10), bisel=0.01)
    for sg in (-1, 1):
        tubo('parante_col', raiz, m['visera'], [(sg * 0.045, -0.05, -0.50), (sg * 0.047, 0.035, -0.53)], 0.0045)
    tubo('techo_col', raiz, m['visera'], [(-0.047, 0.035, -0.53), (0.047, 0.035, -0.53)], 0.0045)
    # LA CONSOLA DEL MEDIO, bajo el tablero: los interruptores y los dos rotulos de emergencia
    for i in range(9):
        if i == 4: continue
        tecla(raiz, m, -0.26 + i * 0.065, -0.455, -0.464)
    franjas(raiz, m, (-0.17, -0.49, -0.463), 0.14, 0.02)
    franjas(raiz, m, (0.17, -0.49, -0.463), 0.14, 0.02)
    cilindro_z('luz_verde', raiz, K['mat_emisivo']('verde', '#4fbf5a'), (-0.05, -0.49, -0.462), 0.008, 0.004, seg=8)
    cilindro_z('fuego', raiz, m['rojo'], (0.28, -0.455, -0.462), 0.012, 0.02, seg=10)
    # EL MARCO DEL PARABRISAS: grueso, negro, con las esquinas de arriba redondeadas
    for sg in (-1, 1):
        tubo('parante', raiz, m['marco'], [(sg * 0.40, -0.13, -0.52), (sg * 0.37, 0.08, -0.47), (sg * 0.33, 0.22, -0.43),
                                         (sg * 0.25, 0.30, -0.40), (sg * 0.10, 0.33, -0.39), (0, 0.335, -0.39)], 0.018)
    # LOS ZOCALOS DEL CANOPY con su acolchado, que bajan desde los costados del parabrisas
    for sg in (-1, 1):
        tubo('zocalo', raiz, m['marco'], [(sg * 0.42, -0.13, -0.52), (sg * 0.46, -0.16, -0.20), (sg * 0.47, -0.17, 0.05)], 0.04)
        bloque('acolchado', raiz, m['acolchado'], (sg * 0.44, -0.24, -0.22), (0.05, 0.12, 0.55), bisel=0.03)
    # LAS CONSOLAS DE LOS COSTADOS: negras, con perillas y relojitos; el ACELERADOR a la izquierda
    for sg in (-1, 1):
        bloque('consola', raiz, m['consola'], (sg * 0.37, -0.36, -0.24), (0.16, 0.06, 0.46), bisel=0.01)
        for i in range(5):
            if sg < 0 and i % 2: continue                          # ahi corre el cuadrante del acelerador
            cilindro_z('perilla', raiz, m['metal'], (sg * (0.33 + (i % 2) * 0.05), -0.322, -0.40 + i * 0.07), 0.010, 0.016, seg=8)
        if sg > 0:
            for i in range(3):
                reloj_hundido_c = (0.40, -0.322, -0.36 + i * 0.09)
                cilindro_z('aro_c', raiz, m['bisel'], reloj_hundido_c, 0.024, 0.01, seg=16)
    # EL ACELERADOR Y LA PALANCA, CADA UNO CON SU MANO, en un GRUPO con su PIVOTE: se hornean aparte y en
    # varias posiciones (ver POSES), y el juego elige la que corresponde a lo que el jugador aprieta
    def grupo(nombre, pivote, construir):
        antes = set(o.name for o in raiz.children)
        construir()
        nuevos = [o for o in raiz.children if o.name not in antes]
        e = bpy.data.objects.new(nombre, None); bpy.context.scene.collection.objects.link(e)
        e.parent = raiz; e.location = pivote
        bpy.context.view_layer.update()
        for o in nuevos:
            mw = o.matrix_world.copy(); o.parent = e; o.matrix_world = mw
        return e
    def acelerador():
        mango_acelerador(raiz, m)
        manos(raiz, K, 'izq')
    G['acelerador'] = grupo('g_acelerador', (-0.34, -0.33, -0.28), acelerador)
    pieza('rotulo_flap', raiz, m['amarillo'], (0.05, 0.016, 0.004), (-0.40, -0.32, -0.46))
    cuadrante(raiz, m)
    # LA PALANCA: el fuste gris con su fuelle, la empuñadura negra con el gatillo y los botones (ver empuñadura)
    def palanca():
        empuñadura(raiz, m)
        manos(raiz, K, 'der')
    G['palanca'] = grupo('g_palanca', (0, -0.80, -0.33), palanca)
    # EL PISO entre las piernas, al fondo
    pieza('piso', raiz, m['piso'], (0.40, 0.01, 0.40), (0, -0.70, -0.45))
    tina(raiz, K)
    return raiz

# LA TINA (el autor, 14/11: "la parte de abajo se ve transparente, rellenar con material"): la cabina es
# una bañera cerrada — el mamparo detras del tablero, las paredes bajo las consolas y el piso — en chapa
# gris oscuro con cuadernas, larguerillos, remaches, mazos de cables y los pedales. Abajo no se ve el
# mundo: solo el parabrisas y el canopy dejan pasar.
CHAPA, CUADERNA, REMACHE, CABLE, CABLE2 = '#2f363b', '#22282c', '#5b656b', '#1a1c1d', '#6b5a2e'

def tina(raiz, K):
    m = {n: K['mat_cel']('tina_' + n, c) for n, c in (('chapa', CHAPA), ('cuaderna', CUADERNA), ('remache', REMACHE),
                                                      ('cable', CABLE), ('cable2', CABLE2), ('piso', PISO), ('metal', METAL))}
    ZM = -0.60                                                    # el mamparo, detras del tablero
    pieza('mamparo', raiz, m['chapa'], (1.04, 0.74, 0.02), (0, -0.62, ZM))
    for sg in (-1, 1):
        pieza('pared', raiz, m['chapa'], (0.02, 0.80, 0.90), (sg * 0.48, -0.61, -0.15))   # sube hasta el zocalo
        pieza('bajo_consola', raiz, m['cuaderna'], (0.16, 0.02, 0.90), (sg * 0.42, -0.40, -0.15))
    pieza('piso_tina', raiz, m['piso'], (1.0, 0.02, 0.90), (0, -0.90, -0.15))
    # las CUADERNAS del mamparo (verticales) y los LARGUERILLOS (horizontales), con sus remaches
    for i in range(-4, 5):
        x = i * 0.115
        if abs(x) < 0.05: continue                                # el hueco de la palanca
        pieza('cuaderna', raiz, m['cuaderna'], (0.022, 0.70, 0.02), (x, -0.62, ZM + 0.015))
        for k in range(10):
            pieza('remache', raiz, m['remache'], (0.006, 0.006, 0.004), (x + 0.017, -0.30 - k * 0.065, ZM + 0.012))
    for y in (-0.55, -0.74):
        pieza('larguerillo', raiz, m['cuaderna'], (1.02, 0.018, 0.016), (0, y, ZM + 0.024))
    # las paredes de los costados: cuadernas que bajan y remaches en fila
    for sg in (-1, 1):
        for k in range(8):
            z = 0.22 - k * 0.11
            pieza('cuaderna_l', raiz, m['cuaderna'], (0.02, 0.76, 0.022), (sg * 0.468, -0.61, z))
            for j in range(7):
                pieza('remache_l', raiz, m['remache'], (0.004, 0.006, 0.006), (sg * 0.469, -0.30 - j * 0.08, z + 0.03))
        # los MAZOS DE CABLES que corren por la pared, con sus abrazaderas
        for (y0, mat) in ((-0.47, 'cable'), (-0.50, 'cable2'), (-0.53, 'cable')):
            tubo('mazo', raiz, m[mat], [(sg * 0.455, y0, 0.25), (sg * 0.455, y0 - 0.02, -0.30),
                                      (sg * 0.46, y0 - 0.06, ZM + 0.04)], 0.009)
        for k in range(4):
            pieza('abrazadera', raiz, m['remache'], (0.03, 0.10, 0.012), (sg * 0.45, -0.51, 0.15 - k * 0.20))
    # el mazo grande que cruza el mamparo bajo el tablero
    tubo('mazo_m', raiz, m['cable'], [(-0.48, -0.58, ZM + 0.04), (-0.15, -0.60, ZM + 0.04), (0.15, -0.60, ZM + 0.04),
                                      (0.48, -0.58, ZM + 0.04)], 0.014)
    tubo('mazo_m2', raiz, m['cable'], [(-0.48, -0.62, ZM + 0.05), (0.48, -0.62, ZM + 0.05)], 0.008)
    # LOS PEDALES del timon, al fondo
    for sg in (-1, 1):
        tubo('brazo_pedal', raiz, m['metal'], [(sg * 0.17, -0.70, ZM + 0.02), (sg * 0.17, -0.80, -0.50)], 0.010)
        bloque('pedal', raiz, m['cuaderna'], (sg * 0.17, -0.81, -0.50), (0.10, 0.12, 0.02), bisel=0.006)
        for k in range(3):
            pieza('estria', raiz, m['remache'], (0.08, 0.008, 0.004), (sg * 0.17, -0.77 - k * 0.035, -0.488))

def anclas(cam):
    """El centro y el radio de cada reloj (y el colimador), proyectados con LA camara: pixeles de 480x270."""
    from bpy_extras.object_utils import world_to_camera_view
    sc = bpy.context.scene
    T = bpy.data.objects['TRES']
    def px(p):
        c = world_to_camera_view(sc, cam, T.matrix_world @ Vector(p))
        return (c.x * W_J, (1 - c.y) * H_J)
    out = {}
    for n, (x, y, r) in RELOJES.items():
        cx, cy = px((x, y, Z_TABLERO + 0.0075)); ex, _ = px((x + r, y, Z_TABLERO + 0.0075))
        out[n] = [round(cx, 2), round(cy, 2), round(ex - cx, 2)]
    ex, ey, ew, eh = ESTANTE
    x0, y0 = px((ex - ew / 2, ey + eh / 2, Z_TABLERO + 0.0075)); x1, y1 = px((ex + ew / 2, ey - eh / 2, Z_TABLERO + 0.0075))
    out['rack'] = [round(x0, 2), round(y0, 2), round(x1, 2), round(y1, 2)]
    out['colimador'] = [round(v, 2) for v in px((0, -0.01, -0.52))]
    out['deco'] = []
    for (x, y, r) in DECO:
        cx, cy = px((x, y, Z_TABLERO + 0.0075)); ex, _ = px((x + r, y, Z_TABLERO + 0.0075))
        out['deco'].append([round(cx, 2), round(cy, 2), round(ex - cx, 2)])
    return out

if __name__ == '__main__':
    H.FW, H.FH = W_J * ESC, H_J * ESC
    sc = H.limpiar()
    T = H.vacio_tres()
    # LA CAMARA DEL JUEGO: en el ojo, mirando a -z; fov horizontal 2·atan(W/2 / F) y el punto principal
    # corrido a la fila HOR (shift: en unidades del lado mayor)
    cd = bpy.data.cameras.new('ojo')
    cd.sensor_fit = 'HORIZONTAL'; cd.lens_unit = 'FOV'
    cd.angle_x = 2 * math.atan((W_J / 2) / F_J)
    cd.shift_y = -(H_J / 2 - HOR_J) / W_J     # el eje cae ARRIBA del centro: el cuadro se corre para abajo
    cd.clip_start, cd.clip_end = 0.01, 20
    cam = bpy.data.objects.new('ojo', cd); sc.collection.objects.link(cam); cam.parent = T
    cam.matrix_basis = H.mirando((0, 0, 0), (0, 0, -1))
    sc.camera = cam
    H.sol(T)
    K = dict(mat_cel=H.mat_cel, mat_cel_nodo=H.mat_cel_nodo, mat_emisivo=H.mat_emisivo, lin=H.lin,
             perilla=H.perilla, mezcla=H.mezcla, ocultar_si=H.ocultar_si, controles=False)
    cabina(T, K)
    os.makedirs(OUT, exist_ok=True)
    todos = [o for o in bpy.data.objects if o.type == 'MESH']
    de = lambda g: set(o.name for o in g.children_recursive)
    def solo(nombres):
        for o in todos: o.hide_render = o.name not in nombres
    def foto(nombre):
        bpy.context.view_layer.update()
        sc.render.filepath = os.path.join(OUT, nombre)
        bpy.ops.render.render(write_still=True)
    # LA BASE, sin palanca ni acelerador (van en sus capas)
    movil = de(G['palanca']) | de(G['acelerador'])
    solo(set(o.name for o in todos) - movil); foto('cabina.png')
    # LA PALANCA, fila = cabeceo (0 picar, 1 centro, 2 trepar), columna = lado (0 izq, 1 centro, 2 der)
    solo(de(G['palanca']))
    for j in (-1, 0, 1):
        for i in (-1, 0, 1):
            G['palanca'].rotation_euler = (j * PALANCA_CABECEO, 0, -i * PALANCA_LADO)
            foto('palanca_%d_%d.png' % (j + 1, i + 1))
    G['palanca'].rotation_euler = (0, 0, 0)
    # EL ACELERADOR: 0 freno (atras), 1 normal, 2 turbo (adelante)
    solo(de(G['acelerador']))
    for k in (-1, 0, 1):
        G['acelerador'].rotation_euler = (-k * ACELERADOR_RECORRIDO, 0, 0)
        foto('acelerador_%d.png' % (k + 1))
    G['acelerador'].rotation_euler = (0, 0, 0)
    json.dump(anclas(cam), open(os.path.join(OUT, 'anclas.json'), 'w'), indent=1)
    print('HORNEADO', OUT)
