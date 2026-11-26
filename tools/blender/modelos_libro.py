# LOS MODELOS QUE SOLO EXISTEN PARA LAS LAMINAS DEL LIBRO DE VUELO (23/11/2026) — los dibujos de linea
# de las tarjetas de contexto (tools/blender/hornear_laminas.py). No van al juego: no tienen pintura ni
# hoja; solo tienen que dar buenas ARISTAS para el Freestyle.
#
# EL HMS INVINCIBLE (R05), como estaba el 30 de mayo de 1982: 209 m de eslora, la cubierta de vuelo
# corrida y mas ancha que el casco (sobresale a babor), la RAMPA DE SALTO de 7° en la proa a BABOR, el
# lanzador doble del Sea Dart en el castillo de proa a estribor de la rampa, y la ISLA LARGA A ESTRIBOR
# con sus dos chimeneas grandes, el palo de proa con el radar 1022, el palo mayor con el 992 y los domos
# del 909 en las dos puntas.
#
# Espacio de three: y arriba, proa hacia -z, estribor +x. Eslora L = 10 (el origen es la flotacion).
# Sin biseles: las cajas a canto vivo dan una sola linea por arista (el bisel del horno daria tres).
import importlib.util, math, os

AQUI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('modelos_bl_base_lib', os.path.join(AQUI, 'modelos.py'))
M = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(M)
_specb = importlib.util.spec_from_file_location('modelos_buques_lib', os.path.join(AQUI, 'modelos_buques.py'))
B = importlib.util.module_from_spec(_specb); _specb.loader.exec_module(B)
loft, elipsoide, caja = M.loft, M.elipsoide, M.caja

L = 10.0
K_M = L / 209.0            # unidades por metro


def _cuna(nombre, raiz, mat, x0, x1, z_popa, z_proa, y, alto):
    """La rampa: una cuña que sube de la cubierta (popa, alto 0) a la proa (alto `alto`)."""
    import bpy, bmesh
    bm = bmesh.new()
    v = [bm.verts.new(c) for c in ((x0, y, z_popa), (x1, y, z_popa), (x1, y, z_proa), (x0, y, z_proa),
                                   (x1, y + alto, z_proa), (x0, y + alto, z_proa))]
    bm.faces.new((v[0], v[1], v[2], v[3]))           # abajo
    bm.faces.new((v[0], v[5], v[4], v[1]))           # la rampa
    bm.faces.new((v[3], v[2], v[4], v[5]))           # el frente
    bm.faces.new((v[0], v[3], v[5]))                 # costado babor
    bm.faces.new((v[1], v[4], v[2]))                 # costado estribor
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    return M._obj(nombre, me, raiz, mat)


