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
  // la madera de los postes: el unico material de la hoja que no es metal ni vidrio
  const MADERA = '#8a7355';

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

    // ==================== LAS FIRMAS (PLAN_HORNEADO B5) ====================
    // Las diez de arriba son piezas de AVION: sirven para el jugador, el jet y el helo, y por eso
    // se reparten por indice entre todos los pedazos. Las que siguen son otra cosa — son LA PIEZA
    // de un tipo, la que sale entera y girando y hace que a 200 m se sepa que lo que cae era un
    // helicoptero y no una camioneta. `data/despiece.js` las nombra en el campo `pieza`.
    //
    // HASTA B5 ESTAS DIEZ NO EXISTIAN Y SE DIBUJABAN A MANO, en render/world.js, con tres recetas
    // para todas: una BARRA (rotor, ala, cable, cañon), una ELIPSE (plato) y un BULTO para el
    // resto (tanque, cabina, rampa, funda). O sea que el rotor del helicoptero y el cable de un
    // poste eran el mismo rectangulo, y la firma que D2 promete —"cada tipo se distingue sin
    // leyenda"— la sostenia el color. Es exactamente el problema que las diez piezas de arriba
    // vinieron a arreglar para el avion, sin terminar de arreglarlo para todo lo demas.

    // ROTOR del helicoptero: cabeza, mangueta y TRES palas combadas. La pieza mas reconocible del
    // juego despues del ala — cae dando vueltas sola y no hay nada mas en el mundo que se le
    // parezca. Las palas van desparejas a proposito: un rotor prolijo se lee como una helice de
    // juguete, y este se acaba de arrancar.
    rotor(g) {
      CYL(g, 0.3, 0.34, 0.42, OSCURO, 0, 0, 0, 10);           // la cabeza
      B(g, 0.22, 0.5, 0.22, NEGRO, 0, -0.3, 0);               // el muñon del mastil, cortado
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI * 2 / 3 + 0.4;
        const pala = B(g, 0.2, 0.07, 3.0, MEDIO, Math.sin(a) * 1.5, 0.05, Math.cos(a) * 1.5);
        pala.rotation.y = a;
        pala.rotation.z = [0.16, -0.3, 0.1][i];                // cada una doblada distinto
        pala.rotation.x = [0, 0.12, -0.18][i];
      }
      desgarro(g, 0.4, 0.24, NEGRO, 0, -0.55, 0, 'x');
    },
    // BOTALON de cola del helo: el tubo fino con la deriva y el rotorcito. Es la OTRA mitad del
    // helicoptero, y la que dice que se partio en dos — un botalon suelto no puede venir de
    // ninguna otra cosa del roster.
    botalon(g) {
      CYL(g, 0.16, 0.3, 2.4, MEDIO, 0, 0, 0, 10);
      const d = PLATE(g, [[0, 0.5], [0.85, 0.3], [0.85, -0.05], [0, -0.42]], 0.09, MEDIO, 0, 0, -0.95);
      d.rotation.z = Math.PI / 2;                              // la deriva, parada
      B(g, 0.1, 0.55, 0.1, NEGRO, 0.16, 0.35, -1.0);           // el rotor de cola, dos palas
      B(g, 0.1, 0.1, 0.55, NEGRO, 0.16, 0.35, -1.0);
      CYL(g, 0.26, 0.26, 0.1, NEGRO, 0, 0, 1.2, 10);           // el corte, hueco
      desgarro(g, 0.7, 0.3, OSCURO, 0, 0, 1.2, 'x');
    },
    // PLATO del radar: la rejilla curva con su bocina, y el muñon del mastil que se llevo puesto.
    // Cae de canto y rueda — es la unica pieza redonda de la hoja, y a ocho pixeles eso alcanza.
    plato(g) {
      const m = add(g, new THREE.CylinderGeometry(1.5, 1.5, 0.14, 14, 1, false, 0, Math.PI),
        CLARO, 0, 0, 0);
      m.rotation.x = Math.PI / 2; m.rotation.z = Math.PI;
      B(g, 0.5, 0.4, 0.14, MEDIO, 0, 0.35, 0.15);              // la bocina
      for (let i = 0; i < 5; i++)                              // los travesaños de la rejilla
        B(g, 0.06, 0.06, 1.5, OSCURO, -1.2 + i * 0.6, 0, -0.4);
      B(g, 0.18, 0.9, 0.18, OSCURO, 0, -0.9, 0.1);             // el muñon del mastil
      desgarro(g, 0.5, 0.26, NEGRO, 0, -1.3, 0.1, 'x');
    },
    // CAÑON del nido AA: los dos tubos gemelos sobre su cuna, arrancados del pedestal. Los DOS
    // tubos y no uno: de a pares es como se lee un antiaereo, y un tubo solo seria un caño.
    canon(g) {
      B(g, 1.1, 0.32, 0.6, MEDIO, 0, 0, 0, 0);                 // la cuna
      for (const sg of [-1, 1]) {
        CYL(g, 0.09, 0.11, 2.4, OSCURO, sg * 0.22, 0.16, -1.1, 6);
        CYL(g, 0.14, 0.14, 0.3, NEGRO, sg * 0.22, 0.16, -2.2, 6);   // el apagallamas
      }
      B(g, 0.5, 0.4, 0.5, OSCURO, 0, -0.3, 0.3);               // lo que quedo del pedestal
      desgarro(g, 0.7, 0.3, NEGRO, 0, -0.55, 0.3, 'x');
    },
    // MOTOR de reactor: el tubo con la CARA DEL COMPRESOR a la vista. Eso —el disco de alabes en
    // el extremo abierto— es lo unico que dice "motor" y no "tanque": un cilindro liso a esta
    // escala es un tacho. Sale entero de adentro del fuselaje cuando el avion se parte.
    motor(g) {
      CYL(g, 0.52, 0.58, 2.2, MEDIO, 0, 0, 0, 12);
      CYL(g, 0.6, 0.6, 0.16, OSCURO, 0, 0, -1.05, 12);         // el anillo de la admision
      CYL(g, 0.46, 0.46, 0.1, NEGRO, 0, 0, -0.98, 12);         // el hueco
      for (let i = 0; i < 8; i++) {                            // LOS ALABES: la firma
        const a = i * Math.PI / 4;
        const al = B(g, 0.09, 0.42, 0.08, CLARO, Math.cos(a) * 0.24, Math.sin(a) * 0.24, -1.0);
        al.rotation.z = a + 0.5;
      }
      CYL(g, 0.16, 0.16, 0.5, OSCURO, 0, 0, -1.0, 8);          // el cono de admision
      CYL(g, 0.44, 0.5, 0.4, OSCURO, 0, 0, 1.2, 12);           // la turbina, atras
      B(g, 0.14, 0.36, 1.6, OSCURO, 0, 0.5, 0.1);              // los bancales, arrancados
      desgarro(g, 1.5, 0.24, NEGRO, 0, 0.68, 0.1, 'z');
    },
    // TAMBOR de combustible: el de doscientos litros del deposito, ABOLLADO y con la tapa
    // reventada. No es el tanque subalar de arriba — ese es de avion, fino y con puntas conicas;
    // este es corto, gordo y con los dos nervios del cuerpo, que es como se lee un tambor.
    tambor(g) {
      CYL(g, 0.62, 0.62, 1.5, MEDIO, 0, 0, 0, 12);
      CYL(g, 0.66, 0.66, 0.14, OSCURO, 0, 0, -0.4, 12);        // los dos nervios
      CYL(g, 0.66, 0.66, 0.14, OSCURO, 0, 0, 0.4, 12);
      CYL(g, 0.56, 0.56, 0.12, NEGRO, 0, 0, 0.78, 12);         // la tapa, reventada hacia adentro
      const ab = B(g, 0.5, 0.5, 0.4, OSCURO, 0.42, 0.3, -0.2); ab.rotation.z = 0.5;   // la abolladura
      desgarro(g, 1.0, 0.22, NEGRO, 0, 0, 0.82, 'x');
    },
    // RUEDA de camion: la cubierta con su llanta y un tramo de eje. La del tren de aterrizaje es
    // chica y va con su pata; esta es GORDA y va sola, rodando. Es la firma del camion AA.
    rueda(g) {
      const r = add(g, new THREE.TorusGeometry(0.85, 0.32, 6, 14), NEGRO, 0, 0, 0);
      r.rotation.y = Math.PI / 2;
      CYL(g, 0.55, 0.55, 0.44, OSCURO, 0, 0, 0, 12);           // la llanta
      CYL(g, 0.2, 0.2, 0.6, CLARO, 0, 0, 0, 8);                // el cubo, claro: es lo que se ve girar
      B(g, 0.16, 0.16, 1.3, MEDIO, 0, 0, 0.7);                 // el tramo de eje, doblado
      desgarro(g, 0.5, 0.2, OSCURO, 0, 0, 1.3, 'x');
    },
    // RAMPA de la barcaza: la plancha de proa con sus dos nervios y las cadenas cortadas. Es lo
    // primero que se le vuela a una lancha de desembarco y no se parece a ninguna otra chapa:
    // es RECTA, ancha y con los refuerzos a la vista.
    rampa(g) {
      B(g, 2.3, 0.14, 1.7, MEDIO, 0, 0, 0);
      for (const sx of [-0.7, 0, 0.7]) B(g, 0.16, 0.2, 1.7, OSCURO, sx, 0.14, 0);   // nervios
      B(g, 2.3, 0.2, 0.16, OSCURO, 0, 0.1, -0.85);             // el labio de proa
      for (const sx of [-0.9, 0.9]) {                          // las cadenas, cortadas
        const c = CYL(g, 0.05, 0.05, 0.7, NEGRO, sx, 0.3, 0.75, 6);
        c.rotation.x = 0.6; c.rotation.z = sx * 0.3;
      }
      desgarro(g, 2.0, 0.2, OSCURO, 0, 0, 0.9, 'x');
    },
    // FUNDA del globo: la tela vaciada, en pliegues, con un tramo de cable colgando. Es LO
    // CONTRARIO de una chapa — no tiene canto duro ni brilla, y por eso los pliegues se modelan
    // con domos MUY achatados en vez de placas. Lo unico blando de la hoja.
    funda(g) {
      const d1 = DOME(g, 1.1, CLARO, 0, 0, 0, 1.2, 0.22, 1.4); d1.rotation.y = 0.2;
      const d2 = DOME(g, 0.8, MEDIO, 0.5, 0.06, -0.6, 1.3, 0.26, 0.9); d2.rotation.y = -0.6;
      const d3 = DOME(g, 0.65, CLARO, -0.7, 0.04, 0.7, 1.0, 0.2, 1.1); d3.rotation.y = 0.9;
      for (let i = 0; i < 3; i++) {                            // el cable, enrollado
        const c = CYL(g, 0.04, 0.04, 1.0 + i * 0.3, OSCURO, -0.9 + i * 0.3, -0.1, 0.9 + i * 0.2, 5);
        c.rotation.y = 0.6 + i * 0.9; c.rotation.x = Math.PI / 2;
      }
    },
    // CABLE con aislador: el tramo de linea con la crucera del poste todavia colgada. La pieza
    // mas fina de la hoja, y la unica que se lee por lo que ARRASTRA y no por su cuerpo.
    cable(g) {
      B(g, 0.16, 0.16, 2.6, MADERA, 0, 0, 0, 0);               // el pedazo de poste
      B(g, 1.4, 0.13, 0.13, MADERA, 0, 0.55, -0.6);            // la crucera
      for (const sx of [-0.5, 0.5]) CYL(g, 0.1, 0.13, 0.24, CLARO, sx, 0.72, -0.6, 6);   // aisladores
      for (const sx of [-0.5, 0.5]) {                          // los dos hilos, colgando
        const h = CYL(g, 0.03, 0.03, 1.9, OSCURO, sx, 0.35, 0.35, 5);
        h.rotation.x = 0.55; h.rotation.z = sx * 0.12;
      }
      desgarro(g, 0.5, 0.2, OSCURO, 0, -1.2, 0, 'x');
    },
  };

  // ---------- HORNEADO ----------

  return PIEZAS;
});
