// EL DESGASTE DEL AVION — cuantos golpes lleva encima la celula del jugador EN ESTA CAMPAÑA.
//
// POR QUE EXISTE. Es la ley 4 de la simbiosis piloto-avion (GUION_3 §9d): el avion junta parches,
// remaches nuevos y pintura que no coincide, mision tras mision, Y NADIE LO MENCIONA. No hay linea
// de dialogo, no hay cartel y no hay contador en el HUD. Al final el jugador vuela un animal
// remendado que reconoce de memoria, y eso hace todo el trabajo sin una sola linea de guion.
//
// LO QUE ESTE MODULO NO HACE: dibujar. No sabe que existe render/, y render/plane.js lo unico que
// le pregunta es `nivel()`. Un modulo que acumula no puede ser tambien el que pinta.
//
// LA DIFERENCIA CON `run.integ`: aquello es la integridad DE ESTA CORRIDA y se cura al despegar de
// nuevo. Esto es la cicatriz, y sobrevive a la mision — por eso tiene que entrar al payload de
// systems/saves.js (si no se guarda, el avion se cura solo al cargar una partida).
//
// Misma regla que los otros stores: se MUTA, nunca se reasigna (tools/lint_state.js).

// A partir de cuantos impactos acumulados el avion se ve entero remendado. No es una cifra
// realista: es cuantos golpes tiene que llevar el jugador para que el cambio se lea.
export const DESG_TOPE = 40;

export const desgaste = {
  impactos: 0,     // golpes acumulados en la campaña
  misiones: 0,     // misiones voladas con esta celula (mueve el desgaste aunque no te peguen)
};

/** Suma lo que paso en un cuadro. Devuelve nada: el que decide que se hace con esto es el render. */
export function tickDesgaste(n) { desgaste.impactos += (n | 0); }

/** Una mision mas encima. La llama el orquestador al cerrar la mision, no el bucle de vuelo. */
export function misionCumplida() { desgaste.misiones += 1; }

/** 0..1 — lo unico que lee render/plane.js. A 0 no se dibuja ningun parche; a 1, el avion esta
 *  remendado entero. Las misiones pesan poco y sola no llega al tope: el desgaste es de los
 *  golpes, y el tiempo solo lo empuja. */
export function nivel() {
  const v = (desgaste.impactos + desgaste.misiones * 0.8) / DESG_TOPE;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Campaña nueva: celula nueva. Se MUTA. */
export function resetDesgaste() { desgaste.impactos = 0; desgaste.misiones = 0; }
