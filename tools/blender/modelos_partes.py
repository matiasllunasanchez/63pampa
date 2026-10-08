# LAS PARTES DEL DESPIECE Y LA MUNICION, HECHAS EN BLENDER (4/10/2026). Reemplazan a tools/models/partes.js
# y tools/models/ammo.js, que pasaban por el puente tal cual (placas extruidas y cilindros).
#
# LAS PARTES siguen en GRIS NEUTRO CLARO (los cuatro grises de BAKE.PAL: claro, medio, oscuro, negro): el
# juego tiñe la hoja con el color de lo que se rompio (multiply, render/partes.js) — el volumen lo pone
# la hoja, el color la receta. Lo que cambia es la FORMA: alas y derivas con perfil, el borde
# DESGARRADO en dientes, tubos que se leen como CASCARAS (hueco adentro), el motor con sus alabes, la
# rueda con cubierta y llanta, la lona arrugada. Mismo tamaño que las de partes.js (todas ocupan la caja
# de ~3,2 unidades de la camara fija, asi un ala se ve mas grande que un panel).
#
# LA MUNICION: la bomba con su ojiva, la banda amarilla y las aletas en X; el misil blanco con alas a
# media eslora y la boca encendida; el Sidewinder con su domo, los canards y los rollerons. Mismas
# medidas que ammo.js.
import importlib.util, math, os
import bpy, bmesh

AQUI = os.path.dirname(os.path.abspath(__file__))
def _mod(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(AQUI, archivo))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m
M = _mod('modelos_bl_base_p', 'modelos.py')
TI = _mod('modelos_bl_tierra_p', 'modelos_tierra.py')
elipsoide, loft, _subdiv, superficie, disco, _obj = M.elipsoide, M.loft, M._subdiv, M.superficie, M.disco, M._obj
vacio, pieza, bloque, hueso, columna = TI.vacio, TI.pieza, TI.bloque, TI.hueso, TI.columna

CLARO, MEDIO, OSCURO, NEGRO = '#c3c9cd', '#9aa2a7', '#6b7378', '#3a4145'
VIDRIO, MADERA = '#cfe8f2', '#8a7355'

def desgarro(padre, K, largo, alto, x, y, z, eje='z', color=OSCURO):
    """EL BORDE DESGARRADO: dientes irregulares sobre el corte (deterministas). Es lo que separa "pieza
    arrancada" de "pieza desmontada"."""
    m = K['mat_cel']('desgarro', color)
    for i in range(7):
        t = (i / 6 - 0.5) * largo
        d = 0.08 + ((i * 7) % 5) * 0.05
        h = alto * (0.5 + ((i * 3) % 4) * 0.16)
        giro = (0.3 * ((i % 3) - 1), 0.4 * ((i % 2) - 0.5), 0.25 * ((i * 5) % 3 - 1))
        # DIENTES DE CHAPA: finos (no ladrillos) y retorcidos cada uno para su lado
        if eje == 'z': pieza('diente', padre, m, (d * 2, h * 0.7, 0.04), (x + d * 0.8, y, z + t), giro)
        else: pieza('diente', padre, m, (0.04, h * 0.7, d * 2), (x + t, y, z + d * 0.8), giro)

def remaches(padre, K, puntos):
    m = K['mat_cel']('remache', OSCURO)
    for p in puntos: elipsoide('remache', p, (0.045, 0.03, 0.045), padre, m, seg=8, anillos=4)

def cascara(padre, K, est, n=16, expo=2.0, hueco=0.82):
    """Un TRAMO de tubo que se lee como cascara: la piel por fuera y el negro del hueco por dentro (una
    copia mas chica), con las dos bocas abiertas."""
    piel = loft('piel', est, padre, K['mat_cel']('piel', MEDIO), n=n, expo=expo, cerrar=(False, False))
    loft('hueco', [(z, w * hueco, h * hueco, y) for (z, w, h, y) in est], padre, K['mat_cel']('hueco', NEGRO), n=n, expo=expo, cerrar=(True, True))
    return piel

def aletas_x(padre, K, color, r, envergadura, cuerda, espesor, z, n=4, giro0=math.pi / 4):
    """Aletas en X (o en cruz) alrededor de un cuerpo de radio `r`, a la altura `z`."""
    m = K['mat_cel']('aleta', color)
    for i in range(n):
        a = giro0 + i * 2 * math.pi / n
        d = r + envergadura / 2
        pieza('aleta', padre, m, (envergadura, espesor, cuerda), (math.cos(a) * d, math.sin(a) * d, z), (0, 0, a))

