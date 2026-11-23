// EL BANCO DE LOS MODOS SUELTOS — POR LA PATRIA y CICLO DE MUERTE como roguelike. Datos puros.
//
// docs/sistemas/PLAN_ROGUELIKE_SUELTOS.md, con las decisiones del autor (16-17/10/2026):
//   - las cartas duran la corrida y se pierden al morir el ultimo avion;
//   - se arranca SIN NADA (metralla comun con la cinta corta, las piruetas de fabrica, el tanque interno y
//     UNA MK-17);
//   - cada BANCO_PTS puntos —y en el ciclo, al vencer cada objetivo— se elige 1 de 3 (o de las que queden);
//   - ITEM y MEJORA DE ITEM: cada cosa tiene una carta que la da y, recien teniendola, sus mejoras
//     (`requiere`). Las de un item que no tenes no aparecen;
//   - lo que tu avion no puede llevar se ve igual, ROTO, con el motivo (`rota`): no se elige.
//
// La libreta es la misma que la de la campaña (`pichon` en game.js: la lista de ids ganados), asi que las
// cartas que ya existian (piruetas, CHAFITAS, METRALLA, CINTA, BRP) entran tal cual y lo que ya las lee
// —moveAllowed, chafitasDe, metrallaDe, cintaDe, bombaDeLibreta— funciona sin cambios. Las nuevas las
// aplica game.js (`efecto` / el id).
//
// CAMPOS: id · name · desc · quote (opcional) · tecla (opcional, la del renglon COMO SE USA)
//   grupo     'armas' | 'defensa' | 'alcance' | 'poderes' | 'piruetas' | 'taller' | 'inteligencia'
//   requiere  id (o lista: alcanza con UNA) que hay que tener antes
//   uso       true: se aplica al elegirla y NO queda en la libreta (se puede volver a ofrecer)
//   pide      clave de `ctx.puede` que tiene que ser true para ofrecerla (una de uso sin nada que hacer
//             no se ofrece: REPARACION con la chapa entera, AVION AMIGO con la escuadrilla completa…)
//   solo      lista de claves de avion que la pueden llevar; en los demas, ROTA con `rota`
//   necesita  'sonda' | 'radar' | 'canon' | 'piruetas' — lo que el avion tiene que tener; si no, ROTA
//   peso      cuanto sale en el sorteo (1 por defecto)
import { UPGRADES, CHAFITAS, METRALLA, CINTA, BOMBA_BRP, SILICONADO } from './upgrades.js';
import { RADAR_PROPIO } from './radar_propio.js';
import { perfilDe, puedeManiobra } from './perfiles.js';

/** CADA CUANTOS KILOMETROS se abre el banco (17/10, el autor: "deberia ser por kilometros": con puntos, gastarlos
 *  en la Chancha bajaba el puntaje y al volver a juntarlos se cobraba el mismo umbral otra vez). Los km volados
 *  no bajan nunca. A ~130 m/s, 6 km son unos 45 s de vuelo. (Antes: cada 5000 puntos.) */
export const BANCO_KM = 6;
/** Cuantas se ofrecen (se elige UNA). */
export const BANCO_N = 3;

const sinCombo = c => ({ ...c, seq: undefined });
// las de siempre, con su grupo y lo que piden
const PIRUETAS = UPGRADES.map(u => ({ ...u, grupo: 'piruetas', necesita: 'piruetas' }));
const CHAF = CHAFITAS.map(c => ({ ...c, grupo: 'defensa' }));
const METR = [...METRALLA, ...CINTA].map(c => ({ ...c, grupo: 'armas', necesita: 'canon' }));

