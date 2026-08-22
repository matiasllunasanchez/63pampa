// FEEDBACK VISUAL compartido: proyeccion y helpers de efecto que varios sistemas disparan.
//
// Todo esto lo usan el vuelo, las colisiones, el momentum Y el render. Vive aca (y no dentro de
// un sistema) porque solo toca stores + paleta + las medidas del mundo: no necesita el closure
// de game.js. Sacarlo del monolito es lo que permite que systems/collision.js sea un archivo.

import { cam, cfg, plane, stats } from './state.js';
import { run } from './run.js';
import { parts, popups, obstacles } from './world.js';
import { P } from '../data/palette.js';
import { recetaDe, CHUNKS_MAX, CHUNK_LIFE, SEC_N, SEC_T,
  ONDA_T, ONDA_R, ONDA_PUSH, CERCA, FLASH_T,
  CHAIN_R, CHAIN_DEPTH, CHAIN_DELAY, DESPIECE, PARTS_MAX,
  dadoDe, elegirVariante, MORIBUNDO_MAX, EYECT_P, VIDA_LARGA } from '../data/despiece.js';

import { W, HOR, F, PZ } from '../render/ctx.js';
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
export function explodeAt(x, y, z, big, noBall, noShake) {
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
  // `noShake`: el que llama pone SU sacudon. Lo usa morir() desde D3, que lo escala por distancia —
  // el sacudon fijo de aca hacia que una explosion a 300 m se sintiera igual que una al lado.
  // Sin el parametro, el comportamiento es el de siempre (§4.6: explodeAt no se rompe).
  if (!noShake) run.shake = Math.min(6, run.shake + (big ? 4.5 : 2));
  boom(big ? 0.16 : 0.08);
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

/** EL ACTA DE LA MUERTE (PLAN_DESTRUCCION_V2 §2): el contexto que decide la variante.
 *
 *  Todo sale de lo que YA existe en el instante del golpe — no hay estado nuevo que mantener ni
 *  nada que el llamador tenga que recordar. El unico dato que el llamador aporta es `killer`, que
 *  es lo unico que el objeto no puede saber de si mismo.
 *
 *  `lado` se lee del IMPULSO y no de la geometria: el impulso ES por donde entro la energia. Un
 *  balazo desde atras empuja hacia adelante (vz > 0) y eso es un impacto en la popa.
 */
export function actaDe(o, imp, killer) {
  const I = imp || {};
  const vx = I.vx || 0, vy = I.vy || 0, vz = I.vz || 0;
  const lado = Math.abs(vy) > Math.abs(vx) && Math.abs(vy) > Math.abs(vz) && vy < 0 ? 'arriba'
    : Math.abs(vx) > Math.abs(vz) ? (vx > 0 ? 'der' : 'izq')
    : (vz >= 0 ? 'popa' : 'proa');
  const enAire = (o.y || 0) > 4;
  return {
    killer: killer || 'canon',
    imp: { vx, vy, vz },
    mag: Math.hypot(vx, vy, vz),
    lado,
    alt: enAire ? 'aire' : (cfg.terrain === 'sea' ? 'agua' : 'suelo'),
    masa: recetaDe(o.type).masa || 'medio',
    dado: dadoDe(o),
  };
}

/** DESPIEZA un objeto: lo convierte en escombro segun su receta.
 *
 *  @param o     el obstaculo que muere (de ahi salen tipo y posicion)
 *  @param acta  EL ACTA (v2 §2): `{ killer, imp, lado, alt, masa, dado, variante }`. Antes esto
 *               era el impulso pelado; ahora el impulso viaja adentro (`acta.imp`) junto con el
 *               resto del contexto. Se cambio la firma en vez de aceptar las dos formas: dos
 *               verdades para lo mismo es exactamente como se llega a que una quede vieja.
 *               El impulso sigue siendo lo mismo de siempre — `{ vz }` hacia adelante (la bala
 *               empuja, tu avion arrastra), `{ vx, vy }` para el que viene de un lado o de arriba.
 *
 *  No explota ni suena: eso lo pone el que llama (explodeAt sigue siendo suyo). Aca solo hay
 *  escombro — es lo que permite migrar tipo por tipo sin romper a nadie (§4.6). */
/** La receta EFECTIVA de una muerte: la del tipo con la variante encima. Un solo lugar donde se
 *  hace la mezcla — si `morir()` y `despiece()` la resolvieran cada uno por su lado, una variante
 *  podria cambiar el escombro y no la bola de fuego, que es media muerte. */
export function recetaEfectiva(tipo, variante) {
  const r = recetaDe(tipo);
  return variante && variante.receta ? Object.assign({}, r, variante.receta) : r;
}

export function despiece(o, acta) {
  const A = acta || {};
  const r = recetaEfectiva(o.type, A.variante);
  const I = A.imp || {};
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
      // LA PIEZA HORNEADA que le toca (render/partes.js). Se reparte por indice y no al azar: el
      // pedazo 0 es el que las variantes convierten en "la pieza grande", asi que la lista de la
      // receta ya viene en el orden en que conviene gastarlas.
      parte: r.partes ? r.partes[i % r.partes.length] : null,
      espiral: r.caida === 'espiral' && i === r.n - 1,
      acto2: r.caida === 'espiral' && i === r.n - 1,
      ph: Math.random() * 6.28,
    });
  }
  // LA FORMA DE LA VARIANTE (v2 §3). El escombro ya esta: aca se le da a UNO o DOS pedazos el
  // papel grande que hace que la muerte se reconozca de lejos. Se REESCRIBEN pedazos que ya
  // existen en vez de agregar objetos nuevos — asi el presupuesto de D5 no se entera de nada.
  formaDeVariante(o, A, r, obstacles.slice(-r.n));
}

