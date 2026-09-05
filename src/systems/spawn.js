// SPAWN: siembra el campo de juego por distancia recorrida.
//
// Dos poblaciones independientes: obstaculos (mastiles, globos, aeronaves, bidones, y en COSTA
// las estructuras del desembarco) que emergen del horizonte, y grupos de soldados que corren
// (terrenos con tierra). Ambos nacen a SPAWN_Z (data/tuning.js) y el mundo los trae hacia la camara.
//
// Es el sistema mas limpio del motor: solo escribe los arrays del mundo y lee la corrida y el
// mapa. No dibuja, no suena, no decide transiciones.

import { cfg, stats } from '../core/state.js';
import { run } from '../core/run.js';
import { obstacles, soldiers, popups, bullets, missiles, pmissiles } from '../core/world.js';
import { OLA_H, OLA_RATE, OLA_GAP_MIN, OLA_H_VAR, OLA_WZ, OLA_WZ_VAR, OLA_ROMP_P, OLA_ROMP_HW, OLA_REB_P, OLA_REB_D0,
  OLA_COSTA_P, OLA_COSTA_OFF } from '../data/tuning.js';
import { inBank } from './fog.js';
// TRAMOS (SPEC_TRAMOS RF-02): el guion de spawn por mision. Se LEE, nunca se escribe: `val`
// devuelve lo que rige a esta altura del vuelo y cae al cfg cuando la mision no tiene tramos —
// que es como se cumple RF-04 (sin tramos, este archivo se comporta exactamente igual que ayer).
import { val as trVal } from './tramos.js';
// LA CHARLA EN VUELO (SPEC_CHARLAS_VUELO RF-01): mientras hay una armada o corriendo, aca no
// nace nadie. Es el mismo patron de gate que la niebla ciega — una condicion de mundo que este
// archivo consulta, no un estado que administre.
import { sembrar as cvSembrar } from './charla.js';
import { carrilLibre } from './persec.js';
import { carrilSeguro, puestoLadera } from '../core/zigzag.js';
import { ZZ_PARED_TALUD, ZZ_LADERA_P } from '../data/tuning.js';
import { plane } from '../core/state.js';
import { scrapeLimit } from '../core/physics.js';
import { olaBump, climaDe } from '../core/sea.js';
import { proj, popup } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { SPAWN_X, SPAWN_DENS, SPAWN_Z, SHORE_X, shoreAt, SAND_W, AA_CD, ENEMY_HP, spawnY, SHIP_H,
         CLIFF_H0, CLIFF_H1, CLIFF_HW0, CLIFF_HW1, CLIFF_COAST_BAND, VEIL_STOP } from '../data/tuning.js';
// EL RELIEVE (T3): donde queda plantado cada cosa que se siembra. La misma funcion que dibuja
// la loma y que decide el choque contra el suelo.
import { tierraH, hayRelieve } from '../core/tierra.js';

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
  const rel = hayRelieve(cfg);
  for (let i = 0; i < n; i++) soldiers.push({
    x: x + (Math.random() * 10 - 5), z: z + Math.random() * 22, ph: Math.random() * 6,
    // el suelo donde CORREN (T3). Se fija al nacer: corren en x unos metros durante su vida y la
    // loma cambia centimetros en esa distancia — recalcularlo por cuadro seria pagar por nada.
    gy: rel ? tierraH(x, run.dist + z) : 0,
    // SIEMPRE hacia la IZQUIERDA: huyen del avion, que viene de frente. Con direccion al azar
    // algunos corrian hacia la camara y se leia como si cargaran contra el avion.
    dir: -1, v: coast ? 9 : 6,
    // EL EQUIPO, que es la unica diferencia de dibujo entre los dos (PLAN_HORNEADO B7): el que
    // desembarca lleva el bergen —la mochila enorme del yomp— y el de guarnicion no. A 12 px lo
    // que cambia es la silueta de la espalda, y es exactamente lo que separa a una fuerza que
    // acaba de bajar de una lancha de una que ya estaba ahi.
    bergen: !!coast,
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
// EL CENSO de los TRAMOS (QUITAR con el resto): cuantas cosas nacieron y de que tipo desde la
// ultima puesta a cero. Es la unica forma de medir la densidad de un tramo desde afuera.
let censo = { n: 0, tipos: {} };

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
    // CON UNA REBELDE VIVA NO ENTRA NADA MAS (§6.4). Es EL evento del temporal: compartir
    // pantalla con otra ola lo convertiria en una pared doble, que ya no se lee — se sufre.
    if (o.kind === 'rebelde') return false;
  }
  return true;
}

