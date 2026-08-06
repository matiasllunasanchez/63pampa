// MENUS: seleccion de modo, seleccion de avion y el menu de configuracion de mapa [M].
//
// Igual que las demas pantallas: reciben `w`, un snapshot chico de solo lectura. No leen estado
// global ni lo modifican — la seleccion la maneja el input; aca solo se dibuja.
import { ctx, DW as W, DH as H, W as NW, H as NH, px, panel, titleFont, menuFont, descFont, labelFont, uiFont, FONT_OTHERS } from './ctx.js';
import { drawMira } from './miras.js';
import { P } from '../data/palette.js';
import { PLANES } from '../data/planes.js';
import { T, getLang } from '../core/i18n.js';
import { CAMPAIGNS } from '../data/campaigns.js';
import { fmtDate } from '../systems/saves.js';

// ELECCION DE AVION — la pantalla previa de CICLO DE MUERTE y POR LA PATRIA. Usa los MISMOS
// roles tipograficos que el lobby (logotipo / rotulo / nombre / texto corrido), para que las dos
// pantallas se lean como el mismo juego y no como dos menus distintos.
// OJO CON LOS CUERPOS: esta pantalla se dibuja en la grilla de DISEÑO (320x180) y el menu de
// modos en coordenadas NATIVAS (480x270). Un mismo numero de px NO se ve igual en las dos: aca
// hay que dividir por U (1.5). Por eso el logotipo va en 18 y alla en 26.
export function drawMenu(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(18);              // logotipo: Kirana
  ctx.fillText(T('title'), W / 2, 20);
  // EL MODO manda: va pegado al logotipo y en grande, porque es DONDE ESTAS. El rotulo de la
  // pantalla ("elegi tu avion") es la instruccion, y va despues de un respiro.
  ctx.fillStyle = P.foam; ctx.font = menuFont(13);
  ctx.fillText(w.gameMode === 'cycle' ? T('modeCycle')
    : w.gameMode === 'arena' ? T('modeArena') : T('modeSurvival'), W / 2, 35);
  ctx.fillStyle = P.dim; ctx.font = labelFont(9);                  // rotulo de seccion: GlimpRThin
  ctx.fillText(T('selTitle'), W / 2, 50);

  // preview del avión elegido, con leve cabeceo
  const pl = PLANES[w.selPlane];
  if (pl.ready) {
    const PW = 130, PH = Math.round(PW * pl.h / pl.w);
    ctx.drawImage(pl.img, Math.round(W / 2 - PW / 2), Math.round(80 - PH / 2 + Math.sin(w.t * 1.6) * 2), PW, PH);
  }
  // flechas de selección (parpadean)
  ctx.fillStyle = Math.sin(w.t * 6) > 0 ? P.ink : P.dim; ctx.font = 'bold 15px monospace';
  ctx.fillText('<', 16, 84); ctx.fillText('>', W - 16, 84);

  // nombre + descripción: mismo par que en el menu de modos — nombre en la condensada,
  // descripcion en la manuscrita (ver docs/REFERENCIAS.md: son las cartas de los soldados)
  ctx.fillStyle = P.accent; ctx.font = menuFont(12);
  ctx.fillText(pl.name, W / 2, 114);
  ctx.fillStyle = P.dim; ctx.font = descFont(10);
  ctx.fillText(pl.desc[getLang()] || pl.desc.es, W / 2, 127);

  // puntos indicadores del carrusel
  const n = PLANES.length, gap = 6, totW = (n - 1) * gap;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i === w.selPlane ? P.accent : '#3a464c';
    ctx.fillRect(Math.round(W / 2 - totW / 2 + i * gap) - 1, 134, 3, 3);
  }
  // PIE: una sola linea de teclas, en la misma fuente que el rotulo "ELEGI TU AVION" (GlimpRThin)
  // para que se lean como parte del mismo sistema. Salieron de aca el prompt amarillo que
  // parpadeaba (lo dice la fila [ENTER]), el idioma (vive en OPCIONES) y el homenaje (subio a la
  // portada, que es donde se lee de verdad).
  ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(4.5);   // mitad de cuerpo: es ayuda, no contenido
  ctx.fillText(T('selKeys'), W / 2, 166);
}

