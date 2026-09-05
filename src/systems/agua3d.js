// EL AGUA CARTOON del climax 3D (PLAN_MEJORAS_3D P1).
//
// El shader `Water` de three (normales animadas + reflejo + sol) POSTERIZADO a la rampa de
// WATER_STYLES: el mar deja de ser un degrade fotografico y pasa a ser azul plano con vetas
// blancas grandes — el agua de Battle Typer, con la paleta de RASANTE.
// Ver docs/proyecto/ANALISIS_REFERENTES_3D §2 (la referencia) y §4-P1 (por que se revisa la
// decision vieja de PLAN_AGUA §0b, que descarto el shader por "realista": sin la rampa TENIA
// razon; con la rampa, el shader habla el idioma del juego).
//
// El modulo NO lee estado del juego: lo construye y lo actualiza three-arena.js pasandole datos.
// Vive aparte porque es una PIEZA de escena con vida propia, como ship3d.js — y porque asi el
// dia que se decida el default, prender o apagar esto es una linea alla y nada aca.
import { AGUA3D, AGUA3D_NIVELES, AGUA3D_DISTORT, AGUA3D_CURVA, AGUA3D_VETA, AGUA3D_LARGO, AGUA3D_CIELO, AGUA3D_AZUL, AGUA3D_ROMPE, AGUA3D_NUBE, AGUA3D_NUBE_LARGO, AGUA3D_ESTELA, AGUA3D_ESPUMA, AGUA3D_ALTO } from '../data/tuning.js';

const WATER_NORMALS_SRC = '../assets/world/waternormals.jpg';

// las aguas construidas (hoy: la del ARENA y la del PASILLO). Solo la usa la sonda de tuneo,
// que tiene que poder mover las dos a la vez o el A/B compara peras con manzanas.
const vivos = [];

// EL PARCHE DE CERCA: cuanto mar tiene relieve de verdad, y con cuanto detalle. 950 m con paso de
// ~4,7 m — alcanza para la ola corta (30 m) y son 40 mil vertices, que la GPU dibuja sin
// despeinarse. Mas grande no sirve: el vertex apaga el relieve a los 420 m.
const PARCHE_M = 950, PARCHE_SEG = 200;

// modo VIVO: arranca en el default de tuning y lo pisa la sonda __agua3d() para el A/B sin
// recompilar. Es la unica variable mutable del modulo.
let modo = AGUA3D;
export function getModo() { return modo; }
export function setModo(m) { modo = (m === 'cartoon' || m === 'puntos') ? m : modo; return modo; }
export const esCartoon = () => modo === 'cartoon';

// El PARCHE del fragment shader. Dos capas, y las dos importan:
//
//  1. EL ARREGLO HEREDADO (viene del climax viejo, legacy/three-world.js): a angulo rasante el
//     fresnel del Water refleja casi 100% del cielo y el mar queda PINTADO del color del
//     atardecer. Se topa la reflectancia y se fuerza que el albedo siempre mezcle el color del
//     agua. Sin esto, volando a ras —o sea, todo el tiempo— el mar se ve naranja.
//  2. LA RAMPA TOON (lo nuevo): la luminancia del albedo se cuantiza a N escalones y cada
//     escalon se mapea a un tono de WATER_STYLES (valle → cuerpo → cresta → destello). El
//     resultado es plano por zonas: exactamente las vetas grandes de la referencia.
// LO QUE COMPARTEN LOS DOS SHADERS. La ola se declara UNA vez y la usan el vertex (para levantar
// la geometria) y el fragment (para pintarla). Si vivieran separadas, la cresta pintada y la
// cresta levantada se irian corriendo una de la otra al primer ajuste.
const COMUN = `
  uniform float toonFreq;
  uniform vec2 toonDir;
  uniform float toonEsc;
  uniform vec2 toonOff;
  uniform float toonAlto;
  float a3swell( vec2 pmet, float dmet, float tt ) {
    // cada armonico se apaga a SU escala: a 480x270 una ola de 30 m a un kilometro no es ola,
    // es moire.
    float fc = 1.0 - smoothstep( 150.0, 620.0, dmet );
    float fl = 1.0 - smoothstep( 380.0, 1500.0, dmet );
    float sw = dot( pmet, toonDir );
    float sw2 = dot( pmet, vec2( -toonDir.y, toonDir.x ) * 0.35 + toonDir * 0.94 );
    return sin( sw * toonFreq - tt * 0.9 ) * 0.62 * fl
         + sin( sw2 * toonFreq * 3.3 + tt * 1.7 ) * 0.38 * fc;
  }
`;

