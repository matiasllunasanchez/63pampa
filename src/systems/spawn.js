// SPAWN: siembra el campo de juego por distancia recorrida.
//
// Dos poblaciones independientes: obstaculos (mastiles, globos, aeronaves, bidones) que emergen
// del horizonte, y grupos de soldados que corren (solo sobre tierra). Ambos nacen a z=250 y el
// resto del mundo los trae hacia la camara.
//
// Es el sistema mas limpio del motor: solo escribe los arrays del mundo y lee la corrida y el
// mapa. No dibuja, no suena, no decide transiciones.

import { cfg } from '../core/state.js';
import { run } from '../core/run.js';
import { obstacles, soldiers } from '../core/world.js';
import { SPAWN_X } from '../data/tuning.js';

/** Un obstaculo nuevo en el horizonte. El sorteo mezcla amenazas y bidones; sin combustible
 *  activo, los bidones se fuerzan menos (serian pickups inutiles) y su slot cae en globo. */
function spawn() {
  const lane = (Math.random() * SPAWN_X * 2 - SPAWN_X);   // acompaña a FLY_X (zona de vuelo)
  if (cfg.fuelOn && run.fuelDist > 700) { obstacles.push({ type: 'fuel', x: lane, y: 4 + Math.random() * 22, z: 250, done: false }); run.fuelDist = 0; return; }
  const r = Math.random();
  if (r < 0.34) obstacles.push({ type: 'mast', x: lane, h: 11 + Math.random() * 17, z: 250, done: false });
  else if (r < 0.60) obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, hp: 1, done: false, ph: Math.random() * 6 });
  else if (r < 0.70) obstacles.push({ type: 'helo', x: lane, y: 5 + Math.random() * 16, z: 250, hp: 2, done: false, ph: Math.random() * 6 });
  else if (r < 0.78) obstacles.push({ type: 'jet', x: lane, y: 5 + Math.random() * 15, z: 250, hp: 2, done: false, ph: Math.random() * 6 });
  else if (cfg.fuelOn) obstacles.push({ type: 'fuel', x: lane, y: 4 + Math.random() * 22, z: 250, done: false });
  else obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, hp: 1, done: false, ph: Math.random() * 6 });
}

/** Avanza los relojes de aparicion y siembra cuando toca. */
export function spawnSystem(dt) {
  // spawn por distancia
  run.nextSpawn -= run.spd * dt;
  if (cfg.obstacles > 0 && run.nextSpawn <= 0) {
    spawn();
    run.nextSpawn = Math.max(34, (52 + Math.random() * 42) - run.t * 0.8) / cfg.obstacles;
  }

  // spawn de soldados (solo sobre tierra) — en grupos que corren
  if (cfg.terrain === 'land') {
    run.nextSoldier -= run.spd * dt;
    if (run.nextSoldier <= 0) {
      const lane = Math.random() * 44 - 22, n = 2 + (Math.random() * 3 | 0);
      for (let i = 0; i < n; i++) soldiers.push({ x: lane + (Math.random() * 12 - 6), z: 250 + Math.random() * 24, ph: Math.random() * 6, dir: Math.random() < 0.5 ? -1 : 1 });
      run.nextSoldier = 40 + Math.random() * 55;
    }
  }
}