/** Le da silueta a la variante. Lo que distingue a las cuatro muertes del aire es CUANTOS PEDAZOS
 *  GRANDES quedan y que hacen; el color es el mismo fuselaje en las cuatro, y tiene que serlo. */
function formaDeVariante(o, A, r, cs) {
  const v = A.variante;
  if (!v || !cs.length) return;
  const primero = cs[0], ultimo = cs[cs.length - 1];
  const lado = A.dado < 0.5 ? -1 : 1;
  if (v.forma === 'ala') {
    // EL ALA sale ENTERA, grande y girando rapido; y planea, porque es una superficie.
    primero.pieza = 'ala'; primero.parte = 'ala'; primero.size = r.size[1] * 2.2; primero.grav = 0.45;
    primero.vspin2 = lado * 30; primero.vy = 6 + A.dado * 5; primero.vx = lado * 17;
    // EL RESTO se va en tirabuzon y revienta al tocar. Es la maquinaria de dos actos del helo
    // (D2) aplicada a otro cuerpo — no un sistema nuevo (§4.3 del plan viejo).
    ultimo.espiral = true; ultimo.acto2 = true; ultimo.size = r.size[1] * 1.7;
    ultimo.hot = true; ultimo.vida = VIDA_LARGA; ultimo.pieza = null; ultimo.parte = 'fuselaje';
  } else if (v.forma === 'partido') {
    // DOS MITADES que se separan: la PROA gira rapido y cae pesada; la COLA cae PLANA, tumbando
    // despacio y flotando. Van para lados opuestos: es lo que hace legible que se partio.
    // se partio POR EL FUSELAJE: adelante queda el morro, atras la cola con la tobera
    primero.pieza = null; primero.parte = 'morro'; primero.size = r.size[1] * 2.0; primero.vspin = 11 * lado;
    primero.vx = -lado * (14 + A.dado * 6); primero.grav = 1.2; primero.vida = VIDA_LARGA;
    ultimo.pieza = null; ultimo.parte = 'cola'; ultimo.size = r.size[1] * 1.8; ultimo.vspin = 1.3 * lado;
    ultimo.vx = lado * (14 + A.dado * 6); ultimo.grav = 0.65; ultimo.hot = true;
    ultimo.vida = VIDA_LARGA;
  } else if (v.forma === 'moribundo') {
    // ENTERO Y DE LARGO: este no cae, se ALEJA. La silueta es una linea de humo que se va y una
    // explosion lejos — la unica de las cuatro que no termina donde empezo.
    // el que se va muriendo es el AVION todavia entero: el tramo de fuselaje, no un ala suelta
    primero.pieza = 'ala'; primero.parte = 'fuselaje'; primero.size = r.size[1] * 2.4;
    primero.moribundo = true; primero.acto2 = true; primero.hot = true;
    primero.vida = VIDA_LARGA; primero.grav = 0;
    primero.vx = (A.dado - 0.5) * 8; primero.vy = -2; primero.vz = 30;
    primero.vspin = 0.7; primero.vspin2 = 0;
  }
  // LA EYECCION. Un piloto que alcanza a salir — no va en `desintegracion` porque de ahi no sale
  // nadie, y fingir que si seria el festival que el §6.5 prohibe.
  //
  // El dado es OTRO: reusar el mismo que eligio la variante ataria las dos decisiones (siempre se
  // eyectaria en las mismas variantes). Se deriva del primero, que lo mantiene determinista.
  const dado2 = (A.dado * 7.3) % 1;
  if (v.forma && dado2 < EYECT_P * (v.forma === 'moribundo' ? 1.8 : 1)) {
    obstacles.push({
      type: 'chunk', done: true, chunkT: 0, paraca: true,
      x: o.x, y: (primero.y || 2) + 1.5, z: o.z,
      vx: (A.dado - 0.5) * 7, vy: 15, vz: 5,
      spin: 0, vspin: 0, size: 0.95, hot: false,
      c: '#d8d2c4', c2: '#8f959b', grav: 0.1, vida: VIDA_LARGA, ph: 0, parte: null,
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
export const MUERTES = [];   // bitacora de las ultimas muertes (la lee la sonda __muertes)
// La variante que salio en la ULTIMA muerte. La lee la sonda: sin esto, afirmar "salio `ala`" solo
// se puede por inspeccion visual, que es justo lo que el fixture viene a reemplazar.
export let ULTIMA_VARIANTE = null;

/** Cuantos "se van muriendo" hay en el aire ahora mismo. */
const moribundosVivos = () => obstacles.reduce((n, c) => n + (c.moribundo ? 1 : 0), 0);

export function morir(o, imp, depth, killer) {
  const d0 = depth || 0;
  // EL ACTA Y LA VARIANTE (v2). Se arman ACA, en el unico punto de entrada de la muerte, y no en
  // cada llamador: quien mata sabe con que mato y nada mas — el resto lo deriva el acta sola.
  const acta = actaDe(o, imp, killer);
  acta.variante = elegirVariante(o.type, acta);
  // CAP DEL MORIBUNDO (§6.2): es el unico que sigue vivo despues de morir, asi que es el unico que
  // puede acumularse. Pasado el tope cae a `ala`, que es la otra muerte del cañon — no se cancela
  // la variante, se sustituye: quedarse sin variante seria una muerte generica en medio de otras
  // cuatro que no lo son.
  if (acta.variante && acta.variante.forma === 'moribundo' && moribundosVivos() >= MORIBUNDO_MAX) {
    const alt = (DESPIECE[o.type].variantes || []).find(v => v.forma === 'ala');
    acta.variante = alt || null;
  }
  ULTIMA_VARIANTE = acta.variante ? acta.variante.id : null;
  const r = recetaEfectiva(o.type, acta.variante);
  MUERTES.push({ t: +run.t.toFixed(2), tipo: o.type, depth: d0, z: Math.round(o.z), var: ULTIMA_VARIANTE });
  if (MUERTES.length > 24) MUERTES.shift();
  const y0 = o.y != null && o.y > 0.4 ? o.y : (o.h ? o.h / 2 : 1);
  // LA BOLA — y su ausencia. Que la carpa no tenga es tan parte de su muerte como que el deposito
  // tenga la grande: una lona que revienta en llamas miente sobre de que esta hecha.
  if (r.bola) explodeAt(o.x, y0, o.z, r.bola === 'grande', false, true);   // el sacudon lo pone golpe()
  else boom(0.06);
  chispazo(o.x, y0, o.z, r.chispa);
  // D3 — LA ONDA Y EL GOLPE. Lo grande manda onda; todo manda golpe, escalado por CUAN CERCA fue.
  if (r.bola === 'grande') onda(o.x, y0, o.z);
  golpe(o.x, o.z, r.bola === 'grande' ? 1 : r.bola ? 0.5 : 0.28);
  despiece(o, acta);
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
  // D4 — EL ENCADENAMIENTO. Solo lo que revienta GRANDE prende a sus vecinos, y solo hasta
  // CHAIN_DEPTH saltos: sin las dos condiciones, un campamento denso se enciende entero de una vez
  // y deja de ser una jugada para ser un bug.
  if (r.bola === 'grande' && d0 < CHAIN_DEPTH) encadenar(o, d0);
}

/** Prende la mecha de los vecinos dentro de CHAIN_R. No los mata: les pone un RETARDO, que es lo
 *  que hace que la cadena se lea como una cadena y no como una explosion mas grande (plan §3). */
function encadenar(o, depth) {
  let i = 0;
  for (const v of obstacles) {
    if (v === o || v.done || v.chainT || v.hp === undefined || !DESPIECE[v.type]) continue;
    if (Math.hypot(v.x - o.x, v.z - o.z) > CHAIN_R) continue;
    // ESCALONADOS, no todos con su propio azar. Con retardos sorteados sueltos, dos vecinos podian
    // caer con 0.12 s de diferencia (medido) — y eso no se lee como una cadena, se lee como una
    // explosion con eco. Cada victima entra un escalon despues que la anterior.
    v.chainT = CHAIN_DELAY[0] + i * 0.22 + Math.random() * (CHAIN_DELAY[1] - CHAIN_DELAY[0]) * 0.5;
    v.chainDepth = depth + 1;
    i++;
  }
}

/** Se consumio la mecha: el vecino muere. Puntua con la racha que ya tenias — encadenar es la
 *  jugada de estilo, asi que paga como tal, pero con la economia que ya existe y no una nueva. */
function morirEnCadena(o) {
  const pts = Math.round(150 * (run.multShow || 1));
  run.score += pts; stats.air++;
  const s = proj(o.x, o.h ? o.h / 2 : 1, o.z);
  popup(s.x, s.y - 8, '+' + pts, P.warn);
  morir(o, { vz: 12, vy: 6 }, o.chainDepth || 1, 'cadena');
  o.z = -99; o.done = true;
}

/** EL GOLPE (D3): lo que la explosion te hace A VOS. `f` es su calibre (1 = deposito).
 *
 *  ESTO ES LA ETAPA ENTERA en tres lineas: hasta ahora toda explosion sacudia lo mismo, asi que
 *  una a 300 m se sentia igual que una pegada al ala — y con eso, ninguna se sentia. Acá el
 *  sacudon, el fogonazo y el ducking salen de la distancia real al avion.
 *
 *  La caida es CUADRATICA y no lineal a proposito: lineal, media pantalla de distancia todavia
 *  sacudia medio golpe. Lo que se quiere es que a `CERCA` metros ya casi no llegue nada. */
export function golpe(x, z, f) {
  const d = Math.hypot(x - plane.x, z - PZ);
  const cerca = Math.max(0, 1 - d / CERCA);
  const k = cerca * cerca * f;
  if (k < 0.02) return;                                  // lejos: se ve, no se siente
  run.shake = Math.min(7, run.shake + 7 * k);
  run.flash = Math.min(1, run.flash + 0.9 * k);
  if (k > 0.35) duck(0.55);                              // solo lo que te alcanza agacha la musica
}

/** LA ONDA (D3): el anillo que se abre. Es un obstaculo mas — viaja con el mundo y se poda con
 *  todo lo demas — y ademas EMPUJA el escombro que agarra adentro, que es lo que hace que dos
 *  muertes juntas se lean como una sola detonacion y no como dos efectos superpuestos. */
export function onda(x, y, z) {
  obstacles.push({ type: 'onda', done: true, x, y, z, ondaT: 0 });
  for (const c of obstacles) {
    if (c.type !== 'chunk') continue;
    const d = Math.hypot(c.x - x, c.z - z);
    if (d > ONDA_R || d < 0.01) continue;
    const k = (1 - d / ONDA_R) * ONDA_PUSH;
    c.vx += ((c.x - x) / d) * k;
    c.vz += ((c.z - z) / d) * k;
    c.vy += k * 0.35;
    c.vspin += (Math.random() - 0.5) * k;
  }
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
  // EL QUE SE VA MURIENDO (v2): sostiene el rumbo y baja despacio. No es fisica nueva — es el
  // mismo pedazo de siempre con el motor todavia empujando, y por eso `grav` 0 y `vz` sostenida.
  // Termina en `acto2`: revienta al tocar, lejos de donde lo tocaste.
  if (o.moribundo) {
    o.vz = Math.max(o.vz, 26);
    o.vy = Math.max(o.vy - dt * 1.2, -7);
    // HUMO NEGRO GORDO — es LA firma de esta muerte a distancia, y por eso va aparte del hilito
    // del `hot`: mas denso, mas grande y mas oscuro. La silueta es la linea que deja, no el pedazo.
    const ms = proj(o.x, o.y, o.z);
    parts.push({ x: ms.x, y: ms.y, vx: (Math.random() - 0.5) * 6, vy: -10 - Math.random() * 8,
      life: 1.1, c: Math.random() < 0.6 ? '#2b2b28' : '#43433c', r: Math.max(1.5, ms.k * 0.55) });
  }
  // EL PARACAIDAS baja despacio y NO tumba: uno que girara seria un pedazo mas de escombro.
  if (o.paraca) { o.vy = Math.max(o.vy, -4.5); o.spin = 0; }
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
  // LA MECHA (D4). Va antes del despacho por tipo y NO consume el objeto: el vecino encendido
  // sigue siendo un obstaculo normal hasta que le toca — se lo puede esquivar, chocar o tirar
  // durante ese cuarto de segundo, que es exactamente lo que hace legible la cadena.
  if (o.chainT > 0) {
    o.chainT -= dt;
    if (o.chainT <= 0) { o.chainT = 0; morirEnCadena(o); }
  }
  if (o.type === 'chunk') { stepChunk(o, dt); return true; }
  if (o.type === 'sec') {
    // SECUNDARIA: espera su turno y revienta. El retardo ES la lectura (plan §3) — sin el, cinco
    // explosiones juntas son una sola explosion mas grande.
    o.t -= dt;
    if (o.t <= 0) { explodeAt(o.x, o.y, o.z, o.grande); o.type = 'airboom'; o.boomT = 0; o.scale = o.grande ? 0.5 : 0.3; }
    return true;
  }
  if (o.type === 'onda') { o.ondaT += dt; return true; }
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

/** TOPE DE PARTICULAS (D5). Se llama despues de podar las muertas, en el mismo lugar y el mismo
 *  cuadro: si la poblacion se paso del presupuesto, se van las mas viejas — que estan al final de
 *  su vida y ya casi no se ven. `parts` se MUTA con splice (nunca se reasigna: lo vigila
 *  `npm run lint:state`). */
export function capParts() {
  const sobran = parts.length - PARTS_MAX;
  if (sobran > 0) parts.splice(0, sobran);
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
