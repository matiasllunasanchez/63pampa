// PANTALLAS de narrativa y de fin de mision: recuento, briefing, derribado, victoria y guion.
//
// Cada funcion recibe `w`: un snapshot chico de solo lectura con lo que necesita mostrar. No leen
// estado global — asi se pueden dibujar en cualquier momento (util para probarlas sueltas) y se ve
// de un vistazo de que dependen.
import { ctx, DW as W, DH as H, px, panel, wrapText, titleFont, menuFont, descFont, labelFont, handFont } from './ctx.js';
import { P } from '../data/palette.js';
import { T, L } from '../core/i18n.js';
import { wrapChars } from '../core/util.js';
import { clamp01 } from '../core/physics.js';
import { radio, restante, visible, log } from '../core/radioVN.js';
import { sinceReady, txtOf } from '../core/dialogue.js';
import { PLACA_DE_CUADRO } from '../data/placas.js';

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
// arranca el juego siempre, y ademas dura mas que las otras (ver PPAL_SEG, abajo). El resto rota
// al azar cada PPAL_ROT segundos (ver game.js).
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

// CUANTO DURA CADA FONDO, por indice de PPAL_SRC. Las que no estan aca duran lo de siempre.
//
// No todas las fotos valen lo mismo. ppal01 es LA ESCUADRILLA —los seis caminando hacia los
// aviones, dibujados como los personajes de esta historia— y es la primera que se ve al abrir el
// juego. Ocho segundos alcanzan para una foto de archivo que ilustra; no alcanzan para una en la
// que hay gente que el jugador va a conocer, y a la que va a querer volver a mirar despues de
// jugar. Las demas ilustran; esta presenta.
//
// Es una tabla y no un `if (idx === 0)` porque la pregunta "cuanto dura esta foto" se va a volver
// a hacer con la proxima que valga la pena, y un `if` por foto se convierte en cinco `if`.
const PPAL_SEG = { 0: 20 };

/** Segundos que dura el fondo `i` del lobby. `def` es el valor de siempre (PPAL_ROT). */
export const ppalSeg = (i, def) => PPAL_SEG[((i | 0) % PPAL_BG_N + PPAL_BG_N) % PPAL_BG_N] || def;

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
function lazyImg(cache, base, name, ext) {
  let e = cache.get(name);
  if (!e) {
    e = { img: new Image(), ok: false };
    e.img.onload = () => { e.ok = true; };
    e.img.src = base + name + (ext || '.png');
    cache.set(name, e);
  }
  return e.ok ? e.img : null;
}
// EN WEBP, igual que las placas y por el mismo motivo: son fondos de pantalla completa y en PNG
// pesarian cerca de 800 KB cada uno. Los prepara `install_placas.py --que cuadros`.
function storyImg(name) { return lazyImg(STORY_IMGS, '../assets/story/', name, '.webp'); }
// PLACAS de ambiente (RETRATOS §3: assets/plates/<id>.png) y RETRATOS de dialogo
// (RETRATOS §5: assets/portraits/<cara>.png). Misma cascada: si el asset falta, no pasa nada —
// la placa cae a la tarjeta negra y el retrato a la silueta placeholder de la caja VN.
const PLATE_IMGS = new Map(), PORTRAIT_IMGS = new Map();
// Las placas van en WEBP y no en PNG: son 32 imagenes de pantalla completa, y en PNG pesarian
// cerca de 800 KB cada una contra los ~90 KB del webp. Con el techo de 16 MB del build web esa
// diferencia decide si entran o no. Las genera tools/install_placas.py desde los originales.
function plateImg(name) { return lazyImg(PLATE_IMGS, '../assets/plates/', name, '.webp'); }
function portraitImg(name) { return lazyImg(PORTRAIT_IMGS, '../assets/portraits/', name); }
// tinte del texto por REGISTRO (SISTEMA_DIALOGO.md): 'carta' = el block militar del padre (papel
// viejo); sin estilo, la tipografia tecnica de siempre.
//
// TIERRA YA NO ESTA EN ESTA TABLA. El cuaderno de Mateo dejo de ser "el layout de siempre con otro
// color de texto" y paso a tener pantalla propia (drawCuaderno), con su tinta, su letra a mano y
// su hoja — un tinte solo no alcanzaba para que una carta escrita a birome pareciera una carta.
const STORY_STYLES = { CARTA: '#c9b48a' };

