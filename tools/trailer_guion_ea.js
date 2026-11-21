// EL GUION DEL TRAILER DE ACCESO ANTICIPADO (21/11, el autor). Cinco bloques, cada uno con su texto (los pone
// el montaje, tools/trailer_montaje.js, encima del video):
//
//   1  JUGA CON LOS AVIONES QUE VOLARON              el selector de aviones
//   2  MEJORAS REALES / DE NUESTROS PILOTOS E ...    el banco: la carta abierta, leida; y la Chancha
//   3  VIVI LAS MISIONES REALES                      el libro de vuelo, las islas, las bases, los buques
//   4  VOLA RASANTE. QUE NO TE VEA EL RADAR.         cabina, rasante, la red del radar, misiles, alarmas
//   5  LA FEROCIDAD DE LOS PILOTOS ARGENTINOS        piruetas, Harriers, cañon, explosiones, eyeccion
//
// Se filma con tools/trailer.js (`--guion tools/trailer_guion_ea.js`), cuadro por cuadro: no tiene tirones.
// Mismas tres puertas que el guion de siempre (tools/trailer_guion.js): teclas, el catalogo `__prb` y las sondas.
const FUEGO = 'KeyX', TURBO = 'ShiftLeft';
const OK = 'Enter', ARR = 'ArrowUp', ABJ = 'ArrowDown', MIZQ = 'ArrowLeft', MDER = 'ArrowRight';
const A4B = 0, DAGGER = 1, SUPERE = 2;

const VOLANDO = (over = {}, piloto = {}, avion = A4B) => [
  `window.__trailerInmortal = true`,
  `window.__malvinas && window.__malvinas(false)`,
  `window.__avion(${avion})`, `window.__patria()`, `window.__vidas(99)`,
  ...Object.entries(over).map(([k, v]) => `window.__cfgset(${JSON.stringify(k)}, ${JSON.stringify(v)})`),
  `window.__tr.piloto(${JSON.stringify({ alt: 13, vagar: 9, ritmo: 0.5, ...piloto })})`,
].join('; ');
const MOMENTO = (id, piloto = {}) => [
  `window.__trailerInmortal = true`,
  `window.__malvinas && window.__malvinas(false)`,
  `window.__prb(${JSON.stringify(id)})`, `window.__vidas(99)`,
  piloto === null ? '' : `window.__tr.piloto(${JSON.stringify({ alt: 13, vagar: 8, ritmo: 0.5, ...piloto })})`,
].filter(Boolean).join('; ');
/** LAS ISLAS: el mapa real, con el avion puesto en (lon, lat) a `alt` m y con rumbo; `vista` 0 arriba, 1 atras, 2 cabina. */
const ISLAS = ({ lon, lat, local, alt = 60, rumbo = 90, vista = 0, radar = true, avion = A4B, clima = 'despejado', piloto = 25 }) => ({
  prep: [`window.__trailerInmortal = true`, `window.__malvinas(true)`, `window.__malvinas({ radar: ${radar} })`,
    `window.__avion(${avion})`, `window.__patria()`, `window.__vidas(99)`].join('; '),
  calentar: 8,
  // (con el mapa ya puesto: el clima, el lugar y la camara; y 3 s para que cargue el terreno de ahi y se vaya el
  // cartel del clima)
  despues: [`window.__clima(${JSON.stringify(clima)})`, `window.__vidas(99)`,
    local ? `{ const q = ${local}; window.__malvinas({ local: q, alt: ${alt}, rumbo: ${rumbo} }); }`
      : `window.__malvinas({ lon: ${lon}, lat: ${lat}, alt: ${alt}, rumbo: ${rumbo} })`,
    `window.__malvinas({ vista: ${vista} })`,
    piloto ? `window.__tr.piloto({ alt: ${piloto}, vagar: 0 })` : ''].filter(Boolean).join('; '),
  calentar2: 4.2,
});
// un buque del teatro de las islas, en coordenadas locales: `dz` metros al sur (negativo: al norte)
const BUQUE = (n, dx = 0, dz = 0) => `(() => { const b = JSON.parse(window.__teatroIslas()).bq.find(q => q[0] === ${JSON.stringify(n)}); return [b[1] + ${dx}, b[2] + ${dz}]; })()`;

