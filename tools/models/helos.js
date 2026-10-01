// LOS HELICOPTEROS BRITANICOS — los cinco tipos de Malvinas (pedido del autor 30/9, con la lamina
// de la Royal Navy y el Army Air Corps). Hasta hoy habia UN helicoptero generico (`modelHelo` en
// enemies.js, una silueta de Sea King en verde) y era todos los helicopteros del juego.
//
// Cada uno con lo que lo hace leerse a 40 px, que no es el detalle sino la SILUETA y el COLOR:
//   SEA KING   el grande: casco de bote, sponsons con ruedas, el domo del radar en el lomo, rotor
//              de cinco palas. Gris azulado de la Royal Navy.
//   WESSEX     la NARIZ CAIDA con el motor adentro y la cabina trepada arriba, como un perro
//              olfateando. Verde de los comandos (las letras "UV" no entran a esta escala).
//   SEA LYNX   chico y compacto, con la deriva alta y tren de triciclo. Azul de la flota.
//   GAZELLE    la BURBUJA de vidrio adelante y el FENESTRON (el rotor de cola metido en la deriva).
//              Camuflado verde y negro del Ejercito.
//   SCOUT      el mas chico: cabina con montantes, el motor al aire atras, patines.
//
// LAS MEDIDAS SON LAS REALES, en la escala del helicoptero de siempre (1 unidad ≈ 3,15 m: el rotor
// del Sea King, 18,9 m, mide 3 de radio). La DIFERENCIA DE TAMAÑO EN PANTALLA la aplasta el `wu` de
// cada hoja (render/enemies.js): los cinco comparten la misma caja de choque, y un Scout a escala
// real seria la mitad que su hitbox — te chocaria algo que no se ve.
//
// Todos con la nariz hacia -z (el horneador los da vuelta) y `phase` 0/1 para las palas: dos angulos
// alternados = el rotor BATE, como en el helicoptero de siempre.
'use strict';
BAKE.modelos('helos', (THREE, K) => {
  const { add, B, CYL, POST, DOME, FIN, WHEEL } = K;
  const CANOPY = BAKE.PAL.canopy;
  const PALA = '#262b29';

  /** ROTOR PRINCIPAL: el barrido translucido y `n` palas giradas por fase. */
  function rotor(g, r, n, y, z, phase) {
    const disc = add(g, new THREE.CylinderGeometry(r, r, 0.04, 20), '#aeb6ae', 0, y, z);
    disc.material.transparent = true; disc.material.opacity = 0.16;
    POST(g, 0.1, 0.13, 0.4, '#3a403d', 0, y - 0.2, z);
    for (let i = 0; i < n; i++) {
      const a = (phase ? Math.PI / n : 0) + i * Math.PI * 2 / n;
      const b = B(g, 0.15, 0.05, r, PALA, Math.sin(a) * r / 2, y + 0.01, z + Math.cos(a) * r / 2);
      b.rotation.y = a;
    }
  }
  /** ROTOR DE COLA: palas en el plano vertical, al costado de la deriva. */
  function rotorCola(g, r, n, x, y, z, phase) {
    for (let i = 0; i < n; i++) {
      const a = (phase ? Math.PI / n : 0) + i * Math.PI * 2 / n;
      const b = B(g, 0.05, r, 0.12, PALA, x, y + Math.cos(a) * r / 2, z + Math.sin(a) * r / 2);
      b.rotation.x = a;
    }
  }
  /** LA ESCARAPELA britanica a los dos costados (azul, blanco, rojo). */
  function escarapela(g, x, y, z, s) {
    for (const sg of [-1, 1]) {
      [['#2d4a8a', s], ['#e8e6e0', s * 0.66], ['#b8302a', s * 0.33]].forEach(([c, r], i) => {
        const d = add(g, new THREE.CylinderGeometry(r, r, 0.02, 12), c, sg * (x + i * 0.012), y, z);
        d.rotation.z = Math.PI / 2;
      });
    }
  }
  /** Patines: dos montantes por lado y el tubo. */
  function patines(g, x, y, z0, z1, c) {
    for (const sg of [-1, 1]) {
      B(g, 0.08, 0.35, 0.08, c, sg * x, y + 0.18, z0 + 0.35);
      B(g, 0.08, 0.35, 0.08, c, sg * x, y + 0.18, z1 - 0.35);
      CYL(g, 0.05, 0.05, z1 - z0, c, sg * x, y, (z0 + z1) / 2, 6);
    }
  }

  // ---------------- SEA KING (Royal Navy) ----------------
  function seaKing(phase) {
    const g = new THREE.Group();
    const c = '#56626d', c2 = '#47515a';
    DOME(g, 1, c, 0, 0.1, -0.6, 0.95, 0.92, 2.35);                   // el fuselaje, largo y alto
    B(g, 1.6, 0.75, 3.6, c2, 0, -0.42, -0.7);                        // el casco de bote abajo
    DOME(g, 0.55, CANOPY, 0, 0.35, -2.75, 0.9, 0.52, 0.6);           // el parabrisas
    B(g, 1.1, 0.45, 1.7, c2, 0, 1.0, -0.8);                          // los dos motores en el lomo
    DOME(g, 0.42, '#8f979e', 0, 1.15, 0.65, 1, 0.55, 1);             // el domo del radar
    const cola = new THREE.Group(); cola.rotation.x = -0.12; g.add(cola);
    CYL(cola, 0.5, 0.26, 2.6, c, 0, 0.45, 2.75, 10);                 // el botalon, subiendo
    FIN(g, 1.25, 0.85, 0.5, 0.35, 0.1, c, 0.6, 3.85);                // la deriva
    rotorCola(g, 0.62, 5, 0.18, 1.45, 4.0, phase);
    for (const sg of [-1, 1]) {                                      // los sponsons con su rueda
      B(g, 0.55, 0.32, 0.95, c2, sg * 1.0, -0.4, -0.25);
      WHEEL(g, 0.22, 0.16, sg * 1.05, -0.75, -0.25);
    }
    B(g, 0.07, 0.95, 0.07, c2, 0, 0.0, 3.1);                         // la pata de cola…
    WHEEL(g, 0.16, 0.12, 0, -0.55, 3.1);                             // …y su rueda
    escarapela(g, 0.94, 0.35, 0.3, 0.3);
    rotor(g, 3.0, 5, 1.6, -0.6, phase);
    return g;
  }

  // ---------------- WESSEX (los comandos) ----------------
  function wessex(phase) {
    const g = new THREE.Group();
    const c = '#3f5b3f', c2 = '#314a31';
    DOME(g, 0.95, c, 0, 0.15, 0.1, 0.95, 0.95, 1.75);                // la cabina de carga
    const nariz = DOME(g, 0.72, c, 0, -0.2, -1.7, 0.9, 0.72, 1.25);  // LA NARIZ CAIDA, con el motor
    nariz.rotation.x = 0.22;
    for (const sg of [-1, 1]) CYL(g, 0.1, 0.12, 0.5, '#20251f', sg * 0.55, -0.15, -1.2, 6);   // escapes
    DOME(g, 0.5, CANOPY, 0, 0.78, -1.05, 0.85, 0.5, 0.75);           // la cabina, trepada arriba
    B(g, 0.75, 0.3, 0.9, c2, 0, 0.95, -0.7);
    const cola = new THREE.Group(); cola.rotation.x = -0.14; g.add(cola);
    CYL(cola, 0.45, 0.2, 2.5, c, 0, 0.35, 2.55, 10);
    FIN(g, 1.05, 0.7, 0.4, 0.3, 0.09, c, 0.55, 3.55);
    rotorCola(g, 0.55, 4, 0.16, 1.3, 3.7, phase);
    for (const sg of [-1, 1]) {
      B(g, 0.08, 0.6, 0.08, '#20251f', sg * 0.75, -0.65, -0.4);
      WHEEL(g, 0.22, 0.16, sg * 0.8, -0.95, -0.4);
    }
    B(g, 0.11, 0.95, 0.11, '#20251f', 0, 0.1, 3.3);                 // la pata de cola
    WHEEL(g, 0.14, 0.1, 0, -0.35, 3.3);
    escarapela(g, 0.92, 0.25, 0.4, 0.28);
    rotor(g, 2.7, 4, 1.4, -0.25, phase);
    return g;
  }

  // ---------------- SEA LYNX (de las fragatas) ----------------
  function seaLynx(phase) {
    const g = new THREE.Group();
    const c = '#4d6280', c2 = '#3e5069';
    DOME(g, 0.78, c, 0, 0.05, -0.35, 0.92, 0.88, 1.6);              // el cuerpo, compacto
    DOME(g, 0.48, c, 0, -0.12, -1.55, 0.9, 0.72, 0.85);             // la nariz
    DOME(g, 0.45, CANOPY, 0, 0.3, -1.3, 0.88, 0.55, 0.6);           // el parabrisas
    B(g, 0.85, 0.35, 1.1, c2, 0, 0.82, 0.0);                        // los motores
    const cola = new THREE.Group(); cola.rotation.x = -0.1; g.add(cola);
    CYL(cola, 0.32, 0.17, 2.0, c, 0, 0.3, 1.95, 10);
    FIN(g, 1.0, 0.65, 0.4, 0.25, 0.08, c, 0.45, 2.95);              // la deriva ALTA
    B(g, 1.0, 0.05, 0.3, c, 0, 1.2, 3.05);                          // el estabilizador arriba
    rotorCola(g, 0.48, 4, 0.15, 1.05, 3.1, phase);
    WHEEL(g, 0.16, 0.12, 0, -0.8, -1.25);                           // tren de triciclo
    for (const sg of [-1, 1]) WHEEL(g, 0.2, 0.14, sg * 0.7, -0.8, 0.25);
    escarapela(g, 0.72, 0.15, 0.1, 0.24);
    rotor(g, 2.03, 4, 1.2, -0.3, phase);
    return g;
  }

  // ---------------- GAZELLE (Army Air Corps) ----------------
  function gazelle(phase) {
    const g = new THREE.Group();
    const c = '#4c5b3b', neg = '#25291f';
    DOME(g, 0.64, CANOPY, 0, 0.15, -0.75, 0.9, 0.86, 1.1);          // LA BURBUJA de vidrio
    B(g, 0.06, 0.6, 0.06, neg, 0, 0.45, -1.2);                      // el montante del medio
    DOME(g, 0.62, c, 0, 0.1, 0.15, 0.86, 0.85, 1.2);                // el cuerpo
    B(g, 0.55, 0.38, 0.85, neg, 0, 0.66, 0.4);                      // el motor
    for (const [x, y, z] of [[0.5, 0.2, 0.2], [0.42, -0.1, 0.7]]) { // los manchones del camuflado
      B(g, 0.04, 0.32, 0.45, neg, x, y, z); B(g, 0.04, 0.32, 0.45, neg, -x, y, z);
    }
    const cola = new THREE.Group(); cola.rotation.x = -0.08; g.add(cola);
    CYL(cola, 0.24, 0.12, 2.0, c, 0, 0.22, 1.8, 8);
    B(g, 0.14, 0.95, 0.75, c, 0, 0.5, 2.85);                        // la deriva…
    const fen = add(g, new THREE.CylinderGeometry(0.26, 0.26, 0.16, 12), neg, 0, 0.42, 2.85);
    fen.rotation.z = Math.PI / 2;                                   // …con el FENESTRON adentro
    B(g, 0.95, 0.05, 0.25, c, 0, 0.16, 2.45);                       // el estabilizador
    patines(g, 0.5, -0.62, -1.0, 0.8, neg);
    rotor(g, 1.67, 3, 1.0, -0.05, phase);
    return g;
  }

  // ---------------- SCOUT (Army Air Corps) ----------------
  function scout(phase) {
    const g = new THREE.Group();
    const c = '#56613f', c2 = '#444d33', neg = '#23271d';
    DOME(g, 0.6, c, 0, 0, -0.35, 0.88, 0.85, 1.3);                  // la cabina
    DOME(g, 0.5, CANOPY, 0, 0.15, -0.75, 0.86, 0.72, 0.85);         // las ventanas…
    for (const z of [-0.95, -0.5]) B(g, 1.0, 0.5, 0.05, neg, 0, 0.2, z);   // …con sus montantes
    B(g, 0.5, 0.42, 0.95, c2, 0, 0.55, 0.4);                        // el motor al aire, atras
    CYL(g, 0.12, 0.12, 0.4, neg, 0, 0.55, 1.0, 6);                  // el escape
    const cola = new THREE.Group(); cola.rotation.x = -0.06; g.add(cola);
    CYL(cola, 0.2, 0.11, 1.8, c, 0, 0.12, 1.6, 8);
    B(g, 0.08, 0.6, 0.4, c, 0, 0.42, 2.5);                          // la deriva chica
    rotorCola(g, 0.42, 2, 0.1, 0.48, 2.6, phase);
    patines(g, 0.5, -0.62, -0.9, 0.6, neg);
    rotor(g, 1.56, 4, 0.9, -0.3, phase);
    return g;
  }

  return { seaKing, wessex, seaLynx, gazelle, scout };
});
