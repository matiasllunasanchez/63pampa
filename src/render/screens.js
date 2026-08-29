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
import { radio, restante, visible } from '../core/radioVN.js';
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
  // Ahora usa la misma caja de abajo, sin busto y sin nombre —no la dice nadie— y con el texto
  // CENTRADO, que es lo que la distingue del dialogo sin necesitar otro color ni otro tipo.
  // La imagen queda entera arriba y el texto siempre aparece en el mismo lugar.
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
  // TITULO de la escena: NO se tipea. Es el rotulo del lugar ("RÍO GALLEGOS · LA LÍNEA DE VUELO"),
  // no algo que alguien diga — queda fijo mientras pasan las lineas de la escena.
  // EL TITULO: chico y ARRIBA A LA IZQUIERDA (pedido del autor, 19/8/2026). Era grande y centrado
  // —11 px en el medio del cuadro— y competia de igual a igual con la linea de dialogo, que es lo
  // que hay que leer. Es un rotulo de ubicacion, como el "PUERTO ARGENTINO · 1982" de una pelicula:
  // se lee una vez, de reojo, y se sale del camino. La TARJETA de nivel es la excepcion y conserva
  // su titulo grande al centro — ahi el nombre de la mision ES el contenido de la pantalla.
  if (sc.titulo) {
    if (card) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px monospace'; ctx.fillStyle = P.warn;
      wrapChars(sc.titulo, 32).forEach((t, i) => ctx.fillText(t, W / 2, 76 + i * 14));
    } else {
      // El rotulo recupera el margen izquierdo: el control de VOLVER se mudo al borde de la caja
      // (ver promptAvanzar), asi que arriba a la izquierda ya no hay con que pisarse.
      ctx.textAlign = 'left';
      ctx.font = 'bold 5px monospace'; ctx.fillStyle = P.accent; ctx.globalAlpha = 0.75;
      ctx.fillText(sc.titulo, 14, 17);
      ctx.globalAlpha = 1;
    }
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
//   4. LOS CONTROLES SE VAN A LAS PUNTAS OPUESTAS DE LA HOJA (ver promptCuaderno).
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
  franja: 26,                // alto de la franja oscura de abajo
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
  // controles y los puntos de avance son de color claro y sobre papel crema no se leerian. Que
  // ademas despegue la pagina de la barra de estado es lo que la vuelve util para ver de un
  // vistazo donde termina la carta y empieza el juego.
  const gr = ctx.createLinearGradient(0, H - CUAD.franja, 0, H);
  gr.addColorStop(0, 'rgba(8,11,16,0)'); gr.addColorStop(1, 'rgba(8,11,16,0.80)');
  ctx.fillStyle = gr; ctx.fillRect(0, H - CUAD.franja, W, CUAD.franja);

  // ---- la columna de la hoja izquierda ----
  const bx = lam.x + lam.w * CUAD.x0, bw = lam.w * (CUAD.x1 - CUAD.x0);
  const by = lam.y + lam.h * CUAD.y0, bh = lam.h * (CUAD.y1 - CUAD.y0);
  ctx.textAlign = 'left';
  let y0 = by;
  // EL ROTULO ("CARTA DE MATEO") arriba de la columna y con la misma tinta, aguada. En el cuaderno
  // no puede ser el rotulo naranja de las demas pantallas —naranja sobre crema no se lee— y puesto
  // ahi pasa por lo que es: el encabezado que alguien escribe arriba de la pagina.
  if (sc.titulo) {
    ctx.font = handFont(6); ctx.fillStyle = CUAD.tinta; ctx.globalAlpha = 0.5;
    ctx.fillText(sc.titulo, bx, y0); ctx.globalAlpha = 1;
    y0 += CUAD.paso * 0.95;
  }

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

  // ---- la franja: los dos controles y el avance ----
  const last = d.si + 1 >= d.seq.length && d.li + 1 >= ((sc.lineas || []).length);
  promptCuaderno(w, d, last);
  const n = (sc.lineas || []).length;
  for (let i = 0; i < n; i++)
    px(W / 2 - n * 4 + i * 8 + 2, H - 13, 3, 3, i === d.li ? P.accent : '#5b6168');
}

