// LOS SISTEMAS DEL BUQUE — el catalogo (docs/sistemas/PLAN_DEFENSAS_BUQUE.md §3). Datos puros.
//
// El buque de LA SUELTA deja de ser UN blanco: es el casco (la bomba) mas sus SISTEMAS — cada pieza
// real de su armamento, en su lugar de la eslora, que el cañon puede DAÑAR y despues sacar FUERA. Que
// sistemas lleva cada buque y donde esta en data/armamento.js; aca solo lo que es cada TIPO.
//
// Estados: VIVO → (dano >= hp * danado) → DAÑADO → (dano >= hp) → FUERA. DAÑADO es el estado mas
// comun y el mas historico: con 20 mm a 600 km/h casi nunca se destruia un montaje, se lo dejaba sin
// director, sin operador o sin energia.
//
// Las perillas (por tipo):
//   nombre    lo que dice el corchete en el mundo (corto: a 480x270 no entra mas)
//   hp        golpes de bala de 20 mm para sacarlo FUERA (la de 30 pega CALIBRE['30'] veces mas). Los de
//             lanzadores y directores, medidos en Node (tools/balance_defensas.js, 20/10): con 14/16 el
//             piloto no llegaba a sacarlo en la recarga — se pasaba la salva esquivando y no le quedaba
//             tiempo de cruzar y sostener la rafaga. Con 9/10, una rafaga de ~1,3 s alcanza
//   danado    fraccion de `hp` a la que pasa a DAÑADO
//   soloBomba con cañon llega a DAÑADO y no pasa de ahi: FUERA solo con bomba (decision D2 del autor,
//             20/10: el 4,5" era una torre blindada)
//   eterno    no se apaga (la gente en cubierta con ametralladoras y fusiles: no es una pieza)
//   ancho/alto media caja de impacto, en unidades de mundo
//   pts       puntos al pasar a DAÑADO y a FUERA. D1 (20/10): la bomba que lo hunde vale varias veces
//             (2,5 o mas) lo que todos los sistemas juntos (BL.PTS_HUNDIDO = 3000) — tools/unit.js lo
//             controla. Escala de referencia: un AA de tierra a cañon = 350 (collision.js)
//   efecto    lo que hace en cada estado. Lo leen los sistemas de defensa (fase F2 del plan); hasta
//             entonces es la especificacion escrita en datos.
export const SISTEMAS = {
  // ---- SEA CAT: primera generacion, subsonico, guiado A MANO por un operador que tenia que VER el
  // avion. El lanzador cuadruple y el DIRECTOR (el operador con su joystick) son dos piezas: sin
  // director los misiles salen, pero nadie los guia.
  seacat_lanz: { nombre: 'SEA CAT', hp: 9, danado: 0.5, ancho: 2.6, alto: 2.2, pts: [60, 160],
    efecto: { vivo: 'salva continua', danado: 'salva de 2 y recarga', fuera: 'no tira' } },
  seacat_dir: { nombre: 'DIRECTOR', hp: 6, danado: 0.5, ancho: 1.8, alto: 1.8, pts: [50, 120],
    efecto: { vivo: 'habilita el guiado', danado: 'gana x0.6, ciego x1.4', fuera: 'misiles sin guia' } },
  // ---- SEA WOLF: segunda generacion, automatico por radar. Solo Tipo 22. Su radar de seguimiento
  // 910 se confundia con dos aviones cruzandose — la debilidad historica que el DAÑADO reproduce.
  seawolf_lanz: { nombre: 'SEA WOLF', hp: 10, danado: 0.5, ancho: 2.8, alto: 2.4, pts: [70, 180],
    efecto: { vivo: 'salva', danado: 'recarga x2', fuera: 'no tira' } },
  seawolf_910: { nombre: '910', hp: 6, danado: 0.5, ancho: 1.8, alto: 1.8, pts: [60, 140],
    efecto: { vivo: 'habilita el guiado', danado: 'pierde el blanco cada tanto', fuera: 'misiles sin guia' } },
  // ---- SEA DART: el de largo alcance. Al ras no sirve (por eso se vuela bajo); el 909 es el radar
  // que ilumina el blanco. Sacarlo deja SUBIR cerca del buque — y subir es lo que ensancha la ventana
  // de suelta (la espoleta, BL.ARMA_T): el que lo apaga le regala al de atras una suelta alta.
  seadart_909: { nombre: '909', hp: 10, danado: 0.5, ancho: 2, alto: 2, pts: [60, 150],
    efecto: { vivo: 'subir cerca del buque compra Sea Dart', danado: 'tarda mas en fijar', fuera: 'cerca del buque se puede subir' } },
  seadart_lanz: { nombre: 'SEA DART', hp: 18, danado: 0.5, ancho: 2.8, alto: 2.2, pts: [60, 150],
    efecto: { vivo: 'tira de arriba', danado: 'tira de arriba, mas lento', fuera: 'no tira' } },
  // ---- EL CAÑON DE 4,5": columnas de agua que caminan sobre tu rumbo (castiga volar DERECHO).
  canon_45: { nombre: '4.5', hp: 30, danado: 0.4, soloBomba: true, ancho: 3, alto: 2.4, pts: [80, 160],
    efecto: { vivo: 'columnas sobre tu rumbo', danado: 'cadencia x0.5', fuera: 'no tira' } },
  // ---- ANTIAEREA CERCANA: trazadoras desde el montaje.
  oerlikon: { nombre: '20 MM', hp: 6, danado: 0.5, ancho: 1.6, alto: 1.6, pts: [30, 80],
    efecto: { vivo: 'trazadoras cercanas', danado: 'dispersion x1.6', fuera: 'no tira' } },
  bofors: { nombre: '40 MM', hp: 8, danado: 0.5, ancho: 1.8, alto: 1.8, pts: [40, 100],
    efecto: { vivo: 'trazadoras, mas alcance y mas lentas', danado: 'dispersion x1.6', fuera: 'no tira' } },
  gpmg: { nombre: 'CUBIERTA', hp: 0, eterno: true, ancho: 0, alto: 0, pts: [0, 0],
    efecto: { vivo: 'granizo cercano: presion, casi no pega' } },
};