// EL INTERSTICIAL: negro pleno con una linea de texto, y nada mas.
//
// Lo usa la campaña para dos cosas (PENDIENTES_GUION G-09): el TITULO DE LA MISION unos segundos
// antes de que aparezca la escena con imagen, y el «DIA SIGUIENTE» entre una mision y la que sigue.
//
// POR QUE NEGRO PLENO Y NO UNA TARJETA. La tarjeta de mision ya existe y tiene marco, placa y dos
// lineas de datos: es una PANTALLA. Esto es un RESPIRO — el corte que separa dos cosas para que no
// se lean como una sola. Si tuviera marco dejaria de separar y pasaria a ser una pantalla mas.
//
// Comparte el grano y la scanline con drawStory a proposito: tiene que verse de la misma familia,
// no de otro juego. Sin marco de expediente, que es lo unico que lo distingue.
//
// `p` es 0..1: el avance del intersticial. Entra y sale con un fundido corto — el texto aparece
// despues del negro y se va antes, asi el corte nunca deja el texto colgado sobre la escena.
export function interstitial(txt, p, t) {
  ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, W, H);
  // grano y scanline, iguales a los de la pantalla de historia
  ctx.globalAlpha = 0.10;
  for (let i = 0; i < 42; i++) px(Math.random() * W, Math.random() * H, 1, 1, '#8a9ba1');
  ctx.globalAlpha = 0.05;
  px(0, ((t || 0) * 9) % (H + 30) - 15, W, 7, '#eaf6ff');
  ctx.globalAlpha = 1;
  // el texto vive en el tercio central del intersticial: 0.2 para entrar, 0.2 para salir
  const a = clamp01(Math.min(p / 0.2, (1 - p) / 0.2));
  if (a <= 0 || !txt) return;
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  // LA TIPOGRAFIA ES LA DE LA TARJETA DE MISION, literalmente la misma que `drawStory` usa para
  // `sc.titulo` cuando la escena es TARJETA: `bold 11px monospace` en `P.warn`. Y no es un gusto:
  // el uso principal de esta pantalla es el NOMBRE DE LA MISION unos segundos antes de la escena,
  // o sea que el jugador va a ver el mismo texto dos veces seguidas. Con dos fuentes distintas se
  // leen como dos pantallas de dos juegos; con la misma, la negra es la que ANTICIPA a la otra.
  //
  // (Antes iba con `titleFont(16)` en `P.accent` — el logotipo del menu, que es la familia de la
  // PORTADA y no la del expediente.)
  ctx.fillStyle = P.warn; ctx.font = 'bold 11px monospace';
  // SE PARTE EN RENGLONES, con el mismo ancho de 32 caracteres que la tarjeta. Sin esto los
  // titulos largos del guion —«EL DIA QUE SANGRO EL MAR»— se salen de los 320 de ancho del
  // espacio de DISEÑO y quedan cortados contra los bordes. El bloque se centra de verdad: con dos
  // renglones, uno queda arriba y otro abajo del medio, no los dos por debajo.
  const ls = wrapChars(String(txt).toUpperCase(), 32);
  const y0 = H / 2 + 4 - (ls.length - 1) * 7;
  ls.forEach((t2, i) => ctx.fillText(t2, W / 2, y0 + i * 14));
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

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
  // cascada de tres: el CUADRO propio de la escena si existe, si no la PLACA del lugar donde
  // pasa ese cuadro (data/placas.js), si no la que la escena declare a mano. Y si no hay
  // ninguna, tarjeta negra — RF-01 otra vez.
  const bg = (img && storyImg(img))
    || (img && PLACA_DE_CUADRO[img] && plateImg(PLACA_DE_CUADRO[img]))
    || (sc.placa && plateImg(sc.placa)) || null;
  // DONDE CAE LA LAMINA: ENCAJADA Y CENTRADA, nunca estirada. Las placas de AIRE son 16:9 y llenan
  // la pantalla, pero las paginas del cuaderno son 3:4 VERTICAL: estiradas a lo ancho no se leen
  // como una hoja. Se escala por el lado que primero toca el borde y el resto queda en negro, que
  // es como se ve una hoja puesta sobre una pantalla.
  //
  // El rectangulo se calcula ANTES de dibujar porque el cuaderno lo necesita para saber donde esta
  // la hoja izquierda: sus margenes son fracciones de la lamina, no de la pantalla.
  const lam = bg ? (() => {
    const e = Math.min(W / bg.naturalWidth, H / bg.naturalHeight);
    const bw = bg.naturalWidth * e, bh = bg.naturalHeight * e;
    return { x: (W - bw) / 2, y: (H - bh) / 2, w: bw, h: bh };
  })() : null;
  // EL CUADERNO SE VA POR SU PROPIA PUERTA, y antes de todo lo demas: no le sirve el velo (la hoja
  // ES el fondo), ni el grano frio, ni la linea de barrido, ni el marco de expediente, ni el texto
  // centrado en el medio de la pantalla. Ver drawCuaderno.
  //
  // Y SE LLEVA LA HOJA, NO EL FONDO. De la cascada de tres solo le sirve el PRIMER escalon: la
  // carilla dibujada de la escena (assets/story/carta*.webp), que es una hoja abierta con el
  // renglonado libre a la izquierda. La placa de ambiente NO es una hoja — `p1c_cuaderno` es un
  // dibujo de Mateo escribiendo, en vertical, y la letra le caia encima de las rodillas y no se
  // leia una palabra. Sin carilla propia, drawCuaderno pinta la suya (RF-01).
  if (tipo === 'TIERRA') { drawCuaderno(w, d, sc, ln, (img && storyImg(img)) || null); return; }
  if (bg) {
    ctx.globalAlpha = 0.85;
    ctx.drawImage(bg, lam.x, lam.y, lam.w, lam.h);
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
  // Las acotaciones (sin personaje), las tarjetas y el registro CARTA siguen con el layout
  // centrado de tarjeta: la caja es de dialogo, no de narracion.
  // LA NARRACION TAMBIEN VA A LA CAJA (pedido de Matias, 27/8).
  //
  // Antes las lineas sin personaje —"Un campo en la provincia. Un Rastrojero oxidado…"— se
  // tipeaban CENTRADAS EN EL MEDIO DE LA PANTALLA, encima de la placa. Es el peor lugar posible:
  // tapa justo el centro de la imagen, que es lo que la placa tiene para mostrar, y ademas cambia
  // de sitio respecto del dialogo, asi que el ojo salta arriba y abajo entre una linea y la
  // siguiente de la MISMA escena.
  //
  // Ahora usa la misma caja de abajo, sin busto y sin nombre —no la dice nadie— y en tinta
  // apagada, que es lo que la distingue del dialogo sin necesitar otro tipo ni otra alineacion.
  // La imagen queda entera arriba y el texto siempre aparece en el mismo lugar.
  // (Ademas iba CENTRADA hasta el 29/8; ver la nota en cajaVN de por que se alineo a la izquierda.)
  //
  // CARTA NO entra aca: ese registro es el papel del block del padre, y ahi el texto ES la
  // pantalla — meterlo en una caja lo volveria un dialogo mas. (TIERRA tampoco, pero ese ya se
  // fue antes por la puerta de drawCuaderno.)
  //
  // LA LINEA DE NARRADOR DE UNA ESCENA DEL CUADERNO SI ENTRA, y por eso este renglon importa: en
  // P4_1, "Esa misma semana, empezaba la guerra." no la escribio Mateo, asi que no sale con su
  // letra en su hoja — cae aca, en la caja de abajo, sobre la pagina oscurecida. El corte de la
  // hoja limpia al velo es la marca de que dejo de hablar la carta.
  const esNarracion = tipo === 'NARRADOR' || (tipo === 'VN' && ln && !ln.personaje);
  const vnBox = ln && (esNarracion || (tipo === 'VN' && ln.personaje));
  // EL TITULO DE ESCENA NO SE DIBUJA MAS (pedido de Matias, 29/8/2026).
  //
  // Era el rotulo de ubicacion arriba a la izquierda —"RÍO GALLEGOS · LA LÍNEA DE VUELO"— y venia
  // de la idea de cine: se lee una vez, de reojo, y se sale del camino. Lo que pasa en la practica
  // es que las placas de ambiente YA DICEN DONDE ESTAMOS, mucho mejor que cinco pixeles de texto:
  // la linea de vuelo al amanecer se reconoce sin que nadie la nombre. El rotulo quedaba
  // duplicando la imagen y, sobre las placas claras, ensuciandola.
  //
  // EL DATO NO SE BORRA: `titulo` sigue en cada escena de data/story.js, lo lee la sonda `__sdbg`
  // y lo imprimen los fixtures (asi se sabe en que escena estas sin mirar la pantalla). Lo que se
  // fue es el dibujo, que es la decision que se puede volver atras en un renglon.
  //
  // LA TARJETA DE NIVEL ES LA EXCEPCION y conserva su titulo grande al centro: ahi el nombre de la
  // mision ES el contenido de la pantalla. Ya no dice "MISIÓN N —" (pedido de Matias, 30/8): el
  // numero de capitulo, cuando la escena lo trae (`capitulo` en data/story.js), se pinta chico y
  // aparte arriba del nombre — no pegado en la misma linea.
  if (sc.titulo && card) {
    ctx.textAlign = 'center';
    let ty = 76;
    if (sc.capitulo) {
      ctx.font = '6px monospace'; ctx.fillStyle = '#7d8f97';
      ctx.fillText(`CAPÍTULO ${sc.capitulo}`, W / 2, ty);
      ty += 12;
    }
    ctx.font = 'bold 11px monospace'; ctx.fillStyle = P.warn;
    wrapChars(sc.titulo, 32).forEach((t, i) => ctx.fillText(t, W / 2, ty + i * 14));
  }
  if (vnBox) { drawVNBox(w, d, ln, d.si + 1 >= d.seq.length && d.li + 1 >= ((sc.lineas || []).length), esNarracion); return; }
  // ---- layout centrado (narracion, tarjeta de nivel, cuaderno y carta) ----
  const yText = card ? 104 : 108;
  ctx.textAlign = 'center';
  // LA LINEA, tipeada. `d.wrap` ya viene partida en renglones por el motor; aca solo se gastan
  // los `d.typed` caracteres que van escritos.
  ctx.font = '7px monospace';
  // EL NARRADOR NO ES UN PERSONAJE, y hasta ahora se veia igual que uno.
  //
  // En una escena del cuaderno todo el texto salia con la tinta azul de la birome de Mateo —
  // incluidas las lineas que Mateo NO escribio, como "Esa misma semana empezaba la guerra". Las
  // leia como parte de la carta, en la voz del pibe, y eso le cambia el sentido: una cosa es que
  // el narrador cierre el prologo y otra es que un chico de dieciocho lo prediga.
  //
  // Una linea con `tipo: 'NARRADOR'` se pinta en gris frio, fuera del registro de la escena: no
  // es tinta, no es voz, es el juego hablando.
  const narra = ln && ln.tipo === 'NARRADOR';
  ctx.fillStyle = narra ? '#7d8f97' : (STORY_STYLES[tipo] || '#9fb0b6');
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
  // el guion de campaña termina en el despegue, pero el EPILOGO sigue al briefing/recuento:
  // ahi corresponde "continuar", no "despegar"
  promptAvanzar(w, d, last);
  // progreso: un puntito por LINEA de la escena en curso (la unidad del motor)
  const n = (sc.lineas || []).length;
  for (let i = 0; i < n; i++)
    px(W / 2 - n * 4 + i * 8 + 2, H - 13, 3, 3, i === d.li ? P.accent : '#2e3c45');
}

