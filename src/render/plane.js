// RENDER DEL AVION: el sprite del jugador y su mira.
//
// Dibuja sombra, espuma, el sprite (hoja horneada con alabeo/cabeceo reales, o ilustracion, o
// fallback de rects), la vibracion del roce, los fantasmas de la pirueta, el postquemador y la
// sangre del atropello. Al final, la mira (libre con mouse, o adelante del avion en tactil).
//
// Recibe `selPlane` (que avion eligio el jugador — estado de menu, vive en game.js) y `viewMouse`
// (resuelve la mira segun la camara — la camara sigue en game.js). El resto lo lee de los stores.

import { ctx, px, PZ, U } from './ctx.js';
import { plane, cfg, S } from '../core/state.js';
import { run } from '../core/run.js';
import { inp } from '../core/input.js';
import { proj } from '../core/fx.js';
import { hzSprite } from '../core/horizon.js';
import { P } from '../data/palette.js';
import { drawCono, drawVaporAla, drawCruce } from './mach.js';
import { drawMira } from './miras.js';
import { anchorSpray, drawSpray } from './rain.js';
import { PLANES, SHEET_NF, SHEET_FW, SHEET_FH, SHEET_BODY_H } from '../data/planes.js';
import { skinOf } from '../data/skins.js';
import { pilotIdx } from '../core/squad.js';
import { pilotName, rosterActive } from '../systems/squad.js';
import { nivel } from '../core/desgaste.js';   // el avion remendado — GUION_3 §9d, ley 4
import { MOVES } from '../data/moves.js';

const MIRA_SIZE = 17;   // lado de la mira en pixeles de mundo (480x270)
const AIM_PITCH = 5;    // cuanto sube/baja la mira FIJA con el cabeceo (unidades de mundo)

// PERILLAS del "vuelo vivo": el avion nunca queda congelado en el aire. Son sutiles a proposito
// (el juego corre a 320x180, 1px se nota). Subilas para que flote/cabecee mas, bajalas para calmarlo.
// TAMAÑO del avion en pantalla, como factor. 1 = el horneado tal cual (84 px de ancho de frame).
// Es la perilla para equilibrarlo contra el resto del mundo (mastiles, barcos, obstaculos): si el
// avion se come la pantalla, bajarla; no hay que rehornear nada.
export const PLANE_SCALE = 0.85;
let boostSc = 1;   // factor animado del achique por turbo

const BOB_Y  = 1.5;    // amplitud del bob vertical (px)
const BOB_X  = 0.75;    // amplitud de la deriva horizontal (px) — desfasada del bob → flota en "8"
const WOBBLE = 0.026;  // amplitud de la micro-oscilacion de alabeo (rad, ~1.5°)

/** LA LLAMA DE LA TURBINA. Una sola llama, con INTENSIDAD — no dos efectos distintos.
 *
 *  Antes solo existia con el turbo puesto: el resto del tiempo el avion volaba con la turbina
 *  apagada, que es lo que hacia que se leyera planeando. Ahora hay siempre una llamita mientras
 *  quede combustible, y el turbo es ESA MISMA llama mas larga, mas ancha y con mas resplandor.
 *  Que sea la misma y no otra es el punto: el turbo se lee como "mas de lo mismo", que es lo que
 *  un postquemador es de verdad.
 *
 *  `f` es la intensidad, 0..1. El color se reparte PROPORCIONALMENTE a lo largo: con el indice
 *  crudo (como estaba antes) una llama larga se comia toda la paleta en los primeros pixeles y
 *  terminaba en un rojo plano — justo con el turbo, que es cuando mas se mira.
 *
 *  En pixel art una llama se arma por FILAS que se afinan y se enfrian hacia la punta, con el
 *  largo parpadeando cuadro a cuadro: eso es lo que la hace respirar en vez de ser una barra. */
// ---------------- LA TOBERA (reemplaza a la vieja `flame`) ----------------
//
// LO QUE HACIA MAL LA VERSION ANTERIOR, y no era el color sino la GEOMETRIA: dibujaba una llama
// que se estiraba hacia ABAJO en pantalla, o sea una antorcha vista DE COSTADO. Pero en RASANTE
// el avion se ve DESDE ATRAS: la tobera apunta a la camara. Desde ahi no se ve un penacho — se ve
// EL DISCO caliente del escape, de frente, y el humo viniendose encima.
//
// LOS HECHOS DEL A-4 (por que ademas era falso):
//   · El Skyhawk monta un TURBORREACTOR SIN POSTQUEMADOR — Wright J65 en los A-4B/C/Q argentinos
//     (el Sapphire britanico fabricado bajo licencia), P&W J52 en los E/F/M. Sin reheat no hay
//     nada que arda detras de la tobera: un reactor asi NO tiene llama visible de dia.
//   · Lo que SI se ve es (a) el interior del cano de escape al rojo, (b) la distorsion del aire
//     caliente, y sobre todo (c) HUMO. El J65 era celebremente sucio: dejaba un reguero oscuro
//     que delataba la posicion del avion — un problema tactico real, el mismo que arrastraba el
//     F-4 con sus J79.
//   · O sea que la firma visual verdadera del Skyhawk no es fuego: es HUMO y una boca al rojo.
//
// EL TURBO, entonces, no alarga nada: pone la boca MAS BLANCA, irradia mas, tiembla mas el aire
// y ensucia mas el cielo. (El turbo del juego ya era licencia — el A-4 no tenia postquemador.)
/** DONDE ESTA LA TOBERA dentro del frame, como fraccion del alto y medida DESDE EL CENTRO.
 *
 *  Medido sobre la hoja horneada (frame nivelado, 84x84): el naranja emisivo de la tobera cae en
 *  y = 49, o sea 7 px por debajo del centro del frame (42) -> 7/84.
 *
 *  Va como FRACCION y no como pixeles para que sobreviva a un re-horneado a otra resolucion. Y
 *  esto era el bug de "la llama se ve despegada del avion": estaba anclada a `bodyH2 - 6`, que a
 *  escala normal cae 8,5 px MAS ABAJO que la tobera real — un hueco del ancho de medio fuselaje
 *  entre el avion y su propia llama. */
const TOBERA_F = 7 / 84;

/** LA BOCA AL ROJO, vista de frente. Va DENTRO del contexto del avion (rota con el alabeo, porque
 *  la tobera es parte del avion) y en unidades de diseño.
 *
 *  Tres capas, de afuera hacia adentro: el resplandor que IRRADIA, el anillo del cano, y el nucleo.
 *  Ninguna se estira: todas se ENCIENDEN. Es la diferencia entre una antorcha y un metal caliente.
 *
 *  @param f 0..1 — 0.3 es ralenti, 1 es turbo (ver stepFlame)
 */
