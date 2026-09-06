// LAS PAREDES DEL CALLEJON — las laderas a los costados del carril (PLAN_PASILLO_ZIGZAG Z3).
//
// POR QUE EXISTEN, que no es lo que parece: no son decorado. El playtest de Z2 encontro que el
// carril curvo SOLO —sobre mar abierto, plano, sin nada a los costados— MAREA. El mundo se
// inclina y el avion se corre hacia afuera, y el ojo no tiene contra que explicarlo. Las laderas
// son EL MARCO DE REFERENCIA que vuelve legible el viraje: con dos cerros pasando al lado, la
// misma inclinacion se lee como "estoy doblando" en vez de como "la pantalla se torcio".
//
// Y de paso son la CONSECUENCIA. Hasta ahora el trazado se podia ignorar; con paredes, seguir el
// camino es la regla — te salis y chocas. Es lo que el autor imaginaba desde el principio.
//
// COMO SE DIBUJA: una tira de columnas verticales a lo largo de `z`, de LEJOS A CERCA (pintor),
// cada una un cuadrilatero entre dos muestras consecutivas. La altura sale de `paredH()` en
// core/zigzag.js — la MISMA funcion que evalua la colision, que es la regla de este repo desde
// core/sea.js y core/tierra.js: lo que ves es lo que te mata.
//
// La `x` es constante en el MARCO DEL CARRIL (±ZZ_PARED_X) y toda la curvatura entra por `proj()`,
// que ya suma `bendW(z)`. Por eso las laderas doblan solas con el camino: no saben que existe el
// zigzag, igual que no lo sabe el resto del mundo.
import { ctx, px, W, H, HOR, F } from './ctx.js';
import { cam, cfg } from '../core/state.js';
import { run } from '../core/run.js';
import { proj } from '../core/fx.js';
import { pared, paredH, paredXAt, paredCara, bendW, barreraCerca } from '../core/zigzag.js';
import { tierraH, hayRelieve } from '../core/tierra.js';
import { theme } from './theme.js';
import { ZZ_PARED_Z, ZZ_PARED_PASO, ZZ_MESETA_W, ZZ_NIEBLA_Z0, ZZ_NIEBLA_FULL,
  ZZ_PARED_X } from '../data/tuning.js';

// SOLAPE entre poligonos vecinos, en pixeles. Dos cuadrilateros que comparten un borde EXACTO no
// se tocan en el pixel: el redondeo del rasterizado deja pasar el fondo por la juntura, y a lo
// largo de toda la cresta eso se lee como UN HILO dibujado encima del cerro. Estirar medio pixel
// cada pieza sobre su vecina lo tapa, y no cuesta nada.
const SOLAPE = 0.9;

/** LA CARA DE LA LADERA ES TIERRA EXPUESTA: MARRON, no verde y no gris.
 *
 *  Dos intentos antes de acertar, y los dos por la misma confusion. El primero uso la paleta del
 *  acantilado suelto (`'cliff'`): se veia GRIS, y un cerro de Malvinas no es un farallon de piedra.
 *  El segundo la saco de `theme.land` tal cual: se veia VERDE, porque esa paleta es la del PASTO —
 *  y el pasto crece ARRIBA. Lo que se ve de costado en un talud cortado es la tierra de abajo del
 *  pasto, que es marron.
 *
 *  Asi que la cara es el tema del suelo CALENTADO hacia el marron (mas rojo, menos verde) sobre la
 *  base de `rock`, que ya es el tono mas terroso de la paleta. Sigue respondiendo al clima —de
 *  noche se apaga, con lluvia se oscurece— pero nunca se vuelve verde. El verde queda donde
 *  corresponde: la CORONA del filo y la meseta de arriba, que son pasto de verdad. */
function caraLadera() {
  const t = theme.land;
  return {
    cuerpo: tierra(t.rock, 1.0),      // el grueso del talud: tierra
    luz: tierra(t.rock, 1.55),        // el hombro que da al sol
    som: tierra(t.rock, 0.48),        // el pie, en sombra
    veta: tierra(t.rock, 0.72),       // la veta mas oscura a media ladera
  };
}

/** Un color del tema llevado a TIERRA: se escala el brillo y se lo empuja al marron subiendo el
 *  rojo y bajando el verde. La proporcion (rojo ×1.18, verde ×0.88) es lo que separa "turba" de
 *  "pasto" sin inventar una paleta nueva que despues quede desfasada del resto del juego. */
