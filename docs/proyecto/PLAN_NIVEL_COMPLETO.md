# PLAN DEL NIVEL COMPLETO — PASILLO → BARRA → PULSO → cinemática *(plan de gameplay, NO es el refactor)*

> **Estado: plan listo para implementar, fases chicas (ninguna pasa de una sesión).** Es la
> DIRECCIÓN del 18/8 (`ESTADO.md`) vuelta plan de GAMEPLAY (el refactor de código es otro doc: `PLAN_REFACTOR.md`): ARENA y PASADA se ocultan (y después se
> retiran), **EL PULSO es el clímax**, y dentro del pasillo entra **LA BARRA** — la mecánica
> de mantener la banda, que es la cinta de PERSECUCIÓN activada por tramo. PERSECUCIÓN deja
> de ser un modo aparte y pasa a ser "misiones con barra".
>
> **Lo que lo hace barato** (relevado el 18/8): los TRAMOS ya son data por misión
> (`SPEC_TRAMOS`); `climax` ya es campo de misión con `'pulso'` soportado y una misión
> usándolo; `systems/persec.js` ya tiene líder, banda, cinta y la "regla del amigo";
> `systems/cine.js` + `data/cines.js` ya existen; el modo PRUEBAS ya está. **Casi todo es
> enchufar por data.** Lo único nuevo de verdad es E3.

## 0. Reglas

- Una fase por sesión, `npm run check` verde + `npm run feel` idéntico al cerrar cada una.
- **Nada se borra hasta E6**: primero el nivel completo jugable, después el hacha.
- Lo nuevo nace en el patrón nuevo (data por dominio, sondas registradas) — regla barata
  del refactor en standby.
- Divergencias al §4.

## 1. El nivel, de punta a punta

```
DESPEGUE → PASILLO (tramos de siempre) → [TRAMO BARRA: el líder entra, "cerrá, Tero" — mantener la banda
mientras el pasillo sigue] → el líder se despide por radio → último tramo → aproximación 2D del buque
→ EL PULSO (fatality de teclas) → acierto: CINEMÁTICA de la misión → RESULTADOS → epílogo/cuaderno
```

## 2. Las fases

| fase | entrega | archivos | criterio de cierre | sesión · modelo |
|---|---|---|---|---|
| **E0 · Ocultar** | ARENA y PASADA salen del menú por perilla (`data/modes`-equivalente o flag en `quickRows`): MINUTOS SAGRADOS y PASADAS MORTALES no se ven; `?pasada=`/`?arena` siguen andando por sonda; fixtures intactos | `game.js` (quickRows), strings | el menú rápido muestra CICLO / POR LA PATRIA / PERSECUCIÓN; `check` verde | ½ · medio |
| **E1 · PULSO en todas** | `climax: 'pulso'` en TODAS las misiones con buque (las dos `'arena'` incluidas); `npm run misiones` recorre la campaña y verifica que cada clímax es pulso y termina en `results` | `data/missions.js` | ninguna misión entra a ARENA/PASADA; `misiones` verde | ½ · medio |
| **E2 · La cinemática de recompensa** | Campo `cine: '<id>'` por misión; al ACERTAR el PULSO → `cine.js` reproduce esa cinemática y recién después `results`. Sin campo → va directo a `results` (fallback, nunca bloquea). Fallo del PULSO → como hoy | `systems/pulso.js` (señal `'cine'`), `game.js` (enchufe), `data/missions.js`, `data/cines.js` | `?pulso=<n>` acertado muestra la cinemática de esa misión; sin `cine` no rompe | ½–1 · medio |
| **E3 · LA BARRA como tramo** *(lo único nuevo)* | El tramo gana `barra: { lider, banda: [dMin, dMax], gracia }`. Al entrar al tramo: el líder ENTRA por radio ("Plata 3, formá conmigo") y `persec.js` se activa; al salir del tramo: se despide ("Te dejo, Tero. Suerte") y se va por un costado; entre medio, el pasillo sigue sembrando normal (la siembra respeta la línea del líder — la regla del amigo ya lo garantiza). Perder al líder en un tramo de barra = **costo, no derrota** (vida de escuadrón o puntos — perilla `BARRA_PERDER`), porque el nivel es el pasillo, no la barra | `systems/persec.js` (activar/desactivar por señal, no por modo), `systems/spawn.js` (leer `barra` del tramo), `data/tuning.js`, strings, `render/persec.js` | sonda `__trset([...])` con un tramo de barra: el líder entra, la cinta aparece, se despide al salir del tramo; `feel` idéntico | 1 · **alto** |
| **E4 · Las misiones con barra** | Qué misiones llevan barra, cuánto dura y con quién: m1 (tutorial: Puma te lleva "pegado al agua"), m10 LOS PRIMOS (los Mirage peruanos — resuelve el pendiente de PLAN_CAMPANA §6), y 1–2 más del medio. PERSECUCIÓN como modo rápido se mantiene como "pasillo infinito con barra" o se oculta (decisión de Matías) | `data/missions.js` (tramos), strings de radio | jugar m1 y m10 con `?qa`: la barra entra y sale donde dice el dato | ½ · medio + playtest |
| **E5 · La vitrina** | UNA misión completa de punta a punta (la demo): tramos + barra + PULSO + cinemática + epílogo, jugada y afinada. Fixture `npm run nivel` que recorre ese nivel entero por sonda y verifica el orden de estados (`DEBUG_STATE`: play → pulso → cines → results → epilogue) | fixture nuevo, tuning | el nivel entero se juega sin consola y emociona (criterio del director) | 1 · medio |
| **E6 · La cuarentena** | ARENA y PASADA NO se borran (decisión 18/8): quedan fuera de menú y flujos, compilando, con fixtures, marcadas PENDIENTE — es la RF-A del `PLAN_REFACTOR.md` §4b, que se puede hacer hoy | ver PLAN_REFACTOR RF-A | `check` + `pasada`/arena verdes | ½ · medio |
| **E7 · PRUEBAS al día** | El catálogo del modo PRUEBAS refleja el nivel completo: momentos "tramo de barra", "el PULSO de m<X>", "cinemática <id>"; se quitan los de ARENA/PASADA | `data/pruebas.js` | cada momento del nivel completo es elegible | ½ · medio |

