# PLAN — Campaña 1 v0.0.1: las 12 misiones del guion en el juego

> Objetivo: volcar las 12 misiones de GUION_2.md (2.3) en `data/missions.js` con lo que el
> juego YA tiene, como base jugable de LA MESA DE NORMA. Mañana el guion se relee y se
> ajustan textos: los IDs de misión y de pantalla quedan estables desde hoy.

## 1. Mapa guion → misión jugable

Regla acordada: misión CON boss de buque → goal `ship` (climax ARENA/MOMENTUM).
Misión SIN buque o con boss de terreno (que no existe) → goal `distance` (llegar cumple).

| # | Título | Fecha | Objetivo | Clase | Notas |
|---|---|---|---|---|---|
| M1 | SAL EN LAS ALAS | fines de abril | distancia 2200 | — | tutorial de rasante, todo suave |
| M2 | BAUTISMO DE FUEGO | 1 de mayo | distancia 2600 | — | boss radar (terreno) no existe → distancia |
| M3 | EL DIA QUE SANGRO EL MAR | 4 de mayo | HMS SHEFFIELD | t42 | |
| M4 | EL CALLEJON DE LAS BOMBAS | 21 de mayo | HMS ARDENT | t21 | sube bombs/obstacles |
| M5 | LA BOMBA QUE NO DESPERTO | 23 de mayo | HMS ANTELOPE | t21 | |
| M6 | 25 DE MAYO | 25 de mayo | HMS COVENTRY | t42 | muere el VASCO (epílogo) |
| M7 | EL BATIR DE ALAS | 25 de mayo · 2ª salida | ATLANTIC CONVEYOR | log | el sobrevuelo (texto) |
| M8 | EL PIBE | 27 de mayo | distancia 3200 | — | centro logístico (terreno) → distancia; muere el PICHON |
| M9 | LO QUE NO SE DICE | 8 de junio | RFA SIR GALAHAD | log | el respiro: vuelven todos |
| M10 | EL ANGEL DE CORRIENTES | 8 de junio · 2ª salida | RFA SIR TRISTRAM | log | NUEVO buque; muere CORREA (tierra) |
| M11 | LA ULTIMA MESA | 11 de junio | HMS BROADSWORD | t21 | NUEVO buque; el asado |
| M12 | EL TERO | 12 de junio · madrugada | HMS GLAMORGAN | t42 | NUEVO buque; nocturna, la imposible |

Buques nuevos (solo datos, reusan layouts por clase): SIR TRISTRAM → `log`,
BROADSWORD → `t21`, GLAMORGAN → `t42`.

## 2. Variabilidad por misión (perillas existentes, nada nuevo)

Rampa con `cfg` por misión — en M1 NO está habilitado todo:

| # | sky | wind | obstacles | bombs | rain | fog | terrain | escuadrón |
|---|---|---|---|---|---|---|---|---|
| M1 | dawn | no | 0.5 | 0 | 0 | 0 | mar | 5 |
| M2 | dusk | sí | 1 | 0.5 | 0 | 0 | mar | 5 |
| M3 | dusk | sí | 1 | 0.5 | 0 | 0 | mar | 5 |
| M4 | cloudy | sí | 1.7 | 1 | 0 | 0 | mar | 5 |
| M5 | sun | sí | 1.7 | 1 | 0 | 1 corto | mar | 5 |
| M6 | clear | sí | 1.7 | 1 | 0 | 0 | mar | 5 |
| M7 | dusk | sí | 1.7 | 1 | 1 | 0 | mar | 4 |
| M8 | storm | sí | 1.7 | 2 | 2 | 1 | mar | 4 |
| M9 | cloudy | sí | 1.7 | 1 | 0 | 0 | mar | 3 |
| M10 | dusk | sí | 1.7 | 2 | 1 | 0 | mar | 3 |
| M11 | moon | sí | 1.7 | 2 | 0 | 1 | tierra | 3 |
| M12 | night | sí | 1.7 | 2 | 0 | 1 largo | mar | 3 |

Escuadrón = ROSTER por misión (los Fieles vivos según guion): M1–M6 los cinco
(muere el Vasco en el EPILOGO de M6, así que vuela la M6 entera); M7–M8 sin Vasco;
M9+ sin Pichón. `missions.js` lleva `roster` y `cfg.squad = roster.length`.

## 3. Mejoras del Pichón (roguelike-lite)

Entre misión y misión (campaña solamente) aparece **EL BANCO DEL PICHON** (M1–M7) /
**LA LIBRETA DEL PICHON** (M8+, con el ritual "…A ver, pibe. Mostrame."): el jugador
elige UNA mejora entre DOS ofrecidas, predefinidas. El pool sigue el orden causal del
guion (§2c) y las no elegidas quedan para la próxima. 11 huecos, 12 piruetas: una queda
sin aprender por partida.

Pool (data/upgrades.js, en orden de oferta): TERRAIN MASKING, SPLIT-S, BREAK TURN,
LOW YO-YO, S-TURN, POP-UP, HIGH YO-YO, JINK, TIRABUZON, ASCENSO, SOBRE EL RADAR,
TONEL BARRIL. El TONEL clásico viene puesto siempre (es lo primero que muestra el Pichón).

- En campaña los combos NO aprendidos no disparan (gate en el dispatcher de game.js).
- Ciclo/Patria/Arena no cambian: ahí rige `cfg.moves` como siempre.
- El save guarda `ups` (ids aprendidos) y se restaura al cargar partida.
- El escalón MACH extra (M5 del guion) y munición mejorada quedan PENDIENTES: hoy no hay
  sistema de niveles de mach enchufable por mejora.

## 4. Guion en pantallas (strings.js)

Por misión: `story` (contexto + diálogos del briefing + tarjeta de nivel) y `epi`
(epílogo de aire + carta de Mateo + carta del padre en M6/M8/M10/M11 + placa histórica).
El prólogo (P.1–P.4) va adelante del story de M1.

- Diálogo como líneas `PERSONAJE: texto` dentro de `paras` (v0.0.1; el sistema de IDs de
  SISTEMA_DIALOGO.md queda para la pasada de voces).
- Cada pantalla lleva `img: 'P1_1'` (cuadro del storyboard): si existe
  `assets/story/<img>.png` se dibuja de fondo, si no, la tarjeta negra de siempre.
  Las imágenes se generan después — hoy solo el texto asume ese fondo.
- `style: 'tierra'` (cuaderno de Mateo) y `style: 'carta'` (block del padre) tiñen el
  texto para distinguir los registros.
- Traducción EN: pendiente — `initStory` ya cae a `STRINGS.es` si falta la clave.
- El FINAL con 3 decisiones de M12 queda PENDIENTE: v0.0.1 lo narra en pantallas de
  epílogo y cierra en victoria.

## 5. Flujo (game.js y amigos)

- `randomMission()` (CICLO) y el pool del ARENA eligen SOLO misiones con buque.
- `squad.setRoster(m.roster)` en campaña (antes: FIELES fijo).
- Estado nuevo `upgrade` tras el epílogo de campaña, antes de cargar la siguiente misión.
- Distancia como objetivo ya existe (`GOALS.distance` → señal 'objective').

## 6. Pendientes que este plan NO cubre (anotados a propósito)

- Bosses de terreno (radar M2, centro logístico M8) — hoy distancia.
- Decisión final de M12 (A/B/C) y epílogo cinemático de Norma.
- Más mejoras del Pichón (mach, munición), más enemigos, rework de MINUTOS SAGRADOS.
- Voces e imágenes de los cuadros (los `img` ya dejan el enchufe).
- Traducciones EN de todo el guion nuevo.