// ---------- EL CUADERNO DE MATEO (registro TIERRA) ----------
//
// Las cartas del pibe son el unico texto del juego que no dice una maquina: las escribe una
// persona, a mano, con una birome, sobre un cuaderno de hojas rayadas que el jugador tiene
// delante. Hasta el 29/8/2026 se dibujaban igual que todas las demas pantallas —monospace,
// centradas en el medio, con el velo negro al 55% encima de la lamina— y eso las volvia una
// pantalla de sistema con una foto de cuaderno atras.
//
// Ahora la pantalla ES la hoja (pedido de Matias, 29/8/2026). De ahi salen las cuatro decisiones
// de este bloque, y ninguna es de gusto:
//
//   1. EL TEXTO VA EN LA HOJA IZQUIERDA. Las catorce laminas (assets/story/carta*.webp) estan
//      dibujadas con el dibujo a la DERECHA del espiral y la hoja izquierda RAYADA Y VACIA. El
//      hueco ya estaba hecho y el texto se dibujaba encima del dibujo.
//   2. LA LETRA ES MANUSCRITA (handFont, ver FONTS.mano en render/ctx.js) y de la MISMA TINTA que
//      los dibujos de la lamina — el azul esta medido sobre carta1_p4.webp. Es la misma birome
//      que dibujo el colectivo 60 de la primera pagina.
//   3. NO HAY VELO. La lamina va a alfa 1 y el unico oscuro que queda es la franja de abajo, que
//      es donde viven los controles y los puntos de avance.
//   4. LOS CONTROLES VAN ABAJO, EN SU PROPIA FRANJA RESERVADA (ver promptCuaderno).
//
// Es un layout PROPIO, no una variante del centrado, y vale SOLO para TIERRA. Las cartas del padre
// (CARTA) siguen con el layout de siempre: son otro papel, otra letra y otra mano.
//
// LA LINEA DE NARRADOR NO ENTRA ACA, y es a proposito. Una linea con `tipo: 'NARRADOR'` dentro de
// una escena del cuaderno —"Esa misma semana, empezaba la guerra."— no la escribio Mateo, asi que
// se va por el camino de siempre: la caja de dialogo de abajo, sobre la pagina oscurecida. Ese
// corte de la hoja iluminada al velo ES la marca de que dejo de hablar la carta.
const CUAD = {
  // LA BIROME. `tinta` es el azul medido sobre los dibujos de la lamina (la mediana de sus pixeles
  // azules, #2f337e): la letra y el dibujo salen del mismo boligrafo. `fresca` es esa tinta
  // aguada, para los caracteres que estan saliendo de la punta ahora mismo.
  tinta: '#2a3178', fresca: '#616ac0',
  papel: '#fbf7e6',          // el crema de la hoja, medido igual. Solo se usa si la lamina no cargo
  cuerpo: 9, paso: 12,       // cuerpo de la letra y separacion de renglones, en unidades de diseño
  minEsc: 0.74,              // hasta donde se achica la letra cuando una carta larga no entra
  fresco: 6,                 // cuantos caracteres quedan "mojados" detras de la punta
  // LA ZONA DE LOS CONTROLES, abajo de todo. Es una franja RESERVADA (pedido de Matias,
  // 29/8/2026): la carta se corta antes de llegar, siempre, aunque le sobren renglones. Por eso
  // `franja` la usan LOS DOS —el degrade oscuro y el piso de la caja de escritura— y no hay dos
  // numeros que se puedan despegar: subirla o bajarla mueve las dos cosas juntas.
  franja: 22,
  aire: 3,                   // lo que separa el ultimo renglon de la carta del borde de esa zona
  // LA COLUMNA DE ESCRITURA, en fracciones del rectangulo de la LAMINA y no de la pantalla: la
  // lamina entra encajada y centrada, asi que en fracciones los margenes sobreviven a cualquier
  // tamaño de imagen y al letterbox. Medidos sobre carta1_p4.webp (960x536): el rayado de la hoja
  // izquierda va de x=34 a x=450 y de y=80 a y=509, y el espiral esta en x=480. Estos numeros
  // dejan margen adentro de eso — el que deja cualquiera que escribe en un cuaderno.
  x0: 0.075, x1: 0.440, y0: 0.150, y1: 0.945,
};

// EL TEMBLOR DE LA MANO: un desvio fijo por renglon —siempre el mismo, asi no parpadea entre
// cuadros— y distinto en cada uno. Es la diferencia entre escrito e impreso: ningun renglon a mano
// cae exactamente sobre la raya, ni arranca en el mismo punto, ni queda paralelo al de arriba.
const pulso = (i, sem) => { const x = Math.sin((i + 1) * 12.9898 + sem * 78.233) * 43758.5453; return x - Math.floor(x); };

/** Parte el texto en renglones MIDIENDO EN PIXELES con la tipografia activa, y devuelve para cada
 *  uno donde arranca en el texto crudo — que es lo que permite saber cuantos caracteres de ESE
 *  renglon ya se escribieron a partir del `typed` del motor, que cuenta sobre el texto entero.
 *
 *  Hace falta uno propio porque `wrapChars` mide en CARACTERES: con una manuscrita proporcional
 *  eso deja un renglon corto y el siguiente pasado de largo. */
function wrapTinta(txt, maxW) {
  const filas = []; let ini = 0, linea = '', pos = 0;
  for (const p of txt.split(' ')) {
    const arranque = pos; pos += p.length + 1;
    const cand = linea ? linea + ' ' + p : p;
    if (linea && ctx.measureText(cand).width > maxW) { filas.push({ txt: linea, from: ini }); ini = arranque; linea = p; }
    else linea = cand;
  }
  if (linea) filas.push({ txt: linea, from: ini });
  return filas;
}

// El wrap se recalcula SOLO cuando cambia la linea (o la fuente, o el ancho de la columna): medir
// en pixeles cuesta, y la carta mas larga del guion —289 caracteres— se parte de nuevo hasta siete
// veces buscando el cuerpo que entra en la hoja. La FUENTE va en la clave porque handFont devuelve
// monospace hasta que Mayorice termina de cargar: si el wrap quedara cacheado con la metrica del
// monospace, la carta se veria mal partida para siempre.
const cuadCache = { clave: '', filas: [], esc: 1 };

