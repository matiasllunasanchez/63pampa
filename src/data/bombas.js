// LAS DOS BOMBAS DEL BUQUE — MK-17 y BRP-250 (pedido del autor 29/9/2026).
//
// (30/9: la MK-17 detona segun lo que cayo —ver `pDet`— y aun perfecta, solo la mitad: "la idea es
// transmitir la frustracion")
// "En las primeras misiones usamos la MK-17: dificiles de embocar, generalmente no explotan, y las
// que embocaban no detonaban o detonaban luego. Las BRP con espoletas modificadas esas si explotan
// bien y generan EXPLOSION VISIBLE en el barco." Es el arco de la guerra hecho perilla: hasta fines
// de mayo pegarle al buque no alcanzaba; despues, las bombas empezaron a explotar.
//
// LO HISTORICO (dudas en docs/historia/PREGUNTAS_HISTORICAS.md, "LAS DOS BOMBAS"):
//   MK-17    500 kg (1000 lb), de origen INGLES. Grande, pesada, con la espoleta pensada para
//            soltarse de alto: tirada al ras no llegaba a armarse, y las que se armaban muchas
//            veces no detonaban, o detonaban despues (el Antelope, M6).
//   BRP-250  250 kg, de origen ESPAÑOL. Mas chica; a las argentinas les rehicieron las espoletas
//            en dos semanas (docs/historia/MEJORAS_PICHON.md §3). "Desde el 25 de mayo en adelante,
//            practicamente todas las bombas de la Fuerza Aerea explotaron."
//
// Las perillas (por bomba):
//   armaT    segundos de caida por debajo de los cuales la espoleta NO arma nunca (ver BL.ARMA_T):
//            pega y no pasa nada ('dormida'). Lo que hace que la ALTURA importe.
//   holgura  cuanto de la HOLGURA de la mision (BL.HOLGURA) le toca: la ventana de suelta. <1 es
//            mas corta — la MK-17 se emboca de milagro —, >1 mas larga.
//   pDet     LA CHANCE DE DETONAR de las que pegan armadas, segun CUANTO CAYERON (30/9, el autor, con
//            el dato historico: "los aviones debian lanzarlas desde una altura minima de entre 150 y
//            200 metros, o contar con un tiempo de caida libre superior a 0,5 o 1 segundo"). La altura
//            del juego esta comprimida —el techo del radar anda por los 23 m—, asi que manda el TIEMPO
//            DE CAIDA: [t0, p0, t1, p1] = a t0 s detona con p0, sube derecho hasta p1 a los t1 s, y de
//            ahi no pasa. LA MK-17 FRUSTRA A PROPOSITO (30/9, el autor: "que sea dificil lograr que
//            DETONE… la idea es transmitir la frustracion: aunque hagas todo bien, la bomba no
//            detonaba"): 10% recien armada y 50% en el MEJOR caso — el "de 4 lanzadas, 2" es el techo,
//            no el promedio. Soltada al tun tun, una de cada cinco. MEDIDO con el integrador (caida maxima,
//            pegando abajo del casco): 0,62 s soltando a 4, 0,98 a 8, 1,12 a 10, 1,33 a 14, 1,52 a 18
//            — el segundo se pasa soltando arriba de ~9 m y temprano, para que pegue bajo.
//            ES UN DADO DE VERDAD —las rachas son la frustracion—, con un solo tope: `racha` fallidas
//            seguidas y la siguiente armada detona. Lo justo para que no sea "completamente inservible".
//   racha    cuantas armadas seguidas pueden no detonar antes de que una detone si o si
//   tarde    de las que detonan, cuantas lo hacen DESPUES (entre tardeT[0] y tardeT[1] s de mundo)
//   dano     lo que hace si estalla: { centro, extremo } — el 100 hunde. La MK-17 que estalla
//            destruye donde sea; la BRP necesita la zona de maquinas, o dos.
//   grande   la explosion en el casco se ve grande y con secundarias (la BRP: "EXPLOSION VISIBLE")
//   radio    cuanto rompe al reventar en el pasillo: todo lo destructible a esta distancia vuela
//   onda     el radio de la explosion para el AVION que la atraviesa (ESTALLIDO en data/tuning.js)
//   boquete  la media franja del buque que la explosion convierte en humo y fuego: por ahi se pasa
//            en el cruce sin llevarse los palos (el resto de la silueta sigue matando)
export const BOMBAS = {
  mk17: {
    nombre: 'MK-17', kg: 500, es: 'de origen inglés', en: 'British-made',
    armaT: 0.5, holgura: 0.5, pDet: [0.5, 0.1, 1.0, 0.5], racha: 3, tarde: 0.5, tardeT: [0.5, 1.1],
    dano: { centro: 100, extremo: 100 }, grande: false, radio: 14, onda: 9, boquete: 10,
  },
  brp: {
    nombre: 'BRP-250', kg: 250, es: 'de origen español', en: 'Spanish-made',
    armaT: 0.5, holgura: 1.4, pDet: [0.5, 1, 1, 1], racha: 0, tarde: 0, tardeT: [0, 0],
    dano: { centro: 100, extremo: 55 }, grande: true, radio: 10, onda: 8, boquete: 8,
  },
};

/** DESDE QUE MISION DE CAMPAÑA vuelan las BRP (indice: 6 = M7, el 25 de mayo — la fecha de "desde
 *  el 25 de mayo practicamente todas explotaron"). Antes, MK-17. */
export const DESDE_BRP = 6;

/** La chance de que la bomba `id` detone habiendo caido `t` segundos (ver `pDet`). */
export function chanceDetona(id, t) {
  const [t0, p0, t1, p1] = bombaInfo(id).pDet;
  if (t <= t0) return p0;
  if (t >= t1) return p1;
  return p0 + (p1 - p0) * (t - t0) / (t1 - t0);
}

/** Que bomba lleva el escuadron en la mision `m`. La mision la puede decir (`bomba: 'mk17'|'brp'`);
 *  si no, en la campaña depende de la fecha (DESDE_BRP) y fuera de la campaña (pruebas, ciclo) es
 *  la BRP: la facil, igual que la defensa facil (data/defensas.js) es la de las pruebas. */
export function bombaDe(m, indice) {
  if (m && m.bomba) return m.bomba;
  if (!(indice >= 0)) return 'brp';
  return indice >= DESDE_BRP ? 'brp' : 'mk17';
}

export const bombaInfo = id => BOMBAS[id] || BOMBAS.brp;
