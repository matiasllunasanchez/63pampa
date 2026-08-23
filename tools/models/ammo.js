// CATALOGO DE MODELOS — LA MUNICION (PLAN_HORNEADO B0).
// La bomba de la ristra y el misil del pasillo, como ensamblajes procedurales de primitivas de
// three.js. Se hornean a 16 px, no a 84: en pixel art el asset se hornea CERCA del tamaño al que
// se dibuja, y esto se dibuja entre 4 y 16 px.
//
// AMBOS SE ARMAN A LO LARGO DE Z CON LA NARIZ HACIA -Z, o sea alejandose de la camara: asi salen
// de abajo del avion. Las aletas de cola quedan mirando al jugador, que es lo unico que se lee.
//
// FORMA DEL CATALOGO: ver tools/models/planes.js.
'use strict';
BAKE.modelos('ammo', (THREE, K) => {
  const { add, addEmit } = K;
  /** Cilindro a lo LARGO DE Z (el eje del proyectil). */
  const CYL = (g, rT, rB, len, c, z, seg) => K.CYL(g, rT, rB, len, c, 0, 0, z, seg);
  /** Cono con la punta hacia -Z (la nariz). */
  const NOSE = (g, r, len, c, z, seg) => K.CONE(g, r, len, c, 0, 0, z, false, seg);
  /** CUATRO ALETAS EN CRUZ. `w` es lo que sobresale, `h` la cuerda. Se modelan las cuatro y no
   *  dos: de cola se ve la cruz entera, y es la unica cosa que distingue una bomba de un palo. */
  function aletas(g, r, w, h, esp, c, z) {
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      const m = add(g, new THREE.BoxGeometry(w, esp, h), c,
        Math.cos(a) * (r + w / 2), Math.sin(a) * (r + w / 2), z);
      m.rotation.z = a;
    }
  }

  // ---------------- LA BOMBA (la ristra del premio y de la PASADA) ----------------
  // Silueta de Mk-82: cuerpo gordo y corto, ojiva roma y cuatro aletas grandes atras. Lo que la
  // separa de un misil a 8 px es la PROPORCION —corta y ancha— y esas aletas, que son casi tan
  // anchas como el cuerpo. La banda amarilla es la marca de arma real (las de practica son
  // azules): a este tamaño es un pixel, pero es el pixel que dice "esto explota".
  function modelBomba() {
    const g = new THREE.Group();
    // EL VERDE OLIVA REAL NO SE VE. Una Mk-82 es verde oscuro, pero el mar de este juego tambien
    // es oscuro: horneada con el color de archivo, la bomba era una mancha negra sobre negro.
    // Misma leccion que el humo de la estela — lo veridico no sirve si desaparece. Se sube el
    // tono lo justo para que recorte contra el agua, y el contraste se guarda para las aletas.
    const CUERPO = '#717865', OSCURO = '#41463a', BANDA = '#d8b246';
    CYL(g, 0.30, 0.30, 1.20, CUERPO, 0, 12);
    NOSE(g, 0.30, 0.62, CUERPO, -0.90, 12);            // ojiva roma
    CYL(g, 0.31, 0.31, 0.10, BANDA, -0.44, 12);        // banda de arma real
    CYL(g, 0.30, 0.22, 0.34, OSCURO, 0.76, 12);        // cono de cola
    aletas(g, 0.24, 0.30, 0.46, 0.05, OSCURO, 0.82);
    return g;
  }

  // ---------------- EL MISIL (el del pasillo) ----------------
  // Silueta de Exocet: LARGO y fino, blanco de crucero con ojiva gris, alas cortas a media
  // eslora y aletas de cola. Lo contrario de la bomba en las dos cosas que se leen: proporcion
  // y color. Y la tobera encendida atras — es lo unico que dice que va con motor y no cayendo.
  function modelMisil() {
    const g = new THREE.Group();
    const CUERPO = '#dfe6ea', OJIVA = '#9aa3ab', ALETA = '#c3cbd1';
    CYL(g, 0.20, 0.20, 2.00, CUERPO, 0, 12);
    NOSE(g, 0.20, 0.70, OJIVA, -1.34, 12);
    CYL(g, 0.205, 0.205, 0.08, '#5a6268', -0.10, 12);  // banda de union
    aletas(g, 0.17, 0.26, 0.34, 0.045, ALETA, 0.05);   // alas de crucero, a media eslora
    aletas(g, 0.17, 0.22, 0.30, 0.045, ALETA, 0.92);   // aletas de cola
    // LA TOBERA, encendida: mismo criterio que la del avion (material que no toma luz — el fuego
    // se ilumina solo). Tres capas, de lo mas profundo y apagado al nucleo blanco.
    addEmit(g, new THREE.CircleGeometry(0.17, 10), BAKE.PAL.fuegoHondo,  0, 0, 1.02);
    addEmit(g, new THREE.CircleGeometry(0.12, 10), BAKE.PAL.fuegoMedio,  0, 0, 1.04);
    addEmit(g, new THREE.CircleGeometry(0.06, 8),  BAKE.PAL.fuegoNucleo, 0, 0, 1.06);
    return g;
  }

  return { bomba: modelBomba, misil: modelMisil };
});
