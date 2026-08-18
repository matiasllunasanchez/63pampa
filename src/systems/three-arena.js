// MUNDO 3D DEL ARENA: el espacio abierto donde se pelea el climax.
//
// Escena PROPIA, distinta de la del momentum clasico (systems/three-world.js). No es capricho:
// aquella esta construida para una camara que mira SIEMPRE a -z y solo se traslada en x — el
// cielo es un plano puesto adelante y el mar se genera en filas de profundidad con la forma del
// frustum. Con una camara libre las dos cosas se rompen (girás y no hay cielo ni mar). Aca el
// mundo se puede mirar desde cualquier lado:
//
//   · CIELO: un DOMO (esfera invertida) con el degrade de la paleta. El sol vive EN el domo.
//   · MAR: un plano grande + la ALFOMBRA DE PUNTOS del juego, ambos centrados en el AVION y
//     re-centrados por frame. La grilla de puntos se ANCLA a la reja del mundo (snap al paso)
//     para que los puntos no "naden" cuando el avion se mueve.
//   · BUQUE: el mismo modelo compartido (systems/ship3d.js) pero a ESCALA REAL.
//
// ESCALA: 1 unidad = 1 METRO. El buque mide SHIP_LEN metros de eslora. Asi las constantes de
// vuelo del juego base (G=22, TH=55 y las velocidades ~60-280) se transfieren SIN conversion —
// en la escena del momentum una unidad son ~2.8 m y heredarlas habria hecho todo 3x mas rapido.
//
// El modulo NO lee estado del juego: frame(w) recibe un snapshot de solo lectura.

import { SHIP_CLASS } from '../data/ships.js';
import { buildShips, shipDeck, resetShipZones } from './ship3d.js';
import { useRenderer, has3D } from './three-world.js';

const THREE = window.THREE || null;

// ---- geometria del mundo, en METROS ----
export const SHIP_LEN = 125;               // eslora del buque (un Tipo 42 real)
export const RING_R = 700;                 // radio de la zona de combate
export const SEA_Y = 0;                    // la linea de flotacion es el nivel del mar
const DOME_R = 4000;                       // radio del domo de cielo
const SEA_PLANE = 14000;                   // plano de mar (tapa hasta la niebla)
// CUANTO SE MUEVE EL MAR 3D respecto del 2D (F8.1). Ver el comentario en el bucle de puntos.
const SEA_3D_AMP = 0.6;
const DOT_STEP = 6;                        // paso de la alfombra de puntos
const DOT_N = 104;                         // puntos por lado (104*6 ≈ 624 m alrededor del avion)
// NIEBLA lejos: el ring mide 700 m de radio, asi que si la niebla mordiera antes se comeria el
// mar del combate entero y todo quedaria del color del horizonte (probado: mar marron).
const FOG_NEAR = 900, FOG_FAR = 5200;

// resolucion de render: la MISMA grilla logica del juego (480x270) y blit 1:1 — pixel art
// coherente con el resto. Supersamplear y bajar con nearest solo ensuciaria los bordes.
export const AW = 480, AH = 270;

const A3 = {
  ready: false, failed: false, on: false, palKey: '',
  scene: null, cam: null, ships: null, ship: null, dome: null, sun: null,
  sea: null, dots: null, dotsGeo: null, cols: null,
};

function tex(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter;
  return t;
}

