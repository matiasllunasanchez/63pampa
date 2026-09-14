// LA AUREOLA DEL SOL — el destello de lente del astro que tenes de frente.
//
// QUE ES. Lo que hace una lente real cuando el sol le pega de frente: el disco se desborda en un
// nucleo encendido con puas, y adentro del vidrio rebotan FANTASMAS —los circulos y hexagonos que
// se van escalonando hacia el otro lado de la pantalla—. No es un brillo alrededor del sol: es
// suciedad optica, y por eso los fantasmas caen en la RECTA que une al sol con el centro de la
// pantalla, del lado opuesto. Esa recta es el eje optico; si los fantasmas no caen ahi, el efecto
// se lee como calcomanias.
//
// CUANDO APARECE: SIEMPRE que el cielo este en pantalla (pedido de Matias, 13/9/2026). Nacio atada
// al PODER RASANTE —el poder ya ACLARA en vez de oscurecer, ver MODOS.rasante en desenfoque.js— y
// quedo suelta al dia siguiente: una lente no deja de tener sol porque vos no estes usando un
// poder. No hizo falta ningun candado de estado para soltarla: `sol` llega en null en cualquier
// cuadro donde el telon no se haya anclado, asi que el destello existe exactamente cuando el cielo
// esta, y en ningun otro momento. En el menu de titulo y en la pausa queda DEBAJO de lo que esas
// pantallas pintan encima, que es donde tiene que quedar.
//
// DE DONDE SALE LA POSICION DEL SOL, que es lo unico dificil de todo esto. El sol NO es procedural:
// viene dibujado adentro de la foto de fondo del clima (assets/world/terrain_back/, ver TBACK_MAP
// en game.js). Asi que cada cielo tiene el suyo en otro lado, y el telon ademas se corre con el
// parallax de la camara y con el zigzag. La posicion llega YA RESUELTA EN PANTALLA por parametro
// (convencion 4: el render recibe una foto del estado, no sale a buscarla); quien sabe anclar el
// telon es game.js, y es el unico que puede saberlo.
//
// Y HAY CIELOS SIN SOL. Tres de los ocho fondos no tienen astro a la vista —el nublado lo tiene
// tapado, la noche muestra auroras y la tormenta, relampagos—. Esos no traen `sol` en la tabla y
// aca no se dibuja nada. Un destello sin astro del cual salir es una mancha en el vidrio.

import { ctx, W, H } from './ctx.js';

// ------------------------------- PERILLAS -------------------------------

/** Cuanto tarda en entrar y salir. Mas lento que el desenfoque a proposito: el poder dura varios
 *  segundos y la aureola tiene que sentirse como que el ojo se acostumbra, no como un interruptor. */
const RAMPA = 0.06;

/** Opacidad general a intensidad plena. Va BAJA: se dibuja en modo `lighter` (suma luz), y sumar
 *  sobre un cielo que ya es claro se va a blanco puro enseguida. */
const FUERZA = 0.62;

/** CUANTO PESA EN VUELO NORMAL, contra el 1 del PODER RASANTE (pedido de Matias, 13/9/2026).
 *
 *  La mitad, y la diferencia hace trabajo: volando se lee como el sol que tenes de frente y nada
 *  mas; cuando entra el poder, el destello CRECE. Como la rampa del modulo se encarga de la
 *  transicion, ese crecimiento se ve —el mundo se te abre— en vez de ser un salto de un cuadro.
 *
 *  Vive ACA y no en game.js porque es una decision de COMO SE VE. El que llama sabe si el poder
 *  esta puesto; cuanto brilla cada caso lo sabe el que dibuja. */
export const AURA_NORMAL = 0.5;

/** El nucleo: radio del resplandor y de las puas, en pixeles de mundo. */
const NUCLEO_R = 46, PUA_LARGO = 78, PUAS = 10;

/** LOS FANTASMAS, sobre el eje optico. `t` es la posicion en esa recta: 0 = el sol, 1 = el centro
 *  de la pantalla, >1 = pasado el centro, del otro lado. `r` el radio y `a` cuanto pesa.
 *  `lados` 0 = circulo, 6 = hexagono (el diafragma de la lente).
 *
 *  Los negativos —detras del sol— son pocos y chicos a proposito: existen, pero si se cargan mucho
 *  el efecto deja de leerse como "rebote adentro del vidrio" y parece que el sol tuviera cola. */
const FANTASMAS = [
  { t: -0.28, r: 5,  a: 0.26, lados: 6 },
  { t:  0.30, r: 9,  a: 0.20, lados: 6 },
  { t:  0.52, r: 4,  a: 0.34, lados: 0 },
  { t:  0.78, r: 14, a: 0.10, lados: 6 },
  { t:  1.00, r: 6,  a: 0.26, lados: 0 },
  { t:  1.28, r: 20, a: 0.055, lados: 6 },
  { t:  1.55, r: 11, a: 0.12, lados: 0 },
  { t:  1.86, r: 27, a: 0.035, lados: 6 },
];

/** El aro grande del final del eje: el anillo que deja el borde del diafragma. */
const ARO_T = 2.1, ARO_R = 40;

/** QUITAR con la sonda __auradbg. */
export const AURA_DBG = { f: 0, x: 0, y: 0, hay: false };

let f = 0;   // la intensidad viva, 0..1 — la unica memoria del modulo

