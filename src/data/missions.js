// MISIONES de la campaña (y del ciclo de muerte, que las juega al azar). Datos puros.
// v0.0.2 de EL CUADERNO DE MATEO: las 14 misiones de GUION_3.md volcadas con lo que el juego
// tiene hoy (ver docs/PLAN_CAMPANA_001.md). Ver GOALS en game.js para los tipos de
// objetivo: 'ship' culmina en el climax sobre el buque; 'distance' se cumple al llegar
// (misiones sin boss de buque: el tutorial y las de blanco terrestre, que aun no existe).
// El epilogo y el briefing son claves de STRINGS.

// buques britanicos reales (objetivo del vuelo). Tambien los sortea SUPERVIVENCIA.
import { climaxEnCuarentena, CLIMAX_SUPLENTE } from './cuarentena.js';

export const SHIPS = ['HMS SHEFFIELD', 'HMS COVENTRY', 'HMS ARDENT', 'HMS ANTELOPE',
  'RFA SIR GALAHAD', 'RFA SIR TRISTRAM', 'ATLANTIC CONVEYOR', 'HMS BROADSWORD', 'HMS GLAMORGAN'];

// LOS FIELES por tramo de campaña: el roster es quien esta VIVO segun el guion, y su largo
// es el escuadron (las vidas). El Vasco muere en el epilogo de m7 (vuela la m7 entera);
// el Pichon en el de m9. El jugador siempre es TERO; el orden es el orden de relevo.
const F5 = ['TERO', 'PUMA', 'GITANO', 'VASCO', 'PICHON'];
const F4 = ['TERO', 'PUMA', 'GITANO', 'PICHON'];
const F3 = ['TERO', 'PUMA', 'GITANO'];

// config por mision: TODAS las perillas que la campaña pisa, siempre explicitas — si una
// clave faltara, quedaria pegado el valor de la mision anterior (Object.assign sobre cfg).
// La rampa arranca suave (m1 sin bombas ni viento) y termina con todo prendido (m14).
const C = over => ({
  sky: 'dusk', water: 'sea', terrain: 'sea', wind: true, obstacles: 1, coast: 230,
  bombs: 1, rain: 0, fog: 0, fogLen: 1, squad: 5, caza: 1, persec: 0, ...over,
});

// config legada (la usan pruebas y el modo camara); misma forma que antes
export const CAMPAIGN_CFG = C({});

