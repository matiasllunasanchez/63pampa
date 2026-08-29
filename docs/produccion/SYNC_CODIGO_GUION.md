# SINCRONIZAR CÓDIGO → DOCUMENTACIÓN

> **🟩 CAMBIO DE RÉGIMEN (Matías, 29/8/2026): la fuente de verdad del modo historia es
> `src/data/story.js`.** Matías escribe y ajusta las escenas **directamente en el juego**,
> probando cómo se ven, y **la documentación es el derivado.**
>
> Se invirtió el flujo. Antes: guion → código. Ahora: **código → guion.**

---

## Por qué el código gana

El propio `story.js` lo explica en su cabecera: cada escena trae junto **su registro, su
placa, su título, sus líneas, y cada línea su hablante, su cara y su `hold`**. Eso es
información que **el documento no puede tener bien**, porque solo se descubre jugando: el
`hold` de 4 segundos de una línea *es* la actuación, y eso se calibra viendo la pantalla, no
escribiendo markdown.

**Corolario: los `hold` y las `cara` NO se documentan en GUION_3.** Viven en el código y ahí
se quedan. Lo que sube al guion es **el texto, la estructura de escenas y las decisiones
narrativas.**

---

## Acceso

| Carpeta | Montada como | Qué tiene |
|---|---|---|
| `docs/` | `~/mnt/docs` | toda la documentación |
| `src/data/` | 🟩 `~/mnt/data` | **`story.js`**, `strings.js`, `missions.js`, `placas.js`, `cines.js`… *(acceso concedido el 29/8)* |

---

## El procedimiento, cada vez

1. **Matías dice hasta qué escena tocó** (por id: *"hasta `STORYM1_TARJETA`"*).
2. Se lee ese tramo de `story.js` y se compara contra GUION_3.md.
3. **Se aplican al guion los cambios de CONTENIDO**: texto de línea, líneas nuevas, líneas
   caídas, escenas partidas o fusionadas, cambios de lugar/hora, cambios de registro.
4. **⚠ NO se borra del guion algo que simplemente FALTA en el código.** Una ausencia puede
   ser una decisión o puede ser que todavía no se migró. **Se marca con ⚠ y se pregunta.**
   Borrar por omisión es la única forma de perder material de verdad en este flujo.
5. Se regenera la versión de lectura (`hacer_guion_lectura.py`).
6. Se reporta: qué se aplicó, y **qué quedó como pregunta abierta.**

---

## Mapa de ids → guion *(se va completando)*

| id en `story.js` | Sección de GUION_3 |
|---|---|
| `P1_2` | Viñeta P.1 — El arroyo |
| `P2_3` | Viñeta P.2 — La cocina |
| `P3_4` | Viñeta P.3 — Lo que un padre puede y lo que no |
| `P4_1` | Viñeta P.4 — La primera página del cuaderno |
| `M1_3` | M1 · Briefing escena 1 — La línea de vuelo |
| `M1_5B` | M1 · Briefing escena 2 — La Casada |
| `STORYM1_TARJETA` | M1 · Tarjeta de misión |
| `M2_MATE` | M2 · la ronda del mate (la reverencia) |
| `M3_FOTO` | M4 · segunda aparición de la foto |
| `M03_*` | M3 — el invento, la arandela, la burrada, el Belgrano |
| `M5_ESCUCHA` | M5 · La escucha |
| `M07_LOCKER` | M7 · El locker |
| `M10_*` | M10 — el hueco, Tandil, la noticia, el Mirage |

---

## ⚠ ABIERTO — lo que está en el guion y NO en el código *(al 29/8, hasta `STORYM1_TARJETA`)*

**Ninguno de estos se borró.** Están marcados en GUION_3 y esperan decisión.

