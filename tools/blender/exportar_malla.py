# EXPORTA UN AVION COMO MALLA LOW-POLY PARA EL 3D (las islas reales, prototipo I0 —
# docs/proyecto/ANALISIS_ISLAS_REALES.md). Pedido del autor, 19/11: "usar la misma logica que se uso para
# armar el avioncito de Dusk Patrol, pero con los nuestros desde Blender".
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
#       --python tools/blender/exportar_malla.py -- --modelo sky --out src/data/mallas/sky.json
#
# EL MISMO MODELO DEL HORNO (modelos.py → `construir`), con un cambio: los materiales no llevan luz. Cada
# pieza se pinta con su COLOR BASE emitido (la pintura procedural entera: manchas, panza, marcas,
# escarapelas, la bandera de la deriva) y Cycles lo HORNEA a un color por esquina. Despues cada triangulo se
# queda con el promedio de sus esquinas: una cara, un color — el caza de Dusk Patrol esta hecho asi, y la
# luz en tres tonos y el contorno los pone el juego (systems/islas/avion3d.js).
#
# Salida, en el espacio de three (y arriba, nariz hacia -z) y en METROS (el modelo viene en unidades de
# horno: K_A4 = 0,61 por metro):
#   { "tris": n, "pos": [x,y,z, ...] (9 por triangulo), "col": [r,g,b, ...] (3 por triangulo, sRGB 0..1) }
import bpy, bmesh, json, math, os, sys, importlib.util
from mathutils import Matrix

AQUI = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
MODELO = arg('--modelo', 'sky')
OUT = arg('--out', 'src/data/mallas/sky.json')
MAX_TRIS = int(arg('--max-tris', '2400'))     # el caza de Dusk Patrol anda por los cientos: low-poly de verdad
K_A4 = 0.61

# el horno, como modulo (su `main` no corre al importarlo)
spec = importlib.util.spec_from_file_location('horno', os.path.join(AQUI, 'hornear.py'))
H = importlib.util.module_from_spec(spec); spec.loader.exec_module(H)

def emisivo_nodo(nombre, fbase, brillo=False):
    """El material SIN LUZ: el color base, emitido tal cual. Es lo que se hornea."""
    m = bpy.data.materials.new(nombre)
    m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    em = N.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1
    L.new(fbase(nt), em.inputs['Color'])
    L.new(em.outputs[0], out.inputs['Surface'])
    return m

def emisivo(nombre, color_hex, brillo=False):
    def base(nt):
        rgb = nt.nodes.new('ShaderNodeRGB'); rgb.outputs[0].default_value = (*H.lin(color_hex), 1)
        return rgb.outputs[0]
    return emisivo_nodo(nombre, base)

def a_srgb(c):
    return c * 12.92 if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055

H.limpiar()
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.samples = 1
sc.cycles.device = 'CPU'
T = H.vacio_tres()
spec2 = importlib.util.spec_from_file_location('modelos_bl', os.path.join(AQUI, 'modelos.py'))
mod = importlib.util.module_from_spec(spec2); spec2.loader.exec_module(mod)
K = dict(mat_cel=emisivo, mat_cel_nodo=emisivo_nodo, mat_emisivo=H.mat_emisivo, lin=H.lin,
         perilla=H.perilla, mezcla=H.mezcla, ocultar_si=H.ocultar_si,
         cargas=False, controles=False, insignias=False)
raiz = mod.construir(MODELO, T, K) if MODELO in getattr(mod, 'FICHAS', {}) else getattr(mod, MODELO)(T, K)
bpy.context.view_layer.update()

# las piezas visibles, con sus modificadores aplicados
dg = bpy.context.evaluated_depsgraph_get()
a_tres = T.matrix_world.inverted()
pos, col = [], []
piezas = []
for ob in raiz.children_recursive:
    if ob.type != 'MESH' or ob.hide_render or ob.name.startswith('sonda'): continue
    ev = ob.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(ev, depsgraph=dg)
    pieza = bpy.data.objects.new('x_' + ob.name, me)
    sc.collection.objects.link(pieza)
    pieza.matrix_world = ob.matrix_world.copy()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.triangulate(bm, faces=bm.faces[:]); bm.to_mesh(me); bm.free()
    piezas.append(pieza)
total = sum(len(p.data.polygons) for p in piezas)
# LOW-POLY: se colapsan aristas en cada pieza por igual hasta entrar en MAX_TRIS (las piezas chicas,
# que ya son pocas caras, no bajan de 8 triangulos para no desaparecer)
ratio = min(1.0, MAX_TRIS / max(1, total))
print('TRIANGULOS ORIGINALES', total, 'ratio', round(ratio, 3))
for pieza in piezas:
    me = pieza.data
    if ratio < 1.0 and len(me.polygons) > 8:
        bpy.ops.object.select_all(action='DESELECT')
        pieza.select_set(True); bpy.context.view_layer.objects.active = pieza
        dm = pieza.modifiers.new('bajar', 'DECIMATE'); dm.ratio = max(ratio, 8 / len(me.polygons))
        bpy.ops.object.modifier_apply(modifier='bajar')
        bm = bmesh.new(); bm.from_mesh(pieza.data); bmesh.ops.triangulate(bm, faces=bm.faces[:]); bm.to_mesh(pieza.data); bm.free()
for pieza in piezas:
    me = pieza.data
    me.color_attributes.new('hor', 'FLOAT_COLOR', 'CORNER')
    me.color_attributes.active_color = me.color_attributes['hor']
    bpy.ops.object.select_all(action='DESELECT')
    pieza.select_set(True); bpy.context.view_layer.objects.active = pieza
    try:
        bpy.ops.object.bake(type='EMIT', target='VERTEX_COLORS')
    except Exception as e:
        print('NO HORNEO', pieza.name, e)
    me = pieza.data
    ca = me.color_attributes['hor'].data
    M = a_tres @ pieza.matrix_world
    for p in me.polygons:
        vs = [M @ me.vertices[me.loops[li].vertex_index].co for li in p.loop_indices]
        if len(vs) != 3: continue
        for v in vs: pos.extend((round(v.x / K_A4, 4), round(v.y / K_A4, 4), round(v.z / K_A4, 4)))
        c = [sum(ca[li].color[k] for li in p.loop_indices) / 3 for k in range(3)]
        col.extend(round(a_srgb(max(0.0, min(1.0, x))), 4) for x in c)

n = len(col) // 3
print('TRIANGULOS', n)
ruta = OUT if os.path.isabs(OUT) else os.path.join(AQUI, '..', '..', OUT)
os.makedirs(os.path.dirname(ruta), exist_ok=True)
json.dump({'modelo': MODELO, 'tris': n, 'pos': pos, 'col': col}, open(ruta, 'w'), separators=(',', ':'))
print('EXPORTADO', ruta, os.path.getsize(ruta), 'bytes')
