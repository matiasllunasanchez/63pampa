// LA RUTA — los km reales de una mision (docs/sistemas/PLAN_NAFTA_ALCANCE.md §3.3, fase N1).
//
// QUE ES: una mision vuela un pasillo de pocos km de juego, y la de verdad eran 700 km hasta el
// blanco. `ruta:` es el dato que dice cuantos km REALES vale cada tramo del pasillo:
//
//     ruta: { blancoKm: 700, radarKm: 180, niveladoKm: 120, potenciaKm: 50,
//             chanchaIda: [450, 370], chanchaVuelta: [350, 400] }
//
// LA COMPRESION ES POR TRAMO, NO PAREJA, y sale de ANCLAR los km a los bordes de las fases que ya
// existen — la fase es la dramaturgia, la ruta le pone el numero:
//
//     fraccion 0                       → 0 km (la base)
//     empieza el primer `descenso`     → blancoKm − radarKm      (el horizonte de radar)
//     empieza el primer `rasante`      → blancoKm − niveladoKm   (nivelados al ras)
//     empieza el `blanco`              → blancoKm − potenciaKm   (la corrida final)
//     fraccion 1                       → blancoKm (el buque)
//     la ultima fase de la vuelta      → 2 × blancoKm (casa: se vuelve por donde se vino)
//
// Entre ancla y ancla, lineal. Asi los 520 km del crucero alto caben en el tramo corto del
// transito y los 70 del rasante ocupan casi todo el pasillo: la mision dura lo que tiene que
// durar donde pasan cosas. Una fase que falta no ancla nada y ese tramo se estira entre sus
// vecinos: la ruta no obliga a ninguna forma de mision.
//
// LAS ZONAS DE LA CHANCHA NO SON ANCLAS a proposito: su borde no tiene por que caer en un borde de
// fase (en t15 la zona de la ida termina donde empieza el descenso, y eso haria valer 370 y 180 km
// al mismo punto). Son dato en km que lee quien las necesite (N4).
//
// POSICION EN UN SOLO EJE: `pos` son los km recorridos desde la base, de 0 a 2 × blancoKm. De ahi
// salen las dos preguntas que se hacen: cuanto falta al blanco (ida) y cuanto a casa (vuelta).
//
// ESTE ARCHIVO ES PURO: sin DOM, sin stores, sin cfg — la misma disciplina que core/fases.js, y lo
// importa `npm run unit`. El estado (la ruta de la corrida en curso) vive en systems/ruta.js.

/** Las claves que una ruta puede traer. Cualquier otra es error de datos (el validador la
 *  rechaza): una clave mal escrita no hace nada y no avisa, que es la peor forma de fallar. */
export const CLAVES = ['blancoKm', 'radarKm', 'niveladoKm', 'potenciaKm', 'chanchaIda', 'chanchaVuelta'];

const esKm = v => typeof v === 'number' && v > 0 && isFinite(v);
const esZona = v => Array.isArray(v) && v.length === 2 && v.every(esKm);

/** Donde empieza cada fase: el `hasta` de la anterior (0 la primera). */
const inicios = fases => fases.map((f, i) => (i ? fases[i - 1].hasta : 0));

/** Las ANCLAS de la ruta: pares { p, km } (fraccion del objetivo → km desde la base), ordenados.
 *  Solo las que la mision tiene: sin `descenso` no hay ancla de radar, y asi con cada una. */
export function anclas(ruta, fases) {
  const a = [{ p: 0, km: 0 }];
  const ini = inicios(fases);
  const primera = tipo => { const i = fases.findIndex(f => f.tipo === tipo); return i < 0 ? null : ini[i]; };
  const pon = (p, desdeBlanco) => { if (p !== null && p > 0 && p < 1) a.push({ p, km: ruta.blancoKm - desdeBlanco }); };
  if (ruta.radarKm) pon(primera('descenso'), ruta.radarKm);
  if (ruta.niveladoKm) pon(primera('rasante'), ruta.niveladoKm);
  if (ruta.potenciaKm) pon(primera('blanco'), ruta.potenciaKm);
  a.push({ p: 1, km: ruta.blancoKm });
  const fin = fases[fases.length - 1].hasta;
  if (fin > 1) a.push({ p: fin, km: 2 * ruta.blancoKm });
  return a.sort((x, y) => x.p - y.p);
}

