// PIRUETAS: el catalogo de maniobras de combate. Datos puros — quien las EJECUTA es
// systems/moves.js, y quien las DISPARA es el detector de combos de core/input.js via game.js.
//
// Son "poderes" estilo juego de pelea: una secuencia de dos toques direccionales las lanza, y
// durante la maniobra el avion NO se controla — salvo el eje que cada una deja libre (`steer`).
// El tonel (barrel roll) es la pirueta original del juego y conserva su camino legado
// (run.rollT); las demas usan run.mv.
//
//   dur    duracion en segundos
//   steer  eje que el jugador SIGUE controlando: 'x' (lateral), 'y' (vertical) o null (nada)
//   fire   ¿puede disparar el cañon durante la maniobra?
//   turbo  ¿el turbo funciona durante la maniobra?
//   tight  el perfil de colision se ENCOGE (alas de canto / banqueo fuerte), como en el tonel —
//          tambien habilita el bonus de roce "con estilo" (250 en vez de 75)
//   drift  DESPLAZAMIENTO LATERAL hacia el lado del rolido, en unidades/segundo de pico.
//          Un avion que rola inclina su vector de sustentacion y se VA para ese lado; sin esto,
//          las dos maniobras que rolan 360° —SPLIT-S y TIRABUZON— giraban clavadas en su carril
//          (medido: 0.0 de desplazamiento contra 29.7 del break turn) y se leian como una
//          animacion del sprite en vez de una maniobra. El perfil es una campana: arranca y
//          termina en cero, asi no queda velocidad lateral colgada al salir.
//
// COMBOS: secuencias de 3 o 4 toques direccionales, cada uno a menos de 0.28 s del anterior
// (teclado o joystick — cruceta o flicks del stick). Ver docs/PIRUETAS.md para la tabla completa.
//
// NINGUNA se hace con DOS toques, y es a proposito. Antes los 16 pares posibles estaban ocupados:
// no existia forma de tocar dos direcciones seguidas sin ejecutar algo. Y como las teclas de combo
// son las de VOLAR, el avion parecia manejarse solo — bombear gas (↑↑) lanzaba un yo-yo, corregir
// el rumbo (←→) lanzaba un S-turn. Con un minimo de tres toques el PASILLO ya no produce
// secuencias completas, y NINGUNA maniobra usa repeticion vertical, asi que bombear gas
// ('↑↑↑↑↑') no puede disparar nada.
//
// DOS MANOS, DOS FAMILIAS. Los toques del stick IZQUIERDO (o las flechas) se anotan en minuscula;
// los del stick DERECHO —el que rola— en MAYUSCULA. Todo lo que ROLA se pide con la mano que rola,
// y todo lo que ZIGZAGUEA se queda en la mano que esquiva. Antes los rolidos estaban en el stick
// izquierdo, que es el de volar: '←←←' salia solo tratando de pasar entre dos obstaculos.
// En teclado el "stick derecho" son W/A/S/D con la MIRA FIJA, y Q/E + R/F siempre.
//
//   STICK DERECHO — las que ROLAN
//     ⟳←←←   TONEL izquierda           ⟳→→→   TONEL derecha
//     ⟳↓→↑←  TONEL BARRIL horario      ⟳↓←↑→  TONEL BARRIL antihorario
//     ↓⟳←←   TIRABUZON izquierda       ↓⟳→→   TIRABUZON derecha   (picas con el izq, rolas con el der)
//
//   LOS DOS STICKS — el ASCENSOR (mirar hacia donde vas y empujar dos veces)
//     ⟳↓ ↓↓  TERRAIN MASKING           ⟳↑ ↑↑  ASCENSO / SOBRE EL RADAR   (segun ALTURA)
//
//   STICK IZQUIERDO — las que ZIGZAGUEAN
//     ↑↓↓    SPLIT-S / MASKING         ↓↑↑    POP-UP / HIGH YO-YO   (segun ALTURA)
//     ↓↑↓    LOW YO-YO                 ↑↓↑    HIGH YO-YO
//     ↓←←    BREAK TURN izquierda      ↓→→    BREAK TURN derecha
//     ←→←    S-TURN izquierda          →←→    S-TURN derecha
//     ↑←→    JINK izquierda            ↑→←    JINK derecha
//
// CONTEXTUALES. '↑↓↓' y '↓↑↑' no los decide como apretas sino la ALTURA A LA QUE VIENE VOLANDO EL
// AVION (plane.y). Se resuelve en el `combo` de game.js contra los umbrales de abajo.
//
//   ↑↓↓  con el avion ALTO (y > MV_HI)  → SPLIT-S          (hay cielo debajo para picar)
//   ↑↓↓  con el avion BAJO (y <= MV_HI) → TERRAIN MASKING  (ya estas bajo: pegate mas)
//   ↓↑↑  con el avion BAJO (y < MV_LO)  → POP-UP           (salis de rasante hacia arriba)
//   ↓↑↑  con el avion ALTO (y >= MV_LO) → HIGH YO-YO       (ya tenes altura: colgate arriba)
//
// REGLA DE DISEÑO: ninguna secuencia puede ser PREFIJO de otra, o la corta dispararia antes de que
// la larga se complete. El caso inverso (una corta que es el FINAL de una larga, como '←←' dentro
// de '↓←←') lo resuelve la coincidencia por sufijo mas largo en core/input.js.
export const MOVES = {
  // medio tonel invertido + picada fuerte: la salida vertical hacia ABAJO. Pide altura.
  // DISPARA aunque quede invertido: el cañon sigue montado en las alas y la punteria del juego
  // (mira libre o auto-apuntado) no depende de para donde este la panza. El tonel clasico
  // siempre dejo disparar, asi que bloquearlo aca era una incoherencia entre dos maniobras que
  // el jugador vive como la misma cosa (dar vuelta el avion).
  splits: { dur: 1.15, name: 'SPLIT-S', steer: 'x', fire: true, turbo: false, tight: true, drift: 24 },
  // viraje quebrado: tiron lateral violento sostenido, banqueo a fondo
  breakt: { dur: 0.7, name: 'BREAK TURN', steer: 'y', fire: true, turbo: false, tight: true },
  // sube, cuelga y recae: esquive vertical que sangra velocidad
  hiyo: { dur: 1.0, name: 'HIGH YO-YO', steer: 'x', fire: true, turbo: false, tight: false },
  // pica y remonta: convierte altura en VELOCIDAD (el unico combo que acelera)
  loyo: { dur: 1.0, name: 'LOW YO-YO', steer: 'x', fire: true, turbo: true, tight: false },
  // zigzag de esquive: 4 quiebres laterales secos, rumbo impredecible — no se controla nada
  jink: { dur: 0.85, name: 'JINK', steer: null, fire: true, turbo: false, tight: true },
  // barrido en S: se abre a un lado y vuelve — esquiva sin perder el carril
  sturn: { dur: 1.1, name: 'S-TURN', steer: 'y', fire: true, turbo: false, tight: true },
  // pegarse al terreno: clava el avion a ras, congela el roce y DESCARGA el radar enemigo
  mask: { dur: 1.6, name: 'TERRAIN MASKING', steer: 'x', fire: true, turbo: true, tight: false },
  // trepada brusca de ataque desde rasante
  popup: { dur: 0.8, name: 'POP-UP', steer: 'x', fire: true, turbo: false, tight: false },
  // ASCENSO: el TERRAIN MASKING dado vuelta. Trepa sostenido hasta un TECHO (run.mvTgt) y se
  // queda ahi — no es un impulso como el pop-up, es "llevame hasta esa altura y sostenela".
  // El techo lo elige el combo segun donde venis (ver `combo` en game.js):
  //   ASCENSO         → el techo del radar: la altura maxima que podes tener sin que te pinten.
  //   SOBRE EL RADAR  → el techo de vuelo, ya expuesto. Solo se ofrece si YA estas contra el radar,
  //                     asi que cruzarlo es una segunda decision y nunca un accidente.
  climb: { dur: 1.2, name: 'ASCENSO', steer: 'x', fire: true, turbo: true, tight: false },
  climbmax: { dur: 2.0, name: 'SOBRE EL RADAR', steer: 'x', fire: true, turbo: true, tight: false },
  // TIRABUZON: rola sobre su propio eje picando. No deja controlar nada (steer null): lo que la
  // define es que el jugador no la corrige, no que el avion no se mueva.
  // OJO: antes tenia `plane.vx = 0` clavado y el comentario decia que NO irse de costado era "el
  // punto" de la maniobra. Se cambio a pedido: rolando 360° sin desplazarse se veia estatica.
  // El drift es la MITAD del split-s, para que siga leyendose mas axial que las demas; ponerlo en
  // 0 devuelve el comportamiento anterior sin tocar nada mas.
  spin: { dur: 1.0, name: 'TIRABUZON', steer: null, fire: true, turbo: true, tight: true, drift: 12 },
  // TONEL BARRIL: la O grande — se abre, sube, pasa boca arriba y vuelve. Trayectoria cerrada,
  // asi que tampoco se controla: corregirla la dejaria de cerrar.
  barrel: { dur: 1.4, name: 'TONEL BARRIL', steer: null, fire: true, turbo: false, tight: true },
};

