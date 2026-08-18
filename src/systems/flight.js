// VUELO: el sistema mas grande del motor y el INTEGRADOR del frame de juego.
//
// Corre el movimiento del avion (gas, intercambio de energia, alabeo/cabeceo), el roce con la
// superficie, el combustible, el radar y el canon. Es lo ultimo que se modularizo porque toca a
// casi todos: por eso recibe lo que todavia no es un modulo propio en un `deps` chico, y avisa
// las transiciones con una SEÑAL en vez de llamar hacia arriba.
//
//   deps.viewMouse()      resuelve la mira segun la camara (camara y armas siguen en game.js)
//   deps.launchMissile()  dispara el misil del jugador
//   deps.objectiveDist    distancia del objetivo del run (0 = sin objetivo)
//   deps.needsMomentum    si el objetivo culmina en el climax (momentum) o con solo llegar
//   deps.climax           'pasada' | 'arena': QUE climax juega esta mision (SPEC_MODO_PASADA RF-14)
//
// Devuelve: 'momentum' · 'pasada' · 'arena' (ya entro al climax) · 'objective' (llego a la meta
//           sin climax) ·
//           { death } (se estrello) · undefined (segui volando). El orquestador actua sobre eso.

import { plane, cfg, cam, stats, CTRL_BANK } from '../core/state.js';
import { run } from '../core/run.js';
import { inp, mouse, pointer } from '../core/input.js';
import { obstacles, bullets, missiles, wake, gusts, streaks, parts, prune } from '../core/world.js';
import { proj, popup } from '../core/fx.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { W, H, HOR, F, PZ } from '../render/ctx.js';
import { MSL_MAX, FLY_X, FLY_TOP, ROLL_DUR,
         GUN_HEAT_SHOT, GUN_COOL_FIRE, GUN_COOL_IDLE, GUN_RESET, shoreAt, RADAR_ALT } from '../data/tuning.js';
import { PORT_H } from '../data/runways.js';
// EL SUELO TIENE ALTURA (T3): la misma funcion que levanta el pasto y las estructuras es la que
// decide donde te matas. Si fueran dos, una loma se veria en un lado y mataria en el otro.
import { tierraH, hayRelieve } from '../core/tierra.js';
// cuanto sube la camara con turbo (unidades de mundo): el efecto de 'alejarse'
const BOOST_LIFT = 2.2;
// PANEO a fondo del stick derecho, en unidades de mundo. Es "un poco" a proposito: casi el triple
// del BOOST_LIFT de 2.2, asi que se nota sin discusion, pero el avion no se va de cuadro ni se
// pierde el horizonte. Es una mirada, no una camara libre.
const CAM_PAN = 6;
import { multOf } from '../core/util.js';
import { movesSystem, mvAllowsFire, mvAllowsTurbo } from './moves.js';
import * as momentum from './momentum.js';
import * as arena from './arena.js';
import * as pasada from './pasada.js';
import * as pulso from './pulso.js';
import { engineFly, sfxOne, sfxSrc, beep, boom } from './audio.js';
import * as dmg from './damage.js';
import { applyEnergy, applyDrag, speedTarget, windFactor, pitchTarget, scrapeLimit,
         bankStep, bankVx, BANK_MAX,
         PITCH_LERP, AFTER_STEP, AFTER_MAX, SCRAPE_RECOVER, SCRAPE_LIFT } from '../core/physics.js';

// altura de la ola bajo el avion (marejada): decide el nivel del mar para el roce. Solo el vuelo
// la usa (el render del mar tiene su propio campo de olas, seaH).
function waveNow() { return 1.1 + Math.sin(run.t * 1.1) * 0.5 + Math.sin(run.t * 2.3) * 0.3; }

