// Preload: corre en el renderer ANTES de la página, con contextIsolation.
// Por ahora solo marca <body class="electron"> para que el CSS haga que el juego
// llene la ventana (letterbox 16:9, sin header/footer). Es también el punto de
// enganche para exponer la API de Steam (Steamworks) vía contextBridge en la Fase 4.
// EL JUEGO DE VERDAD, no una prueba: las herramientas (tools/smoke.js y los fixtures) abren el juego
// sin este preload. Lo lee render/arranque.js para correr el arranque del fichin, que espera una
// tecla y trabaria a cualquier prueba que apriete teclas apenas carga.
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('RASANTE_APP', true);

window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('electron');
});
