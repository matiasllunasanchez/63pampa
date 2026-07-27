// BUQUE 3D de cajas, por clase (t42 / t21 / log). Lo comparten las DOS escenas del climax:
// el MOMENTUM clasico (camara en rail, fallback sin vuelo libre) y el ARENA (vuelo libre).
//
// Vive aparte porque las ZONAS CRITICAS son geometria etiquetada (`userData.zone`), no rects de
// pantalla: el disparo las encuentra por raycast y el daño se pinta sobre la caja. Si cada escena
// tuviera su copia del layout, la primera vez que se agregue un buque una de las dos quedaria
// vieja sin que nada avise — y las zonas son DATA compartida con data/ships.js.
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

/** Las tres clases, ya armadas. `parent.position` la fija quien llame (el origen local es la
 *  cubierta). Cada caja de zona lleva `userData.zone` (el id del layout de data/ships.js) y
 *  `userData.baseCol` para poder despintar el chamuscado al empezar otra corrida. */
export function buildShips(THREE, L) {
  const U = shipU(L);
  const box = (parent, w, h, d, color, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
    m.position.set(x, y, z); parent.add(m); return m;
  };
  // caja en coords de ZONA (las mismas u/v/w/h de MOM_LAYOUTS): centro x = u*L/2, base v*U sobre
  // la cubierta, tamaño (w*L, h*U). `id` la marca como zona critica.
  const zone = (g, id, u, v, w2, h2, depth, color) => {
    const m = box(g, w2 * L, h2 * U, depth, color, u * L / 2, (v + h2 / 2) * U, 0);
    m.userData.zone = id; m.userData.baseCol = color;
    return m;
  };
  const hull = () => {
    const g = new THREE.Group();
    box(g, L, U * 3, U * 3.4, '#39434e', 0, -U * 1.5, 0);                  // casco
    box(g, L * 0.995, U * 0.3, U * 3.5, '#5c6e73', 0, -U * 0.14, 0);       // cubierta
    box(g, U * 0.8, U * 1.9, U * 2.2, '#39434e', -L / 2 - U * 0.38, -U * 1.0, 0);   // proa
    box(g, U * 0.55, U * 1.8, U * 2.4, '#39434e', L / 2 + U * 0.26, -U * 1.05, 0);  // popa
    return g;
  };
  const ships = {};
  {   // Destructor Tipo 42 (SHEFFIELD/COVENTRY): AA proa+popa, mastil con radar, puente
    const s = ships.t42 = hull();
    zone(s, 'bridge', -0.05, 1, 0.20, 2, U * 2.6, '#454f56');
    box(s, L * 0.16, U * 0.45, U * 2.65, '#8fd0e0', -L * 0.025, U * 2.55, 0);   // ventanas
    box(s, L * 0.05, U * 1.8, U * 1.1, '#454f56', L * 0.185, U * 0.9, 0);       // chimenea
    box(s, L * 0.012, U * 2.7, L * 0.012, '#454f56', L * 0.05, U * 1.35, 0);    // mastil
    zone(s, 'radar', 0.10, 2.7, 0.11, 1.5, L * 0.03, '#525d66');
    for (const sd of [-0.52, 0.52]) {
      zone(s, sd < 0 ? 'aa_l' : 'aa_r', sd, 0, 0.15, 1.3, U * 1.5, '#3d474d');
      box(s, L * 0.016, U * 0.6, L * 0.016, '#2b3338', sd * L / 2, U * 1.55, U * 0.55);
    }
  }
  {   // Fragata Tipo 21 (ARDENT/ANTELOPE): silueta baja, radar chico, MOTORES al casco
    const s = ships.t21 = hull();
    box(s, L * 0.30, U * 1.6, U * 2.4, '#49545e', -L * 0.05, U * 0.8, 0);       // superestructura
    box(s, L * 0.13, U * 0.4, U * 2.45, '#8fd0e0', -L * 0.05, U * 1.55, 0);     // ventanas
    box(s, L * 0.012, U * 2.7, L * 0.012, '#454f56', L * 0.05, U * 1.35, 0);    // mastil
    zone(s, 'radar', 0.10, 2.7, 0.09, 1.3, L * 0.025, '#525d66');
    for (const e of [{ u: -0.30, id: 'eng_l' }, { u: 0.26, id: 'eng_r' }]) {
      zone(s, e.id, e.u, -0.3, 0.14, 1.2, U * 2.0, '#333d46');                  // motores al agua
      box(s, L * 0.05, U * 1.1, U * 0.9, '#49545e', e.u * L / 2, U * 1.15, 0);  // escape
    }
    for (const sd of [-0.52, 0.52]) zone(s, sd < 0 ? 'aa_l' : 'aa_r', sd, 0, 0.15, 1.3, U * 1.4, '#3d474d');
  }
  {   // Logistico (SIR GALAHAD/CONVEYOR): contenedores, AA unica, DEPOSITO, puente a popa
    const s = ships.log = hull();
    zone(s, 'bridge', 0.32, 1, 0.16, 2, U * 2.6, '#4a5058');
    box(s, L * 0.13, U * 0.45, U * 2.65, '#8fd0e0', L * 0.16, U * 2.55, 0);     // ventanas
    zone(s, 'dep', 0.05, 0, 0.30, 1.6, U * 2.8, '#5a5344');                     // deposito
    const crates = ['#6b4a3a', '#44553f', '#3d4a58', '#5a5344'];
    for (let i = 0; i < 5; i++)
      box(s, L * 0.055, U * 0.55, U * (1.6 + (i % 2)), crates[i % 4],
        -L * 0.06 + i * L * 0.055, U * 1.88, 0);
    zone(s, 'aa_c', -0.30, 0, 0.15, 1.3, U * 1.5, '#3d474d');
    box(s, L * 0.012, U * 2.4, L * 0.012, '#454f56', -L * 0.12, U * 1.2, 0);    // pluma/grua
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
