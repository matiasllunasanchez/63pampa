// Preload: corre en el renderer ANTES de la página, con contextIsolation.
// Por ahora solo marca <body class="electron"> para que el CSS haga que el juego
// llene la ventana (letterbox 16:9, sin header/footer). Es también el punto de
// enganche para exponer la API de Steam (Steamworks) vía contextBridge en la Fase 4.
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('electron');
});
