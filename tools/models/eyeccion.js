// LA EYECCION — el piloto en el asiento y el piloto bajo la cupula (pedido del autor 29/9: "hoy
// es un cuadrado, no se parece a un piloto argentino de Malvinas").
//
// Hasta hoy el paracaidas era codigo en render/world.js: una media elipse y un rectangulo. Ahora es
// un modelo horneado con la misma luz que el resto, en DOS ACTOS, que es como se ve una eyeccion:
//   1. EL ASIENTO: el Martin-Baker sale dando tumbos con el piloto sentado adentro — respaldo alto,
//      el cabezal, y la manija amarilla y negra de la cortina arriba. Es la silueta que dice "se
//      eyecto" y no "se cayo un pedazo".
//   2. LA CUPULA: el asiento ya se separo y el piloto cuelga de las cuerdas, con los brazos arriba
//      en los elevadores. La cupula es de GAJOS alternados — la firma de un paracaidas a cualquier
//      distancia, mucho mas que su forma.
//
// DOS PILOTOS, porque del mismo modelo eyectan dos bandos:
//   'arg'  el tuyo: mameluco VERDE OLIVA de la Fuerza Aerea, casco BLANCO con el visor oscuro bajo,
//          chaleco salvavidas, y la cupula naranja y blanca de los asientos Martin-Baker de los
//          A-4 y los Dagger.
//   'brit' el del Sea Harrier que alcanza a salir: mameluco gris verdoso, casco gris, y la cupula
//          en verde y arena — a proposito distinta: a 40 px lo unico que dice de quien es el
//          paracaidas que baja es el COLOR de la cupula.
//
// EL ORIGEN ES EL ARNES DEL PILOTO, en los dos actos. El asiento gira alrededor de el y la cupula
// cuelga de el, asi que el juego puede anclar los dos actos en el mismo punto (el `puntos` de la
// hoja) y el cambio de uno a otro no salta.
//
// El piloto mira hacia -z como todos los modelos del horno: el horneador lo da vuelta hacia la
// camara y se le ve la cara — el visor es lo que tiene que leerse.
'use strict';
BAKE.modelos('eyeccion', (THREE, K) => {
  const { add, B, POST, DOME } = K;

  const PIEL = {
    arg:  { traje: '#5e6746', traje2: '#737c58', chaleco: '#b98d3e', casco: '#e6e4dc', bota: '#1f211c',
            gajo: ['#d9652b', '#ece6d6'] },
    brit: { traje: '#667064', traje2: '#7a8577', chaleco: '#3d4838', casco: '#9ea39a', bota: '#1f211c',
            gajo: ['#6c7354', '#cfc6a6'] },
  };
  const ASIENTO = '#2d312f', ASIENTO2 = '#3f4441', MANIJA = '#e0c024', CUERDA = '#d8d2c2';

  /** UN MIEMBRO: grupo con pivote en la articulacion y el volumen colgando hacia -y (el patron del
   *  rig de soldados: dos rotaciones en grupos separados, nunca en el mismo objeto). `rx` positivo
   *  lleva el extremo hacia -z, o sea hacia adelante del piloto. */
  function miembro(padre, x, y, z, largo, r, color, rx, rz) {
    const g = new THREE.Group();
    g.position.set(x, y, z); g.rotation.x = rx || 0; g.rotation.z = rz || 0;
    padre.add(g);
    POST(g, r, r * 0.9, largo, color, 0, -largo / 2, 0, 6);
    return g;
  }

  /** EL PILOTO, con el arnes en el origen. `sentado` = true lo arma en el asiento (muslos adelante,
   *  manos a la manija entre las rodillas); si no, colgado de las cuerdas. */
  function piloto(g, c, sentado) {
    B(g, 0.44, 0.62, 0.28, c.traje, 0, 0.28, 0);                    // el torso
    B(g, 0.48, 0.3, 0.32, c.chaleco, 0, 0.44, 0);                   // el chaleco salvavidas
    B(g, 0.07, 0.62, 0.3, '#2a2c26', -0.12, 0.28, -0.01);           // las cinchas del arnes
    B(g, 0.07, 0.62, 0.3, '#2a2c26', 0.12, 0.28, -0.01);
    B(g, 0.46, 0.1, 0.3, '#2a2c26', 0, 0.0, 0);                     // el cinturon del arnes
    // la cabeza: el casco es la firma (blanco en el nuestro), y abajo el visor oscuro y la mascara
    DOME(g, 0.17, c.casco, 0, 0.8, 0, 1, 1.12, 1.05);
    B(g, 0.24, 0.08, 0.06, '#1d2326', 0, 0.8, -0.16);               // el visor bajo
    B(g, 0.1, 0.1, 0.08, '#4a4f4c', 0, 0.68, -0.15);                // la mascara de oxigeno
    if (sentado) {
      for (const sx of [-1, 1]) {
        const mu = miembro(g, sx * 0.12, -0.02, 0, 0.44, 0.075, c.traje2, Math.PI / 2 - 0.1);
        const pi = miembro(mu, 0, -0.44, 0, 0.42, 0.065, c.traje2, -Math.PI / 2 + 0.2);
        B(pi, 0.12, 0.1, 0.2, c.bota, 0, -0.44, -0.05);
        // brazos: a la manija de abajo, entre las rodillas
        const br = miembro(g, sx * 0.27, 0.54, 0, 0.3, 0.06, c.traje, 0.5, sx * 0.25);
        miembro(br, 0, -0.3, 0, 0.28, 0.055, c.traje, 0.9);
      }
    } else {
      for (const sx of [-1, 1]) {
        // piernas colgando, apenas flexionadas y abiertas: el peso muerto de alguien que bajo
        const mu = miembro(g, sx * 0.12, -0.02, 0, 0.46, 0.075, c.traje2, 0.25, sx * 0.08);
        const pi = miembro(mu, 0, -0.46, 0, 0.44, 0.065, c.traje2, -0.4);
        B(pi, 0.12, 0.1, 0.2, c.bota, 0, -0.46, -0.05);
        // brazos ARRIBA, a los elevadores: es la pose que dice "colgado", no "parado"
        const br = miembro(g, sx * 0.27, 0.54, 0, 0.3, 0.06, c.traje, Math.PI - 0.15, -sx * 0.35);
        miembro(br, 0, -0.3, 0, 0.28, 0.055, c.traje, 0.2);
      }
    }
  }

  /** ACTO 1: el asiento con el piloto adentro. El respaldo va detras (+z), el cabezal le pasa la
   *  cabeza, y la manija de la cortina asoma arriba — amarilla y negra, que es lo que se ve. */
  // EL PILOTO VA 1.4 VECES MAS GRANDE que a escala contra la cupula: a escala real, debajo de una
  // cupula de 7 m el hombre es un palito de 6 px y el casco blanco no llega a verse. Mentira de
  // arte a favor de lo que importa, que es QUIEN cuelga. El asiento va a la misma escala del piloto.
  const ESC = 1.4;
  function asiento(bando) {
    const c = PIEL[bando] || PIEL.arg;
    const g = new THREE.Group(); g.scale.setScalar(ESC);
    piloto(g, c, true);
    B(g, 0.6, 1.2, 0.12, ASIENTO, 0, 0.5, 0.22);                   // el respaldo
    B(g, 0.56, 0.4, 0.3, ASIENTO2, 0, 1.18, 0.14);                  // el cabezal (el paracaidas va adentro)
    B(g, 0.62, 0.12, 0.6, ASIENTO, 0, -0.1, -0.05);                 // la cubeta
    for (const sx of [-1, 1]) B(g, 0.06, 1.35, 0.1, ASIENTO2, sx * 0.33, 0.52, 0.2);   // los rieles
    B(g, 0.3, 0.07, 0.07, MANIJA, 0, 1.42, 0.02);                   // la manija de la cortina
    B(g, 0.08, 0.07, 0.075, '#141414', -0.08, 1.42, 0.02);
    B(g, 0.08, 0.07, 0.075, '#141414', 0.08, 1.42, 0.02);
    return g;
  }

  /** ACTO 2: bajo la cupula. Gajos alternados, abierta abajo, con las cuerdas al arnes. */
  function cupula(bando) {
    const c = PIEL[bando] || PIEL.arg;
    const g = new THREE.Group();
    const pg = new THREE.Group(); pg.scale.setScalar(ESC); g.add(pg);
    piloto(pg, c, false);
    const R = 2.3, Y = 3.9, TH = Math.PI * 0.42, SY = 0.62, N = 14;
    for (let i = 0; i < N; i++) {
      const geo = new THREE.SphereGeometry(R, 3, 6, i * Math.PI * 2 / N, Math.PI * 2 / N, 0, TH);
      const m = add(g, geo, c.gajo[i % 2], 0, Y, 0);
      m.scale.y = SY;
      m.material.side = THREE.DoubleSide;                           // se le ve el adentro desde abajo
    }
    DOME(g, 0.32, c.gajo[0], 0, Y + R * SY - 0.02, 0, 1, 0.45, 1);   // la chimenea del tope
    // LAS CUERDAS: del borde de la cupula a los hombros. Lineas de un pixel, que a esta escala es
    // justo lo que son; un cilindro seria mas grueso que el piloto.
    const yb = Y + R * Math.cos(TH) * SY, rb = R * Math.sin(TH);
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI * 2 / 8 + 0.2;
      pts.push(new THREE.Vector3(Math.cos(a) * rb, yb, Math.sin(a) * rb));
      pts.push(new THREE.Vector3((Math.cos(a) > 0 ? 1 : -1) * 0.22 * ESC, 0.62 * ESC, 0));
    }
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: CUERDA })));
    return g;
  }

  return { asiento, cupula };
});
