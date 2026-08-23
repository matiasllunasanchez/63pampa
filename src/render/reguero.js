// EL REGUERO — una estela de BOCANADAS que quedan donde las dejaste.
//
// Es la tecnica del humo de tobera del Skyhawk (`humoTobera`, documentada en
// docs/sistemas/TOBERA_ESCAPE.md) y la misma de los vortices de punta de ala (`tipTrail`, que
// sigue viva en render/plane.js). Estas son literalmente sus lineas, sacadas de ahi para que las
// pueda usar cualquiera — la misma jugada que `stepVuelo` saliendo de `flight.js`: funcionaba, y
// hacia falta en otro lado.
//
// NOTA DE PROCEDENCIA: el `humoTobera` del avion se quito de plane.js en el rebaje del escape de
// 8/2026 (quedaron el disco caliente y los vortices). Asi que hoy esto no es una copia de nada:
// es donde vive la version con reloj, que era la buena.
//
// QUE LO HACE DISTINTO de muestrear la posicion hacia atras (que es lo que hacian a mano las tres
// estelas de misil del juego, cada una por su cuenta):
//
//   · ES UNA HISTORIA, no una extrapolacion. Cada bocanada se deja donde el emisor estaba, y ahi
//     se queda. Asi la estela sigue EXACTAMENTE lo que hizo —el bob, el tiron de un esquive, la
//     curva de una bomba cayendo— en vez de aproximarlo con una recta hacia atras.
//   · UNA BOCANADA CADA TANTO, no una por cuadro. A 60 fps eran 60 cuadrados iguales casi en el
//     mismo sitio: eso es una CINTA, no humo. Entre bocanada y bocanada tiene que haber aire.
//   · LA EDAD ES DE RELOJ, NO DE INDICE. Con el indice, el reguero se mueve RIGIDO con el emisor:
//     al subir, el humo viejo sube con vos en vez de quedarse donde lo dejaste.
//   · SE ABRE MUCHO MAS DE LO QUE SE MUEVE. Una bocanada se DESARMA: crece, se deshilacha y se
//     apaga. Creciendo poco quedan cuadraditos alineados; creciendo asi, se pierde.
//
// NO TOCA `parts`, asi que no gasta del presupuesto de particulas (PARTS_MAX).
//
// Espacio de coordenadas: PANTALLA. Quien llama ya proyecto — el reguero guarda pixeles, que es lo
// que le deja seguir una trayectoria curva sin saber nada de mundo ni de camara.
import { ctx, px } from './ctx.js';

/** Un reguero vacio. Cada emisor tiene el suyo: dos misiles no comparten humo. */
export const nuevoReguero = () => ({ p: [], ult: -1 });

// LOS VALORES DE LA TOBERA, que son los que estaban probados. Cualquier otro emisor parte de aca
// y pisa lo que necesite — un misil quiere lo mismo pero MAS GRANDE y BLANCO, y eso son tres
// numeros y dos colores, no otra estela.
const D = {
  cada: 0.055,      // segundos entre bocanadas (~18 por segundo)
  vida: 0.9,        // lo que tarda una bocanada en desarmarse del todo
  r0: 1.2,          // radio al nacer
  crece: 7,         // cuanto se abre con la edad
  dy: 11,           // cuanto se mueve en pantalla mientras se desarma (positivo = hacia abajo)
  dx: 9,            // sesgo lateral, propio de cada bocanada
  osc: 3,           // culebreo del sesgo
  a0: 0.30, aF: 0.22,                    // opacidad base y cuanto suma la intensidad
  c: ['#6a635a', '#4a453e'],             // joven · vieja
  salto: 40,        // un salto mayor a esto es un teletransporte: el reguero viejo es basura
};

/** EL HUMO DE UN MISIL: lo mismo, pero MAS GRANDE y BLANCO (pedido del 22/8).
 *
 *  Y las dos diferencias que no son de gusto:
 *   · NO BAJA (`dy: 0`). El humo del avion se viene hacia la camara y se hunde porque la tobera te
 *     apunta; el de un misil se queda EN EL AIRE donde el misil paso, y lo unico que hace es
 *     abrirse. Un reguero de misil que se hunde se lee como que el misil esta cayendo.
 *   · SE ABRE MAS Y DURA MAS: es humo de propelente solido, no hollin de turbina. Es lo que deja
 *     ver DE DONDE SALIO el misil medio segundo despues de que salio, que es todo el punto. */
