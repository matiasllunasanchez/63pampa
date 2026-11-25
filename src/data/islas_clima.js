// EL CLIMA DE LAS ISLAS (20/11, el autor: "agregá el clima a las islas; tiene que haber varios climas acordes a los
// que habia en la isla en ese tiempo"). Plan: docs/proyecto/PLAN_ARENA_2.md A7. Lo maneja systems/islas/clima.js.
//
// FINES DE MAYO / JUNIO DE 1982, otoño tardio en el Atlantico Sur: cielo casi siempre cubierto y bajo, el viento del
// oeste que no para (15-30 nudos, con temporales de 40-50), lloviznas y chubascos que pasan rapido, aguanieve y
// nevadas desde fin de mayo (los montes de la Soledad amanecian blancos), bancos de niebla en calma y, cada tanto,
// un dia frio y limpio (el 21 de mayo, el del desembarco, amanecio claro). Los pesos dicen cuanto sale cada uno.
// ⚠ A VERIFICAR (docs/historia/PREGUNTAS_HISTORICAS.md): los pesos y los numeros son de juego, armados con lo que
// se cuenta del clima de la campaña, no con un registro dia por dia.
//
// CADA CLIMA:
//   lluvia   0 nada · 1 llovizna · 2 lluvia · 3 tormenta (el campo de gotas del pasillo, render/rain.js)
//   nieve    true: copos en vez de gotas, y la linea de nieve baja (nieveH, m)
//   viento   m/s, del oeste (el avion deriva y se sacude: systems/islas/clima.js)
//   rafagas  0..1, cuanto sacude
//   olas     el mar: 0,5 calmo · 1 normal · 1,8 grueso · 2,6 muy grueso (alto de la ola y espuma)
//   bruma    la visibilidad: 1 normal, mas es mas cerrado (la niebla, 4)
//   nubes    cuanto se suma a la capa de nubes (-0,4 abre huecos, +0,4 la cierra)
//   oscuro   0..1 cuanto se apaga la luz
//   tormenta true: relampagos y truenos (systems/tormenta.js, el mismo del pasillo)
//   temp     °C a nivel del mar (fin de mayo: apenas arriba de cero a +5 sobre el oceano; baja 6,5 °C cada 1000 m)
export const CLIMAS = [
  { id: 'cubierto', temp: 5, n: 'CUBIERTO', en: 'OVERCAST', peso: 3, lluvia: 0, viento: 9, rafagas: 0.2, olas: 1, bruma: 1, nubes: 0, oscuro: 0.1 },
  { id: 'llovizna', temp: 4, n: 'LLOVIZNA', en: 'DRIZZLE', peso: 2.2, lluvia: 1, viento: 11, rafagas: 0.3, olas: 1.2, bruma: 1.8, nubes: 0.2, oscuro: 0.25 },
  { id: 'chubascos', temp: 3, n: 'CHUBASCOS', en: 'SQUALLS', peso: 2, lluvia: 2, viento: 15, rafagas: 0.65, olas: 1.8, bruma: 1.6, nubes: 0.3, oscuro: 0.4 },
  { id: 'temporal', temp: 2, n: 'TEMPORAL', en: 'GALE', peso: 1, lluvia: 3, viento: 23, rafagas: 1, olas: 2.6, bruma: 2.6, nubes: 0.45, oscuro: 0.65, tormenta: true },
  { id: 'nevisca', temp: 0.5, n: 'NEVISCA', en: 'SNOW SHOWERS', peso: 1.4, lluvia: 2, nieve: true, nieveH: 110, viento: 12, rafagas: 0.45, olas: 1.4, bruma: 2.2, nubes: 0.35, oscuro: 0.35 },
  { id: 'niebla', temp: 3, n: 'NIEBLA', en: 'FOG', peso: 1, lluvia: 0, viento: 3, rafagas: 0.05, olas: 0.5, bruma: 7, nubes: 0.2, oscuro: 0.2 },
  { id: 'despejado', temp: 1, n: 'DESPEJADO Y FRÍO', en: 'CLEAR AND COLD', peso: 1.4, lluvia: 0, viento: 7, rafagas: 0.1, olas: 0.8, bruma: 0.6, nubes: -0.4, oscuro: 0 },
];
// cada cuanto cambia (s, al azar entre los dos) y cuanto tarda en pasar de uno al otro
export const CLIMA_CADA = [200, 380], CLIMA_PASA = 35;
// el viento sopla del OESTE (hacia el este, +x en el mapa), con un poco de giro
export const VIENTO_DESDE = 270;

// LA TEMPERATURA Y EL HIELO: data/frio.js (es la misma para el pasillo)
