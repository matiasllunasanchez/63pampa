# PLAN — La TIERRA y la COSTA alcanzan al agua

> **ESTADO: TERMINADO.** Las seis fases (T1–T6) están implementadas y las cuida `npm run tierra`.
> Lo que queda es de OÍDO, no de código: los números que sólo se juzgan jugando — `TIERRA_AMP`
> (2,2 m de loma), `PASTO_LEAN.storm`, `RESACA_MAX` y `MOJADO_A`.

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

### T1 · La turba tiene clima *(el `WATER_AUTO` que falta de este lado)* — **HECHA**

`LAND_STYLES` y `CLAND_STYLES` en `data/palette.js` con una variante por clima, y `LAND_AUTO`
mapeando cielo→suelo igual que `WATER_AUTO`. `applyTheme` resuelve `theme.land` / `theme.cland`;
`render/world.js` deja de importar `LAND`/`CLAND` directo y lee el tema.

- `storm` — turba **empapada**: más oscura, más fría, casi sin amarillo
- `night` / `moon` — azulada y sin saturación (de noche el ojo no ve color)
- `sun` / `clear` — la turba **quemada** de verano: más amarilla y más clara
- `dawn` — el oro rasante del amanecer sobre las lomas

**Cierre:** cuatro capturas distinguibles de un vistazo; el atardecer (el cielo por defecto) queda
**idéntico** a hoy — la misma regla que salvó al mar de quedar color barro (SPEC_AGUA_OLAS §24).

### T2 · El viento peina el pasto — **HECHA**

Los matojos se **inclinan** con el viento y la inclinación viaja en ondas por el campo (misma idea
que el término direccional de `seaH`: fase determinista `sin(wx*k1 + wz*k2 - t*v)`). En `storm` se
acuestan y se suman **rachas de polvo** (o de espuma tierra adentro en la costa).

**Cierre:** con VIENTO=NO el campo queda quieto y **idéntico** a hoy; con tormenta se ve la onda
cruzar. `feel` intacto: esto es render puro.

### T3 · La turba deja de ser una mesa *(la fase de JUEGO — el equivalente de la ola)* — **HECHA**

`core/tierra.js` (PURO, hermano de `core/sea.js`): `tierraH(wx, wz)` = relieve suave de lomas.

1. El raster de suelo y los matojos se **levantan** con el campo.
2. `groundY` en `systems/flight.js` deja de ser `0` y pasa a ser `tierraH` bajo el avión: volar
   rasante sobre turba pasa a ser **seguir el terreno**, que es exactamente la habilidad que el mar
   ya cobra con el roce y las olas.
3. La misma función la evalúan render y vuelo — **lo que ves es lo que te mata**, igual que el mar.

**Cierre:** el fixture prueba que a ras se puede volar siguiendo la loma y que meterse contra una
loma mata; `feel` intacto (la física no se toca, sólo dónde está el piso).

### T4 · La COSTA rompe de verdad — **HECHA**

1. **Resaca**: la franja de espuma deja de ser una banda fija — sube por la arena y se retira, con
   fase por posición a lo largo de la orilla (no toda la playa rompe a la vez).
2. La **ROMPIENTE** (F4 del agua) puede nacer **paralela a la orilla** en el mapa COSTA: la ola que
   se esquiva de costado, puesta donde el mar de verdad rompe.
3. **Kelp**: manchas oscuras de alga en el bajo, deterministas — la costa malvinense es kelp puro y
   además le da textura al agua somera, que hoy es lisa.

**Cierre:** captura de la orilla en dos instantes distintos (la espuma tiene que haberse movido).

### T5 · Lo que hay en el suelo: pedreros, turbales y alambrados — **HECHA**

1. **PEDREROS** (los *stone runs* de Malvinas): ríos de piedra gris que bajan por las laderas. Son
   reales, son espectaculares y **sirven de línea**: volar uno es una referencia. Deterministas por
   celda, con volumen (cara al sol y sombra) como las rocas de hoy.
