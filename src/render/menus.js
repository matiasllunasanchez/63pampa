// MENUS: seleccion de modo, seleccion de avion y el menu de configuracion de mapa [M].
//
// Igual que las demas pantallas: reciben `w`, un snapshot chico de solo lectura. No leen estado
// global ni lo modifican — la seleccion la maneja el input; aca solo se dibuja.
import * as glifos from './glifos.js';
import { DEV } from '../core/dev.js';
import { ctx, U, DW as W, DH as H, W as NW, H as NH, px, panel, titleFont, menuFont, descFont, labelFont, uiFont, wrapText, FONT_OTHERS, filaFont, rotuloChicoFont } from './ctx.js';
import { drawMira } from './miras.js';
import { P } from '../data/palette.js';
import { PLANES, UNIDADES } from '../data/planes.js';
import { T, getLang } from '../core/i18n.js';
import { CAMPAIGNS } from '../data/campaigns.js';
import { MISSIONS, climaxOf } from '../data/missions.js';
import { LIBRO_VUELO, LIBRO_PROXIMAS } from '../data/libro_vuelo.js';
import { TUTORIAL_ETAPAS } from '../data/tutorial.js';
import { BANCO, loadoutAt } from '../data/upgrades.js';
import { fmtDate } from '../systems/saves.js';
import { iconoDe, ICONO_FW, ICONO_COLS, ICONOS } from '../data/iconos_cartas.js';
import { capacidadesDe } from '../data/perfiles.js';
import { CTRL_CATEGORIAS } from '../data/controles.js';
import { MOVES, COMBO, COMBO_PAD } from '../data/moves.js';
import { caraDe } from '../data/voces_cartas.js';
import { descTrozos, descPlano } from '../data/desc_iconos.js';
import { iconoEn } from './iconos.js';
import { retrato, silueta } from './retratos.js';
import { drawMando } from './mando.js';

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

  // EL AVION, quieto y FLOTANDO (16/10, el autor: "deja de moverlos, que floten nomas" — las hojas
  // animadas no salian bien). La ilustracion de siempre a 1:1 (390 px = 130 de diseño, sin suavizar); el
  // HERCULES, mas grande, con su ilustracion horneada a 588 (196 de diseño, tambien 1:1): se tiene que
  // notar que es otro tamaño de avion, y estirado se pixelaba.
  const pl = PLANES[w.selPlane];
  const cx = L.colX + L.colW / 2;
  // LA GRANDE (16/10, el autor: "aprovechar el espacio y agrandar los aviones"): todos tienen su ilustracion
  // horneada a 495 px (165 de diseño a 1:1; el Hercules a 540, 180) — mas grandes sin estirar nada
  // LA FRANJA DE LA FUERZA primero (ver `franjaFuerza`): el avion se centra en lo que queda libre debajo
  const pieFranja = franjaFuerza(pl, L.x, L.ficha.y, L.ficha.x - 8 - L.x);
  const img = selGrande(pl);
  const ilus = img && img.complete && img.naturalWidth ? img : pl.ready ? pl.img : null;
  if (ilus) {
    const PW = ilus.naturalWidth / 3, PH = ilus.naturalHeight / 3;
    const smooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    // (17/10, el autor: "que no lo tape el cuadro… centralo en el contenido libre que tiene"): centrado entre el
    // pie de la franja y el pie de la ficha
    const ya = (pieFranja + L.ficha.y + L.ficha.h) / 2 - PH / 2 + Math.sin(w.t * 1.3) * 1.5;
    // BLOQUEADO (prod, 17/11): en gris, apagado, con el candado arriba — se recorre pero no se elige
    if (w.bloqueado) { ctx.save(); ctx.filter = 'grayscale(1) brightness(0.55)'; ctx.globalAlpha = 0.35; }
    ctx.drawImage(ilus, cx - PW / 2, ya, PW, PH);
    if (w.bloqueado) ctx.restore();
    ctx.imageSmoothingEnabled = smooth;
    if (w.bloqueado) candado(cx, ya + PH / 2 - 4, T('avionBloqueado'));
  }
  // flechas de seleccion (parpadean), a los costados del avion
  ctx.textAlign = 'center';
  ctx.fillStyle = Math.sin(w.t * 6) > 0 ? P.ink : P.dim; ctx.font = 'bold 13px monospace';
  // PEGADAS AL AVION (16/10, el autor): a los costados de lo que se ve, no en el borde de la columna — la
  // ilustracion trae aire a los lados, asi que se cuelgan del 80% de su ancho
  const PWa = ilus ? ilus.naturalWidth / 3 : L.colW, dxa = PWa * 0.4 + 6;
  const ay = ilus ? (pieFranja + L.ficha.y + L.ficha.h) / 2 + 4 : L.avionY + 4;   // a media altura del avion
  ctx.fillText('<', cx - dxa, ay); ctx.fillText('>', cx + dxa, ay);

  // LA FICHA DEL AVION (a la derecha): el marco y su rotulo. El contenido —cifras, historia, carga— llega
  // con su propio item; hoy el lugar queda armado y con la linea del avion de respaldo.
  const F = L.ficha;
  ctx.fillStyle = '#0a0f12'; ctx.globalAlpha = 0.55; ctx.fillRect(F.x, F.y, F.w, F.h); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#3a464c'; ctx.lineWidth = 0.6; ctx.strokeRect(F.x + 0.5, F.y + 0.5, F.w - 1, F.h - 1); ctx.lineWidth = 1;
  // EL NOMBRE COMPLETO encabeza la ficha (16/10, el autor: "el nombre donde esta FICHA DEL AVION")
  const nombre = (pl.nombre && (pl.nombre[getLang()] || pl.nombre.es)) || pl.name;
  // LA FRANJA DE LA FUERZA (17/10, el autor: "un cuadro tipo franja horizontal que muestre el escudo, diga de que
  // fuerza es, y debajo el detalle"): arriba de la columna del avion, a la altura del tope de la ficha. El
  // escudo a 1:1 (tools/escudos.py), al lado el nombre de la fuerza y debajo su detalle (data/planes.js
  // UNIDADES). Antes el escudo iba solo y el texto comun del Fenix se repetia en la ficha de cada avion.
  ctx.textAlign = 'left'; ctx.fillStyle = P.accent; ctx.font = menuFont(9);
  ctx.fillText(nombre, F.x + 6, F.y + 11, F.w - 12);
  // la linea corta del avion (lo que es en el juego) y abajo SU HISTORIA: de donde salio, que se le hizo y
  // como se uso en la guerra (`ficha` en data/planes.js; si un avion no la trae, queda la linea sola)
  ctx.font = labelFont(6);
  let lx = F.x + 6;
  ctx.fillStyle = P.dim;
  ctx.fillText((pl.desc[getLang()] || pl.desc.es).toUpperCase(), lx, F.y + 21, F.x + F.w - 6 - lx);
  const ficha = pl.ficha && (pl.ficha[getLang()] || pl.ficha.es);
  FICHA_INFO.max = 0;
  {   // (la ficha de la guerra puede faltar; la CONFIGURACION se dice siempre)
    // en JOSEFIN SANS (16/10, el autor: "otra font mas comoda de leer"): la de esténcil en mayusculas no se leia
    ctx.fillStyle = P.foam; ctx.font = rotuloChicoFont(5.8);   // (17/11, el autor: mas chica)
    // SE DESPLAZA (16/10, el autor: "las flechas arriba/abajo van en el texto de la derecha; si es largo, una
    // flecha arriba o abajo tipo barra para leerlo completo"): se parte en renglones, se ven los que entran y
    // `w.scroll` (las flechas, en game.js) dice desde cual. Si no entra entero, la barra a la derecha.
    // EL PIE DE LA FICHA es la CONFIGURACION (13/11, el autor: "como footer debajo de la descripcion, el texto
    // por detras, y que el scroll deje ver todo"): el texto corre por detras del pie, pero el desplazamiento se
    // cuenta hasta el borde de arriba del pie — el ultimo renglon siempre se puede subir hasta verse entero
    const LH = 7.2, y0 = F.y + 31, anchoT = F.w - 18, fondo = F.y + F.h - FICHA_PIE;
    const lineas = ficha ? renglones(ficha, anchoT).map(t => ({ t })) : [];
    const caben = Math.floor((fondo - 4 - y0) / LH) + 1;
    FICHA_INFO.max = Math.max(0, lineas.length - caben);
    const desde = Math.max(0, Math.min(FICHA_INFO.max, w.scroll | 0));
    // (el recorte termina en el pie: lo que no entra no se pinta encima de los iconos — se baja con el scroll)
    ctx.save(); ctx.beginPath(); ctx.rect(F.x, F.y + 24, F.w, fondo - 2 - (F.y + 24)); ctx.clip();
    for (let i = 0; i < caben + 2 && desde + i < lineas.length; i++) {
      const l = lineas[desde + i];
      ctx.fillStyle = l.rot ? P.accent : P.foam;
      ctx.fillText(l.t, F.x + 6, y0 + i * LH);
    }
    ctx.restore();
    ctx.fillStyle = P.foam;
    if (FICHA_INFO.max > 0) {
      const bx = F.x + F.w - 6, top = F.y + 30, bot = fondo - 3;
      ctx.fillStyle = '#2e3c45'; ctx.fillRect(bx - 0.5, top + 6, 1, bot - top - 12);   // el riel
      const alto = (bot - top - 12) * caben / lineas.length, pos = (bot - top - 12 - alto) * desde / FICHA_INFO.max;
      ctx.fillStyle = P.accent; ctx.fillRect(bx - 1, top + 6 + pos, 2, alto);       // la barra
      const fl = (y, abajo, on) => { ctx.fillStyle = on ? P.accent : '#3a464c'; ctx.beginPath();
        if (abajo) { ctx.moveTo(bx - 2.5, y - 2); ctx.lineTo(bx + 2.5, y - 2); ctx.lineTo(bx, y + 1.5); }
        else { ctx.moveTo(bx - 2.5, y + 2); ctx.lineTo(bx + 2.5, y + 2); ctx.lineTo(bx, y - 1.5); }
        ctx.fill(); };
      fl(top + 2, false, desde > 0); fl(bot - 1, true, desde < FICHA_INFO.max);
    }
  }

  // LA CONFIGURACION DEL AVION (13/11, el autor: "un panel separado, con iconos y un hover"): una tira de
  // iconos debajo del avion — los dibujos de las cartas —, con su rotulo corto y, al pasar el mouse, el detalle
  panelCapacidades(pl, { x: L.ficha.x + 1, y: L.ficha.y + L.ficha.h - FICHA_PIE, w: L.ficha.w - 2, h: FICHA_PIE - 1 }, w.mouse);

  // PIE: una sola linea de teclas (mitad de cuerpo: es ayuda, no contenido)
  ctx.textAlign = 'center'; ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(4.5);
  ctx.fillText(T('selKeys'), W / 2, H - 6);
}
/** EL CANDADO de un avion bloqueado (prod): arco y cuerpo, centrado en (cx, cy), con su rotulo debajo. */
function candado(cx, cy, txt) {
  ctx.save();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(cx, cy - 6, 5.5, Math.PI, 0); ctx.lineTo(cx + 5.5, cy - 1); ctx.moveTo(cx - 5.5, cy - 6); ctx.lineTo(cx - 5.5, cy - 1); ctx.stroke();
  ctx.fillStyle = '#0a0f12'; ctx.fillRect(cx - 9, cy - 1, 18, 14);
  ctx.fillStyle = P.ink; ctx.fillRect(cx - 8, cy, 16, 12);
  ctx.fillStyle = '#0a0f12'; ctx.fillRect(cx - 1, cy + 3, 2, 5);
  ctx.textAlign = 'center'; ctx.font = labelFont(7); ctx.fillStyle = P.ink;
  ctx.fillText(txt, cx, cy + 24);
  ctx.restore();
}
/** Un rotulo corto centrado en `cx`: si no entra en `ancho`, en DOS renglones partido en el espacio mas cercano
 *  al medio (con la fuente activa). */
