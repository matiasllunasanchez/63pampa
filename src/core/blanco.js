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
  extra: 0,           // el envion de la holgura que necesita una suelta AHORA (ver `holgura`)
  enDist: false,      // el buque esta en la VENTANA DE DISTANCIA (independiente de tu altura)
  buenaAlt: false,    // estas en la banda de BL.ALT_IDEAL
  tuvoVentana: false, // la ventana de esta pasada llego a abrirse (para saber si se PASO)
  perdidaT: -1,       // reloj del MOMENTO PERDIDO (fundido + piloto automatico), -1 = no
  // LA BOMBA DE LA MISION (data/bombas.js): 'mk17' | 'brp', y cuanto tarda SU espoleta en armarse
  bomba: 'brp', armaT: BL.ARMA_T,
  // EL ATAQUE CUMPLIDO: una bomba pego en el casco y cuenta — estallo, o es una MK-17 que no
  // detono. `hundido` es solo lo primero; el cruce y el escape miran esto.
  cumplido: false,
  // LA QUE DETONA DESPUES (MK-17): segundos que faltan, y donde pego. -1 = ninguna
  tardeT: -1, tardeX: 0, tardeY: 0,
};

export function resetBlanco(on, nombre, clase) {
  blanco.on = !!on; blanco.nombre = nombre || ''; blanco.clase = PERFIL[clase] ? clase : 't21';
  blanco.z = 0; blanco.zPrev = 0; blanco.dano = 0; blanco.hundido = false; blanco.sinkT = 0;
  blanco.pasada = 0; blanco.marcas.length = 0; blanco.res = ''; blanco.resT = -9;
  blanco.cues.length = 0; for (const k in blanco.dicho) delete blanco.dicho[k];
  blanco.lento = false; blanco.negroT = -1; blanco.salidaT = -1; blanco.pendiente = null; blanco.altPiso = -1;
  blanco.ala = null; blanco.alaN = 0; blanco.centroN = 0; blanco.pred = null; blanco.listo = false;
  blanco.extra = 0; blanco.enDist = false; blanco.buenaAlt = false; blanco.tuvoVentana = false; blanco.perdidaT = -1;
  blanco.escapando = false; blanco.cumplido = false; blanco.tardeT = -1;
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
export function predecir(px, py, vy, vx, spd, zBuque, acc) {
  return simular(px, py, vy, vx, spd, zBuque, 0, acc);
}

/** LA HOLGURA DE LA SUELTA (pedido del autor, 26/9/2026): "quiero que el juego te permita lanzar la
 *  bomba un poco antes y la trayectoria se acomode a esa ventana, que no sea exactamente por fisica
 *  segun velocidad altura y demas, que haya cierto juego para que dure aprox 3 segundos sin turbo".
 *
 *  POR QUE HACIA FALTA, medido con esta misma funcion: la ventana puramente balistica dura entre
 *  0,53 s (al ras y rapido) y 2,11 s (a 18 m y lento), y tipicamente ~1 s. "Es literal UN PARPADEO
 *  para que el jugador pueda tirar la bomba en tiempo, forma y altura."
 *
 *  QUE ES: un PRESUPUESTO DE ENVION, en unidades/s, que la bomba puede llevar de mas al salir.
 *  Soltada antes de tiempo se queda corta —cae al agua delante del buque—, y lo que la hace llegar
 *  es salir empujada. Esta funcion busca el envion MAS CHICO que alcanza para pegar: devuelve ese
 *  numero, o null si ni con todo el presupuesto llega (o sea, soltaste demasiado antes).
 *
 *  Y ES UNA SOLA CORRECCION, AL SOLTAR, NO UN GUIADO. La bomba sale con ese vz y desde ahi no la
 *  toca nadie mas que la gravedad: sigue siendo el tiro oblicuo del 20/9. Lo que se acomoda es el
 *  gancho, no la bomba en el aire — y por eso una suelta muy temprana sigue siendo un error.
 *
 *  EL PRESUPUESTO ES FIJO Y POR ESO EL TURBO SIGUE COSTANDO: los mismos metros de envion cubren
 *  menos TIEMPO cuanto mas rapido venis, asi que la ventana se acorta sola al acelerar. Es la
 *  propiedad que el autor pidio con "aprox 3 segundos sin turbo". */
export function holgura(px, py, vy, vx, spd, zBuque, tope, acc) {
  if (!(tope > 0)) return null;
  // De menos a mas: el primero que pega es el mas barato, y salir con el envion justo es lo que
  // hace que la bomba caiga donde se ve que va a caer.
  const PASOS = 14;
  for (let i = 0; i <= PASOS; i++) {
    const extra = tope * i / PASOS;
    const r = simular(px, py, vy, vx, spd, zBuque, extra, acc);
    if (r === 'centro' || r === 'extremo') return extra;
  }
  return null;
}

/** El vuelo de la bomba, cuadro a cuadro y con el buque viniendo: el MISMO integrador que
 *  systems/collision.js mueve de verdad. `extra` es el envion de la holgura (0 = balistica pura). */
function simular(px, py, vy, vx, spd, zBuque, extra, acc) {
  const vz = spd * (1 + BOMBA_ENVION) + BOMBA_EYECTOR + extra;
  let x = px, y = py, z = 18, v = vy, t = 0, zs = zBuque, s = spd;   // 18 = PZ + 4, donde nace la bomba
  const dt = 1 / 60;
  // LA ACELERACION ENTRA EN LA CUENTA (26/9/2026). Medido: soltando al principio de la ventana con
  // el avion todavia acelerando (108 -> 139 durante el vuelo de la bomba) la bomba se quedaba
  // CUARENTA unidades corta y erraba, aunque la cuenta verde dijera que si. El motivo es el
  // corazon del tiro oblicuo: la bomba avanza `vz - run.spd`, asi que cada unidad que el avion
  // gana DESPUES de soltar es una unidad que la bomba pierde. (Es la cara B de "frenar la estira",
  // que es la misma regla del otro lado.)
  //
  // Suponer velocidad constante convertia eso en una MENTIRA de la luz verde. Ahora la prediccion
  // arrastra el ritmo al que venis acelerando: si mantenes el gas, la cuenta dice la verdad; si lo
  // cambias a mitad de la ventana, se recalcula sola al cuadro siguiente — y ver el numero caer de
  // 3 a 1 al meter turbo es el juego diciendote lo que el turbo cuesta.
  const a = acc || 0;
  for (let i = 0; i < 240; i++) {
    const zAntes = z, zsAntes = zs;
    t += dt;
    // EL TECHO SE MUEVE CON LA HOLGURA. `BOMBA_REL_MAX` existe para que una bomba tirada frenando
    // a fondo no aterrice mas alla de la linea de siembra, donde todavia no nacio nada (ver el
    // bloque BOMBA_* de data/tuning.js). En la SUELTA no protege de nada —el buque esta ahi, a una
    // distancia conocida— y en cambio era lo que hacia que el presupuesto de envion saturara:
    // medido, de 120 para arriba la ventana no crecia un milisegundo mas.
    s += a * dt;
    z += Math.min(BOMBA_REL_MAX + extra, vz - s) * dt;
    zs -= s * dt;
    v -= BOMBA_G * Math.min(1, t / BOMBA_PLANEO) * dt; y += v * dt;
    x += vx * dt;
    if (zAntes < zsAntes && z >= zs) {
      const h = altoEn(x);
      if (h < 0) return 'costado';
      if (y > AGUA + h) return 'larga';
      if (t < blanco.armaT) return 'dormida';
      return zonaEn(x);
    }
    if (y <= AGUA) return 'corta';
  }
  return 'corta';
}
