// EL DIBUJO DEL LIDER de la PERSECUCION.
//
// Plan: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md, PLAN B · fase N0. La logica vive en
// systems/persec.js; aca solo se LEE su snapshot y se pinta (convencion 4 de ARQUITECTURA).
//
// ES EL MISMO AVION QUE VOLAS VOS, y eso no es economia de arte: es la lectura. El lider es un
// numeral de tu escuadrilla —un A-4 igual al tuyo, con el mismo indicativo que escuchas por
// radio— y verlo idéntico es lo que hace que seguirlo se sienta como volar de numeral y no como
// perseguir un objetivo. Se usa la MISMA hoja de PLANES que render/plane.js, con la columna del
// banqueo elegida por su alabeo real: cuando el lider esquiva, banquea, y ese banqueo es el aviso
// anticipado de que ahi adelante hay algo. La mitad del modo esta en ese detalle.
//
// EL SEGUIMIENTO DE DISTANCIA es gratis: proj() lo achica solo con la z. Lejos es un punto en el
// horizonte y cerca te tapa el cuadro, que es exactamente la informacion que el jugador necesita
// para dosificar el gas sin mirar ningun numero.

import { ctx, px, PZ } from './ctx.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';
import { PLANES, SHEET_FW, SHEET_FH, SHEET_NF } from '../data/planes.js';
import { PURS_WASH_D, PURS_F_MIN } from '../data/tuning.js';
import { PLANE_SCALE } from './plane.js';
import { snapshot } from '../systems/persec.js';

/** Un cuadro del lider. Va en la capa del MUNDO (antes del avion del jugador): siempre esta mas
 *  lejos que vos — es la definicion del modo — asi que no hace falta el reparto en dos pasadas
 *  que si necesita LA COLA. `selPlane` es el avion elegido en el menu: game.js lo pasa igual que
 *  se lo pasa a drawFormation, porque ese dato vive en el menu y no en un store. */
export function drawPersec(selPlane) {
  const L = snapshot();
  if (!L) return;
  const s = proj(L.x, L.y, L.z);
  const kRef = proj(0, 0, PZ).k;
  const pl = PLANES[selPlane] || PLANES[0];
  // PISO DE TAMAÑO, y no es una licencia: es la misma regla que la cabeza de las trazadoras ("nunca
  // menos de 2 px"). La banda del §4 va de 60 a 140 unidades, o sea que el lider proyecta entre 11
  // y 5 px de los 480 del mundo — a ese tamaño no se le puede leer el BANQUEO, y leerle el banqueo
  // es la mitad del modo (es el aviso anticipado de que ahi adelante hay algo). Sin el piso,
  // "seguir la linea del lider enseña a leer el pasillo" es una frase y no un mecanismo.
  //
  // Se toca el DIBUJO y no la banda a proposito: PURS_D es un numero de juego que da el plan, y
  // achicarlo para que el sprite se vea seria arreglar la legibilidad rompiendo el diseño.
  const f = Math.max(PURS_F_MIN, s.k / kRef);

  // ESTELA DE LA TOBERA: dos motas calientes que quedan atras. Es lo unico que se ve del lider
  // cuando esta en el fondo de la banda y ya casi no mide un pixel, y por eso existe — sin esto,
  // "lo estas perdiendo" se lee recien cuando ya lo perdiste.
  ctx.globalAlpha = 0.5;
  px(s.x - 1, s.y + 0.5 * f, 2, Math.max(1, f), P.accent);
  ctx.globalAlpha = 1;

  // LA LLAMA DEL TIRON (N5). Tiene que verse a la distancia de la banda, donde el avion mide cinco
  // pixeles: por eso es una pluma detras de la tobera y no un detalle del sprite. El parpadeo sale
  // del reloj del lider y NO de Math.random() — un patron visual sorteado por cuadro es la trampa
  // #3 del repo (SPEC_AGUA_OLAS §1) y ademas titila como un pixel roto.
  if (L.tir === 2) {
    const p = 0.75 + 0.25 * Math.sin(L.t * 41);
    const lg = Math.max(3, 7 * f) * p;
    ctx.globalAlpha = 0.85;
    px(s.x - 1.5, s.y + 0.4 * f, 3, lg, P.warn);
    px(s.x - 0.5, s.y + 0.4 * f, 1, lg * 0.6, '#fff2d8');
    ctx.globalAlpha = 1;
  }

  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  if (pl.sheetOk) {
    // LA COLUMNA SALE DEL ALABEO REAL. Es la misma cuenta que hace render/plane.js con tu propio
    // avion, y tiene que ser la misma: si el lider banqueara distinto que vos, copiarle la linea
    // dejaria de enseñar nada.
    const col = Math.round((1 - Math.max(-1, Math.min(1, L.bank))) / 2 * (SHEET_NF - 1));
    const w = SHEET_FW * PLANE_SCALE * f, h = SHEET_FH * PLANE_SCALE * f;
    ctx.drawImage(pl.sheetImg, col * SHEET_FW, SHEET_FH, SHEET_FW, SHEET_FH,
      s.x - w / 2, s.y - h / 2, w, h);
  } else if (pl.ready) {
    const w = 76 * PLANE_SCALE * f, h = w * pl.h / pl.w;
    ctx.drawImage(pl.img, s.x - w / 2, s.y - h / 2, w, h);
  } else {
    // RESPALDO SIN ASSETS (regla P2 de siempre): silueta a mano. El modo tiene que ser jugable con
    // la carpeta de arte vacia, y para eso alcanza con que se vea DONDE esta y como banquea.
    const k = s.k;
    const inc = L.bank * 0.5 * k;
    px(s.x - 4 * k, s.y - 0.4 * k - inc, 4 * k, 0.8 * k, P.bodyDark);   // ala izquierda
    px(s.x, s.y - 0.4 * k + inc, 4 * k, 0.8 * k, P.bodyDark);           // ala derecha
    px(s.x - 1 * k, s.y - 1.2 * k, 2 * k, 2.4 * k, P.bodyDark);         // fuselaje
  }
  ctx.imageSmoothingEnabled = smooth;
}