/** ¿Toca REBELDE (F7)? Solo en tormenta, solo pasados los primeros metros, y solo si no hay otra
 *  ola viva — la rebelde no comparte el mar con nadie. */
function rebeldeOk() {
  if (climaDe(cfg) !== 'storm') return false;
  if (run.dist < OLA_REB_D0) return false;
  for (const o of obstacles) if (o.type === 'ola') return false;
  return Math.random() < OLA_REB_P;
}

/** LA ROMPIENTE DE LA COSTA (T4.2): la ola parcial puesta donde el mar de verdad rompe — unos
 *  metros mar adentro de la orilla, que SERPENTEA, asi que se consulta a la profundidad de
 *  siembra (la misma fuente que usan el render y el vuelo).
 *
 *  Vive aparte para que la sonda del fixture y el sembrado llamen a LA MISMA funcion: si la sonda
 *  copiara la cuenta, probaria su propia copia y el juego podria sembrar en cualquier lado. */
export function rompienteCostera() {
  const o = spawnOla('rompiente');
  o.x = spawnShore() + OLA_COSTA_OFF;
  return o;
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
  // LA ROMPIENTE (F4) es PARCIAL y SIN brecha: el hueco es todo el resto del carril. Por eso no
  // se salta, se esquiva — y por eso se centra en una franja sorteada en vez de en el eje: si
  // saliera siempre en el medio, la respuesta seria "irse a un costado" siempre para el mismo
  // lado y dejaria de ser una lectura.
  if (kind === 'rompiente') {
    o.hw = OLA_ROMP_HW;
    o.x = (Math.random() * 2 - 1) * SPAWN_X * 0.55;
    o.gapX = 0; o.gapW = 0;
  }
  // LA REBELDE AVISA POR RADIO (F7.2), y solo si hay con quien volar: el aviso lo da un Fiel que
  // la vio antes que vos. Volando solo no hay ojos, y ese silencio es la regla humana del item —
  // no un castigo mecanico. Con aviso o sin el la ola SIEMPRE se ve desde SPAWN_Z: el aviso es
  // ventaja, nunca el requisito de que sea justa.
  if (kind === 'rebelde' && run.lives > 1) popup(0, 26, T('ola_call'), P.warn, true);
  obstacles.push(o);
  return o;
}

/** UN ANTIAEREO EN LA LADERA (zigzag Z5), o null si no hay callejon o si el sorteo dice que no.
 *
 *  EN SAN CARLOS LOS ANTIAEREOS ESTABAN EN LAS LOMAS. Sembrados en el agua —que es donde el
 *  sembrador los pone siempre— el callejon queda de decorado: el fuego sigue viniendo de donde
 *  venia en mar abierto y los cerros no participan. Puestos arriba, el jugador entra a un pasillo
 *  que le tira desde los dos costados y desde ARRIBA, que es lo que el nombre de la mision promete.
 *
 *  `enLadera: true` los exime de dos reglas que valen para todo lo demas: el tope contra el hueco
 *  del carril (systems/collision.js) y el censo de "obstaculos enterrados" (`__zzobs`). No estan
 *  enterrados: estan PARADOS ARRIBA, que es justo lo contrario, y el chequeo no sabe distinguirlo
 *  porque mira la x y la altura del cerro, no la del objeto.
 *
 *  Devuelve null la mayoria de las veces (`ZZ_LADERA_P`): un callejon donde CADA antiaereo esta en
 *  la ladera deja el agua vacia, y la mezcla de los dos es lo que hace que haya que mirar arriba
 *  y abajo. */