// ---------- MISIONES ----------
// La CAMPAÑA las juega en orden cronologico; el CICLO DE MUERTE elige una al azar entre
// las que tienen buque (ver SHIP_MISSIONS abajo).
//   climax → SOLO misiones con buque. 'pasada' (default, se puede omitir), 'arena' o 'pulso'. Es el
//            desenlace de la mision, y es DATO: cambiarle la palabra a una mision le cambia el
//            final sin tocar una linea de codigo (SPEC_MODO_PASADA RF-14).
//            La regla de la campaña, dicha por el autor: la mayoria de los niveles con buque son
//            PASILLO + PASADA. El ARENA queda para las ocasionales, y son estas dos:
//              · m5 ARDENT — San Carlos. El callejon ES una arena: agua encerrada entre cerros
//                con el buque fondeado, y la mision se llama EL CALLEJON DE LAS BOMBAS.
//              · m14 GLAMORGAN — EL TERO, la mision final. El cierre de la campaña se pelea,
//                no se pasa de largo.
//            PROPUESTAS_PASADA §8 proponia dos mas (Galahad y Tristram, fondeados en Bahia
//            Agradable); quedaron en PASADA por pedido del autor —"ocasionalmente, uno o dos"—
//            y porque a los dos los bombardearon en corridas de ataque.
//   par    → puntaje de referencia para las estrellas (★ completar, ★★ par, ★★★ par×1.5)
//   roster → los Fieles vivos en esa mision (campaña; su largo = escuadron)
//   story  → secuencia larga de historia (SOLO campaña)
//   brief  → tarjeta corta de 2-3 lineas (ciclo de muerte)
//   epi    → desenlace (epilogo de aire + carta + placa historica)
export const MISSIONS = [
  {
    id: 'm1', name: 'SAL EN LAS ALAS', date: 'fines de abril de 1982',
    goal: { kind: 'distance', meters: 2200 },
    cfg: C({ sky: 'dawn', wind: false, obstacles: 0.5, bombs: 0, caza: 0, persec: 1 }),
    // G-05: las dos charlas en vuelo del tutorial. El ritual de Condor se dice EN VUELO y no en
    // tierra — la voz entra por la radio con el mar pasando abajo, que es como se escuchaba de
    // verdad — y los gansos son el respiro. `obstacles: 0` porque una charla pide cero enemigos en
    // pantalla (SPEC_CHARLAS_VUELO RF-01); el resto de la mision queda como estaba.
    tramos: [
      { hasta: 0.06, obstacles: 0, caza: 0, bombs: 0, charla: 'M01_OBJETIVO' },
      { hasta: 0.12, obstacles: 0, caza: 0, bombs: 0, charla: 'M01_RITUAL' },
      { hasta: 0.30, obstacles: 0, caza: 0, bombs: 0, charla: 'M01_GANSOS' },
      { hasta: 1 },
    ],
    roster: F5, par: 5000, story: 'storyM1', brief: 'briefM1', epi: 'epiM1',
  },
  {
    id: 'm2', name: 'BAUTISMO DE FUEGO', date: '1 de mayo de 1982',
    goal: { kind: 'distance', meters: 2600 },
    cfg: C({ bombs: 0.5 }),
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M02_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F5, par: 6500, story: 'storyM2', brief: 'briefM2', epi: 'epiM2',
  },
  {
    id: 'm3', name: 'EL INVENTO', date: 'primeros dias de mayo de 1982',
    goal: { kind: 'distance', meters: 2400 },
    // LA MISION MAS LIVIANA DE LA CAMPAÑA, Y ES A PROPOSITO (GUION_3 M3): es donde el juego
    // ENSEÑA el sistema de mejoras. El Pichon le toca el avion a Esteban y el jugador tiene que
    // poder SENTIR la diferencia en las manos — eso no se percibe esquivando flak. Por eso vuelve
    // a apagar el bombardeo y la cola, que M2 acababa de prender: la rampa no es monotona, se
    // afloja justo cuando hay algo nuevo que entender.
    // `terrain: 'coast'` porque el guion la llama patrulla de reconocimiento COSTERO, y los
    // "blancos de oportunidad" (boyas, un radar portatil) son la siembra baja de obstaculos.
    cfg: C({ sky: 'dawn', terrain: 'coast', obstacles: 0.5, bombs: 0, caza: 0 }),
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M03_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F5, par: 7000, story: 'storyM3', brief: 'briefM3', epi: 'epiM3',
  },
  {
    id: 'm4', name: 'EL DIA QUE SANGRO EL MAR', date: '4 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS SHEFFIELD', dist: 2600 },
    cfg: C({ bombs: 0.5 }),
    // EL TRANSITO DEL NARWAL (GUION_3, "de donde salen las posiciones"), y la primera mision con
    // TRAMOS (docs/sistemas/SPEC_TRAMOS.md). El guion pide un tramo "sin un solo enemigo en
    // pantalla" en el que el jugador SOLO VUELA Y ESCUCHA: las posiciones que dicta Condor —que
    // despues va a usar para encontrar el blanco— salen de un pesquero civil, y eso se planta
    // liviano para que el cobro de M5 no se vea venir.
    //
    // Son TRECE tramos y no uno porque una radio suena UNA vez por tramo (RF-03): la
    // conversacion se reparte en trece entradas, que es lo que la convierte en conversacion y no
    // en un cartel. Los trece son identicos salvo la linea.
    //
    // `obstacles: 0` y no una densidad baja: el criterio del guion es CERO enemigos, y una
    // densidad chica igual siembra cada doscientos metros. Con `bombs: 0` ademas no cae nada del
    // cielo — un bombardeo en el tramo mudo contradice la escena tanto como una fragata.
    // `marcas: true` lo transporta este item y lo va a consumir el de las marcas de Condor.
    tramos: [
      { hasta: 0.04, obstacles: 0, caza: 0, bombs: 0, charla: 'M04_OBJETIVO' },
      { hasta: 0.07, obstacles: 0, caza: 0, bombs: 0, marcas: true, charla: 'M04_NARWAL_A' },
      { hasta: 0.14, obstacles: 0, caza: 0, bombs: 0, marcas: true, charla: 'M04_NARWAL_B' },
      { hasta: 0.21, obstacles: 0, caza: 0, bombs: 0, marcas: true, charla: 'M04_NARWAL_C' },
      { hasta: 0.28, obstacles: 0, caza: 0, bombs: 0, marcas: true, charla: 'M04_NARWAL_D' },
      { hasta: 0.351, obstacles: 0, caza: 0, bombs: 0, marcas: true, charla: 'M04_NARWAL_E' },
      // y se termina ahi: mar pleno, con la densidad y LA COLA de una mision de verdad. El salto
      // de 0 a 1.2 es el punto — el silencio se cobra en el contraste.
      { hasta: 1, obstacles: 1.2, caza: 1 },
    ],
    roster: F5, par: 7500, story: 'storyM4', brief: 'briefM4', epi: 'epiM4',
  },
  {
    id: 'm5', name: 'EL CALLEJON DE LAS BOMBAS', date: '21 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS ARDENT', dist: 2600 },
    climax: 'arena',   // ver la nota de arriba
    // EL SILENCIO DEL NARWAL (GUION_3 M5, §3.9). Es el MISMO tramo de transito de m4 —misma
    // altura, mismo ritmo de radio— diecisiete dias despues, y el jugador lo reconoce. Solo que
    // esta vez Condor no tiene numeros para dar, y cuando el Gitano le pregunta por el pesquero
    // no contesta. La entrada `m5_radio6` es literalmente tres puntos: radio abierta y nada.
    //
    // `marcas: false` es lo que hace el cobro, y por eso vale mas que cualquier cartel: en m4 el
    // HUD marcaba las unidades antes de verlas; aca no las marca. El jugador entra a la mision
    // mas dificil del movimiento con menos informacion en pantalla, y sabe exactamente por que.
    tramos: [
      { hasta: 0.05, obstacles: 0, caza: 0, bombs: 0, charla: 'M05_OBJETIVO' },
      { hasta: 0.11, obstacles: 0, caza: 0, bombs: 0, marcas: false, charla: 'M05_NARWAL_A' },
      { hasta: 0.21, obstacles: 0, caza: 0, bombs: 0, marcas: false, charla: 'M05_NARWAL_B' },
      { hasta: 0.31, obstacles: 0, caza: 0, bombs: 0, marcas: false, charla: 'M05_NARWAL_C' },
      { hasta: 1, obstacles: 1.7, caza: 1 },
    ],
    cfg: C({ sky: 'cloudy', obstacles: 1.7 }),
    roster: F5, par: 8500, story: 'storyM5', brief: 'briefM5', epi: 'epiM5',
  },
  {
    id: 'm6', name: 'LA BOMBA QUE NO DESPERTO', date: '23 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS ANTELOPE', dist: 2800 },
    cfg: C({ sky: 'sun', obstacles: 1.7, fog: 1, fogLen: 0 }),
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M06_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F5, par: 9000, story: 'storyM6', brief: 'briefM6', epi: 'epiM6',
  },
  {
    id: 'm7', name: '25 DE MAYO', date: '25 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS COVENTRY', dist: 2800 },
    cfg: C({ sky: 'clear', obstacles: 1.7 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M07_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F5, par: 9500, story: 'storyM7', brief: 'briefM7', epi: 'epiM7',
  },
  {
    id: 'm8', name: 'EL BATIR DE ALAS', date: '25 de mayo de 1982 · segunda salida',
    goal: { kind: 'ship', ship: 'ATLANTIC CONVEYOR', dist: 3000 },
    cfg: C({ obstacles: 1.7, rain: 1, squad: 4 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M08_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F4, par: 10000, story: 'storyM8', brief: 'briefM8', epi: 'epiM8',
  },
  {
    id: 'm9', name: 'EL PIBE', date: '27 de mayo de 1982',
    goal: { kind: 'distance', meters: 3200 },
    cfg: C({ sky: 'storm', obstacles: 1.7, bombs: 2, rain: 2, fog: 1, squad: 4 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M09_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F4, par: 10500, story: 'storyM9', brief: 'briefM9', epi: 'epiM9',
  },
  {
    id: 'm10', name: 'LOS PRIMOS', date: '5 de junio de 1982',
    goal: { kind: 'distance', meters: 3600 },
    // LA MAS LARGA DEL JUEGO Y LA UNICA DONDE EL NIVEL ES EL CLIMA (GUION_3 M10). No tiene buque
    // ni blancos: el enemigo es el frente cerrado, la niebla y la nafta. Por eso `obstacles` baja
    // a POCOS y `caza` a 0 en la mision numero diez — leerlo como un error de rampa seria leerlo
    // al reves: es el CONTRASTE de M9. La del Pichon era el infierno lleno; esta es el vacio.
    //
    // `fogLen: 3` (MUY LARGO) es la perilla que hace el trabajo: el banco de niebla dura tanto
    // que volar a ciegas deja de ser un susto y pasa a ser el estado normal del nivel.
    //
    // Es ademas la PRIMERA CON TRES — el guion la titula asi. El hueco del Pichon en la
    // formacion no se nombra: se ve, porque `roster` tiene tres nombres.
    cfg: C({ sky: 'storm', obstacles: 0.5, bombs: 0, caza: 0, rain: 2, fog: 1, fogLen: 3, squad: 3 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M10_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F3, par: 11000, story: 'storyM10', brief: 'briefM10', epi: 'epiM10',
  },
  {
    id: 'm11', name: 'LO QUE NO SE DICE', date: '8 de junio de 1982',
    goal: { kind: 'ship', ship: 'RFA SIR GALAHAD', dist: 3000 },
    cfg: C({ sky: 'cloudy', obstacles: 1.7, squad: 3, caza: 2 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M11_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F3, par: 11500, story: 'storyM11', brief: 'briefM11', epi: 'epiM11',
  },
  {
    id: 'm12', name: 'EL ANGEL DE CORRIENTES', date: '8 de junio de 1982 · segunda salida',
    goal: { kind: 'ship', ship: 'RFA SIR TRISTRAM', dist: 3000 },
    cfg: C({ obstacles: 1.7, bombs: 2, rain: 1, squad: 3 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M12_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F3, par: 12000, story: 'storyM12', brief: 'briefM12', epi: 'epiM12',
  },
  {
    id: 'm13', name: 'LA ULTIMA MESA', date: '11 de junio de 1982',
    goal: { kind: 'ship', ship: 'HMS BROADSWORD', dist: 3200 },
    cfg: C({ sky: 'moon', terrain: 'land', obstacles: 1.7, bombs: 2, fog: 1, squad: 3, caza: 2 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M13_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F3, par: 12500, story: 'storyM13', brief: 'briefM13', epi: 'epiM13',
  },
  {
    id: 'm14', name: 'EL TERO', date: 'madrugada del 12 de junio de 1982',
    goal: { kind: 'ship', ship: 'HMS GLAMORGAN', dist: 3400 },
    climax: 'arena',   // ver la nota de arriba
    cfg: C({ sky: 'night', obstacles: 1.7, bombs: 2, fog: 1, fogLen: 2, squad: 3, caza: 2 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    roster: F3, par: 14000, story: 'storyM14', brief: 'briefM14', epi: 'epiM14',
  },
];

// EL PULSO ('pulso', PLAN_EL_PULSO.md) es el tercero, y HOY NINGUNA MISION LO PIDE. No es un
// olvido: el plan §6.5 lo prohibe explicitamente —«no reemplazar a la PASADA de oficio»— hasta que
// pase una de dos cosas: que el rescate de la PASADA falle su gate (R6) y EL PULSO pase a ser el
// climax general, o que exista m14, el momento del misil del guion, que es su via de entrada
// garantizada. El modo esta entero y probado (`npm run pulso`); lo unico que falta para que un
// nivel lo juegue es escribir `climax: 'pulso'` en su renglon de arriba. Esa es la prueba de que
// el climax es DATO: se enchufa con una palabra, no con una rama de codigo.

/** QUE CLIMAX juega una mision: 'pasada' · 'arena' · 'pulso' · null (no tiene, la cierra el PASILLO).
 *
 *  El default vive ACA y no en `game.js` a proposito: es la regla de la campaña, no una decision
 *  del motor, y siendo pura se puede probar en node sin abrir una ventana (SPEC_MODO_PASADA
 *  RF-14 — "cambiar el campo de una mision cambia su climax sin tocar codigo").
 *
 *  LA CUARENTENA SE APLICA ACA, Y NO PISANDO EL DATO (PLAN_REFACTOR §4b, 18/8/2026): las dos
 *  misiones que declaran `climax: 'arena'` LO SIGUEN DECLARANDO, y mientras el ARENA y la PASADA
 *  esten apartados juegan el suplente. Reescribir los renglones habria borrado la decision del
 *  autor y despues nadie se acuerda de cuales eran; asi, levantar la cuarentena es sacar una
 *  entrada de data/cuarentena.js y la campaña vuelve sola a lo que decia. */
export const climaxDeclarado = m => m.goal.kind !== 'ship' ? null : (m.climax || 'pasada');
export const climaxOf = m => {
  const c = climaxDeclarado(m);
  return c && climaxEnCuarentena(c) ? CLIMAX_SUPLENTE : c;
};

// indices de las misiones CON buque: es el pool del CICLO DE MUERTE y del ARENA (las de
// distancia no tienen climax que jugar ni layout de zonas que elegir)
export const SHIP_MISSIONS = MISSIONS.reduce((a, m, i) => {
  if (m.goal.kind === 'ship') a.push(i);
  return a;
}, []);
