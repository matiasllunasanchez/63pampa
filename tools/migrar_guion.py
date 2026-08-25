#!/usr/bin/env python3
"""
migrar_guion — pasa el guion de PANTALLAS (data/strings.js) a ESCENAS (data/story.js).

QUE PROBLEMA RESUELVE. Hoy lo que define una escena esta repartido en cuatro archivos:

    data/strings.js    el texto y el titulo         (formato viejo: {title, paras[], img, style})
    data/placas.js     que placa de fondo usa
    core/dialogue.js   que cara pone cada hablante  (CARA_NEUTRA + CARA_ESCENA)
    core/dialogue.js   el adaptador que junta todo eso en tiempo de ejecucion

Para cambiar UNA escena hay que tocar tres archivos y acordarse de los tres. Y peor: los tres se
desincronizan en silencio — un id de cara que no existe no da error, cae al placeholder, y la
pantalla se ve igual de "bien" que si el asset faltara.

El modelo de ESCENA de data/story.js ya existia y ya era el destino declarado ("el resto del
guion todavia vive como pantallas y entra por el adaptador"). Este script hace esa mudanza: cada
escena queda con SU texto, SU placa, SU cara por linea y SU registro, en un solo lugar.

ES DE UNA SOLA VEZ. Despues de correrlo, la fuente de verdad es data/story.js y se edita ahi.
Queda en el repo para que se pueda leer COMO se hizo la mudanza, no para volver a correrlo — si
se corre de nuevo sobre un strings.js ya vaciado, no encuentra nada y no escribe.

    python3 tools/migrar_guion.py [--dry-run]
"""
import argparse
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
STRINGS = RAIZ / 'src' / 'data' / 'strings.js'
PLACAS = RAIZ / 'src' / 'data' / 'placas.js'
DIALOGO = RAIZ / 'src' / 'core' / 'dialogue.js'
SALIDA = RAIZ / 'src' / 'data' / 'story.js'

STYLE_TIPO = {'tierra': 'TIERRA', 'carta': 'CARTA'}


def bloque(s, i, ab, ce):
    """El bloque balanceado que empieza en el primer `ab` desde `i`."""
    j = s.index(ab, i)
    d = 0
    for n in range(j, len(s)):
        if s[n] == ab:
            d += 1
        elif s[n] == ce:
            d -= 1
            if d == 0:
                return j, n + 1
    raise ValueError('bloque sin cerrar')


def campo(txt, nombre):
    m = re.search(nombre + r":\s*'((?:[^'\\]|\\.)*)'", txt)
    return m.group(1) if m else None


def paras(txt):
    m = re.search(r'paras:\s*\[', txt)
    if not m:
        return []
    a, b = bloque(txt, m.start(), '[', ']')
    return [x.group(1) for x in re.finditer(r"'((?:[^'\\]|\\.)*)'", txt[a:b])]


def leer_mapa(ruta, nombre):
    """Un objeto literal `const NOMBRE = {...}` de un .js, como dict de strings."""
    s = ruta.read_text()
    i = s.index(nombre)
    a, b = bloque(s, i, '{', '}')
    cuerpo = re.sub(r'//[^\n]*', '', s[a:b])
    return dict(re.findall(r"'?([A-Za-zÁÉÍÓÚÑ_0-9]+)'?\s*:\s*'([^']+)'", cuerpo))


def leer_cara_escena(ruta):
    s = ruta.read_text()
    i = s.index('const CARA_ESCENA')
    a, b = bloque(s, i, '{', '}')
    out = {}
    for m in re.finditer(r"(\w+):\s*\[([^\]]*)\]", s[a:b]):
        out[m.group(1)] = [x.strip().strip("'") or None for x in m.group(2).split(',')]
    return out


