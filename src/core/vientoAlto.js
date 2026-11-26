// EL VIENTO DE ALTURA, su estado (lo escribe systems/vientoAlto.js, lo lee el HUD: render no puede mirar systems).
//   k         intensidad aca (capa × clima, 0..~1.4)
//   frenoVel  factor del objetivo de velocidad (1 = sin viento de frente)
//   deriva    m/s de costado; lado = -1..1 para donde sopla
//   hunde     m/s de la correntada; corr = 0..1 su envolvente
//   temX/temY el temblor (m/s); shake el sacudon de pantalla
//   tormenta  1 con cielo de tormenta; pulso el sacudon del ultimo trueno (0..1, se apaga solo)
//   rayoN     cuantos rayos cayeron CERCA esta corrida (el HUD saca DESCARGA de atras del altimetro al cambiar)
//   altiFalla grado de falla TEMPORAL del altimetro por un rayo (0 sano, 2 atrasa, 3 muerto) hasta `altiHasta` (run.t)
//   rayoK     la sensibilidad del avion a los rayos (data/perfiles.js `rayo`)
export const va = { k: 0, frenoVel: 1, deriva: 0, hunde: 0, corr: 0, lado: 0, temX: 0, temY: 0, shake: 0,
  tormenta: 0, pulso: 0, rayoN: 0, altiFalla: 0, altiHasta: 0, rayoK: 1 };
export function resetTormentaElec() { va.pulso = 0; va.altiFalla = 0; va.altiHasta = 0; }
