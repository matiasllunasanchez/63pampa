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
//   grupo     'armas' | 'defensa' | 'alcance' | 'poderes' | 'piruetas' | 'taller'
//   requiere  id (o lista: alcanza con UNA) que hay que tener antes
//   uso       true: se aplica al elegirla y NO queda en la libreta (se puede volver a ofrecer)
//   pide      clave de `ctx.puede` que tiene que ser true para ofrecerla (una de uso sin nada que hacer
//             no se ofrece: REPARACION con la chapa entera, AVION AMIGO con la escuadrilla completa…)
//   solo      lista de claves de avion que la pueden llevar; en los demas, ROTA con `rota`
//   necesita  'sonda' | 'radar' | 'canon' | 'piruetas' — lo que el avion tiene que tener; si no, ROTA
//   peso      cuanto sale en el sorteo (1 por defecto)
import { UPGRADES, CHAFITAS, METRALLA, CINTA, BOMBA_BRP } from './upgrades.js';

/** Cada cuantos puntos se abre el banco (16/10: 5000 para probar). */
export const BANCO_PTS = 5000;
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
    desc: 'Le montan un cañon a un avion que no lo traia (licencia del juego)',
    quote: 'No era para esto, pero ahora tira.' },
  { ...sinCombo(BOMBA_BRP), grupo: 'armas', desde: undefined },
  { id: 'soporte1', grupo: 'armas', name: 'SOPORTE MULTIPLE', tecla: 'Z / L1',
    desc: 'Una bomba mas colgada (el TER del A-4Q). Pesa: el avion acelera menos',
    quote: 'Tres donde iba una. Despues no te quejes de que no levanta.' },
  { id: 'soporte2', grupo: 'armas', name: 'SOPORTE MULTIPLE II', tecla: 'Z / L1', requiere: 'soporte1',
    desc: 'Otra bomba mas. Mas peso todavia',
    quote: 'Ya no entra ni un clavo.' },
  { id: 'exocet', grupo: 'armas', name: 'EXOCET AM39', tecla: 'Z / L1', solo: ['supere'],
    rota: 'Tu avion no cuenta con sistemas electronicos para llevar un Exocet',
    desc: 'El misil antibuque: se lanza de lejos contra el objetivo',
    quote: 'Uno solo. Que no se pierda.' },

  // ---------------- DEFENSA ----------------
  ...CHAF,
  { id: 'reparacion', grupo: 'defensa', name: 'REPARACION', uso: true, pide: 'reparar',
    desc: 'La chapa del avion que vuela, entera otra vez',
    quote: 'Remaches y cinta. Aguanta otra.' },
  { id: 'amigo', grupo: 'defensa', name: 'AVION AMIGO', uso: true, pide: 'amigo',
    desc: 'Vuelve un avion a la escuadrilla (+1 vida)',
    quote: 'Llego uno de Rio Grande. Viene con vos.' },

  // ---------------- ALCANCE ----------------
  { id: 'tanques', grupo: 'alcance', name: 'TANQUES DE ALA', tecla: 'B',
    desc: 'Dos tanques externos: mas alcance. Pesan, y se pueden soltar',
    quote: 'Mil cuatrocientos litros de cada lado. Volvé.' },
  { id: 'chancha1', grupo: 'alcance', name: '+1 CHANCHA', uso: true, necesita: 'sonda', tecla: 'J',
    rota: 'Tu avion no tiene sonda de reabastecimiento',
    desc: 'Una llamada al Hercules sin pagarla con puntos',
    quote: 'El Hercules te espera. Una vez.' },

  // ---------------- PODERES ----------------
  { id: 'momentum1', grupo: 'poderes', name: 'MOMENTUM', tecla: '4',
    desc: 'El tiempo partido dura mas y se carga antes',
    quote: 'Respira. El tiempo es tuyo.' },
  { id: 'momentum2', grupo: 'poderes', name: 'MOMENTUM II', tecla: '4', requiere: 'momentum1',
    desc: 'Todavia mas largo', quote: 'Mas lento todavia.' },
  { id: 'momentum3', grupo: 'poderes', name: 'MOMENTUM III', tecla: '4', requiere: 'momentum2',
    desc: 'El maximo', quote: 'Como si el mundo esperara.' },

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
  if (c.necesita === 'piruetas' && av.sinPiruetas) return 'Tu avion no hace piruetas';
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
  const elegir = (lista, k) => {
    const pool = lista.slice(), out = [];
    while (out.length < k && pool.length) {
      const tot = pool.reduce((s, c) => s + (c.peso || 1), 0);
      let x = rnd() * tot, i = 0;
      while (i < pool.length - 1 && (x -= (pool[i].peso || 1)) > 0) i++;
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  };
  const rota = elegir(rotas, 1)[0] || null;
  return { cartas: elegir(buenas, n), rota: rota && { ...rota, motivo: motivoRota(rota, ctx.avion) } };
}

/** El nivel de MOMENTUM que da la libreta (0 a 3): las cartas de MOMENTUM que se tienen. */
export const momentumDe = owned => ['momentum1', 'momentum2', 'momentum3'].filter(id => tiene(owned, id)).length;
/** Cuantas bombas de mas cuelga el SOPORTE MULTIPLE (0 a 2). */
export const soporteDe = owned => ['soporte1', 'soporte2'].filter(id => tiene(owned, id)).length;
