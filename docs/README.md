# Documentación de RASANTE

El punto de entrada del proyecto es el [`README.md`](../README.md) de la raíz (qué es el juego y
cómo se juega). Acá vive el resto: la referencia técnica y de diseño.

**Vocabulario rápido:** todo run combina dos FASES — **PASILLO** (el vuelo rasante, estado
`'play'`) y **ARENA** (el asalto al buque, volado en 3D). Los MODOS del menú son combinaciones de
las dos; **MINUTOS SAGRADOS** es el modo que juega solo ARENA. Detalle en
[ARQUITECTURA.md](ARQUITECTURA.md).

| documento | qué es | tipo |
|---|---|---|
| [ARQUITECTURA.md](ARQUITECTURA.md) | mapa del código: qué archivo hace qué, las convenciones, dónde tocar cada cosa | referencia — al día |
| [ROADMAP.md](ROADMAP.md) | backlog de ideas y features a futuro (numeradas, referenciables) | vivo |
| [ANALISIS_ROADMAP.md](ANALISIS_ROADMAP.md) | análisis de cada ítem del roadmap: facilidad, propuesta, dependencias, orden sugerido | análisis |
| [ESTADO.md](ESTADO.md) | bitácora del estado del proyecto: qué está hecho y qué falta | vivo |
| [NIVELES.md](NIVELES.md) | diseño de la campaña: los 12 niveles, cinemáticas y guion. Fuente de verdad del script | diseño |
| [PLAN_ELECTRON_STEAM.md](PLAN_ELECTRON_STEAM.md) | plan de migración a Electron y publicación en Steam (con bloque "RETOMAR ACÁ") | ejecución |
| [PREGUNTAS_HISTORICAS.md](PREGUNTAS_HISTORICAS.md) | dudas históricas anotadas para consultar con un historiador | vivo |
| [UPDATE_ANIMATIONS.md](UPDATE_ANIMATIONS.md) | notas y pendientes del pipeline de animaciones/sprites | notas |
| [PENDIENTES_DE_REDISENO.md](PENDIENTES_DE_REDISENO.md) | inventario de TODAS las unidades y objetos del juego con el estado de su arte y las specs de sprite | vivo |
| [PROMPT_ARENA_VUELO_LIBRE.md](PROMPT_ARENA_VUELO_LIBRE.md) | **vigente** — la fase ARENA como vuelo 3D libre en un ring acotado (mundo mirable, física de gas, auto-retorno, MINUTOS SAGRADOS) | prompt / spec |
| [PROMPT_MOMENTUM_3D.md](PROMPT_MOMENTUM_3D.md) | ~~ARENA en órbita~~ — implementado y **rechazado**: rotaba el buque en vez de volar el avión | histórico |

Para arrancar a tocar el código, empezá por **[ARQUITECTURA.md](ARQUITECTURA.md)**.
