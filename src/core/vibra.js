// LA VIBRACION DEL MANDO (26/11, el autor: "que me vibre el joystick si tiene vibracion, cada vez que se escucha un
// trueno, o por turbulencia"). Gamepad API: `vibrationActuator.playEffect('dual-rumble')` (Chrome/Electron) o el viejo
// `hapticActuators[0].pulse`. Sin mando o sin motor, no hace nada. Un efecto mas fuerte pisa al que esta sonando; uno
// mas flojo espera a que termine (la turbulencia no corta el trueno).
let hasta = 0, fuerzaAhora = 0;
function pad() {
  if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
  const ps = [...navigator.getGamepads()].filter(g => g && g.connected);
  return ps.find(g => g.mapping === 'standard') || ps[0] || null;
}
/** `fuerte` (motor grande) y `debil` (el chico) 0..1, `ms` cuanto dura. */
export function vibrar(fuerte, debil, ms) {
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
