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
Hundimiento variable por `lado`: **de proa**, **de popa** o **de quilla** (escora y vuelco);
fuego en cubierta que persiste; y la **santabárbara** rara (dado bajo): explosión enorme que
lo parte — el evento que se comenta.

### El derribo del jugador, por causa
Agua: cartwheel + corona de agua · tierra: derrape largo con chispas · AA/misil: aéreo
(`desintegracion` o `ala`) · choque: la mutua de D1. La pantalla de derribado espera lo mismo
(`DEATH_REVEAL` no cambia).

## 4. Etapas

| etapa | entrega | criterio de cierre |
|---|---|---|
| **V0 · El acta y el selector** | `despiece(o, acta)`, `masa` en las recetas, selector ponderado determinista por `o.seed`, y las sondas `__romper(tipo, variante)` + **`__romperTodas(tipo)`** (pone las N variantes en fila, una al lado de la otra, para compararlas de un vistazo) | cada tipo sin variantes sigue igual que D2; la sonda muestra en fila |
| **V1 · El aire** | Las 4 variantes + eyección para jet/Harrier, ponderadas por `killer` | `__romperTodas('jet')`: 4 muertes distinguibles en una captura |
| **V2 · Tierra: peso y momento** | Las clases de masa y la tabla de §3 para todo lo de tierra | liviano vuela, medio vuelca, pesado no se mueve — en 3 capturas |
| **V3 · Helo y globo** | 3 + 3 variantes | capturas |
| **V4 · Los barcos** | hundimiento por lado + santabárbara rara | capturas; la santabárbara sale ~1 de 8 |
| **V5 · El jugador** | el derribo por causa | las 4 causas se ven distintas; `DEATH_REVEAL` intacto |
| **V6 · Las hojas nuevas + gate** | integrar los PNG de §5 que hayan llegado (cada receta con fallback por código mientras no esté la hoja); perf en m9 con variantes largas (`moribundo` cap 2 vivos); `npm run romper` ampliado a la matriz tipo×variante | 120 fps sostenidos como en D5; fixture verde |

**Perillas nuevas** (`data/despiece.js`): `MORIBUNDO_MAX 2` · `EYECT_P 0.35` ·
`SANTABARBARA_P 0.12` · `VAR_SEED` (para forzar una variante en pruebas).

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

- *(vacío)*