function enLadera(tipo) {
  const pu = Math.random() < ZZ_LADERA_P ? puestoLadera(run.dist + SPAWN_Z, Math.random() < 0.5 ? -1 : 1) : null;
  if (!pu) return null;
  const base = tipo === 'aa'
    ? { type: 'aa', h: 4.4, y: 1.8, ...hpOf('aa'), cd: 1.1 + Math.random() * AA_CD }
    : { type: 'aatruck', h: 4.6, y: 1.9, ...hpOf('aatruck'), cd: 1.3 + Math.random() * AA_CD };
  return { ...base, x: pu.x, gy: pu.gy, z: SPAWN_Z, enLadera: true, done: false, ph: Math.random() * 6 };
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
  // EL CARRIL RESERVADO DEL LIDER (PLAN_HARRIERS_PERSECUCION §4, N0). En PERSECUCION el sembrador
  // CONOCE la linea del lider y no siembra encima: es la mitad de la garantia de que el lider nunca
  // choca (la otra mitad es que esquiva, en systems/persec.js). Sin persecucion corriendo,
  // `carrilLibre` devuelve el carril tal cual y esto no cuesta nada.
  //
  // Se corrige ACA y no en cada `push` porque `lane` es el carril compartido de casi todo lo que
  // se siembra: un solo lugar donde pasa, un solo lugar donde puede fallar. Los pocos tipos que
  // eligen su propio carril (landLane/waterLane, en COSTA) son de TIERRA — el lider vuela sobre
  // el agua y no los cruza.
  // EL CALLEJON RECORTA EL CARRIL (zigzag Z3): con paredes puestas, nada nace adentro de la roca.
  // `anchoLibre` devuelve null sin paredes, y entonces esto es el sorteo de siempre — el sembrador
  // no sabe que existe el zigzag.
  // EL CALLEJON RECORTA EL CARRIL (zigzag Z3): nada nace donde la tierra se mete. Se pregunta por
  // el TRAMO ENTERO que el obstaculo va a recorrer, no por el hueco de este metro — si no, nace en
  // un hueco que se cierra antes de que llegue y termina enterrado en la roca. Sin paredes
  // devuelve `null` y esto es el sorteo de siempre.
  //
  // EL INTERVALO PUEDE NO CONTENER AL CERO: con una punta grande la unica franja libre esta toda
  // de un lado del pasillo. Y puede estar VACIO — ahi no se siembra y listo. Forzar un carril
  // seria plantar un obstaculo adentro de la roca: invisible, y letal.
  let lo = -SPAWN_X, hi = SPAWN_X;
  const seg = carrilSeguro(run.dist, SPAWN_Z, ZZ_PARED_TALUD);
  if (seg) { lo = Math.max(lo, seg.lo); hi = Math.min(hi, seg.hi); }
  // ⚠ EL ANTIAEREO DE LA LADERA SE INTENTA ANTES DEL RECORTE, y esto no es un atajo: no ocupa el
  // canal —esta ARRIBA del cerro— asi que el hueco libre del agua no lo condiciona. Puesto
  // despues, se lo comia el `return` de abajo: medido, en el callejon el canal esta cerrado tan
  // seguido que NO NACIA UN SOLO antiaereo, ni arriba ni en el agua, y el pasillo quedaba mudo.
  if (seg) {
    const la = enLadera(Math.random() < 0.5 ? 'aa' : 'aatruck');
    if (la) { obstacles.push(la); return; }
  }
  if (hi - lo < 6) return;                       // el callejon no deja lugar: este ciclo no siembra
  const lane = carrilLibre(lo + Math.random() * (hi - lo));   // acompaña a FLY_X (zona de vuelo)
  // LOS BIDONES, y si el tramo los corta (`bidones: false`, SPEC_TRAMOS §2). Es UNA pregunta y
  // no dos: el combustible tiene que estar prendido en el mapa Y el tramo no tiene que haberlo
  // cortado. Lo pide M10, donde el ultimo tercio se vuela sabiendo que no aparece ninguno.
  const bidones = cfg.fuelOn && trVal('bidones', true) !== false;
  if (bidones && run.fuelDist > 700) { obstacles.push({ type: 'fuel', x: lane, y: spawnY('fuel'), z: SPAWN_Z, done: false }); run.fuelDist = 0; return; }
  const r = Math.random();
  const ph = Math.random() * 6;

  if (cfg.terrain === 'coast') {
    // LA COSTA ROMPE (T4.2). La ROMPIENTE —la ola parcial, la que se esquiva de costado— tambien
    // nace aca, y donde el mar de verdad rompe: pegada a la orilla, unos metros mar adentro. Es
    // la ola que la costa pedia y la unica que tiene sentido con la playa al lado: una marejada
    // de ancho completo contra la orilla no dejaria por donde pasar.
    if (OLA_RATE[climaDe(cfg)] > 0 && olaOk() && Math.random() < OLA_COSTA_P) {
      sondaSpawns++; sondaOlas++;
      rompienteCostera();
      return;
    }
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
    else if (r < 0.30) obstacles.push(enLadera('aa') || { type: 'aa', x: landLane(), h: 4.4, y: 1.8, z: SPAWN_Z, ...hpOf('aa'), cd: 1.1 + Math.random() * AA_CD, done: false, ph });
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
    else if (r < 0.64) obstacles.push(enLadera('aatruck') || { type: 'aatruck', x: landLane(), h: 4.6, y: 1.9, z: SPAWN_Z, ...hpOf('aatruck'), ...mov('aatruck'), cd: 1.3 + Math.random() * AA_CD, done: false, ph });
    // trinchera ARGENTINA (decorado, bien a la izquierda): tira contra los britanicos
    else if (r < 0.70) obstacles.push({ type: 'trench', x: -SPAWN_X + Math.random() * 8, z: SPAWN_Z, decor: true, cd: 0.8 + Math.random(), done: false, ph });
    else if (r < 0.76) obstacles.push({ type: 'birds', x: lane, y: spawnY('birds'), z: SPAWN_Z, bvx: (Math.random() - 0.5) * 6, white: Math.random() < 0.5, done: false, ph });
    else if (r < 0.85) obstacles.push({ type: 'balloon', x: lane, y: spawnY('balloon'), z: SPAWN_Z, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
    else if (r < 0.93) obstacles.push({ type: 'helo', x: lane, y: spawnY('helo'), z: SPAWN_Z, ...hpOf('helo'), ...mov('helo', lane), done: false, ph });
    else if (r < 0.97) obstacles.push({ type: 'jet', x: lane, y: spawnY('jet'), z: SPAWN_Z, ...hpOf('jet'), ...mov('jet', lane), done: false, ph });
    else if (bidones) obstacles.push({ type: 'fuel', x: lane, y: spawnY('fuel'), z: SPAWN_Z, done: false });
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
      } else obstacles.push(enLadera('aa') || { type: 'aa', x: lane, h: 4.4, y: 1.8, z: SPAWN_Z, ...hpOf('aa'), cd: 1.1 + Math.random() * AA_CD, done: false, ph });
    }
    else if (r < 0.66) obstacles.push({ type: 'birds', x: lane, y: spawnY('birds'), z: SPAWN_Z, bvx: (Math.random() - 0.5) * 6, white: Math.random() < 0.5, done: false, ph });
    else if (r < 0.75) obstacles.push({ type: 'balloon', x: lane, y: spawnY('balloon'), z: SPAWN_Z, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
    else if (r < 0.84) obstacles.push({ type: 'helo', x: lane, y: spawnY('helo'), z: SPAWN_Z, ...hpOf('helo'), ...mov('helo', lane), done: false, ph });
    else if (r < 0.92) obstacles.push({ type: 'jet', x: lane, y: spawnY('jet'), z: SPAWN_Z, ...hpOf('jet'), ...mov('jet', lane), done: false, ph });
    else if (bidones) obstacles.push({ type: 'fuel', x: lane, y: spawnY('fuel'), z: SPAWN_Z, done: false });
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
  if (olaOk() && Math.random() < OLA_RATE[climaDe(cfg)]) {
    sondaOlas++;
    // QUE CLASE DE OLA. La marejada es la normal —el gesto vertical, la tesis del item— y cada
    // tanto sale una ROMPIENTE, que es la otra pregunta: parcial, no se salta, se esquiva. Y en
    // TORMENTA, de vez en cuando, la REBELDE: ancho completo y ocho metros, sin respuesta barata.
    spawnOla(rebeldeOk() ? 'rebelde' : Math.random() < OLA_ROMP_P ? 'rompiente' : 'marejada');
    return;
  }

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
  else if (bidones) obstacles.push({ type: 'fuel', x: lane, y: spawnY('fuel'), z: SPAWN_Z, done: false });
  else obstacles.push({ type: 'balloon', x: lane, y: spawnY('balloon'), z: SPAWN_Z, ...hpOf('balloon'), ...mov('balloon', lane), done: false, ph });
}

/** Avanza los relojes de aparicion y siembra cuando toca.
 *  `objectiveDist` (0 = sin objetivo) habilita el CORDON FINAL: pasado VEIL_STOP no entra nadie
 *  mas al pasillo, para que el ultimo tramo contra el buque quede limpio (ver VEIL_* en
 *  data/tuning.js). Al margen del porcentaje se exige SPAWN_Z*1.6 de sobra, asi el ultimo
 *  sembrado alcanza a pasarte antes de que cierre la bruma en cualquier largo de mision. */
// LO QUE SE APOYA EN EL SUELO Y LO QUE NO (T3). Va por lista de lo que NO se planta —el aire y el
// agua— y no por lista de lo que si: si mañana entra un obstaculo de tierra nuevo y nadie se
// acuerda de esta tabla, queda plantado en la loma, que es lo correcto. Al reves quedaria flotando.
const EN_EL_AIRE = ['helo', 'jet', 'balloon', 'birds', 'fuel', 'bomb', 'boom', 'ola', 'lcu', 'mast'];

/** Le fija `gy` —la altura del suelo donde queda plantado— a todo lo sembrado a partir de `desde`.
 *
 *  UNA sola vez, al sembrar: el obstaculo no se mueve en el mundo (se acerca), asi que su loma es
 *  la misma toda su vida. Y en un solo lugar —aca— en vez de en los veinte `obstacles.push` del
 *  sorteo, que es donde se olvidaria alguno. */
function plantar(desde) {
  if (!hayRelieve(cfg)) return;
  for (let i = desde; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (EN_EL_AIRE.indexOf(o.type) >= 0) continue;
    o.gy = tierraH(o.x, run.dist + o.z);
  }
}

export function spawnSystem(dt, objectiveDist) {
  // CHARLA EN VUELO: el corredor se vacia SOLO. No se borra nada de lo que ya esta (eso seria
  // ver desaparecer una fragata delante de los ojos): se deja de sembrar y lo sembrado pasa de
  // largo, que es el DRENAJE del RF-01. Va antes que todo lo demas porque es la mas fuerte de
  // las guardas: durante una charla no hay densidad de tramo, ni bombardeo, ni soldados.
  if (!cvSembrar()) return;
  // el corte nunca cae antes de la mitad del pasillo: en misiones cortas (o con ?qa, que las
  // achica x0.06) el margen de SPAWN_Z se comeria el nivel entero y no apareceria nadie nunca.
  if (objectiveDist > 0 && run.dist >= Math.max(objectiveDist * 0.5,
    Math.min(objectiveDist * VEIL_STOP, objectiveDist - SPAWN_Z * 1.6))) return;
  // spawn por distancia. En COSTA el campo es mas denso ("hay un desembarco en marcha"): el
  // intervalo se acorta un 35%.
  run.nextSpawn -= run.spd * dt;
  // LA DENSIDAD DEL TRAMO (RF-02). Se resuelve UNA vez y se usa para las dos cosas —la puerta y
  // el intervalo— porque son la misma pregunta: un tramo en 0 no siembra, y uno en 1.8 siembra
  // al doble de ritmo que uno en 0.9.
  const obst = trVal('obstacles', cfg.obstacles);
  if (obst > 0 && run.nextSpawn <= 0) {
    const n0 = obstacles.length, s0 = soldiers.length;
    spawn();
    // FAVOR: el sesgo de mezcla POR RE-SORTEO (§2). Si lo que salio no esta en la lista del
    // tramo, se desentierra y se sortea UNA vez mas. Se hace asi —sembrar y deshacer— y no
    // clasificando el sorteo por adelantado a proposito: las tablas de mezcla por terreno son
    // tres cadenas de umbrales adentro de `spawn()`, y para poder preguntar "que tipo va a
    // salir" habria que tenerlas ADEMAS en una tabla aparte. Dos copias de la misma lista es
    // exactamente el bug que este repo ya se comio dos veces (MODES y `opts`). Sembrar y
    // deshacer no puede divergir: la mezcla que se inclina es LA MISMA que se juega.
    //
    // Quedan EXENTOS el bidon y la ola: no son mezcla. El bidon tiene su propia llave
    // (`bidones`) y ademas resetea `run.fuelDist`; la ola sale del CLIMA y trae su propio
    // reglamento de separacion —desenterrarla dejaria el aviso de la rebelde sin ola.
    const fav = trVal('favor', null);
    if (fav && obstacles.length > n0) {
      const tipo = obstacles[n0].type;
      if (tipo !== 'fuel' && tipo !== 'ola' && fav.indexOf(tipo) < 0) {
        obstacles.length = n0; soldiers.length = s0;
        spawn();
      }
    }
    plantar(n0);
    // CENSO DE SIEMBRA (sonda de los TRAMOS, QUITAR). Cuenta lo que ENTRA al mundo, por tipo:
    // medir la densidad mirando `obstacles.length` no sirve porque el mundo tambien se vacia por
    // detras — lo que hay en pantalla es la resta de dos caudales, y el tramo gobierna UNO.
    // Se cuenta DESPUES del re-sorteo de `favor`, que es lo que de verdad quedo sembrado.
    for (let i = n0; i < obstacles.length; i++) {
      const t = obstacles[i].type;
      censo.n++; censo.tipos[t] = (censo.tipos[t] || 0) + 1;
    }
    const dens = cfg.terrain === 'coast' ? 0.65 : 1;
    run.nextSpawn = Math.max(34, (52 + Math.random() * 42) - run.t * 0.8) * dens * SPAWN_DENS / obst;
  }

  // BOMBARDEO (cualquier mapa, cfg.bombs lo regula desde el menu [M]): bombas que caen del
  // cielo. Chocarlas en el aire mata; al tocar el suelo levantan un HONGO que es un obstaculo
  // mas — meterse en la nube daña (sacude, frena, quema combustible) pero no derriba.
  const bombs = trVal('bombs', cfg.bombs);
  if (bombs > 0) {
    run.nextBomb -= run.spd * dt;
    if (run.nextBomb <= 0) {
      obstacles.push({
        type: 'bomb', x: Math.random() * SPAWN_X * 2 - SPAWN_X, y: 55 + Math.random() * 20,
        z: 130 + Math.random() * 90, vy: 24 + Math.random() * 9, done: false, ph: Math.random() * 6,
      });
      run.nextBomb = (180 + Math.random() * 150) / bombs;
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
// QUITAR — EL PASILLO ENTERO, VACIO: obstaculos (olas incluidas), soldados y TODO LO QUE YA ESTA
// EN VUELO hacia el jugador (balas, misiles). Es el hermano mayor de `__seaclear`, que a proposito
// deja las olas y no toca los proyectiles porque a las olas las viene a medir.
//
// Existe para `npm run maniobras` (PLAN_MANIOBRAS_FASES M0): ahi lo que se mide son las CURVAS de
// una pirueta, y para eso el avion tiene que llegar vivo al final de la maniobra sin que nadie lo
// pilotee. Limpiar los obstaculos no alcanzaba — un misil lanzado cinco segundos antes seguia
// viajando y mataba en el medio de la medicion, con un sintoma que no se parece en nada a su
// causa: el reloj de la pirueta clavado en cero y "no termina" (al morir, flight.js deja de correr
// y `movesSystem` no se llama mas).
//
// Los stores se MUTAN (splice/length = 0), nunca se reasignan: convencion 1 de ARQUITECTURA.
// QUITAR — LA VALLA DE EL TEATRO AEREO (PLAN_TEATRO_AEREO TA0). Cuenta las CINCO listas de
// `core/world.js`, que son los cinco contratos de daño del juego. La afirmacion que sostiene todo
// el plan es que una escena entera del teatro —blancos entrando, tiros cruzando, un Fiel volando
// una pirueta— **no mueve ninguno de estos numeros**: no hay daño porque el teatro no esta en las
// listas donde vive el daño. Se mide desde afuera, contando, y no leyendo una bandera adentro.
if (typeof window !== 'undefined') window.__listas = () => JSON.stringify({
  obstacles: obstacles.length, soldiers: soldiers.length,
  bullets: bullets.length, missiles: missiles.length, pmissiles: pmissiles.length,
  // …y LO QUE SE ACREDITA, que es la otra mitad de la misma promesa: un derribo de utileria no
  // suma puntos, ni derribos aereos, ni disparos. La escena se mira; no se juega.
  score: run.score, air: stats.air, shots: stats.shots, hits: stats.hits,
});

if (typeof window !== 'undefined') window.__pasilloLimpio = () => {
  obstacles.length = 0; soldiers.length = 0;
  bullets.length = 0; missiles.length = 0; pmissiles.length = 0;
  return true;
};
// __sealives / __seapop: las dos sondas del AVISO de la rebelde (F7.2). La primera fija cuantos
// aviones quedan —que es de lo que depende que alguien te avise— y la segunda devuelve los popups
// EN PANTALLA. Se mira el popup y no una variable interna a proposito: el bug de F1 se escapo
// justamente por probar el mecanismo sin mirar nunca lo que ve el jugador. QUITAR.
if (typeof window !== 'undefined') window.__sealives = n => { run.lives = n; run.squad = Math.max(run.squad, n); return run.lives; };
if (typeof window !== 'undefined') window.__seapop = () => {
  const txt = popups.map(p => p.txt).join(' | ');
  popups.length = 0;                     // se vacia al leer: cada consulta mira SU ventana
  return JSON.stringify(txt);
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
    ola: cerca ? { tipo: cerca.kind, z: +cerca.z.toFixed(1), h: +cerca.h.toFixed(2),
                   x: +(cerca.x || 0).toFixed(1), hw: cerca.hw || null, rompio: !!cerca.breakT,
                   brecha: cerca.gapW ? +cerca.gapX.toFixed(1) : null } : null,
    vista,
    olas: obstacles.filter(o => o.type === 'ola').length,
    y: +plane.y.toFixed(2), x: +plane.x.toFixed(1),
    scrapeT: +run.scrapeT.toFixed(3), limite: +scrapeLimit(run.spd, run.boost).toFixed(3),
    clima: climaDe(cfg), niebla: inBank(), spd: run.spd | 0,
    dist: run.dist | 0, sorteos: sondaSpawns, sembradas: sondaOlas,
  });
};

// __trclear / __trcount: el CENSO de siembra de los TRAMOS (QUITAR al cerrar el item). Se pone en
// cero, se vuela un rato, y se pregunta que nacio: con eso el fixture compara densidades entre
// tramos y comprueba que `bidones: false` y `favor` hacen lo que dicen.
if (typeof window !== 'undefined') window.__trclear = () => { censo = { n: 0, tipos: {} }; return true; };
if (typeof window !== 'undefined') window.__trcount = () => JSON.stringify(censo);

// __olacosta: siembra la rompiente de la COSTA y devuelve donde quedo y donde esta la orilla. La
// probabilidad real (OLA_COSTA_P sobre las siembras) tardaria kilometros en dar una: lo que hay
// que poder medir es que ROMPA DONDE CORRESPONDE, no el sorteo.
if (typeof window !== 'undefined') window.__olacosta = () => {
  const o = rompienteCostera();
  return JSON.stringify({ x: +o.x.toFixed(1), orilla: +spawnShore().toFixed(1), hw: o.hw, kind: o.kind });
};