// EL VERTEX: la ola se LEVANTA de verdad.
//
// Sin esto el mar es un plano y todo su relieve es sombreado — se ve pintado, sin cuerpo. Lo que
// el mar 2D hace con la alfombra (desplazar cada punto por seaH) lo hace aca la GPU. El
// desplazamiento se apaga a los ~420 m para que el parche denso empalme sin escalon con el plano
// grande, que sigue siendo liso.
function parcharVertex(mat) {
  const v = mat.vertexShader;
  const ANCLA = `mirrorCoord = modelMatrix * vec4( position, 1.0 );
					worldPosition = mirrorCoord.xyzw;
					mirrorCoord = textureMatrix * mirrorCoord;
					vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
					gl_Position = projectionMatrix * mvPosition;`;
  if (v.indexOf('worldPosition = mirrorCoord.xyzw;') < 0) return false;
  const i = v.indexOf('void main() {');
  if (i < 0) return false;
  const j = v.indexOf('gl_Position = projectionMatrix * mvPosition;', i);
  if (j < 0) return false;
  const fin = j + 'gl_Position = projectionMatrix * mvPosition;'.length;
  mat.vertexShader = COMUN + v.slice(0, i) + `void main() {
    vec4 wp = modelMatrix * vec4( position, 1.0 );
    vec2 pmet = ( wp.xz + toonOff ) / toonEsc;
    float dmet = length( cameraPosition - wp.xyz ) / toonEsc;
    float fadeGeo = 1.0 - smoothstep( 180.0, 420.0, dmet );
    wp.y += a3swell( pmet, dmet, time ) * toonAlto * toonEsc * fadeGeo;
    worldPosition = wp;
    mirrorCoord = textureMatrix * wp;
    vec4 mvPosition = viewMatrix * wp;
    gl_Position = projectionMatrix * mvPosition;` + v.slice(fin);
  return true;
}

