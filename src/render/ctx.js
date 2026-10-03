// NUCLEO DE DIBUJO: el canvas, su contexto, las medidas del mundo y las primitivas basicas.
//
// Todo el render del juego pasa por aca. Se separa para que cada modulo de pantalla pueda
// dibujar sin recibir el contexto por parametro en cada llamada.
//
// El juego se dibuja SIEMPRE en coordenadas 480x270 (W x H). El canvas real es 2x (SC) para que
// el texto y el arte queden nitidos; el escalado lo aplica el propio contexto, asi que el resto
// del codigo puede razonar en la grilla chica y olvidarse del buffer.
//
// RESOLUCION: la grilla era 320x180 y se subio a 480x270 (exactamente 1.5x) para que cada cosa
// tenga mas pixeles y admita mas detalle. HOR y F escalaron con ella: como proj() usa W/2, HOR y F
// juntos, TODO lo que se dibuja en coordenadas de MUNDO (mar, tierra, obstaculos, avion) se adapta
// solo y conserva su tamaño relativo. Lo que hubo que reescalar a mano fue lo que estaba en
// coordenadas ABSOLUTAS de pantalla: HUD, pantallas, menus y el visor del momentum.
// Las constantes de MUNDO (FLY_X, PZ, alturas de obstaculos...) NO se tocan.

export const W = 480, H = 270;
export const HOR = 96;   // fila del horizonte, en coordenadas de mundo
export const F = 135;    // distancia focal de la proyeccion (ver proj())
export const PZ = 14;    // profundidad a la que vuela el avion
export const SC = 2;     // buffer 2x

// GRILLA DE DISEÑO del HUD, las pantallas y los menus. Esas capas son texto y cajas en
// coordenadas ABSOLUTAS: subir la resolucion no les agrega detalle (el texto ya se rasteriza a la
// resolucion final del dispositivo), solo les correria todo de lugar. Por eso siguen razonando en
// 320x180 y el orquestador las dibuja con ctx.scale(U).
//
// No hay borroneo: U (1.5) x SC (2) = 3 EXACTO, asi que cada unidad de diseño cae en 3 pixeles
// enteros del buffer. De hecho el texto queda MAS nitido que antes (se rasteriza a 3x en vez de 2x).
export const DW = 320, DH = 180;
export const U = W / DW;   // 1.5 — factor de la grilla de diseño a la de mundo

export const cv = document.getElementById('g');
export const ctx = cv.getContext('2d');
cv.width = W * SC;
cv.height = H * SC;

// ---------------- EL JUEGO EN PANTALLA: ESCALA ENTERA, VECINO MAS CERCANO ----------------
//
// El buffer mide W*SC x H*SC (960x540) y el CSS lo estira al tamaño de la caja con
// `image-rendering: pixelated`, o sea VECINO MAS CERCANO. Eso ya estaba. Lo que NO estaba es que
// la caja creciera: `.stage` era `min(96vw, 960px)`, asi que en una ventana de 1512 el juego se
// dibujaba a 960x540 con escala 1.0 — cero ampliacion — y en un monitor 4K a pantalla completa
// seguia siendo la misma cajita. Medido antes de tocar nada.
//
// POR QUE ENTERA Y NO LLENANDO LA PANTALLA. Con vecino mas cercano y un factor fraccionario, unos
// pixeles del buffer ocupan 2 pixeles de pantalla y otros 3. En arte quieto casi no se nota; en
// ESTE juego, que es casi todo raster corriendo hacia la camara (el mar, el suelo, la estela), se
// lee como hormigueo. Con factor entero cada pixel del buffer es un cuadrado identico al de al
// lado, siempre. Se paga con barras negras cuando la pantalla no es multiplo exacto — 1440p es el
// caso incomodo (x2.667) — y es un precio que se ve mucho menos que el hormigueo.
//
// EL FACTOR SE CALCULA EN PIXELES FISICOS, no en CSS. En una pantalla con devicePixelRatio 2 una
// escala CSS de 1.0 ya son 2 pixeles fisicos por pixel del buffer: razonar en CSS daria factores
// enteros que en el vidrio no lo son, que es justo lo que se vino a evitar.
const stage = cv.parentElement;
const MARGEN = 16;   // el aire que el body deja arriba y abajo del stage, en px CSS
// EL AREA QUE MANDA, cuando no es la ventana (3/10): con el fondo FICHIN el juego tiene que caber
// en la PANTALLA del gabinete, y esa la sabe render/ambiente.js. Devuelve { w, h } en px CSS, o
// null para volver a la ventana. Es un enganche y no un import porque ambiente.js importa de aca.
let areaJuego = null;
export function setAreaJuego(fn) { areaJuego = fn; ajustarEscala(); }

