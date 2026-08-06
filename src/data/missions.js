// MISIONES de la campaña (y del ciclo de muerte, que las juega al azar). Datos puros.
// v0.0.1 de EL CUADERNO DE MATEO: las 12 misiones de GUION_2.md volcadas con lo que el juego
// tiene hoy (ver docs/PLAN_CAMPANA_001.md). Ver GOALS en game.js para los tipos de
// objetivo: 'ship' culmina en el climax sobre el buque; 'distance' se cumple al llegar
// (misiones sin boss de buque: el tutorial y las de blanco terrestre, que aun no existe).
// El epilogo y el briefing son claves de STRINGS.

// buques britanicos reales (objetivo del vuelo). Tambien los sortea SUPERVIVENCIA.
export const SHIPS = ['HMS SHEFFIELD', 'HMS COVENTRY', 'HMS ARDENT', 'HMS ANTELOPE',
  'RFA SIR GALAHAD', 'RFA SIR TRISTRAM', 'ATLANTIC CONVEYOR', 'HMS BROADSWORD', 'HMS GLAMORGAN'];

// LOS FIELES por tramo de campaña: el roster es quien esta VIVO segun el guion, y su largo
// es el escuadron (las vidas). El Vasco muere en el epilogo de M6 (vuela la M6 entera);
// el Pichon en el de M8. El jugador siempre es TERO; el orden es el orden de relevo.
const F5 = ['TERO', 'PUMA', 'GITANO', 'VASCO', 'PICHON'];
const F4 = ['TERO', 'PUMA', 'GITANO', 'PICHON'];
const F3 = ['TERO', 'PUMA', 'GITANO'];

// config por mision: TODAS las perillas que la campaña pisa, siempre explicitas — si una
// clave faltara, quedaria pegado el valor de la mision anterior (Object.assign sobre cfg).
// La rampa arranca suave (M1 sin bombas ni viento) y termina con todo prendido (M12).
const C = over => ({
  sky: 'dusk', water: 'sea', terrain: 'sea', wind: true, obstacles: 1, coast: 230,
  bombs: 1, rain: 0, fog: 0, fogLen: 1, squad: 5, ...over,
});

// config legada (la usan pruebas y el modo camara); misma forma que antes
export const CAMPAIGN_CFG = C({});