function init() {
  if (A3.ready) return true;
  if (A3.failed || !has3D) return false;
  try {
    const sc = new THREE.Scene();
    sc.fog = new THREE.Fog(new THREE.Color('#7d6a4e'), FOG_NEAR, FOG_FAR);
    // camara: 65° de campo, lejos hasta pasar el domo
    const cam = new THREE.PerspectiveCamera(65, AW / AH, 1, DOME_R * 2.2);

    // DOMO: esfera vista desde adentro. `depthWrite:false` + renderOrder bajo = telon de fondo.
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(DOME_R, 24, 16),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, depthWrite: false }));
    dome.renderOrder = -10; sc.add(dome); A3.dome = dome;

    // SOL: un rect pixelado (como el 2D) plantado en el domo; se orienta a camara por frame
    const sun = new THREE.Mesh(new THREE.PlaneGeometry(420, 300),
      new THREE.MeshBasicMaterial({ transparent: true, fog: false, depthWrite: false }));
    sun.renderOrder = -9;
    sun.position.set(-DOME_R * 0.42, DOME_R * 0.10, -DOME_R * 0.88);
    sc.add(sun); A3.sun = sun;

    // MAR: plano grande y plano (el oleaje lo cuenta la alfombra de puntos, que es el look del
    // juego). Se re-centra en el avion por frame, asi nunca se ve el borde.
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(SEA_PLANE, SEA_PLANE, 1, 1),
      new THREE.MeshBasicMaterial({}));
    // el plano va HUNDIDO bajo el nivel del mar: la alfombra de puntos oscila con seaH y, con el
    // plano justo en y=0, la mitad de los puntos (los de los senos de la ola) quedaban TAPADOS
    // por el plano opaco y el mar se veia liso, sin textura.
    sea.rotation.x = -Math.PI / 2; sea.position.y = SEA_Y - 3.2;
    sea.renderOrder = -5; sc.add(sea); A3.sea = sea;

    // ALFOMBRA DE PUNTOS: grilla cuadrada alrededor del avion (no un frustum), desplazada por
    // seaH. Es lo que hace que el mar se lea como el mar del juego y da referencia de velocidad.
    const n = DOT_N * DOT_N;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const dots = new THREE.Points(g, new THREE.PointsMaterial({
      vertexColors: true, size: 2.8, sizeAttenuation: true, transparent: true, opacity: 0.75,
    }));
    dots.frustumCulled = false; sc.add(dots);
    A3.dots = dots; A3.dotsGeo = g;

    // luces: ambiente frio + sol calido + rim (mismo esquema que el momentum)
    sc.add(new THREE.AmbientLight(0xaebccc, 1.6));
    const dl = new THREE.DirectionalLight(0xe8c07a, 1.7); dl.position.set(-320, 380, 260); sc.add(dl);
    const rim = new THREE.DirectionalLight(0xb06a35, 0.6); rim.position.set(120, 140, -600); sc.add(rim);

    // BUQUE a escala real, con la cubierta a su francobordo sobre el agua
    const ships = buildShips(THREE, SHIP_LEN);
    for (const k in ships) {
      ships[k].position.set(0, SEA_Y + shipDeck(SHIP_LEN), 0);
      ships[k].visible = false;
      sc.add(ships[k]);
    }
    A3.ships = ships; A3.ship = ships.t42;

    A3.scene = sc; A3.cam = cam; A3.ready = true;
    return true;
  } catch (e) { console.error('ARENA3D INIT FAIL', e && e.message, e && e.stack); A3.failed = true; return false; }
}

/** (re)pinta domo, sol y mar con la paleta vigente. Solo trabaja si cambio FONDO/AGUA. */
function palette(w) {
  const key = w.cfg.sky + '|' + w.cfg.water;
  if (A3.palKey === key) return;
  A3.palKey = key;
  const S = w.SKY, WA = w.WATER;
  A3.scene.fog.color.set(S.horizon);
  const old = [A3.dome.material.map, A3.sun.material.map];
  // DOMO: la UV de la esfera va v=0 abajo y v=1 arriba, y la imagen se lee con la fila 0 arriba →
  // el horizonte (ecuador) cae en la MITAD del canvas. Mismo degrade que el cielo 2D.
  A3.dome.material.map = tex(4, 512, (x) => {
    const g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, S.skyTop); g.addColorStop(0.30, S.skyTop);
    g.addColorStop(0.42, S.skyMid); g.addColorStop(0.487, S.horizon);
    g.addColorStop(0.50, S.sunGlow); g.addColorStop(0.515, S.horizon);
    g.addColorStop(0.62, WA.base0); g.addColorStop(1, '#0a1014');
    x.fillStyle = g; x.fillRect(0, 0, 4, 512);
  });
  A3.dome.material.needsUpdate = true;
  // SOL pixelado, igual que el 2D: rect duro + glow, nada de circulos suaves
  A3.sun.material.map = tex(64, 64, (x) => {
    x.clearRect(0, 0, 64, 64);
    x.globalAlpha = 0.35; x.fillStyle = S.sunGlow; x.fillRect(2, 13, 61, 37);
    x.globalAlpha = 1; x.fillStyle = S.sun; x.fillRect(11, 20, 42, 24);
  });
  A3.sun.material.needsUpdate = true;
  A3.sea.material.color.set(WA.base1);
  const c = h => { const k2 = new THREE.Color(h); return [k2.r, k2.g, k2.b]; };
  A3.cols = [c(WA.crest), c(WA.mid), c(WA.deep), c(WA.base1), c(WA.spark)];
  for (const t of old) if (t) t.dispose();
}

