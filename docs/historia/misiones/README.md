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

0. **En lo histórico, primero las fuentes argentinas.** El juego cuenta la guerra desde este lado.
   Las británicas se usan para contrastar, y cuando no coinciden se dice. *(Autor, 9/10.)*

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

## DÓNDE ESTAMOS — 9/10/2026

| | |
|---|---|
| **Implementada** | M1 — pero con dos rondas de cambios nuevas (3 y 4/10) sin implementar |
| **Revisadas, falta implementar** | M2 · M3 · M4 |
| **Lectura hecha, sin comentarios** | M0 |
| **Sin revisar** | M5 → M14 |

**Las misiones sueltas**, fuera de la campaña, se anotan en **`MISIONES_SUELTAS.md`**. La primera:
el rescate de los náufragos del Belgrano.

**Los datos históricos que no caen en ninguna misión** se anotan en **`HECHOS_SUELTOS.md`**.

**Todos los hechos reales, día por día, con dónde está cada uno:** **`CRONOLOGIA_1982.md`**.

**Lo que cambia la campaña entera** (eyectados, prisioneros, la noche, el A-4B, el piloto de la
Chancha, los blancos, Mateo y Puerto Yapeyú): **`CAMBIOS_DE_CAMPANA.md`**.

**Lo que falta decidir** está en **`../PENDIENTES_GUION.md`**, sección 4: once decisiones de
campaña (`C-01` → `C-11`). Las dos que bloquean son **C-01, morir y el relevo** —toca las catorce—
y **C-10, la cifra de muertos del 1 de mayo** —bloquea publicar—.

**Lo que hay que escribir**, proponiendo y mostrando antes de pegar: el briefing de M1 · la línea
de Cóndor que cambia el objetivo en M1 · las lecciones de M2 y M3 · las radios de despegue de M2 y
M3 · el cierre de Cóndor de M2 a M14. Y **falta construir** el motor que elige entre los dos finales de M14: están escritos y nadie
decide cuál corre. Y lo que **sale** de M1: las lecciones de turbo, armas y
espoleta, y el aviso *«Hoy es gratis; mañana no»* (`DIALOGOS_EN_MISION.md`).

**Las lecturas de M1 a M4 describen el código**, no lo decidido después: lo vigente está en cada
`M#_CAMBIOS.md` y en `ESCALERA_DE_APRENDIZAJE.md`.

## LA ESCALERA DE APRENDIZAJE — decidida el 4/10

**M1 a M4 enseñan todo; de M5 en adelante no aparece ninguna mecánica nueva.** Qué se aprende en
cada una, y lo que eso cambia, está en **`ESCALERA_DE_APRENDIZAJE.md`**.

| | |
|---|---|
| **M1** | Diversión, corta · rasante, controles, radar y estrellas · sin turbo ni Momentum |
| **M2** | ⚠ *9/10:* **sobrevolar la isla tras los ataques del 1 de mayo** · se aprenden los límites del radar · el radar de tierra no dispara: sólo Sea Harriers · se habla |
| **M3** | ⚠ *9/10:* **El invento**: a la Bahía de la Anunciación por un supuesto desembarco, y no hay nada · tierra y mar · sólo Sea Harriers, más que en M2 · se sale con bombas y no se tira · vuelta en sigilo · primera mejora al arrancar |
| **M4** | Todo junto, contra el buque · **la primera bomba de verdad** · desde acá, una mejora entre dos al final de cada misión |
| **M5+** | Cambian terreno, enemigos, distancias y blancos. **Nunca la mecánica** |

## LAS REGLAS DE CAMPAÑA QUE YA SALIERON

*Esto es lo que hay que revisar dos veces, porque no afecta a una misión sino a todas.*

