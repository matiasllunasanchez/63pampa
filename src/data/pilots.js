// LOS FIELES DE PLATA (GUION_2 §personajes): la escuadrilla NOMBRADA de la campaña.
// El orden es el orden de relevo: el jugador arranca como Tero y, cuando un avion queda
// averiado y vuelve a la base, asume el siguiente. Son nombres propios: no se traducen.
//
// NORMA DE CAMPAÑA (decision 3/8/2026, ver GUION_2): en campaña NADIE muere por gameplay —
// el avion alcanzado queda AVERIADO y rompe formacion rumbo a la base; los Fieles mueren
// unicamente cuando el guion lo dice. Por eso esta lista puede tener nombres con historia:
// el juego nunca los va a matar por un flak.
export const FIELES = ['TERO', 'PUMA', 'GITANO', 'VASCO', 'PICHON'];

// EL NOMBRE PINTADO DE CADA AVION (docs/historia/AVIONES_ESCUADRON.md, "Los nombres pintados",
// decision del autor 27/9/2026). Va bajo la cabina y no cambia en toda la guerra. El del Vasco es
// una X que se pinto el mismo: es un beso para su madre, y no lo dice nadie — tampoco este codigo
// en pantalla. No se traducen: son nombres propios, como los de arriba.
// Es un nombre de CHAPA, no el "nombre del dia" del Gitano (ese es de palabra y nunca se escribe).
export const AVION = { TERO: 'ESPOLA', PUMA: 'MONTE', GITANO: 'GAMBETA', VASCO: 'X', PICHON: 'OHM' };