function parchar(mat) {
  const f = mat.fragmentShader;
  if (!f || f.indexOf('vec3 albedo = mix(') < 0) return false;   // three cambio el shader: no tocar
  const ALBEDO = 'vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), reflectionSample + specularLight, reflectance );';
  if (f.indexOf(ALBEDO) < 0) return false;
  mat.fragmentShader = f
    // EL DESPLAZAMIENTO DEL MUNDO. En el ARENA la camara VIAJA y el agua se queda quieta, asi que
    // alcanza con worldPosition. En el PASILLO es al reves —la camara esta clavada en z=0 y el
    // mundo viene hacia vos—, asi que el patron tiene que correr por su cuenta. Se le suma el
    // offset ACA, en el ruido base, y no solo en las vetas: si corriera una capa sola, el agua
    // se partiria en dos mares moviendose distinto.
    .replace(
      'vec4 noise = getNoise( worldPosition.xz * size );',
      'vec4 noise = getNoise( ( worldPosition.xz + toonOff ) * size );')
    .replace(
      'float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );',
      'float reflectance = min( rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 ), 0.55 );')
    .replace(ALBEDO, ALBEDO + `
      albedo = mix( albedo, waterColor * 1.35, toonSky ) + specularLight * 0.4;
      // ---- rampa toon (P1) ----
      // DOS PASOS, y el segundo es el que hace el look:
      //  (a) el CUERPO del agua se cuantiza a N escalones de la rampa del clima. Plano por
      //      zonas, sin degrade: el mar deja de ser una foto.
      //  (b) la VETA: el especular del sol NO se promedia — se compara contra un umbral y
      //      pinta el tono de destello de una. Las vetas blancas grandes de la referencia son eso, sol
      //      sobre una normal distorsionada; si se las deja entrar al promedio de luminancia
      //      se disuelven y el mar queda plano y muerto (fue el primer intento, y se veia).
      {
        // EL MAR TIENE DIRECCION. El ruido del Water es isotropo: da manchas, no olas — por eso
        // de cerca se leia como camuflaje. El mar 2D del juego (render/world.js) se ve bien
        // justamente porque sus vetas van TODAS para el mismo lado, alineadas al viento. Aca se
        // hace lo mismo: dos senos en espacio de mundo sobre el eje del oleaje, uno largo y uno
        // corto, que corren con el tiempo. Cuantizados dan las vetas grandes de la referencia.
        // TODO LO QUE SE MIDE EN METROS se convierte aca. El ARENA trabaja en metros (1 u = 1 m)
        // pero el PASILLO tiene su propia escala (1 u ~ 2,8 m), y sin esto el mismo oleaje de
        // 100 m salia catorce veces mas grande en una escena que en la otra.
        vec2 pmet = ( worldPosition.xz + toonOff ) / toonEsc;
        float dmet = length( worldToEye ) / toonEsc;
        // LAS VETAS SE APAGAN CON LA DISTANCIA, cada una a su escala. A 480x270 una onda de 24 m
        // vista a un kilometro cae en menos de un pixel: no se ve como ola, se ve como MOIRE
        // (rayas finas hirviendo sobre el horizonte). Cada armonico muere antes de llegar ahi.
        float swell = a3swell( pmet, dmet, time );
        float lum = clamp( dot( albedo, vec3( 0.299, 0.587, 0.114 ) ) * toonGain
                         + swell * toonSwell, 0.0, 1.0 );
        float n = max( 2.0, toonN );
        float q = clamp( floor( lum * n ) / ( n - 1.0 ), 0.0, 1.0 );
        // CUANTA AGUA CAE EN CADA TONO. La luminancia no se reparte pareja, asi que un escalon
        // uniforme deja el mar todo en los dos tonos de abajo (negro) o todo arriba (gris palido);
        // las dos cosas se vieron. Esta curva corre la masa del agua hacia el cuerpo o hacia las
        // vetas: <1 aclara, >1 oscurece. Es la perilla con la que se afina el look.
        q = pow( q, toonCurve );
        // LA RAMPA ARRANCA EN EL CUERPO OSCURO DEL MAR, no en la cresta. El primer intento iba
        // deep → mid → crest → spark, y esos cuatro son los tonos CLAROS de WATER_STYLES: el
        // cuerpo del agua nunca aparecia y el mar entero salia gris palido. El mar del juego
        // —y el de la referencia— es cuerpo oscuro con vetas claras encima; por eso los dos
        // escalon de abajo es base2, el mismo cuerpo que pinta el mar 2D. base1 se probo y es
        // CASI NEGRO: dejaba pozos de tinta en vez de senos de ola.
        vec3 ramp = q < 0.33 ? mix( toonAbyss, toonDeep, q / 0.33 )
                  : q < 0.66 ? mix( toonDeep, toonMid, ( q - 0.33 ) / 0.33 )
                             : mix( toonMid, toonCrest, ( q - 0.66 ) / 0.34 );
        // LA CRESTA ROMPIENDO. Lo unico que en el mar de verdad es BLANCO es la cresta que
        // rompe, y es una MANCHA: una zona conexa a lo largo del lomo de la ola. Antes eso lo
        // ponia la alfombra de puntos, y por eso se veia mitad bien (donde era densa, leia como
        // espuma) y mitad mal (donde era rala, eran cuadrados blancos sueltos). Aca sale del
        // mismo campo que pinta el agua, asi que es una zona y no un puñado de puntos.
        // El umbral se mide sobre la OLA, no sobre la luz: la luminancia del agua en este cielo
        // casi nunca pasa de la mitad de la escala, asi que un umbral sobre ella nunca disparaba.
        // Sobre swell el corte es directo —el 10% mas alto del lomo— y ademas se apaga solo con
        // la distancia, porque los armonicos ya vienen atenuados.
        // ...y se ROMPE con el ruido del agua: sobre el seno puro las crestas salen limpias y
        // parejas, como rayas blancas pintadas. Sumandole la luminancia local, la cresta solo
        // blanquea donde ademas el agua viene clara, y la espuma queda cortada y despareja.
        // ---- REFLEJOS DE NUBE (W8) ----
        // El mar no es de un solo azul: refleja el cielo, y el cielo tiene nubes. Dos ondas
        // MUY largas (cientos de metros) que corren lentas y tiñen el agua hacia el tono del
        // cielo. No es una nube dibujada — es la MANCHA de una nube sobre el agua, que es lo
        // unico que se ve desde arriba. Barato: dos senos mas, sin textura ni segunda pasada.
        float nub = sin( dot( pmet, toonNubeDir ) * toonNubeF + time * 0.10 ) * 0.55
                  + sin( dot( pmet, vec2( -toonNubeDir.y, toonNubeDir.x ) ) * toonNubeF * 0.63 - time * 0.07 ) * 0.45;
        ramp = mix( ramp, toonNubeCol, clamp( nub, 0.0, 1.0 ) * toonNube );

        if ( swell + ( lum - 0.32 ) * 1.6 > toonCap ) ramp = toonSpark;
        float sp = dot( specularLight, vec3( 0.333 ) );
        if ( sp > toonSpec ) ramp = toonSpark;
        else if ( sp > toonSpec * 0.55 ) ramp = mix( ramp, toonCrest, 0.75 );
        // ---- LA ESTELA DEL BUQUE (W3) ----
        // Vive ACA y no en la alfombra de puntos porque una estela es una MANCHA CONTINUA de
        // agua batida: dibujada con puntos sueltos se ve como puntos sueltos. Son tres cosas
        // distintas y se leen distinto: la linea de flotacion (el casco METIDO en el agua), la
        // V de Kelvin (los dos brazos que abren 19.5° desde la proa — el angulo es fisico y no
        // depende de la velocidad) y la remolinada de la popa.
        if ( wakeOn > 0.5 ) {
          vec2 rel = worldPosition.xz - wakePos;
          float along = dot( rel, wakeDir );
          float lat = abs( dot( rel, vec2( -wakeDir.y, wakeDir.x ) ) );
          float dp = wakeLen * 0.5 - along;          // 0 en la proa, crece hacia popa
          float esp = 0.0;
          float dCasco = length( vec2( max( 0.0, abs( along ) - wakeLen * 0.5 ),
                                       max( 0.0, lat - wakeBeam ) ) );
          esp = max( esp, 1.0 - smoothstep( 2.0, 9.0, dCasco ) );
          if ( dp > 0.0 && dp < wakeV ) {
            float brazo = abs( lat - ( wakeBeam + dp * 0.354 ) );
            // se AFINA y se APAGA hacia atras. Sin la potencia, los brazos llegaban enteros
            // hasta el final y se leian como dos rieles blancos pintados sobre el mar.
            float vive = pow( 1.0 - dp / wakeV, 1.7 );
            esp = max( esp, ( 1.0 - smoothstep( 2.5, 4.0 + 7.0 * vive, brazo ) ) * vive );
          }
          float dpop = dp - wakeLen;                 // metros por detras de la popa
          if ( dpop > 0.0 ) {
            esp = max( esp, ( 1.0 - smoothstep( wakeBeam * 0.4, wakeBeam * 1.5, lat ) )
                          * pow( 1.0 - smoothstep( 0.0, wakeV * 0.5, dpop ), 1.4 ) );
          }
          // el borde late: agua batida, no una calcomania pegada al casco
          esp *= 0.72 + 0.28 * sin( along * 0.5 + lat * 0.8 + time * 3.2 );
          esp = clamp( esp, 0.0, 1.0 );
          ramp = mix( ramp, toonSpark, clamp( esp * esp * wakeAmp, 0.0, 1.0 ) );
        }
        albedo = ramp;
      }`);
  return true;
}

