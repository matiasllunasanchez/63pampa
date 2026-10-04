# EL HORNO DE BLENDER PARA LAS HOJAS DE ENEMIGOS (fase 2, 3/10/2026: los aviones enemigos).
#
#   blender --background --factory-startup --python tools/blender/hornear_hoja.py -- --hoja harrier
#   ...  -- --hoja harrier --guardar out/harrier.blend      (la escena, para abrirla y rotarla)
#
# EL MISMO ENCUADRE QUE tools/bake_enemies.html, numero por numero (las hojas viven en
# tools/blender/hojas.py): camara de FRENTE, apenas por arriba, con el fov y la distancia de cada hoja;
# el modelo dado vuelta hacia la camara (`baseYaw` + `quarter`) y las poses en grupos separados —
# el yaw por fuera del alabeo. La luz, el material de bandas y la pintura son los de hornear.py (los
# aviones jugables): un solo horno.
#
# Escribe tools/blender/out/hojas/<hoja>/f_<i>.png (un cuadro por pose, en el orden de la hoja) y
# puntos.json (las anclas proyectadas, si la hoja las pide). Lo arma tools/blender/armar_enemigos.py.
import bpy, bmesh, importlib.util, json, math, os, sys
from mathutils import Matrix

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

def _cargar(nombre, archivo):
    spec = importlib.util.spec_from_file_location(nombre, os.path.join(AQUI, archivo))
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod

H = _cargar('horno_bl', 'hornear.py')          # el horno de los aviones: escena, luz, materiales
HOJAS = _cargar('hojas_bl', 'hojas.py').HOJAS
HOJA = H.arg('--hoja')
S = HOJAS[HOJA]
OUT = os.path.join(AQUI, H.arg('--out', 'out/hojas/' + HOJA))
GUARDAR = H.arg('--guardar')

# ---------------- los modelos ----------------
def modelo_puente(archivo, padre):
    """Un modelo de three.js, IDENTICO (tools/blender/exportar_run.js lo vuelca a JSON): cada pieza
    con su color, cel shading, sombreado suave donde la pieza es curva y duro en las aristas. El
    barrido del rotor (la pieza translucida) sigue translucido."""
    d = json.load(open(os.path.join(AQUI, 'out', 'puente', archivo + '.json')))
    raiz = bpy.data.objects.new(archivo, None)
    bpy.context.scene.collection.objects.link(raiz)
    raiz.parent = padre
    mats = {}
    for i, p in enumerate(d['piezas']):
        me = bpy.data.meshes.new('p%d' % i)
        me.from_pydata([tuple(v) for v in p['verts']], [], [tuple(t) for t in p['tris']])
        me.validate()
        bm = bmesh.new(); bm.from_mesh(me)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
        bm.to_mesh(me); bm.free()
        me.shade_smooth()
        me.set_sharp_from_angle(angle=math.radians(35))
        op = p.get('opacidad', 1)
        k = (p['color'], p['emisiva'], op)
        if k not in mats:
            if p['emisiva']: m = H.mat_emisivo('m%d' % len(mats), p['color'])
            else: m = H.mat_cel('m%d' % len(mats), p['color'])
            if op < 1: translucido(m, op)
            mats[k] = m
        me.materials.append(mats[k])
        ob = bpy.data.objects.new(('barrido%d' if op < 1 else 'p%d') % i, me)
        bpy.context.scene.collection.objects.link(ob)
        ob.parent = raiz
        if op < 1: ob.visible_shadow = False        # el barrido del rotor no tapa el sol
    return raiz

def translucido(m, op):
    """El barrido del rotor: el mismo material, mezclado con transparente a la opacidad de three."""
    nt = m.node_tree; N = nt.nodes; L = nt.links
    out = next(n for n in N if n.type == 'OUTPUT_MATERIAL')
    sup = out.inputs['Surface'].links[0].from_socket
    tr = N.new('ShaderNodeBsdfTransparent')
    mx = N.new('ShaderNodeMixShader'); mx.inputs[0].default_value = op
    L.new(tr.outputs[0], mx.inputs[1]); L.new(sup, mx.inputs[2])
    L.new(mx.outputs[0], out.inputs['Surface'])
    if hasattr(m, 'surface_render_method'): m.surface_render_method = 'BLENDED'
    else: m.blend_method = 'BLEND'

def recortar(clip):
    """EL PLANO DE RECORTE de bake_common.js (`clipY`): nada por debajo de esa altura del MUNDO de
    three (la z de Blender) se hornea. Lo piden los buques: el borde de abajo del contenido ES la
    linea de flotacion, y de ahi se ancla el sprite. Va en cada material: lo de abajo, transparente."""
    for m in bpy.data.materials:
        if not m.use_nodes: continue
        nt = m.node_tree; N = nt.nodes; L = nt.links
        out = next((n for n in N if n.type == 'OUTPUT_MATERIAL'), None)
        if not out or not out.inputs['Surface'].links: continue
        sup = out.inputs['Surface'].links[0].from_socket
        geo = N.new('ShaderNodeNewGeometry')
        z = N.new('ShaderNodeSeparateXYZ'); L.new(geo.outputs['Position'], z.inputs[0])
        arriba = N.new('ShaderNodeMath'); arriba.operation = 'GREATER_THAN'; arriba.inputs[1].default_value = clip
        L.new(z.outputs['Z'], arriba.inputs[0])
        tr = N.new('ShaderNodeBsdfTransparent')
        mx = N.new('ShaderNodeMixShader')
        L.new(arriba.outputs[0], mx.inputs[0]); L.new(tr.outputs[0], mx.inputs[1]); L.new(sup, mx.inputs[2])
        L.new(mx.outputs[0], out.inputs['Surface'])

