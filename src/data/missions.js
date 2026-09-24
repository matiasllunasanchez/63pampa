// MISIONES de la campaña (y del ciclo de muerte, que las juega al azar). Datos puros.
// v0.0.2 de EL CUADERNO DE MATEO: las 14 misiones de GUION_3.md volcadas con lo que el juego
// tiene hoy (ver docs/PLAN_CAMPANA_001.md). Ver GOALS en game.js para los tipos de
// objetivo: 'ship' culmina en el climax sobre el buque; 'distance' se cumple al llegar
// (misiones sin boss de buque: el tutorial y las de blanco terrestre, que aun no existe).
// El epilogo y el briefing son claves de STRINGS.

// buques britanicos reales (objetivo del vuelo). Tambien los sortea SUPERVIVENCIA.
import { climaxEnCuarentena, CLIMAX_SUPLENTE } from './cuarentena.js';

export const SHIPS = ['HMS SHEFFIELD', 'HMS COVENTRY', 'HMS ARDENT', 'HMS ANTELOPE',
  'RFA SIR GALAHAD', 'RFA SIR TRISTRAM', 'ATLANTIC CONVEYOR', 'HMS BROADSWORD', 'HMS GLAMORGAN'];

// LOS FIELES por tramo de campaña: el roster es quien esta VIVO segun el guion, y su largo
// es el escuadron (las vidas). El Vasco muere en el epilogo de m7 (vuela la m7 entera);
// el Pichon en el de m9. El jugador siempre es TERO; el orden es el orden de relevo.
const F5 = ['TERO', 'PUMA', 'GITANO', 'VASCO', 'PICHON'];
const F4 = ['TERO', 'PUMA', 'GITANO', 'PICHON'];
const F3 = ['TERO', 'PUMA', 'GITANO'];

// config por mision: TODAS las perillas que la campaña pisa, siempre explicitas — si una
// clave faltara, quedaria pegado el valor de la mision anterior (Object.assign sobre cfg).
// La rampa arranca suave (m1 sin bombas ni viento) y termina con todo prendido (m14).
// LO QUE SOLO UNA MISION PUEDE CAMBIAR, y como queda cuando no hay mision. Se exporta porque los
// modos que no juegan una mision (POR LA PATRIA, PERSECUCION) no cargan ningun cfg: sin esto, lo que
// dejo puesto la ultima mision jugada les quedaba pegado — un POR LA PATRIA sin radar ni poderes.
//   radar    'normal' es el de siempre (barra que carga, red, oleadas de misiles). 'voz' lo saca de
//            la pantalla entera y lo reemplaza por avisos hablados — ver el aviso `radar`
//   poderes  MOMENTUM y el RASANTE de la racha. En false no se cargan, no se dibujan y sus teclas
//            no hacen nada: el tutorial se vuela a mano y los poderes debutan en M2 (M1_CAMBIOS 10)
export const CFG_SIN_MISION = { radar: 'normal', poderes: true };

// OPCIONES DEL JUGADOR QUE UNA MISION PUEDE PISAR (COMBUSTIBLE: SI/NO y su escala). No van en los
// defaults de `C` —eso le pisaria la opcion al jugador en TODAS las misiones—: la mision que las
// declara las pisa, y al irse se devuelven (ver `loadLevel` en game.js).
export const PREFS_QUE_PISA_UNA_MISION = ['fuelOn', 'fuelScale'];

const C = over => ({
  sky: 'dusk', water: 'sea', terrain: 'sea', wind: true, obstacles: 1, coast: 230,
  bombs: 1, rain: 0, fog: 0, fogLen: 1, squad: 5, caza: 1, persec: 0,
  ...CFG_SIN_MISION,
  ...over,
});

// config legada (la usan pruebas y el modo camara); misma forma que antes
export const CAMPAIGN_CFG = C({});

