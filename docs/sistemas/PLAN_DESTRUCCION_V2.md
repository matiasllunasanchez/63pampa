# PLAN — LA DESTRUCCIÓN v2: variantes de muerte por peso, momento y azar

> **Estado: plan por etapas, sin implementar.** Continúa [PLAN_DESTRUCCION.md](PLAN_DESTRUCCION.md)
> (D0–D5, TERMINADO): ahí cada TIPO ganó su receta de muerte. Acá **cada muerte gana
> variantes** — la misma cosa se rompe distinto según qué la mató, con cuánta fuerza, desde
> dónde, cuánto pesa y un dado. Pedido de Matías (16/8): *"que los Harrier tengan 3 o 4
> formas de dañarse de forma aleatoria"*, y que peso y momento se noten.
>
> Leer antes: `docs/ARQUITECTURA.md` (manda) · PLAN_DESTRUCCION §6 (cómo quedó construido
> `despiece()`, `stepChunk`, las recetas de `data/despiece.js`) · trampas del repo en
> `SPEC_AGUA_OLAS.md` §1. **`npm run feel` idéntico en todas las etapas: esto es presentación.**

## 1. La regla

**Una variante se distingue por la SILUETA del movimiento y por el TIEMPO, nunca solo por
el color.** Si dos variantes de la misma muerte no se distinguen en una captura en blanco y
negro, la segunda no existe. Y la sobriedad de siempre: escombros, fuego, humo, y la
eyección honesta de un piloto — nada de festival.

## 2. El ACTA de la muerte *(el contexto que decide la variante)*

`despiece(o, acta)` — hoy recibe el impulso; pasa a recibir un acta completa, toda derivable
de lo que ya existe en el momento del golpe:

| campo | valores | de dónde sale |
|---|---|---|
| `killer` | `canon` · `misil` · `bomba` · `cadena` · `choque` · `onda` | el llamador (`collision.js`, `pasada.js`, la cadena) |
| `impulso` | vector + magnitud | ya existe (D0) |
| `lado` | `proa/popa/izq/der/arriba` | posición relativa del impacto |
| `alt` | `aire` · `suelo` · `agua` | `o.y` y el terreno |
| `masa` | `liviano` · `medio` · `pesado` | **en la receta del tipo** (data) |
| `dado` | 0..1 determinista | `o.seed` (ya existe): fixtures reproducibles |

Cada tipo declara en `data/despiece.js` su lista de `variantes: [{ id, peso, cuando, receta }]`
— `cuando` filtra por acta (killer/alt/lado), `peso` pondera el dado entre las elegibles.
Fallback: la receta única de D2 (nada se rompe si un tipo no declara variantes).

## 3. Las variantes *(el catálogo a construir)*

### Aire — el Harrier y el jet *(el pedido central: 4 formas)*
| id | qué se ve | cuándo pesa más |
|---|---|---|
| `desintegracion` | estalla entero en el aire: destello + nube negra que se deshilacha, pedazos en abanico | misil, hit crítico, onda |
| `ala` | un ala se arranca sola (pedazo grande girando) y el resto entra en **tirabuzón** descendente con humo hasta el impacto | cañón |
| `moribundo` | motor en llamas: sigue volando recto y bajando, humo negro gordo, **explota lejos** al tocar el suelo/agua — el "se va muriendo" | cañón, impacto lateral |
| `partido` | se parte en dos por el fuselaje: proa y cola caen separadas, la cola plana, la proa girando | misil, choque |
| modificador `eyeccion` | antes de caer, el asiento sale y abre paracaídas (sprite chico) — honesto y humano; no en `desintegracion` | dado, más probable en `moribundo` |

### Tierra — el peso y el momento
| clase | liviano (carpa, tambor, puesto) | medio (AA, camión, radar) | pesado (depósito, edificio) |
|---|---|---|---|
| `canon` | se desarma en jirones en el lugar | chispazo y se desarma | ídem D2 (secundarias) |
| `misil` / `bomba` | **vuela entera por el aire** y cae lejos, girando | **vuelca o derrapa** en la dirección del impulso | no se mueve: revienta en el lugar / **se derrumba por pisos** (edificio) |
| `choque` | arrastrada hacia adelante con vos | volcada hacia adelante | vos te rompés, él apenas |
| `cadena` | prendida fuego, cae sola después | secundarias de munición (AA) | la grande: cráter + columna |

### Helo y globo
Helo (3): el rotor suelto de D2 · **cola seccionada → giro plano** (sin antipar) · bola en el
aire con caída vertical. Globo (3): reventón · desinflado en espiral · **incendio** (arde y
cae lento — el mejor de los tres).

### Los barcos del pasillo (lcu, fragata)

> **CAMBIO DE ALCANCE (Matías, 8/2026): el barco NO se parte en dos.** *"No es un misil que lo
> hunde como el Titanic; con que se llene de humo y agarres la explosión que hoy usamos para la
> bomba que cae verticalmente encima del barco, estamos bien."*

Entonces la muerte del barco es, y nada más que:

