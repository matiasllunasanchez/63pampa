# MISIÓN 0 — El prólogo

*De años antes hasta el 2 de abril de 1982*

---

## Antes de empezar

No se vuela. Son **cuatro pantallas**, y el juego está parado en las cuatro: avanzás vos, a tu
ritmo, línea por línea.

Acá se planta todo lo que el resto de la campaña cobra: el sapito, el apodo del padre, el motivo
por el que Esteban sube a un avión, y el cuaderno.

---

## El arroyo

*Años antes.*

*Un campo en la provincia. Un Rastrojero oxidado. Esteban joven revolea una piedra chata: pica una,
dos, tres veces. Mateo, ocho años, dibuja el arroyo con el cuaderno en las rodillas.*

**ESTEBAN:** ¿Ves? Sapito. La piedra no se hunde si va rápido y pegada al agua. Con los aviones es
igual: abajo de todo, rapidito, donde nadie te espera. Los valientes vuelan abajo, Mateo.

**MATEO:** ¿Y no se caen?

**ESTEBAN:** Se caen los que le tienen miedo a la tierra... Salió mejor el avión que yo, ¿eh?

> *Ésta es la regla del juego entero, dicha por un padre a un nene antes de que exista la guerra.
> Cuando Puma la repita en la misión uno —"siempre pegado al agua"— el jugador ya la escuchó.*

---

## La cocina

*2 de abril de 1982.*

*Viernes a la tarde. Mateo, 18, rapado de colimba, de franco: llegó hace un rato y el bolso todavía
está en la puerta. Esteban y Norma preparando el mate y la merienda.*

**MATEO:** En dos meses se termina la instrucción, pá. Después es puro marchar hasta fin de año.
Cuando te quieras dar cuenta ya estoy de vuelta arreglándote el Rastrojero.

**ESTEBAN:** Vos al rastrojero lo rompés más de lo que lo arreglás.

**MATEO:** Sabés que en el sorteo de la colimba casi me toca Aeronáutica. Un poco más arriba el
número y en vez de al Ejército me mandaban con vos.

**ESTEBAN:** Te salvaste por poco, entonces.

*Se ríen los tres.*

*Suena el teléfono.*

**NORMA:** *(se levanta y atiende)* ¿Para quién?... ¿Tero?... Tomá amor. Es para vos.

*Esteban toma el teléfono.*

**MATEO:** ¿Tero?

**NORMA:** A tu padre le dicen Tero. Se lo pusieron hace casi veinte años durante la colimba y le
quedó para siempre. En el trabajo le dicen así.

*Esteban corta el teléfono. Queda pálido y en silencio.*

**MATEO:** ¿Qué pasa, pá?

*Prende la radio sin responder. «...tropas argentinas desembarcaron esta madrugada en las Islas
Malvinas...». Los tres quietos. La pava chifla y nadie la saca del fuego.*

*El 2 de abril la Plaza se llenó de gente festejando. En esa cocina, un padre que realmente conocía
las consecuencias de una guerra no festejó.*

> *Acá el jugador se entera de cómo se llama el personaje que va a manejar durante catorce
> misiones, y se lo dice la madre en una cocina. Y el chiste del sorteo —"me mandaban con vos"— es
> el que se vuelve insoportable después.*

---

## Lo que un padre puede y lo que no

*El teléfono de la base, papeles, un despacho, una puerta que se cierra.*

**ESTEBAN:** Llamé a todos. A todos mis contactos en Corrientes. Creí que podía sacarlo... No pude.

**CÓNDOR:** Aldao. Su hijo ya está embarcado. Está en las islas. Lo siento.

> *Tres líneas, y ahí está el motor de las catorce misiones. Es además la primera vez que se
> escucha a Cóndor, que de acá en adelante va a ser solamente una voz por radio.*

---

## La primera página del cuaderno

> *Viejo: llegamos. Hace un frío que no tiene nombre. Somos pibes de todo el país. Hay uno de Jujuy
> que nunca había visto el mar y no puede parar de mirarlo. Hay un porteño que extraña el
> colectivo, ¿podés creer? Extrañar el 60, pá.*
>
> *Decidí comenzar a escribirte, para contarte todo con lujo de detalles, y porque creo que me
> distrae un poco. Cuando vuelva, te lo doy en la mano. Te lo leo y me río con vos. Mientras tanto
> te sigo contando, como si estuvieras acá.*
>
> *Le estuve enseñando a hacer sapito al jujeño. Me acuerdo lo que me enseñaste... Sé que vos estás
> arriba. Mientras yo sigo bancándola acá, vos me ves desde arriba, chiquito pero seguro. Contame
> vos cómo se ve todo desde arriba...*
>
> *A mamá, cuando volvamos, le decimos que acá había guiso y pan. Los dos la misma mentira, ¿eh?
> Que para eso somos los hombres de la casa. Mateo.*

*Esa misma semana, empezaba la guerra.*

> *Acá queda establecido el formato: cada misión va a cerrar con una página del cuaderno. Esa
> cadena es la que cose las catorce.*

---

*Y de acá se pasa directo a la misión uno. Sin menú, sin elegir nivel.*

---
---

# FICHA TÉCNICA

*Esta parte es para el código. Si estás leyendo la historia, terminó arriba.*

**No hay nada jugable.** Cuatro pantallas seguidas, todas con el juego parado.

**Escenas en el código:** `P1_2`, `P2_3`, `P3_4`, `P4_1`.

**Falta pegar:** la placa de apertura de la campaña (`C1_ANTES`), que va **antes** de la primera
escena. Está escrita en `PLACAS_HISTORICAS.md` y dice que los pilotos son inventados, que el resto
pasó, y que donde haya licencia va a estar escrito al final de cada misión con el dato verdadero al
lado. Cierra con *"Los muertos son reales. Los contamos bien."*

**Bloqueo para publicar:** esa última línea es una promesa, y hay dos cifras sin cerrar en la
campaña — el número de muertos del Glamorgan (13 o 14) y la cifra que falta en la placa de la
misión 2.

**Decisiones ya cerradas** *(en `RESUELTOS_GUION.md`, no se reabren)*: la primera línea de Mateo
queda como está (P-01); "te salvaste por poco" y no "le erraste por poco" (P-02); "me mandaban con
vos" y no "a la Fuerza Aérea" (P-03).

**Duplicado a limpiar:** `strings.js` tiene una versión vieja de estas cuatro pantallas, con texto
distinto y más corto. Se borra cuando se confirme que el juego lee `story.js`.
