// PANTALLAS de narrativa y de fin de mision: recuento, briefing, derribado, victoria y guion.
//
// Cada funcion recibe `w`: un snapshot chico de solo lectura con lo que necesita mostrar. No leen
// estado global — asi se pueden dibujar en cualquier momento (util para probarlas sueltas) y se ve
// de un vistazo de que dependen.
import { ctx, DW as W, DH as H, px, panel, wrapText, titleFont, menuFont, descFont, labelFont } from './ctx.js';
import { P } from '../data/palette.js';
import { T, L } from '../core/i18n.js';
import { wrapChars } from '../core/util.js';
import { clamp01 } from '../core/physics.js';

// Segundos que la pantalla de victoria espera antes de traer la frase de cierre. No es un valor
// de "sensacion" como los de data/tuning.js: es el ritmo de UNA pantalla, y vive con ella.
const VIC_QUOTE_T = 1.1;

// EMBLEMA de las Malvinas (la 4ª "estrella"): silueta real de las islas (assets/images/malvinas.webp,
// islas negras sobre transparente). Se PINTA tiñendo sus píxeles opacos con `source-in` → una versión
// dorada (ganada) y una tenue (falta). Las dos se hornean UNA vez al cargar la imagen.
const MAL = { img: new Image(), ready: false, gold: null, dim: null };
function tintSil(img, color) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext('2d');
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = 'source-in';   // conserva el alfa de las islas, reemplaza el color
  x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  return c;
}
// GANADO = dorado (P.accent) · NO GANADO = BLANCO. Antes el 'no ganado' era gris azulado y se
// perdia contra las ilustraciones de fondo; el blanco se lee sobre cualquier foto.
MAL.img.onload = () => { MAL.ready = true; MAL.gold = tintSil(MAL.img, P.accent); MAL.dim = tintSil(MAL.img, P.ink); };
MAL.img.src = '../assets/ui/malvinas.webp';

// FONDOS DE FIN DE PARTIDA: ilustraciones que reemplazan al mundo del juego detras del recuento y
// del derribado. Se sortea una al terminar (no por cuadro: parpadearia) — el indice lo elige
// game.js y llega en el snapshot, para que estas funciones sigan sin estado propio.
//
// Las rutas van SUELTAS y explicitas (no armadas con plantillas) porque tools/build_web.py las
// re-embebe buscando el literal en el bundle: una ruta construida en runtime no la encontraria.
const WIN_SRC = [
  '../assets/photos/win/win1.jpg',
  '../assets/photos/win/win2.jpg',
  '../assets/photos/win/win3.jpg',
  '../assets/photos/win/win4.jpg',
  '../assets/photos/win/win5.jpg',
];
const LOSE_SRC = [
  '../assets/photos/lose/lose1.jpg',
  '../assets/photos/lose/lose2.jpg',
  '../assets/photos/lose/lose3.jpg',
  '../assets/photos/lose/lose4.png',
  '../assets/photos/lose/lose5.png',
  '../assets/photos/lose/lose6.jpg',
];
// FONDO GENERAL (lobby / selección). ppal01 va PRIMERA y es fija: es la portada con la que
// arranca el juego siempre. El resto rota al azar cada PPAL_ROT segundos (ver game.js).
// Para sumar una foto: copiarla a la carpeta con el proximo numero y agregar la linea aca.
const PPAL_SRC = [
  '../assets/photos/ppal/ppal01.jpg',
  // '../assets/photos/ppal/ppal02.jpg',
  // '../assets/photos/ppal/ppal03.jpg',
  '../assets/photos/ppal/ppal04.jpg',
  '../assets/photos/ppal/ppal05.jpg',
  // '../assets/photos/ppal/ppal06.jpg',
  // '../assets/photos/ppal/ppal07.jpg',
  '../assets/photos/ppal/ppal08.jpg',
  '../assets/photos/ppal/ppal09.jpg',
  '../assets/photos/ppal/ppal10.jpg',
  // '../assets/photos/ppal/ppal11.jpg',
];
// el build web VACIA estas rutas (ver tools/build_web.py): sin ruta no se pide nada y
// drawEndBg cae al fondo opaco de siempre
const load = src => { const i = new Image(); if (src) i.src = src; return i; };
const WIN_BG = WIN_SRC.map(load), LOSE_BG = LOSE_SRC.map(load), PPAL_BG = PPAL_SRC.map(load);
export const WIN_BG_N = WIN_BG.length, LOSE_BG_N = LOSE_BG.length, PPAL_BG_N = PPAL_BG.length;

