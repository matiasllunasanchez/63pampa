// ESTADO COMPARTIDO: lo unico que varios sistemas escriben.
//
// Esto NO es una bolsa donde va todo. La regla que lo mantiene chico:
//   si una variable la escribe UN SOLO sistema, no entra aca — se queda con su sistema.
// Por eso `fireT`, `nextSpawn`, `windT`, `rollT` y compania no estan: tienen un dueño claro y
// viajan al modulo que los escribe cuando ese modulo se extrae.
//
// Hay dos formas distintas de compartir, y la diferencia es a proposito:
//
//   1. OBJETOS DE IDENTIDAD ESTABLE (cfg, cam, plane, stats) — se exportan directo y se importan
//      por nombre. Nunca se reasignan: se MUTAN. Eso es lo que los hace seguros de compartir
//      entre modulos, porque todos apuntan al mismo objeto para siempre. Reasignar `plane` en
//      vez de mutarlo dejaria a los demas modulos mirando un objeto viejo, y el bug seria mudo:
//      el juego seguiria andando, dibujando un avion que ya no es el que vuela. Por eso reset()
//      llama a resetPlane() en lugar de crear uno nuevo.
//
//   2. LA MAQUINA DE ESTADOS (`state`) — es un string, no un objeto, asi que no se puede
//      compartir por referencia. Vive como campo de `S`: se LEE con `S.state` y se ESCRIBE con
//      setState(). Tener un unico punto de escritura es lo que permite rastrear transiciones
//      raras; antes habia 22 asignaciones sueltas y no habia forma de saber quien las hacia.

/** Pantalla / fase activa del juego. Leer `S.state`; escribir con setState(). */
export const S = { state: 'title' };   // arranca en la PORTADA; los modos vienen despues

// Poner DEBUG_STATE=1 en la consola imprime cada transicion. Barato de dejar puesto y es la
// diferencia entre "se colgo en una pantalla" y saber exactamente desde donde llego.
export function setState(next) {
  if (globalThis.DEBUG_STATE && next !== S.state) console.log(`[state] ${S.state} → ${next}`);
  S.state = next;
  return next;
}

/** cfg = caracteristicas ACTIVAS del mapa (las lee el juego). Se editan en vivo con el menu [M]
 *  o se cargan desde un nivel de campaña. Base para prototipar niveles.
 *  fuelOn: el combustible es el RELOJ del run (mantener la secuencia agarrando bidones).
 *  Se puede apagar en el menu [M] (COMBUSTIBLE: NO) para pruebas / vuelo libre. */
import { PORT_H, AIR_START_Y } from '../data/runways.js';

export const CTRL_DIRECT = 0, CTRL_BANK = 1, CTRL_N = 2;