1. **🔴 EL TERITO (M1).** La pintura fresca, *"Su pájaro, Teniente. Acá los aviones van con
   nombre"*, las estrellitas y *"traémela entera, Tero"*. **Es la raíz de tres sistemas**: el
   gesto de Tero en §9d (tocar el terito antes de subir, que se cobra en M14), la mecánica de
   las estrellitas del Turco, y la referencia maestra del asset. Si se cayó a propósito, hay
   que decidir qué pasa con los tres.
2. **🔴 EL RITUAL DE CÓNDOR.** El código usa una autorización de vuelo distinta en cada
   misión. El guion §3 define una **fórmula fija que se repite doce veces y se corta a la
   mitad en M14** — *"Cielo despejado al sur. Viento en la cola. Bajito y a casa. Buena caza,
   muchachos."* **Si cada misión trae su propio texto, el corte de M14 no significa nada.**
   Se puede conservar el rito dejando la parte técnica variable y **la última frase siempre
   igual**.
3. **🟡 "Los Fieles de Plata".** Puma ahora dice *"Bienvenido al escuadrón"*. El nombre de la
   escuadrilla no se pronuncia en ningún lado de M1.
4. **🟡 El ritual de los cinco (M1).** Los cinco gestos sin diálogo — la siembra de §9d.
5. **🟡 El chiste de los gansos** del Gitano sobre el indicativo CAUQUÉN.
6. **🟡 P.1: "Esteban joven DE UNIFORME"**. El código dice solo *"Esteban joven"*. Importa
   para la placa: define si el prólogo ya muestra al piloto o solo al padre.

---

7. **🟩 `M1_5B` usa `placa: 'm7_foto_frente'`.** Decisión de Matías (29/8): la placa pasa a
   ser **el vestuario** — lockers cerrados, uno entornado y negro adentro. **Así la foto no
   se ve en M1 y el giro de M7 se cobra entero.** Es cambiar una palabra en `story.js`.

## 🟩 PENDIENTE DE MOTOR — las estrellitas del Turco *(29/8)*

**UNA estrellita por avión y por vuelta.** Las estrellas de cada avión **suben** una por
misión sobrevivida; **la cantidad de aviones que se pintan baja** cuando alguien no vuelve.
El cruce de los dos es M7.

**Decisión: las dibuja el motor, no la IA.** El arte entrega **un fuselaje limpio, sin
estrellas**; el juego pinta N según el contador de ese avión. Así el número es dato,
el momento de M7 sale gratis (no se incrementa el contador y se ve el hueco), y no hay que
generar trece láminas.

**⚠ No confundir con las 1–4 estrellas de puntaje por nivel** (`freezeRun()`): son otro
sistema y viven en el HUD.

## ✅ Aplicado el 29/8 *(código → guion)*

- **P.2 · Norma:** *"¿Para quién?... ¿Tero?... **Tomá amor.** Es para vos."* + línea nueva
  *"Suena el teléfono."* + explicación del apodo reescrita.
- **P.2 · el cartel: SE CAYÓ LA CITA DEL BALCÓN.** Ya no reproduce el *"Si quieren venir, que
  vengan"* de Galtieri. **El juego deja de darle un micrófono al general.**
- **P.3 · Cóndor habla POR TELÉFONO**, no por radio. La noticia no es la guerra hablándole:
  es un tipo llamándolo.
- **M1 · el briefing se PARTIÓ EN DOS ESCENAS**: la línea de vuelo, y La Casada en el
  vestuario media hora antes.
- **M1 · "LA CASADA" es canon**: es cómo la escuadrilla llama a la foto, *"porque no sabemos
  quién es"*. **Hace que el giro de M7 pegue el doble: el juego le puso nombre a la mujer
  equivocada durante siete misiones.**
- **M1 · reescritas** las líneas de Puma, Gitano, Pichón y Vasco; se cayeron los chismes del
  Pichón y el remate de Puma.
- **M1 · tarjeta**: *"Mar abierto · Objetivo: dominar el vuelo rasante"*.
