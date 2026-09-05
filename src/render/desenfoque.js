// EL DESENFOQUE DE LA VELOCIDAD — el mundo se estira, y el avion no.
//
// LO USAN TRES ESTADOS, y cada uno tiene su CARACTER — no son el mismo efecto con otro numero:
//   TURBO     la estela mas larga y el marco apenas insinuado. Estas yendo mas rapido, nada mas.
//   MOMENTUM  estela corta y el marco CERRADO A FONDO. No estas yendo mas rapido: el tiempo se
//             partio, y el marco dice que el mundo se te fue de la vista salvo lo que tenes
//             adelante.
//   RASANTE   el poder: estela de turbo y un marco intermedio. Va mas cerrado que el turbo porque
//             el poder ES foco, pero no tanto como el momentum, que es otra cosa.
//
// Que los tres compartan el MECANISMO y difieran en dos numeros es la idea: si el dia de mañana el
// turbo y el momentum se vieran igual, el jugador dejaria de poder distinguirlos de reojo.
//
// QUE ES, EN UNA LINEA: un BARRIDO RADIAL desde el punto de fuga. No es un blur gaussiano de
// Photoshop: es lo que ve un ojo cuando el mundo se le viene encima — todo estirandose HACIA
// AFUERA desde el punto al que vas, mas cuanto mas lejos del centro. Por eso el centro queda
// nitido solo: en un barrido radial el desplazamiento es proporcional al radio, y en el punto de
// fuga vale exactamente cero.
//
// POR QUE NO UN BLUR DE VERDAD (`ctx.filter = 'blur(4px)'`). Dos razones y ninguna es de gusto:
//   1. Un gaussiano de pantalla completa cada cuadro es lo mas caro que puede pedirsele a un
//      canvas 2D, y esto tiene que correr con el 3D del mar ya bliteado encima.
//   2. Un gaussiano sobre pixel art lo convierte en puré. Borronea el ARTE. El barrido radial no
//      difumina el pixel: lo ARRASTRA en la direccion en la que el mundo se esta moviendo, que es
//      lo que la vista realmente hace a esa velocidad. Uno tapa el juego; el otro lo acelera.
//
// COMO SE HACE: el PROMEDIO del cuadro consigo mismo, escalado, a lo largo del rayo que va del
// punto de fuga hacia afuera. Diez muestras repartidas hasta un 20% de estirado. En el borde de la
// pantalla ese 20% son ~60 px: el pixel no se suaviza, VIAJA — que es la diferencia entre una foto
// desenfocada y una foto de algo que se movio.
//
// SE PROBO ANTES CON REALIMENTACION (cada pasada redibujando el resultado anterior, para comprar
// largo exponencial con pocas pasadas). Es mas elegante y NO SE PUEDE: pide dibujar un lienzo
// sobre si mismo, y eso cuelga el renderer. Diez pegados derechos cuestan nada medible (ver la
// nota de rendimiento abajo) y no tienen ese filo.
//
// LA COPIA VA A RESOLUCION COMPLETA, Y ESTO SE PROBO AL REVES PRIMERO. La primera version copiaba
// a MEDIA resolucion para que el promediado del downscale hiciera el desenfoque gratis. Es mas
// barato y esta mal: aplana el arte EN TODA LA PANTALLA, no solo donde hay movimiento. La textura
// del mar son motas claras de 1 px sobre agua oscura; promediarlas da un gris medio y el mar
// entero pasaba a leerse como niebla — incluso el de primer plano, que es el que mirás para no
// clavarte. Un A/B del mismo tramo con la opcion prendida y apagada lo dejo a la vista. A
// resolucion completa el unico desenfoque que hay es el que produce el MOVIMIENTO, que es el
// unico honesto.
//
// Los lienzos llevan un `setTransform(SC)` puesto una sola vez: adentro de este archivo todo se
// razona en coordenadas de MUNDO (480x270) aunque los pixeles sean 960x540, y no hay una sola
// conversion de coordenadas dando vueltas.
//
// EL FOCO. Al avion no se lo toca, y a lo que tiene alrededor tampoco: antes de pegar el barrido se
// le borra el centro con un degrade que arranca opaco sobre el avion y se abre hasta la periferia.
// Asi la chapa, los parches y la mira quedan a foco, el agua de primer plano conserva su grano —y
// el efecto queda JUGABLE: lo que tenes que mirar para no morir esta en el centro, y el centro
// nunca se ensucia. Lo que se deshace es el borde, que es ademas donde el arrastre es mayor de
// verdad.

import { ctx, cv, W, H, HOR, PZ, SC } from './ctx.js';
import { plane, cfg } from '../core/state.js';
import { proj } from '../core/fx.js';

