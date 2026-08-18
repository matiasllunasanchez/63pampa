# PLAN — La TIERRA y la COSTA alcanzan al agua

> **Por qué existe este documento.** El ítem del agua (`SPEC_AGUA_OLAS`, nueve fases, terminado el
> 18/8/2026) mejoró **el mar**. Los otros dos terrenos del PASILLO —TIERRA y COSTA— recibieron
> muy poco de rebote, y este plan salda esa deuda con la misma disciplina: fases chicas de una sola
> preocupación, perillas en `data/tuning.js`, cero decisiones abiertas y un fixture que lo cuide.

## 0. Qué recibieron TIERRA y COSTA del ítem del agua *(la auditoría, 18/8/2026)*

**Lo que sí les llegó, gratis:**

| mejora | por qué les llegó |
|---|---|
| **NIEBLA DE GUERRA** (`render/marco.js`) | es del CARRIL, no del terreno: enmarca igual sobre turba que sobre mar |
| **la mitad de agua de la COSTA** | `drawSeaDots` corre del lado del mar, así que la costa se llevó espuma por clima, viento que peina la superficie, camino del sol y los cuatro estilos de agua nuevos |

**Lo que NO les llegó — y es casi todo:**

1. **La turba no tiene clima.** `LAND` y `CLAND` son **una sola paleta fija cada una**. Bajo
   tormenta, de noche o con sol pleno el suelo es exactamente el mismo verde. Es *literalmente* el
   bug que F5 arregló para el agua (`WATER_AUTO`), sin arreglar de este lado.
2. **El viento no toca el pasto.** `SEA_WIND_AMP` peina el mar; los matojos de `drawLand` están
   clavados. Con VIENTO=SÍ, el mar se mueve y la turba no.
3. **La tierra es una mesa de billar.** El suelo es `y = 0` exacto en todo el mapa. El mar ya tiene
   campo de altura (`core/sea.js`) **y olas que son obstáculos**; la tierra no tiene relieve
   ninguno, así que volar rasante sobre turba es más fácil que sobre agua y no debería serlo.
4. **La costa no rompe.** Hay una franja de espuma (`PORT_FOAM`) y una orilla que serpentea
   (`shoreAt`), pero no hay **resaca**: nada sube por la arena y se retira. Y la ROMPIENTE nueva
   (F4) sólo nace en mar abierto — justo el tipo de ola que la costa pide.
5. **El suelo no tiene accidentes.** Matojos + alguna roca suelta, repartidos parejo. No existen
   los **pedreros** (los ríos de piedra de Malvinas), ni turbales, ni alambrados: nada que sirva de
   referencia visual ni de línea para volar.
6. **La lluvia no moja nada.** `cfg.rain` es ambiente puro sobre el terreno: no oscurece el suelo,
   no deja charcos, no cambia una sola cosa abajo.

## 1. Las reglas *(las mismas del ítem del agua, y por las mismas razones)*

1. **Editás módulos, NUNCA `src/game.bundle.js`**, y `npm run build:game` antes de probar.
2. **Nada de `Math.random()` por cuadro para patrones**: determinista por celda (`hash2`), o
   titila. Vale para matojos, piedra, charcos y espuma.
3. Los sistemas **devuelven señales** (`{ death }`), nunca llaman a `die()`.
4. `npm run feel` tiene que dar **los mismos números**: `core/physics.js` no se toca. El relieve de
   T3 entra por `groundY` en `systems/flight.js`, que es dónde vive el suelo, no la física.
5. **Costo por punto acotado**: el raster de suelo corre todo el vuelo. Cero allocations por punto,
   ventana por `z`, tablas armadas una vez por cuadro.
6. Una fase por vez: `npm run tierra` (nuevo) + `npm run check` completos, verdes o no se avanza.
7. Toda divergencia se anota en §4.

## 2. Las fases

### T1 · La turba tiene clima *(el `WATER_AUTO` que falta de este lado)*

`LAND_STYLES` y `CLAND_STYLES` en `data/palette.js` con una variante por clima, y `LAND_AUTO`
mapeando cielo→suelo igual que `WATER_AUTO`. `applyTheme` resuelve `theme.land` / `theme.cland`;
`render/world.js` deja de importar `LAND`/`CLAND` directo y lee el tema.

- `storm` — turba **empapada**: más oscura, más fría, casi sin amarillo
- `night` / `moon` — azulada y sin saturación (de noche el ojo no ve color)
- `sun` / `clear` — la turba **quemada** de verano: más amarilla y más clara
- `dawn` — el oro rasante del amanecer sobre las lomas

**Cierre:** cuatro capturas distinguibles de un vistazo; el atardecer (el cielo por defecto) queda
**idéntico** a hoy — la misma regla que salvó al mar de quedar color barro (SPEC_AGUA_OLAS §24).

### T2 · El viento peina el pasto

