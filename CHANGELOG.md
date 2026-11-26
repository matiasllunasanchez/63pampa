# Versiones de RASANTE

La versión se ve chiquita abajo a la derecha del menú principal y sale del `version` del
`package.json`.

**Cada vez que se sube un build:**

1. Subí la versión en el `package.json`.
2. Anotá acá qué trae.
3. Cuando quede en vivo en Steam, completá el BuildID.

Numeración: semver, **X.Y.Z**. Cuando se pide una versión nueva, se analizan los commits desde la
anterior y se sube el número que corresponde:

- **X (mayor):** un cambio grande de juego o de partidas guardadas que no son compatibles. `1.0.0` es el lanzamiento.
- **Y (menor):** contenido o funciones nuevas (modos, aviones, mecánicas, pantallas).
- **Z (parche):** solo arreglos y ajustes, sin nada nuevo.

## 0.3.0 — 26/11/2026

- **La música en vuelo:** al azar entre `music/original` (instrumentales) y `music/soundtrack`, que incluye Zona Rasante, Nadie vuela solo, Alambre, Misty Malvinas y Dicen de mí 2. El mate y Gambeta 1 y 2 quedan para la campaña.
- **OPCIONES → MÚSICA EN VUELO:** AL AZAR o un tema fijo que se repite. Queda guardado. Las etapas del tutorial siguen con su tema.
- **En la pausa:** OPCIONES → TEMA ◄ ► recorre los temas en orden, y el elegido se repite.

## 0.2.0 — 26/11/2026 (Steam BuildID 26938453)

- **Libro de vuelo:** se juegan cinco salidas: El Sheffield, HMS Glasgow, La Ardent, La Plymouth y El Invincible. El Rescate del Belgrano sigue EN DESARROLLO.
- **El Sheffield:** la búsqueda con la posición que pasa el Neptune, las láminas y la pantalla de GANASTE con el buque ardiendo. Se ajustaron también la Glasgow y la Plymouth.
- **El Invincible:** el Exocet se carga con las flechas o la cruceta, el compañero carga a la par en la otra manguera y los A-4C pasan detrás del misil. Además, la pantalla de GANASTE nueva.
- **La búsqueda en las islas:** bengalas con paracaídas, balsas y la mancha de aceite. El radar propio puede fallar y hay que esperar a que recargue.
- **Una pirueta nueva:** el SALTO DE OLA (↑↓←).
- **Las mejoras del álbum:** con metal normal, plata y oro.
- **Menos pájaros en el pasillo.**
- **La versión:** chiquita, abajo a la derecha del menú principal.

## 0.1.0 — Playtest cerrado (24 y 25/11/2026)

Primera versión en Steam, para amigos y familia con keys. Salieron cinco builds con el mismo
número, cuando todavía no se veía la versión en el juego.

| BuildID | Fecha | Qué trajo |
|---|---|---|
| 26904417 | 24/11 | La primera subida: Steam integrado y la versión completa para Windows y Mac. |
| 26927298 | 25/11 | Sin overlay de Steam (bajaba los FPS). La ULTI del rasante, el tirabuzón y la barrena, el tutorial en el que se puede morir, la noche con luna llena y las tildes en todo el juego. |
| 26927549 | 25/11 | La etiqueta de la eyección sin claves repetidas. |
| 26930405 | 25/11 | Feedback del tutorial (el paso del hielo a -1°), los helicópteros con 25 vistas de giro, el Harrier de frente con 25 × 5 poses y la ULTI que sale al completar RASANTE. |
| 26935426 | 25/11 | SALIR cierra el juego de verdad, el gabinete en alta resolución y monitores ultra anchos (el juego ocupa casi todo el alto). |
