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
    pageHeader: '■ <b>RASANTE</b> · Atlántico Sur, 1982 · Batalla por Malvinas',
    pageFooter: '<kbd>W</kbd>: gas — si soltás, el avión cae &nbsp;·&nbsp; <kbd>A</kbd><kbd>D</kbd>: esquivar &nbsp;·&nbsp; <kbd>S</kbd>: picada &nbsp;·&nbsp; <kbd>←</kbd><kbd>→</kbd>: rolar &nbsp;·&nbsp; <kbd>↑</kbd><kbd>↓</kbd>: mirar arriba/abajo &nbsp;·&nbsp; <kbd>X</kbd>/<kbd>ESPACIO</kbd>: cañón &nbsp;·&nbsp; <kbd>Z</kbd>: misil &nbsp;·&nbsp; <kbd>SHIFT</kbd>/<kbd>C</kbd>: turbo &nbsp;·&nbsp; <kbd>V</kbd>: cámara (1×→2.5×) &nbsp;·&nbsp; <kbd>CAPS</kbd>/<kbd>MOUSE</kbd>: mira libre (click: cañón · click der: misil)<br>Táctil: arrastrá a la izquierda para volar · derecha arriba: fuego · derecha abajo: turbo · botón MISIL abajo izquierda<br>Volar bajo multiplica. Rozar obstáculos da bonus. El turbo duplica puntos y quema combustible.',
    aria: 'Juego Rasante: WASD para volar, flechas para rolar y mirar, X dispara, Shift turbo',
    death_land: 'Chocaste el terreno', death_sea: 'Impactaste el mar',
    death_mast: 'Chocaste una fragata', death_tree: 'Chocaste un arbol', death_helo: 'Colision con helicoptero',
    death_jet: 'Choque con avion enemigo', death_balloon: 'Globo de barrera',
    death_missile: 'Te alcanzo un misil',
    death_aagun: 'Chocaste con el antiaereo', death_bldg: 'Te estrellaste contra un puesto britanico',
    death_lcu: 'Chocaste una barcaza de desembarco', death_gunfire: 'Te alcanzo el fuego desde tierra',
    tentDown: 'CAMPAMENTO ARRASADO',
    death_bomb: 'Te alcanzo una bomba en el aire', death_radar: 'Chocaste un radar movil',
    death_tower: 'Chocaste una torre de comunicaciones', death_wire: 'Te enganchaste en los cables',
    death_flag: 'Chocaste un mastil', death_depot: 'Te estrellaste contra un deposito',
    death_cliff: 'Te estrellaste contra un acantilado',
    hitBirds: '! BANDADA !', hitBlast: '! ONDA EXPANSIVA !', hitSmall: '! IMPACTO !',
    death_aa: 'La defensa de la barcaza te derribo',
    death_fuel: 'Te quedaste sin combustible sobre el blanco',
    freeControl: 'CONTROL LIBRE!', rasante: 'RASANTE x{n}!', afterburner: 'TURBINA x{n}!',
    aimFixed: 'MIRA FIJA', aimFree: 'MIRA LIBRE',
    thrDown: 'PALANCA: ↓ SUBE', thrUp: 'PALANCA: ↑ SUBE',
    scrape: '! PELIGRO !',
    pickFuel: '+COMB', dodgeMissile: 'LO ESQUIVASTE +75',
    takeoffTitle: 'DESPEGUE · PUERTO ARGENTINO · BAM MALVINAS',
    takeoffHeading: 'rumbo al estrecho de San Carlos',
    hud_best: 'MEJOR {n}', kmh: ' KM/H', turboTag: ' TURBO', alt: ' M',
    windWarn: '~ VIENTO EN CONTRA ~', radar: '! RADAR !',
    fogIn: '! BANCO DE NIEBLA !', fogIn2: 'SUBI O VOLA A CIEGAS', fogOut: 'NIEBLA DESPEJADA',
    fogHud: 'NIEBLA',
    radarLock: '! TE DETECTO EL RADAR !', radarLock2: 'TE ATACARAN DESDE TIERRA',
    radarWave: '! OLEADA x{n} !',
    sq_down: '{c} DERRIBADO', sq_take: '{c} ASUME EL MANDO',
    sq_dmg: '{c} AVERIADO — VUELVE A LA BASE',
    sq_yours: 'TENES EL MANDO!', sq_last: '! ULTIMO AVION !',
    dead_out: 'FUERA DE COMBATE',
    bar_fuel: 'COMB', bar_cannon: 'CANON 20MM', bar_overheat: 'RECALENTADO',
    bar_tempo: 'MOMENTUM', tempoOn: 'MOMENTUM', tempoOff: 'TIEMPO REAL', tempoReady: '! MOMENTUM LISTO — [4] !',
    // menu de PAUSA (overlay sobre la partida congelada)
    pauseTitle: 'PAUSA',
    pauseResume: 'CONTINUAR', pauseControls: 'CONTROLES', pauseSaveRow: 'GUARDAR PARTIDA',
    pauseQuit: 'SALIR DE PARTIDA',
    pauseSaved: 'PARTIDA GUARDADA',
    pauseHint: '[ESC] REANUDAR',
    // guardado / partidas
    saveNew: '+ GUARDAR NUEVA',
    saveOver: 'ELEGIR UNA EXISTENTE LA SOBREESCRIBE',
    savesTitle: 'PARTIDAS GUARDADAS',
    savesEmpty: 'SIN PARTIDAS GUARDADAS',
    missionShort: 'MISION {n}',
    // menu de HISTORIA (submenu al elegir el modo)
    campTitle: 'HISTORIA',
    campSecContinue: 'CONTINUAR', campSecNew: 'NUEVA PARTIDA',
    campContinue: 'PARTIDAS GUARDADAS',
    campContinueDesc: 'RETOMAR DONDE LA DEJASTE',
    campC1Desc: 'CAMPANA 1 — MAYO DE 1982',
    campC2Desc: 'CAMPANA 2',
    campSoon: 'PROXIMAMENTE',
    thr: 'GAS', thr_dead: 'SIN GAS',
    hud_status: 'ESTADO',
    title: 'R A S A N T E', subtitle: 'Batalla por Malvinas · Atlantico Sur · 1982',
    ctrl1: 'W: gas (si soltas, caes) · A/D: esquivar · S: picada',
    ctrl2: 'X: canon · Z: misil · SHIFT: turbo · combos: PIRUETAS',
    ctrl3: '← →: rolar · ↑ ↓: mirar · CAPS: mira libre (mouse) · V: camara',
    tip1: 'Mas bajo = mas puntos. Rozar obstaculos da bonus.',
    tip2: 'El turbo duplica el puntaje y quema combustible.',
    tip3: 'Muy alto = te detecta el radar.',
    startPrompt: 'CUALQUIER TECLA  para despegar',
    selTitle: 'ELEGI TU AVION',
    selHint: '<  >  elegir      ENTER / TOCAR  despegar',
    modePrompt: 'ELEGI MODO DE JUEGO',
    pressStart: 'APRETA UNA TECLA PARA EMPEZAR', modeQuit: 'SALIR', modeQuitDesc: 'Cerrar el juego',
    modeOptions: 'OPCIONES', modeOptionsDesc: 'Idioma y ajustes del juego',
    optTitle: 'OPCIONES', optLang: 'IDIOMA',
    // HORIZONTE GIRATORIO (ver core/horizon.js). Los nombres describen CUANDO gira, no un si/no:
    // el jugador que lo apaga suele hacerlo por mareo, y PIRUETAS es el termino medio.
    optHorizon: 'HORIZONTE',
    optHzFix: 'FIJO', optHzMoves: 'EN PIRUETAS', optHzAll: 'TOTAL',
    // el nombre lleva las teclas: es la unica forma de enterarse de que existen
    optHzFree: 'LIBRE 360°  [Q] [E]',
    // ESQUEMA DE CONTROL: la unica fila de OPCIONES que cambia como se JUEGA
    optControl: 'CONTROL',
    optCtrlDirect: 'DIRECTO', optCtrlBank: 'POR ALABEO',
    // RED DE RADAR: la malla naranja del techo de deteccion
    optNet: 'RED DE RADAR',
    optNetOff: 'NO', optNetEnter: 'AL ENTRAR', optNetAlways: 'SIEMPRE',
    optKeys: '[↑] [↓] ELEGIR      [<] [>] CAMBIAR      [ESC] ATRAS',
    // ---------- OPCIONES: la pantalla UNICA de configuracion ----------
    // Las filas venian del menu [M], que era solo-castellano porque era una herramienta interna.
    // Al mudarse a OPCIONES —que tiene el selector de IDIOMA adentro— quedar a medio traducir se
    // notaria de una, asi que pasan todas por T().
    optSecJuego: 'JUEGO', optSecControl: 'CONTROL Y VISTA', optSecPartida: 'PARTIDA',
    optSecAmbiente: 'AMBIENTE',
    optNoteAmbiente: 'FONDO y AGUA los elige la campaña en cada misión', optNoteAmbienteK: '', optNoteAmbienteP: '',
    optSecMapa: 'MAPA  ·  solo POR LA PATRIA y CICLO DE MUERTE',
    optSecCiclo: 'SOLO CICLO DE MUERTE', optSecArena: 'SOLO MINUTOS SAGRADOS',
    optSecDebug: 'DEPURACION  ·  herramientas de desarrollo',
    optYes: 'SI', optNo: 'NO',
    optMira: 'RETICULO', optMoves: 'PIRUETAS',
    optAim: 'MIRA', optAimFixed: 'FIJA', optAimFree: 'MOVIL (mouse)',
    optArenaInv: 'EJE Y EN BATALLA', optArenaInvNo: 'W SUBE EL MORRO', optArenaInvYes: 'INVERTIDO',
    optSquad: 'ESCUADRON', optSquadSolo: 'SOLO',
    optFuel: 'COMBUSTIBLE', optEnergy: 'ENERGIA',
    optEnemies: 'ENEMIGOS', optEnemiesOn: 'MOVILES', optEnemiesOff: 'QUIETOS',
    optSky: 'FONDO',
    optSkyDusk: 'ATARDECER', optSkyNight: 'NOCHE', optSkyStorm: 'TORMENTA',
    optSkyClear: 'DESPEJADO', optSkyCloudy: 'NUBLADO', optSkySun: 'SOL PLENO',
    optSkyMoon: 'LUNA LLENA', optSkyDawn: 'AMANECER',
    optWater: 'AGUA', optWaterSea: 'MAR', optWaterViolet: 'VIOLETA',
    // LLUVIA: ambiente puro, no cambia la dificultad (ver render/rain.js)
    optRain: 'LLUVIA', optRainOff: 'NO', optRainDrizzle: 'GARUA', optRainRain: 'LLUVIA', optRainStorm: 'TORMENTA',
    optTerrain: 'TERRENO', optTerrainSea: 'MAR', optTerrainLand: 'TIERRA', optTerrainCoast: 'COSTA',
    optWind: 'VIENTO',
    // NIEBLA: dificultad, no ambiente (ver systems/fog.js)
    optFog: 'NIEBLA', optFogOff: 'NO', optFogLight: 'VISIBLE', optFogThick: 'CASI NULA',
    optFogLen: 'LARGO DE NIEBLA', optFogLen0: 'CORTO', optFogLen1: 'MEDIO', optFogLen2: 'LARGO', optFogLen3: 'MUY LARGO',
    optObst: 'OBSTACULOS', optObst0: 'NINGUNO', optObst1: 'POCOS', optObst2: 'NORMAL', optObst3: 'MUCHOS',
    optBombs: 'BOMBARDEO', optBombs0: 'NO', optBombs1: 'POCO', optBombs2: 'NORMAL', optBombs3: 'INTENSO',
    optCoast: 'COSTA', optCoastShort: 'CORTA', optCoastMid: 'NORMAL', optCoastLong: 'LARGA',
    optRunway: 'PISTA',
    optCliff: 'ACANTILADO',
    optStart: 'ARRANQUE', optStartRunway: 'PISTA', optStartAir: 'EN VUELO',
    optMeters: 'METROS', optShip: 'BUQUE',
    optHitboxes: 'HITBOXES', optDevcam: 'MODO CAMARA', optDevcamOff: 'NORMAL', optDevcamOn: 'LIBRE',
    // ---------- CONTROLES: sección informativa de OPCIONES (no se cambia nada, se LEE) ----------
    // Sale de lo que hace core/input.js, no de lo que debería hacer. Los nombres de botón son los
    // de un mando estilo PlayStation, que es el mapeo estándar de la Gamepad API.
    optSecCtrl: 'CONTROLES',
    optColKb: 'TECLADO', optColPad: 'JOYSTICK',
    ctrlFly: 'ESQUIVAR',        ctrlFlyK: 'A   ·   D',          ctrlFlyP: 'stick izq · cruceta',
    ctrlGas: 'GAS (subir)',     ctrlGasK: 'W',                  ctrlGasP: 'stick izq arriba',
    ctrlDive: 'PICADA',         ctrlDiveK: 'S',                 ctrlDiveP: 'stick izq abajo',
    ctrlGun: 'CAÑON',           ctrlGunK: 'X · ESPACIO · K',    ctrlGunP: 'R1   ·   ✕',
    ctrlMsl: 'MISIL',           ctrlMslK: 'Z   ·   TAB',        ctrlMslP: 'L1   ·   □',
    ctrlBoost: 'TURBO',         ctrlBoostK: 'SHIFT   ·   C',    ctrlBoostP: 'gatillo',
    ctrlRoll: 'ROLAR / GIRO 360°', ctrlRollK: '← →  ·  Q E',    ctrlRollP: 'stick der ← →',
    ctrlPan: 'MIRAR ARR / ABAJO', ctrlPanK: '↑ ↓  ·  R F',      ctrlPanP: 'stick der ↑ ↓',
    ctrlMoves: 'PIRUETAS',      ctrlMovesK: 'secuencias de toques', ctrlMovesP: 'los dos sticks',
    ctrlHands: 'zigzag: mano izq · rolidos: mano der', ctrlHandsK: '', ctrlHandsP: '',
    ctrlWasd: 'con MIRA MOVIL, las flechas vuelven a volar', ctrlWasdK: '', ctrlWasdP: '',
    ctrlAim: 'MIRA fija/movil', ctrlAimK: 'CAPS LOCK · mouse',  ctrlAimP: 'siempre fija',
    ctrlCam: 'CAMARA',          ctrlCamK: 'V',                  ctrlCamP: '—',
    ctrlTempo: 'MOMENTUM (camara lenta)', ctrlTempoK: '4',      ctrlTempoP: '—',
    ctrlInv: 'INVERTIR EL GAS', ctrlInvK: '—',                  ctrlInvP: '△',
    ctrlMusic: 'PISTA MUSICAL', ctrlMusicK: '1   ·   2',        ctrlMusicP: 'L3 · R3',
    ctrlMenu: 'EN LOS MENUS',   ctrlMenuK: 'flechas · ENTER · ESC', ctrlMenuP: 'cruceta · ✕ · ◯',
    selKeys: '[ESC] ATRAS      [ENTER] SELECCIONAR',
    modeCampaign: 'HISTORIA', modeSurvival: 'POR LA PATRIA', modeCycle: 'CICLO DE MUERTE',
    modeCampaignDesc: 'Modo historia por niveles', modeSurvivalDesc: 'Puntaje infinito hasta morir',
    modeCycleDesc: 'Objetivos aleatorios, dificultad creciente',
    modeArena: 'MINUTOS SAGRADOS', modeArenaDesc: 'Batallas aleatorias',
    modeHint: 'flechas: elegir   ENTER / TOCAR: confirmar',
    portLabel: 'PUERTO', bargeDown: 'BARCAZA DESTRUIDA', reached: 'alcanzados',
    continuePrompt: 'CUALQUIER TECLA para continuar',
    mom_title: 'M O M E N T U M', mom_hint: 'MANTENE LA MIRA EN LA ZONA Y DISPARA [X]',
    mom_pass: 'PASADA {n}/{m}', mom_clear: 'PASADA COMPLETA!', mom_next: 'PROXIMA PASADA >>',
    // ARENA: el asalto volado en 3D (climax con three.js; sin 3D rige el momentum clasico)
    arena_hint: 'MORRO [W]/[S] · ROLA Y VIRA [Q]/[E] · FRENO [F] · [X] FUEGO [Z] MISIL · [V] CAMARA',
    arena_low: '! EL MAR — ARRIBA !',
    arena_sunk: 'BUQUE FUERA DE COMBATE!', arena_squad: 'ESCUADRON',
    arena_v1: 'CABINA', arena_v3: 'TERCERA PERSONA',
    arena_out: '! FUERA DE LA ZONA DE COMBATE !', arena_auto: 'REENCARANDO AL BLANCO',
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

    homage: 'En homenaje a los veteranos y caidos de Malvinas',
    dead: 'D E R R I B A D O', scoreLabel: 'PUNTAJE  {n}',
    newRecord: '★ NUEVO RECORD ★', bestDead: 'MEJOR  {n}',
    retryPrompt: 'Apreta cualquier cosa para reintentarlo',
    menuPrompt: '[ESC] Volver al menu',
    anyKeyMenu: 'CUALQUIER TECLA  para el menu',
    // CIERRE de la campaña. Va SIN TILDES como el resto del texto de canvas (ver `facts`): las
    // fuentes de marca no tienen garantizados los glifos acentuados y "CAMPANA COMPLETADA" ya
    // esquiva la Ñ por lo mismo. En ingles la frase queda en español con la traduccion debajo:
    // es una cita de una persona real, no una linea de interfaz.
    quoteIorio: '"Alla hay gente tan buena como aca... lo que pasa es que no nos dejan conocernos."',
    quoteIorioBy: '— RICARDO IORIO',
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
    pageFooter: '<kbd>W</kbd>: throttle — release and you fall &nbsp;·&nbsp; <kbd>A</kbd><kbd>D</kbd>: dodge &nbsp;·&nbsp; <kbd>S</kbd>: dive &nbsp;·&nbsp; <kbd>←</kbd><kbd>→</kbd>: roll &nbsp;·&nbsp; <kbd>↑</kbd><kbd>↓</kbd>: look up/down &nbsp;·&nbsp; <kbd>X</kbd>/<kbd>SPACE</kbd>: cannon &nbsp;·&nbsp; <kbd>Z</kbd>: missile &nbsp;·&nbsp; <kbd>SHIFT</kbd>/<kbd>C</kbd>: boost &nbsp;·&nbsp; <kbd>V</kbd>: camera (1×→2.5×) &nbsp;·&nbsp; <kbd>CAPS</kbd>/<kbd>MOUSE</kbd>: free aim (click: cannon · right click: missile)<br>Touch: drag on the left to fly · top-right: fire · bottom-right: boost · MISSILE button bottom-left<br>Flying low multiplies. Grazing obstacles gives a bonus. Boost doubles points and burns fuel.',
    aria: 'Rasante game: arrows to maneuver, X to fire, Shift to boost',
    death_land: 'You hit the ground', death_sea: 'You hit the sea',
    death_mast: 'You hit a frigate', death_tree: 'You hit a tree', death_helo: 'Collided with a helicopter',
    death_jet: 'Hit an enemy plane', death_balloon: 'Barrage balloon',
    death_missile: 'A missile hit you',
    death_aagun: 'You hit the AA gun', death_bldg: 'You crashed into a British outpost',
    death_lcu: 'You hit a landing craft', death_gunfire: 'Ground fire hit you',
    tentDown: 'CAMP FLATTENED',
    death_bomb: 'A falling bomb hit you', death_radar: 'You hit a mobile radar',
    death_tower: 'You hit a comms tower', death_wire: 'You snagged the power lines',
    death_flag: 'You hit a flagpole', death_depot: 'You crashed into a depot',
    death_cliff: 'You flew into a cliff',
    hitBirds: '! BIRD FLOCK !', hitBlast: '! BLAST WAVE !',
    death_aa: 'The barge defenses shot you down',
    death_fuel: 'You ran out of fuel over the target',
    freeControl: 'FREE CONTROL!', rasante: 'LOW PASS x{n}!', afterburner: 'AFTERBURNER x{n}!',
    aimFixed: 'AIM LOCKED', aimFree: 'AIM FREE',
    thrDown: 'PITCH: ↓ CLIMB', thrUp: 'PITCH: ↑ CLIMB',
    scrape: '! DANGER !',
    pickFuel: '+FUEL', dodgeMissile: 'DODGED +75',
    takeoffTitle: 'TAKEOFF · PUERTO ARGENTINO · BAM MALVINAS',
    takeoffHeading: 'heading for San Carlos Strait',
    hud_best: 'BEST {n}', kmh: ' KM/H', turboTag: ' BOOST', alt: ' M',
    windWarn: '~ HEADWIND ~', radar: '! RADAR !',
    fogIn: '! FOG BANK !', fogIn2: 'CLIMB OR FLY BLIND', fogOut: 'FOG CLEARED',
    fogHud: 'FOG',
    radarLock: '! RADAR HAS YOU !', radarLock2: 'GROUND BATTERIES ENGAGING',
    radarWave: '! SALVO x{n} !',
    sq_down: '{c} IS DOWN', sq_take: '{c} TAKING COMMAND',
    sq_dmg: '{c} DAMAGED — RETURNING TO BASE',
    sq_yours: 'YOU HAVE CONTROL!', sq_last: '! LAST AIRCRAFT !',
    dead_out: 'OUT OF ACTION',
    bar_fuel: 'FUEL', bar_cannon: 'CANNON 20MM', bar_overheat: 'OVERHEAT',
    bar_tempo: 'MOMENTUM', tempoOn: 'MOMENTUM', tempoOff: 'REAL TIME', tempoReady: '! MOMENTUM READY — [4] !',
    // PAUSE menu
    pauseTitle: 'PAUSED',
    pauseResume: 'RESUME', pauseControls: 'CONTROLS', pauseSaveRow: 'SAVE GAME',
    pauseQuit: 'QUIT MISSION',
    pauseSaved: 'GAME SAVED',
    pauseHint: '[ESC] RESUME',
    // saves
    saveNew: '+ NEW SAVE',
    saveOver: 'PICKING ONE OVERWRITES IT',
    savesTitle: 'SAVED GAMES',
    savesEmpty: 'NO SAVED GAMES',
    missionShort: 'MISSION {n}',
    // STORY submenu
    campTitle: 'STORY',
    campSecContinue: 'CONTINUE', campSecNew: 'NEW GAME',
    campContinue: 'SAVED GAMES',
    campContinueDesc: 'PICK UP WHERE YOU LEFT OFF',
    campC1Desc: 'CAMPAIGN 1 — MAY 1982',
    campC2Desc: 'CAMPAIGN 2',
    campSoon: 'COMING SOON',
    thr: 'THR', thr_dead: 'NO THR',
    hud_status: 'STATUS',
    title: 'R A S A N T E', subtitle: 'Battle for Malvinas · South Atlantic · 1982',
    ctrl1: 'W: throttle (release = fall) · A/D: dodge · S: dive',
    ctrl2: 'X: cannon · Z: missile · SHIFT: boost · combos: MANEUVERS',
    ctrl3: '← →: roll · ↑ ↓: look · CAPS: free aim (mouse) · V: camera',
    tip1: 'Lower = more points. Grazing gives a bonus.',
    tip2: 'Boost doubles the score and burns fuel.',
    tip3: 'Too high = radar detects you.',
    startPrompt: 'ANY KEY or TAP to take off',
    selTitle: 'CHOOSE YOUR AIRCRAFT',
    selHint: '<  >  choose      ENTER / TAP  take off',
    modePrompt: 'CHOOSE GAME MODE',
    pressStart: 'PRESS ANY KEY TO START', modeQuit: 'QUIT', modeQuitDesc: 'Close the game',
    modeOptions: 'OPTIONS', modeOptionsDesc: 'Language and game settings',
    optTitle: 'OPTIONS', optLang: 'LANGUAGE',
    optHorizon: 'HORIZON',
    optHzFix: 'FIXED', optHzMoves: 'ON MANEUVERS', optHzAll: 'FULL',
    optHzFree: 'FREE 360°  [Q] [E]',
    optControl: 'CONTROL',
    optCtrlDirect: 'DIRECT', optCtrlBank: 'BANK TO TURN',
    optNet: 'RADAR MESH',
    optNetOff: 'OFF', optNetEnter: 'ON ENTERING', optNetAlways: 'ALWAYS',
    optKeys: '[↑] [↓] SELECT      [<] [>] CHANGE      [ESC] BACK',
    optSecJuego: 'GAME', optSecControl: 'CONTROLS & VIEW', optSecPartida: 'RUN',
    optSecAmbiente: 'WEATHER',
    optNoteAmbiente: 'SKY and WATER are set by the campaign each mission', optNoteAmbienteK: '', optNoteAmbienteP: '',
    optSecMapa: 'MAP  ·  SURVIVAL and DEATH CYCLE only',
    optSecCiclo: 'DEATH CYCLE ONLY', optSecArena: 'SACRED MINUTES ONLY',
    optSecDebug: 'DEBUG  ·  development tools',
    optYes: 'YES', optNo: 'NO',
    optMira: 'RETICLE', optMoves: 'MANEUVERS',
    optAim: 'SIGHT', optAimFixed: 'FIXED', optAimFree: 'FREE (mouse)',
    optArenaInv: 'BATTLE Y AXIS', optArenaInvNo: 'W = NOSE UP', optArenaInvYes: 'INVERTED',
    optSquad: 'SQUADRON', optSquadSolo: 'SOLO',
    optFuel: 'FUEL', optEnergy: 'ENERGY',
    optEnemies: 'ENEMIES', optEnemiesOn: 'MOVING', optEnemiesOff: 'STATIC',
    optSky: 'SKY',
    optSkyDusk: 'DUSK', optSkyNight: 'NIGHT', optSkyStorm: 'STORM',
    optSkyClear: 'CLEAR', optSkyCloudy: 'OVERCAST', optSkySun: 'FULL SUN',
    optSkyMoon: 'FULL MOON', optSkyDawn: 'DAWN',
    optWater: 'WATER', optWaterSea: 'SEA', optWaterViolet: 'VIOLET',
    optRain: 'RAIN', optRainOff: 'NO', optRainDrizzle: 'DRIZZLE', optRainRain: 'RAIN', optRainStorm: 'STORM',
    optTerrain: 'TERRAIN', optTerrainSea: 'SEA', optTerrainLand: 'LAND', optTerrainCoast: 'COAST',
    optWind: 'WIND',
    optFog: 'FOG', optFogOff: 'NO', optFogLight: 'THIN', optFogThick: 'NEAR ZERO',
    optFogLen: 'FOG BANK LENGTH', optFogLen0: 'SHORT', optFogLen1: 'MEDIUM', optFogLen2: 'LONG', optFogLen3: 'VERY LONG',
    optObst: 'OBSTACLES', optObst0: 'NONE', optObst1: 'FEW', optObst2: 'NORMAL', optObst3: 'MANY',
    optBombs: 'BOMBING', optBombs0: 'NONE', optBombs1: 'LIGHT', optBombs2: 'NORMAL', optBombs3: 'HEAVY',
    optCoast: 'COASTLINE', optCoastShort: 'SHORT', optCoastMid: 'NORMAL', optCoastLong: 'LONG',
    optRunway: 'RUNWAY',
    optCliff: 'CLIFF',
    optStart: 'START', optStartRunway: 'RUNWAY', optStartAir: 'AIRBORNE',
    optMeters: 'METERS', optShip: 'SHIP',
    optHitboxes: 'HITBOXES', optDevcam: 'CAMERA MODE', optDevcamOff: 'NORMAL', optDevcamOn: 'FREE',
    optSecCtrl: 'CONTROLS',
    optColKb: 'KEYBOARD', optColPad: 'GAMEPAD',
    ctrlFly: 'DODGE',           ctrlFlyK: 'A   ·   D',          ctrlFlyP: 'left stick · d-pad',
    ctrlGas: 'THROTTLE (climb)', ctrlGasK: 'W',                 ctrlGasP: 'left stick up',
    ctrlDive: 'DIVE',           ctrlDiveK: 'S',                 ctrlDiveP: 'left stick down',
    ctrlGun: 'CANNON',          ctrlGunK: 'X · SPACE · K',      ctrlGunP: 'R1   ·   ✕',
    ctrlMsl: 'MISSILE',         ctrlMslK: 'Z   ·   TAB',        ctrlMslP: 'L1   ·   □',
    ctrlBoost: 'BOOST',         ctrlBoostK: 'SHIFT   ·   C',    ctrlBoostP: 'trigger',
    ctrlRoll: 'ROLL / 360° ROLL', ctrlRollK: '← →  ·  Q E',     ctrlRollP: 'right stick ← →',
    ctrlPan: 'LOOK UP / DOWN',  ctrlPanK: '↑ ↓  ·  R F',        ctrlPanP: 'right stick ↑ ↓',
    ctrlMoves: 'MANEUVERS',     ctrlMovesK: 'tap sequences',    ctrlMovesP: 'both sticks',
    ctrlHands: 'zigzags: left hand · rolls: right hand', ctrlHandsK: '', ctrlHandsP: '',
    ctrlWasd: 'with FREE SIGHT, the arrows fly again', ctrlWasdK: '', ctrlWasdP: '',
    ctrlAim: 'SIGHT fixed/free', ctrlAimK: 'CAPS LOCK · mouse', ctrlAimP: 'always fixed',
    ctrlCam: 'CAMERA',          ctrlCamK: 'V',                  ctrlCamP: '—',
    ctrlTempo: 'MOMENTUM (slow motion)', ctrlTempoK: '4',       ctrlTempoP: '—',
    ctrlInv: 'INVERT THROTTLE', ctrlInvK: '—',                  ctrlInvP: '△',
    ctrlMusic: 'MUSIC TRACK',   ctrlMusicK: '1   ·   2',        ctrlMusicP: 'L3 · R3',
    ctrlMenu: 'IN MENUS',       ctrlMenuK: 'arrows · ENTER · ESC', ctrlMenuP: 'd-pad · ✕ · ◯',
    selKeys: '[ESC] BACK      [ENTER] SELECT',
    modeCampaign: 'CAMPAIGN', modeSurvival: 'SURVIVAL', modeCycle: 'DEATH CYCLE',
    modeCampaignDesc: 'Story mode by levels', modeSurvivalDesc: 'Endless score until you die',
    modeCycleDesc: 'Random objectives, rising difficulty',
    modeArena: 'SACRED MINUTES', modeArenaDesc: 'Random battles',
    modeHint: 'arrows: choose   ENTER / TAP: confirm',
    portLabel: 'PORT', bargeDown: 'BARGE DESTROYED', reached: 'reached',
    continuePrompt: 'ANY KEY or TAP to continue',
    mom_title: 'M O M E N T U M', mom_hint: 'KEEP THE SIGHT ON THE ZONE AND FIRE [X]',
    mom_pass: 'PASS {n}/{m}', mom_clear: 'PASS COMPLETE!', mom_next: 'NEXT PASS >>',
    // ARENA: the flown 3D assault (three.js climax; without 3D the classic momentum runs)
    arena_hint: 'NOSE [W]/[S] · ROLL & TURN [Q]/[E] · BRAKE [F] · [X] FIRE [Z] MISSILE · [V] CAMERA',
    arena_low: '! SEA — PULL UP !',
    arena_sunk: 'SHIP OUT OF ACTION!', arena_squad: 'SQUADRON',
    arena_v1: 'COCKPIT', arena_v3: 'THIRD PERSON',
    arena_out: '! OUTSIDE THE COMBAT ZONE !', arena_auto: 'TURNING BACK TO TARGET',
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

    homage: 'In tribute to the veterans and fallen of the Malvinas',
    dead: 'S H O T   D O W N', scoreLabel: 'SCORE  {n}',
    newRecord: '★ NEW RECORD ★', bestDead: 'BEST  {n}',
    retryPrompt: 'Press anything to try again',
    menuPrompt: '[ESC] Back to menu',
    anyKeyMenu: 'ANY KEY  for the menu',
    // La cita va TRADUCIDA en ingles, no en español con subtitulo: es el cierre del juego y tiene
    // que leerse de una. El original en castellano queda en la version es.
    quoteIorio: '"Over there there are people as good as here... it is just that they do not let us know each other."',
    quoteIorioBy: '— RICARDO IORIO',
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
