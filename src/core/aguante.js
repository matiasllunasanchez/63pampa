// EL AGUANTE DEL RASANTE — la matematica pura del estado RASANTE (pedido del autor, 12/9).
//
// QUE CAMBIA. Hasta hoy volar a ras no era una decision sostenida: bajabas de 4,5 y el
// multiplicador subia SOLO, un escalon cada dos segundos hasta x25, sin nada que hacer mas que no
// trepar. El aguante lo vuelve algo que se SOSTIENE: cuatro segundos de PERFECTO —el doble de lo
// que tardaba un escalon— abren el estado RASANTE, y de ahi en adelante el avion queda CLAVADO a
// la altura (crucero: se va el rebote del pulso de gas) mientras le quede VENTANA. La ventana se
// vacia sola, y acertar el sector azul con un toque de gas la vuelve a llenar y sube el
// multiplicador. No hay que tocar cada pasada —eso era machacar—: hay que tocar antes de que la
// ventana se cierre. Y se pierde por UNA sola cosa: que la ventana se vacie. Tocar afuera del azul
// no mata, quema reloj — tres errores seguidos la vacian igual, asi que machacar sigue siendo
// suicidio, pero un toque nervioso no te borra veinte segundos de vuelo.
//
// POR QUE ES PURO, Y ENTERO. Dificultad, ventana y premio son funciones de UN numero —los aciertos
// acumulados— y nada mas. Eso es lo que deja probar la curva sin abrir el juego (tools/unit.js) y
// tunearla mirando una tabla en vez de cazar constantes por el codigo. El estado vive en el store
// (`run.agu*`) y lo mueve systems/aguante.js; aca no hay un solo dato mutable.
//
// EL NUMERO QUE IMPORTA es `margen(n)`: cuantos SEGUNDOS dura el paso del indicador por el sector
// azul, o sea de cuanto es el margen para acertar. Ancho y velocidad por separado no dicen nada —
// un sector chico con el indicador lento es facil—; el margen es la dificultad de verdad, y por
// eso tiene su propia funcion y su propio test.
//
// Y LA VENTANA ES OTRA COSA: los segundos que el estado se sostiene SOLO, sin que toques nada. Es
// lo que lo convierte en un crucero en vez de un machaque — acertar el azul la vuelve a llenar, y
// mientras le quede tiempo el avion sigue clavado a la altura. No hay que tocar cada pasada: hay
// que tocar ANTES de que se vacie.

export const AGU = {
  CARGA: 4,        // s de PERFECTO seguidos para entrar. El doble de los 2 del escalon viejo.
  // EL SECTOR AZUL, en fraccion de la barra. Arranca en poco mas de un tercio —se acierta sin
  // mirar— y se va cerrando hasta SEC_MIN, que es el piso: mas abajo el sector deja de verse a
  // 24 px de barra y el juego pasa a ser de suerte.
  // SEC_MIN subio de 0,16 a 0,24 y NO es una decision suelta: es lo que paga la velocidad de
  // abajo. El margen es ancho/2·vel, asi que acelerar el indicador sin ensanchar el piso del
  // sector lo dejaba en 38 ms —menos de dos cuadros y medio— o sea una moneda.
  SEC0: 0.36, SEC_MIN: 0.24, SEC_K: 0.025,
  // LA VELOCIDAD del indicador —la barrita negra—, en VUELTAS por segundo (una vuelta = ida y
  // vuelta). Cada vuelta cruza el sector DOS veces, o sea que 1,5 vueltas/s pone una pasada cada
  // ~0,33 s.
  //
  // LA BASE SUBIO EN TRES PASADAS DE PLAYTEST (0,5 → 0,65 → 0,9 → 1,5; el tope, 1,05 → 2,1), y la
  // ultima no fue por gusto: ARREGLA UN TECHO QUE NO ERA DE HABILIDAD. Medido con una simulacion
  // del tick (400 corridas por celda), un jugador con 15 ms de precision y atencion total moria a
  // los 15 s con CERO toques fallados. No era su culpa: cada acierto MUEVE el sector, el indicador
  // tiene que viajar hasta el nuevo, y a 1,3 vueltas/s ese viaje tardaba hasta 1,20 s contra una
  // ventana de 0,90. Perdia una carrera que no dependia de el.
  //
  // Acelerar el indicador acorta ESE viaje (max 1,20 → 0,72 s) y por eso la velocidad es la perilla
  // correcta y no la ventana: a 1,5 el experto sostiene la fase entera de t15 (116 s) el 100% de
  // las veces, y con la atencion dividida —esquivando, disparando— se cae a los ~19 s. Que es
  // exactamente el reparto que pide el diseno: el techo lo pone la ATENCION, no la aritmetica.
  //
  // MAS RAPIDO NO ES MEJOR: a 1,8/2,5 el experto baja a 92%, porque ahi el margen se vuelve el
  // cuello de botella. 1,5/2,1 es el punto donde las dos curvas se cruzan.
  VEL0: 1.5, VEL_MAX: 2.1, VEL_K: 0.04,
  SEP: 0.22,       // lo que como MINIMO se corre el sector nuevo respecto del que habia
  // LA VENTANA, en segundos. Arranca en tres —casi seis pasadas, o sea cerca de TRES idas y
  // vueltas enteras— y se cierra hasta menos de uno. Es la perilla del "cuanto te podes distraer", que es
  // lo que decide si el estado se siente como un crucero o como un machaque.
  VEN0: 3, VEN_MIN: 0.9, VEN_K: 0.16,
  // EL PREMIO. Arranca en el x10 de la banda (el mismo de siempre) y sube de a poco: el tope es
  // x40 y antes eran x25, o sea que el techo subio, pero ahora hay que ganarselo golpe a golpe.
  MULT: 10, MULT_PASO: 3, MULT_TOPE: 40,
  // LOS ESCALONES QUE VE LA FISICA siguen siendo cuatro: `speedTarget` acelera con `rasLevel` 0..4
  // y esa curva no se toca (la mide tools/unit.js). Lo que cambio es COMO se sube, no el efecto.
  NIVEL_TOPE: 4,
  SALIR_S: 1,      // s con el gas apretado para salirse a proposito, sin castigo
  // LA GRACIA DE LA ENTRADA. Venis bombeando el gas para no rebotar contra el agua; el estado se
  // abre, el avion se clava —o sea que el gas ya no hace falta— pero tu dedo YA SALIO. Sin esto,
  // ese toque cae afuera del azul y te saca en el mismo instante en que entraste: el reflejo que
  // te mantuvo vivo los cuatro segundos anteriores se vuelve el que te mata.
  GRACIA: 0.5,
  // EL CASTIGO por tocar afuera, en fraccion de la ventana entera. Un toque errado ya no mata: te
  // quema reloj. Asi queda UNA sola forma de perder —que la ventana llegue a cero— y el que
  // machaca muere igual, porque tres toques malos se la comen (ver `castigo` y su test).
  CASTIGO: 0.35,
};

