// CONSTANTES DE AJUSTE del momentum, compartidas entre la logica (game.js) y el render
// (render/momentum.js). Viven aca para que haya UNA sola fuente: si estuvieran duplicadas,
// cambiar una y olvidar la otra desalinearia el dibujo de la jugabilidad sin que nada avise.
//
// Son las perillas para tunear el climax: subir/bajar y volver a probar.

// ZONA DE VUELO. El techo alto (FLY_TOP) es lo que da margen para picar y ganar velocidad (ver
// ENERGY_* en core/physics.js). SPAWN_X acompaña a FLY_X: si los obstaculos nacieran mas angostos
// que la zona de vuelo, bastaria irse al costado para esquivarlos todos. Compartidas por el vuelo
// (limites del avion) y el spawn (ancho del carril de obstaculos).
//
// ESO ES EXACTAMENTE LO QUE PASABA, y el comentario de arriba lo venia prediciendo desde antes de
// que ocurriera: con SPAWN_X = 33 contra FLY_X = 38 quedaba una franja de 5 unidades a cada lado
// donde no nacia NADA. Un obstaculo de tierra alcanza 4,7 (semi-ancho 2,6 + semi-envergadura 2,1)
// y uno aereo 5,1, asi que desde el borde no llegaban a tocarte ni naciendo en el carril extremo.
// Medido: en el centro morís a los 6-15 s sin esquivar; pegado a la punta sobrevivías 26 s sin
// tocar una tecla. Era el pasillo entero resuelto quedandose quieto en una esquina.
//
// SPAWN_X pasa a ser FLY_X + SPAWN_EDGE. El margen extra NO es adorno: sin el, el borde igual
// queda a MITAD de densidad que el centro —de un lado no hay de donde venir— y volar pegado a la
// pared seguiria siendo la jugada barata. Sembrando un poco mas afuera, el borde ve la misma
// cantidad de obstaculos que el medio y la esquina deja de ser refugio.
export const FLY_X = 38, FLY_TOP = 68;

// EL TECHO DE LA BANDA DEL x10 — el numero mas replicado del juego, y ahora el unico.
//
// Volar por debajo de esta altura paga x10 (core/util.js, multOf), carga el poder RASANTE (game.js),
// abre el estado del aguante (systems/flight.js) y lo clava ahi (systems/aguante.js). Y ademas
// AVISA por los tres sentidos, que es lo que la vuelve legible sin leer el HUD: las cortinas de agua
// (CORTINA_ALT), el escalon de gotas del rocio (systems/vuelo.js), la capa de agua cerca
// (systems/audio.js) y la franja del altimetro (render/hud.js).
//
// ESTABA ESCRITO A MANO EN NUEVE LUGARES. Hoy coincidian; el dia que alguien moviera uno, el juego
// le mentia al jugador en silencio —ver las cortinas y cobrar x5— sin romper ninguna prueba.
//
// ⚠ NO ES `RAS_ALT` (2,4), que es la altura a la que el PODER asienta el avion: esa vive ADENTRO de
// esta banda. Los dos ya convivieron con el mismo nombre en archivos distintos y el import
// "natural" de uno rompia al otro. tools/unit.js vigila las dos cosas: que la banda sea una sola, y
// que RAS_ALT siga quedando abajo.
export const BANDA_ALT = 4.5;

// EL TECHO DE PERFECTO — mas alto que la banda, y a proposito (15/9).
//
// Hasta hoy el estado RASANTE se cargaba y se sostenia en la MISMA franja que paga el x10, y eso
// lo volvia finisimo: el clavado te deja sin eje vertical, asi que una ola que pasara de 4,5 te
// sacaba del estado sin que pudieras hacer nada. Con metro y medio de aire, entrar deja de ser un
// pulso de precision y pasa a ser una decision.
//
// ⚠ NO ES LA BANDA, y es justamente el tipo de 4,5 que el dia que se unifico la banda se dejo
// documentado como "podrian separarse algun dia". Este es ese dia: el x10 sigue terminando en
// BANDA_ALT y lo que se movio es OTRA cosa. Si alguien los vuelve a igualar, que sea a proposito.
//
// Consecuencia que hay que conocer: adentro del estado el multiplicador lo da el aguante y no la
// altura, asi que entre 4,5 y 6 se puede cobrar por encima del x10 estando fuera de la banda. Lo
// compensa el clavado, que te asienta de vuelta adentro (`run.aguY` topea en BANDA_ALT).
export const PERF_ALT = 6;
export const SPAWN_EDGE = 6;              // ~el alcance de un obstaculo aereo (3 + 2,1 del avion)
export const SPAWN_X = FLY_X + SPAWN_EDGE;
// EL CARRIL SE ENSANCHO, ASI QUE LA CADENCIA SE COMPENSA. El caudal de obstaculos se mide por
// DISTANCIA, no por ancho: repartir los mismos obstaculos en un carril mas ancho baja la densidad
// que el jugador siente (medido: 66 → 88 de ancho es 25% menos de probabilidad de cruzarse uno).
// Arreglar un exploit no puede volver el juego mas facil de rebote, asi que el intervalo se acorta
// en la misma proporcion. `SPAWN_X0` es el ancho HISTORICO y esta solo para eso — es la referencia
// contra la que se mantiene la dificultad de siempre.
export const SPAWN_X0 = 33;
export const SPAWN_DENS = SPAWN_X0 / SPAWN_X;   // 0.75: se siembra 1,33x mas seguido

// PROFUNDIDAD DE APARICION: a que z nace todo lo que viene del horizonte (systems/spawn.js). Es
// el ALCANCE DE VISION del juego — mas lejos = mas tiempo para reaccionar, porque el mundo viene
// hacia vos a run.spd y cada unidad de z es tiempo.
//
// 320 y no 250: a 250 un helicoptero entraba en pantalla con 3.7 px de ancho pegado a la linea del
// horizonte, y a velocidad de crucero eso daba menos de 1.5 s de aviso. Con 320 son ~1.9 s.
//
// ⚠ ESTO NO ES EL CAMPO DE VISION (F en render/ctx.js). Bajar F ensancharia el angulo, pero en
// esta proyeccion el tamaño en pantalla es wu*F/z: con menos F TODO se achica, incluido lo que
// se quiere ver antes. Ver mas lejos es sembrar mas lejos, no abrir el angulo.
//
// Las BANDAS DE COMPORTAMIENTO (AA_Z0/AA_Z1, el caza que tira entre 70-190, el alcance de las
// balas en 240) quedaron donde estaban a proposito: los enemigos se VEN antes, pero no empiezan
// a atacarte antes. Mas aviso, la misma agresividad.
export const SPAWN_Z = 320;

// ---------------------------------------------------------------------------------------------
// LA BOMBA DEL AVION — tiro oblicuo (pedido de Matias, 20/9/2026)
//
// Dejo de ser un cohete. Antes salia a 360 fijos, se guiaba sola hacia el blanco enganchado, y ni
// la velocidad ni la trepada del avion entraban en la cuenta: era un boton que acertaba. Ahora se
// SUELTA — nace con el vector del avion y desde ahi solo la toca la gravedad.
//
// EL MARCO DE REFERENCIA ES TODO, y es lo unico dificil de este item. El mundo viene hacia la
// camara a `run.spd`, asi que una bomba que conserva TU velocidad se queda quieta debajo tuyo —
// que es exactamente lo que hace una bomba de verdad—. Lo que la manda adelante es la DIFERENCIA:
//   · el EYECTOR, que la empuja un poco siempre (si no, no se despegaria nunca del morro)
//   · y sobre todo, que VOS FRENES. Soltas el turbo, tiras del morro, y la bomba se va con el
//     envion mientras el avion se queda. Esa es la maniobra que el item viene a premiar.
// Trepar alarga el vuelo (mas tiempo en el aire = mas adelanto). Venir rapido da mas para frenar.
// Las tres cosas del pedido son la MISMA cuenta; no hay un `if` de juego adentro de la fisica.

/** La gravedad de la bomba. Es el 26 que ya estaba, pero escrito a mano adentro de collision.js —
 *  ahora vive donde vive el tuneo. Subirla acorta todos los arcos por igual. */
export const BOMBA_G = 18;

/** EL PLANEO (23/9: "tiene que ir horizontal, no hacia abajo apenas puede"). Los primeros
 *  BOMBA_PLANEO segundos la gravedad entra de a poco, de 0 a BOMBA_G: la bomba sale DERECHO como
 *  salia el misil y recien despues empieza a doblar hacia abajo. Es lo que la hace un tiro
 *  oblicuo y no un ladrillo. */
export const BOMBA_PLANEO = 0.4;

/** EL EYECTOR: lo unico que separa la bomba del avion cuando NO frenas. Es un envion fijo y no un
 *  factor de la velocidad a proposito — con un factor, a 490 (el techo real de `run.spd` con
 *  afterburner: `280 + afterTier*AFTER_CAP`) la bomba se iba 550 unidades adelante, o sea mas
 *  alla de SPAWN_Z, a caer donde todavia no nacio nada. */
export const BOMBA_EYECTOR = 100;   // 23/9: de 20 a 100 — sale disparada hacia adelante, como el misil

/** LA CARGA, COMO UNA GRANADA (27/9: "cuanto mas tiempo mantengo, mas lejos se extiende"). Con la
 *  tecla apretada la carga sube de 0 a 1 en BOMBA_CARGA_T segundos, y al soltar la bomba (o el
 *  tanque) sale con `carga * BOMBA_CARGA_VZ` de empuje hacia adelante DE MAS — que tambien corre el
 *  techo relativo (`extra`), o el integrador se lo recortaria. Un toque seco es la suelta de siempre.
 *  La mira (render/trayectoria.js) crece mientras cargas. */
export const BOMBA_CARGA_T = 1.2;
export const BOMBA_CARGA_VZ = 150;

/** EL ENVION DE LA VELOCIDAD (23/9): la fraccion de `run.spd` que la bomba se lleva DE MAS al
 *  soltarse. Sin esto, al ras y plano daba igual venir a 280 o a 490 — y el pedido era "si voy en
 *  velocidad, mejor". Es chico a proposito: 0.15 a 490 son 73 extra, lejos del techo de abajo. */
export const BOMBA_ENVION = 0.15;

/** TECHO DE LA SEPARACION respecto del mundo, en unidades/s. Frenar de 490 a 62 daria una
 *  diferencia de 428 y la bomba aterrizaria mas alla de la linea de siembra — el jugador
 *  aprenderia a tirarle a la nada. Con este techo el alcance queda adentro del mundo que existe. */
export const BOMBA_REL_MAX = 210;

/** DE DONDE CUELGA: cuanto por debajo del centro del avion nace la bomba. En el centro exacto,
 *  la perspectiva la subia hacia el horizonte y se la veia salir por ARRIBA del avion. */
export const BOMBA_PANZA = 1.2;

/** Cuanto de la deriva lateral del avion se lleva la bomba. No es guiado: es la inercia de que
 *  venias cruzado. Con 1 la bomba se va de carril en un segundo; con 0 cae en la vertical exacta. */
export const BOMBA_DERIVA = 0.5;

/** PASAR POR UNA EXPLOSION (pedido del autor 30/9/2026): "si pasas JUSTO cuando explota, te daña;
 *  si explota a la par, te elimina. Si explota Y LUEGO pasas no pasa nada; si esta un poco mas
 *  cerca del 'luego', deberia quitarte vida nomas". Lo que decide es la EDAD de la explosion cuando
 *  el avion la cruza (segundos de mundo — en camara lenta se estira como todo lo demas):
 *    MATA_T  mas joven que esto: te elimina (estaba explotando a tu lado)
 *    DANA_T  mas joven que esto: te saca vida (`death_onda`, data/damage: un tercio)
 *            mas vieja: humo y fuego, pasas limpio
 *  Y cuan cerca: dentro de su radio de costado, y de `r * ALTO` de alto. Los radios los pone quien
 *  explota (R_GRANDE/R_CHICA para lo que se destruye; la bomba, el suyo en data/bombas.js). */
export const ESTALLIDO = { MATA_T: 0.22, DANA_T: 0.8, ALTO: 1, R_GRANDE: 7, R_CHICA: 4 };

// ALTURA DE DETECCION del radar enemigo: por encima de esto la barra CARGA y por debajo se
// descarga (systems/flight.js). Es el techo del "corredor seguro" — abajo aprietan los
// obstaculos y el roce, arriba aprieta el radar. Vive aca y no suelto en flight.js porque lo
// comparten la deteccion, el overlay de la RED (render/world.js) y el HUD.
// A futuro deberia poder BAJAR por tramo de mision y estrangular el corredor (ROADMAP #27).
//
// 20 y no 30: a 30 el techo estaba tan alto que en la practica no existia — se llegaba tirando
// de la palanca a proposito. A 20 corta por el MEDIO de la banda de los cazas (ver SPAWN_Y), asi
// que subir a pelearles te pinta: el radar deja de ser un castigo por trepar sin motivo y pasa a
// ser el precio de una decision de combate.
export const RADAR_ALT = 20;

// ---------- NIEBLA (systems/fog.js) ----------
// TECHO DEL BANCO. Va APENAS por debajo de RADAR_ALT y ese hueco es el filo del item: entre 17 y
// 20 queda una RENDIJA de 3 unidades donde VES y NO te pintan. No hay codigo que la implemente —
// sale sola de poner los dos umbrales cerca. Tres unidades es poco mas que la altura del avion
// (semieje 1.0), asi que sostenerla con el bob y el viento es una linea de habilidad real; el que
// no la encuentra sube al radar y come misiles, que es lo que el tramo quiere que pase.
// EL BANCO NO APARECE DE GOLPE. Un tramo que se enciende en un metro no se lee como niebla: se
// lee como un filtro que alguien prendio. Con esto la bruma ENTRA (y se va) a lo largo de unos
// metros, y ademas empieza ANTES del borde del banco — o sea que la ves venir, que es lo que un
// banco de niebla hace de verdad. A 85 m/s son ~2 s de fundido.
export const FOG_FADE = 170;   // metros de fundido a cada lado del banco
// SUBIDO de 17 a 19 por pedido del autor ("dale un poco mas de altura"). Ojo con este numero:
// la RENDIJA entre el techo del banco y el piso del radar (RADAR_ALT = 20) es una mecanica —el
// que la encuentra ve sin que lo pinten— y de 3 unidades paso a 1. Sigue existiendo, pero ahora
// hay que hilvanarla fino. Subirlo hasta 20 o mas la cierra del todo: ahi, para ver, hay que
// entrar SI o SI a la zona de radar.
export const FOG_TOP = 19;

// ALCANCE DE VISION dentro del banco, por nivel (0 = sin niebla). Ver fogVis() en systems/fog.js.
//
// SON DOS NUMEROS Y NO UNO, y el porque es la correccion mas importante de este item.
//
// El diseño original decia: "definila en SEGUNDOS de reaccion, no en distancia, asi es la misma
// dificultad a cualquier velocidad". Suena bien y esta mal, porque la referencia contra la que se
// compara —el juego sin niebla— NO es de segundos constantes: los obstaculos nacen SIEMPRE a
// SPAWN_Z = 320, asi que el aviso que da el juego solo ya se achica con la velocidad:
//
//     a spd 110 → 2.8 s de aviso        a spd 344 → 0.89 s
//
// Una niebla de "1.1 s constantes" no recorta NADA a 344 (ya tenias menos que eso): se apaga sola
// justo cuando el juego esta mas dificil. Medido: con la formula vieja, a spd 344 la vision daba
// 378 — mas lejos que donde nacen los obstaculos.
//
//   FOG_FRAC   fraccion de SPAWN_Z que se ve. Esto es lo que hace que la niebla MUERDA siempre:
//              recorta el aviso a la misma PROPORCION a cualquier velocidad.
//   FOG_FLOOR  piso en segundos. Esto es lo que la vuelve justa: por rapido que vayas, nunca te
//              deja con menos de este aviso.
// La vision es el MAYOR de los dos, asi que a velocidad de crucero manda la fraccion (aprieta) y
// a fondo manda el piso (protege).
//
// ⚠ Por debajo de ~0.5 s deja de ser dificultad y pasa a ser una moneda al aire: el choque mata al
// instante, asi que si el obstaculo sale del gris cuando ya no hay maniobra posible el jugador no
// siente que fallo, siente que le toco. Medir con tools/feeltest.js antes de bajar el piso.
export const FOG_FRAC = [0, 0.55, 0.28];
export const FOG_FLOOR = [0, 0.90, 0.55];

// LARGO DEL BANCO, en unidades de run.dist. El largo ES el balance del item: es cuanto tiempo te
// obliga a comer misiles. A velocidad de crucero (~110) estos cuatro son del orden de 5, 8, 14 y
// 21 segundos arriba del radar.
export const FOG_LEN = [500, 900, 1500, 2300];
// Hueco entre bancos, como MULTIPLO del largo. Tiene que alcanzar para recuperar: arriba no cargas
// racha rasante ni afterburner, y esquivar con turbo quema combustible — un tramo de niebla sale
// caro en tres monedas a la vez. Buenisimo de vez en cuando, veneno tres veces por nivel.
export const FOG_GAP = 2.2;
// Dispersion del sorteo de largo y hueco (±18%): si todos los bancos midieran lo mismo, el tramo
// se aprenderia de memoria en vez de leerse en pantalla.
export const FOG_SPREAD = 0.18;

// ALTURAS DEL CIELO: entre que alturas NACE cada cosa que vuela, en unidades de MUNDO (las mismas
// de plane.y, donde el techo de vuelo es FLY_TOP = 68).
//
// Es una TABLA y no literales sueltos en spawn.js porque cada tipo se siembra UNA VEZ POR TERRENO
// (mar / tierra / costa): antes cambiar la altura de un helicoptero eran tres ediciones identicas
// en tres bloques, y olvidarse de una dejaba el cielo distinto segun el mapa sin que nada avise.
//
// LAS CAPAS, de abajo hacia arriba: PAJAROS (ensucian, no matan) · HELICOPTEROS · CAZAS, con el
// radar (RADAR_ALT = 20) cortando por el medio de los cazas. La regla de diseño es que mirar el
// altimetro alcance para saber que te puede pasar: cada banda tiene su amenaza y su precio.
//
// ⚠ ESTO ES DONDE NACEN, NO LA BANDA QUE TE MATA. La colision suma los semiejes de core/hitbox.js
// — los aereos tienen hh 1.6 y el avion ph 1.0 — asi que el contacto real es de ±2.6 alrededor de
// estos numeros:
//     pajaros   5-10  → toca 2.4-12.6 (daño, no muerte)
//     helos    10-15  → LETAL 7.4-17.6
//     cazas    15-25  → LETAL 12.4-27.6
// Al mover un numero de aca, recalcular la banda real antes de decidir si "hay lugar".
//
// El GLOBO conserva su rango historico (6-30) a proposito: es el unico que cruza el techo de
// radar de punta a punta, y esa es justamente su lectura — el estorbo que te empuja a decidir si
// pasas por abajo (seguro) o por arriba (te pinta).
export const SPAWN_Y = {
  // LAS AVES NACEN EN TODA LA COLUMNA DE AIRE, no en una franja. Estaban en [5, 10] —cinco metros
  // de banda— y por eso todas las bandadas parecian la misma a la misma altura. Ahora van de 5 a
  // 26: por arriba pasan el techo del radar (20), asi que hay bandadas que solo se cruzan cuando
  // subiste, y por abajo NO bajan de 5 A PROPOSITO.
  //
  // ESE PISO ES DISEÑO Y NO UN NUMERO SUELTO: la banda del x10 termina en 4.5, y es el corazon del
  // juego —volar pegado al agua es de donde sale el puntaje y de donde se carga el poder RASANTE—.
  // Meter aves ahi seria castigar justo lo que el juego pide que hagas. Las aves pueblan el aire
  // que hoy esta vacio, no el que ya cuesta.
  birds: [5, 26],
  helo: [10, 15],
  jet: [15, 25],
  balloon: [6, 30],
  fuel: [4, 26],
};
/** Altura de nacimiento sorteada para el tipo `t` (ver SPAWN_Y). */
export const spawnY = t => SPAWN_Y[t][0] + Math.random() * (SPAWN_Y[t][1] - SPAWN_Y[t][0]);

// ---------------- EL RUMBO DE LAS BANDADAS ----------------
// Una bandada tenia UN solo movimiento posible —una deriva lateral— y ademas nunca podia estar
// quieta: `bvx` se sorteaba en (-3, 3) y el cero no salia nunca. O sea que todas las aves del
// juego hacian lo mismo, en el mismo eje, para siempre.
//
// Ahora cada bandada sortea un RUMBO en los tres ejes. La proporcion de quietas es una perilla y
// no una casualidad: el pedido fue "algunos si estaticos pero no todos y no siempre", que es
// exactamente una probabilidad.
export const AVES_QUIETAS = 0.28;  // fraccion de bandadas que planean sin trasladarse. No es cero:
                                   // un cielo donde TODO se mueve cansa igual que uno donde nada
                                   // se mueve — lo que da vida es que convivan las dos cosas.
export const AVES_VX = 7;          // u/s de deriva lateral (antes 3, y siempre distinta de cero)
export const AVES_VY = 2.2;        // u/s de subida o bajada. Corto a proposito: un ave que sube
                                   // rapido se lee como un misil, no como un bicho
export const AVES_VZ = 9;          // u/s de acercarse o alejarse. Es una FRACCION de la velocidad
                                   // del mundo (~90): la bandada que viene hacia vos llega un poco
                                   // antes y la que se va te deja pasar — no cambia el pasillo
export const AVES_PISO = 5;        // no bajan de aca: es el techo de la banda del x10 (ver SPAWN_Y)
export const AVES_TECHO = 34;      // ni suben mas que esto: arriba solo queda cielo vacio

/** El rumbo de una bandada, sorteado al nacer. Devuelve las tres velocidades.
 *
 *  LOS EJES SE SORTEAN POR SEPARADO y por eso salen DIAGONALES solas: una bandada que tiene vx y
 *  vy cruza en diagonal sin que haya que escribir el caso "diagonal" en ningun lado. Es la misma
 *  idea que el movimiento propio de los enemigos — la personalidad se sortea una vez y despues
 *  solo se aplica. */
export function rumboAve() {
  if (Math.random() < AVES_QUIETAS) return { bvx: 0, bvy: 0, bvz: 0 };
  // el eje lateral casi siempre participa (es el que mas se lee de frente); los otros dos entran
  // la mitad de las veces, asi que hay bandadas de un solo eje, de dos y de tres
  const eje = (p, v) => (Math.random() < p ? (Math.random() * 2 - 1) * v : 0);
  return { bvx: eje(0.85, AVES_VX), bvy: eje(0.5, AVES_VY), bvz: eje(0.45, AVES_VZ) };
}

// FRAGATA del mar abierto (obstaculo `mast`). ALTO TOTAL en unidades de mundo, de la linea de
// flotacion al techo de la superestructura — donde va la luz roja.
//
// No es un numero elegido a ojo: es la altura a la que se DIBUJA la hoja horneada, medida sobre
// su caja de contenido (render/enemies.js, SHEETS.fragata: 23 px de alto por 39 de ancho, wu 11)
//     23 * 11 / 39 = 6.49
// Tiene que seguir siendo eso, porque la caja de colision del barco sale de aca (core/hitbox.js)
// y el dibujo y el hitbox no pueden discutir: si el barco se rehornea con otra camara, remedir.
export const SHIP_H = 6.5;

// PIRUETA (tonel / aileron roll): duracion de la maniobra. La comparten el vuelo (aplica la
// rafaga lateral), la accion que la dispara (startRoll) y el render (inclina el sprite).
export const ROLL_DUR = 0.55;

// TREN DE ATERRIZAJE: segundos que tarda en plegarse una vez que el avion deja la pista. La
// comparten el despegue (que lo dispara) y el 'play' (que lo termina de recoger si la carrera
// se cortó antes). Cuidado con acortarlo: a esta resolucion el tren mide 4 px y si se recoge en
// menos de medio segundo el jugador no llega a ver el movimiento — solo ve que desaparece.
export const GEAR_T = 0.9;

// DONDE APUNTA EL ARENA VIEJO, en pantalla. Ya NO es una medida del asset de cabina: desde que la
// cabina se acomoda sola (V_VISOR / MIRA_PLENA en legacy/momentum_render.js) esto es la mira del modo y
// el PNG la sigue, igual que en el arena y en la PASADA. Por eso vale el centro y no un numero
// tuneado contra un dibujo.
export const MOM_AX = 240, MOM_AY = 135;
export const MSL_MAX = 3;                 // misiles por pasada

// GEOMETRIA DE LA BARCAZA, en pixeles de PANTALLA (grilla de mundo 480x270). Estos dos numeros
// estaban repetidos en tres lados — momShipGeom (systems/momentum.js), la aproximacion en vuelo
// normal (render/world.js) y la camara 3D (systems/three-world.js) — y si se desincronizan el
// barco SALTA al entrar al momentum. Viven aca para que haya una sola fuente.
// CORDON FINAL — el ultimo tramo del pasillo, antes del climax.
//
// Dos reglas que van juntas y por el mismo motivo (playtest 6/8: "se pierden los enemigos en
// frente del barco"): mientras el buque objetivo este plantado adelante creciendo, cualquier
// obstaculo que se le cruce por delante deja de leerse. En vez de pelear ese cruce a fuerza de
// contraste, se ELIMINA — el pasillo deja de sembrar y despues se cierra un banco de bruma que
// tapa TODO. Se cruza a ciegas y del otro lado ya estas en el ARENA.
//
//   VEIL_STOP  fraccion del objetivo donde deja de entrar gente. Ademas del porcentaje se exige
//              un margen de SPAWN_Z*1.6 (el ultimo sembrado tiene que llegar a pasarte ANTES de
//              que empiece la bruma), asi la regla aguanta cualquier largo de mision.
//   VEIL_IN    donde empieza el velo NEGRO · VEIL_FULL  donde ya es pared. Arranca a MEDIA
//              aproximacion a proposito (pedido 10/8): acompaña la disipacion de la niebla —
//              la escalera 0.8 → 0.1 de drawShipClouds — oscureciendo de a poco, y como la
//              curva es CUADRATICA (veilNow en game.js) a mitad de camino apenas se nota y
//              recien cierra fuerte encima del buque.
//   VEIL_MAX   opacidad tope: el remate cubre la pantalla (fundido a negro del cruce).
//   VEIL_OUT   segundos que tarda en abrirse del otro lado, ya en el ARENA.
export const VEIL_STOP = 0.74;
export const VEIL_IN = 0.55;
export const VEIL_FULL = 0.995;
export const VEIL_MAX = 0.97;
export const VEIL_OUT = 1.1;

