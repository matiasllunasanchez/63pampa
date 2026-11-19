// EL TEATRO DE MALVINAS — el orden de batalla del 24 de mayo de 1982 sobre el mapa real (prototipo I1).
// Plan y porque: docs/proyecto/PLAN_TEATRO_MALVINAS.md. Lo arma systems/islas/teatro.js; lo dibuja teatro3d.js.
//
// ⚠ LAS POSICIONES son aproximadas (~1 km) y cada pieza se ACOMODA al terreno al nacer (lo de tierra busca suelo
// plano cerca de su punto; los buques, agua honda). LOS NOMBRES DE BUQUES van como ejemplo del tipo que estaba,
// no como registro de quien estaba donde el 24: A VERIFICAR (docs/historia/PREGUNTAS_HISTORICAS.md).
//
// PIEZAS (la malla de cada una y su medida real en teatro3d.js MEDIDA):
//   carpa · deposito · puesto · radar     edificios
//   rapier · manpad · canon               antiaereo (el `canon` usa la malla del camion antiaereo)
//   camion                                vehiculo (la misma malla, sin tirar)
//   soldados                              un grupo que camina en ronda
//   pucara · herc                         aviones estacionados (los de las bases argentinas)
// `n` = cuantas; se reparten alrededor del centro, a `r` metros.

export const FECHA = '24 DE MAYO DE 1982';

export const BASES = [
  // ---------------- LA CABEZA DE PLAYA BRITANICA (San Carlos) ----------------
  { n: 'PUERTO SAN CARLOS', bando: 'gb', lon: -59.030, lat: -51.505, r: 260,
    piezas: { carpa: 5, deposito: 1, puesto: 1, rapier: 2, camion: 2, soldados: 3 } },
  { n: 'SAN CARLOS', bando: 'gb', lon: -59.010, lat: -51.525, r: 240,
    piezas: { carpa: 4, deposito: 2, radar: 1, rapier: 1, camion: 1, soldados: 3 } },
  { n: 'BAHIA AJAX', bando: 'gb', lon: -59.085, lat: -51.545, r: 220,
    piezas: { deposito: 3, carpa: 3, rapier: 1, camion: 2, soldados: 2 } },
  { n: 'MONTE SUSSEX', bando: 'gb', lon: -59.000, lat: -51.585, r: 300,
    piezas: { puesto: 2, manpad: 2, carpa: 2, soldados: 2 } },
  { n: 'CABO FANNING', bando: 'gb', lon: -59.125, lat: -51.440, r: 160,
    piezas: { puesto: 1, manpad: 1, rapier: 1, soldados: 1 } },
  // los Rapier de los cerros de la bahia, sueltos
  { n: 'RAPIER (BAHIA SAN CARLOS ESTE)', bando: 'gb', lon: -58.990, lat: -51.500, r: 60, piezas: { rapier: 1 } },
  { n: 'RAPIER (BAHIA SAN CARLOS OESTE)', bando: 'gb', lon: -59.105, lat: -51.510, r: 60, piezas: { rapier: 1 } },

  // ---------------- LO NUESTRO ----------------
  { n: 'PUERTO ARGENTINO', bando: 'arg', lon: -57.860, lat: -51.692, r: 420,
    piezas: { deposito: 4, carpa: 4, puesto: 2, canon: 2, camion: 3, soldados: 4 } },
  { n: 'BAM MALVINAS', bando: 'arg', lon: -57.777, lat: -51.686, r: 380,
    piezas: { deposito: 2, radar: 1, canon: 3, rapier: 1, camion: 2, pucara: 2, herc: 1, soldados: 3 } },
  { n: 'PRADERA DEL GANSO', bando: 'arg', lon: -58.973, lat: -51.826, r: 320,
    piezas: { deposito: 2, carpa: 3, canon: 2, pucara: 3, camion: 1, soldados: 3 } },
  { n: 'DARWIN', bando: 'arg', lon: -58.958, lat: -51.808, r: 200,
    piezas: { puesto: 2, carpa: 2, soldados: 2 } },
  { n: 'PUERTO YAPEYU', bando: 'arg', lon: -59.516, lat: -51.616, r: 260,
    piezas: { carpa: 4, puesto: 2, canon: 1, camion: 1, soldados: 3 } },
  { n: 'BAHIA FOX', bando: 'arg', lon: -60.070, lat: -51.940, r: 260,
    piezas: { carpa: 4, puesto: 2, canon: 1, soldados: 3 } },
  { n: 'MONTE KENT', bando: 'arg', lon: -58.112, lat: -51.674, r: 200, piezas: { puesto: 2, soldados: 2 } },
  { n: 'MONTE LONGDON', bando: 'arg', lon: -57.982, lat: -51.665, r: 180, piezas: { puesto: 2, soldados: 2 } },
  { n: 'DOS HERMANAS', bando: 'arg', lon: -58.025, lat: -51.682, r: 180, piezas: { puesto: 1, soldados: 2 } },
  { n: 'ISLA BORBON', bando: 'arg', lon: -59.610, lat: -51.310, r: 200, piezas: { carpa: 2, puesto: 1, soldados: 1 } },
];

