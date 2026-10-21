// EL ARMAMENTO REAL DE CADA BUQUE (docs/sistemas/PLAN_DEFENSAS_BUQUE.md §4). Datos puros.
//
// Pedido del autor (15/10/2026): "cada fragata, buque o lo que sea debe tener el armamento real que
// tenia". Por eso esto se indexa por NOMBRE de buque y no por clase visual: la Plymouth se DIBUJA con
// la hoja del Tipo 21 (data/ships.js) pero se ARMA como lo que era, un Tipo 12 con cañon doble Mk 6.
//
// Cada sistema: `tipo` (data/sistemas_buque.js), `u` (donde esta en la eslora: 0 = proa, 1 = popa,
// medido sobre la caja de la hoja horneada — la proa queda a la IZQUIERDA del pasillo) y, si hace
// falta, `nombre` (lo que dice el corchete, cuando el tipo generico no alcanza: SEA SLUG, 4.5 MK6).
// `h` es la ALTURA de la pieza sobre la flotacion, en fraccion de la eslora, medida en la misma hoja.
// No sale del PERFIL de data/blanco.js a proposito: el perfil mide el punto mas alto de cada franja,
// y donde hay un mastil (el domo 909 de proa del Tipo 42 esta al pie del palo) la caja quedaba en la
// punta del mastil. Si se re-hornea un buque, se re-miden estas posiciones.
//
// `escolta` (decision D5 del autor, 20/10: se VE): el buque que lo cubria y tiraba por el. Su
// defensa entra de costado y no se puede cañonear — es otro buque.
//
// Confianza: los ≈ estan anotados en docs/historia/PREGUNTAS_HISTORICAS.md ("EL ARMAMENTO DE CADA
// BUQUE", 15/10/2026). Regla del proyecto: el dato provisorio queda en el juego y la duda se anota.

// ---- las posiciones, por HOJA (medidas sobre buque_<clase>.png, frame 0) ----
// Tipo 21 (Ardent): el 4,5" en la proa; la caseta del director y el lanzador Sea Cat en el techo del
// hangar, a popa; los 20 mm a los costados del puente y en la cintura.
const T21 = { proa: { u: 0.08, h: 0.10 }, puente: { u: 0.26, h: 0.13 }, cintura: { u: 0.5, h: 0.12 },
  director: { u: 0.64, h: 0.11 }, hangar: { u: 0.69, h: 0.09 } };
// Tipo 42 (Sheffield): el 4,5" en la proa, el lanzador doble del Sea Dart delante del puente, los dos
// domos 909 (proa y popa), los 20 mm en la cintura.
const T42 = { proa: { u: 0.13, h: 0.105 }, dart: { u: 0.32, h: 0.115 }, r909a: { u: 0.37, h: 0.17 },
  cintura: { u: 0.53, h: 0.095 }, cintura2: { u: 0.66, h: 0.10 }, r909b: { u: 0.73, h: 0.105 }, popa: { u: 0.85, h: 0.07 } };
// Logistico (Sir Galahad, Atlantic Conveyor): Bofors en la proa y sobre la superestructura de popa.
const LOG = { proa: { u: 0.06, h: 0.12 }, puente: { u: 0.79, h: 0.195 }, popa: { u: 0.87, h: 0.14 } };
// Portaaviones: el Sea Dart en la proa, debajo de la rampa (tools/models/buques.js); la isla a popa.
const CV = { proa: { u: 0.06, h: 0.10 }, isla: { u: 0.62, h: 0.25 }, popa: { u: 0.9, h: 0.08 }, cintura: { u: 0.4, h: 0.1 } };

const TIPO_42 = [
  { tipo: 'canon_45', ...T42.proa, nombre: '4.5 MK8' },
  { tipo: 'seadart_lanz', ...T42.dart },
  { tipo: 'seadart_909', ...T42.r909a },
  { tipo: 'seadart_909', ...T42.r909b },
  { tipo: 'oerlikon', ...T42.cintura },        // ≈ cuantos 20 mm llevaba cada uno en 1982
  { tipo: 'oerlikon', ...T42.cintura2 },
];
const TIPO_21 = [
  { tipo: 'canon_45', ...T21.proa, nombre: '4.5 MK8' },
  { tipo: 'oerlikon', ...T21.puente },
  { tipo: 'oerlikon', ...T21.cintura },
  { tipo: 'seacat_dir', ...T21.director },
  { tipo: 'seacat_lanz', ...T21.hangar },
  { tipo: 'gpmg', ...T21.cintura },
];
// TIPO 22 (Broadsword, Brilliant): DOS Sea Wolf (proa y popa) con sus dos 910, y SIN cañon de 4,5".
const TIPO_22 = [
  { tipo: 'seawolf_lanz', ...T21.proa },
  { tipo: 'seawolf_910', ...T21.puente },
  { tipo: 'bofors', ...T21.cintura },          // ≈ los Bofors del Broadsword
  { tipo: 'seawolf_910', ...T21.director },
  { tipo: 'seawolf_lanz', ...T21.hangar },
];

