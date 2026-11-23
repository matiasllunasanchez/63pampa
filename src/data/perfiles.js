// LA IDENTIDAD DE CADA AVION, MAS ALLA DE COMO SE VE (13/11/2026, el autor: "limitar las capacidades de
// diferentes habilidades para los diferentes aviones para darle sentido a cada uno… que sea mas que un skin.
// El Hercules no podria hacer piruetas como un Skyhawk o un Pucara"). Datos puros, por clave de avion
// (data/planes.js). Lo que NO esta aca sigue en planes.js: velocidad (`vuelo`), sonda, cañon, radar.
//
//   maniobras  'agil'    todas las piruetas y los frenos (el de siempre)
//              'rigido'  las de esquive y los frenos simples; sin las de giro largo (TONEL BARRIL, TIRABUZON)
//                        ni los mortales — un caza de ala delta veloz y duro
//              'pesado'  nada acrobatico: solo pegarse al piso y trepar/picar (TERRAIN MASKING, ASCENSO…)
//   rolido     cuanto de la velocidad del giro libre [Q]/[E] (core/horizon.js FREE_ROLL_V) le toca
//   bancoKm    cada cuantos km se abre el banco suelto (sin decir: BANCO_KM, data/banco_suelto.js)
//   grupos     cuanto mas (o menos) sale cada grupo de cartas en el sorteo del banco (1 = igual)
//   fallasK    cuanto mas (o menos) probable es que salga con fallas (data/fallas.js, las bases × esto)
//   frio       el FRIO y el clima (data/frio.js, systems/frio.js; 1 = como el A-4B): `hielo` cuanto hielo junta
//              (menos con antihielo: el C-130 tenia aire caliente en bordes y tomas), `canon` cuanto le afecta el
//              frio al cañon (el Colt Mk 12 del A-4 era neumatico; los DEFA de 30 mm, a gas), `sal` en el parabrisas,
//              `arranque` fallas al salir de una base helada, `turbulencia` cuanto lo sacude el frente frio.
//              Investigacion y fuentes: docs/historia/CLIMA_FRIO_AVIONES.md (lo marcado ⚠ alla es diseño)
//   esquive    la chance BASE de que un disparo que te alcanza pase de largo (0..1). Las piruetas la suben mientras
//              duran (ESQUIVE, abajo). Liviano y chico, mas; grande y lento, casi nada
//
// Lo historico que sostiene algunas: el A-4 era un avion viejo y con repuestos cortados por el embargo (mas
// fallas); de los Super Etendard no se perdio ninguno (menos fallas). El resto es diseño de juego.

import { CALIBRE_AVION } from './sistemas_buque.js';
import { RADAR_PROPIO } from './radar_propio.js';

/** Lo que cada clase de maniobras deja hacer. `null` = todo. */
export const MANIOBRAS = {
  agil: null,
  rigido: ['mask', 'climb', 'climbmax', 'dive', 'divemax', 'tonel', 'breakt', 'sturn', 'jink', 'loyo', 'hiyo',
    'popup', 'splits', 'cobra', 'derrape'],
  pesado: ['mask', 'climb', 'climbmax', 'dive', 'divemax'],
};

const BASE = { maniobras: 'agil', rolido: 1, bancoKm: null, grupos: {}, fallasK: 1, frio: {}, esquive: 0.08 };

/** EL ESQUIVE (21/11, el autor: "cualquier pirueta aumenta muchisimo las chances de no recibir disparos y esquivarlos,
 *  va a depender del avion… un % de esquive base segun avion que aumenta bastante con ciertas piruetas que puede o no
 *  puede hacer cada avion"). Cuando un DISPARO te alcanza (no un choque, no una bomba propia, no la onda) se tira la
 *  chance: base del avion + lo que suma la pirueta en curso × su clase. Si sale, pasa de largo (core/esquive.js). Las
 *  piruetas que el avion no puede hacer no suman porque no las puede hacer. Numeros de juego. */
export const ESQUIVE = {
  TOPE: 0.75,               // nunca invulnerable: aun en la mejor pirueta, uno de cada cuatro te pega
  // lo que suma cada pirueta MIENTRAS DURA (data/moves.js; las de las islas con `isl_` + su clase)
  PIRUETA: {
    jink: 0.4, breakt: 0.4, sturn: 0.35, tonel: 0.35, splits: 0.4, derrape: 0.4,
    barrel: 0.45, spin: 0.45, mortal: 0.5, cobrainv: 0.5, cobra: 0.3,
    hiyo: 0.25, loyo: 0.25, popup: 0.15, mask: 0.15, climb: 0.1, climbmax: 0.1, dive: 0.1, divemax: 0.15,
    isl_vuelta: 0.5, isl_vertical: 0.35,
  },
  // cuanto del bono de la pirueta le toca a cada clase de avion (uno duro la hace mas lenta y abierta)
  CLASE: { agil: 1, rigido: 0.85, pesado: 0.6 },
  // LO QUE SE ESQUIVA: lo que te tiran. Chocar, la bomba propia, la onda y los palos del buque, no.
  CAUSAS: ['death_aa', 'death_aagun', 'death_gunfire', 'death_missile', 'death_sidewinder', 'death_aden', 'death_caza',
    'death_popa', 'death_45', 'death_seacat', 'death_seawolf', 'death_seadart'],
};

