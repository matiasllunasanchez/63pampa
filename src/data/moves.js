// PIRUETAS: el catalogo de maniobras de combate. Datos puros — quien las EJECUTA es
// systems/moves.js, y quien las DISPARA es el detector de combos de core/input.js via game.js.
//
// Son "poderes" estilo juego de pelea: una secuencia de dos toques direccionales las lanza, y
// durante la maniobra el avion NO se controla — salvo el eje que cada una deja libre (`steer`).
// El tonel (barrel roll) es la pirueta original del juego y conserva su camino legado
// (run.rollT); las demas usan run.mv.
//
//   dur    duracion en segundos
//   steer  eje que el jugador SIGUE controlando: 'x' (lateral), 'y' (vertical) o null (nada)
//   fire   ¿puede disparar el cañon durante la maniobra?
//   turbo  ¿el turbo funciona durante la maniobra?
//   tight  el perfil de colision se ENCOGE (alas de canto / banqueo fuerte), como en el tonel —
//          tambien habilita el bonus de roce "con estilo" (250 en vez de 75)
//
// COMBOS (dos toques direccionales en menos de 0.28 s; tambien con el pad — cruceta o flicks
// del stick). Los verticales comparten tecla y se resuelven por ALTURA en game.js:
//   ←←  →→   BARREL ROLL      ↓↓ alto   SPLIT-S         ↓↓ bajo   TERRAIN MASKING
//   ↑↑ bajo  POP-UP           ↑↑ alto   HIGH YO-YO      ↑↓        HIGH YO-YO
//   ↓↑       LOW YO-YO        ↓← ↓→     BREAK TURN      ←→ →←     S-TURN
//   ↑← ↑→   JINK
export const MOVES = {
  // medio tonel invertido + picada fuerte: la salida vertical hacia ABAJO. Pide altura.
  splits: { dur: 0.95, name: 'SPLIT-S', steer: 'x', fire: false, turbo: false, tight: true },
  // viraje quebrado: tiron lateral violento sostenido, banqueo a fondo
  breakt: { dur: 0.7, name: 'BREAK TURN', steer: 'y', fire: true, turbo: false, tight: true },
  // sube, cuelga y recae: esquive vertical que sangra velocidad
  hiyo: { dur: 1.0, name: 'HIGH YO-YO', steer: 'x', fire: true, turbo: false, tight: false },
  // pica y remonta: convierte altura en VELOCIDAD (el unico combo que acelera)
  loyo: { dur: 1.0, name: 'LOW YO-YO', steer: 'x', fire: true, turbo: true, tight: false },
  // zigzag de esquive: 4 quiebres laterales secos, rumbo impredecible — no se controla nada
  jink: { dur: 0.85, name: 'JINK', steer: null, fire: true, turbo: false, tight: true },
  // barrido en S: se abre a un lado y vuelve — esquiva sin perder el carril
  sturn: { dur: 1.1, name: 'S-TURN', steer: 'y', fire: true, turbo: false, tight: true },
  // pegarse al terreno: clava el avion a ras, congela el roce y DESCARGA el radar enemigo
  mask: { dur: 1.6, name: 'TERRAIN MASKING', steer: 'x', fire: true, turbo: true, tight: false },
  // trepada brusca de ataque desde rasante
  popup: { dur: 0.8, name: 'POP-UP', steer: 'x', fire: true, turbo: false, tight: false },
};

/** ¿La maniobra activa encoge el perfil de colision? (la consultan collision y el overlay) */
export const mvTight = mv => !!(mv && MOVES[mv] && MOVES[mv].tight);

// umbral de ALTURA que separa los combos verticales compartidos (game.js):
// ↓↓ por encima = hay cielo para el Split-S; por debajo = Terrain Masking.
// ↑↑ por debajo = Pop-Up (salis de rasante); por encima = High Yo-Yo.
export const MV_HI = 18, MV_LO = 14;
