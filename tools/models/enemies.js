// CATALOGO DE MODELOS — LOS ENEMIGOS Y PROPS DEL PASILLO (PLAN_HORNEADO B0).
// Helicoptero, jets, radar movil, camion AA, barcaza, globo, carpa, deposito, edificio, fragata
// y el Hercules (el unico avion AMIGO horneado), como ensamblajes procedurales de primitivas de
// three.js — no hay GLB en el proyecto: el modelo ES este codigo.
//
// TODOS SE ARMAN CON LA NARIZ/PROA HACIA -Z, igual que los aviones jugables. El horneador los da
// vuelta hacia la camara con un grupo exterior; las poses (yaw del helo, alabeo del caza, giro
// del plato) van en OTRO grupo mas afuera. Encadenar dos rotaciones sobre el MISMO objeto compone
// un euler que no es el que uno espera — la leccion que dejo la deriva torcida del bake de
// aviones, y el motivo de que las capas esten separadas.
//
// FORMA DEL CATALOGO: ver tools/models/planes.js.
'use strict';
BAKE.modelos('enemies', (THREE, K) => {
  const { MAT, EMIT, add, addEmit, B, CYL, POST, CONE, DOME, PLATE, WING, FIN, WHEEL } = K;
  const CANOPY = BAKE.PAL.canopy;

  // ---------- MODELOS (nariz/proa hacia -z; el horneado los da vuelta hacia la camara) ----------

  // HELICOPTERO britanico (silueta tipo Sea King): fuselaje panzon, botalon de cola fino,
  // rotor principal y de cola, patines. `phase` = 0/1: las palas del rotor en dos angulos —
  // alternandolas el rotor BATE en vez de quedar pegado como una calcomania.
  function modelHelo(phase) {
    const g = new THREE.Group();
    const grn = '#687a68', grn2 = '#52624f', dk = '#333d34';
    DOME(g, 0.9, grn, 0, 0, -0.4, 1.0, 0.78, 1.7);                    // fuselaje panzon
    DOME(g, 0.62, CANOPY, 0, 0.02, -1.7, 0.94, 0.66, 0.9);            // vidrio de cabina
    B(g, 1.14, 0.5, 1.1, grn2, 0, -0.62, -0.3);                       // panza/bañera
    CYL(g, 0.30, 0.14, 2.6, grn2, 0, 0.22, 1.8, 8);                   // botalon de cola
    FIN(g, 0.62, 0.5, 0.28, 0.3, 0.08, grn, 0.32, 3.0);               // deriva
    const tr = phase ? 0.42 : 0.16;                                    // rotor de cola (2 fases)
    B(g, 0.08, tr * 2, 0.16, dk, 0.06, 0.62, 3.05);
    B(g, 0.08, 0.16, tr * 2, dk, 0.06, 0.62, 3.05);
    for (const sg of [-1, 1]) {                                        // patines
      B(g, 0.10, 0.42, 0.10, dk, sg * 0.55, -0.95, -0.9);
      B(g, 0.10, 0.42, 0.10, dk, sg * 0.55, -0.95, 0.3);
      CYL(g, 0.07, 0.07, 2.4, dk, sg * 0.55, -1.16, -0.3, 6);
    }
    POST(g, 0.10, 0.14, 0.5, grn2, 0, 0.82, -0.35);                    // mastil del rotor
    // ROTOR PRINCIPAL: disco translucido (el barrido) + 3 palas solidas giradas por fase
    const disc = add(g, new THREE.CylinderGeometry(3.0, 3.0, 0.04, 18), '#aeb6ae', 0, 1.05, -0.35);
    disc.material.transparent = true; disc.material.opacity = 0.16;
    for (let i = 0; i < 3; i++) {
      const a = (phase ? 0.35 : 0) + i * Math.PI * 2 / 3;
      const b = B(g, 0.16, 0.05, 2.9, dk, Math.sin(a) * 1.45, 1.06, -0.35 + Math.cos(a) * 1.45);
      b.rotation.y = a;
    }
    return g;
  }

  // CAZA enemigo (silueta tipo Harrier, gris mar britanico): ala alta en flecha caida
  // (anhedral marcado), tomas grandes a los lados de la cabina, deriva alta.
  // KC-130 HERCULES — LA CHANCHA. El reabastecedor de la FAA, y el unico avion AMIGO horneado.
  //
  // Se lo ve DESDE ATRAS y de cerca (vas a buscarle la canasta), asi que lo que tiene que leerse
  // es su silueta de carguero: ALA ALTA de punta a punta, cuatro turbohelices colgando de ella,
  // fuselaje gordo de seccion casi circular y una deriva enorme. Es lo contrario de un caza y
  // tiene que notarse de un vistazo.
  //
  // LAS HELICES NO VAN EN LA HOJA: son discos que giran, y un disco horneado se ve muerto. Las
  // sigue dibujando render/chancha.js encima del sprite — el airframe lo da la hoja, el
  // movimiento lo da el codigo.
  //
  // Camo de las fotos de la 1a Brigada Aerea (TC-63 y el modelo del C-130): VERDE oscuro con
  // manchones ARENA y panza gris clara.
  function modelHercules() {
    const g = new THREE.Group();
    const verde = '#3f4c3a', arena = '#8a7c52', gris = '#9aa5a0', dk = '#2b342c';
    // FUSELAJE: gordo y largo, con la panza clara asomando abajo
    CYL(g, 1.30, 1.34, 11.0, verde, 0, 0, 0.4, 14);
    CYL(g, 1.20, 1.24, 11.0, gris, 0, -0.42, 0.4, 14);              // panza
    DOME(g, 1.30, verde, 0, 0, -5.1, 1, 1, 1.5);                    // morro romo
    B(g, 1.5, 0.5, 0.9, '#2a3a44', 0, 0.25, -5.4);                  // el vidriado de la cabina
    // RAMPA de carga: el corte caracteristico bajo la cola
    CONE(g, 1.30, 3.2, verde, 0, 0.35, 6.6, true, 14);
    // ALA ALTA de punta a punta, recta y con muy poca flecha: la firma del Hercules
    WING(g, 22.0, 3.1, 1.8, 0.5, 0.42, verde, 1.35, -0.2, 2);
    WING(g, 21.0, 2.9, 1.7, 0.5, 0.10, gris, 1.06, -0.2, 2);        // cara inferior clara
    // MANCHONES de camo sobre el ala y el lomo
    B(g, 4.2, 0.10, 2.0, arena, -5.2, 1.58, -0.4);
    B(g, 3.4, 0.10, 1.7, arena, 3.6, 1.58, 0.1);
    B(g, 2.6, 0.10, 1.5, arena, -1.2, 1.58, 0.5);
    CYL(g, 1.32, 1.32, 2.6, arena, 0, 0, -1.6, 14);                 // banda sobre el lomo
    CYL(g, 1.32, 1.32, 1.8, arena, 0, 0, 3.4, 14);
    // LOS CUATRO MOTORES: gondola larga colgando del ala + el cono de la helice adelante.
    // El DISCO de la helice no va aca (lo anima el render).
    for (const x of [-7.4, -4.1, 4.1, 7.4]) {
      CYL(g, 0.52, 0.48, 3.4, dk, x, 1.05, -0.9, 10);
      CONE(g, 0.42, 1.0, gris, x, 1.05, -2.9, false, 10);           // cono de la helice
      B(g, 0.30, 0.55, 1.2, dk, x, 0.65, 0.4);                      // el escape / carenado bajo
    }
    // COLA: deriva GRANDE y estabilizador a su base (el Hercules no es cola en T)
    // La deriva va ANCHA (en las fotos es una pared) y el estabilizador ARRIBA del ala: puesto a
    // la altura del fuselaje quedaba tapado por el ala alta y el avion perdia la cola de vista.
    FIN(g, 5.0, 4.2, 1.9, 2.4, 0.42, verde, 1.1, 5.6);
    WING(g, 9.6, 2.4, 1.2, 0.7, 0.34, verde, 3.4, 6.0, 0);
    WING(g, 9.0, 2.2, 1.1, 0.7, 0.10, gris, 3.2, 6.0, 0);           // cara inferior clara
    B(g, 0.55, 1.6, 1.1, arena, 0, 4.9, 6.0);                       // manchon en la deriva
    return g;
  }

  function modelJet() {
    const g = new THREE.Group();
    const gry = '#6a7570', gry2 = '#59645f', dk = '#454f4b', belly = '#9aa5a0';
    // EL CAZA GENERICO DEL PASILLO — y ahora GENERICO de verdad (PLAN_HORNEADO B3). Hasta B3 este
    // modelo hacia dos trabajos: era el caza anonimo del pasillo Y era el Harrier de LA COLA, asi
    // que llevaba las señas del Harrier (tomas de barril enormes, ala anhedra) sin ser ninguno de
    // los dos. Ahora el Harrier tiene su modelo (tools/models/harrier.js) y este se queda con lo
    // que le corresponde: un caza de linea, que es lo que el pasillo necesita — algo que se lee
    // como "avion enemigo" en tres cuadros y no compite por la atencion.
    //
    // Y SE DIFERENCIA A PROPOSITO, porque los dos pueden estar en el mismo cuadro: fuselaje FINO
    // (no panzon), ala al MEDIO con diedro POSITIVO (no alta y caida), tomas chatas pegadas al
    // costado (no barriles) y UNA sola tobera atras (no cuatro en la cintura). Punto por punto, lo
    // contrario de las seis señas del Harrier.
    CYL(g, 0.30, 0.34, 5.0, gry, 0, 0, 0.2, 12);                      // fuselaje largo y fino
    CONE(g, 0.30, 1.7, gry, 0, 0, -3.1, false, 12);                   // nariz AFILADA
    WING(g, 5.6, 2.0, 0.55, 2.0, 0.14, gry2, 0.02, 0.75, 4);          // ala al medio, diedro leve
    WING(g, 5.6, 2.0, 0.55, 2.0, 0.03, belly, -0.05, 0.75, 4);
    WING(g, 2.2, 0.85, 0.4, 0.75, 0.1, gry2, 0.04, 2.35, 4);          // estabilizador
    FIN(g, 1.5, 1.3, 0.45, 1.0, 0.10, gry, 0.16, 2.2);                // deriva alta en flecha
    DOME(g, 0.30, CANOPY, 0, 0.32, -1.65, 0.8, 0.85, 1.9);            // cabina baja y estirada
    // TOMAS CHATAS pegadas al costado, no barriles: dos cuñas que apenas sobresalen
    for (const sg of [-1, 1]) {
      const t = B(g, 0.26, 0.34, 1.5, gry2, sg * 0.44, 0.02, -0.9);
      t.rotation.y = sg * 0.06;
      B(g, 0.1, 0.24, 0.1, '#1c211e', sg * 0.56, 0.02, -1.62);        // la boca, chica
    }
    CYL(g, 0.30, 0.26, 0.5, dk, 0, 0, 2.9, 10);                       // UNA tobera, atras
    return g;
  }

  function modelRadar(ang) {
    const g = new THREE.Group();
    const grn = '#5d6152', grn2 = '#6f7362', cab = '#4a4e42';
    B(g, 2.4, 1.0, 4.2, grn, 0, 0.5, 0.3);                             // caja
    B(g, 2.4, 0.12, 4.2, grn2, 0, 1.06, 0.3);
    B(g, 2.2, 1.0, 1.4, cab, 0, 0.5, -2.4);                            // cabina
    B(g, 1.9, 0.45, 0.1, '#9fb6bd', 0, 0.62, -3.11);                   // parabrisas
    WHEEL(g, 0.5, 0.35, -1.05, 0, -1.6); WHEEL(g, 0.5, 0.35, 1.05, 0, -1.6);
    WHEEL(g, 0.5, 0.35, -1.05, 0, 1.5); WHEEL(g, 0.5, 0.35, 1.05, 0, 1.5);
    POST(g, 0.14, 0.2, 1.4, '#3a3e34', 0, 1.7, 0.6);                   // mastil
    const dish = new THREE.Group(); dish.position.set(0, 2.5, 0.6); dish.rotation.y = ang; g.add(dish);
    // el plato: rejilla curva (media luna extruida) + bocina al frente
    const m = add(dish, new THREE.CylinderGeometry(1.5, 1.5, 0.16, 14, 1, false, 0, Math.PI), '#8a9299', 0, 0, 0);
    m.rotation.x = Math.PI / 2; m.rotation.z = Math.PI;
    B(dish, 0.5, 0.4, 0.14, '#aab2b8', 0, 0.35, 0.15);
    return g;
  }

  // CAMION ANTIAEREO: chasis con torreta de dos caños atras. `ang` = yaw de la torreta
  // (3 poses = la torreta BARRE el cielo buscandote).
  function modelAATruck(ang) {
    const g = new THREE.Group();
    const grn = '#575b48', grn2 = '#696d58', cab = '#43473a';
    B(g, 2.5, 0.9, 4.6, grn, 0, 0.45, 0.2);                            // chasis
    B(g, 2.5, 0.12, 4.6, grn2, 0, 0.96, 0.2);
    B(g, 2.3, 1.05, 1.5, cab, 0, 0.55, -2.55);                         // cabina
    B(g, 2.0, 0.45, 0.1, '#9fb6bd', 0, 0.7, -3.31);
    WHEEL(g, 0.52, 0.35, -1.1, 0, -1.8); WHEEL(g, 0.52, 0.35, 1.1, 0, -1.8);
    WHEEL(g, 0.52, 0.35, -1.1, 0, 1.2); WHEEL(g, 0.52, 0.35, 1.1, 0, 1.2);
    WHEEL(g, 0.52, 0.35, -1.1, 0, 2.2); WHEEL(g, 0.52, 0.35, 1.1, 0, 2.2);
    const tur = new THREE.Group(); tur.position.set(0, 1.35, 1.1); tur.rotation.y = ang; g.add(tur);
    B(tur, 1.3, 0.7, 1.3, cab, 0, 0.2, 0);                             // cuna de la torreta
    for (const sg of [-1, 1]) {                                        // dos caños apuntando alto
      const c = CYL(tur, 0.09, 0.11, 2.2, '#2b3338', sg * 0.3, 0.85, -0.7, 6);
      c.rotation.x = Math.PI / 2 - 0.85;                               // ~49° al cielo
    }
    return g;
  }

  // BARCAZA DE DESEMBARCO (LCU): casco chato, rampa de proa (hacia -z: la playa), timonera a
  // popa y bordas altas. Se hornea apenas girada (3/4) para que se lea el volumen.
  function modelLcu() {
    const g = new THREE.Group();
    const hull = '#6b7566', hull2 = '#7f8975', dk = '#565f52';
    B(g, 2.6, 0.9, 6.4, hull, 0, 0.45, 0);                             // casco
    B(g, 2.6, 0.14, 6.4, hull2, 0, 0.97, 0);
    B(g, 0.18, 0.55, 5.6, hull2, -1.25, 1.15, 0.2);                    // bordas
    B(g, 0.18, 0.55, 5.6, hull2, 1.25, 1.15, 0.2);
    const ramp = B(g, 2.3, 0.16, 1.7, '#8a947f', 0, 1.15, -3.5);       // rampa apenas levantada
    ramp.rotation.x = -0.24;
    B(g, 1.5, 1.1, 1.2, dk, 0, 1.5, 2.5);                              // timonera
    B(g, 1.3, 0.35, 0.1, '#9fb6bd', 0, 1.75, 1.94);                    // ventanas
    POST(g, 0.05, 0.05, 1.1, dk, 0.5, 2.5, 2.7);                       // antena
    for (let i = 0; i < 3; i++) B(g, 0.5, 0.3, 0.4, '#7d7455', -0.6 + i * 0.6, 1.15, -1.2);  // cascos
    return g;
  }

  // GLOBO DE BARRERA: bolsa plateada con tres aletas de cola infladas.
  function modelBalloon() {
    const g = new THREE.Group();
    const sil = '#a3aeb4', sil2 = '#c3ced2', dk = '#7e8a90';
    DOME(g, 1.0, sil, 0, 0, -0.3, 1.0, 0.82, 1.75);                    // bolsa
    DOME(g, 0.58, sil2, 0, 0.38, -0.9, 1.15, 0.55, 1.15);              // brillo del lomo
    CONE(g, 0.5, 1.0, dk, 0, -0.05, 1.45, true, 8);                    // cola que se afina
    for (let i = 0; i < 3; i++) {                                      // 3 aletas infladas a 120°
      const a = i * Math.PI * 2 / 3 + Math.PI / 2;                     // una vertical, dos abajo
      const f = DOME(g, 0.52, i ? sil : sil2, Math.cos(a) * 0.72, Math.sin(a) * 0.72, 1.5, 0.42, 1.0, 1.5);
      f.rotation.z = a - Math.PI / 2;
    }
    return g;
  }

  // NIDO ANTIAEREO: anillo de bolsas de arena, pedestal y caños gemelos al cielo.
  // `ang` = yaw de los caños (2 poses: la pieza corrige el apunte).
  function modelAA(ang) {
    const g = new THREE.Group();
    const sand = '#8a7c58', sand2 = '#a4956e', metal = '#3d423b';
    for (let i = 0; i < 8; i++) {                                      // anillo de bolsas
      const a = i * Math.PI / 4;
      const b = B(g, 1.3, 0.62, 0.62, i % 2 ? sand : sand2, Math.cos(a) * 1.55, 0.3, Math.sin(a) * 1.55);
      b.rotation.y = -a + Math.PI / 2;
      B(g, 1.0, 0.5, 0.55, i % 2 ? sand2 : sand, Math.cos(a) * 1.5, 0.75, Math.sin(a) * 1.5).rotation.y = -a + Math.PI / 2;
    }
    const tur = new THREE.Group(); tur.position.set(0, 0.6, 0); tur.rotation.y = ang; g.add(tur);
    B(tur, 0.8, 0.9, 0.8, metal, 0, 0.4, 0);                           // pedestal
    B(tur, 1.1, 0.3, 0.6, '#4a5045', 0, 0.95, 0);                      // cuna
    for (const sg of [-1, 1]) {                                        // caños gemelos a ~50°
      const c = CYL(tur, 0.08, 0.10, 2.4, '#2b3338', sg * 0.22, 1.7, -0.75, 6);
      c.rotation.x = Math.PI / 2 - 0.9;
    }
    return g;
  }

  // CARPA britanica a dos aguas: dos faldones que se ENCUENTRAN en la cumbrera + hastiales
  // (los triangulos de las puntas) hechos con ShapeGeometry, que ya es un plano vertical — sin
  // pasar por PLATE, cuya rotacion interna compone mal con un segundo giro (la leccion euler).
  function modelTent() {
    const g = new THREE.Group();
    const lona = '#6d6f4e', lona2 = '#7d7f60', dk = '#20241c';
    const HALF = 1.15, RIDGE = 1.3, slope = Math.hypot(HALF, RIDGE), ang = Math.atan2(RIDGE, HALF);
    for (const sg of [-1, 1]) {                                        // faldones
      const f = B(g, slope, 0.1, 3.2, sg < 0 ? lona2 : lona, sg * HALF / 2, RIDGE / 2, 0);
      f.rotation.z = -sg * ang;
    }
    B(g, 0.2, 0.14, 3.3, '#8d8f70', 0, RIDGE, 0);                      // cumbrera
    const sh = new THREE.Shape();                                      // hastial (triangulo)
    sh.moveTo(-HALF + 0.06, 0); sh.lineTo(0, RIDGE - 0.06); sh.lineTo(HALF - 0.06, 0); sh.closePath();
    for (const zz of [-1.58, 1.55]) {
      const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), MAT(lona));
      m.position.set(0, 0, zz); g.add(m);
    }
    B(g, 0.66, 0.85, 0.1, dk, 0, 0.42, -1.6);                          // entrada oscura
    B(g, 2.9, 0.14, 3.6, '#5a5c42', 0, 0.07, 0);                       // faldon sucio al piso
    return g;
  }

  // DEPOSITO de suministros: galpon abovedado tipo nissen (boveda escalonada: a 48 px se lee
  // curva), porton oscuro y tambores apilados al costado.
  function modelDepot() {
    const g = new THREE.Group();
    const w1 = '#75705c', w2 = '#847e68', roof = '#4c4638', dk = '#2a2d24';
    B(g, 3.4, 1.1, 4.6, w1, 0, 0.55, 0);                               // cuerpo
    B(g, 2.9, 0.55, 4.6, w2, 0, 1.35, 0);                              // boveda: escalones
    B(g, 2.0, 0.42, 4.6, roof, 0, 1.82, 0);
    B(g, 1.0, 0.26, 4.6, '#5a5444', 0, 2.13, 0);
    B(g, 1.2, 0.95, 0.14, dk, 0, 0.48, -2.32);                         // porton
    for (let i = 0; i < 3; i++) {                                      // tambores
      POST(g, 0.28, 0.28, 0.8, i % 2 ? '#6d7a4a' : '#7d8a55', 2.1 + (i % 2) * 0.5, 0.4, -0.8 + i * 0.7, 8);
    }
    B(g, 0.8, 0.7, 0.8, '#7a6b4e', -2.25, 0.35, -1.2);                 // cajones
    B(g, 0.6, 0.5, 0.6, '#8a7a5a', -2.2, 0.95, -1.15);
    return g;
  }

  // PUESTO britanico: bloque de chapa a dos plantas, techo con alero, ventanas oscuras y
  // bolsas de arena al pie. El soldado asomado y su fogonazo siguen por codigo (o.armed).
  function modelBldg() {
    const g = new THREE.Group();
    const wall = '#6e6656', wall2 = '#7d7563', roof = '#463f31', dk = '#23271f';
    B(g, 3.0, 2.6, 2.4, wall, 0, 1.3, 0);                              // cuerpo
    B(g, 3.0, 0.5, 2.4, wall2, 0, 2.35, 0);                            // franja alta iluminada
    B(g, 3.4, 0.3, 2.8, roof, 0, 2.75, 0);                             // techo con alero
    B(g, 0.6, 0.95, 0.12, '#2a2d24', 0, 0.48, -1.22);                  // puerta
    for (const sx of [-1.0, 1.0]) B(g, 0.62, 0.5, 0.12, dk, sx, 1.7, -1.22);   // ventanas
    for (let i = 0; i < 4; i++)                                        // bolsas al pie
      B(g, 0.7, 0.34, 0.5, i % 2 ? '#8a7c58' : '#a4956e', -1.3 + i * 0.85, 0.17, -1.35);
    return g;
  }

  // FRAGATA vista de proa: el casco del mastil de mar abierto. El MASTIL va POR CODIGO encima
  // (su altura se sortea 11-28 por spawn: un sprite fijo la aplastaria) — esto es solo el buque.
  function modelFragata() {
    const g = new THREE.Group();
    const hull = '#4c5b60', hull2 = '#5c6e73', sup = '#6b7a80';
    const h = DOME(g, 1.0, hull, 0, 0.3, 0, 2.6, 0.9, 3.2);            // casco (proa afilada por escala z)
    B(g, 4.6, 0.34, 5.2, hull2, 0, 1.02, 0.3);                         // cubierta
    B(g, 1.9, 0.9, 2.0, sup, 0, 1.6, 0.9);                             // superestructura
    B(g, 1.2, 0.5, 1.1, '#7b8a90', 0, 2.25, 1.0);                      // puente
    B(g, 1.05, 0.22, 0.14, '#20282c', 0, 2.3, 0.42);                   // ventanas del puente
    POST(g, 0.10, 0.14, 0.8, '#3a4448', 0, 1.4, -0.9, 6);              // pieza de proa
    B(g, 0.7, 0.3, 0.9, '#3a4448', 0, 1.35, -0.85);
    return g;
  }

  return { modelHelo, modelHercules, modelJet, modelRadar, modelAATruck, modelLcu, modelBalloon, modelAA, modelTent, modelDepot, modelBldg, modelFragata };
});