// LOS BUQUES (britanicos). `malla`: t21 (fragata Tipo 21), t42 (destructor Tipo 42), log (logistico / de
// desembarco). `rumbo` en grados (0 = norte). Los de piquete patrullan despacio (`patrulla`: metros de ida y vuelta).
export const BUQUES = [
  // adentro de la bahia, fondeados, a lo largo del canal (en el DEM la bahia es un canal angosto y bajo que baja
  // de norte a sur entre lon -59,085 y -59,06: las posiciones salen de mirarlo, tools: el mapa ASCII del plan)
  { n: 'HMS PLYMOUTH', malla: 't21', lon: -59.084, lat: -51.497, rumbo: 165, bahia: true },
  { n: 'RFA STROMNESS', malla: 'log', lon: -59.080, lat: -51.506, rumbo: 170, bahia: true },
  { n: 'RFA SIR GALAHAD', malla: 'log', lon: -59.080, lat: -51.514, rumbo: 170, bahia: true },
  { n: 'RFA SIR LANCELOT', malla: 'log', lon: -59.077, lat: -51.523, rumbo: 165, bahia: true },
  { n: 'RFA SIR GERAINT', malla: 'log', lon: -59.073, lat: -51.533, rumbo: 160, bahia: true },
  { n: 'HMS ANTELOPE', malla: 't21', lon: -59.064, lat: -51.544, rumbo: 160, bahia: true },
  // la boca y el Estrecho de San Carlos, de piquete
  { n: 'HMS BROADSWORD', malla: 't21', lon: -59.165, lat: -51.470, rumbo: 220, patrulla: 3000 },
  { n: 'HMS YARMOUTH', malla: 't21', lon: -59.220, lat: -51.520, rumbo: 200, patrulla: 3000 },
  { n: 'HMS COVENTRY', malla: 't42', lon: -59.420, lat: -51.250, rumbo: 90, patrulla: 5000 },
];

// LAS PAC: parejas de Sea Harrier en circulo u ocho. `r` = radio (m), `alt` = sobre el mar (m).
export const PAC = [
  { n: 'PAC ESTRECHO NORTE', lon: -59.250, lat: -51.440, r: 3500, alt: 320, forma: 'ocho' },
  { n: 'PAC ESTRECHO SUR', lon: -59.150, lat: -51.700, r: 3000, alt: 280, forma: 'circulo' },
  { n: 'PAC GRAN MALVINA', lon: -59.700, lat: -51.500, r: 4500, alt: 400, forma: 'ocho' },
  { n: 'PAC SOLEDAD NORTE', lon: -58.700, lat: -51.420, r: 4000, alt: 350, forma: 'circulo' },
];

// LAS ARMAS (britanicas). `alcance` = a cuantos metros te ven y empiezan a tirar; `tiro` = desde cuantos metros
// ADELANTE en el carril sale el disparo como mucho (el pasillo tira entre 80 y 215: un misil que sale a 4 km tarda
// 20 s en llegar y no es amenaza, es paisaje). Cadencia en segundos. Disparan con los misiles y trazadoras del
// pasillo (systems/collision.js): estos numeros dicen CUANDO salen, no como pegan.
export const ARMAS = {
  rapier: { alcance: 3500, tiro: 700, cada: 5, tipo: 'misil' },
  manpad: { alcance: 2200, tiro: 450, cada: 8, tipo: 'misil' },
  canon: { alcance: 2000, tiro: 450, cada: 1.2, tipo: 'traza' },
  // el buque: misil (Sea Cat / Sea Dart) y su cañon
  buque: { alcance: 4500, tiro: 800, cada: 4, tipo: 'misil', traza: { alcance: 2200, tiro: 500, cada: 1.0 } },
};
// a cuanto te ve una PAC y te sale a buscar
export const PAC_VE = 3500;
// una PAC que se fue (no la bajaste) vuelve a su circulo a los (s)
export const PAC_VUELVE = 60;