# ============================ LAS VEINTE PIEZAS (en el orden de data/despiece.js) ============================
def p_ala(g, K):
    superficie('ala', [(-0.5, -1.15, 2.10, 0.08, 0.0), (0.4, -0.70, 1.35, 0.09, 0.0), (1.25, -0.25, 0.60, 0.10, 0.0)],
               g, K['mat_cel']('ala', MEDIO), eje='x')
    hueso('larguero', g, K['mat_cel']('larguero', OSCURO), (-0.75, 0, 0.05), (-0.35, 0, 0.05), 0.09, 0.09, seg=6)
    remaches(g, K, [(-0.2 + 0.3 * i, 0.085, 0.45) for i in range(5)])
    desgarro(g, K, 1.9, 0.24, -0.62, 0, -0.1, 'z')

def p_deriva(g, K):
    superficie('deriva', [(-0.7, -0.85, 1.55, 0.08, 0.0), (0.8, -0.50, 0.55, 0.09, 0.0)], g, K['mat_cel']('deriva', MEDIO), eje='y')
    loft('munon', [(-0.85, 0.30, 0.22, -0.78), (0.75, 0.26, 0.20, -0.78)], g, K['mat_cel']('munon', OSCURO), n=12, cerrar=(True, True))
    desgarro(g, K, 1.3, 0.3, 0, -0.95, 0, 'x')

def p_estab(g, K):
    superficie('estab', [(-0.35, -0.70, 1.25, 0.08, 0.0), (0.80, -0.20, 0.40, 0.09, 0.0)], g, K['mat_cel']('estab', MEDIO), eje='x')
    desgarro(g, K, 1.15, 0.2, -0.43, 0, 0.0, 'z')

def p_morro(g, K):
    _subdiv(loft('morro', [(-1.30, 0.02, 0.02, 0), (-1.10, 0.20, 0.20, 0), (-0.60, 0.40, 0.40, 0), (0.10, 0.50, 0.50, 0),
                           (1.40, 0.52, 0.52, 0)], g, K['mat_cel']('piel', MEDIO), n=16, cerrar=(True, False)), 1)
    hueso('pitot', g, K['mat_cel']('pitot', OSCURO), (0, 0, -1.25), (0, -0.02, -1.58), 0.05, 0.03, seg=6)
    disco('boca', (0, 0, 1.38), 0.46, g, K['mat_cel']('hueco', NEGRO))
    desgarro(g, K, 1.0, 0.34, 0, 0, 1.4, 'x')

def p_cola(g, K):
    cascara(g, K, [(-0.70, 0.42, 0.42, 0), (0.75, 0.52, 0.52, 0)])
    _subdiv(loft('tobera', [(0.75, 0.56, 0.56, 0), (1.05, 0.66, 0.66, 0), (1.30, 0.72, 0.72, 0)], g, K['mat_cel']('tobera', OSCURO), n=18, cerrar=(False, False)), 1)
    disco('boca', (0, 0, 1.22), 0.60, g, K['mat_cel']('hueco', NEGRO))
    desgarro(g, K, 1.0, 0.36, 0, 0, -0.72, 'x')

def p_fuselaje(g, K):
    cascara(g, K, [(-1.0, 0.60, 0.60, 0), (1.0, 0.60, 0.60, 0)], hueco=0.80)
    for z in (-0.98, 0.0, 0.98):
        loft('cuaderna', [(z - 0.06, 0.64, 0.64, 0), (z + 0.06, 0.64, 0.64, 0)], g, K['mat_cel']('cuaderna', OSCURO), n=16, cerrar=(False, False))
    loft('lomo', [(-1.0, 0.10, 0.08, 0.60), (1.0, 0.10, 0.08, 0.60)], g, K['mat_cel']('lomo', OSCURO), n=8, cerrar=(True, True))
    desgarro(g, K, 1.1, 0.4, 0, 0, 1.05, 'x')

def p_cabina(g, K):
    _subdiv(loft('burbuja', [(-0.95, 0.10, 0.06, -0.25), (-0.70, 0.55, 0.45, -0.18), (0.0, 0.72, 0.62, -0.12),
                             (0.70, 0.62, 0.52, -0.15), (0.95, 0.20, 0.12, -0.25)], g, K['mat_cel']('vidrio', VIDRIO, True), n=18, cerrar=(True, True)), 2)
    m = K['mat_cel']('marco', OSCURO)
    hueso('arco', g, m, (0, 0.38, -0.9), (0, 0.50, 0.9), 0.05, 0.05, seg=6)
    for z in (-0.88, 0.88): pieza('marco', g, m, (1.4, 0.12, 0.12), (0, -0.30, z))