/** El ancho del sector azul con `n` aciertos encima. */
export const ancho = n => Math.max(AGU.SEC_MIN, AGU.SEC0 - n * AGU.SEC_K);

/** Vueltas por segundo del indicador con `n` aciertos encima. */
export const vel = n => Math.min(AGU.VEL_MAX, AGU.VEL0 + n * AGU.VEL_K);

/** El multiplicador con `n` aciertos encima. */
export const mult = n => Math.min(AGU.MULT_TOPE, AGU.MULT + n * AGU.MULT_PASO);

/** El escalon que ve la fisica (0..4), para que la velocidad siga escalando como siempre. */
export const nivel = n => Math.min(AGU.NIVEL_TOPE, Math.max(0, n));

/** SEGUNDOS de margen para acertar con `n` aciertos encima: lo que tarda el indicador en cruzar el
 *  sector. El indicador recorre 2 unidades por vuelta, de ahi el 2. Es la curva de dificultad. */
export const margen = n => ancho(n) / (2 * vel(n));

/** SEGUNDOS QUE DURA LA VENTANA con `n` aciertos encima: lo que el estado se sostiene sin tocar
 *  nada. Se achica MAS RAPIDO de lo que se achica el intervalo entre pasadas, porque si no la
 *  escalada iria para atras: al acelerar el indicador las pasadas llegan mas seguido, asi que una
 *  ventana fija dejaria saltear cada vez MAS pasadas. Medido en pasadas salteables, la curva va de
 *  "podes saltear 5 de cada 6" a "podes saltear 1 de cada 2". */
export const ventana = n => Math.max(AGU.VEN_MIN, AGU.VEN0 - n * AGU.VEN_K);

/** LO QUE CUESTA un toque afuera del azul, en segundos de ventana. Es fraccion de la ventana
 *  ENTERA y no un numero fijo: con un fijo, el mismo error costaba un tercio al entrar y casi todo
 *  en la meseta, o sea que el castigo crecia solo justo cuando ya es dificil. */
export const castigo = n => ventana(n) * AGU.CASTIGO;

/** Cuantos toques afuera del azul hacen falta para vaciar una ventana llena. */
export const toquesMalos = n => Math.ceil(ventana(n) / castigo(n));

/** Cuantas pasadas del indicador entran en la ventana: la forma legible de leer la dificultad. */
export const pasadasSalteables = n => ventana(n) * 2 * vel(n);

/** LA POSICION DEL INDICADOR (0..1) para una fase acumulada `f` en vueltas. Triangular y no seno:
 *  con un seno el indicador frena en las puntas y se queda quieto justo donde no pasa nada, y en
 *  el medio va al doble. A velocidad constante la ventana dura lo mismo en cualquier sector, que
 *  es lo que permite sortear el sector al azar sin que la dificultad cambie con la suerte. */
export const pos = f => { const u = ((f % 2) + 2) % 2; return u <= 1 ? u : 2 - u; };

/** ¿La posicion `p` cae adentro del sector que arranca en `s` y mide `w`? */
export const dentro = (p, s, w) => p >= s && p <= s + w;

/** UN SECTOR NUEVO, LEJOS DEL ANTERIOR (pedido: "nunca debe estar en el mismo sector").
 *
 *  `r` es el sorteo (0..1) y `prev` el arranque del sector que habia (negativo = no habia). El
 *  hueco prohibido alrededor de `prev` se SALTEA mapeando `r` sobre lo que queda libre, en vez de
 *  sortear de nuevo hasta que caiga bien: un rechazo puede no terminar nunca, y con la barra casi
 *  llena de sector (los primeros aciertos) el espacio libre es justo. */
export function sector(w, r, prev) {
  const tope = Math.max(0, 1 - w);                    // el arranque mas a la derecha posible
  const u = Math.max(0, Math.min(1, r));
  if (prev === null || prev === undefined || prev < 0) return u * tope;
  const sep = Math.min(AGU.SEP, tope / 2);            // con la barra apretada, la mitad y listo
  const a = Math.max(0, prev - sep), b = Math.min(tope, prev + sep);
  const libre = a + (tope - b);
  if (libre <= 0) return u * tope;                    // no quedo lugar: cualquiera sirve
  const x = u * libre;
  return x < a ? x : b + (x - a);
}