| Regla | Estado | Dónde está escrita |
|---|---|---|
| **Cóndor cierra siempre.** La última voz antes de que el jugador tome el control es la suya, en las catorce | ✅ en M1 · ⬜ las otras trece | `M1_CAMBIOS.md` · 3 · `M2_CAMBIOS.md` · 4 |
| ~~**El radar no existe en M1.**~~ **Cambió el 3/10:** M1 se extiende a una zona con radar, y ahí se enseñan el radar y las estrellas | ⬜ por rehacer | `M1_CAMBIOS.md` · segunda ronda, 15 |
| **Si hay objetivo, hay cinemática.** De M2 en adelante, toda misión con blanco real lleva su cinemática entre el objetivo y la vuelta | ⬜ por implementar | `M2_CAMBIOS.md` · 3 |
| **Los poderes se enseñan en M2**, no en M1 | ✅ apagados en M1 · ⬜ falta enseñarlos en M2 | `M1_CAMBIOS.md` · 10 · `M2_CAMBIOS.md` · 2 |
| **La foto de La Casada se ve en M1 y no se vuelve a ver hasta que muere el Vasco** | ✅ en M1 · ⏳ choca con `M04_FOTO`, se resuelve en M4 | `M1_CAMBIOS.md` · 1 |
| **Cada misión abre con su indicativo de ave por radio** y tiene su cartel de despegue con rumbo propio | ✅ las catorce | `../RESUELTOS_GUION.md` · G-08 |
| **Ningún personaje nombra una tecla.** Las teclas las muestra el juego durante la pausa | ✅ en M1 · molde para el resto | `M1_CAMBIOS.md` · 8 |
| **Todo el juego es PASILLO, sin pasada** — *en la campaña; las misiones sueltas pueden usar otras mecánicas: el Super Étendard usa el Pulso (`MISIONES_SUELTAS.md`, S-03)*. No se usan ni la pasada, ni Arena, ni Pulso, ni el minijuego Momentum. M5 y M14 dejan de declarar `climax: 'arena'`. **El poder Momentum queda:** se enseña en M2, en M1 no se muestra | ⬜ | `M2_CAMBIOS.md` · 11 |
| **La radio:** en M1 y M2 se habla —son diversión y tutorial—. **Desde M3**, en zona de radar no habla nadie | ⬜ | `M2_CAMBIOS.md` · 15 · `ESCALERA_DE_APRENDIZAJE.md` |
| **Harriers por estrella:** M1 ninguno · M2 uno · el resto dos. Se reponen mientras sigan las estrellas | ⬜ | `M2_CAMBIOS.md` · 14 |
| **Las alarmas se pierden bajando**, para que el enemigo crea que te derribó | ⬜ | `M2_CAMBIOS.md` · 8 |
| **La Chancha está al principio de cada misión desde M2**, antes de la zona de radar. Hasta M6 también se la llama adentro, al final de la zona. **Desde M7, sólo en la ida**: la rompen rescatando al Gitano dentro del radar en M6 (antes era desde M10) | ⬜ | `ESCALERA_DE_APRENDIZAJE.md` |
| **Cada misión tiene su soundtrack.** La de M3 es «ATADO CON ALAMBRE» | ⬜ | `M3_CAMBIOS.md` · 7 · `../SOUNDTRACK.md` |
| **Las misiones secundarias:** todas aparecen en la historia, dichas o comentadas por los personajes; se desbloquean según la campaña y se juegan aparte | ⬜ · faltan escribir las menciones | `MISIONES_SUELTAS.md` |
| **Si no cargás de la Chancha, volvés a la base.** El juego lo avisa. Era un problema frecuente en 1982 | ⬜ · 🔵 ¿cuenta como misión perdida? | `M5_CAMBIOS.md` · 5 |
| **Del 2 al 12 de mayo: mucha niebla y bruma** en toda misión que caiga en esas fechas, de campaña o secundaria. En la campaña toca **M4** (4 de mayo) | ⬜ | `M4_CAMBIOS.md` · 3 · `MISIONES_SUELTAS.md` |
| **Los A-4 no vuelan de noche** — sólo los Canberra lo hacían. Puede haber una vuelta al anochecer, nada más. **Hay que cambiar M6 (la Chancha «de noche»), M13 y M14** | ✅ decidido 12/10 · ⬜ falta escribirlo | `CAMBIOS_DE_CAMPANA.md` · 3 |
| **Los Fieles vuelan siempre A-4B.** Se puede cambiar el armamento o la velocidad, sin irrealidades. No se cambia de avión | ✅ decidido 12/10 · 🔵 ¿y el Mirage «Mara» de M10? | `CAMBIOS_DE_CAMPANA.md` · 4 |
| **En las aclaraciones: los prisioneros** fueron bien tratados, curados, y casi todos volvieron al final | ⬜ | `CAMBIOS_DE_CAMPANA.md` · 2 |
| **Realidad, no rivalidad.** Los británicos no son los buenos: nosotros no sabíamos muchas cosas, entre ellas qué pasaba con los prisioneros. Se muestra que se salvaron de los dos lados | ✅ principio del autor 12/10 | `M14_CAMBIOS.md` · 5 |
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
| **M0** | El prólogo | ✅ | ⬜ vacío — falta revisarlo | — |
| **M1** | Con sal en las alas | ✅ | ✅ 11 pedidos · ⬜ **segunda ronda, 7 más (3/10)** | ✅ implementada 18-19/9 · ⬜ falta la segunda ronda |
| **M2** | El bautismo de fuego | ✅ *(al día, 19/9)* | 🔵 6 pedidos + 2 decisiones · ⬜ **segunda ronda, 5 más (3/10)** | ⬜ |
| **M3** | El invento | ✅ | ⬜ 5 pedidos (4/10) · más del 9 y 11/10 | ⬜ |
| **M4** | El día que sangró el mar | ✅ | ⬜ 1 pedido (4/10) | ⬜ |
| M5 | El callejón de las bombas | ⬜ | ⬜ **5 pedidos (9/10)** | ⬜ |
| M6 | La bomba que no despertó | ⬜ | ⬜ **1 pedido (10/10)** — material del 23 de mayo, sin decidir | ⬜ |
| M7 | Pastelitos | ⬜ | 🔵 **7 pedidos (10/10)** — el 24 y el 25 de mayo; toca la muerte del Vasco; radio por zonas; ¿Mateo en Borbón?; Galtieri ✅ | ⬜ |
| M8 | El batir de las alas | ⬜ | 🔵 **1 pedido (10/10)** — el Atlantic Conveyor lo hundieron los Super Étendard: ✅ aclaración al final, como M4 | ⬜ |
| M9 | El pibe | ⬜ | 🔵 **1 pedido (10/10)** — el frigorífico de Bahía Ajax, que es su blanco · ✅ **12/10: el Pichón cae y no se sabe; vuelve al final** (`CAMBIOS_DE_CAMPANA.md` · 1) | ⬜ |
| M10 | Los primos | ⬜ | 🔵 **4 pedidos (11/10)** — del 29 de mayo al 4 de junio; los Mirage del Perú: ¿4 o 5 de junio? | ⬜ |
| M11 | Lo que no se dice | ⬜ | 🔵 **3 pedidos (11-12/10)** — el petrolero «Hercules»; la Galahad y la Tristram fueron un solo ataque; la Plymouth | ⬜ |
| M12 | Ángel de Corrientes | ⬜ | 🔵 **3 pedidos (11-12/10)** — los bombardeos de noche hasta que le toca a Mateo; la segunda oleada real del 8 (no fue a la Tristram); ¿Mateo en la Gran Malvina? | ⬜ |
| M13 | La cena | ⬜ | ⬜ **1 pedido (12/10)** — el 9 y el 10 de junio, material | ⬜ |
| M14 | El tero | ⬜ | 🔵 **5 pedidos (10-12/10)** — los ataques nocturnos; al Glamorgan le pegó el ITB, desde tierra; el 12 ya casi no hay aviones; el 13, Dos Hermanas: «entonces ellos tampoco»; **el final nuevo** (pedido 5) | ⬜ |

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