/** ¿La maniobra activa encoge el perfil de colision? (la consultan collision y el overlay) */
export const mvTight = mv => !!(mv && MOVES[mv] && MOVES[mv].tight);

// UMBRALES DE ALTURA de los pares contextuales (ver el bloque de COMBOS arriba). Son unidades de
// MUNDO — la misma escala de plane.y, donde el techo de vuelo es FLY_TOP = 68.
//
// Son DOS numeros distintos porque responden preguntas distintas: MV_HI pregunta "¿tengo aire
// debajo para tirarme?" y MV_LO, "¿estoy lo bastante bajo como para que trepar sea la jugada?".
// Referencia para calibrarlos: el multiplicador de altitud cambia a los 4.5 (x10), 9 (x5) y
// 16 (x2) — MV_HI queda apenas arriba del ultimo escalon, asi que en la practica "ALTO" coincide
// con el x1 del HUD y "BAJO" con x10/x5.
//
// MV_HI SIGUE EN 18 aunque el techo de radar bajara de 30 a 20 (data/tuning.js), y no es un
// descuido: 18 esta atado a los escalones del multiplicador, que no se movieron. Lo que cambio es
// lo que SIGNIFICA estar ahi — a 18 ya estas a dos metros del radar y adentro de la banda letal
// de los cazas (15-25). Que el SPLIT-S sea justamente el combo que se habilita ahi pasa a ser una
// salida: la maniobra que te tira para abajo es la forma de salir del techo y del trafico de una.
export const MV_HI = 18, MV_LO = 14;