// Opacidad del velo negro sobre las ilustraciones. En las pantallas de FIN va alto: son las que
// tienen mas texto encima (puntaje, causa, dato historico) y con la foto muy visible se perdian
// las letras. El lobby usa uno mas bajo — ahi la foto casi no compite con texto.
const END_VEIL = 0.78;

/** Dibuja una imagen cubriendo la pantalla (cover: llena sin deformar, recortando el sobrante). */
function cover(img, a) {
  if (!img || !img.naturalWidth) return false;
  const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const w = img.naturalWidth * s, h = img.naturalHeight * s;
  ctx.globalAlpha = a;
  ctx.imageSmoothingEnabled = true;   // se BAJA de ~1024px: suavizar evita el aliasing feo
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  ctx.globalAlpha = 1;
  return true;
}

/** FONDO GENERAL del lobby/seleccion. Cruza de `prev` a `idx` segun `fade` (0..1) — un corte seco
 *  entre dos fotos a pantalla completa es brusco, el cruce lo vuelve intencional. Los relojes y el
 *  sorteo viven en game.js; aca solo se dibuja lo que llega por parametro. */
export function drawPpalBg(prev, idx, fade) {
  const n = PPAL_BG.length;
  const at = i => PPAL_BG[((i | 0) % n + n) % n];
  const f = fade == null ? 1 : Math.max(0, Math.min(1, fade));
  ctx.fillStyle = '#0a0e11'; ctx.fillRect(0, 0, W, H);   // base: tapa el mundo del juego
  if (f < 1) cover(at(prev), 1);
  cover(at(idx), f);
  ctx.fillStyle = '#080d11'; ctx.globalAlpha = 0.45;     // velo tenue: los menus tienen su propio panel()
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

/** Pinta la ilustracion de fin cubriendo la pantalla (cover), con un velo oscuro encima para que
 *  el texto se lea. `a` multiplica el alfa (lo usa el fundido del derribado). Si la imagen no
 *  cargo, deja el fondo opaco de siempre y devuelve false. */
function drawEndBg(list, idx, a) {
  const A = a == null ? 1 : a;
  const img = list[((idx | 0) % list.length + list.length) % list.length];
  ctx.globalAlpha = A; ctx.fillStyle = '#0a0e11'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  const ok = cover(img, A);
  if (ok) {                                              // velo: la foto es ambiente, el texto manda
    ctx.fillStyle = '#080d11'; ctx.globalAlpha = A * END_VEIL;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  return ok;
}

// ---------- RECUENTO DE FIN DE MISION ----------
// Las filas entran de a una acumulando el total; despues caen las estrellas y la calificacion.
// LAS MALVINAS como 4ª "estrella" (rango S): la silueta real de las islas (assets/images/malvinas.webp),
// dorada y con halo cuando se gano, tenue cuando falta. Si la imagen no cargo aun, cae a un vector.
function drawMalvinas(cx, cy, s, won, t, rot) {
  const sc = s * (won ? 1 + Math.sin(t * 4) * 0.04 : 1);   // late apenas cuando se gano
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(rot || 0); ctx.scale(sc, sc);
  if (won) {                                               // halo dorado que pulsa
    ctx.globalAlpha = 0.16 + Math.max(0, Math.sin(t * 4)) * 0.12;
    ctx.fillStyle = P.accent;
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
  }
  const tex = won ? MAL.gold : MAL.dim;
  if (MAL.ready && tex) {
    const w = 20, h = w * MAL.img.naturalHeight / MAL.img.naturalWidth;
    ctx.imageSmoothingEnabled = true;                     // emblema chico: bordes suaves lee mejor
    ctx.drawImage(tex, -w / 2, -h / 2, w, h);
  } else {                                                // fallback vectorial (imagen no cargada)
    ctx.fillStyle = won ? P.accent : P.ink;
    ctx.beginPath();
    ctx.moveTo(-7, -1); ctx.lineTo(-5.5, -3.5); ctx.lineTo(-3, -3); ctx.lineTo(-2.2, -0.5);
    ctx.lineTo(-3.2, 2.2); ctx.lineTo(-5, 3.2); ctx.lineTo(-6.8, 1.5); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-1, -2.8); ctx.lineTo(1.5, -4); ctx.lineTo(4, -3.2); ctx.lineTo(5.2, -1);
    ctx.lineTo(4, 0.2); ctx.lineTo(5, 1); ctx.lineTo(3.6, 2.6); ctx.lineTo(2, 4.2);
    ctx.lineTo(1, 2.4); ctx.lineTo(1.8, 1); ctx.lineTo(-0.2, 0); ctx.lineTo(-1.2, -1);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// GALARDON reutilizable: 3 estrellas + las Malvinas como 4ª, en FILA HORIZONTAL centrada en (cx,cy).
// Lo usan el recuento de fin de nivel (campaña/ciclo) y el DERRIBADO de POR LA PATRIA. `appearT` es el
// reloj de la animacion de entrada: las estrellas entran de a una y las islas al final.
const AWARD_GAP = 16;                                      // separación entre elementos (a escala 1)
/** `sc` agranda todo el galardón. Las pantallas de fin lo muestran GRANDE y arriba de todo: el
 *  premio es lo primero que el jugador tiene que ver, los números vienen después. */
export function drawAward(cx, cy, stars, appearT, t, sc) {
  const S = sc || 1, gap = AWARD_GAP * S;
  // los 4 centros van simétricos alrededor de cx: -1.5·gap .. +1.5·gap. El pequeño corrimiento a la
  // izquierda compensa que las islas (4º) son más anchas que una estrella.
  const x0 = cx - 1.5 * gap - 3 * S;
  for (let i = 0; i < 3; i++) {
    const a = appearT - i * 0.22;
    if (a < 0) continue;
    const on = i < stars, pop = Math.max(0, 1 - a * 4);
    ctx.save();
    ctx.translate(x0 + i * gap, cy); ctx.scale((1 + pop * 0.5) * S, (1 + pop * 0.5) * S);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 13px monospace';
    ctx.fillStyle = on ? P.accent : P.ink;     // ganada dorada · pendiente BLANCA (legible sobre foto)
    ctx.fillText(on ? '★' : '☆', 0, 0);
    ctx.restore();
  }
  const ma = appearT - 3 * 0.22 - 0.15;                   // las Malvinas, un toque despues
  if (ma >= 0) drawMalvinas(x0 + 3 * gap, cy, (1 + Math.max(0, 1 - ma * 3.5) * 0.8) * S, stars >= 4, t, 0);
  ctx.textBaseline = 'alphabetic';                        // el resto de las pantallas asume esto
}

export function drawResults(w) {
  const R = w.lastRun; if (!R) return;
  // FONDO: ilustracion de victoria (antes era un relleno opaco para tapar el mundo del juego,
  // que se colaba entre las filas y lo hacia ilegible; la foto tapa igual y ambienta)
  drawEndBg(WIN_BG, w.bg || 0);
  // ORDEN DE LECTURA: el PREMIO (estrellas + Malvinas) arriba de todo y grande, después el TOTAL,
  // y el desglose abajo como detalle. El desglose sigue entrando fila por fila en su lugar; cuando
  // termina, el premio y el total caen arriba — el remate va donde primero se mira.
  // TITULAR arriba de todo, en la tipografia del logotipo — misma voz que "RASANTE" y que el
  // "DERRIBADO": es el remate de la partida. Debajo, la mision y recien despues los numeros.
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(20);
  ctx.fillText(T('res_title'), W / 2, 22);
  ctx.fillStyle = P.ink; ctx.font = descFont(11);
  ctx.fillText(R.mission.name, W / 2, 36);

  const done = w.resRow >= R.rows.length;
  const stT = w.resT - (R.rows.length * 0.45 + 0.15);

  if (done) {
    // GALARDON: 3 estrellas + las MALVINAS como 4ª (rango "S"). Igual que el remate de la remera.
    drawAward(W / 2, 58, R.stars, stT, w.t, 1.6);
    // TOTAL — el número grande, justo debajo del premio
    ctx.textAlign = 'center'; ctx.fillStyle = P.accent; ctx.font = menuFont(16);
    ctx.fillText(String(R.total), W / 2, 90);
    ctx.fillStyle = P.dim; ctx.font = labelFont(7);
    ctx.fillText(T('res_total'), W / 2, 99);
    if (stT > 0.75) {                                     // calificacion
      ctx.fillStyle = P.foam; ctx.font = menuFont(9);
      ctx.fillText(T('res_rank') + '  ' + T(R.rank), W / 2, 111);
    }
  }

  // desglose: etiqueta a la izquierda, puntos a la derecha (detalle, abajo)
  ctx.font = '7px monospace';
  const y0 = 122;
  for (let i = 0; i < R.rows.length; i++) {
    if (i >= w.resRow) break;
    const r = R.rows[i], y = y0 + i * 11;
    ctx.textAlign = 'left'; ctx.fillStyle = P.dim;
    ctx.fillText(T(r.k) + (r.n !== undefined ? '  ' + r.n : ''), 40, y);
    ctx.textAlign = 'right'; ctx.fillStyle = P.foam;
    ctx.fillText('+' + r.v, W - 40, y);
  }

  if (done) {
    if (stT > 1.1 && Math.sin(w.t * 4) > -0.3) {
      ctx.textAlign = 'center'; ctx.fillStyle = P.accent; ctx.font = descFont(10);
      ctx.fillText(T('continuePrompt'), W / 2, H - 7);
    }
  }
}

// ---------- BRIEFING CORTO (ciclo de muerte / campaña sin guion) ----------
export function drawBrief(w) {
  ctx.fillStyle = '#0a0e11f2'; ctx.fillRect(0, 0, W, H);   // igual que el recuento: fondo opaco
  const m = w.mission;
  ctx.textAlign = 'center';
  ctx.fillStyle = P.dim; ctx.font = '6px monospace';
  ctx.fillText(T('brief_title'), W / 2, 30);
  ctx.fillStyle = P.accent; ctx.font = 'bold 12px monospace';
  ctx.fillText(m.name, W / 2, 48);
  ctx.fillStyle = '#5c6e73'; ctx.font = '6px monospace';
  ctx.fillText(m.date, W / 2, 60);
  // contexto corto de la mision (2-3 lineas, envueltas)
  ctx.fillStyle = P.ink; ctx.font = '7px monospace';
  const txt = T(m.brief);
  const lines = wrapChars(txt, 46);
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 84 + i * 11));
  // objetivo, en el lenguaje del tipo de meta. Si coincide con el titulo (misiones de buque,
  // donde el blanco ES la mision) no se repite: solo aporta en metas de otro tipo (distancia...)
  const goalTxt = w.goalLabel;
  if (goalTxt !== m.name) {
    ctx.fillStyle = P.warn; ctx.font = 'bold 7px monospace';
    ctx.fillText(T('brief_goal') + '  ' + goalTxt, W / 2, 84 + lines.length * 11 + 14);
  }
  if (w.briefT > 0.6 && Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.accent; ctx.font = 'bold 7px monospace';
    ctx.fillText(T('brief_go'), W / 2, H - 16);
  }
}

export function drawDead(w) {
  // la pantalla sube con un fade corto (reveal 0→1) para empalmar con el destrozo que se vio antes
  const rev = w.reveal == null ? 1 : w.reveal;
  ctx.save();
  ctx.globalAlpha = rev;
  drawEndBg(LOSE_BG, w.bg || 0, rev);   // ilustracion de derrota (antes: velo sobre el mundo)
  ctx.globalAlpha = rev;                // drawEndBg deja el alfa en 1
  ctx.textAlign = 'center';
  // ORDEN DE LECTURA: el TITULAR arriba de todo — es lo que pasó — y debajo el resto en orden de
  // importancia: causa, premio, puntaje, dato historico. El titular lleva la tipografia del
  // logotipo: es la misma voz que "RASANTE", el remate de la partida.
  ctx.fillStyle = P.warn; ctx.font = titleFont(22);
  // campaña: nadie murio — la escuadrilla entera quedo averiada y la mision no salio
  ctx.fillText(T(w.out ? 'dead_out' : 'dead'), W / 2, 26);
  ctx.fillStyle = P.dim; ctx.font = descFont(11);
  ctx.fillText(T(w.deathCause), W / 2, 40);

  const hasAward = w.stars > 0 && w.awardT >= 0;
  // POR LA PATRIA: la corrida ENTERA fue el "nivel" → se premia con estrellas segun el puntaje.
  // w.stars viene de game.js (0 en los demas modos, donde el derribado es fracaso y no se premian).
  if (hasAward) drawAward(W / 2, 66, w.stars, w.awardT, w.t, 1.5);

  // PUNTAJE — el número grande
  const yScore = hasAward ? 100 : 74;
  ctx.fillStyle = P.ink; ctx.font = menuFont(14);
  ctx.fillText(T('scoreLabel', { n: Math.floor(w.score) }), W / 2, yScore);
  ctx.fillStyle = Math.floor(w.score) >= w.best && w.best > 0 ? P.accent : P.dim;
  ctx.font = labelFont(9);
  ctx.fillText((Math.floor(w.score) >= w.best && w.best > 0 ? T('newRecord') : T('bestDead', { n: w.best })), W / 2, yScore + 13);

  ctx.fillStyle = '#8a9ba1'; ctx.font = descFont(9);
  wrapText('» ' + L().facts[w.factIdx], W / 2, yScore + 32, 260, 11);
  // PIE: reintentar centrado, volver al menu a la derecha (es la salida, no la accion principal)
  if (w.deathT > 0.7 && Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.accent; ctx.font = descFont(11);
    ctx.fillText(T('retryPrompt'), W / 2, H - 12);
  }
  if (w.deathT > 0.7) {
    ctx.textAlign = 'right'; ctx.fillStyle = P.dim; ctx.font = labelFont(6);
    ctx.fillText(T('menuPrompt'), W - 10, H - 12);
  }
  ctx.restore();
}

// fin de campaña (2 niveles de prueba)
export function drawVictory(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = titleFont(20);
  ctx.fillText('CAMPANA COMPLETADA', W / 2, 34);
  ctx.fillStyle = P.dim; ctx.font = descFont(10);
  ctx.fillText('(2 niveles de prueba - se agregaran mas)', W / 2, 52);
  ctx.fillStyle = P.ink; ctx.font = menuFont(12);
  ctx.fillText('PUNTAJE  ' + Math.floor(w.score), W / 2, 84);

  // CIERRE: la frase de Iorio, ultima cosa que se ve del juego. Entra DESPUES del puntaje
  // (VIC_QUOTE_T) y con fundido propio a proposito: si apareciera junto con el numero se leeria
  // como parte del recuento, y es lo contrario — el puntaje cierra la partida, esto cierra el
  // tema. Por eso ademas va con una linea de separacion y sin el parpadeo del prompt.
  const qa = clamp01((w.levelT - VIC_QUOTE_T) / 1.2);
  if (qa > 0) {
    ctx.globalAlpha = qa;
    ctx.fillStyle = P.dim;
    px(W / 2 - 40, 102, 80, 1, P.dim);                       // filete separador
    ctx.font = descFont(10);
    wrapText(T('quoteIorio'), W / 2, 118, W - 60, 13);
    ctx.fillStyle = P.accent; ctx.font = descFont(9);
    ctx.fillText(T('quoteIorioBy'), W / 2, 148);
    ctx.globalAlpha = 1;
  }

  if (w.levelT > VIC_QUOTE_T + 1.6 && Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.accent; ctx.font = descFont(10);
    ctx.fillText(T('anyKeyMenu'), W / 2, H - 12);
  }
}

// LAMINAS del guion: cada pantalla de historia puede traer `img` (el cuadro del storyboard,
// ej. 'M1_5b') que se busca en assets/story/<img>.png. Las imagenes TODAVIA NO EXISTEN — el
// texto ya asume ese fondo y cuando se generen aparecen solas. Carga perezosa, cache por
// nombre, y si el archivo falta no pasa nada (queda la tarjeta negra de siempre).
const STORY_IMGS = new Map();
function lazyImg(cache, base, name) {
  let e = cache.get(name);
  if (!e) {
    e = { img: new Image(), ok: false };
    e.img.onload = () => { e.ok = true; };
    e.img.src = base + name + '.png';
    cache.set(name, e);
  }
  return e.ok ? e.img : null;
}
function storyImg(name) { return lazyImg(STORY_IMGS, '../assets/story/', name); }
// PLACAS de ambiente (RETRATOS §3: assets/plates/<id>.png) y RETRATOS de dialogo
// (RETRATOS §5: assets/portraits/<cara>.png). Misma cascada: si el asset falta, no pasa nada —
// la placa cae a la tarjeta negra y el retrato a la silueta placeholder de la caja VN.
const PLATE_IMGS = new Map(), PORTRAIT_IMGS = new Map();
function plateImg(name) { return lazyImg(PLATE_IMGS, '../assets/plates/', name); }
function portraitImg(name) { return lazyImg(PORTRAIT_IMGS, '../assets/portraits/', name); }
// tinte del texto por REGISTRO (SISTEMA_DIALOGO.md): 'tierra' = el cuaderno de Mateo (birome);
// 'carta' = el block militar del padre (papel viejo); sin estilo, la tipografia tecnica de siempre.
const STORY_STYLES = { TIERRA: '#8fb4e8', CARTA: '#c9b48a' };

// pantalla de HISTORIA: negro tipo "pantalla de carga" con grano de pelicula y scanline,
// texto tipeado letra a letra con cursor. NO se ve el terreno de juego (eso llega con el fade).
//
// F1 dibuja UNA LINEA POR VEZ (la unidad del motor, core/dialogue.js) sobre la tarjeta negra de
// siempre — que es exactamente el ultimo escalon de la cascada de fallbacks (RF-01: sin ningun
// asset, la escena igual se ve y se juega). Los cuatro registros visuales (la caja VN con busto,
// el CUADRO a pantalla completa, la hoja del cuaderno, el block de la carta) son F2/F3: por ahora
// el tipo solo cambia el tinte del texto.
export function drawStory(w) {
  const d = w.dlg, sc = d.seq[d.si] || {}, ln = (sc.lineas || [])[d.li] || null;
  const tipo = (ln && ln.tipo) || sc.tipo || 'VN';          // una linea puede cambiar de registro
  const img = (ln && ln.img) || sc.img;                     // ...y traer su propio cuadro
  ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, W, H);
  // fondo: el cuadro de la linea/escena (assets/story) o, en VN, la PLACA de ambiente
  // (assets/plates). Si ninguno existe todavia, tarjeta negra — la cascada de RF-01.
  const bg = (img && storyImg(img)) || (sc.placa && plateImg(sc.placa)) || null;
  if (bg) {
    ctx.globalAlpha = 0.85; ctx.drawImage(bg, 0, 0, W, H);
    ctx.globalAlpha = 0.55; ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  // grano de pelicula (parpadea) + una banda de scanline que baja lenta
  ctx.globalAlpha = 0.10;
  for (let i = 0; i < 42; i++) px(Math.random() * W, Math.random() * H, 1, 1, '#8a9ba1');
  ctx.globalAlpha = 0.05;
  px(0, (w.t * 9) % (H + 30) - 15, W, 7, '#eaf6ff');
  ctx.globalAlpha = 1;
  // marco fino (tarjeta de expediente)
  ctx.strokeStyle = '#1c262e'; ctx.strokeRect(8.5, 8.5, W - 17, H - 17);

  const card = tipo === 'TARJETA';
  // ¿Alguien HABLA? → la caja VN de abajo (RF-01, F2): busto + nombre + linea, subiendo desde
  // el borde inferior (referencia visual: la captura estilo Police Stories del 6/8).
  // Las acotaciones (sin personaje), las tarjetas y los registros TIERRA/CARTA siguen con el
  // layout centrado de tarjeta: la caja es de dialogo, no de narracion.
  const vnBox = tipo === 'VN' && ln && ln.personaje;
  // TITULO de la escena: NO se tipea. Es el rotulo del lugar ("RÍO GALLEGOS · LA LÍNEA DE VUELO"),
  // no algo que alguien diga — queda fijo mientras pasan las lineas de la escena.
  if (sc.titulo) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px monospace'; ctx.fillStyle = card ? P.warn : P.accent;
    wrapChars(sc.titulo, 32).forEach((t, i) => ctx.fillText(t, W / 2, (card ? 76 : 34) + i * 14));
  }
  if (vnBox) { drawVNBox(w, d, ln); return; }
  // ---- layout centrado (narracion, tarjeta de nivel, cuaderno y carta) ----
  const yText = card ? 104 : 108;
  ctx.textAlign = 'center';
  // LA LINEA, tipeada. `d.wrap` ya viene partida en renglones por el motor; aca solo se gastan
  // los `d.typed` caracteres que van escritos.
  ctx.font = '7px monospace';
  ctx.fillStyle = STORY_STYLES[tipo] || '#9fb0b6';
  let left = d.typed, curX = W / 2, curY = yText;
  for (let i = 0; i < d.wrap.length; i++) {
    const y = yText + i * 11;
    if (left <= 0) { curY = y - 11; break; }
    const shown = d.wrap[i].slice(0, left);
    left -= d.wrap[i].length + 1;                          // +1: el espacio que comio el wrap
    ctx.fillText(shown, W / 2, y);
    curX = W / 2 + ctx.measureText(shown).width / 2 + 2; curY = y;
  }
  // cursor de maquina de escribir (bloque titilante)
  if (!d.done && Math.sin(d.seqT * 14) > -0.5) px(curX, curY - 6, 4, 7, P.accent);
  // PROMPT de avance. Solo cuando se PUEDE avanzar: durante el `hold` desaparece, y esa ausencia
  // es la señal visible del silencio obligatorio (RF-07).
  const last = d.si + 1 >= d.seq.length && d.li + 1 >= ((sc.lineas || []).length);
  if (w.canAdvance && Math.sin(d.seqT * 4) > -0.3) {
    ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.accent; ctx.textAlign = 'center';
    // el guion de campaña termina en el despegue, pero el EPILOGO sigue al briefing/recuento:
    // ahi corresponde "continuar", no "despegar"
    ctx.fillText(T(last && w.state !== 'epilogue' ? 'startPrompt' : 'continuePrompt'), W / 2, H - 22);
  }
  // progreso: un puntito por LINEA de la escena en curso (la unidad del motor)
  const n = (sc.lineas || []).length;
  for (let i = 0; i < n; i++)
    px(W / 2 - n * 4 + i * 8 + 2, H - 13, 3, 3, i === d.li ? P.accent : '#2e3c45');
}