def construir(fuente, T):
    tipo, nombre = fuente.split(':', 1)
    if tipo == 'puente':
        return modelo_puente(nombre, T)
    K = dict(mat_cel=H.mat_cel, mat_cel_nodo=H.mat_cel_nodo, mat_emisivo=H.mat_emisivo, lin=H.lin,
             perilla=H.perilla, mezcla=H.mezcla, ocultar_si=H.ocultar_si, controles=bool(GUARDAR),
             translucido=translucido)
    nom, *args = nombre.split(':')
    # los modelos hechos en Blender: los aviones enemigos (modelos_enemigos.py), los helicopteros
    # (modelos_helos.py), los buques (modelos_buques.py), lo de tierra (modelos_tierra.py) y los restos (modelos_restos.py)
    for archivo in ('modelos_enemigos.py', 'modelos_helos.py', 'modelos_buques.py', 'modelos_tierra.py', 'modelos_restos.py'):
        mod = _cargar(archivo[:-3] + '_bl', archivo)
        if hasattr(mod, nom): return getattr(mod, nom)(T, K, *args)
    raise KeyError('no hay modelo de Blender que se llame ' + nom)

# ---------------- la camara del horno de enemigos ----------------
def camara(T):
    """makeCam de bake_enemies.html: (0, 2.0, dist) inclinada `elev` grados por DEBAJO del objeto
    (girando sobre el, la distancia se conserva), mirando a (0, lookY, 0), con el fov VERTICAL de la
    hoja tal cual (sin `ref`: el aspecto del cuadro es el de siempre)."""
    e = math.radians(S.get('elev', 0)); d = S.get('dist', 0)
    # `pos` (las PARTES y la MUNICION): la camara fija de su horneador, tal cual
    cam = dict(fov=S.get('fov', 24), ref=S['fw'] / S['fh'],
               pos=S.get('pos') or (0, 2.0 * math.cos(e) - d * math.sin(e), d * math.cos(e)),
               lookY=S.get('lookY', 0.2))
    return H.camara(T, cam)

def posar(raiz, fr):
    """Las tres capas de rotacion del horno de three, de adentro hacia afuera: el volteo hacia la
    camara (baseYaw + quarter), el ALABEO sobre su eje y el YAW por fuera."""
    if 'rots' in fr:
        # LAS PARTES Y LA MUNICION no se dan vuelta hacia la camara: sus horneadores encadenan sus
        # propios giros (de afuera hacia adentro, como los grupos de three)
        m = Matrix.Identity(4)
        for eje, ang in fr['rots']: m = m @ Matrix.Rotation(ang, 4, eje)
        raiz.matrix_basis = m
        return
    base = S.get('baseYaw', math.pi) + S.get('quarter', 0)
    raiz.matrix_basis = (Matrix.Rotation(fr.get('yaw', 0), 4, 'Y') @ Matrix.Rotation(fr.get('roll', 0), 4, 'Z')
                         @ Matrix.Rotation(base, 4, 'Y'))

def puntos(cam_T):
    """LAS ANCLAS (la Chancha: los cuatro conos de helice y la boca del pod): el punto del modelo
    proyectado con la camara del horno, en pixeles de la hoja — como __SHEETS_META de three. Se
    proyectan sobre el modelo VOLTEADO y sin pose, igual que alla."""
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Vector
    sc = bpy.context.scene
    base = S.get('baseYaw', math.pi) + S.get('quarter', 0)
    out = []
    for p in S.get('puntos', []):
        v = Matrix.Rotation(base, 4, 'Y') @ Vector(p)
        c = world_to_camera_view(sc, sc.camera, cam_T.matrix_world @ v)
        out.append([round(c.x * S['fw'], 2), round((1 - c.y) * S['fh'], 2)])
    return out

if __name__ == '__main__':
    # `--escala N`: el mismo encuadre N veces mas grande (para mirar el MODELO, no la hoja)
    esc = int(H.arg('--escala', '1'))
    H.FW, H.FH = S['fw'] * esc, S['fh'] * esc
    sc = H.limpiar()
    T = H.vacio_tres()
    camara(T)
    H.sol(T)
    # un modelo por FUENTE distinta (el rotor en sus dos fases son dos), prendido solo en su cuadro
    fuentes = {}
    for fr in S['frames']:
        if fr['modelo'] not in fuentes: fuentes[fr['modelo']] = construir(fr['modelo'], T)
    if 'clipY' in S: recortar(S['clipY'])
    def mostrar(raiz):
        for r in fuentes.values():
            for o in [r] + list(r.children_recursive): o.hide_render = o.hide_viewport = r is not raiz
    if GUARDAR:
        primero = fuentes[S['frames'][0]['modelo']]
        mostrar(primero); posar(primero, S['frames'][S.get('nivelado', 0)])
        H.GUARDAR = GUARDAR
        H.guardar(T, primero)
    else:
        os.makedirs(OUT, exist_ok=True)
        for i, fr in enumerate(S['frames']):
            raiz = fuentes[fr['modelo']]
            mostrar(raiz); posar(raiz, fr)
            bpy.context.view_layer.update()
            sc.render.filepath = os.path.join(OUT, 'f_%d.png' % i)
            bpy.ops.render.render(write_still=True)
        json.dump({'puntos': puntos(T)}, open(os.path.join(OUT, 'puntos.json'), 'w'))
        print('HORNEADO', OUT)