// ---------------- N1: LA CINTA DE FORMACION ----------------
//
// EL §4 PIDE UN INSTRUMENTO, NO UN NUMERO: "cinta vertical estilo instrumento, no números". La
// razon es la de siempre en este juego — un numero hay que leerlo y traducirlo, y una aguja se ve
// con el rabillo del ojo mientras estas esquivando un mastil. Ademas dice la verdad completa de un
// vistazo: donde estas, donde esta la banda, y para que lado te estas yendo.
//
// COMO SE LEE, de arriba hacia abajo: arriba es LEJOS (lo estas perdiendo) y abajo es CERCA (te le
// vas encima). Es la orientacion de un altimetro de cinta y la misma que ya usa el jugador para
// pensar el pasillo. La franja clara del medio es la banda; la aguja sos vos.

// Medido contra la captura: con y 74 / h 62 el pie de la cinta —justo la zona de ESTELA, la que
// avisa que te le vas encima— caia encima del panel de instrumentos de abajo y se perdia. Sube y
// se acorta para terminar despegada del panel.
const CINTA = { x: 12, y: 68, w: 7, h: 56 };

/** La cinta de formacion. OJO CON EL ESPACIO DE COORDENADAS: esto va en la grilla de DISEÑO
 *  (320x180), adentro del `ctx.scale(U)` del HUD — mientras que `drawPersec`, arriba en este mismo
 *  archivo, va en la grilla de MUNDO (480x270). Es la trampa #4 del repo y aca conviven las dos.
 *  Solo existe mientras haya persecucion: fuera del modo no ocupa un pixel. */
