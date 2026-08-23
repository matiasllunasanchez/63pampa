#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera historia/GUION_LECTURA.md a partir de historia/GUION_3.md.

La versión de lectura es un DERIVADO: se comparte con gente de afuera y no lleva
marcas de cambio, notas de producción ni referencias a otros documentos.
Cada vez que se toca GUION_3.md hay que volver a correr esto:

    python3 produccion/hacer_guion_lectura.py

Después, para el PDF y el .docx, ver produccion/TEASER.md → "Versión de lectura".
"""
import re, sys, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(BASE, "historia", "GUION_3.md")
DST  = os.path.join(BASE, "historia", "GUION_LECTURA.md")
DST2 = os.path.join(BASE, "historia", "GUION_LECTURA_APENDICE.md")

src = open(SRC, encoding="utf-8").read()
lines = src.split("\n")

def idx(prefix):
    for i, l in enumerate(lines):
        if l.startswith(prefix):
            return i
    sys.exit("NO ENCONTRADO: " + prefix)

# ---- 1. recorte por secciones ----
# ORDEN DELIBERADO: primero la HISTORIA, y todo el material de contexto al final.
# Si el contexto va adelante spoilea el guion entero (quién muere, el mecanismo del
# final, el secreto de la foto del Vasco) y el lector deja de poder evaluar la historia.
APENDICE = ("\n".join(lines[idx("## 🟨 1. La idea en una línea"):idx("## 🟥 5. Las mejoras")])
            + "\n" +
            "\n".join(lines[idx("## 🟨 6. El dispositivo narrativo"):idx("# PRÓLOGO")]))
HISTORIA = "\n".join(lines[idx("# PRÓLOGO"):idx("# 9. GUÍA DE DIALECTOS")])
t = HISTORIA + "\n\n@@APENDICE@@\n\n" + APENDICE

# ---- 2. la nota histórica de M10 se reescribe en limpio ----
t = re.sub(
    r"> \*\*Base histórica \(VERIFICADA.*?\n(?:>.*\n)*",
    "> **Nota histórica.** Todo lo que se cuenta en esta misión ocurrió. El Perú entregó diez\n"
    "> Mirage 5P: salieron de La Joya, en Arequipa, hicieron una escala nocturna de\n"
    "> reabastecimiento en Jujuy y aterrizaron en Tandil, a dos mil kilómetros del sur. Los\n"
    "> volaron pilotos peruanos, con las escarapelas argentinas ya pintadas antes de despegar, y\n"
    "> volvieron a su país el mismo día en un Hércules C-130 con librea de Aeroperú. Nunca\n"
    "> entraron en combate.\n", t)

# ---- 3. fuera las citas que son notas de producción ----
t = re.sub(r"\n> \*\*(Nota de tratamiento|Notas de la escena|Nota de diseño|Sobre la frase)\b.*?\n(?:>.*\n)*", "\n", t)

# ---- 4. acotaciones que hablan del documento y no de la historia ----
FUERA = [
 "_(Es honesto: la historia dice que esos aviones no pelearon, y el juego no lo contradice.\nSe lo regala al jugador en los modos donde no hay una historia que traicionar.)_\n",
 "_(No es la frase de la tesis — ésa va en M8, sobre un enemigo. Ésta es otra cosa y tiene\nque serlo: **al Perú lo conocemos.** No es \"el otro lado\", es el de al lado. La hermandad\ndel sur no necesita que nadie la descubra: ya existía.)_\n",
 "_(Cambió: el cuaderno es DIARIO, no borrador de cartas; el hobby viene de la infancia.)_\n",
 "_(Cambió: se agregan la navaja, los jazmines y el destino de la foto.)_\n",
 "_(Cambió: mucho más presente — es mecánica y es ritual.)_\n",
 "_(Sin cambios. Sigue siendo la ley.)_\n",
 "_(Cambió TODO el sistema de papeles. Leer entero.)_\n",
 "_(Cambió: ya no hay cartas cruzadas;  3.2: el marco se OCULTA hasta el final; el final es del jugador.)_\n",
 "(Ya no hay fragmentos de carta del padre entre misiones — la carta es una y es de M13.)\n",
 " _(Y ahora ni esa vez es segura: ver M8.)_",
 " _(Verificación de detalles → PREGUNTAS_HISTORICAS.md.)_",
 " **Va acá, sobre un enemigo\nque murió siendo bueno — no sobre el Perú, que no es \"el otro lado\": es el vecino.**",
]
for f in FUERA:
    t = t.replace(f, "")

# ---- 5. referencias cruzadas a otros documentos ----
t = t.replace('## MISIÓN 14 — "El tero" _(Detalle de diseño en MISION_FINAL.md)_', '## MISIÓN 14 — "El tero"')
t = re.sub(r"\n> Diseño completo del nivel.*?\n> \[MISION_FINAL\.md\]\(MISION_FINAL\.md\)\..*?\n", "\n", t)
t = re.sub(r"\s*Ver PREGUNTAS_HISTORICAS\.md\.", "", t)
t = re.sub(r"\s*\(ver AVIONES_ESCUADRON\.md\)", "", t)
t = re.sub(r"\s*Ver sección 5\.", "", t)
t = re.sub(r"\s*Ver guía de dialectos, sección 9\.", "", t)
t = re.sub(r"\s*\(§4 de\nnotas de producción, el radar humano\)", " (el radar humano de la escuadrilla)", t)
t = re.sub(r"[A-Z_]+\.md", "", t)

# ---- 6. marcas de versión y de cambio ----
t = re.sub(r"[🟥🟨✅⚠⛔🗣📖🎬📋🚀🗄]️?", "", t)
for pat in [r"_\(sin cambios[^)]*\)_", r"\(sin cambios[^)]*\)", r"_\(ex M\d+[^)]*\)_",
            r"_\(renumerad[oa][^)]*\)_", r"_\(reemplaza[^)]*\)_", r"_\(3\.\d[^)]*\)_",
            r"\(3\.\d[^)]*?\)", r"_\(CORREGIDO[^)]*\)_", r"\*\*REESCRITA[^*]*\*\*",
            r"_\(cierra la misión; la risa se corta a la mitad\)_",
            r"_\(backgrounds sin cambios\)_",
            r"_\(el diálogo, sin cambios — es el mejor hangar del juego\)_"]:
    t = re.sub(pat, "", t)

# ---- 7. encabezados: limpiar restos ----
def limpia(m):
    h = m.group(0)
    h = re.sub(r"\s*_\(\s*\)_", "", h); h = re.sub(r"\s*\(\s*\)", "", h)
    h = re.sub(r"\s+—\s*$", "", h);     h = re.sub(r"\s+_\s*$", "", h)
    return re.sub(r"\s{2,}", " ", h).rstrip()
t = re.sub(r"(?m)^#{1,4} .*$", limpia, t)

for a, b in [("## 1. La idea en una línea","## La idea en una línea"),
             ("## 2. La tesis (lo que el juego cree)","## La tesis"),
             ("## 3. Personajes","## Los personajes"),
             ("## 4. Los indicativos","## Los indicativos"),
             ("## 6. El dispositivo narrativo","## El dispositivo narrativo"),
             ("## 7. Mapa emocional","## Mapa emocional")]:
    t = t.replace(a, b)

# ---- 7b. LOS TÍTULOS NO SPOILEAN LA ESCENA QUE ENCABEZAN ----
# Varios encabezados venían anunciando el desenlace de la escena de abajo
# ("la muerte del Gitano", "MUERE CORREA", "Se rompe la Chancha"). En el guion de trabajo
# eso es útil; en la versión de lectura arruina el momento. Se limpian acá.
TITULOS = [
 ('## MISIÓN 6 — "La bomba que no despertó" _(Se rompe la Chancha)_',
  '## MISIÓN 6 — "La bomba que no despertó"'),
 ('## MISIÓN 10 — "Los primos" _(la primera con tres. Y, a dos mil kilómetros, el regalo que llega tarde.)_',
  '## MISIÓN 10 — "Los primos"'),
 ('## MISIÓN 11 — "Lo que no se dice" _(el respiro tenso)_',
  '## MISIÓN 11 — "Lo que no se dice"'),
 ('## MISIÓN 12 — "El ángel Correntino" (MUERE CORREA)',
  '## MISIÓN 12 — "El ángel Correntino"'),
 ('## MISIÓN 13 — "La última mesa" (el asado.)',
  '## MISIÓN 13 — "La última mesa"'),
 ('### Briefing _(incluye el chiste de la casada nº3)_', '### Briefing (aire)'),
 ('### Epílogo — la Chancha _(la Chancha se rompe acá, salvando al Gitano)_', '### Epílogo'),
 ('### El cuaderno (tierra) _(página de diario; entra el cuero de oveja del Colorado)_',
  '### El cuaderno (tierra)'),
 ('### El cuaderno (tierra) _(se suma la oveja y el caracú — el hambre en crudo)_',
  '### El cuaderno (tierra)'),
 ('### El cuaderno (tierra) — la página del cielo _(la certeza de Mateo, recuperada)_',
  '### El cuaderno (tierra) — la página del cielo'),
 ('### EL DESBLOQUEO _(registro SISTEMA — fuera de la campaña)_', '### El desbloqueo'),
 ('### LA CARTA — la única del juego _(esa noche, después del asado)_', '### La carta'),
 ('### Fase 2 — la pantalla _(la muerte del Gitano — EN ACCIÓN, sin anuncio)_',
  '### Fase 2 — la pantalla'),
 ('### Fase 3 — el capitán _(la muerte de Puma — el show y el kamikaze)_',
  '### Fase 3 — el capitán'),
 ('## FINAL A — QUEDARSE _(la vorágine)_', '## FINAL A — QUEDARSE'),
 ('## FINAL B — VOLVER _(el oculto)_', '## FINAL B — VOLVER'),
 ('## _(Ambos finales →)_ Cierre común', '## Cierre común'),
 ('### La cartela de los que ayudaron _(antes de la frase final)_',
  '### La cartela de los que ayudaron'),
 ('### La noticia — 2 de mayo', '### La noticia — 2 de mayo'),
 ('### En vuelo — el silencio del Narwal', '### En vuelo'),
]
for a, b in TITULOS:
    t = t.replace(a, b)
# red de seguridad: cualquier encabezado que anuncie una muerte o una rotura
t = re.sub(r"(?im)^(#{2,4} [^\n]*?)\s*_?\((?=[^)\n]*(muere|muerte|se rompe|kamikaze))[^)\n]*\)_?\s*$",
           r"\1", t)


# ---- 8. la tabla de indicativos pierde la columna de renumeración ----
t = re.sub(r"(?m)(\| \*\*[A-ZÁÉÍÓÚÑ]+\*\*\s+\| )(?:ex M\d+ · |ex M\d+|nueva — )", r"\1", t)
t = re.sub(r"(?m)^\|\s+M(\d+)\s", lambda m: "| M%-5s" % m.group(1), t)

# ---- 9. limpieza final ----
t = re.sub(r"\(\s*\)", "", t); t = re.sub(r"_\(\s*\)_", "", t)
t = re.sub(r"(?m)([^\s])   +", r"\1 ", t)
t = re.sub(r"[ \t]+\n", "\n", t); t = re.sub(r"\n{4,}", "\n\n\n", t)
t = re.sub(r"(?m)^ +(?=_\(|\*\*)", "", t)
t = t.replace("_( **", "_(**")   # ídem, marca borrada dentro de una acotación   # marcas borradas dejaban sangría fantasma

FRONT  = open(os.path.join(BASE, "produccion", "_lectura_front.md"), encoding="utf-8").read()
CIERRE = open(os.path.join(BASE, "produccion", "_lectura_cierre.md"), encoding="utf-8").read()

PORTADA_APENDICE = """# RASANTE

