// BALANCE DE LAS DEFENSAS DEL BUQUE (docs/sistemas/PLAN_DEFENSAS_BUQUE.md, F6) — en Node, contra el
// integrador real.
//
// POR QUE EN NODE y no piloteando el juego (memoria del proyecto: "medir en Node, no en el juego"): las
// sondas de Electron miden UNA corrida cada vez y se ensucian con el relevo, la radio y la CPU. Aca la
// defensa es LA MISMA — se importan systems/seawolf.js (el ciclo de los lanzadores), systems/artilleria.js
// (el 4,5" y los montajes) y el armamento real (core/blanco.js + data/armamento.js) — y lo unico copiado
// es el GUIADO de los misiles y las trazadoras y su juicio de impacto, de systems/collision.js (las dos
// ramas: 'wolf' y la de las trazadoras). Si se toca alla, se toca aca.
//
// Lo que se simula: la escuadrilla contra el buque, de 1400 a la ventana de suelta (175), sin la bomba.
// Cada impacto es un avion menos (dmgMode 'squad', el de fabrica) y lo RELEVA EL SIGUIENTE EN EL LUGAR,
// como en el juego (game.js, estado 'relevo'): RELEVO_DUR (3 s) sin defensa, con el mundo avanzando al
// 40 %, y los misiles en el aire se van detras del que cae. Dos mediciones:
//   LA APROXIMACION   cuantos aviones cuesta llegar a la ventana (y si llega alguno de los 4)
//   LA SEGUNDA PASADA el que viene despues de un ERRADO re-encara desde lejos contra el buque como lo
//                     dejo el primero — ahi se ve lo que vale haberlo cañoneado (los sistemas PERSISTEN)
//
// Cuatro formas de volar (el jugador):
//   derecho     sin moverse de costado
//   vibora      de lado a lado, cambiando cada 0,7 s
//   reactivo    derecho, y quiebra cuando ve venir algo (un misil, una columna)
//   cañonea     se pone frente a la pieza mas peligrosa y la cañonea desde 600 (con el cañon de su
//               avion, 9 tiros/s), quebrando igual si algo se le viene encima
//
// Uso: node tools/balance_defensas.js [corridas=300] [spd=90]
import { plane } from '../src/core/state.js';
import { run } from '../src/core/run.js';
import { missiles } from '../src/core/world.js';
import { blanco, resetBlanco, armarSistemas, cajaSistema } from '../src/core/blanco.js';
import { SHIP_CLASS } from '../src/data/ships.js';
import { DEFENSAS } from '../src/data/defensas.js';
import { SISTEMAS, estadoDe, topeCanon, CALIBRE } from '../src/data/sistemas_buque.js';
import { METRALLAS } from '../src/data/tuning.js';
import * as sw from '../src/systems/seawolf.js';
import * as art from '../src/systems/artilleria.js';
import { RELEVO_DUR } from '../src/core/squad.js';

const N = +(process.argv[2] || 300), SPD = +(process.argv[3] || 90);
const PZ = 14, DT = 1 / 60, Z0 = 1400, VENTANA = 175, FILA = 4;
const VX = 30, ALT = 10, PASILLO = 34;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Un cuadro de los misiles enemigos: el guiado y el impacto de systems/collision.js. true = te pego. */
function misiles(dt) {
  let pego = false;
  for (const m of missiles) {
    if (m.done) continue;
    if (m.tipo === 'wolf') {
      const D = DEFENSAS[m.def] || DEFENSAS.wolf;
      m.z -= (run.spd + D.vel) * dt;
      if (!m.sinGuia && m.z - PZ > D.ciego * (m.ck || 1) && !(m.pierde && Math.sin(m.z * 0.045) > 0.35)) {
        const g = D.gana * (m.gk || 1);
        m.vx = clamp((D.copia ? plane.vx : 0) + (plane.x - m.x) * g, -D.lat, D.lat);
        m.vy = clamp((D.copia ? plane.vy || 0 : 0) + (plane.y - m.y) * g, -D.lat, D.lat);
      }
      m.x += (m.vx || 0) * dt; m.y += (m.vy || 0) * dt;
    } else {
      const trk = m.tracer ? 0.7 : 1;
      m.z -= (run.spd + (m.tracer ? 150 : 85)) * dt;
      m.x += clamp((plane.x + (m.ox || 0) - m.x) * 2.4 * trk, -20, 20) * dt;
      m.y += clamp((plane.y + (m.oy || 0) - m.y) * 2.0 * trk, -14, 14) * dt;
    }
    if (m.z <= PZ + 1.2) {
      m.done = true;
      if (Math.abs(plane.x - m.x) < 3 && Math.abs(plane.y - m.y) < 2.2) pego = true;
    }
  }
  for (let i = missiles.length - 1; i >= 0; i--) if (missiles[i].done || missiles[i].z <= 2) missiles.splice(i, 1);
  return pego;
}

