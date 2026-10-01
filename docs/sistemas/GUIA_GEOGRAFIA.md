# GUÍA — Cómo escribir la geografía de una misión

> **Para qué.** Para armar el mapa de una misión (qué hay abajo y a los costados, tramo por tramo)
> sin haber leído [PLAN_GEOGRAFIA.md](PLAN_GEOGRAFIA.md). El plan cuenta por qué es así; esto
> cuenta cómo se usa.
>
> **Hermanos.** [FORMA_DE_CADA_MISION.md](FORMA_DE_CADA_MISION.md) (qué pasa en cada misión:
> ida, objetivo y vuelta) · [PLAN_MISION_CINCO_FASES.md](PLAN_MISION_CINCO_FASES.md) (las `fases:`,
> que son la dramaturgia: radio, techo de radar, qué nace) · [PLAN_PASILLO_ZIGZAG.md](PLAN_PASILLO_ZIGZAG.md)
> (el callejón de m5).
>
> **Estado (29/9/2026):** todo lo de esta guía funciona y está probado (`npm run unit`,
> `npm run geografia`), incluido el objetivo ESTRUCTURA (§6) — la misión de ejemplo es **t18 ·
> IDA Y VUELTA SMALL 2**.

---

## 1 · Qué es

Un campo más de la misión, `geografia:`, que parte el camino en **tramos**: cada tramo dice qué
suelo hay (mar, costa, tierra, isla) y, si querés, qué accidente (niebla, acantilados, una barrera).
El pasillo sigue siendo pasillo —mismo ancho, misma cámara, nada de vuelo libre—; lo que cambia es
lo que hay abajo y a los costados.

**Sin `geografia:` la misión es la de siempre** (todo el camino es `cfg.terrain`). Es opcional y se
puede agregar a cualquier misión sin tocar nada más.

Va **aparte de `fases:`**. Las fases son la historia del vuelo (la radio, el techo de radar, qué
enemigos nacen) y son largas; la geografía son accidentes cortos. Se escriben por separado y se
superponen solas.

---

## 2 · La forma: kilómetros, antes y después del blanco

```js
geografia: {
  ida: [
    { km: 4,   suelo: 'mar' },
    { km: 1.5, suelo: 'mar', niebla: 1 },
    { km: 0.8, suelo: 'isla' },
    { km: 3,   suelo: 'costa', lado: 'izq' },
    { suelo: 'mar' },                         // sin km: lo que falte hasta el blanco
  ],
  vuelta: [                                   // se cuenta DESDE el blanco
    { km: 2,   suelo: 'mar', paredes: 'ambos', barrera: 'puente' },
    { km: 4,   suelo: 'tierra', lomas: 4 },
    { suelo: 'mar' },                         // lo que falte hasta casa
  ],
},
```

- **`ida`** va del despegue al blanco; **`vuelta`**, del blanco a casa. La vuelta mide lo mismo que
  la ida (la distancia del `goal` de la misión).
- Cada tramo dice **cuántos km mide**. Solo el **último** de cada lista puede ir sin `km`: ocupa lo
  que quede.
- Si la ida no llega al blanco y hay vuelta, lo que falta se completa con mar.
- Si los tramos **suman más** que el camino, es un error y la misión no carga la geografía (se
  avisa por consola y en `npm run unit`).
- Con `?qa` (misiones comprimidas) los tramos se comprimen con la misión: no hay que hacer nada.
- Las dos listas son opcionales: puede haber geografía solo en la ida, o solo en la vuelta.

> **La otra forma, por fracciones** (`[{ hasta: 0.3, suelo: 'mar' }, ...]`, de 0 a 2), es la de
> las geografías con nombre de `data/geografias.js`, que se ponen encima de cualquier misión con
> `?geo=nombre`. Para escribir UNA misión, usá kilómetros.

---

## 3 · Los suelos

