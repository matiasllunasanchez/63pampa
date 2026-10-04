# LOS BUQUES, HECHOS EN BLENDER (4/10/2026). Reemplazan a los de tools/models/buques.js (y a la fragata
# y la barcaza de tools/models/enemies.js) que pasaban por el puente tal cual: cascos de rodajas
# escalonadas y superestructura de cajas apiladas.
#
# LO QUE CAMBIA:
#   · EL CASCO es una superficie de verdad (`casco`): costados con abanico (la cubierta mas ancha que
#     la flotacion), la roda LANZADA que se afila en V hacia abajo, el arrufo que levanta la proa, la
#     popa de espejo, la faja negra de flotacion y la cubierta mas oscura — pintadas, no apoyadas.
#   · LA SUPERESTRUCTURA va en bloques BISELADOS, con los ventanales del puente encendidos (el toque
#     de atardecer que ya tenian), y cada clase lleva sus señas de verdad: el radar "somier" y la
#     chimenea grande del Tipo 42, los Exocet y la proa de clipper del Tipo 21, las grúas y la carga
#     del logistico, la rampa de salto y la isla a estribor del portaaviones.
#
# LO QUE NO CAMBIA: la ESLORA (L = 10), la manga, el francobordo y DONDE va cada cosa son los de
# buques.js — la hoja sale del mismo tamaño y las zonas del juego siguen cayendo en su lugar. El origen
# es la LINEA DE FLOTACION (el horno recorta abajo, `clipY`), proa hacia -z, y arriba.
import importlib.util, math, os
import bpy, bmesh

AQUI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('modelos_bl_base_b', os.path.join(AQUI, 'modelos.py'))
M = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(M)
loft, elipsoide, caja, _subdiv, mat_pintura, _obj = M.loft, M.elipsoide, M.caja, M._subdiv, M.mat_pintura, M._obj

L = 10
GRIS, GRIS_SUP, CUBIERTA, METAL, FAJA = '#646e75', '#737d84', '#474e54', '#2a3035', '#1b1f22'
VENTANAL, RADOMO, MISIL = '#e0ad5c', '#c9cfd2', '#d8dde0'
CARGA, CARGA2, GRUA = '#6a5a45', '#7f6d52', '#8a7850'

def _raiz(T, nombre):
    r = bpy.data.objects.new(nombre, None)
    bpy.context.scene.collection.objects.link(r)
    r.parent = T
    return r

def _vacio(padre, nombre='grupo'):
    e = bpy.data.objects.new(nombre, None)
    bpy.context.scene.collection.objects.link(e)
    e.parent = padre
    return e

