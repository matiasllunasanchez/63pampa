# Prompt para la sesión de código — instalar las caras de Pichón y del Turco · 20/11/2026

**Pedido del autor:** *«qe tengo q hacer para usar todas las imagenes generadas para pichon y turco en el tutorial»*.

Copiá el bloque entero y pegáselo a la sesión de código.

```
Hay retratos nuevos para instalar en RASANTE: PICHÓN (75 caras) y EL TURCO (55 caras). Son los
dos del tutorial. Instalalos y conectalos. NO cambies ningún texto de diálogo. Antes de
instalar y antes de conectar, mostrame las tablas que te pido abajo.

=== DÓNDE ESTÁN ===
- docs/historia/chats_hojas/07_PICHON/RESULTADOS/  (15 tiras: 01_base … 15_radio_3)
- docs/historia/chats_hojas/08_TURCO/RESULTADOS/   (11 tiras: 01_base … 12_hangar_2; la 07
  NO existe, el autor la salteó)
- En cada carpeta, 00_ORDEN.md tiene el nombre de cada cara, de izquierda a derecha.
- Formatos: .webp y .jpeg.

=== CORTE ===
- Cada tira = 5 celdas. Si no son cuadradas, recortá cada celda en cuadrado centrado
  horizontalmente y desde el borde de arriba. Si alguna tira trae 6 celdas o una celda rota
  (sin cabeza), avisame cuál.
- Gemini a veces cambió una cara respecto de lo pedido (ej.: en 07_PICHON/13_radio la celda 4
  puede haber salido "enojado" en vez de "explicando"). Mirá cada celda: si no coincide con su
  nombre, renombrala por lo que muestra (pichon_radio_enojo, etc.) y anotalo en la tabla.
- Si se ve la marca de agua de Gemini, sacala.
- Mismo pipeline y tamaño que los retratos actuales (tools/install_retratos.py → 108×108 en
  assets/portraits/). Las caras *_cab_*, *_masc_* (cabina del A-4) y *_hang_* (hangar) llevan
  su fondo: NO se les quita.
- Las caras nuevas con el mismo nombre que una vieja (pichon_neutro, turco_ceno, etc.) la
  REEMPLAZAN. Guardá las viejas aparte por si hay que volver.

Mostrame: tabla tira → celda → nombre final, con las que renombraste o descartaste.

=== CONEXIÓN — TUTORIAL (data/tutorial.js) ===
- En el tutorial Tero está VOLANDO y el Turco y Pichón le hablan DESDE TIERRA, POR RADIO.
  Toda línea T(TURCO, …) y T(PICHON, …) usa una cara *_radio_* elegida por lo que dice la
  línea: explica → radio_explicando; reta («changuito») → radio_ceno; aprueba → radio_sonrisa
  o radio_aprueba; festeja → radio_sonrisa; se impacienta → radio_impaciente; corregido por
  el Turco → pichon_radio_corregido; duda → pichon_radio_duda; alerta → radio_grito /
  pichon_radio_alerta; etc. Variá: que no se repita la misma cara en líneas seguidas si hay
  otra que sirve.
- Mostrame la tabla línea → cara elegida antes de aplicar.

=== CONEXIÓN — EL RESTO DE LA CAMPAÑA (data/story.js) ===
- Revisá toda línea con personaje PICHÓN o EL TURCO y elegí la cara nueva que mejor encaje:
  en tierra, las de fondo gris; Pichón volando (por ejemplo las lecciones de M1, LEC_M1_*),
  las pichon_cab_*; escuchando la radio (M05_ESCUCHA), pichon_radio_escucha; el Turco en el
  hangar, las turco_hang_*.
- Mismo formato: tabla línea → cara anterior → cara nueva, antes de aplicar.

=== LIMPIEZA, cuando yo confirme que quedaron bien ===
- Las tiras originales se guardan como fuente del arte, donde el repo guarda las fuentes de
  los retratos (si no hay un lugar, proponeme uno).
- Recién ahí se borran docs/historia/chats_hojas/07_PICHON y 08_TURCO y sus filas en
  chats_hojas/00_INDICE.md.

Al terminar: caras instaladas, las que faltan o se descartaron, y dónde quedó conectada cada una.
```
