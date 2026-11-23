// LAS ISLAS REALES — LAS EXPLOSIONES EN 3D (19/11, el autor: "mejora las explosiones, el avion debe explotar en
// todas las camaras tambien").
//
// Las del pasillo son de PANTALLA (core/fx.js `explodeAt`, con `proj`): caen bien en la vista de atras, pero
// desde arriba no existian. Estas viven EN EL MAPA y las ve cualquier camara: un FOGONAZO, la BOLA DE FUEGO
// (varias bolas que crecen y se apagan de amarillo a rojo), los PEDAZOS que vuelan con gravedad y rebotan
// contra el suelo, y el HUMO que sube y se abre. El agua: una columna blanca en vez de fuego.
// La cola de estallidos la llena systems/islas/islas.js (`estallido`, `estallarAvion`); three-arena.js la pasa.
import { HORNO_VIEJO } from '../../data/horno.js';
import { PARTES_HOJA } from '../../data/despiece.js';
import { P as PAL } from '../../data/palette.js';
import { marco } from './islas.js';
const THREE = window.THREE || null;
// los POOLS (fijos: nada se crea por cuadro). Las bolas son un anillo que busca un lugar libre antes de pisar.
const N_BOLA = 720, N_PED = 900, N_PARTE = 36, N_CHAPA = 160, N_EMI = 56, N_ONDA = 4;
const R = { bolas: [], ped: null, pedV: [], tex: null, texs: [], vivos: [], partes: [], hoja: null,
  chapas: [], texChapa: null, emi: [], ondas: [], tok: 0, sonda: [], suelo: null };

// LOS IMPACTOS POR ARMA (21/11, el autor: "particulas que se rompan, pedazos de barco o bases o barcazas cuando
// impacta algun proyectil; si es metralleta es una cosa, si es bomba es otra… buenas perforaciones"):
//   'chispas'  bala de cañon contra METAL: chispas amarillo-blancas que saltan y caen, astillitas, un puff gris
//   'astillas' bala contra TIERRA (carpa, deposito, puesto): polvo marron, astillas de madera y lona
//   'perfora'  bomba que PERFORA sin detonar: fogonazo seco, lluvia de CHAPA hacia afuera, chorro de vapor que
//              queda humeando (y salpicadura si fue en la linea de flotacion). Se lee "le hizo un agujero".
//   'detona'   bomba que DETONA: bola de fuego que crece, ONDA, chapa grande para todos lados, columna de humo
//              negro que dura y fuego que queda
//   'humea'    buque DAÑADO: un hilo de humo oscuro unos segundos (se pide cada ~1,5 s)
// Las balas se piden muchas por segundo: 'chispas' y 'astillas' gastan FICHAS (TOK_POR_S, tope TOK_MAX); sin
// ficha sale una version minima (tres chispas, sin humo).
const TOK_POR_S = 40, TOK_MAX = 24;
const CHAPA_CELDAS = 4;
// los colores (rgb 0..1)
const GRIS_CHAPA = [[0.42, 0.44, 0.46], [0.3, 0.31, 0.33], [0.2, 0.21, 0.23], [0.52, 0.5, 0.46], [0.34, 0.3, 0.28]];
const MADERA = [[0.55, 0.4, 0.22], [0.46, 0.44, 0.3], [0.62, 0.5, 0.3], [0.36, 0.26, 0.16]];

// LAS PARTES DEL AVION (21/11, el autor: "las explosiones del avion deben tirar partes para todos lados, esto ya lo
// hicimos en pasillo y estan modeladas las partes"): la MISMA hoja horneada del despiece del pasillo
// (assets/world/explosions/partes.png, render/partes.js — una fila por pieza, una columna por giro), cada pieza un
// sprite en el mapa que vuela con la inercia, da vueltas (la columna de la hoja y el giro en pantalla), deja una
// estela de humo, rebota en la tierra y queda humeando; la que cae al mar se hunde con un chapuzon.
const HOJA = (HORNO_VIEJO ? '../assets/world/explosions/three/' : '../assets/world/explosions/') + 'partes.png';
const HOJA_COLS = 8, HOJA_FILAS = PARTES_HOJA.length;
// que sale de un avion y de que tamaño (m): un ala por lado, y el resto una vez
const DEL_AVION = [['ala', 4.6], ['ala', 4.6], ['fuselaje', 6], ['morro', 3], ['cola', 3.6], ['deriva', 3], ['estab', 3],
  ['cabina', 2.6], ['motor', 2.8], ['tanque', 2.6], ['tren', 2.2], ['panel', 2], ['panel', 1.8], ['panel', 1.6]];

function textura() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); return t;
}
// LAS BOCANADAS (23/11, el autor: "las explosiones de los edificios y vehiculos y todo en ISLAS debe ser mucho mejor
// visualmente"): la bola lisa de degradé se leia como un globo. Cada bola de fuego o de humo ahora es una BOCANADA con
// lobulos (varias bolitas encimadas, con sombra abajo y un grano), girada al azar y girando despacio: el fuego se
// ve con lenguas y el humo con rulos. Cuatro dibujos distintos (semilla fija) para que no se repita la forma.
// La lisa queda para los FOGONAZOS (`blanda`), que son luz y no materia.
const N_BOCANADA = 4;
function bocanada(semilla) {
  let sd = semilla * 9301 + 49297;
  const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  const lob = 9 + ((r() * 5) | 0);
  for (let i = 0; i < lob; i++) {
    const a = r() * 6.283, d = (i === 0 ? 0 : 6 + r() * 13), x = 32 + Math.cos(a) * d, y = 32 + Math.sin(a) * d;
    const rr = (i === 0 ? 17 : 8 + r() * 9) * (1 - d / 48);
    const gr = g.createRadialGradient(x - rr * 0.25, y - rr * 0.3, 0, x, y, rr);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(225,225,225,0.85)'); gr.addColorStop(1, 'rgba(160,160,160,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 6.283); g.fill();
  }
  // el grano: unos puntos mas oscuros adentro (el humo no es liso)
  const im = g.getImageData(0, 0, 64, 64), D = im.data;
  for (let i = 0; i < D.length; i += 4) {
    if (!D[i + 3]) continue;
    const k = 0.82 + r() * 0.18; D[i] *= k; D[i + 1] *= k; D[i + 2] *= k;
  }
  g.putImageData(im, 0, 0);
  return new THREE.CanvasTexture(c);
}

// LA CHAPA: cuatro recortes pixelados (8x8 cada uno, blanco con borde gris y algun agujero) que el color tiñe
function texturaChapa() {
  const c = document.createElement('canvas'); c.width = 8 * CHAPA_CELDAS; c.height = 8;
  const g = c.getContext('2d');
  const formas = [
    [[1, 1], [6, 0], [7, 3], [5, 7], [2, 6], [0, 3]],
    [[0, 2], [7, 1], [6, 5], [1, 6]],
    [[2, 0], [7, 2], [6, 7], [3, 5], [0, 7], [1, 3]],
    [[0, 0], [5, 1], [7, 6], [3, 7], [1, 4]],
  ];
  formas.forEach((f, i) => {
    g.beginPath(); f.forEach(([x, y], j) => (j ? g.lineTo : g.moveTo).call(g, i * 8 + x + 0.5, y + 0.5)); g.closePath();
    g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#8a8a8a'; g.lineWidth = 1; g.stroke();
    g.fillStyle = '#b8b8b8'; g.fillRect(i * 8 + 3, 3, 1, 2);   // un remache / una abolladura
  });
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; return t;
}

