#!/usr/bin/env python3
"""
hacer_prompts_prologo — arma la version LISTA PARA PEGAR de los prompts del prologo.

docs/historia/PROMPTS_VN_PROLOGO.md es la FUENTE DE VERDAD, pero es un documento de
referencia: cada prompt arranca con un marcador [AIRE] o [TIERRA] que hay que reemplazar a
mano por el bloque de estilo completo antes de generar. Este script hace ese reemplazo y
escribe PROMPTS_VN_PROLOGO_LISTOS.md, donde cada prompt se copia entero sin armar nada.

    python3 tools/hacer_prompts_prologo.py

Si cambia un prompt, se cambia EN LA FUENTE y se vuelve a correr esto. El archivo generado
no se edita a mano.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HIST = ROOT / 'docs' / 'historia'
SRC = HIST / 'PROMPTS_VN_PROLOGO.md'
OUT = HIST / 'PROMPTS_VN_PROLOGO_LISTOS.md'
# Las PLACAS viven en su propio documento y se arman igual. Los bloques de estilo salen del
# prologo, que es donde estan definidos: una sola fuente para el estilo.
SRC_PLACAS = HIST / 'PROMPTS_PLACAS.md'
OUT_PLACAS = HIST / 'PROMPTS_PLACAS_LISTOS.md'

# (nº de asset, trozo IDENTIFICATORIO del encabezado en la fuente, archivo destino, tipo)
#
# Se busca por ENCABEZADO y no por posicion a proposito: la fuente es un documento vivo, y
# agregar un bloque de ejemplo en cualquier parte corria todos los indices. Con el encabezado,
# reordenar o intercalar secciones no rompe nada; solo romperia RENOMBRAR un encabezado, y eso
# el script lo avisa por nombre.
ASSETS = [
    ( 1,  'PLACA P.1.a',              'plates/p1a_arroyo',    'placa TIERRA · 3:4'),
    ( 2,  'PLACA P.1.b',              'plates/p1b_sapito',    'placa TIERRA · 3:4'),
    ( 3,  'PLACA P.1.c',              'plates/p1c_cuaderno',  'placa AIRE · 3:4'),
    ( 4,  'PLACA P.2 —',              'plates/p2_cocina',     'placa AIRE · 16:9'),
    ( 5,  'PLACA P.2-b',              'plates/p2b_cocina_gris', 'placa AIRE · 16:9'),
    ( 6,  'PLACA P.3.a',              'plates/p3a_telefono',  'placa AIRE · 16:9'),
    ( 7,  'PLACA P.3.b',              'plates/p3b_papeles',   'placa AIRE · 16:9'),
    ( 8,  'PLACA P.3.c',              'plates/p3c_puerta',    'placa AIRE · 16:9'),
    ( 9,  'PLACA P.4',                'plates/p4_hoja',       'placa TIERRA · 3:4'),
    (10, 'TINTA P.4',                'ink/tinta_p4_avioncito', 'recorte tinta · fondo blanco'),
    (11, 'PROP — la birome',         'props/obj_birome',       'recorte prop · fondo magenta'),
    (12, 'MATEO : sonrisa colimba',  'portraits/mateo_casa_sonrisa', 'retrato'),
    (13, 'MATEO : serio',            'portraits/mateo_casa_serio',   'retrato'),
    (14, 'ESTEBAN (TERO) : sonrisa chica', 'portraits/tero_civil_sonrisa', 'retrato'),
    (15, 'ESTEBAN (TERO) : blanco',  'portraits/tero_civil_blanco',  'retrato'),
    (16, 'NORMA : cálida',           'portraits/norma_calida',       'retrato'),
    (17, 'NORMA : seria',            'portraits/norma_seria',        'retrato'),
    (18, 'CÓNDOR : el parlante',     'portraits/condor_parlante',    'retrato'),
    (19, 'fig_tero_p2_sentado',      'figures/fig_tero_p2_sentado',   'figura'),
    (20, 'fig_tero_p2_telefono',     'figures/fig_tero_p2_telefono',  'figura'),
    (21, 'fig_tero_p2_radio',        'figures/fig_tero_p2_radio',     'figura'),
    (22, 'fig_mateo_p2_sentado',     'figures/fig_mateo_p2_sentado',  'figura'),
    (23, 'fig_norma_p2_sirviendo',   'figures/fig_norma_p2_sirviendo','figura'),
    (24, 'fig_norma_p2_telefono',    'figures/fig_norma_p2_telefono', 'figura'),
]
# La placa P.2 con los personajes HORNEADOS (nivel 3) queda AFUERA a proposito: la fuente misma
# la desaconseja porque casa la placa con un solo momento de la escena.

PLACAS = [
    # (clave del encabezado en la fuente, id del asset). El orden es el de produccion.
    ('A1 ·',  'linea_amanecer'),   ('A2 ·',  'linea_atardecer'), ('A3 ·',  'linea_noche'),
    ('A4 ·',  'hangar_dia'),       ('A5 ·',  'hangar_noche'),    ('A6 ·',  'vestuario'),
    ('A7 ·',  'radio'),            ('A8 ·',  'cocina_calida'),   ('A9 ·',  'cocina_gris'),
    ('A10 ·', 'fogon'),            ('A11 ·', 'cabina_dia'),      ('A12 ·', 'cabina_noche'),
    ('A13 ·', 'pista_lluvia'),     ('A14 ·', 'jazminero'),       ('A15 ·', 'tandil'),
    ('A16 ·', 'museo'),            ('B1 ·',  'p4_hoja'),
    ('C1 ·',  'm7_foto_frente'),   ('C2 ·',  'm7_foto_dorso'),
    ('C4 ·',  'm10_mirage_fila'),  ('C5 ·',  'm12_tallado'),
    ('C6 ·',  'm13_carta_locker'), ('C7 ·',  'final_monte'),     ('C8 ·',  'mesa_dos_papeles'),
]
# C3 (la libreta del Pichon) NO esta aca: su prompt vive en PROMPTS_HOJAS_PERSONAJE.md como
# {LIBRETA_PICHON} y se trae de alla, para no tener dos copias que se desincronicen.
PLACA_PRESTADA = ('{LIBRETA_PICHON}', 'm9_libreta', 'PROMPTS_HOJAS_PERSONAJE.md')

CAB_PLACAS = """# LAS PLACAS — los {n} prompts, listos para pegar

