// LA DEFENSA CERCANA DEL BUQUE — Sea Cat o Sea Wolf (pedido del autor 28/9: "usemos ambos; los Sea
// Cat en las primeras misiones, mas cantidad pero faciles de esquivar; los Sea Wolf un poco mas
// dificiles, en las ultimas").
//
// Los dos son el MISMO sistema (systems/seawolf.js: engancha, tira, recarga) con otros numeros y
// otro dibujo. Lo historico, que es lo que da la forma de cada uno:
//   SEA CAT    primera generacion, SUBSONICO, guiado A MANO por un operador con un joystick que
//              tenia que VER el avion. El misil mas comun de la flota (Type 21, Type 12), y el que
//              los pilotos argentinos esquivaban: lento, y el operador reaccionaba tarde.
//   SEA WOLF   segunda generacion, supersonico, guiado automatico por radar. Solo en las Type 22
//              (Broadsword, Brilliant). Letal, pero se confundia con varios aviones cruzandose.
//
// Las perillas (por defensa):
//   alcance   a cuanto del buque empieza la zona (profundidad)
//   fija      segundos de aviso antes del primer disparo
//   cada      segundos entre disparo y disparo (tiro continuo mientras estes adentro)
//   vel       lo que se suma a la velocidad del mundo
//   ciego     a cuanto del avion deja de corregir: donde el quiebre sirve (mas grande = mas facil)
//   lat       tope de su velocidad lateral y vertical
//   gana      cuanto corrige hacia donde estas (mas chico = mas perezoso)
//   copia     si copia tu velocidad (el automatico si; el operador a mano no la lee)
// EL SEA CAT SE ESQUIVA MOVIENDOSE: el operador lo apunta temprano y despues ya no llega a corregir
// (su tramo ciego es largo, 260), y su tope lateral (14) es la mitad de lo que el avion se corre de
// costado (30). Correrse cuando se acerca alcanza. Quieto, te pega.
export const DEFENSAS = {
  cat:  { nombre: 'SEA CAT',  alcance: 700, fija: 0.8, cada: 0.45, vel: 120, ciego: 260, lat: 14, gana: 1.2, copia: false },
  wolf: { nombre: 'SEA WOLF', alcance: 600, fija: 1.0, cada: 0.6,  vel: 230, ciego: 95,  lat: 70, gana: 3.2, copia: true },
};

/** Que defensa tiene el buque de la mision `m`. La mision la puede decir (`defensa: 'cat'|'wolf'|
 *  null`); si no, en la campaña las ultimas misiones (`indice` >= DESDE_WOLF) traen Sea Wolf y las
 *  primeras Sea Cat, y fuera de la campaña (pruebas) Sea Cat. */
export const DESDE_WOLF = 9;   // la mision 10 en adelante (el indice arranca en 0)
export function defensaDe(m, indice) {
  if (m && m.defensa !== undefined) return m.defensa;
  return indice >= DESDE_WOLF ? 'wolf' : 'cat';
}