export const CARTAS = [
  // ---------------- ARMAS ----------------
  ...METR,
  { id: 'canon', grupo: 'armas', name: 'CAÑON', tecla: 'X / ESPACIO', solo: ['__sinCanon'],
    desc: '+1 {canon}',
    quote: 'Este no traia fierro. Se lo he colgao yo, changuito. De prepo.' },
  { id: 'potencia2', grupo: 'armas', name: 'BALA PERFORANTE', tecla: 'X / ESPACIO', necesita: 'canon',
    desc: '{canon} daño +50 %',
    quote: 'Puntas de acero. Las afile yo con... no importa con que.' },
  { id: 'potencia3', grupo: 'armas', name: 'BALA PERFORANTE II', tecla: 'X / ESPACIO', necesita: 'canon', requiere: 'potencia2',
    desc: '{canon} daño ×2', quote: 'El doble de daño. Calienta mas, pero el calculo da. Creo que da.' },
  { ...sinCombo(BOMBA_BRP), grupo: 'armas', desde: undefined },
  { id: 'snakeye', grupo: 'armas', name: 'SNAKEYE (MK-82)', tecla: 'Z / L1',
    desc: '{bomba} al toque. Rompe poco',
    quote: 'Abre las aletas. Frena. Te da tiempo. Andate.' },
  { id: 'espoletas1', grupo: 'armas', name: 'ESPOLETAS', tecla: 'Z / L1',
    desc: '{bomba} arma antes',
    quote: 'Las rehicimos en dos semanas. El percutor... explotan, listo.' },
  { id: 'espoletas2', grupo: 'armas', name: 'ESPOLETAS II', tecla: 'Z / L1', requiere: 'espoletas1',
    desc: '{bomba} arma al soltar', quote: 'Arma apenas la soltas. Ya se, ya se: cuidado con la onda.' },
  { id: 'soporte1', grupo: 'armas', name: 'SOPORTE MULTIPLE', tecla: 'Z / L1',
    desc: '+1 {bomba}. Suma peso',
    quote: 'Tres donde iba una. Despue no me llore que no levanta.' },
  { id: 'soporte2', grupo: 'armas', name: 'SOPORTE MULTIPLE II', tecla: 'Z / L1', requiere: 'soporte1',
    desc: '+1 {bomba}. Suma peso',
    quote: 'Otra ma? Esto no lo levanta ni Ala, m\'hijo.' },
  { id: 'exocet', grupo: 'armas', name: 'EXOCET AM39', tecla: 'Z / L1', solo: ['supere'],
    rota: 'Tu avion no cuenta con sistemas electronicos para llevar un Exocet',
    desc: '{misil} antibuque, de lejos',
    quote: 'Uno solo. No lo pierdas.' },

  // ---------------- DEFENSA ----------------
  ...CHAF,
  { id: 'chafRecarga', grupo: 'defensa', name: 'CHAFITAS DE REPUESTO', tecla: 'H / circulo', requiere: 'chafitas1',
    desc: '+1 {chapitas} cada 25 s', quote: 'Se recargan solas. No pregunten como. Bueno, si quieren...' },
  { id: 'chafPotencia', grupo: 'defensa', name: 'CHAFITAS DENSAS', tecla: 'H / circulo', requiere: 'chafitas1',
    desc: '{chapitas} nube mas larga', quote: 'Mas tiras por cartucho: el misil se marea. Linda palabra.' },
  { id: 'escudo1', grupo: 'defensa', name: 'CHAPA REFORZADA', desc: '{escudo} carga ×2',
    quote: 'Le he puesto una plancha atra del asiento. Por las duda, nomá.' },
  { id: 'escudo2', grupo: 'defensa', name: 'CHAPA REFORZADA II', requiere: 'escudo1',
    desc: '{escudo} carga ×3', quote: 'Pesa una aca, pero volve, que es lo que importa.' },
  { id: 'veterano', grupo: 'defensa', name: 'RELEVO VETERANO',
    desc: '{avion} relevo ×2 de rapido', quote: 'Los de atras ya saben. Entran sin esperar.' },
  { id: 'reparacion', grupo: 'defensa', name: 'REPARACION', uso: true, pide: 'reparar',
    desc: 'Chapa entera',
    quote: 'Remache, cinta y mate. Aguanta otra, changuito.' },
  { id: 'amigo', grupo: 'defensa', name: 'AVION AMIGO', uso: true, pide: 'amigo',
    desc: '+1 {avion}',
    quote: 'Llego uno de Rio Grande. Vuela con ustedes.' },

  // ---------------- EL TALLER (las fallas, data/fallas.js) ----------------
  { ...SILICONADO, grupo: 'taller' },
  { id: 'tallerLiv', grupo: 'taller', name: 'TALLER LIVIANO', uso: true, pide: 'tallerLiv', peso: 2,
    desc: 'Arregla fallas leves de 3', quote: 'Cinta, alambre y una noche sin dormi. Ha quedao joya.' },
  { id: 'tallerPes', grupo: 'taller', name: 'TALLER PESADO', uso: true, pide: 'tallerPes', peso: 2,
    desc: 'Arregla una falla grave', quote: 'La pieza entera, vino en el Hercules. La he cambiao yo solito.' },
  { id: 'vuelta', grupo: 'taller', name: 'VUELTA RAPIDA', uso: true, pide: 'vuelta',
    desc: 'Los de la base vuelven ya', quote: 'Cargao, revisao y pa\'l aire. Ligero, que no hay tiempo.' },
  { id: 'municion', grupo: 'taller', name: 'MUNICION', uso: true,
    desc: '{bomba} y {chapitas} al tope', quote: 'Ha llegao el camion de la armeria. Sirvanse, vago.' },

  // ---------------- ALCANCE ----------------
  { id: 'tanques', grupo: 'alcance', name: 'TANQUES DE ALA', tecla: 'B',
    desc: '+2 {tanque}. Mas alcance',
    quote: 'Mil cuatrocientos litro de cada lao. Volve, m\'hijo.' },
  { id: 'chancha1', grupo: 'alcance', name: '+1 CHANCHA', uso: true, necesita: 'sonda', tecla: 'J',
    rota: 'Tu avion no tiene sonda de reabastecimiento',
    desc: '+1 {chancha} gratis',
    quote: 'La Chancha te espera. Una vez nomá, no te mal acostumbre.' },

  // ---------------- PODERES ----------------
  { id: 'momentum1', grupo: 'poderes', name: 'MOMENTUM', tecla: '4',
    desc: '{momentum} dura mas',
    quote: 'El tiempo no se frena. Vos pensas mas rapido. Casi lo mismo.' },
  { id: 'momentum2', grupo: 'poderes', name: 'MOMENTUM II', tecla: '4', requiere: 'momentum1',
    desc: '{momentum} mas largo', quote: 'Mas lento todavia. O vos mas rapido. Sigo sin decidir cual.' },
  { id: 'momentum3', grupo: 'poderes', name: 'MOMENTUM III', tecla: '4', requiere: 'momentum2',
    desc: '{momentum} al maximo', quote: 'Como si el mundo te esperara. No lo puedo explicar. Me molesta.' },

  { id: 'rasante1', grupo: 'poderes', name: 'RASANTE FINO', tecla: '5',
    desc: '{rasante} banda mas ancha', quote: 'Ensanche la banda azul. No es trampa, es ingenieria. Un poco.' },
  { id: 'radar1', grupo: 'poderes', name: 'RADAR DE GUARDIA', tecla: 'Y', necesita: 'radar',
    rota: 'Tu avion no lleva radar de busqueda',
    desc: 'Radar gratis. Recarga ×2', quote: 'No se apaga nunca. Yo tampoco, desde que lo arme.' },

  // ---------------- INTELIGENCIA Y TACTICA (18/10, de la historia de 1982) ----------------
  // El autor: "segun la historia argentina, ¿no se te ocurren mas?" — y despues "agregalas todas menos la
  // pintura". Los hechos de cada una estan a verificar en docs/historia/PREGUNTAS_HISTORICAS.md (18/10).
  { id: 'radarMalvinas', grupo: 'inteligencia', name: 'RADAR DE PUERTO ARGENTINO',   // (19/10, el autor: "RADAR MALVINAS se llamaria RADAR DE PUERTO ARGENTINO")
    desc: 'Avisa si vienen Harrier',
    quote: 'Del CIC: dos Harrier en la CAP. Atentos.' },
  { id: 'neptune', grupo: 'inteligencia', name: 'EL NEPTUNE', pide: 'ciclo',
    desc: 'Solo CICLO: llegada tranquila',
    quote: 'El Neptune los ubico. Vayan derecho.' },
  { id: 'tracker', grupo: 'inteligencia', name: 'EL TRACKER QUE ESCUCHABA',
    desc: 'Al ras, alarma baja ×2',
    quote: 'Dieciocho radares identificados. Sabemos donde no miran.' },
  { id: 'guerraElec', grupo: 'inteligencia', name: 'GUERRA ELECTRONICA',
    desc: 'La alarma sube mas lento',
    quote: 'Desde Rio Gallegos les ensucian la pantalla. Aprovechen.' },
  { id: 'mirage', grupo: 'inteligencia', name: 'BARRIDO DE MIRAGE', uso: true,
    desc: '5 km sin Harrier nuevos',
    quote: 'Los Mirage salen altos. Que los persigan a ellos.' },
  { id: 'fenix', grupo: 'inteligencia', name: 'ESCUADRON FENIX', uso: true,
    desc: 'Desvia la proxima oleada',
    quote: 'Un Learjet civil haciendo de escuadrilla. Mas coraje que muchos.' },
  { id: 'coordinado', grupo: 'inteligencia', name: 'ATAQUE COORDINADO',
    desc: 'Las defensas tiran mas lento',
    quote: 'Entramos por dos rumbos. No van a saber a quien mirar.' },
  { id: 'terreno', grupo: 'inteligencia', name: 'CONOCER EL TERRENO',
    desc: 'Rozar tierra perdona ×2',
    quote: 'Estudien cada loma. El terreno es nuestro.' },
  { id: 'itb', grupo: 'inteligencia', name: 'LA ITB', pide: 'ciclo',
    desc: 'Solo CICLO: Exocet previo',
    quote: 'Ellos tienen la maquina. Nosotros tenemos las manos.' },
  { id: 'kc130', grupo: 'alcance', name: 'SEGUNDO KC-130', necesita: 'sonda', tecla: 'J',
    rota: 'Tu avion no tiene sonda de reabastecimiento',
    desc: '{chancha} antes y mas rapida',
    quote: 'El segundo Hercules ya despego. Carguen tranquilos.' },
  { id: 'rescate', grupo: 'defensa', name: 'KIT DE SUPERVIVENCIA',
    desc: '{avion} el eyectado vuelve',
    quote: 'Al que se eyecta lo vamos a buscar. A todos.' },

  // ---------------- PIRUETAS ----------------
  ...PIRUETAS,
];