function tierra(hex, k) {
  const v = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((v >> 16) & 255) * k * 1.18) | 0;
  const g = Math.min(255, ((v >> 8) & 255) * k * 0.88) | 0;
  const b = Math.min(255, (v & 255) * k * 0.78) | 0;
  // ⚠ DEVUELVE HEXA, no `rgb(...)`, y no es un capricho: `mez()` mezcla parseando hexadecimal, asi
  // que un `rgb(...)` le daba NaN y la ladera se dibujaba NEGRA. El color estaba bien calculado y
  // aun asi se veia mal — el bug estaba en el formato, no en el tono.
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** LA TIERRA DE ARRIBA sale del TEMA, no de constantes. Es la leccion de PLAN_TIERRA_COSTA T1: una
 *  paleta fija es el bug de "el suelo no tiene clima" — bajo tormenta, de noche o con sol pleno la
 *  meseta seria exactamente el mismo verde mientras el terreno de al lado cambia. Al derivarla del
 *  tema, el cerro se moja con la lluvia y se apaga de noche junto con todo lo demas, gratis.
 *
 *  ⚠ SIEMPRE `land`, NUNCA `cland`, aunque el mapa sea COSTA o MAR. Arriba de un cerro hay campo:
 *  turba, pasto y matas. La arenisca de `cland` es la PLAYA — tiene sentido al nivel del agua y
 *  ninguno en una meseta a treinta metros. Es una decision del autor y va escrita porque el codigo
 *  de al lado (la corona, la roca) si mira el terreno, y la proxima persona va a querer "unificar".*/
function tierraArriba() {
  const t = theme.land;
  return { cerca: t.near, lejos: t.far, borde: t.tuft, corona: t.mid, mata: t.tuft, furrow: t.furrow };
}

/** LA VEGETACION DE LA MESETA: matas y algun arbol, deterministas por celda de mundo.
 *
 *  Sin esto la meseta es un plano de color liso, y un plano liso no tiene ESCALA — no se sabe si
 *  se esta a diez metros o a cien. Las matas son lo que dice a que altura vas, y de paso son lo
 *  que hace que la tierra de arriba se lea como el mismo campo que el mapa de TIERRA.
 *
 *  Determinista por posicion (hash), como el pasto y el pedrero: nada titila, y dos pasadas por
 *  el mismo cerro ven el mismo arbusto en el mismo lugar. */
function vegetacion(T, wx0, wz, camZ, gy, lado, alpha) {
  const PASO = 11;
  for (let off = 8; off < 150; off += PASO) {
    const wx = wx0 + lado * off;
    const ix = Math.round(wx / PASO), iz = Math.round(wz / PASO);
    const h1 = hash2(ix, iz);
    if (h1 < 0.55) continue;                                  // campo abierto: las matas son ralas
    const h2 = hash2(ix + 907, iz - 311);
    const s = proj(wx + (h2 - 0.5) * PASO, gy, camZ);
    if (s.x < -6 || s.x > W + 6 || s.y < HOR) continue;
    const k = s.k;
    if (k < 0.55) continue;                                   // demasiado lejos: seria un pixel sucio
    ctx.globalAlpha = alpha;
    if (h1 > 0.955) {
      // UN ARBOL. En Malvinas casi no hay, y por eso son raros a proposito: uno cada tanto le da
      // escala al cerro sin convertirlo en un bosque que ahi no existiria.
      const th = Math.max(2, k * 2.6), tw = Math.max(1, k * 0.45);
      px(s.x - tw / 2, s.y - th, tw, th, T.furrow);                       // tronco
      const cw = Math.max(2, k * 1.9), ch = Math.max(2, k * 1.7);
      px(s.x - cw / 2, s.y - th - ch * 0.75, cw, ch, T.corona);           // copa
      px(s.x - cw / 2, s.y - th - ch * 0.75, cw, Math.max(1, ch * 0.4), T.mata);
    } else {
      const w = Math.max(1, k * 0.75), hh = Math.max(1, k * (0.7 + h2 * 0.7));
      px(s.x - w / 2, s.y - hh, w, hh, T.corona);                         // el arbusto
      px(s.x - w / 2, s.y - hh, w, Math.max(1, hh * 0.45), T.mata);       // punta iluminada
    }
  }
}

/** hash entero → [0,1). Copia local: este modulo no puede importar de world.js. */
function hash2(a, b) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** EL COLOR DE LA NIEBLA, y acertarlo es TODO el asunto de que no se vea el corte.
 *
 *  El primer intento fundio la ladera hacia `theme.sky.horizon` — el color del CIELO — y dejaba una
 *  linea vertical clarisima. Medido en pixeles: el cerro terminaba en gris claro (152,157,152)
 *  pegado a agua oscura (18,33,35), un salto de 386. La niebla no lo escondia: lo delataba.
 *
 *  El error es de razonamiento, no de numero. La ladera se ve casi entera POR DEBAJO del horizonte
 *  —a 260 m su cresta asoma tres pixeles— asi que lo que tiene detras no es cielo: es EL MAR (o la
 *  turba). Fundirla hacia el color que el raster del terreno usa en su fila mas lejana la hace
 *  desaparecer de verdad, porque termina siendo exactamente el mismo color que lo que la rodea.
 *
 *  Es la misma fuente que dibuja esa fila (`theme.water.base0` / `theme.land.far`), asi que si
 *  algun dia cambia la paleta, cambian los dos juntos. */