/** Un frame del arena. `w` trae el estado del avion, la paleta y seaH. false ⇒ no hay 3D. */
export function frame(w) {
  A3.on = false;
  // LA ESCENA SE COMPARTE con la fase PASADA (SPEC_MODO_PASADA §3): es el mismo mar, el mismo
  // buque y la misma camara puesta donde esta el avion. Lo que cambia entre las dos fases es el
  // reglamento, que vive en los sistemas — este modulo solo recibe un avion y lo dibuja.
  if ((w.state !== 'arena' && w.state !== 'pasada') || !w.arena) return false;
  if (!init()) { window.__a3 = 'init false'; return false; }
  const r = useRenderer(AW, AH);
  if (!r) { window.__a3 = 'no renderer'; return false; }
  window.__a3 = 'ok';
  palette(w);

  const A = w.arena, px = A.pos.x, py = A.pos.y, pz = A.pos.z;

  // buque de la mision (los otros, invisibles)
  const cls = SHIP_CLASS[w.objectiveShip] || 't42';
  for (const k in A3.ships) A3.ships[k].visible = k === cls;
  A3.ship = A3.ships[cls];

  // El mar se re-centra bajo el avion (nunca se ve su borde). El DOMO va centrado en el AVION,
  // altura incluida: si se quedara en y=0 mientras volas alto, su ecuador caeria por debajo del
  // horizonte real del mar (a 620 m son 9°) y aparecia una banda de "suelo" del domo sobre el
  // agua — se veia como un manchon marron cruzando la pantalla. El sol acompaña al domo.
  A3.sea.position.x = px; A3.sea.position.z = pz;
  A3.dome.position.set(px, py, pz);
  A3.sun.position.set(px - DOME_R * 0.42, py + DOME_R * 0.10, pz - DOME_R * 0.88);

  // ALFOMBRA DE PUNTOS anclada a la reja del mundo (snap al paso): si la grilla se centrara en
  // el avion sin snap, los puntos se deslizarian con vos y el mar se veria "pegado" al avion.
  {
    const p = A3.dotsGeo.attributes.position, c = A3.dotsGeo.attributes.color;
    const [CR, MI, DE, BA, SP] = A3.cols;
    const half = (DOT_N - 1) / 2 * DOT_STEP;
    const ox = Math.round(px / DOT_STEP) * DOT_STEP - half;
    const oz = Math.round(pz / DOT_STEP) * DOT_STEP - half;
    let i = 0;
    for (let iz = 0; iz < DOT_N; iz++) {
      const wz = oz + iz * DOT_STEP;
      for (let ix = 0; ix < DOT_N; ix++, i++) {
        const wx = ox + ix * DOT_STEP;
        const h = w.seaH(wx, wz);
        // AMPLITUD REDUCIDA (SPEC_AGUA_OLAS F8.1). Es la MISMA agua que el 2D —la de core/sea.js,
        // no una copia— pero aca se la mira casi desde arriba y a escala de metros: con la
        // amplitud entera el horizonte hervia y mareaba. El COLOR sigue leyendo la altura REAL
        // (`h`), asi que el mar se ve igual de vivo; lo que se baja es cuanto se mueve.
        p.setXYZ(i, wx, SEA_Y + h * SEA_3D_AMP, wz);
        // color por altura de ola, con fade a la base con la distancia (receta del mar 2D)
        let hn = (h + 1.4) / 4.8; hn = hn < 0 ? 0 : hn > 1 ? 1 : hn;
        if (Math.sin(wz * 0.06 - w.t * 2.6 + wx * 0.045) > 0.6) hn = Math.min(1, hn + 0.24);
        let src = hn > 0.72 ? CR : hn > 0.42 ? MI : DE;
        if (hn > 0.78 && Math.sin(wx * 12.9 + wz * 7.3 + w.t * 6) > 0.7) src = SP;
        // ESPUMA DE PROA Y LINEA DE FLOTACION (F8.2). El buque estaba posado sobre el agua como
        // una calcomania: nada decia que estuviera METIDO en ella. Ahora los puntos del mar que
        // le tocan el casco se pintan de espuma, y detras de la popa se abre una V corta.
        //
        // NO HAY GEOMETRIA NUEVA NI PARTICULAS: son los MISMOS puntos de la alfombra, pintados de
        // otro color. Es lo que pide el spec (§F8.2) y ademas es lo unico que no cuesta nada — la
        // alfombra ya se recorre entera todos los cuadros.
        if (w.objectiveShip) {
          const dx = Math.abs(wx) - SHIP_LEN / 2, dz = Math.abs(wz) - shipBeamM();
          const dCasco = Math.hypot(Math.max(0, dx), Math.max(0, dz));
          const estela = wx < -SHIP_LEN / 2
            && Math.abs(Math.abs(wz) - (-SHIP_LEN / 2 - wx) * 0.22 - shipBeamM()) < 5
            && wx > -SHIP_LEN / 2 - 90;
          if (dCasco < 7 || estela) {
            // late con el tiempo para que no sea un contorno pintado: es agua batida
            if (Math.sin(wx * 0.7 + wz * 0.9 + w.t * 3.4) > (dCasco < 7 ? -0.7 : 0.1)) src = SP;
          }
        }
        const d = Math.hypot(wx - px, wz - pz);
        const f = Math.min(1, d / (half * 0.95));
        c.setXYZ(i, src[0] + (BA[0] - src[0]) * f, src[1] + (BA[1] - src[1]) * f, src[2] + (BA[2] - src[2]) * f);
      }
    }
    p.needsUpdate = true; c.needsUpdate = true;
  }

  // CAMARA. En 1a persona va CLAVADA al morro (es tu cabeza: la rigidez ahi es natural) y rola
  // entera con el avion. En 3a va detras y arriba CON RESORTE: perseguir la posicion objetivo
  // con retardo es lo que absorbe cada sacudon del avion — la camara rigida era la mitad de lo
  // "tosco" del vuelo. El alabeo en 3a va atenuado (rolar el horizonte entero a esta resolucion
  // lo vuelve ilegible).
  const f = A.fwd;
  const dt3 = Math.max(0, Math.min(0.05, w.t - (A3.lastT || w.t))); A3.lastT = w.t;
  if (w.view === 3) {
    const tx = px - f.x * 26, ty = py - f.y * 26 + 9, tz = pz - f.z * 26;
    const lx = px + f.x * 60, ly = py + f.y * 60 + 1.5, lz = pz + f.z * 60;
    if (!A3.cs) A3.cs = { x: tx, y: ty, z: tz, lx, ly, lz };
    const cs = A3.cs, k1 = Math.min(1, dt3 * 6), k2 = Math.min(1, dt3 * 9);
    cs.x += (tx - cs.x) * k1; cs.y += (ty - cs.y) * k1; cs.z += (tz - cs.z) * k1;
    cs.lx += (lx - cs.lx) * k2; cs.ly += (ly - cs.ly) * k2; cs.lz += (lz - cs.lz) * k2;
    A3.cam.position.set(cs.x, cs.y, cs.z);
    A3.cam.lookAt(cs.lx, cs.ly, cs.lz);
    // roll PLENO: con el modelo E2 el alabeo ES el viraje, y atenuarlo (el 0.35 anterior)
    // escondia la informacion que ahora gobierna el avion. El pasillo ya rola el horizonte
    // entero por default (HORIZONTE: TOTAL); esto es lo mismo dicho en 3D.
    A3.cam.rotateZ(-A.roll);
  } else {
    A3.cs = null;                                // al volver a 3a, el resorte arranca fresco
    A3.cam.position.set(px + f.x * 2, py + f.y * 2, pz + f.z * 2);
    A3.cam.lookAt(px + f.x * 80, py + f.y * 80, pz + f.z * 80);
    A3.cam.rotateZ(-A.roll);
  }
  A3.sun.quaternion.copy(A3.cam.quaternion);   // billboard: el sol siempre de frente

  r.render(A3.scene, A3.cam);
  A3.on = true;
  return true;
}