// ---------- MISIONES ----------
// La CAMPAÑA las juega en orden cronologico; el CICLO DE MUERTE elige una al azar entre
// las que tienen buque (ver SHIP_MISSIONS abajo).
//   climax → SOLO misiones con buque. 'pasada' (default, se puede omitir), 'arena' o 'pulso'. Es el
//            desenlace de la mision, y es DATO: cambiarle la palabra a una mision le cambia el
//            final sin tocar una linea de codigo (SPEC_MODO_PASADA RF-14).
//            La regla de la campaña, dicha por el autor: la mayoria de los niveles con buque son
//            PASILLO + PASADA. El ARENA queda para las ocasionales, y son estas dos:
//              · m5 ARDENT — San Carlos. El callejon ES una arena: agua encerrada entre cerros
//                con el buque fondeado, y la mision se llama EL CALLEJON DE LAS BOMBAS.
//              · m14 GLAMORGAN — EL TERO, la mision final. El cierre de la campaña se pelea,
//                no se pasa de largo.
//            PROPUESTAS_PASADA §8 proponia dos mas (Galahad y Tristram, fondeados en Bahia
//            Agradable); quedaron en PASADA por pedido del autor —"ocasionalmente, uno o dos"—
//            y porque a los dos los bombardearon en corridas de ataque.
//   par    → puntaje de referencia para las estrellas (★ completar, ★★ par, ★★★ par×1.5)
//   roster → los Fieles vivos en esa mision (campaña; su largo = escuadron)
//   story  → secuencia larga de historia (SOLO campaña)
//   brief  → tarjeta corta de 2-3 lineas (ciclo de muerte)
//   epi    → desenlace (epilogo de aire + carta + placa historica)
// `despegue` → el cartel de la carrera de despegue: de donde salen y hacia que. La BASE es la misma
//            en toda la campaña —el escuadron vuela el A-4B, el del Grupo 5, que opero desde Rio
//            Gallegos toda la guerra— y el RUMBO sale de la linea de Condor que da el objetivo en el
//            primer tramo (`M0x_OBJETIVO` de data/story.js): el cartel no inventa geografia que el
//            guion no dijo. Antes era un texto unico para las catorce («PUERTO ARGENTINO · BAM
//            MALVINAS — rumbo al estrecho de San Carlos»), que solo era cierto para una.
export const MISSIONS = [
  {
    id: 'm1', name: 'CON SAL EN LAS ALAS', date: 'fines de abril de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'rumbo sudeste · mar abierto' },
    goal: { kind: 'distance', meters: 2200 },
    // COMBUSTIBLE PRENDIDO, PERO SIN CHANCHA. El tanque se ve y baja —es la mitad de lo que hace
    // falta para que el poder signifique algo cuando llegue— y en M1 solo se lo NOMBRA.
    //
    // POR QUE NO SE USA ACA, y no es por la nafta: es por el reloj. La Chancha tarda CH_ETA = 18 s
    // en aparecer desde que se la pide, mas ~11 conectado para llenar. La vuelta de esta mision dura
    // entre 5 y 10 segundos, asi que el Hercules llegaria despues del aterrizaje. Hacerla jugable
    // pedia alargar la vuelta al doble de la mision entera. Debuta en M2.
    cfg: C({ sky: 'dawn', obstacles: 0.5, bombs: 0, caza: 0, persec: 0, radar: 'voz', fuelOn: true, fuelScale: 0.25, poderes: false }),
    // EL RELOJ, A LA ESCALA DE ESTA MISION. El tanque son 100 unidades a 3.2 %/s: TREINTA Y UN
    // SEGUNDOS, un numero calibrado contra pasillos de medio minuto. Con las fases puestas el
    // rasante gasta el doble, asi que M1 volada despacio se secaba a los 1.740 m de los 2.970 que
    // mide ida mas vuelta — y en una mision donde no se puede morir, quedarse sin nafta no es una
    // muerte: es un avion que no vuela y no se hunde. Con 0.4 el peor caso llega con ~30% de tanque
    // (medido volando lo mas lento posible y pegado al agua todo el trayecto).
    //
    // 0.4 → 0.25 (23/9) POR EL TURBO NUEVO: desde PLAN_NAFTA_ALCANCE §6.6 el turbo cuesta en
    // proporcion a lo que acelera (r³ sobre el consumo de la fase, ~+7.6 %/s donde antes era +4.2
    // fijo), y el peor caso paso a ser TURBO DE PUNTA A PUNTA: con 0.4 se secaba antes de aterrizar
    // (−7%). Con 0.25, simulado con las formulas reales: turbo todo el tiempo llega con ~33%, y lento
    // sin turbo con ~62%. El criterio de arriba (el peor caso llega con ~30%) se mantiene.
    // G-05: las dos charlas en vuelo del tutorial. El ritual de Condor se dice EN VUELO y no en
    // tierra — la voz entra por la radio con el mar pasando abajo, que es como se escuchaba de
    // verdad — y los gansos son el respiro. `obstacles: 0` porque una charla pide cero enemigos en
    // pantalla (SPEC_CHARLAS_VUELO RF-01); el resto de la mision queda como estaba.
    //
    // EL PRIMER LIMITE ESTA DESPUES DEL DESPEGUE, y ese es el piso de todo tramo que tenga que
    // hablar: `run.dist` acredita durante `'takeoff'`, asi que al llegar a `'play'` el odometro ya
    // marca ~155 m. Este decia 0.06 —132 m— o sea que el tramo empezaba y terminaba adentro de la
    // carrera y `M01_OBJETIVO` nunca llegaba a ser vigente: la mision se jugaba sin su primera
    // linea y nada fallaba. Los tres limites se repartieron parejo entre el despegue y el 0.30 que
    // ya cerraba el tramo callado, asi que las tres escenas entran con ~2 s de aire entre una y
    // otra y la parte muda sigue terminando donde estaba. Ver SPEC_TRAMOS §8 divergencia 14.
    tramos: [
      { hasta: 0.12, obstacles: 0, caza: 0, bombs: 0, charla: 'M01_OBJETIVO' },
      { hasta: 0.21, obstacles: 0, caza: 0, bombs: 0, charla: 'M01_RITUAL' },
      { hasta: 0.30, obstacles: 0, caza: 0, bombs: 0, charla: 'M01_GANSOS' },
      { hasta: 1 },
    ],
    // SIN NUMEROS EN EL RECUENTO (M1_CAMBIOS 9): en el tutorial los puntos no se muestran ni se
    // explican. El recuento sigue existiendo —avisa que la mision termino— pero sin puntaje,
    // estrellas ni calificacion. Lo lee `drawResults`; ausente es `true`.
    puntos: false,
    // …Y EL FONDO DEL RECUENTO, FIJO: el sorteo de siempre puede sacar un destructor en llamas, y en
    // esta mision no hay un solo buque. `win3` es la formacion sobre el mar (assets/photos/win/).
    fondoRecuento: 'win3',
    // EN M1 EL AVION NO SE ROMPE (M1_CAMBIOS 7). Ningun choque —agua, ola, mastil, Puma— tira el
    // avion ni gasta un piloto: el golpe se cobra en CHAPA (`golpe` puntos) y la chapa no baja de
    // `piso`. Siempre vuela Tero. `gracia` son los segundos despues de un golpe en que otro no cuenta:
    // sin eso, un panzazo contra el agua cobraria un golpe por cuadro. Lo lee `onDeath` en game.js,
    // que es la unica puerta de todas las muertes.
    sinMuerte: { golpe: 25, piso: 25, gracia: 1.2 },
    // …Y EL GOLPE LO DICE PUMA. Bancos `AVISO` de data/story.js: `agua` es el golpe contra el mar o
    // el suelo, `choque` contra cualquier otra cosa, `piso` la primera vez que la chapa llega al piso
    // (y gana sobre los otros dos). `cada` son los segundos minimos entre dos avisos.
    avisos: { agua: 'AV_M1_AGUA', choque: 'AV_M1_CHOQUE', piso: 'AV_M1_PISO', radar: 'AV_M1_RADAR',
      vuelta: 'AV_M1_VUELTA', chancha: 'AV_M1_CHANCHA', cada: 6 },
    // HASTA DONDE LLEGA LA RADIO DE CONDOR (M1_CAMBIOS 8): sus lineas de un banco solo se eligen en
    // el primer 15% y el ultimo 15% del camino. En el medio habla la escuadrilla y nadie mas.
    // `hasta` es de la IDA (el despegue) y `desde` de la VUELTA: la fraccion del regreso a partir de
    // la cual la radio vuelve a entrar. El ritual de Condor (12%-21%) cae adentro, y justo despues
    // la leccion de SEGUIR se corta en el borde: ese corte es la escena, no un accidente.
    condorAlcance: { hasta: 0.2, desde: 0.5 },
    // LAS LECCIONES (M1_CAMBIOS 8): que se explica, donde, quien y con que foco. Las lineas estan en
    // data/story.js (`tipo: 'LECCION'`).
    //   en      fraccion del camino. Pasa de 1 en la vuelta, igual que las fases
    //   dice    la escena de una linea
    //   foco    zonas del HUD que quedan sin velo (ver `zonaHud` en render/hud.js)
    //   teclas  filas de la tabla de CONTROLES (`ctrl<Nombre>` de data/strings.js): el juego muestra
    //           la version de teclado o la de joystick segun lo que este conectado
    //   pausa   congela sin foco ni teclas (el corte de Condor y la explicacion de Puma)
    // Con `pausa`, `foco` o `teclas` la leccion CONGELA el juego hasta que se aprieta cualquier
    // tecla, y al soltarla la linea se calla para que la siguiente entre enseguida. Sin ninguna de
    // las tres es solo radio, y espera a que nadie este hablando.
    //
    // TODAS LAS DE LA IDA PAUSAN, y no es gusto: medido, cada linea de radio dura de 5 a 9 s y la
    // ida volada rapido dura menos que eso por leccion. Diciendolas en vuelo la cola se atrasaba y
    // la vuelta llegaba con cinco lecciones sin decir.
    //
    // `en: 'aterrizaje'` = al entrar a la aproximacion final, que es donde se habla de la pista.
    lecciones: [
      { en: 0.08, dice: 'LEC_M1_GAS', foco: ['gas', 'alt'], teclas: ['Gas', 'Dive'] },
      { en: 0.15, dice: 'LEC_M1_RUTA', foco: ['ruta'] },
      // SIN MODO SEGUIR (pedido del autor, 18/9): se fue la leccion de la barra del lider, y el corte
      // de Condor paso a cortarse explicando el techo del radar — foco en la altitud, donde vive.
      { en: 0.19, dice: 'LEC_M1_CORTE', pausa: true, foco: ['alt'] },
      { en: 0.19, dice: 'LEC_M1_INTERFERENCIA', pausa: true },
      { en: 0.45, dice: 'LEC_M1_TABLERO', foco: ['vel', 'horizonte', 'alt', 'gas'] },
      { en: 0.55, dice: 'LEC_M1_TURBO', foco: ['vel'], teclas: ['Boost'] },
      { en: 0.65, dice: 'LEC_M1_ARMAS', foco: ['canon', 'rack'], teclas: ['Gun', 'Msl'] },
      { en: 0.80, dice: 'LEC_M1_TONEL', teclas: ['Tonel'] },
      { en: 'aterrizaje', dice: 'LEC_M1_PISTA' },
    ],
    // IDA Y VUELTA (M1_CAMBIOS 5). La mision deja de ser un pasillo parejo: hay una ida rasante y
    // sin nada que dispare, el punto donde se da la vuelta (la fraccion 1, el objetivo), y un
    // regreso corto. Es DATO: el motor de fases ya existe y esto es su tabla (data/fases.js).
    //
    // LA VUELTA PISA SUS DEFAULTS. El tipo `vuelta` sube la siembra por su cuenta (obstacles 1.6,
    // caza 2) porque en el resto de la campaña volver es la parte dificil; en el tutorial no te
    // busca nadie, asi que se le escriben los tres ceros. Lo unico que cambia de verdad es la voz,
    // la nafta (venis liviano) y que es el unico tramo donde se puede llamar a LA CHANCHA.
    fases: [
      { tipo: 'transito', hasta: 0.12, bombs: 0, bidones: false },
      { tipo: 'descenso', hasta: 0.30, bombs: 0, bidones: false },
      { tipo: 'rasante', hasta: 0.70, bombs: 0, bidones: false },
      { tipo: 'rasante', hasta: 1, bombs: 0, bidones: false },
      // 1.6 y no 1.35: la vuelta tiene que durar lo que dura lo que se dice en ella. Con 1.35 son
      // 770 m — menos de cinco segundos volando rapido — y la linea de Puma sola ya dura 5,8.
      { tipo: 'vuelta', hasta: 1.6, obstacles: 0.5, caza: 0, bombs: 0, bidones: false },
    ],
    // SIN CHANCHA (se nombra en la vuelta y debuta en M2). Sin esto el reloj aparecia en verde, LISTA,
    // porque la barra se carga con puntos: un poder a la vista que no se puede usar.
    chancha: false,
    roster: F5, par: 5000, story: 'storyM1', brief: 'briefM1', epi: 'epiM1',
  },
  {
    id: 'm2', name: 'EL BAUTISMO DE FUEGO', date: '1 de mayo de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'cruce de costa' },
    goal: { kind: 'distance', meters: 2600 },
    cfg: C({ bombs: 0.5 }),
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M02_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F5, par: 6500, story: 'storyM2', brief: 'briefM2', epi: 'epiM2',
  },
  {
    id: 'm3', name: 'EL INVENTO', date: 'primeros dias de mayo de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'patrulla de reconocimiento costero' },
    goal: { kind: 'distance', meters: 2400 },
    // LA MISION MAS LIVIANA DE LA CAMPAÑA, Y ES A PROPOSITO (GUION_3 M3): es donde el juego
    // ENSEÑA el sistema de mejoras. El Pichon le toca el avion a Esteban y el jugador tiene que
    // poder SENTIR la diferencia en las manos — eso no se percibe esquivando flak. Por eso vuelve
    // a apagar el bombardeo y la cola, que M2 acababa de prender: la rampa no es monotona, se
    // afloja justo cuando hay algo nuevo que entender.
    // `terrain: 'coast'` porque el guion la llama patrulla de reconocimiento COSTERO, y los
    // "blancos de oportunidad" (boyas, un radar portatil) son la siembra baja de obstaculos.
    cfg: C({ sky: 'dawn', terrain: 'coast', obstacles: 0.5, bombs: 0, caza: 0 }),
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M03_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F5, par: 7000, story: 'storyM3', brief: 'briefM3', epi: 'epiM3',
  },
  {
    id: 'm4', name: 'EL DIA QUE SANGRO EL MAR', date: '4 de mayo de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'blanco: destructor clase 42' },
    goal: { kind: 'ship', ship: 'HMS SHEFFIELD', dist: 2600 },
    cfg: C({ bombs: 0.5 }),
    // EL TRANSITO DEL NARWAL (GUION_3, "de donde salen las posiciones"), y la primera mision con
    // TRAMOS (docs/sistemas/SPEC_TRAMOS.md). El guion pide un tramo "sin un solo enemigo en
    // pantalla" en el que el jugador SOLO VUELA Y ESCUCHA: las posiciones que dicta Condor —que
    // despues va a usar para encontrar el blanco— salen de un pesquero civil, y eso se planta
    // liviano para que el cobro de M5 no se vea venir.
    //
    // Son SEIS tramos y no uno porque una charla se arma UNA vez por tramo (RF-03, y `armar()` se
    // ignora si ya hay una corriendo): la conversacion se reparte en seis entradas, que es lo que
    // la convierte en conversacion y no en un cartel. Los seis son identicos salvo la escena.
    // (Decia TRECE: era la version por `radio:`, cuando cada linea suelta de strings.js iba en su
    // propio tramo. Al pasar a `charla:` cada entrada paso a ser una escena entera de story.js.)
    //
    // `obstacles: 0` y no una densidad baja: el criterio del guion es CERO enemigos, y una
    // densidad chica igual siembra cada doscientos metros. Con `bombs: 0` ademas no cae nada del
    // cielo — un bombardeo en el tramo mudo contradice la escena tanto como una fragata.
    // `marcas: true` lo transporta este item y lo va a consumir el de las marcas de Condor.
    //
    // LOS SEIS LIMITES SE REPARTEN PAREJO ENTRE EL DESPEGUE Y EL 0.351, y no es cosmetico: el
    // primero decia 0.04 —104 m— y `run.dist` acredita durante `'takeoff'`, que termina a los
    // ~155. O sea que el tramo de `M04_OBJETIVO` empezaba y terminaba adentro de la carrera y la
    // conversacion arrancaba por la segunda linea, sin que nada fallara. Repartidos, las seis
    // escenas entran con ~1,8 s de aire entre una y otra —que es lo que las hace conversacion y no
    // cartel— y el transito sigue terminando exactamente donde el autor lo cerro.
    // Ver SPEC_TRAMOS §8 divergencia 14.
    tramos: [
      { hasta: 0.10, obstacles: 0, caza: 0, bombs: 0, charla: 'M04_OBJETIVO' },
      { hasta: 0.15, obstacles: 0, caza: 0, bombs: 0, marcas: true, charla: 'M04_NARWAL_A' },
      { hasta: 0.20, obstacles: 0, caza: 0, bombs: 0, marcas: true, charla: 'M04_NARWAL_B' },
      { hasta: 0.25, obstacles: 0, caza: 0, bombs: 0, marcas: true, charla: 'M04_NARWAL_C' },
      { hasta: 0.30, obstacles: 0, caza: 0, bombs: 0, marcas: true, charla: 'M04_NARWAL_D' },
      { hasta: 0.351, obstacles: 0, caza: 0, bombs: 0, marcas: true, charla: 'M04_NARWAL_E' },
      // y se termina ahi: mar pleno, con la densidad y LA COLA de una mision de verdad. El salto
      // de 0 a 1.2 es el punto — el silencio se cobra en el contraste.
      { hasta: 1, obstacles: 1.2, caza: 1 },
    ],
    roster: F5, par: 7500, story: 'storyM4', brief: 'briefM4', epi: 'epiM4',
  },
  {
    id: 'm5', name: 'EL CALLEJON DE LAS BOMBAS', date: '21 de mayo de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'entrada al estrecho de San Carlos' },
    goal: { kind: 'ship', ship: 'HMS ARDENT', dist: 2600 },
    climax: 'arena',   // ver la nota de arriba
    // EL SILENCIO DEL NARWAL (GUION_3 M5, §3.9). Es el MISMO tramo de transito de m4 —misma
    // altura, mismo ritmo de radio— diecisiete dias despues, y el jugador lo reconoce. Solo que
    // esta vez Condor no tiene numeros para dar, y cuando el Gitano le pregunta por el pesquero
    // no contesta. La entrada `m5_radio6` es literalmente tres puntos: radio abierta y nada.
    //
    // `marcas: false` es lo que hace el cobro, y por eso vale mas que cualquier cartel: en m4 el
    // HUD marcaba las unidades antes de verlas; aca no las marca. El jugador entra a la mision
    // mas dificil del movimiento con menos informacion en pantalla, y sabe exactamente por que.
    //
    // Los cuatro limites del silencio, repartidos entre el despegue y el 0.31 que abre LA BOCA, por
    // lo mismo que en m4: el primero decia 0.05 —130 m— y el despegue acredita hasta los ~155, asi
    // que `M05_OBJETIVO` no llegaba a ser vigente nunca. Ver SPEC_TRAMOS §8 divergencia 14.
    tramos: [
      { hasta: 0.10, obstacles: 0, caza: 0, bombs: 0, charla: 'M05_OBJETIVO' },
      { hasta: 0.17, obstacles: 0, caza: 0, bombs: 0, marcas: false, charla: 'M05_NARWAL_A' },
      { hasta: 0.24, obstacles: 0, caza: 0, bombs: 0, marcas: false, charla: 'M05_NARWAL_B' },
      { hasta: 0.31, obstacles: 0, caza: 0, bombs: 0, marcas: false, charla: 'M05_NARWAL_C' },
      // LA BOCA: el paisaje se cierra y la mision empieza de verdad. Densidad a la mitad — lo que
      // esta pasando aca es el CALLEJON apareciendo, y no hace falta competirle con enemigos.
      { hasta: 0.40, obstacles: 1.0, caza: 1, radio: 'm5_boca' },
      // EL CALLEJON. Es el nombre de la mision: la tierra encima y el cielo lleno. `favor` inclina
      // la mezcla a los antiaereos, que es lo que habia en las laderas de San Carlos, y el
      // bombardeo sube — las bombas que le dan el nombre al lugar.
      { hasta: 0.88, obstacles: 1.7, caza: 1, bombs: 2, favor: ['aa', 'aatruck'] },
      // LA SALIDA a la bahia: las laderas bajan (lo hace el `hasta` del zigzag) y el fuego afloja.
      // El respiro dura poco: ahi asoma el ARDENT.
      { hasta: 1, obstacles: 1.1, caza: 1, radio: 'm5_salida' },
    ],
    // EL CALLEJON DE LAS BOMBAS, literal (PLAN_PASILLO_ZIGZAG Z4). El estrecho de San Carlos era un
    // brazo de mar angosto y torcido entre cerros de turba, y las fragatas fondeadas veian aparecer
    // a los A-4 de golpe por encima de una cresta. Esto es eso: laderas a los dos lados y
    // promontorios que se meten en el pasillo y hay que rodear.
    //
    // `amp: 0` — CAMARA QUIETA. El carril no dobla: lo que zigzaguea es el jugador esquivando la
    // tierra. (La maquinaria del carril curvo existe y esta probada; el dato dice que aca no se
    // usa. Ver las divergencias 22-26 del plan: doblar la camara se probo y se sintio mal.)
    //
    // `desde: 0.33` engancha justo despues del transito mudo del Narwal — el jugador sale del
    // silencio y se le cierra el paisaje encima, que es la escena. `hasta: 0.9` abre la bahia
    // ANTES del climax: el buque tiene que aparecer en mar abierto, no entre dos cerros.
    zigzag: {
      amp: 0, largo: 800, seed: 5,
      desde: 0.33, hasta: 0.9,
      paredes: { alto: 1, x: 46, mata: true },
    },
    cfg: C({ sky: 'cloudy', obstacles: 1.7 }),
    roster: F5, par: 8500, story: 'storyM5', brief: 'briefM5', epi: 'epiM5',
  },
  {
    id: 'm6', name: 'LA BOMBA QUE NO DESPERTO', date: '23 de mayo de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'fragata al noroeste del estrecho' },
    goal: { kind: 'ship', ship: 'HMS ANTELOPE', dist: 2800 },
    cfg: C({ sky: 'sun', obstacles: 1.7, fog: 1, fogLen: 0 }),
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M06_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F5, par: 9000, story: 'storyM6', brief: 'briefM6', epi: 'epiM6',
  },
  {
    id: 'm7', name: 'PASTELITOS', date: '25 de mayo de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'destructor en el estrecho' },
    goal: { kind: 'ship', ship: 'HMS COVENTRY', dist: 2800 },
    cfg: C({ sky: 'clear', obstacles: 1.7 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M07_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F5, par: 9500, story: 'storyM7', brief: 'briefM7', epi: 'epiM7',
  },
  {
    id: 'm8', name: 'EL BATIR DE LAS ALAS', date: '25 de mayo de 1982 · segunda salida',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'blanco: carguero grande' },
    goal: { kind: 'ship', ship: 'ATLANTIC CONVEYOR', dist: 3000 },
    cfg: C({ obstacles: 1.7, rain: 1, squad: 4 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M08_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F4, par: 10000, story: 'storyM8', brief: 'briefM8', epi: 'epiM8',
  },
  {
    id: 'm9', name: 'EL PIBE', date: '27 de mayo de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'centro logístico en San Carlos' },
    goal: { kind: 'distance', meters: 3200 },
    cfg: C({ sky: 'storm', obstacles: 1.7, bombs: 2, rain: 2, fog: 1, squad: 4 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M09_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F4, par: 10500, story: 'storyM9', brief: 'briefM9', epi: 'epiM9',
  },
  {
    id: 'm10', name: 'LOS PRIMOS', date: '5 de junio de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'reconocimiento armado sobre las islas' },
    goal: { kind: 'distance', meters: 3600 },
    // LA MAS LARGA DEL JUEGO Y LA UNICA DONDE EL NIVEL ES EL CLIMA (GUION_3 M10). No tiene buque
    // ni blancos: el enemigo es el frente cerrado, la niebla y la nafta. Por eso `obstacles` baja
    // a POCOS y `caza` a 0 en la mision numero diez — leerlo como un error de rampa seria leerlo
    // al reves: es el CONTRASTE de M9. La del Pichon era el infierno lleno; esta es el vacio.
    //
    // `fogLen: 3` (MUY LARGO) es la perilla que hace el trabajo: el banco de niebla dura tanto
    // que volar a ciegas deja de ser un susto y pasa a ser el estado normal del nivel.
    //
    // Es ademas la PRIMERA CON TRES — el guion la titula asi. El hueco del Pichon en la
    // formacion no se nombra: se ve, porque `roster` tiene tres nombres.
    cfg: C({ sky: 'storm', obstacles: 0.5, bombs: 0, caza: 0, rain: 2, fog: 1, fogLen: 3, squad: 3 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M10_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F3, par: 11000, story: 'storyM10', brief: 'briefM10', epi: 'epiM10',
  },
  {
    id: 'm11', name: 'LO QUE NO SE DICE', date: '8 de junio de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'apoyo sobre Fitzroy' },
    goal: { kind: 'ship', ship: 'RFA SIR GALAHAD', dist: 3000 },
    cfg: C({ sky: 'cloudy', obstacles: 1.7, squad: 3, caza: 2 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M11_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F3, par: 11500, story: 'storyM11', brief: 'briefM11', epi: 'epiM11',
  },
  {
    id: 'm12', name: 'ANGEL DE CORRIENTES', date: '8 de junio de 1982 · segunda salida',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'segunda salida sobre Fitzroy' },
    goal: { kind: 'ship', ship: 'RFA SIR TRISTRAM', dist: 3000 },
    cfg: C({ obstacles: 1.7, bombs: 2, rain: 1, squad: 3 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M12_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F3, par: 12000, story: 'storyM12', brief: 'briefM12', epi: 'epiM12',
  },
  {
    id: 'm13', name: 'LA CENA', date: '11 de junio de 1982',
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: 'apoyo a las posiciones de los montes' },
    goal: { kind: 'ship', ship: 'HMS BROADSWORD', dist: 3200 },
    cfg: C({ sky: 'moon', terrain: 'land', obstacles: 1.7, bombs: 2, fog: 1, squad: 3, caza: 2 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    // G-08: el objetivo por radio, en el primer tramo. `obstacles: 0` no es cosmetico — una charla
    // en vuelo pide CERO enemigos en pantalla (SPEC_CHARLAS_VUELO RF-01).
    tramos: [
      { hasta: 0.1, obstacles: 0, caza: 0, bombs: 0, charla: 'M13_OBJETIVO' },
      { hasta: 1 },
    ],
    roster: F3, par: 12500, story: 'storyM13', brief: 'briefM13', epi: 'epiM13',
  },
  {
    id: 'm14', name: 'EL TERO', date: 'madrugada del 12 de junio de 1982',
    // SIN RUMBO, a proposito: M14 es la unica mision sin orden. Esa noche no hay pajaro asignado
    // ni nadie que los mande (ver RESUELTOS_GUION, G-08), y el cartel no puede decir lo contrario.
    despegue: { desde: 'BAM RÍO GALLEGOS', rumbo: '' },
    goal: { kind: 'ship', ship: 'HMS GLAMORGAN', dist: 3400 },
    climax: 'arena',   // ver la nota de arriba
    cfg: C({ sky: 'night', obstacles: 1.7, bombs: 2, fog: 1, fogLen: 2, squad: 3, caza: 2 }),
    chancha: false,   // la Chancha vuela corto desde el epilogo de m6: no baja mas al sur
    roster: F3, par: 14000, story: 'storyM14', brief: 'briefM14', epi: 'epiM14',
  },
];

// EL PULSO ('pulso', PLAN_EL_PULSO.md) es el tercero, y HOY NINGUNA MISION LO PIDE. No es un
// olvido: el plan §6.5 lo prohibe explicitamente —«no reemplazar a la PASADA de oficio»— hasta que
// pase una de dos cosas: que el rescate de la PASADA falle su gate (R6) y EL PULSO pase a ser el
// climax general, o que exista m14, el momento del misil del guion, que es su via de entrada
// garantizada. El modo esta entero y probado (`npm run pulso`); lo unico que falta para que un
// nivel lo juegue es escribir `climax: 'pulso'` en su renglon de arriba. Esa es la prueba de que
// el climax es DATO: se enchufa con una palabra, no con una rama de codigo.

/** QUE CLIMAX juega una mision: 'pasada' · 'arena' · 'pulso' · null (no tiene, la cierra el PASILLO).
 *
 *  El default vive ACA y no en `game.js` a proposito: es la regla de la campaña, no una decision
 *  del motor, y siendo pura se puede probar en node sin abrir una ventana (SPEC_MODO_PASADA
 *  RF-14 — "cambiar el campo de una mision cambia su climax sin tocar codigo").
 *
 *  LA CUARENTENA SE APLICA ACA, Y NO PISANDO EL DATO (PLAN_REFACTOR §4b, 18/8/2026): las dos
 *  misiones que declaran `climax: 'arena'` LO SIGUEN DECLARANDO, y mientras el ARENA y la PASADA
 *  esten apartados juegan el suplente. Reescribir los renglones habria borrado la decision del
 *  autor y despues nadie se acuerda de cuales eran; asi, levantar la cuarentena es sacar una
 *  entrada de data/cuarentena.js y la campaña vuelve sola a lo que decia. */
export const climaxDeclarado = m => m.goal.kind !== 'ship' ? null : (m.climax || 'pasada');
export const climaxOf = m => {
  const c = climaxDeclarado(m);
  return c && climaxEnCuarentena(c) ? CLIMAX_SUPLENTE : c;
};

// indices de las misiones CON buque: es el pool del CICLO DE MUERTE y del ARENA (las de
// distancia no tienen climax que jugar ni layout de zonas que elegir)
export const SHIP_MISSIONS = MISSIONS.reduce((a, m, i) => {
  if (m.goal.kind === 'ship') a.push(i);
  return a;
}, []);