def p_tanque(g, K):
    perfil = [(0.00, 0.03), (0.10, 0.55), (0.26, 0.90), (0.42, 1.0), (0.62, 1.0), (0.82, 0.72), (1.00, 0.10)]
    _subdiv(loft('tanque', [(-1.55 + f * 3.1, 0.36 * k, 0.36 * k, 0) for f, k in perfil], g, K['mat_cel']('tanque', CLARO), n=14, cerrar=(True, True)), 1)
    aletas_x(g, K, MEDIO, 0.12, 0.42, 0.42, 0.04, 1.25)
    pieza('pilon', g, K['mat_cel']('pilon', OSCURO), (0.12, 0.20, 0.55), (0, 0.42, -0.2))
    desgarro(g, K, 0.5, 0.14, 0, 0.52, -0.2, 'x')

def p_tren(g, K):
    hueso('pata', g, K['mat_cel']('pata', MEDIO), (0, 1.1, 0), (0, -0.45, 0), 0.09, 0.08, seg=10)
    hueso('amortiguador', g, K['mat_cel']('cromo', CLARO), (0, 0.2, 0), (0, -0.35, 0), 0.06, 0.06, seg=10)
    TI.rueda(g, dict(K, mat_cel=lambda n, c, b=False: K['mat_cel'](n, NEGRO if c == TI.GOMA else OSCURO)), 0.12, -0.55, 0, 0.42, 0.26)
    bloque('bahia', g, K['mat_cel']('bahia', OSCURO), (0, 1.15, 0), (0.5, 0.12, 0.5), bisel=0.02)
    desgarro(g, K, 0.5, 0.2, 0, 1.25, 0, 'x', NEGRO)

def p_panel(g, K):
    # una CHAPA DOBLADA: grilla con una curva (se abollo al arrancarse), remachada en un borde
    bm = bmesh.new(); N = 6; filas = []
    for i in range(N + 1):
        fila = []
        for j in range(N + 1):
            x = -0.9 + 1.8 * j / N + 0.05 * math.sin(i * 1.3)
            z = -0.85 + 1.7 * i / N
            y = 0.22 * math.sin(math.pi * j / N) * (0.4 + 0.6 * i / N) - 0.12 * (i / N)
            fila.append(bm.verts.new((x, y, z)))
        filas.append(fila)
    for i in range(N):
        for j in range(N): bm.faces.new((filas[i][j], filas[i][j + 1], filas[i + 1][j + 1], filas[i + 1][j]))
    me = bpy.data.meshes.new('panel'); bm.to_mesh(me); bm.free(); me.shade_smooth()
    ob = _obj('panel', me, g, K['mat_cel']('panel', MEDIO))
    so = ob.modifiers.new('espesor', 'SOLIDIFY'); so.thickness = 0.07
    remaches(g, K, [(-0.75 + i * 0.3, 0.12 + 0.12 * math.sin(math.pi * i / 5), 0.70) for i in range(6)])
    desgarro(g, K, 1.7, 0.16, 0, 0, -0.9, 'x')

def p_rotor(g, K):
    columna('cabeza', g, K['mat_cel']('cabeza', OSCURO), 0, 0, [(-0.21, 0.32, 0.32), (0.21, 0.30, 0.30)], expo=2.0)
    hueso('mastil', g, K['mat_cel']('mastil', NEGRO), (0, -0.2, 0), (0, -0.6, 0), 0.12, 0.12, seg=8)
    pala = K['mat_cel']('pala', MEDIO)
    for i in range(3):
        a = i * 2 * math.pi / 3 + 0.4
        for f0, f1, c, caida in ((0.08, 0.55, 0.22, 0.0), (0.55, 1.0, 0.18, (0.16, -0.30, 0.10)[i])):
            L = (f1 - f0) * 2.5
            pieza('pala', g, pala, (c, 0.06, L), (math.sin(a) * 2.5 * (f0 + f1) / 2, 0.05 - caida * (f0 + f1), math.cos(a) * 2.5 * (f0 + f1) / 2),
                  ((0, 0.12, -0.18)[i], a, (0.16, -0.3, 0.1)[i] * (f0 + 0.4)))
    desgarro(g, K, 0.4, 0.24, 0, -0.65, 0, 'x', NEGRO)

