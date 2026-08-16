// SPAWN: siembra el campo de juego por distancia recorrida.
//
// Dos poblaciones independientes: obstaculos (mastiles, globos, aeronaves, bidones, y en COSTA
// las estructuras del desembarco) que emergen del horizonte, y grupos de soldados que corren
// (terrenos con tierra). Ambos nacen a SPAWN_Z (data/tuning.js) y el mundo los trae hacia la camara.
//
// Es el sistema mas limpio del motor: solo escribe los arrays del mundo y lee la corrida y el
// mapa. No dibuja, no suena, no decide transiciones.

import { cfg } from '../core/state.js';
import { run } from '../core/run.js';
import { obstacles, soldiers } from '../core/world.js';
import { OLA_H, OLA_RATE, OLA_GAP_MIN, OLA_H_VAR, OLA_WZ, OLA_WZ_VAR } from '../data/tuning.js';
import { inBank } from './fog.js';
import { plane } from '../core/state.js';
import { scrapeLimit } from '../core/physics.js';
import { olaBump, climaDe } from '../core/sea.js';
import { proj } from '../core/fx.js';
import { SPAWN_X, SPAWN_DENS, SPAWN_Z, SHORE_X, shoreAt, SAND_W, AA_CD, ENEMY_HP, spawnY, SHIP_H,
         CLIFF_H0, CLIFF_H1, CLIFF_HW0, CLIFF_HW1, CLIFF_COAST_BAND, VEIL_STOP } from '../data/tuning.js';

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
    // ALGUNOS (45%) vienen ARMADOS: tiran una rafaga corta de trazadoras en su pasada
    // (gun = tiros que le quedan; el gatillo vive en collision.js).
    case 'jet': return { ...sway(x, [2.5, 4.5], [0.8, 1.3], 1), home: 2.2,
      ...(Math.random() < 0.45 ? { gun: 2, gcd: 0.2 } : {}) };
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
// se consulta shoreAt() a la profundidad de spawn (SPAWN_Z) — la misma fuente que render y vuelo.
const spawnShore = () => shoreAt(run.dist + SPAWN_Z);
const landLane = () => { const sh = spawnShore(); return -SPAWN_X + Math.random() * Math.max(8, SPAWN_X + sh - SAND_W - 3); };
// SONDA de calibracion (QUITAR con el resto): cuantas veces se sorteo en la rama de agua y cuantas
// salio ola. Es lo unico que permite elegir OLA_RATE con un numero en vez de a ojo.
let sondaSpawns = 0, sondaOlas = 0;

/** ¿Se puede sembrar una ola AHORA? Tres candados, y los tres son de justicia:
 *   · nunca dos juntas (OLA_GAP_MIN) — el mar no es un peine
 *   · maximo dos vivas (§6.4) — con tres, esquivar deja de ser una decision y pasa a ser suerte
 *   · JAMAS dentro del banco de niebla (§6.3): ahi ya se juega a otra cosa y una ola invisible es
 *     una muerte injusta. Es la regla "no matar sin telegrafo", aplicada.
 */
function olaOk() {
  if (inBank()) return false;
  let n = 0;
  for (const o of obstacles) {
    if (o.type !== 'ola') continue;
    if (++n >= 2) return false;
    if (Math.abs(o.z - SPAWN_Z) < OLA_GAP_MIN) return false;
  }
  return true;
}

/** Siembra una ola. `kind` decide altura; la MAREJADA es de ancho completo y la mitad de las
 *  veces trae BRECHA — un hueco por el que se puede pasar sin saltar, para que la respuesta no
 *  sea siempre la misma tecla. */
export function spawnOla(kind, hFijo) {
  // ALTURA SORTEADA CON SESGO (ver OLA_H_VAR): t al cuadrado tira el reparto hacia abajo, asi que
  // lo normal es una ola modesta y de vez en cuando viene una que hay que tomarse en serio.
  const t = Math.random();
  const v = OLA_H_VAR[kind] || OLA_H_VAR.marejada;
  const f = v.lo + t * t * (v.hi - v.lo);
  const h = hFijo || OLA_H[kind] * f;
  const o = {
    type: 'ola', kind, h, x: 0, z: SPAWN_Z, done: false, ph: Math.random() * 6,
    // el espesor acompaña a la altura por la RAIZ del factor: crece, pero menos que la altura —
    // una ola el doble de alta no es el doble de larga
    wz: OLA_WZ * (1 + (h / OLA_H[kind] - 1) * OLA_WZ_VAR),
  };
  if (kind === 'marejada' && Math.random() < 0.5) {
    o.gapX = (Math.random() * SPAWN_X * 2 - SPAWN_X);
    o.gapW = 9;
  }
  obstacles.push(o);
  return o;
}

