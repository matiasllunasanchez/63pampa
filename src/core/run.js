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
  fuel: 100,       // COMBUSTIBLE: el reloj real del run
  heat: 0,         // calor del canon (0..1)
  overheat: false, // canon bloqueado hasta enfriar a 0.3
  detection: 0,    // carga del radar enemigo (0..1); al llegar a 1 dispara una OLEADA de misiles
  radarWave: 0,    // oleadas disparadas en esta corrida: cada una es MAS grande que la anterior
  radarSeen: false,// ¿ya se aviso "te detecto el radar"? (el aviso largo va una sola vez)
  boost: false,    // turbo apretado y con nafta
  throttle: 0,     // palanca de gas: SOLO indicador visual

  // --- puntaje y rachas ---
  score: 0,
  mult: 1,         // multiplicador por altitud
  multShow: 1,     // el que se muestra en el HUD (incluye el bonus de racha rasante)
  streak: 0,       // segundos acumulados volando a ras
  rasLevel: 0,     // nivel de racha rasante (0..4)
  graceT: 0,       // gracia al despegarse: un bob corto no corta la racha

  // --- afterburner sostenido (ver AFTER_* en core/physics.js) ---
  afterT: 0, afterTier: 0, afterGrace: 0,

  // --- roce con la superficie (ver SCRAPE_* en core/physics.js) ---
  scrapeT: 0,      // reloj de gracia rozando: si llega al limite, muerte
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
  rollT: 0,        // tonel en curso (segundos restantes) — camino legado del barrel roll
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
  pitchHold: 0,    // segundos manteniendo ↑/↓: filtra los toques rapidos de gas

  // --- spawn ---
  nextSpawn: 320,  // distancia hasta el proximo obstaculo
  nextSoldier: 0,  // distancia hasta el proximo grupo de soldados
  nextBomb: 260,   // distancia hasta la proxima bomba cayendo (cfg.bombs la regula)

  // --- feedback ---
  shake: 0,        // sacudon de camara: lo suben roce, explosiones, afterburner y colisiones
  bloodSplat: 0,   // mancha de sangre sobre el sprite (se desvanece en ~3 s)
};

/** Deja la corrida como al empezar. Los valores son los del arranque salvo `spd`, que arranca
 *  casi en cero porque el avion esta detenido en la pista (el despegue lo acelera). */
export function resetRun() {
  Object.assign(run, {
    t: 0, dist: 0, spd: 6, fuelDist: 0,
    fuel: 100, heat: 0, overheat: false, detection: 0, radarWave: 0, radarSeen: false, boost: false, throttle: 0,
    score: 0, mult: 1, multShow: 1, streak: 0, rasLevel: 0, graceT: 0,
    afterT: 0, afterTier: 0, afterGrace: 0,
    scrapeT: 0, scrapeVib: 0,
    squad: 1, lives: 1,
    gear: 1,
    windT: 0, windF: 1,
    fireT: 0, msl: MSL_MAX, mslCd: 0, mslRegen: 0,
    rollT: 0, rollCd: 0,
    mv: null, mvT: 0, mvY0: 0, mvRoll: 0, mvSteep: 0, mvSeed: 0, mvTgt: 0, camPan: 0,
    // alabeo VIVO del control por ALABEO (cfg.control = 1), en radianes. Es el estado del avion:
  // plane.vx sale de aca, no al reves. Ver core/physics.js.
  bankA: 0,
  freeRoll: 0, freeRollV: 0,
    nextSpawn: 320, nextSoldier: 60, nextBomb: 260,
    shake: 0, bloodSplat: 0,
  });
}
