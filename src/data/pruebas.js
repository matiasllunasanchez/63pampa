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
  { head: 'prSecClimax' },
  {
    id: 'pasada', titulo: 'LA PASADA', desc: 'A ras, saltar, soltar y salir · HMS SHEFFIELD',
    setup: a => a.pasada('m3'),
  },
  {
    id: 'pasadaSinCorte', titulo: 'LA PASADA SIN CORTE', desc: 'El pasillo desembocando solo en la corrida',
    setup: a => { a.mision('m3'); a.luego(1.2, g => g.sonda('wjump', 0.93)); },
  },
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
    setup: a => a.pulso('m3'),
  },
  {
    id: 'momentumViejo', titulo: 'EL MOMENTUM VIEJO', desc: 'El climax en riel 2D (recarga sin 3D)',
    setup: a => a.recarga('?no3d&qa'),
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
  {
    id: 'persec', titulo: 'LA PERSECUCION', desc: 'Volar de numeral, en la banda del lider',
    setup: a => a.persec(),
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

  { head: 'prSecPoder' },
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

  { head: 'prSecHistoria' },
  {
    id: 'locker', titulo: 'EL LOCKER (M07)', desc: 'La escena VN: tipeo, holds, retratos y placa',
    setup: a => a.escena('M07_LOCKER'),
  },

  { id: 'back', back: true },   // la salida, a la vista (mismo criterio que quickRows)
];

/** Los momentos elegibles (sin encabezados ni la fila ATRAS). Lo usa el fixture del catalogo. */
export const momentos = () => PRUEBAS.filter(r => r.id && !r.back);