/** Construye el plano de agua cartoon. `size` en metros (cuadrado). Devuelve el mesh o null si
 *  el addon Water no esta en el bundle (el juego sigue con la alfombra de puntos, sin ruido). */
export function crear(THREE, size, escala) {
  if (!THREE || !THREE.Water) return null;
  const wn = new THREE.TextureLoader().load(WATER_NORMALS_SRC,
    (tx) => { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; });
  const w = new THREE.Water(new THREE.PlaneGeometry(size, size), {
    textureWidth: 256, textureHeight: 256,
    waterNormals: wn,
    sunDirection: new THREE.Vector3(-0.5, 0.6, 0.45).normalize(),
    sunColor: 0xe8c07a,
    waterColor: 0x2e4a4e,
    distortionScale: AGUA3D_DISTORT,
    fog: true,
  });
  // uniforms de la rampa. Se declaran ANTES de parchar: el shader los referencia por nombre y
  // three arma la lista de uniforms desde este objeto.
  const u = w.material.uniforms;
  u.toonN = { value: AGUA3D_NIVELES };
  u.toonGain = { value: 1.15 };
  // umbral de la VETA. Bajo = mar lleno de blanco; alto = vetas raras y finas. 0.35 deja
  // caminos de sol anchos sin blanquear el mar entero.
  u.toonSpec = { value: 0.35 };
  u.toonCurve = { value: AGUA3D_CURVA };
  // cuanto TAPA el color del agua al reflejo del cielo. 1 = agua opaca, 0 = espejo (y con el
  // atardecer del juego, mar naranja). Es el arreglo heredado, ahora con perilla.
  u.toonSky = { value: AGUA3D_CIELO };
  u.toonCap = { value: AGUA3D_ROMPE };
  u.toonNube = { value: AGUA3D_NUBE };
  u.toonNubeF = { value: 2 * Math.PI / AGUA3D_NUBE_LARGO };
  u.toonNubeDir = { value: new THREE.Vector2(0.31, 0.95).normalize() };
  u.toonNubeCol = { value: new THREE.Color('#8ba0bd') };
  // la estela la enciende y la ubica three-arena por cuadro (buque(); apagada por defecto)
  u.wakeOn = { value: 0 };
  u.wakeLen = { value: 125 };
  u.wakeBeam = { value: 11 };
  u.wakeV = { value: AGUA3D_ESTELA };
  u.wakeAmp = { value: AGUA3D_ESPUMA };
  u.wakePos = { value: new THREE.Vector2() };
  u.wakeDir = { value: new THREE.Vector2(1, 0) };
  // unidades de mundo por METRO de esta escena, y el desplazamiento del mundo (ver el parche)
  u.toonEsc = { value: escala || 1 };
  u.toonAlto = { value: AGUA3D_ALTO };
  u.toonOff = { value: new THREE.Vector2() };
  u.toonSwell = { value: AGUA3D_VETA };
  u.toonFreq = { value: 2 * Math.PI / AGUA3D_LARGO };
  u.toonDir = { value: new THREE.Vector2(0.86, 0.51).normalize() };
  u.toonAbyss = { value: new THREE.Color('#203438') };
  u.toonDeep = { value: new THREE.Color('#3a5f63') };
  u.toonMid = { value: new THREE.Color('#6f9a95') };
  u.toonCrest = { value: new THREE.Color('#aed2cc') };
  u.toonSpark = { value: new THREE.Color('#e8f4f0') };
  // las declaraciones de los uniforms nuevos van al tope del fragment shader
  w.material.fragmentShader = COMUN + `
    uniform float toonN;
    uniform float toonGain;
    uniform float toonSpec;
    uniform float toonCurve;
    uniform float toonSky;
    uniform float toonCap;
    uniform float toonNube;
    uniform float toonNubeF;
    uniform vec2 toonNubeDir;
    uniform vec3 toonNubeCol;
    uniform float wakeOn;
    uniform float wakeLen;
    uniform float wakeBeam;
    uniform float wakeV;
    uniform float wakeAmp;
    uniform vec2 wakePos;
    uniform vec2 wakeDir;
    uniform float toonSwell;
    uniform vec3 toonAbyss;
    uniform vec3 toonDeep;
    uniform vec3 toonMid;
    uniform vec3 toonCrest;
    uniform vec3 toonSpark;
  ` + w.material.fragmentShader;
  // la POSE va antes del parche: si three cambiara el shader y `parchar` no encontrara sus
  // anclas, el plano tiene que quedar igual acostado y en su plano de dibujo — un mar sin rampa
  // se ve peor, pero un mar VERTICAL es una pared en medio de la pantalla.
  w.rotation.x = -Math.PI / 2;
  w.renderOrder = -5;                      // mismo plano que el mar liso al que reemplaza
  w.material.parcheOk = parchar(w.material) && parcharVertex(w.material);
  // EL PARCHE DENSO. El plano grande tiene CUATRO vertices: sirve para el fondo, pero no hay
  // nada que levantar en el. La malla de cerca comparte el MISMO material —asi no hay costura de
  // color— y es la que tiene vertices para que la ola suba. Mas alla de ~420 m el vertex apaga el
  // desplazamiento, que es donde termina esta malla: por eso el empalme no se ve.
  {
    const esc = escala || 1;
    const g = new THREE.PlaneGeometry(PARCHE_M * esc, PARCHE_M * esc, PARCHE_SEG, PARCHE_SEG);
    const m = new THREE.Mesh(g, w.material);
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = -4;                    // encima del plano grande, que es el fondo
    m.frustumCulled = false;               // se reubica entera todos los cuadros
    w.userData.malla = m;
    // LA MALLA NO PUEDE DIBUJARSE DENTRO DE SU PROPIO REFLEJO. El Water renderea la escena a un
    // render target para el espejo y se esconde a si mismo mientras lo hace; la malla es OTRO
    // objeto con el MISMO material, asi que quedaba dibujandose con la textura del espejo puesta
    // como destino — GL_INVALID_OPERATION, "feedback loop", en cada cuadro. Se la esconde junto
    // con el plano.
    const antes = w.onBeforeRender;
    w.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
      const vis = m.visible;
      m.visible = false;
      antes.call(this, renderer, scene, camera, geometry, material, group);
      m.visible = vis;
    };
  }
  // se publica el resultado del parche: sin el, la rampa NO corre y un A/B seria mentira
  vivos.push(w);
  if (typeof window !== 'undefined') { window.__a3parche = w.material.parcheOk ? 'ok' : 'NO AGARRO'; window.__a3mesh = w; }
  w.material.needsUpdate = true;
  return w;
}

