// CATALOGO DE MODELOS — EL SEA HARRIER FRS.1 (PLAN_HORNEADO B3).
//
// El unico modelo "de autor" del plan, y el unico con un criterio de cierre que no es una medida
// sino un juicio: **en captura tiene que distinguirse del jet generico sin leyenda**. Hasta B3 el
// perseguidor de LA COLA era el mismo caza generico del pasillo con dos poses mas — un avion que
// no era de nadie haciendo de Harrier.
//
// QUE HACE QUE UN HARRIER SE VEA COMO UN HARRIER, en orden de lo que sobrevive a 70 px de sprite:
//
//  1. **LAS TOMAS DE AIRE.** Es LA firma y no hay segunda. El Pegasus traga tanto aire que las
//     tomas son dos barriles pegados al fuselaje justo detras de la cabina, tan anchos como el
//     fuselaje mismo. De frente, el avion es mas ancho a la altura del piloto que en ningun otro
//     lado salvo las alas. Ningun otro caza de la epoca se ve asi.
//  2. **LAS CUATRO TOBERAS.** Dos adelante (frias, en la cintura, a la altura de las tomas) y dos
//     atras (calientes). Sobresalen del costado como cuatro muñones. En vuelo van apuntando atras,
//     pero se ven igual: son bultos donde ningun otro avion tiene nada.
//  3. **EL ALA ANHEDRA.** Alta y CAIDA — las puntas apuntan al suelo. Es lo contrario del diedro
//     de casi todo lo que vuela: de frente el ala forma una "A" (/\), nunca una "V". El signo de
//     `dih` en `WING` esta invertido respecto de la convencion aeronautica — leer la nota de la
//     primitiva en tools/bake_common.js ANTES de tocar este numero.
//  4. **ES PANZON Y CORTO.** El motor va en el medio del fuselaje, no atras, asi que la cintura es
//     lo mas gordo del avion y la cola sale de ahi afinandose. La silueta es de rana, no de flecha.
//  5. **LOS BALANCINES.** El tren de punta de ala va en dos carenados colgando bajo las alas, casi
//     en la punta. Aun retraidos son dos bultos que ningun otro avion tiene ahi.
//  6. La cabina en BURBUJA muy alta y el radomo del Blue Fox, corto y romo.
//
// COLOR: gris oscuro de mar (Extra Dark Sea Grey), que es el que llevaban en el 82 — y de paso
// contrasta con los marrones y verdes de la escuadrilla argentina, que es lo que hace falta cuando
// el mismo cuadro tiene a los dos.
//
// PROA HACIA -Z, como todo el horno.
//
// FORMA DEL CATALOGO: ver tools/models/planes.js.
'use strict';
BAKE.modelos('harrier', (THREE, K) => {
  const { MAT, EMIT, add, addEmit, B, CYL, POST, CONE, DOME, PLATE, WING, FIN } = K;

  const GRIS = '#5b6568', GRIS2 = '#4a5457', OSC = '#333b3e', CLARO = '#6e797c';
  const CANOPY = BAKE.PAL.canopy;
  const NEGRO = '#1b2124';

  /** LA TOBERA VECTORIAL: un muñon que sale del costado del fuselaje, achatado y con la boca
   *  ovalada. `cal` la pinta caliente (las dos de atras) o fria (las dos de adelante). */
  function tobera(g, x, y, z, r, largo, cal) {
    const m = add(g, new THREE.CylinderGeometry(r, r * 1.05, largo, 8), cal ? OSC : GRIS2, x, y, z);
    m.rotation.z = Math.PI / 2;                        // acostada sobre el eje X: sale de costado
    m.scale.set(1, 1, 0.72);                           // achatada: una tobera de Harrier no es redonda
    const boca = add(g, new THREE.CylinderGeometry(r * 0.62, r * 0.62, largo * 0.3, 8),
      cal ? NEGRO : OSC, x + (x > 0 ? largo * 0.4 : -largo * 0.4), y, z);
    boca.rotation.z = Math.PI / 2; boca.scale.set(1, 1, 0.72);
    return m;
  }

  /** EL AVION. `atras` = true le enciende las toberas calientes (la vista de cola) — el mismo
   *  criterio que el escape de los aviones jugables: el fuego no se ilumina, se ilumina solo. */
  function harrier(atras) {
    const g = new THREE.Group();

    // ---- FUSELAJE: gordo en la cintura (ahi va el Pegasus) y afinandose hacia la cola.
    CYL(g, 0.44, 0.58, 2.2, GRIS, 0, 0, -0.5, 12);        // proa → cintura (se ENSANCHA)
    CYL(g, 0.58, 0.28, 2.6, GRIS, 0, -0.02, 1.85, 12);    // cintura → cola, se afina
    CONE(g, 0.4, 1.6, GRIS, 0, 0.06, -2.7, false, 12);    // radomo del Blue Fox: corto y romo
    // EL AGUIJON DE COLA: el botalon de los chorros de control de actitud, fino y largo. Es lo
    // ultimo del avion y a contraluz se lee como una antena — pero esta, y es suya.
    CYL(g, 0.09, 0.06, 1.1, OSC, 0, 0.02, 3.55, 6);

    // ---- LAS TOMAS: dos barriles pegados al fuselaje, y son lo mas ancho despues del ala.
    for (const sg of [-1, 1]) {
      const t = add(g, new THREE.CylinderGeometry(0.5, 0.46, 1.75, 10), GRIS, sg * 0.66, 0.08, -0.55);
      t.rotation.x = Math.PI / 2; t.scale.set(0.86, 1, 1);
      // LA BOCA, negra y ovalada: el agujero es la mitad del efecto — sin el son dos tanques.
      const b = add(g, new THREE.CylinderGeometry(0.42, 0.42, 0.24, 10), NEGRO, sg * 0.66, 0.08, -1.38);
      b.rotation.x = Math.PI / 2; b.scale.set(0.86, 1, 1);
      // las PUERTAS AUXILIARES de la toma: la fila de bocas chicas que se abren en el labio
      for (let i = 0; i < 3; i++)
        B(g, 0.1, 0.16, 0.12, OSC, sg * (0.66 + 0.36), 0.24 - i * 0.18, -1.0);
    }

    // ---- ALA ALTA Y ANHEDRA. El diedro NEGATIVO es la mitad de la silueta de frente: las puntas
    // caen. Va montada arriba del fuselaje, no al medio.
    // EL SIGNO ES POSITIVO Y ESO ES ANHEDRO: ver la nota de `WING` en tools/bake_common.js. Con
    // -16 las puntas SUBEN y el avion queda en "V", que es justo lo que un Harrier no hace nunca
    // — se horneo asi dos veces y las dos las corrigio Matias mirando la lamina.
    WING(g, 4.8, 2.1, 0.7, 1.5, 0.20, GRIS2, 0.36, 0.35, 15);
    WING(g, 4.8, 2.1, 0.7, 1.5, 0.05, CLARO, 0.25, 0.35, 15);      // la cara de abajo, mas clara
    // LOS BALANCINES: dos carenados colgando bajo el ala, casi en la punta. Bultos donde ningun
    // otro avion tiene nada, y por eso valen su poligono.
    for (const sg of [-1, 1]) {
      const p = add(g, new THREE.CapsuleGeometry
        ? new THREE.CapsuleGeometry(0.11, 0.5, 4, 8)
        : new THREE.CylinderGeometry(0.11, 0.11, 0.7, 8), OSC, sg * 1.95, -0.02, 0.55);
      p.rotation.x = Math.PI / 2;
    }

    // ---- LAS CUATRO TOBERAS, dos por lado. Las de adelante en la cintura, a la altura de las
    // tomas; las de atras un poco mas atras y mas abajo.
    for (const sg of [-1, 1]) {
      tobera(g, sg * 0.72, -0.14, 0.05, 0.26, 0.5, false);   // frias
      tobera(g, sg * 0.66, -0.20, 1.35, 0.30, 0.55, true);   // calientes
      if (atras) {
        // la boca encendida, mirando a la camara: tres capas de calor, como la turbina de los
        // aviones jugables. Va SOLO en la hoja de cola — de frente la tapa el propio avion.
        addEmit(g, new THREE.CircleGeometry(0.2, 10), BAKE.PAL.fuegoHondo, sg * 0.95, -0.2, 1.36);
        addEmit(g, new THREE.CircleGeometry(0.12, 10), BAKE.PAL.fuegoMedio, sg * 0.97, -0.2, 1.36);
        addEmit(g, new THREE.CircleGeometry(0.06, 8), BAKE.PAL.fuegoNucleo, sg * 0.99, -0.2, 1.36);
      }
    }

    // ---- COLA: deriva en flecha con el carenado del RWR en la punta, y estabilizador ANHEDRO
    // (tambien caido, como el ala).
    FIN(g, 1.3, 1.5, 0.55, 1.05, 0.11, GRIS2, 0.3, 2.75);
    B(g, 0.16, 0.16, 0.42, OSC, 0, 1.62, 2.5);                       // el carenado de la punta
    WING(g, 2.2, 0.95, 0.42, 0.7, 0.1, GRIS2, 0.06, 2.9, 13);      // el estabilizador tambien cae

    // ---- CABINA: burbuja ALTA y adelantada, montada casi sobre el radomo.
    // LA CABINA VA ADELANTE DE LAS TOMAS, no encima. Es una diferencia de medio metro real y a
    // 70 px cambia la lectura entera: puesta al medio, la burbuja queda encajada entre los dos
    // barriles y el avion se lee como un fuselaje con tres bultos iguales. Adelantada, se lee la
    // secuencia correcta —nariz, piloto, tomas— que es la firma del Harrier vista de frente.
    DOME(g, 0.34, CANOPY, 0, 0.5, -2.0, 0.8, 0.95, 1.5);
    B(g, 0.34, 0.3, 0.9, GRIS, 0, 0.34, -1.85);                      // el escalon bajo la cabina
    B(g, 0.28, 0.16, 0.7, OSC, 0, 0.52, -1.15);                      // el espinazo detras de la cabina

    // ---- ESCARAPELAS: la RAF/Royal Navy en el fuselaje. UN solo azul y muy chico — a 70 px es un
    // pixel, pero es el pixel que dice de quien es el avion.
    for (const sg of [-1, 1]) B(g, 0.05, 0.22, 0.22, '#2c4a7a', sg * 0.55, 0.18, 1.5);
    return g;
  }

  return { harrier: () => harrier(false), harrierRear: () => harrier(true) };
});
