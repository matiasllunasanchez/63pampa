// RASANTE — entry point. Los modulos de datos se bundlean con esbuild (npm run build:game);
// hace falta bundlear porque Electron carga por file://, donde Chromium bloquea los ES modules.
import { STRINGS } from './data/strings.js';
import { P, SKY_PRESETS } from './data/palette.js';
import { MOM_LAYOUTS, SHIP_CLASS } from './data/ships.js';
import { SHIPS, MISSIONS, SHIP_MISSIONS, climaxOf } from './data/missions.js';
import { modoEnCuarentena } from './data/cuarentena.js';
import { UPGRADES, nextUpgrades, moveAllowed, loadoutAt, ofertaTrasMision } from './data/upgrades.js';
import { DMG_MODES } from './core/damage.js';
import { L, T, getLang, setLang, applyChrome } from './core/i18n.js';
import { multOf } from './core/util.js';
import * as dialogue from './core/dialogue.js';
import { dlg, seqFromScreens } from './core/dialogue.js';
import { SCENES, SECUENCIAS } from './data/story.js';
import { S, setState, cfg, cam, plane, stats, resetPlane, resetStats, CTRL_DIRECT, CTRL_BANK } from './core/state.js';
import { hzWorld, stepHorizon } from './core/horizon.js';
import { obstacles, soldiers, bullets, missiles, pmissiles, parts, popups, streaks, wake, gusts,
         prune, clearWorld } from './core/world.js';
import { run, resetRun } from './core/run.js';
import { proj, popup, explodeAt, bloodBurst, despiece, morir, actaDe, stepDestruccion, capParts, MUERTES } from './core/fx.js';
import { ULTIMA_VARIANTE } from './core/fx.js';   // QUITAR con las sondas de v2
import { CHUNK_LIFE, CHUNKS_MAX, ONDA_T, FLASH_T,
  forzarVariante, variantesDe, recetaDe, MORIBUNDO_MAX, DESPIECE } from './data/despiece.js';
import { machNow, conoAmt, cruzo } from './core/mach.js';
import * as momentum from './legacy/momentum.js';
import * as tempo from './systems/tempo.js';
import * as rasante from './systems/rasante.js';
import * as chancha from './systems/chancha.js';
import { desgaste, misionCumplida, resetDesgaste } from './core/desgaste.js';
// ---- GANCHOS DE MOTOR (docs/historia/PLAN_4_PENDIENTES.md) ----------------------------------
// Las cuatro piezas que faltan se escriben en archivos propios y se cuelgan ACA, en la fase 2.
// Los imports estan puestos y las firmas cerradas y testeadas (tools/unit.js, «ganchos:») para que
// las cuatro vias puedan trabajar en paralelo sin inventar cada una su forma de engancharse.
//
// DONDE VA CADA UNA, y esto es el contrato:
//   G-09  interstitial(txt, p, t)      → la cadena de posmision, cerca de `S.state === 'epilogue'`.
//                                        Hoy: results → epilogue → upgrade. Tiene que quedar
//                                        results → upgrade → epilogue → «DIA SIGUIENTE» → brief.
//   G-04  tickDesgaste(n) / nivel()    → donde ya se cuentan los impactos del jugador. Y el
//                                        acumulado ENTRA AL PAYLOAD de systems/saves.js: si no se
//                                        guarda, el avion se cura solo al cargar una partida.
//   G-02  barksVivos() / drawBark()    → el bucle de vuelo. La condicion del arma sostenida sale de
//                                        systems/flight.js, que ya lleva el estado del canon.
//
// Estan importados y todavia sin llamar a proposito: la fase 0 fija la costura, no el cableado.
import * as saves from './systems/saves.js';
import { CAMPAIGNS } from './data/campaigns.js';
import { PRUEBAS } from './data/pruebas.js';
import { cinematicas, MV_FILM } from './data/cines.js';
import * as arena from './systems/arena.js';
import * as damage from './systems/damage.js';
import * as arena3D from './systems/three-arena.js';
import * as arenaRender from './render/arena.js';
// PASADA: el otro climax (docs/sistemas/SPEC_MODO_PASADA.md). Comparte la escena 3D con el arena.
import * as pasada from './systems/pasada.js';
import * as pasadaRender from './render/pasada.js';
import * as pulso from './systems/pulso.js';
import * as pulsoRender from './render/pulso.js';
import * as machRender from './render/mach.js';
import * as cine from './systems/cine.js';
import { drawCine } from './render/cine.js';
import { nuevoReguero, humear, MISIL } from './render/reguero.js';
import * as muni from './render/municion.js';
// EL HUMO DE CADA MISIL, guardado APARTE del misil. Va en un WeakMap y no en un campo del objeto
// porque `pmissiles` es un store del mundo y el render no le escribe encima (convencion 4); cuando
// el misil muere, su reguero se va con el sin que nadie lo tenga que barrer.
const REG_MISIL = new WeakMap();
const regMisil = m => { let r = REG_MISIL.get(m); if (!r) REG_MISIL.set(m, r = nuevoReguero()); return r; };
import { PULSO } from './data/pulso.js';
import { spawnSystem } from './systems/spawn.js';
import { collisionSystem } from './systems/collision.js';
import * as caza from './systems/caza.js';
import * as persec from './systems/persec.js';
import { drawCaza } from './render/caza.js';
import { drawPersec, drawCinta } from './render/persec.js';
import { drawChancha } from './render/chancha.js';
import { inp, mouse, pointer, flags, padInfo, initInput } from './core/input.js';
import { flightSystem } from './systems/flight.js';
import { drawPlane } from './render/plane.js';
import { drawBullet } from './render/ammo.js';
import * as hud from './render/hud.js';
import * as world from './render/world.js';
import { drawMarco } from './render/marco.js';
import * as soldierArt from './render/soldiers.js';
import { theme, applyTheme } from './render/theme.js';
import { audio, beep, boom, sfxOne, sfxSrc, setMuted, isMuted, updateSfx, updateMusic, engineFly,
         engineOff, engineRumble, duck, tickDuck, setRunMusic, prevTrack, nextTrack,
         setRasante } from './systems/audio.js';
import * as world3D from './legacy/three-world.js';
import { cv, ctx, W, H, HOR, F, PZ, SC, px, panel, U } from './render/ctx.js';
import * as screens from './render/screens.js';
import { decir as decirRadio, callar as callarRadio, tickRadio, radio as radioBox, restante as radioRest, visible as radioVis, log as radioLog } from './core/radioVN.js';
import { PLANES, SHEET_FW, SHEET_FH, SHEET_NF, SHEET_ROWS } from './data/planes.js';
import { TIP_DBG } from './render/plane.js';   // QUITAR con __tipdbg
import { drawDesenfoque, BLUR_DBG } from './render/desenfoque.js';   // BLUR_DBG: QUITAR con __blurdbg
import * as menus from './render/menus.js';
import { stepRain, stepSpray, drawRain, RAIN_N } from './render/rain.js';
import { stepFog, resetFog, inBank, bankLeft, tookEntry, takeExit } from './systems/fog.js';
import { MIRA_IDS } from './render/miras.js';
import * as momRender from './legacy/momentum_render.js';
import { pitchTarget, applyEnergy, applyDrag, scrapeLimit, speedTarget, windFactor,
         PITCH_LERP, SCRAPE_RECOVER, SCRAPE_LIFT, AFTER_STEP, AFTER_MAX } from './core/physics.js';
import { MSL_MAX, GEAR_T, RADAR_ALT, FLY_TOP, VEIL_IN, VEIL_FULL, VEIL_OUT,
  RAS_DUR, RAS_LAT_HZ, ZZ_FONDO_K } from './data/tuning.js';
