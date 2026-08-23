// CATALOGO DE MODELOS — LOS RESTOS (PLAN_HORNEADO B1).
// El estado ROTO de cada cosa que se puede romper, con los mismos modelos en configuracion de
// naufragio: la AA volcada, el camion de costado, el radar sin plato, el deposito hecho carcasa,
// el edificio en tres estados de derrumbe, la carpa caida, el helo y el jet estrellados, la
// barcaza escorada y el globo desinflado.
//
// POR QUE ESTO Y NO MAS CHUNKS. La regla del pasillo es "lo que queda atras tuyo es la historia
// de tu corrida". Hasta B1 esa historia la contaba una columna de humo que se apagaba en 6
// segundos y despues no quedaba nada: pasabas de vuelta por el mismo lugar y el campamento estaba
// intacto. Un resto con SILUETA PROPIA dura lo que dura el pasillo, y a 200 m se lee sin leyenda.
//
// LAS TRES REGLAS DE UN RESTO, y valen para los diez:
//  1. **Se reconoce**: conserva la masa y la proporcion del vivo. Un resto que no se identifica
//     es escombro generico, y escombro generico ya tenemos (los chunks).
//  2. **Le falta lo que lo definia**: al radar el plato, al globo el aire, a la carpa los
//     parantes. La silueta tiene que estar INCOMPLETA en el lugar exacto donde estaba su gracia.
//  3. **Esta quemado, no pintado de gris**: `quemar()` empuja el color del vivo hacia el hollin
//     conservando su tono. Un resto pintado de gris plano se lee como una maqueta sin terminar;
//     uno quemado se lee como la misma cosa despues del fuego.
//
// NADA SE INCLINA EN ANGULO RECTO. Un vehiculo volcado a 90° exactos parece colocado; a 74° u 82°
// parece caido. Todos los angulos de aca son deliberadamente feos por ese motivo.
//
// FORMA DEL CATALOGO: ver tools/models/planes.js.
'use strict';
BAKE.modelos('restos', (THREE, K) => {
  const { MAT, add, B, CYL, POST, CONE, DOME, PLATE, WING, FIN, WHEEL } = K;

  /** EL HOLLIN. Mezcla un color hacia el negro del fuego conservando su tono: el verde militar
   *  quemado sigue siendo verde, apenas queda de el. `k` es cuanto quemo — 0 intacto, 1 carbon.
   *  Se hace aca y no con una luz distinta porque el resto tiene que convivir en la MISMA escena
   *  que lo vivo (la regla 1 del horno): lo que cambia es el objeto, no la iluminacion. */
  //
  //  ⚠ LA PRIMERA VERSION DE ESTO ESTABA MAL Y ASI SE VEIA. Quemaba de 0.4 a 0.75 sobre las
  //  superficies grandes y los diez restos salieron manchas oscuras: el camion volcado no se
  //  distinguia de una piedra. Es la MISMA leccion que ya estaba escrita en el modelo de la bomba
  //  ("el verde oliva real no se ve"): lo veridico no sirve si desaparece. Un resto de verdad SI
  //  es casi negro, pero este juego es oscuro y el resto se dibuja contra turba oscura.
  //
  //  Lo que se corrigio no es el numero, es el METODO. Un resto no se lee quemado porque sea
  //  oscuro: se lee quemado por el CONTRASTE entre lo tiznado y lo que todavia conserva el color.
  //  Asi que las masas grandes se queman POCO (0.12–0.3, apenas para bajarles el tono) y el negro
  //  se gasta entero en manchas chicas —`tizne()`— sobre esas masas. El ojo lee el conjunto como
  //  quemado y la silueta sobrevive.
  const HOLLIN = [0x22, 0x1d, 0x19];
  function quemar(c, k) {
    const n = parseInt(c.slice(1), 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    const m = rgb.map((v, i) => Math.round(v * (1 - k) + HOLLIN[i] * k));
    return '#' + m.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  /** MANCHAS DE HOLLIN sobre una cara. Es donde se gasta el negro: chapas chatas casi al ras de la
   *  superficie, en angulos distintos, que a 48 px se leen como lamparones de humo. Sin esto el
   *  resto es el mismo modelo con menos luz; con esto es el mismo modelo despues del fuego. */
  function tizne(g, n, w, d, x, y, z, ry) {
    for (let i = 0; i < n; i++) {
      const a = i * 2.399;
      const m = B(g, w * (0.4 + (i % 3) * 0.25), 0.05, d * (0.35 + (i % 2) * 0.4),
        i % 2 ? '#2a2420' : '#191512',
        x + Math.cos(a) * w * 0.4, y, z + Math.sin(a) * d * 0.4, (ry || 0) + a * 0.3);
      m.rotation.x = 0.05 * (i % 3);
    }
  }
  /** RUEDA DE RESTO. La `WHEEL` del horno es casi negra (#191d18) y contra terreno oscuro
   *  desaparece — y las ruedas al aire son LA lectura de "vehiculo dado vuelta", asi que no se
   *  pueden perder. Esta lleva la llanta clara y el neumatico apenas mas alto. */
  function RUEDA(g, r, w, x, y, z) {
    const m = add(g, new THREE.CylinderGeometry(r, r, w, 10), '#2e332c', x, y, z);
    m.rotation.z = Math.PI / 2;
    const h = add(g, new THREE.CylinderGeometry(r * 0.5, r * 0.5, w + 0.03, 8), '#6d7568', x, y, z);
    h.rotation.z = Math.PI / 2;
    return m;
  }
  /** Chapa retorcida: tres placas finas en angulos distintos saliendo de un punto. Es el detalle
   *  que separa "roto" de "apagado" — sin esto los restos se leen como los mismos modelos con
   *  menos luz. Deterministas (indice, no azar): la hoja tiene que salir igual cada horneada. */
  function chapas(g, n, r, c, x, y, z) {
    for (let i = 0; i < n; i++) {
      const a = i * 2.399;                                  // angulo aureo: reparte sin repetir
      const m = B(g, r * (0.5 + (i % 3) * 0.22), 0.06, r * (0.6 + (i % 2) * 0.3), c,
        x + Math.cos(a) * r * 0.6, y + (i % 2) * 0.08, z + Math.sin(a) * r * 0.6);
      m.rotation.y = a; m.rotation.z = 0.3 + (i % 4) * 0.24;
      m.rotation.x = -0.2 + (i % 3) * 0.3;
    }
  }
  /** Cráter: un anillo bajo de tierra removida. Va debajo de casi todos — es lo que apoya al
   *  resto en el suelo, y sin el las cosas volcadas parecen flotando sobre el pasto. */
  function crater(g, r, c) {
    for (let i = 0; i < 9; i++) {
      const a = i * Math.PI * 2 / 9;
      B(g, r * 0.5, 0.14, r * 0.4, i % 2 ? c : quemar(c, 0.35),
        Math.cos(a) * r, 0.07, Math.sin(a) * r).rotation.y = -a;
    }
  }

  // ---------------- NIDO AA VOLCADO ----------------
  // El anillo de bolsas reventado por un lado y el afuste tumbado adentro, con los caños gemelos
  // clavados en la tierra. Los caños son lo que identifica al nido de lejos, asi que NO se sacan:
  // se dan vuelta. Un nido AA sin caños seria un pozo con bolsas.
  function restoAA() {
    const g = new THREE.Group();
    const sand = quemar('#8a7c58', 0.2), sand2 = quemar('#a4956e', 0.14), metal = quemar('#3d423b', 0.25);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      // EL BOQUETE: dos bolsas del frente reventadas (desparramadas y bajas), el resto en pie
      const roto = i === 0 || i === 7;
      const rr = roto ? 2.15 : 1.55, hh = roto ? 0.12 : 0.3;
      const b = B(g, 1.3, roto ? 0.3 : 0.62, 0.62, i % 2 ? sand : sand2,
        Math.cos(a) * rr, hh, Math.sin(a) * rr);
      b.rotation.y = -a + Math.PI / 2; if (roto) b.rotation.z = 0.5 + i * 0.2;
      if (!roto) B(g, 1.0, 0.5, 0.55, i % 2 ? sand2 : sand,
        Math.cos(a) * 1.5, 0.75, Math.sin(a) * 1.5).rotation.y = -a + Math.PI / 2;
    }
    tizne(g, 5, 2.4, 2.4, 0, 1.03, 0);                                 // el fogonazo sobre las bolsas
    // el afuste TUMBADO: mismo pedestal y misma cuna, girados 74° sobre el eje del pasillo
    const tur = new THREE.Group(); tur.position.set(-0.35, 0.35, 0.2);
    tur.rotation.z = 1.29; tur.rotation.y = 0.4; g.add(tur);
    B(tur, 0.8, 0.9, 0.8, metal, 0, 0.4, 0);
    B(tur, 1.1, 0.3, 0.6, quemar('#4a5045', 0.25), 0, 0.95, 0);
    for (const sg of [-1, 1]) {
      const c = CYL(tur, 0.08, 0.10, 2.4, '#4c5450', sg * 0.22, 1.7, -0.75, 6);
      c.rotation.x = Math.PI / 2 - 0.9;
    }
    chapas(g, 5, 0.9, metal, 0.6, 0.1, -0.4);
    return g;
  }

  // ---------------- CAMION AA DE COSTADO ----------------
  // Volcado sobre su izquierda, con las seis ruedas al aire — que es la lectura instantanea de
  // "vehiculo dado vuelta" y no hace falta nada mas. La torreta queda apuntando al suelo.
  function restoAATruck() {
    const g = new THREE.Group();
    const grn = quemar('#575b48', 0.2), grn2 = quemar('#696d58', 0.14), cab = quemar('#43473a', 0.22);
    crater(g, 2.2, '#5a5442');
    // VOLCADO HACIA LA CAMARA, no en contra. Con el giro al otro lado las seis ruedas quedaban del
    // lado ciego y el resto era un cajon oscuro: la panza al aire y las ruedas girando en falso son
    // LA lectura de "dado vuelta", y tienen que estar del lado que se ve.
    const v = new THREE.Group(); v.position.set(0, 1.15, 0.1);
    v.rotation.z = -1.44; v.rotation.x = 0.1; g.add(v);          // 82°: caido, no colocado
    B(v, 2.5, 0.9, 4.6, grn, 0, 0.45, 0.2);
    B(v, 2.5, 0.12, 4.6, grn2, 0, 0.96, 0.2);
    B(v, 2.3, 1.05, 1.5, cab, 0, 0.55, -2.55);
    B(v, 2.0, 0.45, 0.1, quemar('#9fb6bd', 0.55), 0, 0.7, -3.31);   // el parabrisas, ciego de humo
    tizne(v, 6, 2.4, 4.4, 0, 1.03, 0.2);                            // la chapa lamida por el fuego
    RUEDA(v, 0.52, 0.35, -1.1, 0, -1.8); RUEDA(v, 0.52, 0.35, 1.1, 0, -1.8);
    RUEDA(v, 0.52, 0.35, -1.1, 0, 1.2); RUEDA(v, 0.52, 0.35, 1.1, 0, 1.2);
    RUEDA(v, 0.52, 0.35, -1.1, 0, 2.2); RUEDA(v, 0.52, 0.35, 1.1, 0, 2.2);
    const tur = new THREE.Group(); tur.position.set(0, 1.35, 1.1); tur.rotation.y = 0.6; v.add(tur);
    B(tur, 1.3, 0.7, 1.3, cab, 0, 0.2, 0);
    for (const sg of [-1, 1]) {
      const c = CYL(tur, 0.09, 0.11, 2.2, '#4c5450', sg * 0.3, 0.85, -0.7, 6);
      c.rotation.x = Math.PI / 2 - 0.85;
    }
    chapas(g, 4, 1.1, grn2, -1.6, 0.1, 1.4);
    return g;
  }

  // ---------------- RADAR SIN PLATO ----------------
  // El camion QUEDA EN PIE — es lo unico de la lista que no se vuelca. Lo que se rompe es el
  // mastil, cortado a la mitad, y el plato queda tirado al lado como una moneda de canto clavada
  // en la tierra. Un radar sin plato sigue siendo un camion cualquiera: el plato caido AL LADO es
  // lo unico que dice cual camion era.
  function restoRadar() {
    const g = new THREE.Group();
    const grn = quemar('#5d6152', 0.16), grn2 = quemar('#6f7362', 0.12), cab = quemar('#4a4e42', 0.2);
    B(g, 2.4, 1.0, 4.2, grn, 0, 0.5, 0.3);
    B(g, 2.4, 0.12, 4.2, grn2, 0, 1.06, 0.3);
    B(g, 2.2, 1.0, 1.4, cab, 0, 0.5, -2.4);
    B(g, 1.9, 0.45, 0.1, quemar('#9fb6bd', 0.55), 0, 0.62, -3.11);
    tizne(g, 5, 2.2, 4.0, 0, 1.13, 0.3);
    RUEDA(g, 0.5, 0.35, -1.05, 0, -1.6); RUEDA(g, 0.5, 0.35, 1.05, 0, -1.6);
    RUEDA(g, 0.5, 0.35, -1.05, 0, 1.5); RUEDA(g, 0.5, 0.35, 1.05, 0, 1.5);
    // EL MUÑON: el mastil cortado a un tercio, con el corte abierto en chapa
    const p = POST(g, 0.16, 0.2, 0.5, quemar('#3a3e34', 0.3), 0, 1.25, 0.6);
    p.rotation.z = 0.18;
    chapas(g, 3, 0.3, quemar('#8a9299', 0.2), 0, 1.5, 0.6);
    // EL PLATO, tirado y clavado de canto en la tierra al lado del camion. A 2.6 de distancia se
    // salia de la celda (el autobox lo agarro: margen 0). Apoyado contra la caja del camion, que
    // ademas se lee mejor: cayo ahi nomas, no lo tiraron.
    const dish = new THREE.Group(); dish.position.set(1.95, 0.6, 1.2);
    dish.rotation.z = 0.92; dish.rotation.y = 0.7; dish.rotation.x = 0.25; g.add(dish);
    const m = add(dish, new THREE.CylinderGeometry(1.5, 1.5, 0.16, 14, 1, false, 0, Math.PI),
      quemar('#8a9299', 0.18), 0, 0, 0);
    m.rotation.x = Math.PI / 2; m.rotation.z = Math.PI;
    B(dish, 0.5, 0.4, 0.14, quemar('#aab2b8', 0.14), 0, 0.35, 0.15);
    return g;
  }

  // ---------------- DEPOSITO = CARCASA NEGRA ----------------
  // Los muros de pie y la boveda hundida: el galpon se quema de adentro y lo que queda es la
  // cascara. Los tambores que estaban afuera vuelan; los que quedan estan reventados y de costado.
  // El VACIO ARRIBA es la lectura: donde habia una boveda ahora se ve el cielo.
  function restoDepot() {
    const g = new THREE.Group();
    const w1 = quemar('#75705c', 0.28), w2 = quemar('#847e68', 0.2), dk = quemar('#2a2d24', 0.2);
    B(g, 3.4, 1.1, 4.6, w1, 0, 0.55, 0);                              // el cuerpo, todavia en pie
    B(g, 3.4, 0.16, 4.6, '#241f1a', 0, 1.15, 0);                      // el corte de arriba, carbon
    tizne(g, 7, 3.2, 4.4, 0, 1.24, 0);                                // lo que lamio el fuego
    // dos muñones de la boveda: lo que queda parado del arco, uno mas alto que el otro
    const a1 = B(g, 0.5, 0.9, 4.5, w2, -1.25, 1.55, 0.05); a1.rotation.z = 0.12;
    const a2 = B(g, 0.45, 0.55, 4.5, w2, 1.3, 1.35, -0.1); a2.rotation.z = -0.2;
    B(g, 1.2, 0.95, 0.14, dk, 0, 0.48, -2.32);                        // el porton, ahora un agujero
    // vigas caidas cruzando el hueco
    for (const [x, y, z, rz] of [[-0.3, 1.3, -1.2, 0.5], [0.6, 1.1, 0.9, -0.35], [0, 1.25, 2.0, 0.7]]) {
      const v = B(g, 2.6, 0.14, 0.2, quemar('#4c4638', 0.3), x, y, z);
      v.rotation.z = rz; v.rotation.y = 0.2 + z * 0.1;
    }
    // los tambores: uno de pie abollado, dos tumbados
    POST(g, 0.28, 0.28, 0.8, quemar('#6d7a4a', 0.3), 2.1, 0.4, -0.8, 8);
    const t1 = POST(g, 0.28, 0.28, 0.8, quemar('#7d8a55', 0.38), 2.4, 0.28, 0.3, 8); t1.rotation.z = 1.4;
    const t2 = POST(g, 0.28, 0.28, 0.8, quemar('#6d7a4a', 0.45), 1.9, 0.28, 1.1, 8);
    t2.rotation.x = 1.5; t2.rotation.z = 0.3;
    chapas(g, 6, 1.3, quemar('#5a5444', 0.25), -2.1, 0.1, -1.0);
    return g;
  }

  // ---------------- EDIFICIO: TRES ESTADOS DE DERRUMBE ----------------
  // El unico resto con MAS DE UNA POSE, y por un motivo de juego: el edificio es lo que escala por
  // altura (`o.h`), asi que uno solo se repetiria en toda la base. Tres estados —agrietado, sin
  // techo, y mitad de pared— dan tres siluetas distintas al pasar, y el render elige por objeto.
  // `n` va de 0 (le entro pero sigue en pie) a 2 (queda el zocalo).
  function restoBldg(n) {
    const g = new THREE.Group();
    const wall = quemar('#6e6656', 0.14 + n * 0.07), wall2 = quemar('#7d7563', 0.14 + n * 0.07);
    const roof = quemar('#463f31', 0.22), dk = quemar('#23271f', 0.1);
    const alt = [2.0, 1.35, 0.75][n];                                  // lo que queda parado
    B(g, 3.0, alt, 2.4, wall, 0, alt / 2, 0);
    B(g, 3.0, 0.14, 2.4, '#241f1a', 0, alt + 0.06, 0);                 // el corte, carbonizado
    // EL TIZNE SUBE POR LA FACHADA desde el boquete y las ventanas: el fuego salio por ahi. Es lo
    // que hace que un muro con la punta rota se lea como incendiado y no como en construccion.
    tizne(g, 4 + n * 2, 2.6, 0.3, 0, alt * 0.72, -1.24);
    if (n === 0) {
      // AGRIETADO: todavia tiene techo, pero hundido de un lado y con un boquete en la pared
      const r = B(g, 3.4, 0.3, 2.8, roof, 0.15, alt + 0.5, 0); r.rotation.z = -0.16; r.rotation.x = 0.08;
      B(g, 0.9, 0.8, 0.3, dk, -0.9, 1.1, -1.15);                       // el boquete
      B(g, 0.62, 0.5, 0.12, dk, 1.0, 1.4, -1.22);                      // la ventana que queda
    } else {
      // SIN TECHO: dos muñones de pared asomando y el techo caido adentro
      const p1 = B(g, 0.45, 0.7, 2.3, wall2, -1.25, alt + 0.3, 0); p1.rotation.z = 0.1;
      if (n === 1) { const p2 = B(g, 0.4, 0.45, 2.2, wall2, 1.28, alt + 0.2, 0.1); p2.rotation.z = -0.18; }
      const r = B(g, 2.4, 0.24, 2.0, roof, 0.1, alt * 0.55, 0.1);
      r.rotation.z = 0.3; r.rotation.x = -0.2;
    }
    B(g, 0.6, Math.min(0.95, alt), 0.12, dk, 0, Math.min(0.48, alt / 2), -1.22);   // la puerta
    // el desmoronamiento al pie: mas escombro cuanto mas derrumbado
    for (let i = 0; i < 4 + n * 3; i++) {
      const a = i * 2.399, r = 1.5 + (i % 3) * 0.45;
      const b = B(g, 0.55, 0.3, 0.45, i % 2 ? quemar('#6e6656', 0.22) : quemar('#463f31', 0.18),
        Math.cos(a) * r, 0.14, Math.sin(a) * r * 0.8 - 0.2);
      b.rotation.y = a; b.rotation.z = 0.15 * (i % 3);
    }
    for (let i = 0; i < 4; i++)                                        // las bolsas siguen ahi
      B(g, 0.7, 0.34, 0.5, i % 2 ? quemar('#8a7c58', 0.14) : quemar('#a4956e', 0.14),
        -1.3 + i * 0.85, 0.17, -1.35);
    return g;
  }

  // ---------------- CARPA CAIDA ----------------
  // La lona en el piso con el bulto de los parantes debajo. Es el resto mas simple y el mas
  // distinto de todos: no se quema ni explota, se DESINFLA — que es lo que hace una carpa a la
  // que le sacaste los palos. Un bulto bajo y ancho, sin nada vertical: la silueta contraria a
  // la que tenia viva.
  function restoTent() {
    const g = new THREE.Group();
    const lona = quemar('#6d6f4e', 0.14), lona2 = quemar('#7d7f60', 0.1), dk = quemar('#20241c', 0.1);
    // LA LONA: cuatro paños tirados en angulos distintos, apenas por encima del suelo. Tirada abre
    // MAS que armada (una carpa de pie ocupa poco piso y mucho alto; caida es al reves), asi que
    // los paños estan achicados respecto del primer intento — con los de antes se salia de la
    // celda y el autobox lo agarro: margen 0.
    for (const [w, d, x, z, ry, ang] of [
      [2.3, 2.7, 0, 0, 0.1, 0.10], [1.9, 1.8, -0.7, -0.8, 0.5, -0.14],
      [1.7, 1.5, 0.8, 0.6, -0.35, 0.16], [1.2, 1.1, 0.15, -1.3, 0.9, -0.2]]) {
      const m = B(g, w, 0.09, d, lona2, x, 0.2 + Math.abs(x) * 0.06, z, ry);
      m.rotation.x = ang; m.rotation.z = ang * 0.7;
    }
    tizne(g, 4, 1.8, 2.0, 0, 0.27, 0);                                 // el chamuscado de la lona
    // EL BULTO: la cumbrera caida debajo de la lona, que es lo que dice que hay algo abajo
    const c = B(g, 0.24, 0.16, 3.0, lona, -0.15, 0.34, 0.2); c.rotation.z = 0.06; c.rotation.y = 0.08;
    B(g, 1.9, 0.24, 1.6, lona, -0.1, 0.28, 0.1, 0.12);
    // los parantes partidos, asomando por los bordes
    for (const [x, y, z, rz, ry] of [[-1.3, 0.18, 1.3, 1.35, 0.4], [1.15, 0.16, -1.05, 1.5, -0.7]]) {
      const p = POST(g, 0.06, 0.07, 1.3, quemar('#5b4630', 0.15), x, y, z); p.rotation.z = rz; p.rotation.y = ry;
    }
    B(g, 0.66, 0.2, 0.5, dk, 0, 0.16, -1.75);                          // la entrada, ahora un pliegue
    B(g, 2.7, 0.1, 3.2, quemar('#5a5c42', 0.15), 0, 0.05, 0);          // la huella en el pasto
    return g;
  }

  // ---------------- HELICOPTERO ESTRELLADO ----------------
  // De panza y escorado, con el botalon de cola PARTIDO y el rotor doblado — las tres palas
  // combadas hacia arriba, que es como quedan de verdad cuando el disco pega contra el suelo.
  // El disco translucido del barrido no va: un rotor quieto es medio mensaje del resto.
  function restoHelo() {
    const g = new THREE.Group();
    const grn = quemar('#687a68', 0.22), grn2 = quemar('#52624f', 0.26), dk = '#3d4740';
    crater(g, 2.6, '#5a5442');
    // TUMBADO SOBRE UNA BANDA, casi de costado (63°). El primer intento lo dejaba escorado 24° y
    // desde la camara frontal eso es un helicoptero apenas ladeado: se leia como posado, no como
    // estrellado. De costado, la panza queda a la vista y el mastil del rotor apunta al horizonte
    // — que es la postura inconfundible de un helo caido.
    const b = new THREE.Group(); b.position.set(0.15, 0.95, -0.2);
    b.rotation.z = 1.1; b.rotation.x = -0.16; b.rotation.y = 0.2; g.add(b);
    DOME(b, 0.9, grn, 0, 0, -0.4, 1.0, 0.78, 1.7);
    DOME(b, 0.62, quemar('#8fd0e0', 0.55), 0, 0.02, -1.7, 0.94, 0.66, 0.9);   // el vidrio, ciego
    B(b, 1.14, 0.5, 1.1, grn2, 0, -0.62, -0.3);                        // la bañera, ahora de costado
    tizne(b, 5, 1.4, 2.4, 0, 0.55, -0.4);
    CYL(b, 0.30, 0.22, 0.9, grn2, 0, 0.22, 1.0, 8);                    // el botalon, cortado a un tercio
    chapas(b, 4, 0.35, grn2, 0, 0.22, 1.5);
    for (const sg of [-1, 1]) {                                        // los patines, uno doblado
      const p = CYL(b, 0.07, 0.07, 2.4, dk, sg * 0.55, -1.16, -0.3, 6);
      if (sg < 0) { p.rotation.z = 0.4; p.position.y = -1.0; }
    }
    POST(b, 0.10, 0.14, 0.5, grn2, 0, 0.82, -0.35);                    // el mastil, ahora horizontal
    // LAS PALAS: la que quedo arriba entera y apuntando al cielo, las otras dos combadas contra el
    // suelo. Es la unica pieza que el helo tiene y ninguna otra cosa del roster: mientras se lea
    // el rotor, el resto se lee como helicoptero aunque lo demas sea un bulto.
    for (let i = 0; i < 3; i++) {
      const a = 0.9 + i * Math.PI * 2 / 3;
      const pa = B(b, 0.16, 0.05, 2.9, dk, Math.sin(a) * 1.45, 1.06, -0.35 + Math.cos(a) * 1.45);
      pa.rotation.y = a; pa.rotation.z = [0.5, -0.75, 0.28][i]; pa.rotation.x = [0, 0.4, -0.3][i];
    }
    // LA COLA, tirada aparte y a contramano: es la pieza que dice "esto se partio antes de tocar"
    const t = new THREE.Group(); t.position.set(2.2, 0.3, 1.8);
    t.rotation.y = 1.1; t.rotation.z = 0.25; g.add(t);
    CYL(t, 0.26, 0.14, 1.9, grn2, 0, 0, 0, 8);
    FIN(t, 0.62, 0.5, 0.28, 0.3, 0.08, grn, 0.1, 0.85);
    B(t, 0.08, 0.5, 0.16, dk, 0.06, 0.4, 0.9);
    return g;
  }

  // ---------------- JET ESTRELLADO ----------------
  // De morro en la tierra, con un ala arrancada tirada al lado y la deriva partida. La postura
  // es de PICADA CLAVADA —cola en alto, nariz enterrada— porque es la unica que se lee como
  // "cayo volando" y no como "lo estacionaron mal".
  function restoJet() {
    const g = new THREE.Group();
    const gry = quemar('#6a7570', 0.22), gry2 = quemar('#59645f', 0.26), dk = quemar('#454f4b', 0.2);
    crater(g, 3.0, '#5a5442');
    const f = new THREE.Group(); f.position.set(0, 0.85, 0.6);
    f.rotation.x = -0.62; f.rotation.z = 0.34; f.rotation.y = 0.2; g.add(f);   // nariz abajo
    CYL(f, 0.40, 0.36, 4.6, gry, 0, 0, 0.1, 12);
    CONE(f, 0.36, 1.3, gry, 0, 0, -2.85, false, 12);
    // SOLO UN ALA: la otra esta tirada al lado, y esa asimetria es la lectura de "roto"
    PLATE(f, [[0, 1.1], [2.7, -0.6], [2.7, -1.4], [0, -1.1]], 0.15, gry2, 0, 0.28, 0.55);
    WING(f, 2.3, 0.9, 0.45, 0.6, 0.11, gry2, 0.30, 2.1, 4);
    const fin = FIN(f, 0.8, 1.25, 0.5, 0.9, 0.10, gry, 0.14, 2.05);    // la deriva, partida al medio
    fin.rotation.x = 0.3;
    DOME(f, 0.34, quemar('#8fd0e0', 0.55), 0, 0.40, -1.45, 0.85, 0.8, 1.7);
    tizne(f, 6, 0.8, 4.0, 0, 0.42, 0.1);                               // el reguero de humo del fuselaje
    CYL(f, 0.44, 0.40, 1.6, gry2, -0.55, 0.05, -0.7, 8);
    CYL(f, 0.44, 0.40, 1.6, gry2, 0.55, 0.05, -0.7, 8);
    CYL(f, 0.30, 0.28, 0.4, dk, 0, 0, 2.4, 10);
    // EL ALA ARRANCADA, de canto en la tierra
    const w = new THREE.Group(); w.position.set(-2.5, 0.5, 0.9);
    w.rotation.z = 1.15; w.rotation.y = -0.5; g.add(w);
    PLATE(w, [[0, 1.1], [2.7, -0.6], [2.7, -1.4], [0, -1.1]], 0.15, gry2, 0, 0, 0);
    chapas(g, 5, 1.2, gry2, 1.6, 0.1, -1.4);
    return g;
  }

  // ---------------- BARCAZA ENCALLADA / ESCORADA ----------------
  // Dos poses, que son dos finales distintos: `n=0` escorada sobre una banda (el agua le entra por
  // la borda) y `n=1` de proa hundida con la popa levantada. La rampa siempre abierta y colgando:
  // una barcaza con la rampa cerrada parece navegando.
  function restoLcu(n) {
    const g = new THREE.Group();
    const hull = quemar('#6b7566', 0.18), hull2 = quemar('#7f8975', 0.12), dk = quemar('#565f52', 0.22);
    const b = new THREE.Group();
    if (n) { b.rotation.x = -0.34; b.rotation.z = 0.14; b.position.y = -0.35; }   // de proa
    else { b.rotation.z = 0.62; b.position.y = -0.25; }                           // escorada
    g.add(b);
    B(b, 2.6, 0.9, 6.4, hull, 0, 0.45, 0);
    B(b, 2.6, 0.14, 6.4, hull2, 0, 0.97, 0);
    B(b, 0.18, 0.55, 5.6, hull2, -1.25, 1.15, 0.2);
    const br = B(b, 0.18, 0.55, 3.2, hull2, 1.25, 1.15, 1.4);          // la borda de estribor, rota
    br.rotation.z = -0.5;
    tizne(b, 6, 2.2, 5.6, 0, 1.05, 0.2);                              // la cubierta, lamida
    const ramp = B(b, 2.3, 0.16, 1.7, quemar('#8a947f', 0.16), 0, 0.75, -3.6);
    ramp.rotation.x = 0.95;                                            // caida del todo
    const t = B(b, 1.5, 1.1, 1.2, dk, 0.1, 1.5, 2.5); t.rotation.z = -0.16;
    B(b, 1.3, 0.35, 0.1, quemar('#9fb6bd', 0.55), 0.1, 1.75, 1.94);
    chapas(b, 4, 0.9, hull2, 0.3, 1.05, -1.2);
    return g;
  }

  // ---------------- GLOBO DESINFLADO ----------------
  // La bolsa vaciada sobre el piso: ancha, chata y con pliegues. Lo que la identifica no es la
  // forma —una lona en el suelo es una lona— sino el TAMAÑO: sigue midiendo lo que media el globo.
  // Por eso los pliegues son grandes y pocos, y no un monton de trapitos.
  function restoBalloon() {
    const g = new THREE.Group();
    // EL GLOBO NO SE QUEMA, SE VACIA. Es el unico resto de la lista que no pasa por el fuego:
    // una bala le abre la tela y se desinfla. Por eso conserva casi todo su color —lo que cambio
    // es la FORMA, de bulbo a mancha— y no lleva tizne. Un globo desinflado y ademas tiznado
    // contaria una muerte que no fue la suya.
    const sil = quemar('#a3aeb4', 0.1), sil2 = quemar('#c3ced2', 0.06), dk = quemar('#7e8a90', 0.16);
    // la bolsa: tres domos MUY achatados y superpuestos, girados entre si — pliegues, no bultos
    const d1 = DOME(g, 1.15, sil, -0.1, 0.16, 0.1, 1.2, 0.16, 1.5); d1.rotation.y = 0.2;
    const d2 = DOME(g, 0.85, sil2, 0.55, 0.2, -0.7, 1.3, 0.2, 0.9); d2.rotation.y = -0.6;
    const d3 = DOME(g, 0.7, sil, -0.75, 0.14, 0.85, 1.0, 0.14, 1.2); d3.rotation.y = 0.9;
    // la cola vacia, estirada en el pasto
    const c = CONE(g, 0.34, 1.5, dk, 0.5, 0.14, 1.7, true, 8); c.rotation.z = 1.4; c.rotation.y = -0.35;
    for (let i = 0; i < 3; i++) {                                      // las aletas, dobladas al piso
      const a = i * 2.4;
      const f = DOME(g, 0.42, i ? sil : sil2, Math.cos(a) * 1.0 + 0.4, 0.12, Math.sin(a) * 0.7 + 1.3,
        0.3, 0.14, 1.1);
      f.rotation.z = a; f.rotation.y = a * 0.6;
    }
    // el cable, enrollado en el suelo al lado
    for (let i = 0; i < 3; i++) {
      const cc = CYL(g, 0.035, 0.035, 1.2 + i * 0.3, dk, -1.2 + i * 0.2, 0.04, -1.4 + i * 0.35, 5);
      cc.rotation.y = 0.6 + i * 0.9; cc.rotation.x = Math.PI / 2;
    }
    return g;
  }

  return { restoAA, restoAATruck, restoRadar, restoDepot, restoBldg, restoTent,
    restoHelo, restoJet, restoLcu, restoBalloon };
});
