// EL DIBUJO DE LA CHANCHA (SPEC_PODER_CHANCHA RF-03/RF-08). El estado vive en
// systems/chancha.js; aca solo se LEE su snapshot y se pinta (convencion 4 de ARQUITECTURA).
//
// SILUETA PROCEDURAL, cero assets (RNF-01): cuatro turbohelices, ala alta, cola en T y las dos
// mangueras con su canasta colgando de los pods de las alas. Cuando llegue la hoja horneada se enchufa
// como en render/enemies.js —si cargo, sprite; si no, esto— y no hay que tocar nada mas.

import { ctx, px, W, H, HOR, F } from './ctx.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';
import { run } from '../core/run.js';
import { CH_BOX, CH_DERIVA_V } from '../data/tuning.js';
// el verde de "esta entrando nafta": el mismo de la suelta, que en este juego quiere decir "ahora si"
const CAJA_VERDE = '#7fe07a';
import { snapshot } from '../systems/chancha.js';
import * as enemyArt from './enemies.js';
import { flechaIn } from './rotulo.js';

/** El Hercules, la manguera y la canasta. Se llama desde draw() en 'play', despues del mundo. */
export function drawChancha() {
  const c = snapshot();
  if (!c || c.fase === 'eta') return;                       // en el ETA todavia no esta a la vista
  const s = proj(c.x, c.y, c.z);
  const k = F / c.z;
  const w = 26 * k, h = 3.4 * k;                            // el KC-130 es GRANDE: se lee de lejos
  const bodyY = s.y - h / 2;

  // EL AIRFRAME: la hoja horneada si esta (tools/bake_enemies.html -> modelHercules), y si no el
  // dibujo procedural de siempre. Es el enchufe que este archivo ya tenia previsto en su cabecera.
  //
  // EL ALABEO NO ES DECORACION: SE LO SACA A LA DERIVA. La Chancha se hamaca CH_DERIVA metros a
  // los costados mientras esperas, y hasta ahora se hamacaba SIN INCLINARSE — un avion que se
  // traslada de costado con las alas a nivel, que es lo que hace una calcomania y no un avion.
  // La columna sale de la MISMA formula con la que systems/chancha.js calcula esa deriva
  // (`x = sin(t·V)`), asi que la banda es su VELOCIDAD lateral: cuando arranca para la derecha
  // baja el ala derecha, y al llegar al extremo pasa por nivel. No hay un seno nuevo ni un estado
  // nuevo — es el mismo dato leido una vez mas, que es la regla de este repo.
  const deriva = Math.cos(c.t * CH_DERIVA_V);          // > 0: se va hacia +x (la derecha)
  const bank = deriva > 0.25 ? 0 : deriva < -0.25 ? 2 : 1;
  const hoja = enemyArt.ready('chancha');
  // LAS HELICES VAN SIEMPRE POR CODIGO, con hoja o sin ella: un disco horneado se ve MUERTO, y lo
  // que dice que este avion esta volando —y no pegado en el cielo— es que las cuatro giren.
  // VAN DETRAS DEL AVION (14/10, el autor: "ponelas DETRAS del avion"): estan al frente de cada gondola,
  // del lado de alla, asi que se pintan ANTES de la hoja y el avion les tapa lo que les tiene que tapar.
  //
  // DONDE VAN LO DICE EL HORNO. Con la hoja puesta, la posicion de cada disco sale de `anclaje()`:
  // el horneador proyecta el cono de cada helice del modelo con la MISMA camara con la que horneo
  // y escribe el pixel en src/data/cajas.js. Sin hoja, se cae a las fracciones de siempre.
  //
  // (14/10, el autor: "hay rectangulos debajo de las turbinas que parpadean"; despues, del disco solo:
  // "no entiendo que es eso"). La Chancha se ve DE ATRAS: el disco queda casi de frente, y lo que lo
  // hace leer como helice son LAS PALAS — cuatro, como la Hamilton Standard del C-130 —, finas y
  // girando a una velocidad que el ojo sigue, con el barrido apenas insinuado y el cubo al centro.
  const HEL_D = 2.64;                                  // diametro del disco, en unidades de mundo
  for (let i = 0; i < 4; i++) {
    const a = hoja ? enemyArt.anclaje('chancha', i, s.x, { centerY: s.y }, k) : null;
    const f = [-0.34, -0.19, 0.19, 0.34][i];
    const hx = a ? a.x : s.x + w * f;
    const hy = a ? a.y : bodyY - h * 0.62;
    const r = Math.max(1.5, HEL_D * k / 2);
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = '#c9d2cf';
    ctx.beginPath(); ctx.ellipse(hx, hy, r, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
    const giro = run.t * 6 * (i < 2 ? 1 : -1) + i * 0.7;   // las de cada ala giran para su lado
    ctx.globalAlpha = 0.55; ctx.strokeStyle = '#2b302d'; ctx.lineWidth = Math.max(1, r * 0.12); ctx.lineCap = 'round';
    ctx.beginPath();
    for (let p = 0; p < 4; p++) {
      const ang = giro + p * Math.PI / 2;
      ctx.moveTo(hx + Math.cos(ang) * r * 0.15, hy + Math.sin(ang) * r * 0.85 * 0.15);
      ctx.lineTo(hx + Math.cos(ang) * r * 0.95, hy + Math.sin(ang) * r * 0.85 * 0.95);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.9; ctx.fillStyle = '#1e2420';
    ctx.beginPath(); ctx.arc(hx, hy, Math.max(1, r * 0.13), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  if (hoja) {
    enemyArt.drawFrame(ctx, 'chancha', bank, 0, s.x, { centerY: s.y }, k, false, false, 0);
  } else {
    // ALA ALTA de punta a punta (el Hercules es un ala arriba del fuselaje, y esa es su silueta)
    px(s.x - w / 2, bodyY - h * 0.35, w, Math.max(1, h * 0.34), '#5a6a63');
    for (const f of [-0.34, -0.19, 0.19, 0.34]) {
      px(s.x + w * f - Math.max(1, w * 0.022), bodyY - h * 0.35, Math.max(1, w * 0.045), Math.max(1, h * 0.7), '#41504a');
    }
    // fuselaje, morro y la cola
    px(s.x - w * 0.16, bodyY, Math.max(2, w * 0.32), Math.max(1, h * 0.6), '#6b7a72');
    px(s.x - w * 0.2, bodyY + h * 0.12, Math.max(1, w * 0.05), Math.max(1, h * 0.36), '#8a9992');
    px(s.x + w * 0.14, bodyY - h * 0.95, Math.max(1, w * 0.035), Math.max(1, h * 1.0), '#5a6a63');
    px(s.x + w * 0.06, bodyY - h * 1.05, Math.max(1, w * 0.17), Math.max(1, h * 0.22), '#5a6a63');
    // los dos pods de manguera, afuera de los motores externos
    for (const f of [-0.37, 0.37]) px(s.x + w * f - Math.max(1, w * 0.02), bodyY, Math.max(2, w * 0.04), Math.max(1, h * 0.3), '#8e9a95');
  }
  // LAS DOS MANGUERAS (8/10, el autor: "la manguera la veo pero tiene que ser mas visible, quiza
  // naranja"). Salen de la BOCA DE CADA POD —afuera del motor externo, como en el KC-130 de verdad—,
  // cuelgan y terminan en su canasta. La de estribor es la de la cita (la canasta de systems/chancha.js);
  // la de babor no carga a nadie: esta porque el avion real larga las dos, y una sola manguera
  // colgando de un ala se lee como algo que se solto. Va ESPEJADA EN PANTALLA respecto del Hercules,
  // no en el mundo: la camara anda pegada a la canasta de estribor, y la de babor en su lugar de
  // verdad queda 19 m a la izquierda y a la profundidad de juego — una raya naranja que cruza medio
  // mar hasta salirse del cuadro. Espejada, el par se lee como lo que es.
  //
  // De donde sale cada una lo dice el horno (`anclaje` 4 y 5, la boca del pod proyectada con la
  // camara con la que se horneo). La hoja de three (`?horno=three`) solo trae la 4: la 5 es su espejo.
  const pd = hoja ? enemyArt.anclaje('chancha', 4, s.x, { centerY: s.y }, k) : null;
  const pi = hoja ? enemyArt.anclaje('chancha', 5, s.x, { centerY: s.y }, k) : null;
  const oD = pd || { x: s.x + w * 0.37, y: bodyY + h * 0.2 };
  const oI = pi || { x: 2 * s.x - oD.x, y: oD.y };
  const b = proj(c.bx, c.by, c.bz);
  const bI = { x: 2 * s.x - b.x, y: b.y, k: b.k };
  manguera(oI, bI, k);
  manguera(oD, b, k);
  canasta(bI, false, 0.7);
  canasta(b, c.conn, 1);

  // LA CAJA — donde hay que meterse y SOSTENERSE (pedido del autor 24/9). Tres estados, y el color es
  // todo el mensaje:
  //   afuera        las cuatro esquinas en cresta, tenues: la ayuda de punteria de siempre;
  //   NARANJA       adentro pero todavia sin pasar nafta: titila rapido mientras dura el enganche
  //                 (CH_ENGANCHE) — "aguanta ahi";
  //   CARGANDO      ya no se dibuja (15/10, el autor: "el cuadrado verde quitar"): enganchado, el verde
  //                 pasa al RELOJ DE NAFTA (borde, aguja y lo que va entrando — render/hud.js).
  if (c.fase === 'cita') {
    const c0 = proj(c.bx - CH_BOX, c.by + CH_BOX, c.bz), c1 = proj(c.bx + CH_BOX, c.by - CH_BOX, c.bz);
    const bw2 = c1.x - c0.x, bh2 = c1.y - c0.y;
    if (!c.conn) {
      ctx.globalAlpha = 0.35 + 0.2 * Math.sin(run.t * 5);
      const esq = Math.max(2, bw2 * 0.22);
      for (const [ex, ey] of [[c0.x, c0.y], [c1.x - esq, c0.y], [c0.x, c1.y - 1], [c1.x - esq, c1.y - 1]]) px(ex, ey, esq, 1, P.crest);
      for (const [ex, ey] of [[c0.x, c0.y], [c1.x - 1, c0.y], [c0.x, c1.y - esq], [c1.x - 1, c1.y - esq]]) px(ex, ey, 1, esq, P.crest);
    } else if (!c.cargando) {
      const col = c.cargando ? CAJA_VERDE : P.accent;
      ctx.globalAlpha = c.cargando ? 0.55 + 0.35 * Math.sin(run.t * 4) : (Math.sin(run.t * 18) > 0 ? 0.95 : 0.25);
      const g = c.cargando ? 2 : 1;
      px(c0.x, c0.y, bw2, g, col); px(c0.x, c1.y - g, bw2, g, col);
      px(c0.x, c0.y, g, bh2, col); px(c1.x - g, c0.y, g, bh2, col);
      // enganchando: una barrita adentro, abajo, que se llena con el tiempo que falta
      if (!c.cargando) px(c0.x + 2, c1.y - 4, Math.max(1, (bw2 - 4) * c.enganche), 1, col);
      else { ctx.globalAlpha *= 0.18; px(c0.x, c0.y, bw2, bh2, col); }
    }
    ctx.globalAlpha = 1;
  }

  // EL RUMBO: mientras la cita este en el aire y el avion no la tenga a tiro, una flecha en el
  // borde de la pantalla dice para donde esta. Sin esto, la Chancha esta arriba y el jugador
  // mirando el suelo — y la ventana se vence sin que nadie sepa que empezo.
  // (RF-03: mientras este EN EL AIRE. Antes pedia ademas estar 14 m por debajo, y esa condicion
  // apagaba la flecha justo en el tramo en que mas sirve — cuando ya subiste y la estas buscando
  // de costado. Se apaga sola al enganchar, que es cuando estorba.)
  if (c.fase === 'cita' && !c.conn) {
    // LA FLECHA DE METAL SLUG (4/10): blanca, gorda, con filo oscuro, punta ARRIBA (la Chancha esta
    // arriba tuyo) y titilando prendida/apagada como el "GO" — no el triangulito naranja de antes, que
    // en un cielo de atardecer no se veia.
    const mx = Math.max(16, Math.min(W - 16, s.x));
    if (Math.sin(run.t * 9) > -0.3) flechaIn(mx, HOR + 8, 2, 'blanco', -1);
  }
}

// EL NARANJA DE LA MANGUERA: el de las mangueras de reabastecimiento, que se pintan para que el que
// recibe las vea contra el cielo. Con el gris oscuro de antes (una cadena de puntos de 1 px) la
// manguera se perdia contra el mar. El oscuro va de sombra, abajo a la derecha: le da cuerpo de tubo.
const MANG = '#f08a2c', MANG_SOMBRA = '#7a3814', MANG_MARCA = '#f4efe2', MANG_GLOBO = '#ffb35c';

/** La manguera, de la boca del pod `o` a la canasta `b` (los dos en pantalla). Engorda hacia la
 *  canasta, que esta mas cerca de la camara (CH_Z - CH_HOSE_Z contra CH_Z): de grosor parejo se ve
 *  como un hilo pegado al cielo y no como un tubo que viene hacia vos.
 *  (23/11, el autor: "hay mucha calidad diferente de resolucion ahi, mejora la manguera"): era una fila de cuadrados de
 *  la grilla de diseño (`px`, 3 px de pantalla cada uno) al lado del avion en HD. Ahora es un TRAZO de canvas —que llega
 *  al pixel de pantalla—: la curva que cuelga, en tramos que engordan hacia la canasta, con filo oscuro, el naranja, un
 *  brillo arriba y las fajas blancas de la punta. */
function manguera(o, b, k, flujo = null) {
  const kb = b.k;                                          // la escala a la profundidad de la canasta
  const cuelga = Math.abs(b.y - o.y) * 0.25;
  const N = 24, pt = u => ({ x: o.x + (b.x - o.x) * u, y: o.y + (b.y - o.y) * u + Math.sin(u * Math.PI) * cuelga });
  const ancho = u => Math.max(0.8, (k + (kb - k) * u) * 0.2);
  ctx.save(); ctx.lineCap = 'round';
  const tramos = (col, extra, dy = 0, dx = 0, filtro) => {
    ctx.strokeStyle = col;
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N, um = (u0 + u1) / 2;
      if (filtro && !filtro(um)) continue;
      const a = pt(u0), c = pt(u1), w = ancho(um);
      ctx.lineWidth = Math.max(0.35, w + extra(w));
      ctx.beginPath(); ctx.moveTo(a.x + dx * w, a.y + dy * w); ctx.lineTo(c.x + dx * w, c.y + dy * w); ctx.stroke();
    }
  };
  tramos(MANG_SOMBRA, w => w * 0.45 + 0.35);                              // el filo oscuro
  tramos(MANG, () => 0);                                                  // el tubo
  tramos('#ffc58a', w => -w * 0.7, -0.22, -0.12);                         // el brillo, arriba a la izquierda
  // LAS MARCAS BLANCAS de la punta: las fajas que tiene la manguera real cerca de la canasta
  tramos(MANG_MARCA, () => 0, 0, 0, u => (u > 0.78 && u < 0.82) || (u > 0.87 && u < 0.91));
  // LOS GLOBITOS DE NAFTA: bultos que bajan del pod a la canasta mientras pasa combustible. La manguera se infla donde
  // pasa cada uno (filo oscuro, naranja claro y un brillo), y achican apenas al entrar y al llegar para no aparecer de golpe.
  if (flujo !== null) {
    const NG = 4, VEL = 0.85;                                             // globitos en la manguera; manguera por segundo
    for (let i = 0; i < NG; i++) {
      const u = (flujo * VEL + i / NG) % 1;
      const a = pt(u), w = ancho(u), borde = Math.min(1, u / 0.08, (1 - u) / 0.08);
      const r = Math.max(0.6, w * (0.95 + 0.25 * Math.sin(flujo * 9 + i)) * borde);
      const q0 = pt(Math.max(0, u - 0.02)), q1 = pt(Math.min(1, u + 0.02)), ang = Math.atan2(q1.y - q0.y, q1.x - q0.x);   // estirado a lo largo del tubo
      ctx.fillStyle = MANG_SOMBRA; ctx.beginPath(); ctx.ellipse(a.x, a.y, r * 1.5 + 0.4, r + 0.4, ang, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = MANG_GLOBO; ctx.beginPath(); ctx.ellipse(a.x, a.y, r * 1.5, r, ang, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff3d6'; ctx.beginPath(); ctx.arc(a.x - r * 0.45, a.y - r * 0.35, Math.max(0.3, r * 0.35), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

/** LA CANASTA vista de atras, que es como la ve el que va a cargar: el ARO abierto, los rayos y el
 *  acople en el medio. Es lo que hay que ir a buscar, asi que va MAS claro que el resto del avion
 *  —el unico punto de toda la pantalla que importa mientras dura la cita— y con un filo oscuro para
 *  que no se pierda contra un cielo claro. Enganchado, el aro pasa al naranja de la caja.
 *  (23/11: con trazos finos, como la manguera: la tela translucida entre los rayos, ocho rayos, el aro con su filo y el
 *  acople redondo — antes, aros de cuadraditos que se veian en otra resolucion que el avion) */
function canasta(b, conn, alfa) {
  const R = Math.max(2, b.k * 0.8), g = Math.max(0.6, R * 0.16);
  const col = conn ? P.accent : P.foam;
  ctx.save();
  ctx.globalAlpha = alfa;
  const circ = r => { ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); };
  // la tela de la canasta, translucida
  ctx.globalAlpha = alfa * 0.45; ctx.fillStyle = '#b9b2a2'; circ(R); ctx.fill();
  ctx.globalAlpha = alfa;
  // los rayos (ocho), del acople al aro
  ctx.strokeStyle = '#59646a'; ctx.lineWidth = Math.max(0.35, R * 0.05);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + i * Math.PI / 4;
    ctx.moveTo(b.x + Math.cos(a) * R * 0.3, b.y + Math.sin(a) * R * 0.3); ctx.lineTo(b.x + Math.cos(a) * R, b.y + Math.sin(a) * R);
  }
  ctx.stroke();
  // el aro: filo oscuro y el color encima
  ctx.strokeStyle = '#1e2420'; ctx.lineWidth = g + 0.8; circ(R); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = g; circ(R); ctx.stroke();
  // el acople, donde entra la sonda
  const ac = Math.max(0.8, R * 0.28);
  ctx.fillStyle = '#1e2420'; circ(ac); ctx.fill();
  ctx.fillStyle = MANG; circ(ac * 0.55); ctx.fill();
  ctx.restore();
}