function nieblaCol() {
  return cfg.terrain === 'land' ? theme.land.far : theme.water.base0;
}

/** EL FILO QUE LE PASA POR DELANTE a un punto del callejon: la `y` de PANTALLA del borde de roca
 *  mas alto que cubre su columna, mirando solo lo que esta MAS CERCA que el. `null` si no lo
 *  cubre nada, y entonces el punto se ve entero.
 *
 *  ES LA MEDIA QUE FALTABA. El primer intento contestaba por si o por no —una linea de vision
 *  contra la roca, y el objeto se dibujaba o no se dibujaba—, y por eso a un cañon al que la loma
 *  le tiene que tapar SOLO LOS PIES se lo dibujaba entero: quedaba montado encima del terreno.
 *  Un obstaculo detras de un cerro casi nunca esta tapado del todo ni visible del todo; asoma. La
 *  respuesta correcta no es un booleano, es DONDE lo corta.
 *
 *  SE RECORRE LA MISMA TIRA DE COLUMNAS QUE DIBUJA LA LADERA, con la misma `paredCara` y el mismo
 *  apoyo en el terreno. Tiene que ser asi: si el filo que recorta y el filo que se pinta salieran
 *  de dos cuentas distintas, el objeto se cortaria en una linea que no esta en la pantalla — que
 *  es peor que no recortarlo.
 *
 *  EL OJO SE PUEDE PASAR APARTE (`ex`/`ey`) y la distancia volada tambien (`dv`): es lo que
 *  permite preguntarle al motor "¿y desde arriba de las crestas?" o barrer el callejon entero sin
 *  tener que volarlo. Sin eso, la unica forma de comprobar esto es mirar una captura y creerle. */
export function techoLadera(wx, camZ, ex, ey, dv) {
  const p = pared();
  if (!p || camZ <= 4) return null;
  const lado = wx >= 0 ? 1 : -1;
  const d = dv === undefined ? run.dist : dv;
  const oX = px2(wx, camZ, ex);
  const relieve = hayRelieve(cfg);
  let techo = null;
  // el paso es mas grueso que el del dibujo a proposito: aca no se pinta nada, se busca un borde,
  // y un error de medio metro de profundidad en el filo no se ve. Lo que si se veria es el costo.
  for (let z = 4; z < camZ; z += Math.max(6, z * 0.08)) {
    const wz = d + z;
    const h = paredH(wz, lado);
    if (h <= 0.05) continue;
    const pie = lado * paredXAt(wz, lado);
    const cre = lado * paredCara(wz, lado, h);
    const a = px2(pie, z, ex), b = px2(cre, z, ex);
    if (oX < Math.min(a, b) || oX > Math.max(a, b)) continue;   // la roca no llega a esta columna
    const gy = relieve ? tierraH(pie, wz) : 0;
    const y = py2(gy + h, z, ey);
    if (techo === null || y < techo) techo = y;
  }
  return techo;
}

/** proj() con el ojo puesto a mano. Son las dos mitades de core/fx.js con `cam` como parametro —
 *  no se puede usar `proj` directo porque ahi el ojo es SIEMPRE la camara, y media prueba de esto
 *  consiste justamente en mirar desde otro lado. */
const px2 = (x, z, ex) => W / 2 + (x - (ex === undefined ? cam.x : ex) + bendW(z)) * (F / z);
const py2 = (y, z, ey) => HOR + ((ey === undefined ? cam.y : ey) - y) * (F / z);

/** ¿Hay algo que dibujar? Barato y primero: sin paredes esto no cuesta ni un `proj`. */
export const hayParedes = () => !!pared();

/** Las laderas del cuadro. Se llama despues del terreno y antes de los obstaculos.
 *
 *  ORDEN DE PINTOR: se va de lejos a cerca para que lo cercano tape lo lejano. Los OBSTACULOS se
 *  dibujan despues, o sea SIEMPRE encima — y es aceptable porque viven adentro del carril
 *  (±SPAWN_X) y las paredes estan afuera (±ZZ_PARED_X): el unico solape posible es en la banda
 *  del horizonte, donde todo mide dos pixeles. Ordenarlos de verdad exigiria meter las laderas en
 *  la misma lista ordenada por z que los obstaculos, y son 130 columnas por cuadro. */
