// LAS ISLAS REALES — EL OBJETIVO A BOMBARDEAR (prototipo I0; autor, 19/11: "necesito que marquemos objetivos a
// bombardear… agarremos el objetivo de tierra que tenemos en pasillo… marquemos como objetivo eso para
// bombardearlo y que termine la mision ahi, sino sigo dando vueltas pero al menos tengo eje").
//
// EL BLANCO ES LA BASE COSTERA DEL PASILLO (data/estructuras.js), la misma de Blender
// (tools/blender/modelos_tierra.py `base_costera`), exportada en 3D a assets/mallas/base_costera.js con
// `exportar_malla.py --tierra 1 --k 0.0833` (12 m por unidad del modelo: ~120 m de punta a punta).
// Se dibuja en systems/islas/objetivo3d.js.
//
// DONDE: en la tierra plana mas cercana al arranque, entre RADIO_MIN y RADIO_MAX (un lugar inventado, no
// historico: es la prueba del eje). La brujula del tablero (render/hud.js) y la marca naranja la señalan.
//
// LA BOMBA ES LA DEL PASILLO (game.js `bombaSale`): cae con su gravedad en el carril. Pero el carril gira con
// el avion, y una bomba soltada antes de un viraje se iria con el. Asi que aca se la SIGUE SOBRE EL MAPA desde
// que nace: su punto de suelta y su rumbo quedan fijos, avanza con su velocidad de salida, y su altura es la del
// pasillo sumada al suelo que habia al soltarla. (Avanza lo que avanza el avion mas lo que se corre en el carril.) Si cae dentro de la planta de la base y por debajo de su
// techo, PEGA; si toca tierra afuera, revienta ahi (la del agua la sigue resolviendo el pasillo).
import * as mundo from './mundo.js';

const RADIO_MIN = 3500, RADIO_MAX = 8000;   // m del arranque
// LA PLANTA de la base en metros (el modelo: x -2,1..2,3 y z -5..5 unidades, a 12 m por unidad), con margen
const MEDIO_X = 30, MEDIO_Z = 62, TECHO = 24;

export const OBJ = { on: false, nombre: 'BASE COSTERA', malla: 'base_costera', x: 0, z: 0, g: 0, rot: 0, vivo: true, cayoT: 0 };
const BOMBAS = new Map();   // pm (la bomba del pasillo) → { x, z, dx, dz, v, g0 }

/** EL AVION CONTRA LA BASE (21/11, el autor: "no colisione con la base de tierra, deberia"): (x, z) del avion y su
 *  altura absoluta `alto`. true si esta adentro de la planta y por debajo del techo. */
export function choca(x, z, alto) {
  if (!OBJ.on || alto > OBJ.g + TECHO * (OBJ.vivo ? 1 : 0.4)) return false;
  const ex = x - OBJ.x, ez = z - OBJ.z, c = Math.cos(OBJ.rot), s = Math.sin(OBJ.rot);
  return Math.abs(ex * c + ez * s) <= MEDIO_X && Math.abs(-ex * s + ez * c) <= MEDIO_Z;
}

export function reiniciar() { OBJ.on = false; OBJ.vivo = true; OBJ.cayoT = 0; BOMBAS.clear(); }

/** Pone la base en la tierra plana mas cercana a (x0, z0). Devuelve true si encontro lugar. */
export function colocar(x0, z0) {
  const plano = (x, z) => {
    const h = mundo.sueloH(x, z);
    if (h < 2 || h > 60) return -1;
    let d = 0;
    for (const [a, b] of [[MEDIO_X, 0], [-MEDIO_X, 0], [0, MEDIO_Z], [0, -MEDIO_Z], [MEDIO_X, MEDIO_Z], [-MEDIO_X, -MEDIO_Z]])
      d = Math.max(d, Math.abs(mundo.sueloH(x + a, z + b) - h));
    return d < 3.5 ? h : -1;
  };
  for (let r = RADIO_MIN; r <= RADIO_MAX; r += 250) {
    for (let k = 0; k < 48; k++) {
      const a = k / 48 * Math.PI * 2, x = x0 + Math.cos(a) * r, z = z0 + Math.sin(a) * r, h = plano(x, z);
      if (h < 0) continue;
      Object.assign(OBJ, { on: true, vivo: true, x, z, g: h, rot: a, cayoT: 0 });
      return true;
    }
  }
  return false;
}

/** Una bomba nueva del pasillo: queda anotada con su punto de suelta en el mapa. */
export function soltada(pm, x, z, yaw, g0) {
  BOMBAS.set(pm, { x, z, dx: Math.sin(yaw), dz: -Math.cos(yaw), g0, zp: pm.z, xp: pm.x });
}
export const seguida = pm => BOMBAS.has(pm);
/** Donde va la bomba en el mapa y a que altura (la dibuja proyectiles3d.js con su sombra), o null. */
export function posBomba(pm) {
  const b = BOMBAS.get(pm);
  if (!b) return null;
  return { x: b.x, z: b.z, alto: b.g0 + pm.y, suelo: Math.max(mundo.sueloH(b.x, b.z), 0) };
}

/** Avanza las bombas sobre el mapa. `vivas` = las que el pasillo todavia tiene; `m` = lo que avanzo el avion
 *  sobre el mapa este cuadro (la bomba avanza eso MAS lo que se corrio en el carril). Devuelve los impactos:
 *  [{ pm, que: 'blanco' | 'tierra' }] — el que llama las saca del pasillo y pone el estallido. */
export function paso(dt, vivas, m) {
  const out = [];
  for (const [pm, b] of BOMBAS) {
    // (la que el pasillo ya saco: cayo al agua — se avisa donde, para el estallido 3D)
    if (!vivas.has(pm)) { out.push({ pm, que: 'agua', x: b.x, z: b.z, alto: Math.max(mundo.sueloH(b.x, b.z), 0) }); BOMBAS.delete(pm); continue; }
    const adv = m + (pm.z - b.zp), lat = pm.x - b.xp;
    b.zp = pm.z; b.xp = pm.x;
    b.x += b.dx * adv - b.dz * lat; b.z += b.dz * adv + b.dx * lat;
    const alto = b.g0 + pm.y;
    if (OBJ.on && OBJ.vivo && alto <= OBJ.g + TECHO) {
      // a la planta de la base, girada con ella
      const ex = b.x - OBJ.x, ez = b.z - OBJ.z, c = Math.cos(OBJ.rot), s = Math.sin(OBJ.rot);
      const lx = ex * c + ez * s, lz = -ex * s + ez * c;
      if (Math.abs(lx) <= MEDIO_X && Math.abs(lz) <= MEDIO_Z) {
        OBJ.vivo = false; OBJ.cayoT = 0;
        out.push({ pm, que: 'blanco', x: b.x, z: b.z, alto }); BOMBAS.delete(pm); continue;
      }
    }
    const suelo = mundo.sueloH(b.x, b.z);
    if (suelo > 0.3 && alto <= suelo + 0.3) { out.push({ pm, que: 'tierra', x: b.x, z: b.z, alto: suelo }); BOMBAS.delete(pm); }
  }
  if (!OBJ.vivo) OBJ.cayoT += dt;
  return out;
}

/** El rumbo (rad, 0 = norte, horario como P3.yaw) y la distancia (m) del punto (x, z) al objetivo. */
export function haciaDesde(x, z) {
  const dx = OBJ.x - x, dz = OBJ.z - z;
  return { rumbo: Math.atan2(dx, -dz), dist: Math.hypot(dx, dz) };
}