def p_botalon(g, K):
    _subdiv(loft('botalon', [(-1.2, 0.16, 0.16, 0), (1.2, 0.30, 0.30, 0)], g, K['mat_cel']('piel', MEDIO), n=14, cerrar=(True, False)), 1)
    superficie('deriva', [(0.10, -1.25, 0.90, 0.10, 0.0), (0.95, -1.05, 0.45, 0.10, 0.0)], g, K['mat_cel']('deriva', MEDIO), eje='y')
    m = K['mat_cel']('pala_cola', NEGRO)
    pieza('pala', g, m, (0.06, 0.62, 0.10), (0.16, 0.42, -1.0)); pieza('pala', g, m, (0.06, 0.10, 0.62), (0.16, 0.42, -1.0))
    disco('boca', (0, 0, 1.19), 0.25, g, K['mat_cel']('hueco', NEGRO))
    desgarro(g, K, 0.7, 0.3, 0, 0, 1.2, 'x')

def p_plato(g, K):
    inc = vacio(g, 'plato', (0, 0, 0), (-math.pi / 2, 0, 0))
    columna('plato', inc, K['mat_cel']('plato', CLARO), 0, 0, [(0.0, 0.25, 0.25), (0.22, 0.80, 0.80), (0.36, 1.10, 1.10)], expo=2.0)
    m = K['mat_cel']('rejilla', OSCURO)
    for i in range(5): pieza('traves', g, m, (0.05, 0.05, 1.8), (-0.8 + i * 0.4, 0, -0.38), (0, math.pi / 2, 0))
    pieza('bocina', g, K['mat_cel']('bocina', MEDIO), (0.45, 0.35, 0.16), (0, 0, -1.05))
    hueso('munon', g, m, (0, 0, 0.45), (0, -0.9, 0.5), 0.10, 0.09, seg=6)
    desgarro(g, K, 0.5, 0.26, 0, -1.0, 0.5, 'x', NEGRO)

def p_canon(g, K):
    bloque('cuna', g, K['mat_cel']('cuna', MEDIO), (0, 0, 0), (1.1, 0.34, 0.62), bisel=0.05)
    for sg in (-1, 1):
        hueso('cano', g, K['mat_cel']('cano', OSCURO), (sg * 0.22, 0.16, 0.1), (sg * 0.22, 0.16, -2.2), 0.11, 0.08, seg=8)
        hueso('apagallamas', g, K['mat_cel']('apagallamas', NEGRO), (sg * 0.22, 0.16, -2.05), (sg * 0.22, 0.16, -2.35), 0.14, 0.14, seg=8)
    bloque('pedestal', g, K['mat_cel']('pedestal', OSCURO), (0, -0.30, 0.3), (0.5, 0.4, 0.5), bisel=0.04)
    desgarro(g, K, 0.7, 0.3, 0, -0.55, 0.3, 'x', NEGRO)

def p_motor(g, K):
    _subdiv(loft('carcasa', [(-1.10, 0.60, 0.60, 0), (-0.90, 0.58, 0.58, 0), (0.80, 0.54, 0.54, 0), (1.10, 0.50, 0.50, 0)],
                 g, K['mat_cel']('carcasa', MEDIO), n=18, cerrar=(False, False)), 1)
    disco('fondo', (0, 0, -0.97), 0.55, g, K['mat_cel']('hueco', NEGRO)).rotation_euler = (0, 0, 0)
    alabe = K['mat_cel']('alabe', CLARO)
    for i in range(10):                                            # LOS ALABES: la firma
        a = i * 2 * math.pi / 10
        pieza('alabe', g, alabe, (0.09, 0.40, 0.04), (math.cos(a) * 0.30, math.sin(a) * 0.30, -1.02), (0.35, 0, a + math.pi / 2))
    elipsoide('cono', (0, 0, -1.02), (0.15, 0.15, 0.22), g, K['mat_cel']('cono', OSCURO), seg=12, anillos=8)
    loft('turbina', [(1.10, 0.46, 0.46, 0), (1.35, 0.40, 0.40, 0)], g, K['mat_cel']('turbina', OSCURO), n=16, cerrar=(False, True))
    bloque('bancal', g, K['mat_cel']('bancal', OSCURO), (0, 0.55, 0.1), (0.14, 0.30, 1.5), bisel=0.02)
    desgarro(g, K, 1.5, 0.24, 0, 0.72, 0.1, 'z', NEGRO)