export function ajustarEscala() {
  if (!stage) return;
  const dpr = window.devicePixelRatio || 1;
  // ADENTRO DEL GABINETE el juego mide lo que mide el tubo, sin escalones: la imagen cubre la
  // pantalla entera y el mueble pone la medida (pedido del autor, 3/10). Es la unica escala no
  // entera que queda, y es a sabiendas: el fichin a pantalla llena vale mas que el pixel exacto.
  const area = areaJuego && areaJuego();
  if (area) {
    stage.style.width = area.w + 'px';
    return;
  }
  // el alto disponible es la ventana MENOS lo que ocupa la pagina alrededor (encabezado, pie y los
  // margenes). Se mide, no se adivina: cambia con el idioma y con el ancho de la ventana, porque el
  // pie es texto que se reacomoda.
  // EL ALTO DE ALREDEDOR SE MIDE DE LOS ELEMENTOS, NO DEL DOCUMENTO. La primera version lo sacaba
  // de `scrollHeight - alto del stage`, y eso es un LAZO: el alto del stage sale del ancho que esta
  // funcion acaba de fijar, asi que cada medicion devolvia un numero mas chico y el observador la
  // volvia a llamar hasta colapsar el juego al minimo. Medido: paso de 960x540 a 480x270.
  // El encabezado y el pie, en cambio, no dependen del stage — solo del ancho de la ventana.
  const alto = e => (e && e.offsetParent !== null ? e.getBoundingClientRect().height : 0);
  // EL PIE NO CUENTA, Y ES A PROPOSITO. Medido en una ventana de 1280x720: el encabezado ocupa 14 px
  // y el pie 205 — la barra de ayuda es texto que se reacomoda en cuatro o cinco renglones. Restarlo
  // dejaba el juego en x1 cuando antes andaba en x2: una REGRESION disfrazada de prolijidad. Y la
  // pagina ya se desbordaba de antes (960 de stage + 220 de pagina no entran en 688), asi que el pie
  // siempre vivio abajo del pliegue. Queda igual: el juego no se achica por la ayuda.
  // A pantalla completa el pie es `display:none` y aporta 0 solo, sin un caso especial aca.
  const alrededor = alto(document.querySelector('header')) + MARGEN;
  const dispW = window.innerWidth * dpr;
  const dispH = Math.max(0, window.innerHeight - alrededor) * dpr;
  const k = Math.floor(Math.min(dispW / cv.width, dispH / cv.height));
  const ancho = cv.width * k / dpr;                    // lo que mediria con factor entero, en px CSS

  // LA ESCALA ENTERA SOLO SI ES MAS GRANDE QUE LO DE ANTES. Es la regla que impide que "prolijo"
  // signifique "mas chico": en una ventana de 900 px el primer escalon entero cae en x1 —480x270,
  // la MITAD de lo que el CSS daba— y el jugador no cambiaria nitidez por eso. Medido.
  // Entonces: si el escalon entero no llega a lo que daria el CSS de siempre, se suelta la medida a
  // mano y manda el CSS. Ahi la escala vuelve a ser fraccionaria —con su hormigueo— pero el juego
  // nunca sale mas chico que como salia. En ventana grande y a pantalla completa, que es donde el
  // juego se va a jugar de verdad, el entero gana por lejos y queda pixel perfecto.
  const comoAntes = Math.min(window.innerWidth * 0.96, cv.width);   // el `min(96vw, 960px)` del CSS
  if (k < 1 || ancho < comoAntes) { stage.style.width = ''; return; }
  stage.style.width = ancho + 'px';
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', ajustarEscala);
  // el pie es texto que se reacomoda al cambiar de idioma y mueve el alto disponible
  // el pie es texto que se reacomoda al cambiar de idioma y mueve el alto disponible. El guard de
  // re-entrada no es ceremonia: esta funcion ESCRIBE un ancho, y escribirlo dispara al observador.
  let dentro = false;
  if (window.ResizeObserver) new ResizeObserver(() => {
    if (dentro) return;
    dentro = true;
    try { ajustarEscala(); } finally { requestAnimationFrame(() => { dentro = false; }); }
  }).observe(document.body);
  ajustarEscala();
  // una pasada mas cuando la pagina termino de maquetar: al correr este modulo el pie todavia
  // puede no tener su alto final, y el primer calculo saldria con un alrededor de menos.
  window.addEventListener('load', ajustarEscala);
}

