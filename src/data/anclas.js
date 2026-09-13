// LAS ANCLAS QUE USA EL JUEGO = lo que midio el horno + los ajustes a mano de este archivo.
//
// El horno mide bien, pero no todo lo que se mide se ve bien — este proyecto ya lo aprendio tres
// veces con la hoja del PODER RASANTE, donde el angulo geometricamente exacto se leia como una
// picada. Asi que la medicion es la BASE y no la ultima palabra: acá se puede pisar cualquier
// valor a mano, y el ajuste sobrevive a la proxima horneada.
//
// ⚠ NO EDITAR src/data/anclas_horno.js: lo reescribe `npx electron tools/bake_planes_run.js`
//   entero, cada vez. Lo que se escribe ACA queda.
import { HORNO } from './anclas_horno.js';

// ---------------------------------------------------------------------------------------------
// AJUSTES A MANO — vacio quiere decir "el horno tiene razon en todo".
//
// COMO SE ESCRIBE UNO. La clave es 'hoja/fila/columna' y el valor son las dos puntas de ala:
//
//       [ x_izquierda, y_izquierda, x_derecha, y_derecha ]
//
// en FRACCION del frame y desde su CENTRO (x crece a la derecha, y crece HACIA ABAJO).
//
//   hoja      'base' = el pasillo de siempre · 'ras' = la del poder RASANTE
//   fila      0 trepando · 1 nivelado · 2 picando
//   columna   el alabeo, de 0 a 8:   0 = -60°   1 = -45°   2 = -30°   3 = -15°
//                                    4 = NIVELADO
//                                    5 = +15°   6 = +30°   7 = +45°   8 = +60°
//
// Ejemplo — correr la punta izquierda del A-4 nivelado, alabeo +45:
//     'base/1/7': [-0.21, 0.29, 0.249, -0.147],
//
// DE DONDE SACAR EL VALOR DE ARRANQUE: copiar el que ya trae anclas_horno.js para esa misma
// celda y mover un digito por vez. Un 0.01 son 0,84 px de la hoja base y 1,7 px de la del poder.
//
// PARA QUE SIRVE, con el caso que la abrio: las puntas salen del VERTICE del modelo, o sea que
// son la punta del ala mire la camara desde donde mire. Eso arreglo un error real —de costado,
// el pixel mas ancho del dibujo es el FUSELAJE, asi que la estela salia del morro— pero tambien
// movio las poses de ±45° y ±60° respecto de la tabla a mano que habia antes, donde la punta
// medida caia sobre el estabilizador. Las de ±45 son las que mas cambian, y son justo las que
// conviene mirar volando antes de darlas por buenas.
export const AJUSTES = {
  // 'base/1/7': [-0.21, 0.29, 0.249, -0.147],
};
// ---------------------------------------------------------------------------------------------

/** El horno con los ajustes aplicados encima. Se arma UNA vez al importar: son 54 celdas y
 *  resolverlo por cuadro seria pagar por un dato que no cambia nunca. */
function conAjustes(H) {
  const out = {};
  for (const hoja in H) {
    const A = H[hoja];
    out[hoja] = { ...A, tips: A.tips.map(f => f.slice()) };
    for (let r = 0; r < out[hoja].tips.length; r++) {
      for (let c = 0; c < out[hoja].tips[r].length; c++) {
        const v = AJUSTES[`${hoja}/${r}/${c}`];
        if (v) out[hoja].tips[r][c] = v;
      }
    }
  }
  return out;
}

export const ANCLAS = conAjustes(HORNO);