def js(v):
    return "'" + v.replace('\\', '\\\\').replace("'", "\\'") + "'"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    s = STRINGS.read_text()
    placa_de = leer_mapa(PLACAS, 'PLACA_DE_CUADRO')
    cara_neutra = leer_mapa(DIALOGO, 'const CARA_NEUTRA')
    cara_escena = leer_cara_escena(DIALOGO)

    claves = []
    for m in re.finditer(r'\b((?:story|epi)M\d+)\s*:\s*\[', s):
        if m.group(1) not in claves:
            claves.append(m.group(1))
    if not claves:
        sys.exit('No hay secuencias storyM*/epiM* en strings.js — la mudanza ya se hizo.')

    escenas, secuencias, avisos = [], [], []
    for clave in claves:
        i = s.index(clave + ':')
        a, b = bloque(s, i, '[', ']')
        cuerpo = s[a + 1:b - 1]
        # cada pantalla es un {...} de primer nivel
        pantallas, k = [], 0
        while True:
            m = re.search(r'\{', cuerpo[k:])
            if not m:
                break
            x, y = bloque(cuerpo, k + m.start(), '{', '}')
            pantallas.append(cuerpo[x:y])
            k = y
        ids = []
        for n, p in enumerate(pantallas):
            img = campo(p, 'img')
            level = campo(p, 'level')
            sid = img or (clave.upper() + '_TARJETA')
            if sid in [e[0] for e in escenas]:
                sid = f'{sid}_{n}'
            ids.append(sid)
            estilo = campo(p, 'style')
            tipo = 'TARJETA' if level else STYLE_TIPO.get(estilo, 'VN')
            titulo = level or campo(p, 'title')
            lineas = [campo(p, 'obj')] if level else paras(p)
            lineas = [x for x in lineas if x]
            placa = placa_de.get(img) if img else None
            if img and not placa and tipo == 'VN':
                avisos.append(f'{sid}: sin placa en placas.js')
            escenas.append((sid, tipo, titulo, placa, img, lineas, cara_escena.get(img or '', [])))
        secuencias.append((clave, ids))

    # ---------- lo escrito A MANO se conserva TAL CUAL ----------
    # M07_LOCKER es el fixture de aceptacion: lo usan tools/unit.js (holds, ids, el cambio de
    # registro por linea), tools/fixture_story.js y data/pruebas.js. Ademas es la unica escena con
    # holds de verdad — pisarla con la version migrada, que viene en 0, seria perder el ejemplo de
    # como se actua una escena. Todo lo que ya esta en story.js y NO sale del guion viejo se copia
    # textual antes de lo migrado.
    a_mano = []
    if SALIDA.exists():
        vs = SALIDA.read_text()
        m = re.search(r'export const SCENES = \{', vs)
        if m:
            ini, fin = bloque(vs, m.start(), '{', '}')
            cuerpo = vs[ini + 1:fin - 1]
            k = 0
            while True:
                mm = re.search(r'^\s*(\w+):\s*\{', cuerpo[k:], re.M)
                if not mm:
                    break
                x, y = bloque(cuerpo, k + mm.start(), '{', '}')
                sid = mm.group(1)
                if sid not in [e[0] for e in escenas]:
                    ini_l = cuerpo.rfind('\n', 0, k + mm.start()) + 1
                    a_mano.append(cuerpo[ini_l:y] + ',')
                k = y
    if a_mano:
        print(f'  conservadas a mano: {len(a_mano)}')

    # ---------- emitir ----------
    out = ['''// EL GUION, ESCENA POR ESCENA. Contenido puro: aca no hay logica (data/ no importa nada del
// juego, ver ARQUITECTURA). El que las interpreta es core/dialogue.js.
//
// ESTE ARCHIVO ES LA FUENTE DE VERDAD DEL MODO HISTORIA, y esa es toda la idea. Antes, definir una
// escena pedia tocar tres archivos: el texto en data/strings.js, la placa de fondo en
// data/placas.js y la cara de cada hablante en core/dialogue.js. Cambiar una escena era acordarse
// de los tres, y los tres se desincronizaban en silencio — un id de cara que no existe no da
// error, cae al placeholder, y la pantalla se ve igual que si el asset simplemente faltara.
//
// Ahora cada escena trae lo suyo junto: su registro, su placa, su titulo y sus lineas, y cada
// linea su hablante, su cara y su hold. Se edita ACA.
//
// Reglas de datos que NO se negocian (SISTEMA_DIALOGO):
//   - el `id` de linea es inmutable aunque el texto cambie, y no se reutiliza jamas;
//   - se numera de 10 en 10 para poder intercalar sin renumerar;
//   - `en` vacio cae a `es` — el guion todavia es solo castellano;
//   - `hold` son los segundos de SILENCIO despues de la linea. Es actuacion, no delay tecnico:
//     el 4.0 de "El Vasco tenia quince años" ES la escena. El guion migrado viene en 0 porque no
//     se inventan: se ponen escena por escena, y esa es la mejora que habilita este archivo.
//
// TIPOS: 'VN' caja de dialogo con busto · 'TARJETA' la placa de nivel · 'TIERRA' el cuaderno de
// Mateo (birome) · 'CARTA' el block del padre.

export const SCENES = {''']
    out += a_mano

    for sid, tipo, titulo, placa, img, lineas, caras in escenas:
        out.append(f'  {sid}: {{')
        out.append(f'    id: {js(sid)}, tipo: {js(tipo)},')
        cab = []
        if titulo:
            cab.append(f'titulo: {js(titulo)}')
        if placa:
            cab.append(f'placa: {js(placa)}')
        if img:
            cab.append(f'img: {js(img)}')
        if cab:
            out.append('    ' + ', '.join(cab) + ',')
        out.append('    lineas: [')
        for n, txt in enumerate(lineas):
            mm = re.match(r'^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ \.]*?):\s*(.*)$', txt)
            per, cuerpo = (mm.group(1).strip(), mm.group(2)) if mm else (None, txt)
            cara = (caras[n] if n < len(caras) else None) or (cara_neutra.get(per) if per else None)
            campos = [f'id: {js(sid + "_" + str((n + 1) * 10).zfill(3))}',
                      f'personaje: {js(per) if per else "null"}',
                      f'cara: {js(cara) if cara else "null"}',
                      'hold: 0']
            out.append('      { ' + ', '.join(campos) + ',')
            out.append(f'        es: {js(cuerpo)}, en: \'\' }},')
        out.append('    ],')
        out.append('  },')
    out.append('};\n')

    out.append('''/** QUE ESCENAS, Y EN QUE ORDEN, juega cada momento de la campaña.
 *
 *  Las claves son las mismas de siempre (`storyM1`, `epiM4`…) porque es lo que pide game.js: una
 *  secuencia se arranca por nombre. Separar el ORDEN del CONTENIDO es lo que permite reordenar la
 *  campaña —o intercalar una escena nueva— moviendo un id de lista en vez de cortar y pegar texto.
 */
export const SECUENCIAS = {''')
    for clave, ids in secuencias:
        out.append(f'  {clave}: [{", ".join(js(i) for i in ids)}],')
    out.append('};\n')

    txt = '\n'.join(out)
    if args.dry_run:
        print(f'{len(escenas)} escenas · {len(secuencias)} secuencias · {len(txt.splitlines())} lineas (no escrito)')
    else:
        SALIDA.write_text(txt)
        print(f'{SALIDA.relative_to(RAIZ)} · {len(escenas)} escenas · {len(secuencias)} secuencias')
    for a in avisos:
        print('  AVISO:', a)


if __name__ == '__main__':
    main()