## El cuaderno de Mateo

**Segunda parte: cómo está armado**

Malvinas, 1982

---

## Antes de empezar

Esto es la **segunda parte**, y sólo tiene sentido si ya leíste el guion completo.

Acá está todo lo que deliberadamente no te conté antes: quién es cada uno, de dónde
vienen, cómo funciona el marco narrativo del juego, y el mapa de los cuatro movimientos
de la campaña. Nada de esto estaba en el primer documento a propósito — leído antes te
arruina la historia, porque adelanta quién muere y cómo termina.

Si llegaste hasta acá sin leer el guion, cerralo y leé el otro primero. En serio.

Y si ya lo leíste: además de lo que te pregunté al final de la primera parte, me
interesa una cosa más. **¿Algo de acá te sorprendió?** Si hay algo que el guion no
logró transmitirte y que recién entendés ahora leyendo la explicación, eso es un
problema mío y quiero saberlo.

---

"""

historia, apendice = t.split("@@APENDICE@@")
open(DST,  "w", encoding="utf-8").write(FRONT + historia.strip("\n") + CIERRE)
open(DST2, "w", encoding="utf-8").write(PORTADA_APENDICE + apendice.strip("\n") + "\n")
print("APENDICE: %s" % DST2)
print("GUION_LECTURA.md regenerado — %d bytes" % os.path.getsize(DST))
