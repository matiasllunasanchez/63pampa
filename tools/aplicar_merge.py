#!/usr/bin/env python3
"""
aplicar_merge — lleva a data/story.js las decisiones marcadas en docs/historia/MERGE_GUION.md.

QUE APLICA SOLO, Y QUE NO.

  ~  DISTINTA   → se aplica. La linea existe y se le conoce el id: cambiar su texto es seguro.
                  Si marcaste GUION_3, queda el del guion; si marcaste PROPIA, el que escribiste;
                  si marcaste JUEGO, no se toca nada.
  J  SOLO JUEGO → se aplica si marcaste BORRAR. La linea existe y se la saca por id.
  G  SOLO GUION → NO se aplica: se LISTA al final para ponerla a mano.

El ultimo no es pereza. Insertar una linea nueva pide cuatro decisiones que el documento no
contiene: en QUE escena va, en QUE lugar de la escena, con QUE cara, y con cuanto `hold`. Un
script que las adivine mete texto correcto en el lugar equivocado, y eso es peor que no meterlo:
el error queda escondido adentro de una escena que ya funcionaba.

Los ids de linea NO se reutilizan (SISTEMA_DIALOGO D1): cambiar el texto de una linea conserva su
id a proposito — es la promesa que hace posible doblarla y traducirla despues.

    python3 tools/aplicar_merge.py [--dry-run]
"""
import argparse
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MERGE = RAIZ / 'docs' / 'historia' / 'MERGE_GUION.md'
STORY = RAIZ / 'src' / 'data' / 'story.js'

MARCADA = re.compile(r'^- \[[xX]\] \*\*(GUION_3|JUEGO|PROPIA|AGREGAR|DEJAR AFUERA|DEJAR|BORRAR)\*\*:?\s*(.*)$')


def leer_decisiones():
    """[(tipo, id, accion, texto)] en el orden del documento."""
    if not MERGE.exists():
        sys.exit(f'no existe {MERGE.relative_to(RAIZ)} — corré antes: python3 tools/comparar_guion.py --md')
    out, actual = [], None
    for ln in MERGE.read_text().split('\n'):
        h = re.match(r'^### ([~GJ])\s*(\S+)?', ln)
        if h:
            actual = (h.group(1), h.group(2) or '')
            continue
        m = MARCADA.match(ln.strip())
        if m and actual:
            out.append((actual[0], actual[1], m.group(1), m.group(2).strip()))
    return out


def texto_de(bruto):
    """De "GITANO: lo que dice" saca solo lo que dice."""
    m = re.match(r'^[^:]{0,24}:\s*(.*)$', bruto)
    return (m.group(1) if m else bruto).strip()


def js(v):
    return "'" + v.replace('\\', '\\\\').replace("'", "\\'") + "'"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    dec = leer_decisiones()
    if not dec:
        sys.exit('no hay ninguna casilla marcada con [x] en MERGE_GUION.md')

    s = STORY.read_text()
    cambios, borradas, pendientes, saltadas = [], [], [], []

    for tipo, lid, accion, txt in dec:
        if tipo == '~':
            if accion == 'JUEGO':
                saltadas.append(lid); continue
            nuevo = texto_de(txt)
            if not nuevo:
                print(f'  AVISO: {lid} marcada {accion} pero sin texto — se saltea'); continue
            # la linea, por su id, y solo su campo `es`
            pat = re.compile(r"(id: '" + re.escape(lid) + r"'.*?\bes: ')((?:[^'\\]|\\.)*)(')", re.S)
            if not pat.search(s):
                print(f'  AVISO: no encontre la linea {lid} en story.js'); continue
            s = pat.sub(lambda m: m.group(1) + nuevo.replace('\\', '\\\\').replace("'", "\\'") + m.group(3), s, count=1)
            cambios.append((lid, accion, nuevo))
        elif tipo == 'J' and accion == 'BORRAR':
            # el objeto de linea entero: desde su "{ id: '<lid>'" hasta el cierre "}," de ese nivel
            i = s.find("id: '" + lid + "'")
            if i < 0:
                print(f'  AVISO: no encontre la linea {lid}'); continue
            ini = s.rfind('{', 0, i)
            ini = s.rfind('\n', 0, ini) + 1
            d, fin = 0, ini
            for n in range(s.index('{', ini), len(s)):
                if s[n] == '{': d += 1
                elif s[n] == '}':
                    d -= 1
                    if d == 0: fin = n + 1; break
            while fin < len(s) and s[fin] in ',\n': fin += 1
            s = s[:ini] + s[fin:]
            borradas.append(lid)
        elif tipo == 'G' and accion == 'AGREGAR':
            pendientes.append(txt)

    print(f'{len(cambios)} textos cambiados · {len(borradas)} lineas borradas · '
          f'{len(saltadas)} dejadas como estan')
    for lid, acc, t in cambios:
        print(f'  ~ {lid:22s} <- {acc:8s} {t[:60]}')
    for lid in borradas:
        print(f'  J {lid:22s} BORRADA')

    if not args.dry_run:
        STORY.write_text(s)
        print(f'\n{STORY.relative_to(RAIZ)} escrito.')
    else:
        print('\n(dry-run: no se escribio nada)')

    if pendientes:
        print(f'\nA MANO — {len(pendientes)} lineas del guion marcadas AGREGAR. Hay que decidir en')
        print('que escena, en que lugar, con que cara y con cuanto hold. No se adivinan:')
        for t in pendientes:
            print('  +', t[:100])


if __name__ == '__main__':
    main()