// PORTADA y MENU DE MODOS: se dibujan en coordenadas NATIVAS (NW x NH = 480x270), no en la grilla
// de diseño como el resto de los menus. Motivo: son pantallas de puro texto sobre una ilustracion,
// y a resolucion nativa cada letra dispone de 1.5x mas pixeles → se ven mas NITIDAS y permiten
// cuerpos mas chicos sin empastarse. (En la grilla de diseño, ademas, los cuerpos impares caian en
// medio pixel al escalar por 1.5 y salian blandos.)

// GEOMETRIA de las filas del menu de modos, en coordenadas NATIVAS. Se EXPORTA porque el click
// tambien la necesita (game.js traduce el toque a fila): duplicarla a mano ya rompio el click.
// rh subio de 30 a 36 al agrandar la descripcion: con la fuente proporcional, sus ascendentes
// trepaban hasta la linea de base del NOMBRE de arriba y las dos lineas se tocaban.
// Cada fila ocupa ~33 px (nombre en `y`, descripcion en y+14, resalte de y-13 a y+20). Con la
// entrada de ARENA son SEIS, y con el paso viejo (y0 86, rh 36) la ultima caia en y=266: la
// descripcion se salia de los 270 de alto. El toque tactil lee estos mismos numeros, asi que
// ajustarlos aca reubica tambien las zonas tocables.
export const MODE_ROWS = { y0: 78, rh: 31 };

export function drawTitle(w) {
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(34);   // logotipo: Kirana
  ctx.fillText(T('title'), NW / 2, 62);
  ctx.fillStyle = P.ink; ctx.globalAlpha = 0.75; ctx.font = '8px monospace';
  ctx.fillText(T('subtitle'), NW / 2, 78); ctx.globalAlpha = 1;
  // HOMENAJE: es lo ultimo que se lee antes de empezar, y va en la manuscrita — es la razon de
  // ser del juego, no un pie de pagina (ver docs/REFERENCIAS.md). Antes vivia perdido abajo de
  // la pantalla de eleccion de avion.
  ctx.fillStyle = P.ink; ctx.globalAlpha = 0.8; ctx.font = descFont(15);
  ctx.fillText(T('homage'), NW / 2, NH - 42); ctx.globalAlpha = 1;
  if (Math.sin(w.t * 3.2) > -0.35) {                       // parpadeo lento: invita sin apurar
    ctx.fillStyle = P.accent; ctx.font = labelFont(11);    // mas chico: no le gana al homenaje
    ctx.fillText(T('pressStart'), NW / 2, NH - 22);
  }
  // el idioma dejo de estar aca: ahora vive en OPCIONES, dentro del menu de modos
}

// Cuerpo del texto corrido del menu. Las proporcionales tienen la x mas baja que el monospace,
// asi que necesitan mas cuerpo que los 7px de antes para verse del MISMO tamaño — no es que el
// texto sea "mas grande". Si se cambia la familia (FONTS.desc en ctx.js), reajustar aca.
const DESC_PX = 15;

// BANCO DE PRUEBAS: cada renglon del menu sale con una familia distinta y su nombre al costado,
// para compararlas en el tamaño y sobre el fondo reales. DESC_TRY = null vuelve todas a la fuente
// fija (FONTS.desc en ctx.js). Los cuerpos van por familia: comparar todas al mismo "px" engaña,
// porque la altura de la x cambia mucho de una a otra.
const DESC_TRY = null;   // FONT_OTHERS para volver a comparar una familia por renglon
const TRY_PX = { EmbolismSpark: 15, GlimpRThin: 14, GlimpRThinItalic: 14, SmoothElegant: 16 };
const rowFamily = i => DESC_TRY ? DESC_TRY[i % DESC_TRY.length] : null;
/** Fuente de la descripcion `i`. Se usa para MEDIR y para DIBUJAR — el resalte de la fila se
 *  ajusta al contenido, asi que si los dos lados no usan la misma, el recuadro deja de calzar. */
