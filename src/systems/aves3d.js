// LA BANDADA DEL 3D (PLAN_MEJORAS_3D P2/B1).
//
// La leccion de Pigeon (docs/proyecto/ANALISIS_REFERENTES_3D §1): un cielo vacio no tiene tamaño.
// Las aves no son un adorno — son PARALAJE y son ESCALA: pasan cerca, se cruzan, y de golpe se
// entiende cuan grande es el mundo y cuan rapido vas. Cuestan casi nada y no tocan el juego.
//
// PRESENTACION PURA (lo que pide el plan): no colisionan, no puntuan, no aparecen en ninguna
// cuenta. Las aves que SI hacen daño son las del pasillo 2D (`type: 'birds'` en render/world.js)
// y siguen siendo esas: aca no se duplica ninguna regla, solo la silueta.
//
// TODO ES FUNCION DEL TIEMPO, sin un solo `Math.random()` por cuadro (trampa §1 del spec del
// agua): cada ave sale de su semilla y del reloj del run. Dos corridas iguales dan la misma
// bandada, y una pausa no le deja el aleteo colgado.
import { AVES3D, AVES3D_MAX, AVES3D_BANDADAS, AVES3D_TILE, AVES3D_ENVERG } from '../data/tuning.js';

const POR_BANDADA = 6;
// el mundo se repite cada TILE metros: la bandada que se te fue por atras vuelve a entrar por
// adelante. Es el mismo truco que la alfombra de puntos — nadie mira dos veces al mismo pajaro.
const wrap = (v, t) => { const h = t / 2; return ((v + h) % t + t) % t - h; };

let on = AVES3D;
// diagnostico de la sonda: a que distancia paso el ave mas cercana en el ultimo cuadro.
let dMin = 0, nCerca = 0;

/** Silueta de gaviota en tres poses. Es la MISMA receta del ave 2D (render/world.js): cuerpo con
 *  panza y dos alas que suben y bajan JUNTAS —alternadas es como aletea un murcielago de
 *  historieta, no una gaviota— y punta de ala oscura. `pose`: 1 arriba · 0 planeo · -1 abajo. */
function pintarAve(x, w, h, pose, blanca) {
  const cuerpo = blanca ? '#eef2f0' : '#1e2422';
  const punta = blanca ? '#6d7b7d' : '#0d1110';
  const panza = blanca ? '#c9d4d2' : '#333b38';
  x.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, lift = pose * h * 0.16;
  x.fillStyle = cuerpo; x.fillRect(cx - 1, cy - 1, 2, 2);
  x.fillStyle = panza; x.fillRect(cx - 1, cy, 2, 1);
  for (const sg of [-1, 1]) {
    const x0 = sg < 0 ? cx - w * 0.34 : cx + 2;
    x.fillStyle = cuerpo; x.fillRect(x0, cy - lift, w * 0.32, 1);
    // la mitad exterior acompaña mas el gesto: el quiebre del ala en la batida
    x.fillStyle = punta;
    x.fillRect(sg < 0 ? x0 : x0 + w * 0.2, cy - lift * 1.7, w * 0.12, 1);
  }
}

/** Construye las aves y las cuelga de la escena. `tex` es el helper de canvas del arena. */
export function crear(THREE, sc, tex) {
  if (!THREE || !sc) return null;
  // seis materiales y nada mas: dos especies por tres poses. Cambiar de pose es cambiar de
  // material, que con treinta sprites no se nota y evita un shader propio.
  const mats = [];
  for (let b = 0; b < 2; b++) {
    for (let p = 0; p < 3; p++) {
      mats.push(new THREE.SpriteMaterial({
        map: tex(16, 16, (x, w, h) => pintarAve(x, w, h, p - 1, b === 0)),
        transparent: true, depthWrite: false,
      }));
    }
  }
  const aves = [];
  const n = Math.min(AVES3D_MAX, AVES3D_BANDADAS * POR_BANDADA);
  for (let i = 0; i < n; i++) {
    const s = new THREE.Sprite(mats[0]);
    s.scale.setScalar(AVES3D_ENVERG);
    s.visible = on;
    // la semilla: numeros feos a proposito (primos y decimales sin redondear) para que las
    // bandadas no caigan en fila ni compartan periodo
    s.userData = {
      band: (i / POR_BANDADA) | 0,
      idx: i % POR_BANDADA,
      blanca: ((i * 7) % 5) < 3,
      fase: (i * 2.399) % 6.283,
    };
    sc.add(s); aves.push(s);
  }
  return { aves, mats };
}

/** Un cuadro. `t` es el reloj absoluto del run; `px/py/pz` el avion (las bandadas se envuelven
 *  alrededor suyo, nunca lo siguen). */
export function frame(A, t, px, py, pz) {
  if (!A) return;
  dMin = 1e9; nCerca = 0;
  for (const s of A.aves) {
    s.visible = on;
    if (!on) continue;
    const u = s.userData, b = u.band;
    // RUTA DE LA BANDADA: rumbo propio y constante, altura propia. Recta y no circular a
    // proposito — una bandada que gira alrededor tuyo se lee como un adorno atado a la camara.
    const rumbo = b * 1.973, vel = 12 + b * 2.4;
    const cx = Math.cos(rumbo) * vel * t + b * 311.7;
    const cz = Math.sin(rumbo) * vel * t + b * 173.3;
    // la altura de la bandada vive en la BANDA DEL VUELO (el juego se vuela entre 20 y 120 m):
    // aves a 300 m de altura son un punto que nadie mira.
    const alt = 32 + b * 19 + Math.sin(t * 0.23 + b) * 9;
    // formacion en V dentro de la bandada, con las de atras un poco mas abajo
    const lado = (u.idx % 2 ? 1 : -1) * (1 + ((u.idx / 2) | 0)) * 7;
    const atras = ((u.idx / 2) | 0) * 9;
    let x = wrap(cx + lado - px, AVES3D_TILE) + px;
    let z = wrap(cz - atras - pz, AVES3D_TILE) + pz;
    let y = alt + Math.sin(t * 1.7 + u.fase) * 1.6;
    // ESQUIVE COSMETICO: si el avion se les viene encima, la bandada se abre. No es fisica ni
    // colision —no hay nada que chocar— es que un pajaro no se queda quieto cuando le pasa un
    // A-4 por al lado, y verlos abrirse es la mitad de la gracia.
    const dx = x - px, dz = z - pz, dy = y - py;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 < 3600) {                       // 60 m
      const d = Math.sqrt(d2) || 1, f = (60 - d) * 0.9;
      x += dx / d * f; y += dy / d * f + 4; z += dz / d * f;
    }
    if (d2 < dMin * dMin) dMin = Math.sqrt(d2);
    if (d2 < 250000) nCerca++;              // dentro de 500 m
    s.position.set(x, y, z);
    // el aleteo: cada ave con su fase, tres poses (con dos, el ala teletransporta)
    const w = Math.sin(t * 9 + u.fase);
    const pose = w > 0.4 ? 2 : w < -0.4 ? 0 : 1;
    const m = A.mats[(u.blanca ? 0 : 3) + pose];
    if (s.material !== m) s.material = m;
  }
}

// ---- SONDA de desarrollo (P2/B1) — QUITAR cuando el default quede decidido ----
if (typeof window !== 'undefined') window.__aves3d = (v) => {
  if (v !== undefined) on = !!(+v);
  return JSON.stringify({ on, max: AVES3D_MAX, bandadas: AVES3D_BANDADAS, porBandada: POR_BANDADA,
    dMin: +dMin.toFixed(1), nCerca, enverg: AVES3D_ENVERG });
};
