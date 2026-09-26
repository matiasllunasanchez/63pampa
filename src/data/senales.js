// EL PACK DE SEÑALES — hablar entre aviones sin radio (pedido del autor 25/9).
//
// Adentro del radar la radio delata: cualquier emision te ubica. Los pilotos se hablaban con el
// AVION —alas, morro— y eso es este pack: una tecla por seña (6 al 0; las combinaciones vienen
// despues). Cada seña es un GESTO del avion (core/senales.js lo convierte en pose) y un GLOBO sobre
// tu propio avion con el icono y lo que dijiste (render/squad.js drawSenalPropia) — la misma pieza
// de las señas que te hacen los compañeros en la vuelta.
//
// ES DIBUJO, no mecanica: el avion sigue volando con lo que le pidas mientras hace la seña. Un
// compañero que se ponia al costado y contestaba se probo y se saco por ahora (25/9): "la onda me
// parece bien, pero quitemosla". Que las señas muevan al escuadron es la proxima decision.
//
//   tecla   la del teclado de arriba (DigitN / NumpadN)
//   id      la seña: su texto es `senal_<id>` en data/strings.js
//   gesto   la forma del gesto (core/senales.js)
//   t       cuanto dura el gesto, en segundos
//   icono   el pictograma del globo (data/iconos.js); ROMPO usa el de su lado (_d / _i)
//   alerta  el globo va en amarillo y no en verde
//   lado    es TECLA + DIRECCION (25/9: "ROMPO deberia ser una combinacion de la tecla y el
//           sentido"): sale para el lado que estas doblando, o queda armada hasta que toques A/D
export const SENALES = [
  { tecla: '6', id: 'entendido', gesto: 'balanceo', t: 1.3, icono: 'sena_recibido' },
  { tecla: '7', id: 'panza',     gesto: 'panza',    t: 1.6, icono: 'senal_panza' },
  { tecla: '8', id: 'abajo',     gesto: 'cabeceo',  t: 1.2, icono: 'senal_abajo' },
  { tecla: '9', id: 'rompo',     gesto: 'rompo',    t: 1.5, icono: 'senal_rompo', lado: true },
  { tecla: '0', id: 'alerta',    gesto: 'tonel',    t: 1.1, icono: 'senal_alerta', alerta: true },
];

/** Cuanto se queda el globo despues de terminar el gesto (s). */
export const SENAL_GLOBO_T = 0.9;

/** Cuanto espera una seña con `lado` a que toques la direccion (s). */
export const SENAL_ARMADA_T = 0.8;