export const ARMAMENTO = {
  // ---- TIPO 42 Batch 1 ✔ ----
  'HMS SHEFFIELD': { clase: 'Tipo 42', sistemas: TIPO_42 },
  // 12/5: la Glasgow iba en el "combo 42/22" con la BRILLIANT. El Sea Wolf que bajo a la escuadrilla
  // CUÑA era de ella, y contra ORO su 910 fallo al cruzarse los aviones (≈, fuentes britanicas).
  'HMS GLASGOW': { clase: 'Tipo 42', sistemas: TIPO_42,
    escolta: { nombre: 'HMS BRILLIANT', clase: 'Tipo 22', hoja: 't21', lado: 1, sistemas: TIPO_22 } },
  // 25/5: la Coventry con la BROADSWORD; el 910 de la Broadsword fallo cuando la Coventry le cruzo
  // la linea de tiro. La Coventry sumaba ametralladoras y fusileria en cubierta.
  'HMS COVENTRY': { clase: 'Tipo 42', sistemas: [...TIPO_42, { tipo: 'gpmg', ...T42.cintura }],
    escolta: { nombre: 'HMS BROADSWORD', clase: 'Tipo 22', hoja: 't21', lado: -1, sistemas: TIPO_22 } },

  // ---- TIPO 21 ✔ ----
  // 21/5: ≈ las primeras bombas (Dagger, ~14:00) se llevaron el lanzador Sea Cat del techo del
  // hangar y el Lynx; los A-4Q de la Armada llegaron despues. Si se confirma, la mision lo dice con
  // `sistemasIniciales` (fase F5) — el buque no cambia: cambia como lo encontraron.
  'HMS ARDENT': { clase: 'Tipo 21', sistemas: TIPO_21 },
  'HMS ANTELOPE': { clase: 'Tipo 21', sistemas: TIPO_21 },
  'HMS AVENGER': { clase: 'Tipo 21', sistemas: TIPO_21 },

  // ---- TIPO 12M, clase Rothesay ✔ (se dibuja con la hoja t21) ----
  // El cañon DOBLE Mk 6 a proa, Sea Cat a popa. ≈ los 20 mm agregados para la campaña.
  'HMS PLYMOUTH': { clase: 'Tipo 12', sistemas: [
    { tipo: 'canon_45', ...T21.proa, nombre: '4.5 MK6' },
    { tipo: 'oerlikon', ...T21.puente },
    { tipo: 'oerlikon', ...T21.cintura },
    { tipo: 'seacat_dir', ...T21.director },
    { tipo: 'seacat_lanz', ...T21.hangar },
  ] },

  // ---- TIPO 22 ✔ (se dibuja con la hoja t21) ----
  'HMS BROADSWORD': { clase: 'Tipo 22', sistemas: TIPO_22 },
  'HMS BRILLIANT': { clase: 'Tipo 22', sistemas: TIPO_22 },

  // ---- CLASE COUNTY ✔/≈ (se dibuja con la hoja t42) ----
  // El Sea Slug (largo alcance, a popa) se juega como el Sea Dart; dos Sea Cat; el cañon doble Mk 6.
  'HMS GLAMORGAN': { clase: 'County', sistemas: [
    { tipo: 'canon_45', ...T42.proa, nombre: '4.5 MK6' },
    { tipo: 'seacat_lanz', ...T42.cintura },
    { tipo: 'seacat_dir', ...T42.r909a },
    { tipo: 'oerlikon', ...T42.cintura2 },
    { tipo: 'seadart_909', ...T42.r909b, nombre: '901' },
    { tipo: 'seadart_lanz', ...T42.popa, nombre: 'SEA SLUG' },
  ] },

  // ---- LOGISTICOS ----
  // ≈ los LSL con dos Bofors de 40 mm; en Fitzroy los cubria (mal) el Rapier de tierra.
  'RFA SIR GALAHAD': { clase: 'LSL Round Table', sistemas: [
    { tipo: 'bofors', ...LOG.proa }, { tipo: 'gpmg', ...LOG.puente }, { tipo: 'bofors', ...LOG.popa },
  ] },
  'RFA SIR TRISTRAM': { clase: 'LSL Round Table', sistemas: [
    { tipo: 'bofors', ...LOG.proa }, { tipo: 'gpmg', ...LOG.puente }, { tipo: 'bofors', ...LOG.popa },
  ] },
  // Un portacontenedores requisado: sin armamento. La gente de cubierta, nada mas.
  'ATLANTIC CONVEYOR': { clase: 'Portacontenedores', sistemas: [{ tipo: 'gpmg', ...LOG.puente }] },

  // ---- PORTAAVIONES ----
  'HMS INVINCIBLE': { clase: 'Invincible', sistemas: [
    { tipo: 'seadart_lanz', ...CV.proa }, { tipo: 'seadart_909', ...CV.isla }, { tipo: 'oerlikon', ...CV.popa },
  ] },
  'HMS HERMES': { clase: 'Centaur', sistemas: [
    { tipo: 'seacat_lanz', ...CV.proa }, { tipo: 'seacat_dir', ...CV.isla },
    { tipo: 'seacat_lanz', ...CV.popa }, { tipo: 'oerlikon', ...CV.cintura },
  ] },
};

/** El armamento de un buque por nombre, o null (un buque sin entrada usa la defensa de respaldo de
 *  data/defensas.js, como antes de este plan). */
export const armamentoDe = nombre => ARMAMENTO[nombre] || null;
