// ZONAS CRITICAS de cada clase de barco (el minijuego MOMENTUM) y a que clase pertenece
// cada buque. Datos puros.
// Vivian ~750 lineas DEBAJO de useShip(), que los usa: funcionaba solo porque se llama tarde.
// Como modulo, el import resuelve ese orden y deja de ser fragil.
// LAYOUTS POR CLASE DE BARCO: cada barcaza tiene sus propias zonas criticas y dificultad.
// `at` y `scale` son IGUALES entre layouts (la aproximacion/trigger no cambia); lo que varia
// son las zonas, sus HP (dificultad), puntos y ventanas de tiempo.
export const MOM_LAYOUTS = {
  // Destructor Tipo 42 (SHEFFIELD, COVENTRY): AA a proa/popa → radar del mastil → PUENTE
  t42: [
    {
      at: 0.78, scale: 0.55, time: 5.5, zones: [
        { id: 'aa_l', label: 'zone_aa', u: -0.52, v: 0, w: 0.15, h: 1.3, maxHp: 55, pts: 350 },
        { id: 'aa_r', label: 'zone_aa', u: 0.52, v: 0, w: 0.15, h: 1.3, maxHp: 55, pts: 350 }]
    },
    {
      at: 0.90, scale: 0.75, time: 4.5, zones: [
        { id: 'radar', label: 'zone_radar', u: 0.10, v: 2.7, w: 0.11, h: 1.5, maxHp: 45, pts: 500 }]
    },
    {
      at: 1.00, scale: 1.0, time: 5, zones: [
        { id: 'bridge', label: 'zone_bridge', u: -0.05, v: 1, w: 0.20, h: 2, maxHp: 130, pts: 900 }]
    },
  ],
  // Fragata Tipo 21 (ARDENT, ANTELOPE): cañones → radar chico (dificil) → MOTORES gemelos
  // (sala de maquinas al nivel del casco: hay que rematarla abajo, cerca del agua)
  t21: [
    {
      at: 0.78, scale: 0.55, time: 5.5, zones: [
        { id: 'aa_l', label: 'zone_aa', u: -0.52, v: 0, w: 0.15, h: 1.3, maxHp: 55, pts: 350 },
        { id: 'aa_r', label: 'zone_aa', u: 0.52, v: 0, w: 0.15, h: 1.3, maxHp: 55, pts: 350 }]
    },
    {
      at: 0.90, scale: 0.75, time: 4.5, zones: [
        { id: 'radar', label: 'zone_radar', u: 0.10, v: 2.7, w: 0.09, h: 1.3, maxHp: 50, pts: 550 }]
    },
    {
      at: 1.00, scale: 1.0, time: 5.5, zones: [
        { id: 'eng_l', label: 'zone_engine', u: -0.30, v: -0.3, w: 0.14, h: 1.2, maxHp: 70, pts: 500 },
        { id: 'eng_r', label: 'zone_engine', u: 0.26, v: -0.3, w: 0.14, h: 1.2, maxHp: 70, pts: 500 }]
    },
  ],
  // Logistico (SIR GALAHAD, ATLANTIC CONVEYOR): AA unica a proa → DEPOSITO de carga
  // (grande y con mucha vida, pero facil de pegar) → puente a popa
  log: [
    {
      at: 0.78, scale: 0.55, time: 5, zones: [
        { id: 'aa_c', label: 'zone_aa', u: -0.30, v: 0, w: 0.15, h: 1.3, maxHp: 70, pts: 400 }]
    },
    {
      at: 0.90, scale: 0.75, time: 4.5, zones: [
        { id: 'dep', label: 'zone_deposit', u: 0.05, v: 0, w: 0.30, h: 1.6, maxHp: 110, pts: 700 }]
    },
    {
      at: 1.00, scale: 1.0, time: 5, zones: [
        { id: 'bridge', label: 'zone_bridge', u: 0.32, v: 1, w: 0.16, h: 2, maxHp: 100, pts: 900 }]
    },
  ],
};
export const SHIP_CLASS = {
  'HMS SHEFFIELD': 't42', 'HMS COVENTRY': 't42',
  'HMS ARDENT': 't21', 'HMS ANTELOPE': 't21',
  'RFA SIR GALAHAD': 'log', 'ATLANTIC CONVEYOR': 'log',
};