// ---------- interfaz para el juego ----------
export function available() { return has3D && !A3.failed; }
export function isOn() { return A3.on; }
export function view() { return useRenderer(AW, AH).domElement; }
export function resetZones() { resetShipZones(A3.ships); }

const _v = has3D ? new THREE.Vector3() : null;
/** mundo → pixel de la grilla del juego (480x270). `vis` = delante de la camara. */
export function project(x, y, z) {
  if (!A3.ready) return { x: 0, y: 0, vis: false };
  _v.set(x, y, z).project(A3.cam);
  return { x: (_v.x + 1) / 2 * AW, y: (1 - _v.y) / 2 * AH, vis: _v.z < 1 };
}

// ESCALA APARENTE — la usa el PASILLO para calzar el handoff (R3). Vive ACA y no en el render
// porque el numero sale del CAMPO DE LA CAMARA (CAM_FOV) y de la grilla (AH): dos copias de esta
// cuenta se desincronizan sola la primera vez que alguien toque el campo. A 700 m un buque de 125 m
// visto DE PROA mide ~7 px de manga: chico de verdad, y esa es la distancia que el pasillo tiene
// que estar mostrando en el ultimo cuadro si el corte no va a doler.
export const CAM_FOV = 65;
export const pxPerM = d => (AH / 2) / Math.tan(CAM_FOV * Math.PI / 360) / Math.max(1, d);
/** Media manga y altura del casco, en METROS — la silueta que el pasillo tiene que imitar de proa.
 *  Sale de la misma caja gruesa que usa hitsShip(): una sola definicion de "que tan gordo es". */
