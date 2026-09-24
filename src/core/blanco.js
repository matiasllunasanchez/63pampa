// EL BUQUE DE LA SUELTA — el estado (docs en data/blanco.js).
//
// Vive en core/ y no en el sistema por la misma razon que `pmissiles`: lo leen TRES capas — el
// sistema que lo mueve, collision.js que le pega con la bomba y el render que lo dibuja — y el
// render no puede importar sistemas (`npm run lint:layers`). El objeto se MUTA, nunca se reasigna
// (`npm run lint:state`).
import { BL, PERFIL } from '../data/blanco.js';
import { BOMBA_G, BOMBA_PLANEO, BOMBA_EYECTOR, BOMBA_ENVION, BOMBA_REL_MAX } from '../data/tuning.js';

export const blanco = {
  on: false,          // hay buque en este pasillo
  clase: 't21',
  nombre: '',
  z: 0, zPrev: 0,     // profundidad de camara, este cuadro y el anterior (el cruce se mide entre los dos)
  dano: 0,
  hundido: false,
  sinkT: 0,           // segundos desde que se hundio
  pasada: 0,          // cuantas pasadas se fallaron
  marcas: [],         // donde le pegaron: { x, y, t } — el fuego se dibuja ahi
  res: '', resT: -9,  // el ultimo veredicto de una bomba, para el HUD
  // LAS SEÑAS DE PUMA: lo que el sistema quiere que se diga por radio ('asoma', 'sube', 'solta'…).
  // game.js las vacia cada cuadro y las pasa a la radio; `dicho` evita repetir una en la pasada.
  cues: [],
  dicho: {},
  // EL FINAL FILMADO (BL.LENTO…): camara lenta desde el impacto, negro sostenido despues del cruce
  // y, si hay otra pasada, el fundido de salida. -1 = no esta corriendo.
  lento: false,
  negroT: -1,
  salidaT: -1,
  pendiente: null,    // lo que se resuelve al terminar el negro: 'hundido' | 'reencare' | { fallo }
  altPiso: -1,        // el piso del avion durante el final filmado (-1 = libre)
  // LA VUELTA REAL (PLAN_VUELTA_REAL V0): cuantas pasadas da la mision, si despues del buque hay
  // vuelta, y si estamos en EL ESCAPE — pegarle con vuelta no corta: se escapa hasta perder las
  // estrellas, y recien ahi el viraje.
  pasadas: 1, conVuelta: false, escapando: false,
  // EL ESTANTE (data/cargas.js): que cuelga del par de ala ('bomba' | 'tanque' | null), cuantas
  // bombas de ala quedan, y la del CENTRO — la del buque, bloqueada hasta que el buque esta a tiro.
  ala: null, alaN: 0, centroN: 0,
  pred: null,         // lo que haria la bomba soltada AHORA (predecir), o null
  listo: false,       // ES EL MOMENTO: soltar ahora pega armada en el casco
};

export function resetBlanco(on, nombre, clase) {
  blanco.on = !!on; blanco.nombre = nombre || ''; blanco.clase = PERFIL[clase] ? clase : 't21';
  blanco.z = 0; blanco.zPrev = 0; blanco.dano = 0; blanco.hundido = false; blanco.sinkT = 0;
  blanco.pasada = 0; blanco.marcas.length = 0; blanco.res = ''; blanco.resT = -9;
  blanco.cues.length = 0; for (const k in blanco.dicho) delete blanco.dicho[k];
  blanco.lento = false; blanco.negroT = -1; blanco.salidaT = -1; blanco.pendiente = null; blanco.altPiso = -1;
  blanco.ala = null; blanco.alaN = 0; blanco.centroN = 0; blanco.pred = null; blanco.listo = false;
  blanco.escapando = false;
}

/** Altura del casco (unidades de mundo, sobre la flotacion) en la coordenada lateral `x`, o -1 si
 *  `x` cae fuera de la eslora. Sale del perfil medido de la hoja horneada: pega donde se ve casco. */
export function altoEn(x) {
  const u = (x - (BL.X - BL.LEN / 2)) / BL.LEN;
  if (u < 0 || u >= 1) return -1;
  const p = PERFIL[blanco.clase];
  return p[Math.min(p.length - 1, Math.floor(u * p.length))] * BL.LEN;
}

/** En que parte del casco cae `x`: 'centro' (la zona de maquinas, el blanco marcado) o 'extremo'. */
export const zonaEn = x => Math.abs(x - BL.X) <= BL.LEN * BL.CENTRO ? 'centro' : 'extremo';

/** LA VISTA COMPRIMIDA: la profundidad a la que se DIBUJA el buque. Hasta Z_REAL es la verdadera
 *  (la suelta y el paso se juegan con la perspectiva exacta); mas alla crece como una potencia
 *  suave, con la misma pendiente en el empalme, asi que no hay codo: el buque a 3 km se ve como
 *  uno a 1 km. Es el recurso del buque pintado de la aproximacion (que crecia mas de lo que la
 *  perspectiva manda) llevado a un objeto del mundo. SOLO DIBUJO: la bomba y el choque usan `z`. */
const Z_REAL = 200, Z_P = 0.25;
export const zVista = z => z <= Z_REAL ? z : Z_REAL * (1 + (Math.pow(z / Z_REAL, Z_P) - 1) / Z_P);

/** LA FLOTACION: la misma altura contra la que detona la bomba sobre agua (collision.js). */
export const AGUA = 1;

/** SIMULA LA SUELTA desde el estado actual del avion, con la MISMA integracion que collision.js, y
 *  dice que pasaria: 'dormida' (pega sin armar), 'corta' (cae al agua antes), 'larga' (pasa por
 *  encima), 'costado' (no cruza la eslora), o 'centro' / 'extremo' (pega armada ahi).
 *
 *  Es la luz de SOLTA del HUD. No es un guiado: la bomba real no sabe nada de esto, y si el avion
 *  se mueve despues de soltar, la bomba no se entera. Es leer adelante lo que la fisica ya decide. */
export function predecir(px, py, vy, vx, spd, zBuque) {
  const vz = spd * (1 + BOMBA_ENVION) + BOMBA_EYECTOR;
  let x = px, y = py, z = 18, v = vy, t = 0, zs = zBuque;   // 18 = PZ + 4, donde nace la bomba
  const dt = 1 / 60;
  for (let i = 0; i < 240; i++) {
    const zAntes = z, zsAntes = zs;
    t += dt;
    z += Math.min(BOMBA_REL_MAX, vz - spd) * dt;
    zs -= spd * dt;
    v -= BOMBA_G * Math.min(1, t / BOMBA_PLANEO) * dt; y += v * dt;
    x += vx * dt;
    if (zAntes < zsAntes && z >= zs) {
      const h = altoEn(x);
      if (h < 0) return 'costado';
      if (y > AGUA + h) return 'larga';
      if (t < BL.ARMA_T) return 'dormida';
      return zonaEn(x);
    }
    if (y <= AGUA) return 'corta';
  }
  return 'corta';
}