function drawCuaderno(w, d, sc, ln, hoja) {
  ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, W, H);
  let lam;
  if (hoja) {
    // ENCAJADA Y CENTRADA, nunca estirada, y a ALFA 1: la hoja no es una foto atras del texto, es
    // el papel sobre el que esta escrito.
    const e = Math.min(W / hoja.naturalWidth, H / hoja.naturalHeight);
    const bw = hoja.naturalWidth * e, bh = hoja.naturalHeight * e;
    lam = { x: (W - bw) / 2, y: (H - bh) / 2, w: bw, h: bh };
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(hoja, lam.x, lam.y, lam.w, lam.h);
  } else {
    // ULTIMO ESCALON DE LA CASCADA (RF-01: sin un solo asset la escena se ve y se juega). Sin
    // carilla dibujada se pinta una a mano —crema, renglonada, con el lomo en el medio— y la
    // carta se sigue leyendo, que es lo unico que no se puede perder. La tarjeta negra de las
    // otras pantallas no sirve aca: tinta azul sobre negro no se lee.
    //
    // HOY LA USA UNA SOLA ESCENA: M11_CARTA, «LA ÚLTIMA CARTA · SIN COPIAR». El guion tiene
    // quince cartas y assets/story tiene catorce carillas; a esa le falta la suya.
    lam = { x: 6, y: 6, w: W - 12, h: H - 12 };
    ctx.fillStyle = '#151109'; ctx.fillRect(lam.x - 2, lam.y - 2, lam.w + 4, lam.h + 4);
    ctx.fillStyle = CUAD.papel; ctx.fillRect(lam.x, lam.y, lam.w, lam.h);
    for (let y = lam.y + 10; y < lam.y + lam.h - 8; y += 6.5) px(lam.x + 8, y, lam.w - 16, 0.5, '#ddd4b8');
    px(W / 2 - 1, lam.y + 2, 2, lam.h - 4, '#cdc09c');       // el lomo, donde iria el espiral
  }
  // GRANO DE PAPEL: motas OSCURAS, pocas y quietas dentro de la hoja. El grano frio del resto de
  // las pantallas es gris claro sobre negro; sobre el crema, sencillamente no existe.
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 30; i++) px(Math.random() * W, Math.random() * (H - CUAD.franja), 1, 1, '#6b5f42');
  ctx.globalAlpha = 1;
  // LA FRANJA DE ABAJO — el unico oscuro que queda en la pantalla, y no es decoracion: los
  // controles son de color claro y sobre papel crema no se leerian. Es ademas la zona RESERVADA:
  // la carta se corta antes (ver `bh` mas abajo), asi que aca nunca hay dos textos encimados.
  // Tres paradas y no dos: con un degrade lineal la zona util —los ultimos 8 px, donde caen las
  // palabras— se quedaba a mitad de camino, y sobre las carillas de fondo mas claro el naranja del
  // acento se lavaba. La parada del medio adelanta el oscuro y deja el arranque igual de suave.
  const gr = ctx.createLinearGradient(0, H - CUAD.franja, 0, H);
  gr.addColorStop(0, 'rgba(8,11,16,0)');
  gr.addColorStop(0.55, 'rgba(8,11,16,0.55)');
  gr.addColorStop(1, 'rgba(8,11,16,0.90)');
  ctx.fillStyle = gr; ctx.fillRect(0, H - CUAD.franja, W, CUAD.franja);

  // ---- la columna de la hoja izquierda ----
  const bx = lam.x + lam.w * CUAD.x0, bw = lam.w * (CUAD.x1 - CUAD.x0);
  const by = lam.y + lam.h * CUAD.y0;
  // EL PISO MANDA SOBRE LA LAMINA. La caja mide lo que dice la lamina O lo que queda hasta la zona
  // reservada, lo que sea MENOS: una carta larga se achica (el autoajuste de abajo) antes que
  // meter un renglon abajo de los botones. Sin este `min`, la carilla del cuaderno da de si hasta
  // y = 169 y la zona empieza en 158 — once pixeles de superposicion esperando una carta larga.
  const bh = Math.min(lam.h * (CUAD.y1 - CUAD.y0), (H - CUAD.franja - CUAD.aire) - by);
  ctx.textAlign = 'left';
  // SIN ENCABEZADO (pedido de Matias, 29/8/2026). El titulo de la escena ("CARTA DE MATEO", "LA
  // PRIMERA PÁGINA DEL CUADERNO") se dibujaba arriba de la columna, con la misma tinta aguada.
  // Se lo comio su propia logica: la pantalla ya ES un cuaderno abierto y la letra ya ES la de
  // Mateo — un renglon que dice "carta de Mateo" arriba de la carta de Mateo no agrega nada y le
  // roba el primer renglon a la unica voz de la pagina. El dato sigue en los datos y en la sonda
  // (ver la nota en drawStory); lo que se fue es el dibujo.
  const y0 = by;

  // ---- la carta, partida y escrita ----
  const txt = txtOf(ln), alto = bh - (y0 - by);
  const clave = (ln && ln.id ? ln.id : '') + '|' + txt.length + '|' + Math.round(bw) + '|' + handFont(CUAD.cuerpo);
  if (cuadCache.clave !== clave) {
    // BUSCA EL CUERPO QUE ENTRA. Casi todas las cartas entran en el tamaño nominal; las dos o tres
    // largas del guion se achican unos puntos antes que perder un renglon abajo del borde. Que la
    // letra de una pagina sea un poco mas chica que la de otra es exactamente lo que pasa en un
    // cuaderno de verdad cuando el que escribe ve que no le va a alcanzar la hoja.
    let esc = 1, filas;
    for (;;) {
      ctx.font = handFont(CUAD.cuerpo * esc);
      filas = wrapTinta(txt, bw);
      if (filas.length * CUAD.paso * esc <= alto || esc <= CUAD.minEsc) break;
      esc = Math.max(CUAD.minEsc, esc - 0.04);
    }
    cuadCache.clave = clave; cuadCache.esc = esc;
    cuadCache.filas = filas;
    // SI NI ACHICANDO ENTRA, SE AVISA. Una carta que se pasa de hoja no se ve rota: se ve como
    // una carta a la que le falta el final, y eso no se descubre mirando —hay que estar leyendo
    // justo esa— asi que lo tiene que gritar la consola. El aviso sale UNA vez por linea (esta
    // adentro del recalculo) y lo levantan los fixtures, que juntan lo que la consola escupe.
    // Se avisa y se dibuja igual: es preferible una carta que se desborda a una carta cortada.
    if (filas.length * CUAD.paso * esc > alto)
      console.warn(`cuaderno: la carta ${ln && ln.id} no entra en la hoja ` +
        `(${filas.length} renglones al ${Math.round(esc * 100)}%, entran ${Math.floor(alto / (CUAD.paso * esc))}) — ` +
        `hay que partirla en dos lineas de guion`);
  }
  const esc = cuadCache.esc, filas = cuadCache.filas, paso = CUAD.paso * esc;
  ctx.font = handFont(CUAD.cuerpo * esc);
  // UN TRAZO DE BIROME va DOS VECES: la segunda apenas corrida y muy tenue. Un boligrafo no deja
  // un borde limpio — deja el trazo y un halo del lado donde la punta se apoya. Sin eso la letra
  // se ve nitida como una fuente y no espesa como tinta.
  const trazo = (str, x, y, a) => {
    ctx.fillStyle = CUAD.tinta;
    ctx.globalAlpha = a * 0.30; ctx.fillText(str, x + 0.35, y + 0.35);
    ctx.globalAlpha = a; ctx.fillText(str, x, y);
    ctx.globalAlpha = 1;
  };
  const sem = (ln && ln.id ? ln.id.length : 0) + d.li * 3;    // el temblor es fijo por linea
  // CUANTO SE VE DE CADA RENGLON, contado antes de dibujar nada. Hace falta saber CUAL es el
  // ultimo renglon escrito antes de empezar: la tinta fresca es solo la del renglon donde esta la
  // punta ahora, no la de los seis ultimos caracteres de cada renglon (que es lo que salia si se
  // decidia renglon por renglon — y dejaba la ultima palabra de TODOS los renglones destiñida).
  const visto = filas.map(f => Math.max(0, Math.min(f.txt.length, d.typed - f.from)));
  let ultimo = -1;
  for (let i = 0; i < filas.length; i++) if (visto[i] > 0) ultimo = i;
  let puntaX = bx, puntaY = y0;
  for (let i = 0; i <= ultimo; i++) {
    const f = filas[i], vis = visto[i];
    const yy = y0 + i * paso + (pulso(i, sem) - 0.5) * 1.4;
    const xx = bx + (pulso(i, sem + 7) - 0.5) * 1.6;
    ctx.save();
    ctx.translate(xx, yy);
    ctx.rotate((pulso(i, sem + 3) - 0.5) * 0.014);            // menos de medio grado de inclinacion
    // LA TINTA QUE TODAVIA NO ASENTO. Los ultimos caracteres escritos entran palidos y se van
    // afirmando: es lo que reemplaza al cursor de bloque titilante del resto del juego. Un
    // cuadradito que parpadea es una terminal; esto es una punta que deja tinta y sigue.
    // Cuando la linea ya esta completa (`d.done`) no queda nada mojado: la carta esta escrita.
    const mojado = i === ultimo && !d.done ? CUAD.fresco : 0;
    const corte = Math.max(0, vis - mojado);
    const seco = f.txt.slice(0, corte);
    trazo(seco, 0, 0, 1);
    let ax = ctx.measureText(seco).width;
    for (let k = corte; k < vis; k++) {
      const edad = (k - corte) / CUAD.fresco;                 // 0 = el mas viejo de los mojados
      trazo(f.txt[k], ax, 0, 0.25 + (1 - edad) * 0.75);
      ax += ctx.measureText(f.txt[k]).width;
    }
    ctx.restore();
    puntaX = xx + ax; puntaY = yy;
  }
  // LA PUNTA DE LA BIROME, donde esta escribiendo ahora mismo. Es un trazo corto e INCLINADO que
  // baja hasta el renglon: un rectangulito parado se lee como el cursor de una terminal, que es
  // justo lo que esta pantalla no es. Se va cuando la linea termino — la lapicera se levanta de
  // la hoja, no se queda titilando.
  if (!d.done) {
    ctx.save();
    ctx.strokeStyle = CUAD.tinta; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(puntaX + 1.8, puntaY - 4.2); ctx.lineTo(puntaX + 0.3, puntaY - 0.3);
    ctx.stroke();
    ctx.globalAlpha = 0.35; px(puntaX, puntaY - 1, 1, 1, CUAD.fresca);   // el punto de apoyo
    ctx.restore();
  }

  // ---- los dos controles ----
  //
  // SIN LOS PUNTITOS DE AVANCE (pedido de Matias, 29/8/2026). El resto de las pantallas de guion
  // dibuja un punto por linea de la escena abajo del todo, y en el cuaderno esa fila era lo unico
  // que quedaba en el medio de la hoja delatando que hay una interfaz. Una carta no viene con un
  // indicador de cuantos renglones le faltan: se lee hasta que se termina.
  //
  // La franja oscura SE QUEDA aunque los puntos se hayan ido: es la zona de los dos controles.
  const last = d.si + 1 >= d.seq.length && d.li + 1 >= ((sc.lineas || []).length);
  promptCuaderno(w, d, last);
}

