// EL DUOTONO DE MISION del 3D (PLAN_MEJORAS_3D P3).
//
// La leccion de Pigeon: A Love Story (docs/proyecto/ANALISIS_REFERENTES_3D §1) es que un mundo
// SIN TEXTURAS se ve terminado con tres cosas — valor, rampa de color y niebla. Aca va la rampa:
// la luminancia de cada pixel de la geometria iluminada se remapea entre DOS colores sacados del
// clima activo (la sombra, del agua profunda; la luz, del resplandor del sol). El mismo buque gris
// pasa a ser un buque de atardecer, uno de temporal o uno de noche sin cambiar una chapa.
//
// POR QUE UN PARCHE DE SHADER Y NO material.color: el buque ya USA material.color para otra cosa
// —el chamuscado de zonas de ship3d.js oscurece el color de la pieza tocada—, asi que un tinte
// puesto ahi peleaba con el daño. El parche entra al final del fragment, DESPUES de la luz y el
// mapa y ANTES de la niebla: tiñe lo que se ve, sin discutir con nadie.
//
// LO QUE NO ENTRA (divergencia del plan, anotada en §7): el DOMO, el SOL y el MAR quedan afuera.
// Esos tres ya SON la paleta del clima —el degrade del domo se pinta con SKY_PRESETS y la rampa
// del agua con WATER_STYLES—, asi que teñirlos seria aplicar el grade dos veces y correr el cielo
// del 3D respecto del cielo 2D, que tiene que ser el mismo. El duotono es para la geometria que
// hoy se ve igual bajo cualquier cielo: el buque, y mañana el terreno de P4.
//
// El modulo no lee estado del juego: three-arena.js le pasa la paleta y los objetos a teñir.
import { DUOTONO3D, DUOTONO3D_FUERZA, DUOTONO3D_GAMMA } from '../data/tuning.js';

// LOS UNIFORMS SON UNO SOLO Y COMPARTIDO por todos los materiales teñidos. Es la parte que
// importa del diseño: cambiar el clima (o mover la perilla en vivo) es escribir tres numeros una
// vez, no recorrer la escena. Se crean perezosos porque sin THREE no hay Color.
let U = null;
let fuerza = DUOTONO3D ? DUOTONO3D_FUERZA : 0;

function uniformes(THREE) {
  if (U) return U;
  U = {
    duoAmt: { value: fuerza },
    duoGamma: { value: DUOTONO3D_GAMMA },
    duoDark: { value: new THREE.Color('#22383c') },
    duoLight: { value: new THREE.Color('#e8c07a') },
  };
  return U;
}

const DECL = `
  uniform float duoAmt;
  uniform float duoGamma;
  uniform vec3 duoDark;
  uniform vec3 duoLight;
`;

// La rampa. `duoAmt` en 0 devuelve el color original BIT A BIT (mix con 0 es el termino izquierdo),
// asi que con la perilla apagada esto no cambia un pixel — es la misma regla que el zigzag.
const CODE = `
  {
    float duoL = dot( gl_FragColor.rgb, vec3( 0.299, 0.587, 0.114 ) );
    duoL = pow( clamp( duoL, 0.0, 1.0 ), duoGamma );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, mix( duoDark, duoLight, duoL ), duoAmt );
  }
`;

/** Tiñe un material (una sola vez). Devuelve true si el parche quedo puesto. */
function parchar(THREE, mat) {
  if (!mat || mat.userData.duo) return false;
  mat.userData.duo = true;
  const u = uniformes(THREE);
  const anterior = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, rd) => {
    if (anterior) anterior(sh, rd);
    for (const k in u) sh.uniforms[k] = u[k];
    // el ancla es la niebla: el duotono va ANTES, para que la bruma del horizonte siga siendo la
    // del clima y no se la coma la rampa. Si three cambiara el nombre del chunk, no se parchea
    // nada y el buque se ve como siempre (se avisa por `parche:false` en la sonda).
    if (sh.fragmentShader.indexOf('#include <fog_fragment>') < 0) { mat.userData.duo = 'sin ancla'; return; }
    sh.fragmentShader = DECL + sh.fragmentShader.replace(
      '#include <fog_fragment>', CODE + '\n\t#include <fog_fragment>');
  };
  mat.needsUpdate = true;
  return true;
}

/** Tiñe todo un objeto y sus hijos. Idempotente: llamarla de nuevo no vuelve a parchar nada. */
export function aplicar(THREE, obj) {
  if (!THREE || !obj) return 0;
  let n = 0;
  obj.traverse(o => {
    const m = o.material;
    if (!m) return;
    if (Array.isArray(m)) { for (const mm of m) if (parchar(THREE, mm)) n++; }
    else if (parchar(THREE, m)) n++;
  });
  return n;
}

/** La rampa del clima: la sombra sale de la CARA DE LA OLA y la luz del ASTRO.
 *
 *  Los dos tonos estan elegidos para que la rampa TIÑA sin oscurecer. El primer intento fue
 *  base2 (el fondo del mar) + sunGlow (el resplandor), y en la captura del atardecer el buque se
 *  hundio a silueta: base2 es casi negro, asi que todo gris medio caia a un marron oscuro y las
 *  chapas dejaban de leerse. `deep` y `sun` tienen aproximadamente la luminancia de los grises
 *  del buque, asi que el valor se conserva y lo que cambia es el COLOR — que es todo el punto. */
export function palette(THREE, WA, S) {
  if (!THREE || !WA || !S) return;
  const u = uniformes(THREE);
  u.duoDark.value.set(WA.deep);
  u.duoLight.value.set(S.sun);
}

export function setFuerza(v) {
  fuerza = Math.max(0, Math.min(1, +v || 0));
  if (U) U.duoAmt.value = fuerza;
  return fuerza;
}
export const getFuerza = () => fuerza;

// ---- SONDA de desarrollo (P3/D2) — QUITAR cuando el default quede decidido ----
// `__duo3d()` lee; `__duo3d(0.45)` mueve la fuerza EN VIVO sin recompilar, que es lo que hace
// posible el A/B y la calibracion de los ocho climas en una sola corrida.
if (typeof window !== 'undefined') window.__duo3d = (v, g) => {
  if (v !== undefined) setFuerza(v);
  if (g !== undefined && U) U.duoGamma.value = +g;
  return JSON.stringify({
    fuerza,
    gamma: U ? U.duoGamma.value : DUOTONO3D_GAMMA,
    dark: U ? '#' + U.duoDark.value.getHexString() : null,
    luz: U ? '#' + U.duoLight.value.getHexString() : null,
  });
};