Los matojos se **inclinan** con el viento y la inclinación viaja en ondas por el campo (misma idea
que el término direccional de `seaH`: fase determinista `sin(wx*k1 + wz*k2 - t*v)`). En `storm` se
acuestan y se suman **rachas de polvo** (o de espuma tierra adentro en la costa).

**Cierre:** con VIENTO=NO el campo queda quieto y **idéntico** a hoy; con tormenta se ve la onda
cruzar. `feel` intacto: esto es render puro.

### T3 · La turba deja de ser una mesa *(la fase de JUEGO — el equivalente de la ola)*

`core/tierra.js` (PURO, hermano de `core/sea.js`): `tierraH(wx, wz)` = relieve suave de lomas.

1. El raster de suelo y los matojos se **levantan** con el campo.
2. `groundY` en `systems/flight.js` deja de ser `0` y pasa a ser `tierraH` bajo el avión: volar
   rasante sobre turba pasa a ser **seguir el terreno**, que es exactamente la habilidad que el mar
   ya cobra con el roce y las olas.
3. La misma función la evalúan render y vuelo — **lo que ves es lo que te mata**, igual que el mar.

**Cierre:** el fixture prueba que a ras se puede volar siguiendo la loma y que meterse contra una
loma mata; `feel` intacto (la física no se toca, sólo dónde está el piso).

### T4 · La COSTA rompe de verdad

1. **Resaca**: la franja de espuma deja de ser una banda fija — sube por la arena y se retira, con
   fase por posición a lo largo de la orilla (no toda la playa rompe a la vez).
2. La **ROMPIENTE** (F4 del agua) puede nacer **paralela a la orilla** en el mapa COSTA: la ola que
   se esquiva de costado, puesta donde el mar de verdad rompe.
3. **Kelp**: manchas oscuras de alga en el bajo, deterministas — la costa malvinense es kelp puro y
   además le da textura al agua somera, que hoy es lisa.

**Cierre:** captura de la orilla en dos instantes distintos (la espuma tiene que haberse movido).

### T5 · Lo que hay en el suelo: pedreros, turbales y alambrados

1. **PEDREROS** (los *stone runs* de Malvinas): ríos de piedra gris que bajan por las laderas. Son
   reales, son espectaculares y **sirven de línea**: volar uno es una referencia. Deterministas por
   celda, con volumen (cara al sol y sombra) como las rocas de hoy.
2. **Turbales**: cortes oscuros de turba apilada, en tableros rectangulares.
3. **Alambrados**: postes cada tantos metros con hilo — la escala del paisaje sólo se lee si hay
   algo de tamaño conocido.

**Cierre:** captura del mismo tramo antes/después; se tiene que leer "esto es Malvinas" y no "un
campo verde".

### T6 · La lluvia moja el suelo

Con `cfg.rain ≥ 1` el suelo se oscurece y aparecen **charcos** (deterministas, en los bajos del
relieve de T3) que **reflejan el cielo**. Con `rain = 3` corren regueros. Es el cierre del arco:
el clima deja de terminar en el aire.

**Cierre:** tres capturas (seco / lluvia / tormenta) del mismo tramo.

## 3. Orden y dependencias

T1 → T2 → T3 → T4 → T5 → T6. T4 puede adelantarse (sólo depende del agua, que está hecha); T6 usa
el relieve de T3 para saber dónde se junta el agua.

## 4. Divergencias *(completar durante la implementación)*

### 1. Las variantes de pasto se DERIVAN, no se escriben *(T1)*

`TUFTS` / `TUFT_TIP` eran dos listas de seis colores a mano. Escribir seis listas más (una por
clima) sería garantizar que un día alguna quede desfasada, así que ahora las seis variantes salen
del `tuft` del estilo multiplicando el brillo (`TUFT_F`), y la punta va ×1.3.

**Lo que se pierde y se acepta:** las listas viejas tenían variación de TONO además de brillo
(`#4f6034` es más verde que `#94925a`), y las derivadas sólo varían el brillo. A la escala a la que
se ve el campo no se nota — se comparó la captura del atardecer contra la de antes. Si algún día se
quiere el grano de tono de vuelta, es una tabla de multiplicadores por canal en vez de uno solo.

### 2. El suelo NO lleva perilla en OPCIONES *(T1)*

El agua tiene su fila (AUTO + seis estilos) porque el mar es el fondo de casi todo el juego y hay
gusto de por medio. La turba no: nadie quiere "turba violeta". Que el suelo acompañe al cielo no es
una preferencia sino que el mapa sea coherente, así que `theme.land` va **siempre en auto** — y de
paso respeta el §6.6 del spec del agua (no agregar opciones de más).

### 3. `theme` ganó dos campos y `render/world.js` dejó de importar la paleta directo

Era el corazón del problema: `LAND` y `CLAND` entraban por `import` en el render, o sea que eran
**constantes**. Ahora son `theme.land` / `theme.cland` — paleta ACTIVA, como el agua y el cielo — y
las tablas derivadas (gradiente y pasto) se recalculan sólo cuando cambia la referencia del objeto,
no por fila ni por cuadro (`refreshGround()`).