// — EL MARCO: LA NIEBLA DE GUERRA DE LOS COSTADOS —
//
// Un velo lateral que tapa lo que NO es pasillo: los dos costados del mundo, afuera del carril
// por donde puede venir algo. Enmarca la zona jugable, que hasta ahora se aprendia muriendo
// contra un borde invisible.
//
// SE LLAMA "MARCO" Y NO "NIEBLA" A PROPOSITO: `cfg.fog` (systems/fog.js) ya es la niebla —
// bancos de bruma que TAPAN OBSTACULOS y son una perilla de dificultad. Esto es lo contrario:
// no esconde nada que te pueda pegar, y por eso no puede llamarse igual. En pantalla, para el
// jugador, la fila se lee NIEBLA DE GUERRA.
//
// DONDE VA EL BORDE INTERNO — y por que esto no es un adorno con trampa. El carril se proyecta
// como una cuña que converge en el horizonte: a la fila `dy` bajo el horizonte, el borde del
// pasillo cae a MARCO_X * dy / cam.y pixeles del centro. El velo NUNCA cruza esa linea, asi que
// por construccion no puede tapar un obstaculo — nacen todos dentro de SPAWN_X. MARCO_X le suma
// un margen a SPAWN_X para que tampoco recorte el ALA del que nace en el carril extremo.
//
// Consecuencia geometrica que hay que aceptar: en el primer plano el carril es MAS ANCHO que la
// pantalla (a la fila 172 sus bordes ya se salieron), asi que ahi no hay costado que tapar y el
// velo se termina solo. El marco vive en el tercio de arriba — que es justo donde mirás para
// leer lo que viene.
export const MARCO_X = SPAWN_X + 8;       // semi-ancho PROTEGIDO, en unidades de mundo
export const MARCO_REACH = 0.26;          // cuanto entra el velo desde cada borde, en fracciones de W
// OPACIDAD tope, por modo. El negro tapa mas que el blanco a igual alfa (el mundo es oscuro),
// asi que FOCUS va un punto mas bajo para que los dos se sientan igual de densos.
export const MARCO_A = { bruma: 0.58, focus: 0.52 };
export const MARCO_COL = { bruma: '#e6edf2', focus: '#04070a' };
// CIELO: arriba del horizonte el carril no significa nada (no hay suelo que converja), pero
// cortar el velo justo en la linea del horizonte deja un escalon que se ve. Asi que sube y se va
// apagando hasta MARCO_SKY en el tope de la pantalla.
//
// Y SE APAGA MUCHO. En las esquinas de arriba vive el HUD —el puntaje, el escuadron, la pista de
// musica—, todo texto gris claro: con bruma blanca detras a media opacidad deja de leerse. El
// velo puede lavar el mundo, no los instrumentos.
export const MARCO_SKY = 0.05;

export const SHIP_UH = 13.5;    // modulo de altura del casco ("uh"); el casco mide uh*1.5
export const SHIP_DECK = 54;    // cubierta, bajo el horizonte

// CAÑON 20MM — presupuesto de fuego sostenido. Con 9 tiros/s, cada tiro suma GUN_HEAT_SHOT y el
// caño enfria GUN_COOL_FIRE mientras dispara, asi que la rafaga aguanta
//     1 / (GUN_HEAT_SHOT * 9 - GUN_COOL_FIRE)  segundos antes de recalentar.
// Con 0.06 son ~3.1s (antes era 0.10 → ~1.5s: se recalentaba apenas apretabas).
// Al recalentar se bloquea hasta bajar de GUN_RESET, enfriando a GUN_COOL_IDLE.
export const GUN_HEAT_SHOT = 0.06;
export const GUN_COOL_FIRE = 0.22;
export const GUN_COOL_IDLE = 0.5;
export const GUN_RESET = 0.3;

// SALUD DE LOS ENEMIGOS. El globo cae de un tiro (es un globo); las aeronaves aguantan una rafaga
// corta, para que valga la pena sostener el disparo y apuntar. Los que tienen mas de 1 muestran
// barra de vida (ver drawHpBar en render/world.js).
export const ENEMY_HP = { balloon: 1, helo: 4, jet: 3, aa: 3, bldg: 4, lcu: 2, tent: 1, radar: 2, aatruck: 3, tower: 3, depot: 3, flag: 1, manpad: 1 };

// TERRENO COSTA: desembarco britanico. Tierra a la IZQUIERDA, mar a la DERECHA; la linea de costa
// esta en SHORE_X (coordenada x de mundo). Los soldados corren de derecha a izquierda (bajan de
// las barcazas hacia tierra adentro).
export const SHORE_X = 14;
// La linea de costa NO es recta: serpentea con dos senos en coordenadas de MUNDO (estable: no
// titila, scrollea con el terreno). Todos los que necesitan saber "donde esta la orilla a esta
// profundidad" (render, vuelo, spawn) preguntan aca — una sola fuente, sin desincronizarse.
// tres escalas: bahias grandes (0.0047), entrantes medianos (0.014) y el mordisco corto (0.055)
export const shoreAt = wz => SHORE_X + Math.sin(wz * 0.014) * 6 + Math.sin(wz * 0.0047 + 2.0) * 8 + Math.sin(wz * 0.055 + 0.7) * 2.2;
export const SAND_W = 6;   // ancho de la playa (antes 2.5: era un hilito)

// SALIDA DEL PUERTO (mapa de MAR): donde termina la base de Puerto Argentino y empieza el agua.
// Era una linea RECTA perpendicular al vuelo — un corte de tijera que se notaba muchisimo. Ahora
// muerde y sale igual que la orilla de COSTA, con la misma idea (senos en coordenadas de MUNDO,
// estables: no titilan, scrollean con el terreno) pero girada 90°: la orilla de COSTA varia con
// la profundidad (wz), esta varia con el ANCHO (wx).
// Devuelve el desvio en z respecto de cfg.coast; la orilla real esta en cfg.coast + portJut(wx).
export const portJut = wx => Math.sin(wx * 0.055) * 6 + Math.sin(wx * 0.021 + 1.3) * 5 + Math.sin(wx * 0.13 + 0.5) * 2;
// amplitud maxima de portJut: fuera de esta franja la fila es ENTERA tierra o ENTERA agua y no
// hace falta recorrerla columna por columna. Si se tocan los senos de arriba, ajustar esto.
export const PORT_AMP = 13;
export const PORT_FOAM = 7;   // ancho de la rompiente, mar adentro de la orilla
// ANTIAEREO: banda de profundidad donde dispara y cadencia entre misiles
export const AA_Z0 = 80, AA_Z1 = 215, AA_CD = 2.6;
// EL MISIL AL HOMBRO (Blowpipe; pedido del autor 28/9): infanteria en un pozo con un tubo. Tira UNO
// y recarga largo — un tubo es un tiro —, y dispara mas cerca que el Rapier: la banda arranca mas
// adentro porque el tirador tiene que VER el avion. Cae con un tiro y se le pasa por encima.
export const MANPAD_Z0 = 70, MANPAD_Z1 = 180, MANPAD_CD = 4.2;
// cuantos de los antiaereos que siembra el mapa son un equipo de misil al hombro en vez del Rapier
export const MANPAD_P = 0.4;

// ACANTILADOS / IRREGULARIDADES DEL TERRENO — solo en TIERRA y COSTA (en mar abierto no hay
// donde apoyarlos). Son ROCA: NO llevan `hp`, asi que las balas los ignoran y no se destruyen.
// Se esquivan y punto — es el unico obstaculo del juego que no se puede eliminar.
// La altura se sortea con sesgo a lo BAJO (t*t): la mayoria son lomas que se pasan por arriba
// tirando de la palanca, y el muro alto aparece de vez en cuando y obliga a rodearlo.
export const CLIFF_H0 = 5, CLIFF_H1 = 22;
// ancho: cuanto MAS ALTO, mas angosto (un muro alto Y ancho no dejaria por donde pasar). Aun asi
// el mas angosto sigue siendo una MASA: por debajo de ~6 la roca se lee como una chimenea, no
// como un acantilado. La loma baja es ancha — larga de rodear, pero se pasa por arriba.
export const CLIFF_HW0 = 6, CLIFF_HW1 = 13;
// COSTA: el farallon corre por el lado de TIERRA (izquierda), lejos de la playa del desembarco.
export const CLIFF_COAST_BAND = 20;

// RE-ATAQUE: si se agota la ventana de tiro con blancos vivos, virás 180° y volvés a entrar.
// El daño hecho se conserva; el costo es combustible. Si no queda nafta (o se acaban los
// intentos), la mision termina.
export const REATTACK_DUR = 2.6;    // segundos que dura el viraje
export const REATTACK_FUEL = 12;    // combustible que cuesta cada vuelta
export const REATTACK_MAX = 6;      // intentos maximos sobre un mismo blanco

// MOMENTUM (ROADMAP #13): el ESPECIAL de camara lenta del PASILLO (systems/tempo.js). La barra
// se carga CON TIEMPO (desde el 26/9; antes era con puntos, ver TEMPO_NIVELES) y llena se LANZA con
// la tecla 4: rafaga corta e intensa, como un super de arcade.
// La punteria con mouse queda en tiempo real (es por frame, no por dt): blancos lentos + mira
// rapida = el poder. DESDE EL 26/9 CARGA CON TIEMPO y mejora con cada mejora: ver TEMPO_NIVELES.
// ---------- LA CHANCHA: EL KC-130 REABASTECEDOR (SPEC_PODER_CHANCHA) ----------
// El hermano CARO del MOMENTUM: misma familia (barra que se carga jugando, una tecla) pero una
// sola vez por corrida y recien pasado un rato largo de juego. Lo que compra no es poder: es
// NAFTA, o sea tiempo — y se paga volando alto, lento y visible, que es lo contrario de todo lo
// que el juego premia. Esa es la mecanica entera.
export const CH_CHARGE = 2000;   // puntos que llenan la barra (el MOMENTUM ya no es su vara: carga con tiempo)
export const CH_MIN_T = 240;     // s de mision antes de poder pedirla
export const CH_ETA = 18;        // s entre el pedido confirmado y la aparicion
// …y con RUTA (PLAN_NAFTA_ALCANCE, 24/9): el crucero esta comprimido — 520 km en ~40 s — y 18 s de
// espera la harian llegar cuando ya bajaste al radar. 6 s es la misma espera medida en km.
export const CH_ETA_RUTA = 6;
// EL ENGANCHE: segundos que hay que SOSTENERSE en la caja antes de que empiece a pasar nafta
// (pedido del autor 24/9). Es el naranja del HUD; pasado esto, verde y carga. Salirse lo reinicia.
export const CH_ENGANCHE = 1.5;
export const CH_ALT = 48;        // altura de la cita (sobre RADAR_ALT=20, bajo FLY_TOP=68)
export const CH_BOX = 6;         // radio de la caja de conexion detras de la canasta
export const CH_RATE = 9;        // % de tanque por segundo conectado (lleno en ~11 s limpios)
export const CH_WINDOW = 30;     // s desde que aparece hasta que vira a casa
export const CH_SPD_F = 0.75;    // factor del avance del mundo mientras estas conectado
// GEOMETRIA DE LA CITA. No estan en el spec y hacen falta para dibujarla: el Hercules va
// ADELANTE (a CH_Z de profundidad, en formacion — no se acerca ni se aleja) y la canasta cuelga
// detras y abajo, que es donde de verdad va. El deriva lento en x para que la cita se VUELE.
// LA PROFUNDIDAD DEL HERCULES. Medida en pantalla, no elegida a ojo: la canasta va a la
// profundidad de juego (PZ = 14) y el Hercules adelante, y como el factor de escala es F/z, dos
// profundidades muy distintas separan a los dos en pantalla aunque en el mundo esten pegados —
// con 34 la manguera cruzaba media pantalla y el avion parecia suelto. Con 24 el tramo se lee
// como lo que es: la manguera sale de adelante y viene hacia vos.
export const CH_Z = 24;
// CUANTO SALE LA MANGUERA HACIA EL COSTADO: lo que esta la BOCA DEL POD de estribor del eje del
// Hercules, en metros de mundo (8/10). En el KC-130 los pods van afuera del motor externo, y la
// manguera corre derecho para atras desde ahi: la canasta tiene que estar a la misma x que el pod o
// la manguera cruza en diagonal por abajo del ala. Medido en la hoja horneada (ancla 4 de chancha en
// src/data/cajas.js: (134,59 - 80) px x 26 m / 146 px = 9,7). Antes era 3, y el pod se habia colgado
// del motor interno para que coincidiera. Si se mueve CH_POD en tools/blender/, se mueve esto.
export const CH_HOSE_X = 9.7;
export const CH_HOSE_Y = 6;      // cuanto cuelga la canasta por debajo del avion
// LA CANASTA VA A LA PROFUNDIDAD DE JUEGO (PZ = 14), o sea CH_Z - PZ metros por detras del
// Hercules. No es un capricho de largo de manguera: si la canasta estuviera a otra profundidad
// que el avion, la proyeccion las separaria en pantalla y "estar en la caja" se veria como estar
// al lado. A la misma z, la caja que se dibuja es EXACTAMENTE donde hay que poner el avion.
export const CH_HOSE_Z = 10;
export const CH_DERIVA = 7;      // amplitud de la deriva lateral (m)
export const CH_DERIVA_V = 0.22; // velocidad de la deriva (rad/s): lenta, se sigue con el timon
// LA LLEGADA, DE ARRIBA HACIA ABAJO (28/9, el autor): aparece CH_BAJADA_H por encima de su altura y
// baja a la cita en CH_BAJADA_T segundos, frenando al final. Antes aparecia de golpe en su lugar.
export const CH_BAJADA_T = 2.4, CH_BAJADA_H = 45;
// …Y LA QUE ESPERA NO BAJA HASTA QUE SUBAS (28/9, el autor: "primero el piloto avisa, y si el
// jugador sube en el margen disponible aparece desde arriba"): la cita de la ida se queda en el
// aviso hasta que el avion pasa esta altura (de mundo). 30 es la zona de gasto medio bien entrada,
// a una trepada corta de la canasta (CH_ALT - CH_HOSE_Y = 42).
export const CH_APARECE_Y = 30;
export const CH_SALIDA = 2.6;    // s que tarda en irse por arriba una vez que termino

export const TEMPO_SCALE = 0.35;    // el mundo a ~1/3: se nota de verdad, no un slow-mo timido
// MOMENTUM SE CARGA CON TIEMPO, NO CON PUNTOS (pedido del autor, 26/9/2026): "tiene que ser por
// tiempo de casteo, y mejorar con cada mejora — tiene que tener un tiempo de casteo, no por puntos".
//
// POR QUE SE FUE LA CARGA POR PUNTOS: los puntos salen, sobre todo, de VOLAR BAJO (12 x multiplicador
// por segundo en la banda), asi que la barra se llenaba sola haciendo lo que el juego ya pide — y
// cada vez que alguien la tuneaba se movia sola otra cosa. Ya van tres ajustes (500 -> 650 -> 1950)
// y el ultimo desacoplo a la Chancha. Con tiempo el especial tiene un ritmo que se puede APRENDER:
// "la tengo cada veinte segundos" se juega; "la tengo cuando junte 1950 puntos" no.
//
// LAS MEJORAS: una fila por mejora. `cast` son los segundos REALES que tarda en recargarse del
// todo despues de usarla (y en cargar la primera vez); `dur`, los segundos reales que dura lanzada.
// El nivel es la cantidad de mejoras que llevas (ver `nivelMomentum` en game.js). Mas alla de la
// ultima fila se queda en la ultima.
//   Arranca en 20 s de recarga y 3 de efecto — el ritmo que tenia en la banda a precio de 1950
//   (16 s), un poco mas lento porque ahora carga TAMBIEN volando alto, donde antes no cargaba nada.
//   Cada mejora le saca un segundo a la recarga y le suma dos decimas de efecto: a diez mejoras,
//   cada 10 s y 5 de efecto. Es el techo a proposito: mas corto que 10 y el especial deja de ser
//   especial — pasa a ser el modo en que se juega.
export const TEMPO_NIVELES = [
  { cast: 20, dur: 3.0 },
  { cast: 19, dur: 3.2 },
  { cast: 18, dur: 3.4 },
  { cast: 17, dur: 3.6 },
  { cast: 16, dur: 3.8 },
  { cast: 15, dur: 4.0 },
  { cast: 14, dur: 4.2 },
  { cast: 13, dur: 4.4 },
  { cast: 12, dur: 4.6 },
  { cast: 11, dur: 4.8 },
  { cast: 10, dur: 5.0 },
];
/** El renglon del nivel `n`, con piso en 0 y techo en la ultima fila. */
export const tempoNivel = n => TEMPO_NIVELES[Math.max(0, Math.min(TEMPO_NIVELES.length - 1, n | 0))];
// ⚠ LA CHANCHA SIGUE POR PUNTOS: `CH_CHARGE` son 2000 y su comentario hablaba de "~3x TEMPO_CHARGE".
// Esa proporcion ya no existe — un poder carga con tiempo y el otro con puntos—, asi que su precio
// se lee solo, sin hermano contra el que medirse.

// ---------- EL PODER RASANTE (SPEC_PODER_RASANTE, tecla 6) ----------
// EL CUARTO PODER DEL PASILLO, y el que cierra los cuatro ejes: turbo = velocidad · MOMENTUM =
// tiempo · CHANCHA = nafta · RASANTE = ALTURA. Con el activo la dinamica vertical se INVIERTE:
// sin input el avion desciende suave y se ASIENTA al ras — el reposo es la gloria, no la caida.
//
// LA CARGA ES SKILL PREVIA, no puntos ni tiempo de pared: se llena con SEGUNDOS EN LA BANDA DEL
// x10 volados A MANO. Volas bajo para ganarte volar bajo glorioso. Es lo que separa a este poder
// de un multiplicador gratis (RF-07), y es tambien lo que lo hace del juego: la tesis del juego
// ("los valientes vuelan abajo") convertida en su propio poder.
// EL REPOSO DEL RESORTE. El spec decia 3.0 y Matias pidio el avion "bien cerca del agua" al ver el
// primer encuadre: 2.4 es la altura con la que se saco la captura que aprobo, asi que es la que va
// — cambiarla despues seria mandar a produccion un cuadro distinto del que se miro.
// Sigue MUY adentro de la banda del x10 (4.5). El mar plano promedia 1.1 y pica en 1.9, asi que a
// 2.4 el avion pasa a ras de la cresta: eso es exactamente lo que el COLCHON (RF-02) existe para
// perdonar, y es la razon por la que las dos perillas se mueven juntas.
// EL ACHATADO DE LAS LINEAS DE VELOCIDAD. Salen del punto de fuga pero NO en radial pura: la
// vertical va comprimida a esto, y por eso se ven acostadas y no como un sol de rayos.
//
// OJO, Y ESTO COSTO UNA VUELTA ENTERA: es de las LINEAS DE VELOCIDAD Y DE NADIE MAS. El BARRIDO del
// desenfoque —las rayas largas que se ven con el poder puesto— es RADIAL PURO, porque smerea
// escalando el cuadro entero desde el punto de fuga (render/desenfoque.js): cada pixel se estira
// sobre su propio rayo, sin achatar. El rocio del agua y los hilos de punta de ala se alinean con
// ESE, asi que van radiales; alinearlos con este achatado fue el error.
export const FUGA_Y = 0.62;

// =================================================================================================
// EL AGUA QUE LEVANTA EL AVION — las perillas de los CUATRO efectos
// =================================================================================================
//
// Son CUATRO cosas distintas y conviene saberlo antes de tocar nada, porque llamarlas a todas "las
// particulas" costo una tarde entera:
//
//   ROCIO    las gotas sueltas que saltan al lado del avion          systems/vuelo.js, estelaVuelo
//   ROCIADA  la lengua y los brazos en V pegados a la sombra         render/plane.js, drawPlane
//   CORTINAS las barras que nacen en las puntas de ala               render/plane.js, drawPlane
//   ESTELA   las lineas gruesas y las motas que quedan atras         render/world.js, drawWake
//
// LAS DOS PRESENTACIONES. En el pasillo la camara mira para adelante y el avion se dibuja visto
// desde atras. Con el PODER RASANTE el mundo NO cambia —misma proyeccion, mismo punto de fuga— pero
// el avion se dibuja con otra hoja, que lo muestra desde unos 45° al costado. O sea que cambia la
// figura del AVION y no la del mundo, y todo lo que cuelgue de la sombra con angulos fijos sigue
// dibujando un avion visto de atras mientras se ve uno de costado. Por eso hay perillas `_RAS_`.
//
// LOS VALORES `_RAS_` ARRANCAN IGUALES A LOS DEL PASILLO a proposito: la perilla existe y no cambia
// nada hasta que alguien decida moverla. Lo unico que hoy SI cambia con el poder es el rocio, que
// es lo que el autor pidio.

// ---- EL EJE COMUN ------------------------------------------------------------------------------

// CUANTO SE ACUESTA EL EJE DEL AGUA con el poder puesto, en GRADOS.
// HOY LO LEE UNO SOLO: el rocio. Se llama AGUA_ y no ROCIO_ a proposito — el dia que la rociada o
// las cortinas tambien se acuesten tienen que acostarse LO MISMO, y para eso el numero ya esta.
//   0 = igual que en el pasillo · 45 = hacia la IZQUIERDA · -45 = hacia la derecha.
// Gira el eje ENTERO, asi que vale igual con la V abierta o cerrada.
export const AGUA_RAS_GRADOS = 45;

// ---- EL TURBO MULTIPLICA EL AGUA ---------------------------------------------------------------
//
// Con turbo el avion arranca mas agua, y eso es lo que hace que el turbo SE VEA desde afuera — ya
// se oye y ya quema nafta, pero sin esto el mar de abajo no se entera. Hasta el 13/9 solo lo hacian
// DOS de los cuatro efectos, con los numeros escritos a mano adentro del dibujo; ahora lo hacen los
// cuatro y cada uno dice cuanto.
//
// Son MULTIPLICADORES: 1 = el turbo no cambia nada en ese efecto.
// ⚠ EL ROCIO NO MULTIPLICA LA CANTIDAD, MULTIPLICA EL TAMANO, y no es un capricho: el presupuesto
// de particulas era PARTS_MAX = 260 (hoy 1500, con PART_DIV = 3 y lugar para lo demas; data/despiece.js) y volando a ras el agua sola ya se come unas
// 144 —medido: 238 vivas sin turbo, o sea a un pelo del tope—. Subiendo la CANTIDAD no aparece ni
// una gota mas: `capParts()` corta por el frente, asi que lo unico que se consigue es desalojar
// chispas, sangre y escombros de otros sistemas. El tamano es gratis.
export const ROCIO_TURBO = 1.35;     // gotas mas gordas (no mas: ver arriba)
export const ROCIADA_TURBO = 1.4;    // brazos y lengua mas gordos
export const CORTINA_TURBO = 1.7;    // lo que ya hacia: cortinas mas gordas
export const ESTELA_TURBO = 1.45;    // lo que ya hacia: estela mas ancha
export const ESTELA_TURBO_A = 1.3;   // …y mas blanca

// ---- LAS PARTICULAS, MAS CHICAS Y MAS (2/10: "las particulas generales del juego, quiza del agua o del
// humo, MAS CHICAS y mas cantidad") ----------------------------------------------------------------
// No se toca cada efecto (son cuarenta lugares que empujan a `parts`): `capParts()` (core/fx.js), que
// corre una vez por cuadro en todos los estados, PARTE cada particula nueva en PART_DIV, cada una a
// PART_TAMANO de su tamaño (nunca menos de PART_MIN px de mundo: medio pixel es UN pixel real del
// buffer 2x) y con un poco de dispersion —posicion, velocidad (PART_ABRE px/s) y vida— para que no
// salgan en racimos identicos. El tope (PARTS_MAX, data/despiece.js) sube en la misma proporcion.
export const PART_DIV = 3, PART_TAMANO = 0.55, PART_MIN = 0.5, PART_ABRE = 7;

// ---- EL ROCIO (systems/vuelo.js) ----------------------------------------------------------------
//
// La direccion de cada gota es (ABRE de costado, BAJA hacia atras) y lo que manda es la RELACION:
//     angulo bajo la horizontal = atan(BAJA / ABRE)
//   ABRE = 0        →  RECTAS detras del avion, sin V
//   ABRE mas chico  →  V mas cerrada · ABRE mas grande → V mas abierta
//   BAJA mas grande →  cae mas rapido hacia la camara · mas chico → mas acostada
export const ROCIO_ABRE = 2, ROCIO_BAJA = 1.3;
// Con el PODER puesto, otro par: ahi la figura del agua es otra.
export const ROCIO_RAS_ABRE = 5.5, ROCIO_RAS_BAJA = 50;

// CUANTO SE LA LLEVA EL AIRE: multiplica `run.spd` para dar la velocidad de la gota, asi que el
// rocio se acelera con el avion. A spd 62 son ~174 px/s de mundo.
export const ROCIO_BARRIDO = 2.8;

// EL REPARTO DE LA POBLACION, en fracciones (1 = todas):
//   PUNTA    cuantas nacen en las PUNTAS de ala (±ALA_PX); el resto, bajo el fuselaje. Es lo que
//            decide si el efecto se lee como DOS cortinas o como un chorro central.
//   COLUMNA  de las de punta, cuantas son la lineita VERTICAL que sube antes de que el aire se la
//            lleve. Esas salen antes del giro del eje, asi que con el poder van derecho mientras
//            las barridas van a 45: bajarla (o ponerla en 0) es como se apaga esa discrepancia.
export const ROCIO_PUNTA = 0.7, ROCIO_COLUMNA = 0.45;
export const ROCIO_RAS_COLUMNA = 0.45;   // probar en 0 si con el poder la columna desentona

