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
import { pared, paredH, paredXAt, paredCara } from '../core/zigzag.js';
import { tierraH, hayRelieve } from '../core/tierra.js';
import { theme } from './theme.js';
import { ZZ_PARED_Z, ZZ_PARED_PASO, ZZ_MESETA_W, ZZ_NIEBLA_Z0, ZZ_NIEBLA_FIN } from '../data/tuning.js';

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
    for (let camZ = ZZ_PARED_Z; camZ >= 3; camZ -= ZZ_PARED_PASO) {
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
        const f = 1 - camZ / ZZ_PARED_Z;
        // LA NIEBLA LLEGA A 1 ANTES DEL LIMITE DE DIBUJO, y de eso depende que no se vea el corte:
        // si en el ultimo metro dibujado la ladera todavia conserva algo de su color, ahi hay un
        // canto — una linea vertical donde el terreno simplemente termina. Saturando la niebla en
        // ZZ_NIEBLA_FIN, el ultimo tramo se pinta EXACTAMENTE del color del horizonte y el corte
        // queda invisible por construccion, no por suerte.
        const niebla = Math.max(0, Math.min(1,
          (camZ - ZZ_NIEBLA_Z0) / (ZZ_PARED_Z * ZZ_NIEBLA_FIN - ZZ_NIEBLA_Z0)));
        // LA MESETA, PRIMERO (va detras de la cara: la cara le tapa el filo y el empalme queda
        // limpio). Solo se dibuja cuando LA CAMARA ESTA POR ENCIMA de esta cresta — es una
        // superficie horizontal, y desde abajo no se ve: dibujarla igual la proyectaria por encima
        // del horizonte, o sea pintando cielo. Que aparezca al trepar no es un truco: es
        // exactamente lo que pasa cuando subis lo suficiente para ver arriba del cerro.
        if (cam.y > gy + h) {
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
          const fueraB = proj(prev.wxc + lado * mesaW, gy + prev.h, camZ + ZZ_PARED_PASO);
          const fM = 1 - camZ / ZZ_PARED_Z;
          ctx.globalAlpha = 1;                                   // opaca, como la ladera
          ctx.fillStyle = mez(mez(T.lejos, T.cerca, Math.min(1, fM * 1.6)), nieblaCol(), niebla);
          quad(ctx, prev.top.x, prev.top.y, top.x, top.y, fueraA.x, fueraA.y, fueraB.x, fueraB.y);
          // el FILO del borde, mas claro: es lo que hace legible donde termina la tierra y
          // empieza el aire — o sea, donde te caes del cerro.
          ctx.fillStyle = mez(T.borde, nieblaCol(), niebla);
          ctx.globalAlpha = 0.6 * (1 - niebla * 0.8);
          const fil = Math.max(1, base.k * 0.8);
          quad(ctx, prev.top.x, prev.top.y, top.x, top.y,
            top.x + lado * fil, top.y + fil * 0.3, prev.top.x + lado * fil, prev.top.y + fil * 0.3);
          // …y encima, el CAMPO: matas y algun arbol. Es lo que le da escala a la meseta.
          // la vegetacion SI se desvanece con alfa: son motas de un pixel, y una mota tapada por
          // niebla y una mota que no esta se ven igual. Lo que no puede ser transparente es la
          // MASA del cerro, que es lo que dejaba ver el cielo por detras.
          vegetacion(T, wxc, wz, camZ, gy + h, lado, 1 - niebla);
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
        const est = hash2(Math.floor(wz / 3), 77 + (lado > 0 ? 5 : 0));
        const estriar = c => est < 0.42 ? mez(c, L.som, (0.42 - est) * 0.55)
          : est > 0.62 ? mez(c, L.luz, (est - 0.62) * 0.45) : c;
        const cuerpo = estriar(L.cuerpo);
        const franjas = [
          [0.00, 0.34, nb(estriar(mez(L.som, cuerpo, 0.4 + tinte * 0.2)))],   // el pie, en sombra
          [0.34, 0.72, nb(cuerpo)],                                           // el cuerpo: tierra
          [0.72, 1.00, nb(estriar(mez(cuerpo, L.luz, 0.5 + tinte * 0.3)))],   // el hombro, al sol
        ];
        for (const [a, b, col] of franjas) {
          ctx.globalAlpha = aBase;
          ctx.fillStyle = col;
          quad(ctx,
            x0, prev.base.y + (prev.top.y - prev.base.y) * b, x1, base.y + (top.y - base.y) * b,
            x1, base.y + (top.y - base.y) * a, x0, prev.base.y + (prev.top.y - prev.base.y) * a);
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
          quad(ctx,
            x0, prev.base.y + (prev.top.y - prev.base.y) * y1, x1, base.y + (top.y - base.y) * y1,
            x1, base.y + (top.y - base.y) * y0, x0, prev.base.y + (prev.top.y - prev.base.y) * y0);
        }
        // CORONA de turba sobre la cresta
        const gr = Math.max(1, base.k * 0.7);
        ctx.globalAlpha = aBase;
        ctx.fillStyle = mez(T.corona, nieblaCol(), niebla);
        quad(ctx, x0, prev.top.y, x1, top.y, x1, top.y + gr, x0, prev.top.y + gr);
        // SOMBRA al pie: asienta la ladera contra el agua o la turba en vez de dejarla flotando
        const sh = Math.max(1, base.k * 0.6);
        ctx.globalAlpha = aBase * 0.5 * (1 - niebla);
        ctx.fillStyle = L.som;
        quad(ctx, x0, prev.base.y - sh, x1, base.y - sh, x1, base.y, x0, prev.base.y);
      }
      prev = { base, top, wx, wxc, h };
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