// ------------------------------- PERILLAS -------------------------------
// Estan aca y no en data/tuning.js por la misma razon que las del "vuelo vivo" en render/plane.js:
// no las lee nadie mas y se tocan mirando la pantalla, no leyendo una tabla.

/** Cuantas muestras a lo largo del rayo. Es lo que separa una RAYA de unos FANTASMAS: con pocas se
 *  ven las copias sueltas. Diez alcanzan para que el trazo se lea continuo al estirado de abajo; si
 *  se sube el `estirado` de un modo hay que subir esto tambien, o vuelven a verse los escalones.
 *  Con 1.45 —el estirado mas largo de la tabla— doce alcanzan. */
const MUESTRAS = 12;

/** Opacidad del barrido ya montado, a turbo pleno.
 *
 *  POR QUE NO ESTA AL PALO, Y ESTO SE APRENDIO MIRANDO EL LUGAR EQUIVOCADO. Se venia calibrando
 *  con el avion TREPANDO, y ahi el efecto pedia mas. Pero el turbo se usa AL RAS —el juego se
 *  llama asi—, y al ras el mar ocupa la pantalla entera: toda esa textura cae en la zona de
 *  arrastre maximo. Con el barrido opaco, la trama de puntos del agua —la firma visual del
 *  juego— desaparecia entera durante el turbo. A 0.62 el cuadro original sigue mandando, los
 *  puntos sobreviven, y el arrastre se lee como una bruma de movimiento POR ENCIMA del agua en vez
 *  de en lugar de ella. Lo que carga el resto de la sensacion es el TUNEL, que oscurece sin
 *  destruir nada. */
const FUERZA = 0.95;

// ------------------------------- EL TUNEL -------------------------------
// El barrido solo no alcanza: estirar los bordes los vuelve difusos, pero no APAGA nada, y lo que
// vende la velocidad en cine es que la periferia se OSCUREZCA mientras el centro se sostiene. Es
// literalmente lo que hace un ojo acelerado — el campo util se angosta.
//
// OJO CON EL VELO QUE YA EXISTE. `cfg.marco === 'focus'` (render/marco.js) ya pone un velo negro
// a 0.52 en los costados. Son distintos a proposito y no se pisan: aquel es LATERAL, sigue la
// perspectiva del carril y esta SIEMPRE; este es RADIAL, esta centrado en el avion y solo mientras
// dura el turbo. Aun asi se suman, y sumados cierran de mas — por eso este se hace a un lado
// cuando el otro ya esta puesto. La regla es simple: dos velos oscuros al mismo tiempo son uno
// oscuro y otro sobrando.

/** EL CARACTER DE CADA ESTADO, en un solo lugar.
 *    estirado  el LARGO de la estela (1.45 = el pixel del borde viaja un 45% de su radio)
 *    a         cuanto oscurece el marco en el borde
 *    dentro/fuera  entre que radios se cierra: bajarlos no lo hace mas oscuro, lo hace mas CHICO,
 *                  que es lo que de verdad se lee como encierro
 *
 *  Agregar un estado es agregar una fila aca y pasar su intensidad por parametro. */
const MODOS = {
  turbo:    { estirado: 1.45, a: 0.58, dentro: 90, fuera: 240 },
  momentum: { estirado: 1.20, a: 0.90, dentro: 38, fuera: 170 },
  rasante:  { estirado: 1.45, a: 0.74, dentro: 62, fuera: 205 },
};

/** CUANTO SE ESTIRA EL OVALO A LO ALTO. Es la diferencia entre un tunel y una molestia: con un
 *  circulo, lo primero que se apaga es el mar de PRIMER PLANO —justo el carril por el que venis
 *  volando y lo unico que mirás para no clavarte—. Estirandolo a lo alto el cierre se va a los
 *  COSTADOS, que es donde el arrastre ya es mayor y donde no hay nada que leer. Encima coincide
 *  con la forma del velo lateral que el juego ya usa para lo mismo (render/marco.js). */
const TUNEL_ALTO = 1.55;

/** Cuanto se achica el tunel cuando el velo lateral de FOCUS ya esta puesto. */
const TUNEL_CON_FOCUS = 0.4;

/** EL DEGRADE DE FOCO, centrado en el avion. `NITIDO` es el radio que no se toca NUNCA —tiene que
 *  cubrir el avion con aire de sobra: si el borde cae SOBRE el ala, el ala queda medio nitida y
 *  medio arrastrada y eso se lee como un error de dibujo—. De ahi hacia afuera el barrido va
 *  entrando hasta pesar entero recien en `ALCANCE`.
 *
 *  POR QUE NO ES UN SIMPLE AGUJERO. La primera version barria TODO por igual salvo un hueco chico,
 *  y el mar quedaba lechoso: la textura del agua son motas claras de 1 px sobre agua oscura, y
 *  promediarla la aplana en un gris medio que el ojo lee como niebla, no como velocidad. Con el
 *  barrido creciendo por radio el agua de primer plano —que es la que tiene esa textura y la que
 *  mirás para no clavarte— conserva su grano, y lo que se deshace es la periferia, que es
 *  ademas donde el arrastre es fisicamente mayor. Se arreglan de una vez el lavado y la lectura. */
