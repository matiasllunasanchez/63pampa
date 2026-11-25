// LOS ICONOS EN EL EFECTO DE LAS CARTAS (22/11/2026, el autor: "en vez de poner +1 bomba usamos el mismo icono que tiene
// la bomba que realmente se pone en la UI, y asi con casi todo"). En el `desc` de una carta, `{bomba}` es el icono del
// tablero (data/iconos.js, el que dibuja render/iconos.js `iconoEn`): la carta lo dibuja. Donde se escribe sin iconos
// (el banco de la campaña, listas), `descPlano` lo cambia por la palabra. Datos puros.
export const PALABRA_ICONO = {
  bomba: 'bomba', canon: 'cañón', misil: 'misil', chapitas: 'chafitas', escudo: 'escudo', avion: 'avión',
  tanque: 'tanque', chancha: 'Chancha', momentum: 'momentum', rasante: 'rasante', nafta: 'nafta', turbo: 'turbo',
};
export const ICONO_RE = /\{(\w+)\}/g;
export const descPlano = d => String(d || '').replace(ICONO_RE, (_, k) => PALABRA_ICONO[k] || k);
/** El `desc` en trozos: { t } texto, { ico } un icono. */
export const descTrozos = d => {
  const out = []; let i = 0, m;
  const s = String(d || ''); ICONO_RE.lastIndex = 0;
  while ((m = ICONO_RE.exec(s))) { if (m.index > i) out.push({ t: s.slice(i, m.index) }); out.push({ ico: m[1] }); i = m.index + m[0].length; }
  if (i < s.length) out.push({ t: s.slice(i) });
  return out;
};