/** LOS DOS CONTROLES DEL CUADERNO: los dos ABAJO, en el mismo renglon, uno contra cada borde
 *  (pedido de Matias, 29/8/2026 — es la tercera pasada sobre esto y la que quedo).
 *
 *      ANTERIOR ◀                                                        SIGUIENTE ▶
 *
 *  Los dos con la misma forma —palabra y despues icono— porque son el mismo control en direcciones
 *  opuestas. Y viven adentro de la franja RESERVADA de abajo (`CUAD.franja`), que ningun otro texto
 *  puede pisar: la caja de escritura de la carta se corta antes de llegar ahi, siempre.
 *
 *  Es la UNICA pantalla del juego donde los dos no van juntos, y hay un motivo. En las demas se
 *  cuelgan del borde de la caja de dialogo, que ya es un rectangulo opaco al que pertenecen (ver
 *  promptAvanzar). Aca no hay caja: hay una hoja de cuaderno que ocupa la pantalla entera, y dos
 *  iconos juntos en el medio del papel se leerian como algo dibujado en la hoja. En los extremos,
 *  sobre la franja oscura, se leen como lo que son — los bordes de la pagina que se pasa.
 *
 *  Las reglas de cuando aparece cada uno son las mismas de siempre: AVANZAR parpadea al habilitarse
 *  y desaparece mientras corre un `hold` (RF-07); VOLVER esta fijo y no depende del hold, porque el
 *  silencio impide adelantarse, no volver a leer. */
function promptCuaderno(w, d, last) {
  const y = H - 4 - LADO_TECLA, base = y + LADO_TECLA - 2;   // el mismo renglon para los dos
  ctx.font = '5px monospace'; ctx.fillStyle = P.accent;
  // ANTERIOR pegado al borde izquierdo. PALABRA Y DESPUES ICONO, igual que SIGUIENTE: los dos son
  // el mismo control en direcciones opuestas y tienen que armarse con las mismas piezas en el
  // mismo orden. Antes iba al reves (icono y despues palabra) y arriba de todo, y quedaban dos
  // botones distintos en dos alturas distintas.
  //
  // No depende de `canAdvance`: el hold cierra AVANZAR, no VOLVER — el silencio impide adelantarse,
  // no volver a leer.
  if (d.li > 0 || d.si > 0) {
    ctx.globalAlpha = 0.62;
    ctx.textAlign = 'left';
    ctx.fillText(T('backPrompt'), 4, base);
    dibujarTeclaFlecha(4 + ctx.measureText(T('backPrompt')).width + 3, y, LADO_TECLA, -1);
    ctx.globalAlpha = 1;
  }
  // SIGUIENTE pegado al derecho. Parpadea al habilitarse y desaparece mientras corre un `hold`
  // (RF-07); la ultima pantalla dice otra palabra y va a pleno, porque ahi la palabra ES
  // informacion nueva y no un recordatorio del gesto.
  if (!w.canAdvance || Math.sin(sinceReady() * 5) <= -0.35) return;
  const ultima = last && w.state !== 'epilogue';
  const xI = W - 4 - LADO_TECLA;
  ctx.globalAlpha = ultima ? 1 : 0.62;
  ctx.textAlign = 'right';
  ctx.fillText(T(ultima ? 'startPrompt' : 'nextPrompt'), xI - 3, base);
  dibujarTeclaFlecha(xI, y, LADO_TECLA, 1);
  ctx.globalAlpha = 1;
}

/** EL PROMPT DE AVANZAR — la tecla, abajo a la derecha, chiquito.
 *
 *  ERA UN RENGLON CENTRADO Y GRANDE ("CUALQUIER TECLA para continuar", 8 px, en el medio) y se
 *  comia la pantalla: en las escenas del cuaderno el texto de Mateo le caia encima, y en todas
 *  las demas competia con lo unico que importa, que es lo que alguien esta diciendo.
 *
 *  Ahora es una tecla dibujada y una palabra, pegadas a la esquina. El jugador aprende el gesto
 *  en la primera pantalla y despues no necesita que se lo repitan de a ocho pixeles en el medio
 *  de la escena — le alcanza con saber que sigue habilitado.
 *
 *  Se dibuja SIEMPRE en el mismo lugar de la pantalla, venga de la caja VN o del layout
 *  centrado: si saltara de lugar segun el registro, el jugador tendria que buscarlo cada vez. */
/** LA TECLA-FLECHA, la MISMA para los dos controles (pedido de Matias, 27/8).
 *
 *  ANTERIOR y SIGUIENTE son el mismo gesto en direcciones opuestas, asi que se dibujan con el
 *  mismo glifo espejado: placa con contorno de acento y una punta de flecha adentro. Antes
 *  SIGUIENTE usaba el glifo del ENTER —una placa rellena con la flechita que baja y dobla— y eso
 *  los hacia leer como dos controles de sistemas distintos: uno era "la tecla Enter" y el otro
 *  "una flecha". Ahora son un par.
 *
 *  Se dibuja SIEMPRE que haya algo atras, aunque el avance este cerrado por un `hold`: el silencio
 *  impide adelantarse, no volver a leer. Si desapareciera junto con la de avanzar, el jugador
 *  aprenderia que "durante la pausa no hay controles", que es lo contrario de lo que pasa. */
function dibujarTeclaFlecha(x, y, lado, dir) {
  const r = Math.max(1.5, lado * 0.23);
  ctx.save();
  ctx.strokeStyle = P.accent; ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x + 0.5, y + 0.5, lado - 1, lado - 1, r);
  else ctx.rect(x + 0.5, y + 0.5, lado - 1, lado - 1);
  ctx.stroke();
  const cx = x + lado / 2, cy = y + lado / 2, p2 = lado * 0.23;
  ctx.fillStyle = P.accent;                          // la punta mira segun `dir`: -1 izq, +1 der
  ctx.beginPath();
  ctx.moveTo(cx + dir * p2 * 1.3, cy);
  ctx.lineTo(cx - dir * p2, cy - p2); ctx.lineTo(cx - dir * p2, cy + p2);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

// LA MEDIDA DE LA TECLA, una sola para los dos controles: ANTERIOR y SIGUIENTE son el mismo glifo
// espejado, asi que con tamaños distintos se leerian como dos controles de sistemas distintos.
const LADO_TECLA = 8;

