# RASANTE — Plan de cinemáticas con presupuesto real

> **Situación:** 626 créditos, ~50–60 por generación → **entre 10 y 12 generaciones**. Con
> una tasa de descarte realista (primeras tomas que salen mal, piernas rotas, estilo
> licuado), eso son **5 o 6 clips finales que sirvan**, no diez.
>
> **Decisión:** el juego se cuenta con **imágenes fijas, sonido y texto**, y el video se
> reserva para un puñado de momentos. Este documento define cuáles y por qué.

---

## Primero lo importante: esto NO es el plan B

Hay una razón de fondo por la que las imágenes fijas son la forma correcta acá, y conviene
tenerla escrita para no dudar en seis meses:

**El juego ya está construido sobre imágenes fijas.** El registro `[TIERRA]` —el cuaderno de
Mateo— son dibujos en papel. Un dibujo no se mueve. Si animás las páginas del cuaderno,
rompés el único dispositivo narrativo que sostiene la historia entera: que lo que vemos de
la isla es lo que un pibe alcanzó a dibujar. La quietud ahí no es falta de presupuesto, **es
el personaje**.

Y en lo demás, las cinemáticas de imagen fija con sonido y texto son el lenguaje del arcade
y la consola de los 90 — el mismo período que el juego imita en el arte. Un juego pixel art
tipo Neo Geo contando su historia con láminas fijas, música y diálogo escrito no parece
barato: parece **de época**.

> **La regla que ordena todo:** el video se gasta **solo donde el significado ES el
> movimiento** — donde una imagen fija, por linda que sea, no puede decir lo que hay que
> decir. Todo lo demás va fijo.

---

## Los momentos que se llevan el video

Ordenados por prioridad. **Los cuatro primeros son los que valen la pena de verdad.**

### 1. La transformación — birome → guerra *(prólogo)* ✅ YA HECHO
El dibujo del nene se convierte en el mar del Atlántico. **El movimiento es literalmente la
tesis del juego**: la infancia se convierte en guerra. Una imagen fija no puede hacer esto:
necesitás ver una cosa transformarse en la otra. Es la mejor inversión posible y ya está
gastada.

### 2. El giro de la foto *(M6 — el locker)*
Las manos engrasadas del Turco dan vuelta la foto. **La acción entera del mejor giro del
guion es un gesto físico de dos segundos.** Contado con dos láminas fijas —frente, corte,
dorso— funciona, pero contado como un solo movimiento continuo es demoledor: el jugador ve
girar el papel y ve aparecer las fechas al mismo tiempo que los personajes.

Además es **barato de generar y difícil de arruinar**: plano cerrado, dos manos, un objeto,
cámara fija, nada de piernas ni caras.

### 3. El batir de alas *(la cadena M7 → M11 → M12)*
Un avión que mueve las alas para saludar. **Esto no existe en una imagen fija.** Es el gesto
recurrente del juego y su despedida final; si lo contás con una lámina y un cartel que diga
"batió las alas", lo perdés. Es de los pocos casos donde el movimiento *es* el diálogo.

Con un solo clip bien hecho alcanza: se reusa en las tres apariciones con distinto color de
cielo y distinta música. **Uno se genera, tres veces se usa.**

### 4. El sapito *(prólogo, P1.2)*
La piedra picando tres veces sobre el arroyo. Es la metáfora que le da nombre al juego —
volar bajo, pegado al agua— y **el movimiento es el sentido**: hay que ver la piedra rasante
para entender qué le enseñó el padre. Dos segundos, registro birome, plano cerrado, sin
personajes. Muy barato.

### 5. Norma da vuelta la foto *(epílogo)* — si sobra
El eco del clip 2, con otras manos. Si el 2 sale bien, este es casi gratis de dirigir porque
ya sabés qué prompt funciona. Si los créditos quedan justos, **se cuenta con dos láminas
fijas y se pierde poco.**

### Lo que NO se lleva video, y por qué

| Momento | Por qué va fijo |
|---|---|
| Combates, ataques, el Exocet | **Es gameplay.** El jugador ya lo va a volar. Una cinemática de combate compite con el juego y pierde. |
| La cocina, el briefing, la mesa | Son escenas de gente hablando. Lámina fija + texto + sonido ambiente es *mejor*: el jugador lee a su ritmo. |
| Todas las páginas del cuaderno | Dibujos en papel. Animarlos rompe el dispositivo. **Nunca.** |
| El asado de M11, el locker (salvo el giro) | La emoción está en el texto, no en el movimiento. |
| La mesa de Norma, final | Una mesa quieta con dos papeles enfrentados. **La quietud ES la escena.** |

