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
export const FOG_TOP = 17;

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
  birds: [5, 10],
  helo: [10, 15],
  jet: [15, 25],
  balloon: [6, 30],
  fuel: [4, 26],
};
/** Altura de nacimiento sorteada para el tipo `t` (ver SPAWN_Y). */
export const spawnY = t => SPAWN_Y[t][0] + Math.random() * (SPAWN_Y[t][1] - SPAWN_Y[t][0]);

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

// VIDA DE LOS ENEMIGOS. El globo cae de un tiro (es un globo); las aeronaves aguantan una rafaga
// corta, para que valga la pena sostener el disparo y apuntar. Los que tienen mas de 1 muestran
// barra de vida (ver drawHpBar en render/world.js).
export const ENEMY_HP = { balloon: 1, helo: 4, jet: 3, aa: 3, bldg: 4, lcu: 2, tent: 1, radar: 2, aatruck: 3, tower: 3, depot: 3, flag: 1 };

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
// se carga CON PUNTOS — jugar bien (rasante, derribos, roces) es lo que compra el poder, no
// esperar — y llena se LANZA con la tecla 4: rafaga corta e intensa, como un super de arcade.
// La punteria con mouse queda en tiempo real (es por frame, no por dt): blancos lentos + mira
// rapida = el poder. Estos dos son la BASE de las mejoras a futuro (niveles / avance de
// campaña): extender TEMPO_DUR y abaratar TEMPO_CHARGE es todo el arbol de upgrades.
// ---------- LA CHANCHA: EL KC-130 REABASTECEDOR (SPEC_PODER_CHANCHA) ----------
// El hermano CARO del MOMENTUM: misma familia (barra que se carga jugando, una tecla) pero una
// sola vez por corrida y recien pasado un rato largo de juego. Lo que compra no es poder: es
// NAFTA, o sea tiempo — y se paga volando alto, lento y visible, que es lo contrario de todo lo
// que el juego premia. Esa es la mecanica entera.
export const CH_CHARGE = 2000;   // puntos que llenan la barra (~3x TEMPO_CHARGE: cara a proposito)
export const CH_MIN_T = 240;     // s de mision antes de poder pedirla
export const CH_ETA = 18;        // s entre el pedido confirmado y la aparicion
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
export const CH_HOSE_X = 3;      // cuanto sale la manguera hacia el costado (del ala derecha)
export const CH_HOSE_Y = 6;      // cuanto cuelga la canasta por debajo del avion
// LA CANASTA VA A LA PROFUNDIDAD DE JUEGO (PZ = 14), o sea CH_Z - PZ metros por detras del
// Hercules. No es un capricho de largo de manguera: si la canasta estuviera a otra profundidad
// que el avion, la proyeccion las separaria en pantalla y "estar en la caja" se veria como estar
// al lado. A la misma z, la caja que se dibuja es EXACTAMENTE donde hay que poner el avion.
export const CH_HOSE_Z = 10;
export const CH_DERIVA = 7;      // amplitud de la deriva lateral (m)
export const CH_DERIVA_V = 0.22; // velocidad de la deriva (rad/s): lenta, se sigue con el timon
export const CH_SALIDA = 2.6;    // s que tarda en irse por arriba una vez que termino

export const TEMPO_SCALE = 0.35;    // el mundo a ~1/3: se nota de verdad, no un slow-mo timido
export const TEMPO_DUR = 3;         // s reales que dura el lanzamiento con la barra llena
export const TEMPO_CHARGE = 650;    // puntos que llenan la barra (subido de 500: que se gane, no que sobre)

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

// ---------- LA COLA: EL HARRIER EN LA COLA (PLAN A) ----------
// Plan y porque: docs/sistemas/PLAN_HARRIERS_PERSECUCION.md — §1 la dinamica (de donde sale cada
// regla), §2 la verdad historica que la sostiene, §3 el plan por fases, §6 lo que NO hacer.
//
// LA TESIS, otra vez y en su forma mas dura: el Sea Harrier era EL depredador del A-4 y las
// perdidas aire-aire fueron todas en un sentido. Pero los A-4 escapaban ABAJO — a ras del mar la
// solucion de tiro y el ambiente degradaban al cazador. O sea que el evento mas peligroso del
// PASILLO se sobrevive volando donde el juego ya te paga por volar: la banda del x10.
// Por eso CAZA_RAS_ALT es 4.5 y no otro numero — es EXACTAMENTE el techo de la racha rasante
// (`rasNow` en systems/flight.js y el multiplicador de core/util.js). Una sola banda, dos premios.

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
export const CAZA_RAS_ALT = 4.5;    // debajo de esta altura su punteria casi no progresa
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
export const CAZA_AMAGUE_TIRA = 2;          // desde que amague empieza a tirarte (y a errar)
// GEOMETRIA DEL AMAGUE. Asoma DETRAS tuyo (z por debajo de PZ = 14) y bien corrido del carril:
// a z 10,5 la escala es F/10,5 = 12,9, asi que 15 unidades son ~193 px del centro y el sprite
// (10,5 de ancho = 135 px) entra en cuadro por la mitad. Eso es lo que se busca — MEDIO Harrier
// asomando por el costado, no un Harrier entero tapando el juego.
export const CAZA_Z_ASOMA = 10.5;
export const CAZA_X_ASOMA = 15;    // corrimiento con el amague afuera
export const CAZA_X_ESCONDE = 32;  // ...y escondido: fuera del cuadro, a 413 px del centro

// LAS TRAZADORAS QUE PASAN LEJOS. El Harrier vuelve a disparar, pero SIN dientes: no hacen daño y
// no pueden hacerlo — no hay codigo de impacto para ellas. Son el TELL, y que pasen LEJOS es el
// contenido del tell: desde atras y en mala posicion, el tiro sale apurado y erra. Ver el
// encabezado de systems/caza.js — la regla no es "no dispara", es "no te puede pegar".
export const CAZA_TRAC_V = 340;          // velocidad propia: se ve CRUZAR, no flotar
export const CAZA_TRAC_N = [4, 7];       // proyectiles por rafaga
export const CAZA_TRAC_GAP = [0.32, 0.6];// s entre rafagas mientras esta asomado
export const CAZA_MISS = [13, 25];       // a cuanto de tu ala pasan. El avion mide ~4 de
                                         // envergadura util: a 13 ya erro por tres aviones.

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

// MISILES RASTREADORES (desde la cola). La solucion de tiro madura igual que antes, pero en vez de
// la rafaga letal sale un MISIL lento que el jugador ve acercarse y esquiva con una pirueta. Asi la
// presion trasera es esquivable visualmente (en vez de morir por algo que no ves) y el daño real
// viene de frente, donde el intercambio es justo.
export const CAZA_MSL_VZ = 5;          // velocidad z (lento a proposito: se tiene que VER venir)
export const CAZA_MSL_TURN = 18;       // aceleracion lateral de tracking (u/s²)
export const CAZA_MSL_VMAX = 10;       // velocidad lateral maxima (u/s)
export const CAZA_MSL_LIFE = 4;        // s de vida (se apaga si no llega)
export const CAZA_MSL_RX = 4.0;        // semiancho del impacto x
export const CAZA_MSL_RY = 3.2;        // semialto del impacto y

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