function rotulo2(txt, cx, y, ancho) {
  if (ctx.measureText(txt).width <= ancho || txt.indexOf(' ') < 0) { ctx.fillText(txt, cx, y, ancho); return; }
  const mid = txt.length / 2;
  let corte = -1;
  for (let i = 0; i < txt.length; i++) if (txt[i] === ' ' && (corte < 0 || Math.abs(i - mid) < Math.abs(corte - mid))) corte = i;
  ctx.fillText(txt.slice(0, corte), cx, y, ancho);
  ctx.fillText(txt.slice(corte + 1), cx, y + 3.4, ancho);
}
/** El alto del pie de la ficha: la tira de la CONFIGURACION. */
const FICHA_PIE = 24;
/** La tira de capacidades del avion `pl` (data/perfiles.js capacidadesDe) en el rectangulo `R` (el pie de la
 *  ficha), con el texto de la historia corriendo por detras. `m` = el mouse en la grilla de diseño ({x, y, on}). */
function panelCapacidades(pl, R, m) {
  const caps = capacidadesDe(pl, getLang());
  if (!caps.length) return;
  // el fondo del pie, casi opaco: lo que corre por detras se adivina, no se lee encima de los iconos
  ctx.fillStyle = '#0a0f12'; ctx.globalAlpha = 0.9; ctx.fillRect(R.x, R.y, R.w, R.h); ctx.globalAlpha = 1;
  ctx.fillStyle = '#3a464c'; ctx.fillRect(R.x + 3, R.y, R.w - 6, 0.6);   // la raya que lo separa del texto
  const paso = (R.w - 4) / caps.length, S = Math.min(10, paso - 3), yI = R.y + 2;
  // EL FOCO (13/11, el autor: "que el item se corra hacia la izquierda y a la derecha la seccion de texto; cuando
  // se quita el foco vuelve al listado normal"): con el mouse sobre el pie, la pieza que queda debajo — contada
  // con las posiciones de la lista normal, asi moverse por el pie va pasando de una a otra — se dibuja sola a la
  // izquierda y su detalle a la derecha, adentro del mismo pie. Sin mouse encima, la lista.
  let sobre = -1;
  if (m && m.on && m.x >= R.x && m.x <= R.x + R.w && m.y >= R.y && m.y <= R.y + R.h)
    sobre = Math.max(0, Math.min(caps.length - 1, Math.floor((m.x - R.x - 2) / paso)));
  const icono = (c, x, y, tam) => {
    if (!(CARTAS_IMG.complete && CARTAS_IMG.naturalWidth)) return;
    const n = Math.max(0, ICONOS.indexOf(c.icono)), sx = (n % ICONO_COLS) * ICONO_FW, sy = Math.floor(n / ICONO_COLS) * ICONO_FW;
    const suave = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = true;   // 96 → 11: achicado, no pixelado
    // lo que NO tiene: en gris y apagado, sin tachar (13/11, el autor: "con baja opacidad solamente se entiende")
    if (!c.ok) { ctx.filter = 'grayscale(1)'; ctx.globalAlpha = 0.35; }
    ctx.drawImage(CARTAS_IMG, sx, sy, ICONO_FW, ICONO_FW, x, y, tam, tam);
    ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = suave;
  };
  if (sobre >= 0) {
    const c = caps[sobre], ancho = 22;
    ctx.fillStyle = P.accent; ctx.globalAlpha = 0.2; ctx.fillRect(R.x + 1, R.y + 1, ancho, R.h - 1.5); ctx.globalAlpha = 1;
    icono(c, Math.round(R.x + 1 + ancho / 2 - S / 2), yI, S);
    ctx.textAlign = 'center'; ctx.font = labelFont(3.2); ctx.fillStyle = P.accent;
    rotulo2(c.r, R.x + 1 + ancho / 2, yI + S + 3.6, ancho - 1);
    ctx.textAlign = 'left'; ctx.fillStyle = P.foam; ctx.font = rotuloChicoFont(5.2);
    const lineas = renglones(c.t, R.w - ancho - 7).slice(0, 3), LH = 6;
    const y0 = R.y + R.h / 2 - (lineas.length * LH) / 2 + 4.3;
    lineas.forEach((l, k) => ctx.fillText(l, R.x + ancho + 4, y0 + k * LH));
    return;
  }
  caps.forEach((c, i) => {
    const cx = R.x + 2 + paso * (i + 0.5);
    icono(c, Math.round(cx - S / 2), yI, S);
    ctx.textAlign = 'center'; ctx.font = labelFont(3.2); ctx.fillStyle = c.ok ? P.foam : '#5d6a70';
    rotulo2(c.r, cx, yI + S + 3.6, paso - 1);
  });
}
/** LA FRANJA DE LA FUERZA del avion `pl` en (x, y), de ancho `w`: fondo como el de la ficha, el escudo a la
 *  izquierda y a su derecha el nombre de la fuerza (naranja el Fenix, acento los demas) y el detalle. */
function franjaFuerza(pl, x, y, w) {
  const id = pl.escuadron || pl.arma, U_ = UNIDADES[id];
  if (!U_) return y;
  const lang = getLang(), esc = escudo(id), hay = !!(esc && esc.complete && esc.naturalWidth);
  const ew = hay ? esc.naturalWidth / 3 : 0, eh = hay ? esc.naturalHeight / 3 : 0;
  const tx = x + 4 + (hay ? ew + 5 : 0), tw = x + w - 4 - tx;
  // el detalle de la unidad (el Fenix) o, si no tiene, cuantos hubo y cuantos se perdieron de este avion
  const det = (U_.detalle && (U_.detalle[lang] || U_.detalle.es)) || (pl.guerra && (pl.guerra[lang] || pl.guerra.es));
  ctx.font = rotuloChicoFont(3.9);   // letra chica (el autor; 17/11: mas chica todavia)
  const lineas = det ? renglones(det, tw) : [];
  const LH = 4.5, h = Math.max(eh + 6, 11 + lineas.length * LH);
  ctx.fillStyle = '#0a0f12'; ctx.globalAlpha = 0.55; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
  ctx.strokeStyle = '#3a464c'; ctx.lineWidth = 0.6; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); ctx.lineWidth = 1;
  if (hay) {
    const smooth = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
    ctx.drawImage(esc, x + 4, y + (h - eh) / 2, ew, eh);
    ctx.imageSmoothingEnabled = smooth;
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = id === 'fenix' ? '#e77a1a' : P.accent; ctx.font = menuFont(6);
  ctx.fillText(U_.nombre[lang] || U_.nombre.es, tx, y + 8, tw);
  ctx.fillStyle = P.foam; ctx.font = rotuloChicoFont(3.9);
  lineas.forEach((l, i) => ctx.fillText(l, tx, y + 13.5 + i * LH));
  return y + h;
}
/** LOS ESCUDOS de la ficha (assets/ui/escudo_<id>.png, los arma tools/escudos.py): se piden una vez. Las
 *  rutas van escritas enteras porque tools/build_web.py las embebe buscando el texto. */
const RUTA_ESCUDO = { fenix: '../assets/ui/escudo_fenix.png', faa: '../assets/ui/escudo_faa.png', armada: '../assets/ui/escudo_armada.png' };
const ESCUDOS = {};
function escudo(id) {
  if (!RUTA_ESCUDO[id]) return null;
  if (!ESCUDOS[id]) { ESCUDOS[id] = new Image(); ESCUDOS[id].src = RUTA_ESCUDO[id]; }
  return ESCUDOS[id];
}
/** Hasta donde se puede desplazar la ficha que se dibujo (renglones de mas): game.js acota las flechas con esto. */
export const FICHA_INFO = { max: 0 };
/** Parte `txt` en renglones que entran en `ancho` con la fuente activa. */
function renglones(txt, ancho) {
  const out = []; let linea = '';
  for (const p of String(txt).split(' ')) {
    if (linea && ctx.measureText(linea + ' ' + p).width > ancho) { out.push(linea); linea = p; }
    else linea = linea ? linea + ' ' + p : p;
  }
  if (linea) out.push(linea);
  return out;
}
/** La ilustracion GRANDE del avion que se dibuja al doble (el Hercules): seleccion_grande.png, al lado de
 *  la de siempre. Se pide la primera vez y queda en cache; mientras no carga, la normal. */
const SEL_GRANDE = new Map();
function selGrande(pl) {
  let im = SEL_GRANDE.get(pl.key);
  if (!im) { im = new Image(); im.src = pl.src.slice(0, pl.src.lastIndexOf('/') + 1) + 'seleccion_grande.png'; SEL_GRANDE.set(pl.key, im); }
  return im;
}
// ---------- LA DIFICULTAD (POR LA PATRIA y CICLO DE MUERTE, 16/10) ----------
// Una pantalla propia, DESPUES de elegir el avion (el autor: "una pantalla dedicada a la dificultad y
// listo"): las cuatro en lista, con la misma fila compacta que se despliega del resto de los menus, y la
// marcada muestra su escuadron DIBUJADO —un avioncito por vida— debajo de la lista.
export const DIF_ROWS = { y0: 92, rh: 34, headH: 18 };
export function drawDificultad(w) {
  const rows = [...w.difs.map((d, i) => ({ i })), { back: true }];
  const lang = getLang();
  drawRowMenu({ sel: w.sel, rows, t: w.t }, 'difElegir', r => r.back ? { name: T('menuBack'), desc: T('difAtras') }
    : { name: w.difs[r.i][lang] || w.difs[r.i].es, desc: w.difs[r.i].aviones === 1 ? T('difAvion') : T('difAviones', { n: w.difs[r.i].aviones }) }, DIF_ROWS);
  const d = w.difs[w.sel];
  if (!d) return;
  // EL ESCUADRON de la marcada, abajo: uno por vida, el que vuela en dorado
  const col = d.id === 'gloria' ? P.warn : P.accent, y = NH - 34;
  ctx.save(); ctx.scale(U, U);
  for (let i = 0; i < d.aviones; i++) avioncito(28 + i * 11, y / U, i === 0 ? col : P.ink, i === 0 ? 1 : 0.7);
  ctx.restore();
}

