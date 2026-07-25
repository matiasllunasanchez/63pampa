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
import { SPAWN_X, SHORE_X, shoreAt, SAND_W, AA_CD, ENEMY_HP,
         CLIFF_H0, CLIFF_H1, CLIFF_HW0, CLIFF_HW1, CLIFF_COAST_BAND } from '../data/tuning.js';

/** Vida inicial de un enemigo. `hpMax` queda fijo para que la barra pueda dibujar la fraccion
 *  (hp/hpMax); sin el, un enemigo tocado no se distingue de uno que nace con menos vida. */
const hpOf = type => ({ hp: ENEMY_HP[type], hpMax: ENEMY_HP[type] });

// ---------- MOVIMIENTO PROPIO (cfg.enemyMove) ----------
// La PERSONALIDAD del movimiento se sortea ACA, al nacer — cada bicho trae su amplitud y su
// ritmo — y el que la APLICA por frame es collision.js (donde ya viven la deriva de la bandada,
// la barcaza navegando y la bomba cayendo). La llave del menu apaga la aplicacion, no el sorteo:
// asi se puede prender y apagar en vivo sobre los mismos enemigos.
//
// Dos familias:
//   sway  = oscila alrededor de un ancla (xa): x = xa + sin(t·mvW + ph)·mvA
//   drive = velocidad constante con rebote en los bordes del carril (vehiculos, fragata)

/** Oscilante. `frac` = que fraccion de la poblacion se mueve (el resto queda quieto: la MEZCLA de
 *  moviles y estaticos es lo que confunde — si se mueven todos, el ojo predice el patron). */
const sway = (x, amp, w, frac) =>
  Math.random() < frac ? { xa: x, mvA: amp[0] + Math.random() * (amp[1] - amp[0]), mvW: w[0] + Math.random() * (w[1] - w[0]) } : { xa: x };

/** Rodante: arranca hacia cualquier lado. */
const drive = (v0, v1) => ({ vx: (Math.random() < 0.5 ? -1 : 1) * (v0 + Math.random() * (v1 - v0)) });

/** La personalidad por tipo. Los numeros estan elegidos contra el avion, que se mueve a ~40 u/s
 *  de lado: nada de esto es imposible de esquivar — es dificultad de LECTURA (ya no alcanza con
 *  mirar donde nacio el bicho), no de reflejos. */
function mov(type, x) {
  switch (type) {
    // globo de barrera: colgado del cable, el viento lo pasea despacio. TODOS se mueven (el
    // viento no elige), pero poco: el globo sigue siendo el enemigo "lento" del juego.
    case 'balloon': return sway(x, [1.8, 3.2], [0.35, 0.6], 1);
    // helicoptero: patrulla de lado a lado. SOLO ALGUNOS (55%) — la mezcla de moviles y
    // estaticos es pedida: que no se pueda asumir nada al verlo aparecer.
    case 'helo': return sway(x, [4, 8], [0.4, 0.75], 0.55);
    // caza de frente: teje SIEMPRE, y ademas busca tu carril (home, en u/s — collision.js
    // lo aplica sobre el ancla). Es el unico que te persigue: cierra rapido y encima corrige.
    case 'jet': return { ...sway(x, [2.5, 4.5], [0.8, 1.3], 1), home: 2.2 };
    // vehiculos: ruedan por su carril y rebotan en los bordes
    case 'radar': return drive(1.6, 3.2);
    case 'aatruck': return drive(1.4, 2.8);
    // el mastil es una FRAGATA: navega despacio. Es el que mas cambia el mapa de mar, donde
    // esquivar mastiles es la habilidad central — ahora el hueco elegido se corre.
    case 'mast': return drive(0.7, 1.5);
  }
}

/** Grupo de soldados corriendo. En COSTA son britanicos desembarcando: TODOS corren de derecha
 *  (la playa) a izquierda (tierra adentro), y un poco mas rapido. */
function squad(x, z, n, coast) {
  for (let i = 0; i < n; i++) soldiers.push({
    x: x + (Math.random() * 10 - 5), z: z + Math.random() * 22, ph: Math.random() * 6,
    // SIEMPRE hacia la IZQUIERDA: huyen del avion, que viene de frente. Con direccion al azar
    // algunos corrian hacia la camara y se leia como si cargaran contra el avion.
    dir: -1, v: coast ? 9 : 6,
  });
}