export const cfg = {
  sky: 'dusk', water: 'sea', terrain: 'sea', wind: true,
  // fuelOn ARRANCA APAGADO (tanque infinito) por decision de diseño de julio 2026: el reloj de
  // combustible queda en pausa hasta rebalancearlo (la ruta optima de bidones es ROADMAP #28).
  // Encenderlo sigue siendo una fila del menu [M]; las misiones no lo pisan (CAMPAIGN_CFG no
  // trae fuelOn), asi que este default manda en TODOS los modos.
  obstacles: 1, coast: 230, meters: 3000, fuelOn: false, energy: true,
  bombs: 1,   // BOMBARDEO: densidad de bombas cayendo (0=no, 0.5, 1, 2) — menu [M]
  // LLUVIA: 0 NO · 1 GARUA · 2 LLUVIA · 3 TORMENTA (render/rain.js). Es AMBIENTE PURO — no toca la
  // deteccion, ni la velocidad, ni cuando aparecen los obstaculos. Que sea una fila de OPCIONES es
  // justamente lo que obliga a que no penalice: una opcion que cambia la dificultad no es una
  // preferencia sino un handicap, y el record no guarda con que configuracion se hizo.
  // La version con dos filos (te esconde del radar Y te tapa el mundo) es ROADMAP #29, y va por
  // mision, no por preferencia.
  rain: 0,
  mira: 6,   // RETICULO elegido (1..9 de assets/miras.webp); se cambia en OPCIONES y persiste
  // MIRA FIJA o MOVIL. 0 = fija adelante del avion (default) · 1 = la mueve el mouse.
  // NO ES SOLO LA MIRA: en teclado tambien decide que hacen las FLECHAS (ver core/input.js).
  //   FIJA  → las dos manos en el teclado: WASD es el stick izquierdo y las flechas el DERECHO.
  //   MOVIL → una mano se va al mouse, que pasa a ser el stick derecho, y las flechas vuelven a volar.
  // El default es FIJA porque es el esquema completo — el de dos sticks — y no pide mouse.
  // Con JOYSTICK es SIEMPRE fija por construccion: el mando no tiene con que moverla (el stick
  // derecho es el giro libre del horizonte). CAPS LOCK lo alterna en vivo desde el teclado.
  aim: 0,
  runway: 0,     // estilo de pista (indice en data/runways.js) — menu [M]
  cliff: false,  // la base esta sobre una meseta: se despega EN ALTURA y se sale al vacio
  // ARRANQUE. 'runway' = despegue clasico desde la base. 'air' = la mision empieza YA VOLANDO,
  // sin plataforma: son las misiones de REGRESO, donde el avion vuelve del ataque.
  start: 'runway',
  // ARENA (banco de pruebas del climax): que buque se ataca. Indice de data/missions.js; solo
  // lo usa ese modo — es lo que permite probar los tres layouts de zonas sin depender del sorteo.
  arenaShip: 0,
  // PIRUETAS de combate (data/moves.js): los combos de dos toques (split-s, break turn, jink...).
  // Se pueden apagar si los combos verticales molestan al bombear gas. El tonel clasico
  // (doble-tap lateral) queda SIEMPRE: es la mecanica original del juego, no una pirueta nueva.
  moves: true,
  // PIRUETAS APAGADAS UNA POR UNA: ids de data/moves.js que se desactivaron en MEJORAS DEL PICHON.
  // `moves` de arriba es el interruptor MAESTRO; esto es el corte fino de abajo, y el gate que los
  // junta a los dos vive en UN solo lugar (el dispatcher de combos en game.js).
  //
  // Es un objeto usado como conjunto (`movesOff[id]` presente = apagada) y no un Set ni un array
  // por la regla de identidad estable de este modulo: se MUTAN sus claves y nunca se reasigna. Un
  // `cfg.movesOff = new Set()` dejaria a cualquiera que ya lo hubiera leido mirando el viejo.
  movesOff: {},
  // NIEBLA: bancos de bruma pegados al agua (systems/fog.js). 0 NO · 1 VISIBLE · 2 CASI NULA.
  // NO es ambiente: es la perilla de dificultad mas honesta que tiene el juego — sube el desafio
  // sin agregar un solo objeto, acortando la distancia a la que ves lo que YA estaba. Por eso vive
  // en el bloque de MAPA (con VIENTO y OBSTACULOS) y no en AMBIENTE (con FONDO, AGUA y LLUVIA).
  fog: 0,
  // LARGO del banco: 0 CORTO · 1 MEDIO · 2 LARGO · 3 MUY LARGO (ver FOG_LEN en data/tuning.js).
  // Es cuanto tiempo te obliga a volar arriba del radar, o sea el balance entero del item.
  fogLen: 1,
  // EJE Y DEL ARENA: en la fase ARENA W/S comandan el CABECEO (PLAN_MINUTOS_SAGRADOS D1).
  // 0 = W sube el morro (como el pasillo, donde W es subir) · 1 = INVERTIDO (estilo simulador).
  // Existe porque con cabeceo comandado, invertir el eje es lo primero que busca quien viene
  // de un juego de vuelo. Persiste: es una preferencia de la persona, no del mapa.
  arenaInv: 0,
  // EJE Y DEL STICK IZQUIERDO (joystick). 0 = ARRIBA SUBE, igual que la W del teclado; 1 = invertido.
  // Antes esto era una variable suelta de core/input.js que solo se prendia con △ y se perdia al
  // cerrar el juego: si tu mando reportaba el eje al reves, no habia forma de dejarlo arreglado.
  padInvY: 0,
  // MODELO DE VIDA / AVERIAS (ver core/damage.js). Vale para TODOS los modos y a futuro es una
  // de las perillas de la DIFICULTAD:
  //   'squad'  el de siempre: un impacto y caiste; el escuadron es la barra de vida
  //   'integ'  el avion aguanta y se DEGRADA (mas lento, sin turbo, sin piruetas)
  //   'visual' aguanta igual, pero el daño no toca el desempeño: solo se ve
  dmgMode: 'squad',
  // EL CLIMA DEL MAR ('calm' | 'breeze' | 'storm'), derivado de viento/lluvia/cielo por climaDe()
  // en core/sea.js y guardado por applyCfg(). Manda la frecuencia de olas, el umbral de espuma y
  // el termino de viento del oleaje (SPEC_AGUA_OLAS §2). Es DERIVADO, no una preferencia: no se
  // guarda ni aparece en OPCIONES.
  seaClima: 'calm',
  // QUE LE PASA AL RELEVADO (SPEC_MODO_PASADA RF-15.5). Es TONO, no cuenta: el avion sale de la
  // partida en los tres casos, y lo unico que cambia es lo que ves y lo que dice la radio.
  //   'auto'  como venia: campaña = averiado que vuelve a la base (norma 3/8 del guion, donde los
  //           muertos los decide la historia y no el gameplay) · el resto = derribo arcade
  //   'dmg'   averiado SIEMPRE, en cualquier modo
  //   'kill'  derribado SIEMPRE — el arcade crudo, tambien en campaña
  relevoFx: 'auto',
  // RALENTI DE LA VENTANA (SPEC_MODO_PASADA RF-12): en la PASADA, los ultimos metros antes del
  // buque corren mas lento para que la suelta se pueda decidir. Se apaga para quien lo sienta
  // pastoso — es una ayuda de lectura, no una regla del modo.
  pasadaSlow: true,
  // RED DE RADAR: la malla que marca la altura a partir de la cual el radar te detecta.
  //   0 = NO · 1 = AL ENTRAR (default) · 2 = SIEMPRE
  // El default es 1 a proposito: volando bajo —que es casi todo el juego— la red seria ruido
  // permanente sobre algo que todavia no te afecta. Aparece cuando cruzas el techo, que es
  // cuando pasa a importar. El modo SIEMPRE queda para aprender donde esta el techo.
  radarNet: 1,
  // ENEMIGOS MOVILES: los que hoy podian quedarse quietos se mueven — el globo cabecea colgado
  // del cable, el helicoptero patrulla de lado a lado, el caza teje y busca tu carril, los
  // vehiculos ruedan y la fragata del mastil navega. Apagarlo los deja plantados como antes.
  // (Lo que YA se movia — bandada, barcaza entrando, bombas — no depende de esta llave.)
  enemyMove: true,
  // ESCUADRON: cuantos aviones (vidas) salen en la formacion, 1..8. El jugador es el lider;
  // cada derribo lo releva un companero (systems/squad.js) hasta agotar la formacion. Con 1
  // el juego se comporta exactamente como antes de existir la opcion: morir es morir.
  squad: 4,
  // ESQUEMA DE CONTROL de ←/→ (lo ejecuta systems/flight.js con bankStep/bankVx de core/physics.js).
  //   0 DIRECTO (default) = el de siempre: las flechas empujan al avion de costado y el alabeo del
  //     sprite es una animacion que acompaña.
  //   1 ALABEO = las flechas ROLAN, y moverse de costado es la consecuencia de estar banqueado.
  // El tope lateral es el MISMO en los dos (~30): no es un ajuste de dificultad sino de acople —
  // con ALABEO, lo que te desplaza es un angulo que estas viendo en pantalla.
  // Vive en OPCIONES junto al horizonte y persiste: es una preferencia de la persona.
  control: 0,
  // HORIZONTE GIRATORIO: cuanto se inclina el MUNDO cuando el avion rola (ver core/horizon.js).
  //   0 = FIJO · 1 = EN PIRUETAS · 2 = TOTAL (default) · 3 = LIBRE 360 ([Q]/[E] · stick derecho)
  // El default es TOTAL: que el mundo se incline al doblar es LA sensacion que da todo esto, y
  // dejarlo en PIRUETAS hacia que la mayoria no lo viera nunca. Quien se maree lo baja a FIJO.
  // No esta en el menu [M] sino en OPCIONES, y PERSISTE en localStorage: no es una propiedad del
  // mapa como las de arriba sino una preferencia de la persona —incluida la de no marearse—, y
  // [M] solo se abre desde la seleccion de avion, a la que la campaña nunca entra.
  horizon: 2,
  // DEPURACION: pinta las cajas de colision en verde fluor. Es para PROBAR — el overlay sale de
  // core/hitbox.js, la misma fuente que decide los choques, asi que lo que ves es lo que golpea.
  hitboxes: false,
  // MODO CAMARA (herramienta de desarrollo): el mundo NO avanza solo — avanza, retrocede y se
  // frena a decision del desarrollador, y la camara se mueve libre en x/altura. Para inspeccionar
  // mapas y encuadres sin que la partida se mueva sola.
  devcam: false,
};

