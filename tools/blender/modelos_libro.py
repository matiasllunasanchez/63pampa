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