// ¿"cerca" del techo del radar? Es la ventana donde '↑ arriba + ↑↑' deja de ofrecerte llegar al
// borde y pasa a ofrecerte cruzarlo. 4 unidades: lo justo para que salga del ASCENSO anterior y
// repetir el combo, sin que se dispare desde una altura donde todavia tenias margen.
const CLIMB_NEAR = 4;
import { MV_HI, MV_LO, maniobras, MV_VISTAS, MOVES, WINGMV } from './data/moves.js';
import * as moves from './systems/moves.js';
import * as squad from './systems/squad.js';
// TRAMOS (docs/sistemas/SPEC_TRAMOS.md): el guion de spawn por mision. El orquestador le pasa
// la lista al empezar la corrida y despacha su radio; el sembrador y LA COLA la leen.
import * as tramos from './systems/tramos.js';
import * as zigzag from './systems/zigzag.js';
import * as zigzagCore from './core/zigzag.js';
import { drawParedes, techoLadera } from './render/paredes.js';
// LAS CHARLAS EN VUELO (docs/sistemas/SPEC_CHARLAS_VUELO.md): dialogo durante la mision jugable.
// El sistema es dueño de la FASE y nada mas; el que arranca el motor de lineas, el que apaga el
// HUD y el que corta en la muerte es este archivo — el sistema devuelve señales.
import * as charla from './systems/charla.js';
import { FIELES } from './data/pilots.js';
import * as squadRender from './render/squad.js';
// LAS PIRUETAS DE ACTOR (PLAN_MANIOBRAS_FASES M1): un Fiel entra, vuela una maniobra y se va. Es
// puesta en escena — no dispara, no choca y no toca al jugador (regla §3.7 del plan).
import * as wingmv from './systems/wingmv.js';
import { drawActores } from './render/wingmv.js';
import * as teatro from './systems/teatro.js';
import { drawTiros } from './render/teatro.js';
import { canRelevo, pilotIdx } from './core/squad.js';
import { RUNWAYS, AIR_START_Y, PORT_H } from './data/runways.js';

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


    const LANGS = Object.keys(STRINGS);   // idiomas disponibles: los ofrece la fila IDIOMA

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
    function useShip(s) { momentum.setLayout(s); arena.setShip(s); pasada.setShip(s); return s; }
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
    let modeSel = 0;                 // pantalla inicial: 0 = HISTORIA, 1 = JUEGO RAPIDO
    let quickSel = 0;                // cursor del submenu JUEGO RAPIDO
    let prbSel = 0;                  // cursor del catalogo de PRUEBAS
    let cinSel = 0;                  // cursor del catalogo de CINEMATICAS
    let mvSel = 0, mvVarSel = 0, mvPick = null;   // MANIOBRAS: cursor de la lista, de las variantes, y la elegida
    // A DONDE VUELVE una corrida de herramienta (PRUEBAS o el SELECTOR DE MISIONES) cuando se
    // termina o se sale. Es UNA variable y no dos caminos copiados porque las dos pantallas son
    // la misma idea —elegir algo, jugarlo, volver a elegir— y lo unico que cambia es el catalogo.
    let testBack = 'modeselect';
    // MODO CINEMATICAS del selector: la mision NO se vuela — el guion encadena directo al epilogo
    // y de ahi al catalogo. Es un flag de la CORRIDA y no del menu (el menu ya eligio) para que la
    // rama del estado 'story' no tenga que saber de que pantalla vino.
    let testCine = false;
    // MODO DIALOGOS del selector: recorrer las charlas EN VUELO de la mision (las `radio:` de los
    // tramos) sin tener que volarla. Se apoya entero en el MODO CAMARA (cfg.devcam), que ya
    // congela el mundo, hace inmortal al avion y ya tickea la caja de radio: lo unico que agrega
    // es saltar de una linea a la otra y ponerse en el punto del mapa donde cada una suena — que
    // es la mitad de la pregunta ("que dicen Y EN QUE MOMENTO").
    let testRadio = false, radioBeat = 0;
    let misSel = 0;                  // cursor del SELECTOR DE MISIONES
    // …y si esa mision se vuela CON su guion. Es una perilla de la PANTALLA (no de la corrida) y
    // vive fuera del selector a proposito: se elige una vez y queda puesta para las que sigan.
    // COMO se abre la mision elegida. Son TRES cosas distintas de probar y por eso son tres modos
    // y no un si/no: el vuelo (¿como se siente?), las pantallas (¿como se lee el guion?) y la
    // pasada completa (¿como encajan una con otra?). Ciclan con [H].
    //   0 · MISION      — derecho al despegue, sin una pantalla (lo que mas se usa al ajustar)
    //   1 · CINEMATICAS — el guion y el epilogo SIN volar: se leen las dos puntas de la mision
    //   2 · CINE+MISION — la mision entera, como la vive un jugador de campaña
    const MIS_MODOS = ['juego', 'cine', 'ambas', 'radio'];
    let misModo = 0;
    // el orden DEBE coincidir con `opts` en menus.drawModeSelect: el click traduce la fila tocada
    // a este indice. 'options' = pantalla de ajustes (idioma); 'quit' = fila SALIR.
    //
    // 'quick' es un SUBMENU, no un modo: adentro viven los cuatro que se juegan sin guion (ciclo,
    // patria, minutos sagrados, pasadas mortales). El menu principal quedo con la unica decision
    // que de verdad hay que tomar al abrir el juego — historia o partida suelta — en vez de seis
    // filas donde cuatro eran variantes de lo mismo.
    // PRUEBAS va DEBAJO de JUEGO RAPIDO y no al final: es la tercera puerta al juego (historia,
    // partida suelta, momento suelto), no un ajuste. OJO — mover una fila de aca corre los indices
    // que tools/smoke.js navega a ciegas con flechas; ya pasó al agregar PERSECUCION.
    // CINEMATICAS va JUSTO DEBAJO de PRUEBAS porque es la misma herramienta con otro catalogo:
    // una lista de cosas para mirar sin jugar hasta ellas. Separarlas con MISIONES en el medio
    // hubiera roto la lectura de "las dos puertas de autor, juntas".
    const MODES = ['campaign', 'quick', 'pruebas', 'cines', 'maniobras', 'misiones', 'options', 'quit'];
    // Los modos de adentro de JUEGO RAPIDO. `arena` y `pasadas` son los dos BANCOS DE PRUEBAS del
    // climax: entran DIRECTO al buque, sin cruzar el pasillo, y existen para poder tunear cada
    // fase sin jugar una mision entera cada vez.
    // `back` es la fila ATRAS: la salida de la pantalla, VISIBLE. ESC y el boton B ya volvian, pero
    // eso hay que saberlo — una lista sin salida a la vista parece un callejon.
    // LA CUARENTENA FILTRA ACA (PLAN_REFACTOR §4b): las filas de MINUTOS SAGRADOS y PASADAS
    // MORTALES siguen escritas —no se borro nada— pero data/cuarentena.js las saca de la lista.
    // Se filtra en vez de comentarlas para que la vuelta sea un renglon de DATO y no un diff.
    const quickRows = () => [{ id: 'cycle' }, { id: 'survival' }, { id: 'persec' }, { id: 'arena' }, { id: 'pasadas' }]
      .filter(r => !modoEnCuarentena(r.id))
      .concat([{ id: 'back', back: true }]);

    // ---------- PAUSA ----------
    // NO es un estado de S: es una BANDERA ortogonal. Con `paused` el frame() saltea update()
    // entero — el mundo queda congelado tal cual se ve (particulas, relojes, barra de MOMENTUM,
    // todo) — y draw() sigue dibujando lo mismo, con el menu como overlay encima. Asi pausar
    // funciona igual en PASILLO, despegue, climax y ARENA sin tocar ningun camino de dibujo.
    let paused = false;
    let pauseView = 'menu';          // 'menu' · 'controls' · 'save'
    let pauseSel = 0, saveSel = 0;   // cursor del menu y de la lista de guardado
    let pauseT = 0;                  // reloj propio (run.t esta congelado): parpadeos del overlay
    let pauseMsgT = -9;              // cuando se guardo por ultima vez (flash "PARTIDA GUARDADA")

    // ---------- MENU DE HISTORIA (campañas + partidas guardadas) ----------
    let curCampaign = 0;             // indice en CAMPAIGNS (rotula las partidas guardadas)
    let campSel = 0;                 // cursor del submenu de historia
    let savesSel = 0;                // cursor de la lista de partidas (pantalla 'saves')

    // ---------- EL BANCO DEL PICHON (mejoras de campaña, GUION_2 §2c) ----------
    // `pichon` = ids de MOVES aprendidos EN ESTA CAMPAÑA. Entre mision y mision (estado
    // 'upgrade') se ofrecen las dos primeras del pool no aprendidas y se elige UNA. En campaña
    // los combos no aprendidos no disparan (ver mvOk en el dispatcher); los demas modos no
    // cambian. Viaja en la partida guardada (`ups`).
    let pichon = [];                 // ids aprendidos (orden de eleccion)
    /** ¿Rige LA LIBRETA — o sea, solo salen las piruetas aprendidas? En campaña siempre, y en las
     *  HERRAMIENTAS (S.test: el SELECTOR DE MISIONES y PRUEBAS) tambien, porque ahi la mision se
     *  juega COMO EN CAMPAÑA (mismo criterio que el roster y la Chancha — ver reset() y
     *  pedirChancha()). En CICLO / PATRIA / MINUTOS SAGRADOS no: ahi se tienen todas.
     *
     *  El `gameMode === 'cycle'` del test NO es redundante: los MOMENTOS de PRUEBAS que arrancan
     *  POR LA PATRIA o PERSECUCION pasan por la misma puerta con `S.test` puesto, y esos modos se
     *  juegan con todas las piruetas — gatearlos seria probar otro juego que el que van a probar. */
    const conLibreta = () => gameMode === 'campaign' || (S.test && gameMode === 'cycle');
    let upgOffer = [];               // la oferta de la pantalla actual (2 tarjetas)
    let upgSel = 0, upgT = 0;        // cursor y reloj propio de la pantalla
    // CORDON DE BRUMA (ver VEIL_* en data/tuning.js). Dos densidades, una sola pared:
    //   · en el PASILLO cierra con la distancia al objetivo — se cruza a ciegas;
    //   · al entrar al ARENA se ABRE con reloj propio, que es lo que hace que el climax se lea
    //     como "saliste del banco" y no como un corte de camara.
    let veilOut = 0, veilPrev = '';
    let objectiveDist = 0;           // distancia meta puerto→barcaza (0 = sin objetivo / infinito)
    let objectiveShip = '';          // nombre de la barcaza objetivo del run
    // …y de QUE TIPO es ese objetivo ('ship' | 'distance'). El HUD lo necesita para decidir si el
    // rotulo de la ruta es un NOMBRE (un buque, que hay que decir) o una DISTANCIA (que ya la dicen
    // la cuenta regresiva y el total del odometro, y repetirla tres veces no la hace mas clara).
    let objectiveKind = 'ship';
    // EL AVION FIJO DE LA CAMPAÑA. Se busca POR CLAVE y no por indice: el roster de PLANES se
    // reordena (hoy mismo salio el Pampa y el Mirage IIIEA paso a ser 5P), y un 0 escrito a mano
    // seguiria apuntando "al primero" — que el dia que alguien mueva una linea es otro avion.
    // La campaña vuela A-4B y la decision esta escrita: docs/historia/AVIONES_ESCUADRON.md.
    const CAMPAIGN_PLANE = Math.max(0, PLANES.findIndex(p => p.key === 'sky'));

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

    /** Carga la mision `i`. `keepCfg` NO pisa la config de mapa: lo usa MINUTOS SAGRADOS al
     *  cambiar de buque, para no perder el FONDO/AGUA que elegiste para mirarlo. */
    function loadLevel(i, keepCfg) {
      curLevel = Math.max(0, Math.min(MISSIONS.length - 1, i));
      if (keepCfg) return;
      Object.assign(cfg, MISSIONS[curLevel].cfg); applyCfg();
    }
    function curMission() { return MISSIONS[curLevel]; }
    /** Indice de una mision por su id ('m4') o por su numero. -1 si no existe: quien llama decide
     *  que hacer con eso (la sonda contesta null; el selector no puede llegar con un id invalido). */
    const misIdx = id => typeof id === 'number'
      ? (MISSIONS[id] ? id : -1)
      : MISSIONS.findIndex(m => m.id === String(id));
    /** Una linea de radio de LA CHANCHA: centrada, debajo del HUD de arriba y encima del horizonte.
     *
     *  Los popups se dibujan CENTRADOS en coordenadas de mundo (ctx.textAlign = 'center'), asi que
     *  el x=0 del aviso de la ola deja el texto pegado al borde izquierdo y, con la placa del
     *  escuadron ahi arriba, la linea se leia cortada — y una radio que no se lee no cuenta nada.
     *  Se vio en la captura de la llegada, no en el codigo.
     *
     *  Y va ARRIBA (38) y no en el medio: a media altura tapaba justo al Hercules, que con el
     *  avion enganchado cae cerca de y=49. La franja de arriba, entre la placa del escuadron y el
     *  reproductor, es la unica que esta libre durante la cita. */
    function radioCh(key, args) { popup(W / 2, 38, T(key, args), P.crest, true); }

    /** LA RADIO DE UN TRAMO (SPEC_TRAMOS RF-03). Mismo tono que la radio de la Chancha —centrada,
     *  color de cresta, en negrita— porque es la MISMA voz: Condor hablandole al vuelo.
     *
     *  PERO UN RENGLON MAS ABAJO (58 y no 38), y esto se vio en la captura del transito del
     *  Narwal, no en el codigo: en 38 la linea cae ENCIMA del nombre del objetivo y de la barra
     *  de mision, y "CONDOR: DE UN BARCO PESQUERO LLAMADO NARWAL." sobre "HMS SHEFFIELD" no se
     *  lee ninguno de los dos. La Chancha se banca ese renglon porque su cita es corta y el
     *  jugador ya sabe lo que dice; el transito es al reves — es una conversacion de cuatro
     *  lineas y leerla ES la escena. 58 es la franja que ya usa el aviso de la Chancha lista:
     *  debajo del rotulo del objetivo y arriba del horizonte. */
    function radioTramo(key) {
      beep(430, 0.06, 'square', 0.04);
      decirRadio(T(key), n => CARA_DE_RADIO[n] || null);
    }

    /** QUIEN TIENE CARA EN LA RADIO. El texto de los tramos ya viene como 'CONDOR: ...', asi que
     *  el nombre sale del propio guion; lo unico que falta es el id del retrato.
     *
     *  Vive aca y no en core/radioVN.js a proposito: ese modulo no tiene por que saber quien es
     *  Condor. Los ids validos los lista `python3 tools/hacer_prompts_retratos.py --ids`. */
    const CARA_DE_RADIO = {
      CONDOR: 'condor_radio', 'CÓNDOR': 'condor_radio',
      PUMA: 'puma_neutro', GITANO: 'gitano_neutro', VASCO: 'vasco_neutro',
      PICHON: 'pichon_neutro', 'PICHÓN': 'pichon_neutro',
      TERO: 'tero_casco', ESTEBAN: 'tero_casco',   // en vuelo van con el casco puesto
      'EL TURCO': 'turco_neutro', TURCO: 'turco_neutro',
    };

    /** EL PEDIDO (tecla 5). Es una funcion con nombre —y no el cuerpo de la accion— para que la
     *  sonda del fixture apriete EXACTAMENTE lo mismo que aprieta el jugador: si la sonda
     *  llamara a `chancha.pedir()` por su cuenta, se saltearia justo los gates que vive aca (el
     *  estado del juego y la mision) y probaria media mecanica. */
    /** EL LANZAMIENTO (tecla 6). Solo en el PASILLO jugable: nunca en climax ni en los dos bancos
     *  de prueba (§6.6). El feedback va aca y no en el modulo, que es la regla de la casa — el
     *  sistema devuelve la señal y el orquestador pone beep, popup y radio. */
    function lanzarRasante() {
      // EL PASILLO DE VERDAD, y por MODO ademas de por estado: es el mismo agujero que la Chancha
      // documenta — PASADAS MORTALES arranca con setState('play') y ahi el poder quedaria
      // disponible adentro de un climax.
      if (S.state !== 'play' || cfg.devcam || gameMode === 'arena' || gameMode === 'pasadas') return;
      // LA OTRA MITAD DE LA REGLA (RF-06): con la CHANCHA en el aire el poder no arranca. El spec
      // solo pide el sentido contrario —que el 5 avise con RASANTE puesto— pero dejar este abierto
      // permitia lanzarlo A MITAD DE LA CITA y tirar al avion al agua con la manguera enganchada.
      // Anotado en §8: es alcance que el spec no pide y que la mecanica sí.
      if (chancha.activa()) { beep(150, 0.09, 'square', 0.05); radioCh('ras_no_cita'); return; }
      const r = rasante.toggle();
      if (r === 'empty') { beep(140, 0.09, 'square', 0.05); return; }
      // EL SUSURRO: el beep de entrada va GRAVE y hacia abajo (-90), al reves de todos los demas
      // poderes del juego, que suben. Es la version en un sonido de lo que el §7 pide — este no
      // grita, y se tiene que notar antes de que el jugador entienda por que.
      if (r === 'on') { beep(220, 0.14, 'square', 0.05, -90); rasanteRadio(); return; }
      beep(520, 0.09, 'square', 0.05, 160); popup(W / 2, 58, T('rasOff'), P.dim);
    }

    function pedirChancha() {
      // LOS DOS PODERES NO CONVIVEN (RF-06), y la razon es de geografia: la canasta esta ARRIBA
      // (CH_ALT 48) y el RASANTE existe para tenerte abajo. Pedirla con el poder puesto seria
      // pedirte que subas cuarenta y cinco metros mientras el avion quiere estar en dos.
      //
      // NO SE CORTA EL PODER EN SILENCIO NI SE COBRA LA BARRA DE LA CHANCHA: se avisa y listo. Es
      // la misma disciplina que los gates de `chancha.pedir` — la tecla contesta, no castiga.
      if (rasante.active()) { beep(150, 0.09, 'square', 0.05); radioCh('ras_no_chancha'); return; }
      const r = chancha.pedir({
        fuelOn: cfg.fuelOn,
        // EL PASILLO DE VERDAD, y por MODO ademas de por estado (RF-07). Mirar solo `S.state`
        // dejaba un agujero: PASADAS MORTALES arranca con setState('play') —es una aproximacion
        // corta, no una zona— y ahi el poder quedaba disponible, justo en el modo donde la nafta
        // ES el reloj del climax. MINUTOS SAGRADOS entra derecho a 'arena' y no tenia el agujero,
        // pero se nombra igual: que la regla se lea, y no que dependa de un detalle de arranque.
        enPasillo: S.state === 'play' && !cfg.devcam
          && gameMode !== 'arena' && gameMode !== 'pasadas',
        // LA ROTURA DEL GUION vuelta mecanica: desde la mision siguiente al epilogo de LA BOMBA
        // QUE NO DESPERTO, la Chancha vuela corto y no baja al sur (missions.js: chancha:false).
        // Fuera de campaña —ciclo, por la patria— siempre esta viva: ahi no hay narrativa.
        // La otra mitad de "como en campaña" (S0): en el SELECTOR y en PRUEBAS la mision trae SU
        // regla, asi que probar M7 sin el poder es probar M7 de verdad.
        viva: !((gameMode === 'campaign' || S.test) && curMission() && curMission().chancha === false),
        t: run.t,
      });
      if (r === 'nofuel') return;                                    // sin combustible el poder no existe
      if (r === 'nozone' && chancha.meterVal() < 1) return;          // ni siquiera la tenia lista
      if (r === 'ok') { beep(520, 0.07, 'square', 0.05, 120); radioCh('ch_call'); return; }
      // las otras dos lineas del ritual (Condor y la Chancha) las dispara el sistema por dt:
      // ver el bloque 'ack'/'come' de chancha.tick — aca solo suena el pedido.
      beep(150, 0.09, 'square', 0.05);
      radioCh(r === 'early' ? 'ch_early' : r === 'used' ? 'ch_used'
        : r === 'broken' ? 'ch_broken' : 'ch_nozone');
    }

    /** Las señales de LA CHANCHA vueltas cosas que se ven y se oyen. Vive en el orquestador —y no
     *  en el sistema— por la misma regla que el MOMENTUM: el sistema decide, el juego lo cuenta. */
    // LA RADIO DEL PODER RASANTE (RF-05). Una linea al activar, ROTANDO — es la doctrina del
    // escuadron gritada, y uno de los cinco elementos de identidad del §7: es lo que hace que este
    // poder sea de ESTE juego y no una camara baja cualquiera.
    //
    // La rotacion es por USO y no al azar: la primera vez que lo activas escuchas la regla (la de
    // Puma), y recien despues los gritos. Un sorteo podria darte tres veces la misma en la primera
    // corrida, que es justo cuando cada linea todavia tiene algo que decir.
    const RAS_CALLS = ['rasante_call_1', 'rasante_call_2', 'rasante_call_3'];
    let rasCall = 0;
    // LA LECCION DEL SAPITO: la PRIMERA activacion de cada perfil, una vez y nunca mas. Es el
    // prologo hecho poder — la frase con la que el juego explico por que se vuela abajo. Se guarda
    // en localStorage porque el spec dice "de cada perfil": tiene que sobrevivir a la partida.
    const RAS_LECCION_KEY = 'rasante_leccion_sapito';
    function rasanteRadio() {
      const k = RAS_CALLS[rasCall % RAS_CALLS.length];
      rasCall++;
      // EL INDICATIVO DEL QUE VUELA AHORA: el grito del numeral te nombra a VOS, y con el relevo
      // eso cambia. Sale del mismo lugar que lo usa la PASADA — squad es quien sabe quien va.
      radioCh(k, { n: squad.pilotName(pilotIdx(run.squad, run.lives)) });
      let vista = false;
      try { vista = localStorage.getItem(RAS_LECCION_KEY) === '1'; } catch (e) { }
      if (!vista) {
        try { localStorage.setItem(RAS_LECCION_KEY, '1'); } catch (e) { }
        // un renglon MAS ABAJO que la radio: son dos voces distintas y en la misma fila se pisan.
        popup(W / 2, 58, T('rasLeccion'), P.accent, true);
      }
    }

    function chanchaRadio(sig) {
      if (sig === 'ready') { beep(660, 0.1, 'square', 0.05, 140); popup(W / 2, 58, T('ch_ready'), P.accent); return; }
      if (sig === 'ack') { beep(480, 0.05, 'square', 0.04); radioCh('ch_ack'); return; }
      if (sig === 'come') { beep(430, 0.06, 'square', 0.04); radioCh('ch_come'); return; }
      if (sig === 'llega') { beep(300, 0.18, 'sawtooth', 0.05, 60); radioCh('ch_arriba'); return; }
      if (sig === 'conecta') { beep(720, 0.08, 'square', 0.05, 220); radioCh('ch_connect'); return; }
      if (sig === 'corta' || sig === 'golpe') {
        // el CHISPAZO: se ve donde estaba la punta de la sonda, no en el medio de la pantalla
        beep(110, 0.12, 'sawtooth', 0.06, -60);
        explodeAt(plane.x, plane.y, PZ, false, true, true);
        radioCh('ch_drop');
        return;
      }
      if (sig === 'lleno') { beep(880, 0.14, 'square', 0.05, 180); radioCh('ch_full'); return; }
      if (sig === 'adios') { beep(260, 0.14, 'square', 0.04, -80); radioCh('ch_bye'); }
    }
    // transiciones desde la pantalla inicial de modo
    function goSurvival() { gameMode = 'survival'; setState('menu'); beep(600, 0.08, 'square', 0.05); }
    // PERSECUCION (PLAN_HARRIERS_PERSECUCION §4, N2): pasillo INFINITO como POR LA PATRIA, pero
    // volando de numeral. El lider lo arma reset(), que es donde ya se decide todo lo de la corrida.
    function goPersec() { gameMode = 'persec'; setState('menu'); beep(600, 0.08, 'square', 0.05); }
    // CICLO DE MUERTE: las mismas misiones de la campaña, una al azar, sin el guion largo
    function goCycle() { gameMode = 'cycle'; randomMission(); setState('menu'); beep(600, 0.08, 'square', 0.05); }
    // el ARENA y el CICLO solo juegan misiones CON buque: las de distancia no tienen climax.
    // `arenaShip` persiste de sesiones viejas, asi que se sanea al entrar.
    function shipMissionAt(i) { return SHIP_MISSIONS.includes(i) ? i : SHIP_MISSIONS[0]; }
    function randomShipMission() { return SHIP_MISSIONS[Math.floor(Math.random() * SHIP_MISSIONS.length)]; }
    // MINUTOS SAGRADOS: SOLO la batalla contra el buque, en su zona — el modo NO tiene camino.
    // Pasa por el menu (avion + [M], donde se elige el BUQUE) y al arrancar salta DERECHO al
    // asalto. Es un modo propio: nunca encadena a CICLO DE MUERTE ni al despegue.
    function goArena() { gameMode = 'arena'; cfg.arenaShip = shipMissionAt(cfg.arenaShip); loadLevel(cfg.arenaShip); setState('menu'); beep(600, 0.08, 'square', 0.05); }
    /** Arranca UNA batalla de MINUTOS SAGRADOS. Como el vuelo no se juega, `run.dist` nace EN el
     *  objetivo y se entra al asalto directo.
     *  `nextShip` sortea otro buque — es la SIGUIENTE batalla (el modo son batallas aleatorias);
     *  sin el se repite el mismo, que es lo que corresponde al REINTENTAR la que perdiste. */
    function startArenaBattle(nextShip) {
      if (nextShip) { cfg.arenaShip = randomShipMission(); loadLevel(cfg.arenaShip, true); }
      reset(); setRunObjective(true);
      run.dist = objectiveDist;
      arena.enter(); sfxOne('lv1');
    }
    // PASADAS MORTALES: el otro climax (docs/sistemas/SPEC_MODO_PASADA.md) jugado como lo que es —
    // UNA CORRIDA DE ATAQUE, no una zona. Y por eso NO se parece a MINUTOS SAGRADOS, que te suelta
    // adentro del ring: acá el modo es la aproximación y su desenlace.
    function goPasadas() { gameMode = 'pasadas'; cfg.arenaShip = shipMissionAt(cfg.arenaShip); loadLevel(cfg.arenaShip); setState('menu'); beep(600, 0.08, 'square', 0.05); }
    /** Arranca UNA corrida suelta: YA VOLANDO, con el buque asomando en el horizonte, y el ultimo
     *  tramo de mar por delante. Tres decisiones y las tres son el modo:
     *
     *  · se arranca en `BARGE_T0` del camino — el punto EXACTO donde el buque se materializa en el
     *    horizonte (render/world.js). Lo primero que ves es el blanco, lejos;
     *  · se arranca EN EL AIRE y con velocidad de crucero: no hay pista ni cuenta regresiva, venis
     *    entrando (reintentar una corrida no puede costar tres segundos de carreteo);
     *  · NO se entra a la pasada a mano. Entra el vuelo al llegar al objetivo, como en una mision
     *    de verdad — asi cada intento pasa por la transicion sin corte, que es la mitad del modo. */
    function startPasadaBattle(nextShip) {
      if (nextShip) { cfg.arenaShip = randomShipMission(); loadLevel(cfg.arenaShip, true); }
      reset(); setRunObjective(true);
      run.dist = objectiveDist * world.BARGE_T0;
      plane.y = AIR_START_Y; run.gear = 0;
      run.spd = 62;                      // la velocidad con la que el despegue entrega el avion
      setState('play'); sfxOne('lv1');
    }
    // arranca una SECUENCIA del guion por su clave ('storyM1', 'epiM4'…).
    //
    // PRIMERO data/story.js, que es la fuente de verdad: ahi cada escena trae junto su texto, su
    // placa, la cara de cada hablante y su hold. El adaptador del guion viejo (PANTALLAS con
    // {title, paras} en data/strings.js) queda de RESPALDO y no de camino principal: sigue vivo
    // para que una clave que todavia no se haya mudado no rompa la campaña, y para que
    // `seqFromScreens` siga probado. Cuando no quede ninguna, se va con el.
    function initStory(key) {
      const ids = SECUENCIAS[key];
      const escenas = ids ? ids.map(id => SCENES[id]).filter(Boolean)
                          : seqFromScreens(L()[key] || STRINGS.es[key] || [], key);
      dialogue.startSeq(escenas, getLang());
    }
    /** Un cuadro del motor de historia. Devuelve la señal de pressDialogue() ('complete', 'next',
     *  'scene', 'end') o null; QUIEN DECIDE A DONDE IR es el que llama, no el motor. */
    function stepStory(dt) {
      const before = dlg.typed;
      const auto = dialogue.stepDialogue(dt);
      // tick de maquina de escribir: uno por caracter nuevo (el tic por personaje es F6)
      if (dlg.typed > before && !isMuted()) beep(1300 + Math.random() * 1100, 0.014, 'square', 0.013);
      // gracia de 0.4 s AL EMPEZAR LA SECUENCIA: la tecla que confirmo CAMPAÑA en el menu no debe
      // saltear el tipeo de la primera linea. Despues el reloj de la secuencia ya la dejo atras.
      // VOLVER ATRAS gana sobre avanzar: la flecha izquierda tambien prende `anyPress`, asi que
      // si no se atendiera primero el mismo evento haria las dos cosas y la tecla no serviria.
      if (flags.backReq) {
        flags.backReq = false; flags.anyPress = false;
        if (dialogue.backDialogue()) beep(380, 0.05, 'square', 0.035);
        return null;
      }
      if (!auto && !(flags.anyPress && dlg.seqT > 0.4)) return null;
      const r = auto ? dialogue.advance() : dialogue.pressDialogue();
      // null = el toque se IGNORO porque corre un `hold`: el silencio no se saltea (RF-07)
      if (r && r !== 'end') beep(500, 0.05, 'square', 0.04);
      return r;
    }

    // ---------- LAS CHARLAS EN VUELO (SPEC_CHARLAS_VUELO) ----------
    // El motor de lineas es EL MISMO de la historia (core/dialogue.js) — el spec pide reusarlo, no
    // reformarlo. Lo unico distinto es quien aprieta: en tierra el jugador, en vuelo el reloj.
    let charlaFin = false;      // el guion de la charla se termino (lo consume charla.tick)
    let autoDeCharla = false;   // el auto-avance lo prendimos NOSOTROS y hay que devolverlo

    /** Un cuadro del dialogo de una charla. Solo corre en la fase 'activa'.
     *
     *  NO PASA POR `stepStory`, y es a proposito: aquella funcion atiende teclas —completar el
     *  tipeo, volver atras, la gracia anti-salteo— y en vuelo NADA DE ESO EXISTE (§6.2: el auto es
     *  el modo, las manos estan volando). Compartir la funcion habria significado meterle un `if`
     *  a cada una de esas ramas; compartir el MOTOR, que es lo que el spec pide, es esto. */
    function stepCharla(dt) {
      if (!charla.hablando()) {
        // devolver el auto-avance apagado importa mas de lo que parece: si una charla se corta de
        // golpe (muerte, relevo) y `dlg.auto` quedara prendido, el guion de la SIGUIENTE pantalla
        // de historia se avanzaria solo — y el sintoma aparece dos pantallas mas tarde, lejos de
        // la causa.
        if (autoDeCharla) { dlg.auto = false; autoDeCharla = false; }
        return;
      }
      if (!autoDeCharla) { dlg.auto = true; autoDeCharla = true; }
      if (dialogue.stepDialogue(dt) === 'auto' && dialogue.advance() === 'end') charlaFin = true;
    }

    function startCampaign() {
      gameMode = 'campaign'; curCampaign = 0; selPlane = CAMPAIGN_PLANE;
      pichon = [];                       // campaña nueva: el banco del Pichon arranca vacio
      resetDesgaste();                   // ...y celula nueva: sin parches (G-04)
      loadLevel(0); reset();
      setRunObjective(); setState(enterMission());
    }
    /** DESPUES DEL RECUENTO. En campaña va primero EL BANCO DEL PICHON y despues el epilogo, que
     *  es donde esta la carta de Mateo.
     *
     *  POR QUE ESTE ORDEN. Antes la mejora llegaba al final de todo el epilogo — despues del
     *  cuaderno, de la placa historica y de la carta — y para entonces la recompensa de la mision
     *  que acababa de terminar ya no se sentia como recompensa. Ahora se cobra caliente, y la carta
     *  queda de cierre, que es lo que es.
     *
     *  CUANTAS ofrece cada mision lo dice `ofertaTrasMision` (data/upgrades.js): el tutorial no
     *  entrega nada, la segunda sirve UNA sin elegir, y de la tercera en adelante son dos a elegir.
     *  La regla vive en data y no aca para que el selector de misiones la derive en vez de repetirla. */
    function trasResultados() {
      if (gameMode === 'campaign' && !S.test) {
        const nOferta = curLevel + 1 < MISSIONS.length ? ofertaTrasMision(curLevel) : 0;
        upgOffer = nOferta ? nextUpgrades(pichon, nOferta) : [];
        if (upgOffer.length) { upgSel = 0; upgT = 0; setState('upgrade'); return; }
      }
      irAlEpilogo();
    }
    /** El epilogo de la mision que se acaba de volar. */
    function irAlEpilogo() {
      if (!lastRun || !lastRun.mission || !lastRun.mission.epi) { advanceCampaign(); return; }
      initStory(lastRun.mission.epi); setState('epilogue');
    }
    /** Siguiente mision de campaña (conservando el puntaje acumulado) o victoria si era la ultima. */
    function advanceCampaign() {
      if (curLevel + 1 < MISSIONS.length) {
        misionCumplida();                // una salida mas encima de la celula (G-04)
        const keep = run.score; loadLevel(curLevel + 1); reset(); run.score = keep;
        setRunObjective(); setState(enterMission());
      } else { setState('victory'); levelT = 0; }
    }
    // EL BANCO DEL PICHON: navegacion y eleccion de la mejora ofrecida (estado 'upgrade')
    function upgNav(dir) {
      if (upgOffer.length < 2) return;
      upgSel = (upgSel + dir + upgOffer.length) % upgOffer.length;
      beep(520, 0.05, 'square', 0.04);
    }
    function upgConfirm() {
      const u = upgOffer[upgSel];
      if (!u || upgT < 0.4) return;      // gracia: la tecla que cerro el epilogo no elige sola
      // LAS MEJORAS (S2): el banco es de la CAMPAÑA. En las herramientas el epilogo ya vuelve al
      // catalogo antes de ofrecer nada, asi que esto es el segundo cerrojo de la misma puerta —
      // el que queda puesto si alguien algun dia hace que una prueba pase por el banco.
      if (sinRastro()) { salirTest(); return; }
      pichon.push(u.id);
      beep(880, 0.12, 'square', 0.06);
      irAlEpilogo();        // la carta de Mateo va DESPUES del banco (G-09)
    }
    function confirmMode() {
      const m = MODES[modeSel];
      // HISTORIA ya no arranca directo: pasa por su submenu (CONTINUAR / campañas)
      if (m === 'campaign') { campSel = campFirstSel(); setState('campmenu'); beep(600, 0.08, 'square', 0.05); }
      else if (m === 'quick') { quickSel = 0; setState('quickmenu'); beep(600, 0.08, 'square', 0.05); }
      else if (m === 'pruebas') { prbSel = prbFirstSel(); setState('pruebas'); beep(600, 0.08, 'square', 0.05); }
      else if (m === 'cines') { cinSel = 0; setState('cines'); beep(600, 0.08, 'square', 0.05); }
      else if (m === 'maniobras') { mvSel = 0; setState('maniobras'); beep(600, 0.08, 'square', 0.05); }
      else if (m === 'misiones') { setState('misiones'); beep(600, 0.08, 'square', 0.05); }
      else if (m === 'options') { setState('options'); beep(600, 0.06, 'square', 0.05); }
      else if (m === 'quit') quitGame();
    }
    /** Cursor del submenu JUEGO RAPIDO. Sin encabezados: las cuatro filas son elegibles. */
    function quickNav(dir) {
      quickSel = (quickSel + dir + quickRows().length) % quickRows().length;
      beep(520, 0.05, 'square', 0.04);
    }
    function quickConfirm() {
      const id = quickRows()[quickSel].id;
      if (id === 'back') { modeSel = MODES.indexOf('quick'); setState('modeselect'); beep(400, 0.06, 'square', 0.05); return; }
      if (id === 'cycle') goCycle();
      else if (id === 'arena') goArena();
      else if (id === 'pasadas') goPasadas();
      else if (id === 'persec') goPersec();
      else goSurvival();
    }
    // ---------- LA MISION SUELTA (PLAN_MISIONES_FASES §1, fase S0) ----------
    // Jugar UNA mision AISLADA, sin campaña alrededor: con su cfg, su roster, su climax y su regla
    // de Chancha, pero sin guion encadenado, sin banco del Pichon y sin la mision siguiente. Es la
    // puerta UNICA de las tres herramientas que la piden — la sonda `__mision` / `?mision=<id>`,
    // el SELECTOR DE MISIONES y el verbo `mision` del catalogo de PRUEBAS — porque si cada una
    // armara su propia corrida, "probar la mision" y "jugar la mision" dejarian de ser lo mismo,
    // que es exactamente lo que el selector viene a garantizar.
    //
    // El MODO es 'cycle' a proposito y no uno nuevo: es el que ya juega una mision suelta y la
    // desemboca por el embudo normal (objetivo → recuento → epilogo), y el reintento tras un
    // derribo ya vuelve a la MISMA mision. Lo unico que hace falta agregarle es no encadenar la
    // siguiente — de eso se ocupa `S.test` en el epilogo.
    //
    // `S.test` queda puesto: es el flag de HERRAMIENTA (sello PRUEBA en el HUD, candado de
    // records y saves en S2) y ademas es lo que hace que la mision se juegue CON SU ROSTER y con
    // la regla de Chancha de la campaña — ver `reset()` y `pedirChancha()`.
    //
    // o = { historia, aire, cfg, modo, volver }
    //   historia · pasa por el guion largo de la mision ([H] en el selector). Por defecto NO: el
    //              selector existe para ir derecho al despegue.
    //   aire     · arrancar YA VOLANDO (los MOMENTOS de PRUEBAS; el selector quiere el despegue)
    //   cfg      · pisa el cfg del mapa (clima, combustible)
    //   modo     · gameMode alternativo (POR LA PATRIA / PERSECUCION, que no juegan una mision)
    //   volver   · a que pantalla vuelve al terminar; sin esto conserva la que ya habia
    //   avion    · pisa el avion fijo de campaña (indice en PLANES). Solo para PRUEBAS.
    function abrirMision(i, o) {
      o = o || {};
      gameMode = o.modo || 'cycle';
      // EL AVION DE LA CAMPAÑA NO SE ELIGE. M1-M14 son las misiones de la campaña vengan por la
      // puerta que vengan, y la campaña vuela A-4B ("mismo modelo para todos"). Sin esto, el avion
      // que habia quedado elegido en JUEGO RAPIDO se colaba por el SELECTOR y por los MOMENTOS: se
      // volaba el guion en un Mirage, y encima se median los tramos contra otro avion.
      // Los modos que NO son mision (POR LA PATRIA, PERSECUCION) siguen respetando la eleccion del
      // jugador, y `o.avion` deja pisar la regla a proposito para probar otro avion desde PRUEBAS.
      if (gameMode === 'cycle') selPlane = o.avion == null ? CAMPAIGN_PLANE : o.avion;
      S.test = true;
      testCine = !!o.soloCine;         // modo CINEMATICAS: la mision se lee, no se vuela
      testRadio = !!o.radio;           // modo DIALOGOS: se recorren las charlas, no se vuela
      if (o.volver) testBack = o.volver;
      prbTasks.length = 0;
      // LA LIBRETA DE ESA MISION (el "real real"): la corrida suelta se vuela con las piruetas que
      // un jugador tendria al llegar ahi, no con las doce. Sin esto el selector medía otro juego:
      // en M1 se podia tirar un TONEL BARRIL que el guion recien regala al final de la campaña, y
      // "que agregar o quitar en esta mision" se contestaba sobre un avion que no existe.
      // La regla vive en data/upgrades.js (una sola fuente, ver loadoutAt).
      pichon = loadoutAt(i);
      loadLevel(i);
      if (o.aire || o.cfg) { Object.assign(cfg, o.aire ? { start: 'air' } : {}, o.cfg || {}); applyCfg(); }
      // el recorrido de charlas se hace DENTRO del modo camara: mundo quieto, avion inmortal, y
      // la caja de radio ya tickea sola ahi (ver el bloque de cfg.devcam en update)
      cfg.devcam = testRadio;
      reset(); setRunObjective();
      run.t = 0;
      const m = curMission();
      // MODO DIALOGOS: derecho al mapa, sin despegue ni fundido — no hay mision que empezar, hay
      // charlas que mirar. Se entra en 'play' (el modo camara vive adentro de ese estado) y se
      // arranca parado en la primera.
      if (testRadio) { setState('play'); irACharla(0); return m; }
      if (o.historia && m.story) { initStory(m.story); setState('story'); return m; }
      // el fundido y el `lv1` son la ENTRADA a la mision, y por eso no van en los momentos: un
      // momento no empieza, ya esta pasando.
      if (!o.aire) { fadeT = 1.0; sfxOne('lv1'); }
      setState(afterBrief());
      return m;
    }
    /** Abre el EPILOGO de la mision en curso sin haberla volado (modo CINEMATICAS del selector).
     *  Existe aparte del camino normal —que arranca en 'results' y lee `lastRun`— porque acá no
     *  hubo corrida: no hay recuento que mostrar ni puntaje que contar, solo el guion. */
    function verEpilogo() {
      const m = curMission();
      if (!m || !m.epi) { salirTest(); return; }   // mision sin epilogo: no hay nada que leer
      initStory(m.epi); setState('epilogue');
      beep(500, 0.05, 'square', 0.04);
    }
    // ---------- EL RECORRIDO DE DIALOGOS (modo DIALOGOS del selector) ----------
    // Las charlas en vuelo de una mision son las `radio:` de sus tramos, y su MOMENTO es la
    // fraccion del recorrido en la que suenan. Recorrerlas es entonces: pararse en esa fraccion
    // del mapa y decir la linea. Nada de esto es logica nueva — es la data de los tramos leida en
    // orden y las dos funciones que el juego ya usa para hablar.

    /** Las charlas de la mision en curso, en orden: `{ frac, clave, tipo }`. Vacio si no tiene.
     *
     *  UN TRAMO PUEDE HABLAR DE DOS MANERAS y el recorrido tiene que ver las dos: `radio:` es una
     *  linea suelta de data/strings.js, y `charla:` es una escena entera de data/story.js. Cuando
     *  el Narwal paso de una a la otra, este recorrido se quedo leyendo solo `radio` y los
     *  dialogos de m4 y m5 desaparecieron del selector sin que nada fallara. */
    function charlasDe(m) {
      const out = [];
      let desde = 0;
      for (const t of (m && m.tramos) || []) {
        const frac = (desde + t.hasta) / 2;                                  // el MEDIO del tramo
        if (t.radio) out.push({ frac, clave: t.radio, tipo: 'radio' });
        if (t.charla) out.push({ frac, clave: t.charla, tipo: 'charla' });
        desde = t.hasta;
      }
      return out;
    }
    /** Se para en la charla `n` (con vuelta al principio) y la dice. Mueve `run.dist` para que el
     *  MUNDO sea el de ese momento de la mision: el punto del mapa es la mitad del dato. */
    function irACharla(n) {
      const ch = charlasDe(curMission());
      if (!ch.length) return null;
      radioBeat = ((n % ch.length) + ch.length) % ch.length;
      const c = ch[radioBeat];
      run.dist = Math.max(0, objectiveDist * c.frac);
      // LA MISMA PUERTA QUE USA EL VUELO, la que corresponda: se ve igual que en juego.
      if (c.tipo === 'charla') charla.armar(c.clave);
      else radioTramo(c.clave);
      return c;
    }
    // EL SELECTOR: la campaña listada, una fila por mision. Las filas son la DATA (el indice en
    // MISSIONS) y no una copia de sus textos: agregar una mision la pone en la lista sola, que es
    // la mitad de por que el selector sobrevive al remapeo 12→14.
    const misRows = () => MISSIONS.map((m, i) => ({ id: m.id, i })).concat([{ id: 'back', back: true }]);
    function misNav(dir) {
      const n = misRows().length;
      misSel = (misSel + dir + n) % n;
      beep(520, 0.05, 'square', 0.04);
    }
    function misConfirm() {
      const r = misRows()[misSel];
      if (!r) return;
      if (r.back) { modeSel = MODES.indexOf('misiones'); setState('modeselect'); beep(400, 0.06, 'square', 0.05); return; }
      beep(700, 0.08, 'square', 0.05);
      const modo = MIS_MODOS[misModo];
      abrirMision(r.i, {
        historia: modo === 'cine' || modo === 'ambas',
        soloCine: modo === 'cine', radio: modo === 'radio', volver: 'misiones',
      });
    }
    /** [H]: cicla MISION → CINEMATICAS → CINE+MISION. Tres tonos distintos (uno por modo) para no
     *  tener que mirar el pie cada vez que se aprieta. */
    function misToggleHist() {
      misModo = (misModo + 1) % MIS_MODOS.length;
      beep(440 + misModo * 130, 0.06, 'square', 0.05);
    }

    /** LA HIGIENE DE LAS HERRAMIENTAS (PLAN_MISIONES_FASES S2, y la PR3 de COMO_PROBAR: es la
     *  MISMA regla para las dos pantallas). Con `S.test` puesto la corrida NO DEJA RASTRO: ni
     *  record, ni partida guardada, ni mejoras aprendidas. Sin esto el selector es inusable — cada
     *  vez que probas una mision te ensucia el record y te pisa un save.
     *
     *  Lo que SI se sigue escribiendo son las PREFERENCIAS (mira, ejes, idioma, silencio): son las
     *  mismas filas de OPCIONES, el jugador las cambio a proposito, y bloquearlas haria que CAPS
     *  prendiera la mira libre y la perdiera al salir. La higiene es sobre el PROGRESO, no sobre
     *  la configuracion. */
    const sinRastro = () => S.test;

    /** Sale de una corrida de herramienta y vuelve a SU catalogo (PRUEBAS o MISIONES). Apaga las
     *  sondas-interruptor que la corrida pudo dejar puestas: ver PRB_NEUTRO. */
    function salirTest() {
      S.test = false; prbTasks.length = 0; prbNeutro();
      // el modo DIALOGOS deja el MODO CAMARA puesto: apagarlo es parte de salir. Sin esto, la
      // mision siguiente arrancaba con el mundo congelado y el avion quieto — y el sintoma
      // ("no puedo volar") no se parece en nada a la causa.
      testRadio = false; cfg.devcam = false;
      setState(testBack);
    }

    // ---------- EL MODO PRUEBAS (docs/proyecto/COMO_PROBAR.md §4) ----------
    // Un catalogo de MOMENTOS: elegis uno y el juego te pone exactamente ahi. Lo que sigue es
    // TODA la logica del modo, y es a proposito que sea tan poca: PRUEBAS es una INTERFAZ sobre
    // la capa de sondas que ya existe (~80 `window.__*`, 8 parametros de URL), no una segunda
    // implementacion del juego. El catalogo vive en data/pruebas.js y cada momento se describe
    // como una llamada a los verbos de `pruebasApi()`.
    const prbRows = () => PRUEBAS;
    /** Mueve el cursor SALTEANDO encabezados (mismo criterio que HISTORIA y OPCIONES). */
    function prbNav(dir) {
      const rows = prbRows();
      let i = prbSel;
      for (let k = 0; k < rows.length; k++) {
        i = (i + dir + rows.length) % rows.length;
        if (!rows[i].head) break;
      }
      prbSel = i;
      beep(520, 0.05, 'square', 0.04);
    }
    function prbFirstSel() { return prbRows().findIndex(r => !r.head); }
    function prbConfirm() {
      const r = prbRows()[prbSel];
      if (!r || r.head) return;
      if (r.back) { modeSel = MODES.indexOf('pruebas'); setState('modeselect'); S.test = false; beep(400, 0.06, 'square', 0.05); return; }
      prbTasks.length = 0;
      prbNeutro();
      S.test = true;                       // el sello del HUD y el candado de records (S2)
      testBack = 'pruebas';                // el momento vuelve AL CATALOGO, no al menu principal
      beep(700, 0.08, 'square', 0.05);
      r.setup(pruebasApi());
    }

    // ---------- EL MENU CINEMATICAS (PLAN_DIRECTOR_CINEMATICAS §5) ----------
    // La puerta hermana de PRUEBAS, y deliberadamente la MISMA mecanica: un catalogo, titulo y
    // detalle por fila, ENTER reproduce, ESC vuelve al catalogo. Lo unico distinto es de donde
    // sale la lista: no hay catalogo escrito a mano, se deriva de las timelines de data/cines.js
    // (`cinematicas()`), asi que una cinematica nueva aparece en el menu sin tocar nada mas.
    //
    // Reusa TODO lo de PRUEBAS —la api de verbos, las tareas diferidas, el neutro de las sondas
    // pegajosas, la vuelta al catalogo— porque es la misma herramienta: si divergieran, un dia
    // una cinematica se veria distinta segun por que puerta entraste.
    const cinRows = () => cinematicas().concat([{ id: 'back', back: true }]);
    function cinNav(dir) {
      const rows = cinRows();
      cinSel = (cinSel + dir + rows.length) % rows.length;
      beep(520, 0.05, 'square', 0.04);
    }
    function cinConfirm() {
      const r = cinRows()[cinSel];
      if (!r) return;
      if (r.back) { modeSel = MODES.indexOf('cines'); setState('modeselect'); S.test = false; beep(400, 0.06, 'square', 0.05); return; }
      // una cinematica sin `ver` esta declarada pero todavia no se puede mirar suelta: se avisa y
      // no pasa nada, en vez de dejar la pantalla en negro sin explicacion
      if (typeof r.ver !== 'function') { console.warn('[cines] la cinematica ' + r.id + ' no declara como mirarse (`ver`)'); beep(200, 0.12, 'square', 0.05); return; }
      prbTasks.length = 0;
      prbNeutro();
      S.test = true;
      testBack = 'cines';                  // la cinematica vuelve AL CATALOGO
      beep(700, 0.08, 'square', 0.05);
      r.ver(pruebasApi());
    }

    // ---------- EL MENU MANIOBRAS (PLAN_MANIOBRAS_FASES) ----------
    // La tercera puerta hermana de PRUEBAS y CINEMATICAS, y la MISMA mecanica otra vez. Lo unico
    // propio es que tiene DOS NIVELES: primero la pirueta, y adentro sus tres presentaciones. Son
    // dos niveles y no un toggle porque la lista de arriba es "que maniobra" y la de adentro es
    // "como la quiero ver": son dos preguntas, y mezclarlas en una fila obligaba a leer el modo en
    // un renglon que ya decia otra cosa.
    //
    // El catalogo se DERIVA de data/moves.js (`maniobras()`), igual que el de CINEMATICAS se
    // deriva de las timelines: una pirueta nueva aparece sola.
    const mvRows = () => maniobras().concat([{ id: 'back', back: true }]);
    const mvVarRows = () => MV_VISTAS.concat([{ id: 'back', back: true, volver: 'mvVarsBack' }]);
    function mvNav(dir) {
      const rows = mvRows();
      mvSel = (mvSel + dir + rows.length) % rows.length;
      beep(520, 0.05, 'square', 0.04);
    }
    function mvConfirm() {
      const r = mvRows()[mvSel];
      if (!r) return;
      if (r.back) { modeSel = MODES.indexOf('maniobras'); setState('modeselect'); S.test = false; beep(400, 0.06, 'square', 0.05); return; }
      mvPick = r; mvVarSel = 0; setState('mvvars'); beep(600, 0.08, 'square', 0.05);
    }
    function mvVarNav(dir) {
      const rows = mvVarRows();
      mvVarSel = (mvVarSel + dir + rows.length) % rows.length;
      beep(520, 0.05, 'square', 0.04);
    }
    function mvVarConfirm() {
      const r = mvVarRows()[mvVarSel];
      if (!r || !mvPick) return;
      if (r.back) { setState('maniobras'); beep(400, 0.06, 'square', 0.05); return; }
      // se entra por la MISMA puerta que PRUEBAS y CINEMATICAS —los verbos, las tareas diferidas,
      // el neutro de las sondas pegajosas— porque es la misma herramienta con un catalogo mas.
      prbTasks.length = 0;
      prbNeutro();
      S.test = true;
      testBack = 'mvvars';                 // la maniobra vuelve A SUS VARIANTES, no al catalogo
      beep(700, 0.08, 'square', 0.05);
      r.setup(pruebasApi(), mvPick.id);
    }

    // LAS SONDAS PEGAJOSAS. Varias de las sondas del repo son INTERRUPTORES, no acciones: quedan
    // puestas hasta que alguien las apaga. Desde la consola eso esta bien (las prendiste vos);
    // desde un catalogo donde se saltan momentos de a uno, es veneno — `__czcalma` deja el pasillo
    // vacio BORRANDO obstacles cada cuadro, y el momento siguiente, LA CADENA, aparecia sin un solo
    // pedazo porque el barrido del duelo anterior se los comia. Costo media hora encontrarlo.
    //
    // La regla: entrar y salir de un momento pasa por aca, y aca se apaga TODO lo que un momento
    // pudo dejar prendido — llamando a las MISMAS sondas, nunca tocando la variable por atras.
    const PRB_NEUTRO = [['czcalma', 0], ['czalto', null], ['czspd', null], ['pdef', 1], ['pinv', 0]];
    function prbNeutro() {
      if (typeof window === 'undefined') return;
      for (const [n, v] of PRB_NEUTRO) { const f = window['__' + n]; if (typeof f === 'function') { try { f(v); } catch (e) { } } }
    }

    // TAREAS DIFERIDAS del modo. Casi ninguna sonda del mundo sirve antes de que haya mundo:
    // `__ola` necesita el mar sembrandose, `__czstart` un pasillo andando, `__romper` un avion en
    // el aire. `a.luego(t, fn)` las agenda por tiempo de corrida y esto las cobra. Es lo unico que
    // el modo agrega al bucle, y solo corre con `S.test` puesto.
    const prbTasks = [];
    function prbTick() {
      if (!S.test || !prbTasks.length) return;
      for (let i = prbTasks.length - 1; i >= 0; i--) {
        if (run.t < prbTasks[i].t) continue;
        const f = prbTasks.splice(i, 1)[0].fn;
        // una sonda que revienta no puede llevarse el frame: el catalogo es tambien red de
        // regresion (PR4) y tiene que poder REPORTAR el momento roto en vez de colgarse
        try { f(pruebasApi()); } catch (e) { console.warn('[pruebas] fallo una sonda diferida:', e); }
      }
    }

    /** LOS VERBOS del catalogo. Cada uno es la MISMA puerta que ya usaban las sondas de URL y los
     *  fixtures — `mision` es el camino de ?pasada=<n>&pasillo, `escena` el de ?scene=<ID>,
     *  `sonda` es literalmente window.__*. Si un momento necesitara algo que no esta aca, lo que
     *  hay que agregar es una SONDA (util tambien desde la consola), no un verbo con logica. */
    function pruebasApi() {
      const idx = id => Math.max(0, MISSIONS.findIndex(m => m.id === id));
      /** Arranca una mision como corrida suelta: sin guion largo ni tarjeta de briefing — el
       *  camino exacto de ?pasada=<n>&pasillo. `over` pisa el cfg del mapa (clima, combustible). */
      // SIEMPRE se carga la mision, aun en los modos infinitos: es lo que hace el momento
      // REPRODUCIBLE. Sin esto POR LA PATRIA hereda el cfg del momento anterior y la misma fila
      // del menu abre una escena distinta segun lo que hayas mirado antes (pasó: la ola rebelde
      // aparecio sobre un campo verde porque venia el cielo de otra mision).
      // Y SIEMPRE se arranca EN EL AIRE (`aire`). El modo es "ponerme exactamente ahi": ningun
      // momento vale tres segundos de carreteo, y la mitad de las sondas del mundo necesitan estar
      // volando. Un momento que quiera el despegue lo pide con `{ start: 'runway' }`.
      const abrir = (id, over, modo) => abrirMision(idx(id), { aire: true, cfg: over, modo });
      return {
        mision: (id, over) => abrir(id, over),
        patria: over => abrir('m1', over, 'survival'),
        persec: over => abrir('m1', over, 'persec'),
        arena: id => { gameMode = 'arena'; cfg.arenaShip = idx(id); loadLevel(cfg.arenaShip); startArenaBattle(false); },
        pasada: id => { gameMode = 'cycle'; loadLevel(idx(id)); reset(); setRunObjective(); run.dist = objectiveDist; pasada.enter(false); },
        // LA LIBRETA, igual que en `abrirMision`: EL PULSO arma su examen con las piruetas
        // APRENDIDAS, y estos verbos no pasan por ahi. Sin esto la prueba salia con la libreta
        // vacia —secuencias de un solo `Z`, sin una sola pirueta— y tanto el momento de PRUEBAS
        // como la cinematica del premio mostraban otro juego que el que se juega. Se vio recien al
        // mirar el premio suelto desde el menu CINEMATICAS.
        pulso: id => {
          const i = idx(id);
          gameMode = 'cycle'; pichon = loadoutAt(i);
          loadLevel(i); reset(); setRunObjective(); run.dist = objectiveDist;
          // …Y VOLANDO. `reset()` deja `run.spd` en 6 (el avion quieto en cabecera): quien llega
          // al buque de verdad llega a velocidad de crucero, y desde que la cinematica del premio
          // mueve el mundo con `run.spd` (PLAN_CINE_PESO P2) esa diferencia se VE — el mar no
          // corria. 62 es la misma velocidad con la que el despegue entrega el avion.
          run.spd = 62;
          pulso.enter(false);
        },
        escena: id => { if (SCENES[id]) { dialogue.startSeq([SCENES[id]], getLang()); setState('story'); } },
        // lo que se resuelve AL CARGAR (has3D con ?no3d, el idioma) no se puede cambiar en vivo:
        // el unico momento honesto es recargar con el parametro puesto.
        recarga: qs => { location.search = qs; },
        luego: (t, fn) => prbTasks.push({ t, fn }),
        sonda: (n, ...args) => {
          const f = typeof window !== 'undefined' && window['__' + n];
          if (typeof f !== 'function') { console.warn('[pruebas] no existe la sonda __' + n); return null; }
          return f(...args);
        },
        cfg: over => { Object.assign(cfg, over); applyCfg(); },
      };
    }

    /** Cierra el juego. En Electron cierra la ventana (y con ella la app); en el build web
     *  el navegador ignora close() en una pestaña que no abrio un script — por eso vuelve a la
     *  portada, que es lo mas cercano a 'salir' que se puede hacer ahi. */
    function quitGame() {
      beep(300, 0.18, 'square', 0.05, 120);
      try { window.close(); } catch (e) { }
      setTimeout(() => { if (!window.closed) { modeSel = 0; setState('title'); } }, 250);
    }

    // ---------- PAUSA: logica del menu ----------
    // Filas del menu principal de la pausa. GUARDAR solo tiene sentido en HISTORIA (el progreso
    // es la mision), asi que fuera de ese modo la fila directamente NO APARECE (pedido 9/8:
    // mostrarla deshabilitada solo agregaba una parada muerta al cursor).
    const pauseRows = () => [
      { id: 'resume', label: T('pauseResume') },
      { id: 'controls', label: T('pauseControls') },
      ...(gameMode === 'campaign' ? [{ id: 'save', label: T('pauseSaveRow') }] : []),
      { id: 'quit', label: T('pauseQuit'), quit: true },
    ];
    // filas de la vista GUARDAR: el slot nuevo (si hay lugar) + los existentes para pisar
    const pauseSaveRows = () => (saves.canSaveNew() ? [{ id: null }] : []).concat(saves.listSaves());
    const PAUSABLE = () => S.state === 'play' || S.state === 'takeoff' || S.state === 'momentum' || S.state === 'arena' || S.state === 'pasada' || S.state === 'pulso';
    function pauseToggle() {
      if (!paused && (!PAUSABLE() || cfg.devcam)) return;
      paused = !paused;
      if (paused) {
        pauseSel = 0; pauseView = 'menu'; pauseMsgT = -9;
        engineOff();                       // el motor no puede quedar rugiendo con el juego quieto
        beep(430, 0.07, 'square', 0.05, -80);
      } else beep(620, 0.06, 'square', 0.05, 80);
    }
    function pauseNav(dir) {
      if (pauseView === 'menu') { const n = pauseRows().length; pauseSel = (pauseSel + dir + n) % n; }
      else if (pauseView === 'save') {
        const n = pauseSaveRows().length;
        if (n) saveSel = (saveSel + dir + n) % n;
      } else return;                       // CONTROLES: no hay nada que navegar
      beep(520, 0.05, 'square', 0.04);
    }
    function pauseConfirm() {
      if (pauseView === 'controls') { pauseView = 'menu'; beep(400, 0.06, 'square', 0.05); return; }
      if (pauseView === 'save') { doSave(); return; }
      const r = pauseRows()[pauseSel];
      if (r.id === 'resume') pauseToggle();
      else if (r.id === 'controls') { pauseView = 'controls'; beep(600, 0.06, 'square', 0.05); }
      else if (r.id === 'save') { pauseView = 'save'; saveSel = 0; beep(600, 0.06, 'square', 0.05); }
      else if (r.id === 'quit') {
        // SALIR: la partida muere aca (sin guardado implicito — guardar es una decision del
        // jugador, no un efecto colateral de irse)
        paused = false;
        if (S.test) salirTest();
        else { setState('modeselect'); modeSel = 0; }
        beep(400, 0.09, 'square', 0.05);
      }
    }
    function pauseBack() {
      if (pauseView !== 'menu') { pauseView = 'menu'; beep(400, 0.06, 'square', 0.05); return; }
      pauseToggle();                       // ESC sobre el menu raiz = reanudar
    }
    /** Guarda (slot nuevo o pisando el elegido) y vuelve al menu raiz con el flash de confirmacion. */
    function doSave() {
      // LOS SAVES (S2). Hoy la fila GUARDAR solo existe en campaña y las herramientas corren en
      // otro modo, asi que este candado no deberia poder dispararse — y va igual: es la clase de
      // regla que se rompe sola el dia que alguien haga la fila visible en otro modo, y ahi el
      // sintoma seria una partida de otro pisada por una prueba.
      if (sinRastro()) { beep(140, 0.09, 'square', 0.05); return; }
      // EL DESGASTE VIAJA CON LA PARTIDA. Sin esto el avion se cura solo al cargar: la cicatriz
      // es de la campaña, no de la sesion.
      const d = { camp: curCampaign, level: curLevel, score: Math.floor(run.score), lives: run.lives,
        ups: pichon.slice(), desg: { i: desgaste.impactos, m: desgaste.misiones } };
      const row = pauseSaveRows()[saveSel];
      if (!row) return;
      if (row.id === null) saves.saveGame(d); else saves.overwriteSave(row.id, d);
      pauseMsgT = pauseT; pauseView = 'menu';
      beep(880, 0.12, 'square', 0.06);
    }

    // ---------- MENU DE HISTORIA: filas y carga de partidas ----------
    // El menu va por SECCIONES (encabezado + filas), y CONTINUAR entero DESAPARECE cuando no hay
    // partidas guardadas (pedido 10/8): una seccion vacia no explica nada que el jugador pueda
    // hacer — la primera vez que abris HISTORIA lo unico que hay es empezar.
    // `head` marca encabezado: el cursor no se para ahi (ver campNav).
    const campRows = () => [
      ...(saves.listSaves().length ? [{ head: 'campSecContinue' }, { id: 'continue' }] : []),
      { head: 'campSecNew' },
      { id: 'c1' },
      // { id: 'c2', disabled: !CAMPAIGNS[1].enabled },
      { id: 'back', back: true },      // la salida de la pantalla, a la vista (ver quickRows)
    ];
    /** Mueve el cursor SALTEANDO encabezados (mismo criterio que OPCIONES). */
    function campNav(dir) {
      const rows = campRows();
      let i = campSel;
      for (let k = 0; k < rows.length; k++) {
        i = (i + dir + rows.length) % rows.length;
        if (!rows[i].head) break;
      }
      campSel = i;
      beep(520, 0.05, 'square', 0.04);
    }
    function campConfirm() {
      const r = campRows()[campSel];
      if (!r || r.head) return;
      if (r.disabled) { beep(140, 0.09, 'square', 0.05); return; }
      // ATRAS deja el cursor del menu principal SOBRE la fila de la que se vino: volver no puede
      // costar volver a buscar donde estabas.
      if (r.id === 'back') { modeSel = MODES.indexOf('campaign'); setState('modeselect'); beep(400, 0.06, 'square', 0.05); return; }
      if (r.id === 'continue') { savesSel = 0; setState('saves'); beep(600, 0.06, 'square', 0.05); }
      else if (r.id === 'c1') { startCampaign(); beep(700, 0.08, 'square', 0.05); }
    }
    /** Primera fila SELECCIONABLE del menu (la lista arranca con un encabezado). */
    function campFirstSel() { return campRows().findIndex(r => !r.head); }
    /** Retoma una partida guardada: la mision en curso arranca desde su principio, con el
     *  puntaje y los aviones que habia (el guardado es a nivel MISION, ver systems/saves.js). */
    function loadSave(rec) {
      curCampaign = CAMPAIGNS[rec.camp] && CAMPAIGNS[rec.camp].enabled ? rec.camp : 0;
      gameMode = 'campaign'; selPlane = CAMPAIGN_PLANE;
      pichon = Array.isArray(rec.ups) ? rec.ups.slice() : [];   // las mejoras viajan con la partida
      // y la chapa con la que se sigue volando. Una partida vieja (sin `desg`) entra con el avion
      // sano: se degrada de nuevo, que es mejor que romper el guardado.
      resetDesgaste();
      if (rec.desg) { desgaste.impactos = rec.desg.i | 0; desgaste.misiones = rec.desg.m | 0; }
      loadLevel(Math.min(rec.level || 0, MISSIONS.length - 1));
      reset();
      run.score = rec.score || 0;
      if (rec.lives) run.lives = Math.min(run.squad, rec.lives);
      setRunObjective(); setState(enterMission());
      beep(700, 0.08, 'square', 0.05);
    }
    // arranca la mision actual por la puerta que corresponda: guion largo (campaña, si lo tiene)
    // o tarjeta corta de briefing (ciclo de muerte). Devuelve el estado al que hay que ir.
    // Las misiones de REGRESO empiezan YA VOLANDO: no hay base de la que despegar, asi que el
    // estado 'takeoff' (cuenta regresiva + carrera + rotacion) no aplica y se entra directo a jugar.
    // El TREN va con la puerta de entrada: si el nivel empieza ya volando, viene recogido de fabrica
    // (nunca hubo pista de la que levantarlo); si hay carrera, baja para el despegue.
    function afterBrief() { run.gear = cfg.start === 'air' ? 0 : 1; return cfg.start === 'air' ? 'play' : 'takeoff'; }
    // ---------- EL INTERSTICIAL (G-09) ----------
    // Negro con una linea y nada mas. No es una pantalla: es un CORTE, el respiro que separa dos
    // cosas para que no se lean como una sola. Lo usa la campaña para dos momentos:
    //   · el TITULO de la mision, antes de que aparezca la escena con su imagen;
    //   · el «DIA SIGUIENTE», entre una mision y la que sigue.
    //
    // ES EXCLUSIVO DE CAMPAÑA. Por el mismo bloque de posmision pasan las herramientas (`S.test`) y
    // los modos arena, pasadas y ciclo: ninguno lo ve, y por eso el gate esta en quien lo arma y no
    // adentro del estado.
    let interTxt = '', interT = 0, interDur = 0, interNext = null;
    const INTER_TIT = 2.2;    // el titulo de la mision
    const INTER_DIA = 1.8;    // «DIA SIGUIENTE» — mas corto: es un corte, no una portada

    /** Arma el intersticial y devuelve el estado, para poder hacer `setState(armarInter(...))`. */
    function armarInter(txt, seg, next) {
      interTxt = txt || ''; interT = 0; interDur = seg; interNext = next || null;
      return 'inter';
    }

    function enterMission() {
      const m = curMission();
      // EL TITULO EN NEGRO ANTES DE LA ESCENA. Sin esto la primera linea del guion entra encima de
      // la pantalla anterior y las dos misiones se leen como una sola tirada.
      if (gameMode === 'campaign' && m.story) {
        return armarInter(m.name, INTER_TIT, () => { initStory(m.story); setState('story'); });
      }
      briefT = 0; return 'brief';
    }
    // elige una mision al azar para el CICLO DE MUERTE (solo las misiones CON buque)
    function randomMission() { loadLevel(randomShipMission()); }
    /** QUE CLIMAX juega el run: 'pasada' o 'arena' (SPEC_MODO_PASADA RF-14).
     *
     *  ES DATO DE LA MISION, no una rama de codigo: sale del campo `climax` de data/missions.js y
     *  el default —lo que juega una mision con buque que no dice nada— es la PASADA. Cambiar una
     *  mision de climax es cambiar una palabra en ese archivo.
     *
     *  MINUTOS SAGRADOS (gameMode 'arena') y PASADAS MORTALES ('pasadas') son la excepcion, y no
     *  es una inconsistencia: esos dos modos NO juegan la mision, juegan UN climax suelto — el
     *  buque es nada mas el escenario. Por eso mandan ellos y no el campo. */
    function runClimax() {
      if (pulsoProbe) return 'pulso';                      // sonda de EL PULSO (Q1)
      if (gameMode === 'pasadas' || pasadaProbe) return 'pasada';
      if (gameMode === 'arena') return 'arena';
      return climaxOf(curMission()) || 'pasada';
    }
    // define el objetivo del run según el modo (campaña/ciclo: el goal de la mision; supervivencia: infinito)
    // `keepMusic` solo lo pasa el REINTENTO tras un derribo: ahi la musica sigue sonando.
    function setRunObjective(keepMusic) {
      if (gameMode === 'campaign' || gameMode === 'cycle' || gameMode === 'arena' || gameMode === 'pasadas') {
        const m = curMission(), g = goalOf(m);
        objectiveDist = g.dist(m.goal) * QA_DIST;
        objectiveShip = g.label(m.goal);
        objectiveKind = m.goal.kind || 'ship';
        g.setup(m.goal);
      }
      else { objectiveDist = 0; objectiveShip = randomShip(); objectiveKind = 'ship'; }
      // LOS TRAMOS de la corrida (SPEC_TRAMOS RF-01). Va ACA y no en `reset()` porque es donde
      // se calcula `objectiveDist`, y las fracciones no significan nada sin su objetivo: atarlos
      // al mismo lugar es lo que garantiza que los dos son SIEMPRE del mismo run. Los modos sin
      // objetivo (POR LA PATRIA) quedan sin tramos, que es el alcance v1 del spec.
      tramos.setTramos(objectiveDist > 0 && curMission() ? curMission().tramos : null, objectiveDist);
      // EL ZIGZAG de la corrida (PLAN_PASILLO_ZIGZAG Z1) va al lado de los tramos y por la misma
      // razon exacta: su ventana `desde`/`hasta` son fracciones, y una fraccion sin su objetivo
      // no significa nada. A diferencia de los tramos, un modo SIN objetivo si puede llevar
      // zigzag (el preset del menu en POR LA PATRIA): ahi la ventana vale entera.
      zigzag.setZigzag(curMission() ? curMission().zigzag : null, objectiveDist);
      // EL PULSO necesita saber CONTRA QUE buque es la prueba: de su clase sale como se muere en
      // la cinematica del premio. Va aca y no en reset() porque el objetivo se define despues.
      pulso.setShip(objectiveShip);
      // MUSICA: campaña usa game.mp3; ciclo y supervivencia mantienen la pista elegida en el
      // reproductor (no la re-sortean). Arranca de cero al empezar el mapa, SALVO al reintentar
      // tras morir: ahi continua donde venia, sin corte.
      setRunMusic(gameMode === 'campaign', curLevel, keepMusic);
    }

    // ---------- OPCIONES: LA pantalla de configuración ----------
    // Antes esto estaba partido en dos: OPCIONES (idioma y poco más) y el menú [M], que se abría
    // SOLO desde la selección de avión. Eso dejaba a la campaña sin acceso a nada — y varias de
    // las filas de [M] (COMBUSTIBLE, ENERGÍA, PIRUETAS) sí la afectan. Se unificaron acá y [M]
    // dejó de existir. OJO: desde la campaña v0.0.1 cada misión pisa TODO el bloque de mapa y
    // ambiente (sky/water/terrain/wind/obstacles/coast/bombs/rain/fog/squad — ver C() en
    // data/missions.js), así que en campaña esas filas son de solo-mirar.
    //
    // La lista lleva ENCABEZADOS de sección, y los de las filas de prototipado dicen en qué modos
    // sirven: quien juega la campaña tiene que poder ver de un vistazo que el bloque de MAPA no
    // le hace nada.
    //
    // FORMA DE UNA FILA: { label, opts, names, get, set } — `label` y `names` son funciones para
    // que cambiar el IDIOMA (que es una fila de esta misma pantalla) repinte el resto al instante.
    // `save` es la clave de localStorage; `preview` le pide al render que dibuje el valor.
    const yesNo = () => [T('optYes'), T('optNo')];
    const OPT_ROWS = [
      { head: 'optSecJuego' },
      { label: () => T('optLang'), opts: LANGS, names: () => LANGS.map(l => STRINGS[l].langName),
        get: () => getLang(), set: v => { setLang(v); applyChrome(); } },

      { head: 'optSecControl' },
      // TODO lo que toca al AVION —piruetas, mira, ejes, esquema de control— se mudó a MEJORAS DEL
      // PICHON, su propia pantalla. Acá queda la puerta: de una pirueta hay que saber qué hace Y
      // cómo se teclea, y eso no entra en un renglón de 15 px.
      { label: () => T('optMejoras'), value: () => T('optMejorasGo'), open: 'mejoras' },

      // CONTROLES: filas de solo LECTURA. No se cambian (el remapeo no existe todavia): estan para
      // que las teclas y los botones se puedan CONSULTAR sin salir del juego ni abrir el README.
      // El cursor las saltea igual que a los encabezados.
      { head: 'optSecCtrl' },
      { cols: true },   // rotulos TECLADO / JOYSTICK de las dos columnas
      ...[['Fly'], ['Gas'], ['Dive'], ['Gun'], ['Msl'], ['Boost'], ['Brake'], ['Turn'], ['Pips'], ['Roll'], ['Pan'], ['Moves']]
        .map(([k]) => ({ ctrl: 'ctrl' + k, kb: 'ctrl' + k + 'K', pad: 'ctrl' + k + 'P' })),
      // NOTAS al pie de la tabla: no son controles ni opciones, son las dos reglas que la tabla
      // sola no alcanza a explicar. Van como tipo aparte (`note`) porque puestas como filas de
      // control se leian como si fueran configurables — el cursor se paraba encima y daban ganas
      // de apretarles izquierda/derecha a ver que cambiaba.
      { note: 'ctrlHands' }, { note: 'ctrlWasd' }, { note: 'ctrlArena' }, { note: 'ctrlBombs' }, { note: 'ctrlSame' }, { note: 'ctrlBoth' },
      ...[['Aim'], ['Cam'], ['Tempo'], ['Chancha'], ['Inv'], ['Music'], ['Pause'], ['Menu']]
        .map(([k]) => ({ ctrl: 'ctrl' + k, kb: 'ctrl' + k + 'K', pad: 'ctrl' + k + 'P' })),

      { head: 'optSecPartida' },
      // ESCUADRÓN: las VIDAS, contadas como aviones de la formación (ver systems/squad.js).
      { label: () => T('optSquad'), opts: [1, 2, 3, 4, 5, 6, 7, 8],
        names: () => [T('optSquadSolo'), '2', '3', '4', '5', '6', '7', '8'],
        get: () => cfg.squad, set: v => cfg.squad = v, save: 'rasante_escuadron' },
      { label: () => T('optFuel'), opts: [true, false], names: yesNo,
        get: () => cfg.fuelOn, set: v => cfg.fuelOn = v, save: 'rasante_combustible' },
      // MODELO DE VIDA (core/damage.js). Va PEGADO a ESCUADRON porque las dos filas contestan la
      // misma pregunta —cuanto aguanta el jugador— y separarlas obligaba a leerlas dos veces.
      // Vale para TODOS los modos y a futuro es una perilla de la dificultad.
      { label: () => T('optDmg'), opts: DMG_MODES,
        names: () => DMG_MODES.map(m => T('optDmg_' + m)),
        get: () => cfg.dmgMode, set: v => cfg.dmgMode = v, save: 'rasante_averias' },
      // QUE LE PASA AL RELEVADO (RF-15.5). Va pegada a las dos de arriba porque completa la misma
      // pregunta: cuántos aviones tenés, cuánto aguanta cada uno, y qué se ve cuando perdés uno.
      { label: () => T('optRelevo'), opts: ['auto', 'dmg', 'kill'],
        names: () => ['auto', 'dmg', 'kill'].map(m => T('optRelevo_' + m)),
        get: () => cfg.relevoFx, set: v => cfg.relevoFx = v, save: 'rasante_relevo' },
      // RALENTI DE LA PASADA (RF-12): los ultimos metros antes del buque, mas lentos.
      { label: () => T('optPasadaSlow'), opts: [true, false], names: yesNo,
        get: () => cfg.pasadaSlow, set: v => cfg.pasadaSlow = v, save: 'rasante_pasada_lenta' },
      // ENEMIGOS: movimiento propio (globos, helos patrullando, cazas que te buscan, fragatas).
      { label: () => T('optEnemies'), opts: [true, false],
        names: () => [T('optEnemiesOn'), T('optEnemiesOff')],
        get: () => cfg.enemyMove, set: v => cfg.enemyMove = v, save: 'rasante_enemigos' },

      // FONDO y AGUA también pintan el ARENA (three-arena lee theme.sky/theme.water), por eso no
      // están en el bloque de MAPA: ese es solo del PASILLO.
      //
      // Desde la campaña v0.0.1 cada misión pisa TAMBIÉN la lluvia (la rampa de clima del guion),
      // así que la vieja media-verdad del encabezado quedó saldada: en campaña, todo este bloque
      // lo decide la misión.
      { label: () => T('optRadioUI'), opts: ['toast', 'panel'],
        names: () => [T('optRadioToast'), T('optRadioPanel')],
        get: () => cfg.radioUI, set: v => cfg.radioUI = v, save: 'rasante_radioui' },

      { head: 'optSecAmbiente' },
      { note: 'optNoteAmbiente' },
      { label: () => T('optSky'), opts: ['dusk', 'night', 'storm', 'clear', 'cloudy', 'sun', 'moon', 'dawn'],
        names: () => [T('optSkyDusk'), T('optSkyNight'), T('optSkyStorm'), T('optSkyClear'),
                      T('optSkyCloudy'), T('optSkySun'), T('optSkyMoon'), T('optSkyDawn')],
        get: () => cfg.sky, set: v => { cfg.sky = v; applyCfg(); }, save: 'rasante_fondo' },
      // AGUA: AUTO primero (F5) — el mar lo elige el cielo. Los estilos a mano siguen estando y
      // siguen pisando; los cuatro nuevos son de clima (ver WATER_STYLES en data/palette.js).
      { label: () => T('optWater'), opts: ['auto', 'sea', 'violet', 'storm', 'night', 'sun', 'dawn'],
        names: () => [T('optWaterAuto'), T('optWaterSea'), T('optWaterViolet'), T('optWaterStorm'),
                      T('optWaterNight'), T('optWaterSun'), T('optWaterDawn')],
        get: () => cfg.water, set: v => { cfg.water = v; applyCfg(); }, save: 'rasante_agua' },
      // AGUA 3D EN EL PASILLO: la prueba de PLAN_MEJORAS_3D §5b. Va pegada a AGUA porque es la
      // misma pregunta —como se ve el mar— y porque asi se alterna sin salir del vuelo: la fila
      // no reconstruye nada, solo cambia cual de los dos mares esta visible.
      { note: 'optNoteAgua3D' },
      { label: () => T('optAgua3D'), opts: ['2d', '3d'],
        names: () => [T('optAgua3D_2d'), T('optAgua3D_3d')],
        get: () => cfg.agua3d, set: v => cfg.agua3d = v, save: 'rasante_agua3d' },
      // LAS TRES CAPAS DEL 3D (PLAN_MEJORAS_3D P3/P6/P2), en las dos escenas. Van con perilla y no
      // con un default porque son propuestas visuales a la vista: se alternan EN VUELO y se
      // comparan sin salir de la partida, que es la unica forma honesta de elegir un look.
      { note: 'optNote3D' },
      { label: () => T('optDuo3D'), opts: ['on', 'off'],
        names: () => [T('optDuo3D_on'), T('optDuo3D_off')],
        get: () => cfg.duo3d, set: v => cfg.duo3d = v, save: 'rasante_duo3d' },
      { label: () => T('optBruma3D'), opts: ['on', 'off'],
        names: () => [T('optBruma3D_on'), T('optBruma3D_off')],
        get: () => cfg.bruma3d, set: v => cfg.bruma3d = v, save: 'rasante_bruma3d' },
      { label: () => T('optAves3D'), opts: ['on', 'off'],
        names: () => [T('optAves3D_on'), T('optAves3D_off')],
        get: () => cfg.aves3d, set: v => cfg.aves3d = v, save: 'rasante_aves3d' },
      // DESENFOQUE DEL TURBO (render/desenfoque.js). Va en el bloque de AMBIENTE, al lado de la
      // lluvia, porque es exactamente lo mismo que ella: cambia como se VE el vuelo y no como se
      // juega. Se apaga entero desde aca — es el unico efecto del juego que pega un pegado de
      // pantalla completa por cuadro.
      { label: () => T('optBlur'), opts: ['on', 'off'],
        names: () => [T('optBlurOn'), T('optBlurOff')],
        get: () => cfg.desenfoque, set: v => cfg.desenfoque = v, save: 'rasante_desenfoque' },
      // LLUVIA: ambiente puro (ver cfg.rain en core/state.js y render/rain.js). Va acá y no en el
      // bloque de MAPA justamente porque NO cambia cómo se juega — MAPA es donde vive el VIENTO,
      // que sí te corta la velocidad.
      { label: () => T('optRain'), opts: Array.from({ length: RAIN_N }, (_, i) => i),
        names: () => [T('optRainOff'), T('optRainDrizzle'), T('optRainRain'), T('optRainStorm')],
        get: () => cfg.rain, set: v => cfg.rain = v, save: 'rasante_lluvia' },
      // NIEBLA DE GUERRA (render/marco.js): el velo de los costados. Es la UNICA fila de este
      // bloque que la campaña NO pisa — no es clima de la mision sino como querés ver el juego,
      // igual que el IDIOMA. Por eso persiste y por eso viene prendida.
      { label: () => T('optMarco'), opts: ['off', 'bruma', 'focus'],
        names: () => ['off', 'bruma', 'focus'].map(m => T('optMarco_' + m)),
        get: () => cfg.marco, set: v => cfg.marco = v, save: 'rasante_marco' },
      // LO TRANSONICO (PLAN_TRANSONICO): vapor de ala y cono. Va al lado de la niebla de guerra
      // por la misma razon — es como querés ver el juego, no una regla del mundo. Y tiene el
      // escalon intermedio a proposito: 'vapor' deja SOLO lo que un A-4 hacia de verdad.
      { label: () => T('optMach'), opts: ['off', 'vapor', 'todo'],
        names: () => ['off', 'vapor', 'todo'].map(m => T('optMach_' + m)),
        get: () => cfg.mach, set: v => cfg.mach = v, save: 'rasante_mach' },

      { head: 'optSecMapa' },
      // elegir COSTA trae su clima: día nublado de desembarco (el FONDO se puede cambiar después)
      { label: () => T('optTerrain'), opts: ['sea', 'land', 'coast'],
        names: () => [T('optTerrainSea'), T('optTerrainLand'), T('optTerrainCoast')],
        get: () => cfg.terrain, set: v => { cfg.terrain = v; if (v === 'coast') { cfg.sky = 'cloudy'; applyCfg(); } },
        save: 'rasante_terreno' },
      { label: () => T('optWind'), opts: [true, false], names: yesNo,
        get: () => cfg.wind, set: v => cfg.wind = v, save: 'rasante_viento' },
      // EL PASILLO EN ZIGZAG (PLAN_PASILLO_ZIGZAG). Va en el bloque de MAPA porque es eso: la
      // forma del carril. Es una perilla de PROTOTIPO —una mision de verdad trae su trazado en
      // el campo `zigzag:`, que pisa a esta— y por eso el default es RECTO: con RECTO el juego
      // es, bit a bit, el de antes de que el item existiera.
      { label: () => T('optZigzag'), opts: [0, 1, 2],
        names: () => [T('optZigzag_0'), T('optZigzag_1'), T('optZigzag_2')],
        get: () => cfg.zigzag | 0, set: v => cfg.zigzag = v, save: 'rasante_zigzag' },
      // NIEBLA: va acá, con VIENTO y OBSTÁCULOS, porque CAMBIA CÓMO SE JUEGA — no es ambiente.
      { label: () => T('optFog'), opts: [0, 1, 2],
        names: () => [T('optFogOff'), T('optFogLight'), T('optFogThick')],
        get: () => cfg.fog, set: v => { cfg.fog = v; resetFog(); }, save: 'rasante_niebla' },
      { label: () => T('optFogLen'), opts: [0, 1, 2, 3],
        names: () => [T('optFogLen0'), T('optFogLen1'), T('optFogLen2'), T('optFogLen3')],
        get: () => cfg.fogLen, set: v => { cfg.fogLen = v; resetFog(); }, save: 'rasante_niebla_largo' },
      { label: () => T('optObst'), opts: [0, 0.5, 1, 1.7],
        names: () => [T('optObst0'), T('optObst1'), T('optObst2'), T('optObst3')],
        get: () => cfg.obstacles, set: v => cfg.obstacles = v, save: 'rasante_obstaculos' },
      { label: () => T('optBombs'), opts: [0, 0.5, 1, 2],
        names: () => [T('optBombs0'), T('optBombs1'), T('optBombs2'), T('optBombs3')],
        get: () => cfg.bombs, set: v => cfg.bombs = v, save: 'rasante_bombardeo' },
      { label: () => T('optCoast'), opts: [120, 230, 400],
        names: () => [T('optCoastShort'), T('optCoastMid'), T('optCoastLong')],
        get: () => cfg.coast, set: v => cfg.coast = v, save: 'rasante_costa' },
      { label: () => T('optRunway'), opts: RUNWAYS.map((r, i) => i), names: () => RUNWAYS.map(r => r.name),
        get: () => cfg.runway, set: v => cfg.runway = v, save: 'rasante_pista' },
      // ACANTILADO y ARRANQUE cambian dónde NACE el avión, así que hay que recolocarlo.
      { label: () => T('optCliff'), opts: [false, true], names: () => [T('optNo'), T('optYes')],
        get: () => cfg.cliff, set: v => { cfg.cliff = v; resetPlane(); }, save: 'rasante_acantilado' },
      { label: () => T('optStart'), opts: ['runway', 'air'],
        names: () => [T('optStartRunway'), T('optStartAir')],
        get: () => cfg.start, set: v => { cfg.start = v; resetPlane(); }, save: 'rasante_arranque' },

      { head: 'optSecCiclo' },
      { label: () => T('optMeters'), opts: [800, 1500, 3000, 5000, 8000],
        names: () => ['800 m', '1500 m', '3000 m', '5000 m', '8000 m'],
        get: () => cfg.meters, set: v => cfg.meters = v, save: 'rasante_metros' },

      { head: 'optSecArena' },
      // BUQUE: elegir el blanco es lo que permite probar los tres layouts de zonas sin depender
      // del sorteo. `loadLevel` solo si YA estás en arena: fuera de ese modo movería el nivel de
      // campaña/ciclo por debajo, que es lo último que espera alguien tocando OPCIONES.
      // solo misiones CON buque: las de distancia no tienen layout de zonas que atacar
      { label: () => T('optShip'), opts: SHIP_MISSIONS.slice(), names: () => SHIP_MISSIONS.map(i => MISSIONS[i].goal.ship),
        get: () => shipMissionAt(cfg.arenaShip),
        set: v => { cfg.arenaShip = v; if (gameMode === 'arena' || gameMode === 'pasadas') loadLevel(v, true); },
        save: 'rasante_buque' },

      // DEPURACIÓN: lo único que NO persiste, a propósito. MODO CAMARA deja el mundo sin avanzar
      // solo; encontrárselo puesto al abrir el juego se leería como que el juego se rompió.
      { head: 'optSecDebug' },
      { label: () => T('optHitboxes'), opts: [false, true], names: () => [T('optNo'), T('optYes')],
        get: () => cfg.hitboxes, set: v => cfg.hitboxes = v },
      { label: () => T('optDevcam'), opts: [false, true],
        names: () => [T('optDevcamOff'), T('optDevcamOn')],
        get: () => cfg.devcam, set: v => cfg.devcam = v },
    ];

    // ---------- MEJORAS DEL PICHON ----------
    // Sub-pantalla de OPCIONES con TODO lo que toca al avión. Misma forma de fila que OPT_ROWS
    // ({label, opts, names, get, set, save}), así que las que vinieron de allá se mudaron enteras:
    // conservan su clave de localStorage y nadie pierde su configuración al actualizar.
    //
    // `sw: true` marca las de PRENDER/APAGAR — el render las pinta por color en vez de por palabra.
    // `card` es lo que se lee en la tarjeta de la derecha; las piruetas la sacan de UPGRADES.
    const onOff = () => [T('mejOn'), T('mejOff')];
    const prefCard = (k, label) => ({ name: label(), desc: T('mejd' + k), seq: T('mejk' + k) });

    // INTERRUPTOR MAESTRO de las piruetas: apaga las doce de golpe. Vive con el bloque del Pichón
    // aunque no sea suyo, porque es la respuesta a "quiero que ninguna me salga sin querer".
    const MEJ_MASTER = {
      label: () => T('optMoves'), opts: [true, false], names: onOff, sw: true,
      get: () => cfg.moves, set: v => cfg.moves = v, save: 'rasante_piruetas',
      card: () => prefCard('Moves', () => T('optMoves')),
    };
    // PUESTO DE PILOTO: preferencias de la PERSONA que vuela, no del avión ni del mapa. Todas
    // persisten, porque quien invirtió el eje una vez lo quiere invertido siempre.
    const MEJ_PREFS = [
      // ESQUEMA DE CONTROL: la única fila que cambia cómo se JUEGA y no cómo se ve.
      { label: () => T('optControl'), opts: [CTRL_DIRECT, CTRL_BANK],
        names: () => [T('optCtrlDirect'), T('optCtrlBank')],
        get: () => cfg.control, set: v => { cfg.control = v; run.bankA = 0; }, save: 'rasante_control',
        card: () => prefCard('Control', () => T('optControl')) },
      { label: () => T('optHorizon'), opts: [0, 1, 2, 3],
        names: () => [T('optHzFix'), T('optHzMoves'), T('optHzAll'), T('optHzFree')],
        get: () => cfg.horizon, set: v => cfg.horizon = v, save: 'rasante_horizonte',
        card: () => prefCard('Horizon', () => T('optHorizon')) },
      // MIRA FIJA o MOVIL. Con mando es siempre fija (no tiene con que moverla); en teclado
      // CAPS LOCK la alterna en vivo y escribe en esta misma clave.
      { label: () => T('optAim'), opts: [0, 1], names: () => [T('optAimFixed'), T('optAimFree')],
        get: () => cfg.aim, set: v => { cfg.aim = v; if (!v) mouse.on = false; }, save: 'rasante_mira_modo',
        card: () => prefCard('Aim', () => T('optAim')) },
      // RETICULO: se elige VIÉNDOLO, no leyendo un número — de eso se encarga `preview`.
      { label: () => T('optMira'), opts: MIRA_IDS, names: () => MIRA_IDS.map(String), preview: 'mira',
        get: () => cfg.mira, set: v => cfg.mira = v, save: 'rasante_mira',
        card: () => prefCard('Mira', () => T('optMira')) },
      // EJE Y — UNA SOLA FILA PARA TODO. Antes eran dos (una del arena, una del joystick) y podian
      // contradecirse: con la del arena en SI, la pasada volaba invertida y el pasillo no. Ahora
      // es un solo eje, teclado y stick a la vez, en los cuatro modos. △ la alterna en vivo.
      { label: () => T('optInvY'), opts: [0, 1], names: () => [T('optInvYNo'), T('optInvYYes')],
        get: () => cfg.invY, set: v => cfg.invY = v, save: 'rasante_eje_y',
        card: () => prefCard('InvY', () => T('optInvY')) },
      // ENERGIA: altura y velocidad se intercambian. Estaba en PARTIDA, pero es DESEMPEÑO del
      // avión — lo mismo que todo lo demás de esta pantalla.
      { label: () => T('optEnergy'), opts: [true, false], names: onOff, sw: true,
        get: () => cfg.energy, set: v => cfg.energy = v, save: 'rasante_energia',
        card: () => prefCard('Energy', () => T('optEnergy')) },
      { label: () => T('optNet'), opts: [0, 1, 2],
        names: () => [T('optNetOff'), T('optNetEnter'), T('optNetAlways')],
        get: () => cfg.radarNet, set: v => cfg.radarNet = v, save: 'rasante_red',
        card: () => prefCard('Net', () => T('optNet')) },
    ];

    // PIRUETAS APAGADAS: preferencia de la PERSONA (una clave global), no de la partida. Por eso no
    // entra en el formato de guardado: apagar el jink porque te sale sin querer no es progreso.
    const MOVES_OFF_KEY = 'rasante_piruetas_off';
    function saveMovesOff() {
      try { localStorage.setItem(MOVES_OFF_KEY, JSON.stringify(Object.keys(cfg.movesOff))); } catch (e) { }
    }
    function loadMovesOff() {
      try {
        const ids = JSON.parse(localStorage.getItem(MOVES_OFF_KEY) || '[]');
        if (!Array.isArray(ids)) return;
        // se valida contra UPGRADES por la misma razon que loadOpts valida contra `opts`: una clave
        // vieja o a mano no puede meter en cfg un id de pirueta que no existe.
        for (const id of ids) if (UPGRADES.some(u => u.id === id)) cfg.movesOff[id] = 1;
      } catch (e) { }
    }

    /** Las piruetas que la pantalla MUESTRA: LAS DOCE, siempre.
     *
     *  Antes filtraba por las ganadas cuando `gameMode` era 'campaign'. Se saco (pedido 9/8: "no
     *  veo en opciones mejoras del Pichon") por dos razones. La primera es que esta pantalla solo
     *  se abre desde el LOBBY —la pausa no tiene fila de OPCIONES—, y ahi `gameMode` es lo que
     *  quedo de la partida anterior: quien probaba la campaña y volvia al menu encontraba la lista
     *  VACIA, sin ninguna partida en curso que lo explicara. La segunda es lo que la pantalla ES:
     *  la referencia de que hace cada pirueta y como se teclea, mas su interruptor. Lo que el
     *  Pichon te dio HASTA AHORA se cuenta en el banco entre misiones, que es su lugar. */
    function mejUpgrades() { return UPGRADES; }
    const mejMoveRow = u => ({
      label: () => u.name, opts: [true, false], names: onOff, sw: true,
      get: () => !cfg.movesOff[u.id],
      set: v => { if (v) delete cfg.movesOff[u.id]; else cfg.movesOff[u.id] = 1; saveMovesOff(); },
      card: () => u,
    });
    /** Las filas, armadas en vivo: cuáles se ven depende del modo y de lo ganado, y eso no lo puede
     *  saber un array estático. Los índices son estables mientras la pantalla está abierta — no se
     *  gana una pirueta desde un menú. */
    function mejRows() {
      return [
        // el encabezado dice PIRUETAS y no BANCO a proposito: EL BANCO DEL PICHON es la pantalla
        // donde se ELIGE una entre mision y mision. Esta es la lista de las doce, y llamarlas
        // igual hacia esperar aca la eleccion que no esta.
        { head: () => T('mejSecPiruetas') },
        MEJ_MASTER,
        ...mejUpgrades().map(mejMoveRow),
        { head: () => T('mejSecPuesto') },
        ...MEJ_PREFS,
      ];
    }
    let mejSel = 1;   // arranca en el maestro: la fila 0 es el encabezado
    // El cursor NO se para en encabezados ni en los rotulos de columna. Si se para en las filas de
    // CONTROLES aunque no se puedan cambiar: son las unicas de solo lectura, y salteandolas la
    // ventana de scroll pasaba de largo por encima de toda la seccion — quedaba una lista que se
    // ve al vuelo pero en la que es imposible detenerse a LEER, que es su unico proposito.
    const isHead = i => { const r = OPT_ROWS[i]; return !!(r.head || r.cols || r.note); };
    let optRow = OPT_ROWS.findIndex(r => !r.head);   // el cursor nunca se para en un encabezado

    /** Mueve el cursor SALTEANDO encabezados. Sin esto la lista tendría paradas muertas. */
    function optNav(dir) {
      let i = optRow;
      for (let n = 0; n < OPT_ROWS.length; n++) {
        i = (i + dir + OPT_ROWS.length) % OPT_ROWS.length;
        if (!isHead(i)) { optRow = i; return; }
      }
    }
    /** Cambia el valor de UNA fila y lo persiste. Lo comparten OPCIONES y MEJORAS DEL PICHON: las
     *  filas tienen la misma forma en las dos pantallas, y duplicar esto era garantizar que un dia
     *  una de las dos dejara de guardar. */
    function rowChange(r, dir) {
      if (!r || !r.opts) return;   // encabezados y filas de CONTROLES: se leen, no se cambian
      let i = r.opts.findIndex(o => o === r.get()); if (i < 0) i = 0;
      i = (i + dir + r.opts.length) % r.opts.length;
      r.set(r.opts[i]);
      if (r.save) { try { localStorage.setItem(r.save, JSON.stringify(r.opts[i])); } catch (e) { } }
    }
    function optChange(dir) { rowChange(OPT_ROWS[optRow], dir); }
    /** ENTER en OPCIONES. Hay filas que ABREN una sub-pantalla; el resto sale, como siempre. */
    function optConfirm() {
      const r = OPT_ROWS[optRow];
      if (r && r.open === 'mejoras') {
        mejSel = mejRows().findIndex(x => !x.head);
        setState('mejoras'); beep(600, 0.06, 'square', 0.05);
        return;
      }
      setState('modeselect'); beep(400, 0.06, 'square', 0.05);   // el ENTER de siempre: salir
    }

    /** Mueve el cursor de MEJORAS DEL PICHON salteando encabezados. */
    function mejNav(dir) {
      const rows = mejRows();
      let i = mejSel;
      for (let n = 0; n < rows.length; n++) {
        i = (i + dir + rows.length) % rows.length;
        if (!rows[i].head) { mejSel = i; return; }
      }
    }
    function mejChange(dir) { rowChange(mejRows()[mejSel], dir); }
    function mejBack() { setState('options'); beep(400, 0.06, 'square', 0.05); }

    /** Relee lo guardado. Se valida contra `opts`: un valor viejo o corrupto no puede meter en
     *  `cfg` algo que la fila no ofrece, que es como se cuelan los estados imposibles. */
    function loadOpts() {
      // EJES VIEJOS: `rasante_arena_inv` (eje del arena) y `rasante_pad_y` (eje del stick) eran dos
      // ajustes que podían contradecirse, y de hecho se contradecían — quien tenía el del arena en
      // SÍ volaba la pasada invertida y el pasillo no. No se migran: no hay forma correcta de
      // fusionar dos valores que se pisan, y quien los tenía puestos tenía justamente el problema.
      // Se BORRAN para que no queden claves muertas ocupando el almacenamiento.
      try { localStorage.removeItem('rasante_arena_inv'); localStorage.removeItem('rasante_pad_y'); } catch (e) { }
      // Las de MEJORAS DEL PICHON entran acá aunque vivan en otra pantalla: lo que decide si una
      // fila se relee es que tenga `save`, no dónde se dibuja.
      for (const r of [...OPT_ROWS, MEJ_MASTER, ...MEJ_PREFS]) {
        if (!r.save) continue;
        try {
          const raw = localStorage.getItem(r.save);
          if (raw === null) continue;
          const v = JSON.parse(raw);
          if (r.opts.some(o => o === v)) r.set(v);
        } catch (e) { }
      }
      loadMovesOff();   // esta no es una fila: es una lista de ids, con su propia clave
    }

    // ====================================================================================

    // aviones seleccionables — sprites embebidos como data URI (artifact autocontenido)
    // Cada avion tiene DOS artes: `src` (ilustracion grande, para la pantalla de seleccion) y
    // `sheet` (sprite sheet HORNEADO desde el modelo 3D low-poly: 9 frames de 56x32, alabeo
    // -60..+60 en pasos de 15, frame 4 = nivelado) que es el que VUELA — pixel art coherente
    // con el juego y banking real por frame. Regenerar: npx electron tools/bake_planes_run.js
    let selPlane = CAMPAIGN_PLANE;   // el carrusel abre SIEMPRE en el Skyhawk (ver CAMPAIGN_PLANE)



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
    // PPAL_ROT segundos empieza a rotar al azar, con un cruce suave de PPAL_FADE. El tiempo lo
    // pregunta por FOTO (screens.ppalSeg): la portada del escuadron dura mas que las demas.
    const PPAL_ROT = 8, PPAL_FADE = 0.9;
    let ppalIdx = 0, ppalPrev = 0, ppalT = 0, ppalFade = 1;
    // OJO: systems/audio.js tiene su propia lista de estados de lobby (para la MUSICA) y tiene que
    // coincidir con esta. Son dos porque responden preguntas distintas —esta decide si rota el
    // fondo del lobby— pero si divergen, se nota: o el fondo se congela o la musica se corta.
    const inLobby = () => S.state === 'title' || S.state === 'modeselect' || S.state === 'menu' || S.state === 'options'
      || S.state === 'mejoras' || S.state === 'campmenu' || S.state === 'quickmenu' || S.state === 'pruebas' || S.state === 'cines'
      || S.state === 'maniobras' || S.state === 'mvvars'
      || S.state === 'misiones' || S.state === 'saves';

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
    // HISTORIA: el estado vive en el store `dlg` (core/dialogue.js). Aca solo queda la costura de
    // prueba: con ?scene=<ID> el juego arranca DENTRO de esa escena y al terminarla vuelve al menu
    // en vez de encadenar una mision. Misma idea que ?qa y ?no3d — explicita y sin efecto en el
    // juego normal (sin el parametro, sceneProbe es null y nada cambia).
    const sceneProbe = (() => {
      try {
        const id = new URLSearchParams(location.search).get('scene');
        return id && SCENES[id] ? SCENES[id] : null;
      } catch (e) { return null; }
    })();
    // SONDA DE LA PASADA (SPEC_MODO_PASADA §7) — QUITAR al cerrar el modo. Dos formas, y la
    // diferencia importa:
    //   ?pasada=<n>            arranca DERECHO en la pasada de la mision n, sin menu ni pasillo.
    //                          Es la que usa el fixture: sirve para medir bandas, ristras y sapitos
    //                          sin volar un nivel entero cada vez.
    //   ?pasada=<n>&pasillo    JUEGA el pasillo de esa mision y lo deja desembocar en la pasada.
    //                          Es la unica forma de ver la TRANSICION SIN CORTE (RF-01) andando —
    //                          con ?qa el pasillo dura segundos. Es un parametro que el spec no
    //                          pide (anotado en §10): sin el, la transicion no se puede observar.
    // Sin el parametro, pasadaProbe es null y nada cambia.
    const pasadaProbe = (() => {
      try {
        const v = new URLSearchParams(location.search).get('pasada');
        if (v === null) return null;
        const n = +v | 0;
        return {
          mission: SHIP_MISSIONS.includes(n) ? n : SHIP_MISSIONS[0],
          viaPasillo: /\bpasillo\b/.test(location.search),
        };
      } catch (e) { return null; }
    })();
    // ?pulso[&pasillo]: EL PULSO por sonda (PLAN_EL_PULSO Q0). `n` es la mision con buque; con
    // &pasillo se vuela el nivel y la prueba llega sola al final — que es la unica forma de ver
    // que NO hay corte (el buque de la prueba es el mismo que venia creciendo en el horizonte).
    // Sin el parametro, pulsoProbe es null y nada cambia.
    const pulsoProbe = (() => {
      try {
        const v = new URLSearchParams(location.search).get('pulso');
        if (v === null) return null;
        const n = +v | 0;
        return {
          mission: SHIP_MISSIONS.includes(n) ? n : SHIP_MISSIONS[0],
          viaPasillo: /\bpasillo\b/.test(location.search),
        };
      } catch (e) { return null; }
    })();
    // ?mision=<id>: LA MISION SUELTA, por URL (PLAN_MISIONES_FASES S0). `<id>` es el de
    // data/missions.js ('m4') o su numero. Con &historia se pasa por el guion largo de la mision;
    // sin el se va derecho al despegue, que es para lo que existe. Con ?qa dura segundos.
    // Es la MISMA puerta que aprieta el selector — no un atajo — asi que si se rompe una, se
    // rompen las dos y el fixture de S3 lo grita. Sin el parametro, misionProbe es null.
    const misionProbe = (() => {
      try {
        const v = new URLSearchParams(location.search).get('mision');
        if (v === null) return null;
        const i = misIdx(/^\d+$/.test(v) ? +v : v);
        return i < 0 ? null : { i, historia: /\bhistoria\b/.test(location.search) };
      } catch (e) { return null; }
    })();
    // SONDA DEL PODER RASANTE (SPEC_PODER_RASANTE §4, fase RA0) — QUITAR al cerrar el plan.
    //   ?rasante   arranca el pasillo con la BARRA LLENA. Sin esto, probar el resorte cuesta
    //              RAS_CHARGE_S segundos pegado al agua en cada corrida del fixture — y pegado al
    //              agua a mano, que es justo lo que el fixture no puede hacer bien.
    // Sin el parametro, rasanteProbe es false y nada cambia: la barra arranca vacia como siempre.
    const rasanteProbe = (() => {
      try { return /\brasante\b/.test(location.search); } catch (e) { return false; }
    })();

    // SONDA DE LAS CHARLAS EN VUELO (SPEC_CHARLAS_VUELO §4, fase C0) — QUITAR al cerrar el plan.
    //   ?charla=<ESCENA_ID>   arranca POR LA PATRIA y arma esa charla a los 300 m de vuelo.
    // POR LA PATRIA y no una mision con tramos: la sonda existe para probar LA BURBUJA, y en un
    // modo infinito no hay objetivo que se cumpla ni climax que interrumpa — la charla se puede
    // mirar entera y despues seguir volando. Los 300 m son para que caiga con el avion ya
    // volando y no arriba de la carrera de despegue.
    // Sin el parametro, charlaProbe es null y nada cambia.
    const charlaProbe = (() => {
      try {
        const id = new URLSearchParams(location.search).get('charla');
        return id && SCENES[id] ? id : null;
      } catch (e) { return null; }
    })();
    let charlaArmed = false;   // la sonda arma UNA sola, no una por cuadro

    // SONDA DE LA COLA (PLAN_HARRIERS_PERSECUCION §3, fase H0) — QUITAR al cerrar el plan.
    //   ?caza          arma UN duelo apenas arranca el pasillo, con aviso por radio.
    //   ?caza=mudo     el mismo duelo SIN aviso por radio (el canon del §2: a veces no llega).
    //   ?caza=manso    INERTE. Apagaba las rafagas letales, y el Harrier ya no dispara nunca (ver
    //                  el encabezado de systems/caza.js). Se acepta todavia porque las sondas y
    //                  las capturas viejas lo pasan; no cambia nada.
    // Sin el parametro, cazaProbe es null y nada cambia. El duelo TAMBIEN se arma a mano con
    // __czstart() desde la consola, que es lo que usan las capturas.
    const cazaProbe = (() => {
      try {
        const v = new URLSearchParams(location.search).get('caza');
        return v === null ? null : { mudo: /mudo/.test(v), manso: /manso/.test(v) };
      } catch (e) { return null; }
    })();
    // SONDA DE LA PERSECUCION (PLAN B, fase N0) — QUITAR al cerrar el plan. `?persec` arranca la
    // persecucion apenas empieza el pasillo. El modo de menu propio es N2; hasta entonces esta es
    // la unica puerta de entrada, y es a proposito: N0/N1 se juzgan volando, no navegando menus.
    const persecProbe = (() => {
      try { return new URLSearchParams(location.search).has('persec'); } catch (e) { return false; }
    })();
    // SONDA `?zigzag=1|2` (PLAN_PASILLO_ZIGZAG §5) — QUITAR al cerrar el item. Prende el preset
    // del carril curvo al cargar, para poder mirar una curva en POR LA PATRIA sin editar datos.
    // Escribe `cfg.zigzag`, o sea la MISMA causa que la fila del menu: la sonda ejercita el
    // camino del juego y no uno paralelo.
    (() => {
      try {
        const v = new URLSearchParams(location.search).get('zigzag');
        if (v !== null) cfg.zigzag = Math.max(0, Math.min(2, parseInt(v, 10) || 1));
      } catch (e) { /* sin URL (tests): el zigzag queda apagado, que es el default */ }
    })();
    let persecArmed = false;
    let cazaArmed = false;   // la sonda arma UNO solo, no uno por cuadro
    let cazaCalma = false;   // sonda: pasillo vacio para poder mirar el duelo (ver el update)
    let czAlto = null;       // sonda: altura clavada, para medir la regla del ras (ver __czalto)
    let czAltoX = 0;         // sonda: y el rumbo con ella — sin esto la deriva se lee como quiebre
    let czBrk = 0;           // sonda: segundos de quiebre lateral sostenido (ver __czquiebre)
    let czSpd = null;        // sonda: velocidad clavada, para medir la velocidad de cierre (ver __czspd)
    let czMv = null;         // sonda: pirueta inyectada por un cuadro (ver __czmv)
    let machPrev = 0;      // velocidad del cuadro anterior: de aca sale el CRUCE transonico
    let machHold = null;   // sonda de LO TRANSONICO (QUITAR): fija velocidad/alabeo cuadro a cuadro
    let altHold = null;    // sonda de LOS RESTOS (QUITAR): fija la altura cuadro a cuadro
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
    // TODA la configuracion elegida en OPCIONES sobrevive entre sesiones (menos DEPURACION, ver
    // OPT_ROWS). Antes esto eran tres bloques copiados a mano, cada uno con su propio chequeo de
    // rango — y uno de ellos tenia un bug: `+localStorage.getItem()` sobre una clave AUSENTE da 0,
    // y 0 era un valor valido, asi que el default no sobrevivia al primer arranque. Validar contra
    // `opts` (la misma lista que ofrece la fila) hace que ese error ya no se pueda escribir.
    loadOpts();

    let fogWarned = false;   // el aviso de entrada al banco sale UNA vez por banco
    function reset() {
      callarRadio();   // una linea de radio a medio decir no puede sobrevivir a la corrida
      resetRun();       // toda la corrida (velocidad, nafta, rachas, armas, spawn…) a su estado inicial
      resetPlane();     // el avion a la posicion de arranque
      resetStats();     // los contadores del recuento final
      clearWorld();     // vacia el campo de obstaculos, balas, particulas…
      wingmv.limpiar();  // …y saca de escena a los actores: una pirueta ajena no sobrevive al reset
      teatro.limpiar();  // …y los tiros de utileria de EL TEATRO AEREO, por el mismo motivo
      momentum.resetMomentum();
      tempo.resetTempo();
      chancha.resetChancha();   // el poder es de la CORRIDA: se pide una vez y sobrevive al relevo
      rasante.resetRasante();   // la barra del RASANTE es de la corrida: se gana volando bajo
      if (rasanteProbe) rasante.cargar();   // ?rasante (QUITAR): arranca con la barra llena
      veilOut = 0; veilPrev = '';   // el telon del cordon, cerrado y sin reloj
      arena.resetArena();
      pasada.resetPasada();
      pulso.resetPulso();
      caza.resetCaza();   // LA COLA: una corrida nueva no hereda el Harrier de la anterior
      charla.resetCharla(); charlaFin = false;   // ni la charla a medio decir de la corrida anterior
      persec.resetPersec();   // PERSECUCION: idem con el lider
      // …y en el MODO PERSECUCION se arma de entrada, con el roster de la corrida como pool de
      // lideres. No es una mecanica que aparece: es de lo que se trata la partida.
      // PERSECUCION: se arma por MODO (N2, infinito) o por DATO DE MISION (N3, `persec` en
      // data/missions.js). Es el mismo criterio que `caza`: la aparicion es dato del nivel y no una
      // regla escondida en el sistema.
      if (gameMode === 'persec') persec.startPersec({ infinito: true });
      else if (cfg.persec) persec.startPersec();
      // EL PULSO se CONFIGURA acá: el sistema no puede mirar la campaña ni la libreta del Pichón
      // (nadie llama hacia arriba), y quien dispara la entrada es flight.js, que tampoco las
      // conoce. `t01` = avance de campaña normalizado — la única perilla de dificultad que hay.
      pulso.setCfg({
        t01: MISSIONS.length > 1 ? curLevel / (MISSIONS.length - 1) : 0,
        campaign: conLibreta(), owned: pichon, off: cfg.movesOff,
      });
      // NORMA DE CAMPAÑA (3/8, GUION_2): con roster, el relevo es un AVERIADO que vuelve a la
      // base (nadie muere por gameplay); sin roster, el relevo arcade de siempre (PATRIA caido).
      // El roster es POR MISION (los Fieles vivos segun el guion); FIELES queda de respaldo.
      // …y en las HERRAMIENTAS (S.test: PRUEBAS y el SELECTOR DE MISIONES) tambien, que es la mitad
      // de "la mision suelta se juega como en campaña" (PLAN_MISIONES_FASES S0): sin el roster, el
      // relevo cambia de tono y probar la mision dejaria de parecerse a jugarla.
      squad.setRoster(gameMode === 'campaign' || S.test ? (curMission().roster || FIELES) : null);
      resetFog(); fogWarned = false;   // los bancos de niebla se re-sortean en cada corrida
      // el ESCUADRON de la corrida: cfg.squad aviones y vos de lider. Vive en `run` (no en el
      // sistema) porque lo leen HUD + relevo + este archivo.
      run.squad = run.lives = cfg.squad;
      squad.resetSquad();
      toT = 0; toCount = 4;
      // LA CAMARA ARRANCA DONDE ESTA EL AVION, no en una constante. Con ACANTILADO el avion nace
      // sobre la meseta (`resetPlane`: PORT_H + 1.2 = 16.2 m) y la camara quedaba clavada en 4,
      // o sea ONCE METROS POR DEBAJO del borde — y como el raster del mar decide "esto es pared
      // de acantilado" comparando la altura de camara contra la meseta, la pantalla entera se
      // llenaba de roca y no se veia ni la pista. Es un bug viejo de la opcion ACANTILADO, no del
      // callejon: se reproduce igual con el zigzag apagado.
      cam.x = 0; cam.y = (cfg.cliff ? PORT_H : 0) + 4;
    }

    // (el boton tactil de misil se quito: tapaba la barra de combustible. En tactil el misil
    // queda por el gesto de click derecho / boton del joystick; si hace falta de nuevo, volvera
    // como zona de toque sin chrome encima del HUD.)

    // reproductor de música: visible solo cuando suena una pista del reproductor y se puede cambiar
    // — o sea en juego (no lobby ni historia) y en los modos que no son campaña. Se togglea en el loop.
    const playerEl = document.getElementById('player');
    const canPickMusic = () => gameMode !== 'campaign'
      && S.state !== 'title' && S.state !== 'modeselect' && S.state !== 'menu' && S.state !== 'options'
      && S.state !== 'mejoras' && S.state !== 'campmenu' && S.state !== 'quickmenu' && S.state !== 'pruebas' && S.state !== 'cines' && S.state !== 'misiones' && S.state !== 'saves' && S.state !== 'story'
      && S.state !== 'epilogue';

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
    // EL CURSOR, EN DOS COORDENADAS QUE NO SON LA MISMA:
    //
    //   sx, sy  DONDE ESTA EN PANTALLA. Es donde va DIBUJADO el reticulo, y tiene que caer exacto
    //           bajo el cursor fisico o apuntar se vuelve imposible.
    //   x, y    A QUE LE ESTAS APUNTANDO. Es la coordenada que hay que desproyectar para saber que
    //           punto del MUNDO quedo debajo, y de ahi salen las balas y el guiado del misil.
    //
    // Son distintas porque el mundo se dibuja ROTADO (horizonte giratorio) y el reticulo NO: el
    // reticulo se dibuja despues del restore, junto al avion, que hace de cabina. Deshacer el giro
    // sirve para saber que hay abajo del cursor; usar ESA coordenada para dibujar arrastraba el
    // reticulo lejos del mouse — 93 px medidos con el mundo a 25°, o sea imposible de apuntar.
    // El zoom de camara, en cambio, afecta a las dos: el reticulo se dibuja dentro del contexto
    // escalado, asi que hay que des-escalarlo igual.
    function viewMouse() {
      let x = mouse.x, y = mouse.y;
      if (camZoomOn()) {
        const c = proj(plane.x, plane.y, PZ);
        x = c.x + (x - c.x) / camZ; y = c.y + (y - c.y) / camZ;
      }
      const sx = x, sy = y;                      // ← lo que se DIBUJA
      const hz = hzWorld();
      if (hz) {                                  // ← lo que se APUNTA
        const ca = Math.cos(-hz), sa = Math.sin(-hz), dx = x - W / 2, dy = y - H / 2;
        x = W / 2 + dx * ca - dy * sa; y = H / 2 + dx * sa + dy * ca;
      }
      return { x, y, sx, sy, on: mouse.on };
    }

    // ACERCAMIENTO al CONTROL LIBRE: cuando el escuadron sale de plano, la camara "se mete" un
    // poco al avion. NO se escala el raster (eso parte el mar en rayas — ver CAM_ZOOMS): se
    // agranda solo el sprite del jugador, un empujon que sube y vuelve con la salida.
    function squadZoom() {
      const ex = squad.exitState();
      if (ex === null) return 1;
      return 1 + 0.10 * Math.sin(Math.min(1, ex / squad.EXIT_T) * Math.PI);
    }

    // Cablea el input. core/input.js escucha teclado/mouse/tactil y actualiza inp/mouse/pointer;
    // las ACCIONES semanticas (navegar menu, confirmar, tonel, misil, camara) vuelven aca como
    // callbacks — el estado de menu/camara (modeSel, selPlane, optRow, camMode) vive aca,
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
      // VOLVER: desde la eleccion de avion de un modo suelto se vuelve a JUEGO RAPIDO, que es de
      // donde se vino — mandarlo al selector principal obligaria a bajar el mismo escalon otra vez.
      // Desde cualquier otro lado (historia, submenu de campaña, modo camara) va al selector.
      escToMenu: () => {
        // en PRUEBAS la salida es el CATALOGO, no el menu principal: el modo es elegir momento
        // tras momento, y hacerte volver a entrar por la puerta cada vez lo vuelve inutilizable.
        if (S.test) { salirTest(); beep(400, 0.06, 'square', 0.05); return; }
        const suelto = gameMode === 'cycle' || gameMode === 'survival' || gameMode === 'arena' || gameMode === 'pasadas';
        setState(S.state === 'menu' && suelto ? 'quickmenu' : 'modeselect');
        beep(400, 0.06, 'square', 0.05);
      },
      prbNav: dir => prbNav(dir),
      prbConfirm: () => prbConfirm(),
      cinNav: dir => cinNav(dir),
      cinConfirm: () => cinConfirm(),
      mvNav: dir => mvNav(dir),
      mvConfirm: () => mvConfirm(),
      mvVarNav: dir => mvVarNav(dir),
      mvVarConfirm: () => mvVarConfirm(),
      mvBack: () => { setState('maniobras'); beep(400, 0.06, 'square', 0.05); },
      misNav: dir => misNav(dir),
      misConfirm: () => misConfirm(),
      misToggleHist: () => misToggleHist(),
      // PAUSA (la logica vive arriba; el input solo enruta). isPaused es el predicado que
      // core/input.js usa para desviar el teclado/el mando al menu en vez de al vuelo.
      isPaused: () => paused,
      pauseToggle: () => pauseToggle(),
      pauseNav: dir => pauseNav(dir),
      pauseConfirm: () => pauseConfirm(),
      pauseBack: () => pauseBack(),
      // submenu de HISTORIA y lista de partidas guardadas
      campNav: dir => campNav(dir),
      quickNav: dir => quickNav(dir),
      quickConfirm: () => quickConfirm(),
      campConfirm: () => campConfirm(),
      savesNav: dir => {
        const n = saves.listSaves().length;
        if (n) savesSel = (savesSel + dir + n) % n;
        beep(520, 0.05, 'square', 0.04);
      },
      savesConfirm: () => { const r = saves.listSaves()[savesSel]; if (r) loadSave(r); },
      savesBack: () => { setState('campmenu'); beep(400, 0.06, 'square', 0.05); },
      // EL BANCO DEL PICHON (estado 'upgrade'): elegir la mejora entre misiones
      upgNav: dir => upgNav(dir),
      upgConfirm: () => upgConfirm(),
      // OPCIONES: por ahora una sola fila (idioma), asi que izquierda/derecha rotan el idioma
      optNav: dir => { optNav(dir); beep(500, 0.04, 'square', 0.03); },
      optChange: dir => { optChange(dir); beep(560, 0.05, 'square', 0.04); },
      optConfirm,
      mejNav: dir => { mejNav(dir); beep(500, 0.04, 'square', 0.03); },
      mejChange: dir => { mejChange(dir); beep(560, 0.05, 'square', 0.04); },
      mejBack,
      startTitle: () => { if (S.state !== 'title') return; modeSel = 0; setState('modeselect'); beep(620, 0.07, 'square', 0.05); },
      planeNav: dir => { selPlane = (selPlane + dir + PLANES.length) % PLANES.length; beep(dir < 0 ? 520 : 600, 0.05, 'square', 0.04); },
      roll: dir => startRoll(dir),
      // COMBO: la SECUENCIA llega cruda ('lll', 'drul'...) desde dirTap (core/input.js), que ya
      // probo de la mas larga a la mas corta. Aca se resuelve QUE maniobra es.
      // DEVUELVE true si la consumio — el detector lo usa para saber si limpiar el buffer.
      //
      // NINGUNA MANIOBRA SE HACE CON DOS TOQUES. Antes los 16 pares posibles estaban ocupados, o
      // sea que NO existia forma de tocar dos direcciones seguidas sin ejecutar algo — y como las
      // teclas de combo son las de volar, el avion "se manejaba solo": bombear gas (↑↑) lanzaba un
      // yo-yo, corregir el rumbo (←→) lanzaba un S-turn. Con un minimo de tres toques, el vuelo
      // normal ya no produce secuencias completas.
      //
      // En particular: bombear gas da '↑↑↑↑↑' y NINGUNA maniobra usa repeticion vertical, asi que
      // ese caso —el mas molesto— queda descartado por construccion.
      //
      // LAS SECUENCIAS DIBUJAN LA MANIOBRA:
      //   ↓→↑←  la vuelta completa del tonel barril (es una O)
      //   ↑↓↑   el yo-yo alto sube, pica y vuelve a subir
      //   ↓←←   picar y empujar dos veces al mismo lado: el quiebre
      //
      // CADA MANO TIENE SU FAMILIA. Minusculas = stick IZQUIERDO (o flechas), mayusculas = stick
      // DERECHO (o WASD con la mira fija · Q/E · R/F). Lo que ROLA se pide con la mano que rola;
      // lo que ZIGZAGUEA —break turn, S-turn, jink, los yo-yos— se queda donde estaba, en la mano
      // que esquiva. No es decoracion: son las teclas de VOLAR, asi que poner los rolidos en el
      // stick izquierdo era garantizar que salieran solos esquivando.
      //
      // REGLA QUE SOSTIENE TODO: ninguna secuencia puede ser PREFIJO de otra. Si '↓←' disparara
      // algo, el circulo que empieza con '↓←' nunca llegaria al cuarto toque. La coincidencia por
      // sufijo mas largo (core/input.js) resuelve el caso contrario —que una corta sea el FINAL de
      // una larga, como '←←' dentro de '↓←←'— pero los prefijos hay que evitarlos por diseño.
      combo: seq => {
        if (S.state !== 'play') return false;
        // EL BANCO DEL PICHON: en campaña solo disparan las piruetas APRENDIDAS (el guion las
        // inventa una por una). El tonel clasico no pasa por aca (startRoll) y queda siempre.
        // Fuera de campaña no cambia nada: rige cfg.moves como siempre.
        //
        // La segunda mitad de la regla es MEJORAS DEL PICHON: apagar una pirueta desde el menu la
        // saca del aire aunque la tengas ganada. Las dos viven juntas en moveAllowed().
        // AVERIAS: en el escalon CRITICO no salen piruetas. El avion queda en "lo basico" —
        // volar y disparar— que es exactamente lo que pidio el modelo de daño progresivo.
        if (!damage.fx().moves) return false;
        const mvOk = id => moveAllowed(id,
          { campaign: conLibreta(), owned: pichon, off: cfg.movesOff });
        switch (seq) {
          // ---- STICK DERECHO (mayusculas): LAS QUE ROLAN ----
          // Un avion rola con la muñeca, no con el timon, y en el mando la muñeca que rola es la
          // del stick derecho — el mismo que ya hace el giro libre del horizonte. Estaban en el
          // izquierdo por herencia, y ahi competian con esquivar: '←←←' salia solo tratando de
          // pasar entre dos cosas. Ahora el stick izquierdo NO produce ningun rolido.
          case 'LLL': return startRoll(-1);                    // el tonel clasico (camino legado)
          case 'RRR': return startRoll(1);
          case 'DRUL': return mvOk('barrel') && moves.startMove('barrel', 1);    // la O dibujada con el stick que rola
          case 'DLUR': return mvOk('barrel') && moves.startMove('barrel', -1);
          case 'dLL': return mvOk('spin') && moves.startMove('spin', -1);      // picas con el izquierdo, rolas con el derecho
          case 'dRR': return mvOk('spin') && moves.startMove('spin', 1);
          // ---- LOS DOS STICKS: EL ASCENSOR ----
          // Mirar hacia donde vas a ir y despues empujar dos veces para alla. Es el unico gesto del
          // juego que usa las dos manos, y por eso es el que mueve el avion de BANDA de altura en
          // vez de hacerle una figura.
          case 'Ddd': return mvOk('mask') && moves.startMove('mask', 1);       // mirar abajo + picar: pegate al piso
          case 'Uuu':                                          // mirar arriba + trepar: subi de banda
            return plane.y >= RADAR_ALT - CLIMB_NEAR
              ? mvOk('climbmax') && moves.startMove('climbmax', 1, FLY_TOP)    // ya estas contra el radar: cruzalo
              : mvOk('climb') && moves.startMove('climb', 1, RADAR_ALT);       // subi hasta el borde y quedate ahi
          // CONTEXTUALES por ALTURA: la misma secuencia hace lo que tiene sentido donde estas.
          // Alto hay cielo debajo para tirarse; bajo no queda mas que pegarse al piso.
          case 'udd': { const id = plane.y > MV_HI ? 'splits' : 'mask'; return mvOk(id) && moves.startMove(id, 1); }
          // Bajo trepar es la jugada; alto ya tenes altura para colgarte arriba.
          case 'duu': { const id = plane.y < MV_LO ? 'popup' : 'hiyo'; return mvOk(id) && moves.startMove(id, 1); }
          case 'dud': return mvOk('loyo') && moves.startMove('loyo', 1);       // ↓↑↓  pica, sube, pica
          case 'udu': return mvOk('hiyo') && moves.startMove('hiyo', 1);       // ↑↓↑  sube, pica, sube
          case 'dll': return mvOk('breakt') && moves.startMove('breakt', -1);  // ↓←←  picar y empujar al lado
          case 'drr': return mvOk('breakt') && moves.startMove('breakt', 1);
          case 'lrl': return mvOk('sturn') && moves.startMove('sturn', -1);    // ←→←  el barrido en S
          case 'rlr': return mvOk('sturn') && moves.startMove('sturn', 1);
          case 'ulr': return mvOk('jink') && moves.startMove('jink', -1);      // ↑←→  sacudida erratica
          case 'url': return mvOk('jink') && moves.startMove('jink', 1);
        }
        return false;
      },
      launchMissile: () => tryLaunchMissile(),
      // EL PULSO: los toques de la prueba. Son los MISMOS tokens del detector de combos, asi que
      // el examen se teclea con el vocabulario que el pasillo enseño (plan §2, regla 1).
      pulsoTap: tok => { if (S.state === 'pulso') pulso.tap(tok); },
      // VIRAJE DE COMBATE: solo existe en el ARENA. En el pasillo la media vuelta no significa
      // nada (es un scroll lateral: no hay para donde darse vuelta), asi que la tecla no hace nada.
      combatTurn: () => { if (S.state === 'arena' && arena.active()) arena.combatTurn(); },
      // REPARTO DE ENERGIA: tambien solo del ARENA. En el pasillo no hay nada que repartir —
      // el turbo sale del combustible y el cañon no calienta distinto segun donde mires.
      cyclePip: () => { if (S.state === 'arena' && arena.active()) arena.cyclePip(); },
      cycleCamera: () => {
        // en el ARENA la misma tecla conmuta cabina ↔ tercera persona (decision del prompt:
        // toggle EN VIVO, no una opcion de menu)
        if (S.state === 'arena') { arena.toggleView(); return; }
        if (S.state === 'pasada') { pasada.toggleView(); return; }
        camMode = (camMode + 1) % CAM_ZOOMS.length;
        beep(440 + camMode * 120, 0.05, 'square', 0.04);
        if (S.state === 'play' || S.state === 'takeoff') popup(W / 2, 58, camMode ? 'CAM ' + CAM_ZOOMS[camMode] + '×' : 'CAM 1×', P.accent);
      },
      // música: tecla 1 / L3 = anterior, tecla 2 / R3 = siguiente. Solo en los modos donde el
      // reproductor está activo — el motor ignora el cambio en historia/lobby.
      trackPrev: () => { if (canPickMusic()) prevTrack(); },
      trackNext: () => { if (canPickMusic()) nextTrack(); },
      // MOMENTUM (tecla 4): LANZA el especial si la barra esta llena, SOLO en el pasillo
      // jugable. El feedback va aca (no en systems/tempo.js) por la misma regla que aimChanged:
      // el sistema devuelve la señal y el orquestador pone beep + popup — barra incompleta,
      // un beep grave y nada mas.
      tempoToggle: () => {
        if (S.state !== 'play' || cfg.devcam) return;
        const r = tempo.toggle();
        if (r === 'empty') { beep(140, 0.09, 'square', 0.05); return; }
        beep(r === 'on' ? 330 : 520, 0.09, 'square', 0.05, r === 'on' ? -160 : 160);   // slide abajo = el tiempo cae
        popup(W / 2, 58, r === 'on' ? T('tempoOn') : T('tempoOff'), P.accent);
      },
      chanchaCall: () => pedirChancha(),
      /** EL PODER RASANTE (tecla 6). Funcion con nombre y no cuerpo de la accion, por el mismo
       *  motivo que `pedirChancha`: la sonda del fixture tiene que apretar EXACTAMENTE lo que
       *  aprieta el jugador. Si llamara a `rasante.toggle()` por su cuenta se saltearia los gates
       *  que viven aca —el estado del juego y el modo— y probaria media mecanica. */
      rasanteToggle: () => lanzarRasante(),
      // EL PODER DEL RECURSO, uno por mundo: en el ARENA reparte energia, en el PASILLO llama a LA
      // CHANCHA. Comparten UN boton del mando (cruceta ARRIBA) porque son la misma pregunta
      // —administrar lo que te queda— y no coexisten nunca. El teclado los tiene separados ([G] y
      // [5]) porque ahi no falta espacio; lo que importa es que ninguna accion sea de un solo
      // aparato. Se despacha ACA y no en input.js: input no sabe de modos, y llamar a los dos a
      // ciegas hacia que pedir energia en el arena disparara la radio de la Chancha.
      modePower: () => {
        if (S.state === 'arena') { if (arena.active()) arena.cyclePip(); return; }
        if (S.state === 'play') pedirChancha();
      },
      // MIRA fija/movil: la alterna CAPS LOCK (teclado) y tambien la fila de OPCIONES. El aviso
      // en pantalla es el mismo por las dos vias — si no, tocar la tecla no daba ninguna señal.
      aimChanged: free => {
        beep(free ? 440 : 660, 0.05, 'square', 0.05);
        if (S.state === 'play' || S.state === 'momentum') popup(W / 2, 58, free ? T('aimFree') : T('aimFixed'), P.accent);
        try { localStorage.setItem('rasante_mira_modo', cfg.aim); } catch (e) { }
      },
      // △ del mando: da vuelta EL eje Y —uno solo, teclado y stick, todos los modos— y lo GUARDA.
      // Escribe la misma fila de OPCIONES y la misma clave, asi que las dos vias no se pisan.
      throttleInvert: () => {
        cfg.invY = cfg.invY ? 0 : 1;
        try { localStorage.setItem('rasante_eje_y', JSON.stringify(cfg.invY)); } catch (e) { }
        beep(cfg.invY ? 440 : 660, 0.05, 'square', 0.05);
        if (S.state === 'play' || S.state === 'momentum' || S.state === 'arena' || S.state === 'pasada')
          popup(W / 2, 58, cfg.invY ? T('thrDown') : T('thrUp'), P.accent);
      },
    });


    const clouds = Array.from({ length: 6 }, () => ({ x: Math.random() * W, y: 8 + Math.random() * 34, w: 24 + Math.random() * 40 }));
    const isles = Array.from({ length: 4 }, (_, i) => ({ x: i * 90 + Math.random() * 50, w: 40 + Math.random() * 70, h: 5 + Math.random() * 10, seed: (Math.random() * 9999) | 0 }));

    // ---------- FONDOS por clima (assets/world/terrain_back) ----------
    // Cada imagen se ancla por su fila de HORIZONTE: esa linea cae en HOR, y todo lo que la imagen
    // tenga por debajo queda tapado por el mar/terreno que el juego dibuja despues. Reemplazan al
    // degrade+sol procedurales en 2D y en el telon 3D. Vaciar TBACK en el build web
    // (build_web.py) → vuelve el cielo procedural (pesan ~5 MB cada una).
    //
    // `hor` ES POR IMAGEN y no una constante global como antes. Era 0.72 para todas porque las
    // cinco primeras son 2752x1536 del mismo lote; las nuevas no comparten ni proporcion ni
    // encuadre, y forzarlas a 0.72 les mostraba SU PROPIO MAR por encima del horizonte del juego
    // —dos lineas de agua a distinta altura— o les cortaba el sol fuera de cuadro.
    //
    // COMO SE ELIGE `hor`. En pantalla se ve la franja de imagen [hor - 0.28, hor] (sale de
    // HOR / dh con dw = W+140). Asi que tiene que cumplir dos cosas:
    //   1. hor >= la linea de agua propia de la imagen → su mar queda debajo, escondido.
    //   2. hor - 0.28 <= el sol / la luna → el astro entra en cuadro.
    // Los numeros de abajo salieron de medir cada archivo, no de tantear.
    const TBACK = '../assets/world/terrain_back/';
    const TBACK_MAP = {
      dusk:    { f: 'sunrise.png',      hor: 0.72 },   // amanecer sobre el desierto
      night:   { f: 'night.png',        hor: 0.72 },
      storm:   { f: 'night_storm.png',  hor: 0.72 },
      clear:   { f: 'day_argentday.png', hor: 0.72 },
      cloudy:  { f: 'day_cloudy.png',   hor: 0.72 },   // dia nublado (desembarco)
      // --- los tres marinos nuevos: otra proporcion (menos altos) y el astro mas arriba ---
      sun:     { f: 'day_sun.png',      hor: 0.37 },   // sol alto: hor bajo o se va de cuadro
      moon:    { f: 'night_2.jpeg',     hor: 0.62 },   // no tiene linea de agua: se encuadra la luna
      dawn:    { f: 'sunrise_2.jpeg',   hor: 0.46 },   // el sol posado sobre el agua
    };
    const tbackImgs = {};
    /** La entrada del cielo actual, o null. La usan tbackImg() y el anclado del dibujo. */
    function tbackEntry() { return TBACK ? TBACK_MAP[cfg.sky] || null : null; }
    function tbackImg() {
      const e = tbackEntry(); if (!e) return null;
      let im = tbackImgs[e.f];
      if (!im) {
        im = tbackImgs[e.f] = new Image();
        im.src = TBACK + e.f;
        im.onload = () => { world3D.invalidatePalette(); };   // el telon 3D se repinta al cargar
      }
      return (im.complete && im.naturalWidth) ? im : null;
    }
    /** Fila del horizonte de la imagen activa (0..1). Si no hay imagen no se usa. */
    function tbackHor() { const e = tbackEntry(); return e ? e.hor : 0.72; }


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
    // EL PULSO: pasa el premio del climax a las estadisticas de la corrida, para que freezeRun lo
    // encuentre. Va aca y no adentro del sistema porque `stats` es del recuento de la MISION.
    function cobrarPulso() {
      const pr = pulso.premio();
      if (!pr) return;
      stats.pulso = pr.pts;
      stats.pulsoSellos = pr.n;
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
      const bPulso = stats.pulso;                     // el premio del climax (0 si no se jugo EL PULSO)
      const total = flight + bKills + bAcc + bRas + bPulso;
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
          // la fila de EL PULSO SOLO aparece si se jugo: en las misiones con otro climax no hay
          // renglon vacio ni un cero que haga dudar de si se perdio algo
          ...(bPulso ? [{ k: 'res_pulso', v: bPulso, n: stats.pulsoSellos + '/3' }] : []),
        ],
      };
    }


    // PIRUETA (tonel / aileron roll): esquive cinematico. Se pide con tres toques del stick DERECHO
    // ('LLL' / 'RRR'); antes eran tres del izquierdo y se disparaba solo esquivando.
    // Devuelve true si el tonel ARRANCO — el detector de combos lo usa para saber si consumio la
    // secuencia. Sin esto, un tonel en cooldown dejaria el buffer sucio.
    //
    // Desde que el tonel se mudo al catalogo (data/moves.js) esto es `startMove('tonel')` y nada
    // mas: la curva, el cooldown y las estelas son las de cualquier pirueta. Lo que sigue viviendo
    // aca es SU FIRMA SONORA, que no es la de las demas — por eso entra `mudo` y los sonidos se
    // tocan abajo, iguales a los de siempre.
    function startRoll(dir) {
      if (S.state !== 'play') return false;
      if (!moves.startMove('tonel', dir, 0, { mudo: true })) return false;
      run.rollDir = dir;                        // lo lee el horizonte giratorio (core/horizon.js)
      sfxOne('waveFly');                        // rafaga de aire de la pirueta
      // ROCE del aire al girar, A VECES. Siempre seria una firma sonora fija y el tonel pasaria a
      // sonar a animacion; que salga aleatorio lo mantiene vivo. Va mas bajo que el roce de verdad:
      // ese es el PREMIO por pasar cerca de algo y no puede confundirse con este adorno.
      if (Math.random() < 0.5) sfxOne('graze', 0.35);
      beep(480, 0.16, 'triangle', 0.05, 900);   // whoosh ascendente
      return true;
    }

    // lanza un misil del jugador (arma secundaria: limitada, one-shot, con leve guiado)
    function tryLaunchMissile() {
      if (S.state === 'momentum') return momentum.launchMissile(mouse);   // primera persona: misil del momentum
      // el ARENA maneja su misil SOLO (E5): se PINTA manteniendo el boton y la salva sale al
      // soltarlo, y un flanco de tecla no puede expresar cuanto tiempo te quedaste encima
      if (S.state === 'arena') return;
      // la PASADA tambien maneja [Z] sola: alli no es un misil sino LA SUELTA de la ristra, y el
      // flanco lo detecta su propio update (systems/pasada.js) — este embudo es del pasillo.
      if (S.state === 'pasada') return;
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

    // EL ESPECTACULO DEL DERRIBO: bola de fuego pixel, pedazos con inercia, chispas y sonido.
    // Separado del FIN DE PARTIDA (die) a proposito: el RELEVO del escuadron reusa este show
    // TAL CUAL — el companero que asume tiene que ver al lider romperse igual que lo veria el
    // jugador — pero la partida sigue, asi que nada de aca puede tocar la maquina de estados.
    function crashFX() {
      sfxOne('exSmall');   // mi avion chocando (agua incluida, por ahora)
      explodeAt(plane.x, plane.y, PZ, true, true);   // noBall: la bola del derribo es la PIXEL de abajo
      // INERCIA DEL DESASTRE. Un avion a 300 km/h no frena y explota en el lugar: revienta Y
      // SIGUE — los restos y la bola de fuego conservan la velocidad que traia y avanzan varios
      // metros alejandose de la camara mientras caen. `vz` es esa inercia (en unidades de mundo,
      // las mismas de run.spd); el bloque de estado 'dead' del update la integra y la va frenando.
      const spd0 = Math.max(40, run.spd);
      // BOLA DE FUEGO del derribo: version PIXEL (pix), por codigo y MAS CHICA que la hoja
      // frontal — la hoja tapaba justo lo que este momento tiene que mostrar: el avion
      // rompiendose en pedazos. La pixel revienta con huecos y viaja con los restos.
      obstacles.push({ type: 'airboom', pix: true, x: plane.x, y: plane.y, z: PZ, boomT: 0, scale: 0.5, done: true, vz: spd0 * 0.5, vy2: plane.y > 3 ? -2 : 0, ph: Math.random() * 6 });
      // PEDAZOS GRANDES en el MUNDO ('chunk'): el motor, media ala, la deriva... Vuelan hacia
      // adelante perdiendo velocidad, la gravedad los baja y rebotan cortos al tocar el suelo.
      // Van en coordenadas de mundo (no de pantalla) justamente para poder ALEJARSE: los `parts`
      // de pantalla no tienen z y por eso el destrozo viejo se quedaba clavado donde murio.
      // Desde D0 (PLAN_DESTRUCCION) esto sale de la MISMA función que despieza a todo lo demás:
      // la receta 'plane' de data/despiece.js es este mismo destrozo escrito como fila. Era la
      // única muerte decente del juego y ahora es la referencia de la que salen las otras.
      // el derribo del jugador es el unico despiece() directo (no pasa por morir(): pone su
      // propia bola pixel). Desde v2 arma su acta como todos — `actaDe` deriva el resto.
      // El `killer` va fijo en 'choque' por ahora: `crashFX()` no recibe la causa y la receta
      // 'plane' todavia no declara variantes, asi que el campo esta inerte. Es V5 (el derribo por
      // causa) el que tiene que hacerle llegar la causa real — y ahi el acta ya lo va a esperar.
      const oPlane = { type: 'plane', x: plane.x, y: plane.y, z: PZ };
      despiece(oPlane, actaDe(oPlane, { vz: spd0 }, 'choque'));
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
      engineOff();
      beep(180, 0.5, 'sawtooth', 0.06, 40);
    }

    // AVERIADO (campaña): el golpe que en arcade revienta, aca solo SACA DE COMBATE. Nada de
    // bola de fuego ni pedazos — humo gris y negro del motor, el impacto se escucha, y la
    // cinematica del relevo cuenta el resto (el avion vuelve averiado; norma 3/8, GUION_2).
    function dmgFX() {
      // EL GOLPE TIENE QUE PEGAR (playtest 4/8): sin bola de fuego, la pegada la ponen la
      // sacudida de camara a fondo, el trueno seco del impacto y las CHISPAS del metal —
      // recien despues queda el humo, que es el que cuenta "roto pero volando".
      sfxOne('exSmall');
      boom(0.22, true);                        // trueno seco: chapa golpeada, no explosion
      run.shake = 6;
      const ps = proj(plane.x, plane.y, PZ);
      for (let i = 0; i < 10; i++) {           // chispas: cortas, rapidas, calientes
        const ang = Math.random() * 6.283, sp = 60 + Math.random() * 90;
        parts.push({
          x: ps.x, y: ps.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 20,
          life: 0.16 + Math.random() * 0.2, c: i % 2 ? P.accent : '#ffd9a0', r: 1 + Math.random(),
        });
      }
      const HUMO = ['#5a6068', '#7d858d', '#2e343a'];
      for (let i = 0; i < 22; i++) {
        const ang = Math.random() * 6.283, sp = 10 + Math.random() * 26;
        parts.push({
          x: ps.x + (Math.random() - 0.5) * 8, y: ps.y + (Math.random() - 0.5) * 6,
          vx: Math.cos(ang) * sp - 14, vy: Math.sin(ang) * sp - 46 - Math.random() * 30,
          life: 0.9 + Math.random() * 0.9, c: HUMO[i % HUMO.length],
          r: 1.5 + Math.random() * 2.4,
        });
      }
      engineOff();
      beep(140, 0.6, 'sawtooth', 0.05, -30);   // el motor tosiendo, no la explosion
    }

    function die(cause) {
      setState('dead'); deathCause = cause; deathT = 0;
      // POR LA PATRIA: el derribado ES el fin del "nivel" → estrellas por puntaje. En campaña/ciclo
      // morir es fracaso (no se cumplio el objetivo): sin estrellas.
      deadStars = gameMode === 'survival' ? starsFor(Math.floor(run.score), SURVIVAL_PAR) : 0;
      deadBg = (Math.random() * screens.LOSE_BG_N) | 0;
      factIdx = (factIdx + 1) % L().facts.length;
      // campaña: el ultimo avion tampoco explota — la escuadrilla entera quedo averiada y la
      // mision se pierde (la pantalla de fin lo dice); en arcade, el derribo clasico
      if (relevoRompe()) dmgFX(); else crashFX();
      // EL RECORD (S2): en las herramientas no se toca ni en memoria — si solo se salteara el
      // localStorage, el HUD mostraria un record que se evapora al cerrar el juego.
      if (!sinRastro() && Math.floor(run.score) > best) { best = Math.floor(run.score); try { localStorage.setItem('rasante_frontal_best', best); } catch (e) { } }
    }

    // EL EMBUDO DE LA MUERTE. Todas las señales { death } de los sistemas (colision, roce,
    // combustible, misiles del radar, momentum) caen aca, y aca — en UN solo lugar — se decide
    // si es el fin (ultimo avion → derribado) o un RELEVO (queda escuadron: el companero asume).
    // Tener el embudo unico es lo que hace confiable la ventana de gracia: durante 'relevo' ni
    // flight ni collision corren, asi que no existe camino que pueda matar dos veces seguidas.
    function onDeath(cause) {
      if (canRelevo(run.lives)) {
        // en campaña el lider NO revienta: queda averiado y vuelve (norma 3/8, GUION_2)
        if (relevoRompe()) dmgFX(); else crashFX();
        squad.startRelevo(cause);      // la mision sigue: descuenta y prepara al companero
        setState('relevo');
      } else die(cause);
    }

    // RF-15 — LA PASADA GASTADA. El otro camino por el que se pierde un avion, y el que define el
    // clímax: soltaste la ristra (o secaste el tanque buscando la linea) y tu corrida termino. No
    // moriste — por eso NO hay crashFX ni dmgFX acá: no explotó ni lo tocaron, se va con la panza
    // vacía y le toca al siguiente. Pero el avion sale de la partida igual, y esa es toda la
    // economia del modo: el escuadron son los INTENTOS contra el buque.
    //
    // Se apoya en el relevo de siempre (misma cinematica, misma cuenta, misma re-entrada a la
    // pasada con el daño al buque intacto). Sin escuadron que releve, el buque siguio navegando:
    // mision perdida por el embudo de siempre, que reinicia la mision COMPLETA — los aviones que
    // perdiste en el pasillo son intentos que no tuviste al llegar.
    function onPassSpent(sig) {
      if (canRelevo(run.lives)) {
        // el numeral que asume: startRelevo descuenta y despues calcula, asi que acá se mira una
        // vida mas adelante para poder NOMBRARLO antes de que empiece la cinematica
        const next = pilotIdx(run.squad, run.lives - 1);
        popup(W / 2, 62, T('pasada_turn', { c: squad.pilotName(next) }), P.accent);
        squad.startRelevo(sig.spent === 'seca' ? 'death_fuel' : (sig.why || 'pasada_why'), sig.spent);
        setState('relevo');
      } else die(sig.spent === 'seca' ? 'death_fuel' : (sig.dieWhy || 'death_pasada'));
    }

    // ¿El relevado se ROMPE o se MUERE? En campaña vuelve averiado (norma 3/8: los muertos los
    // decide el guion, no el gameplay) y en arcade es el derribo clasico — pero la fila
    // AL PERDER UN AVION de OPCIONES fuerza cualquiera de los dos en cualquier modo (RF-15.5).
    // Es tono, no cuenta: el avion sale de la partida en los dos casos.
    const relevoRompe = () => cfg.relevoFx === 'auto' ? squad.rosterActive() : cfg.relevoFx === 'dmg';

    // ---------- update ----------
    // update() es el ORQUESTADOR del frame: corre el prelude (tiempo, sonido, camara,
    // maquina de estados) y, si estamos jugando, encadena los tres sistemas en orden.
    // Un sistema devuelve true cuando disparo una transicion (objetivo cumplido o muerte):
    // ahi el frame se corta, igual que hacia el `return` suelto de la version monolitica.
    function update(dt) {
      // EL PULSO: el mundo corre CASI DETENIDO (PULSO.SLOW) pero el reloj de la prueba es de
      // pared — la mano del jugador compite contra el cronometro, no contra el mundo. Se escala
      // ACA, antes de que `dt` toque nada, para que TODO lo de atras del vidrio (el reloj de las
      // olas, el cabeceo del buque, los popups) quede dilatado en sincronia y sin relojes propios.
      // No se toca systems/tempo.js: el MOMENTUM es otro poder y sigue siendo del pasillo.
      // El factor NO es fijo: en el premio (Q3) el mundo DESHIELA hasta correr normal — la
      // dilatacion se suelta con la bomba. Lo decide el sistema (timeScale), que es el unico que
      // sabe en que compas de la cinematica esta.
      const dtReal = dt;
      run.dtReal = dtReal;   // el reloj de pared, para los efectos que no se dilatan (ver core/run.js)
      if (S.state === 'pulso') dt *= pulso.active() ? pulso.timeScale() : PULSO.SLOW;
      // …y LA CAMARA LENTA DEL DIRECTOR cuando una timeline corre sobre el vuelo normal (verbo
      // `tempo`; hoy, la maniobra filmada del menu MANIOBRAS).
      //
      // VA DESPUES DE `dtReal`, Y ESA ES TODA LA CUESTION. El reloj de una cinematica es de PARED
      // —lo dice el contrato de systems/cine.js— asi que una escena que dilata el mundo no puede
      // dilatarse a si misma. Puesto antes (primer intento, en el calculo del dt del cuadro) el
      // `tempo` se aplicaba TAMBIEN al reloj que mide la timeline: los dos relojes se estiraban
      // juntos, nada cambiaba en relativo, y las bandas negras se levantaban a destiempo. Ojo con
      // el nombre: `dtReal` no es el reloj de pared del sistema, es "el dt antes de los
      // reescalados de escena" — y por eso el orden de estas dos lineas importa.
      else if (S.state === 'play' && cine.active()) dt *= cine.tempo();
      run.t += dt;
      prbTick();   // MODO PRUEBAS: las sondas agendadas con a.luego() (no hace nada sin S.test)
      // EL ZIGZAG (PLAN_PASILLO_ZIGZAG Z1): rehace la tabla del carril curvo, o la APAGA.
      //
      // VA ACA, SIN NINGUN `if` DELANTE, y esa es toda la decision de diseño: el sistema decide
      // adentro si hay trazado (mira el estado, el cfg y la mision). Puesto detras de una
      // condicion, existiria el camino en el que no se llama y la tabla queda encendida del
      // cuadro anterior — o sea, el mundo doblado adentro del ARENA. Apagar es la mitad
      // importante de este renglon.
      //
      // Lo unico que se paga por estar tan arriba es que la tabla se arma con el `run.dist` del
      // cuadro ANTERIOR (flightSystem lo adelanta mas abajo): 1,2 m a velocidad de crucero, que
      // sobre un radio de curva de 600 m no se ve ni midiendolo.
      zigzag.stepZigzag();
      // rotacion del fondo del lobby (no avanza jugando: solo mientras se elige)
      if (inLobby()) {
        ppalT += dt;
        if (ppalFade < 1) ppalFade = Math.min(1, ppalFade + dt / PPAL_FADE);
        if (ppalT >= screens.ppalSeg(ppalIdx, PPAL_ROT) && screens.PPAL_BG_N > 1) {
          ppalT = 0; ppalPrev = ppalIdx; ppalFade = 0;
          // sortea una DISTINTA a la actual: repetir se leeria como que no cambio
          let k = (Math.random() * (screens.PPAL_BG_N - 1)) | 0;
          ppalIdx = k >= ppalIdx ? k + 1 : k;
        }
      }
      // EL CRUCE TRANSONICO (PLAN_TRANSONICO V3): se compara la velocidad con la del cuadro
      // anterior. Es la unica forma de que sea un EVENTO — mirar `conoAmt` daria "hay cono", que
      // ya es verdad el cuadro siguiente y dispararia para siempre.
      if (S.state === 'play' && cfg.mach === 'todo' && cruzo(machPrev, run.spd)) {
        machRender.cruce();
        run.shake = Math.min(7, run.shake + 3.2);
        run.flash = Math.min(1, run.flash + 0.35);
        beep(150, 0.22, 'sawtooth', 0.05, 620);   // el golpe: grave que sube, no un pitido
        sfxOne('waveFly');
      }
      machPrev = run.spd;
      tickDuck(dt);                      // el ducking de la musica se recupera solo
      fadeT = Math.max(0, fadeT - dt);   // fundido desde negro (se pinta al final de draw)
      // FOGONAZO (D3): se apaga solo, rapido. Va acá y no en un sistema porque tiene que correr en
      // TODOS los estados — la explosión que te mató sigue destellando mientras caés.
      run.flash = Math.max(0, run.flash - dt / FLASH_T);
      updateSfx(dt, { state: S.state, cfg, plane, boost: run.boost, firing: inp.fire, overheat: run.overheat, soldiers });   // loops con fade
      // camara CERCA: interpola hacia el objetivo; fuera de vuelo (o al morir) vuelve sola a 1
      // para que cada entrada a play arranque con zoom-in suave y sin saltos entre estados
      const camZt = 1;   // ver CAM_ZOOMS: el zoom por raster quedo desactivado
      camZ += (camZt - camZ) * Math.min(1, dt * 3.5);
      // GIRO LIBRE del horizonte ([Q]/[E]). Va ACA ARRIBA, antes de que la maquina de estados
      // empiece a cortar el cuadro con sus `return`, y no junto al vuelo: en cuanto el estado deja
      // de ser 'play' —relevo, derribado, climax— la funcion lo devuelve a cero SOLA, y eso solo
      // pasa si se la llama. Muriendo a mitad de tonel el angulo quedaba congelado y el mundo
      // pegaba el volantazo al recuperar el control.
      // No devuelve nada: es puro dibujo, no puede matarte, asi que no entra en el embudo de
      // señales del vuelo.
      // el mando manda un eje ANALOGICO (stick derecho) y el teclado un ±1: gana el que este
      // pidiendo algo, asi los dos conviven sin que el que esta quieto pise al otro.
      stepHorizon(dt, inp.rollAx || (inp.rollR ? 1 : 0) - (inp.rollL ? 1 : 0));
      stepRain(dt);   // igual que el horizonte: arriba de los early-return, o se congela en el relevo
      // stepSpray(dt);  — desactivado: el rebote de gotas no convencia visualmente
      // NIEBLA: los bancos se arman y se consumen con run.dist. Los avisos salen de un pulso de un
      // cuadro, no de mirar el estado — asi no hay forma de que el cartel salga dos veces.
      stepFog();
      if (S.state === 'play') {
        if (tookEntry() && !fogWarned) { fogWarned = true; popup(W / 2, 46, T('fogIn'), P.warn); popup(W / 2, 56, T('fogIn2'), P.accent); sfxOne('waveFly'); }
        if (takeExit()) { fogWarned = false; popup(W / 2, 46, T('fogOut'), P.foam); }
      }

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
        if (toT >= 3) {
          setState('play'); popup(W / 2, 54, T('freeControl'), P.accent); run.shake = Math.min(6, run.shake + 1);
          squad.beginExit();   // la formacion sale de plano detras de la camara (render/squad.js)
        }
        parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
        prune(parts, p => p.life > 0); capParts();
        popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
        prune(popups, p => p.life > 0);
        run.shake = Math.max(0, run.shake - dt * 10);
        flags.anyPress = false; flags.backReq = false;
        return;
      }

      if (S.state !== 'play') {
        if (S.state === 'dead') deathT += dt;
        if (S.state === 'victory') levelT += dt;
        parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
        prune(parts, p => p.life > 0); capParts();
        // las explosiones siguen VIVAS fuera de 'play' (su reloj lo lleva collisionSystem, que
        // aca no corre): sin esto la bola de fuego del derribado quedaria congelada en el frame 0
        for (const o of obstacles) {
          if (o.type === 'airboom' || o.type === 'boom') o.boomT += dt;
          // INERCIA del derribo (ver die): la bola de fuego viaja hacia adelante frenando
          if (o.vz && o.type !== 'chunk') { o.z += o.vz * dt; o.vz *= Math.max(0, 1 - dt * 1.3); if (o.vy2) o.y = Math.max(0.5, o.y + o.vy2 * dt); }
          // pedazo: sigue de largo (vz), cae, rebota corto y humea. La fisica vive en core/fx.js
          // desde D0 (PLAN_DESTRUCCION): la comparten el mundo detenido de acá y el mundo en vuelo
          // de collision.js, porque ahora tambien hay escombro AJENO cayendo.
          stepDestruccion(o, dt);
        }
        prune(obstacles, o => !((o.type === 'airboom' || o.type === 'boom') && o.boomT > 6)
          && !(o.type === 'chunk' && (o.chunkT > (o.vida || CHUNK_LIFE) || o.z > 235))
          && !(o.type === 'humo' && o.humoT > o.humoMax)
          && !(o.type === 'onda' && o.ondaT > ONDA_T));
        engineOff();
        if (S.state === 'momentum') {
          run.shake = Math.max(0, run.shake - dt * 10);
          const sig = momentum.update(dt, inp, mouse, objectiveDist);   // señal de salida: no llama hacia arriba
          if (sig === 'objective') finishObjective();
          else if (sig && sig.death) onDeath(sig.death);   // con escuadron, tambien el momentum releva
          flags.startReq = false; flags.anyPress = false;
          return;
        }
        if (S.state === 'arena') {
          // ASALTO VOLADO (climax 3D): misma disciplina de señales que el momentum. Un flak
          // encima devuelve { death } y el embudo decide: relevo del escuadron (y se re-entra
          // al arena con el daño hecho intacto) o derribo final.
          run.shake = Math.max(0, run.shake - dt * 10);
          const sig = arena.update(dt, inp);   // vuela como el PASILLO: solo teclas/pad, sin mouse
          if (sig === 'objective') finishObjective();
          else if (sig && sig.death) onDeath(sig.death);
          flags.startReq = false; flags.anyPress = false;
          return;
        }
        if (S.state === 'pasada') {
          // PASADA (el otro climax): misma disciplina de señales que el arena y el momentum. El
          // sistema no llama hacia arriba — devuelve 'objective', { death } o { spent } (RF-15:
          // gastaste tu pasada sin morir) y el embudo decide.
          run.shake = Math.max(0, run.shake - dt * 10);
          const sig = pasada.update(dt, inp);
          if (sig === 'objective') finishObjective();
          else if (sig && sig.spent) onPassSpent(sig);
          else if (sig && sig.death) onDeath(sig.death);
          flags.startReq = false; flags.anyPress = false;
          return;
        }
        if (S.state === 'pulso') {
          // EL PULSO (el climax como prueba de destreza): misma disciplina que los otros climax —
          // el sistema devuelve 'objective' o { death } y el embudo decide. El fallo NO llega
          // hasta aca salvo el tercero: los dos primeros los resuelve el propio re-encare.
          run.shake = Math.max(0, run.shake - dtReal * 10);
          const sig = pulso.update(dtReal, dt);
          // EL PREMIO entra al recuento como una fila mas (freezeRun lo suma al total, y de ahi
          // salen las estrellas de la mision): el climax no tiene una moneda propia.
          if (sig === 'objective') { cobrarPulso(); finishObjective(); }
          // 2º FALLO: cuesta un avion del escuadron (mismo camino que la pasada gastada — no te
          // derribaron, se te fue la pasada). Volando solo no hay avion que cobrar: se sigue.
          else if (sig && sig.spent) { if (canRelevo(run.lives)) onPassSpent(sig); else pulso.reencarar(); }
          // 3er FALLO: die() DIRECTO y no onDeath(). Los intentos de la prueba son de la MISIÓN, no
          // del avión: si pasara por el relevo, quedarían tantas pruebas como aviones tenga el
          // escuadrón y el "3 fallos y se pierde" del plan no existiría — se fallaría en bucle.
          else if (sig && sig.death) die(sig.death);
          flags.startReq = false; flags.anyPress = false;
          return;
        }
        if (S.state === 'story') {
          // HISTORIA: el motor tipea la linea y guarda su silencio; aca solo se decide QUE PASA
          // cuando la secuencia se termina — el despegue, con FADE.
          if (stepStory(dt) === 'end') {
            // sonda del fixture (?scene=): la escena suelta no encadena a ninguna mision
            if (sceneProbe) { setState('modeselect'); modeSel = 0; beep(400, 0.06, 'square', 0.05); }
            // SOLO CINEMATICAS: el briefing empalma con el epilogo y la mision no se vuela. Las dos
            // puntas del guion seguidas es justamente lo que hay que poder leer de una sentada — y
            // el epilogo ya sabe volver al catalogo (ver su rama, `S.test`).
            else if (testCine) { verEpilogo(); }
            else { run.t = 0; fadeT = 1.4; setState(afterBrief()); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
          }
        } else if (S.state === 'brief') {
          // tarjeta corta de mision (ciclo de muerte, y campaña sin guion): una tecla despega
          briefT += dt;
          if (briefT > 0.6 && flags.anyPress) { run.t = 0; fadeT = 1.0; setState(afterBrief()); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
        } else if (S.state === 'menu') {
          // el menú lo comparten SUPERVIVENCIA y CICLO DE MUERTE
          if (flags.startReq) {
            // MINUTOS SAGRADOS / PASADAS MORTALES: derecho al climax, con el buque elegido en OPCIONES
            if (gameMode === 'arena') startArenaBattle(false);
            else if (gameMode === 'pasadas') startPasadaBattle(false);
            else {
              reset(); setRunObjective();
              // ciclo: briefing corto de la mision; POR LA PATRIA: derecho al despegue
              if (gameMode === 'cycle') { briefT = 0; setState('brief'); beep(600, 0.08, 'square', 0.05); }
              else { setState(afterBrief()); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
            }
          }
        } else if (S.state === 'dead') {
          // solo se puede reintentar una vez que subio la pantalla (paso el show del destrozo)
          // reintenta (mismo modo/nivel). La musica NO se reinicia: sigue desde donde venia.
          if (deathT > DEATH_REVEAL && flags.anyPress) {
            // los dos modos de climax suelto reintentan LO MISMO (mismo buque): no hay despegue al que volver
            if (gameMode === 'arena') startArenaBattle(false);
            else if (gameMode === 'pasadas') startPasadaBattle(false);
            else { reset(); setRunObjective(true); setState(afterBrief()); sfxOne('lv1'); beep(600, 0.08, 'square', 0.05); }
          }
        } else if (S.state === 'relevo') {
          // RELEVO DEL ESCUADRON. Los restos del lider ya los movio el bloque comun de arriba
          // (inercia de chunks y bola de fuego, el mismo camino del derribado). El resto del
          // mundo NO se congela: corre a media maquina para que la escena respire — pero flight
          // y collision no corren, asi que la invulnerabilidad de la ventana es estructural:
          // aca no hay nadie que pueda devolver { death }.
          const adv = run.spd * 0.4 * dt;
          run.dist += adv;                     // la mision sigue: el escuadron no deja de volar
          for (const o of obstacles) if (o.type !== 'chunk' && o.type !== 'airboom') o.z -= adv;
          for (const sd of soldiers) sd.z -= adv;
          popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
          prune(popups, p => p.life > 0);
          run.shake = Math.max(0, run.shake - dt * 8);
          engineFly(run.spd * 0.9, false, 0.015);   // el motor del companero: la escena no queda muda
          if (squad.updateRelevo(dt) === 'done') {
            // lo que cruzo el plano del avion DURANTE la cinematica ya paso de largo: sin esto,
            // collision lo veria "sin resolver" en el primer frame y podria matar en el handoff
            for (const o of obstacles) if (o.z <= PZ + 1.5) o.done = true;
            // EL COMPAÑERO ENTRA CON EL AVION SANO. Es lo que mantiene al escuadron como vidas
            // aunque el modelo sea por integridad: cada avion trae su propia chapa.
            damage.resetDamage();
            // si el companero releva DENTRO del asalto, vuelve AL ASALTO — con el daño ya hecho
            // al buque (las zonas viven en el subsistema, no en la instancia). Pasar por 'play'
            // funcionaba de rebote (flight re-detectaba el objetivo), pero metia un frame del
            // mundo de vuelo en el medio.
            // el que releva DENTRO del climax vuelve AL CLIMAX que se estaba jugando, con el daño
            // ya hecho al buque (las zonas viven en el subsistema, no en la instancia). Entra por
            // la boca de la zona y no heredando el vuelo del anterior: no venia volando el pasillo.
            // EL PULSO: el companero vuelve A LA PRUEBA, con los intentos gastados y el flak ya
            // encima (enter() sin cfg conserva la cuenta). Perder un avion no limpia la pizarra.
            // EL FUNDIDO CORTO TAMBIEN VALE ACA. El cruce al climax desde el RELEVO cambia de
            // camara igual que el del pilo vivo —el pasillo mira de costado, el climax de frente—
            // y sin el parpadeo se lee como un error, que es justo lo que el fundido vino a
            // evitar (ver el bloque gemelo del update). Estaba solo en un lado: el relevo entraba
            // de golpe. Lo agarro el fixture de la PASADA midiendo el fundido con la sonda.
            if (runClimax() === 'pulso' && pulso.available() && objectiveDist > 0 && run.dist >= objectiveDist) {
              pulso.enter(false); fadeT = 0.55;
              popup(W / 2, 54, T('sq_yours'), P.accent);
              if (run.lives === 1) popup(W / 2, 64, T('sq_last'), P.warn);
              beep(980, 0.14, 'square', 0.06);
              flags.startReq = false; flags.anyPress = false;
              return;
            }
            if (runClimax() === 'pasada' && pasada.available() && objectiveDist > 0 && run.dist >= objectiveDist) {
              pasada.enter(false); fadeT = 0.55;
              popup(W / 2, 54, T('sq_yours'), P.accent);
              if (run.lives === 1) popup(W / 2, 64, T('sq_last'), P.warn);
              beep(980, 0.14, 'square', 0.06);
              flags.startReq = false; flags.anyPress = false;
              return;
            }
            if (arena.available() && objectiveDist > 0 && run.dist >= objectiveDist) {
              arena.enter(); fadeT = 0.55;
              popup(W / 2, 54, T('sq_yours'), P.accent);
              if (run.lives === 1) popup(W / 2, 64, T('sq_last'), P.warn);
              beep(980, 0.14, 'square', 0.06);
              flags.startReq = false; flags.anyPress = false;
              return;
            }
            setState('play');
            popup(W / 2, 54, T('sq_yours'), P.accent);
            if (run.lives === 1) popup(W / 2, 64, T('sq_last'), P.warn);
            beep(980, 0.14, 'square', 0.06);
            run.shake = Math.min(6, run.shake + 1);
          }
        } else if (S.state === 'results') {
          // RECUENTO: las filas entran de a una; una tecla las completa de golpe, la siguiente pasa al epilogo
          resT += dt;
          const nRows = lastRun ? lastRun.rows.length : 0;
          const want = Math.min(nRows, Math.floor(resT / 0.45));
          if (want > resRow) { resRow = want; beep(760 + resRow * 90, 0.07, 'square', 0.05); }
          const full = resRow >= nRows && resT > nRows * 0.45 + 0.7;
          if (flags.anyPress && resT > 0.5) {
            if (!full) { resT = nRows * 0.45 + 0.8; resRow = nRows; }   // completar de un saque
            else { trasResultados(); beep(500, 0.05, 'square', 0.04); }
          }
        } else if (S.state === 'epilogue') {
          // EPILOGO: el mismo motor de lineas; al terminar la secuencia, encadena segun el modo
          if (stepStory(dt) === 'end') {
            // HERRAMIENTAS (S0): la mision suelta TERMINA acá y se vuelve al catalogo del que se
            // vino. Encadenar la siguiente es lo unico que el selector no puede hacer — para eso
            // esta la campaña.
            if (S.test) { salirTest(); beep(400, 0.06, 'square', 0.05); }
            else if (gameMode === 'campaign') {
              // EL BANCO YA PASO (va despues del recuento, ver `trasResultados`). Lo que queda es
              // el corte al dia siguiente. La ultima mision no lo lleva: de ahi se va a victoria y
              // un «dia siguiente» antes del final seria una promesa que el juego no cumple.
              if (curLevel + 1 < MISSIONS.length) setState(armarInter(T('inter_dia'), INTER_DIA, advanceCampaign));
              else advanceCampaign();
            } else if (gameMode === 'arena') {
              // MINUTOS SAGRADOS: otra BATALLA al azar. Este modo no tiene camino — encadenarlo
              // al briefing lo mandaba a volar una mision entera de CICLO DE MUERTE, que es
              // OTRO modo.
              startArenaBattle(true);
            } else if (gameMode === 'pasadas') {
              startPasadaBattle(true);        // otra pasada, otro buque — mismo criterio que el arena
            } else {
              // ciclo de muerte: otra mision al azar, desde cero
              randomMission(); reset(); setRunObjective(); briefT = 0; setState('brief');
            }
          }
        } else if (S.state === 'inter') {
          // corre solo y se puede saltear con una tecla despues de medio segundo: son un par de
          // segundos de negro, y obligar a mirarlos es castigar al que ya lo vio diez veces.
          interT += dt;
          if (interT >= interDur || (flags.anyPress && interT > 0.5)) {
            const f = interNext; interNext = null; interDur = 0;
            if (f) f();
          }
        } else if (S.state === 'upgrade') {
          // EL BANCO DEL PICHON: reloj propio (run.t queda quieto entre misiones). La eleccion
          // entra por input.js (upgNav/upgConfirm), no por anyPress: hay que ELEGIR, no saltear.
          upgT += dt;
        } else if (S.state === 'victory') {
          if (levelT > 0.8 && flags.anyPress) { setState('modeselect'); }
        }
        flags.startReq = false; flags.anyPress = false;
        return;
      }
      // MODO DIALOGOS (selector): cualquier tecla pasa a la charla siguiente, y de la ultima vuelve
      // a la primera — la gracia es poder mirar la misma diez veces mientras se ajusta como se ve.
      //
      // VA ACA, PEGADO AL BORRADO DEL FLAG, y no adentro del bloque de `cfg.devcam` que sigue: la
      // linea de abajo apaga `anyPress` para el resto del cuadro, asi que cualquier lector del flag
      // que viva mas abajo lo encuentra siempre en false. (Se perdio media hora con eso: la tecla
      // llegaba, el modo la ignoraba, y no habia error que mirar.)
      if (testRadio && flags.anyPress) irACharla(radioBeat + 1);
      flags.anyPress = false;

      squad.tickExit(dt);   // reloj de la salida de plano de la formacion (solo corre si arranco)

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
        spawnSystem(dt, objectiveDist);
        // el mundo entero corre, pero la señal de muerte se DESCARTA: en este modo el avion es
        // inmortal y de la partida solo se sale con ESCAPE (ver core/input.js). El vuelo
        // (flightSystem) NO corre: el avion queda quieto como referencia, no cae ni gasta nafta.
        collisionSystem(dt);
        parts.forEach(p2 => { p2.x += p2.vx * dt; p2.y += p2.vy * dt; p2.vy += 90 * dt; p2.life -= dt; });
        prune(parts, p2 => p2.life > 0); capParts();
        tickRadio(dt);                       // la caja de radio baja sola cuando se le acaba el tiempo
        popups.forEach(p2 => { p2.y -= 14 * dt; p2.life -= dt; });
        prune(popups, p2 => p2.life > 0);
        engineOff();
        return;
      }

      // LA RADIO DEL TRAMO (SPEC_TRAMOS RF-03). El sistema devuelve señal y ACA se decide que se
      // hace con ella: popup y beep, como cualquier otra radio del pasillo. Va adentro del bloque
      // de 'play' —despues del devcam, que corta antes— y esa ubicacion ES la regla "solo en
      // vuelo": en relevo, pausa o climax este renglon no se ejecuta, asi que la linea de un
      // tramo cruzado ahi espera y suena al volver.
      const trs = tramos.stepTramos();
      if (trs && trs.radio) radioTramo(trs.radio);
      // LA CHARLA DEL TRAMO (SPEC_CHARLAS_VUELO RF-01). Llega por el mismo flanco que la radio y
      // se despacha en el mismo renglon por la misma razon: es el orquestador el que decide que se
      // hace con una señal. Armar NO arranca el dialogo — enciende el drenaje, y el sembrador se
      // apaga a partir de este cuadro (spawnSystem, mas abajo, ya lo va a ver apagado).
      // Una escena que no existe en el guion se ignora en silencio a proposito: un id mal escrito
      // en un tramo no puede llevarse la mision puesta.
      if (trs && trs.charla && SCENES[trs.charla]) charla.armar(trs.charla);
      // ?charla=<ID> (sonda, QUITAR): la misma puerta, disparada por distancia en vez de por tramo.
      if (charlaProbe && !charlaArmed && run.dist >= 300) { charlaArmed = true; charla.armar(charlaProbe); }

      // needsMomentum: si el objetivo del run culmina en el climax (barco) o con solo llegar (distancia)
      const needsMomentum = (gameMode === 'campaign' || gameMode === 'cycle') ? goalOf(curMission()).needsMomentum : true;
      const fs = flightSystem(dt, { viewMouse, launchMissile: tryLaunchMissile, objectiveDist, needsMomentum, climax: runClimax() });
      if (fs === 'momentum' || fs === 'arena' || fs === 'pasada') {
        // FUNDIDO CORTO AL CRUZAR AL CLIMAX (playtest 16/8). RF-01 pedia CERO corte, y la fase se
        // construyo y se midio asi — pero jugandolo, el autor pidio lo contrario y tiene razon: la
        // camara SI cambia (el pasillo mira de costado, el climax mira adelante desde la cabina) y
        // un cambio de camara sin ningun parpadeo no se lee como continuidad, se lee como un
        // error. "Si cambias de camara MINIMAMENTE fade in - out."
        // Es corto a proposito: avisa que cambio el mundo, no corta la accion.
        fadeT = 0.55;
        return;
      }
      if (fs === 'objective') { finishObjective(); return; }
      if (fs && fs.death) { onDeath(fs.death); return; }
      // RF-01: con clímax PASADA, los spawns se cortan ENTRY_CLEAR_M antes del buque. El último
      // tramo del pasillo se vacía y lo único que queda adelante es el blanco — es la mitad de
      // "sin corte": no hay obstáculos que desaparezcan de golpe al abrirse el mundo.
      // En PASADAS MORTALES no hay spawns EN NINGUN momento: el modo entero ES ese último tramo,
      // y meterle obstáculos lo volvería otra vez el PASILLO con un barco al final.
      if (gameMode !== 'pasadas' && !(runClimax() === 'pasada' && pasada.spawnsCut(run.dist, objectiveDist)))
        spawnSystem(dt, objectiveDist);  // aparicion de obstaculos y soldados (nunca corta el frame)
      const hit = collisionSystem(dt);   // impactos → devuelve { death } si un choque fue fatal
      if (hit) { onDeath(hit.death); return; }
      // LA COLA (PLAN_HARRIERS_PERSECUCION, PLAN A). Corre SOLO acá, en el PASILLO: el §6.6 pide
      // que no aparezca en ARENA, PASADA ni MINUTOS SAGRADOS, y la forma de garantizarlo es que
      // el duelo no tenga ningun otro sitio desde donde correr. Devuelve señal como todos: si te
      // engancha, la muerte entra por el embudo de siempre y el relevo aplica.
      // CALMA (sonda, QUITAR): vacia el pasillo para poder MIRAR el duelo. Es el mismo criterio
      // que `__pdef(0)` en la pasada — la seccion que mide una cosa apaga lo que no esta midiendo.
      // Sin esto, juzgar la coreografia del sobrepaso depende de no comerse un mastil en el medio,
      // y el ciclo entero dura casi un minuto. En el juego normal `cazaCalma` es siempre false.
      if (cazaCalma) { obstacles.length = 0; missiles.length = 0; soldiers.length = 0; run.detection = 0; }
      if (cazaProbe && !cazaArmed && run.t > 1.5) { cazaArmed = true; caza.start(cazaProbe); }
      // LOS ACTORES: los Fieles que entraron a hacer una pirueta en escena. Corren con el dt del
      // MUNDO —si el tiempo se dilata, la figura se dilata con el— y no devuelven señal: no pueden
      // matar a nadie ni terminar nada. Se limpian solos (tope de vida en data/moves.js).
      wingmv.update(dt);
      // LOS TIROS DE UTILERIA (EL TEATRO AEREO, TA0). Van con los actores y por la misma razon:
      // corren con el dt del MUNDO y no devuelven señal. **No estan en ninguna de las cinco listas
      // de core/world.js**, asi que la rutina de colision ni siquiera los ve — no hay daño porque
      // no hay codigo de daño (docs/sistemas/PLAN_TEATRO_AEREO.md §2).
      teatro.update(dt);
      // EL DIRECTOR, tambien en el PASILLO. Hasta ahora solo corria adentro del PULSO (que lo
      // actualiza el mismo): esto es lo que deja mirar una maniobra FILMADA sobre el vuelo normal.
      // Corre con el reloj de PARED —una cinematica no se dilata con el mundo que ella misma
      // dilata— y su señal `done` no tiene a quien avisarle: la timeline se apaga sola.
      if (S.state === 'play') cine.update(dtReal);
      // EL DIRECTOR (H4): decide SI hay duelo, mirando la mision y no el duelo. La intensidad es
      // dato de nivel (cfg.caza, 0..2 — m1 en 0 porque el tutorial no se pelea) y `meta` en 0
      // significa pasillo infinito, donde no hay techo de duelos. Con la sonda `?caza` puesta el
      // director se calla: la sonda ya armo el suyo y dos directores serian dos Harrier (§6.2).
      if (!cazaProbe) caza.cazaDirector(dt, {
        // la intensidad sale del TRAMO si la mision los trae (SPEC_TRAMOS RF-02) y del cfg si no:
        // el transito del Narwal es `caza: 0` sin que la mision entera deje de tener Harriers.
        intensidad: tramos.val('caza', cfg.caza), dist: run.dist, meta: objectiveDist, ciego: inBank(), jets: run.jets,
      });
      // PERSECUCION (PLAN_HARRIERS_PERSECUCION, PLAN B). Corre en el mismo lugar que LA COLA y por
      // la misma razon: es una variante del PASILLO, y no tenerle otro sitio desde donde correr es
      // mas confiable que un chequeo de estado que alguien se puede olvidar de agregar.
      if (persecProbe && !persecArmed && run.t > 1.5) {
        persecArmed = true;
        persec.startPersec({ infinito: true });
      }
      // N1 le puso la banda: si lo perdes o lo chocas, la muerte entra por el embudo de siempre.
      const ps = persec.persecSystem(dt);
      if (ps && ps.death) { onDeath(ps.death); return; }
      // EL GUION SE LLEVO AL LIDER (LA REGLA DEL AMIGO, systems/persec.js). No es tu muerte: es la
      // de el, y el pasillo sigue. Se anuncia y nada mas — si el guion quiere que ademas te cueste
      // algo, es el guion el que lo escribe.
      if (ps && ps.guion) { popup(W / 2, 46, T(ps.guion), P.warn, true); duck(0.5); }
      // SONDAS DE LA COLA (QUITAR). Las dos son inertes con el juego normal: `czAlto` en null no
      // toca una linea del vuelo y `czMv` en null deja `run.mv` como estaba. La pirueta se inyecta
      // POR UN CUADRO y se restaura enseguida, para que probar el combo que fuerza el sobrepaso no
      // le mienta al motor de piruetas — que es el dueño de ese campo.
      if (czAlto !== null) {
        if (czBrk > 0) { czBrk -= dt; czAltoX += 45 * dt; }   // el quiebre sostenido de __czquiebre
        plane.y = czAlto; plane.vy = 0;
        plane.x = czAltoX; plane.vx = 0;
      }
      // VELOCIDAD CLAVADA (sonda, QUITAR). Se pisa DESPUES del motor de vuelo y ANTES del duelo,
      // que es el unico orden que sirve: la velocidad de cierre del Harrier se calcula contra
      // `run.spd` de este cuadro, y medirla con el gas de verdad daria un numero distinto cada vez.
      if (czSpd !== null) run.spd = czSpd;
      const mvSave = run.mv;
      if (czMv) { run.mv = czMv; czMv = null; }
      const cz = caza.cazaSystem(dt);
      run.mv = mvSave;
      if (cz && cz.death) { onDeath(cz.death); return; }
      // líneas de velocidad
      if (run.boost || run.rasLevel > 0 || run.spd > 115) {
        const n = (run.boost ? 3 : 1) + run.rasLevel + run.afterTier;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * 6.283;
          streaks.push({ a, r: 26 + Math.random() * 20, v: 240 + Math.random() * 160, life: 0.5 });
        }
      }
      streaks.forEach(s => { s.r += s.v * dt; s.life -= dt; });
      prune(streaks, s => s.life > 0 && s.r < (s.rmax || 260));

      parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 90 * dt; p.life -= dt; });
      prune(parts, p => p.life > 0); capParts();
      popups.forEach(p => { p.y -= 14 * dt; p.life -= dt; });
      prune(popups, p => p.life > 0);
      run.shake = Math.max(0, run.shake - dt * 10);
      run.bloodSplat = Math.max(0, run.bloodSplat - dt * 0.3);   // la mancha de sangre se desvanece (~3 s)
      if (run.boost) run.shake = Math.max(run.shake, 0.8 + (plane.y < 5 ? 0.7 : 0));

      // MOMENTUM: con el tiempo partido, el motor pasa al latido grave del climax (el mismo
      // engineRumble) y la musica se agacha — duck() por frame la sostiene abajo y tickDuck la
      // recupera solo al soltar. La punteria (mouse) sigue en tiempo real: es por frame.
      if (tempo.active()) { engineRumble(run.t); duck(0.25); }
      else engineFly(run.spd, run.boost, run.boost ? 0.030 : 0.017);
      if (run.fuel <= 0 && Math.random() < 0.05) beep(90, 0.08, 'sawtooth', 0.03);
    }

    // ---------- render ----------

    // ESTADOS QUE LLEVAN MARCO: los del PASILLO, donde hay un carril que enmarcar. El 'takeoff'
    // entra porque el despegue ya es el pasillo (con la formacion delante), y 'dead'/'relevo'
    // porque el mundo sigue en pantalla — apagar el velo justo ahi seria un parpadeo.
    const MARCO_STATES = ['play', 'takeoff', 'dead', 'relevo', 'pulso'];

    function draw() {
      ctx.setTransform(SC, 0, 0, SC, 0, 0);   // buffer 2×: todo el dibujo sigue en coords 320×180
      const sx = (Math.random() - 0.5) * run.shake, sy = (Math.random() - 0.5) * run.shake;
      const cm = momentum.cam();
      ctx.save(); ctx.translate(Math.round(sx) - cm.x, Math.round(sy) - cm.y);   // momentum: el mundo se mueve, la mira no
      // R5: ZOOM-PUNCH — el impacto de la bomba empuja la camara hacia adelante un instante. Sin
      // congelar el mundo, sin mover el eje: solo un scale de 1..1.08 que se abre y se cierra. Es lo
      // que separa "pego" de "PEGO".
      const pA = pasada.active();
      if (pA && pA.zoomPunch > 0) {
        const zp = 1 + pA.zoomPunch * 0.08;
        ctx.translate(W / 2, H / 2); ctx.scale(zp, zp); ctx.translate(-W / 2, -H / 2);
      }
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
      // HORIZONTE GIRATORIO (cfg.horizon, ver core/horizon.js): el MUNDO se inclina con el avion
      // durante las piruetas. Misma tecnica y MISMO CENTRO que el alabeo del momentum de arriba,
      // y no es casualidad que alcancen los margenes: el cielo y el mar se pintan de -70 a W+140
      // y desde y=-140 justamente para cubrir un giro completo alrededor del centro.
      // Se DESHACE antes de dibujar el avion: el sprite es la "cabina" y queda derecho.
      // …y en EL PULSO lo inclina la PIRUETA DEL PREMIO: la maniobra que se tecleo se vuela de
      // verdad (systems/moves.js) y eso se ve como el horizonte dando la vuelta. REEMPLAZA a
      // hzWorld() en vez de sumarse: desde que 'pulso' esta en la lista de hzMode() (para que la
      // camara de tercera compense el rolido del sprite) las dos cuentas darian el mismo giro y
      // el mundo giraria el doble.
      const hzW = S.state === 'pulso' ? pulso.camRoll() : hzWorld();
      if (hzW) {
        ctx.save();
        const hcx = W / 2 + cm.x, hcy = H / 2 + cm.y;
        ctx.translate(hcx, hcy); ctx.rotate(hzW); ctx.translate(-hcx, -hcy);
      }
      // MUNDO 3D (three.js) del fallback: en el ARENA VIEJO (momentum.js) el fondo completo
      // (cielo+mar+BARCO, flag MOM3D.on); en PASILLO sobre mar abierto solo cielo+mar (flag
      // MOM3D.sea). El blit va DENTRO de los transforms (roll/paneo/zoom/shake le pegan al 3D);
      // la capa 2D va encima. Sin THREE/WebGL o con ?no3d, ambas flags quedan false y pinta el
      // 2D de siempre. La fase ARENA (vuelo libre) usa su PROPIA escena — ver mas abajo.
      world3D.frame({ state: S.state, mom: momentum.active(), dist: run.dist, momDrift: momentum.drift(), cfg, cam, t: run.t, SKY: theme.sky, WATER: theme.water, objectiveShip, seaH: world.seaH, momShipGeom: momentum.shipGeom, tbackImg, tbackHor: tbackHor(),
        // las olas SOLO cuando el mar 3D las va a dibujar: con el mar 2D el recorrido de
        // obstaculos ya lo hace drawSeaDots y este seria un segundo barrido por cuadro al pedo.
        olas: cfg.agua3d === '3d' ? world.olasDelCuadro() : null });
      if (world3D.isOn() || world3D.isSea()) {
        const sm = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(world3D.view(), -108, -153, world3D.M3W, world3D.M3H);
        ctx.imageSmoothingEnabled = sm;
      }
      // ARENA: mundo 3D de VUELO LIBRE (escena propia, ver systems/three-arena.js). Se rinde a
      // la grilla del juego y se blitea 1:1 — sin la equivalencia con proj() del momentum, que
      // aca no aplica: la camara va donde va el avion.
      // la ESCENA es la misma para las dos fases del climax 3D: lo que cambia es de que sistema
      // sale el avion que se le pasa (SPEC_MODO_PASADA §3).
      arena3D.frame({ state: S.state,
                      arena: S.state === 'pasada' ? pasada.camState() : arena.active(),
                      view: S.state === 'pasada' ? pasada.view() : arena.view(), cfg, t: run.t,
                      // LAND va con el resto de la paleta: el terreno 3D (P4) se pinta con la
                      // MISMA turba que el pasillo, o la bahia del climax seria de otro juego.
                      SKY: theme.sky, WATER: theme.water, LAND: theme.land,
                      objectiveShip, seaH: world.seaH });
      if (arena3D.isOn()) {
        const sm = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(arena3D.view(), 0, 0, W, H);
        ctx.imageSmoothingEnabled = sm;
      }

      if (!world3D.isOn() && !arena3D.isOn()) {   // ---- mundo 2D: en el climax 3D lo reemplaza el blit de arriba ----
      // cielo y sol 2D: en mar-abierto-3D los pone three (nubes/islas siguen 2D encima)
      // EL FONDO GIRA CON EL RUMBO (zigzag Z2). Es lo mas barato del item y lo que mas vende que
      // doblaste: las sierras y el telon se corren al virar. Sin esto el mundo dobla y el
      // horizonte se queda mirando para el mismo lado — que es la costura que delata el truco
      // del riel curvo. Vale 0 con el pasillo recto.
      const zfx = zigzag.headingZigzag() * ZZ_FONDO_K;
      const tbA = tbackImg();                  // imagen de fondo del clima (si esta cargada)
      const tb2 = world3D.isSea() ? null : tbA;      // en mar-3D la pinta el telon de three
      if (!world3D.isSea()) {
      if (tb2) {
        // FONDO por clima: cover con el horizonte de la imagen clavado en HOR (trae su propio
        // sol) + parallax suave (x0.8) para que el telon tambien respire
        const dw = W + 140, dh = dw * tb2.naturalHeight / tb2.naturalWidth;
        ctx.fillStyle = '#0a1014'; ctx.fillRect(-70, -140, dw, HOR + 144);   // margen sobre la imagen
        // EL TELON SE CORRE TOPEADO. El resto del fondo (nubes, sierras) da la vuelta con un
        // modulo, asi que puede correrse lo que quiera; el telon es UNA imagen dibujada una vez,
        // con 70 px de margen a cada lado — pasado eso se ve su BORDE, un bloque duro en la
        // esquina. Aparecio en la primera captura de la curva y es el unico artefacto que dejo
        // el item. Se topea en 60 y no se agranda la imagen a proposito: agrandarla la escala
        // tambien en alto y cambiaria el encuadre del cielo en TODAS las misiones, con zigzag o
        // sin el. El costo es que en una curva sostenida y larga el telon deja de acompañar —
        // es lo mas lejano que hay en pantalla, y es lo que menos se nota.
        const zfxT = Math.max(-60, Math.min(60, zfx));
        ctx.drawImage(tb2, -70 - cam.x * 0.8 - zfxT, HOR - tbackHor() * dh, dw, dh);
      } else {
      const g = ctx.createLinearGradient(0, 0, 0, HOR);
      g.addColorStop(0, theme.sky.skyTop); g.addColorStop(0.6, theme.sky.skyMid); g.addColorStop(1, theme.sky.horizon);
      ctx.fillStyle = g; ctx.fillRect(-70, -140, W + 140, HOR + 144);   // margenes: paneo + rolls completos del momentum
      ctx.globalAlpha = 0.4; px(-70, HOR - 10, W + 140, 10, theme.sky.sunGlow); ctx.globalAlpha = 1;
      // sol bajo
      const sunX = W / 2 - cam.x * 1.4 - zfx;
      px(sunX - 7, HOR - 11, 14, 8, theme.sky.sun);
      ctx.globalAlpha = 0.35; px(sunX - 10, HOR - 13, 20, 12, theme.sky.sunGlow); ctx.globalAlpha = 1;
      }
      }
      // nubes
      for (const c of clouds) {
        const cx = ((c.x - cam.x * 2.2 - run.t * 2 - zfx) % (W + 80) + W + 80) % (W + 80) - 40;
        px(cx, c.y, c.w, 3, P.cloud); px(cx + 5, c.y - 2, c.w * 0.5, 2, P.cloud);
      }
      // COLINAS en el horizonte: SIEMPRE (el parallax de estas montañas es la vida del fondo;
      // la imagen de clima queda detras como relleno). Cresta QUEBRADA sorteada por seed y en
      // DOS TONOS — las laderas que miran al sol (izquierda) se iluminan, las otras quedan en
      // sombra. El dibujo viejo eran dos triangulos planos de un solo color: carton pintado.
      for (const is of isles) {
        const ix = ((is.x - cam.x * 3.5 - zfx) % (W + 160) + W + 160) % (W + 160) - 80;
        const hsh = n => { const v = Math.sin(is.seed * 12.9898 + n * 78.233) * 43758.5453; return v - Math.floor(v); };
        const N = 6, peak = 1 + Math.round(hsh(99) * (N - 2));
        const ys = [0];                                   // altura de cada vertice de la cresta
        for (let j = 1; j < N; j++) {
          const env = 1 - Math.abs(j - peak) / Math.max(peak, N - peak);
          ys.push(is.h * (0.3 + 0.7 * env) * (0.7 + hsh(j) * 0.55));
        }
        ys.push(0);
        const xj = j => ix + (j / N) * is.w;
        ctx.fillStyle = P.island;                         // masa base (el lado en sombra)
        ctx.beginPath(); ctx.moveTo(ix, HOR + 1);
        for (let j = 1; j <= N; j++) ctx.lineTo(xj(j), HOR + 1 - ys[j]);
        ctx.fill();
        ctx.fillStyle = '#2a3844';                        // laderas al sol: las que SUBEN
        for (let j = 0; j < N; j++) {
          if (ys[j + 1] <= ys[j]) continue;
          ctx.beginPath();
          ctx.moveTo(xj(j), HOR + 1 - ys[j]); ctx.lineTo(xj(j + 1), HOR + 1 - ys[j + 1]);
          ctx.lineTo(xj(j + 1), HOR + 1); ctx.lineTo(xj(j), HOR + 1);
          ctx.fill();
        }
        ctx.globalAlpha = 0.35;                           // bruma al pie: asienta la sierra
        px(ix, HOR - 1, is.w, 2, theme.sky.horizon);
        ctx.globalAlpha = 1;
      }

      // RELLENO BAJO EL MUNDO, cuando rota (alabeo del momentum, u HORIZONTE GIRATORIO): con el
      // mundo girado la esquina de abajo deja de estar tapada por el borde de la pantalla.
      //
      // Va ANTES del mundo y no despues: es un PISO, no un parche. Un color plano no puede acertarle
      // a una fila que es mitad arena y mitad mar (COSTA), asi que taparlo con esto dejaba el corte
      // igual de visible, solo que de otro color. Ahora el mundo se sigue dibujando por debajo del
      // borde (ver UNDER en render/world.js) y pinta ENCIMA de este piso; el piso queda para lo que
      // el raster 2D no cubre — el momentum, y el mar puesto por three.
      if (S.state === 'momentum' || hzW) px(-70, H, W + 140, 150, cfg.terrain === 'land' ? theme.land.near : theme.water.base2);
      if (!world3D.isSea()) world.drawSea();   // el mar 2D solo cuando three no lo esta poniendo
      // la barcaza objetivo creciendo en el horizonte. El tercer parametro es lo que EL PULSO le
      // esta haciendo en la cinematica del premio (crecer, escorar, hundirse) — null el resto del
      // tiempo: el buque del pasillo es el mismo, y solo el climax lo mata.
      // el cuarto parametro es R3: si el climax de este run es la PASADA, el pasillo dibuja el
      // buque DE PROA y a la distancia real, para que el corte no mueva ni el tamaño ni el rumbo.
      // …y NUNCA de proa adentro de EL PULSO: la prueba crece, escora y hunde el CASCO LATERAL
      // (es el buque sobre el que apunta su cinematica), y con la silueta de proa `drawApproachBarge`
      // sale antes de publicar su geometria — el premio se quedaba sin buque que volar. Pasa solo
      // por las puertas de herramienta, donde se entra al PULSO en una mision cuyo climax declarado
      // es la PASADA; se vio mirando el premio suelto desde el menu CINEMATICAS.
      // …y en EL PULSO se le pasa ademas LA VENTANA de la cabina (donde termina el parabrisas): el
      // buque se encuadra contra el hueco que la cabina deja ver, no contra la pantalla. Lo sabe el
      // render de la cabina, lo decide el sistema, y los junta aca — que es el trabajo de este
      // archivo. Se pide ANTES de dibujar porque el buque va primero: es mundo.
      world.drawApproachBarge(objectiveDist, objectiveShip,
        S.state === 'pulso' ? pulso.shipFx(pulsoRender.ventana(cine.state(), run.t)) : null,
        runClimax() === 'pasada' && S.state !== 'pulso');
      // LAS PAREDES DEL CALLEJON (zigzag Z3) van DESPUES del buque de aproximacion, y esto es
      // orden de profundidad, no capricho: el buque objetivo esta a UN KILOMETRO y las laderas
      // dentro de los 260 m, asi que los cerros TAPAN al buque y a los hongos de flak que lo
      // rodean. Dibujadas antes (primera version), las nubes del buque aparecian FLOTANDO POR
      // ENCIMA del terreno — se veia el humo de un antiaereo lejano pintado sobre un cerro que
      // esta mucho mas cerca.
      //
      // Siguen ANTES del marcador de objetivo y de los obstaculos: el marcador es informacion que
      // no se puede tapar, y los obstaculos viven adentro del carril, mas cerca que las paredes.
      drawParedes();
      world.drawObjectiveMarker(objectiveDist);                // cuña roja en el horizonte: hacia donde vamos
      world.drawWake();
      // malla del techo de deteccion del radar. NO en EL PULSO: es un instrumento del PASILLO —
      // dice a que altura te ven— y en la cinematica del premio no hay nada que decidir con eso.
      // Aparecio sola cuando la salida paso a trepar de verdad (la trepada cruza RADAR_ALT) y lo
      // que se ve es una reja roja tapando el buque que se hunde.
      if (cfg.radarNet && S.state !== 'pulso') world.drawRadarNet();
      if (cfg.hitboxes) world.drawHitboxes();   // depuracion: cajas de colision en verde fluor
      if (cfg.devcam && S.state === 'play') world.drawFlightLane(testRadio);   // modo camara: el carril del avion

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
          const s = proj(sd.x, sd.gy || 0, sd.z);   // T3: parado en SU loma, no en el cero del mundo
          // HOJA de sprites si ya cargo; si no, el soldado dibujado a mano (ver render/soldiers.js)
          if (sd.prone > 0) {
            if (soldierArt.isReady()) soldierArt.drawProne(ctx, s.x, s.y, s.k, sd.dir, sd.bergen);
            else world.drawSoldierProne(s.x, s.y, s.k, sd.dir);
            continue;
          }
          if (soldierArt.isReady()) soldierArt.drawRunBack(ctx, s.x, s.y, s.k, run.t * 11 + sd.ph, sd.dir, sd.bergen);
          else world.drawSoldier(s.x, s.y, s.k, Math.sin(run.t * 12 + sd.ph));
        }
      }

      // obstáculos de lejos a cerca
      const all = obstacles.slice().sort((a, b) => b.z - a.z);
      for (const o of all) if (o.z > 3) world.drawObstacle(o);

      // LA COLA, primera pasada: lo que esta MAS LEJOS que el avion (la ventana frontal, la
      // salida, las trazadoras que ya te pasaron). Lo que quedo mas cerca se dibuja despues del
      // avion — ver el segundo llamado, abajo de drawPlane.
      drawCaza(true);

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
          // MISIL GUIADO de frente (radar / AA / camion): ojiva oscura con el ESCAPE encarandote
          // — un punto blanco caliente con corona naranja que late — y estela de humo que queda
          // atras abriendose. Antes era un cuadrado blanco con otro naranja abajo: dos pixeles
          // apilados, sin direccion ni amenaza.
          for (let i = 3; i >= 1; i--) {
            const sm = proj(m.x + Math.sin(run.t * 7 + i * 2) * 0.25, m.y + 0.25 + i * 0.14, m.z + i * 2.8);
            const r = Math.max(1, sm.k * (0.42 + i * 0.16));
            ctx.globalAlpha = 0.32 - i * 0.08;
            px(sm.x - r / 2, sm.y - r / 2, r, r, '#8d9490');
          }
          ctx.globalAlpha = 1;
          const fl = 0.75 + Math.sin(run.t * 30 + m.z) * 0.25;          // la llama late
          ctx.globalAlpha = 0.5;
          px(s.x - 0.85 * k * fl, s.y - 0.85 * k * fl, 1.7 * k * fl, 1.7 * k * fl, '#f07c22');  // corona
          ctx.globalAlpha = 1;
          px(s.x - 0.6 * k, s.y - 0.6 * k, 1.2 * k, 1.2 * k, '#2e3336');                        // ojiva
          px(s.x - 0.6 * k, s.y - 0.6 * k, Math.max(1, 0.45 * k), 1.2 * k, '#4a5257');          // canto
          px(s.x - 0.3 * k, s.y - 0.3 * k, Math.max(1, 0.6 * k), Math.max(1, 0.6 * k), '#fff6d8');  // escape
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
        // EL MISIL, del sprite horneado (tools/bake_ammo.html). Va DE COLA PURA (vista 0): se
        // aleja derecho por el eje de tiro, asi que no hay nada que verle de costado.
        //
        // SI LA HOJA NO CARGO, la receta de rectangulos de siempre — cuerpo blanco, ojiva gris,
        // banda y aletas. Misma regla que la cabina: un asset que falta no deja un agujero.
        if (!muni.dibujar(muni.MISIL, 0, s.x, s.y, L * 1.5)) {
          px(x0, yTip + L * 0.18, w, L * 0.82, '#e9edf0');                      // cuerpo blanco
          px(x0, yTip + L * 0.18, Math.max(1, w * 0.4), L * 0.82, '#ffffff');   // brillo del canto
          px(x0, yTip, w, L * 0.2, '#9aa3ab');                                  // OJIVA gris
          px(x0, yTip + L * 0.42, w, Math.max(1, L * 0.06), '#3d444a');         // banda oscura
          const fw = Math.max(1, k * 0.45);                                     // ALETAS traseras
          px(x0 - fw, yTip + L * 0.72, fw, Math.max(1, L * 0.2), '#c9d0d6');
          px(x0 + w, yTip + L * 0.72, fw, Math.max(1, L * 0.2), '#c9d0d6');
        }
        // LLAMA del cohete: nucleo claro que se afina, con parpadeo
        const fl = L * (0.3 + Math.random() * 0.25);
        px(x0, yTip + L, w, fl, '#ffd479');
        px(x0 + w * 0.25, yTip + L, Math.max(1, w * 0.5), fl * 0.6, '#fff3cf');
        px(x0 + w * 0.25, yTip + L + fl, Math.max(1, w * 0.5), fl * 0.5, '#e8842a');
        // ESTELA DE HUMO: EL REGUERO (render/reguero.js), la misma mecanica que el humo de tobera
        // y los vortices de punta del avion, en su version de misil — mas grande y blanca.
        //
        // Antes eran cuatro puntos muestreados hacia atras en z: una recta calculada desde donde
        // el misil esta AHORA, o sea que se movia rigida con el. El reguero deja el humo DONDE EL
        // MISIL PASO y ahi se queda abriendose, que es lo que hace que se lea de donde salio.
        humear(regMisil(pm), s.x, s.y, Object.assign({ t: run.t, f: 1, on: true, corta: true }, MISIL));
        ctx.globalAlpha = 1;
      }
      // NIEBLA: al final del mundo y ADENTRO del giro. Va acá y no antes porque tiene que tapar
      // los obstáculos — que es lo único que la vuelve una mecánica y no un filtro de color.
      world.drawFog();
      }   // ---- fin mundo 2D ----

      // CORDON DE BRUMA: el telon del final del pasillo. Va afuera del bloque 2D (tiene que tapar
      // igual si el fondo lo pone three) pero ADENTRO del giro: es aire del mundo, rola con el.
      if (S.state !== 'arena' && S.state !== 'momentum') world.drawVeil(veilNow());

      // NIEBLA DE GUERRA (cfg.marco, render/marco.js): el velo de los COSTADOS, lo que no es
      // pasillo. Mismo lugar que el cordon —afuera del bloque 2D, adentro del giro— y por la
      // misma razon: tiene que tapar igual con el fondo puesto por three, y es aire del mundo.
      //
      // SOLO EN EL PASILLO, y la lista es explicita: en el ARENA y en la PASADA se vuela libre
      // alrededor del buque, no hay carril, y un marco ahi seria una viñeta mintiendo sobre
      // una zona jugable que no existe.
      if (MARCO_STATES.includes(S.state)) drawMarco();

      // fin del HORIZONTE GIRATORIO: de aca en adelante todo va NIVELADO — el avion, su mira, la
      // formacion y los popups son el lado "cabina", igual que en el momentum.
      if (hzW) ctx.restore();

      // LLUVIA: entre vos y el mundo, pero DETRAS de tu propio avion. Va fuera del giro a
      // proposito — lo que rota es la direccion de caida (ver render/rain.js).
      drawRain();

      // CAMPAÑA: durante el relevo, el averiado se ve YENDOSE (banqueado, chico, con humo).
      // Va antes que drawPlane: esta mas lejos — pintor correcto respecto del que entra.
      if (S.state === 'relevo' && squad.rosterActive() && squad.relevo())
        squadRender.drawFallen({ selPlane, rv: squad.relevo() });
      // EL LIDER de la PERSECUCION: siempre esta mas lejos que vos (es la definicion del modo), asi
      // que va antes del avion y no necesita el reparto en dos pasadas que si necesita LA COLA.
      drawPersec(selPlane);
      // LA CHANCHA: siempre esta MAS LEJOS y mas arriba que vos (sostiene formacion adelante), asi
      // que va antes del avion — pintor correcto respecto del que entra a la canasta.
      drawChancha();
      // en el climax (arena, pasada o fallback) el avion lo pone su propio render. EL PULSO se ve
      // DESDE LA CABINA y tampoco lo dibuja —el sprite en tercera quedaba a la vista en cuanto la
      // cinematica baja el canopy: dos camaras del mismo avion— SALVO cuando la cinematica pide
      // expresamente la camara de tercera (`cam: 'chase'`), que es el plano en el que la pirueta
      // del premio se VE salir en vez de leerse como un horizonte que gira.
      const chase = S.state === 'pulso' && cine.cam().modo === 'chase';
      // EN LA CABINA DEL PODER RASANTE tampoco se dibuja el sprite, y por la misma razon que en la
      // cabina del PULSO: la camara esta ADENTRO del avion, asi que un avion en tercera en el mismo
      // cuadro serian dos aviones. Con la camara 'cola' si se dibuja — ahi la gracia es justamente
      // verlo siluetado contra el cielo.
      // LOS ACTORES, ANTES del avion del jugador: vuelan MAS LEJOS (z mayor), asi que el pintor
      // correcto los pone atras. Van adentro del giro del horizonte por la misma razon que el
      // resto del mundo — si el mundo se inclina, ellos se inclinan con el.
      drawActores(selPlane, wingmv.state());
      // …y sus tiros, en el mismo plano y con el mismo criterio de pintor. Se dibujan FRIOS: el
      // naranja es de lo que lastima, y esto no puede lastimar a nadie (ver render/teatro.js).
      drawTiros(teatro.state());
      if (!rasante.enCabina()
        && (chase || (S.state !== 'dead' && S.state !== 'momentum' && S.state !== 'arena' && S.state !== 'pasada' && S.state !== 'pulso'))) drawPlane(selPlane, viewMouse, squadZoom() * rasante.zoom());
      // LA COLA, segunda pasada: lo que quedo MAS CERCA que el avion — el sobrepaso enorme
      // cruzandote y las trazadoras que te estan pasando ahora. Va DESPUES del sprite porque
      // efectivamente esta entre vos y la camara: dibujarlo antes lo dejaria por detras del ala.
      drawCaza(false);
      // la FORMACION del escuadron: SOLO en el despegue y en su salida de plano al CONTROL
      // LIBRE. Nunca durante el PASILLO en si — es costo de render que no aporta y taparia el juego.
      {
        const ex = squad.exitState();
        if (run.squad > 1 && cfg.start !== 'air' && (S.state === 'takeoff' || (S.state === 'play' && ex !== null)))
          squadRender.drawFormation({ selPlane, exit: S.state === 'play' ? Math.min(1, ex / squad.EXIT_T) : null });
      }

      // líneas de velocidad
      ctx.globalAlpha = 0.5;
      for (const s of streaks) {
        // el LARGO del trazo lo trae la linea (9 por omision, lo de siempre). Lo estira quien la
        // creo: en primera persona el punto de fuga esta en tu cara y una raya de nueve pixeles no
        // se lee como velocidad, se lee como caspa.
        const L = s.L || 9;
        // …y DE DONDE SALEN. Por omision, del horizonte: es el punto de fuga cuando la camara mira
        // el mundo desde afuera. Desde la CABINA no: el punto de fuga del aire que te pasa esta
        // donde apunta el morro, bastante mas abajo del horizonte, y con las lineas naciendo
        // arriba parecian venir de atras del riel del canopy en vez de barrerte el vidrio.
        const cy = HOR - 4 + (s.dy || 0);
        const x1 = W / 2 + Math.cos(s.a) * s.r, y1 = cy + Math.sin(s.a) * s.r * 0.62;
        const x2 = W / 2 + Math.cos(s.a) * (s.r + L), y2 = cy + Math.sin(s.a) * (s.r + L) * 0.62;
        ctx.strokeStyle = P.foam;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // en momentum/arena, particulas y popups los dibuja su propio render (nivelados, sobre el
      // barco); dibujarlos tambien aca dejaria una copia fantasma
      if (S.state !== 'momentum' && S.state !== 'arena' && S.state !== 'pasada') {
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
      // EL DESENFOQUE DEL TURBO: barrido radial del mundo desde el punto de fuga, con el avion a
      // foco adentro de un hueco. Va sobre el MUNDO y bajo el HUD, en el mismo escalon que el
      // tinte del momentum y por la misma razon: es el AIRE el que cambia, no los instrumentos.
      // La condicion es la MISMA que enciende la llama de la tobera (plane.js): sin nafta no hay
      // turbo, y un mundo barrido sin llama seria el juego contradiciendose a si mismo.
      // EL MOMENTUM TRAE EL MISMO BARRIDO Y OTRO MARCO — mucho mas cerrado (ver desenfoque.js). Va
      // ANTES del tinte frio y la viñeta de aca abajo, que siguen intactos: aquello es el color del
      // tiempo partido, esto es el encierro. Se ven los dos.
      drawDesenfoque(S.state === 'play' && run.boost && run.fuel > 0 ? 1 : 0,
                     S.state === 'play' && tempo.active() ? 1 : 0,
                     S.state === 'play' && rasante.active() ? 1 : 0);
      // MOMENTUM: tinte frio + viñeta mientras el tiempo esta partido. Va sobre el MUNDO y bajo
      // el HUD: la cabina sigue nitida — es el aire el que cambia, no los instrumentos.
      if (S.state === 'play' && tempo.active()) {
        ctx.fillStyle = 'rgba(120,170,255,0.08)'; ctx.fillRect(0, 0, W, H);
        const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.9);
        vg.addColorStop(0, 'rgba(4,8,18,0)'); vg.addColorStop(1, 'rgba(4,8,18,0.55)');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      }
      // HUD en GRILLA DE DISEÑO (320x180): se dibuja con ctx.scale(U). Ver la nota de DW/DH en
      // render/ctx.js — U x SC da 3 exacto, asi que no hay medio pixel ni borroneo.
      // LA CINTA DE FORMACION va ADENTRO del ctx.scale(U): es HUD, o sea grilla de DISEÑO (320x180),
      // no de mundo. Ojo con esto — `drawPersec` (el avion del lider) se dibuja arriba, FUERA del
      // scale, porque eso si es mundo. Los dos espacios de coordenadas del repo, en un solo archivo.
      if (S.state === 'play') {
        ctx.save(); ctx.scale(U, U); hud.drawHUD({ best, gameMode, curLevel, objectiveDist, objectiveShip, goalKind: objectiveKind,
          // EL PODER RASANTE va por snapshot (convencion 4): el lint de capas prohibe que el
          // render importe de systems, y la lista de excepciones solo puede achicarse.
          ras: { on: rasante.active(), meter: rasante.meterVal(), resta: rasante.restante(), dur: RAS_DUR } }); drawCinta(); ctx.restore();
        // LA RADIO EN VUELO va en el espacio de DISEÑO (320x180) y se dibuja al final: es lo
        // ultimo que entra, arriba de todo. QUE FORMA tiene la elige el jugador en OPCIONES —
        // TOAST (una linea que pasa) o PANEL (las ultimas cuatro, como un chat). Las dos respetan
        // la misma banda y ninguna toca la UI (SPEC_CHARLAS_VUELO §0b).
        ctx.save(); ctx.scale(U, U);
        if (cfg.radioUI === 'panel') screens.drawRadioPanel(); else screens.drawRadioVN();
        ctx.restore();
      }
      if (S.state === 'momentum' && momentum.active()) momRender.drawMomentum({
        mom: momentum.active(), momPhase: momentum.phase(), phases: momentum.phases(), msl: run.msl, objectiveShip, t: run.t,
        is3D: world3D.isOn(), parts, popups, mouse,
        momCam: momentum.cam, momShipGeom: momentum.shipGeom, momZoneRect: momentum.zoneRect });
      if (S.state === 'arena' && arena.active()) arenaRender.drawArena({
        arena: arena.active(), zones: arena.zonesOf(), view: arena.view(), objectiveShip,
        pip: arena.pipId(), parts, popups, selPlane, t: run.t });
      if (S.state === 'pasada' && pasada.active()) pasadaRender.drawPasada({
        pasada: pasada.active(), zones: pasada.zonesOf(), view: pasada.view(), objectiveShip,
        impact: pasada.impactPoint(), eje: pasada.axisAlign(), oleada: pasada.oleada(),
        parts, popups, selPlane, t: run.t });
      // EL PULSO: la cabina y la autopista de la secuencia, ENCIMA del mundo 2D congelado — el
      // mar, el horizonte y el buque son los del pasillo (no hay escena nueva que dibujar).
      // EL DIRECTOR entra por parametro (convencion 4): el premio del PULSO es una timeline de
      // data/cines.js y su reloj vive alla, no adentro del modo.
      if (S.state === 'pulso' && pulso.active()) pulsoRender.drawPulso({ Q: pulso.state(), cine: cine.state(), t: run.t });
      ctx.restore();
      // ...y el telon ABRIENDOSE del otro lado: entraste al climax cruzando el banco
      if (veilOut > 0 && (S.state === 'arena' || S.state === 'momentum')) world.drawVeil(veilOut / VEIL_OUT);

      // MENUS Y PANTALLAS: tambien en grilla de diseño (320x180), escaladas por U
      ctx.save(); ctx.scale(U, U);
      if (inLobby()) screens.drawPpalBg(ppalPrev, ppalIdx, ppalFade);   // portada / lobby
      if (S.state === 'takeoff') hud.drawTakeoff(toT);
      if (S.state === 'relevo' && squad.relevo()) squadRender.drawRelevo(squad.relevo());
      if (S.state === 'menu') {
        menus.drawMenu({ selPlane, gameMode, t: run.t });
        // ahora se hace aca, antes de dibujar
      }
      // DERRIBADO: esperar a que se vea el destrozo; despues la pantalla sube con un fade corto
      if (S.state === 'dead' && deathT > DEATH_REVEAL)
        screens.drawDead({ score: run.score, best, deathCause, deathT, factIdx, t: run.t,
          reveal: Math.min(1, (deathT - DEATH_REVEAL) / 0.35), stars: deadStars, awardT: deathT - DEATH_REVEAL - 0.2, bg: deadBg,
          out: squad.rosterActive() });   // campaña: la escuadrilla quedo fuera de combate, no "derribado"
      if (S.state === 'results') screens.drawResults({ lastRun, resRow, resT, t: run.t, bg: winBg });
      if (S.state === 'brief') screens.drawBrief({ mission: curMission(), goalLabel: goalOf(curMission()).label(curMission().goal), briefT, t: run.t });
      if (S.state === 'victory') screens.drawVictory({ score: run.score, levelT, t: run.t });
      if (S.state === 'epilogue' || S.state === 'story')
        screens.drawStory({ dlg, state: S.state, t: run.t, canAdvance: dialogue.canAdvance() });
      // EL INTERSTICIAL VA ACA ADENTRO, con la historia y no con los menus: dibuja en la grilla de
      // DISEÑO (320x180) y necesita el `scale` puesto. Afuera del restore pintaba un rectangulo de
      // 320x180 en coordenadas nativas y el mundo se veia asomando por los costados.
      if (S.state === 'inter') screens.interstitial(interTxt, interDur ? interT / interDur : 1, run.t);
      ctx.restore();
      // PORTADA y MODOS van en coordenadas NATIVAS (fuera del scale): mas pixeles por letra.
      // El fondo (drawPpalBg) si va escalado — es la grilla de diseño y cubre toda la pantalla.
      if (S.state === 'title') menus.drawTitle({ t: run.t });
      if (S.state === 'modeselect') menus.drawModeSelect({ modeSel, t: run.t });
      // submenu de HISTORIA y lista de partidas: nativas como el selector de modos (puro texto)
      if (S.state === 'campmenu') menus.drawCampMenu({ sel: campSel, rows: campRows(), t: run.t });
      if (S.state === 'quickmenu') menus.drawQuickMenu({ sel: quickSel, rows: quickRows(), t: run.t });
      if (S.state === 'pruebas') menus.drawPruebasMenu({ sel: prbSel, rows: prbRows(), t: run.t });
      if (S.state === 'cines') menus.drawCinesMenu({ sel: cinSel, rows: cinRows(), t: run.t });
      if (S.state === 'maniobras') menus.drawManiobrasMenu({ sel: mvSel, rows: mvRows(), t: run.t });
      if (S.state === 'mvvars') menus.drawMvVarsMenu({ sel: mvVarSel, rows: mvVarRows(), t: run.t, mv: mvPick });
      if (S.state === 'misiones') menus.drawMisionesMenu({ sel: misSel, rows: misRows(), modo: MIS_MODOS[misModo], t: run.t });
      if (S.state === 'saves') menus.drawSaves({ list: saves.listSaves(), sel: savesSel, t: run.t });
      // EL BANCO DEL PICHON: pantalla de mejora entre misiones. Desde M8 (muerto el Pichon,
      // indice 7) las mejoras salen de su libreta y la pantalla cambia de nombre.
      if (S.state === 'upgrade') menus.drawUpgrade({ offer: upgOffer, sel: upgSel, t: upgT, libreta: curLevel >= 7 });
      // PAUSA: overlay en nativas, encima de todo lo del mundo (el fade de historia va despues,
      // pero con el juego pausado nunca conviven)
      if (paused) menus.drawPause({
        view: pauseView, sel: pauseSel, saveSel, rows: pauseRows(),
        saveRows: pauseSaveRows(), t: pauseT, msg: pauseT - pauseMsgT,
      });
      // NOMBRES DE LOS BOTONES SEGUN EL MANDO. El juego se escribio con nomenclatura PlayStation
      // (✕ ◯ □ △, L1/R1, gatillo) y los bindings NO cambian: en el mapeo estandar de la Gamepad API
      // el boton 0 es ✕ en PlayStation y A en Xbox, y estan en el MISMO lugar. Lo unico que cambia
      // es el cartel — leer "◯" con un mando que dice "B" es la diferencia entre que se entienda o no.
      // Es una sustitucion sobre el texto ya traducido para no duplicar la tabla `ctrl*` entera en
      // los dos idiomas por cada familia de mando.
      const padTxt = t => padInfo.kind !== 'xbox' ? t : t
        .replace(/✕/g, 'A').replace(/◯/g, 'B').replace(/□/g, 'X').replace(/△/g, 'Y')
        .replace(/\bL1\b/g, 'LB').replace(/\bR1\b/g, 'RB').replace(/\bL2\b/g, 'LT')
        .replace(/gatillo|trigger/gi, 'RT');   // 'cruceta' se deja: vale para las dos familias
      if (S.state === 'options') menus.drawOptions({
        t: run.t, sel: optRow,
        rows: OPT_ROWS.map(r => {
          if (r.head) return { head: T(r.head) };
          if (r.cols) return { cols: [T('optColKb'), T('optColPad')] };
          if (r.note) return { note: T(r.note) };
          if (r.ctrl) return { ctrl: T(r.ctrl), kb: T(r.kb), pad: padTxt(T(r.pad)) };
          if (r.open) return { label: r.label(), value: r.value() };   // fila que ABRE otra pantalla
          let i = r.opts.findIndex(o => o === r.get()); if (i < 0) i = 0;
          return { label: r.label(), value: r.names()[i], preview: r.preview, raw: r.opts[i] };
        }),
      });
      // MEJORAS DEL PICHON: mismo snapshot de solo lectura que OPCIONES. `card` se resuelve acá
      // (es una función en la fila) para que el render siga sin tocar nada del juego.
      if (S.state === 'mejoras') menus.drawMejoras({
        t: run.t, sel: mejSel,
        rows: mejRows().map(r => {
          if (r.head) return { head: r.head() };
          let i = r.opts.findIndex(o => o === r.get()); if (i < 0) i = 0;
          // la tarjeta tambien nombra botones (△ del eje Y): misma traduccion que CONTROLES
          const c = r.card();
          return { label: r.label(), value: r.names()[i], preview: r.preview, raw: r.opts[i],
                   sw: !!r.sw, swOn: r.get() === true,
                   card: c && { ...c, seq: padTxt(c.seq || '') } };
        }),
      });

      // FOGONAZO de la explosión cercana (D3): un destello corto sobre todo el cuadro. Va casi al
      // final —encima del mundo y del HUD— porque es luz que te da en la cara, no algo del mundo.
      if (run.flash > 0.01) {
        ctx.globalAlpha = Math.min(0.62, run.flash * 0.62);
        ctx.fillStyle = '#ffd9a0';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      // EL SELLO DEL MODO PRUEBAS SE FUE (playtest 29/8). Estuvo arriba al medio para distinguir
      // una captura de herramienta de un playtest de verdad, y se mudo dos veces esquivando cosas:
      // primero la esquina derecha (ahi vive el reproductor) y despues el centro, donde terminaba
      // encima del titulo de la PASADA y del nombre del blanco. Un rotulo que no cabe en ningun
      // lado sin tapar algo es un rotulo que el HUD no tiene lugar para tener: quien saca la
      // captura sabe si esta en una prueba, y `S.test` sigue existiendo para todo lo demas.

      // EL DIRECTOR, lo que dibuja el: las bandas negras y su propio fundido. Va antes del fundido
      // de mision porque son dos cosas distintas —uno es de la escena, el otro del cambio de
      // pantalla— y el de mision tiene que poder tapar al de la escena.
      drawCine(cine.state());

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











    /** Densidad del telon en el PASILLO (0..1). La apertura del climax va por veilOut. */
    function veilNow() {
      if (objectiveDist <= 0) return 0;
      // SIN CORTE (SPEC_MODO_PASADA RF-01): el cordon de bruma es, mirado de frente, un FADE — se
      // cierra a pared sobre el buque y es lo que esconde el salto al 3D del arena. La pasada no
      // lo quiere: ahi el mundo se abre y ya, sin telon. Es la diferencia entera entre los dos
      // climax dicha en una linea.
      if (runClimax() === 'pasada') return 0;
      if (S.state !== 'play' && S.state !== 'dead' && S.state !== 'relevo') return 0;
      const t = Math.max(0, Math.min(1, (run.dist / objectiveDist - VEIL_IN) / (VEIL_FULL - VEIL_IN)));
      // CUADRATICA: acompaña la disipacion de la niebla desde media aproximacion sin molestar
      // (a mitad de camino apenas se nota) y cierra fuerte sobre el buque (pedido 10/8).
      return t * t;
    }

    // SONDA VISUAL (dev): salta a una fraccion del pasillo y/o prende MODO CAMARA sin pasar por
    // el menu. Es la unica forma de MIRAR la aproximacion al buque desde una captura
    // automatizada: volando de verdad no se llega vivo al tramo final del pasillo.
    // estado de la PAUSA y de la pantalla para las sondas (mismo patron que __wjump).
    // SE LLAMABA __pdbg y se renombro al construir la fase PASADA: el spec de ese modo pide
    // `__pdbg` para SU sonda y el nombre estaba ocupado por esto, que no es la pasada sino la
    // pausa. (__udbg tampoco servia: ya es el del BANCO DEL PICHON, mas abajo.) Lo usa tools/smoke.js.
    // ---------- SONDAS DE LA COLA (QUITAR al cerrar PLAN_HARRIERS_PERSECUCION) ----------
    // El duelo es un evento de menos de un minuto que aparece cada tanto: mirarlo una vez, sin
    // esto, cuesta volar medio nivel y tener suerte.
    //   __czstart([{mudo}])  arma el duelo ya mismo
    //   __czdbg()            el estado: fase, reloj, pasada, solucion de tiro, donde esta
    //   __czfase('sobrepaso') salta a una fase — es lo que permite fotografiar el cruce cercano,
    //                        que dura 1,15 s dentro de un ciclo de casi un minuto
    if (typeof window !== 'undefined') {
      // __lastRun: el RECUENTO congelado de la ultima mision (QUITAR con el resto de las sondas).
      // Sin esto no hay forma de verificar desde afuera que el premio de un climax entro al
      // desglose de puntos — la pantalla de resultados es texto dibujado, no un dato leible.
      window.__lastRun = () => lastRun;
      // el estado de la maquina, para verificar la cadena de posmision (G-09) desde afuera
      // salta el intersticial en curso y dispara lo que venia despues: sirve para recorrer la
      // cadena de posmision sin esperar los segundos de negro.
      window.__interYa = () => { const f = interNext; interNext = null; interDur = 0; if (f) f(); return S.state; };
      window.__estado = () => JSON.stringify({ st: S.state, nivel: curLevel, inter: interTxt, interT: +interT.toFixed(2), interDur, oferta: upgOffer.length, runT: +run.t.toFixed(2) });
      window.__czstart = o => caza.start(o || {});
      window.__czdbg = () => caza.dbg();
      window.__czfase = f => caza.forceFase(f);
      window.__czcalma = v => { cazaCalma = v !== 0; return cazaCalma; };
      // H2/H3: lo que hace falta para medir la solucion de tiro y el contraataque.
      //   __czalto(y)   CLAVA la altura Y EL RUMBO del avion (null los suelta). Tiene que ser
      //                 sostenido y no un empujon: la regla del ras se mide en segundos de vuelo, y
      //                 con el gas apretado el avion se sale de la banda antes de terminar.
      //                 CLAVA TAMBIEN LA x, y no es un extra: "rumbo predecible" es lo que el
      //                 sistema mide, y el avion a gas pleno deriva de costado lo suficiente como
      //                 para que la solucion se lea como un quiebre permanente y no suba nunca.
      //   __czquiebre() un tiron lateral: es lo que el sistema lee como "quebro" (mide tu propio
      //                 cuadro anterior, no el input, asi que no hay que fingir una tecla)
      //   __czmv(mv)    inyecta una pirueta POR UN CUADRO y la restaura despues, para probar que
      //                 el BREAK/JINK/S-TURN fuerzan el sobrepaso sin tocar el motor de piruetas
      window.__czalto = y => { czAlto = y === null || y === undefined ? null : +y; czAltoX = plane.x; return czAlto; };
      // EL QUIEBRE ES SOSTENIDO, no un empujon. La primera version saltaba la x 14 unidades en un
      // cuadro y la prueba daba en rojo con razon: un teletransporte de un cuadro le saca a la
      // solucion de tiro menos de lo que recupera en el cuarto de segundo siguiente. Un BREAK TURN
      // de verdad son ~45 u/s de desplazamiento lateral durante tres decimas, y eso es lo que esto
      // reproduce — moviendo el ANCLA del pin de rumbo, no la posicion, para que el pin no lo borre.
      //   __czspd(v)    CLAVA run.spd (null lo suelta). Es con lo que se mide que la velocidad
      //                 de cierre sea RELATIVA: mismo Harrier, dos velocidades, dos tiempos.
      window.__czspd = v => { czSpd = v === null || v === undefined ? null : +v; return czSpd; };
      window.__czquiebre = () => { czBrk = 0.35; return true; };
      window.__czmv = mv => { czMv = mv || null; return czMv; };
      window.__czsol = v => { caza.setSol(+v); return true; };
      // el modelo de averias, para poder MEDIR un impacto. En 'squad' un toque te tira y la partida
      // se va a la pantalla de derribado: no queda nada que leer despues del golpe. En 'integ' el
      // mismo impacto se lee como un numero que baja, que es lo que el fixture necesita.
      window.__czmodo = m => { cfg.dmgMode = m; run.integ = 100; return cfg.dmgMode; };
      window.__czinteg = () => run.integ;
      window.__czfinal = f => caza.setFinal(String(f));
      window.__czasoma = () => caza.asomando();
      window.__czpegar = n => caza.pegar(+n);
      window.__czfin = () => { caza.resetCaza(); return true; };
      // H4: el director se prueba PURO — se le pasa el contexto y los segundos de golpe, y la
      // respuesta correcta a cada puerta cerrada es "no armes nada".
      window.__czdir = (o, s) => caza.dirPaso(o, +s);
      window.__czdirN = (o, n) => caza.dirN(o, +n);
      // ---------- SONDAS DE LA PERSECUCION (QUITAR al cerrar PLAN B) ----------
      //   __psdbg()      el estado del lider: distancia, banda, gracia, velocidad suya y tuya
      //   __psdist(d)    lo pone a esa distancia — mirar los extremos de la banda sin volar hasta
      //                  ellos, que es medio minuto de gas por cada extremo
      //   __psobs()      los obstaculos solidos cerca del lider (lo lee el vigilante del fixture)
      //   __pscarril(n)  sortea n carriles y cuenta cuantos caen en el corredor reservado
      window.__psdbg = () => persec.dbgPersec();
      window.__psstart = o => persec.startPersec(o || { infinito: true });
      window.__psdist = d => { persec.setDist(+d); return true; };
      window.__psobs = () => persec.obsCerca();
      window.__pscarril = n => persec.carrilTest(+n);
      window.__psrec = m => { persec.setRec(+m); return true; };
      window.__psinf = v => { persec.setInf(+v !== 0); return true; };
      window.__psfin = () => { persec.resetPersec(); return true; };
      window.__pstiron = f => persec.setTiron(+f);
      window.__psgracia = v => { persec.setFuera(+v); return true; };
      // EL TANQUE. El fixture es minuto y medio de vuelo real y el combustible es el reloj del run:
      // sin esto las ultimas secciones miden un mundo detenido por falta de nafta y culpan al tiron.
      window.__psnafta = () => { run.fuel = 100; return true; };
      window.__pscaer = m => persec.caerLider(m || undefined);
      window.__psscore = () => Math.floor(run.score);
      // VUELO NIVELADO para el fixture. Es la misma sonda que `__czalto` (clava altura y rumbo) y se
      // expone con otro nombre porque en PERSECUCION resuelve otro problema: sin ella el fixture
      // tiene que sostener una tecla para no caerse al mar, y la unica que sirve (W) es CABECEO —
      // o sea que el avion trepa, y trepar cuesta velocidad, y el lider se le escapa por una razon
      // que no tiene nada que ver con lo que la seccion esta midiendo. Nivelado, run.spd converge
      // a su nominal y la banda se puede medir.
      window.__psnivel = y => window.__czalto(y);
    }
    // SONDA DE LA CHANCHA (QUITAR con el resto): llena la barra y adelanta el reloj de la mision.
    // La mitad del reloj vive aca y no en el sistema porque `run` es del orquestador — y sin esto
    // cada paso del fixture tendria que jugar CH_MIN_T segundos de verdad (cuatro minutos por
    // corrida) para llegar a apretar la tecla.
    if (typeof window !== 'undefined') {
      window.__chaset = (p2, seg) => {
        chancha.cargar(p2 === undefined ? undefined : +p2);
        if (seg !== undefined) run.t = +seg;
        return window.__chadbg();
      };
      window.__chacall = () => { pedirChancha(); return window.__chadbg(); };
      window.__chaput = (x, y) => { plane.x = +x; plane.y = +y; plane.vy = 0; return JSON.stringify({ x: plane.x, y: plane.y }); };
      // los otros dos gates, puestos desde afuera: el COMBUSTIBLE apagado (donde el poder no
      // existe) y la MISION posterior a la rotura del guion. Se escriben las CAUSAS —cfg.fuelOn y
      // la mision de campaña— para que el fixture ejercite los mismos `if` que el juego.
      window.__chafuel = v => { cfg.fuelOn = !!v; return cfg.fuelOn; };
      // el MODO, que es la otra mitad del gate de zona (RF-07). Se escribe la causa —gameMode— y
      // no el resultado, asi la sonda ejercita el mismo `if` que corre en el juego.
      window.__chamodo = m => { gameMode = String(m); return gameMode; };
      window.__chamis = n => { gameMode = 'campaign'; curLevel = +n; return JSON.stringify({ id: curMission().id, rota: curMission().chancha === false }); };
      // EL PRECIO (RF-05): arriba te ve el radar. No es un sistema nuevo —es el de siempre, que
      // mide altura— y justamente por eso hay que poder comprobar que la cita lo paga.
      window.__charadar = () => JSON.stringify({ det: +run.detection.toFixed(2), seen: !!run.radarSeen, mult: run.multShow });
      window.__chanafta = () => +run.fuel.toFixed(2);   // el tanque, que es lo que el poder viene a llenar
      window.__chagolpe = () => { run.shake = 6; return run.shake; };
      // CALMA para poder MIRAR la cita: la cita se vuela ARRIBA, y arriba el radar te ve y te
      // tiran. Es el mismo criterio que `__czcalma` en el duelo — la seccion que mide una cosa
      // apaga lo que no esta midiendo. En el juego normal esto no existe: que arriba te vean es
      // justamente el precio del poder (RF-05), y eso se prueba aparte.
      window.__chacalma = () => {
        obstacles.length = 0; missiles.length = 0; soldiers.length = 0;
        run.detection = 0; run.integ = 100;
        return true;
      };
    }
    if (typeof window !== 'undefined') window.__pausedbg = () => JSON.stringify({
      paused, view: pauseView, sel: pauseSel, saveSel, state: S.state,
      // EL CURSOR DE LOS MENUS, para que el smoke deje de navegar a ciegas. Agregar una fila al
      // selector principal corria los indices que tools/smoke.js apretaba de memoria y la prueba
      // entraba a OTRA pantalla, fallando mas abajo con un mensaje que no hablaba de menus. Paso
      // dos veces (PERSECUCION y PRUEBAS): ahora se puede navegar HASTA una fila por nombre.
      modo: MODES[modeSel], quick: (quickRows()[quickSel] || {}).id || null,
      prueba: (prbRows()[prbSel] || {}).id || null, test: S.test,
      // el reloj de la corrida y las sondas diferidas que faltan disparar: sin esto, un momento
      // que "no hace nada" no se distingue de una sonda que fallo (paso, y costo media hora)
      t: +run.t.toFixed(2), tareas: prbTasks.length,
      // LA MISION EN CURSO y a donde vuelve: sin esto el fixture del selector (S3) no puede decir
      // si la corrida que esta mirando es la que pidio ni si el fin de mision la va a encadenar.
      mision: (curMission() || {}).id || null, climax: climaxOf(curMission() || { goal: {} }), volver: testBack,
      // EL SELECTOR: fila apuntada y COMO se va a abrir (juego / cine / ambas). `cine` es el flag
      // de la corrida en curso, que no es lo mismo que el modo del menu: al volver del catalogo el
      // menu conserva su eleccion y la corrida ya termino.
      mis: (misRows()[misSel] || {}).id || null, misModo: MIS_MODOS[misModo], cine: testCine,
    });
    // LA MISION SUELTA (PLAN_MISIONES_FASES S0): jugar una mision AISLADA por id, que es como la
    // van a recorrer el selector y el fixture de S3. Devuelve la ficha de lo que se armo —climax,
    // roster, distancia— porque una sonda que solo dice "ok" no permite afirmar que la mision se
    // cargo ENTERA, que es justo lo que el criterio de cierre pide.
    //   __mision('m4')                    derecho al despegue
    //   __mision('m4', { historia: 1 })   pasando por el guion largo
    // QUITAR — sonda: elige un avion a mano. Existe para que la prueba del avion de campaña
    // pruebe el CABLEADO y no el mecanismo: si el fixture no ensucia antes la eleccion, "vuela un
    // Skyhawk" sale verde por el default y no afirma nada (la leccion de SPEC_AGUA_OLAS §9.9).
    if (typeof window !== 'undefined') window.__avion = n => {
      if (n != null) selPlane = ((n | 0) % PLANES.length + PLANES.length) % PLANES.length;
      return PLANES[selPlane].key;
    };
    if (typeof window !== 'undefined') window.__mision = (id, o) => {
      const i = misIdx(id === undefined ? 0 : id);
      if (i < 0) return null;
      const m = abrirMision(i, o);
      return JSON.stringify({
        id: m.id, i, state: S.state, test: S.test, volver: testBack,
        // el climax que DECLARA la mision (null = la cierra el PASILLO). No `runClimax()`: ese
        // cae a 'pasada' por defecto y solo se consulta cuando el objetivo lo pide, asi que en una
        // mision de distancia mentiria.
        climax: climaxOf(m), obj: Math.round(objectiveDist), buque: objectiveShip,
        // el AVION con el que quedo armada: la mision de campaña se vuela en A-4B venga por donde
        // venga, y sin esto la sonda no permitia afirmarlo (ver CAMPAIGN_PLANE)
        avion: PLANES[selPlane] && PLANES[selPlane].key,
        roster: (m.roster || []).length, vidas: run.lives,
        chancha: m.chancha !== false, story: !!m.story,
      });
    };
    // ---------- SONDAS DE LOS TRAMOS (SPEC_TRAMOS §4) — QUITAR al cerrar el item ----------
    // `__trdbg()` contesta que tramo rige AHORA y con que valores RESUELTOS: es lo unico que
    // permite afirmar desde afuera que el tramo esta gobernando de verdad y no que la mision
    // tiene esa densidad de casualidad. `__trset(lista)` inyecta tramos al run EN CURSO —sin
    // esto, medir una densidad exigiria editar `missions.js`, rebuildear y volver a volar— y
    // devuelve los errores del validador, que es la misma funcion que corre el unit test.
    if (typeof window !== 'undefined') {
      window.__trdbg = () => JSON.stringify(tramos.dbg(cfg));
      window.__trset = t => JSON.stringify(tramos.setTramosProbe(t, objectiveDist));
    }
    // ---------- SONDAS DEL ZIGZAG (PLAN_PASILLO_ZIGZAG §5) — QUITAR al cerrar el item ----------
    // `__zzdbg()` contesta lo RESUELTO de este cuadro (curvatura, deriva, si se sostiene con la
    // palanca, el corrimiento del carril a la profundidad de siembra), que es lo unico que
    // permite afirmar desde afuera que el trazado esta rigiendo. `__zzset(spec)` inyecta un
    // trazado al run EN CURSO y devuelve los errores del validador — la misma funcion que corre
    // el unit test; `__zzset(null)` devuelve el mando a la mision. Y `__zzbend(z)` es el numero
    // con el que el fixture compara EL DIBUJO contra el nucleo: si la pantalla y la tabla no
    // coinciden, el item esta mintiendo en algun lado.
    if (typeof window !== 'undefined') {
      window.__zzdbg = () => JSON.stringify(zigzag.dbg());
      window.__zzset = z => JSON.stringify(zigzag.setZigzagProbe(z));
      window.__zzbend = z => zigzagCore.bendW(+z);
      // CUANTO SE METE LA TIERRA a esa profundidad y de ese lado. Es la sonda del callejon: sin
      // ella, "hay puntas" solo se puede comprobar mirando una captura.
      window.__zzentra = (z, lado) => zigzagCore.paredEntra(+z, +lado);
      // ALTURA de la ladera ahi. Es la sonda que contesta "¿hay callejon en este punto?", que NO
      // es lo mismo que "¿hay una punta?": las puntas son intermitentes por diseño, asi que
      // medirlas en una ventana corta es tirar una moneda. La ladera, en cambio, esta o no esta.
      window.__zzalto = (z, lado) => zigzagCore.paredH(+z, +lado);
      // LA CARA de la ladera a esa altura, y ¿TAPA la ladera este punto? El segundo es el que
      // importa: la oclusion de los antiaereos de la loma no se puede comprobar mirando una
      // captura —hay que saber si el motor cree que se ve o no—. El OJO se puede pasar aparte
      // para poder preguntar "¿y desde arriba?" sin tener que trepar el avion hasta ahi.
      window.__zzcara = (z, lado, y) => zigzagCore.paredCara(+z, +lado, +y);
      // CUANTO LO RECORTA EL CERRO: 0 se ve entero, 1 asoma cortado, 2 no se ve nada. El OJO y la
      // distancia volada se pueden pisar (`ey`, `dv`) para poder preguntar "¿y desde arriba de las
      // crestas?" o barrer el callejon entero sin tener que volarlo — sin eso, la unica forma de
      // comprobar esto es mirar una captura y creerle.
      window.__zzcorte = (x, gy, alto, z, ey, dv) => {
        const c = techoLadera(+x, +z, undefined, ey === undefined ? undefined : +ey,
          dv === undefined ? undefined : +dv);
        if (c === null) return 0;
        const k = F / +z, base = HOR + ((ey === undefined ? cam.y : +ey) - +gy) * k;
        return c >= base ? 0 : c <= base - +alto * k ? 2 : 1;
      };
      // CENSO DE LOS ANTIAEREOS DE LA LADERA (Z5): cuantos hay arriba y cuantos abajo. Sin esto,
      // "estan en las lomas" solo se puede comprobar mirando una captura y creyendo.
      window.__zzaa = (detalle) => {
        let arriba = 0, agua = 0;
        const lista = [];
        for (const o of obstacles) {
          if (o.done || (o.type !== 'aa' && o.type !== 'aatruck')) continue;
          if (!o.enLadera) { agua++; continue; }
          arriba++;
          if (detalle) lista.push({
            x: +o.x.toFixed(1), gy: +(o.gy || 0).toFixed(1), z: +o.z.toFixed(0),
            // el alto del CERRO donde esta parado, y si el motor lo da por tapado
            h: +zigzagCore.paredH(run.dist + o.z, o.x >= 0 ? 1 : -1).toFixed(1),
            corte: window.__zzcorte(o.x, o.gy || 0, o.h || 3, o.z),
          });
        }
        return JSON.stringify(detalle ? lista : { arriba, agua });
      };
      // CENSO: cuantos obstaculos vivos quedaron DENTRO de la ladera. Tiene que ser 0 siempre —
      // un obstaculo enterrado en la roca es invisible y mata, la peor combinacion que hay.
      window.__zzobs = (detalle) => {
        // los de la LADERA no cuentan: estan PARADOS ARRIBA del cerro, no enterrados adentro.
        const malos = obstacles.filter(o =>
          !o.done && o.z > 0 && !o.enLadera && zigzagCore.enPared(o.x, (o.y || 0) + 0.5, run.dist + o.z, 0, 1));
        if (!detalle) return malos.length;
        return JSON.stringify(malos.map(o => ({ t: o.type, x: +o.x.toFixed(1), z: +o.z.toFixed(0), mv: !!(o.vx || o.mvA || o.home) })));
      };
    }
    // ---------- SONDAS DE LAS CHARLAS EN VUELO (SPEC_CHARLAS_VUELO §4) — QUITAR al cerrar ----------
    // `__cvdbg()` contesta LA FASE y los tres gates RESUELTOS (sembrar / avance / hablando), mas
    // la linea que se esta diciendo. Los gates van resueltos y no como estado interno por la
    // misma razon que en `__trdbg`: lo que hay que poder afirmar desde afuera es lo que los otros
    // modulos van a LEER este cuadro, no lo que este modulo cree.
    //
    // `__cvarm(id)` arma una charla a mano. El §4 solo pedia `?charla=`, pero esa sonda dispara
    // UNA vez por carga de pagina y las dos mitades del RF-06 —cortar y volver a disparar— piden
    // armarla dos veces en la misma corrida. Anotado como divergencia en el §7 del spec.
    if (typeof window !== 'undefined') {
      window.__cvdbg = () => JSON.stringify({
        ...charla.dbg(),
        // LA LINEA, leida del store del motor: es lo que prueba que la charla esta usando el
        // motor de siempre y no una copia.
        li: dlg.li, typed: dlg.typed, auto: dlg.auto,
        txt: dialogue.txtOf(dialogue.line()),
        // el corredor, tal como lo ve el drenaje
        obst: obstacles.length, sold: soldiers.length, msl: missiles.length,
        dist: Math.round(run.dist), fuel: +run.fuel.toFixed(2),
      });
      window.__cvarm = id => JSON.stringify({ ok: !!SCENES[id] && charla.armar(id), fase: charla.faseDe() });
      window.__cvcut = () => JSON.stringify({ cortada: charla.cortar(), fase: charla.faseDe() });
    }
    // LA CAMPAÑA LISTADA, para que el fixture del selector (S3) la recorra sin tener su propia
    // copia de las misiones: agregar una la mete en la red de regresion sola. Es la misma idea
    // que `__prb()` sin argumentos con el catalogo de PRUEBAS.
    if (typeof window !== 'undefined') window.__misiones = () => JSON.stringify(
      MISSIONS.map(m => ({ id: m.id, name: m.name, climax: climaxOf(m) })));
    // MODO PRUEBAS (COMO_PROBAR §4): elegir un momento POR ID, que es como lo va a recorrer el
    // guardian del catalogo (PR4). Es la misma puerta que aprieta el jugador —prbConfirm—, no un
    // atajo: si el menu se rompe, la sonda se rompe con el.
    if (typeof window !== 'undefined') window.__prb = id => {
      if (id === undefined) return JSON.stringify(prbRows().filter(r => r.id && !r.back).map(r => r.id));
      const i = prbRows().findIndex(r => r.id === id);
      if (i < 0) return null;
      if (S.state !== 'pruebas') { prbSel = prbFirstSel(); setState('pruebas'); }
      prbSel = i; prbConfirm();
      return JSON.stringify({ id, state: S.state, test: S.test });
    };
    // CINEMATICAS: la misma sonda para la puerta hermana. Sin argumento, la lista de ids; con uno,
    // la reproduce por la MISMA puerta que aprieta el jugador (cinConfirm), no por un atajo.
    if (typeof window !== 'undefined') window.__cine = id => {
      if (id === undefined) return JSON.stringify(cinRows().filter(r => r.id && !r.back).map(r => r.id));
      const i = cinRows().findIndex(r => r.id === id);
      if (i < 0) return null;
      if (S.state !== 'cines') { cinSel = 0; setState('cines'); }
      cinSel = i; cinConfirm();
      return JSON.stringify({ id, state: S.state, test: S.test, volver: testBack });
    };
    // __cfgset / __cfgget: una perilla de OPCIONES desde afuera. Existe para poder COMPARAR dos
    // presentaciones de lo mismo en la misma escena — cambiarla a mano obliga a salir del vuelo,
    // y al volver ya no es la misma corrida. QUITAR con el resto.
    // aplica el tema despues de escribir: `sky` y `water` son una ELECCION, y la paleta viva sale
    // de resolverla (render/theme.js). Sin esto, __cfgset('sky','storm') dejaba el cielo del menu
    // pisado pero el mundo pintado con la paleta anterior — media comparacion.
    if (typeof window !== 'undefined') window.__cfgset = (k, v) => { cfg[k] = v; applyCfg(); return String(cfg[k]); };
    if (typeof window !== 'undefined') window.__cfgget = k => String(cfg[k]);
    // __logdbg: el HISTORIAL de la radio (lo que dibuja el PANEL), de lo mas viejo a lo mas nuevo.
    if (typeof window !== 'undefined') window.__logdbg = () => JSON.stringify(
      radioLog.map(e => ({ q: e.personaje, t: +e.t.toFixed(1), txt: e.txt.slice(0, 28) })));
    // __toastbanda: donde vive el toast y donde empieza el HUD. Es la sonda de LA REGLA — "el
    // dialogo no se superpone a la UI" no se puede afirmar mirando una captura, porque el toast
    // aparece y se va. QUITAR con el resto.
    if (typeof window !== 'undefined') window.__toastbanda = () => JSON.stringify(screens.toastBanda());
    // __radiodbg: LA CAJA DE RADIO tal como se ve ahora — quien habla, que dice, y donde estamos
    // parados del recorrido. Sin esto, "las charlas se recorren" solo se puede afirmar mirando
    // capturas de a una. QUITAR con el resto de las sondas.
    if (typeof window !== 'undefined') window.__radiodbg = () => JSON.stringify({
      visible: radioVis(), personaje: radioBox.personaje, cara: radioBox.cara,
      txt: radioBox.wrap.join(' '), resta: +radioRest().toFixed(2),
      beat: radioBeat, total: charlasDe(curMission()).length, dist: run.dist | 0,
      frac: objectiveDist ? +(run.dist / objectiveDist).toFixed(3) : 0, radioMode: testRadio,
    });
    // MOTOR DE HISTORIA para el fixture del locker (SPEC_MODO_HISTORIA §6): lo que el jugador
    // tiene en pantalla ahora mismo. Los holds hay que poder MEDIRLOS desde afuera — a ojo, un
    // silencio de 3.6 s y uno de 4.0 s son indistinguibles, y esa diferencia es la actuacion.
    if (typeof window !== 'undefined') window.__sdbg = () => {
      const sc = dialogue.scene() || {}, ln = dialogue.line();
      return JSON.stringify({
        state: S.state, scene: sc.id || null, line: dlg.li, id: ln ? ln.id : null,
        titulo: sc.titulo || null, tipo: (ln && ln.tipo) || sc.tipo || null,
        personaje: ln ? ln.personaje : null, cara: ln ? ln.cara : null, hold: ln ? ln.hold : 0,
        txt: dialogue.txtOf(ln), len: dialogue.txtOf(ln).length,
        typed: dlg.typed, done: dlg.done, holdLeft: +dialogue.holdLeft().toFixed(3),
        canAdvance: dialogue.canAdvance(), seqT: +dlg.seqT.toFixed(2),
        // silencio ya consumido: sin esto no se puede saber si un holdLeft de 3.89 s es el motor
        // pidiendo de menos o la sonda llegando 0.11 s tarde
        sinceDone: dlg.done ? +(dlg.t - dlg.tDone).toFixed(3) : 0,
      });
    };
    // __mvok: QUE PIRUETAS SALDRIAN AHORA MISMO. Le pregunta a `moveAllowed` con el MISMO estado
    // que le pasa el dispatcher (ver mvOk), y no a una copia de la regla: si mañana el gate suma
    // una condicion, esta sonda la contesta sola. Es la unica forma de medir el "real real" del
    // selector — que la libreta de la mision este puesta se ve en `pichon`, pero que ADEMAS
    // gatee de verdad solo se sabe preguntando por acá. QUITAR con el resto de las sondas.
    if (typeof window !== 'undefined') window.__mvok = () => {
      const st = { campaign: conLibreta(), owned: pichon, off: cfg.movesOff };
      const si = [], no = [];
      for (const u of UPGRADES) (moveAllowed(u.id, st) ? si : no).push(u.id);
      return JSON.stringify({ modo: gameMode, test: S.test, libreta: conLibreta(), si, no });
    };
    // estado del BANCO DEL PICHON para las sondas (oferta, cursor y lo ya aprendido) y el de
    // MEJORAS DEL PICHON, que es donde eso mismo se prende y se apaga. Van juntos porque la
    // pregunta que se le hace desde afuera es una sola: que piruetas VAN A SALIR.
    // LA CAMPAÑA A PEDIDO (QUITAR). `__campana(n)` arranca la campaña de verdad —gameMode
    // 'campaign', banco vacio, sin S.test— y salta a la mision `n`. Es lo unico que permite ver EL
    // RITMO DEL BANCO sin volar doce misiones: cuando se abre, con cuantas cartas y cuando no se
    // abre. `__mision` no sirve para esto — entra por la puerta de HERRAMIENTAS, que a proposito
    // NO pasa por el banco (el epilogo vuelve al catalogo).
    if (typeof window !== 'undefined') window.__campana = n => {
      startCampaign();
      const i = Math.max(0, Math.min((n | 0), MISSIONS.length - 1));
      if (i > 0) { pichon = loadoutAt(i); loadLevel(i); reset(); setRunObjective(); setState(enterMission()); }
      return JSON.stringify({ modo: gameMode, level: curLevel, pichon: pichon.slice(), test: S.test });
    };
    // Y EL EPILOGO A PEDIDO: cierra la mision como si la hubieras terminado, que es el unico
    // camino por el que el banco se abre.
    if (typeof window !== 'undefined') window.__finMision = () => {
      // ENTRA POR LA MISMA PUERTA QUE EL JUEGO. Antes esta sonda repetia a mano la cadena de
      // posmision, y cuando la cadena cambio (G-09: el banco pasa a ir ANTES del epilogo) la sonda
      // siguio contando la version vieja. Una sonda que no usa el camino real deja de ser sonda.
      trasResultados();
      return JSON.stringify({ state: S.state, level: curLevel, ofrece: upgOffer.length,
        offer: upgOffer.map(u => u.id), pichon: pichon.slice() });
    };

    if (typeof window !== 'undefined') window.__udbg = () => JSON.stringify({
      state: S.state, level: curLevel, offer: upgOffer.map(u => u.id), sel: upgSel, pichon,
      mejSel, mejRows: mejRows().map(r => r.head ? '#' : r.label()),
      movesOff: Object.keys(cfg.movesOff),
    });
    // __fade (QUITAR): el reloj del FUNDIDO. El fundido corto del cruce al climax es un pedido
    // del autor ("si cambias de camara MINIMAMENTE fade in - out") y hasta ahora solo se podia
    // comprobar contando pixeles oscuros — que mide el fundido Y la escena de los dos lados a la
    // vez, y falla cuando el climax es mas brillante que el pasillo (medido: 64 → 83, el fundido
    // pintado y el test diciendo que no habia ninguno).
    if (typeof window !== 'undefined') window.__fade = () => +fadeT.toFixed(3);
    if (typeof window !== 'undefined') window.__wjump = (p, dev) => {
      if (dev !== undefined) cfg.devcam = !!dev;
      if (p !== undefined && objectiveDist > 0) run.dist = Math.max(0, p * objectiveDist);
      return JSON.stringify({
        p: objectiveDist ? +(run.dist / objectiveDist).toFixed(3) : 0,
        dist: Math.round(run.dist), obj: Math.round(objectiveDist),
        obs: obstacles.filter(o => o.z > 3 && !o.decor).length,   // lo que queda ADELANTE
        y: +plane.y.toFixed(1), spd: run.spd | 0, vidas: run.lives,
        devcam: cfg.devcam, state: S.state,
      });
    };

    // ---------- SONDA DEL DESPIECE (QUITAR antes de publicar) ----------
    // PLAN_DESTRUCCION D0. Sin esto no hay forma de comparar cómo muere cada tipo: habría que
    // encontrar un depósito y un helo en la misma corrida, matarlos con la misma arma y acordarse
    // de cómo se vio el primero. `__romper('depot')` los pone uno al lado del otro.
    //
    // Devuelve la FOTO del escombro que acaba de nacer (cuántos, tamaños, colores, pieza especial)
    // — es lo que permite afirmar "cada tipo se despieza distinto" con números y no de memoria.
    if (typeof window !== 'undefined') window.__romper = (tipo, imp, d, variante, killer) => {
      forzarVariante(variante || null);   // v2: sin poder forzarla, "las 4 se ven distintas" depende del dado
      // QUIENES ESTABAN ANTES, POR IDENTIDAD Y NO POR INDICE. Esto decia `obstacles.length` y despues
      // `obstacles.slice(antes)`, y esa ventana MIENTE en cuanto entra a jugar el cap de pedazos:
      // `capParts()` saca a los mas viejos SPLICEANDOLOS del array, asi que todo se corre a la
      // izquierda y `slice(antes)` empieza tantos lugares mas adelante como pedazos se hayan
      // sacado — se pierde el pedazo 0, que es justo el que lleva LA FIRMA del tipo.
      //
      // No es teorico: se vio en el fixture de B5. Con el mundo vacio las ocho firmas salian bien y
      // con el mundo lleno seis de ocho aparecian como `null`. Y el error es viejo — venia
      // ensuciando en silencio TODAS las medidas de esta sonda (cuantos pedazos, tamaños, colores)
      // cada vez que una prueba corria con escombro encima, que es la mitad de las veces.
      const antes = new Set(obstacles);
      run.shake = 0; run.flash = 0;   // se mide LO QUE ESTA MUERTE produce, no lo que venia de antes
      // a la ALTURA A LA QUE VAS VOLANDO: plantarlo siempre a ras dejaba el destrozo fuera de
      // cuadro apenas el avion subia un poco, y lo que la sonda tiene que dejar ver es la muerte
      // `d` = a cuantos metros por delante del morro. Es el parametro de D3: la misma muerte a 12 m
      // y a 300 m tiene que dar numeros distintos, y sin poder elegir la distancia eso no se mide.
      const o = { type: tipo, x: plane.x + (Math.random() - 0.5) * 6, y: Math.max(1.5, plane.y), h: 3, z: PZ + (d || 42) };
      // D2: se llama a la MUERTE COMPLETA, no solo al despiece — es lo unico que permite comparar
      // el caracter de cada tipo (bola o no, chispazo, secundarias, columna de humo).
      morir(o, imp || { vz: run.spd * 0.5 }, 0, killer || 'canon');
      // SOLO los pedazos: explodeAt ademas empuja una bola de fuego ('airboom') al mismo array, y
      // contarla arruinaba las tres medidas (n, tamaños y colores) con un objeto que no es escombro
      const todos = obstacles.filter(c => !antes.has(c));
      const nuevos = todos.filter(c => c.type === 'chunk');
      return JSON.stringify({
        tipo, n: nuevos.length,
        colores: [...new Set(nuevos.map(c => c.c))],
        size: [+Math.min(...nuevos.map(c => c.size)).toFixed(2), +Math.max(...nuevos.map(c => c.size)).toFixed(2)],
        hot: nuevos.filter(c => c.hot).length,
        pieza: (nuevos.find(c => c.pieza) || {}).pieza || null,
        // B5: la firma DIBUJADA. `pieza` dice que prometio la receta; esto dice con que se dibuja
        // de verdad — hasta B5 la respuesta era siempre `null` y la firma caia al bulto a mano.
        firma: (nuevos.find(c => c.pieza) || {}).parte || null,
        // y el reparto de piezas horneadas entre TODOS los pedazos, para ver que no se repita
        partes: [...new Set(nuevos.map(c => c.parte).filter(Boolean))],
        // el CARACTER de la muerte (D2), leido de lo que realmente se creo — no de la receta:
        // asi la sonda no puede confirmar una intencion que el codigo no cumplio
        bola: (todos.find(c => c.type === 'airboom') || {}).scale || 0,
        sec: todos.filter(c => c.type === 'sec').length,
        humo: (todos.find(c => c.type === 'humo') || {}).humoMax || 0,
        espiral: nuevos.filter(c => c.espiral).length,
        // EL GOLPE (D3), medido en el instante: cuanto te sacudio y cuanto te encandilo ESTA muerte
        d: Math.round(o.z - PZ),
        shake: +run.shake.toFixed(2), flash: +run.flash.toFixed(2),
        onda: todos.filter(c => c.type === 'onda').length,
        vivos: obstacles.filter(c => c.type === 'chunk').length,
        // v2: QUE VARIANTE salio y con que acta. Leido de lo que el selector realmente devolvio,
        // no de lo que se pidio — si se fuerza una que no existe, esto lo delata.
        variante: ULTIMA_VARIANTE, masa: recetaDe(tipo).masa || null,
        variantes: variantesDe(tipo),
        // LO QUE HACE LEGIBLE A UNA VARIANTE (§1): cuantos PEDAZOS GRANDES quedan y que hacen.
        // Es la unica medida que corresponde con lo que se ve en blanco y negro — el color no
        // aparece aca a proposito, porque una variante que solo cambia de color no existe.
        grandes: nuevos.filter(c => c.size > 1.5).length,
        mayor: +Math.max(...nuevos.map(c => c.size)).toFixed(2),
        moribundo: nuevos.filter(c => c.moribundo).length,
        paraca: nuevos.filter(c => c.paraca).length,
        vidaMax: Math.max(0, ...nuevos.map(c => c.vida || 0)),
        // EL RESTO (B1): que carcasa quedo en el lugar, y con que pose. `null` es una respuesta
        // valida — lo que se desintegra no deja nada, y la sonda tiene que poder decirlo.
        resto: (todos.find(c => c.type === 'resto') || {}).hoja || null,
      });
    };

    // ---------- LOS RESTOS EN FILA (QUITAR) ----------
    // PLAN_HORNEADO B1. La regla del pasillo dice que lo que queda atras tuyo es la historia de tu
    // corrida — pero eso no se puede afirmar rompiendo una cosa, mirando, rompiendo otra y
    // acordandose. `__restosTodos()` planta LA FILA ENTERA de carcasas delante tuyo, una al lado
    // de la otra y a la misma distancia, que es la unica forma de ver si diez naufragios distintos
    // se distinguen entre si de un vistazo.
    //
    // OJO CON EL NOMBRE: `__romperTodas` ya existe y es OTRA COSA — pone en fila las VARIANTES DE
    // MUERTE de un tipo (v2 V0). Esta pone en fila los RESTOS de todos los tipos. Se llamo igual
    // por un rato y la segunda pisaba a la primera sin que nada avisara; el fixture lo agarro.
    //
    // Mata de verdad (pasa por `morir()`), asi que lo que aparece es exactamente lo que aparece
    // jugando: si un resto no sale aca, tampoco sale en la mision.
    if (typeof window !== 'undefined') window.__restosTodos = (d) => {
      const tipos = Object.keys(DESPIECE).filter(t => DESPIECE[t].resto);
      const dist = d || 60, paso = 9;
      const x0 = plane.x - (tipos.length - 1) * paso / 2;
      const puestos = [];
      tipos.forEach((tipo, i) => {
        const o = { type: tipo, x: x0 + i * paso, y: 1.5, h: 3, z: PZ + dist };
        morir(o, { vz: 20 }, 0, 'canon');
        const r = obstacles.filter(c => c.type === 'resto').pop();
        puestos.push({ tipo, resto: r ? r.hoja : null, x: Math.round(o.x) });
      });
      // Y EL CONTRA-EJEMPLO en la misma foto: los tipos que NO dejan resto. Que la lista de abajo
      // no este vacia es parte de lo que hay que ver — una carcasa para todo seria tan falso como
      // ninguna. Un avion que revienta en el aire no deja nada en el suelo.
      const sin = Object.keys(DESPIECE).filter(t => !DESPIECE[t].resto);
      return JSON.stringify({ d: dist, n: puestos.length, puestos, sinResto: sin });
    };

    // QUE HAY EN EL PASILLO AHORA MISMO (QUITAR). La diferencia que trae B1 es que la carcasa dura
    // mas que el humo, y eso solo se puede afirmar contando las dos cosas DESPUES de que pase el
    // tiempo. `conHp` es la otra mitad: un resto con vida seria un obstaculo, y romper cosas te
    // iria cerrando el pasillo — el castigo al reves.
    // EL BUQUE DEL PASILLO, A PEDIDO (QUITAR). PLAN_HORNEADO B2: el criterio es que las tres clases
    // se distingan, y eso no se puede afirmar volando tres misiones distintas y acordandose de como
    // se veia la primera. Cambia el buque objetivo sin recargar; el pasillo sigue igual.
    if (typeof window !== 'undefined') window.__buqueSet = nombre => {
      if (nombre) { objectiveShip = nombre; pulso.setShip(nombre); }
      return JSON.stringify({ buque: objectiveShip, clase: SHIP_CLASS[objectiveShip] || null,
        dist: Math.round(objectiveDist), p: +(run.dist / Math.max(1, objectiveDist)).toFixed(3) });
    };

    if (typeof window !== 'undefined') window.__restos = () => JSON.stringify({
      restos: obstacles.filter(c => c.type === 'resto').length,
      humos: obstacles.filter(c => c.type === 'humo').length,
      conHp: obstacles.filter(c => c.type === 'resto' && c.hp !== undefined).length,
      hojas: [...new Set(obstacles.filter(c => c.type === 'resto').map(c => c.hoja))],
      t: +run.t.toFixed(1),
    });

    // ---------- LAS VARIANTES EN FILA (QUITAR) ----------
    // PLAN_DESTRUCCION_V2 V0. La regla del §1 es que dos variantes tienen que distinguirse en una
    // captura EN BLANCO Y NEGRO. Eso no se puede afirmar matando una, mirando, matando otra y
    // acordandose: hay que verlas AL MISMO TIEMPO y con el mismo reloj. Esto las pone en fila.
    //
    // Todas nacen a la misma altura, a la misma distancia y en el mismo cuadro: lo unico que
    // cambia entre ellas es la variante, que es justo lo que se quiere comparar.
    // Cuantos "se van muriendo" hay en el aire (QUITAR). El cap de §6.2 es una afirmacion sobre el
    // MUNDO, no sobre una muerte: hay que poder contarlos despues de pedir varias.
    // QUITAR — dispara una PIRUETA a mano. Se tiran con COMBOS de gestos, asi que desde un
    // fixture no hay forma de pedir una sin reproducir el combo entero: sin esto, "la estela sale
    // en la maniobra" no se puede afirmar con un numero.
    if (typeof window !== 'undefined') window.__mv = (id, dir, tgt) => {
      // 'tonel' entra por SU accion (startRoll) y no por startMove directo: la accion es la que
      // toca su firma sonora. De ahi para adentro es una pirueta como las otras — mismo reloj,
      // mismo catalogo—, y es el caso que prueba que la estela acompaña la rotacion del sprite.
      if (id === 'tonel') { const okT = startRoll(dir || 1); return JSON.stringify({ pedido: 'tonel', ok: okT, mv: run.mv || null }); }
      const m = id || 'barrel';
      // EL ASCENSOR NECESITA UN TECHO. `climb`/`climbmax` trepan HASTA `run.mvTgt`, y el combo se
      // lo pasa (ver el dispatcher, mas arriba). Sin el la sonda las lanzaba con techo 0, o sea
      // convertia la maniobra que trepa en una picada al mar — y el fixture habria medido eso.
      // La sonda REPITE la eleccion del dispatcher en vez de inventar una: lo que se prueba tiene
      // que ser lo que se juega.
      const t = tgt !== undefined ? +tgt : m === 'climbmax' ? FLY_TOP : m === 'climb' ? RADAR_ALT : 0;
      const ok = moves.startMove(m, dir || 1, t);
      return JSON.stringify({ pedido: m, ok, tgt: t, mv: run.mv || null });
    };

    // QUITAR — LA MANIOBRA FILMADA: la misma pirueta, pero corrida por EL DIRECTOR sobre el vuelo
    // normal (bandas negras + mundo en camara lenta, ver la timeline `maniobra` en data/cines.js).
    // Es la tercera presentacion del menu MANIOBRAS. Las ligaduras se atan aca porque son lo unico
    // que la timeline no puede saber: cual pirueta y cuanto dura.
    if (typeof window !== 'undefined') window.__mvfilm = (id, dir) => {
      const m = id || 'barrel';
      const M = MOVES[m];
      if (!M) return JSON.stringify({ error: 'no existe la maniobra ' + m });
      // la duracion va convertida a segundos de PARED: la maniobra corre con el reloj del MUNDO,
      // que esta escena pone en camara lenta (ver MV_FILM en data/cines.js).
      const dur = M.dur / MV_FILM.LENTO;
      const ok = cine.start('maniobra', { mv: m, dir: dir === undefined ? 1 : +dir, dur });
      return JSON.stringify({ mv: m, dur: +dur.toFixed(2), ok });
    };

    // QUITAR — EL TEATRO AEREO FILMADO (PLAN_TEATRO_AEREO TA3): la misma escena que `__teatro`,
    // pero montada por EL DIRECTOR desde una timeline (`teatro` en data/cines.js). Es la prueba de
    // que la coreografia es DATO: el beat dice `teatro: {...}` y nadie escribe una linea de logica.
    // Las ligaduras se atan aca porque son lo unico que la timeline no puede saber.
    if (typeof window !== 'undefined') window.__teatrofilm = (id, derriba) => {
      const m = id || 'barrel';
      const M = MOVES[m];
      if (!M) return JSON.stringify({ error: 'no existe la maniobra ' + m });
      // la duracion en segundos de PARED, y con el tiempo que la escena necesita ademas de la
      // figura: el Fiel entra, la vuela, sale y contesta. Con la duracion pelada las bandas se
      // levantaban cuando el blanco todavia no habia terminado de caer.
      wingmv.limpiar(); teatro.limpiar();      // arranca de cero, igual que `__teatro`
      const dur = (WINGMV.ENTRA_ATRAS + M.dur + WINGMV.SALE) / MV_FILM.LENTO;
      const ok = cine.start('teatro', { mv: m, derriba: derriba === undefined ? 1 : +derriba, dur });
      return JSON.stringify({ mv: m, dur: +dur.toFixed(2), ok });
    };

    // QUITAR — la estela de punta de ala: con que fuerza sale y cuantas muestras vivas tiene.
    if (typeof window !== 'undefined') window.__blurdbg = () =>
      JSON.stringify({ ...BLUR_DBG, on: cfg.desenfoque, boost: !!run.boost, mom: tempo.active(), ras: rasante.active() });
    if (typeof window !== 'undefined') window.__tipdbg = () =>
      JSON.stringify({ ...TIP_DBG, bank: +plane.bank.toFixed(2),
        mv: run.mv || null, roll: +(run.mvRoll || 0).toFixed(2), boost: !!run.boost,
        cx: Math.round(proj(plane.x, plane.y, PZ).x), cy: Math.round(proj(plane.x, plane.y, PZ).y) });

    if (typeof window !== 'undefined') window.__moribundos = () =>
      JSON.stringify({ n: obstacles.filter(c => c.moribundo).length, tope: MORIBUNDO_MAX });

    if (typeof window !== 'undefined') window.__romperTodas = (tipo, d) => {
      const ids = variantesDe(tipo);
      if (!ids.length) return JSON.stringify({ tipo, error: 'el tipo no declara variantes' });
      const dist = d || 70;
      const y0 = Math.max(6, plane.y);
      const paso = ids.length > 1 ? 54 / (ids.length - 1) : 0;
      const fila = ids.map((id, i) => {
        const x = ids.length > 1 ? -27 + i * paso : 0;
        forzarVariante(id);
        const o = { type: tipo, x, y: y0, h: 3, z: PZ + dist, ph: i * 1.7 };
        morir(o, { vz: 30 }, 0, 'canon');
        return { id, x: +x.toFixed(1), salio: ULTIMA_VARIANTE };
      });
      forzarVariante(null);
      return JSON.stringify({ tipo, dist, y: +y0.toFixed(1), n: ids.length, fila,
        vivos: obstacles.filter(c => c.type === 'chunk').length });
    };

    // EMBESTIR A PEDIDO (QUITAR). D1 se trata de lo que pasa al CHOCAR, y esperar a que la corrida
    // ponga un depósito justo en tu carril no es una prueba: es suerte. Esto planta el objeto
    // delante del morro y deja que la colisión de siempre lo resuelva — no simula nada, el choque
    // que ocurre es el real.
    // `h` por defecto 7: por encima de SOFT_H (4.8), que es el umbral que separa lo que DERRIBA de
    // lo que solo golpea. Con una carpa de 3 m el avion la arrasa y sigue — que es lo correcto,
    // pero no es el choque que D1 tiene que probar.
    if (typeof window !== 'undefined') window.__chocar = (tipo, h) => {
      // el objeto se estira hasta la altura a la que venis volando en vez de bajarte a vos: forzar
      // el avion a ras lo mataba contra el suelo ANTES de llegar al blanco, y el choque que se
      // queria medir no llegaba a pasar
      const alto = h || Math.max(7, plane.y * 2 + 3);
      obstacles.push({ type: tipo, x: plane.x, y: 0, h: alto, z: PZ + 8, xa: plane.x });
      return JSON.stringify({ ok: true, tipo, h: alto, z: PZ + 8, spd: run.spd | 0 });
    };

    // LA CADENA A PEDIDO (QUITAR). D4 se trata de lo que le pasa a los VECINOS, y esperar a que la
    // corrida ponga un depósito con dos carpas al lado no es una prueba. Esto arma la escena —
    // depósito en el medio, dos carpas a tiro — y le prende fuego al del medio: lo que se propaga
    // después es la cadena de verdad, no una simulación.
    if (typeof window !== 'undefined') window.__cadena = (r) => {
      const rad = r || 10, z = PZ + 60, x = plane.x;
      const dep = { type: 'depot', x, y: 0, h: 7, z, hp: 3, xa: x };
      obstacles.push(dep);
      obstacles.push({ type: 'tent', x: x - rad, y: 0, h: 3, z, hp: 1, xa: x - rad });
      obstacles.push({ type: 'tent', x: x + rad, y: 0, h: 3, z: z + 4, hp: 1, xa: x + rad });
      MUERTES.length = 0;
      morir(dep, { vz: 0 });
      dep.z = -99; dep.done = true;
      return JSON.stringify({ ok: true, rad, z });
    };
    // CENSO DE PARTICULAS para el presupuesto de D5 (QUITAR).
    // EL COLCHON, MEDIDO DESDE EL RUN (QUITAR). `__rsdbg` es del modulo y no ve el mundo; el
    // reloj de roce vive en `run` y es la mitad del RF-02 que hay que poder afirmar: "el agua
    // plana no castiga" se prueba mirando que `scrapeT` NO CREZCA, no que el avion siga vivo —
    // seguir vivo tambien pasa si el margen alcanzo justo.
    if (typeof window !== 'undefined') window.__rsroce = () => JSON.stringify({
      scrapeT: +run.scrapeT.toFixed(3), vib: +run.scrapeVib.toFixed(2),
      y: +plane.y.toFixed(2), vy: +plane.vy.toFixed(2), alt: +plane.y.toFixed(2),
      // EL PUNTAJE, para el RF-07: "una corrida con poder no supera a una igual de habil sin el".
      // Se mide comparando puntos por segundo A LA MISMA ALTURA con y sin poder — el x10 lo da la
      // altura, no el poder, asi que los dos numeros tienen que dar iguales.
      score: Math.round(run.score), mult: run.multShow,
      // EL MULTIPLICADOR CRUDO, el que sale SOLO de la altura. `multShow` le suma el bonus de
      // la racha rasante, que crece sola con los segundos y por lo tanto DERIVA entre dos
      // mediciones seguidas: comparar puntaje con y sin poder usando `multShow` mide la racha,
      // no el poder. Este es el numero del RF-07.
      multRaw: run.mult, racha: +run.streak.toFixed(1), ras: run.rasLevel,
    });

    if (typeof window !== 'undefined') window.__pdbg2 = () => JSON.stringify({
      parts: parts.length, obs: obstacles.length,
      chunks: obstacles.filter(o => o.type === 'chunk').length,
      humo: obstacles.filter(o => o.type === 'humo').length,
      sec: obstacles.filter(o => o.type === 'sec').length,
    });
    // bitácora de muertes: quién murió, cuándo y en qué salto de la cadena. Es la única forma de
    // afirmar "cadena de 3 con retardos legibles" — a ojo, tres explosiones en medio segundo son
    // una sola explosión con ruido.
    if (typeof window !== 'undefined') window.__muertes = () => JSON.stringify(MUERTES);

    // LO TRANSONICO A PEDIDO (QUITAR). Llegar a Mach 1,4 volando lleva diez segundos de turbo
    // sostenido y cinco escalones de afterburner: para COMPARAR el efecto a dos velocidades hay que
    // poder plantarse en cada una. `__mset(spd, bank)` fija las dos cosas cuadro a cuadro (si no,
    // speedTarget se la lleva de vuelta al cuadro siguiente); `__mset(0)` la suelta.
    if (typeof window !== 'undefined') window.__mset = (spd, bank, boost) => {
      machHold = spd ? { spd, bank: bank || 0, boost: !!boost } : null;
      return JSON.stringify({ hold: machHold });
    };
    // EL AVION QUIETO EN EL AIRE (QUITAR). Sin gas el avion cae, y cae rapido: cualquier prueba que
    // necesite MIRAR el pasillo unos segundos —los restos de B1 tardan 4 s en salir de abajo de su
    // propia bola de fuego— termina con "chocaste el terreno" en vez de con la foto. Va entre
    // update y draw por el mismo motivo que `__mset`: puesto antes, la fisica se lo lleva por
    // delante en el mismo cuadro. `__nivel(null)` lo suelta.
    if (typeof window !== 'undefined') window.__nivel = y => {
      altHold = y === null || y === undefined ? null : Math.max(1, y);
      return JSON.stringify({ hold: altHold, y: +plane.y.toFixed(1) });
    };
    if (typeof window !== 'undefined') window.__mdbg = () => JSON.stringify({
      spd: Math.round(run.spd), kmh: Math.round(run.spd * 4.2),
      mach: +machNow(run.spd).toFixed(2),
      cono: +conoAmt(run.spd).toFixed(2),
      bank: +plane.bank.toFixed(2), boost: !!run.boost, tier: run.afterTier, state: S.state,
    });

    // CENSO DEL ESCOMBRO (QUITAR). Lo que el plan llama "los restos QUEDAN" y "el cap manda" son
    // dos afirmaciones sobre una población de pedazos: hay que poder contarla desde afuera.
    if (typeof window !== 'undefined') window.__chdbg = () => {
      const ch = obstacles.filter(o => o.type === 'chunk');
      return JSON.stringify({
        n: ch.length, max: CHUNKS_MAX,
        suelo: ch.filter(o => o.y <= 0.05).length,          // los que ya se posaron
        hot: ch.filter(o => o.hot).length,
        colores: [...new Set(ch.map(o => o.c))],            // de cuántas cosas distintas hay restos
        viejo: +Math.max(0, ...ch.map(o => o.chunkT)).toFixed(2),
        // la velocidad mas alta del escombro: es como se ve, desde afuera, que la onda EMPUJO
        vmax: +Math.max(0, ...ch.map(o => Math.hypot(o.vx, o.vz))).toFixed(1),
      });
    };

    // ---------- loop ----------
    let last = performance.now();
    function frame(now) {
      // el telon del cordon: se arma al entrar al climax y se abre solo (raw: es cinematica, no
      // la toca la camara lenta del MOMENTUM)
      // EL PISO EN CERO NO ES ADORNO: `last` se siembra con performance.now() y el `now` del PRIMER
      // requestAnimationFrame es el instante en que ARRANCO ese cuadro, que puede ser ANTERIOR —
      // medido, -9.6 ms. Un dt negativo hace que todo interpolador corra al reves, y el primero que
      // se rompe es el volumen del motor (audio.js): sale negativo, el <audio> tira IndexSizeError y,
      // como es adentro del rAF, se lleva puesto el loop entero. Nadie lo veia porque en la portada
      // no suena el motor; aparecio al entrar DERECHO al pasillo con la sonda de la PASADA.
      const raw = Math.max(0, Math.min(0.033, (now - last) / 1000)); last = now;
      // PAUSA: se saltea update() ENTERO (y el reloj del momentum, y el del telon) — el mundo
      // queda clavado tal cual se ve. draw() sigue corriendo: dibuja el frame congelado y el
      // menu encima. pauseT es el unico reloj vivo (parpadeos del overlay).
      if (paused) {
        pauseT += raw;
        draw(); updateMusic(S.state);
        if (playerEl) playerEl.classList.toggle('on', canPickMusic());
        requestAnimationFrame(frame);
        return;
      }
      // MOMENTUM: la barra se carga con el score y el drenaje corre con el dt CRUDO (tiempo
      // real); el mundo recibe el escalado. Este multiplicador es TODO el poder: como nada usa
      // reloj de pared, achicar el dt frena spawns, flak, particulas y lluvia en sincronia
      // perfecta sin tocar ningun sistema. tick() ademas corta el poder al salir del pasillo
      // (muerte, relevo, climax, devcam) y avisa 'ready' UNA vez cuando la barra se llena.
      if (tempo.tick(raw, S.state === 'play' && !cfg.devcam, run.score) === 'ready') {
        beep(660, 0.1, 'square', 0.05, 140);
        popup(W / 2, 58, T('tempoReady'), P.accent);
      }
      if (S.state !== veilPrev) {
        if (S.state === 'arena' || S.state === 'momentum') veilOut = VEIL_OUT;
        veilPrev = S.state;
      }
      if (veilOut > 0) veilOut = Math.max(0, veilOut - raw);
      // RF-12: el ralenti de la ventana de suelta MULTIPLICA al del MOMENTUM, no lo reemplaza —
      // los dos son escalas del mismo dt, asi que componerlos es multiplicar y nada mas. Como
      // nada en el juego usa reloj de pared, esto frena bombas, particulas y defensa en sincronia.
      const dt = raw * tempo.scale() * (S.state === 'pasada' ? pasada.slow() : 1);
      // LA CHANCHA (SPEC_PODER_CHANCHA) va ACA y no adentro de update(): con el dt del MUNDO —el
      // ETA es tiempo de mision, asi que pedirla en camara lenta tiene que tardar lo mismo en
      // tiempo de juego— y en TODOS los estados, que es lo que le permite despedirse sola cuando
      // el pasillo se termina (muerte, relevo, climax, devcam). El sistema devuelve señales y el
      // % de tanque del cuadro; escribir `run.fuel` es del orquestador, como corresponde.
      const ch = chancha.tick(dt, {
        inPlay: S.state === 'play' && !cfg.devcam,
        score: run.score, planeX: plane.x, planeY: plane.y, fuel: run.fuel,
        // un golpe corta la transferencia: la manguera no aguanta un avion sacudido
        golpe: run.scrapeVib > 0.1 || run.shake > 3,
      });
      // LA CHARLA EN VUELO va al lado de la CHANCHA y por lo mismo: con el dt del MUNDO y en TODOS
      // los estados. Correrla solo en 'play' la dejaria colgada en 'activa' al morir — y es
      // justamente el `inPlay` en false lo que la corta (RF-06).
      stepCharla(dt);
      const cv = charla.tick(dt, {
        inPlay: S.state === 'play' && !cfg.devcam,
        // EL CORREDOR VACIO: lo que decide el drenaje. Se mira lo que HAY, no lo que se sembro —
        // la charla no borra nada, espera a que pase (RF-01).
        limpia: obstacles.length === 0 && soldiers.length === 0 && missiles.length === 0,
        // LO QUE LA CHARLA ESPERA (§6.3). No es lo mismo que "queda algo sembrado": un Harrier en
        // la cola, una ola viva o la niebla ciega no se drenan con el tiempo, asi que estas tres
        // no tienen tope — la charla espera lo que haga falta. Hablar mientras algo de eso pasa no
        // es una escena, es una distraccion.
        amenaza: caza.active() || inBank() || obstacles.some(o => o.type === 'ola'),
        dlgFin: charlaFin,
      });
      if (cv.sig === 'arranca') {
        // EL MOTOR DE SIEMPRE, con la escena que pidio el tramo. `startSeq` deja `dlg` listo; el
        // auto-avance lo prende `stepCharla` en el cuadro siguiente.
        charlaFin = false;
        dialogue.startSeq([SCENES[charla.escena()]], getLang());
      }
      if (cv.sig === 'fin') charlaFin = false;
      // EL PODER RASANTE (SPEC_PODER_RASANTE) va al lado de sus dos hermanos y con el dt del
      // MUNDO por el mismo motivo que el ETA de la Chancha: lanzado en camara lenta tiene que
      // durar lo mismo en tiempo de juego. La BANDA la resuelve aca el orquestador —es la misma
      // altura del x10 que mide flight.js— y no adentro del modulo: si el modulo la recalculara,
      // el dia que la banda se mueva habria dos verdades.
      const rs = rasante.tick(dt, {
        inPlay: S.state === 'play' && !cfg.devcam
          && gameMode !== 'arena' && gameMode !== 'pasadas',
        enBanda: plane.y <= 4.5,
      });
      if (rs.sig === 'ready') { beep(700, 0.1, 'square', 0.05, 160); popup(W / 2, 58, T('rasReady'), P.accent); }
      if (rs.sig === 'end') { beep(300, 0.12, 'square', 0.05, 90); popup(W / 2, 58, T('rasOff'), P.dim); }
      // EL LATIDO (RF-05): grave, corto y por debajo de todo. El modulo dice CUANDO —lleva el
      // reloj del poder— y el orquestador pone el sonido, como con cualquier otra señal.
      if (rs.latido) beep(RAS_LAT_HZ, 0.09, 'sine', 0.075, -14);
      // EL SILENCIO: se le avisa al audio una vez por cuadro. Va aca y no adentro de `updateMusic`
      // porque las DOS mitades del audio lo necesitan (la musica y las capas de ambiente) y
      // pasarlo dos veces era pedir que se desincronicen.
      setRasante(rasante.active());
      if (ch.carga > 0) run.fuel = Math.min(100, run.fuel + ch.carga);
      if (ch.rum) beep(58, 0.3, 'sawtooth', 0.028);                    // los motores del Hercules
      if (ch.bomba) beep(190, 0.05, 'square', 0.03, 40);               // la bomba de transferencia
      if (ch.sig) chanchaRadio(ch.sig);
      update(dt);
      // SONDA DE LO TRANSONICO (QUITAR): va ENTRE update y draw a proposito. Puesta antes, la
      // fisica se la lleva por delante en el mismo cuadro (speedTarget devuelve la velocidad
      // verdadera y `run.spd` vuelve sola) — medido: pedia 240 y el HUD marcaba 118.
      if (machHold) { run.spd = machHold.spd; plane.bank = machHold.bank; run.boost = machHold.boost; }
      if (altHold !== null) { plane.y = altHold; plane.vy = 0; }
      draw(); updateMusic(S.state);
      if (playerEl) playerEl.classList.toggle('on', canPickMusic());   // reproductor: solo donde hay pista cambiable
      requestAnimationFrame(frame);
    }
    applyChrome();
    reset();
    // ?scene=<ID>: arranca DENTRO de esa escena, sin pasar por el menu ni por una mision. Es como
    // se corre el fixture de aceptacion del locker (SPEC_MODO_HISTORIA §6).
    if (sceneProbe) { dialogue.startSeq([sceneProbe], getLang()); setState('story'); }
    // ?pasada=<n>: el climax PASADA, por sonda. Con &pasillo se vuela el nivel y la pasada llega
    // sola al final (RF-01); sin el, se entra derecho a la zona. El modo es CICLO DE MUERTE porque
    // es el que juega una mision suelta y encadena por el embudo normal (results → epilogo).
    if (pulsoProbe) {
      gameMode = 'cycle';
      loadLevel(pulsoProbe.mission);
      reset(); setRunObjective();
      if (pulsoProbe.viaPasillo) { run.t = 0; setState(afterBrief()); }
      else { run.dist = objectiveDist; pulso.enter(false); }
    }
    // ?mision=<id>: la mision suelta arranca sola, sin pasar por el menu. Vuelve AL MENU al
    // terminar (no hay selector del que se haya venido).
    if (misionProbe) abrirMision(misionProbe.i, { historia: misionProbe.historia, volver: 'modeselect' });
    // ?charla=<ID>: POR LA PATRIA, en el aire, con la charla esperando a los 300 m. Entra por el
    // MISMO verbo que el catalogo de PRUEBAS (`patria`), que a su vez es `abrirMision` — la sonda
    // no se abre una puerta propia, que es como una sonda deja de probar el juego que se juega.
    // `persec: 0` NO es comodidad: m1 —la mision con la que POR LA PATRIA arma su mapa— trae
    // `persec: 1`, y volar de numeral tiene BANDA: si te quedas o te adelantas, se muere. Con el
    // avion clavado por sonda para poder medir, eso se convierte en una muerte a los treinta
    // segundos, y la burbuja se acaba antes de que se pueda mirar. Es el mismo criterio que
    // `cazaCalma`: la seccion que mide una cosa apaga lo que no esta midiendo.
    if (charlaProbe) pruebasApi().patria({ persec: 0 });
    if (pasadaProbe) {
      gameMode = 'cycle';
      loadLevel(pasadaProbe.mission);
      reset(); setRunObjective();
      if (pasadaProbe.viaPasillo) { run.t = 0; setState(afterBrief()); }
      else { run.dist = objectiveDist; pasada.enter(false); }
    }
    requestAnimationFrame(frame);
  })();
