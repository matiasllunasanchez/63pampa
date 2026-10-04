# EL FUEGO, HECHO EN BLENDER (4/10/2026). Pedido del autor: "el fuego detras de los Harrier y el fuego en
# los buques es demasiado cuadrado, ¿podemos usar Blender para hacer fuego?". Hasta hoy los dos se
# dibujaban por codigo con rectangulos apilados (render/caza.js `drawTobera`, render/blanco.js `llama`,
# render/pulso.js): se leian como cuadrados naranjas.
#
# Es fuego de DIBUJO, no de simulacion: LENGUAS ANIDADAS (rojo apagado afuera, naranja, amarillo, y el
# nucleo casi blanco) con el borde que ONDULA, en bandas duras como el resto del horno. Cada cuadro mueve
# la onda — la hoja entera es un parpadeo — y de la punta se desprenden lenguitas sueltas. Todo
# determinista (senos, no azar): la hoja sale igual cada horneada.
#
#   llama(fase, variante)   la llama de pie (los focos sobre la cubierta de los buques), base en y = 0
#   tobera_fuego(fase)      la boca encendida vista DE PUNTA (la del Harrier de cola): anillos en estrella
import math
import bpy, bmesh

CAPAS = ('#cf4d16', '#f07c22', '#ffb43c', '#ffe08a', '#fff6d8')   # de afuera hacia el nucleo (caza.js FL)

def _poligono(nombre, padre, mat, puntos, z):
    """Un poligono plano de cara a la camara (+z), triangulado en abanico desde su centro."""
    bm = bmesh.new()
    cx = sum(p[0] for p in puntos) / len(puntos); cy = sum(p[1] for p in puntos) / len(puntos)
    c = bm.verts.new((cx, cy, z))
    vs = [bm.verts.new((x, y, z)) for x, y in puntos]
    for i in range(len(vs)): bm.faces.new((c, vs[i], vs[(i + 1) % len(vs)]))
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    me.materials.append(mat)
    ob = bpy.data.objects.new(nombre, me)
    bpy.context.scene.collection.objects.link(ob); ob.parent = padre
    ob.visible_shadow = False
    return ob

def _raiz(T, nombre):
    r = bpy.data.objects.new(nombre, None)
    bpy.context.scene.collection.objects.link(r); r.parent = T
    return r

def _onda(y, f, v, k):
    """La ondulacion del borde: dos senos que se corren con el cuadro `f` (y una semilla por variante)."""
    return 0.16 * math.sin(4.2 * y - f * 1.57 + v * 2.1 + k) + 0.08 * math.sin(9.5 * y + f * 2.3 + v * 1.3 + 2 * k)

def llama(T, K, fase='0', variante='0'):
    f, v = int(fase), int(variante)
    raiz = _raiz(T, 'llama')
    ALTO, ANCHO = 2.35, 0.62
    for i, color in enumerate(CAPAS):
        esc_a = 1.0 - i * 0.17                       # cada lengua de adentro, mas baja…
        esc_w = 1.0 - i * 0.19                       # …y mas angosta
        alto = ALTO * esc_a * (0.92 + 0.08 * math.sin(f * 1.9 + v + i))
        N = 14; izq, der = [], []
        for k in range(N + 1):
            t = k / N; y = t * alto
            # el perfil de la llama: panza abajo, cintura y PUNTA, que se va de costado
            w = ANCHO * esc_w * (math.sin(math.pi * min(1.0, t * 1.15 + 0.12)) ** 0.8) * (1 - t) ** 0.35
            balanceo = 0.22 * t * t * math.sin(f * 0.8 + v * 1.7)
            izq.append((-w * (1 + _onda(y, f, v, 0.0 + i)) + balanceo, y))
            der.append((w * (1 + _onda(y, f, v, 1.3 + i)) + balanceo, y))
        puntos = der + list(reversed(izq[1:-1]))
        _poligono('lengua%d' % i, raiz, K['mat_emisivo']('fuego%d' % i, color), puntos, 0.02 * i)
    # LAS LENGUITAS SUELTAS: se desprenden de la punta y suben, una o dos por cuadro
    for j in range(2):
        u = ((f / 8 + j * 0.5 + v * 0.25) % 1.0)
        if u > 0.85: continue
        y0 = ALTO * (0.78 + u * 0.5); x0 = 0.18 * math.sin(f * 1.1 + j * 2 + v)
        r = 0.13 * (1 - u)
        pts = [(x0 + r * math.sin(a) * (1 - 0.4 * (a > math.pi)), y0 + r * 1.6 * math.cos(a)) for a in [k * 2 * math.pi / 8 for k in range(8)]]
        _poligono('suelta', raiz, K['mat_emisivo']('fuego%d' % (1 + j), CAPAS[1 + j]), pts, 0.01)
    return raiz

def tobera_fuego(T, K, fase='0'):
    f = int(fase)
    raiz = _raiz(T, 'tobera')
    for i, color in enumerate(CAPAS):
        r = 1.0 * (1 - i * 0.19)
        N = 16; pts = []
        for k in range(N):
            a = 2 * math.pi * k / N
            # la ESTRELLA: puntas que laten distinto en cada cuadro (la llama vista de punta)
            pico = 0.20 * max(0.0, math.sin(a * 5 + f * 1.9 + i)) + 0.08 * math.sin(a * 3 - f * 1.3)
            rr = r * (1 + pico) * (0.9 + 0.1 * math.sin(f * 2.2 + i))
            pts.append((rr * math.cos(a), rr * math.sin(a) * 0.82))
        _poligono('anillo%d' % i, raiz, K['mat_emisivo']('fuego%d' % i, color), pts, 0.02 * i)
    return raiz

# ============================ EL HUMO ============================
# Pedido del autor el mismo dia ("¿y el humo tambien?"): las columnas de humo se dibujaban con cuadrados
# grises que suben. Ahora son BOCANADAS en 3D — un racimo de bultos con LUZ EN BANDAS (el sol de
# atardecer arriba, la panza hundida en sombra), en dos tonos: NEGRO de incendio y GRIS. El juego las
# hace subir, crecer y apagarse con alfa; la hoja da la forma y el volumen.
HUMO = {'negro': '#2e2c29', 'gris': '#7a7b77'}

def bocanada(T, K, variante='0', tono='negro'):
    import importlib.util, os
    spec = importlib.util.spec_from_file_location('modelos_bl_base_h2', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'modelos.py'))
    M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
    v = int(variante)
    raiz = _raiz(T, 'bocanada')
    m = K['mat_cel']('humo', HUMO[tono])
    n = 5 + v % 3
    for i in range(n):
        a = i * 2.399 + v * 0.7
        d = 0.0 if i == 0 else 0.48 + 0.12 * ((i + v) % 3)
        r = (0.62 if i == 0 else 0.34 + 0.08 * ((i * 3 + v) % 4))
        x, y = math.cos(a) * d, math.sin(a) * d * 0.75 + 0.06 * i
        b = M.elipsoide('bulto', (x, y, -0.05 * i), (r, r * 0.92, r), raiz, m, seg=14, anillos=10)
        tx = bpy.data.textures.get('humo_ruido') or bpy.data.textures.new('humo_ruido', 'CLOUDS')
        tx.noise_scale = 0.35
        dm = b.modifiers.new('ruido', 'DISPLACE'); dm.texture = tx; dm.strength = 0.08
    return raiz
