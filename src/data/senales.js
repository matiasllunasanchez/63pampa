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

/** Cuanto dura cada GESTO (s), sea tuyo o de un compañero. Sale de la tabla de arriba. */
export const GESTO_T = SENALES.reduce((m, x) => { m[x.gesto] = x.t; return m; }, {});

// ---------------------------------------------------------------------------------------------
// LAS SEÑAS DE LOS COMPAÑEROS (pedido del autor 25/9): "cuando otros personajes del escuadron
// aparezcan en pantalla, que puedan comunicarse con el jugador asi, sin hablar. Y al finalizar,
// que se alejen hacia el costado, hacia abajo, o bajen la velocidad y vuelvan atras."
//
// Un compañero entra a tu costado, hace su GESTO y muestra su globo (la misma pieza de tus señas y
// de las de la vuelta), y se va. Cada entrada es una seña que un compañero te puede hacer:
//   icono / texto   el globo (data/iconos.js) y la clave de su texto (data/strings.js)
//   gesto           el gesto del avion (core/senales.js), o null
//   sale            como se va: 'costado' | 'abajo' | 'atras' (frena y queda atras, pasandote)
//   alerta          el globo en amarillo
export const SENAS_COMP = {
  // al CRUZAR EL HORIZONTE DE RADAR, en la ida: abajo y callados
  radar:     { icono: 'senal_abajo', texto: 'senal_abajo', gesto: 'cabeceo', sale: 'abajo' },
  entendido: { icono: 'sena_recibido', texto: 'senal_entendido', gesto: 'balanceo', sale: 'costado' },
  alerta:    { icono: 'senal_alerta', texto: 'senal_alerta', gesto: 'tonel', sale: 'atras', alerta: true },
  panza:     { icono: 'senal_panza', texto: 'senal_panza', gesto: 'panza', sale: 'abajo' },
};

/** Las tres salidas: cuanto se corre en cada eje (unidades de mundo) al irse. */
export const SALIDA = {
  costado: { x: 30, y: 0, z: 4 },
  abajo:   { x: 3, y: -10, z: 2 },
  atras:   { x: 6, y: -3, z: -13 },   // z negativo: viene hacia la camara y te pasa por al lado
};
