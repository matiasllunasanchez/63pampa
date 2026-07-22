// AVIONES jugables: datos y precarga de sus imagenes.
//
// Cada avion tiene DOS imagenes: `src` es la ilustracion grande del menu de seleccion, y
// `sheet` el sprite sheet que se usa en vuelo (9 columnas de alabeo x 3 filas de cabeceo,
// SHEET_* de abajo). Las genera tools/bake_planes.html desde modelos 3D low-poly; si el arte
// final lo dibuja una persona, tiene que respetar ese mismo layout.
//
// La precarga corre al importar el modulo: los <img> se piden apenas arranca el juego y cada
// uno marca su propio flag (ready/sheetOk) al cargar, asi el render nunca dibuja una imagen
// a medio cargar.
export const PLANES = [
  { key: 'sky', name: 'A-4 SKYHAWK', src: "../assets/img/plane_sky.webp", sheet: '../assets/img/plane_sky_sheet.png', desc: { es: 'Equilibrado - protagonista de la campaña', en: 'Balanced - the campaign workhorse' } },
  { key: 'dagger', name: 'IAI DAGGER', src: "../assets/img/plane_dagger.webp", sheet: '../assets/img/plane_dagger_sheet.png', desc: { es: 'Mas rapido y con mas fuego - dificil de controlar', en: 'Faster, harder-hitting - tricky to control' } },
  { key: 'supere', name: 'SUPER ETENDARD', src: "../assets/img/plane_supere.webp", sheet: '../assets/img/plane_supere_sheet.png', desc: { es: 'Misiones especiales - misiles Exocet', en: 'Special missions - Exocet missiles' } },
  { key: 'a4q', name: 'A-4Q', src: "../assets/img/plane_a4q.webp", sheet: '../assets/img/plane_a4q_sheet.png', desc: { es: 'Variante naval - similar al A-4B/C', en: 'Naval variant - similar to the A-4B/C' } },
  { key: 'pampa', name: 'PAMPA 63', src: "../assets/img/plane_pampa.webp", sheet: '../assets/img/plane_pampa_sheet.png', desc: { es: 'Entrenador biplaza IA-63', en: 'IA-63 two-seat trainer' } },
];
export const SHEET_FW = 56, SHEET_FH = 32, SHEET_NF = 9, SHEET_ROWS = 3;   // 9 cols (alabeo) x 3 filas (cabeceo: trepa/nivel/pica); tambien spec para arte manual
PLANES.forEach(pl => {
  pl.img = new Image(); pl.ready = false; pl.w = 977; pl.h = 471;
  pl.img.onload = () => { pl.ready = true; pl.w = pl.img.naturalWidth; pl.h = pl.img.naturalHeight; };
  pl.img.src = pl.src;
  pl.sheetImg = new Image(); pl.sheetOk = false;
  pl.sheetImg.onload = () => { pl.sheetOk = true; };
  pl.sheetImg.src = pl.sheet;
});