// CAÑONES: separacion de cada boca respecto del eje del avion, en unidades de MUNDO. El 0.9 no es
// arbitrario — es lo que hace falta para que la trazadora nazca justo donde ya se dibuja el
// fogonazo (raiz del ala, ±5 px de diseño en render/plane.js). Si se mueven los fogonazos, mover
// esto: ver salir la bala de un lado y el fuego del otro se nota al instante.
const GUN_X = 0.9;
let gunSide = 1;   // de que cañon sale el proximo tiro; se turnan

export function flightSystem(dt, deps) {
  // PIRUETA activa: systems/moves.js toma el control del avion este frame (escribe vx/vy/bank/
  // pitch); mas abajo el bloque de control normal se saltea. Todo lo demas — energia, roce,
  // estela, racha, puntaje, colisiones — sigue corriendo igual: la maniobra vive DENTRO del
  // mundo, no lo pausa.
  movesSystem(dt, inp);
  // velocidad — el multiplicador y la racha rasante aceleran el avión
  // AVERIAS (core/damage.js): el escalon de daño puede sacarte el turbo y bajar la punta. En el
  // modo de siempre ('squad') y en el visual, `av` es nominal y esto no cambia nada.
  const av = dmg.fx();
  run.boost = inp.turbo && run.fuel > 0 && mvAllowsTurbo() && av.turbo;
  // viento en contra: cuanto más tiempo arriba, más resistencia (hasta -35%)
  if (cfg.wind && plane.y > 16) run.windT = Math.min(6, run.windT + dt);
  else run.windT = Math.max(0, run.windT - dt * 2);
  run.windF = windFactor(run.windT, cfg.wind);
  // AFTERBURNER SOSTENIDO: aguantar BOOST + RASANTE acumula tiempo; cada AFTER_STEP s sube un
  // escalón (hasta AFTER_MAX). Cada escalón multiplica la velocidad (AFTER_GAIN) y levanta el
  // techo (AFTER_CAP) para que el aumento se SIENTA. Soltar turbo o trepar lo corta (con gracia).
  const rasNow = plane.y <= 4.5;
  if (run.boost && rasNow) { run.afterT += dt; run.afterGrace = 0.4; }
  else if (run.afterGrace > 0) run.afterGrace -= dt;   // bob corto no rompe la racha
  else run.afterT = 0;
  const prevTier = run.afterTier;
  run.afterTier = Math.min(AFTER_MAX, Math.floor(run.afterT / AFTER_STEP));
  if (run.afterTier > prevTier) {                   // subió de escalón: feedback
    const s = proj(plane.x, plane.y, PZ);
    popup(s.x, s.y - 22, T('afterburner', { n: run.afterTier }), P.warn);
    beep(360 + run.afterTier * 130, 0.16, 'sawtooth', 0.06, 220 + run.afterTier * 90);
    run.shake = Math.min(6, run.shake + 1.1);
    for (let i = 0; i < 10 + run.afterTier * 3; i++) {
      const a = Math.random() * 6.283;
      streaks.push({ a, r: 20 + Math.random() * 18, v: 320 + Math.random() * 220, life: 0.5 });
    }
  }
  const spdTarget = speedTarget({ t: run.t, rasLevel: run.rasLevel, mult: run.mult, windF: run.windF, boost: run.boost, afterTier: run.afterTier }) * av.spd;
  // INTERCAMBIO DE ENERGIA (cfg.energy): la ALTURA es energia almacenada — picar la convierte
  // en velocidad, trepar la gasta. Es lo que arma el pendulo (bajar rapido → rasar → trepar).
  // El arrastre hacia spdTarget se AFLOJA (3 → ENERGY_DRAG) porque con el lerp rapido de antes
  // lo que ganabas picando se evaporaba en medio segundo y no se acumulaba nada.
  run.spd = cfg.energy ? applyEnergy(run.spd, spdTarget, plane.vy, dt) : applyDrag(run.spd, spdTarget, dt);
  // turbulencia: el viento sacude el avión
  let windRock = 0;   // con CONTROL POR ALABEO la rafaga va a las ALAS, no a vx (ver mas abajo)
  if (run.windF < 0.97) {
    if (cfg.control === CTRL_BANK) windRock = (Math.random() - 0.5) * 2.6 * (1 - run.windF) * dt * 4;
    else plane.vx += (Math.random() - 0.5) * 95 * (1 - run.windF) * dt * 4;
    plane.vy += (Math.random() - 0.5) * 70 * (1 - run.windF) * dt * 4;
    run.shake = Math.max(run.shake, (1 - run.windF) * 3.5);
    if (Math.random() < 0.02) boom(0.03, true);
  }
  // ráfagas visibles cruzando el cielo
  if (run.windT > 0.8 && Math.random() < (run.windT / 6) * 0.9)
    gusts.push({ x: W + 10, y: 4 + Math.random() * (HOR + 26), v: 260 + Math.random() * 170, len: 10 + Math.random() * 18, life: 2 });
  gusts.forEach(g => { g.x -= g.v * dt; g.life -= dt; });
  prune(gusts, g => g.x > -32 && g.life > 0);
  run.dist += run.spd * dt;
  run.fuelDist += run.spd * dt;

  // OBJETIVO cumplido. Segun el tipo de meta (ver GOALS):
  //   - con climax (ship): al acercarse al blanco arranca el asalto por pasadas (MOMENTUM)
  //   - sin climax (distance): llegar a la distancia YA cierra la mision
  if (deps.objectiveDist > 0) {
    if (deps.needsMomentum) {
      // CLIMAX: con 3D disponible, el asalto VOLADO (arena) — una sola entrada al 100%.
      // Sin three/WebGL o con ?no3d (build web), el momentum clasico de pasadas queda
      // como fallback intacto (decision 4 de PROMPT_MOMENTUM_3D.md).
      // PASADA (SPEC_MODO_PASADA RF-01/RF-14): cual de los dos climax juega la mision es DATO, y
      // llega por `deps.climax`. La transicion no tiene corte — se entra desde acá, en el mismo
      // frame, sin fade y sin pantalla, y el avion se lleva puesta su altura y su velocidad.
      // Igual que el arena, la PASADA necesita three.js: sin 3D queda el momentum de siempre.
      // EL PULSO: el climax de menor costo y el unico SIN 3D — no hay escena que cargar ni
      // transicion que empalmar, porque la prueba pasa delante del buque que ya venias viendo.
      if (deps.climax === 'pulso' && pulso.available()) {
        if (pulso.readyToEnter(run.dist, deps.objectiveDist)) { pulso.enter(true); return 'pulso'; }
      } else if (deps.climax === 'pasada' && pasada.available()) {
        if (pasada.readyToEnter(run.dist, deps.objectiveDist)) { pasada.enter(true); return 'pasada'; }
      } else if (arena.available()) {
        if (arena.readyToEnter(run.dist, deps.objectiveDist)) { arena.enter(); return 'arena'; }
      } else if (momentum.readyToEnter(run.dist, deps.objectiveDist)) { momentum.enter(); return 'momentum'; }
    } else if (run.dist >= deps.objectiveDist) return 'objective';
  }

  // maniobra (control normal — durante una PIRUETA el dueño es movesSystem)
  if (run.mv) { /* la pirueta ya escribio vx/vy */ } else if (pointer.steer) {
    const wx = (pointer.steer.x - W / 2) / (F / PZ) + cam.x;
    const wy = cam.y - (pointer.steer.y - HOR) / (F / PZ);
    plane.vx = Math.max(-30, Math.min(30, (wx - plane.x) * 5));
    plane.vy = Math.max(-24, Math.min(24, (wy - plane.y) * 5));
  } else if (cfg.control === CTRL_BANK) {
    // CONTROL POR ALABEO: ←/→ ROLAN y el desplazamiento lateral sale del banqueo (core/physics.js).
    // El viento entra por el mismo lado: en vez de empujar el avion de costado le SACUDE LAS ALAS,
    // que es lo que despues lo mueve. Si no, la rafaga escribia vx y la linea de abajo la borraba.
    run.bankA = bankStep(run.bankA, inp.r - inp.l, dt) + windRock;
    run.bankA = Math.max(-BANK_MAX, Math.min(BANK_MAX, run.bankA));
    plane.vx = bankVx(run.bankA);
    const G = 22, TH = 55, DIVE = 30;
    plane.vy += (((inp.u && run.fuel > 0) ? TH : 0) - G - (inp.d ? DIVE : 0)) * dt;
    plane.vy = Math.max(-20, Math.min(18, plane.vy));
  } else {
    plane.vx += (inp.r - inp.l) * 115 * dt;
    if (!inp.r && !inp.l) plane.vx *= Math.max(0, 1 - 4.5 * dt);
    plane.vx = Math.max(-30, Math.min(30, plane.vx));
    // gas: mantener ARRIBA empuja hacia arriba; al soltar, la gravedad gana y el avión cae
    const G = 22, TH = 55, DIVE = 30;
    plane.vy += (((inp.u && run.fuel > 0) ? TH : 0) - G - (inp.d ? DIVE : 0)) * dt;
    plane.vy = Math.max(-20, Math.min(18, plane.vy));
  }
  // PIRUETA (tonel): rafaga lateral fuerte que decae + estelas de viento; el perfil de
  // colision se ENCOGE mientras rola (alas "de canto") → pasa por espacios mas finos
  run.rollCd = Math.max(0, run.rollCd - dt);
  if (run.rollT > 0) {
    run.rollT -= dt;
    plane.vx = run.rollDir * 40 * (0.45 + run.rollT / ROLL_DUR);
    if (Math.random() < 0.85) {
      const sp2 = proj(plane.x + (Math.random() - 0.5) * 3, plane.y + (Math.random() - 0.5) * 2, PZ);
      parts.push({
        x: sp2.x - run.rollDir * 10, y: sp2.y, vx: -run.rollDir * (55 + Math.random() * 40),
        vy: (Math.random() - 0.5) * 20, life: 0.3, c: P.crest, r: 1
      });
    }
  }
  // throttle (palanca de gas): sube al dar gas, baja al soltar — solo indicador visual
  const gasOn = run.fuel > 0 && (inp.u || (pointer.steer && plane.vy > 0.5));
  run.throttle += ((gasOn ? 1 : 0) - run.throttle) * Math.min(1, dt * 7);
  if (cfg.fuelOn) run.fuel -= (3.2 + (run.boost ? 4.2 : 0)) * dt;   // COMBUSTIBLE: NO (menú [M]) = tanque infinito, para pruebas
  if (run.fuel <= 0) { run.fuel = 0; plane.vy = Math.min(plane.vy, -5); }
  plane.x += plane.vx * dt;
  plane.y += plane.vy * dt;
  if (plane.x < -FLY_X) { plane.x = -FLY_X; plane.vx = 0; }
  if (plane.x > FLY_X) { plane.x = FLY_X; plane.vx = 0; }
  if (plane.y > FLY_TOP) { plane.y = FLY_TOP; plane.vy = 0; }

  cam.x += (plane.x * 0.86 - cam.x) * Math.min(1, dt * 7);
  // PANEO DEL JUGADOR (stick derecho vertical · [R]/[F]): mirar un poco hacia abajo o hacia arriba
  // sin mover el avion. Es el MISMO mecanismo que el turbo — se corre la camara en el MUNDO — asi
  // que empujar el stick hacia ABAJO SUBE la camara: entra mas mundo por debajo, que es lo que
  // uno quiere cuando mira para abajo. Va suavizado (no es un interruptor) y NO afecta al vuelo.
  const panIn = inp.camAx || (inp.camD + inp.rise) - (inp.camU + inp.sink);
  run.camPan += (Math.max(-1, Math.min(1, panIn)) * CAM_PAN - run.camPan) * Math.min(1, dt * 4);
  // TURBO: la camara se VA PARA ATRAS. No se escala el raster (eso partia el mar en rayas, ver
  // CAM_ZOOMS en game.js): se sube la camara en el MUNDO, asi la proyeccion se recalcula sola,
  // entra mas agua en pantalla y el avion baja en el cuadro. Es un movimiento de camara real.
  const camLift = 2.6 + (run.boost ? BOOST_LIFT : 0) + run.camPan;
  cam.y += (plane.y + camLift - cam.y) * Math.min(1, dt * 3.2);
  if (cam.y < 3.4) cam.y = 3.4;

  // --- animación de vuelo: alabeo (bank) y cabeceo (pitch) suavizados ---
  // durante una PIRUETA el alabeo/cabeceo los clava movesSystem (poses de la maniobra)
  if (!run.mv) {
    // el alabeo mezcla la intención de giro (input) con la velocidad real → anticipa y asienta
    // Con CONTROL POR ALABEO no hay nada que inferir: el angulo ES el estado del avion, y el
    // sprite tiene que mostrar ESE y no una mezcla de intencion y velocidad. Se normaliza contra
    // BANK_MAX, que es justo el alabeo pleno de la hoja horneada (±60°), asi que bank ±1 = tope.
    const steerV = cfg.control === CTRL_BANK ? run.bankA / BANK_MAX
      : pointer.steer ? plane.vx / 26
        : ((inp.r - inp.l) * 0.9 + (plane.vx / 30) * 0.35);
    const bankTarget = Math.max(-1, Math.min(1, steerV));
    // cabeceo: la tecla mueve la trompa SOLO si se mantiene apretada un instante — los toques rápidos
    // de gas (↑ repetido) no la sacuden y el avión queda recto; si mantenés ↑/↓ sí cabecea.
    const vin = inp.u - inp.d;   // -1 pica / 0 / +1 trepa
    run.pitchHold = vin !== 0 ? run.pitchHold + dt : 0;
    const pitchTgt = pitchTarget(vin, run.pitchHold, plane.vy);
    plane.bank += (bankTarget - plane.bank) * Math.min(1, dt * 9);   // entra/sale con peso
    plane.pitch += (pitchTgt - plane.pitch) * Math.min(1, dt * PITCH_LERP);   // igual de rapido que el alabeo
  }

  // puntaje por altitud + racha rasante
  const alt = plane.y;
  run.mult = multOf(alt);
  if (alt <= 4.5) { run.streak += dt; run.graceT = 0.45; }
  else if (run.graceT > 0) run.graceT -= dt;
  else { run.streak = 0; run.rasLevel = 0; }
  const newLevel = Math.min(4, Math.floor(run.streak / 2));
  if (newLevel > run.rasLevel) {
    run.rasLevel = newLevel;
    stats.bestRas = Math.max(stats.bestRas, run.rasLevel);   // mejor nivel de racha alcanzado
    // el aviso de racha es informacion de HUD, no una etiqueta del avion: nace arriba del
    // velocimetro (centro abajo) y sube desde ahi, en vez de seguir al avion por la pantalla
    popup(W / 2, H - 30, T('rasante', { n: 10 + run.rasLevel * 5 }), P.accent);
    beep(500 + run.rasLevel * 180, 0.14, 'square', 0.06, 750 + run.rasLevel * 180);
    run.shake = Math.min(6, run.shake + 1.4);
    // oleada de líneas de velocidad al subir de nivel
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * 6.283;
      streaks.push({ a, r: 24 + Math.random() * 16, v: 280 + Math.random() * 180, life: 0.5 });
    }
  }
  run.multShow = run.mult === 10 ? 10 + run.rasLevel * 5 : run.mult;
  run.score += (run.boost ? 2 : 1) * 12 * run.multShow * dt;
  // superficie LETAL: tocar el suelo (o el agua) = explotar. Sobre tierra hay que volar en la banda
  // baja y arriesgada (arriba del suelo, pero bajo para clipear/matar soldados con el pase rasante).
  const overRunway = cfg.start !== 'air' && run.dist + PZ < cfg.coast;
  let groundY, deathMsg;
  // en COSTA el suelo depende del LADO: tierra a la izquierda de SHORE_X, mar a la derecha
  const onDirt = cfg.terrain === 'land' || (cfg.terrain === 'coast' && plane.x < shoreAt(run.dist + PZ));
  // 0.5 sigue siendo el margen de siempre sobre la superficie; lo que cambio es que la superficie
  // ya no es una constante. Se muestrea BAJO EL AVION (su x, su profundidad de juego) — no bajo la
  // camara: la loma tiene lados, y de eso se trata.
  if (onDirt) { groundY = (hayRelieve(cfg) ? tierraH(plane.x, run.dist + PZ) : 0) + 0.5; deathMsg = 'death_land'; }
  else if (overRunway) { groundY = (cfg.cliff ? PORT_H : 0) + 0.9; deathMsg = 'death_land'; }
  else { groundY = waveNow(); deathMsg = 'death_sea'; }
  // TOCAR LA SUPERFICIE: ya no es muerte instantanea. El avion ROZA y tambalea (perdes control:
  // sacudon, guiñada, chispas) y tenes que sacarlo. El reloj de gracia se agota MUCHO mas rapido
  // cuanto mas rapido vas — a fondo con turbo casi no hay margen. Si se agota, ahi si morís.
  // HISTERESIS: se ENTRA al roce tocando la superficie (y <= groundY), pero una vez adentro el
  // avion se sostiene un poco mas arriba (SCRAPE_LIFT) y sigue rozando hasta que trepás y salís
  // de la banda. Sin esto, sostenerlo mas alto hacia que la condicion fallara al frame siguiente
  // y el roce se cancelaba solo.
  const scrapeY = groundY + SCRAPE_LIFT;
  if (plane.y <= (run.scrapeT > 0 ? scrapeY + 0.2 : groundY)) {
    const lim = scrapeLimit(run.spd, run.boost);
    run.scrapeT += dt;
    if (run.scrapeT >= lim) return { death: deathMsg };                 // se agoto el margen
    // PISO, no altura fija: no se hunde, no salta solo, pero SI podes trepar dando gas.
    // (con "plane.y = scrapeY" quedaba clavado: vy acumulaba empuje sin mover el avion y
    //  salias catapultado un segundo despues, o te morias antes de lograrlo)
    if (plane.y < scrapeY) plane.y = scrapeY;
    if (plane.vy < 0) plane.vy = 0;
    plane.vy += (Math.random() - 0.5) * 26 * dt;                       // tambaleo vertical
    run.scrapeVib = 1;                                                     // el AVION vibra (ver drawPlaneSprite)
    plane.vx += (Math.random() - 0.5) * 140 * dt;                      // guiñada erratica
    run.spd = Math.max(34, run.spd - run.spd * 1.1 * dt);                          // el roce FRENA
    run.shake = Math.min(7, run.shake + 26 * dt);
    run.streak = 0; run.rasLevel = 0; run.afterT = 0; run.afterTier = 0;               // se corta la racha
    // chispas / rocio del roce
    const sp = proj(plane.x, groundY, PZ);
    for (let i = 0; i < 3; i++) parts.push({
      x: sp.x + (Math.random() - 0.5) * 14, y: sp.y, vx: (Math.random() - 0.5) * 90,
      vy: -30 - Math.random() * 70, life: 0.35,
      c: cfg.terrain === 'land' ? P.accent : P.crest, r: 1.4
    });
    if (!sfxOne('waveFly')) beep(90 + Math.random() * 60, 0.05, 'sawtooth', 0.05);
    // (el aviso "! SUBI !" lo dibuja el HUD mientras run.scrapeVib este alto: es un estado
    //  persistente, no un evento — antes se disparaba como popup ~30 veces por segundo)
  } else {
    run.scrapeT = Math.max(0, run.scrapeT - dt * SCRAPE_RECOVER);   // salir descuenta, pero no borra
    run.scrapeVib = Math.max(0, run.scrapeVib - dt * 6);            // la vibracion se apaga al salir
  }

  // estela sobre el agua
  const lowI = Math.max(0, 1 - alt / 9);
  if (lowI > 0 && !overRunway && !onDirt) {
    wake.push({ x: plane.x, z: PZ, i: lowI, seed: Math.random() * 100 });   // seed: motas estables
    if (wake.length > 150) wake.shift();
  }
  for (const wp of wake) wp.z -= run.spd * dt;
  prune(wake, w => w.z > 2.4);

  // rocío a ras del agua (escala con la cercanía) — solo sobre agua; sobre tierra levanta polvo
  const nSpray = alt < 2.8 ? 6 : alt < 4.5 ? 3 : alt < 7 ? 1 : 0;
  for (let i = 0; i < nSpray; i++) {
    const s = proj(plane.x + (Math.random() - 0.5) * 4, 0, PZ - Math.random() * 2);
    const onLand = onDirt;
    parts.push({
      x: s.x, y: s.y - 1, vx: (Math.random() - 0.5) * 70, vy: -(50 + Math.random() * 110) * (0.5 + lowI),
      life: 0.25 + Math.random() * 0.3, c: onLand ? (Math.random() < 0.6 ? '#6b6250' : '#4a4636') : (Math.random() < 0.7 ? P.foam : P.crest), r: 1 + Math.random() * 1.3
    });
  }
  if (alt < 4.5) run.shake = Math.max(run.shake, (4.5 - alt) * 0.3);

  // radar
  if (alt > RADAR_ALT) run.detection += dt / 1.4; else run.detection -= dt / 0.9;
  run.detection = Math.max(0, Math.min(1, run.detection));
  if (run.detection >= 1) {
    // OLEADAS QUE CRECEN SIN TECHO. Cada vez que el radar completa la carga dispara una tanda
    // mas grande que la anterior: 1, 1, 2, 2, 3, 3... y ademas RECARGA MAS RAPIDO (el residual
    // sube con cada oleada). Quedarse arriba deja de ser "un misil cada tanto" y se vuelve
    // insostenible por diseño — el castigo por volar alto no tiene tope, igual que el premio
    // por volar a ras no lo tiene.
    run.radarWave++;
    // CADA 3 OLEADAS se suma un misil. La cantidad no tiene techo, pero la cadencia SI: el
    // residual de la barra corta en 0.55, o sea ~0.6 s entre tandas como piso. Sin ese tope, la
    // cantidad y el ritmo crecian a la vez y a los 8 segundos habia 42 misiles en pantalla — eso
    // no es una escalada, es un muro (y ademas se come el frame). Con el tope, la presion sigue
    // creciendo sin fin pero de forma legible: siempre hay un hueco por donde salir.
    const n = 1 + Math.floor((run.radarWave - 1) / 3);
    run.detection = Math.min(0.55, 0.35 + (run.radarWave - 1) * 0.03);
    // TECHO DE OBJETOS EN VUELO, no de la oleada. El tamaño de la tanda sigue creciendo sin fin
    // (que es la idea), pero por encima de ~48 misiles simultaneos el frame se cae y cada uno
    // ademas siembra particulas de estela. A esa altura el jugador ya esta muerto: el tope no
    // cambia el desenlace, solo evita que el juego se arrastre mientras pasa.
    const room = Math.max(0, 48 - missiles.length);
    for (let i = 0; i < Math.min(n, room); i++) {
      // se abren en abanico: con varios misiles a la vez, salir del carril no alcanza
      const spread = n === 1 ? (Math.random() * 24 - 12) : (i / (n - 1) - 0.5) * (18 + n * 7);
      missiles.push({ x: plane.x + spread, y: plane.y + 4, z: 230 + i * 6, done: false });
    }
    // AVISO. La primera vez, el mensaje completo — el jugador tiene que entender POR QUE lo
    // atacan. De ahi en mas, solo el tamaño de la oleada, que es el dato que cambia.
    if (!run.radarSeen) {
      run.radarSeen = true;
      popup(W / 2, 46, T('radarLock'), P.warn);
      popup(W / 2, 56, T('radarLock2'), P.accent);
    } else if (n > 1) popup(W / 2, 46, T('radarWave', { n }), P.warn);
    run.shake = Math.min(7, run.shake + 1 + n * 0.5);
    beep(880, 0.12, 'square', 0.06); setTimeout(() => beep(880, 0.12, 'square', 0.06), 160);
  }

  // cañón
  run.fireT -= dt;
  run.heat -= dt * (inp.fire ? GUN_COOL_FIRE : GUN_COOL_IDLE);
  if (run.heat < 0) run.heat = 0;
  if (run.overheat && run.heat < GUN_RESET) run.overheat = false;
  if (inp.fire && !run.overheat && run.fireT <= 0 && mvAllowsFire()) {
    run.fireT = 1 / 9; stats.shots++;   // denominador de la PRECISION del recuento
    const vm = deps.viewMouse();
    // DOS CAÑONES, uno por lado, TURNANDOSE. Antes salia todo de un punto en el centro del avion.
    // Se alterna en vez de disparar los dos juntos a proposito: asi la cadencia, el daño y la
    // PRECISION del recuento (hits/shots) quedan exactamente iguales que antes — lo unico que
    // cambia es de donde sale cada trazadora. A 9 tiros por segundo se ven los dos chorros.
    gunSide = -gunSide;
    const bx = plane.x + gunSide * GUN_X;
    // Las dos lineas CONVERGEN en el punto apuntado, como un armamento reglado de verdad: salen
    // separadas del avion y se juntan alla adelante.
    let tx, ty;
    if (vm.on) {
      // MIRA CON MOUSE (PC): desproyecta el cursor al mundo a z=110. La bala SALE DEL CAÑON
      // y vuela en linea RECTA 3D que pasa por el punto apuntado (trayectoria balistica,
      // no lerp: se ve nacer en el avion y viajar hacia la mira)
      const k = F / 110;
      tx = Math.max(-40, Math.min(40, (vm.x - W / 2) / k + cam.x));
      ty = Math.max(0, cam.y - (vm.y - HOR) / k);
    } else {
      // tactil/legacy: apuntado vertical automatico al blanco aereo mas cercano del carril
      tx = plane.x; ty = plane.y;
      let td = 5.6;
      for (const o of obstacles) {
        if (o.hp === undefined || o.z <= PZ + 3 || o.z > 210) continue;
        const d = Math.abs(o.x - plane.x);
        if (d < td) { td = d; ty = o.y; }
      }
    }
    bullets.push({ x: bx, y: plane.y, z: PZ + 3, x0: bx, y0: plane.y, z0: PZ + 3, tx, ty, path: true });
    run.heat += GUN_HEAT_SHOT;
    if (run.heat >= 1) { run.overheat = true; beep(140, 0.3, 'sawtooth', 0.05); }
    else if (!sfxSrc('gun')) beep(1100 + Math.random() * 300, 0.04, 'square', 0.028);   // web: beep; escritorio: loop de metralla
  }

  // misiles del jugador: cooldown, recarga lenta y lanzamiento (tecla Z / botón táctil)
  run.mslCd -= dt;
  if (run.msl < MSL_MAX) { run.mslRegen += dt; if (run.mslRegen >= 7) { run.mslRegen = 0; run.msl++; } }
  if (inp.msl) deps.launchMissile();

  return false;
}
