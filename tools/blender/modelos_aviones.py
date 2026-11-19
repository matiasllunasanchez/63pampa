# LOS AVIONES DE LAS MISIONES SECUNDARIAS, jugables en POR LA PATRIA y CICLO DE MUERTE (16/10/2026, el autor:
# "nos faltan los aviones de vuelos de diversion para elegir — revisa todas las misiones que fui poniendo como
# secundarias en el guion y hagamos todos los diseños y aviones que falten"). Salen de
# docs/historia/misiones/MISIONES_SUELTAS.md:
#   S-04 el ESCUADRON FENIX (diversion, guia, puente de radio, fotografia): Learjet 35A, Cessna Citation,
#        Swearingen Merlin, Mitsubishi MU-2, Aerostar, Rockwell Commander y el FMA Guarani II
#   S-01/S-02 el Lockheed SP-2H NEPTUNE de la Armada
#   S-07/S-13/S-14 el FMA IA-58 PUCARA
#   S-09/S-13 el AERMACCHI MB-339A de la Armada (Owen Crippa)
#
# UN ARMADOR PARA TODOS (`avion`), como `jet()` para los cazas pero con lo que estos tienen y los cazas no:
# motores en GONDOLAS con helices o en PODS colgados de la cola, tanques de PUNTA de ala, cola en T o en cruz,
# radomos, ventanillas pintadas. Cada ficha esta EN METROS, con las medidas de verdad (envergadura, largo,
# alto), y se pasa a unidades del modelo con `k`: la del A-4 (0,61) mientras la envergadura entre en el cuadro
# de 84; si no entra, se achica para que abra ENVERGADURA_MAX, y el juego lo dibuja mas grande
# (data/planes.js `escala`, al doble de resolucion `px`). El tren y la carga son los de modelos.py
# (`tren`, `cargas`): las fichas los traen en el mismo formato, ya en unidades del modelo.
#
# TODOS ARGENTINOS (el autor: "todos aviones argentinos, obviamente"): los de la FAA y la Armada con sus
# escarapelas y la bandera en la deriva; los civiles del Fenix con su pintura de empresa y la bandera.
#
# Espacio de three: y arriba, nariz hacia -z. Origen cerca del centro del ala.
import importlib.util, math, os

AQUI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('modelos_bl_base_av', os.path.join(AQUI, 'modelos.py'))
M = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(M)
loft, superficie, elipsoide, disco, caja, _subdiv, mat_pintura = M.loft, M.superficie, M.elipsoide, M.disco, M.caja, M._subdiv, M.mat_pintura
td = lambda g: math.tan(math.radians(g))

K_A4 = 0.61               # unidades del modelo por metro: la escala de los cazas (el A-4 de 8,4 m abre 5,1)
ENVERGADURA_MAX = 7.6     # lo mas que abre un avion en el cuadro de 84 sin cortarse alabeado
def k_de(envergadura):
    return min(K_A4, ENVERGADURA_MAX / envergadura)

VIDRIO = '#25404d'
BLANCO, GRIS_PANZA = '#e6eaec', '#b5bcc1'
VERDE_FAA, ARENA_FAA, PANZA_FAA = '#4c5a39', '#7d6446', '#a6b2b8'

def _raiz(T, nombre):
    import bpy
    r = bpy.data.objects.new(nombre, None)
    bpy.context.scene.collection.objects.link(r)
    r.parent = T
    return r

# ---------------- la conversion de metros a unidades del modelo ----------------
def _km(F):
    """La ficha `F` (en metros) pasada a unidades del modelo con F['k']. Las estaciones de superficies
    conservan su espesor relativo (la cuarta columna)."""
    k = F['k']
    s4 = lambda est: [(a * k, b * k, c * k, d * k) for (a, b, c, d) in est]
    s5 = lambda est: [(e * k, z * k, c * k, t, d * k) for (e, z, c, t, d) in est]
    v = lambda t: tuple(x * k for x in t)
    S = dict(F)
    S['fuselaje'] = s4(F['fuselaje'])
    for clave in ('ala', 'estab', 'deriva', 'dorsal'):
        if F.get(clave): S[clave] = s5(F[clave])
    S['cabinas'] = [(v(c), v(r)) for c, r in F.get('cabinas', [])]
    S['motores'] = [dict(m, **{q: m[q] * k for q in ('x', 'y', 'z0', 'z1', 'r', 'helice', 'pilon_x') if q in m}) for m in F.get('motores', [])]
    S['tanques'] = [dict(t, **{q: t[q] * k for q in ('x', 'y', 'z', 'largo', 'r')}) for t in F.get('tanques', [])]
    S['extras'] = [dict(e, centro=v(e['centro']), radios=v(e['radios'])) if e['tipo'] == 'elipsoide'
                   else dict(e, est=s4(e['est']), x0=e.get('x0', 0.0) * k) for e in F.get('extras', [])]
    S['tomas'] = [dict(t, est=s4(t['est']), x0=t['x0'] * k) for t in F.get('tomas', [])]
    S['aletas'] = [dict(a, x=a['x'] * k, est=s5([(y, z, c, t, 0.0) for (y, z, c, t) in a['est']])) for a in F.get('aletas', [])]
    if F.get('derivas'): S['derivas'] = [s5(d) for d in F['derivas']]
    S['rotores'] = [dict(r, **{q: r[q] * k for q in ('x', 'y', 'z', 'r', 'cuerda', 'mastil') if q in r}) for r in F.get('rotores', [])]
    if F.get('rotor_cola'): S['rotor_cola'] = dict(F['rotor_cola'], **{q: F['rotor_cola'][q] * k for q in ('x', 'y', 'z', 'r', 'cuerda')})
    if F.get('patines'): S['patines'] = {q: ([u * k for u in w] if isinstance(w, list) else w * k) for q, w in F['patines'].items()}
    S['ruedas'] = [tuple(w * k for w in r) for r in F.get('ruedas', [])]
    S['puntales'] = [(v(a), v(b), r * k) for a, b, r in F.get('puntales', [])]
    if F.get('helice_nariz'): S['helice_nariz'] = dict(F['helice_nariz'], **{q: F['helice_nariz'][q] * k for q in ('y', 'z', 'r')})
    if F.get('tren'):
        S['tren'] = {q: (w * k if isinstance(w, float) else w) for q, w in F['tren'].items()}
    if F.get('carga'):
        S['carga'] = {q: (w * k if q in ('ala_x', 'centro_z') else w) for q, w in F['carga'].items()}
    def marcas(P):
        out = []
        for m in P.get('marcas', []):
            m = dict(m)
            for q in ('x', 'y', 'z'):
                if m.get(q): m[q] = (m[q][0] * k, m[q][1] * k)
            if m.get('disco'): m['disco'] = tuple(w * k for w in m['disco'])
            out.append(m)
        return dict(P, marcas=out)
    S['pintura'] = marcas(F['pintura'])
    if F.get('pintura_alas'): S['pintura_alas'] = marcas(F['pintura_alas'])
    if F.get('bandera'): S['bandera'] = (F['bandera'][0] * k, F['bandera'][1] * k)
    return S

