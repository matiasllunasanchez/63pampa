// EL SONIDO DEL JUEGO — ESTA ES LA UNICA PERILLA.
//
// AUDIO_BLOQUEADO = true silencia TODO: musica, efectos, voces y el oscilador del motor. Ni el
// boton de sonido de la esquina lo destraba. Lo aplica systems/audio.js, que es el unico modulo
// del juego que hace ruido; no hay que buscar ifs por el codigo.
//
// POR QUE EXISTE (11/9/2026): pedido del autor, "bloquea todo hasta que te diga". Las pruebas del
// gate (smoke, cine, maniobras) y las capturas abren el juego en segundo plano, y con la musica del
// lobby sonando no se podia trabajar al lado. Es TEMPORAL: el juego va con sonido, y el smoke lo
// verifica — mientras esto este en true, el smoke verifica lo contrario (que este mudo), y al
// volverlo a false vuelve solo a exigir que suene.
//
// La preferencia del jugador (el mute del boton, en localStorage) no se pisa: al volver esto a
// false, cada uno vuelve a como lo tenia.
export const AUDIO_BLOQUEADO = true;
