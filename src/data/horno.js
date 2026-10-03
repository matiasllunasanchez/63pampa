// EL INTERRUPTOR DEL HORNO (experimento 3/10/2026, pedido del autor: "probalo en el juego con el
// interruptor"). Cambia las hojas del A-4 SKYHAWK por las horneadas en Blender (tools/blender/),
// SIN PISAR las de siempre: viven al lado, en assets/planes/a4-skyhawk/blender*/.
//
//   ?horno=blender       el A-4 nuevo CON el contorno de pixel
//   ?horno=blender-sin   el A-4 nuevo sin contorno
//   (sin parametro)      el horno de siempre
//
// Se resuelve UNA vez, al CARGAR — las imagenes se piden al importar data/planes.js —, asi que lo
// prende y lo apaga PRUEBAS recargando el juego con el parametro (`a.recarga`).
const pedido = (() => {
  try { return new URLSearchParams(location.search).get('horno'); } catch (e) { return null; }
})();

/** La carpeta de las hojas alternativas del A-4 ('blender' | 'blender_sin'), o null. */
export const HORNO_ALT = pedido === 'blender' ? 'blender' : pedido === 'blender-sin' ? 'blender_sin' : null;
