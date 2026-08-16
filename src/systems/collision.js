// COLISIONES: resuelve todo lo que se toca en un frame de vuelo y reparte el puntaje.
//
// En orden: soldados (atropello a ras), obstaculos (choque letal / roce / bidon), misiles
// enemigos (esquive o muerte), balas propias (contra aeronaves, misiles y soldados) y misiles
// del jugador (blancos aereos + splash en tierra).
//
// REGLA DEL LIMITE: no mata al avion directamente. Cuando un choque seria fatal DEVUELVE una
// señal { death: causa } y el orquestador (game.js) llama a die(). Asi el modulo no depende del
// flujo de muerte, que vive en otro lado. Sin choque fatal devuelve false.

import { plane, cfg, stats } from '../core/state.js';
import { run } from '../core/run.js';
// AVERIAS: los impactos por DISPARO (bomba, misil, trazadora) pueden no matar, segun el modelo
// de vida elegido en OPCIONES. Chocar algo sigue matando siempre — ver core/damage.js.
import * as dmg from './damage.js';
import { obstacles, soldiers, bullets, missiles, pmissiles, parts, prune } from '../core/world.js';
import { proj, popup, explodeAt, bloodBurst } from '../core/fx.js';
import { sfxOne, beep, boom } from '../systems/audio.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { PZ } from '../render/ctx.js';
import { AA_Z0, AA_Z1, AA_CD, shoreAt, SAND_W, SPAWN_X,
  OLA_SPD, OLA_FACE_KILL, OLA_SCRAPE_FRAC } from '../data/tuning.js';
// LAS OLAS USAN EL ROCE QUE YA EXISTE, no uno nuevo (SPEC_AGUA_OLAS §6.1): `scrapeLimit` es la
// misma funcion que mide el margen contra el agua en el vuelo normal, y por eso `npm run feel`
// sigue dando los mismos numeros — la ola no recalibra nada, solo adelanta donde esta el agua.
import { scrapeLimit } from '../core/physics.js';
// y la ALTURA se evalua contra el mismo bulto que dibuja el mar: una sola fuente de verdad
import { olaBump } from '../core/sea.js';
import { hitbox, planeBox, hullReach, HULL_Y, SOLDIER, isSoftStruct } from '../core/hitbox.js';
import { mvTight } from '../data/moves.js';

/** Golpe NO letal (nube de explosion, bandada): sacude, frena y quema combustible — castiga sin
 *  derribar. El daño real del juego sigue siendo binario (chocar = morir); esto es friccion. */
function softHit(msgKey, f) {
  const m = f === undefined ? 1 : f;                 // intensidad: 1 = onda expansiva / bandada
  run.spd = Math.max(34, run.spd * (1 - 0.14 * m));
  run.fuel = Math.max(0, run.fuel - 4 * m);
  run.shake = Math.min(7, run.shake + 3.2 * m);
  if (msgKey) {                                      // los golpes chicos no ensucian con popup
    const s = proj(plane.x, plane.y, PZ);
    popup(s.x, s.y - 14, T(msgKey), P.warn);
  }
  boom(0.1 * m); if (m > 0.5) sfxOne('waveFly');
}

