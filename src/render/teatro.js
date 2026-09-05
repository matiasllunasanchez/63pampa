// EL DIBUJO DE LOS TIROS DE UTILERIA (docs/sistemas/PLAN_TEATRO_AEREO.md, TA0).
// La logica vive en systems/teatro.js; esto solo lo pinta.
//
// Espacio de coordenadas: MUNDO (480×270, W/H de ctx.js).
//
// SE DIBUJAN FRIOS, y no es decoracion. El naranja es el color de lo que te lastima en este juego
// —la llama, las explosiones, el fuego que si mata— y estos tiros **no pueden tocar a nadie**. Es
// la misma decision que tomaron las trazadoras del Harrier de LA COLA (`render/caza.js`), por el
// mismo motivo y con el mismo azul: que se lean distinto ES la diferencia entre un aviso y una
// amenaza. Un jugador que ve un misil naranja cruzando la escena aprende que el teatro lo puede
// matar, y esa leccion es falsa.
//
// La FOTO llega por parametro (`systems/teatro.js` → `state()`): un render no importa un sistema
// (convencion 4 de ARQUITECTURA, y lo vigila `npm run lint:layers`).
import { ctx, px } from './ctx.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';

// el mismo azulado frio de las trazadoras que erran, de mas caliente a mas apagado
const FRIO = ['#fdfefe', '#d8ecff', '#9ec8f0', '#5f8fc0'];
// el bando tiñe apenas el nucleo: el del Fiel tira a celeste patrio, el del blanco a gris acero.
// Apenas, porque lo que tiene que leerse primero es que ninguno de los dos es naranja.
const NUCLEO = { fiel: '#e8f6ff', blanco: '#f2f4f4' };

/** El teatro en escena, del mas lejano al mas cercano (pintor correcto). La foto trae `tiros` y
 *  `bolas` (los derribos de TA2). */
export function drawTiros(foto) {
  if (!foto) return;
  dibujaBolas(foto.bolas);
  const lista = foto.tiros;
  if (!lista || !lista.length) return;
  const orden = lista.slice().sort((a, b) => b.z - a.z);
  for (const t of orden) {
    // LA ESTELA DEL MISIL primero: humo que quedo atras, se abre y se apaga por EDAD. Va debajo
    // del proyectil por la misma razon que la del misil del jugador — el humo esta detras.
    for (const h of t.humo || []) {
      const s = proj(h.x, h.y, h.z);
      const w = Math.max(1, s.k * 0.13 * (0.6 + (1 - h.f) * 1.9));
      ctx.globalAlpha = Math.min(0.5, h.f * 0.6);
      px(s.x - w / 2, s.y - w / 2, w, w, h.f > 0.6 ? P.foam : P.dim);
      ctx.globalAlpha = 1;
    }
    // LA COLA: cuatro muestras hacia atras sobre su propio vector. Es lo que hace que se lea como
    // algo que CRUZA y no como un punto que aparece — y en una escena que se mira, cruzar es todo.
    const v = Math.hypot(t.vx, t.vy, t.vz) || 1;
    const paso = (t.tipo === 'misil' ? 0.055 : 0.03);
    for (let i = 4; i >= 1; i--) {
      const f = i * paso;
      const z = t.z - t.vz * f;
      if (z <= 1.5) continue;
      const s = proj(t.x - t.vx * f, t.y - t.vy * f, z);
      const w = Math.max(1, Math.round(s.k * 0.09));
      ctx.globalAlpha = 0.7 * (1 - i / 6);
      px(s.x - w / 2, s.y - w / 2, w, w, FRIO[Math.min(FRIO.length - 1, i >> 1)]);
    }
    ctx.globalAlpha = 1;
    const s = proj(t.x, t.y, t.z);
    const w = Math.max(2, Math.round(s.k * (t.tipo === 'misil' ? 0.22 : 0.15)));
    ctx.globalAlpha = 0.5;
    px(s.x - w / 2 - 1, s.y - w / 2 - 1, w + 2, w + 2, FRIO[2]);   // halo
    ctx.globalAlpha = 1;
    px(s.x - w / 2, s.y - w / 2, w, w, NUCLEO[t.de] || FRIO[0]);
    // el misil, ademas, tiene CUERPO: un trazo corto sobre su vector, para que a esta escala se
    // distinga de una bala grande.
    if (t.tipo === 'misil') {
      const c = proj(t.x - t.vx / v * 1.6, t.y - t.vy / v * 1.6, Math.max(2, t.z - t.vz / v * 1.6));
      ctx.globalAlpha = 0.85;
      px(Math.min(s.x, c.x), Math.min(s.y, c.y), Math.max(1, Math.abs(s.x - c.x)), Math.max(1, Math.abs(s.y - c.y)), FRIO[1]);
      ctx.globalAlpha = 1;
    }
  }
}

/** LAS BOLAS DE FUEGO de los derribos (TA2). Las pinta el teatro con su propia lista y no
 *  `explodeAt`: esa empuja su bola a `obstacles`, y el teatro no entra en las listas del juego.
 *  Las chispas SI son las de siempre — van a `parts`, que no es un contrato de daño.
 *
 *  Un derribo del teatro se pinta CALIENTE, y no se contradice con el azul de los tiros: lo frio
 *  dice "esto no te puede tocar", y una explosion ya ocurrida no le puede pasar nada a nadie. Lo
 *  que se pinta acá es una consecuencia, no una amenaza. */
function dibujaBolas(bolas) {
  if (!bolas || !bolas.length) return;
  for (const b of bolas) {
    const s = proj(b.x, b.y, b.z);
    const r = s.k * (0.9 + b.f * 2.6);
    ctx.globalAlpha = Math.max(0, 1 - b.f) * 0.9;
    px(s.x - r / 2, s.y - r / 2, r, r, b.f < 0.35 ? '#ffe6a8' : P.accent);
    const rc = r * 0.45;
    ctx.globalAlpha = Math.max(0, 1 - b.f * 1.6);
    px(s.x - rc / 2, s.y - rc / 2, rc, rc, '#fffdf4');
    ctx.globalAlpha = 1;
  }
}
