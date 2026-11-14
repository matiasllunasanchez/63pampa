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

const BASE = { maniobras: 'agil', rolido: 1, bancoKm: null, grupos: {}, fallasK: 1 };

export const PERFILES = {
  // los SKYHAWK: el caballo de tiro. Todo, la base de todo; el banco le tira bombas y taller, y se rompe mas
  sky: { fallasK: 1.3, grupos: { armas: 1.3, taller: 1.5 } },
  a4q: { fallasK: 1.3, grupos: { armas: 1.3, taller: 1.5 } },
  // el DAGGER: rapido y nervioso, de ala delta. Rola un poco menos y no hace las de giro largo; el banco, cañon
  dagger: { maniobras: 'rigido', rolido: 0.9, grupos: { armas: 1.6 } },
  // el SUPER ETENDARD: el del Exocet. Menos cartas (cada 8 km) pero inteligencia; casi no falla
  supere: { rolido: 0.9, bancoKm: 8, grupos: { inteligencia: 2 }, fallasK: 0.5 },
  // el MIRAGE 5P: el mas rapido y el mas duro de rolar; armas y defensa
  mirage: { maniobras: 'rigido', rolido: 0.85, grupos: { armas: 1.4, defensa: 1.3 } },
  // los LIVIANOS: rolan rapido, hacen todo, y el banco abre mas seguido (baratos, faciles de atender)
  pucara: { rolido: 1.35, bancoKm: 5 },
  mb339: { rolido: 1.3, bancoKm: 5 },
  pampa: { rolido: 1.25, bancoKm: 5 },
  // el HERCULES: 70 toneladas. Nada acrobatico, rola lentisimo; el banco le da municion, taller y chapa
  herc: { maniobras: 'pesado', rolido: 0.25, grupos: { taller: 1.6, defensa: 1.5 } },
  // los de patrulla y transporte de las secundarias
  neptune: { maniobras: 'pesado', rolido: 0.3 },
  guarani: { maniobras: 'pesado', rolido: 0.35 },
  // el ESCUADRON FENIX (civiles): rolan como lo que son, ejecutivos
  learjet: { maniobras: 'rigido', rolido: 0.7 },
  citation: { maniobras: 'rigido', rolido: 0.7 },
  merlin: { maniobras: 'rigido', rolido: 0.65 },
  mu2: { maniobras: 'rigido', rolido: 0.7 },
  aerostar: { maniobras: 'rigido', rolido: 0.75 },
  commander: { maniobras: 'rigido', rolido: 0.65 },
};

/** El perfil del avion `key` (con los valores por defecto donde no dice). */
export const perfilDe = key => ({ ...BASE, ...(PERFILES[key] || {}) });

/** ¿El avion `key` puede hacer la maniobra `id` (data/moves.js / data/upgrades.js)? */
export function puedeManiobra(key, id) {
  const lista = MANIOBRAS[perfilDe(key).maniobras];
  return !lista || lista.includes(id);
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
  const radar = RADAR_PROPIO.AVIONES.includes(pl.key);
  pz('radar', radar, 'RADAR', radar ? 'Radar propio de busqueda' : 'Sin radar propio', radar ? 'Own search radar' : 'No search radar');
  const man = pf.maniobras;
  pz('pirueta', man !== 'pesado', man === 'rigido' ? (en ? 'SOME MANOEUV.' : 'PIRUETAS LIMIT.') : (en ? 'MANOEUVRES' : 'PIRUETAS'),
    man === 'pesado' ? 'Ninguna pirueta ni freno: solo pegarse al piso y trepar o picar' : man === 'rigido' ? 'Piruetas y frenos, sin TONEL BARRIL, TIRABUZON ni los mortales' : 'Todas las piruetas y los frenos',
    man === 'pesado' ? 'No piruetas or brakes: only hugging the ground and climbing or diving' : man === 'rigido' ? 'Piruetas and brakes, without BARREL ROLL, CORKSCREW or back flips' : 'Every pirueta and brake');
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