// LA CAJA VN (F2 del spec, RF-01): panel inferior que SUBE al arrancar la escena, busto del
// hablante asomando por el borde superior, nombre en acento y la linea tipeada a la izquierda.
// Cascada de assets: retrato real (assets/portraits/<cara>.png) → SILUETA placeholder (el mock
// del 6/8: la caja se ve completa hoy, sin un solo asset generado) → sin `cara`, solo nombre.
function drawVNBox(w, d, ln) {
  const k = Math.min(1, d.sceneT / 0.35), ease = 1 - Math.pow(1 - k, 3);   // entrada: sube
  // la caja CRECE con los renglones: el guion viejo trae lineas largas (hasta que se parta en
  // lineas del modelo nuevo, D2) y truncarlas seria peor que una caja mas alta
  const rows = Math.max(2, d.wrap.length);
  const bx = 6, bw = W - 12, bh = Math.max(46, 26 + rows * 10);
  const by = (H - bh - 6) + (1 - ease) * (bh + 16);
  // panel oscuro con doble borde, el estilo de expediente del juego
  ctx.globalAlpha = 0.94; ctx.fillStyle = '#070b0f'; ctx.fillRect(bx, by, bw, bh);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#2c3a44'; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
  ctx.strokeStyle = '#141d24'; ctx.strokeRect(bx + 2.5, by + 2.5, bw - 5, bh - 5);
  let tx0 = bx + 10, nameX = null;
  if (ln.cara) {
    // busto 36x36 que ASOMA por encima de la caja (como en la referencia)
    const px0 = bx + 8, py0 = by - 12, ps = 36;
    ctx.fillStyle = '#0d1319'; ctx.fillRect(px0, py0, ps, ps);
    const im = portraitImg(ln.cara);
    if (im) ctx.drawImage(im, px0, py0, ps, ps);
    else {
      // MOCK: silueta de busto (cabeza + hombros con luz de canto) hasta que exista el retrato
      ctx.fillStyle = '#22303b';
      ctx.fillRect(px0 + 13, py0 + 6, 10, 11);       // cabeza
      ctx.fillRect(px0 + 15, py0 + 17, 6, 3);        // cuello
      ctx.fillRect(px0 + 6, py0 + 20, 24, 16);       // hombros
      ctx.fillStyle = '#31434f';
      ctx.fillRect(px0 + 13, py0 + 6, 3, 11); ctx.fillRect(px0 + 6, py0 + 20, 4, 16);
    }
    ctx.globalAlpha = 0.7; ctx.strokeStyle = P.accent;
    ctx.strokeRect(px0 + 0.5, py0 + 0.5, ps - 1, ps - 1); ctx.globalAlpha = 1;
    tx0 = px0 + ps + 10; nameX = px0 + ps / 2;
  }
  // nombre: debajo del busto (o arriba del texto si no hay cara), con su subrayado de acento
  ctx.font = 'bold 7px monospace'; ctx.fillStyle = P.accent;
  if (nameX !== null) {
    ctx.textAlign = 'center'; ctx.fillText(ln.personaje, nameX, by + bh - 6);
    const nw = ctx.measureText(ln.personaje).width;
    px(nameX - nw / 2, by + bh - 4, nw, 1, P.accent);
  } else {
    ctx.textAlign = 'left'; ctx.fillText(ln.personaje, tx0, by + 11);
  }
  // la linea, tipeada a la izquierda (los renglones ya vienen partidos por el motor)
  const ty0 = ln.cara ? by + 14 : by + 22;
  ctx.textAlign = 'left'; ctx.font = '7px monospace'; ctx.fillStyle = P.ink;
  let left = d.typed, curX = tx0, curY = ty0;
  for (let i = 0; i < d.wrap.length; i++) {
    const y = ty0 + i * 10;
    if (left <= 0) { curY = y - 10; break; }
    const shown = d.wrap[i].slice(0, left);
    left -= d.wrap[i].length + 1;
    ctx.fillText(shown, tx0, y);
    curX = tx0 + ctx.measureText(shown).width + 2; curY = y;
  }
  if (!d.done && Math.sin(d.seqT * 14) > -0.5) px(curX, curY - 6, 4, 7, P.accent);
  // "OK ▼": el permiso de avanzar. Durante un `hold` no esta — ese vacio ES el silencio (RF-07).
  if (w.canAdvance && Math.sin(d.seqT * 4) > -0.3) {
    ctx.textAlign = 'right'; ctx.font = 'bold 7px monospace'; ctx.fillStyle = P.accent;
    ctx.fillText('OK', bx + bw - 16, by + bh - 6);
    px(bx + bw - 13, by + bh - 11, 5, 2, P.accent); px(bx + bw - 12, by + bh - 9, 3, 2, P.accent);
    px(bx + bw - 11, by + bh - 7, 1, 2, P.accent);
  }
}