const NITIDO = 34, ALCANCE = 150;

/** Cuanto tarda en entrar y salir (por cuadro, interpolacion exponencial). El turbo se pisa y se
 *  suelta todo el tiempo: si el efecto fuera un interruptor, cada toque seria un parpadeo. */
const RAMPA = 0.09;

/** QUITAR con la sonda __blurdbg: sin esto, "el desenfoque no anda" no distingue entre apagado por
 *  opcion, apagado por estado y encendido pero invisible. */
export const BLUR_DBG = { t: 0, m: 0, r: 0, modo: '' };

// LAS DOS INTENSIDADES VIVAS, 0..1 — la unica memoria del modulo. Van separadas y no en una sola
// porque el turbo y el momentum pueden estar puestos AL MISMO TIEMPO, y ahi el marco tiene que ser
// el del momentum aunque el barrido ya lo estuviera poniendo el turbo.
let fT = 0, fM = 0, fR = 0;
let a = null, b = null, ga = null, gb = null;   // lienzos auxiliares, a media resolucion

/** ¿Esta activo el desenfoque? Unico lugar que sabe cual es el valor apagado. */
const desenfoqueOn = () => cfg.desenfoque !== 'off';

function lienzos() {
  if (a) return;
  a = document.createElement('canvas'); a.width = W * SC; a.height = H * SC;
  b = document.createElement('canvas'); b.width = W * SC; b.height = H * SC;
  ga = a.getContext('2d'); gb = b.getContext('2d');
  // EL TRANSFORM SE PONE UNA SOLA VEZ y no se toca mas: de aca en adelante todo el archivo dibuja
  // en coordenadas de MUNDO aunque el lienzo tenga el doble de pixeles.
  ga.setTransform(SC, 0, 0, SC, 0, 0); gb.setTransform(SC, 0, 0, SC, 0, 0);
  // suavizado SI: las copias caen en posiciones fraccionarias y sin interpolar el arrastre se ve
  // como cuatro calcos escalonados en vez de un barrido.
  ga.imageSmoothingEnabled = true; gb.imageSmoothingEnabled = true;
}

/** EL BARRIDO. Se dibuja sobre el MUNDO y bajo el HUD —los instrumentos nunca se borronean— y
 *  DESPUES de que el zoom se haya restaurado: trabaja sobre pixeles ya cocinados, en la grilla de
 *  mundo, sin importarle que transformaciones los pusieron ahi.
 *
 *  @param turbo   0..1 — cuanto TURBO hay ahora
 *  @param momento 0..1 — cuanto MOMENTUM hay ahora
 *  @param ras     0..1 — cuanto PODER RASANTE hay ahora
 *
 *  Los dos los decide el que llama (game.js); el modulo solo se encarga de que el cambio no sea un
 *  salto y de que cada uno traiga su marco. Van por parametro y no leyendo `run.boost` para que el
 *  PODER RASANTE pueda encender el mismo barrido el dia que se quiera.
 */