export function crear(escena) {
  if (R.ped || !THREE) return;
  R.tex = textura();
  for (let i = 0; i < N_BOCANADA; i++) R.texs.push(bocanada(i + 1));
  R.texChapa = texturaChapa();
  for (let i = 0; i < N_CHAPA; i++) {
    const t = R.texChapa.clone(); t.repeat.set(1 / CHAPA_CELDAS, 1);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: 0.3, fog: false }));
    s.visible = false; s.renderOrder = 7; s.userData.v = null;
    escena.add(s); R.chapas.push(s);
  }
  // LA ONDA de la bomba que detona: un aro chato en el piso (una geometria para todas, creada una vez)
  const aro = new THREE.RingGeometry(0.82, 1, 40); aro.rotateX(-Math.PI / 2);
  for (let i = 0; i < N_ONDA; i++) {
    const m = new THREE.Mesh(aro, new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
    m.visible = false; m.renderOrder = 6; m.userData.v = null; m.frustumCulled = false;
    escena.add(m); R.ondas.push(m);
  }
  for (let i = 0; i < N_EMI; i++) R.emi.push(null);
  for (let i = 0; i < N_BOLA; i++) {
    const m = new THREE.SpriteMaterial({ map: R.tex, transparent: true, depthWrite: false, fog: false });
    const s = new THREE.Sprite(m); s.visible = false; s.renderOrder = 6; s.userData.v = null;
    escena.add(s); R.bolas.push(s);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N_PED * 3), 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N_PED * 3), 3));
  g.setDrawRange(0, 0);
  R.ped = new THREE.Points(g, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, vertexColors: true, fog: false }));
  R.ped.frustumCulled = false; R.ped.renderOrder = 6;
  escena.add(R.ped);
  R.hoja = new THREE.TextureLoader().load(HOJA);
  R.hoja.magFilter = R.hoja.minFilter = THREE.NearestFilter;
  for (let i = 0; i < N_PARTE; i++) {
    const t = R.hoja.clone(); t.repeat.set(1 / HOJA_COLS, 1 / HOJA_FILAS);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, alphaTest: 0.3, fog: false }));
    s.visible = false; s.renderOrder = 7; s.userData.v = null;
    escena.add(s); R.partes.push(s);
  }
}

let ip = 0;
/** Las piezas de un avion que revienta en (e.x, e.y, e.z), con su inercia. */
function despiece(e) {
  const k = Math.sqrt(e.esc || 1), cuerpo = new THREE.Color(PAL.body), vidrio = new THREE.Color(PAL.canopy);
  for (const [n, tam] of DEL_AVION) {
    const s = R.partes[ip]; ip = (ip + 1) % N_PARTE;
    const fila = PARTES_HOJA.indexOf(n); if (fila < 0) continue;
    const a = rnd(0, 6.283), v = rnd(10, 30) * k;
    s.userData.v = { x: e.x + rnd(-2, 2), y: e.y + rnd(0, 2), z: e.z + rnd(-2, 2),
      vx: Math.cos(a) * v + (e.vx || 0) * rnd(0.5, 0.9), vy: rnd(8, 26) * k, vz: Math.sin(a) * v + (e.vz || 0) * rnd(0.5, 0.9),
      t: 0, vida: rnd(5, 8), tam: tam * rnd(0.85, 1.15), fila, giro: rnd(-9, 9), col: rnd(0, 8), colV: rnd(-14, 14),
      humo: 0, quieta: false, c: n === 'cabina' ? vidrio : cuerpo };
    s.material.rotation = rnd(0, 6.283);
  }
}
let CALOR = null, _c = null;
function pasoPartes(dt, suelo) {
  if (!CALOR) { CALOR = new THREE.Color(1, 0.55, 0.2); _c = new THREE.Color(); }
  for (const s of R.partes) {
    const o = s.userData.v; if (!o) continue;
    o.t += dt;
    if (o.t >= o.vida) { s.userData.v = null; s.visible = false; continue; }
    if (!o.quieta) {
      o.vy -= 22 * dt; o.vx *= Math.exp(-dt * 0.4); o.vz *= Math.exp(-dt * 0.4);
      o.x += o.vx * dt; o.y += o.vy * dt; o.z += o.vz * dt;
      s.material.rotation += o.giro * dt; o.col += o.colV * dt;
      const h = suelo(o.x, o.z);
      if (o.y < h + o.tam * 0.25) {
        if (h <= 0.5) {   // EL MAR: se hunde con un chapuzon
          bola({ x: o.x, y: h + 1, z: o.z, vx: 0, vy: rnd(8, 14), vz: 0, t: 0, d: 0, vida: 0.9, r0: 2, r1: 7 + o.tam,
            c0: [0.95, 0.97, 1], c1: [0.8, 0.85, 0.88], a0: 0.9, a1: 0, suma: false, g: 14 });
          s.userData.v = null; s.visible = false; continue;
        }
        o.y = h + o.tam * 0.25;
        if (Math.abs(o.vy) < 5) { o.quieta = true; o.vida = Math.min(o.vida, o.t + rnd(3, 5)); }
        o.vy = Math.abs(o.vy) * 0.3; o.vx *= 0.45; o.vz *= 0.45; o.giro *= 0.5; o.colV *= 0.5;
      }
    }
    // LA ESTELA: humo negro mientras vuela (y mas flojo cuando quedo tirada)
    o.humo -= dt;
    if (o.humo <= 0 && o.t < 4.5) {
      o.humo = o.quieta ? 0.35 : 0.07;
      bola({ x: o.x, y: o.y, z: o.z, vx: 0, vy: o.quieta ? 3 : 1, vz: 0, t: 0, d: 0, vida: o.quieta ? 1.8 : 1.1,
        r0: o.tam * 0.4, r1: o.tam * 1.3, c0: [0.22, 0.2, 0.19], c1: [0.4, 0.4, 0.4], a0: 0.7, a1: 0, suma: false });
      if (!o.quieta && o.t < 1.2) bola({ x: o.x, y: o.y, z: o.z, vx: 0, vy: 0, vz: 0, t: 0, d: 0, vida: 0.3,
        r0: o.tam * 0.5, r1: o.tam * 0.9, c0: [1, 0.8, 0.4], c1: [0.8, 0.2, 0.05], a0: 0.9, a1: 0, suma: true });
    }
    const col = ((Math.floor(o.col) % HOJA_COLS) + HOJA_COLS) % HOJA_COLS;
    s.material.map.offset.set(col / HOJA_COLS, 1 - (o.fila + 1) / HOJA_FILAS);
    // sale al rojo y se enfria al color del avion; al final se achica y se va
    _c.copy(CALOR).lerp(o.c, Math.min(1, o.t / 1.2));
    s.material.color.copy(_c);
    const fin = Math.min(1, (o.vida - o.t) / 0.6), r = o.tam * 1.6 * fin;
    s.position.set(o.x, o.y, o.z); s.scale.set(r, r, 1);
    s.visible = true;
  }
}