/** Camara del mundo 2D. La comparten el render y el momentum. */
export const cam = { x: 0, y: 14 };

/** El avion. bank/pitch son estado VISUAL suavizado (animacion), no afectan el vuelo. */
export const plane = { x: 0, y: 1.2, vx: 0, vy: 0, bank: 0, pitch: 0 };

export function resetPlane() {
  // con ACANTILADO el avion ya nace sobre la meseta: no hay carrera de ascenso, se sale al vacio
  plane.x = 0; plane.y = cfg.start === 'air' ? AIR_START_Y : (cfg.cliff ? PORT_H : 0) + 1.2;
  plane.vx = 0; plane.vy = 0; plane.bank = 0; plane.pitch = 0;
}

/** ESTADISTICAS de la corrida: alimentan el recuento y las estrellas del fin de mision.
 *  Se ceran en reset() y se CONGELAN en freezeRun() dentro de lastRun (por valor), porque entre
 *  niveles de campaña se llama reset() y borraria los contadores. */
export const stats = {
  air: 0, soldiers: 0, zones: 0, shots: 0, hits: 0,
  grazes: 0, fuelPicks: 0, dodges: 0, bestRas: 0, reattacks: 0,
};

export function resetStats() {
  for (const k in stats) stats[k] = 0;
}