/** La pieza que cañonea el que cañonea: la que mas mata primero (lanzadores), despues el resto. */
const PRIORIDAD = ['seacat_lanz', 'seawolf_lanz', 'seacat_dir', 'seawolf_910', 'canon_45', 'oerlikon', 'bofors'];
function blancoDeCanon() {
  for (const t of PRIORIDAD) {
    const s = blanco.sistemas.find(x => x.tipo === t && x.estado !== 'fuera' && !(SISTEMAS[t].soloBomba && x.estado === 'danado'));
    if (s) return s;
  }
  return null;
}

/** UNA APROXIMACION de la escuadrilla, de Z0 a la ventana, con `vidas` aviones. Devuelve cuantos se
 *  perdieron en el camino (`vidas` = no llego ninguno). */
function aproximacion(modo, calibre, vidas) {
  missiles.length = 0; sw.reset(); art.reset();
  blanco.z = blanco.zPrev = Z0;
  plane.x = (Math.random() - 0.5) * 10; plane.y = ALT; plane.vx = 0; plane.vy = 0;
  let lado = Math.random() < 0.5 ? 1 : -1, tLado = 0, alineado = 0, perdidos = 0, relevo = 0;
  let sigo = null, qDir = 0, qT = 0;          // el quiebre: contra QUE misil o columna, hacia donde, cuanto lleva
  const dps = METRALLAS[1].cad * CALIBRE[calibre] * 0.8;   // 9 tiros/s, el 80 % en la pieza alineada
  for (let t = 0; t < 90; t += DT) {
    // ---- EL RELEVO: sin defensa, el mundo al 40 % ----
    if (relevo > 0) {
      relevo -= DT;
      blanco.zPrev = blanco.z; blanco.z -= run.spd * 0.4 * DT;
      if (blanco.z <= VENTANA) return perdidos;
      continue;
    }
    blanco.zPrev = blanco.z; blanco.z -= run.spd * DT;
    if (blanco.z <= VENTANA) return perdidos;
    // ---- el piloto ----
    let quiere = 0;
    if (modo === 'vibora') { tLado += DT; if (tLado > 0.7) { tLado = 0; lado = -lado; } quiere = lado * VX; }
    const ve = modo === 'reactivo' || modo === 'cañonea';
    // EL QUIEBRE se sostiene hasta que lo que lo provoco paso de largo (un piloto no vuelve a la linea con
    // el misil todavia viniendo), con un tope; si la pared del pasillo lo frena, quiebra para el otro lado
    if (sigo && (qT > 1.6 || (sigo.z !== undefined && sigo.z - PZ <= 0) || sigo.done)) sigo = null;
    if (ve && !sigo) {
      // EL QUE CAÑONEA, mientras sostiene la rafaga, se banca las trazadoras (esquivarlas todas lo deja
      // pegado a la pared del pasillo y nunca alinea): quiebra solo por misiles y columnas
      const aguanta = modo === 'cañonea' && blanco.z < 600 && blanco.z > 260 && blancoDeCanon();
      for (const m of missiles) {
        if (aguanta && m.tracer) continue;
        const rz = m.z - PZ, D = m.tipo === 'wolf' ? DEFENSAS[m.def] : null;
        // el Sea Cat se ve venir de lejos; el Sea Wolf conviene quebrarlo en su tramo ciego; la trazadora, cerca
        const vista = D ? (m.def === 'cat' ? 320 : 130) : 110;
        if (rz > 0 && rz < vista && Math.abs(m.x - plane.x) < 8) { sigo = m; qT = 0; qDir = Math.sign(plane.x - m.x) || 1; break; }
      }
      if (!sigo) for (const c of art.snapshot().cols) {
        if (c.z - PZ > 0 && c.z - PZ < 90 && Math.abs(c.x - plane.x) < 6) { sigo = { z: c.z, col: c }; qT = 0; qDir = Math.sign(plane.x - c.x) || 1; break; }
      }
    }
    if (process.env.DBG && modo === 'cañonea' && blanco.sistemas[4] && blanco.sistemas[4].tipo === 'seacat_lanz' && blanco.z < 620 && blanco.z > 250 && Math.round(t * 60) % 6 === 0)
      console.log('F', blanco.z | 0, 'x', plane.x.toFixed(1), sigo ? (sigo.col ? 'COL' : sigo.tracer ? 'TRZ' : 'MIS:' + sigo.def) : '-', blanco.sistemas[4].dano.toFixed(1), 'perd', perdidos, 'rel', relevo > 0);
    if (sigo) {
      qT += DT; if (sigo.col) sigo.z -= run.spd * DT;
      if (Math.abs(plane.x) > PASILLO - 2 && Math.sign(plane.x) === qDir) qDir = -qDir;
      quiere = qDir * VX;
    } else if (modo === 'cañonea' && blanco.z < 600 && blanco.z > 260) {
      const s = blancoDeCanon();
      if (s) {
        const c = cajaSistema(s), dx = c.x - plane.x;
        quiere = clamp(dx * 6, -VX, VX);
        if (Math.abs(dx) < c.hx) {
          alineado += DT;
          if (alineado > 0.3) {               // la rafaga tarda en llegar: lo primero que sale todavia vuela
            s.dano = Math.min(topeCanon(s.tipo), s.dano + dps * DT);
            s.estado = estadoDe(s.tipo, s.dano);
          }
        } else alineado = 0;
      }
    } else if (modo === 'reactivo' || modo === 'cañonea') quiere = clamp(-plane.x * 0.8, -VX, VX);
    plane.vx += (quiere - plane.vx) * Math.min(1, DT * 10);
    plane.x = clamp(plane.x + plane.vx * DT, -PASILLO, PASILLO);
    // ---- el buque ----
    sw.step(DT, { activo: true, pz: PZ, plane });
    const ar = art.step(DT, { activo: blanco.sistemas.length > 0, pz: PZ, k: 1 });
    if ((ar && ar.golpe) || misiles(DT)) {
      perdidos++;
      if (perdidos >= vidas) return perdidos;
      relevo = RELEVO_DUR; missiles.length = 0; sigo = null;
      plane.x = (Math.random() - 0.5) * 10; plane.vx = 0;
    }
  }
  return perdidos;
}

