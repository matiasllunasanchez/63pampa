# Prompt para la sesión de código — script que genera las hojas de emociones · 22/10/2026

**Pedido del autor:** *«Dale, vamos con un script para cada uno de los personajes qe tenemos + 8
pilotos random con menos expresiones no hace falta tanta, con mas basicas esos, son para rellenar
los modos de juego basicos.»* — *«Prefeiro regenerar todo completo por slas dudas asi todo se
rengenera igual con el mismo formato y demas»* — *«ejecuitemos el script para un soo personaje primero
igualmente eh.»*

> ⏸ **EN PAUSA (22/10).** La API de imágenes no tiene nivel gratuito; el autor genera a mano, gratis, en la
> app de Gemini: *«Si lo genero gratis»*. Este prompt queda listo por si más adelante se activa la facturación.

Copiá todo lo que está dentro del bloque y pegáselo a la sesión de código.

```
Necesito un script, tools/generar_hojas.py, que genere con la API de Gemini (generación de
imágenes) todas las hojas de emociones de RASANTE, las corte y las instale. Yo solo reviso y
apruebo.

FUENTE ÚNICA: docs/historia/PROMPTS_HOJAS_EMOCIONES.md. No reescribas prompts: se usan tal cual.
Estructura del archivo:
- "## <TÍTULO>" = un personaje.
- "### <hoja>" seguido de un bloque ``` = una hoja a generar. Un "###" SIN bloque de código es
  una nota: se ignora.
- La línea "**Adjuntar ...:**" dice qué imágenes van y en qué orden (IMAGE 1, IMAGE 2). Las rutas
  entre backticks (final/team.png, final/tero3.png...) son archivos del repo. Cuando dice "la Tira A
  de este personaje que haya salido bien", es la Tira A APROBADA de ese personaje (ver abajo).
- "**Cortar con:**" lista los nombres de cada celda, en orden: izquierda a derecha y, en las
  grillas, fila de arriba y después fila de abajo. La cantidad de nombres dice el formato:
  6 = tira de 6 · 4 = tira de 4 (Norma) · 10 = grilla de 5 columnas × 2 filas.
- Nombres con "_av_" o "_cab_" = hojas EN EL AVIÓN: la cabina es parte del retrato, NO se le
  quita el fondo.

API:
- SDK oficial de Google (google-genai). Modelo de Gemini con salida de imagen: verificá en la
  documentación de Google cuál es el actual y qué relaciones de aspecto acepta; para las grillas
  pedí la más cercana a 5:2, para las tiras la más ancha que haya.
  Referencia al 22/10/2026 (página oficial de precios de Google): gemini-3.1-flash-image
  ("Nano Banana 2"), acepta imágenes de entrada, relaciones nuevas 4:1 y 8:1, ~US$0,067 por
  imagen 1K y la MITAD por Batch API. Los modelos de imagen no tienen capa gratuita.
- Fase A sin Batch (la quiero ver rápido). Fase resto por Batch API (más lenta, mitad de precio).
- La clave ya está en el archivo .env de la raíz del repo, como GEMINI_API_KEY=... El script la
  lee de ahí (python-dotenv, o la variable de entorno si existe). Antes de nada verificá que .env
  esté en .gitignore y que nunca se haya commiteado. Nunca la muestres en un log ni en la
  terminal.
- Cada hoja es UNA llamada nueva, sin historial: los chats largos mezclan imágenes (ya nos pasó).
- Reintentos con espera si hay error o límite de uso. Si la API bloquea una imagen, se anota y se
  sigue con la siguiente.
- Guardá un registro de llamadas y costo estimado.

FASES (esto es lo importante: la Tira A es la llave de cada personaje):
1. --fase A: genera SOLO las Tiras A de todos los personajes que no tengan una aprobada, y se
   detiene. Yo las miro juntas y apruebo.
2. --fase resto: genera todas las demás hojas, solo de personajes con Tira A aprobada.
Opciones: --personaje <clave>, --hoja <id>, --rehacer <clave>:<id>, --max N, --dry-run (muestra
qué haría, cuántas llamadas y el costo estimado, sin llamar a la API).

ARCHIVOS:
- hojas/<clave>/<id>__v1.png, __v2... : cada generación, nunca se pisa nada.
- hojas/<clave>/<id>.png : la versión aprobada.
- <id>: A, B, C_gris, D_gris, E_gris, C_avion, D_avion, E_avion, cabina.
- hojas/ESTADO.md : tabla que yo leo y edito a mano: personaje | hoja | estado | versión | fecha.
  Estados: pendiente · generada · aprobada · rehacer · instalada. El script lee lo que yo marco:
  "aprobada" se corta e instala; "rehacer" se vuelve a generar.
- hojas/<clave>/_contacto.png : todas las caras aprobadas del personaje a 108×108, con el nombre
  debajo de cada una (el texto va solo en esta hoja de control, nunca en los retratos).

CORRECCIONES AUTOMÁTICAS (fallas que ya vimos):
- Grilla con 3 filas cuando se pidieron 2 → quedarse con las 2 de arriba.
- Tira con celdas altas en vez de cuadradas → recortar cada celda en cuadrado desde el borde de
  arriba.
- La API devuelve la imagen de referencia casi igual (IMAGE 2 sin cambios) → compararla con la
  referencia; si es casi idéntica, marcar "rehacer" y reintentar una vez.

CORTE E INSTALACIÓN:
- tools/install_retratos.py tiene que aceptar grillas de 5×2 además de tiras, y no quitar el fondo
  en las hojas _av_ y _cab_. Mismo tamaño final que hoy (108×108, assets/portraits/).

TODO SE GENERA DE CERO, la Chancha incluida: nada de lo hecho a mano entra, así todo sale con el
mismo formato.

VOLUMEN: 90 hojas en total (11 personajes de campaña con 5 hojas, los 6 que vuelan con 3 más en
el avión, la cabina de la Chancha, y 8 pilotos genéricos con 2 cada uno). Arrancá con --dry-run y mostrame el número.

PRIMERA CORRIDA: UN SOLO PERSONAJE, de punta a punta, antes de tocar el resto: la Chancha
(--personaje chancha). Fase A, la apruebo, después todas sus hojas (gris, cabina y en el avión),
corte, instalación y hoja de contacto. Recién cuando yo diga que salió bien, se corre el resto.
```
