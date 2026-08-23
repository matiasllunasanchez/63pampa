// CATALOGO DE MODELOS — LOS AVIONES JUGABLES (PLAN_HORNEADO B0).
// Los seis del roster mas las cinco skins de campaña, como ensamblajes procedurales de
// primitivas de three.js. No hay GLB en el proyecto: el modelo ES este codigo.
//
// POR QUE VIVEN ACA Y NO ADENTRO DEL HTML. Un horneador es un encuadre (que camara, que poses,
// que grilla); un modelo es una silueta. Mezclados, el dia que el runtime 3D quiera el mismo
// casco que el sprite del pasillo tiene que copiarlo — que es exactamente lo que B2 quiere
// evitar. Separados, `ship3d.js` puede pedir el mismo constructor: recibe THREE por parametro,
// igual que el horneador.
//
// FORMA DEL CATALOGO: `BAKE.modelos(familia, (THREE, K) => ({ nombre: (…) => Group }))`.
// K es el kit de primitivas de tools/bake_common.js. Cada entrada devuelve un THREE.Group con la
// NARIZ HACIA -Z; quien lo hornea decide desde donde mirarlo.
'use strict';
BAKE.modelos('planes', (THREE, K) => {
  const { MAT, EMIT, add, addEmit, B, CYL, CONE, DOME, PLATE, WING, FIN } = K;

  // LA PALETA VIVE EN EL HORNO (tools/bake_common.js, BAKE.PAL): es la misma para las cuatro
  // familias horneadas, que es la regla 1 del plan. Aca solo se le ponen nombres cortos.
  // BANDERA EN LA DERIVA: celeste / blanco / celeste, como la llevan los aviones argentinos.
  // Va en TODOS los modelos, es la unica marca comun del roster. Reemplazo la banda de acento
  // naranja que habia antes — era un color inventado que no significaba nada.
  // El sol de mayo NO se modela: a 84 px la deriva mide 2 px de ancho y seria un pixel sucio.
  const CANOPY = BAKE.PAL.canopy, ACCENT = BAKE.PAL.accent, EXHAUST = BAKE.PAL.escape;
  const CELESTE = BAKE.PAL.celeste, BLANCO = BAKE.PAL.blanco;
  /** Tres franjas horizontales sobre la deriva. `y` es el centro del conjunto. */
  function flagTail(g, y, z, d) {
    const h = 0.11, w = 0.14;                                    // w > espesor de la deriva (0.11)
    B(g, w, h, d, CELESTE, 0, y + h, z);
    B(g, w, h, d, BLANCO,  0, y,     z);
    B(g, w, h, d, CELESTE, 0, y - h, z);
  }

  // ---------- modelos (vista trasera: nariz hacia -z, cola hacia +z/camara) ----------
  // La camara mira DESDE ATRAS y un poco por arriba, asi que lo que se lee a 84x48 es, en orden:
  // la silueta del ala, la deriva, el redondeo del fuselaje y la boca de escape. El detalle
  // chico (paneles, escarapelas) se pierde — por eso el presupuesto de poligonos va al VOLUMEN.

  /** Escape comun a todos: anillo metalico + boca hundida + LA TURBINA ENCENDIDA.
   *
   *  La camara mira al avion DESDE ATRAS, asi que la tobera apunta justo a ella: es el unico
   *  lugar del sprite donde se puede ver que el motor esta funcionando. Antes era un cono casi
   *  negro y el avion se veia apagado, planeando. Ahora tiene tres capas de calor —el rojo
   *  profundo del fondo, el naranja del anillo interior y el blanco del nucleo— que es como se
   *  lee una turbina al ralenti. El postquemador NO va aca: eso es la llama de render/plane.js,
   *  que sale de esta misma boca y crece con el turbo. */
  function nozzle(g, r, z, ring, dark) {
    CYL(g, r, r * 0.92, 0.5, ring, 0, 0, z, 12);
    CYL(g, r * 0.66, r * 0.66, 0.26, dark, 0, 0, z + 0.2, 12);
    // EL FONDO ROJO de la tobera: lo mas profundo, lo mas apagado
    addEmit(g, new THREE.CircleGeometry(r * 0.60, 12), '#b8341a', 0, 0, z + 0.30);
    // el anillo NARANJA a media profundidad
    addEmit(g, new THREE.CircleGeometry(r * 0.42, 12), '#f07a22', 0, 0, z + 0.33);
    // y el NUCLEO caliente, chico y blanco: es el punto que delata que el motor esta prendido
    addEmit(g, new THREE.CircleGeometry(r * 0.20, 10), '#ffe6a8', 0, 0, z + 0.36);
  }
  /** Tanque subalar / pod: cilindro con punta y cola conicas. */
  function tank(g, r, len, c, x, y, z) {
    CYL(g, r, r, len, c, x, y, z, 8);
    CONE(g, r, r * 2.4, c, x, y, z - len / 2 - r * 1.2, false, 8);
    CONE(g, r, r * 1.6, c, x, y, z + len / 2 + r * 0.8, true, 8);
  }

  // A-4 SKYHAWK (camo FAA) y A-4Q (esquema naval de la Armada): misma celula, distinta pintura.
  // Rasgos que lo identifican: delta RECORTADO muy corto, estabilizador ALTO sobre la deriva,
  // tomas de aire laterales tipo "oreja" pegadas a la cabina y fuselaje corto y rechoncho.
  function modelA4(camoA, camoB, patch, belly, marcas) {
    const g = new THREE.Group();
    CYL(g, 0.42, 0.40, 5.0, camoA, 0, 0, 0.1, 12);              // fuselaje redondo
    CONE(g, 0.40, 1.5, camoA, 0, 0, -3.15, false, 12);          // morro afinado
    CYL(g, 0.30, 0.26, 0.5, camoB, 0, -0.02, -3.85, 10);        // tubo de pitot / punta
    // ALA: delta recortado, de una pieza, BAJA y con anhedral leve. El comentario ya decia
    // "con anhedral leve" pero no se pasaba el parametro, asi que salia PLANA — el mismo vicio
    // que tenia el Harrier, donde el comentario afirmaba lo que el codigo no hacia. En las fotos
    // el ala del A-4 va casi recta con apenas caida hacia la punta: eso es un 4, no un 11.
    WING(g, 5.1, 2.5, 0.85, 1.5, 0.14, camoB, -0.16, 0.85, 4);
    WING(g, 5.1, 2.5, 0.85, 1.5, 0.03, belly, -0.235, 0.85, 4);   // panza celeste asomando por debajo
    // CAMO: las manchas van a y=0.02, que es JUSTO ENCIMA de la cara superior del ala (el ala
    // arranca en -0.16 y tiene 0.17 de espesor -> su techo esta en 0.01). Puestas mas abajo
    // quedaban DENTRO del ala y el avion se veia de un solo color.
    B(g, 1.9, 0.05, 1.15, patch, -1.2, 0.02, 0.6);
    B(g, 1.45, 0.05, 0.95, patch, 1.35, 0.02, 1.05);
    B(g, 1.15, 0.05, 0.8, patch, 0.25, 0.02, 0.05);
    B(g, 0.9, 0.05, 0.7, patch, -2.0, 0.02, 1.2);
    CYL(g, 0.44, 0.42, 1.9, patch, 0, 0, -0.9, 12);             // banda de camo sobre el lomo
    // COLA: estabilizador ALTO — la firma del Skyhawk
    WING(g, 2.3, 0.95, 0.5, 0.5, 0.13, camoB, 0.95, 2.25);
    FIN(g, 1.35, 1.25, 0.55, 0.85, 0.11, camoA, 0.12, 2.1);
    flagTail(g, 1.28, 2.35, 0.5);                              // bandera en la deriva
    // CABINA: burbuja baja y corta
    DOME(g, 0.34, CANOPY, 0, 0.42, -1.5, 0.85, 0.8, 1.9);
    CYL(g, 0.30, 0.34, 1.4, camoA, 0, 0.22, -1.35, 10);         // lomo detras de la cabina
    // TOMAS DE AIRE laterales
    CYL(g, 0.27, 0.29, 1.5, camoB, -0.62, 0.10, -0.5, 8);
    CYL(g, 0.27, 0.29, 1.5, camoB, 0.62, 0.10, -0.5, 8);
    CYL(g, 0.19, 0.19, 0.3, '#1b1f17', -0.66, 0.10, -1.22, 8);
    CYL(g, 0.19, 0.19, 0.3, '#1b1f17', 0.66, 0.10, -1.22, 8);
    // SONDA DE REABASTECIMIENTO EN VUELO: la lanza que sale a la derecha del morro. Es EL rasgo
    // de estos aviones —en las fotos del Grupo 5 es lo primero que se ve— y ademas SIGNIFICA
    // algo en este juego, que tiene a la Chancha. Va apenas por fuera del radio del fuselaje
    // (0.42) para que se despegue del bulto y no se lea como un pixel sucio pegado al morro.
    CYL(g, 0.075, 0.065, 0.4, camoA, 0.5, 0.08, -2.25, 6);            // la base, gruesa
    CYL(g, 0.05, 0.042, 2.1, camoB, 0.5, 0.08, -3.3, 6);              // el tubo
    CONE(g, 0.075, 0.26, '#2b2f28', 0.5, 0.08, -4.45, false, 6);      // la boquilla
    tank(g, 0.17, 1.5, belly, -1.45, -0.42, 0.5);
    tank(g, 0.17, 1.5, belly, 1.45, -0.42, 0.5);
    nozzle(g, 0.34, 2.75, camoB, '#25291f');
    if (marcas) marcas(g);
    return g;
  }

  // IAI DAGGER (Mirage 5, camo desierto israeli): DELTA PURO, sin estabilizador horizontal —
  // esa ausencia es lo que lo distingue del A-4 de un vistazo.
  function modelDagger() {
    const g = new THREE.Group();
    // camo argentino del Dagger: VERDE oscuro con manchas AMARILLO ARENA y panza gris azulada.
    // (la primera version salio marron: era el esquema desierto israeli, no el de la FAA)
    const grn = '#4e6136', yel = '#c0ab5e', grn2 = '#3d4d2c', belly = '#93a3ae';
    CYL(g, 0.36, 0.34, 5.6, grn, 0, 0.04, 0.1, 12);
    CONE(g, 0.34, 1.8, grn, 0, 0.04, -3.4, false, 12);         // morro largo (Mirage 5: sin radar grande)
    WING(g, 6.0, 4.6, 0.35, 3.9, 0.17, grn, -0.14, 0.9);       // DELTA: flecha fuerte, punta minima
    WING(g, 6.0, 4.6, 0.35, 3.9, 0.03, belly, -0.215, 0.9);
    // manchas AMARILLO ARENA, a y=0.04 (techo del delta: -0.14 + 0.17 = 0.03)
    B(g, 2.2, 0.05, 1.6, yel, -1.4, 0.04, 0.9);
    B(g, 1.8, 0.05, 1.3, yel, 1.5, 0.04, 1.2);
    B(g, 1.3, 0.05, 1.1, yel, -0.75, 0.04, -0.25);
    B(g, 1.1, 0.05, 0.9, grn2, 1.0, 0.04, 0.05);
    CYL(g, 0.38, 0.36, 2.0, yel, 0, 0.04, -1.1, 12);           // banda de camo sobre el lomo
    FIN(g, 1.65, 1.5, 0.6, 1.15, 0.11, grn, 0.16, 2.05);       // deriva alta y en flecha
    flagTail(g, 1.62, 2.35, 0.5);
    DOME(g, 0.30, CANOPY, 0, 0.44, -1.85, 0.85, 0.85, 2.0);
    CYL(g, 0.27, 0.32, 1.5, grn, 0, 0.26, -1.6, 10);
    CYL(g, 0.26, 0.28, 1.7, yel, -0.56, 0.12, -0.6, 8);       // tomas laterales semicirculares
    CYL(g, 0.26, 0.28, 1.7, yel, 0.56, 0.12, -0.6, 8);
    CYL(g, 0.18, 0.18, 0.3, '#221d15', -0.60, 0.12, -1.42, 8);
    CYL(g, 0.18, 0.18, 0.3, '#221d15', 0.60, 0.12, -1.42, 8);
    nozzle(g, 0.33, 3.0, yel, '#241f18');
    return g;
  }

  // SUPER ETENDARD (esquema Aeronavale): ala MEDIA en flecha con punta cortada, estabilizador
  // BAJO sobre el fuselaje, morro largo de radar y sonda de reabastecimiento sobre la nariz.
  function modelSuperE() {
    const g = new THREE.Group();
    const blu = '#4d5b66', blu2 = '#3e4b56', lite = '#7b8a94', belly = '#c3cad0';
    CYL(g, 0.40, 0.38, 5.0, blu, 0, 0, 0.1, 12);
    CONE(g, 0.38, 2.0, blu, 0, 0, -3.4, false, 12);             // morro largo de radar
    CYL(g, 0.09, 0.07, 1.1, '#2d353c', 0, 0.36, -3.3, 6);       // sonda de reabastecimiento
    WING(g, 5.0, 2.2, 0.9, 1.5, 0.17, blu2, 0.02, 0.55);        // ala media en flecha
    WING(g, 5.0, 2.2, 0.9, 1.5, 0.03, belly, -0.055, 0.55);
    B(g, 1.6, 0.05, 0.9, lite, -1.35, 0.20, 0.45);   // franja clara sobre el ala (techo en 0.19)
    WING(g, 2.4, 0.9, 0.45, 0.5, 0.13, blu2, 0.5, 2.15);        // estabilizador BAJO
    FIN(g, 1.45, 1.3, 0.55, 0.95, 0.11, blu, 0.14, 2.15);
    flagTail(g, 1.38, 2.4, 0.5);
    DOME(g, 0.33, CANOPY, 0, 0.42, -1.6, 0.85, 0.8, 1.9);
    CYL(g, 0.30, 0.34, 1.4, blu, 0, 0.22, -1.45, 10);
    CYL(g, 0.27, 0.29, 1.5, lite, -0.60, 0.12, -0.5, 8);
    CYL(g, 0.27, 0.29, 1.5, lite, 0.60, 0.12, -0.5, 8);
    CYL(g, 0.19, 0.19, 0.3, '#1a2026', -0.64, 0.12, -1.22, 8);
    CYL(g, 0.19, 0.19, 0.3, '#1a2026', 0.64, 0.12, -1.22, 8);
    tank(g, 0.18, 1.6, blu2, -1.5, -0.30, 0.5);                 // el Exocet / tanque bajo el ala
    tank(g, 0.18, 1.6, blu2, 1.5, -0.30, 0.5);
    nozzle(g, 0.34, 2.75, lite, '#1e252b');
    return g;
  }

  // PAMPA IA-63 (entrenador): ala ALTA RECTA sin flecha, biplaza en tandem (cabina larga),
  // cola convencional. Es el unico del roster que no es de combate puro y tiene que notarse.
  function modelPampa() {
    const g = new THREE.Group();
    // el Pampa del juego va GRIS con camuflaje VERDE (no el blanco de escuela); el naranja
    // queda solo como marca de puntas y deriva.
    const gry = '#8e979e', grn = '#55663d', org = '#e07030', dk = '#6d767d';
    CYL(g, 0.38, 0.35, 4.6, gry, 0, 0, 0.1, 12);
    CONE(g, 0.35, 1.5, gry, 0, 0, -3.0, false, 12);
    WING(g, 5.3, 1.35, 1.0, 0.15, 0.17, gry, 0.30, 0.35);       // ala ALTA y RECTA (sin flecha)
    B(g, 1.9, 0.05, 1.15, grn, -1.15, 0.475, 0.35);             // camo VERDE sobre el ala gris
    B(g, 1.5, 0.05, 1.0, grn, 1.3, 0.475, 0.35);
    B(g, 0.75, 0.06, 1.25, org, -2.2, 0.475, 0.35);             // puntas naranjas (marca de escuela)
    B(g, 0.75, 0.06, 1.25, org, 2.2, 0.475, 0.35);
    CYL(g, 0.39, 0.36, 1.9, grn, 0, 0, -1.0, 12);               // banda verde sobre el lomo
    WING(g, 2.4, 0.85, 0.55, 0.3, 0.13, gry, 0.36, 2.0);
    B(g, 0.6, 0.06, 0.7, org, -1.05, 0.435, 2.0);
    B(g, 0.6, 0.06, 0.7, org, 1.05, 0.435, 2.0);
    FIN(g, 1.3, 1.15, 0.6, 0.7, 0.11, gry, 0.14, 1.95);
    flagTail(g, 1.20, 2.10, 0.45);
    B(g, 0.13, 0.45, 0.8, org, 0, 1.2, 2.0);                    // banda naranja de la deriva
    DOME(g, 0.36, CANOPY, 0, 0.44, -1.2, 0.8, 0.8, 2.6);        // cabina LARGA (biplaza)
    CYL(g, 0.30, 0.34, 1.5, gry, 0, 0.22, -1.1, 10);
    CYL(g, 0.25, 0.27, 1.3, gry, -0.56, 0.18, -0.35, 8);
    CYL(g, 0.25, 0.27, 1.3, gry, 0.56, 0.18, -0.35, 8);
    CYL(g, 0.17, 0.17, 0.3, '#282d33', -0.60, 0.18, -0.98, 8);
    CYL(g, 0.17, 0.17, 0.3, '#282d33', 0.60, 0.18, -0.98, 8);
    B(g, 0.85, 0.10, 0.45, org, 0, 0.20, -2.5);                 // franja naranja del morro
    nozzle(g, 0.30, 2.5, gry, '#2b3036');
    return g;
  }

  // MIRAGE IIIEA (camo verde/marron de la FAA): misma familia que el Dagger, pero con el morro
  // de RADAR mas voluminoso y el camo argentino. Delta puro, sin estabilizador.
  // MIRAGE 5P «MARA» — los diez que mando el Peru (GUION_3 M10). Dos diferencias a proposito
  // contra el Mirage III que habia aca antes:
  //   1. SIN RADOMO. El 5 es la variante de ATAQUE: le sacaron el radar de intercepcion y la
  //      trompa es lisa y mas afilada. Es la unica diferencia de silueta que se lee a 84 px.
  //   2. SIN CAMUFLAJE GASTADO. En la escena estos aviones acaban de aterrizar "prolijos,
  //      brillantes, sin una marca de uso", con la escarapela argentina recien pintada. Que
  //      parezcan NUEVOS al lado de los A-4 percudidos ES el cuadro.
  function modelMirage() {
    const g = new THREE.Group();
    const gry = '#b9c0c4', dgry = '#8e979d', sand = '#c9bda2', belly = '#d3d9dc';
    CYL(g, 0.36, 0.34, 5.6, gry, 0, 0.04, 0.1, 12);
    CONE(g, 0.35, 1.9, gry, 0, 0.04, -3.45, false, 12);         // trompa LISA y mas larga: sin radar
    WING(g, 6.1, 4.7, 0.35, 4.0, 0.17, gry, -0.14, 0.95);       // DELTA puro
    WING(g, 6.1, 4.7, 0.35, 4.0, 0.03, belly, -0.215, 0.95);
    // sin manchas de camo: dos bandas suaves apenas, para que el delta no quede plano
    B(g, 1.9, 0.05, 1.3, sand, -1.35, 0.04, 1.0);
    B(g, 1.6, 0.05, 1.1, sand, 1.45, 0.04, 1.2);
    CYL(g, 0.38, 0.36, 2.1, sand, 0, 0.04, -1.0, 12);           // lomo
    FIN(g, 1.7, 1.55, 0.6, 1.2, 0.11, gry, 0.16, 2.1);
    flagTail(g, 1.67, 2.4, 0.5);
    DOME(g, 0.30, CANOPY, 0, 0.46, -1.9, 0.85, 0.85, 2.0);
    CYL(g, 0.27, 0.32, 1.5, gry, 0, 0.28, -1.65, 10);
    CYL(g, 0.26, 0.28, 1.7, dgry, -0.56, 0.12, -0.65, 8);
    CYL(g, 0.26, 0.28, 1.7, dgry, 0.56, 0.12, -0.65, 8);
    CYL(g, 0.18, 0.18, 0.3, '#2b3236', -0.60, 0.12, -1.47, 8);
    CYL(g, 0.18, 0.18, 0.3, '#2b3236', 0.60, 0.12, -1.47, 8);
    tank(g, 0.17, 1.5, dgry, -1.5, -0.36, 0.6);
    tank(g, 0.17, 1.5, dgry, 1.5, -0.36, 0.6);
    nozzle(g, 0.33, 3.05, dgry, '#20261f');
    return g;
  }

  // ---------- MARCAS DE LOS FIELES DE PLATA ----------
  // Una por piloto, para poder distinguirlos EN VUELO (formacion de despegue, relevo,
  // persecucion). Todas viven en el ALA, y eso no es una preferencia estetica:
  //
  //   la camara mira desde ATRAS y 10 grados arriba (ver makeCam). A ese angulo la DERIVA se
  //   ve de canto —2 px de ancho— y el ALA se ve escorzada al ~18%. Medido horneando:
  //   una franja en la deriva es INVISIBLE a 84 px, y un dibujo sobre el ala se aplasta a
  //   nada. Lo unico que sobrevive es la variacion A LO LARGO DE LA ENVERGADURA.
  //
  // Por eso las marcas del guion que viven en el flanco del fuselaje —el terito, el anillo
  // rojo de la trompa, el matecito— NO pueden estar aca: ese flanco no se ve en ningun
  // alabeo. Siguen siendo canon para el arte dibujado (ver AVIONES_ESCUADRON.md); esto es
  // su traduccion a 84 px.
  const MRK_W = '#e8eef0', MRK_ROJO = '#c4402c', MRK_GRIS = '#9aa3a8';
  const MARCAS = {
    // TERO: dos manchas cortas junto a la raiz. Es la del jugador — se ve las 14 misiones,
    // asi que tiene que estar sin gritar.
    TERO:   g => { for (const sx of [-1, 1]) B(g, 0.34, 0.06, 1.10, MRK_W, sx * 0.95, 0.03, 0.75); },
    // PUMA: una banda LARGA y continua por ala. Es el eco de sus franjas de conduccion, que
    // van en la deriva y a esta escala no existen. Contra las dos manchas cortas de Tero se
    // distingue por longitud, que es lo unico que se lee a 3 px de alto.
    PUMA:   g => { for (const sx of [-1, 1]) B(g, 1.60, 0.06, 0.30, MRK_W, sx * 1.40, 0.03, 0.95); },
    // GITANO: puntas de ala rojas. La marca mas legible de las cinco, y el unico rojo de la
    // escuadrilla (regla de paleta: un solo rojo por escena).
    GITANO: g => { for (const sx of [-1, 1]) B(g, 0.55, 0.06, 0.70, MRK_ROJO, sx * 2.28, 0.025, 0.95); },
    // PICHON: el panel gris de imprimacion y un parche de metal desnudo, asimetricos: su
    // avion es el remendado.
    PICHON: g => { B(g, 0.80, 0.06, 0.70, MRK_GRIS, -1.55, 0.028, 0.80);
                   B(g, 0.40, 0.06, 0.40, '#b6bcc0', 1.30, 0.028, 0.35); },
    // VASCO no lleva marca: su distintivo es el CAMUFLAJE LAVADO de abajo. Es el mas viejo y
    // el unico sin nada personal — que es exactamente lo que dice de el el guion.
  };
  // EL CAMO DE LA FAA, contra las fotos del Grupo 5 (C-207, C-226, C-302 y las de reabastecimiento
  // en vuelo). Lo que estaba antes era OLIVO con manchitas marrones, y las fotos muestran lo
  // contrario: el MARRON manda —fuselaje entero, casi milanesa— y el verde entra como manchon.
  // Y la panza no es gris: es CELESTE, y se ve clarisimo en las tres fotos de abajo.
  //   [0] camoA  fuselaje, morro y lomo — el marron que domina
  //   [1] camoB  ala e intakes — el verde del otro tono
  //   [2] patch  manchones sobre el ala y la banda del lomo — marron sobre verde
  //   [3] belly  la panza CELESTE
  const CAMO_FAA = ['#6b5136', '#4c5a39', '#82603a', '#a6bed2'];
  // el mismo esquema DESGASTADO por el sol y la sal (el avion mas viejo de la escuadrilla)
  const CAMO_LAVADO = ['#7d6449', '#616d51', '#96795a', '#bed0de'];

  const MODELS = {
    sky: () => modelA4(...CAMO_FAA),                                  // FAA: camo MARRON + VERDE, panza celeste
    dagger: modelDagger,
    supere: modelSuperE,
    a4q: () => modelA4('#b4bcc2', '#c2c9ce', '#9aa4ab', '#dfe3e6'),   // Armada: PLATEADO / gris claro (sin camo)
    pampa: modelPampa,
    mirage: modelMirage,
    // las cinco variantes del A-4 de campaña, una por Fiel (ver MARCAS arriba)
    skin_tero:   () => modelA4(...CAMO_FAA, MARCAS.TERO),
    skin_puma:   () => modelA4(...CAMO_FAA, MARCAS.PUMA),
    skin_gitano: () => modelA4(...CAMO_FAA, MARCAS.GITANO),
    skin_pichon: () => modelA4(...CAMO_FAA, MARCAS.PICHON),
    skin_vasco:  () => modelA4(...CAMO_LAVADO),
  };

  return MODELS;
});