function promptAvanzar(w, d, last, caja) {
  // LOS DOS CONTROLES SE CUELGAN DE LA CAJA (pedido de Matias, 27/8), no de la pantalla:
  //
  //   AVANZAR  → esquina inferior DERECHA, ADENTRO de la caja.
  //   VOLVER   → justo ARRIBA de la caja, alineado a su borde derecho.
  //
  // Estaban clavados a la pantalla y eso traia dos problemas. Uno medible: AVANZAR se dibujaba en
  // x = W-10-13 = 297 y su palabra arrancaba en x = 314, o sea FUERA del canvas de 320 — se veia
  // corrida contra el borde y cortada. El otro, de lectura: VOLVER estaba arriba a la izquierda,
  // encima del rotulo de la escena, y se pisaban.
  //
  // Colgados de la caja los dos quedan juntos sobre el mismo borde derecho, y la caja los
  // reacomoda sola cuando cambia de alto con los renglones.
  //
  // MUCHO MAS CHICOS: la caja quedo en ~39 px de alto y un icono de 13 se comia un tercio. A 8 px
  // sigue siendo legible como tecla y deja de competir con lo que hay que leer.
  const der = caja ? caja.bx + caja.bw : W - 6;
  const abajo = caja ? caja.by + caja.bh : H - 6;
  const arriba = caja ? caja.by : H - 40;

  // AVANZAR: pegado a la esquina inferior derecha de la caja, con 4 px de aire. La palabra va A
  // SU IZQUIERDA —no a la derecha, que es lo que la sacaba del canvas— y solo en la ULTIMA
  // pantalla, donde dice EMPEZAR y esa palabra es informacion nueva. En las intermedias alcanza
  // el glifo: el jugador ya aprendio el gesto en la primera.
  const xIcono = der - 4 - LADO_TECLA, yIcono = abajo - 4 - LADO_TECLA;
  const visible = w.canAdvance && Math.sin(sinceReady() * 5) > -0.35;
  if (visible) {
    // en la ULTIMA pantalla la palabra cambia —ahi el control no sigue la escena, DESPEGA— y esa
    // es informacion que no esta en ningun otro lado. En las demas dice siempre SIGUIENTE.
    const ultima = last && w.state !== 'epilogue';
    ctx.font = '5px monospace'; ctx.fillStyle = P.accent; ctx.textAlign = 'right';
    ctx.globalAlpha = ultima ? 1 : 0.5;
    ctx.fillText(T(ultima ? 'startPrompt' : 'nextPrompt'), xIcono - 3, yIcono + LADO_TECLA - 2);
    dibujarTeclaFlecha(xIcono, yIcono, LADO_TECLA, 1);
    ctx.globalAlpha = 1;
  }
  // VOLVER: arriba de la caja, sobre su borde derecho, a la izquierda de donde cae AVANZAR.
  //
  // NO PARPADEA. La de avanzar titila porque APARECE: es una habilitacion, y el titileo avisa que
  // ya se puede. Volver esta disponible desde siempre y no cambia de estado, asi que un parpadeo
  // seria movimiento sin informacion. Va fija y apagada.
  //
  // No depende de `canAdvance`: el hold cierra AVANZAR, no VOLVER.
  if (d.li > 0 || d.si > 0) {
    const xV = der - LADO_TECLA, yV = arriba - LADO_TECLA - 3;
    ctx.globalAlpha = 0.5;
    dibujarTeclaFlecha(xV, yV, LADO_TECLA, -1);
    ctx.font = '5px monospace'; ctx.fillStyle = P.accent; ctx.textAlign = 'right';
    ctx.fillText(T('backPrompt'), xV - 3, yV + LADO_TECLA - 2);
    ctx.globalAlpha = 1;
  }
}


// LA CAJA VN (F2 del spec, RF-01): panel inferior que SUBE al arrancar la escena, busto del
// hablante asomando por el borde superior, nombre en acento y la linea tipeada a la izquierda.
// Cascada de assets: retrato real (assets/portraits/<cara>.png) → SILUETA placeholder (el mock
// del 6/8: la caja se ve completa hoy, sin un solo asset generado) → sin `cara`, solo nombre.
/** LA CAJA VN — el panel de dialogo de abajo. UNA sola implementacion, dos usuarios.
 *
 *  La usan el modo historia (pantalla quieta, texto tipeado, se avanza apretando) y LA RADIO EN
 *  VUELO (aparece sola, dura unos segundos y se va). Que sea la misma funcion no es prolijidad:
 *  es lo que garantiza que hablar en tierra y hablar por radio se VEAN igual. Dos copias
 *  parecidas se separan en la primera correccion que alguien haga en una sola, y el jugador
 *  percibe eso como dos sistemas distintos aunque no sepa decir por que.
 *
 *  @param o.personaje  quien habla (null = acotacion, sin nombre ni busto)
 *  @param o.cara       id del retrato en assets/portraits (null = sin busto)
 *  @param o.accion     que ESTA HACIENDO (acotacion escenica; se dibuja aparte del dialogo)
 *  @param o.wrap       los renglones YA PARTIDOS
 *  @param o.typed      cuantos caracteres mostrar (Infinity = todo)
 *  @param o.ease       0..1, la entrada subiendo desde el borde
 *  @param o.cursor     dibujar el cursor de tipeo
 *  @param o.barra      0..1, la barrita de tiempo restante (null = no va)
 *  @param o.parpadeo   reloj para los parpadeos (segundos)
 */
