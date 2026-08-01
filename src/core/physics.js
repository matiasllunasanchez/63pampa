// FISICA DE VUELO: la matematica de la SENSACION del juego.
//
// Todo lo de aca es PURO: entra un numero, sale un numero. Sin estado, sin canvas, sin DOM.
// Por eso se puede probar de verdad (tools/unit.js) y simular fuera del navegador
// (tools/feeltest.js) — que es como se ajustaron estos valores.
//
// Estas funciones estaban escritas DOS VECES: una en el juego y otra copiada en feeltest.js.
// El test podia dar verde mientras el juego hacia otra cosa. Ahora hay una sola version y el
// test la importa.
//
// Las constantes son las perillas: cambiarlas cambia como se SIENTE volar. Cada bloque explica
// que pasa si se suben o se bajan.

// ---------- CABECEO (visual) ----------
// La trompa se mueve solo si mantenes la tecla: los toques rapidos de gas no la sacuden.
//   DELAY = zona muerta antes de empezar a moverla
//   RAMP  = cuanto tarda en llegar al maximo
//   VY    = cuanto pesa la velocidad vertical REAL (bajo a proposito: con un peso alto, la
//           velocidad disparaba la animacion sola y estirar la zona muerta no servia de nada)
export const PITCH_DELAY = 0.30, PITCH_RAMP = 0.34, PITCH_VY = 0.05;
export const PITCH_LERP = 9;      // que tan rapido el angulo persigue al objetivo
export const PITCH_ROW = 0.33;    // umbral para cambiar de fila del sprite (trepa / nivel / pica)

/** Inclinacion buscada, entre -1 (picada) y +1 (trepada).
 *  @param vin  -1 abajo / 0 / +1 arriba (la tecla)
 *  @param hold segundos que se lleva mantenida esa tecla
 *  @param vy   velocidad vertical real del avion */
export function pitchTarget(vin, hold, vy) {
  const ramp = clamp01((hold - PITCH_DELAY) / PITCH_RAMP);
  return clamp(vin * 0.9 * ramp + (vy / 22) * PITCH_VY, -1, 1);
}

// ---------- ENERGIA: altura <-> velocidad ----------
// La altura es energia almacenada: picar la convierte en velocidad, trepar la gasta. Es lo que
// arma el pendulo (bajar rapido → rasar → trepar → repetir).
//   K    = cuanta velocidad da picar
//   DRAG = que tan rapido vuelve al objetivo. Es BAJO a proposito: con el arrastre original
//          (dt*3) lo que ganabas picando se evaporaba en medio segundo y no se acumulaba nada
//   MAX  = techo sobre el objetivo, para que picar premie sin romper el balance
export const ENERGY_K = 2.0, ENERGY_DRAG = 0.7, ENERGY_MAX = 1.55;
export const SPD_MIN = 34;

/** Velocidad del proximo frame con el intercambio de energia activo (cfg.energy). */
export function applyEnergy(spd, spdTarget, vy, dt) {
  let s = spd + (spdTarget - spd) * Math.min(1, dt * ENERGY_DRAG);
  s += (-vy) * ENERGY_K * dt;                        // vy<0 (picada) suma, vy>0 (trepada) resta
  return clamp(s, SPD_MIN, spdTarget * ENERGY_MAX);
}

/** Velocidad del proximo frame SIN intercambio de energia (el modelo clasico). */
export function applyDrag(spd, spdTarget, dt) {
  return spd + (spdTarget - spd) * Math.min(1, dt * 3);
}

// ---------- ROCE con la superficie ----------
// Tocar el agua o el suelo ya no mata al instante: el avion tambalea y tenes un margen para
// salir dando gas. Cuanto mas rapido vas, menos margen — a fondo con turbo es casi fatal.
export const SCRAPE_BASE = 0.85;    // segundos de gracia a baja velocidad
export const SCRAPE_MIN = 0.18;     // segundos de gracia a maxima velocidad
export const SCRAPE_RECOVER = 0.35; // que tan rapido se descuenta el reloj al salir
export const SCRAPE_LIFT = 0.8;     // altura a la que se sostiene mientras roza

/** Segundos que aguanta el avion rozando antes de estrellarse. */
export function scrapeLimit(spd, boost) {
  const sf = clamp01((spd - 90) / 190);   // 0 lento .. 1 a fondo
  return (SCRAPE_BASE - (SCRAPE_BASE - SCRAPE_MIN) * sf) * (boost ? 0.55 : 1);
}

// ---------- VELOCIDAD OBJETIVO ----------
// AFTERBURNER SOSTENIDO: aguantar turbo + rasante acumula tiempo; cada AFTER_STEP segundos sube
// un escalon (hasta AFTER_MAX). Cada escalon multiplica la velocidad y levanta el techo, para
// que el aumento se SIENTA. Soltar el turbo o trepar lo corta.
export const AFTER_STEP = 2, AFTER_MAX = 5, AFTER_GAIN = 0.16, AFTER_CAP = 42;

