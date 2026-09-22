// EL SONIDO DEL JUEGO — ESTA ES LA UNICA PERILLA.
//
// AUDIO_BLOQUEADO = true silencia TODO: musica, efectos, voces y el oscilador del motor. Ni el
// boton de sonido de la esquina lo destraba. Lo aplica systems/audio.js, que es el unico modulo
// del juego que hace ruido; no hay que buscar ifs por el codigo.
//
// POR QUE ESTA EN TRUE: pedido del autor. Las pruebas del gate (smoke, cine, maniobras) y las
// capturas abren el juego en segundo plano, y con la musica del lobby sonando no se puede trabajar
// al lado. Historia de la perilla:
//   11/9/2026  se bloquea ("bloquea todo hasta que te diga")
//   20/9/2026  el autor la destraba
//   21/9/2026  el autor la vuelve a bloquear: "lo volveremos a activar en un futuro"
//
// ES TEMPORAL Y VUELVE: el dia que el autor lo pida, esto va a `false` y el smoke se adapta solo —
// con `true` exige que el juego este MUDO, con `false` exige que SUENE. No hay nada mas que tocar.
//
// La preferencia del jugador (el mute del boton, en localStorage) no se pisa: al volver esto a
// false, cada uno vuelve a como lo tenia.
export const AUDIO_BLOQUEADO = true;