---

## Presupuesto, con margen para fallar

| Concepto | Generaciones |
|---|---|
| El giro de la foto (M6) | 2–3 *(incluye reintentos)* |
| El batir de alas | 2–3 |
| El sapito | 1–2 |
| Reserva para rescates y para el eco del epílogo | 2–3 |
| **Total** | **~10** |

**No planifiques con las diez.** Planificá con seis y guardá cuatro para cuando algo salga
mal, que va a salir mal. La transformación del prólogo ya está hecha y no se toca.

> **Antes de generar cualquiera de estos, tirá la sonda en Turbo.** Turbo no permite end
> frame, pero sí te dice si el movimiento se rompe — y eso cuesta una fracción. Recién con
> la sonda aprobada gastás la generación buena en 3.0.

---

> **🟥 Actualización (ver RETRATOS.md):** dentro de las "fijas" hay ahora DOS clases. Las
> **escenas de diálogo** van en formato VN — placa de ambiente sin personajes + retrato
> con expresión + texto (el 70% de las pantallas; baratísimas y consistentes). Las
> **cinemáticas fijas de verdad** —lo de abajo: capas, push-in, sonido— quedan reservadas
> para los cuadros sagrados, donde la imagen es el contenido. Esta división multiplica el
> presupuesto visual: menos cuadros completos, mejor hechos.

## Cómo se hacen las cinemáticas fijas *(y por qué no van a parecer pobres)*

Esto es lo que reemplaza al video en el 90 % del juego, y todo se hace **en el motor**, sin
créditos y sin depender de nadie.

**Las capas.** Cada lámina no es una imagen: son tres o cuatro capas separadas —cielo, fondo
lejano, plano medio, primer plano— que se desplazan a velocidades distintas. Con un
movimiento lentísimo alcanza. Un cielo que deriva dos píxeles por segundo detrás de un avión
quieto hace que la imagen esté **viva** sin que nada se anime.

**El acercamiento lento.** Un push-in de 3 a 5 % sobre veinte segundos es invisible como
movimiento y enorme como sensación. Es el recurso más viejo del cine y funciona siempre.

**El texto que se escribe.** El diálogo entra letra por letra, con un tic de sonido por
carácter. Eso hace dos cosas: le da ritmo a una imagen quieta y **le pone la voz del
personaje en la cabeza al jugador**, que es más barato y más íntimo que grabarla.

**El sonido hace el trabajo pesado.** Una lámina fija de la cocina con la pava silbando,
la radio de fondo y una silla que cruje **no se percibe como quieta**. El movimiento que el
ojo no ve, el oído lo inventa. Acá es donde conviene poner el esfuerzo que no se puso en
video: foley bueno, ambientes largos, silencios.

**Cortar con el sonido, no con la imagen.** Cuando el sonido cambia un frame antes que la
imagen, el corte se siente intencional. Cuando cambian juntos, se siente barato.

**Las barras negras.** Letterbox en las cinemáticas y no en el gameplay. Le avisa al jugador
que ahora se mira, no se juega, y le da estatura a una imagen fija.

---

## Las voces

El plan de voces no cambia por esto, pero conviene decidirlo ahora: **texto escrito, no
doblaje.** Además de costar cero, es lo correcto para el período que el juego imita, y evita
el problema del acento — ningún modelo de IA habla rioplatense creíble, y el voseo y la
cadencia son parte de la tesis del proyecto.

Si en algún momento hay presupuesto para grabar, **una sola voz**: la del padre leyendo los
fragmentos de la carta que nunca mandó. Un actor, cinco fragmentos cortos, una tarde de
estudio. Es el único lugar del juego donde escuchar una voz humana agrega algo que el texto
no puede dar.

---

## Qué hacer ahora, en orden

1. **Test 4A en Turbo** — ¿se encadenan planos? Barato y decide mucho.
2. **Generar las láminas fijas**, que es donde va el grueso del trabajo y no consume
   créditos de Kling. El storyboard ya está desglosado cuadro por cuadro.
3. **Prototipar una cinemática fija completa en el motor** — una sola escena, con capas,
   push-in, texto que se escribe y sonido. Si esa escena emociona, el plan está probado y
   los créditos de video son un lujo, no una necesidad.
4. **Recién después**, gastar video en los momentos 2, 3 y 4 de la lista de arriba.