/** LOS DOS CONTROLES DEL CUADERNO, en las puntas opuestas de la pagina (pedido de Matias,
 *  29/8/2026): ANTERIOR arriba a la IZQUIERDA, SIGUIENTE abajo a la DERECHA.
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
  // ANTERIOR ARRIBA A LA IZQUIERDA (pedido de Matias, 29/8/2026, corrigiendo la primera pasada,
  // que lo puso abajo). Los dos controles quedan en diagonal, uno en cada punta de la pagina:
  // VOLVER donde empieza lo que ya leiste, SEGUIR donde termina.
  //
  // ARRIBA NO HAY FRANJA OSCURA —el pedido es que el oscuro viva solo abajo— asi que el naranja
  // del acento cae sobre papel crema, y ahi no se lee. Se dibuja con una SOMBRA DE TINTA apenas
  // corrida debajo: la misma solucion que usa cualquier rotulo sobre fondo claro, y cuesta un
  // fillText de mas. Sin ella el control existe pero no se ve, que es peor que no estar.
  if (d.li > 0 || d.si > 0) {                              // el hold cierra AVANZAR, no VOLVER
    const yV = 4;
    ctx.save();
    ctx.globalAlpha = 0.28; ctx.strokeStyle = CUAD.tinta; ctx.fillStyle = CUAD.tinta;
    ctx.font = '5px monospace'; ctx.textAlign = 'left';
    ctx.fillText(T('backPrompt'), 4 + LADO_TECLA + 3.6, yV + LADO_TECLA - 1.4);
    ctx.strokeRect(4.9, yV + 0.9, LADO_TECLA - 1, LADO_TECLA - 1);
    ctx.restore();
    ctx.globalAlpha = 0.9;
    dibujarTeclaFlecha(4, yV, LADO_TECLA, -1);
    ctx.font = '5px monospace'; ctx.fillStyle = P.accent; ctx.textAlign = 'left';
    ctx.fillText(T('backPrompt'), 4 + LADO_TECLA + 3, yV + LADO_TECLA - 2);
    ctx.globalAlpha = 1;
  }
  if (!w.canAdvance || Math.sin(sinceReady() * 5) <= -0.35) return;
  // SIGUIENTE abajo a la derecha, adentro de la franja: ahi el acento se lee solo y no necesita
  // sombra. La ultima pantalla dice otra palabra y va a pleno — es informacion, no un recordatorio.
  const ultima = last && w.state !== 'epilogue';
  const xI = W - 4 - LADO_TECLA, yS = H - 4 - LADO_TECLA;
  ctx.globalAlpha = ultima ? 1 : 0.62;
  ctx.font = '5px monospace'; ctx.fillStyle = P.accent; ctx.textAlign = 'right';
  ctx.fillText(T(ultima ? 'startPrompt' : 'nextPrompt'), xI - 3, yS + LADO_TECLA - 2);
  dibujarTeclaFlecha(xI, yS, LADO_TECLA, 1);
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
  // CENTRADO para la NARRACION: no la dice nadie, asi que no se alinea contra un busto que no
  // existe. Alineada a la izquierda como el dialogo quedaba pidiendo un hablante que falta.
  const cen = !!o.centrado;
  // EL CENTRADO SE CALCULA SOBRE EL RENGLON COMPLETO, no sobre lo que va escrito (arreglo 27/8).
  //
  // Con textAlign 'center' el navegador centra LO QUE SE LE PASA, asi que cada letra nueva movia
  // todo el renglon un pixel a la izquierda: el texto se corria mientras se escribia y era muy
  // dificil de leer. Ahora se mide el renglon entero UNA vez, se saca de ahi su borde izquierdo, y
  // lo tipeado se dibuja alineado a la izquierda desde ese punto — el texto queda clavado y solo
  // crece hacia la derecha, como en una maquina de escribir.
  ctx.textAlign = 'left';
  ctx.font = '6px monospace'; ctx.fillStyle = o.tinta || P.ink;
  let left = o.typed === undefined ? Infinity : o.typed, curX = tx0, curY = ty0;
  for (let i = 0; i < o.wrap.length; i++) {
    const y = ty0 + i * FILA;
    if (left <= 0) { curY = y - FILA; break; }
    const x = cen ? bx + bw / 2 - ctx.measureText(o.wrap[i]).width / 2 : tx0;
    const shown = o.wrap[i].slice(0, left);
    left -= o.wrap[i].length + 1;
    ctx.fillText(shown, x, y);
    curX = x + ctx.measureText(shown).width + 2; curY = y;
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

/** LA RADIO EN VUELO: la misma caja del modo historia, abajo, mientras el jugador vuela.
 *
 *  La diferencia con el modo historia es una sola y esta en los parametros: `ok: false` y
 *  `barra`. No se avanza apretando —el jugador tiene las manos en el avion— asi que en el lugar
 *  donde el modo historia pone el "OK ▼" va la barrita de tiempo. Las dos contestan la misma
 *  pregunta, cuanto falta; la radio la contesta sola. */
export function drawRadioVN() {
  if (!visible()) return;
  cajaVN({ personaje: radio.personaje, cara: radio.cara, wrap: radio.wrap,
           ease: radio.ease, barra: restante() });
}

function drawVNBox(w, d, ln, last, narra) {
  const k = Math.min(1, d.sceneT / 0.35), ease = 1 - Math.pow(1 - k, 3);   // entrada: sube
  const caja = cajaVN({ personaje: ln.personaje, cara: ln.cara, accion: ln.accion, wrap: d.wrap,
           typed: d.typed, accTyped: d.accTyped, ease, cursor: !d.done, barra: null, parpadeo: d.seqT,
           // la narracion va centrada y en tinta apagada: se lee como acotacion, no como voz
           centrado: narra, tinta: narra ? '#9fb3bc' : null });
  promptAvanzar(w, d, last, caja);
}