def p_tambor(g, K):
    t = vacio(g, 'tambor', (0, 0, 0), (math.pi / 2, 0, 0))
    columna('cuerpo', t, K['mat_cel']('tambor', MEDIO), 0, 0, [(-0.75, 0.62, 0.62), (0.75, 0.62, 0.62)], expo=2.0)
    for y in (-0.4, 0.4): columna('nervio', t, K['mat_cel']('nervio', OSCURO), 0, 0, [(y - 0.06, 0.66, 0.66), (y + 0.06, 0.66, 0.66)], expo=2.0)
    disco('tapa', (0, 0, 0.77), 0.55, g, K['mat_cel']('hueco', NEGRO))
    elipsoide('abolladura', (0.48, 0.28, -0.2), (0.22, 0.30, 0.30), g, K['mat_cel']('abolladura', OSCURO), seg=10, anillos=6)
    desgarro(g, K, 1.0, 0.22, 0, 0, 0.82, 'x', NEGRO)

def p_rueda(g, K):
    elipsoide('cubierta', (0, 0, 0), (0.30, 0.95, 0.95), g, K['mat_cel']('goma', NEGRO), seg=22, anillos=14)
    elipsoide('llanta', (0.12, 0, 0), (0.22, 0.58, 0.58), g, K['mat_cel']('llanta', OSCURO), seg=18, anillos=10)
    elipsoide('cubo', (0.30, 0, 0), (0.12, 0.22, 0.22), g, K['mat_cel']('cubo', CLARO), seg=12, anillos=8)
    hueso('eje', g, K['mat_cel']('eje', MEDIO), (0.3, 0, 0), (0.55, 0.1, 1.25), 0.09, 0.08, seg=8)
    desgarro(g, K, 0.5, 0.2, 0.55, 0.1, 1.3, 'x')

def p_rampa(g, K):
    bloque('rampa', g, K['mat_cel']('rampa', MEDIO), (0, 0, 0), (2.3, 0.14, 1.7), bisel=0.03)
    m = K['mat_cel']('nervio', OSCURO)
    for sx in (-0.7, 0, 0.7): bloque('nervio', g, m, (sx, 0.13, 0), (0.14, 0.14, 1.7), bisel=0.02)
    for k in range(6): pieza('taco', g, m, (2.1, 0.04, 0.06), (0, 0.09, -0.7 + k * 0.28))
    bloque('labio', g, m, (0, 0.1, -0.85), (2.3, 0.2, 0.16), bisel=0.02)
    cad = K['mat_cel']('cadena', NEGRO)
    for sx in (-0.9, 0.9): hueso('cadena', g, cad, (sx, 0.1, 0.4), (sx * 1.15, 0.55, 1.05), 0.05, 0.05, seg=5)
    desgarro(g, K, 2.0, 0.2, 0, 0, 0.9, 'x')

def p_funda(g, K):
    # LA LONA ARRUGADA del globo: la bolsa aplastada con arrugas de ruido
    b = _subdiv(loft('lona', [(-1.1, 0.06, 0.03, 0), (-0.7, 0.75, 0.14, 0.02), (0.15, 0.95, 0.20, 0.04), (0.85, 0.7, 0.12, 0.02), (1.15, 0.08, 0.03, 0)],
                     g, K['mat_cel']('lona', CLARO), n=18, cerrar=(True, True)), 2)
    tx = bpy.data.textures.new('arrugas', 'CLOUDS'); tx.noise_scale = 0.3
    d = b.modifiers.new('arrugas', 'DISPLACE'); d.texture = tx; d.strength = 0.18
    elipsoide('pliegue', (0.5, 0.15, -0.6), (0.7, 0.14, 0.45), g, K['mat_cel']('pliegue', MEDIO), seg=12, anillos=6).rotation_euler = (0, -0.6, 0)
    c = K['mat_cel']('cable', OSCURO)
    for i in range(3):
        a = 0.6 + i * 0.9
        hueso('cable', g, c, (-0.9 + i * 0.3, -0.05, 0.9 + i * 0.2), (-0.9 + i * 0.3 + math.cos(a) * 1.1, -0.05, 0.9 + i * 0.2 + math.sin(a) * 1.1), 0.035, 0.035, seg=5)

