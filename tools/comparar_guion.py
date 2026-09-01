#!/usr/bin/env python3
"""
comparar_guion — enfrenta GUION_3.md contra data/story.js, linea por linea, como un merge.

POR QUE EXISTE. El guion del juego se migro desde data/strings.js, que a esa altura ya estaba
DESACTUALIZADO respecto de GUION_3.md — asi que la migracion centralizo texto viejo. Encima
despues se editaron escenas a mano sobre esa base. Resultado: hay tres versiones de varias lineas
(la del guion, la migrada y la editada) y ninguna forma de saber cual es cual sin leer las dos
fuentes enteras.

QUE HACE. Para cada mision empareja las lineas de las dos fuentes por PARECIDO DE TEXTO (no por
posicion: el orden difiere y las escenas estan partidas distinto) y las clasifica:

    =   IGUAL          el texto coincide (>= 0.90). No hay nada que decidir.
    ~   DISTINTO       se parecen (0.55-0.90): una es una reescritura de la otra. HAY QUE ELEGIR.
    G   SOLO EN GUION  esta en GUION_3 y NO en el juego. Falta escribirla.
    J   SOLO EN JUEGO  esta en el juego y NO en GUION_3. O es invento viejo, o el guion la perdio.

Emparejar por parecido y no por orden es lo unico que funciona aca: una escena del juego puede
juntar dos parrafos del guion, o partir uno en dos, y cualquier alineacion posicional se
desincroniza en la primera diferencia y marca todo lo que sigue como distinto.

    python3 tools/comparar_guion.py            # resumen por mision
    python3 tools/comparar_guion.py M4         # el detalle de una
    python3 tools/comparar_guion.py --md       # el documento de decisiones, a docs/
"""
import json
import re
import subprocess
import sys
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
GUION = RAIZ / 'docs' / 'historia' / 'GUION_3.md'
STORY = RAIZ / 'src' / 'data' / 'story.js'
SALIDA = RAIZ / 'docs' / 'historia' / 'MERGE_GUION.md'

IGUAL, PARECIDO = 0.90, 0.55


def norm(t):
    """Para comparar: sin acentos, sin puntuacion, sin mayusculas, sin espacios de mas."""
    t = unicodedata.normalize('NFD', t or '')
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = re.sub(r'[^a-z0-9 ]', ' ', t.lower())
    return re.sub(r'\s+', ' ', t).strip()


def sim(a, b):
    return SequenceMatcher(None, norm(a), norm(b)).ratio()


# ---------- lado GUION_3 ----------
def limpiar_md(t):
    t = re.sub(r'_\(([^)]*)\)_', r'(\1)', t)      # _(acotacion)_ -> (acotacion)
    t = t.replace('**', '').replace('_', '')
    return re.sub(r'\s+', ' ', t).strip()