const rnd = (a, b) => a + Math.random() * (b - a);
let ib = 0;
function bola(o) {
  // busca un lugar libre cerca del cursor (el humo largo no se pisa) y si no hay, pisa el mas viejo
  let s = R.bolas[ib];
  for (let j = 0; j < 32 && s.userData.v; j++) { ib = (ib + 1) % N_BOLA; s = R.bolas[ib]; }
  ib = (ib + 1) % N_BOLA;
  s.userData.v = o; s.visible = false;
  s.material.blending = o.suma ? THREE.AdditiveBlending : THREE.NormalBlending;
  // (los fogonazos, lisos; el resto, una bocanada girada que gira despacio)
  s.material.map = o.blanda ? R.tex : R.texs[(Math.random() * N_BOCANADA) | 0];
  s.material.rotation = Math.random() * 6.283; o.gira = o.blanda ? 0 : rnd(-0.7, 0.7);
}

/** Un estallido nuevo: { x, y, z, esc, tipo: 'fuego' | 'avion' | 'agua' | 'chispas' | 'astillas' | 'perfora' | 'detona' | 'humea',
 *  vx, vz } (la inercia: m/s, del que pego). */
function nuevo(e, suelo) {
  const imp = IMPACTOS[e.tipo];
  if (imp) { imp(e, e.esc || 1, suelo); return; }
  const k = e.esc || 1, agua = e.tipo === 'agua';
  if (e.tipo === 'avion') despiece(e);
  if (!agua) {
    // EL FOGONAZO: blanco, enorme y cortito
    bola({ x: e.x, y: e.y + 2, z: e.z, vx: 0, vy: 0, vz: 0, t: 0, d: 0, vida: 0.18, r0: 22 * k, r1: 34 * k, c0: [1, 1, 0.9], c1: [1, 0.8, 0.4], a0: 1, a1: 0, suma: true, blanda: true });
    // LA BOLA DE FUEGO: bolas que nacen escalonadas, crecen y viran de amarillo a rojo oscuro
    for (let i = 0; i < 10; i++) bola({ x: e.x + rnd(-4, 4) * k, y: e.y + rnd(0, 5) * k, z: e.z + rnd(-4, 4) * k,
      vx: (e.vx || 0) * 0.6 + rnd(-6, 6) * k, vy: rnd(2, 9) * k, vz: (e.vz || 0) * 0.6 + rnd(-6, 6) * k, t: 0, d: i * 0.04, vida: rnd(0.7, 1.2),
      r0: rnd(4, 7) * k, r1: rnd(14, 22) * k, c0: [1, 0.92, 0.55], c1: [0.75, 0.18, 0.04], a0: 1, a1: 0, suma: true });
  }
  // EL HUMO (o el ROCIO, en el agua): sube, se abre y se apaga despacio
  for (let i = 0; i < (agua ? 8 : 9); i++) bola({ x: e.x + rnd(-5, 5) * k, y: e.y + rnd(2, 8) * k, z: e.z + rnd(-5, 5) * k,
    vx: (e.vx || 0) * 0.3 + rnd(-2, 2), vy: agua ? rnd(10, 22) * k : rnd(3, 7), vz: (e.vz || 0) * 0.3 + rnd(-2, 2), t: 0, d: agua ? i * 0.03 : 0.2 + i * 0.07,
    vida: agua ? rnd(1, 1.6) : rnd(2.4, 3.6), r0: rnd(5, 9) * k, r1: rnd(20, 34) * k,
    c0: agua ? [0.95, 0.97, 1] : [0.32, 0.28, 0.25], c1: agua ? [0.8, 0.85, 0.88] : [0.5, 0.5, 0.5], a0: agua ? 0.9 : 0.75, a1: 0, suma: false, g: agua ? 14 : 0 });
  // LOS PEDAZOS: chispas y restos que vuelan con la inercia, caen y rebotan
  const n = Math.round((e.tipo === 'avion' ? 70 : agua ? 30 : 45) * Math.min(1.6, k));
  for (let i = 0; i < n && R.pedV.length < N_PED; i++) {
    const a = rnd(0, 6.283), v = rnd(12, 48) * Math.sqrt(k);
    R.pedV.push({ x: e.x, y: e.y + 1, z: e.z, vx: Math.cos(a) * v + (e.vx || 0) * 0.8, vy: rnd(8, 34) * Math.sqrt(k), vz: Math.sin(a) * v + (e.vz || 0) * 0.8,
      t: 0, vida: rnd(0.8, 2.2), c: agua ? [0.9, 0.95, 1] : Math.random() < 0.6 ? [1, 0.7, 0.25] : [0.25, 0.22, 0.2] });
  }
}


