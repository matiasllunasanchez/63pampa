// CATALOGO de efectos de sonido: que archivos usa cada accion y a que volumen.
// Datos puros — el motor que los reproduce (sfxOne/sfxLoop) vive aparte.
// OJO: tools/build_web.py VACIA SFXB para el build web (los samples no entran en 16 MB) y
// revienta si no encuentra la constante. Si se renombra, hay que actualizar ese script.
// ---------- SFX con SAMPLES (assets/new_sounds/) ----------
// Capa de sonido REAL sobre el motor procedural: one-shots (sfxOne) y loops con fade
// (updateSfx, por contexto). En el BUILD WEB tools/build_web.py vacia SFXB → sfxSrc da
// null, todo esto se apaga solo y quedan los beeps/osciladores de siempre (fallback).
export const SFXB = '../assets/sfx/';
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
  waveFly: { f: ['flying/motor/wave_fly1.wav', 'flying/motor/wave_fly2.wav'], v: 0.45 },  // paso bajo sobre el agua
  // ROCE: pasar cerca de un obstaculo sin chocarlo. Tiene sonido PROPIO (antes compartia el del
  // paso sobre el agua): es la accion que mas puntos da por riesgo y necesita su propio premio
  // sonoro. Dos variantes para que una racha de roces no suene a repeticion.
  // `alt`: las dos variantes salen POR TURNO, no al azar (ver sfxOne en systems/audio.js)
  // `fi`/`fo`: fundido de entrada/salida en segundos. Los dos samples estan cortados en seco —
  // arrancan a amplitud casi plena (0.87 y 0.97 en los primeros 20 ms) y roza1 corta en 0.72 —
  // asi que sin rampa se oye un CLIC en cada punta. Ver playFaded en systems/audio.js.
  graze: { f: ['general/roza1.wav', 'general/roza2.wav'], v: 0.6, alt: true, fi: 0.06, fo: 0.14 },
  // ambiente de terreno (loop por contexto)
  ambRain: { f: ['terrain/rain.mp3'], v: 0.35, loop: true },           // tormenta en tierra
  ambStorm: { f: ['terrain/storm_sea_1.mp3'], v: 0.4, loop: true },    // tormenta en mar
  ambWarFar: { f: ['terrain/war_distant.mp3'], v: 0.32, loop: true },  // tierra, guerra lejana
  ambWarNear: { f: ['terrain/war_near_soldats.mp3'], v: 0.42, loop: true }, // soldados corriendo abajo
  ambWind: { f: ['terrain/terrain_wind.mp3'], v: 0.3, loop: true },    // tierra vacia (tutorial/pruebas)
  // VOCES DE PILOTO (assets/sfx/audios/pilots): grabaciones de radio que suenan en el RELEVO, el
  // momento en que un companero asume el mando tras un derribo. Una al azar por relevo.
  //
  // El pool son TODOS los archivos de la carpeta, que es lo que se pidio. Varios encajan solos con
  // el momento ("cambio", "nos estan pegando", "vamos pendejo por la patria"); los `woho` son
  // festejos y quedan raros justo despues de perder a alguien. Recortar la lista es borrar
  // renglones de este array — no hay que tocar nada mas.
  //
  // VOLUMEN: `m: 1` saltea el SFX_MASTER (0.3) que atenua a todos los demas samples. Sin eso la voz
  // terminaba sonando a 0.285 — por debajo de la metralla y apenas encima del loop del motor. Con
  // `m: 1` queda en 0.95 — medido contra el motor sonando (0.18), le gana 5.3x. Se puede porque suena
  // UNA vez por relevo y dura dos segundos: la razon de ser del maestro es que lo que suena TODO EL
  // TIEMPO no tape la musica, y esto no suena todo el tiempo. Ademas quien la dispara agacha la
  // musica mientras habla (PILOT_DUCK en systems/squad.js).
  // Duran entre 1.42 s y 4.73 s (medido); el mas largo es el de la ñ, que carga bien.
  pilot: { f: [
    'audios/pilots/vamos_pendejo_patria.wav',
    'audios/pilots/viva_patria2.wav',
    // 'audios/pilots/cambio4.wav',
    // 'audios/pilots/misilazo.wav',
    // 'audios/pilots/dio_perfecto_este_se\u00f1or.wav',
    // 'audios/pilots/ruidointerferencia.wav',
    // 'audios/pilots/pegadito.wav',
    'audios/pilots/nos_estan_pegando.wav',
    'audios/pilots/woho1.wav',
    'audios/pilots/woho2.wav',
    'audios/pilots/woho3.wav',
    'audios/pilots/woho4.wav',
    'audios/pilots/woho5.wav',
    'audios/pilots/bien_pibe.wav',
  ], v: 0.95, m: 1 },
  // general
  alarm: { f: ['general/incoming_alarm.wav'], v: 0.45, loop: true },   // a la par del MOMENTUM
};
