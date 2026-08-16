// FEEDBACK VISUAL compartido: proyeccion y helpers de efecto que varios sistemas disparan.
//
// Todo esto lo usan el vuelo, las colisiones, el momentum Y el render. Vive aca (y no dentro de
// un sistema) porque solo toca stores + paleta + las medidas del mundo: no necesita el closure
// de game.js. Sacarlo del monolito es lo que permite que systems/collision.js sea un archivo.

import { cam, cfg } from './state.js';
import { run } from './run.js';
import { parts, popups, obstacles } from './world.js';
import { P } from '../data/palette.js';
import { recetaDe, CHUNKS_MAX, CHUNK_LIFE, SEC_N, SEC_T } from '../data/despiece.js';
import { W, HOR, F } from '../render/ctx.js';
import { boom, duck } from '../systems/audio.js';

/** Proyeccion pseudo-3D: mundo (x,y,z) → pantalla. Devuelve tambien `k` (escala en esa z).
 *  Es la primitiva mas usada del juego (~40 sitios): la lee todo el render y las colisiones. */
export function proj(x, y, z) {
  const k = F / z;
  return { x: W / 2 + (x - cam.x) * k, y: HOR + (cam.y - y) * k, k };
}

/** Texto flotante de feedback (puntaje, aviso) en coordenadas de mundo. */
export function popup(x, y, txt, c, big) {
  popups.push({ x, y, txt, c: c || P.accent, life: 1.1, big: !!big });
}

/** Explosion: reventon de particulas en (x,y,z) + sacudon de camara. `big` la agranda y agacha
 *  la musica un instante (ducking). */
export function explodeAt(x, y, z, big, noBall) {
  const s = proj(x, y, z);
  for (let i = 0, n = big ? 24 : 12; i < n; i++) {
    const a = Math.random() * 6.283, v = (14 + Math.random() * 55) * Math.min(1.6, s.k / 3 + 0.4);
    parts.push({
      x: s.x, y: s.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 15, life: 0.4 + Math.random() * 0.5,
      c: Math.random() < 0.6 ? P.accent : (Math.random() < 0.5 ? P.warn : P.dim), r: Math.max(1, s.k * 0.35)
    });
  }
  // BOLA DE FUEGO de frente. Se empuja como 'airboom' (el mismo tipo que usa la bomba reventada
  // en el aire) para reutilizar su reloj y su poda: ya se avanza en collision.js y en game.js.
  // `done: true` la deja fuera de toda colision — es puro dibujo.
  // `noBall`: el que llama pone su propia bola (el derribo usa una version PIXEL mas chica que
  // no tape los pedazos del avion) — aca quedan las chispas, el sacudon y el ducking.
  if (!noBall) obstacles.push({ type: 'airboom', x, y, z, boomT: 0, scale: big ? 0.85 : 0.42, done: true });
  run.shake = Math.min(6, run.shake + (big ? 4.5 : 2)); boom(big ? 0.16 : 0.08);
  if (big) duck(0.55);                      // explosion grande → ducking de la musica
}

// ---------------- EL DESPIECE (PLAN_DESTRUCCION D0) ----------------
//
// El derribo del jugador ya tenia el sistema bueno — pedazos con inercia que caen, rebotan y
// quedan humeando — pero era EXCLUSIVO del jugador: todo lo demas moria desvaneciendose. Esto lo
// generaliza sin reinventarlo: es el MISMO tipo 'chunk', la misma fisica y el mismo dibujo; lo
// unico nuevo es que la receta (cuantos, de que tamaño y color) sale de data/despiece.js.

/** Cuantos pedazos vivos hay ahora mismo. */
const chunksVivos = () => { let n = 0; for (const o of obstacles) if (o.type === 'chunk') n++; return n; };

/** Hace lugar para `n` pedazos nuevos: envejece los MAS VIEJOS hasta el borde de su vida, que es
 *  como se disuelven sin desaparecer de golpe. El cap manda sobre el espectaculo (§4.4) — pero al
 *  que acaba de morir NUNCA se le niega el despiece: se le quita lugar al que ya se estaba yendo. */