// ---------------------------------------------------------------------------------------------------------
// LOS IMPACTOS POR ARMA
const pick = a => a[(Math.random() * a.length) | 0];
/** Un punto (pedazo de los Points) con su inercia; `g` = su gravedad (las chispas caen mas rapido). */
function punto(x, y, z, vx, vy, vz, vida, c, g) {
  if (R.pedV.length >= N_PED) return;
  R.pedV.push({ x, y, z, vx, vy, vz, t: 0, vida, c, g });
}
/** Un pedazo de CHAPA (sprite con recorte pixelado) que vuela, gira, rebota y se apaga. `caliente`: sale al rojo. */
let ic = 0;
function chapa(e, k, o) {
  let s = R.chapas[ic];
  for (let j = 0; j < 16 && s.userData.v; j++) { ic = (ic + 1) % N_CHAPA; s = R.chapas[ic]; }
  ic = (ic + 1) % N_CHAPA;
  const a = rnd(0, 6.283), v = rnd(o.v0, o.v1) * Math.sqrt(k);
  s.userData.v = { x: e.x + rnd(-1, 1) * k, y: e.y + rnd(0, 1.5) * k, z: e.z + rnd(-1, 1) * k,
    vx: Math.cos(a) * v + (e.vx || 0) * o.inercia, vy: rnd(o.vy0, o.vy1) * Math.sqrt(k), vz: Math.sin(a) * v + (e.vz || 0) * o.inercia,
    t: 0, vida: rnd(o.vida0, o.vida1), tam: rnd(o.tam0, o.tam1) * k, giro: rnd(-14, 14), c: o.c || pick(GRIS_CHAPA),
    caliente: !!o.caliente, humo: o.humo ? 0 : -1, quieta: false };
  s.material.rotation = rnd(0, 6.283);
  s.material.map.offset.set(((Math.random() * CHAPA_CELDAS) | 0) / CHAPA_CELDAS, 0);
}
function pasoChapas(dt, suelo) {
  for (const s of R.chapas) {
    const o = s.userData.v; if (!o) continue;
    o.t += dt;
    if (o.t >= o.vida) { s.userData.v = null; s.visible = false; continue; }
    if (!o.quieta) {
      // la chapa planea un poco: frena en el aire mas que la pieza de avion
      o.vy -= 24 * dt; const fr = Math.exp(-dt * 0.7); o.vx *= fr; o.vz *= fr;
      o.x += o.vx * dt; o.y += o.vy * dt; o.z += o.vz * dt;
      s.material.rotation += o.giro * dt;
      const h = suelo(o.x, o.z);
      if (o.y < h + o.tam * 0.2) {
        if (h <= 0.5) {   // al mar: un chapuzon chico (las grandes) y se hunde
          if (o.tam > 1.6) bola({ x: o.x, y: h + 0.5, z: o.z, vx: 0, vy: rnd(5, 9), vz: 0, t: 0, d: 0, vida: 0.6, r0: 1, r1: 2.5 + o.tam,
            c0: [0.95, 0.97, 1], c1: [0.8, 0.85, 0.88], a0: 0.85, a1: 0, suma: false, g: 14 });
          s.userData.v = null; s.visible = false; continue;
        }
        o.y = h + o.tam * 0.2;
        if (Math.abs(o.vy) < 4) { o.quieta = true; o.vida = Math.min(o.vida, o.t + rnd(1.5, 3)); }
        o.vy = Math.abs(o.vy) * 0.25; o.vx *= 0.4; o.vz *= 0.4; o.giro *= 0.4;
      }
    }
    // las grandes de la detonacion dejan estela
    if (o.humo >= 0 && o.t < 2.5) {
      o.humo -= dt;
      if (o.humo <= 0) { o.humo = 0.09;
        bola({ x: o.x, y: o.y, z: o.z, vx: 0, vy: 1, vz: 0, t: 0, d: 0, vida: 0.9, r0: o.tam * 0.5, r1: o.tam * 1.4,
          c0: [0.2, 0.18, 0.17], c1: [0.38, 0.38, 0.38], a0: 0.6, a1: 0, suma: false }); }
    }
    const u = Math.min(1, o.t / 1.4), c = o.c;
    if (o.caliente) s.material.color.setRGB(1 + (c[0] - 1) * u, 0.55 + (c[1] - 0.55) * u, 0.2 + (c[2] - 0.2) * u);
    else s.material.color.setRGB(c[0], c[1], c[2]);
    const fin = Math.min(1, (o.vida - o.t) / 0.4), r = o.tam * fin;
    s.position.set(o.x, o.y, o.z); s.scale.set(r, r, 1);
    s.visible = true;
  }
}
/** LA ONDA: un aro chato que corre por el piso y se apaga. */
function onda(x, y, z, r1, vida) {
  const m = R.ondas.find(o => !o.userData.v) || R.ondas[0];
  m.userData.v = { t: 0, vida, r1 }; m.position.set(x, y, z); m.scale.set(0.1, 1, 0.1);
}
function pasoOndas(dt) {
  for (const m of R.ondas) {
    const o = m.userData.v; if (!o) continue;
    o.t += dt; const u = o.t / o.vida;
    if (u >= 1) { m.userData.v = null; m.visible = false; continue; }
    const r = o.r1 * (1 - Math.pow(1 - u, 3));
    m.scale.set(r, 1, r); m.material.opacity = 0.75 * (1 - u); m.visible = true;
  }
}
/** Un EMISOR: suelta bolas cada `cada` s durante `dur` s (el humo que queda, el vapor del agujero, el fuego).
 *  `hace(em, u)` arma la bola (u = 0..1 de su vida). Si no hay lugar, el pedido se descarta. */
function emisor(x, y, z, dur, cada, hace, extra) {
  const i = R.emi.indexOf(null); if (i < 0) return;
  R.emi[i] = Object.assign({ x, y, z, t: 0, dur, cada, prox: 0, hace }, extra);
}
function pasoEmisores(dt) {
  for (let i = 0; i < N_EMI; i++) {
    const em = R.emi[i]; if (!em) continue;
    em.t += dt;
    if (em.t >= em.dur) { R.emi[i] = null; continue; }
    em.prox -= dt;
    while (em.prox <= 0) { const u = em.t / em.dur; bola(em.hace(em, u)); em.prox += em.cada * (em.ralenta ? 1 + u * em.ralenta : 1); }
  }
}
/** El chapuzon de lo que pega en la linea de flotacion. */
function salpicadura(e, k, n) {
  for (let i = 0; i < n; i++) bola({ x: e.x + rnd(-2, 2) * k, y: Math.max(e.y, 0.5), z: e.z + rnd(-2, 2) * k, vx: rnd(-3, 3), vy: rnd(10, 20) * k, vz: rnd(-3, 3),
    t: 0, d: i * 0.03, vida: rnd(0.8, 1.3), r0: rnd(2, 3) * k, r1: rnd(6, 11) * k, c0: [0.95, 0.97, 1], c1: [0.8, 0.85, 0.88], a0: 0.9, a1: 0, suma: false, g: 16 });
  for (let i = 0; i < n * 3; i++) { const a = rnd(0, 6.283), v = rnd(4, 12) * k;
    punto(e.x, Math.max(e.y, 0.5), e.z, Math.cos(a) * v, rnd(8, 22) * k, Math.sin(a) * v, rnd(0.6, 1.2), [0.9, 0.95, 1]); }
}
const enAgua = (e, suelo) => suelo(e.x, e.z) <= 0.5 && e.y < 4 * (e.esc || 1) + 1;

