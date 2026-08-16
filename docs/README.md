# Documentación de RASANTE

El punto de entrada del proyecto es el [`README.md`](../README.md) de la raíz (qué es el
juego y cómo se juega). Acá vive el resto, **separado por contexto — una carpeta, un tipo
de trabajo**:

| carpeta | contexto | empezar por |
|---|---|---|
| **[historia/](historia/)** | la campaña "El cuaderno de Mateo": guion, storyboard, personajes, aviones, música, diálogo, referencias de arte | [GUION_3.md](historia/GUION_3.md) |
| **[produccion/](produccion/)** | producción audiovisual: teaser, video IA (Kling), herramientas | [TEASER.md](produccion/TEASER.md) |
| **[sistemas/](sistemas/)** | specs de gameplay: maniobras, velocidad, combustible, alturas, escuadrón, ARENA | [PLAN_MINUTOS_SAGRADOS.md](sistemas/PLAN_MINUTOS_SAGRADOS.md) |
| **[proyecto/](proyecto/)** | gestión: roadmap, estado, inventario de arte, plan de campaña | [ROADMAP.md](proyecto/ROADMAP.md) |
| **[publicacion/](publicacion/)** | salida al mundo: Electron/Steam, antipiratería | [PLAN_ELECTRON_STEAM.md](publicacion/PLAN_ELECTRON_STEAM.md) |
| **[ARQUITECTURA.md](ARQUITECTURA.md)** *(raíz)* | el mapa del código — el único doc suelto, porque es la puerta de todo lo demás | — |
| [_archivo/](_archivo/) | históricos y supersedidos — se consultan, no se borran | — |

**Vocabulario rápido:** todo run combina dos FASES — **PASILLO** (el vuelo rasante, estado
`'play'`) y **ARENA** (el asalto al buque, volado en 3D). Los MODOS del menú son
combinaciones de las dos; **MINUTOS SAGRADOS** es el modo que juega solo ARENA.

**El juego se llama RASANTE. La campaña principal: "El cuaderno de Mateo"** (GUION_3).
La segunda campaña, a futuro: *"El fantasma del mar"*.

---

## 📖 historia/ — sincronizados con GUION_3 (3.5)

| documento | qué es |
|---|---|
| [GUION_3.md](historia/GUION_3.md) | **EL GUION VIGENTE (3.7).** 14 misiones, prólogo **P.1–P.4** (⚠ el marco de la encomienda está OCULTO hasta el final — P.0 NO abre el juego), dos finales, post-créditos. Incluye **§9 dialectos + §9b el tucumano del Turco**. Marcas: 🟥 nuevo / 🟨 cambió / sin marca = igual a 2.3 |
| [GUION_LECTURA.md](historia/GUION_LECTURA.md) | 🟥 **parte 1 — el guion para compartir.** Solo la historia: prólogo, 14 misiones, dos finales, post-créditos. Sin marcas de cambio, sin notas de producción y **sin nada que spoilee** (ni siquiera en los títulos de escena) |
| [GUION_LECTURA_APENDICE.md](historia/GUION_LECTURA_APENDICE.md) | 🟥 **parte 2 — cómo está armado.** Personajes, tesis, marco narrativo, indicativos, mapa emocional. **Se manda DESPUÉS de que el lector terminó la parte 1**, porque adelanta quién muere y cómo termina |