def leer_guion():
    """{numero de mision: [(hablante, texto)]}. 0 = PROLOGO."""
    g = GUION.read_text()
    marcas = [(0, re.search(r'^# PRÓLOGO', g, re.M))]
    for m in re.finditer(r'^## (?:🟥 |🟨 )?MISIÓN (\d+) —', g, re.M):
        marcas.append((int(m.group(1)), m))
    marcas = [(n, m) for n, m in marcas if m]
    marcas.sort(key=lambda x: x[1].start())
    out = {}
    for i, (n, m) in enumerate(marcas):
        fin = marcas[i + 1][1].start() if i + 1 < len(marcas) else len(g)
        cuerpo = g[m.start():fin]
        # UNIR LOS RENGLONES DE UN MISMO PARRAFO. GUION_3 esta escrito a 95 columnas, asi que una
        # linea de dialogo ocupa dos o tres renglones del archivo. Sin unirlos, de "CONDOR: Un
        # pesquero. Setenta metros. Tira la red..." se comparaba solo el primer pedazo y todo daba
        # distinto por truncamiento, no por contenido.
        # UNIR LOS RENGLONES DE UN MISMO PARRAFO, y hacerlo BIEN.
        #
        # Dos trampas que costaron dos vueltas. Una: GUION_3 esta escrito a 95 columnas, asi que
        # una linea de dialogo ocupa dos o tres renglones del archivo — sin unirlos se comparaba
        # solo el primer pedazo. Dos: adentro de una CITA (las cartas de Mateo) el renglon vacio
        # no es '' sino '>', y el prefijo '> ' hay que sacarlo ANTES de unir, no despues: uniendo
        # primero, el '>' queda incrustado en la mitad del parrafo y ningun texto matchea.
        parrafos, buf, cita = [], [], False
        for ln in cuerpo.split('\n'):
            t = ln.strip()
            if t.startswith('>'):
                cita = True
                t = t[1:].strip()
            elif not t:
                cita = False
            if not t:
                if buf: parrafos.append((' '.join(buf), cita)); buf = []
            else:
                buf.append(t)
        if buf:
            parrafos.append((' '.join(buf), cita))
        lineas = []
        for ln, es_cita in parrafos:
            s = ('> ' + ln) if es_cita else ln
            if not s or s.startswith('#') or s.startswith('|'):
                continue
            # dialogo: **NOMBRE:** texto   (el nombre puede traer una acotacion entre parentesis)
            d = re.match(r'^\*\*([A-ZÁÉÍÓÚÑ][^*:]{0,40}?):?\*\*:?\s*(.*)$', s)
            if d and d.group(2):
                lineas.append((re.sub(r'\s*\(.*?\)\s*', '', d.group(1)).strip(), limpiar_md(d.group(2))))
                continue
            # carta / cuaderno: las citas en bloque
            if s.startswith('>'):
                c = limpiar_md(s.lstrip('> ').strip())
                # LAS NOTAS DE PRODUCCION NO SON GUION. GUION_3 mete, dentro de las mismas citas,
                # notas de tratamiento y prompts de arte. Colarlas al merge pide decidir sobre
                # texto que nunca fue para la pantalla.
                ruido = re.match(r'^(🟥|🟨|🟩)?\s*(nota|propuesta|prompt|sobre la frase|base histórica)', c, re.I)
                if c and not c.startswith('**') and len(c) > 25 and not ruido:
                    lineas.append(('(carta)', c))
        out[n] = lineas
    return out


# ---------- lado story.js ----------
def leer_story():
    js = """
      import('file://%s').then(m => {
        const out = {};
        for (const [clave, ids] of Object.entries(m.SECUENCIAS)) {
          const n = /M(\\d+)$/.exec(clave); if (!n) continue;
          const k = +n[1];
          (out[k] ||= []);
          for (const id of ids) {
            const sc = m.SCENES[id]; if (!sc) continue;
            for (const l of sc.lineas) out[k].push([id, l.id, l.personaje || (sc.tipo === 'TIERRA' ? '(carta)' : ''), l.es || '']);
          }
        }
        console.log(JSON.stringify(out));
      });
    """ % STORY
    r = subprocess.run(['node', '-e', js], capture_output=True, text=True, cwd=RAIZ)
    linea = [l for l in r.stdout.splitlines() if l.startswith('{')]
    if not linea:
        sys.exit('no pude leer story.js:\n' + r.stderr[-500:])
    crudo = json.loads(linea[-1])
    # LA RADIO EN VUELO NO ESTA EN story.js. Los tramos de mision (data/missions.js) traen claves
    # que se resuelven en data/strings.js, asi que sin esto todo el transito del Narwal aparecia
    # como "falta en el juego" cuando en realidad ya esta escrito, en otro archivo.
    js2 = """
      Promise.all([import('file://%s'), import('file://%s')]).then(([S, M]) => {
        const out = {};
        M.MISSIONS.forEach((mi, i) => {
          for (const t of (mi.tramos || [])) {
            if (!t.radio) continue;
            const txt = S.STRINGS.es[t.radio]; if (!txt) continue;
            const c = /^([A-ZÁÉÍÓÚÑ][^:]{0,20}):\\s*(.*)$/.exec(txt);
            (out[i + 1] ||= []).push(['(radio)', t.radio, c ? c[1] : '', c ? c[2] : txt]);
          }
        });
        console.log(JSON.stringify(out));
      });
    """ % (RAIZ / 'src' / 'data' / 'strings.js', RAIZ / 'src' / 'data' / 'missions.js')
    r2 = subprocess.run(['node', '-e', js2], capture_output=True, text=True, cwd=RAIZ)
    for l in r2.stdout.splitlines():
        if l.startswith('{'):
            for k, v in json.loads(l).items():
                crudo.setdefault(k, [])
                crudo[k] = crudo[k] + v
    # el prologo vive dentro de storyM1: se separa por el prefijo P del id de escena
    d = {int(k): v for k, v in crudo.items()}
    pro = [x for x in d.get(1, []) if x[0].startswith('P')]
    d[1] = [x for x in d.get(1, []) if not x[0].startswith('P')]
    d[0] = pro
    return d


