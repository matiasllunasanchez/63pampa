# EL TRAILER — como se filma

```bash
npm run trailer                       # el guion entero -> trailer/rasante_trailer.mp4
npm run trailer -- --probar           # una hoja de contactos: 3 fotos de cada plano, sin renderizar
npm run trailer -- --solo piruetas    # un plano suelto (ids separados por coma)
npm run trailer -- --fps 30 --escala 1   # borrador rapido
npm run trailer -- --musica assets/music/soundtrack/zona_rasante.m4a --desde 0
```

Tres archivos, y nada mas: `tools/trailer.js` (el que filma), `tools/trailer_preload.js` (el
reloj y el piloto) y `tools/trailer_guion.js` (QUE se filma). El juego no se toca: el guion entra
por las mismas puertas que el jugador y que los fixtures.

---

## Por que no se graba: se RENDERIZA

El problema que origino todo fue «pareciera que tiene bajones de FPS». Y los tiene, y no se le
gana apretando la maquina: una captura en tiempo real guarda cada cuadro **con la duracion que
tardo en dibujarse**, asi que un cuadro de 40 ms dura 40 ms en el video. Peor: los bajones no son
parejos — caen donde hay mas cosas en pantalla, que es exactamente lo que un trailer quiere
mostrar.

Aca no se graba. **El reloj del juego lo maneja el que filma.** `tools/trailer_preload.js` pisa
`performance.now()`, `Date.now()`, `requestAnimationFrame` y los `setTimeout` / `setInterval`, y
los cuelga de un reloj que solo avanza cuando se le pide, siempre 1/fps exacto. El ciclo es:
avanzar el reloj un cuadro → correr el cuadro → pedir el canvas en PNG → repetir. El cuadro puede
tardar 5 ms o 500 en dibujarse; en el video dura 16,67 ms igual.

**Sale parejo por construccion, no por suerte.** Y es reproducible: dos corridas dan el mismo
video. Medido sobre el corte actual: 5.646 cuadros, 94,1 s de video, **cero cuadros duplicados**
(`ffmpeg -vf mpdecimate`), 129 s de pared.

Alcanza con pisar esas cuatro fuentes porque **el juego no tiene reloj propio**: `game.js` toma el
`now` del rAF, saca su `dt` y todo —mundo, particulas, lluvia, menus, carteles— cuelga de ahi; lo
poco que usa reloj de pared se lo pide a `performance.now()`.

Los `setTimeout` de **menos de 1 ms no se tocan**: ahi nadie mide tiempo, es el idiom de «en el
proximo tick» (`audio.js` lo usa asi). Mandarlos al reloj virtual los dejaria esperando un cuadro
que todavia no se pidio — o sea, un cuelgue durante la carga.

**El audio no se captura.** El video sale mudo y ffmpeg le pega una pista encima. El reloj del
audio es de pared y no se puede virtualizar, y para un trailer la musica es una decision de
montaje, no una captura.

## El juego es el de prod

Mismo preload que `electron/main.js --prod`: `RASANTE_APP` puesto y `RASANTE_DEV` apagado, que es
lo que decide el look (sin eso `core/dev.js` prende el MODO DEV en el menu y `audio.js` se
automutea). Corre el arranque del fichin igual que siempre; esos ~12 s se bombean sin grabar
porque el BIOS es DOM y el canvas `#bios`, no el canvas del juego.

La unica diferencia con prod es `contextIsolation: false`, porque el reloj se parchea en el mundo
de la pagina. La pagina no puede notarlo: solo lee `window.RASANTE_APP` y `window.rasanteMusica`.

Se filma el canvas `#g` — 960x540, el juego entero sin el gabinete (`render/ctx.js`) — y ffmpeg lo
agranda a 1920x1080 por **vecino mas cercano**. La escala es entera y la interpolacion esta
prohibida por el mismo motivo que explica `render/ctx.js`: este juego es casi todo raster
corriendo hacia la camara, y cualquier otra cosa lo convierte en papilla.

## El piloto

Un trailer no se filma pidiendole a un robot que juegue bien noventa segundos seguidos. El piloto
(`__tr.piloto({ alt, x, vagar, ritmo })`) hace una sola cosa: sostener la altura y el carril que el
plano pide, leyendo `__suelta()`. Lo vistoso lo pide el guion a mano por sonda.

