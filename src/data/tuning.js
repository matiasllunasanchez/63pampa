// CONSTANTES DE AJUSTE del momentum, compartidas entre la logica (game.js) y el render
// (render/momentum.js). Viven aca para que haya UNA sola fuente: si estuvieran duplicadas,
// cambiar una y olvidar la otra desalinearia el dibujo de la jugabilidad sin que nada avise.
//
// Son las perillas para tunear el climax: subir/bajar y volver a probar.

// ZONA DE VUELO. El techo alto (FLY_TOP) es lo que da margen para picar y ganar velocidad (ver
// ENERGY_* en core/physics.js). SPAWN_X acompaña a FLY_X: si los obstaculos nacieran mas angostos
// que la zona de vuelo, bastaria irse al costado para esquivarlos todos. Compartidas por el vuelo
// (limites del avion) y el spawn (ancho del carril de obstaculos).
export const FLY_X = 38, FLY_TOP = 68, SPAWN_X = 33;

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

export const MOM_AX = 240, MOM_AY = 60;   // visor fijo en pantalla (W/2, 60) — el reflector del HUD
export const MSL_MAX = 3;                 // misiles por pasada

// GEOMETRIA DE LA BARCAZA, en pixeles de PANTALLA (grilla de mundo 480x270). Estos dos numeros
// estaban repetidos en tres lados — momShipGeom (systems/momentum.js), la aproximacion en vuelo
// normal (render/world.js) y la camara 3D (systems/three-world.js) — y si se desincronizan el
// barco SALTA al entrar al momentum. Viven aca para que haya una sola fuente.
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