def emparejar(gs, js):
    """Empareja por mejor parecido, cada linea una sola vez. Devuelve filas clasificadas."""
    libres = list(range(len(js)))
    filas, usados = [], set()
    for gi, (gh, gt) in enumerate(gs):
        mejor, mejorS = None, 0
        for ji in libres:
            s = sim(gt, js[ji][3])
            if s > mejorS:
                mejor, mejorS = ji, s
        if mejor is not None and mejorS >= PARECIDO:
            libres.remove(mejor); usados.add(mejor)
            estado = '=' if mejorS >= IGUAL else '~'
            filas.append((estado, mejorS, (gh, gt), js[mejor]))
        else:
            filas.append(('G', 0, (gh, gt), None))
    for ji in libres:
        filas.append(('J', 0, None, js[ji]))
    return filas


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    md = '--md' in sys.argv
    G, J = leer_guion(), leer_story()
    nums = sorted(set(G) | set(J))
    if args:
        pedido = {int(re.sub(r'\D', '', a) or 0) for a in args}
        nums = [n for n in nums if n in pedido]

    todo = {}
    for n in nums:
        todo[n] = emparejar(G.get(n, []), J.get(n, []))

    if not md:
        print(f'{"":6s} {"=":>4s} {"~":>4s} {"G":>4s} {"J":>4s}   (= igual · ~ distinto · G solo guion · J solo juego)')
        for n, filas in todo.items():
            c = {k: sum(1 for f in filas if f[0] == k) for k in '=~GJ'}
            nom = 'PRÓLOGO' if n == 0 else f'M{n}'
            print(f'{nom:6s} {c["="]:4d} {c["~"]:4d} {c["G"]:4d} {c["J"]:4d}')
        if len(nums) == 1:
            n = nums[0]
            print()
            for est, s, g, j in todo[n]:
                if est == '=':
                    continue
                print(f'--- {est}  {"" if not s else f"parecido {s:.0%}"}')
                if g: print(f'  GUION  {g[0]}: {g[1][:150]}')
                if j: print(f'  JUEGO  [{j[1]}] {j[2]}: {j[3][:150]}')
        return

    # ---------- el documento de decisiones ----------
    out = ['''# MERGE — GUION_3 contra el juego

> **Qué es esto.** El guion del juego se migró desde `data/strings.js` cuando esa fuente ya estaba
> **desactualizada** respecto de [`GUION_3.md`](GUION_3.md). O sea: se centralizó texto viejo. Este
> documento enfrenta las dos versiones línea por línea para poder elegir sin releer las dos fuentes
> enteras.
>
> **Cómo se usa.** Cada bloque tiene una marca. Poné una `x` en la que quieras, o escribí la tuya
> en `PROPIA:`. Después, `python3 tools/aplicar_merge.py` las lleva a `data/story.js`.
>
> Las líneas **iguales** no aparecen: no hay nada que decidir con ellas.

| marca | significa |
|---|---|
| `~` | **las dos existen y son distintas.** Una es reescritura de la otra — hay que elegir |
| `G` | **solo en GUION_3.** Falta escribirla en el juego |
| `J` | **solo en el juego.** O es invento viejo, o el guion la perdió |

''']
    for n, filas in todo.items():
        nom = 'PRÓLOGO' if n == 0 else f'MISIÓN {n}'
        c = {k: sum(1 for f in filas if f[0] == k) for k in '=~GJ'}
        if c['~'] + c['G'] + c['J'] == 0:
            out.append(f'## {nom}\n\nSin diferencias: las {c["="]} líneas coinciden.\n\n---\n\n')
            continue
        out.append(f'## {nom}\n\n`{c["="]}` iguales · `{c["~"]}` distintas · `{c["G"]}` solo guion · `{c["J"]}` solo juego\n\n')
        for est, s, g, j in filas:
            if est == '=':
                continue
            if est == '~':
                out.append(f'### ~ {j[1]} · parecido {s:.0%}\n\n')
                out.append(f'- [ ] **GUION_3** — {g[0]}: {g[1]}\n')
                out.append(f'- [ ] **JUEGO** — {j[2]}: {j[3]}\n')
                out.append('- [ ] **PROPIA:** \n\n')
            elif est == 'G':
                out.append(f'### G · falta en el juego\n\n')
                out.append(f'- [ ] **AGREGAR** — {g[0]}: {g[1]}\n')
                out.append('- [ ] **DEJAR AFUERA**\n\n')
            else:
                out.append(f'### J {j[1]} · no está en GUION_3\n\n')
                out.append(f'- [ ] **DEJAR** — {j[2]}: {j[3]}\n')
                out.append('- [ ] **BORRAR**\n\n')
        out.append('---\n\n')
    # PRESERVAR LO YA ELEGIDO. Regenerar el documento no puede costar el trabajo de decision que
    # ya se hizo: se leen las casillas marcadas del archivo viejo y se vuelven a marcar en el
    # nuevo, emparejando por el TEXTO de la opcion (los ids de bloque cambian al corregir el
    # extractor, el texto de la opcion no).
    texto = ''.join(out)
    if SALIDA.exists():
        # LA CLAVE DE UNA MARCA ES EL TEXTO DE SU BLOQUE, no su encabezado.
        #
        # Las opciones que no tienen texto propio (BORRAR, DEJAR AFUERA) son las dificiles: con la
        # clave vacia se marcaban todas juntas, y cayendo al encabezado tampoco alcanza — TODOS
        # los bloques `G` se titulan igual ("falta en el juego"), asi que una sola marca terminaba
        # marcando ciento treinta. Se las ata al texto de la opcion hermana del mismo bloque, que
        # es lo unico que identifica al bloque de verdad.
        previas, ancla = set(), ''
        for ln in SALIDA.read_text().split('\n'):
            if re.match(r'^### ', ln):
                ancla = ''; continue
            m = re.match(r'^- \[([ xX])\] \*\*([A-ZÁÉÍÓÚÑ_0-9 ]+)\*\*:?\s*(.*)$', ln.strip())
            if not m:
                continue
            cuerpo = norm(m.group(3))[:90]
            if cuerpo and not ancla:
                ancla = cuerpo
            if m.group(1).lower() == 'x':
                previas.add((m.group(2).strip(), cuerpo or ('##' + ancla)))
        if previas:
            nuevas, n, ancla = [], 0, ''
            for ln in texto.split('\n'):
                if re.match(r'^### ', ln): ancla = ''
                m = re.match(r'^- \[ \] \*\*([A-ZÁÉÍÓÚÑ_0-9 ]+)\*\*:?\s*(.*)$', ln.strip())
                if not m:
                    nuevas.append(ln); continue
                cuerpo = norm(m.group(2))[:90]
                if cuerpo and not ancla: ancla = cuerpo
                if (m.group(1).strip(), cuerpo or ('##' + ancla)) in previas:
                    nuevas.append(ln.replace('- [ ]', '- [x]', 1)); n += 1
                else:
                    nuevas.append(ln)
            texto = '\n'.join(nuevas)
            print(f'  marcas conservadas: {n} de {len(previas)}')
    SALIDA.write_text(texto)
    print(f'{SALIDA.relative_to(RAIZ)} · {sum(len(f) for f in todo.values())} filas')


if __name__ == '__main__':
    main()