function hacerLugar(n) {
  let sobran = chunksVivos() + n - CHUNKS_MAX;
  if (sobran <= 0) return;
  const vivos = obstacles.filter(o => o.type === 'chunk');
  vivos.sort((a, b) => b.chunkT - a.chunkT);                 // los mas viejos primero
  // EL CAP ES DURO, y se cobra ACA y no en el prune del cuadro: envejecer al viejo y esperar a que
  // lo barra el filtro no alcanza — entre dos muertes casi simultaneas no siempre hay un cuadro en
  // el medio, y el tope se pasaba largamente (medido: 147 pedazos vivos con tope 60, y 78 despues
  // de un primer intento). Sacarlos de la lista es lo unico que garantiza el presupuesto (§4.4).
  for (let i = 0; i < vivos.length && sobran > 0; i++, sobran--) {
    const k = obstacles.indexOf(vivos[i]);
    if (k >= 0) obstacles.splice(k, 1);
  }
}

/** DESPIEZA un objeto: lo convierte en escombro segun su receta.
 *
 *  @param o    el obstaculo que muere (de ahi salen tipo y posicion)
 *  @param imp  el IMPULSO del que lo mato, en unidades de mundo:
 *              `{ vz }` hacia adelante (la bala empuja, tu avion arrastra),
 *              `{ vx, vy }` para el que ademas viene de un lado o de arriba.
 *              Sin impulso, el objeto simplemente se desarma donde estaba.
 *
 *  No explota ni suena: eso lo pone el que llama (explodeAt sigue siendo suyo). Aca solo hay
 *  escombro — es lo que permite migrar tipo por tipo sin romper a nadie (§4.6). */
export function despiece(o, imp) {
  const r = recetaDe(o.type);
  const I = imp || {};
  const bvz = I.vz || 0, bvx = I.vx || 0, bvy = I.vy || 0;
  hacerLugar(r.n);
  // ALTURA DE ORIGEN: los obstaculos de suelo no llevan `y` (se dibujan desde el piso con su `h`),
  // asi que el escombro nace a media altura del objeto y no bajo tierra.
  const y0 = Math.max(0.4, o.y != null && o.y > 0.4 ? o.y : (o.h ? o.h / 2 : 1));
  const dz = r.size[1] - r.size[0];
  for (let i = 0; i < r.n; i++) {
    const a = Math.random() * 6.283;
    obstacles.push({
      type: 'chunk', done: true, chunkT: 0,
      x: o.x + (Math.random() - 0.5) * 2.2,
      y: Math.max(0.5, y0 + (Math.random() - 0.5) * 1.6),
      z: o.z,
      vx: bvx + Math.cos(a) * r.spread * (0.35 + Math.random() * 0.65),
      vy: bvy + r.up * (0.35 + Math.random() * 0.8),
      // el impulso hacia adelante se reparte disparejo: si todos salieran igual serian una
      // formacion, no un destrozo
      vz: bvz * (0.45 + Math.random() * 0.55) + (Math.random() - 0.5) * 5,
      spin: Math.random() * 6.28, vspin: (Math.random() - 0.5) * 14,
      size: r.size[0] + Math.random() * dz,
      hot: Math.random() < r.hot,
      c: r.c[i % r.c.length], c2: r.c[r.c.length - 1],
      grav: r.grav || 1,                       // lo liviano PLANEA: la lona no cae como una chapa
      // LA PIEZA que se reconoce (el plato del radar, el rotor del helo): sale UNA sola y es la
      // primera. Gira mucho mas rapido que el escombro — es lo que la delata a la distancia.
      pieza: i === 0 ? r.pieza : null,
      vspin2: i === 0 && r.pieza ? (Math.random() < 0.5 ? -1 : 1) * 26 : 0,
      // LA MUERTE EN DOS ACTOS (D2): el ULTIMO pedazo es el resto grande — cae girando en espiral,
      // humeando, y revienta al tocar el suelo. Es la caida del helicoptero: el rotor se va por un
      // lado y el fuselaje se hace tirabuzon hasta el final.
      espiral: r.caida === 'espiral' && i === r.n - 1,
      acto2: r.caida === 'espiral' && i === r.n - 1,
      ph: Math.random() * 6.28,
    });
  }
}

/** CHISPAZO del primer instante (D2). Dos naturalezas, y se distinguen a un cuadro de distancia:
 *  'metal' es acero contra acero — chispas blancas, rapidas y cortas; 'polvo' es mamposteria o
 *  lona — tierra que se levanta lenta y se queda flotando. */