# ============================ LAS PIEZAS ============================
def casco(raiz, mat, largo, manga, franco, lanz, popa, arrufo=0.12, z0=0.0, fondo=-0.25, barcaza=False, nu=48, nv=9):
    """EL CASCO, como superficie: anillos de costado (estribor de abajo a arriba, babor de arriba a
    abajo) a lo largo de la eslora. Por altura `v` (0 = bajo el agua, 1 = cubierta):
      · la ROda se mete hacia atras al bajar (`lanz`) y la popa se recoge abajo (`popa`);
      · la PLANTA se afina hacia proa — en V abajo, llena arriba —, y apenas hacia el espejo;
      · el ABANICO: la manga en cubierta es mayor que en la flotacion;
      · el ARRUFO levanta la cubierta en el tercio de proa.
    `barcaza`: proa chata (la de la barcaza de desembarco), sin afinar."""
    bm = bmesh.new(); anillos = []
    for iu in range(nu + 1):
        u = iu / nu
        der, izq = [], []
        for iv in range(nv + 1):
            v = iv / nv
            zf = -largo / 2 + lanz * largo * (1 - v) ** 0.7
            za = largo / 2 - popa * largo * max(0.0, (0.35 - v) / 0.35)
            z = z0 + zf + u * (za - zf)
            if barcaza:
                p = 0.92 + 0.08 * min(1.0, u / 0.06)
            else:
                t = min(1.0, u / 0.34)
                p_lleno = (1 - (1 - t) ** 2) ** 0.5
                p_v = t ** 1.1
                p = max(0.015, p_v + (p_lleno - p_v) * v)
            s = 1.0 if u < 0.78 else 1 - 0.12 * (u - 0.78) / 0.22
            media = manga / 2 * p * s * (0.84 + 0.16 * v)
            y = fondo + (franco * (1 + arrufo * max(0.0, 1 - u / 0.38)) - fondo) * v
            der.append((media, y, z)); izq.append((-media, y, z))
        anillos.append([bm.verts.new(c) for c in der + list(reversed(izq))])
    n = len(anillos[0])
    for a, b in zip(anillos, anillos[1:]):
        for i in range(n):
            bm.faces.new((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
    bm.faces.new(list(reversed(anillos[0]))); bm.faces.new(anillos[-1])
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new('casco'); bm.to_mesh(me); bm.free()
    me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(38))
    return _obj('casco', me, raiz, mat)

def _tono(hexs, k):
    h = hexs.lstrip('#')
    return '#' + ''.join('%02x' % max(0, min(255, int(int(h[i:i + 2], 16) * k))) for i in (0, 2, 4))

def pintura_casco(K, gris=GRIS, cubierta=CUBIERTA, faja=0.09, franco=0.62, numero=None):
    """El casco gris EN TRES FAJAS de tono (la de arriba toma el sol bajo la borda, la de abajo ya esta
    en sombra: de costado el casco es casi un plano y sin esto se lee como una chapa lisa), la FAJA
    negra de flotacion, la cubierta mas oscura en lo que mira para arriba y el NUMERO de casco en la
    amura (`numero` = lista de rectangulos (z0, z1) a lo largo de la proa: los trazos del D80)."""
    marcas = [dict(y=(franco * 0.62, 9), color=_tono(gris, 1.10), arriba=False),
              dict(y=(-9, franco * 0.30), color=_tono(gris, 0.86), arriba=False),
              dict(y=(-9, faja), color=FAJA, arriba=False)]
    for (z0, z1) in (numero or []):
        marcas.append(dict(z=(z0, z1), y=(franco * 0.42, franco * 0.80), x=(0.05, 9), color='#1f2428', arriba=False))
    marcas.append(dict(y=(0.15, 9), color=cubierta, arriba=True))
    return mat_pintura(K, 'casco', dict(arriba=[gris], panza=gris, marcas=marcas))

def numero(z0, trazos):
    """El numero de casco como trazos: `trazos` = anchos relativos (1 = un digito), separados."""
    out, z = [], z0
    for w in trazos:
        out.append((z, z + 0.11 * w)); z += 0.11 * w + 0.06
    return out

def costado(raiz, K, x, y, z0, z1, n, alto=0.12):
    """PUERTAS Y REJILLAS a los dos costados de un bloque: rectangulos oscuros apenas salidos de la
    cara. Es lo que hace que una pared lisa se lea como superestructura."""
    m = K['mat_cel']('puerta', '#3a4248')
    for sg in (-1, 1):
        for i in range(n):
            z = z0 + (z1 - z0) * (i + 0.5) / n
            pieza('puerta', raiz, m, (0.012, alto * (1.0 if i % 2 else 0.6), 0.10 if i % 2 else 0.16),
                  (sg * x, y + (0 if i % 2 else alto * 0.2), z))

def balsas(raiz, K, x, y, z0, z1, n):
    """Los contenedores BLANCOS de las balsas salvavidas, en fila sobre la borda."""
    m = K['mat_cel']('balsa', '#d9dcd8')
    for sg in (-1, 1):
        for i in range(n):
            elipsoide('balsa', (sg * x, y, z0 + (z1 - z0) * i / max(1, n - 1)), (0.06, 0.06, 0.10), raiz, m, seg=10, anillos=6)

def cuna(nombre, raiz, mat, x0, x1, z_popa, z_proa, y, alto):
    """Una CUÑA: la rampa de salto. Nace a ras de cubierta en `z_popa` y sube `alto` hasta la proa,
    llena por debajo (de costado es un triangulo, no una tabla)."""
    bm = bmesh.new()
    V = [bm.verts.new(c) for c in ((x0, y, z_popa), (x1, y, z_popa), (x1, y, z_proa), (x0, y, z_proa),
                                    (x0, y + alto, z_proa), (x1, y + alto, z_proa))]
    for f in ((0, 1, 2, 3), (3, 2, 5, 4), (0, 4, 5, 1), (0, 3, 4), (1, 5, 2)):
        bm.faces.new([V[i] for i in f])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    return _obj(nombre, me, raiz, mat)

def bloque(nombre, raiz, mat, c, d, bisel=0.035):
    """Un bloque de superestructura con las aristas BISELADAS: el canto toma la luz y se lee el volumen."""
    ob = caja(nombre, c, d, raiz, mat)
    bv = ob.modifiers.new('bisel', 'BEVEL'); bv.width = bisel; bv.segments = 2; bv.limit_method = 'ANGLE'
    ob.data.shade_smooth(); ob.data.set_sharp_from_angle(angle=math.radians(40))
    return ob

def pieza(nombre, raiz, mat, d, lugar, giro=(0, 0, 0)):
    """Una caja armada en el origen y despues ubicada/girada."""
    ob = caja(nombre, (0, 0, 0), d, raiz, mat)
    ob.rotation_euler = giro; ob.location = lugar
    return ob

def poste(nombre, raiz, mat, x, y0, y1, z, r0, r1, seg=8):
    """Un palo vertical que se afina (mastil, pluma de grúa)."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r0, radius2=r1, depth=y1 - y0)
    for v in bm.verts:
        v.co = (x + v.co.x, (y0 + y1) / 2 + v.co.z, z + v.co.y)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    me.shade_smooth()
    return _obj(nombre, me, raiz, mat)

def columna(nombre, raiz, mat, x, z, est, expo=3.0, inclina=0.0):
    """Un cuerpo VERTICAL por secciones (y, medio ancho, medio largo): la chimenea. `inclina` la
    echa hacia popa."""
    bm = bmesh.new(); anillos = []
    for (y, w, d) in est:
        anillo = []
        for i in range(16):
            t = 2 * math.pi * i / 16
            c, s = math.cos(t), math.sin(t)
            anillo.append(bm.verts.new((x + w * math.copysign(abs(c) ** (2 / expo), c),
                                        y, z + d * math.copysign(abs(s) ** (2 / expo), s) + inclina * (y - est[0][0]))))
        anillos.append(anillo)
    for a, b in zip(anillos, anillos[1:]):
        for i in range(16): bm.faces.new((a[i], a[(i + 1) % 16], b[(i + 1) % 16], b[i]))
    bm.faces.new(list(reversed(anillos[0]))); bm.faces.new(anillos[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    me.shade_smooth(); me.set_sharp_from_angle(angle=math.radians(40))
    return _obj(nombre, me, raiz, mat)

def chimenea(raiz, K, x, y, z, w, d, alto, sombrero=True):
    sup = K['mat_cel']('chimenea', GRIS_SUP)
    columna('chimenea', raiz, sup, x, z, [(y, w, d), (y + alto * 0.7, w * 0.96, d * 0.92), (y + alto, w * 0.9, d * 0.85)], inclina=0.12)
    if sombrero:
        columna('sombrerete', raiz, K['mat_cel']('negro', METAL), x, z + alto * 0.12,
                [(y + alto - 0.02, w * 0.93, d * 0.88), (y + alto + 0.10, w * 0.9, d * 0.84)], inclina=0.12)

def ventanal(raiz, K, x, y, z, ancho, alto=0.07):
    """Los ventanales del puente, ENCENDIDOS: la luz calida del atardecer adentro."""
    pieza('ventanal', raiz, K['mat_emisivo']('ventanal', VENTANAL), (ancho, alto, 0.02), (x, y, z))

def torreta(raiz, K, y, z, r=0.2):
    """El cañon de 4,5" Mk 8: la torreta facetada con el frente en cuña y el caño ALTO — el buque no
    espera, esta tirando."""
    mat = K['mat_cel']('torreta', GRIS_SUP)
    loft('torreta', [(z - r * 1.5, r * 0.55, r * 0.30, y + r * 0.30), (z - r * 0.8, r * 0.95, r * 0.55, y + r * 0.55),
                     (z + r * 0.9, r * 1.0, r * 0.62, y + r * 0.62), (z + r * 1.1, r * 0.92, r * 0.55, y + r * 0.55)],
         raiz, mat, n=12, expo=4.0, cerrar=(True, True))
    cano = loft('cano', [(0, r * 0.12, r * 0.12, 0), (-r * 3.0, r * 0.09, r * 0.09, 0)], raiz, K['mat_cel']('metal', METAL), n=8, cerrar=(True, True))
    cano.rotation_euler = (0.45, 0, 0); cano.location = (0, y + r * 0.62, z - r * 0.9)

def mastil(raiz, K, x, y, z, alto, tope='barra'):
    """El palo con su cruceta. `tope`: 'barra' (antena), 'somier' (el radar Tipo 965 del Tipo 42, un
    panel enrejado enorme arriba de todo), 'radomos' (los domos blancos del buque de mando)."""
    m = K['mat_cel']('metal', METAL)
    poste('mastil', raiz, m, x, y, y + alto, z, 0.07, 0.035)
    for sg in (-1, 1):                                         # las patas del tripode
        p = pieza('pata', raiz, m, (0.035, alto * 0.7, 0.035), (x + sg * 0.12, y + alto * 0.33, z + 0.06), (0, 0, sg * 0.17))
    pieza('cruceta', raiz, m, (0.55, 0.035, 0.05), (x, y + alto * 0.72, z))
    if tope == 'somier':
        # de TRAVES, como queda cuando gira: el pasillo ve el buque de costado y asi se lee la cara
        pieza('somier', raiz, m, (0.05, 0.30, 0.95), (x, y + alto + 0.10, z))
        pieza('somier_marco', raiz, K['mat_cel']('marco', GRIS_SUP), (0.07, 0.04, 1.0), (x, y + alto + 0.26, z))
    elif tope == 'radomos':
        elipsoide('radomo', (x, y + alto * 0.92, z - 0.22), (0.19, 0.17, 0.19), raiz, K['mat_cel']('radomo', RADOMO), seg=16, anillos=10)
        elipsoide('radomo', (x, y + alto * 0.62, z + 0.30), (0.15, 0.14, 0.15), raiz, K['mat_cel']('radomo', RADOMO), seg=16, anillos=10)
    else:
        pieza('antena', raiz, m, (0.34, 0.035, 0.05), (x, y + alto * 0.98, z))

# ============================ TIPO 42 — SHEFFIELD, COVENTRY ============================
# Cubierta de proa LARGA con la torreta sola, el lanzador Sea Dart, la isla al medio con el somier del
# radar arriba del palo de proa, la chimenea GRANDE, el palo de popa con el domo del 909, el hangar y
# la cubierta de vuelo.
def t42(T, K, padre=None):
    raiz = padre or _raiz(T, 'Tipo 42')
    franco, manga = 0.62, 1.15
    casco(raiz, pintura_casco(K, franco=franco, numero=numero(-L * 0.44, (1, 0.6, 1))), L, manga, franco, 0.055, 0.03)
    sup = K['mat_cel']('sup', GRIS_SUP)
    torreta(raiz, K, franco, -L * 0.33, 0.2)
    # EL SEA DART: el lanzador doble con sus dos misiles blancos apuntando alto
    bloque('base_dart', raiz, sup, (0, franco + 0.10, -L * 0.19), (0.42, 0.20, 0.42))
    for sg in (-1, 1):
        mi = loft('dart', [(0, 0.04, 0.04, 0), (-0.32, 0.045, 0.045, 0), (-0.42, 0.01, 0.01, 0)], raiz, K['mat_cel']('misil', MISIL), n=8, cerrar=(True, True))
        mi.rotation_euler = (0.55, 0, 0); mi.location = (sg * 0.10, franco + 0.30, -L * 0.17)
    # LA ISLA: caseta corrida, el puente con sus ventanales y el techo
    bloque('caseta', raiz, sup, (0, franco + 0.17, -L * 0.02), (manga * 0.86, 0.34, L * 0.30))
    bloque('puente', raiz, sup, (0, franco + 0.51, -L * 0.08), (manga * 0.62, 0.34, L * 0.16))
    bloque('techo', raiz, sup, (0, franco + 0.81, -L * 0.10), (manga * 0.40, 0.26, L * 0.09))
    ventanal(raiz, K, 0, franco + 0.56, -L * 0.161, manga * 0.5)
    costado(raiz, K, manga * 0.43 + 0.006, franco + 0.17, -L * 0.15, L * 0.12, 6)
    costado(raiz, K, manga * 0.31 + 0.006, franco + 0.52, -L * 0.15, -L * 0.01, 3)
    balsas(raiz, K, manga * 0.40, franco + 0.40, L * 0.02, L * 0.12, 4)
    elipsoide('radomo909', (0, franco + 1.05, -L * 0.135), (0.17, 0.15, 0.17), raiz, K['mat_cel']('radomo', RADOMO), seg=16, anillos=10)
    mastil(raiz, K, 0, franco + 0.94, -L * 0.075, 1.25, 'somier')
    chimenea(raiz, K, 0, franco + 0.34, L * 0.09, manga * 0.20, 0.42, 0.55)
    mastil(raiz, K, 0, franco + 0.34, L * 0.17, 0.85, 'barra')
    # EL HANGAR y la CUBIERTA DE VUELO (la pinta el casco: es lo que mira para arriba)
    bloque('hangar', raiz, sup, (0, franco + 0.21, L * 0.26), (manga * 0.66, 0.42, L * 0.16))
    costado(raiz, K, manga * 0.33 + 0.006, franco + 0.20, L * 0.19, L * 0.33, 3, alto=0.18)
    elipsoide('radomo909', (0, franco + 0.52, L * 0.23), (0.16, 0.14, 0.16), raiz, K['mat_cel']('radomo', RADOMO), seg=16, anillos=10)
    return raiz

# ============================ TIPO 21 — ARDENT, ANTELOPE ============================
# CORTA y con la proa de CLIPPER (muy lanzada), la torreta, los cuatro EXOCET delante del puente, una
# sola isla compacta adelante con la chimenea inclinada, el hangar bajo con el Sea Cat y media popa de
# cubierta de vuelo despejada.
def t21(T, K, padre=None):
    raiz = padre or _raiz(T, 'Tipo 21')
    franco, manga, largo = 0.46, 0.92, L * 0.76
    casco(raiz, pintura_casco(K, franco=franco, numero=numero(-L * 0.31, (0.6, 1, 1, 1))), largo, manga, franco, 0.13, 0.02, arrufo=0.18)
    sup = K['mat_cel']('sup', GRIS_SUP)
    torreta(raiz, K, franco + 0.04, -L * 0.27, 0.17)
    for sg in (-1, 1):                                         # los EXOCET: dos pares de tubos
        for k in (0, 1):
            ex = loft('exocet', [(0, 0.055, 0.055, 0), (-0.55, 0.055, 0.055, 0)], raiz, K['mat_cel']('exocet', '#5e676d'), n=8, expo=3.0, cerrar=(True, True))
            ex.rotation_euler = (0.2, sg * 0.25, 0); ex.location = (sg * (0.13 + k * 0.12), franco + 0.12 + k * 0.03, -L * 0.155)
    bloque('isla', raiz, sup, (0, franco + 0.23, -L * 0.09), (manga * 0.86, 0.46, L * 0.20))
    bloque('puente', raiz, sup, (0, franco + 0.63, -L * 0.12), (manga * 0.56, 0.34, L * 0.11))
    ventanal(raiz, K, 0, franco + 0.66, -L * 0.176, manga * 0.46)
    costado(raiz, K, manga * 0.43 + 0.006, franco + 0.22, -L * 0.18, L * 0.0, 5)
    balsas(raiz, K, manga * 0.40, franco + 0.52, -L * 0.04, L * 0.04, 3)
    mastil(raiz, K, 0, franco + 0.80, -L * 0.115, 1.25, 'barra')
    pieza('radar992', raiz, K['mat_cel']('metal', METAL), (0.38, 0.12, 0.06), (0, franco + 2.12, -L * 0.115))
    chimenea(raiz, K, 0, franco + 0.46, L * 0.01, manga * 0.17, 0.30, 0.40)
    bloque('hangar', raiz, sup, (0, franco + 0.15, L * 0.11), (manga * 0.56, 0.30, L * 0.10))
    costado(raiz, K, manga * 0.28 + 0.006, franco + 0.14, L * 0.07, L * 0.15, 2, alto=0.16)
    bloque('seacat', raiz, K['mat_cel']('metal', METAL), (0, franco + 0.37, L * 0.11), (manga * 0.24, 0.14, 0.26), bisel=0.02)
    return raiz

# ============================ LOGISTICO — SIR GALAHAD, SIR TRISTRAM ============================
# Casco ALTO de costados rectos, proa casi recta, la carga adelante (contenedores de alturas desparejas
# y dos grúas) y la isla ENTERA A POPA en tres pisos, con la chimenea y el palo.
def log(T, K, padre=None):
    raiz = padre or _raiz(T, 'Logistico')
    franco, manga = 1.0, 1.35
    casco(raiz, pintura_casco(K, franco=franco, numero=numero(-L * 0.45, (1, 1, 0.6))), L, manga, franco, 0.03, 0.015, arrufo=0.06)
    for i in range(6):
        z = -L * 0.36 + i * L * 0.095
        h = 0.3 + ((i * 7) % 3) * 0.12
        bloque('contenedor', raiz, K['mat_cel']('carga%d' % (i % 2), CARGA if i % 2 else CARGA2), (0, franco + h / 2, z), (manga * 0.72, h, L * 0.08), bisel=0.02)
        if i % 3 == 0:
            bloque('contenedor', raiz, K['mat_cel']('carga2', CARGA2), (0, franco + h + 0.12, z), (manga * 0.5, 0.24, L * 0.07), bisel=0.02)
    grua = K['mat_cel']('grua', GRUA)
    for z in (-L * 0.26, L * 0.02):                            # las dos grúas: el poste y la pluma
        poste('grua', raiz, grua, 0, franco, franco + 1.0, z, 0.07, 0.05)
        pl = loft('pluma', [(0, 0.05, 0.05, 0), (-L * 0.17, 0.03, 0.03, 0)], raiz, grua, n=6, expo=3.0, cerrar=(True, True))
        pl.rotation_euler = (0.24, 0, 0); pl.location = (0, franco + 0.92, z + 0.05)
    sup = K['mat_cel']('sup', GRIS_SUP)
    bloque('isla1', raiz, sup, (0, franco + 0.25, L * 0.30), (manga * 0.72, 0.50, L * 0.16))
    bloque('isla2', raiz, sup, (0, franco + 0.71, L * 0.30), (manga * 0.60, 0.42, L * 0.13))
    bloque('isla3', raiz, sup, (0, franco + 1.07, L * 0.30), (manga * 0.44, 0.30, L * 0.09))
    ventanal(raiz, K, 0, franco + 1.08, L * 0.252, manga * 0.40)
    costado(raiz, K, manga * 0.36 + 0.006, franco + 0.25, L * 0.23, L * 0.37, 4)
    costado(raiz, K, manga * 0.30 + 0.006, franco + 0.70, L * 0.25, L * 0.35, 3)
    balsas(raiz, K, manga * 0.40, franco + 0.56, L * 0.23, L * 0.37, 3)
    mastil(raiz, K, 0, franco + 1.22, L * 0.30, 0.9, 'barra')
    chimenea(raiz, K, 0, franco + 1.22, L * 0.36, manga * 0.13, 0.22, 0.42)
    return raiz

# ============================ PORTAAVIONES — INVINCIBLE, HERMES ============================
# UNA TABLA: la cubierta corrida mas ancha que el casco, la RAMPA DE SALTO que levanta la proa, la isla
# CORRIDA A ESTRIBOR con sus dos chimeneas y el palo de los radomos, y el Sea Dart abajo, en la proa.
def cv(T, K, padre=None):
    raiz = padre or _raiz(T, 'Portaaviones')
    franco, manga = 0.78, 1.9
    casco(raiz, pintura_casco(K, franco=franco, numero=numero(-L * 0.36, (1, 0.6, 1))), L, manga, franco, 0.04, 0.02, arrufo=0.04)
    cub = K['mat_cel']('cubierta', CUBIERTA)
    bloque('cubierta', raiz, cub, (0, franco + 0.05, 0.05), (manga * 1.06, 0.08, L * 0.95), bisel=0.03)
    cuna('rampa', raiz, cub, -manga * 0.50, manga * 0.50, -L * 0.29, -L * 0.475, franco + 0.09, 0.42)
    sup = K['mat_cel']('sup', GRIS_SUP)
    ix, iy = manga * 0.42, franco + 0.10
    for w, h, lg, dy in ((0.40, 0.44, L * 0.24, 0), (0.32, 0.34, L * 0.17, 0.44), (0.24, 0.24, L * 0.11, 0.78)):
        bloque('isla', raiz, sup, (ix, iy + dy + h / 2, L * 0.10), (manga * w, h, lg))
    ventanal(raiz, K, ix, iy + 0.62, L * 0.10 - L * 0.085 - 0.01, manga * 0.24)
    costado(raiz, K, ix + manga * 0.20 + 0.006, iy + 0.22, L * 0.0, L * 0.21, 5)
    costado(raiz, K, ix - manga * 0.20 - 0.006, iy + 0.22, L * 0.0, L * 0.21, 0)
    chimenea(raiz, K, ix, iy + 0.44, L * 0.02, manga * 0.09, 0.22, 0.42)
    chimenea(raiz, K, ix, iy + 0.44, L * 0.18, manga * 0.09, 0.22, 0.38)
    mastil(raiz, K, ix, iy + 1.02, L * 0.10, 1.25, 'radomos')
    bloque('seadart', raiz, sup, (0, franco - 0.08, -L * 0.43), (manga * 0.26, 0.16, 0.36), bisel=0.02)
    return raiz

# ============================ HUNDIENDOSE ============================
# EL MISMO CASCO INCLINADO (16° de trimado, 11° de escora, ya comido 0,30 del francobordo — los
# numeros de buques.js) y la COLUMNA DE HUMO negro que sube de la isla, con el fuego en la base.
def hundido(T, K, clase, n):
    n = int(n)
    raiz = _raiz(T, 'Hundido')
    b = _vacio(raiz, 'escorado')
    b.rotation_euler = (-0.28 if n == 1 else 0.28, 0, 0.19 if n == 1 else -0.15)
    b.location = (0, -0.30, 0)
    {'t42': t42, 't21': t21, 'log': log, 'cv': cv}[clase](T, K, padre=b)
    humo = [K['mat_cel']('humo%d' % i, c) for i, c in enumerate(('#20252a', '#2b3138', '#353b42'))]
    zb = 2.2 if n == 1 else -2.2
    for i in range(6):
        u = i / 5
        r = 0.22 + u * 0.48
        elipsoide('humo', (u * 0.55 + 0.08 * math.sin(i * 2.1), 1.30 + u * 1.55, zb + u * 0.85), (r, r * 0.82, r * 0.95), raiz, humo[i % 3], seg=14, anillos=8)
    for i, (c, r) in enumerate((('#b8341a', 0.26), ('#f07a22', 0.17))):
        elipsoide('fuego', (0, 1.05 + i * 0.04, zb - 0.05), (r, r * 0.6, r), raiz, K['mat_emisivo']('fuego%d' % i, c), seg=12, anillos=6)
    return raiz

# ============================ LA FRAGATA DEL MASTIL DE MAR ============================
# El casco que va debajo del mastil (el palo lo dibuja el juego): una fragata vista casi de proa, con
# las proporciones achaparradas de su hoja (se la ve de frente: lo que cuenta es la manga).
def fragata(T, K):
    raiz = _raiz(T, 'Fragata')
    casco(raiz, pintura_casco(K, gris='#55646a', cubierta='#3e4a4f', franco=1.05), 6.4, 5.0, 1.05, 0.10, 0.03, arrufo=0.15, fondo=-0.1)
    sup = K['mat_cel']('sup', '#6b7a80')
    bloque('superestructura', raiz, sup, (0, 1.50, 0.9), (1.9, 0.9, 2.0), bisel=0.06)
    bloque('puente', raiz, K['mat_cel']('puente', '#7b8a90'), (0, 2.15, 1.0), (1.2, 0.5, 1.1), bisel=0.05)
    ventanal(raiz, K, 0, 2.20, 0.44, 1.0, alto=0.16)
    torreta(raiz, K, 1.12, -0.9, 0.42)
    return raiz

# ============================ LA BARCAZA DE DESEMBARCO (LCU) ============================
# Casco de BATEA con la proa chata, las bordas altas de la bodega abierta, la RAMPA de proa apenas
# levantada, la timonera a popa con sus ventanas y la carga en la bodega. Gris verdoso.
def lcu(T, K):
    raiz = _raiz(T, 'LCU')
    casco(raiz, mat_pintura(K, 'casco', dict(arriba=['#6b7566'], panza='#565f52', marcas=[dict(y=(0.85, 9), color='#5d6659', arriba=True)])),
          6.4, 2.6, 1.0, 0.0, 0.02, arrufo=0.0, fondo=0.0, barcaza=True)
    borda = K['mat_cel']('borda', '#7f8975')
    for sg in (-1, 1):
        bloque('borda', raiz, borda, (sg * 1.22, 1.25, 0.2), (0.16, 0.50, 5.6), bisel=0.03)
    pieza('rampa', raiz, K['mat_cel']('rampa', '#8a947f'), (2.3, 0.16, 1.7), (0, 1.15, -3.5), (-0.24, 0, 0))
    bloque('timonera', raiz, K['mat_cel']('timonera', '#565f52'), (0, 1.55, 2.5), (1.5, 1.1, 1.2), bisel=0.05)
    pieza('ventanas', raiz, K['mat_cel']('ventanas', '#9fb6bd'), (1.3, 0.30, 0.03), (0, 1.80, 1.89))
    poste('antena', raiz, K['mat_cel']('metal', METAL), 0.5, 2.1, 3.0, 2.7, 0.04, 0.02)
    for i in range(3):
        bloque('carga', raiz, K['mat_cel']('carga', '#7d7455'), (-0.6 + i * 0.6, 1.17, -1.2), (0.5, 0.32, 0.42), bisel=0.04)
    return raiz

# ============================ LOS CIVILES (4/10/2026) ============================
# Pedido del autor: "podriamos poner barcos pesqueros o mas civiles, cada tanto". Salen en lugar de la
# fragata del mar abierto (el obstaculo `mast`) una de cada tantas veces: mismo lugar, misma caja de
# choque — cambia el barco, no el juego. Los dos de las islas en el 82:

def pesquero(T, K):
    """EL PESQUERO (arrastrero): casco ROJO de proa alta, la timonera blanca ADELANTE, el palo, y a popa
    el PORTICO de arrastre con los tangones y las boyas naranjas."""
    raiz = _raiz(T, 'Pesquero')
    franco, manga, largo = 0.70, 1.45, 6.0
    casco(raiz, pintura_casco(K, gris='#8a2a22', cubierta='#4a3a32', franco=franco), largo, manga, franco, 0.06, 0.03, arrufo=0.30)
    blanco = K['mat_cel']('blanco', '#d8d8d0')
    bloque('timonera', raiz, blanco, (0, franco + 0.45, -1.3), (manga * 0.62, 0.62, 1.2), bisel=0.05)
    bloque('techo', raiz, K['mat_cel']('techo', '#b8b8b0'), (0, franco + 0.82, -1.35), (manga * 0.66, 0.08, 1.3), bisel=0.02)
    for sg in (-1, 1): pieza('ventana', raiz, K['mat_cel']('vidrio_osc', '#2b4552'), (0.02, 0.18, 0.8), (sg * manga * 0.31 + sg * 0.01, franco + 0.58, -1.3))
    pieza('ventana_frente', raiz, K['mat_cel']('vidrio_osc', '#2b4552'), (manga * 0.5, 0.18, 0.02), (0, franco + 0.58, -1.91))
    m = K['mat_cel']('metal', METAL)
    poste('palo', raiz, m, 0, franco + 0.86, franco + 2.2, -1.0, 0.05, 0.03)
    pieza('verga', raiz, m, (0.8, 0.04, 0.04), (0, franco + 1.9, -1.0))
    # EL PORTICO DE ARRASTRE a popa y los dos tangones abiertos
    for sg in (-1, 1):
        poste('portico', raiz, K['mat_cel']('portico', '#c9a23a'), sg * 0.55, franco, franco + 1.5, 2.6, 0.06, 0.05)
        hueso_ = TI_hueso()
        hueso_('tangon', raiz, m, (sg * 0.3, franco + 1.6, 0.4), (sg * 1.6, franco + 0.6, 0.6), 0.035, 0.03)
    pieza('portico_trav', raiz, K['mat_cel']('portico', '#c9a23a'), (1.2, 0.08, 0.08), (0, franco + 1.5, 2.6))
    for i in range(3):
        elipsoide('boya', (-0.4 + i * 0.4, franco + 0.15, 1.8), (0.12, 0.12, 0.12), raiz, K['mat_cel']('boya', '#e0702a'), seg=10, anillos=6)
    return raiz

def costero(T, K):
    """EL COSTERO de las islas (como los barcos de la Falkland Islands Company): casco NEGRO, la
    superestructura blanca A POPA con la chimenea ROJA de tope negro, dos palos de carga con sus
    plumas sobre la bodega de proa."""
    raiz = _raiz(T, 'Costero')
    franco, manga, largo = 0.80, 1.35, 7.2
    casco(raiz, pintura_casco(K, gris='#26292a', cubierta='#5a4a38', franco=franco, faja=0.06), largo, manga, franco, 0.04, 0.02, arrufo=0.18)
    blanco = K['mat_cel']('blanco', '#dcdcd4')
    bloque('caseta', raiz, blanco, (0, franco + 0.30, 2.1), (manga * 0.78, 0.60, 1.9), bisel=0.04)
    bloque('puente', raiz, blanco, (0, franco + 0.82, 1.9), (manga * 0.62, 0.44, 1.1), bisel=0.04)
    ventanal(raiz, K, 0, franco + 0.86, 1.33, manga * 0.5)
    chimenea(raiz, K, 0, franco + 0.60, 2.75, 0.22, 0.30, 0.55)
    for o in raiz.children:
        if o.name.startswith('chimenea'): o.data.materials[0] = K['mat_cel']('roja', '#b02a20')
    bloque('escotilla', raiz, K['mat_cel']('escotilla', '#4a4036'), (0, franco + 0.12, -1.2), (manga * 0.6, 0.22, 2.2), bisel=0.03)
    m = K['mat_cel']('metal', METAL)
    hueso_ = TI_hueso()
    for z in (-2.3, -0.1):
        poste('palo_carga', raiz, m, 0, franco, franco + 1.8, z, 0.06, 0.04)
        hueso_('pluma', raiz, m, (0, franco + 0.3, z), (0, franco + 1.4, z + (0.9 if z < -1 else -0.9)), 0.03, 0.025)
    return raiz

def TI_hueso():
    """El `hueso` de modelos_tierra (un caño de punto a punto), cargado aca adentro (modelos_tierra
    importa este modulo: traerlo arriba seria circular)."""
    spec = importlib.util.spec_from_file_location('modelos_bl_tierra_bq', os.path.join(AQUI, 'modelos_tierra.py'))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m.hueso
