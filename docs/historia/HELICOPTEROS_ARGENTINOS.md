# Helicópteros y aviones argentinos en las islas (1982)

Referencia que pasó el autor el 18/11/2026: `ref/helicopteros_argentinos_1982.webp`
("HELICÓPTEROS DE COMBATE · 24"). Es la lista base para armar los helicópteros jugables
(el primero, el Chinook, "solo usable en algunas misiones").

| Fuerza | Unidad | Modelo | Cant. | Pintura en la referencia |
|---|---|---|---|---|
| Fuerza Aérea | Grupo Aéreo 7 | CH-47C **Chinook** | 2 | camuflaje verde y arena, escarapela, bandera en el pilón trasero |
| Fuerza Aérea | Grupo Aéreo 7 | **Bell 212** | 2 | camuflaje verde y arena |
| Ejército | Batallón de Aviación de Combate 601 | CH-47C **Chinook** | 2 | verde oliva liso, **banda amarilla** en el fuselaje, bandera en el pilón |
| Ejército | Batallón de Aviación de Combate 601 | SA-330L **Puma** | 5 | verde oliva, franja clara, bandera en la deriva |
| Ejército | Batallón de Aviación de Combate 601 | **Bell UH-1H** | 9 | verde oliva, franja amarilla en el botalón |
| Ejército | Batallón de Aviación de Combate 601 | **Agusta** A-109A | 3 | verde y arena |
| Prefectura Naval | — | SA-330L **Puma** | 1 | blanco, azul y amarillo |

**Total: 24.**

Lo que la referencia NO dice (a verificar con fuentes argentinas, ver `PREGUNTAS_HISTORICAS.md`):
matrículas de cada uno, cuáles se perdieron y cómo, y los helicópteros embarcados de la **Armada**
(Alouette III, Sea King, Sea Lynx), que no figuran en este cuadro.

Misiones que ya los piden:
- **S-11 · Colgado del patín** (`misiones/MISIONES_SUELTAS.md`): un **UH-1H** del Ejército levanta al
  piloto del A-4Q eyectado y lo lleva colgado del patín, rasante, hasta la costa.

## Los aviones con base EN LAS ISLAS

Segunda referencia del autor (18/11/2026): `ref/aviones_en_las_islas_1982.png`. Son los aviones
desplegados en Malvinas, no el total de la guerra (los A-4, Dagger, Mirage y Super Étendard operaron
desde el continente).

| Fuerza | Modelo | Cant. | ¿En el juego? |
|---|---|---|---|
| Fuerza Aérea | IA-58 **Pucará** | 24 | sí (`pucara`; la ficha ya dice 24) |
| Armada (COAN) | Aermacchi **MB-339A** | 7 | sí (`mb339`; la ficha ya dice 7) |
| Armada (COAN) | Beechcraft **T-34C Turbo Mentor** | 4 | no |
| Prefectura Naval | Short **Skyvan** | 2 | no (pintura: gris verdoso, banda amarilla, matrícula PA-54) |

Revisado contra `src/data/planes.js`: los números de Pucará y MB-339 coinciden, no hubo que corregir nada.

## En el juego (18/11/2026)

Horneados en Blender (`tools/blender/modelos_aviones.py`) y elegibles en POR LA PATRIA y CICLO DE MUERTE
como los demas secundarios (`src/data/planes.js`): `chinook_faa`, `chinook_ej`, `uh1h`, `bell212`, `puma_ej`,
`puma_pna`, `a109`, `t34c`, `skyvan`. Vuelan con el vuelo de los aviones (el vuelo propio de helicoptero queda
para la S-11). Armados (cañon de la tecla, sin bombas) solo el **A-109A** y el **T-34C**; los demas, sin armas.

Pendiente de verificar con fuentes argentinas antes de ponerlo en las fichas: cuantos de cada uno se
perdieron y como, las matriculas (AE-5xx, H-9x, PA-xx) y si el T-34C y el A-109A volaron armados en las
islas como dice su ficha.