export function collisionSystem(dt) {
  // soldados: corren y se acercan; atropellarlos a ras del suelo = MUCHÍSIMOS puntos
  for (const sd of soldiers) {
    if (sd.dead) continue;
    if (sd.prone > 0) { sd.prone -= dt; sd.z -= run.spd * dt; continue; }   // cuerpo a tierra: no corre
    sd.z -= run.spd * dt;
    sd.x += sd.dir * (sd.v || 6) * dt;                        // corren en diagonal (costa: mas rapido)
    if (sd.z <= PZ + SOLDIER.zFront && sd.z > PZ - SOLDIER.zBack
      && Math.abs(plane.x - sd.x) < SOLDIER.hw + planeBox(run.rollT > 0 || mvTight(run.mv)).pw && plane.y < SOLDIER.top) {
      sd.dead = true;                                        // pase rasante: cabeza / impacto de aire
      sfxOne('body');                                        // impacto de cuerpo (una variante al azar)
      const pts = Math.round(120 * run.multShow);                // escala con el multiplicador (a ras = brutal)
      run.score += pts; stats.soldiers++;
      const s = proj(sd.x, 0, PZ); popup(s.x, s.y - 10, '+' + pts, P.warn);
      bloodBurst(s.x, s.y, 18);                               // sangre + tierra
      run.bloodSplat = Math.min(1, run.bloodSplat + 0.5);             // mancha el sprite (se desvanece)
      // ARRASAR CUESTA: cada cuerpo golpea la celula. Es poquito (0.12 de un golpe normal), pero
      // se acumula — una pasada larga sobre una columna te deja sin nafta y sin velocidad. El
      // puntaje sigue siendo altisimo: es un canje, no un castigo.
      softHit(null, 0.12);
      // los de al lado SE TIRAN AL SUELO: ven venir el avion y se cubren. Ademas de leerse bien,
      // los saca de la carrera un momento (dejan de correr y de poder ser atropellados).
      for (const o2 of soldiers) {
        if (o2 === sd || o2.dead || o2.prone > 0) continue;
        if (Math.abs(o2.z - sd.z) < 16 && Math.abs(o2.x - sd.x) < 11 && Math.random() < 0.7)
          o2.prone = 1.1 + Math.random() * 1.2;
      }
    }
  }
  prune(soldiers, sd => sd.z > -6 && !sd.dead);

  // obstáculos
  for (const o of obstacles) {
    // el jet viene de frente (cierra mas rapido) y la OLA RUEDA hacia vos: su velocidad propia se
    // SUMA a la relativa, que es lo que hace que una ola se te venga encima aunque frenes
    o.z -= (run.spd + (o.type === 'jet' ? 45 : o.type === 'ola' ? OLA_SPD : 0)) * dt;
    // BOMBA cayendo: baja hasta el suelo y ahi se convierte en HONGO (obstaculo de nube)
    if (o.type === 'bomb' && o.y > 0) {
      o.y -= o.vy * dt;
      if (o.y <= 0.4) {
        o.y = 0; o.type = 'boom'; o.boomT = 0;
        explodeAt(o.x, 0, o.z, true); run.shake = Math.min(7, run.shake + (o.z < 90 ? 3 : 1.2));
        sfxOne('exXheavy');   // el bombardeo es lo mas fuerte que suena en el juego
        for (const sd of soldiers) {                        // la explosion barre soldados cercanos
          if (!sd.dead && Math.abs(sd.z - o.z) < 9 && Math.abs(sd.x - o.x) < 8) {
            sd.dead = true; const ss = proj(sd.x, 0, sd.z); bloodBurst(ss.x, ss.y, 6);
          }
        }
      }
    }
    if (o.type === 'boom' || o.type === 'airboom') o.boomT += dt;   // el hongo / la bola crecen y se disipan
    if (o.type === 'birds') o.x += o.bvx * dt;              // la bandada deriva
    // MOVIMIENTO PROPIO (cfg.enemyMove): la personalidad se sortea en spawn.js (sway / drive /
    // home) y aca solo se APLICA — con la llave del menu apagada quedan plantados donde nacieron.
    if (cfg.enemyMove) {
      if (o.mvA) o.x = o.xa + Math.sin(run.t * o.mvW + o.ph) * o.mvA;   // oscila alrededor del ancla
      if (o.home && o.z > PZ + 10) {
        // el caza corrige el ANCLA hacia tu carril (tope o.home u/s). El tejido sinusoidal va
        // encima: no es un misil que clava el rumbo, es un avion que se te cruza.
        o.xa += Math.max(-o.home, Math.min(o.home, (plane.x - o.xa) * 0.9)) * dt;
      }
      if (o.vx) {
        o.x += o.vx * dt;
        // rebote en los bordes del carril: los vehiculos de la costa no se meten al agua, y la
        // fragata (mast) y los de tierra rebotan en el limite de spawn
        const right = (o.type === 'radar' || o.type === 'aatruck') && cfg.terrain === 'coast'
          ? shoreAt(run.dist + o.z) - SAND_W - 2 : SPAWN_X;
        if (o.x > right) { o.x = right; o.vx = -Math.abs(o.vx); }
        else if (o.x < -SPAWN_X) { o.x = -SPAWN_X; o.vx = Math.abs(o.vx); }
      }
    }
    // BARCAZA navegando: entra de la derecha hacia la playa; al TOCAR la costa encalla y
    // desembarca su patrulla (que sale corriendo hacia la izquierda)
    if (o.type === 'lcu' && o.sailing) {
      o.x -= 7 * dt;
      const sh = shoreAt(run.dist + o.z);
      if (o.x <= sh + 1.5) {
        o.sailing = false; o.beached = true;
        for (let i = 0; i < 2 + (Math.random() * 3 | 0); i++) soldiers.push({
          x: sh - SAND_W - 1 - Math.random() * 4, z: o.z + (Math.random() * 14 - 7),
          ph: Math.random() * 6, dir: -1, v: 9,
        });
      }
    }
    if (!o.done && o.z <= PZ + 1.5) {
      o.done = true;
      // --- especiales sin colision dura ---
      // LA OLA (SPEC_AGUA_OLAS F1). Tres desenlaces, y el del medio es la regla de oro del plan:
      // rozar la CRESTA no mata. Lo que mata es la CARA — el frente por debajo de OLA_FACE_KILL.
      // Sin el roce generoso la mecanica es injusta, porque la ola tapa el horizonte justo cuando
      // hay que decidir.
      //
      // La altura se evalua contra el MISMO bulto que dibuja el mar (olaBump de core/sea.js), no
      // contra una caja: lo que ves es lo que te mata. Y en la brecha el bulto YA vale casi cero,
      // asi que pasar por el hueco sale gratis sin un solo `if` extra.
      if (o.type === 'ola') {
        const hAqui = olaBump(o, plane.x - o.x, 0);
        if (hAqui > 0.25) {
          if (plane.y < hAqui * OLA_FACE_KILL) return { death: 'death_sea' };
          if (plane.y < hAqui + 1.2) {
            // CRESTA: cepillarla cuesta margen de roce — el sistema que ya existe (core/physics),
            // no uno nuevo. Si el margen ya estaba gastado, esta te cobra la cuenta.
            run.scrapeT += scrapeLimit(run.spd, run.boost) * OLA_SCRAPE_FRAC;
            if (run.scrapeT >= scrapeLimit(run.spd, run.boost)) return { death: 'death_sea' };
            run.shake = Math.min(7, run.shake + 2.2);
            const sp = proj(plane.x, plane.y, PZ);
            for (let i = 0; i < 14; i++) parts.push({
              x: sp.x + (Math.random() - 0.5) * 26, y: sp.y + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 90, vy: -(30 + Math.random() * 70),
              life: 0.45 + Math.random() * 0.35, c: Math.random() < 0.6 ? P.foam : P.crest,
              r: 1.4 + Math.random(),
            });
            if (!sfxOne('waterNear')) boom(0.10);
          }
        }
        continue;                                                     // mas arriba: paso limpio
      }
      if (o.type === 'trench') continue;                              // decorado puro
      if (o.type === 'birds') {                                       // la bandada DAÑA, no derriba
        if (Math.abs(plane.x - o.x) < 4.5 && Math.abs(plane.y - o.y) < 2.6) softHit('hitBirds');
        continue;
      }
      if (o.type === 'bomb') {
        // bomba EN EL AIRE: chocarla la detona AHI y mata. La bola de fuego queda flotando a la
        // altura del impacto (airburst), no como el hongo que crece desde el suelo.
        if (Math.abs(plane.x - o.x) < 2.2 && Math.abs(plane.y - o.y) < 2.4) {
          o.type = 'airboom'; o.boomT = 0; o.done = false;   // se sigue dibujando tras la muerte
          explodeAt(o.x, o.y, o.z, true); sfxOne('exXheavy');
          if (dmg.takeHit('death_bomb')) return { death: 'death_bomb' };
          continue;
        }
        continue;
      }
      if (o.type === 'airboom') continue;                             // ya detonada: solo dibujo
      if (o.type === 'boom') {                                        // meterse en el hongo: daño
        // zona de daño acompaña al dibujo (que ahora es TRIPLE): alto 9→36, ancho ±10
        const top = 9 + Math.min(1, o.boomT / 1.1) * 27;
        if (o.boomT < 4.5 && Math.abs(plane.x - o.x) < 10 && plane.y < top) softHit('hitBlast');
        continue;
      }
      // Las medidas salen de core/hitbox.js — la MISMA fuente que usa el overlay de depuracion
      // (cfg.hitboxes). Si estuvieran duplicadas, el overlay podria mostrar una caja y el juego
      // usar otra.
      const { hw, hh, oy } = hitbox(o);
      const { pw, ph: ph2 } = planeBox(run.rollT > 0 || mvTight(run.mv));
      const dx = Math.abs(plane.x - o.x) - (hw + pw);
      const dy = Math.abs(plane.y - oy) - (hh + ph2);
      const reach = hullReach(o, hw);
      const hullHit = reach > 0 && Math.abs(plane.x - o.x) < reach + pw && plane.y < HULL_Y;
      if (o.type === 'fuel') {
        if (dx < 1.5 && dy < 1.5) {
          run.fuel = Math.min(100, run.fuel + 30); stats.fuelPicks++;
          const s = proj(o.x, o.y, PZ); popup(s.x, s.y, T('pickFuel'), P.foam);
          beep(700, 0.1, 'triangle', 0.05, 1000); o.z = -99;
        }
      } else if ((dx < 0 && dy < 0) || hullHit) {
        if (isSoftStruct(o) && o.type !== 'tent') {
          // COSA CHICA (nido de ametralladoras, antiaereo de campaña...): del tamaño de un
          // soldado, asi que la choca y sigue. Golpea fuerte pero no derriba — ver SOFT_H.
          run.score += Math.round(90 * run.multShow); stats.air++;
          explodeAt(o.x, o.h / 2, PZ, false); sfxOne('exXsmall');
          softHit('hitSmall', 0.55);
          o.z = -99; o.done = true;
        } else if (o.type === 'tent') {
          // la carpa es lona: atravesarla no mata — la ARRASA, con premio (juego rasante puro)
          const pts = Math.round(200 * run.multShow);
          run.score += pts; stats.air++; run.shake = Math.min(6, run.shake + 2);
          const s = proj(o.x, 1, PZ); popup(s.x, s.y - 10, T('tentDown') + ' +' + pts, P.warn);
          explodeAt(o.x, 1, PZ, false); sfxOne('exXsmall');
          o.z = -99; o.done = true;
        } else return { death: o.type === 'cliff' ? 'death_cliff'
          : o.type === 'mast' ? 'death_mast' : o.type === 'tree' ? 'death_tree'
          : o.type === 'tower' ? 'death_tower' : o.type === 'poles' ? 'death_wire'
          : o.type === 'flag' ? 'death_flag' : o.type === 'depot' ? 'death_depot'
          : o.type === 'aa' || o.type === 'aatruck' ? 'death_aagun' : o.type === 'radar' ? 'death_radar'
          : o.type === 'bldg' ? 'death_bldg' : o.type === 'lcu' ? 'death_lcu'
          : o.type === 'helo' ? 'death_helo' : o.type === 'jet' ? 'death_jet' : 'death_balloon' };
      } else if (dx < 3 && dy < 3) {
        const pir = run.rollT > 0 || mvTight(run.mv);    // rozar EN PIRUETA: bonus grande (estilo)
        const pts = pir ? 250 : 75;
        run.score += pts; stats.grazes++; run.shake = Math.min(6, run.shake + 1.5);
        sfxOne('graze');                                 // roza1/roza2: el premio sonoro del roce
        // SOLO EL NUMERO, en grande: el texto ("ROZASTE") ocupaba el ancho de media pantalla y
        // tapaba justo lo que venia detras del obstaculo que acabas de rozar.
        const s = proj(o.x, oy, PZ);
        popup(s.x, s.y - 8, '+' + pts, pir ? P.accent : P.foam, true);
        boom(0.06, true);
      }
    }
    // ANTIAEREO: dentro de su banda de tiro larga un misil guiado cada AA_CD segundos
    if ((o.type === 'aa' || o.type === 'aatruck') && !o.done && o.hp > 0 && o.z > AA_Z0 && o.z < AA_Z1) {
      o.cd -= dt;
      if (o.cd <= 0) {
        o.cd = AA_CD; o.fireT = run.t;
        missiles.push({ x: o.x, y: 2, z: o.z, done: false });
        beep(760, 0.1, 'square', 0.05);
      }
    }
    // TRINCHERA argentina (decorado): tira rafagas y cada tanto ABATE un britanico cercano.
    // No colisiona ni recibe balas — es el otro lado del desembarco, contando la batalla.
    if (o.type === 'trench' && o.z > 25 && o.z < 215) {
      o.cd -= dt;
      if (o.cd <= 0) {
        o.cd = 1.3 + Math.random() * 1.8; o.fireT = run.t;
        let victim = null;
        for (const sd of soldiers) {
          if (!sd.dead && sd.dir === -1 && Math.abs(sd.z - o.z) < 55) { victim = sd; break; }
        }
        if (victim && Math.random() < 0.55) {
          victim.dead = true;
          o.shot = { x: victim.x, z: victim.z, t: run.t };    // para el trazo del disparo (render)
          const ss = proj(victim.x, 0, victim.z); bloodBurst(ss.x, ss.y, 5);
        }
      }
    }
    // CAZA ARMADO (spawn.js sortea cuales): en su pasada de ataque suelta una rafaga corta de
    // trazadoras — las mismas del puesto: rapidas y casi rectas, se esquivan moviendose. La
    // banda de tiro (70-190) hace que dispare de lejos y las trazadoras te lleguen antes que el.
    if (o.type === 'jet' && o.gun > 0 && !o.done && o.hp > 0 && o.z > 70 && o.z < 190) {
      o.gcd -= dt;
      if (o.gcd <= 0) {
        o.gcd = 0.5; o.gun--; o.fireT = run.t;
        missiles.push({ x: o.x, y: o.y, z: o.z, done: false, tracer: true });
        beep(320, 0.05, 'square', 0.04);
      }
    }
    // PUESTO con soldados adentro: una rafaga corta de trazadoras (rapidas, casi rectas) que
    // hay que esquivar. Dispara pocas veces — es presion, no una lluvia.
    if (o.type === 'bldg' && o.armed && !o.done && o.hp > 0 && o.shots > 0 && o.z > 90 && o.z < 200) {
      o.cd -= dt;
      if (o.cd <= 0) {
        o.cd = 0.75; o.shots--; o.fireT = run.t;
        missiles.push({ x: o.x, y: o.h * 0.6, z: o.z, done: false, tracer: true });
        beep(300, 0.05, 'square', 0.04);
      }
    }
  }
  prune(obstacles, o => o.z > 2 && !((o.type === 'boom' || o.type === 'airboom') && o.boomT > 6));

  // misiles
  for (const m of missiles) {
    // trazadora (fuego de tierra): mas rapida y casi recta — se esquiva moviendose, no girando
    const trk = m.tracer ? 0.7 : 1;
    m.z -= (run.spd + (m.tracer ? 150 : 85)) * dt;
    m.x += Math.max(-20, Math.min(20, (plane.x - m.x) * 2.4 * trk)) * dt;
    m.y += Math.max(-14, Math.min(14, (plane.y - m.y) * 2.0 * trk)) * dt;
    if (!m.done && m.z <= PZ + 1.2) {
      m.done = true;
      if (Math.abs(plane.x - m.x) < (run.rollT > 0 || mvTight(run.mv) ? 1.6 : 3) && Math.abs(plane.y - m.y) < (run.rollT > 0 || mvTight(run.mv) ? 1.2 : 2.2)) {
        // TE PEGO. Con el modelo de vida por integridad puede que lo aguantes — pero aguantarlo
        // NO es esquivarlo: el `continue` es lo que impide que el impacto te pague los 75 puntos
        // y el cartel de ESQUIVASTE, que estaban abajo porque antes no habia forma de sobrevivir.
        const c = m.tracer ? 'death_gunfire' : 'death_missile';
        if (dmg.takeHit(c)) return { death: c };
        continue;
      }
      run.score += 75; stats.dodges++; const s = proj(m.x, m.y, PZ); popup(s.x, s.y - 8, T('dodgeMissile'), P.foam); boom(0.06, true);
    }
    if (Math.random() < 0.6) {
      const s = proj(m.x, m.y, m.z + 2);
      parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 0.45, c: P.dim, r: Math.max(1, s.k * 0.3) });
    }
  }
  prune(missiles, m => m.z > 2);

  // balas
  for (const b of bullets) {
    const z0 = b.z;
    b.z += 300 * dt;
    if (b.path) {
      // balistica recta (mira con mouse): interpola desde el AVION hacia el punto apuntado
      // en funcion del avance en z; pasa exacto por la mira a z=110 y sigue derecho
      const f = (b.z - b.z0) / (110 - b.z0);
      b.x = b.x0 + (b.tx - b.x0) * f;
      b.y = Math.max(0, b.y0 + (b.ty - b.y0) * f);
    } else if (b.ty !== undefined) b.y += (b.ty - b.y) * Math.min(1, dt * 14);
    for (const o of obstacles) {
      if (o.hp === undefined) continue;
      if (o.z < z0 - 2 || o.z > b.z + 2) continue;
      const oy = o.y, air = o.type === 'helo' || o.type === 'jet';
      if (Math.abs(b.x - o.x) < (air ? 5.6 : 3) && Math.abs(b.y - oy) < (air ? 3 : 2.4)) {
        o.hp--; o.hitT = run.t; b.z = 999; stats.hits++;   // hitT: lo lee el fogonazo del render
        if (o.hp <= 0) {
          const pts = o.type === 'helo' ? 300 : o.type === 'jet' ? 250
            : o.type === 'aa' || o.type === 'aatruck' ? 350 : o.type === 'radar' ? 300
            : o.type === 'tower' ? 300 : o.type === 'depot' ? 280 : o.type === 'flag' ? 120
            : o.type === 'bldg' ? 300 : o.type === 'lcu' ? 250 : 150;   // el AA es el blanco prioritario
          run.score += pts; stats.air++;
          sfxOne(air ? 'exMedium' : 'exXsmall');   // aeronaves: medium · blancos chicos: xsmall
          const s = proj(o.x, oy, o.z); popup(s.x, s.y - 8, '+' + pts);
          explodeAt(o.x, oy, o.z, air);
          o.z = -99; o.done = true;   // done=true: evita que el obstáculo muerto dispare la colisión del avión
        } else { beep(300, 0.05, 'triangle', 0.04); }
        break;
      }
    }
    if (b.z >= 999) continue;
    for (const m of missiles) {
      if (m.z < z0 - 2 || m.z > b.z + 2) continue;
      if (Math.abs(b.x - m.x) < 2.6 && Math.abs(b.y - m.y) < 2.2) {
        b.z = 999; run.score += 400; stats.hits++; stats.air++;
        const s = proj(m.x, m.y, m.z); popup(s.x, s.y - 8, '+400', P.warn);
        explodeAt(m.x, m.y, m.z, true);
        m.z = -99; m.done = true;   // done=true: evita que el misil enemigo derribado dispare la muerte del avión
        break;
      }
    }
    if (b.z >= 999) continue;
    // ametralla soldados en tierra: bala baja y alineada (por eso hay que estar de frente y a distancia)
    if ((cfg.terrain === 'land' || cfg.terrain === 'coast') && b.y < 4) {
      for (const sd of soldiers) {
        if (sd.dead || sd.z < z0 - 2 || sd.z > b.z + 2) continue;
        if (Math.abs(b.x - sd.x) < 2.6) {
          sd.dead = true; b.z = 999;
          const pts = Math.round(60 * (run.multShow >= 5 ? 2 : 1));
          run.score += pts; stats.hits++; stats.soldiers++; const s = proj(sd.x, 0, sd.z); popup(s.x, s.y - 8, '+' + pts, P.foam);
          bloodBurst(s.x, s.y, 8);
          beep(240, 0.05, 'square', 0.04); break;
        }
      }
    }
  }
  prune(bullets, b => b.z < 240);

  // MISILES DEL JUGADOR — viajan hacia el horizonte y destruyen blancos aéreos.
  // IMPORTANTE: nunca se chequean contra el hitbox del avión (no pueden causar la muerte del jugador).
  for (const pm of pmissiles) {
    const z0 = pm.z;
    pm.z += 360 * dt;
    pm.vy -= 26 * dt; pm.y += pm.vy * dt;                                     // caída/arco
    if (pm.tx !== undefined) pm.x += (pm.tx - pm.x) * Math.min(1, dt * 6);   // guiado leve al blanco
    if (Math.random() < 0.7) { const s = proj(pm.x, pm.y, pm.z - 3); parts.push({ x: s.x, y: s.y, vx: 0, vy: 0, life: 0.3, c: P.accent, r: Math.max(1, s.k * 0.35) }); }
    // impacto con obstáculos aéreos (hitbox amplio, one-shot)
    for (const o of obstacles) {
      if (o.hp === undefined || o.z < z0 - 4 || o.z > pm.z + 4) continue;
      if (Math.abs(pm.x - o.x) < 8 && Math.abs(pm.y - o.y) < 5) {
        const pts = (o.type === 'helo' ? 300 : o.type === 'jet' ? 250 : 150) + 100;   // +bonus por misil
        run.score += pts; stats.air++;
        const s = proj(o.x, o.y, o.z); popup(s.x, s.y - 8, '+' + pts, P.accent);
        explodeAt(o.x, o.y, o.z, true);
        o.z = -99; o.done = true; o.hp = 0;                 // done=true: no puede chocar al avión luego
        pm.z = 9999; break;
      }
    }
    if (pm.z >= 9999) continue;
    // intercepta misiles enemigos
    for (const m of missiles) {
      if (m.z < z0 - 4 || m.z > pm.z + 4) continue;
      if (Math.abs(pm.x - m.x) < 6 && Math.abs(pm.y - m.y) < 4) {
        run.score += 400; stats.air++;
        const s = proj(m.x, m.y, m.z); popup(s.x, s.y - 8, '+400', P.warn);
        explodeAt(m.x, m.y, m.z, true);
        m.z = -99; m.done = true; pm.z = 9999; break;
      }
    }
    if (pm.z >= 9999) continue;
    // sobre TIERRA: explota contra el suelo o cerca de soldados, con splash
    if (cfg.terrain === 'land' || cfg.terrain === 'coast') {
      let detonate = pm.y <= 0.3;
      if (!detonate) for (const sd of soldiers) { if (!sd.dead && Math.abs(sd.z - pm.z) < 6 && Math.abs(sd.x - pm.x) < 4) { detonate = true; break; } }
      if (detonate) {
        explodeAt(pm.x, 0, pm.z, true); run.shake = Math.min(6, run.shake + 1.6);
        let hit = 0;
        for (const sd of soldiers) {
          if (!sd.dead && Math.abs(sd.z - pm.z) < 11 && Math.abs(sd.x - pm.x) < 10) {
            sd.dead = true; hit++;
            const ss = proj(sd.x, 0, sd.z); bloodBurst(ss.x, ss.y, 7);
          }
        }
        if (hit) { const pts = hit * 130; run.score += pts; stats.soldiers += hit; const s = proj(pm.x, 0, pm.z); popup(s.x, s.y - 10, '+' + pts, P.warn); }
        pm.z = 9999;
      }
    }
  }
  prune(pmissiles, pm => pm.z < 240 && pm.y > -3);

  return false;
}