export const shipBeamM = () => SHIP_LEN * 0.09;
export const shipTopM = () => shipDeck(SHIP_LEN) + SHIP_LEN * 0.16;

const _c = has3D ? new THREE.Vector3() : null;
/** Rect en pantalla de una zona critica (proyectando las 8 esquinas de su caja). null si la
 *  zona no existe o quedo entera detras de la camara. */
export function zoneRect3D(id) {
  if (!A3.ready || !A3.ship) return null;
  const m = A3.ship.children.find(c2 => c2.userData.zone === id);
  if (!m) return null;
  const g = m.geometry.parameters;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, vis = false;
  for (let i = 0; i < 8; i++) {
    _c.set((i & 1 ? 0.5 : -0.5) * g.width, (i & 2 ? 0.5 : -0.5) * g.height, (i & 4 ? 0.5 : -0.5) * g.depth);
    m.localToWorld(_c); _c.project(A3.cam);
    if (_c.z < 1) vis = true;
    const sx = (_c.x + 1) / 2 * AW, sy = (1 - _c.y) / 2 * AH;
    if (sx < x0) x0 = sx; if (sx > x1) x1 = sx;
    if (sy < y0) y0 = sy; if (sy > y1) y1 = sy;
  }
  return vis ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}

/** Rect en pantalla del CASCO ENTERO (la caja gruesa de hitsShip). Es la silueta que el jugador
 *  ve del buque, y la sonda con la que R3 compara los dos lados del corte. */
export function shipRect3D() {
  if (!A3.ready) return null;
  const L = SHIP_LEN, hw = shipBeamM(), top = shipTopM();
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, vis = false;
  for (let i = 0; i < 8; i++) {
    _c.set((i & 1 ? 0.5 : -0.5) * L, SEA_Y + (i & 2 ? top : 0), (i & 4 ? hw : -hw));
    _c.project(A3.cam);
    if (_c.z < 1) vis = true;
    const sx = (_c.x + 1) / 2 * AW, sy = (1 - _c.y) / 2 * AH;
    if (sx < x0) x0 = sx; if (sx > x1) x1 = sx;
    if (sy < y0) y0 = sy; if (sy > y1) y1 = sy;
  }
  return vis ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}

const _rc = has3D ? new THREE.Raycaster() : null;
const _o = has3D ? new THREE.Vector3() : null;
const _d = has3D ? new THREE.Vector3() : null;
/** DISPARO: rayo desde el morro. Devuelve { zone, point, dist } del primer pedazo de buque
 *  tocado — la chapa TAPA, asi que una zona del lado ciego no se puede batir: hay que volar
 *  hasta verla. null si el tiro paso de largo. */
export function shootRay(from, dir, maxDist) {
  if (!A3.ready || !A3.ship || !A3.ship.visible) return null;
  _o.set(from.x, from.y, from.z); _d.set(dir.x, dir.y, dir.z).normalize();
  _rc.set(_o, _d);
  _rc.far = maxDist || 2000;
  const hits = _rc.intersectObjects(A3.ship.children, false);
  if (!hits.length) return null;
  return { zone: hits[0].object.userData.zone || null, point: hits[0].point, dist: hits[0].distance };
}

const _wp = has3D ? new THREE.Vector3() : null;
/** Posicion en el MUNDO de una zona critica (la boca del cañon AA que dispara). */
export function zoneWorldPos(id) {
  if (!A3.ready || !A3.ship) return null;
  const m = A3.ship.children.find(c2 => c2.userData.zone === id);
  if (!m) return null;
  m.getWorldPosition(_wp);
  return { x: _wp.x, y: _wp.y, z: _wp.z };
}

/** Pinta una zona como destruida (chamuscado sobre el modelo). */
export function charZone(id) {
  if (!A3.ship) return;
  const m = A3.ship.children.find(c2 => c2.userData.zone === id);
  if (m) m.material.color.set('#171b1f');
}

/** ¿El punto esta dentro del casco? (colision gruesa del avion contra el buque) */
export function hitsShip(x, y, z) {
  const L = SHIP_LEN, halfW = L * 0.09, top = shipDeck(L) + L * 0.16;
  return Math.abs(x) < L / 2 + 4 && Math.abs(z) < halfW + 4 && y < SEA_Y + top;
}
