// EL ALBUM DE MALVINAS (22/11/2026, el autor: "un album o pokedex de cosas de Malvinas, accesible desde el menu
// principal; si el usuario eligio las chafitas ya se agregan como vistas, y al entrar ve el detalle: como se usaban,
// como se armaron, en un panel DEDICADO. Le da un motivo para elegir todas las cartas y aprender. No solo cartas:
// cuando se enseña o se gana algo con la temperatura, el salitre, el vuelo rasante…").
//
// Dos clases de figuritas:
//   carta  las del banco (data/banco_suelto.js CARTAS). Se destapan al ELEGIRLAS. Su texto largo es el de
//          data/cartas_lee.js (que / dato / historia).
//   tema   lo que el juego te hace vivir: el frio, la sal, el rasante, la Chancha. Se destapan la primera vez que pasa
//          (game.js `albumDescubrir`). Su texto va aca, con la misma forma.
//
// ⚠ LA REGLA DE cartas_lee.js VALE IGUAL: lo que no esta verificado no entra. Lo de los temas sale de
// docs/historia/CLIMA_FRIO_AVIONES.md (el teatro, A-4B, C-130), AVIONES_CATALOGO.md (A-4B, Dagger) y
// AVIONES_ESCUADRON.md, que citan sus fuentes. Sin tildes, como el resto de los textos de datos.

