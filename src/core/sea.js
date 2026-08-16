// EL MAR: la superficie, en un solo lugar.
//
// Todo lo de aca es PURO — entra un numero, sale un numero. Sin canvas, sin stores, sin `run.t`
// implicito: el tiempo entra por parametro. Es la misma disciplina de core/physics.js y por la
// misma razon, que aca ademas es la tesis del plan del agua:
//
//   LA OLA NO ES UN SPRITE PEGADO SOBRE EL MAR: ES EL MISMO CAMPO DE ALTURA.
//
// El render levanta sus puntos con este campo y la colision se resuelve contra ESTE MISMO bulto.
// Una sola fuente de verdad: lo que ves es lo que te mata. Si esto viviera en el render, la
// colision tendria que reimplementarlo, y el dia que uno de los dos cambiara el juego mentiria.
//
// ESCALA: unidades de mundo del PASILLO (las mismas de plane.y y de o.z).

import { OLA_WZ } from '../data/tuning.js';

/** LA SUPERFICIE BASE: cuatro senos superpuestos. Es el mar de siempre, movido tal cual desde
 *  render/world.js sin tocarle un coeficiente — el mar no tiene que cambiar de aspecto porque el
 *  codigo se haya mudado de archivo.
 *
 *  `t` es el reloj de la corrida (run.t). Entra por parametro y no por import a proposito: es lo
 *  que deja probar esta funcion sin levantar el juego. */
export function seaH(wx, wz, t) {
  return 1.0
    + Math.sin(wz * 0.035 - t * 1.1) * 0.9           // marejada larga que rueda hacia la camara
    + Math.sin(wz * 0.22 + t * 2.2) * 0.65
    + Math.sin(wz * 0.09 - t * 1.5 + wx * 0.15) * 0.5
    + Math.sin(wx * 0.30 + wz * 0.05 + t * 1.9) * 0.35;
}

/** LA LOMA DE UNA OLA-OBSTACULO, evaluada en un punto.
 *
 *  Una gaussiana angosta en z (es una LINEA de agua que viene, no una montaña) y, segun el tipo,
 *  ancha o parcial en x:
 *    · `o.hw`   media anchura: la ola no cruza toda la pantalla (la rompiente)
 *    · `o.gapX` + `o.gapW`  una BRECHA: el hueco por el que se puede pasar sin saltar
 *
 *  `wxRel` es la x del punto relativa al centro de la ola; `dzRel`, la distancia en z entre el
 *  punto y la cresta. Devuelve METROS de sobre-elevacion — se SUMA al mar base. */
export function olaBump(o, wxRel, dzRel) {
  // el espesor es POR OLA (`o.wz`): las altas son tambien mas largas, que es como crece una ola de
  // verdad y lo que evita que una grande se lea como una pared flaca. Sin `o.wz`, el de siempre.
  const wz = o.wz || OLA_WZ;
  const gz = Math.exp(-(dzRel * dzRel) / (2 * wz * wz));
  let px2 = 1;                                        // ancho completo (marejada / rebelde)
  if (o.hw) px2 = Math.exp(-(wxRel * wxRel) / (2 * o.hw * o.hw));                       // parcial
  if (o.gapW) px2 *= 1 - Math.exp(-((wxRel - o.gapX) ** 2) / (2 * o.gapW * o.gapW));    // brecha
  return o.h * gz * px2;
}

/** LA SUPERFICIE COMPLETA: el mar base mas las olas vivas.
 *
 *  `olasVivas` lo arma el LLAMADOR una vez por frame y se lo pasa a todos los puntos. Nunca
 *  filtrar `obstacles` acá adentro: esto corre una vez por punto del oleaje y son miles por
 *  cuadro (regla §6.5 del spec — cero allocations por punto).
 *
 *  `dv` es la distancia recorrida: las olas viven en z de OBSTACULO (o.z, que baja hacia el
 *  avion) y los puntos del mar en z de MUNDO, asi que la cresta esta en `dv + o.z`. */
export function seaHTotal(wx, wz, t, olasVivas, dv) {
  let h = seaH(wx, wz, t);
  if (!olasVivas) return h;
  for (let i = 0; i < olasVivas.length; i++) {
    const o = olasVivas[i];
    h += olaBump(o, wx - (o.x || 0), dv + o.z - wz);
  }
  return h;
}

/** EL CLIMA DEL MAR de una mision, resuelto en un solo lugar (SPEC_AGUA_OLAS §2).
 *
 *  Vale para la frecuencia de olas, el umbral de espuma y el termino de viento. Se resuelve UNA
 *  vez —al aplicar el cfg de la mision— y se guarda: derivarlo adentro del loop de puntos seria
 *  pagarlo miles de veces por cuadro para que de siempre lo mismo. */
export function climaDe(cfg) {
  if ((cfg.rain || 0) >= 1 || cfg.sky === 'storm') return 'storm';
  return cfg.wind ? 'breeze' : 'calm';
}
