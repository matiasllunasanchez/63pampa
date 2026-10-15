// EL RADAR PROPIO — la onda azul que sale del avion (pedido del autor 15/10; reglas en
// data/radar_propio.js, estado en core/radarPropio.js).
//
// La onda va EN PANTALLA y achatada como el mundo (el horizonte es ancho): un aro que nace en el avion
// y se abre hasta pasar los bordes, apagandose. Al ras, sin ver el blanco, sale tenue y corta — el
// horizonte se la come; arriba y con el blanco a tiro, entera. La marca del blanco la dibuja la cuña
// del objetivo (render/world.js `drawObjectiveMarker`), que en estos aviones solo aparece con eco.
import { ctx } from './ctx.js';
import { PZ, HOR } from './ctx.js';
import { plane } from '../core/state.js';
import { proj } from '../core/fx.js';
import { radarP } from '../core/radarPropio.js';
import { obstacles } from '../core/world.js';
import { RADAR_PROPIO as R, buqueRadar } from '../data/radar_propio.js';

// LA BURBUJA (15/10, el autor: "una onda expansiva que arranca en el centro de la cabina y sale hacia
// adelante y alrededor, como una burbuja creciendo desde la cabina, con el mismo efecto de velo del radar
// verde pero azul"). Es el VELO del radar enemigo (render/world.js drawRadarTinte: mezcla 'color' + las
// lineas del tubo) metido adentro de una elipse que crece: tenue en el medio, fuerte en el borde, y el
// centro se va corriendo hacia el horizonte — hacia adelante — mientras se abre.
const VELO = 0.85;        // la mezcla del borde (el radar verde entra a 0,35-0,6; sobre el mar oscuro hace falta mas)
const LUZ = 0.16;         // y un poco de luz azul SUMADA: sin ella, de noche o en la bruma el velo no se ve
export function drawRadarOndas() {
  if (!radarP.tiene || !radarP.ondas.length) return;
  const s = proj(plane.x, plane.y, PZ);
  const x0 = s.x, y0 = s.y - 3;                      // la cabina, apenas arriba del centro del sprite
  const [r, g, b] = R.COLOR;
  for (const o of radarP.ondas) {
    const u = o.t / R.ONDA_VIDA;
    if (u <= 0 || u >= 1) continue;
    const e = 1 - (1 - u) * (1 - u);                 // sale rapido y frena
    const alcance = radarP.ve ? 1 : 0.55;            // al ras el horizonte se la come
    const rad = 6 + e * R.ONDA_R * alcance;
    const cy = y0 + (HOR - y0) * e * 0.55 * alcance; // hacia adelante: el centro sube al horizonte
    const k = 0.55;                                  // achatada como el mundo
    const a = (1 - u) * (radarP.ve ? 1 : 0.6);
    ctx.save();
    ctx.translate(x0, cy); ctx.scale(1, k);
    // EL VELO: mezcla de color, casi nada adentro y entero en el canto de la burbuja
    const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
    gr.addColorStop(0, `rgba(${r},${g},${b},0.08)`);
    gr.addColorStop(0.7, `rgba(${r},${g},${b},0.3)`);
    gr.addColorStop(0.94, `rgba(${r},${g},${b},1)`);
    gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.globalCompositeOperation = 'color';
    ctx.globalAlpha = a * VELO;
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
    // …y la luz: la misma burbuja, sumada, para que se vea tambien sobre lo oscuro
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = a * LUZ;
    ctx.fill();
    // LAS LINEAS DEL TUBO, adentro de la burbuja (las mismas del velo verde: una cada dos filas)
    ctx.clip();
    ctx.setTransform(ctx.getTransform().scale(1, 1 / k));
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = a * 0.14;
    ctx.fillStyle = '#000';
    const top = Math.floor(-rad * k), bot = Math.ceil(rad * k);
    for (let y = top; y < bot; y += 2) ctx.fillRect(-rad, y, rad * 2, 1);
    ctx.restore();
    // EL CANTO, encendido: lo que hace que se lea como frente que avanza
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = a * 0.7;
    ctx.strokeStyle = `rgb(${r},${g},${b})`; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(x0, cy, rad, rad * k, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

/** LOS HARRIER EN EL RADAR (15/10): la misma flechita azul de la marca del blanco, encima de cada caza que
 *  tenes adelante, con SEA HARRIER arriba. `cazas` es el snapshot de la flota que pasa el orquestador
 *  (el render no importa sistemas): x, y, z en el marco de la camara de persecucion (`zv`, como
 *  render/caza.js), y `enCola` para los que ya te pasaron. */
const AZ = '#5ab4ff', AZ_CLARO = '#d6ecff', AZ_BORDE = '#08162b';
export function drawRadarCazas(cazas, zv) {
  if (!radarP.tiene || radarP.aereoT <= 0 || !cazas || !cazas.length) return;
  const a = Math.min(1, radarP.aereoT / 2);
  const late = Math.floor(performance.now() / 300) % 2 === 0;
  ctx.save();
  ctx.globalAlpha = a; ctx.lineJoin = 'round'; ctx.textAlign = 'center';
  for (const h of cazas) {
    if (h.enCola || h.z <= PZ + 2) continue;
    const s = proj(h.x, h.y, zv(h.z));
    if (!(s.k > 0)) continue;
    const x = Math.round(s.x), punta = Math.round(s.y - Math.max(6, 4 * s.k) - 3), e = R.ECO.harrier;
    flecha(x, punta, e);
    ctx.strokeStyle = AZ_BORDE; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = late ? AZ : '#3f8fe0'; ctx.fill();
    ctx.font = 'bold 6px monospace'; ctx.lineWidth = 2.5;
    ctx.strokeText('SEA HARRIER', x, punta - 9 * e - 2); ctx.fillStyle = AZ_CLARO; ctx.fillText('SEA HARRIER', x, punta - 9 * e - 2);
  }
  ctx.restore();
}

/** LOS OTROS BUQUES EN EL RADAR (15/10): solo la flechita azul, SIN TEXTO — "son puntos nomas". Encima de
 *  cada fragata y barcaza viva que tenes adelante, a la altura de su mastil. */
export function drawRadarBuques() {
  if (!radarP.tiene || radarP.buquesT <= 0) return;
  const a = Math.min(1, radarP.buquesT / 2);
  const late = Math.floor(performance.now() / 300) % 2 === 0;
  ctx.save();
  ctx.globalAlpha = a; ctx.lineJoin = 'round';
  for (const o of obstacles) {
    if (!buqueRadar(o, PZ)) continue;
    const s = proj(o.x, (o.y || 0) + (o.h || 4) + 1, o.z);
    if (!(s.k > 0)) continue;
    const x = Math.round(s.x), punta = Math.round(s.y - 2), e = R.ECO[o.type] || 0.8;
    flecha(x, punta, e);
    ctx.strokeStyle = AZ_BORDE; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = late ? AZ : '#3f8fe0'; ctx.fill();
  }
  ctx.restore();
}

/** LA FLECHITA de un contacto, apuntando abajo con la punta en (x, punta). `e` = el tamaño del eco
 *  (R.ECO): 1 es la del blanco final. Deja el trazo armado; quien llama la rellena. */
function flecha(x, punta, e) {
  const w = 5 * e, h = 9 * e, c = Math.max(1, 2 * e);   // c: medio ancho del tallo
  ctx.beginPath(); ctx.moveTo(x, punta); ctx.lineTo(x - w, punta - h * 0.55); ctx.lineTo(x - c, punta - h * 0.55);
  ctx.lineTo(x - c, punta - h); ctx.lineTo(x + c, punta - h); ctx.lineTo(x + c, punta - h * 0.55); ctx.lineTo(x + w, punta - h * 0.55); ctx.closePath();
}
