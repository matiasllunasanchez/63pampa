// CATALOGO DE MODELOS — LOS BUQUES DEL PASILLO (PLAN_HORNEADO B2).
// Las tres clases del juego —destructor Tipo 42, fragata Tipo 21 y logistico— como ensamblajes
// procedurales de primitivas de three.js, en vista de costado, de proa y hundiendose.
//
// EL PROBLEMA QUE VIENEN A RESOLVER. Hasta B2 el buque del pasillo era UNO SOLO: `drawBargeHull`
// dibuja un perfil de destructor generico y lo usan los tres. El SHEFFIELD, el ARDENT y el SIR
// GALAHAD —un destructor, una fragata y un buque de carga— se ven exactamente iguales, y el
// unico dato que los distingue es el nombre escrito arriba. `data/ships.js` ya sabe de que clase
// es cada uno (`SHIP_CLASS`) y le da a cada clase sus zonas criticas propias; lo unico que
// faltaba era que se PAREZCAN a lo que son.
//
// QUE HACE RECONOCIBLE A CADA UNA, a la distancia a la que se las ve (la silueta y nada mas):
//   · **t42** destructor: casco largo y bajo, cubierta de proa LARGA Y VACIA con una torreta
//     sola adelante, la isla al medio y un mastil ALTO con los dos radomos. Lo que lo delata es
//     la proporcion: mucho barco adelante de la superestructura.
//   · **t21** fragata: mas corta, roda MUY lanzada (proa de clipper, la firma de la clase), la
//     superestructura corrida hacia adelante y una cubierta de vuelo baja y despejada a popa.
//   · **log** logistico: casco alto de costados rectos, la superestructura ENTERA A POPA y una
//     cubierta de carga larga adelante con grúas y contenedores. No se parece en nada a los
//     otros dos, que es exactamente el punto.
//
// PROA HACIA -Z, como todo lo demas del horno. El horneador la gira: de costado con
// `quarter = -PI/2` (proa a la IZQUIERDA, igual que el casco 2D que reemplaza) y de frente con
// `quarter = 0`.
//
// SOBRE COMPARTIR ESTOS CASCOS CON EL 3D. El plan pide que sean los mismos que arma
// `systems/ship3d.js`. Hoy no se puede: ese modulo esta EN CUARENTENA desde el 18/8 (ver
// data/cuarentena.js y PLAN_REFACTOR §4b) y su cabecera dice explicitamente que no se refactoriza.
// Asi que quedan PREPARADOS para compartirse —reciben THREE por parametro, no saben nada del
// horno y no importan nada del juego— pero el cableado espera a que la cuarentena caiga.
// Anotado en PLAN_HORNEADO §5.
//
// FORMA DEL CATALOGO: ver tools/models/planes.js.
'use strict';
BAKE.modelos('buques', (THREE, K) => {
  const { MAT, add, B, CYL, POST, CONE, DOME, PLATE } = K;

  // ---------------- LA PALETA DEL MAR ----------------
  // Los mismos tonos del casco 2D (`SH` de legacy/momentum_render.js), y no unos nuevos: el buque
  // horneado tiene que empalmar con el dibujado a mano, porque el dibujado a mano SIGUE SIENDO el
  // respaldo cuando la hoja no cargo o cuando el buque esta tan lejos que un sprite seria puré.
  // Aca van un punto mas claros que alla: el 2D se pinta ya mezclado con el horizonte y el 3D en
  // cambio recibe luz, asi que partir del mismo hex daria un buque mas oscuro que su respaldo.
  //
  // Y VAN CON RANGO, no con un tono: entre `hullT` (la faja bajo la borda, que toma el sol) y
  // `hullB` (la panza, ya en sombra) hay el doble de distancia que en el 2D. Sin ese rango el
  // casco sale como una plancha lisa — que fue exactamente el resultado de la primera horneada:
  // las tres clases se distinguian por su superestructura y el casco no aportaba nada.
  const C = {
    hull: '#2e3a44', hullT: '#41505b', hullB: '#181f26',
    boot: '#0d1216',                 // obra viva: apenas se asoma entre olas
    deck: '#55636d', deckL: '#6e7d87',   // el canto de cubierta contra el cielo
    sup: '#333f49', supL: '#465561', supD: '#1e262d',
    metal: '#1a2229', win: '#e0ad5c',
    carga: '#5a4c3b', carga2: '#6f5f49', gruaC: '#8a7850',
  };

  /** CASCO. Todos los buques del juego salen de aca: un prisma con la roda LANZADA (la proa se
   *  mete hacia atras a medida que baja) y la popa recogida. `lanz` es cuanto se lanza la roda —
   *  es la perilla que separa una fragata Tipo 21 (proa de clipper, muy lanzada) de un logistico
   *  (proa casi recta). Se arma por RODAJAS horizontales y no como un solido suavizado: el
   *  escalonado es lo que lo mantiene en el pixel art del resto del juego, igual que el casco 2D.
   *
   *  El origen local es la LINEA DE FLOTACION y el eje Z la eslora, con la proa en -Z. Nada se
   *  modela bajo el agua: el mar recorta ahi y el horneado ancla el sprite por el borde de abajo
   *  del contenido, asi que un casco con obra viva desplazaria al buque entero hacia arriba. */
  function casco(g, L, manga, franco, lanz, popa) {
    const rows = 7, rh = franco / rows;
    for (let i = 0; i < rows; i++) {
      const f = i / (rows - 1);                          // 0 = cubierta, 1 = flotacion
      const bow = L * lanz * Math.pow(f, 0.7);           // la roda se mete al bajar
      const st = f > 0.65 ? L * popa * (f - 0.65) / 0.35 : 0;
      const largo = L - bow - st;
      const c = f < 0.3 ? C.hullT : f < 0.75 ? C.hull : C.hullB;
      B(g, manga * (1 - f * 0.18), rh * 1.12, largo, c, 0, franco - i * rh - rh / 2, (bow - st) / 2);
    }
    B(g, manga * 0.99, 0.06, L * 0.98, C.deck, 0, franco, L * lanz * 0.3);     // cubierta
    B(g, manga * 1.01, 0.035, L * 0.98, C.deckL, 0, franco + 0.03, L * lanz * 0.3);  // canto al cielo
    B(g, manga * 0.9, franco * 0.1, L * 0.9, C.boot, 0, 0.02, 0);              // flotacion
    // LA PROA, como cuña: dos placas que cierran las amuras. Sin esto el casco termina en una pared
    // plana; de costado se lee igual, pero de PROA se lee como una caja — y la vista de proa es la
    // mitad de esta etapa.
    //
    // VAN METIDAS PARA ADENTRO, y esto se aprendio mirando: en la primera horneada la cuña salia
    // 0,1 unidades por delante de la roda y con eso alcanzaba para que DE COSTADO se leyera como
    // un cajon colgando de la proa. La cuña resuelve una vista y no puede ensuciar la otra.
    for (const sg of [-1, 1]) {
      const p = B(g, manga * 0.42, franco * 0.92, L * 0.075, C.hullT,
        sg * manga * 0.2, franco * 0.54, -L / 2 + L * 0.055);
      p.rotation.y = sg * 0.42;
    }
  }

  /** BLOQUE de superestructura: masa, cara al sol y canto. Las tres clases lo usan; lo que las
   *  distingue es DONDE se apilan y cuantos. */
  function bloque(g, anchoF, manga, alto, y, z, largo) {
    const w = manga * anchoF;
    B(g, w, alto, largo, C.sup, 0, y + alto / 2, z);
    B(g, w * 0.34, alto, largo * 0.98, C.supL, -w * 0.31, y + alto / 2, z);   // cara iluminada
    B(g, w * 0.16, alto, largo * 0.98, C.supD, w * 0.4, y + alto / 2, z);     // cara en sombra
    B(g, w * 1.02, 0.05, largo * 1.02, C.deck, 0, y + alto, z);               // canto contra el cielo
  }

  /** MASTIL con cruceta. `radomos` le cuelga los dos domos del Tipo 42, que a esta escala son
   *  DOS PELOTAS BLANCAS arriba de todo — y son lo unico que dice "destructor de misiles". */
  function mastil(g, alto, y, z, radomos) {
    POST(g, 0.035, 0.06, alto, C.metal, 0, y + alto / 2, z, 6);
    B(g, 0.5, 0.04, 0.05, C.metal, 0, y + alto * 0.72, z);                    // cruceta
    if (radomos) {
      DOME(g, 0.19, '#a8b0b4', 0, y + alto * 0.92, z - 0.22, 1, 0.9, 1);
      DOME(g, 0.15, '#98a0a4', 0, y + alto * 0.62, z + 0.3, 1, 0.9, 1);
    } else {
      B(g, 0.34, 0.05, 0.06, C.metal, 0, y + alto * 0.98, z);                 // la antena de barra
    }
  }

  /** CHIMENEA con sombrerete negro. */
  function chimenea(g, w, alto, y, z) {
    const m = B(g, w, alto, w * 1.3, C.supD, 0, y + alto / 2, z); m.rotation.x = -0.08;
    B(g, w * 1.15, alto * 0.12, w * 1.45, C.metal, 0, y + alto, z);
  }

  /** TORRETA con su cañon apuntando alto: el buque no espera, esta tirando. */
  function torreta(g, y, z, r) {
    B(g, r * 2, r * 1.1, r * 2.4, C.sup, 0, y + r * 0.55, z);
    const c = CYL(g, r * 0.16, r * 0.2, r * 3.2, C.metal, 0, y + r * 1.1, z - r * 1.6, 6);
    c.rotation.x = Math.PI / 2 - 0.5;
  }

  // ============================ LAS TRES CLASES ============================
  // Todas se arman sobre una eslora L comun para que el horno las encuadre igual: lo que cambia
  // es la PROPORCION (manga, francobordo, donde cae la isla), que es de lo unico que se entera
  // una silueta.
  const L = 10;

  /** DESTRUCTOR TIPO 42 — SHEFFIELD, COVENTRY.
   *  Lo que se lee: cubierta de proa larga y despejada con UNA torreta, la isla al medio, mastil
   *  alto con los radomos, y a popa la cubierta de vuelo. Mucho barco adelante de la isla. */
  function t42(g) {
    const manga = 1.15, franco = 0.62;
    casco(g, L, manga, franco, 0.055, 0.03);
    torreta(g, franco, -L * 0.33, 0.2);                                       // 4,5" a proa
    B(g, manga * 0.4, 0.28, 0.5, C.sup, 0, franco + 0.14, -L * 0.19);         // lanzador Sea Dart
    for (const sg of [-1, 1]) {
      const r = CYL(g, 0.05, 0.05, 0.5, C.metal, sg * 0.08, franco + 0.36, -L * 0.19, 6);
      r.rotation.x = Math.PI / 2 - 0.7;
    }
    bloque(g, 0.86, manga, 0.34, franco, -L * 0.02, L * 0.30);                // caseta corrida
    bloque(g, 0.62, manga, 0.34, franco + 0.34, -L * 0.08, L * 0.16);         // puente
    bloque(g, 0.40, manga, 0.26, franco + 0.68, -L * 0.10, L * 0.09);         // techo del puente
    B(g, manga * 0.44, 0.07, 0.5, C.win, 0, franco + 0.52, -L * 0.145);       // ventanales encendidos
    mastil(g, 1.5, franco + 0.94, -L * 0.09, true);
    chimenea(g, manga * 0.3, 0.44, franco + 0.34, L * 0.09);
    bloque(g, 0.66, manga, 0.42, franco, L * 0.26, L * 0.16);                 // hangar
    B(g, manga * 0.92, 0.05, L * 0.2, C.deck, 0, franco + 0.03, L * 0.40);    // cubierta de vuelo
    return g;
  }

  /** FRAGATA TIPO 21 — ARDENT, ANTELOPE.
   *  Lo que se lee: es CORTA, la roda va muy lanzada (proa de clipper — la firma de la clase), la
   *  isla esta adelantada y a popa queda una cubierta de vuelo baja y larga, casi la mitad del
   *  barco. Al lado del Tipo 42 se ve como lo que es: el mismo mar, un barco mas chico. */
  function t21(g) {
    const manga = 0.92, franco = 0.46;
    casco(g, L * 0.76, manga, franco, 0.13, 0.02);                            // CORTA y muy lanzada
    torreta(g, franco, -L * 0.27, 0.17);
    // UNA SOLA ISLA COMPACTA, y ahi esta la diferencia con el destructor: el Tipo 42 tiene la masa
    // repartida en tres bloques a lo largo de medio barco; el 21 la tiene toda junta adelante y
    // deja la popa VACIA. En silueta eso es lo que se lee — donde esta el peso.
    bloque(g, 0.86, manga, 0.46, franco, -L * 0.09, L * 0.20);
    bloque(g, 0.56, manga, 0.34, franco + 0.46, -L * 0.12, L * 0.11);         // puente
    B(g, manga * 0.4, 0.07, 0.36, C.win, 0, franco + 0.62, -L * 0.175);
    mastil(g, 1.32, franco + 0.80, -L * 0.12, false);                         // palo unico y fino
    chimenea(g, manga * 0.26, 0.34, franco + 0.46, L * 0.01);
    bloque(g, 0.56, manga, 0.30, franco, L * 0.11, L * 0.10);                 // hangar bajo
    B(g, manga * 0.24, 0.14, 0.26, C.metal, 0, franco + 0.30, L * 0.11);      // Sea Cat sobre el hangar
    // LA CUBIERTA DE VUELO: un tercio del barco, plana y despejada hasta la popa. Es la mitad de
    // la firma de la clase (la otra mitad es la roda lanzada de la proa).
    B(g, manga * 0.86, 0.05, L * 0.24, C.deck, 0, franco + 0.03, L * 0.26);
    B(g, manga * 0.88, 0.03, L * 0.24, C.deckL, 0, franco + 0.06, L * 0.26);
    return g;
  }

  /** LOGISTICO — SIR GALAHAD, SIR TRISTRAM, ATLANTIC CONVEYOR.
   *  Lo que se lee, y no se parece a nada de lo anterior: casco ALTO de costados rectos, la
   *  superestructura ENTERA A POPA (un bloque vertical pegado al final) y adelante una cubierta
   *  de carga larga con contenedores y dos grúas. Si de las tres clases se ve una sola cosa, que
   *  sea esta: es la que hace que valga la pena tener tres. */
  function log(g) {
    const manga = 1.35, franco = 1.0;                                          // francobordo ALTO
    casco(g, L, manga, franco, 0.03, 0.015);                                   // proa casi recta
    // LA CARGA: dos filas de contenedores de alturas desparejas. Desparejas a proposito — una
    // fila pareja se lee como un muro y lo que tiene que leerse es "esto lleva cosas".
    for (let i = 0; i < 6; i++) {
      const z = -L * 0.36 + i * L * 0.095;
      const h = 0.3 + ((i * 7) % 3) * 0.12;
      B(g, manga * 0.72, h, L * 0.08, i % 2 ? C.carga : C.carga2, 0, franco + h / 2, z);
      if (i % 3 === 0) B(g, manga * 0.5, 0.24, L * 0.07, C.carga2, 0, franco + h + 0.12, z);
    }
    for (const z of [-L * 0.26, L * 0.02]) {                                   // dos grúas de porticos
      POST(g, 0.05, 0.07, 0.95, C.gruaC, 0, franco + 0.48, z, 6);
      const pl = B(g, 0.1, 0.07, L * 0.16, C.gruaC, 0, franco + 0.92, z - L * 0.05);
      pl.rotation.x = 0.22;
    }
    // LA ISLA, entera a popa
    bloque(g, 0.72, manga, 0.5, franco, L * 0.30, L * 0.16);
    bloque(g, 0.6, manga, 0.42, franco + 0.5, L * 0.30, L * 0.13);
    bloque(g, 0.44, manga, 0.3, franco + 0.92, L * 0.30, L * 0.09);
    B(g, manga * 0.4, 0.08, 0.42, C.win, 0, franco + 1.06, L * 0.235);
    mastil(g, 0.9, franco + 1.22, L * 0.30, false);
    chimenea(g, manga * 0.26, 0.42, franco + 1.22, L * 0.36);
    return g;
  }

  const CLASES = { t42, t21, log };

  /** UN BUQUE, en el estado que se pida.
   *  `hundido`: 0 = navegando · 1 = escorado de PROA (se va de nariz) · 2 = escorado de POPA.
   *
   *  LOS DOS HUNDIMIENTOS SON EL MISMO CASCO INCLINADO, y esta bien que lo sean: un barco que se
   *  hunde no cambia de forma, cambia de ANGULO — es literalmente el unico caso del proyecto
   *  donde reusar el modelo tal cual es lo correcto y no una economia. Lo que se agrega es lo que
   *  el angulo solo no cuenta: la escora lateral (nada se hunde derecho), el humo negro y la
   *  parte que ya se comio el agua, que el horno recorta sola porque no se modela bajo la
   *  flotacion. */
  function buque(clase, hundido) {
    const g = new THREE.Group();
    const b = new THREE.Group();
    CLASES[clase](b);
    if (hundido) {
      // 16° de trimado y 11° de escora, y una punta YA BAJO EL AGUA. Numeros feos a proposito: a
      // 15° exactos parece un diagrama y lo que tiene que parecer es un accidente.
      //
      // La parte sumergida se modela igual y **la recorta el horno** (`clipY`), no un ajuste de
      // posicion: si en vez de eso se levantara el buque para que no cruce la flotacion, quedaria
      // un barco inclinado FLOTANDO ALTO, que es la silueta de un barco en una ola y no la de uno
      // que se va a pique. Lo que cuenta la historia es justamente cuanto le falta.
      b.rotation.x = hundido === 1 ? -0.28 : 0.28;
      b.rotation.z = hundido === 1 ? 0.19 : -0.15;
      b.position.y = -0.30;                                    // ya se comio parte del francobordo
      // EL HUMO NEGRO: cuatro bocanadas subiendo desde la isla. Es lo unico que separa "escorado"
      // de "hundiendose" en una silueta quieta — un barco inclinado sin humo se lee como un barco
      // en una ola.
      for (let i = 0; i < 4; i++) {
        const u = i / 3;
        DOME(g, 0.22 + u * 0.42, i % 2 ? '#20252a' : '#2b3138',
          u * 0.5, 1.4 + u * 1.4, (hundido === 1 ? 2.2 : -2.2) + u * 0.8, 1, 0.85, 1);
      }
    }
    g.add(b);
    return g;
  }

  return {
    t42: () => buque('t42', 0), t21: () => buque('t21', 0), log: () => buque('log', 0),
    hundido: (clase, n) => buque(clase, n),
  };
});
