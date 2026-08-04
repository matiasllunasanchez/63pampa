// BUQUE 3D de cajas, por clase (t42 / t21 / log). Lo comparten las DOS escenas del climax:
// el MOMENTUM clasico (camara en rail, fallback sin vuelo libre) y el ARENA (vuelo libre).
//
// Vive aparte porque las ZONAS CRITICAS son geometria etiquetada (`userData.zone`), no rects de
// pantalla: el disparo las encuentra por raycast y el daño se pinta sobre la caja. Si cada escena
// tuviera su copia del layout, la primera vez que se agregue un buque una de las dos quedaria
// vieja sin que nada avise — y las zonas son DATA compartida con data/ships.js.
//
// ARTE (E8, "el barco se ve horrible" — playtest 2/8): sigue siendo cajas, pero vestidas.
//   · TEXTURAS pintadas por canvas (planchas, sombra bajo la borda, oxido en la flotacion,
//     degrade vertical de luz que las caras planas Lambert no tienen). Se pintan EN LOS COLORES
//     REALES de la pieza y el material queda BLANCO: asi el tinte multiplicativo sigue libre
//     para el chamuscado de zonas (charZone oscurece material.color y la textura se quema).
//   · CONTORNO pixel art: casco invertido (BackSide) un poco mas grande, ANIDADO adentro de cada
//     caja. Anidado y sin raycast a proposito: shootRay mira los HIJOS DIRECTOS del buque y toma
//     hits[0] — un contorno raycasteable seria siempre el primer impacto y taparia los tiros.
//   · SILUETAS chicas que venden el barco: cañon de proa con tubo, tubos en las AA, botes,
//     cruceta y antenas. Son decorado (sin `zone`): la chapa tapa, igual que el resto.
//
// ESCALA: el modelo se construye desde la ESLORA `L` en las unidades de quien lo pida. El modulo
// de altura `U` sale de la misma proporcion del dibujo 2D, asi el buque se ve igual a cualquier
// escala:  U = L * SHIP_UH / 393.6   (393.6 = W*0.82, el ancho con el que se calibro la barcaza).
// El MOMENTUM lo pide con L=45 (unidades de ~2.8 m); el ARENA con L=125 (metros reales).

/** modulo de altura del buque para una eslora `L` */
export const shipU = L => L * 13.5 / 393.6;
/** altura de la CUBIERTA sobre la linea de flotacion (en 2D: cubierta a 54 y flotacion a 74.25
 *  bajo el horizonte → 20.25 de francobordo). El origen local del grupo ES la cubierta. */
export const shipDeck = L => L * 20.25 / 393.6;

// ---------- pintura de chapa ----------
// Cada "kind" pinta un canvas chico (pixel art: NearestFilter lo mantiene duro) en el color base
// de la pieza. Cache por kind|color: las tres clases comparten chapas.