export function drawParedes() {
  const p = pared();
  if (!p) return;
  const dv = run.dist;
  const relieve = hayRelieve(cfg);
  const costa = cfg.terrain === 'coast';
  const T = tierraArriba();
  const L = caraLadera();

  for (const lado of [-1, 1]) {
    // se marcha de LEJOS a CERCA. `prev` guarda la columna anterior para poder cerrar el
    // cuadrilatero entre las dos: dibujar cada muestra como una barra suelta deja costuras
    // verticales que titilan al avanzar (se probo, y se ve).
    let prev = null;
    // SE MARCHA HASTA EL HORIZONTE (ZZ_PARED_Z) y no hasta una distancia comoda: parando antes,
    // entre la ultima rebanada y la linea del horizonte queda una franja sin dibujar y por ahi se
    // ve el mar — el cerro aparece CORTADO. El paso crece con la distancia para que las columnas
    // lejanas no cuesten de mas: alla todas pintan el mismo color de niebla igual.
    for (let camZ = ZZ_PARED_Z; camZ >= 3; camZ -= Math.max(ZZ_PARED_PASO, camZ * 0.05)) {
      const wz = dv + camZ;
      // LA PARED SE MUEVE EN X con las PUNTAS DE TIERRA (Z3.b): el borde no es una recta, entra y
      // sale. Es lo que de verdad hace el callejon — el jugador zigzaguea esquivando promontorios,
      // con la camara completamente quieta.
      const wx = lado * paredXAt(wz, lado);                 // EL PIE de la ladera
      const h = paredH(wz, lado);
      if (h <= 0.05) { prev = null; continue; }          // fuera de la ventana: el paisaje se abre
      // LA CRESTA VA MAS AFUERA QUE EL PIE — la ladera es un TALUD, no un muro. Es lo unico que de
      // verdad la saca de plana: por mucha textura que se le ponga encima, una cara VERTICAL se lee
      // como pared. Y no es dibujo: `paredCara` es la misma funcion contra la que resuelve la
      // colision, asi que el talud que ves es el talud que te mata.
      const wxc = lado * paredCara(wz, lado, h);
      // la ladera se APOYA en el terreno, como todo lo que se apoya (PLAN_TIERRA_COSTA T3)
      const gy = relieve ? tierraH(wx, wz) : 0;
      const base = proj(wx, gy, camZ);
      const top = proj(wxc, gy + h, camZ);
      if (prev) {
        // LA NIEBLA DE DISTANCIA, primero de todo: la usan la meseta Y la cara, y la meseta se
        // dibuja antes. Declararla mas abajo la dejaba en zona muerta temporal y el render se caia
        // en el primer cuadro con un ReferenceError.
        const f = Math.max(0, 1 - camZ / ZZ_NIEBLA_FULL);
        // LA NIEBLA LLEGA A 1 ANTES DEL LIMITE DE DIBUJO, y de eso depende que no se vea el corte:
        // si en el ultimo metro dibujado la ladera todavia conserva algo de su color, ahi hay un
        // canto — una linea vertical donde el terreno simplemente termina. Saturando la niebla en
        // ZZ_NIEBLA_FIN, el ultimo tramo se pinta EXACTAMENTE del color del horizonte y el corte
        // queda invisible por construccion, no por suerte.
        const niebla = Math.max(0, Math.min(1,
          (camZ - ZZ_NIEBLA_Z0) / (ZZ_NIEBLA_FULL - ZZ_NIEBLA_Z0)));
        // LA MESETA, PRIMERO (va detras de la cara: la cara le tapa el filo y el empalme queda
        // limpio). Solo se dibuja cuando LA CAMARA ESTA POR ENCIMA de esta cresta — es una
        // superficie horizontal, y desde abajo no se ve: dibujarla igual la proyectaria por encima
        // del horizonte, o sea pintando cielo. Que aparezca al trepar no es un truco: es
        // exactamente lo que pasa cuando subis lo suficiente para ver arriba del cerro.
        // ⚠ LA MESETA NO SE PUEDE SALTEAR NUNCA — SE RECORTA. Exigir que la camara este sobre LAS
        // DOS crestas del tramo (el intento anterior) evitaba el cuadro dado vuelta, pero a costa
        // de no dibujar nada en los tramos donde una cresta esta arriba y la otra abajo. Y ahi,
        // entre la cara del acantilado y la tierra de arriba, quedaba UN AGUJERO por el que se veia
        // el mar. Era mi propio arreglo el que lo abria.
        //
        // La forma correcta de una superficie horizontal que la camara no alcanza a mirar por
        // encima no es "no dibujarla": es que su borde se va AL HORIZONTE. Asi que se recortan los
        // cuatro vertices contra HOR y se dibuja siempre que quede area — el tramo de transicion
        // se llena solo, sin cuñas invertidas y sin huecos.
        {
          // EL ANCHO DE LA MESETA CRECE CON LA DISTANCIA, y sin eso hay un agujero. Con un ancho
          // FIJO de 200 unidades la meseta tapa de sobra cerca, pero a 180 m su borde exterior cae
          // en la columna 425 de una pantalla de 480: por esas 55 columnas se veia EL MAR pasando
          // por detras del cerro, cerca del horizonte y hacia afuera. Se ve mejor cuanto mas alto
          // se vuela, que es justo cuando la meseta aparece.
          //
          // Es la misma cuenta que el `halfW` del pasto en world.js: cuanto mundo hay que barrer
          // para tapar el ancho de pantalla A ESTA PROFUNDIDAD. El fijo queda como piso.
          const mesaW = Math.max(ZZ_MESETA_W, (W / 2 + 40) * camZ / F);
          const fueraA = proj(wxc + lado * mesaW, gy + h, camZ);
          const fueraB = proj(prev.wxc + lado * mesaW, gy + prev.h, prev.camZ);
          // RECORTE AL HORIZONTE: una superficie horizontal nunca se ve por encima de HOR. Con la
          // camara bajo la cresta, su borde ES el horizonte, y el cuadrilatero se aplasta contra
          // el en vez de darse vuelta.
          const yA = Math.max(fueraA.y, HOR), yB = Math.max(fueraB.y, HOR);
          const tA = Math.max(top.y, HOR), tB = Math.max(prev.top.y, HOR);
          const fM = Math.max(0, 1 - camZ / ZZ_NIEBLA_FULL);
          // SE DIBUJA SIEMPRE. El recorte contra HOR ya resuelve los tres casos solo: con la camara
          // por encima de la cresta sale la superficie normal; por debajo, los cuatro vertices caen
          // en el horizonte y el cuadrilatero queda de area cero (no pinta nada, y la cara tapa);
          // y en el tramo de TRANSICION —una cresta arriba y otra abajo— sale la cuña que llena el
          // hueco, que es justamente lo que faltaba.
          //
          // ⚠ NADA DE PONERLE UNA CONDICION DE "¿hay altura?" comparando el borde con la cresta:
          // los dos estan A LA MISMA ALTURA DE MUNDO, asi que su `y` de pantalla es IDENTICA y la
          // condicion nunca se cumple — la meseta desaparecia entera. El alto del cuadrilatero sale
          // de la diferencia de PROFUNDIDAD entre las dos columnas, no del ancho hacia afuera.
          ctx.globalAlpha = 1;                                   // opaca, como la ladera
          ctx.fillStyle = mez(mez(T.lejos, T.cerca, Math.min(1, fM * 1.6)), nieblaCol(), niebla);
          quad(ctx, prev.top.x, tB + SOLAPE, top.x, tA + SOLAPE, fueraA.x, yA, fueraB.x, yB);
          // EL FILO Y EL CAMPO solo cuando la camara mira POR ENCIMA de esta cresta: son detalles
          // de la superficie de arriba, y desde abajo esa superficie no se ve. Va como `if` y NO
          // como `continue` — un `continue` aca se saltearia el dibujo de LA CARA, que es lo unico
          // que no puede faltar nunca (fue el error de un minuto atras).
          if (cam.y > gy + h) {
            // NO VA UN "FILO" ADEMAS DE LA CORONA. Habia dos marcas dibujadas sobre el MISMO borde
            // —una clara aca y una oscura abajo— y dos lineas en el mismo lugar no se leen como un
            // borde: se leen como un HILO pintado encima del cerro. Queda una sola, la corona, y
            // del color del pasto de arriba, para que sea el pasto doblandose sobre el filo y no
            // una raya. El borde igual se entiende: lo marca el cambio de verde a marron.
            // …y encima, el CAMPO: matas y algun arbol. Es lo que le da escala a la meseta.
            // la vegetacion SI se desvanece con alfa: son motas de un pixel, y una mota tapada por
            // niebla y una mota que no esta se ven igual. Lo que no puede ser transparente es la
            // MASA del cerro.
            vegetacion(T, wxc, wz, camZ, gy + h, lado, 1 - niebla);
          }
        }
        // FUNDIDO CON LA DISTANCIA: la ladera se pierde en la bruma en vez de terminar en un
        // filo a 260 m. Es el mismo criterio que el `fade` del pasto.
        // (`f` y `niebla` se calculan arriba: la meseta se dibuja antes que la cara y tambien los
        //  necesita — se leian antes de existir y el render moria en el primer cuadro.)
        // ⚠ LA LADERA SE PIERDE EN LA NIEBLA, NO SE VUELVE TRANSPARENTE. Es la correccion del
        // septimo playtest y es una diferencia conceptual, no de gusto: bajando el ALFA se ve el
        // cielo A TRAVES del cerro, y un cerro no es de vidrio. Se veia el fondo pasar por adentro
        // de la montaña.
        //
        // Lo correcto es niebla de distancia: la ladera queda OPACA de punta a punta y lo que
        // cambia es su COLOR, que se funde hacia el tono del horizonte. Asi la silueta desaparece
        // exactamente igual —sin canto duro, que era el problema anterior— pero nunca se ve nada
        // por detras. Es como se pierde un cerro de verdad en la bruma.
        //
        // EL COLOR DE LA NIEBLA lo elige `nieblaCol()` — el tono del TERRENO en su fila mas
        // lejana, no el del cielo. Ahi esta la mitad del truco; la otra mitad es que la ladera
        // nunca pierde opacidad. Ver el comentario de esa funcion.
        const aBase = 1;
        const x0 = prev.base.x, x1 = base.x;
        // EL CUERPO EN TRES FRANJAS, y esto es lo que separa un CERRO de una cortina. Con un solo
        // tono plano la ladera se leia como un telon de cartulina parado al costado (primera
        // version, y se veia): no tenia ni volumen ni escala. Tres franjas horizontales —el pie en
        // sombra, el medio en roca, el hombro al sol— alcanzan, porque el ojo lee volumen por el
        // gradiente vertical mucho antes que por la textura.
        //
        // El TONO CAMBIA POR BANDA (hash sobre la profundidad): dos cerros vecinos no son el mismo
        // gris. Sin esto la sierra entera parece una sola pieza extruida.
        const tinte = ((wz / 55) | 0) * 2654435761 % 100 / 100;
        const FOG = nieblaCol();
        // cada franja se funde con la niebla POR SEPARADO: asi el volumen del cerro se sigue
        // leyendo mientras se aleja, en vez de aplanarse de golpe a un solo tono.
        const nb = c => mez(c, FOG, niebla);
        // ESTRIACION VERTICAL. Cada columna del talud se aclara o se oscurece un poco segun su
        // posicion de mundo, y como una columna ES una franja vertical, el resultado son las
        // carcavas y los regueros de una ladera erosionada. Es la textura que faltaba: los
        // manchones son horizontales, y con solo esos la cara se leia "en capas".
        // ⚠ LA CARA ES UN TALUD, ASI QUE SU X TAMBIEN INTERPOLA. Desde que la cresta se retira
        // hacia afuera (`paredCara`), el pie y la cresta NO estan en la misma columna de pantalla.
        // Los cuadrilateros de la cara se dibujaban con la x DEL PIE de punta a punta, asi que la
        // cara terminaba mas adentro que donde arranca la meseta — y entre las dos quedaba una
        // franja sin pintar por la que se veia el mundo de atras. ESE era el agujero entre la
        // pared y la tierra de arriba; se encontro pintando la ladera de magenta y la meseta de
        // cian, que es lo unico que lo hizo evidente.
        //
        // Estas cuatro funciones dan el punto de la cara a la fraccion `t` de altura, para la
        // columna anterior (p) y para esta (c). Con ellas cada franja es un TRAPECIO inclinado
        // hacia afuera, y el borde de arriba coincide exactamente con el de la meseta.
        const pX = t => prev.base.x + (prev.top.x - prev.base.x) * t;
        const pY = t => prev.base.y + (prev.top.y - prev.base.y) * t;
        const cX = t => base.x + (top.x - base.x) * t;
        const cY = t => base.y + (top.y - base.y) * t;
        const est = hash2(Math.floor(wz / 3), 77 + (lado > 0 ? 5 : 0));
        const estriar = c => est < 0.42 ? mez(c, L.som, (0.42 - est) * 0.55)
          : est > 0.62 ? mez(c, L.luz, (est - 0.62) * 0.45) : c;
        const cuerpo = estriar(L.cuerpo);
        const franjas = [
          [0.00, 0.34, nb(estriar(mez(L.som, cuerpo, 0.4 + tinte * 0.2)))],   // el pie, en sombra
          [0.34, 0.72, nb(cuerpo)],                                           // el cuerpo: tierra
          [0.72, 1.00, nb(estriar(mez(cuerpo, L.luz, 0.5 + tinte * 0.3)))],   // el hombro, al sol
        ];
        // EL SOLAPE, que es lo que mata EL HILO. Dos poligonos que comparten un borde exacto no
        // se tocan en el pixel: el redondeo del rasterizado deja una costura de un pixel por la
        // que se ve el fondo, y a lo largo de toda la cresta eso se lee como un HILO dibujado.
        // Cada franja se estira medio pixel hacia abajo (tapa la juntura con la de abajo) y la de
        // arriba, ademas, medio hacia arriba (tapa la juntura con la meseta, que se dibujo antes).
        // Es el remedio clasico de esta clase de costura y no cuesta nada.
        for (const [a, b, col] of franjas) {
          ctx.globalAlpha = aBase;
          ctx.fillStyle = col;
          const sb = b >= 0.99 ? SOLAPE : 0;
          quad(ctx, pX(b), pY(b) - sb, cX(b), cY(b) - sb,
            cX(a), cY(a) + SOLAPE, pX(a), pY(a) + SOLAPE);
        }
        // LA TEXTURA DE LA CARA. Tres franjas planas dan volumen pero no dan MATERIA: la ladera se
        // leia como cartulina doblada. En vez de modelar relieve de verdad —que en este motor
        // seria caro y ademas se veria peor— se pinta TEXTURA: manchones de tierra mas clara y mas
        // oscura repartidos por la cara, deterministas por banda de mundo.
        //
        // No son ruido: cada manchon abarca una banda de ~9 m a lo largo del camino, asi que al
        // volar se ven pasar como vetas y afloramientos, y le dan ESCALA al cerro — sin una marca
        // asi, uno de 10 m y uno de 40 se ven exactamente igual.
        const bandaT = Math.floor(wz / 9);
        const alfaT = aBase * (1 - niebla);
        for (let m = 0; m < 3; m++) {
          const hm = hash2(bandaT, m * 271 + (lado > 0 ? 61 : 17));
          if (hm < 0.42) continue;                              // la cara no se cubre entera
          const y0 = 0.08 + hash2(bandaT, m * 271 + 7) * 0.72;
          const y1 = Math.min(1, y0 + 0.07 + hm * 0.15);
          const claro = hash2(bandaT, m * 271 + 33) > 0.55;
          ctx.globalAlpha = alfaT * (claro ? 0.22 : 0.3);
          ctx.fillStyle = claro ? L.luz : L.veta;
          quad(ctx, pX(y1), pY(y1), cX(y1), cY(y1), cX(y0), cY(y0), pX(y0), pY(y0));
        }
        // NO HAY CORONA. Era una franja de pasto dibujada en la cresta de CADA columna, y ese es
        // el HILO VERDE que se veia: cuando por detras hay un cerro mas alto, esa franja queda con
        // marron arriba y marron abajo, y deja de leerse como el filo de un cerro para leerse como
        // una linea pintada cruzando la ladera. Geometricamente estaba bien —es pasto sobre una
        // loma cercana— pero el ojo la lee como un error, y en esto manda el ojo.
        //
        // El borde no necesita marca: lo dice el cambio de verde (meseta) a marron (cara). Y donde
        // no hay meseta porque la cresta esta sobre la camara, tampoco hay filo que marcar — hay
        // cielo.
        //
        // ⚠ Fue la segunda vez que este borde se llevo una linea encima. Antes eran DOS (corona +
        // filo). Si alguien vuelve a querer marcar la cresta: no.
        // SOMBRA al pie: asienta la ladera contra el agua o la turba en vez de dejarla flotando
        const sh = Math.max(1, base.k * 0.6);
        ctx.globalAlpha = aBase * 0.5 * (1 - niebla);
        ctx.fillStyle = L.som;
        quad(ctx, x0, prev.base.y - sh, x1, base.y - sh, x1, base.y, x0, prev.base.y);
      }
      prev = { base, top, wx, wxc, h, camZ };
    }
  }
  ctx.globalAlpha = 1;
}