> **Los dos son DERIVADOS de GUION_3.md y no se editan a mano.** Se regeneran con
> `python3 produccion/hacer_guion_lectura.py`. Los textos de apertura y cierre de la parte 1
> viven en `produccion/_lectura_front.md` y `_lectura_cierre.md`; la portada de la parte 2
> está dentro del script. **Cada vez que se toca GUION_3 hay que volver a correrlo** y
> rehacer los PDF/docx.
| [MISION_FINAL.md](historia/MISION_FINAL.md) | diseño de nivel de la M14: fases, contrarreloj, muertes, el momento del misil, las dos salidas |
| [STORYBOARD_1.md](historia/STORYBOARD_1.md) | guion visual con prompts + sección **ACTUALIZACIÓN 3.0** al final (tabla obligatoria M4–M14 + post-créditos). ⚠ La primera mitad tiene tablas marcadas **⛔ SUPERSEDIDA** con la numeración vieja de 12 misiones — **la fuente de verdad es la tabla 3.0 del final** |
| [PROMPTS_HOJAS_PERSONAJE.md](historia/PROMPTS_HOJAS_PERSONAJE.md) | hojas modelo de los 9 personajes + props + marcas personales. ✅ Norma corregida (3.4: **sí se le ve la cara**) · 🟥 faltan 4 hojas nuevas listadas al final (piloto peruano, mecánico de Tandil, Claribel, el pibe de la 10) |
| [AVIONES_ESCUADRON.md](historia/AVIONES_ESCUADRON.md) | los 5 A-4B personalizados + marcas personales + regla: el terito es el ÚNICO animal pintado |
| [SISTEMA_DIALOGO.md](historia/SISTEMA_DIALOGO.md) | texto-primero: IDs estables, 4 registros, `hold`, timing. **El juego funciona sin voces por diseño.** ✅ ejemplos renumerados a `M07_LOCKER_*` (14 misiones) |
| [RETRATOS.md](historia/RETRATOS.md) | escenas estáticas estilo VN: **~16 placas** de ambiente + **~33 retratos** con expresiones + la lista de cuadros sagrados que exigen escena completa |
| [REFERENCIAS.md](historia/REFERENCIAS.md) | tipografías y capas de foto — ⚠ *falta el 4º registro (DIALOGO); vive por ahora en SISTEMA_DIALOGO §"Los cuatro registros"* |
| [SOUNDTRACK.md](historia/SOUNDTRACK.md) | ✅ **v4.0 — 36 pistas** al guion 3.0, cada una con referencia real de emoción (material privado, no se publica). **Toda pista cantada trae su LETRA completa** en español argentino, escrita con frases del guion, y el prompt describe cómo debe sonar la voz. 6 pistas nuevas: la Chancha (M6) · el reverso de la foto (M7) · el relevo de escuadrón · el desbloqueo del Mirage (M10) · la carta (M13) · **el cierre común** (narración sobre fotos reales). Los 4 silencios están documentados como partitura, no como huecos |
| [PREGUNTAS_HISTORICAS.md](historia/PREGUNTAS_HISTORICAS.md) | ✅ Mirage peruanos **verificado** (Tandil, 5/6, nunca combatieron) · ovejas/caracú · Mundial. ⚠ *pendientes: países, dialectos, correo, matrículas C-2xx* |
| `characters_examples/` | renders de referencia ya generados |

## 🎬 produccion/ — teaser y video IA

| documento | qué es |
|---|---|
| [TEASER.md](produccion/TEASER.md) | **plan de rodaje del teaser** (~45 s): 5 planos, prompts A/B/movimiento, presupuesto 620 créditos, checklists |
| [PLAN_CINEMATICAS.md](produccion/PLAN_CINEMATICAS.md) | qué lleva video IA y qué va como láminas fijas con sonido (la mayoría) |
| [TEST_KLING_CINEMATICAS.md](produccion/TEST_KLING_CINEMATICAS.md) | protocolo de tests de Kling 3.0 + tabla de modelos + orden de gasto |
| [PROMPTS_TEST4.md](produccion/PROMPTS_TEST4.md) | prompts expandidos del test "Tero sube al avión" |
| [pixelrefine.py](produccion/pixelrefine.py) | herramienta: recupera el pixel art de video IA (`--native WxH --colors N`) |
| [COMPARTIR_EL_GUION.md](produccion/COMPARTIR_EL_GUION.md) | 🟥 **cómo pasarle la historia a alguien para que opine sin que se le arruine**: las dos partes, qué se le saca al guion de trabajo, cómo se regenera todo y las preguntas que se le hacen al lector |
| `hacer_guion_lectura.py` · `hacer_pdf_lectura.sh` · `_lectura_html.py` · `_lectura_front.md` · `_lectura_cierre.md` | el pipeline de la versión de lectura — ver COMPARTIR_EL_GUION.md |

## ⚙️ sistemas/ — specs de gameplay

