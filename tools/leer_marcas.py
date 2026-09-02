#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lee las marcas de los documentos de decisiones (PENDIENTES_GUION, RETRATOS_PENDIENTES...).

TOLERANTE A PROPOSITO. Una marca escrita a mano puede salir `[x]`, `[X]`, `[X}`, `(x)` o `{x}`
segun donde se pare el cursor, y un lector estricto la ignora EN SILENCIO — que es exactamente
como se pierde una respuesta y se termina preguntando dos veces lo mismo.

    python3 tools/leer_marcas.py docs/historia/PENDIENTES_GUION.md
"""
import re, sys, io

MARCA = re.compile(r'[\[({]\s*[xX]\s*[\])}]')          # [x] [X] [X} (x) {x}
ITEM  = re.compile(r'^#{2,4} (?:[^\w\s]+ )*([A-Z]+\d*-\d+)\b')

def leer(path):
    item, vistos, out = None, set(), []
    for ln in io.open(path, encoding='utf-8'):
        m = ITEM.match(ln)
        if m:
            item = m.group(1); continue
        if not MARCA.search(ln):
            continue
        # la opcion marcada es el trozo entre esta marca y el proximo separador
        for trozo in re.split(r'\s·\s|\s\|\s', ln.strip().lstrip('- ')):
            if MARCA.search(trozo):
                op = MARCA.sub('', trozo).strip(' *_|')
                if item and item not in vistos:
                    vistos.add(item); out.append((item, op))
                elif not item:
                    out.append(('(suelta)', op))
    return out

for p in sys.argv[1:]:
    res = leer(p)
    print('=== %s — %d marcas' % (p.split('/')[-1], len(res)))
    for k, v in res:
        print('  %-12s → %s' % (k, v[:80]))
