// CAJAS DE LAS HOJAS DE SPRITES — GENERADO, NO EDITAR A MANO.
// Lo escribe `npx electron tools/bake_enemies_run.js` midiendo el alfa de cada hoja recien
// horneada (PLAN_HORNEADO B0, regla 3: "las cajas se miden solas"). La copia legible vive al
// lado de las hojas, en assets/world/enemies/cajas.json.
//
// `puntos` (solo donde hace falta) son ANCLAS: coordenadas del modelo proyectadas con la misma
// camara del horneado, en pixeles de la hoja. Las usa lo que se dibuja por CODIGO encima del
// sprite y tiene que caer en un lugar preciso — hoy, los cuatro discos de helice de la Chancha.
//
// `box` es el rectangulo de CONTENIDO adentro del frame, en la UNION de todas las poses: el
// frame tiene aire alrededor para que el helo pueda girar el rotor sin cortarse, y anclar por el
// borde del FRAME dejaria a los vehiculos flotando. `margen` es el aire mas chico que queda
// hasta el borde de la celda — la regla 5 del plan pide 2 px.
//
// Lo que NO esta aca es deliberado: `wu` (cuantas unidades de mundo mide el bicho) y `href`
// son PERILLAS DE ARTE, no medidas, y viven en src/render/enemies.js. El horno mide hechos; el
// tamaño en pantalla lo decide un humano.
export const CAJAS = {
  aa: { fw: 48, fh: 48, cols: 2, rows: 1, box: { x0: 4, y0: 5, x1: 39, y1: 35 }, margen: 4 },
  aatruck: { fw: 56, fh: 48, cols: 3, rows: 1, box: { x0: 13, y0: 9, x1: 48, y1: 39 }, margen: 7 },
  balloon: { fw: 48, fh: 48, cols: 3, rows: 1, box: { x0: 9, y0: 10, x1: 37, y1: 33 }, margen: 9 },
  bldg: { fw: 64, fh: 48, cols: 1, rows: 1, box: { x0: 16, y0: 11, x1: 49, y1: 37 }, margen: 10 },
  buque_cv: { fw: 240, fh: 72, cols: 3, rows: 1, box: { x0: 23, y0: 8, x1: 216, y1: 69 }, margen: 2 },
  buque_log: { fw: 240, fh: 72, cols: 3, rows: 1, box: { x0: 24, y0: 8, x1: 215, y1: 69 }, margen: 2 },
  buque_t21: { fw: 240, fh: 72, cols: 3, rows: 1, box: { x0: 47, y0: 20, x1: 196, y1: 69 }, margen: 2 },
  buque_t42: { fw: 240, fh: 72, cols: 3, rows: 1, box: { x0: 24, y0: 10, x1: 216, y1: 69 }, margen: 2 },
  chancha: { fw: 160, fh: 112, cols: 3, rows: 1, box: { x0: 7, y0: 24, x1: 152, y1: 86 }, margen: 7, puntos: [[44.7, 71.84], [62.65, 71.84], [97.35, 71.84], [115.3, 71.84], [100.47, 70.85]] },
  depot: { fw: 64, fh: 48, cols: 1, rows: 1, box: { x0: 11, y0: 14, x1: 55, y1: 34 }, margen: 8 },
  eyectado: { fw: 48, fh: 76, cols: 7, rows: 3, box: { x0: 2, y0: 6, x1: 45, y1: 71 }, margen: 2, puntos: [[24, 50.16]] },
  fragata: { fw: 64, fh: 48, cols: 1, rows: 1, box: { x0: 14, y0: 13, x1: 52, y1: 35 }, margen: 11 },
  harrier: { fw: 128, fh: 96, cols: 5, rows: 1, box: { x0: 32, y0: 27, x1: 95, y1: 66 }, margen: 27 },
  harrier_rear: { fw: 128, fh: 96, cols: 5, rows: 1, box: { x0: 28, y0: 29, x1: 99, y1: 73 }, margen: 22 },
  harrier_turn: { fw: 128, fh: 96, cols: 5, rows: 1, box: { x0: 20, y0: 29, x1: 114, y1: 65 }, margen: 13 },
  helo: { fw: 64, fh: 48, cols: 8, rows: 2, box: { x0: 6, y0: 16, x1: 57, y1: 36 }, margen: 6 },
  helo_gazelle: { fw: 128, fh: 96, cols: 8, rows: 2, box: { x0: 26, y0: 38, x1: 84, y1: 60 }, margen: 26 },
  helo_scout: { fw: 128, fh: 96, cols: 8, rows: 2, box: { x0: 28, y0: 40, x1: 85, y1: 60 }, margen: 28 },
  helo_seaking: { fw: 128, fh: 96, cols: 8, rows: 2, box: { x0: 9, y0: 27, x1: 107, y1: 65 }, margen: 9 },
  helo_sealynx: { fw: 128, fh: 96, cols: 8, rows: 2, box: { x0: 21, y0: 33, x1: 91, y1: 64 }, margen: 21 },
  helo_wessex: { fw: 128, fh: 96, cols: 8, rows: 2, box: { x0: 13, y0: 29, x1: 98, y1: 66 }, margen: 13 },
  hundido_cv: { fw: 240, fh: 72, cols: 2, rows: 1, box: { x0: 51, y0: 17, x1: 189, y1: 64 }, margen: 7 },
  hundido_log: { fw: 240, fh: 72, cols: 2, rows: 1, box: { x0: 52, y0: 14, x1: 188, y1: 64 }, margen: 7 },
  hundido_t21: { fw: 240, fh: 72, cols: 2, rows: 1, box: { x0: 68, y0: 17, x1: 174, y1: 64 }, margen: 7 },
  hundido_t42: { fw: 240, fh: 72, cols: 2, rows: 1, box: { x0: 52, y0: 17, x1: 189, y1: 64 }, margen: 7 },
  jet: { fw: 128, fh: 96, cols: 5, rows: 1, box: { x0: 29, y0: 27, x1: 98, y1: 61 }, margen: 27 },
  lcu: { fw: 72, fh: 48, cols: 3, rows: 1, box: { x0: 9, y0: 11, x1: 52, y1: 33 }, margen: 9 },
  manpad: { fw: 48, fh: 48, cols: 2, rows: 1, box: { x0: 5, y0: 13, x1: 42, y1: 37 }, margen: 5 },
  proa_cv: { fw: 56, fh: 72, cols: 3, rows: 1, box: { x0: 7, y0: 5, x1: 51, y1: 68 }, margen: 3 },
  proa_log: { fw: 56, fh: 72, cols: 3, rows: 1, box: { x0: 13, y0: 7, x1: 42, y1: 68 }, margen: 3 },
  proa_t21: { fw: 56, fh: 72, cols: 3, rows: 1, box: { x0: 18, y0: 18, x1: 37, y1: 68 }, margen: 3 },
  proa_t42: { fw: 56, fh: 72, cols: 3, rows: 1, box: { x0: 16, y0: 9, x1: 39, y1: 68 }, margen: 3 },
  radar: { fw: 48, fh: 48, cols: 4, rows: 1, box: { x0: 10, y0: 7, x1: 43, y1: 40 }, margen: 4 },
  resto_aa: { fw: 48, fh: 48, cols: 1, rows: 1, box: { x0: 7, y0: 11, x1: 45, y1: 31 }, margen: 2 },
  resto_aatruck: { fw: 56, fh: 48, cols: 1, rows: 1, box: { x0: 5, y0: 6, x1: 47, y1: 38 }, margen: 5 },
  resto_balloon: { fw: 48, fh: 48, cols: 1, rows: 1, box: { x0: 5, y0: 12, x1: 45, y1: 20 }, margen: 2 },
  resto_bldg: { fw: 64, fh: 48, cols: 3, rows: 1, box: { x0: 10, y0: 7, x1: 50, y1: 35 }, margen: 7 },
  resto_depot: { fw: 64, fh: 48, cols: 1, rows: 1, box: { x0: 10, y0: 14, x1: 58, y1: 32 }, margen: 5 },
  resto_helo: { fw: 64, fh: 48, cols: 1, rows: 1, box: { x0: 7, y0: 7, x1: 54, y1: 34 }, margen: 7 },
  resto_jet: { fw: 64, fh: 48, cols: 1, rows: 1, box: { x0: 5, y0: 7, x1: 58, y1: 37 }, margen: 5 },
  resto_lcu: { fw: 72, fh: 48, cols: 2, rows: 1, box: { x0: 11, y0: 10, x1: 54, y1: 42 }, margen: 5 },
  resto_manpad: { fw: 48, fh: 48, cols: 1, rows: 1, box: { x0: 3, y0: 21, x1: 41, y1: 35 }, margen: 3 },
  resto_radar: { fw: 48, fh: 48, cols: 1, rows: 1, box: { x0: 4, y0: 19, x1: 43, y1: 36 }, margen: 4 },
  resto_tent: { fw: 48, fh: 48, cols: 1, rows: 1, box: { x0: 6, y0: 21, x1: 45, y1: 30 }, margen: 2 },
  tent: { fw: 48, fh: 48, cols: 1, rows: 1, box: { x0: 7, y0: 16, x1: 43, y1: 33 }, margen: 4 },
};