/** Una salida contra `nombre`: la aproximacion de la escuadrilla y, si llego alguno, la SEGUNDA PASADA
 *  (el siguiente, tras un errado, contra el buque como quedo). `respaldo`: como era antes del plan (una
 *  defensa del centro, sin sistemas ni artilleria). */
function salida(nombre, { defensa, iniciales, respaldo, modo, calibre }) {
  resetBlanco(true, nombre, SHIP_CLASS[nombre]);
  if (!respaldo) armarSistemas(nombre, iniciales);
  sw.poner(defensa);
  run.spd = SPD; run.defK = 1;
  const p1 = aproximacion(modo, calibre, FILA);
  const fuera = blanco.sistemas.filter(s => s.estado === 'fuera').length;
  const p2 = p1 < FILA - 1 ? aproximacion(modo === 'cañonea' ? 'reactivo' : modo, calibre, FILA - p1 - 1) : null;
  return { p1, p2, fuera };
}

const BUQUES = [
  ['ARDENT (t16)', 'HMS ARDENT', { defensa: 'cat' }],
  ['ARDENT (r3, Sea Cat fuera)', 'HMS ARDENT', { defensa: 'cat', iniciales: [{ tipo: 'seacat_lanz', estado: 'fuera' }] }],
  ['PLYMOUTH (r4)', 'HMS PLYMOUTH', { defensa: 'cat' }],
  ['GLASGOW (r2, Brilliant 910 dañado)', 'HMS GLASGOW', { defensa: 'wolf', iniciales: [{ escolta: true, tipo: 'seawolf_910', estado: 'danado' }] }],
  ['COVENTRY (+Broadsword)', 'HMS COVENTRY', { defensa: 'wolf' }],
  ['BROADSWORD', 'HMS BROADSWORD', { defensa: 'wolf' }],
  ['SIR GALAHAD', 'RFA SIR GALAHAD', { defensa: 'cat' }],
];
const MODOS = ['derecho', 'vibora', 'reactivo', 'cañonea'];

