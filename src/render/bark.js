// EL CARTEL DE BARK — la voz de la maquina (GUION_3 §9c, canal 2).
//
// REGLA NUMERO UNO DEL JUEGO, y aca no se hace excepcion: TIENE QUE FUNCIONAR SIN VOZ. Esto es un
// CARTEL, no un locutor. Si algun dia hay voces generadas, la voz se suma; el cartel nunca depende
// de ella. Por eso el modulo no sabe que existe el audio.
//
// La referencia visual es el anuncio de arma de un arcade de los noventa: letras grandes, centrado,
// entra de golpe y se va con un fundido. No es diegetico y no tiene por que parecerlo — el que
// habla no es un piloto de 1982.
//
// LO QUE ESTE MODULO NO DECIDE: cuando sale. Eso lo mira el orquestador, que es el unico que sabe
// si hay una linea de historia en pantalla o si acaba de morir alguien (regla 3 de data/barks.js).
// Aca solo se dibuja lo que ya se decidio mostrar.
import { ctx, DW as W, DH as H } from './ctx.js';
import { P } from '../data/palette.js';

export const BARK_S = 2.4;          // cuanto dura en pantalla, de punta a punta

/** Dibuja el cartel. `p` es 0..1: el avance del bark. Fuera de rango no dibuja nada. */
export function drawBark(txt, p) {
  if (!txt || p <= 0 || p >= 1) return;
  // ENTRA DE GOLPE Y SE VA DESPACIO. Al reves —fundido de entrada -- se lee como un aviso del
  // sistema; asi se lee como un golpe, que es lo que es.
  const a = p < 0.08 ? p / 0.08 : p > 0.7 ? (1 - p) / 0.3 : 1;
  const y = H * 0.38;
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
  ctx.textAlign = 'center';
  // sombra dura, sin blur: el cartel tiene que leerse sobre el mar, sobre el cielo y sobre fuego
  ctx.fillStyle = '#05070a';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(txt, W / 2 + 1, y + 1);
  ctx.fillStyle = P.accent;
  ctx.fillText(txt, W / 2, y);
  ctx.restore();
  ctx.textAlign = 'left';
}
