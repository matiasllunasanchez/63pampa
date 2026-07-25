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
export const S = { state: 'title' };   // arranca en la PORTADA; los modos vienen despues

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
import { PORT_H, AIR_START_Y } from '../data/runways.js';

export const cfg = {
  sky: 'dusk', water: 'sea', terrain: 'sea', wind: true,
  obstacles: 1, coast: 230, meters: 3000, fuelOn: true, energy: true,
  bombs: 1,   // BOMBARDEO: densidad de bombas cayendo (0=no, 0.5, 1, 2) — menu [M]
  mira: 6,   // mira elegida (1..9 de assets/miras.webp); se cambia en el menu [M] y persiste
  runway: 0,     // estilo de pista (indice en data/runways.js) — menu [M]
  cliff: false,  // la base esta sobre una meseta: se despega EN ALTURA y se sale al vacio
  // ARRANQUE. 'runway' = despegue clasico desde la base. 'air' = la mision empieza YA VOLANDO,
  // sin plataforma: son las misiones de REGRESO, donde el avion vuelve del ataque.
  start: 'runway',
  // ENEMIGOS MOVILES: los que hoy podian quedarse quietos se mueven — el globo cabecea colgado
  // del cable, el helicoptero patrulla de lado a lado, el caza teje y busca tu carril, los
  // vehiculos ruedan y la fragata del mastil navega. Apagarlo los deja plantados como antes.
  // (Lo que YA se movia — bandada, barcaza entrando, bombas — no depende de esta llave.)
  enemyMove: true,
  // DEPURACION: pinta las cajas de colision en verde fluor. Es para PROBAR — el overlay sale de
  // core/hitbox.js, la misma fuente que decide los choques, asi que lo que ves es lo que golpea.
  hitboxes: false,
  // MODO CAMARA (herramienta de desarrollo): el mundo NO avanza solo — avanza, retrocede y se
  // frena a decision del desarrollador, y la camara se mueve libre en x/altura. Para inspeccionar
  // mapas y encuadres sin que la partida se mueva sola.
  devcam: false,
};

/** Camara del mundo 2D. La comparten el render y el momentum. */
export const cam = { x: 0, y: 14 };

/** El avion. bank/pitch son estado VISUAL suavizado (animacion), no afectan el vuelo. */
export const plane = { x: 0, y: 1.2, vx: 0, vy: 0, bank: 0, pitch: 0 };

export function resetPlane() {
  // con ACANTILADO el avion ya nace sobre la meseta: no hay carrera de ascenso, se sale al vacio
  plane.x = 0; plane.y = cfg.start === 'air' ? AIR_START_Y : (cfg.cliff ? PORT_H : 0) + 1.2;
  plane.vx = 0; plane.vy = 0; plane.bank = 0; plane.pitch = 0;
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