export function chispazo(x, y, z, clase) {
  if (!clase) return;
  const s = proj(x, y, z);
  const metal = clase === 'metal';
  for (let i = 0, n = metal ? 14 : 18; i < n; i++) {
    const a = Math.random() * 6.283;
    const v = metal ? 60 + Math.random() * 90 : 10 + Math.random() * 26;
    parts.push({
      x: s.x, y: s.y,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - (metal ? 10 : 26),
      life: metal ? 0.12 + Math.random() * 0.16 : 0.7 + Math.random() * 0.6,
      c: metal ? (Math.random() < 0.5 ? '#fff4d6' : '#ffd98a')
        : (Math.random() < 0.5 ? '#8a8272' : '#6b6f62'),
      r: metal ? Math.max(1, s.k * 0.18) : Math.max(1, s.k * 0.4),
    });
  }
}

/** LA MUERTE COMPLETA de un objeto (D2): la bola que le corresponde, su chispazo, su escombro, sus
 *  secundarias y la columna que deja. Es el unico punto de entrada — quien mata algo llama a esto y
 *  no arma la escena a mano, que es como se llego a que carpa, helo, radar y deposito murieran
 *  idéntico.
 *
 *  `explodeAt` sigue existiendo y sigue siendo valido (§4.6): lo usan la bomba, el misil enemigo y
 *  todo lo que no es la muerte de un objeto con receta. */
export function morir(o, imp) {
  const r = recetaDe(o.type);
  const y0 = o.y != null && o.y > 0.4 ? o.y : (o.h ? o.h / 2 : 1);
  // LA BOLA — y su ausencia. Que la carpa no tenga es tan parte de su muerte como que el deposito
  // tenga la grande: una lona que revienta en llamas miente sobre de que esta hecha.
  if (r.bola) explodeAt(o.x, y0, o.z, r.bola === 'grande');
  else { run.shake = Math.min(6, run.shake + 1.2); boom(0.06); }
  chispazo(o.x, y0, o.z, r.chispa);
  despiece(o, imp);
  // SECUNDARIAS: el combustible no explota de una: se va prendiendo. Cada una es un 'sec' con su
  // propio reloj — obstaculos como cualquier otro, asi que viajan con el mundo y no se quedan
  // clavadas en la pantalla mientras el avion sigue.
  if (r.sec) {
    const n = SEC_N[0] + ((Math.random() * (SEC_N[1] - SEC_N[0] + 1)) | 0);
    for (let i = 0; i < n; i++) obstacles.push({
      type: 'sec', done: true,
      x: o.x + (Math.random() - 0.5) * 7, y: Math.max(0.5, y0 + Math.random() * 4), z: o.z,
      t: 0.25 + Math.random() * SEC_T, grande: Math.random() < 0.35,
    });
  }
  // LA COLUMNA que queda ardiendo en el lugar
  if (r.humo) obstacles.push({ type: 'humo', done: true, x: o.x, y: 0, z: o.z, humoT: 0, humoMax: r.humo });
}

/** UN CUADRO de un pedazo: sigue de largo con su inercia, cae, rebota corto y humea si esta
 *  caliente. Vivia adentro del bloque de estado 'dead' de game.js, donde solo podia correr para
 *  los restos del jugador; ahora la llaman los dos lados — el mundo en vuelo (collision.js) y el
 *  mundo detenido (game.js) — porque desde D0 hay escombro ajeno cayendo mientras se juega. */
