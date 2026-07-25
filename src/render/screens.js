// PANTALLAS de narrativa y de fin de mision: recuento, briefing, derribado, victoria y guion.
//
// Cada funcion recibe `w`: un snapshot chico de solo lectura con lo que necesita mostrar. No leen
// estado global — asi se pueden dibujar en cualquier momento (util para probarlas sueltas) y se ve
// de un vistazo de que dependen.
import { ctx, W, H, px, panel, wrapText } from './ctx.js';
import { P } from '../data/palette.js';
import { T, L } from '../core/i18n.js';
import { wrapChars } from '../core/util.js';

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
MAL.img.onload = () => { MAL.ready = true; MAL.gold = tintSil(MAL.img, P.accent); MAL.dim = tintSil(MAL.img, '#3a4650'); };
MAL.img.src = '../assets/images/malvinas.webp';

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
    ctx.fillStyle = won ? P.accent : '#33414b';
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
const AWARD_GAP = 16;                                      // separación entre elementos
export function drawAward(cx, cy, stars, appearT, t) {
  // los 4 centros van simétricos alrededor de cx: -1.5·gap .. +1.5·gap. El pequeño corrimiento a la
  // izquierda compensa que las islas (4º) son más anchas que una estrella.
  const x0 = cx - 1.5 * AWARD_GAP - 3;
  for (let i = 0; i < 3; i++) {
    const a = appearT - i * 0.22;
    if (a < 0) continue;
    const on = i < stars, pop = Math.max(0, 1 - a * 4);
    ctx.save();
    ctx.translate(x0 + i * AWARD_GAP, cy); ctx.scale(1 + pop * 0.5, 1 + pop * 0.5);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 13px monospace';
    ctx.fillStyle = on ? P.accent : '#2e3c45';
    ctx.fillText(on ? '★' : '☆', 0, 0);
    ctx.restore();
  }
  const ma = appearT - 3 * 0.22 - 0.15;                   // las Malvinas, un toque despues
  if (ma >= 0) drawMalvinas(x0 + 3 * AWARD_GAP, cy, 1 + Math.max(0, 1 - ma * 3.5) * 0.8, stars >= 4, t, 0);
}