// EL ALA DELTA AL RAS (23/11, el autor: "Dagger/Mirage no pueden hacer todas las piruetas cerca del agua" — "poca
// maniobrabilidad a baja altura: su ala en delta perdia energia rapidamente al girar cerrado"): por debajo de `alto` m no
// salen las de giro cerrado y los frenos (`sin`); arriba, las de su clase como siempre
const RAS_DELTA = { alto: 25, sin: ['breakt', 'sturn', 'splits', 'loyo', 'cobra', 'derrape', 'mortal', 'cobrainv'] };
export const PERFILES = {
  // los SKYHAWK: el caballo de tiro. Todo, la base de todo; el banco le tira bombas y taller, y se rompe mas
  sky: { esquive: 0.1, fallasK: 1.3, grupos: { armas: 1.3, taller: 1.5 } },
  a4q: { esquive: 0.1, fallasK: 1.3, grupos: { armas: 1.3, taller: 1.5 }, frio: { arranque: 1.1 } },
  // el DAGGER: rapido y nervioso, de ala delta. Rola un poco menos y no hace las de giro largo; el banco, cañon
  dagger: { esquive: 0.12, maniobras: 'rigido', rolido: 0.9, grupos: { armas: 1.6 }, frio: { canon: 0.5, turbulencia: 0.9 }, ras: RAS_DELTA },
  // el SUPER ETENDARD: el del Exocet. Menos cartas (cada 8 km) pero inteligencia; casi no falla
  // (23/11, el autor: "el Super Etendard no se le congelan las alas; el salitre y el agua no le afectan tanto, tardan mucho
  // mas: tenian un sistema de soplado caliente") — sin hielo, y la sal se pega mucho mas despacio. A VERIFICAR
  supere: { esquive: 0.09, rolido: 0.9, bancoKm: 8, grupos: { inteligencia: 2 }, fallasK: 0.5, frio: { canon: 0.5, arranque: 0.7, hielo: 0, sal: 0.35 } },
  // el MIRAGE 5P: el mas rapido y el mas duro de rolar; armas y defensa
  mirage: { esquive: 0.12, maniobras: 'rigido', rolido: 0.85, grupos: { armas: 1.4, defensa: 1.3 }, frio: { canon: 0.5, turbulencia: 0.9 }, ras: RAS_DELTA },
  // los LIVIANOS: rolan rapido, hacen todo, y el banco abre mas seguido (baratos, faciles de atender)
  pucara: { esquive: 0.15, rolido: 1.35, bancoKm: 5, frio: { canon: 0.8, sal: 0.5, arranque: 1.5, turbulencia: 1.3 } },
  mb339: { esquive: 0.16, rolido: 1.3, bancoKm: 5, frio: { canon: 0.5, arranque: 1.4, turbulencia: 1.3 } },
  pampa: { esquive: 0.16, rolido: 1.25, bancoKm: 5, frio: { canon: 0.5, arranque: 0.8, turbulencia: 1.2 } },
  // el HERCULES: 70 toneladas. Nada acrobatico, rola lentisimo; el banco le da municion, taller y chapa
  herc: { esquive: 0.02, maniobras: 'pesado', rolido: 0.25, grupos: { taller: 1.6, defensa: 1.5 }, frio: { hielo: 0.2, sal: 0.6, arranque: 0.8, turbulencia: 0.5 } },
  // los de patrulla y transporte de las secundarias
  neptune: { esquive: 0.03, maniobras: 'pesado', rolido: 0.3, frio: { hielo: 0.4, sal: 0.7, arranque: 1.3, turbulencia: 0.6 } },
  guarani: { esquive: 0.05, maniobras: 'pesado', rolido: 0.35, frio: { turbulencia: 0.9 } },
  // el ESCUADRON FENIX (civiles): rolan como lo que son, ejecutivos
  learjet: { maniobras: 'rigido', rolido: 0.7, frio: { hielo: 0.3, arranque: 0.8, turbulencia: 0.8 } },
  citation: { maniobras: 'rigido', rolido: 0.7, frio: { hielo: 0.4, turbulencia: 0.9 } },
  merlin: { maniobras: 'rigido', rolido: 0.65, frio: { hielo: 0.4 } },
  mu2: { maniobras: 'rigido', rolido: 0.7, frio: { hielo: 0.6, turbulencia: 0.9 } },
  aerostar: { maniobras: 'rigido', rolido: 0.75, frio: { hielo: 0.7, turbulencia: 1.1 } },
  // los CHINOOK (sin armas en el juego): rotores sin antihielo, mojados y sacudidos
  chinook_faa: { esquive: 0.03, frio: { hielo: 1.5, sal: 0.8, arranque: 1.3, turbulencia: 1.4 } },
  chinook_ej: { esquive: 0.03, frio: { hielo: 1.5, sal: 0.8, arranque: 1.3, turbulencia: 1.4 } },
  commander: { maniobras: 'rigido', rolido: 0.65, frio: { hielo: 0.5 } },
};