const rowFont = i => {
  const f = rowFamily(i);
  return f ? uiFont(f, TRY_PX[f] || 15, '') : descFont(DESC_PX);
};

export function drawModeSelect(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(26);   // mismo logotipo que la portada
  ctx.fillText(T('title'), NW / 2, 40);

  // opciones CHICAS, pegadas a la IZQUIERDA y centradas verticalmente. La ultima es SALIR.
  // el orden tiene que coincidir con MODES en game.js: la fila que se toca sale de ese indice
  const opts = [
    { name: T('modeCampaign'), desc: T('modeCampaignDesc') },
    { name: T('modeCycle'), desc: T('modeCycleDesc') },
    { name: T('modeSurvival'), desc: T('modeSurvivalDesc') },
    { name: T('modeArena'), desc: T('modeArenaDesc') },
    { name: T('modeOptions'), desc: T('modeOptionsDesc') },
    { name: T('modeQuit'), desc: T('modeQuitDesc'), quit: true },
  ];
  const { y0, rh } = MODE_ROWS, x = 40, PAD_X = 9;   // x deja lugar al cursor '>' fuera del recuadro

  // el "ELEGI MODO DE JUEGO" encabeza la LISTA (no cuelga del titulo): asi se lee como el rotulo
  // de la seccion y no como un subtitulo suelto
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(13);   // GlimpRThin
  ctx.fillText(T('modePrompt'), x, y0 - 20);
  ctx.strokeStyle = '#3a464c'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(x, y0 - 15.5); ctx.lineTo(NW - 30, y0 - 15.5); ctx.stroke();
  ctx.globalAlpha = 1;

  for (let i = 0; i < opts.length; i++) {
    const y = y0 + i * rh, on = i === w.modeSel;
    const col = opts[i].quit ? (on ? P.warn : '#7d6a63') : (on ? P.accent : P.body);
    if (on) {
      // el resalte se AJUSTA al contenido (no cruza la pantalla): se mide el texto mas ancho de la
      // fila y se le suma padding, para que no quede al ras de las letras.
      ctx.font = menuFont(12); const wn = ctx.measureText(opts[i].name).width;
      ctx.font = rowFont(i); const wd = ctx.measureText(opts[i].desc).width;
      const boxW = Math.max(wn, wd) + PAD_X * 2;
      ctx.fillStyle = col; ctx.globalAlpha = 0.13;
      ctx.fillRect(x - PAD_X, y - 13, boxW, 33); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.globalAlpha = 0.5;                 // filo izquierdo: ancla la fila
      ctx.fillRect(x - PAD_X, y - 13, 2, 33); ctx.globalAlpha = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = col; ctx.font = 'bold 10px monospace';
      ctx.fillText('>', x - PAD_X - 9, y);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = col; ctx.font = menuFont(12);   // OtflagSans (la misma con la que se midio)
    ctx.fillText(opts[i].name, x, y);
    ctx.fillStyle = on ? P.ink : P.dim; ctx.globalAlpha = on ? 0.9 : 0.6;
    ctx.font = rowFont(i);                     // la MISMA con la que se midio el resalte arriba
    ctx.fillText(opts[i].desc, x, y + 14);
    if (DESC_TRY) {                            // rotulo de la familia, para saber cual es cual
      const wd2 = ctx.measureText(opts[i].desc).width;
      ctx.globalAlpha = 0.45; ctx.fillStyle = P.accent; ctx.font = '6px monospace';
      ctx.fillText('· ' + rowFamily(i), x + wd2 + 5, y + 14);
    }
    ctx.globalAlpha = 1;
  }

  // sin pie: el "flechas / ENTER" y el cambio de idioma salieron de aca. Lo primero porque la
  // lista ya se explica sola (hay un cursor > sobre la fila); lo segundo porque el idioma es
  // ahora una fila mas del menu (OPCIONES).
}

// OPCIONES — LA pantalla de configuración del juego. Absorbió al menú [M], que se abría solo
// desde la selección de avión y por lo tanto dejaba a la campaña sin acceso a nada.
//
// Las filas (qué son, qué valor muestran, qué hace cambiarlas) viven en OPT_ROWS, en game.js; acá
// solo se dibuja lo que llega en `w.rows`: entradas `{ head }` para los encabezados de sección y
// `{ label, value, preview }` para las filas, con `w.sel` marcando la activa.
//
// FORMATO COMPACTO, de una línea por fila (nombre a la izquierda, `< valor >` a la derecha), y no
// el de dos renglones que tenía antes: con cuatro filas entraba, con veinticuatro no. Es el mismo
// formato que usaba [M], que ya había resuelto este problema.
// view = 9 y no 10: con diez, la ultima fila caia sobre la linea de teclas del pie.
const OPT_GEO = { y0: 112, rh: 15, view: 9 };

/** Primera entrada visible para que `sel` quede dentro de la ventana. La ventana solo se mueve
 *  cuando el cursor la toca — así la lista no se desliza bajo el dedo en cada tecla. */
export function optScroll(sel, n, view) {
  if (n <= view) return 0;
  return Math.max(0, Math.min(n - view, sel - Math.floor(view / 2)));
}

export function drawOptions(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(26);
  ctx.fillText(T('title'), NW / 2, 40);

  const x = 40;
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(13);
  ctx.fillText(T('optTitle'), x, 86);
  ctx.strokeStyle = '#3a464c'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(x, 91.5); ctx.lineTo(NW - 30, 91.5); ctx.stroke();
  ctx.globalAlpha = 1;

  const { y0, rh, view } = OPT_GEO, n = w.rows.length;
  // el cursor arranca centrado en la ventana, pero se muestra el encabezado de arriba si entra:
  // una fila suelta sin su título no dice a qué modo pertenece
  let top = optScroll(w.sel, n, view);
  if (top > 0 && w.rows[top] && !w.rows[top].head) {
    for (let k = top - 1; k >= 0 && k > top - 4; k--) if (w.rows[k].head) { top = k; break; }
  }
  const vis = Math.min(view, n - top);
  const xv = NW - 46;   // borde derecho de los valores
  const xk = xv - 138;  // columna del TECLADO en la sección CONTROLES (la de JOYSTICK va en xv)

  for (let v = 0; v < vis; v++) {
    const i = top + v, r = w.rows[i], y = y0 + v * rh;
    if (r.head) {
      // ENCABEZADO: más chico y en la fuente de rótulo, con una línea al costado que lo separa
      // del bloque anterior sin gastar una fila entera en un espacio en blanco.
      ctx.textAlign = 'left'; ctx.fillStyle = P.accent; ctx.globalAlpha = 0.85;
      ctx.font = labelFont(9);
      ctx.fillText(r.head, x, y);
      const wh = ctx.measureText(r.head).width;
      ctx.globalAlpha = 0.25; ctx.strokeStyle = P.accent;
      ctx.beginPath(); ctx.moveTo(x + wh + 8, y - 3.5); ctx.lineTo(xv, y - 3.5); ctx.stroke();
      ctx.globalAlpha = 1;
      continue;
    }
    // ROTULOS DE COLUMNA de la sección CONTROLES, alineados con los valores de abajo
    if (r.cols) {
      ctx.fillStyle = P.dim; ctx.globalAlpha = 0.7; ctx.font = labelFont(7);
      ctx.textAlign = 'right';
      ctx.fillText(r.cols[0], xk, y); ctx.fillText(r.cols[1], xv, y);
      ctx.globalAlpha = 1;
      continue;
    }
    // NOTA al pie de la tabla de controles. NO es una fila: es una aclaración, y tiene que verse
    // como tal o se lee como una opción que no se puede cambiar. Va sangrada, en la tipografía de
    // etiquetas y apagada, sin columnas y sin resalte — el cursor tampoco se detiene acá.
    if (r.note) {
      ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.globalAlpha = 0.75; ctx.font = labelFont(8);
      ctx.fillText('· ' + r.note, x + 6, y);
      ctx.globalAlpha = 1;
      continue;
    }
    // FILA DE CONTROL: solo lectura, tres columnas (acción · teclado · joystick). Va más apagada
    // que las filas editables a propósito — se lee, no se toca.
    if (r.ctrl) {
      const sel = i === w.sel;
      if (sel) {                                     // el cursor SI se detiene acá: hay que leerlas
        ctx.fillStyle = P.accent; ctx.globalAlpha = 0.10;
        ctx.fillRect(x - 9, y - 9, xv - x + 15, 14); ctx.globalAlpha = 1;
        ctx.fillStyle = P.accent; ctx.globalAlpha = 0.4;
        ctx.fillRect(x - 9, y - 9, 2, 14); ctx.globalAlpha = 1;
      }
      ctx.textAlign = 'left'; ctx.fillStyle = sel ? P.foam : P.body; ctx.font = menuFont(10);
      ctx.fillText(r.ctrl, x, y);
      ctx.textAlign = 'right'; ctx.fillStyle = sel ? P.ink : P.dim; ctx.font = labelFont(9);
      ctx.fillText(r.kb, xk, y);
      ctx.fillStyle = r.pad === '—' ? '#4a565c' : (sel ? P.ink : P.dim);   // guión = no existe ahí
      ctx.fillText(r.pad, xv, y);
      continue;
    }
    const on = i === w.sel;
    if (on) {                                        // resalte de la fila activa, de lado a lado
      ctx.fillStyle = P.accent; ctx.globalAlpha = 0.13;
      ctx.fillRect(x - 9, y - 9, xv - x + 15, 14); ctx.globalAlpha = 1;
      ctx.fillStyle = P.accent; ctx.globalAlpha = 0.5;
      ctx.fillRect(x - 9, y - 9, 2, 14); ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'left'; ctx.fillStyle = on ? P.accent : P.body; ctx.font = menuFont(11);
    ctx.fillText(r.label, x, y);
    ctx.textAlign = 'right'; ctx.fillStyle = on ? P.ink : P.dim; ctx.font = menuFont(11);
    // las flechas SOLO en la fila activa: son la acción disponible, no un adorno de cada renglón
    const val = on ? '< ' + r.value + ' >' : r.value;
    ctx.fillText(val, xv, y);
    // VISTA PREVIA: la mira se elige VIÉNDOLA, no leyendo un número
    if (r.preview === 'mira') {
      const wv = ctx.measureText(val).width;
      drawMira(r.raw, xv - wv - 12, y - 3.5, 13, on ? 1 : 0.55);
    }
  }

  // BARRA DE SCROLL: solo si hay más entradas de las que entran. El pulgar se dimensiona por la
  // fracción visible, así de un vistazo se sabe cuánto falta.
  if (n > view) {
    const bx = NW - 30, by = y0 - 10, bh = view * rh;
    px(bx, by, 2, bh, '#2e3c45');
    const th = Math.max(8, Math.round(bh * view / n));
    px(bx, by + Math.round((bh - th) * (top / (n - view))), 2, th, P.accent);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(6);    // mitad de cuerpo: es ayuda, no contenido
  ctx.fillText(T('optKeys'), NW / 2, NH - 14);
}



// ---------- MENU DE HISTORIA (submenu del modo campaña) ----------
// Mismo lenguaje que el selector de modos: coordenadas NATIVAS, filas a la izquierda con nombre
// grande + descripcion, resalte ajustado al contenido. Los nombres de campaña son PROPIOS
// (data/campaigns.js) y no se traducen.
export const CAMP_ROWS = { y0: 96, rh: 34, headH: 22 };

// texto de cada fila segun su id (los nombres de campaña son PROPIOS y no se traducen)
function campText(r) {
  if (r.id === 'continue') return { name: T('campContinue'), desc: T('campContinueDesc') };
  if (r.id === 'c1') return { name: CAMPAIGNS[0].name, desc: T('campC1Desc') };
  return { name: CAMPAIGNS[1].name, desc: T('campC2Desc') + '  ·  ' + T('campSoon') };
}

export function drawCampMenu(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(26);
  ctx.fillText(T('title'), NW / 2, 40);

  const { y0, rh, headH } = CAMP_ROWS, x = 40, PAD_X = 9;
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(13);
  ctx.fillText(T('campTitle'), x, y0 - 22);
  ctx.strokeStyle = '#3a464c'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(x, y0 - 17.5); ctx.lineTo(NW - 30, y0 - 17.5); ctx.stroke();
  ctx.globalAlpha = 1;

  // las filas se apilan con ALTURAS DISTINTAS (un encabezado ocupa menos que una entrada), asi
  // que la Y se acumula en vez de calcularse por indice: es lo que deja que CONTINUAR entero
  // desaparezca sin dejar el hueco.
  let y = y0;
  for (let i = 0; i < w.rows.length; i++) {
    const r = w.rows[i];
    if (r.head) {   // ENCABEZADO de seccion: mismo lenguaje que OPCIONES (rotulo + linea al lado)
      ctx.textAlign = 'left'; ctx.fillStyle = P.accent; ctx.globalAlpha = 0.85; ctx.font = labelFont(9);
      ctx.fillText(T(r.head), x, y);
      const wh = ctx.measureText(T(r.head)).width;
      ctx.globalAlpha = 0.25; ctx.strokeStyle = P.accent;
      ctx.beginPath(); ctx.moveTo(x + wh + 8, y - 3.5); ctx.lineTo(NW - 30, y - 3.5); ctx.stroke();
      ctx.globalAlpha = 1;
      y += headH;
      continue;
    }
    const t = campText(r), on = i === w.sel;
    // deshabilitada: gris SIEMPRE, aun con el cursor encima — el resalte dice "estas aca",
    // el gris dice "no vas a poder entrar" (confirmar da el beep grave)
    const col = r.disabled ? '#5a666c' : on ? P.accent : P.body;
    if (on) {
      ctx.font = menuFont(12); const wn = ctx.measureText(t.name).width;
      ctx.font = labelFont(9); const wd = ctx.measureText(t.desc).width;
      const boxW = Math.max(wn, wd) + PAD_X * 2;
      ctx.fillStyle = col; ctx.globalAlpha = 0.13;
      ctx.fillRect(x - PAD_X, y - 13, boxW, 33); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.globalAlpha = 0.5;
      ctx.fillRect(x - PAD_X, y - 13, 2, 33); ctx.globalAlpha = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = col; ctx.font = 'bold 10px monospace';
      ctx.fillText('>', x - PAD_X - 9, y);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = col; ctx.font = menuFont(12);
    ctx.fillText(t.name, x, y);
    ctx.fillStyle = r.disabled ? '#4a565c' : on ? P.ink : P.dim; ctx.globalAlpha = on ? 0.9 : 0.6;
    ctx.font = labelFont(9);
    ctx.fillText(t.desc, x, y + 14);
    ctx.globalAlpha = 1;
    y += rh;
  }
}

// una fila de partida guardada: 'LA MESA DE NORMA · MISION 2 · 1234 PTS · 05/08 21:33'
function saveLabel(r) {
  const camp = (CAMPAIGNS[r.camp] || CAMPAIGNS[0]).name;
  return camp + '  ·  ' + T('missionShort', { n: (r.level || 0) + 1 })
    + '  ·  ' + (r.score || 0) + ' PTS  ·  ' + fmtDate(r.ts);
}

// ---------- LISTA DE PARTIDAS GUARDADAS (cargar desde CONTINUAR) ----------
export function drawSaves(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(26);
  ctx.fillText(T('title'), NW / 2, 40);
  const x = 40, y0 = 100, rh = 17;
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(13);
  ctx.fillText(T('savesTitle'), x, y0 - 20);
  ctx.strokeStyle = '#3a464c'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(x, y0 - 15.5); ctx.lineTo(NW - 30, y0 - 15.5); ctx.stroke();
  ctx.globalAlpha = 1;
  if (!w.list.length) {   // no deberia pasar (CONTINUAR se deshabilita sin partidas), pero por si
    ctx.fillStyle = P.dim; ctx.font = menuFont(11);
    ctx.fillText(T('savesEmpty'), x, y0 + 4);
    return;
  }
  for (let i = 0; i < w.list.length; i++) {
    const y = y0 + i * rh, on = i === w.sel;
    if (on) {
      ctx.fillStyle = P.accent; ctx.globalAlpha = 0.13;
      ctx.fillRect(x - 9, y - 11, NW - 60, 16); ctx.globalAlpha = 1;
      ctx.fillStyle = P.accent; ctx.globalAlpha = 0.5;
      ctx.fillRect(x - 9, y - 11, 2, 16); ctx.globalAlpha = 1;
      ctx.fillStyle = P.accent; ctx.font = 'bold 10px monospace';
      ctx.fillText('>', x - 18, y);
    }
    ctx.fillStyle = on ? P.accent : P.body; ctx.font = menuFont(10);
    ctx.fillText(saveLabel(w.list[i]), x, y);
  }
}

// ---------- MENU DE PAUSA (overlay sobre la partida congelada) ----------
// El mundo quedo dibujado DEBAJO tal cual estaba (frame() saltea update, ver game.js): esto es
// un velo + el menu, en coordenadas nativas. `w.t` es pauseT — run.t esta congelado y los
// parpadeos tienen que seguir latiendo.
const CTRL_KEYS = ['Fly', 'Gas', 'Dive', 'Gun', 'Msl', 'Boost', 'Roll', 'Pan', 'Moves',
  'Aim', 'Cam', 'Tempo', 'Inv', 'Music', 'Menu'];
// EL BANCO DEL PICHON (estado 'upgrade'): entre mision y mision de campaña se elige UNA de
// las dos mejoras ofrecidas. Con `libreta` (el Pichon ya murio, M8+) cambian titulo y ritual:
// las mejoras salen de su libreta de bocetos y las construye el Turco solo.
export function drawUpgrade(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(24);
  ctx.fillText(T(w.libreta ? 'upgTitleLib' : 'upgTitle'), NW / 2, 42);
  // el ritual de la dupla, en voz baja (es el termometro del cariño del Turco)
  ctx.fillStyle = P.dim; ctx.font = descFont(11);
  ctx.fillText(T(w.libreta ? 'upgRitualLib' : 'upgRitual'), NW / 2, 62);
  ctx.fillStyle = P.body; ctx.font = labelFont(12);
  ctx.fillText(T('upgSub'), NW / 2, 86);
  // dos tarjetas apiladas: nombre + que hace + el combo + la voz del guion
  const x = 52, wCard = NW - 104, hCard = 62, y0 = 100;
  for (let i = 0; i < w.offer.length; i++) {
    const u = w.offer[i], y = y0 + i * (hCard + 10), on = i === w.sel;
    ctx.globalAlpha = on ? 0.16 : 0.06; ctx.fillStyle = on ? P.accent : P.body;
    ctx.fillRect(x, y, wCard, hCard); ctx.globalAlpha = 1;
    ctx.strokeStyle = on ? P.accent : '#3a464c'; ctx.strokeRect(x + 0.5, y + 0.5, wCard, hCard);
    if (on) {
      ctx.fillStyle = P.accent; ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left'; ctx.fillText('>', x - 16, y + 26);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = on ? P.accent : P.body; ctx.font = menuFont(12);
    ctx.fillText(u.name, x + 12, y + 18);
    ctx.fillStyle = P.body; ctx.font = descFont(10);
    ctx.fillText(u.desc, x + 12, y + 33);
    ctx.fillStyle = P.dim; ctx.font = descFont(10);
    ctx.fillText(T('upgCombo') + ' ' + u.seq, x + 12, y + 46);
    ctx.fillText('"' + u.quote + '"', x + 12, y + 58);
    ctx.textAlign = 'center';
  }
  if (Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.dim; ctx.font = descFont(11); ctx.textAlign = 'center';
    ctx.fillText(T('modeHint'), NW / 2, NH - 14);
  }
}

export function drawPause(w) {
  ctx.fillStyle = '#070a0dd2';           // velo: mas cerrado que panel() — el juego es contexto, no fondo
  ctx.fillRect(0, 0, NW, NH);
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(24);
  ctx.fillText(T('pauseTitle'), NW / 2, 56);

  if (w.view === 'controls') {
    // la tabla de OPCIONES, compactada: accion · teclado · joystick, solo lectura
    const x = 52, xv = NW - 52, xk = xv - 148, y0 = 88, rh = 11.5;
    ctx.textAlign = 'right'; ctx.fillStyle = P.dim; ctx.font = labelFont(7);
    ctx.fillText(T('optColKb'), xk, y0 - 12); ctx.fillText(T('optColPad'), xv, y0 - 12);
    for (let i = 0; i < CTRL_KEYS.length; i++) {
      const y = y0 + i * rh, k = CTRL_KEYS[i];
      ctx.textAlign = 'left'; ctx.fillStyle = P.body; ctx.font = menuFont(9);
      ctx.fillText(T('ctrl' + k), x, y);
      ctx.textAlign = 'right'; ctx.fillStyle = P.dim; ctx.font = labelFont(8);
      ctx.fillText(T('ctrl' + k + 'K'), xk, y);
      const pad = T('ctrl' + k + 'P');
      ctx.fillStyle = pad === '—' ? '#4a565c' : P.dim;
      ctx.fillText(pad, xv, y);
    }
    ctx.textAlign = 'center'; ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(7);
    ctx.fillText('[ESC]', NW / 2, NH - 12);
    return;
  }

  if (w.view === 'save') {
    const x = 52, y0 = 96, rh = 17;
    ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(11);
    ctx.fillText(T('pauseSaveRow'), x, y0 - 18);
    for (let i = 0; i < w.saveRows.length; i++) {
      const r = w.saveRows[i], y = y0 + i * rh, on = i === w.saveSel;
      if (on) {
        ctx.fillStyle = P.accent; ctx.globalAlpha = 0.13;
        ctx.fillRect(x - 9, y - 11, NW - 84, 16); ctx.globalAlpha = 1;
        ctx.fillStyle = P.accent; ctx.font = 'bold 10px monospace';
        ctx.fillText('>', x - 18, y);
      }
      ctx.fillStyle = on ? P.accent : P.body; ctx.font = menuFont(10);
      // slot nuevo (id null) o partida existente para PISAR
      ctx.fillText(r.id === null ? T('saveNew') : saveLabel(r), x, y);
    }
    ctx.textAlign = 'center'; ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(7);
    ctx.fillText(T('saveOver'), NW / 2, NH - 12);
    return;
  }

  // ---- menu raiz ----
  const y0 = 104, rh = 28;
  for (let i = 0; i < w.rows.length; i++) {
    const r = w.rows[i], y = y0 + i * rh, on = i === w.sel;
    const col = r.quit ? (on ? P.warn : '#7d6a63') : on ? P.accent : P.body;
    ctx.textAlign = 'center'; ctx.fillStyle = col; ctx.font = menuFont(13);
    if (on) {
      ctx.font = menuFont(13); const wn = ctx.measureText(r.label).width;
      ctx.fillStyle = col; ctx.globalAlpha = 0.13;
      ctx.fillRect(NW / 2 - wn / 2 - 12, y - 13, wn + 24, 19); ctx.globalAlpha = 1;
      ctx.fillStyle = col;
      ctx.fillText('>', NW / 2 - wn / 2 - 22, y);
    }
    ctx.fillText(r.label, NW / 2, y);
  }
  // flash de confirmacion del guardado (late un rato y se va)
  if (w.msg >= 0 && w.msg < 1.6) {
    ctx.fillStyle = Math.sin(w.t * 10) > -0.4 ? P.accent : P.dim; ctx.font = menuFont(10);
    ctx.fillText(T('pauseSaved'), NW / 2, NH - 26);
  }
  ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(7);
  ctx.fillText(T('pauseHint'), NW / 2, NH - 12);
}
