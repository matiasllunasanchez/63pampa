// IDIOMA: resolucion, cambio y traduccion. Unico dueño de LANG.
//
// El idioma se resuelve una vez al cargar, en este orden: ?lang=xx  →  localStorage
// 'rasante_lang'  →  idioma del navegador  →  español.
//
// Todo texto visible del juego pasa por T('clave'); nada de strings sueltos en el resto del
// codigo. Si falta una clave en el idioma activo, T() cae al español y despues a la clave cruda,
// asi que un idioma incompleto nunca deja la pantalla en blanco.
import { STRINGS } from '../data/strings.js';

let LANG = 'es';

function detectLang() {
  try { const u = new URLSearchParams(location.search).get('lang'); if (u && STRINGS[u]) return u; } catch (e) { }
  try { const s = localStorage.getItem('rasante_lang'); if (s && STRINGS[s]) return s; } catch (e) { }
  const n = (navigator.language || 'es').slice(0, 2).toLowerCase();
  return STRINGS[n] ? n : 'es';
}
LANG = detectLang();

/** Codigo del idioma activo ('es', 'en'...). Lo necesitan los datos que traen texto propio,
 *  como las descripciones de los aviones (PLANES[i].desc[LANG]). */
export function getLang() { return LANG; }

/** El bloque completo del idioma activo. Para las claves que son arrays (facts, guiones). */
export function L() { return STRINGS[LANG] || STRINGS.es; }

/** Traduce una clave. `p` reemplaza marcadores {n}: T('hud_best', { n: 120 }). */
export function T(key, p) {
  let s = L()[key];
  if (s == null) s = (STRINGS.es[key] != null ? STRINGS.es[key] : key);   // fallback a es, luego a la clave
  if (p) for (const k in p) s = s.split('{' + k + '}').join(p[k]);
  return s;
}

export function setLang(l) {
  if (STRINGS[l]) { LANG = l; try { localStorage.setItem('rasante_lang', l); } catch (e) { } }
}

/** Rota al siguiente idioma disponible (tecla [L]) y repinta el chrome de la pagina. */
export function cycleLang() {
  const ks = Object.keys(STRINGS);
  setLang(ks[(ks.indexOf(LANG) + 1) % ks.length]);
  applyChrome();
}

/** Aplica el idioma a lo que vive FUERA del canvas: encabezado, pie y accesibilidad. */
export function applyChrome() {
  const h = document.querySelector('header'), f = document.querySelector('footer');
  if (h) h.innerHTML = L().pageHeader;
  if (f) f.innerHTML = L().pageFooter;
  // el canvas se consulta aca (y no se recibe por parametro) para que el modulo no dependa
  // de que game.js le pase nada: asi se puede importar desde cualquier lado
  const cv = document.getElementById('g');
  if (cv) cv.setAttribute('aria-label', L().aria);
  document.documentElement.lang = LANG;
}
