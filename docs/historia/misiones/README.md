# EL REPASO FINAL DE LA CAMPAÑA

*Cómo se trabaja acá, qué salió hasta ahora, y cuándo se toca el código.*

---

## EL MÉTODO — decidido por el autor

**Se repasan las misiones de a una, en orden.** Cada una tiene dos archivos:

- **`M#_LECTURA.md`** — la misión contada de punta a punta: el guion verbatim, qué se juega, qué
  se le enseña al jugador, quién habla y cuándo. Se lee como una historia. Lo técnico está al
  final, separado.
- **`M#_CAMBIOS.md`** — lo que el autor pide cambiar. **Manda sobre el código, sobre `GUION_3.md`
  y sobre cualquier otra documentación.**

**No se implementa nada sobre la marcha.** Los cambios se transcriben, se numeran y se dejan
asentados. **Cuando las catorce misiones estén resueltas, recién ahí se hace la pasada de
implementación sobre todo el juego** — el código, el guion y el resto de la documentación de una
sola vez y en orden.

La razón es simple: **muchos de los cambios no son de una misión, son de la campaña entera.**
Implementarlos misión por misión significaría hacer cada uno catorce veces y dejar el juego a
mitad de camino entre dos criterios.

### Reglas de trabajo

1. **Al transcribir se copia textual.** Si algo hace ruido, se levanta como pedido; no se edita en
   silencio ni se ofrecen "mejoras" que nadie pidió.
2. **Antes de abrir una discusión, se lee `../RESUELTOS_GUION.md`.** Ahí están 93 decisiones ya
   tomadas. Lo cerrado no se vuelve a preguntar.
3. **Los pedidos se pueden dar por chat.** Quedan asentados igual en el archivo de cambios: el
   archivo es el registro, no el canal.

---

## LAS REGLAS DE CAMPAÑA QUE YA SALIERON

*Esto es lo que hay que revisar dos veces en la pasada de implementación, porque no afecta a una
misión sino a todas.*

| Regla | Estado | Dónde está escrita |
|---|---|---|
| **Cóndor cierra siempre.** La última voz antes de que el jugador tome el control es la suya, en las catorce | ⬜ por implementar | `M1_CAMBIOS.md` · 3 |
| **El radar no existe en M1.** Sólo avisos de voz al azar de Cóndor o Puma. De M2 en adelante existe de verdad, con su interfaz, y se explica ahí | ⬜ por implementar | `M1_CAMBIOS.md` · 6 · `M2_CAMBIOS.md` · 1 |
| **Si hay objetivo, hay cinemática.** De M2 en adelante, toda misión con blanco real lleva su cinemática entre el objetivo y la vuelta. M1 no, porque ahí las dos mitades se explican con diálogo | ⬜ por implementar | `M2_CAMBIOS.md` · 3 |
| **Los poderes se enseñan en M2**, no en M1. M1 queda sólo con la UI y el rasante a mano | ⬜ por implementar | `M1_CAMBIOS.md` · 10 |
| **La foto de La Casada se ve en M1 y no se vuelve a ver hasta que muere el Vasco** | ⬜ por implementar · choca con `M04_FOTO` | `M1_CAMBIOS.md` · 1 |
| **O tres bombas, o tanques.** El jugador elige la carga antes de salir; la Chancha se llama en la ida y en la vuelta; sin bombas el avión va más rápido | ✅ aprobado · backlog de sistemas | `M2_CAMBIOS.md` · 5b |

### Y una que está en el aire

**El relevo de pilotos.** En M1 quedó cerrado que sólo se juega con Tero y que morir reinicia la
misión con pantalla negra. **Falta decidir qué pasa de M2 en adelante**: si vuelven los cinco
aviones como cinco vidas, o si nunca se cambia de piloto en las catorce y el sistema de relevo se
cae entero. Ver `M2_CAMBIOS.md` · 6.

---

## ESTADO DE LAS CATORCE

| | Misión | Lectura | Cambios |
|---|---|---|---|
| **M0** | El prólogo | ✅ | ⬜ vacío |
| **M1** | Con sal en las alas | ✅ | ✅ 11 pedidos · prompt de implementación escrito |
| **M2** | El bautismo de fuego | ✅ | 🔵 4 pedidos + 2 preguntas abiertas |
| **M3** | El invento | ✅ | ⬜ vacío |
| **M4** | El día que sangró el mar | ✅ | ⬜ vacío |
| M5 | El callejón de las bombas | ⬜ | ⬜ |
| M6 | La bomba que no despertó | ⬜ | ⬜ |
| M7 | Pastelitos | ⬜ | ⬜ |
| M8 | El batir de las alas | ⬜ | ⬜ |
| M9 | El pibe | ⬜ | ⬜ |
| M10 | Los primos | ⬜ | ⬜ |
| M11 | Lo que no se dice | ⬜ | ⬜ |
| M12 | Ángel de Corrientes | ⬜ | ⬜ |
| M13 | La cena | ⬜ | ⬜ |
| M14 | El tero | ⬜ | ⬜ |

---

## LOS ARCHIVOS DE ESTA CARPETA

- **`COMO_LEER_ESTOS_DOCUMENTOS.md`** — el diccionario. Traduce `goal`, `cfg`, `roster`, `fases`,
  los tipos de pantalla y todo el vocabulario técnico al castellano, con una tabla de *"quiero
  cambiar esto → se toca acá"*.
- **`M#_LECTURA.md`** · **`M#_CAMBIOS.md`** — uno de cada por misión.
- **`PROMPT_M1.md`** — el prompt para la sesión con acceso al código. Se arma uno por misión
  cuando llega el momento.

### Y afuera de esta carpeta

- **`../RESUELTOS_GUION.md`** — 93 decisiones ya tomadas por el autor, con sus casillas marcadas.
  **Se lee antes de discutir nada.**
- **`../PENDIENTES_GUION.md`** — 35 ítems abiertos en todo el proyecto. De M0 a M4 no hay ninguno:
  el grueso es M14, con dieciséis.
- **`../GUION_3.md`** — el guion. ⚠ Tiene notas viejas adentro que el código ya superó: *la fecha
  del archivo no garantiza la fecha del párrafo.*
- **`../../sistemas/`** — los planes de motor.