// ---------------------------------------------------------------------------------------------
// EL POLVO DEL SUELO — el gemelo en tierra del rocio de arriba (carreteo, despegue y el pasaje
// bajo antes de tocar). Mismas dos perillas y la misma relacion: (ABRE de costado, BAJA hacia
// atras), y lo que manda es el angulo que forman.
//
// VA MAS CERRADO QUE EL ROCIO a proposito (1,4 / 1,6 contra 2 / 1,3, o sea ~49 grados contra ~33):
// pedido de Matias, «una V corta». El agua que arranca un avion a ras SALTA hacia los costados; el
// polvo de una rueda no salta, LO ARRASTRA el aire — asi que se va mas para atras que para afuera.
//
// ANTES DE ESTO el polvo no tenia barrido NINGUNO: era `vx` al azar entre -15 y +15, o sea una
// nubecita simetrica que se quedaba donde nacio mientras el avion se le iba. A cualquier velocidad
// se leia como humo quieto, no como algo que el avion esta levantando.
export const POLVO_ABRE = 1.4, POLVO_BAJA = 1.6;

// Multiplica `run.spd` igual que ROCIO_BARRIDO, pero MAS BAJO: la gota de mar sale disparada del
// impacto y el polvo solo flota en la corriente. Ademas el polvo vive casi el doble (0,4 s), asi
// que con el mismo numero se iria de pantalla.
export const POLVO_BARRIDO = 1.5;

// ---- LA ROCIADA (render/plane.js) ---------------------------------------------------------------
//
// Los brazos en V abren ROCIADA_ABRE de costado por cada ROCIADA_BAJA que bajan: hoy 4/1,3, o sea
// unos 18° bajo la horizontal. SE LLAMABAN ROC_*, a dos letras de ROCIO_*, y eso ya causo una
// confusion cara: son efectos distintos y ahora los nombres lo dicen.
export const ROCIADA_ABRE = 4, ROCIADA_BAJA = 1.3;
export const ROCIADA_RAS_ABRE = 4;       // con el poder. Probar en 0 para que la V se cierre.
export const ROCIADA_ALT = 7;            // altura de mundo hasta la que hay rociada
// DONDE NACE LA V, en px de mundo desde el eje. Es media ala (ALA_PX / 2), y no la punta: probado
// contra una foto aerea de una lancha, con el vertice en el ala entera la V arranca tan abierta que
// pierde el gesto de "sale de un punto y se abre". En la foto el casco es angosto respecto de la
// estela; nuestra ala no, asi que hay que compensar.
export const ROCIADA_VERTICE = 7.5;
// CUANTAS FILAS tiene cada banda. Con cinco quedaban escalones —cada fila dejaba un hueco— y por eso
// la estela se leia como rayitas y no como agua. Once tapan el hueco sin alargar el gesto: el paso
// se reparte, asi que el largo total no cambia.
export const ROCIADA_FILAS = 11;
// EL AGUA REVUELTA entre las dos bandas: alfa de la primera fila (va bajando 0,03 por fila) y a que
// velocidad BAJA el patron de motas con el mundo. Empezo en 0,20 y no se veia absolutamente nada
// sobre agua oscura — el autor no podia distinguir la variante con revuelto de la que no lo tenia.
export const ROCIADA_REVUELTO = 0.48, ROCIADA_REVUELTO_V = 3;
// CUANTO SE ACUESTA EL PLANO DE LA V con el poder puesto. No es una rotacion: es un CORTE, un
// desplazamiento en y proporcional a lo lejos del eje que esta cada punto. Rotar la V la mandaria
// mitad para arriba —y el agua no sube—; el corte la deja apoyada en un plano inclinado, que es lo
// que se ve cuando mirás una V plana desde 45°: un brazo cae y el otro se acuesta.
// 0 = la V se apoya horizontal, como en el pasillo. Negativo la acuesta para el otro lado.
export const ROCIADA_RAS_CORTE = 0.35;

// ---- LAS CORTINAS DE PUNTA DE ALA (render/plane.js, SPEC_AGUA_OLAS F3.1) ------------------------
//
// Cuatro muestras por lado que se abren hacia AFUERA y caen hacia ATRAS a medida que envejecen.
// ⚠ SON DOS COSAS DISTINTAS QUE VALIAN LO MISMO. En el dibujo habia dos 5: uno era cuanto se corre
// la barra hacia AFUERA y el otro cuanto MIDE de ancho. Escritos iguales, parecian el mismo numero;
// juntarlos en una perilla hacia que cerrar la cortina la adelgazara de paso.
export const CORTINA_ABRE = 5;           // cuanto se corre hacia afuera la muestra mas vieja
export const CORTINA_ANCHO = 5;          // cuanto crece el ancho de la barra con la edad
export const CORTINA_BAJA = 4;           // cuanto cae la mas vieja respecto de la primera
export const CORTINA_RAS_ABRE = 5;       // con el poder. Bajarla cierra la cortina (sin adelgazarla).
export const CORTINA_N = 4;              // cuantas muestras tiene cada cortina
// LAS CORTINAS SON EL INSTRUMENTO DE LA BANDA: cuando las ves, estas cobrando x10. Por eso esto
// DERIVA de `BANDA_ALT` y ya no se puede desincronizar del multiplicador, que es lo que les da
// sentido. Antes era un 4,5 a mano y el aviso que habia aca —"si hay que mover la banda, se mueven
// los cinco"— se quedaba corto: los sitios eran nueve.
//
// ⚠ SIGUE SIN SER `RAS_ALT` (2,4), la altura a la que el poder asienta el avion. Las dos vivieron
// con el mismo nombre en archivos distintos y el import "natural" de una rompia la otra.
export const CORTINA_ALT = BANDA_ALT;

// ---- LA ESTELA (render/world.js, drawWake) ------------------------------------------------------
//
// ABRE es el ANGULO: cuanto se abre cada brazo de la V por cada metro que el punto queda atras.
// En 0 la estela sale recta, en dos lineas paralelas.
export const ESTELA_ABRE = 0.34;
// EDAD son los metros en que la estela pasa de recien batida a disuelta. La poda del wake corta a
// 11,6 m (systems/vuelo.js), asi que dejarlo un poco abajo hace que se deshilache ANTES de que la
// poda la corte de golpe — que es lo que se quiere.
export const ESTELA_EDAD = 11;
export const ESTELA_ALT = 9;             // altura de mundo hasta la que se siembra estela

// DONDE ESTAN LAS PUNTAS DE ALA en la pantalla, medidas desde la sombra del avion y en pixeles
// de MUNDO. Vive aca —y no en el render— porque la usan DOS cosas que tienen que coincidir o se
// leen como dos efectos pegados: las cortinas de punta de ala (render/plane.js, F3.1) y el
// rocio de particulas (systems/vuelo.js). El agua que arranca un avion a ras sale de las
// PUNTAS —son los vortices de punta de ala tocando la superficie— y no del morro.
export const ALA_PX = 15;

export const RAS_ALT = 2.4;
export const RAS_SPRING = 6;     // rate del lerp de vuelta al ras. Si en el playtest se siente
                                 // "riel", se ABLANDA ESTE NUMERO — no se agrega asistencia (§6.1)
export const RAS_CEIL = 17;      // techo blando: apenas bajo RADAR_ALT (20), el mismo filo que el
                                 // techo del banco. Con el poder activo, mantener ↑ no lo cruza
export const RAS_DUR = 12;       // s que dura. La adrenalina es rafaga: subirlo es decision del
                                 // director (§6.5), no una perilla de balance
export const RAS_CHARGE_S = 25;  // s acumulados en la banda del x10 (a mano) que llenan la barra
// LAS DOS CAMARAS DEL PODER (RF-04), como DATA: cuanto se cae la camara respecto del avion
// (`lift`, contra el 2.6 de siempre) y hasta donde puede bajar en el mundo (`piso`, contra 3.4).
//
//   cola    el avion GRANDE y corrido abajo-izquierda, con el agua cercana ocupando el cuadro.
//   cabina  el mismo encuadre SIN el sprite: la vista del piloto. Sigue detras de la perilla.
//
// ⚠ EL SIGNO DE `lift` ES CONTRAINTUITIVO Y ME LO CORRIGIO MATIAS. Bajar la camara respecto del
// avion NO acerca la escena al agua: lo deja clavado SOBRE la linea del horizonte con una franja
// fina de mar debajo — lo contrario de rasante. En esta proyeccion la superficie del agua se
// dibuja desde el horizonte HACIA ABAJO y cuanto MAS ALTA esta la camara, mas mar entra en cuadro
// y mas abajo queda el avion. O sea: para "el agua llenando el cuadro" la camara SUBE.
// Elegido mirando un barrido de 2.6 / 4.5 / 6.5 / 9.0 sobre el mismo instante, no razonando.
//
// LOS VALORES SON LOS DE LA CAPTURA QUE SE APROBO, no unos parecidos. Salieron de tres barridos
// sobre el MISMO instante (altura de camara, corrimiento lateral, zoom del sprite) y la eleccion
// la hizo Matias mirando. Cambiar uno solo por "afinar" manda a produccion un cuadro que nadie vio.
//
//   lift  altura de la camara sobre el avion (2.6 es la de siempre). MAS lo BAJA en el cuadro.
//   piso  hasta donde puede bajar la camara en el mundo.
//   lat   corrimiento lateral: positivo mueve la camara a la derecha y al avion a la IZQUIERDA.
//   zoom  cuanto se agranda el SPRITE. Es lo unico que acerca el avion sin tocar `cam.y`.
export const RAS_CAMS = {
  cola:   { lift: 3.0, piso: 2.4, lat: 10, zoom: 2.0 },
  // LA CABINA quedo SIN RESOLVER como eleccion (ver §8): el checkpoint del RF-04 se lo comio el
  // problema del encuadre, que resulto mas grande que elegir entre dos camaras. Se conserva
  // entera detras de la perilla, con el mismo encuadre aprobado y sin sprite.
  cabina: { lift: 3.0, piso: 2.4, lat: 10, zoom: 1 },
};
export const RAS_CAM = 'cola';   // 'cola' | 'cabina' — la quinta camara, SOLO durante el poder.
                                 // Los dos prototipos se prueban a feel y la eleccion es un
                                 // checkpoint con el director (RF-04): no la decide el codigo
export const RAS_LATIDO = true;  // el latido bajo el silencio (RF-05)
// EL TEATRO (RF-05). El poder SUSURRA: es el unico boost del juego que baja el volumen, y esa es
// una de las cinco cosas que lo hacen suyo (§7). Los numeros salen del pedido de Matias del 23/8 —
// "silencio, latido, motor del avion, ruido potente del agua, y quiza musica de concentracion":
export const RAS_MUS = 0.07;     // la musica NO se apaga del todo: queda un hilo de concentracion
                                 // debajo. Con cero se lee como un bug de audio, no como silencio
export const RAS_AGUA = 1.9;     // el agua SUBE mientras todo lo demas baja. Es lo que hace que el
                                 // silencio se lea como "me acerque al mar" y no como una falla
export const RAS_LAT_T = 0.62;   // s entre latidos. Lento a proposito: es concentracion, no panico
export const RAS_LAT_HZ = 54;    // el latido, grave y corto — se siente mas que se oye

// ---------- EL AGUA Y LAS OLAS ----------
// Plan y porque: docs/sistemas/PLAN_AGUA_OLAS.md · ejecucion por fases: SPEC_AGUA_OLAS.md.
// La tesis, en una linea: la ola NO es un sprite pegado sobre el mar, es el mismo campo de altura
// (core/sea.js). El render levanta sus puntos con el y la colision se resuelve contra el mismo
// bulto — lo que ves es lo que te mata.
//
// QUE APORTA AL JUEGO: casi todo el PASILLO se esquiva de costado; la ola obliga el gesto
// VERTICAL — un toque de gas y volver abajo. Es el mismo gesto del salto de la PASADA, o sea que
// las olas son su tutorial repartido por la campaña. Y son el impuesto de la banda del x10: el mar
// te paga por volar ahi abajo, y cada tanto te lo cobra.

// olas-obstaculo
export const OLA_H = { marejada: 3.0, rompiente: 5.0, rebelde: 8.0 };  // altura de cresta BASE
// VARIACION DE ALTURA (pedido del autor, 16/8): "las olas deben ser mas altas algunas y variar
// altura". Cada ola sortea un factor sobre su altura base, y el sorteo va AL CUADRADO: la mayoria
// sale chica y las grandes son la excepcion. Es lo que hace que una grande se SIENTA grande — con
// reparto plano, todas quedan medianas y ninguna sorprende.
//
// Por que importan estos dos numeros y no son decoracion: la banda del x10 termina en 4.5. Una ola
// de 3 se salta sin salir de la banda; una de 5 te obliga a irte ARRIBA del multiplicador unos
// segundos. O sea que el factor alto no es "mas dificil", es el impuesto de volar a ras — que es
// exactamente lo que las olas vienen a cobrar.
// Y ES POR TIPO, no uno solo para todas. Con un rango unico y ancho, la marejada trepaba a 5.8 —
// mas alta que la base de la ROMPIENTE (5.0)— y la rompiente habria llegado a 9.7, mas que una
// REBELDE. Los tres tipos dejarian de significar algo. Asi cada uno tiene su banda:
//   marejada  varia MUCHO: es la comun, y es donde la variedad se nota
//   rompiente  varia poco: su identidad no es la altura sino que es PARCIAL y que se rompe (F4)
//   rebelde    casi no varia: es EL evento del temporal, y un evento chico no es un evento (F7)
export const OLA_H_VAR = {
  marejada: { lo: 0.8, hi: 1.95 },     // 2.4 .. 5.9
  rompiente: { lo: 0.85, hi: 1.3 },    // 4.3 .. 6.5
  rebelde: { lo: 0.95, hi: 1.15 },     // 7.6 .. 9.2
};
// una ola mas alta es tambien mas LARGA: el espesor en z acompaña a la altura (a la raiz, que es
// como crece una ola de verdad). Sin esto, las grandes se leen como una pared flaca y falsa.
export const OLA_WZ_VAR = 0.55;
export const OLA_WZ = 6;            // espesor del bulto en z (sigma de la gaussiana)
export const OLA_SPD = 14;          // velocidad propia hacia el jugador (se suma a la relativa)
export const OLA_GAP_MIN = 350;     // distancia minima entre olas vivas
export const OLA_FACE_KILL = 0.55;  // fraccion de la altura que es cara letal; encima, cresta = roce
export const OLA_SCRAPE_FRAC = 0.45;// cuanto margen de roce consume un cepillado de cresta
// CADA CUANTO VIENE UNA OLA. Es una probabilidad por siembra, y en mar abierto se siembra cada
// 40-70 m (ver spawnSystem), asi que el numero se traduce asi a metros de vuelo:
//   calm   0     nunca — el mar de m1 no cambia
//   breeze 0.08  una cada ~600-900 m: ~7-10 s. Se aprende, y todavia sorprende
//   storm  0.14  una cada ~500-600 m: ~5 s. Medido, 0.20 daba una cada 2,7 s — con cada ola
//                tardando ~3 s en cruzar, eso es una pared continua que tapa al resto del nivel
//
// SUBIDO desde 0.04/0.12 del spec por medicion, no por gusto: con 0.04 salia una cada ~1500 m, o
// sea una cada 12-18 s, y una mecanica que aparece dos veces por partida no se aprende — el autor
// jugo una sesion entera y no vio ninguna. El techo real lo ponen igual OLA_GAP_MIN y el limite de
// dos vivas: por mas que se suba, no se amontonan.
export const OLA_RATE = { calm: 0, breeze: 0.08, storm: 0.14 };
// LA ROMPIENTE (F4). Que fraccion de las olas es rompiente en vez de marejada.
//
// El spec no da este numero, y hace falta uno: la rompiente es la ola que se esquiva DE COSTADO
// (es parcial, `hw`), y la marejada la que se SALTA. Son las dos respuestas del mar, y la mezcla
// es lo que impide que el mar tenga una sola tecla. Un tercio es suficiente para que la segunda
// respuesta se aprenda sin que la primera —el gesto vertical, que es la tesis del item— deje de
// ser lo normal.
export const OLA_ROMP_P = 0.35;
// MEDIA ANCHURA de la rompiente. El spec pedia 22 y esta MAL, y el fixture lo agarro: `hw` no es
// un ancho, es la SIGMA de una gaussiana — a 22 no termina en 22, termina nunca. Medido: con 22,
// a 30 unidades del centro el bulto todavia valia el 39% de la altura, o sea que a ras te mataba
// igual. La "rompiente parcial" cruzaba todo el carril y era una marejada disfrazada.
//
// Con 12, a 30 unidades queda en 4% y a 36 (el borde de la zona de vuelo) en nada: hay un lado
// libre DE VERDAD, que es la unica razon de que este tipo de ola exista.
export const OLA_ROMP_HW = 12;
export const OLA_ROMP_Z = 60;       // z donde EMPIEZA A ROMPER (se enrula y ruge)
// LA OLA REBELDE (F7). El evento del temporal: ancho completo, sin brecha, una sola viva, y
// nunca en los primeros metros de la corrida — una pared de 8 m a los diez segundos de despegar
// no es un evento, es una emboscada.
export const OLA_REB_P = 0.22;      // fraccion de las olas de TORMENTA que salen rebeldes
export const OLA_REB_D0 = 400;      // m de vuelo antes de la primera posible (§F7.1)
/** EL MAR VARIADO (`mar: 'variado'` en el cfg de la mision; pedido del autor 2/10: "quitar globos y
 *  agregar mas variedad de olas y de alturas" en las IDA Y VUELTA). Tres cosas, y ninguna toca el
 *  reglamento de justicia de las olas (OLA_GAP_MIN, dos vivas, nunca en la niebla):
 *    rate     cuanto se multiplica OLA_RATE: con brisa, de una ola cada 7-10 s a una cada ~5
 *    rebelde  la fraccion de olas que sale REBELDE aunque no haya tormenta (en tormenta, OLA_REB_P)
 *    var      bandas de altura mas ANCHAS que OLA_H_VAR, y sorteadas PLANO (no al cuadrado): en el
 *             mar normal casi todas son chicas; aca hay de todas las alturas
 *               marejada  1,7 .. 6,9   (la normal: 2,4 .. 5,9)
 *               rompiente 3,5 .. 7,5   (la normal: 4,3 .. 6,5) */
export const OLA_VARIADO = {
  rate: 1.7, rebelde: 0.1,
  var: { marejada: { lo: 0.55, hi: 2.3 }, rompiente: { lo: 0.7, hi: 1.5 }, rebelde: { lo: 0.9, hi: 1.2 } },
};
// espuma / viento (F2)
export const SEA_FOAM_TH = { calm: 0.88, breeze: 0.78, storm: 0.62 };  // umbral de cresta con espuma
export const SEA_WIND_AMP = 0.45;   // termino direccional de viento en seaH
// ---------- EL RELIEVE DE LA TIERRA (PLAN_TIERRA_COSTA T3) ----------
// Las lomas de la turba. Es la fase de JUEGO del suelo: `groundY` deja de ser una constante y pasa
// a ser este campo, o sea que a ras de tierra hay que SEGUIR EL TERRENO.
//
// LA AMPLITUD ES CHICA A PROPOSITO. El avion vuela a 60-90 m/s: con 2.2 m de loma y longitudes de
// onda de cientos de metros, la pendiente maxima queda en ~4% (unos 3.5 m/s de trepada pedida a
// toda velocidad), que se sigue con el gas y no obliga a memorizar. Una loma agresiva no seria mas
// dificil, seria una pared invisible — la ola ya cubre el evento brusco, la tierra es lo continuo.
export const TIERRA_AMP = 2.2;      // altura maxima de la loma (m). En 0 el suelo vuelve a ser plano
export const TIERRA_LZ = 41;        // lomas largas (~258 m de cresta a cresta)
export const TIERRA_LZ2 = 17;       // ondulado corto (~107 m)
export const TIERRA_LX = 29;        // termino en X: la loma no es un tubo, cruzarla tiene lados
export const TIERRA_LUZ = 0.16;     // cuanto ilumina/oscurece la pendiente al raster (0 = plano visual)

// ---------- LAS LOMADAS (30/9/2026) ----------
// "Me gustaria que los terrenos no sean completamente planos… el terreno de Malvinas era irregular,
// no eran super montañas pero tampoco todo era plano." La tierra fuera del carril se levanta en
// lomadas IRREGULARES —la logica de los acantilados: macizos largos, lomas y un filo que las quiebra,
// sin repetirse— que se recortan contra el horizonte. Adentro del carril el suelo es el de siempre
// (TIERRA_*): el vuelo a ras no cambia. Empiezan en COLINA_X0, afuera de todo lo que nace o se mueve
// (SPAWN_X = 44), asi que no tapan nada que se juegue ni hay contra que chocar.
export const COLINA_X0 = 50;        // m del eje donde empieza a subir la tierra
export const COLINA_SUBE = 60;      // m en los que llega a su altura plena (la falda)
// m de las lomadas plenas (varian de ~0,15 a ~1,4 de esto: promedio ~25). Empezo en 14 y no se
// veian: con la camara a 4 m, una lomada de 9 m a 150 m son cinco pixeles sobre el suelo. 24 se
// veian pero poco; 40 (30/9)
export const COLINA_H = 40;
export const COLINA_CELDA = 70;     // m de la celda del ruido: el tamaño de una lomada
export const COLINA_ORILLA = 25;    // m tierra adentro desde la orilla antes de levantarse (costa)
export const COLINA_PLAYA = 90;     // m en los que la lomada de una costa crece desde ahi (el borde serpentea)
export const COLINA_Z = 1300;       // hasta donde se dibujan

// ---------- LA PROFUNDIDAD DEL MAR (render/world.js `profundidad`, 2/10) ----------
// Manchas fijas al mundo sobre el mar abierto: lo hondo mas oscuro, los bajios mas claros. Tres
// escalas en metros (el tono largo, las manchas, las vetas) con su PESO; cada una se apaga cuando
// una fila de pantalla ya abarca mas de un cuarto de su CELDA (titilaria). CORTE: cuanto se aparta
// del medio el ruido para cada nivel de cada lado; HONDO y BAJO: el alfa de cada nivel (negro sobre
// lo hondo, el `deep` del agua sobre los bajios; lo hondo tiene un nivel menos). DZ/DZ_REL: cuanto puede cambiar la profundidad
// dentro de una franja; PASO: px por muestra.
export const MAR_HONDO = {
  CELDA: [600, 60, 22], PESO: [0.45, 0.35, 0.2],
  CORTE: [0.04, 0.1, 0.17, 0.27], HONDO: [0.16, 0.32, 0.48], BAJO: [0.12, 0.24, 0.36, 0.5],
  // EL BAJIO: a menos de BAJIO_D m de tierra el agua se corre hacia lo claro, hasta BAJIO_K pegado
  // a la orilla (el cuarto nivel de BAJO solo se alcanza ahi)
  BAJIO_D: 150, BAJIO_K: 0.34,
  DZ: 0.6, DZ_REL: 0.04, PASO: 6,
};

// ---------- EL GRANO DE LA SUPERFICIE (render/world.js `drawSeaDots`, 2/10) ----------
// "Reducir las particulas del mar y multiplicarlas; variar colores o brillos de la superficie de las
// olas contra las partes mas bajas; simular espuma". Cada punto mide k*TAM px de mundo, entre
// TAM_MIN y TAM_MAX (medio pixel = un pixel real del buffer). Donde la grilla de muestreo queda a
// mas de PX pixeles en pantalla (cerca de la camara) se siembran hasta MAX granos por muestra, con
// el brillo corrido hasta ±JIT/2 de altura; los que pasan ESPUMA de altura pueden salir espuma.
// ALFA: cuanto mas opaco que antes es cada grano (mas chico, tiene que pesar un poco mas).
// HONDO_TONO / HONDO_ALFA: cuanto baja (o sube) de tono y de opacidad el grano en lo hondo (o el bajio)
// de las manchas de MAR_HONDO; LEJOS_TONO / LEJOS_ALFA: cuanto se apaga hacia LEJOS_Z m (2/10:
// "demasiado brillosas, variar tonalidades de profundidad").
export const MAR_GRANO = { TAM: 0.05, TAM_MIN: 0.5, TAM_MAX: 1.5, PX: 2.5, MAX: 8, JIT: 0.3, ESPUMA: 0.86, ALFA: 1.1,
  HONDO_TONO: 0.9, HONDO_ALFA: 1.2, LEJOS_Z: 160, LEJOS_TONO: 0.2, LEJOS_ALFA: 0.35 };

// ---------- LA CRESTA DE ESPUMA DE LAS OLAS (render/world.js `crestas`, 2/10) ----------
// Una franja de espuma a lo largo del filo de cada ola que se choca. PASO_PX: ancho de columna en
// pantalla; GROSOR + GROSOR_H * altura: metros de espuma (de lejos, nunca menos de medio pixel); MIN:
// desde que fraccion de su altura la ola lleva espuma (en la brecha y los costados se apaga);
// HIERVE: veces por segundo que cambia el borde; ROMPE: cuanto se derrama hacia adelante al romper.
// Z_MAX: hasta donde se dibuja la cresta — mas alla del campo de puntos del mar (SEA_FAR_Z = 190): de
// lejos la ola es solo eso, una raya de espuma.
// CUERPO: que tan opaca es la cara de la ola, del filo hasta el mar (8/10: "a veces parece transparente")
export const OLA_CRESTA = { PASO_PX: 1.5, GROSOR: 0.22, GROSOR_H: 0.07, MIN: 0.45, HIERVE: 4, ROMPE: 3.2, Z_MAX: 720, CUERPO: 0.92 };
// ---------- MAS OLAS (systems/spawn.js, 2/10: "muchas mas olas por mision, y que se vean desde mas lejos") ----------
// RATE_K multiplica OLA_RATE (brisa y tormenta); CALMA es la tasa con mar en calma: 0, y a proposito
// — protege a m1, el tutorial (una ola ahi seria enseñar dos cosas a la vez; fixture agua §1);
// VIVAS: cuantas a la vez (eran 2); GAP_K achica OLA_GAP_MIN; LEJOS_P:
// que fraccion nace mas lejos, entre LEJOS_Z[0] y [1] m (las demas, a SPAWN_Z): se las ve venir por
// la cresta. Las reglas de justicia quedan: nunca en la niebla, la rebelde va sola.
export const OLA_MAS = { RATE_K: 2, CALMA: 0, VIVAS: 3, GAP_K: 0.7, LEJOS_P: 0.35, LEJOS_Z: [500, 700] };