// ---------- MISIONES ----------
// La CAMPAÑA las juega en orden cronologico; el CICLO DE MUERTE elige una al azar entre
// las que tienen buque (ver SHIP_MISSIONS abajo).
//   par    → puntaje de referencia para las estrellas (★ completar, ★★ par, ★★★ par×1.5)
//   roster → los Fieles vivos en esa mision (campaña; su largo = escuadron)
//   story  → secuencia larga de historia (SOLO campaña)
//   brief  → tarjeta corta de 2-3 lineas (ciclo de muerte)
//   epi    → desenlace (epilogo de aire + carta + placa historica)
export const MISSIONS = [
  {
    id: 'm1', name: 'SAL EN LAS ALAS', date: 'fines de abril de 1982',
    goal: { kind: 'distance', meters: 2200 },
    cfg: C({ sky: 'dawn', wind: false, obstacles: 0.5, bombs: 0 }),
    roster: F5, par: 5000, story: 'storyM1', brief: 'briefM1', epi: 'epiM1',
  },
  {
    id: 'm2', name: 'BAUTISMO DE FUEGO', date: '1 de mayo de 1982',
    goal: { kind: 'distance', meters: 2600 },
    cfg: C({ bombs: 0.5 }),
    roster: F5, par: 6500, story: 'storyM2', brief: 'briefM2', epi: 'epiM2',
  },
  {
    id: 'm3', name: 'EL DIA QUE SANGRO EL MAR', date: '4 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS SHEFFIELD', dist: 2600 },
    cfg: C({ bombs: 0.5 }),
    roster: F5, par: 7500, story: 'storyM3', brief: 'briefM3', epi: 'epiM3',
  },
  {
    id: 'm4', name: 'EL CALLEJON DE LAS BOMBAS', date: '21 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS ARDENT', dist: 2600 },
    cfg: C({ sky: 'cloudy', obstacles: 1.7 }),
    roster: F5, par: 8500, story: 'storyM4', brief: 'briefM4', epi: 'epiM4',
  },
  {
    id: 'm5', name: 'LA BOMBA QUE NO DESPERTO', date: '23 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS ANTELOPE', dist: 2800 },
    cfg: C({ sky: 'sun', obstacles: 1.7, fog: 1, fogLen: 0 }),
    roster: F5, par: 9000, story: 'storyM5', brief: 'briefM5', epi: 'epiM5',
  },
  {
    id: 'm6', name: '25 DE MAYO', date: '25 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS COVENTRY', dist: 2800 },
    cfg: C({ sky: 'clear', obstacles: 1.7 }),
    roster: F5, par: 9500, story: 'storyM6', brief: 'briefM6', epi: 'epiM6',
  },
  {
    id: 'm7', name: 'EL BATIR DE ALAS', date: '25 de mayo de 1982 · segunda salida',
    goal: { kind: 'ship', ship: 'ATLANTIC CONVEYOR', dist: 3000 },
    cfg: C({ obstacles: 1.7, rain: 1, squad: 4 }),
    roster: F4, par: 10000, story: 'storyM7', brief: 'briefM7', epi: 'epiM7',
  },
  {
    id: 'm8', name: 'EL PIBE', date: '27 de mayo de 1982',
    goal: { kind: 'distance', meters: 3200 },
    cfg: C({ sky: 'storm', obstacles: 1.7, bombs: 2, rain: 2, fog: 1, squad: 4 }),
    roster: F4, par: 10500, story: 'storyM8', brief: 'briefM8', epi: 'epiM8',
  },
  {
    id: 'm9', name: 'LO QUE NO SE DICE', date: '8 de junio de 1982',
    goal: { kind: 'ship', ship: 'RFA SIR GALAHAD', dist: 3000 },
    cfg: C({ sky: 'cloudy', obstacles: 1.7, squad: 3 }),
    roster: F3, par: 11000, story: 'storyM9', brief: 'briefM9', epi: 'epiM9',
  },
  {
    id: 'm10', name: 'EL ANGEL DE CORRIENTES', date: '8 de junio de 1982 · segunda salida',
    goal: { kind: 'ship', ship: 'RFA SIR TRISTRAM', dist: 3000 },
    cfg: C({ obstacles: 1.7, bombs: 2, rain: 1, squad: 3 }),
    roster: F3, par: 11500, story: 'storyM10', brief: 'briefM10', epi: 'epiM10',
  },
  {
    id: 'm11', name: 'LA ULTIMA MESA', date: '11 de junio de 1982',
    goal: { kind: 'ship', ship: 'HMS BROADSWORD', dist: 3200 },
    cfg: C({ sky: 'moon', terrain: 'land', obstacles: 1.7, bombs: 2, fog: 1, squad: 3 }),
    roster: F3, par: 12500, story: 'storyM11', brief: 'briefM11', epi: 'epiM11',
  },
  {
    id: 'm12', name: 'EL TERO', date: 'madrugada del 12 de junio de 1982',
    goal: { kind: 'ship', ship: 'HMS GLAMORGAN', dist: 3400 },
    cfg: C({ sky: 'night', obstacles: 1.7, bombs: 2, fog: 1, fogLen: 2, squad: 3 }),
    roster: F3, par: 14000, story: 'storyM12', brief: 'briefM12', epi: 'epiM12',
  },
];

// indices de las misiones CON buque: es el pool del CICLO DE MUERTE y del ARENA (las de
// distancia no tienen climax que jugar ni layout de zonas que elegir)
export const SHIP_MISSIONS = MISSIONS.reduce((a, m, i) => {
  if (m.goal.kind === 'ship') a.push(i);
  return a;
}, []);