| documento | qué es | estado |
|---|---|---|
| [SPEC_MODO_HISTORIA.md](sistemas/SPEC_MODO_HISTORIA.md) | 🟥 **análisis funcional del modo historia (pantallas VN)** para IA implementadora: 12 RF con criterios de aceptación, fixture del locker, 6 fases. Incluye las **divergencias** entre el spec y el código real | **F1 construida** (motor de líneas: tipeo + `hold` + fallback a negro; `npm run story`). F2–F6 pendientes |
| [PLAN_MINUTOS_SAGRADOS.md](sistemas/PLAN_MINUTOS_SAGRADOS.md) | la fase ARENA como pelea de boss, etapas E0–E9 | **vigente** |
| [SPEC_MODO_PASADA.md](sistemas/SPEC_MODO_PASADA.md) | 🟥 **análisis funcional del modo PASADA** para IA implementadora: 14 RF con criterios de aceptación, defaults elegidos, sondas (`?pasada=`, `__pdbg`), fixture y plan P0–P7 | 🟡 P0–P3+P6 construidas — **P4/P7 CONGELADAS: primero el rescate** |
| [PASADA_ADRENALINA.md](sistemas/PASADA_ADRENALINA.md) | 🟥 **análisis de adrenalina del modo construido** (el Sea Dart mata sin lectura — 3 s, un popup y un punto de 3px de frente; la transición teletransporta al buque: de costado y grande → de proa y a 1280 m; 11,6 s de mar vacío por corrida) + **el plan de rescate R0–R6** con criterios medibles y el gate final del ultimátum | **plan — correr ANTES de P4/P7** |
| [PROPUESTAS_PASADA.md](sistemas/PROPUESTAS_PASADA.md) | 🟥 el clímax de una sola pasada: base histórica, mentiras permitidas, las tres propuestas con referencias (juegos y cine) y **§8b: la decisión — el modo compuesto** (A entrada + B suelta + C oleada) | **decidido 15/8 — el plan ejecutable es el SPEC** |
| [PROMPT_ARENA_VUELO_LIBRE.md](sistemas/PROMPT_ARENA_VUELO_LIBRE.md) | ARENA como vuelo 3D libre en ring acotado | **vigente** |
| [SPEC_AGUA_OLAS.md](sistemas/SPEC_AGUA_OLAS.md) | 🟥 **plan ejecutable del agua y las olas** en 9 fases (F0 cimiento `core/sea.js` → F8 mar 3D), escrito prescriptivo para implementador de esfuerzo MEDIO: fórmulas de partida, perillas con valores finales, trampas conocidas del repo, sonda `__ola` y fixture `npm run agua` | **spec — listo para implementar** |
| [PLAN_DESTRUCCION.md](sistemas/PLAN_DESTRUCCION.md) | 🟥 **la destrucción**: el despiece generalizado (el sistema de pedazos del derribo, para TODOS los destructibles), la destrucción MUTUA al chocar, explosiones con carácter por tipo, onda expansiva y encadenamientos. Etapas D0–D5 | **plan — sin implementar** |
| [PLAN_EL_PULSO.md](sistemas/PLAN_EL_PULSO.md) | 🟥 **el clímax como prueba de pulso** (cabina + tiempo casi congelado + secuencia de teclas rotulada contra reloj + cinemática de recompensa variable): análisis del género QTE (5 reglas), reuso casi total (tempo, combos de piruetas, cabina, aproximación 2D — sin 3D ni transición), fases Q0–Q5 | **plan C del boss si falla el rescate · vía garantizada: m14** |
| [PLAN_HARRIERS_PERSECUCION.md](sistemas/PLAN_HARRIERS_PERSECUCION.md) | 🟩 **los Harrier en la cola** (estilo After Burner: presión → sobrepaso → ventana de contraataque) + **el modo PERSECUCIÓN** (volar de numeral: mantener la banda con un líder). Tres planes por fases (A/B/C) | **A completo (H0–H5) · B completo (N0–N3) · C sin empezar.** Falta el arte real del caza de cola y **el playtest** — ver §11 «Qué sigue» |
| [PLAN_AGUA_OLAS.md](sistemas/PLAN_AGUA_OLAS.md) | 🟥 **el agua**: programa visual (espuma/viento, camino del sol, agua por clima, mar 3D) + **las OLAS como obstáculo** (esquive vertical, roce generoso, 3 variantes por clima) — concreta ROADMAP #8 e integra VISUAL_UPGRADES E0.2/E0.3 | **decidido — el plan ejecutable es el SPEC** |
| [PIRUETAS.md](sistemas/PIRUETAS.md) · [VELOCIDAD_MACH.md](sistemas/VELOCIDAD_MACH.md) | maniobras y escalones de velocidad | ⚠ *la tabla misión→mejora quedó desacoplada: las mejoras son roguelike (2 opciones desde M3), el guion no fija cuál va cuándo* |
| [PROMPT_ALTURAS.md](sistemas/PROMPT_ALTURAS.md) · [PROMPT_COMBUSTIBLE.md](sistemas/PROMPT_COMBUSTIBLE.md) · [PROMPT_ESCUADRON.md](sistemas/PROMPT_ESCUADRON.md) | alturas, combustible, escuadrón | specs |