def p_cable(g, K):
    madera = K['mat_cel']('madera', MADERA)
    hueso('poste', g, madera, (0, -1.3, 0), (0, 1.3, 0), 0.10, 0.08, seg=8)
    pieza('crucera', g, madera, (1.4, 0.13, 0.13), (0, 0.55, -0.1))
    for sx in (-0.5, 0.5):
        columna('aislador', g, K['mat_cel']('aislador', CLARO), sx, -0.1, [(0.62, 0.08, 0.08), (0.70, 0.12, 0.12), (0.82, 0.07, 0.07)], expo=2.0)
        hueso('hilo', g, K['mat_cel']('hilo', OSCURO), (sx, 0.78, -0.1), (sx * 1.25, -0.6, 1.25), 0.025, 0.025, seg=4)
    desgarro(g, K, 0.5, 0.2, 0, -1.3, 0, 'x')

PIEZAS = {'ala': p_ala, 'deriva': p_deriva, 'estab': p_estab, 'morro': p_morro, 'cola': p_cola, 'fuselaje': p_fuselaje,
          'cabina': p_cabina, 'tanque': p_tanque, 'tren': p_tren, 'panel': p_panel, 'rotor': p_rotor, 'botalon': p_botalon,
          'plato': p_plato, 'canon': p_canon, 'motor': p_motor, 'tambor': p_tambor, 'rueda': p_rueda, 'rampa': p_rampa,
          'funda': p_funda, 'cable': p_cable}

def parte(T, K, nombre):
    """Una pieza del despiece, por nombre (el de data/despiece.js)."""
    g = vacio(T, 'parte ' + nombre)
    PIEZAS[nombre](g, K)
    return g

# ============================ LA MUNICION ============================
def municion_bomba(T, K):
    """La Mk 82: el cuerpo, la ojiva roma, la BANDA AMARILLA de arma real, el cono de cola y las aletas
    en X. Verde mas claro que el real (en el mar oscuro, el de archivo era una mancha)."""
    g = vacio(T, 'bomba')
    cuerpo, oscuro = K['mat_cel']('cuerpo', '#717865'), K['mat_cel']('oscuro', '#41463a')
    _subdiv(loft('cuerpo', [(-1.21, 0.04, 0.04, 0), (-1.05, 0.20, 0.20, 0), (-0.80, 0.28, 0.28, 0), (-0.55, 0.30, 0.30, 0),
                            (0.60, 0.30, 0.30, 0)], g, cuerpo, n=14, cerrar=(True, False)), 1)
    loft('banda', [(-0.49, 0.312, 0.312, 0), (-0.39, 0.312, 0.312, 0)], g, K['mat_cel']('banda', '#d8b246'), n=14, cerrar=(False, False))
    loft('cola', [(0.60, 0.30, 0.30, 0), (0.93, 0.22, 0.22, 0)], g, oscuro, n=14, cerrar=(False, True))
    aletas_x(g, K, '#41463a', 0.22, 0.24, 0.46, 0.05, 0.82)
    return g

def municion_misil(T, K):
    """El misil blanco: ojiva gris, la banda de union, alas a media eslora y aletas de cola en X, y la
    boca ENCENDIDA (tres discos de calor) mirando a la camara de cola."""
    g = vacio(T, 'misil')
    _subdiv(loft('cuerpo', [(-1.69, 0.02, 0.02, 0), (-1.45, 0.12, 0.12, 0), (-1.05, 0.20, 0.20, 0)], g, K['mat_cel']('ojiva', '#9aa3ab'), n=14, cerrar=(True, False)), 1)
    loft('cuerpo', [(-1.05, 0.20, 0.20, 0), (1.0, 0.20, 0.20, 0)], g, K['mat_cel']('cuerpo', '#dfe6ea'), n=14, cerrar=(False, True))
    loft('banda', [(-0.14, 0.206, 0.206, 0), (-0.06, 0.206, 0.206, 0)], g, K['mat_cel']('banda', '#5a6268'), n=14, cerrar=(False, False))
    aletas_x(g, K, '#c3cbd1', 0.17, 0.26, 0.34, 0.045, 0.05)
    aletas_x(g, K, '#c3cbd1', 0.17, 0.22, 0.30, 0.045, 0.92)
    for i, (c, f) in enumerate((('#b8341a', 0.17), ('#f07a22', 0.12), ('#ffe6a8', 0.06))):
        disco('fuego%d' % i, (0, 0, 1.02 + 0.02 * i), f, g, K['mat_emisivo']('fuego%d' % i, c))
    return g