const IMPACTOS = {
  // BALA CONTRA METAL: barata; sin ficha, tres chispas y listo
  chispas(e, k) {
    const ficha = R.tok >= 1; if (ficha) R.tok -= 1;
    const n = ficha ? 10 + ((Math.random() * 6) | 0) : 3, iv = 0.25;
    for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), v = rnd(10, 30) * k;
      punto(e.x, e.y, e.z, Math.cos(a) * v + (e.vx || 0) * iv, rnd(4, 18) * k, Math.sin(a) * v + (e.vz || 0) * iv, rnd(0.2, 0.45),
        Math.random() < 0.5 ? [1, 1, 0.85] : [1, 0.85, 0.35], 38); }
    if (!ficha) return;
    for (let i = 0, m = 3 + ((Math.random() * 4) | 0); i < m; i++) { const a = rnd(0, 6.283), v = rnd(4, 12) * k;
      punto(e.x, e.y, e.z, Math.cos(a) * v, rnd(5, 12) * k, Math.sin(a) * v, rnd(0.7, 1.3), pick(GRIS_CHAPA).map(c => c * 0.55)); }
    // el chispazo del impacto (chiquito: no es una bola de fuego) y el puff gris
    bola({ x: e.x, y: e.y, z: e.z, vx: 0, vy: 0, vz: 0, t: 0, d: 0, vida: 0.07, r0: 2.5 * k, r1: 3.5 * k, c0: [1, 1, 0.85], c1: [1, 0.8, 0.4], a0: 1, a1: 0, suma: true, blanda: true });
    bola({ x: e.x, y: e.y + 0.5, z: e.z, vx: (e.vx || 0) * 0.05, vy: 2, vz: (e.vz || 0) * 0.05, t: 0, d: 0.03, vida: rnd(0.6, 0.9), r0: 1.2 * k, r1: 4.5 * k,
      c0: [0.42, 0.42, 0.42], c1: [0.6, 0.6, 0.6], a0: 0.55, a1: 0, suma: false });
  },
  // BALA CONTRA TIERRA: polvo y astillas, nada metalico
  astillas(e, k) {
    const ficha = R.tok >= 1; if (ficha) R.tok -= 1;
    const n = ficha ? 10 : 3;
    for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), v = rnd(3, 11) * k;
      punto(e.x, e.y, e.z, Math.cos(a) * v + (e.vx || 0) * 0.1, rnd(6, 16) * k, Math.sin(a) * v + (e.vz || 0) * 0.1, rnd(0.6, 1.1), [0.34, 0.25, 0.15]); }
    if (!ficha) return;
    for (let i = 0; i < 6; i++) { const a = rnd(0, 6.283), v = rnd(5, 14) * k;
      punto(e.x, e.y + 0.3, e.z, Math.cos(a) * v, rnd(6, 14) * k, Math.sin(a) * v, rnd(0.9, 1.6), pick(MADERA)); }
    // una o dos astillas grandes (madera / lona) de chapa-sprite
    for (let i = 0, m = Math.random() < 0.5 ? 1 : 2; i < m; i++)
      chapa(e, k, { v0: 4, v1: 10, vy0: 6, vy1: 13, inercia: 0.1, vida0: 1.2, vida1: 2, tam0: 0.5, tam1: 0.9, c: pick(MADERA) });
    // la nube de polvo marron: baja, se abre y se asienta
    for (let i = 0; i < 3; i++) bola({ x: e.x + rnd(-1, 1) * k, y: e.y + 0.5, z: e.z + rnd(-1, 1) * k, vx: rnd(-2, 2), vy: rnd(3, 7) * k, vz: rnd(-2, 2),
      t: 0, d: i * 0.05, vida: rnd(0.9, 1.4), r0: 1.5 * k, r1: rnd(5, 7) * k, c0: [0.45, 0.35, 0.22], c1: [0.55, 0.47, 0.36], a0: 0.7, a1: 0, suma: false, g: 4 });
  },
  // BOMBA QUE PERFORA: fogonazo seco, chapa para afuera y arriba, y el agujero queda echando vapor
  perfora(e, k, suelo) {
    bola({ x: e.x, y: e.y + 0.5, z: e.z, vx: 0, vy: 0, vz: 0, t: 0, d: 0, vida: 0.1, r0: 4 * k, r1: 8 * k, c0: [1, 1, 0.9], c1: [1, 0.75, 0.35], a0: 1, a1: 0, suma: true, blanda: true });
    for (let i = 0; i < 2; i++) bola({ x: e.x + rnd(-1, 1) * k, y: e.y + 1, z: e.z + rnd(-1, 1) * k, vx: 0, vy: 3, vz: 0, t: 0, d: 0.02, vida: 0.22,
      r0: 2.5 * k, r1: 5 * k, c0: [1, 0.8, 0.4], c1: [0.7, 0.25, 0.08], a0: 0.9, a1: 0, suma: true });
    for (let i = 0, m = 11 + ((Math.random() * 5) | 0); i < m; i++)
      chapa(e, k, { v0: 10, v1: 28, vy0: 12, vy1: 28, inercia: 0.3, vida0: 1.8, vida1: 3.2, tam0: 0.8, tam1: 2.2 });
    for (let i = 0; i < 28; i++) { const a = rnd(0, 6.283), v = rnd(8, 26) * k;
      punto(e.x, e.y + 0.5, e.z, Math.cos(a) * v + (e.vx || 0) * 0.3, rnd(10, 28) * k, Math.sin(a) * v + (e.vz || 0) * 0.3, rnd(0.9, 1.8), pick(GRIS_CHAPA).map(c => c * 0.7)); }
    for (let i = 0; i < 8; i++) { const a = rnd(0, 6.283), v = rnd(10, 24) * k;
      punto(e.x, e.y + 0.5, e.z, Math.cos(a) * v, rnd(6, 18) * k, Math.sin(a) * v, rnd(0.25, 0.5), [1, 0.9, 0.5], 38); }
    // EL CHORRO: sale de costado fuerte el primer segundo, despues sube flojo; dura unos segundos
    const ja = rnd(0, 6.283), jx = Math.cos(ja), jz = Math.sin(ja);
    emisor(e.x, e.y + 0.5, e.z, rnd(4.5, 6), 0.08, (em, u) => {
      const f = Math.max(0, 1 - u * 3);   // el empuje del agujero
      return { x: em.x + rnd(-0.6, 0.6) * k, y: em.y, z: em.z + rnd(-0.6, 0.6) * k, vx: jx * 14 * f * k + rnd(-1, 1), vy: (3 + 6 * f) * k, vz: jz * 14 * f * k + rnd(-1, 1),
        t: 0, d: 0, vida: rnd(1.6, 2.4), r0: 1.2 * k, r1: rnd(6, 9) * k, c0: [0.86, 0.87, 0.89], c1: [0.55, 0.55, 0.57], a0: 0.75 * (1 - u * 0.6), a1: 0, suma: false, sube: 5 };
    }, { ralenta: 1.5 });
    if (enAgua(e, suelo)) salpicadura(e, k, 7);
  },
  // BOMBA QUE DETONA: lo grande
  detona(e, k, suelo) {
    const agua = enAgua(e, suelo), piso = agua ? 0.5 : suelo(e.x, e.z) + 0.5;
    bola({ x: e.x, y: e.y + 3, z: e.z, vx: 0, vy: 0, vz: 0, t: 0, d: 0, vida: 0.25, r0: 40 * k, r1: 62 * k, c0: [1, 1, 0.92], c1: [1, 0.82, 0.45], a0: 1, a1: 0, suma: true, blanda: true });
    // la bola de fuego: crece en camadas y sube
    for (let i = 0; i < 22; i++) bola({ x: e.x + rnd(-6, 6) * k, y: e.y + rnd(0, 8) * k, z: e.z + rnd(-6, 6) * k,
      vx: (e.vx || 0) * 0.3 + rnd(-8, 8) * k, vy: rnd(4, 14) * k, vz: (e.vz || 0) * 0.3 + rnd(-8, 8) * k, t: 0, d: i * 0.035, vida: rnd(1.2, 2),
      r0: rnd(6, 10) * k, r1: rnd(26, 40) * k, c0: [1, 0.93, 0.6], c1: [0.65, 0.14, 0.03], a0: 1, a1: 0, suma: true, sube: 6 });
    onda(e.x, piso, e.z, 130 * k, 0.8);
    for (let i = 0; i < 30; i++)
      chapa(e, k, { v0: 15, v1: 45, vy0: 15, vy1: 40, inercia: 0.3, vida0: 3, vida1: 5, tam0: 1.5, tam1: 5, caliente: true, humo: i < 12 });
    for (let i = 0; i < 90; i++) { const a = rnd(0, 6.283), v = rnd(12, 50) * Math.sqrt(k);
      punto(e.x, e.y + 1, e.z, Math.cos(a) * v + (e.vx || 0) * 0.4, rnd(10, 40) * Math.sqrt(k), Math.sin(a) * v + (e.vz || 0) * 0.4, rnd(1, 2.6),
        Math.random() < 0.5 ? [1, 0.7, 0.25] : pick(GRIS_CHAPA).map(c => c * 0.6)); }
    if (agua) salpicadura(e, k * 1.8, 12);
    // LA COLUMNA DE HUMO NEGRO: alta y larga (se va espaciando), con un poco de viento
    const wa = rnd(0, 6.283), wx = Math.cos(wa) * 1.6, wz = Math.sin(wa) * 1.6;
    emisor(e.x, e.y + 2, e.z, rnd(32, 40), 0.2, (em, u) => ({ x: em.x + rnd(-3, 3) * k, y: em.y + rnd(0, 3), z: em.z + rnd(-3, 3) * k,
      vx: wx + rnd(-1, 1), vy: rnd(6, 10), vz: wz + rnd(-1, 1), t: 0, d: 0, vida: rnd(6, 9), r0: rnd(5, 8) * k, r1: rnd(20, 30) * k * (1 - u * 0.4),
      c0: [0.08, 0.075, 0.07], c1: [0.24, 0.23, 0.23], a0: 0.85 * (1 - u * 0.5), a1: 0, suma: false, sube: 15 }), { ralenta: 1.2 });
    // EL FUEGO QUE QUEDA en la base
    emisor(e.x, e.y + 1, e.z, rnd(20, 26), 0.11, (em, u) => ({ x: em.x + rnd(-5, 5) * k, y: em.y + rnd(0, 2), z: em.z + rnd(-5, 5) * k,
      vx: 0, vy: rnd(2, 5), vz: 0, t: 0, d: 0, vida: rnd(0.5, 0.8), r0: rnd(2, 4) * k * (1 - u * 0.5), r1: rnd(5, 8) * k * (1 - u * 0.5),
      c0: [1, 0.85, 0.4], c1: [0.7, 0.15, 0.03], a0: 0.95, a1: 0, suma: true, sube: 8 }), { ralenta: 0.8 });
  },
  // LO DE TIERRA QUE SE DESTRUYE (23/11, el autor: "las explosiones de los edificios y vehiculos y todo en ISLAS debe
  // ser mucho mejor"): antes todo usaba el 'fuego' generico. Ahora cada cosa revienta como lo que es:
  //   'casa'   carpa, puesto: se desarma — polvo que corre por el piso, tablas y lona, fuego chico que queda
  //   'fierro' camion, cañon, Rapier, blindado, radar: reventon con la municion que sigue saltando (estallidos
  //            segundos), chapa al rojo, el casco que queda ardiendo con humo negro
  //   'nafta'  deposito, Hercules, Pucara: el HONGO — bola de combustible que sube, anillo de polvo, columna negra larga
  casa(e, k, suelo) { derribo(e, k, suelo, DERRIBO.casa); },
  fierro(e, k, suelo) { derribo(e, k, suelo, DERRIBO.fierro); },
  nafta(e, k, suelo) { derribo(e, k, suelo, DERRIBO.nafta); },
  // BUQUE DAÑADO: el hilo de humo oscuro
  humea(e, k) {
    emisor(e.x, e.y, e.z, 2.6, 0.17, em => ({ x: em.x + rnd(-1, 1) * k, y: em.y, z: em.z + rnd(-1, 1) * k, vx: em.wx + rnd(-0.5, 0.5), vy: rnd(3, 5), vz: em.wz + rnd(-0.5, 0.5),
      t: 0, d: 0, vida: rnd(3, 4), r0: 2 * k, r1: rnd(8, 11) * k, c0: [0.14, 0.13, 0.13], c1: [0.36, 0.36, 0.37], a0: 0.7, a1: 0, suma: false, sube: 9 }),
    { wx: (e.vx || 0) * 0.02 + 1, wz: (e.vz || 0) * 0.02 + 0.6 });
  },
};


