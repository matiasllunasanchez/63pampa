Estás trabajando en RASANTE, el juego de aviones de Malvinas del repo `63pampa`. Tu tarea es
aplicar los cambios de la misión 1 que pidió el autor.

## Lo primero, antes de tocar nada

Leé, en este orden:

1. `docs/ARQUITECTURA.md` — el mapa del código y sus convenciones. **Manda sobre cualquier
   suposición.**
2. `docs/historia/misiones/M1_CAMBIOS.md` — **los pedidos. Es la fuente de verdad de esta tarea.**
3. `docs/historia/misiones/M1_LECTURA.md` — cómo queda la misión contada de punta a punta.
4. `docs/historia/RESUELTOS_GUION.md` — decisiones ya tomadas por el autor. **No se reabren.**
5. `docs/sistemas/FORMA_DE_CADA_MISION.md` — el marco de ida / objetivo / vuelta.

## Las reglas del proyecto que no se negocian

- **`src/data/story.js` es la fuente de verdad del guion.** Se edita ahí, no en `strings.js`.
  `strings.js` tiene una copia vieja de las mismas escenas: **no la toques y no la uses como
  referencia** — sus textos están desactualizados.
- **El comportamiento es DATO, no código.** Está escrito en `src/data/cuarentena.js`: *"ESTO ES LA
  ÚNICA PERILLA. Sacar una entrada de estas listas revive la parte entera: no hay que buscar `if`s
  por el código."* Si para cumplir un pedido tenés que sembrar `if`s de misión por el motor, parás
  y proponés dónde va la perilla.
- **`src/data/` no importa lógica del juego.** Son planillas.
- **No inventes diálogo.** Si un pedido necesita líneas nuevas, escribí una propuesta y **mostrala
  antes de pegarla**. El autor escribe sus personajes.
- **No cambies ni una palabra de un texto existente** salvo que el pedido lo diga explícitamente.
- Al terminar: `npm run check` en verde.

## Qué hacer

Aplicá los pedidos **1 a 9** de `M1_CAMBIOS.md`. Están numerados y cada uno dice qué toca.

**Trabajá en dos etapas y paráte entre una y otra:**

**Etapa 1 — lo que es puro dato y texto.** Los pedidos 2 y 3 (la frase de Cóndor y el reordenamiento
de las escenas previas para que Cóndor cierre siempre), y el pedido 9 (sacar los puntos de la UI de
M1). Terminá esto, corré `npm run check`, y mostrame el diff antes de seguir.

**Etapa 2 — lo que toca sistemas.** Los pedidos 5, 6, 7 y 8: la ida y la vuelta sin cinemática en el
medio, el radar que no se muestra y se reemplaza por avisos de voz, que en M1 no se pueda morir ni
cambiar de piloto, y las explicaciones de los controles repartidas entre los personajes.

Para cada uno de estos cuatro, **antes de escribir código, decime dónde pensás poner la perilla** —
qué archivo de `src/data/` la guarda y cómo se llama. Si un pedido no entra en el modelo de datos
actual, decilo en vez de forzarlo.

## Qué NO hacer

- **No implementes los pedidos 4, 10 y 11.** Están marcados 🔵 y les falta una decisión del autor:
  dónde va el comentario de que Tero y el Turco ya se conocen, si los poderes se enseñan en M1 o en
  M2, y qué es exactamente el paneo final. **Preguntá y esperá.**
- **No toques el pedido 1 más allá de M1.** Dice que la foto de La Casada no se vuelve a ver hasta
  que muere el Vasco, y eso choca con la escena `M04_FOTO`. En M1 la foto **sí se ve** y queda como
  está. El resto se resuelve cuando se trabaje la misión 4.
- No arregles de paso otras misiones, aunque veas algo mal. Anotalo y seguí.

## Dos cosas rotas que vas a encontrar, y qué hacer con ellas

1. **Las charlas en vuelo no dibujan nada.** Corren su máquina de estados, congelan el odómetro
   hasta 25 s y no muestran una letra: `drawStory` es lo único que las pinta y `game.js` lo llama
   sólo en los estados `story` y `epilogue`. Afecta a M1, M2, M3 y M4. **Es preexistente y no es
   parte de esta tarea**, pero varios de estos pedidos dependen de que el diálogo en vuelo se vea.
   Si te bloquea, decímelo antes de improvisar un arreglo.
2. **`M01_7_020` usa `cara: 'turco_ternura'`, que no existe.** Anotalo, no lo arregles solo.

## Cuando termines

1. `npm run check` en verde.
2. Actualizá `docs/historia/misiones/M1_CAMBIOS.md`: cada pedido aplicado pasa a ✅ con una línea
   abajo diciendo **qué archivo tocaste**. Los que no pudiste, a ❌ con el motivo.
3. Actualizá `docs/historia/misiones/M1_LECTURA.md` para que describa la misión como quedó.
4. Anotá en `docs/historia/RESUELTOS_GUION.md` lo que quedó cerrado.
5. Decime en tres líneas qué quedó distinto al jugar M1.