// ---------- EL PIQUE DE LAS MUNICIONES (core/fx.js `piqueMunicion`, render/world.js `drawPiques`, 2/10) ----------
// Lo que cae al agua salpica: tus balas, la rafaga del Harrier que no te dio, los misiles y trazadoras
// esquivados que pasaron BAJO (a menos de BAJO m) y el Sidewinder perdido, que se cae en arco (CAE_G
// m/s²). El pique es un penacho en V corta que CRECE desde el agua (SUBE s) y dura VIDA s, mas gotas
// que salpican en diagonal a los costados (no una lluvia de particulas: "parecen burbujas"; y del
// color de la espuma, no blanco: "que no parezca una luz"). Y: la superficie; ALTO: metros del
// penacho (ALTO_PX de tope en pantalla); BOCA: metros de ancho abajo; ABRE: metros que se abre la V
// arriba; BRILLO: radio de la espuma de la base; GOTAS: cuantas, y GOTAS_ALTO: hasta que fraccion del
// penacho suben; TIPO: altura y ancho de cada municion (multiplican ALTO, BOCA, ABRE, BRILLO); MAX:
// piques vivos; BALA_SIGUE: metros que la bala sigue bajo el agua (lo que esta en la linea de
// flotacion igual recibe); Z_MAX: mas lejos no se ve; ADELANTE (+ hasta ADELANTE_VAR): metros delante
// del avion donde se clava lo que te paso de largo (detras no se veria: la camara lo pasa en una decima).
/** EL POLVO Y LOS TERRONES DETRAS DEL AVION (pedido del autor 3/10: "las particulas de polvo o
 *  tierra estan POR ENCIMA del avion: ponerlas por detras y dejarlas al 60%"). Las particulas
 *  marcadas `fondo` (los piques en tierra, el polvo del ras) se dibujan antes del avion, con esto de
 *  opacidad. */
export const PARTS_FONDO_A = 0.6;
export const PIQUE = {
  Y: 0.9, ALTO: 5, ALTO_PX: 70, BOCA: 0.25, ABRE: 0.55, BRILLO: 1.4, SUBE: 0.14, VIDA: 0.85, MAX: 60,
  GOTAS: 14, GOTAS_ALTO: 0.32, AGUA_RGB: '196,220,216', ESPUMA_RGB: '232,242,239',
  // EN TIERRA: TERRONES en vez de gotas y una nube de POLVO; los colores de cada suelo (la arena de
  // una costa, la turba de adentro): el penacho (rgb), los terrones y el polvo
  TERRONES: 20, POLVO: 10,
  // …y mas grande que en el agua (3/10: "no se ven"), y con mas cuerpo al dibujarlo
  TIERRA_X: 1.7, TIERRA_A: 1,
  // (el penacho y el polvo CLAROS, de tierra seca levantada: oscuros, contra la turba no se veian)
  TURBA: { rgb: '168,146,108', terron: ['#4a3d2a', '#6b5638', '#2f281c', '#8a7652'], polvo: ['#a08a64', '#b39c74', '#8c7856'] },
  ARENA: { rgb: '196,180,140', terron: ['#7d7154', '#6a5f47', '#a89a78'], polvo: ['#b8a882', '#c8b890', '#a8996f'] },
  TIPO: {
    bala: { alto: 0.35, ancho: 0.45 },
    aden: { alto: 0.6, ancho: 0.6 },
    trazadora: { alto: 0.55, ancho: 0.55 },
    misil: { alto: 1.25, ancho: 1.6 },
  },
  Z_MAX: 260, BAJO: 9, CAE_G: 14, BALA_SIGUE: 6, ADELANTE: 25, ADELANTE_VAR: 40,
};

// ---------- LA COBRA: el freno (data/moves.js, systems/moves.js) ----------
// SUBE: fraccion de la maniobra en que la trompa llega arriba; BAJA: desde cuando vuelve a nivel.
// FRENO: 1/s de caida de velocidad mientras la panza esta plantada (exponencial: con 0.75 sobre los
// ~0.8 s del medio se pierde ~45%); SUBE_VY: lo poco que trepa el avion al sentarse.
// SUBE: hasta que fraccion de la maniobra levanta la trompa — RAPIDO y frenando al llegar (autor, 4/10:
// "la levantada de trompa es rapida"; antes 0.3 con arranque suave).
export const COBRA = { SUBE: 0.12, BAJA: 0.72, FRENO: 0.75, SUBE_VY: 5,
  // CORTE: cuanto baja el objetivo de velocidad del vuelo con la trompa plantada (systems/flight.js)
  CORTE: 0.55,
  // LA CAMARA DEL FRENO (el autor, 4/10: "que se acerque el avion, y al arrancar dejarlo avanzar un poco
  // y que vuelva a su posicion"): un RESORTE sobre la profundidad DIBUJADA del avion. ACERCA: cuanto
  // se viene hacia la camara con la trompa plantada (unidades de z; PZ es 14). K y AMORT: el resorte;
  // poco amortiguado a proposito, asi al soltar se pasa hacia adelante y vuelve solo.
  // 4.8 → 7.2 (autor, 4/10: "cobra debe escalar mucho mas para que el efecto freno sea mas acorde a la
  // frenada"; el 4.8 de antes paso al DERRAPE).
  // EL ACERCAMIENTO YA NO ES EL RESORTE (autor, 4/10: "cuando se empieza a acercar es rapido hasta que
  // los ultimos momentos, donde esta mas cerca de la camara, es lento, y luego vuelve a velocidad
  // estandar — para todos los efectos de este estilo"): al ACERCARSE va exponencial a ENTRA 1/s —rapido
  // al principio, lento al llegar— y solo la VUELTA usa el resorte (el pasarse hacia adelante sigue).
  // Sin el pasarse de entrada (~30%) el objetivo sube para llegar a lo mismo: 9.4 → z ≈ 4,6 (x3).
  ACERCA: 9.4, ENTRA: 5, K: 26, AMORT: 3.2 };

// ---------- EL TURBO: mas lejos y menos maniobrable (systems/vuelo.js, systems/flight.js) ----------
// El autor, 8/10: "el turbo deberia alejar mi avion un poco mas —que vaya mas adelante o se vea un
// poco mas chico— y limitar un poco la velocidad de reaccion: sacrifica velocidad recta por reaccion en
// los otros ejes". ALEJA: cuantas unidades de profundidad se DIBUJA mas lejos el avion con turbo (PZ es
// 14: 4 lo deja ~0,78 del tamaño); CAM_RATE: 1/s con que entra y sale. REACCION: la fraccion de la
// respuesta lateral y vertical que queda con turbo (aceleracion de costado, frenado lateral, gas y
// pique, rolido, mouse); REAC_RATE: 1/s con que cambia. Los topes de velocidad no se tocan.
export const TURBO = { ALEJA: 4, CAM_RATE: 2.5, REACCION: 0.55, REAC_RATE: 4 };

// ---------- LOS TANQUES COMO SEÑUELO (game.js soltarTanquesAccion, systems/collision.js) ----------
// El autor, 8/10: "si un misil te esta persiguiendo, soltar los tanques —vacios o llenos— permite que el
// misil le pegue a eso y evitar que te pegue". Al soltar, cada misil GUIADO en el aire (no trazadoras
// ni rafagas) se va contra el tanque mas cercano: VEL u/s de cierre, GIRO 1/s de correccion hacia el,
// y revienta a RADIO u. Si el tanque toca el agua antes, el misil ya te perdio: pasa de largo. PTS al
// que lo hizo.
export const SENUELO_TQ = { VEL: 260, GIRO: 6, RADIO: 3, PTS: 150 };

// ---------- LAS CHAPITAS — el chaff de la maquina de fideos (core/chapitas.js, systems/chapitas.js) ----------
// El autor, 8/10: "tirar chapitas largas brillantes: si tengo un misil cerca se desvia y explota detras
// mio sin dañarme practicamente nada, o poco; y si estoy con radar, tiro chapitas y bajo del radar, me
// elimina todas las alarmas y vuelvo al sigilo. En el radar se genera una onda grande alrededor del
// avion — pareciera que exploto, cuando en realidad esta debajo". Lo historico en
// docs/historia/MEJORAS_PICHON.md §1 («Fideos»): iba EN EL FRENO AERODINAMICO, y soltarlo era abrir
// el freno — EL PRECIO es perder velocidad justo cuando mas se la necesita.
//
//   CARGAS     por avion (cada uno del escuadron trae las suyas: el relevo no las hereda). El autor,
//              8/10: "un avion suele llevar entre 1 y 4 cargadores; podria ser mejorable de 1 a 4 max".
//              Hoy salen con CARGAS; cuando la mejora del Pichon exista, arranca en CARGAS_MIN y sube
//              hasta CARGAS_MAX (el estante dibuja hasta 4)
//   ENGANA     que misiles engaña: los GUIADOS POR RADAR. El Sea Dart (radar semiactivo) y el Sea
//              Wolf (lo sigue un radar de a bordo). NO el Sea Cat (un operador a ojo), NO el
//              Sidewinder (infrarrojo: para ese son las bengalas, «Quince segundos»), NO las
//              trazadoras ni la rafaga del Harrier. Los misiles genericos (sin `tipo`) tampoco.
//   ALCANCE_Z  hasta que distancia por delante (u) los toma la nube; mas lejos ya te tienen de nuevo
//   VIDA       segundos que la nube brilla y engaña; despues es aluminio que cae
//   INERCIA    1/s con que la nube pierde la velocidad del avion (sale con ella y el aire la frena):
//              con 0.6 se ve quedar atras ~1 s a crucero — la camara esta a 14 u del avion, y una
//              nube quieta en el mundo la pasaria en una decima, sin que nadie la vea
//   LARGO      el largo de cada tira, en la escala de la proyeccion (8/10: "la mitad de largas": era 0.9)
//   TUBOS      cuantos TUBOS larga cada carga (autor, 8/10: "son tubos de 16 centimetros… cada carga
//              tenia 30 cartuchos, 30 barritas"). Cada tubo sale expulsado hacia
//              atras, y a los TUBO_ABRE s revienta en su propia nubecita de tiras
//   TUBO_M     el largo del tubo en unidades de mundo: 16 cm a la escala del avion (8,4 m de
//              envergadura ≈ 4,2 u → 1 u ≈ 2 m), o sea un pixel o dos a la distancia del avion
//   TUBO_SALE  u/s con que el cartucho lo escupe hacia atras y a los costados (el aire lo frena)
//   TIRAS_TUBO cuantas tiras dibuja cada tubo al reventar (la nube: "termina generando una nube de
//              chafitas brillantes"). Las de verdad eran miles; 4 por tubo (120 por carga) alcanzan
//   DESTELLA   desde que tan de cara a la luz (0..1) una tira o un tubo destella: mas bajo, mas titila
//   BRILLO     cuanto brillan contra los aviones: la luz del cielo de render/borde.js por esto (8/10:
//              "deben brillar como brillan los aviones con la luz, pero el doble")
//   VEL/GIRO/RADIO  como va el misil contra la nube (los del señuelo de tanque: la misma cuenta)
//   CERCA      si revienta a menos de esto de vos te sacude: SOFT (0-1) del golpe no letal
//   FRENO      la fraccion de velocidad que se pierde al abrir el freno (de un golpe; se recupera sola)
//   VENTANA    segundos despues de soltar en los que BAJAR DEL RADAR borra las alarmas
//   PTS        por misil engañado
export const CHAPITAS = {
  CARGAS: 2, CARGAS_MIN: 1, CARGAS_MAX: 4,
  ENGANA: ['dart', 'wolf'],
  ALCANCE_Z: 160, VIDA: 4, INERCIA: 0.6,
  LARGO: 0.45, BRILLO: 2,
  TUBOS: 30, TUBO_M: 0.08, TUBO_ABRE: 0.2, TUBO_SALE: 9, TIRAS_TUBO: 4, DESTELLA: 0.7,
  VEL: 260, GIRO: 6, RADIO: 3,
  CERCA: 8, SOFT: 0.35,
  FRENO: 0.15,
  VENTANA: 4,
  PTS: 150,
};

// ---------- EL BREAK TURN y EL JINK, con fisica de avion (systems/moves.js) ----------
// El autor, 5/10: "el JINK y el BREAK TURN estan siendo demasiado arcade / rapidos; tienen que tener una
// continuidad mas fluida, como las ultimas maniobras". Antes clavaban la velocidad lateral y el alabeo
// en el primer cuadro (un corte, no un viraje). Ahora son lo que hace un avion: ROLA hacia el lado con
// una velocidad de rolido limitada (ROLA, 1/s de acercamiento al alabeo pedido) y la sustentacion
// inclinada lo EMPUJA de costado — la aceleracion lateral es ACEL·alabeo, contra un ROCE (1/s) que la
// frena. La velocidad lateral sale continua, va detras del alabeo y se apaga sola al nivelar.
//   QUIEBRE (break turn) — desde el 5/10 es OTRA COSA que un viraje (autor: "un poco mas rapido, quiza
//     con turbo; que se diferencie de una vuelta normal, y que frene con la panza apuntando hacia el
//     lado, haciendo como una U: _ y luego <|D"). Dos tiempos, en fracciones de la maniobra:
//     · DASH (hasta DASH): casi NIVELADO (BANK_DASH de alabeo) y con la POSCOMBUSTION prendida, se
//       tira de costado: EMPUJE u/s² contra ROCE 1/s. Es el "_".
//     · CANTO (hasta CANTO): rola de golpe A CUCHILLO (90° en pantalla, a GIRA_RATE 1/s) con la PANZA
//       hacia donde iba — el "<|D" — y la sustentacion, que ahora apunta para el otro lado, TIRA para
//       atras: TIRON u/s² le come la velocidad lateral y lo devuelve un poco. Esa es la U. Frena el
//       avance (FRENO 1/s) y la camara-dron se acerca (CORTE, como la cobra).
//     · y vuelve a nivel, con la velocidad lateral apagandose (ROCE_SALE 1/s).
export const QUIEBRE = { DASH: 0.33, CANTO: 0.75, BANK_DASH: 0.25, ROLA: 14, EMPUJE: 230, ROCE: 2.5,
  GIRA_RATE: 16, TIRON: 190, ROCE_SALE: 3, FRENO: 1.0, CORTE: 0.2 };
//   JINK: QUIEBRES alternados (el lado del primero lo pide el combo), cada uno con su fuerza (0.75-1 de
//     alabeo, por la semilla); en la ultima fraccion (desde FIN) nivela. ACEL crece con la velocidad
//     del avion (ACEL + ACEL_V·spd): mas rapido, mas violento — la misma regla de siempre. El PRIMER
//     quiebre dura la mitad: asi la ese queda centrada en el carril en vez de derivar para un lado.
export const JINK = { QUIEBRES: 3, ROLA: 8, ACEL: 130, ACEL_V: 1.9, ROCE: 2.6, FIN: 0.86 };

// ---------- EL POP-UP: la trepada que frena un poco (systems/moves.js) ----------
// El autor, 4/10: "el popup es como la cobra pero no frena tanto, es mas para subir rapidamente, pero
// al poner el avion asi te frena un poco, asi que tiene que generar un poco de resorte a la camara".
// CORTE: cuanto baja el objetivo de velocidad con la trompa arriba (la cobra 0.55) — y por la misma
// cuenta, cuanto se acerca la camara-dron (CORTE/0.55 del acercamiento de la cobra: ~1/4). FRENO: 1/s
// de caida de la velocidad (la cobra 0.75). ENTRA y SUELTA: fracciones de la maniobra en que la pose
// frena de lleno y en que empieza a soltar — al soltar vuelve con el resorte de la camara.
export const POPUP = { CORTE: 0.14, FRENO: 0.3, ENTRA: 0.15, SUELTA: 0.55 };

// ---------- EL MORTAL: el freno con vuelta hacia atras (data/moves.js, systems/moves.js) ----------
// La vuelta entera de cabeceo (0→360°). VUELTA: el perfil, en tramos [fraccion, grados, grados por unidad
// de fraccion] unidos con curvas de Hermite. El autor, 4/10: "el mortal debe ser mas rapido salvo cuando
// se pone panza al sol, donde frena y se acerca la camara, y luego retoma velocidad normal al terminar de
// girar"; y "debe FRENAR como la cobra antes de volver de la mortal"). PANZA AL SOL es la pose de la
// cobra: pasada la vertical, la panza mira adelante, al sol. Asi que: la trompa sube RAPIDO hasta ~100°,
// se QUEDA ahi frenando como la cobra (100…115°, lento) con la camara viniendose encima, y despues
// suelta y cierra la vuelta a velocidad normal hasta nivelar.
// FRENA: [entra desde, plena en, suelta desde, cero en] en grados — la ventana del freno y del
// acercamiento sobre la vuelta.
// SUBE: cuanto trepa en lo alto de la vuelta (u, como plane.y). FRENO: 1/s de caida de la velocidad con
// el freno pleno (el pico es boca abajo, arriba de todo); CORTE: lo que lee la camara-dron — con el de la
// cobra (0.55) baja el objetivo de velocidad como ella. ACERCA: cuanto se viene hacia la camara en lo alto
// (unidades de z), propio: con el de la cobra (y el freno arriba de todo) quedaba enorme y se iba del
// cuadro al bajar; ahora el acercamiento es en la panza al sol, antes de trepar del todo.
// FORMA: exponente de la altura sobre la vuelta, ((1−cos θ)/2)^FORMA — con 1 trepaba 6 u ya en la panza
// al sol y se iba por arriba del cuadro; con 3 se SIENTA como la cobra mientras frena (~2 u) y la trepada
// grande es la de la vuelta. FRENO: el de la cobra.
export const MORTAL = { SUBE: 11, FORMA: 3, FRENO: 0.75, CORTE: 0.55, ACERCA: 6, FRENA: [40, 95, 120, 170],
  VUELTA: [[0, 0, 1100], [0.12, 100, 40], [0.45, 115, 40], [1, 360, 200]] };

// ---------- LA COBRA MORTAL INVERTIDA (data/moves.js, systems/moves.js) ----------
// El autor, 4/10: "desde estado normal gira panza arriba, hace el freno como el de la cobra pero queda
// la punta del avion hacia abajo, avanza de frente hacia la camara y hace una vuelta completa de mortal,
// y sigue hacia adelante (sentido normal, misma velocidad, panza arriba), y luego de un momento vuelve a
// estado normal. Apenas gira no se frena; recien frena cuando queda con la punta para abajo".
// Todo en SEGUNDOS desde que empieza: GIRA, lo que tarda en rolar panza arriba (sin freno); VUELTA, el
// cabeceo en tramos de Hermite como el del MORTAL [segundo, grados, grados por segundo] — arranca un
// segundo despues de quedar invertido (el autor, 4/10: "mantengamos unos segundos mas con el avion
// panza arriba, tanto al arrancar como al terminar"); VUELVE, cuando empieza a rolar de vuelta a
// derecho (otro segundo invertido despues de cerrar la vuelta), y DUR, el total (data/moves.js). FRENA, FRENO, CORTE: el freno sobre el cabeceo, como el MORTAL; ACERCA: la camara.
// SUBE: lo poco que se levanta durante la vuelta — invertido, "tirar" es hacia el AGUA, y una vuelta
// entera hacia abajo volando a ras era chocar: el juego manda y la dibuja en el lugar.
export const COBRA_INV = { GIRA: 0.34, VUELVE: 4.24, DUR: 4.6, SUBE: 3, FRENO: 0.75, CORTE: 0.55, ACERCA: 7,
  FRENA: [40, 95, 120, 170],
  VUELTA: [[1.34, 0, 423], [1.55, 100, 15], [2.04, 115, 15], [2.87, 360, 0]] };

// ---------- EL DERRAPE: el freno de costado (data/moves.js, systems/moves.js) ----------
// LA MOTO DE AGUA (autor, 4/10: "que se comporte como una moto de agua al ras del mar, el derrape de
// una moto de agua con ese efecto"). Reemplaza al esquiador de posiciones suavizadas, que llegaba al
// borde frenado y ahi recien hacia la pose: quieto, no patinaba. Ahora es FISICA de costado:
//   CARVA    acelera hacia el borde (ACEL, tope VMAX u/s), inclinado hacia donde va (BANK_CRUCE de la
//            hoja); a ENDEREZA_U unidades de tener que derrapar se pone derecho.
//   DERRAPA  cuando lo que patinaria (v²/2·DESACEL) alcanza lo que le falta al borde (BORDE·FLY_X),
//            DOBLA DE GOLPE (la pose entra a ATAQUE 1/s): la cola contra el borde, la trompa al centro
//            de arriba (GIRA rad en pantalla —45° desde el 4/10: "no tan hacia arriba la trompa, 45 grados"— y
//            COBRA de la hoja 4, la fila de 40°), y SIGUE DE COSTADO por la inercia
//            mientras DESACEL se come la velocidad lateral — el patinazo. Ahi levanta el abanico.
//   …y cuando la velocidad lateral se da vuelta, ya esta saliendo para el otro lado: la pose se
//   suelta a SUELTA 1/s mientras acelera. CANTOS derrapes (3 = lado, contra, lado) y al final suelta.
// FRENO: 1/s de caida de la velocidad de avance con el patinazo pleno (FRENO_FINAL: el ultimo, el freno
// chico); CORTE: cuanto lee la camara-dron. CAM_SIGUE: cuanto de la x del avion sigue la camara durante
// el derrape (el vuelo normal sigue 0,86 — con eso el cruce casi no se veia en pantalla), y CAM_RATE la
// rapidez con que entra y sale. SPRAY_ALT: por debajo salpica; SPRAY_N: gotas sueltas por cuadro de 60 Hz
// con el patinazo pleno. EL ABANICO (render/plane.js) va en el mundo, relativo al avion, hacia adelante y
// hacia adentro: ABANICO_V, la velocidad de los chorros (u/s), y ABANICO_G, su gravedad (u/s²).
// EL RITMO (autor, 4/10: "el zig zag debe ser rapido, y el frenado el lento… rapido y luego lento"):
// el cruce es corto y violento (ACEL, VMAX) y el patinazo frena CONTRA EL AGUA — DESACEL fijo mas ROCE
// proporcional a la velocidad: a fondo pierde casi todo de golpe y despues se arrastra despacio con la
// pose puesta. Ese arrastre es "el lento". Lo que patina desde v: v/ROCE − DESACEL/ROCE²·ln(1+ROCE·v/DESACEL).
// MENGUA: cada zigzag tiene ese tope de VMAX del anterior ("reduce velocidad entre zigzag y zigzag").
// ACERCA: cuanto se viene hacia la camara en cada frenada (unidades de z; PZ es 14) — el que tenia la
// cobra hasta el 4/10 ("el que hoy es de cobra para el zigzag").
export const DERRAPE = { CANTOS: 3, BORDE: 0.9, ACEL: 1400, VMAX: 240, DESACEL: 25, ROCE: 12, MENGUA: 0.72, ACERCA: 6, BANK_CRUCE: 0.7,
  BANK_RATE: 18, ENDEREZA_U: 14, ATAQUE: 20, SUELTA: 6, COBRA: 0.38, GIRA: 0.785,
  FRENO: 1.1, FRENO_FINAL: 0.5, CORTE: 0.3, CAM_SIGUE: 0.75, CAM_RATE: 5,
  SPRAY_ALT: 9, SPRAY_N: 9, ABANICO_V: 26, ABANICO_G: 60 };

// ---------- EL RECIBIMIENTO (systems/recibe.js) ----------
// Las ametralladoras del buque que te esperan y TE ERRAN (pedido del autor, 4/10). Pura decoracion:
// adrenalina, no daño. D_MIN/D_MAX: entre que distancias al buque tiran (unidades de camara); CADA: s
// entre rafagas lejos (cerca baja al 40%); BALAS: por rafaga; ENTRE: s entre bala y bala; V: u/s de la
// bala, con T_MIN/T_MAX de vuelo; ERRA_MIN/MAX: a cuanto de costado tuyo pica la que va al agua
// (nunca encima); PICA_Z: cuanto delante tuyo (atras no se veria); DESTELLO_T: cuanto dura el fogonazo; MAX: balas vivas.
export const REC = {
  D_MIN: 70, D_MAX: 1500, CADA: [0.9, 1.8], BALAS: [3, 6], ENTRE: 0.07,
  V: 1300, T_MIN: 0.3, T_MAX: 1.1, ERRA_MIN: 2.5, ERRA_MAX: 6, PICA_Z: [4, 30],
  // ROZANDO: que fraccion pasa pegada a tu costado, a cuanto, y cuanto DELANTE tuyo pica (adelante y
  // no atras: atras la tapa la camara y no se ve pasar)
  ROZAN: 0.6, ROZA: [1.6, 3.5], ROZA_Z: [5, 22],
  // LEJOS: de las que NO rozan, que fraccion pica lejos (a cuanto de costado y cuanto adelante). En
  // total: 60% rozan, 25% pican pegadas, 15% lejos — la mayoria cerca, no todas.
  LEJOS: 0.38, LEJOS_X: [7, 16], LEJOS_Z: [10, 80],
  // MAS ADELANTE: otra tanda por rafaga que pica mas lejos delante tuyo, cerca de tu linea
  MAS_N: [2, 4], MAS_X: [1.5, 7], MAS_Z: [28, 75],
  DESTELLO_T: 0.12, MAX: 40,
};

