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

  // ---------------- EL AIM-9L SIDEWINDER (el misil de los Sea Harrier) ----------------
  // De las fotos del autor (30/9/2026): la version de guerra, GRIS CLARO —la azul es la de
  // instruccion—, con la seccion de guiado gris plomo adelante y el domo del buscador oscuro.
  //
  // LO QUE LO DISTINGUE A 10 px, que es lo unico que importa horneado:
  //   · DOS CRUCES de aletas, no una. Los CANARDS en doble delta pegados a la nariz (con los que
  //     gobierna) y las ALAS de cola, trapezoidales, con los ROLLERONS —las ruedas en la punta que
  //     frenan el rolido—. De frente se ve la cruz chica de adelante; de cola, la grande de atras.
  //   · Las BANDAS de arma real: amarilla en la ojiva (explosivo) y marron en el motor (motor
  //     vivo). A este tamaño son un pixel cada una, y son los pixeles que dicen "esto es de verdad".
  //   · La TOBERA ENCENDIDA: el motor quema ~5 s, mas que cualquier vuelo del juego. De cola es lo
  //     primero que se ve — lo que se te viene encima desde atras es una llama con una cruz.
  //
  // EL GROSOR ESTA EXAGERADO (radio 0,10 contra 0,064 real) por la misma razon que el Exocet de
  // arriba: a escala real el cuerpo es una linea de pixel y medio, y un misil que no se lee como
  // un tubo se lee como una raya. El largo es el real (2,9).
  function modelAim9() {
    const g = new THREE.Group();
    const CUERPO = '#c9ced1', GUIA = '#4d555c', DOMO = '#2c3038', ALA = '#b3b9bd';
    const r = 0.10;
    // la NARIZ hacia -Z (se aleja de la camara en la vista 0, como toda la municion)
    K.DOME(g, r, DOMO, 0, 0, -1.34, 1, 1, 1.1);                 // el domo del buscador infrarrojo
    CYL(g, r, r, 0.50, GUIA, -1.10, 12);                        // seccion de guiado
    CYL(g, r, r, 0.42, CUERPO, -0.64, 12);                      // ojiva
    CYL(g, r + 0.004, r + 0.004, 0.06, '#d8b246', -0.70, 12);   // banda amarilla: explosivo real
    CYL(g, r, r, 1.80, CUERPO, 0.47, 12);                       // motor cohete (lo mas largo)
    CYL(g, r + 0.004, r + 0.004, 0.05, '#7a4a2a', -0.33, 12);   // banda marron: motor real
    CYL(g, r, r * 0.8, 0.10, GUIA, 1.42, 12);                   // la tobera
    // LAS DOS CRUCES. `cruz` arma cuatro superficies iguales a 90° alrededor del eje, desde una
    // planta en [lado, adelante] (adelante = hacia la nariz, o sea hacia -Z: ver PLATE).
    const cruz = (pts, c, z, esp) => {
      for (let i = 0; i < 4; i++) {
        const grp = K.PLATE(g, pts, esp, c, 0, 0, z);
        grp.rotation.z = i * Math.PI / 2 + Math.PI / 4;        // en X, como va montado
      }
    };
    // LAS ALETAS SON GRUESAS A PROPOSITO (0,08 contra ~0,01 reales). De cola y de nariz —las dos
    // vistas que mas se usan: el de atras se aleja casi de cola, el de frente viene casi de nariz—
    // las aletas se ven DE CANTO, y con su espesor real eran menos de un pixel: la primera hoja
    // horneada mostraba un punto rojo donde tenia que haber una cruz. La cruz ES el Sidewinder.
    // canards en DOBLE DELTA: el borde de ataque quiebra — punta aguda, despues se abre
    cruz([[r, 0.16], [r + 0.10, 0.02], [r + 0.23, -0.10], [r + 0.23, -0.14], [r, -0.14]], GUIA, -1.02, 0.07);
    // alas de cola, trapezoidales y en flecha
    cruz([[r, 0.20], [r + 0.34, -0.02], [r + 0.34, -0.16], [r, -0.18]], ALA, 1.18, 0.08);
    // LOS ROLLERONS: la rueda en la punta de cada ala, atras. Un pixel oscuro — pero es el pixel
    // que hace que la cruz de cola sea la de un Sidewinder y no la de cualquier cohete.
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4, d = r + 0.34;
      const m = add(g, new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), '#3a3f44',
        Math.cos(a) * d, Math.sin(a) * d, 1.30);
      m.rotation.z = a;
    }
    // EL FUEGO, encendido: mismas tres capas que el Exocet (se ilumina solo), mas grande — de cola
    // es lo que se ve venir
    addEmit(g, new THREE.CircleGeometry(r * 1.05, 10), BAKE.PAL.fuegoHondo, 0, 0, 1.48);
    addEmit(g, new THREE.CircleGeometry(r * 0.75, 10), BAKE.PAL.fuegoMedio, 0, 0, 1.50);
    addEmit(g, new THREE.CircleGeometry(r * 0.40, 8), BAKE.PAL.fuegoNucleo, 0, 0, 1.52);
    return g;
  }

  return { bomba: modelBomba, misil: modelMisil, aim9: modelAim9 };
});