| `suelo` | qué es | claves propias |
|---|---|---|
| `mar` | el de siempre | — |
| `costa` | tierra a un costado del carril, agua del otro | `lado: 'izq' \| 'der'` (dónde queda la tierra; default izq) |
| `tierra` | turba con lomas de lado a lado | `lomas`: metros de relieve, 0–12 (default ~2,2) |
| `isla` | tierra CORTA que cruza el carril y se levanta; se sobrevuela | `alto`, `ancho`, `x`, `borde`, `expone` (abajo) |

**La isla:**

| clave | qué hace | default |
|---|---|---|
| `alto` | metros de la cumbre | 14 |
| `ancho` | fracción del carril que tapa, (0, 1]. Con menos de 1 deja un **canal** por donde pasar sin subir | 1 (de lado a lado) |
| `x` | dónde está centrada (solo con `ancho` < 1), entre −38 y 38 | 0 |
| `borde` | `'playa'`: se entra por una loma que se sube con el gas · `'acantilado'`: un farallón que no se trepa, se choca | playa |
| `expone` | `true` para permitir una isla más alta que el techo del radar (20 m). Es a propósito: cruzarla obliga a que te vean | — |

Para que la cumbre llegue a su `alto` con entrada de playa, la isla necesita unos **600 m** (la
rampa sube al 5 % y las hondonadas del lomo suman hasta el 7 %). Más corta, queda más baja: nunca
más empinada.

**La forma no es la de la data, es una isla** (30/9): los bordes se mellan, el lomo tiene hondonadas
de hasta 2 m (nunca pasa su `alto`) y una parcial se afina hacia las puntas del lado del canal. Si
llega al borde del carril, del lado de afuera sigue en bulbos de hasta 110 m que no se vuelan. Todo
eso solo achica la isla adentro del carril: un canal nunca queda más angosto que lo que dice `ancho`
(`GEO_ISLA_*` en `data/tuning.js`).

---

## 4 · Los accidentes (sobre cualquier suelo, salvo la isla)

| clave | valores | qué hace |
|---|---|---|
| `niebla` | `1` (se ve algo) · `2` (casi nada) | un banco de niebla en todo el tramo, que entra y sale con fundido. Si una misión pone bancos, el sorteo de niebla de OPCIONES no suma otros |
| `paredes` | `'izq'` · `'der'` · `'ambos'` | acantilados a ese costado, con promontorios que se meten en el carril. Chocarlos mata; del lado sin pared se pasa. Dos tramos seguidos con pared del mismo lado son una sola pared |
| `barrera` | `'roca'` · `'puente'` · `'madera'` · `'cables'` | cierra el pasillo de lado a lado al principio del tramo: la roca se pasa por arriba, los otros por abajo (o por arriba). **Necesita `paredes: 'ambos'`** en el mismo tramo |

Todo entra y sale con costura (nada aparece de golpe): la tierra entra por una playa que cruza el
carril, la costa entra desde el costado, las paredes suben, la niebla se funde.

---

## 5 · Lo que hay debajo del blanco

El objetivo está en el límite entre la ida y la vuelta. **Un buque va en el agua**: alrededor del
blanco tiene que haber mar (el validador lo exige cuando el `goal` es `kind: 'ship'`).

Para un objetivo en **tierra** (una base, un edificio — §6) se agrega el tramo `blanco`, que va
**centrado en el objetivo**:

```js
geografia: {
  ida:    [{ km: 3, suelo: 'mar' }, { suelo: 'mar' }],
  blanco: { km: 0.8, suelo: 'isla', alto: 8 },   // 0,4 km antes del objetivo y 0,4 después
  vuelta: [{ suelo: 'mar' }],
},
```

La ida termina donde empieza ese tramo y la vuelta arranca donde termina (sus km se cuentan desde
ahí). Debajo del blanco el suelo se **aplana** (una explanada de 70 m a cada lado), para que la
estructura se apoye en un piso y no cuelgue de una loma.

---

## 6 · El objetivo ESTRUCTURA — una base, un edificio

```js
goal: { kind: 'estructura', nombre: 'BASE COSTERA', dist: 6000 },
geografia: { ida: [...], blanco: { km: 0.8, suelo: 'tierra', lomas: 2 }, vuelta: [...] },
```