/** Un disco con el borde blando, en modo suma. `col` es 'r,g,b'. */
function disco(x, y, r, a, col) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${col},${a.toFixed(3)})`);
  g.addColorStop(0.55, `rgba(${col},${(a * 0.35).toFixed(3)})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** EL HEXAGONO DEL DIAFRAGMA. Con `lados` 0 cae en disco().
 *
 *  RELLENO CASI NULO Y BORDE ENCENDIDO, y esto se aprendio mirando: con relleno parejo el fantasma
 *  grande se leia como un POLIGONO GRIS pegado sobre el mar —una figura, no una luz—. Lo que hace
 *  que se lea como luz atrapada en el vidrio es el ARO: un fantasma real es casi hueco y brilla en
 *  el canto, que es justamente el borde de las hojas del diafragma. */
function poli(x, y, r, a, col, lados, giro) {
  if (!lados) { disco(x, y, r, a, col); return; }
  const trazo = () => {
    ctx.beginPath();
    for (let i = 0; i < lados; i++) {
      const ang = giro + i * Math.PI * 2 / lados;
      const px2 = x + Math.cos(ang) * r, py2 = y + Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
    }
    ctx.closePath();
  };
  ctx.fillStyle = `rgba(${col},${(a * 0.45).toFixed(3)})`;
  trazo(); ctx.fill();
  ctx.strokeStyle = `rgba(${col},${a.toFixed(3)})`;
  ctx.lineWidth = 1;
  trazo(); ctx.stroke();
}

/** LA AUREOLA.
 *
 *  @param sol  { x, y, col } posicion del astro EN PANTALLA (mundo 480x270) y su color 'r,g,b',
 *              o null si este cielo no tiene astro a la vista
 *  @param obj  0..1 — cuanto poder hay ahora. Lo decide game.js; el modulo solo suaviza el cambio.
 */
export function drawAureola(sol, obj) {
  const tgt = sol ? Math.max(0, Math.min(1, obj || 0)) : 0;
  f += (tgt - f) * RAMPA;
  AURA_DBG.f = +f.toFixed(3); AURA_DBG.hay = !!sol;
  if (sol) { AURA_DBG.x = Math.round(sol.x); AURA_DBG.y = Math.round(sol.y); }
  if (f < 0.004 || !sol) { if (f < 0.004) f = 0; return; }

  // EL SOL PUEDE ESTAR FUERA DE CUADRO: el telon se corre con el parallax de la camara y con el
  // zigzag, asi que en una curva larga el astro se va de la pantalla. Ahi la aureola se apaga por
  // distancia en vez de cortarse de golpe — una lente no deja de brillar en un cuadro.
  const fuera = Math.max(0, Math.abs(sol.x - W / 2) - W / 2) / (W * 0.35);
  const vis = f * Math.max(0, 1 - fuera);
  if (vis < 0.004) return;

  const col = sol.col || '255,196,120';
  const A = vis * FUERZA;
  const cx = W / 2, cy = H / 2;
  const dx = cx - sol.x, dy = cy - sol.y;

  ctx.save();
  // SUMA DE LUZ, no pintura encima. Un destello de lente es luz que SE AGREGA: con 'source-over'
  // el mismo dibujo se lee como una calcomania gris sobre el cielo.
  ctx.globalCompositeOperation = 'lighter';

  // 1. EL NUCLEO: el disco desbordado, con un corazon chico y muy encendido adentro.
  disco(sol.x, sol.y, NUCLEO_R, A * 0.55, col);
  disco(sol.x, sol.y, NUCLEO_R * 0.34, A * 0.85, '255,246,228');

  // 2. LAS PUAS. Van desde el nucleo hacia afuera, alternando largas y cortas — con todas iguales
  //    se lee como una estrella de navidad y no como luz desparramandose por el vidrio.
  ctx.strokeStyle = `rgba(${col},${(A * 0.42).toFixed(3)})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < PUAS; i++) {
    const ang = i * Math.PI * 2 / PUAS + 0.2;
    const L = PUA_LARGO * (i % 2 ? 0.45 : 1);
    ctx.moveTo(sol.x + Math.cos(ang) * NUCLEO_R * 0.25, sol.y + Math.sin(ang) * NUCLEO_R * 0.25);
    ctx.lineTo(sol.x + Math.cos(ang) * L, sol.y + Math.sin(ang) * L);
  }
  ctx.stroke();

  // 3. EL DESTELLO HORIZONTAL (anamorfico): la raya que cruza el cuadro a la altura del sol. Es la
  //    firma mas reconocible de una lente y la mas barata — un degrade de un solo alto.
  const est = ctx.createLinearGradient(sol.x - W * 0.55, 0, sol.x + W * 0.55, 0);
  est.addColorStop(0, `rgba(${col},0)`);
  est.addColorStop(0.5, `rgba(${col},${(A * 0.30).toFixed(3)})`);
  est.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = est;
  ctx.fillRect(sol.x - W * 0.55, sol.y - 1, W * 1.1, 2);

  // 4. LOS FANTASMAS sobre el eje optico.
  for (let i = 0; i < FANTASMAS.length; i++) {
    const g2 = FANTASMAS[i];
    poli(sol.x + dx * g2.t, sol.y + dy * g2.t, g2.r, A * g2.a, col, g2.lados, i * 0.7);
  }

  // 5. EL ARO del final: solo contorno, que es lo que lo distingue de un fantasma mas.
  ctx.strokeStyle = `rgba(${col},${(A * 0.14).toFixed(3)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sol.x + dx * ARO_T, sol.y + dy * ARO_T, ARO_R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