// CORRIMIENTO AL AZUL, solo del agua 3D. `WATER_STYLES.sea` es verde-azulado, y en el 2D eso
// funciona porque el mar ocupa media pantalla; en el climax ocupa TODA, y ahi el verde compite
// con el avion —que es verde oliva— hasta confundirse. Se corre el TONO hacia el azul acero sin
// tocar el brillo: sigue siendo la misma paleta, mas fria. 0 = el color tal cual del 2D.
let azul = AGUA3D_AZUL;
const HSL = { h: 0, s: 0, l: 0 };
const AZUL_H = 0.58;                       // ~209°, el azul acero del Atlantico sur
function tinte(col, hex) {
  col.set(hex);
  if (azul <= 0) return col;
  col.getHSL(HSL);
  return col.setHSL(HSL.h + (AZUL_H - HSL.h) * azul, HSL.s * (1 - 0.15 * azul), HSL.l);
}

/** Mete el agua en la escena. Son DOS objetos (el plano de fondo y la malla de cerca) y hay que
 *  agregarlos y prenderlos juntos: por eso esto vive aca y no en cada llamador. */
export function agregar(scene, w) {
  if (!w) return;
  scene.add(w);
  if (w.userData.malla) scene.add(w.userData.malla);
}

/** Prende o apaga el agua entera. */
export function ver(w, on) {
  if (!w) return;
  w.visible = on;
  if (w.userData.malla) w.userData.malla.visible = on;
}