// carriles: las estructuras de tierra solo caen del lado de TIERRA de la costa; las barcazas,
// del lado del AGUA (pegadas a la playa, que es por donde entran). La orilla SERPENTEA, asi que
// se consulta shoreAt() a la profundidad de spawn (z=250) — la misma fuente que render y vuelo.
const spawnShore = () => shoreAt(run.dist + 250);
const landLane = () => { const sh = spawnShore(); return -SPAWN_X + Math.random() * Math.max(8, SPAWN_X + sh - SAND_W - 3); };
const waterLane = () => { const sh = spawnShore(); return sh + 3 + Math.random() * Math.max(4, SPAWN_X - sh - 3); };

/** ACANTILADO: una masa de roca que sale del terreno. Cada uno sale distinto — altura sorteada
 *  con sesgo a lo bajo, ancho inverso a la altura (mas alto = mas angosto) y un jitter encima,
 *  para que la linea de costa rocosa nunca se lea como una fila de bloques iguales.
 *  `seed` fija la forma quebrada de la cresta en el render (ver drawObstacle). */
function cliff(x) {
  const t = Math.random();
  const h = CLIFF_H0 + t * t * (CLIFF_H1 - CLIFF_H0);
  const hw = (CLIFF_HW1 - t * t * (CLIFF_HW1 - CLIFF_HW0)) * (0.8 + Math.random() * 0.5);
  obstacles.push({ type: 'cliff', x, h, hw, z: 250, done: false, ph: Math.random() * 6, seed: (Math.random() * 9999) | 0 });
}

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
    // farallon rocoso del lado de TIERRA (bien a la izquierda): el borde natural del desembarco
    if (r < 0.10) cliff(-SPAWN_X + Math.random() * CLIFF_COAST_BAND);
    else if (r < 0.20) {
      const x = landLane();
      obstacles.push({ type: 'tent', x, h: 3.4, y: 1.4, z: 250, ...hpOf('tent'), done: false, ph });
      squad(x - 3, 252, 2 + (Math.random() * 2 | 0), true);          // la carpa pare su patrulla
    }
    else if (r < 0.30) obstacles.push({ type: 'aa', x: landLane(), h: 4.4, y: 1.8, z: 250, ...hpOf('aa'), cd: 1.1 + Math.random() * AA_CD, done: false, ph });
    else if (r < 0.40) {
      const h = 7.5 + Math.random() * 4;
      // armed: tiene soldados adentro tirando al avion (rafaga corta, hay que esquivar)
      obstacles.push({ type: 'bldg', x: landLane(), h, y: h / 2, z: 250, ...hpOf('bldg'), armed: Math.random() < 0.6, shots: 2, cd: 0, done: false, ph });
    }
    else if (r < 0.50) {
      // barcaza NAVEGANDO: entra desde la derecha (mar adentro) hacia la playa; los soldados
      // salen recien cuando TOCA la costa (ver collision.js, que la encalla y pare el squad)
      obstacles.push({ type: 'lcu', x: waterLane() + 6, h: 4, y: 1.5, z: 250, ...hpOf('lcu'), sailing: true, done: false, ph });
    }
    // los arboles de la costa se reemplazaron por VEHICULOS: radar movil y camion antiaereo
    else if (r < 0.57) obstacles.push({ type: 'radar', x: landLane(), h: 5, y: 2, z: 250, ...hpOf('radar'), ...mov('radar'), done: false, ph });
    else if (r < 0.64) obstacles.push({ type: 'aatruck', x: landLane(), h: 4.6, y: 1.9, z: 250, ...hpOf('aatruck'), ...mov('aatruck'), cd: 1.3 + Math.random() * AA_CD, done: false, ph });
    // trinchera ARGENTINA (decorado, bien a la izquierda): tira contra los britanicos
    else if (r < 0.70) obstacles.push({ type: 'trench', x: -SPAWN_X + Math.random() * 8, z: 250, decor: true, cd: 0.8 + Math.random(), done: false, ph });
    else if (r < 0.76) obstacles.push({ type: 'birds', x: lane, y: 7 + Math.random() * 12, z: 250, bvx: (Math.random() - 0.5) * 6, white: Math.random() < 0.5, done: false, ph });
    else if (r < 0.85) obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
    else if (r < 0.93) obstacles.push({ type: 'helo', x: lane, y: 5 + Math.random() * 16, z: 250, ...hpOf('helo'), ...mov('helo', lane), done: false, ph });
    else if (r < 0.97) obstacles.push({ type: 'jet', x: lane, y: 5 + Math.random() * 15, z: 250, ...hpOf('jet'), ...mov('jet', lane), done: false, ph });
    else if (cfg.fuelOn) obstacles.push({ type: 'fuel', x: lane, y: 4 + Math.random() * 22, z: 250, done: false });
    else obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
    return;
  }

  if (cfg.terrain === 'land') {
    // TIERRA: infraestructura britanica ocupando la isla. La mezcla vive aca (y la de COSTA en su
    // propio bloque) para que sea facil configurar QUE aparece en cada terreno.
    // el relieve de la isla: roca aleatoria, indestructible, de altura y ancho variables
    if (r < 0.14) cliff(lane);
    else if (r < 0.28) obstacles.push({ type: 'tree', x: lane, h: 7 + Math.random() * 15, z: 250, done: false, ph });
    else if (r < 0.35) obstacles.push({ type: 'tower', x: lane, h: 16 + Math.random() * 9, z: 250, ...hpOf('tower'), done: false, ph });
    else if (r < 0.42) obstacles.push({ type: 'poles', x: lane, h: 9 + Math.random() * 3, z: 250, done: false, ph });
    else if (r < 0.48) obstacles.push({ type: 'flag', x: lane, h: 11 + Math.random() * 5, z: 250, ...hpOf('flag'), done: false, ph });
    else if (r < 0.55) { const h = 4.5 + Math.random() * 2; obstacles.push({ type: 'depot', x: lane, h, y: h / 2, z: 250, ...hpOf('depot'), done: false, ph }); }
    else if (r < 0.61) {                                            // campamento / antiaereo
      if (Math.random() < 0.5) {
        obstacles.push({ type: 'tent', x: lane, h: 3.4, y: 1.4, z: 250, ...hpOf('tent'), done: false, ph });
        squad(lane - 3, 252, 2, false);
      } else obstacles.push({ type: 'aa', x: lane, h: 4.4, y: 1.8, z: 250, ...hpOf('aa'), cd: 1.1 + Math.random() * AA_CD, done: false, ph });
    }
    else if (r < 0.66) obstacles.push({ type: 'birds', x: lane, y: 7 + Math.random() * 12, z: 250, bvx: (Math.random() - 0.5) * 6, white: Math.random() < 0.5, done: false, ph });
    else if (r < 0.75) obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
    else if (r < 0.84) obstacles.push({ type: 'helo', x: lane, y: 5 + Math.random() * 16, z: 250, ...hpOf('helo'), ...mov('helo', lane), done: false, ph });
    else if (r < 0.92) obstacles.push({ type: 'jet', x: lane, y: 5 + Math.random() * 15, z: 250, ...hpOf('jet'), ...mov('jet', lane), done: false, ph });
    else if (cfg.fuelOn) obstacles.push({ type: 'fuel', x: lane, y: 4 + Math.random() * 22, z: 250, done: false });
    else obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
    return;
  }

  // MAR ABIERTO: mastiles de fragata y trafico aereo
  if (r < 0.34) obstacles.push({ type: 'mast', x: lane, h: 11 + Math.random() * 17, z: 250, ...mov('mast'), done: false });
  else if (r < 0.48) obstacles.push({ type: 'birds', x: lane, y: 7 + Math.random() * 12, z: 250, bvx: (Math.random() - 0.5) * 6, white: Math.random() < 0.5, done: false, ph });
  else if (r < 0.60) obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
  else if (r < 0.70) obstacles.push({ type: 'helo', x: lane, y: 5 + Math.random() * 16, z: 250, ...hpOf('helo'), ...mov('helo', lane), done: false, ph });
  else if (r < 0.78) obstacles.push({ type: 'jet', x: lane, y: 5 + Math.random() * 15, z: 250, ...hpOf('jet'), ...mov('jet', lane), done: false, ph });
  else if (cfg.fuelOn) obstacles.push({ type: 'fuel', x: lane, y: 4 + Math.random() * 22, z: 250, done: false });
  else obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
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
