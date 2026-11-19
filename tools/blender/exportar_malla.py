# EXPORTA UN AVION COMO MALLA LOW-POLY PARA EL 3D (las islas reales, prototipo I0 —
# docs/proyecto/ANALISIS_ISLAS_REALES.md). Pedido del autor, 19/11: "usar la misma logica que se uso para
# armar el avioncito de Dusk Patrol, pero con los nuestros desde Blender".
#
#   /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
#       --python tools/blender/exportar_malla.py -- --modelo sky --out assets/mallas/sky.js
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
OUT = arg('--out', 'assets/mallas/sky.js')
MAX_TRIS = int(arg('--max-tris', '2400'))
# `--capa tanques_ala|bombas_ala|…`: exporta SOLO esa capa de carga (sus piezas y su pilon, hornear.py
# PIEZAS_CAPA), sin el avion. El juego la cuelga encima segun la configuracion (data/cargas.js `capasDe`).
CAPA = arg('--capa')     # el caza de Dusk Patrol anda por los cientos: low-poly de verdad
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
         cargas=bool(CAPA), controles=False, insignias=False)
# LOS DE TIERRA (tools/blender/modelos_tierra.py: la BASE COSTERA del pasillo, los blancos de las islas)
# vienen de su modulo y con su escala: `--k` = unidades del modelo por metro
TIERRA = arg('--tierra')
# `--modulo enemigos|buques|tierra|soldados` (19/11, el teatro de las islas — docs/proyecto/PLAN_TEATRO_MALVINAS.md):
# cualquier modelo de tools/blender/modelos_<modulo>.py, en sus unidades (`--k 1`); el juego lo lleva a metros
# por su medida real (systems/islas/teatro3d.js MEDIDA)
MODULO = arg('--modulo')
if MODULO:
    spec6 = importlib.util.spec_from_file_location('modelos_md', os.path.join(AQUI, 'modelos_%s.py' % MODULO))
    mmd = importlib.util.module_from_spec(spec6); spec6.loader.exec_module(mmd)
    raiz = getattr(mmd, MODELO)(T, K)
    TIERRA = TIERRA or 'modulo'
elif TIERRA:
    spec5 = importlib.util.spec_from_file_location('modelos_ti', os.path.join(AQUI, 'modelos_tierra.py'))
    mti = importlib.util.module_from_spec(spec5); spec5.loader.exec_module(mti)
    raiz = getattr(mti, MODELO)(T, K)
else:
    raiz = mod.construir(MODELO, T, K) if MODELO in getattr(mod, 'FICHAS', {}) else getattr(mod, MODELO)(T, K)
# LA ESCALA DE CADA MODELO, para volver a METROS: los cazas van con la del A-4 (K_A4); los de las misiones
# sueltas y los helicopteros traen la suya en la ficha (`k`, achicada para que entren en el cuadro del
# sprite); el Hercules usa otra cuenta (modelos_hercules.ESCALA: su envergadura en el modelo es 2 x 11 x
# ESCALA) y se lleva a los 40,4 m reales. LA ESCALA SALE DEL MODELO, NO DE LO EXPORTADO: medir lo exportado
# estiraba las capas de carga (los racks de bombas, solos) hasta 40 m de envergadura — "una nave de Star Wars".
if MODELO == 'herc':
    spec4 = importlib.util.spec_from_file_location('modelos_herc', os.path.join(AQUI, 'modelos_hercules.py'))
    mh = importlib.util.module_from_spec(spec4); spec4.loader.exec_module(mh)
    K_A4 = 2 * 11 * mh.ESCALA / 40.4
if MODELO not in getattr(mod, 'FICHAS', {}) and MODELO in getattr(mod, 'AVIONES_SECUNDARIAS', ()):
    spec3 = importlib.util.spec_from_file_location('modelos_av', os.path.join(AQUI, 'modelos_aviones.py'))
    mav = importlib.util.module_from_spec(spec3); spec3.loader.exec_module(mav)
    K_A4 = mav.FICHAS[MODELO]['k']
if TIERRA: K_A4 = float(arg('--k', '0.0833'))
print('ESCALA', MODELO, K_A4)
bpy.context.view_layer.update()

# las piezas visibles, con sus modificadores aplicados
dg = bpy.context.evaluated_depsgraph_get()
a_tres = T.matrix_world.inverted()
MIAS = set()
if CAPA:
    for grupo in H.PIEZAS_CAPA[CAPA]: MIAS.update(o.name for o in K['piezas'].get(grupo, []))
pos, col = [], []
piezas = []
for ob in raiz.children_recursive:
    if ob.type != 'MESH' or ob.name.startswith('sonda'): continue
    if CAPA:
        if ob.name not in MIAS: continue
    elif ob.hide_render: continue
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
# LOS ROTORES de los helicopteros (modelos_aviones._helicoptero anota `raiz['rotores']`): la malla sale SIN
# las palas principales, como las hojas de vuelo, y el juego las pone girando. Van en metros:
# [x, y, z, radio, palas, cuerda].
rotores = []
if 'rotores' in raiz.keys():
    for r in json.loads(raiz['rotores']):
        rotores.append([round(r[0] / K_A4, 3), round(r[1] / K_A4, 3), round(r[2] / K_A4, 3), round(r[3] / K_A4, 3), int(r[4]), round(r[5] / K_A4, 3)])
CLAVE = MODELO + ('__' + CAPA if CAPA else '')
dato = json.dumps({'modelo': CLAVE, 'tris': n, 'pos': pos, 'col': col, 'rotores': rotores}, separators=(',', ':'))
if ruta.endswith('.js'):
    # COMO SCRIPT y no como JSON: el juego carga cada avion RECIEN cuando vuela (systems/islas/avion3d.js
    # agrega un <script>), y un <script> anda por file:// en Electron, donde fetch de un .json no.
    dato = 'window.__MALLAS=window.__MALLAS||{};window.__MALLAS[%s]=%s;\n' % (json.dumps(CLAVE), dato)
open(ruta, 'w').write(dato)
print('EXPORTADO', ruta, os.path.getsize(ruta), 'bytes')