/** Velocidad a la que tiende el avion segun el estado del run. */
export function speedTarget({ t, rasLevel, mult, windF, boost, afterTier }) {
  const base = Math.min(150, 62 + t * 2.8);                 // sube sola con el tiempo de vuelo
  const racha = 1 + rasLevel * 0.12 + (mult >= 10 ? 0.10 : mult >= 5 ? 0.05 : 0);
  const after = 1 + afterTier * AFTER_GAIN;
  return Math.min(280 + afterTier * AFTER_CAP, base * racha * windF * (boost ? 1.5 : 1) * after);
}

/** Resistencia del viento en contra: cuanto mas tiempo arriba, mas frena (hasta -35%). */
export function windFactor(windT, windOn) {
  return windOn ? 1 - Math.min(0.35, Math.max(0, windT - 0.8) * 0.075) : 1;
}

// ---------- utilidades ----------
// ---------- CONTROL POR ALABEO (cfg.control = 1) ----------
// El esquema de siempre es DIRECTO: ←/→ empujan al avion de costado y el alabeo del sprite es una
// animacion que lo acompaña. Con ALABEO se invierte la causa: ←/→ ROLAN, y el desplazamiento
// lateral es la CONSECUENCIA de estar banqueado — que es como se mueve un avion de verdad.
//
// LO QUE TIENE QUE CAMBIAR es que EL BANQUEO SE SOSTIENE. En DIRECTO, soltar la flecha frena el
// desplazamiento en medio segundo. Aca no: quedas banqueado, y banqueado seguis virando — para
// cortar el viraje hay que CONTRA-ROLAR. Eso es todo el esquema, y es lo unico que lo hace sentir
// un avion y no un deslizador con otra formula adentro.
//
// LA PRIMERA VERSION DE ESTO NO SE NOTABA. Estaba con BANK_BACK = 4.5, el mismo numero con el que
// decae la deriva del control DIRECTO, "para no cambiar la dificultad": las alas se nivelaban solas
// en 0.2 s y soltar la flecha cortaba el viraje igual que siempre. Los dos esquemas median
// practicamente lo mismo porque le habiamos calibrado la diferencia hasta hacerla desaparecer.
// BANK_BACK ahora es BAJO a proposito: las alas vuelven solas, pero LENTO (~1.8 s), lo justo para
// perdonar al que se distrae sin regalarle el nivelado a quien esta volando.
//
// El TECHO lateral si se mantiene igual (~30) y eso no es cosmetico: es lo que garantiza que esto
// sea una opcion de manejo y no una de dificultad. Lo cuida un test.
//
// BANK_MAX es el alabeo pleno del sprite (60°, ver BANK_FULL en core/horizon.js): mas que eso y el
// dibujo no lo podria mostrar. BANK_TURN_V esta elegido para que a fondo (sin 60° = 0.87) el tope
// lateral quede en ~30.
export const BANK_RATE = 3.5;      // rad/s a fondo: nivel → alabeo pleno en ~0.30 s, y lo mismo para sacarlo
export const BANK_BACK = 1.5;      // sin tecla las alas vuelven SOLAS pero lento: contra-rolar es 3x mas rapido
export const BANK_MAX = Math.PI / 3;
export const BANK_TURN_V = 34.6;

/** Nuevo angulo de alabeo tras `dt`. `dir` = -1 / 0 / +1. */
export function bankStep(bankA, dir, dt) {
  const b = dir ? bankA + dir * BANK_RATE * dt : bankA - bankA * Math.min(1, dt * BANK_BACK);
  return clamp(b, -BANK_MAX, BANK_MAX);
}

/** Velocidad lateral que produce ese alabeo.
 *
 *  El SENO no es adorno: es la proyeccion del vector de sustentacion, la misma cuenta por la que
 *  un avion banqueado se va para el costado. Su efecto jugable es una saturacion SUAVE — medido en
 *  cuartos de banqueo, la velocidad sube 8.96, 8.34, 7.17, 5.50: el ultimo cuarto compra un 39%
 *  menos que el primero. Alcanza para que colgarse a fondo tenga un costo (nivelar despues tarda
 *  mas y no ganaste tanto), pero no tanto como para que el tope se sienta inalcanzable. A 60° el
 *  seno todavia va bastante derecho; la saturacion fuerte recien aparece cerca de los 90°. */
export const bankVx = bankA => Math.sin(bankA) * BANK_TURN_V;

export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function clamp01(v) { return clamp(v, 0, 1); }