> ⚠️ **GENERADO — no editar a mano.** Sale de [PROMPTS_PLACAS.md](PROMPTS_PLACAS.md), que es la
> fuente de verdad. Se regenera con `python3 tools/hacer_prompts_prologo.py`.

Son **los fondos de toda la campaña**: los lugares donde ocurre la historia, vacíos. Ninguna
lleva gente — las caras y los cuerpos van después, compuestos encima.

## Cómo se trabaja

1. Copiás el prompt completo y lo pegás. **No hay que agregarle nada.**
2. Guardás con el nombre que dice cada ficha: el motor las busca por ese nombre exacto
   (`assets/plates/<id>.png`) y el guion las llama con `placa: '<id>'`.
3. **Si una placa no existe, el juego no se rompe**: cae a negro.

> **Empezá por la 1** (`linea_amanecer`): es la placa que más se ve del juego y valida el estilo.
> Sus dos variantes de luz —2 y 3— se generan **en la misma sesión**, como segunda pasada, o
> dejan de leerse como el mismo lugar a otra hora.

**Con las primeras cinco, once de las catorce misiones ya tienen sus dos pantallas de aire.**
El mapa de qué misión usa cuál está en [PROMPTS_PLACAS.md](PROMPTS_PLACAS.md).

---
"""

CABECERA = """# PRÓLOGO — los {n} prompts, listos para pegar

> ⚠️ **GENERADO — no editar a mano.** Sale de
> [PROMPTS_VN_PROLOGO.md](PROMPTS_VN_PROLOGO.md), que es la fuente de verdad. Allá los prompts
> arrancan con un marcador `[AIRE]` o `[TIERRA]` que hay que reemplazar por el bloque de estilo
> completo; **acá ya está reemplazado**. Si cambia un prompt, se cambia allá y se corre:
>
> ```bash
> python3 tools/hacer_prompts_prologo.py
> ```

## Cómo se trabaja

1. Copiás el prompt completo y lo pegás en el generador. **No hay que agregarle nada.**
2. Guardás el resultado con **el nombre de archivo que dice cada ficha** — el motor los busca
   por ese nombre exacto (`render/screens.js`: `assets/plates/<id>.png` y
   `assets/portraits/<cara>.png`).
3. **Si un asset no existe, el juego no se rompe**: la placa cae a negro y el retrato a una
   silueta placeholder. Se puede jugar el prólogo entero sin un solo PNG e irlos soltando de
   a uno.

> **Empezá por el 4 y el 9.** La cocina (4) valida el estilo `[AIRE]` y es la placa que más se
> reusa en todo el juego; la hoja (9) valida `[TIERRA]` y es el patrón de **todas** las páginas
> del cuaderno. Si esas dos salen bien, el resto sale. Los retratos, recién después.

> **El 5 se genera como segunda pasada del 4**, en la misma sesión — es la misma cocina
> apagándose. Si la sacás aparte, los objetos cambian de lugar y el corte de tono se pierde.

**Formatos:** placas `[AIRE]` en 16:9 · páginas `[TIERRA]` en 3:4 vertical · retratos y figuras
sobre fondo plano para recortar. Generá grande y reducí con nearest-neighbor.

> Si tu generador rechaza "Metal Slug" por marca registrada, borrá `in the style of Metal Slug
> (SNK Neo Geo era)` — el bloque rinde igual porque describe el estilo por sus atributos.