// ---------- LA GEOGRAFIA DEL PASILLO (PLAN_GEOGRAFIA) ----------
// Una misma mision con etapas de terreno: mar, costa, tierra. Las perillas son de LAS COSTURAS,
// porque es lo unico nuevo: cada suelo ya tiene las suyas (agua, T1-T6). La regla que las ordena
// es la que costo el arreglo de la niebla: NADA APARECE DE GOLPE.
export const GEO_COSTURA = 160;       // m en los que la loma de un tramo de tierra arranca plana
export const GEO_PLAYA = 14;          // m de arena de la playa que CRUZA el carril (mar <-> tierra)
export const GEO_PLAYA_ONDA = 7;      // m que se despeina esa playa: una recta de lado a lado es una regla, no una costa
export const GEO_ORILLA_ENTRA = 220;  // m que tarda la orilla de una costa en correrse a su lugar
export const GEO_ORILLA_LEJOS = 420;  // de donde viene (m del eje): fuera de pantalla aun de cerca
// LA ISLA (G4): tierra CORTA que cruza el carril y SE LEVANTA — la barrera de roca alargada, con
// campo arriba. Se sobrevuela, o se la rodea por un canal si no tapa el carril entero (`ancho`).
export const GEO_ISLA_ALTO = 14;       // m de la cumbre por defecto: la banda que las barreras de roca ya midieron
// EL TECHO: una isla mas alta que el radar no pide una trepada, pide comerse una oleada (volando a 40 m
// el avion se muere en tres segundos). El validador la rechaza salvo que la data diga `expone: true`
// — una isla real que lo supera, puesta a proposito para obligar a exponerse (decision 1 del autor).
export const GEO_ISLA_ALTO_MAX = 20;   // = RADAR_ALT
export const GEO_ISLA_PENDIENTE = 0.07; // pendiente de una isla con `borde: 'playa'`: se sigue con el gas (unit test)
export const GEO_ISLA_CARA = 2.6;      // pendiente del farallon de `borde: 'acantilado'`: no se trepa, se choca
export const GEO_ISLA_FLANCO = 1.4;    // pendiente de los COSTADOS de una isla parcial (la pared del canal)
export const GEO_ISLA_PLAYA = 10;      // m de arena al pie, antes de que el terreno suba (4 con acantilado)
// LA ISLA NO ES UNA PISTA (30/9: "¿que es esto, una pista de aterrizaje de tierra?"). Los bordes se
// mellan —la entrada hasta MELLA_Z m, el costado del canal hasta MELLA_X, siempre hacia adentro: el
// canal solo se ensancha— y el lomo tiene relieve: en el carril hondonadas de hasta LOMO_M metros (nunca mas
// alto que la data: el techo del radar), afuera lomas de -0,35 a +0,65 de LOMO_AFUERA de `alto`. La
// rampa de playa sube a LLANA de GEO_ISLA_PENDIENTE: el resto es lo que suman las hondonadas.
export const GEO_ISLA_MELLA_Z = 30, GEO_ISLA_MELLA_X = 12;
// y en planta: del lado del canal se afina en las PUNTA m de cada extremo; del de afuera (si llega al
// borde del carril) sigue en bulbos de hasta AFUERA m mas alla
export const GEO_ISLA_PUNTA = 160, GEO_ISLA_AFUERA = 110;
export const GEO_ISLA_LOMO_M = 2, GEO_ISLA_LLANA = 0.75, GEO_ISLA_LOMO_AFUERA = 0.75;
export const GEO_ISLA_IMPACTO = 2;     // m por DEBAJO del suelo que ya no son roce sino choque: la cara de la isla
// Hasta donde se DIBUJA, y como se funde con la distancia. No es la niebla de las laderas (que a 210 m
// ya las borra): la cumbre TIENE que verse desde donde nace lo que viene (SPAWN_Z = 320), o la isla es
// una trampa — lo unico que este repo no se permite.
// LA EXPLANADA DEL BLANCO (G5): si el objetivo esta en tierra —una base, un edificio sobre una isla o
// un pedazo de tierra—, el suelo se APLANA alrededor de el, para que la estructura se apoye en un
// piso y no quede colgando de una loma. Medio largo en z, y el fundido hasta el relieve de al lado.
export const GEO_EXPLANADA = 70, GEO_EXPLANADA_BORDE = 45;
export const GEO_ISLA_Z = 1400;
export const GEO_ISLA_NIEBLA_Z0 = 260, GEO_ISLA_NIEBLA_FULL = 1400, GEO_ISLA_NIEBLA_MAX = 0.82;

// ---------- LA COSTA ROMPE (PLAN_TIERRA_COSTA T4) ----------
// LA RESACA. La franja de espuma era una banda de ancho fijo pegada a la orilla: siempre igual,
// siempre en el mismo lado, y el mar de la costa quedaba muerto justo donde mas vivo esta.
//
// La fase va por POSICION A LO LARGO DE LA ORILLA (wz) y no solo por tiempo: si fuera solo tiempo,
// los tres kilometros de playa subirian y bajarian a la vez, que es una pileta, no un mar.
export const RESACA_K = 0.05;       // largo de la onda a lo largo de la orilla (~125 m entre lenguas)
export const RESACA_V = 1.5;        // velocidad con la que la lengua corre por la playa
export const RESACA_MAX = 0.72;     // hasta que fraccion de la playa sube el agua
export const RESACA_P = 1.9;        // sesgo: sube de golpe y se RETIRA despacio (potencia > 1)
// LA ROMPIENTE DE LA COSTA (T4.2). La ola parcial de F4, puesta donde el mar de verdad rompe.
export const OLA_COSTA_P = 0.16;    // fraccion de las siembras de COSTA que son rompiente
export const OLA_COSTA_OFF = 9;     // cuanto mar adentro de la orilla rompe
// KELP. La costa malvinense es kelp puro, y ademas le da textura al agua somera, que hoy es lisa.
export const KELP_W = 26;           // ancho del bajo con alga, mar adentro de la orilla
export const KELP_A = 0.55;

// ---------- LO QUE HAY EN EL SUELO (PLAN_TIERRA_COSTA T5) ----------
// PEDREROS (los *stone runs* de Malvinas): rios de piedra gris que bajan por las laderas. Son
// reales, son espectaculares, y sobre todo SIRVEN DE LINEA: volar uno es una referencia.
export const PEDRERO_CADA = 620;    // un pedrero cada tantos metros de pasillo (banda)
export const PEDRERO_HW = 9;        // semi-ancho del rio de piedra
export const PEDRERO_SERP = 26;     // cuanto serpentea al bajar
// TURBALES: los cortes de turba apilada, en tableros rectangulares.
export const TURBAL_CADA = 430, TURBAL_L = 46, TURBAL_HW = 15;
// ALAMBRADOS: postes con hilo CRUZANDO el pasillo. Son la unica cosa de tamaño conocido que hay
// en el paisaje — sin algo asi, la escala de la turba no se lee y el campo podria medir cualquier
// cosa. Y de paso marcan la velocidad, que es lo que un campo vacio se come.
export const ALAMBRE_CADA = 340, ALAMBRE_POSTE = 9, ALAMBRE_H = 1.5;

// ---------- LA LLUVIA MOJA EL SUELO (PLAN_TIERRA_COSTA T6) ----------
export const MOJADO_A = { 0: 0, 1: 0.1, 2: 0.17, 3: 0.24 };   // cuanto oscurece el suelo cada lluvia
export const CHARCO_P = 0.34;       // fraccion de los bajos que junta agua
export const CHARCO_H = 0.42;       // por debajo de que fraccion de la loma se considera BAJO

// ---------- EL VIENTO EN EL PASTO (PLAN_TIERRA_COSTA T2) ----------
// La misma idea que el termino direccional de `seaH`: una fase determinista que cruza el campo.
// Si el mar se peina y la turba no, el VIENTO no existe — existe el mar con viento.
//
// La inclinacion se mide en FRACCION DE LA ALTURA del matojo (0.35 = la punta se corre un tercio
// de lo que mide), asi vale igual cerca y lejos: el matojo lejano se dobla lo mismo, en menos
// pixeles, que es lo que hace que la onda se lea como UNA onda cruzando y no como dos escalas.
export const PASTO_LEAN = { calm: 0, breeze: 0.34, storm: 0.68 };
export const PASTO_ONDA = 0.55;     // que fraccion de la inclinacion es la ONDA (el resto, constante)
export const PASTO_V = 2.1;         // velocidad de la onda (rad/s)
export const PASTO_KX = 0.085, PASTO_KZ = 0.125;   // rumbo de la onda (la misma diagonal del mar)
export const PASTO_ACOSTAR = 0.2;   // cuanto se ACHATA el matojo con la racha encima (tormenta)
// RACHAS DE POLVO: solo en tormenta. Pocas y grandes — muchas y chicas es ruido, no viento.
export const RACHA_N = 5, RACHA_T = 3.4, RACHA_A = 0.2;
// camino del sol (F6)
export const SUN_GLINT_HALF = 26;   // semiancho del cono de destellos (unidades de mundo en x)
// ---- EL RESPLANDOR (bloom, render/brillo.js) -------------------------------------------------
// La luz la EMITE cada fuente (explosion, tobera, fogonazo) en una capa aparte; aca solo se dice
// como se derrama esa capa. Las intensidades y colores de cada fuente viven con la fuente.
//   RADIO   ancho del desenfoque, en pixeles de la capa (x ESCALA = pixeles reales del buffer)
//   FUERZA  cuanto se suma arriba del mundo. 0 lo apaga sin tocar codigo.
//   ESCALA  a que fraccion de la resolucion vive la capa. 4 es barato y la luz no lo nota.
export const BRILLO_RADIO = 3;
export const BRILLO_FUERZA = 0.9;
export const BRILLO_ESCALA = 4;

// ---- LA LUZ DE BORDE (rim light, render/borde.js) --------------------------------------------
// El filo de la silueta del avion que mira al sol se enciende: el avion esta a contraluz.
//   ANCHO   grosor del filo, en pixeles de la HOJA (84 por cuadro). A la escala del juego 2 son
//           ~1,5 pixeles de pantalla: se lee como luz sobre el canto, no como un contorno pintado.
//   FUERZA  cuanto se suma, a pleno contraluz.
//   CIELO   CUANTO CONTRALUZ DA CADA CIELO. Es una tabla y no se saca del color del sol, y se probo:
//           la primera version usaba el brillo de `theme.sky.sun` y en el cielo NUBLADO el borde
//           salia mas fuerte que al atardecer — su "sol" es el disco blanco del cielo cubierto
//           (#e6eae2). Pero con el cielo cubierto no hay contraluz: la luz es difusa y no enciende
//           ningun filo. Lo que decide el borde es si hay SOL DIRECTO, y eso es un dato del cielo.
//           Un cielo que no este en la tabla cae en BORDE_CIELO_DEF.
export const BORDE_ANCHO = 2;
export const BORDE_FUERZA = 0.7;
export const BORDE_CIELO = {
  dusk: 1, dawn: 1,          // sol bajo y adelante: contraluz de libro
  sun: 0.8, clear: 0.8,      // sol alto: el filo de arriba se enciende igual, menos dramatico
  moon: 0.45, night: 0.2,    // luz de luna: un filo frio y tenue; sin luna, menos
  cloudy: 0.15, storm: 0.04, // cielo cubierto: luz difusa — y la tormenta (oscura, de noche) casi nada
};
export const BORDE_CIELO_DEF = 0.4;
// LOS DESTELLOS DEL FILO (autor, 4/10: "el efecto del turbo cerca de la turbina, mas chico y amarillo,
// repetido en todo el contorno que brilla"). Sobre el filo encendido se reparten resplandores chicos
// que laten como la boca de la tobera. `celda` reparte: uno por celda de esa medida (px de la hoja de
// 84) — mas chica, mas destellos. `radio` en px de la hoja; `alfa` el pico; `pulso` la velocidad del
// latido. En 0 de alfa no hay destellos (la luz de borde sigue igual).
export const BORDE_DESTELLO = { celda: 9, radio: 2.6, alfa: 0.55, pulso: 26 };
// EL COLOR DEL BRILLO POR CIELO (autor, 4/10: "si es noche cambiar el color, si hay luna llena…").
// `filo` el del borde (null = el sol del cielo, `theme.sky.sun`); `nucleo` y `halo` los dos tonos de
// cada destello (RGB). Un cielo que no este aca usa `sol`.
export const BORDE_LUZ = {
  sol: { filo: null, nucleo: [255, 236, 140], halo: [255, 200, 70] },          // amarillo de tobera
  moon: { filo: '#d6e4ff', nucleo: [235, 244, 255], halo: [170, 200, 255] },   // luna llena: plata fria
  night: { filo: '#8fa6d0', nucleo: [200, 215, 255], halo: [110, 140, 210] },  // noche sin luna: azul tenue
  storm: { filo: '#9aa6ae', nucleo: [220, 228, 235], halo: [140, 155, 170] },  // tormenta: gris
  cloudy: { filo: '#c8cfd2', nucleo: [240, 244, 246], halo: [180, 190, 196] },  // cubierto: blanco difuso
};
// CON NIEBLA EL BRILLO SE APAGA: el filo y los destellos se multiplican por (1 - NIEBLA x niebla), con
// la niebla del banco de 0 a 1 (systems/fog.js `fogFade`). En 0,8 a niebla plena queda un quinto.
export const BORDE_NIEBLA = 0.8;

// ---- EL POLVO DEL RAS, sobre tierra (systems/vuelo.js, autor 4/10) -------------------------------
// "Ojo con hacer el efecto del agua en la tierra: cambiarlo, pero no hacer exactamente el mismo."
// Sobre el agua el vuelo a ras levanta COLUMNAS que el aire abre en V. Sobre tierra levanta una NUBE
// BAJA que rueda hacia atras y a los costados y se queda flotando —el polvo es liviano y lento, la
// gota cae—, con algun TERRON pateado cuando vas muy bajo. Del color de ese suelo (PIQUE.TURBA/ARENA).
//   N        cuantas motas por cada gota que habria sido de agua (menos: cada una es mas grande)
//   SUBE     el envion hacia arriba (px/s), chico: el polvo no salta, se levanta
//   ABRE     la velocidad hacia el costado (px/s), la que lo hace rodar afuera
//   BAJA     cuanto del barrido de la velocidad se lo lleva hacia atras (abajo en pantalla)
//   VIDA     segundos, larga: la nube se queda
//   TAM      tamaño de cada mota (antes del turbo)
//   TERRON   probabilidad por mota de patear un terron, solo por debajo de 2,8 m
export const RAS_POLVO = { N: 0.7, SUBE: 16, ABRE: 26, BAJA: 0.35, VIDA: 1.1, TAM: 2.2, TERRON: 0.25 };
// EL DESTELLO DE LA CABINA (render/borde.js): el sol en el vidrio cuando el avion se inclina.
// `pico` el alabeo (0 nivelado .. 1 extremo de la hoja) donde mas brilla y `ancho` cuanto dura
// alrededor; `base` lo que queda nivelado. `radio` en px de la hoja de 84 (es el largo de la estrella);
// `alfa` el maximo. En 0 de alfa, sin destello.
export const BORDE_VIDRIO = { pico: 0.55, ancho: 0.45, base: 0.12, radio: 9, alfa: 0.9 };

// ---- LA VISION DEL RADAR, EN EL MARCO (render/world.js, drawRadarTinte) ----------------------
// Cuando el radar te ve, la escena se tiñe de verde y aparecen las lineas del tubo. Hasta el
// 3/10/2026 eso cubria TODA la pantalla: el atardecer naranja, los cerros y el mar quedaban en una
// sola pasta verde, justo cuando mas hay que leer lo que viene. Ahora la señal vive en el MARCO
// —verde y lineas en los bordes, el centro con su color— y se lee igual: el contraste entre un
// centro natural y un borde verde llama MAS la atencion que una pantalla toda verde.
//   LIBRE   hasta que fraccion del medio-ancho el centro queda limpio (elipse del cuadro)
//   LLENO   desde donde el verde y las lineas van enteros
//   LINEAS  cuanto oscurecen las lineas del tubo (eran 0.12 sobre toda la pantalla)
// Con LIBRE y LLENO en 0 se vuelve a la pantalla entera.
export const RADAR_MARCO_LIBRE = 0.42;
export const RADAR_MARCO_LLENO = 1.0;
export const RADAR_MARCO_LINEAS = 0.2;   // semiancho del cono de destellos (unidades de mundo en x)

// ---------- LA COLA: EL HARRIER EN LA COLA (PLAN A) ----------
// Plan y porque: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md — §1 la dinamica (de donde sale cada
// regla), §2 la verdad historica que la sostiene, §3 el plan por fases, §6 lo que NO hacer.
//
// LA TESIS, otra vez y en su forma mas dura: el Sea Harrier era EL depredador del A-4 y las
// perdidas aire-aire fueron todas en un sentido. Pero los A-4 escapaban ABAJO — a ras del mar la
// solucion de tiro y el ambiente degradaban al cazador. O sea que el evento mas peligroso del
// PASILLO se sobrevive volando donde el juego ya te paga por volar: la banda del x10.
// Por eso CAZA_RAS_ALT no es un numero propio sino `BANDA_ALT` — el techo del x10, el mismo que
// miden el multiplicador, las cortinas y el estado rasante. Una sola banda, dos premios.
// Conserva nombre y export a proposito: si algun dia el duelo tiene que ser MAS exigente que el
// puntaje, se escribe un numero aca y los dos se separan. Pero eso es una decision de balance, no
// un descuido — que es lo que era mientras los dos 4,5 vivian sueltos.

// --- las perillas del §3 (defaults del plan, sin tocar) ---
export const CAZA_SOL_T = 3.5;      // s de rumbo predecible que le lleva MADURAR la solucion de tiro
export const CAZA_PASSES = 3;       // pasadas maximas antes de que se vaya (uno solo por vez: §6.2)
export const CAZA_CAP_T = 45;       // s de estacion de la CAP: cumplido el reloj, se va (§2, el alivio)
export const CAZA_WINDOW = 4.5;     // s que dura la ventana, cuando queda adelante tuyo mostrandote la
                                    // COLA. Es TU turno de tirarle: 3 → 4.5 porque no dispara ahi y la
                                    // unica razon de la fase es darte tiempo de apuntarle.
// AHUYENTARLO es lo normal; DERRIBARLO es la hazaña. Ningun Harrier cayo en combate aire-aire
// (§2), asi que el derribo sale tres veces mas caro que romperle el ataque.
export const CAZA_HP = { ahuyenta: 6, derribo: 18 };
export const CAZA_RAS_ALT = BANDA_ALT;  // debajo de esta altura su punteria casi no progresa
export const CAZA_KILLABLE = true;  // el derribo EXISTE (raro y carisimo); false lo vuelve solo ahuyentable

// --- lo que el §3 NO da y el ciclo necesita (anotado como divergencia en §9 del plan) ---
// El plan da la duracion de la PRESION en prosa ("5-8 s", §3 paso 2) y nada mas: las otras cuatro
// fases del ciclo no tienen numero. Estos son los elegidos, con su razon — ninguno es una regla de
// juego, son el METRONOMO de la coreografia y se tunean mirando, no midiendo.
export const CAZA_PRES_T = [5, 8];  // s de presion antes del sobrepaso (el sorteo, por pasada)
export const CAZA_AVISO_T = 1.6;    // s entre la primera trazadora y el aviso por radio: el tell tiene
                                    // que llegar ANTES que el avion, pero no tanto como para no asustar
export const CAZA_OVER_T = 1.5;     // s del sobrepaso. Es corto a proposito: el cruce cercano es un
                                    // GOLPE (§1, "el enemigo ocupando un tercio de la pantalla"), no
                                    // un desfile — estirarlo lo vuelve una animacion de vitrina.
                                    // 1.15 → 1.5 mirando la primera captura: con la curva f^2.2 la
                                    // mitad del tiempo lo pasa GRANDE, y 1.15 dejaba menos de medio
                                    // segundo de "esta encima" (ver stepPos)
export const CAZA_RECOLA_T = 2.4;   // s que tarda en volver a la cola tras una ventana desperdiciada
export const CAZA_SALIDA_T = 2.2;   // s de la huida final, para que la salida se VEA (no se teletransporta)

// GEOMETRIA del duelo, en unidades de MUNDO (la misma z que obstaculos y balas; el avion vuela en
// PZ = 14). Tambien fuera del §3: son las posiciones que hacen legible la coreografia.
export const CAZA_Z_COLA = 6;       // z del caza mientras presiona: DETRAS tuyo (PZ es 14)
export const CAZA_Z_LEJOS = 320;    // z del horizonte del duelo: por ahi ENTRA de frente y por ahi se va
                                    // de cola. Todo el ciclo pasa entre esta z y CAZA_Z_COLA.
// z donde queda tras el sobrepaso. 118 → 62 mirando la captura de la ventana, que salio VACIA: a
// 118 la escala es 1,14 y el caza medía 12 px pegado a la linea del horizonte, entre las montañas.
// La ventana es la fase en la que te toca tirarle A EL — un blanco que no se ve no es una ventana,
// es un hueco. A 62 mide 24 px y se despega del horizonte, que es lo minimo para apuntarle.
// CUANTO MAS ABAJO QUE VOS entra, en metros. El Harrier venia clavado a TU altura desde 320 m,
// asi que no "aparecia": ya estaba, y lo unico que hacia era crecer. Entrando por debajo, sube a
// tu altura mientras se acerca — se lo ve LLEGAR, que es lo que un avion que te viene a buscar
// tiene que hacer. Se recorta contra el suelo: si volas a ras, entra desde donde haya lugar.
export const CAZA_Y_ENTRA = 16;
export const CAZA_Z_FRENTE = 62;
export const CAZA_X_COLA = 26;      // cuanto se abre de tu carril mientras presiona (asoma por el borde)

// VELOCIDADES PROPIAS, en unidades de mundo por segundo. NO son velocidades de animacion: se
// suman o se restan a la TUYA, que es la regla de todo lo que vuela en el pasillo. Los jets de
// frente ya la respetaban (collision.js: `o.z -= (run.spd + 45) * dt`) y los misiles tambien; el
// Harrier era el unico que se movia con un lerp a tasa fija, y por eso apretar el turbo no lo
// hacia pasar antes — se quedaba colgado enorme delante de la camara el mismo tiempo siempre.
export const CAZA_V_MERGE = 58;     // VINIENDO DE FRENTE cierra a run.spd + esto. Que sea una SUMA
                                    // es todo el punto: a mas gas, antes te lo sacas de encima.
export const CAZA_V_FUGA = 190;     // YENDOSE ADELANTE TUYO se aleja a esto - run.spd. Aca es una
                                    // RESTA porque vuela en tu mismo sentido: si lo perseguis con
                                    // el turbo puesto se aleja mas despacio y le podes tirar mas.
export const CAZA_V_FUGA_MIN = 45;  // piso de la resta. Sin el, con turbo a fondo la fuga quedaba
                                    // en cero o negativa y el Harrier no se iba nunca.

// ---------- LOS AMAGUES: EL RITMO DE LA COLA ----------
// Antes de pasarte, el Harrier ASOMA TRES VECES por el borde: aparece despacio, se esconde,
// vuelve, y recien a la tercera se compromete y te cruza. No es adorno.
//
// Es la VENTANA DE REACCION. Un avion que se te pega y te pasa sin previo aviso no se puede
// contestar — no hay nada que hacer, solo esperar. Tres amagues legibles son tres oportunidades
// de hacer algo al respecto, y son el gancho del que va a colgar la maniobra de escape o
// contraataque que todavia no existe: cuando exista, el momento en que esta ASOMANDO es su
// blanco. Por eso el estado sale en el snapshot y no se queda adentro del sistema.
export const CAZA_AMAGUES = 3;              // cuantas veces asoma antes de comprometerse
export const CAZA_AMAGUE_T = [1.1, 1.7];    // s que se queda asomado. LENTO: hay que poder verlo
export const CAZA_AMAGUE_GAP = [0.7, 1.2];  // s escondido entre amague y amague
export const CAZA_AMAGUE_TIRA = 2;          // desde que amague te tira el Sidewinder (ver AIM9, al final)
// GEOMETRIA DEL AMAGUE. Asoma DETRAS tuyo (z por debajo de PZ = 14) y bien corrido del carril:
// a z 10,5 la escala es F/10,5 = 12,9, asi que 15 unidades son ~193 px del centro y el sprite
// (10,5 de ancho = 135 px) entra en cuadro por la mitad. Eso es lo que se busca — MEDIO Harrier
// asomando por el costado, no un Harrier entero tapando el juego.
export const CAZA_Z_ASOMA = 10.5;
export const CAZA_X_ASOMA = 15;    // corrimiento con el amague afuera
export const CAZA_X_ESCONDE = 32;  // ...y escondido: fuera del cuadro, a 413 px del centro

// (Aca vivian las TRAZADORAS QUE PASAN LEJOS —CAZA_TRAC_*, CAZA_MISS—: rafagas desde la cola sin
// codigo de impacto. Se fueron el 30/9/2026 con el pedido del autor de cambiar el "tira y erra" por
// el SIDEWINDER. El misil y sus perillas estan al final del archivo, en AIM9.)

// ---------- COMO CAEN ----------
// Tres finales distintos, sorteados al ARMAR cada Harrier. Que el desenlace no sea siempre el
// mismo es lo que hace que derribar uno se sienta un evento y no una animacion: la primera vez
// que uno se va girando hasta el agua en vez de reventar, el jugador lo cuenta.
//   bola     revienta en el aire, ahi mismo. El clasico.
//   caida    no muere en el aire: se da vuelta, se le va el morro y BAJA girando y humeando
//            hasta pegar contra el suelo o el agua. Es el unico que se ve terminar.
//   pedazos  se abre en pedazos y lo que queda cae dando tumbos, mas rapido y mas sucio.
export const CAZA_FINALES = ['bola', 'caida', 'pedazos'];
export const CAZA_CAIDA_G = 30;      // gravedad de la caida, u/s². No es realista: es LEGIBLE
export const CAZA_CAIDA_MAX = 5.5;   // s de tope, por si cae fuera de cuadro y nunca toca nada

