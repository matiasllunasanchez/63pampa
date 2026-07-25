// RASANTE — entry point. Los modulos de datos se bundlean con esbuild (npm run build:game);
// hace falta bundlear porque Electron carga por file://, donde Chromium bloquea los ES modules.
import { STRINGS } from './data/strings.js';
import { P, SKY_PRESETS, LAND } from './data/palette.js';
import { MOM_LAYOUTS, SHIP_CLASS } from './data/ships.js';
import { SHIPS, MISSIONS } from './data/missions.js';
import { L, T, getLang, cycleLang, applyChrome } from './core/i18n.js';
import { wrapChars, multOf } from './core/util.js';
import { S, setState, cfg, cam, plane, stats, resetPlane, resetStats } from './core/state.js';
import { obstacles, soldiers, bullets, missiles, pmissiles, parts, popups, streaks, wake, gusts,
         prune, clearWorld } from './core/world.js';
import { run, resetRun } from './core/run.js';
import { proj, popup, explodeAt, bloodBurst } from './core/fx.js';
import * as momentum from './systems/momentum.js';
import { spawnSystem } from './systems/spawn.js';
import { collisionSystem } from './systems/collision.js';
import { inp, mouse, pointer, flags, initInput } from './core/input.js';
import { flightSystem } from './systems/flight.js';
import { drawPlane } from './render/plane.js';
import { drawBullet } from './render/ammo.js';
import * as hud from './render/hud.js';
import * as world from './render/world.js';
import * as soldierArt from './render/soldiers.js';
import { theme, applyTheme } from './render/theme.js';
import { audio, beep, boom, sfxOne, sfxSrc, setMuted, isMuted, updateSfx, updateMusic, engineFly,
         engineOff, engineRumble, duck, tickDuck, setRunMusic, prevTrack, nextTrack } from './systems/audio.js';
import * as world3D from './systems/three-world.js';
import { cv, ctx, W, H, HOR, F, PZ, SC, px, panel, U } from './render/ctx.js';
import * as screens from './render/screens.js';
import { PLANES, SHEET_FW, SHEET_FH, SHEET_NF, SHEET_ROWS } from './data/planes.js';
import * as menus from './render/menus.js';
import { MIRA_IDS } from './render/miras.js';
import * as momRender from './render/momentum.js';
import { pitchTarget, applyEnergy, applyDrag, scrapeLimit, speedTarget, windFactor,
         PITCH_LERP, SCRAPE_RECOVER, SCRAPE_LIFT, AFTER_STEP, AFTER_MAX } from './core/physics.js';
