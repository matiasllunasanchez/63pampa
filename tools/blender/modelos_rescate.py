# EL RESCATE DEL BELGRANO (libro de vuelo r6, 25/11/2026) — los modelos del agua.
#
# El autor, con las fotos del hundimiento y del rescate: "diseñá y horneá un Belgrano con los botes salvavidas naranjas
# alrededor; son como botes con carpitas naranjas"; "los botes horneálos por separado así los podemos repartir en todo
# alrededor". La BALSA va sola (assets/mallas/balsa.js, la reparte systems/islas/busqueda3d.js); el crucero hundiéndose
# es solo para la lámina de la tarjeta de contexto (modelos_libro.py `belgrano_hundiendose`), que la usa también.
#
# LA BALSA AUTOINFLABLE de las fotos (las de 20-25 personas de los buques de la Armada): redonda, de unos 2,6 m, DOS
# TUBOS apilados naranjas, el piso oscuro, la CARPA naranja en cúpula sostenida por un arco inflable, y la ENTRADA
# abierta —el agujero oscuro— con náufragos asomados (uno de campera amarilla, como en la foto del Piedra Buena).
# En METROS (--k 1), y arriba, la entrada hacia −z. Pocas caras: a la distancia de la búsqueda es una mancha naranja.
import bpy, bmesh, importlib.util, math, os
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('modelos_bl_base_res', os.path.join(AQUI, 'modelos.py'))
M = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(M)
elipsoide, caja = M.elipsoide, M.caja


def _raiz(T, nombre):
    r = bpy.data.objects.new(nombre, None)
    bpy.context.scene.collection.objects.link(r)
    r.parent = T
    return r


def _toro(nombre, raiz, mat, R, r, y, seg=18, lados=6):
    """Un tubo inflable: un toro acostado (eje y) de radio mayor R y menor r, a la altura y."""
    bm = bmesh.new(); anillos = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        anillos.append([bm.verts.new(((R + r * math.cos(2 * math.pi * j / lados)) * math.cos(a), y + r * math.sin(2 * math.pi * j / lados),
                                      (R + r * math.cos(2 * math.pi * j / lados)) * math.sin(a))) for j in range(lados)])
    for i in range(seg):
        A, Bn = anillos[i], anillos[(i + 1) % seg]
        for j in range(lados): bm.faces.new((A[j], A[(j + 1) % lados], Bn[(j + 1) % lados], Bn[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    return M._obj(nombre, me, raiz, mat)


def _arco(nombre, raiz, mat, R, y0, alto, r, seg=10, lados=5):
    """El ARCO inflable que sostiene la carpa: medio toro parado, de lado a lado (plano x-y)."""
    bm = bmesh.new(); anillos = []
    for i in range(seg + 1):
        a = math.pi * i / seg
        cx, cy = R * math.cos(a), y0 + alto * math.sin(a)
        nx, ny = math.cos(a), math.sin(a) * (alto / R)
        n = math.hypot(nx, ny); nx, ny = nx / n, ny / n
        anillos.append([bm.verts.new((cx + r * math.cos(2 * math.pi * j / lados) * nx, cy + r * math.cos(2 * math.pi * j / lados) * ny,
                                      r * math.sin(2 * math.pi * j / lados))) for j in range(lados)])
    for i in range(seg):
        A, Bn = anillos[i], anillos[i + 1]
        for j in range(lados): bm.faces.new((A[j], A[(j + 1) % lados], Bn[(j + 1) % lados], Bn[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    return M._obj(nombre, me, raiz, mat)


def balsa_salvavidas(T, K):
    raiz = _raiz(T, 'Balsa salvavidas')
    tubo = K['mat_cel']('tubo', '#d9531e')          # el naranja de los tubos, un poco mas oscuro que la carpa
    lona = K['mat_cel']('carpa', '#f26a1f')         # la carpa
    arco = K['mat_cel']('arco', '#c2471a')
    piso = K['mat_cel']('piso', '#2a2622')
    hueco = K['mat_cel']('hueco', '#17130f')        # la entrada abierta: adentro esta oscuro
    amarillo = K['mat_cel']('campera', '#e8c21c')
    oscuro = K['mat_cel']('ropa', '#2b3038')
    piel = K['mat_cel']('piel', '#c99a78')
    R = 1.15
    # EL PISO (la parte de abajo, oscura: lo que asoma cuando la ola la inclina) y los DOS TUBOS apilados
    elipsoide('piso', (0, 0.02, 0), (R + 0.2, 0.12, R + 0.2), raiz, piso, seg=14, anillos=4)
    _toro('tubo_bajo', raiz, tubo, R, 0.24, 0.18)
    _toro('tubo_alto', raiz, tubo, R, 0.22, 0.58)
    # LA CARPA: la cupula naranja sobre el tubo de arriba, y el ARCO que la sostiene (cruza de babor a estribor)
    elipsoide('carpa', (0, 0.62, 0), (R + 0.05, 0.95, R + 0.05), raiz, lona, seg=16, anillos=8)
    _arco('arco', raiz, arco, R + 0.02, 0.62, 1.0, 0.09)
    # LA ENTRADA, abierta hacia -z: el agujero oscuro en la carpa, con su faldon recogido arriba
    elipsoide('entrada', (0, 0.95, -R + 0.02), (0.62, 0.42, 0.16), raiz, hueco, seg=12, anillos=6)
    elipsoide('faldon', (0, 1.38, -R + 0.12), (0.58, 0.12, 0.14), raiz, arco, seg=10, anillos=4)
    # LOS NAUFRAGOS asomados en la boca: uno de campera AMARILLA y otro de oscuro, recostados sobre el tubo
    for x, ropa in ((-0.26, amarillo), (0.3, oscuro)):
        elipsoide('torso', (x, 0.86, -R - 0.02), (0.2, 0.17, 0.15), raiz, ropa, seg=8, anillos=5)
        elipsoide('cabeza', (x + 0.04, 1.06, -R - 0.04), (0.1, 0.11, 0.1), raiz, piel, seg=8, anillos=5)
    # LA SOGA de rescate alrededor (las fotos: la linea de agarre por fuera del tubo de abajo)
    _toro('soga', raiz, K['mat_cel']('soga', '#e6dfcf'), R + 0.25, 0.025, 0.24, seg=18, lados=3)
    return raiz