- Se juega con **la misma suelta** que el buque: encarar, altura, soltar en verde, pasarle por
  encima. Siempre es `climax: 'suelta'` (la pasada, la arena y el pulso son de buques).
- `nombre` es un renglón de `data/estructuras.js` (hoy: `BASE COSTERA`) y es el rótulo del
  objetivo en la barra. Una estructura nueva es un renglón ahí: su `clase` (un perfil de 20
  alturas en `PERFIL`, `data/blanco.js`) y sus `piezas` (qué se dibuja en cada tramo del perfil:
  cerco, tanque, barraca, depósito, hangar, torre, antena). **El dibujo sale del perfil**: la bomba
  pega donde se ve edificio.
- Tiene que estar en **tierra o isla** (el tramo `blanco`): se apoya en la explanada, y la banda de
  soltar del altímetro se corre con la altura de ese piso.
- **Sin Sea Cat ni Sea Wolf** (son de buque). Si la misión quiere una defensa, `defensa:`.
- La cuenta de la luz verde ve las lomas de delante: lo que promete no se lo come una loma.

Ejemplo completo: **t18** en `data/pruebas_misiones.js` (PRUEBAS → IDA Y VUELTA SMALL 2).

---

## 7 · Las reglas (las revisa el validador)

- Una **isla** tiene mar antes y después. Pegada a tierra o a una costa no es una isla.
- Una isla **no lleva** `paredes` ni `barrera`: la isla ES la barrera.
- Dos **costas de distinto lado** no van pegadas: poné mar o tierra en el medio.
- `lado` solo en una costa; `lomas` solo en tierra; las claves de isla solo en una isla.
- Una clave mal escrita es un error, no se ignora.
- Si la misión trae su propio `zigzag:` (m5), **gana ese**: los acantilados de la geografía no se
  ven. No declares las dos cosas.

## 8 · Lo que pasa en el juego (para decidir dónde poner qué)

- **Sobre tierra y sobre islas no nace nada** (por ahora: primero el terreno). Tampoco pegado a
  una isla. El canal de una isla parcial queda vacío.
- **Una isla a ras se roza y te mata; por encima se pasa.** Con entrada de playa, a crucero alcanza
  con dar gas sobre la arena; con turbo, un poco antes (20 m). Un farallón no se trepa.
- **La isla se ve venir**, pero es chica de lejos: a 320 m son 3–4 píxeles de alto (la escala de
  la cámara). Se lee bien desde unos 200 m.
- **La tierra no es plana a los costados**: fuera del carril (más allá de 50 m del eje) se levanta en
  lomadas irregulares de 6 a 55 m (`COLINA_*` en `data/tuning.js`), en los tramos de tierra y del lado
  de tierra de las costas. Nacen con la tierra (crecen desde la playa; en una costa, desde un borde que
  serpentea a 25–100 m de la orilla) y no se pueden chocar: están
  más allá de todo lo que vuela. Adentro del carril, las lomas suaves de siempre (`lomas`).
- **El techo del radar** es 20 m (6 en un filo): una isla más alta no se cruza sin que te vean.
  No pongas islas en un tramo de filo.

## 9 · Cómo probar

- `?mision=<id>` vuela la misión con su geografía; `?mision=<id>&geo=ninguna`, sin ella (para comparar).
- `?mision=t17&geo=demo` — todo lo que la geografía sabe hacer, en fracciones.
- `?mision=t17&geo=km` — un ejemplo en kilómetros, hecho para los 6 km de t17.
- `?mision=t18` — IDA Y VUELTA SMALL 2: una base de blanco y un poco de todo.
- `npm run unit` valida la geografía de todas las misiones contra su distancia y su objetivo.
- `npm run geografia` — el fixture: vuela t17 y comprueba cada cosa en el juego de verdad.
- En consola: `__geoen(frac, x)` (qué hay en ese punto), `__geoset(lista)` (probar otra geografía en
  vivo), `__islas()`, `__zzdbg()` (los acantilados), `__suelta()` y `__bombas()` (la suelta y
  las bombas en vuelo).