def invincible(T, K):
    raiz = B._raiz(T, 'Invincible')
    mat = K['mat_cel']('gris', '#646e75')
    m = lambda x: x * K_M
    franco, manga = m(12.5), m(27.5)
    # EL CASCO, sin obra viva (fondo en la flotacion: la arista de abajo es la linea de agua)
    B.casco(raiz, mat, L, manga, franco, 0.05, 0.015, arrufo=0.05, fondo=0.0)
    # LA CUBIERTA DE VUELO: corrida, gruesa, corrida a BABOR (la cubierta del Invincible es asimetrica)
    yc = franco + 0.02
    caja('cubierta', (-m(2.5), yc + m(1.0), L * 0.06), (m(33.0), m(2.0), L * 0.80), raiz, mat)
    # LA RAMPA DE SALTO (7°): a babor, en la proa, de 0,13 L de largo
    zr0, zr1 = -L * 0.34, -L * 0.47
    _cuna('rampa', raiz, mat, -m(17.5), -m(2.0), zr0, zr1, yc + m(2.0), math.tan(math.radians(9)) * (zr0 - zr1))
    caja('rampa_base', (-m(9.75), yc + m(1.0), (zr0 + zr1) / 2), (m(15.5), m(2.0), zr0 - zr1), raiz, mat)
    # EL CASTILLO DE PROA a estribor, un piso mas abajo, con el SEA DART: la base y los dos brazos
    zd = -L * 0.415
    caja('sd_base', (m(5.5), franco + m(1.2), zd), (m(5.0), m(2.4), m(6.0)), raiz, mat)
    caja('sd_torre', (m(5.5), franco + m(3.0), zd + m(0.5)), (m(3.2), m(1.6), m(3.4)), raiz, mat)
    for sg in (-1, 1):
        mi = loft('sea_dart', [(0, m(0.35), m(0.35), 0), (-m(1.0), m(0.45), m(0.45), 0), (-m(5.2), m(0.45), m(0.45), 0),
                               (-m(6.2), m(0.05), m(0.05), 0)], raiz, mat, n=8, cerrar=(True, True))
        mi.rotation_euler = (math.radians(22), 0, 0)
        mi.location = (m(5.5) + sg * m(1.1), franco + m(4.4), zd + m(1.6))
    # LA ISLA, a estribor, LARGA: dos pisos corridos y el puente adelante
    ix = m(10.5)
    zi0, zi1 = -L * 0.12, L * 0.23
    caja('isla1', (ix, yc + m(2.0) + m(4.0), (zi0 + zi1) / 2), (m(6.0), m(8.0), zi1 - zi0), raiz, mat)
    caja('isla2', (ix, yc + m(2.0) + m(8.0) + m(3.5), (zi0 + zi1) / 2 + m(3.0)), (m(5.0), m(7.0), (zi1 - zi0) * 0.78), raiz, mat)
    caja('puente', (ix, yc + m(2.0) + m(15.0) + m(1.8), zi0 + m(9.0)), (m(4.6), m(3.6), m(12.0)), raiz, mat)
    ytope = yc + m(2.0) + m(15.0)
    # LAS DOS CHIMENEAS: grandes, ovaladas, apenas echadas a popa
    for zc, alto in ((-L * 0.015, m(10.0)), (L * 0.165, m(9.0))):
        B.columna('chimenea', raiz, mat, ix, zc, [(ytope - m(2.0), m(3.0), m(6.0)), (ytope + alto * 0.8, m(2.8), m(5.6)),
                                                   (ytope + alto, m(2.6), m(5.2))], inclina=0.10)
    # EL PALO DE PROA (radar 1022: la "pantalla" de traves) y el PALO MAYOR entre las chimeneas (992)
    zp = -L * 0.075
    caja('palo_proa', (ix, ytope + m(6.0), zp), (m(1.2), m(12.0), m(1.2)), raiz, mat)
    caja('radar1022', (ix, ytope + m(13.0), zp), (m(1.0), m(3.0), m(8.0)), raiz, mat)
    zm = L * 0.075
    caja('palo_mayor', (ix, ytope + m(7.5), zm), (m(1.2), m(15.0), m(1.2)), raiz, mat)
    caja('cruceta', (ix, ytope + m(12.0), zm), (m(7.0), m(0.6), m(0.8)), raiz, mat)
    caja('radar992', (ix, ytope + m(15.8), zm), (m(1.0), m(2.2), m(5.0)), raiz, mat)
    # LOS DOMOS DEL 909, uno en cada punta de la isla
    for z, y in ((zi0 + m(3.0), ytope + m(4.0)), (zi1 - m(5.0), yc + m(2.0) + m(15.0) + m(2.5))):
        caja('base909', (ix, y - m(2.2), z), (m(2.6), m(2.6), m(2.6)), raiz, mat)
        elipsoide('radomo909', (ix, y, z), (m(2.4), m(2.4), m(2.4)), raiz, mat, seg=16, anillos=10)
    return raiz


