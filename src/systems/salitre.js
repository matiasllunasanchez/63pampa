// LA SAL EN EL PARABRISAS (17/11/2026, el autor: "cuanto mas tiempo el piloto se mantenga en rasante, el vidrio
// se va ensuciando"; SALITRE en data/tuning.js). El estado es un numero, `run.sal` (0 limpio … 1 tapado), que
// sube volando bajo sobre el agua y baja volando alto; lo dibuja render/salitre.js. Con el SILICONADO M-60
// (la carta) no se pega nada.
import { run } from '../core/run.js';
import { SALITRE, ALTO } from '../data/tuning.js';
import { plane, cfg } from '../core/state.js';

/** Un paso. `agua`: si debajo hay mar (sobre la pista o la tierra no salpica); `siliconado`: la carta. */
export function stepSalitre(dt, agua, siliconado) {
  const S = SALITRE, y = plane.y;
  let sal = run.sal || 0;
  if (siliconado) sal = 0;
  else if (agua && y < S.ALT[1]) sal += dt / S.LLENO_S * (y < S.ALT[0] ? 1 : (S.ALT[1] - y) / (S.ALT[1] - S.ALT[0]));
  // LA LAVA EL AGUA (19/11): la nube, rapido; la lluvia, de a poco. Subir sin nube no despega nada
  else if (Math.abs(y - ALTO.NUBES) < ALTO.ESPESOR) sal -= dt / S.NUBE_S;
  else if (cfg.rain > 0) sal -= dt / S.LIMPIA_S;
  // EL AGUA QUE CORRE POR EL VIDRIO (render/salitre.js drawLavado): entra mientras la nube lava sal, y se va
  // despacio cuando el vidrio quedo limpio o saliste de la nube
  const lava = !siliconado && (run.sal || 0) > 0.002 && Math.abs(y - ALTO.NUBES) < ALTO.ESPESOR;
  run.lavaK = Math.max(0, Math.min(1, (run.lavaK || 0) + (lava ? dt * 3 : -dt * 0.9)));
  run.sal = Math.max(0, Math.min(1, sal));
  // el cartel, una vez por mision (lo lee game.js: `run.salAviso` lo arma reset)
  if (!run.salAviso && run.sal >= S.AVISO) { run.salAviso = true; return 'aviso'; }
  return null;
}
// SONDA: `__sal(v)` fija la sal del vidrio (0..1), para mirarla sin volar dos minutos a ras
if (typeof window !== 'undefined') window.__sal = v => { run.sal = Math.max(0, Math.min(1, +v || 0)); run.salAviso = true; return run.sal; };