function tobera(x, y0, f, esc) {
  if (f <= 0.01) return;
  // SE APAGA AL CABECEAR. Cuando el avion trepa o pica, la hoja cambia de fila y el sprite ya no
  // muestra el cano de frente: el ancla fija de TOBERA_F cae sobre el LOMO del avion y el circulo
  // aparecia pegado en la espalda. No se corrige moviendo el ancla —habria que medir la tobera
  // pose por pose, como se hizo con las puntas de ala— sino aceptando lo que dice la geometria:
  // si no ves el cano, no hay nada que brille. El umbral es el mismo con el que el sprite cambia
  // de fila (0.33 de cabeceo), asi que el resplandor se va justo cuando la pose se pitcha.
  const pitch = Math.min(1, Math.abs(plane.pitch) / 0.33);
  const cara = (1 - pitch) * (run.mvSteep ? 0 : 1);
  if (cara <= 0.02) return;
  const u = esc || 1;                          // media del sprite: la boca escala con el avion
  // PULSO de la turbina: parejo y rapido, con un resto chico de azar para que no sea un metronomo.
  // Un reactor no titila como una fogata — vibra.
  const p = 0.86 + 0.10 * Math.sin(run.t * 30) + Math.random() * 0.04;
  // SOLO EL RESPLANDOR. El anillo y el nucleo se quitaron: eran dos elipses de borde NETO, y un
  // borde neto mal ubicado se lee como un circulo pegado encima del avion — que es justo lo que se
  // veia al cabecear. El resplandor no tiene borde, asi que aunque el ancla no sea perfecta se
  // lee como luz y no como una calcomania.
  const k = f * cara;
  const R = u * (3.2 + f * 5.0) * p;
  const g = ctx.createRadialGradient(x, y0, 0, x, y0, R);
  g.addColorStop(0, `rgba(255,170,90,${0.34 * k})`);
  g.addColorStop(0.45, `rgba(224,110,36,${0.22 * k})`);
  g.addColorStop(1, 'rgba(180,70,22,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y0, R, R * 0.72, 0, 0, 6.2832); ctx.fill();
  ctx.globalAlpha = 1;
}

/** La intensidad de ESTE cuadro, suavizada. Sin la rampa, apretar turbo hacia SALTAR la llama de
 *  3 a 9 px en un cuadro y se leia como un parpadeo, no como una aceleracion. */
let flameF = 0;
function stepFlame() {
  // SOLO CON TURBO (pedido de Matias, 18/8). Al ralenti el 0.3 pintaba la cola con un naranja que
  // no le corresponde: la tobera APAGADA ya viene dibujada en la hoja horneada, con su color. Que
  // el asset mande cuando el motor no esta empujando — el efecto es para lo que el asset no puede
  // hacer, que es encenderse.
  const quiere = run.fuel > 0 && run.boost ? 1 : 0;
  flameF += (quiere - flameF) * 0.18;
  return flameF;
}

// VORTICES DE PUNTA DE ALA, y SOLO con el turbo puesto. No es humo de motor —eso ya lo hace la
// llama de la tobera— sino el hilo que se condensa en el extremo del ala cuando el avion esta
// cargado. Por eso sale de las PUNTAS y de ningun otro lado, y por eso aparece justo cuando
// apretas turbo: es el instrumento que te dice que estas exprimiendo el avion.
//
// ES UNA HISTORIA DE POSICIONES, una por cuadro, y no un sistema de particulas. La diferencia
// importa: asi el hilo sigue EXACTAMENTE lo que hiciste —el bob, la vibracion del roce, el
// alabeo, el tiron de un esquive— en vez de aproximarlo con velocidades. Y como el avion vive
// clavado en el mismo punto de la pantalla, cada muestra ademas se ABRE hacia afuera y BAJA con
// la edad: sin eso las diecisiete muestras caerian una encima de otra y el hilo seria un punto.
//
// Al soltar el turbo no se agregan muestras y la cola se va comiendo el hilo de atras para
// adelante, que es como se disipa de verdad — no un corte.
// CORTINAS DE PUNTA DE ALA (F3.1): donde estan las puntas respecto de la sombra, y hasta que
// altura hay agua que arrancar. RAS_ALT es el techo de la banda del x10 — una sola banda, y
// ahora tambien un solo efecto que la anuncia.
const TIP_X = 15, RAS_ALT = 4.5;

// EL LARGO DE LA ESTELA. `TIP_CAIDA` es cuanto CAE la muestra mas vieja, en pixeles de mundo, y
// es lo unico que la alarga de verdad: el avion vive clavado en la pantalla, asi que el hilo no se
// dibuja "por donde pasaste" — las muestras nacerian todas en el mismo pixel y lo unico que las
// separa es este desplazamiento con la edad.
//
// Estuvo en 9 y va al TRIPLE (pedido de Matias, 8/2026). Para ×2 poner 18.
//
// `TIP_N` NO la alarga: la LLENA. Son cuantas muestras vivas hay repartidas sobre ese mismo
// recorrido — sube con el largo para que el hilo no salga punteado.
const TIP_CAIDA = 87;
const TIP_N = 86;
// QUITAR — lo lee la sonda __tipdbg: sin esto, "la estela sale en la pirueta y no en el turbo"
// solo se puede afirmar entrecerrando los ojos sobre una captura.
export const TIP_DBG = { f: 0, n: 0, lx: 0, ly: 0, rx: 0, ry: 0, vio: '', fz: 0 };
const tips = [];

/** LAS PUNTAS DE ALA, MEDIDAS FRAME POR FRAME sobre la hoja horneada.
 *
 *  `TIPS[fila][columna] = [lx, ly, rx, ry]`, en FRACCION del frame y desde su centro: fila =
 *  cabeceo (trepa/nivel/pica), columna = alabeo (-60..+60). Es la misma fila y la misma columna
 *  que elige el sprite, asi que la estela sale exactamente de donde el dibujo puso el ala.
 *
 *  POR QUE UNA TABLA Y NO TRIGONOMETRIA: el intento anterior calculaba la punta con
 *  `cos(bank*0.9)` y `sin(bank*0.9)*0.5`, y esos dos factores estaban inventados. Al alabeo maximo
 *  daba la punta casi en el centro y a 90° la habria dejado horizontal, que es justo lo que se
 *  veia mal. La hoja YA sabe donde esta el ala en cada pose —incluido el acortamiento real, que
 *  lleva la semi-envergadura de 0.32 a 0.20 en los extremos— asi que se le pregunta a ella.
 *
 *  Se re-mide con tools/… el mismo metodo del resto: leer el alfa del frame. Si se re-hornea la
 *  hoja con otra geometria de ala, hay que volver a medir esta tabla. */
// MEDIDA DEL PROPIO SHEET, no estimada a ojo (tools/ ... mide_tips): para cada pose se busca
// el pixel opaco mas a la izquierda y el mas a la derecha del frame, y la Y media de esa
// columna extrema. La tabla anterior estaba cerca en X pero se iba hasta 0.065 en Y —unos
// 5 px— y por eso los hilos nacian al lado de la punta y no EN la punta.
// CUANTO MAS AFUERA salen los hilos, como factor sobre la X de la punta. 1 = exactamente el
// borde medido del ala. Subilo para separarlos del avion (1.15 = un 15% mas afuera), bajalo para
// meterlos adentro. Es LA perilla de "moverlas mas a los costados" — no hay que tocar la tabla.
//
// Solo escala la X: la Y sigue siendo la del borde real, asi que los hilos se corren hacia afuera
// sin despegarse de la linea del ala.
export const TIP_OUT = 1.30;

const TIPS = [
  [[-0.214,-0.125,0.19,0.196],[-0.274,-0.06,0.202,0.155],[-0.298,0,0.238,0.244],[-0.321,0.071,0.286,0.19],[-0.31,0.131,0.31,0.131],[-0.286,0.19,0.321,0.071],[-0.238,0.22,0.298,0],[-0.202,0.155,0.274,-0.06],[-0.19,0.196,0.214,-0.125]],
  [[-0.202,-0.19,0.202,0.131],[-0.262,-0.137,0.214,0.083],[-0.298,-0.065,0.262,0.226],[-0.321,0.012,0.298,0.161],[-0.321,0.083,0.321,0.083],[-0.298,0.161,0.321,0.012],[-0.262,0.226,0.298,-0.065],[-0.214,0.083,0.262,-0.137],[-0.202,0.131,0.202,-0.19]],
  [[-0.19,-0.238,0.202,0.048],[-0.262,-0.19,0.214,0],[-0.286,-0.119,0.262,0.185],[-0.321,-0.042,0.298,0.107],[-0.321,0.036,0.321,0.036],[-0.298,0.107,0.321,-0.042],[-0.262,0.171,0.286,-0.119],[-0.214,0.101,0.262,-0.19],[-0.202,0.048,0.19,-0.238]],
];

/** VORTICES DE PUNTA DE ALA. `f` es la FUERZA (0 = nada): con un booleano no se podia pedir
 *  "fuerte en la pirueta y suave con turbo", que es exactamente para lo que existe. */
function tipTrail(lx, ly, rx, ry, f) {
  const on = f > 0.01;
  // QUITAR con la sonda __tipdbg. Se guardan las DOS puntas ya resueltas: es lo unico que
  // permite afirmar "siguen al ala" y "giran con el tonel" con numeros en vez de con la vista.
  TIP_DBG.f = +f.toFixed(2); TIP_DBG.n = tips.length;
  TIP_DBG.lx = Math.round(lx); TIP_DBG.ly = Math.round(ly);
  TIP_DBG.rx = Math.round(rx); TIP_DBG.ry = Math.round(ry);
  // UN SALTO NO ES UN VUELO. Si el avion aparecio en otro lado —un relevo, volver de un menu, el
  // corte a otra fase— el hilo viejo no es estela: es basura de la vida anterior colgada en el
  // aire. Se tira entera y se empieza de nuevo, en vez de dibujar una raya del punto muerto al
  // punto vivo.
  const ult = tips[tips.length - 1];
  if (ult && Math.abs(ult.rx - rx) + Math.abs(ult.ry - ry) > 40) tips.length = 0;
  if (on) tips.push({ lx, ly, rx, ry });
  else if (tips.length) tips.shift();
  while (tips.length > TIP_N) tips.shift();
  const n = tips.length;
  for (let i = 0; i < n; i++) {
    const p = tips[i];
    const viejo = n > 1 ? 1 - i / (n - 1) : 0;      // 1 = la muestra mas vieja, la punta del hilo
    // La V se abre POCO y se hunde MUCHO. Con 10/5.5 los hilos salian disparados a los costados y
    // quedaban flotando a la altura del fuselaje, como dos rayas sueltas al lado del avion en vez
    // de algo que sale de el. Visto desde atras y desde arriba, lo que hace un vortice es caer:
    // casi todo el recorrido es hacia abajo y apenas se abre.
    // La V se abre POCO comparado con lo que cae: un vortice visto desde atras y desde arriba
    // sobre todo SE HUNDE. La apertura acompaña al largo pero muy amortiguada — a la par, el hilo
    // se iria a los costados y volveria a leerse como dos rayas sueltas al lado del fuselaje.
    const dy = viejo * TIP_CAIDA, dx = viejo * 3.4 * (1 + (TIP_CAIDA / 9 - 1) * 0.35);
    const w = 1 + viejo * 1.1 * (0.55 + f * 0.45);   // fino: a 3.4 px eran bloques, no un hilo
    // el apagado por edad se AFLOJO junto con el largo (0.85 -> 0.72): con la caida al triple, la
    // cola del hilo quedaba tan tenue que la mitad de lo que se gano en largo no se veia.
    ctx.globalAlpha = (1 - viejo * 0.72) * 0.5 * (0.35 + f * 0.65);
    const c = viejo < 0.45 ? P.foam : P.crest;
    px(p.lx - dx - w / 2, p.ly + dy - w / 2, w, w, c);
    px(p.rx + dx - w / 2, p.ry + dy - w / 2, w, w, c);
  }
  ctx.globalAlpha = 1;
}

/** Los DOS fogonazos, colocados en la RAIZ DEL ALA. Al alabear tienen que acompañar al ala y no
 *  quedarse horizontales: la POSICION gira siempre con el alabeo, y la INCLINACION del fogonazo
 *  entra recien pasada la mitad del giro — antes no se notaria y solo ensuciaria el pixel art
 *  (rotar rectangulos chicos unos pocos grados los deja con los bordes sucios). */
function muzzles(bank) {
  const a = bank * 1.05;                       // ~60° a fondo: el mismo giro que traen los frames
  const ca = Math.cos(a), sa = Math.sin(a);
  const ab = Math.abs(bank);
  const tilt = ab > 0.5 ? a * (ab - 0.5) / 0.5 : 0;
  for (const gx of [-5, 5]) {
    const gy = -1;
    ctx.save();
    ctx.translate(gx * ca - gy * sa, gx * sa + gy * ca);
    if (tilt) ctx.rotate(tilt);
    muzzle(0, 0);
    ctx.restore();
  }
}

/** FOGONAZO del canon. Antes eran dos rectangulos blancos de 3x2 que a esta resolucion se leian
 *  como dos ladrillos. Ahora es un fogonazo de verdad: nucleo caliente, petalos en cruz que
 *  cambian por disparo, y un halo tenue. Todo en pixeles enteros — nada de degrade. */
function muzzle(x, y) {
  const big = Math.random() < 0.45;                 // no todos los disparos son iguales
  ctx.globalAlpha = 0.35;                           // halo: da calor sin ensuciar el sprite
  px(x - 2, y - 1, 4, 3, '#e8a33d');
  ctx.globalAlpha = 1;
  px(x - 1, y, 2, 1, '#fff6d8');                    // nucleo blanco caliente
  px(x, y - 1, 1, 3, '#ffe9a8');                    // eje vertical
  px(x - 2, y, 1, 1, '#ffcc66'); px(x + 2, y, 1, 1, '#ffcc66');   // petalos laterales
  if (big) {                                        // fogonazo largo: se estira hacia atras
    px(x, y + 2, 1, 2, '#f0a63a');
    px(x - 3, y, 1, 1, '#d97a26'); px(x + 3, y, 1, 1, '#d97a26');
  }
  if (Math.random() < 0.5) px(x + (Math.random() < 0.5 ? -2 : 2), y + 2, 1, 1, '#c9631f');   // chispa
}

/** TREN DE ATERRIZAJE (`g`: 1 bajado en la pista → 0 recogido). Vista trasera: las dos patas
 *  principales bajo la raiz del ala y, asomando entre medio, la de proa.
 *
 *  SE RECOGE DERECHO PARA ARRIBA, sin plegado. El tren se dibuja DEBAJO del sprite, asi que al
 *  subir las ruedas se meten solas detras del ala y desaparecen — alcanza para leer el gesto. Una
 *  version anterior las juntaba ademas hacia el fuselaje: a este tamaño el pliegue no se leia como
 *  pliegue, las tres ruedas se fusionaban en un ladrillo negro.
 *
 *  TAMAÑO: la rueda es de 2x2 px de diseño. Parece poquisimo escrito, pero el avion entero mide
 *  ~30 px de punta a punta de ala: cualquier cosa mas grande le cuelga como un tren de carga.
 *
 *  Las medidas verticales salen de medir las hojas horneadas: el frame es de 84 px con el avion
 *  centrado, el ala apoya en y=47..49 y la panza termina en y=52 — que en esta escala (0.567 px
 *  de diseño por px de hoja) son el 3.4 y el 5 de abajo. Si se rehornean los aviones, remedir. */
/** EL TREN, dibujado en el ORIGEN del contexto actual.
 *
 *  `u` dice cuantos pixeles vale una unidad de la grilla de diseño en ese contexto: el jugador lo
 *  llama con 1, porque ya esta adentro de su `ctx.scale(U, U)`; la FORMACION del escuadron lo
 *  llama con `U * f`, porque dibuja en pixeles de mundo y cada companero esta a otra distancia.
 *
 *  Que el escuadron use ESTE dibujo y no una copia es el punto: despegan con vos, con el mismo
 *  tren que vos. Dos rutinas de rueda serian un escuadron con dos aviones distintos, y la que no
 *  se mira se pudre. */
// ============================ EL AVION REMENDADO ============================
//
// LA LEY 4 de la simbiosis piloto-avion (GUION_3 §9d): la celula junta parches, remaches nuevos y
// pintura que no coincide mision tras mision, Y NADIE LO MENCIONA. No hay linea de dialogo, no hay
// cartel, no hay contador en el HUD. Al final el jugador vuela un animal remendado que reconoce de
// memoria — y eso hace todo el trabajo solo. Si algun dia aparece un texto explicando esto, esta
// mal hecho: el texto le roba el hallazgo al jugador.
//
// POR QUE ES UN OVERLAY Y NO UN SPRITE. Los aviones estan HORNEADOS (tools/bake_planes.html, y las
// MARCAS de data/skins.js): una variante por nivel de daño multiplicaria las hojas —tres filas por
// nueve columnas, dos hojas, por cada skin de piloto— y el juego ya viene grande. Los parches se
// pintan ENCIMA del frame y adentro del mismo contexto que lo dibujo, asi que heredan gratis el
// alabeo, el cabeceo, el bob, la vibracion y el achique del turbo.
//
// DETERMINISTAS, NUNCA `Math.random()`. Un parche sorteado por cuadro no es un parche: es ruido, y
// a 60 fps el avion titila entero. La forma de cada uno sale de `azarP(i, k)`, funcion PURA del
// indice — la misma chapa en el mismo lugar, cuadro tras cuadro y partida tras partida.
//
// ------------------------------- LA ESCALA MANDA -------------------------------
// EL AVION MIDE 21 PIXELES DE ALTO adentro de un frame de 84, y en pantalla el ala entera es una
// banda de ~3,5 px de diseño. Medido con tools (el perfil opaco del frame nivelado, col 4 / fila 1):
//
//     v = -0.119 .. -0.083   el timon, 1 px de ancho
//     v = -0.071 .. -0.048   el estabilizador horizontal, ±0.15
//     v = -0.036 ..  0.012   el fuselaje, ±0.09
//     v =  0.024 ..  0.095   EL ALA, abriendo de ±0.24 a ±0.321 (la punta cae en 0.083)
//
// A ESE TAMAÑO no existe "un panel con sus cuatro remaches": existe UN PIXEL mas claro al lado de
// otro. Toda la gramatica de abajo esta escrita en pixeles enteros por eso. La primera version de
// esto tenia manchas de 0.075 del frame y colores gris claro (#a9b6b3): en pantalla se leian como
// chatarra flotando AL LADO del avion, no como chapa sobre el ala.
//
// Y LOS COLORES SALEN DEL CAMUFLAJE MEDIDO, no de la paleta de la UI: el A-4 horneado es marron
// #5f4021 en el ala interna, oliva #353b20 en la externa y #45311d en la panza del fuselaje. Una
// reparacion tiene que ser del mismo mundo que eso — otra partida del mismo verde, primer sin
// tapar, chapa nueva mas clara. Un gris azulado ahi es un agujero, no un parche.

/** Ruido determinista: mismo (i,k) → mismo numero, siempre. No es azar: es una tabla que no ocupa. */
const azarP = (i, k) => { const x = Math.sin((i + 1) * 91.7 + k * 47.13) * 43758.5453; return x - Math.floor(x); };

// LA PINTURA QUE NO COINCIDE. Ninguno es el color del avion: esa es toda la idea. Son lo que habia
// en el deposito de Rio Grande — otra partida de verde, primer antioxido que nadie llego a tapar,
// chapa nueva todavia sin envejecer.
const PIEL = {
  chapa:  '#6d7052',   // panel de reemplazo: mas claro que el oliva, del mismo palo
  brillo: '#8b8d68',   // el filo de arriba de la chapa nueva
  verde:  '#4a5230',   // otra partida de pintura verde
  primer: '#6b4a2a',   // primer antioxido, ni llegaron a pintarlo
  hollin: '#241f14',   // el borde chamuscado de lo que hubo abajo
  remache:'#1b1d12',   // el remache a contraluz
};

/** Cuanto tarda un parche en terminar de asomar, en unidades de `nivel()`. Sin esto aparecerian de
 *  golpe al cruzar su umbral y el avion daria un salto entre dos misiones. */
const RAMPA = 0.14;

/** Donde cae la PUNTA DEL ALA en el frame nivelado (TIPS[1][4]). Es el cero contra el que estan
 *  medidas las `v` de la tabla: asi cada `v` se lee directo del perfil de arriba. */
const V_PUNTA = 0.083;

/** Media envergadura NIVELADA (TIPS[1][4]): la vara contra la que se mide cuanto se acorto el ala
 *  en esta pose, o sea cuanto hay que angostar una chapa pegada a ella. */
const V_ALA_NIVEL = 0.321;

// LA CHAPERIA, EN ORDEN DE APARICION. Cada entrada es una reparacion concreta y esta puesta a mano
// sobre chapa que existe — no son manchas decorativas sorteadas sobre el frame.
//   u      a lo largo del ALA: -1 punta izquierda · 0 el fuselaje · +1 punta derecha
//   v      altura ABSOLUTA en el frame nivelado, desde el centro (la tabla del perfil de arriba)
//   w/h    tamaño en fraccion del ANCHO del frame; en pantalla se redondea a pixeles enteros
//   desde  a partir de que `nivel()` empieza a asomar
//
// EL ORDEN CUENTA UNA HISTORIA: primero la punta del ala derecha —lo que primero raspa cuando pasas
// bajo—, despues la panza (el fuego de superficie viene de abajo), despues el fuselaje, y el
// estabilizador —lo ultimo que se rompe y lo primero que se nota— recien pasada la mitad.
const PARCHES = [
  { u:  0.72, v:  0.072, w: 0.062, h: 0.020, tipo: 'panel',    desde: 0.05 },  // punta del ala derecha
  { u: -0.45, v:  0.050, w: 0.050, h: 0.018, tipo: 'mancha',   desde: 0.12 },  // ala izquierda, media
  { u:  0.40, v:  0.038, w: 0.048, h: 0.014, tipo: 'remaches', desde: 0.20 },  // costura del encastre der
  { u: -0.72, v:  0.078, w: 0.058, h: 0.018, tipo: 'panel',    desde: 0.28 },  // punta del ala izquierda
  { u:  0.00, v: -0.006, w: 0.050, h: 0.022, tipo: 'mancha',   desde: 0.36 },  // el lomo del fuselaje
  { u: -0.22, v:  0.042, w: 0.042, h: 0.014, tipo: 'remaches', desde: 0.44 },  // encastre izquierdo
  { u:  0.55, v:  0.062, w: 0.052, h: 0.018, tipo: 'panel',    desde: 0.52 },  // ala derecha, media
  { u:  0.31, v: -0.060, w: 0.038, h: 0.016, tipo: 'panel',    desde: 0.60 },  // EL ESTABILIZADOR
  { u: -0.85, v:  0.083, w: 0.040, h: 0.014, tipo: 'mancha',   desde: 0.68 },  // la punta pelada
  { u:  0.18, v:  0.088, w: 0.046, h: 0.014, tipo: 'mancha',   desde: 0.76 },  // hollin bajo la raiz
  { u: -0.55, v:  0.068, w: 0.046, h: 0.014, tipo: 'remaches', desde: 0.84 },  // media ala izquierda
  { u:  0.00, v:  0.030, w: 0.036, h: 0.016, tipo: 'panel',    desde: 0.92 },  // la panza, entre las alas
];

/** LOS PARCHES, encima del sprite y adentro de su mismo contexto.
 *
 *  @param mw,mh  el frame ya dibujado, en unidades de diseño (por eso las fracciones son del frame)
 *  @param T      las puntas de ala MEDIDAS de ESTA pose (la misma tabla TIPS que usa la estela). Se
 *                usa para dos cosas: correr los parches a lo largo del ala segun cuanto se acorto
 *                la envergadura, y ACOSTARLOS con ella al banquear. Sin esto los parches se quedan
 *                horizontales mientras el ala se para, que es cuando mas se los mira.
 *  @param n      `nivel()` de core/desgaste.js — a 0 esta funcion no dibuja NADA
 */
function parches(mw, mh, T, n) {
  if (!(n > 0.001)) return;                       // celula recien salida de fabrica: no hay overlay
  // EL FUSELAJE ESTA ENTRE LAS DOS PUNTAS. Sacarlo de la tabla en vez de fijarlo en 0 es lo que hace
  // que la fila de parches se incline CON el ala: la linea que las une es la linea del ala.
  const mx = (T[0] + T[2]) / 2, my = (T[1] + T[3]) / 2;
  for (let i = 0; i < PARCHES.length; i++) {
    const p = PARCHES[i];
    const a = (n - p.desde) / RAMPA;
    if (a <= 0) continue;                         // a este todavia no le toco
    const al = a > 1 ? 1 : a;
    const su = p.u < 0 ? -p.u : p.u;
    const lx = (p.u > 0 ? T[2] : T[0]) - mx, ly = (p.u > 0 ? T[3] : T[1]) - my;
    const x = (mx + su * lx) * mw;
    // la `v` de la tabla esta medida en el frame NIVELADO; lo que la pose agrega es la INCLINACION
    // de la linea del ala, que es exactamente `(my + su*ly) - V_PUNTA`.
    const y = (my + su * ly - V_PUNTA + p.v) * mh;
    // ESCORZO: banqueado, el ala se ve casi de canto y una chapa pegada a ella se angosta igual que
    // la chapa de verdad. Se nota mas cuanto mas afuera esta, de ahi que se mezcle con `su`.
    const esc = Math.min(1, Math.abs(lx) / V_ALA_NIVEL);
    const w = Math.max(1, Math.round(p.w * mw * (1 - su * (1 - esc) * 0.85)));
    const h = Math.max(1, Math.round(p.h * mw));
    const x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2);
    ctx.globalAlpha = al * 0.9;
    if (p.tipo === 'remaches') {
      // UNA COSTURA DE REMACHES NUEVOS. No es una chapa: es la fila de puntos que dejo el que la
      // atornillo. Puntos sueltos y no una linea continua — una linea continua se lee como un cable.
      for (let k = 0; k * 2 < w; k++) px(x0 + k * 2, y0 + (azarP(i, k) < 0.3 ? 1 : 0), 1, 1, PIEL.remache);
    } else if (p.tipo === 'mancha') {
      // PINTURA QUE NO COINCIDE. Dos rectangulos corridos un pixel: a esta escala eso es todo lo que
      // hace falta para que el borde se lea como brochazo y no como calcomania.
      const c = azarP(i, 0) < 0.5 ? PIEL.verde : PIEL.primer;
      px(x0, y0, w, h, c);
      px(x0 + (azarP(i, 1) < 0.5 ? -1 : w - 1), y0 + (h > 1 ? 1 : 0), Math.max(1, Math.round(w * 0.4)), 1, c);
    } else {
      // CHAPA DE REEMPLAZO: mas clara que el resto, con el filo de arriba encendido y un remache en
      // la punta. El filo solo se dibuja si la chapa tiene DOS pixeles de alto — si no, se comeria
      // el parche entero y quedaria una raya clara suelta.
      px(x0, y0, w, h, PIEL.chapa);
      if (h > 1) { ctx.globalAlpha = al * 0.6; px(x0, y0, w, 1, PIEL.brillo); }
      ctx.globalAlpha = al * 0.85;
      px(x0 + w - 1, y0 + h - 1, 1, 1, PIEL.remache);
    }
    ctx.globalAlpha = 1;
  }
}