/** LA GEOMETRIA de la pantalla del avion (grilla de diseño 320x180). */
const AVION_UI = {
  x: 16, modoY: 26,
  colX: 2, colW: 184, avionY: 100, avionW: 112, grande: 2.1, nombreY: 112,
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
    { name: T('modeTutorial'), desc: T('modeTutorialDesc') },   // arriba de todo (17/11, PLAN_TUTORIAL.md)
    { name: T('modeCampaign'), desc: T('modeCampaignDesc') },
    { name: T('modeQuick'), desc: T('modeQuickDesc') },
    ...(DEV ? [{ name: T('modeDev'), desc: T('modeDevDesc') }] : []),   // solo en dev (core/dev.js)
    { name: T('modeAlbum'), desc: T('modeAlbumDesc'), badge: w.albumNuevos || 0 },   // EL ALBUM DE MALVINAS (22/11): las NUEVAS, en un circulo rojo
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
    // LA NOTIFICACION (22/11, el autor: "solo ALBUM y una notificacion roja: circulo rojo arriba a la derecha y un numero
    // blanco adentro con un poco de aire"): pegada a la esquina de arriba del nombre
    if (opts[i].badge > 0) {
      const mn = ctx.measureText(opts[i].name), num = String(Math.min(99, opts[i].badge));
      ctx.font = menuFont(8); const tw = ctx.measureText(num).width;
      const r = Math.max(5, tw / 2 + 2.5), bx = x + mn.width + r + 1, by = y - mn.actualBoundingBoxAscent + 1;
      ctx.fillStyle = '#e8321e'; ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(num, bx, by + 0.5);
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.font = menuFont(12);
    }
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
  yy = wrapText(descPlano(r.card.desc), px0, yy + 12, maxW, 11) + 5;

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
  // UNA ETAPA DEL TUTORIAL (data/tutorial.js): ETAPA n · nombre; la marcada dice que se aprende. SIN tilde de
  // HECHA (18/11, el autor). La que todavia no se abrio dice que hay que terminar la anterior.
  if (r.id === 'tut') {
    const m = TUTORIAL_ETAPAS[r.k];
    return { name: T('tutEtapa', { n: m.etapa }) + '  ·  ' + m.name,
      desc: r.disabled ? T('tutCerrada') : (getLang() === 'en' ? m.desc.en : m.desc.es), compacta: true };
  }
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
    // (la bloqueada, EN DESARROLLO como las que vienen: 23/11)
    if (r.disabled) return { name: m.name, marca: T('libroProximamente'), desc: m.fecha + '  ·  ' + T('libroEnDesarrollo'), compacta: true };
    return { name: m.name, desc: m.fecha + '  ·  ' + m.hora + ' ' + T('libroHora_' + m.horaQue) + '  ·  ' + (av ? av.name : ''),
      compacta: true };
  }
  // LAS QUE VIENEN (17/10): el nombre y, pegado a la fecha, EN DESARROLLO
  if (r.id === 'proxima') {
    const m = LIBRO_PROXIMAS[r.k], es = getLang() !== 'en';
    const f = m.fecha ? (es ? m.fecha.es : m.fecha.en) : T('libroSinFecha');
    return { name: es ? m.es : m.en, marca: T('libroProximamente'), desc: f + '  ·  ' + T('libroEnDesarrollo'), compacta: true };
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
  const cap = (geo && geo.view) || w.rows.length, TOPE = NH - ((geo && geo.tope) || 14);
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
    // LA MARCA CHICA al lado del nombre (17/11, el autor: las salidas en gris del libro dicen PROXIMAMENTE)
    if (t.marca) {
      const wn = ctx.measureText(t.name).width;
      ctx.font = labelFont(7); ctx.globalAlpha = 0.85;
      ctx.fillText(t.marca, x + wn + 6, y - 1);
      ctx.globalAlpha = 1;
    }
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
  const titulo = w.vista === 'campanas' ? 'campSecCampanas' : w.vista === 'libro' ? 'campSecLibro' : w.vista === 'tutorial' ? 'modeTutorial' : 'campTitle';
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
    // (con hora propia —dos salidas del mismo avion, el BELGRANO—: el dia y la hora antes de la carga)
    return { name: a.chapa + '  ·  ' + (pl ? pl.name : a.plane), desc: (a.hora ? (a.fecha || m.fecha) + ' · ' + a.hora + ' · ' : '') + a.cargaTxt };
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
  // …Y DEBAJO, QUE HACE ESE AVION EN LA SALIDA (autor, 13/11: "elegir entre los aviones que participaron,
  // con sus pros, contras y roles"): el papel, lo que tiene a favor y lo que tiene en contra. Solo si la
  // salida lo trae escrito (`papel`, `pro`, `contra` en data/libro_vuelo.js).
  if (a && (a.papel || a.pro || a.contra)) {
    const x = NW - 194, mw = 178;
    let y = 196;
    ctx.textAlign = 'left';
    if (a.papel) { ctx.font = labelFont(8); ctx.fillStyle = P.accent; y = wrapText(a.papel, x, y, mw, 10) + 2; }
    ctx.font = descFont(8);
    if (a.pro) { ctx.fillStyle = P.ink; y = wrapText('+ ' + a.pro, x, y, mw, 10); }
    if (a.contra) { ctx.fillStyle = P.warn; wrapText('- ' + a.contra, x, y, mw, 10); }
  }
  ctx.font = labelFont(8); ctx.fillStyle = P.dim;
  ctx.fillText(m.escuadrilla, 40, NH - 26);
  ctx.font = descFont(9);
  ctx.fillText(T('libroPie', { n: (a && a.squad) || m.cfg.squad }), 40, NH - 14);   // la escuadrilla del avion marcado
}

// ---------- JUEGO RAPIDO (submenu de los modos sueltos) ----------
// Los cuatro modos que se juegan sin guion. PASADAS MORTALES es el banco de pruebas de la fase
// PASADA, igual que MINUTOS SAGRADOS lo es del ARENA: se entra DERECHO al climax, sin pasillo.
function quickText(r) {
  if (r.back) return { name: T('menuBack'), desc: T('menuBackDesc') };
  if (r.id === 'cycle') return { name: T('modeCycle'), desc: T('modeCycleDesc') };
  if (r.id === 'survival') return { name: T('modeSurvival'), desc: T('modeSurvivalDesc') };
  if (r.id === 'persec') return { name: T('modePersec'), desc: T('modePersecDesc') };
  if (r.id === 'islas') return { name: T('modeIslas'), desc: T('modeIslasDesc') };
  if (r.id === 'arena') return { name: T('modeArena'), desc: T('modeArenaDesc') };
  // las cuatro del MODO DEV: los mismos rotulos que tenian en el menu principal
  if (r.id === 'pruebas') return { name: T('modePruebas'), desc: T('modePruebasDesc') };
  if (r.id === 'cines') return { name: T('modeCines'), desc: T('modeCinesDesc') };
  if (r.id === 'maniobras') return { name: T('modeManiobras'), desc: T('modeManiobrasDesc') };
  if (r.id === 'misiones') return { name: T('modeMisiones'), desc: T('modeMisionesDesc') };
  if (r.id === 'smallmusica') return { name: T('modeSmallMusica'), desc: T('modeSmallMusicaDesc') };
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
// (22/10, el autor: "falta mas espacio abajo"): eran 5 filas fijas y con las filas compactas quedaba media
// pantalla vacia. Ahora el tope lo pone la ALTURA (drawRowMenu corta en TOPE), con un techo de 11 filas.
export const PRUEBA_ROWS = { y0: 84, rh: 34, headH: 18, view: 11 };
// …y donde abajo va un renglon de contexto (las variantes de una maniobra), la lista corta antes
const PRUEBA_ROWS_PIE = { ...PRUEBA_ROWS, tope: 40 };
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
  drawRowMenu(w, 'mvVarsTitle', mvText, PRUEBA_ROWS_PIE);
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

// ---------- CONTROLES, POR CATEGORIAS (17/11, data/controles.js) ----------
// Una pestaña por categoria (◄ ►), y adentro una tabla corta: lo que hace · TECLADO · JOYSTICK, con las
// teclas en TECLAS DIBUJADAS (una cajita por alternativa) para que se lean de un vistazo. PIRUETAS es otra
// forma: el catalogo de maniobras en dos columnas, cada una con su combo. La comparten OPCIONES y la PAUSA:
// `w.tab` es la pestaña, `w.padTxt` traduce los botones al mando conectado, `w.velo` = sobre el juego.
export const CTRL_N = CTRL_CATEGORIAS.length;
/** Una tecla dibujada: el texto adentro de una cajita. Devuelve el ancho que ocupo. */
function teclaCaja(txt, xDer, y, on) {
  ctx.font = labelFont(8);
  const w = Math.ceil(ctx.measureText(txt).width) + 8, x = xDer - w;
  ctx.fillStyle = '#0d1418'; ctx.globalAlpha = 0.9; ctx.fillRect(x, y - 8, w, 11); ctx.globalAlpha = 1;
  ctx.strokeStyle = on ? P.accent : '#4c5b62'; ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y - 8.5, w - 1, 11);
  ctx.fillStyle = on ? P.foam : P.ink; ctx.textAlign = 'left';
  ctx.fillText(txt, x + 4, y);
  return w;
}
/** Los iconitos de la pestaña PIRUETAS: un teclado y un joystick, de 8x5, en el acento apagado. */
function iconoTeclado(x, y) {
  ctx.fillStyle = '#7d8f95'; ctx.fillRect(x, y, 8, 5);
  ctx.fillStyle = '#0b1013';
  for (let i = 0; i < 3; i++) ctx.fillRect(x + 1 + i * 2.2, y + 1, 1.2, 1);
  ctx.fillRect(x + 2, y + 3, 4, 1);
}
function iconoJoy(x, y) {
  ctx.fillStyle = '#7d8f95';
  ctx.fillRect(x + 1, y + 1, 7, 3); ctx.fillRect(x, y + 2, 9, 3);
  ctx.fillStyle = '#0b1013'; ctx.fillRect(x + 2, y + 2, 1, 1); ctx.fillRect(x + 6, y + 2, 1, 1);
}
/** Una fila de alternativas ('X · ESPACIO · K') como teclas, alineadas a la derecha en `xDer`. */
function teclas(txt, xDer, y) {
  if (!txt || txt === '—') { ctx.textAlign = 'right'; ctx.fillStyle = '#4a565c'; ctx.font = labelFont(8); ctx.fillText('—', xDer, y); return; }
  const alts = String(txt).split('·').map(t => t.trim()).filter(Boolean);
  let x = xDer;
  for (let i = alts.length - 1; i >= 0; i--) {
    x -= teclaCaja(alts[i], x, y, false);
    if (i > 0) { ctx.textAlign = 'center'; ctx.fillStyle = P.dim; ctx.font = labelFont(7); ctx.fillText('o', x - 6, y - 1); x -= 12; }
  }
}
export function drawControles(w) {
  // OPACO abajo: se abre ENCIMA de OPCIONES o de la pausa, y lo de atras no puede trasluzarse
  ctx.fillStyle = '#0b1013'; ctx.fillRect(0, 0, NW, NH); panel();
  const cat = CTRL_CATEGORIAS[(w.tab + CTRL_N) % CTRL_N], padTxt = w.padTxt || (t => t);
  // (21/11: el titulo a la izquierda para dejarle la derecha al switch TECLADO ↔ JOYSTICK)
  ctx.textAlign = 'left'; ctx.fillStyle = P.accent; ctx.font = titleFont(22);
  ctx.fillText(T('optSecCtrl'), 40, 38);
  switchMando(!!w.joy, w.foco === 'switch');
  // LAS PESTAÑAS: todas a la vista, la elegida encendida y subrayada
  ctx.font = labelFont(9);
  const anchos = CTRL_CATEGORIAS.map(c => ctx.measureText(T('ctrlCat_' + c.id)).width), sep = 18;
  let x = NW / 2 - (anchos.reduce((a, b) => a + b, 0) + sep * (CTRL_N - 1)) / 2;
  CTRL_CATEGORIAS.forEach((c, i) => {
    const on = c === cat;
    if (on) { ctx.fillStyle = P.accent; ctx.globalAlpha = 0.14; ctx.fillRect(x - 5, 47, anchos[i] + 10, 14); ctx.globalAlpha = 1; ctx.fillRect(x - 5, 60, anchos[i] + 10, 1.5); }
    ctx.textAlign = 'left'; ctx.fillStyle = on ? P.accent : P.dim; ctx.globalAlpha = on ? 1 : 0.7;
    ctx.fillText(T('ctrlCat_' + c.id), x, 57); ctx.globalAlpha = 1;
    x += anchos[i] + sep;
  });
  ctx.strokeStyle = '#3a464c'; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(40, 64.5); ctx.lineTo(NW - 40, 64.5); ctx.stroke(); ctx.globalAlpha = 1;

  const xa = 52, xv = NW - 52, xk = xv - 150;
  let yFin;
  if (cat.lamina) {
    // DISPOSICION: la lamina del tutorial (render/mando.js), del mando que elige el switch. Esta dibujada en la grilla de
    // diseño (320x180): se escala para que entre debajo de las pestañas sin su titulo (el de la pantalla ya lo dice)
    const k = (NH - 66 - 16) / (H - 36);
    // CENTRADA en lo que queda (23/11, el autor: "centralo"): lo que ocupa cada lamina en la grilla de diseño —el joystick,
    // el PNG y sus rotulos de y 37 a 118; el teclado entero con su leyenda y lo del mouse, de 36 a 156— va al medio del hueco (34 a 178).
    // El recorte arranca justo arriba de eso: el titulo propio de la lamina (EL JOYSTICK…) aca no va
    const [c0, c1] = w.joy ? [34, 118] : [36, 156], baja = (34 + 178) / 2 - (c0 + c1) / 2;
    const oy = 66 - 34 * k + baja * k, techo = Math.max(66, oy + (c0 - 1) * k);
    ctx.save(); ctx.beginPath(); ctx.rect(0, techo, NW, NH - 14 - techo); ctx.clip();
    ctx.translate((NW - W * k) / 2, oy); ctx.scale(k, k);
    drawMando({ pad: !!w.joy, t: performance.now() / 1000, completo: true });
    ctx.restore();
    yFin = NH;
  } else if (cat.piruetas) {
    // DOS COLUMNAS de piruetas: el nombre y, debajo, como se pide
    // COMO PODERES DE PELEA (19/11, el autor: "las piruetas inmediatamente al lado del texto, en negrita y mas
    // espaciado, casi como poderes de Mortal Kombat, con icono de teclado y de joystick, y si son iguales, juntos"):
    // el nombre y, al lado, el combo en negrita con su icono. Teclado y joystick se piden casi siempre igual (las
    // flechas son la mano derecha en los dos): entonces van los dos iconos juntos; si no, una linea por cada uno.
    // (21/11, el autor: "un listado prolijo con todas las combinaciones, con los sticks y las presiones de botones o
    // teclas, con velocidad, veces o mantener; tiene que ser claro"): el nombre y DEBAJO como se hace (el ritmo, en
    // palabras); a la derecha el combo DIBUJADO (render/glifos.js `comboGlifos`), apretandose solo al tiempo real
    // UNA SOLA COLUMNA, UNA PIRUETA POR LINEA, CON SCROLL (21/11, el autor: "un listado, mas espacio a cada una"):
    // el nombre grande y debajo como se hace; a la derecha el combo dibujado, mas grande. ▲▼ / la ruedita recorren
    const ids = Object.keys(MOVES), joy = !!w.joy, tt = performance.now() / 1000;
    const y0 = 70, sc = Math.max(0, Math.min(pirScrollMax(), w.scroll | 0));
    const xg = xa + 150;
    for (let v = 0; v < PIR_VIS; v++) {
      const i = sc + v, id = ids[i];
      if (!id) break;
      const y = y0 + v * PIR_RH;
      if (i % 2) { ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.025; ctx.fillRect(xa - 8, y, xv - xa + 16, PIR_RH); ctx.globalAlpha = 1; }
      const fuente = joy && COMBO_PAD[id] ? padTxt(COMBO_PAD[id]) : COMBO[id];
      const cg = glifos.comboGlifos(fuente, joy);
      ctx.textAlign = 'left'; ctx.fillStyle = P.foam; ctx.font = menuFont(10);
      ctx.fillText(MOVES[id].name, xa, y + 10, 140);
      ctx.fillStyle = P.dim; ctx.font = labelFont(6.5);
      ctx.fillText(ritmoPirueta(fuente, cg), xa, y + 18, 140);
      const gw = glifos.dibujar(cg.gl, xg, y + 4, 13, tt + i * 0.37, P.body, true);
      if (cg.espejo) { ctx.fillStyle = P.dim; ctx.font = labelFont(6.5); ctx.fillText(T('ctrlEspejo'), xg + gw + 5, y + 12); }
    }
    // las flechitas de que hay mas, arriba y abajo
    ctx.textAlign = 'center'; ctx.font = labelFont(8);
    const tl = 0.6 + 0.4 * Math.sin(tt * 4);
    if (sc > 0) { ctx.globalAlpha = tl; ctx.fillStyle = P.accent; ctx.fillText('▲', NW / 2, y0 + 2); ctx.globalAlpha = 1; }
    if (sc < pirScrollMax()) { ctx.globalAlpha = tl; ctx.fillStyle = P.accent; ctx.fillText('▼', NW / 2, y0 + PIR_VIS * PIR_RH + 6); ctx.globalAlpha = 1; }
    ctx.textAlign = 'left';
    yFin = y0 + PIR_VIS * PIR_RH + 11;
  } else {
    ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(7);
    ctx.fillText(T('ctrlColAccion'), xa, 78);
    ctx.textAlign = 'right'; ctx.fillText(T(w.joy ? 'optColPad' : 'optColKb'), xv, 78);
    // 18 de alto por fila, salvo que no entren con las notas abajo: entonces se aprietan (MOVILIDAD tiene nueve)
    const rh = Math.min(18, Math.floor((NH - 34 - cat.notas.length * 11 - 6 - 96 + 11) / Math.max(1, cat.filas.length)));
    cat.filas.forEach((k, i) => {
      const y = 96 + i * rh;
      if (i % 2) { ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.025; ctx.fillRect(xa - 8, y - 11, xv - xa + 16, rh); ctx.globalAlpha = 1; }
      ctx.textAlign = 'left'; ctx.fillStyle = P.body; ctx.font = menuFont(10);
      ctx.fillText(T('ctrl' + k), xa, y, xv - xa - 200);
      // (21/11, el autor: "en el menu de controles dibujar los sticks"): las teclas o el joystick DIBUJADOS
      // (render/glifos.js) — uno solo, el que elige el switch de arriba —, alineados a la derecha
      if (w.joy) mandoDibujado(padTxt(T('ctrl' + k + 'P')), true, xv, y);
      else mandoDibujado(T('ctrl' + k + 'K'), false, xv, y);
    });
    yFin = 96 + cat.filas.length * rh;
  }
  // LAS ACLARACIONES de la categoria, apagadas: se leen, no se tocan
  ctx.textAlign = 'left'; ctx.fillStyle = P.dim; ctx.font = labelFont(8); ctx.globalAlpha = 0.8;
  cat.notas.forEach((n, i) => ctx.fillText('· ' + T(n), xa, Math.min(NH - 34, yFin + 4) + i * 11));
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center'; ctx.fillStyle = '#7d8f95'; ctx.font = labelFont(7);
  ctx.fillText(T(w.foco === 'switch' ? 'ctrlHintSw' : cat.piruetas ? 'ctrlHintPir' : 'ctrlHint'), NW / 2, NH - 10);
  ctx.textAlign = 'left';
}