// ---------------- EL MENU MANIOBRAS (PLAN_MANIOBRAS_FASES: la puerta del jugador) ----------------
// El catalogo se DERIVA de MOVES, igual que el de CINEMATICAS se deriva de las timelines: una
// pirueta nueva aparece en el menu sin tocar nada mas, y ninguna lista puede quedar
// desincronizada de la otra porque hay una sola.
//
// Los COMBOS son un ROTULO, no la verdad: la verdad es el dispatcher de game.js, y quien la
// verifica es `npm run maniobras` (lee los `case` de ahi y prueba la gramatica). Estan escritos
// pegados al bloque de prosa de arriba —que dice lo mismo— para que un cambio en uno deje al otro
// a la vista.
const COMBO = {
  splits: '↑↓↓ (alto)', breakt: '↓←← · ↓→→', hiyo: '↑↓↑ · ↓↑↑ (alto)', loyo: '↓↑↓',
  jink: '↑←→ · ↑→←', sturn: '←→← · →←→', mask: '⟳↓↓↓ · ↑↓↓ (bajo)', popup: '↓↑↑ (bajo)',
  climb: '⟳↑↑↑', climbmax: '⟳↑↑↑ (contra el radar)', spin: '↓⟳←← · ↓⟳→→',
  barrel: '⟳↓→↑← · ⟳↓←↑→', tonel: '⟳←←← · ⟳→→→',
};

// EL TONEL entra a mano y no es un olvido: no esta en MOVES porque conserva su camino legado
// (run.rollT en flight.js). El dia que se mude al catalogo, esta linea se cae sola.
const TONEL = { id: 'tonel', name: 'TONEL', dur: 0.55, legado: true };

/** Las filas del menu MANIOBRAS: la pirueta, con que se pide y que hace. */
export const maniobras = () => [TONEL, ...Object.keys(MOVES).map(id => ({ id, ...MOVES[id] }))]
  .map(m => ({
    id: m.id, titulo: m.name,
    desc: (COMBO[m.id] || '—') + '   ·   ' + m.dur + ' s'
      + (m.legado ? '   ·   camino legado' : '   ·   ' + (m.steer ? 'palanca ' + m.steer : 'sin palanca')),
  }));

