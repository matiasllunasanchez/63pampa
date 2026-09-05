// LA BRUMA EN CAPAS del 3D (PLAN_MEJORAS_3D P6).
//
// La leccion de GliderVR (docs/proyecto/ANALISIS_REFERENTES_3D §3): la sensacion de DISTANCIA no
// sale de un shader atmosferico sino de dos telones translucidos entre vos y el fondo. El fog de
// three tiñe todo lo que esta lejos con un solo color; lo que no hace es poner CAPAS —y son las
// capas las que le dicen al ojo "esto esta mas lejos que aquello". Con esto el horizonte del
// ARENA deja de ser una linea y pasa a ser una distancia.
//
// POR QUE CILINDROS Y NO QUADS: el plan pedia dos quads. Un quad mira para un lado, y la camara
// del arena mira para cualquiera —es el modo donde te das vuelta—, asi que habria que orientarlo
// a camara por cuadro y ademas hacerlo ancho como para tapar los 97° de campo horizontal. Un
// cilindro abierto visto desde adentro es la MISMA banda para todos los rumbos, sin orientar
// nada y sin bordes que se puedan asomar al girar. Cuesta 96 triangulos.
//
// LA BANDA SE DESVANECE POR ARRIBA Y POR ABAJO, y esta CENTRADA EN EL HORIZONTE (o sea, a la
// altura de la camara). El primer intento la apoyaba en el agua y se desvanecia solo hacia
// arriba: en la captura del temporal aparecio una LINEA HORIZONTAL cruzando el mar. La razon es
// de orden de dibujo — el material es transparente, asi que se pinta DESPUES del mar opaco, y el
// borde de abajo del cilindro quedaba tiñendo el agua hasta un canto recto. Ademas era falso: a
// dos kilometros la bruma se ve como una franja angosta APOYADA EN EL HORIZONTE, no como una
// pared que te sube desde los pies.
import { BRUMA3D, BRUMA3D_ALFA0, BRUMA3D_ALFA1, BRUMA3D_R0, BRUMA3D_R1, BRUMA3D_ALTO } from '../data/tuning.js';

const CAPAS = [
  { r: BRUMA3D_R0, alto: BRUMA3D_ALTO, alfa: BRUMA3D_ALFA0 },
  { r: BRUMA3D_R1, alto: BRUMA3D_ALTO * 1.8, alfa: BRUMA3D_ALFA1 },
];

let escala = BRUMA3D ? 1 : 0;
// las bandas construidas: hoy solo las del ARENA, pero la sonda tiene que poder moverlas todas a
// la vez el dia que el pasillo tenga las suyas.
const vivas = [];

/** Construye las dos bandas y las cuelga de la escena. `tex` es el helper de canvas del arena. */
export function crear(THREE, sc, tex) {
  if (!THREE || !sc) return null;
  // el degrade de alfa vive en la TEXTURA y no en el material: asi las dos capas comparten una
  // sola imagen y el desvanecido no cuesta un shader.
  const t = tex(4, 64, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.38, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.52, 'rgba(255,255,255,1)');      // el pico, justo en el horizonte
    g.addColorStop(0.70, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.clearRect(0, 0, w, h); x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  const capas = CAPAS.map(c => {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(c.r, c.r, c.alto, 24, 1, true),
      new THREE.MeshBasicMaterial({
        map: t, side: THREE.BackSide, transparent: true, fog: false,
        depthWrite: false, opacity: c.alfa * escala,
      }));
    // renderOrder entre el domo (-10) y el mar (-5): la bruma tapa el cielo del fondo y el mar
    // lejano, pero nunca al buque ni al avion, que son lo que hay que ver.
    m.renderOrder = -7;
    m.userData.alfa = c.alfa;
    m.visible = escala > 0;
    sc.add(m);
    vivas.push(m);
    return m;
  });
  return capas;
}

/** Las bandas siguen al avion en x/z (nunca se ve un borde) y su MEDIO va a la altura del ojo:
 *  ahi esta el horizonte, y es donde la bruma se junta. */
export function frame(capas, px, py, pz) {
  if (!capas) return;
  for (const m of capas) {
    m.visible = escala > 0;
    m.position.set(px, py, pz);
  }
}

/** El color es el HORIZONTE del clima — la bruma es el aire de ese dia, no un gris de fabrica. */
export function palette(capas, S) {
  if (!capas || !S) return;
  for (const m of capas) m.material.color.set(S.horizon);
}

// ---- SONDA de desarrollo (P6) — QUITAR cuando el default quede decidido ----
export function setEscala(v) {
  escala = Math.max(0, Math.min(2, +v || 0));
  return escala;
}
export const getEscala = () => escala;
// `__bruma3d()` lee; `__bruma3d(1)` prende la bruma EN VIVO, `__bruma3d(0)` la apaga: es el A/B
// sin salir del vuelo. Con escala 0 las bandas ni se dibujan (visible=false), asi que apagada no
// cuesta nada.
if (typeof window !== 'undefined') window.__bruma3d = (v) => {
  if (v !== undefined) {
    setEscala(v);
    for (const m of vivas) { m.material.opacity = m.userData.alfa * escala; m.visible = escala > 0; }
  }
  return JSON.stringify({ escala, capas: vivas.length, alfas: CAPAS.map(c => +(c.alfa * escala).toFixed(3)) });
};