def municion_aim9(T, K):
    """EL SIDEWINDER de los Harrier: el domo del buscador, la seccion de guiado oscura con los CANARDS
    en X, las bandas amarilla (explosivo) y marron (motor), el motor largo, las alas de cola con los
    ROLLERONS en la punta y la tobera encendida."""
    g = vacio(T, 'aim9')
    r = 0.10
    elipsoide('domo', (0, 0, -1.34), (r, r, r * 1.1), g, K['mat_cel']('domo', '#2c3038'), seg=12, anillos=8)
    guia, cuerpo = K['mat_cel']('guia', '#4d555c'), K['mat_cel']('cuerpo', '#c9ced1')
    loft('guiado', [(-1.35, r, r, 0), (-0.85, r, r, 0)], g, guia, n=12, cerrar=(False, False))
    loft('ojiva', [(-0.85, r, r, 0), (-0.43, r, r, 0)], g, cuerpo, n=12, cerrar=(False, False))
    loft('banda', [(-0.73, r + 0.004, r + 0.004, 0), (-0.67, r + 0.004, r + 0.004, 0)], g, K['mat_cel']('amarilla', '#d8b246'), n=12, cerrar=(False, False))
    loft('motor', [(-0.43, r, r, 0), (1.37, r, r, 0)], g, cuerpo, n=12, cerrar=(False, False))
    loft('banda', [(-0.355, r + 0.004, r + 0.004, 0), (-0.305, r + 0.004, r + 0.004, 0)], g, K['mat_cel']('marron', '#7a4a2a'), n=12, cerrar=(False, False))
    loft('tobera', [(1.37, r, r, 0), (1.47, r * 0.8, r * 0.8, 0)], g, guia, n=12, cerrar=(False, False))
    aletas_x(g, K, '#4d555c', r, 0.23, 0.28, 0.035, -1.02)                 # los canards
    aletas_x(g, K, '#b3b9bd', r, 0.34, 0.36, 0.04, 1.18)                   # las alas de cola
    for i in range(4):                                                     # los rollerons
        a = math.pi / 4 + i * math.pi / 2; d = r + 0.34
        elipsoide('rolleron', (math.cos(a) * d, math.sin(a) * d, 1.30), (0.06, 0.06, 0.04), g, K['mat_cel']('rolleron', '#3a3f44'), seg=10, anillos=6)
    for i, (c, f) in enumerate((('#b8341a', 1.05), ('#f07a22', 0.75), ('#ffe6a8', 0.40))):
        disco('fuego%d' % i, (0, 0, 1.48 + 0.02 * i), r * f, g, K['mat_emisivo']('fuego%d' % i, c))
    return g

def municion_chafita(T, K):
    """UN TUBO DE CHAFITAS (8/10/2026, el autor: "son cilindros de 16 cm"; el chaff de la maquina de
    fideos, docs/sistemas/SPEC_CHAPITAS.md). 16 cm de largo y 3,8 de diametro —el cartucho de 1,5"
    que va verificado para el Mirage y el Dagger—, modelado a x10 para que la camara lo encuadre como a
    la municion (el juego lo escala a CHAPITAS.TUBO_M). El cuerpo de aluminio con las dos costuras del
    enrollado, la FAJA DE CINTA que lo cierra, y la TAPA de carton en la punta que sale primero."""
    g = vacio(T, 'chafita')
    L, r = 0.8, 0.19                                   # medio largo y radio, a x10
    alu = K['mat_cel']('aluminio', '#d4dce1', True)      # con el destello duro: es chapa
    loft('cuerpo', [(-L, r, r, 0), (L, r, r, 0)], g, alu, n=16, cerrar=(False, False))
    costura = K['mat_cel']('costura', '#8f9aa1')
    for z in (-0.42, 0.42):
        loft('costura', [(z - 0.02, r + 0.004, r + 0.004, 0), (z + 0.02, r + 0.004, r + 0.004, 0)], g, costura, n=16, cerrar=(False, False))
    loft('cinta', [(-0.10, r + 0.008, r + 0.008, 0), (0.10, r + 0.008, r + 0.008, 0)], g, K['mat_cel']('cinta', '#e2dcc4'), n=16, cerrar=(False, False))
    disco('tapa', (0, 0, L + 0.005), r * 0.98, g, K['mat_cel']('carton', '#a8865a'))
    disco('culo', (0, 0, -L - 0.005), r * 0.98, g, K['mat_cel']('culo', '#7d878d'))
    return g

