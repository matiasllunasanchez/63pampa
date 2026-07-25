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

/** Rectangulo de pixeles alineado a la grilla. Es la primitiva mas usada del juego (~160 sitios):
 *  redondea para que el arte quede pegado al pixel y nunca dibuja menos de 1x1. */
export function px(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
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
export const FONT_BRAND = ['Kirana', 'OtflagSans', 'Gomarice', 'MalvinasSans'];
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
};
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

/** Escribe texto ajustado a un ancho maximo, cortando entre palabras y bajando `lh` por linea.
 *  A diferencia de wrapChars (que mide en caracteres), este mide en PIXELES con la tipografia
 *  activa del contexto — por eso vive aca y no en core/util.js. */
export function wrapText(txt, x, y, maxW, lh) {
  const words = txt.split(' '); let line = '', yy = y;
  for (const w of words) {
    if (ctx.measureText(line + w).width > maxW && line) { ctx.fillText(line, x, yy); line = w + ' '; yy += lh; }
    else line += w + ' ';
  }
  ctx.fillText(line.trim(), x, yy);
}
