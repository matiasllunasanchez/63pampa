// EL ESTADO RASANTE — quien mueve el aguante (pedido del autor, 12/9).
//
// La matematica esta en core/aguante.js y es pura; aca vive lo que cambia: el estado en el store
// (`run.agu*`), el flanco del gas y las dos maneras de que esto se termine. El vuelo llama a
// `tick` una vez por cuadro y recibe UNA señal —'entra', 'acierta', 'falla', 'sale'— con la que
// pone el beep y el sacudon. Ni un sonido ni un cartel salen de este archivo: la convencion del
// proyecto es que los sistemas devuelven señales y el de arriba decide que hacer con ellas.
//
// EL TOQUE ES EL FLANCO Y NO LA TECLA APRETADA. Al entrar al estado el jugador viene con el gas
// apretado (es como se mantenia a ras), asi que si contara la tecla apretada el primer cuadro ya
// seria un acierto o una falla sin que el haya hecho nada. Contando el flanco, el estado arranca
// pidiendo lo unico que tiene sentido pedir: que suelte y vuelva a dar gas a tiempo.
//
// LA VENTANA ES EL CORAZON (12/9, segunda pasada del pedido). El estado no se sostiene tocando cada
// pasada —eso era machacar— sino manteniendo la ventana abierta: se vacia sola, y cada acierto la
// vuelve a llenar. Mientras quede ventana el avion sigue clavado, como un crucero, y el jugador
// puede dejar pasar una o dos pasadas para mirar el mundo. Dejar pasar el azul ya NO es falla: solo
// deja de reponer, y lo que mata es que el reloj llegue a cero.
//
// TOCAR AFUERA DEL AZUL QUEMA RELOJ. Tiene que costar algo —si no, machacar el gas rellenaria la
// ventana de casualidad y toda la mecanica se caeria— pero no tiene por que matar: se cobra en la
// misma moneda que todo lo demas, y tres errores seguidos la vacian igual. Tocar adentro de una
// pasada ya cobrada no paga NI castiga: castigarlo seria desmentir el dibujo, que muestra el
// indicador adentro del azul.
//
// LAS DOS SALIDAS LIMPIAS —picar, o aguantar el gas apretado un segundo— no castigan: el jugador
// esta diciendo "me llevo lo que gane".
import { run } from '../core/run.js';
import { plane } from '../core/state.js';
import { inp } from '../core/input.js';
import { AGU, ancho, vel, mult, nivel, pos, dentro, sector, ventana, castigo } from '../core/aguante.js';
import { RAS_ALT } from '../data/tuning.js';

const BANDA = 4.5;          // el techo de la banda del x10, el mismo de siempre (core/util.js)
const CLAVO = 12;           // rate del resorte que clava la altura: duro, que de eso se trata

let prevU = false;          // el gas del cuadro anterior, para el flanco
let armado = false;         // el indicador entro al sector y todavia nadie lo toco
// EL DEDO QUE YA VENIA. Al estado se entra casi siempre CON EL GAS APRETADO —es como te mantenias
// a ras—, asi que hasta que el jugador lo suelte no cuenta nada: ni el flanco (seria un toque que
// no dio) ni el reloj de la salida (lo sacaria solo al segundo de haber entrado). Se limpia en
// cuanto suelta, que es el momento en que el gas pasa a ser suyo otra vez.
let esperandoSoltar = false;

export const activo = () => run.aguante === 1;
/** ¿El sector esta ARMADO —el indicador entro y nadie lo toco—? Solo para la sonda `__agudbg`
 *  (QUITAR con ella): es el estado que decide la falla, y sin verlo desde afuera no hay forma
 *  de afirmar que 'tocar afuera' y 'dejarlo pasar' son la misma regla. */
export const armadoDbg = () => armado;

/** La altura a la que el estado clava el avion. La lee el vuelo (vertClavado). */
export const alturaClavada = () => run.aguY;

export function resetAguante() {
  run.aguante = 0; run.aguN = 0; run.aguSec = 0; run.aguF = 0; run.aguHold = 0;
  run.aguY = 0; run.aguGolpe = -9; run.aguVen = 0; run.aguGra = 0;
  prevU = false; armado = false; esperandoSoltar = false;
}

function entrar() {
  run.aguante = 1; run.aguN = 0; run.aguF = 0; run.aguHold = 0; run.aguGolpe = -9;
  run.aguVen = ventana(0);                    // la ventana arranca LLENA: entras con crucero puesto
  run.aguGra = AGU.GRACIA;                    // …y con la gracia puesta, por el dedo que ya venia
  esperandoSoltar = !!inp.u;
  // EL SECTOR ARRANCA SORTEADO, sin anterior del que escapar (el -1 dice "no habia").
  const w = ancho(0);
  run.aguSec = sector(w, Math.random(), -1);
  // …Y EL INDICADOR ARRANCA EN LA PUNTA MAS LEJANA AL SECTOR. Medido: con el sector sorteado en
  // 0,044 y el indicador saliendo de 0, la primera pasada llegaba 0,1 s despues de abrirse el
  // estado — el jugador acababa de entrar y ya habia fallado. Arrancar del otro lado le da media
  // barra de carrera (~0,5 s a la velocidad de entrada) SIEMPRE, sin depender de la suerte.
  run.aguF = run.aguSec + w / 2 < 0.5 ? 1 : 0;
  armado = false;
  // LA ALTURA SE CLAVA DONDE ESTAS, pero no mas abajo que el ras del poder: la marejada llega a
  // 1,9 y clavarse debajo de eso es rozar para siempre. Arriba, el techo de la banda.
  run.aguY = Math.max(RAS_ALT, Math.min(BANDA, plane.y));
}