**Orden:** E0 → E1 → E2 → E3 → E4 → E5 → E6 → E7. E0+E1+E2 caben en UNA sesión si se
quiere; E6 ya no borra nada, así que puede ir junto con E0.

**Total: ~5–7 sesiones de IA.** Lo que sigue vigente y NO está acá porque ya tiene plan:
el pulido del PASILLO (PLAN_VISUAL_FASES T1–T6 y T9), el agua y las olas (hecho), LA COLA
(hecho), la destrucción (hecho), el modo historia (F2+ del SPEC), las cinemáticas
(PLAN_DIRECTOR_CINEMATICAS), el refactor (standby).

## 3. Mini-spec de LA BARRA *(para que E3 arranque sin preguntas)*

- **Qué se mantiene en banda:** la distancia al LÍDER (la cinta de PERSECUCIÓN tal cual).
  Si más adelante la banda es otra cosa (altura, convoy), cambia solo el dato del tramo.
- **Dato del tramo:** `{ hasta: 0.55, barra: { lider: 'PUMA', banda: [60, 140], gracia: 4,
  entra: 'm1_barra_in', sale: 'm1_barra_out' } }`. Sin `barra` → el tramo es de siempre.
- **Entrada/salida del líder:** aparece desde un costado, se coloca adelante en 2–3 s con
  su línea de radio; al cerrar el tramo se abre hacia el costado y se despide. Nunca
  muere (regla del amigo, ya en `persec.js`).
- **Perder al líder** (fuera de banda más de `gracia`): `BARRA_PERDER = 'vida'` (cuesta una
  vida de escuadrón — el líder "te cubre" y se va) · alternativa `'puntos'`. Nunca derrota.
- **Mientras hay barra, el pasillo sigue**: obstáculos, LA COLA, olas, todo — la barra
  suma tensión, no reemplaza el pasillo. El spawner respeta la línea del líder.
- **HUD:** la cinta de `render/persec.js`, sin cambios, visible solo durante el tramo.
- **Sondas:** `__trset` ya inyecta tramos; `__psdbg` ya lee la banda. No hacen falta nuevas.

## 4. Divergencias *(completar durante la implementación)*

- *(vacío)*
