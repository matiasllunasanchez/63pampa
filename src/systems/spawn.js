// SPAWN: siembra el campo de juego por distancia recorrida.
//
// Dos poblaciones independientes: obstaculos (mastiles, globos, aeronaves, bidones, y en COSTA
// las estructuras del desembarco) que emergen del horizonte, y grupos de soldados que corren
// (terrenos con tierra). Ambos nacen a z=250 y el resto del mundo los trae hacia la camara.
//
// Es el sistema mas limpio del motor: solo escribe los arrays del mundo y lee la corrida y el
// mapa. No dibuja, no suena, no decide transiciones.

import { cfg } from '../core/state.js';
import { run } from '../core/run.js';
import { obstacles, soldiers } from '../core/world.js';
import { SPAWN_X, SHORE_X, shoreAt, SAND_W, AA_CD, ENEMY_HP } from '../data/tuning.js';

/** Vida inicial de un enemigo. `hpMax` queda fijo para que la barra pueda dibujar la fraccion
 *  (hp/hpMax); sin el, un enemigo tocado no se distingue de uno que nace con menos vida. */
const hpOf = type => ({ hp: ENEMY_HP[type], hpMax: ENEMY_HP[type] });

/** Grupo de soldados corriendo. En COSTA son britanicos desembarcando: TODOS corren de derecha
 *  (la playa) a izquierda (tierra adentro), y un poco mas rapido. */
function squad(x, z, n, coast) {
  for (let i = 0; i < n; i++) soldiers.push({
    x: x + (Math.random() * 10 - 5), z: z + Math.random() * 22, ph: Math.random() * 6,
    dir: coast ? -1 : (Math.random() < 0.5 ? -1 : 1), v: coast ? 9 : 6,
  });
}

// carriles: las estructuras de tierra solo caen del lado de TIERRA de la costa; las barcazas,
// del lado del AGUA (pegadas a la playa, que es por donde entran). La orilla SERPENTEA, asi que
// se consulta shoreAt() a la profundidad de spawn (z=250) — la misma fuente que render y vuelo.
const spawnShore = () => shoreAt(run.dist + 250);
const landLane = () => { const sh = spawnShore(); return -SPAWN_X + Math.random() * Math.max(8, SPAWN_X + sh - SAND_W - 3); };
const waterLane = () => { const sh = spawnShore(); return sh + 3 + Math.random() * Math.max(4, SPAWN_X - sh - 3); };

/** Un obstaculo nuevo en el horizonte. El sorteo mezcla amenazas y bidones; sin combustible
 *  activo, los bidones se fuerzan menos (serian pickups inutiles) y su slot cae en globo. */
