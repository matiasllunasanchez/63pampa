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

---

## 🟥 PENDIENTE DE PEGAR EN `story.js` *(15/9/2026)*

Escrito y listo en [`historia/PLACAS_HISTORICAS.md`](../historia/PLACAS_HISTORICAS.md). **Son
datos, no código**: se pegan tal cual y se enganchan en la secuencia de su misión.

| Bloque | Dónde va |
|---|---|
| `C1_ANTES` | 🔴 **el primer beat de la campaña**, antes de `P1_2` (el arroyo) |
| `M01_HIST` | después de la carta de M01 |
| `M02_HIST` | después de `M02_8` |
| `M03_HIST` | después de `M03_CUADERNO` |
| `M09_HIST` | después de `M09_CARTA` |
| `M10_HIST` | después de `M10_CUADERNO` |
| `M13_HIST` | después de la carta de M13 |

Las ocho placas restantes (M04, M05, M06, M07, M08, M11, M12, M14) **ya existen**.
Todas usan `placa: 'radio'`: **no hace falta generar arte nuevo.**

### ⚠ Bloqueantes antes de publicar

- **Muertos del Glamorgan: 13 o 14.** `M14_HIST` dice 14, `MEJORAS_PICHON.md` §7 dice 13.
  `C1_ANTES` promete *«los contamos bien»*, así que esto pasa de detalle a bloqueante.
- **M02_HIST** dice *«varios no volvieron»* — cambiar por la cifra exacta cuando se verifique.
- **M09_HIST** no lleva número de aviones perdidos a propósito: las cifras que circulan no
  coinciden.

### 🟩 Nombres de misión sincronizados *(hecho)*

`story.js` había cambiado seis títulos y la documentación estaba atrás. Replicado en 24
archivos: **CON SAL EN LAS ALAS · EL BAUTISMO DE FUEGO · PASTELITOS (ex «25 de Mayo») · EL
BATIR DE LAS ALAS · ÁNGEL DE CORRIENTES · LA CENA (ex «La última mesa»)**.

✅ **`src/data/missions.js` actualizado** con los seis nombres nuevos.

---

## 🟩 AUDITORÍA DE LOS CONFLICTOS ABIERTOS *(15/9/2026 — verificado contra `story.js`)*

Se revisaron los seis puntos que estaban marcados como abiertos. **Cuatro ya están
resueltos en el código** y no hacía falta hacer nada; **dos siguen abiertos.**

| # | Conflicto | Estado | Evidencia en `story.js` |
|---|---|---|---|
| 1 | **EL TERITO (M1)** | ✅ **RESUELTO** | Existe `M01_TERITO` («SU PÁJARO»), con un comentario que dice que es la raíz de tres sistemas y que no se puede caer |
| 2 | **El ritual de Cóndor** | ⚠️ **ABIERTO** | El código usa una autorización **distinta por misión** — *«Autorizada adaptación sobre mar abierto…»* en M1, *«Cruce de costa autorizado»* en M2. El guion quería una fórmula fija que se cobra en M14 |
| 3 | **El nombre del escuadrón** | ✅ **RESUELTO, con otro nombre** | No es «los Fieles de Plata»: en el juego es **PLATA FIEL**, y aparece tres veces — la llamada de Cóndor, *«Plata Fiel… a casa»* y *«Plata Fiel completa, entonces»* en M13 |
| 4 | **El ritual de los cinco (M1)** | ✅ **RESUELTO** | Existe `M01_CINCO` («EL RITUAL DE LOS CINCO») |
| 5 | **El chiste de los gansos** | ✅ **RESUELTO** | Existe `M01_GANSOS`: *«¿Viste? Para el comando somos gansos.»* |
| 6 | **P.1 · «Esteban joven DE UNIFORME»** | ⚠️ **ABIERTO** | `P1_2_010` dice solo *«Esteban joven revolea una piedra chata»*. **Es una palabra.** Importa porque planta que el padre es piloto militar antes de que nadie lo diga |

### Los dos que quedan

**El ritual de Cóndor** es una decisión de autor, no un olvido: si cada misión tiene su propia
autorización, **se pierde el corte de M14** —la misión que Cóndor no autoriza— porque no hay
una fórmula que se pueda negar. Hay que elegir: fórmula fija y el corte funciona, o variedad
por misión y el corte se resuelve de otra manera.

**«De uniforme»** es un renglón: `P1_2_010`, cambiar *«Esteban joven revolea»* por
*«Esteban joven, de uniforme, revolea»*.

### 🟩 Nombres de misión — cerrado en los dos lados

`src/data/missions.js` quedó actualizado con los seis nombres nuevos: `CON SAL EN LAS ALAS` ·
`EL BAUTISMO DE FUEGO` · `PASTELITOS` · `EL BATIR DE LAS ALAS` · `ANGEL DE CORRIENTES` ·
`LA CENA`. **Ya no hay nombres viejos en ningún lado.**

---

## ✅ CERRADO POR DECISIÓN DEL AUTOR *(15/9/2026)*

| Punto | Decisión | Estado |
|---|---|---|
| **El ritual de Cóndor** | **La última frase es siempre la misma: «Buen vuelo.»** El cuerpo del briefing cambia por misión; el cierre no | ✅ aplicado en `story.js`: las **13** líneas de cierre de Cóndor (M01–M13) terminan con la fórmula. **M14 no la tiene** — la misión está denegada, y eso es lo que se rompe |
| **El nombre del escuadrón** | *«Bienvenido a **Los Fieles**, Tero.»* | ✅ aplicado en `story.js`. Convive con **PLATA FIEL**, que es el indicativo de radio |
| **El ritual de los cinco** | *(el autor no lo reconoce como propio)* | ⏸ existe en el código como `M01_CINCO`. **No se toca hasta que se decida.** |
| **El chiste de los gansos** | *(ídem)* | ⏸ existe como `M01_GANSOS`. **No se toca.** |
| **P.1 «de uniforme»** | **Se quita del guion** | ✅ `GUION_3.md` ahora dice solo *«Esteban joven»*, igual que el código |
| **El terito en el avión** | ver abajo | 🟡 **no es un bug** |

### 🟡 Por qué el terito no está en el avión que vuela

**No es un olvido: está medido y documentado en `src/data/skins.js`.** La cámara del sprite
mira desde atrás y unos 10° arriba. A ese ángulo **la deriva se ve de canto (2 px) y el ala se
aplasta al 18%**, y —esto es lo que importa— **el FLANCO del fuselaje, que es donde va el
terito, no aparece en ningún alabeo.** Por eso las skins de los cinco pilotos usan marcas *a lo
largo del ala*, que es lo único que sobrevive a esa cámara.

**El terito sigue siendo canon y sigue estando pintado** — en las placas, en las cinemáticas y
en todo plano cercano. Lo que no puede es vivir en el sprite de 84 px.

> ⚠️ **Y eso deja un pendiente real: M8.** El momento en que Mateo ve el terito desde la turba
> es un plano **desde abajo**, y desde abajo el flanco **sí** se ve. Ese plano **no lo puede
> resolver el sprite normal**: necesita arte propio o un ángulo especial. Es el único lugar del
> juego donde la regla del sprite y la regla del guion se cruzan.