import { MSL_MAX, ROLL_DUR, GEAR_T } from './data/tuning.js';
import { RUNWAYS } from './data/runways.js';

  (() => {
    'use strict';
    // ?qa acorta las distancias de mision para que las pruebas automatizadas puedan llegar al
    // MOMENTUM en segundos (tools/smoke.js). Sin el flag no cambia nada: QA_DIST vale 1.
    // Misma idea que el ?no3d de abajo: una costura de prueba, explicita y sin efecto en el juego.
    const QA_DIST = /\bqa\b/.test(location.search) ? 0.06 : 1;

    // three.js vive ahora en systems/three-world.js (resuelve window.THREE y el guard ?no3d por
    // su cuenta). Aca ya no hace falta saber nada de WebGL: el 3D entra por world3D.frame().
    // el canvas, su contexto y las medidas del mundo viven en render/ctx.js (ver el import)
    // la longitud de tierra firme (pista de Puerto Argentino) antes del mar es cfg.coast (ver config)

    // ---------- paleta ----------


    // ====================== CONFIGURACIÓN DE MAPA / NIVELES / MODOS ======================
    // Estilos de agua (malla de puntos). 'sea' = tono Atlántico; 'violet' = neón tipo boostivity.

    // Presets de cielo/fondo.


    // cfg = características ACTIVAS del mapa (las lee el juego). Se editan en vivo con el menú [M]
    // o se cargan desde un nivel de campaña. Base para prototipar niveles.
    // fuelOn: el combustible es el RELOJ del run (mantener la secuencia agarrando bidones).
    // Se puede apagar en el menú [M] (COMBUSTIBLE: NO) para pruebas / vuelo libre.
    // paleta de tierra (turba malvinense). Se vuela A RAS del suelo para atropellar soldados (no es letal).

    function applyCfg() { applyTheme(cfg); }

    // fija el layout de zonas del MOMENTUM segun la clase del buque
    // (MOM_LAYOUTS/SHIP_CLASS se definen mas abajo; esto solo corre al armar un run)
    function useShip(s) { momentum.setLayout(s); return s; }
    function randomShip() { return useShip(SHIPS[Math.floor(Math.random() * SHIPS.length)]); }
    // randomiza el mapa. No toca meters (se setea aparte, para pruebas).
    // SIN USO HOY: el ciclo de muerte pasó a jugar las MISSIONS, que traen su propia cfg. Se deja
    // porque sirve para prototipar mapas y para darle variedad de clima al ciclo si se quiere.
    function randomizeCfg() {
      const skies = Object.keys(SKY_PRESETS), obs = [0.5, 1, 1, 1.7];
      cfg.sky = skies[Math.floor(Math.random() * skies.length)];
      cfg.water = Math.random() < 0.25 ? 'violet' : 'sea';
      cfg.wind = Math.random() < 0.7;
      cfg.obstacles = obs[Math.floor(Math.random() * obs.length)];
      cfg.terrain = Math.random() < 0.4 ? 'land' : 'sea';
      applyCfg();
    }

    // ---------- MODOS ----------
    // 'survival' = el modo actual (infinito, juntar puntos hasta morir).
    // 'campaign' = modo historia: recorre MISSIONS en orden. 'cycle' juega las mismas al azar.
    let gameMode = 'survival';
    let curLevel = 0;
    let modeSel = 0;                 // pantalla inicial: 0 = CAMPAÑA, 1 = CICLO DE MUERTE, 2 = SUPERVIVENCIA
    // el orden DEBE coincidir con `opts` en menus.drawModeSelect: el click traduce la fila tocada
    // a este indice. 'options' = pantalla de ajustes (idioma); 'quit' = fila SALIR.
    const MODES = ['campaign', 'cycle', 'survival', 'options', 'quit'];
    let objectiveDist = 0;           // distancia meta puerto→barcaza (0 = sin objetivo / infinito)
    let objectiveShip = '';          // nombre de la barcaza objetivo del run
    const CAMPAIGN_PLANE = 0;        // avión fijo de campaña (0 = A-4 Skyhawk, protagonista)

    // ---------- TIPOS DE OBJETIVO ----------
    // Un objetivo es ENCHUFABLE: agregar un tipo nuevo (base, convoy, escolta...) es agregar
    // una entrada aca. El resto del flujo de mision — recuento, epilogo, encadenado — no se toca.
    //   needsMomentum: true  → el climax de 3 pasadas sobre el blanco (MOMENTUM)
    //   needsMomentum: false → llegar a la distancia YA cumple la mision (sin climax)
    const GOALS = {
      ship: {
        needsMomentum: true,
        dist: g => g.dist,
        label: g => g.ship,
        setup: g => useShip(g.ship),          // fija el layout de zonas segun la clase del buque
      },
      distance: {
        needsMomentum: false,
        dist: g => g.meters,
        label: g => g.meters + ' m',
        setup: () => { },
      },
    };
    function goalOf(m) { return GOALS[m.goal.kind] || GOALS.ship; }

    function loadLevel(i) {
      curLevel = Math.max(0, Math.min(MISSIONS.length - 1, i));
      Object.assign(cfg, MISSIONS[curLevel].cfg); applyCfg();
    }
    function curMission() { return MISSIONS[curLevel]; }
    // transiciones desde la pantalla inicial de modo
    function goSurvival() { gameMode = 'survival'; cfgOpen = false; cfgRow = 0; setState('menu'); beep(600, 0.08, 'square', 0.05); }
    // CICLO DE MUERTE: las mismas misiones de la campaña, una al azar, sin el guion largo
    function goCycle() { gameMode = 'cycle'; cfgOpen = false; cfgRow = 0; randomMission(); setState('menu'); beep(600, 0.08, 'square', 0.05); }
    // arranca una SECUENCIA de pantallas (clave del guion en STRINGS: 'storyIntro', 'storyL1'…)
    function initStory(key) {
      story = { seq: L()[key] || STRINGS.es[key] || [], si: 0 };
      initStoryScreen();
    }
    // prepara las lineas tipeables de la pantalla actual de la secuencia
    function initStoryScreen() {
      const sc = story.seq[story.si] || {};
      const parts = [];
      if (sc.title) parts.push({ k: 'title', txt: sc.title });
      if (sc.paras) for (const p of sc.paras) parts.push({ k: 'body', txt: p });
      if (sc.level) parts.push({ k: 'level', txt: sc.level });
      if (sc.obj) parts.push({ k: 'obj', txt: sc.obj });
      const lines = [];
      for (const p of parts) {
        const ws = wrapChars(p.txt, p.k === 'title' ? 32 : 52);
        ws.forEach((l, j) => lines.push({ txt: l, k: p.k, last: j === ws.length - 1 }));
      }
      story.lines = lines; story.t = 0; story.typed = 0; story.done = false;
      story.isLevel = !!sc.level;                      // pantalla previa al nivel (va centrada)
    }
    // cuantos caracteres van tipeados a tiempo `tt` (cada char cuesta 1/CPS; pausas al fin de
    // linea y mas largas al fin de parrafo). Devuelve { typed, done }.
    function storyTyped(tt) {
      const CPS = 19;                                  // LENTO: ritmo de teletipo ceremonioso
      let acc = 0, typed = 0;
      for (const ln of story.lines) {
        for (let i = 0; i < ln.txt.length; i++) {
          acc += 1 / CPS;
          if (acc > tt) return { typed, done: false };
          typed++;
        }
        acc += ln.last ? 0.85 : 0.15;
        if (acc > tt) return { typed, done: false };
      }
      return { typed, done: true };
    }

    function startCampaign() {
      gameMode = 'campaign'; selPlane = CAMPAIGN_PLANE; loadLevel(0); reset();
      setRunObjective(); setState(enterMission());
    }
    function confirmMode() {
      const m = MODES[modeSel];
      if (m === 'campaign') startCampaign();
      else if (m === 'cycle') goCycle();
      else if (m === 'options') { setState('options'); beep(600, 0.06, 'square', 0.05); }
      else if (m === 'quit') quitGame();
      else goSurvival();
    }
    /** Cierra el juego. En Electron cierra la ventana (y con ella la app); en el build web
     *  el navegador ignora close() en una pestaña que no abrio un script — por eso vuelve a la
     *  portada, que es lo mas cercano a 'salir' que se puede hacer ahi. */
    function quitGame() {
      beep(300, 0.18, 'square', 0.05, 120);
      try { window.close(); } catch (e) { }
      setTimeout(() => { if (!window.closed) { modeSel = 0; setState('title'); } }, 250);
    }
    // arranca la mision actual por la puerta que corresponda: guion largo (campaña, si lo tiene)
    // o tarjeta corta de briefing (ciclo de muerte). Devuelve el estado al que hay que ir.
    // Las misiones de REGRESO empiezan YA VOLANDO: no hay base de la que despegar, asi que el
    // estado 'takeoff' (cuenta regresiva + carrera + rotacion) no aplica y se entra directo a jugar.
    // El TREN va con la puerta de entrada: si el nivel empieza ya volando, viene recogido de fabrica
    // (nunca hubo pista de la que levantarlo); si hay carrera, baja para el despegue.
    function afterBrief() { run.gear = cfg.start === 'air' ? 0 : 1; return cfg.start === 'air' ? 'play' : 'takeoff'; }
    function enterMission() {
      const m = curMission();
      if (gameMode === 'campaign' && m.story) { initStory(m.story); return 'story'; }
      briefT = 0; return 'brief';
    }
    // elige una mision al azar para el CICLO DE MUERTE (mismas misiones que la campaña)
    function randomMission() { loadLevel(Math.floor(Math.random() * MISSIONS.length)); }
    // define el objetivo del run según el modo (campaña/ciclo: el goal de la mision; supervivencia: infinito)
    // `keepMusic` solo lo pasa el REINTENTO tras un derribo: ahi la musica sigue sonando.
    function setRunObjective(keepMusic) {
      if (gameMode === 'campaign' || gameMode === 'cycle') {
        const m = curMission(), g = goalOf(m);
        objectiveDist = g.dist(m.goal) * QA_DIST;
        objectiveShip = g.label(m.goal);
        g.setup(m.goal);
      }
      else { objectiveDist = 0; objectiveShip = randomShip(); }
      // MUSICA: campaña usa game.mp3; ciclo y supervivencia mantienen la pista elegida en el
      // reproductor (no la re-sortean). Arranca de cero al empezar el mapa, SALVO al reintentar
      // tras morir: ahi continua donde venia, sin corte.
      setRunMusic(gameMode === 'campaign', curLevel, keepMusic);
    }

    // ---------- MENÚ DE CONFIGURACIÓN DE MAPA [M] (herramienta para prototipar niveles) ----------
    const CFG_ROWS = [
      { label: 'METROS', opts: [800, 1500, 3000, 5000, 8000], names: ['800 m', '1500 m', '3000 m', '5000 m', '8000 m'], get: () => cfg.meters, set: v => cfg.meters = v, cycleOnly: true },
      { label: 'FONDO', opts: ['dusk', 'night', 'storm', 'clear', 'cloudy'], names: ['ATARDECER', 'NOCHE', 'TORMENTA', 'DESPEJADO', 'NUBLADO'], get: () => cfg.sky, set: v => { cfg.sky = v; applyCfg(); } },
      // elegir COSTA trae su clima: dia nublado de desembarco (el FONDO se puede cambiar despues)
      { label: 'TERRENO', opts: ['sea', 'land', 'coast'], names: ['MAR', 'TIERRA', 'COSTA'], get: () => cfg.terrain, set: v => { cfg.terrain = v; if (v === 'coast') { cfg.sky = 'cloudy'; applyCfg(); } } },
      { label: 'AGUA', opts: ['sea', 'violet'], names: ['MAR', 'VIOLETA'], get: () => cfg.water, set: v => { cfg.water = v; applyCfg(); } },
      { label: 'VIENTO', opts: [true, false], names: ['SI', 'NO'], get: () => cfg.wind, set: v => cfg.wind = v },
      { label: 'OBSTACULOS', opts: [0, 0.5, 1, 1.7], names: ['NINGUNO', 'POCOS', 'NORMAL', 'MUCHOS'], get: () => cfg.obstacles, set: v => cfg.obstacles = v },
      { label: 'BOMBARDEO', opts: [0, 0.5, 1, 2], names: ['NO', 'POCO', 'NORMAL', 'INTENSO'], get: () => cfg.bombs, set: v => cfg.bombs = v },
      // ENEMIGOS: movimiento propio (globos al viento, helos patrullando, cazas que te buscan,
      // vehiculos rodando, fragatas navegando). QUIETOS = como antes de existir la opcion.
      { label: 'ENEMIGOS', opts: [true, false], names: ['MOVILES', 'QUIETOS'], get: () => cfg.enemyMove, set: v => cfg.enemyMove = v },
      { label: 'COMBUSTIBLE', opts: [true, false], names: ['SI', 'NO'], get: () => cfg.fuelOn, set: v => cfg.fuelOn = v },
      { label: 'ENERGIA', opts: [true, false], names: ['SI', 'NO'], get: () => cfg.energy, set: v => cfg.energy = v },   // altura<->velocidad: para comparar A/B la sensacion
      { label: 'COSTA', opts: [120, 230, 400], names: ['CORTA', 'NORMAL', 'LARGA'], get: () => cfg.coast, set: v => cfg.coast = v },
      // PISTA: el estilo de la base de despegue (ver data/runways.js)
      { label: 'PISTA', opts: RUNWAYS.map((r, i) => i), names: RUNWAYS.map(r => r.name), get: () => cfg.runway, set: v => cfg.runway = v },
      // ACANTILADO: la base sobre una meseta — se sale al vacio en vez de tirar de la palanca.
      // Cambia la altura de arranque, asi que hay que recolocar el avion.
      { label: 'ACANTILADO', opts: [false, true], names: ['NO', 'SI'], get: () => cfg.cliff, set: v => { cfg.cliff = v; resetPlane(); } },
      // ARRANQUE: 'air' = mision de REGRESO, empieza volando y no hay base de la que salir
      { label: 'ARRANQUE', opts: ['runway', 'air'], names: ['PISTA', 'EN VUELO'], get: () => cfg.start, set: v => { cfg.start = v; resetPlane(); } },
      // HITBOXES: overlay de depuracion (verde fluor = letal, celeste = daño, magenta = el avion)
      { label: 'HITBOXES', opts: [false, true], names: ['NO', 'SI'], get: () => cfg.hitboxes, set: v => cfg.hitboxes = v },
      // MODO CAMARA: el mundo avanza a mano (↑↓), camara libre (←→ lateral, R/F altura)
      { label: 'MODO CAMARA', opts: [false, true], names: ['NORMAL', 'LIBRE'], get: () => cfg.devcam, set: v => cfg.devcam = v },
      // MIRA: no es del mapa como las demas, pero el menu [M] es donde el jugador espera
      // encontrarla. `preview` le dice a drawCfg que dibuje la mira de verdad en la fila
      // (un nombre no sirve: hay que VERLA). Persiste, porque es una preferencia del jugador.
      { label: 'MIRA', opts: MIRA_IDS, names: MIRA_IDS.map(String), preview: 'mira',
        get: () => cfg.mira, set: v => { cfg.mira = v; try { localStorage.setItem('rasante_mira', v); } catch (e) { } } },
    ];
    // filas visibles según el modo (METROS solo en ciclo de muerte)
    function getCfgRows() { return CFG_ROWS.filter(r => !r.cycleOnly || gameMode === 'cycle'); }
    let cfgOpen = false, cfgRow = 0;
    function cfgChange(dir) {
      const r = getCfgRows()[cfgRow];
      let i = r.opts.findIndex(o => o === r.get()); if (i < 0) i = 0;
      i = (i + dir + r.opts.length) % r.opts.length;
      r.set(r.opts[i]); beep(560, 0.05, 'square', 0.04);
    }
    // ====================================================================================

    // aviones seleccionables — sprites embebidos como data URI (artifact autocontenido)
    // Cada avion tiene DOS artes: `src` (ilustracion grande, para la pantalla de seleccion) y
    // `sheet` (sprite sheet HORNEADO desde el modelo 3D low-poly: 9 frames de 56x32, alabeo
    // -60..+60 en pasos de 15, frame 4 = nivelado) que es el que VUELA — pixel art coherente
    // con el juego y banking real por frame. Regenerar: npx electron tools/bake_planes_run.js
    let selPlane = 0;



    // ---------- estado ----------
    // DERRIBADO: al morir, primero se ve el avion romperse en pedazos y recien despues sube la
    // pantalla de fin. DEATH_REVEAL es cuanto dura ese show antes de que aparezca "DERRIBADO".
    // 1.5 y no 1.0: los restos siguen de largo con la inercia y rebotan hasta ~1.2 s despues del
    // impacto — cortar en 1.0 dejaba el patinazo a mitad de camino, justo lo que vale la pena ver.
    const DEATH_REVEAL = 1.5;
    // POR LA PATRIA (survival) no tiene par de mision: la corrida entera es el "nivel", asi que las
    // estrellas del derribado se miden contra esto. Es una estimacion — perilla para calibrar jugando.
    const SURVIVAL_PAR = 6000;
    let deathCause, deathT, deadStars = 0, factIdx = 0, best = 0;
    // ilustracion de fin sorteada al terminar (no por cuadro: si no, parpadearia)
    let deadBg = 0, winBg = 0;
    // FONDO GENERAL del lobby/seleccion: arranca SIEMPRE en ppal01.jpg (indice 0) y a los
    // PPAL_ROT segundos empieza a rotar al azar, con un cruce suave de PPAL_FADE.
    const PPAL_ROT = 8, PPAL_FADE = 0.9;
    let ppalIdx = 0, ppalPrev = 0, ppalT = 0, ppalFade = 1;
    const inLobby = () => S.state === 'title' || S.state === 'modeselect' || S.state === 'menu' || S.state === 'options';

    // ESTRELLAS 1..4 (la 4ª = Malvinas, rango S). Compartido por el recuento de nivel y el
    // derribado de survival: exige el DOBLE del par para las Malvinas, que se sientan merecidas.
    const starsFor = (v, par) => v >= par * 2 ? 4 : v >= par * 1.5 ? 3 : v >= par ? 2 : 1;
    // AFTERBURNER SOSTENIDO: aguantar BOOST + RASANTE (bajo) sube de escalón cada AFTER_STEP s;
    // cada escalón multiplica la velocidad y levanta el techo. Romper el estado (soltar turbo o
    // trepar) lo resetea, con una gracia corta para tolerar bobs cortos. afterT=segundos acumulados.
    let tapL = -9, tapR = -9;   // PIRUETA (tonel): doble-tap ←/→
    // CABECEO (solo VISUAL: plane.pitch no afecta el vuelo, solo el sprite y su inclinacion).
    // Calibrado para que la inclinacion aparezca a los 0.50 s de mantener ↑ o ↓ (igual en ambos).
    // DELAY = zona muerta antes de mover la trompa; RAMP = cuanto tarda en llegar a full;
    // VY = peso de la velocidad vertical real — se mantiene >0 para que al soltar el gas y caer la
    // trompa se incline sola, y es bajo para que picar y trepar tarden lo mismo (picar acelera mas
    // rapido, asi que un VY alto adelantaba la picada).
    let story = null;   // pantalla de HISTORIA (campaña): maquina de escribir letra a letra
    let fadeT = 0;      // fundido desde negro al entrar al juego (se dibuja al final de draw)
    let toT = 0, toCount = 4;
    let levelT = 0;   // temporizador de las tarjetas de transición de nivel / victoria (campaña)
    let briefT = 0;   // temporizador de la tarjeta de briefing corto (ciclo de muerte)
    // Los CONTADORES de la corrida viven en core/state.js (`stats`), porque los escriben varios
    // sistemas. Aca queda solo lastRun: la foto POR VALOR que arma freezeRun() al terminar la
    // misión, porque entre niveles de campaña se llama reset() y borraria los contadores.
    let lastRun = null;
    let resT = 0, resRow = 0;   // recuento: tiempo y cuantas filas ya entraron
    const RANKS = ['rank_cadete', 'rank_piloto', 'rank_as', 'rank_halcon'];
    // fraccion de la velocidad de vuelo que conserva el avion durante el MOMENTUM.
    // Subir = mas sensacion de seguir entrando; bajar = mas quieto/ceremonioso.
    // RE-ATAQUE: si la ventana se agota con blancos vivos NO te matan — virás 180° y volvés a
    // entrar. El daño que ya hiciste a las zonas se conserva. El costo es COMBUSTIBLE, que es el
    // reloj del run: podés insistir, pero cada vuelta te acerca a quedarte sin nafta.
    // ENERGIA: altura <-> velocidad. K = cuanta velocidad da picar; DRAG = que tan rapido vuelve
    // al objetivo (mas bajo = conserva mas impulso); MAX = techo sobre el objetivo al picar.
    // RASANTE LETAL: tocar la superficie ya no mata al instante — el avion TAMBALEA y tenes que
    // salir. SCRAPE_BASE son los segundos de gracia a baja velocidad; a mucha velocidad/turbo se
    // reduce hasta SCRAPE_MIN. Salir de la superficie descuenta el reloj, pero no lo borra.
    try { best = +localStorage.getItem('rasante_frontal_best') || 0; } catch (e) { }
    // la mira elegida sobrevive entre sesiones (preferencia del jugador, no del mapa)
    try { const m = +localStorage.getItem('rasante_mira'); if (m >= 1 && m <= MIRA_IDS.length) cfg.mira = m; } catch (e) { }

    function reset() {
      resetRun();       // toda la corrida (velocidad, nafta, rachas, armas, spawn…) a su estado inicial
      resetPlane();     // el avion a la posicion de arranque
      resetStats();     // los contadores del recuento final
      clearWorld();     // vacia el campo de obstaculos, balas, particulas…
      momentum.resetMomentum();
      toT = 0; toCount = 4;
      cam.x = 0; cam.y = 4;
    }

    // (el boton tactil de misil se quito: tapaba la barra de combustible. En tactil el misil
    // queda por el gesto de click derecho / boton del joystick; si hace falta de nuevo, volvera
    // como zona de toque sin chrome encima del HUD.)

    // reproductor de música: visible solo cuando suena una pista del reproductor y se puede cambiar
    // — o sea en juego (no lobby ni historia) y en los modos que no son campaña. Se togglea en el loop.
    const playerEl = document.getElementById('player');
    const canPickMusic = () => gameMode !== 'campaign'
      && S.state !== 'title' && S.state !== 'modeselect' && S.state !== 'menu' && S.state !== 'options' && S.state !== 'story' && S.state !== 'epilogue';

    // ---------- input ----------
    // CAMARAS (tecla V, cicla): 4 niveles de zoom anclados al sprite del avion.
    // camZ interpola suave; el zoom solo se aplica en vuelo (play/takeoff/dead), nunca en momentum
    // (ahi manda la camara cockpit) ni en menus.
    // CAMARA. El acercamiento (1.5x / 2x / 2.5x) quedo DESACTIVADO: escalaba el raster ya dibujado,
    // y el mar se dibuja UNA FILA DE 1 PX por linea de pantalla — al escalar, unas filas caen en
    // 1 px y otras en 2, y las bandas de agua se parten en rayas. Medido sobre una columna del
    // centro: a 1x hay 202 tramos con bandas gruesas (hasta 31 px); a 2x hay 468, de los cuales
    // 428 son de 1 px — el mar queda hecho tiras. Lo mismo, en menor medida, al alejar.
    // Para acercarse de verdad hay que rehacer la PROYECCION (escalar F/HOR y redibujar el mundo
    // a esa escala), no estirar el resultado. Queda como la vista de CABINA en primera persona
    // (ver ROADMAP): esa es la que reemplaza a esta.
    const CAM_ZOOMS = [1];
    let camMode = 0, camZ = 1;
    // el zoom se aplica tanto ACERCANDO (camaras 1.5x-2.5x) como ALEJANDO (turbo): por eso se
    // mira la distancia a 1 y no si es mayor que 1.
    function camZoomOn() { return Math.abs(camZ - 1) > 0.005 && (S.state === 'play' || S.state === 'takeoff' || S.state === 'dead'); }
    // mouse en coordenadas del MUNDO-pantalla: deshace el zoom de la camara cerca para que
    // mira y desproyeccion (balas/misiles) sigan cayendo exactamente bajo el cursor fisico
    function viewMouse() {
      if (!camZoomOn()) return mouse;
      const c = proj(plane.x, plane.y, PZ);
      return { x: c.x + (mouse.x - c.x) / camZ, y: c.y + (mouse.y - c.y) / camZ, on: mouse.on };
    }

    // Cablea el input. core/input.js escucha teclado/mouse/tactil y actualiza inp/mouse/pointer;
    // las ACCIONES semanticas (navegar menu, confirmar, tonel, misil, camara) vuelven aca como
    // callbacks — el estado de menu/camara (modeSel, selPlane, cfgOpen, cfgRow, camMode) vive aca,
    // no en el modulo de input.
    initInput(cv, {
      modeNav: dir => { modeSel = (modeSel + dir + MODES.length) % MODES.length; beep(520, 0.05, 'square', 0.04); },
      confirm: () => confirmMode(),
      // el tap y el menu estan los dos en coordenadas de MUNDO (480x270), asi que no hay
      // conversion. La geometria sale de menus.MODE_ROWS, la misma que usa el dibujo.
      modeSelect: py => {
        const { y0, rh } = menus.MODE_ROWS;
        const row = Math.floor((py - (y0 - rh / 2)) / rh);
        if (row >= 0 && row < MODES.length) { modeSel = row; confirmMode(); }
      },
      escToMenu: () => { setState('modeselect'); cfgOpen = false; beep(400, 0.06, 'square', 0.05); },
      // OPCIONES: por ahora una sola fila (idioma), asi que izquierda/derecha rotan el idioma
      optChange: () => { cycleLang(); beep(560, 0.05, 'square', 0.04); },
      startTitle: () => { if (S.state !== 'title') return; modeSel = 0; setState('modeselect'); beep(620, 0.07, 'square', 0.05); },
      toggleCfg: () => { cfgOpen = !cfgOpen; beep(cfgOpen ? 640 : 400, 0.06, 'square', 0.05); },
      isCfgOpen: () => cfgOpen,
      cfgNav: dir => { const n = getCfgRows().length; cfgRow = (cfgRow + dir + n) % n; beep(500, 0.04, 'square', 0.03); },
      cfgChange: dir => cfgChange(dir),
      cfgClose: () => { cfgOpen = false; },
      planeNav: dir => { selPlane = (selPlane + dir + PLANES.length) % PLANES.length; beep(dir < 0 ? 520 : 600, 0.05, 'square', 0.04); },
      roll: dir => startRoll(dir),
      launchMissile: () => tryLaunchMissile(),
      cycleCamera: () => {
        camMode = (camMode + 1) % CAM_ZOOMS.length;
        beep(440 + camMode * 120, 0.05, 'square', 0.04);
        if (S.state === 'play' || S.state === 'takeoff') popup(W / 2, 58, camMode ? 'CAM ' + CAM_ZOOMS[camMode] + '×' : 'CAM 1×', P.accent);
      },
      // música: tecla 1 / L3 = anterior, tecla 2 / R3 = siguiente. Solo en los modos donde el
      // reproductor está activo — el motor ignora el cambio en historia/lobby.
      trackPrev: () => { if (canPickMusic()) prevTrack(); },
      trackNext: () => { if (canPickMusic()) nextTrack(); },
      // mira del joystick: R1 fija/libera (feedback visual + sonoro)
      aimLock: locked => {
        beep(locked ? 660 : 440, 0.05, 'square', 0.05);
        if (S.state === 'play' || S.state === 'momentum') popup(W / 2, 58, locked ? T('aimFixed') : T('aimFree'), P.accent);
      },
      // throttle del joystick: L1 invierte el eje vertical del stick izquierdo
      throttleInvert: inv => {
        beep(inv ? 660 : 440, 0.05, 'square', 0.05);
        if (S.state === 'play' || S.state === 'momentum') popup(W / 2, 58, inv ? T('thrUp') : T('thrDown'), P.accent);
      },
    });


    const clouds = Array.from({ length: 6 }, () => ({ x: Math.random() * W, y: 8 + Math.random() * 34, w: 24 + Math.random() * 40 }));
    const isles = Array.from({ length: 4 }, (_, i) => ({ x: i * 90 + Math.random() * 50, w: 40 + Math.random() * 70, h: 5 + Math.random() * 10 }));

    // ---------- FONDOS por clima (assets/images/terrain_back, EN PRUEBA) ----------
    // Imagenes 2752x1536 con el horizonte al ~72% de altura: se anclan para que esa linea
    // caiga en HOR (el suelo de la imagen queda bajo el mar/terreno del juego, tapado).
    // Reemplazan al degrade+sol procedurales en 2D y en el telon 3D. Vaciar TBACK en el
    // build web (build_web.py) → vuelve el cielo procedural.
    const TBACK = '../assets/world/terrain_back/';
    const TBACK_MAP = { dusk: 'sunrise.png', night: 'night.png', storm: 'night_storm.png', clear: 'day_argentday.png', cloudy: 'day_cloudy.png' };
    const TBACK_HOR = 0.72;              // fila del horizonte dentro de las imagenes
    const tbackImgs = {};
    function tbackImg() {
      if (!TBACK) return null;
      const f = TBACK_MAP[cfg.sky]; if (!f) return null;
      let im = tbackImgs[f];
      if (!im) {
        im = tbackImgs[f] = new Image();
        im.src = TBACK + f;
        im.onload = () => { world3D.invalidatePalette(); };   // el telon 3D se repinta al cargar
      }
      return (im.complete && im.naturalWidth) ? im : null;
    }


    // ---------- MOMENTUM: asalto final a la barcaza ----------
    // Al acercarse al objetivo el tiempo se ralentiza y se abre un minijuego de punteria:
    // mantener la mira sobre las zonas criticas (que se mueven con el barco) disparando hasta
    // destruirlas, en varias PASADAS a distinta distancia. La ultima pasada (puente) destruye
    // la barcaza y termina el nivel. Si se acaba el tiempo de una pasada, la defensa te derriba.
    // `at`: fraccion de objectiveDist donde arranca la pasada · `scale`: tamano del barco en pantalla
    // `u`: posicion de la zona a lo largo del barco (-1..1) · `v`: altura sobre cubierta (en bloques)
    // `w`: ancho (fraccion del largo) · `h`: alto (en bloques) · `maxHp`: dificultad de la zona

    // geometria del barco en pantalla (se mueve: balanceo + cabeceo → las zonas se mueven con el)
    // APROXIMACION LENTA: dentro de la pasada el barco crece de 0.82× a 0.98× de su escala
    // (deriva lentisima hacia el blanco); entre pasadas el crecimiento lo continua drawApproachBarge.



    // objetivo cumplido → RECUENTO. Congela aca las estadisticas de la mision: entre niveles de
    // campaña se llama reset(), que las borraria.
    function finishObjective() {
      freezeRun();
      setState('results'); levelT = 0; resT = 0; resRow = 0;
      beep(700, 0.15, 'square', 0.06, 1000);
      engineOff();
    }
    // arma lastRun: el desglose de puntos, las estrellas y la calificacion de la mision
    function freezeRun() {
      winBg = (Math.random() * screens.WIN_BG_N) | 0;
      const m = curMission();
      const flight = Math.floor(run.score);
      const kills = stats.air + stats.soldiers + stats.zones;
      const acc = stats.shots ? stats.hits / stats.shots : 0;
      const bKills = kills * 120;
      const bAcc = Math.round(acc * 1000);
      const bRas = stats.bestRas * 300;
      const total = flight + bKills + bAcc + bRas;
      const par = m.par || 8000;
      // La 4ª estrella son las MALVINAS: el rango "S", el tope (ver starsFor). El rango de texto
      // deriva directo de las estrellas (antes habia un bonus por precision aparte que competia):
      // 4 estrellas = HALCON DEL ATLANTICO, el rango maximo.
      const starN = starsFor(total, par);
      lastRun = {
        mission: m, flight, kills, acc, bKills, bAcc, bRas, total, par, stars: starN,
        rank: RANKS[Math.min(RANKS.length - 1, starN - 1)],
        rows: [
          { k: 'res_flight', v: flight },
          { k: 'res_kills', v: bKills, n: kills },
          { k: 'res_acc', v: bAcc, n: Math.round(acc * 100) + '%' },
          { k: 'res_ras', v: bRas, n: stats.bestRas },
        ],
      };
    }


    // PIRUETA (tonel / aileron roll): esquive cinematico con doble-tap ←/→
    function startRoll(dir) {
      if (S.state !== 'play' || run.rollT > 0 || run.rollCd > 0) return;
      run.rollT = ROLL_DUR; run.rollDir = dir; run.rollCd = 1.15;
      sfxOne('waveFly');                        // rafaga de aire de la pirueta
      // ROCE del aire al girar, A VECES. Siempre seria una firma sonora fija y el tonel pasaria a
      // sonar a animacion; que salga aleatorio lo mantiene vivo. Va mas bajo que el roce de verdad:
      // ese es el PREMIO por pasar cerca de algo y no puede confundirse con este adorno.
      if (Math.random() < 0.5) sfxOne('graze', 0.35);
      beep(480, 0.16, 'triangle', 0.05, 900);   // whoosh ascendente
    }

    // lanza un misil del jugador (arma secundaria: limitada, one-shot, con leve guiado)
    function tryLaunchMissile() {
      if (S.state === 'momentum') return momentum.launchMissile(mouse);   // primera persona: misil del momentum
      if (S.state !== 'play' || run.msl <= 0 || run.mslCd > 0) return;
      let tx = plane.x, td = 42;                                  // engancha el blanco aereo mas cercano adelante
      const vm = viewMouse();
      if (vm.on) {
        tx = Math.max(-40, Math.min(40, (vm.x - W / 2) / (F / 110) + cam.x));   // mira con mouse: carril apuntado
      } else for (const o of obstacles) {
        if (o.hp === undefined || o.z <= PZ + 4 || o.z > 220) continue;
        const d = Math.abs(o.x - plane.x);
        if (d < td) { td = d; tx = o.x; }
      }
      pmissiles.push({ x: plane.x, y: plane.y, z: PZ + 4, tx, vy: 0 });   // vy: cae con el vuelo (arco) para lobbear soldados
      run.msl--; run.mslCd = 0.5;
      sfxOne('msl');   // lanzamiento real (misil.mp3 / misil2.wav al azar)
      beep(200, 0.2, 'sawtooth', 0.05, 80); boom(0.05, true);
    }

    function die(cause) {
      setState('dead'); deathCause = cause; deathT = 0;
      // POR LA PATRIA: el derribado ES el fin del "nivel" → estrellas por puntaje. En campaña/ciclo
      // morir es fracaso (no se cumplio el objetivo): sin estrellas.
      deadStars = gameMode === 'survival' ? starsFor(Math.floor(run.score), SURVIVAL_PAR) : 0;
      deadBg = (Math.random() * screens.LOSE_BG_N) | 0;
      sfxOne('exSmall');   // mi avion chocando (agua incluida, por ahora)
      factIdx = (factIdx + 1) % L().facts.length;
      explodeAt(plane.x, plane.y, PZ, true);
      // INERCIA DEL DESASTRE. Un avion a 300 km/h no frena y explota en el lugar: revienta Y
      // SIGUE — los restos y la bola de fuego conservan la velocidad que traia y avanzan varios
      // metros alejandose de la camara mientras caen. `vz` es esa inercia (en unidades de mundo,
      // las mismas de run.spd); el bloque de estado 'dead' del update la integra y la va frenando.
      const spd0 = Math.max(40, run.spd);
      // BOLA DE FUEGO donde revento el avion: la misma que el airburst de las bombas, un poco
      // mas chica (scale). Viaja con los restos: el incendio va donde va el fuselaje.
      obstacles.push({ type: 'airboom', x: plane.x, y: plane.y, z: PZ, boomT: 0, scale: 0.62, done: true, vz: spd0 * 0.5, vy2: plane.y > 3 ? -2 : 0 });
      // PEDAZOS GRANDES en el MUNDO ('chunk'): el motor, media ala, la deriva... Vuelan hacia
      // adelante perdiendo velocidad, la gravedad los baja y rebotan cortos al tocar el suelo.
      // Van en coordenadas de mundo (no de pantalla) justamente para poder ALEJARSE: los `parts`
      // de pantalla no tienen z y por eso el destrozo viejo se quedaba clavado donde murio.
      for (let i = 0; i < 9; i++) {
        obstacles.push({
          type: 'chunk', done: true, chunkT: 0,
          x: plane.x + (Math.random() - 0.5) * 2, y: Math.max(0.5, plane.y + (Math.random() - 0.5) * 1.5), z: PZ,
          vx: (Math.random() - 0.5) * 14, vy: 4 + Math.random() * 14,
          vz: spd0 * (0.45 + Math.random() * 0.45),
          spin: Math.random() * 6.28, vspin: (Math.random() - 0.5) * 14,
          size: 0.5 + Math.random() * 0.9, hot: Math.random() < 0.6,
        });
      }
      const s = proj(plane.x, 0, PZ);
      for (let i = 0; i < 16; i++) parts.push({ x: s.x + (Math.random() - 0.5) * 24, y: s.y, vx: (Math.random() - 0.5) * 40, vy: -40 - Math.random() * 60, life: 0.6, c: P.foam, r: 1.6 });
      // CHISPAS de pantalla del primer impacto: el reventon inmediato alrededor del avion.
      // Menos y mas cortas que antes: el cuerpo del destrozo ahora lo llevan los chunk de mundo.
      const ps = proj(plane.x, plane.y, PZ);
      const CHUNKS = [P.body, P.bodyDark, P.canopy, P.warn, P.dim];
      for (let i = 0; i < 8; i++) {
        const ang = Math.random() * 6.283, sp = 26 + Math.random() * 60;
        parts.push({
          x: ps.x + (Math.random() - 0.5) * 7, y: ps.y + (Math.random() - 0.5) * 5,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 30 - Math.random() * 40,
          life: 0.6 + Math.random() * 0.4, c: CHUNKS[i % CHUNKS.length],
          r: 1.5 + Math.random() * 2.2,
        });
      }
      if (Math.floor(run.score) > best) { best = Math.floor(run.score); try { localStorage.setItem('rasante_frontal_best', best); } catch (e) { } }
      engineOff();
      beep(180, 0.5, 'sawtooth', 0.06, 40);
    }

    // ---------- update ----------
    // update() es el ORQUESTADOR del frame: corre el prelude (tiempo, sonido, camara,
    // maquina de estados) y, si estamos jugando, encadena los tres sistemas en orden.
    // Un sistema devuelve true cuando disparo una transicion (objetivo cumplido o muerte):
    // ahi el frame se corta, igual que hacia el `return` suelto de la version monolitica.
    function update(dt) {
      run.t += dt;
      // rotacion del fondo del lobby (no avanza jugando: solo mientras se elige)
      if (inLobby()) {
        ppalT += dt;
        if (ppalFade < 1) ppalFade = Math.min(1, ppalFade + dt / PPAL_FADE);
        if (ppalT >= PPAL_ROT && screens.PPAL_BG_N > 1) {
          ppalT = 0; ppalPrev = ppalIdx; ppalFade = 0;
          // sortea una DISTINTA a la actual: repetir se leeria como que no cambio
          let k = (Math.random() * (screens.PPAL_BG_N - 1)) | 0;
          ppalIdx = k >= ppalIdx ? k + 1 : k;
        }
      }
      tickDuck(dt);                      // el ducking de la musica se recupera solo
      fadeT = Math.max(0, fadeT - dt);   // fundido desde negro (se pinta al final de draw)
      updateSfx(dt, { state: S.state, cfg, plane, boost: run.boost, firing: inp.fire, overheat: run.overheat, soldiers });   // loops con fade
      // camara CERCA: interpola hacia el objetivo; fuera de vuelo (o al morir) vuelve sola a 1
      // para que cada entrada a play arranque con zoom-in suave y sin saltos entre estados
      const camZt = 1;   // ver CAM_ZOOMS: el zoom por raster quedo desactivado
      camZ += (camZt - camZ) * Math.min(1, dt * 3.5);

      // despegue automático desde Puerto Argentino: el control llega a los 3 s
      if (S.state === 'takeoff') {
        toT += dt;
        const spdBase0 = Math.min(150, 62 + run.t * 2.8);
        run.spd = 6 + spdBase0 * Math.min(1, toT / 2.0);
        run.dist += run.spd * dt;
        // ACANTILADO: no hay rotacion ni ascenso — el avion ya esta arriba y lo que sigue es el
        // vacio. Sin acantilado, la carrera termina en el clasico tirar de la palanca.
        if (!cfg.cliff && toT > 1.35 && plane.y < 12) plane.y += 7.2 * dt;   // rotación y ascenso
        // TREN ARRIBA apenas despega. La señal es haber dejado el piso; con ACANTILADO no hay
        // rotacion (el avion ya esta en alto y lo que sigue es el vacio), asi que ahi manda el
        // reloj: se recoge al pasar el borde.
        if (cfg.cliff ? toT > 1.7 : plane.y > 1.2) run.gear = Math.max(0, run.gear - dt / GEAR_T);
        cam.x += (plane.x * 0.86 - cam.x) * Math.min(1, dt * 7);
        cam.y += (plane.y + 2.6 - cam.y) * Math.min(1, dt * 7);
        if (cam.y < 3.4) cam.y = 3.4;
        // polvo del carreteo
        if (plane.y < 2.5 && Math.random() < 0.6) {
          const s = proj(plane.x + (Math.random() - 0.5) * 3, 0, PZ - Math.random() * 1.5);
          parts.push({ x: s.x, y: s.y - 1, vx: (Math.random() - 0.5) * 30, vy: -(15 + Math.random() * 25), life: 0.4, c: '#6b6f62', r: 1.2 });
        }
        const cn = 3 - Math.floor(toT);
        if (cn !== toCount && cn >= 0) { toCount = cn; beep(cn > 0 ? 520 : 980, 0.14, 'square', 0.06); }
        engineFly(run.spd, false, 0.017 * Math.min(1, toT));
        if (toT >= 3) { setState('play'); popup(W / 2, 54, T('freeControl'), P.accent); run.shake = Math.min(6, run.shake + 1); }
        parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
        prune(parts, p => p.life > 0);
        popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
        prune(popups, p => p.life > 0);
        run.shake = Math.max(0, run.shake - dt * 10);
        flags.anyPress = false;
        return;
      }

      if (S.state !== 'play') {
        if (S.state === 'dead') deathT += dt;
        if (S.state === 'victory') levelT += dt;
        parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
        prune(parts, p => p.life > 0);
        // las explosiones siguen VIVAS fuera de 'play' (su reloj lo lleva collisionSystem, que
        // aca no corre): sin esto la bola de fuego del derribado quedaria congelada en el frame 0
        for (const o of obstacles) {
          if (o.type === 'airboom' || o.type === 'boom') o.boomT += dt;
          // INERCIA del derribo (ver die): la bola de fuego viaja hacia adelante frenando
          if (o.vz && o.type !== 'chunk') { o.z += o.vz * dt; o.vz *= Math.max(0, 1 - dt * 1.3); if (o.vy2) o.y = Math.max(0.5, o.y + o.vy2 * dt); }
          if (o.type === 'chunk') {
            // pedazo del avion: sigue de largo (vz), cae (gravedad) y rebota corto en el suelo.
            // El arrastre del aire le come la inercia; despues de un par de rebotes queda tirado.
            o.chunkT += dt;
            o.z += o.vz * dt; o.x += o.vx * dt; o.y += o.vy * dt;
            o.vy -= 30 * dt; o.vz *= Math.max(0, 1 - dt * 0.75); o.spin += o.vspin * dt;
            if (o.y <= 0) {
              o.y = 0; o.vy = -o.vy * 0.32; o.vz *= 0.6; o.vx *= 0.6; o.vspin *= 0.5;
              // salpicon/polvo del rebote, proyectado donde toco
              const bs = proj(o.x, 0, o.z);
              for (let i = 0; i < 3; i++) parts.push({ x: bs.x + (Math.random() - 0.5) * 4, y: bs.y, vx: (Math.random() - 0.5) * 26, vy: -20 - Math.random() * 26, life: 0.4, c: cfg.terrain === 'sea' ? P.foam : '#6b6f62', r: 1.2 });
            }
            // HUMO: los pedazos calientes van dejando un hilito que sube
            if (o.hot && Math.random() < 0.5) {
              const hs = proj(o.x, o.y, o.z);
              parts.push({ x: hs.x, y: hs.y, vx: (Math.random() - 0.5) * 6, vy: -8 - Math.random() * 10, life: 0.5, c: '#5a5a52', r: Math.max(1, hs.k * 0.16) });
            }
          }
        }
        prune(obstacles, o => !((o.type === 'airboom' || o.type === 'boom') && o.boomT > 6) && !(o.type === 'chunk' && (o.chunkT > 4.5 || o.z > 235)));
        engineOff();
        if (S.state === 'momentum') {
          run.shake = Math.max(0, run.shake - dt * 10);
          const sig = momentum.update(dt, inp, mouse, objectiveDist);   // señal de salida: no llama hacia arriba
          if (sig === 'objective') finishObjective();
          else if (sig && sig.death) die(sig.death);
          flags.startReq = false; flags.anyPress = false;
          return;
        }
        if (S.state === 'story') {
          // HISTORIA: tipeo letra a letra con tick de maquina de escribir; una tecla/tap
          // completa el texto, y con el texto completo la siguiente arranca el despegue con FADE
          story.t += dt;
          const st = storyTyped(story.t);
          if (st.typed > story.typed && !isMuted()) beep(1300 + Math.random() * 1100, 0.014, 'square', 0.013);
          story.typed = st.typed; story.done = st.done;
          // gracia de 0.4s: el tap/tecla que confirmo CAMPAÑA en el menu no debe saltear el tipeo
          if (flags.anyPress && story.t > 0.4) {
            if (!story.done) { story.t += 999; }                          // completar de un saque
            else if (story.si + 1 < story.seq.length) {                   // → siguiente pantalla de la secuencia
              story.si++; initStoryScreen(); beep(500, 0.05, 'square', 0.04);
            } else { run.t = 0; fadeT = 1.4; setState(afterBrief()); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
          }
        } else if (S.state === 'brief') {
          // tarjeta corta de mision (ciclo de muerte, y campaña sin guion): una tecla despega
          briefT += dt;
          if (briefT > 0.6 && flags.anyPress) { run.t = 0; fadeT = 1.0; setState(afterBrief()); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
        } else if (S.state === 'menu') {
          // el menú lo comparten SUPERVIVENCIA y CICLO DE MUERTE
          if (flags.startReq) {
            reset(); setRunObjective();
            // ciclo: pasa por el briefing corto de la mision; supervivencia: derecho al despegue
            if (gameMode === 'cycle') { briefT = 0; setState('brief'); beep(600, 0.08, 'square', 0.05); }
            else { setState(afterBrief()); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
          }
        } else if (S.state === 'dead') {
          // solo se puede reintentar una vez que subio la pantalla (paso el show del destrozo)
          // reintenta (mismo modo/nivel). La musica NO se reinicia: sigue desde donde venia.
          if (deathT > DEATH_REVEAL && flags.anyPress) { reset(); setRunObjective(true); setState(afterBrief()); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
        } else if (S.state === 'results') {
          // RECUENTO: las filas entran de a una; una tecla las completa de golpe, la siguiente pasa al epilogo
          resT += dt;
          const nRows = lastRun ? lastRun.rows.length : 0;
          const want = Math.min(nRows, Math.floor(resT / 0.45));
          if (want > resRow) { resRow = want; beep(760 + resRow * 90, 0.07, 'square', 0.05); }
          const full = resRow >= nRows && resT > nRows * 0.45 + 0.7;
          if (flags.anyPress && resT > 0.5) {
            if (!full) { resT = nRows * 0.45 + 0.8; resRow = nRows; }   // completar de un saque
            else { initStory(lastRun.mission.epi); setState('epilogue'); beep(500, 0.05, 'square', 0.04); }
          }
        } else if (S.state === 'epilogue') {
          // EPILOGO: reusa el motor de tipeo de la historia; al terminar, encadena segun el modo
          story.t += dt;
          const st = storyTyped(story.t);
          if (st.typed > story.typed && !isMuted()) beep(1300 + Math.random() * 1100, 0.014, 'square', 0.013);
          story.typed = st.typed; story.done = st.done;
          if (flags.anyPress && story.t > 0.4) {
            if (!story.done) { story.t += 999; }
            else if (story.si + 1 < story.seq.length) { story.si++; initStoryScreen(); beep(500, 0.05, 'square', 0.04); }
            else if (gameMode === 'campaign') {
              // campaña: siguiente mision (conservando el puntaje acumulado) o victoria si era la ultima
              if (curLevel + 1 < MISSIONS.length) {
                const keep = run.score; loadLevel(curLevel + 1); reset(); run.score = keep;
                setRunObjective(); setState(enterMission());
              } else { setState('victory'); levelT = 0; }
            } else {
              // ciclo de muerte: otra mision al azar, desde cero
              randomMission(); reset(); setRunObjective(); briefT = 0; setState('brief');
            }
          }
        } else if (S.state === 'victory') {
          if (levelT > 0.8 && flags.anyPress) { setState('modeselect'); }
        }
        flags.startReq = false; flags.anyPress = false;
        return;
      }
      flags.anyPress = false;

      // el tren termina de plegarse ya en vuelo: el despegue lo empieza pero dura 3 s justos y la
      // maniobra es mas larga, asi que si no se cerrara aca quedaria a medio recoger para siempre
      if (run.gear > 0) run.gear = Math.max(0, run.gear - dt / GEAR_T);

      // ---------- MODO CAMARA (cfg.devcam) ----------
      // El mundo queda QUIETO: no corren vuelo, spawn ni colisiones — solo lo que ya esta en
      // pantalla, congelado. El desarrollador mueve el escenario y la camara:
      //   ↑ / ↓   avanzar / retroceder por el mapa (scroll manual de run.dist)
      //   ← / →   camara de costado          R / F   camara mas arriba / mas abajo
      //   TURBO   todo x4
      // El avion no se mueve (queda como referencia de escala en su carril). Al volver a NORMAL
      // la partida sigue donde estaba — nada se destruyo, solo no avanzo.
      if (cfg.devcam) {
        const f = inp.turbo ? 4 : 1;
        const adv = (inp.u ? 55 * f : 0) - (inp.d ? 55 * f : 0);
        run.dist = Math.max(0, run.dist + adv * dt);
        // El MUNDO corre al paso del desarrollador: spawn y colisiones leen run.spd para acercar
        // lo que ya existe y sembrar lo nuevo — con ↑ sostenido el mapa fluye como en juego, y
        // frenado queda quieto pero VIVO (el AA dispara, las bombas caen, las banderas flamean).
        run.spd = Math.max(0, adv);
        cam.x += (inp.r - inp.l) * 30 * f * dt;
        cam.y = Math.max(1.2, Math.min(90, cam.y + (inp.rise - inp.sink) * 22 * f * dt));
        run.shake = Math.max(0, run.shake - dt * 10);
        spawnSystem(dt);
        // el mundo entero corre, pero la señal de muerte se DESCARTA: en este modo el avion es
        // inmortal y de la partida solo se sale con ESCAPE (ver core/input.js). El vuelo
        // (flightSystem) NO corre: el avion queda quieto como referencia, no cae ni gasta nafta.
        collisionSystem(dt);
        parts.forEach(p2 => { p2.x += p2.vx * dt; p2.y += p2.vy * dt; p2.vy += 90 * dt; p2.life -= dt; });
        prune(parts, p2 => p2.life > 0);
        popups.forEach(p2 => { p2.y -= 14 * dt; p2.life -= dt; });
        prune(popups, p2 => p2.life > 0);
        engineOff();
        return;
      }

      // needsMomentum: si el objetivo del run culmina en el climax (barco) o con solo llegar (distancia)
      const needsMomentum = (gameMode === 'campaign' || gameMode === 'cycle') ? goalOf(curMission()).needsMomentum : true;
      const fs = flightSystem(dt, { viewMouse, launchMissile: tryLaunchMissile, objectiveDist, needsMomentum });
      if (fs === 'momentum') return;                 // ya entro al climax
      if (fs === 'objective') { finishObjective(); return; }
      if (fs && fs.death) { die(fs.death); return; }
      spawnSystem(dt);                   // aparicion de obstaculos y soldados (nunca corta el frame)
      const hit = collisionSystem(dt);   // impactos → devuelve { death } si un choque fue fatal
      if (hit) { die(hit.death); return; }
      // líneas de velocidad
      if (run.boost || run.rasLevel > 0 || run.spd > 115) {
        const n = (run.boost ? 3 : 1) + run.rasLevel + run.afterTier;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.283;
          streaks.push({ a, r: 26 + Math.random() * 20, v: 240 + Math.random() * 160, life: 0.5 });
        }
      }
      streaks.forEach(s => { s.r += s.v * dt; s.life -= dt; });
      prune(streaks, s => s.life > 0 && s.r < 260);

      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
      prune(parts, p => p.life > 0);
      popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
      prune(popups, p => p.life > 0);
      run.shake = Math.max(0, run.shake - dt * 10);
      run.bloodSplat = Math.max(0, run.bloodSplat - dt * 0.3);   // la mancha de sangre se desvanece (~3 s)
      if (run.boost) run.shake = Math.max(run.shake, 0.8 + (plane.y < 5 ? 0.7 : 0));

      engineFly(run.spd, run.boost, run.boost ? 0.030 : 0.017);
      if (run.fuel <= 0 && Math.random() < 0.05) beep(90, 0.08, 'sawtooth', 0.03);
    }

    // ---------- render ----------

    function draw() {
      ctx.setTransform(SC, 0, 0, SC, 0, 0);   // buffer 2×: todo el dibujo sigue en coords 320×180
      const sx = (Math.random() - 0.5) * run.shake, sy = (Math.random() - 0.5) * run.shake;
      const cm = momentum.cam();
      ctx.save(); ctx.translate(Math.round(sx) - cm.x, Math.round(sy) - cm.y);   // momentum: el mundo se mueve, la mira no
      // ALABEO (momentum): el MUNDO ENTERO (horizonte, mar Y BARCO) gira -mom.roll alrededor
      // del centro — el avion rola sobre su eje longitudinal y la cabina queda fija.
      // drawMomentum deshace esta rotacion recien al dibujar cabina/mira/letterbox.
      const momA = momentum.active();
      if (S.state === 'momentum' && momA) {
        const rcx = W / 2 + cm.x, rcy = H / 2 + cm.y;
        ctx.translate(rcx, rcy); ctx.rotate(-momA.roll); ctx.translate(-rcx, -rcy);
      }
      // CAMARA CERCA (V): magnifica el mundo entero (avion incluido) anclado al sprite.
      // Zoom-in siempre muestra un SUBCONJUNTO de la pantalla ya pintada: no descubre bordes.
      // Se deshace antes del HUD (el HUD no se agranda).
      const zoomOn = camZoomOn();
      if (zoomOn) {
        const zc = proj(plane.x, plane.y, PZ);
        ctx.save();
        ctx.translate(zc.x, zc.y); ctx.scale(camZ, camZ); ctx.translate(-zc.x, -zc.y);
      }
      // MUNDO 3D (three.js): en MOMENTUM el fondo completo (cielo+mar+BARCO, flag MOM3D.on);
      // en vuelo normal sobre mar abierto solo cielo+mar (flag MOM3D.sea). El blit va DENTRO
      // de los transforms (roll/paneo/zoom/shake le pegan al 3D); la capa 2D va encima.
      // Sin THREE/WebGL o con ?no3d, ambas flags quedan false y pinta el 2D de siempre.
      world3D.frame({ state: S.state, mom: momentum.active(), dist: run.dist, momDrift: momentum.drift(), cfg, cam, t: run.t, SKY: theme.sky, WATER: theme.water, objectiveShip, seaH: world.seaH, momShipGeom: momentum.shipGeom, tbackImg });
      if (world3D.isOn() || world3D.isSea()) {
        const sm = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(world3D.view(), -108, -153, world3D.M3W, world3D.M3H);
        ctx.imageSmoothingEnabled = sm;
      }

      if (!world3D.isOn()) {   // ---- mundo 2D: en momentum-3D todo este bloque lo reemplaza el blit de arriba ----
      // cielo y sol 2D: en mar-abierto-3D los pone three (nubes/islas siguen 2D encima)
      const tbA = tbackImg();                  // imagen de fondo del clima (si esta cargada)
      const tb2 = world3D.isSea() ? null : tbA;      // en mar-3D la pinta el telon de three
      if (!world3D.isSea()) {
      if (tb2) {
        // FONDO por clima: cover con el horizonte de la imagen clavado en HOR (trae su propio
        // sol) + parallax suave (x0.8) para que el telon tambien respire
        const dw = W + 140, dh = dw * tb2.naturalHeight / tb2.naturalWidth;
        ctx.fillStyle = '#0a1014'; ctx.fillRect(-70, -140, dw, HOR + 144);   // margen sobre la imagen
        ctx.drawImage(tb2, -70 - cam.x * 0.8, HOR - TBACK_HOR * dh, dw, dh);
      } else {
      const g = ctx.createLinearGradient(0, 0, 0, HOR);
      g.addColorStop(0, theme.sky.skyTop); g.addColorStop(0.6, theme.sky.skyMid); g.addColorStop(1, theme.sky.horizon);
      ctx.fillStyle = g; ctx.fillRect(-70, -140, W + 140, HOR + 144);   // margenes: paneo + rolls completos del momentum
      ctx.globalAlpha = 0.4; px(-70, HOR - 10, W + 140, 10, theme.sky.sunGlow); ctx.globalAlpha = 1;
      // sol bajo
      const sunX = W / 2 - cam.x * 1.4;
      px(sunX - 7, HOR - 11, 14, 8, theme.sky.sun);
      ctx.globalAlpha = 0.35; px(sunX - 10, HOR - 13, 20, 12, theme.sky.sunGlow); ctx.globalAlpha = 1;
      }
      }
      // nubes
      for (const c of clouds) {
        const cx = ((c.x - cam.x * 2.2 - run.t * 2) % (W + 80) + W + 80) % (W + 80) - 40;
        px(cx, c.y, c.w, 3, P.cloud); px(cx + 5, c.y - 2, c.w * 0.5, 2, P.cloud);
      }
      // islas en el horizonte: SIEMPRE (el parallax de estas montañas es la vida del fondo;
      // la imagen de clima queda detras como relleno)
      for (const is of isles) {
        const ix = ((is.x - cam.x * 3.5) % (W + 160) + W + 160) % (W + 160) - 80;
        ctx.fillStyle = P.island;
        ctx.beginPath();
        ctx.moveTo(ix, HOR + 1); ctx.lineTo(ix + is.w * 0.35, HOR + 1 - is.h); ctx.lineTo(ix + is.w * 0.7, HOR + 1 - is.h * 0.5); ctx.lineTo(ix + is.w, HOR + 1);
        ctx.fill();
      }

      if (!world3D.isSea()) world.drawSea();   // el mar 2D solo cuando three no lo esta poniendo
      // en momentum el mundo rota (alabeo): rellena bajo el mar para que un tonel no muestre huecos
      if (S.state === 'momentum') px(-70, H, W + 140, 150, cfg.terrain === 'land' ? LAND.near : theme.water.base2);
      world.drawApproachBarge(objectiveDist, objectiveShip);   // la barcaza objetivo creciendo en el horizonte
      world.drawObjectiveMarker(objectiveDist);                // cuña roja en el horizonte: hacia donde vamos
      world.drawWake();
      if (cfg.hitboxes) world.drawHitboxes();   // depuracion: cajas de colision en verde fluor
      if (cfg.devcam && S.state === 'play') world.drawFlightLane();   // modo camara: el carril del avion

      // ráfagas de viento
      ctx.globalAlpha = 0.35;
      for (const g2 of gusts) {
        px(g2.x, g2.y, g2.len, 1, P.crest);
        px(g2.x + 3, g2.y + 1, g2.len * 0.5, 1, P.dim);
      }
      ctx.globalAlpha = 1;

      // soldados en tierra (de lejos a cerca), corriendo — tierra y costa
      if (cfg.terrain === 'land' || cfg.terrain === 'coast') {
        const sold = soldiers.slice().sort((a, b) => b.z - a.z);
        for (const sd of sold) {
          if (sd.z <= 3 || sd.dead) continue;
          const s = proj(sd.x, 0, sd.z);
          // HOJA de sprites si ya cargo; si no, el soldado dibujado a mano (ver render/soldiers.js)
          if (sd.prone > 0) {
            if (soldierArt.isReady()) soldierArt.drawProne(ctx, s.x, s.y, s.k, sd.dir);
            else world.drawSoldierProne(s.x, s.y, s.k, sd.dir);
            continue;
          }
          if (soldierArt.isReady()) soldierArt.drawRunBack(ctx, s.x, s.y, s.k, run.t * 11 + sd.ph, sd.dir);
          else world.drawSoldier(s.x, s.y, s.k, Math.sin(run.t * 12 + sd.ph));
        }
      }

      // obstáculos de lejos a cerca
      const all = obstacles.slice().sort((a, b) => b.z - a.z);
      for (const o of all) if (o.z > 3) world.drawObstacle(o);

      // misiles (y trazadoras del fuego de tierra: mas chicas, amarillas y con cola corta)
      for (const m of missiles) {
        if (m.z <= 3) continue;
        const s = proj(m.x, m.y, m.z), k = s.k;
        if (m.tracer) {
          const s2 = proj(m.x, m.y, m.z + 5);
          ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.55;
          ctx.beginPath(); ctx.moveTo(s2.x, s2.y); ctx.lineTo(s.x, s.y); ctx.stroke();
          ctx.globalAlpha = 1;
          px(s.x - 0.5 * k, s.y - 0.5 * k, k, k, '#ffd98a');
        } else {
          px(s.x - 0.8 * k, s.y - 0.8 * k, 1.6 * k, 1.6 * k, P.ink);
          px(s.x - 0.4 * k, s.y + 0.8 * k, 0.8 * k, Math.max(1, 1.2 * k), P.accent);
        }
      }
      // balas (trazadoras hacia el horizonte) — ver render/ammo.js
      for (const b of bullets) {
        if (b.z >= 240) continue;
        drawBullet(b);
      }
      // misiles del jugador (más gruesos, con estela)
      for (const pm of pmissiles) {
        if (pm.z >= 240 || pm.z <= 3) continue;
        const s = proj(pm.x, pm.y, pm.z), k = s.k;
        // MISIL estilo Exocet: cuerpo BLANCO LARGO con ojiva gris, aletas en cruz y llama corta.
        // Antes eran dos cuadraditos y una linea naranja — no se leia como un misil.
        const w = Math.max(1, k * 0.5);              // ancho del cuerpo
        const L = Math.max(3, k * 3.2);              // largo: se ve como un tubo, no como un punto
        const x0 = s.x - w / 2, yTip = s.y - L / 2;
        px(x0, yTip + L * 0.18, w, L * 0.82, '#e9edf0');                      // cuerpo blanco
        px(x0, yTip + L * 0.18, Math.max(1, w * 0.4), L * 0.82, '#ffffff');   // brillo del canto
        px(x0, yTip, w, L * 0.2, '#9aa3ab');                                  // OJIVA gris
        px(x0, yTip + L * 0.42, w, Math.max(1, L * 0.06), '#3d444a');         // banda oscura
        const fw = Math.max(1, k * 0.45);                                     // ALETAS traseras
        px(x0 - fw, yTip + L * 0.72, fw, Math.max(1, L * 0.2), '#c9d0d6');
        px(x0 + w, yTip + L * 0.72, fw, Math.max(1, L * 0.2), '#c9d0d6');
        // LLAMA del cohete: nucleo claro que se afina, con parpadeo
        const fl = L * (0.3 + Math.random() * 0.25);
        px(x0, yTip + L, w, fl, '#ffd479');
        px(x0 + w * 0.25, yTip + L, Math.max(1, w * 0.5), fl * 0.6, '#fff3cf');
        px(x0 + w * 0.25, yTip + L + fl, Math.max(1, w * 0.5), fl * 0.5, '#e8842a');
        // ESTELA de humo: puntos que se van apagando hacia atras (sin lineas vectoriales)
        for (let t = 1; t <= 4; t++) {
          ctx.globalAlpha = 0.34 - t * 0.07;
          const st = proj(pm.x, pm.y, pm.z - t * 3.5);
          px(st.x - w * 0.5, st.y, Math.max(1, w), Math.max(1, w), '#c8cfd4');
        }
        ctx.globalAlpha = 1;
      }
      }   // ---- fin mundo 2D ----

      if (S.state !== 'dead' && S.state !== 'momentum') drawPlane(selPlane, viewMouse);   // en momentum va la camara cockpit (drawCockpit)

      // líneas de velocidad
      ctx.globalAlpha = 0.5;
      for (const s of streaks) {
        const x1 = W / 2 + Math.cos(s.a) * s.r, y1 = HOR - 4 + Math.sin(s.a) * s.r * 0.62;
        const x2 = W / 2 + Math.cos(s.a) * (s.r + 9), y2 = HOR - 4 + Math.sin(s.a) * (s.r + 9) * 0.62;
        ctx.strokeStyle = P.foam;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // en momentum, particulas y popups los dibuja drawMomentum (nivelados, sobre el barco);
      // dibujarlos tambien aca dejaria una copia fantasma (el mundo del momentum va rotado por el alabeo)
      if (S.state !== 'momentum') {
        for (const p of parts) { ctx.globalAlpha = Math.min(1, p.life * 2); px(p.x, p.y, p.r, p.r, p.c); }
        ctx.globalAlpha = 1;

        ctx.textAlign = 'center';
        for (const p of popups) {
          // los `big` son los premios de RIESGO (roce, pirueta): van en negrita y mas grandes
          // para que el numero se lea de reojo, sin apartar la vista de lo que viene
          ctx.font = p.big ? 'bold 10px monospace' : '7px monospace';
          ctx.globalAlpha = Math.min(1, p.life); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y);
        }
        ctx.globalAlpha = 1;
      }

      if (zoomOn) ctx.restore();   // el HUD (y la capa momentum) van SIN zoom
      // HUD en GRILLA DE DISEÑO (320x180): se dibuja con ctx.scale(U). Ver la nota de DW/DH en
      // render/ctx.js — U x SC da 3 exacto, asi que no hay medio pixel ni borroneo.
      if (S.state === 'play') { ctx.save(); ctx.scale(U, U); hud.drawHUD({ best, gameMode, curLevel, objectiveDist, objectiveShip }); ctx.restore(); }
      if (S.state === 'momentum' && momentum.active()) momRender.drawMomentum({
        mom: momentum.active(), momPhase: momentum.phase(), phases: momentum.phases(), msl: run.msl, objectiveShip, t: run.t,
        is3D: world3D.isOn(), parts, popups, mouse,
        momCam: momentum.cam, momShipGeom: momentum.shipGeom, momZoneRect: momentum.zoneRect });
      ctx.restore();

      // MENUS Y PANTALLAS: tambien en grilla de diseño (320x180), escaladas por U
      ctx.save(); ctx.scale(U, U);
      if (inLobby()) screens.drawPpalBg(ppalPrev, ppalIdx, ppalFade);   // portada / lobby
      if (S.state === 'takeoff') hud.drawTakeoff(toT);
      if (S.state === 'menu') {
        menus.drawMenu({ selPlane, gameMode, t: run.t });
        // el clamp de cfgRow vivia DENTRO de drawCfg (una pantalla no deberia mutar estado):
        // ahora se hace aca, antes de dibujar
        if (cfgOpen) { const rows = getCfgRows(); if (cfgRow >= rows.length) cfgRow = 0; menus.drawCfg({ rows, cfgRow }); }
      }
      // DERRIBADO: esperar a que se vea el destrozo; despues la pantalla sube con un fade corto
      if (S.state === 'dead' && deathT > DEATH_REVEAL)
        screens.drawDead({ score: run.score, best, deathCause, deathT, factIdx, t: run.t,
          reveal: Math.min(1, (deathT - DEATH_REVEAL) / 0.35), stars: deadStars, awardT: deathT - DEATH_REVEAL - 0.2, bg: deadBg });
      if (S.state === 'results') screens.drawResults({ lastRun, resRow, resT, t: run.t, bg: winBg });
      if (S.state === 'brief') screens.drawBrief({ mission: curMission(), goalLabel: goalOf(curMission()).label(curMission().goal), briefT, t: run.t });
      if (S.state === 'victory') screens.drawVictory({ score: run.score, levelT, t: run.t });
      if ((S.state === 'epilogue' || S.state === 'story') && story) screens.drawStory({ story, state: S.state, t: run.t });
      ctx.restore();
      // PORTADA y MODOS van en coordenadas NATIVAS (fuera del scale): mas pixeles por letra.
      // El fondo (drawPpalBg) si va escalado — es la grilla de diseño y cubre toda la pantalla.
      if (S.state === 'title') menus.drawTitle({ t: run.t });
      if (S.state === 'modeselect') menus.drawModeSelect({ modeSel, t: run.t });
      if (S.state === 'options') menus.drawOptions({ t: run.t });

      // fundido desde negro (al salir de la historia hacia el despegue) — SIEMPRE al final
      if (fadeT > 0) {
        ctx.globalAlpha = Math.min(1, fadeT / 1.4);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    }


    // (la vieja pantalla de "barcaza destruida" la absorbio el RECUENTO: ver drawResults)

    // MOMENTUM — camara 3/4 chase: el avion se ve GRANDE y pegado a camara (abajo-izq),
    // como si la camara volara detras y al costado. Devuelve la punta de la trompa (origen de la trazadora).
    // (Una side-camera pura necesitaria sprite de perfil: anotado en docs/UPDATE_ANIMATIONS.md.)
    // ---- camara DESDE ADENTRO (cockpit) para el MOMENTUM ----
    // Asset configurable: imagen con la MISMA proporcion que la pantalla (320×180; ideal 640×360 para
    // nitidez 2×) con el CENTRO TRANSPARENTE (el vidrio) y pintados los parantes de la cabina y el panel
    // de instrumentos. Embeber como data URI en `src` (igual que los aviones). Mientras este vacio se
    // dibuja un placeholder por codigo. Pedido en docs/UPDATE_ANIMATIONS.md.












    // ---------- loop ----------
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      update(dt); draw(); updateMusic(S.state);
      if (playerEl) playerEl.classList.toggle('on', canPickMusic());   // reproductor: solo donde hay pista cambiable
      requestAnimationFrame(frame);
    }
    applyChrome();
    reset();
    requestAnimationFrame(frame);
  })();