2. **Turbales**: cortes oscuros de turba apilada, en tableros rectangulares.
3. **Alambrados**: postes cada tantos metros con hilo — la escala del paisaje sólo se lee si hay
   algo de tamaño conocido.

**Cierre:** captura del mismo tramo antes/después; se tiene que leer "esto es Malvinas" y no "un
campo verde".

### T6 · La lluvia moja el suelo — **HECHA**

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

### 4. El matojo se dobla en DOS TRAMOS, no con una transformación *(T2)*

El suelo se pinta con `px()` —rectángulos alineados— y no hay ni un `ctx.transform` en todo el
raster: meterlo por un matojo costaría un save/restore por mata, miles por cuadro. La inclinación
se hace corriendo el tramo de arriba: **base clavada** (la mitad de abajo, sin corrimiento) +
tramo doblado + punta. Tres rects donde antes había dos.

**Lo que se pierde y se acepta:** el matojo tiene un *quiebre* en el medio en vez de una curva. A
la escala a la que se ve (el matojo más grande del primer plano mide unos 6 px de alto) el quiebre
no se distingue de una curva, y a cambio la base nunca se despega del suelo — que es lo que sí se
notaría.

Con `PASTO_LEAN.calm = 0` los tres rects se apilan exactamente donde estaban los dos: el campo sin
viento queda **idéntico** al de antes de esta fase, no parecido.

### 5. La inclinación se mide en FRACCIÓN DE LA ALTURA *(T2)*

No en unidades de mundo ni en píxeles. Así el matojo del horizonte se dobla *lo mismo* que el del
primer plano —en muchos menos píxeles— y la racha se lee como **una** onda cruzando el campo. Con
un corrimiento en píxeles, el fondo se habría doblado el doble que el frente y serían dos vientos.

### 6. `pastoLean` se exporta, y hay sonda `__pasto` *(T2)*

Misma razón por la que `seaH` vive en `core/sea.js` y no adentro del render: lo que se mide desde
afuera tiene que ser **lo mismo** que dobla los matojos en pantalla, no una copia parecida que un
día se desfase. La sonda devuelve la inclinación en un punto del mundo; el fixture prueba con ella
las cuatro propiedades del viento (quieto en calma, doblado siempre con brisa, la onda viaja, y la
onda tiene rumbo) sin depender de comparar píxeles, que con el suelo scrolleando no distingue
"el pasto se movió" de "el mundo avanzó".

### 7. El fixture nace acá: `npm run tierra` *(T2)*

T1 se cerró a ojo, con capturas. Estuvo mal y se salda ahora: el fixture cubre **T1 y T2** —los
cinco cielos dan cinco turbas, el atardecer sigue siendo `#4a5138`, y las cuatro reglas del
viento— y las fases que faltan se agregan al mismo archivo. El color del atardecer está escrito a
mano en el fixture a propósito: leerlo de la paleta sería probar que el suelo es igual a sí mismo.

### 8. Con `rain` el pasto se acuesta pero la turba no se moja *(T2, se cierra en T6)*

`climaDe` resuelve `storm` por **lluvia o cielo**, y `LAND_AUTO` resuelve el color por **cielo**
solo. O sea que con `cfg.rain = 1` bajo un cielo de atardecer el viento sopla fuerte y el suelo
sigue seco. Está bien que sea así por ahora —el agua se comporta igual, y el color del suelo lo
manda la luz, no el agua— pero es justo el agujero que **T6** viene a tapar: mojar el suelo es
cosa de la lluvia, no del cielo, y es un canal aparte del color base.

### 9. La COSTA queda PLANA *(T3)*

El relieve corre sólo con `cfg.terrain === 'land'` (`hayRelieve`). En la COSTA, la orilla que
serpentea (`shoreAt`), el ancho de playa, la franja de rompiente y el raster partido en la línea de
costa están **todos clavados al cero del mundo**: levantarles el suelo por debajo obliga a mover
tres sistemas a la vez, y la loma ganada además taparía el mar, que es lo que el mapa viene a
mostrar. La costa recibe lo suyo en **T4**, que es su fase.

