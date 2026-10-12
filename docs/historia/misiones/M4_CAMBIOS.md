# M4 · CAMBIOS PEDIDOS POR EL AUTOR

*El día que sangró el mar*

> **Esto manda sobre todo lo demás:** sobre el código, sobre `GUION_3.md` y sobre cualquier otra
> documentación. Si acá dice una cosa y el juego dice otra, gana lo que está acá.

---

## Cómo se usa

**Escribí acá, o decímelo por chat — da igual.** Si me lo decís hablando, yo lo escribo acá para
que quede asentado. Este archivo es el registro, no el canal.

**No hace falta ningún formato.** Escribí como te salga: *"la línea del Gitano no me gusta, que sea
más corta"* alcanza. Si no me queda claro, te pregunto antes de tocar nada.

**Reglas que me impuse, después de meter la pata:**

1. **Al transcribir se copia textual.** Si algo me hace ruido, lo levanto como pedido acá; no lo
   edito en silencio ni te ofrezco "mejoras" que no pediste.
2. **Antes de abrir una discusión, leo `RESUELTOS_GUION.md`.** Ahí están tus decisiones tomadas —
   93 ítems cerrados. Lo que ya está decidido no se vuelve a preguntar.
3. **Este archivo es para cosas nuevas**, las que salgan de leer el documento de lectura. Lo viejo
   ya tiene su lugar.

Cada pedido lleva un estado, y lo actualizo yo:

| | |
|---|---|
| ⬜ | pendiente — está pedido, no lo toqué |
| 🔵 | tengo una duda, te pregunté |
| ✅ | hecho — abajo digo qué archivo toqué |
| ❌ | no se puede como está pedido — abajo digo por qué y qué alternativa hay |

---

# PEDIDOS

## 1 · Todo junto: se ataca al buque

**Estado:** ⬜ · *Del 4/10 — está entero en **`ESCALERA_DE_APRENDIZAJE.md`***

> *"M4: Todo junto, se ataca al buque."*

M4 es la primera misión que **usa todo lo aprendido**: rasante, radar y estrellas, Momentum,
turbo, Chancha, bombas. **No se enseña nada nuevo.** Y **al terminar, la primera elección de
mejora: una entre dos.**

**Y es la última que suma algo:** *"desde el 5 en adelante, variarán terrenos, enemigos, cantidades
de enemigos, distancias, buques o objetivos finales, terrenos, pero no mecanicas de juego."*

---
---

## 2 · Los Neptune encuentran a los buques; nosotros los atacamos con bombas — y al final, la aclaración

**Estado:** ⬜ · *Del 9/10*

> *"m4 la idea es qe nos dicen qe unos nEPTUNE detectaron barcazas, y nosotros vamos a atacarlas,
> en realidad fueron super etendard con exocet, nosotros vamos a darle con las bombas nuestras, al
> finalizar la mision se hace el disclaimer."*

**Queda así:**

- **Antes de salir**, les avisan que **unos Neptune de la Armada detectaron los buques**. Es la
  conexión con la misión suelta del Neptune (`MISIONES_SUELTAS.md`, S-02).
- **Se ataca con las bombas del A-4**, como en todo el juego.
- **Al terminar la misión, una aclaración:** en la realidad, el Sheffield lo hundieron **Super
  Étendard de la Armada con misiles Exocet**, no A-4 con bombas.

**Y la aclaración desbloquea la misión del hecho real** *(autor, 9/10)*:

> *"Y en el disclaimer de la mision ganada se aclara bien qe se desbloqueo la mision secundaria rel
> ehcho real"*

En la pantalla de misión ganada, la aclaración dice **con todas las letras** que se desbloqueó la
misión secundaria del Super Étendard (`MISIONES_SUELTAS.md`, S-03): lo que pasó de verdad, para
jugarlo.

**Nota:** el autor dijo *"barcazas"*; el blanco de M4 es el destructor Sheffield. Al escribir la
línea del briefing, se usa la palabra que corresponda — **proponer y mostrar antes de pegar**.

**Y una consecuencia para la tienda:** con esta aclaración, el juego reconoce que hay licencias
sobre lo que pasó. La frase de la página de Steam *"acontecimientos históricamente reales"* va
mejor como *"basados en hechos reales"*.

---
---