// ---------------------------------------------------------------------------------------------------------
// EL DERRIBO DE LO DE TIERRA (ver IMPACTOS.casa / fierro / nafta)
const POLVO = [0.46, 0.38, 0.27], POLVO2 = [0.6, 0.54, 0.45];
const DERRIBO = {
  casa:   { flash: 16, bola: 9, bolaR: [9, 16], fuegoC1: [0.7, 0.2, 0.04], polvo: 16, polvoR: 1.0, pedazos: 'madera', npz: 28, chispas: 70,
            secundarios: 0, hongo: false, columna: [10, 14], fuegoQueda: [8, 11], onda: 50 },
  fierro: { flash: 22, bola: 12, bolaR: [10, 18], fuegoC1: [0.7, 0.16, 0.03], polvo: 10, polvoR: 0.8, pedazos: 'chapa', npz: 26, chispas: 90,
            secundarios: 4, hongo: false, columna: [18, 24], fuegoQueda: [14, 18], onda: 70 },
  nafta:  { flash: 34, bola: 20, bolaR: [16, 28], fuegoC1: [0.6, 0.12, 0.02], polvo: 18, polvoR: 1.3, pedazos: 'chapa', npz: 32, chispas: 110,
            secundarios: 1, hongo: true, columna: [26, 34], fuegoQueda: [18, 24], onda: 110 },
};
function derribo(e, k, suelo, D) {
  const piso = Math.max(0.3, suelo(e.x, e.z)), y = Math.max(e.y, piso + 1);
  // 1. EL FOGONAZO (luz) y un segundo resplandor naranja que tarda un poco mas
  bola({ x: e.x, y: y + 1, z: e.z, vx: 0, vy: 0, vz: 0, t: 0, d: 0, vida: 0.16, r0: D.flash * k, r1: D.flash * 1.5 * k, c0: [1, 1, 0.92], c1: [1, 0.85, 0.5], a0: 1, a1: 0, suma: true, blanda: true });
  bola({ x: e.x, y: y + 2, z: e.z, vx: 0, vy: 0, vz: 0, t: 0, d: 0.05, vida: 0.5, r0: D.flash * 0.8 * k, r1: D.flash * 1.2 * k, c0: [1, 0.6, 0.2], c1: [0.6, 0.15, 0.02], a0: 0.7, a1: 0, suma: true, blanda: true });
  // 2. LA BOLA DE FUEGO: camadas escalonadas; el corazon blanco-amarillo, el borde rojo oscuro
  for (let i = 0; i < D.bola; i++) {
    const a = rnd(0, 6.283), d = rnd(0, 4) * k;
    bola({ x: e.x + Math.cos(a) * d, y: y + rnd(0, 4) * k, z: e.z + Math.sin(a) * d,
      vx: Math.cos(a) * rnd(2, 8) * k + (e.vx || 0) * 0.1, vy: rnd(3, 10) * k, vz: Math.sin(a) * rnd(2, 8) * k + (e.vz || 0) * 0.1,
      t: 0, d: i * 0.03, vida: rnd(0.8, 1.4), r0: rnd(3, 6) * k, r1: rnd(D.bolaR[0], D.bolaR[1]) * k,
      c0: i < 3 ? [1, 1, 0.8] : [1, 0.85, 0.45], c1: D.fuegoC1, a0: 1, a1: 0, suma: true, sube: 5 });
  }
  // las mismas camadas, por DETRAS, en humo oscuro: le da cuerpo al fuego (el aditivo solo se lavaba contra el cielo)
  for (let i = 0; i < Math.ceil(D.bola * 0.7); i++) bola({ x: e.x + rnd(-3, 3) * k, y: y + rnd(1, 5) * k, z: e.z + rnd(-3, 3) * k,
    vx: rnd(-3, 3) * k, vy: rnd(4, 9) * k, vz: rnd(-3, 3) * k, t: 0, d: 0.25 + i * 0.05, vida: rnd(2.2, 3.4),
    r0: rnd(5, 8) * k, r1: rnd(D.bolaR[0] * 1.1, D.bolaR[1] * 1.3) * k, c0: [0.16, 0.13, 0.11], c1: [0.34, 0.33, 0.32], a0: 0.85, a1: 0, suma: false, sube: 4 });
  // 3. EL HONGO (nafta): un tallo de fuego que sube y una cabeza que se abre arriba
  if (D.hongo) {
    for (let i = 0; i < 10; i++) bola({ x: e.x + rnd(-2, 2) * k, y: y + i * 2.2 * k, z: e.z + rnd(-2, 2) * k, vx: 0, vy: rnd(14, 20) * k, vz: 0,
      t: 0, d: 0.1 + i * 0.03, vida: rnd(1, 1.5), r0: rnd(4, 6) * k, r1: rnd(9, 13) * k, c0: [1, 0.85, 0.4], c1: [0.55, 0.1, 0.02], a0: 1, a1: 0, suma: true });
    for (let i = 0; i < 14; i++) { const a = (i / 14) * 6.283;
      bola({ x: e.x + Math.cos(a) * 4 * k, y: y + 22 * k, z: e.z + Math.sin(a) * 4 * k, vx: Math.cos(a) * 9 * k, vy: rnd(4, 8) * k, vz: Math.sin(a) * 9 * k,
        t: 0, d: 0.45 + rnd(0, 0.15), vida: rnd(1.4, 2), r0: rnd(6, 9) * k, r1: rnd(16, 24) * k, c0: [1, 0.7, 0.3], c1: [0.2, 0.15, 0.13], a0: 1, a1: 0, suma: false, sube: 3 }); }
  }
  // 4. EL POLVO QUE CORRE POR EL PISO: un anillo bajo que se abre (lo que mas dice "esto paso en el suelo")
  for (let i = 0; i < D.polvo; i++) { const a = (i / D.polvo) * 6.283 + rnd(-0.2, 0.2), v = rnd(14, 24) * D.polvoR * k;
    bola({ x: e.x + Math.cos(a) * 2 * k, y: piso + 1.5 * k, z: e.z + Math.sin(a) * 2 * k, vx: Math.cos(a) * v, vy: rnd(0.5, 2), vz: Math.sin(a) * v,
      t: 0, d: 0.04, vida: rnd(1.4, 2.2), r0: rnd(3, 5) * k, r1: rnd(10, 16) * k, c0: POLVO, c1: POLVO2, a0: 0.8, a1: 0, suma: false }); }
  onda(e.x, piso + 0.4, e.z, D.onda * k, 0.6);
  // 5. LOS PEDAZOS: tablas y lona, o chapa al rojo; y la lluvia de chispas
  for (let i = 0; i < D.npz; i++) {
    if (D.pedazos === 'madera') chapa(e, k, { v0: 6, v1: 20, vy0: 10, vy1: 24, inercia: 0.1, vida0: 2, vida1: 3.5, tam0: 0.9, tam1: 2.4, c: pick(MADERA), humo: i < 4 });
    else chapa(e, k, { v0: 10, v1: 34, vy0: 12, vy1: 34, inercia: 0.2, vida0: 2.5, vida1: 4.5, tam0: 1, tam1: 3.2, caliente: true, humo: i < 8 });
  }
  for (let i = 0; i < D.chispas; i++) { const a = rnd(0, 6.283), v = rnd(10, 40) * Math.sqrt(k);
    punto(e.x, y, e.z, Math.cos(a) * v, rnd(12, 38) * Math.sqrt(k), Math.sin(a) * v, rnd(0.8, 2.2),
      Math.random() < 0.65 ? [1, rnd(0.6, 0.85), 0.25] : D.pedazos === 'madera' ? pick(MADERA).map(c => c * 0.6) : pick(GRIS_CHAPA).map(c => c * 0.6)); }
  // 6. LOS SECUNDARIOS: la municion que sigue saltando (fierro) o el tanque que revienta despues (nafta)
  for (let j = 0; j < D.secundarios; j++) {
    const dd = 0.35 + j * rnd(0.3, 0.55), a = rnd(0, 6.283), r = rnd(2, 6) * k, sx = e.x + Math.cos(a) * r, sz = e.z + Math.sin(a) * r, sy = y + rnd(0, 3) * k;
    const kk = D.hongo ? 1.3 : rnd(0.5, 0.8);
    bola({ x: sx, y: sy, z: sz, vx: 0, vy: 0, vz: 0, t: 0, d: dd, vida: 0.12, r0: 8 * kk * k, r1: 13 * kk * k, c0: [1, 1, 0.85], c1: [1, 0.8, 0.4], a0: 1, a1: 0, suma: true, blanda: true });
    for (let i = 0; i < 4; i++) bola({ x: sx + rnd(-1, 1) * k, y: sy, z: sz + rnd(-1, 1) * k, vx: rnd(-5, 5) * k, vy: rnd(4, 10) * k, vz: rnd(-5, 5) * k,
      t: 0, d: dd + i * 0.03, vida: rnd(0.5, 0.9), r0: 2 * kk * k, r1: rnd(7, 11) * kk * k, c0: [1, 0.9, 0.5], c1: D.fuegoC1, a0: 1, a1: 0, suma: true, sube: 4 });
    // y su chorro de chispas: las trazadoras que se cocinan
    for (let i = 0; i < 14; i++) { const b = rnd(0, 6.283), v = rnd(15, 40);
      R.pedV.length < N_PED && R.pedV.push({ x: sx, y: sy, z: sz, vx: Math.cos(b) * v, vy: rnd(10, 35), vz: Math.sin(b) * v, t: -dd, vida: dd + rnd(0.5, 1.1), c: [1, 0.9, 0.5], g: 30 }); }
  }
  // 7. LO QUE QUEDA: el fuego en la base y la columna de humo negro con viento
  const wa = rnd(0, 6.283), wx = Math.cos(wa) * 2, wz = Math.sin(wa) * 2;
  emisor(e.x, piso + 1, e.z, rnd(D.columna[0], D.columna[1]), 0.22, (em, u) => ({ x: em.x + rnd(-2, 2) * k, y: em.y + rnd(1, 3) * k, z: em.z + rnd(-2, 2) * k,
    vx: wx + rnd(-1, 1), vy: rnd(5, 8), vz: wz + rnd(-1, 1), t: 0, d: 0, vida: rnd(5, 7), r0: rnd(3, 5) * k, r1: rnd(14, 22) * k * (1 - u * 0.4),
    c0: [0.09, 0.08, 0.075], c1: [0.3, 0.29, 0.29], a0: 0.8 * (1 - u * 0.5), a1: 0, suma: false, sube: 10 }), { ralenta: 1.3 });
  emisor(e.x, piso + 0.5, e.z, rnd(D.fuegoQueda[0], D.fuegoQueda[1]), 0.1, (em, u) => ({ x: em.x + rnd(-3, 3) * k, y: em.y + rnd(0, 1.5) * k, z: em.z + rnd(-3, 3) * k,
    vx: wx * 0.3, vy: rnd(2, 5), vz: wz * 0.3, t: 0, d: 0, vida: rnd(0.5, 0.85), r0: rnd(1.5, 3) * k * (1 - u * 0.6), r1: rnd(4, 7) * k * (1 - u * 0.6),
    c0: [1, 0.85, 0.4], c1: [0.7, 0.15, 0.03], a0: 0.95, a1: 0, suma: true, sube: 7 }), { ralenta: 0.6 });
}

