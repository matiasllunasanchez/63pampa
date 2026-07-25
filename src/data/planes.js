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
  { key: 'sky', name: 'A-4 SKYHAWK', src: '../assets/planes/a4-skyhawk/preview.webp', sheet: '../assets/planes/a4-skyhawk/sheet.png', sheet2: '../assets/planes/a4-skyhawk/sheet2.png', desc: { es: 'Equilibrado - protagonista de la campaña', en: 'Balanced - the campaign workhorse' } },
  { key: 'dagger', name: 'IAI DAGGER', src: '../assets/planes/iai-dagger/preview.webp', sheet: '../assets/planes/iai-dagger/sheet.png', sheet2: '../assets/planes/iai-dagger/sheet2.png', desc: { es: 'Mas rapido y con mas fuego - dificil de controlar', en: 'Faster, harder-hitting - tricky to control' } },
  { key: 'supere', name: 'SUPER ETENDARD', src: '../assets/planes/super-etendard/preview.webp', sheet: '../assets/planes/super-etendard/sheet.png', sheet2: '../assets/planes/super-etendard/sheet2.png', desc: { es: 'Misiones especiales - misiles Exocet', en: 'Special missions - Exocet missiles' } },
  { key: 'a4q', name: 'A-4Q', src: '../assets/planes/a4q/preview.webp', sheet: '../assets/planes/a4q/sheet.png', sheet2: '../assets/planes/a4q/sheet2.png', desc: { es: 'Variante naval - similar al A-4B/C', en: 'Naval variant - similar to the A-4B/C' } },
  { key: 'pampa', name: 'PAMPA 63', src: '../assets/planes/pampa-63/preview.webp', sheet: '../assets/planes/pampa-63/sheet.png', sheet2: '../assets/planes/pampa-63/sheet2.png', desc: { es: 'Entrenador biplaza IA-63', en: 'IA-63 two-seat trainer' } },
  { key: 'mirage', name: 'MIRAGE IIIEA', src: '../assets/planes/mirage-iiiea/preview.png', sheet: '../assets/planes/mirage-iiiea/sheet.png', sheet2: '../assets/planes/mirage-iiiea/sheet2.png', desc: { es: 'Interceptor de altura - rapido y con poca autonomia', en: 'High-altitude interceptor - fast, short legs' } },
];
// 84x48 por cuadro (antes 56x32): se re-hornearon a 1.5x al subir la grilla del juego a 480x270.
// Con el buffer 2x del juego, el sprite cae a 2x EXACTO en pantalla — pixel art nitido.
// 9 cols (alabeo) x 3 filas (cabeceo: trepa/nivel/pica); tambien spec para arte manual.
// FRAME CUADRADO: el alto subio de 48 a 84 porque al alabear 60° la envergadura se para y las
// puntas de ala quedaban cortadas. El avion NO cambio de tamaño — lo que se agrego es aire
// transparente arriba y abajo, y el sprite se dibuja centrado.
export const SHEET_FW = 84, SHEET_FH = 84, SHEET_NF = 9, SHEET_ROWS = 3;
// ALTO DEL AVION dentro del frame. El frame es cuadrado (84) pero el avion sigue ocupando los
// mismos 48 px de siempre: el resto es aire transparente, arriba y abajo, para que quepa girado.
// Todo lo que se dibuje PEGADO al avion (llama de la turbina, fogonazos) tiene que medirse contra
// ESTO y no contra SHEET_FH — si no, queda flotando a 18 px de la cola.
export const SHEET_BODY_H = 48;
PLANES.forEach(pl => {
  pl.img = new Image(); pl.ready = false; pl.w = 977; pl.h = 471;
  pl.img.onload = () => { pl.ready = true; pl.w = pl.img.naturalWidth; pl.h = pl.img.naturalHeight; };
  pl.img.src = pl.src;
  // la hoja es OPCIONAL: un avion sin `sheet` vuela con la ilustracion. Sin este guard se pediria
  // una imagen inexistente y quedaria un 404 en la consola.
  pl.sheetOk = false;
  if (pl.sheet) {
    pl.sheetImg = new Image();
    pl.sheetImg.onload = () => { pl.sheetOk = true; };
    pl.sheetImg.src = pl.sheet;
    // HOJA 2 (cabeceos EMPINADOS ±32°, para las piruetas): misma carpeta, 9 cols x 2 filas
    // (fila 0 = trepada fuerte, fila 1 = picada fuerte). Es OPCIONAL con fallback real: el build
    // web la descarta (limite de 16 MB) y el render cae a las filas normales de la hoja base.
    pl.sheet2Ok = false;
    if (pl.sheet2) {
      pl.sheet2Img = new Image();
      pl.sheet2Img.onload = () => { pl.sheet2Ok = true; };
      pl.sheet2Img.src = pl.sheet2;
    }
  }
});