export const cartaDe = id => CARTAS.find(c => c.id === id) || null;

const tiene = (owned, id) => !!owned && (owned.includes ? owned.includes(id) : owned.has(id));
const requiereOk = (owned, r) => !r || (Array.isArray(r) ? r.some(x => tiene(owned, x)) : tiene(owned, r));

/** ¿Por que tu avion NO puede llevar esta carta? null si puede. `av` = la ficha del avion (data/planes.js). */
export function motivoRota(c, av) {
  if (!av) return null;
  if (c.solo) {
    const ok = c.solo.some(k => k === av.key || (k === '__sinCanon' && av.sinCanon));
    if (!ok) return c.solo[0] === '__sinCanon' ? null : (c.rota || 'Tu avion no puede llevarla');
  }
  if (c.necesita === 'sonda' && av.sonda === false) return c.rota || 'Tu avion no tiene sonda de reabastecimiento';
  if (c.necesita === 'canon' && av.sinCanon) return null;   // (las de la metralla: piden el CAÑON antes, no se rompen)
  // las piruetas, una por una contra el PERFIL del avion (data/perfiles.js): el Hercules ninguna, el Dagger no las de giro largo
  if (c.necesita === 'piruetas' && !puedeManiobra(av.key, c.id)) return av.sinPiruetas || perfilDe(av.key).maniobras === 'pesado'
    ? 'Tu avion no hace piruetas' : 'Tu avion no puede hacer esta pirueta';
  if (c.necesita === 'radar' && !RADAR_PROPIO.AVIONES.includes(av.key)) return c.rota || 'Tu avion no lleva radar';
  return null;
}
/** ¿Se puede ofrecer AHORA? (sin contar la rotura: esa se decide aparte) */
function ofrecible(c, owned, ctx) {
  if (!c.uso && tiene(owned, c.id)) return false;
  if (!requiereOk(owned, c.requiere)) return false;
  if (c.pide && !(ctx.puede && ctx.puede[c.pide])) return false;
  const av = ctx.avion;
  // el CAÑON solo existe para los que no lo traen; y las de la metralla, en esos, recien con el CAÑON
  if (c.id === 'canon' && !(av && av.sinCanon)) return false;
  if (c.necesita === 'canon' && av && av.sinCanon && !tiene(owned, 'canon')) return false;
  return true;
}

