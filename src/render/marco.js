// EL MARCO — la NIEBLA DE GUERRA de los costados del PASILLO.
//
// Tapa con un velo lo que NO es pasillo: el mundo que queda afuera del carril por donde puede
// venir algo. El carril siempre estuvo ahi (FLY_X para el avion, SPAWN_X para lo que nace), pero
// era invisible: se aprendia muriendo contra un borde que nadie dibujo nunca.
//
// DOS MODOS, y no son el mismo efecto con otro color:
//   BRUMA (blanco) — el mar se pierde en la bruma. Es el clima del Atlantico Sur y suma al mundo.
//   FOCUS (negro)  — el resto se apaga. Es una viñeta de cine: no dice nada del mundo, dice
//                    "mira aca". Para quien quiera el pasillo lo mas legible posible.
//
// LA REGLA QUE LO VUELVE HONESTO: el borde interno del velo es la PROYECCION del carril, y nunca
// la cruza. Como todo lo que puede pegarte nace dentro de SPAWN_X (y MARCO_X le suma margen para
// el ala), el velo no puede tapar un obstaculo — ni el mas extremo, ni el mas lejano. Es la
// diferencia con `cfg.fog` (systems/fog.js), que SI tapa y por eso es dificultad y no preferencia.
//
// POR QUE SE DIBUJA POR FILAS. La misma cuenta que el raster del mar (drawSea en world.js): a la
// fila `dy` bajo el horizonte le corresponde k = dy / cam.y, y con esa escala el borde del carril
// cae donde cae. Fila por fila el velo sigue la perspectiva exacta y el degradado horizontal le
// saca el filo. Un poligono con un solo degradado dejaba un canto duro en la parte donde la cuña
// se cierra — se veia el truco.

import { ctx, W, H, HOR, F } from './ctx.js';
import { cam, cfg } from '../core/state.js';
import { MARCO_X, MARCO_REACH, MARCO_A, MARCO_COL, MARCO_SKY } from '../data/tuning.js';
import { bendW, pared } from '../core/zigzag.js';

// margen de dibujo hacia afuera de la pantalla: con el HORIZONTE GIRATORIO el mundo rota y las
// esquinas dejan de estar tapadas por el borde. Mismo motivo que el -70/W+140 del cielo.
const OVER = 96;

/** Color con alfa en hexa (#rrggbbaa). Mismo helper que drawVeil: el degradado necesita el alfa
 *  DENTRO del color, no en globalAlpha, porque cada parada del degradado tiene el suyo. */
function hexA(c, k) {
  return c + Math.round(Math.max(0, Math.min(1, k)) * 255).toString(16).padStart(2, '0');
}

/** ¿Esta activo el marco? Unico lugar del codigo que sabe que 'off' es el valor apagado. */
// ...y se apaga solo cuando hay PAREDES (zigzag Z3): la ladera ya dice donde termina el carril,
// y un velo encima de una montaña es una montaña borrosa.
const marcoOn = () => (cfg.marco === 'bruma' || cfg.marco === 'focus') && !pared();

/** El velo lateral. Se dibuja DENTRO del giro del horizonte (es aire del mundo, rola con el) y
 *  ANTES del avion, la lluvia y los popups: el marco esta afuera, nunca sobre tu propio avion. */
export function drawMarco() {
  if (!marcoOn()) return;
  const col = MARCO_COL[cfg.marco], aMax = MARCO_A[cfg.marco];
  const reachMax = W * MARCO_REACH;

  if (cam.y <= 0.1) return;   // camara al ras: la fila no tiene profundidad y la cuenta se dispara

  // UNA SOLA PASADA, del cielo al primer plano. El cielo se hizo primero por bandas (ahi no hay
  // perspectiva que seguir, solo opacidad) y se veian los escalones: diez lineas horizontales
  // cruzando las sierras. Ahora comparte el bucle — y de paso empalma sin costura con el suelo,
  // que era el otro problema del corte en dos: arriba del horizonte el velo terminaba en
  // MARCO_REACH y abajo en el borde del carril, y el salto se leia como una muesca.
  for (let y = -OVER; y < H + OVER; y++) {
    const dy = y - HOR;
    // ARRIBA DEL HORIZONTE el carril no existe: k = 0 lo colapsa en el punto de fuga, que es
    // exactamente como se ve un carril infinitamente lejos. La unica diferencia es que ahi el
    // velo se APAGA hacia arriba (aFade) — las esquinas de arriba son donde vive el HUD, y
    // lavarle el fondo a los instrumentos es lo unico que este efecto no puede hacer.
    const k = Math.max(0, dy) / cam.y;                  // misma escala que la fila del mar
    // CUADRATICA y medida contra el ALTO DE PANTALLA (no contra el margen de dibujo): el velo
    // se muere rapido apenas sube del horizonte, asi que sostiene la costura de la linea y en
    // las esquinas de arriba ya no queda casi nada. Con una rampa lineal, la palabra GAS del
    // HUD quedaba sobre bruma a 0.38 y dejaba de leerse.
    const sk = dy >= 0 ? 0 : Math.min(1, -dy / HOR);
    const aFade = MARCO_SKY + (1 - MARCO_SKY) * (1 - sk) * (1 - sk);
    // EL VELO DOBLA CON EL CARRIL (zigzag Z1). Aca `k` ya ES F/z —la misma escala que el mar—,
    // asi que la profundidad de la fila sale de invertirlo. Sin esto el velo se quedaria recto
    // mientras el mundo dobla, y taparia justo el lado de adentro de la curva: exactamente lo
    // que el marco promete no hacer nunca (su regla es que jamas cruza el carril).
    const zb = k > 0.0001 ? bendW(F / k) * k : 0;
    const xL = W / 2 + (-MARCO_X - cam.x) * k + zb;    // borde IZQUIERDO del carril en pantalla
    const xR = W / 2 + (MARCO_X - cam.x) * k + zb;
    const rL = Math.min(reachMax, xL), rR = Math.min(reachMax, W - xR);
    if (rL <= 0 && rR <= 0 && dy > 0) break;            // el carril ya es mas ancho que la pantalla
    if (rL > 0) {
      // el alfa cae con lo que queda de velo: donde la cuña se cierra, en vez de terminar en una
      // astilla dura, se apaga
      const gl = ctx.createLinearGradient(xL - rL, 0, xL, 0);
      gl.addColorStop(0, hexA(col, aMax * aFade * Math.min(1, rL / reachMax)));
      gl.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = gl; ctx.fillRect(-OVER, y, xL + OVER, 1);
    }
    if (rR > 0) {
      const gr = ctx.createLinearGradient(xR + rR, 0, xR, 0);
      gr.addColorStop(0, hexA(col, aMax * aFade * Math.min(1, rR / reachMax)));
      gr.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = gr; ctx.fillRect(xR, y, W + OVER - xR, 1);
    }
  }
}
