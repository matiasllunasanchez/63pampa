// LOS SOLDADOS — el rig low poly de la infantería de tierra (PLAN_HORNEADO B7).
//
// POR QUE EXISTE ESTE ARCHIVO. Hasta hoy los soldados eran el UNICO habitante del juego generado
// por IA (`assets/world/soldats/englishsoldatv2.png`): una lámina de ~128 px por fila, con las
// animaciones rotuladas en verde, de la que `render/soldiers.js` recortaba dos cajas medidas a
// mano sobre el alfa. Funcionaba, pero estaba iluminado por otro sol que el resto del mundo — que
// es exactamente lo que la regla 1 del horno viene a impedir. Ahora comparte los tres focos con
// los enemigos, los aviones y la munición.
//
// EL SOLDADO SE MIRA DE PERFIL Y MIRA HACIA -X. No es una convención heredada de los otros
// modelos (que se arman con la nariz hacia -z y el horneador los da vuelta): acá el perfil ES el
// encuadre, así que el modelo se construye ya orientado y el horneador no gira nada. La razón de
// que sea perfil y no de espaldas está aprendida y escrita en la v1 de la lámina de IA: **de
// espaldas se ve el ciclo de carrera pero no el rumbo**, y lo único que un soldado le comunica al
// jugador es que se está yendo de ahí.
//
// LOS COLORES SON LOS DEL DIBUJO A MANO, COPIADOS A PROPOSITO. Salen de `SOL` en
// `src/render/world.js` — el respaldo que se dibuja cuando la hoja no cargó. Los dos tienen que
// empalmar: si el sprite fuera de otro tono, el momento en que la hoja no está se leería como que
// aparecieron otros soldados. Y ya están peleados una vez: la nota de `SOL` cuenta que al
// oscurecer el uniforme el contorno y el cuerpo se fundían en una mancha. **Lo verídico no sirve
// si desaparece** — es la misma lección de la bomba verde oliva y del humo gris casco.
'use strict';
BAKE.modelos('soldiers', (THREE, K) => {

  const { B, POST, DOME, add } = K;

  // Copiados de SOL en src/render/world.js (ver cabecera). Si allá cambian, acá también.
  const C = {
    U: '#6d6f48',      // uniforme DPM, tono medio
    UL: '#8d8f60',     // cara iluminada
    UD: '#43452c',     // sombra del uniforme / pantalón
    GEAR: '#3c3e29',   // correaje y equipo
    BOOT: '#2a2c1f',   // borceguíes
    HELM: '#7f8256',   // casco — CLARO A PROPOSITO: es lo que mira al cielo y es la firma
    SKIN: '#b08a5e',   // piel (bajada de saturación: no compite con el casco)
    GUN: '#191c12',
  };

  // MEDIDAS, en las mismas unidades en las que el juego mide al soldado: 2,05 de alto es lo que
  // `render/soldiers.js` viene dibujando desde siempre (`k * 2.05`). Se conserva el número para
  // que el cambio de arte NO sea a la vez un cambio de escala — si el soldado creciera al mismo
  // tiempo que cambia de dibujo, no habría forma de saber cuál de las dos cosas se ve mejor.
  const ALTO = 2.05;
  const Y_HOMBRO = 1.60, Y_CADERA = 1.02, LARGO_MUSLO = 0.52, LARGO_PIERNA = 0.48;
  const LARGO_BRAZO = 0.36, LARGO_ANTEBRAZO = 0.32;
  const ANCHO = 0.46;                       // de hombro a hombro: la profundidad hacia la cámara

  /** UN HUESO: un grupo con pivote en la articulación y el volumen colgando hacia abajo. Va como
   *  GRUPO y no como cilindro rotado porque encadenar rodilla y codo sobre el mismo objeto compone
   *  un euler que no es el que uno espera — la trampa que ya encabritó al Harrier de B3. Con el
   *  pivote afuera, el hueso siguiente cuelga del anterior y las dos rotaciones son locales. */
  function hueso(padre, x, y, z, largo, r, color, ang) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.z = ang || 0;
    padre.add(g);
    POST(g, r, r * 0.88, largo, color, 0, -largo / 2, 0, 6);
    return g;                                // el extremo libre queda en (0, -largo, 0) local
  }

  /** EL CASCO, que es la firma. A 12 px de alto no se lee una cara ni un fusil: se lee un bulto
   *  redondo y ancho encima de una silueta angosta. Es el Mk. II británico —el "plato de sopa"
   *  con ala— y el ala es justamente lo que lo separa de una cabeza pelada a esta escala. */
  function casco(g, y, x) {
    x = x || 0;
    const d = DOME(g, 0.155, C.HELM, x, y, 0, 1, 0.72, 1);
    B(g, 0.30, 0.035, 0.30, C.HELM, x, y - 0.02, 0);    // el ala
    return d;
  }

  /** EL SOLDADO. `o.p` es la fase del ciclo de carrera en [0,1); `o.bergen` le cuelga la mochila
   *  grande del desembarco. Con `o.tierra` se arma tendido en vez de corriendo — y es OTRA
   *  construcción, no el mismo cuerpo rotado 90°: un cuerpo parado y acostado no se ve igual, y
   *  la pose que importa es la de alguien que se TIRO al piso, con el casco levantado. */
  function soldado(o) {
    o = o || {};
    const g = new THREE.Group();
    if (o.tierra) return tendido(g, o);

    // El paso: muslos en contrafase, y los brazos al revés que las piernas (que es lo que hace
    // que una silueta se lea como CORRIENDO y no como saltando en el lugar).
    const s = Math.sin(o.p * Math.PI * 2), c = Math.cos(o.p * Math.PI * 2);
    const PASO = 0.62;                       // amplitud del muslo, en radianes
    // adelante es -x: rotar el hueso (que cuelga hacia -y) con ángulo NEGATIVO le lleva el pie
    // hacia -x. Escrito acá porque el signo se razona mal de memoria.
    const muslo = k => -s * PASO * k;

    // TRONCO inclinado hacia adelante: el que corre huyendo va tirado sobre el paso.
    const tronco = new THREE.Group();
    tronco.rotation.z = 0.16;                // +z inclina la cabeza hacia -x (adelante)
    tronco.position.set(0, Y_CADERA, 0);
    g.add(tronco);

    B(tronco, 0.30, Y_HOMBRO - Y_CADERA + 0.16, ANCHO, C.U, 0, (Y_HOMBRO - Y_CADERA) / 2 - 0.04, 0);
    B(tronco, 0.32, 0.09, ANCHO + 0.02, C.GEAR, 0, (Y_HOMBRO - Y_CADERA) - 0.30, 0);   // cinturón
    B(tronco, 0.06, 0.34, ANCHO * 0.55, C.GEAR, -0.13, (Y_HOMBRO - Y_CADERA) - 0.20, 0); // correaje
    // cuello y cabeza
    const yc = Y_HOMBRO - Y_CADERA;
    B(tronco, 0.11, 0.10, 0.14, C.SKIN, -0.01, yc + 0.09, 0);
    DOME(tronco, 0.115, C.SKIN, -0.02, yc + 0.23, 0, 1, 1.05, 0.92);
    casco(tronco, yc + 0.30);
    // la MOCHILA: chica en la guarnición, un bergen que le pasa la cabeza en el desembarco. Es la
    // única diferencia entre los dos equipos y alcanza: a 12 px lo que cambia es la SILUETA de la
    // espalda, no el color del uniforme.
    if (o.bergen) B(tronco, 0.26, 0.62, ANCHO * 0.82, C.GEAR, 0.24, yc - 0.20, 0);
    else B(tronco, 0.16, 0.30, ANCHO * 0.72, C.GEAR, 0.20, yc - 0.16, 0);

    // BRAZOS: el de adelante sostiene el fusil; los dos bombean en contrafase con las piernas.
    for (const lado of [-1, 1]) {
      const zH = lado * ANCHO * 0.42;
      // EL BRAZO DE ACA (el que mira a la cámara) va un tono más claro. Con el mismo color del
      // torso se fundía con él y el soldado quedaba sin brazos: a 12 px lo que separa un brazo de
      // un torso no es el contorno, es el tono.
      const tono = lado < 0 ? C.UL : C.U;
      const br = hueso(tronco, 0, yc - 0.02, zH, LARGO_BRAZO, 0.058, tono, s * 0.5 * lado + 0.15);
      hueso(br, 0, -LARGO_BRAZO, 0, LARGO_ANTEBRAZO, 0.05, tono, -0.85);
    }
    // EL FUSIL, cruzado al pecho y apuntando adelante-abajo. No se modela un FAL ni un SLR: a esta
    // escala es una barra oscura, y lo que aporta es que la silueta tenga algo delante del torso.
    const fus = new THREE.Group();
    fus.position.set(-0.16, yc - 0.26, -ANCHO * 0.28);
    fus.rotation.z = 0.55;
    tronco.add(fus);
    B(fus, 0.055, 0.62, 0.05, C.GUN, 0, 0, 0);

    // PIERNAS con rodilla: el muslo va en contrafase y la pantorrilla se dobla en la que atrasa.
    for (const lado of [-1, 1]) {
      const a = muslo(lado);
      const pi = hueso(g, 0, Y_CADERA, lado * ANCHO * 0.24, LARGO_MUSLO, 0.075, C.UD, a);
      // LA RODILLA FLEXIONA EN LA RECUPERACION, que es la mitad del ciclo en la que la pierna
      // viene de atrás hacia adelante SIN tocar el piso — la que está apoyada va derecha porque
      // le lleva el peso encima. Primero salió atada a `s` (o sea a la POSICION del muslo) y el
      // resultado era que en los dos cuadros de paso cruzado las dos piernas quedaban rectas y
      // paralelas: el soldado parecía estar parado. La flexión se saca de la VELOCIDAD del muslo
      // (`cos`), no de su posición, y ahí aparece el paso.
      const flex = 0.15 + 0.9 * Math.max(0, c * lado);
      const pan = hueso(pi, 0, -LARGO_MUSLO, 0, LARGO_PIERNA, 0.062, C.UD, -flex);
      B(pan, 0.19, 0.10, 0.13, C.BOOT, -0.03, -LARGO_PIERNA - 0.03, 0);      // borceguí
    }
    // sin base ni sombra: la sombra la pinta el juego, que sabe sobre qué terreno está parado
    return g;
  }

  /** CUERPO A TIERRA. El que ve venir al avión y se tira. Lo que lo hace legible a 4 px de alto no
   *  es el cuerpo —que es una raya— sino el CASCO levantado en una punta y las botas en la otra:
   *  esa asimetría es lo único que dice hacia dónde mira. */
  function tendido(g, o) {
    const LARGO = 1.72, Y = 0.16;
    B(g, LARGO, 0.20, ANCHO, C.U, 0, Y, 0);                       // tronco y piernas, de una pieza
    B(g, LARGO * 0.36, 0.10, ANCHO * 0.96, C.UL, -0.10, Y + 0.11, 0);  // la espalda toma el sol
    B(g, o.bergen ? 0.52 : 0.34, 0.19, ANCHO * 0.8, C.GEAR, 0.16, Y + 0.17, 0);  // la mochila arriba
    B(g, 0.26, 0.15, ANCHO * 0.94, C.BOOT, LARGO / 2 + 0.02, Y - 0.02, 0);       // botas atrás
    // la cabeza LEVANTADA: mira hacia adelante (-x), que es de donde viene el avión
    DOME(g, 0.11, C.SKIN, -LARGO / 2 + 0.06, Y + 0.19, 0, 1, 0.9, 0.9);
    casco(g, Y + 0.30, -LARGO / 2 + 0.02);
    B(g, 0.50, 0.05, 0.05, C.GUN, -LARGO / 2 + 0.10, Y + 0.06, -ANCHO * 0.3);    // el fusil apoyado
    return g;
  }

  return { soldado, ALTO };
});
