// LA CORRIDA: los numeros que describen el vuelo en curso.
//
// Es el tercer objeto compartido, junto a `plane` (donde esta el avion) y los arrays de
// core/world.js (que hay en el campo). Aca va COMO va el vuelo: velocidad, nafta, calor del
// canon, puntaje, rachas.
//
// Estan juntos porque los escriben varios sistemas y los lee el HUD entero. Ejemplo tipico:
// `shake` lo suben el roce, las explosiones, el afterburner y las colisiones, y lo baja el
// propio update; ningun sistema puede ser su dueño.
//
// Misma regla que los otros stores: se MUTA, nunca se reasigna (lo vigila tools/lint_state.js).
// Lo que NO entra aca: los relojes de las PANTALLAS (deathT, briefT, resT, toT, levelT). Esos
// son de la maquina de estados, no del vuelo, y viven con ella.

import { MSL_MAX } from '../data/tuning.js';

export const run = {
  // --- avance ---
  t: 0,            // segundos de vuelo (mueve la dificultad, las olas y las animaciones)
  dist: 0,         // metros recorridos: el reloj del objetivo
  spd: 62,         // velocidad actual (ver core/physics.js)
  fuelDist: 0,     // distancia desde el ultimo bidon: decide cuando aparece el proximo

  // --- estado del avion ---
  // INTEGRIDAD del avion (0..100) — ver core/damage.js. En el modo 'squad' (el de siempre) no se
  // usa: cualquier impacto cae directo. La escribe UN SOLO sistema, systems/damage.js.
  integ: 100,
  // EL ESCUDO delante de la chapa (0..1, ver ESCUDO en core/damage.js): la aguja amarilla de SALUD
  // en los modos con chapa. `escudoT` es lo que falta para que empiece a llenarse. Mismo dueño.
  escudo: 1,
  escudoT: 0,
  hurtT: 0,        // fogonazo rojo al aguantar un impacto (lo lee el HUD)
  fuel: 100,       // COMBUSTIBLE: el reloj real del run
  // LA NAFTA COMO ALCANCE (systems/nafta.js, solo con `ruta`): el tanque en km —{ tanques, interno }—
  // y su capacidad. `fuel` pasa a ser su reflejo en %, y `fuelSync` el % que escribio la nafta el
  // cuadro anterior: lo que otro le cambie al % (Chancha, piruetas, golpes) se traslada al tanque.
  tanque: null,
  naftaCap: 0,
  fuelSync: 100,
  heat: 0,         // calor del canon (0..1)
  overheat: false, // canon bloqueado hasta enfriar a 0.3
  detection: 0,    // carga del radar enemigo (0..1); al llegar a 1 dispara una OLEADA de misiles
  radarVisto: false,  // ¿el avion esta por encima del techo del radar? (lo usa el radar POR VOZ)
  radarWave: 0,    // oleadas disparadas en esta corrida: cada una es MAS grande que la anterior
  radarSeen: false,// ¿ya se aviso "te detecto el radar"? (el aviso largo va una sola vez)
  // CUANTOS TE ESTAN BUSCANDO (PLAN_ESTRELLAS_BUSQUEDA.md). Sube al completarse la barra del
  // radar y BAJA si te escondes a ras — a diferencia del `pintado` que reemplaza, que era este
  // mismo trinquete sin niveles y sin vuelta atras. Decide QUIEN TE BUSCA; que HAY en el mundo lo
  // sigue decidiendo la distancia. Vale 0 en toda mision que no lo use.
  estrellas: 0,
  // EL CLIMAX YA SE JUGO. Solo lo enciende una mision con VUELTA, que es la unica que sigue
  // volando pasado el buque; sin el, los `readyToEnter` —que son todos `dist >= objetivo`— la
  // devolverian al climax en el cuadro siguiente, sin fin.
  climaxHecho: 0,
  boost: false,    // turbo apretado y con nafta
  throttle: 0,     // palanca de gas: SOLO indicador visual

  // --- puntaje y rachas ---
  score: 0,
  mult: 1,         // multiplicador por altitud
  multShow: 1,     // el que se muestra en el HUD (incluye el bonus de racha rasante)
  streak: 0,       // segundos acumulados volando a ras
  rasLevel: 0,     // nivel de racha rasante (0..4)
  graceT: 0,       // gracia al despegarse: un bob corto no corta la racha
  // CUANDO se rechazo el PODER RASANTE por altura (segundos de `run.t`; -9 = nunca). Lo escribe
  // game.js al negar el lanzamiento y lo lee el HUD para sacar la lengueta del aviso. Es un
  // INSTANTE y no una bandera: asi el cartel se apaga solo y nadie tiene que acordarse de bajarla.
  rasAlto: -9,

  // --- EL AGUANTE: el estado RASANTE (core/aguante.js + systems/aguante.js) -------------------
  // `streak` de arriba es la CARGA (4 s de PERFECTO) y estos siete son el estado ya puesto.
  aguante: 0,      // 1 = el estado RASANTE esta corriendo
  aguN: 0,         // aciertos acumulados: de aca salen dificultad, multiplicador y escalon
  aguSec: 0,       // donde arranca el sector azul (0..1 de la barra); se sortea en cada acierto
  aguF: 0,         // fase del indicador, en vueltas (una vuelta = ida y vuelta)
  aguHold: 0,      // s con el gas apretado, para la salida a proposito
  aguY: 0,         // la altura a la que quedo clavado el avion
  aguGolpe: -9,    // `run.t` del ultimo acierto: el HUD lo usa para el destello
  aguErr: -9,      // …y el del ultimo toque AFUERA del azul: el HUD titila el indicador con el
  aguVen: 0,       // SEGUNDOS que le quedan a la ventana. Se vacia sola; acertar la rellena.
  aguGra: 0,       // s de gracia al entrar: el toque reflejo del gas no cuenta ni bien ni mal

  // DONDE QUEDARON LAS PUNTAS DE ALA en la pantalla, en pixeles de MUNDO, este cuadro.
  //
  // LO ESCRIBE EL RENDER (render/plane.js) y no un sistema, que es al reves de lo normal — y es la
  // unica forma: la punta sale de la tabla medida para ESTA pose (data/anclas.js) mas el centro,
  // el tamaño y el giro con los que se acaba de dibujar el sprite, y eso solo lo sabe quien lo
  // dibujo. Reconstruirlo afuera seria copiar la transformacion entera y que se separen.
  //
  // LO LEE EL ROCIO (systems/vuelo.js) para que el agua nazca EN la punta y no a un ancho fijo del
  // centro: con el avion banqueado y la camara del poder al costado, el ancho fijo dejaba la punta
  // izquierda a 25 px de donde nacia el agua.
  //
  // VA UN CUADRO ATRASADO a proposito: los sistemas corren antes que el dibujo, asi que lo que se
  // lee es lo del cuadro anterior. A 60 fps son 16 ms y no se ve; reordenar el bucle por esto
  // costaria mucho mas de lo que arregla. `alaT` dice CUANDO se escribio: si el avion no se dibujo
  // (cinematica, pausa, otro modo) el dato esta viejo y quien lo lee tiene que caer a su plan B.
  alaLx: 0, alaLy: 0, alaRx: 0, alaRy: 0, alaT: -9,

  // --- afterburner sostenido (ver AFTER_* en core/physics.js) ---
  afterT: 0, afterTier: 0, afterGrace: 0,

  // --- roce con la superficie (ver SCRAPE_* en core/physics.js) ---
  scrapeT: 0,      // reloj de gracia rozando: si llega al limite, muerte (con chapa: ver ESCUDO)
  scrapeVib: 0,    // 1 mientras roza: hace VIBRAR el sprite; decae al salir

  // --- viento ---
  windT: 0,        // tiempo acumulado volando alto
  windF: 1,        // factor de resistencia resultante (1 = sin viento)

  // --- armas ---
  fireT: 0,        // cadencia del canon
  msl: MSL_MAX,    // misiles disponibles
  mslCd: 0,        // cooldown entre lanzamientos
  mslRegen: 0,     // temporizador de recarga lenta

  // --- escuadron (vidas) — ver systems/squad.js ---
  squad: 1,        // tamaño de la formacion de esta corrida (reset() lo copia de cfg.squad)
  lives: 1,        // aviones que quedan, INCLUIDO el que volas; cada relevo descuenta uno

  // --- tren de aterrizaje ---
  gear: 1,         // 1 = bajado (en pista) · 0 = recogido. Lo anima el despegue; ver render/plane.js

  // --- maniobra ---
  rollCd: 0,       // cooldown COMPARTIDO de todas las piruetas
  rollDir: 1,      // hacia que lado rola
  // PIRUETAS de combate (data/moves.js). mv = id activo o null; las ejecuta systems/moves.js.
  mv: null,        // 'splits' | 'breakt' | 'hiyo' | 'loyo' | 'jink' | 'sturn' | 'mask' | 'popup'
  mvT: 0,          // tiempo transcurrido de la maniobra
  mvDir: 1,        // sentido elegido (donde aplica)
  mvY0: 0,         // altura al entrar (los yo-yos vuelven a ella)
  mvRoll: 0,       // rotacion EXTRA del sprite en pantalla (split-s invierte, break turn exagera)
  mvSteep: 0,      // pose empinada: 1 trepada fuerte / -1 picada fuerte / 0 normal (usa sheet2)
  mvSeed: 0,       // semilla del jink (sus quiebres son aleatorios pero estables por ejecucion)
  mvTgt: 0,        // altura OBJETIVO de las maniobras que trepan a un techo (ASCENSO / SOBRE EL RADAR)
  // PANEO DE CAMARA (stick derecho vertical · [R]/[F]): unidades de mundo que se le suman al
  // `camLift` de la camara. Es estado SUAVIZADO, no el input crudo: el eje entra y sale con peso
  // para que mirar abajo sea un movimiento de camara y no un salto.
  camPan: 0,
  // GIRO LIBRE del horizonte ([Q]/[E], solo con HORIZONTE en LIBRE). Es un angulo ACUMULADO sin
  // tope: pasa de 2*PI y sigue, para que dar tres vueltas sea dar tres vueltas. Es SOLO dibujo —
  // el avion vuela igual boca abajo. Ver core/horizon.js.
  // alabeo VIVO del control por ALABEO (cfg.control = 1), en radianes. Es el estado del avion:
  // plane.vx sale de aca, no al reves. Ver core/physics.js.
  bankA: 0,
  freeRoll: 0,
  freeRollV: 0,    // velocidad angular, con peso: el giro entra y sale, no es un interruptor
  // LA SEÑA EN CURSO (data/senales.js): cual, cuanto le queda, para que lado, y la pose que
  // manda dibujar mientras dura (core/senales.js). Es solo dibujo: el avion vuela igual.
  senal: null,     // la entrada de SENALES, o null
  senalT: 0,       // segundos que le quedan al gesto (0 = ninguno)
  senalDir: 0,
  senalBank: 0, senalPitch: 0, senalRot: 0,
  pitchHold: 0,    // segundos manteniendo ↑/↓: filtra los toques rapidos de gas

  // --- spawn ---
  nextSpawn: 320,  // distancia hasta el proximo obstaculo
  nextSoldier: 0,  // distancia hasta el proximo grupo de soldados
  nextBomb: 260,   // distancia hasta la proxima bomba cayendo (cfg.bombs la regula)

  // --- enemigos aereos pasados ---
  jets: 0,           // jets de frente que cruzaron al jugador: gate del director de LA COLA

  // --- feedback ---
  shake: 0,        // sacudon de camara: lo suben roce, explosiones, afterburner y colisiones
  // FOGONAZO de una explosion grande CERCA (PLAN_DESTRUCCION D3): destello de un instante sobre
  // todo el cuadro. Vive en `run` y no en un modulo de fx porque lo escribe el efecto y lo lee el
  // dibujo, que son dos lados distintos — igual que `shake`.
  flash: 0,
  // dt de PARED del cuadro. Lo escribe game.js y lo leen los efectos cuyo reloj NO se dilata con
  // el MOMENTUM ni con EL PULSO — el cruce transonico es una cosa que le pasa a la camara, no al
  // mundo, asi que si se frenara con el mundo dejaria de ser un golpe.
  dtReal: 0.016,
  bloodSplat: 0,   // mancha de sangre sobre el sprite (se desvanece en ~3 s)
};