function spawn() {
  const lane = (Math.random() * SPAWN_X * 2 - SPAWN_X);   // acompaña a FLY_X (zona de vuelo)
  if (cfg.fuelOn && run.fuelDist > 700) { obstacles.push({ type: 'fuel', x: lane, y: 4 + Math.random() * 22, z: 250, done: false }); run.fuelDist = 0; return; }
  const r = Math.random();
  const ph = Math.random() * 6;

  if (cfg.terrain === 'coast') {
    // COSTA: el desembarco. Mucho mas denso que los otros mapas (ver spawnSystem) y con las
    // estructuras britanicas en tierra: carpas (paren soldados), antiaereos (disparan misiles),
    // puestos (algunos con soldados adentro tirando) y barcazas entrando por el agua.
    if (r < 0.12) {
      const x = landLane();
      obstacles.push({ type: 'tent', x, h: 3.4, y: 1.4, z: 250, ...hpOf('tent'), done: false, ph });
      squad(x - 3, 252, 2 + (Math.random() * 2 | 0), true);          // la carpa pare su patrulla
    }
    else if (r < 0.24) obstacles.push({ type: 'aa', x: landLane(), h: 4.4, y: 1.8, z: 250, ...hpOf('aa'), cd: 1.1 + Math.random() * AA_CD, done: false, ph });
    else if (r < 0.36) {
      const h = 7.5 + Math.random() * 4;
      // armed: tiene soldados adentro tirando al avion (rafaga corta, hay que esquivar)
      obstacles.push({ type: 'bldg', x: landLane(), h, y: h / 2, z: 250, ...hpOf('bldg'), armed: Math.random() < 0.6, shots: 2, cd: 0, done: false, ph });
    }
    else if (r < 0.48) {
      // barcaza NAVEGANDO: entra desde la derecha (mar adentro) hacia la playa; los soldados
      // salen recien cuando TOCA la costa (ver collision.js, que la encalla y pare el squad)
      obstacles.push({ type: 'lcu', x: waterLane() + 6, h: 4, y: 1.5, z: 250, ...hpOf('lcu'), sailing: true, done: false, ph });
    }
    // los arboles de la costa se reemplazaron por VEHICULOS: radar movil y camion antiaereo
    else if (r < 0.56) obstacles.push({ type: 'radar', x: landLane(), h: 5, y: 2, z: 250, ...hpOf('radar'), done: false, ph });
    else if (r < 0.64) obstacles.push({ type: 'aatruck', x: landLane(), h: 4.6, y: 1.9, z: 250, ...hpOf('aatruck'), cd: 1.3 + Math.random() * AA_CD, done: false, ph });
    // trinchera ARGENTINA (decorado, bien a la izquierda): tira contra los britanicos
    else if (r < 0.70) obstacles.push({ type: 'trench', x: -SPAWN_X + Math.random() * 8, z: 250, decor: true, cd: 0.8 + Math.random(), done: false, ph });
    else if (r < 0.76) obstacles.push({ type: 'birds', x: lane, y: 7 + Math.random() * 12, z: 250, bvx: (Math.random() - 0.5) * 6, done: false, ph });
    else if (r < 0.85) obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, ...hpOf('balloon'), done: false, ph });
    else if (r < 0.93) obstacles.push({ type: 'helo', x: lane, y: 5 + Math.random() * 16, z: 250, ...hpOf('helo'), done: false, ph });
    else if (r < 0.97) obstacles.push({ type: 'jet', x: lane, y: 5 + Math.random() * 15, z: 250, ...hpOf('jet'), done: false, ph });
    else if (cfg.fuelOn) obstacles.push({ type: 'fuel', x: lane, y: 4 + Math.random() * 22, z: 250, done: false });
    else obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, ...hpOf('balloon'), done: false, ph });
    return;
  }

  // obstáculo vertical fijo: en el MAR es un mástil de fragata; en TIERRA, un árbol. El árbol
  // sale con altura y ubicación aleatorias (el `lane` ya lo dispersa en x) para que el vuelo
  // rasante tenga que esquivar a distintas alturas.
  if (r < 0.34) {
    if (cfg.terrain === 'land') obstacles.push({ type: 'tree', x: lane, h: 7 + Math.random() * 15, z: 250, done: false, ph });
    else obstacles.push({ type: 'mast', x: lane, h: 11 + Math.random() * 17, z: 250, done: false });
  }
  // TIERRA tambien recibe parte del desembarco (replicado de COSTA): carpas y antiaereos sueltos
  else if (r < 0.42 && cfg.terrain === 'land') {
    if (Math.random() < 0.5) {
      const x = lane;
      obstacles.push({ type: 'tent', x, h: 3.4, y: 1.4, z: 250, ...hpOf('tent'), done: false, ph });
      squad(x - 3, 252, 2, false);
    } else obstacles.push({ type: 'aa', x: lane, h: 4.4, y: 1.8, z: 250, ...hpOf('aa'), cd: 1.1 + Math.random() * AA_CD, done: false, ph });
  }
  else if (r < 0.48) obstacles.push({ type: 'birds', x: lane, y: 7 + Math.random() * 12, z: 250, bvx: (Math.random() - 0.5) * 6, done: false, ph });
  else if (r < 0.60) obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, ...hpOf('balloon'), done: false, ph });
  else if (r < 0.70) obstacles.push({ type: 'helo', x: lane, y: 5 + Math.random() * 16, z: 250, ...hpOf('helo'), done: false, ph });
  else if (r < 0.78) obstacles.push({ type: 'jet', x: lane, y: 5 + Math.random() * 15, z: 250, ...hpOf('jet'), done: false, ph });
  else if (cfg.fuelOn) obstacles.push({ type: 'fuel', x: lane, y: 4 + Math.random() * 22, z: 250, done: false });
  else obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, ...hpOf('balloon'), done: false, ph });
}

/** Avanza los relojes de aparicion y siembra cuando toca. */
export function spawnSystem(dt) {
  // spawn por distancia. En COSTA el campo es mas denso ("hay un desembarco en marcha"): el
  // intervalo se acorta un 35%.
  run.nextSpawn -= run.spd * dt;
  if (cfg.obstacles > 0 && run.nextSpawn <= 0) {
    spawn();
    const dens = cfg.terrain === 'coast' ? 0.65 : 1;
    run.nextSpawn = Math.max(34, (52 + Math.random() * 42) - run.t * 0.8) * dens / cfg.obstacles;
  }

  // BOMBARDEO (cualquier mapa, cfg.bombs lo regula desde el menu [M]): bombas que caen del
  // cielo. Chocarlas en el aire mata; al tocar el suelo levantan un HONGO que es un obstaculo
  // mas — meterse en la nube daña (sacude, frena, quema combustible) pero no derriba.
  if (cfg.bombs > 0) {
    run.nextBomb -= run.spd * dt;
    if (run.nextBomb <= 0) {
      obstacles.push({
        type: 'bomb', x: Math.random() * SPAWN_X * 2 - SPAWN_X, y: 55 + Math.random() * 20,
        z: 130 + Math.random() * 90, vy: 24 + Math.random() * 9, done: false, ph: Math.random() * 6,
      });
      run.nextBomb = (180 + Math.random() * 150) / cfg.bombs;
    }
  }

  // spawn de soldados (terrenos con tierra) — en grupos que corren
  if (cfg.terrain === 'land' || cfg.terrain === 'coast') {
    const coast = cfg.terrain === 'coast';
    run.nextSoldier -= run.spd * dt;
    if (run.nextSoldier <= 0) {
      // en COSTA nacen cerca de la playa y corren hacia la izquierda (tierra adentro)
      const lane = coast ? shoreAt(run.dist + 250) - SAND_W - 2 - Math.random() * 8 : Math.random() * 44 - 22;
      squad(lane, 250, 2 + (Math.random() * 3 | 0), coast);
      run.nextSoldier = coast ? 26 + Math.random() * 34 : 40 + Math.random() * 55;
    }
  }
}
