// PISTAS DE DESPEGUE. La salida del puerto no es siempre la misma base: cada estilo cambia el
// suelo, la superficie y las marcas. Datos puros — los dibuja portRow() en render/world.js y se
// eligen desde el menu de mapa [M].
//
// Campos:
//   name   rotulo en el menu [M]
//   ground 'turf'    turba malvinense a los costados (el original)
//          'land'    el mismo terreno de TIERRA: despegas de un campo, no de una base
//          'asphalt' asfalto de lado a lado, sin banquina
//   hw     medio ancho de la pista, en unidades de MUNDO (null = no hay franja, es todo suelo)
//   surf   color del asfalto/tierra de la pista
//   center linea de eje discontinua
//   edge   balizas amarillas del borde de pista
//   skid   marcas de frenada (dos pares de manchas oscuras, en la zona de toma de contacto)
export const RUNWAYS = [
  { id: 'bam', name: 'BAM MALVINAS', ground: 'turf', hw: 7, surf: '#41474b', center: true, edge: true, skid: false },
  { id: 'worn', name: 'GASTADA', ground: 'turf', hw: 7, surf: '#41474b', center: false, edge: false, skid: true },
  { id: 'dirt', name: 'TIERRA', ground: 'turf', hw: 7, surf: '#6e5c43', center: false, edge: false, skid: true },
  { id: 'field', name: 'PASTO', ground: 'land', hw: null, surf: null, center: false, edge: false, skid: false },
  { id: 'apron', name: 'ASFALTO', ground: 'asphalt', hw: null, surf: '#3d4348', center: false, edge: false, skid: false },
];

// ACANTILADO: la base esta sobre una meseta, a esta altura de MUNDO sobre el nivel del mar. El
// avion ya arranca ahi arriba, asi que no despega subiendo — sale al vacio y baja.
// La comparten el render (la meseta y su pared), el vuelo (el suelo sobre la pista) y el despegue.
export const PORT_H = 15;

// ARRANQUE EN VUELO: altura a la que empieza el avion en las misiones que no despegan de ninguna
// base (las de REGRESO). Es altura de crucero baja: ya estas en el aire y ya estas rasante.
export const AIR_START_Y = 10;
