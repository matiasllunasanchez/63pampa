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
import { obstacles, soldiers, bullets, missiles, pmissiles, parts, prune } from '../core/world.js';
import { proj, popup, explodeAt, bloodBurst } from '../core/fx.js';
import { sfxOne, beep, boom } from '../systems/audio.js';
import { T } from '../core/i18n.js';
import { P } from '../data/palette.js';
import { PZ } from '../render/ctx.js';
import { AA_Z0, AA_Z1, AA_CD, shoreAt, SAND_W } from '../data/tuning.js';

/** Golpe NO letal (nube de explosion, bandada): sacude, frena y quema combustible — castiga sin
 *  derribar. El daño real del juego sigue siendo binario (chocar = morir); esto es friccion. */
function softHit(msgKey) {
  run.spd = Math.max(34, run.spd * 0.86);
  run.fuel = Math.max(0, run.fuel - 4);
  run.shake = Math.min(7, run.shake + 3.2);
  const s = proj(plane.x, plane.y, PZ);
  popup(s.x, s.y - 14, T(msgKey), P.warn);
  boom(0.1); sfxOne('waveFly');
}

export function collisionSystem(dt) {
  // soldados: corren y se acercan; atropellarlos a ras del suelo = MUCHÍSIMOS puntos
  for (const sd of soldiers) {
    if (sd.dead) continue;
    sd.z -= run.spd * dt;
    sd.x += sd.dir * (sd.v || 6) * dt;                        // corren en diagonal (costa: mas rapido)
    if (sd.z <= PZ + 1 && sd.z > PZ - 4 && Math.abs(plane.x - sd.x) < 4 && plane.y < 3) {
      sd.dead = true;                                        // pase rasante: cabeza / impacto de aire (banda 0.5–3)
      sfxOne('body');                                        // impacto de cuerpo (una variante al azar)
      const pts = Math.round(120 * run.multShow);                // escala con el multiplicador (a ras = brutal)
      run.score += pts; stats.soldiers++;
      const s = proj(sd.x, 0, PZ); popup(s.x, s.y - 10, '+' + pts, P.warn);
      bloodBurst(s.x, s.y, 18);                               // sangre + tierra
      run.bloodSplat = Math.min(1, run.bloodSplat + 0.5);             // mancha el sprite (se desvanece)
      run.shake = Math.min(6, run.shake + 1.2); boom(0.05);
    }
  }
  prune(soldiers, sd => sd.z > -6 && !sd.dead);

  // obstáculos
  for (const o of obstacles) {
    o.z -= (run.spd + (o.type === 'jet' ? 45 : 0)) * dt;   // el avion enemigo viene de frente: cierra mas rapido
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
          return { death: 'death_bomb' };
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
      const air = o.type === 'helo' || o.type === 'jet';
      const tall = o.type === 'mast' || o.type === 'tree';   // obstáculo vertical fijo
      // ESTRUCTURAS del desembarco (costa/tierra): cajas apoyadas en el suelo, centro a h/2
      const struct = o.type === 'tent' || o.type === 'aa' || o.type === 'bldg' || o.type === 'lcu' || o.type === 'radar' || o.type === 'aatruck';
      const STRUCT_HW = { tent: 2.4, aa: 1.7, bldg: 3.0, lcu: 3.6, radar: 2.4, aatruck: 2.6 };
      let hw, hh, oy;
      if (tall) { hw = o.type === 'tree' ? 1.4 : 0.9; hh = o.h; oy = o.h / 2; }   // árbol un poco más ancho (copa)
      else if (struct) { hw = STRUCT_HW[o.type]; hh = o.h / 2 + 0.4; oy = o.h / 2; }
      else { hw = air ? 3 : 2.6; hh = air ? 1.6 : 1.9; oy = o.y; }
      // perfil del avion AFINADO (antes 2.6×1.2, chocaba "de lejos"); en PIRUETA las alas
      // van de canto → perfil minimo: pasa por espacios mucho mas finos
      const pw = run.rollT > 0 ? 1.0 : 2.1, ph2 = run.rollT > 0 ? 0.7 : 1.0;
      const dx = Math.abs(plane.x - o.x) - (hw + pw);
      const dy = Math.abs(plane.y - oy) - (hh + ph2);
      const hullHit = tall && Math.abs(plane.x - o.x) < 5 + pw && plane.y < 3.6;
      if (o.type === 'fuel') {
        if (dx < 1.5 && dy < 1.5) {
          run.fuel = Math.min(100, run.fuel + 30); stats.fuelPicks++;
          const s = proj(o.x, o.y, PZ); popup(s.x, s.y, T('pickFuel'), P.foam);
          beep(700, 0.1, 'triangle', 0.05, 1000); o.z = -99;
        }
      } else if ((dx < 0 && dy < 0) || hullHit) {
        if (o.type === 'tent') {
          // la carpa es lona: atravesarla no mata — la ARRASA, con premio (juego rasante puro)
          const pts = Math.round(200 * run.multShow);
          run.score += pts; stats.air++; run.shake = Math.min(6, run.shake + 2);
          const s = proj(o.x, 1, PZ); popup(s.x, s.y - 10, T('tentDown') + ' +' + pts, P.warn);
          explodeAt(o.x, 1, PZ, false); sfxOne('exXsmall');
          o.z = -99; o.done = true;
        } else return { death: o.type === 'mast' ? 'death_mast' : o.type === 'tree' ? 'death_tree'
          : o.type === 'aa' || o.type === 'aatruck' ? 'death_aagun' : o.type === 'radar' ? 'death_radar'
          : o.type === 'bldg' ? 'death_bldg' : o.type === 'lcu' ? 'death_lcu'
          : o.type === 'helo' ? 'death_helo' : o.type === 'jet' ? 'death_jet' : 'death_balloon' };
      } else if (dx < 3 && dy < 3) {
        const pir = run.rollT > 0;                       // rozar EN PIRUETA: bonus grande (estilo)
        run.score += pir ? 250 : 75; stats.grazes++; run.shake = Math.min(6, run.shake + 1.5);
        sfxOne('waveFly');                           // rafaga de aire del pase cercano
        const s = proj(o.x, oy, PZ); popup(s.x, s.y - 8, pir ? T('rollGraze') : T('graze'), pir ? P.accent : P.foam);
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
      if (Math.abs(plane.x - m.x) < (run.rollT > 0 ? 1.6 : 3) && Math.abs(plane.y - m.y) < (run.rollT > 0 ? 1.2 : 2.2)) return { death: m.tracer ? 'death_gunfire' : 'death_missile' };
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
