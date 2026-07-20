// Entry del bundle global de three.js (esbuild → src/vendor/three.global.js).
// Exporta el namespace completo de three MAS los addons que el juego usa
// (Water: superficie de agua con normal maps animados, reflejos y sol).
// Regenerar con: npm run build:three
export * from 'three';
export { Water } from 'three/examples/jsm/objects/Water.js';