export function drawGear(g, u) {
  if (g <= 0) return;
  const TIRE = '#14181a', RIM = '#6d7679';
  // el ultimo tramo se apaga: a esa altura la rueda ya esta casi toda tapada por el ala y lo poco
  // que asoma no tiene recorrido para irse solo
  ctx.globalAlpha = Math.min(1, g * 5);
  // PATA DE PROA: una rueda mas chica todavia, que apenas asoma por debajo de la panza
  const ny = 3.4 + 3.1 * g;
  if (ny > 5.4) px(-0.5 * u, 5.2 * u, u, (ny - 5.2) * u, TIRE);
  px(-u, ny * u, 2 * u, u, TIRE);
  // PRINCIPALES
  for (const sgn of [-1, 1]) {
    const gx = sgn * 4, gy = 2.6 + 3.4 * g;
    if (gy > 4.2) px((gx - 0.5) * u, 4 * u, u, (gy - 4) * u, TIRE);   // pata, de la raiz del ala
    px((gx - 1) * u, gy * u, 2 * u, 2 * u, TIRE);                     // rueda
    px((gx - 1) * u, gy * u, 2 * u, u, RIM);                          // brillo del cubo: si no, es un cuadrado negro
  }
  ctx.globalAlpha = 1;
}

// `camScale` (opcional): empujon de camara del ESCUADRON al CONTROL LIBRE — agranda SOLO el
// sprite del avion. Acercarse escalando el raster ya dibujado esta prohibido en este juego
// (parte el mar en rayas, ver CAM_ZOOMS en game.js); esta es la version que el plano puede pagar.
/** LA SOMBRA, y la MISMA para el lider y para el escuadron.
 *
 *  Tres barras que se angostan en vez de un rectangulo: a esta resolucion eso ya lee como una
 *  elipse. El alfa cae con la altura porque la sombra es la REFERENCIA DE ALTURA del juego — es
 *  como se ve que estas bajando— y no se apaga nunca del todo (piso 0.08): un avion sin sombra
 *  no se lee como alto, se lee como despegado del mundo.
 *
 *  `f` es la escala del que la proyecta (1 = el lider, que vive clavado en PZ). Esta exportada
 *  por el mismo motivo que `drawGear`: el escuadron dibujaba SU PROPIA sombra —una sola barra,
 *  alfa fijo y apagandose por encima de y=6— asi que en cuanto despegaban se quedaban sin ella
 *  mientras el lider conservaba la suya. Dos rutinas para la misma cosa es un escuadron con dos
 *  aviones distintos, y la que no se mira se pudre. */