export function cajaVN(o) {
  const ease = o.ease === undefined ? 1 : o.ease;
  const rows = Math.max(2, o.wrap.length);
  // EL BUSTO VA ADENTRO DE LA CAJA (pedido de Matias, 8/2026). Antes asomaba 12 px por encima del
  // borde superior, apoyado en el aire. Al meterlo adentro, su alto —mas el del nombre, que ahora
  // va PEGADO ABAJO— pasa a ser un PISO del alto del panel: si la caja fuera mas baja que el
  // retrato, el busto volveria a salirse por abajo y estariamos en el mismo lugar por el otro lado.
  const conCara = !!o.cara;
  // LA MITAD DE ALTA QUE ANTES (pedido de Matias, 27/8). La caja se comia mas de un tercio de la
  // pantalla y tapaba la placa, que es lo que hay para mirar.
  //
  // La perilla que de verdad manda NO es el padding ni el busto: es el ANCHO DE RENGLON. La
  // altura sale de cuantos renglones entran, asi que ensanchar el wrap de 52 a 68 caracteres —
  // con el cuerpo bajado de 7 a 6 px, que es lo que hace lugar para esos caracteres— convierte
  // una linea de cuatro renglones en una de tres. Achicar el padding solo hubiera ganado unos
  // pocos pixeles y hubiera dejado el texto apretado contra los bordes.
  //
  // EL BUSTO SE QUEDA EN 36 (pedido de Matias, 27/8): se probo en 22 y a esa escala la cara deja
  // de leerse, que es justo para lo que esta. El alto de la caja lo bajan los renglones, no el
  // retrato — y con el wrap ancho ya alcanza.
  const PS = 36, PAD_R = 4;                      // lado del busto y su margen contra el borde
  const ALTO_NOMBRE = 9;                         // el renglon del nombre + su subrayado
  const FILA = 8;                                // alto de renglon del cuerpo
  const bx = 6, bw = W - 12;
  const accN = o.accion ? wrapChars(o.accion, 70).length : 0;
  const bh = Math.max(conCara ? PAD_R * 2 + PS + ALTO_NOMBRE : 30, 12 + rows * FILA + accN * 7);
  const by = (H - bh - 6) + (1 - ease) * (bh + 16);
  // panel oscuro con doble borde, el estilo de expediente del juego
  ctx.globalAlpha = 0.94; ctx.fillStyle = '#070b0f'; ctx.fillRect(bx, by, bw, bh);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#2c3a44'; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
  ctx.strokeStyle = '#141d24'; ctx.strokeRect(bx + 2.5, by + 2.5, bw - 5, bh - 5);
  let tx0 = bx + 10, nameX = null;
  if (conCara) {
    const px0 = bx + 6, py0 = by + PAD_R, ps = PS;
    ctx.fillStyle = '#0d1319'; ctx.fillRect(px0, py0, ps, ps);
    const im = portraitImg(o.cara);
    if (im) ctx.drawImage(im, px0, py0, ps, ps);
    else {
      // MOCK: silueta de busto (cabeza + hombros con luz de canto) hasta que exista el retrato
      const u = ps / 36;                             // la silueta escala con el busto
      ctx.fillStyle = '#22303b';
      ctx.fillRect(px0 + 13 * u, py0 + 6 * u, 10 * u, 11 * u);   // cabeza
      ctx.fillRect(px0 + 15 * u, py0 + 17 * u, 6 * u, 3 * u);    // cuello
      ctx.fillRect(px0 + 6 * u, py0 + 20 * u, 24 * u, 16 * u);   // hombros
      ctx.fillStyle = '#31434f';
      ctx.fillRect(px0 + 13 * u, py0 + 6 * u, 3 * u, 11 * u);
      ctx.fillRect(px0 + 6 * u, py0 + 20 * u, 4 * u, 16 * u);
    }
    ctx.globalAlpha = 0.7; ctx.strokeStyle = P.accent;
    ctx.strokeRect(px0 + 0.5, py0 + 0.5, ps - 1, ps - 1); ctx.globalAlpha = 1;
    tx0 = px0 + ps + 8; nameX = px0 + ps / 2;
  }
  // EL NOMBRE VA SIEMPRE PEGADO DEBAJO DEL BUSTO, no al fondo del panel. Colgado del fondo se
  // despegaba del retrato apenas la caja crecia con los renglones, y quedaban el busto arriba y
  // su nombre tres renglones abajo, sin nada que los atara.
  if (o.personaje) {
    ctx.font = 'bold 6px monospace'; ctx.fillStyle = P.accent;
    if (nameX !== null) {
      const nameY = by + PAD_R + PS + 7;
      ctx.textAlign = 'center'; ctx.fillText(o.personaje, nameX, nameY);
      const nw = ctx.measureText(o.personaje).width;
      px(nameX - nw / 2, nameY + 2, nw, 1, P.accent);
    } else {
      ctx.textAlign = 'left'; ctx.fillText(o.personaje, tx0, by + 9);
    }
  }
  // LA ACCION — que esta haciendo el que habla, arriba de lo que dice y en otro tono.
  //
  // Antes esto vivia METIDO ADENTRO del dialogo: "(bajito) Siempre hacen chistes". El jugador lo
  // leia como parte de la frase, con la voz del personaje, y una acotacion escenica pasaba por
  // texto dicho. Son dos cosas distintas —lo que alguien DICE y lo que alguien HACE— y tienen que
  // verse distintas o el guion miente sobre si mismo.
  //
  // SIN PARENTESIS (pedido de Matias, 27/8). Con parentesis se leia como un emote de chat —
  // "(se levanta y atiende)"— y no como lo que es. Un guion impreso no encierra la accion entre
  // parentesis: la pone aparte, en otro cuerpo, y se entiende sola por como esta puesta. Aca eso
  // se hace con TRES cosas y ninguna es puntuacion: una marca de acento corta a la izquierda, el
  // texto mas chico y apagado, y un renglon de aire antes del dialogo. La marca es lo que hace el
  // trabajo del parentesis sin ocupar lugar en la frase.
  let dy = 0;
  if (o.accion) {
    ctx.textAlign = 'left'; ctx.font = '5px monospace';
    const ax0 = (conCara ? bx + 6 + PS + 8 : bx + 10) + 5;    // 5 px de sangria para la marca
    const acc = wrapChars(o.accion, Math.floor((bw - (ax0 - bx) - 10) / 3));
    const y0 = by + PAD_R + 5;
    // FONDO DE ACENTO, mas apagado que la marca (pedido de Matias, 27/8): la marca lleva 0.55 y el
    // fondo 0.10, asi que la barrita sigue siendo lo que corta y el bloque solo queda "encendido".
    // Con los dos al mismo alfa el rectangulo se comia la marca y la acotacion pasaba a competir
    // con el dialogo, que es exactamente lo que no tiene que hacer.
    const anchoAcc = Math.max(...acc.map(t => ctx.measureText(t).width));
    ctx.globalAlpha = 0.10;
    px(ax0 - 5, y0 - 5, anchoAcc + 9, acc.length * 7 + 2, P.accent);
    ctx.globalAlpha = 0.55; px(ax0 - 5, y0 - 4, 1, acc.length * 7 - 2, P.accent);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#9db0b9';
    // SE TIPEA, y antes que el dialogo (ver ACC_PAUSA en core/dialogue.js). El fondo y la marca se
    // dibujan COMPLETOS desde el primer cuadro aunque el texto todavia no este: el bloque tiene
    // que ocupar su lugar desde el arranque, o el dialogo de abajo se correria hacia arriba
    // mientras la acotacion se escribe.
    let quedan = o.accTyped === undefined ? Infinity : o.accTyped;
    for (let i = 0; i < acc.length && quedan > 0; i++) {
      ctx.fillText(acc[i].slice(0, quedan), ax0, y0 + i * 7);
      quedan -= acc[i].length + 1;
    }
    dy = acc.length * 7 + 2;                                   // + el aire que la separa del dialogo
  }
  // la linea (los renglones ya vienen partidos por quien llama)
  const ty0 = (conCara ? by + PAD_R + 6 : by + 13) + dy;   // primer renglon a la altura del busto
  // TODO A LA IZQUIERDA, dialogo y narracion por igual (pedido de Matias, 29/8/2026).
  //
  // La narracion venia CENTRADA, con este argumento: no la dice nadie, asi que no se alinea contra
  // un busto que no existe. Lo que se ve al jugarlo es lo contrario — un parrafo centrado obliga a
  // buscar donde empieza cada renglon, y en una escena donde se alternan lineas con hablante y
  // lineas de narracion el ojo salta de margen en cada una. Lo que separa una acotacion de una voz
  // ya lo dicen el tinte apagado y la ausencia de nombre y de busto; la alineacion no tenia que
  // trabajar de eso.
  //
  // (Aca vivia la cuenta que centraba el renglon COMPLETO en vez de lo que iba escrito, para que
  // el texto no se corriera un pixel a la izquierda con cada letra nueva. Se fue con el centrado:
  // alineado a la izquierda el problema no existe, el texto arranca clavado en tx0 y solo crece
  // hacia la derecha.)
  ctx.textAlign = 'left';
  ctx.font = '6px monospace'; ctx.fillStyle = o.tinta || P.ink;
  let left = o.typed === undefined ? Infinity : o.typed, curX = tx0, curY = ty0;
  for (let i = 0; i < o.wrap.length; i++) {
    const y = ty0 + i * FILA;
    if (left <= 0) { curY = y - FILA; break; }
    const shown = o.wrap[i].slice(0, left);
    left -= o.wrap[i].length + 1;
    ctx.fillText(shown, tx0, y);
    curX = tx0 + ctx.measureText(shown).width + 2; curY = y;
  }
  const t = o.parpadeo || 0;
  if (o.cursor && Math.sin(t * 14) > -0.5) px(curX, curY - 5, 3, 6, P.accent);
  // LA BARRITA DE TIEMPO. Solo la radio en vuelo la trae, y ocupa el lugar del "OK": las dos
  // contestan la misma pregunta —cuanto falta para la proxima linea— y la radio la contesta sola
  // porque el jugador tiene las manos en el avion y no puede apretar nada.
  if (o.barra !== null && o.barra !== undefined) {
    const w0 = bw - 12;
    px(bx + 6, by + bh - 4, w0, 1, '#1c262e');
    px(bx + 6, by + bh - 4, Math.max(0, Math.round(w0 * o.barra)), 1, P.accent);
  }
  // DEVUELVE SU RECTANGULO. Los controles de avanzar y volver se cuelgan de los bordes de la
  // caja, y la caja cambia de alto con los renglones: si cada uno calculara por su cuenta donde
  // esta el borde, la cuenta viviria en dos lados y se despegarian a la primera correccion.
  return { bx, by, bw, bh };
}