function medir(nombre, o, modo, calibre) {
  let p1 = 0, llega = 0, limpio = 0, fuera = 0, n2 = 0, limpio2 = 0;
  for (let i = 0; i < N; i++) {
    const r = salida(nombre, Object.assign({}, o, { modo, calibre }));
    p1 += r.p1; if (r.p1 < FILA) llega++; if (r.p1 === 0) limpio++;
    fuera += r.fuera;
    if (r.p2 !== null) { n2++; if (r.p2 === 0) limpio2++; }
  }
  return { perd: +(p1 / N).toFixed(2), llega: Math.round(100 * llega / N), limpio: Math.round(100 * limpio / N),
    limpio2: n2 ? Math.round(100 * limpio2 / n2) : null, fuera: +(fuera / N).toFixed(1) };
}

const pad = (s, n) => String(s).padEnd(n);
const celda = (r, m) => pad(`${r.perd} · ${r.limpio}% · ${r.limpio2 === null ? '-' : r.limpio2 + '%'}` + (m === 'cañonea' ? ` · ${r.fuera}` : ''), 24);
console.log(`\nBALANCE DE LAS DEFENSAS — ${N} salidas de ${FILA} aviones por caso, a ${SPD} u/s, aproximacion ${Z0} → ${VENTANA}`);
console.log('perd = aviones perdidos en la aproximacion · limpia = llega SIN perder ninguno · 2ª = la segunda pasada (tras un errado) llega limpia · fuera = piezas sacadas\n');
console.log(pad('buque', 30) + MODOS.map(m => pad(m + ' (perd·limpia·2ª)', 24)).join(''));
for (const [rot, nombre, o] of BUQUES) {
  for (const cual of ['antes', 'ahora']) {
    const cs = MODOS.map(m => cual === 'antes' && m === 'cañonea' ? pad('—', 24)
      : celda(medir(nombre, Object.assign({}, o, { respaldo: cual === 'antes' }), m, '20'), m));
    console.log(pad(cual === 'antes' ? rot : '  ahora', 30) + cs.join(''));
  }
}
console.log('\ncañonea: 20 mm (A-4) vs 30 mm (Dagger) — perd · limpia · 2ª · fuera');
for (const [rot, nombre, o] of BUQUES.slice(0, 3)) {
  console.log('  ' + pad(rot, 28) + '20: ' + celda(medir(nombre, o, 'cañonea', '20'), 'cañonea') + '30: ' + celda(medir(nombre, o, 'cañonea', '30'), 'cañonea'));
}