## 3 · Mucha niebla y bruma

**Estado:** ⬜ · **Toca:** `missions.js` (`fog`, `fogLen`, cielo de m4) · *Regla de campaña del 9/10*

> *"DEL 2 hasta el 12 de mayo hay MUCHA NIEBLA, todas las misiones qe ocurran en esas fechas tienen
> MUCHA NIEBLA Y BRUMA"*

M4 es el 4 de mayo: **cae adentro.** Hoy M4 se vuela **sin niebla** (`C({ bombs: 0.5 })`, cielo de
atardecer). Hay que ponérsela, y cerrada.

**Nota para quien implemente:** la niebla fuerte esconde los blancos. En M4 el jugador suelta por
primera vez una bomba de verdad, así que hay que ver que el Sheffield se lea a tiempo para
encararlo.

---
---

## 4 · El Narwal: se queda la conversación, y cuadra con la fecha

**Estado:** ✅ no hay que tocar nada · *Del 9/10*

> *"el narwal fue destruido el 9 de mayo, pero bueno podemos mantener el comentario de los datos qe
> llegan y qe se enteren tarde"*

**Queda como está.** En M4 (4 de mayo) el Narwal todavía transmite y Cóndor pasa sus posiciones. En
M5 (21 de mayo), el Gitano le pide que le pregunte al pesquero y Cóndor contesta *«Hace doce días
que no transmite»*. **21 menos 12 es 9 de mayo: la fecha real del ataque.** El guion ya lo tenía
bien, y los pilotos se enteran tarde, que es justamente el punto.

---
---

## 5 · Lo que pasó de verdad: el Sheffield no vio venir el Exocet por una transmisión propia

**Estado:** ⏸ **en veremos** · *Del 9/10*

> *"Historia real en M4: El sheffield en realidad interfirio con el radar al radar del misil"*

**La versión más citada, con un matiz:** no fue que el Sheffield interfiriera el radar del misil.
**Fue al revés: una transmisión del propio barco** —en las versiones de prensa de la época, una
comunicación del capitán con el comando en Inglaterra— **tapó su equipo de detección**, y por eso no
captó el radar del Exocet que se le venía encima. *(Los Angeles Times y Associated Press, 1986,
reproducidos en RISKS Digest 2.53.)*

**Hay otras causas documentadas y no se excluyen:** el barco no estaba en puestos de combate, no
lanzó chaff, y un aviso del Glasgow no llegó a tiempo. El informe británico de la investigación se
publicó recién en 2017. **Si va en la aclaración, conviene contarlo como "una de las razones".**

**⏸ Queda en veremos** *(autor, 9/10)*:

> *"estas usando fuentes britanicas, tambien tengo argentinas y el juego es argentino, pero si
> dejalo en veremos"*

**Lo de arriba sale sólo de fuentes británicas.** Antes de escribir nada hay que contrastarlo con
las fuentes argentinas que tiene el autor.

**La versión del autor (9/10), desde las fuentes argentinas:**

> *"El sheffield estaba realizando una comunicacion satelital que interfirio con el radar interno del
> misil y lo atrajo"*

**Ésta es la versión que cuenta el juego.** Para el registro, las dos no dicen lo mismo:

| | Qué hizo la comunicación satelital |
|---|---|
| **Argentina** (autor) | **interfirió con el radar del misil y lo atrajo** hacia el barco |
| **Británica** (prensa de 1986) | **tapó el equipo de detección del propio barco**, que no vio venir el misil |

**Coinciden en lo central:** el Sheffield estaba transmitiendo por satélite en el momento del
ataque, y esa transmisión fue parte de por qué lo alcanzaron. Si en algún momento la aclaración
quiere mostrar las dos versiones, están acá.

**🔵 Dónde va:** lo natural es la aclaración del final de M4, junto con lo del Super Étendard y el
Exocet. También le sirve a la misión secundaria del Super Étendard (S-03).

---
---

## Dónde está lo que ya decidiste

Las decisiones anteriores de esta misión viven en **`../RESUELTOS_GUION.md`**, con tus casillas
marcadas. Lo que sigue abierto en todo el proyecto está en **`../PENDIENTES_GUION.md`**.

De esta misión no hay nada abierto en el guion. Lo que falta es motor: las dos cinemáticas.