// LAS TRES PRESENTACIONES (la regla del 16/8: toda maniobra se diseña una vez y se entrega en tres
// formas). Cada una es una llamada a los verbos de `pruebasApi()` — exactamente el mismo patron que
// data/pruebas.js: DATA que describe llamadas a la capa de sondas, sin una linea de logica de juego.
//
// El retardo de 1,4 s no es decorativo: entra volando desde el aire, y lanzar la pirueta en el
// primer cuadro la haria arrancar con el avion todavia acomodandose.
export const MV_VISTAS = [
  {
    id: 'yo', titulo: 'LA LANZO YO',
    desc: 'El poder del jugador: tu avion la vuela, como con el combo',
    setup: (a, mv) => { a.patria(); a.luego(1.4, g => { g.sonda('pasilloLimpio'); g.sonda('mv', mv); }); },
  },
  {
    id: 'companero', titulo: 'UN COMPAÑERO',
    desc: 'Un Fiel entra de costado, la vuela en escena y se va',
    setup: (a, mv) => { a.patria(); a.luego(1.4, g => { g.sonda('pasilloLimpio'); g.sonda('mvactor', mv, 'izq'); }); },
  },
  {
    id: 'cine', titulo: 'COMO CINEMATICA',
    desc: 'La misma maniobra filmada: bandas negras y el mundo en camara lenta',
    setup: (a, mv) => { a.patria(); a.luego(1.4, g => { g.sonda('pasilloLimpio'); g.sonda('mvfilm', mv); }); },
  },
];

// ---------------- LAS PIRUETAS DE ACTOR (PLAN_MANIOBRAS_FASES M1) ----------------
// Las perillas de `systems/wingmv.js`: un Fiel que ENTRA en escena, vuela una de estas maniobras y
// se va. Son de PUESTA EN ESCENA, no de juego — ninguna afecta al avion del jugador.
//
// La regla que las ordena: **el actor tiene que entrar volando, hacer la figura ADENTRO del cuadro
// y salirse**. Los tres momentos son de duracion fija y la maniobra dura lo que dure (`dur` del
// catalogo), asi que una escena arma su tiempo total sumando ENTRA + dur + SALE.
export const WINGMV = {
  ENTRA: 1.0,      // segundos de entrada en escena (interpolados con smoothstep: entra volando)
  SALE: 1.4,       // segundos de salida de plano
  // NACE AFUERA DEL CARRIL del jugador (FLY_X = 38) — de eso se trata "entrar de costado". Es
  // tambien la razon por la que `movesSystem` no le aplica los topes: en su primer cuadro lo
  // teletransportarian al borde.
  X0: 66,
  // LAS PROFUNDIDADES, en absoluto y no relativas al avion del jugador (PZ = 14 en render/ctx.js).
  // Son numeros y no un import a proposito: un SISTEMA no puede importar del render (lo vigila
  // `npm run lint:layers`), y ademas la profundidad a la que entra un actor es una decision de
  // puesta en escena — no "donde esta el jugador mas cinco".
  Z: 19,           // z de crucero del actor: MAS LEJOS que el jugador, para no cruzarsele encima
  Z0: 5,           // z de nacimiento de la entrada 'atras': cerca de la camara, para sobrepasar
  Z_MAX: 104,      // se lo considera fuera de escena cuando se aleja mas que esto
  DY: 7,           // cuanto MAS ALTO encara: la figura queda en cielo limpio, no sobre el morro
  // cuanto ADELANTA el punto de arranque hacia el lado opuesto al de entrada: entra por izquierda
  // y vuela la figura hacia la derecha, asi la maniobra cruza el cuadro en vez de salirse por
  // donde entro.
  ENC: 12,
  SPD: 82,
  SAL_VX: 42, SAL_VY: 10, SAL_VZ: 26,   // empuje de la salida (lateral · vertical · alejarse)
  // TOPE DURO DE VIDA. Misma leccion que el director de cinematicas: algo que entra a escena tiene
  // que tener escrito COMO SE TERMINA, o un caso raro lo deja ahi para siempre.
  VIDA: 9,
};
