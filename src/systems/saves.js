// PARTIDAS GUARDADAS del modo HISTORIA. El guardado es A NIVEL MISION: campaña, mision en curso,
// puntaje y aviones restantes — al cargar se retoma la mision desde su arranque. No se guarda el
// estado fino del vuelo (posiciones, obstaculos): en un arcade la unidad de progreso es la
// mision, y congelar el aire a mitad de un esquive solo multiplica los bugs.
//
// EL ESTADO VIVE ACA (regla de core/state.js): este modulo es el unico que toca la clave de
// localStorage; el resto lee por listSaves() y escribe por saveGame()/overwriteSave().
//
// Forma de un registro: { id, ts, camp, level, score, lives }
//   id     unico (para sobrescribir un slot puntual)
//   ts     epoch ms del guardado (el menu lo muestra como dia y hora)
//   camp   indice en CAMPAIGNS (data/campaigns.js) — rotula la lista
//   level  mision en curso (indice en las missions de la campaña)

const KEY = 'rasante_partidas';
const MAX = 8;      // tope de slots: pasa de largo la pantalla y el localStorage no es infinito

let cache = null;   // la lista en memoria; localStorage solo se toca al leer 1a vez y al escribir

function load() {
  if (cache) return cache;
  try { cache = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cache = []; }
  if (!Array.isArray(cache)) cache = [];
  return cache;
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch (e) { }
}

/** Las partidas guardadas, la mas reciente primero (el orden en que se listan SIEMPRE). */
export function listSaves() {
  return load().slice().sort((a, b) => b.ts - a.ts);
}

/** ¿Hay lugar para un slot nuevo? (si no, solo se puede sobrescribir) */
export function canSaveNew() { return load().length < MAX; }

/** Crea un slot nuevo. `d` = { camp, level, score, lives }. Devuelve el registro. */
export function saveGame(d) {
  const s = load();
  const rec = { id: Date.now().toString(36) + ((Math.random() * 1e4) | 0), ts: Date.now(), ...d };
  s.push(rec);
  persist();
  return rec;
}

/** Sobrescribe el slot `id` con el estado nuevo (conserva el id; renueva el ts). */
export function overwriteSave(id, d) {
  const s = load();
  const i = s.findIndex(r => r.id === id);
  if (i < 0) return null;
  s[i] = { id, ts: Date.now(), ...d };
  persist();
  return s[i];
}

/** 'dd/mm hh:mm' del guardado — formato propio y estable (nada de toLocaleString, que cambia
 *  por maquina y rompe el ancho fijo de la fila del menu). */
export function fmtDate(ts) {
  const d = new Date(ts), p = n => String(n).padStart(2, '0');
  return p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}