## 📋 proyecto/ — gestión

| documento | qué es | estado |
|---|---|---|
| [ROADMAP.md](proyecto/ROADMAP.md) | backlog de ideas y features (numeradas, referenciables) | vivo |
| [PLAN_VISUAL_FASES.md](proyecto/PLAN_VISUAL_FASES.md) | 🟥 **EL plan visual por fases**: 9 tandas delegables (luz · aire/sensaciones · agua · armas · enemigos vivos · avión · buque 3D · cierre 3D · post-pro) + carril de producción de arte en paralelo. Integra VISUAL_UPGRADES, SPEC_AGUA_OLAS y los frentes del 16/8 | **vivo — arrancar por T1 + producción** |
| [ANALISIS_ROADMAP.md](proyecto/ANALISIS_ROADMAP.md) | análisis de cada ítem: facilidad, dependencias, orden | análisis |
| [ESTADO.md](proyecto/ESTADO.md) | bitácora del estado del proyecto | vivo |
| [PENDIENTES_DE_REDISENO.md](proyecto/PENDIENTES_DE_REDISENO.md) | inventario de unidades/objetos con estado de arte y specs de sprite | vivo |
| [PLAN_CAMPANA_001.md](proyecto/PLAN_CAMPANA_001.md) | mapeo guion → `missions.js` | ✅ **sincronizado con GUION_3 3.7**: 14 misiones, IDs m1–m14 estables, roguelike real, m10 reescrita (Tandil), **§7 desbloqueo del Mirage Mara fuera de campaña**, final de dos rumbos + post-créditos |

## 🚀 publicacion/

| documento | qué es |
|---|---|
| [PLAN_ELECTRON_STEAM.md](publicacion/PLAN_ELECTRON_STEAM.md) | migración a Electron y publicación en Steam (con bloque "RETOMAR ACÁ") |
| [PLAN_ANTIPIRATERIA.md](publicacion/PLAN_ANTIPIRATERIA.md) | plan antipiratería |

## 🗄 _archivo/ — históricos y supersedidos

**GUION.md** (1.0) · **GUION_2.md** (2.3 — el texto extenso de las escenas sin cambios vive
acá) · **GUION_3_CAMBIOS.md** (spec fundida en GUION_3) · **NIVELES.md** (campaña pre-guion,
12 misiones) · **PLAN_VOCES.md** (el juego sale sin voces; retomar si algún día se agregan)
· **UPDATE_ANIMATIONS.md** (notas de julio, trabajo volcado) · **PROMPT_MOMENTUM_3D.md**
(implementado y rechazado).

---

**Nota sobre links internos:** los documentos se movieron de carpeta; algún link relativo
viejo entre contextos (p. ej. el guion apuntando a PIRUETAS.md) puede estar roto. Este
índice es la fuente de verdad de dónde vive cada cosa.

Para tocar el código: **[ARQUITECTURA.md](ARQUITECTURA.md)**.
Para la historia: **[historia/GUION_3.md](historia/GUION_3.md)**.
Para rodar el teaser: **[produccion/TEASER.md](produccion/TEASER.md)**.
