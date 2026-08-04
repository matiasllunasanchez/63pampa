// CONSTANTES DE VUELO DE LA FASE ARENA (PLAN_MINUTOS_SAGRADOS §6). Datos puros.
//
// El arena dejo de heredar el sobre de vuelo del PASILLO (decision §3 del plan): alla `y` es una
// altura de scroll con techo y `vy` un desplazamiento; aca el jugador comanda ANGULOS. Estos son
// los numeros de ese modelo — puntos de partida PARA MEDIR (feeltest los reporta), no verdades.
export const AR = {
  // ---- cabeceo comandado (E1): W/S piden angulo de morro, vy es la CONSECUENCIA ----
  PITCH_MAX: 0.9,      // ±51.6°: alcanza para picar sobre el buque y trepar de verdad
  PITCH_RATE: 1.4,     // rad/s → morro pleno en 0.64 s
  LEVEL_EASE: 0.8,     // al soltar, el morro vuelve solo al horizonte (a 480x270 perderlo es perderse)
  // ---- alabeo que vira (E2): Q/E y stick derecho piden ANGULO de banqueo ----
  ROLL_MAX: 1.4,       // 80°: viraje escarpado sin llegar a invertir
  ROLL_RESP: 6,        // resorte del banqueo: pleno en ~0.5 s
  AUTO_TURN: 1.25,     // viraje coordinado: banquear ES virar (rad/s a banqueo pleno ~1.23)
  // ---- derrape fino (A/D): correccion de punteria, ya NO el viraje ----
  VX_ACC: 40, VX_DRAG: 4.5, VX_MAX: 8,   // tope 8 → derrape maximo comandado ~4° (antes 13.5 fijo)
  // ---- energia (E1): la gravedad pelea contra el acelerador, no contra la altura ----
  SPD_CRUISE: 110,     // bajado de 125: "el avion va demasiado rapido para el espacio" (playtest 2/8)
  SPD_TURBO: 1.5, SPD_BRAKE: 0.6,        // el freno vale tanto como el turbo en un ring chico
  SPD_ACC: 0.9,
  G_E: 40,             // costo de trepar: 4 s a 45° sangran ~31 m/s (criterio E1: ≥30)
  SPD_MIN: 45,
  SPD_MUSH: 70,        // debajo, la autoridad de cabeceo cae y el morro se hunde solo (sin perdida dura)
  MUSH_DROP: 1.3,      // rad/s de morro abajo sin energia: en el piso de velocidad (auth 0.41) le gana al stick clavado (1.4 x 0.41 = 0.58 < 0.76)
  // ---- mundo ----
  ALT_MAX: 600,        // el 200 anterior era un parche del cabeceo topeado (plan §2.2): ya no hace falta
};