// ---------- EL TOAST: la radio EN VUELO ----------
//
// LA REGLA QUE LO ORDENA TODO (decision del autor, 19/8/2026): **el dialogo no se superpone NUNCA
// a la UI.** O se acopla —chico, en una banda libre, sin tapar un solo instrumento— o va en modo
// PAUSA, que se lleva la UI entera y pide el 100% de la atencion. No hay punto medio: una caja de
// dialogo encima del combustible y de la munición es lo peor de los dos mundos — ni se lee comoda
// ni deja jugar.
//
// POR QUE NO ES `cajaVN`. La caja del modo historia esta anclada al borde de abajo y crece con los
// renglones: en vuelo eso significa taparle al jugador la nafta, el cañon, los misiles y el
// escuadron justo cuando alguien le esta hablando. El comentario de `cajaVN` dice que las dos
// formas de hablar tienen que VERSE IGUAL, y sigue siendo cierto — pero para el dialogo que PIDE
// atencion. La radio en vuelo es otra cosa: es un aviso que pasa, y se ve como lo que es.
//
// LA BANDA. El HUD de vuelo vive en los 50 px de abajo (ver render/hud.js: todo cuelga de H-50
// para arriba) y en los ~40 de arriba (puntaje, kilometro, barra de objetivo). El toast entra
// entero entre las dos, pegado al piso de la banda libre: `TOAST_Y2` es su borde inferior y esta
// DOS pixeles por encima de donde empieza el HUD. Ese numero es la regla escrita en codigo — si
// alguien baja el toast, la prueba de `npm run charlas` lo cachetea.
// EL NUMERO, calculado y no estimado. La barra mas alta del HUD es la de RASANTE, que `hud.js`
// planta en `H-50` = 130; `bar()` dibuja su PLACA dos pixeles mas arriba (128) y su ETIQUETA en
// `y-4` con cuerpo 6, o sea que su tinta empieza en ~120. El toast cierra en 118: dos pixeles de
// aire contra lo mas alto que dibuja la UI de vuelo.
// MEDIDO EN CAPTURA, no deducido: la cuenta de `bar()` daba 120 y a esa altura el toast todavia
// le comia la etiqueta RASANTE. La columna de medidores de la izquierda (RASANTE / MOMENTUM /
// CHANCHA) es lo mas alto que sube el HUD de vuelo, y su rotulo mas alto pinta hasta ~112.
const HUD_TINTA = 110;                                   // lo mas alto que pinta el HUD de vuelo
const TOAST_Y2 = HUD_TINTA - 2, TOAST_H = 30, TOAST_W = 226, TOAST_CARA = 22;

export function drawRadioVN() {
  if (!visible()) return;
  const ease = radio.ease;
  const bw = TOAST_W, bh = TOAST_H;
  const bx = Math.round((W - bw) / 2);
  // entra SUBIENDO desde abajo y se va por el mismo camino: el movimiento dice "esto pasa", que es
  // exactamente lo que un aviso tiene que decir
  const by = Math.round(TOAST_Y2 - bh + (1 - ease) * (bh + 10));
  ctx.globalAlpha = 0.92 * (0.35 + 0.65 * ease);
  ctx.fillStyle = '#070b0f'; ctx.fillRect(bx, by, bw, bh);
  ctx.globalAlpha = ease;
  ctx.strokeStyle = '#2c3a44'; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
  // el busto, chico: alcanza para saber QUIEN habla sin robarle lugar al mundo
  let tx = bx + 6;
  if (radio.cara) {
    const ps = TOAST_CARA, py0 = by + (bh - ps) / 2;
    ctx.fillStyle = '#0d1319'; ctx.fillRect(tx, py0, ps, ps);
    const im = portraitImg(radio.cara);
    if (im) ctx.drawImage(im, tx, py0, ps, ps);
    else {                                            // misma silueta de respaldo que la caja VN
      const u = ps / 36;
      ctx.fillStyle = '#22303b';
      ctx.fillRect(tx + 13 * u, py0 + 6 * u, 10 * u, 11 * u);
      ctx.fillRect(tx + 6 * u, py0 + 20 * u, 24 * u, 16 * u);
    }
    ctx.globalAlpha = 0.7 * ease; ctx.strokeStyle = P.accent;
    ctx.strokeRect(tx + 0.5, py0 + 0.5, ps - 1, ps - 1); ctx.globalAlpha = ease;
    tx += ps + 5;
  }
  ctx.textAlign = 'left';
  let ty = by + 10;
  if (radio.personaje) {
    ctx.font = 'bold 5px monospace'; ctx.fillStyle = P.accent;
    ctx.fillText(radio.personaje, tx, ty);
    ty += 7;
  }
  ctx.font = '6px monospace'; ctx.fillStyle = P.ink;
  // hasta DOS renglones: un aviso que necesita tres es una charla, y una charla va en PAUSA
  for (let i = 0; i < Math.min(2, radio.wrap.length); i++) ctx.fillText(radio.wrap[i], tx, ty + i * 7);
  // la barrita de tiempo, al ras del borde de abajo: es la unica forma honesta de decir "esto se
  // va a ir" sin pedirle al jugador que mire un reloj
  const r = restante();
  if (r > 0) { px(bx + 1, by + bh - 2, (bw - 2) * r, 1, P.accent); }
  ctx.globalAlpha = 1;
}

// ---------- EL PANEL: la radio de la escuadrilla ----------
//
// La otra presentacion del MISMO dato (perilla en OPCIONES). Donde el toast muestra UNA linea que
// pasa, el panel muestra LAS ULTIMAS CUATRO — la radio como la escucha un piloto: lo que se dijo
// hace diez segundos todavia esta ahi.
//
// Vive en LA MISMA BANDA que el toast y con el mismo tope (`HUD_TINTA`): la ley del §0b no cambia
// porque cambie la forma. Crece HACIA ARRIBA desde el piso de la banda, asi que la linea nueva
// siempre aparece en el mismo lugar y las viejas se van corriendo — leer siempre en el mismo
// renglon es la mitad de por que un chat se puede seguir de reojo.
const PANEL_W = 210, PANEL_FILA = 9, PANEL_VIDA = 14;    // segundos que una linea queda legible

export function drawRadioPanel() {
  if (!log.length) return;
  const bx = Math.round((W - PANEL_W) / 2);
  let y = TOAST_Y2 - 3;                                   // el piso: el mismo del toast
  // de la mas NUEVA a la mas vieja, subiendo
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i];
    const vida = 1 - Math.min(1, e.t / PANEL_VIDA);
    if (vida <= 0) continue;
    // la nueva a pleno; las viejas se apagan por edad Y por posicion — las dos cosas dicen "esto
    // ya paso" y juntas se leen sin tener que pensarlo
    const a = vida * (i === log.length - 1 ? 1 : 0.55);
    const linea = (e.personaje ? e.personaje + ': ' : '') + e.txt;
    const txt = linea.length > 46 ? linea.slice(0, 45) + '…' : linea;
    // el fondo va MAS opaco que el texto (0.9 contra `a`): sobre la pista clara, una fila vieja al
    // 55% de alfa con fondo al 55% no se leia — lo que se apaga con la edad es la TINTA, no la
    // plaquita que la sostiene
    ctx.globalAlpha = Math.min(0.9, a + 0.35); px(bx, y - PANEL_FILA + 2, PANEL_W, PANEL_FILA - 1, '#070b0f');
    ctx.globalAlpha = a;
    ctx.textAlign = 'left'; ctx.font = '6px monospace';
    // el NOMBRE en acento y lo dicho en tinta normal: en un chat, quien habla se busca primero
    const nom = e.personaje ? e.personaje + ': ' : '';
    ctx.fillStyle = P.accent; ctx.fillText(nom, bx + 4, y - 1);
    ctx.fillStyle = P.ink;
    ctx.fillText(txt.slice(nom.length), bx + 4 + ctx.measureText(nom).width, y - 1);
    y -= PANEL_FILA;
  }
  ctx.globalAlpha = 1;
}

/** El borde INFERIOR del toast, para que la prueba pueda afirmar que no pisa el HUD. */
export const toastBanda = () => ({ y2: TOAST_Y2, h: TOAST_H, y1: TOAST_Y2 - TOAST_H, hudTinta: HUD_TINTA });

function drawVNBox(w, d, ln, last, narra) {
  const k = Math.min(1, d.sceneT / 0.35), ease = 1 - Math.pow(1 - k, 3);   // entrada: sube
  const caja = cajaVN({ personaje: ln.personaje, cara: ln.cara, accion: ln.accion, wrap: d.wrap,
           typed: d.typed, accTyped: d.accTyped, ease, cursor: !d.done, barra: null, parpadeo: d.seqT,
           // la narracion se lee como acotacion y no como voz por el TINTE apagado —y por no traer
           // nombre ni busto—, no por la alineacion: va a la izquierda como el dialogo (29/8)
           tinta: narra ? '#9fb3bc' : null });
  promptAvanzar(w, d, last, caja);
}