export const MISIL = {
  // MAS SEGUIDAS Y QUE SE ABREN MENOS que las del avion. Con la apertura de la tobera (7) el
  // reguero de un misil se convertia en una COLUMNA blanca maciza: el proyectil recorre poca
  // pantalla —se aleja, no cruza— asi que las bocanadas se apilan en el mismo sitio y lo que
  // crece las funde en una sola mancha. Naciendo mas seguido y abriendose la mitad, se lee el
  // hilo.
  cada: 0.028, vida: 1.0,
  r0: 1.6, crece: 5.5,
  dy: 0, dx: 3, osc: 1.8,
  a0: 0.30, aF: 0.22,
  c: ['#f4f9fb', '#c2ced5'],
  salto: 90,        // un misil recorre mucho mas pantalla por cuadro que el avion
};

/** Deposita (si corresponde) y DIBUJA el reguero.
 *
 *  @param R   el reguero, de `nuevoReguero()`
 *  @param cx,cy  donde esta el emisor AHORA, en pantalla
 *  @param o   `{ t, f, on, corta, ...perillas }`
 *     `t`      reloj en segundos (quien llama es el dueño del tiempo: una cinematica corre otro)
 *     `f`      intensidad 0..1 — engorda y opaca
 *     `on`     si esta emitiendo este cuadro (turbo puesto, misil vivo). Apagado, el reguero se
 *              deshace solo: deja de nacer humo y lo que hay envejece.
 *     `corta`  al apagarse, ademas se come bocanadas viejas: el reguero se corta en vez de
 *              quedar flotando entero. Es lo que hace que soltar el turbo se NOTE.
 */
export function humear(R, cx, cy, o) {
  const t = o.t, f = o.f === undefined ? 1 : o.f;
  const cada = o.cada || D.cada, vida = o.vida || D.vida;
  const c = o.c || D.c;
  // UN SALTO NO ES UN VUELO: si el emisor aparecio en otro lado —relevo, vuelta de un menu, corte
  // de fase— el reguero viejo es basura de la vida anterior.
  const ult = R.p[R.p.length - 1];
  if (ult && Math.abs(ult.x - cx) + Math.abs(ult.y - cy) > (o.salto || D.salto)) R.p.length = 0;
  if (o.on && f > 0.02 && t - R.ult > cada) {
    R.ult = t;
    R.p.push({ x: cx, y: cy, f, t0: t,
      // cada bocanada trae SU tamaño y SU sesgo, con la fase del nacimiento. Sin esto todas crecen
      // igual y vuelven a formar una columna pareja.
      sz: 0.7 + Math.abs(Math.sin(t * 12.9)) * 0.8,
      sesgo: Math.sin(t * 7.3) });
  }
  while (R.p.length && t - R.p[0].t0 > vida) R.p.shift();
  if (!o.on && o.corta && R.p.length && Math.random() < 0.25) R.p.shift();
  for (let i = 0; i < R.p.length; i++) {
    const h = R.p[i];
    const e = Math.min(1, (t - h.t0) / vida);
    const r = ((o.r0 || D.r0) + e * (o.crece || D.crece) * h.sz) * (1 + f * 0.5);
    const dy = e * (o.dy === undefined ? D.dy : o.dy);
    const dx = h.sesgo * e * (o.dx === undefined ? D.dx : o.dx)
             + Math.sin(h.t0 * 5 + e * 4) * e * (o.osc === undefined ? D.osc : o.osc);
    // Y SE APAGAN RAPIDO: el pico de opacidad es al principio y cae con el cuadrado de la edad.
    // Planas, todas iguales, se vuelven a leer como una cinta.
    const a = (1 - e) * (1 - e) * ((o.a0 === undefined ? D.a0 : o.a0) + f * (o.aF === undefined ? D.aF : o.aF));
    if (a < 0.012) continue;
    ctx.globalAlpha = a;
    px(h.x + dx - r / 2, h.y + dy - r / 2, r, r, e > 0.5 ? c[1] : c[0]);
  }
  ctx.globalAlpha = 1;
}
