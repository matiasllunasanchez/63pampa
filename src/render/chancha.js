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
  // LAS HELICES VAN SIEMPRE POR CODIGO, con hoja o sin ella: un disco horneado se ve MUERTO, y lo
  // que dice que este avion esta volando —y no pegado en el cielo— es que las cuatro giren.
  //
  // DONDE VAN LO DICE EL HORNO. Con la hoja puesta, la posicion de cada disco sale de `anclaje()`:
  // el horneador proyecta el cono de cada helice del modelo con la MISMA camara con la que horneo
  // y escribe el pixel en src/data/cajas.js. Antes eran cuatro fracciones del ancho puestas a ojo
  // —±0.19 y ±0.34—, y estaban atadas a que los motores del modelo no se movieran nunca: cuando se
  // corrigieron a su posicion real (estaban un 50 % afuera) las cuatro helices habrian quedado
  // flotando al lado de sus gondolas, y no hay error de runtime que avise de eso.
  // Sin hoja, se cae a las fracciones de siempre, que es lo que el dibujo procedural necesita.
  //
  // EL DISCO SE VE DE CANTO. La hoja se hornea desde 12° por debajo, asi que el circulo de 4,1 m de
  // la helice se proyecta casi de perfil: ancho entero, alto una fraccion. Dibujarlo redondo la
  // haria parecer de frente. La proporcion exacta seria sen(12°) = 0,21 —tres pixeles, o sea nada—
  // y va en 0,30: una helice girando se ve como una banda BORROSA, mas gorda que el plano
  // geometrico que barre. Es de las pocas veces que el dibujo le gana a la cuenta.
  const HEL_D = 2.64;                                  // diametro del disco, en unidades de mundo
  for (let i = 0; i < 4; i++) {
    const a = hoja ? enemyArt.anclaje('chancha', i, s.x, { centerY: s.y }, k) : null;
    const f = [-0.34, -0.19, 0.19, 0.34][i];
    const hx = a ? a.x : s.x + w * f;
    const hy = a ? a.y : bodyY - h * 0.62;
    const dw = Math.max(2, HEL_D * k), dh = Math.max(1, dw * 0.30);
    ctx.globalAlpha = 0.30 + 0.22 * Math.sin(run.t * 30 + i * 2.2);
    px(hx - dw / 2, hy - dh / 2, dw, dh, P.dim);
    ctx.globalAlpha = 0.5;
    px(hx - dw / 2, hy - dh / 2, dw, Math.max(1, dh * 0.22), P.dim);   // el filo del disco
    ctx.globalAlpha = 1;
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
  //   VERDE         enganchado y cargando: el recuadro entero LATE, lento, mientras entra la nafta.
  if (c.fase === 'cita') {
    const c0 = proj(c.bx - CH_BOX, c.by + CH_BOX, c.bz), c1 = proj(c.bx + CH_BOX, c.by - CH_BOX, c.bz);
    const bw2 = c1.x - c0.x, bh2 = c1.y - c0.y;
    if (!c.conn) {
      ctx.globalAlpha = 0.35 + 0.2 * Math.sin(run.t * 5);
      const esq = Math.max(2, bw2 * 0.22);
      for (const [ex, ey] of [[c0.x, c0.y], [c1.x - esq, c0.y], [c0.x, c1.y - 1], [c1.x - esq, c1.y - 1]]) px(ex, ey, esq, 1, P.crest);
      for (const [ex, ey] of [[c0.x, c0.y], [c1.x - 1, c0.y], [c0.x, c1.y - esq], [c1.x - 1, c1.y - esq]]) px(ex, ey, 1, esq, P.crest);
    } else {
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
const MANG = '#f08a2c', MANG_SOMBRA = '#7a3814', MANG_MARCA = '#f4efe2';

/** La manguera, de la boca del pod `o` a la canasta `b` (los dos en pantalla). Engorda hacia la
 *  canasta, que esta mas cerca de la camara (CH_Z - CH_HOSE_Z contra CH_Z): de grosor parejo se ve
 *  como un hilo pegado al cielo y no como un tubo que viene hacia vos. */
function manguera(o, b, k) {
  const kb = b.k;                                          // la escala a la profundidad de la canasta
  const cuelga = Math.abs(b.y - o.y) * 0.25;
  const n = Math.max(12, Math.ceil(Math.hypot(b.x - o.x, b.y - o.y)));   // un punto por pixel: sin huecos
  // dos pasadas: primero la sombra corrida un pixel abajo y a la derecha, despues el naranja encima.
  // Con la sombra pegada a cada punto, en el tramo casi vertical cada punto tapaba la del anterior y
  // la manguera salia rayada como una cadena.
  for (const pasada of [0, 1]) {
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const hx = o.x + (b.x - o.x) * u, hy = o.y + (b.y - o.y) * u + Math.sin(u * Math.PI) * cuelga;
      const t = Math.max(2, (k + (kb - k) * u) * 0.26);
      if (!pasada) { px(hx - t / 2 + 1, hy - t / 2 + 1, t, t, MANG_SOMBRA); continue; }
      // LAS MARCAS BLANCAS de la punta: las fajas que tiene la manguera real cerca de la canasta
      const marca = (u > 0.78 && u < 0.82) || (u > 0.87 && u < 0.91);
      px(hx - t / 2, hy - t / 2, t, t, marca ? MANG_MARCA : MANG);
    }
  }
}

/** LA CANASTA vista de atras, que es como la ve el que va a cargar: el ARO abierto, cuatro rayos y el
 *  acople en el medio. Es lo que hay que ir a buscar, asi que va MAS claro que el resto del avion
 *  —el unico punto de toda la pantalla que importa mientras dura la cita— y con un filo oscuro para
 *  que no se pierda contra un cielo claro. Enganchado, el aro pasa al naranja de la caja. */
function canasta(b, conn, alfa) {
  const R = Math.max(2, b.k * 0.8), g = Math.max(1, R * 0.24);
  const col = conn ? P.accent : P.foam;
  ctx.globalAlpha = alfa;
  const aro = (r, grueso, color) => {
    const n = Math.max(12, Math.ceil(r * 6));
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      px(b.x + Math.cos(a) * r - grueso / 2, b.y + Math.sin(a) * r - grueso / 2, grueso, grueso, color);
    }
  };
  aro(R, g + 2, '#1e2420');                                // el filo
  for (let i = 0; i < 4; i++) {                            // los rayos de la canasta
    const a = Math.PI / 4 + i * Math.PI / 2;
    for (let r = R * 0.3; r < R; r += 1) px(b.x + Math.cos(a) * r - 0.5, b.y + Math.sin(a) * r - 0.5, 1, 1, P.dim);
  }
  aro(R, g, col);
  const ac = Math.max(2, R * 0.55);                        // el acople, donde entra la sonda
  px(b.x - ac / 2, b.y - ac / 2, ac, ac, '#1e2420');
  px(b.x - ac / 4, b.y - ac / 4, ac / 2, ac / 2, MANG);
  ctx.globalAlpha = 1;
}