/** Rectangulo de pixeles alineado a la grilla. Es la primitiva mas usada del juego (~160 sitios):
 *  redondea para que el arte quede pegado al pixel y nunca dibuja menos de 1x1. */
export function px(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

/** Como `px`, pero al PIXEL REAL del buffer (1/SC de pixel de mundo): lo usan las particulas, que
 *  desde el 2/10 son granos de medio pixel (PART_* en data/tuning.js). `px` redondea al pixel de
 *  mundo y nunca baja de 1: con el, una gota de 0,5 se dibujaba igual que una de 1. */
export function pxFino(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x * SC) / SC, Math.round(y * SC) / SC, Math.max(1, Math.round(w * SC)) / SC, Math.max(1, Math.round(h * SC)) / SC);
}

/** Velo semitransparente sobre todo el mundo: la base de las pantallas de menu y de fin. */
export function panel() { ctx.fillStyle = '#0d1216cc'; ctx.fillRect(0, 0, W, H); }

// TIPOGRAFIAS DE MARCA — se eligen ACA, en una palabra por rol. Las familias candidatas estan
// declaradas en styles.css y van al empaquetado, asi que cambiar de una a otra (o volver al
// monospace de siempre) no toca el CSS ni package.json.
// Dos cosas que hay que forzar:
//   1. Una fuente que NINGUN elemento del DOM usa no se descarga; el canvas no la dispara. Por
//      eso se pide explicitamente con document.fonts.load.
//   2. Hasta que llega, `ctx.font = '26px Kirana'` no falla: cae en silencio a la fuente por
//      defecto. Por eso solo se entrega cuando ya esta lista, y mientras tanto se devuelve el
//      monospace de siempre — el texto nunca queda con una metrica rara a medio cargar.
// El juego redibuja cada cuadro, asi que en el cuadro siguiente a la carga ya sale con la buena.
// Las familias declaradas en styles.css, en dos grupos segun el papel que cumplen:
//   MARCA   (assets/fonts/)        — display: titulan, se miran. No sirven para texto corrido.
//   SIMPLES (assets/fonts/simple/) — de lectura: para el texto que hay que LEER, no mirar.
// Se cargan todas, se usen o no: tenerlas listas es lo que permite comparar una contra otra en
// pantalla sin tocar el CSS ni el empaquetado.
export const FONT_BRAND = ['Kirana', 'OtflagSans', 'Gomarice', 'MalvinasSans', 'AirborneGP', 'JosefinSans'];
export const FONT_SIMPLE = ['Opencare', 'Vegabond', 'Cochocib', 'Kabur', 'Mayorice'];
// assets/fonts/simple/others/ — la tanda en prueba (ver DESC_TRY en render/menus.js)
export const FONT_OTHERS = ['EmbolismSpark', 'GlimpRThin', 'GlimpRThinItalic', 'SmoothElegant'];
const fontReady = {};
if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
  for (const fam of [...FONT_BRAND, ...FONT_SIMPLE, ...FONT_OTHERS]) {
    document.fonts.load('32px ' + fam).then(f => { fontReady[fam] = f.length > 0; }).catch(() => { });
  }
}
/** Fuente `fam` al tamaño pedido; hasta que carga (o si `fam` es null) devuelve el monospace de
 *  siempre — el texto nunca queda con una metrica rara a medio cargar. */
export function uiFont(fam, size, weight) {
  const w = weight === undefined ? 'bold ' : weight ? weight + ' ' : '';
  return fam && fontReady[fam] ? w + size + 'px ' + fam : w + size + 'px monospace';
}