/** aclara (f>1) u oscurece (f<1) un color hex css */
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = k => Math.max(0, Math.min(255, Math.round(((n >> k) & 255) * f)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

const PAINTERS = {
  // costado de casco: degrade de luz, filas de planchas, oxido chorreado y una CINTA de
  // flotacion fina (v=0.5, porque la caja del casco esta centrada justo en la linea de agua).
  // La obra viva de abajo va oscura y sobria: entre olas se asoma una franja, no medio casco rojo.
  hull(g, w, h, base) {
    const wl = h / 2;
    for (let y = 0; y < h; y++) {
      g.fillStyle = y < wl ? shade(base, 1.12 - 0.34 * (y / wl)) : shade(base, 0.5);
      g.fillRect(0, y, w, 1);
    }
    g.fillStyle = shade(base, 0.8);
    for (let y = 4; y < wl - 1; y += 5) g.fillRect(0, y, w, 1);          // juntas de planchas
    g.globalAlpha = 0.5;
    for (let x = 7; x < w; x += 13) g.fillRect(x, 0, 1, wl);             // soldaduras verticales
    g.globalAlpha = 1;
    g.fillStyle = shade(base, 0.55); g.fillRect(0, 0, w, 2);             // sombra bajo la borda
    g.fillStyle = '#4a2f28'; g.fillRect(0, wl - 2, w, 4);                // cinta de flotacion
    g.fillStyle = '#6e4a33';                                             // oxido chorreado
    for (let i = 0; i < 22; i++) {
      const x = (i * 37 + ((i * i * 13) % 11)) % w, len = 2 + (i * 7) % 5;
      g.globalAlpha = 0.35 + (i % 3) * 0.15;
      g.fillRect(x, wl - 2 - len, 1, len);
    }
    g.globalAlpha = 1;
  },
  // superestructura: degrade, paneles, escotillas — la chapa "habitada"
  super(g, w, h, base) {
    for (let y = 0; y < h; y++) { g.fillStyle = shade(base, 1.1 - 0.3 * (y / h)); g.fillRect(0, y, w, 1); }
    g.fillStyle = shade(base, 0.85);
    for (let y = 6; y < h; y += 8) g.fillRect(0, y, w, 1);
    g.globalAlpha = 0.5;
    for (let x = 9; x < w; x += 11) g.fillRect(x, 0, 1, h);
    g.globalAlpha = 1;
    g.fillStyle = shade(base, 0.68);                                     // escotillas y tomas
    for (let i = 0; i < 8; i++) g.fillRect((i * 23 + 5) % (w - 4), h - 6 - (i % 3) * 9, 3, 4);
    g.fillStyle = shade(base, 0.55); g.fillRect(0, 0, w, 1);
  },
  // cubierta: tablas a lo largo de la eslora (en la cara de arriba, v corre por la manga)
  deck(g, w, h, base) {
    for (let y = 0; y < h; y++) { g.fillStyle = shade(base, 1.04 - 0.12 * (y / h)); g.fillRect(0, y, w, 1); }
    g.fillStyle = shade(base, 0.88);
    for (let y = 3; y < h; y += 4) g.fillRect(0, y, w, 1);
    g.fillStyle = shade(base, 0.7);
    for (let i = 0; i < 10; i++) g.fillRect((i * 31 + 9) % w, (i * 17) % h, 2, 2);   // amarres
  },
  // costillas verticales: contenedores y deposito del logistico
  ribs(g, w, h, base) {
    for (let y = 0; y < h; y++) { g.fillStyle = shade(base, 1.08 - 0.28 * (y / h)); g.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 5) { g.fillStyle = shade(base, x % 10 ? 0.82 : 1.05); g.fillRect(x, 0, 2, h); }
    g.fillStyle = shade(base, 1.2); g.fillRect(0, 0, w, 1);
  },
};

const texCache = new Map();
function texFor(THREE, kind, base) {
  const key = kind + '|' + base;
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = 96; c.height = 48;
  PAINTERS[kind](c.getContext('2d'), 96, 48, base);
  const tx = new THREE.CanvasTexture(c);
  tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.NearestFilter;   // pixel duro (como m3tex)
  // los hex de arriba son colores CSS (sRGB): sin declararlo, three los toma como lineales y el
  // buque sale LAVADO, mas claro que las mismas chapas pintadas como material.color
  tx.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, tx);
  return tx;
}

/** Las tres clases, ya armadas. `parent.position` la fija quien llame (el origen local es la
 *  cubierta). Cada caja de zona lleva `userData.zone` (el id del layout de data/ships.js) y
 *  `userData.baseCol` para poder despintar el chamuscado al empezar otra corrida. */
export function buildShips(THREE, L) {
  const U = shipU(L);
  const hasDoc = typeof document !== 'undefined';   // sin DOM (pruebas headless): colores planos
  const OUT = L * 0.0045;                           // grosor del contorno, proporcional a la escala
  const outMat = new THREE.MeshBasicMaterial({ color: '#10151a', side: THREE.BackSide });
  // contorno pixel art: casco invertido como HIJO de la caja (hereda transformacion; al ser
  // anidado queda fuera de shipRay/resetShipZones, que solo miran hijos directos del buque)
  const outline = (m, w, h, d) => {
    if (Math.min(w, h, d) < OUT * 3) return;        // piezas finas: el contorno las tragaria
    const o = new THREE.Mesh(new THREE.BoxGeometry(w + OUT * 2, h + OUT * 2, d + OUT * 2), outMat);
    o.raycast = () => { };                          // NUNCA tapa un tiro (ver nota de arriba)
    m.add(o);
  };
  const box = (parent, w, h, d, color, x, y, z, kind) => {
    const mat = kind && hasDoc
      ? new THREE.MeshLambertMaterial({ color: '#ffffff', map: texFor(THREE, kind, color) })
      : new THREE.MeshLambertMaterial({ color });
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); parent.add(m);
    outline(m, w, h, d);
    return m;
  };
  // caja en coords de ZONA (las mismas u/v/w/h de MOM_LAYOUTS): centro x = u*L/2, base v*U sobre
  // la cubierta, tamaño (w*L, h*U). `id` la marca como zona critica. baseCol guarda lo que
  // restaura el reset: blanco si la pieza esta texturada (el color es solo el tinte del daño).
  const zone = (g, id, u, v, w2, h2, depth, color, kind = 'super') => {
    const m = box(g, w2 * L, h2 * U, depth, color, u * L / 2, (v + h2 / 2) * U, 0, kind);
    m.userData.zone = id; m.userData.baseCol = m.material.map ? '#ffffff' : color;
    return m;
  };
  // decorado fino (tubos, mastiles, crucetas): sin textura ni contorno, con rotacion opcional
  const rod = (parent, w, h, d, color, x, y, z, rz = 0, rx = 0) => {
    const m = box(parent, w, h, d, color, x, y, z);
    m.rotation.z = rz; m.rotation.x = rx;
    return m;
  };
  // cañon con tubo: torreta chica + caño inclinado. Es LA silueta que dice "buque de guerra".
  const gun = (g, x, dir, s = 1) => {
    box(g, L * 0.045 * s, U * 0.7 * s, U * 1.2 * s, '#454f56', x, U * 0.35 * s, 0, 'super');
    rod(g, L * 0.055 * s, U * 0.13 * s, U * 0.13 * s, '#39434e', x + dir * L * 0.045 * s, U * 0.62 * s, 0, dir * -0.14);
  };
  // botes salvavidas colgados a las bandas de la superestructura
  const boats = (g, xs) => {
    for (const bx of xs) for (const sd of [-1, 1])
      box(g, L * 0.035, U * 0.28, U * 0.4, '#7d8a93', bx, U * 0.5, sd * U * 1.45);
  };
  // mastil con cruceta y antenas latigo: la fila de palitos contra el cielo vende la escala
  const mast = (g, x, hM) => {
    rod(g, L * 0.012, U * hM, L * 0.012, '#454f56', x, U * hM / 2, 0);
    rod(g, L * 0.006, U * 0.08, U * 1.3, '#454f56', x, U * hM * 0.78, 0);           // cruceta
    rod(g, L * 0.004, U * 1.2, L * 0.004, '#39434e', x + L * 0.03, U * 0.6, U * 0.9);
    rod(g, L * 0.004, U * 1.2, L * 0.004, '#39434e', x + L * 0.03, U * 0.6, -U * 0.9);
  };
  const hull = () => {
    const g = new THREE.Group();
    box(g, L, U * 3, U * 3.4, '#39434e', 0, -U * 1.5, 0, 'hull');                  // casco
    box(g, L * 0.995, U * 0.3, U * 3.5, '#5c6e73', 0, -U * 0.14, 0, 'deck');       // cubierta
    box(g, U * 0.8, U * 1.9, U * 2.2, '#39434e', -L / 2 - U * 0.38, -U * 1.0, 0, 'hull');   // proa
    box(g, U * 0.55, U * 1.8, U * 2.4, '#39434e', L / 2 + U * 0.26, -U * 1.05, 0, 'hull');  // popa
    return g;
  };
  const ships = {};
  {   // Destructor Tipo 42 (SHEFFIELD/COVENTRY): AA proa+popa, mastil con radar, puente
    const s = ships.t42 = hull();
    zone(s, 'bridge', -0.05, 1, 0.20, 2, U * 2.6, '#454f56');
    box(s, L * 0.16, U * 0.45, U * 2.65, '#8fd0e0', -L * 0.025, U * 2.55, 0);   // ventanas
    box(s, L * 0.05, U * 1.8, U * 1.1, '#454f56', L * 0.185, U * 0.9, 0, 'super');   // chimenea
    mast(s, L * 0.05, 2.7);
    zone(s, 'radar', 0.10, 2.7, 0.11, 1.5, L * 0.03, '#525d66');
    gun(s, -L * 0.40, -1);                                                      // el 4.5" de proa
    boats(s, [-L * 0.14, L * 0.10]);
    for (const sd of [-0.52, 0.52]) {
      zone(s, sd < 0 ? 'aa_l' : 'aa_r', sd, 0, 0.15, 1.3, U * 1.5, '#3d474d');
      rod(s, U * 1.0, U * 0.12, U * 0.12, '#2b3338', sd * L / 2, U * 1.5, U * 0.45, sd < 0 ? 0.6 : -0.6);   // tubo AA
      box(s, L * 0.016, U * 0.6, L * 0.016, '#2b3338', sd * L / 2, U * 1.55, U * 0.55);
    }
  }
  {   // Fragata Tipo 21 (ARDENT/ANTELOPE): silueta baja, radar chico, MOTORES al casco
    const s = ships.t21 = hull();
    box(s, L * 0.30, U * 1.6, U * 2.4, '#49545e', -L * 0.05, U * 0.8, 0, 'super');   // superestructura
    box(s, L * 0.13, U * 0.4, U * 2.45, '#8fd0e0', -L * 0.05, U * 1.55, 0);          // ventanas
    mast(s, L * 0.05, 2.7);
    zone(s, 'radar', 0.10, 2.7, 0.09, 1.3, L * 0.025, '#525d66');
    gun(s, -L * 0.38, -1, 0.9);                                                 // el 4.5" de proa
    boats(s, [-L * 0.16]);
    for (const e of [{ u: -0.30, id: 'eng_l' }, { u: 0.26, id: 'eng_r' }]) {
      zone(s, e.id, e.u, -0.3, 0.14, 1.2, U * 2.0, '#333d46', 'hull');          // motores al agua
      box(s, L * 0.05, U * 1.1, U * 0.9, '#49545e', e.u * L / 2, U * 1.15, 0, 'super');  // escape
    }
    for (const sd of [-0.52, 0.52]) {
      zone(s, sd < 0 ? 'aa_l' : 'aa_r', sd, 0, 0.15, 1.3, U * 1.4, '#3d474d');
      rod(s, U * 1.0, U * 0.12, U * 0.12, '#2b3338', sd * L / 2, U * 1.45, U * 0.4, sd < 0 ? 0.6 : -0.6);   // tubo AA
    }
  }
  {   // Logistico (SIR GALAHAD/CONVEYOR): contenedores, AA unica, DEPOSITO, puente a popa
    const s = ships.log = hull();
    zone(s, 'bridge', 0.32, 1, 0.16, 2, U * 2.6, '#4a5058');
    box(s, L * 0.13, U * 0.45, U * 2.65, '#8fd0e0', L * 0.16, U * 2.55, 0);     // ventanas
    box(s, L * 0.04, U * 1.3, U * 0.9, '#4a5058', L * 0.235, U * 0.65, 0, 'super');   // chimenea a popa
    zone(s, 'dep', 0.05, 0, 0.30, 1.6, U * 2.8, '#5a5344', 'ribs');             // deposito
    const crates = ['#6b4a3a', '#44553f', '#3d4a58', '#5a5344'];
    for (let i = 0; i < 5; i++)
      box(s, L * 0.055, U * 0.55, U * (1.6 + (i % 2)), crates[i % 4],
        -L * 0.06 + i * L * 0.055, U * 1.88, 0, 'ribs');
    zone(s, 'aa_c', -0.30, 0, 0.15, 1.3, U * 1.5, '#3d474d');
    rod(s, U * 1.0, U * 0.12, U * 0.12, '#2b3338', -L * 0.15, U * 1.5, U * 0.45, 0.6);   // tubo AA
    rod(s, L * 0.012, U * 2.4, L * 0.012, '#454f56', -L * 0.12, U * 1.2, 0);    // pluma
    rod(s, L * 0.10, U * 0.09, U * 0.09, '#454f56', -L * 0.07, U * 2.3, 0, -0.12);      // brazo de la grua
    boats(s, [L * 0.22]);
  }
  return ships;
}

/** Despinta el chamuscado de todas las zonas (arranque de corrida). */
export function resetShipZones(ships) {
  if (!ships) return;
  for (const k in ships)
    for (const c of ships[k].children)
      if (c.userData.zone) c.material.color.set(c.userData.baseCol);
}