export function drawCinta() {
  const L = snapshot();
  if (!L) return;
  const { x, y, w, h } = CINTA;
  // el rango dibujado va de 0 a hi*1.5: mas alla la aguja se clava en el tope, que es exactamente
  // la lectura correcta ("lo estas perdiendo") y no hace falta escala infinita para decirla
  const max = L.hi * 1.5;
  const aY = d => y + h - Math.max(0, Math.min(1, d / max)) * h;

  ctx.globalAlpha = 0.75;
  px(x - 1, y - 1, w + 2, h + 2, '#0d1418');
  ctx.globalAlpha = 1;
  // LA BANDA: la unica parte clara de la cinta. Todo lo demas es fondo, asi que el ojo va sola.
  const yLo = aY(L.hi), yHi = aY(L.lo);
  px(x, yLo, w, Math.max(1, yHi - yLo), '#24424a');
  px(x, yLo, w, 1, P.crest);
  px(x, yHi - 1, w, 1, P.crest);

  // LA ZONA DE ESTELA, abajo de todo: la franja donde el aire ya esta sucio. Se pinta en el color
  // de peligro para que "abajo del todo es malo" no haya que aprenderlo muriendo.
  const yW = aY(PURS_WASH_D);
  px(x, yW, w, Math.max(1, y + h - yW), '#4a2318');

  // LA AGUJA: vos. Sale del ancho de la cinta para los dos lados — una marca que se sale del
  // instrumento se ve aunque estes mirando el mastil que viene.
  const dentro = L.d >= L.lo && L.d <= L.hi;
  const ay = Math.round(aY(L.d));

  // EL CIERRE (N5): la COLA de la aguja. Sale de la aguja hacia donde vas a estar —abajo si te
  // estas acercando, arriba si te estas descolgando— y su largo es cuan rapido. La aguja sola dice
  // donde estas, que es informacion que llega tarde: cuando toca el borde ya empezo la gracia. Esta
  // cola es la unica parte del instrumento que habla del FUTURO, que es como se vuela formacion de
  // verdad — no se mira la distancia, se mira si crece o se achica.
  const c = Math.max(-1, Math.min(1, L.cierre / L.cmax));
  if (Math.abs(c) > 0.06) {
    // c > 0 = te acercas = la aguja BAJA (menos distancia es mas abajo en la cinta). Se RECORTA a la
    // cinta: con la aguja clavada en un extremo la cola se iria del instrumento, y una marca que se
    // dibuja fuera de su caja es la forma mas facil de que el HUD deje de leerse como un aparato.
    const y0 = Math.max(y, Math.min(y + h, c > 0 ? ay : ay - Math.abs(c) * h * 0.28));
    const y1 = Math.max(y, Math.min(y + h, c > 0 ? ay + c * h * 0.28 : ay));
    // VA POR FUERA, en un riel propio a la izquierda: adentro de la cinta la cola se pierde contra
    // el relleno de la banda (medido en la captura n5_c). Asi el instrumento queda con dos rieles y
    // cada uno dice una cosa — izquierda el CIERRE (para donde vas), derecha la GRACIA (cuanto te
    // queda) — y la cinta del medio sigue siendo solo la distancia.
    px(x - 5, y0, 2, Math.max(1, y1 - y0), c > 0 ? P.warn : P.accent);
  }

  px(x - 2, ay - 1, w + 4, 2, dentro ? P.foam : P.warn);

  // LA GRACIA, como un hilo que se vacia PEGADO a la cinta. Solo aparece cuando estas gastandola:
  // un contador siempre visible seria un reloj de cuenta regresiva permanente, y este modo ya
  // tiene bastante tension con el acelerador.
  if (L.fuera > 0.05) {
    const f = 1 - Math.min(1, L.fuera / L.gracia);
    px(x + w + 2, y, 2, h, '#1a2226');
    px(x + w + 2, y + h * (1 - f), 2, Math.max(1, h * f), f < 0.35 ? P.warn : P.accent);
  }

  // EL INDICATIVO, con placa. Sin ella el gris se perdia contra el cielo del amanecer — y el
  // nombre no es decorativo: es a quien le esta hablando la radio cuando grita "¡Cerrá, PUMA!".
  ctx.font = '6px monospace'; ctx.textAlign = 'center';
  const tw = ctx.measureText(L.nombre).width + 4;
  ctx.globalAlpha = 0.8;
  // EL TIRON EN LA PLACA (N5): durante el aviso la placa late, y mientras quema queda encendida. La
  // radio ya lo grito, pero el grito es un cartel que pasa — y el tiron dura varios segundos con el
  // jugador mirando el pasillo. Esto es lo que queda prendido mientras tanto.
  const enc = L.tir === 2 || (L.tir === 1 && Math.sin(L.t * 18) > 0);
  px(x + w / 2 - tw / 2, y - 10, tw, 8, enc ? P.warn : '#0d1418');
  ctx.globalAlpha = 1;
  ctx.fillStyle = enc ? '#0d1418' : P.accent;
  ctx.fillText(L.nombre, x + w / 2, y - 4);
}