/** LA OFERTA: hasta `n` cartas elegibles al azar (sin repetir) y, aparte, UNA rota para mostrar (la que tu
 *  avion no puede llevar: se ve, con el motivo, y no se elige). `rnd` = funcion 0..1 (Math.random). */
export function ofertaSuelta(owned, ctx, n = BANCO_N, rnd = Math.random) {
  const buenas = [], rotas = [];
  for (const c of CARTAS) {
    if (!ofrecible(c, owned, ctx)) continue;
    (motivoRota(c, ctx.avion) ? rotas : buenas).push(c);
  }
  // EL SESGO DEL AVION (data/perfiles.js `grupos`): el A-4 ve mas bombas y taller, el Super Etendard inteligencia…
  const sesgo = perfilDe(ctx.avion && ctx.avion.key).grupos;
  const peso = c => (c.peso || 1) * (sesgo[c.grupo] || 1);
  const elegir = (lista, k) => {
    const pool = lista.slice(), out = [];
    while (out.length < k && pool.length) {
      const tot = pool.reduce((s, c) => s + peso(c), 0);
      let x = rnd() * tot, i = 0;
      while (i < pool.length - 1 && (x -= peso(pool[i])) > 0) i++;
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  };
  const rota = elegir(rotas, 1)[0] || null;
  return { cartas: elegir(buenas, n), rota: rota && { ...rota, motivo: motivoRota(rota, ctx.avion) } };
}

/** EL PRECIO EN PUNTOS de una carta en la TIENDA del sobrevuelo (23/11, data/islas_teatro.js): por grupo; la mejora de
 *  un item (`requiere`) sale mas, la de uso (`uso`, se gasta) menos. Redondeado a 100. */
const PRECIO_GRUPO = { armas: 1500, defensa: 1200, alcance: 1300, poderes: 2000, piruetas: 1000, taller: 1000, inteligencia: 1800 };
export function precioDe(c) {
  let p = PRECIO_GRUPO[c.grupo] || 1500;
  if (c.requiere) p *= 1.6;
  if (c.uso) p *= 0.7;
  return Math.round(p / 100) * 100;
}
/** Cuantas cartas muestra la tienda. */
export const TIENDA_N = 5;

/** El nivel de MOMENTUM que da la libreta (0 a 3): las cartas de MOMENTUM que se tienen. */
export const momentumDe = owned => ['momentum1', 'momentum2', 'momentum3'].filter(id => tiene(owned, id)).length;
/** Cuantos niveles de ESPOLETAS (0 a 2) / de POTENCIA de la metralla (1 a 3) / de CHAPA (0 a 2). */
export const espoletasDe = owned => ['espoletas1', 'espoletas2'].filter(id => tiene(owned, id)).length;
export const potenciaDe = owned => 1 + ['potencia2', 'potencia3'].filter(id => tiene(owned, id)).length;
export const escudoDe = owned => ['escudo1', 'escudo2'].filter(id => tiene(owned, id)).length;
/** LA BOMBA que da la libreta: la ultima de las que se eligieron (BRP o SNAKEYE), o la MK-17 de fabrica. */
export function bombaSuelta(owned) {
  const l = owned ? Array.from(owned) : [];
  for (let i = l.length - 1; i >= 0; i--) if (l[i] === 'brp' || l[i] === 'snakeye') return l[i];
  return 'mk17';
}
/** Cuantas bombas de mas cuelga el SOPORTE MULTIPLE (0 a 2). */
export const soporteDe = owned => ['soporte1', 'soporte2'].filter(id => tiene(owned, id)).length;