1. **El hongo que ya existe** — `render/boom.js` / `assets/world/explosions/bomb.png`, la misma
   explosión de la bomba vertical. **Se reusa, no se hace una nueva**: es la explosión más grande
   del juego y ya está medida (18 frames, `DUR` atada a la ventana de daño).
2. **Humo que PERSISTE** en el lugar — el `'humo'` de D2, con la columna larga.

Se cae, por lo tanto: el hundimiento por `lado` (proa/popa/quilla), la escora, el vuelco y el
partirse al medio. Todo eso era coreografía de hundimiento y el pedido es explícitamente que no la
haya. **La `santabárbara` queda sin su razón de ser** (era "la explosión enorme que lo parte"): si
se quiere conservar el evento raro, lo único que puede distinguirlo ya es la ESCALA y la duración
del hongo, no una silueta distinta — y eso choca con el §1, así que por defecto **se descarta** y
`SANTABARBARA_P` sale de las perillas. Si Matías la quiere de vuelta, hay que decidir primero qué
la hace distinguible.

### El derribo del jugador, por causa
Agua: cartwheel + corona de agua · tierra: derrape largo con chispas · AA/misil: aéreo
(`desintegracion` o `ala`) · choque: la mutua de D1. La pantalla de derribado espera lo mismo
(`DEATH_REVEAL` no cambia).

## 4. Etapas

| etapa | entrega | criterio de cierre |
|---|---|---|
| **V0 · El acta y el selector** ✅ | `despiece(o, acta)`, `masa` en las recetas, selector ponderado determinista por `o.seed`, y las sondas `__romper(tipo, variante)` + **`__romperTodas(tipo)`** (pone las N variantes en fila, una al lado de la otra, para compararlas de un vistazo) | cada tipo sin variantes sigue igual que D2; la sonda muestra en fila |
| **V1 · El aire** ✅ | Las 4 variantes + eyección para jet/Harrier, ponderadas por `killer` | `__romperTodas('jet')`: 4 muertes distinguibles en una captura |
| **V2 · Tierra: peso y momento** | Las clases de masa y la tabla de §3 para todo lo de tierra | liviano vuela, medio vuelca, pesado no se mueve — en 3 capturas |
| **V3 · Helo y globo** | 3 + 3 variantes | capturas |
| **V4 · Los barcos** | el hongo de la bomba vertical (reusado) + humo que persiste. **Sin partirse ni escorar** — ver §3 | una captura: el barco muerto se lee como un incendio, no como un hundimiento coreografiado |
| **V5 · El jugador** | el derribo por causa | las 4 causas se ven distintas; `DEATH_REVEAL` intacto |
| **V6 · Las hojas nuevas + gate** | integrar los PNG de §5 que hayan llegado (cada receta con fallback por código mientras no esté la hoja); perf en m9 con variantes largas (`moribundo` cap 2 vivos); `npm run romper` ampliado a la matriz tipo×variante | 120 fps sostenidos como en D5; fixture verde |

**Perillas nuevas** (`data/despiece.js`): `MORIBUNDO_MAX 2` · `EYECT_P 0.35` · `VAR_SEED`
(para forzar una variante en pruebas). ~~`SANTABARBARA_P`~~ se cae con el cambio de alcance de §3.

## 5. Las hojas PNG que sirven *(lo que pediría — por prioridad)*

Hoy hay: el hongo (`boom.png`), la bola frontal (`explosions_front.png`, 32 frames) y el
airboom por código. Lo que falta para que las variantes se vean caras:

| # | hoja | para qué variante | frames | celda | prioridad |
|---|---|---|---|---|---|
| 1 | **Explosión aérea mediana** — destello corto + nube NEGRA que se deshilacha al viento | `desintegracion`, `partido`, bola del helo | 16 | 96×96 | **alta** |
| 2 | **Fuego quieto en loop** — llamas + humo que sube, sin desplazamiento | restos ardiendo, globo `incendio`, cubierta del barco | 8 (loop) | 48×64 | **alta** |
| 3 | **Corona de agua grande** — la caída de un avión/pedazo al mar | `moribundo` al agua, derribo del jugador al mar, barcos | 12 | 96×64 | **alta** |
| 4 | **Humo negro gordo** (puffs) — para estelas de lo que se va muriendo | `moribundo`, `ala` (tirabuzón) | 6 (loop) | 24×24 | media |
| 5 | **Santabárbara** — explosión enorme con destello blanco y escombros en silueta | barcos, depósito grande | 24 | 128×128 | media |
| 6 | **Derrumbe / polvo** — nube marrón que se expande a ras | edificio `pesado`, impactos en tierra | 12 | 96×48 | media |
| 7 | **Paracaídas** — abriéndose | `eyeccion` | 3 | 24×32 | baja (el código lo hace) |
| 8 | **Chispazo metálico** corto | impactos de cañón en `medio` | 6 | 32×32 | baja (el código lo hace) |

**Formato, para que entren sin retoque** (es lo que ya usa el repo): grilla regular de
celdas iguales, fondo transparente, pixel art a la escala del juego (480×270), y **el
contenido adentro de la celda con 2 px de margen** — la hoja frontal actual se derrama a
la celda vecina y hubo que medir las cajas una por una sobre el alfa. Las hojas se integran
en V6; mientras no estén, cada variante tiene fallback por código (la regla de siempre).