/** LA BARRERA que cierra el callejon (zigzag Z8). Se dibuja DESPUES de las laderas y antes de los
 *  obstaculos, y cruza el pasillo entero: es lo unico del mundo que no tiene por donde rodearse.
 *
 *  DOS CARAS Y NADA MAS. La FRONTAL —la que mira al avion— es la que dice donde esta el hueco, y
 *  es la unica que el jugador necesita leer a 150 m/s. La de ARRIBA (o la panza, si el puente
 *  queda por encima de la camara) le da el espesor, que es lo que la separa de una calcomania
 *  pegada al aire. Mas caras seria dibujo que nadie mira.
 *
 *  ⚠ SE PINTA DE PUNTA A PUNTA Y UN POCO MAS (`ZZ_PARED_X * 2`): la barrera tiene que ENTRARSE en
 *  las dos laderas, no llegar justo. Llegando justo, entre su borde y la cara del cerro queda una
 *  rendija por la que se ve el mundo de atras — el mismo agujero que costo tres playtests en la
 *  juntura de la meseta, en otro lugar. */
export function drawBarreras() {
  const p = pared();
  if (!p || p.barreras === 'no') return;
  const dv = run.dist;
  const b = barreraCerca(dv + 4, ZZ_PARED_Z);
  if (!b) return;
  const z0 = b.z0 - dv, z1 = b.z1 - dv;
  if (z1 <= 3) return;
  const cz = Math.max(3, z0);
  const T = tierraArriba(), L = caraLadera();
  const ancho = ZZ_PARED_X * 2;
  // la niebla de distancia, la misma de las laderas: una barrera lejana no puede ser mas nitida
  // que el cerro que tiene al lado
  const niebla = Math.max(0, Math.min(1, (cz - ZZ_NIEBLA_Z0) / (ZZ_NIEBLA_FULL - ZZ_NIEBLA_Z0)));
  const FOG = nieblaCol();
  const nb = c => mez(c, FOG, niebla);
  const puente = b.tipo === 'puente';
  // EL PUENTE ES OBRA DE MANO DEL HOMBRE y la roca no: el puente va gris y parejo (hormigon,
  // chapa), la roca va con las mismas tres franjas de tierra que el talud. Es lo que hace que se
  // lean distinto de lejos, que es cuando hay que decidir si se pasa por arriba o por abajo.
  const cara = puente ? mez(theme.land.rock, '#20262b', 0.55) : L.cuerpo;
  const arriba = puente ? mez(theme.land.rock, '#39424a', 0.4) : T.cerca;

  const A = proj(-ancho, b.y1, cz), B = proj(ancho, b.y1, cz);
  const C = proj(-ancho, b.y0, cz), D = proj(ancho, b.y0, cz);
  // LA TAPA (o la panza): se dibuja primero, va detras. Se elige cual segun de que lado la mira la
  // camara — desde abajo de un puente se ve su panza, desde arriba su lomo, y dibujar la que no es
  // deja la barrera dada vuelta.
  {
    const yTapa = cam.y > b.y1 ? b.y1 : b.y0;
    const lejos1 = proj(-ancho, yTapa, z1), lejos2 = proj(ancho, yTapa, z1);
    const cerca1 = proj(-ancho, yTapa, cz), cerca2 = proj(ancho, yTapa, cz);
    ctx.globalAlpha = 1;
    ctx.fillStyle = nb(cam.y > b.y1 ? arriba : mez(cara, L.som, 0.45));
    quad(ctx, lejos1.x, lejos1.y, lejos2.x, lejos2.y, cerca2.x, cerca2.y, cerca1.x, cerca1.y);
  }
  // LA CARA FRONTAL, en franjas como el talud: es lo que da la altura de un vistazo.
  const franjas = puente
    ? [[0, 1, cara]]
    : [[0, 0.36, mez(L.som, cara, 0.45)], [0.36, 0.74, cara], [0.74, 1, mez(cara, L.luz, 0.5)]];
  const pxY = t => C.y + (A.y - C.y) * t, pxY2 = t => D.y + (B.y - D.y) * t;
  for (const [t0, t1, col] of franjas) {
    ctx.fillStyle = nb(col);
    quad(ctx, C.x, pxY(t1) - (t1 >= 0.99 ? 0.9 : 0), D.x, pxY2(t1) - (t1 >= 0.99 ? 0.9 : 0),
      D.x, pxY2(t0) + 0.9, C.x, pxY(t0) + 0.9);
  }
  // EL FILO DE ARRIBA, una linea clara: es LA COTA que hay que superar, y sin marcarla el ojo no
  // sabe si ya la paso. En el puente marca ademas el borde del hueco de abajo.
  ctx.globalAlpha = 1 - niebla;
  ctx.fillStyle = puente ? '#8d9aa2' : T.corona;
  quad(ctx, A.x, A.y, B.x, B.y, B.x, B.y + Math.max(1, A.k * 0.5), A.x, A.y + Math.max(1, A.k * 0.5));
  if (puente) {
    // LA PANZA marcada tambien: por ahi se pasa, asi que su borde es informacion, no adorno.
    ctx.fillStyle = '#5a656d';
    quad(ctx, C.x, C.y - Math.max(1, C.k * 0.4), D.x, D.y - Math.max(1, D.k * 0.4), D.x, D.y, C.x, C.y);
    // LAS PATAS, contra las dos laderas. Sin ellas la losa flota y no se lee como puente.
    ctx.fillStyle = nb(mez(cara, L.som, 0.35));
    for (const lado of [-1, 1]) {
      const px0 = proj(lado * (ZZ_PARED_X - 3), b.y0, cz), px1 = proj(lado * (ZZ_PARED_X - 3), 0, cz);
      const w = Math.max(1, 2.2 * px0.k);
      quad(ctx, px0.x - w, px0.y, px0.x + w, px0.y, px1.x + w, px1.y, px1.x - w, px1.y);
    }
  }
  ctx.globalAlpha = 1;
}