const waterLane = () => { const sh = spawnShore(); return sh + 3 + Math.random() * Math.max(4, SPAWN_X - sh - 3); };

/** ACANTILADO: una masa de roca que sale del terreno. Cada uno sale distinto — altura sorteada
 *  con sesgo a lo bajo, ancho inverso a la altura (mas alto = mas angosto) y un jitter encima,
 *  para que la linea de costa rocosa nunca se lea como una fila de bloques iguales.
 *  `seed` fija la forma quebrada de la cresta en el render (ver drawObstacle). */
function cliff(x) {
  const t = Math.random();
  const h = CLIFF_H0 + t * t * (CLIFF_H1 - CLIFF_H0);
  const hw = (CLIFF_HW1 - t * t * (CLIFF_HW1 - CLIFF_HW0)) * (0.8 + Math.random() * 0.5);
  obstacles.push({ type: 'cliff', x, h, hw, z: SPAWN_Z, done: false, ph: Math.random() * 6, seed: (Math.random() * 9999) | 0 });
}

/** Un obstaculo nuevo en el horizonte. El sorteo mezcla amenazas y bidones; sin combustible
 *  activo, los bidones se fuerzan menos (serian pickups inutiles) y su slot cae en globo. */
function spawn() {
  const lane = (Math.random() * SPAWN_X * 2 - SPAWN_X);   // acompaña a FLY_X (zona de vuelo)
  if (cfg.fuelOn && run.fuelDist > 700) { obstacles.push({ type: 'fuel', x: lane, y: spawnY('fuel'), z: SPAWN_Z, done: false }); run.fuelDist = 0; return; }
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
      obstacles.push({ type: 'tent', x, h: 3.4, y: 1.4, z: SPAWN_Z, ...hpOf('tent'), done: false, ph });
      squad(x - 3, SPAWN_Z + 2, 2 + (Math.random() * 2 | 0), true);          // la carpa pare su patrulla
    }
    else if (r < 0.30) obstacles.push({ type: 'aa', x: landLane(), h: 4.4, y: 1.8, z: SPAWN_Z, ...hpOf('aa'), cd: 1.1 + Math.random() * AA_CD, done: false, ph });
    else if (r < 0.40) {
      const h = 7.5 + Math.random() * 4;
      // armed: tiene soldados adentro tirando al avion (rafaga corta, hay que esquivar)
      obstacles.push({ type: 'bldg', x: landLane(), h, y: h / 2, z: SPAWN_Z, ...hpOf('bldg'), armed: Math.random() < 0.6, shots: 2, cd: 0, done: false, ph });
    }
    else if (r < 0.50) {
      // barcaza NAVEGANDO: entra desde la derecha (mar adentro) hacia la playa; los soldados
      // salen recien cuando TOCA la costa (ver collision.js, que la encalla y pare el squad)
      obstacles.push({ type: 'lcu', x: waterLane() + 6, h: 4, y: 1.5, z: SPAWN_Z, ...hpOf('lcu'), sailing: true, done: false, ph });
    }
    // los arboles de la costa se reemplazaron por VEHICULOS: radar movil y camion antiaereo
    else if (r < 0.57) obstacles.push({ type: 'radar', x: landLane(), h: 5, y: 2, z: SPAWN_Z, ...hpOf('radar'), ...mov('radar'), done: false, ph });
    else if (r < 0.64) obstacles.push({ type: 'aatruck', x: landLane(), h: 4.6, y: 1.9, z: SPAWN_Z, ...hpOf('aatruck'), ...mov('aatruck'), cd: 1.3 + Math.random() * AA_CD, done: false, ph });
    // trinchera ARGENTINA (decorado, bien a la izquierda): tira contra los britanicos
    else if (r < 0.70) obstacles.push({ type: 'trench', x: -SPAWN_X + Math.random() * 8, z: SPAWN_Z, decor: true, cd: 0.8 + Math.random(), done: false, ph });
    else if (r < 0.76) obstacles.push({ type: 'birds', x: lane, y: spawnY('birds'), z: SPAWN_Z, bvx: (Math.random() - 0.5) * 6, white: Math.random() < 0.5, done: false, ph });
    else if (r < 0.85) obstacles.push({ type: 'balloon', x: lane, y: spawnY('balloon'), z: SPAWN_Z, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
    else if (r < 0.93) obstacles.push({ type: 'helo', x: lane, y: spawnY('helo'), z: SPAWN_Z, ...hpOf('helo'), ...mov('helo', lane), done: false, ph });
    else if (r < 0.97) obstacles.push({ type: 'jet', x: lane, y: spawnY('jet'), z: SPAWN_Z, ...hpOf('jet'), ...mov('jet', lane), done: false, ph });
    else if (cfg.fuelOn) obstacles.push({ type: 'fuel', x: lane, y: spawnY('fuel'), z: SPAWN_Z, done: false });
    else obstacles.push({ type: 'balloon', x: lane, y: spawnY('balloon'), z: SPAWN_Z, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
    return;
  }

  if (cfg.terrain === 'land') {
    // TIERRA: infraestructura britanica ocupando la isla. La mezcla vive aca (y la de COSTA en su
    // propio bloque) para que sea facil configurar QUE aparece en cada terreno.
    // el relieve de la isla: roca aleatoria, indestructible, de altura y ancho variables
    if (r < 0.14) cliff(lane);
    else if (r < 0.28) obstacles.push({ type: 'tree', x: lane, h: 7 + Math.random() * 15, z: SPAWN_Z, done: false, ph });
    else if (r < 0.35) obstacles.push({ type: 'tower', x: lane, h: 16 + Math.random() * 9, z: SPAWN_Z, ...hpOf('tower'), done: false, ph });
    else if (r < 0.42) obstacles.push({ type: 'poles', x: lane, h: 9 + Math.random() * 3, z: SPAWN_Z, done: false, ph });
    else if (r < 0.48) obstacles.push({ type: 'flag', x: lane, h: 11 + Math.random() * 5, z: SPAWN_Z, ...hpOf('flag'), done: false, ph });
    else if (r < 0.55) { const h = 4.5 + Math.random() * 2; obstacles.push({ type: 'depot', x: lane, h, y: h / 2, z: SPAWN_Z, ...hpOf('depot'), done: false, ph }); }
    else if (r < 0.61) {                                            // campamento / antiaereo
      if (Math.random() < 0.5) {
        obstacles.push({ type: 'tent', x: lane, h: 3.4, y: 1.4, z: SPAWN_Z, ...hpOf('tent'), done: false, ph });
        squad(lane - 3, SPAWN_Z + 2, 2, false);
      } else obstacles.push({ type: 'aa', x: lane, h: 4.4, y: 1.8, z: SPAWN_Z, ...hpOf('aa'), cd: 1.1 + Math.random() * AA_CD, done: false, ph });
    }
    else if (r < 0.66) obstacles.push({ type: 'birds', x: lane, y: spawnY('birds'), z: SPAWN_Z, bvx: (Math.random() - 0.5) * 6, white: Math.random() < 0.5, done: false, ph });
    else if (r < 0.75) obstacles.push({ type: 'balloon', x: lane, y: spawnY('balloon'), z: SPAWN_Z, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
    else if (r < 0.84) obstacles.push({ type: 'helo', x: lane, y: spawnY('helo'), z: SPAWN_Z, ...hpOf('helo'), ...mov('helo', lane), done: false, ph });
    else if (r < 0.92) obstacles.push({ type: 'jet', x: lane, y: spawnY('jet'), z: SPAWN_Z, ...hpOf('jet'), ...mov('jet', lane), done: false, ph });
    else if (cfg.fuelOn) obstacles.push({ type: 'fuel', x: lane, y: spawnY('fuel'), z: SPAWN_Z, done: false });
    else obstacles.push({ type: 'balloon', x: lane, y: spawnY('balloon'), z: SPAWN_Z, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
    return;
  }

  // LAS OLAS (SPEC_AGUA_OLAS F1). Van ANTES del sorteo de siempre y con `return`: una ola no
  // comparte cuadro con una fragata — el mar tiene que quedar despejado para leerla venir.
  //
  // Por que aca y no en el sorteo `r`: la frecuencia de la ola es del CLIMA, no de la mezcla del
  // mapa. En m1 (sin viento) OLA_RATE.calm es 0 y no sale jamas; en tormenta sale seguido. Meterla
  // en el reparto de porcentajes le habria robado densidad a los enemigos segun el clima, que es
  // una consecuencia que nadie pidio.
  sondaSpawns++;
  if (olaOk() && Math.random() < OLA_RATE[climaDe(cfg)]) { sondaOlas++; spawnOla('marejada'); return; }

  // MAR ABIERTO: fragatas y trafico aereo.
  //
  // La MEZCLA cambio al sacarle el palo a la fragata. Antes el mastil (34%) era una aguja de
  // hasta 28 m: te obligaba a esquivar de costado y era LA habilidad del mapa de mar. Ahora el
  // buque termina en SHIP_H y se pasa por arriba, asi que ese 34% pasaria a ser casi gratis y el
  // mar quedaria vacio. Se le saca 6 puntos a la fragata y se los reparte a las AERONAVES
  // (helo 10→13, jet 8→11): la amenaza del mar se muda del palo al cielo, que es donde ahora
  // estan las capas (ver SPAWN_Y en data/tuning.js).
  if (r < 0.28) obstacles.push({ type: 'mast', x: lane, h: SHIP_H, z: SPAWN_Z, ...mov('mast'), done: false, ph });
  else if (r < 0.42) obstacles.push({ type: 'birds', x: lane, y: spawnY('birds'), z: SPAWN_Z, bvx: (Math.random() - 0.5) * 6, white: Math.random() < 0.5, done: false, ph });
  else if (r < 0.54) obstacles.push({ type: 'balloon', x: lane, y: spawnY('balloon'), z: SPAWN_Z, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
  else if (r < 0.67) obstacles.push({ type: 'helo', x: lane, y: spawnY('helo'), z: SPAWN_Z, ...hpOf('helo'), ...mov('helo', lane), done: false, ph });
  else if (r < 0.78) obstacles.push({ type: 'jet', x: lane, y: spawnY('jet'), z: SPAWN_Z, ...hpOf('jet'), ...mov('jet', lane), done: false, ph });
  else if (cfg.fuelOn) obstacles.push({ type: 'fuel', x: lane, y: spawnY('fuel'), z: SPAWN_Z, done: false });
  else obstacles.push({ type: 'balloon', x: lane, y: spawnY('balloon'), z: SPAWN_Z, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
}

/** Avanza los relojes de aparicion y siembra cuando toca.
 *  `objectiveDist` (0 = sin objetivo) habilita el CORDON FINAL: pasado VEIL_STOP no entra nadie
 *  mas al pasillo, para que el ultimo tramo contra el buque quede limpio (ver VEIL_* en
 *  data/tuning.js). Al margen del porcentaje se exige SPAWN_Z*1.6 de sobra, asi el ultimo
 *  sembrado alcanza a pasarte antes de que cierre la bruma en cualquier largo de mision. */
export function spawnSystem(dt, objectiveDist) {
  // el corte nunca cae antes de la mitad del pasillo: en misiones cortas (o con ?qa, que las
  // achica x0.06) el margen de SPAWN_Z se comeria el nivel entero y no apareceria nadie nunca.
  if (objectiveDist > 0 && run.dist >= Math.max(objectiveDist * 0.5,
    Math.min(objectiveDist * VEIL_STOP, objectiveDist - SPAWN_Z * 1.6))) return;
  // spawn por distancia. En COSTA el campo es mas denso ("hay un desembarco en marcha"): el
  // intervalo se acorta un 35%.
  run.nextSpawn -= run.spd * dt;
  if (cfg.obstacles > 0 && run.nextSpawn <= 0) {
    spawn();
    const dens = cfg.terrain === 'coast' ? 0.65 : 1;
    run.nextSpawn = Math.max(34, (52 + Math.random() * 42) - run.t * 0.8) * dens * SPAWN_DENS / cfg.obstacles;
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
      const lane = coast ? shoreAt(run.dist + SPAWN_Z) - SAND_W - 2 - Math.random() * 8 : Math.random() * 44 - 22;
      squad(lane, SPAWN_Z, 2 + (Math.random() * 3 | 0), coast);
      run.nextSoldier = coast ? 26 + Math.random() * 34 : 40 + Math.random() * 55;
    }
  }
}

// SONDAS de desarrollo (SPEC_AGUA_OLAS §4) — QUITAR al cerrar el agua.
// __ola: inyecta una ola a SPAWN_Z SALTEANDO el clima y el GAP. Existe porque probar la mecanica
// por las buenas es esperar un sorteo del 4% mientras volas: la ola tardaria minutos en salir y la
// prueba mediria paciencia, no juego.
if (typeof window !== 'undefined') window.__ola = (tipo, alto) => {
  const o = spawnOla(OLA_H[tipo] !== undefined ? tipo : 'marejada', alto);
  return JSON.stringify({ kind: o.kind, z: o.z | 0, h: +o.h.toFixed(2), wz: +o.wz.toFixed(1), brecha: o.gapW ? (o.gapX | 0) : null });
};
// __seaclima: fija el clima del mar resuelto. No es comodidad: el clima sale del cfg de la mision,
// y para probar "en calma no hay olas" habria que arrancar una mision distinta y volar hasta el
// mar — con esto la misma corrida sirve para las dos mitades de la regla.
if (typeof window !== 'undefined') window.__seaclima = c => {
  // escribe las CAUSAS (viento, lluvia, cielo), no el resultado: asi la sonda ejercita climaDe()
  // en vez de saltearla — que es como se escapo el bug de POR LA PATRIA (ver SPEC §9.9).
  if (c === 'storm') { cfg.wind = true; cfg.rain = 1; }
  else if (c === 'breeze') { cfg.wind = true; cfg.rain = 0; if (cfg.sky === 'storm') cfg.sky = 'dusk'; }
  else { cfg.wind = false; cfg.rain = 0; if (cfg.sky === 'storm') cfg.sky = 'dusk'; }
  return climaDe(cfg);
};
// __seaput: coloca el avion en altura (y carril). Es el equivalente de __pset de la PASADA y
// existe por lo mismo: la ventana en la que el avion esta EXACTAMENTE a la altura de la cresta
// dura decimas de segundo, y un ida y vuelta de sondeo ya la deja atras.
if (typeof window !== 'undefined') window.__seaput = (y, x) => {
  plane.y = y;
  if (x !== undefined) plane.x = x;
  plane.vy = 0;
  return JSON.stringify({ y: plane.y, x: plane.x });
};
// __seaclear: barre TODO lo que no sea ola. El mar de POR LA PATRIA trae fragatas, globos, helos y
// cazas, y saltar una ola te sube justo a la altura donde vuelan: sin esto, "se salto la ola y se
// murio" no distingue entre la ola y un globo de barrera, y la prueba acusaria al inocente.
if (typeof window !== 'undefined') window.__seaclear = () => {
  for (let i = obstacles.length - 1; i >= 0; i--) if (obstacles[i].type !== 'ola') obstacles.splice(i, 1);
  return obstacles.length;
};
// __olaOk: contesta la GUARDA de siembra (distancia minima, tope de olas vivas, niebla). Es lo
// unico que __ola no ejercita, justamente porque la saltea a proposito.
if (typeof window !== 'undefined') window.__olaOk = () => String(olaOk());
// __seadbg: el estado del mar en una linea — la ola viva mas cercana, la altura del avion, el
// margen de roce gastado y el clima resuelto.
if (typeof window !== 'undefined') window.__seadbg = () => {
  let cerca = null;
  for (const o of obstacles) {
    if (o.type !== 'ola') continue;
    if (!cerca || o.z < cerca.z) cerca = o;
  }
  // DONDE SE VE la cresta, en pixeles: es lo que decide si la ola se TELEGRAFIA. Un numero de z
  // no contesta esa pregunta —una ola puede estar cerca y no verse— y a ojo tampoco: medir el
  // brillo del cuadro devuelve el horizonte, que es lo mas claro de la pantalla pase lo que pase.
  let vista = null;
  if (cerca) {
    const base = proj(plane.x, 0, cerca.z);
    const cima = proj(plane.x, olaBump(cerca, plane.x - cerca.x, 0), cerca.z);
    vista = { y: +cima.y.toFixed(1), alto: +(base.y - cima.y).toFixed(1) };
  }
  return JSON.stringify({
    ola: cerca ? { tipo: cerca.kind, z: +cerca.z.toFixed(1), h: +cerca.h.toFixed(2), brecha: cerca.gapW ? +cerca.gapX.toFixed(1) : null } : null,
    vista,
    olas: obstacles.filter(o => o.type === 'ola').length,
    y: +plane.y.toFixed(2), x: +plane.x.toFixed(1),
    scrapeT: +run.scrapeT.toFixed(3), limite: +scrapeLimit(run.spd, run.boost).toFixed(3),
    clima: climaDe(cfg), niebla: inBank(), spd: run.spd | 0,
    dist: run.dist | 0, sorteos: sondaSpawns, sembradas: sondaOlas,
  });
};
