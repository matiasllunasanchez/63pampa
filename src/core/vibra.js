// LA VIBRACION DEL MANDO (26/11, el autor: "que me vibre el joystick si tiene vibracion, cada vez que se escucha un
// trueno, o por turbulencia"). Gamepad API: `vibrationActuator.playEffect('dual-rumble')` (Chrome/Electron) o el viejo
// `hapticActuators[0].pulse`. Sin mando o sin motor, no hace nada. Un efecto mas fuerte pisa al que esta sonando; uno
// mas flojo espera a que termine (la turbulencia no corta el trueno).
import { cfg } from './state.js';
import { HAPTICA as HA } from '../data/tuning.js';
let hasta = 0, fuerzaAhora = 0;
function pad() {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
  const ps = [...navigator.getGamepads()].filter(g => g && g.connected);
  return ps.find(g => g.mapping === 'standard') || ps[0] || null;
}
/** `fuerte` (motor grande) y `debil` (el chico) 0..1, `ms` cuanto dura. */
export function vibrar(fuerte, debil, ms) {
  // OPCIONES -> VIBRACION: SI, SUAVE (la mitad) o NO
  const esc = cfg.vibra == null ? 1 : cfg.vibra;
  if (esc <= 0) return false;
  fuerte *= esc; debil *= esc;
  const ahora = typeof performance !== 'undefined' ? performance.now() : 0;
  const f = Math.max(fuerte, debil);
  if (ahora < hasta && f <= fuerzaAhora) return false;
  const gp = pad();
  if (!gp) return false;
  try {
    const va = gp.vibrationActuator;
    if (va && va.playEffect) va.playEffect('dual-rumble', { startDelay: 0, duration: ms, strongMagnitude: Math.min(1, fuerte), weakMagnitude: Math.min(1, debil) }).catch(() => {});
    else if (gp.hapticActuators && gp.hapticActuators[0]) gp.hapticActuators[0].pulse(f, ms);
    else return false;
  } catch (e) { return false; }
  hasta = ahora + ms; fuerzaAhora = f;
  return true;
}


// ---------- LAS VARIANTES (26/11, el autor: "usemos todo lo que sea posible") — los numeros en data/tuning.js HAPTICA ----------
const ahoraS = () => (typeof performance !== 'undefined' ? performance.now() / 1000 : 0);
const efecto = e => vibrar(e[0], e[1], e[2]);
const mezcla = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** Una secuencia de efectos, uno detras del otro (cada uno arranca cuando termina el anterior). */
function secuencia(lista) {
  let t = 0;
  for (const e of lista) { const ee = e; setTimeout(() => { hasta = 0; efecto(ee); }, t); t += ee[2] + 10; }
}
/** Cada cosa que se suelta: 'bomba' | 'tanques' | 'exocet' | 'misil' | 'chafitas' | 'humo'. */
export function vibraSuelta(que) { const e = HA.SUELTA[que] || HA.SUELTA.bomba; hasta = 0; efecto(e); }
/** Una bala que pega en la chapa. */
export function vibraBala() { efecto(HA.BALA); }
/** Un golpe que saca chapa: `k` 0..1, cuanto saco. */
export function vibraDano(k) { hasta = 0; efecto(mezcla(HA.DANO.MIN, HA.DANO.MAX, Math.max(0, Math.min(1, k)))); }
/** El derribo: el golpe, el rebote (y el panzazo si fue en el agua) y lo que se apaga. */
export function vibraChoque(agua) { secuencia(agua ? [HA.CHOQUE[0], HA.CHOQUE_AGUA, ...HA.CHOQUE.slice(1)] : HA.CHOQUE); }
/** Cada tiro del cañon, apenitas (no mas seguido que CANON_CADA, y nunca pisa algo que este sonando). */
let canonT = 0;
export function vibraCanon() { const t = ahoraS(); if (t - canonT < HA.CANON_CADA) return; canonT = t; efecto(HA.CANON); }
/** EL AGUA, cada cuadro: `alto` m sobre el agua, `roce` 0..1 (lo gastado del margen) o -1 si no esta tocando. */
let aguaT = 0;
export function vibraAgua(alto, roce) {
  const t = ahoraS();
  if (roce >= 0) {
    if (t - aguaT < HA.ROCE.CADA) return;
    aguaT = t; hasta = 0; efecto(mezcla(HA.ROCE.MIN, HA.ROCE.MAX, Math.max(0, Math.min(1, roce))));
  } else if (alto < HA.CERCA.M) {
    if (t - aguaT < HA.CERCA.CADA) return;
    aguaT = t;
    const k = 1 - Math.max(0, alto) / HA.CERCA.M;
    vibrar(0, HA.CERCA.DEBIL[0] + (HA.CERCA.DEBIL[1] - HA.CERCA.DEBIL[0]) * k, HA.CERCA.CADA * 1000 + 20);
  }
}