/** El perfil del avion `key` (con los valores por defecto donde no dice). */
export const perfilDe = key => ({ ...BASE, ...(PERFILES[key] || {}) });

/** ¿El avion `key` puede hacer la maniobra `id` (data/moves.js / data/upgrades.js)? `alto` (m sobre el agua o el suelo,
 *  opcional): al ras, el ala delta no hace las de giro cerrado (`ras`). */
export function puedeManiobra(key, id, alto) {
  const pf = perfilDe(key), lista = MANIOBRAS[pf.maniobras];
  if (lista && !lista.includes(id)) return false;
  return !(alto != null && pf.ras && alto < pf.ras.alto && pf.ras.sin.includes(id));
}
/** ¿La maniobra `id` la frena SOLO la altura? (para avisar: "al ras no") */
export function frenaAlRas(key, id, alto) {
  const pf = perfilDe(key);
  return !!(pf.ras && alto != null && alto < pf.ras.alto && pf.ras.sin.includes(id) && puedeManiobra(key, id));
}

/** LA CONFIGURACION DEL AVION, en piezas con su dibujo (13/11, el autor: "tener antes de empezar clara la
 *  configuracion del avion… un panel separado, con iconos y un hover"). La dibuja render/menus.js debajo del avion
 *  en el selector: cada pieza es un icono de la hoja de las cartas (`icono`, data/iconos_cartas.js), un rotulo
 *  corto debajo (`r`), si la tiene o no (`ok`: false la tacha) y el detalle que sale al pasar el mouse (`t`).
 *  Solo dice lo que ya decide el juego (planes.js, este perfil, el calibre y el radar). */
