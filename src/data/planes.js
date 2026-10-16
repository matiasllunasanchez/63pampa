// AVIONES jugables: datos y precarga de sus imagenes.
import { capasAvion } from './cargas.js';
import { HORNO_VIEJO } from './horno.js';
//
// Cada avion tiene DOS imagenes: `src` es la ilustracion grande del menu de seleccion, y
// `sheet` el sprite sheet que se usa en vuelo (9 columnas de alabeo x 3 filas de cabeceo,
// SHEET_* de abajo). Las genera tools/bake_planes.html desde modelos 3D low-poly; si el arte
// final lo dibuja una persona, tiene que respetar ese mismo layout.
//
// La precarga corre al importar el modulo: los <img> se piden apenas arranca el juego y cada
// uno marca su propio flag (ready/sheetOk) al cargar, asi el render nunca dibuja una imagen
// a medio cargar.
// `src`: LA ILUSTRACION DEL SELECTOR (CICLO DE MUERTE / POR LA PATRIA). Desde el 4/10 sale del horno de
// Blender (tools/blender/armar_seleccion.py): el mismo modelo y el mismo contorno que las hojas, a 390 px
// de ancho — el menu la dibuja sin suavizar. Los dibujos viejos (preview.*) quedan en su carpeta.
export const PLANES = [
  { key: 'sky', name: 'A-4 SKYHAWK', src: '../assets/planes/a4-skyhawk/seleccion.png', sheet: '../assets/planes/a4-skyhawk/sheet.png', sheet2: '../assets/planes/a4-skyhawk/sheet2.png', sheet3: '../assets/planes/a4-skyhawk/sheet3.png', desc: { es: 'Equilibrado - protagonista de la campaña', en: 'Balanced - the campaign workhorse' } },
  // `sonda: false` (12/10, el autor: "no tenian reabastecimiento los Dagger"): sin sonda no hay Chancha —
  // el alcance es solo lo que lleva colgado (por eso volaban con tres tanques). Sin el campo, tiene sonda.
  { key: 'dagger', sonda: false, name: 'IAI DAGGER', src: '../assets/planes/iai-dagger/seleccion.png', sheet: '../assets/planes/iai-dagger/sheet.png', sheet2: '../assets/planes/iai-dagger/sheet2.png', sheet3: '../assets/planes/iai-dagger/sheet3.png', desc: { es: 'Mas rapido y con mas fuego - dificil de controlar', en: 'Faster, harder-hitting - tricky to control' } },
  { key: 'supere', name: 'SUPER ETENDARD', src: '../assets/planes/super-etendard/seleccion.png', sheet: '../assets/planes/super-etendard/sheet.png', sheet2: '../assets/planes/super-etendard/sheet2.png', sheet3: '../assets/planes/super-etendard/sheet3.png', desc: { es: 'Misiones especiales - misiles Exocet', en: 'Special missions - Exocet missiles' } },
  { key: 'a4q', name: 'A-4Q', src: '../assets/planes/a4q/seleccion.png', sheet: '../assets/planes/a4q/sheet.png', sheet2: '../assets/planes/a4q/sheet2.png', sheet3: '../assets/planes/a4q/sheet3.png', desc: { es: 'Variante naval - similar al A-4B/C', en: 'Naval variant - similar to the A-4B/C' } },
  // PAMPA 63 — FUERA DE SELECCION POR AHORA (no borrar: los assets estan horneados y el
  // modelo vive en tools/bake_planes.html).
  // El FMA IA-63 Pampa volo por primera vez en OCTUBRE DE 1984, dos años despues de la
  // guerra: es el unico anacronismo del roster. Vuelve como DESBLOQUEABLE, con la misma
  // placa honesta que usa el Mirage 5P en M10 — nombrar el hecho y despues ofrecer el
  // juego, sin fingir que una cosa es la otra. Ver docs/historia/AVIONES_CATALOGO.md.
  // { key: 'pampa', name: 'PAMPA 63', src: '../assets/planes/pampa-63/seleccion.png', sheet: '../assets/planes/pampa-63/sheet.png', sheet2: '../assets/planes/pampa-63/sheet2.png', sheet3: '../assets/planes/pampa-63/sheet3.png', desc: { es: 'Entrenador biplaza IA-63', en: 'IA-63 two-seat trainer' } },
  // MIRAGE 5P «MARA»: los diez que mando el PERU. Llegaron a Tandil el 5/6/1982 con la
  // escarapela argentina ya pintada y NUNCA entraron en combate (GUION_3 M10, verificado).
  // Por eso su lugar en el juego es el desbloqueo de M10, con la placa que lo dice de frente:
  // "Nunca llegaron a combatir. Aca, si." Ver docs/historia/AVIONES_CATALOGO.md.
  // EL HERCULES BOMBARDERO (16/10, el autor: "quiero agregar al Hercules como jugable en POR LA PATRIA y
  // CICLO DE MUERTE… este Hercules modificado"): el TC-68, el C-130H de la FAA al que le colgaron dos afustes
  // bajo la raiz del ala (un MER de 6 bombas cada uno) y bombardeo el British Wye (29/5) y el Hercules (8/6). OTRO modelo que la
  // Chancha (tools/blender/modelos_hercules.py), que queda como esta.
  //   vuelo   `vel` multiplica la velocidad objetivo, `acel` lo rapido que llega a ella, `turbo` cuanto
  //           del turbo le queda ("vuela mas lento, levanta mucha menos velocidad"); `carga: false`: lo
  //           que cuelga no lo frena (12 bombas de 250 kg son el 4% de lo que levanta)
  //   canon   un solo cañon DESDE EL CENTRO, lento y potente: `cad` tiros/s, `dano` golpes por tiro,
  //           `vel` de la bala (300 la de siempre), `gordo` el tamaño de la trazadora
  //   sinTobera  turbohelice: no hay llama de turbina · sinVariantes: el escuadron vuela la misma hoja
  //   escala / px  se dibuja al DOBLE que un caza ("tiene que ser mas grande"), con las hojas horneadas al
  //           doble de resolucion (cuadro de 168): las proporciones son las del C-130 de verdad
  { key: 'herc', name: 'HERCULES BOMBARDERO', sonda: false, sinTobera: true, sinVariantes: true, escala: 2, px: 2,
    vuelo: { vel: 0.66, acel: 0.35, turbo: 0.4, carga: false },
    canon: { cad: 2.4, dano: 4, vel: 230, gordo: 2.4 },
    src: '../assets/planes/hercules-bombardero/seleccion.png', sheet: '../assets/planes/hercules-bombardero/sheet.png', sheet2: '../assets/planes/hercules-bombardero/sheet2.png', sheet3: '../assets/planes/hercules-bombardero/sheet3.png',
    desc: { es: 'TC-68 - 12 bombas, lento y pesado, cañon central', en: 'TC-68 - 12 bombs, slow and heavy, centre gun' } },
  { key: 'mirage', name: 'MIRAGE 5P MARA', src: '../assets/planes/mirage-5p/seleccion.png', sheet: '../assets/planes/mirage-5p/sheet.png', sheet2: '../assets/planes/mirage-5p/sheet2.png', sheet3: '../assets/planes/mirage-5p/sheet3.png', desc: { es: 'El regalo del Peru - rapido, con poca autonomia', en: 'Peru\'s gift - fast, short legs' } },
];
// 84x48 por cuadro (antes 56x32): se re-hornearon a 1.5x al subir la grilla del juego a 480x270.
// Con el buffer 2x del juego, el sprite cae a 2x EXACTO en pantalla — pixel art nitido.
// 9 cols (alabeo) x 3 filas (cabeceo: trepa/nivel/pica); tambien spec para arte manual.
// FRAME CUADRADO: el alto subio de 48 a 84 porque al alabear 60° la envergadura se para y las
// puntas de ala quedaban cortadas. El avion NO cambio de tamaño — lo que se agrego es aire
// transparente arriba y abajo, y el sprite se dibuja centrado.
export const SHEET_FW = 84, SHEET_FH = 84, SHEET_NF = 9, SHEET_ROWS = 3;
// LA HOJA DEL PODER va al DOBLE de resolucion de fuente y NO cambia nada en pantalla: durante el
// poder el sprite se dibuja a 142,8 px de mundo, o sea 3,4 px de pantalla por pixel horneado con
// la hoja de 84. Con 168 vuelve a 1,7 — exactamente la nitidez que el avion tiene en el pasillo.
// Lo unico que cambia en el render es el RECTANGULO DE ORIGEN del recorte; el tamaño dibujado no.
export const SHEET3_FW = 168, SHEET3_FH = 168;
// HOJA 4 (LA COBRA, el freno): 9 alabeos x 3 cabeceos de 40/75/100°, cuadro de 126. Vertical el avion
// mide su LARGO y no entraba en 84, asi que se horneo con la camara abierta x1,5: el avion tiene los
// mismos pixeles que en la hoja base, y el render dibuja el cuadro x1,5 (SHEET4_K) para que calce.
export const SHEET4_FW = 126, SHEET4_FH = 126, SHEET4_K = 1.5;
// ALTO DEL AVION dentro del frame. El frame es cuadrado (84) pero el avion sigue ocupando los
// mismos 48 px de siempre: el resto es aire transparente, arriba y abajo, para que quepa girado.
// Todo lo que se dibuje PEGADO al avion (llama de la turbina, fogonazos) tiene que medirse contra
// ESTO y no contra SHEET_FH — si no, queda flotando a 18 px de la cola.
export const SHEET_BODY_H = 48;
PLANES.forEach(pl => {
  // EL HORNO VIEJO (data/horno.js): con `?horno=three` las hojas son las que horneaba three.js,
  // guardadas en <carpeta>/three/. Las capas de carga lo siguen solas: se piden de la carpeta de
  // `sheet`. (La carpeta sale de la hoja y no de un literal: tools/build_web.py re-embebe cada
  // '../assets/…' que encuentra, y una ruta armada a medias lo hace fallar.)
  if (HORNO_VIEJO && pl.sheet) {
    const viejo = r => r && r.slice(0, r.lastIndexOf('/') + 1) + 'three/' + r.slice(r.lastIndexOf('/') + 1);
    pl.sheet = viejo(pl.sheet); pl.sheet2 = viejo(pl.sheet2); pl.sheet3 = viejo(pl.sheet3);
  }
  // LA HOJA 4 sale de la misma carpeta que la base. three.js nunca la horneo: con el horno viejo no
  // hay cobra dibujada y el render cae a la trepada de la hoja 2 (fallback real, como las otras).
  if (pl.sheet && !pl.sheet4 && !HORNO_VIEJO) pl.sheet4 = pl.sheet.replace(/sheet\.png$/, 'sheet4.png');
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
    // HOJA 3 (el PODER RASANTE): la misma grilla de 9x3 pero vista desde 35,5° AL COSTADO y 10°
    // por DEBAJO — que es de donde la mira la camara del poder, y no de donde la mira la del
    // pasillo. Frame al doble (168) porque durante el poder el sprite se dibuja al doble de
    // tamaño. Tambien es OPCIONAL con fallback real: si no cargo se sigue usando la hoja base,
    // que es lo que se venia usando hasta ahora.
    pl.sheet3Ok = false;
    if (pl.sheet3) {
      pl.sheet3Img = new Image();
      pl.sheet3Img.onload = () => { pl.sheet3Ok = true; };
      pl.sheet3Img.src = pl.sheet3;
    }
    pl.sheet4Ok = false;
    if (pl.sheet4) {
      pl.sheet4Img = new Image();
      pl.sheet4Img.onload = () => { pl.sheet4Ok = true; };
      pl.sheet4Img.src = pl.sheet4;
    }
    // LAS CAPAS DE CARGA (tanques y bombas), una por pieza y por vista — ver data/cargas.js. Viven
    // en la misma carpeta que las hojas y llevan el mismo sufijo: '' / '2' / '3'. Si una capa no
    // cargo, simplemente no se pinta: el avion vuela limpio, que es el fallback natural.
    const dir = pl.sheet.slice(0, pl.sheet.lastIndexOf('/') + 1);
    pl.capas = {};
    for (const nom of capasAvion(pl.key)) {
      // (la '5' es la de la HOJA FINA; el horno viejo no la tiene)
      pl.capas[nom] = ['', '2', '3', '4', ...(!HORNO_VIEJO ? ['5'] : [])].map(suf => { const im = new Image(); im.src = dir + nom + suf + '.png'; return im; });
    }
    // LAS VARIANTES DEL ESCUADRON (autor, 8/10: "todos tienen el mismo avion — deberian tener
    // variantes"): cuatro hojas base por avion, una por numeral — otro reparto y tono del camuflaje,
    // y dos con las bandas amarillas de identificacion (tools/blender/modelos.py, `_variantes`).
    // Las dibuja render/squad.js para los numerales fuera de campaña; si no cargan (build web, horno
    // viejo) los numerales vuelan con la hoja de siempre.
    // EL TREN DE ATERRIZAJE horneado (9/10): una capa con la grilla de la hoja base (render/plane.js
    // drawTren). Sin ella —build web, horno viejo— el tren se dibuja como antes.
    pl.tren = null;
    if (!HORNO_VIEJO) { pl.tren = new Image(); pl.tren.src = dir + 'tren.png'; }
    // LA HOJA FINA (14/10, probada en el A-4 y pasada a todos): 13 alabeos x 5 cabeceos — sheet5.png y su
    // tren. La usa render/plane.js en lugar de la base cuando cargo (`?fino=0` para comparar).
    pl.sheet5Ok = false; pl.tren5 = null;
    if (!HORNO_VIEJO) {
      pl.sheet5Img = new Image();
      pl.sheet5Img.onload = () => { pl.sheet5Ok = true; };
      pl.sheet5Img.src = dir + 'sheet5.png';
      pl.tren5 = new Image(); pl.tren5.src = dir + 'tren5.png';
    }
    // EL SELECTOR ANIMADO (16/10, el autor: "mejorar la calidad del avion que vuela en el selector, y
    // agregarle movimientos"): dos hojas horneadas con la camara del selector a 336 px nativos — el VAIVEN
    // (15 alabeos x 5 cabeceos) y el TONEL (24 cuadros de la vuelta) —, tools/blender/armar_seleccion.py.
    // Las recorre render/menus.js; si no cargan (build web, horno viejo) queda la ilustracion quieta.
    pl.selAnim = pl.selTonel = null;
    if (!HORNO_VIEJO && pl.src.startsWith('../')) {
      const dirSel = pl.src.slice(0, pl.src.lastIndexOf('/') + 1);
      pl.selAnim = new Image(); pl.selAnim.src = dirSel + 'seleccion_anim.png';
      pl.selTonel = new Image(); pl.selTonel.src = dirSel + 'seleccion_tonel.png';
    }
    pl.variantes = HORNO_VIEJO || pl.sinVariantes ? [] : [1, 2, 3, 4].map(n => { const im = new Image(); im.src = dir + 'variante' + n + '.png'; return im; });
  }
});
