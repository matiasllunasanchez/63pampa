// EL FRENTE DE TORMENTA, DIBUJADO (18/11/2026; el estado en systems/frente.js, que deja `run.frente`).
//
// LA PARED (drawFrenteMuro): la nube de arco de las fotos del autor — una masa gris oscura con escalones claros
// en el borde de abajo (el "labio" de la nube) y, debajo, la cortina de lluvia hasta el horizonte. Se proyecta con
// la camara de siempre: base y techo en metros (FRENTE.BASE / TOPE) a la distancia que falta, asi que de lejos es
// una franja baja en el horizonte y al acercarse trepa hasta taparte el cielo. Va con el fondo: despues del cielo
// y antes de las sierras (las sierras quedan delante).
//
// LA NIEBLA DEL CRUCE y LO OSCURO (drawFrenteNiebla): encima del mundo y debajo del HUD.
import { ctx, W, H, HOR, F } from './ctx.js';
import { cam } from '../core/state.js';
import { run } from '../core/run.js';
import { FRENTE } from '../data/tuning.js';

const suave = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
const X0 = -80, X1 = W + 80, PASO = 4;

export function drawFrenteMuro() {
  const fr = run.frente;
  if (!fr || fr.muro == null) return;
  const d = Math.max(30, fr.muro), k = F / d;
  const a = suave((FRENTE.VISTA - d) / 800);          // asoma de a poco en el horizonte
  if (a <= 0.01) return;
  const yBase = HOR - (FRENTE.BASE - cam.y) * k, yTop = HOR - (FRENTE.TOPE - cam.y) * k, alto = Math.max(2, yBase - yTop);
  // el techo, abollado (los bultos crecen con la cercania) y el labio, una curva larga y suave
  const top = x => yTop + (Math.sin(x * 0.019 + 1.3) * 0.55 + Math.sin(x * 0.051 + 0.7) * 0.3 + Math.sin(x * 0.13) * 0.12) * alto * 0.22;
  const lab = x => yBase + Math.sin(x * 0.011 + 0.4) * alto * 0.05;
  const contorno = (f, g2) => { ctx.beginPath(); ctx.moveTo(X0, f(X0));
    for (let x = X0; x <= X1; x += PASO) ctx.lineTo(x, f(x));
    for (let x = X1; x >= X0; x -= PASO) ctx.lineTo(x, g2(x));
    ctx.closePath(); };
  ctx.save();
  ctx.globalAlpha = a;
  // LA CORTINA DE LLUVIA, debajo del labio hasta el horizonte: el mar lejano se pierde en gris
  if (yBase < HOR + 4) {
    const g = ctx.createLinearGradient(0, yBase, 0, HOR + 4);
    g.addColorStop(0, 'rgba(38,44,51,0.92)'); g.addColorStop(1, 'rgba(62,69,76,0.8)');
    ctx.fillStyle = g; ctx.fillRect(X0, yBase, X1 - X0, HOR + 4 - yBase);
    ctx.fillStyle = 'rgba(110,118,126,0.18)';
    for (let x = X0 + ((run.dist * 0.05) % 6); x < X1; x += 6) ctx.fillRect(x, yBase + 1, 1, HOR + 3 - yBase);
  }
  // LA MASA, opaca: oscura arriba, mas oscura todavia contra el labio (la panza)
  const g = ctx.createLinearGradient(0, yTop, 0, yBase);
  g.addColorStop(0, '#4a5057'); g.addColorStop(0.5, '#353b42'); g.addColorStop(1, '#1d2227');
  ctx.fillStyle = g;
  contorno(top, lab); ctx.fill();
  // LAS ESTRIAS de la nube de arco: dos franjas apenas mas claras, paralelas al labio
  for (const [f0, f1, col] of [[0.3, 0.36, 'rgba(120,128,136,0.22)'], [0.55, 0.6, 'rgba(120,128,136,0.16)']]) {
    ctx.fillStyle = col;
    contorno(x => lab(x) - alto * f1 + Math.sin(x * 0.027 + f0 * 9) * alto * 0.03, x => lab(x) - alto * f0);
    ctx.fill();
  }
  // EL LABIO: el borde de abajo, claro (la luz que entra por debajo de la nube)
  ctx.fillStyle = '#8b939a';
  contorno(x => lab(x) - Math.max(1, alto * 0.035), lab); ctx.fill();
  ctx.restore();
}

/** La niebla del cruce y la penumbra de la pared encima. */
export function drawFrenteNiebla() {
  const fr = run.frente;
  if (!fr) return;
  ctx.save();
  if (fr.oscuro > 0.01) {
    ctx.globalAlpha = fr.oscuro; ctx.fillStyle = '#0b0f14';
    ctx.fillRect(-W, -H, W * 3, H * 3);
  }
  if (fr.niebla > 0.01) {
    // mas cerrada contra el horizonte; gris claro de este lado, mas oscuro del lado de la tormenta
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(96,104,112,0.82)');
    g.addColorStop(HOR / H, 'rgba(118,126,133,1)');
    g.addColorStop(1, 'rgba(84,92,100,0.9)');
    ctx.globalAlpha = fr.niebla; ctx.fillStyle = g;
    ctx.fillRect(-W, -H, W * 3, H * 3);
  }
  ctx.restore();
}