# ---------------- el armador ----------------
def _helice(raiz, K, x, y, z, r, palas, mat_pala, mat_cono, sg):
    """La HELICE: el cono y las palas en estrella (quietas: a 84 px una helice girando no se lee, y asi
    la silueta dice "helice"). Gira un poco segun el lado, para que las dos no sean un espejo exacto."""
    _subdiv(loft('cono', [(z - r * 0.32, 0.01, 0.01, y), (z - r * 0.20, r * 0.12, r * 0.12, y), (z, r * 0.16, r * 0.16, y)],
                 raiz, mat_cono, n=12, expo=2.0, cerrar=(True, True), x0=x), 1)
    for i in range(palas):
        a = math.radians(i * 360 / palas + (20 if sg > 0 else -20))
        p = caja('pala', (0, 0, 0), (r * 2 if palas % 2 == 0 and i < palas // 2 else r, r * 0.11, r * 0.035), raiz, mat_pala)
        if palas % 2 == 0:
            if i >= palas // 2: p.hide_render = True; continue
            p.rotation_euler = (0, 0, a)
            p.location = (x, y, z - r * 0.05)
        else:
            p.rotation_euler = (0, 0, a)
            p.location = (x + math.cos(a) * r * 0.5, y + math.sin(a) * r * 0.5, z - r * 0.05)

# LAS CALCOMANIAS: una imagen pegada al costado (el escudo del Fenix). Un cuadrado con la imagen y su alfa
# cortado en seco (pixel art: nada de bordes a medias), sin luz — es pintura, y asi el escudo se lee entero.
ESCUDO_FENIX = os.path.normpath(os.path.join(AQUI, '..', '..', 'assets', 'source', 'ui', 'escudo_fenix.png'))
def _calco(raiz, K, ruta, sg, z, y, alto, x):
    import bpy
    img = bpy.data.images.load(ruta, check_existing=True)
    ancho = alto * img.size[0] / img.size[1]
    me = bpy.data.meshes.new('calco')
    me.from_pydata([(-ancho / 2, -alto / 2, 0), (ancho / 2, -alto / 2, 0), (ancho / 2, alto / 2, 0), (-ancho / 2, alto / 2, 0)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new(); 
    for i, c in enumerate(((0, 0), (1, 0), (1, 1), (0, 1))): uv.data[i].uv = c
    m = bpy.data.materials.get('calco_' + os.path.basename(ruta))
    if not m:
        m = bpy.data.materials.new('calco_' + os.path.basename(ruta)); m.use_nodes = True
        N, L = m.node_tree.nodes, m.node_tree.links
        for n in list(N): N.remove(n)
        tx = N.new('ShaderNodeTexImage'); tx.image = img; tx.interpolation = 'Closest'
        em = N.new('ShaderNodeEmission'); L.new(tx.outputs['Color'], em.inputs['Color'])
        tr = N.new('ShaderNodeBsdfTransparent')
        corte = N.new('ShaderNodeMath'); corte.operation = 'GREATER_THAN'; corte.inputs[1].default_value = 0.5
        L.new(tx.outputs['Alpha'], corte.inputs[0])
        mx = N.new('ShaderNodeMixShader'); L.new(corte.outputs[0], mx.inputs[0]); L.new(tr.outputs[0], mx.inputs[1]); L.new(em.outputs[0], mx.inputs[2])
        out = N.new('ShaderNodeOutputMaterial'); L.new(mx.outputs[0], out.inputs['Surface'])
    me.materials.append(m)
    ob = bpy.data.objects.new('calco', me)
    bpy.context.scene.collection.objects.link(ob)
    ob.parent = raiz
    ob.rotation_euler = (0, sg * math.pi / 2, 0)
    ob.location = (sg * x, y, z)
    return ob

def avion(T, K, F):
    S = _km(F)
    raiz = _raiz(T, F.get('nombre', 'avion'))
    P = S['pintura']
    if K.get('insignias') and F.get('escarapelas'):
        # LAS ESCARAPELAS arriba de cada ala, solo en el selector (como los cazas)
        ex, ez, er = (w * S['k'] for w in F['escarapelas'])
        P = dict(P, marcas=list(P.get('marcas', [])) + [dict(disco=(ex, ez, er * f), color=c)
                                                         for f, c in ((1.0, M.CELESTE), (0.66, M.BLANCO), (0.33, M.CELESTE))])
    piel = mat_pintura(K, 'pintura', P)
    Pa = S.get('pintura_alas', dict(P, marcas=[m for m in P.get('marcas', []) if m.get('disco')]))
    alas = mat_pintura(K, 'alas', Pa)
    deriva = mat_pintura(K, 'deriva', dict(Pa, marcas=[]), bandera=S.get('bandera'))
    vidrio = K['mat_cel']('vidrio', M.CANOPY, brillo=True)
    metal = K['mat_cel']('metal', F.get('metal', '#3a3f40'))
    negro = K['mat_cel']('negro', '#15191b')
    pala = K['mat_cel']('pala', '#22262a')
    cono = K['mat_cel']('cono_helice', F.get('cono', '#9aa3a8'))

    _subdiv(loft('fuselaje', S['fuselaje'], raiz, piel, n=24, expo=F.get('expo', 2.2), cerrar=(True, True)), 2)
    for c, r in S['cabinas']:                       # burbujas (los de entrenamiento y ataque)
        elipsoide('cabina', c, r, raiz, vidrio)
    if S.get('ala'): superficie('ala', S['ala'], raiz, alas, eje='x', espejo=True)
    if S.get('estab'): superficie('estab', S['estab'], raiz, alas, eje='x', espejo=True)
    if S.get('deriva'): superficie('deriva', S['deriva'], raiz, deriva, eje='y')
    for d in S.get('derivas', []):                  # las DOS derivas de punta del Skyvan
        superficie('deriva', d, raiz, deriva, eje='y')
    if S.get('dorsal'): superficie('dorsal', S['dorsal'], raiz, deriva, eje='y')
    # LAS ALETAS chicas (16/10, "mas fieles"): las dos ventrales bajo la cola del Learjet, las de los
    # tanques de punta. Verticales, en ±x; `est` = (y, z del borde de ataque, cuerda, espesor)
    for a in S['aletas']:
        for sg in ((-1, 1) if a['x'] else (1,)):
            est = [(e, z, c, t, sg * a['x']) for (e, z, c, t, _) in a['est']]
            if est[0][0] > est[-1][0]: est = est[::-1]
            superficie('aleta', est, raiz, alas, eje='y')
    for t in S['tomas']:                            # tomas de aire al costado (el MB-339)
        for sg in (-1, 1):
            _subdiv(loft('toma', t['est'], raiz, piel, n=14, expo=2.0, cerrar=(False, True), x0=sg * t['x0']), 1)
            disco('boca', (sg * t['x0'], t['est'][0][3], t['est'][0][0] - 0.005), t['est'][0][1] * 0.75, raiz, negro)
    # LOS MOTORES: gondola con helice, o pod de turbina (con su pilon hasta el fuselaje)
    for m in S['motores']:
        for sg in ((-1, 1) if m.get('par', True) else (1,)):
            x, y, z0, z1, r = sg * m['x'], m['y'], m['z0'], m['z1'], m['r']
            L = z1 - z0
            mat = mat_pintura(K, 'gondola', dict(Pa, marcas=[])) if m.get('pintada', True) else metal
            if m['tipo'] == 'helice':
                est = [(z0, r * 0.62, r * 0.66, y), (z0 + L * 0.08, r * 0.95, r * 0.98, y), (z0 + L * 0.35, r, r * 1.05, y),
                       (z0 + L * 0.75, r * 0.80, r * 0.90, y + r * 0.10), (z1, r * 0.25, r * 0.30, y + r * 0.35)]
                _subdiv(loft('gondola', est, raiz, mat, n=16, expo=m.get('expo', 2.2), cerrar=(True, True), x0=x), 1)
                _helice(raiz, K, x, y, z0 - r * 0.05, m['helice'], m.get('palas', 3), pala, cono, sg)
            else:
                est = [(z0, r * 0.85, r * 0.85, y), (z0 + L * 0.12, r, r, y), (z0 + L * 0.70, r * 0.95, r * 0.95, y),
                       (z1, r * 0.70, r * 0.70, y)]
                _subdiv(loft('pod', est, raiz, mat, n=16, expo=2.0, cerrar=(False, False), x0=x), 1)
                disco('boca', (x, y, z0 + 0.01), r * 0.70, raiz, negro).rotation_euler = (0, 0, 0)
                disco('tobera', (x, y, z1 - 0.02), r * 0.62, raiz, negro)
                if m.get('pilon_x') is not None:      # el pilon hasta el fuselaje
                    px = sg * (m['pilon_x'] + m['x']) / 2
                    caja('pilon', (px, y, z0 + L * 0.5), (abs(m['x'] - m['pilon_x']), r * 0.35, L * 0.45), raiz, mat)
    for t in S['tanques']:                          # tanques de punta de ala
        for sg in (-1, 1):
            x, y, z, l, r = sg * t['x'], t['y'], t['z'], t['largo'], t['r']
            est = [(z - l / 2, 0.01, 0.01, y), (z - l * 0.38, r * 0.70, r * 0.70, y), (z - l * 0.15, r, r, y),
                   (z + l * 0.20, r, r, y), (z + l / 2, r * 0.25, r * 0.25, y)]
            _subdiv(loft('tanque_punta', est, raiz, mat_pintura(K, 'tanque_punta', dict(Pa, marcas=t.get('marcas', []))),
                         n=14, expo=2.0, cerrar=(True, True), x0=x), 1)
    for e in S['extras']:                           # radomos, el aguijon del MAD, la tobera del jet
        mat = {'negro': negro, 'metal': metal, 'piel': piel, 'vidrio': vidrio}.get(e.get('mat', 'piel')) or K['mat_cel']('extra_' + e['mat'], e['mat'])
        if e.get('mat') == 'deriva': mat = deriva
        for sg in ((-1, 1) if e.get('par') else (1,)):
            if e['tipo'] == 'elipsoide':
                c = e['centro']
                elipsoide(e.get('nombre', 'extra'), (sg * c[0], c[1], c[2]), e['radios'], raiz, mat, seg=18, anillos=10)
            else:
                _subdiv(loft(e.get('nombre', 'extra'), e['est'], raiz, mat, n=16, expo=e.get('expo', 2.0), cerrar=(True, True),
                             x0=sg * e['x0']), 1)
    # LO DE LOS HELICOPTEROS (18/11): los rotores, el de cola, los patines y las ruedas fijas
    _helicoptero(raiz, K, S, pala, metal, negro)
    # los PUNTALES del ala alta (el Skyvan)
    for a, b, r in S['puntales']:
        for sg in (-1, 1):
            _tubo('puntal', raiz, alas, (sg * a[0], a[1], a[2]), (sg * b[0], b[1], b[2]), r)
    if S.get('helice_nariz'):                       # la helice en la trompa (el T-34C)
        h = S['helice_nariz']
        _helice(raiz, K, 0.0, h['y'], h['z'], h['r'], h.get('palas', 3), pala, cono, 1)
    # LAS LETRAS de la FAA y la escarapela del fuselaje, de los dos lados (las letras: modelos_hercules._texto,
    # que las pasa a malla; `x` = el costado del fuselaje en esa estacion)
    k = S['k']
    def costado(z, y):
        """Donde esta el costado del fuselaje (x) en la estacion z, a la altura y (unidades del modelo)."""
        for a, b in zip(S['fuselaje'], S['fuselaje'][1:]):
            if a[0] <= z <= b[0]:
                f = (z - a[0]) / ((b[0] - a[0]) or 1); w = a[1] + (b[1] - a[1]) * f; h = a[2] + (b[2] - a[2]) * f
                yc = a[3] + (b[3] - a[3]) * f; q = min(0.99, abs((y - yc) / h)) ** F.get('expo', 2.2)
                return w * (1 - q) ** (1 / F.get('expo', 2.2))
        return 0.1
    if F.get('escudo'):
        # EL ESCUDO DEL ESCUADRON FENIX (16/10, el autor): la calcomania en los dos costados de la trompa
        z, y, alto = (w * k for w in F['escudo'])
        for sg in (-1, 1):
            _calco(raiz, K, ESCUDO_FENIX, sg, z, y, alto, costado(z, y) + 0.01)
    if F.get('letras') or F.get('escarapela_fus'):
        import importlib.util as _iu
        _sp = _iu.spec_from_file_location('modelos_herc_letras', os.path.join(AQUI, 'modelos_hercules.py'))
        H = _iu.module_from_spec(_sp); _sp.loader.exec_module(H)
        for sg in (-1, 1):
            for texto, z, y, alto in F.get('letras', []):
                z, y, alto = z * k, y * k, alto * k
                H._texto(texto, raiz, K, sg, z=z, y=y, alto=alto, x=costado(z, y) + 0.008)
            if F.get('escarapela_fus'):
                z, y, rr = (w * k for w in F['escarapela_fus'])
                for f, c in ((1.0, M.CELESTE), (0.66, M.BLANCO), (0.33, M.CELESTE)):
                    elipsoide('escarapela', (sg * (costado(z, y) + 0.004 + 0.008 * (1 - f) * 3), y, z), (0.012, rr * f, rr * f), raiz,
                              K['mat_cel']('escarapela_' + c, c), seg=18, anillos=8)
    if F.get('fuego'):                              # LA TOBERA ENCENDIDA (el MB-339): de aca mide el juego la llama
        y, z, r = (w * S['k'] for w in F['fuego'])
        for i, (c, f) in enumerate(zip(('#b8341a', '#f07a22', '#ffe6a8'), (1.0, 0.62, 0.30))):
            disco('fuego%d' % i, (0, y, z + 0.01 * i), r * f, raiz, K['mat_emisivo']('fuego%d' % i, c))
    if K.get('cargas'):
        if S.get('carga'): K['piezas'] = M.cargas(raiz, K, S)
        elif S.get('tren'): K['piezas'] = {'tren': M.tren(raiz, K, S)}
        else: K['piezas'] = {'tren': []}           # (los helicopteros: los patines y las ruedas van siempre)
    return raiz

def _tubo(nombre, padre, mat, p0, p1, r, seg=8):
    """Un caño redondo de p0 a p1 (los puntales, los patines)."""
    import bpy, bmesh
    from mathutils import Vector
    v = Vector(p1) - Vector(p0)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=v.length)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    ob = M._obj(nombre, me, padre, mat)
    ob.rotation_mode = 'QUATERNION'
    ob.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(v.normalized())
    ob.location = (Vector(p0) + Vector(p1)) / 2
    return ob

def _helicoptero(raiz, K, S, pala, metal, negro):
    """LOS ROTORES: el mastil, el cubo y las palas QUIETAS (como las helices: a este tamaño un disco girando
    no se lee, y las palas dicen "helicoptero"). El `giro` deja las palas SIMETRICAS de izquierda a derecha:
    armar_juego.py espeja la mitad de la pose nivelada, y una pala cruzada salia en X.
    El rotor de cola en un costado, los patines (Huey, Bell, el Agusta no) y las ruedas fijas (Chinook, Puma)."""
    # LAS PALAS GIRAN EN EL JUEGO (18/11, el autor: "quiza las helices deberian ser independientes y girar
    # solas"): en las hojas de vuelo el rotor se hornea SIN PALAS — solo el mastil y el cubo — y el horno anota
    # donde cae cada rotor en cada pose (`raiz['rotores']`, hornear.py → tips.json `rot`); render/plane.js
    # dibuja las palas encima, girando. Solo el selector (una foto) las lleva horneadas.
    import json
    raiz['rotores'] = json.dumps([[r.get('x', 0.0), r['y'], r['z'], r['r'], r['palas'], r['cuerda']] for r in S['rotores']])
    for r in S['rotores']:
        x, y, z, R, n = r.get('x', 0.0), r['y'], r['z'], r['r'], r['palas']
        m = r.get('mastil', 0.0)
        if m: caja('mastil', (x, y - m / 2, z), (R * 0.02 + 0.03, m, R * 0.02 + 0.03), raiz, metal)
        elipsoide('cubo', (x, y, z), (R * 0.05, R * 0.03, R * 0.05), raiz, metal, seg=12, anillos=6)
        if not K.get('insignias'): continue
        for i in range(n):
            a = math.radians(r.get('giro', 45) + i * 360 / n)
            p = caja('pala', (0, 0, 0), (R, R * 0.008 + 0.012, r['cuerda']), raiz, pala)
            p.rotation_euler = (0, a, 0)
            p.location = (x + math.cos(a) * R / 2, y + 0.01 * i, z - math.sin(a) * R / 2)
    c = S.get('rotor_cola')
    if c:
        elipsoide('cubo_cola', (c['x'], c['y'], c['z']), (0.05, c['r'] * 0.12, c['r'] * 0.12), raiz, metal, seg=10, anillos=6)
        for i in range(c['palas']):
            a = math.radians(c.get('giro', 30) + i * 360 / c['palas'])
            p = caja('pala_cola', (0, 0, 0), (0.025, c['r'], c['cuerda']), raiz, pala)
            p.rotation_euler = (a, 0, 0)
            p.location = (c['x'] + 0.02 * i, c['y'] + math.cos(a) * c['r'] / 2, c['z'] + math.sin(a) * c['r'] / 2)
    P = S.get('patines')
    if P:
        x, y, z0, z1, r = P['x'], P['y'], P['z0'], P['z1'], P['r']
        for sg in (-1, 1):
            _tubo('patin', raiz, metal, (sg * x, y, z0 + r * 6), (sg * x, y, z1), r)
            _tubo('patin', raiz, metal, (sg * x, y + r * 4, z0), (sg * x, y, z0 + r * 6), r)      # la punta levantada
            for zc in P['cruces']:                  # los dos arcos que lo cuelgan del fuselaje
                _tubo('cruz', raiz, metal, (sg * x, y, zc), (sg * x * 0.55, P['y_fus'], zc), r * 0.9)
    for (x, y, z, rr, ancho) in S['ruedas']:
        for sg in ((-1, 1) if x else (1,)):
            elipsoide('rueda', (sg * x, y, z), (ancho / 2, rr, rr), raiz, negro, seg=14, anillos=8)
            caja('pata', (sg * x * 0.92, y + rr * 1.1, z), (ancho * 0.5, rr * 1.4, rr * 0.5), raiz, metal)

# ---------------- las pinturas ----------------
def ventanillas(z0, z1, n, y0, y1, x=(0.3, 9.0), ancho=0.42):
    """Una fila de ventanillas pintadas a los dos costados: `n` rectangulos entre z0 y z1."""
    paso = (z1 - z0) / n
    return [dict(x=x, z=(z0 + i * paso, z0 + i * paso + paso * ancho), y=(y0, y1), color=VIDRIO, arriba=False) for i in range(n)]

def parabrisas(z0, z1, y0, y1, poste=0.035, frente=0.36, laterales=2):
    """EL PARABRISAS CON MARCO Y PANELES (16/10, el autor): en vez de una mancha oscura, los vidrios separados
    por el MARCO, que es la chapa que queda sin pintar entre ellos. Al frente dos paneles con el POSTE del
    medio (|x| < `poste`); al costado, despues del montante, `laterales` ventanas de cabina separadas por sus
    postes; el borde de arriba y el de abajo quedan como marco. Medidas en metros (como la ficha)."""
    L = z1 - z0
    m = 0.06                                    # el ancho del marco
    out = [dict(x=(poste, frente), z=(z0, z0 + L * 0.55), y=(y0 + m, y1 - m), color=VIDRIO, arriba=False)]
    zl0, zl1 = z0 + L * 0.55 + m, z1 + 0.55     # las laterales siguen hacia atras del parabrisas
    paso = (zl1 - zl0) / laterales
    for i in range(laterales):
        out.append(dict(x=(frente + m, 9.0), z=(zl0 + i * paso, zl0 + (i + 1) * paso - m), y=(y0 + m * 1.6, y1 - m * 1.6),
                        color=VIDRIO, arriba=False))
    return out

def civil(franja, y_franja, parabrisas_, ventanas, extra=()):
    """La pintura de un ejecutivo civil o de la FAA: blanco arriba, gris claro abajo, la FRANJA de color a
    lo largo del fuselaje, el parabrisas y las ventanillas."""
    return dict(arriba=[BLANCO], panza=GRIS_PANZA, umbral_panza=-0.55,
                marcas=[dict(y=y_franja, color=franja, arriba=False)]
                       + (parabrisas(parabrisas_['z'][0], parabrisas_['z'][1], *parabrisas_['y']) if isinstance(parabrisas_, dict) else parabrisas_)
                       + ventanas + list(extra))

def camo_faa(extra=()):
    return dict(arriba=[VERDE_FAA, ARENA_FAA], corte=0.5, escala=0.35, panza=PANZA_FAA, marcas=list(extra))

# ============================ LAS FICHAS (en METROS) ============================
FICHAS = {}

# ---- LEARJET 35A (FAA, Grupo 1 Aerofotografico; el T-24 cayo el 7/6 sobre Borbon). 14,83 m de largo,
# 12,04 de envergadura con los tanques de punta, 3,73 de alto. Ala baja con 13° de flecha, los GRANDES
# TANQUES DE PUNTA, cola en T y los dos turbofan TFE731 en pods a los costados de la cola.
FICHAS['learjet'] = dict(
    nombre='Learjet 35A', k=k_de(12.04), expo=2.1,
    # (16/10, "mas fieles", con la foto: la trompa larga y CAIDA, los motores ALTOS a los costados de la cola, las
    # dos aletas ventrales bajo la cola y la aletita al pie de cada tanque de punta)
    fuselaje=[(-7.60, 0.02, 0.02, -0.24), (-7.35, 0.24, 0.20, -0.22), (-6.85, 0.46, 0.42, -0.14), (-6.10, 0.68, 0.68, -0.03),
              (-5.20, 0.80, 0.84, 0.07), (-3.00, 0.84, 0.88, 0.10), (1.60, 0.84, 0.88, 0.10), (3.20, 0.74, 0.79, 0.17),
              (4.80, 0.52, 0.60, 0.33), (6.20, 0.30, 0.36, 0.50), (7.23, 0.12, 0.14, 0.58)],
    aletas=[dict(x=0.30, est=[(0.0, 5.05, 1.10, 0.08), (-0.45, 5.50, 0.55, 0.08)]),
            dict(x=5.55, est=[(-0.45, 0.70, 0.80, 0.08), (-0.85, 1.00, 0.45, 0.08)])],
    ala=[(0.0, -1.55, 3.20, 0.13, -0.55), (0.85, -1.40, 3.00, 0.13, -0.52), (5.35, -0.10, 1.35, 0.10, -0.32)],
    tanques=[dict(x=5.55, y=-0.30, z=-0.35, largo=3.40, r=0.32)],
    deriva=[(0.70, 3.70, 2.70, 0.10, 0.0), (2.55, 5.55, 1.50, 0.10, 0.0)],
    estab=[(0.0, 5.25, 1.45, 0.10, 2.58), (2.25, 6.05, 0.80, 0.10, 2.62)],
    motores=[dict(tipo='jet', x=1.18, y=0.68, z0=2.35, z1=5.05, r=0.44, pilon_x=0.55, pintada=True)],
    pintura=civil('#1f3f7a', (0.02, 0.18), dict(z=(-6.20, -5.30), y=(0.20, 0.80), color=VIDRIO, arriba=False),
                  ventanillas(-4.5, 0.9, 6, 0.30, 0.56, ancho=0.40)),
    bandera=(2.05, 2.50), escarapelas=(3.6, -0.5, 0.55),
    letras=[('FUERZA AEREA ARGENTINA', -1.80, 0.68, 0.20), ('T-24', -4.70, -0.32, 0.30)],
    escarapela_fus=(1.55, 0.10, 0.28),
    escudo=(-6.10, -0.02, 0.55),      # el escudo del Escuadron Fenix, en la trompa
    tren=dict(x=1.30, nariz=-5.70, suelo=-1.45, r=0.30, ancho=0.18),
)
# ---- CESSNA CITATION II (civil, del Fenix). 14,39 m de largo, 15,90 de envergadura, 4,57 de alto. Ala baja
# RECTA, el estabilizador con mucho diedro sobre el cono de cola, la deriva en flecha y dos pods en la cola.
FICHAS['citation'] = dict(
    nombre='Cessna Citation II', k=k_de(15.90), expo=2.1,
    # (16/10, "mas fieles": la trompa ROMA y redonda, el fuselaje mas alto, los motores arriba en la cola)
    fuselaje=[(-7.20, 0.06, 0.06, -0.12), (-7.05, 0.34, 0.30, -0.12), (-6.55, 0.62, 0.58, -0.08), (-5.70, 0.84, 0.86, 0.02),
              (-4.60, 0.92, 1.00, 0.10), (1.00, 0.92, 1.00, 0.10), (2.80, 0.80, 0.88, 0.18), (4.60, 0.54, 0.62, 0.36),
              (6.30, 0.28, 0.34, 0.54), (7.19, 0.10, 0.12, 0.62)],
    ala=[(0.0, -1.35, 2.70, 0.14, -0.55), (0.85, -1.30, 2.55, 0.14, -0.52), (7.95, -0.70, 1.10, 0.11, -0.55 + 7.95 * td(4))],
    deriva=[(0.75, 3.80, 2.70, 0.10, 0.0), (2.80, 5.70, 1.40, 0.10, 0.0)],
    dorsal=[(0.70, 2.60, 1.60, 0.06, 0.0), (1.10, 3.70, 0.60, 0.20, 0.0)],
    estab=[(0.0, 5.20, 1.60, 0.10, 0.40), (3.05, 5.85, 0.90, 0.10, 0.40 + 3.05 * td(9))],
    motores=[dict(tipo='jet', x=1.32, y=0.70, z0=2.30, z1=4.90, r=0.46, pilon_x=0.60, pintada=True)],
    pintura=civil('#8a5a2b', (0.02, 0.18), dict(z=(-6.00, -5.10), y=(0.25, 0.95), color=VIDRIO, arriba=False),
                  ventanillas(-4.2, 0.9, 7, 0.32, 0.62, ancho=0.45)),
    bandera=(2.20, 2.70),
    escudo=(-5.80, 0.0, 0.60),      # el escudo del Escuadron Fenix, en la trompa
    tren=dict(x=1.95, nariz=-5.40, suelo=-1.40, r=0.30, ancho=0.18),
)
# ---- SWEARINGEN MERLIN III (civil, del Fenix). 12,85 m de largo, 14,10 de envergadura, 5,13 de alto. Tubo
# FINO y trompa larga en punta, ala baja, dos turbohelices Garrett en gondolas y la cola en CRUZ (el
# estabilizador a media deriva).
FICHAS['merlin'] = dict(
    nombre='Swearingen Merlin III', k=k_de(14.10), expo=2.1,
    # (16/10, "mas fieles": la trompa LARGA y fina que cae, el filete dorsal, las gondolas colgadas bajo el ala y
    # largas hacia atras)
    fuselaje=[(-6.55, 0.02, 0.02, -0.28), (-6.25, 0.20, 0.18, -0.24), (-5.40, 0.44, 0.42, -0.12), (-4.40, 0.68, 0.72, 0.0),
              (-3.50, 0.78, 0.84, 0.08), (1.20, 0.78, 0.84, 0.08), (3.00, 0.64, 0.70, 0.16), (5.00, 0.36, 0.42, 0.34),
              (6.30, 0.12, 0.14, 0.46)],
    dorsal=[(0.70, 1.90, 1.80, 0.06, 0.0), (1.30, 3.30, 0.50, 0.18, 0.0)],
    ala=[(0.0, -1.10, 2.40, 0.15, -0.50), (0.80, -1.08, 2.30, 0.15, -0.48), (7.05, -0.55, 1.05, 0.12, -0.50 + 7.05 * td(5))],
    deriva=[(0.70, 3.40, 2.70, 0.10, 0.0), (3.40, 5.50, 1.20, 0.10, 0.0)],
    estab=[(0.0, 4.55, 1.50, 0.10, 1.85), (2.90, 5.20, 0.85, 0.10, 1.90)],
    motores=[dict(tipo='helice', x=2.55, y=-0.45, z0=-2.95, z1=2.10, r=0.46, helice=1.30, palas=3)],
    pintura=civil('#2a5aa8', (-0.05, 0.12), dict(z=(-4.80, -3.95), y=(0.20, 0.82), color=VIDRIO, arriba=False),
                  ventanillas(-3.3, 1.3, 6, 0.25, 0.50)),
    bandera=(2.80, 3.30),
    escudo=(-4.70, 0.0, 0.55),      # el escudo del Escuadron Fenix, en la trompa
    tren=dict(x=2.55, nariz=-4.60, suelo=-1.45, r=0.30, ancho=0.18),
)
# ---- MITSUBISHI MU-2B (civil, del Fenix). 12,02 m de largo, 11,94 de envergadura con los tanques, 4,17 de
# alto. ALA ALTA y corta con los tanques de punta, dos turbohelices Garrett, tren en carenados del fuselaje.
FICHAS['mu2'] = dict(
    nombre='Mitsubishi MU-2', k=k_de(11.94), expo=2.8,      # (los costados RECTOS, la panza plana)
    fuselaje=[(-6.00, 0.02, 0.02, -0.12), (-5.75, 0.26, 0.24, -0.10), (-5.10, 0.52, 0.52, -0.02), (-4.10, 0.72, 0.78, 0.05),
              (-3.30, 0.78, 0.84, 0.08), (1.30, 0.78, 0.84, 0.08), (3.00, 0.64, 0.70, 0.15), (4.80, 0.36, 0.42, 0.32),
              (6.02, 0.12, 0.14, 0.42)],
    ala=[(0.0, -1.05, 1.95, 0.15, 0.78), (5.60, -0.95, 1.40, 0.13, 0.78)],
    tanques=[dict(x=5.75, y=0.78, z=-0.30, largo=2.90, r=0.34)],
    deriva=[(0.70, 3.30, 2.40, 0.10, 0.0), (2.80, 5.00, 1.20, 0.10, 0.0)],
    estab=[(0.0, 4.40, 1.40, 0.10, 0.30), (2.60, 4.95, 0.85, 0.10, 0.35)],
    motores=[dict(tipo='helice', x=2.10, y=0.92, z0=-2.70, z1=0.80, r=0.42, helice=1.20, palas=3)],   # ARRIBA del ala
    extras=[dict(tipo='loft', nombre='carenado_tren', est=[(-1.40, 0.10, 0.10, -0.62), (-0.90, 1.00, 0.36, -0.58),
                                                          (0.90, 1.00, 0.36, -0.58), (1.40, 0.10, 0.10, -0.62)])],
    pintura=civil('#b0302a', (-0.05, 0.12), dict(z=(-4.50, -3.75), y=(0.20, 0.82), color=VIDRIO, arriba=False),
                  ventanillas(-3.2, 1.2, 5, 0.22, 0.48)),
    bandera=(2.20, 2.65),
    escudo=(-4.40, 0.05, 0.55),      # el escudo del Escuadron Fenix, en la trompa
    tren=dict(x=0.85, nariz=-4.40, suelo=-1.40, r=0.30, ancho=0.20, ala=False, z=0.10),
)
# ---- PIPER AEROSTAR 601P (civil, del Fenix). 10,61 m de largo, 11,18 de envergadura, 3,73 de alto. Fino
# y bajo, ALA MEDIA, dos motores a piston en gondolas largas, la deriva muy en flecha y el estabilizador bajo.
FICHAS['aerostar'] = dict(
    nombre='Aerostar 601P', k=k_de(11.18), expo=2.1,
    fuselaje=[(-5.30, 0.02, 0.02, -0.12), (-5.00, 0.18, 0.16, -0.10), (-4.30, 0.42, 0.40, -0.03), (-3.20, 0.62, 0.66, 0.06),
              (-2.40, 0.66, 0.70, 0.08), (0.80, 0.64, 0.68, 0.08), (2.60, 0.48, 0.52, 0.16), (4.40, 0.26, 0.30, 0.28),
              (5.50, 0.10, 0.12, 0.34)],
    ala=[(0.0, -0.95, 1.95, 0.14, -0.05), (5.59, -0.55, 1.05, 0.12, -0.05 + 5.59 * td(2))],
    deriva=[(0.40, 2.60, 2.50, 0.10, 0.0), (2.70, 5.00, 0.95, 0.10, 0.0)],      # (alta y MUY en flecha)
    estab=[(0.0, 4.10, 1.25, 0.10, 0.28), (2.20, 4.50, 0.75, 0.10, 0.28)],
    motores=[dict(tipo='helice', x=1.85, y=0.00, z0=-2.55, z1=1.20, r=0.38, helice=0.95, palas=3)],
    pintura=civil('#b0302a', (-0.02, 0.12), dict(z=(-3.60, -2.85), y=(0.18, 0.72), color=VIDRIO, arriba=False),
                  ventanillas(-2.4, 0.4, 3, 0.20, 0.45)),
    bandera=(1.85, 2.25),
    escudo=(-3.40, 0.05, 0.45),      # el escudo del Escuadron Fenix, en la trompa
    tren=dict(x=1.85, nariz=-3.70, suelo=-1.25, r=0.26, ancho=0.16),
)
# ---- ROCKWELL TURBO COMMANDER 690 (civil, del Fenix). 13,52 m de largo, 14,22 de envergadura, 4,56 de alto.
# ALA ALTA, fuselaje ancho y bajo con muchas ventanillas, dos turbohelices y la deriva muy en flecha.
FICHAS['commander'] = dict(
    nombre='Rockwell Turbo Commander 690', k=k_de(14.22), expo=2.7,   # (panza plana, costados rectos)
    fuselaje=[(-6.60, 0.02, 0.02, -0.15), (-6.35, 0.30, 0.26, -0.12), (-5.60, 0.62, 0.58, -0.04), (-4.60, 0.82, 0.84, 0.04),
              (-3.60, 0.88, 0.90, 0.08), (1.40, 0.88, 0.90, 0.08), (3.20, 0.70, 0.74, 0.16), (5.40, 0.36, 0.42, 0.36),
              (6.92, 0.10, 0.12, 0.48)],
    ala=[(0.0, -1.05, 2.40, 0.15, 0.90), (7.11, -0.75, 1.20, 0.12, 0.90 + 7.11 * td(2))],
    deriva=[(0.75, 3.50, 2.80, 0.10, 0.0), (3.20, 5.80, 1.10, 0.10, 0.0)],
    estab=[(0.0, 4.80, 1.55, 0.10, 0.35), (3.00, 5.40, 0.85, 0.10, 0.40)],
    motores=[dict(tipo='helice', x=2.35, y=0.50, z0=-2.95, z1=1.30, r=0.45, helice=1.30, palas=3)],   # colgadas del ala alta
    pintura=civil('#2a5aa8', (-0.05, 0.12), dict(z=(-4.95, -4.15), y=(0.20, 0.86), color=VIDRIO, arriba=False),
                  ventanillas(-3.6, 1.6, 7, 0.20, 0.50)),
    bandera=(2.55, 3.05),
    escudo=(-4.80, 0.05, 0.60),      # el escudo del Escuadron Fenix, en la trompa
    tren=dict(x=2.35, nariz=-4.90, suelo=-1.50, r=0.32, ancho=0.20),
)
# ---- FMA IA-50 GUARANI II (FAA). 15,30 m de largo, 19,53 de envergadura, 5,61 de alto. Hecho en Cordoba:
# ala baja recta, dos turbohelices Astazou y la UNICA deriva muy en flecha, sin estabilizador en cruz.
FICHAS['guarani'] = dict(
    nombre='FMA IA-50 Guarani II', k=k_de(19.53), expo=2.3,
    fuselaje=[(-7.40, 0.02, 0.02, -0.15), (-7.10, 0.34, 0.30, -0.12), (-6.30, 0.72, 0.68, -0.02), (-5.20, 0.98, 1.00, 0.06),
              (-4.20, 1.02, 1.06, 0.08), (1.80, 1.02, 1.06, 0.08), (3.80, 0.82, 0.86, 0.18), (6.20, 0.40, 0.46, 0.42),
              (7.90, 0.12, 0.14, 0.56)],
    ala=[(0.0, -1.35, 2.90, 0.16, -0.60), (9.76, -0.85, 1.30, 0.12, -0.60 + 9.76 * td(4))],
    deriva=[(0.90, 3.90, 3.40, 0.10, 0.0), (4.10, 6.80, 1.40, 0.10, 0.0)],
    dorsal=[(0.90, 2.40, 2.00, 0.06, 0.0), (1.60, 3.90, 0.60, 0.18, 0.0)],
    estab=[(0.0, 5.60, 1.80, 0.10, 0.30), (3.60, 6.30, 1.00, 0.10, 0.35)],
    motores=[dict(tipo='helice', x=3.10, y=-0.20, z0=-3.40, z1=1.20, r=0.52, helice=1.30, palas=3)],
    pintura=civil('#1f3f7a', (-0.05, 0.14), dict(z=(-5.55, -4.75), y=(0.25, 1.00), color=VIDRIO, arriba=False),
                  ventanillas(-3.9, 2.2, 6, 0.22, 0.55), [dict(z=(-7.50, -6.75), color='#15191b', arriba=False)]),   # el radomo negro
    bandera=(2.60, 3.50), escarapelas=(6.5, -0.6, 0.80),
    letras=[('FUERZA AEREA ARGENTINA', -1.60, 0.80, 0.26)],
    escarapela_fus=(1.10, 0.05, 0.42),
    escudo=(-5.60, 0.05, 0.70),      # el escudo del Escuadron Fenix, en la trompa
    tren=dict(x=3.10, nariz=-5.50, suelo=-1.70, r=0.36, ancho=0.22),
)
# ---- FMA IA-58 PUCARA (FAA, Grupo 3 de Ataque; S-07, S-13, S-14). 14,25 m de largo, 14,50 de envergadura,
# 5,36 de alto. Ataque a tierra argentino: biplaza en TANDEM con la cabina de atras mas ALTA bajo una sola
# burbuja larga, trompa larga y fina (los cañones), ala baja recta con diedro, dos Astazou y la COLA EN T.
FICHAS['pucara'] = dict(
    nombre='FMA IA-58 Pucara', k=k_de(14.50), expo=2.2,
    fuselaje=[(-7.30, 0.02, 0.02, -0.10), (-7.05, 0.20, 0.18, -0.08), (-6.20, 0.40, 0.42, -0.02), (-5.00, 0.55, 0.62, 0.06),
              (-3.80, 0.62, 0.72, 0.12), (-1.50, 0.64, 0.74, 0.12), (1.20, 0.58, 0.66, 0.12), (3.40, 0.40, 0.48, 0.24),
              (5.60, 0.22, 0.28, 0.42), (6.95, 0.10, 0.12, 0.50)],
    cabinas=[((0, 0.62, -4.40), (0.42, 0.42, 1.10)), ((0, 0.78, -3.10), (0.44, 0.48, 1.10))],
    ala=[(0.0, -1.20, 2.40, 0.15, -0.40), (7.25, -0.85, 1.30, 0.12, -0.40 + 7.25 * td(7))],
    deriva=[(0.55, 3.70, 2.40, 0.11, 0.0), (2.90, 5.10, 1.50, 0.11, 0.0)],
    estab=[(0.0, 4.85, 1.45, 0.10, 3.40), (2.30, 5.30, 0.90, 0.10, 3.42)],
    motores=[dict(tipo='helice', x=2.70, y=-0.15, z0=-3.05, z1=1.40, r=0.44, helice=1.32, palas=3)],
    pintura=camo_faa([dict(z=(-7.4, -7.0), color='#2a2f2c', arriba=False)]),
    bandera=(2.30, 2.75), escarapelas=(5.0, -0.5, 0.60),
    carga=dict(ala_x=4.10, centro_z=-0.80, tanque=PANZA_FAA),
    tren=dict(x=2.70, nariz=-5.40, suelo=-1.65, r=0.34, ancho=0.20),
)
# ---- AERMACCHI MB-339A (Armada, 1ª Escuadrilla de Ataque; el 4-A-115 de Owen Crippa, S-09). 10,97 m de largo,
# 10,86 de envergadura con los tanques, 3,99 de alto. Entrenador y ataque: tandem ESCALONADO (el de atras
# mas alto), tomas a los costados en la raiz del ala, ala baja recta con TANQUES DE PUNTA, una turbina.
# Pintura de abril de 1982: arena oscuro y verde arriba, panza blanca (PREGUNTAS_HISTORICAS).
FICHAS['mb339'] = dict(
    nombre='Aermacchi MB-339A', k=k_de(10.86), expo=2.2,
    fuselaje=[(-5.60, 0.02, 0.02, -0.12), (-5.35, 0.20, 0.18, -0.10), (-4.70, 0.38, 0.40, -0.04), (-3.80, 0.52, 0.58, 0.04),
              (-2.80, 0.58, 0.68, 0.10), (-0.80, 0.62, 0.70, 0.10), (1.40, 0.56, 0.62, 0.10), (3.40, 0.42, 0.46, 0.14),
              (5.10, 0.33, 0.34, 0.20), (5.37, 0.32, 0.32, 0.20)],
    cabinas=[((0, 0.58, -3.30), (0.36, 0.38, 0.95)), ((0, 0.78, -2.20), (0.37, 0.44, 0.95))],
    tomas=[dict(x0=0.55, est=[(-1.30, 0.22, 0.30, 0.05), (-0.90, 0.24, 0.32, 0.05), (0.10, 0.18, 0.24, 0.06), (0.90, 0.06, 0.08, 0.08)])],
    ala=[(0.0, -0.90, 2.20, 0.13, -0.32), (5.10, -0.55, 1.20, 0.11, -0.32 + 5.10 * td(6))],
    tanques=[dict(x=5.30, y=-0.32 + 5.30 * td(6), z=-0.20, largo=2.20, r=0.25)],
    deriva=[(0.50, 2.90, 2.30, 0.10, 0.0), (2.50, 4.70, 1.00, 0.10, 0.0)],
    estab=[(0.0, 3.70, 1.35, 0.10, 0.28), (2.05, 4.20, 0.70, 0.10, 0.30)],
    fuego=(0.20, 5.35, 0.27),
    extras=[dict(tipo='loft', nombre='anillo_tobera', mat='metal', est=[(5.20, 0.33, 0.33, 0.20), (5.40, 0.30, 0.30, 0.20)])],
    pintura=dict(arriba=['#7a6446', '#56603f'], corte=0.5, escala=0.35, panza='#d8dcdc',
                 marcas=[dict(z=(-5.7, -5.2), color='#2a2f2c', arriba=False)]),
    bandera=(1.80, 2.30), escarapelas=(3.6, -0.3, 0.45),
    carga=dict(ala_x=3.10, centro_z=0.0, tanque='#d8dcdc'),
    tren=dict(x=1.30, nariz=-3.90, suelo=-1.30, r=0.28, ancho=0.17),
)
# ---- LOCKHEED SP-2H NEPTUNE (Armada, Escuadrilla Aeronaval de Exploracion; S-01, S-02). 27,94 m de largo,
# 31,65 de envergadura con los tanques, 8,94 de alto. El patrullero: fuselaje largo, el RADOMO gordo bajo
# la panza, dos radiales R-3350 en gondolas enormes con helices de cuatro palas, dos turbinas J34 en pods
# bajo el ala exterior, tanques de punta, la deriva alta y el AGUIJON del MAD en la cola.
FICHAS['neptune'] = dict(
    nombre='Lockheed SP-2H Neptune', k=k_de(31.65), expo=2.2,
    fuselaje=[(-12.6, 0.10, 0.10, 0.10), (-12.2, 0.75, 0.80, 0.10), (-11.0, 1.20, 1.30, 0.20), (-9.50, 1.35, 1.55, 0.25),
              (-6.00, 1.40, 1.60, 0.25), (2.00, 1.38, 1.55, 0.25), (6.00, 1.10, 1.25, 0.45), (10.0, 0.60, 0.70, 0.95),
              (12.6, 0.30, 0.34, 1.20)],
    ala=[(0.0, -2.20, 4.20, 0.16, -0.10), (2.0, -2.10, 4.00, 0.16, -0.10), (15.8, -0.80, 1.70, 0.12, -0.10 + 15.8 * td(3))],
    tanques=[dict(x=15.95, y=-0.10 + 15.95 * td(3), z=-0.80, largo=5.00, r=0.55)],
    deriva=[(1.40, 7.80, 5.20, 0.11, 0.0), (6.80, 11.6, 2.60, 0.11, 0.0)],
    dorsal=[(1.20, 4.80, 3.40, 0.06, 0.0), (2.20, 7.40, 1.00, 0.20, 0.0)],
    estab=[(0.0, 9.80, 3.00, 0.11, 1.10), (6.40, 11.0, 1.60, 0.11, 1.20)],
    motores=[dict(tipo='helice', x=4.60, y=0.00, z0=-6.20, z1=2.20, r=1.05, helice=2.05, palas=4, expo=2.0),
             dict(tipo='jet', x=8.90, y=-1.10, z0=-1.60, z1=2.40, r=0.55, pintada=True)],
    extras=[dict(tipo='elipsoide', nombre='radomo', mat='#b9c8cf', centro=(0, -1.55, -4.80), radios=(1.25, 0.70, 1.70)),
            dict(tipo='loft', nombre='mad', mat='#c9a640', est=[(12.4, 0.30, 0.30, 1.22), (14.6, 0.18, 0.18, 1.30), (15.6, 0.04, 0.04, 1.32)])],
    # LA PINTURA DE 1982 (16/10, el autor con las fotos del 2-P-112: "los Neptune eran verdes"): manchones
    # GRIS AZULADO y VERDE arriba, la panza clara; la trompa VIDRIADA (la burbuja del observador) y la cabina
    pintura=dict(arriba=['#6f8ca3', '#6e9670'], corte=0.5, escala=0.85, panza='#b9c8cf', umbral_panza=-0.45,
                 marcas=[dict(z=(-12.7, -11.75), color=VIDRIO, arriba=False)]
                        + parabrisas(-10.9, -9.9, 1.00, 1.62, poste=0.05, frente=0.45, laterales=2)),
    letras=[('112', -9.20, 0.10, 0.70)],
    bandera=(5.50, 6.60), escarapelas=(10.0, -0.8, 1.30),
    tren=dict(x=4.60, nariz=-10.0, suelo=-3.20, r=0.65, ancho=0.40),
)

# ============================ LOS QUE FALTABAN (18/11/2026) ============================
# El autor: "agreguemos los que faltan horneados para que puedan ser jugables", con los dos cuadros de lo que
# hubo EN LAS ISLAS (docs/historia/HELICOPTEROS_ARGENTINOS.md): los siete helicopteros (dos Chinook, el Bell 212,
# dos Puma, el UH-1H y el Agusta) y los dos aviones que no estaban (el T-34C de la Armada y el Skyvan de
# Prefectura). Los helicopteros usan el mismo armador: sin ala, con `rotores`, `rotor_cola`, `patines` o
# `ruedas`; la `k` sale del DIAMETRO DEL ROTOR (lo que abre en el cuadro, como la envergadura).
OLIVA_EJ, AMARILLO = '#535c30', '#e8c21e'
def bandera_marca(z0, z1, y0, y1):
    """La bandera pintada en el costado (el pilon de cola del Chinook): tres franjas, celeste-blanca-celeste."""
    h = (y1 - y0) / 3
    return [dict(z=(z0, z1), y=(y0 + h * i, y0 + h * (i + 1)), color=c, arriba=False)
            for i, c in enumerate((M.CELESTE, M.BLANCO, M.CELESTE))]

# ---- BOEING CH-47C CHINOOK (FAA Grupo 7: 2; Ejercito, Batallon de Aviacion de Combate 601: 2). 15,54 m de
# fuselaje, 30,1 con los rotores, rotores de 18,29 m. El tandem: dos rotores de tres palas, el de atras ALTO
# sobre el pilon de cola con los dos motores colgados a los costados, las barquillas de combustible a lo largo
# de la panza y cuatro ruedas fijas.
def _chinook(nombre, pintura, letras=(), escarapela=None):
    return dict(
        nombre=nombre, k=k_de(25.0), expo=3.2,
        fuselaje=[(-7.80, 0.30, 0.35, -0.10), (-7.55, 0.85, 0.85, 0.0), (-6.90, 1.15, 1.20, 0.10), (-6.00, 1.25, 1.30, 0.15),
                  (6.00, 1.25, 1.30, 0.15), (7.00, 1.20, 1.20, 0.25), (7.75, 1.05, 0.85, 0.55)],
        extras=[dict(tipo='loft', nombre='pilon_delantero', est=[(-7.10, 0.05, 0.05, 1.25), (-6.50, 0.55, 0.45, 1.35), (-4.80, 0.55, 0.45, 1.40), (-3.90, 0.15, 0.10, 1.40)]),
                dict(tipo='loft', nombre='lomo', est=[(-4.20, 0.05, 0.05, 1.40), (-3.80, 0.45, 0.25, 1.45), (4.00, 0.45, 0.25, 1.45), (4.30, 0.05, 0.05, 1.45)]),
                dict(tipo='loft', nombre='pilon_trasero', expo=2.8, est=[(3.00, 0.10, 0.10, 1.50), (4.20, 0.70, 0.40, 1.80), (6.00, 0.65, 1.05, 2.40), (7.40, 0.50, 1.00, 2.55), (7.90, 0.08, 0.10, 2.70)]),
                dict(tipo='loft', nombre='motor', par=True, x0=0.95, est=[(4.00, 0.05, 0.05, 2.10), (4.40, 0.35, 0.35, 2.10), (6.60, 0.35, 0.35, 2.15), (7.10, 0.20, 0.20, 2.15)]),
                dict(tipo='loft', nombre='barquilla', par=True, x0=1.30, est=[(-3.80, 0.05, 0.10, -0.55), (-3.20, 0.32, 0.45, -0.55), (3.20, 0.32, 0.45, -0.55), (4.00, 0.05, 0.10, -0.50)])],
        rotores=[dict(y=2.05, z=-5.95, r=9.15, palas=3, cuerda=0.81, mastil=0.5, giro=90),
                 dict(y=3.40, z=5.95, r=9.15, palas=3, cuerda=0.81, mastil=0.6, giro=270)],
        ruedas=[(1.35, -2.00, -3.20, 0.42, 0.30), (1.35, -2.00, 4.30, 0.42, 0.30)],
        pintura=dict(pintura, marcas=[dict(z=(-7.70, -6.90), y=(0.15, 1.00), color=VIDRIO, arriba=False)]
                     + ventanillas(-5.0, 4.6, 6, 0.40, 0.75, ancho=0.30) + bandera_marca(5.4, 6.6, 2.70, 3.20) + list(pintura.get('marcas', []))),
        letras=list(letras), escarapela_fus=escarapela,
    )
FICHAS['chinook_faa'] = _chinook('CH-47C Chinook FAA', dict(arriba=['#3f6b2a', '#c4a468'], corte=0.5, escala=0.45, panza='#c4a468'),
                                 letras=[('FUERZA AEREA ARGENTINA', -1.0, 0.55, 0.32)], escarapela=(1.9, -0.30, 0.50))
FICHAS['chinook_ej'] = _chinook('CH-47C Chinook Ejercito', dict(arriba=[OLIVA_EJ], panza=OLIVA_EJ, marcas=[dict(z=(1.30, 1.95), color=AMARILLO, arriba=False)]),
                                letras=[('EJERCITO', -0.4, -0.55, 0.50)])

# ---- BELL UH-1H "HUEY" (Ejercito, Batallon 601: 9; el de la S-11). 12,77 m de fuselaje, rotor de 14,63 de
# dos palas, la "casita" del motor sobre la cabina, el botalon largo con la deriva y el rotor de cola, patines.
def _huey(nombre, pintura, largo=0.0, motor=0.55, bandera=(1.40, 1.90), letras=(), escarapela=None, extras=()):
    n = -largo                                  # (el Bell 212: la trompa un poco mas larga)
    return dict(
        nombre=nombre, k=k_de(14.7), expo=2.8,
        fuselaje=[(-5.45 + n, 0.10, 0.15, -0.20), (-5.25 + n, 0.55, 0.60, -0.15), (-4.70 + n * 0.5, 0.95, 0.95, -0.05), (-3.80, 1.20, 1.05, 0.0),
                  (-1.00, 1.25, 1.05, 0.0), (0.60, 1.15, 0.95, 0.05), (1.80, 0.70, 0.60, 0.35), (2.60, 0.40, 0.38, 0.50),
                  (6.80, 0.20, 0.22, 0.62), (7.30, 0.14, 0.16, 0.64)],
        extras=[dict(tipo='loft', nombre='motor', expo=2.5, est=[(-1.60, 0.05, 0.05, 1.05), (-1.30, motor, 0.35, 1.05), (1.60, motor, 0.38, 1.00), (2.40, 0.25, 0.20, 0.85)])] + list(extras),
        deriva=[(0.55, 6.30, 1.20, 0.12, 0.0), (2.00, 7.10, 0.70, 0.10, 0.0)],
        estab=[(0.0, 3.60, 0.65, 0.10, 0.55), (1.45, 3.80, 0.45, 0.08, 0.55)],
        rotores=[dict(y=1.95, z=-0.90, r=7.32, palas=2, cuerda=0.53, mastil=0.55, giro=0)],
        rotor_cola=dict(x=0.30, y=1.85, z=7.00, r=1.30, palas=2, cuerda=0.22),
        patines=dict(x=1.20, y=-1.75, z0=-3.60 + n * 0.5, z1=1.60, r=0.09, cruces=[-2.40, 0.60], y_fus=-1.00),
        pintura=dict(pintura, marcas=[dict(z=(-5.35 + n, -4.30 + n * 0.5), y=(-0.35, 0.95), color=VIDRIO, arriba=False),
                                      dict(z=(-5.30 + n, -4.65 + n * 0.5), y=(-0.95, -0.50), color=VIDRIO, arriba=False),
                                      dict(z=(-3.20, -1.80), y=(0.15, 0.60), color=VIDRIO, arriba=False)] + list(pintura.get('marcas', []))),
        bandera=bandera, letras=list(letras), escarapela_fus=escarapela,
    )
FICHAS['uh1h'] = _huey('Bell UH-1H', dict(arriba=[OLIVA_EJ], panza=OLIVA_EJ, marcas=[dict(z=(2.70, 3.30), color=AMARILLO, arriba=False)]),
                       letras=[('EJERCITO', 4.6, 0.55, 0.30)])
# ---- BELL 212 (FAA Grupo 7: 2). El Huey de dos motores: la casita mas ancha (el Twin-Pac), la trompa un poco
# mas larga; camuflaje verde y arena de la Fuerza Aerea.
FICHAS['bell212'] = _huey('Bell 212', dict(arriba=['#4b6a2e', '#a58c58'], corte=0.5, escala=0.40, panza='#a58c58'),
                          largo=0.25, motor=0.70, letras=[('FUERZA AEREA', 4.4, 0.55, 0.28)], escarapela=(-1.20, -0.30, 0.38))

# ---- AEROSPATIALE SA-330L PUMA (Ejercito, Batallon 601: 5; Prefectura Naval: 1). 14,06 m de fuselaje, rotor
# de 15 m y cuatro palas, los dos turboejes encima de la cabina, las barquillas del tren principal a los
# costados y el rotor de cola de cinco palas a la derecha de la deriva.
def _puma(nombre, pintura, bandera=(1.55, 2.05), letras=()):
    return dict(
        nombre=nombre, k=k_de(15.0), expo=2.6,
        fuselaje=[(-6.70, 0.10, 0.15, -0.30), (-6.45, 0.55, 0.55, -0.25), (-5.80, 0.95, 0.95, -0.10), (-4.80, 1.05, 1.10, 0.0),
                  (1.20, 1.05, 1.10, 0.0), (2.60, 0.70, 0.80, 0.25), (3.60, 0.40, 0.45, 0.50), (6.60, 0.28, 0.30, 0.65), (7.40, 0.20, 0.22, 0.70)],
        extras=[dict(tipo='loft', nombre='motores', expo=2.4, est=[(-4.20, 0.05, 0.05, 1.05), (-3.60, 0.80, 0.40, 1.15), (1.20, 0.80, 0.42, 1.15), (2.40, 0.30, 0.25, 1.05)]),
                dict(tipo='loft', nombre='barquilla', par=True, x0=1.05, est=[(-0.80, 0.05, 0.05, -0.75), (-0.40, 0.35, 0.35, -0.75), (1.00, 0.35, 0.35, -0.75), (1.60, 0.05, 0.05, -0.70)])],
        deriva=[(0.60, 6.40, 1.30, 0.12, 0.0), (2.40, 7.50, 0.70, 0.10, 0.0)],
        estab=[(0.0, 6.00, 0.60, 0.08, 0.65), (1.00, 6.20, 0.40, 0.08, 0.65)],
        rotores=[dict(y=2.05, z=-1.00, r=7.50, palas=4, cuerda=0.60, mastil=0.45, giro=45)],
        rotor_cola=dict(x=0.35, y=2.00, z=7.30, r=1.50, palas=5, cuerda=0.18),
        ruedas=[(1.30, -1.55, 0.30, 0.33, 0.25), (0.25, -1.55, -4.60, 0.25, 0.18)],
        pintura=dict(pintura, marcas=[dict(z=(-6.55, -5.40), y=(0.0, 0.95), color=VIDRIO, arriba=False)]
                     + ventanillas(-3.5, 0.2, 3, 0.15, 0.50, ancho=0.45) + list(pintura.get('marcas', []))),
        bandera=bandera, letras=list(letras),
    )
FICHAS['puma_ej'] = _puma('SA-330L Puma Ejercito', dict(arriba=['#4d5a2b'], panza='#4d5a2b', marcas=[dict(z=(5.40, 6.10), color=AMARILLO, arriba=False)]),
                          letras=[('EJERCITO', 3.0, 0.20, 0.36)])
# (Prefectura: blanco, el lomo y una mancha de la panza en azul, la franja amarilla cruzada, PA-12)
FICHAS['puma_pna'] = _puma('SA-330L Puma Prefectura', dict(arriba=['#e9edef'], panza='#e9edef', marcas=[
    dict(y=(0.80, 9.0), color='#1f3a7a'), dict(y=(-9.0, -0.70), z=(-3.0, 1.2), color='#1f3a7a', arriba=False),
    dict(z=(-0.40, 0.70), y=(-0.70, 0.80), color=AMARILLO, arriba=False)]),
    bandera=(1.55, 2.05), letras=[('PREFECTURA', 3.3, 0.15, 0.30), ('PA-12', -2.3, -0.35, 0.40)])

# ---- AGUSTA A-109A HIRUNDO (Ejercito, Batallon 601: 3). 10,7 m de fuselaje, rotor de 11 m y cuatro palas:
# fino, la trompa en punta, el tren que se esconde, la deriva arriba y abajo del botalon. Los unicos armados:
# los lanzacohetes a los costados.
FICHAS['a109'] = dict(
    nombre='Agusta A-109A', k=k_de(11.0), expo=2.2,
    fuselaje=[(-4.90, 0.05, 0.05, -0.25), (-4.60, 0.40, 0.35, -0.20), (-3.90, 0.70, 0.65, -0.05), (-3.00, 0.80, 0.75, 0.05),
              (0.20, 0.80, 0.75, 0.05), (1.20, 0.55, 0.55, 0.20), (2.00, 0.30, 0.32, 0.40), (5.60, 0.14, 0.18, 0.50), (6.00, 0.10, 0.12, 0.52)],
    extras=[dict(tipo='loft', nombre='motor', est=[(-1.90, 0.05, 0.05, 0.75), (-1.50, 0.45, 0.30, 0.80), (0.90, 0.45, 0.30, 0.80), (1.80, 0.10, 0.10, 0.65)]),
            dict(tipo='elipsoide', nombre='cohetes', mat='metal', par=True, centro=(1.05, -0.45, -1.00), radios=(0.18, 0.18, 0.70))],
    deriva=[(-0.60, 5.50, 0.90, 0.10, 0.0), (1.30, 5.90, 0.60, 0.08, 0.0)],
    estab=[(0.0, 4.40, 0.50, 0.08, 0.50), (1.40, 4.50, 0.35, 0.07, 0.50)],
    rotores=[dict(y=1.40, z=-0.90, r=5.50, palas=4, cuerda=0.33, mastil=0.30, giro=45)],
    rotor_cola=dict(x=-0.25, y=0.75, z=5.95, r=1.00, palas=2, cuerda=0.16),
    ruedas=[(0.90, -1.05, 0.20, 0.25, 0.15), (0.0, -1.05, -3.40, 0.18, 0.12)],
    pintura=dict(arriba=['#5b5d34', '#8a7a4c'], corte=0.5, escala=0.45, panza='#5b5d34',
                 marcas=[dict(z=(-4.70, -3.70), y=(-0.10, 0.70), color=VIDRIO, arriba=False),
                         dict(z=(-3.20, -1.60), y=(0.10, 0.55), color=VIDRIO, arriba=False),
                         dict(z=(2.80, 3.40), color=AMARILLO, arriba=False)]),
    bandera=(0.60, 1.00),
)

# ---- BEECHCRAFT T-34C TURBO MENTOR (Armada, COAN: 4 en las islas). 8,75 m de largo, 10,16 de envergadura:
# el entrenador de la Armada, una turbohelice en la trompa larga, la cabina en tandem bajo un vidrio largo,
# ala baja recta. Verde claro con las bandas naranja de escuela.
FICHAS['t34c'] = dict(
    nombre='Beechcraft T-34C Turbo Mentor', k=k_de(10.16), expo=2.2,
    fuselaje=[(-4.35, 0.10, 0.10, 0.0), (-4.10, 0.38, 0.40, 0.0), (-3.40, 0.50, 0.55, 0.02), (-2.20, 0.52, 0.62, 0.08),
              (-0.50, 0.50, 0.62, 0.10), (1.50, 0.38, 0.48, 0.12), (3.40, 0.20, 0.26, 0.25), (4.40, 0.08, 0.10, 0.30)],
    cabinas=[((0, 0.62, -1.25), (0.42, 0.38, 1.55))],
    ala=[(0.0, -1.00, 2.00, 0.15, -0.40), (5.08, -0.60, 1.05, 0.12, -0.40 + 5.08 * td(7))],
    deriva=[(0.30, 3.00, 1.60, 0.10, 0.0), (1.75, 3.70, 0.85, 0.09, 0.0)],
    dorsal=[(0.25, 1.90, 1.40, 0.05, 0.0), (0.60, 3.00, 0.50, 0.15, 0.0)],
    estab=[(0.0, 3.30, 1.05, 0.09, 0.20), (1.80, 3.60, 0.65, 0.08, 0.20)],
    helice_nariz=dict(y=0.0, z=-4.40, r=1.15, palas=3),
    pintura=dict(arriba=['#a6b08a'], panza='#b4bc9c', marcas=[dict(z=(1.60, 2.05), color='#d95f2a', arriba=False)]),
    pintura_alas=dict(arriba=['#a6b08a'], panza='#b4bc9c', marcas=[dict(x=(4.2, 9.0), color='#d95f2a')]),
    letras=[('ARMADA', 0.55, 0.0, 0.28)],
    bandera=(1.05, 1.50), escarapelas=(3.6, -0.3, 0.40),
    tren=dict(x=1.65, nariz=-3.30, suelo=-1.25, r=0.25, ancho=0.14),
)

# ---- SHORT SC.7 SKYVAN (Prefectura Naval: 2; el PA-54). 12,21 m de largo, 19,79 de envergadura: la "caja de
# zapatos" — fuselaje cuadrado, ala ALTA recta con puntales, dos turbohelices Garrett, DOS derivas cuadradas en
# las puntas del estabilizador y el tren fijo. Verde grisaceo con la banda amarilla de Prefectura.
FICHAS['skyvan'] = dict(
    nombre='Short SC.7 Skyvan', k=k_de(19.79), expo=4.0,
    fuselaje=[(-5.20, 0.20, 0.25, -0.25), (-4.90, 0.75, 0.75, -0.10), (-4.20, 0.98, 1.00, 0.05), (2.20, 0.98, 1.05, 0.05),
              (4.00, 0.95, 1.00, 0.20), (5.60, 0.90, 0.55, 0.70), (6.00, 0.85, 0.40, 0.85)],
    ala=[(0.0, -0.90, 1.80, 0.14, 1.15), (9.90, -0.90, 1.78, 0.12, 1.15)],
    puntales=[((0.95, -0.70, -0.30), (3.60, 1.08, -0.30), 0.07)],
    motores=[dict(tipo='helice', x=2.20, y=1.10, z0=-2.60, z1=0.60, r=0.42, helice=1.28, palas=3)],
    estab=[(0.0, 5.00, 1.40, 0.10, 0.95), (2.60, 5.10, 1.30, 0.10, 0.95)],
    derivas=[[(0.40, 4.60, 1.70, 0.10, 2.60), (2.60, 4.80, 1.50, 0.10, 2.60)],
             [(0.40, 4.60, 1.70, 0.10, -2.60), (2.60, 4.80, 1.50, 0.10, -2.60)]],
    extras=[dict(tipo='loft', nombre='barquilla', par=True, x0=1.00, est=[(-0.60, 0.05, 0.05, -0.75), (-0.30, 0.35, 0.30, -0.75), (0.80, 0.35, 0.30, -0.75), (1.10, 0.05, 0.05, -0.75)])],
    pintura=dict(arriba=['#9cb497'], panza='#a9bfa3', marcas=[dict(z=(1.50, 1.95), color=AMARILLO, arriba=False),
                                                             dict(z=(-4.95, -4.30), y=(0.10, 0.85), color=VIDRIO, arriba=False)]
                 + ventanillas(-3.5, 1.2, 5, 0.10, 0.45, ancho=0.50)),
    letras=[('PA-54', 4.3, 0.0, 0.45), ('PREFECTURA NAVAL ARGENTINA', 3.2, 0.55, 0.14)],
    bandera=(1.90, 2.40),
    tren=dict(x=1.35, nariz=-4.00, suelo=-1.55, r=0.35, ancho=0.22, ala=False, z=0.25),
)

def construir(clave, T, K):
    return avion(T, K, FICHAS[clave])
