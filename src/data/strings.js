// TEXTOS del juego, por idioma. Datos puros: no importa nada ni toca estado.
// Agregar un idioma = agregar una clave de primer nivel; T() cae al español si falta una clave.
// ---------- i18n: TODOS los textos visibles, mapeables a otros idiomas ----------
// Para agregar un idioma: copia el bloque 'es', traduci cada valor (deja las llaves y los {n}
// intactos) y agregalo con su codigo ISO 639-1 (ej. 'pt', 'fr'). Nada de texto suelto en el resto
// del codigo: todo pasa por T('clave') / L().facts.
// El idioma se resuelve en orden: ?lang=xx en la URL · localStorage 'rasante_lang' · navegador · 'es'.
// Empaquetado Windows/Steam: el launcher puede fijar el idioma con ?lang=xx o localStorage 'rasante_lang'.
export const STRINGS = {
  es: {
    langName: 'Español',
    pageHeader: '■ <b>RASANTE</b> · vista frontal · Atlántico Sur, 1982',
    pageFooter: '<kbd>ARRIBA</kbd>/<kbd>W</kbd>: gas — si soltás, el avión cae &nbsp;·&nbsp; <kbd>←</kbd><kbd>→</kbd>: esquivar &nbsp;·&nbsp; <kbd>ABAJO</kbd>: picada &nbsp;·&nbsp; <kbd>X</kbd>/<kbd>ESPACIO</kbd>: cañón &nbsp;·&nbsp; <kbd>Z</kbd>: misil &nbsp;·&nbsp; <kbd>SHIFT</kbd>/<kbd>C</kbd>: turbo &nbsp;·&nbsp; <kbd>V</kbd>: cámara (1×→2.5×) &nbsp;·&nbsp; <kbd>MOUSE</kbd>: mira libre (click: cañón · click der: misil)<br>Táctil: arrastrá a la izquierda para volar · derecha arriba: fuego · derecha abajo: turbo · botón MISIL abajo izquierda<br>Volar bajo multiplica. Rozar obstáculos da bonus. El turbo duplica puntos y quema combustible.',
    aria: 'Juego Rasante: flechas para maniobrar, X dispara, Shift turbo',
    death_land: 'Chocaste el terreno', death_sea: 'Impactaste el mar',
    death_mast: 'Chocaste una fragata', death_helo: 'Colision con helicoptero',
    death_jet: 'Choque con avion enemigo', death_balloon: 'Globo de barrera',
    death_missile: 'Te alcanzo un misil',
    death_aa: 'La defensa de la barcaza te derribo',
    death_fuel: 'Te quedaste sin combustible sobre el blanco',
    freeControl: 'CONTROL LIBRE!', rasante: 'RASANTE x{n}!', afterburner: 'TURBINA x{n}!',
    aimFixed: 'MIRA FIJA', aimFree: 'MIRA LIBRE',
    thrDown: 'PALANCA: ↓ SUBE', thrUp: 'PALANCA: ↑ SUBE',
    scrape: '! SUBI !',
    pickFuel: '+COMB', graze: 'ROZASTE +75', dodgeMissile: 'LO ESQUIVASTE +75',
    rollGraze: 'PIRUETA! +250',
    takeoffTitle: 'DESPEGUE · PUERTO ARGENTINO · BAM MALVINAS',
    takeoffHeading: 'rumbo al estrecho de San Carlos',
    hud_best: 'MEJOR {n}', kmh: ' KM/H', turboTag: ' TURBO',
    windWarn: '~ VIENTO EN CONTRA ~', radar: '! RADAR !',
    bar_fuel: 'COMB', bar_cannon: 'CANON 20MM', bar_overheat: 'RECALENTADO',
    thr: 'GAS', thr_dead: 'SIN GAS',
    hud_status: 'ESTADO',
    title: 'R A S A N T E', subtitle: 'vista frontal · Atlantico Sur · 1982',
    ctrl1: 'ARRIBA: gas (si soltas, caes) · IZQ/DER: esquivar',
    ctrl2: 'ABAJO: picada · X: canon · SHIFT: turbo · doble ←/→: PIRUETA',
    ctrl3: 'MOUSE: mira libre · CLICK: canon · CLICK DER: misil · V: camara',
    tip1: 'Mas bajo = mas puntos. Rozar obstaculos da bonus.',
    tip2: 'El turbo duplica el puntaje y quema combustible.',
    tip3: 'Muy alto = te detecta el radar.',
    startPrompt: 'CUALQUIER TECLA  para despegar',
    selTitle: 'ELEGI TU AVION',
    selHint: '<  >  elegir      ENTER / TOCAR  despegar',
    modePrompt: 'ELEGI MODO DE JUEGO',
    modeCampaign: 'HISTORIA', modeSurvival: 'POR LA PATRIA', modeCycle: 'CICLO DE MUERTE',
    modeCampaignDesc: 'Modo historia por niveles', modeSurvivalDesc: 'Puntaje infinito hasta morir',
    modeCycleDesc: 'Objetivos aleatorios, dificultad creciente',
    modeHint: 'flechas: elegir   ENTER / TOCAR: confirmar',
    portLabel: 'PUERTO', bargeDown: 'BARCAZA DESTRUIDA', reached: 'alcanzados',
    continuePrompt: 'CUALQUIER TECLA para continuar',
    mom_title: 'M O M E N T U M', mom_hint: 'MANTENE LA MIRA EN LA ZONA Y DISPARA [X]',
    mom_pass: 'PASADA {n}/{m}', mom_clear: 'PASADA COMPLETA!', mom_next: 'PROXIMA PASADA >>',
    mom_destroyed: '{z} DESTRUIDO',
    zone_aa: 'CANON AA', zone_radar: 'RADAR', zone_bridge: 'PUENTE',
    zone_engine: 'MOTOR', zone_deposit: 'DEPOSITO',
    // HISTORIA (campaña): cada objeto es UNA pantalla. {title,paras} = cinematica;
    // {level,obj} = pantalla previa al nivel. Fuente: docs/NIVELES.md
    storyIntro: [
      {
        title: 'MALVINAS · 1982', paras: [
          'Desde 1833, la República Argentina mantiene un reclamo de soberanía sobre las Islas Malvinas.',
          'Durante casi ciento cincuenta años, ese reclamo continuó por vías diplomáticas.',
          'Pero en 1982, la historia cambiaría para siempre.']
      },
      {
        title: 'ARGENTINA · MARZO DE 1982', paras: [
          'Argentina atravesaba uno de los momentos más difíciles de su historia.',
          'El país era gobernado por una dictadura militar encabezada por el teniente general Leopoldo Fortunato Galtieri.']
      },
      {
        title: 'LA DECISIÓN', paras: [
          'En medio de una profunda crisis política, económica y social, la Junta Militar tomó una decisión que marcaría el destino de miles de argentinos.',
          'Recuperar las Islas Malvinas mediante una operación militar.']
      },
      {
        title: 'OPERACIÓN ROSARIO · 2 DE ABRIL', paras: [
          'La Operación Rosario logró recuperar el control de las islas.',
          'El enfrentamiento inicial dejó pocas bajas.',
          'Durante unas horas, gran parte del pueblo argentino creyó que el conflicto había terminado.',
          'No sería así.']
      },
      { level: 'NIVEL 0 — SE APROXIMA LA TASK FORCE', obj: 'Objetivo: dominar el vuelo rasante · Mar abierto' },
    ],
    storyL1: [
      {
        title: 'LA FLOTA', paras: [
          'El Reino Unido respondió enviando una de las mayores flotas de guerra movilizadas desde la Segunda Guerra Mundial.',
          'Dos portaaviones. Destructores. Fragatas. Submarinos nucleares.']
      },
      {
        title: 'RUMBO AL SUR', paras: [
          'Más de cien buques navegaron hacia el Atlántico Sur.',
          'Mientras tanto, Argentina comenzaba a preparar su defensa.']
      },
      { level: 'NIVEL 1 — BAUTISMO DE FUEGO', obj: '1 de mayo de 1982 · Costa' },
    ],

    // ---------- RECUENTO DE FIN DE MISION ----------
    mom_turn: '! VIRAJE 180 !', mom_pass_n: 'INTENTO {n}',
    hud_mission: 'MISION {n}/{m}',
    res_title: 'MISION CUMPLIDA', res_total: 'TOTAL', res_rank: 'CALIFICACION:',
    res_flight: 'PUNTAJE DE VUELO', res_kills: 'BLANCOS', res_acc: 'PRECISION', res_ras: 'RACHA RASANTE',
    rank_cadete: 'CADETE', rank_piloto: 'PILOTO', rank_as: 'AS', rank_halcon: 'HALCON DEL ATLANTICO',
    // ---------- BRIEFING CORTO ----------
    brief_title: 'ORDEN DE MISION', brief_goal: 'OBJETIVO:', brief_go: 'CUALQUIER TECLA  para despegar',

    // ---------- BRIEFINGS (contexto corto de cada mision) ----------
    briefSheffield: 'La Task Force navega al este de las islas. Un destructor Tipo 42 cubre la pantalla de radar de la flota. Volá bajo: su radar no distingue un blanco pegado al agua.',
    briefArdent: 'Los britanicos desembarcaron en San Carlos. Las fragatas cubren la cabecera de playa desde el estrecho. El pasillo es angosto y esta erizado de antiaerea.',
    briefAntelope: 'Segunda jornada sobre San Carlos. El estrecho ya se gano el apodo de Callejon de las Bombas. La fragata escolta el fondeadero.',
    briefCoventry: 'Un Tipo 42 se ofrece de senuelo al noroeste del estrecho para atraer aviones lejos del desembarco. Mordio el anzuelo al reves: hoy el senuelo sos vos.',
    briefConveyor: 'Un carguero portacontenedores trae helicopteros pesados para el avance britanico. Sin esos helicopteros, la infanteria camina.',
    briefGalahad: 'Buque logistico fondeado en Bahia Agradable, cargado de tropa esperando desembarcar. Esta al descubierto y sin cobertura aerea.',

    // ---------- EPILOGOS (que paso en la realidad) ----------
    // OJO: cifras reales. Las dudas estan anotadas en docs/PREGUNTAS_HISTORICAS.md
    epiSheffield: [{
      title: 'HMS SHEFFIELD · 4 MAYO 1982', paras: [
        'Un Super Etendard de la Armada Argentina lanzo un misil Exocet que impacto el casco del destructor.',
        'Murieron 20 tripulantes. El fuego obligo a abandonar el buque.',
        'Remolcado, se hundio el 10 de mayo camino a Georgias del Sur.',
        'Fue el primer buque de guerra britanico perdido en accion desde la Segunda Guerra Mundial.']
    }],
    epiArdent: [{
      title: 'HMS ARDENT · 21 MAYO 1982', paras: [
        'La fragata fue atacada en oleadas sucesivas mientras cubria el desembarco en San Carlos.',
        'Murieron 22 tripulantes. Se hundio al dia siguiente.',
        'Su comandante fue el ultimo en abandonarla.']
    }],
    epiAntelope: [{
      title: 'HMS ANTELOPE · 23 MAYO 1982', paras: [
        'Dos bombas impactaron la fragata, pero no detonaron.',
        'Al intentar desactivar una, la bomba estallo. Murio el artificiero James Prescott.',
        'El incendio llego a la santabarbara y el buque se partio en dos.',
        'Murieron 2 hombres. La silueta partida del Antelope ardiendo se volvio una de las imagenes del conflicto.']
    }],
    epiCoventry: [{
      title: 'HMS COVENTRY · 25 MAYO 1982', paras: [
        'A-4 Skyhawk de la Fuerza Aerea Argentina atacaron volando tan bajo que el radar no lograba separarlos de la costa.',
        'Tres bombas impactaron sobre la linea de flotacion. Murieron 19 tripulantes y 30 quedaron heridos.',
        'El destructor volco y se hundio en menos de veinte minutos.']
    }],
    epiConveyor: [{
      title: 'ATLANTIC CONVEYOR · 25 MAYO 1982', paras: [
        'El carguero fue alcanzado por misiles Exocet lanzados desde Super Etendard.',
        'Murieron 12 hombres, entre ellos su capitan, Ian North.',
        'Con el se perdieron helicopteros pesados Chinook destinados al avance britanico.',
        'Sin ese transporte, la infanteria britanica cruzo la isla a pie.']
    }],
    epiGalahad: [{
      title: 'RFA SIR GALAHAD · 8 JUNIO 1982', paras: [
        'Skyhawks argentinos atacaron el buque logistico fondeado en Bahia Agradable, cargado de tropa.',
        'Murieron 48 personas entre tripulantes y soldados.',
        'Fue la mayor perdida de vidas britanicas en una sola accion durante el conflicto.',
        'El casco fue hundido mar afuera y declarado cementerio de guerra.']
    }],

    homage: 'En homenaje a los pilotos y veteranos de Malvinas',
    dead: 'D E R R I B A D O', scoreLabel: 'PUNTAJE  {n}',
    newRecord: '★ NUEVO RECORD ★', bestDead: 'MEJOR  {n}',
    retryPrompt: 'CUALQUIER TECLA  para volver a volar',
    menuPrompt: 'ESC para volver al menú principal',
    facts: [
      "Los A-4 Skyhawk atacaban a menos de 15 metros sobre el mar para evadir los radares de la flota.",
      "El estrecho de San Carlos fue apodado 'Bomb Alley' — el callejon de las bombas — por los propios britanicos.",
      "Varias bombas argentinas impactaron sin estallar: lanzadas tan bajo, la espoleta no llegaba a armarse.",
      "Los KC-130 Hercules reabastecian en vuelo a los cazas: sin ellos, muchos no volvian al continente.",
      "El 1 de mayo de 1982 la aviacion argentina enfrento a la flota britanica en su bautismo de fuego.",
      "Cada mision se volaba al limite del combustible: minutos sobre el objetivo, a 700 km de las bases."
    ],
  },
  en: {
    langName: 'English',
    pageHeader: '■ <b>RASANTE</b> · frontal view · South Atlantic, 1982',
    pageFooter: '<kbd>UP</kbd>/<kbd>W</kbd>: throttle — release and you fall &nbsp;·&nbsp; <kbd>←</kbd><kbd>→</kbd>: dodge &nbsp;·&nbsp; <kbd>DOWN</kbd>: dive &nbsp;·&nbsp; <kbd>X</kbd>/<kbd>SPACE</kbd>: cannon &nbsp;·&nbsp; <kbd>Z</kbd>: missile &nbsp;·&nbsp; <kbd>SHIFT</kbd>/<kbd>C</kbd>: boost &nbsp;·&nbsp; <kbd>V</kbd>: camera (1×→2.5×) &nbsp;·&nbsp; <kbd>MOUSE</kbd>: free aim (click: cannon · right click: missile)<br>Touch: drag on the left to fly · top-right: fire · bottom-right: boost · MISSILE button bottom-left<br>Flying low multiplies. Grazing obstacles gives a bonus. Boost doubles points and burns fuel.',
    aria: 'Rasante game: arrows to maneuver, X to fire, Shift to boost',
    death_land: 'You hit the ground', death_sea: 'You hit the sea',
    death_mast: 'You hit a frigate', death_helo: 'Collided with a helicopter',
    death_jet: 'Hit an enemy plane', death_balloon: 'Barrage balloon',
    death_missile: 'A missile hit you',
    death_aa: 'The barge defenses shot you down',
    death_fuel: 'You ran out of fuel over the target',
    freeControl: 'FREE CONTROL!', rasante: 'LOW PASS x{n}!', afterburner: 'AFTERBURNER x{n}!',
    aimFixed: 'AIM LOCKED', aimFree: 'AIM FREE',
    thrDown: 'PITCH: ↓ CLIMB', thrUp: 'PITCH: ↑ CLIMB',
    scrape: '! PULL UP !',
    pickFuel: '+FUEL', graze: 'GRAZE +75', dodgeMissile: 'DODGED +75',
    rollGraze: 'BARREL ROLL! +250',
    takeoffTitle: 'TAKEOFF · PUERTO ARGENTINO · BAM MALVINAS',
    takeoffHeading: 'heading for San Carlos Strait',
    hud_best: 'BEST {n}', kmh: ' KM/H', turboTag: ' BOOST',
    windWarn: '~ HEADWIND ~', radar: '! RADAR !',
    bar_fuel: 'FUEL', bar_cannon: 'CANNON 20MM', bar_overheat: 'OVERHEAT',
    thr: 'THR', thr_dead: 'NO THR',
    hud_status: 'STATUS',
    title: 'R A S A N T E', subtitle: 'frontal view · South Atlantic · 1982',
    ctrl1: 'UP: throttle (release = fall) · LEFT/RIGHT: dodge',
    ctrl2: 'DOWN: dive · X: cannon · SHIFT: boost · double ←/→: BARREL ROLL',
    ctrl3: 'MOUSE: free aim · CLICK: cannon · RIGHT CLICK: missile · V: camera',
    tip1: 'Lower = more points. Grazing gives a bonus.',
    tip2: 'Boost doubles the score and burns fuel.',
    tip3: 'Too high = radar detects you.',
    startPrompt: 'ANY KEY or TAP to take off',
    selTitle: 'CHOOSE YOUR AIRCRAFT',
    selHint: '<  >  choose      ENTER / TAP  take off',
    modePrompt: 'CHOOSE GAME MODE',
    modeCampaign: 'CAMPAIGN', modeSurvival: 'SURVIVAL', modeCycle: 'DEATH CYCLE',
    modeCampaignDesc: 'Story mode by levels', modeSurvivalDesc: 'Endless score until you die',
    modeCycleDesc: 'Random objectives, rising difficulty',
    modeHint: 'arrows: choose   ENTER / TAP: confirm',
    portLabel: 'PORT', bargeDown: 'BARGE DESTROYED', reached: 'reached',
    continuePrompt: 'ANY KEY or TAP to continue',
    mom_title: 'M O M E N T U M', mom_hint: 'KEEP THE SIGHT ON THE ZONE AND FIRE [X]',
    mom_pass: 'PASS {n}/{m}', mom_clear: 'PASS COMPLETE!', mom_next: 'NEXT PASS >>',
    mom_destroyed: '{z} DESTROYED',
    zone_aa: 'AA GUN', zone_radar: 'RADAR', zone_bridge: 'BRIDGE',
    zone_engine: 'ENGINE', zone_deposit: 'CARGO HOLD',
    storyIntro: [
      {
        title: 'MALVINAS · 1982', paras: [
          'Since 1833, the Argentine Republic has maintained a sovereignty claim over the Malvinas Islands.',
          'For nearly one hundred and fifty years, that claim continued through diplomatic channels.',
          'But in 1982, history would change forever.']
      },
      {
        title: 'ARGENTINA · MARCH 1982', paras: [
          'Argentina was going through one of the hardest moments in its history.',
          'The country was ruled by a military dictatorship headed by Lieutenant General Leopoldo Fortunato Galtieri.']
      },
      {
        title: 'THE DECISION', paras: [
          'Amid a deep political, economic and social crisis, the Junta made a decision that would mark the fate of thousands of Argentines.',
          'To retake the Malvinas Islands through a military operation.']
      },
      {
        title: 'OPERATION ROSARIO · APRIL 2ND', paras: [
          'Operation Rosario regained control of the islands.',
          'The initial clash left few casualties.',
          'For a few hours, much of the Argentine people believed the conflict was over.',
          'It would not be so.']
      },
      { level: 'LEVEL 0 — THE TASK FORCE APPROACHES', obj: 'Objective: master low-level flight · Open sea' },
    ],
    storyL1: [
      {
        title: 'THE FLEET', paras: [
          'The United Kingdom responded by sending one of the largest war fleets mobilized since World War II.',
          'Two aircraft carriers. Destroyers. Frigates. Nuclear submarines.']
      },
      {
        title: 'SOUTH BOUND', paras: [
          'More than one hundred ships sailed for the South Atlantic.',
          'Meanwhile, Argentina began to prepare its defense.']
      },
      { level: 'LEVEL 1 — BAPTISM OF FIRE', obj: 'May 1st, 1982 · Coast' },
    ],
    // Fin de mision. Los textos LARGOS (briefings y epilogos) no estan traducidos todavia:
    // T() cae solo al español, asi que el juego funciona igual. Ver docs/PREGUNTAS_HISTORICAS.md.
    mom_turn: '! 180 TURN !', mom_pass_n: 'ATTEMPT {n}',
    hud_mission: 'MISSION {n}/{m}',
    res_title: 'MISSION COMPLETE', res_total: 'TOTAL', res_rank: 'RATING:',
    res_flight: 'FLIGHT SCORE', res_kills: 'TARGETS', res_acc: 'ACCURACY', res_ras: 'LOW-PASS STREAK',
    rank_cadete: 'CADET', rank_piloto: 'PILOT', rank_as: 'ACE', rank_halcon: 'HAWK OF THE ATLANTIC',
    brief_title: 'MISSION ORDER', brief_goal: 'OBJECTIVE:', brief_go: 'ANY KEY  to take off',

    homage: 'In tribute to the pilots and veterans of the Malvinas',
    dead: 'S H O T   D O W N', scoreLabel: 'SCORE  {n}',
    newRecord: '★ NEW RECORD ★', bestDead: 'BEST  {n}',
    retryPrompt: 'ANY KEY or TAP to fly again',
    menuPrompt: 'ESC to return to main menu',
    facts: [
      "A-4 Skyhawks attacked under 15 meters above the sea to evade the fleet's radar.",
      "San Carlos Strait was nicknamed 'Bomb Alley' by the British themselves.",
      "Many Argentine bombs hit without exploding: dropped so low, the fuze could not arm in time.",
      "KC-130 Hercules refueled the fighters in flight: without them, many would not return to the mainland.",
      "On 1 May 1982 the Argentine air arm faced the British fleet in its baptism of fire.",
      "Every mission flew at the fuel limit: minutes over the target, 700 km from base."
    ],
  },
};
