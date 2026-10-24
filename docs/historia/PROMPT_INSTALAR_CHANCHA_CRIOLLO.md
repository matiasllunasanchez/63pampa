# Prompt para la sesión de código — instalar las caras de la Chancha y del Criollo · 24/10/2026

**Pedido del autor:** *«Me das el prompt para otra sesion de opus para q agarre chancha y ya la acople a Chancha en todas sus apariciones ?» · «y tengo piloto criollo tambien para aplicar» · «asi tambien quitamos esas mil carpetas qe creamos con orden y demas, a medida q se van finalizando quiza conviene quitarlas».*

Copiá el bloque entero y pegáselo a la sesión de código.

```
Hay retratos nuevos para instalar en RASANTE: LA CHANCHA (55 caras) y EL CRIOLLO (10 caras).
Instalalos y conectalos. NO cambies ningún texto de diálogo. Antes de instalar, mostrame qué
archivo es qué tira; si falta algo, decímelo y seguí con lo que hay.

=== 1. LA CHANCHA — el piloto del Hércules ===
Es el ÚNICO personaje cruzado: aparece en la campaña y además es el piloto del Hércules (herc)
en POR LA PATRIA y CICLO DE MUERTE.
Carpeta: docs/historia/chats_hojas/01_CHANCHA/
- 00_ORDEN.md: la tabla de las 11 tiras (5 caras cada una) y el nombre de cada cara, de izquierda
  a derecha.
- RESULTADOS/01_base.png ya tiene nombre. Las otras tiras están como Gemini_Generated_Image_*.jpeg
  SIN renombrar: identificá cada una por su contenido contra la tabla (02–08 fondo gris, 09–11
  dentro de la cabina del Hércules con auriculares). Hay un duplicado ("(1)"). Los dos JPEG de
  1024 px son copias chicas: usá los de 4640 px si existe la misma tira. Renombrá con mv a
  02_fuertes.jpeg, 03_grandes_1.jpeg, etc. No borres nada.
- 01_base.png es una captura de 853 px: usala, pero avisame si a 108 px se ve peor que el resto.

Corte e instalación:
- Cada tira = 5 celdas. Si las celdas no son cuadradas, recortá cada una en cuadrado centrado
  horizontalmente y desde el borde de arriba.
- Si se ve la marca de agua de Gemini (el destello en la esquina inferior derecha), sacala.
- Mismo pipeline y mismo tamaño que los retratos actuales (tools/install_retratos.py → 108×108 en
  assets/portraits/). Las caras chancha_cab_* tienen la cabina de fondo: NO se les quita el fondo.

Conexión en la campaña:
- Toda línea con personaje 'LA CHANCHA' (por ejemplo M06_CHANCHA_050, hoy con cara: null) recibe
  una cara según el momento: en vuelo, una chancha_cab_*; en tierra, una de fondo gris.
- Mostrame la tabla línea → cara elegida y por qué.

Conexión en los modos sueltos:
- Creá un dato único avión → piloto (por ejemplo data/pilotos_avion.js) con las 17 claves de
  data/planes.js. Por ahora: herc → chancha y sky → av_a4b; el resto queda pendiente (sus carpetas
  están en docs/historia/chats_hojas/13_… a 27_…, ver 00_INDICE.md).
- Usalo donde los modos muestren al piloto (selector, radio, pantalla del avión). Si hoy no hay
  ningún lugar que muestre un piloto, NO inventes la interfaz: decime dónde iría.

=== 2. EL CRIOLLO — el piloto del A-4B (sky) en POR LA PATRIA y CICLO DE MUERTE ===
Carpeta: docs/historia/chats_hojas/12_A4B_EL_CRIOLLO/
- RESULTADOS/ tiene 2 JPEG sin renombrar: la base (neutro · sonrisa · preocupado · ceño · radio)
  y las fuertes (risa · miedo · grito · alivio · decidido). Identificalas y renombralas
  01_base.jpeg y 02_fuertes.jpeg.
- Nombres de las caras: los de su 00_ORDEN.md (av_a4b_neutro … av_a4b_decidido).
- Van dentro de la cabina del A-4: NO se les quita el fondo.

=== 3. LIMPIEZA, cuando yo confirme que las caras de un personaje quedaron bien ===
- Las tiras originales (las 01_base, 02_… de RESULTADOS) se guardan como fuente del arte, junto a
  donde el repo guarda las fuentes de los retratos (si no hay un lugar, proponeme uno).
- Recién ahí se borra la carpeta del personaje en docs/historia/chats_hojas/ (01_CHANCHA,
  12_A4B_EL_CRIOLLO) y su fila en chats_hojas/00_INDICE.md.
- Se puede borrar ya mismo docs/historia/_viejos_chats/ (pruebas viejas, todo duplicado o
  descartado). Si encontrás ahí algo que no esté en otro lado, preguntame antes.

Al terminar: lista de caras instaladas, las que faltan y dónde quedó conectada cada una.
```