export const CAZA_SOL_AVISO = 0.72;  // fraccion de solucion en la que la radio grita QUEBRA (§2: el
                                     // aviso es humano; en un duelo mudo esto no suena). Ya no
                                     // anuncia balas: anuncia que se te esta pegando al carril.
export const CAZA_SOL_POST = 0.3;    // a cuanto vuelve la solucion cuando se completa: no arranca de
                                     // cero (sigue prendido de tu cola) pero te da aire para reaccionar

// EL CONTRAATAQUE (H3). La ventana frontal es tu turno y estos son sus numeros.
export const CAZA_HIT_RX = 5.6;      // caja de impacto de tus balas contra el caza. Es la MISMA que usa
export const CAZA_HIT_RY = 3.0;      // collision.js para 'helo'/'jet': un caza es un caza.
export const CAZA_PTS = {
  ahuyenta: 1500,   // romperle el ataque: caro, y es el desenlace NORMAL (§2)
  derribo: 6000,    // la hazaña. Ningun Harrier cayo en combate aire-aire: si pasa, que se note
  sobrevivir: 900,  // aguantarle las pasadas hasta que se le acabe la nafta tambien es ganar
};
// PIRUETAS QUE FUERZAN EL SOBREPASO (§3 paso 3). Son exactamente las de esquive: el BREAK TURN, el
// JINK y el S-TURN. Aca las mejoras del Pichon encuentran su para que — y el gate de campaña sale
// gratis, porque una pirueta que no aprendiste no se puede ejecutar.
export const CAZA_MV_FUERZA = ['breakt', 'jink', 'sturn'];

// (Aca estaban CAZA_MSL_* — "un misil lento desde la cola que se esquiva con una pirueta" — y
// NINGUN archivo del juego las leia: la idea quedo escrita y nunca se construyo. Se construyo el
// 30/9/2026 como el SIDEWINDER, y sus perillas son AIM9, al final de este archivo.)

// EL REGLAMENTO (H4). Cuando APARECE el duelo, que es una decision de nivel y no del duelo.
//
// LAS TRES PUERTAS SE ABRIERON, y el motivo es medido: con 420 m + 3 jets + 8-16 s de espera, el
// duelo casi nunca llegaba a armarse — te morias en el pasillo antes, y el Harrier era contenido
// que nadie veia. Un bicho que no aparece no se tunea: se abarata hasta que aparece.
export const CAZA_DIR_D0 = 200;      // m de vuelo antes del primer duelo posible: nadie te embosca
                                     // en el despegue. 420 → 200 (sigue muy por encima del despegue)
export const CAZA_DIR_JETS = 1;      // jets de frente que tienen que haberte pasado antes del primer
                                     // duelo: el Harrier te toma la cola DESPUES de haber visto uno
                                     // venir de frente. 3 → 1: la escalada se conserva, la espera no
export const CAZA_DIR_FIN = 520;     // m antes del objetivo en los que YA no arranca: el ultimo tramo
                                     // es del climax (misma idea que ENTRY_CLEAR_M de la PASADA)
export const CAZA_DIR_INIT = [5, 9]; // s de espera antes del PRIMER duelo (corto: los gates D0 y JETS
                                      // ya garantizan que no te caiga encima de entrada)
export const CAZA_DIR_GAP = [18, 32]; // s entre duelos (se acorta con la intensidad)
export const CAZA_DIR_MAX = 4;        // Harriers simultaneos — se acumulan hasta este tope
export const CAZA_MUDO_P = [0, 0.3, 0.5];  // probabilidad de duelo SIN aviso por radio, por intensidad.
                                     // §2: sin radar ni RWR el aviso es de Condor o de un Fiel, y a
                                     // veces no llega. En intensidad 2 (clima cerrado, noche) casi la mitad.

// ---------- PERSECUCION: VOLAR DE NUMERAL (PLAN B) ----------
// Plan: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md §4. Un lider vuela el pasillo ADELANTE tuyo y
// vos mantenes la distancia dentro de una banda. Lejos de mas lo perdes; cerca de mas su estela te
// sacude y rozarlo es chocar.
//
// POR QUE ESTO ES UN JUEGO Y NO UNA TAREA: la linea del lider es LA RESPUESTA CORRECTA del nivel —
// esquiva todo lo que viene, asi que seguirlo ES leer el pasillo con anticipacion. Volar de
// numeral era la habilidad real de 1982, y aca se convierte en dosificar el gas.

// --- las perillas del §4 (defaults del plan, sin tocar) ---
export const PURS_D = [60, 140];    // banda inicial de distancia al lider, en unidades de MUNDO
export const PURS_GRACE = 4;        // s de gracia fuera de banda antes de perderlo
export const PURS_WASH_D = 25;      // por debajo de esta distancia entras en su estela (jet wash)

// --- lo que el §4 NO da y N0 necesita (divergencia, §9) ---
export const PURS_D0 = 95;          // distancia de arranque: el centro de la banda, para que la
                                    // primera decision sea del jugador y no una correccion de entrada
// LA VELOCIDAD DEL LIDER es lo que convierte esto en un minijuego de gas, y es RELATIVA A LA TUYA.
//
// NO PUEDE SER UN NUMERO ABSOLUTO, y esto se descubrio jugandolo: tu velocidad nominal SUBE SOLA
// con el tiempo de vuelo (`speedTarget` en core/physics.js: 62 + t*2.8, hasta 150). Con un lider a
// velocidad fija el modo es imposible los primeros veinte segundos —te deja atras sin que puedas
// hacer nada— y trivial despues. Medido: con PURS_V_BASE en 104, a los 14 s el lider estaba a 401
// unidades, o sea mas alla del horizonte de siembra.
//
// Asi que el lider vuela a TU PROPIA velocidad nominal por un factor. Y eso trae gratis la tesis
// del juego: tu nominal sube con la racha rasante y el multiplicador de altura, asi que VOLANDO
// ABAJO le seguis el tren sin esfuerzo y volando alto te descolgas. Nadie tuvo que programarlo.
export const PURS_V_F = 1.0;        // factor sobre tu velocidad nominal (1 = va exactamente a tu par)
export const PURS_V_AMP = 0.16;     // cuanto respira alrededor: +-16%. Es lo que obliga a dosificar
                                    // turbo (para cerrar) y a soltar gas (para no comerselo).
// dos senos de periodos que NO son multiplos: el patron no se aprende de memoria en dos vueltas
// pero tampoco es ruido — se puede ANTICIPAR, que es distinto de adivinar. Con un solo seno el
// lider se vuelve un metronomo a los 20 segundos.
export const PURS_V_T = [7.3, 3.1];
// LA INERCIA DEL LIDER (4/10, revision de jugabilidad). Su velocidad iba al objetivo AL INSTANTE y
// la tuya no: con la energia puesta tu velocidad se arrastra al objetivo a 0.7/s (ENERGY_DRAG en
// core/physics.js). Medido en Node: al terminar un tiron el lider caia 30% en un cuadro mientras vos
// seguias a 1.5x tres segundos mas, y te lo comias. Hasta un jugador que anticipa mirando la flecha
// del cierre chocaba a los 20-45 s. Con la MISMA inercia que vos, el que anticipa aguanta 3 min en
// banda y el que reacciona tarde lo pierde entre 25 y 80 s — que es la curva de habilidad del modo.
export const PURS_V_INERCIA = 0.7;
// EL CARRIL RESERVADO. El §4 pide que el spawner CONOZCA su linea: nada de lo que siembra la cruza.
// Se implementa como un corredor propio — el lider reclama una franja y el sembrador la respeta.
export const PURS_SAFE = 9;         // semiancho del carril reservado del lider (el avion mide ~4)
export const PURS_LOOK = 90;        // cuanto mira hacia adelante para empezar a esquivar
export const PURS_AGIL = 2.2;       // que tan rapido se corre de carril (1/s del lerp)

// --- N1: la cinta de formacion, la gracia y la estela sucia ---
// PISO de escala del sprite del lider (fraccion del tamaño con que se dibuja tu propio avion). En
// el fondo de la banda proyecta 5 px de los 480 del mundo y no se le puede leer el banqueo — que es
// justamente el aviso anticipado que hace que seguirlo enseñe. Misma regla que la cabeza de las
// trazadoras: hay tamaños por debajo de los cuales una cosa deja de existir.
export const PURS_F_MIN = 0.3;
export const PURS_WASH_SHAKE = 4.5;  // sacudon maximo dentro del jet wash (es el mismo canal de
                                     // camara que el roce y las explosiones: feedback, no fisica)
export const PURS_CHOQUE_D = 6;      // por debajo de esta distancia lo chocaste. Es un avion, no un
                                     // aura: pasarle por encima al lider es exactamente igual de
                                     // fatal que comerse un mastil, y por la misma regla del juego.
                                     // OJO: el que se mata es EL QUE CHOCA. El lider sigue volando
                                     // (ver LA REGLA DEL AMIGO en systems/persec.js).
export const PURS_AVISO_T = 2.2;     // s entre avisos por radio mientras estas fuera de banda: la
                                     // radio insiste, no ametralla
export const PURS_PTS_S = 45;        // puntos por segundo EN BANDA (el multiplicador de altura del
                                     // juego se aplica encima, como a todo lo demas)

// --- N2: el modo PERSECUCION infinito ---
// El §4 pide que la banda se ANGOSTE con la distancia: "-8% por nivel, piso 45-90". En un modo
// infinito no hay niveles, asi que el escalon es de DISTANCIA — que es como ya escala todo lo demas
// del pasillo infinito (la velocidad, la densidad de siembra).
export const PURS_TIGHT_D = 900;    // m de vuelo por escalon de apretado
export const PURS_TIGHT_F = 0.92;   // cuanto se angosta por escalon (-8%)
export const PURS_TIGHT_MIN = [45, 90];  // el piso: mas apretado que esto deja de ser jugable
// EL RELEVO DEL LIDER. Cada tanto el que va adelante te pasa la posta a otro Fiel — cambia el
// indicativo y cambia la voz. No es cosmetica: en un modo infinito, lo unico que puede marcar que
// pasó algo es que la radio cambie de persona.
export const PURS_ROTA_D = 1800;    // m entre relevos de lider

// --- N5: EL TIRON del lider, y EL CIERRE (la segunda medicion) ---
//
// EL TIRON es "seguirle el ritmo" dicho como evento y no como promedio. La banda que respira
// (PURS_V_AMP) es una marea: te obliga a corregir todo el tiempo pero nunca te pide una DECISION. El
// tiron si — el lider abre el turbo, se va, y en tres segundos o le pegas el acelerador a fondo o lo
// perdiste. Es el unico momento del modo que se recuerda despues de jugarlo.
//
// Y SIEMPRE AVISA ANTES. La radio grita PURS_TIRON_AVISO segundos antes de que abra: sin eso el
// tiron es una emboscada y la respuesta correcta pasa a ser "ir siempre al fondo de la banda por las
// dudas", que es exactamente el vuelo aburrido que este modo trata de evitar. Es la misma regla que
// la solucion de tiro del Harrier: la ventana de esquive es el AVISO, no el proyectil.
export const PURS_TIRON_T = [11, 18];    // s entre tirones (sorteo al terminar el anterior)
export const PURS_TIRON_AVISO = 1.4;     // s de radio ANTES de que abra el turbo
export const PURS_TIRON_DUR = [2.6, 4.2];// cuanto quema
export const PURS_TIRON_F = 1.42;        // factor sobre su velocidad mientras dura. Tu turbo es
                                         // 1.5x, asi que se le alcanza — apretado, pero se alcanza.
export const PURS_TIRON_PTS = 500;       // premio por AGUANTARLO ENTERO en banda (x mult de altura)

// EL CIERRE es la SEGUNDA MEDICION que pide el modo: la aguja de la cinta dice DONDE ESTAS, y eso
// llega tarde. Cuando la aguja toca el borde ya empezo a correr la gracia. El cierre dice PARA DONDE
// VAS —cuantas unidades por segundo te estas acercando o alejando— que es el dato con el que un
// numeral real vuela formacion: no se mira la distancia, se mira si crece o se achica.
export const PURS_CIERRE_S = 3;          // suavizado de la lectura (1/s). Sin esto es un temblor.
export const PURS_CIERRE_MAX = 45;       // u/s que clavan la flecha en el tope

// ---------------- LO TRANSONICO (PLAN_TRANSONICO) ----------------
// El vapor de ala y el cono de Prandtl-Glauert. Todo sale del Mach A NIVEL DEL MAR, que es donde
// se juega RASANTE (0-68 m).
//
// A_MAR = 1200 y no los 1225 del manual: los 1225 son a 15 grados. El aire sobre el Atlantico Sur
// en mayo anda por los 5, y ahi el sonido viaja a ~1191 km/h. 1200 es el numero correcto PARA EL
// MAR DE ESTE JUEGO, y de paso baja un pelo la vara del efecto.
export const A_MAR = 1200;
// el mismo factor con el que el HUD pasa de unidades de mundo a km/h (render/hud.js)
export const KMH_U = 4.2;
// umbral del VAPOR DE ALA: se ve seguido, con racha y sin turbo (M 0.84 es crucero con racha)
export const M_VAPOR = 0.80;
// umbral del CONO: pide turbo si o si — con turbo sostenido y sin escalones se llega a M 0.98
export const M_CONO = 0.95;
// cono pleno: de aca para arriba ya no crece mas
export const M_CONO_FULL = 1.05;
// respiracion del cono (Hz): el regimen transonico es INESTABLE — se forma, se aprieta y revienta.
// No es un temporizador: es lo que hace que no se lea como una calcomania pegada al avion.
export const CONO_HZ = 1.9;
// EL PARPADEO DE MACH 1 (autor, 5/10, con un video de un F-14 cruzando la barrera: "a Mach 1 se arma
// como un efecto parpadeante, medio de sonido, alrededor del avion — ese vapor"). Un halo de vapor que
// envuelve al avion entero y TITILA: se prende y se apaga a saltos irregulares. Entra en M_PARPADEO,
// pleno en M_PARPADEO_FULL; PARPADEO_HZ son los saltos por segundo; PARPADEO_APAGA, la fraccion de
// saltos en que se corta del todo (lo que lo hace parpadeo y no latido).
export const M_PARPADEO = 0.98, M_PARPADEO_FULL = 1.04, PARPADEO_HZ = 14, PARPADEO_APAGA = 0.25;

// ---------------- LAS CHARLAS EN VUELO (SPEC_CHARLAS_VUELO §2) ----------------
// Dialogo DURANTE la mision jugable. NACIO como "una pausa sin pausa" —el mundo seguia corriendo y
// lo unico congelado era la acreditacion del kilometraje— y el 21/9/2026 el autor lo dio vuelta
// despues de jugar la M1: mientras SE HABLA el mundo se PARA entero, con velo negro, como la pausa.
// La burbuja de la acreditacion sigue existiendo para las otras dos fases (armada y saliendo).
//
// DRENAJE: al armarse la charla el sembrador se apaga y se espera a que lo YA sembrado pase de
// largo. Es un TOPE, no una espera fija: si la pantalla queda limpia antes, arranca antes.
//
// POR QUE SON 5 Y NO 2,5: el 2,5 venia de cuando el mundo seguia corriendo debajo de la charla —
// se arrancaba a hablar con residuo en pantalla (la divergencia 1 del §7 del spec) y ese residuo
// se drenaba solo mientras se hablaba, asi que no molestaba a nadie. Con el mundo PARADO eso ya no
// pasa: lo que quede sembrado se queda CLAVADO en pantalla toda la conversacion y te cae encima el
// cuadro en que la caja se va. Un corredor de SPAWN_Z = 320 m tarda ~4,3 s en vaciarse a velocidad
// de crucero — medido por `npm run charlas`—, asi que el tope pasa a 5 y el RF-01 ("cero enemigos
// en pantalla durante la charla") se cumple de verdad por primera vez. El costo es medio segundo
// mas de espera antes de la primera linea, y se paga con el mundo quieto: no hay nada que perderse.
export const CHV_DRAIN_S = 5;
// La nafta no drena mientras se escucha: seria injusto cobrar combustible por una escena que el
// jugador no pidio y no puede saltear.
export const CHV_FUEL_FREEZE = true;
// TOPE DURO por charla. Una escena que no entra en esto no se recorta sola: se parte en dos
// tramos (§6.4). El tope existe para que un guion mal medido no secuestre la mision.
export const CHV_MAX_S = 25;
// letterbox in/out. Corto a proposito: avisa que cambio el registro, no corta la accion.
export const CHV_FADE = 0.4;
// a que distancia se pone el numeral que habla, con `formacion: true` en la escena
export const CHV_FORM_D = 14;

// CUANTOS CARACTERES TIENE UN RENGLON DE RADIO EN VUELO. Es UN numero y lo leen dos capas: el motor
// de radio (core/radioVN.js) parte el texto con el, y el HUD (render/hud.js) le da a la cinta de
// arriba al centro el ancho minimo para que ese renglon entre colgado debajo, en cuerpo 5. Con una
// copia de cada lado, el dia que alguien cambie una el texto se sale de la caja.
export const VOZ_COLS = 38;

// ---------------- EL AGUA 3D DEL CLIMAX (PLAN_MEJORAS_3D P1) ----------------
// Dos formas de contar el mar del ARENA/PASADA, y son EXCLUYENTES en el fondo del plano:
//   'puntos'  la alfombra de puntos desplazada por seaH (SPEC_AGUA_OLAS F8) — el look actual,
//             el mismo mar que el 2D, sobre un plano liso hundido.
//   'cartoon' el shader Water de three (normales animadas) POSTERIZADO a la rampa del clima:
//             azul plano con vetas blancas grandes. Sale del analisis de Battle Typer
//             (docs/proyecto/ANALISIS_REFERENTES_3D §2) — el agua de shader deja de verse
//             "realista pegada" cuando se la cuantiza a los siete tonos de WATER_STYLES.
// En 'cartoon' la alfombra de puntos CAMBIA DE OFICIO: el shader cuenta el cuerpo del mar y los
// puntos quedan solo como ESPUMA (crestas y destellos, cerca), que es lo que da referencia de
// velocidad al volar a ras. Antes quedaban todos, y de cerca tapaban el agua con cuadraditos.
export const AGUA3D = 'cartoon';
// escalones de la rampa toon. 4 es poster duro (comic), 8 casi continuo. 5 es el punto donde
// las vetas se leen como VETAS y no como degrade.
export const AGUA3D_NIVELES = 8;
// cuanto ondula la normal map: mas alto = mar mas picado. El legado usaba 2.6 para un mar
// visto de costado; de arriba se lee mejor un poco mas calmo.
export const AGUA3D_DISTORT = 2.2;
// curva de reparto de la rampa: <1 corre el mar hacia las vetas claras, >1 hacia el cuerpo oscuro.
// 1.4 deja el mar mayormente CUERPO con las vetas como vetas; abajo de 1 el verde claro se come
// la pantalla y el mar se ve pintado.
export const AGUA3D_CURVA = 1.4;
// cuanto pesa la VETA DIRECCIONAL (el oleaje alineado) en la rampa
export const AGUA3D_VETA = 0.14;
// largo de la veta larga, en metros
export const AGUA3D_LARGO = 100;
// cuanto tapa el color del agua al reflejo del cielo (1 = opaca, 0 = espejo)
export const AGUA3D_CIELO = 0.30;
// corrimiento del TONO del agua 3D hacia el azul acero (0 = el color del 2D tal cual). El climax
// llena la pantalla de agua y el verde de WATER_STYLES se confundia con el verde oliva del avion.
export const AGUA3D_AZUL = 0.5;
// desde que altura de ola la cresta ROMPE y se pinta blanca (1 = nunca)
export const AGUA3D_ROMPE = 0.90;
// cuanto tiñe el agua la MANCHA DE NUBE reflejada (0 = un solo azul, plano)
export const AGUA3D_NUBE = 0.14;
// largo de esa mancha, en metros: son nubes, van en cientos de metros
export const AGUA3D_NUBE_LARGO = 700;
// largo de la estela del buque, en metros (la V de Kelvin y la remolinada de popa)
export const AGUA3D_ESTELA = 420;
// cuanto BLANQUEA la estela (0 = sin estela, 1 = espuma llena)
export const AGUA3D_ESPUMA = 1.8;
// ALTURA REAL del oleaje, en metros: cuanto LEVANTA la geometria del agua (0 = mar plano, todo
// el relieve pintado). Es lo que le da cuerpo al mar, como el desplazamiento de la alfombra 2D.
export const AGUA3D_ALTO = 3.5;

// ---------------- EL DUOTONO DE MISION (PLAN_MEJORAS_3D P3) ----------------
// La geometria iluminada del 3D (hoy el buque) remapeada a una rampa de DOS colores sacados del
// clima: la luminancia manda, la sombra se va al agua profunda y la luz al resplandor del sol. Es
// la receta de Pigeon (ANALISIS_REFERENTES_3D §1): sin texturas, un mundo se ve terminado con
// valor + rampa + niebla. Sin esto el buque es el mismo gris de chapa bajo cualquier cielo.
//
// APAGADO POR DEFECTO hasta que Matias vea las ocho capturas y decida: con FUERZA en 0 el parche
// del shader devuelve el color original bit a bit, o sea que esto no cambia un pixel.
export const DUOTONO3D = false;
// cuanto pesa la rampa contra el color propio del material (0 = nada, 1 = duotono puro y el buque
// pierde su chapa). Arriba de ~0.6 deja de ser un clima y pasa a ser un filtro.
export const DUOTONO3D_FUERZA = 0.45;
// curva de la luminancia antes de entrar a la rampa: >1 manda mas superficie a la sombra,
// <1 la abre hacia la luz.
export const DUOTONO3D_GAMMA = 1.0;

// ---------------- LA BRUMA EN CAPAS (PLAN_MEJORAS_3D P6) ----------------
// Dos bandas translucidas apoyadas en el agua, del color del horizonte del clima. Lo que el fog
// no da: CAPAS. Sale de GliderVR (ANALISIS_REFERENTES_3D §3) — la profundidad de ese juego son
// dos telones, no un shader atmosferico.
// APAGADA POR DEFECTO hasta que Matias vea las capturas: con la escala en 0 las bandas ni se
// dibujan.
export const BRUMA3D = false;
// alfa de la banda de adelante y la de atras. La de adelante pesa mas: es la que "corta" el mar
// lejano; la de atras solo tiñe el pie del cielo.
export const BRUMA3D_ALFA0 = 0.35;
export const BRUMA3D_ALFA1 = 0.2;
// a que distancia esta cada banda, en metros. La primera va MAS ALLA del ring de combate (700 m)
// para no meterse entre el avion y el buque; la segunda, a mitad de camino del domo.
export const BRUMA3D_R0 = 2200;
export const BRUMA3D_R1 = 3400;
// ALTO de la banda de adelante, en metros (la de atras es 1,8 veces mas alta). La banda va
// CENTRADA EN EL OJO —ahi cae el horizonte— y se desvanece por arriba y por abajo, asi que esto
// es el ancho de la franja: 900 m a 2200 de distancia son unos 23 grados de cielo.
export const BRUMA3D_ALTO = 900;

// ---------------- LA BANDADA DEL 3D (PLAN_MEJORAS_3D P2/B1) ----------------
// Aves ambient en el cielo del ARENA/PASADA: paralaje y escala, cero gameplay (las aves que
// hacen daño son las del pasillo 2D y siguen siendo esas). Sale de Pigeon: un cielo vacio no
// tiene tamaño. APAGADAS POR DEFECTO hasta la decision de Matias.
export const AVES3D = false;
// techo duro de sprites. El plan pide cap y esta es: pase lo que pase, no hay mas aves que esto.
export const AVES3D_MAX = 30;
// cuantas bandadas (de 6 aves cada una)
export const AVES3D_BANDADAS = 4;
// cada cuantos metros se repite el mundo de las aves: la bandada que se fue por atras vuelve a
// entrar por adelante. Mas grande = mas rato sin ver a nadie; mas chico = se nota el truco. 420
// esta elegido por lo mismo que la envergadura: a mas de 200 m un ave no se ve, asi que el mundo
// tiene que traerlas cerca o no hay bandada.
export const AVES3D_TILE = 260;
// envergadura del sprite, EN METROS DE MENTIRA. Una gaviota cocinera abre 1,3 m y con eso el ave
// no existe: el juego dibuja 480x270, o sea 212 px de distancia focal, asi que 1,3 m a 180 m son
// UN PIXEL Y MEDIO de cuadro, cuerpo y alas incluidos — se probo y en la captura no habia nada.
// Es la misma licencia que ya se toma el ave del pasillo 2D, que tampoco esta a escala: en pixel
// art la silueta manda sobre la medida. Con 5 m el ave a 100 m es un cuerpo de dos pixeles con
// alas de siete, que es exactamente lo que hace falta para que se lea el aleteo.
export const AVES3D_ENVERG = 5;

// ---------------- EL TERRENO 3D DE LA BAHIA (PLAN_MEJORAS_3D P4/T3D-1) ----------------
// Una bahia con lomas alrededor del ring de combate: heightmap determinista + una textura de
// turba generada al cargar + la niebla que ya esta. Sale de GliderVR. APAGADO POR DEFECTO: la
// bahia es para los climax que la piden (m5 el callejon, m11/m12 fondeados), no para el mar
// abierto — un buque en alta mar rodeado de cerros seria peor que no tener cerros.
export const TERRENO3D = false;
// medio lado del parche de terreno, en metros (el parche entero mide el doble)
export const TERRENO3D_R = 4200;
// segmentos por lado. 160 son 26 mil vertices, que es un pestañeo para la GPU y alcanza para que
// una loma de 600 m se lea como loma.
export const TERRENO3D_SEG = 160;
// donde esta la ORILLA, en metros desde el centro. Tiene que quedar afuera del ring de combate
// (700 m) con aire: adentro se pelea, no se aterriza.
export const TERRENO3D_COSTA = 1250;
// cuanto trepa la tierra firme lejos de la costa, en metros. Los cerros de Malvinas rondan los
// 200-700 m; esto es la base sobre la que las lomas suman.
export const TERRENO3D_ALTO = 320;