export const ESTADOS = ['vivo', 'danado', 'fuera'];

/** EL ALCANCE DEL CAÑON CONTRA EL BUQUE, en unidades de mundo (1,17 m). Las balas del pasillo mueren a
 *  240 (collision.js): contra el buque viven hasta aca. Con 240 el tramo para cañonear —del alcance a
 *  la ventana de suelta, ~135-190— duraba menos de un segundo; con 600 son ~4 s a crucero, que es lo
 *  que convierte la aproximacion en una decision (cañonear o ir derecho a la ventana). */
export const SIS_ALCANCE = 600;

/** DONDE VA LA ESCOLTA (decision D5 del autor, 20/10: se VE). A un costado del pasillo —afuera del
 *  carril de vuelo (FLY_X = 38): no se la cruza ni se la cañonea— y un poco detras del blanco, que es
 *  como iba el "combo 42/22": la Tipo 22 pegada a la Tipo 42 para cubrirla con el Sea Wolf. `lado`
 *  (±1) lo dice cada escolta en data/armamento.js. */
export const ESCOLTA = { X: 62, DZ: 90 };

/** EL CALIBRE DEL CAÑON por avion (`key` de data/planes.js). 20 mm: los dos Colt Mk 12 del A-4 (y
 *  los del Pucara). 30 mm: los dos DEFA del Dagger, el Mirage y el Super Etendard (y los pods del
 *  Pampa y el MB-339). Lo que no esta, 20. El Hercules trae su propio cañon (`canon` en planes.js),
 *  que ya pega con su `dano`. Dudas en PREGUNTAS_HISTORICAS.md (EL ARMAMENTO DE CADA BUQUE, punto 6). */
export const CALIBRE_AVION = { dagger: '30', mirage: '30', supere: '30', pampa: '30', mb339: '30' };
/** Cuanto pega una bala de cada calibre contra un sistema, en golpes de 20 mm. */
export const CALIBRE = { '20': 1, '30': 1.6 };
export const calibreDe = key => CALIBRE[CALIBRE_AVION[key] || '20'];

/** El estado que corresponde a un daño acumulado. Pura: la usa el sistema y la prueba. */
export function estadoDe(tipo, dano) {
  const S = SISTEMAS[tipo];
  if (!S || S.eterno) return 'vivo';
  if (dano >= S.hp) return 'fuera';
  if (dano >= S.hp * S.danado) return 'danado';
  return 'vivo';
}

/** Cuanto daño de CAÑON acepta todavia (con `soloBomba`, el cañon no lo pasa de DAÑADO: se topa
 *  justo debajo de `hp`). La bomba no pasa por aca. */
export function topeCanon(tipo) {
  const S = SISTEMAS[tipo];
  return S.soloBomba ? S.hp - 0.001 : S.hp;
}

/** LA ARTILLERIA DEL BUQUE en la aproximacion (PLAN_DEFENSAS_BUQUE F3). Unidades de mundo y segundos.
 *
 *  EL 4,5" (`C45`) no te apunta a vos: apunta a donde vas a ESTAR. Cada salva levanta `n` columnas de
 *  agua que caminan sobre tu rumbo (te alcanzan a los `t0`, `t0 + paso`…); las primeras `horquilla`
 *  salvas caen corridas a un costado y al otro, cada vez mas cerca —el rangeo de verdad, y el aviso—,
 *  y despues sobre la linea. Volar derecho es dejarlo terminar la cuenta; quebrar entre salva y salva
 *  la reinicia. Idea y numeros de base: la RF-04 de systems/pasada.js (en cuarentena).
 *    desde/hasta   entre que profundidades del buque tira (lejos no llega; encima ya no baja el caño)
 *    cada          segundos entre salvas (DAÑADO: x `lenta`) · doble: el Mk 6 doble tira una columna mas
 *    r             radio letal de la columna · roce: hasta donde cuenta como "te paso cerca"
 *    alto          altura de la columna (volar por encima la salva)
 *  LAS TRAZADORAS (`AA`): cada montaje vivo tira una rafaga de `n` cada `cada` s, desde su lugar del
 *  casco, con dispersion `disp` (DAÑADO: x 1.6). Son las trazadoras de tierra de collision.js (casi
 *  rectas): se esquivan moviendose. La CUBIERTA (`gpmg`) es granizo: mucha dispersion, presion. */
export const ARTILLERIA = {
  // (medido 20/10: con hasta 1300 y salvas cada 2,6 s, una aproximacion DERECHA perdia cuatro aviones
  // contra la Ardent. Con esto, ~1: castiga volar derecho sin convertir la suelta en una loteria.)
  C45: { desde: 180, hasta: 1000, cada: 3.0, lenta: 2, n: 3, t0: 0.9, paso: 0.28, horquilla: 2,
    r: 3.2, roce: 7, alto: 13, vida: 1.4, disp: 1.8 },
  AA: {
    oerlikon: { desde: 60, hasta: 520, cada: 1.5, n: 2, disp: 7 },
    bofors: { desde: 60, hasta: 650, cada: 1.9, n: 2, disp: 6 },
    gpmg: { desde: 40, hasta: 300, cada: 0.9, n: 1, disp: 16 },
  },
};
