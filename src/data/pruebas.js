// EL CATALOGO DEL MODO PRUEBAS (docs/proyecto/COMO_PROBAR.md §4, fase PR0).
//
// Cada entrada es UN MOMENTO: el juego te pone exactamente ahi, en un toque. Es DATA pura —
// como el resto de `data/`, no importa nada — y su campo `setup` recibe la API de sondas que
// arma game.js (`pruebasApi()`), asi que el catalogo no puede tener logica de juego propia.
//
// LA REGLA DE ORO (§4): PRUEBAS es una INTERFAZ sobre la capa de sondas que YA EXISTE. Si un
// momento necesita algo nuevo, ese algo NACE COMO SONDA — utilizable tambien desde la consola y
// desde los fixtures — y aca solo se lo llama. Asi el catalogo no puede divergir del juego real:
// si la sonda se rompe, se rompen las tres puertas a la vez y alguna lo grita.
//
// Los VERBOS de la api (ver `pruebasApi` en game.js):
//   a.mision(id)        el PASILLO de esa mision, sin briefing ni guion
//   a.patria()          el pasillo infinito (POR LA PATRIA), para los momentos sin mision propia
//   a.arena(id)         la batalla del ARENA sobre el buque de esa mision
//   a.pasada(id)        el climax PASADA, derecho a la corrida
//   a.pulso(id)         el climax EL PULSO
//   a.escena(ID)        una escena del MODO HISTORIA (data/story.js)
//   a.recarga(qs)       recarga la pagina con esos parametros (unico camino para lo que se
//                       resuelve al cargar, como ?no3d)
//   a.luego(t, fn)      corre fn a los t segundos de corrida — casi todas las sondas del mundo
//                       necesitan un mundo andando, y este es el unico modo de esperarlo
//   a.sonda(n, ...args) llama a window.__<n> — la MISMA sonda de la consola y del fixture
//   a.cfg(obj)          pisa el cfg del mapa (clima, obstaculos) y lo aplica
//
// `titulo` y `desc` van ACA y no en data/strings.js, con el mismo criterio que los nombres de
// campaña (data/campaigns.js): son rotulos de una herramienta de autor, no texto del juego. El
// MARCO de la pantalla (titulo, ATRAS, el sello PRUEBA del HUD) si esta traducido.
//
// `{ head }` = encabezado de seccion; el cursor no se para ahi (mismo criterio que el menu de
// HISTORIA y que OPCIONES).
export const PRUEBAS = [
  { head: 'prSecMision' },
  {
    id: 'idayvuelta', titulo: 'IDA Y VUELTA', desc: 'Las cinco fases: sigilo, blanco y regreso · ~6 min',
    // LA UNICA FILA DEL CATALOGO QUE SE VUELA ENTERA, y por eso arranca distinto a todas las
    // demas: los otros momentos te ponen EN un instante, y este existe para medir el TIEMPO — que
    // el transito respire, que el silencio se note, que la vuelta no se sienta un epilogo. Saltar
    // a una parte seria medir otra cosa, asi que no lleva ni una sonda diferida.
    // `start: 'runway'` —contra el `aire: true` que el verbo pone por defecto— porque la mision
    // termina aterrizando: la unica prueba del juego que se cierra con las ruedas tiene que
    // empezar con las ruedas.
    setup: a => a.mision('t15', { start: 'runway' }),
  },
  {
    id: 'idayvueltaSmall', titulo: 'IDA Y VUELTA SMALL', desc: 'La misma mision entera, a distancia corta · ~4 min',
    // t17: todo el flujo de t15 —despegue, ida, Chancha, suelta, escape, viraje, vuelta, CAP y
    // aterrizaje— con 6 km por tramo en vez de 29. Arranca en la pista por lo mismo que la otra.
    setup: a => a.mision('t17', { start: 'runway' }),
  },
  {
    id: 'idayvueltaSmall2', titulo: 'IDA Y VUELTA SMALL 2', desc: 'Una BASE en tierra de blanco, y toda la geografia · ~4 min',
    // t18: la t17 con una estructura de blanco (la BASE COSTERA, en su explanada) y la geografia
    // escrita en km — niebla, costa, isla, acantilados con puente, y en la vuelta canal y farallon.
    setup: a => a.mision('t18', { start: 'runway' }),
  },
  {
    id: 'idayvueltaNoche', titulo: 'IDA Y VUELTA NOCHE', desc: 'La IDA Y VUELTA de noche; se vuelve con luna · ~6 min',
    // t19: la t15 con el cielo de noche (4/10). La vuelta pasa sola a luna.
    setup: a => a.mision('t19', { start: 'runway' }),
  },
  {
    id: 'idayvueltaSmallNoche', titulo: 'IDA Y VUELTA SMALL NOCHE', desc: 'La SMALL de noche; se vuelve con luna · ~4 min',
    // t20: la t17 con el cielo de noche (4/10).
    setup: a => a.mision('t20', { start: 'runway' }),
  },
  {
    id: 'idayvueltaSmallLuna', titulo: 'IDA Y VUELTA SMALL LUNA', desc: 'La SMALL de noche CON luna: se ve el mar y el reflejo · ~4 min',
    // t21: la t17 con luna desde el despegue (4/10), para comparar con la SIN luna (t20)
    setup: a => a.mision('t21', { start: 'runway' }),
  },

  { head: 'prSecClimax' },
  {
    id: 'suelta', titulo: 'LA SUELTA', desc: 'El buque al final del pasillo: altura, soltar y embocarla',
    // EN EL PASILLO, sin corte: la mision t16 entera (3 km de mar vacio y el buque). Arranca en el
    // aire como todos los momentos; lo que se mide empieza a los ~5 s, cuando asoma el casco.
    setup: a => a.mision('t16'),
  },
  {
    id: 'suelta3', titulo: 'LA SUELTA · 3 BOMBAS', desc: 'La misma, con bombas en el ala en vez de tanques',
    // la carga de ala es lo unico que cambia: la del centro (la del buque) la llevan todos
    setup: a => a.mision('t16', { carga: 'tres_bombas' }),
  },
  // (LA PASADA y LA PASADA SIN CORTE salieron del catalogo el 4/10, a pedido del autor)
  // (EL MOMENTUM VIEJO —el climax en riel 2D, `?no3d`— salio del catalogo el 4/10: ya no funciona)

  // LOS BUQUES. Existe porque una clase de buque nueva no se puede VER sin una mision que la
  // apunte, y escribir una mision para mirar una silueta es al reves. DESDE EL 4/10 (autor) ES LA
  // SUELTA DE SIEMPRE y en la IDA Y VUELTA entera (t15, la de distancia completa): se carga la
  // mision, se le cambia el buque con la misma sonda de la consola y los fixtures, y se salta al
  // 93 % de la ida — el buque ya asomando—. Se lo bombardea como a cualquiera y DESPUES SIGUE LA
  // VUELTA. (Antes cargaba m4, cuyo climax en cuarentena caia en EL PULSO.)
  { head: 'prSecBuques' },
  {
    id: 'buqueCv', titulo: 'BUQUE · PORTAAVIONES', desc: 'Cubierta corrida, rampa de salto y la isla a estribor · HMS INVINCIBLE',
    setup: a => { a.mision('t15'); a.luego(1.2, g => { g.sonda('buqueSet', 'HMS INVINCIBLE'); g.sonda('wjump', 0.93); }); },
  },
  {
    id: 'buqueT21', titulo: 'BUQUE · FRAGATA TIPO 21', desc: 'Proa de clipper y la popa vacia · HMS AVENGER',
    setup: a => { a.mision('t15'); a.luego(1.2, g => { g.sonda('buqueSet', 'HMS AVENGER'); g.sonda('wjump', 0.93); }); },
  },
  {
    id: 'buqueT42', titulo: 'BUQUE · DESTRUCTOR TIPO 42', desc: 'Torreta a proa, isla al medio y los radomos · HMS SHEFFIELD',
    setup: a => { a.mision('t15'); a.luego(1.2, g => { g.sonda('buqueSet', 'HMS SHEFFIELD'); g.sonda('wjump', 0.93); }); },
  },
  {
    id: 'buqueLog', titulo: 'BUQUE · LOGISTICO', desc: 'Casco alto, carga adelante y la isla entera a popa · RFA SIR GALAHAD',
    setup: a => { a.mision('t15'); a.luego(1.2, g => { g.sonda('buqueSet', 'RFA SIR GALAHAD'); g.sonda('wjump', 0.93); }); },
  },

  { head: 'prSecCola' },
  {
    id: 'colaAviso', titulo: 'LA COLA · EL AVISO', desc: 'El Harrier se te pone atras, con el pasillo vacio',
    setup: a => { a.patria(); a.luego(1.6, g => { g.sonda('czcalma', 1); g.sonda('czstart', {}); }); },
  },
  {
    id: 'colaSobrepaso', titulo: 'LA COLA · EL SOBREPASO', desc: 'El cruce cercano: 1,15 s dentro de un ciclo de un minuto',
    setup: a => {
      a.patria();
      a.luego(1.6, g => { g.sonda('czcalma', 1); g.sonda('czstart', {}); });
      a.luego(2.2, g => g.sonda('czfase', 'sobrepaso'));
    },
  },
  {
    id: 'colaVentana', titulo: 'LA COLA · LA VENTANA', desc: 'Lo tenes adelante: la unica chance de tirarle',
    setup: a => {
      a.patria();
      a.luego(1.6, g => { g.sonda('czcalma', 1); g.sonda('czstart', {}); });
      a.luego(2.2, g => g.sonda('czfase', 'ventana'));
    },
  },

  { head: 'prSecDestr' },
  {
    id: 'romperDepot', titulo: 'EL DESPIECE', desc: 'Un deposito reventado delante del morro',
    setup: a => { a.mision('m11'); a.luego(1.6, g => g.sonda('seaput', 6)); a.luego(2, g => g.sonda('romper', 'depot')); },
  },
  {
    id: 'cadena', titulo: 'LA CADENA', desc: 'Deposito entre dos carpas: la propagacion en contexto',
    setup: a => { a.mision('m11'); a.luego(1.6, g => g.sonda('seaput', 6)); a.luego(2, g => g.sonda('cadena')); },
  },
  {
    id: 'chocar', titulo: 'EL CHOQUE', desc: 'Embestir un deposito a la velocidad a la que venis',
    setup: a => { a.mision('m11'); a.luego(1.6, g => g.sonda('seaput', 6)); a.luego(2.4, g => g.sonda('chocar', 'depot')); },
  },

  { head: 'prSecAgua' },
  {
    id: 'olaMarejada', titulo: 'LA MAREJADA', desc: 'La ola chica: se salta',
    setup: a => { a.patria({ obstacles: 0 }); a.luego(1.4, g => { g.sonda('seaclear'); g.sonda('seaput', 7); }); a.luego(1.8, g => g.sonda('ola', 'marejada')); },
  },
  {
    id: 'olaRebelde', titulo: 'LA OLA REBELDE', desc: 'Ocho metros de cara: la que mata',
    setup: a => { a.patria({ obstacles: 0 }); a.luego(1.4, g => { g.sonda('seaclear'); g.sonda('seaput', 7); }); a.luego(1.8, g => g.sonda('ola', 'rebelde')); },
  },
  {
    id: 'tormenta', titulo: 'EL MAR EN TORMENTA', desc: 'Clima storm y una rompiente encima, sin esperar a EL PIBE',
    setup: a => {
      a.patria({ obstacles: 0 });
      a.luego(1.2, g => { g.sonda('seaclima', 'storm'); g.sonda('seaclear'); g.sonda('seaput', 7); });
      a.luego(2.2, g => g.sonda('ola', 'rompiente'));
    },
  },
  {
    id: 'costa', titulo: 'LA COSTA Y SU ROMPIENTE', desc: 'La turba con relieve y el agua subiendo a la orilla',
    setup: a => { a.patria({ terrain: 'coast', coast: 120 }); a.luego(2, g => g.sonda('olacosta')); },
  },

  { head: 'prSecCallejon' },
  {
    id: 'callejon', titulo: 'EL CALLEJON DE LAS BOMBAS', desc: 'La mision m5 en la boca del callejon, con las laderas encima',
    // se entra a la mision y se salta a la BOCA (el zigzag de m5 arranca en 0.33): sin el salto
    // habria que volar el transito mudo del Narwal entero para ver una ladera.
    setup: a => { a.mision('m5'); a.luego(1.4, g => g.sonda('wjump', 0.36)); },
  },
  {
    id: 'callejonPuntas', titulo: 'EL CALLEJON A FONDO', desc: 'Bien adentro, donde las puntas ocupan casi todo el pasillo',
    setup: a => { a.mision('m5'); a.luego(1.4, g => g.sonda('wjump', 0.72)); },
  },
  {
    id: 'callejonSalida', titulo: 'LA SALIDA A LA BAHIA', desc: 'Las laderas bajan y el mar se abre: ahi asoma el ARDENT',
    setup: a => { a.mision('m5'); a.luego(1.4, g => g.sonda('wjump', 0.9)); },
  },
  {
    id: 'callejonSuelto', titulo: 'EL CALLEJON SUELTO', desc: 'Sin mision: el carril con laderas para mirarlo tranquilo',
    setup: a => { a.patria({ obstacles: 0 }); a.luego(1.2, g => g.cfg({ zigzag: 2 })); },
  },

  // (LA HISTORIA —EL LOCKER de M07— salio del catalogo el 4/10, a pedido del autor)

  // IDEAS VIEJAS (autor, 4/10): lo que ya no esta en el juego pero sigue andando, aparte para que no
  // se mezcle con lo vigente — EL ARENA y EL PULSO (climax en cuarentena, data/cuarentena.js), el
  // MOMENTUM CARGADO y LA CHANCHA CON LA NAFTA JUSTA, y el horno viejo de three.js (el de Blender es el
  // de fabrica para todo).
  { head: 'prSecViejas' },
  {
    id: 'arena', titulo: 'EL ARENA', desc: 'Vuelo libre alrededor del buque · HMS ARDENT',
    setup: a => a.arena('m4'),
  },
  {
    id: 'arenaBurbuja', titulo: 'ARENA · DEFENSA CERCANA', desc: 'Adentro de la burbuja, con todo el fuego encima',
    setup: a => { a.arena('m4'); a.luego(1.5, g => g.sonda('aset', 190, 70, 0, 0)); },
  },
  {
    id: 'pulso', titulo: 'EL PULSO', desc: 'El QTE de destreza y su cinematica',
    // M9 Y NO M3, y no es un capricho: EL PULSO arma su examen con las piruetas APRENDIDAS, y la
    // libreta de m3 tiene una sola —TERRAIN MASKING, que no es un compas— asi que la prueba salia
    // con un unico `Z` y las tres zonas identicas. O sea: el momento existia para mostrar el modo
    // y mostraba una pantalla donde no hay nada que jugar. En m9 la libreta trae 8 compases.
    // Medido: m1 y m3 → 0 compases · m6 → 4 · m9 → 8 · m12 → 12.
    setup: a => a.pulso('m9'),
  },
  // LA PERSECUCION (autor, 4/10: "no funciona bien y no queda claro"): sale de LA COLA y de JUEGO
  // RAPIDO (data/cuarentena.js) y queda aca, a mano para cuando se retome.
  {
    id: 'persec', titulo: 'LA PERSECUCION', desc: 'Volar de numeral, en la banda del lider',
    setup: a => a.persec(),
  },
  {
    id: 'chancha', titulo: 'LA CHANCHA CON LA NAFTA JUSTA', desc: 'El KC-130 pedido al 8% de tanque: el momento dramatico',
    setup: a => {
      a.mision('m3', { fuelOn: true });
      a.luego(2, g => { g.sonda('chanafta', 8); g.sonda('chacall'); });
    },
  },
  {
    id: 'tempo', titulo: 'EL MOMENTUM CARGADO', desc: 'La barra llena: la camara lenta lista para la tecla 4',
    setup: a => { a.patria(); a.luego(1.5, g => g.sonda('tcharge')); },
  },
  // EL HORNO: desde el 3/10/2026 los aviones se hornean en Blender (tools/blender/). El de three.js
  // quedo guardado para comparar; lo que cambia se resuelve AL CARGAR (data/horno.js), asi que cada
  // fila RECARGA el juego con su parametro.
  {
    id: 'hornoViejo', titulo: 'EL HORNO VIEJO (THREE.JS)', desc: 'Los aviones como se horneaban antes · recarga el juego',
    setup: a => a.recarga('?horno=three'),
  },
  {
    id: 'hornoNuevo', titulo: 'EL HORNO NUEVO (BLENDER)', desc: 'Vuelve a los aviones de Blender · recarga el juego',
    setup: a => a.recarga('?'),
  },

  { id: 'back', back: true },   // la salida, a la vista (mismo criterio que quickRows)
];

/** Los momentos elegibles (sin encabezados ni la fila ATRAS). Lo usa el fixture del catalogo. */
export const momentos = () => PRUEBAS.filter(r => r.id && !r.back);
