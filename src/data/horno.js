// EL HORNO DE LOS AVIONES: BLENDER (desde el 3/10/2026) o el viejo de three.js, para comparar.
//
// Las hojas de los aviones se hornean con Blender (tools/blender/: modelos con forma, luz en bandas
// y contorno de pixel, a la manera de Dead Cells) y viven donde vivieron siempre. Lo que horneaba
// three.js no se tiro: quedo al lado, en assets/planes/<carpeta>/three/, con sus anclas en
// data/anclas_three.js.
//
//   (sin parametro)   el horno de Blender
//   ?horno=three      el horno viejo de three.js
//
// Se resuelve UNA vez, al CARGAR — las imagenes se piden al importar data/planes.js —, asi que lo
// cambia PRUEBAS recargando el juego con el parametro (`a.recarga`).
const pedido = (() => {
  try { return new URLSearchParams(location.search).get('horno'); } catch (e) { return null; }
})();

/** ¿Se pidio el horno viejo de three.js? */
export const HORNO_VIEJO = pedido === 'three';