def municion_tira(T, K, var=0):
    """UNA TIRA DE CHAFITAS (8/10/2026, con la foto del autor: un puñado de cintas de aluminio
    arrugadas). Lo que sale del tubo y forma la NUBE: una CINTA PLANA —el ancho de un tallarin, salieron
    de la maquina de la fabrica Napoli—, de 7 cm de largo (La Nacion, 15/4/2024: un cuarto de la onda
    del radar del Sea Dart), RETORCIDA y ARRUGADA, cada variante `var` a su manera. Modelada a x10 como
    el tubo. Con el destello duro del material: lo que la hace brillar es que la cinta, al doblarse,
    agarra la luz en un pedazo y no en otro — eso es la nube titilando."""
    import random
    rnd = random.Random(1000 + int(var))
    g = vacio(T, 'tira%d' % int(var))
    Lm, w, n = 0.35, 0.05, 18                         # medio largo, medio ancho (x10), tramos
    giro = rnd.uniform(1.5, 4.0) * rnd.choice((-1, 1))
    olas = [(rnd.uniform(0.03, 0.09), rnd.uniform(6, 14), rnd.uniform(0, 6.28)) for _ in range(2)]
    dobla = rnd.uniform(-0.6, 0.6)
    bm = bmesh.new(); filas = []
    for i in range(n + 1):
        u = i / n; z = -Lm + 2 * Lm * u
        th = giro * u + rnd.uniform(-0.25, 0.25)            # se retuerce, con quiebres
        y0 = sum(a * math.sin(k * z + f) for a, k, f in olas)   # la arruga
        x0 = dobla * (u - 0.5) ** 2                          # y se curva
        fila = []
        for sgn in (-1, 1):
            ww = w * (1 + rnd.uniform(-0.25, 0.15))            # el canto irregular del corte
            fila.append(bm.verts.new((x0 + sgn * ww * math.cos(th), y0 + sgn * ww * math.sin(th), z)))
        filas.append(fila)
    for a, b in zip(filas, filas[1:]): bm.faces.new((a[0], a[1], b[1], b[0]))
    me = bpy.data.meshes.new('tira'); bm.to_mesh(me); bm.free()
    ob = _obj('tira', me, g, K['mat_cel']('aluminio', '#d4dce1', True))
    sol = ob.modifiers.new('espesor', 'SOLIDIFY'); sol.thickness = 0.008     # que se vea de los dos lados
    return g

def municion_bengala(T, K, fase='0'):
    """LA BENGALA DEL CARTUCHO (8/10/2026, el autor: "cada cartucho de chaff tenia una bengala dentro"…
    "puede ser literal una bengalita marron con fuego y humo saliendo, y un poco de brillo"). Un TUBITO
    DE CARTON marron con su tapa, ardiendo por la punta de abajo: la llama naranja con el corazon
    blanco (ardia a 500 °C, La Nacion). El humo lo pone el juego (game.js, drawChapitas). `fase` (0-7)
    la inclina un poco y hace latir el fuego: son los cuadros de la hoja. (La de verdad colgaba de un
    paracaidas; el autor la prefiere asi, sin el.)"""
    f = int(fase)
    g = vacio(T, 'bengala', (0, 0, 0), (0, 0, 0.35 + math.sin(f / 8 * 2 * math.pi) * 0.12))
    hueso('carton', g, K['mat_cel']('carton', '#7a5232'), (0, 0.42, 0), (0, -0.12, 0), 0.075, 0.075, seg=10)
    for y in (0.30, 0.0):
        hueso('vuelta', g, K['mat_cel']('vuelta', '#5e3d24'), (0, y + 0.02, 0), (0, y - 0.02, 0), 0.079, 0.079, seg=10)
    hueso('tapa', g, K['mat_cel']('tapa', '#a33a24'), (0, 0.47, 0), (0, 0.41, 0), 0.08, 0.08, seg=10)
    late = 1 + 0.3 * math.sin(f * 2.3)
    hueso('llama', g, K['mat_emisivo']('llama', '#ff8a2a'), (0, -0.12, 0), (0, -0.12 - 0.30 * late, 0), 0.10 * late, 0.0, seg=10)
    hueso('llama2', g, K['mat_emisivo']('llama2', '#ffd36b'), (0, -0.12, 0.04), (0, -0.12 - 0.18 * late, 0.04), 0.065 * late, 0.0, seg=8)
    elipsoide('nucleo', (0, -0.15, 0.09), (0.05, 0.045, 0.03), g, K['mat_emisivo']('nucleo', '#fff7dc'), seg=8, anillos=6)
    return g