/** Un cuadro: `nuevos` = la cola de islas.js; `suelo(x, z)` para el rebote; `dt` en s. */
export function frame(nuevos, dt, suelo) {
  if (!R.ped) return;
  R.suelo = suelo;
  R.tok = Math.min(TOK_MAX, R.tok + TOK_POR_S * dt);
  for (const e of nuevos) nuevo(e, suelo);
  if (R.sonda.length) { for (const e of R.sonda) nuevo(e, suelo); R.sonda.length = 0; }
  pasoEmisores(dt);
  for (const s of R.bolas) {
    const o = s.userData.v; if (!o) continue;
    o.t += dt;
    if (o.t < o.d) { s.visible = false; continue; }
    const u = (o.t - o.d) / o.vida;
    if (u >= 1) { s.userData.v = null; s.visible = false; continue; }
    const fr = Math.exp(-dt * 1.6);
    o.vx *= fr; o.vz *= fr; o.vy = o.vy * fr - (o.g || 0) * dt + (o.sube || 0) * dt;
    o.x += o.vx * dt; o.y += o.vy * dt; o.z += o.vz * dt;
    const e = 1 - Math.pow(1 - u, 2), r = o.r0 + (o.r1 - o.r0) * e;
    s.position.set(o.x, o.y, o.z); s.scale.set(r, r, 1);
    if (o.gira) s.material.rotation += o.gira * dt;
    s.material.color.setRGB(o.c0[0] + (o.c1[0] - o.c0[0]) * u, o.c0[1] + (o.c1[1] - o.c0[1]) * u, o.c0[2] + (o.c1[2] - o.c0[2]) * u);
    s.material.opacity = o.a0 + (o.a1 - o.a0) * u;
    s.visible = true;
  }
  const P = R.ped.geometry.attributes.position, C = R.ped.geometry.attributes.color;
  let n = 0;
  for (let i = R.pedV.length - 1; i >= 0; i--) {
    const p = R.pedV[i];
    p.t += dt;
    if (p.t >= p.vida) { R.pedV.splice(i, 1); continue; }
    if (p.t < 0) continue;   // (las chispas de un secundario esperan su momento)
    p.vy -= (p.g || 22) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    const h = suelo(p.x, p.z);
    if (p.y < h) { p.y = h; p.vy = Math.abs(p.vy) * 0.3; p.vx *= 0.5; p.vz *= 0.5; }
    const f = 1 - p.t / p.vida;
    P.setXYZ(n, p.x, p.y, p.z); C.setXYZ(n, p.c[0] * f, p.c[1] * f, p.c[2] * f); n++;
  }
  R.ped.geometry.setDrawRange(0, n);
  P.needsUpdate = C.needsUpdate = true;
  pasoPartes(dt, suelo);
  pasoChapas(dt, suelo);
  pasoOndas(dt);
}