export function stepChunk(o, dt) {
  o.chunkT += dt;
  // ESPIRAL (D2): el resto del helicoptero cae en tirabuzon. No es fisica de rigidos (§4.3): es el
  // mismo pedazo de siempre con el lado empujandolo en circulo — a esta escala se lee igual.
  if (o.espiral) {
    o.ph += dt * 7;
    o.vx = Math.cos(o.ph) * 13; o.vy = Math.min(o.vy, -3);
    if (Math.random() < 0.7) {
      const es = proj(o.x, o.y, o.z);
      parts.push({ x: es.x, y: es.y, vx: (Math.random() - 0.5) * 8, vy: -6 - Math.random() * 8, life: 0.7, c: '#4a4a44', r: Math.max(1, es.k * 0.3) });
    }
  }
  o.z += o.vz * dt; o.x += o.vx * dt; o.y += o.vy * dt;
  o.vy -= 30 * (o.grav || 1) * dt; o.vz *= Math.max(0, 1 - dt * 0.75);
  o.spin += (o.vspin + (o.vspin2 || 0)) * dt;
  if (o.y <= 0) {
    // EL SEGUNDO ACTO: tocar el suelo es el final de la caida, no un rebote mas
    if (o.acto2) { o.acto2 = false; o.espiral = false; explodeAt(o.x, 0.5, o.z, false); boom(0.12); }
    o.y = 0; o.vy = -o.vy * 0.32; o.vz *= 0.6; o.vx *= 0.6; o.vspin *= 0.5;
    // salpicon/polvo del rebote, proyectado donde toco
    const bs = proj(o.x, 0, o.z);
    for (let i = 0; i < 3; i++) parts.push({ x: bs.x + (Math.random() - 0.5) * 4, y: bs.y, vx: (Math.random() - 0.5) * 26, vy: -20 - Math.random() * 26, life: 0.4, c: cfg.terrain === 'sea' ? P.foam : '#6b6f62', r: 1.2 });
  }
  // HUMO: los pedazos calientes van dejando un hilito que sube
  if (o.hot && Math.random() < 0.5) {
    const hs = proj(o.x, o.y, o.z);
    parts.push({ x: hs.x, y: hs.y, vx: (Math.random() - 0.5) * 6, vy: -8 - Math.random() * 10, life: 0.5, c: '#5a5a52', r: Math.max(1, hs.k * 0.16) });
  }
}

/** UN CUADRO de los efectos de muerte que viven en el mundo (D0/D2). Devuelve `true` si se ocupo
 *  del objeto — los que llaman lo usan para saltearse el resto de su bucle: son FX puros y no
 *  colisionan con nada.
 *
 *  Vive aca por la misma razon que stepChunk: lo corren los DOS mundos, el que vuela
 *  (systems/collision.js) y el que quedo detenido tras el derribo (game.js). Una explosion
 *  secundaria que se congela porque el jugador acaba de morir seria justo la mitad del efecto. */
export function stepDestruccion(o, dt) {
  if (o.type === 'chunk') { stepChunk(o, dt); return true; }
  if (o.type === 'sec') {
    // SECUNDARIA: espera su turno y revienta. El retardo ES la lectura (plan §3) — sin el, cinco
    // explosiones juntas son una sola explosion mas grande.
    o.t -= dt;
    if (o.t <= 0) { explodeAt(o.x, o.y, o.z, o.grande); o.type = 'airboom'; o.boomT = 0; o.scale = o.grande ? 0.5 : 0.3; }
    return true;
  }
  if (o.type === 'humo') {
    // LA COLUMNA: la pira sigue tirando humo despues de que se apago todo lo demas. Sube y se
    // abre con la altura, como el humo de verdad.
    o.humoT += dt;
    if (Math.random() < 0.55) {
      const hs = proj(o.x + (Math.random() - 0.5) * 2, 0.5, o.z);
      const viejo = o.humoT / o.humoMax;
      parts.push({
        x: hs.x, y: hs.y, vx: (Math.random() - 0.5) * 10, vy: -16 - Math.random() * 16,
        life: 1.1 + Math.random() * 0.8,
        c: Math.random() < 0.3 - viejo * 0.25 ? '#c07a42' : (Math.random() < 0.5 ? '#3e3e3a' : '#565650'),
        r: Math.max(1, hs.k * (0.5 + Math.random() * 0.5)),
      });
    }
    return true;
  }
  return false;
}

/** Salpicadura de sangre + tierra al eliminar un soldado. */
export function bloodBurst(sx, sy, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, sp = 22 + Math.random() * 55, blood = Math.random() < 0.55;
    parts.push({
      x: sx + (Math.random() - 0.5) * 3, y: sy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 24, life: 0.35 + Math.random() * 0.45,
      c: blood ? (Math.random() < 0.5 ? '#a81b1b' : '#7a1212') : (Math.random() < 0.5 ? '#6b5a3a' : '#463a26'), r: 1 + Math.random() * 1.6
    });
  }
}
