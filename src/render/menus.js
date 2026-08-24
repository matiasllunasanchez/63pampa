// MENUS: seleccion de modo, seleccion de avion y el menu de configuracion de mapa [M].
//
// Igual que las demas pantallas: reciben `w`, un snapshot chico de solo lectura. No leen estado
// global ni lo modifican — la seleccion la maneja el input; aca solo se dibuja.
import { ctx, DW as W, DH as H, W as NW, H as NH, px, panel, titleFont, menuFont, descFont, labelFont, uiFont, wrapText, FONT_OTHERS } from './ctx.js';
import { drawMira } from './miras.js';
import { P } from '../data/palette.js';
import { PLANES } from '../data/planes.js';
import { T, getLang } from '../core/i18n.js';
import { CAMPAIGNS } from '../data/campaigns.js';
import { MISSIONS, climaxOf } from '../data/missions.js';
import { UPGRADES, loadoutAt } from '../data/upgrades.js';
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
    : w.gameMode === 'arena' ? T('modeArena')
    : w.gameMode === 'pasadas' ? T('modePasada') : T('modeSurvival'), W / 2, 35);
  ctx.fillStyle = P.dim; ctx.font = labelFont(9);                  // rotulo de seccion: GlimpRThin
  ctx.fillText(T('selTitle'), W / 2, 50);

  // preview del avión elegido, con leve cabeceo.
  //
  // EL SUAVIZADO NO ES UNA PREFERENCIA: depende de cuanto hay que achicar la imagen.
  // La preview se dibuja a PW unidades de DISEÑO, que en el buffer son PW x 3 (U 1.5 x SC 2 = 3
  // exacto, ver ctx.js). Con PW = 130 eso da 390 px reales. Entonces:
  //
  //   ancho del asset multiplo EXACTO de 390 (390, 780…) → vecino mas cercano: pixel art nitido.
  //   cualquier otro ancho (hoy son de 977)              → suavizado, o el reescalado por 2.5
  //                                                        tira filas y columnas desparejas y el
  //                                                        avion sale dentado y sucio.
  //
  // Se decide sola a proposito: las previews se van a rehacer a 390 (ver AVIONES_CATALOGO.md
  // "Generar las ILUSTRACIONES del roster"), y van a entrar de a una. Con un flag global habria
  // que acordarse de darlo vuelta el dia exacto en que entra la ultima; asi cada avion se dibuja
  // como le corresponde desde el momento en que su archivo cambia.
  //
  // (Antes esto no fijaba nada y heredaba el suavizado del dibujo anterior: el mismo menu se
  // veia distinto segun de que pantalla venias.)
  const PW = 130, PX_REAL = PW * 3;
  const pl = PLANES[w.selPlane];
  if (pl.ready) {
    const PH = Math.round(PW * pl.h / pl.w);
    const smooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = !(pl.w % PX_REAL === 0);
    ctx.drawImage(pl.img, Math.round(W / 2 - PW / 2), Math.round(80 - PH / 2 + Math.sin(w.t * 1.6) * 2), PW, PH);
    ctx.imageSmoothingEnabled = smooth;
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
// …y con CINEMATICAS son SIETE: con y0 78 / rh 31 la ultima caia en 264 y "Cerrar el juego"
// quedaba cortada abajo (se vio en la captura). La cuenta del peor caso es `y0 + 6*rh + 20 <= 270`
// —el 20 es lo que baja el resalte por debajo del nombre—: 72 + 174 + 20 = 266, adentro. El paso
// 29 es el mismo minimo de JUEGO RAPIDO y PRUEBAS, el que no pega la descripcion de una fila al
// nombre de la siguiente.
export const MODE_ROWS = { y0: 72, rh: 29 };

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
  // La lista es una DECISION, no un catalogo: historia o partida suelta. Los cuatro modos sin
  // guion (ciclo, patria, minutos sagrados, pasadas mortales) viven adentro de JUEGO RAPIDO.
  // ⚠️ ESTA LISTA Y `MODES` EN game.js SON LA MISMA LISTA EN DOS LADOS. Si divergen no explota
  // nada: el cursor se para en una fila y se dibuja otra — que es exactamente lo que paso al
  // agregar PRUEBAS (el cursor decia 'pruebas' y la pantalla resaltaba OPCIONES).
  const opts = [
    { name: T('modeCampaign'), desc: T('modeCampaignDesc') },
    { name: T('modeQuick'), desc: T('modeQuickDesc') },
    { name: T('modePruebas'), desc: T('modePruebasDesc') },
    { name: T('modeCines'), desc: T('modeCinesDesc') },
    { name: T('modeMisiones'), desc: T('modeMisionesDesc') },
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
  ctx.fillText(T('title'), NW / 2, 40);

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
export const CAMP_ROWS = { y0: 96, rh: 34, headH: 22 };

// texto de cada fila segun su id (los nombres de campaña son PROPIOS y no se traducen)
function campText(r) {
  if (r.back) return { name: T('menuBack'), desc: T('menuBackDesc') };
  if (r.id === 'continue') return { name: T('campContinue'), desc: T('campContinueDesc') };
  if (r.id === 'c1') return { name: CAMPAIGNS[0].name, desc: T('campC1Desc') };
  return { name: CAMPAIGNS[1].name, desc: T('campC2Desc') + '  ·  ' + T('campSoon') };
}

/** LISTA DE FILAS de un submenu (HISTORIA, JUEGO RAPIDO). Es UNA sola funcion y no dos copiadas:
 *  los dos submenus son la misma pantalla con otro contenido, y tenerla partida en dos garantizaba
 *  que la proxima vez que se toque el resalte queden distintos. `textOf` traduce fila → textos. */
function drawRowMenu(w, titleKey, textOf, geo) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(26);
  ctx.fillText(T('title'), NW / 2, 40);

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
  const view = (geo && geo.view) || w.rows.length;
  const i0 = view >= w.rows.length ? 0 : Math.max(0, Math.min(w.rows.length - view, w.sel - Math.floor(view / 2)));
  const iN = Math.min(w.rows.length, i0 + view);

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
    if (on) {
      ctx.font = menuFont(12); const wn = ctx.measureText(t.name).width;
      ctx.font = rowFont(i); const wd = ctx.measureText(t.desc).width;
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
    // LA MISMA fuente de descripcion que el selector de modos (rowFont, hoy descFont): los
    // submenus se leian con la tipografia de rotulo y quedaban como otra pantalla de otro juego.
    // Se usa para MEDIR arriba y para DIBUJAR aca — si los dos lados no coinciden, el resalte
    // de la fila deja de calzar con el texto.
    ctx.font = rowFont(i);
    ctx.fillText(t.desc, x, y + 14);
    ctx.globalAlpha = 1;
    y += rh;
  }

  // SIGUE: las dos marcas que dicen que la lista no termina donde termina la pantalla. Sin esto
  // una lista con ventana miente — parece completa y hay catorce momentos abajo que no existen.
  ctx.textAlign = 'right'; ctx.fillStyle = P.dim; ctx.globalAlpha = 0.55; ctx.font = '7px monospace';
  if (i0 > 0) ctx.fillText('^ ' + i0, NW - 30, y0 - 4);
  if (iN < w.rows.length) ctx.fillText('v ' + (w.rows.length - iN), NW - 30, y + 2);
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

export function drawCampMenu(w) { drawRowMenu(w, 'campTitle', campText); }

// ---------- JUEGO RAPIDO (submenu de los modos sueltos) ----------
// Los cuatro modos que se juegan sin guion. PASADAS MORTALES es el banco de pruebas de la fase
// PASADA, igual que MINUTOS SAGRADOS lo es del ARENA: se entra DERECHO al climax, sin pasillo.
function quickText(r) {
  if (r.back) return { name: T('menuBack'), desc: T('menuBackDesc') };
  if (r.id === 'cycle') return { name: T('modeCycle'), desc: T('modeCycleDesc') };
  if (r.id === 'survival') return { name: T('modeSurvival'), desc: T('modeSurvivalDesc') };
  if (r.id === 'persec') return { name: T('modePersec'), desc: T('modePersecDesc') };
  if (r.id === 'arena') return { name: T('modeArena'), desc: T('modeArenaDesc') };
  return { name: T('modePasada'), desc: T('modePasadaDesc') };
}
// JUEGO RAPIDO tiene GEOMETRIA PROPIA, y es por una cuenta: con la entrada de PERSECUCION son SEIS
// filas, y con el paso de la campaña (y0 96, rh 34) la ultima cae en y=266 — su descripcion, que va
// 14 px mas abajo, se sale de los 270 de alto de la pantalla. Apretando a rh 29 y subiendo el
// arranque, la sexta termina en 255 y el resalte cierra en 261. La campaña conserva su paso porque
// sus filas llevan encabezados de seccion y ahi el aire hace falta.
export const QUICK_ROWS = { y0: 92, rh: 29, headH: 20 };
export function drawQuickMenu(w) { drawRowMenu(w, 'quickTitle', quickText, QUICK_ROWS); }

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
export const PRUEBA_ROWS = { y0: 84, rh: 29, headH: 18, view: 6 };
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
  ctx.fillText(T('misLibreta', { n: ids.length, m: UPGRADES.length }), 40, NH - 30);
  ctx.font = descFont(9); ctx.fillStyle = ids.length ? P.foam : P.ink;
  // los nombres completos no entran (doce mejoras de hasta 15 caracteres): va la lista corta y,
  // pasadas unas cuantas, se corta con puntos suspensivos — el numero de arriba dice el total.
  const nombres = ids.map(id => (UPGRADES.find(u => u.id === id) || {}).name || id);
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
export const MIS_ROWS = { y0: 84, rh: 29, headH: 18, view: 5 };
export function drawMisionesMenu(w) {
  drawRowMenu(w, 'misTitle', misionText, MIS_ROWS);
  // EL TOGGLE DE HISTORIA, al pie y siempre visible. Va afuera de drawRowMenu —y no como una fila
  // mas de la lista— porque no es algo que se ELIJA: es el modo en que va a arrancar lo que elijas,
  // y una fila que no se puede confirmar en el medio de doce que si, se lee como un error.
  ctx.textAlign = 'left'; ctx.font = descFont(9);
  ctx.fillStyle = w.hist ? P.accent : P.dim; ctx.globalAlpha = w.hist ? 0.95 : 0.7;
  ctx.fillText(T(w.hist ? 'misHistOn' : 'misHistOff'), 40, NH - 8);
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
    ctx.fillText(T('upgCombo') + ' ' + u.seq, x + 12, y + 46);
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
