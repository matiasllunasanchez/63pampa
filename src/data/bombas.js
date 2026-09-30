// LAS DOS BOMBAS DEL BUQUE — MK-17 y BRP-250 (pedido del autor 29/9/2026).
//
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
//   armaT    segundos de vuelo que necesita la espoleta para armarse (ver BL.ARMA_T): lo que hace
//            que la ALTURA importe. La BRP arma antes: se la puede soltar mas bajo.
//   holgura  cuanto de la HOLGURA de la mision (BL.HOLGURA) le toca: la ventana de suelta. <1 es
//            mas corta — la MK-17 se emboca de milagro —, >1 mas larga.
//   explota  de las que pegan ARMADAS, cuantas estallan en el acto (0..1)
//   tarde    de las que pegan armadas, cuantas estallan DESPUES (entre tardeT[0] y tardeT[1] s de
//            mundo). Lo que no explota ni tarde, no explota: pega, se mete en el casco y nada.
//   dano     lo que hace si estalla: { centro, extremo } — el 100 hunde. La MK-17 que estalla
//            destruye donde sea; la BRP necesita la zona de maquinas, o dos.
//   grande   la explosion en el casco se ve grande y con secundarias (la BRP: "EXPLOSION VISIBLE")
export const BOMBAS = {
  mk17: {
    nombre: 'MK-17', kg: 500, es: 'de origen inglés', en: 'British-made',
    armaT: 0.8, holgura: 0.5, explota: 0.2, tarde: 0.25, tardeT: [0.5, 1.1],
    dano: { centro: 100, extremo: 100 }, grande: false,
  },
  brp: {
    nombre: 'BRP-250', kg: 250, es: 'de origen español', en: 'Spanish-made',
    armaT: 0.5, holgura: 1.4, explota: 1, tarde: 0, tardeT: [0, 0],
    dano: { centro: 100, extremo: 55 }, grande: true,
  },
};

/** DESDE QUE MISION DE CAMPAÑA vuelan las BRP (indice: 6 = M7, el 25 de mayo — la fecha de "desde
 *  el 25 de mayo practicamente todas explotaron"). Antes, MK-17. */
export const DESDE_BRP = 6;

/** Que bomba lleva el escuadron en la mision `m`. La mision la puede decir (`bomba: 'mk17'|'brp'`);
 *  si no, en la campaña depende de la fecha (DESDE_BRP) y fuera de la campaña (pruebas, ciclo) es
 *  la BRP: la facil, igual que la defensa facil (data/defensas.js) es la de las pruebas. */
export function bombaDe(m, indice) {
  if (m && m.bomba) return m.bomba;
  if (!(indice >= 0)) return 'brp';
  return indice >= DESDE_BRP ? 'brp' : 'mk17';
}

export const bombaInfo = id => BOMBAS[id] || BOMBAS.brp;
