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
//   blindado                              Scorpion / Scimitar (la misma malla: tira con su cañon)
//   soldados                              un grupo que camina en ronda
//   pucara · herc                         aviones estacionados (los de las bases argentinas)
// `n` = cuantas; se reparten alrededor del centro, a `r` metros.

import { RADAR_ALT } from './tuning.js';

export const FECHA = '24 DE MAYO DE 1982';

export const BASES = [
  // ---------------- LA CABEZA DE PLAYA BRITANICA (San Carlos) ----------------
  { n: 'PUERTO SAN CARLOS', bando: 'gb', lon: -59.030, lat: -51.505, r: 260,
    piezas: { carpa: 5, deposito: 1, puesto: 1, rapier: 2, camion: 2, blindado: 2, soldados: 3 } },
  { n: 'SAN CARLOS', bando: 'gb', lon: -59.010, lat: -51.525, r: 240,
    piezas: { carpa: 4, deposito: 2, radar: 1, rapier: 1, camion: 1, soldados: 3 } },
  { n: 'BAHIA AJAX', bando: 'gb', lon: -59.085, lat: -51.545, r: 220,
    piezas: { deposito: 3, carpa: 3, rapier: 1, camion: 2, blindado: 1, soldados: 2 } },
  { n: 'MONTE SUSSEX', bando: 'gb', lon: -59.000, lat: -51.585, r: 300,
    piezas: { puesto: 2, manpad: 2, carpa: 2, blindado: 1, soldados: 2 } },
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

// LOS BUQUES. `malla`: t21 (fragata Tipo 21), t42 (destructor Tipo 42), log (logistico / de desembarco). `rumbo` en
// grados (0 = norte). Los de piquete patrullan despacio (`patrulla`: metros de ida y vuelta). `clase` dice sus armas
// (DEFENSA, abajo; si no, la de su malla) y `esc` agranda o achica la malla (no hay horneado propio todavia: el
// portaaviones y la barcaza usan el logistico — A6, hornear lo britanico). `bando` 'arg' = nuestro (no tira).
// SIN IDENTIFICADOR (21/11, el autor: "el gran problema de los argentinos era la comunicacion y la falta de tecnologia
// para identificar… quiero que el jugador se confunda y no entienda bien si lo que ataca es amigo o enemigo"): ningun
// nombre en pantalla; el nombre sale recien en el cartel de LE DISTE A. La bandera si (la llevaban), siempre.
export const BUQUES = [
  // adentro de la bahia, fondeados, a lo largo del canal (en el DEM la bahia es un canal angosto y bajo que baja
  // de norte a sur entre lon -59,085 y -59,06: las posiciones salen de mirarlo, tools: el mapa ASCII del plan)
  { n: 'HMS PLYMOUTH', malla: 't21', lon: -59.084, lat: -51.497, rumbo: 165, bahia: true },
  { n: 'RFA STROMNESS', malla: 'log', lon: -59.080, lat: -51.506, rumbo: 170, bahia: true },
  { n: 'RFA SIR GALAHAD', malla: 'log', lon: -59.080, lat: -51.514, rumbo: 170, bahia: true },
  { n: 'RFA SIR LANCELOT', malla: 'log', lon: -59.077, lat: -51.523, rumbo: 165, bahia: true },
  { n: 'RFA SIR GERAINT', malla: 'log', lon: -59.073, lat: -51.533, rumbo: 160, bahia: true },
  { n: 'HMS ANTELOPE', malla: 't21', lon: -59.064, lat: -51.544, rumbo: 160, bahia: true },
  // LAS BARCAZAS de desembarco (LCU), yendo y viniendo entre los buques y la costa
  { n: 'LCU F1', malla: 'log', clase: 'lcu', esc: 0.22, lon: -59.070, lat: -51.512, rumbo: 80, bahia: true, patrulla: 700 },
  { n: 'LCU F4', malla: 'log', clase: 'lcu', esc: 0.22, lon: -59.066, lat: -51.528, rumbo: 70, bahia: true, patrulla: 600 },
  { n: 'LCU T2', malla: 'log', clase: 'lcu', esc: 0.22, lon: -59.074, lat: -51.502, rumbo: 100, bahia: true, patrulla: 500 },
  // la boca y el Estrecho de San Carlos, de piquete (la BROADSWORD, Tipo 22, con Sea Wolf: la malla de la Tipo 21)
  { n: 'HMS BROADSWORD', malla: 't21', def: 'wolf', lon: -59.165, lat: -51.470, rumbo: 220, patrulla: 3000 },
  { n: 'HMS YARMOUTH', malla: 't21', lon: -59.220, lat: -51.520, rumbo: 200, patrulla: 3000 },
  { n: 'HMS COVENTRY', malla: 't42', lon: -59.420, lat: -51.250, rumbo: 90, patrulla: 5000 },
  // LOS PORTAAVIONES (21/11, el autor: "bien lejos de la isla, casi cerca del limite del mapa, y es IMPOSIBLE de
  // entrar, te matan antes. La unica forma es un Super Etendard y estar a una distancia X para lanzar el Exocet con el
  // PULSO"): al este, contra el borde del mapa (A VERIFICAR: en la realidad estaban mucho mas al este)
  { n: 'HMS HERMES', malla: 'log', clase: 'cv', esc: 1.75, lon: -57.40, lat: -51.80, rumbo: 200, patrulla: 4000 },
  { n: 'HMS INVINCIBLE', malla: 'log', clase: 'cv', esc: 1.45, lon: -57.42, lat: -51.62, rumbo: 210, patrulla: 4000 },
  // LO NUESTRO EN EL AGUA (A VERIFICAR donde estaba cada uno el 24 de mayo): el transporte que quedo en Bahia Fox
  // despues del ataque del 16, el costero Monsunen cerca de Darwin y el guardacostas de Prefectura en Puerto
  // Argentino. Estan para que la duda sea de verdad: de lejos un buque es un buque
  { n: 'ARA BAHIA BUEN SUCESO', malla: 'log', bando: 'arg', lon: -60.060, lat: -51.950, rumbo: 120, bahia: true },
  { n: 'ARA MONSUNEN', malla: 'log', bando: 'arg', clase: 'lcu', esc: 0.35, lon: -58.960, lat: -51.835, rumbo: 60, bahia: true },
  { n: 'GC ISLAS MALVINAS', malla: 'log', bando: 'arg', clase: 'lcu', esc: 0.22, lon: -57.800, lat: -51.668, rumbo: 90, bahia: true, patrulla: 800 },
];

// LAS DEFENSAS DE CADA CLASE (21/11, el autor: "todos los barcos atacan a los aviones cercanos, con corto, medio y
// largo alcance segun distancia"). Tres bandas, cada una con su arma del pasillo:
//   largo  el SEA DART (Tipo 42 y portaaviones): te ve de lejos y te tira arriba de todo
//   medio  el SEA CAT (Tipo 21, Tipo 12) o el SEA WOLF (Tipo 22): `arma` 'cat' / 'wolf' (systems/collision.js)
//   corto  el cañon y las ametralladoras: trazadoras
// `alcance` = a cuantos metros tira; `tiro` = desde cuanto ADELANTE en el carril sale (ver ARMAS); `cada` = cadencia.
// `vida`: MUCHA (100); una bomba bien pegada saca 30-60, y lo UNICO que lo hunde es que la bomba DETONE (BOMBA).
// DAÑADO TIRA MENOS: la cadencia se estira con la vida que le queda (`DAÑADO_MIN` de la cadencia a vida 0).
// `muro` (los portaaviones): mas cerca de esto la barrera es total — rafagas de Sea Dart una tras otra.
const TRAZA = { arma: 'traza', alcance: 2000, tiro: 450, cada: 1.0 };
export const DEFENSA = {
  t42: { largo: { arma: 'dart', alcance: 9000, tiro: 900, cada: 8 }, medio: { arma: 'misil', alcance: 4500, tiro: 700, cada: 6 }, corto: TRAZA },
  t21: { medio: { arma: 'cat', alcance: 4500, tiro: 700, cada: 4.5 }, corto: TRAZA },
  log: { corto: { arma: 'traza', alcance: 1800, tiro: 400, cada: 1.6 } },
  lcu: { corto: { arma: 'traza', alcance: 1200, tiro: 350, cada: 2.2 } },
  cv: { largo: { arma: 'dart', alcance: 18000, tiro: 1000, cada: 2.2, n: 2 }, medio: { arma: 'cat', alcance: 5000, tiro: 700, cada: 2.5 }, corto: TRAZA, muro: 9000 },
};
export const DANADO_MIN = 0.35;
// LAS BOMBAS CONTRA UN BUQUE (21/11, el autor: "la probabilidad de que explote la bomba es MUY BAJA, la de pegarle
// normal tirando a baja, la de que perfore el barco es alta si se le tira correctamente… el daño de una bomba bien
// pegada depende de la zona donde impacta y si atraviesa o queda en el barco, entre 30 y 60% maximo… si el jugador se
// pone a bajar barcos, le sea dificil embocarla y si la emboca generalmente no detone"). Las espoletas de mayo de 1982
// fallaban: muchas bombas atravesaban el casco sin estallar.
//   PEGA      de las que caen sobre el casco, cuantas lo tocan de verdad (el resto cae al agua al lado)
//   PERFORA   de las que pegan, cuantas lo perforan (CENTRO del casco; en la PUNTA, PERFORA_PUNTA)
//   DETONA    de las que pegan, cuantas estallan: la UNICA forma de hundirlo
//   ATRAVIESA de las que perforan, cuantas salen por el otro lado (daño menor que las que quedan adentro)
//   DANO      [min, max] de vida por ZONA: maquinas (el medio), el resto del casco, las puntas; ATRAVIESA lo multiplica
//   PISO      la vida mas baja a la que llega sin una detonacion (no se hunde)
//   TRABA     de cada bomba que se suelta sobre el mapa, cuantas no salen (se traba en el soporte)
export const BOMBA = { PEGA: 0.6, PERFORA: 0.88, PERFORA_PUNTA: 0.55, DETONA: 0.07, ATRAVIESA: 0.5,
  DANO: { maquinas: [45, 60], casco: [35, 50], punta: [30, 40] }, DANO_ATRAVIESA: 0.8, DANO_REBOTA: [4, 10], PISO: 8, TRABA: 0.12,
  BALA: 0.12 };   // (cada bala de cañon que le pega: un rasguño)
// LOS QUE TIRAN DESDE TIERRA (21/11, el autor: "soldados de tierra te disparan si estas cerca de la tierra, ademas de
// algunos vehiculos"): los soldados britanicos a menos de `alcance` m y por debajo de `techo` m sobre ellos; de a
// `max` por vez (los mas cercanos)
export const FUSILES = { alcance: 700, techo: 160, tiro: 320, cada: 3.5, max: 4 };

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
  // los BLINDADOS (Scorpion / Scimitar): su cañon, a corto
  blindado: { alcance: 1600, tiro: 400, cada: 1.8, tipo: 'traza' },
  // el buque: misil (Sea Cat / Sea Dart) y su cañon
  buque: { alcance: 4500, tiro: 800, cada: 4, tipo: 'misil', traza: { alcance: 2200, tiro: 500, cada: 1.0 } },
};
// a cuanto te ve una PAC (a ojo) y te sale a buscar
export const PAC_VE = 3500;