/** Tiñe la rampa con el estilo de agua del clima activo (WATER_STYLES ya resuelto por theme). */
export function palette(w, WA, S) {
  if (!w || !w.material || !w.material.uniforms.toonDeep) return;
  const u = w.material.uniforms;
  tinte(u.toonAbyss.value, WA.base2);
  tinte(u.toonDeep.value, WA.deep);
  tinte(u.toonMid.value, WA.mid);
  tinte(u.toonCrest.value, WA.crest);
  tinte(u.toonSpark.value, WA.spark);
  if (u.waterColor) tinte(u.waterColor.value, WA.base2);
  u.toonN.value = AGUA3D_NIVELES;
  // la mancha de nube se tiñe del CIELO del clima, no de un azul fijo: es cielo reflejado.
  if (S && S.skyMid) tinte(u.toonNubeCol.value, S.skyMid);
}

/** Prende y ubica la estela del buque. `dir` es hacia donde apunta la PROA (unitario en xz).
 *  Sin llamarla, o con `on` falso, el agua no dibuja ninguna estela. */
export function buque(w, on, x, z, dx, dz, len, beam) {
  if (!w || !w.material.uniforms.wakeOn) return;
  const u = w.material.uniforms;
  u.wakeOn.value = on ? 1 : 0;
  if (!on) return;
  u.wakePos.value.set(x, z);
  u.wakeDir.value.set(dx, dz).normalize();
  u.wakeLen.value = len;
  u.wakeBeam.value = beam;
  u.wakeV.value = AGUA3D_ESTELA;
}

