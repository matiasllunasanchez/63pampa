// MENUS: seleccion de modo, seleccion de avion y el menu de configuracion de mapa [M].
//
// Igual que las demas pantallas: reciben `w`, un snapshot chico de solo lectura. No leen estado
// global ni lo modifican — la seleccion la maneja el input; aca solo se dibuja.
import { DEV } from '../core/dev.js';
import { ctx, U, DW as W, DH as H, W as NW, H as NH, px, panel, titleFont, menuFont, descFont, labelFont, uiFont, wrapText, FONT_OTHERS, filaFont } from './ctx.js';
import { drawMira } from './miras.js';
import { P } from '../data/palette.js';
import { PLANES } from '../data/planes.js';
import { T, getLang } from '../core/i18n.js';
import { CAMPAIGNS } from '../data/campaigns.js';
import { MISSIONS, climaxOf } from '../data/missions.js';
import { LIBRO_VUELO } from '../data/libro_vuelo.js';
import { BANCO, loadoutAt } from '../data/upgrades.js';
import { fmtDate } from '../systems/saves.js';

// ELECCION DE AVION — la pantalla previa de CICLO DE MUERTE y POR LA PATRIA. Usa los MISMOS
// roles tipograficos que el lobby (logotipo / rotulo / nombre / texto corrido), para que las dos
// pantallas se lean como el mismo juego y no como dos menus distintos.
// OJO CON LOS CUERPOS: esta pantalla se dibuja en la grilla de DISEÑO (320x180) y el menu de
// modos en coordenadas NATIVAS (480x270). Un mismo numero de px NO se ve igual en las dos: aca
// hay que dividir por U (1.5). Por eso el logotipo va en 18 y alla en 26.
export function drawMenu(w) {
  panel();
  // LA PANTALLA DEL AVION, REORDENADA (16/10, el autor: "el logo a la derecha, POR LA PATRIA mas arriba y
  // mas grande, sin ELEGI TU AVION, mejor distribucion, las vidas distintas, y lugar para un panel de
  // detalle"). Dos columnas: a la izquierda el modo, el avion con sus flechas, su nombre y su linea, y
  // abajo la dificultad con el escuadron DIBUJADO (un avioncito por vida); a la derecha, el panel de la
  // FICHA del avion. El logo, chico arriba a la derecha como en los submenus (viaja desde ahi).
  if (logoListo()) logoHacia(LOGO_SUB.der - LOGO_SUB.ancho / 2, LOGO_SUB.pie, LOGO_SUB.ancho, 1 / U);
  const L = AVION_UI;
  // EL MODO, arriba a la izquierda y grande: es DONDE ESTAS
  ctx.textAlign = 'left'; ctx.fillStyle = P.foam; ctx.font = menuFont(16);
  ctx.fillText(w.gameMode === 'cycle' ? T('modeCycle')
    : w.gameMode === 'arena' ? T('modeArena')
    : w.gameMode === 'pasadas' ? T('modePasada') : T('modeSurvival'), L.x, L.modoY);
  ctx.strokeStyle = '#3a464c'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(L.x, L.modoY + 6.5); ctx.lineTo(W - L.x, L.modoY + 6.5); ctx.stroke();
  ctx.globalAlpha = 1;

  // EL AVION, en el centro de la columna izquierda, con leve cabeceo. EL SUAVIZADO depende de cuanto hay
  // que achicar: ancho del asset multiplo exacto de los px reales → vecino mas cercano; si no, suavizado.
  const pl = PLANES[w.selPlane];
  const cx = L.colX + L.colW / 2;
  const lista = im => im && im.complete && im.naturalWidth;
  if (lista(pl.selAnim) && lista(pl.selTonel)) {
    // EL AVION VUELA (16/10, el autor: "mejorar la calidad del avion que vuela y agregarle movimientos"):
    // un VAIVEN de SEL_CICLO s —alabea a un lado y al otro, y cabecea al doble de ritmo— que empieza y
    // termina nivelado, y ahi un TONEL de SEL_TONEL s. Las hojas (data/planes.js `selAnim`) estan horneadas
    // a los px reales del avion (L.avionW x 3): se dibujan 1:1, sin suavizar.
    const SEL_CICLO = 9, SEL_TONEL = 1.4;
    const u = w.t % (SEL_CICLO + SEL_TONEL);
    let img, col, row, cols, filas;
    if (u < SEL_CICLO) {
      const f = u / SEL_CICLO;
      const alabeo = 18 * Math.sin(2 * Math.PI * f), cabeceo = 5 * Math.sin(4 * Math.PI * f);
      img = pl.selAnim; cols = 15; filas = 5;
      col = Math.max(0, Math.min(14, Math.round((alabeo + 35) / 5))); row = Math.max(0, Math.min(4, Math.round((8 - cabeceo) / 4)));
    } else {
      const f = (u - SEL_CICLO) / SEL_TONEL, suave = f * f * (3 - 2 * f);
      img = pl.selTonel; cols = 24; filas = 1; col = Math.floor(suave * 24) % 24; row = 0;
    }
    const fw = img.naturalWidth / cols, fh = img.naturalHeight / filas;
    const PW = L.avionW, PH = PW * fh / fw;
    const smooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = fw % (PW * 3) !== 0;
    ctx.drawImage(img, col * fw, row * fh, fw, fh, Math.round(cx - PW / 2), Math.round(L.avionY - PH / 2 + Math.sin(w.t * 1.6) * 2), PW, PH);
    ctx.imageSmoothingEnabled = smooth;
  } else if (pl.ready) {
    const PW = L.avionW, PX_REAL = PW * 3, PH = Math.round(PW * pl.h / pl.w);
    const smooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = !(pl.w % PX_REAL === 0);
    ctx.drawImage(pl.img, Math.round(cx - PW / 2), Math.round(L.avionY - PH / 2 + Math.sin(w.t * 1.6) * 2), PW, PH);
    ctx.imageSmoothingEnabled = smooth;
  }
  // flechas de seleccion (parpadean), a los costados del avion
  ctx.textAlign = 'center';
  ctx.fillStyle = Math.sin(w.t * 6) > 0 ? P.ink : P.dim; ctx.font = 'bold 13px monospace';
  ctx.fillText('<', L.colX + 4, L.avionY + 4); ctx.fillText('>', L.colX + L.colW - 4, L.avionY + 4);
  // nombre + su linea (la manuscrita de las cartas de los soldados, ver docs/REFERENCIAS.md)
  ctx.fillStyle = P.accent; ctx.font = menuFont(12);
  ctx.fillText(pl.name, cx, L.nombreY);
  ctx.fillStyle = P.dim; ctx.font = descFont(9);
  wrapText(pl.desc[getLang()] || pl.desc.es, cx, L.nombreY + 12, L.colW, 10);

  // LA DIFICULTAD (POR LA PATRIA y CICLO DE MUERTE): el nombre con sus flechas arriba/abajo, y el
  // ESCUADRON dibujado — un avioncito por vida — en vez de "8 AVIONES" escrito
  if (w.dif) {
    const y = L.difY, x = L.x;
    ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(6);
    ctx.fillText(T('difTitulo'), x, y - 9);
    const nom = w.dif[getLang()] || w.dif.es;
    const col = w.dif.id === 'gloria' ? P.warn : P.accent;
    ctx.fillStyle = col; ctx.font = menuFont(9);
    const wn = ctx.measureText(nom).width;
    ctx.beginPath(); ctx.moveTo(x, y - 1.5); ctx.lineTo(x + 4, y - 1.5); ctx.lineTo(x + 2, y - 5); ctx.fill();
    ctx.fillText(nom, x + 7, y);
    ctx.beginPath(); ctx.moveTo(x + 9 + wn, y - 5); ctx.lineTo(x + 13 + wn, y - 5); ctx.lineTo(x + 11 + wn, y - 1.5); ctx.fill();
    // el escuadron: avioncitos en fila, el primero (el que vuela) en acento
    const ax = x + 22 + wn;
    for (let i = 0; i < w.dif.aviones; i++) avioncito(ax + i * 9, y - 3, i === 0 ? col : P.ink, i === 0 ? 1 : 0.7);
    ctx.fillStyle = P.dim; ctx.font = labelFont(5);
    ctx.fillText(w.dif.aviones === 1 ? T('difAvion') : T('difAviones', { n: w.dif.aviones }), ax + w.dif.aviones * 9 + 3, y);
  }

  // LA FICHA DEL AVION (a la derecha): el marco y su rotulo. El contenido —cifras, historia, carga— llega
  // con su propio item; hoy el lugar queda armado y con la linea del avion de respaldo.
  const F = L.ficha;
  ctx.fillStyle = '#0a0f12'; ctx.globalAlpha = 0.55; ctx.fillRect(F.x, F.y, F.w, F.h); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#3a464c'; ctx.lineWidth = 0.6; ctx.strokeRect(F.x + 0.5, F.y + 0.5, F.w - 1, F.h - 1); ctx.lineWidth = 1;
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(6);
  ctx.fillText(T('fichaAvion'), F.x + 6, F.y + 10);
  ctx.fillStyle = P.accent; ctx.font = menuFont(9);
  ctx.fillText(pl.name, F.x + 6, F.y + 22);

  // PIE: una sola linea de teclas (mitad de cuerpo: es ayuda, no contenido)
  ctx.textAlign = 'center'; ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(4.5);
  ctx.fillText(T('selKeys'), W / 2, H - 6);
}
/** LA GEOMETRIA de la pantalla del avion (grilla de diseño 320x180). */
const AVION_UI = {
  x: 16, modoY: 26,
  colX: 12, colW: 168, avionY: 74, avionW: 112, nombreY: 112,
  difY: 160,
  ficha: { x: 190, y: 40, w: 114, h: 126 },
};
/** Un avioncito de la fila del escuadron (silueta en cruz, 7 px), centrado en (x, y). */
function avioncito(x, y, col, a) {
  ctx.globalAlpha = a; ctx.fillStyle = col;
  ctx.fillRect(x - 3.5, y - 0.5, 7, 1.2);     // alas
  ctx.fillRect(x - 0.6, y - 3, 1.2, 6);       // fuselaje
  ctx.fillRect(x - 1.8, y + 2, 3.6, 0.9);     // cola
  ctx.globalAlpha = 1;
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
// …y con CINEMATICAS son SIETE: con y0 78 / rh 31 la ultima caia en 264 y "Cerrar el juego"
// quedaba cortada abajo (se vio en la captura). La cuenta del peor caso es `y0 + 6*rh + 20 <= 270`
// —el 20 es lo que baja el resalte por debajo del nombre—: 72 + 174 + 20 = 266, adentro. El paso
// 29 es el mismo minimo de JUEGO RAPIDO y PRUEBAS, el que no pega la descripcion de una fila al
// nombre de la siguiente.
// …y 96 desde el LOGO (12/10, el autor: "mas abajo"): el marco del fichin tapa el borde de arriba y el
// logo quedaba pegado al brillo del bisel. Hoy son CINCO filas (con MODO DEV): 96 + 4*29 + 20 = 232.
// …y 36 (13/10, el autor: "mas separacion entre los bloques resaltables"): el resalte mide 30 y con
// paso 29 se tocaban. 96 + 4*36 + 18 = 258.
// …y SIN MODO DEV LA LISTA BAJA UNA FILA (16/10, el autor, mirando el juego de verdad: "mira donde
// esta el rojo"). Las cuentas de arriba son con CINCO filas; el juego empaquetado tiene CUATRO (MODO
// DEV es solo de desarrollo) y SALIR quedaba con un hueco vacio abajo. Bajando una fila, la ultima cae
// donde cae en dev (96 + 4*36 = 132 + 3*36) y el logo se reacomoda solo en el hueco de arriba.
// …y SIN EL ROTULO «MODOS DE JUEGO» (16/10, el autor: "se explican solos") la lista sube 16.
// …y SIN DEV, 20 MAS ARRIBA (16/10, el autor: "demasiado espacio entre el primer punto y el logo"): la
// lista arranca donde arrancaba en dev, y abajo queda el aire que deja la fila de MODO DEV que no esta.
export const MODE_ROWS = { y0: DEV ? 80 : 96, rh: 36 };
/** Los rangos verticales de cada fila del menu principal tal como se dibujaron ({a, b} en coordenadas de
 *  mundo): con las filas compactas la altura depende de cual esta marcada. Lo lee el toque de game.js. */
export const MODE_HIT = [];

// EL LOGO (12/10, el autor): el SVG que diseño — RASANTE, la linea, las tres estrellas y las Malvinas —
// reemplaza al texto en Kirana de la portada y del selector de modo. En el ambar de siempre (P.accent,
// escrito en el SVG). Salio de assets/rasante_logofinal.svg sin la placa que lo envolvia (venia con las
// letras CALADAS en un rectangulo blanco) y con el viewBox recortado al dibujo. Si no cargo, el texto
// de siempre: la portada nunca queda sin nombre.
//
// SE RECORTA SOLO AL CARGAR. Cada exportacion del SVG trae otra mesa de trabajo —la segunda llego con el
// lienzo al DOBLE de ancho y el logo en la mitad izquierda, y se dibujaba chico y corrido del centro—,
// asi que en vez de confiar en el viewBox se rasteriza una vez en grande, se mide lo opaco y se guarda
// SOLO eso. Cualquier exportacion nueva calza sola.
const LOGO = new Image();
let LOGO_C = null, LOGO_K = 0.214;   // el logo recortado (canvas) y su alto / ancho
LOGO.onload = () => {
  const nw = LOGO.naturalWidth || 300, nh = LOGO.naturalHeight || 150;
  const RW = 2400, RH = Math.round(RW * nh / nw);
  const c = document.createElement('canvas'); c.width = RW; c.height = RH;
  const g = c.getContext('2d'); g.drawImage(LOGO, 0, 0, RW, RH);
  const d = g.getImageData(0, 0, RW, RH).data;
  let x0 = RW, y0 = RH, x1 = -1, y1 = -1;
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
    if (d[(y * RW + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) return;   // vacio: queda el texto de respaldo
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  LOGO_C = document.createElement('canvas'); LOGO_C.width = w; LOGO_C.height = h;
  LOGO_C.getContext('2d').drawImage(c, x0, y0, w, h, 0, 0, w, h);
  LOGO_K = h / w;
};
LOGO.src = '../assets/ui/logo_rasante.svg';
const logoListo = () => !!LOGO_C;
/** El logo centrado en `cx`, con la BASE (el pie de las estrellas) en `yPie` y `ancho` px nativos. */
function drawLogo(cx, yPie, ancho) {
  const alto = ancho * LOGO_K;
  const s = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = true;   // vector: suave, no pixelado
  ctx.drawImage(LOGO_C, Math.round(cx - ancho / 2), Math.round(yPie - alto), ancho, alto);
  ctx.imageSmoothingEnabled = s;
}

// EL LOGO QUE VIAJA (16/10, el autor: "cuando entro a un submenu, el logo achicarlo y ponerlo a la
// derecha, con una transicion acorde"). Cada pantalla dice DONDE lo quiere (centro, pie, ancho) y el logo
// va hasta ahi en un fundido de posicion y tamaño: de la portada al menu se achica en el lugar, del menu a
// un submenu se va chico a la derecha, y al volver regresa al centro. Si la pantalla anterior no dibujaba
// logo (se viene del juego), aparece directo donde va. El reloj es de pared: el menu no tiene `dt`.
const LOGO_VIAJE = 9;   // rapidez del acercamiento (exponencial): ~0,35 s para llegar
let logoR = null, logoUltT = 0;
function logoHacia(cx, yPie, ancho, k = 1) {
  const ahora = performance.now();
  const dt = Math.min(0.1, (ahora - logoUltT) / 1000);
  if (!logoR || ahora - logoUltT > 250) logoR = { cx, yPie, ancho };
  else {
    const k = 1 - Math.exp(-dt * LOGO_VIAJE);
    logoR.cx += (cx - logoR.cx) * k; logoR.yPie += (yPie - logoR.yPie) * k; logoR.ancho += (ancho - logoR.ancho) * k;
  }
  logoUltT = ahora;
  // `k`: la pantalla que dibuja en la grilla de DISEÑO (320x180, la del avion) pasa 1/U — el logo guarda
  // su lugar en coordenadas nativas, asi el viaje entre una escala y otra no salta
  drawLogo(logoR.cx * k, logoR.yPie * k, logoR.ancho * k);
}
/** EL LOGO DE LOS SUBMENUS: chico, arriba a la derecha (alineado al borde derecho de las rayas, NW - 30). */
const LOGO_SUB = { ancho: 92, pie: 34, der: NW - 30 };
function tituloSub() {
  if (!logoListo()) { ctx.fillText(T('title'), NW / 2, 40); return; }
  logoHacia(LOGO_SUB.der - LOGO_SUB.ancho / 2, LOGO_SUB.pie, LOGO_SUB.ancho);
}

/** EL TITULO DE LOS MENUS con el logo, donde antes iba RASANTE en Kirana a `px` con la base en `yBase`:
 *  las LETRAS del logo quedan a la misma altura que las del texto (las estrellas cuelgan por debajo). */
function titulo(cx, yBase, px) {
  if (!logoListo()) { ctx.fillText(T('title'), cx, yBase); return; }
  const altoL = px * 1.24;                      // las letras son ~58% del logo y la mayuscula ~72% del cuerpo
  drawLogo(cx, yBase - px * 0.72 + altoL, altoL / LOGO_K);
}

export function drawTitle(w) {
  ctx.textAlign = 'center';
  if (logoListo()) logoHacia(NW / 2, 68, 230);
  else { ctx.fillStyle = P.accent; ctx.font = titleFont(34); ctx.fillText(T('title'), NW / 2, 62); }   // logotipo: Kirana
  // "BATALLA POR MALVINAS · ATLANTICO SUR · 1982", CHICO Y ABAJO, arriba del homenaje (12/10, el autor):
  // debajo del logo competia con el; aca es el contexto del homenaje, que es donde se lee.
  ctx.fillStyle = P.ink; ctx.globalAlpha = 0.55; ctx.font = '6px monospace';
  ctx.fillText(T('subtitle'), NW / 2, NH - 60); ctx.globalAlpha = 1;
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
  return f ? uiFont(f, TRY_PX[f] || 15, '') : filaFont(FILA_PX);
};
// LA LINEA DE DETALLE en Operation Napalm (FONTS.fila), "mas chica y con mas espacio" (autor, 13/10):
// cuerpo 12 en vez de 15 y aire entre letras. El espaciado entra en la MEDICION del resalte tambien,
// por eso las dos cosas pasan por `ponFila` y se apagan despues con `sacaFila`.
const FILA_PX = 10, FILA_ESPACIO = '1px';
function ponFila(i) { ctx.font = rowFont(i); ctx.letterSpacing = DESC_TRY ? '0px' : FILA_ESPACIO; }
function sacaFila() { ctx.letterSpacing = '0px'; }

/** El logotipo del selector de modo, mas chico que en la portada (autor, 3/10: "mas chico"). */
const MODE_TITULO_PX = 16;

export function drawModeSelect(w) {
  panel();
  const { y0: yLista } = MODE_ROWS;
  // EL MISMO AIRE ARRIBA Y ABAJO DEL LOGO (autor, 3/10): del borde de arriba a RASANTE, lo mismo
  // que de RASANTE a "ELEGI MODO DE JUEGO". Se mide con la fuente cargada —las alturas de Kirana y
  // GlimpR no son las del monospace de respaldo— y el logo se acomoda en el medio del hueco.
  // (el tope ya no es el rotulo «MODOS DE JUEGO», que se fue el 16/10: es el del primer nombre de la lista)
  ctx.font = menuFont(12);
  const topeRotulo = yLista - 14 - ctx.measureText(T('modeCampaign')).actualBoundingBoxAscent;
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(MODE_TITULO_PX);   // mismo logotipo que la portada
  if (logoListo()) {
    // EL LOGO, mas chico que en la portada, en el medio del hueco de arriba (mismo aire arriba y abajo)
    // 160 y no 130 (el autor, 12/10: "mas grande"): lo que entra en el hueco con aire arriba y abajo
    const anchoL = 160, altoL = anchoL * LOGO_K;
    logoHacia(NW / 2, Math.max(4, (topeRotulo - altoL) / 2) + altoL, anchoL);
  } else {
    const mt = ctx.measureText(T('title')), altoLogo = mt.actualBoundingBoxAscent + mt.actualBoundingBoxDescent;
    const aire = Math.max(0, (topeRotulo - altoLogo) / 2);
    ctx.fillText(T('title'), NW / 2, aire + mt.actualBoundingBoxAscent);
  }

  // opciones CHICAS, pegadas a la IZQUIERDA y centradas verticalmente. La ultima es SALIR.
  // el orden tiene que coincidir con MODES en game.js: la fila que se toca sale de ese indice
  // La lista es una DECISION, no un catalogo: historia o partida suelta. Los cuatro modos sin
  // guion (ciclo, patria, minutos sagrados, pasadas mortales) viven adentro de JUEGO RAPIDO.
  // ⚠️ ESTA LISTA Y `MODES` EN game.js SON LA MISMA LISTA EN DOS LADOS. Si divergen no explota
  // nada: el cursor se para en una fila y se dibuja otra — que es exactamente lo que paso al
  // agregar PRUEBAS (el cursor decia 'pruebas' y la pantalla resaltaba OPCIONES).
  const opts = [
    { name: T('modeCampaign'), desc: T('modeCampaignDesc') },
    { name: T('modeQuick'), desc: T('modeQuickDesc') },
    ...(DEV ? [{ name: T('modeDev'), desc: T('modeDevDesc') }] : []),   // solo en dev (core/dev.js)
    { name: T('modeOptions'), desc: T('modeOptionsDesc') },
    { name: T('modeQuit'), desc: T('modeQuitDesc'), quit: true },
  ];
  const { y0, rh } = MODE_ROWS, x = 40, PAD_X = 9;   // x deja lugar al cursor '>' fuera del recuadro

  // (el rotulo «MODOS DE JUEGO» y su raya se fueron el 16/10: las filas se explican solas)

  // LAS FILAS COMPACTAS, como en los submenus (16/10): el nombre solo, y la marcada se despliega y escribe
  // su descripcion a maquina. Las alturas se acumulan, y cada rango vertical se anota en MODE_HIT para que
  // el toque/clic (game.js `modeSelect`) caiga en la fila que se ve y no en una grilla fija.
  const clave = 'modo:' + w.modeSel, ahora = performance.now();
  if (clave !== selClave) { selClave = clave; selT0 = ahora; }
  const sDesde = (ahora - selT0) / 1000;
  const abre = Math.min(1, sDesde / DESPLIEGA_T), abreE = 1 - (1 - abre) * (1 - abre);
  const RH_C = Math.round(rh * 0.62);
  MODE_HIT.length = 0;
  let y = y0;
  for (let i = 0; i < opts.length; i++) {
    const on = i === w.modeSel;
    const hFila = on ? RH_C + (rh - RH_C) * abreE : RH_C;
    MODE_HIT.push({ a: y - 12, b: y - 12 + hFila });
    const col = opts[i].quit ? (on ? P.warn : '#7d6a63') : (on ? P.accent : P.body);
    if (on) {
      ctx.font = menuFont(12); const mn = ctx.measureText(opts[i].name), wn = mn.width;
      ponFila(i); const md = ctx.measureText(opts[i].desc), wd = md.width; sacaFila();
      const boxW = Math.max(wn, wd) + PAD_X * 2;
      // EL MISMO AIRE ARRIBA Y ABAJO (autor, 16/10): el recuadro va del tope del nombre al pie de la
      // descripcion con AIRE de cada lado — y mientras se despliega, crece con la fila.
      const AIRE = 4, arriba = y - mn.actualBoundingBoxAscent - AIRE;
      const lleno = (y + 14 + md.actualBoundingBoxDescent + AIRE) - arriba;
      const corto = (y + mn.actualBoundingBoxDescent + AIRE) - arriba;
      const altoBox = corto + (lleno - corto) * abreE;
      ctx.fillStyle = col; ctx.globalAlpha = 0.13;
      ctx.fillRect(x - PAD_X, arriba, boxW, altoBox); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.globalAlpha = 0.5;                 // filo izquierdo: ancla la fila
      ctx.fillRect(x - PAD_X, arriba, 2, altoBox); ctx.globalAlpha = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = col; ctx.font = 'bold 10px monospace';
      ctx.fillText('>', x - PAD_X - 9, y);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = col; ctx.font = menuFont(12);   // OtflagSans (la misma con la que se midio)
    ctx.fillText(opts[i].name, x, y);
    if (on && abre > 0.6) {                    // la descripcion, a maquina
      ctx.fillStyle = P.ink; ctx.globalAlpha = 0.9;
      ponFila(i);
      const n = Math.max(0, Math.floor((sDesde - DESPLIEGA_T * 0.6) * TIPEO_CPS));
      const txt = opts[i].desc.slice(0, n);
      ctx.fillText(txt, x, y + 14);
      if (n < opts[i].desc.length && Math.sin(ahora / 70) > -0.3) { ctx.globalAlpha = 0.8; px(x + ctx.measureText(txt).width + 1, y + 7, 4, 8, P.accent); }
      sacaFila();
    }
    ctx.globalAlpha = 1;
    y += hFila;
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
  tituloSub();

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


// ---------- MEJORAS DEL PICHON (sub-pantalla de OPCIONES) ----------
// TODO lo que toca al AVION en un solo lugar: las piruetas que inventó el Pichón y el puesto de
// piloto (mira, ejes, esquema de control). Antes estaba repartido entre una fila suelta de
// OPCIONES y ningún lado.
//
// POR QUE UNA PANTALLA APARTE y no una sección más de OPCIONES: las filas de allá miden 15 px y
// una línea, y de una pirueta hay que saber DOS cosas a la vez — qué hace y cómo se teclea. Eso no
// entra en un renglón. La tarjeta de la derecha es la pantalla entera: la lista es solo el índice.
//
// DOS BLOQUES porque son dos cosas distintas. Arriba lo que el Pichón le hizo al avión (y por eso
// lleva su voz); abajo las preferencias de la persona que lo vuela. El Pichón no inventó el mouse.
//
// La lista de arriba son LAS DOCE, siempre: esta pantalla es la referencia (qué hace cada una y
// cómo se teclea) y el interruptor. Lo que el Pichón te dio HASTA AHORA se cuenta en EL BANCO,
// entre misión y misión — acá no hay nada que elegir.
const MEJ_GEO = { y0: 112, rh: 14, view: 10 };
const MEJ_CARD = { x: 250, w: 200, y: 100, h: 142 };

export function drawMejoras(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(26);
  tituloSub();

  const x = 40, xv = MEJ_CARD.x - 16;    // borde derecho de los valores de la lista
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(13);
  ctx.fillText(T('mejTitle'), x, 86);
  ctx.strokeStyle = '#3a464c'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(x, 91.5); ctx.lineTo(NW - 30, 91.5); ctx.stroke();
  ctx.globalAlpha = 1;

  const { y0, rh, view } = MEJ_GEO, n = w.rows.length;
  const top = optScroll(w.sel, n, view);
  const vis = Math.min(view, n - top);

  for (let v = 0; v < vis; v++) {
    const i = top + v, r = w.rows[i], y = y0 + v * rh;
    if (r.head) {
      ctx.textAlign = 'left'; ctx.fillStyle = P.accent; ctx.globalAlpha = 0.85;
      ctx.font = labelFont(9);
      ctx.fillText(r.head, x, y);
      const wh = ctx.measureText(r.head).width;
      ctx.globalAlpha = 0.25; ctx.strokeStyle = P.accent;
      ctx.beginPath(); ctx.moveTo(x + wh + 8, y - 3.5); ctx.lineTo(xv, y - 3.5); ctx.stroke();
      ctx.globalAlpha = 1;
      continue;
    }
    const on = i === w.sel;
    if (on) {
      ctx.fillStyle = P.accent; ctx.globalAlpha = 0.13;
      ctx.fillRect(x - 9, y - 9, xv - x + 15, 13); ctx.globalAlpha = 1;
      ctx.fillStyle = P.accent; ctx.globalAlpha = 0.5;
      ctx.fillRect(x - 9, y - 9, 2, 13); ctx.globalAlpha = 1;
    }
    ctx.textAlign = 'left'; ctx.fillStyle = on ? P.accent : P.body; ctx.font = menuFont(10);
    ctx.fillText(r.label, x, y);
    // EL SWITCH. Las de prender/apagar se pintan por color —encendido en el acento del juego,
    // apagado en gris— porque el estado tiene que leerse SIN leer la palabra: con doce filas, lo
    // que se busca de un vistazo es cuál está en gris. Las de escala (RETICULO, HORIZONTE) usan
    // el `< valor >` de siempre; no son un interruptor y no pueden fingir serlo.
    ctx.textAlign = 'right'; ctx.font = menuFont(10);
    ctx.fillStyle = r.sw ? (r.swOn ? (on ? P.accent : P.foam) : '#5c6a70') : (on ? P.ink : P.dim);
    ctx.fillText(on ? '< ' + r.value + ' >' : r.value, xv, y);
    if (r.preview === 'mira') {
      const wv = ctx.measureText(on ? '< ' + r.value + ' >' : r.value).width;
      drawMira(r.raw, xv - wv - 12, y - 3.5, 13, on ? 1 : 0.55);
    }
  }

  if (n > view) {
    const bx = MEJ_CARD.x - 8, by = y0 - 10, bh = view * rh;
    px(bx, by, 2, bh, '#2e3c45');
    const th = Math.max(8, Math.round(bh * view / n));
    px(bx, by + Math.round((bh - th) * (top / (n - view))), 2, th, P.accent);
  }

  drawMejCard(w.rows[w.sel]);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(6);
  ctx.fillText(T('mejKeys'), NW / 2, NH - 14);
}

/** La tarjeta de la derecha: qué hace la fila marcada y cómo se ejecuta. Todo lo que no entra en
 *  el renglón de la izquierda vive acá — incluida la voz del Pichón, que es la razón por la que
 *  esta pantalla no es una lista de casillas. */
function drawMejCard(r) {
  const { x, w: cw, y, h } = MEJ_CARD;
  ctx.globalAlpha = 0.06; ctx.fillStyle = P.body;
  ctx.fillRect(x, y, cw, h); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#3a464c'; ctx.strokeRect(x + 0.5, y + 0.5, cw, h);
  if (!r || !r.card) return;

  const px0 = x + 12, maxW = cw - 24;
  ctx.textAlign = 'left';
  ctx.fillStyle = P.accent; ctx.font = menuFont(12);
  ctx.fillText(r.card.name, px0, y + 20);
  ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.moveTo(px0, y + 26.5); ctx.lineTo(x + cw - 12, y + 26.5); ctx.stroke();
  ctx.globalAlpha = 1;

  let yy = y + 40;
  ctx.fillStyle = P.dim; ctx.globalAlpha = 0.7; ctx.font = labelFont(7);
  ctx.fillText(T('mejWhat'), px0, yy); ctx.globalAlpha = 1;
  ctx.fillStyle = P.body; ctx.font = descFont(10);
  yy = wrapText(r.card.desc, px0, yy + 12, maxW, 11) + 5;

  ctx.fillStyle = P.dim; ctx.globalAlpha = 0.7; ctx.font = labelFont(7);
  ctx.fillText(T('mejHowto'), px0, yy); ctx.globalAlpha = 1;
  ctx.fillStyle = P.foam; ctx.font = descFont(10);
  yy = wrapText(r.card.seq, px0, yy + 12, maxW, 11) + 4;

  // LA VOZ. Va al pie y apagada porque no es información de la opción: es de quién salió. Solo la
  // tienen las piruetas — el puesto de piloto no lo inventó nadie.
  if (r.card.quote) {
    ctx.fillStyle = P.dim; ctx.globalAlpha = 0.8; ctx.font = descFont(9);
    wrapText('"' + r.card.quote + '"', px0, Math.max(yy + 6, y + h - 34), maxW, 10);
    ctx.globalAlpha = 1;
  }
}


// ---------- MENU DE HISTORIA (submenu del modo campaña) ----------
// Mismo lenguaje que el selector de modos: coordenadas NATIVAS, filas a la izquierda con nombre
// grande + descripcion, resalte ajustado al contenido. Los nombres de campaña son PROPIOS
// (data/campaigns.js) y no se traducen.
export const CAMP_ROWS = { y0: 96, rh: 37, headH: 22 };   // 37: aire entre resaltes (13/10)

// texto de cada fila segun su id (los nombres de campaña son PROPIOS y no se traducen)
function campText(r) {
  if (r.back) return { name: T('menuBack'), desc: T(r.sub ? 'campAtrasDesc' : 'menuBackDesc') };
  // LAS DOS PUERTAS de HISTORIA (16/10): cada una dice que hay adentro
  if (r.id === 'secCampanas') return { name: T('campSecCampanas'), desc: T('campCampanasDesc') };
  if (r.id === 'secLibro') return { name: T('campSecLibro'), desc: T('campLibroDesc') };
  if (r.id === 'continue') return { name: T('campContinue'), desc: T('campContinueDesc') };
  if (r.id === 'c1') return { name: CAMPAIGNS[0].name, desc: r.disabled ? T('campBloqueada') : T('campC1Desc') };
  // UNA SALIDA DEL LIBRO DE VUELO (16/10, el autor: "solo nombre"): la fila es el NOMBRE, y la marcada
  // se DESPLIEGA hacia abajo y escribe, a maquina, los tres datos por los que se la reconoce — el dia, la
  // hora (y de que) y el avion (`compacta`, ver drawRowMenu). La escuadrilla y el texto largo ya no van
  // aca: son del detalle de la mision, al entrar.
  if (r.id === 'libro') {
    const m = LIBRO_VUELO[r.k], av = PLANES.find(p => p.key === m.aviones[0].plane);
    return { name: m.name, desc: m.fecha + '  ·  ' + m.hora + ' ' + T('libroHora_' + m.horaQue) + '  ·  ' + (av ? av.name : ''),
      compacta: true };
  }
  return { name: CAMPAIGNS[1].name, desc: T('campC2Desc') + '  ·  ' + T('campSoon') };
}

// LA FILA ABIERTA (ver drawRowMenu): el texto largo va a cuerpo 10, en un ancho fijo, y su alto sale
// de cuantas lineas ocupa de verdad (medidas con la misma fuente, descFont(MAS_PX)).
const MAS_PX = 10, MAS_LH = 11, MAS_W = NW - 90;
function masLineas(txt) {
  const words = String(txt).split(' '); let line = '', n = 1;
  for (const wd of words) {
    if (ctx.measureText(line + wd).width > MAS_W && line) { n++; line = wd + ' '; } else line += wd + ' ';
  }
  return n;
}
/** Cuanto se estira una fila abierta: el renglon de la escuadrilla y las lineas del texto, con aire. */
function masAlto(mas) {
  const f = ctx.font; ctx.font = descFont(MAS_PX);          // se mide con la fuente con que se dibuja
  const h = 14 + masLineas(mas.texto) * MAS_LH + 2;
  ctx.font = f; return h;
}

/** LISTA DE FILAS de un submenu (HISTORIA, JUEGO RAPIDO). Es UNA sola funcion y no dos copiadas:
 *  los dos submenus son la misma pantalla con otro contenido, y tenerla partida en dos garantizaba
 *  que la proxima vez que se toque el resalte queden distintos. `textOf` traduce fila → textos. */
// EL DESPLIEGUE de la fila compacta (16/10): cuanto tarda en abrirse y a que velocidad se escribe el detalle
const DESPLIEGA_T = 0.22, TIPEO_CPS = 55;
let selClave = '', selT0 = 0;
function drawRowMenu(w, titleKey, textOfBase, geo) {
  // TODAS LAS FILAS COMPACTAS (16/10, el autor: "el mismo efecto de los puntos del libro de vuelo en el
  // resto de los menues, y en ATRAS tambien"): el nombre solo, y la marcada se despliega y escribe su
  // descripcion a maquina. La excepcion es la fila con `mas` (un texto largo que se abre entero).
  const textOf = r => { const t = textOfBase(r); if (t && !t.mas && t.desc) t.compacta = true; return t; };
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(26);
  tituloSub();

  const { y0, rh, headH } = geo || CAMP_ROWS, x = 40, PAD_X = 9;
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(13);
  ctx.fillText(T(titleKey), x, y0 - 22);
  ctx.strokeStyle = '#3a464c'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(x, y0 - 17.5); ctx.lineTo(NW - 30, y0 - 17.5); ctx.stroke();
  ctx.globalAlpha = 1;

  // las filas se apilan con ALTURAS DISTINTAS (un encabezado ocupa menos que una entrada), asi
  // que la Y se acumula en vez de calcularse por indice: es lo que deja que CONTINUAR entero
  // desaparezca sin dejar el hueco.
  // VENTANA: con `view` la lista se desliza (el catalogo de PRUEBAS son 27 filas y en 270 px de
  // alto entran siete). Sin `view` se dibuja entera, que es lo que hacen HISTORIA y JUEGO RAPIDO.
  // …y LA FILA ABIERTA (13/10, el autor: "el detalle de la mision deberia empujar las misiones de
  // abajo [...] abajo se pierde, no se relaciona con lo que esta resaltado"): una fila con `mas` se
  // ABRE debajo cuando esta marcada —la escuadrilla y el texto largo, adentro del mismo resalte— y
  // empuja a las de abajo. Por eso la ventana se arma con las ALTURAS de verdad y no por cantidad:
  // arranca donde la marcada entra entera y sigue hasta donde da la pantalla.
  // LA FILA COMPACTA (16/10): solo el nombre; la marcada se despliega en DESPLIEGA_T y escribe su detalle a
  // maquina. El reloj se reinicia cada vez que el cursor cambia de fila (o de pantalla).
  const clave = titleKey + ':' + w.sel + ':' + w.rows.length, ahora = performance.now();
  if (clave !== selClave) { selClave = clave; selT0 = ahora; }
  const sDesde = (ahora - selT0) / 1000;
  const abre = Math.min(1, sDesde / DESPLIEGA_T), abreE = 1 - (1 - abre) * (1 - abre);
  const RH_C = geo && geo.rhC ? geo.rhC : Math.round(rh * 0.62);
  const alto = i => {
    const r = w.rows[i];
    if (r.head) return headH;
    const t = textOf(r);
    if (t.compacta) return i === w.sel ? RH_C + (rh - RH_C) * abreE : RH_C;
    return rh + (i === w.sel && t.mas ? masAlto(t.mas) : 0);
  };
  const cap = (geo && geo.view) || w.rows.length, TOPE = NH - 14;
  let i0 = cap >= w.rows.length ? 0 : Math.max(0, Math.min(w.rows.length - cap, w.sel - Math.floor(cap / 2)));
  const hasta = (a, b) => { let h = 0; for (let k = a; k <= b; k++) h += alto(k); return h; };
  while (i0 < w.sel && y0 + hasta(i0, w.sel) - rh + 20 > TOPE) i0++;
  let iN = i0, yy = y0;
  while (iN < w.rows.length && iN - i0 < cap) {
    const h = alto(iN);
    if (iN > w.sel && yy + h - (w.rows[iN].head ? 0 : rh) + 20 > TOPE) break;
    yy += h; iN++;
  }

  let y = y0;
  for (let i = i0; i < iN; i++) {
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
    const t = textOf(r), on = i === w.sel;
    // deshabilitada: gris SIEMPRE, aun con el cursor encima — el resalte dice "estas aca",
    // el gris dice "no vas a poder entrar" (confirmar da el beep grave).
    // ATRAS usa los colores de SALIR del menu principal: las dos son la puerta de salida de su
    // pantalla, y que se pinten igual es lo que las hace reconocibles sin leerlas.
    const col = r.disabled ? '#5a666c' : r.back ? (on ? P.warn : '#7d6a63') : on ? P.accent : P.body;
    const extra = on && t.mas ? masAlto(t.mas) : 0;
    // la compacta: el resalte mide lo que la fila mide AHORA (crece con el despliegue)
    const hFila = t.compacta ? alto(i) : rh;
    if (on) {
      ctx.font = menuFont(12); const wn = ctx.measureText(t.name).width;
      ponFila(i); const wd = ctx.measureText(t.desc).width; sacaFila();
      const boxW = extra ? MAS_W + PAD_X * 2 : Math.max(wn, wd) + PAD_X * 2;
      const boxH = t.compacta ? hFila - (rh - 30) : 30 + extra;
      ctx.fillStyle = col; ctx.globalAlpha = 0.13;
      ctx.fillRect(x - PAD_X, y - 12, boxW, boxH); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.globalAlpha = 0.5;
      ctx.fillRect(x - PAD_X, y - 12, 2, boxH); ctx.globalAlpha = 1;
      ctx.textAlign = 'left'; ctx.fillStyle = col; ctx.font = 'bold 10px monospace';
      ctx.fillText('>', x - PAD_X - 9, y);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = col; ctx.font = menuFont(12);
    ctx.fillText(t.name, x, y);
    ctx.fillStyle = r.disabled ? '#4a565c' : on ? P.ink : P.dim; ctx.globalAlpha = on ? 0.9 : 0.6;
    // LA MISMA fuente de descripcion que el selector de modos (rowFont, hoy filaFont): los
    // submenus se leian con la tipografia de rotulo y quedaban como otra pantalla de otro juego.
    // Se usa para MEDIR arriba y para DIBUJAR aca — si los dos lados no coinciden, el resalte
    // de la fila deja de calzar con el texto.
    ponFila(i);
    if (!t.compacta) ctx.fillText(t.desc, x, y + 14);
    // la compacta escribe su detalle A MAQUINA cuando ya se abrio, y solo si esta marcada
    else if (on && abre > 0.6) {
      const n = Math.max(0, Math.floor((sDesde - DESPLIEGA_T * 0.6) * TIPEO_CPS));
      const txt = t.desc.slice(0, n);
      ctx.fillText(txt, x, y + 14);
      if (n < t.desc.length && Math.sin(ahora / 70) > -0.3) { ctx.globalAlpha = 0.8; px(x + ctx.measureText(txt).width + 1, y + 7, 4, 8, P.accent); }
    }
    sacaFila();
    ctx.globalAlpha = 1;
    if (extra) {                                 // LA FILA ABIERTA: la escuadrilla y el texto largo
      ctx.font = labelFont(8); ctx.fillStyle = P.dim;
      ctx.fillText(t.mas.sub, x, y + 30);
      ctx.font = descFont(MAS_PX); ctx.fillStyle = P.foam;
      wrapText(t.mas.texto, x, y + 42, MAS_W, MAS_LH);
    }
    y += t.compacta ? hFila : rh + extra;
  }

  // SIGUE: las dos marcas que dicen que la lista no termina donde termina la pantalla. Sin esto
  // una lista con ventana miente — parece completa y hay catorce momentos abajo que no existen.
  ctx.textAlign = 'right'; ctx.fillStyle = P.dim; ctx.globalAlpha = 0.55; ctx.font = '7px monospace';
  if (i0 > 0) ctx.fillText('^ ' + i0, NW - 30, y0 - 4);
  if (iN < w.rows.length) ctx.fillText('v ' + (w.rows.length - iN), NW - 30, y + 2);
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

// CON EL LIBRO DE VUELO son ocho filas (dos encabezados, la campaña, cuatro salidas y ATRAS) y al
// pie va la descripcion de la salida marcada: no entran con el paso de 34. Mismo paso que PRUEBAS
// (29) y ventana de SEIS, que es la cuenta de siempre — la sexta descripcion cierra en ~232 y el pie
// arranca en 240.
export const LIBRO_ROWS = { y0: 84, rh: 34, headH: 18, view: 8 };   // 34: aire entre resaltes (13/10); la fila abierta decide cuantas entran
export function drawCampMenu(w) {
  const conLibro = w.rows.some(r => r.id === 'libro');
  // el rotulo dice en que nivel de HISTORIA estas: la raiz, o adentro de una de sus dos puertas
  const titulo = w.vista === 'campanas' ? 'campSecCampanas' : w.vista === 'libro' ? 'campSecLibro' : 'campTitle';
  drawRowMenu(w, titulo, campText, conLibro ? LIBRO_ROWS : CAMP_ROWS);
  // (la descripcion de la salida ya no va al pie: se abre adentro de su fila, ver drawRowMenu)
}

// ---------- ELEGI TU AVION (LIBRO DE VUELO) ----------
// Despues del contexto: una fila por avion de los que volaron esa salida —su chapa y su tipo— con la
// carga que llevaba debajo, y a la derecha el avion. No se elige carga aparte: la carga ES la de ese
// dia (data/libro_vuelo.js), y si una salida tuvo dos, son dos filas.
function libroAvText(m) {
  return r => {
    const a = m.aviones[r.i], pl = PLANES.find(p => p.key === a.plane);
    return { name: a.chapa + '  ·  ' + (pl ? pl.name : a.plane), desc: a.cargaTxt };
  };
}
export const LIBRO_AV_ROWS = { y0: 108, rh: 34, headH: 18 };
export function drawLibroAvion(w) {
  const m = w.m, rows = m.aviones.map((a, i) => ({ i }));
  drawRowMenu({ sel: w.sel, rows, t: w.t }, 'libroElegir', libroAvText(m), LIBRO_AV_ROWS);
  // LA SALIDA, arriba de la lista: nombre, dia y hora, y la escuadrilla
  ctx.textAlign = 'left'; ctx.font = menuFont(11); ctx.fillStyle = P.foam;
  ctx.fillText(m.name + '   ·   ' + m.fecha + '  ·  ' + m.hora, 40, LIBRO_AV_ROWS.y0 - 36);
  // EL AVION, a la derecha: la misma ilustracion del selector de los modos sueltos
  const a = m.aviones[w.sel], pl = a && PLANES.find(p => p.key === a.plane);
  if (pl && pl.ready) {
    const PW = 170, PH = Math.round(PW * pl.h / pl.w);
    ctx.drawImage(pl.img, NW - PW - 24, Math.round(150 - PH / 2 + Math.sin(w.t * 1.6) * 2), PW, PH);
  }
  ctx.font = labelFont(8); ctx.fillStyle = P.dim;
  ctx.fillText(m.escuadrilla, 40, NH - 26);
  ctx.font = descFont(9);
  ctx.fillText(T('libroPie', { n: m.cfg.squad }), 40, NH - 14);
}

// ---------- JUEGO RAPIDO (submenu de los modos sueltos) ----------
// Los cuatro modos que se juegan sin guion. PASADAS MORTALES es el banco de pruebas de la fase
// PASADA, igual que MINUTOS SAGRADOS lo es del ARENA: se entra DERECHO al climax, sin pasillo.
function quickText(r) {
  if (r.back) return { name: T('menuBack'), desc: T('menuBackDesc') };
  if (r.id === 'cycle') return { name: T('modeCycle'), desc: T('modeCycleDesc') };
  if (r.id === 'survival') return { name: T('modeSurvival'), desc: T('modeSurvivalDesc') };
  if (r.id === 'persec') return { name: T('modePersec'), desc: T('modePersecDesc') };
  if (r.id === 'arena') return { name: T('modeArena'), desc: T('modeArenaDesc') };
  // las cuatro del MODO DEV: los mismos rotulos que tenian en el menu principal
  if (r.id === 'pruebas') return { name: T('modePruebas'), desc: T('modePruebasDesc') };
  if (r.id === 'cines') return { name: T('modeCines'), desc: T('modeCinesDesc') };
  if (r.id === 'maniobras') return { name: T('modeManiobras'), desc: T('modeManiobrasDesc') };
  if (r.id === 'misiones') return { name: T('modeMisiones'), desc: T('modeMisionesDesc') };
  return { name: T('modePasada'), desc: T('modePasadaDesc') };
}
// JUEGO RAPIDO tiene GEOMETRIA PROPIA, y es por una cuenta: con la entrada de PERSECUCION son SEIS
// filas, y con el paso de la campaña (y0 96, rh 34) la ultima cae en y=266 — su descripcion, que va
// 14 px mas abajo, se sale de los 270 de alto de la pantalla. Apretando a rh 29 y subiendo el
// arranque, la sexta termina en 255 y el resalte cierra en 261. La campaña conserva su paso porque
// sus filas llevan encabezados de seccion y ahi el aire hace falta.
export const QUICK_ROWS = { y0: 92, rh: 36, headH: 20 };   // 36: aire entre resaltes (13/10)
export function drawQuickMenu(w) { drawRowMenu(w, w.dev ? 'devTitle' : 'quickTitle', quickText, QUICK_ROWS); }

// ---------- PRUEBAS (el catalogo de momentos, COMO_PROBAR §4) ----------
// Los textos de cada momento vienen en la propia fila (`titulo`/`desc` de data/pruebas.js): a
// diferencia de los otros dos submenus, este no traduce sus entradas — son rotulos de una
// herramienta de autor, como los nombres de campaña. El MARCO (titulo, ATRAS) si esta traducido.
function pruebaText(r) {
  if (r.back) return { name: T('menuBack'), desc: T('menuBackDesc') };
  return { name: r.titulo, desc: r.desc };
}
// GEOMETRIA PROPIA otra vez, y por la misma cuenta de siempre: son 27 filas. El paso es el MISMO
// que el de JUEGO RAPIDO (rh 29), que es el minimo con el que la descripcion de una fila no se
// pega al nombre de la siguiente — con rh 26 entraba una fila mas y se leia como un bloque solo.
// La cuenta del peor caso, con un encabezado adentro de la ventana: 84 + 18 + 4×29 = 218 para la
// sexta, su descripcion en 232 y el resalte cerrando en 238, dentro de los 270 de alto.
export const PRUEBA_ROWS = { y0: 84, rh: 34, headH: 18, view: 5 };
export function drawPruebasMenu(w) { drawRowMenu(w, 'pruebasTitle', pruebaText, PRUEBA_ROWS); }

// ---------- CINEMATICAS (el catalogo del DIRECTOR, PLAN_DIRECTOR_CINEMATICAS §5) ----------
// La puerta hermana de PRUEBAS, y con la misma mecanica: titulo + detalle por fila y ENTER la
// reproduce. La diferencia esta en de donde sale la lista — no hay un catalogo escrito a mano,
// se deriva de las timelines de data/cines.js. Una cinematica nueva aparece sola.
//
// Tampoco se traducen las entradas (mismo criterio que PRUEBAS): son rotulos de herramienta de
// autor. El MARCO —titulo de la pantalla y ATRAS— si esta en los dos idiomas.
function cineText(r) {
  if (r.back) return { name: T('menuBack'), desc: T('menuBackDesc') };
  return { name: r.titulo, desc: r.desc };
}
// MISMA GEOMETRIA que PRUEBAS, a proposito: son la misma herramienta con dos catalogos, y que se
// muevan igual es lo que hace que se sientan la misma puerta.
export function drawCinesMenu(w) { drawRowMenu(w, 'cinesTitle', cineText, PRUEBA_ROWS); }

// ---------- EL MENU MANIOBRAS (PLAN_MANIOBRAS_FASES) ----------
// Dos pantallas con la MISMA geometria que PRUEBAS y CINEMATICAS, por la misma razon de siempre:
// son la misma herramienta con otro catalogo, y que se muevan igual es lo que hace que se sientan
// la misma puerta. La primera lista las piruetas; la segunda, las tres presentaciones de la que
// elegiste — y lleva su nombre en el rotulo, para que no haya que acordarse de que se apreto.
function mvText(r) {
  // el ATRAS de las variantes vuelve UN nivel (a la lista), no al menu principal — y el renglon
  // tiene que decir a donde va: un "volver al menu principal" que no vuelve ahi es una mentira
  // chica que igual se paga en confianza.
  if (r.back) return { name: T('menuBack'), desc: T(r.volver || 'menuBackDesc') };
  return { name: r.titulo, desc: r.desc };
}
export function drawManiobrasMenu(w) { drawRowMenu(w, 'mvTitle', mvText, PRUEBA_ROWS); }
export function drawMvVarsMenu(w) {
  drawRowMenu(w, 'mvVarsTitle', mvText, PRUEBA_ROWS);
  // EL NOMBRE DE LA MANIOBRA, abajo de todo: el mismo lugar donde el selector de misiones pone la
  // libreta. Es contexto —"esto es de lo que estamos hablando"— y no una fila elegible.
  if (!w.mv) return;
  ctx.textAlign = 'left'; ctx.font = labelFont(8); ctx.fillStyle = P.dim;
  ctx.fillText(T('mvTitle').split('·')[0].trim(), 40, NH - 30);
  ctx.font = descFont(11); ctx.fillStyle = P.accent;
  ctx.fillText(w.mv.titulo + '   ·   ' + w.mv.desc, 40, NH - 18);
}

// ---------- EL SELECTOR DE MISIONES (PLAN_MISIONES_FASES §1, fase S1) ----------
// La herramienta: la campaña entera listada, y ENTER vuela ESA mision sola. Igual que el catalogo
// de PRUEBAS, las entradas NO se traducen: son los nombres y las fechas de data/missions.js, que
// es donde ya viven. El marco (rotulo, ATRAS, el pie del toggle) si esta en los dos idiomas.
//
// La descripcion de cada fila dice las tres cosas por las que uno elige una mision para probarla:
// CUANDO pasa, CONTRA QUE se vuela y COMO termina. El climax sale de `climaxOf` —la misma funcion
// que consulta el juego— y no de una tabla aparte: si una mision cambia de desenlace, esta lista
// lo dice sola.
function misionText(r) {
  if (r.back) return { name: T('menuBack'), desc: T('menuBackDesc') };
  const m = MISSIONS[r.i], cl = climaxOf(m);
  const blanco = m.goal.kind === 'ship' ? m.goal.ship : m.goal.meters + ' m';
  return {
    name: (r.i + 1) + '.  ' + m.name,
    desc: m.date + '   ·   ' + blanco + '   ·   ' + (cl ? cl.toUpperCase() : T('misClimaxNo')),
  };
}
// LA LIBRETA DE LA FILA ELEGIDA: con que piruetas se va a volar esa mision. Va abajo de todo y
// solo de la fila con el cursor —no en cada renglon— porque es un dato de PREPARACION, no de
// eleccion: no se elige una mision POR su loadout, pero antes de apretar ENTER hay que saber con
// que avion se sale. Es ademas la mitad visible de "real real": el numero de al lado dice cuantas
// de las doce se ganaron a esa altura de la campaña.
function drawLoadout(i) {
  const ids = loadoutAt(i);
  ctx.textAlign = 'left'; ctx.font = labelFont(8);
  ctx.fillStyle = P.dim;
  ctx.fillText(T('misLibreta', { n: ids.length, m: BANCO.length }), 40, NH - 30);
  ctx.font = descFont(9); ctx.fillStyle = ids.length ? P.foam : P.ink;
  // los nombres completos no entran (doce mejoras de hasta 15 caracteres): va la lista corta y,
  // pasadas unas cuantas, se corta con puntos suspensivos — el numero de arriba dice el total.
  const nombres = ids.map(id => (BANCO.find(u => u.id === id) || {}).name || id);
  let txt = nombres.length ? nombres.join(' · ') : T('misLibretaVacia');
  while (txt.length > 88 && nombres.length > 1) { nombres.pop(); txt = nombres.join(' · ') + ' …'; }
  ctx.fillText(txt, 40, NH - 19);
}
// GEOMETRIA: son 12 misiones + ATRAS, sin encabezados, con el mismo paso de 29 que PRUEBAS y
// JUEGO RAPIDO. La ventana es de SEIS y la cuenta es de las que hay que hacer con la captura
// puesta al lado: con siete, la septima fila cae en 84 + 6×29 = 258 y su DESCRIPCION —que va 14 px
// mas abajo— aterriza en 272, fuera de los 270 de alto, encima del pie del toggle. Con seis, la
// ultima cierra en 229, su descripcion en 243, y abajo queda el aire del [H].
// El PIE crecio de una linea a TRES (la libreta: rotulo + lista, y abajo el toggle), asi que la
// ventana baja de seis filas a CINCO. La cuenta, otra vez con la captura al lado: con seis, la
// sexta descripcion aterriza en 243 y el rotulo de la libreta arranca en 240 — se superponen, y
// se ve (se vio: la fila 8 quedo escrita encima de "LIBRETA DEL PICHON"). Con cinco, la ultima
// descripcion cierra en 214 y quedan 26 px de aire antes del pie.
export const MIS_ROWS = { y0: 84, rh: 34, headH: 18, view: 5 };
export function drawMisionesMenu(w) {
  drawRowMenu(w, 'misTitle', misionText, MIS_ROWS);
  // EL MODO DE APERTURA, al pie y siempre visible. Va afuera de drawRowMenu —y no como una fila
  // mas de la lista— porque no es algo que se ELIJA de la lista: es COMO va a arrancar lo que
  // elijas, y una fila que no se puede confirmar en el medio de doce que si, se lee como un error.
  ctx.textAlign = 'left';
  // EL MODO: los tres se listan SIEMPRE y se resalta el activo, en vez de mostrar solo el vigente.
  // Un toggle que cicla y solo canta su estado obliga a apretarlo para descubrir que mas hay; con
  // los tres a la vista se sabe de antemano cuantas veces hay que apretar y a donde se llega.
  const modos = ['juego', 'cine', 'ambas', 'radio'];
  let mx = 40;
  ctx.font = descFont(9);
  ctx.fillStyle = P.dim; ctx.globalAlpha = 0.7;
  ctx.fillText(T('misModoLbl'), mx, NH - 8);
  mx += ctx.measureText(T('misModoLbl')).width + 8;
  for (const m of modos) {
    const on = m === w.modo, txt = T('misModo_' + m);
    ctx.fillStyle = on ? P.accent : P.dim;
    ctx.globalAlpha = on ? 1 : 0.55;
    ctx.fillText(on ? '[' + txt + ']' : ' ' + txt + ' ', mx, NH - 8);
    mx += ctx.measureText(on ? '[' + txt + ']' : ' ' + txt + ' ').width + 6;
  }
  ctx.globalAlpha = 1;
  const r = w.rows[w.sel];
  if (r && !r.back) drawLoadout(r.i);
}

// una fila de partida guardada: 'EL CUADERNO DE MATEO · MISION 2 · 1234 PTS · 05/08 21:33'
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
  tituloSub();
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
  // EL SUBTITULO CAMBIA CON LA CANTIDAD DE CARTAS. Con una sola no hay nada que elegir — el
  // Pichon te la pasa — y decir "ELEGI UNA MEJORA" arriba de una carta unica es pedirle al jugador
  // que busque la segunda opcion que no existe. Es la primera pantalla de banco de la campaña
  // (epilogo de m2) y ahi lo que tiene que entender es QUE ES esto, no que decida.
  ctx.fillText(T(w.offer.length > 1 ? 'upgSub' : 'upgSub1'), NW / 2, 86);
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
    // las CHAFITAS no son un combo: se sueltan con su tecla
    ctx.fillText(u.tecla ? T('upgTecla') + ' ' + u.tecla : T('upgCombo') + ' ' + u.seq, x + 12, y + 46);
    ctx.fillText('"' + u.quote + '"', x + 12, y + 58);
    ctx.textAlign = 'center';
  }
  if (Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.dim; ctx.font = descFont(11); ctx.textAlign = 'center';
    // con UNA sola carta el pie no puede seguir diciendo "flechas: elegir": no hay segunda opcion
    // y el jugador la busca. Es la pantalla del epilogo de m2, que es la primera vez que ve esto.
    ctx.fillText(T(w.offer.length > 1 ? 'modeHint' : 'upgHint1'), NW / 2, NH - 14);
  }
}

// EL HANGAR (estado 'carga', PLAN_NAFTA_ALCANCE N7): despues del briefing y antes de despegar, desde
// M3. Tres tarjetas, una por carga elegible. Los numeros los arma game.js (`w.rows`) — el dibujo no
// sabe de nafta: lee lo que le pasan. `sinChancha` marca las cargas que dependen de ella cuando la
// mision no la tiene: es la frase del briefing de M10 convertida en un renglon rojo.
export function drawCarga(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(24);
  ctx.fillText(T('cargaTitle'), NW / 2, 40);
  ctx.fillStyle = P.body; ctx.font = labelFont(12);
  ctx.fillText(T('cargaSub'), NW / 2, 62);
  const x = 52, wCard = NW - 104, hCard = 50, y0 = 76;
  for (let i = 0; i < w.rows.length; i++) {
    const r = w.rows[i], y = y0 + i * (hCard + 8), on = i === w.sel;
    ctx.globalAlpha = on ? 0.16 : 0.06; ctx.fillStyle = on ? P.accent : P.body;
    ctx.fillRect(x, y, wCard, hCard); ctx.globalAlpha = 1;
    ctx.strokeStyle = on ? P.accent : '#3a464c'; ctx.strokeRect(x + 0.5, y + 0.5, wCard, hCard);
    ctx.textAlign = 'left';
    if (on) { ctx.fillStyle = P.accent; ctx.font = 'bold 12px monospace'; ctx.fillText('>', x - 16, y + 22); }
    ctx.fillStyle = on ? P.accent : P.body; ctx.font = menuFont(12);
    ctx.fillText(r.nombre, x + 12, y + 17);
    ctx.textAlign = 'right'; ctx.fillStyle = P.dim; ctx.font = labelFont(9);
    ctx.fillText(r.datos, x + wCard - 10, y + 17);
    ctx.textAlign = 'left'; ctx.fillStyle = P.body; ctx.font = descFont(10);
    ctx.fillText(r.desc, x + 12, y + 32);
    if (r.aviso) { ctx.fillStyle = P.warn; ctx.font = labelFont(9); ctx.fillText(r.aviso, x + 12, y + 45); }
  }
  // LA BOMBA DEL BUQUE de hoy, con su dato curioso (data/bombas.js): no se elige — la trae la fecha
  if (w.bomba) {
    ctx.textAlign = 'center'; ctx.fillStyle = P.dim; ctx.font = labelFont(9);
    ctx.fillText(w.bomba, NW / 2, y0 + w.rows.length * (hCard + 8) + 1);
  }
  if (Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.dim; ctx.font = descFont(11); ctx.textAlign = 'center';
    ctx.fillText(T('modeHint'), NW / 2, w.bomba ? NH - 4 : NH - 14);   // con la ficha de la bomba, mas abajo
  }
  ctx.textAlign = 'left';
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
