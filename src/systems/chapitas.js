// LAS CHAPITAS — el estado de la corrida (CHAPITAS en data/tuning.js; la cuenta en core/chapitas.js).
//
// Que hace cada cosa, en el orden en que el jugador la vive:
//   1. SOLTAR (G / L2 en el pasillo: el chaff iba EN EL FRENO AERODINAMICO, asi que soltarlo es abrir
//      el freno). Se gasta una carga, el avion pierde CHAPITAS.FRENO de velocidad (lo cobra game.js,
//      de un golpe: el vuelo la recupera solo, como despues de cualquier freno) y queda una NUBE de
//      aluminio en el aire, atras tuyo.
//   2. LOS MISILES DE RADAR que vienen por delante toman la nube (`m.cebo`, la misma cuenta que el
//      señuelo de los tanques en systems/collision.js) y revientan ahi, detras tuyo.
//   3. EL RADAR: si te estaban viendo al soltar y BAJAS DEL TECHO dentro de la ventana, se borran
//      todas las alarmas — la barra, las estrellas y la escalada de oleadas — y volves al sigilo.
//      Para el operador fue una explosion: tu eco se perdio en la mancha.
//
// `run.chapitas` (las que quedan) vive en el store porque lo leen el HUD, la ficha del relevo
// (systems/squad.js: cada avion trae las suyas) y las sondas. Lo demas es de aca.
import { run } from '../core/run.js';
import { missiles } from '../core/world.js';
import { CHAPITAS } from '../data/tuning.js';
import { tomaNube, nubeNueva, pasoNube, borraAlarmas } from '../core/chapitas.js';

let nubes = [];          // las nubes en el aire (marco del mundo: corren con run.spd)
let ventana = null;      // { desde, visto } desde el ultimo soltar; null si no hay nada que cerrar

/** Corrida nueva (o avion nuevo que despega): las cargas llenas, nada en el aire. */
export function reset(cargas = CHAPITAS.CARGAS) {
  run.chapitas = run.chapitasMax = cargas;
  run.chapitasOnda = 0;
  nubes = []; ventana = null;
}

/** Avion nuevo a los mandos (el relevo): trae SUS cargas. La nube del anterior sigue en el aire —
 *  ya esta soltada—, pero su ventana para esconderse era de el. */
export function ponerCargas(n) { run.chapitas = n; ventana = null; }

/** SOLTAR. `x, y, pz`: donde esta el avion. `visto`: si el radar te estaba viendo (la barra cargando,
 *  alguna estrella, o arriba del techo). Devuelve los misiles que tomo la nube, o null si no quedaban. */
export function soltar(x, y, pz, visto) {
  if (!(run.chapitas > 0)) return null;
  run.chapitas--;
  const n = nubeNueva(x, y, pz);
  // PARA EL DIBUJO: los TUBOS (CHAPITAS.TUBOS de 16 cm) que el cartucho escupe hacia atras en abanico,
  // girando, y las TIRAS de cada uno —repartidas entre los tubos— para cuando revienta
  n.tubos = Array.from({ length: CHAPITAS.TUBOS }, (_, j) => {
    const an = (j / CHAPITAS.TUBOS) * 6.283 + Math.random() * 0.6;
    return { vx: Math.cos(an) * (0.4 + Math.random() * 0.6), vy: Math.sin(an) * (0.3 + Math.random() * 0.5),
      vz: -(0.6 + Math.random() * 0.4), a: Math.random() * 6.283, w: (Math.random() - 0.5) * 30 };
  });
  n.tiras = Array.from({ length: CHAPITAS.TIRAS_TUBO * CHAPITAS.TUBOS }, (_, i) => ({ tubo: i % CHAPITAS.TUBOS, dx: (Math.random() - 0.5) * 2.4,
    dy: (Math.random() - 0.5) * 1.6, dz: (Math.random() - 0.5) * 2.4, a: Math.random() * 6.283,
    w: (Math.random() - 0.5) * 9, cae: 0.6 + Math.random() * 1.4 }));
  nubes.push(n);
  run.chapitasOnda = 1;
  ventana = { desde: 0, visto: !!visto };
  const tomados = [];
  for (const m of missiles) if (tomaNube(m, pz)) { m.cebo = n; tomados.push(m); }
  return tomados;
}

/** UN CUADRO. `bajoTecho`: el avion esta debajo del radar. Devuelve 'sigilo' el cuadro en que el
 *  soltar mas el bajar borran las alarmas (quien lo anuncia y borra es el orquestador). */
export function step(dt, spd, bajoTecho) {
  run.chapitasOnda = Math.max(0, run.chapitasOnda - dt / CHAPITAS.VIDA);
  // (se MUTA la misma nube y no se reemplaza: los misiles la tienen agarrada como `m.cebo`)
  for (const n of nubes) Object.assign(n, pasoNube(n, dt, spd));
  // la nube que se apaga deja de ser blanco: el misil que la seguia ya te perdio igual (collision.js
  // lo trata como el tanque hundido — pasa de largo)
  for (const n of nubes) if (n.vida <= 0 && n.z < 9999) n.z = 9999;
  nubes = nubes.filter(n => n.z < 9999);
  if (!ventana) return null;
  ventana.desde += dt;
  if (borraAlarmas({ vistoAlSoltar: ventana.visto, bajoTecho, desde: ventana.desde })) { ventana = null; return 'sigilo'; }
  if (ventana.desde > CHAPITAS.VENTANA) ventana = null;
  return null;
}

/** Lo que dibuja el mundo: las tiras. (La mancha del radar la lee el HUD de `run.chapitasOnda`.) */
export const nubesEnElAire = () => nubes;
/** La ventana para esconderse esta abierta (te vieron, soltaste, y todavia podes bajar). */
export const ventanaAbierta = () => !!(ventana && ventana.visto);

/** Foto para la sonda `__chapitas`. */
export const snapshot = () => ({ quedan: run.chapitas, nubes: nubes.length,
  ventana: ventana ? +ventana.desde.toFixed(2) : null, visto: ventana ? ventana.visto : null, onda: +run.chapitasOnda.toFixed(2) });
