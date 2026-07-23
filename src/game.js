// RASANTE — entry point. Los modulos de datos se bundlean con esbuild (npm run build:game);
// hace falta bundlear porque Electron carga por file://, donde Chromium bloquea los ES modules.
import { STRINGS } from './data/strings.js';
import { P, WATER_STYLES, SKY_PRESETS, LAND } from './data/palette.js';
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
import { audio, beep, boom, sfxOne, sfxSrc, setMuted, isMuted, updateSfx, updateMusic, engineFly,
         engineOff, engineRumble, duck, tickDuck, pickRunTrack } from './systems/audio.js';
import * as world3D from './systems/three-world.js';
import { cv, ctx, W, H, HOR, F, PZ, SC, px, panel } from './render/ctx.js';
import * as screens from './render/screens.js';
import { PLANES, SHEET_FW, SHEET_FH, SHEET_NF, SHEET_ROWS } from './data/planes.js';
import * as menus from './render/menus.js';
import * as momRender from './render/momentum.js';
import { pitchTarget, applyEnergy, applyDrag, scrapeLimit, speedTarget, windFactor,
         PITCH_LERP, SCRAPE_RECOVER, SCRAPE_LIFT, AFTER_STEP, AFTER_MAX } from './core/physics.js';
import { MOM_AX, MOM_AY, MSL_MAX, REATTACK_DUR, REATTACK_FUEL, REATTACK_MAX, FLY_X, FLY_TOP, SPAWN_X } from './data/tuning.js';

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

    let WATER = WATER_STYLES[cfg.water];
    let SKY = SKY_PRESETS[cfg.sky];
    function applyCfg() { WATER = WATER_STYLES[cfg.water] || WATER_STYLES.sea; SKY = SKY_PRESETS[cfg.sky] || SKY_PRESETS.dusk; }

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
    function confirmMode() { const m = MODES[modeSel]; if (m === 'campaign') startCampaign(); else if (m === 'cycle') goCycle(); else goSurvival(); }
    // arranca la mision actual por la puerta que corresponda: guion largo (campaña, si lo tiene)
    // o tarjeta corta de briefing (ciclo de muerte). Devuelve el estado al que hay que ir.
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
        objectiveDist = g.dist(m.goal) * QA_DIST;
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
    let selPlane = 0, startReq = false;



    // ---------- estado ----------
    let deathCause, deathT, factIdx = 0, best = 0;
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
    const ROLL_DUR = 0.55;
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

    function reset() {
      resetRun();       // toda la corrida (velocidad, nafta, rachas, armas, spawn…) a su estado inicial
      resetPlane();     // el avion a la posicion de arranque
      resetStats();     // los contadores del recuento final
      clearWorld();     // vacia el campo de obstaculos, balas, particulas…
      momentum.resetMomentum();
      toT = 0; toCount = 4;
      cam.x = 0; cam.y = 4;
    }

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
      if (S.state === 'modeselect') {                                       // pantalla inicial: CAMPAÑA / CICLO / SUPERVIVENCIA
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'ArrowLeft' || e.code === 'KeyA') { modeSel = (modeSel + MODES.length - 1) % MODES.length; beep(520, 0.05, 'square', 0.04); e.preventDefault(); return; }
        if (e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'ArrowRight' || e.code === 'KeyD') { modeSel = (modeSel + 1) % MODES.length; beep(520, 0.05, 'square', 0.04); e.preventDefault(); return; }
        if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyX' || e.code === 'KeyK') { confirmMode(); e.preventDefault(); return; }
        return;
      }
      if (S.state === 'dead') {                                              // DERRIBADO: Esc/Backspace vuelve al menú principal
        if (e.code === 'Escape' || e.code === 'Backspace') { setState('modeselect'); cfgOpen = false; beep(400, 0.06, 'square', 0.05); e.preventDefault(); return; }
      }
      if (S.state === 'menu') {                                             // pantalla de selección de avión (supervivencia)
        if (e.code === 'Escape' || e.code === 'Backspace') { setState('modeselect'); cfgOpen = false; beep(400, 0.06, 'square', 0.05); e.preventDefault(); return; }
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
      if (S.state === 'story') {                                            // HISTORIA: Esc vuelve al menu principal
        if (e.code === 'Escape' || e.code === 'Backspace') { setState('modeselect'); beep(400, 0.06, 'square', 0.05); e.preventDefault(); return; }
      }
      // PIRUETA (tonel): doble-tap ← / → en vuelo — pulsaciones frescas, no auto-repeat
      if (!e.repeat && S.state === 'play') {
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
        if (S.state === 'play' || S.state === 'takeoff') popup(W / 2, 58, camMode ? 'CAM ' + CAM_ZOOMS[camMode] + '×' : 'CAM 1×', P.accent);
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
      if (S.state === 'modeselect') {                                       // 3 filas: tap en una fila la elige y confirma
        const row = Math.floor((p.y - 60) / 34);
        if (row >= 0 && row < MODES.length) { modeSel = row; confirmMode(); }
        return;
      }
      if (S.state === 'menu') {                                             // selección: tap izq/der cambia, centro despega
        if (cfgOpen) { cfgOpen = false; return; }                         // en config (por teclado), tocar cierra
        if (p.x < W * 0.28) { selPlane = (selPlane + PLANES.length - 1) % PLANES.length; beep(520, 0.05, 'square', 0.04); }
        else if (p.x > W * 0.72) { selPlane = (selPlane + 1) % PLANES.length; beep(600, 0.05, 'square', 0.04); }
        else startReq = true;
        return;
      }
      // PC (mouse): click izquierdo = canon sostenido, click derecho = misil — en juego y momentum
      if (e.pointerType === 'mouse' && (S.state === 'play' || S.state === 'momentum')) {
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
    function camZoomOn() { return camZ > 1.005 && (S.state === 'play' || S.state === 'takeoff' || S.state === 'dead'); }
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

    // opacidad de los cuadrados del mar 2D (todo el vuelo). Vivia en el bloque de three.js por
    // vecindad historica, pero es del render 2D: se quedo aca al separar el modulo 3D.
    const SEA_ALPHA2D = 0.6;

    // ---------- mundo ----------
    function waveNow() { return 1.1 + Math.sin(run.t * 1.1) * 0.5 + Math.sin(run.t * 2.3) * 0.3; }
    // campo de altura de la superficie para la malla de puntos (ondas superpuestas)
    function seaH(wx, wz) {
      return 1.0
        + Math.sin(wz * 0.035 - run.t * 1.1) * 0.9           // marejada larga que rueda hacia la cámara
        + Math.sin(wz * 0.22 + run.t * 2.2) * 0.65
        + Math.sin(wz * 0.09 - run.t * 1.5 + wx * 0.15) * 0.5
        + Math.sin(wx * 0.30 + wz * 0.05 + run.t * 1.9) * 0.35;
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



    // la barcaza objetivo VISIBLE en vuelo normal: aparece en el horizonte desde el 45% del recorrido
    // y crece hasta empalmar con la escala de la proxima pasada del momentum (es el final del mapa)
    function drawApproachBarge() {
      const ph = momentum.phase(), PH = momentum.phases();
      if (objectiveDist <= 0 || ph >= PH.length) return;
      if (S.state !== 'play' && S.state !== 'takeoff') return;
      const p = run.dist / objectiveDist;
      const next = PH[ph];
      const t0 = ph === 0 ? 0.45 : PH[ph - 1].at;
      if (p < t0) return;
      const f = Math.max(0, Math.min(1, (p - t0) / (next.at - t0)));
      const sc0 = ph === 0 ? 0.04 : PH[ph - 1].scale * 1.06;  // continua donde quedo la pasada anterior
      const scE = next.scale * 0.82;
      const sc = sc0 + (scE - sc0) * f;
      // ALINEADO AL HORIZONTE: la barcaza queda pegada a la linea del horizonte (donde emergen los
      // obstaculos, misma perspectiva) casi todo el acercamiento, y recien "baja" (se acerca) sobre
      // el final con ease-in cuadratico, empalmando exacto con la cubierta del momentum (HOR+36*scE).
      const d0 = ph === 0 ? 2 : 36 * sc0;
      const dOff = d0 + (36 * scE - d0) * f * f;
      const bx = W / 2 - cam.x * 1.2 + Math.sin(run.t * 0.8) * 6 * sc;
      const by = HOR + dOff + Math.sin(run.t * 1.3) * 1.2 * sc;
      // bruma atmosferica: de lejos es una silueta tenue → los obstaculos (solidos) resaltan encima
      ctx.globalAlpha = ph === 0 ? 0.35 + 0.65 * f : 1;
      momRender.drawBargeHull(bx, W * 0.82 * sc, by, 9 * sc, run.t);
      ctx.globalAlpha = 1;
      if (sc > 0.28) {   // ya cerca: nombre sobre el barco
        ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn; ctx.globalAlpha = 0.85;
        ctx.fillText(objectiveShip, bx, by - 9 * sc * 4.6);
        ctx.globalAlpha = 1;
      }
    }

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
      const m = curMission();
      const flight = Math.floor(run.score);
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


    // PIRUETA (tonel / aileron roll): esquive cinematico con doble-tap ←/→
    function startRoll(dir) {
      if (S.state !== 'play' || run.rollT > 0 || run.rollCd > 0) return;
      run.rollT = ROLL_DUR; run.rollDir = dir; run.rollCd = 1.15;
      sfxOne('waveFly');                        // rafaga de aire de la pirueta
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
      sfxOne('exSmall');   // mi avion chocando (agua incluida, por ahora)
      factIdx = (factIdx + 1) % L().facts.length;
      explodeAt(plane.x, plane.y, PZ, true);
      const s = proj(plane.x, 0, PZ);
      for (let i = 0; i < 16; i++) parts.push({ x: s.x + (Math.random() - 0.5) * 24, y: s.y, vx: (Math.random() - 0.5) * 40, vy: -40 - Math.random() * 60, life: 0.6, c: P.foam, r: 1.6 });
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
      tickDuck(dt);                      // el ducking de la musica se recupera solo
      fadeT = Math.max(0, fadeT - dt);   // fundido desde negro (se pinta al final de draw)
      updateSfx(dt, { state: S.state, cfg, plane, boost: run.boost, firing: inp.fire, overheat: run.overheat, soldiers });   // loops con fade
      // camara CERCA: interpola hacia el objetivo; fuera de vuelo (o al morir) vuelve sola a 1
      // para que cada entrada a play arranque con zoom-in suave y sin saltos entre estados
      const camZt = (S.state === 'play' || S.state === 'takeoff') ? CAM_ZOOMS[camMode] : 1;
      camZ += (camZt - camZ) * Math.min(1, dt * 3.5);

      // despegue automático desde Puerto Argentino: el control llega a los 3 s
      if (S.state === 'takeoff') {
        toT += dt;
        const spdBase0 = Math.min(150, 62 + run.t * 2.8);
        run.spd = 6 + spdBase0 * Math.min(1, toT / 2.0);
        run.dist += run.spd * dt;
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
        engineFly(run.spd, false, 0.017 * Math.min(1, toT));
        if (toT >= 3) { setState('play'); popup(W / 2, 54, T('freeControl'), P.accent); run.shake = Math.min(6, run.shake + 1); }
        parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
        prune(parts, p => p.life > 0);
        popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
        prune(popups, p => p.life > 0);
        run.shake = Math.max(0, run.shake - dt * 10);
        anyPress = false;
        return;
      }

      if (S.state !== 'play') {
        if (S.state === 'dead') deathT += dt;
        if (S.state === 'victory') levelT += dt;
        parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
        prune(parts, p => p.life > 0);
        engineOff();
        if (S.state === 'momentum') {
          run.shake = Math.max(0, run.shake - dt * 10);
          const sig = momentum.update(dt, inp, mouse, objectiveDist);   // señal de salida: no llama hacia arriba
          if (sig === 'objective') finishObjective();
          else if (sig && sig.death) die(sig.death);
          startReq = false; anyPress = false;
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
          if (anyPress && story.t > 0.4) {
            if (!story.done) { story.t += 999; }                          // completar de un saque
            else if (story.si + 1 < story.seq.length) {                   // → siguiente pantalla de la secuencia
              story.si++; initStoryScreen(); beep(500, 0.05, 'square', 0.04);
            } else { run.t = 0; fadeT = 1.4; setState('takeoff'); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
          }
        } else if (S.state === 'brief') {
          // tarjeta corta de mision (ciclo de muerte, y campaña sin guion): una tecla despega
          briefT += dt;
          if (briefT > 0.6 && anyPress) { run.t = 0; fadeT = 1.0; setState('takeoff'); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
        } else if (S.state === 'menu') {
          // el menú lo comparten SUPERVIVENCIA y CICLO DE MUERTE
          if (startReq) {
            reset(); setRunObjective();
            // ciclo: pasa por el briefing corto de la mision; supervivencia: derecho al despegue
            if (gameMode === 'cycle') { briefT = 0; setState('brief'); beep(600, 0.08, 'square', 0.05); }
            else { setState('takeoff'); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
          }
        } else if (S.state === 'dead') {
          if (deathT > 0.7 && anyPress) { reset(); setRunObjective(); setState('takeoff'); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }  // reintenta (mismo modo/nivel)
        } else if (S.state === 'results') {
          // RECUENTO: las filas entran de a una; una tecla las completa de golpe, la siguiente pasa al epilogo
          resT += dt;
          const nRows = lastRun ? lastRun.rows.length : 0;
          const want = Math.min(nRows, Math.floor(resT / 0.45));
          if (want > resRow) { resRow = want; beep(760 + resRow * 90, 0.07, 'square', 0.05); }
          const full = resRow >= nRows && resT > nRows * 0.45 + 0.7;
          if (anyPress && resT > 0.5) {
            if (!full) { resT = nRows * 0.45 + 0.8; resRow = nRows; }   // completar de un saque
            else { initStory(lastRun.mission.epi); setState('epilogue'); beep(500, 0.05, 'square', 0.04); }
          }
        } else if (S.state === 'epilogue') {
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
                const keep = run.score; loadLevel(curLevel + 1); reset(); run.score = keep;
                setRunObjective(); setState(enterMission());
              } else { setState('victory'); levelT = 0; }
            } else {
              // ciclo de muerte: otra mision al azar, desde cero
              randomMission(); reset(); setRunObjective(); briefT = 0; setState('brief');
            }
          }
        } else if (S.state === 'victory') {
          if (levelT > 0.8 && anyPress) { setState('modeselect'); }
        }
        startReq = false; anyPress = false;
        return;
      }
      anyPress = false;

      if (flightSystem(dt)) return;      // vuelo, superficie, armas → puede terminar la mision o matar
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

    // VUELO: gas y energia, alabeo/cabeceo, roce con la superficie, combustible, radar y armas
    // del jugador. Devuelve true si la mision termino (objetivo) o el avion se estrello.
    function flightSystem(dt) {
      // velocidad — el multiplicador y la racha rasante aceleran el avión
      run.boost = inp.turbo && run.fuel > 0;
      // viento en contra: cuanto más tiempo arriba, más resistencia (hasta -35%)
      if (cfg.wind && plane.y > 16) run.windT = Math.min(6, run.windT + dt);
      else run.windT = Math.max(0, run.windT - dt * 2);
      run.windF = windFactor(run.windT, cfg.wind);
      // AFTERBURNER SOSTENIDO: aguantar BOOST + RASANTE acumula tiempo; cada AFTER_STEP s sube un
      // escalón (hasta AFTER_MAX). Cada escalón multiplica la velocidad (AFTER_GAIN) y levanta el
      // techo (AFTER_CAP) para que el aumento se SIENTA. Soltar turbo o trepar lo corta (con gracia).
      const rasNow = plane.y <= 4.5;
      if (run.boost && rasNow) { run.afterT += dt; run.afterGrace = 0.4; }
      else if (run.afterGrace > 0) run.afterGrace -= dt;   // bob corto no rompe la racha
      else run.afterT = 0;
      const prevTier = run.afterTier;
      run.afterTier = Math.min(AFTER_MAX, Math.floor(run.afterT / AFTER_STEP));
      if (run.afterTier > prevTier) {                   // subió de escalón: feedback
        const s = proj(plane.x, plane.y, PZ);
        popup(s.x, s.y - 22, T('afterburner', { n: run.afterTier }), P.warn);
        beep(360 + run.afterTier * 130, 0.16, 'sawtooth', 0.06, 220 + run.afterTier * 90);
        run.shake = Math.min(6, run.shake + 1.1);
        for (let i = 0; i < 10 + run.afterTier * 3; i++) {
          const a = Math.random() * 6.283;
          streaks.push({ a, r: 20 + Math.random() * 18, v: 320 + Math.random() * 220, life: 0.5 });
        }
      }
      const spdTarget = speedTarget({ t: run.t, rasLevel: run.rasLevel, mult: run.mult, windF: run.windF, boost: run.boost, afterTier: run.afterTier });
      // INTERCAMBIO DE ENERGIA (cfg.energy): la ALTURA es energia almacenada — picar la convierte
      // en velocidad, trepar la gasta. Es lo que arma el pendulo (bajar rapido → rasar → trepar).
      // El arrastre hacia spdTarget se AFLOJA (3 → ENERGY_DRAG) porque con el lerp rapido de antes
      // lo que ganabas picando se evaporaba en medio segundo y no se acumulaba nada.
      run.spd = cfg.energy ? applyEnergy(run.spd, spdTarget, plane.vy, dt) : applyDrag(run.spd, spdTarget, dt);
      // turbulencia: el viento sacude el avión
      if (run.windF < 0.97) {
        plane.vx += (Math.random() - 0.5) * 95 * (1 - run.windF) * dt * 4;
        plane.vy += (Math.random() - 0.5) * 70 * (1 - run.windF) * dt * 4;
        run.shake = Math.max(run.shake, (1 - run.windF) * 3.5);
        if (Math.random() < 0.02) boom(0.03, true);
      }
      // ráfagas visibles cruzando el cielo
      if (run.windT > 0.8 && Math.random() < (run.windT / 6) * 0.9)
        gusts.push({ x: W + 10, y: 4 + Math.random() * (HOR + 26), v: 260 + Math.random() * 170, len: 10 + Math.random() * 18, life: 2 });
      gusts.forEach(g => { g.x -= g.v * dt; g.life -= dt; });
      prune(gusts, g => g.x > -32 && g.life > 0);
      run.dist += run.spd * dt;
      run.fuelDist += run.spd * dt;

      // OBJETIVO cumplido. Segun el tipo de meta (ver GOALS):
      //   - con climax (ship): al acercarse al blanco arranca el asalto por pasadas (MOMENTUM)
      //   - sin climax (distance): llegar a la distancia YA cierra la mision
      if (objectiveDist > 0) {
        const needsMom = (gameMode === 'campaign' || gameMode === 'cycle') ? goalOf(curMission()).needsMomentum : true;
        if (needsMom) {
          if (momentum.readyToEnter(run.dist, objectiveDist)) { momentum.enter(); return true; }
        } else if (run.dist >= objectiveDist) { finishObjective(); return true; }
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
        plane.vy += (((inp.u && run.fuel > 0) ? TH : 0) - G - (inp.d ? DIVE : 0)) * dt;
        plane.vy = Math.max(-20, Math.min(18, plane.vy));
      }
      // PIRUETA (tonel): rafaga lateral fuerte que decae + estelas de viento; el perfil de
      // colision se ENCOGE mientras rola (alas "de canto") → pasa por espacios mas finos
      run.rollCd = Math.max(0, run.rollCd - dt);
      if (run.rollT > 0) {
        run.rollT -= dt;
        plane.vx = run.rollDir * 40 * (0.45 + run.rollT / ROLL_DUR);
        if (Math.random() < 0.85) {
          const sp2 = proj(plane.x + (Math.random() - 0.5) * 3, plane.y + (Math.random() - 0.5) * 2, PZ);
          parts.push({
            x: sp2.x - run.rollDir * 10, y: sp2.y, vx: -run.rollDir * (55 + Math.random() * 40),
            vy: (Math.random() - 0.5) * 20, life: 0.3, c: P.crest, r: 1
          });
        }
      }
      // throttle (palanca de gas): sube al dar gas, baja al soltar — solo indicador visual
      const gasOn = run.fuel > 0 && (inp.u || (steerTarget && plane.vy > 0.5));
      run.throttle += ((gasOn ? 1 : 0) - run.throttle) * Math.min(1, dt * 7);
      if (cfg.fuelOn) run.fuel -= (3.2 + (run.boost ? 4.2 : 0)) * dt;   // COMBUSTIBLE: NO (menú [M]) = tanque infinito, para pruebas
      if (run.fuel <= 0) { run.fuel = 0; plane.vy = Math.min(plane.vy, -5); }
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
      run.pitchHold = vin !== 0 ? run.pitchHold + dt : 0;
      const pitchTgt = pitchTarget(vin, run.pitchHold, plane.vy);
      plane.bank += (bankTarget - plane.bank) * Math.min(1, dt * 9);   // entra/sale con peso
      plane.pitch += (pitchTgt - plane.pitch) * Math.min(1, dt * PITCH_LERP);   // igual de rapido que el alabeo

      // puntaje por altitud + racha rasante
      const alt = plane.y;
      run.mult = multOf(alt);
      if (alt <= 4.5) { run.streak += dt; run.graceT = 0.45; }
      else if (run.graceT > 0) run.graceT -= dt;
      else { run.streak = 0; run.rasLevel = 0; }
      const newLevel = Math.min(4, Math.floor(run.streak / 2));
      if (newLevel > run.rasLevel) {
        run.rasLevel = newLevel;
        stats.bestRas = Math.max(stats.bestRas, run.rasLevel);   // mejor nivel de racha alcanzado
        const s = proj(plane.x, plane.y, PZ);
        popup(s.x, s.y - 16, T('rasante', { n: 10 + run.rasLevel * 5 }), P.accent);
        beep(500 + run.rasLevel * 180, 0.14, 'square', 0.06, 750 + run.rasLevel * 180);
        run.shake = Math.min(6, run.shake + 1.4);
        // oleada de líneas de velocidad al subir de nivel
        for (let i = 0; i < 14; i++) {
          const a = Math.random() * 6.283;
          streaks.push({ a, r: 24 + Math.random() * 16, v: 280 + Math.random() * 180, life: 0.5 });
        }
      }
      run.multShow = run.mult === 10 ? 10 + run.rasLevel * 5 : run.mult;
      run.score += (run.boost ? 2 : 1) * 12 * run.multShow * dt;
      // superficie LETAL: tocar el suelo (o el agua) = explotar. Sobre tierra hay que volar en la banda
      // baja y arriesgada (arriba del suelo, pero bajo para clipear/matar soldados con el pase rasante).
      const overRunway = run.dist + PZ < cfg.coast;
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
      if (plane.y <= (run.scrapeT > 0 ? scrapeY + 0.2 : groundY)) {
        const lim = scrapeLimit(run.spd, run.boost);
        run.scrapeT += dt;
        if (run.scrapeT >= lim) { die(deathMsg); return true; }                 // se agoto el margen
        // PISO, no altura fija: no se hunde, no salta solo, pero SI podes trepar dando gas.
        // (con "plane.y = scrapeY" quedaba clavado: vy acumulaba empuje sin mover el avion y
        //  salias catapultado un segundo despues, o te morias antes de lograrlo)
        if (plane.y < scrapeY) plane.y = scrapeY;
        if (plane.vy < 0) plane.vy = 0;
        plane.vy += (Math.random() - 0.5) * 26 * dt;                       // tambaleo vertical
        run.scrapeVib = 1;                                                     // el AVION vibra (ver drawPlaneSprite)
        plane.vx += (Math.random() - 0.5) * 140 * dt;                      // guiñada erratica
        run.spd = Math.max(34, run.spd - run.spd * 1.1 * dt);                          // el roce FRENA
        run.shake = Math.min(7, run.shake + 26 * dt);
        run.streak = 0; run.rasLevel = 0; run.afterT = 0; run.afterTier = 0;               // se corta la racha
        // chispas / rocio del roce
        const sp = proj(plane.x, groundY, PZ);
        for (let i = 0; i < 3; i++) parts.push({
          x: sp.x + (Math.random() - 0.5) * 14, y: sp.y, vx: (Math.random() - 0.5) * 90,
          vy: -30 - Math.random() * 70, life: 0.35,
          c: cfg.terrain === 'land' ? P.accent : P.crest, r: 1.4
        });
        if (!sfxOne('waveFly')) beep(90 + Math.random() * 60, 0.05, 'sawtooth', 0.05);
        // aviso pegado al limite: cuanto le queda al margen
        if (Math.sin(run.t * 30) > 0) popup(sp.x, sp.y - 26, T('scrape'), P.warn);
      } else {
        run.scrapeT = Math.max(0, run.scrapeT - dt * SCRAPE_RECOVER);   // salir descuenta, pero no borra
        run.scrapeVib = Math.max(0, run.scrapeVib - dt * 6);            // la vibracion se apaga al salir
      }

      // estela sobre el agua
      const lowI = Math.max(0, 1 - alt / 9);
      if (lowI > 0 && !overRunway && cfg.terrain !== 'land') {
        wake.push({ x: plane.x, z: PZ, i: lowI });
        if (wake.length > 150) wake.shift();
      }
      for (const wp of wake) wp.z -= run.spd * dt;
      prune(wake, w => w.z > 2.4);

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
      if (alt < 4.5) run.shake = Math.max(run.shake, (4.5 - alt) * 0.3);

      // radar
      if (alt > 30) run.detection += dt / 1.4; else run.detection -= dt / 0.9;
      run.detection = Math.max(0, Math.min(1, run.detection));
      if (run.detection >= 1) {
        run.detection = 0.35;
        missiles.push({ x: plane.x + (Math.random() * 24 - 12), y: plane.y + 4, z: 230, done: false });
        beep(880, 0.12, 'square', 0.06); setTimeout(() => beep(880, 0.12, 'square', 0.06), 160);
      }

      // cañón
      run.fireT -= dt;
      run.heat -= dt * (inp.fire ? 0.22 : 0.5);
      if (run.heat < 0) run.heat = 0;
      if (run.overheat && run.heat < 0.3) run.overheat = false;
      if (inp.fire && !run.overheat && run.fireT <= 0) {
        run.fireT = 1 / 9; stats.shots++;   // denominador de la PRECISION del recuento
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
        run.heat += 0.10;
        if (run.heat >= 1) { run.overheat = true; beep(140, 0.3, 'sawtooth', 0.05); }
        else if (!sfxSrc('gun')) beep(1100 + Math.random() * 300, 0.04, 'square', 0.028);   // web: beep; escritorio: loop de metralla
      }

      // misiles del jugador: cooldown, recarga lenta y lanzamiento (tecla Z / botón táctil)
      run.mslCd -= dt;
      if (run.msl < MSL_MAX) { run.mslRegen += dt; if (run.mslRegen >= 7) { run.mslRegen = 0; run.msl++; } }
      if (inp.msl) tryLaunchMissile();

      return false;
    }

    // ---------- render ----------

    function drawSea() {
      const landMode = cfg.terrain === 'land';
      const dv = run.dist + momentum.drift();   // distancia VISUAL (drift del momentum incluido)
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
      const dv = run.dist + momentum.drift();
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
      const dv = run.dist + momentum.drift();
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
          const shimmer = Math.sin(wz * 0.06 - run.t * 2.6 + wx * 0.045);
          if (shimmer > 0.6) hn = Math.min(1, hn + 0.24);
          const col = hn > 0.72 ? WATER.crest : hn > 0.42 ? WATER.mid : WATER.deep;
          // OPACIDAD por cuadrado = SEA_ALPHA2D (perilla global, 0.5) x fade (entrada 3..12u y
          // caida por lejania) x altura de ola: 0.25 de piso en el valle + hasta 0.6 por la
          // cresta (hn 0..1) + 0.15 si lo cruza una banda de luz → rango 12%..50%
          ctx.globalAlpha = SEA_ALPHA2D * fade * (0.25 + hn * 0.6 + (shimmer > 0.6 ? 0.15 : 0));
          px(s.x - dotW / 2, s.y, dotW, dotW, col);
          // destello en las crestas cercanas (titileo determinista, sin flicker feo)
          if (hn > 0.78 && k > 1.6 && Math.sin(wx * 12.9 + wz * 7.3 + run.t * 6) > 0.7) {
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
      if (churn > 0 && S.state === 'play' && cfg.terrain !== 'land') {
        ctx.globalAlpha = churn * 0.7;
        px(sh.x - 11, sh.y - 1, 22, 2, P.foam);
        px(sh.x - 15, sh.y, 30, 1, P.crest);
      }
      ctx.globalAlpha = 1;

      ctx.save();
      // sub-pixel + bob de vuelo (nunca queda congelado) + micro-oscilación de alabeo en el aire
      const bob = (S.state === 'play' ? Math.sin(run.t * 3.1) * 0.5 + Math.sin(run.t * 1.7) * 0.3 : 0);
      // VIBRACION al rozar la superficie: temblor rapido del fuselaje (el avion, no la camara)
      const vx2 = run.scrapeVib ? (Math.random() - 0.5) * 3.2 * run.scrapeVib : 0;
      const vy2 = run.scrapeVib ? (Math.random() - 0.5) * 2.4 * run.scrapeVib : 0;
      ctx.translate(s.x + vx2, s.y - bob + vy2);
      // cabeceo: el morro sube al trepar / baja al caer (desplazamiento vertical del sprite)
      ctx.translate(0, -plane.pitch * 1.2);
      // alabeo: rotación 2D + micro-wobble; el foreshortening en X finge la inclinación 3D del ala
      const bank = Math.max(-1, Math.min(1, plane.bank));
      const pl = PLANES[selPlane];
      const useSheet = pl.sheetOk;   // sprite HORNEADO: el alabeo lo traen los frames
      let rolling = run.rollT > 0;
      if (rolling) {
        // PIRUETA: tonel completo — el sprite (vista trasera) rota 360° en el plano de pantalla
        const pr = 1 - run.rollT / ROLL_DUR;                   // 0→1 durante el tonel
        ctx.rotate(run.rollDir * pr * Math.PI * 2);
        ctx.scale(0.94 + 0.06 * Math.cos(pr * Math.PI * 2), 1);   // leve pulso: vende el giro
      } else if (useSheet) {
        // con frames de alabeo Y cabeceo REALES no hay rotacion ni squash fingidos: solo micro-wobble
        ctx.rotate(S.state === 'play' ? Math.sin(run.t * 2.3) * 0.015 : 0);
      } else {
        ctx.rotate(bank * 0.42 + (S.state === 'play' ? Math.sin(run.t * 2.3) * 0.015 : 0));
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
          ctx.rotate(-run.rollDir * gi * 0.55);
          ctx.globalAlpha = 0.14;
          ctx.drawImage(pl.sheetImg, sx4, sy4, SHEET_FW, SHEET_FH, -SHEET_FW / 2, -SHEET_FH / 2, SHEET_FW, SHEET_FH);
          ctx.restore();
        }
        if (run.boost) { const fl = 5 + Math.random() * 4; px(-2, SHEET_FH / 2 - 8, 4, fl, P.foam); px(-1, SHEET_FH / 2 - 8, 2, fl * 0.7, P.accent); }
        ctx.drawImage(pl.sheetImg, sx4, sy4, SHEET_FW, SHEET_FH, -SHEET_FW / 2, -SHEET_FH / 2, SHEET_FW, SHEET_FH);
        if (inp.fire && !run.overheat && run.fireT > 0.06) { px(-6, -2, 3, 2, P.ink); px(3, -2, 3, 2, P.ink); }
      } else if (pl.ready) {
        const PW = 54, PH = Math.round(PW * pl.h / pl.w);
        // fantasmas de la pirueta: 2 copias retrasadas en el giro, translucidas (estela cinematica)
        if (rolling) for (let gi = 2; gi >= 1; gi--) {
          ctx.save();
          ctx.rotate(-run.rollDir * gi * 0.55);
          ctx.globalAlpha = 0.14;
          ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
          ctx.restore();
        }
        // postquemador: fogonazo extra bajo la tobera solo con turbo (el sprite ya trae su glow)
        if (run.boost) { const fl = 5 + Math.random() * 4; px(-2, PH / 2 - 4, 4, fl, P.foam); px(-1, PH / 2 - 4, 2, fl * 0.7, P.accent); }
        ctx.drawImage(pl.img, -PW / 2, -PH / 2, PW, PH);
        // fogonazos del cañón
        if (inp.fire && !run.overheat && run.fireT > 0.06) { px(-6, -2, 3, 2, P.ink); px(3, -2, 3, 2, P.ink); }
      } else {
        // fallback: sprite de rects (por si la imagen no cargó)
        px(-2, -7, 4, 5, P.bodyDark); px(-1, -8, 2, 2, P.warn);
        px(-20, -1, 40, 3, P.body); px(-20, 0, 6, 2, P.bodyDark); px(14, 0, 6, 2, P.bodyDark);
        px(-3, -3, 6, 6, P.body); px(-2, -4, 4, 2, P.canopy); px(-12, 1, 3, 2, P.accent);
        const fl = run.boost ? 5 + Math.random() * 4 : (run.fuel > 0 ? 2 + Math.random() * 2 : 0);
        if (fl > 0) { px(-2, 3, 4, fl, run.boost ? P.foam : P.accent); px(-1, 3, 2, fl * 0.6, P.accent); }
        if (inp.fire && !run.overheat && run.fireT > 0.06) { px(-16, -2, 3, 2, P.ink); px(13, -2, 3, 2, P.ink); }
      }
      // mancha de sangre sobre el morro/cabina al atropellar (temporal; hacé un sprite ensangrentado si querés)
      if (run.bloodSplat > 0.02) {
        ctx.globalAlpha = Math.min(0.9, run.bloodSplat);
        px(-4, -2, 2, 1, '#7a1010'); px(-1, -3, 1, 1, '#9a1818'); px(2, -2, 2, 1, '#8a1414');
        px(-2, 1, 1, 1, '#7a1010'); px(4, -1, 1, 1, '#9a1818'); px(0, 0, 1, 1, '#8a1414'); px(-5, 0, 1, 1, '#6a0e0e');
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // mira: en el MOUSE (PC, punteria libre) o adelante del avion (tactil/legacy)
      if (S.state === 'play') {
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
        const oy = o.y + Math.sin(run.t * 1.3 + o.ph) * 0.6;
        const s = proj(o.x, oy, o.z), base = proj(o.x, 0, o.z);
        ctx.strokeStyle = P.bodyDark; ctx.beginPath();
        ctx.moveTo(s.x, s.y + 1.6 * k); ctx.lineTo(base.x, base.y); ctx.stroke();
        px(s.x - 2.6 * k, s.y - 1.6 * k, 5.2 * k, 3.2 * k, P.dim);
        px(s.x - 2.6 * k, s.y - 1.6 * k, 5.2 * k, Math.max(1, 1.1 * k), P.body);
        px(s.x + 1.8 * k, s.y - 0.4 * k, 1.8 * k, Math.max(1, 1.1 * k), P.bodyDark);
      } else if (o.type === 'helo') {
        const oy = o.y + Math.sin(run.t * 2 + o.ph) * 0.8;
        const s = proj(o.x, oy, o.z);
        px(s.x - 3 * k, s.y - 0.8 * k, 6 * k, 2 * k, P.bodyDark);
        px(s.x + 2.4 * k, s.y - 0.4 * k, 2.4 * k, Math.max(1, 0.8 * k), P.bodyDark);
        px(s.x - 1.4 * k, s.y - 1.4 * k, 2 * k, Math.max(1, 0.8 * k), P.canopy);
        const r = Math.sin(run.t * 40) * 4;
        px(s.x - (4 + r * 0.2) * k, s.y - 2 * k, (8 + r * 0.4) * k, 1, P.body);
      } else if (o.type === 'jet') {
        // avion enemigo de frente: alas anchas, fuselaje central, canopy, deriva y leve alabeo
        const oy = o.y + Math.sin(run.t * 1.6 + o.ph) * 0.5;
        const s = proj(o.x, oy, o.z);
        const bank = Math.sin(run.t * 1.1 + o.ph) * 0.7;          // metros de alabeo en las puntas
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
        const oy = o.y + Math.sin(run.t * 2) * 0.5;
        const s = proj(o.x, oy, o.z);
        px(s.x - 1.4 * k, s.y - 1.8 * k, 2.8 * k, 3.6 * k, P.accent);
        px(s.x - 1.4 * k, s.y - 0.4 * k, 2.8 * k, Math.max(1, 0.7 * k), P.ink);
      }
    }

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
      world3D.frame({ state: S.state, mom: momentum.active(), dist: run.dist, momDrift: momentum.drift(), cfg, cam, t: run.t, SKY, WATER, objectiveShip, seaH, momShipGeom: momentum.shipGeom, tbackImg });
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

      if (!world3D.isSea()) drawSea();   // el mar 2D solo cuando three no lo esta poniendo
      // en momentum el mundo rota (alabeo): rellena bajo el mar para que un tonel no muestre huecos
      if (S.state === 'momentum') px(-70, H, W + 140, 150, cfg.terrain === 'land' ? LAND.near : WATER.base2);
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
          const run = Math.sin(run.t * 12 + sd.ph);                    // piernas corriendo
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

      if (S.state !== 'dead' && S.state !== 'momentum') drawPlaneSprite();   // en momentum va la camara cockpit (drawCockpit)

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

        ctx.font = '7px monospace'; ctx.textAlign = 'center';
        for (const p of popups) { ctx.globalAlpha = Math.min(1, p.life); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y); }
        ctx.globalAlpha = 1;
      }

      if (zoomOn) ctx.restore();   // el HUD (y la capa momentum) van SIN zoom
      if (S.state === 'play') drawHUD();
      if (S.state === 'momentum' && momentum.active()) momRender.drawMomentum({
        mom: momentum.active(), momPhase: momentum.phase(), phases: momentum.phases(), msl: run.msl, objectiveShip, t: run.t,
        is3D: world3D.isOn(), parts, popups, mouse,
        momCam: momentum.cam, momShipGeom: momentum.shipGeom, momZoneRect: momentum.zoneRect });
      ctx.restore();

      if (S.state === 'takeoff') drawTakeoff();
      if (S.state === 'modeselect') menus.drawModeSelect({ modeSel, t: run.t });
      if (S.state === 'menu') {
        menus.drawMenu({ selPlane, gameMode, t: run.t });
        // el clamp de cfgRow vivia DENTRO de drawCfg (una pantalla no deberia mutar estado):
        // ahora se hace aca, antes de dibujar
        if (cfgOpen) { const rows = getCfgRows(); if (cfgRow >= rows.length) cfgRow = 0; menus.drawCfg({ rows, cfgRow }); }
      }
      if (S.state === 'dead') screens.drawDead({ score: run.score, best, deathCause, deathT, factIdx, t: run.t });
      if (S.state === 'results') screens.drawResults({ lastRun, resRow, resT, t: run.t });
      if (S.state === 'brief') screens.drawBrief({ mission: curMission(), goalLabel: goalOf(curMission()).label(curMission().goal), briefT, t: run.t });
      if (S.state === 'victory') screens.drawVictory({ score: run.score, levelT, t: run.t });
      if ((S.state === 'epilogue' || S.state === 'story') && story) screens.drawStory({ story, state: S.state, t: run.t });

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
    // (Una side-camera pura necesitaria sprite de perfil: anotado en UPDATE_ANIMATIONS.md.)
    // ---- camara DESDE ADENTRO (cockpit) para el MOMENTUM ----
    // Asset configurable: imagen con la MISMA proporcion que la pantalla (320×180; ideal 640×360 para
    // nitidez 2×) con el CENTRO TRANSPARENTE (el vidrio) y pintados los parantes de la cabina y el panel
    // de instrumentos. Embeber como data URI en `src` (igual que los aviones). Mientras este vacio se
    // dibuja un placeholder por codigo. Pedido en UPDATE_ANIMATIONS.md.



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
      const prog = Math.max(0, Math.min(1, run.dist / objectiveDist));
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
      if (run.boost) {
        ctx.strokeStyle = P.foam; ctx.globalAlpha = 0.7;
        for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(pm - 2 - i * 3, y); ctx.lineTo(pm - i * 3, y); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      drawHudAsset(OBJ_ASSETS.plane, pm, y, 'plane', 7);
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
      const digits = String(Math.floor(run.score)).padStart(6, '0');
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
      ctx.fillStyle = run.afterTier > 0 ? P.warn : run.boost || run.rasLevel > 0 ? P.accent : run.windF < 0.97 ? P.crest : P.dim;
      ctx.fillText(Math.round(run.spd * 4.2) + T('kmh') + (run.afterTier > 0 ? ' »' + run.afterTier : run.boost ? T('turboTag') : run.windF < 0.97 ? ' ▼' : ''), W / 2, H - 4);

      // --- avisos de la banda superior (radar y viento) ---
      // Todos los overlays de arriba van centrados en W/2, asi que se pisaban entre si.
      // Ahora arrancan DEBAJO de la barra de objetivo cuando esta existe (ocupa y=14..30);
      // si no hay mision, suben y quedan compactos. Cada aviso tiene su propia fila.
      const topBase = objectiveDist > 0 ? 38 : 20;

      if (run.detection > 0.3) {
        ctx.textAlign = 'center'; ctx.font = 'bold 8px monospace';
        ctx.fillStyle = Math.sin(run.t * 14) > 0 ? P.warn : '#7d2f1e';
        ctx.fillText(T('radar'), W / 2, topBase);
        ctx.fillStyle = '#00000066'; ctx.fillRect(W / 2 - 21, topBase + 3, 42, 4);
        px(W / 2 - 20, topBase + 4, Math.round(40 * run.detection), 2, P.warn);
      }

      // aviso de viento en contra — una fila mas abajo, nunca encima del radar
      if (run.windF < 0.97) {
        ctx.textAlign = 'center'; ctx.font = 'bold 7px monospace';
        ctx.fillStyle = Math.sin(run.t * 8) > 0 ? P.crest : P.dim;
        ctx.fillText(T('windWarn'), W / 2, topBase + 16);
      }

      // multiplicador junto al avión — crece con la racha rasante
      if (run.multShow > 1) {
        const s = proj(plane.x, plane.y, PZ);
        ctx.textAlign = 'left';
        const size = run.multShow >= 15 ? 12 + run.rasLevel : run.multShow >= 10 ? 11 : run.multShow >= 5 ? 10 : 9;
        ctx.font = 'bold ' + size + 'px monospace';
        ctx.fillStyle = run.multShow >= 25 ? (Math.sin(run.t * 16) > 0 ? P.warn : P.accent)
          : run.multShow >= 15 ? P.accent
            : run.multShow >= 10 ? P.accent
              : run.multShow >= 5 ? '#d9b06a' : P.dim;
        const jx = run.rasLevel > 0 ? (Math.random() - 0.5) * run.rasLevel : 0;
        const jy = run.rasLevel > 0 ? (Math.random() - 0.5) * run.rasLevel : 0;
        if (run.multShow < 10 || Math.sin(run.t * 10) > -0.6)
          ctx.fillText('x' + run.multShow + (run.boost ? ' x2' : ''), s.x + 24 + jx, s.y - 6 + jy);
        // barra de progreso hacia el próximo nivel de racha
        if (run.mult === 10 && run.rasLevel < 4) {
          const prog = (run.streak % 2) / 2;
          ctx.fillStyle = '#00000066'; ctx.fillRect(s.x + 24, s.y - 3, 26, 3);
          px(s.x + 25, s.y - 2, Math.round(24 * prog), 1, P.accent);
        }
      }
      // borde encendido según la racha
      if (run.rasLevel > 0) {
        ctx.globalAlpha = 0.05 * run.rasLevel + Math.max(0, Math.sin(run.t * 6)) * 0.04 * run.rasLevel;
        px(0, 0, W, 3, P.accent); px(0, H - 3, W, 3, P.accent);
        px(0, 0, 3, H, P.accent); px(W - 3, 0, 3, H, P.accent);
        ctx.globalAlpha = 1;
      }

      bar(6, H - 8, 60, run.fuel / 100, run.fuel < 25 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim) : P.foam, T('bar_fuel'));
      bar(W - 66, H - 8, 60, run.heat, run.overheat ? P.warn : P.accent, run.overheat ? T('bar_overheat') : T('bar_cannon'));

      // munición de misiles (pips) — entre combustible y el centro
      ctx.textAlign = 'left'; ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
      ctx.fillText('MISIL', 72, H - 11);
      for (let i = 0; i < MSL_MAX; i++) {
        const on = i < run.msl, bx = 72 + i * 8;
        ctx.fillStyle = on ? P.accent : '#2e3c45'; ctx.fillRect(bx, H - 8, 5, 3);
        if (on) { ctx.fillStyle = P.warn; ctx.fillRect(bx + 5, H - 8, 1, 3); }
      }

      // palanca de gas (throttle) — vertical, borde derecho
      const tx = W - 9, tyTop = 46, tyBot = 118, tH = tyBot - tyTop;
      ctx.fillStyle = '#00000088'; ctx.fillRect(tx - 1, tyTop - 1, 6, tH + 2);
      ctx.fillStyle = P.dim;                                     // marcas de la corredera
      for (let i = 0; i <= 4; i++) ctx.fillRect(tx - 3, Math.round(tyBot - tH * (i / 4)), 2, 1);
      const fillH = Math.round(tH * Math.max(0, Math.min(1, run.throttle)));
      const tcol = run.fuel <= 0 ? (Math.sin(run.t * 10) > 0 ? P.warn : P.dim)
        : run.throttle > 0.66 ? P.foam : run.throttle > 0.15 ? P.accent : P.bodyDark;
      px(tx, tyBot - fillH, 4, fillH, tcol);                     // relleno desde abajo
      px(tx - 2, tyBot - fillH - 1, 8, 2, P.ink);                  // perilla de la palanca
      ctx.fillStyle = P.dim; ctx.font = '6px monospace'; ctx.textAlign = 'right';
      ctx.fillText(run.fuel <= 0 ? T('thr_dead') : T('thr'), W - 4, tyTop - 4);
    }





    // ---------- loop ----------
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      update(dt); draw(); updateMusic(S.state);
      if (mslBtn) mslBtn.classList.toggle('on', S.state === 'play' || S.state === 'momentum');   // botón de misil en juego y momentum
      requestAnimationFrame(frame);
    }
    applyChrome();
    reset();
    requestAnimationFrame(frame);
  })();
