// CATALOGO DE MODELOS — LAS PIEZAS DEL DESPIECE (PLAN_HORNEADO B0).
// Ala, deriva, estabilizador, morro, cola, fuselaje, cabina, tanque, tren y panel: lo que sale
// volando cuando algo se rompe. Ensamblajes procedurales de primitivas de three.js.
//
// GRIS NEUTRO con tres valores: el color final lo pone la receta de data/despiece.js; lo que la
// hoja aporta es el VOLUMEN — que la pieza tenga cara iluminada y cara en sombra es lo que la
// separa de un rectangulo.
//
// EL ORDEN DE `PIEZAS` ES EL DE LAS FILAS DE LA HOJA, y src/render/partes.js lo repite: si se
// agrega una pieza va AL FINAL, nunca en el medio, o el escombro pasa a ser otro.
//
// FORMA DEL CATALOGO: ver tools/models/planes.js.
'use strict';
BAKE.modelos('partes', (THREE, K) => {
  const { MAT, add, B, CYL, CONE, DOME, PLATE } = K;
  const CLARO = BAKE.PAL.claro, MEDIO = BAKE.PAL.medio, OSCURO = BAKE.PAL.oscuro, NEGRO = BAKE.PAL.negro;
  const VIDRIO = BAKE.PAL.vidrio;

  /** BORDE DESGARRADO: dientes irregulares sobre el corte. Es lo que separa "pieza arrancada"
   *  de "pieza desmontada" — sin esto el ala se lee como un ala de maqueta, prolija. Los
   *  dientes son DETERMINISTAS (indice, no azar): la hoja tiene que salir igual cada horneada. */
  function desgarro(g, largo, alto, c, x, y, z, eje) {
    for (let i = 0; i < 7; i++) {
      const t = (i / 6 - 0.5) * largo;
      const d = 0.08 + ((i * 7) % 5) * 0.05;             // profundidad del diente
      const h = alto * (0.5 + ((i * 3) % 4) * 0.16);
      if (eje === 'z') B(g, d * 2, h, 0.1, c, x + d, y, z + t);
      else B(g, 0.1, h, d * 2, c, x + t, y, z + d);
    }
  }

  // ================== LAS PIEZAS ==================
  // Cada una se modela para ocupar ~3.2 unidades en su lado mayor. El ORDEN de esta tabla es el
  // de las filas de la hoja, y `data/despiece.js` lo repite: si se agrega una pieza va AL FINAL,
  // o se corren todas las filas y el escombro pasa a ser otro.
  const PIEZAS = {
    // ALA arrancada de raiz: la mas reconocible de todas y la mas grande. Delta recortado con
    // flecha, borde de ataque limpio y la RAIZ desgarrada — por ahi se partio.
    ala(g) {
      PLATE(g, [[0, 1.15], [1.75, 0.25], [1.75, -0.35], [0, -0.95]], 0.11, MEDIO, -0.5, 0, 0);
      PLATE(g, [[0, 1.05], [1.6, 0.22], [1.6, -0.3], [0, -0.85]], 0.05, CLARO, -0.5, 0.08, 0);
      B(g, 0.16, 0.2, 1.5, OSCURO, -0.5, 0, 0.1);        // larguero asomando en la raiz
      desgarro(g, 1.9, 0.26, OSCURO, -0.56, 0, 0.1, 'z');
    },
    // DERIVA: la aleta vertical. Silueta inconfundible aunque mida cuatro pixeles.
    deriva(g) {
      const p = PLATE(g, [[0, 0.85], [1.5, 0.5], [1.5, -0.05], [0, -0.7]], 0.1, MEDIO, 0, -0.7, 0);
      p.rotation.z = Math.PI / 2;
      B(g, 0.14, 0.5, 1.2, OSCURO, 0, -0.72, 0.1);       // el muñon que quedo del fuselaje
      desgarro(g, 1.3, 0.3, OSCURO, 0, -0.85, 0.1, 'x');
    },
    // ESTABILIZADOR: el ala chica de cola. Misma familia que `ala`, media escala.
    estab(g) {
      PLATE(g, [[0, 0.7], [1.15, 0.2], [1.15, -0.2], [0, -0.55]], 0.09, MEDIO, -0.35, 0, 0);
      B(g, 0.13, 0.16, 0.9, OSCURO, -0.38, 0, 0.05);
      desgarro(g, 1.15, 0.2, OSCURO, -0.43, 0, 0.05, 'z');
    },
    // MORRO: el cono de la nariz con el pitot. Cae de punta y se lee al instante.
    morro(g) {
      CONE(g, 0.52, 1.9, MEDIO, 0, 0, -0.35, false, 12);
      CYL(g, 0.5, 0.52, 0.9, MEDIO, 0, 0, 0.95, 12);
      CYL(g, 0.08, 0.06, 0.34, OSCURO, 0, -0.02, -1.42, 8);  // pitot CORTO: con 0.7 la pieza entera se leia como una aguja
      CYL(g, 0.44, 0.44, 0.12, NEGRO, 0, 0, 1.42, 12);      // el corte, hueco
      desgarro(g, 1.0, 0.34, OSCURO, 0, 0, 1.4, 'x');
    },
    // COLA con TOBERA: el otro extremo. La boca oscura es la firma.
    cola(g) {
      CYL(g, 0.42, 0.52, 1.5, MEDIO, 0, 0, 0.05, 12);       // el tubo AFINA hacia el corte
      CYL(g, 0.72, 0.58, 0.5, OSCURO, 0, 0, 1.05, 14);      // anillo de escape ACAMPANADO
      CYL(g, 0.58, 0.58, 0.3, NEGRO, 0, 0, 1.2, 14);        // boca hundida y ancha
      CONE(g, 0.4, 0.5, '#191c15', 0, 0, 1.34, true, 10);
      desgarro(g, 1.0, 0.36, OSCURO, 0, 0, -0.66, 'x');
    },
    // TRAMO DE FUSELAJE: un anillo del tubo, roto en los dos extremos. El pedazo grande que
    // queda cuando algo se parte al medio.
    fuselaje(g) {
      CYL(g, 0.6, 0.6, 2.0, MEDIO, 0, 0, 0, 12);
      CYL(g, 0.48, 0.48, 2.06, NEGRO, 0, 0, 0, 12);          // hueco: se ve que es una cascara
      CYL(g, 0.64, 0.64, 0.12, OSCURO, 0, 0, -1.0, 12);
      CYL(g, 0.64, 0.64, 0.12, OSCURO, 0, 0, 1.0, 12);
      B(g, 0.16, 0.55, 2.0, OSCURO, 0, 0.45, 0);            // lomo, a lo largo: es un TRAMO, no una lata
      desgarro(g, 1.1, 0.4, OSCURO, 0, 0, 1.05, 'x');
    },
    // CABINA: la burbuja de vidrio con su marco. Es la unica pieza que NO es del color del
    // fuselaje — el vidrio se pinta aparte al dibujar (ver render/world.js).
    cabina(g) {
      DOME(g, 0.72, VIDRIO, 0, 0.1, 0, 1.0, 0.85, 1.5);
      B(g, 0.1, 0.5, 1.9, OSCURO, 0, 0.12, 0);              // arco central
      B(g, 1.5, 0.14, 0.14, OSCURO, 0, -0.35, -0.9);        // marco delantero
      B(g, 1.5, 0.14, 0.14, OSCURO, 0, -0.35, 0.9);
    },
    // TANQUE subalar: cilindro con las dos puntas conicas. Cae entero y rueda.
    tanque(g) {
      CYL(g, 0.34, 0.34, 1.7, CLARO, 0, 0, 0, 10);
      CONE(g, 0.34, 0.8, CLARO, 0, 0, -1.25, false, 10);
      CONE(g, 0.34, 0.6, CLARO, 0, 0, 1.15, true, 10);
      B(g, 0.5, 0.1, 0.4, OSCURO, 0, 0.36, -0.2);           // pilon cortado
    },
    // TREN: pata, amortiguador y rueda. Chica, pero es LA pieza que dice "esto era un avion".
    tren(g) {
      B(g, 0.16, 1.5, 0.16, MEDIO, 0, 0.3, 0);
      CYL(g, 0.12, 0.12, 0.5, OSCURO, 0, 0.95, 0, 8);
      const r = add(g, new THREE.TorusGeometry(0.42, 0.2, 6, 12), NEGRO, 0, -0.55, 0);
      r.rotation.y = Math.PI / 2;
      B(g, 0.5, 0.12, 0.5, OSCURO, 0, 1.15, 0);             // el muñon de la bahia
    },
    // PANEL de chapa: una plancha curva arrancada del revestimiento, con remaches y los cuatro
    // bordes desgarrados. Es el "pedazo cualquiera" — pero con forma de chapa, no de cubo.
    panel(g) {
      const p = PLATE(g, [[-0.9, 0.75], [0.85, 0.95], [0.95, -0.7], [-0.8, -0.9]], 0.08, MEDIO, 0, 0, 0);
      p.rotation.x = 0.22;
      for (let i = 0; i < 5; i++) B(g, 0.09, 0.06, 0.09, OSCURO, -0.7 + i * 0.35, 0.09, 0.55);
      desgarro(g, 1.7, 0.16, OSCURO, 0, 0, -0.85, 'x');
      desgarro(g, 1.5, 0.16, OSCURO, 0.9, 0, 0, 'z');
    },
  };

  // ---------- HORNEADO ----------

  return PIEZAS;
});