function salir() {
  run.aguante = 0; run.aguHold = 0; run.aguGra = 0; armado = false; esperandoSoltar = false;
}

/** Un acierto: premio, sector nuevo (lejos del que habia) y la dificultad un paso arriba. */
function acertar() {
  run.aguN++;
  run.aguGolpe = run.t;
  run.aguVen = ventana(run.aguN);             // acertar RELLENA la ventana, que es todo el punto
  run.aguSec = sector(ancho(run.aguN), Math.random(), run.aguSec);
  // EL SECTOR NUEVO ARRANCA DESARMADO, incluso si cae justo donde ya esta el indicador: si se
  // armara ahi, el jugador tendria que acertar una pasada que ya empezo —a veces con un cuadro de
  // margen— y eso es una moneda, no dificultad. Se arma cuando el indicador entre de nuevo.
  armado = false;
}

/** Un cuadro del aguante. `enBanda` es "la altura sigue siendo de PERFECTO".
 *  Devuelve 'entra' | 'acierta' | 'falla' | 'sale' | null. */
export function tickAguante(dt, enBanda) {
  const u = !!inp.u;
  const flanco = u && !prevU;
  prevU = u;

  if (!activo()) {
    // LA PUERTA: cuatro segundos de PERFECTO. `run.streak` los cuenta en el vuelo, con su gracia
    // de siempre para que un bob corto no arruine la carga.
    if (enBanda && run.streak >= AGU.CARGA) { entrar(); return 'entra'; }
    return null;
  }

  if (!u) esperandoSoltar = false;            // solto: el gas vuelve a ser suyo
  run.aguGra = Math.max(0, run.aguGra - dt);

  // SALIRSE A PROPOSITO. Picar es inequivoco y sale ya. Aguantar el gas apretado un segundo es la
  // otra puerta — pero SOLO si la apretada empezo despues de entrar: si contara la que ya venia,
  // entrar con el gas puesto te sacaria solo un segundo despues, sin que el jugador pida nada.
  if (inp.d) { salir(); return 'sale'; }
  run.aguHold = u && !esperandoSoltar ? run.aguHold + dt : 0;
  if (run.aguHold >= AGU.SALIR_S) { salir(); return 'sale'; }

  // PERDER LA ALTURA TAMBIEN TERMINA EL ESTADO, y no es falla: puede pasarte por una ola, por una
  // pirueta o porque el poder rasante te levanto. No hay premio que quitar mas alla de cortarlo.
  if (!enBanda) { salir(); return 'sale'; }

  const w = ancho(run.aguN);
  const antes = pos(run.aguF);
  run.aguF += vel(run.aguN) * dt;
  const ahora = pos(run.aguF);
  const estabaDentro = dentro(antes, run.aguSec, w);
  const estaDentro = dentro(ahora, run.aguSec, w);
  // EL ARMADO ya no decide la falla —eso lo hace la ventana— y queda para una sola cosa: que una
  // pasada se cobre UNA vez. Se arma al entrar al sector y se desarma con el toque.
  if (!estabaDentro && estaDentro) armado = true;

  if (flanco && !esperandoSoltar && run.aguGra <= 0) {
    if (estaDentro && armado) { acertar(); return 'acierta'; }
    if (estaDentro) return null;                           // pasada ya cobrada: ni paga ni castiga
    // TOCAR AFUERA DEL AZUL QUEMA RELOJ, no mata. La ventana es la unica moneda del estado, asi
    // que el error se cobra ahi: si lo que quedaba no alcanza para pagarlo, se cierra y ES la
    // falla — pero es la MISMA falla de siempre, y el jugador la vio venir en la barra.
    run.aguVen = Math.max(0, run.aguVen - castigo(run.aguN));
    if (run.aguVen <= 0) { salir(); run.streak = 0; return 'falla'; }
    return 'castigo';
  }

  // EL RELOJ DE LA VENTANA. Se vacia con el dt del mundo, como todo lo que se cuenta en segundos
  // de juego, y al llegar a cero el crucero se corta: es la MISMA falla que tocar afuera, con la
  // diferencia de que esta se veia venir. El jugador tuvo la barra de abajo avisandole.
  run.aguVen = Math.max(0, run.aguVen - dt);
  if (run.aguVen <= 0) { salir(); run.streak = 0; return 'falla'; }
  return null;
}

/** EL MULTIPLICADOR y EL ESCALON que le toca al vuelo mientras el estado esta puesto. */
export const multAguante = () => mult(run.aguN);
export const nivelAguante = () => nivel(run.aguN);

/** EL RESORTE QUE CLAVA LA ALTURA. No es el del poder rasante —ese es blando y te deja trepar con
 *  el gas, porque ahi el gas sigue siendo gas— : aca el gas es el METRONOMO, y lo que el aguante
 *  paga es justamente que el avion deje de rebotar con cada pulso. De primer orden, como el otro:
 *  la vertical deseada es proporcional al error y no puede pasarse de largo. */
export function vertClavado(dt) {
  const tgt = Math.max(-20, Math.min(18, (run.aguY - plane.y) * CLAVO));
  plane.vy += (tgt - plane.vy) * Math.min(1, dt * CLAVO);
  plane.vy = Math.max(-20, Math.min(18, plane.vy));
}
