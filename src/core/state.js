// ESTADO COMPARTIDO: lo unico que varios sistemas escriben.
//
// Esto NO es una bolsa donde va todo. La regla que lo mantiene chico:
//   si una variable la escribe UN SOLO sistema, no entra aca — se queda con su sistema.
// Por eso `fireT`, `nextSpawn`, `windT`, `rollT` y compania no estan: tienen un dueño claro y
// viajan al modulo que los escribe cuando ese modulo se extrae.
//
// Hay dos formas distintas de compartir, y la diferencia es a proposito:
//
//   1. OBJETOS DE IDENTIDAD ESTABLE (cfg, cam, plane, stats) — se exportan directo y se importan
//      por nombre. Nunca se reasignan: se MUTAN. Eso es lo que los hace seguros de compartir
//      entre modulos, porque todos apuntan al mismo objeto para siempre. Reasignar `plane` en
//      vez de mutarlo dejaria a los demas modulos mirando un objeto viejo, y el bug seria mudo:
//      el juego seguiria andando, dibujando un avion que ya no es el que vuela. Por eso reset()
//      llama a resetPlane() en lugar de crear uno nuevo.
//
//   2. LA MAQUINA DE ESTADOS (`state`) — es un string, no un objeto, asi que no se puede
//      compartir por referencia. Vive como campo de `S`: se LEE con `S.state` y se ESCRIBE con
//      setState(). Tener un unico punto de escritura es lo que permite rastrear transiciones
//      raras; antes habia 22 asignaciones sueltas y no habia forma de saber quien las hacia.

/** Pantalla / fase activa del juego. Leer `S.state`; escribir con setState(). */
export const S = { state: 'modeselect' };

// Poner DEBUG_STATE=1 en la consola imprime cada transicion. Barato de dejar puesto y es la
// diferencia entre "se colgo en una pantalla" y saber exactamente desde donde llego.
export function setState(next) {
  if (globalThis.DEBUG_STATE && next !== S.state) console.log(`[state] ${S.state} → ${next}`);
  S.state = next;
  return next;
}

/** cfg = caracteristicas ACTIVAS del mapa (las lee el juego). Se editan en vivo con el menu [M]
 *  o se cargan desde un nivel de campaña. Base para prototipar niveles.
 *  fuelOn: el combustible es el RELOJ del run (mantener la secuencia agarrando bidones).
 *  Se puede apagar en el menu [M] (COMBUSTIBLE: NO) para pruebas / vuelo libre. */
export const cfg = {
  sky: 'dusk', water: 'sea', terrain: 'sea', wind: true,
  obstacles: 1, coast: 230, meters: 3000, fuelOn: true, energy: true,
};

/** Camara del mundo 2D. La comparten el render y el momentum. */
export const cam = { x: 0, y: 14 };

/** El avion. bank/pitch son estado VISUAL suavizado (animacion), no afectan el vuelo. */
export const plane = { x: 0, y: 1.2, vx: 0, vy: 0, bank: 0, pitch: 0 };

export function resetPlane() {
  plane.x = 0; plane.y = 1.2; plane.vx = 0; plane.vy = 0; plane.bank = 0; plane.pitch = 0;
}

/** ESTADISTICAS de la corrida: alimentan el recuento y las estrellas del fin de mision.
 *  Se ceran en reset() y se CONGELAN en freezeRun() dentro de lastRun (por valor), porque entre
 *  niveles de campaña se llama reset() y borraria los contadores. */
export const stats = {
  air: 0, soldiers: 0, zones: 0, shots: 0, hits: 0,
  grazes: 0, fuelPicks: 0, dodges: 0, bestRas: 0, reattacks: 0,
};

export function resetStats() {
  for (const k in stats) stats[k] = 0;
}