/** Revisa la ruta contra SUS fases y devuelve los errores en texto (lista vacia = sana).
 *  `undefined` es valido: una mision sin ruta es todas las de hoy. */
export function validarRuta(ruta, fases) {
  const e = [];
  if (ruta === undefined || ruta === null) return e;
  if (typeof ruta !== 'object' || Array.isArray(ruta)) return ['`ruta` tiene que ser un objeto'];
  for (const k of Object.keys(ruta)) if (CLAVES.indexOf(k) < 0) e.push(`clave desconocida '${k}' (las validas: ${CLAVES.join(', ')})`);
  if (!esKm(ruta.blancoKm)) return e.concat(['`blancoKm` es obligatorio y tiene que ser un numero de km']);
  for (const k of ['radarKm', 'niveladoKm', 'potenciaKm'])
    if (ruta[k] !== undefined && !(esKm(ruta[k]) && ruta[k] < ruta.blancoKm)) e.push(`'${k}' tiene que ser un km entre 0 y blancoKm (${ruta.blancoKm})`);
  // EL ORDEN DE LA LLEGADA: el radar se ve antes que el ras, y el ras antes que la corrida final
  const orden = ['radarKm', 'niveladoKm', 'potenciaKm'].filter(k => esKm(ruta[k]));
  for (let i = 1; i < orden.length; i++)
    if (!(ruta[orden[i]] < ruta[orden[i - 1]])) e.push(`'${orden[i]}' (${ruta[orden[i]]}) tiene que quedar mas cerca del blanco que '${orden[i - 1]}' (${ruta[orden[i - 1]]})`);
  // LAS ZONAS DE LA CHANCHA, fuera de radar por construccion (historico: el Hercules orbitaba donde
  // los radares no llegaban, y la cita alta no te pinta). Y dentro del viaje.
  for (const k of ['chanchaIda', 'chanchaVuelta']) {
    if (ruta[k] === undefined) continue;
    if (!esZona(ruta[k])) { e.push(`'${k}' tiene que ser [km, km]`); continue; }
    for (const km of ruta[k]) {
      if (km >= ruta.blancoKm) e.push(`'${k}': ${km} km queda detras de la base (blancoKm ${ruta.blancoKm})`);
      if (esKm(ruta.radarKm) && km <= ruta.radarKm) e.push(`'${k}': ${km} km queda adentro del radar (radarKm ${ruta.radarKm})`);
    }
  }
  // LA RUTA SE ANCLA A LAS FASES: sin fases no hay a que ponerle numero
  if (!Array.isArray(fases) || !fases.length) return e.concat(['una `ruta` necesita `fases` a las que anclarse']);
  if (ruta.chanchaVuelta !== undefined && !(fases[fases.length - 1].hasta > 1)) e.push("'chanchaVuelta' sin vuelta: la ultima fase no pasa de 1");
  // Las anclas tienen que AVANZAR: una fraccion mas lejos tiene que valer mas km. Si no, la mision
  // ubica sus fases en otro orden que la ruta (un descenso despues del rasante, por ejemplo).
  const a = anclas(ruta, fases);
  for (let i = 1; i < a.length; i++)
    if (!(a[i].p > a[i - 1].p) || !(a[i].km > a[i - 1].km))
      e.push(`las fases y la ruta no coinciden: la fraccion ${a[i].p} vale ${a[i].km} km y la ${a[i - 1].p} vale ${a[i - 1].km}`);
  return e;
}

/** Los km recorridos desde la base en la fraccion `p` del objetivo. Pasado el ultimo ancla se
 *  queda en el ultimo valor: llegaste a casa y el odometro no sigue. */
