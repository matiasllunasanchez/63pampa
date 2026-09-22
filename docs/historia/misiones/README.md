# EL REPASO FINAL DE LA CAMPAÑA

*Cómo se trabaja acá, qué salió hasta ahora, y cuándo se toca el código.*

---

## EL MÉTODO — decidido por el autor

**Se repasan las misiones de a una, en orden.** Cada una tiene dos archivos:

- **`M#_LECTURA.md`** — la misión contada de punta a punta: el guion verbatim, qué se juega, qué
  se le enseña al jugador, quién habla y cuándo. Se lee como una historia. Empieza con un
  **PANEO GENERAL**: toda la misión en una página. Lo técnico está al final, separado.
- **`M#_CAMBIOS.md`** — lo que el autor pide cambiar. **Manda sobre el código, sobre `GUION_3.md`
  y sobre cualquier otra documentación.**

Cuando una misión tiene sus cambios cerrados se le escribe un **`PROMPT_M#.md`** y lo ejecuta una
sesión con acceso directo al código.

### Reglas de trabajo

1. **Al transcribir se copia textual.** Si algo hace ruido, se levanta como pedido; no se edita en
   silencio ni se ofrecen "mejoras" que nadie pidió.
2. **Antes de abrir una discusión, se lee `../RESUELTOS_GUION.md`.** Ahí están las decisiones ya
   tomadas. Lo cerrado no se vuelve a preguntar.
3. **Los pedidos se pueden dar por chat.** Quedan asentados igual en el archivo de cambios: el
   archivo es el registro, no el canal.

> **Lo que cambió respecto del plan original.** Al principio esto decía que no se implementaba
> nada hasta tener las catorce. **M1 se implementó igual, el 18 y 19 de septiembre**, y salió
> bien: `npm run check` en verde y varios bugs de campaña encontrados en el camino. Así que el
> método real es **misión por misión, y las reglas de campaña se anotan acá abajo** para darles
> una pasada sola al final.

---

## LAS REGLAS DE CAMPAÑA QUE YA SALIERON

*Esto es lo que hay que revisar dos veces, porque no afecta a una misión sino a todas.*

| Regla | Estado | Dónde está escrita |
|---|---|---|
| **Cóndor cierra siempre.** La última voz antes de que el jugador tome el control es la suya, en las catorce | ✅ en M1 · ⬜ las otras trece | `M1_CAMBIOS.md` · 3 · `M2_CAMBIOS.md` · 4 |
| **El radar no existe en M1.** Sólo avisos de voz. De M2 en adelante existe de verdad, con su interfaz, y se explica ahí | ✅ M1 hecho · ⬜ falta la explicación en M2 | `M1_CAMBIOS.md` · 6 · `M2_CAMBIOS.md` · 1 |
| **Si hay objetivo, hay cinemática.** De M2 en adelante, toda misión con blanco real lleva su cinemática entre el objetivo y la vuelta | ⬜ por implementar | `M2_CAMBIOS.md` · 3 |
| **Los poderes se enseñan en M2**, no en M1 | ✅ apagados en M1 · ⬜ falta enseñarlos en M2 | `M1_CAMBIOS.md` · 10 · `M2_CAMBIOS.md` · 2 |
| **La foto de La Casada se ve en M1 y no se vuelve a ver hasta que muere el Vasco** | ✅ en M1 · ⏳ choca con `M04_FOTO`, se resuelve en M4 | `M1_CAMBIOS.md` · 1 |
| **Cada misión abre con su indicativo de ave por radio** y tiene su cartel de despegue con rumbo propio | ✅ las catorce | `../RESUELTOS_GUION.md` · G-08 |
| **Ningún personaje nombra una tecla.** Las teclas las muestra el juego durante la pausa | ✅ en M1 · molde para el resto | `M1_CAMBIOS.md` · 8 |
| **O tres bombas, o tanques.** El jugador elige la carga antes de salir; la Chancha se llama en la ida y en la vuelta; sin bombas el avión va más rápido | ✅ aprobado · backlog de sistemas | `../../sistemas/PLAN_CARGA_Y_CHANCHA.md` |

### Y una que está en el aire, y es grande

**Qué pasa cuando te matan.** M1 se implementó como **no se puede morir** (`sinMuerte`), siempre
Tero. Pero el 18/9 el autor dijo que **sí se puede morir y que morir reinicia la misión** con
pantalla negra — y eso no llegó al código. **Falta decidir cuál vale, y qué pasa de M2 en
adelante**: si vuelven los cinco aviones como cinco vidas, o si nunca se cambia de piloto en las
catorce y el sistema de relevo se cae entero. Ver `M2_CAMBIOS.md` · 6.

---

## ESTADO DE LAS CATORCE

| | Misión | Lectura | Cambios | Código |
|---|---|---|---|---|
| **M0** | El prólogo | ✅ | ⬜ vacío | — |
| **M1** | Con sal en las alas | ✅ | ✅ 11 pedidos | ✅ **implementada 18-19/9** |
| **M2** | El bautismo de fuego | ✅ *(al día, 19/9)* | 🔵 4 pedidos + 2 decisiones | ⬜ |
| **M3** | El invento | ✅ | ⬜ vacío | ⬜ |
| **M4** | El día que sangró el mar | ✅ | ⬜ vacío | ⬜ |
| M5 | El callejón de las bombas | ⬜ | ⬜ | ⬜ |
| M6 | La bomba que no despertó | ⬜ | ⬜ | ⬜ |
| M7 | Pastelitos | ⬜ | ⬜ | ⬜ |
| M8 | El batir de las alas | ⬜ | ⬜ | ⬜ |
| M9 | El pibe | ⬜ | ⬜ | ⬜ |
| M10 | Los primos | ⬜ | ⬜ | ⬜ |
| M11 | Lo que no se dice | ⬜ | ⬜ | ⬜ |
| M12 | Ángel de Corrientes | ⬜ | ⬜ | ⬜ |
| M13 | La cena | ⬜ | ⬜ | ⬜ |
| M14 | El tero | ⬜ | ⬜ | ⬜ |

**Colas abiertas de M1**, que no son de M1: el cierre de Cóndor en las otras trece, y `M04_FOTO`.

---

## LOS ARCHIVOS DE ESTA CARPETA

- **`COMO_LEER_ESTOS_DOCUMENTOS.md`** — el diccionario. Traduce `goal`, `cfg`, `roster`, `fases`,
  los tipos de pantalla y todo el vocabulario técnico al castellano, con una tabla de *"quiero
  cambiar esto → se toca acá"*.
- **`M#_LECTURA.md`** · **`M#_CAMBIOS.md`** — uno de cada por misión.
- **`PROMPT_M1.md`** — el prompt de la sesión que implementó M1. Sirve de molde: se arma uno por
  misión cuando los cambios están cerrados.

### Y afuera de esta carpeta

- **`../RESUELTOS_GUION.md`** — las decisiones ya tomadas por el autor, con sus casillas marcadas.
  **Se lee antes de discutir nada.**
- **`../PENDIENTES_GUION.md`** — lo que sigue abierto en todo el proyecto. De M0 a M4 no hay
  ninguno: el grueso es M14.
- **`../GUION_3.md`** — el guion. ⚠ Tiene notas viejas adentro que el código ya superó: *la fecha
  del archivo no garantiza la fecha del párrafo.*
- **`../../sistemas/`** — los planes de motor.