/** Fuera de las islas: todo apagado (y la cola vieja, descartada). */
export function apagar() {
  if (!R.ped) return;
  for (const s of R.bolas) { s.visible = false; s.userData.v = null; }
  R.pedV.length = 0; R.ped.geometry.setDrawRange(0, 0);
  for (const s of R.partes) { s.visible = false; s.userData.v = null; }
  for (const s of R.chapas) { s.visible = false; s.userData.v = null; }
  for (const m of R.ondas) { m.visible = false; m.userData.v = null; }
  R.emi.fill(null); R.sonda.length = 0;
}
if (typeof window !== 'undefined') window.__est3d = () => JSON.stringify({ bolas: R.bolas.filter(s => s.visible).map(s => [s.position.x | 0, s.position.y | 0, s.position.z | 0, s.scale.x | 0]).slice(0, 3),
  vivas: R.bolas.filter(s => s.userData.v).length, ped: R.pedV.length, partes: R.partes.filter(s => s.userData.v).length,
  chapas: R.chapas.filter(s => s.userData.v).length, emisores: R.emi.filter(Boolean).length, fichas: +R.tok.toFixed(1) });
/** Sonda: `__estallido('perfora')` pone un estallido de ese tipo a `dist` m adelante del avion, a `alto` m sobre el
 *  suelo (o el mar). `__estallido('detona', 200, 3, 1.5)`. Tipos: fuego agua avion chispas astillas perfora detona humea casa fierro nafta. */
if (typeof window !== 'undefined') window.__estallido = (tipo = 'perfora', dist = 150, alto = null, esc = 1) => {
  const m = marco(); if (!m || !R.ped) return false;
  const x = m.x + Math.sin(m.yaw) * dist, z = m.z - Math.cos(m.yaw) * dist;
  const h = R.suelo ? R.suelo(x, z) : Math.max(m.g, 0);
  R.sonda.push({ x, y: h + (alto != null ? alto : tipo === 'perfora' ? 1.5 : 4), z, esc, tipo, vx: Math.sin(m.yaw) * 60, vz: -Math.cos(m.yaw) * 60 });
  return true;
};