// LAS ZONAS DE RADAR (20/11, el autor: "debe haber RADIOS de ZONAS de radares, tanto nuestros (Puerto Argentino)
// como de ellos… persecucion de Harriers segun zona"). `r` en metros. Las britanicas van con un buque (`buque`:
// se mueve con el y se apaga si lo hundis) o fijas en tierra.
//   BRITANICA: si estas adentro Y ARRIBA DE RADAR_BAJO sobre el suelo, te ven: la PAC mas cercana (a PAC_VECTOR)
//              rompe el circulo y viene a buscarte. Volando bajo el relieve y el mar te tapan (es lo que se hacia).
//   NUESTRA:   el radar de Puerto Argentino te avisa de las PAC que ve, y los Harriers que te persiguen se van
//              al entrar (no se meten bajo los antiaereos de la plaza).
// ⚠ A VERIFICAR (docs/historia/PREGUNTAS_HISTORICAS.md): los alcances son de juego, no los reales (el TPS-43
// veia mucho mas lejos, pero el relieve le tapaba el oeste; el Tipo 965 del Coventry era el piquete de radar).
export const RADARES = [
  // (21/11, el autor: "los radares no deben cubrir toda la isla, solo las zonas que realmente cubren"): zonas
  // acotadas — la nuestra cubre Puerto Argentino y los montes; las de ellos, el Estrecho y la bahia — y entre medio
  // queda isla sin cubrir
  { n: 'RADAR PUERTO ARGENTINO', bando: 'arg', lon: -57.86, lat: -51.69, r: 22000 },
  { n: 'HMS COVENTRY', bando: 'gb', buque: 'HMS COVENTRY', r: 16000 },
  { n: 'HMS BROADSWORD', bando: 'gb', buque: 'HMS BROADSWORD', r: 11000 },
  { n: 'BAHIA SAN CARLOS', bando: 'gb', lon: -59.07, lat: -51.52, r: 10000 },
];
// m sobre el suelo: abajo de esto el radar britanico no te ve — EL MISMO TECHO DEL PASILLO (RADAR_ALT, 20/11, el
// autor: "el efecto del radar debe ser igual a pasillo"); era 45
export const RADAR_BAJO = RADAR_ALT;
export const PAC_VECTOR = 22000;   // hasta cuanto viene una PAC cuando el radar te ve
export const PAC_VEL_VECTOR = 300; // m/s como minimo cuando viene a buscarte (y 1,7 veces la tuya: te alcanza)
export const PAC_OLVIDA = 10;      // s sin que el radar te vea: la PAC vuelve a su circulo
export const RAFAGA_ISLAS = 6;     // tiros de cada rafaga de cañon de los Harriers (el pasillo: 2)
// una PAC que se fue (no la bajaste) vuelve a su circulo a los (s)
export const PAC_VUELVE = 60;