export function drawDesenfoque(turbo, momento, ras) {
  const on = desenfoqueOn();
  const lim = v => on ? Math.max(0, Math.min(1, v || 0)) : 0;
  fT += (lim(turbo) - fT) * RAMPA;
  fM += (lim(momento) - fM) * RAMPA;
  fR += (lim(ras) - fR) * RAMPA;
  BLUR_DBG.t = +fT.toFixed(3); BLUR_DBG.m = +fM.toFixed(3); BLUR_DBG.r = +fR.toFixed(3);
  // EL BARRIDO ES UNO SOLO. Los estados pueden pisarse (turbo adentro del momentum), y sumarlos
  // llevaria el cuadro a negro: manda el que este mas presente, y el suyo es el caracter que se ve.
  const f = Math.max(fT, fM, fR);
  if (f < 0.004) { fT = fM = fR = 0; BLUR_DBG.modo = ''; return; }
  const MOD = f === fM ? MODOS.momentum : f === fR ? MODOS.rasante : MODOS.turbo;
  BLUR_DBG.modo = MOD === MODOS.momentum ? 'momentum' : MOD === MODOS.rasante ? 'rasante' : 'turbo';
  lienzos();

  // 1. EL CUADRO, TAL CUAL. 1:1 — el lienzo tiene los mismos pixeles que el buffer.
  ga.globalCompositeOperation = 'copy';          // 'copy' y no clear+draw: un barrido menos
  ga.drawImage(cv, 0, 0, W, H);
  ga.globalCompositeOperation = 'source-over';

  // 2. EL BARRIDO: el promedio del cuadro consigo mismo, estirado, abriendose desde el PUNTO DE FUGA — que es (W/2, HOR) y no
  //    depende de nada: en proj(), cuando z tiende a infinito k tiende a 0 y todo converge ahi.
  gb.globalCompositeOperation = 'copy';          // la muestra 0 pisa lo que quedo del cuadro anterior
  gb.globalAlpha = 1;
  const cx = W / 2, cy = HOR;
  for (let i = 0; i < MUESTRAS; i++) {
    const e = 1 + (MOD.estirado - 1) * (i / (MUESTRAS - 1));
    // EL PROMEDIO CORRIENDO. Alfa 1/(i+1) sobre lo ya acumulado da el promedio exacto de las i+1
    // muestras, sin tener que sumarlas aparte y dividir despues.
    if (i === 1) gb.globalCompositeOperation = 'source-over';
    if (i > 0) gb.globalAlpha = 1 / (i + 1);
    gb.drawImage(a, cx - cx * e, cy - cy * e, W * e, H * e);
  }
  gb.globalAlpha = 1;

  // 3. EL HUECO donde vive el avion. `destination-out` borra el barrido donde el degradado es
  //    opaco: centro transparente (el avion se ve tal cual lo dibujaron) y borde blando hacia
  //    afuera. OJO: proj() da la posicion del avion ANTES del zoom y del temblor de camara, asi
  //    que con zoom fuerte el hueco puede quedar un par de pixeles corrido — no importa, el borde
  //    es blando y el radio tiene aire de sobra.
  const s = proj(plane.x, plane.y, PZ);
  const hg = gb.createRadialGradient(s.x, s.y, NITIDO, s.x, s.y, ALCANCE);
  hg.addColorStop(0, 'rgba(0,0,0,1)');       // el avion: intacto
  hg.addColorStop(0.35, 'rgba(0,0,0,0.62)'); // las paradas del medio le dan la curva: sin ellas la
  hg.addColorStop(0.7, 'rgba(0,0,0,0.22)');  // rampa es lineal y se ve el anillo donde empieza
  hg.addColorStop(1, 'rgba(0,0,0,0)');       // la periferia: barrido entero
  gb.globalCompositeOperation = 'destination-out';
  gb.fillStyle = hg; gb.fillRect(0, 0, W, H);
  gb.globalCompositeOperation = 'source-over';

  // 4a. ENCIMA DEL MUNDO. El suavizado va PRENDIDO tambien aca: el barrido es aire, no arte, y con
  //    el apagado los tres pegados se ven como tres calcos escalonados en vez de un arrastre.
  const sm = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = f * FUERZA;
  ctx.drawImage(b, 0, 0, W, H);
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = sm;

  // 4b. EL TUNEL. Va DESPUES del barrido —oscurece el resultado, no la fuente— y centrado en el
  //     mismo punto que el foco: el avion. Con el velo de FOCUS ya puesto se hace a un lado.
  // CADA ESTADO TRAE SU MARCO — el del modo que manda, escalado por cuanto entro. No se suman los
  // marcos: con turbo adentro del momentum, el marco es el del momentum, no uno mas negro todavia.
  const tf = MOD.a * f * (cfg.marco === 'focus' ? TUNEL_CON_FOCUS : 1);
  const tDentro = MOD.dentro, tFuera = MOD.fuera;
  ctx.save();
  // el ovalo se consigue dibujando un circulo en un espacio estirado. Se estira el ESPACIO y no el
  // degrade porque createRadialGradient solo sabe de circulos.
  ctx.translate(s.x, s.y); ctx.scale(1, TUNEL_ALTO); ctx.translate(-s.x, -s.y);
  const tg = ctx.createRadialGradient(s.x, s.y, tDentro, s.x, s.y, tFuera);
  tg.addColorStop(0, 'rgba(4,7,12,0)');
  tg.addColorStop(0.55, `rgba(4,7,12,${(tf * 0.28).toFixed(3)})`);   // la curva: sin esta parada
  tg.addColorStop(1, `rgba(4,7,12,${tf.toFixed(3)})`);               // el borde del ovalo se LEE
  ctx.fillStyle = tg;
  // el rectangulo tambien vive en el espacio estirado: hay que cubrir la pantalla ENTERA de vuelta
  ctx.fillRect(-W, s.y - (s.y + H) / TUNEL_ALTO - H, W * 3, (H * 3) / TUNEL_ALTO + H * 2);
  ctx.restore();
}

