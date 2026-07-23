// CATALOGO de efectos de sonido: que archivos usa cada accion y a que volumen.
// Datos puros — el motor que los reproduce (sfxOne/sfxLoop) vive aparte.
// OJO: tools/build_web.py VACIA SFXB para el build web (los samples no entran en 16 MB) y
// revienta si no encuentra la constante. Si se renombra, hay que actualizar ese script.
// ---------- SFX con SAMPLES (assets/new_sounds/) ----------
// Capa de sonido REAL sobre el motor procedural: one-shots (sfxOne) y loops con fade
// (updateSfx, por contexto). En el BUILD WEB tools/build_web.py vacia SFXB → sfxSrc da
// null, todo esto se apaga solo y quedan los beeps/osciladores de siempre (fallback).
export const SFXB = '../assets/new_sounds/';
export const SFX_DEF = {
  // armas
  gun: { f: ['ammo/machinegun_slow.mp3'], v: 0.65, loop: true },      // metralla: loop mientras disparas (+30%)
  // misiles: +30% de volumen y arranca 1s adentro del sample (offset) para que el impacto suene
  // antes, sin la entrada lenta del archivo.
  msl: { f: ['ammo/misil.mp3', 'ammo/misil2.wav'], v: 0.91, offset: 1 },
  // cañon en MOMENTUM (1a persona): rafaga lenta y pesada, una variante al azar por tiro.
  // Comparte los samples con exXsmall pero es una entrada propia para poder regular su
  // volumen sin tocar el de las explosiones chicas.
  momGun: { f: ['explosions/xsmall_explosion.wav', 'explosions/xsmall_explosion2.wav'], v: 0.55 },
  // cuerpos (atropellar soldados): uno al azar
  body: { f: ['body/body_hit0.wav', 'body/body_hit1.wav', 'body/body_hit2.wav', 'body/body_hit3.wav'], v: 0.75 },
  // explosiones por contexto
  exXheavy: { f: ['explosions/xheavy_explosion0.wav', 'explosions/xheavy_explosion1.wav', 'explosions/xheavy_explosion3.wav', 'explosions/xheavy_explosion4.wav'], v: 0.9 },
  exHeavy: { f: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => 'explosions/heavy_explosion' + i + '.wav'), v: 0.8 },
  exHeavyDist: { f: [0, 1, 2, 3].map(i => 'explosions/heavy_dist_explosion' + i + '.wav'), v: 0.7 },
  exMedium: { f: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => 'explosions/medium_explosion' + i + '.wav'), v: 0.7 },
  exSmall: { f: [0, 1, 2, 3].map(i => 'explosions/small_explosion' + i + '.wav'), v: 0.75 },
  exXsmall: { f: ['explosions/xsmall_explosion.wav', 'explosions/xsmall_explosion2.wav'], v: 0.6 },
  // motor / vuelo
  lv1: { f: ['flying/motor/lv1.wav'], v: 0.6 },                        // despegue + conteo
  engN: { f: ['flying/motor/normal.wav'], v: 0.32, loop: true },       // crucero (se intercala con engN2)
  engN2: { f: ['flying/motor/normal2.wav'], v: 0.32, loop: true },
  turbo: { f: ['flying/motor/turbo.wav'], v: 0.5, loop: true },
  waterNear: { f: ['flying/water_near_plane.mp3'], v: 0.22, loop: true },   // rasante, volumen bajo
  waveFly: { f: ['flying/motor/wave_fly1.wav', 'flying/motor/wave_fly2.wav'], v: 0.45 },  // near-miss / pirueta
  // ambiente de terreno (loop por contexto)
  ambRain: { f: ['terrain/rain.mp3'], v: 0.35, loop: true },           // tormenta en tierra
  ambStorm: { f: ['terrain/storm_sea_1.mp3'], v: 0.4, loop: true },    // tormenta en mar
  ambWarFar: { f: ['terrain/war_distant.mp3'], v: 0.32, loop: true },  // tierra, guerra lejana
  ambWarNear: { f: ['terrain/war_near_soldats.mp3'], v: 0.42, loop: true }, // soldados corriendo abajo
  ambWind: { f: ['terrain/terrain_wind.mp3'], v: 0.3, loop: true },    // tierra vacia (tutorial/pruebas)
  // general
  alarm: { f: ['general/incoming_alarm.wav'], v: 0.45, loop: true },   // a la par del MOMENTUM
};