/** Un cuadro: mueve el oleaje y re-centra el plano bajo el avion.
 *  `t` es el reloj ABSOLUTO del run (no un delta): asi el agua no depende de que nadie acumule
 *  nada, y una pausa o un salto de estado no le deja el oleaje colgado. */
export function frame(w, t, px, pz, y, offX, offZ) {
  if (!w) return;
  const u = w.material.uniforms;
  if (u.time) u.time.value = t * 0.6;
  w.position.set(px, y, pz);
  // la malla densa viaja con el plano, apenas por encima para que donde el relieve se apaga no
  // peleen por el z-buffer
  const m = w.userData.malla;
  if (m) m.position.set(px, y + 0.03 * u.toonEsc.value, pz);
  // sin offset el agua vive donde esta (ARENA); con offset, el mundo corre bajo una camara
  // quieta (PASILLO). Ver el comentario del parche.
  if (u.toonOff) u.toonOff.value.set(offX || 0, offZ || 0);
}

// ---- SONDA de desarrollo (P1/W2) — QUITAR cuando el default quede decidido ----
// `__agua3d()` lee el modo; `__agua3d('cartoon'|'puntos')` lo cambia EN VIVO, sin recompilar y
// sin salir del climax: es la herramienta del A/B (la misma escena, los dos mares, una captura
// de cada uno). Devuelve tambien si el parche del shader agarro — si `parche:false`, three
// cambio el shader del addon y la rampa no esta corriendo.
// `__a3set({wave,tile,n,gain,spec})` escribe los uniforms EN VIVO. Sin esto cada variante de la
// rampa cuesta un build y un arranque; con esto una sola corrida barre todas. QUITAR con la sonda
// de arriba cuando el look quede cerrado.
if (typeof window !== 'undefined') window.__a3set = (o) => {
  if (!vivos.length) return 'sin agua construida';
  let out = '';
  for (const w of vivos) out = a3set1(w, o);
  return out;
};
function a3set1(w, o) {
  const u = w.material.uniforms;
  if (o.n !== undefined) u.toonN.value = o.n;
  if (o.gain !== undefined) u.toonGain.value = o.gain;
  if (o.spec !== undefined) u.toonSpec.value = o.spec;
  if (o.curve !== undefined) u.toonCurve.value = o.curve;
  if (o.sky !== undefined) u.toonSky.value = o.sky;
  if (o.cap !== undefined) u.toonCap.value = o.cap;
  if (o.nube !== undefined) u.toonNube.value = o.nube;
  if (o.estela !== undefined) u.wakeAmp.value = o.estela;
  if (o.alto !== undefined) u.toonAlto.value = o.alto;
  if (o.azul !== undefined) azul = o.azul;
  if (o.swell !== undefined) u.toonSwell.value = o.swell;
  if (o.largo !== undefined) u.toonFreq.value = 2 * Math.PI / o.largo;
  if (o.distort !== undefined) u.distortionScale.value = o.distort;
  return JSON.stringify({ n: u.toonN.value,
    gain: u.toonGain.value, spec: u.toonSpec.value, curve: u.toonCurve.value,
    sky: u.toonSky.value, cap: u.toonCap.value, azul,
    nube: u.toonNube.value, estela: u.wakeAmp.value, alto: u.toonAlto.value, veta: u.toonSwell.value, largo: (2 * Math.PI / u.toonFreq.value).toFixed(1),
    distort: u.distortionScale.value });
}

if (typeof window !== 'undefined') window.__agua3d = (m) => {
  if (m !== undefined) setModo(m);
  return JSON.stringify({ modo, niveles: AGUA3D_NIVELES, distort: AGUA3D_DISTORT, veta: AGUA3D_VETA, largo: AGUA3D_LARGO });
};