// ---------------- EL PASILLO EN ZIGZAG (docs/sistemas/PLAN_PASILLO_ZIGZAG.md) ----------------
// El carril que DOBLA, con el modelo del RIEL CURVO (OutRun / After Burner): el carril no se
// mueve en x absoluto — lo que dobla es lo que la camara VE. Todo lo demas (el avion en
// ±FLY_X, lo que nace en ±SPAWN_X, las colisiones por |plane.x - o.x|) sigue viviendo en el
// MARCO DEL CARRIL y no cambia una linea. Ver §1 del plan para por que se descarto el otro
// modelo, y §9 para lo que NO hay que hacer.
//
// TODO ESTO ES UN NO-OP CON EL ZIGZAG APAGADO: `bendW()` devuelve exactamente 0 y cada termino
// sumado es `+ 0`, que en punto flotante devuelve el valor original bit a bit.

// LA CURVATURA MAXIMA, en rad/m (radio 600 m). Es la perilla madre y sale de una cuenta, no del
// gusto: con ZZ_CENTRIF da 18 m/s de deriva a velocidad de crucero (74 m/s), o sea el 60% de los
// 30 m/s que da la palanca a fondo. La curva mas cerrada del juego SIEMPRE se puede sostener
// yendo normal — y el jugador siente que la esta sosteniendo, que es distinto de que sea gratis.
export const ZZ_CURV_MAX = 1 / 600;
// LA DERIVA: deriva = curv * spd * ZZ_CENTRIF, en m/s. curv*spd es la velocidad de guiñada
// (rad/s), asi que esta constante son "metros de corrimiento lateral por radian girado".
// Es proporcional a la velocidad UNA vez y no al cuadrado: asi el turbo es peligroso (RF-04)
// sin volverse absurdo.
export const ZZ_CENTRIF = 150;
// tope de la deriva. Debajo de los 30 m/s de la palanca a proposito: aun en el peor caso, ir a
// fondo hacia adentro deja UNA chance.
export const ZZ_DERIVA_MAX = 26;
// desde aca el avion avisa que se le va (banqueo al tope + roce). Sin cartel: el avion lo dice.
export const ZZ_DERIVA_AVISO = 22;
// EMPALME entre curvaturas distintas, en metros. Una curva entra en ~1,6 s a crucero: se ve
// venir y no sacude. Tambien es el ancho del fundido de la ventana desde/hasta.
export const ZZ_EMPALME = 120;
// largo minimo de una curva (media onda), en metros. Menos que esto no es una curva, es un
// tiron — el validador lo rechaza en vez de dejarlo pasar.
export const ZZ_LARGO_MIN = 250;
// LA TABLA de corrimiento lateral: hasta que profundidad se calcula y con que paso. 400 cubre
// SPAWN_Z (320) con margen; con paso 4 son 101 muestras por cuadro, que es nada.
export const ZZ_BEND_Z = 400, ZZ_BEND_PASO = 4;
// cuanto INCLINA la curva el horizonte, en radianes (~10°). Debajo de BANK_TILT (0.44) a
// proposito: la curva inclina menos que la palanca a fondo, asi el jugador sigue mandando sobre
// el horizonte en vez de que se lo mueva el mapa.
//
// BAJADO DE 0.30 (17°) A 0.18 POR PLAYTEST. Sobre mar abierto —plano y sin nada al costado— 17°
// sostenidos durante toda una curva marean: el mundo se inclina y el ojo no tiene contra que
// explicarlo. La inclinacion no es lo que comunica la curva; lo que la comunica son LAS PAREDES
// y el fondo corriendose. Este numero solo la acompaña.
export const ZZ_TILT = 0.18;
// cuanto ADELANTA la camara la mirada hacia el apice, en unidades de mundo.
//
// BAJADO DE 9 A 4 POR PLAYTEST, y es la mitad del diagnostico del mareo: con 9, el avion quedaba
// corrido un 18% del ancho del cuadro sin ninguna razon visible ("se mueve casi solo para un
// costado sin sentido"). El paneo del stick derecho (CAM_PAN) es 6, o sea que la mirada a la
// curva ahora es MENOS que mirar para abajo a proposito — que es la proporcion correcta.
export const ZZ_CAM_LEAD = 4;
// cuanto se corren el telon y las colinas del horizonte con el rumbo, en pixeles por radian.
// Es lo mas barato que existe y lo que mas vende que doblaste: las sierras del fondo se mueven.
export const ZZ_FONDO_K = 140;

// ---------------- LAS PAREDES DEL CALLEJON (PLAN_PASILLO_ZIGZAG Z3) ----------------
// Las laderas a los costados del carril. NO son decorado: son EL MARCO DE REFERENCIA que hace
// legible el viraje —sin nada al costado, el mundo inclinandose sobre mar plano marea— y son la
// consecuencia que convierte el trazado en una regla: seguis el camino o chocas.
//
// Viven en el MARCO DEL CARRIL, igual que todo lo demas: se dibujan a ±ZZ_PARED_X y doblan en
// pantalla con el mismo `bendW(z)` que el resto del mundo.

// semi-ancho del callejon, en unidades de mundo. SPAWN_X es ~41: cinco de margen para que nada
// pueda nacer adentro de la roca aun antes del recorte del sembrador.
export const ZZ_PARED_X = 46;
// EL PIE de la ladera: cuanto antes del muro empieza a cobrar. La roca no es un vidrio vertical.
export const ZZ_PARED_TALUD = 4;
// altura plena de la ladera. Mas que CLIFF_H1 (22) porque es un CERRO, no un acantilado suelto —
// pero por debajo de FLY_TOP (68): saltarla por arriba es una salida legitima, y cara (arriba te
// carga el radar).
export const ZZ_PARED_H = 26;
// margen para pasarla por encima: hay que superar la cresta por un 5%.
export const ZZ_PARED_LIBRE = 1.05;
// cada cuantos metros cambia de altura la cresta. Chico = sierra dentada; grande = lomas largas.
// 55 da cerros que se leen como cerros a la velocidad a la que se vuela.
export const ZZ_PARED_BANDA = 55;
// HASTA DONDE SE DIBUJA LA LADERA. Tiene que llegar AL HORIZONTE, no a una distancia comoda: con
// 260 m (el primer valor) la ultima rebanada caia unos pixeles por debajo del horizonte y entre
// ella y la linea del horizonte quedaba una FRANJA SIN NADA — por ahi se veia el mar, y el cerro
// se leia cortado. Un terreno tiene que recederse hasta el punto de fuga igual que el agua.
//
// Que sean 1200 m no cuesta lo que parece: pasada la niebla total todas las columnas pintan
// exactamente el mismo color, y el paso crece con la distancia (ver ZZ_PARED_PASO).
export const ZZ_PARED_Z = 1200;
// PASO base, en metros. Cerca se muestrea fino; lejos el paso crece con la profundidad para que
// cada columna siga midiendo ~un pixel — la misma idea que el paso adaptativo del mar.
export const ZZ_PARED_PASO = 4;
// DESDE DONDE empieza a comerse la ladera la niebla de distancia. Entre esto y ZZ_PARED_Z el cerro
// se funde al color del horizonte — SIN perder opacidad: lo que se desvanece es su color, no su
// materia. Bajarlo mete mas niebla; subirlo deja el fondo mas nitido y arriesga que se note el
// canto donde termina el dibujo.
// LA PENDIENTE DE LA LADERA: cuanto se RETIRA la cresta hacia afuera por cada metro de altura.
// Con 0.45, un cerro de 26 m tiene la cresta 12 m mas afuera que el pie.
//
// ES LO QUE SEPARA UN CERRO DE UN MURO, y es geometria de verdad, no textura: la primera version
// dibujaba la cara perfectamente VERTICAL, y una cara vertical se lee como pared por mas textura
// que se le ponga encima. Ademas le da al callejon una regla nueva y natural: abajo es angosto y
// arriba es ancho, asi que volar a ras aprieta y trepar afloja — al precio del radar.
export const ZZ_PARED_PEND = 0.45;
// ONDULACION del pie de la ladera, en unidades de mundo. Sin esto la base es una recta de tiralineas
// a lo largo de cientos de metros, que es la otra mitad de por que se veia plano.
export const ZZ_PARED_ONDA = 4.5;
export const ZZ_NIEBLA_Z0 = 70;
// A QUE DISTANCIA la niebla ya es TOTAL, en metros ABSOLUTOS. Va aparte de ZZ_PARED_Z a proposito:
// la distancia de dibujo tiene que llegar al horizonte (1200 m) pero la niebla tiene que cerrar
// mucho antes, o el cerro lejano conservaria color propio y se veria su silueta recortada contra
// el agua. Pasado esto, cada columna pinta el mismo color y el terreno se funde de verdad.
export const ZZ_NIEBLA_FULL = 210;

// ---------------- LAS PUNTAS DE TIERRA (PLAN_PASILLO_ZIGZAG Z3.b) ----------------
// LO QUE DE VERDAD HACE EL CALLEJON, y lo dijo el playtest: no es que el camino doble — es que
// LA TIERRA SE METE ADENTRO DEL PASILLO y hay que esquivarla.
//
// El primer intento doblaba el CARRIL, y aunque funcionaba, se sentia mal: "como si se moviese el
// avion solo". Tenia razon — con la camara virando, el jugador deja de ser el dueño del avion.
// Aca la camara no se mueve NADA: el mundo esta derecho, y lo que cambia es la forma de la costa.
// El zigzag lo hace el jugador esquivando, que es donde tiene que estar.
//
// LA GARANTIA DE PASO: en cada banda, UNA sola punta y de UN solo lado (lo sortea el hash). Asi el
// callejon nunca se cierra por construccion — no hace falta ningun chequeo de "¿se puede pasar?",
// que es la clase de cosa que falla el dia que alguien toca un numero.

// cada cuantos metros PUEDE haber una punta. 190 a velocidad de crucero es una cada ~2,5 s.
export const ZZ_PUNTA_CADA = 190;
// cuantos metros de largo tiene la punta a lo largo del camino. 70 la hace un promontorio y no
// una pared cruzada: se ve venir, se rodea, se sale.
export const ZZ_PUNTA_LARGO = 70;
// CUANTO SE METE la punta mas grande, en unidades de mundo. Con ZZ_PARED_X = 46, una punta de 66
// pone la cara de la roca en x = +20: el pasillo queda abierto SOLO del otro lado, y hay que
// cruzarlo entero. A 30 m/s de palanca, ir de x=0 a x=33 lleva ~1,1 s, y la punta se ve venir
// desde 260 m (3,5 s) — exigente y justo.
//
// SUBIDO DE 30 A 66 POR PEDIDO DEL PLAYTEST ("que ocupen mas espacio del pasillo para obligar al
// jugador a moverse casi al otro extremo"). No todas llegan ahi: el tamaño se sortea en tres
// escalones (ver `paredEntra`), y esta perilla es el techo del mas grande.
export const ZZ_PUNTA_MAX = 66;
// EN CUANTOS METROS el callejon llega a su dureza plena. Arranca al 55% y escala: las primeras
// puntas son de aprendizaje y las ultimas son las que ocupan todo. Se mide desde donde empieza el
// callejon, no desde el despegue.
export const ZZ_PUNTA_RAMPA = 2600;
// que fraccion de las bandas trae punta. 0.72: la mayoria, pero no todas — un callejon donde
// SIEMPRE hay una punta deja de tener ritmo y pasa a ser una slalom de metronomo.
export const ZZ_PUNTA_P = 0.72;

// ---------------- CUANDO ARRANCA EL CALLEJON, Y SU MESETA (Z3.c) ----------------

// EL CALLEJON NO EMPIEZA EN EL METRO CERO. Un callejon que ya esta ahi al soltar el freno no es un
// lugar al que se ENTRA — es el mapa, y encima tapa el despegue. Este es el piso absoluto en
// metros; ademas, en una mision que despega de tierra, las paredes esperan a que la base quede
// atras (`cfg.coast` + margen). Con `desde` declarado, manda `desde` — esto es solo el piso.
export const ZZ_ARRANQUE = 700;
// cuanto margen despues del final de la base antes de que aparezca la primera ladera
export const ZZ_ARRANQUE_BASE = 160;

// LA MESETA: cuanto se extiende hacia AFUERA la superficie de tierra arriba de la ladera. Es lo
// que hace que la pared deje de ser una pared y pase a ser un CERRO con su campo arriba — y es lo
// que se ve cuando se la pasa por encima, que si no seria un vacio. 200 alcanza para tapar hasta
// el borde de la pantalla desde cualquier altura jugable.
export const ZZ_MESETA_W = 200;

// ---------------- LAS BARRERAS: EL CALLEJON CERRADO (zigzag Z8) ----------------
// Cada tanto, el callejon se CIERRA de lado a lado y hay que pasarlo por arriba o por abajo. Es la
// unica excepcion a la garantia de paso de las puntas ("nunca las dos a la vez"), y es a proposito:
// lo que aquella regla protege es que el pasillo se pueda recorrer ESQUIVANDO DE COSTADO. La
// barrera cambia de eje — te saca del plano horizontal y te obliga a usar la unica herramienta que
// el juego tenia guardada, que es la altura.
//
// DOS FORMAS, y las dos salen del mismo primitivo (una franja maciza entre dos alturas):
//   ROCA     macizo desde el agua hasta su cresta. Se pasa POR ARRIBA, trepando.
//   PUENTE   una losa colgada en el aire. Se pasa POR ABAJO —rasante, que es el juego— o por
//            encima, que es mas seguro y mas lento.
//
// SE VE VENIR. El callejon se dibuja hasta 1200 m y la barrera cruza el pasillo entero, asi que a
// 150 m/s aparece OCHO SEGUNDOS antes de llegar. Eso es lo que la separa de una trampa: no hay que
// memorizarla, hay que leerla.

// EL TAMAÑO DE LA BANDA en la que puede caer una barrera, y CON QUE PROBABILIDAD cae en cada una
// (ninguno / pocos / muchos, la perilla de OPCIONES).
//
// La cantidad es ALEATORIA y no un metronomo: antes habia exactamente una cada 900 m y el callejon
// se aprendia de memoria en dos vueltas — sabias cuando venia la proxima sin mirar. Ahora la banda
// es mas chica y en cada una se sortea si hay o no: con POCOS aparecen espaciadas y con MUCHOS se
// encadenan, pero en los dos casos NO SE SABE. La banda sigue garantizando que dos nunca se
// pisen, que es lo unico que no puede ser al azar.
export const ZZ_BARR_CADA = 620;
export const ZZ_BARR_P = [0, 0.38, 0.85];
// cuanto mide de PROFUNDIDAD la franja, en metros. Es un muro, no una loncha: con menos de veinte
// se cruza antes de que el ojo la resuelva, y pasa a ser un dado en vez de una lectura.
export const ZZ_BARR_LARGO = 22;
// LA ROCA: entre que alturas queda su cresta. Es un COLLADO entre dos cerros — mas baja que las
// laderas de al lado (26), que es lo que un collado es de verdad.
//
// BAJADO DOS VECES, y la segunda la decidio una medicion, no el gusto. Primero 30..42: a cuarenta
// metros de distancia eso LLENA la pantalla de marron, geometricamente correcto y visualmente
// ilegible. Despues 24..34, y ahi aparecio lo importante: volando a 40 m SIN NINGUNA BARRERA el
// avion se muere en TRES SEGUNDOS, porque RADAR_ALT es 20 y arriba te llueven misiles. O sea que
// una roca que pide 34 no pide una trepada: pide comerse una oleada. La barrera no puede depender
// de una mecanica de castigo para ser pasable.
//
// 14..20 la deja justo DEBAJO del filo del radar: el jugador tiene que salir de la franja rasante
// —que es donde vive y donde puntua— y asomarse al borde, sin cruzarlo. Ese es el precio correcto,
// y es el mismo que el juego ya cobra en todos lados. El que quiera pasarla mas arriba, puede: le
// va a costar el radar, y esa sigue siendo su decision.
export const ZZ_BARR_ROCA = [14, 20];
// EL PUENTE: a que altura queda su PANZA (por debajo se pasa) y cuanto mide de grosor.
//
// Y ACA ESTA LA ASIMETRIA QUE HACE QUE LAS DOS FORMAS NO SEAN LA MISMA: la roca te empuja HACIA
// ARRIBA, hacia el borde del radar, o sea afuera de donde el juego premia. El puente te empuja
// HACIA ABAJO, a pasar por un hueco de doce metros a ras del agua — que es exactamente lo que el
// juego se llama. Una es el precio, la otra es la recompensa, y por eso conviene mezclarlas.
export const ZZ_BARR_PUENTE = [13, 20];
// EL CANTO DEL PUENTE DE ACERO. Subio de 5 a 9, y no es gusto: la celosia vive ADENTRO de este
// numero, asi que con cinco metros las cruces salian de siete de ancho por cinco de alto — unas
// equis tan aplastadas que a 130 m no se leian, y el puente entero quedaba como una regla
// metalica cruzando el barranco. Con nueve, la celosia tiene proporcion de celosia.
export const ZZ_BARR_GROSOR = 9;
// EL ARCO DE ROCA: los dos cerros se cierran arriba y dejan un hueco CURVO. `ALTO` es la luz en el
// centro (donde el arco es mas alto) y `ANCHO` el semiancho de la boca. Es la unica de las cuatro
// pieles cuya colision no es una franja recta — el hueco es un arco, asi que la roca baja hacia
// los costados, y si la cuenta no siguiera la curva el dibujo estaria mintiendo.
// EL PUENTE DE MADERA: a que altura queda su tablero y cuanto mide de canto con la baranda.
//
// REEMPLAZA AL ARCO DE ROCA, que se saco. El arco se dibujaba como una PLACA a una sola
// profundidad pegada delante del pasillo, y por eso se leia como una figurita: no salia del
// terreno, estaba puesto encima. Para que saliera de verdad de la misma estructura tendria que ser
// un AGUJERO en el terreno, y el terreno del callejon es un campo de alturas — puede subir y
// bajar, no puede tener huecos. Un puente, en cambio, ES una cosa aparte apoyada sobre el barranco:
// que se lea como un objeto puesto ahi no es un defecto, es lo que es.
export const ZZ_BARR_MADERA = [12, 19], ZZ_BARR_MADERA_CANTO = 4;
// LOS CABLES: a que altura cuelga el tendido y cuanto ocupa de arriba a abajo (el manojo entero,
// con la panza de la catenaria incluida). Es lo que de verdad mata pilotos bajos, y es tenso
// porque casi no se ve — por eso las TORRES van bien marcadas: el cable se adivina desde ellas.
export const ZZ_BARR_CABLE = [11, 18], ZZ_BARR_CABLE_MANOJO = 4.5;
// margen de gracia, en metros: la barrera cobra un poco mas adentro de lo que se dibuja. Misma
// razon que el talud de la ladera — morir contra una linea invisible pegada al dibujo es injusto.
export const ZZ_BARR_MARGEN = 1.2;

// QUE FRACCION de los antiaereos nace EN LA LADERA en vez de en el agua (zigzag Z5). No es 1 a
// proposito: un callejon donde todos estan arriba deja el agua vacia, y la mezcla de los dos es lo
// que obliga a mirar arriba Y abajo.
export const ZZ_LADERA_P = 0.55;
// RAFAGA de los antiaereos de la ladera: cuantos tiros seguidos y cada cuanto. Es lo que convierte
// un cañon suelto en una MANGUERA cruzando el pasillo, que es la imagen de San Carlos.
export const ZZ_LADERA_RAFAGA = 3, ZZ_LADERA_RAF_CD = 0.16;

// ---------------- LAS FASES DE UNA MISION (PLAN_MISION_CINCO_FASES §11) ----------------
//
// EL FILO: el techo de radar ESTRANGULADO por fase. No es una mecanica nueva — es la RENDIJA que
// este mismo archivo describe arriba (ver FOG_TOP / RADAR_ALT) con la perilla que le faltaba, la
// que el ROADMAP #27 venia pidiendo: "bajar por tramo de mision y estrangular el corredor".
//
// Entre el agua (que ya cobra con SCRAPE_*) y el techo queda una banda que hay que SOSTENER, con
// el bob, el viento y el oleaje moviendote. Bajar la mata; subir te pinta.
//
// 9 Y NO 6, y el numero lo corrigio el primer playtest. Con el techo en 6 la banda medida contra
// la velocidad REAL del tramo era impracticable: al filo se llega a ~150 m/s, y ahi tocar el agua
// deja 0.64 s de margen (0.35 con turbo). O sea que el jugador quedaba prensado entre un techo que
// lo pinta en 1.4 s y un piso que lo mata en medio segundo — y lo que lo mataba era el PISO, que
// es justo el fracaso aburrido. Textual del playtest: "es dificil tedioso y largo".
// 9 deja una banda volable que sigue estando muy por debajo de RADAR_ALT (20) y sigue premiando la
// racha rasante (CAZA_RAS_ALT, que es BANDA_ALT) al que quiera apretar mas de lo necesario.
export const FILO_RADAR = 9;

// LA RAMPA DEL TECHO, en metros. El techo NO cae de golpe de 20 a 9 al entrar al filo: baja a lo
// largo de estos metros. Es la correccion del sintoma mas concreto del playtest — "yendo con turbo
// al querer bajar rapido el avion me rebota y se me hace pelota": un techo que aparece de golpe
// obliga a una picada de panico, y una picada con turbo contra el agua es 0.21 s de margen. Con la
// rampa ya venis bajando cuando el techo muerde, y la decision deja de ser un reflejo.
// 900 m son ~6 s a velocidad de crucero: alcanza para acomodarse sin que el tramo se vuelva rampa.
export const FILO_RAMPA_M = 900;

// CUANTO PERDONA EL AGUA adentro de un filo (multiplicador del margen de roce). El tramo es de
// SIGILO: lo que tiene que matarte es que te vean, no un panzazo. Con el margen de siempre el agua
// se comia casi todas las muertes del filo y la mecanica no llegaba a existir — el jugador nunca
// descubria para que era el tramo. x3 lleva el margen a 150 m/s de 0.64 s a 1.9 s: seguis sin poder
// vivir en el agua, pero un toque ya no es una sentencia.
export const FILO_AGUA = 3;

// TOPE de `hasta` en una lista de fases. A diferencia de los TRAMOS —que viven adentro del pasillo
// y por eso cortan en 1— las fases cubren la MISION ENTERA, y la vuelta ocurre PASADO el objetivo:
// sus fracciones son mayores que 1 a proposito. El tope existe igual para que un 40 escrito de mas
// sea un error de datos y no una fase que no termina nunca.
export const FASE_MAX_HASTA = 4;

// CONSUMO BASE del pasillo, en % de tanque por segundo. Estaba escrito a mano adentro de
// systems/flight.js —el unico numero de combustible del juego sin constante propia— y sale aca
// para que la fase pueda multiplicarlo (PLAN_MISION_CINCO_FASES §3). Los valores son EXACTAMENTE
// los que estaban: crucero 3.2. El turbo sumaba FUEL_BOOST = 4.2 fijo; desde el 23/9 cuesta en
// proporcion a lo que acelera (core/nafta.js `extraTurboPorSeg`, PLAN_NAFTA_ALCANCE §6.6).
export const FUEL_RATE = 3.2;

// EL PICO POR PIRUETA (§3 del plan: "si no cuestan, el jugador vuela haciendo toneles"). Es un
// cobro FIJO al arrancar la maniobra, no una tasa: lo que se paga es la decision, no el rato que
// dura. 1.5% de tanque es ~medio segundo de crucero — se siente en una cadena de piruetas y no
// castiga la que te salva la vida, que es exactamente el equilibrio que el item pide.
// Solo cobra con COMBUSTIBLE: SI; sin el, las piruetas siguen siendo gratis como siempre.
export const FUEL_PIRUETA = 1.5;

// ---------------- LA NAFTA COMO ALCANCE (docs/sistemas/PLAN_NAFTA_ALCANCE.md) ----------------
//
// El tanque medido en KM DE CRUCERO ALTO y el gasto cobrado por km recorrido. Solo lo usan las
// misiones que declaran `ruta:`; el resto sigue en % por segundo (FUEL_RATE). La cuenta vive en
// core/nafta.js. Los km son PROVISORIOS (van al historiador, PREGUNTAS_HISTORICAS "LA NAFTA COMO
// ALCANCE"): corregirlos es cambiar estos numeros, no la logica.

// El tanque interno del A-4B/C: 1.600-1.860 km segun la fuente. Uno en el medio.
export const TANQUE_INTERNO_KM = 1700;
// Lo que suma CADA tanque externo. Con dos tanques de ala son 2.600 km: la carga base vuelve sola.
export const TANQUE_EXTRA_KM = 450;
// Cuando un tanque cuenta como LLENO (fraccion de su capacidad). Decide cuanto pega soltado
// (grave y explota si lleno, medio si vacio — PLAN §3.7). Mitad: un tanque a medio usar todavia
// es mas nafta que aire.
export const TANQUE_LLENO_FRAC = 0.5;

// LAS TRES ZONAS DE GASTO, de arriba hacia abajo (PLAN §3.6, pedido del autor: "MAYOR GASTO bien
// abajo, GASTO MEDIO en medio y gasto menor ARRIBA DE TODO"). Escalonadas y no una curva, para
// que el altimetro pueda decir en que zona estas con una palabra. `desde` es la altura de mundo
// donde empieza la zona; `f` multiplica los km.
//   · la frontera de abajo es RADAR_ALT (20) A PROPOSITO: la zona donde no te ven es la que mas
//     quema, y una sola linea del altimetro dice las dos cosas.
//   · la de arriba es CH_ALT (48): la cita con la Chancha cae en la zona barata.
// Si se mueven, mover tambien los carteles del HUD (N3), que se pintan con estas mismas alturas.
// (8/10, el autor: "es IMPOSIBLE la cantidad de gasolina que manejo"): el ras quemaba x3 y una ida al
// ras dejaba 200 km de los 2.600 — la vuelta pedia 2.000. Ahora x1,5: la mision entera al ras entra con
// lo justo, volar alto en el transito sobra, y la Chancha es ayuda, no obligacion. El medio va entre los dos.
export const ZONAS_GASTO = [
  { id: 'menor', desde: CH_ALT, f: 1 },
  { id: 'medio', desde: RADAR_ALT, f: 1.25 },
  { id: 'mayor', desde: -Infinity, f: 1.5 },
];

