// RASANTE — entry point. Los modulos de datos se bundlean con esbuild (npm run build:game);
// hace falta bundlear porque Electron carga por file://, donde Chromium bloquea los ES modules.
import { STRINGS } from './data/strings.js';
import { P, WATER_STYLES, SKY_PRESETS, LAND } from './data/palette.js';
import { MOM_LAYOUTS, SHIP_CLASS } from './data/ships.js';
import { SHIPS, MISSIONS } from './data/missions.js';
import { L, T, getLang, cycleLang, applyChrome } from './core/i18n.js';
import { wrapChars, multOf } from './core/util.js';
import { audio, beep, boom, sfxOne, sfxSrc, setMuted, isMuted, updateSfx, updateMusic, engineFly,
         engineOff, engineRumble, duck, tickDuck, pickRunTrack } from './systems/audio.js';
import * as world3D from './systems/three-world.js';

  (() => {
    'use strict';
    // three.js vive ahora en systems/three-world.js (resuelve window.THREE y el guard ?no3d por
    // su cuenta). Aca ya no hace falta saber nada de WebGL: el 3D entra por world3D.frame().
    const cv = document.getElementById('g');
    const ctx = cv.getContext('2d');
    const W = 320, H = 180, HOR = 64, F = 90, PZ = 14;
    const SC = 2; cv.width = W * SC; cv.height = H * SC;   // buffer 2× (se dibuja en coords 320×180): texto/arte más nítidos
    // la longitud de tierra firme (pista de Puerto Argentino) antes del mar es cfg.coast (ver config)

    // ---------- paleta ----------


    // ====================== CONFIGURACIÓN DE MAPA / NIVELES / MODOS ======================
    // Estilos de agua (malla de puntos). 'sea' = tono Atlántico; 'violet' = neón tipo boostivity.

    // Presets de cielo/fondo.


    // cfg = características ACTIVAS del mapa (las lee el juego). Se editan en vivo con el menú [M]
    // o se cargan desde un nivel de campaña. Base para prototipar niveles.
    // fuelOn: el combustible es el RELOJ del run (mantener la secuencia agarrando bidones).
    // Se puede apagar en el menú [M] (COMBUSTIBLE: NO) para pruebas / vuelo libre.
    const cfg = { sky: 'dusk', water: 'sea', terrain: 'sea', wind: true, obstacles: 1, coast: 230, meters: 3000, fuelOn: true, energy: true };
    // paleta de tierra (turba malvinense). Se vuela A RAS del suelo para atropellar soldados (no es letal).

    let WATER = WATER_STYLES[cfg.water];
    let SKY = SKY_PRESETS[cfg.sky];
    function applyCfg() { WATER = WATER_STYLES[cfg.water] || WATER_STYLES.sea; SKY = SKY_PRESETS[cfg.sky] || SKY_PRESETS.dusk; }

    // fija el layout de zonas del MOMENTUM segun la clase del buque
    // (MOM_LAYOUTS/SHIP_CLASS se definen mas abajo; esto solo corre al armar un run)
    function useShip(s) {
      MOM_PHASES = MOM_LAYOUTS[SHIP_CLASS[s]] || MOM_LAYOUTS.t42;
      return s;
    }
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
    const MODES = ['campaign', 'cycle', 'survival'];
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
    function goSurvival() { gameMode = 'survival'; cfgOpen = false; cfgRow = 0; state = 'menu'; beep(600, 0.08, 'square', 0.05); }
    // CICLO DE MUERTE: las mismas misiones de la campaña, una al azar, sin el guion largo
    function goCycle() { gameMode = 'cycle'; cfgOpen = false; cfgRow = 0; randomMission(); state = 'menu'; beep(600, 0.08, 'square', 0.05); }
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
      setRunObjective(); state = enterMission();
    }
    function confirmMode() { const m = MODES[modeSel]; if (m === 'campaign') startCampaign(); else if (m === 'cycle') goCycle(); else goSurvival(); }
    // arranca la mision actual por la puerta que corresponda: guion largo (campaña, si lo tiene)
    // o tarjeta corta de briefing (ciclo de muerte). Devuelve el state al que hay que ir.
    function enterMission() {
      const m = curMission();
      if (gameMode === 'campaign' && m.story) { initStory(m.story); return 'story'; }
      briefT = 0; return 'brief';
    }
    // elige una mision al azar para el CICLO DE MUERTE (mismas misiones que la campaña)
    function randomMission() { loadLevel(Math.floor(Math.random() * MISSIONS.length)); }
    // define el objetivo del run según el modo (campaña/ciclo: el goal de la mision; supervivencia: infinito)
    function setRunObjective() {
      if (gameMode === 'campaign' || gameMode === 'cycle') {
        const m = curMission(), g = goalOf(m);
        objectiveDist = g.dist(m.goal);
        objectiveShip = g.label(m.goal);
        g.setup(m.goal);
      }
      else { objectiveDist = 0; objectiveShip = randomShip(); }
      // SUPERVIVENCIA y CICLO: cada run arranca con una pista ADRENALINA al azar; campaña usa la suya
      pickRunTrack(gameMode !== 'campaign');
    }

    // ---------- MENÚ DE CONFIGURACIÓN DE MAPA [M] (herramienta para prototipar niveles) ----------
    const CFG_ROWS = [
      { label: 'METROS', opts: [800, 1500, 3000, 5000, 8000], names: ['800 m', '1500 m', '3000 m', '5000 m', '8000 m'], get: () => cfg.meters, set: v => cfg.meters = v, cycleOnly: true },
      { label: 'FONDO', opts: ['dusk', 'night', 'storm', 'clear'], names: ['ATARDECER', 'NOCHE', 'TORMENTA', 'DESPEJADO'], get: () => cfg.sky, set: v => { cfg.sky = v; applyCfg(); } },
      { label: 'TERRENO', opts: ['sea', 'land'], names: ['MAR', 'TIERRA'], get: () => cfg.terrain, set: v => cfg.terrain = v },
      { label: 'AGUA', opts: ['sea', 'violet'], names: ['MAR', 'VIOLETA'], get: () => cfg.water, set: v => { cfg.water = v; applyCfg(); } },
      { label: 'VIENTO', opts: [true, false], names: ['SI', 'NO'], get: () => cfg.wind, set: v => cfg.wind = v },
      { label: 'OBSTACULOS', opts: [0, 0.5, 1, 1.7], names: ['NINGUNO', 'POCOS', 'NORMAL', 'MUCHOS'], get: () => cfg.obstacles, set: v => cfg.obstacles = v },
      { label: 'COMBUSTIBLE', opts: [true, false], names: ['SI', 'NO'], get: () => cfg.fuelOn, set: v => cfg.fuelOn = v },
      { label: 'ENERGIA', opts: [true, false], names: ['SI', 'NO'], get: () => cfg.energy, set: v => cfg.energy = v },   // altura<->velocidad: para comparar A/B la sensacion
      { label: 'COSTA', opts: [120, 230, 400], names: ['CORTA', 'NORMAL', 'LARGA'], get: () => cfg.coast, set: v => cfg.coast = v },
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
    const PLANES = [
      { key: 'sky', name: 'A-4 SKYHAWK', src: "../assets/img/plane_sky.webp", sheet: '../assets/img/plane_sky_sheet.png', desc: { es: 'Equilibrado - protagonista de la campaña', en: 'Balanced - the campaign workhorse' } },
      { key: 'dagger', name: 'IAI DAGGER', src: "../assets/img/plane_dagger.webp", sheet: '../assets/img/plane_dagger_sheet.png', desc: { es: 'Mas rapido y con mas fuego - dificil de controlar', en: 'Faster, harder-hitting - tricky to control' } },
      { key: 'supere', name: 'SUPER ETENDARD', src: "../assets/img/plane_supere.webp", sheet: '../assets/img/plane_supere_sheet.png', desc: { es: 'Misiones especiales - misiles Exocet', en: 'Special missions - Exocet missiles' } },
      { key: 'a4q', name: 'A-4Q', src: "../assets/img/plane_a4q.webp", sheet: '../assets/img/plane_a4q_sheet.png', desc: { es: 'Variante naval - similar al A-4B/C', en: 'Naval variant - similar to the A-4B/C' } },
      { key: 'pampa', name: 'PAMPA 63', src: "../assets/img/plane_pampa.webp", sheet: '../assets/img/plane_pampa_sheet.png', desc: { es: 'Entrenador biplaza IA-63', en: 'IA-63 two-seat trainer' } },
    ];
    const SHEET_FW = 56, SHEET_FH = 32, SHEET_NF = 9, SHEET_ROWS = 3;   // 9 cols (alabeo) x 3 filas (cabeceo: trepa/nivel/pica); tambien spec para arte manual
    PLANES.forEach(pl => {
      pl.img = new Image(); pl.ready = false; pl.w = 977; pl.h = 471;
      pl.img.onload = () => { pl.ready = true; pl.w = pl.img.naturalWidth; pl.h = pl.img.naturalHeight; };
      pl.img.src = pl.src;
      pl.sheetImg = new Image(); pl.sheetOk = false;
      pl.sheetImg.onload = () => { pl.sheetOk = true; };
      pl.sheetImg.src = pl.sheet;
    });
    let selPlane = 0, startReq = false;



    // ---------- estado ----------
    let state = 'modeselect', t = 0, dist = 0, spd = 62;
    let plane, fuel, heat, overheat, detection, score, mult, boost;
    let obstacles, bullets, missiles, parts, streaks, popups, wake;
    let pmissiles;                       // MISILES DEL JUGADOR (array propio; nunca tocan el hitbox del avión)
    let soldiers, nextSoldier = 0;       // soldados en tierra (array propio; atropellarlos NO mata al avión)
    let bloodSplat = 0;                  // mancha de sangre temporal sobre el sprite (se acumula y se desvanece)
    let msl = 0, mslCd = 0, mslRegen = 0;   // munición de misiles, cooldown y temporizador de recarga
    const MSL_MAX = 3;
    let nextSpawn, fuelDist, fireT, shake, deathCause, deathT, factIdx = 0, best = 0;
    let streak, graceT, rasLevel, multShow, throttle;
    // AFTERBURNER SOSTENIDO: aguantar BOOST + RASANTE (bajo) sube de escalón cada AFTER_STEP s;
    // cada escalón multiplica la velocidad y levanta el techo. Romper el estado (soltar turbo o
    // trepar) lo resetea, con una gracia corta para tolerar bobs cortos. afterT=segundos acumulados.
    let afterT = 0, afterTier = 0, afterGrace = 0;
    let windT, windF, gusts;
    let rollT = 0, rollDir = 1, rollCd = 0, tapL = -9, tapR = -9;   // PIRUETA (tonel): doble-tap ←/→
    // ZONA DE VUELO. El techo alto es lo que da margen para picar y ganar velocidad (ver ENERGY_*).
    // SPAWN_X acompaña a FLY_X: si los obstaculos nacieran mas angostos que la zona de vuelo,
    // bastaria irse al costado para esquivarlos todos.
    const FLY_X = 38, FLY_TOP = 68, SPAWN_X = 33;
    let scrapeT = 0;    // reloj de gracia rozando la superficie (ver SCRAPE_*)
    let scrapeVib = 0;  // 1 mientras roza: hace VIBRAR el sprite del avion; decae al salir
    let pitchHold = 0;   // seg. que se mantiene apretado ↑/↓: filtra los toques rápidos de gas (no mueven la trompa)
    // CABECEO (solo VISUAL: plane.pitch no afecta el vuelo, solo el sprite y su inclinacion).
    // Calibrado para que la inclinacion aparezca a los 0.50 s de mantener ↑ o ↓ (igual en ambos).
    // DELAY = zona muerta antes de mover la trompa; RAMP = cuanto tarda en llegar a full;
    // VY = peso de la velocidad vertical real — se mantiene >0 para que al soltar el gas y caer la
    // trompa se incline sola, y es bajo para que picar y trepar tarden lo mismo (picar acelera mas
    // rapido, asi que un VY alto adelantaba la picada).
    const PITCH_DELAY = 0.30, PITCH_RAMP = 0.34, PITCH_VY = 0.05;
    const ROLL_DUR = 0.55;
    const AFTER_STEP = 2, AFTER_MAX = 5, AFTER_GAIN = 0.16, AFTER_CAP = 42;   // afterburner: seg/escalón, tope, +vel y +techo por escalón
    let story = null;   // pantalla de HISTORIA (campaña): maquina de escribir letra a letra
    let fadeT = 0;      // fundido desde negro al entrar al juego (se dibuja al final de draw)
    let toT = 0, toCount = 4;
    let levelT = 0;   // temporizador de las tarjetas de transición de nivel / victoria (campaña)
    let briefT = 0;   // temporizador de la tarjeta de briefing corto (ciclo de muerte)
    // ESTADISTICAS de la corrida: alimentan el recuento y las estrellas del fin de misión.
    // Se ceran en reset() y se CONGELAN en finishObjective() dentro de lastRun, porque entre
    // niveles de campaña se llama reset() y borraria los contadores.
    let stats = null, lastRun = null;
    let resT = 0, resRow = 0;   // recuento: tiempo y cuantas filas ya entraron
    const RANKS = ['rank_cadete', 'rank_piloto', 'rank_as', 'rank_halcon'];
    function resetStats() {
      stats = { air: 0, soldiers: 0, zones: 0, shots: 0, hits: 0, grazes: 0, fuelPicks: 0, dodges: 0, bestRas: 0 };
    }
    let momPhase = 0, mom = null;   // MOMENTUM: pasada actual del asalto a la barcaza y estado del minijuego
    // fraccion de la velocidad de vuelo que conserva el avion durante el MOMENTUM.
    // Subir = mas sensacion de seguir entrando; bajar = mas quieto/ceremonioso.
    const MOM_ADVANCE = 0.5;
    // RE-ATAQUE: si la ventana se agota con blancos vivos NO te matan — virás 180° y volvés a
    // entrar. El daño que ya hiciste a las zonas se conserva. El costo es COMBUSTIBLE, que es el
    // reloj del run: podés insistir, pero cada vuelta te acerca a quedarte sin nafta.
    const REATTACK_DUR = 2.6, REATTACK_FUEL = 12;
    // ENERGIA: altura <-> velocidad. K = cuanta velocidad da picar; DRAG = que tan rapido vuelve
    // al objetivo (mas bajo = conserva mas impulso); MAX = techo sobre el objetivo al picar.
    const ENERGY_K = 2.0, ENERGY_DRAG = 0.7, ENERGY_MAX = 1.55;
    // RASANTE LETAL: tocar la superficie ya no mata al instante — el avion TAMBALEA y tenes que
    // salir. SCRAPE_BASE son los segundos de gracia a baja velocidad; a mucha velocidad/turbo se
    // reduce hasta SCRAPE_MIN. Salir de la superficie descuenta el reloj, pero no lo borra.
    const SCRAPE_BASE = 0.85, SCRAPE_MIN = 0.18, SCRAPE_RECOVER = 0.35;
    const SCRAPE_LIFT = 0.8;   // se sostiene apenas POR ENCIMA de la superficie mientras roza
    const REATTACK_MAX = 6;   // intentos maximos sobre un mismo blanco: si no lo destruis, la mision termina
    let momDrift = 0;   // avance VISUAL extra del momentum: cuando dist llega al tope anti-encadenado,
                        // el sobrante se acumula aca y el mar/tierra lo suman → el avion NUNCA se ve frenar
    try { best = +localStorage.getItem('rasante_frontal_best') || 0; } catch (e) { }

    function reset() {
      t = 0; dist = 0; spd = 6; momDrift = 0;
      plane = { x: 0, y: 1.2, vx: 0, vy: 0, bank: 0, pitch: 0 };   // bank/pitch: estado visual suavizado (animación)
      fuel = 100; heat = 0; overheat = false; detection = 0;
      score = 0; mult = 1; boost = false; resetStats();
      obstacles = []; bullets = []; missiles = []; parts = []; streaks = []; popups = []; wake = [];
      pmissiles = []; msl = MSL_MAX; mslCd = 0; mslRegen = 0; soldiers = []; nextSoldier = 60; bloodSplat = 0;
      nextSpawn = 320; fuelDist = 0; fireT = 0; shake = 0;
      streak = 0; graceT = 0; rasLevel = 0; multShow = 1; throttle = 0; scrapeT = 0; scrapeVib = 0;
      afterT = 0; afterTier = 0; afterGrace = 0;
      windT = 0; windF = 1; gusts = [];
      rollT = 0; rollCd = 0;
      momPhase = 0; mom = null;
      toT = 0; toCount = 4;
      cam.x = 0; cam.y = 4;
    }
    const cam = { x: 0, y: 14 };

    // botón táctil de misil (visible solo en juego; se togglea en el loop)
    const mslBtn = document.getElementById('msl');
    if (mslBtn) mslBtn.addEventListener('pointerdown', e => { e.preventDefault(); audio(); tryLaunchMissile(); });

    // ---------- input ----------
    const inp = { l: 0, r: 0, u: 0, d: 0, fire: false, turbo: false, msl: false };
    let anyPress = false;
    const KEYMAP = {
      ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r',
      ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd'
    };
    addEventListener('keydown', e => {
      audio();
      if (e.code === 'KeyL') { cycleLang(); e.preventDefault(); return; }   // cambia idioma sin empezar la partida
      if (state === 'modeselect') {                                       // pantalla inicial: CAMPAÑA / CICLO / SUPERVIVENCIA
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'ArrowLeft' || e.code === 'KeyA') { modeSel = (modeSel + MODES.length - 1) % MODES.length; beep(520, 0.05, 'square', 0.04); e.preventDefault(); return; }
        if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'ArrowRight' || e.code === 'KeyD') { modeSel = (modeSel + 1) % MODES.length; beep(520, 0.05, 'square', 0.04); e.preventDefault(); return; }
        if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyX' || e.code === 'KeyK') { confirmMode(); e.preventDefault(); return; }
        return;
      }
      if (state === 'dead') {                                              // DERRIBADO: Esc/Backspace vuelve al menú principal
        if (e.code === 'Escape' || e.code === 'Backspace') { state = 'modeselect'; cfgOpen = false; beep(400, 0.06, 'square', 0.05); e.preventDefault(); return; }
      }
      if (state === 'menu') {                                             // pantalla de selección de avión (supervivencia)
        if (e.code === 'Escape' || e.code === 'Backspace') { state = 'modeselect'; cfgOpen = false; beep(400, 0.06, 'square', 0.05); e.preventDefault(); return; }
        if (e.code === 'KeyM') { cfgOpen = !cfgOpen; beep(cfgOpen ? 640 : 400, 0.06, 'square', 0.05); e.preventDefault(); return; }
        if (cfgOpen) {                                                    // navegación del menú de configuración de mapa
          {
            const nrows = getCfgRows().length;
            if (e.code === 'ArrowUp' || e.code === 'KeyW') { cfgRow = (cfgRow + nrows - 1) % nrows; beep(500, 0.04, 'square', 0.03); }
            if (e.code === 'ArrowDown' || e.code === 'KeyS') { cfgRow = (cfgRow + 1) % nrows; beep(500, 0.04, 'square', 0.03); }
          }
          if (e.code === 'ArrowLeft' || e.code === 'KeyA') { cfgChange(-1); }
          if (e.code === 'ArrowRight' || e.code === 'KeyD') { cfgChange(1); }
          if (e.code === 'Enter') { cfgOpen = false; }
          e.preventDefault(); return;
        }
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') { selPlane = (selPlane + PLANES.length - 1) % PLANES.length; beep(520, 0.05, 'square', 0.04); e.preventDefault(); return; }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') { selPlane = (selPlane + 1) % PLANES.length; beep(600, 0.05, 'square', 0.04); e.preventDefault(); return; }
        if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyX' || e.code === 'KeyK') { startReq = true; e.preventDefault(); return; }
      }
      if (state === 'story') {                                            // HISTORIA: Esc vuelve al menu principal
        if (e.code === 'Escape' || e.code === 'Backspace') { state = 'modeselect'; beep(400, 0.06, 'square', 0.05); e.preventDefault(); return; }
      }
      // PIRUETA (tonel): doble-tap ← / → en vuelo — pulsaciones frescas, no auto-repeat
      if (!e.repeat && state === 'play') {
        const nowS = performance.now() / 1000;
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') { if (nowS - tapL < 0.28) startRoll(-1); tapL = nowS; }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') { if (nowS - tapR < 0.28) startRoll(1); tapR = nowS; }
      }
      // anyPress solo con pulsaciones FRESCAS (!e.repeat): el auto-repeat de una tecla sostenida
      // no debe saltear pantallas (historia, derribado, transiciones). inp si se re-setea siempre.
      if (KEYMAP[e.code] !== undefined) { inp[KEYMAP[e.code]] = 1; if (!e.repeat) anyPress = true; e.preventDefault(); }
      if (e.code === 'KeyX' || e.code === 'KeyK' || e.code === 'Space') { inp.fire = true; if (!e.repeat) anyPress = true; e.preventDefault(); }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyC') { inp.turbo = true; if (!e.repeat) anyPress = true; }
      if (e.code === 'KeyV' && !e.repeat) {   // cicla las 4 camaras (1× / 1.5× / 2× / 2.5×)
        camMode = (camMode + 1) % CAM_ZOOMS.length;
        beep(440 + camMode * 120, 0.05, 'square', 0.04);
        if (state === 'play' || state === 'takeoff') popup(W / 2, 58, camMode ? 'CAM ' + CAM_ZOOMS[camMode] + '×' : 'CAM 1×', P.accent);
      }
      if (e.code === 'KeyZ') { inp.msl = true; if (!e.repeat) anyPress = true; e.preventDefault(); }   // lanzar misil
      if (e.code === 'Enter' && !e.repeat) anyPress = true;
    });
    addEventListener('keyup', e => {
      if (KEYMAP[e.code] !== undefined) inp[KEYMAP[e.code]] = 0;
      if (e.code === 'KeyX' || e.code === 'KeyK' || e.code === 'Space') inp.fire = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyC') inp.turbo = false;
      if (e.code === 'KeyZ') inp.msl = false;
    });

    // táctil: arrastre a la izquierda = volar; derecha arriba = fuego; derecha abajo = turbo
    let steerPtr = null, steerTarget = null;
    const zonePtr = new Map();
    function canvasPos(e) {
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    }
    cv.addEventListener('pointerdown', e => {
      e.preventDefault(); cv.focus(); audio(); anyPress = true;
      const p = canvasPos(e);
      if (state === 'modeselect') {                                       // 3 filas: tap en una fila la elige y confirma
        const row = Math.floor((p.y - 60) / 34);
        if (row >= 0 && row < MODES.length) { modeSel = row; confirmMode(); }
        return;
      }
      if (state === 'menu') {                                             // selección: tap izq/der cambia, centro despega
        if (cfgOpen) { cfgOpen = false; return; }                         // en config (por teclado), tocar cierra
        if (p.x < W * 0.28) { selPlane = (selPlane + PLANES.length - 1) % PLANES.length; beep(520, 0.05, 'square', 0.04); }
        else if (p.x > W * 0.72) { selPlane = (selPlane + 1) % PLANES.length; beep(600, 0.05, 'square', 0.04); }
        else startReq = true;
        return;
      }
      // PC (mouse): click izquierdo = canon sostenido, click derecho = misil — en juego y momentum
      if (e.pointerType === 'mouse' && (state === 'play' || state === 'momentum')) {
        if (e.button === 2) { tryLaunchMissile(); }
        else { zonePtr.set(e.pointerId, 'fire'); inp.fire = true; }
        return;
      }
      if (p.x < W * 0.62) { steerPtr = e.pointerId; steerTarget = p; }
      else {
        const z = p.y < H / 2 ? 'fire' : 'turbo';
        zonePtr.set(e.pointerId, z); inp[z] = true;
      }
    });
    // MOUSE = MIRA (PC): apuntar con el mouse, volar con flechas/WASD (en momentum las flechas
    // mueven la cabina/camara). `mouse.on` se enciende al primer movimiento → en tactil nunca,
    // y ahi rige el esquema anterior. Es la base del esquema doble-stick para el joystick futuro.
    const mouse = { x: W / 2, y: H * 0.4, on: false };
    // CAMARAS (tecla V, cicla): 4 niveles de zoom anclados al sprite del avion.
    // camZ interpola suave; el zoom solo se aplica en vuelo (play/takeoff/dead), nunca en momentum
    // (ahi manda la camara cockpit) ni en menus.
    const CAM_ZOOMS = [1, 1.5, 2, 2.5];
    let camMode = 0, camZ = 1;
    function camZoomOn() { return camZ > 1.005 && (state === 'play' || state === 'takeoff' || state === 'dead'); }
    // mouse en coordenadas del MUNDO-pantalla: deshace el zoom de la camara cerca para que
    // mira y desproyeccion (balas/misiles) sigan cayendo exactamente bajo el cursor fisico
    function viewMouse() {
      if (!camZoomOn()) return mouse;
      const c = proj(plane.x, plane.y, PZ);
      return { x: c.x + (mouse.x - c.x) / camZ, y: c.y + (mouse.y - c.y) / camZ, on: mouse.on };
    }
    cv.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse') { const p = canvasPos(e); mouse.x = p.x; mouse.y = p.y; mouse.on = true; }
      if (e.pointerId === steerPtr) steerTarget = canvasPos(e);
    });
    cv.addEventListener('contextmenu', e => e.preventDefault());   // click derecho = misil, sin menu
    function ptrEnd(e) {
      if (e.pointerId === steerPtr) { steerPtr = null; steerTarget = null; }
      const z = zonePtr.get(e.pointerId);
      if (z) { zonePtr.delete(e.pointerId); if (![...zonePtr.values()].includes(z)) inp[z] = false; }
    }
    cv.addEventListener('pointerup', ptrEnd);
    cv.addEventListener('pointercancel', ptrEnd);

    // ---------- mundo ----------
    function waveNow() { return 1.1 + Math.sin(t * 1.1) * 0.5 + Math.sin(t * 2.3) * 0.3; }
    // campo de altura de la superficie para la malla de puntos (ondas superpuestas)
    function seaH(wx, wz) {
      return 1.0
        + Math.sin(wz * 0.035 - t * 1.1) * 0.9           // marejada larga que rueda hacia la cámara
        + Math.sin(wz * 0.22 + t * 2.2) * 0.65
        + Math.sin(wz * 0.09 - t * 1.5 + wx * 0.15) * 0.5
        + Math.sin(wx * 0.30 + wz * 0.05 + t * 1.9) * 0.35;
    }
    const clouds = Array.from({ length: 6 }, () => ({ x: Math.random() * W, y: 8 + Math.random() * 34, w: 24 + Math.random() * 40 }));
    const isles = Array.from({ length: 4 }, (_, i) => ({ x: i * 90 + Math.random() * 50, w: 40 + Math.random() * 70, h: 5 + Math.random() * 10 }));

    // ---------- FONDOS por clima (assets/images/terrain_back, EN PRUEBA) ----------
    // Imagenes 2752x1536 con el horizonte al ~72% de altura: se anclan para que esa linea
    // caiga en HOR (el suelo de la imagen queda bajo el mar/terreno del juego, tapado).
    // Reemplazan al degrade+sol procedurales en 2D y en el telon 3D. Vaciar TBACK en el
    // build web (build_web.py) → vuelve el cielo procedural.
    const TBACK = '../assets/images/terrain_back/';
    const TBACK_MAP = { dusk: 'sunrise.png', night: 'night.png', storm: 'night_storm.png', clear: 'day_argentday.png' };
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

    function spawn() {
      const lane = (Math.random() * SPAWN_X * 2 - SPAWN_X);   // acompaña a FLY_X
      // sin combustible activo (COMBUSTIBLE: NO) los bidones serian pickups inutiles: no se fuerzan
      // por distancia y su slot del sorteo cae en globo
      if (cfg.fuelOn && fuelDist > 700) { obstacles.push({ type: 'fuel', x: lane, y: 4 + Math.random() * 22, z: 250, done: false }); fuelDist = 0; return; }
      const r = Math.random();
      if (r < 0.34) obstacles.push({ type: 'mast', x: lane, h: 11 + Math.random() * 17, z: 250, done: false });
      else if (r < 0.60) obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, hp: 1, done: false, ph: Math.random() * 6 });
      else if (r < 0.70) obstacles.push({ type: 'helo', x: lane, y: 5 + Math.random() * 16, z: 250, hp: 2, done: false, ph: Math.random() * 6 });
      else if (r < 0.78) obstacles.push({ type: 'jet', x: lane, y: 5 + Math.random() * 15, z: 250, hp: 2, done: false, ph: Math.random() * 6 });
      else if (cfg.fuelOn) obstacles.push({ type: 'fuel', x: lane, y: 4 + Math.random() * 22, z: 250, done: false });
      else obstacles.push({ type: 'balloon', x: lane, y: 6 + Math.random() * 24, z: 250, hp: 1, done: false, ph: Math.random() * 6 });
    }

    function proj(x, y, z) {
      const k = F / z;
      return { x: W / 2 + (x - cam.x) * k, y: HOR + (cam.y - y) * k, k };
    }
    function explodeAt(x, y, z, big) {
      const s = proj(x, y, z);
      for (let i = 0, n = big ? 24 : 12; i < n; i++) {
        const a = Math.random() * 6.283, v = (14 + Math.random() * 55) * Math.min(1.6, s.k / 3 + 0.4);
        parts.push({
          x: s.x, y: s.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 15, life: 0.4 + Math.random() * 0.5,
          c: Math.random() < 0.6 ? P.accent : (Math.random() < 0.5 ? P.warn : P.dim), r: Math.max(1, s.k * 0.35)
        });
      }
      shake = Math.min(6, shake + (big ? 4.5 : 2)); boom(big ? 0.16 : 0.08);
      if (big) duck(0.55);                      // explosion grande → ducking de la musica
    }
    function popup(x, y, txt, c) { popups.push({ x, y, txt, c: c || P.accent, life: 1.1 }); }

    // ---------- MOMENTUM: asalto final a la barcaza ----------
    // Al acercarse al objetivo el tiempo se ralentiza y se abre un minijuego de punteria:
    // mantener la mira sobre las zonas criticas (que se mueven con el barco) disparando hasta
    // destruirlas, en varias PASADAS a distinta distancia. La ultima pasada (puente) destruye
    // la barcaza y termina el nivel. Si se acaba el tiempo de una pasada, la defensa te derriba.
    // `at`: fraccion de objectiveDist donde arranca la pasada · `scale`: tamano del barco en pantalla
    // `u`: posicion de la zona a lo largo del barco (-1..1) · `v`: altura sobre cubierta (en bloques)
    // `w`: ancho (fraccion del largo) · `h`: alto (en bloques) · `maxHp`: dificultad de la zona
    let MOM_PHASES = MOM_LAYOUTS.t42;   // layout del run actual (lo fija randomShip)

    // geometria del barco en pantalla (se mueve: balanceo + cabeceo → las zonas se mueven con el)
    // APROXIMACION LENTA: dentro de la pasada el barco crece de 0.82× a 0.98× de su escala
    // (deriva lentisima hacia el blanco); entre pasadas el crecimiento lo continua drawApproachBarge.
    function momShipGeom() {
      const ph = MOM_PHASES[momPhase];
      const prog = mom.t / ph.time;
      // cierra 0.82×→1.06× durante la pasada y SIGUE cerrando (mas lento) si se pasa del tiempo
      // nominal — p.ej. durante el outro. Antes se clampeaba en 1 y el barco quedaba clavado:
      // el avion parecia frenar en seco justo al final.
      const extra = Math.min(0.5, Math.max(0, prog - 1));
      let f = 0.82 + 0.24 * Math.min(1, prog) + 0.10 * extra;
      // VIRAJE 180: te alejas y reencaras, asi que el barco vuelve suave al standoff de entrada
      // (0.82×). Al terminar el viraje mom.t se resetea a 0 → sigue justo desde ahi, sin salto.
      if (mom.turn > 0) f += (0.82 - f) * Math.min(1, (1 - mom.turn / REATTACK_DUR) * 1.3);
      const sc = ph.scale * f;
      // barco FIJO/ANCLADO (sin balanceo ni cabeceo): el movimiento del duelo lo pone el ALABEO
      // del avion (el mundo entero gira con mom.roll), no el barco
      return { cx: W / 2, len: W * 0.82 * sc, deckY: HOR + 36 * sc, uh: 9 * sc, sc };
    }

    // camara del momentum: la MIRA queda CLAVADA al visor del cockpit (MOM_AX, MOM_AY) y para
    // apuntar se mueve EL MUNDO (giras la trompa del avion, no un cursor). mom.cx/cy es el punto
    // apuntado en coords de mundo; el mundo se dibuja corrido para que ese punto caiga en el visor.
    const MOM_AX = W / 2, MOM_AY = 40;      // posicion fija del visor en pantalla (reflector del HUD)
    function momCam() {
      if (state !== 'momentum' || !mom) return { x: 0, y: 0 };
      return { x: mom.cx - MOM_AX, y: mom.cy - MOM_AY };
    }
    // pantalla → mundo en momentum: el mundo se dibuja rotado -mom.roll alrededor del centro
    // (alabeo), asi que para apuntar/spawnear hay que DESHACER esa rotacion y sumar la camara
    function momScrToWorld(sx2, sy2) {
      const cmw2 = momCam(), ca = Math.cos(mom.roll || 0), sa = Math.sin(mom.roll || 0);
      const dx = sx2 - W / 2, dy = sy2 - H / 2;
      return { x: W / 2 + dx * ca - dy * sa + cmw2.x, y: H / 2 + dx * sa + dy * ca + cmw2.y };
    }

    // casco + superestructura de la barcaza (compartido: momentum y aproximacion en vuelo normal)
    function drawBargeHull(cx0, len, deckY, uh) {
      const x0 = cx0 - len / 2, x1 = cx0 + len / 2, hullH = uh * 1.5;
      if (uh < 1.1) {   // muy lejos: silueta simple en el horizonte
        px(cx0 - len * 0.15, deckY - Math.max(1, uh * 2.2), len * 0.24, Math.max(1, uh * 2.2), P.bodyDark);
        px(x0, deckY, len, Math.max(1, hullH), P.bodyDark);
        return;
      }
      px(x0, deckY, len, hullH, P.bodyDark);
      px(x0 - uh * 0.7, deckY, uh * 0.7, hullH * 0.65, P.bodyDark);          // proa
      px(x1, deckY, uh * 0.5, hullH * 0.6, P.bodyDark);                    // popa
      px(x0, deckY, len, Math.max(1, uh * 0.28), '#5c6e73');             // cubierta
      px(x0, deckY + hullH - 2, len, 2, '#1c262e');                    // flotacion
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 6; i++) px(x0 + (i / 6) * len + Math.sin(t * 3 + i) * 3, deckY + hullH - 1, uh * 0.8, 1, P.foam);
      ctx.globalAlpha = 1;
      px(cx0 - len * 0.15, deckY - uh * 2.6, len * 0.24, uh * 2.6, P.body);           // bloque puente
      px(cx0 - len * 0.12, deckY - uh * 2.3, len * 0.18, Math.max(1, uh * 0.5), P.canopy); // ventanas
      px(cx0 + len * 0.16, deckY - uh * 1.8, len * 0.05, uh * 1.8, '#454f56');        // chimenea
      px(cx0 + len * 0.095, deckY - uh * 3.9, Math.max(1, len * 0.012), uh * 3.9, '#454f56'); // mastil
      px(cx0 + len * 0.06, deckY - uh * 3.9, len * 0.08, Math.max(1, uh * 0.35), '#454f56'); // antena
      for (const s of [-0.52, 0.52]) {                                          // torretas AA
        px(cx0 + len / 2 * s - len * 0.05, deckY - uh * 1.1, len * 0.10, uh * 1.1, '#3d474d');
        px(cx0 + len / 2 * s - len * 0.008, deckY - uh * 1.55, Math.max(1, len * 0.016), uh * 0.6, '#2b3338');
      }
    }


    // la barcaza objetivo VISIBLE en vuelo normal: aparece en el horizonte desde el 45% del recorrido
    // y crece hasta empalmar con la escala de la proxima pasada del momentum (es el final del mapa)
    function drawApproachBarge() {
      if (objectiveDist <= 0 || momPhase >= MOM_PHASES.length) return;
      if (state !== 'play' && state !== 'takeoff') return;
      const p = dist / objectiveDist;
      const next = MOM_PHASES[momPhase];
      const t0 = momPhase === 0 ? 0.45 : MOM_PHASES[momPhase - 1].at;
      if (p < t0) return;
      const f = Math.max(0, Math.min(1, (p - t0) / (next.at - t0)));
      const sc0 = momPhase === 0 ? 0.04 : MOM_PHASES[momPhase - 1].scale * 1.06;  // continua donde quedo la pasada anterior
      const scE = next.scale * 0.82;
      const sc = sc0 + (scE - sc0) * f;
      // ALINEADO AL HORIZONTE: la barcaza queda pegada a la linea del horizonte (donde emergen los
      // obstaculos, misma perspectiva) casi todo el acercamiento, y recien "baja" (se acerca) sobre
      // el final con ease-in cuadratico, empalmando exacto con la cubierta del momentum (HOR+36*scE).
      const d0 = momPhase === 0 ? 2 : 36 * sc0;
      const dOff = d0 + (36 * scE - d0) * f * f;
      const bx = W / 2 - cam.x * 1.2 + Math.sin(t * 0.8) * 6 * sc;
      const by = HOR + dOff + Math.sin(t * 1.3) * 1.2 * sc;
      // bruma atmosferica: de lejos es una silueta tenue → los obstaculos (solidos) resaltan encima
      ctx.globalAlpha = momPhase === 0 ? 0.35 + 0.65 * f : 1;
      drawBargeHull(bx, W * 0.82 * sc, by, 9 * sc);
      ctx.globalAlpha = 1;
      if (sc > 0.28) {   // ya cerca: nombre sobre el barco
        ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn; ctx.globalAlpha = 0.85;
        ctx.fillText(objectiveShip, bx, by - 9 * sc * 4.6);
        ctx.globalAlpha = 1;
      }
    }
    function momZoneRect(z) {
      const g = momShipGeom();
      const w = g.len * z.w, h = g.uh * z.h;
      return { x: g.cx + g.len / 2 * z.u - w / 2, y: g.deckY - g.uh * z.v - h, w, h };
    }
    function momBoom(sx, sy, big) {
      for (let i = 0, n = big ? 28 : 14; i < n; i++)
        parts.push({
          x: sx + (Math.random() - 0.5) * 6, y: sy + (Math.random() - 0.5) * 4, vx: (Math.random() - 0.5) * 85,
          vy: -(10 + Math.random() * 70), life: 0.45 + Math.random() * 0.55,
          c: [P.warn, P.accent, '#f2b544', '#3a3f43'][i % 4], r: 1 + Math.random() * 2
        });
      shake = Math.min(6, shake + (big ? 4 : 2)); boom(big ? 0.16 : 0.08);
      if (big) duck(0.55);                      // la explosion agacha la musica un instante
    }
    // zona critica destruida (comparten cañon y misil): explosion, puntos y cierre de pasada
    function momZoneKilled(z) {
      const r = momZoneRect(z), cmw = momCam();
      z.hp = 0;
      momBoom(r.x + r.w / 2, r.y + r.h / 2, true);
      // explosion real: la primera pasada suena LEJANA (heavy_dist), las siguientes de cerca
      sfxOne(momPhase === 0 ? 'exHeavyDist' : 'exHeavy');
      score += z.pts; stats.zones++;
      popup(r.x + r.w / 2, r.y - 6, '+' + z.pts, P.accent);
      popup(MOM_AX + cmw.x, 50 + cmw.y, T('mom_destroyed', { z: T(z.label) }), P.warn);
      if (mom.zones.every(zz => zz.hp <= 0)) {
        score += 500 * (momPhase + 1);
        const last = momPhase + 1 >= MOM_PHASES.length;
        if (last) sfxOne('exXheavy');   // el barco entero se va: la explosion GRANDE del nivel
        mom.doneT = last ? 1.6 : 1.0;
        popup(MOM_AX + cmw.x, 62 + cmw.y, last ? T('bargeDown') : T('mom_clear'), P.accent);
        beep(880, 0.2, 'square', 0.06, 1200);
      }
    }
    // impacto de MISIL en momentum: 55 de daño a toda zona cercana al punto de explosion
    function momMissileBoom(mx, my2) {
      momBoom(mx, my2, true);
      for (const z of mom.zones) {
        if (z.hp <= 0) continue;
        const r = momZoneRect(z);
        if (mx > r.x - 9 && mx < r.x + r.w + 9 && my2 > r.y - 9 && my2 < r.y + r.h + 9) {
          z.hp -= 80;
          if (z.hp <= 0) momZoneKilled(z);
          else popup(r.x + r.w / 2, r.y - 6, '-80', P.warn);
        }
      }
    }
    // misil en primera persona: sale del ala (fuera del vidrio, alternando lado), vuela LENTO
    // con guiado hacia el punto apuntado al momento del disparo, y explota con daño en area.
    // Usa la MISMA municion `msl` que el vuelo normal (la recarga queda pausada en camara lenta).
    function momLaunchMissile() {
      if (!mom || mom.doneT > 0 || msl <= 0 || mslCd > 0) return;
      msl--; mslCd = 0.6;
      mom.mslSide = -(mom.mslSide || 1);
      const mo = momScrToWorld(MOM_AX + mom.mslSide * 95, H - 30);       // pilon del ala (rola con vos)
      const mt = momScrToWorld(mouse.on ? mouse.x : MOM_AX, mouse.on ? mouse.y : MOM_AY);
      mom.fx.push({
        k: 'ms', x: mo.x, y: mo.y,
        tx: mt.x, ty: mt.y,
        vx: mom.mslSide * -30, vy: -52, life: 3.5, T: 0
      });
      // resplandor de lanzamiento (mas largo que el del canon)
      if (mom.mslSide < 0) mom.flashL = 0.22; else mom.flashR = 0.22;
      sfxOne('msl');   // lanzamiento real (misil.mp3 / misil2.wav al azar)
      beep(200, 0.2, 'sawtooth', 0.05, 80); boom(0.05, true);
    }
    function enterMomentum() {
      const ph = MOM_PHASES[momPhase];
      state = 'momentum';
      obstacles = []; bullets = []; missiles = []; pmissiles = []; soldiers = []; gusts = []; streaks = [];  // se limpia el campo (cinematica)
      mom = {
        t: 0, timer: ph.time, doneT: 0, turn: 0, pass: 1, cx: W / 2, cy: 80, hitFx: 0, fx: [],
        roll: 0, rollV: 0,   // ALABEO: el avion rola sobre su eje longitudinal (←/→); el mundo gira, la cabina no
        zones: ph.zones.map(z => Object.assign({}, z, { hp: z.maxHp }))
      };
      mom.cy = momShipGeom().deckY - 8;            // arranca apuntando a la cubierta (coords de MUNDO)
      const cm0 = momCam();
      popup(MOM_AX + cm0.x, 46 + cm0.y, T('mom_title'), P.warn);               // popups viven en espacio-mundo
      popup(MOM_AX + cm0.x, 56 + cm0.y, T('mom_pass', { n: momPhase + 1, m: MOM_PHASES.length }), P.dim);
      beep(620, 0.7, 'sine', 0.07, 65);   // sting de entrada: el tiempo se ESTIRA (pitch cayendo)
      boom(0.10);
      engineOff();
    }
    // VIRAJE 180 y nueva pasada sobre el mismo blanco. Las zonas conservan su hp: lo que ya
    // rompiste cuenta, asi que insistir avanza en vez de reiniciar. Cuesta combustible.
    function startReattack() {
      // FIN DE MISION si no lo destruiste: sin nafta para otra vuelta, o agotados los intentos.
      // Sin esto el bucle de re-ataque no termina nunca (fuel se clampea en 0 y seguis virando).
      const noFuel = cfg.fuelOn && fuel < REATTACK_FUEL;
      if (noFuel || mom.pass >= REATTACK_MAX) return die(noFuel ? 'death_fuel' : 'death_aa');
      mom.turn = REATTACK_DUR;
      mom.pass = (mom.pass || 1) + 1;
      stats.reattacks = (stats.reattacks || 0) + 1;
      if (cfg.fuelOn) fuel = Math.max(0, fuel - REATTACK_FUEL);
      const cm = momCam();
      popup(MOM_AX + cm.x, 50 + cm.y, T('mom_turn'), P.warn);
      sfxOne('waveFly');                                  // rafaga del viraje
      beep(300, 0.5, 'sine', 0.05, 700);                  // sting ascendente: reencarás
      shake = Math.min(6, shake + 2);
    }

    // objetivo cumplido → RECUENTO. Congela aca las estadisticas de la mision: entre niveles de
    // campaña se llama reset(), que las borraria.
    function finishObjective() {
      mom = null;
      freezeRun();
      state = 'results'; levelT = 0; resT = 0; resRow = 0;
      beep(700, 0.15, 'square', 0.06, 1000);
      engineOff();
    }
    // arma lastRun: el desglose de puntos, las estrellas y la calificacion de la mision
    function freezeRun() {
      const m = curMission();
      const flight = Math.floor(score);
      const kills = stats.air + stats.soldiers + stats.zones;
      const acc = stats.shots ? stats.hits / stats.shots : 0;
      const bKills = kills * 120;
      const bAcc = Math.round(acc * 1000);
      const bRas = stats.bestRas * 300;
      const total = flight + bKills + bAcc + bRas;
      const par = m.par || 8000;
      const starN = total >= par * 1.5 ? 3 : total >= par ? 2 : 1;
      lastRun = {
        mission: m, flight, kills, acc, bKills, bAcc, bRas, total, par, stars: starN,
        rank: RANKS[Math.min(RANKS.length - 1, starN - 1 + (acc > 0.6 ? 1 : 0))],
        rows: [
          { k: 'res_flight', v: flight },
          { k: 'res_kills', v: bKills, n: kills },
          { k: 'res_acc', v: bAcc, n: Math.round(acc * 100) + '%' },
          { k: 'res_ras', v: bRas, n: stats.bestRas },
        ],
      };
    }
    function updateMomentum(dt) {
      t -= dt * 0.70;                       // camara lenta: el mundo de fondo corre al 30%
      mom.t += dt;
      // El avion SIGUE AVANZANDO en camara lenta. Al 25% el flujo era tan tenue que, sumado al
      // tiempo ralentizado, se leia como si el avion estuviera clavado en el aire; al 50% se nota
      // que seguis entrando sin romper la sensacion de bullet-time.
      // dist se topa 2% antes del gatillo de la proxima pasada (para no encadenar momentums al
      // volver al vuelo), pero el sobrante va a momDrift — avance SOLO visual, sin tope: el mar
      // y el terreno nunca dejan de correr hacia vos.
      {
        const nextAt = (momPhase + 1 < MOM_PHASES.length) ? MOM_PHASES[momPhase + 1].at : 99;
        const adv = spd * MOM_ADVANCE * dt;
        const take = Math.min(adv, Math.max(0, objectiveDist * (nextAt - 0.02) - dist));
        dist += take; momDrift += adv - take;
      }
      // AUDIO de camara lenta: el motor pasa a ser un rumble GRAVE y ahogado con un pulso
      // lento tipo latido (el lowpass de 320Hz del motor hace el resto del efecto "bajo el agua")
      engineRumble(mom.t);
      popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
      popups = popups.filter(p => p.life > 0);

      // ---- FX de CAMARA LENTA (viven en coords de mundo; corren tambien durante el outro) ----
      // trazadoras AA de la barcaza, bocanadas de flak y rocio/escombros derivando por los costados.
      // Todo con velocidades LENTAS a proposito: vende el bullet-time. Son visuales, no danian.
      {
        const gfx = momShipGeom(), cmf = momCam();
        mom.flashL = Math.max(0, (mom.flashL || 0) - dt);   // resplandor de disparo: decae siempre
        mom.flashR = Math.max(0, (mom.flashR || 0) - dt);
        if (mom.fx.length < 70) {
          if (Math.random() < dt * 2.6) {                               // trazadora AA: nace en el barco y pasa de largo
            const x0 = gfx.cx + (Math.random() - 0.5) * gfx.len * 0.85;
            const y0 = gfx.deckY - gfx.uh * (0.6 + Math.random() * 1.6);
            const e = Math.random(); let tx, ty;                     // punto de fuga fuera de pantalla
            if (e < 0.38) { tx = cmf.x - 24; ty = cmf.y + Math.random() * H; }
            else if (e < 0.76) { tx = cmf.x + W + 24; ty = cmf.y + Math.random() * H; }
            else { tx = cmf.x + Math.random() * W; ty = cmf.y + H + 24; }
            const dx = tx - x0, dy = ty - y0, dl = Math.hypot(dx, dy) || 1;
            const sp = 26 + Math.random() * 30;
            mom.fx.push({ k: 'tr', x: x0, y: y0, vx: dx / dl * sp, vy: dy / dl * sp, life: 3.4, T: 0 });
          }
          if (Math.random() < dt * 3.6) {                               // rocio/escombro pasando por los costados
            // nace DENTRO del vidrio visible (los parantes tapan x<52 y x>268; el panel tapa y>62)
            // y deriva hacia afuera: cruza el vidrio y desaparece tras el marco
            const side = Math.random() < 0.5 ? -1 : 1;
            mom.fx.push({
              k: 'st', x: side < 0 ? cmf.x + 56 + Math.random() * 60 : cmf.x + W - 56 - Math.random() * 60,
              y: cmf.y + 15 + Math.random() * 55,
              vx: side * (10 + Math.random() * 16), vy: 4 + Math.random() * 8,
              len: 3 + Math.random() * 5, life: 2.2 + Math.random() * 1.4, T: 0
            });
          }
          if (Math.random() < dt * 1.1) {                               // flak: bocanada que se expande despacio
            mom.fx.push({
              k: 'fk', x: gfx.cx + (Math.random() - 0.5) * gfx.len * 1.4,
              y: gfx.deckY - gfx.uh * (2.5 + Math.random() * 4.5),
              vr: 4 + Math.random() * 4, life: 1.6, T: 0
            });
          }
        }
        for (const f of mom.fx) {
          f.T += dt; f.life -= dt;
          if (f.k === 'sh') {                                   // rafaga de canon: BALISTICA (sin tracking)
            const dx = f.tx - f.x, dy = f.ty - f.y, d = Math.hypot(dx, dy) || 1;
            const sp = 150;                                     // lenta (antes era hitscan instantaneo)
            f.vx = dx / d * sp; f.vy = dy / d * sp;
            if (d < 6 || f.life <= 0.05) {                      // IMPACTO donde APUNTASTE: chispas + dano fuerte
              for (let i = 0; i < 7; i++) parts.push({
                x: f.tx + (Math.random() - 0.5) * 5, y: f.ty + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 60, vy: -(15 + Math.random() * 45), life: 0.35,
                c: Math.random() < 0.5 ? P.warn : P.accent, r: 1.3
              });
              // pega en la zona que CONTENGA el punto de impacto (margen ±1): 45 de daño
              for (const z of mom.zones) {
                if (z.hp <= 0) continue;
                const r = momZoneRect(z);
                if (f.tx >= r.x - 1 && f.tx <= r.x + r.w + 1 && f.ty >= r.y - 1 && f.ty <= r.y + r.h + 1) {
                  z.hp -= 45; mom.hitFx = 1; stats.hits++;
                  boom(0.06); beep(88, 0.11, 'triangle', 0.05, 44);   // THUMP de impacto con cuerpo
                  if (z.hp <= 0) momZoneKilled(z);
                  break;
                }
              }
              f.life = 0; continue;
            }
          }
          if (f.k === 'ms') {                                   // misil del jugador: guiado lento hacia el blanco
            const dx = f.tx - f.x, dy = f.ty - f.y, d = Math.hypot(dx, dy) || 1;
            const sp = 70;                                       // lento a proposito: bullet-time
            f.vx += (dx / d * sp - f.vx) * Math.min(1, dt * 3.2);
            f.vy += (dy / d * sp - f.vy) * Math.min(1, dt * 3.2);
            if (Math.random() < 0.7) parts.push({                // estela de humo
              x: f.x, y: f.y, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12,
              life: 0.7, c: '#7c838a', r: 1.2
            });
            if (d < 5 || f.life <= 0.05) { momMissileBoom(f.x, f.y); f.life = 0; continue; }
          }
          if (f.vx !== undefined) { f.x += f.vx * dt; f.y += f.vy * dt; }
        }
        mom.fx = mom.fx.filter(f => f.life > 0);
      }
      if (mom.doneT > 0) {                 // salida: pasada completa o barcaza destruida
        mom.doneT -= dt;
        if (mom.doneT <= 0) {
          if (momPhase + 1 >= MOM_PHASES.length) return finishObjective();
          momPhase++; mom = null; state = 'play';
          popup(W / 2, 58, T('mom_next'), P.accent);
          beep(110, 0.4, 'sine', 0.06, 640);   // sting de salida: el tiempo VUELVE (pitch subiendo)
        }
        return;
      }
      // VIRAJE 180: el mundo rola como en un wingover y volvés a encarar el blanco. No corre el
      // reloj ni se puede disparar; el mar SI sigue corriendo (el bloque de avance ya paso arriba).
      if (mom.turn > 0) {
        mom.turn -= dt;
        const tp = 1 - Math.max(0, mom.turn) / REATTACK_DUR;   // 0..1
        mom.roll = Math.sin(tp * Math.PI) * Math.PI;           // rola 180° y sale derecho
        mom.rollV = 0;
        if (mom.turn <= 0) {                                   // reencarado: nueva pasada
          const ph2 = MOM_PHASES[momPhase];
          mom.turn = 0; mom.roll = 0; mom.t = 0; mom.timer = ph2.time;
          mom.cy = momShipGeom().deckY - 8;                    // la mira vuelve a la cubierta
          const cm2 = momCam();
          popup(MOM_AX + cm2.x, 56 + cm2.y, T('mom_pass_n', { n: mom.pass }), P.accent);
          beep(620, 0.5, 'sine', 0.06, 90);
        }
        return;
      }
      mom.timer -= dt;
      // misiles: misma municion que el vuelo normal; Z (o boton tactil) lanza
      mslCd = Math.max(0, mslCd - dt);
      if (inp.msl) momLaunchMissile();
      // ALABEO (roll): ←/→ hacen ROLAR el avion sobre su eje longitudinal (el que apunta a la
      // barcaza). El MUNDO ENTERO (horizonte + barco) gira alrededor del centro; la cabina queda
      // fija (sos vos el que rola). El barco esta ANCLADO (sin balanceo). ↑/↓ mueven la cabina.
      const CS = 98;
      mom.rollV += ((inp.r - inp.l) * 1.6 - mom.rollV) * Math.min(1, dt * 2.8);   // entra/sale con peso
      mom.roll += mom.rollV * dt;
      if (!inp.l && !inp.r) {
        // auto-nivelado suave hacia la vuelta completa mas cercana (permite toneles enteros)
        const lvl = Math.round(mom.roll / (Math.PI * 2)) * Math.PI * 2;
        mom.roll += (lvl - mom.roll) * Math.min(1, dt * 1.1);
      }
      mom.cy = Math.max(44, Math.min(122, mom.cy + (inp.d - inp.u) * CS * dt));
      // CANON en camara lenta: rafagas DISCRETAS — menos balas, mas lentas, mas dano por bala
      // (dps similar al hitscan anterior: 22 cada 0.36s ≈ 61). Cada bala nace en el ala, viaja
      // LENTA hasta el punto apuntado al disparar y, si habia una zona bajo la mira, la trackea
      // (lock) mientras el barco se balancea. El impacto es puntual y fuerte → efecto bullet-time.
      const cmw = momCam();
      // punto APUNTADO en coords de mundo (deshaciendo el roll): con MOUSE la mira es libre
      // sobre el vidrio (PC); sin mouse (tactil/legacy) apunta el visor fijo del centro
      const aimP = momScrToWorld(mouse.on ? mouse.x : MOM_AX, mouse.on ? mouse.y : MOM_AY);
      const aimX = aimP.x, aimY = aimP.y;
      mom.hitFx = Math.max(0, (mom.hitFx || 0) - dt * 5);   // flash breve al impactar (decae)
      mom.shotCd = Math.max(0, (mom.shotCd || 0) - dt);
      if (inp.fire && mom.shotCd <= 0) {
        mom.shotCd = 0.5;                                    // cadencia mas lenta: menos tiros, mas dañinos
        mom.gunSide = -(mom.gunSide || 1);                   // alterna ala izq/der
        // BALISTICA PURA: la bala vuela al punto APUNTADO al disparar (sin tracking) con
        // DISPERSION — mas abierta si estas rolando. Acertar es mas dificil, pero pega el doble.
        const spread = 3.5 + Math.abs(mom.rollV) * 5;
        const tx = aimX + (Math.random() - 0.5) * spread * 2;
        const ty = aimY + (Math.random() - 0.5) * spread * 2;
        // la bala nace en el ALA (posicion de pantalla, fuera del vidrio) convertida a mundo
        // con el roll aplicado: al rolar, tus alas rotan con vos
        const wing = momScrToWorld(mom.gunSide < 0 ? -40 : W + 40, 66);
        mom.fx.push({
          k: 'sh', x: wing.x, y: wing.y,
          tx, ty, life: 2.2, T: 0, vx: 0, vy: 0
        });
        // RESPLANDOR de fogonazo en el borde del lado que disparo (feedback instantaneo)
        if (mom.gunSide < 0) mom.flashL = 0.14; else mom.flashR = 0.14;
        // disparo real: xsmall_explosion / xsmall_explosion2 al azar. Sin samples (build web)
        // cae al beep grave y gordo de antes.
        if (!sfxOne('momGun')) beep(140, 0.12, 'square', 0.07, 55);
        boom(0.05);
      }
      // Se acabo la ventana de tiro: pasaste por encima y perdiste el angulo. NO es muerte —
      // virás 180° y volvés a entrar sobre el mismo blanco (ver startReattack).
      if (mom.timer <= 0) return startReattack();
    }

    // salpicadura de sangre + tierra al eliminar un soldado
    function bloodBurst(sx, sy, n) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.283, sp = 22 + Math.random() * 55, blood = Math.random() < 0.55;
        parts.push({
          x: sx + (Math.random() - 0.5) * 3, y: sy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 24, life: 0.35 + Math.random() * 0.45,
          c: blood ? (Math.random() < 0.5 ? '#a81b1b' : '#7a1212') : (Math.random() < 0.5 ? '#6b5a3a' : '#463a26'), r: 1 + Math.random() * 1.6
        });
      }
    }

    // PIRUETA (tonel / aileron roll): esquive cinematico con doble-tap ←/→
    function startRoll(dir) {
      if (state !== 'play' || rollT > 0 || rollCd > 0) return;
      rollT = ROLL_DUR; rollDir = dir; rollCd = 1.15;
      sfxOne('waveFly');                        // rafaga de aire de la pirueta
      beep(480, 0.16, 'triangle', 0.05, 900);   // whoosh ascendente
    }

    // lanza un misil del jugador (arma secundaria: limitada, one-shot, con leve guiado)
    function tryLaunchMissile() {
      if (state === 'momentum') return momLaunchMissile();   // primera persona: misil del momentum
      if (state !== 'play' || msl <= 0 || mslCd > 0) return;
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
      msl--; mslCd = 0.5;
      sfxOne('msl');   // lanzamiento real (misil.mp3 / misil2.wav al azar)
      beep(200, 0.2, 'sawtooth', 0.05, 80); boom(0.05, true);
    }

    function die(cause) {
      state = 'dead'; deathCause = cause; deathT = 0;
      sfxOne('exSmall');   // mi avion chocando (agua incluida, por ahora)
      factIdx = (factIdx + 1) % L().facts.length;
      explodeAt(plane.x, plane.y, PZ, true);
      const s = proj(plane.x, 0, PZ);
      for (let i = 0; i < 16; i++) parts.push({ x: s.x + (Math.random() - 0.5) * 24, y: s.y, vx: (Math.random() - 0.5) * 40, vy: -40 - Math.random() * 60, life: 0.6, c: P.foam, r: 1.6 });
      if (Math.floor(score) > best) { best = Math.floor(score); try { localStorage.setItem('rasante_frontal_best', best); } catch (e) { } }
      engineOff();
      beep(180, 0.5, 'sawtooth', 0.06, 40);
    }

    // ---------- update ----------
    function update(dt) {
      t += dt;
      tickDuck(dt);                      // el ducking de la musica se recupera solo
      fadeT = Math.max(0, fadeT - dt);   // fundido desde negro (se pinta al final de draw)
      updateSfx(dt, { state, cfg, plane, boost, firing: inp.fire, overheat, soldiers });   // loops con fade
      // camara CERCA: interpola hacia el objetivo; fuera de vuelo (o al morir) vuelve sola a 1
      // para que cada entrada a play arranque con zoom-in suave y sin saltos entre estados
      const camZt = (state === 'play' || state === 'takeoff') ? CAM_ZOOMS[camMode] : 1;
      camZ += (camZt - camZ) * Math.min(1, dt * 3.5);

      // despegue automático desde Puerto Argentino: el control llega a los 3 s
      if (state === 'takeoff') {
        toT += dt;
        const spdBase0 = Math.min(150, 62 + t * 2.8);
        spd = 6 + spdBase0 * Math.min(1, toT / 2.0);
        dist += spd * dt;
        if (toT > 1.35 && plane.y < 12) plane.y += 7.2 * dt;   // rotación y ascenso
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
        engineFly(spd, false, 0.017 * Math.min(1, toT));
        if (toT >= 3) { state = 'play'; popup(W / 2, 54, T('freeControl'), P.accent); shake = Math.min(6, shake + 1); }
        parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
        parts = parts.filter(p => p.life > 0);
        popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
        popups = popups.filter(p => p.life > 0);
        shake = Math.max(0, shake - dt * 10);
        anyPress = false;
        return;
      }

      if (state !== 'play') {
        if (state === 'dead') deathT += dt;
        if (state === 'victory') levelT += dt;
        parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
        parts = parts.filter(p => p.life > 0);
        engineOff();
        if (state === 'momentum') {
          shake = Math.max(0, shake - dt * 10);
          updateMomentum(dt);
          startReq = false; anyPress = false;
          return;
        }
        if (state === 'story') {
          // HISTORIA: tipeo letra a letra con tick de maquina de escribir; una tecla/tap
          // completa el texto, y con el texto completo la siguiente arranca el despegue con FADE
          story.t += dt;
          const st = storyTyped(story.t);
          if (st.typed > story.typed && !isMuted()) beep(1300 + Math.random() * 1100, 0.014, 'square', 0.013);
          story.typed = st.typed; story.done = st.done;
          // gracia de 0.4s: el tap/tecla que confirmo CAMPAÑA en el menu no debe saltear el tipeo
          if (anyPress && story.t > 0.4) {
            if (!story.done) { story.t += 999; }                          // completar de un saque
            else if (story.si + 1 < story.seq.length) {                   // → siguiente pantalla de la secuencia
              story.si++; initStoryScreen(); beep(500, 0.05, 'square', 0.04);
            } else { t = 0; fadeT = 1.4; state = 'takeoff'; sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
          }
        } else if (state === 'brief') {
          // tarjeta corta de mision (ciclo de muerte, y campaña sin guion): una tecla despega
          briefT += dt;
          if (briefT > 0.6 && anyPress) { t = 0; fadeT = 1.0; state = 'takeoff'; sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
        } else if (state === 'menu') {
          // el menú lo comparten SUPERVIVENCIA y CICLO DE MUERTE
          if (startReq) {
            reset(); setRunObjective();
            // ciclo: pasa por el briefing corto de la mision; supervivencia: derecho al despegue
            if (gameMode === 'cycle') { briefT = 0; state = 'brief'; beep(600, 0.08, 'square', 0.05); }
            else { state = 'takeoff'; sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
          }
        } else if (state === 'dead') {
          if (deathT > 0.7 && anyPress) { reset(); setRunObjective(); state = 'takeoff'; sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }  // reintenta (mismo modo/nivel)
        } else if (state === 'results') {
          // RECUENTO: las filas entran de a una; una tecla las completa de golpe, la siguiente pasa al epilogo
          resT += dt;
          const nRows = lastRun ? lastRun.rows.length : 0;
          const want = Math.min(nRows, Math.floor(resT / 0.45));
          if (want > resRow) { resRow = want; beep(760 + resRow * 90, 0.07, 'square', 0.05); }
          const full = resRow >= nRows && resT > nRows * 0.45 + 0.7;
          if (anyPress && resT > 0.5) {
            if (!full) { resT = nRows * 0.45 + 0.8; resRow = nRows; }   // completar de un saque
            else { initStory(lastRun.mission.epi); state = 'epilogue'; beep(500, 0.05, 'square', 0.04); }
          }
        } else if (state === 'epilogue') {
          // EPILOGO: reusa el motor de tipeo de la historia; al terminar, encadena segun el modo
          story.t += dt;
          const st = storyTyped(story.t);
          if (st.typed > story.typed && !isMuted()) beep(1300 + Math.random() * 1100, 0.014, 'square', 0.013);
          story.typed = st.typed; story.done = st.done;
          if (anyPress && story.t > 0.4) {
            if (!story.done) { story.t += 999; }
            else if (story.si + 1 < story.seq.length) { story.si++; initStoryScreen(); beep(500, 0.05, 'square', 0.04); }
            else if (gameMode === 'campaign') {
              // campaña: siguiente mision (conservando el puntaje acumulado) o victoria si era la ultima
              if (curLevel + 1 < MISSIONS.length) {
                const keep = score; loadLevel(curLevel + 1); reset(); score = keep;
                setRunObjective(); state = enterMission();
              } else { state = 'victory'; levelT = 0; }
            } else {
              // ciclo de muerte: otra mision al azar, desde cero
              randomMission(); reset(); setRunObjective(); briefT = 0; state = 'brief';
            }
          }
        } else if (state === 'victory') {
          if (levelT > 0.8 && anyPress) { state = 'modeselect'; }
        }
        startReq = false; anyPress = false;
        return;
      }
      anyPress = false;

      // velocidad — el multiplicador y la racha rasante aceleran el avión
      const spdBase = Math.min(150, 62 + t * 2.8);
      boost = inp.turbo && fuel > 0;
      // viento en contra: cuanto más tiempo arriba, más resistencia (hasta -35%)
      if (cfg.wind && plane.y > 16) windT = Math.min(6, windT + dt);
      else windT = Math.max(0, windT - dt * 2);
      windF = cfg.wind ? 1 - Math.min(0.35, Math.max(0, windT - 0.8) * 0.075) : 1;
      const rachaVel = 1 + rasLevel * 0.12 + (mult >= 10 ? 0.10 : mult >= 5 ? 0.05 : 0);
      // AFTERBURNER SOSTENIDO: aguantar BOOST + RASANTE acumula tiempo; cada AFTER_STEP s sube un
      // escalón (hasta AFTER_MAX). Cada escalón multiplica la velocidad (AFTER_GAIN) y levanta el
      // techo (AFTER_CAP) para que el aumento se SIENTA. Soltar turbo o trepar lo corta (con gracia).
      const rasNow = plane.y <= 4.5;
      if (boost && rasNow) { afterT += dt; afterGrace = 0.4; }
      else if (afterGrace > 0) afterGrace -= dt;   // bob corto no rompe la racha
      else afterT = 0;
      const prevTier = afterTier;
      afterTier = Math.min(AFTER_MAX, Math.floor(afterT / AFTER_STEP));
      if (afterTier > prevTier) {                   // subió de escalón: feedback
        const s = proj(plane.x, plane.y, PZ);
        popup(s.x, s.y - 22, T('afterburner', { n: afterTier }), P.warn);
        beep(360 + afterTier * 130, 0.16, 'sawtooth', 0.06, 220 + afterTier * 90);
        shake = Math.min(6, shake + 1.1);
        for (let i = 0; i < 10 + afterTier * 3; i++) {
          const a = Math.random() * 6.283;
          streaks.push({ a, r: 20 + Math.random() * 18, v: 320 + Math.random() * 220, life: 0.5 });
        }
      }
      const afterMul = 1 + afterTier * AFTER_GAIN;
      const spdTarget = Math.min(280 + afterTier * AFTER_CAP, spdBase * rachaVel * windF * (boost ? 1.5 : 1) * afterMul);
      // INTERCAMBIO DE ENERGIA (cfg.energy): la ALTURA es energia almacenada — picar la convierte
      // en velocidad, trepar la gasta. Es lo que arma el pendulo (bajar rapido → rasar → trepar).
      // El arrastre hacia spdTarget se AFLOJA (3 → ENERGY_DRAG) porque con el lerp rapido de antes
      // lo que ganabas picando se evaporaba en medio segundo y no se acumulaba nada.
      if (cfg.energy) {
        spd += (spdTarget - spd) * Math.min(1, dt * ENERGY_DRAG);
        spd += (-plane.vy) * ENERGY_K * dt;                       // vy<0 (picada) suma, vy>0 (trepada) resta
        spd = Math.max(34, Math.min(spdTarget * ENERGY_MAX, spd));   // techo: picar premia, no rompe
      } else {
        spd += (spdTarget - spd) * Math.min(1, dt * 3);
      }
      // turbulencia: el viento sacude el avión
      if (windF < 0.97) {
        plane.vx += (Math.random() - 0.5) * 95 * (1 - windF) * dt * 4;
        plane.vy += (Math.random() - 0.5) * 70 * (1 - windF) * dt * 4;
        shake = Math.max(shake, (1 - windF) * 3.5);
        if (Math.random() < 0.02) boom(0.03, true);
      }
      // ráfagas visibles cruzando el cielo
      if (windT > 0.8 && Math.random() < (windT / 6) * 0.9)
        gusts.push({ x: W + 10, y: 4 + Math.random() * (HOR + 26), v: 260 + Math.random() * 170, len: 10 + Math.random() * 18, life: 2 });
      gusts.forEach(g => { g.x -= g.v * dt; g.life -= dt; });
      gusts = gusts.filter(g => g.x > -32 && g.life > 0);
      dist += spd * dt;
      fuelDist += spd * dt;

      // OBJETIVO cumplido. Segun el tipo de meta (ver GOALS):
      //   - con climax (ship): al acercarse al blanco arranca el asalto por pasadas (MOMENTUM)
      //   - sin climax (distance): llegar a la distancia YA cierra la mision
      if (objectiveDist > 0) {
        const needsMom = (gameMode === 'campaign' || gameMode === 'cycle') ? goalOf(curMission()).needsMomentum : true;
        if (needsMom) {
          if (momPhase < MOM_PHASES.length && dist >= objectiveDist * MOM_PHASES[momPhase].at) { enterMomentum(); return; }
        } else if (dist >= objectiveDist) { finishObjective(); return; }
      }

      // maniobra
      if (steerTarget) {
        const wx = (steerTarget.x - W / 2) / (F / PZ) + cam.x;
        const wy = cam.y - (steerTarget.y - HOR) / (F / PZ);
        plane.vx = Math.max(-30, Math.min(30, (wx - plane.x) * 5));
        plane.vy = Math.max(-24, Math.min(24, (wy - plane.y) * 5));
      } else {
        plane.vx += (inp.r - inp.l) * 115 * dt;
        if (!inp.r && !inp.l) plane.vx *= Math.max(0, 1 - 4.5 * dt);
        plane.vx = Math.max(-30, Math.min(30, plane.vx));
        // gas: mantener ARRIBA empuja hacia arriba; al soltar, la gravedad gana y el avión cae
        const G = 22, TH = 55, DIVE = 30;
        plane.vy += (((inp.u && fuel > 0) ? TH : 0) - G - (inp.d ? DIVE : 0)) * dt;
        plane.vy = Math.max(-20, Math.min(18, plane.vy));
      }
      // PIRUETA (tonel): rafaga lateral fuerte que decae + estelas de viento; el perfil de
      // colision se ENCOGE mientras rola (alas "de canto") → pasa por espacios mas finos
      rollCd = Math.max(0, rollCd - dt);
      if (rollT > 0) {
        rollT -= dt;
        plane.vx = rollDir * 40 * (0.45 + rollT / ROLL_DUR);
        if (Math.random() < 0.85) {
          const sp2 = proj(plane.x + (Math.random() - 0.5) * 3, plane.y + (Math.random() - 0.5) * 2, PZ);
          parts.push({
            x: sp2.x - rollDir * 10, y: sp2.y, vx: -rollDir * (55 + Math.random() * 40),
            vy: (Math.random() - 0.5) * 20, life: 0.3, c: P.crest, r: 1
          });
        }
      }
      // throttle (palanca de gas): sube al dar gas, baja al soltar — solo indicador visual
      const gasOn = fuel > 0 && (inp.u || (steerTarget && plane.vy > 0.5));
      throttle += ((gasOn ? 1 : 0) - throttle) * Math.min(1, dt * 7);
      if (cfg.fuelOn) fuel -= (3.2 + (boost ? 4.2 : 0)) * dt;   // COMBUSTIBLE: NO (menú [M]) = tanque infinito, para pruebas
      if (fuel <= 0) { fuel = 0; plane.vy = Math.min(plane.vy, -5); }
      plane.x += plane.vx * dt;
      plane.y += plane.vy * dt;
      if (plane.x < -FLY_X) { plane.x = -FLY_X; plane.vx = 0; }
      if (plane.x > FLY_X) { plane.x = FLY_X; plane.vx = 0; }
      if (plane.y > FLY_TOP) { plane.y = FLY_TOP; plane.vy = 0; }

      cam.x += (plane.x * 0.86 - cam.x) * Math.min(1, dt * 7);
      cam.y += (plane.y + 2.6 - cam.y) * Math.min(1, dt * 7);
      if (cam.y < 3.4) cam.y = 3.4;

      // --- animación de vuelo: alabeo (bank) y cabeceo (pitch) suavizados ---
      // el alabeo mezcla la intención de giro (input) con la velocidad real → anticipa y asienta
      const steerV = steerTarget ? plane.vx / 26 : ((inp.r - inp.l) * 0.9 + (plane.vx / 30) * 0.35);
      const bankTarget = Math.max(-1, Math.min(1, steerV));
      // cabeceo: la tecla mueve la trompa SOLO si se mantiene apretada un instante — los toques rápidos
      // de gas (↑ repetido) no la sacuden y el avión queda recto; si mantenés ↑/↓ sí cabecea.
      const vin = inp.u - inp.d;   // -1 pica / 0 / +1 trepa
      pitchHold = vin !== 0 ? pitchHold + dt : 0;
      const holdRamp = Math.max(0, Math.min(1, (pitchHold - PITCH_DELAY) / PITCH_RAMP));
      // PITCH_VY es bajo a proposito: con un peso alto, la velocidad vertical real disparaba el
      // sprite de trepada por su cuenta a los ~0.6 s y estirar la zona muerta no servia de nada.
      const pitchV = vin * 0.9 * holdRamp + (plane.vy / 22) * PITCH_VY;
      const pitchTarget = Math.max(-1, Math.min(1, pitchV));
      plane.bank += (bankTarget - plane.bank) * Math.min(1, dt * 9);   // entra/sale con peso
      plane.pitch += (pitchTarget - plane.pitch) * Math.min(1, dt * 9);   // igual de rapido que el alabeo

      // puntaje por altitud + racha rasante
      const alt = plane.y;
      mult = multOf(alt);
      if (alt <= 4.5) { streak += dt; graceT = 0.45; }
      else if (graceT > 0) graceT -= dt;
      else { streak = 0; rasLevel = 0; }
      const newLevel = Math.min(4, Math.floor(streak / 2));
      if (newLevel > rasLevel) {
        rasLevel = newLevel;
        stats.bestRas = Math.max(stats.bestRas, rasLevel);   // mejor nivel de racha alcanzado
        const s = proj(plane.x, plane.y, PZ);
        popup(s.x, s.y - 16, T('rasante', { n: 10 + rasLevel * 5 }), P.accent);
        beep(500 + rasLevel * 180, 0.14, 'square', 0.06, 750 + rasLevel * 180);
        shake = Math.min(6, shake + 1.4);
        // oleada de líneas de velocidad al subir de nivel
        for (let i = 0; i < 14; i++) {
          const a = Math.random() * 6.283;
          streaks.push({ a, r: 24 + Math.random() * 16, v: 280 + Math.random() * 180, life: 0.5 });
        }
      }
      multShow = mult === 10 ? 10 + rasLevel * 5 : mult;
      score += (boost ? 2 : 1) * 12 * multShow * dt;
      // superficie LETAL: tocar el suelo (o el agua) = explotar. Sobre tierra hay que volar en la banda
      // baja y arriesgada (arriba del suelo, pero bajo para clipear/matar soldados con el pase rasante).
      const overRunway = dist + PZ < cfg.coast;
      let groundY, deathMsg;
      if (cfg.terrain === 'land') { groundY = 0.5; deathMsg = 'death_land'; }
      else if (overRunway) { groundY = 0.9; deathMsg = 'death_land'; }
      else { groundY = waveNow(); deathMsg = 'death_sea'; }
      // TOCAR LA SUPERFICIE: ya no es muerte instantanea. El avion ROZA y tambalea (perdes control:
      // sacudon, guiñada, chispas) y tenes que sacarlo. El reloj de gracia se agota MUCHO mas rapido
      // cuanto mas rapido vas — a fondo con turbo casi no hay margen. Si se agota, ahi si morís.
      // HISTERESIS: se ENTRA al roce tocando la superficie (y <= groundY), pero una vez adentro el
      // avion se sostiene un poco mas arriba (SCRAPE_LIFT) y sigue rozando hasta que trepás y salís
      // de la banda. Sin esto, sostenerlo mas alto hacia que la condicion fallara al frame siguiente
      // y el roce se cancelaba solo.
      const scrapeY = groundY + SCRAPE_LIFT;
      if (plane.y <= (scrapeT > 0 ? scrapeY + 0.2 : groundY)) {
        const sf = Math.max(0, Math.min(1, (spd - 90) / 190));            // 0 lento .. 1 a fondo
        const lim = (SCRAPE_BASE - (SCRAPE_BASE - SCRAPE_MIN) * sf) * (boost ? 0.55 : 1);
        scrapeT += dt;
        if (scrapeT >= lim) return die(deathMsg);                          // se agoto el margen
        // PISO, no altura fija: no se hunde, no salta solo, pero SI podes trepar dando gas.
        // (con "plane.y = scrapeY" quedaba clavado: vy acumulaba empuje sin mover el avion y
        //  salias catapultado un segundo despues, o te morias antes de lograrlo)
        if (plane.y < scrapeY) plane.y = scrapeY;
        if (plane.vy < 0) plane.vy = 0;
        plane.vy += (Math.random() - 0.5) * 26 * dt;                       // tambaleo vertical
        scrapeVib = 1;                                                     // el AVION vibra (ver drawPlaneSprite)
        plane.vx += (Math.random() - 0.5) * 140 * dt;                      // guiñada erratica
        spd = Math.max(34, spd - spd * 1.1 * dt);                          // el roce FRENA
        shake = Math.min(7, shake + 26 * dt);
        streak = 0; rasLevel = 0; afterT = 0; afterTier = 0;               // se corta la racha
        // chispas / rocio del roce
        const sp = proj(plane.x, groundY, PZ);
        for (let i = 0; i < 3; i++) parts.push({
          x: sp.x + (Math.random() - 0.5) * 14, y: sp.y, vx: (Math.random() - 0.5) * 90,
          vy: -30 - Math.random() * 70, life: 0.35,
          c: cfg.terrain === 'land' ? P.accent : P.crest, r: 1.4
        });
        if (!sfxOne('waveFly')) beep(90 + Math.random() * 60, 0.05, 'sawtooth', 0.05);
        // aviso pegado al limite: cuanto le queda al margen
        if (Math.sin(t * 30) > 0) popup(sp.x, sp.y - 26, T('scrape'), P.warn);
      } else {
        scrapeT = Math.max(0, scrapeT - dt * SCRAPE_RECOVER);   // salir descuenta, pero no borra
        scrapeVib = Math.max(0, scrapeVib - dt * 6);            // la vibracion se apaga al salir
      }

      // estela sobre el agua
      const lowI = Math.max(0, 1 - alt / 9);
      if (lowI > 0 && !overRunway && cfg.terrain !== 'land') {
        wake.push({ x: plane.x, z: PZ, i: lowI });
        if (wake.length > 150) wake.shift();
      }
      for (const wp of wake) wp.z -= spd * dt;
      wake = wake.filter(w => w.z > 2.4);

      // rocío a ras del agua (escala con la cercanía) — solo sobre agua; sobre tierra levanta polvo
      const nSpray = alt < 2.8 ? 6 : alt < 4.5 ? 3 : alt < 7 ? 1 : 0;
      for (let i = 0; i < nSpray; i++) {
        const s = proj(plane.x + (Math.random() - 0.5) * 4, 0, PZ - Math.random() * 2);
        const onLand = cfg.terrain === 'land';
        parts.push({
          x: s.x, y: s.y - 1, vx: (Math.random() - 0.5) * 70, vy: -(50 + Math.random() * 110) * (0.5 + lowI),
          life: 0.25 + Math.random() * 0.3, c: onLand ? (Math.random() < 0.6 ? '#6b6250' : '#4a4636') : (Math.random() < 0.7 ? P.foam : P.crest), r: 1 + Math.random() * 1.3
        });
      }
      if (alt < 4.5) shake = Math.max(shake, (4.5 - alt) * 0.3);

      // radar
      if (alt > 30) detection += dt / 1.4; else detection -= dt / 0.9;
      detection = Math.max(0, Math.min(1, detection));
      if (detection >= 1) {
        detection = 0.35;
        missiles.push({ x: plane.x + (Math.random() * 24 - 12), y: plane.y + 4, z: 230, done: false });
        beep(880, 0.12, 'square', 0.06); setTimeout(() => beep(880, 0.12, 'square', 0.06), 160);
      }

      // cañón
      fireT -= dt;
      heat -= dt * (inp.fire ? 0.22 : 0.5);
      if (heat < 0) heat = 0;
      if (overheat && heat < 0.3) overheat = false;
      if (inp.fire && !overheat && fireT <= 0) {
        fireT = 1 / 9; stats.shots++;   // denominador de la PRECISION del recuento
        const vm = viewMouse();
        if (vm.on) {
          // MIRA CON MOUSE (PC): desproyecta el cursor al mundo a z=110. La bala SALE DEL AVION
          // y vuela en linea RECTA 3D que pasa por el punto apuntado (trayectoria balistica,
          // no lerp: se ve nacer en el avion y viajar hacia la mira)
          const k = F / 110;
          const tx = Math.max(-40, Math.min(40, (vm.x - W / 2) / k + cam.x));
          const ty = Math.max(0, cam.y - (vm.y - HOR) / k);
          bullets.push({ x: plane.x, y: plane.y, z: PZ + 3, x0: plane.x, y0: plane.y, z0: PZ + 3, tx, ty, path: true });
        } else {
          // tactil/legacy: apuntado vertical automatico al blanco aereo mas cercano del carril
          let ty = plane.y, td = 5.6;
          for (const o of obstacles) {
            if (o.hp === undefined || o.z <= PZ + 3 || o.z > 210) continue;
            const d = Math.abs(o.x - plane.x);
            if (d < td) { td = d; ty = o.y; }
          }
          bullets.push({ x: plane.x, y: plane.y, z: PZ + 3, ty });
        }
        heat += 0.10;
        if (heat >= 1) { overheat = true; beep(140, 0.3, 'sawtooth', 0.05); }
        else if (!sfxSrc('gun')) beep(1100 + Math.random() * 300, 0.04, 'square', 0.028);   // web: beep; escritorio: loop de metralla
      }

      // misiles del jugador: cooldown, recarga lenta y lanzamiento (tecla Z / botón táctil)
      mslCd -= dt;
      if (msl < MSL_MAX) { mslRegen += dt; if (mslRegen >= 7) { mslRegen = 0; msl++; } }
      if (inp.msl) tryLaunchMissile();

      // spawn por distancia
      nextSpawn -= spd * dt;
      if (cfg.obstacles > 0 && nextSpawn <= 0) {
        spawn();
        nextSpawn = Math.max(34, (52 + Math.random() * 42) - t * 0.8) / cfg.obstacles;
      }

      // spawn de soldados (solo sobre tierra) — en grupos que corren
      if (cfg.terrain === 'land') {
        nextSoldier -= spd * dt;
        if (nextSoldier <= 0) {
          const lane = Math.random() * 44 - 22, n = 2 + (Math.random() * 3 | 0);
          for (let i = 0; i < n; i++) soldiers.push({ x: lane + (Math.random() * 12 - 6), z: 250 + Math.random() * 24, ph: Math.random() * 6, dir: Math.random() < 0.5 ? -1 : 1 });
          nextSoldier = 40 + Math.random() * 55;
        }
      }
      // soldados: corren y se acercan; atropellarlos a ras del suelo = MUCHÍSIMOS puntos
      for (const sd of soldiers) {
        if (sd.dead) continue;
        sd.z -= spd * dt;
        sd.x += sd.dir * 6 * dt;                                  // corren en diagonal
        if (sd.z <= PZ + 1 && sd.z > PZ - 4 && Math.abs(plane.x - sd.x) < 4 && plane.y < 3) {
          sd.dead = true;                                        // pase rasante: cabeza / impacto de aire (banda 0.5–3)
          sfxOne('body');                                        // impacto de cuerpo (una variante al azar)
          const pts = Math.round(120 * multShow);                // escala con el multiplicador (a ras = brutal)
          score += pts; stats.soldiers++;
          const s = proj(sd.x, 0, PZ); popup(s.x, s.y - 10, '+' + pts, P.warn);
          bloodBurst(s.x, s.y, 18);                               // sangre + tierra
          bloodSplat = Math.min(1, bloodSplat + 0.5);             // mancha el sprite (se desvanece)
          shake = Math.min(6, shake + 1.2); boom(0.05);
        }
      }
      soldiers = soldiers.filter(sd => sd.z > -6 && !sd.dead);

      // obstáculos
      for (const o of obstacles) {
        o.z -= (spd + (o.type === 'jet' ? 45 : 0)) * dt;   // el avion enemigo viene de frente: cierra mas rapido
        if (!o.done && o.z <= PZ + 1.5) {
          o.done = true;
          const air = o.type === 'helo' || o.type === 'jet';
          let hw, hh, oy;
          if (o.type === 'mast') { hw = 0.9; hh = o.h; oy = o.h / 2; }
          else { hw = air ? 3 : 2.6; hh = air ? 1.6 : 1.9; oy = o.y; }
          // perfil del avion AFINADO (antes 2.6×1.2, chocaba "de lejos"); en PIRUETA las alas
          // van de canto → perfil minimo: pasa por espacios mucho mas finos
          const pw = rollT > 0 ? 1.0 : 2.1, ph2 = rollT > 0 ? 0.7 : 1.0;
          const dx = Math.abs(plane.x - o.x) - (hw + pw);
          const dy = Math.abs(plane.y - oy) - (hh + ph2);
          const hullHit = o.type === 'mast' && Math.abs(plane.x - o.x) < 5 + pw && plane.y < 3.6;
          if (o.type === 'fuel') {
            if (dx < 1.5 && dy < 1.5) {
              fuel = Math.min(100, fuel + 30); stats.fuelPicks++;
              const s = proj(o.x, o.y, PZ); popup(s.x, s.y, T('pickFuel'), P.foam);
              beep(700, 0.1, 'triangle', 0.05, 1000); o.z = -99;
            }
          } else if ((dx < 0 && dy < 0) || hullHit) {
            return die(o.type === 'mast' ? 'death_mast' : o.type === 'helo' ? 'death_helo' : o.type === 'jet' ? 'death_jet' : 'death_balloon');
          } else if (dx < 3 && dy < 3) {
            const pir = rollT > 0;                       // rozar EN PIRUETA: bonus grande (estilo)
            score += pir ? 250 : 75; stats.grazes++; shake = Math.min(6, shake + 1.5);
            sfxOne('waveFly');                           // rafaga de aire del pase cercano
            const s = proj(o.x, oy, PZ); popup(s.x, s.y - 8, pir ? T('rollGraze') : T('graze'), pir ? P.accent : P.foam);
            boom(0.06, true);
          }
        }
      }
      obstacles = obstacles.filter(o => o.z > 2);

      // misiles
      for (const m of missiles) {
        m.z -= (spd + 85) * dt;
        m.x += Math.max(-20, Math.min(20, (plane.x - m.x) * 2.4)) * dt;
        m.y += Math.max(-14, Math.min(14, (plane.y - m.y) * 2.0)) * dt;
        if (!m.done && m.z <= PZ + 1.2) {
          m.done = true;
          if (Math.abs(plane.x - m.x) < (rollT > 0 ? 1.6 : 3) && Math.abs(plane.y - m.y) < (rollT > 0 ? 1.2 : 2.2)) return die('death_missile');
          score += 75; stats.dodges++; const s = proj(m.x, m.y, PZ); popup(s.x, s.y - 8, T('dodgeMissile'), P.foam); boom(0.06, true);
        }
        if (Math.random() < 0.6) {
          const s = proj(m.x, m.y, m.z + 2);
          parts.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 0.45, c: P.dim, r: Math.max(1, s.k * 0.3) });
        }
      }
      missiles = missiles.filter(m => m.z > 2);

      // balas
      for (const b of bullets) {
        const z0 = b.z;
        b.z += 300 * dt;
        if (b.path) {
          // balistica recta (mira con mouse): interpola desde el AVION hacia el punto apuntado
          // en funcion del avance en z; pasa exacto por la mira a z=110 y sigue derecho
          const f = (b.z - b.z0) / (110 - b.z0);
          b.x = b.x0 + (b.tx - b.x0) * f;
          b.y = Math.max(0, b.y0 + (b.ty - b.y0) * f);
        } else if (b.ty !== undefined) b.y += (b.ty - b.y) * Math.min(1, dt * 14);
        for (const o of obstacles) {
          if (o.hp === undefined) continue;
          if (o.z < z0 - 2 || o.z > b.z + 2) continue;
          const oy = o.y, air = o.type === 'helo' || o.type === 'jet';
          if (Math.abs(b.x - o.x) < (air ? 5.6 : 3) && Math.abs(b.y - oy) < (air ? 3 : 2.4)) {
            o.hp--; b.z = 999; stats.hits++;
            if (o.hp <= 0) {
              const pts = o.type === 'helo' ? 300 : o.type === 'jet' ? 250 : 150;
              score += pts; stats.air++;
              sfxOne(air ? 'exMedium' : 'exXsmall');   // aeronaves: medium · blancos chicos: xsmall
              const s = proj(o.x, oy, o.z); popup(s.x, s.y - 8, '+' + pts);
              explodeAt(o.x, oy, o.z, air);
              o.z = -99; o.done = true;   // done=true: evita que el obstáculo muerto dispare la colisión del avión
            } else { beep(300, 0.05, 'triangle', 0.04); }
            break;
          }
        }
        if (b.z >= 999) continue;
        for (const m of missiles) {
          if (m.z < z0 - 2 || m.z > b.z + 2) continue;
          if (Math.abs(b.x - m.x) < 2.6 && Math.abs(b.y - m.y) < 2.2) {
            b.z = 999; score += 400; stats.hits++; stats.air++;
            const s = proj(m.x, m.y, m.z); popup(s.x, s.y - 8, '+400', P.warn);
            explodeAt(m.x, m.y, m.z, true);
            m.z = -99; m.done = true;   // done=true: evita que el misil enemigo derribado dispare la muerte del avión
            break;
          }
        }
        if (b.z >= 999) continue;
        // ametralla soldados en tierra: bala baja y alineada (por eso hay que estar de frente y a distancia)
        if (cfg.terrain === 'land' && b.y < 4) {
          for (const sd of soldiers) {
            if (sd.dead || sd.z < z0 - 2 || sd.z > b.z + 2) continue;
            if (Math.abs(b.x - sd.x) < 2.6) {
              sd.dead = true; b.z = 999;
              const pts = Math.round(60 * (multShow >= 5 ? 2 : 1));
              score += pts; stats.hits++; stats.soldiers++; const s = proj(sd.x, 0, sd.z); popup(s.x, s.y - 8, '+' + pts, P.foam);
              bloodBurst(s.x, s.y, 8);
              beep(240, 0.05, 'square', 0.04); break;
            }
          }
        }
      }
      bullets = bullets.filter(b => b.z < 240);

      // MISILES DEL JUGADOR — viajan hacia el horizonte y destruyen blancos aéreos.
      // IMPORTANTE: nunca se chequean contra el hitbox del avión (no pueden causar la muerte del jugador).
      for (const pm of pmissiles) {
        const z0 = pm.z;
        pm.z += 360 * dt;
        pm.vy -= 26 * dt; pm.y += pm.vy * dt;                                     // caída/arco
        if (pm.tx !== undefined) pm.x += (pm.tx - pm.x) * Math.min(1, dt * 6);   // guiado leve al blanco
        if (Math.random() < 0.7) { const s = proj(pm.x, pm.y, pm.z - 3); parts.push({ x: s.x, y: s.y, vx: 0, vy: 0, life: 0.3, c: P.accent, r: Math.max(1, s.k * 0.35) }); }
        // impacto con obstáculos aéreos (hitbox amplio, one-shot)
        for (const o of obstacles) {
          if (o.hp === undefined || o.z < z0 - 4 || o.z > pm.z + 4) continue;
          if (Math.abs(pm.x - o.x) < 8 && Math.abs(pm.y - o.y) < 5) {
            const pts = (o.type === 'helo' ? 300 : o.type === 'jet' ? 250 : 150) + 100;   // +bonus por misil
            score += pts; stats.air++;
            const s = proj(o.x, o.y, o.z); popup(s.x, s.y - 8, '+' + pts, P.accent);
            explodeAt(o.x, o.y, o.z, true);
            o.z = -99; o.done = true; o.hp = 0;                 // done=true: no puede chocar al avión luego
            pm.z = 9999; break;
          }
        }
        if (pm.z >= 9999) continue;
        // intercepta misiles enemigos
        for (const m of missiles) {
          if (m.z < z0 - 4 || m.z > pm.z + 4) continue;
          if (Math.abs(pm.x - m.x) < 6 && Math.abs(pm.y - m.y) < 4) {
            score += 400; stats.air++;
            const s = proj(m.x, m.y, m.z); popup(s.x, s.y - 8, '+400', P.warn);
            explodeAt(m.x, m.y, m.z, true);
            m.z = -99; m.done = true; pm.z = 9999; break;
          }
        }
        if (pm.z >= 9999) continue;
        // sobre TIERRA: explota contra el suelo o cerca de soldados, con splash
        if (cfg.terrain === 'land') {
          let detonate = pm.y <= 0.3;
          if (!detonate) for (const sd of soldiers) { if (!sd.dead && Math.abs(sd.z - pm.z) < 6 && Math.abs(sd.x - pm.x) < 4) { detonate = true; break; } }
          if (detonate) {
            explodeAt(pm.x, 0, pm.z, true); shake = Math.min(6, shake + 1.6);
            let hit = 0;
            for (const sd of soldiers) {
              if (!sd.dead && Math.abs(sd.z - pm.z) < 11 && Math.abs(sd.x - pm.x) < 10) {
                sd.dead = true; hit++;
                const ss = proj(sd.x, 0, sd.z); bloodBurst(ss.x, ss.y, 7);
              }
            }
            if (hit) { const pts = hit * 130; score += pts; stats.soldiers += hit; const s = proj(pm.x, 0, pm.z); popup(s.x, s.y - 10, '+' + pts, P.warn); }
            pm.z = 9999;
          }
        }
      }
      pmissiles = pmissiles.filter(pm => pm.z < 240 && pm.y > -3);

      // líneas de velocidad
      if (boost || rasLevel > 0 || spd > 115) {
        const n = (boost ? 3 : 1) + rasLevel + afterTier;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.283;
          streaks.push({ a, r: 26 + Math.random() * 20, v: 240 + Math.random() * 160, life: 0.5 });
        }
      }
      streaks.forEach(s => { s.r += s.v * dt; s.life -= dt; });
      streaks = streaks.filter(s => s.life > 0 && s.r < 260);

      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
      parts = parts.filter(p => p.life > 0);
      popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
      popups = popups.filter(p => p.life > 0);
      shake = Math.max(0, shake - dt * 10);
      bloodSplat = Math.max(0, bloodSplat - dt * 0.3);   // la mancha de sangre se desvanece (~3 s)
      if (boost) shake = Math.max(shake, 0.8 + (plane.y < 5 ? 0.7 : 0));

      engineFly(spd, boost, boost ? 0.030 : 0.017);
      if (fuel <= 0 && Math.random() < 0.05) beep(90, 0.08, 'sawtooth', 0.03);
    }

    // ---------- render ----------
    function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); }

    function drawSea() {
      const landMode = cfg.terrain === 'land';
      const dv = dist + momDrift;   // distancia VISUAL (drift del momentum incluido)
      const landVisible = dv < cfg.coast + 80;
      for (let y = HOR + 1; y < H; y++) {
        const dy = y - HOR;
        const z = cam.y * F / dy;
        const wz = z + dv;
        if (landVisible && wz < cfg.coast) {
          // turba malvinense con la pista de la BAM
          const vl = Math.sin(wz * 0.22) + Math.sin(wz * 0.07);
          px(-70, y, W + 140, 1, vl > 0.8 ? '#39402f' : vl < -0.8 ? '#2b3226' : '#323a2b');
          const k = F / z;
          const x1 = W / 2 + (-7 - cam.x) * k, x2 = W / 2 + (7 - cam.x) * k;
          px(x1, y, x2 - x1, 1, '#41474b');                                   // asfalto
          if (Math.floor(wz / 9) % 2 === 0)
            px(W / 2 + (0 - cam.x) * k - Math.max(1, 0.5 * k) / 2, y, Math.max(1, 0.5 * k), 1, '#9aa39b'); // eje
          if (Math.floor(wz / 14) % 2 === 0) {                                  // balizas
            px(x1 - Math.max(1, 0.5 * k), y, Math.max(1, 0.5 * k), 1, P.accent);
            px(x2, y, Math.max(1, 0.5 * k), 1, P.accent);
          }
          continue;
        }
        if (landMode) {                                                      // TIERRA: bandas de suelo por profundidad
          const f = dy / (H - HOR);
          px(-70, y, W + 140, 1, f < 0.28 ? LAND.far : f < 0.6 ? LAND.mid : LAND.near);
          if (Math.sin(wz * 0.13) + Math.sin(wz * 0.05) < -0.95) px(-70, y, W + 140, 1, LAND.furrow);  // surcos
          continue;
        }
        if (landVisible && wz < cfg.coast + 7) { px(-70, y, W + 140, 1, P.foam); continue; }  // rompiente
        // base oscura del mar (degradado por profundidad) para que los puntos resalten
        const f = dy / (H - HOR);
        px(-70, y, W + 140, 1, f < 0.22 ? WATER.base0 : f < 0.5 ? WATER.base1 : WATER.base2);
      }
      if (landMode) drawLand(); else drawSeaDots(landVisible);
    }

    // matas/rocas dispersas sobre la tierra (parallax de movimiento a ras del suelo)
    function drawLand() {
      const SPX = 4.2, SPZ = 4.2, farZ = 190;
      const dv = dist + momDrift;
      const startZ = Math.max(cfg.coast + 2, Math.ceil((dv + 4) / SPZ) * SPZ);
      for (let wz = startZ; wz < dv + farZ; wz += SPZ) {
        const camZ = wz - dv, k = F / camZ;
        const fade = Math.min(1, (camZ - 3) / 9) * (1 - (camZ / farZ) * 0.8);
        if (fade <= 0.03) continue;
        for (let wx = Math.ceil((cam.x - 74) / SPX) * SPX; wx < cam.x + 74; wx += SPX) {
          const r = Math.sin(wx * 12.9 + wz * 7.3);
          if (r < 0.35) continue;                                            // dispersa (no cubre todo)
          const s = proj(wx, 0, camZ);
          if (s.x < -4 || s.x > W + 4 || s.y < HOR) continue;
          const rock = r > 0.86;
          ctx.globalAlpha = fade * 0.85;
          const w = Math.max(1, k * (rock ? 0.7 : 0.5)), h = Math.max(1, k * (rock ? 0.55 : 0.9));
          px(s.x - w / 2, s.y - h, w, h, rock ? LAND.rock : LAND.tuft);
        }
      }
      ctx.globalAlpha = 1;
    }

    // malla de puntos que forma la onda del mar en perspectiva (estilo boostivity)
    function drawSeaDots(landVisible) {
      const SPX = 1.4, SPZ = 1.5, farZ = 190;   // densidad x4 (antes 2.8x3.0), puntos a 1/4
      const dv = dist + momDrift;
      const startZ = Math.ceil((dv + 4) / SPZ) * SPZ;
      // paso ADAPTATIVO: cerca muestrea a SPZ/SPX plenos; lejos el paso crece para mantener
      // ~1px de separacion en pantalla (los puntos subpixel no se ven y este loop corre
      // TODO el vuelo — el mar es 2D siempre fuera del momentum)
      let wz = startZ;
      while (wz < dv + farZ) {
        const camZ = wz - dv;
        wz += Math.max(SPZ, camZ * camZ * 0.0019);
        if (landVisible && wz < cfg.coast + 6) continue;           // sin puntos sobre tierra/rompiente
        const k = F / camZ;
        const fade = Math.min(1, (camZ - 3) / 9) * (1 - (camZ / farZ) * 0.8);
        if (fade <= 0.03) continue;
        const dotW = Math.max(1, k * 0.12);   // 1/4 del tamaño clasico (0.48)
        // franja acorde al FRUSTUM: el ancho visible crece con la distancia (antes era ±74 fijo
        // y el mar quedaba "cortito" a lo lejos, p.ej. detras de la pista durante el despegue)
        const half = Math.min(320, (W / 2 + 10) * camZ / F + 6);
        const xL = cam.x - half, xR = cam.x + half;
        const sx3 = Math.max(SPX, camZ * 0.011);                   // paso x adaptativo (~1px)
        const x0 = Math.ceil(xL / sx3) * sx3;
        for (let wx = x0; wx < xR; wx += sx3) {
          const h = seaH(wx, wz);
          const s = proj(wx, h, camZ);
          if (s.x < -4 || s.x > W + 4 || s.y < HOR - 2) continue;
          let hn = (h + 1.4) / 4.8;                              // altura normalizada ~0..1
          hn = hn < 0 ? 0 : hn > 1 ? 1 : hn;
          // bandas de luz que viajan por la superficie (movimiento visible aun en la distancia)
          const shimmer = Math.sin(wz * 0.06 - t * 2.6 + wx * 0.045);
          if (shimmer > 0.6) hn = Math.min(1, hn + 0.24);
          const col = hn > 0.72 ? WATER.crest : hn > 0.42 ? WATER.mid : WATER.deep;
          // OPACIDAD por cuadrado = SEA_ALPHA2D (perilla global, 0.5) x fade (entrada 3..12u y
          // caida por lejania) x altura de ola: 0.25 de piso en el valle + hasta 0.6 por la
          // cresta (hn 0..1) + 0.15 si lo cruza una banda de luz → rango 12%..50%
          ctx.globalAlpha = SEA_ALPHA2D * fade * (0.25 + hn * 0.6 + (shimmer > 0.6 ? 0.15 : 0));
          px(s.x - dotW / 2, s.y, dotW, dotW, col);
          // destello en las crestas cercanas (titileo determinista, sin flicker feo)
          if (hn > 0.78 && k > 1.6 && Math.sin(wx * 12.9 + wz * 7.3 + t * 6) > 0.7) {
            ctx.globalAlpha = SEA_ALPHA2D * fade * 0.55;   // destello de cresta, tambien bajo la perilla
            px(s.x - dotW / 2 - 1, s.y - 1, dotW + 2, Math.max(1, dotW * 0.6), WATER.spark);
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawWake() {
      for (const wp of wake) {
        const trail = PZ - wp.z;                       // metros que quedaron atrás
        const s = proj(wp.x, 0, wp.z);
        const spread = (0.6 + trail * 0.34) * s.k;       // apertura de la V
        ctx.globalAlpha = Math.min(0.85, wp.i * (0.3 + trail * 0.055));
        px(s.x - s.k * 0.7, s.y, s.k * 1.4, Math.max(1, s.k * 0.2), P.foam);       // centro batido
        px(s.x - spread - s.k * 0.7, s.y, s.k * 1.4, 1, P.crest);                // brazo izq
        px(s.x + spread - s.k * 0.7, s.y, s.k * 1.4, 1, P.crest);                // brazo der
      }
      ctx.globalAlpha = 1;
    }

    function drawPlaneSprite() {
      const s = proj(plane.x, plane.y, PZ);
      // sombra sobre el agua (referencia de altura)
      const sh = proj(plane.x, 0, PZ);
      ctx.globalAlpha = Math.max(0.08, 0.4 - plane.y * 0.009);
      px(sh.x - 9, sh.y, 18, 2, '#101c1e');
      // espuma batida justo debajo cuando vuela bajo (solo sobre agua)
      const churn = Math.max(0, 1 - plane.y / 7);
      if (churn > 0 && state === 'play' && cfg.terrain !== 'land') {
        ctx.globalAlpha = churn * 0.7;
        px(sh.x - 11, sh.y - 1, 22, 2, P.foam);
        px(sh.x - 15, sh.y, 30, 1, P.crest);
      }
      ctx.globalAlpha = 1;

      ctx.save();
      // sub-pixel + bob de vuelo (nunca queda congelado) + micro-oscilación de alabeo en el aire
      const bob = (state === 'play' ? Math.sin(t * 3.1) * 0.5 + Math.sin(t * 1.7) * 0.3 : 0);
      // VIBRACION al rozar la superficie: temblor rapido del fuselaje (el avion, no la camara)
      const vx2 = scrapeVib ? (Math.random() - 0.5) * 3.2 * scrapeVib : 0;
      const vy2 = scrapeVib ? (Math.random() - 0.5) * 2.4 * scrapeVib : 0;
      ctx.translate(s.x + vx2, s.y - bob + vy2);
      // cabeceo: el morro sube al trepar / baja al caer (desplazamiento vertical del sprite)
      ctx.translate(0, -plane.pitch * 1.2);
      // alabeo: rotación 2D + micro-wobble; el foreshortening en X finge la inclinación 3D del ala
      const bank = Math.max(-1, Math.min(1, plane.bank));
      const pl = PLANES[selPlane];
      const useSheet = pl.sheetOk;   // sprite HORNEADO: el alabeo lo traen los frames
      let rolling = rollT > 0;
      if (rolling) {
        // PIRUETA: tonel completo — el sprite (vista trasera) rota 360° en el plano de pantalla
        const pr = 1 - rollT / ROLL_DUR;                   // 0→1 durante el tonel
        ctx.rotate(rollDir * pr * Math.PI * 2);
        ctx.scale(0.94 + 0.06 * Math.cos(pr * Math.PI * 2), 1);   // leve pulso: vende el giro
      } else if (useSheet) {
        // con frames de alabeo Y cabeceo REALES no hay rotacion ni squash fingidos: solo micro-wobble
        ctx.rotate(state === 'play' ? Math.sin(t * 2.3) * 0.015 : 0);
      } else {
        ctx.rotate(bank * 0.42 + (state === 'play' ? Math.sin(t * 2.3) * 0.015 : 0));
        ctx.scale(1 - Math.abs(bank) * 0.26, 1 - plane.pitch * 0.05);
      }
      if (useSheet) {
        ctx.imageSmoothingEnabled = false;   // pixel art nítido (el save/restore de afuera lo repone)
        // COLUMNA por alabeo. bank>0 = va a la DERECHA → tiene que banquear a la derecha, pero
        // los frames del modelo 3D giran en sentido opuesto al canvas, asi que se INVIERTE el
        // signo (esto corrige el "giraba para el lado contrario"). Nivelado = columna central.
        const col = rolling ? (SHEET_NF - 1) / 2 : Math.round((1 - bank) / 2 * (SHEET_NF - 1));
        // FILA por cabeceo. pitch>0 = trepa (morro arriba) → fila 0; nivel → 1; picada → 2
        const pc = Math.max(-1, Math.min(1, plane.pitch));
        const row = pc > 0.33 ? 0 : pc < -0.33 ? 2 : 1;
        const sx4 = col * SHEET_FW, sy4 = row * SHEET_FH;
        // fantasmas de la pirueta: 2 copias retrasadas en el giro, translucidas
        if (rolling) for (let gi = 2; gi >= 1; gi--) {
          ctx.save();
          ctx.rotate(-rollDir * gi * 0.55);
          ctx.globalAlpha = 0.14;
          ctx.drawImage(pl.sheetImg, sx4, sy4, SHEET_FW, SHEET_FH, -SHEET_FW / 2, -SHEET_FH / 2, SHEET_FW, SHEET_FH);
          ctx.restore();
        }
        if (boost) { const fl = 5 + Math.random() * 4; px(-2, SHEET_FH / 2 - 8, 4, fl, P.foam); px(-1, SHEET_FH / 2 - 8, 2, fl * 0.7, P.accent); }
        ctx.drawImage(pl.sheetImg, sx4, sy4, SHEET_FW, SHEET_FH, -SHEET_FW / 2, -SHEET_FH / 2, SHEET_FW, SHEET_FH);
        if (inp.fire && !overheat && fireT > 0.06) { px(-6, -2, 3, 2, P.ink); px(3, -2, 3, 2, P.ink); }
      } else if (pl.ready) {
        const PW = 54, PH = Math.round(PW * pl.h / pl.w);
        // fantasmas de la pirueta: 2 copias retrasadas en el giro, translucidas (estela cinematica)
        if (rolling) for (let gi = 2; gi >= 1; gi--) {
          ctx.save();
          ctx.rotate(-rollDir * gi * 0.55);
          ctx.globalAlpha = 0.14;
          ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
          ctx.restore();
        }
        // postquemador: fogonazo extra bajo la tobera solo con turbo (el sprite ya trae su glow)
        if (boost) { const fl = 5 + Math.random() * 4; px(-2, PH / 2 - 4, 4, fl, P.foam); px(-1, PH / 2 - 4, 2, fl * 0.7, P.accent); }
        ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
        // fogonazos del cañón
        if (inp.fire && !overheat && fireT > 0.06) { px(-6, -2, 3, 2, P.ink); px(3, -2, 3, 2, P.ink); }
      } else {
        // fallback: sprite de rects (por si la imagen no cargó)
        px(-2, -7, 4, 5, P.bodyDark); px(-1, -8, 2, 2, P.warn);
        px(-20, -1, 40, 3, P.body); px(-20, 0, 6, 2, P.bodyDark); px(14, 0, 6, 2, P.bodyDark);
        px(-3, -3, 6, 6, P.body); px(-2, -4, 4, 2, P.canopy); px(-12, 1, 3, 2, P.accent);
        const fl = boost ? 5 + Math.random() * 4 : (fuel > 0 ? 2 + Math.random() * 2 : 0);
        if (fl > 0) { px(-2, 3, 4, fl, boost ? P.foam : P.accent); px(-1, 3, 2, fl * 0.6, P.accent); }
        if (inp.fire && !overheat && fireT > 0.06) { px(-16, -2, 3, 2, P.ink); px(13, -2, 3, 2, P.ink); }
      }
      // mancha de sangre sobre el morro/cabina al atropellar (temporal; hacé un sprite ensangrentado si querés)
      if (bloodSplat > 0.02) {
        ctx.globalAlpha = Math.min(0.9, bloodSplat);
        px(-4, -2, 2, 1, '#7a1010'); px(-1, -3, 1, 1, '#9a1818'); px(2, -2, 2, 1, '#8a1414');
        px(-2, 1, 1, 1, '#7a1010'); px(4, -1, 1, 1, '#9a1818'); px(0, 0, 1, 1, '#8a1414'); px(-5, 0, 1, 1, '#6a0e0e');
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // mira: en el MOUSE (PC, punteria libre) o adelante del avion (tactil/legacy)
      if (state === 'play') {
        const vm = viewMouse();   // en camara CERCA la mira se dibuja en coords des-zoomeadas: queda bajo el cursor fisico
        const c = vm.on ? vm : proj(plane.x, plane.y, 70);
        ctx.globalAlpha = 0.7;
        px(c.x - 3, c.y, 2, 1, P.accent); px(c.x + 2, c.y, 2, 1, P.accent);
        px(c.x, c.y - 3, 1, 2, P.accent); px(c.x, c.y + 2, 1, 2, P.accent);
        if (vm.on) { ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.35; ctx.strokeRect(c.x - 5, c.y - 5, 10, 10); }
        ctx.globalAlpha = 1;
      }
    }

    function drawObstacle(o) {
      const k = F / o.z;
      if (o.type === 'mast') {
        const base = proj(o.x, 0, o.z);
        px(base.x - 5 * k, base.y - 2.5 * k, 10 * k, 2.5 * k, P.bodyDark);          // casco
        px(base.x - 5 * k, base.y - 2.5 * k, 10 * k, Math.max(1, 0.6 * k), '#5c6e73');
        px(base.x - 0.45 * k, base.y - o.h * k, Math.max(1, 0.9 * k), o.h * k, P.bodyDark); // mástil
        px(base.x - 2.2 * k, base.y - (o.h - 2) * k, 4.4 * k, Math.max(1, 0.5 * k), P.bodyDark);
        px(base.x - 0.45 * k, base.y - o.h * k, Math.max(1, 0.9 * k), Math.max(1, 0.7 * k), P.warn);
      } else if (o.type === 'balloon') {
        const oy = o.y + Math.sin(t * 1.3 + o.ph) * 0.6;
        const s = proj(o.x, oy, o.z), base = proj(o.x, 0, o.z);
        ctx.strokeStyle = P.bodyDark; ctx.beginPath();
        ctx.moveTo(s.x, s.y + 1.6 * k); ctx.lineTo(base.x, base.y); ctx.stroke();
        px(s.x - 2.6 * k, s.y - 1.6 * k, 5.2 * k, 3.2 * k, P.dim);
        px(s.x - 2.6 * k, s.y - 1.6 * k, 5.2 * k, Math.max(1, 1.1 * k), P.body);
        px(s.x + 1.8 * k, s.y - 0.4 * k, 1.8 * k, Math.max(1, 1.1 * k), P.bodyDark);
      } else if (o.type === 'helo') {
        const oy = o.y + Math.sin(t * 2 + o.ph) * 0.8;
        const s = proj(o.x, oy, o.z);
        px(s.x - 3 * k, s.y - 0.8 * k, 6 * k, 2 * k, P.bodyDark);
        px(s.x + 2.4 * k, s.y - 0.4 * k, 2.4 * k, Math.max(1, 0.8 * k), P.bodyDark);
        px(s.x - 1.4 * k, s.y - 1.4 * k, 2 * k, Math.max(1, 0.8 * k), P.canopy);
        const r = Math.sin(t * 40) * 4;
        px(s.x - (4 + r * 0.2) * k, s.y - 2 * k, (8 + r * 0.4) * k, 1, P.body);
      } else if (o.type === 'jet') {
        // avion enemigo de frente: alas anchas, fuselaje central, canopy, deriva y leve alabeo
        const oy = o.y + Math.sin(t * 1.6 + o.ph) * 0.5;
        const s = proj(o.x, oy, o.z);
        const bank = Math.sin(t * 1.1 + o.ph) * 0.7;          // metros de alabeo en las puntas
        px(s.x - 5 * k, s.y - bank * k - 0.45 * k, 5 * k, 0.9 * k, P.body);   // ala izquierda
        px(s.x, s.y + bank * k - 0.45 * k, 5 * k, 0.9 * k, P.body);   // ala derecha
        px(s.x - 5 * k, s.y - bank * k + 0.45 * k, 5 * k, 0.5 * k, P.bodyDark);
        px(s.x, s.y + bank * k + 0.45 * k, 5 * k, 0.5 * k, P.bodyDark);
        px(s.x - 5 * k, s.y - bank * k - 0.45 * k, 1 * k, 0.9 * k, P.dim);    // puntas de ala
        px(s.x + 4 * k, s.y + bank * k - 0.45 * k, 1 * k, 0.9 * k, P.dim);
        px(s.x - 1.1 * k, s.y - 1.5 * k, 2.2 * k, 3 * k, P.bodyDark);         // fuselaje
        px(s.x - 0.9 * k, s.y - 1.2 * k, 1.8 * k, 2.4 * k, P.body);
        px(s.x - 0.7 * k, s.y - 1.1 * k, 1.4 * k, 1 * k, P.canopy);           // canopy
        px(s.x - 0.35 * k, s.y - 3 * k, 0.8 * k, 1.6 * k, P.bodyDark);        // deriva
        px(s.x - 0.4 * k, s.y - 1.5 * k, 0.8 * k, 0.8 * k, P.warn);           // nariz
      } else if (o.type === 'fuel') {
        const oy = o.y + Math.sin(t * 2) * 0.5;
        const s = proj(o.x, oy, o.z);
        px(s.x - 1.4 * k, s.y - 1.8 * k, 2.8 * k, 3.6 * k, P.accent);
        px(s.x - 1.4 * k, s.y - 0.4 * k, 2.8 * k, Math.max(1, 0.7 * k), P.ink);
      }
    }

    function draw() {
      ctx.setTransform(SC, 0, 0, SC, 0, 0);   // buffer 2×: todo el dibujo sigue en coords 320×180
      const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;
      const cm = momCam();
      ctx.save(); ctx.translate(Math.round(sx) - cm.x, Math.round(sy) - cm.y);   // momentum: el mundo se mueve, la mira no
      // ALABEO (momentum): el MUNDO ENTERO (horizonte, mar Y BARCO) gira -mom.roll alrededor
      // del centro — el avion rola sobre su eje longitudinal y la cabina queda fija.
      // drawMomentum deshace esta rotacion recien al dibujar cabina/mira/letterbox.
      if (state === 'momentum' && mom) {
        const rcx = W / 2 + cm.x, rcy = H / 2 + cm.y;
        ctx.translate(rcx, rcy); ctx.rotate(-mom.roll); ctx.translate(-rcx, -rcy);
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
      world3D.frame({ state, mom, dist, momDrift, cfg, cam, t, SKY, WATER, objectiveShip, seaH, momShipGeom, tbackImg });
      if (world3D.isOn() || world3D.isSea()) {
        const sm = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(world3D.view(), -72, -102, world3D.M3W, world3D.M3H);
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
      g.addColorStop(0, SKY.skyTop); g.addColorStop(0.6, SKY.skyMid); g.addColorStop(1, SKY.horizon);
      ctx.fillStyle = g; ctx.fillRect(-70, -140, W + 140, HOR + 144);   // margenes: paneo + rolls completos del momentum
      ctx.globalAlpha = 0.4; px(-70, HOR - 10, W + 140, 10, SKY.sunGlow); ctx.globalAlpha = 1;
      // sol bajo
      const sunX = W / 2 - cam.x * 1.4;
      px(sunX - 7, HOR - 11, 14, 8, SKY.sun);
      ctx.globalAlpha = 0.35; px(sunX - 10, HOR - 13, 20, 12, SKY.sunGlow); ctx.globalAlpha = 1;
      }
      }
      // nubes
      for (const c of clouds) {
        const cx = ((c.x - cam.x * 2.2 - t * 2) % (W + 80) + W + 80) % (W + 80) - 40;
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

      if (!world3D.isSea()) drawSea();   // el mar 2D solo cuando three no lo esta poniendo
      // en momentum el mundo rota (alabeo): rellena bajo el mar para que un tonel no muestre huecos
      if (state === 'momentum') px(-70, H, W + 140, 150, cfg.terrain === 'land' ? LAND.near : WATER.base2);
      drawApproachBarge();   // la barcaza objetivo creciendo en el horizonte (final del mapa)
      drawWake();

      // ráfagas de viento
      ctx.globalAlpha = 0.35;
      for (const g2 of gusts) {
        px(g2.x, g2.y, g2.len, 1, P.crest);
        px(g2.x + 3, g2.y + 1, g2.len * 0.5, 1, P.dim);
      }
      ctx.globalAlpha = 1;

      // soldados en tierra (de lejos a cerca), corriendo
      if (cfg.terrain === 'land') {
        const sold = soldiers.slice().sort((a, b) => b.z - a.z);
        for (const sd of sold) {
          if (sd.z <= 3 || sd.dead) continue;
          const s = proj(sd.x, 0, sd.z), k = s.k;
          const run = Math.sin(t * 12 + sd.ph);                    // piernas corriendo
          const bh = Math.max(2, k * 1.4), bw = Math.max(1, k * 0.5);
          px(s.x - bw / 2, s.y - bh, bw, bh * 0.6, '#3a3f33'); // cuerpo
          px(s.x - bw / 2, s.y - bh, bw, Math.max(1, k * 0.4), '#5a5140');                       // cabeza/casco
          px(s.x - bw / 2 + (run > 0 ? 0 : bw * 0.4), s.y - bh * 0.4, Math.max(1, bw * 0.4), bh * 0.4, '#2e3327'); // pierna
        }
      }

      // obstáculos de lejos a cerca
      const all = obstacles.slice().sort((a, b) => b.z - a.z);
      for (const o of all) if (o.z > 3) drawObstacle(o);

      // misiles
      for (const m of missiles) {
        if (m.z <= 3) continue;
        const s = proj(m.x, m.y, m.z), k = s.k;
        px(s.x - 0.8 * k, s.y - 0.8 * k, 1.6 * k, 1.6 * k, P.ink);
        px(s.x - 0.4 * k, s.y + 0.8 * k, 0.8 * k, Math.max(1, 1.2 * k), P.accent);
      }
      // balas (trazadoras hacia el horizonte)
      for (const b of bullets) {
        if (b.z >= 240) continue;
        const s = proj(b.x, b.y, b.z);
        px(s.x, s.y, Math.max(1, s.k * 0.4), Math.max(1, s.k * 0.4), P.ink);
        const s2 = proj(b.x, b.y, b.z - 6);
        ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.moveTo(s2.x, s2.y); ctx.lineTo(s.x, s.y); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // misiles del jugador (más gruesos, con estela)
      for (const pm of pmissiles) {
        if (pm.z >= 240 || pm.z <= 3) continue;
        const s = proj(pm.x, pm.y, pm.z), k = s.k;
        const s2 = proj(pm.x, pm.y, pm.z - 10);
        ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.6; ctx.lineWidth = Math.max(1, k * 0.4);
        ctx.beginPath(); ctx.moveTo(s2.x, s2.y); ctx.lineTo(s.x, s.y); ctx.stroke();
        ctx.globalAlpha = 1; ctx.lineWidth = 1;
        px(s.x - Math.max(1, k * 0.4), s.y - Math.max(1, k * 0.4), Math.max(1, k * 0.8), Math.max(1, k * 0.8), P.ink);
        px(s.x - Math.max(1, k * 0.3), s.y + Math.max(1, k * 0.4), Math.max(1, k * 0.6), Math.max(1, k * 0.5), P.warn);
      }
      }   // ---- fin mundo 2D ----

      if (state !== 'dead' && state !== 'momentum') drawPlaneSprite();   // en momentum va la camara cockpit (drawCockpit)

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
      if (state !== 'momentum') {
        for (const p of parts) { ctx.globalAlpha = Math.min(1, p.life * 2); px(p.x, p.y, p.r, p.r, p.c); }
        ctx.globalAlpha = 1;

        ctx.font = '7px monospace'; ctx.textAlign = 'center';
        for (const p of popups) { ctx.globalAlpha = Math.min(1, p.life); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y); }
        ctx.globalAlpha = 1;
      }

      if (zoomOn) ctx.restore();   // el HUD (y la capa momentum) van SIN zoom
      if (state === 'play') drawHUD();
      if (state === 'momentum' && mom) drawMomentum();
      ctx.restore();

      if (state === 'takeoff') drawTakeoff();
      if (state === 'modeselect') drawModeSelect();
      if (state === 'menu') { drawMenu(); if (cfgOpen) drawCfg(); }
      if (state === 'dead') drawDead();
      if (state === 'results') drawResults();
      if (state === 'brief') drawBrief();
      if (state === 'victory') drawVictory();
      if (state === 'epilogue' && story) drawStory();
      if (state === 'story' && story) drawStory();

      // fundido desde negro (al salir de la historia hacia el despegue) — SIEMPRE al final
      if (fadeT > 0) {
        ctx.globalAlpha = Math.min(1, fadeT / 1.4);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    }

    // pantalla de HISTORIA: negro tipo "pantalla de carga" con grano de pelicula y scanline,
    // texto tipeado letra a letra con cursor. NO se ve el terreno de juego (eso llega con el fade).
    function drawStory() {
      ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, W, H);
      // grano de pelicula (parpadea) + una banda de scanline que baja lenta
      ctx.globalAlpha = 0.10;
      for (let i = 0; i < 42; i++) px(Math.random() * W, Math.random() * H, 1, 1, '#8a9ba1');
      ctx.globalAlpha = 0.05;
      px(0, (t * 9) % (H + 30) - 15, W, 7, '#eaf6ff');
      ctx.globalAlpha = 1;
      // marco fino (tarjeta de expediente)
      ctx.strokeStyle = '#1c262e'; ctx.strokeRect(8.5, 8.5, W - 17, H - 17);

      // texto tipeado: recorre las lineas gastando story.typed caracteres
      let left = story.typed, y = story.isLevel ? 76 : 38;   // pantalla de NIVEL: centrada
      ctx.textAlign = 'center';
      let curX = W / 2, curY = y;   // posicion del cursor (ultimo caracter tipeado)
      for (const ln of story.lines) {
        if (left <= 0) break;
        const shown = ln.txt.slice(0, left);
        left -= ln.txt.length;
        if (ln.k === 'title') { ctx.font = 'bold 11px monospace'; ctx.fillStyle = P.accent; }
        else if (ln.k === 'level') { ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.warn; }
        else if (ln.k === 'obj') { ctx.font = '7px monospace'; ctx.fillStyle = '#5c6e73'; }
        else { ctx.font = '7px monospace'; ctx.fillStyle = P.ink; }
        ctx.fillText(shown, W / 2, y);
        curX = W / 2 + ctx.measureText(shown).width / 2 + 2; curY = y;
        // interlineado: mas aire despues del titulo y antes del bloque de nivel
        y += ln.k === 'title' ? 16 : (ln.k === 'level' ? 12 : 11);
        if (ln.last && ln.k === 'body') y += 5;
        if (ln.last && ln.k === 'title') y += 3;
      }
      // cursor de maquina de escribir (bloque titilante)
      if (!story.done && Math.sin(t * 14) > -0.5) px(curX, curY - 6, 4, 7, P.accent);
      // listo: prompt (continuar en pantallas intermedias, despegar en la del nivel)
      const lastScreen = story.si + 1 >= story.seq.length;
      if (story.done && Math.sin(t * 4) > -0.3) {
        ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.accent; ctx.textAlign = 'center';
        // el guion de campaña termina en el despegue, pero el EPILOGO sigue al briefing/recuento:
        // ahi corresponde "continuar", no "despegar"
        ctx.fillText(T(lastScreen && state !== 'epilogue' ? 'startPrompt' : 'continuePrompt'), W / 2, H - 22);
      }
      // progreso de la secuencia (puntitos abajo)
      const n = story.seq.length;
      for (let i = 0; i < n; i++)
        px(W / 2 - n * 4 + i * 8 + 2, H - 13, 3, 3, i === story.si ? P.accent : '#2e3c45');
    }

    // (la vieja pantalla de "barcaza destruida" la absorbio el RECUENTO: ver drawResults)

    // MOMENTUM — camara 3/4 chase: el avion se ve GRANDE y pegado a camara (abajo-izq),
    // como si la camara volara detras y al costado. Devuelve la punta de la trompa (origen de la trazadora).
    // (Una side-camera pura necesitaria sprite de perfil: anotado en UPDATE_ANIMATIONS.md.)
    // ---- camara DESDE ADENTRO (cockpit) para el MOMENTUM ----
    // Asset configurable: imagen con la MISMA proporcion que la pantalla (320×180; ideal 640×360 para
    // nitidez 2×) con el CENTRO TRANSPARENTE (el vidrio) y pintados los parantes de la cabina y el panel
    // de instrumentos. Embeber como data URI en `src` (igual que los aviones). Mientras este vacio se
    // dibuja un placeholder por codigo. Pedido en UPDATE_ANIMATIONS.md.
    const COCKPIT_ASSET = { src: '../assets/img/cockpit_sky.png', img: new Image(), ready: false };
    COCKPIT_ASSET.img.onload = () => { COCKPIT_ASSET.ready = true; };
    if (COCKPIT_ASSET.src) COCKPIT_ASSET.img.src = COCKPIT_ASSET.src;

    function drawCockpit() {
      // solo bob de vuelo: la cabina es la trompa del avion, va clavada a la pantalla
      // (apuntar mueve el MUNDO detras del vidrio, no la cabina)
      const bx = Math.sin(mom.t * 1.4) * 1.5;
      const by = Math.sin(mom.t * 2.2) * 2;
      if (COCKPIT_ASSET.ready && COCKPIT_ASSET.img.naturalWidth) {
        ctx.drawImage(COCKPIT_ASSET.img, bx - 6, by - 6, W + 12, H + 12);   // sobredimensionado: el bob no muestra bordes
      } else {
        ctx.save();
        ctx.translate(bx, by);
        // parantes laterales del canopy (diagonales)
        ctx.fillStyle = '#10151a';
        ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(28, -8); ctx.lineTo(4, H - 28); ctx.lineTo(-8, H - 28); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(W + 8, -8); ctx.lineTo(W - 28, -8); ctx.lineTo(W - 4, H - 28); ctx.lineTo(W + 8, H - 28); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#2a343c';
        ctx.beginPath(); ctx.moveTo(28, -8); ctx.lineTo(4, H - 28); ctx.moveTo(W - 28, -8); ctx.lineTo(W - 4, H - 28); ctx.stroke();
        // capo / panel de instrumentos abajo
        ctx.fillStyle = '#0e1317';
        ctx.beginPath(); ctx.moveTo(-8, H + 8); ctx.lineTo(-8, H - 24); ctx.lineTo(W * 0.30, H - 33); ctx.lineTo(W * 0.70, H - 33); ctx.lineTo(W + 8, H - 24); ctx.lineTo(W + 8, H + 8); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#39434b';
        ctx.beginPath(); ctx.moveTo(-8, H - 24); ctx.lineTo(W * 0.30, H - 33); ctx.lineTo(W * 0.70, H - 33); ctx.lineTo(W + 8, H - 24); ctx.stroke();
        // instrumentos placeholder: dos diales + luz de armamento
        px(W * 0.36, H - 28, 11, 9, '#1a2126'); px(W * 0.375, H - 25, 6, 1, P.accent);
        px(W * 0.53, H - 28, 11, 9, '#1a2126'); px(W * 0.55, H - 23, 5, 1, P.warn);
        px(W * 0.70, H - 30, 3, 3, mom.hitFx ? P.warn : '#3a2a1a');    // luz de canon
        // reflejo del vidrio (sutil)
        ctx.globalAlpha = 0.05; ctx.strokeStyle = '#eaf6ff'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(W * 0.20, 8); ctx.lineTo(W * 0.46, H - 42); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W * 0.30, 4); ctx.lineTo(W * 0.54, H - 46); ctx.stroke();
        ctx.globalAlpha = 1; ctx.lineWidth = 1;
        ctx.restore();
      }
      // (los canones estan en las alas, FUERA de la vista: las trazadoras se dibujan antes
      // de la cabina en drawMomentum y el marco las tapa — aca no va ningun fogonazo)
      return { bx, by };
    }

    // MOMENTUM: barcaza a lo largo, zonas criticas resaltadas, mira y ventana de tiempo
    function drawMomentum() {
      const ph = MOM_PHASES[momPhase], g = momShipGeom();
      // NOTA: seguimos en espacio-MUNDO ROTADO por el alabeo (aplicado en draw): el barco, las
      // zonas, los fx y las particulas giran con el mundo — al rolar ves la barcaza inclinarse

      // tinte de camara lenta sobre el fondo (extendido: la camara panea con la punteria, momCam)
      ctx.fillStyle = '#0a121a'; ctx.globalAlpha = 0.28; ctx.fillRect(-80, -80, W + 160, H + 160); ctx.globalAlpha = 1;

      // ---- barcaza (casco compartido; crece LENTO durante la pasada via momShipGeom) ----
      // en momentum-3D el barco lo pone three.js (blit de draw); el 2D queda de fallback
      if (!world3D.isOn()) drawBargeHull(g.cx, g.len, g.deckY, g.uh);
      // zonas ya destruidas (de esta pasada): chamuscado + humo
      for (const z of mom.zones) {
        if (z.hp > 0) continue;
        const r = momZoneRect(z);
        px(r.x, r.y, r.w, r.h, '#16191c');
        if (Math.random() < 0.3) parts.push({
          x: r.x + Math.random() * r.w, y: r.y, vx: (Math.random() - 0.5) * 8,
          vy: -(12 + Math.random() * 14), life: 0.8, c: '#3a3f43', r: 1.5
        });
      }
      // nombre de la barcaza sobre el barco
      ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = P.warn; ctx.fillText(objectiveShip, g.cx, g.deckY - g.uh * 4.6);

      // ---- zonas activas: corchetes titilantes + etiqueta + barra de HP ----
      for (const z of mom.zones) {
        if (z.hp <= 0) continue;
        const r = momZoneRect(z), blink = Math.sin(mom.t * 7) > -0.4;
        if (blink) {
          ctx.strokeStyle = P.warn; ctx.lineWidth = 1; ctx.globalAlpha = 0.9;
          const c = Math.max(2, r.w * 0.22);
          ctx.beginPath();
          ctx.moveTo(r.x, r.y + c); ctx.lineTo(r.x, r.y); ctx.lineTo(r.x + c, r.y);
          ctx.moveTo(r.x + r.w - c, r.y); ctx.lineTo(r.x + r.w, r.y); ctx.lineTo(r.x + r.w, r.y + c);
          ctx.moveTo(r.x, r.y + r.h - c); ctx.lineTo(r.x, r.y + r.h); ctx.lineTo(r.x + c, r.y + r.h);
          ctx.moveTo(r.x + r.w - c, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h - c);
          ctx.stroke(); ctx.globalAlpha = 1;
        }
        ctx.font = '6px monospace'; ctx.fillStyle = P.warn;
        ctx.fillText(T(z.label), r.x + r.w / 2, r.y - 3);
        px(r.x, r.y + r.h + 2, r.w, 2, '#2e3c45');                       // barra de HP
        px(r.x, r.y + r.h + 2, r.w * (z.hp / z.maxHp), 2, P.warn);
      }

      // FX de camara lenta (mundo): trazadoras AA con estela, flak expandiendose y rocio derivando
      for (const f of mom.fx) {
        const a = Math.min(1, f.life);
        if (f.k === 'tr') {
          const L = 3 + f.T * 9;                                    // la estela se alarga al acercarse
          const dl = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / dl, uy = f.vy / dl;
          ctx.globalAlpha = a * 0.35; ctx.strokeStyle = P.warn;
          ctx.beginPath(); ctx.moveTo(f.x - ux * L * 1.8, f.y - uy * L * 1.8); ctx.lineTo(f.x, f.y); ctx.stroke();
          ctx.globalAlpha = a * 0.85;
          ctx.beginPath(); ctx.moveTo(f.x - ux * L, f.y - uy * L); ctx.lineTo(f.x, f.y); ctx.stroke();
          px(f.x - 1, f.y - 1, 2, 2, P.accent);
        } else if (f.k === 'sh') {                                // rafaga de canon: trazo grueso glow + nucleo
          const dl = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / dl, uy = f.vy / dl;
          const L = 8 + Math.min(8, f.T * 6);
          ctx.globalAlpha = 0.35; ctx.strokeStyle = P.warn; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(f.x - ux * L, f.y - uy * L); ctx.lineTo(f.x, f.y); ctx.stroke();
          ctx.globalAlpha = 0.95; ctx.strokeStyle = P.accent; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(f.x - ux * L * 0.6, f.y - uy * L * 0.6); ctx.lineTo(f.x, f.y); ctx.stroke();
          ctx.lineWidth = 1;
        } else if (f.k === 'ms') {                                // misil del jugador: cuerpo + llama
          const dl = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / dl, uy = f.vy / dl;
          ctx.globalAlpha = 1;
          px(f.x - ux * 3 - 1, f.y - uy * 3 - 1, 3, 3, P.ink);
          px(f.x - 1, f.y - 1, 2, 2, P.foam);
          px(f.x - ux * 6 - 1, f.y - uy * 6 - 1, 2, 2, P.accent);
        } else if (f.k === 'st') {
          ctx.globalAlpha = a * 0.4;
          px(f.x, f.y, f.len, 1, P.foam);
        } else {                                                  // 'fk': fogonazo breve → humo lento
          const r = 1 + f.vr * f.T;
          ctx.globalAlpha = a * (f.T < 0.14 ? 0.9 : 0.45);
          ctx.fillStyle = f.T < 0.14 ? P.warn : '#7c838a';
          ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, 7); ctx.fill();
          if (f.T >= 0.14) { ctx.fillStyle = '#565c63'; ctx.beginPath(); ctx.arc(f.x - r * 0.3, f.y + r * 0.2, r * 0.55, 0, 7); ctx.fill(); }
        }
      }
      ctx.globalAlpha = 1;

      // particulas y popups en espacio-MUNDO (anclados al barco/zonas), antes de la cabina
      for (const p of parts) { ctx.globalAlpha = Math.min(1, p.life * 2); px(p.x, p.y, p.r, p.r, p.c); }
      ctx.globalAlpha = 1;
      ctx.font = '7px monospace'; ctx.textAlign = 'center';
      for (const p of popups) { ctx.globalAlpha = Math.min(1, p.life); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y); }
      ctx.globalAlpha = 1;

      // de aca en adelante espacio-PANTALLA: se deshace el ROLL y el paneo de camara —
      // la cabina, la mira y el letterbox van NIVELADOS (vos rolas, tu marco no)
      const cm = momCam();
      {
        const rcx = W / 2 + cm.x, rcy = H / 2 + cm.y;
        ctx.translate(rcx, rcy); ctx.rotate(mom.roll); ctx.translate(-rcx, -rcy);
      }
      ctx.translate(cm.x, cm.y);

      // (las rafagas del canon ya no son lineas fijas: son proyectiles fx 'sh' que viajan
      // LENTOS por el mundo desde las alas — se dibujan arriba, antes de la cabina, y el
      // marco/panel los tapa al nacer)

      // ---- cabina en primer plano (camara desde adentro) ----
      drawCockpit();

      // ---- RESPLANDOR de disparo en los bordes: feedback INSTANTANEO al apretar fuego ----
      // (la bala tarda ~1.3s en cruzar el vidrio; sin esto parece que no responde)
      // PLACEHOLDER: cuadrados blancos — se reemplazara por asset (ver UPDATE_ANIMATIONS.md)
      if (mom.flashL > 0) {
        ctx.globalAlpha = Math.min(1, mom.flashL * 9);
        px(0, 56, 9, 15, '#ffffff'); px(9, 60, 5, 8, '#ffffff'); px(14, 63, 3, 4, '#ffffff');
        ctx.globalAlpha = Math.min(0.5, mom.flashL * 4);
        px(0, 50, 20, 27, '#ffffff');                       // halo suave
        ctx.globalAlpha = 1;
      }
      if (mom.flashR > 0) {
        ctx.globalAlpha = Math.min(1, mom.flashR * 9);
        px(W - 9, 56, 9, 15, '#ffffff'); px(W - 14, 60, 5, 8, '#ffffff'); px(W - 17, 63, 3, 4, '#ffffff');
        ctx.globalAlpha = Math.min(0.5, mom.flashR * 4);
        px(W - 20, 50, 20, 27, '#ffffff');                  // halo suave
        ctx.globalAlpha = 1;
      }

      // ---- mira sobre el vidrio: LIBRE con mouse (PC) o fija al visor (tactil) + chispa ----
      const ax = mouse.on ? mouse.x : MOM_AX, ay = mouse.on ? mouse.y : MOM_AY;
      if (mom.hitFx) px(ax - 1, ay - 1, 2, 2, P.foam);
      const mc = mom.hitFx ? P.accent : P.ink;
      ctx.strokeStyle = mc; ctx.globalAlpha = 0.9;
      ctx.strokeRect(ax - 5, ay - 5, 10, 10);
      ctx.globalAlpha = 1;
      px(ax - 7, ay, 3, 1, mc); px(ax + 5, ay, 3, 1, mc);
      px(ax, ay - 7, 1, 3, mc); px(ax, ay + 5, 1, 3, mc);

      // ---- letterbox + titulo + ventana de tiempo ----
      ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, 13); ctx.fillRect(0, H - 13, W, 13);
      ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = P.warn;
      ctx.fillText(T('mom_title') + '  ·  ' + T('mom_pass', { n: momPhase + 1, m: MOM_PHASES.length })
        + (mom.pass > 1 ? '  ·  ' + T('mom_pass_n', { n: mom.pass }) : ''), W / 2, 9);
      const tw = 90;
      px(W / 2 - tw / 2, H - 9, tw, 3, '#2e3c45');
      if (mom.turn > 0) {
        // VIRAJE: la barra se rellena al reves — es lo que falta para volver a tener el blanco
        const tp = 1 - Math.max(0, mom.turn) / REATTACK_DUR;
        px(W / 2 - tw / 2, H - 9, tw * tp, 3, P.foam);
      } else {
        const tfrac = Math.max(0, mom.timer / ph.time);
        px(W / 2 - tw / 2, H - 9, tw * tfrac, 3, tfrac < 0.3 ? P.warn : P.accent);   // roja cuando queda poco
      }
      // municion de misiles [Z] a la izquierda de la barra de tiempo
      ctx.font = '6px monospace'; ctx.textAlign = 'right'; ctx.fillStyle = P.dim;
      ctx.fillText('Z', W / 2 - tw / 2 - 26, H - 4);
      for (let i = 0; i < MSL_MAX; i++)
        px(W / 2 - tw / 2 - 22 + i * 6, H - 9, 4, 3, i < msl ? P.accent : '#2e3c45');
      ctx.textAlign = 'center';
      if (mom.doneT <= 0 && mom.t < 2.5) {
        ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
        ctx.fillText(T('mom_hint'), W / 2, 21);   // bajo el titulo, para no pisar el avion en primer plano
      }
    }

    // barra de misión: puerto (izq) → barcaza objetivo (der), con el avión avanzando según el progreso
    // assets configurables de la barra de objetivo — completar con data URI (base64) cuando estén.
    // Mientras `src` esté vacío, se dibuja un fallback. Ver README para cómo embeber (igual que los aviones).
    const OBJ_ASSETS = {
      port: { src: '', img: new Image(), ready: false },   // icono del PUERTO (extremo izquierdo)
      barge: { src: '', img: new Image(), ready: false },   // icono del OBJETIVO / barcaza (extremo derecho)
      plane: { src: '', img: new Image(), ready: false },   // AVIÓN que avanza por la línea
    };
    for (const k in OBJ_ASSETS) { const a = OBJ_ASSETS[k]; a.img.onload = () => { a.ready = true; }; if (a.src) a.img.src = a.src; }

    // dibuja un asset del HUD centrado en (x,y); si no cargó, usa un fallback dibujado
    function drawHudAsset(a, x, y, kind, hpx) {
      if (a.ready && a.img.naturalWidth) {
        const h = hpx, w = Math.max(1, Math.round(h * a.img.naturalWidth / a.img.naturalHeight));
        ctx.drawImage(a.img, Math.round(x - w / 2), Math.round(y - h / 2), w, h);
        return;
      }
      if (kind === 'port') { px(x - 2, y - 3, 4, 6, P.foam); px(x - 1, y - 5, 2, 2, P.dim); }
      else if (kind === 'barge') { px(x - 3, y - 2, 7, 4, P.warn); px(x - 1, y - 4, 2, 2, P.warn); }
      else { ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(x + 3, y); ctx.lineTo(x - 3, y - 2.5); ctx.lineTo(x - 3, y + 2.5); ctx.closePath(); ctx.fill(); }
    }

    function drawObjectiveBar() {
      const cx = W / 2, half = Math.round(W * 0.15);          // 30% del ancho (máx), centrada
      const x0 = cx - half, x1 = cx + half, y = 26;
      const prog = Math.max(0, Math.min(1, dist / objectiveDist));
      // nombre de la barcaza objetivo, centrado arriba
      ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn;
      ctx.fillText(objectiveShip, cx, y - 7);
      // línea: recorrido (accent) + pendiente (tenue)
      px(x0, y, x1 - x0, 1, '#2e3c45');
      px(x0, y, Math.round((x1 - x0) * prog), 1, P.accent);
      // extremos: puerto (izq) y barcaza (der) — assets configurables o fallback
      drawHudAsset(OBJ_ASSETS.port, x0, y, 'port', 8);
      drawHudAsset(OBJ_ASSETS.barge, x1, y, 'barge', 9);
      // marcador del avión avanzando por la línea (+ líneas de boost)
      const pm = x0 + (x1 - x0) * prog;
      if (boost) {
        ctx.strokeStyle = P.foam; ctx.globalAlpha = 0.7;
        for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(pm - 2 - i * 3, y); ctx.lineTo(pm - i * 3, y); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      drawHudAsset(OBJ_ASSETS.plane, pm, y, 'plane', 7);
    }

    // pantalla inicial: elegir CAMPAÑA / CICLO DE MUERTE / SUPERVIVENCIA (lista vertical)
    function drawModeSelect() {
      panel();
      ctx.textAlign = 'center';
      ctx.fillStyle = P.accent; ctx.font = 'bold 18px monospace';
      ctx.fillText(T('title'), W / 2, 28);
      ctx.fillStyle = P.dim; ctx.font = '7px monospace';
      ctx.fillText(T('modePrompt'), W / 2, 42);

      const opts = [
        { name: T('modeCampaign'), desc: T('modeCampaignDesc') },
        { name: T('modeCycle'), desc: T('modeCycleDesc') },
        { name: T('modeSurvival'), desc: T('modeSurvivalDesc') },
      ];
      const y0 = 60, rh = 34;
      for (let i = 0; i < opts.length; i++) {
        const y = y0 + i * rh, on = i === modeSel;
        ctx.strokeStyle = on ? P.accent : '#3a464c'; ctx.globalAlpha = on ? 1 : 0.55;
        ctx.strokeRect(28.5, y + 0.5, W - 57, rh - 8); ctx.globalAlpha = 1;
        if (on) {
          ctx.fillStyle = P.accent; ctx.globalAlpha = 0.09; ctx.fillRect(28, y, W - 57, rh - 8); ctx.globalAlpha = 1;
          ctx.fillStyle = P.accent; ctx.textAlign = 'left'; ctx.font = 'bold 9px monospace'; ctx.fillText('>', 34, y + 16);
        }
        ctx.textAlign = 'left';
        ctx.fillStyle = on ? P.accent : P.body; ctx.font = 'bold 10px monospace';
        ctx.fillText(opts[i].name, 46, y + 12);
        ctx.fillStyle = on ? P.ink : P.dim; ctx.font = '6px monospace';
        ctx.fillText(opts[i].desc, 46, y + 22);
      }

      ctx.textAlign = 'center';
      if (Math.sin(t * 4) > -0.3) {
        ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
        ctx.fillText(T('modeHint'), W / 2, 172);
      }
      ctx.fillStyle = '#5c6e73'; ctx.font = '6px monospace';
      ctx.fillText('[L] ' + T('langName'), W / 2, 160);
    }

    // ---------- RECUENTO DE FIN DE MISION ----------
    // Las filas entran de a una acumulando el total; despues caen las estrellas y la calificacion.
    function drawResults() {
      // fondo CASI opaco: panel() es translucido y el mundo (popups, mar, montañas) se colaba
      // entre las filas del recuento y lo hacia ilegible
      ctx.fillStyle = '#0a0e11f2'; ctx.fillRect(0, 0, W, H);
      const R = lastRun; if (!R) return;
      ctx.textAlign = 'center';
      ctx.fillStyle = P.accent; ctx.font = 'bold 11px monospace';
      ctx.fillText(T('res_title'), W / 2, 22);
      ctx.fillStyle = P.ink; ctx.font = 'bold 8px monospace';
      ctx.fillText(R.mission.name, W / 2, 34);

      // filas del desglose: etiqueta a la izquierda, puntos a la derecha
      let acc = 0;
      ctx.font = '7px monospace';
      for (let i = 0; i < R.rows.length; i++) {
        if (i >= resRow) break;
        const r = R.rows[i], y = 52 + i * 12;
        acc += r.v;
        ctx.textAlign = 'left'; ctx.fillStyle = P.dim;
        ctx.fillText(T(r.k) + (r.n !== undefined ? '  ' + r.n : ''), 40, y);
        ctx.textAlign = 'right'; ctx.fillStyle = P.foam;
        ctx.fillText('+' + r.v, W - 40, y);
      }

      // total (aparece cuando entraron todas las filas)
      if (resRow >= R.rows.length) {
        const y = 52 + R.rows.length * 12 + 4;
        ctx.strokeStyle = '#2e3c45'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(40, y - 6.5); ctx.lineTo(W - 40, y - 6.5); ctx.stroke();
        ctx.textAlign = 'left'; ctx.fillStyle = P.ink; ctx.font = 'bold 8px monospace';
        ctx.fillText(T('res_total'), 40, y + 3);
        ctx.textAlign = 'right'; ctx.fillStyle = P.accent;
        ctx.fillText(String(R.total), W - 40, y + 3);

        // estrellas: entran de a una con un pequeño rebote
        const stT = resT - (R.rows.length * 0.45 + 0.15);
        ctx.textAlign = 'center';
        for (let i = 0; i < 3; i++) {
          const on = i < R.stars, appear = stT - i * 0.22;
          if (appear < 0) continue;
          const pop = Math.max(0, 1 - appear * 4);           // rebote al aparecer
          const sz = 13 + pop * 7;
          ctx.font = 'bold ' + Math.round(sz) + 'px monospace';
          ctx.fillStyle = on ? P.accent : '#2e3c45';
          ctx.fillText(on ? '★' : '☆', W / 2 - 20 + i * 20, y + 26);
        }
        // calificacion
        if (stT > 0.75) {
          ctx.fillStyle = P.foam; ctx.font = 'bold 8px monospace';
          ctx.fillText(T('res_rank') + '  ' + T(R.rank), W / 2, y + 42);
        }
        if (stT > 1.1 && Math.sin(t * 4) > -0.3) {
          ctx.fillStyle = P.accent; ctx.font = 'bold 7px monospace';
          ctx.fillText(T('continuePrompt'), W / 2, H - 12);
        }
      }
    }

    // ---------- BRIEFING CORTO (ciclo de muerte / campaña sin guion) ----------
    function drawBrief() {
      ctx.fillStyle = '#0a0e11f2'; ctx.fillRect(0, 0, W, H);   // igual que el recuento: fondo opaco
      const m = curMission();
      ctx.textAlign = 'center';
      ctx.fillStyle = P.dim; ctx.font = '6px monospace';
      ctx.fillText(T('brief_title'), W / 2, 30);
      ctx.fillStyle = P.accent; ctx.font = 'bold 12px monospace';
      ctx.fillText(m.name, W / 2, 48);
      ctx.fillStyle = '#5c6e73'; ctx.font = '6px monospace';
      ctx.fillText(m.date, W / 2, 60);
      // contexto corto de la mision (2-3 lineas, envueltas)
      ctx.fillStyle = P.ink; ctx.font = '7px monospace';
      const txt = T(m.brief);
      const lines = wrapChars(txt, 46);
      lines.forEach((l, i) => ctx.fillText(l, W / 2, 84 + i * 11));
      // objetivo, en el lenguaje del tipo de meta. Si coincide con el titulo (misiones de buque,
      // donde el blanco ES la mision) no se repite: solo aporta en metas de otro tipo (distancia...)
      const goalTxt = goalOf(m).label(m.goal);
      if (goalTxt !== m.name) {
        ctx.fillStyle = P.warn; ctx.font = 'bold 7px monospace';
        ctx.fillText(T('brief_goal') + '  ' + goalTxt, W / 2, 84 + lines.length * 11 + 14);
      }
      if (briefT > 0.6 && Math.sin(t * 4) > -0.3) {
        ctx.fillStyle = P.accent; ctx.font = 'bold 7px monospace';
        ctx.fillText(T('brief_go'), W / 2, H - 16);
      }
    }

    // fin de campaña (2 niveles de prueba)
    function drawVictory() {
      panel();
      ctx.textAlign = 'center';
      ctx.fillStyle = P.accent; ctx.font = 'bold 15px monospace';
      ctx.fillText('CAMPANA COMPLETADA', W / 2, 54);
      ctx.fillStyle = P.dim; ctx.font = '6px monospace';
      ctx.fillText('(2 niveles de prueba - se agregaran mas)', W / 2, 70);
      ctx.fillStyle = P.ink; ctx.font = 'bold 10px monospace';
      ctx.fillText('PUNTAJE  ' + Math.floor(score), W / 2, 96);
      if (levelT > 0.8 && Math.sin(t * 4) > -0.3) {
        ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
        ctx.fillText('CUALQUIER TECLA  para el menu', W / 2, 132);
      }
    }

    // menú de configuración de mapa [M] — herramienta para prototipar niveles
    function drawCfg() {
      ctx.fillStyle = '#0a0e11ee'; ctx.fillRect(24, 20, W - 48, H - 40);
      ctx.strokeStyle = P.accent; ctx.globalAlpha = 0.6; ctx.strokeRect(24.5, 20.5, W - 49, H - 41); ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
      ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
      ctx.fillText('CONFIGURACION DE MAPA', W / 2, 33);
      ctx.font = '7px monospace';
      const rows = getCfgRows();
      if (cfgRow >= rows.length) cfgRow = 0;
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i], y = 48 + i * 13, on = i === cfgRow;
        let idx = r.opts.findIndex(o => o === r.get()); if (idx < 0) idx = 0;
        ctx.textAlign = 'left'; ctx.fillStyle = on ? P.accent : P.dim; ctx.fillText((on ? '> ' : '  ') + r.label, 34, y);
        ctx.textAlign = 'right'; ctx.fillStyle = on ? P.ink : P.body; ctx.fillText('< ' + r.names[idx] + ' >', W - 34, y);
      }
      ctx.textAlign = 'center'; ctx.fillStyle = P.dim; ctx.font = '6px monospace';
      ctx.fillText('flechas: mover / cambiar   ·   [M] o ENTER: cerrar', W / 2, H - 28);
    }

    // colores de la bandera argentina, para el conteo del despegue
    const CELESTE = '#75aadb', BLANCO = '#f2f7fb';

    function drawTakeoff() {
      ctx.textAlign = 'center';
      // placa oscura detras del encabezado: cae sobre el amanecer y sin esto no se lee
      ctx.fillStyle = '#0a0e11aa'; ctx.fillRect(0, 17, W, 23);
      ctx.fillStyle = P.ink; ctx.font = '7px monospace';
      ctx.fillText(T('takeoffTitle'), W / 2, 26);
      // el rumbo va pegado al titulo: antes estaba en y=80, encima del avion en la pista
      ctx.fillStyle = '#8a9ba1'; ctx.font = '6px monospace';
      ctx.fillText(T('takeoffHeading'), W / 2, 36);

      const cn = 3 - Math.floor(toT);
      if (cn >= 1) {
        const frac = toT % 1;
        const fs = Math.round(30 - frac * 10);
        const num = String(cn);
        ctx.font = 'bold ' + fs + 'px monospace';
        // sombra: el conteo cae sobre el sol del amanecer y sin esto no se lee
        ctx.fillStyle = '#0a0e11aa';
        ctx.fillText(num, W / 2 + 1, 69);
        // bandera argentina: tres franjas horizontales (celeste / blanco / celeste)
        const top = 68 - fs * 0.75, hgt = fs * 0.78;
        const bands = [[0, 1 / 3, CELESTE], [1 / 3, 2 / 3, BLANCO], [2 / 3, 1, CELESTE]];
        for (const [a, b, col] of bands) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, top + hgt * a, W, hgt * (b - a) + 0.5);   // +0.5: sin costura entre franjas
          ctx.clip();
          ctx.fillStyle = col;
          ctx.fillText(num, W / 2, 68);
          ctx.restore();
        }
      }
    }

    function bar(x, y, w, val, c, label) {
      ctx.fillStyle = '#00000066'; ctx.fillRect(x - 1, y - 1, w + 2, 5);
      px(x, y, Math.round(w * Math.max(0, Math.min(1, val))), 3, c);
      ctx.fillStyle = P.dim; ctx.font = '6px monospace'; ctx.textAlign = 'left';
      ctx.fillText(label, x, y - 3);
    }

    function drawHUD() {
      ctx.font = '8px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = P.ink;
      const digits = String(Math.floor(score)).padStart(6, '0');
      for (let i = 0; i < digits.length; i++) ctx.fillText(digits[i], 6 + i * 6, 12);
      ctx.textAlign = 'right'; ctx.fillStyle = P.dim;
      ctx.fillText(T('hud_best', { n: best }), W - 16, 12);   // corrido a la izq para no chocar el ícono de sonido

      // modo campaña: PROGRESO de la campaña arriba al centro. No repite el nombre del blanco —
      // de eso ya se ocupa la barra de objetivo, justo abajo.
      if (gameMode === 'campaign') {
        ctx.textAlign = 'center'; ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.accent;
        ctx.fillText(T('hud_mission', { n: curLevel + 1, m: MISSIONS.length }), W / 2, 12);
      }

      // barra de misión puerto→barcaza (modos con objetivo: ciclo de muerte y campaña)
      if (objectiveDist > 0) drawObjectiveBar();

      // velocidad (+ escalón de TURBINA cuando el afterburner sostenido está activo)
      ctx.textAlign = 'center'; ctx.font = '7px monospace';
      ctx.fillStyle = afterTier > 0 ? P.warn : boost || rasLevel > 0 ? P.accent : windF < 0.97 ? P.crest : P.dim;
      ctx.fillText(Math.round(spd * 4.2) + T('kmh') + (afterTier > 0 ? ' »' + afterTier : boost ? T('turboTag') : windF < 0.97 ? ' ▼' : ''), W / 2, H - 4);

      // --- avisos de la banda superior (radar y viento) ---
      // Todos los overlays de arriba van centrados en W/2, asi que se pisaban entre si.
      // Ahora arrancan DEBAJO de la barra de objetivo cuando esta existe (ocupa y=14..30);
      // si no hay mision, suben y quedan compactos. Cada aviso tiene su propia fila.
      const topBase = objectiveDist > 0 ? 38 : 20;

      if (detection > 0.3) {
        ctx.textAlign = 'center'; ctx.font = 'bold 8px monospace';
        ctx.fillStyle = Math.sin(t * 14) > 0 ? P.warn : '#7d2f1e';
        ctx.fillText(T('radar'), W / 2, topBase);
        ctx.fillStyle = '#00000066'; ctx.fillRect(W / 2 - 21, topBase + 3, 42, 4);
        px(W / 2 - 20, topBase + 4, Math.round(40 * detection), 2, P.warn);
      }

      // aviso de viento en contra — una fila mas abajo, nunca encima del radar
      if (windF < 0.97) {
        ctx.textAlign = 'center'; ctx.font = 'bold 7px monospace';
        ctx.fillStyle = Math.sin(t * 8) > 0 ? P.crest : P.dim;
        ctx.fillText(T('windWarn'), W / 2, topBase + 16);
      }

      // multiplicador junto al avión — crece con la racha rasante
      if (multShow > 1) {
        const s = proj(plane.x, plane.y, PZ);
        ctx.textAlign = 'left';
        const size = multShow >= 15 ? 12 + rasLevel : multShow >= 10 ? 11 : multShow >= 5 ? 10 : 9;
        ctx.font = 'bold ' + size + 'px monospace';
        ctx.fillStyle = multShow >= 25 ? (Math.sin(t * 16) > 0 ? P.warn : P.accent)
          : multShow >= 15 ? P.accent
            : multShow >= 10 ? P.accent
              : multShow >= 5 ? '#d9b06a' : P.dim;
        const jx = rasLevel > 0 ? (Math.random() - 0.5) * rasLevel : 0;
        const jy = rasLevel > 0 ? (Math.random() - 0.5) * rasLevel : 0;
        if (multShow < 10 || Math.sin(t * 10) > -0.6)
          ctx.fillText('x' + multShow + (boost ? ' x2' : ''), s.x + 24 + jx, s.y - 6 + jy);
        // barra de progreso hacia el próximo nivel de racha
        if (mult === 10 && rasLevel < 4) {
          const prog = (streak % 2) / 2;
          ctx.fillStyle = '#00000066'; ctx.fillRect(s.x + 24, s.y - 3, 26, 3);
          px(s.x + 25, s.y - 2, Math.round(24 * prog), 1, P.accent);
        }
      }
      // borde encendido según la racha
      if (rasLevel > 0) {
        ctx.globalAlpha = 0.05 * rasLevel + Math.max(0, Math.sin(t * 6)) * 0.04 * rasLevel;
        px(0, 0, W, 3, P.accent); px(0, H - 3, W, 3, P.accent);
        px(0, 0, 3, H, P.accent); px(W - 3, 0, 3, H, P.accent);
        ctx.globalAlpha = 1;
      }

      bar(6, H - 8, 60, fuel / 100, fuel < 25 ? (Math.sin(t * 10) > 0 ? P.warn : P.dim) : P.foam, T('bar_fuel'));
      bar(W - 66, H - 8, 60, heat, overheat ? P.warn : P.accent, overheat ? T('bar_overheat') : T('bar_cannon'));

      // munición de misiles (pips) — entre combustible y el centro
      ctx.textAlign = 'left'; ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
      ctx.fillText('MISIL', 72, H - 11);
      for (let i = 0; i < MSL_MAX; i++) {
        const on = i < msl, bx = 72 + i * 8;
        ctx.fillStyle = on ? P.accent : '#2e3c45'; ctx.fillRect(bx, H - 8, 5, 3);
        if (on) { ctx.fillStyle = P.warn; ctx.fillRect(bx + 5, H - 8, 1, 3); }
      }

      // palanca de gas (throttle) — vertical, borde derecho
      const tx = W - 9, tyTop = 46, tyBot = 118, tH = tyBot - tyTop;
      ctx.fillStyle = '#00000088'; ctx.fillRect(tx - 1, tyTop - 1, 6, tH + 2);
      ctx.fillStyle = P.dim;                                     // marcas de la corredera
      for (let i = 0; i <= 4; i++) ctx.fillRect(tx - 3, Math.round(tyBot - tH * (i / 4)), 2, 1);
      const fillH = Math.round(tH * Math.max(0, Math.min(1, throttle)));
      const tcol = fuel <= 0 ? (Math.sin(t * 10) > 0 ? P.warn : P.dim)
        : throttle > 0.66 ? P.foam : throttle > 0.15 ? P.accent : P.bodyDark;
      px(tx, tyBot - fillH, 4, fillH, tcol);                     // relleno desde abajo
      px(tx - 2, tyBot - fillH - 1, 8, 2, P.ink);                  // perilla de la palanca
      ctx.fillStyle = P.dim; ctx.font = '6px monospace'; ctx.textAlign = 'right';
      ctx.fillText(fuel <= 0 ? T('thr_dead') : T('thr'), W - 4, tyTop - 4);
    }

    function panel() { ctx.fillStyle = '#0d1216cc'; ctx.fillRect(0, 0, W, H); }

    function drawMenu() {
      panel();
      ctx.textAlign = 'center';
      ctx.fillStyle = P.accent; ctx.font = 'bold 16px monospace';
      ctx.fillText(T('title'), W / 2, 20);
      ctx.fillStyle = P.dim; ctx.font = '6px monospace';
      ctx.fillText(T('selTitle'), W / 2, 32);
      // indicador de modo (menú compartido: ciclo de muerte o supervivencia)
      ctx.fillStyle = P.foam; ctx.font = 'bold 7px monospace';
      ctx.fillText(gameMode === 'cycle' ? T('modeCycle') : T('modeSurvival'), W / 2, 42);

      // preview del avión elegido, con leve cabeceo
      const pl = PLANES[selPlane];
      if (pl.ready) {
        const PW = 130, PH = Math.round(PW * pl.h / pl.w);
        ctx.drawImage(pl.img, Math.round(W / 2 - PW / 2), Math.round(76 - PH / 2 + Math.sin(t * 1.6) * 2), PW, PH);
      }
      // flechas de selección (parpadean)
      ctx.fillStyle = Math.sin(t * 6) > 0 ? P.ink : P.dim; ctx.font = 'bold 15px monospace';
      ctx.fillText('<', 16, 80); ctx.fillText('>', W - 16, 80);

      // nombre + descripción
      ctx.fillStyle = P.accent; ctx.font = 'bold 11px monospace';
      ctx.fillText(pl.name, W / 2, 114);
      ctx.fillStyle = P.dim; ctx.font = '6px monospace';
      ctx.fillText(pl.desc[getLang()] || pl.desc.es, W / 2, 126);

      // puntos indicadores del carrusel
      const n = PLANES.length, gap = 6, totW = (n - 1) * gap;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i === selPlane ? P.accent : '#3a464c';
        ctx.fillRect(Math.round(W / 2 - totW / 2 + i * gap) - 1, 134, 3, 3);
      }
      // prompt de arranque
      if (Math.sin(t * 4) > -0.3) {
        ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
        ctx.fillText(T('selHint'), W / 2, 150);
      }
      ctx.fillStyle = '#5c6e73'; ctx.font = '6px monospace';
      ctx.fillText('[L] ' + T('langName') + '   ·   [M] config mapa   ·   [ESC] modos', W / 2, 162);
      ctx.fillText(T('homage'), W / 2, 172);
    }

    function wrapText(txt, x, y, maxW, lh) {
      const words = txt.split(' '); let line = '', yy = y;
      for (const w of words) {
        if (ctx.measureText(line + w).width > maxW && line) { ctx.fillText(line, x, yy); line = w + ' '; yy += lh; }
        else line += w + ' ';
      }
      ctx.fillText(line.trim(), x, yy);
    }

    function drawDead() {
      panel();
      ctx.textAlign = 'center';
      ctx.fillStyle = P.warn; ctx.font = 'bold 16px monospace';
      ctx.fillText(T('dead'), W / 2, 42);
      ctx.fillStyle = P.dim; ctx.font = '7px monospace';
      ctx.fillText(T(deathCause), W / 2, 55);
      ctx.fillStyle = P.ink; ctx.font = 'bold 10px monospace';
      ctx.fillText(T('scoreLabel', { n: Math.floor(score) }), W / 2, 78);
      ctx.fillStyle = Math.floor(score) >= best && best > 0 ? P.accent : P.dim;
      ctx.font = '8px monospace';
      ctx.fillText((Math.floor(score) >= best && best > 0 ? T('newRecord') : T('bestDead', { n: best })), W / 2, 92);
      ctx.fillStyle = '#8a9ba1'; ctx.font = '6px monospace';
      wrapText('» ' + L().facts[factIdx], W / 2, 116, 260, 9);
      if (deathT > 0.7 && Math.sin(t * 4) > -0.3) {
        ctx.fillStyle = P.accent; ctx.font = 'bold 8px monospace';
        ctx.fillText(T('retryPrompt'), W / 2, 150);
      }
      if (deathT > 0.7) {
        ctx.fillStyle = P.dim; ctx.font = '7px monospace';
        ctx.fillText(T('menuPrompt'), W / 2, 162);
      }
    }

    // ---------- loop ----------
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      update(dt); draw(); updateMusic(state);
      if (mslBtn) mslBtn.classList.toggle('on', state === 'play' || state === 'momentum');   // botón de misil en juego y momentum
      requestAnimationFrame(frame);
    }
    applyChrome();
    reset();
    requestAnimationFrame(frame);
  })();