export const TEMAS = [
  { id: 'rasante', arte: 'rasante', name: 'EL VUELO RASANTE', icono: 'rasante', grupo: 'poderes',
    desc: 'Pegado al agua, donde el radar no ve',
    que: 'Volar a pocos metros del mar te esconde del radar del buque: la curvatura y las olas te tapan. Cuanto mas bajo, mas tarde te ven, y mas cerca estas de tocar el agua.',
    dato: 'A 12-15 M SOBRE EL MAR',
    historia: 'Los Skyhawk llegaban pegados al agua hasta el blanco, soltaban a quemarropa y volvian con sal en las alas. El 9 de mayo dos A-4C se estrellaron contra las islas Sebaldes volando al ras del mar con mal tiempo. El TC-68 entro a Puerto Argentino el 6 de mayo a 12-15 m sobre el mar para esquivar los radares.' },
  { id: 'salitre', arte: 'aerosol', name: 'LA SAL EN EL VIDRIO', icono: 'ola', grupo: 'taller',
    desc: 'El rasante se paga con la vista',
    que: 'Volando al ras sobre el mar, el rocio se seca contra el parabrisas y deja una costra que tapa la vista de los bordes al centro. Subir no la saca: la lava el agua de una nube o la lluvia.',
    dato: 'UNA COSTRA BLANCA EN LA CABINA',
    historia: 'Los A-4 volvian de los rasantes con una costra de sal en la cabina que hacia dificil aterrizar. No era solo del Skyhawk: el Fokker F-28 de la Armada, que volaba a 15 m de las olas hacia Puerto Argentino, llegaba igual. Es un efecto del vuelo rasante sobre mar grueso.' },
  { id: 'frio', arte: 'a4', name: 'EL FRIO DEL ATLANTICO SUR', icono: 'alt', grupo: 'alcance',
    desc: 'Hielo en las alas, mar helado abajo',
    que: 'Adentro de las nubes, con el aire frio, se junta hielo en las alas: el avion pesa mas y responde peor. Se derrite bajando al aire mas tibio, pegado al mar.',
    dato: 'MAR A 1-2 °C, OLAS DE 4-5 M',
    historia: 'En mayo y junio el mar estaba a 1-2 °C, con olas de 4-5 m y viento de mas de 50 km/h: amarizar era morir. El A-4B tenia antihielo solo en el Pitot, el parabrisas y partes del motor; nada en alas ni cola. El mal tiempo freno misiones enteras: el 2 de mayo casi nada salio del continente.' },
  { id: 'chancha', arte: 'hercules', name: 'LA CHANCHA', icono: 'chancha', grupo: 'alcance',
    desc: 'El Hercules que te espera a mitad de camino',
    que: 'El KC-130H cisterna te espera en el camino: te acomodas detras, metes la sonda en la canasta y cargas nafta en vuelo. Sin ella, el alcance no da para ir y volver.',
    dato: 'EL DAGGER NO TENIA SONDA',
    historia: 'Los A-4B se reabastecian en vuelo del KC-130H. El Dagger no tenia sonda de reabastecimiento: salia del continente, tenia unos minutos sobre el objetivo y se volvia, sin nadie que lo esperara a mitad de camino.' },
  { id: 'espoletas', arte: 'espoleta', name: 'LAS BOMBAS QUE NO EXPLOTABAN', icono: 'bomba', grupo: 'armas',
    desc: 'Bien al ras, la bomba no llega a armarse',
    que: 'La espoleta necesita tiempo de caida para armarse. Si la soltas muy bajo, la bomba pega en el buque y no explota: rebota, lo atraviesa o queda adentro, dormida.',
    dato: 'TRECE BOMBAS SIN ESTALLAR',
    historia: 'Trece bombas dieron en buques britanicos sin estallar. Para armarse hacia falta soltar a 50 m o mas, y los pilotos tiraban a 10-30 m porque a 50 m te derribaban. Desde el 24 de abril se modificaron espoletas a mano, y para fines de mayo practicamente todas las bombas de la FAA explotaban.' },
  { id: 'radar', arte: 'radar', name: 'EL RADAR DEL BUQUE', icono: 'senal_alerta', grupo: 'inteligencia',
    desc: 'Si te ve, te tira',
    que: 'Arriba de cierta altura el radar del buque te encuentra, se llena la barra y empiezan a tirarte. Bajando, el mar y la curvatura te tapan y la alarma se vacia.',
    dato: 'SIN ALERTA RADAR A BORDO',
    historia: 'Volar a ras del agua no te hacia invisible: te bajaba el alcance del radar, con detecciones tipicas de 20-30 km en mar abierto. Los A-4B no tenian alerta radar: cuando le preguntaron a un piloto que sentian al activarse, contesto que nada, porque no lo tenian.' },
  { id: 'seadart', buque: 't42', name: 'EL SEA DART', icono: 'misil', grupo: 'defensa',
    desc: 'El misil largo de los destructores Tipo 42',
    que: 'El misil de radar de los destructores: te busca de lejos. Las chafitas lo engañan, y un quiebre fuerte despues del lanzamiento lo puede hacer pasar de largo.',
    dato: 'ESPERAR 2 SEGUNDOS Y QUEBRAR',
    historia: 'Lo llevaban los destructores Tipo 42. La mañana del 25 de mayo, el HMS Coventry derribo asi dos A-4C antes de ser hundido. Contra el, los Canberra largaban chaff y bengalas improvisados, y la tactica era esperar unos dos segundos tras el lanzamiento y quebrar el rumbo.' },
  { id: 'eyeccion', arte: 'paracaidas', name: 'LA EYECCION', icono: 'avion', grupo: 'defensa',
    desc: 'La ultima salida',
    que: 'Con el avion perdido y cayendo, todavia te podes eyectar. Sobre el mar no hay mucho tiempo: hay que salir antes de que sea tarde, y despues esperar que te vengan a buscar.',
    dato: 'MAR A 1-2 °C',
    historia: 'Amarizar en el Atlantico Sur, con el mar a 1-2 °C, era morir. Los cartuchos del asiento eyectable de los A-4Q estaban vencidos desde diciembre de 1981 y el embargo impidio reponerlos: los pilotos sorteaban avion sin saber en que estado estaba su asiento.' },
  // LOS MISILES Y LAS ARMAS (22/11, el autor: "Sea Dart, Sea Cat, Sea Wolf, Sidewinder, etc."; "nuestras armas, el
  // radar del Super Etendard, el Exocet"). `sprite`: un enemigo horneado (assets/world/enemies), cuadro `fr` de `n`.
  { id: 'seacat', buque: 't21', name: 'EL SEA CAT', grupo: 'defensa',
    desc: 'El misil chico de las fragatas',
    que: 'Lo llevan las fragatas Tipo 21 y Tipo 12. Lo guia un operador a ojo, mientras te ve: es lento, y un quiebre a tiempo lo deja atras.',
    dato: 'GUIADO A MANO',
    historia: 'En las bahias los aviones aparecian de golpe a 2-5 km, con segundos de aviso. Ahi el fuego era de todo lo que apuntaba a ojo, Sea Cat guiado a mano incluido, y buena parte disparaba mientras pasabas y despues, en la salida.' },
  { id: 'seawolf', buque: 't21', name: 'EL SEA WOLF', grupo: 'defensa',
    desc: 'La defensa cercana de los Tipo 22',
    que: 'El misil corto de las fragatas Tipo 22, bueno contra los que vienen bajo. Su punto debil: dos aviones que se cruzan lo confunden.',
    dato: 'DE OCHO A-4B VOLVIERON CUATRO',
    historia: 'El 12 de mayo, los Sea Wolf de la Brilliant bajaron a tres A-4B de la escuadrilla CUÑA. El 25 de mayo, el de la Broadsword no pudo resolver a dos A-4 que se cruzaban y no disparo: ese ataque termino con el Coventry hundido.' },
  { id: 'sidewinder', sprite: { src: 'harrier', n: 5, fr: 2 }, name: 'EL SIDEWINDER', grupo: 'defensa',
    desc: 'El misil de los Sea Harrier',
    que: 'El misil de calor de los Sea Harrier. El AIM-9L te puede tirar de frente: quemar el turbo o quebrar encima lo hace seguir de largo.',
    dato: 'TODO-ASPECTO: SE DISPARA DE FRENTE',
    historia: 'El AIM-9L britanico era todo-aspecto y logro alrededor del 80 % de derribos. El AIM-9B que podia llevar el A-4Q argentino solo enganchaba el caño de escape, y no consta un solo disparo argentino en la guerra. Esa sola diferencia explica buena parte de lo que paso en el aire.' },
  { id: 'antiaereo', sprite: { src: 'manpad', n: 2, fr: 0 }, name: 'RAPIER Y BLOWPIPE', grupo: 'defensa',
    desc: 'Desde la costa, a la salida',
    que: 'Los misiles portatiles desde tierra: aparecen en la costa y te tiran cuando pasas. El peligro grande esta en la salida, no en la entrada.',
    dato: 'A 2-5 KM: SEGUNDOS DE AVISO',
    historia: 'En San Carlos y las bahias, las lomas tapaban el radar y los aviones aparecian de golpe. Bofors, Oerlikon, ametralladoras, Rapier y Blowpipe desde tierra tiraban a ojo, y buena parte del fuego llegaba cuando ya estabas pasando.' },
  { id: 'misil_exocet', arte: 'exocet', name: 'EL EXOCET', grupo: 'armas',
    desc: 'Se suelta de lejos y llega solo',
    que: 'El misil antibuque: le cargas las coordenadas, lo soltas a 20 o 30 millas y vuela solo, rozando el agua. Mal cargado, se va para otro lado.',
    dato: 'HABIA CINCO, Y NO IBAN A LLEGAR MAS',
    historia: 'El Super Etendard de la Armada era el unico avion argentino que podia lanzarlo. Argentina tenia cinco y no iban a llegar mas. El 4 de mayo, uno alcanzo al HMS Sheffield: murieron 20 tripulantes y se hundio seis dias despues, mientras lo remolcaban.' },
  { id: 'radar_sue', plane: 'supere', name: 'EL RADAR DEL SUPER ETENDARD', grupo: 'inteligencia',
    desc: 'Subir, prenderlo un instante, y abajo',
    que: 'Tu propio radar: te muestra el blanco, pero prenderlo es asomarte. Se sube, se prende unos segundos para apuntar, y se vuelve al ras.',
    dato: 'UNA SOLA VEZ',
    historia: 'El Super Etendard volaba al ras, sin radar, hasta la posicion que habia pasado el Neptune. Para apuntar subia, encendia el radar unos segundos, disparaba de lejos y se iba: nunca veia el barco.' },
];

