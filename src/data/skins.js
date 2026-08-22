// SKINS DE LOS FIELES DE PLATA: la variante del sprite del A-4 que vuela cada piloto.
//
// POR QUE EXISTE. Todos los Fieles vuelan el mismo modelo (A-4B; ver AVIONES_ESCUADRON.md), y
// hasta ahora el juego los dibujaba a TODOS con la misma hoja: en la formacion de despegue y en
// el relevo eran cinco aviones identicos. Cada skin es la misma celula con UNA marca distinta.
//
// LAS MARCAS VIVEN EN EL ALA, y no es una decision estetica. La camara del sprite mira desde
// atras y 10 grados arriba: a ese angulo la DERIVA se ve de canto (2 px) y el ALA se ve
// escorzada al ~18%. Horneando y midiendo: una franja en la deriva es INVISIBLE, y un dibujo
// sobre el ala se aplasta. Lo unico que sobrevive es la variacion a lo largo de la envergadura.
// Por eso el terito, el anillo rojo del Gitano y el matecito —que en el guion van en el FLANCO
// del fuselaje— no pueden estar aca: ese flanco no aparece en ningun alabeo. Siguen siendo canon
// para el arte dibujado; esto es su traduccion a 84 px. Las marcas se definen en
// tools/bake_planes.html (MARCAS) y se hornean con bake_planes_run.js.
//
// FALLBACK. `skinOf()` devuelve null si la skin no esta lista o no existe, y el que dibuja cae
// a la hoja generica del avion elegido. Eso es lo que hace que esto sea seguro: el build web
// puede descartar estos archivos por el limite de 16 MB y el juego se sigue viendo bien.

// La ruta se arma concatenando, asi que en el bundle sobrevive SOLO esta base — que es lo que
// tools/build_web.py reemplaza por un data: muerto para dejar las skins afuera del build web.
// El prefijo 'skin_' va ACA y no en cada entrada para que esa sustitucion tenga un solo blanco.
const DIR = '../assets/planes/a4-skyhawk/skin_';
// nombre de piloto (el de data/pilots.js FIELES) -> archivo base de su variante
const ARCHIVO = {
  TERO: 'tero', PUMA: 'puma', GITANO: 'gitano',
  VASCO: 'vasco', PICHON: 'pichon',
};

const cache = {};
for (const nombre in ARCHIVO) {
  const s = { img: new Image(), img2: new Image() };
  s.img.src = DIR + ARCHIVO[nombre] + '.png';
  s.img2.src = DIR + ARCHIVO[nombre] + '2.png';
  cache[nombre] = s;
}

/** ¿Esta imagen sirve para dibujar? Se le PREGUNTA a la imagen en vez de guardar un flag —
 *  misma razon que en render/soldiers.js: un flag depende de que nadie pise `onload`. */
const lista = im => im.complete && im.naturalWidth > 0;

/** La skin de `nombre` (TERO, PUMA…) o null si no hay. `null` es una respuesta valida: el que
 *  dibuja cae a la hoja generica. Nunca tira. */
export function skinOf(nombre) {
  const s = cache[nombre];
  if (!s || !lista(s.img)) return null;
  return { sheetImg: s.img, sheet2Img: lista(s.img2) ? s.img2 : null };
}