## 6. Qué NO hacer

1. **Variantes que solo cambian color** — la regla del §1.
2. **No alargar la muerte sin tope**: `moribundo` con cap de 2 vivos y vida máxima.
3. **No tocar letalidad, puntaje ni `DEATH_REVEAL`**.
4. **No azar por frame**: el dado sale de `o.seed` una vez — reproducible en fixture.
5. Nada que se vea como festival; la eyección es un piloto saliendo, no un gag.

## 7. Divergencias *(completar — con el baseline de `npm run feel`)*

### Baseline de `npm run feel` *(tomado antes de V0, 22/8/2026)*

**33 asserts, `FEEL: OK`, cero `✗`** — el mismo que el de PLAN_DESTRUCCION. Verificado **idéntico**
al cerrar V0 y V1, como corresponde: este plan es 100% presentación.

### V0 — el acta y el selector

1. **`o.seed` NO existe** *(el plan §2 lo da por hecho)*. Lo tiene **solo el acantilado** — que
   además es el único destructible que no se despieza (divergencia 8 del plan viejo). Todo el resto
   trae `ph`, la fase que se le sortea al nacer, que es igual de estable. **Decisión:** `dadoDe(o)`
   usa `seed` si está y si no un hash de senos sobre `ph` + posición — el mismo patrón determinista
   que el repo ya usa para los destellos del mar. Agregarle `seed` a los ~20 sitios de `spawn.js`
   habría sido un cambio ancho para conseguir exactamente la misma propiedad.

2. **La firma de `despiece()` cambió, no se amplió.** Pasa de `despiece(o, imp)` a
   `despiece(o, acta)`, con el impulso adentro (`acta.imp`). Aceptar las dos formas era la
   alternativa obvia y es justamente cómo se llega a que una de las dos quede vieja: hay **dos**
   llamadores en todo el repo (`morir()` y el derribo del jugador), así que el costo de migrarlos
   es menor que el de mantener dos verdades.

3. **La receta efectiva se resuelve en UN lugar** (`recetaEfectiva`). `morir()` decide la bola, el
   chispazo y las secundarias, y `despiece()` el escombro: si cada uno mezclara la variante por su
   cuenta, una variante podía cambiar el escombro y no la bola de fuego — media muerte.

4. **El `killer` del derribo del jugador va fijo en `'choque'`.** `crashFX()` no recibe la causa
   (la variable `deathCause` recién se escribe después), y la receta `plane` todavía no declara
   variantes, así que el campo está inerte. **Es V5 el que tiene que hacerle llegar la causa real.**

### V1 — el aire

5. **El Harrier de LA COLA no muere por `morir()`.** El plan §3 dice *"el Harrier y el jet"*, pero
   `systems/caza.js` llama a `explodeAt()` directo (tres sitios), así que **no pasa por el selector
   y no tiene variantes**. Migrarlo es correcto y es el paso natural, pero cambia cómo se ve el
   duelo entero de un sistema que otra sesión está tocando ahora mismo — se deja anotado en vez de
   hacerlo de callado. Las cuatro variantes están sobre el tipo `jet`, que es lo que el criterio de
   cierre mide (`__romperTodas('jet')`).

6. **Vida POR PEDAZO (`o.vida`), con techo `VIDA_LARGA = 7 s`.** `CHUNK_LIFE` (4 s) barría al
   `moribundo` justo antes de que llegara a reventar lejos, que es toda su gracia. El techo propio
   es lo que el §6.2 pide: la muerte se alarga, pero no sin tope.

7. **Pasado el cap, el `moribundo` cae en `ala` — no se queda sin variante.** Cancelarla dejaba una
   muerte genérica en medio de otras cuatro que no lo son. `ala` es la otra muerte del cañón, así
   que la sustitución no miente sobre el arma.

8. **La eyección usa un SEGUNDO dado, derivado del primero.** Con el mismo dado que eligió la
   variante, las dos decisiones quedaban atadas: siempre se eyectaría en las mismas variantes. Se
   deriva (`dado * 7.3 % 1`), que lo mantiene determinista y reproducible en el fixture.

9. **`ala` y `partido` dejan las dos DOS pedazos grandes**, así que "cuántos grandes" no alcanza
   para separarlas. La firma que el fixture exige es `grandes-espiral-moribundo`, y ahí salen
   `2-1-0` y `2-0-0`: lo que las distingue es el **tirabuzón humeante** del resto en `ala`. Medido:
   `desintegracion=0-0-0 · ala=2-1-0 · moribundo=1-0-1 · partido=2-0-0`.

10. **La sección 6 del fixture entraba por `?patria&qa`, que cae en el MENÚ DE MODOS.** Los números
    salían bien igual —la sonda mide lo que se creó, no lo que se dibuja— y por eso no lo delataba
    nada: se vio al sacar la captura. Ahora entra por `?pasada=1&pasillo`, la misma puerta que el
    resto del fixture. Medir en una pantalla que no es la del juego es exactamente cómo se cuela
    una afirmación que no vale.