---
"""


def main():
    s = SRC.read_text()
    # posicion de cada bloque de codigo
    codigos = [(m.start(), m.group(1)) for m in re.finditer(r'```\n(.*?)\n```', s, re.S)]

    def bloque_tras(clave, que):
        """El PRIMER bloque de codigo que aparece despues del encabezado que contiene `clave`.

        Se resuelve asi —y no emparejando cada bloque con el encabezado que lo precede— porque
        un parrafo en negrita al principio de linea es indistinguible de un encabezado en
        negrita (`**{fig_x}**`), y una sola linea en negrita entre el titulo y el prompt
        secuestraba el bloque. Buscando hacia adelante desde el titulo, el texto del medio da
        igual."""
        pos = [m.start() for m in re.finditer(re.escape(clave), s)]
        titulos = [q for q in pos if s.rfind('\n', 0, q) + 1 < q and
                   s[s.rfind('\n', 0, q) + 1:q].lstrip().startswith(('#', '**'))]
        if len(titulos) != 1:
            sys.exit(f'ERROR: "{clave}" ({que}) aparece como encabezado {len(titulos)} veces '
                     'en la fuente. Se renombro o se duplico: revisar ASSETS.')
        despues = [c for pos_c, c in codigos if pos_c > titulos[0]]
        if not despues:
            sys.exit(f'ERROR: no hay ningun prompt despues del encabezado "{clave}" ({que}).')
        return despues[0]

    estilos = {m: bloque_tras(f'Bloque `{m}`', 'bloque de estilo')
               for m in ('[AIRE]', '[TIERRA]', '[TINTA]')}

    def armar(p):
        """Cambia el marcador de estilo por el bloque entero."""
        for marca, bloque in estilos.items():
            if p.startswith(marca):
                return bloque + '\n\n' + p[len(marca):].strip()
        sys.exit(f'ERROR: un prompt no arranca con {", ".join(estilos)}:\n{p[:90]}')

    def titulo_de(txt, clave):
        linea = next(l for l in txt.split('\n') if clave in l and l.lstrip().startswith(('#', '**')))
        return re.sub(r'^#+\s*|\*\*', '', linea).split('*(')[0].strip()

    out = [CABECERA.format(n=len(ASSETS))]
    for num, clave, arch, tipo in ASSETS:
        out.append(f'\n## {num}. {titulo_de(s, clave)}\n\n'
                   f'**Guardar como:** `assets/{arch}.png` · *{tipo}*\n\n'
                   f'```\n{armar(bloque_tras(clave, f"asset {num}"))}\n```\n\n---\n')
    OUT.write_text(''.join(out))
    print(f'OK {OUT.relative_to(ROOT)} — {len(ASSETS)} prompts')

    # ---------- LAS PLACAS ----------
    pl = SRC_PLACAS.read_text()
    cod_pl = [(m.start(), m.group(1)) for m in re.finditer(r'```\n(.*?)\n```', pl, re.S)]

    def bloque_placa(txt, codigos, clave, que):
        pos = [m.start() for m in re.finditer(re.escape(clave), txt)]
        tit = [q for q in pos if txt[txt.rfind('\n', 0, q) + 1:q].lstrip().startswith(('#', '**'))]
        if len(tit) != 1:
            sys.exit(f'ERROR: "{clave}" ({que}) aparece como encabezado {len(tit)} veces.')
        post = [c for p_c, c in codigos if p_c > tit[0]]
        if not post:
            sys.exit(f'ERROR: no hay prompt despues de "{clave}" ({que}).')
        return post[0]

    filas = []
    for clave, arch in PLACAS:
        filas.append((titulo_de(pl, clave), arch, armar(bloque_placa(pl, cod_pl, clave, arch))))
    # la libreta se trae de la hoja de personaje: una sola copia, sin riesgo de deriva
    clave_p, arch_p, doc_p = PLACA_PRESTADA
    otro = (HIST / doc_p).read_text()
    cod_otro = [(m.start(), m.group(1)) for m in re.finditer(r'```\n(.*?)\n```', otro, re.S)]
    filas.append((f'{arch_p} — de {doc_p}', arch_p,
                  armar(bloque_placa(otro, cod_otro, clave_p, arch_p))))

    out_pl = [CAB_PLACAS.format(n=len(filas))]
    for i, (titulo, arch, prompt) in enumerate(filas, 1):
        out_pl.append(f'\n## {i}. {titulo}\n\n**Guardar como:** `assets/plates/{arch}.png`\n\n'
                      f'```\n{prompt}\n```\n\n---\n')
    OUT_PLACAS.write_text(''.join(out_pl))
    print(f'OK {OUT_PLACAS.relative_to(ROOT)} — {len(filas)} prompts')


if __name__ == '__main__':
    main()
