// ============================================================================================
// PENDIENTE — EN CUARENTENA DESDE EL 18/8/2026. Ver PLAN_REFACTOR §4b.
//
// Este modulo NO participa del menu ni de ningun flujo de campaña/ciclo: la perilla esta en
// data/cuarentena.js. Sigue compilando y su fixture sigue verde a proposito — es lo unico que
// avisa si se pudre mientras espera. NO se pule ni se refactoriza mas alla de lo mecanico: se
// revisa a fondo despues, y la hipotesis a explorar es entrar como modulo de una mision.
// ============================================================================================
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
  // ---- VIRAJE DE COMBATE (E3): la media vuelta que acorta el viaje ----
  // El plan midio el problema: el buque muere con ~5 s de fuego y TODO lo demas es viajar
  // (gap medio entre pasadas ~7 s). Una vuelta banqueando son 5.2 s; media, 2.6. La maniobra
  // guionada la deja en 1.2 s a cambio de energia — y ese cambio es la decision.
  UTURN_DUR: 1.2,      // media vuelta: el numero que pide el plan E3 ("~1,2 s")
  UTURN_COST: 26,      // m/s que sangra: encadenarlas te deja lento, blando y sin cabeceo
  UTURN_CD: 1.1,       // reenganche: sin esto se encadenan y el ring deja de existir
  // ---- DRIFT (SQUADRONS_UPDATE S2): el viraje desacoplado ----
  // Con FRENO sostenido y banqueo pleno la TRAYECTORIA conserva el vector viejo mientras el morro
  // gira: pasar de largo y seguir tirando. Fuera del drift la trayectoria persigue al morro tan
  // rapido que sigue valiendo "el morro ES la trayectoria" (VEL_EASE alto a proposito).
  DRIFT_EASE: 1.5,     // rad de retardo: la trayectoria queda ~0.7 s atras del morro
  VEL_EASE: 12,        // fuera del drift: converge en ~0.08 s (el modelo E1/E2 no cambia)
  DRIFT_ROLL: 0.75,    // fraccion de ROLL_MAX desde la que el freno empieza a derrapar
  // ---- SWEET SPOT DE VIRAJE (S3): el giro mas cerrado NO es a fondo ----
  // Squadrons lo tiene a ~50% de potencia y es lo que hace que el acelerador se USE. Aca la
  // campana esta centrada apenas arriba del freno (66 m/s): frenar aprieta el giro, el turbo lo
  // abre, y en crucero casi no se nota (gain ~1.03) — el modelo E2 medido sigue en pie.
  SWEET_SPD: 78, SWEET_W: 20, SWEET_GAIN: 0.35,
  // ---- ARMAS (E5): que ACERCARSE importe ----
  // El plan lo midio como el defecto mas barato de arreglar: GUN_RANGE 900 > RING_R 700, o sea
  // que el buque se bateaba desde el borde del ring. Sin gradiente de riesgo no hay pasada de
  // ataque: estar a 600 m era tan efectivo como estar a 120.
  GUN_RANGE: 380,      // el alcance util del cañon; mas alla la bala se pierde
  GUN_FALL: 300,       // hasta aca pega entero; de aca al tope el daño cae
  GUN_FALL_MIN: 0.45,  // lo que queda en el limite: llegar lejos no es gratis
  BULLET_V: 850,       // m/s: 0.45 s de vuelo a 380 m — adelanto, peso y destreza
  // MISIL POR PINTADO (Panzer Dragoon / Rez): a 480x270 apuntar fino a un blanco 3D movil es
  // pelea perdida. Pintar mueve la destreza a CUANTO TE ANIMAS A QUEDARTE adentro.
  MSL_DMG: 55,         // era 85; salva de 3 = 165 ≈ 58% del destructor
  MSL_RANGE: 900,      // el misil si llega lejos: lo caro es pintar, no disparar
  PAINT_MAX: 3, PAINT_T: 0.32,   // zonas por salva y segundos de reticulo encima de cada una
  // RECARGA POR PASADA LIMPIA: se termino la regeneracion sola cada 7 s. El misil vuelve si
  // entras, pegas y salis SIN que te roce nada — el recurso premia la jugada que el diseño quiere.
  PASS_IN: 260, PASS_OUT: 420,
  // ---- PIPS DE ENERGIA (SQUADRONS_UPDATE S1): la firma de Squadrons ----
  // Que problema resuelve: el plan midio que entre pasada y pasada el arena no te pide NADA
  // (§2.6, "toda la destreza del juego queda en la puerta"). Los pips llenan ese hueco — el
  // tiempo de reposicionamiento se vuelve tiempo de DECISION.
  //
  // Son DOS posiciones y un neutro, no las tres de Squadrons: sin escudos, el tercer pip no
  // existe. Y no hay medidor de turbo en el arena, asi que MOTOR no "recarga mas rapido" (eso es
  // de Squadrons) — compra velocidad de punta y aceleracion, y lo paga en calor de cañon.
  //
  // NOTA HONESTA: un A-4 no gestiona energia asi. Es una abstraccion arcade de la ATENCION del
  // piloto. La prioridad es el juego, no lo historico (regla del proyecto).
  PIP_ORDER: ['eq', 'mot', 'arm'],
  PIP: {
    // turbo = multiplicador de punta · heat/cool = calor del cañon · paint = tiempo de pintado
    eq: { turbo: 1.5, acc: 1, heat: 1, cool: 1, paint: 1 },
    mot: { turbo: 1.65, acc: 1.4, heat: 1.35, cool: 1, paint: 1 },
    arm: { turbo: 1.0, acc: 1, heat: 1, cool: 1.6, paint: 0.6 },
  },
  // ---- EL LATIDO (E6): stagger, burbuja y patrones ----
  //
  // STAGGER (Armored Core VI): el daño SOSTENIDO llena una barra que decae sola; al llenarse la
  // zona SE ABRE y toma el doble y medio. Le da a la pelea el ciclo castigo → apertura → rafaga
  // que hoy no tiene: el buque solo tenia HP, y bajarlos era una tarea, no un duelo.
  STAG_HP: 0.42,       // fraccion del maxHp de la zona que hay que meterle para abrirla
  // TOPE POR IMPACTO. Sin esto un solo misil (55) llenaba la barra entera de la zona grande
  // (0.42 x 130 = 54.6) y el stagger se COMPRABA en vez de ganarse: la palabra del plan es
  // "daño SOSTENIDO". Con el tope hacen falta 4 impactos como minimo, sea con lo que sea —
  // el cañon (7 por bala) ni lo nota, porque nunca llega al tope.
  STAG_CAP: 0.25,
  STAG_DECAY: 0.34,    // por segundo: si dejas de pegar se cierra sola — premia QUEDARSE
  STAG_OPEN: 2.5,      // segundos de ventana abierta
  STAG_MULT: 2.5,      // multiplicador de daño mientras esta abierta
  // BURBUJA DE DEFENSA CERCANA: adentro el buque tira MAS SEGUIDO y afina la punteria. Es lo
  // que impide orbitar picoteando — y lo que hace que "entrar, pegar y salir" sea LA jugada.
  BUBBLE_R: 250,
  BUBBLE_RATE: 0.55,   // el intervalo entre rafagas se multiplica por esto adentro (mas fuego)
  BUBBLE_AIM: 0.6,     // y el error de punteria tambien: de cerca aciertan mas

  // ---- FUEGO DEL BUQUE (rediseño 16/8, playtest del autor) ----
  //
  // TODO lo que dispara el buque VIAJA desde el buque hasta vos. Antes el flak se materializaba
  // al lado del avion con una espoleta: no habia disparo que ver, solo un anillo que aparecia y
  // mataba. Textual del playtest: "desde que dispara el barco hasta que te golpea es casi
  // instantaneo, y encima parece que no te dispara exactamente y te pega igual".
  //
  // Ahora hay DOS armas y las dos tienen tiempo de vuelo y punteria IMPERFECTA:
  //   METRALLETA  rafagas continuas y rapidas, radio chico. Es la ESTELA que se ve salir del
  //               buque y pasar al lado — el disparo se lee mientras viaja.
  //   ANTIAEREO   uno o varios pepinazos cada tanto, lentos, con espoleta de proximidad y el
  //               sonido de una explosion grande al salir. UN tiro, no una lluvia.
  //
  // El adelanto (lead) se calcula contra la velocidad REAL del avion, pero con ERROR: el avion se
  // mueve y ellos corrigen tarde. Ese error es lo que hace que la estela pase al lado en vez de
  // pegarte siempre — y es lo unico que separa "presion" de "sentencia".
  MG_V: 235, MG_HIT: 5, MG_LIFE: 2.6,
  MG_BURST: [5, 9],        // rondas por rafaga
  MG_GAP: 0.075,           // segundos entre rondas de la misma rafaga (la estela)
  MG_EVERY: [1.4, 2.6],    // entre rafagas, por AA viva
  AA_V: 170, AA_HIT: 18, AA_LIFE: 6,
  AA_SALVO: [1, 3],        // "uno o varios antiaereos"
  AA_EVERY: [4.5, 7.5],
  AA_SPREAD: 26,           // metros de dispersion entre los pepinazos de una misma salva
  // PUNTERIA: error angular del adelanto. Normalmente MALA; cada tanto se afinan unos segundos.
  // Es lo que simula que del otro lado hay gente corrigiendo el tiro, y lo que evita que la
  // amenaza sea siempre la misma — la tanda buena es la que te obliga a cambiar de rumbo.
  // 0.05-0.125 → 0.09-0.19 tras medir (16/8): con el error chico, el adelanto pegaba aun con el
  // avion quieto — 26 muertes en 104 muestras volando recto. A 300 m, 0.09 rad son 27 m de yerro
  // y 0.19 son 57: la estela pasa CERCA y se ve pasar, que es exactamente el pedido. Lo que mata
  // pasa a ser el volumen y, sobre todo, la tanda fina.
  AIM_BAD: [0.09, 0.19],   // radianes
  AIM_GOOD: [0.008, 0.03],
  AIM_GOOD_EVERY: [10, 18], AIM_GOOD_DUR: 2.8,

  // ---- MISIL GUIADO del buque (pedido del autor, 15/8) ----
  // La amenaza que se VE venir: sale de una AA, te persigue y pasa de largo si quebras. Va a la
  // velocidad del avion a proposito — no se le escapa con turbo, se lo GIRA. El avion vira a
  // ~2.6 rad/s apretado contra los 1.1 de este: la salida siempre existe y siempre es la misma.
  HM_V: 122,           // apenas mas que el crucero (110): alcanza, pero no de golpe
  HM_TURN: 1.1,        // rad/s — menos de la mitad de lo que gira el avion apretando
  HM_LIFE: 9,          // se queda sin combustible y se apaga: perseguirte tiene un limite
  HM_HIT: 12,
  HM_EVERY: [7, 11],   // uno cada tanto: es un EVENTO, no una lluvia
  HM_BAND: [150, 620], // solo si estas en esta franja: de mas cerca no da tiempo, de mas lejos no llega
  // ---- mundo ----
  ALT_MAX: 600,        // el 200 anterior era un parche del cabeceo topeado (plan §2.2): ya no hace falta
};
