// EL MODO DEV (pedido del autor 8/10: "una variable modo dev=true que me evite la presentacion de la
// cabina del fichin y vaya directo al juego, me ponga el audio en mute y me muestre el MODO DEV; en
// falso, solo lo que es para el juego real").
//
// Lo decide electron/main.js: `yarn start` es DEV y `yarn start --prod` es el juego de verdad (un
// build empaquetado es SIEMPRE el de verdad). Llega por electron/preload.js como `window.RASANTE_DEV`.
//
// Fuera de Electron —las pruebas (tools/smoke.js y los fixtures) y el build web— no hay preload, y
// ahi se considera DEV: las pruebas navegan el menu con el MODO DEV adentro, y sacarlo les correria
// las filas.
export const DEV = typeof window === 'undefined' || !window.RASANTE_APP || !!window.RASANTE_DEV;