Dos cosas que costaron encontrar y que conviene no volver a descubrir:

- **Vuela con W/A/S/D, no con las flechas.** Las flechas tienen dos vidas segun la mira
  (`core/input.js`): con la MIRA FIJA, que es la de arranque, rolan y panean la camara — no vuelan.
  La primera version volaba con flechas y el avion se caia al mar cada tres segundos con el gas
  «apretado».
- **Vuela BAJO, y no es estetica.** Arriba de `RADAR_ALT` (20) el radar te ve y te bajan. Medido:
  a 34 de altura, tres derribos en veinte segundos; a 14, ninguno. El juego se llama RASANTE por
  eso, y el trailer lo muestra porque es el juego.

Las teclas sostenidas se re-emiten **un evento por cuadro**, con `repeat: true` desde el segundo:
el juego suelta la entrada sola al volver de una cinematica o de la radio, y lo que mira
`!e.repeat` (abrir menus, saltear pantallas, el detector de combos) tiene que dispararse una vez y
no sesenta por segundo.

**El PULSO se juega.** El climax es un QTE de decimas de segundo: filmarlo sin tocar nada es
filmar como se pierde, y ganarlo de un saque con `__qgana()` es filmar el premio sin la prueba.
`__tr.pulso(n)` lee que glifo pide el compas (`__qdbg().esperado`) y lo teclea por la misma sonda
que usa el fixture, cada `n` cuadros.

## El guion

`tools/trailer_guion.js`. Cada plano dice con que se prepara el juego, cuanto dura y que pasa
adentro. Tres formas de armarlo, las tres a proposito:

| forma | para que | por que |
|---|---|---|
| teclas | los menus | es la unica forma honesta: el menu se mueve como se mueve cuando alguien lo usa, con sus fundidos y el logo que viaja |
| `__prb(id)` | las escenas armadas | `data/pruebas.js` ya ES la lista de los mejores momentos del juego puestos a mano, y la mantiene el repo |
| sondas `__*` | vuelo y piruetas | `__mv('splits')` sale igual todas las veces |

`calentar` son **segundos que no se graban** antes de cada plano, y los momentos del catalogo los
necesitan: casi todos siembran lo suyo con `a.luego(t, …)` —la tormenta pone la rompiente a los
2,2 s— y filmar antes es filmar el momento que todavia no paso.

### Dos trampas del calentamiento

1. **La radio PARA EL MUNDO.** Una mision arranca con su dialogo y `game.js` saltea `update()`
   entero hasta que alguien acepta. Sin tocar una tecla, EL CALLEJON y LA CHANCHA se filmaban con
   el mundo congelado detras de una caja de texto.
2. **…pero la tecla en un menu ELIGE.** El toque a ciegas metia el plano de la portada tres
   pantallas mas adentro, y el trailer entero abria en el menu de HISTORIA. Por eso el
   calentamiento pregunta el estado y **solo toca tecla volando**.

## Que quedo afuera, y por que

- **EL ARENA y LA PASADA** estan en cuarentena (`data/cuarentena.js`): hoy el unico climax que se
  juega es EL PULSO, y eso es lo que el trailer muestra.
- **EL PORTAAVIONES** (`buqueCv`): el momento salta al 93% de la mision y desde ahi quedan veinte
  kilometros de mar. Saltar al 99,9% pasa de largo el objetivo y la mision termina en ¡LE
  ERRASTE!. Queda pendiente encontrarle el punto.
- **LA SUELTA**: el buque aparece a 4 km y no llega en el largo de un plano.

## Salidas

`trailer/` esta en `.gitignore`: es artefacto, pesa y se rehace.

- `rasante_trailer.mp4` — 1920x1080, 60 fps, CRF 16. El master (~130 MB).
- `rasante_trailer_web.mp4` — el mismo a CRF 26 (~40 MB), para mandar.

La musica entra con `--musica` (y `--desde <segundo>`), con fundido de 1,2 s a la entrada y 2 s a
la salida. El corte actual va con `zona_rasante.m4a` y mide **-14,2 LUFS integrados**, que es el
nivel de plataforma.