/** Un cuadrilatero. Se dibuja con path y no con `px` porque la ladera es un TRAPECIO: sus dos
 *  lados tienen alturas distintas, y aproximarlo con rectangulos deja escalones. */
function quad(c, ax, ay, bx, by, cx, cy, dx, dy) {
  c.beginPath();
  c.moveTo(ax, ay); c.lineTo(bx, by); c.lineTo(cx, cy); c.lineTo(dx, dy);
  c.closePath(); c.fill();
}

/** Mezcla dos colores hexa y DEVUELVE HEXA. Copia local y chica: este modulo no puede importar de
 *  world.js (seria render→render con un archivo de 2600 lineas por una funcion de tres).
 *
 *  ⚠ DEVOLVER HEXA NO ES COSMETICO — es lo que permite ANIDARLA, y anidarla es lo que hace el
 *  dibujo: primero se mezclan dos tonos de tierra y despues el resultado se mezcla con la niebla.
 *  Devolviendo `rgb(...)`, la segunda llamada le pasaba `"gb(54,38,29)"` a un parseInt hexadecimal,
 *  sacaba NaN, y `NaN | 0` es 0: **negro puro**.
 *
 *  Y el sintoma era desconcertante a proposito de lo enga~noso que fue: el tercio del MEDIO de la
 *  ladera se veia bien (ese no anida) y los otros dos negros. Parecia un problema de niebla o de
 *  paleta; los colores se calculaban perfectos y el que estaba roto era el formato. Se encontro
 *  midiendo pixeles del canvas, no mirando la pantalla. */
function mez(a, b, k) {
  k = Math.max(0, Math.min(1, k)) || 0;
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = (((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * k) | 0;
  const g = (((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * k) | 0;
  const bl = ((pa & 255) + ((pb & 255) - (pa & 255)) * k) | 0;
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}
