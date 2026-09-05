// LAS OLAS ESQUIVABLES, EN EL AGUA 3D (PLAN_MEJORAS_3D P9).
//
// En el mar 2D la ola no se DIBUJA: la ola ES el campo de altura de la alfombra de puntos, que se
// levanta donde pasa la gaussiana. Cuando el mar 3D reemplaza esa alfombra, el obstaculo se queda
// sin cuerpo — pero sigue existiendo y sigue matando. Esto le devuelve el cuerpo.
//
// UNA LOMA DE VERDAD, NO UNA MANCHA PINTADA. La ola hay que poder LEERLA: cuanto sube, si la
// cara te tapa el horizonte, si la brecha esta a tu izquierda. Una banda blanca sobre el agua no
// dice nada de eso. Por eso cada ola viva es una malla propia, deformada con la MISMA `olaBump`
// que usa la colision (core/sea.js): lo que ves es, literalmente, lo que te mata.
//
// El modulo NO lee estado del juego: `frame()` recibe las olas vivas y la paleta, igual que el
// resto de las piezas de escena.
import { olaBump } from '../core/sea.js';

const COLS = 56, ROWS = 22;                // malla por ola (1.232 vertices)
const MAX = 4;                             // olas dibujadas a la vez; las demas quedan sin cuerpo
const SIGMAS = 3;                          // la gaussiana no aporta un pixel mas alla (igual que el 2D)
const CERCA = 3;                           // no se dibuja mas cerca que esto (queda detras de la camara)
const LEJOS = 210;                         // ni mas lejos que el mar dibujado

const pool = [];

/** Crea el pozo de mallas. `y` es la cota del agua en unidades de la escena. */
export function crear(THREE, scene, y) {
  if (pool.length) return pool;
  for (let i = 0; i < MAX; i++) {
    const g = new THREE.PlaneGeometry(1, 1, COLS - 1, ROWS - 1);
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(COLS * ROWS * 3), 3));
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true }));
    m.rotation.x = -Math.PI / 2;           // local (x, y→profundidad, z→altura), como el parche
    m.position.set(0, y, 0);
    m.frustumCulled = false;               // la malla se reubica entera por cuadro
    m.visible = false;
    scene.add(m);
    pool.push(m);
  }
  return pool;
}

/** Un cuadro. `olas` son las olas VIVAS (obstaculos type 'ola'), `dv` la distancia recorrida,
 *  `camX` el paneo lateral, `half(z)` el semiancho visible a esa profundidad, `mar(wx,wz)` la
 *  altura del mar BASE (la misma funcion que usa el resto de la escena, para que la loma se
 *  monte sobre el mismo oleaje) y `cols` la paleta ya en RGB. Sin olas, todo queda invisible. */
export function frame(olas, dv, camX, half, mar, cols) {
  if (!pool.length) return 0;
  const [CR, MI, DE, SP] = cols;
  let usadas = 0;
  for (let k = 0; k < pool.length; k++) {
    const o = olas && k < olas.length ? olas[k] : null;
    const m = pool[k];
    const wz = o ? (o.wz || 12) : 0;
    // la ventana en profundidad de ESTA ola, recortada a lo que se ve
    const z0 = o ? Math.max(CERCA, o.z - SIGMAS * wz) : 0;
    const z1 = o ? Math.min(LEJOS, o.z + SIGMAS * wz) : 0;
    if (!o || z1 <= z0) { m.visible = false; continue; }
    m.visible = true; usadas++;
    const p = m.geometry.attributes.position, c = m.geometry.attributes.color;
    for (let row = 0; row < ROWS; row++) {
      const cz = z0 + (z1 - z0) * (row / (ROWS - 1));      // profundidad de la fila
      const hw = half(cz);
      const wzMundo = dv + cz;
      for (let col = 0; col < COLS; col++) {
        const i = row * COLS + col;
        const wx = camX + (col / (COLS - 1) * 2 - 1) * hw;
        const bump = olaBump(o, wx - (o.x || 0), o.z - cz);
        const h = mar(wx, wzMundo) + bump;
        p.setXYZ(i, wx, cz, h);
        // COLOR POR CUANTO SUBE ESTA OLA, no por la altura absoluta: asi una marejada chica se
        // lee igual de bien que una rebelde de ocho metros — lo que importa es dónde está la
        // cresta y dónde la cara, no cuán alta es en metros.
        const f = o.h > 0 ? bump / o.h : 0;
        const src = f > 0.82 ? SP : f > 0.55 ? CR : f > 0.22 ? MI : DE;
        // el faldon se funde con el mar para que la malla no tenga borde
        const mez = Math.min(1, f * 4);
        c.setXYZ(i, DE[0] + (src[0] - DE[0]) * mez,
                    DE[1] + (src[1] - DE[1]) * mez,
                    DE[2] + (src[2] - DE[2]) * mez);
      }
    }
    p.needsUpdate = c.needsUpdate = true;
  }
  return usadas;
}
