# RASANTE — Sistema de diálogo (texto primero, sin voces)

> **Alcance actual: SIN VOCES.** El juego se construye y se publica con texto, ambiente y
> foley. Las voces quedan **fuera de alcance** y podrán agregarse en el futuro sobre las
> escenas ya terminadas, **sin rehacer nada**. `PLAN_VOCES.md` queda archivado como
> referencia para ese momento.
>
> Este documento define cómo se guarda y se muestra el diálogo para que esa puerta quede
> abierta gratis.

---

## Las cuatro decisiones que hay que tomar HOY

Casi todo se puede cambiar después. **Estas cuatro cosas no**, o cuestan un rehacer completo:

### 1. Cada línea tiene un ID estable, desde la primera que escribas

Esto es lo único verdaderamente doloroso de agregar después, y es lo que habilita **las
voces, la traducción y el testeo** de una sola vez.

```
M06_LOCKER_014
```
`misión _ escena _ número`. Numerar de diez en diez (010, 020, 030) para poder intercalar
líneas después sin renumerar todo.

**El ID nunca cambia, aunque el texto cambie.** Si reescribís la línea, el ID se queda. Si
la borrás, el ID se retira y no se reutiliza jamás.

### 2. El diálogo vive en archivos de datos, no adentro de las escenas

Una planilla o un JSON, no strings escritos en el código de cada nivel. Si el texto está
hardcodeado, la traducción es un infierno y el día que quieras voces tenés que abrir 12
misiones a mano.

### 3. Una línea = una fila = un futuro archivo de audio

La unidad es **lo que se muestra en pantalla de una vez**. Ese mismo recorte es el que algún
día va a ser un `.ogg` llamado `M06_LOCKER_014.ogg`. Si hoy metés tres oraciones en una fila
porque entran, después vas a tener que partirla y perdés el ID.

### 4. El avance lo maneja el jugador, nunca la duración de un audio

Ya está dicho como principio, pero acá se vuelve código: la escena espera **input del
jugador** o un temporizador calculado sobre el texto. Nunca un `await audio.finished`.

---

## El formato

Una fila por línea. Columnas mínimas:

| campo | qué es | ejemplo |
|---|---|---|
| `id` | inmutable | `M06_LOCKER_014` |
| `personaje` | quién habla, o vacío si es acotación | `PUMA` |
| `registro` | cuál de los cuatro estilos visuales | `DIALOGO` |
| `es_AR` | el texto fuente | `Sesenta y uno.` |
| `en` | traducción | `Sixty-one.` |
| `hold` | segundos extra de silencio DESPUÉS, 0 por defecto | `2.5` |
| `ambiente` | capa de sonido que arranca o cambia acá | `locker_noche` |
| `foley` | efecto puntual en esta línea | `papel_girando` |
| `cara` | retrato que se muestra con esta línea (ver RETRATOS.md); si el asset no existe, cae al nombre solo | `gitano_serio` |
| `placa` | fondo de ambiente de la escena (se setea una vez por escena, no por línea) | `sala_radio` |
| `audio` | **reservado, vacío por ahora** | |

> **El retrato es parte de la actuación:** el cambio de `cara` entre dos líneas (la
> carcajada del Gitano → su retrato serio) más el `hold` posterior ES la dirección de la
> escena. Ver RETRATOS.md — sets de expresiones por personaje y regla híbrida con los
> cuadros sagrados.

Ejemplo real, el momento del locker:

```
id                 personaje  registro  es_AR                            hold  foley
M06_LOCKER_012     GITANO     DIALOGO   ¿Y el "perdoname"? ¿Perdoname…   1.0
M06_LOCKER_013     —          ACOTACION Los tres miran la foto.          2.0   papel_girando
M06_LOCKER_014     PUMA       DIALOGO   Sesenta y uno.                   1.5
M06_LOCKER_015     ESTEBAN    DIALOGO   El Vasco tenía quince años.      4.0
```

Esos `hold` no son un detalle técnico: **son la actuación.** En un juego sin voces, el
silencio entre líneas es lo único que puede hacer el trabajo de una pausa actuada. El 4.0
después de "tenía quince años" es la escena entera.

---

## Los cuatro registros visuales del texto

El jugador nunca tiene que confundir **lo que alguien dice** con **lo que alguien escribió**.

| registro | qué es | cómo se ve |
|---|---|---|
| `DIALOGO` | alguien hablando, ahora | El cuarto registro, nuevo. Limpio, con el nombre del que habla. |
| `TIERRA` | el cuaderno de Mateo | Manuscrita grande de pibe, azul birome sobre papel. |
| `CARTA` | la carta del padre | Apretada, chica, con tachones. Papel oscuro. |
| `SISTEMA` | briefing, radio, interfaz | Tipografía técnica del juego. |

**El nombre del que habla va siempre**, aunque algún día haya voces. Con nueve personajes y
escenas de grupo, el timbre no alcanza.

---

## Cuánto tiempo queda cada línea

Si el jugador no aprieta nada, la línea se va sola. La fórmula:

```
segundos = max(1.6, caracteres / 12) + hold
```

**12 caracteres por segundo** es lento a propósito. El estándar de subtitulado tolera 17,
pero este juego se lee, no se consume — y un jugador apurado siempre puede avanzar él. El
mínimo de 1.6 s es para que un "Sesenta y uno." no pase como un parpadeo.

Y una regla: **el jugador puede acelerar, nunca puede saltear el `hold`.** Los silencios son
parte del guion, no tiempo muerto.

---

## Lo que reemplaza a las voces

Con el texto solo no alcanza. Tres cosas hacen el trabajo:

**El sonido ambiente por escena.** La capa que suena siempre, larga y sin loops obvios: la
lluvia sobre el casco, la pava, el viento de turba, el zumbido del vestuario. Es lo que
convierte una imagen quieta en un lugar. **Acá va el esfuerzo de audio que no va en voces.**

**El texto que se escribe.** Letra por letra, con un tic corto por carácter. Le da ritmo a
una pantalla quieta y —esto es lo importante— **le pone la voz del personaje en la cabeza al
jugador**, que es más íntimo que cualquier grabación. El tic puede variar levemente por
personaje: más rápido y agudo para el Gitano, más lento y grave para Puma. Es "voz" a costo
cero.

**El silencio.** Cuando cae el `hold`, todo se calla salvo el ambiente. Ese es el recurso
dramático más fuerte que tiene un juego sin voces, y este guion está lleno de momentos que
lo piden.

---

## El día que quieras voces

No hay que tocar el sistema. Solo:

1. Se llena la columna `audio` con `id.ogg`.
2. Si existe el archivo, suena por debajo; si no existe, no suena. Nada más.
3. Se agrega un interruptor de voces en opciones, encendido por defecto si hay archivos.
4. **Nada cambia en el ritmo**, porque el ritmo nunca dependió del audio.

Se puede empezar por una sola escena, o por un solo personaje. **Se puede publicar el juego
completo con cero voces y agregar la mitad un año después.** Esa es toda la idea.

---

## Primer paso concreto

Elegí **una escena** —yo iría al locker de M6, que es el pico emocional del juego— y
armala entera con este sistema: filas con ID, los `hold` puestos a mano, el ambiente, el
texto que se escribe, la lámina fija con sus capas.

Después escuchala y mirala sin tocar nada. **Si esa escena, muda, te agarra: el juego
funciona y las voces son un lujo.** Si no te agarra, el problema no son las voces — es el
ritmo, y se arregla ahí, que es donde es barato arreglarlo.
