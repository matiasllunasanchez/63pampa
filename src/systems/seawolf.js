// LA DEFENSA CERCANA DEL BUQUE — Sea Cat o Sea Wolf (data/defensas.js). Nacio como el del Sea Wolf
// (28/9) y los dos comparten el sistema: cambian los numeros y el dibujo.
//
// Un ciclo simple alrededor del buque, mientras el avion esta ADENTRO de su zona (SW_ALCANCE):
//   'fija'     el radar de seguimiento te engancha: SW_FIJA_T segundos de aviso (la linea del buque
//              al avion, la placa SEA WOLF titilando)
//   'salva'    salen SW_SALVA misiles, uno cada SW_SALVA_DT
//   'recarga'  SW_RECARGA segundos sin tirar: la ventana para entrar
// y vuelve a fijar. Fuera de la zona (lejos, o ya pasado el buque) no hace nada.
//
// El GUIADO de cada misil vive en systems/collision.js, con el resto de los misiles (tipo 'wolf').
// Aca solo se decide CUANDO salen. El estado es del modulo y se reinicia con la corrida y con el
// buque; lo que ve el render sale por `snapshot()` (convencion 4: el dibujo lee, no manda).
import { missiles } from '../core/world.js';
import { blanco } from '../core/blanco.js';
import { BL } from '../data/blanco.js';
import { SW_SALVA, SW_RECARGA, SW_ALTO } from '../data/tuning.js';
import { DEFENSAS } from '../data/defensas.js';

// LA DEFENSA DE ESTE BUQUE: 'cat' | 'wolf' | null (sin defensa cercana). La pone game.js al armar la
// corrida (`poner`), segun la mision.
let tipo = null, D = null;
export function poner(t) { tipo = DEFENSAS[t] ? t : null; D = tipo ? DEFENSAS[tipo] : null; }

let fase = 'fuera', t = 0, salen = 0, nId = 0;
// EL HUMO DEL LANZAMIENTO (28/9): cada disparo deja una bocanada en la cubierta. Se guarda la EDAD
// (segundos, con el dt del mundo) y de que lado del buque salio; el render la dibuja. Vive mas alla
// de la zona: el humo no se apaga porque te fuiste.
const HUMO_VIDA = 1.8;
const humos = [];

/** ¿El avion (a profundidad `pz`) esta adentro de la zona? El buque todavia adelante y a menos de
 *  SW_ALCANCE. */
export const enZona = pz => !!D && blanco.on && !blanco.hundido && blanco.z > pz && blanco.z - pz < D.alcance;

/** Un cuadro. `e` = { activo, pz, plane }. `activo` lo resuelve el orquestador: pasillo jugable, sin
 *  el negro ni la camara lenta del final de la suelta. Devuelve la señal del cuadro para el sonido:
 *  'fija' (te engancho) | 'tira' (salio un misil) | null. */
export function step(dt, e) {
  for (const h of humos) h.edad += dt;
  while (humos.length && humos[0].edad > HUMO_VIDA) humos.shift();
  if (!e.activo || !enZona(e.pz)) { fase = 'fuera'; t = 0; salen = 0; return null; }
  t += dt;
  if (fase === 'fuera') { fase = 'fija'; t = 0; return 'fija'; }
  if (fase === 'fija' && t >= D.fija) { fase = 'salva'; t = D.cada; salen = 0; }
  if (fase === 'salva' && t >= D.cada) {
    t = 0; salen++;
    // sale de la cubierta del buque, apenas corrido hacia el lado del avion
    const lado = Math.sign(e.plane.x - BL.X || 1) * 4;
    missiles.push({ tipo: 'wolf', def: tipo, id: ++nId, x: BL.X + lado, y: SW_ALTO, z: blanco.z,
      vx: 0, vy: 0, done: false });
    humos.push({ edad: 0, dx: lado, semilla: nId });
    if (salen >= SW_SALVA) { fase = 'recarga'; t = 0; }
    return 'tira';
  }
  if (fase === 'recarga' && t >= SW_RECARGA) { fase = 'fija'; t = 0; return 'fija'; }
  return null;
}

/** ¿Hay misiles Sea Wolf viniendo hacia vos? (los que ya son señuelo no cuentan) */
export const enElAire = () => missiles.some(m => m.tipo === 'wolf' && !m.done && !m.senuelo);

/** LO QUE VE EL RENDER Y EL HUD: la fase, cuanto va de ella (0..1) y si estas adentro. */
export function snapshot(pz) {
  const dentro = enZona(pz);
  const dur = !D ? 1 : fase === 'fija' ? D.fija : fase === 'recarga' ? SW_RECARGA : D.cada;
  return { tipo, nombre: D ? D.nombre : '', alcance: D ? D.alcance : 0, dentro, fase: dentro ? fase : 'fuera', u: Math.min(1, t / dur), bz: blanco.z, on: !!D && blanco.on && !blanco.hundido,
    humos: humos.map(h => ({ u: h.edad / HUMO_VIDA, dx: h.dx, s: h.semilla })) };
}

export function reset() { fase = 'fuera'; t = 0; salen = 0; humos.length = 0; }