/** EL SWITCH TECLADO ↔ JOYSTICK (21/11): grande, arriba a la derecha del titulo, con la perilla del lado elegido.
 *  Se mueve con ▲ ▼ (game.js `mandoCambiar`) y cambia TODO el juego, no solo esta pantalla. */
function switchMando(joy, foco) {
  const w = 150, h = 20, x = NW - 40 - w, y = 20, m = w / 2;
  ctx.fillStyle = '#141c20'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#3a464c'; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  // la perilla: el lado elegido encendido
  const kx = joy ? x + m : x;
  ctx.fillStyle = P.accent; ctx.globalAlpha = 0.9; ctx.fillRect(kx + 2, y + 2, m - 4, h - 4); ctx.globalAlpha = 1;
  ctx.font = labelFont(9); ctx.textAlign = 'center';
  ctx.fillStyle = joy ? P.dim : '#0b1013'; ctx.fillText(T('ctrlSwTeclado'), x + m / 2, y + 14);
  ctx.fillStyle = joy ? '#0b1013' : P.dim; ctx.fillText(T('ctrlSwJoy'), x + m + m / 2, y + 14);
  // ELEGIDO (con el cursor encima): el marco en acento, latiendo, y abajo como se cambia
  if (foco) {
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(performance.now() / 160); ctx.strokeStyle = P.accent; ctx.lineWidth = 1.2;
    ctx.strokeRect(x - 1.5, y - 1.5, w + 3, h + 3); ctx.globalAlpha = 1;
    ctx.fillStyle = P.accent; ctx.font = labelFont(6); ctx.fillText(T('ctrlSwCambia'), x + w / 2, y + h + 8);
  } else { ctx.fillStyle = P.dim; ctx.font = labelFont(6); ctx.globalAlpha = 0.8; ctx.fillText('▲', x + w / 2, y + h + 8); ctx.globalAlpha = 1; }
  ctx.textAlign = 'left';
}

// LA LISTA DE PIRUETAS: cuantas entran a la vista y el alto de cada una (game.js topea el scroll con pirScrollMax)
const PIR_VIS = 7, PIR_RH = 22;
export const pirScrollMax = () => Math.max(0, Object.keys(MOVES).length - PIR_VIS);
/** COMO SE HACE una pirueta, en palabras cortas (debajo de su nombre en CONTROLES → PIRUETAS). */
function ritmoPirueta(fuente, cg) {
  // (de la PRIMERA forma: si hay otra, se ve dibujada al lado, despues de la «o»)
  const s = String(fuente || '').split('·')[0], partes = [], c1 = cg.uno || cg;
  if (/⟳/.test(s)) partes.push(T('ritRolando'));
  if (/mirar/.test(s)) partes.push(T('ritMirar'));
  if (/\+/.test(s)) partes.push(T('ritJuntas'));
  const toques = c1.gl.filter(g => (g.k === 'tecla' || g.k === 'stick') && !g.hold).length;
  if (toques > 1 && !/\+/.test(s)) partes.push(T('ritRapidos', { n: toques }));
  if (cg.cond) partes.push(cg.cond);
  return partes.join(' · ') || T('ritToque');
}

/** Un mando dibujado (teclas, stick, botones) con su borde derecho en `xr` y la linea de base del texto en `y`. */
function mandoDibujado(texto, pad, xr, y) {
  const g = glifos.glifosDe(texto, pad), h = 14, w = glifos.medir(g, h);
  glifos.dibujar(g, Math.round(xr - w), y - 11, h, performance.now() / 1000, P.body, true);
}

// ---------- MENU DE PAUSA (overlay sobre la partida congelada) ----------
// El mundo quedo dibujado DEBAJO tal cual estaba (frame() saltea update, ver game.js): esto es
// un velo + el menu, en coordenadas nativas. `w.t` es pauseT — run.t esta congelado y los
// parpadeos tienen que seguir latiendo.
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
    ctx.fillText(descPlano(u.desc), x + 12, y + 33);
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