export function posKm(p, a) {
  if (!(p > 0)) return 0;
  for (let i = 1; i < a.length; i++) {
    if (p <= a[i].p) {
      const x = a[i - 1], y = a[i];
      return x.km + (y.km - x.km) * (p - x.p) / (y.p - x.p);
    }
  }
  return a[a.length - 1].km;
}

/** Cuantos km REALES vale un metro de pasillo en la fraccion `p` (la compresion del tramo). Lo
 *  necesita el gasto por km (N3): un metro de crucero alto vale mucho mas que uno de rasante. */
export function kmPorMetro(p, a, objetivo) {
  for (let i = 1; i < a.length; i++)
    if (p < a[i].p || (i === a.length - 1 && p <= a[i].p)) return (a[i].km - a[i - 1].km) / ((a[i].p - a[i - 1].p) * objetivo);
  return 0;   // pasado casa: no se recorre nada mas
}

/** La fraccion del objetivo donde la ruta vale `km` (la inversa de `posKm`), o null si la ruta no
 *  llega a esos km. Es lo que ubica en el pasillo una linea que la mision dice en km. */
export function fraccionDeKm(km, a) {
  if (!(km > 0)) return 0;
  for (let i = 1; i < a.length; i++) {
    if (km <= a[i].km) {
      const x = a[i - 1], y = a[i];
      return x.p + (y.p - x.p) * (km - x.km) / (y.km - x.km);
    }
  }
  return null;
}

/** EL HORIZONTE DE RADAR en el pasillo (PLAN §3.4): `{ entra, sale }` en fracciones del objetivo.
 *  `entra` es donde la ida cruza `radarKm` del blanco; `sale`, donde la vuelta se aleja `radarKm`
 *  del blanco (null si la mision no tiene vuelta: el radar sigue hasta el final). Sin `radarKm` el
 *  radar existe desde la base, como siempre: `entra` 0. */
export function lineasRadar(ruta, a) {
  if (!ruta.radarKm) return { entra: 0, sale: null };
  return {
    entra: fraccionDeKm(ruta.blancoKm - ruta.radarKm, a),
    sale: fraccionDeKm(ruta.blancoKm + ruta.radarKm, a),
  };
}

/** EL TECHO DEL RADAR SEGUN EL ALCANCE, puro. `techo` es el que dice la fase; `dist` y `objetivo`
 *  en metros de pasillo; `lineas` de `lineasRadar`. Fuera de alcance devuelve `arriba` (FLY_TOP:
 *  el avion no puede pasarlo, asi que nada lo detecta, y sigue siendo un numero que se puede
 *  dibujar). Entrando, baja a lo largo de `rampaM`; saliendo en la vuelta, sube de una. */
export function techoAlcance(techo, dist, objetivo, lineas, arriba, rampaM) {
  const p = Math.max(0, dist) / objetivo;
  if (lineas.sale !== null && p >= lineas.sale) return arriba;
  const d0 = lineas.entra * objetivo;
  if (dist < d0) return arriba;
  const t = rampaM > 0 ? Math.min(1, (dist - d0) / rampaM) : 1;
  return arriba + (techo - arriba) * t;
}

/** LAS ZONAS DE LA CHANCHA en el pasillo (PLAN §3.5): `{ ida, vuelta }`, cada una `[desde, hasta]`
 *  en fracciones del objetivo, o null si la ruta no la declara. La de la ida se cuenta en km AL
 *  blanco (450 → 370: se entra por el mas lejano); la de la vuelta en km DESDE el blanco. */
export function zonasChancha(ruta, a) {
  const par = (k0, k1) => { const p0 = fraccionDeKm(k0, a), p1 = fraccionDeKm(k1, a); return p0 === null || p1 === null ? null : [Math.min(p0, p1), Math.max(p0, p1)]; };
  return {
    ida: ruta.chanchaIda ? par(ruta.blancoKm - ruta.chanchaIda[0], ruta.blancoKm - ruta.chanchaIda[1]) : null,
    vuelta: ruta.chanchaVuelta ? par(ruta.blancoKm + ruta.chanchaVuelta[0], ruta.blancoKm + ruta.chanchaVuelta[1]) : null,
  };
}