### 10. El raster de color NO se desplaza; lo que dibuja la loma es el pasto y la luz *(T3)*

Lo honesto sería reproyectar el suelo entero: cada fila del raster es una profundidad, y con altura
`h` esa fila va `(h·F/z)` píxeles más arriba. Pero el raster **itera filas de pantalla y deriva la
profundidad**, no al revés, y darlo vuelta significa reescribir el pintado del suelo, el moteado,
la bruma, los surcos, la orilla y la pista — el sistema entero — para una fase de relieve.

Lo que se hace en cambio son dos cosas baratas y sinceras:

1. **el pasto y todo lo que se apoya se levantan de verdad** (`tierraH` en la proyección de cada
   matojo, y `gy` en cada obstáculo sembrado), que es lo que el ojo lee como superficie;
2. **la pendiente ilumina el raster**: la cara que sube alejándose se aclara y el lomo de atrás se
   oscurece, que es lo que hace que la loma se vea **antes** de estar encima.

**Lo que se pierde y se acepta:** el degradado de color de fondo sigue anclado al cero del mundo,
así que sobre una loma el color corresponde a un suelo un poco más lejano del real. Está medido:
en el horizonte el desfase es de **menos de 2 píxeles** (2,2 m a 190 de profundidad), y cerca —donde
llega a 20 px— lo que se ve es pasto, no gradiente. La costura sería visible sólo contra el cielo,
que es justo donde el desfase es nulo.

### 11. `gy` se fija al sembrar, en UN lugar *(T3)*

El sorteo de obstáculos tiene veinte `obstacles.push`. Ponerle la altura del suelo a cada uno sería
garantizar que un día alguien agregue el veintiuno y quede flotando, así que `plantar()` corre
**después** del sorteo y se la pone a todo lo nuevo de una vez, guiándose por una lista de lo que
**NO** se planta (el aire y el agua): un obstáculo de tierra nuevo queda plantado sin que nadie se
acuerde de nada.

Y `gy` es **un solo número que leen los tres**: la caja (`core/hitbox.js`), el dibujo y el overlay
de depuración. Si fuera sólo del dibujo, la torre se vería trepada a la loma y se chocaría al nivel
del mar — el fantasma clásico de este repo.

### 12. El multiplicador sigue midiendo altura ABSOLUTA *(T3)*

`multOf(alt)` con `alt = plane.y`, como siempre: `feel` da los mismos números. Y la tensión que
aparece es la buena — el marcador te paga por bajar y la loma te cobra por no seguirla, así que en
la subida hay que **elegir**. Medirlo sobre el suelo (AGL) habría hecho que volar alto sobre una
loma pagara igual que volar a ras, que es exactamente lo contrario de lo que el juego premia.

Lo que sí se corrigió es el atropello de infantería: la altura del soldado se mide desde **su**
suelo (`sd.gy + SOLDIER.top`). Sin eso, en el lomo de una loma el avión no puede bajar de
`gy + 0.5` y nunca llegaría al techo del soldado: la infantería de las alturas quedaba invulnerable
por accidente.

### 13. La resaca es del AGUA, y vive en `core/sea.js` *(T4)*

`resaca(wz, t)` está con el mar y no con la tierra porque es el **agua subiendo**, no la arena
moviéndose. La fase depende de la posición a lo largo de la orilla además del tiempo: con fase
sólo temporal, los tres kilómetros de playa suben y bajan juntos y eso es una pileta, no un mar.
Y sube de golpe pero se retira despacio (`RESACA_P > 1`), que es lo que separa una lengua de agua
de un seno pintado — el fixture lo mide como *cuánto tiempo pasa retirada*.

**Lo que hace legible el movimiento no es la espuma, es la arena mojada.** La primera versión sólo
movía la línea blanca y se leía como una raya vibrando; la franja oscura que la lengua deja atrás
es lo que convierte eso en agua retirándose.

