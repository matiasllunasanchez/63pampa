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
    pageFooter: '<kbd>W</kbd>: gas — si soltás, el avión cae &nbsp;·&nbsp; <kbd>A</kbd><kbd>D</kbd>: esquivar &nbsp;·&nbsp; <kbd>S</kbd>: picada &nbsp;·&nbsp; <kbd>←</kbd><kbd>→</kbd>: rolar &nbsp;·&nbsp; <kbd>↑</kbd><kbd>↓</kbd>: mirar arriba/abajo &nbsp;·&nbsp; <kbd>X</kbd>/<kbd>ESPACIO</kbd>: cañón &nbsp;·&nbsp; <kbd>Z</kbd>: misil (y las bombas de la pasada) &nbsp;·&nbsp; <kbd>SHIFT</kbd>/<kbd>C</kbd>: turbo &nbsp;·&nbsp; <kbd>F</kbd>: freno &nbsp;·&nbsp; <kbd>ESC</kbd>: pausa &nbsp;·&nbsp; <kbd>CAPS</kbd>/<kbd>MOUSE</kbd>: mira libre (click: cañón · click der: misil)<br>Joystick (PlayStation o Xbox): stick izq vuela · stick der rola y mira · R1/RB cañón · L1/LB misil · R2/RT turbo · L2/LT freno · START pausa<br>Táctil: arrastrá a la izquierda para volar · derecha arriba: fuego · derecha abajo: turbo<br>Volar bajo multiplica. Rozar obstáculos da bonus. El turbo duplica puntos y quema combustible.',
    aria: 'Juego Rasante: WASD para volar, flechas para rolar y mirar, X dispara, Shift turbo',
    death_land: 'Chocaste el terreno', death_sea: 'Impactaste el mar',
    death_pared: 'Te comiste la ladera',
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
    // RF-15: la derrota de la PASADA. No te derribaron — se acabo la escuadrilla y el buque
    // seguia ahi. Que la pantalla de fin diga ESO y no "chocaste" es media leccion del modo.
    death_pasada: 'Se acabo la escuadrilla y el buque siguio navegando',
    // LA COLA (PLAN_HARRIERS_PERSECUCION §3). El aviso es HUMANO: lo grita Condor o un Fiel, y a
    // veces no llega (§2 — no habia radar ni RWR). Nada de tonos ni de recuadros de fijado.
    death_caza: 'Te engancho un Sea Harrier',
    caza_warn: '¡RAPIDO POR LA COLA, {c}!',
    caza_out: 'Se quedo sin nafta el ingles.',
    caza_break: '¡QUEBRA, {c}, QUEBRA!',
    caza_hit: '¡Le diste! Se va humeando.',
    caza_kill: '¡LO BAJASTE!',
    purs_lejos: '¡Cerra, {c}!',
    purs_cerca: 'Te me vas encima.',
    purs_perdido: 'Perdiste al lider',
    purs_choque: 'Chocaste a tu propio lider',
    purs_banda: 'FORMACION',
    modePersec: 'PERSECUCION',
    modePersecDesc: 'Vola de numeral. Manten la distancia con el lider: el sabe por donde pasar.',
    purs_releva: '{a} se queda sin nafta. Pegate a {b}.',
    purs_aprieta: 'Cerra la formacion, {c}. Se pone feo.',
    purs_tiron: '{c} abre turbo. ¡Seguime!',
    purs_pegado: 'Asi se vuela de numeral.',
    purs_caido: 'Cayo el lider',
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
    sq_spent: '{c} SALE DE LA CORRIDA',
    dead_out: 'FUERA DE COMBATE',
    bar_fuel: 'COMB', bar_cannon: 'CANON 20MM', bar_overheat: 'RECALENTADO',
    bar_tempo: 'MOMENTUM', tempoOn: 'MOMENTUM', tempoOff: 'TIEMPO REAL', tempoReady: '! MOMENTUM LISTO — [4] !',
    // LA CHANCHA (tecla 5): el ritual de radio del reabastecimiento. Las lineas citan el TONO de
    // la escena del guion sin reproducirla — esa es del modo historia.
    bar_chancha: 'CHANCHA', ch_ready: '! CHANCHA LISTA — [5] !',
    bar_rasante: 'RASANTE',
    // EL INTERSTICIAL DE CAMPAÑA (G-09): el corte entre una mision y la que sigue.
    inter_dia: 'DÍA SIGUIENTE',
    ch_call: 'CHANCHA, CHANCHA, ACA PATRIA — VENGO SECO',
    ch_ack: 'CONDOR COPIA. TE LA MANDO.',
    ch_come: 'LA CHANCHA NO ABANDONA. VOY.',
    ch_eta: 'CHANCHA EN {s}',
    ch_arriba: 'CHANCHA ARRIBA — SUBI A LA CANASTA',
    ch_connect: 'ENGANCHADO — NO TE MUEVAS',
    ch_drop: 'TE SALISTE — VOLVE',
    ch_full: 'SERVITE. NOS VEMOS ABAJO.',
    ch_bye: 'ME VUELVO, PATRIA. SUERTE.',
    ch_early: 'TODAVIA NO, PATRIA. AGUANTA.',
    ch_used: 'YA TE CARGUE HOY. NO HAY MAS.',
    ch_broken: 'LA CHANCHA NO BAJA MAS AL SUR.',
    // LA RADIO DEL TRANSITO DEL NARWAL (M4 / m3) — SPEC_TRAMOS T4. Son cuatro claves porque el
    // transito son cuatro tramos: la conversacion entera de GUION_3 no entra en un popup, y lo
    // que el guion pide no es el texto completo sino que el jugador VUELE mientras escucha. Se
    // eligieron las cuatro lineas que sostienen la escena: la posicion que el jugador va a usar,
    // la pregunta de Gitano, la respuesta que planta el Narwal, y el cierre de Puma.
    // EL TRANSITO DEL NARWAL (GUION_3 M4). Doce entradas y no cuatro: el guion pide "dos o tres
    // minutos en los que el jugador solamente vuela y escucha", y con cuatro lineas eso no es una
    // conversacion, es un cartel en cuatro pedazos. La risa del Gitano tiene que tener tiempo de
    // apagarse sola — ese es el beat, y necesita renglones para caerse.
    m5_boca: 'PUMA: AHI ESTA. LA BOCA DEL LOBO. ENTRAMOS, SOLTAMOS, SALIMOS.',
    m5_salida: 'PUMA: SE ABRE. MAR ABIERTO ADELANTE — Y EL ARDENT ESPERANDO.',
    m4_radio1: 'CONDOR: PLATA FIEL, ANOTO POSICIONES. DOS UNIDADES AL NORESTE, RUMBO SUR, VELOCIDAD DIEZ.',
    m4_radio2: 'CONDOR: UNA TERCERA MAS ATRAS, SIN CONFIRMAR.',
    m4_radio3: 'PUMA: COPIADO, CONDOR.',
    m4_radio4: 'GITANO: CONDOR, UNA PREGUNTA DE CURIOSO NOMAS. ¿DE DONDE SACAS VOS TODO ESO?',
    m4_radio5: 'CONDOR: DE UN BARCO PESQUERO LLAMADO NARWAL.',
    m4_radio6: 'GITANO: …¿UN PESQUERO?',
    m4_radio7: 'CONDOR: SETENTA METROS. TIRA LA RED, LA LEVANTA, LA VUELVE A TIRAR.',
    m4_radio8: 'GITANO: ¡PARA! ¿LA FLOTA INGLESA LE PASA POR ADELANTE A UNOS TIPOS QUE ESTAN PESCANDO?',
    m4_radio9: 'CONDOR: POR ADELANTE, POR ATRAS Y POR ARRIBA. HACE TRES SEMANAS.',
    m4_radio10: 'GITANO: …TRES SEMANAS AHI ADENTRO. ¿Y ESOS TIPOS QUE SON? ¿MARINA?',
    m4_radio11: 'CONDOR: UN OFICIAL A BORDO. EL RESTO, PESCADORES.',
    m4_radio12: 'VASCO: SIN NADA PARA TIRAR.',
    // EL COBRO (GUION_3 M5). Mismo tramo que m4, diecisiete dias despues: el jugador reconoce
    // hasta el ritmo de la radio. La perdida es MECANICA, no declarada — aca el HUD no marca las
    // unidades, y el jugador sabe exactamente por que. Nadie se lo explica.
    m5_radio1: 'CONDOR: PLATA FIEL, POSICIONES. ACTIVIDAD EN SAN CARLOS. VARIAS UNIDADES.',
    m5_radio2: 'GITANO: ¿VARIAS CUANTAS, CONDOR?',
    m5_radio3: 'CONDOR: VARIAS. NO TENGO NUMERO.',
    m5_radio4: 'GITANO: ¿COMO QUE NO TENES NUMERO? LA OTRA VEZ ME DISTE HASTA LA VELOCIDAD.',
    m5_radio5: 'GITANO: CONDOR. PREGUNTALE AL PESQUERO.',
    m5_radio6: '...',
    m5_radio7: 'GITANO: CONDOR. EL PESQUERO.',
    m5_radio8: 'CONDOR: HACE DOCE DIAS QUE NO TRANSMITE.',
    m5_radio9: 'GITANO: …COPIADO.',
    m5_radio10: 'PUMA: FORMACION CERRADA. ENTRAMOS.',
    m4_radio13: 'PUMA: NO SON MILITARES, GITANO. Y ESTAN MAS ADENTRO QUE NOSOTROS.',
    ch_nozone: 'ACA NO ENTRA NADIE, PATRIA.',
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
    hud_squad: 'ESCUADRON',
    obj_m: ' m',
    title: 'R A S A N T E', subtitle: 'Batalla por Malvinas · Atlantico Sur · 1982',
    tip1: 'Mas bajo = mas puntos. Rozar obstaculos da bonus.',
    tip2: 'El turbo duplica el puntaje y quema combustible.',
    tip3: 'Muy alto = te detecta el radar.',
    startPrompt: 'DESPEGAR',
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
    optInvY: 'EJE Y', optInvYNo: 'ARRIBA SUBE', optInvYYes: 'INVERTIDO',
    optSquad: 'ESCUADRON', optSquadSolo: 'SOLO',
    // MODELO DE VIDA / AVERIAS (core/damage.js)
    optDmg: 'DAÑO DEL AVION',
    optDmg_squad: 'ESCUADRON', optDmg_integ: 'INTEGRIDAD', optDmg_visual: 'INTEGRIDAD (VISUAL)',
    optRelevo: 'AL PERDER UN AVION',
    optRelevo_auto: 'SEGUN EL MODO', optRelevo_dmg: 'VUELVE AVERIADO', optRelevo_kill: 'DERRIBADO',
    optPasadaSlow: 'RALENTI DE LA PASADA',
    dmg_bar: 'AVION',
    dmg_ok: 'AVION SANO', dmg_hit: 'AVERIA LEVE',
    dmg_dmg: 'AVERIADO — SIN TURBO', dmg_crit: 'CRITICO — SOLO LO BASICO',
    optFuel: 'COMBUSTIBLE', optEnergy: 'ENERGIA',
    optEnemies: 'ENEMIGOS', optEnemiesOn: 'MOVILES', optEnemiesOff: 'QUIETOS',
    optSky: 'FONDO',
    optSkyDusk: 'ATARDECER', optSkyNight: 'NOCHE', optSkyStorm: 'TORMENTA',
    optSkyClear: 'DESPEJADO', optSkyCloudy: 'NUBLADO', optSkySun: 'SOL PLENO',
    optSkyMoon: 'LUNA LLENA', optSkyDawn: 'AMANECER',
    // AVISO DE LA OLA REBELDE (SPEC_AGUA_OLAS F7.2): lo grita un Fiel que la vio antes que vos.
    ola_call: 'PARED DE AGUA ADELANTE',
    optWater: 'AGUA', optWaterSea: 'MAR', optWaterViolet: 'VIOLETA',
    optWaterAuto: 'AUTO (segun el cielo)', optWaterStorm: 'TEMPORAL', optWaterNight: 'NOCHE',
    optWaterSun: 'TURQUESA', optWaterDawn: 'AMANECER',
    // LLUVIA: ambiente puro, no cambia la dificultad (ver render/rain.js)
    optNoteAgua3D: 'PRUEBA — con el agua 3D las olas esquivables NO se dibujan (siguen matando).',
    optAgua3D: 'AGUA 3D (PASILLO)', optAgua3D_2d: 'no', optAgua3D_3d: 'si',
    // LAS TRES CAPAS DEL 3D (P3/P6/P2). Van juntas y pegadas al agua 3D porque son la misma
    // pregunta: como se ve el mundo cuando lo pone three.
    optNote3D: 'PRUEBA — las tres capas valen en el climax Y en el pasillo. No tocan el juego.',
    optDuo3D: 'BUQUE CON EL CLIMA', optDuo3D_on: 'si', optDuo3D_off: 'no',
    optBruma3D: 'BRUMA EN CAPAS', optBruma3D_on: 'si', optBruma3D_off: 'no',
    optAves3D: 'BANDADAS', optAves3D_on: 'si', optAves3D_off: 'no',
    optBlur: 'DESENFOQUE DE TURBO', optBlurOn: 'si', optBlurOff: 'no',
    optRain: 'LLUVIA', optRainOff: 'NO', optRainDrizzle: 'GARUA', optRainRain: 'LLUVIA', optRainStorm: 'TORMENTA',
    // NIEBLA DE GUERRA: el velo de los COSTADOS (render/marco.js). Es preferencia, no dificultad
    // — no tapa nada que te pueda pegar. La otra NIEBLA, la de abajo, si.
    optMarco: 'NIEBLA DE GUERRA',
    optMarco_off: 'DESACTIVADO', optMarco_bruma: 'BRUMA', optMarco_focus: 'FOCUS',
    optZigzag: 'PASILLO EN ZIGZAG',
    optZigzag_0: 'RECTO', optZigzag_1: 'SUAVE', optZigzag_2: 'CALLEJON',
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
    // ---------- MEJORAS DEL PICHON: la sub-pantalla de todo lo que toca al AVION ----------
    // Dos bloques en la misma pantalla porque son dos cosas distintas: arriba lo que el Pichon le
    // hizo al avion (y por eso lleva su voz), abajo las preferencias de la persona que lo vuela.
    // Meter la mira del mouse bajo el nombre del Pichon lo pondria inventando cosas que no invento.
    // Despues de M9 el bloque de arriba cambia de nombre — es su libreta, no ya la dupla.
    optMejoras: 'MEJORAS DEL PICHON', optMejorasGo: 'VER',
    mejTitle: 'MEJORAS DEL PICHON',
    mejSecPiruetas: 'PIRUETAS DEL PICHON', mejSecPuesto: 'PUESTO DE PILOTO',
    mejOn: 'ACTIVA', mejOff: 'APAGADA',
    mejWhat: 'QUE HACE', mejHowto: 'COMO SE HACE',
    mejKeys: '[↑] [↓] ELEGIR      [←] [→] PRENDER / APAGAR      [ESC] VOLVER',
    // PUESTO DE PILOTO: una linea de que hace cada fila, y con que se toca. La tabla completa de
    // teclas sigue estando en OPCIONES — esto es el recordatorio de la fila que tenes marcada.
    mejdMoves: 'Interruptor maestro: apaga TODAS las piruetas de golpe', mejkMoves: 'secuencias de toques',
    mejdControl: 'Que hacen las flechas: empujar de costado o ROLAR',    mejkControl: '← →',
    mejdHorizon: 'Cuanto se inclina el MUNDO cuando el avion rola',      mejkHorizon: 'Q E  ·  stick der',
    mejdAim: 'La mira va fija adelante del avion o la lleva el mouse',   mejkAim: 'CAPS LOCK  ·  mouse',
    mejdMira: 'Cual de los nueve reticulos se dibuja',                   mejkMira: '—',
    mejdInvY: 'Si arriba sube o baja. Teclado y stick, en todos los modos',  mejkInvY: 'W · S · stick izq · △',
    mejdNet: 'La malla que marca la altura donde empieza el radar',      mejkNet: '—',
    mejdEnergy: 'Altura y velocidad se intercambian: picar acelera',     mejkEnergy: 'W  ·  S',
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
    ctrlBrake: 'FRENO',         ctrlBrakeK: 'F',                ctrlBrakeP: 'L2',
    ctrlTurn: 'VIRAJE DE COMBATE', ctrlTurnK: 'R',              ctrlTurnP: '◯',
    ctrlPips: 'REPARTO DE ENERGIA', ctrlPipsK: 'G',             ctrlPipsP: 'cruceta ARRIBA',
    ctrlRoll: 'ROLAR / GIRO 360°', ctrlRollK: '← →  ·  Q E',    ctrlRollP: 'stick der ← →',
    ctrlPan: 'MIRAR ARR / ABAJO', ctrlPanK: '↑ ↓  ·  R F',      ctrlPanP: 'stick der ↑ ↓',
    ctrlMoves: 'PIRUETAS',      ctrlMovesK: 'secuencias de toques', ctrlMovesP: 'los dos sticks',
    ctrlHands: 'zigzag: mano izq · rolidos: mano der', ctrlHandsK: '', ctrlHandsP: '',
    ctrlWasd: 'con MIRA MOVIL, las flechas vuelven a volar', ctrlWasdK: '', ctrlWasdP: '',
    // en la PASADA no hay controles nuevos: el boton del MISIL suelta la ristra de bombas
    ctrlArena: 'FRENO, VIRAJE y ENERGIA: solo en el climax', ctrlArenaK: '', ctrlArenaP: '',
    ctrlBombs: 'en la PASADA, el MISIL suelta las bombas', ctrlBombsK: '', ctrlBombsP: '',
    ctrlSame: 'esta tabla vale IGUAL en los cuatro modos', ctrlSameK: '', ctrlSameP: '',
    ctrlBoth: 'todo se juega con teclado O con joystick, sin excepcion', ctrlBothK: '', ctrlBothP: '',
    ctrlAim: 'MIRA fija/movil', ctrlAimK: 'CAPS LOCK · mouse',  ctrlAimP: 'siempre fija',
    ctrlCam: 'CAMARA (climax)', ctrlCamK: 'V',                  ctrlCamP: 'cruceta ABAJO',
    ctrlTempo: 'MOMENTUM (camara lenta)', ctrlTempoK: '4',      ctrlTempoP: 'SELECT',
    ctrlChancha: 'LA CHANCHA (reabastecer)', ctrlChanchaK: '5', ctrlChanchaP: 'cruceta ARRIBA',
    ctrlInv: 'INVERTIR EL EJE Y', ctrlInvK: 'OPCIONES: EJE Y',  ctrlInvP: '△',
    ctrlMusic: 'PISTA MUSICAL', ctrlMusicK: '1   ·   2',        ctrlMusicP: 'L3 · R3',
    ctrlPause: 'PAUSA',         ctrlPauseK: 'ESC',              ctrlPauseP: 'START',
    ctrlMenu: 'EN LOS MENUS',   ctrlMenuK: 'flechas · ENTER · ESC', ctrlMenuP: 'cruceta · ✕ · ◯',
    selKeys: '[ESC] ATRAS      [ENTER] SELECCIONAR',
    modeCampaign: 'HISTORIA', modeSurvival: 'POR LA PATRIA', modeCycle: 'CICLO DE MUERTE',
    modeCampaignDesc: 'Modo historia por niveles', modeSurvivalDesc: 'Puntaje infinito hasta morir',
    modeCycleDesc: 'Objetivos aleatorios, dificultad creciente',
    modeArena: 'MINUTOS SAGRADOS', modeArenaDesc: 'Batallas aleatorias',
    // JUEGO RAPIDO: la puerta a todo lo que se juega SIN guion. La lista de arriba tenia seis
    // filas y cuatro eran modos sueltos; ahora el menu principal ofrece una decision (historia o
    // partida suelta) y la eleccion del modo suelto vive un nivel adentro.
    // ATRAS: la salida de un submenu, VISIBLE. ESC y el boton B ya volvian, pero eso hay que saberlo
    menuBack: 'ATRAS', menuBackDesc: 'Volver al menu principal',
    modeQuick: 'JUEGO RAPIDO', modeQuickDesc: 'Partidas sueltas, sin guion',
    quickTitle: 'JUEGO RAPIDO',
    // MODO PRUEBAS (docs/proyecto/COMO_PROBAR.md §4): el catalogo de MOMENTOS. Los titulos de cada
    // momento NO estan aca — viven en data/pruebas.js, como los nombres de campaña, porque son
    // rotulos de una herramienta de autor. Aca esta el MARCO, que si es pantalla del juego.
    modePruebas: 'PRUEBAS', modePruebasDesc: 'El catalogo de momentos, sin jugar hasta llegar',
    pruebasTitle: 'PRUEBAS  ·  ELEGI UN MOMENTO',
    prBadge: 'PRUEBA',
    prSecClimax: 'LOS CLIMAX', prSecCola: 'LA COLA Y EL NUMERAL', prSecDestr: 'LA DESTRUCCION',
    prSecAgua: 'EL AGUA Y EL CLIMA', prSecPoder: 'LOS PODERES', prSecHistoria: 'LA HISTORIA',
    prSecCallejon: 'EL CALLEJON',
    // CINEMATICAS (docs/sistemas/PLAN_DIRECTOR_CINEMATICAS.md): la puerta hermana de PRUEBAS. Los
    // titulos de cada cinematica tampoco estan aca — viven con su timeline, en data/cines.js.
    modeCines: 'CINEMATICAS', modeCinesDesc: 'Reproducir una cinematica suelta, sin jugar hasta ella',
    modeManiobras: 'MANIOBRAS', modeManiobrasDesc: 'Cada pirueta del catalogo, en sus tres presentaciones',
    cinesTitle: 'CINEMATICAS  ·  ELEGI UNA',
    mvTitle: 'MANIOBRAS  ·  ELEGI UNA',
    mvVarsTitle: 'COMO LA QUERES VER',
    mvVarsBack: 'Volver a la lista de maniobras',
    cinBadge: 'CINEMATICA',
    // EL SELECTOR DE MISIONES (docs/proyecto/PLAN_MISIONES_FASES.md §1, fase S1). Los nombres y
    // las fechas de las misiones NO estan aca — viven en data/missions.js, que ya es su casa. Aca
    // esta el MARCO: el rotulo de la pantalla y el pie del toggle de historia.
    modeMisiones: 'MISIONES', modeMisionesDesc: 'Volar una mision suelta, sin campaña alrededor',
    misTitle: 'MISIONES  ·  ELEGI UNA Y VOLALA SUELTA',
    misClimaxNo: 'SOLO PASILLO',
    misLibreta: 'LIBRETA DEL PICHON  ·  {n}/{m} MEJORAS A ESTA ALTURA DE LA CAMPAÑA',
    misLibretaVacia: '(sin mejoras: el avion de fabrica, con el tonel clasico)',
    misModoLbl: '[H]',
    misModo_juego: 'MISION',
    misModo_cine: 'CINEMATICAS',
    misModo_ambas: 'CINE + MISION',
    misModo_radio: 'DIALOGOS EN VUELO',
    optRadioUI: 'RADIO EN VUELO', optRadioToast: 'TOAST (una linea)', optRadioPanel: 'PANEL (ultimas 4)',
    misRadioHud: 'DIALOGO {n}/{m}  ·  AL {p}% DE LA MISION  ·  TECLA: EL QUE SIGUE  ·  ESC: SALIR',
    modePasada: 'PASADAS MORTALES', modePasadaDesc: 'A ras, saltar, soltar y salir',
    modeHint: 'flechas: elegir   ENTER / TOCAR: confirmar',
    portLabel: 'PUERTO', bargeDown: 'BARCAZA DESTRUIDA', reached: 'alcanzados',
    continuePrompt: 'CONTINUAR',
    // el par de la caja de historia: ANTERIOR / SIGUIENTE. `continuePrompt` es otra cosa —
    // el 'apreta para seguir' de las pantallas de puntaje— y por eso son dos claves y no una.
    nextPrompt: 'SIGUIENTE',
    backPrompt: 'ANTERIOR',
    mom_title: 'M O M E N T U M', mom_hint: 'MANTENE LA MIRA EN LA ZONA Y DISPARA [X]',
    mom_pass: 'PASADA {n}/{m}', mom_clear: 'PASADA COMPLETA!', mom_next: 'PROXIMA PASADA >>',
    // ARENA: el asalto volado en 3D (climax con three.js; sin 3D rige el momentum clasico)
    arena_hint: 'MORRO [W]/[S] · ROLA Y VIRA [Q]/[E] · FRENO [F] · MEDIA VUELTA [R] · ENERGIA [G] · [X] FUEGO · [Z] PINTA Y SOLTA',
    arena_uturn: 'MEDIA VUELTA', arena_sweet: 'GIRO CORTO', arena_reload: 'PASADA LIMPIA  ·  +1 MISIL',
    // reparto de energia (S1): los nombres son cortos porque comparten renglon con el tablero
    arena_pip_eq: 'EQUILIBRADO', arena_pip_mot: 'MOTOR', arena_pip_arm: 'ARMAS',
    // el latido (E6): la ventana de castigo y el aviso de defensa cercana
    arena_open: '! AL DESCUBIERTO !', arena_bubble: 'DEFENSA CERCANA',
    arena_msl: '! MISIL !',
    arena_low: '! EL MAR — ARRIBA !',
    arena_sunk: 'BUQUE FUERA DE COMBATE!', arena_squad: 'ESCUADRON',
    arena_v1: 'CABINA', arena_v3: 'TERCERA PERSONA',
    // ---------- EL PULSO (el climax como prueba de destreza) ----------
    // Sin acentos ni Ñ: la fuente del juego no los tiene (regla del repo).
    pulso_ya: 'AHORA', pulso_soltar: 'SOLTAR',
    pulso_ok: 'BLANCO ALCANZADO',
    pulso_pasaste: 'TE PASASTE DE LARGO', pulso_otra: 'ENCARANDO DE NUEVO',
    pulso_fallo_err: 'SE TE FUE LA MANO', pulso_fallo_t: 'SE TE PASO EL TIEMPO',
    optMach: 'TRANSONICO', optMach_off: 'no', optMach_vapor: 'solo vapor', optMach_todo: 'vapor + cono',
    pulso_pasadas: 'PASADAS',
    pulso_elegi: 'ELEGI BLANCO',
    pulso_z_radar: 'RADAR', pulso_z_bridge: 'PUENTE', pulso_z_deposit: 'POLVORIN',
    pulso_why: 'Se te fue la pasada',
    // EL PREMIO (Q3): los sellos, como muere cada zona y como muere cada clase de buque
    pulso_s_limpio: 'SIN UN ERROR', pulso_s_rapido: 'MANO DE RELAMPAGO', pulso_s_bravo: 'ZONA BRAVA',
    pulso_m_ciego: 'SE QUEDO CIEGO', pulso_m_puente: 'EL PUENTE ARDE', pulso_m_polvorin: 'VOLO LA SANTABARBARA',
    pulso_c_t42: 'EL DESTRUCTOR SE VA DE POPA', pulso_c_t21: 'LA FRAGATA ESCORA A BABOR',
    pulso_c_log: 'LA CARGA ARDE DE PROA A POPA',
    res_pulso: 'EL PULSO',
    death_pulso: 'Se acabaron las pasadas',
    arena_out: '! FUERA DE LA ZONA DE COMBATE !', arena_auto: 'REENCARANDO AL BLANCO',
    // PASADA: el otro climax — a ras, saltar, soltar y salir (docs/sistemas/SPEC_MODO_PASADA.md).
    // El cartel de controles es el del arena MENOS lo que la pasada no tiene (media vuelta y
    // reparto de energia son sistemas del arena) y MAS lo suyo: la suelta.
    pasada_title: 'P A S A D A',
    pasada_hint: 'MORRO [W]/[S] · ROLA Y VIRA [Q]/[E] · FRENO [F] · [Z] SUELTA',
    pasada_run: 'CORRIDA',
    // LA VENTANA DE SUELTA: las tres bandas y sus dos desenlaces con nombre propio. "NO DESPERTO"
    // es historico y le da titulo a la m6 del guion.
    pasada_band_dormida: 'DORMIDA', pasada_band_dulce: 'ARMA', pasada_band_alta: 'ALTA',
    pasada_dud: 'NO DESPERTO', pasada_sapito: 'EL SAPITO!',
    pasada_rearm: 'RISTRA NUEVA',
    // RF-15: el veredicto de TU pasada. Son las tres unicas formas de terminarla sin hundir al
    // buque, y cada una tiene que decirse distinto — fallar, rozar y quedarse seco no son lo mismo.
    pasada_miss: 'FALLASTE', pasada_hit: 'TOCADO, NO ALCANZO', pasada_dry: 'SIN NAFTA',
    pasada_turn: 'TURNO DE {c}',
    pasada_tries: 'INTENTOS', pasada_fuel: 'NAFTA',
    pasada_why: 'Soltaste la ristra: una pasada, un avion',
    pasada_gate: 'PUERTA', pasada_reencare: 'R E - E N C A R E', pasada_axis: 'EN EL EJE!',
    pasada_turn_in: 'VIRA EN', pasada_turn_now: 'V I R A   Y A',
    // P3 — la defensa. El aviso es humano o es el mundo: nunca un icono de lock-on.
    pasada_dart: 'LANZAMIENTO!', pasada_break: 'QUEBRA, {c}!', pasada_break_ok: 'LO PERDISTE',
    pasada_dart_radio: '{c}: TE SALIO UNO, QUEBRA!',
    // P7 — la oleada. Todo lo que dice la escuadrilla es RADIO: nombre propio, voz de compañero.
    pasada_wave_in: '{c} ENTRANDO', pasada_wave_hit: '{c} LE DIO!',
    pasada_wave_miss: '{c} SE PASO LARGO', pasada_wave_hurt: '{c} TOCADO, SE VUELVE',
    pasada_re_lat: 'VOLVISTE POR ABAJO', pasada_re_chan: 'VOLVISTE POR ARRIBA — MAS NAFTA',
    // EL CONTADOR DE SUELTA. "SIN LINEA" no es un error: es que el rumbo no cruza el buque y la
    // bomba caeria al agua sueltes cuando sueltes. Decirlo es mas util que no decir nada.
    pasada_cue: 'SUELTA EN', pasada_now: 'A H O R A', pasada_noline: 'SIN LINEA',
    pasada_ship: 'BUQUE',
    mom_destroyed: '{z} DESTRUIDO',
    zone_aa: 'CANON AA', zone_radar: 'RADAR', zone_bridge: 'PUENTE',
    zone_engine: 'MOTOR', zone_deposit: 'DEPOSITO',
    // ---------- EL BANCO DEL PICHON (pantalla de mejora entre misiones) ----------
    upgTitle: 'EL BANCO DEL PICHON', upgTitleLib: 'LA LIBRETA DEL PICHON',
    upgRitual: '"ESO NO SE PUEDE."  ...  "A VER. MOSTRAME."',
    upgRitualLib: '"...A VER, PIBE. MOSTRAME."',
    upgSub: 'ELEGI UNA MEJORA', upgSub1: 'TU PRIMERA MEJORA', upgCombo: 'COMBO:',

    // ---------- EL PODER RASANTE (SPEC_PODER_RASANTE, tecla 6) ----------
    // LA RADIO ROTA (RF-05): la doctrina gritada. No es decoracion — es UNO de los cinco
    // elementos de identidad del §7, y el que dice de QUE escuadron es este poder.
    rasOn: 'RASANTE', rasOff: 'RASANTE — FIN', rasReady: '! RASANTE LISTO — [6] !',
    rasante_call_1: 'Pegado al agua el radar de ellos no te ve.',
    rasante_call_2: '¡Abajo, {n}, abajo!',
    rasante_call_3: 'Ahi va. Como el Pichon lo dibujo.',
    // LA LECCION DEL SAPITO: la primera activacion de cada perfil, una vez y nunca mas. Es el
    // prologo hecho poder — la frase con la que el juego explico por que se vuela abajo.
    rasLeccion: 'La piedra no se hunde si va rapido y pegada al agua.',
    ras_no_chancha: 'La canasta esta arriba. Primero solta el ras.',
    ras_no_cita: 'Ahora no, {n}: tenes la manguera puesta.',
    upgHint1: 'ENTER / TOCAR: guardarla en la libreta',

    // ---------- HISTORIA (campaña v0.0.1, GUION_2.md) ----------
    // Cada objeto es UNA pantalla. {title,paras} = cinematica; {level,obj} = tarjeta previa
    // al nivel. `img` es el cuadro del storyboard (assets/story/<img>.png, TODAVIA no
    // generado: el texto ya asume ese fondo). `style`: 'tierra' = cuaderno de Mateo,
    // 'carta' = block del padre. Dialogo como 'PERSONAJE: linea' (los IDs por linea de
    // SISTEMA_DIALOGO.md llegan con la pasada de voces).
    // APERTURA HISTORICA — reservada para la CAMPAÑA 2 (EL FANTASMA DEL MAR, data/campaigns.js).
    // Eran las cuatro primeras pantallas de storyM1 y abrian EL CUADERNO DE MATEO con una clase de
    // historia: esa campaña arranca donde arranca su historia (el arroyo, el padre y el hijo), no
    // en 1833. El relato de contexto entra donde SI hace falta — la campaña de la flota.
    storyC2Intro: [
      {
        img: 'INTRO_1', title: 'MALVINAS · 1982', paras: [
          'Desde 1833, la República Argentina mantiene un reclamo de soberanía sobre las Islas Malvinas.',
          'Durante casi ciento cincuenta años, ese reclamo continuó por vías diplomáticas.',
          'Pero en 1982, la historia cambiaría para siempre.']
      },
      {
        img: 'INTRO_2', title: 'ARGENTINA · MARZO DE 1982', paras: [
          'Argentina atravesaba uno de los momentos más difíciles de su historia.',
          'El país era gobernado por una dictadura militar encabezada por el teniente general Leopoldo Fortunato Galtieri.']
      },
      {
        img: 'INTRO_3', title: 'LA DECISIÓN', paras: [
          'En medio de una profunda crisis política, económica y social, la Junta Militar tomó una decisión que marcaría el destino de miles de argentinos.',
          'Recuperar las Islas Malvinas mediante una operación militar.']
      },
      {
        img: 'INTRO_4', title: 'OPERACIÓN ROSARIO · 2 DE ABRIL', paras: [
          'La Operación Rosario logró recuperar el control de las islas.',
          'Durante unas horas, gran parte del pueblo argentino creyó que el conflicto había terminado.',
          'No sería así: el Reino Unido respondió enviando una de las mayores flotas de guerra movilizadas desde la Segunda Guerra Mundial.']
      },
    ],
    storyM1: [
      {
        img: 'P1_2', title: 'AÑOS ANTES · UN ARROYO', paras: [
          'ESTEBAN: ¿Ves? Sapito. La piedra no se hunde si va rápido y pegada al agua. Con los aviones es igual: abajo de todo, rapidito, donde nadie te espera. Los valientes vuelan abajo, Mateo.',
          'MATEO: ¿Y no se caen?',
          'ESTEBAN: Se caen los que le tienen miedo a la tierra. Vos nunca le tengas miedo a la tierra.']
      },
      {
        img: 'P2_3', title: 'LA COCINA · MARZO DE 1982', paras: [
          'MATEO: Tres meses, pá. Hago la colimba, marcho un poco, y el año que viene estoy de vuelta arreglándote el Rastrojero.',
          'RADIO: ...tropas argentinas desembarcaron esta madrugada en las Islas Malvinas...',
          'La pava empieza a chiflar y nadie la saca del fuego.']
      },
      {
        img: 'P3_4', title: 'LO QUE UN PADRE PUEDE', paras: [
          'ESTEBAN: Moví todo. Llamé a todos. Un padre con galones cree que puede. No pude.',
          'CÓNDOR: Aldao. Su hijo ya está embarcado. Está en las islas. Lo siento.',
          'Le quedaba una sola manera de estar cerca: el cielo.']
      },
      {
        img: 'P4_1', style: 'tierra', title: 'EL CUADERNO DE MATEO', paras: [
          'Viejo: llegamos. Hace un frío que no tiene nombre: un frío que te entra por los huesos y se queda a vivir.',
          'Me traje el cuaderno y la birome. Los dibujos no te los mando: te los guardo. Cuando vuelva te los muestro de una y no te tengo que contar nada.',
          'Me acuerdo lo que me enseñaste del sapito. Yo acá estoy bien abajo, pegadito a la tierra. No me puedo caer más.',
          'Decile a mamá que llegamos bien y que hace menos frío del que dicen. Vos sabés por qué te lo pido. Mateo.']
      },
      {
        img: 'M1_3', title: 'RÍO GALLEGOS · LA LÍNEA DE VUELO', paras: [
          'PUMA: Bienvenido a la Plata, Tero. Regla número uno: pegado al agua el radar de ellos no te ve. Volás tan bajo que volvés con sal en las alas. Regla número dos: no hay. Con la uno alcanza.',
          'GITANO: Regla dos: el mate lo cebo yo. Regla tres: si no volvés, te lo cebo igual, pero solo. Y cebar solo es tristísimo, así que volvé.',
          'VASCO: (bajito) Siempre hacen chistes. Es la manera que tienen de rezar.']
      },
      {
        img: 'M1_5B', title: 'LA CASADA', paras: [
          'GITANO: Andá, mirala, Pichón. Está pegada adentro del locker. Esa mujer no es de nadie que esté solo: tiene dueño, y el dueño tiene charreteras.',
          'PICHÓN: ...Es hermosa.',
          'El Vasco se persigna, sube la escalerilla y no contesta. Nunca desmiente nada.',
          'CÓNDOR: Escuadrilla CAUQUÉN, autorizada pista dos. Buen vuelo.']
      },
      { level: 'CON SAL EN LAS ALAS', obj: 'Objetivo: dominar el vuelo rasante · Mar abierto' },
    ],
    epiM1: [
      {
        img: 'M1_7', title: 'TODOS VUELVEN', paras: [
          'Cinco estrellitas nuevas, una por avión. El Turco las pinta con pincel finito y la lengua afuera. No cuenta lo que baja: cuenta lo que vuelve.',
          'EL TURCO: La estrellita la pinto por vos, no por el avión.',
          'Por un rato, esto parece una aventura.']
      },
      {
        img: 'M1_9', style: 'tierra', title: 'CARTA DE MATEO', paras: [
          'Viejo: hoy conocí a un tipo, el cabo Correa. Correntino. Le dicen el Colorado. Me vio tiritando y me tiró una media de lana sin decir nada, como quien no quiere la cosa.',
          'No sé por qué, pero con él cerca tengo menos miedo. ¿Vos lo mandaste, no? No me mientas que te conozco, viejo. Gracias.',
          'Lo dibujé con capa, como un superhéroe. Te lo guardo para cuando vuelva. Te vas a reír. Mateo.']
      },
    ],
    storyM2: [
      {
        img: 'M2_1', title: 'LA BRECHA', paras: [
          'Ellos tienen misiles que piensan solos, radares que ven de noche, Sea Harriers de última generación. Los Fieles tienen aviones con más horas que un colectivo del interior, bombas de otra década y coraje.',
          'PUMA: Ellos tienen la máquina. Nosotros tenemos las manos. Vamos a volar tan bajo que la máquina no va a poder creer que alguien esté tan loco. Esa incredulidad es toda nuestra ventaja.',
          'ESTEBAN: ¿Y alcanza?',
          'PUMA: No. Pero es lo que hay, y lo que hay lo volamos con todo.']
      },
      { level: 'EL BAUTISMO DE FUEGO', obj: '1 de mayo de 1982 · Costa' },
    ],
    epiM2: [
      {
        img: 'M2_5', title: 'RASPADOS', paras: [
          'Vuelven todos, pero raspados. El Pichón aterriza con el avión agujereado y las manos temblándole.',
          'El Turco lo abraza sin decir nada y se pasa la noche remendando chapa a la luz de un farol. A la mañana, el avión tiene los agujeros parchados y una estrellita nueva.',
          'EL TURCO: ¿Ves? Esa no es del avión. Es tuya.']
      },
      {
        img: 'M2_8', style: 'tierra', title: 'CARTA DE MATEO', paras: [
          'Pá: hoy comimos una vez. Una. La comida está, pero no llega a nosotros. Hay un subteniente, Bordón, que tiene la carpa llena de cajas. Nosotros afuera, las cajas adentro.',
          'Igual te cuento una linda: como prohibieron la música en inglés, la radio pasa rock nacional todo el día. Los pibes cantaban en el pozo, pá. Cantábamos para no llorar y al final era lo mismo, pero cantado.',
          'A mamá contale que comemos bien. Que hay guiso, que hay pan. Contale eso, viejo, aunque sea mentira. Nosotros dos aguantamos la verdad. Mateo.']
      },
    ],
    storyM3: [
      {
        img: 'M3_1', title: '4 DE MAYO', paras: [
          'El día que el mundo se enteró de que la flota más poderosa podía sangrar: un misil argentino alcanza a un destructor británico.',
          'GITANO: ¡Le dimos! ¡A la Royal Navy le dimos, muchachos! ¡Argentina, carajo!',
          'PUMA: Veinte marinos, Gitano. Del otro lado hay pibes iguales a nosotros que hoy no vuelven. Alegrate de que nosotros sí. Y callate un minuto por los que no.']
      },
      {
        img: 'M3_2', title: 'LA GAMBETA', paras: [
          'GITANO: (después del minuto, casi para sí) Algún día se la vamos a ganar en algo que no mate a nadie. Un pibe nuestro va a agarrar una pelota y los va a gambetear a todos. A TODOS, Puma. Y ese día va a ser más grande que éste.',
          'PUMA: Ojalá la única guerra que nos quede sea esa.',
          'Orden de misión: ataque rasante a la escolta. Hoy sienten miedo ellos.']
      },
      { level: 'EL DÍA QUE SANGRÓ EL MAR', obj: '4 de mayo de 1982 · HMS SHEFFIELD' },
    ],
    epiM3: [
      {
        img: 'M3_6', title: 'PRIMERA GRAN VICTORIA', paras: [
          'En la base hay abrazos, alguien descorcha algo. En la radio quedó grabado el pánico inglés: "Low level! Low level! Here they come again!"',
          'Puma se aparta y se queda mirando el mar, sin sonreír. Cuando Puma no sonríe, hay que preocuparse.']
      },
      {
        img: 'M3_8', style: 'tierra', title: 'CARTA DE MATEO', paras: [
          '¡Viejo! Llegó la noticia del Sheffield y por primera vez vi a los pibes levantar la cabeza. El Colorado me apretó el hombro: "tu viejo anda ahí arriba, pibe. Seguro anda por ahí".',
          '¿Eras vos? No me contestes. Prefiero creer que sí.',
          'Y te cuento algo que no te dije en la despedida: cuando salga de acá me anoto en la escuela de aviación, pá. Quiero volar con vos. Quiero que un día la escuadrilla sea "Aldao y Aldao".',
          'Cuidate mucho. Volá bajo, como me enseñaste. Yo te espero acá, pegadito a la tierra. Mateo.']
      },
      {
        img: 'M3_HIST', title: 'HMS SHEFFIELD · 4 MAYO 1982', paras: [
          'Un Super Etendard de la Armada Argentina lanzó un misil Exocet que impactó el casco del destructor.',
          'Murieron 20 tripulantes. El fuego obligó a abandonar el buque.',
          'Fue el primer buque de guerra británico perdido en acción desde la Segunda Guerra Mundial.']
      },
    ],
    storyM4: [
      {
        img: 'M4_1', title: 'SAN CARLOS', paras: [
          'Los británicos desembarcan. El estrecho se vuelve una trampa de fuego antiaéreo que los propios pilotos bautizan, con humor de velorio, el Callejón de las Bombas. Hay que entrar ahí. Todos los días.',
          'PUMA: Es la boca del lobo. Entramos, soltamos, salimos. Nadie se hace el héroe: los héroes no llegan a cebar el mate de la tarde.']
      },
      {
        img: 'M4_2', title: 'POR EL HIJO DE ALGUIEN', paras: [
          'ESTEBAN: Puma. Mi hijo está en tierra. Cerca de acá.',
          'PUMA: Lo sé, Tero. Todos tenemos a alguien abajo. Cada barco que tocamos es una bomba menos cayéndole a los pibes. Volás por tu hijo. Volamos todos por el hijo de alguien.',
          'GITANO: ¿Vieron que hicieron un festival allá en Buenos Aires? Juntaron montañas de cosas para los pibes. Chocolates, cigarrillos, abrigo... Y nada. Eso digo. Juntaron.']
      },
      { level: 'EL CALLEJÓN DE LAS BOMBAS', obj: '21 de mayo de 1982 · HMS ARDENT' },
    ],
    epiM4: [
      {
        img: 'M4_EPI', title: 'EL PRECIO', paras: [
          'El Ardent arde. Victoria. Pero el avión del Vasco vuelve rozando el mar, con el tren de aterrizaje colgando como una pata quebrada. Toca pista de milagro.',
          'Esa noche nadie hace chistes. El Turco no pinta la estrellita del Vasco hasta el otro día, porque le temblaba el pulso.']
      },
      {
        img: 'M4_CARTA', style: 'tierra', title: 'CARTA DE MATEO', paras: [
          'Pá: hoy vi caer un avión nuestro a lo lejos. Recé para que no fueras vos y después me sentí una basura, porque el que cayó también era el hijo de alguien.',
          'Bordón hizo estaquear a dos pibes por "robar" comida. La comida era nuestra, pá. Los ató al descampado con este frío. Uno era el jujeño de la radio.',
          '¿Esto es la guerra o es otra cosa? Contra los ingleses todavía no disparé un tiro, pero contra el frío, el hambre y Bordón peleamos todos los días. Mateo.']
      },
      {
        img: 'M4_HIST', title: 'HMS ARDENT · 21 MAYO 1982', paras: [
          'La fragata fue atacada en oleadas sucesivas mientras cubría el desembarco en San Carlos.',
          'Murieron 22 tripulantes. Se hundió al día siguiente.',
          'Su comandante fue el último en abandonarla.']
      },
    ],
    storyM5: [
      {
        img: 'M5_1', title: 'LAS BOMBAS QUE NO DESPIERTAN', paras: [
          'Muchas bombas argentinas no explotan: se lanzan TAN bajo que no llegan a armarse en el aire. La espoleta necesita caída, y los pilotos no pueden dársela sin regalarse.',
          'GITANO: A ver si entendí. ¿Le pego, le pego BIEN, en el medio del casco... y no explota?',
          'PUMA: Para que arme, tenés que soltarla más alto. Y si soltás más alto, te bajan a vos.',
          'ESTEBAN: (mirando la bomba bajo el ala) Es como el sapito. La piedra va tan pegada al agua que no se hunde. El problema es que nosotros necesitamos que se hunda.']
      },
      {
        img: 'M5_2', title: 'EL CHISTE DE SIEMPRE', paras: [
          'GITANO: Entonces elijo pegarle y volver a cebar el mate. Que la bomba haga lo que pueda. Y si no vuelvo, Vasco, le avisás vos a tu casada, que con el coronel ya tiene práctica en dar malas noticias.',
          'VASCO: ...Callate, cordobés. (pero casi se ríe. Casi.)']
      },
      { level: 'LA BOMBA QUE NO DESPERTÓ', obj: '23 de mayo de 1982 · HMS ANTELOPE' },
    ],
    epiM5: [
      {
        img: 'M5_EPI', title: 'EL DE ALLÁ TAMBIÉN', paras: [
          'El Antelope explota de noche: una bomba dormida despierta mientras un artificiero británico intentaba desactivarla para salvar a su barco.',
          'Del otro lado, un hombre murió tratando de salvar a los suyos. Coraje inglés. El mismo coraje.',
          'VASCO: (mirando el resplandor lejano) Que Dios lo tenga. Al de allá también.']
      },
      {
        img: 'M5_CHANCHA', title: 'LA CHANCHA', paras: [
          'En el regreso, a Gitano no le cierra la cuenta de combustible. Viento de frente, tanque picado, la aguja bajando.',
          'GITANO: (por primera vez sin humor) Muchachos... no me da. No me da la nafta.',
          'Y de la nada, gorda, lenta, hermosa, aparece la Chancha: el Hércules reabastecedor que se mete donde no debe para darle de comer a un caza moribundo.',
          'LA CHANCHA: Tranquilo, cordobés. La Chancha no abandona a nadie. Tomá, servite.',
          'GITANO: (la voz quebrada) Te amo, gorda. Cuando volvamos te pinto entera de dorado.']
      },
      {
        img: 'M5_CARTA', style: 'tierra', title: 'CARTA DE MATEO', paras: [
          'Viejo: ¿te acordás del festival para juntar cosas para nosotros? Acá no llegó ni un chocolate. Llegó una revista vieja que decía "Estamos ganando". La usamos para taparnos del viento.',
          'El Colorado me mostró la foto de la hermana, toda gastada de tanto mirarla. "Cuando salgamos de ésta te la presento", me dijo. Me reí, pá. Hacía diez días que no me reía.',
          'Le pedí que cuando termine esto venga a casa. Asado en el fondo, vos contando mentiras de aviador, él contando mentiras de pescador. Tengo un amigo, pá. En el peor lugar del mundo, tengo un amigo. Mateo.']
      },
      {
        img: 'M5_HIST', title: 'HMS ANTELOPE · 23 MAYO 1982', paras: [
          'Dos bombas impactaron la fragata, pero no detonaron.',
          'Al intentar desactivar una, la bomba estalló. Murió el artificiero James Prescott.',
          'El incendio llegó a la santabárbara y el buque se partió en dos. Su silueta ardiendo se volvió una de las imágenes del conflicto.']
      },
    ],
    storyM6: [
      {
        img: 'M6_1', title: 'FIESTA PATRIA', paras: [
          'En la base alguien consiguió facturas, Dios sabe cómo, y el Turco preparó chocolate caliente en un tacho de aceite lavado. Hoy un barco cae de regalo para un país que allá lejos ni sabe sus nombres.',
          'PUMA: Hoy es 25, muchachos. Hoy le dedicamos uno a la Patria.',
          'GITANO: A la Patria patria, ¿eh? La de los pibes y las facturas. No a la de los despachos, que esos se consigan su propio barco.']
      },
      {
        img: 'M6_2', title: 'EL VASCO HABLA', paras: [
          'El Vasco habla más que en las cinco misiones anteriores juntas. Del chocolate, del frío, de una anécdota de la escuela de aviación que nadie le pidió.',
          'GITANO: (sorprendido) Vasco. ¿Vos estás bien?',
          'VASCO: (se queda pensando la respuesta demasiado tiempo) ...Sí. Vamos, que el chocolate se enfría.',
          'Nadie le da importancia.']
      },
      { level: 'PASTELITOS', obj: '25 de mayo de 1982 · HMS COVENTRY' },
    ],
    epiM6: [
      {
        img: 'M6_EPI', title: 'LA SALIDA DEL BLANCO', paras: [
          'El Coventry cae. En la salida, un Sea Harrier engancha al Vasco. Lo tenés al lado. Lo ves. No podés hacer nada.',
          'GITANO: ¡Vasco! ¡Eyectate! ¡SALTÁ, VASCO, SALTÁ!',
          'Un ruido corto, ni una palabra: el sonido de alguien que va a decir algo y no llega. Estática.',
          'PUMA: (después de mucho, la voz quebrada) Plata Fiel... a casa. Volvemos a casa.']
      },
      {
        img: 'M6_LOCKER1', title: 'EL LOCKER', paras: [
          'Esa noche el Turco junta las cosas del Vasco en una caja de cartón, solo, sin que nadie se lo pida. En la puerta del locker, la foto de siempre: la que vieron cien veces.',
          'GITANO: (con una ternura triste) La casada... Turco, dejámela ver una última vez.',
          'El Turco la despega con un cuidado de cirujano. Y al ir a envolverla en el pañuelo, la da vuelta. Seis misiones de chistes y nadie, nunca, había hecho ese gesto.']
      },
      {
        img: 'M6_LOCKER2', title: 'EL DORSO', paras: [
          'Rosa Elena Arrieta. 1926 – 1961. "Te amo, mamá. Perdoname."',
          'PUMA: (bajo, casi para sí) Sesenta y uno.',
          'ESTEBAN: El Vasco tenía quince años.',
          'GITANO: (la voz rota) Toda la guerra lo cargamos con la casada. Y estaba muerta. Y el tipo nunca dijo nada. Nos dejó reír. Nos regaló el chiste para que tuviéramos de qué reírnos.',
          'EL TURCO: (guardándola en el bolsillo del mameluco) Me la quedo yo hasta que vuelva a su casa. Señora: su hijo fue el mejor de todos nosotros.']
      },
      {
        img: 'M6_CARTA', style: 'tierra', title: 'CARTA DE MATEO', paras: [
          'Pá: perdí a alguien hoy. Ramírez, el jujeño de la radio. Dieciocho, como yo. Estábamos hablando de qué íbamos a comer primero al volver y en la mitad de la palabra "tamales" dejó de estar. Así de rápido, pá. Así de nada.',
          'El Colorado me dijo "llorá todo hoy, pibe, que mañana no va a haber tiempo". Lloré todo, viejo.',
          '¿Vos también perdés gente ahí arriba? ¿Cómo se hace? Contame cómo se hace, porque yo no sé. Mateo.']
      },
      {
        img: 'M6_PADRE', style: 'carta', title: 'LA CARTA DEL PADRE · I', paras: [
          'Hijo: me preguntaste cómo se hace cuando se te muere alguien al lado. Estuve seis horas pensando la respuesta y todavía no la tengo.',
          'Hoy perdí a un amigo. Se llamaba Iñaki y resulta que la foto que llevaba era de la madre.',
          'La verdad es que no se hace nada. No hay truco. Uno se sube al avión al otro día porque...',
          '(Tacha la última línea entera. Dobla la hoja en cuatro sin terminarla y se la guarda en el bolsillo del pecho. Apaga la luz.)']
      },
      {
        img: 'M6_HIST', title: 'HMS COVENTRY · 25 MAYO 1982', paras: [
          'A-4 Skyhawk de la Fuerza Aérea Argentina atacaron volando tan bajo que el radar no lograba separarlos de la costa.',
          'Tres bombas impactaron sobre la línea de flotación. Murieron 19 tripulantes.',
          'El destructor volcó y se hundió en menos de veinte minutos.']
      },
    ],
    storyM7: [
      {
        img: 'M7_1', title: 'EL DUELO NO ESPERA', paras: [
          'La escuadrilla está de duelo, pero la guerra no espera a que termines de llorar. El Atlantic Conveyor trae los helicópteros pesados que le cambian la logística a los británicos. Hundirlo es obligarlos a cruzar las islas a pie.',
          'PUMA: Por el Vasco. Sin gritos, sin euforia. Lo hacemos y volvemos. Todos. ¿Me oyeron? Todos.']
      },
      {
        img: 'M7_2', title: 'TREINTA SEGUNDOS', paras: [
          'ESTEBAN: Puma... la vuelta pasa cerca de los montes. Del monte de Mateo.',
          'PUMA: (lo mira largo; sabe exactamente lo que le está pidiendo) ...Tenés treinta segundos de desvío y ni uno más. Y si me preguntan, yo no vi nada.',
          'GITANO: Nadie vio nada. Andá a saludar al pibe, Tero.']
      },
      { level: 'EL BATIR DE LAS ALAS', obj: '25 de mayo de 1982 · ATLANTIC CONVEYOR' },
    ],
    epiM7: [
      {
        img: 'M7_SOBREVUELO', title: 'EL SOBREVUELO', paras: [
          'En el regreso, Esteban se descuelga de la formación. Baja. Baja más. El monte de Mateo aparece adelante: pozos, casquitos, barro.',
          'Cruza el monte a altura de árbol, tan bajo que los pibes sienten el trueno en el pecho, y bate las alas: una a la izquierda, una a la derecha. El saludo más viejo de la aviación. Te veo. Estoy acá.',
          'Decenas de casquitos mirando para arriba, brazos en alto, gorros revoleados. Y un pibe flaco, parado sobre el borde del pozo, agitando un cuaderno contra el cielo.',
          'PUMA: (radio, suave) Vamos, Tero. Vamos a casa.']
      },
      {
        img: 'M7_CARTA', style: 'tierra', title: 'LA CARTA DEL CIELO', paras: [
          '¡¡PÁ!! TE VI. Hoy pasó un Skyhawk tan bajo que la turba tembló, y batió las alas, UNA A CADA LADO, y yo GRITÉ, pá, grité tu nombre delante de todos y no me importó nada.',
          'Los pibes saltaban y me abrazaban a mí, "¡es el viejo del flaco!", y por un minuto entero acá abajo NADIE tuvo frío.',
          'Hoy dibujé la mejor página del cuaderno: el monte entero desde arriba, como lo habrás visto vos, y todos nosotros chiquitos saludando. Ésta te la doy en la mano cuando vuelvas.',
          'Volá bajo. TE VI. Mateo.']
      },
      {
        img: 'M7_HIST', title: 'ATLANTIC CONVEYOR · 25 MAYO 1982', paras: [
          'El carguero fue alcanzado por misiles Exocet lanzados desde Super Etendard.',
          'Murieron 12 hombres, entre ellos su capitán, Ian North, que murió ayudando a evacuar a su tripulación.',
          'Con él se perdieron los helicópteros pesados Chinook. Sin ese transporte, la infantería británica cruzó la isla a pie.']
      },
    ],
    storyM8: [
      {
        img: 'M8_1', title: 'LA MURALLA', paras: [
          'El corazón del desembarco británico: la misión más defendida de la guerra, una muralla de fuego continua. Puma no quiere llevar al Pichón, pero necesitan todos los aviones.',
          'PUMA: Pichón, vos pegado a mí. No te separás ni para respirar.',
          'PICHÓN: Capitán... ¿usted cree que sirvió de algo? Todo esto. ¿Vamos a ganar?']
      },
      {
        img: 'M8_2', title: 'POR EL PIBE', paras: [
          'PUMA: (honesto, porque el pibe merece la verdad) No sé, Pichón. Pero sirvió. Cada vez que entramos, allá abajo hay un pibe que respira un día más. Para eso sirve. No para la bandera del mástil: para el pibe. Siempre fue por el pibe.',
          'ESTEBAN: (pensando en un cuaderno agitándose contra el cielo) ...por el pibe.']
      },
      { level: 'EL PIBE', obj: 'Cruzar el fuego de San Carlos · Centro logístico' },
    ],
    epiM8: [
      {
        img: 'M8_EPI', title: 'LA BISAGRA', paras: [
          'A la salida, con el blanco ya atrás, un misil que venía para Esteban pierde su firma, gira... y engancha al Pichón, que venía justo detrás, cubriéndole la cola.',
          'PICHÓN: (sorprendido, casi un nene) ...ah. Me dieron. ¿Capitán? Me dieron. No quiero... todavía no quiero—',
          'Estática. El mar.',
          'GITANO: ¡Era un pibe, Puma! ¡Lo trajimos a la guerra y era un PIBE!',
          'ESTEBAN: Venía para mí. Ese fierro venía para mí y se lo comió él.']
      },
      {
        img: 'M8_LIBRETA', title: 'LA LIBRETA', paras: [
          'Esa noche el Turco junta las cosas del Pichón. Debajo del catre, una libreta de tapas de hule: hojas cuadriculadas llenas de flechitas, cortes de fuselaje, cálculos al margen, aviones imposibles.',
          'Página tras página de ideas que nadie va a escuchar en el "eso no se puede / a ver, mostrame". La guarda en el bolsillo del mameluco. El otro bolsillo.',
          'EL TURCO: (a la libreta, bajito) ...Vos y yo tenemos trabajo, pibe.']
      },
      {
        img: 'M8_CARTA', style: 'tierra', title: 'CARTA DE MATEO · CLARIBEL', paras: [
          'Pá: repartieron cartas de escuelas, "para un soldado argentino", de pibes que no nos conocen. A mí me tocó la de una nena de nueve años, Claribel, de Villa Mercedes, San Luis.',
          'Me dice: "Querido soldado: no te conozco pero te quiero. Mi seño dice que estás cuidando algo nuestro. Cuidate vos también. Cuando seas viejito contame cómo era el mar de ahí."',
          'Lloré como un tonto, pá. Una nena que no me conoce me pidió que llegue a viejo. Le voy a contestar que sí. Es la única orden que pienso cumplir a rajatabla.',
          'Tengo miedo, te lo digo por primera vez. Pero si pasa algo, quiero que sepas que no te guardo nada. Sé que moviste todo. Un padre no puede más que todo. Mateo.']
      },
      {
        img: 'M8_PADRE', style: 'carta', title: 'LA CARTA DEL PADRE · II', paras: [
          'Hijo: te escribo de nuevo porque la primera no me salió. Hoy se me murió otro. Tomás, veintidós años, le decíamos Pichón. Se comió un fierro que venía para mí.',
          'Decís que un padre no puede más que todo. Yo no hice todo, Mateo. Hice lo que me animé.',
          'Vos me pediste que te mienta, que te diga que desde arriba es lindo. Y yo agarré el papel para mentirte, te juro. Pero si te miento con esto, ¿para qué carajo sirve que sea tu padre.',
          '(Sin signo de pregunta. La frase se corta ahí. Dobla la hoja.)']
      },
    ],
    storyM9: [
      {
        img: 'M9_1', title: 'TRES DONDE HUBO CINCO', paras: [
          'PUMA: Pegados, muchachos. Por el Vasco. Por el Pichón. Hoy volvemos todos. TODOS.',
          'Silencio en la radio. Gitano tiene el mate en la mano y no lo ceba: se le enfría entero durante todo el briefing y nadie se lo dice.',
          'ESTEBAN: Puma. ¿Se te fue alguna vez esto de acá? (se toca el pecho)',
          'PUMA: (como quien informa el clima) No. Se te suma otro y otro y otro, y un día te das cuenta de que ya no te entra más, y seguís volando igual. Eso es todo el secreto, Tero. No hay más secreto que ese.']
      },
      { level: 'LO QUE NO SE DICE', obj: '8 de junio de 1982 · RFA SIR GALAHAD' },
    ],
    epiM9: [
      {
        img: 'M9_EPI', title: 'VUELVEN LOS TRES', paras: [
          'Cumplís. Volvés. Vuelven los tres. Una victoria limpia justo cuando ya no confiabas en ninguna.',
          'El Turco pinta tres estrellitas. Al terminar se queda quieto un segundo y se toca el bolsillo del mameluco — ese gesto que viene haciendo desde la noche del Vasco y que nadie le pregunta.']
      },
      {
        img: 'M9_CARTA', style: 'tierra', title: 'CARTA DE MATEO', paras: [
          'Viejo: nos mueven a los montes que rodean Puerto Argentino. Dicen que los ingleses vienen por tierra. El Colorado no se me despega: "vos y yo salimos juntos de acá, correntino de adopción".',
          'Anoche me contó todo el plan: llegamos, comemos un asado en tu casa, después nos tomamos el micro a Corrientes y me presenta a la hermana. Lo tiene pensado hasta el detalle del micro, pá.',
          'Qué manía la de este tipo de planear cosas lindas en el peor lugar del mundo.',
          'A mamá seguile diciendo que comemos bien. Yo sé que lo hacés. Gracias. Mateo.']
      },
      {
        img: 'M9_HIST', title: 'RFA SIR GALAHAD · 8 JUNIO 1982', paras: [
          'Skyhawks argentinos atacaron el buque logístico fondeado en Bahía Agradable, cargado de tropa.',
          'Murieron 48 personas entre tripulantes y soldados. Fue la mayor pérdida de vidas británicas en una sola acción durante el conflicto.',
          'El casco fue hundido mar afuera y declarado cementerio de guerra.']
      },
    ],
    storyM10: [
      {
        img: 'M10_1', title: 'SEGUNDA SALIDA', paras: [
          'Misma tarde. El segundo buque de Fitzroy. Briefing de treinta segundos: ya no hay nada que decir que no se haya dicho.',
          'PUMA: Otra vez. Ahora.',
          'Nada más. Se suben.']
      },
      { level: 'ÁNGEL DE CORRIENTES', obj: '8 de junio de 1982 · RFA SIR TRISTRAM' },
    ],
    epiM10: [
      {
        img: 'M10_TIERRA', title: 'EN EL MONTE, MIENTRAS VOLABAS', paras: [
          'El monte. Bombardeo naval. Mateo y Correa en el mismo pozo. Un silbido que crece.',
          'CORREA: ¡Abajo, correntino! ¡ABAJO!',
          'Correa empuja a Mateo al fondo del pozo y le pone el cuerpo encima. Blanco. Humo. Tierra que llueve. Mateo abajo, entero. Correa arriba, no.',
          'CORREA: (apenas, buscándole la mano) ...andá a Corrientes igual, pibe. Presentate solo. Decile a mi hermana que su hermano cuidó a un pibe hasta el final. Que no fue en vano. Que no fue...']
      },
      {
        img: 'M10_PISTA', title: 'SIN CARTA', paras: [
          'Esteban vuelve sin saber nada. En la pista pregunta si hay carta. No hay. Es la primera vez que no hay.',
          'Vos sí sabés por qué. Y no podés avisarle.']
      },
      {
        img: 'M10_CARTA', style: 'tierra', title: 'LA QUE CASI NO PUEDE ESCRIBIR', paras: [
          'Viejo: se me murió el Colorado. Me tapó con el cuerpo. Estoy vivo porque él ya no.',
          'Ahora entiendo algo horrible, pá. Acá siempre hubo dos clases de conscripto: los que tienen un ángel y los que no. Yo tuve el mejor. Se me murió el ángel, viejo.',
          'Un pibe de acá talló VOLVEREMOS en la culata del fusil. Yo lo único que quiero es que volvamos nosotros.',
          'Vení a buscarme. Ya sé que no se puede. Vení igual. Sos lo único que me queda. Mateo.']
      },
      {
        img: 'M10_PADRE', style: 'carta', title: 'LA CARTA DEL PADRE · III', paras: [
          'Mateo: se me murió el hombre que yo mandé para que no te murieras vos. Lo elegí yo. Lo puse yo ahí. Un padre mueve lo que puede y después tiene que vivir con lo que movió.',
          'Vos me pedís que vaya a buscarte y yo te tengo que decir que no se puede, y no te lo voy a decir, porque no pienso escribir esa frase.',
          'Así que voy a ir.',
          '(Es lo único que escribió sin tachar en toda la carta. Cuatro palabras. Dobla la hoja.)']
      },
      {
        img: 'M10_HIST', title: 'RFA SIR TRISTRAM · 8 JUNIO 1982', paras: [
          'El buque logístico fue alcanzado por bombas en Fitzroy, en el mismo ataque que castigó al Sir Galahad.',
          'Murieron 2 tripulantes. El buque quedó fuera de combate.',
          'Aquel 8 de junio fue uno de los días más duros del conflicto, para los dos lados.']
      },
    ],
    storyM11: [
      {
        img: 'M11_1', title: 'APOYO A LOS MONTES', paras: [
          'La superioridad tecnológica ya inclinó la guerra. De noche, las fragatas se acercan a la costa a martillar las posiciones argentinas antes de cada asalto. Por primera vez, los Fieles van a volar sobre las cabezas de los suyos.',
          'Y llega el dato que arma el final: el regimiento de Mateo quedó en primera línea, bajo ese bombardeo naval.']
      },
      {
        img: 'M11_2', title: 'PEDIME QUE LLEGUE', paras: [
          'ESTEBAN: Puma. Mi hijo está en ese monte, y le están tirando desde el mar con todo lo que tienen. Si nadie calla esos cañones esta noche, a la madrugada no hay monte.',
          'PUMA: Es un viaje de ida, Tero. Y la Chancha está en tierra, rota. Sin Chancha no hay nafta de vuelta. ¿Entendés lo que te digo? No hay vuelta.',
          'ESTEBAN: Entonces no me pidas que vuelva. Pedime que llegue.',
          'GITANO: (sin un solo chiste) No va solo. Ni en pedo va solo. Cuarenta días le cebé mate a este tipo.',
          'PUMA: (sonríe por primera vez en tres misiones) ...Plata Fiel completa, entonces. Una vez más. La última.']
      },
      { level: 'LA CENA', obj: '11 de junio de 1982 · HMS BROADSWORD' },
    ],
    epiM11: [
      {
        img: 'M11_ASADO1', title: 'EL ÚLTIMO ASADO', paras: [
          'Detrás del hangar, un medio tambor con brasas. El Turco consiguió carne, nadie pregunta cómo. Gitano canta bajito una zamba, desafinando con dignidad.',
          'Sobre la mesa, contra la damajuana, la foto de la vieja del Vasco. Al lado, la libreta del Pichón. Los que no están en la mesa, en la mesa.',
          'GITANO: Che, ¿saben que mañana debuta Argentina en el Mundial? Acá también juega Argentina mañana. Pero este partido no lo pasan por la tele.']
      },
      {
        img: 'M11_ASADO2', title: 'LA ÚNICA VEZ QUE EL GITANO HABLA EN SERIO', paras: [
          'GITANO: El "perdoname" del Vasco no me lo puedo sacar. Yo sé lo que es tener algo que pedirle perdón a la vieja de uno. Mi viejo pegaba. Y un día decidí que yo iba a ser exactamente lo contrario de eso. Así que no, muchachos: no soy gracioso. Soy lo contrario de mi viejo. Es distinto. Cuesta más.',
          'EL TURCO: (después de un rato largo) Te salió bien, cordobés.',
          'ESTEBAN: (mirando la foto) ¿Me la prestás mañana? Que la vieja vuele una vez con la escuadrilla del hijo.',
          'EL TURCO: (alzando el vaso de vino en tetra) Por los que no están en la mesa.',
          'TODOS: Por los que no están.']
      },
      {
        img: 'M11_CARTA', style: 'tierra', title: 'LA ÚLTIMA CARTA · SIN COPIAR', paras: [
          'Viejo: no sé si esta carta va a salir. Ya casi no sale nada de acá. La escribo igual, porque escribirte es la única costumbre buena que me queda.',
          'Quedamos los pibes solos, cuidándonos entre nosotros. Nos tapamos, nos repartimos, nos aguantamos. En el peor lugar del mundo todavía hay pibes tapando a otros pibes. Eso también es la Patria, pá. Eso, y no los discursos.',
          '¿Sabés qué me sostiene? La página del cuaderno del día que batiste las alas. Cuando pega el miedo la abro y me digo: mi viejo me vio. No estoy solo ni aunque esté solo.']
      },
      {
        img: 'M11_CARTA2', style: 'tierra', title: 'LA ÚLTIMA CARTA · II', paras: [
          'Si no nos vemos: gracias por el cielo. Por el sapito, por el Rastrojero, por enseñarme a mirar para arriba. Si escucho un motor bien bajo, bien rasante, voy a saber que sos vos, y voy a estar tranquilo.',
          'Cuidámela a mamá. Y perdón por las mentiras del guiso, pero decíselas igual.',
          'Ser valiente no es no tener miedo, pá. Es escribirte igual, con la mano temblando.',
          'Te quiero, viejo. Volá bajo. Mateo.']
      },
      {
        img: 'M11_PADRE', style: 'carta', title: 'LA CARTA DEL PADRE · IV', paras: [
          'Hijo: mañana salgo a buscarte. Te debo dos respuestas y te las pago las dos juntas antes de subirme, porque después no sé.',
          'Cómo se ve desde arriba: se ve chiquito todo. No es lindo, Mateo. Me pediste que te mintiera y no puedo. Lo único lindo que vi desde arriba en toda esta guerra fue a vos, con el cuaderno, saludando.',
          'Y cómo se hace cuando se te muere alguien al lado: no se hace. Se aguanta. Y se va a buscar al que queda.',
          'Perdoname por no haberte podido sacar de ahí. Lo intenté todo. Resulta que todo era poco.']
      },
    ],
    storyM12: [
      {
        img: 'M12_1', title: 'DENEGADA', paras: [
          'CÓNDOR: Plata Fiel, la misión está DENEGADA. No hay indicativo asignado. Sin reabastecedor no hay margen de combustible para el regreso. Repito: DENEGADA.',
          'Todas las misiones tuvieron su pájaro de código: Cauquén, Chimango, Hornero, Chajá. Esta noche el comando no asigna ninguno. Esta noche no los manda nadie: vuelan con el nombre propio.',
          'PUMA: (apaga la radio con dos dedos, tranquilo) Que me perdone el abuelo.']
      },
      {
        img: 'M12_2', title: 'EL PAGO DEL APODO', paras: [
          'PUMA: ¿Sabés por qué te pusieron Tero? El tero grita lejos del nido. Se hace el herido, arma escándalo, se ofrece al zorro para que el zorro lo corra a él. Da la vida distrayendo, y el nido queda a salvo.',
          'PUMA: Esta noche los teros somos nosotros: gritamos, brillamos, hacemos el escándalo. Vos pasás por abajo, calladito, y llegás al nido. ¿Estamos?',
          'GITANO: (la última sonrisa) Escuchame, Tero: llegá. Por el Vasco, por el Pichón, por todos los que no llegamos a nada: LLEGÁ.',
          'EL TURCO: (le mete el pincel de las estrellitas en el bolsillo del traje) Me lo devolvés mañana. ¿Me oíste? Me lo trae usted personalmente, Primer Teniente, o lo voy a buscar yo a nado.']
      },
      { level: 'EL TERO', obj: 'Madrugada del 12 de junio · HMS GLAMORGAN' },
    ],
    epiM12: [
      {
        img: 'M12_GITANO', title: 'PRIMER TERO', paras: [
          'Un enjambre de misiles se cierra sobre la formación. Gitano rompe hacia arriba, enciende todo lo que se puede encender, se vuelve el blanco más luminoso del cielo.',
          'GITANO: ¡Acá estoy, ingleses! ¡Miren qué lindo brillo cordobés! ¡Vengan todos que hay para todos! ¡TERO, ANDÁ! ¡Viva la Patria... la de los pibes, carajo, la de los pibes—!']
      },
      {
        img: 'M12_PUMA', title: 'SEGUNDO TERO', paras: [
          'Queda la última línea antiaérea, la que no se puede cruzar y disparar a la vez. Puma se adelanta, se mete de frente en el fuego, y apaga las baterías con el único fierro que le queda: su propio avión.',
          'PUMA: Plata Fiel... misión cumplida. Tero: era verdad lo que dijo el Pichón. No es la bandera. Nunca fue la bandera. Es el pibe. Andá a buscar a tu pibe.',
          'Quedás solo en el cielo negro. Delante, la costa. El Glamorgan escupiendo fuego. Y detrás del fuego, el monte.']
      },
      {
        img: 'M12_TARDE', title: 'LLEGAR TARDE', paras: [
          'Rompés la última defensa. Tenés el blanco adelante. Vas a llegar. Estás llegando. Llegás.',
          'Y entonces, antes de que sueltes, el monte recibe la salva completa. El lugar donde está Mateo estalla en una sola luz blanca. Y se apaga.',
          'ESTEBAN: (un susurro) ...llegué. Llegué, hijo. Estoy acá arriba. Mirame. Estoy volando bajo. Mirame como aquella vez. MIRAME, MATEO.',
          'Ninguna respuesta de tierra. Nunca más una respuesta de tierra.']
      },
      {
        img: 'M12_FINAL', title: 'EL COMBUSTIBLE JUSTO', paras: [
          'CÓNDOR: (casi con lástima) Tero... está en reserva. Si sale AHORA, llega. Repito: si quiere volver, es ahora.',
          'El avión enfila a casa, obediente. Y entonces —fuera de toda orden, porque hay cosas que un padre no delega— el motor se apaga.',
          'Tenía el combustible justo para volver. No tenía las ganas. Un padre no vuelve de algunos lugares.']
      },
      {
        img: 'EPI_MESA1', title: 'LOS DOS PLATOS', paras: [
          'La cocina del principio. Golpean la puerta: un uniformado, dos telegramas. Norma los deja sobre la mesa, uno al lado del otro, como dos cubiertos.',
          'Pone la pava. Sirve la mesa para dos. Se sienta. Espera. La pava chifla y esta vez tampoco nadie la saca.',
          'El 13 de junio, el país miró el debut de Argentina en el Mundial de España. El 14, la guerra terminó. Los televisores estaban prendidos en otra cosa.']
      },
      {
        img: 'EPI_MESA2', title: 'LAS DOS ENCOMIENDAS', paras: [
          'Meses después llegan dos encomiendas. En la del Ejército, un cuaderno Rivadavia hinchado de humedad: un arroyo, un Rastrojero, un padre y un nene tirando piedritas. El Colorado con capa. El monte visto desde arriba.',
          'En la de la Fuerza Aérea: un pincel finito manchado de blanco, la foto de una mujer joven que Norma no conoce —la da vuelta, porque una madre siempre da vuelta las fotos— y una hoja llena de tachones, sin firmar y sin sobre.',
          'Pone el cuaderno abierto de un lado de la mesa y la carta abierta del otro. Derechitos, uno frente al otro, como los dos platos.',
          'Nunca se leyeron. Vos los leíste a los dos.']
      },
      {
        img: 'M12_HIST', title: 'HMS GLAMORGAN · 12 JUNIO 1982', paras: [
          'En la madrugada del 12 de junio, mientras daba fuego naval sobre los montes, el Glamorgan fue alcanzado por un Exocet lanzado desde una rampa improvisada en tierra.',
          'Murieron 14 tripulantes. Fue el último buque británico alcanzado en la guerra.',
          'Al barco que castigaba el monte le pegaron desde tierra y desde el aire a la vez.',
          'El 14 de junio de 1982, tras 74 días, cesaron los combates.']
      },
    ],

    // ---------- RECUENTO DE FIN DE MISION ----------
    mom_turn: '! VIRAJE 180 !', mom_pass_n: 'INTENTO {n}',
    hud_mission: 'MISION {n}/{m}',
    res_title: 'MISION CUMPLIDA', res_total: 'TOTAL', res_rank: 'CALIFICACION:',
    res_flight: 'PUNTAJE DE VUELO', res_kills: 'BLANCOS', res_acc: 'PRECISION', res_ras: 'RACHA RASANTE',
    rank_cadete: 'CADETE', rank_piloto: 'PILOTO', rank_as: 'AS', rank_halcon: 'HALCON DEL ATLANTICO',
    // ---------- BRIEFING CORTO ----------
    brief_title: 'ORDEN DE MISION', brief_goal: 'OBJETIVO:', brief_go: 'CUALQUIER TECLA  para despegar',

    // ---------- BRIEFINGS (tarjeta corta de cada mision — la usa el CICLO DE MUERTE) ----------
    briefM1: 'Vuelo de adaptacion sobre mar abierto. Pegado al agua el radar de ellos no te ve: volves con sal en las alas.',
    briefM2: 'Primera salida real contra la flota. Ellos tienen la maquina; nosotros, las manos. Rasante o nada.',
    briefM3: 'Patrulla de reconocimiento costero. Sin presion y sin buque: la salida sirve para probar en el aire lo que el Pichon le toco al avion.',
    briefM4: 'La Task Force navega al este de las islas. Un destructor Tipo 42 cubre la pantalla de radar de la flota. Vola bajo: su radar no distingue un blanco pegado al agua.',
    briefM5: 'Los britanicos desembarcaron en San Carlos. Las fragatas cubren la cabecera de playa desde el estrecho. El pasillo es angosto y esta erizado de antiaerea.',
    briefM6: 'Segunda jornada sobre San Carlos. El estrecho ya se gano el apodo de Callejon de las Bombas. La fragata escolta el fondeadero.',
    briefM7: 'Un Tipo 42 se ofrece de senuelo al noroeste del estrecho para atraer aviones lejos del desembarco. Mordio el anzuelo al reves: hoy el senuelo sos vos.',
    briefM8: 'Un carguero portacontenedores trae helicopteros pesados para el avance britanico. Sin esos helicopteros, la infanteria camina.',
    briefM9: 'El corazon del desembarco britanico: la zona mas defendida de la guerra. Cruzar la muralla de fuego y volver para contarlo.',
    briefM10: 'Reconocimiento armado sobre las islas con el frente cerrado. No hay buque ni blancos: el enemigo es el clima, la niebla y la nafta. La Chancha no baja mas al sur.',
    briefM11: 'Buque logistico fondeado en Bahia Agradable, cargado de tropa esperando desembarcar. Esta al descubierto y sin cobertura aerea.',
    briefM12: 'Misma tarde, segunda salida sobre Fitzroy. El segundo buque de desembarco espera su turno.',
    briefM13: 'De noche las fragatas martillan los montes alrededor de Puerto Argentino. Hay que callar a la escolta que da fuego naval.',
    briefM14: 'Mision denegada por el comando. Sin indicativo, sin reabastecedor, sin margen. El buque bombardea el monte. Se vuela igual.',

    // (los EPILOGOS historicos viven ahora ADENTRO de cada epiM* — la placa es la ultima
    // pantalla de la secuencia. Cifras reales; dudas en docs/PREGUNTAS_HISTORICAS.md)

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
    pageFooter: '<kbd>W</kbd>: throttle — release and you fall &nbsp;·&nbsp; <kbd>A</kbd><kbd>D</kbd>: dodge &nbsp;·&nbsp; <kbd>S</kbd>: dive &nbsp;·&nbsp; <kbd>←</kbd><kbd>→</kbd>: roll &nbsp;·&nbsp; <kbd>↑</kbd><kbd>↓</kbd>: look up/down &nbsp;·&nbsp; <kbd>X</kbd>/<kbd>SPACE</kbd>: cannon &nbsp;·&nbsp; <kbd>Z</kbd>: missile (and the pass bombs) &nbsp;·&nbsp; <kbd>SHIFT</kbd>/<kbd>C</kbd>: boost &nbsp;·&nbsp; <kbd>F</kbd>: airbrake &nbsp;·&nbsp; <kbd>ESC</kbd>: pause &nbsp;·&nbsp; <kbd>CAPS</kbd>/<kbd>MOUSE</kbd>: free aim (click: cannon · right click: missile)<br>Gamepad (PlayStation or Xbox): left stick flies · right stick rolls and looks · R1/RB cannon · L1/LB missile · R2/RT boost · L2/LT airbrake · START pause<br>Touch: drag on the left to fly · top-right: fire · bottom-right: boost<br>Flying low multiplies. Grazing obstacles gives a bonus. Boost doubles points and burns fuel.',
    aria: 'Rasante game: arrows to maneuver, X to fire, Shift to boost',
    death_land: 'You hit the ground', death_sea: 'You hit the sea',
    death_pared: 'You flew into the hillside',
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
    death_pasada: 'The squadron was spent and the ship sailed on',
    death_caza: 'A Sea Harrier got on your tail',
    caza_warn: 'BREAK, {c}! ON YOUR SIX!',
    caza_out: 'The Brit ran out of fuel.',
    caza_break: 'BREAK, {c}, BREAK!',
    caza_hit: 'You hit him! He is trailing smoke.',
    caza_kill: 'YOU GOT HIM!',
    purs_lejos: 'Close it up, {c}!',
    purs_cerca: 'You are all over me.',
    purs_perdido: 'You lost the leader',
    purs_choque: 'You rammed your own leader',
    purs_banda: 'FORMATION',
    modePersec: 'PURSUIT',
    modePersecDesc: 'Fly as wingman. Hold the distance: the leader knows the way through.',
    purs_releva: '{a} is low on fuel. Stick with {b}.',
    purs_aprieta: 'Tighten it up, {c}. This is getting ugly.',
    purs_tiron: '{c} going burner. Stay with me!',
    purs_pegado: 'That is how you fly wing.',
    purs_caido: 'The leader went down',
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
    sq_spent: '{c} IS OFF THE RUN',
    dead_out: 'OUT OF ACTION',
    bar_fuel: 'FUEL', bar_cannon: 'CANNON 20MM', bar_overheat: 'OVERHEAT',
    bar_tempo: 'MOMENTUM', tempoOn: 'MOMENTUM', tempoOff: 'REAL TIME', tempoReady: '! MOMENTUM READY — [4] !',
    bar_chancha: 'TANKER', ch_ready: '! TANKER READY — [5] !',
    bar_rasante: 'RASANTE',
    inter_dia: 'THE NEXT DAY',
    ch_call: 'TANKER, TANKER, PATRIA HERE — RUNNING DRY',
    ch_ack: 'CONDOR COPIES. SENDING HER.',
    ch_come: 'THE OLD SOW NEVER QUITS. ON MY WAY.',
    ch_eta: 'TANKER IN {s}',
    ch_arriba: 'TANKER OVERHEAD — CLIMB TO THE BASKET',
    ch_connect: 'PLUGGED IN — HOLD IT THERE',
    ch_drop: 'YOU DROPPED OFF — COME BACK',
    ch_full: 'HELP YOURSELF. SEE YOU DOWN THERE.',
    ch_bye: 'HEADING HOME, PATRIA. GOOD LUCK.',
    ch_early: 'NOT YET, PATRIA. HANG ON.',
    ch_used: 'I FILLED YOU ONCE TODAY. THAT IS ALL.',
    ch_broken: 'THE OLD SOW DOES NOT COME SOUTH ANYMORE.',
    m5_boca: 'PUMA: THERE IT IS. THE WOLF\'S MOUTH. WE GO IN, WE DROP, WE GET OUT.',
    m5_salida: 'PUMA: IT OPENS UP. OPEN SEA AHEAD — AND THE ARDENT WAITING.',
    m4_radio1: 'CONDOR: LOGGING POSITIONS. TWO NORTHEAST, HEADING SOUTH.',
    m4_radio2: 'GITANO: WHERE DO YOU GET ALL THAT, CONDOR?',
    m4_radio3: 'CONDOR: FROM A FISHING BOAT CALLED NARWAL.',
    m4_radio4: 'PUMA: THEY ARE NOT MILITARY. AND DEEPER IN THAN US.',
    ch_nozone: 'NOBODY GOES IN THERE, PATRIA.',
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
    hud_squad: 'SQUADRON',
    obj_m: ' m',
    title: 'R A S A N T E', subtitle: 'Battle for Malvinas · South Atlantic · 1982',
    tip1: 'Lower = more points. Grazing gives a bonus.',
    tip2: 'Boost doubles the score and burns fuel.',
    tip3: 'Too high = radar detects you.',
    startPrompt: 'TAKE OFF',
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
    optInvY: 'Y AXIS', optInvYNo: 'UP CLIMBS', optInvYYes: 'INVERTED',
    optSquad: 'SQUADRON', optSquadSolo: 'SOLO',
    optDmg: 'AIRCRAFT DAMAGE',
    optDmg_squad: 'SQUADRON', optDmg_integ: 'INTEGRITY', optDmg_visual: 'INTEGRITY (VISUAL)',
    optRelevo: 'WHEN A PLANE IS LOST',
    optRelevo_auto: 'BY GAME MODE', optRelevo_dmg: 'LIMPS HOME', optRelevo_kill: 'SHOT DOWN',
    optPasadaSlow: 'RUN-IN SLOW MOTION',
    dmg_bar: 'PLANE',
    dmg_ok: 'AIRCRAFT OK', dmg_hit: 'LIGHT DAMAGE',
    dmg_dmg: 'DAMAGED — NO BOOST', dmg_crit: 'CRITICAL — BASICS ONLY',
    optFuel: 'FUEL', optEnergy: 'ENERGY',
    optEnemies: 'ENEMIES', optEnemiesOn: 'MOVING', optEnemiesOff: 'STATIC',
    optSky: 'SKY',
    optSkyDusk: 'DUSK', optSkyNight: 'NIGHT', optSkyStorm: 'STORM',
    optSkyClear: 'CLEAR', optSkyCloudy: 'OVERCAST', optSkySun: 'FULL SUN',
    optSkyMoon: 'FULL MOON', optSkyDawn: 'DAWN',
    ola_call: 'WALL OF WATER AHEAD',
    optWater: 'WATER', optWaterSea: 'SEA', optWaterViolet: 'VIOLET',
    optWaterAuto: 'AUTO (follows sky)', optWaterStorm: 'STORM', optWaterNight: 'NIGHT',
    optWaterSun: 'TURQUOISE', optWaterDawn: 'DAWN',
    optNoteAgua3D: 'TEST — with 3D water the dodgeable waves are NOT drawn (they still kill).',
    optAgua3D: '3D WATER (CORRIDOR)', optAgua3D_2d: 'no', optAgua3D_3d: 'yes',
    optNote3D: 'TEST — the three layers apply to the climax AND the corridor. No gameplay.',
    optDuo3D: 'SHIP TAKES THE WEATHER', optDuo3D_on: 'yes', optDuo3D_off: 'no',
    optBruma3D: 'LAYERED HAZE', optBruma3D_on: 'yes', optBruma3D_off: 'no',
    optAves3D: 'BIRD FLOCKS', optAves3D_on: 'yes', optAves3D_off: 'no',
    optBlur: 'TURBO BLUR', optBlurOn: 'yes', optBlurOff: 'no',
    optRain: 'RAIN', optRainOff: 'NO', optRainDrizzle: 'DRIZZLE', optRainRain: 'RAIN', optRainStorm: 'STORM',
    optMarco: 'WAR FOG',
    optMarco_off: 'OFF', optMarco_bruma: 'HAZE', optMarco_focus: 'FOCUS',
    optZigzag: 'WINDING CORRIDOR',
    optZigzag_0: 'STRAIGHT', optZigzag_1: 'GENTLE', optZigzag_2: 'ALLEY',
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
    optMejoras: "PICHON'S UPGRADES", optMejorasGo: 'VIEW',
    mejTitle: "PICHON'S UPGRADES",
    mejSecPiruetas: "PICHON'S MOVES", mejSecPuesto: 'PILOT STATION',
    mejOn: 'ON', mejOff: 'OFF',
    mejWhat: 'WHAT IT DOES', mejHowto: 'HOW TO DO IT',
    mejKeys: '[↑] [↓] SELECT      [←] [→] ON / OFF      [ESC] BACK',
    mejdMoves: 'Master switch: turns ALL maneuvers off at once',      mejkMoves: 'tap sequences',
    mejdControl: 'What the arrows do: push sideways or ROLL',         mejkControl: '← →',
    mejdHorizon: 'How much the WORLD tilts when the plane rolls',     mejkHorizon: 'Q E  ·  right stick',
    mejdAim: 'Sight locked ahead of the plane, or moved by mouse',    mejkAim: 'CAPS LOCK  ·  mouse',
    mejdMira: 'Which of the nine reticles is drawn',                  mejkMira: '—',
    mejdInvY: 'Whether up climbs or dives. Keyboard and stick, every mode',  mejkInvY: 'W · S · left stick · △',
    mejdNet: 'The mesh marking the altitude where radar begins',      mejkNet: '—',
    mejdEnergy: 'Altitude and speed trade off: diving accelerates',   mejkEnergy: 'W  ·  S',
    optSecCtrl: 'CONTROLS',
    optColKb: 'KEYBOARD', optColPad: 'GAMEPAD',
    ctrlFly: 'DODGE',           ctrlFlyK: 'A   ·   D',          ctrlFlyP: 'left stick · d-pad',
    ctrlGas: 'THROTTLE (climb)', ctrlGasK: 'W',                 ctrlGasP: 'left stick up',
    ctrlDive: 'DIVE',           ctrlDiveK: 'S',                 ctrlDiveP: 'left stick down',
    ctrlGun: 'CANNON',          ctrlGunK: 'X · SPACE · K',      ctrlGunP: 'R1   ·   ✕',
    ctrlMsl: 'MISSILE',         ctrlMslK: 'Z   ·   TAB',        ctrlMslP: 'L1   ·   □',
    ctrlBoost: 'BOOST',         ctrlBoostK: 'SHIFT   ·   C',    ctrlBoostP: 'trigger',
    ctrlBrake: 'AIRBRAKE',      ctrlBrakeK: 'F',                ctrlBrakeP: 'L2',
    ctrlTurn: 'COMBAT TURN',    ctrlTurnK: 'R',                 ctrlTurnP: '◯',
    ctrlPips: 'ENERGY PIPS',    ctrlPipsK: 'G',                 ctrlPipsP: 'd-pad UP',
    ctrlRoll: 'ROLL / 360° ROLL', ctrlRollK: '← →  ·  Q E',     ctrlRollP: 'right stick ← →',
    ctrlPan: 'LOOK UP / DOWN',  ctrlPanK: '↑ ↓  ·  R F',        ctrlPanP: 'right stick ↑ ↓',
    ctrlMoves: 'MANEUVERS',     ctrlMovesK: 'tap sequences',    ctrlMovesP: 'both sticks',
    ctrlHands: 'zigzags: left hand · rolls: right hand', ctrlHandsK: '', ctrlHandsP: '',
    ctrlWasd: 'with FREE SIGHT, the arrows fly again', ctrlWasdK: '', ctrlWasdP: '',
    ctrlArena: 'AIRBRAKE, TURN and PIPS: climax only', ctrlArenaK: '', ctrlArenaP: '',
    ctrlBombs: 'in the PASS, the MISSILE drops the bombs', ctrlBombsK: '', ctrlBombsP: '',
    ctrlSame: 'this table is the SAME in all four modes', ctrlSameK: '', ctrlSameP: '',
    ctrlBoth: 'everything is playable on keyboard OR gamepad, no exceptions', ctrlBothK: '', ctrlBothP: '',
    ctrlAim: 'SIGHT fixed/free', ctrlAimK: 'CAPS LOCK · mouse', ctrlAimP: 'always fixed',
    ctrlCam: 'CAMERA (climax)', ctrlCamK: 'V',                  ctrlCamP: 'd-pad DOWN',
    ctrlTempo: 'MOMENTUM (slow motion)', ctrlTempoK: '4',       ctrlTempoP: 'SELECT',
    ctrlChancha: 'THE TANKER (refuel)', ctrlChanchaK: '5',      ctrlChanchaP: 'd-pad UP',
    ctrlInv: 'INVERT Y AXIS',   ctrlInvK: 'OPTIONS: Y AXIS',    ctrlInvP: '△',
    ctrlMusic: 'MUSIC TRACK',   ctrlMusicK: '1   ·   2',        ctrlMusicP: 'L3 · R3',
    ctrlPause: 'PAUSE',         ctrlPauseK: 'ESC',              ctrlPauseP: 'START',
    ctrlMenu: 'IN MENUS',       ctrlMenuK: 'arrows · ENTER · ESC', ctrlMenuP: 'd-pad · ✕ · ◯',
    selKeys: '[ESC] BACK      [ENTER] SELECT',
    modeCampaign: 'CAMPAIGN', modeSurvival: 'SURVIVAL', modeCycle: 'DEATH CYCLE',
    modeCampaignDesc: 'Story mode by levels', modeSurvivalDesc: 'Endless score until you die',
    modeCycleDesc: 'Random objectives, rising difficulty',
    modeArena: 'SACRED MINUTES', modeArenaDesc: 'Random battles',
    menuBack: 'BACK', menuBackDesc: 'Back to the main menu',
    modeQuick: 'QUICK GAME', modeQuickDesc: 'Single runs, no story',
    quickTitle: 'QUICK GAME',
    modePruebas: 'TEST BENCH', modePruebasDesc: 'The catalogue of moments, no grinding to get there',
    pruebasTitle: 'TEST BENCH  ·  PICK A MOMENT',
    prBadge: 'TEST',
    prSecClimax: 'THE CLIMAXES', prSecCola: 'THE TAIL AND THE WINGMAN', prSecDestr: 'DESTRUCTION',
    prSecAgua: 'WATER AND WEATHER', prSecPoder: 'THE POWERS', prSecHistoria: 'THE STORY',
    prSecCallejon: 'THE ALLEY',
    modeCines: 'CUTSCENES', modeCinesDesc: 'Play a single cutscene, no grinding to get there',
    modeManiobras: 'MANEUVERS', modeManiobrasDesc: 'Every aerobatic move, in its three presentations',
    cinesTitle: 'CUTSCENES  ·  PICK ONE',
    mvTitle: 'MANEUVERS  ·  PICK ONE',
    mvVarsTitle: 'HOW DO YOU WANT TO SEE IT',
    mvVarsBack: 'Back to the maneuver list',
    cinBadge: 'CUTSCENE',
    modeMisiones: 'MISSIONS', modeMisionesDesc: 'Fly a single mission, no campaign around it',
    misTitle: 'MISSIONS  ·  PICK ONE AND FLY IT ALONE',
    misClimaxNo: 'CORRIDOR ONLY',
    misLibreta: "PICHON'S NOTEBOOK  ·  {n}/{m} UPGRADES AT THIS POINT OF THE CAMPAIGN",
    misLibretaVacia: '(no upgrades: stock plane, classic barrel roll only)',
    misModoLbl: '[H]',
    misModo_juego: 'MISSION',
    misModo_cine: 'CUTSCENES',
    misModo_ambas: 'CUTSCENES + MISSION',
    misModo_radio: 'IN-FLIGHT DIALOGUE',
    optRadioUI: 'IN-FLIGHT RADIO', optRadioToast: 'TOAST (one line)', optRadioPanel: 'PANEL (last 4)',
    misRadioHud: 'LINE {n}/{m}  ·  AT {p}% OF THE MISSION  ·  KEY: NEXT  ·  ESC: EXIT',
    modePasada: 'DEADLY RUNS', modePasadaDesc: 'On the deck, pop up, release and out',
    modeHint: 'arrows: choose   ENTER / TAP: confirm',
    portLabel: 'PORT', bargeDown: 'BARGE DESTROYED', reached: 'reached',
    continuePrompt: 'CONTINUE',
    nextPrompt: 'NEXT',
    backPrompt: 'BACK',
    mom_title: 'M O M E N T U M', mom_hint: 'KEEP THE SIGHT ON THE ZONE AND FIRE [X]',
    mom_pass: 'PASS {n}/{m}', mom_clear: 'PASS COMPLETE!', mom_next: 'NEXT PASS >>',
    // ARENA: the flown 3D assault (three.js climax; without 3D the classic momentum runs)
    arena_hint: 'NOSE [W]/[S] · ROLL & TURN [Q]/[E] · BRAKE [F] · U-TURN [R] · POWER [G] · [X] FIRE · [Z] PAINT & RELEASE',
    arena_uturn: 'U-TURN', arena_sweet: 'TIGHT TURN', arena_reload: 'CLEAN PASS  ·  +1 MISSILE',
    arena_pip_eq: 'BALANCED', arena_pip_mot: 'ENGINE', arena_pip_arm: 'WEAPONS',
    arena_open: '! EXPOSED !', arena_bubble: 'CLOSE-IN DEFENCE',
    arena_msl: '! MISSILE !',
    arena_low: '! SEA — PULL UP !',
    arena_sunk: 'SHIP OUT OF ACTION!', arena_squad: 'SQUADRON',
    arena_v1: 'COCKPIT', arena_v3: 'THIRD PERSON',
    pulso_ya: 'NOW', pulso_soltar: 'RELEASE',
    pulso_ok: 'TARGET HIT',
    pulso_pasaste: 'YOU OVERSHOT', pulso_otra: 'COMING AROUND AGAIN',
    pulso_fallo_err: 'YOUR HAND SLIPPED', pulso_fallo_t: 'YOU RAN OUT OF TIME',
    optMach: 'TRANSONIC', optMach_off: 'no', optMach_vapor: 'vapor only', optMach_todo: 'vapor + cone',
    pulso_pasadas: 'PASSES',
    pulso_elegi: 'PICK YOUR TARGET',
    pulso_z_radar: 'RADAR', pulso_z_bridge: 'BRIDGE', pulso_z_deposit: 'MAGAZINE',
    pulso_why: 'Your pass got away',
    pulso_s_limpio: 'NOT ONE MISTAKE', pulso_s_rapido: 'LIGHTNING HANDS', pulso_s_bravo: 'THE HARD ONE',
    pulso_m_ciego: 'SHE WENT BLIND', pulso_m_puente: 'THE BRIDGE IS BURNING', pulso_m_polvorin: 'THE MAGAZINE BLEW',
    pulso_c_t42: 'THE DESTROYER GOES DOWN BY THE STERN', pulso_c_t21: 'THE FRIGATE LISTS TO PORT',
    pulso_c_log: 'THE CARGO BURNS BOW TO STERN',
    res_pulso: 'THE PULSE',
    death_pulso: 'Out of passes',
    arena_out: '! OUTSIDE THE COMBAT ZONE !', arena_auto: 'TURNING BACK TO TARGET',
    pasada_title: 'T H E   R U N',
    pasada_hint: 'NOSE [W]/[S] · ROLL & TURN [Q]/[E] · BRAKE [F] · [Z] RELEASE',
    pasada_run: 'RUN',
    pasada_band_dormida: 'TOO LOW', pasada_band_dulce: 'ARMED', pasada_band_alta: 'HIGH',
    pasada_dud: 'IT NEVER WOKE UP', pasada_sapito: 'SKIP HIT!',
    pasada_rearm: 'NEW STICK',
    pasada_miss: 'YOU MISSED', pasada_hit: 'HIT, NOT ENOUGH', pasada_dry: 'OUT OF FUEL',
    pasada_turn: '{c} IS UP',
    pasada_tries: 'TRIES', pasada_fuel: 'FUEL',
    pasada_why: 'You dropped: one run, one aircraft',
    pasada_gate: 'GATE', pasada_reencare: 'R U N   I N   A G A I N', pasada_axis: 'ON THE AXIS!',
    pasada_turn_in: 'TURN IN', pasada_turn_now: 'T U R N   N O W',
    pasada_dart: 'MISSILE AWAY!', pasada_break: 'BREAK, {c}!', pasada_break_ok: 'YOU LOST IT',
    pasada_dart_radio: '{c}: ONE AWAY ON YOU, BREAK!',
    pasada_wave_in: '{c} GOING IN', pasada_wave_hit: '{c} HIT HER!',
    pasada_wave_miss: '{c} WENT LONG', pasada_wave_hurt: '{c} IS HIT, HEADING HOME',
    pasada_re_lat: 'YOU CAME BACK LOW', pasada_re_chan: 'YOU CAME BACK HIGH — MORE FUEL',
    pasada_cue: 'RELEASE IN', pasada_now: 'N O W', pasada_noline: 'NO LINE',
    pasada_ship: 'SHIP',
    mom_destroyed: '{z} DESTROYED',
    zone_aa: 'AA GUN', zone_radar: 'RADAR', zone_bridge: 'BRIDGE',
    zone_engine: 'ENGINE', zone_deposit: 'CARGO HOLD',
    // EL BANCO DEL PICHON (la pantalla si esta traducida; las tarjetas de mejora, no aun)
    upgTitle: "PICHON'S WORKBENCH", upgTitleLib: "PICHON'S NOTEBOOK",
    upgRitual: '"THAT CANNOT BE DONE."  ...  "SHOW ME."',
    upgRitualLib: '"...ALL RIGHT, KID. SHOW ME."',
    upgSub: 'CHOOSE ONE UPGRADE', upgSub1: 'YOUR FIRST UPGRADE', upgCombo: 'COMBO:',

    // EL PODER RASANTE (tecla 6)
    rasOn: 'RASANTE', rasOff: 'RASANTE — OVER', rasReady: '! RASANTE READY — [6] !',
    rasante_call_1: 'Down on the water their radar cannot see you.',
    rasante_call_2: 'Get down, {n}, get down!',
    rasante_call_3: 'There he goes. Just as Pichon drew it.',
    rasLeccion: 'A stone does not sink if it goes fast and hugs the water.',
    ras_no_chancha: 'The basket is up there. Let go of the deck first.',
    ras_no_cita: 'Not now, {n}: you are still plugged in.',
    upgHint1: 'ENTER / TAP: write it in the notebook',
    // Fin de mision. Los textos LARGOS del guion (storyM*/epiM*/briefM*) no estan traducidos
    // todavia: T() cae solo al español, asi que el juego funciona igual (campaña es-only por ahora).
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
