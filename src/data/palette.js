// PALETA y presets visuales. Datos puros: sin imports, sin estado.
// P = colores base del juego; SKY_PRESETS/WATER_STYLES = variantes por clima (menu [M]);
// LAND = turba malvinense (terreno de tierra).
export const P = {
  skyTop: '#242f3a', skyMid: '#3a4650', horizon: '#7d6a4e', sunGlow: '#b06a35', sun: '#e8c07a',
  sea: '#2e4a4e', sea2: '#33545a', seaDeep: '#22383c', crest: '#7fa3a0', foam: '#cfe3df',
  body: '#93a7ab', bodyDark: '#4c5b60', canopy: '#cfe8f2',
  accent: '#e8a33d', warn: '#d94f30', ink: '#e8eef0', dim: '#8a9ba1',
  cloud: '#4a5761', island: '#1b2429'
};
export const WATER_STYLES = {
  sea: { base0: '#122123', base1: '#182a2d', base2: '#203438', deep: '#3a5f63', mid: '#6f9a95', crest: '#aed2cc', spark: '#e8f4f0' },
  violet: { base0: '#0d0a1e', base1: '#171034', base2: '#241a52', deep: '#3a2f7a', mid: '#6a54d6', crest: '#a99cf5', spark: '#eae6ff' },
};
export const SKY_PRESETS = {
  dusk: { skyTop: '#242f3a', skyMid: '#3a4650', horizon: '#7d6a4e', sunGlow: '#b06a35', sun: '#e8c07a' },
  night: { skyTop: '#0d141f', skyMid: '#1a2636', horizon: '#2c3652', sunGlow: '#3a4a72', sun: '#aebbd8' },
  storm: { skyTop: '#1c2026', skyMid: '#333a42', horizon: '#4a5052', sunGlow: '#586066', sun: '#8b9298' },
  clear: { skyTop: '#294060', skyMid: '#4d6a8e', horizon: '#c48a4c', sunGlow: '#e0a252', sun: '#ffe6ac' },
  cloudy: { skyTop: '#57646f', skyMid: '#7e8a93', horizon: '#a3aaa6', sunGlow: '#b5bab2', sun: '#e6eae2' },   // dia nublado (desembarco)
};
export const LAND = { far: '#2f3527', mid: '#3c4330', near: '#4a5138', tuft: '#6d7748', rock: '#524d3e', furrow: '#262b1e' };
// COSTA: tierra arenosa y seca (menos verde que LAND — es la franja castigada del desembarco)
export const CLAND = { far: '#57503c', mid: '#685e46', near: '#786c50', furrow: '#463f2f' };