export const temaDe = id => TEMAS.find(t => t.id === id) || null;

import { CARTAS } from './banco_suelto.js';
import { PLANES } from './planes.js';
import { LIBRO_VUELO, LIBRO_SCENES, PENDIENTE } from './libro_vuelo.js';
import { ARMAMENTO } from './armamento.js';
import { SHIP_CLASS } from './ships.js';

// LOS AVIONES, LOS BUQUES Y LAS MISIONES (22/11, el autor: "las misiones o los buques pueden ser tambien, buques,
// aviones"; "cuando completa una mision con algun avion, o juega una cantidad de minutos aceptable, desbloquea la
// carta de info"). El texto NO se escribe aca: sale de lo que el juego ya tiene aprobado —la ficha y la linea de la
// guerra de cada avion (data/planes.js), las tarjetas CONTEXTO y LO QUE PASO del libro de vuelo— asi no hay dos
// versiones de la misma historia. Una salida del libro con texto PENDIENTE no entra.
const es = v => (v && typeof v === 'object' ? v.es : v) || '';
const ARMA = { faa: 'FUERZA AEREA', armada: 'ARMADA', ejercito: 'EJERCITO', pna: 'PREFECTURA', civil: 'CIVIL' };
const lineas = id => ((LIBRO_SCENES[id] && LIBRO_SCENES[id].lineas) || []).map(l => l.es).filter(t => t && t !== PENDIENTE);
const DEF = { canon_45: 'cañon de 4,5"', seadart_lanz: 'Sea Dart', seacat_lanz: 'Sea Cat', seawolf_lanz: 'Sea Wolf', oerlikon: '20 mm' };
const defensas = n => [...new Set(((ARMAMENTO[n] || {}).sistemas || []).map(x => DEF[x.tipo]).filter(Boolean))].join(', ');
const LIBRO_OK = LIBRO_VUELO.filter(m => m.desc && m.desc !== PENDIENTE && lineas(m.id.toUpperCase() + '_LO_QUE_PASO').length);