// EL BANCO DE LOS MODOS SUELTOS (estado 'banco', data/banco_suelto.js): la corrida en pausa y cartas
// VERTICALES para elegir UNA (18/10, el autor: "cartas verticales que se muevan de derecha a izquierda al
// seleccionar y si presiono abajo se puede scrollear y leer la descripcion — EXPLICAR Y QUE SE APRENDA").
// Un carrusel: la elegida al medio y grande, las otras a los costados; `w.vista` es la posicion que se
// desliza (game.js la acerca a `sel`). La cara: el dibujo horneado en Blender (assets/hud/cartas.png,
// data/iconos_cartas.js), el nombre, la linea corta y la tecla. Bajando (`w.leer`, px) se lee lo de
// data/cartas_lee.js: el DATO, QUE HACE y EN 1982. Al final del carrusel, si la hay, la ROTA: lo que tu
// avion no puede llevar, en gris y con el motivo — se ve y se lee, no se elige (PLAN_ROGUELIKE §2.6).
// Devuelve { leerMax }: cuanto se puede bajar en la carta elegida.
const GRUPO_COL = { armas: '#e8a34a', defensa: '#7fc8a0', alcance: '#6fb3e0', poderes: '#c79be8', piruetas: '#e0d070', taller: '#d08a6a', inteligencia: '#9fc0d8' };
const CARTAS_IMG = new Image();
CARTAS_IMG.src = '../assets/hud/cartas.png';
const CW = 150, CH = 204, C_ARTE = 96, C_TOPE = 19, C_PIE = 12, C_PAD = 8;
// EL TEXTO DE LAS CARTAS en una letra de LECTURA (18/10, el autor: "una fuente mas clara de leer"): la del
// menu (EmbolismSpark) es de pincel y a este tamaño se empasta. Josefin Sans viene empaquetada (styles.css).
const cartaFont = () => uiFont('JosefinSans', 10, '');
const cartaFontChica = () => uiFont('JosefinSans', 8, '');
const cartaFontDialogo = () => uiFont('JosefinSans', 6.5, '');   // la frase del pie (22/11, el autor: "letras mas chicas")
const DLG_FILA = 7.5;
/** Las lineas de `txt` que entran en `maxW` con la fuente ACTUAL (como wrapText, pero sin dibujar). */
function lineasDe(txt, maxW) {
  const out = []; let line = '';
  for (const w of String(txt || '').split(' ')) {
    const prueba = line ? line + ' ' + w : w;
    if (ctx.measureText(prueba).width > maxW && line) { out.push(line); line = w; } else line = prueba;
  }
  if (line) out.push(line);
  return out;
}
// EL COMO SE USA DE LA CARTA, DIBUJADO (22/11, el autor: "el TECLA tambien quitamos y ponemos lo que hoy estamos usando
// con CONTROLES", "mas iconos menos texto"): las teclas o los botones del joystick (render/glifos.js), del mismo texto de
// la tabla de CONTROLES. `tecla` de la carta → la fila de CONTROLES; las piruetas, su combo (data/moves.js).
const TECLA_CTRL = { 'X / ESPACIO': 'Gun', 'Z / L1': 'Msl', 'H / circulo': 'Chapitas', B: 'Tanques', J: 'Chancha', 4: 'Tempo', 5: 'Rasante', Y: 'Radar' };
let mandoCarta = { pad: false, padTxt: t => t };
const CARA_PX = 24;   // la carita de quien dice la frase (el cuadro del dialogo del juego)
function comoGlifos(u) {
  const { pad, padTxt } = mandoCarta;
  if (u.seq && COMBO[u.id]) return glifos.comboGlifos(pad && COMBO_PAD[u.id] ? padTxt(COMBO_PAD[u.id]) : COMBO[u.id], pad).gl;
  const id = TECLA_CTRL[u.tecla];
  if (!id) return null;
  return glifos.glifosDe(pad ? padTxt(T('ctrl' + id + 'P')) : T('ctrl' + id + 'K'), pad);
}
/** El contenido de una carta, en renglones con su fuente, color y alto: la cara y lo que se lee abajo. */
function cuerpoCarta(u, lee, rota) {
  const ancho = CW - C_PAD * 2, out = [];
  const bloque = (txt, font, color, lh, extra = 0, centro = false) => {
    ctx.font = font;
    for (const l of lineasDe(txt, ancho)) out.push({ t: l, font, color, h: lh, centro });
    if (extra) out.push({ h: extra });
  };
  const arte = { arte: true, h: C_ARTE + 2, ah: C_ARTE };
  out.push(arte);
  out.push({ h: 3 });   // (el NOMBRE subio a la cabecera, 22/11: ver drawCartaBanco)
  // LA CARTA, CORTA (22/11, el autor: "las cartas tienen demasiada explicacion o texto, deben tener una frase
  // caracteristica y una breve explicacion abajo"). El QUE HACE y EN 1982 de data/cartas_lee.js ya no se muestran.
  // EL ORDEN (22/11, el autor: "TITULO, QUE HACE…"; "teclas mas chicas y arriba, abajo de todo el dialogo adicional que
  // le da gracia"; "ABAJO LEER no va mas, que entre ahi"): titulo, que hace, las teclas chicas, y al pie la frase SIN
  // COMILLAS con la carita de quien la dice (data/voces_cartas.js). Nada se desliza: si no entra, se achica el dibujo.
  // (22/11, el autor: "en vez de +1 bomba, el mismo icono de la bomba de la UI, y asi con casi todo"): `{bomba}` en el
  // desc es el icono del tablero (data/desc_iconos.js); la fila va en una linea y se achica si no entra
  // EN DOS (22/11, el autor: "+1 y chafitas, y debajo la descripcion con texto mas chico, y debajo las teclas"): lo que
  // va antes del primer punto es el TITULAR, grande y con los iconos; lo que sigue, la descripcion en letra chica
  const dd = String(u.desc || ''), pto = dd.indexOf('. ');
  const cab = pto > 0 ? dd.slice(0, pto) : dd, resto = pto > 0 ? dd.slice(pto + 2) : '';
  const tinta = rota ? '#8a949a' : P.ink;
  // (22/11, el autor: "el tamaño de letra el mismo que en GUERRA ELECTRONICA": la del efecto, no una mas grande)
  if (/\{\w+\}/.test(cab)) { out.push({ mix: descTrozos(cab), font: cartaFont(), color: tinta, h: 13 }); out.push({ h: 2 }); }
  else bloque(cab, cartaFont(), tinta, 11, 2, true);
  if (resto) bloque(resto, cartaFontChica(), P.dim, 9, 2, true);
  const gl = comoGlifos(u);
  if (gl && gl.length) out.push({ gl, h: 13 });
  if (rota && u.motivo) bloque(u.motivo, cartaFont(), P.warn, 11, 2, true);
  // EL PIE, COMO LA CAJA DE DIALOGO DEL JUEGO (22/11, el autor: "la misma estructura de los dialogos in game: cuadricula
  // a la izquierda, texto que rellene el lado derecho"): caja oscura con borde, el retrato en su cuadro con filete
  // dorado, y a la derecha el nombre en dorado y la frase (screens.js dibujarOtroCabina)
  let pie = null;
  if (u.quote) {
    const cara = caraDe(u.id), nombre = null;   // (22/11, el autor: "el nombre del personaje no hace falta": la cara alcanza)
    ctx.font = cartaFontDialogo();
    const anchoTxt = CW - 2 * C_PAD - (cara ? CARA_PX + 4 : 0) - 8;
    const lin = lineasDe(u.quote, anchoTxt);
    pie = { caja: true, cara, nombre, lin, font: cartaFontDialogo(), h: Math.max(CARA_PX + 6, (nombre ? 8 : 0) + lin.length * DLG_FILA + 6) + 2 };
  }
  // que entre: la frase va AL PIE (un relleno antes), y si falta lugar el dibujo de arriba cede lo que haga falta
  const vista = CH - C_TOPE - 4;
  const usado = out.reduce((s, r) => s + r.h, 0) + (pie ? pie.h : 0);
  if (usado > vista) { const quita = Math.min(C_ARTE - 52, usado - vista); arte.ah -= quita; arte.h -= quita; }
  else if (pie) out.push({ h: vista - usado });
  if (pie) out.push(pie);
  const cara = out.reduce((s, r) => s + r.h, 0);
  return { out, cara, alto: out.reduce((s, r) => s + r.h, 0) };
}
function cartaForma(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
/** EL ICONO DEL GRUPO de la carta, centrado en (cx, cy), ~9 px (22/11): ARMAS una bala, DEFENSA un escudo, ALCANCE
 *  la cruz del SOPORTE, PODERES un rayo, PIRUETAS la vuelta, TALLER la llave, INTELIGENCIA un ojo. */
function iconoGrupo(g, cx, cy, col) {
  ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath();
  if (g === 'armas') {            // la bala: punta ojival, el cuerpo y el culote
    ctx.moveTo(-1.8, 4); ctx.lineTo(-1.8, -1); ctx.quadraticCurveTo(-1.8, -4.5, 0, -5); ctx.quadraticCurveTo(1.8, -4.5, 1.8, -1);
    ctx.lineTo(1.8, 4); ctx.closePath(); ctx.fill(); ctx.fillRect(-2.4, 3.2, 4.8, 1.6);
  } else if (g === 'defensa') {   // el escudo
    ctx.moveTo(0, -4.8); ctx.lineTo(4, -3.2); ctx.lineTo(3.6, 1); ctx.quadraticCurveTo(2.6, 3.6, 0, 5);
    ctx.quadraticCurveTo(-2.6, 3.6, -3.6, 1); ctx.lineTo(-4, -3.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#10161a'; ctx.fillRect(-0.5, -3, 1, 6); ctx.fillRect(-2.4, -1, 4.8, 1);
  } else if (g === 'alcance') {   // SOPORTE: la cruz dentro del circulo
    ctx.arc(0, 0, 4.6, 0, Math.PI * 2); ctx.stroke();
    ctx.fillRect(-0.9, -2.8, 1.8, 5.6); ctx.fillRect(-2.8, -0.9, 5.6, 1.8);
  } else if (g === 'poderes') {   // el rayo
    ctx.moveTo(1.2, -5); ctx.lineTo(-2.6, 0.6); ctx.lineTo(0, 0.6); ctx.lineTo(-1.2, 5); ctx.lineTo(2.6, -0.8); ctx.lineTo(0, -0.8); ctx.closePath(); ctx.fill();
  } else if (g === 'piruetas') {  // la vuelta
    ctx.arc(0, 0, 3.6, -0.3, Math.PI * 1.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3.8, -2.6); ctx.lineTo(3.4, 0.6); ctx.lineTo(0.8, -0.8); ctx.closePath(); ctx.fill();
  } else if (g === 'taller') {    // la llave
    ctx.moveTo(-3.6, 3.6); ctx.lineTo(1, -1); ctx.stroke();
    ctx.beginPath(); ctx.arc(2, -2, 2.4, 0, Math.PI * 2); ctx.stroke();
  } else {                        // INTELIGENCIA: el ojo
    ctx.moveTo(-4.8, 0); ctx.quadraticCurveTo(0, -4.4, 4.8, 0); ctx.quadraticCurveTo(0, 4.4, -4.8, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
/** Una carta en (x, y) = su esquina, a escala `k`. `on` = la elegida; `leer` = cuanto se bajo. */
function drawCartaBanco(u, x, y, k, on, leer, t, lee, rota) {
  // `rota` = el SELLO de una carta en gris: el texto (NO SE PUEDE en el banco, USADA en VER CARTAS), o nada
  // USADA (VER MEJORAS) va en color y lo dice chiquito arriba, en naranja (la mini ya lleva el sello);
  // NO SE PUEDE, en gris y con el sello cruzado
  const usada = rota === T('cartas_usada'), selloCol = P.warn;
  if (usada) rota = null;
  const col = rota ? '#6b7680' : (GRUPO_COL[u.grupo] || P.dim);
  const { out, cara, alto } = cuerpoCarta(u, on ? lee : null, rota);
  const vista = CH - C_TOPE - 4;   // (sin pie de LEER: la carta usa hasta el borde, igual que cuerpoCarta)
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y)); ctx.scale(k, k);
  // EL MARCO, CON FORMA DE CARTA (22/11, el autor: "la forma de la carta MAS FORMA DE CARTA"): esquinas redondas, el
  // borde grueso en el color del grupo y un filete fino adentro, como el canto de una carta de verdad
  const R = 9;
  cartaForma(0, 0, CW, CH, R); ctx.fillStyle = '#10161a'; ctx.fill();
  ctx.save(); cartaForma(0, 0, CW, CH, R); ctx.clip();
  ctx.globalAlpha = 0.16; ctx.fillStyle = col; ctx.fillRect(0, 0, CW, C_TOPE); ctx.globalAlpha = 1;   // la cabecera, teñida
  ctx.restore();
  if (rota) ctx.setLineDash([3, 3]);
  cartaForma(1, 1, CW - 2, CH - 2, R - 1); ctx.strokeStyle = on ? col : '#3a4750'; ctx.lineWidth = 2; ctx.stroke();
  ctx.setLineDash([]);
  cartaForma(4.5, 4.5, CW - 9, CH - 9, R - 4); ctx.strokeStyle = on ? col : '#2a343b'; ctx.globalAlpha = 0.35; ctx.lineWidth = 0.7; ctx.stroke(); ctx.globalAlpha = 1;
  // LA CABECERA: el icono del grupo y su nombre en la letra principal (22/11: "el texto DEFENSA con tipografia, mas
  // principal"; DEFENSA un ESCUDO, ARMAS una BALA, ALCANCE tipo SUPPORT)
  iconoGrupo(u.grupo || 'armas', C_PAD + 5, 11, col);
  // EL NOMBRE EN LA CABECERA (22/11, el autor: "el nombre del objeto en el titulo donde dice DEFENSA o ARMAS, si total
  // el color y el icono ya lo identifican"): el icono del grupo, y al lado el nombre de la carta en su color
  ctx.textAlign = 'right'; ctx.font = labelFont(7);
  const sello = rota || (usada ? T('cartas_usada') : u.uso ? T('banco_uso') : '');
  const selloW = sello ? ctx.measureText(sello).width + 4 : 0;
  if (rota) { ctx.fillStyle = selloCol; ctx.fillText(rota, CW - C_PAD, 14); }
  else if (sello) { ctx.fillStyle = P.accent; ctx.fillText(sello, CW - C_PAD, 14); }
  ctx.textAlign = 'left'; ctx.fillStyle = rota ? '#8a949a' : col; ctx.font = menuFont(10);
  ctx.fillText(u.name, C_PAD + 13, 14.5, CW - C_PAD * 2 - 13 - selloW);
  // lo que se desliza: recortado entre la franja de arriba y el pie
  ctx.save();
  ctx.beginPath(); ctx.rect(3, C_TOPE, CW - 6, vista); ctx.clip();
  let yy = C_TOPE;
  for (const r of out) {
    if (yy > CH || yy + r.h < C_TOPE - 120) { yy += r.h; continue; }
    if (r.arte) {
      // el fondo del dibujo: el color del grupo, apenas, con un horizonte
      const ah = r.ah || C_ARTE, ip = Math.min(ICONO_FW, ah);   // (si la carta no entra, el dibujo cede alto)
      ctx.globalAlpha = 0.10; ctx.fillStyle = col; ctx.fillRect(4, yy, CW - 8, ah); ctx.globalAlpha = 0.18;
      ctx.fillRect(4, yy + ah * 0.66, CW - 8, 1); ctx.globalAlpha = 1;
      if (CARTAS_IMG.complete && CARTAS_IMG.naturalWidth) {
        const n = iconoDe(u), sx = (n % ICONO_COLS) * ICONO_FW, sy = Math.floor(n / ICONO_COLS) * ICONO_FW;
        const bob = on && !rota ? Math.round(Math.sin(t * 2.2) * 1.5) : 0;
        if (rota) { ctx.filter = 'grayscale(1) brightness(1.15)'; ctx.globalAlpha *= 0.75; }
        ctx.drawImage(CARTAS_IMG, sx, sy, ICONO_FW, ICONO_FW, Math.round(CW / 2 - ip / 2), Math.round(yy + (ah - ip) / 2) + bob, ip, ip);
        ctx.filter = 'none'; if (rota) ctx.globalAlpha /= 0.75;
      }
      if (rota) {                                                         // el sello: NO SE PUEDE, cruzado
        ctx.save(); ctx.translate(CW / 2, yy + ah / 2); ctx.rotate(-0.28);
        ctx.font = menuFont(12); ctx.textAlign = 'center';
        const tw = ctx.measureText(rota).width;
        ctx.strokeStyle = selloCol; ctx.lineWidth = 2; ctx.strokeRect(-tw / 2 - 6, -11, tw + 12, 18);
        ctx.fillStyle = selloCol; ctx.fillText(rota, 0, 3);
        ctx.restore();
      }
    } else if (r.raya) {
      ctx.fillStyle = r.color; ctx.font = r.font; ctx.textAlign = 'left';
      ctx.fillText(r.t, C_PAD, yy + 8);
      const tw = ctx.measureText(r.t).width;
      ctx.globalAlpha = 0.35; ctx.fillRect(C_PAD + tw + 4, yy + 5, CW - C_PAD * 2 - tw - 4, 1); ctx.globalAlpha = 1;
    } else if (r.mix) {
      // el texto con iconos del tablero adentro: se mide, se centra y, si no entra, se achica entero
      ctx.font = r.font;
      const IW = 12, AIRE = 4;
      const w = r.mix.reduce((a, p) => a + (p.ico ? IW + AIRE : ctx.measureText(p.t).width), 0);
      const k2 = Math.min(1, (CW - 2 * C_PAD) / w);
      ctx.save(); ctx.translate(CW / 2, yy + r.h / 2); ctx.scale(k2, k2);
      let x0 = -w / 2;
      ctx.textAlign = 'left'; ctx.fillStyle = r.color;
      for (const p of r.mix) {
        if (p.ico) {
          x0 += AIRE / 2;
          ctx.save(); ctx.translate(x0 + IW / 2, 0); ctx.scale(1.6, 1.6);
          if (rota) ctx.filter = 'grayscale(1)';
          iconoEn(0, 0, p.ico, '#e8eef0'); ctx.restore();
          x0 += IW + AIRE / 2;
        } else { ctx.fillText(p.t, x0, 3.5); x0 += ctx.measureText(p.t).width; }
      }
      ctx.restore();
    } else if (r.caja) {
      const bx = C_PAD - 3, bw = CW - 2 * (C_PAD - 3), bh = r.h - 2, by = Math.round(yy);
      ctx.fillStyle = '#070b0f'; ctx.globalAlpha = 0.92; ctx.fillRect(bx, by, bw, bh); ctx.globalAlpha = 1;
      ctx.strokeStyle = '#3a4c58'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      let tx = bx + 4;
      if (r.cara) {
        const cx = bx + 3, cy = by + Math.round((bh - CARA_PX) / 2), img = retrato(r.cara);
        ctx.fillStyle = '#0d1319'; ctx.fillRect(cx, cy, CARA_PX, CARA_PX);
        if (img) { if (rota) ctx.filter = 'grayscale(1)'; ctx.drawImage(img, cx, cy, CARA_PX, CARA_PX); ctx.filter = 'none'; }
        else silueta(cx, cy, CARA_PX);
        ctx.globalAlpha = 0.7; ctx.strokeStyle = rota ? '#6b7680' : P.accent; ctx.strokeRect(cx + 0.5, cy + 0.5, CARA_PX - 1, CARA_PX - 1); ctx.globalAlpha = 1;
        tx = cx + CARA_PX + 4;
      }
      const altoTxt = (r.nombre ? 8 : 0) + r.lin.length * DLG_FILA;
      let ty = by + Math.round((bh - altoTxt) / 2);
      ctx.textAlign = 'left';
      if (r.nombre) { ctx.font = labelFont(5.5); ctx.fillStyle = rota ? '#6b7680' : P.accent; ctx.fillText(r.nombre, tx, ty + 6); ty += 8; }
      ctx.font = r.font; ctx.fillStyle = rota ? '#8a949a' : P.ink;
      r.lin.forEach((l, i) => ctx.fillText(l, tx, ty + (i + 1) * DLG_FILA - 1.5));
    } else if (r.gl) {
      const gw = glifos.medir(r.gl, 10);
      glifos.dibujar(r.gl, Math.round(CW / 2 - gw / 2), yy + 1, 10, t, rota ? '#8a949a' : P.body, true);
    } else if (r.t) {
      ctx.fillStyle = r.color; ctx.font = r.font;
      ctx.textAlign = r.centro ? 'center' : 'left';
      ctx.fillText(r.t, r.centro ? CW / 2 : C_PAD, yy + r.h - 2);
    }
    yy += r.h;
  }
  ctx.restore();
  // el pie: LEER (si hay mas abajo) y la barra de cuanto se bajo
  // (22/11: unos pocos px de mas no son "algo para leer": sin barra ni ABAJO: LEER, que se pisaban con las teclas)
  const leerMax = 0;   // (22/11, el autor: "ABAJO LEER no va mas": la carta entra entera — cuerpoCarta achica el dibujo)
  if (on && leerMax > 0) {
    const f = Math.min(1, leer / leerMax), bh = Math.max(12, vista * vista / alto);
    ctx.globalAlpha = 0.25; ctx.fillStyle = col; ctx.fillRect(CW - 8, C_TOPE, 1.5, vista);
    ctx.globalAlpha = 0.9; ctx.fillRect(CW - 8, C_TOPE + (vista - bh) * f, 1.5, bh); ctx.globalAlpha = 1;
    if (leer < cara - vista + 30 && Math.sin(t * 5) > -0.4) {
      ctx.textAlign = 'center'; ctx.fillStyle = col; ctx.font = labelFont(7);
      ctx.fillText(T('banco_leer'), CW / 2, CH - 7);   // (adentro del marco de la carta)
    }
  }
  ctx.restore();
  return leerMax;
}
/** EL CARRUSEL de cartas completas (el banco y VER CARTAS de la pausa): la elegida (`sel`) al medio, las otras
 *  a los costados segun `w.vista`; `sello(i)` = el sello de la carta i (null si va en color). Devuelve cuanto se
 *  puede bajar en la elegida. */
function carrusel(todas, sel, w, sello) {
  const y0 = 44, paso = 138;
  // de la mas lejana a la elegida: la elegida queda arriba de todo
  const orden = todas.map((u, i) => i).sort((a, b) => Math.abs(b - w.vista) - Math.abs(a - w.vista));
  let leerMax = 0;
  for (const i of orden) {
    const d = i - w.vista, ad = Math.min(1.6, Math.abs(d));
    if (Math.abs(d) > 2.2) continue;
    const k = 1 - 0.2 * Math.min(1, ad), on = i === sel;
    const sacude = on && w.sacude > 0 ? Math.sin(w.sacude * 60) * 3 * w.sacude / 0.35 : 0;
    const x = NW / 2 + d * paso - (CW * k) / 2 + sacude, y = y0 + (CH * (1 - k)) / 2;
    ctx.globalAlpha = 1 - 0.45 * Math.min(1, ad);
    const m = drawCartaBanco(todas[i], x, y, k, on, on ? w.leer : 0, w.t, w.lee && w.lee(todas[i].id), sello(i));
    ctx.globalAlpha = 1;
    if (on) leerMax = m;
  }
  return leerMax;
}
export function drawBanco(w) {
  mandoCarta = { pad: !!w.joy, padTxt: w.padTxt || (t => t) };
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(18);
  ctx.fillText(T('banco_titulo'), NW / 2, 22);
  ctx.fillStyle = P.dim; ctx.font = descFont(9);
  ctx.fillText(T('banco_sub', { n: w.libreta }), NW / 2, 35);
  const todas = w.rota ? [...w.offer, w.rota] : w.offer;
  const sel = Math.min(w.sel, todas.length - 1);
  const leerMax = carrusel(todas, sel, w, i => (i >= w.offer.length ? T('banco_rota') : null));
  // LOS TIPOS DE LA OFERTA (22/11, el autor: "arriba a la derecha, fuera del selector, los 3 iconos con los tipos"):
  // el icono del grupo de cada carta ofrecida, en su color; la que esta elegida, mas grande y con su raya
  w.offer.forEach((u, i) => {
    const n = w.offer.length, cx = NW - 22 - (n - 1 - i) * 22, cy = 20, on = i === sel;
    const c = GRUPO_COL[u.grupo] || P.dim;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(on ? 1.9 : 1.4, on ? 1.9 : 1.4); ctx.globalAlpha = on ? 1 : 0.55;
    iconoGrupo(u.grupo || 'armas', 0, 0, c); ctx.restore();
    if (on) { ctx.fillStyle = c; ctx.fillRect(cx - 7, cy + 12, 14, 2); }
  });
  ctx.fillStyle = P.dim; ctx.font = descFont(9); ctx.textAlign = 'center';
  ctx.fillText(T(sel >= w.offer.length ? 'banco_hint_rota' : 'banco_hint'), NW / 2, NH - 8);
  ctx.textAlign = 'left';
  return { leerMax };
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
  mandoCarta = { pad: !!w.joy, padTxt: w.padTxt || (t => t) };
  ctx.fillStyle = '#070a0dd2';           // velo: mas cerrado que panel() — el juego es contexto, no fondo
  ctx.fillRect(0, 0, NW, NH);
  // VER CARTAS (modos sueltos, 18/10, el autor: "dos sectores, uno con ACTIVAS y otro con USADAS debajo, y las
  // cartas chicas en una version reducida; cada vez que seleccionamos una la vemos en 100%; si pasamos a la
  // siguiente, la anterior vuelve a su version chica: solo imagen, nombre y cantidad"). Las repetidas van en
  // una sola, con su ×N. Izquierda / derecha recorren (las activas y despues las usadas), arriba / abajo leen
  // la grande. La grande crece desde su lugar (`w.cartasCrece` 0..1) y se acomoda adentro de la pantalla.
  if (w.view === 'cartas' && w.cartas) {
    const { activas, usadas } = w.cartas, todas = [...activas, ...usadas];
    ctx.textAlign = 'center';
    ctx.fillStyle = P.accent; ctx.font = titleFont(18); ctx.fillText(T('pauseCartas'), NW / 2, 22);
    if (!todas.length) {
      ctx.fillStyle = P.dim; ctx.font = cartaFont(); ctx.fillText(T('cartas_ninguna'), NW / 2, 130);
      if (w.alto) w.alto(0, 0);
    } else {
      const sel = Math.min(w.cartasSel || 0, todas.length - 1);
      // la grande, fija a la izquierda; los dos sectores de minis, a la derecha (asi la grande no tapa ninguna)
      const mw = 60, mh = 57, cols = 5, x0 = 168, top = 34, bottom = NH - 18;
      // el lugar de cada mini: los dos sectores, uno debajo del otro
      const lugar = [], titulos = [];
      let y = 0;
      for (const [lista, k, base] of [[activas, 'cartas_activas', 0], [usadas, 'cartas_usadas', activas.length]]) {
        if (!lista.length) continue;
        titulos.push({ y, t: T(k) + '  ' + lista.reduce((n, c) => n + c.n, 0), gris: base > 0 });
        y += 13;
        lista.forEach((c, i) => { lugar[base + i] = { x: x0 + (i % cols) * mw, y: y + Math.floor(i / cols) * (mh + 3) }; });
        y += Math.ceil(lista.length / cols) * (mh + 3) + 4;
      }
      // si no entra todo, se corre para que la elegida quede a la vista
      const vista = bottom - top, ls = lugar[sel];
      const off = y <= vista ? 0 : Math.max(0, Math.min(y - vista, ls.y + mh / 2 - vista / 2));
      ctx.save(); ctx.beginPath(); ctx.rect(0, top - 2, NW, vista + 2); ctx.clip();
      for (const tt of titulos) {
        const yy = top + tt.y - off;
        ctx.textAlign = 'left'; ctx.font = labelFont(8); ctx.fillStyle = tt.gris ? '#8a959b' : P.accent;
        ctx.fillText(tt.t, x0 + 2, yy + 9);
        const tw = ctx.measureText(tt.t).width;
        ctx.globalAlpha = 0.3; ctx.fillRect(x0 + tw + 8, yy + 5, cols * mw - tw - 10, 1); ctx.globalAlpha = 1;
      }
      todas.forEach((c, i) => {
        const L = lugar[i], x = L.x, yy = top + L.y - off, gris = i >= activas.length, on = i === sel;
        if (yy > bottom || yy + mh < top) return;
        const col = GRUPO_COL[c.grupo] || P.dim;
        ctx.fillStyle = '#10161a'; ctx.fillRect(x + 2, yy, mw - 4, mh);
        ctx.fillStyle = col; ctx.fillRect(x + 2, yy, mw - 4, 2);
        ctx.strokeStyle = on ? P.accent : '#33404a'; ctx.lineWidth = on ? 2 : 1; ctx.strokeRect(x + 2.5, yy + 0.5, mw - 5, mh - 1); ctx.lineWidth = 1;
        if (CARTAS_IMG.complete && CARTAS_IMG.naturalWidth) {
          const n = iconoDe(c), sx = (n % ICONO_COLS) * ICONO_FW, sy = Math.floor(n / ICONO_COLS) * ICONO_FW;
          ctx.drawImage(CARTAS_IMG, sx, sy, ICONO_FW, ICONO_FW, Math.round(x + mw / 2 - 20), yy + 3, 40, 40);
        }
        ctx.textAlign = 'center'; ctx.fillStyle = P.ink; ctx.font = uiFont('JosefinSans', 7, '');
        const nl = lineasDe(c.name, mw - 8).slice(0, 2);
        nl.forEach((l, k) => ctx.fillText(l, x + mw / 2, yy + 50 + k * 7 - (nl.length - 1) * 3.5));
        if (c.n > 1) {                                                     // la cantidad
          ctx.font = labelFont(8); const t2 = '×' + c.n, w2 = ctx.measureText(t2).width + 6;
          ctx.fillStyle = P.accent; ctx.fillRect(x + mw - 4 - w2, yy + 3, w2, 10);
          ctx.fillStyle = '#10161a'; ctx.fillText(t2, x + mw - 4 - w2 / 2, yy + 11);
        }
        if (gris) {                                                        // usada: el velo y el sello
          ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x + 2, yy, mw - 4, mh);
          ctx.save(); ctx.translate(x + mw / 2, yy + 23); ctx.rotate(-0.28);
          ctx.font = labelFont(8); ctx.textAlign = 'center';
          const tw = ctx.measureText(T('cartas_usada')).width;
          ctx.strokeStyle = P.accent; ctx.lineWidth = 1; ctx.strokeRect(-tw / 2 - 3, -7, tw + 6, 10);
          ctx.fillStyle = P.accent; ctx.fillText(T('cartas_usada'), 0, 1);
          ctx.restore();
        }
        // LA ELEGIDA: un velo del color del borde, encima de todo (tambien del velo de las usadas)
        if (on) {
          ctx.globalAlpha = 0.22; ctx.fillStyle = P.accent; ctx.fillRect(x + 2, yy, mw - 4, mh); ctx.globalAlpha = 1;
          ctx.strokeStyle = P.accent; ctx.lineWidth = 2; ctx.strokeRect(x + 2.5, yy + 0.5, mw - 5, mh - 1); ctx.lineWidth = 1;
        }
      });
      ctx.restore();
      // LA ELEGIDA AL 100%, a la izquierda: aparece con un salto chico cada vez que se cambia
      const e = Math.max(0, Math.min(1, w.cartasCrece == null ? 1 : w.cartasCrece)), k = 0.9 + 0.1 * (1 - Math.pow(1 - e, 3));
      const fx = 10 + (CW * (1 - k)) / 2, fy = 36 + (CH * (1 - k)) / 2;
      ctx.globalAlpha = 0.4 + 0.6 * e;
      const m = drawCartaBanco(todas[sel], fx, fy, k, true, w.cartasLeer || 0, w.t, w.lee && w.lee(todas[sel].id), sel >= activas.length ? T('cartas_usada') : null);
      ctx.globalAlpha = 1;
      if (w.alto) w.alto(m, todas.length);
    }
    ctx.fillStyle = P.dim; ctx.font = descFont(9); ctx.textAlign = 'center';
    ctx.fillText(T('cartas_pie'), NW / 2, NH - 6);
    ctx.textAlign = 'left';
    return;
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(24);
  ctx.fillText(w.titulo || T('pauseTitle'), NW / 2, 56);

  if (w.view === 'controls') { drawControles({ tab: w.ctrlTab | 0, scroll: w.ctrlScroll | 0, foco: w.ctrlFoco, padTxt: w.padTxt, joy: w.joy, velo: false }); return; }

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

// ---------- EL ALBUM DE MALVINAS (22/11/2026, data/album.js) ----------
// A la izquierda la grilla de figuritas (las tapadas, un signo de pregunta); a la derecha el panel DEDICADO de la
// marcada: su dibujo, que hace, el dato y la historia. Flechas recorren la grilla; ESC vuelve.
export const ALBUM_COLS = 7;
/** Lo tocable del album tal como se dibujo (coordenadas de mundo): las figuritas `{ i, x, y, s }` y las pestañas `{ c, a, b }`. Lo lee el mouse (game.js). */
export const ALBUM_HIT = { celdas: [], tabs: [] };
const ALB = { x: 14, y: 52, celda: 25, filas: 8, px: 212, py: 40, pw: 256, ph: 208 };   // (py: debajo del boton de musica del lobby)
/** `w` = { entradas, vistos (Set), sel, t, lee (id → { que, dato, historia }) } */
export function drawAlbum(w) {
  panel();
  albumPlanes = w.planes || [];
  const n = w.entradas.length, vistos = w.vistos, todas = w.todas || w.entradas;
  const nVistos = todas.filter(e => vistos.has(e.id)).length;
  ctx.textAlign = 'left'; ctx.fillStyle = P.accent; ctx.font = titleFont(15);
  ctx.fillText(T('albumTitulo'), ALB.x, 24);
  ctx.fillStyle = P.dim; ctx.font = labelFont(7);
  const deCat = todas.filter(e => e.cat === (w.cats || [])[w.cat]);
  ctx.fillText(T('albumCuenta', { n: nVistos, de: todas.length }) + '   ·   ' + T('albumCat_' + (w.cats || [])[w.cat]) + ' ' + deCat.filter(e => vistos.has(e.id)).length + '/' + deCat.length, ALB.x, 34);
  // LAS SECCIONES (22/11): una pestaña por clase de figurita, con lo destapado de cada una; Q / E (L1 / R1) cambian
  ALBUM_HIT.celdas.length = 0; ALBUM_HIT.tabs.length = 0;
  let tx = ALB.x;
  (w.cats || []).forEach((c, i) => {
    const deEsta = todas.filter(e => e.cat === c), v = deEsta.filter(e => vistos.has(e.id)).length;
    const nueva = w.nuevos && deEsta.some(e => w.nuevos.has(e.id));
    const txt = T('albumCat_' + c);   // (el conteo, arriba: con el numero las pestañas pasaban por debajo del boton de musica)
    ctx.font = menuFont(8.5); const tw = ctx.measureText(txt).width;   // (en negrita: la letra de los titulos)
    const on = i === w.cat;
    if (on) { ctx.fillStyle = P.accent; ctx.globalAlpha = 0.18; ctx.fillRect(tx - 2, 37, tw + 4, 9); ctx.globalAlpha = 1; ctx.fillRect(tx - 2, 45, tw + 4, 1); }
    ctx.fillStyle = on ? P.accent : P.dim; ctx.fillText(txt, tx, 44);
    if (nueva) { ctx.fillStyle = '#e8321e'; ctx.beginPath(); ctx.arc(tx + tw + 2.5, 38.5, 1.8, 0, Math.PI * 2); ctx.fill(); }
    ALBUM_HIT.tabs.push({ c: i, a: tx - 3, b: tx + tw + 5 });
    tx += tw + 8;
  });
  // LA GRILLA, con scroll por filas para que la marcada siempre se vea
  const filaSel = Math.floor(w.sel / ALBUM_COLS), filasTot = Math.ceil(n / ALBUM_COLS);
  const desde = Math.max(0, Math.min(filasTot - ALB.filas, filaSel - Math.floor(ALB.filas / 2)));
  for (let i = desde * ALBUM_COLS; i < Math.min(n, (desde + ALB.filas) * ALBUM_COLS); i++) {
    const e = w.entradas[i], f = Math.floor(i / ALBUM_COLS) - desde, c = i % ALBUM_COLS;
    const x = ALB.x + c * ALB.celda, y = ALB.y + f * ALB.celda, s = ALB.celda - 3, on = i === w.sel, visto = vistos.has(e.id);
    const col = GRUPO_COL[e.grupo] || P.dim;
    ALBUM_HIT.celdas.push({ i, x, y, s });
    ctx.fillStyle = visto ? '#141c22' : '#0c1115'; ctx.fillRect(x, y, s, s);
    if (visto) {
      ctx.globalAlpha = 0.16; ctx.fillStyle = col; ctx.fillRect(x, y, s, s); ctx.globalAlpha = 1;
      albumIcono(e, x + s / 2, y + s / 2, s - 2);
      // NUEVA (todavia no mirada): la ESQUINA de arriba a la derecha en rojo, un triangulito (22/11, el autor: "sin el
      // texto"; "circulito no, una esquina roja nomas")
      if (w.nuevos && w.nuevos.has(e.id)) {
        ctx.fillStyle = '#e8321e'; ctx.beginPath(); ctx.moveTo(x + s - 7, y); ctx.lineTo(x + s, y); ctx.lineTo(x + s, y + 7); ctx.closePath(); ctx.fill();
      }
    } else {
      ctx.fillStyle = '#33414b'; ctx.font = menuFont(12); ctx.textAlign = 'center';
      ctx.fillText('?', x + s / 2, y + s / 2 + 4); ctx.textAlign = 'left';
    }
    ctx.strokeStyle = on ? (visto ? col : P.accent) : '#26323a'; ctx.lineWidth = on ? 1.5 : 1;
    ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
  }
  // la barrita de scroll de la grilla
  if (filasTot > ALB.filas) {
    const hT = ALB.filas * ALB.celda - 3, bh = hT * ALB.filas / filasTot, by = ALB.y + (hT - bh) * desde / (filasTot - ALB.filas);
    ctx.fillStyle = '#26323a'; ctx.fillRect(ALB.x + ALBUM_COLS * ALB.celda + 1, ALB.y, 2, hT);
    ctx.fillStyle = P.dim; ctx.fillRect(ALB.x + ALBUM_COLS * ALB.celda + 1, by, 2, bh);
  }
  drawAlbumDetalle(w.entradas[w.sel], vistos.has((w.entradas[w.sel] || {}).id), w);
  albumPie(w);
}
/** COMO SE RECORRE (22/11, el autor: "debe aclarar como recorrer el album, con que botones o teclas"): las teclas o los
 *  botones DIBUJADOS (render/glifos.js, como en CONTROLES) con su accion al lado, segun el mando que se esta usando. */
function albumPie(w) {
  const pad = !!w.joy, pt = w.padTxt || (t => t);
  const partes = [
    [glifos.glifosDe(pad ? pt('cruceta ◄ · stick izq ←') : '↑ ↓ ← →', pad), T('albumPieRecorrer')],
    [glifos.glifosDe(pad ? pt('L1 R1') : 'Q E', pad), T('albumPieSeccion')],
    [glifos.glifosDe(pad ? pt('◯') : 'ESC', pad), T('albumPieVolver')],
  ];
  const H_ = 10, AIRE = 4, ENTRE = 14;
  ctx.font = menuFont(8.5);
  const ancho = partes.reduce((a, [g, t]) => a + glifos.medir(g, H_) + AIRE + ctx.measureText(t).width, 0) + ENTRE * (partes.length - 1);
  let x = Math.round(NW / 2 - ancho / 2);
  const y = NH - 15;
  for (const [g, t] of partes) {
    x += glifos.dibujar(g, x, y, H_, w.t, P.body) + AIRE;
    ctx.fillStyle = P.dim; ctx.font = menuFont(8.5); ctx.textAlign = 'left';
    ctx.fillText(t, x, y + H_ - 2);
    x += ctx.measureText(t).width + ENTRE;
  }
}
/** El dibujo de una figurita centrado en (cx, cy) en un cuadrado de `lado`: la carta, su arte; el tema, el icono del tablero. */
let albumPlanes = [];
// EL BARCO HORNEADO (22/11, el autor: "poner el barco que ya tenemos horneado", "que gracia tiene un icono asi gigante"):
// la hoja de costado de cada clase (assets/world/enemies/buque_<clase>.png, tres cuadros de 240x72): el primero
const BUQUE_IMG = {};
// RECORTADO A LO QUE SE VE (las hojas traen mucho aire transparente: el Harrier de frente quedaba un punto). Se calcula
// una vez por cuadro y se guarda; mientras la imagen no cargo, null.
const RECORTES = new Map();
function recorte(im, sx, sy, sw, sh) {
  const k = im.src + '|' + sx + '|' + sy;
  let c = RECORTES.get(k);
  if (c) return c;
  const cv = document.createElement('canvas'); cv.width = sw; cv.height = sh;
  const g = cv.getContext('2d'); g.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);
  const d = g.getImageData(0, 0, sw, sh).data;
  let x0 = sw, y0 = sh, x1 = -1, y1 = -1;
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) if (d[(y * sw + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = sw - 1; y1 = sh - 1; }
  c = { cv, x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  RECORTES.set(k, c);
  return c;
}
/** Dibuja el cuadro (sx, sy, sw, sh) de `im` recortado a lo visible, entero adentro de `lado` x `lado` centrado en (cx, cy). */
function dibujarRecortado(im, sx, sy, sw, sh, cx, cy, lado) {
  const r = recorte(im, sx, sy, sw, sh), k = Math.min((lado - 2) / r.w, (lado - 2) / r.h), w = r.w * k, h = r.h * k;
  const suave = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;   // (pixel art: sin borronear al agrandar)
  ctx.drawImage(r.cv, r.x, r.y, r.w, r.h, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h);
  ctx.imageSmoothingEnabled = suave;
}
const buqueImg = (c, hoja) => { const n = hoja || 'buque_' + c; let im = BUQUE_IMG[n]; if (!im) { im = BUQUE_IMG[n] = new Image(); im.src = '../assets/world/enemies/' + n + '.png'; } return im.complete && im.naturalWidth ? im : null; };
function albumIcono(e, cx, cy, lado) {
  // LOS DIBUJOS DE VERDAD, nunca el icono del tablero agrandado: el buque horneado, la ilustracion del avion (tambien
  // la de la mision: el avion con que se volo) o el arte de una carta (los temas lo toman prestado con `arte`)
  if (e.sprite) {
    const im = buqueImg(null, e.sprite.src); if (!im) return;
    const fw = im.naturalWidth / e.sprite.n;
    dibujarRecortado(im, fw * e.sprite.fr, 0, fw, im.naturalHeight, cx, cy, lado);
    return;
  }
  if (e.buque) {
    const im = buqueImg(e.buque); if (!im) return;
    dibujarRecortado(im, 0, 0, im.naturalWidth / 3, im.naturalHeight, cx, cy, lado);   // (de costado: entra a lo ancho)
    return;
  }
  if (e.arte) {
    if (!(CARTAS_IMG.complete && CARTAS_IMG.naturalWidth)) return;
    const k = Math.max(0, ICONOS.indexOf(e.arte)), sx = (k % ICONO_COLS) * ICONO_FW, sy = Math.floor(k / ICONO_COLS) * ICONO_FW;
    ctx.drawImage(CARTAS_IMG, sx, sy, ICONO_FW, ICONO_FW, Math.round(cx - lado / 2), Math.round(cy - lado / 2), lado, lado);
    return;
  }
  if (e.plane) {
    // el avion: su ilustracion del selector, entera y centrada (mas ancha que alta)
    const pl = albumPlanes.find(p => p.key === e.plane);
    if (!pl || !pl.ready || !pl.img) return;
    if (!pl.img.naturalWidth) return;
    dibujarRecortado(pl.img, 0, 0, pl.img.naturalWidth, pl.img.naturalHeight, cx, cy, lado);
    return;
  }
  if (e.tipo === 'carta') {
    if (!(CARTAS_IMG.complete && CARTAS_IMG.naturalWidth)) return;
    const k = iconoDe(e), sx = (k % ICONO_COLS) * ICONO_FW, sy = Math.floor(k / ICONO_COLS) * ICONO_FW;
    ctx.drawImage(CARTAS_IMG, sx, sy, ICONO_FW, ICONO_FW, Math.round(cx - lado / 2), Math.round(cy - lado / 2), lado, lado);
  } else {
    ctx.save(); ctx.translate(cx, cy); const k = lado / 10; ctx.scale(k, k);
    iconoEn(0, 0, e.icono, '#e8eef0'); ctx.restore();
  }
}
function drawAlbumDetalle(e, visto, w) {
  if (!e) return;
  const { px: x, py: y, pw, ph } = ALB, col = GRUPO_COL[e.grupo] || P.dim;
  ctx.fillStyle = '#0d1317'; ctx.fillRect(x, y, pw, ph);
  ctx.strokeStyle = visto ? col : '#2a343b'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, pw - 1, ph - 1);
  ctx.globalAlpha = 0.16; ctx.fillStyle = col; ctx.fillRect(x + 1, y + 1, pw - 2, 18); ctx.globalAlpha = 1;
  const pad = 8, ancho = pw - pad * 2;
  if (!visto) {
    ctx.fillStyle = '#5a6a74'; ctx.font = menuFont(12); ctx.textAlign = 'center';
    ctx.fillText('? ? ?', x + pw / 2, y + 70);
    ctx.font = cartaFont(); ctx.fillStyle = P.dim;
    lineasDe(T({ tema: 'albumBloqTema', avion: 'albumBloqAvion', buque: 'albumBloqBuque', mision: 'albumBloqMision' }[e.tipo] || 'albumBloqCarta'), ancho - 20).forEach((l, i) => ctx.fillText(l, x + pw / 2, y + 96 + i * 12));
    ctx.textAlign = 'left';
    return;
  }
  // la cabecera: el icono del grupo y el nombre
  // (alineado a la DERECHA: arriba al centro de la pantalla flota el boton de musica del lobby y tapaba el nombre)
  iconoGrupo(e.grupo || 'armas', x + pw - pad - 4, y + 10, col);
  ctx.textAlign = 'right'; ctx.fillStyle = col; ctx.font = menuFont(11);
  ctx.fillText(e.name, x + pw - pad - 12, y + 14, pw - pad * 2 - 60);
  ctx.textAlign = 'left';
  // el dibujo, y a su derecha lo que hace en una linea y la frase con la carita
  const ay = y + 24, A = 58;
  ctx.globalAlpha = 0.1; ctx.fillStyle = col; ctx.fillRect(x + pad, ay, A, A); ctx.globalAlpha = 1;
  albumIcono(e, x + pad + A / 2, ay + A / 2, A);
  const tx = x + pad + A + 6, tw = pw - pad * 2 - A - 6;
  ctx.fillStyle = P.ink; ctx.font = cartaFont();
  let yy = ay + 10;
  for (const l of lineasDe(descPlano(e.desc), tw)) { ctx.fillText(l, tx, yy); yy += 11; }
  if (e.quote) {
    const cara = caraDe(e.id); yy += 2;
    if (cara) {
      const img = retrato(cara), C = 18;
      ctx.fillStyle = '#0d1319'; ctx.fillRect(tx, yy, C, C);
      if (img) ctx.drawImage(img, tx, yy, C, C);
      ctx.globalAlpha = 0.7; ctx.strokeStyle = P.accent; ctx.strokeRect(tx + 0.5, yy + 0.5, C - 1, C - 1); ctx.globalAlpha = 1;
      ctx.font = cartaFontDialogo(); ctx.fillStyle = P.dim;
      lineasDe(e.quote, tw - C - 4).slice(0, 3).forEach((l, i) => ctx.fillText(l, tx + C + 4, yy + 6 + i * DLG_FILA));
    }
  }
  // LO QUE SE APRENDE: que hace, el dato y la historia (data/cartas_lee.js para las cartas; data/album.js los temas)
  const L = e.tipo === 'carta' ? (w.lee && w.lee(e.id)) : e;
  // los rotulos de cada seccion: la carta y el tema dicen QUE HACE / EN 1982; el avion, el buque y la salida, lo suyo
  const ROT = { avion: ['albumRotGuerra', 'albumRotFicha'], buque: ['albumRotBuque', 'albumRotPaso'], mision: ['albumRotSalida', 'albumRotContexto'] }[e.tipo];
  yy = ay + A + 12;
  if (!L) return;
  const titulo = t => { ctx.fillStyle = P.dim; ctx.font = labelFont(6.5); ctx.fillText(t, x + pad, yy); const tw2 = ctx.measureText(t).width;
    ctx.globalAlpha = 0.35; ctx.fillRect(x + pad + tw2 + 4, yy - 3, ancho - tw2 - 4, 1); ctx.globalAlpha = 1; yy += 9; };
  titulo(T(ROT ? ROT[0] : 'banco_que'));
  ctx.fillStyle = P.body; ctx.font = cartaFontChica();
  for (const l of lineasDe(L.que, ancho)) { ctx.fillText(l, x + pad, yy); yy += 9; }
  if (L.dato) { yy += 4; ctx.fillStyle = P.accent; ctx.font = menuFont(9); ctx.textAlign = 'center'; ctx.fillText(L.dato, x + pw / 2, yy, ancho); ctx.textAlign = 'left'; yy += 10; }
  titulo(T(ROT ? ROT[1] : e.grupo === 'piruetas' ? 'banco_aire' : 'banco_1982'));
  ctx.fillStyle = '#b9a77e'; ctx.font = cartaFontChica();
  for (const l of lineasDe(L.historia, ancho)) { if (yy > y + ph - 4) break; ctx.fillText(l, x + pad, yy); yy += 9; }
}