// QUE FAMILIA VA EN CADA ROL. Cambiar una es una palabra; null vuelve al monospace de siempre.
const FONTS = {
  title: 'Kirana',      // logotipo RASANTE (alternativa ya probada: 'Gomarice')
  menu: 'OtflagSans',   // nombres de las opciones del menu de modo
  desc: 'EmbolismSpark',// texto corrido del menu (probadas: Opencare, Vegabond, Cochocib,
                        // Kabur, Mayorice, GlimpR thin/italic, SmoothElegant)
  label: 'GlimpRThin',  // rotulos de seccion ("ELEGI MODO DE JUEGO")
  // LA BIROME DE MATEO: el unico texto del juego que no lo escribe una maquina sino una persona,
  // a mano, sobre un cuaderno (registro TIERRA — ver drawCuaderno en render/screens.js).
  //
  // Se eligio MAYORICE y no la unica otra manuscrita del banco (Cochocib) por una razon que no es
  // de gusto: Cochocib NO TIENE UN SOLO ACENTO NI LA EÑE. Sin ellos, "un frio que no tiene
  // nombre" saldria con la i de una fuente y la tilde de otra —o sin tilde— en las cartas de un
  // pibe que escribe "frío", "país", "podés", "mamá" y "el jujeño" en el mismo parrafo. Mayorice
  // cubre los acentos, la eñe y los signos de apertura, y ademas es una letra de PALO IMPRENTA a
  // birome, que es como escribe un conscripto de dieciocho — no una caligrafia inglesa.
  //
  // Si algun dia entra otra manuscrita al banco: pasarle antes tools/glifos.js, que es lo que
  // encontro este agujero.
  mano: 'Mayorice',
  // EL AVISO DE RADAR (11/9): la placa que entra desde la izquierda en vuelo. Letra de CARTEL DE
  // DISPLAY y no el monospace de los rotulos: es una alarma, y tiene que verse distinta a todo lo
  // que se lee tranquilo.
  aviso: 'Gomarice',
  // EL ROTULO QUE PASA VOLANDO (27/9): "RASANTE" y el nombre del avion que entra en el relevo.
  // Airborne GP —letra de carrera, inclinada y ancha— pedida por el autor para esos dos. Las otras
  // letras de arcade (la flecha IN, los carteles de fuego) siguen con la de los menus.
  rotulo: 'AirborneGP',
  // …y sus LINEAS CHICAS (27/9): "Toma el mando" arriba del nombre del avion y el piloto abajo.
  // Josefin Sans: geometrica y limpia, se lee a 12 px de mundo donde la de carrera se empasta.
  rotuloChico: 'JosefinSans',
};
/** Fuente de las lineas chicas del rotulo (Josefin Sans Bold: el archivo ya es la negrita). */
export const rotuloChicoFont = size => uiFont(FONTS.rotuloChico, size, '');
/** Fuente del rotulo que pasa volando (render/rotulo.js). Sin negrita: la display ya es gruesa. */
export const rotuloFont = size => uiFont(FONTS.rotulo, size, '');
/** Fuente de los avisos de vuelo (la placa del RADAR), sin negrita: la display ya es gruesa. */
export const avisoFont = size => uiFont(FONTS.aviso, size, '');
/** Fuente del logotipo al tamaño pedido, con el monospace de siempre como respaldo. */
export const titleFont = size => uiFont(FONTS.title, size);
/** Fuente de los nombres de opcion del menu. OJO: el resalte de la fila se MIDE con esta misma
 *  fuente (ver drawModeSelect) — si un lado cambia y el otro no, el recuadro deja de calzar. */
export const menuFont = size => uiFont(FONTS.menu, size);
/** Fuente del texto corrido del menu (las descripciones). Sin negrita: es para LEER, no para
 *  titular, y la negrita sobre una proporcional chica empasta. Mismo cuidado que menuFont con
 *  la medicion: el resalte de la fila se mide con esta misma fuente. */
export const descFont = size => uiFont(FONTS.desc, size, '');
/** Fuente de los ROTULOS de seccion. Sin negrita: la GlimpR es condensada y fina a proposito —
 *  el rotulo tiene que ordenar la lista, no competir con los nombres de los modos. */
export const labelFont = size => uiFont(FONTS.label, size, '');
/** LA LETRA A MANO — la birome de Mateo en las paginas del cuaderno. Sin negrita a proposito: una
 *  manuscrita engordada deja de parecer escrita y pasa a parecer un rotulo. */
export const handFont = size => uiFont(FONTS.mano, size, '');

/** Escribe texto ajustado a un ancho maximo, cortando entre palabras y bajando `lh` por linea.
 *  A diferencia de wrapChars (que mide en caracteres), este mide en PIXELES con la tipografia
 *  activa del contexto — por eso vive aca y no en core/util.js.
 *
 *  DEVUELVE la y de la linea siguiente. Quien apila bloques debajo (la tarjeta de MEJORAS DEL
 *  PICHON) no puede saber de antemano si la descripcion ocupo una linea o tres. */
export function wrapText(txt, x, y, maxW, lh) {
  const words = String(txt).split(' '); let line = '', yy = y;
  for (const w of words) {
    if (ctx.measureText(line + w).width > maxW && line) { ctx.fillText(line, x, yy); line = w + ' '; yy += lh; }
    else line += w + ' ';
  }
  ctx.fillText(line.trim(), x, yy);
  return yy + lh;
}