/** Cuanto hay que volar un avion para destaparlo sin completar una mision con el (segundos acumulados). */
export const ALBUM_AVION_S = 300;

export const AVIONES = PLANES.map(pl => ({
  id: 'avion:' + pl.key, tipo: 'avion', cat: 'aviones', grupo: 'alcance', plane: pl.key,
  name: es(pl.nombre) || pl.name, desc: es(pl.desc),
  que: es(pl.guerra) || es(pl.desc), dato: ARMA[pl.arma] || '', historia: es(pl.ficha),
}));
export const BUQUES = LIBRO_OK.filter(m => m.goal && m.goal.ship).map(m => {
  const n = m.goal.ship, a = ARMAMENTO[n] || {};
  return { id: 'buque:' + n, tipo: 'buque', cat: 'buques', grupo: 'defensa', name: n, buque: SHIP_CLASS[n] || 't21',
    desc: a.clase ? (a.clase === 'Invincible' ? 'Portaaviones clase Invincible' : a.clase) : '',
    que: (a.clase ? a.clase + '. ' : '') + (defensas(n) ? 'Defensas: ' + defensas(n) + '.' : ''),
    dato: m.fecha, historia: lineas(m.id.toUpperCase() + '_LO_QUE_PASO').join(' ') };
});
export const MISIONES = LIBRO_OK.map(m => ({
  id: 'mision:' + m.id, tipo: 'mision', cat: 'misiones', grupo: 'inteligencia', name: m.name, plane: m.aviones && m.aviones[0] && m.aviones[0].plane,
  desc: m.fecha, que: m.desc, dato: m.fecha,
  // (la primera linea de CONTEXTO es el dato de la salida —fecha, hora—: ya va en `dato`)
  historia: lineas(m.id.toUpperCase() + '_CONTEXTO').slice(1).join(' '),
}));

/** Las secciones del album, en orden (cada una es una pestaña). */
export const ALBUM_CATS = ['temas', 'cartas', 'aviones', 'buques', 'misiones'];
/** Todas las figuritas, en orden de seccion. */
export const ALBUM = [
  ...TEMAS.map(t => ({ ...t, tipo: 'tema', cat: 'temas' })),
  ...CARTAS.map(c => ({ ...c, tipo: 'carta', cat: 'cartas' })),
  ...AVIONES, ...BUQUES, ...MISIONES,
];
export const ALBUM_KEY = 'rasante_album';
