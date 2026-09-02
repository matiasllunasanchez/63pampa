// LOS BARKS — el canal 2 de los guiños (GUION_3 §9c).
//
// HAY DOS CANALES Y NO SE MEZCLAN NUNCA. El canal 1 es el Gitano hablando adentro de la ficcion de
// 1982: no puede citar nada que un cordobes de veintipico no pudiera haber inventado solo. El canal
// 2 es ESTE, y aca las referencias son libres — porque el que habla no es un piloto: es un arcade
// de los noventa. Un cartel del HUD no miente sobre el mundo, es el mismo permiso por el que el
// juego puede tener un contador de vidas.
//
// LA PRUEBA para cualquier referencia nueva: ¿la dice el Gitano, o la dice la maquina? Si la dice
// el Gitano y es una cita, no entra. Si la dice la maquina, entra.
//
// LAS CUATRO REGLAS, y estan codificadas y no comentadas a proposito:
//   1. TIENE QUE FUNCIONAR SIN VOZ. Es un cartel, no un locutor. Si algun dia hay voces, la voz se
//      suma; el cartel nunca depende de ella. Es la regla numero uno del juego.
//   2. UNA SOLA VEZ POR CAMPAÑA, no por mision. Un bark que se repite deja de ser un guiño.
//   3. Nunca encima de una linea de historia, nunca en un momento sagrado, nunca sobre una muerte.
//   4. EL BANCO SE MUERE CON EL TONO: completo hasta M8, se achica solo en M9-M13, y en M14 no hay
//      ni uno. El jugador no lo va a poder nombrar, pero va a sentir que el juego se quedo callado
//      — que es exactamente lo que paso.
//
// LA CURVA DE LA REGLA 4 VIVE EN LA DATA (el campo `hasta`), no en el codigo: asi se ve de un
// vistazo y no hay que leer el orquestador para saber cuando deja de sonar cada uno.

/** `cuando`: que tiene que pasar para que salte. Lo evalua el que llame, con el estado del vuelo.
 *  `hasta`: ultima mision (1..14) en la que este bark puede sonar. */
export const BARKS = [
  {
    id: 'hmg',
    texto: 'HEAVY MACHINE GUN',
    cuando: 'metralleta_sostenida',
    hasta: 8,
  },
  // El resto del banco es GUION y todavia no esta escrito (ver PENDIENTES_GUION, G-02). Cuando se
  // escriba, respetar la curva: nada con `hasta` mayor a 13, y ninguno para M14.
];

/** El bark de un id, o null. */
export function barkDe(id) { return BARKS.find(b => b.id === id) || null; }

/** Los que todavia pueden sonar en la mision `n` (1..14) y no se usaron. `usados` es un Set de ids. */
export function barksVivos(n, usados) {
  return BARKS.filter(b => b.hasta >= (n | 0) && !usados.has(b.id));
}