# ============================ EL EXOCET AM39 ============================
# El misil solo, para su lamina (la capa `supere__exocet` del juego lleva las alas como cajas: a este
# tamaño se leen como ladrillos). 4,69 m de largo, 0,348 m de diametro, 1,10 m de envergadura: la ojiva
# del buscador, el cuerpo recto, las CUATRO ALAS en cruz (delta recortada) a media eslora y los CUATRO
# TIMONES de cola alineados con ellas. En metros; proa hacia -z.
def _aleta(nombre, raiz, mat, z_raiz0, z_raiz1, z_punta0, z_punta1, r, envergadura, giro, espesor=0.018):
    """Una aleta plana con planta de trapecio, pegada al cuerpo (radio r) y girada `giro` alrededor del eje."""
    import bpy, bmesh
    bm = bmesh.new()
    pl = [(r * 0.9, z_raiz0), (r * 0.9, z_raiz1), (r + envergadura, z_punta1), (r + envergadura, z_punta0)]
    arriba = [bm.verts.new((x, espesor / 2, z)) for x, z in pl]
    abajo = [bm.verts.new((x, -espesor / 2, z)) for x, z in pl]
    bm.faces.new(arriba); bm.faces.new(list(reversed(abajo)))
    for i in range(4):
        j = (i + 1) % 4
        bm.faces.new((arriba[i], abajo[i], abajo[j], arriba[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    ob = M._obj(nombre, me, raiz, mat)
    ob.rotation_euler = (0, 0, giro)
    return ob

def exocet_am39(T, K):
    raiz = B._raiz(T, 'Exocet AM39')
    mat = K['mat_cel']('exocet', '#d9d8cc')
    Lm, r = 4.69, 0.174
    z0 = -Lm / 2
    perfil = [(0.0, 0.05), (0.04, 0.42), (0.09, 0.70), (0.15, 0.90), (0.22, 1.0), (0.985, 1.0), (1.0, 0.86)]
    M.loft('cuerpo', [(z0 + f * Lm, r * k, r * k, 0) for f, k in perfil], raiz, mat, n=24, expo=2.0, cerrar=(True, True))
    # los anillos de las juntas (buscador / carga / motor): apenas un escalon para que den linea
    for f in (0.22, 0.47):
        M.loft('junta', [(z0 + f * Lm - 0.01, r * 1.035, r * 1.035, 0), (z0 + f * Lm + 0.01, r * 1.035, r * 1.035, 0)],
               raiz, mat, n=24, expo=2.0, cerrar=(True, True))
    for k in range(4):
        g = math.pi / 4 + k * math.pi / 2
        # LAS ALAS: delta recortada, raiz de 0,95 m, punta de 0,22 m
        _aleta('ala', raiz, mat, z0 + 0.52 * Lm, z0 + 0.72 * Lm, z0 + 0.665 * Lm, z0 + 0.715 * Lm, r, 0.38, g)
        # LOS TIMONES de cola
        _aleta('timon', raiz, mat, z0 + 0.885 * Lm, z0 + 0.975 * Lm, z0 + 0.935 * Lm, z0 + 0.975 * Lm, r, 0.24, g)
    return raiz


# ============================ EL CRUCERO GENERAL BELGRANO, HUNDIENDOSE ============================
# (25/11/2026, el autor con la foto del hundimiento: "diseñá y horneá un Belgrano con los botes salvavidas naranjas
# alrededor"). Para la lamina del ANTES de r6 (EL RESCATE DEL BELGRANO): la tarde del 2 de mayo de 1982, escorado a
# BABOR, con la proa —la arrancó el torpedo— metida en el agua, y las balsas autoinflables alrededor
# (tools/blender/modelos_rescate.py, la misma que reparte la busqueda en el mar).
# El ex USS Phoenix, clase Brooklyn: 185,4 m de eslora, 21 m de manga. Castillo de proa largo; TRES TORRES triples de
# 152 mm adelante (la B por encima de la A) y DOS atras (la X por encima de la Y); la superestructura en dos bloques con
# el puente alto, DOS CHIMENEAS, el palo trípode de proa con su radar y el de popa; la GRUA de los hidroaviones en el
# espejo. Espacio de three: y arriba, proa hacia -z, estribor +x. Eslora L = 10; el origen es la flotacion.
K_B = L / 185.4

def _torre(raiz, mat, z, y, ang=0.0, rev=False):
    """Una torre triple de 152 mm: la casamata con su frente inclinado y los tres caños."""
    m = lambda x: x * K_B
    caja('torre', (0, y + m(1.6), z), (m(9.0), m(3.2), m(8.5)), raiz, mat)
    caja('torre_techo', (0, y + m(3.4), z + (m(0.8) if not rev else -m(0.8))), (m(7.0), m(0.5), m(6.0)), raiz, mat)
    s = -1 if not rev else 1
    for dx in (-m(2.4), 0, m(2.4)):
        c = caja('cano', (dx, y + m(1.8), z + s * m(4.25 + 5.0)), (m(0.55), m(0.55), m(10.0)), raiz, mat)
        c.rotation_euler = (math.radians(-4 * s), 0, 0)

def _barbeta(raiz, mat, z, y0, y1):
    m = lambda x: x * K_B
    B.columna('barbeta', raiz, mat, 0, z, [(y0, m(4.6), m(4.6)), (y1, m(4.6), m(4.6))], expo=2.0)

def _cortar_agua(raiz, y=0.0):
    """La LINEA DE AGUA: aplica la pose y corta cada malla en el plano del agua (lo de abajo se va). El borde del corte
    es la linea que el Freestyle dibuja donde el buque entra al mar."""
    import bpy, bmesh
    from mathutils import Vector, Matrix
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    for ob in [o for o in raiz.children_recursive if o.type == 'MESH']:
        ev = ob.evaluated_get(dg)
        me = bpy.data.meshes.new_from_object(ev)
        me.transform(ob.matrix_world)
        bm = bmesh.new(); bm.from_mesh(me)
        geo = bm.verts[:] + bm.edges[:] + bm.faces[:]
        bmesh.ops.bisect_plane(bm, geom=geo, plane_co=Vector((0, 0, y)), plane_no=Vector((0, 0, 1)), clear_inner=True)
        bm.to_mesh(me); bm.free()
        ob.modifiers.clear()
        ob.data = me
        ob.matrix_world = Matrix.Identity(4)      # (sigue colgado de la raiz: el encuadre la recorre)
        if not len(me.polygons): ob.hide_render = True


def belgrano_hundiendose(T, K, balsas=True):
    import bpy
    raiz = B._raiz(T, 'Belgrano')
    mat = K['mat_cel']('gris', '#6a7378')
    m = lambda x: x * K_B
    franco, manga = m(8.5), m(21.0)
    buque = B._vacio(raiz, 'buque')
    # EL CASCO con su castillo de proa (el arrufo lo levanta adelante) y la obra viva: se hunde, asi que se ve el costado
    B.casco(buque, mat, L, manga, franco, 0.06, 0.02, arrufo=0.10, fondo=-0.35)
    yc = franco
    # LAS TORRES DE PROA: A en cubierta, B por encima (barbeta), C detras a la altura de A
    zA, zB = -L * 0.33, -L * 0.265
    _torre(buque, mat, zA, yc)
    _barbeta(buque, mat, zB, yc, yc + m(3.0)); _torre(buque, mat, zB, yc + m(3.0))
    # LA SUPERESTRUCTURA DE PROA: el bloque del puente, alto, y el puente arriba
    zs = -L * 0.17
    caja('bloque_proa', (0, yc + m(5.0), zs), (m(13.0), m(10.0), m(16.0)), buque, mat)
    caja('puente', (0, yc + m(12.0), zs - m(2.0)), (m(11.0), m(4.0), m(9.0)), buque, mat)
    caja('director', (0, yc + m(16.0), zs - m(1.0)), (m(4.5), m(3.0), m(5.0)), buque, mat)
    # EL PALO TRIPODE de proa con la verga y el radar arriba
    yp = yc + m(17.5)
    caja('palo_proa', (0, yp + m(9.0), zs + m(2.0)), (m(1.0), m(18.0), m(1.0)), buque, mat)
    for sg in (-1, 1):
        p = caja('pata', (sg * m(2.2), yp + m(5.0), zs + m(4.5)), (m(0.6), m(12.0), m(0.6)), buque, mat)
        p.rotation_euler = (math.radians(-18), 0, math.radians(sg * 10))
    caja('verga', (0, yp + m(14.0), zs + m(2.0)), (m(10.0), m(0.5), m(0.6)), buque, mat)
    caja('radar_proa', (0, yp + m(18.8), zs + m(2.0)), (m(5.5), m(2.6), m(0.8)), buque, mat)
    # LAS DOS CHIMENEAS, entre los dos bloques
    for zc in (-L * 0.055, L * 0.03):
        B.columna('chimenea', buque, mat, 0, zc, [(yc + m(6.0), m(3.4), m(4.6)), (yc + m(17.0), m(3.2), m(4.3)), (yc + m(19.0), m(3.0), m(4.0))], inclina=0.04)
    caja('casamata', (0, yc + m(3.0), -L * 0.01), (m(16.0), m(6.0), m(34.0)), buque, mat)
    # EL BLOQUE DE POPA con el palo mayor (con su radar) y los botes
    zp = L * 0.12
    caja('bloque_popa', (0, yc + m(5.0), zp), (m(12.0), m(10.0), m(12.0)), buque, mat)
    caja('palo_popa', (0, yc + m(16.0), zp), (m(1.0), m(14.0), m(1.0)), buque, mat)
    caja('radar_popa', (0, yc + m(22.5), zp), (m(4.0), m(2.4), m(0.7)), buque, mat)
    for sg in (-1, 1):
        for dz in (-m(6.0), m(2.0)):
            elipsoide('bote', (sg * m(7.2), yc + m(7.0), zp + dz), (m(1.3), m(1.0), m(4.0)), buque, mat, seg=10, anillos=5)
    # LAS TORRES DE POPA: X por encima, Y en cubierta (miran a popa)
    zX, zY = L * 0.235, L * 0.30
    _barbeta(buque, mat, zX, yc, yc + m(3.0)); _torre(buque, mat, zX, yc + m(3.0), rev=True)
    _torre(buque, mat, zY, yc, rev=True)
    # LA GRUA del espejo (la de los hidroaviones), echada hacia popa
    g = caja('grua', (0, yc + m(7.0), L * 0.45), (m(0.9), m(14.0), m(0.9)), buque, mat)
    g.rotation_euler = (math.radians(28), 0, 0)
    # LA POSE DEL HUNDIMIENTO: escorado ~22° a babor (sube estribor: +x arriba) y la proa metida (sin la proa que
    # arranco el torpedo), un poco hundido entero
    buque.rotation_euler = (math.radians(-9), 0, math.radians(26))
    buque.location = (0, -m(5.5), 0)
    # LAS BALSAS alrededor, del lado de BABOR (el que baja) y por la popa — exageradas: a esta escala una de 2,8 m es un punto
    if balsas:
        R = importlib.util.spec_from_file_location('modelos_rescate_lib', os.path.join(AQUI, 'modelos_rescate.py'))
        MR = importlib.util.module_from_spec(R); R.loader.exec_module(MR)
        k = K_B * 2.2
        lugares = [(-0.13 * L, 0.20 * L, 30), (-0.19 * L, 0.05 * L, 160), (-0.16 * L, -0.12 * L, 250), (-0.24 * L, 0.30 * L, 80),
                   (-0.09 * L, 0.38 * L, 200), (-0.27 * L, -0.03 * L, 320), (0.02 * L, 0.52 * L, 120), (-0.33 * L, 0.18 * L, 10),
                   (-0.12 * L, -0.30 * L, 290), (0.14 * L, 0.46 * L, 45)]
        for i, (x, z, giro) in enumerate(lugares):
            piv = B._vacio(raiz, 'balsa_%d' % i)
            MR.balsa_salvavidas(piv, K)
            piv.scale = (k, k, k)
            piv.location = (x, -0.05 * k, z)
            piv.rotation_euler = (math.radians(6 * ((i % 3) - 1)), math.radians(giro), math.radians(5 * ((i % 2) * 2 - 1)))
    _cortar_agua(raiz, 0.0)
    return raiz


# LAS BALSAS DEL BELGRANO, DE CERCA (26/11, el autor: "otro diseño de balsas aca" — la hoja LAS BALSAS usaba la misma
# lamina del crucero): cinco balsas salvavidas (modelos_rescate.py, la de carpa con los naufragos asomados) juntas y a
# su tamaño, cada una con su ola (se inclinan distinto), cortadas en la linea del agua.
def balsas_grupo(T, K, humo=False):
    # (26/11, despues: "no parecen balsas, mejorar que parezcan carpas y dibujar un poco el agua"): la carpa mas ALTA (la
    # cupula estirada para arriba se lee como carpa y no como hongo), las bocas abiertas hacia la camara, y el MAR: crestas
    # de ola bajas y largas, cortadas en la linea del agua, que dejan sus curvas alrededor de las balsas
    R = importlib.util.spec_from_file_location('modelos_rescate_lib', os.path.join(AQUI, 'modelos_rescate.py'))
    MR = importlib.util.module_from_spec(R); R.loader.exec_module(MR)
    raiz = B._raiz(T, 'Balsas')
    mat = K['mat_cel']('mar', '#2a4a5a')
    lugares = [(0.0, 0.0, 275, 0.0), (-3.4, 2.2, 250, 0.06), (3.3, 1.6, 300, -0.05), (-0.6, 5.2, 265, 0.1)]
    for i, (x, z, giro, alza) in enumerate(lugares):
        piv = B._vacio(raiz, 'balsa_%d' % i)
        MR.balsa_salvavidas(piv, K)
        piv.scale = (1.0, 1.55, 1.0)
        piv.location = (x, alza - 0.15, z)
        piv.rotation_euler = (math.radians(6 * ((i % 3) - 1)), math.radians(giro), math.radians(5 * ((i % 2) * 2 - 1)))
    # LAS OLAS: cintas finas y onduladas que asoman apenas del agua — de arriba se leen como las lineas de un mar picado
    import bpy, bmesh
    for f, zf in enumerate((-2.6, -1.0, 0.7, 2.4, 4.1, 5.8, 7.4)):
        bm = bmesh.new(); arriba, abajo = [], []
        ph = f * 1.9
        xs = [-6.3 + k * 0.3 for k in range(43)]
        for xx in xs:
            zz = zf + 0.28 * math.sin(xx * 1.1 + ph) + 0.12 * math.sin(xx * 2.7 + ph * 0.5)
            abajo.append(bm.verts.new((xx, -0.02, zz))); arriba.append(bm.verts.new((xx, 0.07, zz)))
        for k in range(len(xs) - 1):
            mx = xs[k]
            if any(abs(mx - x) < 1.7 and abs(zf - z) < 1.9 for x, z, _, _ in lugares): continue   # (detras de una balsa no)
            bm.faces.new((abajo[k], abajo[k + 1], arriba[k + 1], arriba[k]))
        me = bpy.data.meshes.new('ola_%d' % f); bm.to_mesh(me); bm.free()
        ob = bpy.data.objects.new('ola_%d' % f, me); bpy.context.collection.objects.link(ob); ob.parent = raiz
        ob.data.materials.append(mat)
    # EL HUMO (26/11, la hoja LAS BALSAS: "como debe quedar el espacio con las balsas y el humo"): el marcador flotando al
    # lado de las balsas y la columna que sube y se abre, tirada por el viento hacia un costado
    if humo:
        mh = K['mat_cel']('humo', '#d8d8d8')
        hx, hz = 1.6, -1.6
        elipsoide('marcador', (hx, 0.05, hz), (0.22, 0.18, 0.22), raiz, mh, seg=10, anillos=5)
        for k in range(12):
            u = k / 11.0
            r = (0.35 + 1.0 * u) * (0.8 + 0.35 * abs(math.sin(k * 2.3)))
            x = hx + 2.8 * u * u + 0.45 * math.sin(k * 2.1) * u
            elipsoide('humo', (x, 0.35 + k * 0.55, hz - 0.5 * u + 0.35 * math.cos(k * 1.7) * u), (r * 1.15, r * 0.75, r), raiz, mh, seg=12, anillos=6)
    _cortar_agua(raiz, 0.0)
    return raiz