// SOSTENER EL RASANTE TE DEVUELVE EL VUELO NORMAL (pedido del autor, 26/9/2026): "mantener el efecto
// rasante debe reducir el gasto de nafta a un vuelo normal". Abajo del radar se quema x3 (arriba):
// el aire es denso y el motor empuja. Mientras sostenes el ESTADO rasante —o su poder—, se paga
// esto en su lugar.
//
// "VUELO NORMAL" ES LA TARIFA BASE, y cae en el mismo lugar en las dos cuentas de nafta: con ruta es
// el km de crucero alto (la zona `menor`, f 1, que es la unidad en que se mide el tanque), y sin
// ruta es el crucero (x1), contra el x2 de las fases rasante y filo. Por eso es UN numero para las
// dos. Si el premio resulta demasiado, 1.8 lo deja en "gasto medio".
//
// Es la otra mitad de por que vale la pena el estado rasante: ya te protegia del agua y te cargaba
// el poder; ahora ademas es la unica forma de volar bajo sin pagarlo. Lo mas dificil del juego
// deja de ser lo mas caro.
export const RAS_GASTO_F = 1;

// EL ROPERO: cuanto suma al arrastre cada cosa colgada. El avion limpio vuela a x0.85 (lo que la
// fase `vuelta` ya cobraba por "venis liviano"); cada bomba y cada tanque le suman lo suyo. Con
// esto tres bombas y dos tanques + bomba dan x1.15, una bomba sola x0.95. Soltar algo baja el
// numero en el acto — es la mitad de por que se sueltan los tanques (PLAN §3.7).
export const ARRASTRE_LIMPIO = 0.85;
export const ARRASTRE_BOMBA = 0.1;
export const ARRASTRE_TANQUE = 0.1;
// …Y LA VELOCIDAD QUE DA SOLTAR (N5, y con PESO desde el 30/9: "tirar los tanques y/o las bombas
// hacen que el avion sea mas liviano, por ende mas rapido"). Dos cosas frenan al avion cargado:
//   el ARRASTRE de lo que cuelga (tanque lleno o vacio, arrastra igual), y
//   el PESO: el avion, cada bomba con sus kg (MK-17 500, BRP-250 250, data/bombas.js), cada tanque
//   vacio y LA NAFTA QUE LE QUEDA ADENTRO. Por eso un tanque se aliviana mientras se quema, y soltar
//   uno lleno acelera mas que uno vacio (y tira la nafta: la decision cara, PLAN §3.7).
// La velocidad relativa a la carga base (2 tanques llenos + MK-17 = x1) es
//     (arrastre base / arrastre)^VEL_ARRASTRE_EXP × (masa base / masa)^VEL_PESO_EXP
// Con estos numeros: la base con los tanques ya secos +7%, soltados +14%, limpio del todo +20%;
// 3 bombas +4%, 1 bomba sola +14%. El turbo multiplica ENCIMA (y no se cobra lo que da el peso).
// EN TODAS LAS MISIONES Y MODOS, con o sin `ruta`, primera o tercera persona (pedido 30/9: el avion
// del pasillo es uno solo). Con los dos exponentes en 0 soltar no acelera nada. Los kg son del A-4B/C redondeados: la velocidad es juego, no tabla de performance.
export const VEL_ARRASTRE_EXP = 0.25;
export const VEL_PESO_EXP = 0.35;
export const PESO_AVION_KG = 7000;         // vacio + el interno + piloto y cañones (constante)
export const PESO_TANQUE_VACIO_KG = 120;   // el tanque de ala, la chapa sola
export const PESO_NAFTA_KG_KM = 2;         // kg de nafta por km de alcance (450 km ≈ 900 kg, 1100 l)
export const PESO_BOMBA_KG = 500;          // la bomba de referencia (MK-17) si nadie dice cual

// ---- LOS TANQUES COMO ARMA (PLAN_NAFTA_ALCANCE §3.7, N6) ----
// Pedido del autor: "la bomba tiene daño letal, el tanque lleno daño grave y [explota] si es algun
// barco o algo explosivo, y un tanque vacio daño medio. Dos tanques vacios podrian dañar como un
// tanque lleno sin una explosion, derrotar un avion o un helicoptero con uno solo y un barco con 2".
// Caen con la balistica de la bomba (collision.js), sin eyector: se desprenden, no se disparan.
//
// CONTRA EL BUQUE, en fraccion del daño de una bomba: lleno = una bomba, vacio = media. Asi el
// PAR vacio al centro lo hunde, y uno solo lo deja averiado.
export const TQ_BUQUE = { lleno: 1, vacio: 0.5 };
// CONTRA LO DEMAS: el lleno mata lo que toca; el vacio saca estos puntos de vida (medio: un
// antiaereo de 3 queda a 1) — salvo lo que VUELA, que cae con uno solo.
export const TQ_DANO_VACIO = 2;
export const TQ_AIRE = ['jet', 'helo'];
// LO QUE EXPLOTA cuando le pega un tanque LLENO: la nafta encendida alcanza a lo que este cerca
// (TQ_ONDA_X / TQ_ONDA_Z, en unidades de mundo). El vacio no enciende nada.
export const TQ_EXPLOSIVOS = ['depot', 'aatruck', 'lcu', 'aa', 'tower'];
export const TQ_ONDA_X = 12;
export const TQ_ONDA_Z = 16;
// DE DONDE CAE CADA UNO: los de ala a esta distancia del eje (el ancho de los pilones visto desde
// atras), el del centro en el eje.
export const TQ_ALA_X = 3;

// LA RAMPA DEL HORIZONTE DE RADAR, en metros de pasillo (PLAN_NAFTA_ALCANCE §3.4, N2). Con `ruta`,
// el radar no existe hasta `radarKm` del blanco; al cruzar esa linea el techo baja desde FLY_TOP
// hasta el de la fase a lo largo de estos metros. Es la rampa del filo y por el mismo motivo: un
// techo que aparece de golpe obliga a una picada de panico. Al SALIR del alcance (la vuelta) no hay
// rampa: recuperar el cielo no se prepara.
export const RUTA_RADAR_RAMPA_M = FILO_RAMPA_M;

// ---------------- EL ATERRIZAJE (PLAN_MISION_CINCO_FASES §4) ----------------
//
// Lo unico enteramente nuevo del plan: existe el despegue y el aterrizaje habia que escribirlo.
// Se miden CUATRO cosas, y las cuatro pelean entre si — esa es toda la mecanica:
//   velocidad · regimen de descenso · cuando sacas el tren · actitud al tocar
//
// LA REGLA QUE MANDA SOBRE TODAS: un mal aterrizaje CUESTA (chapa y puntaje) y NUNCA hace perder
// la mision. Llegaste; lo que se decide aca es COMO llegaste. Por eso no hay una sola constante
// de muerte en este bloque.

// LARGO DE LA APROXIMACION, en metros. A velocidad de toma son ~12 s: alcanza para bajar,
// estabilizar y sacar el tren sin que se haga un tramo aparte.
// …y esta medido contra el descenso, no elegido a ojo: desde LAND_ALT0 y con el avion estable en
// la ventana de velocidad, la toma cae alrededor de los seis segundos. 520 m es lo que se recorre
// en ese rato, o sea que las ruedas tocan CERCA de la cabecera y no cuatrocientos metros antes.
export const LAND_APPROACH_M = 520;
// ALTURA a la que arranca la aproximacion (unidades de mundo). Bien por debajo de RADAR_ALT: ya
// no hay radar que te busque, estas en tu casa.
export const LAND_ALT0 = 13;

// LA VENTANA DE VELOCIDAD. El A-4C entra en perdida a ~225 km/h (dato de ficha), y en las
// unidades del juego la referencia es el crucero: 62 al entregar el despegue, 150 de techo.
// Debajo de MIN te caes de cola; arriba de MAX rebotas o te arrancas el tren.
export const LAND_SPD_MIN = 42, LAND_SPD_MAX = 88;
// …y la ventana COMODA de adentro, que es la que puntua perfecto.
export const LAND_SPD_OK = [50, 74];

// REGIMEN DE DESCENSO al tocar (unidades por segundo, negativo = bajando). Bajar rapido esta bien
// LEJOS y mal CERCA: lo que se mide es el ultimo instante, no todo el descenso.
export const LAND_VY_SUAVE = -4.5;   // hasta aca, toma de manual
export const LAND_VY_DURO = -11;     // pasado esto, el tren pega contra la pista

// LA ACTITUD: nariz arriba. Se lee del cabeceo real del avion al tocar — de trompa te clavas.
export const LAND_PITCH_OK = -0.12;

// EL TREN. `GEAR_T` (arriba) ya dice lo que tarda en moverse; esto es lo que CUESTA tenerlo
// afuera: frena. Es el precio de sacarlo temprano, y la razon de que el momento importe.
export const LAND_GEAR_DRAG = 26;    // cuanto empuja la velocidad hacia abajo, por segundo
// …y cuanto antes de tocar hay que tenerlo ABAJO para que cuente como bien sacado.
export const LAND_GEAR_MIN_T = 1.2;  // segundos

// EL COSTO, en chapa (0..100) y en puntos. Son CUATRO cobros independientes que se suman: se
// puede llegar mal de una sola cosa y bien de las otras tres, que es lo que hace que valga la pena
// corregir una y no rendirse.
export const LAND_COSTO_CHAPA = { spd: 14, vy: 22, gear: 30, pitch: 12 };
export const LAND_PTS = 2500;        // el premio por la toma perfecta; cada falla descuenta

// ---------------- LAS ESTRELLAS DE BUSQUEDA (PLAN_ESTRELLAS_BUSQUEDA.md) ----------------
//
// El radar con MEMORIA: cuantos te estan buscando. Sube al quedarte expuesto (completar la barra
// de deteccion, que ya existe) y baja si te escondes a ras. Decide QUIEN TE BUSCA — el otro eje,
// QUE HAY, lo sigue decidiendo la distancia (el `solo` de la fase), y los dos no se mezclan.
export const EST_MAX = 4;
// SEGUNDOS CONTINUOS por debajo del techo vigente para bajar una estrella. Continuo y no
// acumulado: asomarse reinicia el reloj, y eso es lo que lo convierte en un compromiso.
//
// 20 SALE DE UNA CUENTA. Esconderse es volar rasante, que quema al doble: a la escala de t15 son
// ~8% del tanque por estrella, o sea que bajar de cuatro a cero cuesta un tercio de la mision
// escondido. Tiene que doler. Es LA PERILLA que va a mover el primer playtest.
export const EST_PERDER_S = 20;
// …pero un bob no te delata. Asomarse menos que esto no reinicia el reloj: sin esta gracia, el
// oleaje y el cabeceo hacen imposible sostener veinte segundos limpios y la mecanica seria una
// moneda al aire en vez de una decision.
export const EST_GRACIA_S = 1.2;

// CUANTO LE SOBRA AL HARRIER sobre el terreno, en unidades de mundo. Hasta que esto existio su
// unico piso era el nivel del mar, asi que en un CALLEJON volaba dentro de la roca y se lo veia
// atravesar el acantilado. No es holgura de dibujo: es la altura a la que un avion pasa una
// cresta sin rozarla, y el sprite ya mide ~2 de semi-alto.
export const CAZA_SOBRE_TERRENO = 2.5;

// ---------------------------------------------------------------------------------------------
// SIN COMBUSTIBLE (PLAN_VUELTA_REAL V6, rehecho 25/9). El que se seca SALE: si queda escuadron,
// vuelve con la reserva ("me estoy quedando sin combustible…") y el compañero asume; si era el ultimo, se eyecta y
// la mision se pierde. Sin planeo ni tecla — el jugador no hace nada.
// Con cuanto entra el compañero: `naftaCompanero` en core/squad.js.
/** Rescate: a cuantos km de la costa propia (el continente) o de la Gran Malvina (el blanco) un
 *  piloto eyectado todavia llega a que lo saquen del agua. Mas lejos, el frio del Atlantico Sur. */
export const EYEC_KM_CASA = 150, EYEC_KM_ISLA = 60;

// ---------------- EL SEA WOLF (pedido del autor 28/9) ----------------
// El misil de defensa CERCANA de las fragatas: corto alcance, muy rapido, guiado desde el buque y
// hecho para blancos bajos — volar pegado al agua NO lo evita (eso sirve contra el Sea Dart, el del
// radar). Se esquiva de otras tres formas: un QUIEBRE LATERAL en el ultimo instante (en su tramo
// ciego ya no corrige), la VENTANA DE RECARGA despues de cada salva, o CAMBIANDO DE PILOTO con misiles
// en el aire: persiguen al que se retira, y el los esquiva. Vive alrededor del buque de la suelta
// (systems/seawolf.js), con su propia zona dibujada (render/seawolf.js).
export const SW_ALCANCE = 600;    // la zona: a cuanto del buque (unidades de profundidad) empieza
export const SW_FIJA_T = 1.0;     // el aviso: segundos que el buque tarda en engancharte antes de tirar
// TIRO CONTINUO (28/9: "mas cantidad, con un pequeño delay para esquivarlos, sin cadencia entre
// disparos, porque la rapidez con la que me acerco es grande"): despues del enganche sale uno cada
// SW_SALVA_DT hasta que salis de la zona. Se esquiva ZIGZAGUEANDO: un quiebre por misil.
export const SW_SALVA = 99;       // misiles por salva (99 = no para mientras estes adentro)
export const SW_SALVA_DT = 0.6;   // …con esta separacion: el pequeño respiro para quebrar entre uno y otro
export const SW_RECARGA = 2.0;    // la ventana despues de cada salva (con tiro continuo no llega a usarse)
export const SW_VEL = 230;        // lo que se le suma a la velocidad del mundo: es MUY rapido
export const SW_CIEGO = 95;       // a cuanto del avion deja de corregir: el tramo donde el quiebre sirve
export const SW_LAT = 70;         // tope de su velocidad lateral y vertical mientras corrige
export const SW_ALTO = 9;         // de que altura sale (la cubierta del buque)

// ---------------- EL SIDEWINDER: el misil de los Sea Harrier (core/aim9.js) ----------------
// Pedido del autor (30/9/2026): el Harrier deja de "tirar y errar" y te tira UNO o DOS AIM-9L por
// avion. Termicos, que te siguen. La fisica y el porque estan en el encabezado de core/aim9.js; aca
// estan los numeros, medidos contra el vuelo real con la simulacion de node (ver el unit test).
export const AIM9 = {
  // ---- DE ATRAS (el Harrier de LA COLA) ----
  // Cuanto tarda en alcanzarte si no haces nada. Es LENTO a proposito: el pedido es que "de a
  // poco se vaya acercando", y el jugador tiene que poder verlo ponerse en su cola y venir.
  COLA_T: 3.2,
  // Desde que fraccion del camino una pirueta lo PIERDE — "cuando el misil este bastante cerca".
  // 0.62 deja los ultimos ~1,2 s: un tonel (0,55 s) lanzado en cualquier momento de ahi, o un
  // poco antes y todavia en curso al entrar, lo saca. Antes no sirve: todavia puede corregir.
  COLA_ZONA: 0.62,
  COLA_LAG: 0.16,      // s que el buscador se queda atras de lo que hace el avion (se lo ve corregir)
  COLA_WOB: 0.9,       // el cabeceo del buscador, en unidades; se apaga al llegar
  // PERDIDO: sigue de largo con lo que traia y se te adelanta hasta perderse.
  PASA_VZ: 55,         // a cuanto se te adelanta (u/s relativas: el misil va a Mach 2,5 y vos no)
  PASA_KICK: 7,        // cuanto se abre hacia el lado del que vino (si no, pasaria por encima tuyo)
  PERDIDO_T: 2.6,      // s que se lo ve irse antes de borrarlo
  FIN_Z: 260,          // ...o hasta esta profundidad, lo que llegue primero
  POR_HARRIER: 2,      // la carga real de un Sea Harrier FRS.1: dos AIM-9L. Nunca mas de dos.
  // ---- VARIOS MISILES EN LA COLA (pedido del autor 1/10; `quiebreGrupal` en core/aim9.js) ----
  // Las patrullas de Harrier eran de a DOS: con dos en la cola pueden venir hasta cuatro misiles.
  // Cada uno se acerca por una ZONA distinta del avion (ZONAS, en unidades, x a la derecha e y hacia
  // arriba: un ala, la otra, arriba, abajo) y cierra hacia el centro. Una maniobra con uno ya en la
  // zona de quiebre hace que TODOS los que vienen cerca (avance >= CHOQUE_U) se den entre ellos.
  ZONAS: [[-7, 1.5], [7, 1.5], [0, 6], [0, -4.5]],
  CHOQUE_U: 0.35,      // desde que avance un misil entra al choque grupal (los mas lejanos siguen viniendo)
  CHOQUE_T: 0.4,       // s que tardan en cruzarse y estallar
  // DONDE se cruzan, relativo al avion: ATRAS tuyo (hacia la camara), corridos de costado hacia el
  // lado del que venian y un poco arriba. Nunca en tu eje ni adelante: "no encima mio", y adelante
  // "me podrian lastimar" (el autor, 1/10)
  CHOQUE_ATRAS: 6, CHOQUE_X: 8, CHOQUE_Y: 2,
  // LA EXPLOSION del choque ("tiene que ser una BUENA explosion"): dura ESTALLIDO_T y se va quedando
  // atras a ESTALLIDO_DERIVA u/s — viaja con vos, frenandose. El dibujo es render/aim9.js.
  ESTALLIDO_T: 1.6, ESTALLIDO_DERIVA: 1.6,
  CHOQUE_PTS: 400,     // puntos POR MISIL que se chocó (perder uno solo vale PTS)
  // s minimos entre un Sidewinder y el siguiente DEL MISMO Harrier cuando son PATRULLA (dos o mas en
  // la cola): ahi no espera a que el primero se resuelva, y es lo que junta varios en el aire
  PATRULLA_GAP: 0.9,
  // s entre que se RESOLVIO uno (te pego o lo perdiste) y que el mismo Harrier puede tirar el
  // segundo. Sin esto salia en la asomada siguiente, 0,4 s despues, y en la practica llega en la
  // pasada que sigue: un misil por pasada.
  COLA_RESPIRO: 2.5,
  // ---- LA EVASION CON POSCOMBUSTION (pedido del autor 30/9; `evasion` en core/aim9.js) ----
  // La otra salida de atras: POSCOMBUSTION y quiebres BRUSCOS a la vez. Brusco es ACELERAR (cambiar
  // de lado de golpe), no ir rapido: deslizarse parejo no cuenta. Medido en node contra el vuelo
  // real (los dos controles): zigzagueando cada 0,35-0,8 s desde los primeros ~1,5-2 s del disparo,
  // te pierde en ~1,6 s de quemar; un zigzag lento (1,2 s por lado), la poscombustion derecha,
  // quebrar sin poscombustion o una rafaga corta (<1 s) NO lo sacan. Tarde (ya en la zona), queda la
  // maniobra. La poscombustion se come la nafta: es la salida cara.
  EVA_A: 55,           // u/s² de aceleracion (suavizada) desde la que el movimiento es brusco
  EVA_TAU: 0.35,       // s del suavizado: un zigzag sostenido cuenta entero, un volantazo suelto no
  EVA_SUBE: 0.8,       // cuanto sube la evasion por segundo de poscombustion + brusco (llena en 1,25 s)
  EVA_BAJA: 0.5,       // ...y cuanto baja por segundo si falta cualquiera de las dos
  EVA_LAG: 0.7,        // s de atraso EXTRA del buscador con la evasion llena: el "mas delay" del pedido
  EVA_FRENO: 0.75,     // con la evasion llena cierra al 25%: mientras quemas y quebras no te alcanza
  EVA_WOB: 1.2,        // cuanto CAZA el buscador con la evasion: se lo ve dudar (el aviso de que va)
  // ---- DE FRENTE (los cazas armados del pasillo) ----
  FRENTE_V: 80,        // velocidad propia hacia vos, que se SUMA a la tuya (cierra de frente)
  FRENTE_LAT: 6,       // cuanto puede CORREGIR, u/s. Se inclina, no quiebra: vos haces 30 de lado
  FRENTE_ACC: 9,       // que tan rapido cambia de idea (u/s²): tarda en acompañar un quiebre
  FRENTE_Z: [150, 235],// banda en la que el caza suelta: de lejos, a distancia de verlo salir
  FRENTE_P: 0.45,      // que fraccion de los cazas del pasillo viene armada (la de las trazadoras)
  FRENTE_P2: 0.25,     // de los armados, cuantos traen el SEGUNDO
  FRENTE_GAP: 0.55,    // s entre el primero y el segundo del mismo caza
  // LA CAJA DE IMPACTO de frente: la MISMA que cualquier misil que cruza tu plano en collision.js
  // (3 x 2,2), y la misma que se encoge con una pirueta de alas de canto (`tight`: 1,6 x 1,2).
  CAJA: { rx: 3, ry: 2.2, rxT: 1.6, ryT: 1.2 },
  VIDA: 6,             // tope de vida de uno de frente (por si nunca cruza)
  // LA ESTELA ROJA (render/aim9.js): un punto cada ESTELA_DT, que vive ESTELA_VIDA segundos.
  ESTELA_DT: 0.03, ESTELA_N: 48, ESTELA_VIDA: 1.4,
  PTS: 150,            // esquivar uno: el doble que un misil de tierra — este te buscaba a vos
};

// ---------------- EL AVION QUE SE ESTA POR MORIR (pedido del autor 1/10) ----------------
// Con la integridad en AVERIA_HUMO o menos, el avion larga HUMO por la cola y TAMBALEA las alas:
// lo que avisa que el proximo golpe lo baja, sin mirar el reloj de salud. Los dos crecen a medida
// que la integridad baja hacia 0. El tambaleo es solo dibujo (render/plane.js): no toca el manejo.
// Solo en los modos con chapa (INTEGRIDAD y VISUAL); en ESCUADRON no hay integridad.
export const AVERIA_HUMO = 40;          // % de integridad desde el que humea y tambalea
export const AVERIA_HUMO_DT = 0.05;     // s entre bocanada y bocanada, con la integridad en 0 (al 40: el triple)
export const AVERIA_TAMBALEO = 0.16;    // rad de alabeo del tambaleo, con la integridad en 0
/** DE DONDE SALE EL HUMO (pedido del autor 2/10: "agregarle mas humo desde otro lado, desde las
 *  turbinas quiza, y variar cantidad y lugares"). Cada avion averiado sortea UNA VEZ el orden de sus
 *  focos y los va prendiendo a medida que empeora — uno al entrar en averia, dos pasando AVERIA_FOCOS[0]
 *  de agonia, tres pasando [1] —, asi que dos aviones rotos no humean igual pero ninguno parpadea.
 *    f, p   donde: `f` a lo largo del ala (-1 punta izq, 0 fuselaje, 1 punta der) y `p` hacia la panza,
 *           en fraccion de la semi-envergadura (las puntas las publica el dibujo: run.alaLx…)
 *    cada   factor sobre AVERIA_HUMO_DT (mas chico = mas seguido)
 *    tam    factor de tamaño de la bocanada
 *    col    'negro' (aceite, de la tobera y las tomas), 'gris', 'blanco' (nafta que se vaporiza del ala)
 *    chispa probabilidad de una chispa naranja por bocanada (la turbina que se esta comiendo)
 *  Las tomas de aire del A-4 van a los costados del fuselaje, a la altura de la raiz del ala. */
export const AVERIA_FOCOS = [0.4, 0.75];
export const AVERIA_FOCO = {
  tobera:    { f: 0,     p: 0.16, cada: 1,   tam: 1,    col: 'negro', chispa: 0 },
  tomaIzq:   { f: -0.2,  p: 0.04, cada: 1.3, tam: 0.85, col: 'negro', chispa: 0.25 },
  tomaDer:   { f: 0.2,   p: 0.04, cada: 1.3, tam: 0.85, col: 'negro', chispa: 0.25 },
  alaIzq:    { f: -0.62, p: 0.06, cada: 1.1, tam: 0.9,  col: 'blanco', chispa: 0 },
  alaDer:    { f: 0.62,  p: 0.06, cada: 1.1, tam: 0.9,  col: 'blanco', chispa: 0 },
};

// ---------------- LA RAFAGA DEL HARRIER (pedido del autor 1/10) ----------------
// "Algunos disparos de metralleta esquivables: un par en una determinada posicion; el jugador puede
// moverse, y si no se mueve se come la metralleta y muere." Los dos cañones ADEN de 30 mm del Sea
// Harrier, desde la cola: el Harrier ASOMA, FIJA el punto donde estas ese instante, lo MARCA
// (AVISO s, el aro rojo sobre tu avion) y tira N tiros AHI, separados por GAP. No te siguen: si te
// corriste mas de R_X / R_Y del punto, pasan de largo. Si no, te matan (death_aden no esta en la
// tabla de daño de core/damage.js: es fatal en los tres modos, como el Sidewinder).
// Sale en las asomadas que NO tiran Sidewinder (la primera, y las que siguen cuando no le quedan o
// tiene uno en el aire), una por asomada, y no la tira el ahuyentado (humo) ni el manso.
//   ESPERA  s que el ala lleva en pantalla antes de fijar (primero se lo ve, despues apunta)
//   T       s que tarda un tiro desde el cañon hasta tu profundidad (despues sigue de largo PASA s)
export const ADEN = { ESPERA: 0.35, AVISO: 0.6, N: 2, GAP: 0.14, T: 0.16, PASA: 0.45, R_X: 1.8, R_Y: 1.4, PTS: 60 };