export function capacidadesDe(pl, lang = 'es') {
  if (!pl) return [];
  const en = lang === 'en', pf = perfilDe(pl.key), out = [];
  const pz = (icono, ok, r, es, eng) => out.push({ icono, ok, r, t: en ? eng : es });
  const cal = CALIBRE_AVION[pl.key] || '20';
  if (pl.sinArmas) pz('canon', false, en ? 'NO GUN' : 'SIN CAÑON', 'Sin armas: ni cañon, ni bombas, ni chafitas', 'No weapons: no gun, bombs or chaff');
  else if (pl.sinCanon) pz('canon', false, en ? 'GUN: UPGR.' : 'CAÑON: MEJORA', 'Sin cañon: se gana como mejora', 'No gun: earned as an upgrade');
  else if (pl.canon) pz('canon', true, en ? 'OWN GUN' : 'CAÑON PROPIO', 'Su propio cañon', 'Its own gun');
  else pz('canon', true, (en ? 'GUNS ' : 'CAÑON ') + cal + ' MM', 'Dos cañones de ' + cal + ' mm', 'Two ' + cal + ' mm guns');
  if (pl.key === 'supere') pz('exocet', true, 'EXOCET', 'Puede llevar el Exocet AM39 (se gana como mejora)', 'Can carry the Exocet AM39 (earned as an upgrade)');
  // (13/11, el autor: "no se entiende que es SI / NO"): el rotulo NOMBRA la cosa; si no la tiene, va en gris
  pz('hercules', pl.sonda !== false, en ? 'TANKER' : 'CHANCHA',
    pl.sonda === false ? 'Sin sonda de reabastecimiento: no hay Chancha' : 'Reabastece en vuelo de la Chancha (el KC-130)',
    pl.sonda === false ? 'No refuelling probe: no tanker' : 'Refuels in flight from the tanker (the KC-130)');
  const radar = RADAR_PROPIO.AVIONES.includes(pl.key), corto = radar && (pl.key === 'dagger' || pl.key === 'mirage');
  pz('radar', radar, corto ? (en ? 'SHORT RADAR' : 'RADAR CORTO') : 'RADAR',
    corto ? 'Radar corto: marca lo que tenes adelante y cerca' : radar ? 'Radar propio de busqueda' : 'Sin radar propio',
    corto ? 'Short radar: marks what is close ahead' : radar ? 'Own search radar' : 'No search radar');
  const man = pf.maniobras;
  pz('pirueta', man !== 'pesado', man === 'rigido' ? (en ? 'SOME MANOEUV.' : 'PIRUETAS LIMIT.') : (en ? 'MANOEUVRES' : 'PIRUETAS'),
    (man === 'pesado' ? 'Ninguna pirueta ni freno: solo pegarse al piso y trepar o picar' : man === 'rigido' ? 'Piruetas y frenos, sin TONEL BARRIL, TIRABUZON ni los mortales' : 'Todas las piruetas y los frenos')
      + (pf.ras ? '; al ras, ni las de giro cerrado ni los frenos (el ala delta pierde energia)' : ''),
    (man === 'pesado' ? 'No piruetas or brakes: only hugging the ground and climbing or diving' : man === 'rigido' ? 'Piruetas and brakes, without BARREL ROLL, CORKSCREW or back flips' : 'Every pirueta and brake')
      + (pf.ras ? '; down low, no tight turns or brakes (the delta wing bleeds energy)' : ''));
  // EL ESQUIVE (21/11): la base, y cuanto le rinde una pirueta (la clase)
  const esq = Math.round(pf.esquive * 100), cla = Math.round(ESQUIVE.CLASE[man] * 100);
  pz('casco', true, (en ? 'DODGE ' : 'ESQUIVE ') + esq + '%',
    'Un disparo que te alcanza pasa de largo el ' + esq + '% de las veces; en plena pirueta, mucho mas' + (cla < 100 ? ' (las piruetas le rinden el ' + cla + '%)' : ''),
    'A hit that reaches you misses ' + esq + '% of the time; mid-manoeuvre, far more' + (cla < 100 ? ' (manoeuvres give ' + cla + '%)' : ''));
  const rol = pf.rolido < 0.5 ? ['MUY LENTO', 'VERY SLOW'] : pf.rolido < 0.95 ? ['LENTO', 'SLOW'] : pf.rolido > 1.1 ? ['RAPIDO', 'FAST'] : ['NORMAL', 'NORMAL'];
  const vel = pl.vuelo && pl.vuelo.vel ? Math.round(pl.vuelo.vel * 100) : 100;
  pz('reloj', true, (en ? 'SPEED ' : 'VEL. ') + vel + '%', 'Velocidad ' + vel + '% del Skyhawk · rolido con Q / E ' + rol[0].toLowerCase(),
    'Speed ' + vel + '% of the Skyhawk · Q / E roll ' + rol[1].toLowerCase());
  // lo de los modos sueltos (el banco y las fallas): se aclara que es de ahi
  const G = { armas: ['armas', 'weapons'], defensa: ['defensa', 'defence'], alcance: ['alcance', 'range'], poderes: ['poderes', 'powers'],
    taller: ['taller', 'workshop'], inteligencia: ['inteligencia', 'intelligence'], piruetas: ['piruetas', 'manoeuvres'] };
  const mas = Object.keys(pf.grupos).filter(g => pf.grupos[g] > 1).map(g => G[g] ? G[g][en ? 1 : 0] : g);
  const km = pf.bancoKm || 6;
  pz('cajon', true, (en ? 'UPGR. ' : 'MEJORA ') + km + ' KM', 'En POR LA PATRIA y CICLO: una mejora cada ' + km + ' km' + (mas.length ? ', con mas cartas de ' + mas.join(' y ') : ''),
    'In POR LA PATRIA and CICLO: an upgrade every ' + km + ' km' + (mas.length ? ', with more ' + mas.join(' and ') + ' cards' : ''));
  const fk = pf.fallasK;
  pz('caja_herr', true, fk > 1.05 ? (en ? 'FAULTS +' : 'FALLAS +') : fk < 0.95 ? (en ? 'FAULTS -' : 'FALLAS -') : (en ? 'FAULTS' : 'FALLAS'),
    fk > 1.05 ? 'Fallas mas frecuentes (POR LA PATRIA y CICLO): avion viejo, repuestos cortados por el embargo' : fk < 0.95 ? 'Casi no falla (POR LA PATRIA y CICLO)' : 'Fallas normales (POR LA PATRIA y CICLO)',
    fk > 1.05 ? 'More frequent faults (POR LA PATRIA and CICLO): old airframe, spares cut by the embargo' : fk < 0.95 ? 'Rarely fails (POR LA PATRIA and CICLO)' : 'Normal faults (POR LA PATRIA and CICLO)');
  return out;
}
