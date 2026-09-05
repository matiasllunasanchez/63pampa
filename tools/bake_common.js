// EL HORNO — luz, camara, primitivas y medicion, COMPARTIDAS por los cuatro horneadores.
// (PLAN_HORNEADO B0.) Antes cada `bake_*.html` llevaba su propia copia de las tres luces, de la
// camara y de las diez primitivas de volumen, con la nota "la duplicacion es preferible a
// compartir modulo entre tools". Dejo de serlo cuando fueron cuatro: la regla 1 del plan es "UNA
// luz, UNA camara, UNA paleta para todo lo horneado" y con cuatro copias esa regla no se puede
// ni verificar, solo prometer. Ahora se lee de un archivo.
//
// POR QUE ES UN SCRIPT CLASICO Y NO UN MODULO ES. Los horneadores se abren con `file://` (el
// runner de Electron hace loadFile), y ahi el navegador bloquea `import` por CORS. El juego se
// bundlea con esbuild justamente por eso; las herramientas no tienen build, asi que el vehiculo
// es el global: este archivo publica `window.BAKE` y cada HTML lo carga con un <script src>
// ANTES de su propio codigo. Mismo motivo por el que `three.global.js` existe.
//
// NO SE IMPORTA NADA DEL JUEGO. Un horneador no puede depender de `src/`: son dos mundos con
// ciclos de vida distintos (el sprite se hornea una vez y queda en assets/). Los colores que
// coinciden con src/data/palette.js estan COPIADOS a proposito y anotados abajo.
'use strict';
(function (root) {

  // ============================ LA PALETA ============================
  // Copia de los tonos de src/data/palette.js que el horno necesita, mas los que son propios de
  // los modelos. No se importa: ver la nota de cabecera.
  const PAL = {
    // --- la luz del atardecer del Atlantico (los tres focos) ---
    luzAmb: 0xaebccc,    // = P.body, el relleno frio del cielo
    luzKey: 0xe8c07a,    // = P.sun, el sol calido de arriba a la izquierda
    luzRim: 0xb06a35,    // = P.sunGlow, el contraluz rojizo
    luzFill: 0xd0dce8,   // relleno frontal, solo para las poses de cola (ver `escena`)

    // --- vidrio ---
    // DOS TONOS Y ES DELIBERADO: la cabina vista de LEJOS (aviones, enemigos) es el celeste
    // saturado, que a 84 px es un reflejo; el vidrio de una PIEZA SUELTA en primer plano es el
    // casi-blanco de P.canopy, porque ahi ya no reflej,a esta roto.
    canopy: '#8fd0e0',
    vidrio: '#cfe8f2',   // = P.canopy

    // --- la bandera de la deriva: celeste / blanco / celeste ---
    // Es la unica marca comun del roster. El sol de mayo NO se modela: a 84 px la deriva mide
    // 2 px de ancho y seria un pixel sucio.
    celeste: '#7fb2d8',
    blanco: '#e8eef0',   // = P.ink

    // --- acento (uno solo por escena, regla de ESTILO_VISUAL) ---
    accent: '#e8a33d',   // = P.accent

    // --- grises neutros del despiece: el volumen lo pone la hoja, el color la receta ---
    claro: '#c3c9cd', medio: '#9aa2a7', oscuro: '#6b7378', negro: '#3a4145',

    // --- la turbina encendida, en tres capas de calor ---
    fuegoHondo: '#b8341a', fuegoMedio: '#f07a22', fuegoNucleo: '#ffe6a8',
    escape: '#2b2f28',
  };

  // ============================ EL RENDERER ============================
  // Sin antialias y con alfa: el pixel art se hornea con bordes duros, y el suavizado de tres
  // deja un halo semitransparente que despues el juego estira.
  function renderer(THREE, w, h, clipY) {
    const r = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    r.setSize(w, h, false);
    // EL PLANO DE RECORTE: lo que esta por debajo de `clipY` no se hornea. Lo pidieron los buques
    // hundiendose (B2), y es una regla general del horno, no un parche de esa hoja: **no se hornea
    // lo que el juego ya tapa**. El mar recorta en la flotacion y el ancla del sprite es el borde
    // de abajo del contenido, asi que un casco con obra viva adentro de la hoja correría al buque
    // entero hacia arriba — el barco quedaria flotando por encima del agua. Con el recorte, el
    // borde de abajo del contenido ES la linea de flotacion y el anclaje sale gratis.
    if (clipY !== undefined) r.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -clipY)];
    return r;
  }

  // ============================ LA LUZ ============================
  /** LA UNICA LUZ del proyecto: atardecer del Atlantico. Tres focos y siempre los mismos —
   *  ambiente frio del cielo, sol calido de arriba a la izquierda, contraluz rojizo desde atras.
   *  Si algo se iluminara distinto se leeria como pegado de otro juego.
   *
   *  `amb` es EXPOSICION, no otra luz: cuanto abre el diafragma esta familia de hojas. Los
   *  enemigos van mas arriba que los aviones (1.8 contra 1.5) porque se los ve DE FRENTE, con el
   *  sol detras — el mismo rig, la misma direccion, otra exposicion. Con `rearFill` se agrega el
   *  relleno frontal de las poses de cola, donde el cuerpo se come toda la luz.
   *
   *  DIVERGENCIA ANOTADA (PLAN_HORNEADO §5): unificar tambien el numero de `amb` cambiaria todas
   *  las hojas existentes, y el criterio de cierre de B0 es que salgan identicas. Queda de perilla
   *  por familia, con el default en el valor de los aviones. */
  function escena(THREE, o) {
    o = o || {};
    const sc = new THREE.Scene();
    sc.add(new THREE.AmbientLight(PAL.luzAmb, o.amb === undefined ? 1.5 : o.amb));
    const dl = new THREE.DirectionalLight(PAL.luzKey, 1.6); dl.position.set(-3, 5, 4); sc.add(dl);
    const rim = new THREE.DirectionalLight(PAL.luzRim, 0.5); rim.position.set(2, 1, -4); sc.add(rim);
    if (o.rearFill) {
      const fill = new THREE.DirectionalLight(PAL.luzFill, 1.3);
      fill.position.set(1, 2, 12); sc.add(fill);
    }
    return sc;
  }

  // ============================ LA CAMARA ============================
  /** LA UNICA CAMARA: perspectiva larga (24-26°), apenas por arriba del objeto, mirando al
   *  centro. Lo que cambia por familia es la DISTANCIA (cuanto llena el frame) y si mira desde
   *  atras (aviones) o de frente (enemigos) — eso ultimo lo resuelve el modelo dandose vuelta,
   *  no la camara.
   *
   *  `ref` es el aspecto de REFERENCIA con el que se eligio el fov. Si el frame cambia de forma
   *  (paso de 84x48 a 84x84 cuando el alabeo de 60° paraba la envergadura), hay que recalcular el
   *  fov VERTICAL para que el campo HORIZONTAL no se mueva; si no, el bicho se agranda a lo ancho
   *  y se sale por los costados. Sin `ref`, el fov se toma tal cual. */
  function camara(THREE, w, h, o) {
    const asp = w / h;
    let fov = o.fov;
    if (o.ref) {
      const halfH = Math.tan(fov * Math.PI / 360) * o.ref / asp;
      fov = 2 * Math.atan(halfH) * 180 / Math.PI;
    }
    const cam = new THREE.PerspectiveCamera(fov, asp, o.near || 1, o.far || 100);
    cam.position.set(o.pos[0], o.pos[1], o.pos[2]);
    cam.lookAt(0, o.lookY || 0, 0);
    return cam;
  }

  // ============================ LAS PRIMITIVAS ============================
  /** El juego de volumenes con el que se arma TODO modelo horneado. Recibe THREE por parametro —
   *  mismo patron que `ship3d.js` en el runtime: un modelo, dos usos.
   *
   *  Antes todo era BoxGeometry y las alas eran escaleras de cajas. Con cuerpos redondos y
   *  plantas de ala reales el sprite gana silueta y sombreado curvo, que es lo que de verdad se
   *  lee a 84 px — mucho mas que el detalle chico. */
  function kit(THREE) {
    const MAT = c => new THREE.MeshLambertMaterial({ color: c });
    /** MATERIAL QUE NO TOMA LUZ. El fuego no se ilumina: se ilumina solo. Con el Lambert de todo
     *  lo demas, la boca de la turbina quedaba apagada del lado en sombra. */
    const EMIT = c => new THREE.MeshBasicMaterial({ color: c });

    const add = (g, geo, c, x, y, z, rx, ry, rz) => {
      const m = new THREE.Mesh(geo, MAT(c));
      m.position.set(x, y, z);
      if (rx) m.rotation.x = rx; if (ry) m.rotation.y = ry; if (rz) m.rotation.z = rz;
      g.add(m); return m;
    };
    const addEmit = (g, geo, c, x, y, z, rx) => {
      const m = new THREE.Mesh(geo, EMIT(c));
      m.position.set(x, y, z); if (rx) m.rotation.x = rx;
      g.add(m); return m;
    };
    const B = (g, w, h, d, c, x, y, z, ry) =>
      add(g, new THREE.BoxGeometry(w, h, d), c, x, y, z, 0, ry || 0, 0);
    /** Cilindro a lo LARGO DEL EJE Z (el eje del avion). rT = radio hacia la nariz. */
    const CYL = (g, rT, rB, len, c, x, y, z, seg) =>
      add(g, new THREE.CylinderGeometry(rT, rB, len, seg || 10), c, x, y, z, Math.PI / 2);
    /** Cilindro PARADO (eje vertical): mastiles, chimeneas. */
    const POST = (g, rT, rB, len, c, x, y, z, seg) =>
      add(g, new THREE.CylinderGeometry(rT, rB, len, seg || 8), c, x, y, z);
    /** Cono sobre Z. `back=true` lo apunta hacia la cola (tobera); si no, hacia la nariz. */
    const CONE = (g, r, len, c, x, y, z, back, seg) =>
      add(g, new THREE.ConeGeometry(r, len, seg || 10), c, x, y, z, back ? Math.PI / 2 : -Math.PI / 2);
    /** Esfera achatada — cabinas y carenados. */
    const DOME = (g, r, c, x, y, z, sx, sy, sz) => {
      const m = add(g, new THREE.SphereGeometry(r, 10, 7), c, x, y, z);
      m.scale.set(sx || 1, sy || 1, sz || 1); return m;
    };
    /** PLANTA extruida: recibe puntos [x, adelante] y los extruye en grosor VERTICAL. Es lo que
     *  permite un borde de ataque en flecha CONTINUO — con cajas quedaba escalonado.
     *
     *  Devuelve un GRUPO, no el mesh: PLATE ya gasta su rotacion en X para acostar la planta, y
     *  encadenar un segundo giro sobre el mismo objeto da un euler compuesto que no es el que uno
     *  espera (asi salio la primera deriva: un hilo tirado de costado). Con el grupo, el que llama
     *  puede inclinar o parar la superficie sin tocar la rotacion interna. */
    function PLATE(g, pts, thick, c, x, y, z) {
      const sh = new THREE.Shape();
      sh.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
      sh.closePath();
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: false }), MAT(c));
      m.rotation.x = -Math.PI / 2;   // el extruido crece en +Z local -> pasa a ser la vertical
      const grp = new THREE.Group();
      grp.add(m); grp.position.set(x, y, z); g.add(grp);
      return grp;
    }
    /** Ala/estabilizador: envergadura, cuerda de raiz, cuerda de punta y FLECHA (cuanto retrasa
     *  la punta). Con `dih` se arma en DOS MITADES inclinadas. Vale la pena: cada mitad toma la
     *  luz distinto y el ala deja de leerse como una barra plana.
     *
     *  ⚠ EL SIGNO DE `dih` ESTA AL REVES DE LA CONVENCION AERONAUTICA, Y ESTO YA COSTO DOS VECES.
     *
     *      dih > 0  →  las puntas BAJAN   (anhedro: Harrier, Hercules)   silueta de "A"  /\
     *      dih < 0  →  las puntas SUBEN   (diedro:  casi todo lo demas)  silueta de "V"  \/
     *
     *  Afuera, "anhedro" se escribe con signo NEGATIVO. Aca no: la rotacion se aplica sobre la
     *  mitad ya espejada, asi que el signo sale invertido. Quien razone la convencion de memoria
     *  —en vez de mirar la hoja horneada— va a poner el ala al reves, y las dos veces que paso fue
     *  con el mismo avion: el Sea Harrier de LA COLA, que es justamente el que tiene el anhedro
     *  mas marcado del roster y donde el error se ve de una.
     *
     *  ESTA NOTA VIVE ACA, EN LA PRIMITIVA, y no en el modelo que la usa. La primera vez estaba
     *  escrita arriba de `modelJet`; al reescribir ese modelo se borro con el, y el error volvio
     *  en el archivo nuevo el mismo dia. Una leccion guardada en el lugar donde se aprendio se
     *  pierde con el codigo que la enseño; guardada en la herramienta, la lee el que la use. */
    function WING(g, span, root, tip, sweep, thick, c, y, z, dih) {
      const s = span / 2, le = root / 2, teTip = le - sweep - tip;
      if (!dih) return PLATE(g, [[-s, le - sweep], [0, le], [s, le - sweep], [s, teTip], [0, -le], [-s, teTip]],
        thick, c, 0, y, z);
      const grp = new THREE.Group(); grp.position.set(0, y, z); g.add(grp);
      for (const sg of [-1, 1]) {
        const half = PLATE(grp, [[0, le], [sg * s, le - sweep], [sg * s, teTip], [0, -le]], thick, c, 0, 0, 0);
        half.rotation.z = -sg * dih * Math.PI / 180;
      }
      return grp;
    }
    /** Deriva: la misma planta, PARADA. */
    function FIN(g, h, root, tip, sweep, thick, c, y, z) {
      const le = root / 2, teTip = le - sweep - tip;
      const grp = PLATE(g, [[0, le], [h, le - sweep], [h, teTip], [0, -le]], thick, c, thick / 2, y, z);
      grp.rotation.z = Math.PI / 2;                    // de horizontal a vertical
      return grp;
    }
    /** Rueda: cilindro oscuro acostado sobre el eje X, con llanta clara. */
    function WHEEL(g, r, w, x, y, z) {
      const m = add(g, new THREE.CylinderGeometry(r, r, w, 10), '#191d18', x, y, z);
      m.rotation.z = Math.PI / 2;
      const h = add(g, new THREE.CylinderGeometry(r * 0.45, r * 0.45, w + 0.02, 8), '#3c423a', x, y, z);
      h.rotation.z = Math.PI / 2;
      return m;
    }
    return { THREE, MAT, EMIT, add, addEmit, B, CYL, POST, CONE, DOME, PLATE, WING, FIN, WHEEL };
  }

  // ============================ EL CATALOGO DE MODELOS ============================
  // Cada `tools/models/*.js` se registra aca con `BAKE.modelos(familia, fabrica)`, donde la
  // fabrica es `(THREE, K) => ({ nombre: (spec) => Group })` — K es el kit de primitivas. El
  // horneador pide su familia con `BAKE.familia('enemies')` y recibe los constructores ya atados
  // a THREE. Que los modelos vivan en archivos propios y no adentro del HTML es lo que permite
  // que un dia el runtime 3D (`ship3d.js`) use el MISMO casco que el sprite del pasillo.
  const _fabricas = {};
  const _cache = {};
  function modelos(nombre, fabrica) { _fabricas[nombre] = fabrica; }
  function familia(nombre) {
    if (_cache[nombre]) return _cache[nombre];
    const f = _fabricas[nombre];
    if (!f) throw new Error(`bake_common: no hay catalogo de modelos '${nombre}' ` +
      `(¿falta el <script src="models/${nombre}.js"> antes del horneado?)`);
    return (_cache[nombre] = f(root.THREE, kit(root.THREE)));
  }

  // ============================ LA MEDICION (autobox) ============================
  /** LAS CAJAS SE MIDEN SOLAS (regla 3 del plan). `box` es el rectangulo de CONTENIDO adentro
   *  del frame: de ahi sale donde se ancla cada bicho — al suelo los de tierra, al centro los del
   *  aire. Hasta B0 se contaban a ojo sobre el alfa, una por una, y un numero mal copiado dejaba
   *  al enemigo flotando o enterrado sin ninguna prueba que lo agarrara.
   *
   *  Se mide la UNION de todos los frames en coordenadas LOCALES a la celda: la caja tiene que
   *  contener al bicho en cualquiera de sus poses, si no el helo cambia de altura al girar.
   *
   *  Devuelve tambien `margen`, la distancia minima al borde de la celda. La regla 5 del plan
   *  pide 2 px de aire (la leccion de explosions_front, que se cortaba sola); con menos, el
   *  horneador avisa. */
  async function medir(dataURL, fw, fh) {
    const im = new Image(); im.src = dataURL; await im.decode();
    const c = document.createElement('canvas');
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        if (d[(y * c.width + x) * 4 + 3] < 8) continue;
        const lx = x % fw, ly = y % fh;
        if (lx < x0) x0 = lx; if (lx > x1) x1 = lx;
        if (ly < y0) y0 = ly; if (ly > y1) y1 = ly;
      }
    }
    if (x1 < 0) return { fw, fh, box: { x0: 0, y0: 0, x1: 0, y1: 0 }, margen: -1, vacio: true };
    const margen = Math.min(x0, y0, fw - 1 - x1, fh - 1 - y1);
    return { fw, fh, cols: Math.round(c.width / fw), rows: Math.round(c.height / fh),
      box: { x0, y0, x1, y1 }, margen };
  }

  /** Mide un lote `{ clave: { data, fw, fh } }` y devuelve el objeto listo para serializar. */
  async function medirLote(hojas) {
    const out = {};
    for (const k of Object.keys(hojas).sort()) {
      const h = hojas[k];
      out[k] = await medir(h.data, h.fw, h.fh);
    }
    return out;
  }

  // ============================ LA SIMETRIA ============================
  /** EL FRAME NIVELADO TIENE QUE SER SIMETRICO. El sprite del medio (alabeo 0) sale de una
   *  proyeccion en perspectiva: aunque el modelo sea simetrico, el rasterizado de cada mitad cae
   *  en pixeles distintos y el ala izquierda queda medio pixel corrida respecto de la derecha.
   *  A 84 px eso se ve, y se veia: fue lo que Matias marco sobre skin_tero.
   *
   *  Se arregla ESPEJANDO la mitad derecha sobre la izquierda en la columna central de cada fila.
   *  Va en el horno y no en un script aparte a proposito: un retoque posterior se olvida de
   *  correr la proxima vez que alguien re-hornea. */
  function simetrizaCentro(g, canvas, fw, fh, colCentro) {
    for (let row = 0; row * fh < canvas.height; row++) {
      const im = g.getImageData(colCentro * fw, row * fh, fw, fh), d = im.data;
      for (let py = 0; py < fh; py++) for (let px = 0; px < fw / 2; px++) {
        const sp = fw - 1 - px;                          // su espejo del lado derecho
        const i = (py * fw + px) * 4, j = (py * fw + sp) * 4;
        d[i] = d[j]; d[i + 1] = d[j + 1]; d[i + 2] = d[j + 2]; d[i + 3] = d[j + 3];
      }
      g.putImageData(im, colCentro * fw, row * fh);
    }
  }

  // ============================ EL CONTORNO ============================
  /** UN FILO DE 1 px ALREDEDOR DEL CONTENIDO: CLARO arriba y a la izquierda, OSCURO abajo y a la
   *  derecha. Es lo unico que hace que una figura chica se despegue de un fondo del MISMO TONO.
   *
   *  POR QUE ESTA CAPACIDAD EXISTE, con el caso que la pidio. El soldado horneado se ve perfecto
   *  sobre la arena, sobre el mar y sobre la nieve, y DESAPARECE sobre la turba del atardecer
   *  (#4a5138): las dos cosas son verde oliva oscuro, y a 12 px de alto la silueta se funde. Es la
   *  misma leccion que ya dejaron la bomba en verde oliva real, el humo gris casco sobre el mar
   *  gris y los restos de B1 quemados de mas — **lo veridico no sirve si desaparece**— solo que
   *  esta vez el problema no es el color del modelo sino que NO HAY color de modelo que sirva: el
   *  soldado tiene que estar sobre turba, sobre arena y sobre nieve en la misma partida.
   *
   *  La solucion no la invento el horno: la tenia el dibujo a mano de `render/world.js`, que llego
   *  a ella por el mismo camino ("al oscurecer el uniforme el bloque y el cuerpo se fundian en una
   *  mancha"). Un contorno de UN solo tono falla contra la mitad de los fondos; con los dos, contra
   *  ninguno — el filo claro salva los fondos oscuros y el oscuro salva los claros, y siempre hay
   *  uno de los dos peleando.
   *
   *  VA EN EL HORNO Y NO EN EL RENDER, aunque el problema sea del fondo, porque el filo no depende
   *  del fondo: depende de la SILUETA, que es lo unico que el horno sabe y el render no. Hacerlo en
   *  el juego seria redibujar el sprite cuatro veces por soldado por cuadro para sacar un dato que
   *  no cambia nunca.
   *
   *  El filo COME 1 px de margen, asi que el encuadre tiene que dejar 3 (la regla 5 pide 2 de aire
   *  DESPUES del contorno). Se aplica celda por celda para que no se derrame entre frames vecinos. */
  function contorno(g, canvas, fw, fh, claro, oscuro) {
    const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const L = hex(claro), O = hex(oscuro);
    for (let cy = 0; cy * fh < canvas.height; cy++) {
      for (let cx = 0; cx * fw < canvas.width; cx++) {
        const im = g.getImageData(cx * fw, cy * fh, fw, fh), d = im.data;
        const op = (x, y) => x >= 0 && y >= 0 && x < fw && y < fh && d[(y * fw + x) * 4 + 3] > 8;
        const orig = d.slice();
        const opO = (x, y) => x >= 0 && y >= 0 && x < fw && y < fh && orig[(y * fw + x) * 4 + 3] > 8;
        for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) {
          if (op(x, y)) continue;
          // el orden importa: si el cuerpo esta ABAJO o a la DERECHA, este pixel vacio es el borde
          // de arriba/izquierda — el lado del sol — y va claro. Si no, es el lado en sombra.
          const c = (opO(x, y + 1) || opO(x + 1, y)) ? L
            : (opO(x, y - 1) || opO(x - 1, y)) ? O : null;
          if (!c) continue;
          const i = (y * fw + x) * 4;
          d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
        }
        g.putImageData(im, cx * fw, cy * fh);
      }
    }
  }

  root.BAKE = { PAL, renderer, escena, camara, kit, modelos, familia, medir, medirLote, simetrizaCentro, contorno };
})(window);