module.exports = [
  // ============ 0. LA ENTRADA: rasante al amanecer, sin texto ============
  { id: 'entrada', dur: 3.2, prep: VOLANDO({ sky: 'dawn' }, { alt: 9, vagar: 10 }), calentar: 1.5,
    marcas: [{ t: 0.6, apretar: [TURBO] }] },

  // ============ 1. LOS AVIONES ============
  { id: 'aviones', dur: 6.0, prep: `window.__trailerAviones = true; window.__malvinas && window.__malvinas(false); window.__avion(0); window.__pantalla('menu')`, calentar: 0.6, teclear: false,
    marcas: [0.9, 1.9, 2.9, 3.9, 4.9].map(t => ({ t, toque: MDER })) },

  // ============ 2. LAS MEJORAS (reales) ============
  { id: 'mejoras', dur: 7.5, prep: `window.__bancoAbrir(['brp', 'chafitas1', 'siliconado', 'espoletas1'])`, calentar: 0.6, teclear: false,
    // (la carta se LEE despues de que se va el texto del bloque, que tapa la mitad de abajo)
    marcas: [{ t: 1.0, toque: MDER }, { t: 2.0, toque: MIZQ }, { t: 3.0, toque: ABJ }, { t: 3.9, toque: ABJ }, { t: 4.8, toque: ABJ }, { t: 5.7, toque: ABJ }] },
  // ============ 3. LAS MISIONES ============
  { id: 'libro', dur: 3.4, prep: `window.__malvinas && window.__malvinas(false); window.__pantalla('campmenu')`, teclear: false,
    marcas: [{ t: 0.2, toque: OK }, { t: 1.2, toque: ABJ }, { t: 1.8, toque: ABJ }, { t: 2.4, toque: ABJ }, { t: 3.0, toque: ABJ }] },
  // las islas: la pasada baja por Puerto Argentino (las trincheras, la bandera, los conscriptos que se agachan)
  { id: 'islas_base', dur: 4.0, ...ISLAS({ lon: -57.8716, lat: -51.692, alt: 22, rumbo: 90, vista: 1, radar: false, piloto: 20 }) },
  { id: 'buque', dur: 3.0, prep: MOMENTO('buqueT42', { alt: 12, vagar: 6 }), calentar: 3 },
  // la Bahia San Carlos desde arriba: los buques fondeados
  { id: 'islas_bahia', dur: 3.6, ...ISLAS({ local: BUQUE('HMS PLYMOUTH', 0, -500), alt: 70, rumbo: 168, vista: 0, radar: false, piloto: 70 }) },

  // ============ 4. RASANTE Y EL RADAR ============
  // la cabina, rasante sobre el estrecho
  { id: 'cabina', dur: 3.4, ...ISLAS({ lon: -59.30, lat: -51.60, alt: 20, rumbo: 60, vista: 2, radar: false, piloto: 18 }) },
  // (prueba de los espejos: dos Harriers en la cola, en cabina — no va al trailer: `--solo espejos`)
  { id: 'espejos', dur: 3.0, ...ISLAS({ lon: -59.30, lat: -51.60, alt: 40, rumbo: 60, vista: 2, radar: false, piloto: 40 }),
    marcas: [{ t: 0, js: `window.__harrierCola(220)` }], solo: true },
  { id: 'espejos_pasillo', dur: 3.0, prep: MOMENTO('colaAviso', { alt: 13, vagar: 4, ritmo: 0.6 }), calentar: 4,
    antes: [{ js: `window.__primeraPersona(true)` }], solo: true },
  // entrando a la Bahia San Carlos: la red del radar de ellos, los buques y lo que te tiran
  { id: 'radar_red', dur: 3.6, ...ISLAS({ lon: -59.125, lat: -51.52, alt: 22, rumbo: 90, vista: 1, radar: true, piloto: 18 }) },
  { id: 'costa', dur: 2.8, prep: MOMENTO('costa', { alt: 10, vagar: 14, ritmo: 0.6 }), calentar: 3.5 },
  { id: 'alarmas', dur: 3.6, prep: MOMENTO('suelta', { alt: 12, vagar: 7, ritmo: 0.7 }), calentar: 4,
    antes: [{ js: `window.__estset(4)` }], marcas: [{ t: 0.1, js: `window.__estset(4)` }] },

  // ============ 5. LA FEROCIDAD ============
  { id: 'piruetas', dur: 4.6, prep: VOLANDO({ sky: 'sun' }, { alt: 13 }), calentar: 1.5,
    marcas: [{ t: 0.3, js: `window.__mv('tonel', 1)` }, { t: 1.7, js: `window.__mv('splits', 1)` }, { t: 3.2, js: `window.__mv('breakt', -1)` }] },
  { id: 'cola', dur: 2.6, prep: MOMENTO('colaAviso', { alt: 13, vagar: 7, ritmo: 0.6 }), calentar: 5 },
  { id: 'canion', dur: 3.0, prep: MOMENTO('colaVentana', { alt: 13, vagar: 5, ritmo: 0.6 }), calentar: 5,
    marcas: [{ t: 0.2, apretar: [FUEGO] }] },
  { id: 'teatro', dur: 3.6, prep: VOLANDO({ sky: 'dawn' }, { alt: 13 }, DAGGER), calentar: 1.5,
    marcas: [{ t: 0.3, js: `window.__teatrofilm('breakt', 1)` }] },
  { id: 'cadena', dur: 2.8, prep: MOMENTO('cadena', { alt: 11, vagar: 3, ritmo: 0.5 }), calentar: 10 },
  { id: 'mvfilm', dur: 3.4, prep: VOLANDO({ sky: 'dawn' }, { alt: 13 }), calentar: 1.5,
    marcas: [{ t: 0.3, js: `window.__mvfilm('splits', 1)` }] },
  { id: 'pulso', dur: 7.0, prep: MOMENTO('pulso', null), calentar: 2, antes: [{ js: `window.__tr.pulso(9)` }] },

  // ============ CIERRE ============
  { id: 'cierre', dur: 4.0, prep: `window.__malvinas && window.__malvinas(false); window.__pantalla('title')`, teclear: false },
];