export function drawShadow(wx, wy, z, f) {
  f = f || 1;
  const sh = proj(wx, 0, z);
  const r = Math.max(0.7, f);                       // el grosor acompaña, pero no se colapsa
  ctx.globalAlpha = Math.max(0.08, 0.4 - wy * 0.009);
  px(sh.x - 9 * f, sh.y - r, 18 * f, 1, '#101c1e');
  px(sh.x - 13 * f, sh.y, 27 * f, 1, '#101c1e');
  px(sh.x - 9 * f, sh.y + r, 18 * f, 1, '#101c1e');
  ctx.globalAlpha = 1;
}

export function drawPlane(selPlane, viewMouse, camScale) {
  const s = proj(plane.x, plane.y, PZ);
  // EL CRUCE (PLAN_TRANSONICO V3): las rayas van en coordenadas de MUNDO y SIN la rotacion del
  // alabeo — rayan la pantalla, no el avion. Por eso se dibujan aca arriba, antes del save() que
  // traslada y rota. Su reloj es propio y corre con el dt real: el cruce no se dilata con el
  // MOMENTUM porque es una cosa que le pasa a la camara, no al mundo.
  drawCruce(s.x, s.y, Math.min(0.05, run.dtReal || 0.016));
  drawShadow(plane.x, plane.y, PZ, 1);
  const sh = proj(plane.x, 0, PZ);   // la rociada y las cortinas se miden contra la misma sombra
  // ROCIADA: el avion levanta agua al pasar rasante. Antes eran DOS BARRAS planas cruzando la
  // pantalla; ahora es una lengua de agua bajo el fuselaje, dos brazos en V que se abren hacia
  // atras y gotas sueltas — que es como se lee el agua batida en pixel art.
  const churn = Math.max(0, 1 - plane.y / 7);
  if (churn > 0 && S.state === 'play' && cfg.terrain !== 'land') {
    const pulse = 0.8 + 0.2 * Math.sin(run.t * 22);           // el chorro late, no es una calca
    // LENGUA central: el agua que el avion levanta justo debajo, con cresta blanca arriba
    ctx.globalAlpha = churn * 0.9;
    px(sh.x - 5, sh.y - 2, 10, 1, P.crest);
    px(sh.x - 4, sh.y - 1, 8, 2, P.foam);
    // BRAZOS en V: se abren y se apagan hacia atras, con el borde de arriba mas claro
    for (let i = 1; i <= 5; i++) {
      const w = (2 + i) * pulse, o = 4 + i * 4, yy = sh.y + i * 1.3;
      ctx.globalAlpha = churn * (0.6 - i * 0.09);
      px(sh.x - o - w, yy, w, 1, P.foam);
      px(sh.x + o, yy, w, 1, P.foam);
      if (i <= 2) {                                           // cresta iluminada del brazo
        ctx.globalAlpha = churn * 0.5;
        px(sh.x - o - w, yy - 1, w * 0.6, 1, P.crest);
        px(sh.x + o + w * 0.4, yy - 1, w * 0.6, 1, P.crest);
      }
    }
    // GOTAS: dos tamaños y dos tonos — sin esto la rociada se lee como una mancha uniforme
    for (let i = 0; i < 7; i++) {
      const dx = (Math.random() - 0.5) * 46, dy = Math.random() * 8 - 2;
      ctx.globalAlpha = churn * (0.5 + Math.random() * 0.5);
      px(sh.x + dx, sh.y + dy, Math.random() < 0.3 ? 2 : 1, 1, Math.random() < 0.45 ? P.crest : P.foam);
    }
    // CORTINAS DE PUNTA DE ALA (SPEC_AGUA_OLAS F3.1). El agua que las puntas arrancan de la
    // superficie cuando vas DE VERDAD a ras. Empieza en RAS_ALT y no en el 7 de la rociada, y
    // ese numero no es decorativo: 4.5 es el techo de la banda del x10 (el mismo de `rasNow` en
    // systems/flight.js). O sea que las cortinas son el INSTRUMENTO de la banda — cuando las
    // ves, estas cobrando; cuando se apagan, saliste. El HUD te lo dice con un numero; esto te
    // lo dice sin que despegues la vista del pasillo.
    //
    // NO SON LOS VORTICES DE PUNTA DE ALA de `tipTrail`, que el autor dejo apagados a proposito
    // (commit e8ccbd1). Aquellos son condensacion con turbo, a cualquier altura y en cualquier
    // terreno; estos son AGUA, solo sobre agua y solo a ras. Si tampoco convencen, se apagan
    // igual: es este bloque y nada mas.
    const ras = Math.max(0, 1 - plane.y / RAS_ALT);
    if (ras > 0) {
      const gordo = run.boost ? 1.7 : 1;                    // con turbo arranca mas agua
      for (const sg of [-1, 1]) {
        const bx = sh.x + sg * TIP_X;
        for (let i = 0; i < 4; i++) {
          // la cortina se abre HACIA AFUERA y HACIA ATRAS, y se apaga con la edad: es una
          // cortina, no un chorro — el agua se despega de la punta y queda atras
          const f = i / 3;
          ctx.globalAlpha = ras * gordo * (0.55 - f * 0.32);
          const w = (2 + f * 5) * gordo;
          px(bx + sg * f * 5, sh.y - 2 + f * 4, w, 1, f < 0.4 ? P.crest : P.foam);
        }
        // gotas sueltas arrancadas de la punta
        if (Math.random() < 0.6 * gordo) {
          ctx.globalAlpha = ras * 0.7;
          px(bx + sg * (2 + Math.random() * 9), sh.y - 3 + Math.random() * 7, 1, 1, P.crest);
        }
      }
    }
    // ERUPCION DE ROCE (F3.2): mientras el avion RASPA la superficie —el reloj de gracia
    // corriendo— el agua no se levanta, EXPLOTA. Es el unico feedback visual que dice "esto se
    // esta consumiendo" sin mirar un instrumento, y va aca y no en el HUD por eso mismo.
    if (run.scrapeT > 0 && run.scrapeVib > 0) {
      const er = Math.min(1, run.scrapeVib);
      for (let i = 0; i < 9; i++) {
        const dx = (Math.random() - 0.5) * 30, dy = -Math.random() * 9;
        ctx.globalAlpha = er * (0.35 + Math.random() * 0.55);
        px(sh.x + dx, sh.y + dy, Math.random() < 0.35 ? 2 : 1, Math.random() < 0.3 ? 2 : 1,
           Math.random() < 0.6 ? '#f4fbff' : P.crest);
      }
      ctx.globalAlpha = er * 0.85;                          // el cuello del chorro, pegado al avion
      px(sh.x - 7, sh.y - 4, 14, 2, P.foam);
    }
  }
  ctx.globalAlpha = 1;

  ctx.save();
  // VUELO VIVO (nunca queda congelado): bob vertical de dos frecuencias + deriva horizontal
  // desfasada (flota en "8") + micro-oscilacion de alabeo de dos armonicos (respira, no es un
  // metronomo). Todo se apaga fuera de 'play'. Perillas: BOB_Y / BOB_X / WOBBLE (arriba).
  const alive = S.state === 'play';
  const bobY = alive ? Math.sin(run.t * 3.1) * BOB_Y * 0.6 + Math.sin(run.t * 1.7) * BOB_Y * 0.4 : 0;
  const bobX = alive ? Math.sin(run.t * 2.3 + 1.1) * BOB_X : 0;
  const wob  = alive ? (Math.sin(run.t * 2.3) * 0.7 + Math.sin(run.t * 3.7) * 0.3) * WOBBLE : 0;
  // VIBRACION al rozar la superficie: temblor rapido del fuselaje (el avion, no la camara)
  const vx2 = run.scrapeVib ? (Math.random() - 0.5) * 4.8 * run.scrapeVib : 0;
  const vy2 = run.scrapeVib ? (Math.random() - 0.5) * 3.6 * run.scrapeVib : 0;
  ctx.translate(s.x + vx2 + bobX, s.y - bobY + vy2);
  // cabeceo: el morro sube al trepar / baja al caer (desplazamiento vertical del sprite)
  ctx.translate(0, -plane.pitch * 1.8);
  // alabeo: rotación 2D + micro-wobble; el foreshortening en X finge la inclinación 3D del ala
  const bank = Math.max(-1, Math.min(1, plane.bank));
  const pl = PLANES[selPlane];
  const useSheet = pl.sheetOk;   // sprite HORNEADO: el alabeo lo traen los frames
  // EL TONEL, ahora una entrada del catalogo como cualquier otra (data/moves.js). Se lo sigue
  // preguntando aparte porque es la unica pirueta que gira el sprite ENTERO 360°: pose centrada y
  // pulso de escala. El angulo ya no se recalcula aca — lo trae `run.mvRoll`, escrito por el motor.
  const rolling = run.mv === 'tonel';
  // HORIZONTE GIRATORIO: con cfg.horizon prendido, el giro de la pirueta ya se lo comio el MUNDO
  // (game.js rota el fondo entero) y el avion tiene que quedar DERECHO, como visto desde una
  // camara que rola con el. hz vale justo lo que hay que restar. Con FIJO vale 0 y todo esto se
  // comporta igual que siempre. Ver core/horizon.js.
  const hz = hzSprite();
  // EL GIRO TOTAL DEL SPRITE, resuelto en UN SOLO LUGAR.
  //
  // Antes cada rama llamaba a `ctx.rotate` por su cuenta y el angulo se perdia ahi adentro. La
  // ESTELA DE PUNTA DE ALA se dibuja despues del `restore()`, en coordenadas de mundo, asi que
  // necesita este mismo angulo para saber donde quedo el ala — y no teniendolo se quedaba
  // HORIZONTAL mientras el avion daba un tonel, que es justo cuando mas se la mira.
  //   · tonel     360° en el plano de pantalla (el sprite es vista trasera)
  //   · mvRoll    medio tonel del split-s / sobre-banqueo del break turn
  //   · con hoja  solo micro-wobble: el alabeo REAL lo traen los frames, no una rotacion
  // LA POSE, resuelta aca arriba por el mismo motivo: la estela lee TIPS[fila][columna] y tiene
  // que ser LA MISMA pose que el sprite dibuja, no una copia de la formula que pueda quedar vieja.
  const colPose = rolling ? (SHEET_NF - 1) / 2 : Math.round((1 - bank) / 2 * (SHEET_NF - 1));
  const pcPose = Math.max(-1, Math.min(1, plane.pitch));
  const rowPose = pcPose > 0.33 ? 0 : pcPose < -0.33 ? 2 : 1;
  const prRoll = rolling ? Math.min(1, run.mvT / MOVES.tonel.dur) : 0;   // 0→1 durante el tonel
  const spinTot = rolling ? run.mvRoll + hz
    : run.mvRoll ? run.mvRoll + hz + wob
    : useSheet ? wob
    : bank * 0.42 + wob;
  ctx.rotate(spinTot);
  if (rolling) ctx.scale(0.94 + 0.06 * Math.cos(prRoll * Math.PI * 2), 1);   // leve pulso: vende el giro
  else if (!run.mvRoll && !useSheet) ctx.scale(1 - Math.abs(bank) * 0.26, 1 - plane.pitch * 0.05);
  // Todo este bloque esta authorado para la grilla de 320x180 (fogonazos, fallback de rects,
  // sangre), asi que se escala por U. Las HOJAS ya vienen horneadas a 1.5x, por eso se dibujan
  // a SHEET_FW/U: ocupan lo mismo en pantalla pero con 1.5x mas pixeles de fuente.
  ctx.scale(U, U);
  // con TURBO el avion se ACHICA un poco: acompaña a la camara que sube (ver flight.js) y remata
  // la sensacion de que el avion se despega de vos. Interpolado para que no sea un salto.
  boostSc += ((run.boost ? 0.92 : 1) - boostSc) * 0.08;
  const ff = stepFlame();   // una sola vez por cuadro: las tres ramas de dibujo la comparten
  const sc = PLANE_SCALE * boostSc * (camScale || 1);
  const spW = SHEET_FW / U * sc, spH = SHEET_FH / U * sc;
  // EL CONO TRANSONICO (PLAN_TRANSONICO V2), DETRAS del sprite: es aire condensado alrededor del
  // avion, asi que el avion va adentro de la nube y no tapado por ella. Va aca —antes de las tres
  // ramas de dibujo— para que salga igual con hoja, con sprite viejo o con el fallback de rects.
  if (alive) drawCono(spW, spH, run.spd, run.t);
  // media altura del CUERPO del avion (sin el aire del frame): a esto se pega la llama del turbo
  if (useSheet) {
    ctx.imageSmoothingEnabled = false;   // pixel art nítido (el save/restore de afuera lo repone)
    // COLUMNA por alabeo. bank>0 = va a la DERECHA → tiene que banquear a la derecha, pero
    // los frames del modelo 3D giran en sentido opuesto al canvas, asi que se INVIERTE el
    // signo (esto corrige el "giraba para el lado contrario"). Nivelado = columna central.
    const col = colPose;
    // FILA por cabeceo. pitch>0 = trepa (morro arriba) → fila 0; nivel → 1; picada → 2
    let row = rowPose;
    // POSE EMPINADA de pirueta (run.mvSteep): usa la HOJA 2 (±32° de cabeceo) si cargo; sin
    // ella (build web) cae a la fila normal de trepada/picada — la maniobra se juega igual.
    // LA SKIN DEL PILOTO QUE VA HOY EN ESTE AVION. En campaña arrancas siendo TERO, y cada
    // relevo te sube al avion del que sigue: el numeral avanza y la marca del ala CAMBIA sola.
    // Es la unica señal en pantalla de que ya no estas volando tu avion. Fuera de campaña no
    // hay roster y `sk` es null, asi que se usa la hoja generica de siempre.
    const sk = rosterActive() ? skinOf(pilotName(pilotIdx(run.squad, run.lives))) : null;
    let img = sk ? sk.sheetImg : pl.sheetImg;
    const hoja2 = sk ? sk.sheet2Img : (pl.sheet2Ok ? pl.sheet2Img : null);
    if (run.mvSteep && hoja2) { img = hoja2; row = run.mvSteep > 0 ? 0 : 1; }
    else if (run.mvSteep) row = run.mvSteep > 0 ? 0 : 2;
    const sx4 = col * SHEET_FW, sy4 = row * SHEET_FH;
    // fantasmas de la pirueta: 2 copias retrasadas en el giro, translucidas
    if (rolling) for (let gi = 2; gi >= 1; gi--) {
      ctx.save();
      ctx.rotate(-run.rollDir * gi * 0.55);
      ctx.globalAlpha = 0.14;
      ctx.drawImage(img, sx4, sy4, SHEET_FW, SHEET_FH, -spW / 2, -spH / 2, spW, spH);
      ctx.restore();
    }
    // POSTQUEMADOR pegado a la TOBERA. Antes salia de spH/2 (el borde del frame) y al pasar el
    // frame a cuadrado la llama quedo flotando 12 px detras del avion.
    // ORDEN DE CAPAS. Los FOGONAZOS van DEBAJO del avion: la boca del canon esta en la raiz del
    // ala, del otro lado del fuselaje, asi que el fuego tiene que asomar por detras y no taparlo.
    // La LLAMA del turbo va ENCIMA: sale de la tobera, que apunta a la camara.
    if (inp.fire && !run.overheat && run.fireT > 0.06) muzzles(bank);
    drawGear(run.gear, 1);   // DEBAJO del sprite: la pata nace dentro del ala y solo se ve lo que asoma
    ctx.drawImage(img, sx4, sy4, SHEET_FW, SHEET_FH, -spW / 2, -spH / 2, spW, spH);
    // LA CHAPERIA, ENCIMA DE LA CHAPA. Va aca —despues del frame y antes de la tobera— porque es
    // pintura sobre el avion, no un efecto en el aire: tiene que taparse con el humo del escape y
    // con el vapor del ala, igual que se taparia la pintura de verdad.
    //
    // Solo en esta rama, que es la del sprite horneado: la pose y la tabla TIPS de la que salen las
    // posiciones existen unicamente aca. Las otras dos ramas son emergencias (la hoja no cargo) y un
    // avion de emergencia sin parches es mejor que parches cayendo al lado del avion.
    parches(spW, spH, TIPS[rowPose][colPose], nivel());
    tobera(0, TOBERA_F * spH, ff, spW / 84 * 2.4);
  } else if (pl.ready) {
    const PW = 54, PH = Math.round(PW * pl.h / pl.w);
    // fantasmas de la pirueta: 2 copias retrasadas en el giro, translucidas (estela cinematica)
    if (rolling) for (let gi = 2; gi >= 1; gi--) {
      ctx.save();
      ctx.rotate(-run.rollDir * gi * 0.55);
      ctx.globalAlpha = 0.14;
      ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
      ctx.restore();
    }
    // mismo orden que arriba: fogonazos detras, llama del turbo adelante
    if (inp.fire && !run.overheat && run.fireT > 0.06) muzzles(bank);
    drawGear(run.gear, 1);
    ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
    tobera(0, TOBERA_F * PH * (84 / 48), ff, PH / 48 * 2.4);
  } else {
    // fallback: sprite de rects (por si la imagen no cargó)
    px(-2, -7, 4, 5, P.bodyDark); px(-1, -8, 2, 2, P.warn);
    px(-20, -1, 40, 3, P.body); px(-20, 0, 6, 2, P.bodyDark); px(14, 0, 6, 2, P.bodyDark);
    px(-3, -3, 6, 6, P.body); px(-2, -4, 4, 2, P.canopy); px(-12, 1, 3, 2, P.accent);
    // el fallback de rects usa LA MISMA tobera que las otras dos ramas: si no, cuando la hoja no
    // carga el avion volveria a tener la antorcha vieja y el juego se contradiria a si mismo
    tobera(0, 3, ff, 1.1);
    if (inp.fire && !run.overheat && run.fireT > 0.06) { px(-16, -2, 3, 2, P.ink); px(13, -2, 3, 2, P.ink); }
  }
  // EL VAPOR DE ALA (PLAN_TRANSONICO V1), DELANTE del sprite: se levanta DEL extrados, o sea que
  // esta entre el ala y la camara. Es el efecto VERIDICO del A-4 — un Skyhawk virando fuerte en el
  // aire humedo del Atlantico lo hacia. La G se aproxima con el alabeo (virar es cargar) mas un
  // empujon fijo durante las piruetas, que son el otro momento en que el avion se carga de verdad.
  if (alive) {
    const gLoad = Math.min(1, Math.abs(bank) * 1.15 + (run.mv ? 0.45 : 0) + (rolling ? 0.3 : 0));
    drawVaporAla(spW, spH, run.spd, gLoad, run.t);
  }
  // mancha de sangre sobre el morro/cabina al atropellar (temporal; hacé un sprite ensangrentado si querés)
  if (run.bloodSplat > 0.02) {
    ctx.globalAlpha = Math.min(0.9, run.bloodSplat);
    px(-4, -2, 2, 1, '#7a1010'); px(-1, -3, 1, 1, '#9a1818'); px(2, -2, 2, 1, '#8a1414');
    px(-2, 1, 1, 1, '#7a1010'); px(4, -1, 1, 1, '#9a1818'); px(0, 0, 1, 1, '#8a1414'); px(-5, 0, 1, 1, '#6a0e0e');
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // LLUVIA CONTRA EL AVION: el salpicado va DESPUES del sprite —el agua rebota sobre el avion, no
  // debajo— y en coordenadas de pantalla, con el avion como centro. La silueta se aproxima con una
  // elipse ANCHA Y CHATA: visto desde atras, el avion es sobre todo ala.
  // El centro incluye bob, vibracion y cabeceo, o sea que el salpicado tiembla con el fuselaje.
  {
    const cx = s.x + vx2 + bobX, cy = s.y - bobY + vy2 - plane.pitch * 1.8;
    // Los factores salen de MEDIR el sprite contra su frame: el frame es de 84 px con aire
    // alrededor, y las puntas de ala caen en ~0.34 de su ancho y la panza en ~0.09 de su alto.
    // Con 0.40/0.13 el agua rebotaba AL LADO del avion, no sobre el.
    // anchorSpray / drawSpray desactivados: el rebote no convencia visualmente
    //
    // DE DONDE SALEN. El 0.34 es el BORDE del ala; el hilo no nace ahi sino un poco adentro (0.24),
    // porque el vortice se enrolla sobre el extremo y no en la punta exacta — y sobre todo porque a
    // 0.34 los dos hilos nacian tan afuera que se leian despegados del avion. Y nacen ABAJO, en la
    // linea de la panza (el mismo 0.09 con el que se anclaba el rebote de lluvia): el ala esta por
    // debajo del centro del frame, y saliendo del centro los hilos flotaban sobre el fuselaje.
    // LOS VORTICES, con DOS intensidades y no una.
    //
    // La regla es del autor: la estela es de las MANIOBRAS. Una pirueta o un tonel es donde el ala
    // carga de verdad y donde el hilo cuenta algo — que estas exprimiendo el avion. El turbo la
    // saca mas floja porque ahi el ala no esta cargada: solo vas mas rapido.
    //
    // Prendida siempre, como estaba antes, el hilo era permanente y dejaba de significar nada.
    const enManiobra = !!run.mv;
    const fuerzaTip = S.state !== 'play' ? 0 : enManiobra ? 1 : (run.boost ? 0.4 : 0);
    // QUITAR — lo que el RENDER vio en este cuadro. Sin esto, un `f=0` no distingue entre
    // "la fuerza dio cero" y "esta funcion ni se llamo", que son dos bugs distintos.
    TIP_DBG.vio = (S.state === 'play' ? 'P' : S.state) + (run.mv || '-') + (run.boost ? 'B' : '');
    TIP_DBG.fz = fuerzaTip;
    // LAS DOS PUNTAS, resueltas igual que el sprite: se leen de la tabla medida para ESTA pose y
    // despues se les aplica EL MISMO giro que se le aplico al dibujo (`spinTot`). Las dos mitades
    // importan: sin la tabla la punta caia en cualquier lado al banquear, y sin el giro la estela
    // se quedaba horizontal mientras el avion rolaba.
    //
    // OJO CON EL ESPACIO: esto corre DESPUES del `restore()`, o sea en pixeles de MUNDO, y el
    // sprite se dibujo con `spW`/`spH`. Las fracciones van contra ESO y nada mas.
    const T = TIPS[rowPose][colPose];
    const cs = Math.cos(spinTot), sn = Math.sin(spinTot);
    const gx = (fx, fy) => cx + fx * spW * cs - fy * spH * sn;
    const gy = (fx, fy) => cy + fx * spW * sn + fy * spH * cs;
    tipTrail(gx(T[0] * TIP_OUT, T[1]), gy(T[0] * TIP_OUT, T[1]),
             gx(T[2] * TIP_OUT, T[3]), gy(T[2] * TIP_OUT, T[3]), fuerzaTip);
  }

  // mira: en el MOUSE (PC, punteria libre) o adelante del avion (tactil/legacy)
  if (S.state === 'play') {
    const vm = viewMouse();
    // MIRA FIJA: acompaña al CABECEO — si la trompa sube, el punto de mira sube; si pica, baja.
    // Se corre el punto en coordenadas de MUNDO (no en pantalla) para que la perspectiva lo
    // escale sola. Con la mira LIBRE (mouse/stick) no se toca: ahi manda el jugador.
    //
    // SE DIBUJA CON sx/sy, NO CON x/y (ver viewMouse en game.js): x/y son "a que le apuntas" —
    // llevan deshecho el giro del horizonte para desproyectar al mundo—, y usarlas para dibujar
    // despegaba el reticulo del cursor apenas el mundo se inclinaba.
    const c = vm.on ? { x: vm.sx, y: vm.sy } : proj(plane.x, plane.y + plane.pitch * AIM_PITCH, 70);
    // MIRA elegible desde el menu [M] (cfg.mira, 1..9). Si la hoja no cargo aun, reticulo vectorial.
    if (!drawMira(cfg.mira, c.x, c.y, MIRA_SIZE, vm.on ? 0.9 : 0.7)) {
      ctx.globalAlpha = 0.7;
      px(c.x - 5, c.y, 3, 1.5, P.accent); px(c.x + 3, c.y, 3, 1.5, P.accent);
      px(c.x, c.y - 5, 1.5, 3, P.accent); px(c.x, c.y + 3, 1.5, 3, P.accent);
      ctx.globalAlpha = 1;
    }
  }
}