**Lo que NO cambia:** el vuelo sigue partiendo tierra/mar en `shoreAt`, no en la lengua. La resaca
mueve el filo unos metros y a los dos lados de ese filo tocar el suelo mata igual, así que no hay
injusticia posible — no es un caso de "lo que ves no es lo que te mata", es un caso donde las dos
cosas matan lo mismo.

### 14. La rompiente costera se siembra por una función compartida *(T4.2)*

`rompienteCostera()` la llaman el sembrado y la sonda `__olacosta`. Si la sonda copiara la cuenta
—orilla + `OLA_COSTA_OFF`— probaría su propia copia y el juego podría estar sembrando en cualquier
lado con el test en verde. Es la misma regla que hizo que `seaH` viva en `core/`.

Y es **rompiente** y no marejada por una razón de justicia: una ola de ancho completo contra la
orilla no dejaría por dónde pasar. La parcial deja el lado de tierra y el lado de mar.

### 15. El kelp es deliberadamente sutil *(T4.3)*

Manchas oscuras deterministas por banda de mundo, como el moteado del suelo: el kelp de verdad
tampoco se muda de lugar. Es **textura**, no un accidente que haya que leer — el bajo de la costa
era una banda de color liso y ahora tiene grano. Si un día se quiere que se vea de lejos, la
perilla es `KELP_A`; subirlo mucho convierte el bajo en un manchón y tapa la lectura de la orilla,
que sí hace falta leer.

### 16. Los alambrados CRUZAN el pasillo *(T5)*

Podían ir a lo largo (dividiendo potreros a los costados) y se eligió que crucen, por dos motivos
que no son estéticos: son la única cosa de **tamaño conocido** del paisaje —sin algo así la turba
no tiene escala y el campo podría medir cualquier cosa— y, al cruzarlos, **marcan la velocidad**,
que es justo lo que un campo vacío se come. El hilo se dibuja poste a poste siguiendo el terreno y
no como una recta: una raya horizontal delataría que el suelo es plano justo donde T3 dice que no.

### 17. El pedrero se consulta ANTES de la densidad del pasto *(T5)*

El sorteo de matojos deja pasar la mitad de las celdas. Adentro del río de piedra eso daría un
pedrero con claros — o sea pasto gris. Se pregunta primero por el pedrero y ahí la celda se llena.
Y no están en todos lados a propósito: aparecen en poco menos de la mitad de las bandas y duran un
tramo. **Un accidente que está siempre deja de ser un accidente y pasa a ser textura** — y
entonces ya no sirve de referencia, que es para lo que el pedrero existe.

### 18. La lluvia es un VELO sobre el color, no una paleta nueva *(T6)*

La turba mojada es la misma turba más oscura y más fría. Hacerlo como un velo encima del raster la
deja funcionar con los **cinco climas de T1** en vez de pelearse con ellos: si fuera una paleta
`LAND_STYLES.wet`, habría que escribir cinco (una por cielo) y garantizar que un día alguna quede
desfasada — el mismo error que la divergencia 1 evitó con el pasto.

**Los charcos dependen de T3, y por eso T6 va última.** Se juntan en los **bajos** del relieve, que
es donde se junta el agua de verdad; sin relieve quedarían salpicados al azar sobre una loma que no
existe, que es la clase de detalle que se nota falso aunque no se sepa por qué. Reflejan el cielo
del tema (`theme.sky`), así que un charco de tormenta es plomo y uno del amanecer es dorado sin una
línea de código extra.

### 19. Lo que T6 prueba se mide en PÍXELES *(T6)*

El suelo mojado no está en ninguna variable —es un velo sobre el raster— así que el fixture
compara el **brillo medio de una franja de suelo** seco contra tormenta (medido: 78,1 → 44,4).
Probarlo de otra forma sería probar la constante `MOJADO_A`, no la pantalla.
