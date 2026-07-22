// MUNDO 3D (three.js) del climax del MOMENTUM.
//
// Renderiza cielo + mar + barco de cajas a baja resolucion; game.js blitea el resultado DENTRO
// del mismo transform del canvas que rota el mundo 2D, asi el alabeo/paneo/shake le pegan gratis
// y la capa 2D (zonas, mira, cabina) queda alineada por construccion.
//
// El modulo NO lee variables globales del juego: frame(w) recibe un snapshot de solo lectura
// con lo que necesita del mundo. Si three.js no cargo (o ?no3d), todo esto se saltea solo y
// rige el dibujo 2D de siempre.
import { SHIP_CLASS } from '../data/ships.js';

const THREE = window.THREE || null;
const has3D = !!THREE && !/\bno3d\b/.test(location.search);   // ?no3d fuerza el fallback 2D (pruebas)
const W = 320, HOR = 64, F = 90;   // mismos valores que game.js: la proyeccion 3D calza con proj()

// Durante el momentum, three.js renderiza el FONDO (cielo + mar + barco 3D de cajas) a baja
// resolucion y el resultado se blitea DENTRO del mismo transform del canvas que rotaba el
// mundo 2D → el alabeo/paneo/shake le pegan al 3D gratis y la capa 2D (zonas, mira, cabina)
// queda alineada por construccion. Claves de la equivalencia con proj():
//  - camara con foco 90px y PUNTO PRINCIPAL en (W/2, HOR) via setViewOffset (imagen virtual
//    de 320x232 centrada en el horizonte; se renderiza una ventana extendida de 464x384
//    para que el roll de 360° nunca descubra esquinas vacias).
//  - barco de TAMAÑO FIJO (M3_LEN) y DISTANCIA variable D = M3_LEN*F/len_px → la proyeccion
//    calza exacta con momShipGeom (len, deckY) y el acercamiento entre pasadas es fisico.
// Sin THREE (o ?no3d) todo esto se saltea y rige el dibujo 2D de siempre.
export const M3W = 464, M3H = 384;          // overscan del render (cubre rolls completos)
const M3_LEN = 45;                   // eslora en unidades de mundo
const M3_U = M3_LEN * 9 / (W * 0.82);          // "uh" en mundo (proporcion constante del 2D)
const M3_DECK = -M3_LEN * 36 / (W * 0.82);     // altura de cubierta (deck) bajo el horizonte
const M3_WATER = -M3_LEN * 49.5 / (W * 0.82);  // linea de flotacion (deckY + hullH en 2D)
const WATER_NORMALS_SRC = '../assets/img/waternormals.jpg';   // normal map del agua (three/Water)
// ESPEJO realista (addon three/Water): DESACTIVADO por decision de diseño (20/7) — probado
// en momentum y en toda el agua, quedaba "super plano" vs el mar de cuadrados, que es la
// identidad del juego. La integracion queda dormida: poner true para re-probarla.
const MIRROR_SEA = false;
const SEA_ALPHA = 0.6;    // opacidad de los cuadrados del mar 3D (momentum)
const SEA_ALPHA2D = 0.6;  // opacidad de los cuadrados del mar 2D (todo el vuelo)
// Mar 3D en VUELO NORMAL: APAGADO por decision de diseño (20/7) — por mas que se calibro
// (bandas, receta de puntos, cielo, sol), el cambio de renderer al cruzar la costa siempre
// dejaba una diferencia visible. El 2D clasico corre TODO el vuelo (identico por definicion)
// y el 3D queda para el MOMENTUM (otro plano de camara, ahi no hay transicion que igualar).
const SEA3D_FLIGHT = false;
const MOM3D = { ready: false, failed: false, on: false, renderer: null, scene: null, cam: null, ship: null, ships: null, debris: null, waterTex: null, waterGeo: null };
function m3tex(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const tx = new THREE.CanvasTexture(c);
  tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.NearestFilter;
  return tx;
}
function m3box(parent, w, h, d, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z); parent.add(m); return m;
}
function mom3DInit() {
  if (MOM3D.ready) return true;
  if (MOM3D.failed || !has3D) return false;
  try {
    const r = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
    r.setSize(M3W, M3H, false);
    const cam = new THREE.PerspectiveCamera(2 * Math.atan(116 / F) * 180 / Math.PI, 320 / 232, 2, 5200);
    cam.setViewOffset(320, 232, -72, -50, M3W, M3H);   // punto principal en (W/2, HOR) + overscan
    const sc = new THREE.Scene();
    // color placeholder: m3Palette() fija el real (SKY.horizon) en el primer frame
    sc.fog = new THREE.Fog(new THREE.Color('#7d6a4e'), 320, 2100);

    // cielo/sol/mar: materiales SIN textura — las pinta m3Palette() con la paleta VIGENTE
    // (y las repinta solas si cambias FONDO/AGUA en el menu [M])
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(13500, 3400),
      new THREE.MeshBasicMaterial({ fog: false, depthWrite: false }));
    // la fila del horizonte del gradiente (v=0.72) tiene que proyectar a y=0 del mundo
    sky.position.set(0, 3400 * 0.22, -2450); sc.add(sky);
    MOM3D.sky = sky;   // la x se mueve por frame (parallax x0.8 del fondo-imagen)
    const sun = new THREE.Mesh(new THREE.PlaneGeometry(560, 560),
      new THREE.MeshBasicMaterial({ transparent: true, fog: false, depthWrite: false }));
    sun.position.set(0, 175, -2350); sc.add(sun);
    MOM3D.sun = sun;   // la x se mueve por frame para clavar el parallax del sol 2D (cam.x*1.4)
    // malla segmentada: los vertices se desplazan por frame → OLAS reales (con el t
    // ralentizado del momentum ondulan en camara lenta; en vuelo normal, a ritmo real)
    // plano LEJANO: fondo del mar hasta el horizonte, COLOR PLANO (sin textura: las motas
    // repetidas a distancia eran una banda de ruido feo). Ancho 13500: cubre todo el campo
    // visual hasta la niebla (a 2450u hacen falta ±6300). El parche se funde a este color.
    MOM3D.waterGeo = new THREE.PlaneGeometry(13500, 4200, 1, 1);
    const water = new THREE.Mesh(MOM3D.waterGeo, new THREE.MeshBasicMaterial({}));
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, M3_WATER - 0.3, -1800 + 60); sc.add(water);
    // parche de oleaje con FORMA DE FRUSTUM: cada fila se ensancha con la distancia para
    // cubrir TODO el ancho visible en toda profundidad (las posiciones x/z se calculan por
    // frame junto con la altura seaH). La amplitud se apaga hacia el fondo del parche para
    // fundirse con el plano lejano sin costura.
    // SUPERFICIE (frustum): la forma/silueta de las olas, todo el ancho. Colores POR FILA
    // (vertex colors) replicando las bandas de profundidad del drawSea 2D (base0/1/2).
    MOM3D.patchGeo = new THREE.PlaneGeometry(460, 280, 150, 92);   // solo aporta la GRILLA (150x92)
    MOM3D.patchCols = 151; MOM3D.patchRows = 93;
    MOM3D.patchGeo.setAttribute('color',
      new THREE.BufferAttribute(new Float32Array(MOM3D.patchGeo.attributes.position.count * 3), 3));
    const patch = new THREE.Mesh(MOM3D.patchGeo, new THREE.MeshBasicMaterial({ vertexColors: true }));
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(0, M3_WATER, 0); sc.add(patch);
    // PUNTOS CUADRADOS: receta del mar 2D (drawSeaDots) — grilla uniforme en MUNDO
    // (2.8u × 3u) hasta 190 de profundidad, con ANCHO POR FILA acorde al frustum (igual
    // que el 2D ensanchado): las columnas que una fila no necesita se esconden bajo la
    // superficie. Geometria propia (la del frustum amontonaba los puntos cerca).
    // grilla ADAPTATIVA: cerca 0.7x0.75 (maxima densidad) y el espaciado crece con la
    // distancia para mantener ~1px de separacion en pantalla → alfombra densa sin explotar
    // el costo. drawRange dibuja solo los puntos usados en el frame.
    MOM3D.dotN = 48000;
    MOM3D.dotsGeo = new THREE.BufferGeometry();
    MOM3D.dotsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MOM3D.dotN * 3), 3));
    MOM3D.dotsGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MOM3D.dotN * 3), 3));
    // alpha SEA_ALPHA: como el 2D, que dibujaba los puntos translucidos sobre el agua oscura
    // (siempre tienen la superficie opaca detras → la transparencia no muestra huecos)
    const dots = new THREE.Points(MOM3D.dotsGeo,
      new THREE.PointsMaterial({ vertexColors: true, size: 0.06, sizeAttenuation: true, transparent: true, opacity: SEA_ALPHA }));   // 1/4 del tamaño clasico (0.24)
    dots.rotation.x = -Math.PI / 2;
    dots.position.set(0, M3_WATER + 0.3, 0); sc.add(dots);   // apenas sobre la superficie
    patch.frustumCulled = dots.frustumCulled = false;        // las grillas se reubican por frame
    MOM3D.dotsMat = dots.material; MOM3D.patch = patch; MOM3D.dots = dots;
    // AGUA REALISTA (addon three/Water): normal maps animados en GPU, reflejo del cielo y
    // BRILLO DEL SOL. En vuelo normal vive de fondo (el glint aparece camino al horizonte,
    // mas alla del parche); en MOMENTUM toma toda la superficie y el BARCO SE REFLEJA.
    // Reemplaza al plano lejano plano; si el addon faltara, este queda como respaldo.
    MOM3D.waterFlat = water;
    if (THREE.Water && MIRROR_SEA) {
      const wn = new THREE.TextureLoader().load(WATER_NORMALS_SRC,
        (tx) => { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; });
      const waterR = new THREE.Water(new THREE.PlaneGeometry(6400, 3600), {
        textureWidth: 256, textureHeight: 256,
        waterNormals: wn,
        sunDirection: new THREE.Vector3(-0.5, 0.6, 0.45).normalize(),
        sunColor: 0xe8c07a,
        waterColor: 0x2e4a4e,
        distortionScale: 2.6,
        fog: true,
      });
      waterR.rotation.x = -Math.PI / 2;
      waterR.position.set(0, M3_WATER - 0.3, -1800 + 60);
      // PARCHE del shader: a angulo rasante el fresnel refleja ~100% del cielo (el mar queda
      // "pintado" naranja al atardecer) y el termino del color del agua (scatter) muere con
      // el angulo. Dos toques: (1) tope a la reflectancia, (2) el albedo SIEMPRE mezcla el
      // color del agua → mar teal con el cielo como brillo/glint, no como pintura.
      waterR.material.fragmentShader = waterR.material.fragmentShader
        .replace(
          'float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
          'float reflectance = min( rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 ), 0.55 );')
        .replace(
          'vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), reflectionSample + specularLight, reflectance );',
          'vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), reflectionSample + specularLight, reflectance );' +
          ' albedo = mix( albedo, waterColor * 1.35, 0.52 ) + specularLight * 0.4;');
      waterR.material.needsUpdate = true;
      sc.add(waterR);
      MOM3D.waterR = waterR;
    }
    MOM3D.skyMat = sky.material; MOM3D.sunMat = sun.material; MOM3D.waterMat = water.material;
    MOM3D.patchMat = patch.material;

    // luces: ambiente frio + sol calido de frente-izquierda + rim desde atras
    sc.add(new THREE.AmbientLight(0xaebccc, 1.6));
    const dl = new THREE.DirectionalLight(0xe8c07a, 1.7); dl.position.set(-320, 380, 260); sc.add(dl);
    const rim = new THREE.DirectionalLight(0xb06a35, 0.6); rim.position.set(120, 140, -600); sc.add(rim);

    // barcos POR CLASE (t42/t21/log): casco comun + superestructura propia. Las masas de
    // cada zona critica se colocan EXACTO en sus coordenadas de layout (u,v,w,h de
    // MOM_LAYOUTS, misma matematica que momZoneRect) → los corchetes 2D envuelven
    // geometria 3D real en las tres clases. Se muestra el de SHIP_CLASS[objectiveShip].
    const L = M3_LEN, U = M3_U;
    // caja en coords de ZONA: centro x=u*L/2, base v*U sobre cubierta, tamano (w*L, h*U)
    const m3zone = (g2, u, v, w2, h2, depth, color) =>
      m3box(g2, w2 * L, h2 * U, depth, color, u * L / 2, (v + h2 / 2) * U, 0);
    const m3hull = () => {
      const g2 = new THREE.Group();
      m3box(g2, L, U * 3, U * 3.4, '#39434e', 0, -U * 1.5, 0);                 // casco
      m3box(g2, L * 0.995, U * 0.3, U * 3.5, '#5c6e73', 0, -U * 0.14, 0);      // cubierta
      m3box(g2, U * 0.8, U * 1.9, U * 2.2, '#39434e', -L / 2 - U * 0.38, -U * 1.0, 0);  // proa
      m3box(g2, U * 0.55, U * 1.8, U * 2.4, '#39434e', L / 2 + U * 0.26, -U * 1.05, 0); // popa
      return g2;
    };
    const ships = {};
    {   // Destructor Tipo 42 (SHEFFIELD/COVENTRY): AA proa+popa, mastil con radar, puente
      const s2 = ships.t42 = m3hull();
      m3zone(s2, -0.05, 1, 0.20, 2, U * 2.6, '#454f56');                        // puente (zona)
      m3box(s2, L * 0.16, U * 0.45, U * 2.65, '#8fd0e0', -L * 0.025, U * 2.55, 0); // ventanas
      m3box(s2, L * 0.05, U * 1.8, U * 1.1, '#454f56', L * 0.185, U * 0.9, 0);  // chimenea
      m3box(s2, L * 0.012, U * 2.7, L * 0.012, '#454f56', L * 0.05, U * 1.35, 0); // mastil
      m3zone(s2, 0.10, 2.7, 0.11, 1.5, L * 0.03, '#525d66');                    // radar (zona)
      for (const s3 of [-0.52, 0.52]) {                                          // AA (zonas)
        m3zone(s2, s3, 0, 0.15, 1.3, U * 1.5, '#3d474d');
        m3box(s2, L * 0.016, U * 0.6, L * 0.016, '#2b3338', s3 * L / 2, U * 1.55, U * 0.55);
      }
    }
    {   // Fragata Tipo 21 (ARDENT/ANTELOPE): silueta baja, radar chico, MOTORES al casco
      const s2 = ships.t21 = m3hull();
      m3box(s2, L * 0.30, U * 1.6, U * 2.4, '#49545e', -L * 0.05, U * 0.8, 0);  // superestructura baja
      m3box(s2, L * 0.13, U * 0.4, U * 2.45, '#8fd0e0', -L * 0.05, U * 1.55, 0); // ventanas
      m3box(s2, L * 0.012, U * 2.7, L * 0.012, '#454f56', L * 0.05, U * 1.35, 0); // mastil
      m3zone(s2, 0.10, 2.7, 0.09, 1.3, L * 0.025, '#525d66');                   // radar chico (zona)
      for (const e of [{ u: -0.30 }, { u: 0.26 }]) {                             // MOTORES (zonas, al casco)
        m3zone(s2, e.u, -0.3, 0.14, 1.2, U * 2.0, '#333d46');
        m3box(s2, L * 0.05, U * 1.1, U * 0.9, '#49545e', e.u * L / 2, U * 1.15, 0);  // escape
      }
      for (const s3 of [-0.52, 0.52]) m3zone(s2, s3, 0, 0.15, 1.3, U * 1.4, '#3d474d'); // AA (zonas)
    }
    {   // Logistico (SIR GALAHAD/CONVEYOR): contenedores, AA unica, DEPOSITO, puente a popa
      const s2 = ships.log = m3hull();
      m3zone(s2, 0.32, 1, 0.16, 2, U * 2.6, '#4a5058');                         // puente a popa (zona)
      m3box(s2, L * 0.13, U * 0.45, U * 2.65, '#8fd0e0', L * 0.16, U * 2.55, 0); // ventanas
      m3zone(s2, 0.05, 0, 0.30, 1.6, U * 2.8, '#5a5344');                       // DEPOSITO (zona)
      const crates = ['#6b4a3a', '#44553f', '#3d4a58', '#5a5344'];               // contenedores
      for (let i2 = 0; i2 < 5; i2++)
        m3box(s2, L * 0.055, U * 0.55, U * (1.6 + (i2 % 2)), crates[i2 % 4],
          -L * 0.06 + i2 * L * 0.055, U * (1.6 + 0.28), 0);
      m3zone(s2, -0.30, 0, 0.15, 1.3, U * 1.5, '#3d474d');                      // AA unica (zona)
      m3box(s2, L * 0.012, U * 2.4, L * 0.012, '#454f56', -L * 0.12, U * 1.2, 0); // pluma/grua
    }
    for (const k in ships) { ships[k].position.set(0, M3_DECK, -60); ships[k].visible = false; sc.add(ships[k]); }

    // restos flotando alrededor del barco (bob lento en camara lenta; siguen la z del barco)
    const debris = new THREE.Group();
    for (let i2 = 0; i2 < 9; i2++) {
      const d2 = m3box(debris, 0.9 + (i2 % 3) * 0.7, 0.4, 0.8 + (i2 % 2) * 0.6,
        i2 % 2 ? '#2c343c' : '#3f3a30', (i2 / 8 - 0.5) * L * 1.9, 0, ((i2 * 37) % 40) - 14);
      d2.rotation.y = i2 * 0.7;
    }
    debris.position.y = M3_WATER + 0.15; sc.add(debris);

    MOM3D.renderer = r; MOM3D.scene = sc; MOM3D.cam = cam; MOM3D.ships = ships; MOM3D.debris = debris;
    MOM3D.ship = ships.t42;
    MOM3D.ready = true;
    m3Palette();          // primer pintado de cielo/sol/mar con la paleta actual
    r.render(sc, cam);    // render de CALENTAMIENTO: compila los shaders ahora (con texturas
                          // ya asignadas) y no en el primer frame sobre el mar → sin trabada
    return true;
  } catch (e) { MOM3D.failed = true; return false; }   // sin WebGL → fallback 2D
}
// (re)pinta las texturas 3D con la paleta VIGENTE (SKY/WATER); corre en cada frame 3D
// pero solo trabaja cuando cambio la config del mapa (FONDO o AGUA)
function m3Palette(w) {
  const key = w.cfg.sky + '|' + w.cfg.water;
  if (MOM3D.palKey === key) return;
  MOM3D.palKey = key;
  MOM3D.scene.fog.color.set(w.SKY.horizon);
  const old = [MOM3D.skyMat.map, MOM3D.sunMat.map, MOM3D.waterMat.map];
  const tbi = w.tbackImg();
  MOM3D.sun.visible = !tbi;   // con imagen de fondo, el sol lo trae la imagen
  if (tbi) {
    // FONDO por clima en el telon: mismo anclaje que el 2D — la banda visible del telon
    // (v 0.21..0.72) muestra la misma franja de imagen que el cover 2D, horizonte en v=0.72.
    MOM3D.skyMat.map = m3tex(1024, 512, (x2) => {
      x2.fillStyle = '#0a1014'; x2.fillRect(0, 0, 1024, 512);
      const hh2 = 1047, top = -385, ww = 950, x0 = (1024 - ww) / 2;   // mapeo pre-calculado (cover 460px, HOR=64)
      x2.drawImage(tbi, 0, 0, 1, tbi.naturalHeight, 0, top, x0, hh2);                       // borde izq estirado
      x2.drawImage(tbi, tbi.naturalWidth - 1, 0, 1, tbi.naturalHeight, x0 + ww, top, 1024 - x0 - ww, hh2);  // der
      x2.drawImage(tbi, x0, top, ww, hh2);
    });
  } else {
  // cielo: MISMO degrade que el 2D (skyTop → 0.6 skyMid → horizonte + banda sunGlow).
  // En el telon (horizonte en v=0.72, tope de pantalla ~v=0.21) esos puntos caen asi:
  MOM3D.skyMat.map = m3tex(4, 512, (x2) => {
    const g2 = x2.createLinearGradient(0, 0, 0, 512);
    g2.addColorStop(0, w.SKY.skyTop); g2.addColorStop(0.21, w.SKY.skyTop);
    g2.addColorStop(0.52, w.SKY.skyMid); g2.addColorStop(0.695, w.SKY.horizon);
    g2.addColorStop(0.72, w.SKY.sunGlow); g2.addColorStop(0.74, w.SKY.horizon);
    g2.addColorStop(1, '#0a1014');
    x2.fillStyle = g2; x2.fillRect(0, 0, 4, 512);
  });
  }
  // sol PIXELADO como el 2D: rect de 14x8 + glow de 20x12 al 35% (nada de circulos suaves)
  MOM3D.sunMat.map = m3tex(64, 64, (x2) => {
    x2.clearRect(0, 0, 64, 64);
    x2.globalAlpha = 0.35; x2.fillStyle = w.SKY.sunGlow; x2.fillRect(2, 13, 61, 37);
    x2.globalAlpha = 1; x2.fillStyle = w.SKY.sun; x2.fillRect(11, 20, 42, 24);
  });
  // fondo lejano = base0 (la banda mas lejana del drawSea 2D); la superficie cercana lleva
  // las bandas base0/1/2 por fila (vertex colors, ver loop del frame)
  const c2 = (h2) => { const c3 = new THREE.Color(h2); return [c3.r, c3.g, c3.b]; };
  MOM3D.waterMat.map = null; MOM3D.waterMat.color.set(w.WATER.base0);
  MOM3D.patchMat.map = null;
  MOM3D.wBands = [c2(w.WATER.base0), c2(w.WATER.base1), c2(w.WATER.base2)];
  // colores del oleaje por altura (mismos roles que drawSeaDots) para el tinte por vertice
  MOM3D.wCols = [c2(w.WATER.crest), c2(w.WATER.mid), c2(w.WATER.deep), c2(w.WATER.base1), c2(w.WATER.spark)];
  MOM3D.skyMat.needsUpdate = MOM3D.sunMat.needsUpdate = MOM3D.waterMat.needsUpdate = MOM3D.patchMat.needsUpdate = true;
  for (const t2 of old) if (t2) t2.dispose();
  // el agua realista tambien sigue la paleta. El tono elegido es w.WATER.deep (#3a5f63 en mar):
  // probado en vivo — los base oscuros daban mar MARRON (ganaba el reflejo del atardecer) y
  // el mid quedaba lechoso; deep hace leer el espejo como AGUA con el cielo de brillo.
  if (MOM3D.waterR) {
    MOM3D.waterR.material.uniforms.waterColor.value.set(w.WATER.deep);
    MOM3D.waterR.material.uniforms.sunColor.value.set(w.SKY.sun);
  }
}
// un frame del mundo 3D. Dos modos, mismas escena/camara:
//  - MOMENTUM (MOM3D.on): fondo completo con el BARCO, camara fija (el roll lo pone el canvas)
//  - MAR ABIERTO (MOM3D.sea): cielo+mar en vuelo normal; la camara replica la del juego
//    ((w.cam.x, w.cam.y) en metros sobre el nivel del mar) y el barco de aproximacion sigue en 2D.
// false ⇒ nada de 3D este frame: dibujar el fondo 2D de siempre.
export function frame(w) {
  MOM3D.on = MOM3D.sea = false;
  const wantMom = w.state === 'momentum' && !!w.mom;
  // mar abierto: pasada la franja de costa/pista (que es arte 2D, igual que en drawSea)
  const wantSea = SEA3D_FLIGHT && !wantMom && (w.state === 'play' || w.state === 'takeoff' || w.state === 'dead')
    && w.cfg.terrain === 'sea' && (w.dist + w.momDrift) >= w.cfg.coast + 80;
  if ((!wantMom && !wantSea) || !mom3DInit()) return false;
  m3Palette(w);   // repinta cielo/sol/mar si cambio FONDO/AGUA
  // barcos y restos: solo existen en el momentum
  const cls = SHIP_CLASS[w.objectiveShip] || 't42';
  for (const k in MOM3D.ships) MOM3D.ships[k].visible = wantMom && k === cls;
  MOM3D.debris.visible = wantMom;
  if (wantMom) {
    MOM3D.ship = MOM3D.ships[cls];
    const g = w.momShipGeom();
    const D = M3_LEN * F / g.len;                        // acercamiento FISICO: D = L*F/len_px
    MOM3D.ship.position.z = -D;
    MOM3D.debris.position.z = -D;                        // restos cabeceando junto al barco
    for (let i = 0; i < MOM3D.debris.children.length; i++) {
      const d2 = MOM3D.debris.children[i];
      d2.position.y = Math.sin(w.t * 1.2 + i * 1.9) * 0.45;
      d2.rotation.z = Math.sin(w.t * 0.9 + i * 2.6) * 0.14;
      d2.rotation.x = Math.sin(w.t * 1.05 + i * 1.3) * 0.11;
    }
    MOM3D.cam.position.set(0, 0, 0);
    MOM3D.on = true;
  } else {
    // camara del juego: w.cam.y son metros de altitud; el plano del agua vive en M3_WATER
    MOM3D.cam.position.set(w.cam.x, w.cam.y + M3_WATER, 0);
    MOM3D.sea = true;
  }
  // el sol replica el parallax del 2D (pantalla: W/2 - w.cam.x*1.4) — sin salto en la transicion
  MOM3D.sun.position.x = MOM3D.cam.position.x - 36.56 * w.cam.x;
  // y el telon acompaña con el parallax suave del fondo-imagen (x0.8, como el 2D)
  MOM3D.sky.position.x = MOM3D.cam.position.x - 21.8 * w.cam.x;
  const dv2 = dist + momDrift;   // el drift/avance lo llevan las olas del parche (wz = dv2 + camZ)
  // mar de CUADRADOS en todos lados (vuelo normal y momentum) — el look del juego.
  // Si MIRROR_SEA esta activo, el espejo reemplaza todo (parche/puntos/plano ocultos).
  if (MOM3D.waterR) {
    MOM3D.waterR.material.uniforms.time.value = w.t * 0.8;   // ondulacion GPU (t lento en momentum → slow-mo)
    MOM3D.waterR.visible = true;
    MOM3D.waterFlat.visible = false;
    MOM3D.patch.visible = false;
    MOM3D.dots.visible = false;
  }
  // SUPERFICIE (frustum): solo posiciones — la forma/silueta de las olas (seaH, t ralentizado
  // en momentum). Filas mas lejanas mas anchas → cubre todo el ancho visible; la amplitud
  // se apaga al fondo para empalmar con el plano lejano de color plano.
  if (MOM3D.patch.visible) {
    const p = MOM3D.patchGeo.attributes.position, c = MOM3D.patchGeo.attributes.color;
    const COLS = MOM3D.patchCols, ROWS = MOM3D.patchRows;
    const camX = MOM3D.cam.position.x;   // sigue el paneo lateral de la camara
    const camY = MOM3D.cam.position.y - M3_WATER;   // altura sobre el agua (para las bandas 2D)
    const [B0, B1, B2] = MOM3D.wBands;
    for (let row = 0; row < ROWS; row++) {
      const camZ2 = 5 + (row / (ROWS - 1)) * 370;                  // profundidad 5..375
      const halfW = 48 + 2.6 * camZ2;                              // ancho visible a esa distancia (+margen)
      const amp = camZ2 < 300 ? 1 : Math.max(0, 1 - (camZ2 - 300) / 75);   // fundido al plano lejano
      const wz = dv2 + camZ2;
      // banda de profundidad IGUAL al drawSea 2D: f = dy/(H-HOR) → base2 cerca, base1, base0 lejos
      const f2 = (camY * F / camZ2) / 116;
      const B = f2 >= 0.5 ? B2 : f2 >= 0.22 ? B1 : B0;
      for (let col = 0; col < COLS; col++) {
        const i = row * COLS + col;
        const wx = camX + (col / (COLS - 1) * 2 - 1) * halfW;
        p.setXYZ(i, wx, camZ2, w.seaH(wx, wz) * amp);                // local: x, y→(-z mundo), z→altura
        c.setXYZ(i, B[0], B[1], B[2]);
      }
    }
    p.needsUpdate = c.needsUpdate = true;
  }
  // PUNTOS CUADRADOS: la receta EXACTA del mar 2D (drawSeaDots) — grilla uniforme en MUNDO
  // (2.8u × 3u), franja de ±76 alrededor de la camara, profundidad 4..190. Color por altura
  // de ola (crestas claras, bandas de luz viajando, destellos cerca) con fade a base lejos.
  if (MOM3D.dots.visible) {
    const p = MOM3D.dotsGeo.attributes.position, c = MOM3D.dotsGeo.attributes.color;
    const [CR, MI, DE, BA, SP] = MOM3D.wCols;
    const camX = MOM3D.cam.position.x, N = MOM3D.dotN;
    let i = 0;
    // filas: paso 0.75 cerca, creciendo con z² para mantener ~1px de separacion en pantalla
    for (let camZ2 = 4; camZ2 < 190 && i < N - 950; camZ2 += Math.max(0.75, camZ2 * camZ2 * 0.0011)) {
      const wz = dv2 + camZ2;
      const f = Math.min(1, (camZ2 / 190) * 0.85);                 // fade a base (como el 2D)
      const half = Math.min(320, (W / 2 + 10) * camZ2 / F + 6);    // ancho frustum de la fila
      const sx2 = Math.max(0.7, camZ2 * 0.0089);                   // espaciado x adaptativo
      const nAct = Math.min(((half * 2 / sx2) | 0) + 1, N - i);
      for (let col = 0; col < nAct; col++, i++) {
        const wx = camX + (col - (nAct - 1) / 2) * sx2;
        const h = w.seaH(wx, wz);
        p.setXYZ(i, wx, camZ2, h);
        let hn = (h + 1.4) / 4.8; hn = hn < 0 ? 0 : hn > 1 ? 1 : hn;
        if (Math.sin(wz * 0.06 - w.t * 2.6 + wx * 0.045) > 0.6) hn = Math.min(1, hn + 0.24);
        let src = hn > 0.72 ? CR : hn > 0.42 ? MI : DE;
        if (hn > 0.78 && camZ2 < 90 && Math.sin(wx * 12.9 + wz * 7.3 + w.t * 6) > 0.7) src = SP;
        c.setXYZ(i,
          src[0] + (BA[0] - src[0]) * f,
          src[1] + (BA[1] - src[1]) * f,
          src[2] + (BA[2] - src[2]) * f);
      }
    }
    MOM3D.dotsGeo.setDrawRange(0, i);                              // dibuja SOLO los usados
    p.needsUpdate = c.needsUpdate = true;
  }
  MOM3D.renderer.render(MOM3D.scene, MOM3D.cam);
  return true;
}
// PRECARGA del 3D: construye la escena y compila shaders apenas arranca el juego (no al
// llegar al mar abierto) — evita la trabada de "carga de textura" al cruzar la costa
if (has3D) setTimeout(() => { try { mom3DInit(); } catch (e) { } }, 400);

// ---------- interfaz para game.js ----------
/** ¿El 3D esta pintando el fondo COMPLETO (momentum)? */
export function isOn() { return MOM3D.on; }
/** ¿El 3D esta pintando solo cielo+mar (vuelo sobre mar abierto)? */
export function isSea() { return MOM3D.sea; }
/** El canvas de three, para bliteralo en el canvas del juego. */
export function view() { return MOM3D.renderer.domElement; }
/** Fuerza el repintado del telon: lo llama game.js cuando termina de cargar un fondo por clima. */
export function invalidatePalette() { MOM3D.palKey = ''; }
