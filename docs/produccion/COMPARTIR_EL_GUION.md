# Compartir el guion — cómo se genera y cómo se manda

Cómo pasarle la historia a alguien de afuera para que la lea y opine, sin arruinársela.

---

## La regla que manda sobre todo

**El que lee tiene que llegar al guion sin saber nada.**

No es una preferencia estética: si el lector sabe de antemano quién muere, cómo termina y
cuál es el truco del final, **deja de poder evaluar la historia** — la lee confirmando
datos en vez de dejándose llevar. Y entonces la devolución que te da no sirve, porque no
está reaccionando a lo que va a reaccionar un jugador.

De esa regla salen todas las decisiones de abajo.

---

## Los dos documentos

La versión de lectura está partida en dos **a propósito**, y se mandan en dos momentos
distintos.

| | Qué es | Cuándo se manda |
|---|---|---|
| **Parte 1 — GUION** | La historia sola: prólogo, 14 misiones, dos finales, post-créditos. ~50 páginas | **Primero.** Es lo único que recibe al principio |
| **Parte 2 — CÓMO ESTÁ ARMADO** | Personajes, tesis, marco narrativo, indicativos, mapa emocional. ~9 páginas | **Cuando avisa que terminó la parte 1** |

Antes esto era un solo documento con todo el contexto adelante, y **spoileaba el guion
entero en las primeras diez páginas**: el mapa emocional decía quién moría misión por
misión, el dispositivo narrativo explicaba el final, y la ficha del Vasco desarmaba el
secreto de la foto.

**Por qué dos archivos y no un apéndice al final:** un apéndice se espía. Un archivo que
todavía no recibiste, no.

### Lo que esto te da de regalo

Un **segundo momento de feedback**. El lector termina y te cuenta qué sintió *sin saber
nada*. Recién ahí le mandás la parte 2, que además le pregunta: **¿algo de acá te
sorprendió?** Si alguien recién entiende algo leyendo la explicación, es que el guion no
se lo transmitió — y eso es un problema tuyo que conviene saber.

---

## Qué se le saca al guion de trabajo

`GUION_3.md` es el documento de trabajo y tiene un montón de andamiaje que no puede salir:

- las marcas de cambio (🟥 / 🟨) y los "sin cambios", "ex M3", "reescrita 3.5"
- las notas de producción, las de tratamiento y las de verificación histórica
- las referencias a otros documentos del repo
- las secciones de dialectos, notas de producción y anexo para el historiador
- **los títulos de escena que spoilean la escena de abajo** — había un
  `Fase 2 — la pantalla (la muerte del Gitano)` justo arriba de la escena donde muere el
  Gitano, un `MISIÓN 12 (MUERE CORREA)` y un `FINAL B — VOLVER (el oculto)`, que te avisa
  que hay un final secreto antes de que llegues

Y se le agregan dos cosas que el guion de trabajo no necesita:

- **la nota al lector**, que explica la estructura de cada misión, qué son las acotaciones
  en cursiva, qué es histórico y qué es inventado, y **que los pilotos se llaman por el
  apodo** (sin eso, un lector nuevo no sabe que Esteban y Tero son la misma persona)
- **cinco preguntas concretas** de devolución. Preguntar así saca mejor material que un
  "contame qué te pareció"

---

## Cómo se regenera

Los dos `.md` de lectura son **derivados y no se editan a mano**. Si los tocás, el próximo
que corra el script te pisa los cambios.

```bash
# 1. los dos markdown, desde GUION_3.md
python3 produccion/hacer_guion_lectura.py

# 2. los PDF y los .docx
bash produccion/hacer_pdf_lectura.sh
```

**Cada vez que se toca GUION_3.md hay que correr los dos.**

### Los archivos del pipeline

| Archivo | Qué hace |
|---|---|
| `produccion/hacer_guion_lectura.py` | Recorta, limpia y parte en dos. Acá viven todas las reglas de qué se saca |
| `produccion/hacer_pdf_lectura.sh` | Arma los PDF y los .docx de las dos partes |
| `produccion/_lectura_html.py` | El maquetador: convierte a HTML con el estilo de la casa |
| `produccion/_lectura_front.md` | Portada + nota al lector + las cinco preguntas (**editable**) |
| `produccion/_lectura_cierre.md` | El cierre de la parte 1 y el aviso de que existe una parte 2 (**editable**) |

Lo único que se edita a mano es `_lectura_front.md` y `_lectura_cierre.md`. Todo lo demás
sale de GUION_3.

### Dependencias

```bash
pip install weasyprint markdown --break-system-packages
apt install pandoc        # solo para los .docx
```

---

## Cómo se ve

Decisiones de maqueta, por si hay que retocarlas en `_lectura_html.py`:

- **Las páginas del cuaderno de Mateo** van en bloque aparte, con fondo crema y filete
  dorado. Es lo más importante del diseño: el lector tiene que distinguir de un golpe la
  voz del pibe de la del aire.
- **Los diálogos** llevan el nombre en versalitas con sangría francesa; las acotaciones en
  gris y cursiva.
- **Cada movimiento** abre con una página divisoria centrada.
- Salto de página solo en misiones, finales y cierre. El resto fluye.
- Cuerpo en Charter, títulos en sans condensada, A4.

---

## Las cinco preguntas que se le hacen al lector

Están en `_lectura_front.md` y se repiten al final. Si las cambiás, cambialas en los dos
lados.

1. ¿En qué momento te enganchó, y en qué momento se te aflojó? Marcá la página.
2. ¿Hay algún personaje que no te termine de cerrar?
3. ¿Se entiende todo? Si algo lo tuviste que releer, es un problema mío.
4. ¿Hay algo que sobre? Sobre todo si sentís que te explican algo que ya entendiste.
5. ¿Y los dos finales? ¿Cuál elegirías, y cuál va a elegir la mayoría?

Y en la parte 2, la sexta: **¿algo de acá te sorprendió?**

---

## Nota sobre el feedback que ya llegó

La primera ronda trajo cuatro observaciones y las cuatro entraron al guion (el Belgrano,
la frase de las turbinas, la frase de Iorio mal ubicada y el cierre afilado). Está
documentado en `historia/PREGUNTAS_HISTORICAS.md` lo que quedó pendiente de verificar.

La más valiosa de las cuatro no fue contenido faltante: fue señalar que la frase *"hay
gente buena en todos lados"* estaba mal puesta en la escena del Perú, porque **al Perú lo
conocemos**. Ese tipo de observación —la que caza un error de sentido, no de datos— es la
que hace que valga la pena mandar el guion a leer.
