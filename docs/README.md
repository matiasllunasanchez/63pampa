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

## 📖 historia/ — sincronizados con GUION_3 (3.0/3.1)

| documento | qué es |
|---|---|
| [GUION_3.md](historia/GUION_3.md) | **EL GUION VIGENTE.** 14 misiones, prólogo P.0–P.4, dos finales. Marcas: 🟥 nuevo / 🟨 cambió / sin marca = igual a 2.3 |
| [MISION_FINAL.md](historia/MISION_FINAL.md) | diseño de nivel de la M14: fases, contrarreloj, muertes, el momento del misil, las dos salidas |
| [STORYBOARD_1.md](historia/STORYBOARD_1.md) | guion visual con prompts + sección **ACTUALIZACIÓN 3.0** al final (P.0, terito, M3 y M10 nuevas, tabla obligatoria M4–M14) |
| [PROMPTS_HOJAS_PERSONAJE.md](historia/PROMPTS_HOJAS_PERSONAJE.md) | hojas modelo de los 9 personajes + props + **marcas personales v3.0** |
| [AVIONES_ESCUADRON.md](historia/AVIONES_ESCUADRON.md) | los 5 A-4B personalizados + marcas personales + regla: el terito es el ÚNICO animal pintado |
| [SISTEMA_DIALOGO.md](historia/SISTEMA_DIALOGO.md) | texto-primero: IDs estables, registros, `hold`, timing. **El juego funciona sin voces por diseño** |
| [RETRATOS.md](historia/RETRATOS.md) | 🟥 escenas estáticas estilo VN: 14 placas de ambiente + ~28 retratos con expresiones + la lista de cuadros sagrados que exigen escena completa |
| [REFERENCIAS.md](historia/REFERENCIAS.md) | tipografías y capas de foto — ⚠ *falta el 4º registro (DIALOGO)* |
| [SOUNDTRACK.md](historia/SOUNDTRACK.md) | ✅ **v3.0** — 30 pistas renumeradas a 14 misiones, con vorágine (Final A), Perú (m10), Final B, el invento y el sting de Cóndor; **cada pista con referencia real de emoción** (material privado, no se publica) |
| [PREGUNTAS_HISTORICAS.md](historia/PREGUNTAS_HISTORICAS.md) | ⚠ *faltan las de la 3.0: Mirage peruanos, países, dialectos, correo, matrículas C-2xx* |
| `characters_examples/` | renders de referencia ya generados |

## 🎬 produccion/ — teaser y video IA

| documento | qué es |
|---|---|
| [TEASER.md](produccion/TEASER.md) | **plan de rodaje del teaser** (~45 s): 5 planos, prompts A/B/movimiento, presupuesto 620 créditos, checklists |
| [PLAN_CINEMATICAS.md](produccion/PLAN_CINEMATICAS.md) | qué lleva video IA y qué va como láminas fijas con sonido (la mayoría) |
| [TEST_KLING_CINEMATICAS.md](produccion/TEST_KLING_CINEMATICAS.md) | protocolo de tests de Kling 3.0 + tabla de modelos + orden de gasto |
| [PROMPTS_TEST4.md](produccion/PROMPTS_TEST4.md) | prompts expandidos del test "Tero sube al avión" |
| [pixelrefine.py](produccion/pixelrefine.py) | herramienta: recupera el pixel art de video IA (`--native WxH --colors N`) |

## ⚙️ sistemas/ — specs de gameplay

| documento | qué es | estado |
|---|---|---|
| [SPEC_MODO_HISTORIA.md](sistemas/SPEC_MODO_HISTORIA.md) | 🟥 **análisis funcional del modo historia (pantallas VN)** para IA implementadora: 12 RF con criterios de aceptación, fixture del locker, 6 fases. Incluye las **divergencias** entre el spec y el código real | **F1 construida** (motor de líneas: tipeo + `hold` + fallback a negro; `npm run story`). F2–F6 pendientes |
| [PLAN_MINUTOS_SAGRADOS.md](sistemas/PLAN_MINUTOS_SAGRADOS.md) | la fase ARENA como pelea de boss, etapas E0–E9 | **vigente** |
| [PROMPT_ARENA_VUELO_LIBRE.md](sistemas/PROMPT_ARENA_VUELO_LIBRE.md) | ARENA como vuelo 3D libre en ring acotado | **vigente** |
| [PIRUETAS.md](sistemas/PIRUETAS.md) · [VELOCIDAD_MACH.md](sistemas/VELOCIDAD_MACH.md) | maniobras y escalones de velocidad | ⚠ *la tabla misión→mejora quedó desacoplada: las mejoras son roguelike (2 opciones desde M3), el guion no fija cuál va cuándo* |
| [PROMPT_ALTURAS.md](sistemas/PROMPT_ALTURAS.md) · [PROMPT_COMBUSTIBLE.md](sistemas/PROMPT_COMBUSTIBLE.md) · [PROMPT_ESCUADRON.md](sistemas/PROMPT_ESCUADRON.md) | alturas, combustible, escuadrón | specs |

## 📋 proyecto/ — gestión

| documento | qué es | estado |
|---|---|---|
| [ROADMAP.md](proyecto/ROADMAP.md) | backlog de ideas y features (numeradas, referenciables) | vivo |
| [ANALISIS_ROADMAP.md](proyecto/ANALISIS_ROADMAP.md) | análisis de cada ítem: facilidad, dependencias, orden | análisis |
| [ESTADO.md](proyecto/ESTADO.md) | bitácora del estado del proyecto | vivo |
| [PENDIENTES_DE_REDISENO.md](proyecto/PENDIENTES_DE_REDISENO.md) | inventario de unidades/objetos con estado de arte y specs de sprite | vivo |
| [PLAN_CAMPANA_001.md](proyecto/PLAN_CAMPANA_001.md) | mapeo guion → `missions.js` | ✅ **v0.0.2 — sincronizado con GUION_3**: 14 misiones, IDs m1–m14 estables, roguelike real, final de dos rumbos en pantallas |

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