/** Deja la corrida como al empezar. Los valores son los del arranque salvo `spd`, que arranca
 *  casi en cero porque el avion esta detenido en la pista (el despegue lo acelera). */
export function resetRun() {
  Object.assign(run, {
    t: 0, dist: 0, spd: 6, fuelDist: 0,
    integ: 100, escudo: 1, escudoT: 0, hurtT: 0,
    fuel: 100, tanque: null, naftaCap: 0, fuelSync: 100, heat: 0, overheat: false, detection: 0, radarVisto: false, radarWave: 0, radarSeen: false, estrellas: 0, climaxHecho: 0, boost: false, throttle: 0,
    score: 0, mult: 1, multShow: 1, streak: 0, rasLevel: 0, graceT: 0, rasAlto: -9,
    aguante: 0, aguN: 0, aguSec: 0, aguF: 0, aguHold: 0, aguY: 0, aguGolpe: -9, aguErr: -9, aguVen: 0, aguGra: 0,
    alaLx: 0, alaLy: 0, alaRx: 0, alaRy: 0, alaT: -9,
    afterT: 0, afterTier: 0, afterGrace: 0,
    scrapeT: 0, scrapeVib: 0,
    squad: 1, lives: 1,
    gear: 1,
    windT: 0, windF: 1,
    fireT: 0, msl: MSL_MAX, mslCd: 0, mslRegen: 0,
    rollCd: 0,
    mv: null, mvT: 0, mvY0: 0, mvRoll: 0, mvSteep: 0, mvSeed: 0, mvTgt: 0, camPan: 0,
    // alabeo VIVO del control por ALABEO (cfg.control = 1), en radianes. Es el estado del avion:
  // plane.vx sale de aca, no al reves. Ver core/physics.js.
  bankA: 0,
  freeRoll: 0, freeRollV: 0, senal: null, senalT: 0, senalDir: 0, senalBank: 0, senalPitch: 0, senalRot: 0,
    jets: 0,
    nextSpawn: 320, nextSoldier: 60, nextBomb: 260,
    shake: 0, flash: 0, dtReal: 0.016, bloodSplat: 0,
  });
}