export function drawResults(w) {
  // fondo CASI opaco: panel() es translucido y el mundo (popups, mar, montañas) se colaba
  // entre las filas del recuento y lo hacia ilegible
  ctx.fillStyle = '#0a0e11f2'; ctx.fillRect(0, 0, W, H);
  const R = w.lastRun; if (!R) return;
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = 'bold 11px monospace';
  ctx.fillText(T('res_title'), W / 2, 22);
  ctx.fillStyle = P.ink; ctx.font = 'bold 8px monospace';
  ctx.fillText(R.mission.name, W / 2, 34);

  // filas del desglose: etiqueta a la izquierda, puntos a la derecha
  let acc = 0;
  ctx.font = '7px monospace';
  for (let i = 0; i < R.rows.length; i++) {
    if (i >= w.resRow) break;
    const r = R.rows[i], y = 52 + i * 12;
    acc += r.v;
    ctx.textAlign = 'left'; ctx.fillStyle = P.dim;
    ctx.fillText(T(r.k) + (r.n !== undefined ? '  ' + r.n : ''), 40, y);
    ctx.textAlign = 'right'; ctx.fillStyle = P.foam;
    ctx.fillText('+' + r.v, W - 40, y);
  }

  // total (aparece cuando entraron todas las filas)
  if (w.resRow >= R.rows.length) {
    const y = 52 + R.rows.length * 12 + 4;
    ctx.strokeStyle = '#2e3c45'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, y - 6.5); ctx.lineTo(W - 40, y - 6.5); ctx.stroke();
    ctx.textAlign = 'left'; ctx.fillStyle = P.ink; ctx.font = 'bold 8px monospace';
    ctx.fillText(T('res_total'), 40, y + 3);
    ctx.textAlign = 'right'; ctx.fillStyle = P.accent;
    ctx.fillText(String(R.total), W - 40, y + 3);

    // GALARDON: 3 estrellas + las MALVINAS como 4ª (rango "S"). Igual que el remate de la remera.
    const stT = w.resT - (R.rows.length * 0.45 + 0.15);
    drawAward(W / 2, y + 24, R.stars, stT, w.t);
    // calificacion
    if (stT > 0.75) {
      ctx.fillStyle = P.foam; ctx.font = 'bold 8px monospace';
      ctx.fillText(T('res_rank') + '  ' + T(R.rank), W / 2, y + 42);
    }
    if (stT > 1.1 && Math.sin(w.t * 4) > -0.3) {
      ctx.fillStyle = P.accent; ctx.font = 'bold 7px monospace';
      ctx.fillText(T('continuePrompt'), W / 2, H - 12);
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
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.warn; ctx.font = 'bold 16px monospace';
  ctx.fillText(T('dead'), W / 2, 42);
  ctx.fillStyle = P.dim; ctx.font = '7px monospace';
  ctx.fillText(T(w.deathCause), W / 2, 55);
  ctx.fillStyle = P.ink; ctx.font = 'bold 10px monospace';
  ctx.fillText(T('scoreLabel', { n: Math.floor(w.score) }), W / 2, 78);
  ctx.fillStyle = Math.floor(w.score) >= w.best && w.best > 0 ? P.accent : P.dim;
  ctx.font = '8px monospace';
  ctx.fillText((Math.floor(w.score) >= w.best && w.best > 0 ? T('newRecord') : T('bestDead', { n: w.best })), W / 2, 92);
  // POR LA PATRIA: la corrida ENTERA fue el "nivel" → se premia con estrellas segun el puntaje.
  // w.stars viene de game.js (0 en los demas modos, donde el derribado es fracaso y no se premian).
  if (w.stars > 0 && w.awardT >= 0) drawAward(W / 2, 108, w.stars, w.awardT, w.t);
  const factY = w.stars > 0 ? 130 : 116;                  // el dato histórico baja para dejar lugar
  ctx.fillStyle = '#8a9ba1'; ctx.font = '6px monospace';
  wrapText('» ' + L().facts[w.factIdx], W / 2, factY, 260, 9);
  if (w.deathT > 0.7 && Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
    ctx.fillText(T('retryPrompt'), W / 2, 150);
  }
  if (w.deathT > 0.7) {
    ctx.fillStyle = P.dim; ctx.font = '7px monospace';
    ctx.fillText(T('menuPrompt'), W / 2, 162);
  }
  ctx.restore();
}

// fin de campaña (2 niveles de prueba)
export function drawVictory(w) {
  panel();
  ctx.textAlign = 'center';
  ctx.fillStyle = P.accent; ctx.font = 'bold 15px monospace';
  ctx.fillText('CAMPANA COMPLETADA', W / 2, 54);
  ctx.fillStyle = P.dim; ctx.font = '6px monospace';
  ctx.fillText('(2 niveles de prueba - se agregaran mas)', W / 2, 70);
  ctx.fillStyle = P.ink; ctx.font = 'bold 10px monospace';
  ctx.fillText('PUNTAJE  ' + Math.floor(w.score), W / 2, 96);
  if (w.levelT > 0.8 && Math.sin(w.t * 4) > -0.3) {
    ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
    ctx.fillText('CUALQUIER TECLA  para el menu', W / 2, 132);
  }
}

// pantalla de HISTORIA: negro tipo "pantalla de carga" con grano de pelicula y scanline,
// texto tipeado letra a letra con cursor. NO se ve el terreno de juego (eso llega con el fade).
export function drawStory(w) {
  ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, W, H);
  // grano de pelicula (parpadea) + una banda de scanline que baja lenta
  ctx.globalAlpha = 0.10;
  for (let i = 0; i < 42; i++) px(Math.random() * W, Math.random() * H, 1, 1, '#8a9ba1');
  ctx.globalAlpha = 0.05;
  px(0, (w.t * 9) % (H + 30) - 15, W, 7, '#eaf6ff');
  ctx.globalAlpha = 1;
  // marco fino (tarjeta de expediente)
  ctx.strokeStyle = '#1c262e'; ctx.strokeRect(8.5, 8.5, W - 17, H - 17);

  // texto tipeado: recorre las lineas gastando w.story.typed caracteres
  let left = w.story.typed, y = w.story.isLevel ? 76 : 38;   // pantalla de NIVEL: centrada
  ctx.textAlign = 'center';
  let curX = W / 2, curY = y;   // posicion del cursor (ultimo caracter tipeado)
  for (const ln of w.story.lines) {
    if (left <= 0) break;
    const shown = ln.txt.slice(0, left);
    left -= ln.txt.length;
    if (ln.k === 'title') { ctx.font = 'bold 11px monospace'; ctx.fillStyle = P.accent; }
    else if (ln.k === 'level') { ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.warn; }
    else if (ln.k === 'obj') { ctx.font = '7px monospace'; ctx.fillStyle = '#5c6e73'; }
    else { ctx.font = '7px monospace'; ctx.fillStyle = P.ink; }
    ctx.fillText(shown, W / 2, y);
    curX = W / 2 + ctx.measureText(shown).width / 2 + 2; curY = y;
    // interlineado: mas aire despues del titulo y antes del bloque de nivel
    y += ln.k === 'title' ? 16 : (ln.k === 'level' ? 12 : 11);
    if (ln.last && ln.k === 'body') y += 5;
    if (ln.last && ln.k === 'title') y += 3;
  }
  // cursor de maquina de escribir (bloque titilante)
  if (!w.story.done && Math.sin(w.t * 14) > -0.5) px(curX, curY - 6, 4, 7, P.accent);
  // listo: prompt (continuar en pantallas intermedias, despegar en la del nivel)
  const lastScreen = w.story.si + 1 >= w.story.seq.length;
  if (w.story.done && Math.sin(w.t * 4) > -0.3) {
    ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.accent; ctx.textAlign = 'center';
    // el guion de campaña termina en el despegue, pero el EPILOGO sigue al briefing/recuento:
    // ahi corresponde "continuar", no "despegar"
    ctx.fillText(T(lastScreen && w.state !== 'epilogue' ? 'startPrompt' : 'continuePrompt'), W / 2, H - 22);
  }
  // progreso de la secuencia (puntitos abajo)
  const n = w.story.seq.length;
  for (let i = 0; i < n; i++)
    px(W / 2 - n * 4 + i * 8 + 2, H - 13, 3, 3, i === w.story.si ? P.accent : '#2e3c45');
}
