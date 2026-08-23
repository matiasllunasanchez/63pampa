// ============================================================================================
// LEGACY — aislado aca el 18/8/2026 por PLAN_REFACTOR §4b (RF-A).
//
// OJO, Y ESTO NO ES UNA FORMALIDAD: la carpeta se llama `legacy` porque este modulo NACIO como
// el fallback del climax viejo, pero MEDIDO al mudarlo resulto que todavia tiene partes VIVAS
// que usa el juego de todos los dias. Estan listadas abajo. **No borrar nada de esto** hasta que
// RF2/RF8 las separen; hoy borrarlo rompe el juego, no limpia deuda.
// Anotado como divergencia en PLAN_REFACTOR §9.
//
// LO QUE SIGUE VIVO ACA:
//   · `drawCockpit` / `salpicar` / `MIRA_PLENA` / `V_VISOR` — LA CABINA. La usan
//     render/pulso.js (EL PULSO es hoy el UNICO climax fuera de cuarentena), y tambien el ARENA
//     y la PASADA. Es codigo vivo y central, no fallback.
//   · `drawBargeHull` / `drawBargeBow` — render/world.js dibuja el buque del pasillo con esto.
// ============================================================================================
// RENDER del ARENA VIEJO (fallback sin 3D de la fase ARENA): la barcaza en primera persona
// sobre riel (barcaza, zonas criticas, cabina y visor). El ARENA nuevo (vuelo libre) tiene su
// propio render en render/arena.js — esto es lo que corre con `?no3d` o si WebGL falla.
//
// El fondo 3D lo pone systems/three-world.js; aca va la capa 2D que se dibuja ENCIMA: el casco
// (solo si el 3D no esta activo), las zonas que hay que destruir, los efectos y la cabina.
//
// Como el resto del render, recibe `w`: un snapshot de solo lectura. Ademas de valores, trae tres
// FUNCIONES del momentum (momCam, momShipGeom, momZoneRect) porque la geometria cambia por frame
// y hay que consultarla al dibujar, no antes.
import { ctx, W, H, px, panel } from '../render/ctx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';
import { MOM_AX, MOM_AY, MSL_MAX, REATTACK_DUR } from '../data/tuning.js';

// LA CABINA Y SUS MEDIDAS, EN UN SOLO LUGAR. Cambiar el PNG es cambiar los TRES numeros juntos:
// `visor` y `vidrio` son mediciones DE ESE archivo, no constantes del juego. Estuvieron declarados
// a treinta lineas de distancia del `src` y paso exactamente lo que tenia que pasar — el asset
// cambio en un lado, las fracciones en el otro, y lo que se ve cuando eso se desincroniza es una
// cabina entera con el visor y el parabrisas en el lugar equivocado.
//
// COMO SE MIDEN (las dos, leyendo el PNG — nunca a ojo sobre la pantalla; ver la divergencia del
// 0.503 en PLAN_CINE_PESO):
//   visor   centro del vidrio del ALZA pintado, en fraccion del alto del PNG.
//   vidrio  donde TERMINA el parabrisas: el ultimo renglon del hueco central transparente, o sea
//           la ultima fila con alfa ~0 en la franja del medio. De ahi para abajo empieza la visera.
//
// ESTE PNG ES MAS ANGOSTO QUE LA PANTALLA (1.748:1 contra 1.778:1) y por eso existe el piso de
// ancho pleno (`altoAncho`, mas abajo): anclado por el alto dejaria una franja de mundo de 4 px a
// cada lado. El piso corre ANTES de `esc` — evita el descuido, no veta la decision de encuadre.
//
// EL OTRO ASSET, por si se vuelve: `../assets/planes/a4-skyhawk/cockpit.png` — 2816×1536 (1.833:1),
// visor 0.3932, vidrio 0.3164. Ese es mas ancho que el cuadro y no necesita el piso.
const COCKPIT = {
  src: '../assets/planes/cockpitv3.png',   // 3543×2027 · 1.748:1
  visor: 0.436,     // el vidrio del alza va de 0.374 a 0.498
  // hueco central transparente: ultima fila con alfa ~0 en la franja del medio (42–58 % del ancho),
  // 785 de 2027. Se prefiere el valor CHICO frente al 0.402 que salia de una franja mas angosta:
  // pasarse hacia abajo pone el agua y la sal sobre el TABLERO, y quedarse corto las deja sobre
  // vidrio igual. Cuando una medida tiene margen de error, el error barato es el de arriba.
  vidrio: 0.3873,
};

// arte de la cabina (marco del visor). Se precarga al importar; hasta que este listo se
// dibuja el fallback vectorial de abajo, asi el primer momentum nunca aparece vacio.
const COCKPIT_ASSET = { src: COCKPIT.src, img: new Image(), ready: false };
COCKPIT_ASSET.img.onload = () => { COCKPIT_ASSET.ready = true; };
COCKPIT_ASSET.img.src = COCKPIT_ASSET.src;

// ---- BARCAZA 2D (casco + superestructura) ----
// Compartida por el ARENA VIEJO (fallback sin 3D) y por la APROXIMACION en el PASILLO, que es
// donde mas se mira: el buque crece durante medio nivel y es el unico decorado grande del
// horizonte. Antes eran seis rectangulos con los colores del AVION (P.body/P.bodyDark): un
// bloque palido sin perfil, que ademas competia con los obstaculos que vienen de frente.
//
// La clave del rediseño es el VALOR, no el detalle: el buque se ve a CONTRALUZ contra un cielo
// claro y sobre agua oscura, asi que es una MASA OSCURA con luz de canto. Todo lo claro de la
// escena (obstaculos, trazadoras, espuma) queda leyendose por encima sin pelear con el.
const SH = {
  hullT: '#1b232a', hull: '#141b21', hullB: '#0d1319',   // francobordo: se oscurece hacia el agua
  boot: '#070b0e',                                        // obra viva / linea de flotacion
  deck: '#333e45',                                        // cubierta vista desde arriba
  sup: '#171f26', supL: '#212b33', supD: '#0e141a',       // superestructura (cara al sol / sombra)
  metal: '#0b1015', win: '#e0ad5c', rust: '#2b2018',      // los ventanales van ENCENDIDOS: es tarde
};
// PERFIL de destructor, en fracciones de eslora (de proa a popa) y alturas en `uh`. Que la
// silueta sea ESCALONADA es lo que la hace leer como buque de guerra y no como una caja sobre
// una tabla: torreta baja, caseta corrida, torre del puente, chimenea, hangar, torreta de popa.
const SUPER = [
  [0.20, 0.28, 0.85], [0.30, 0.74, 1.35], [0.36, 0.50, 2.7],
  [0.40, 0.46, 3.5], [0.56, 0.64, 2.5], [0.66, 0.80, 1.7], [0.84, 0.91, 0.9],
];
// BRUMA: en vez de dibujar el barco transparente (se veian el mar y los obstaculos A TRAVES del
// casco, que es justo lo que lo hacia ver sucio), cada color se MEZCLA con el del horizonte. El
// buque queda opaco siempre y lo que cambia con la distancia es el CONTRASTE — perspectiva
// atmosferica de manual, y de paso los enemigos nunca compiten con el fondo.
const mixCache = new Map();
function mixHex(c, to, k) {
  if (!k) return c;
  const key = c + to + (k = Math.round(k * 16) / 16);
  const hit = mixCache.get(key);
  if (hit) return hit;
  const a = parseInt(c.slice(1), 16), b = parseInt(to.slice(1), 16);
  const ch = s => Math.round(((a >> s) & 255) + (((b >> s) & 255) - ((a >> s) & 255)) * k);
  const out = '#' + (((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16)).slice(1);
  mixCache.set(key, out);
  return out;
}

/** Casco + superestructura. `t` (tiempo del juego) mueve la espuma; se recibe por parametro y no
 *  del snapshot porque la aproximacion del PASILLO tambien la llama. `haze`/`sky` la funden con
 *  el horizonte (0 = a quemarropa en el climax, ~0.85 = una sombra recien asomando). */
export function drawBargeHull(cx0, len, deckY, uh, t, haze, sky) {
  const SKY = sky || '#7d6a4e';
  const hz = c => mixHex(c, SKY, haze || 0);
  // LUZ DE CANTO: el borde de arriba de cada cuerpo toma el color del cielo del momento — es lo
  // que despega la silueta del fondo sin aclarar la masa (y acompaña solo el clima que toque).
  const rim = hz(mixHex(SH.deck, SKY, 0.72));
  const x0 = cx0 - len / 2, x1 = cx0 + len / 2, hullH = Math.max(1, uh * 1.5);
  if (uh < 1.7) {   // muy lejos: tres trazos, pero con PERFIL de buque (casco bajo, isla, mastil)
    px(x0, deckY + hullH * 0.2, len, Math.max(1, hullH), hz(SH.hull));
    px(cx0 - len * 0.09, deckY - Math.max(1, uh * 1.7), len * 0.16, Math.max(1, uh * 1.7 + 1), hz(SH.sup));
    px(cx0 + len * 0.06, deckY - Math.max(2, uh * 2.6), 1, Math.max(2, uh * 2.6), hz(SH.metal));
    return;
  }
  // ---- CASCO POR FILAS: la proa se mete hacia atras al bajar (lanzamiento de roda) y la popa se
  // recoge en el ultimo tercio. Escalera de rectangulos y no una diagonal suavizada: el dentado
  // es lo que lo mantiene en el pixel art del resto del juego.
  const rows = Math.max(3, Math.min(16, Math.round(hullH)));
  const rh = hullH / rows;
  for (let i = 0; i < rows; i++) {
    const f = i / (rows - 1);
    const bow = uh * 1.2 * Math.pow(f, 0.7);
    const stern = f > 0.7 ? uh * 0.45 * (f - 0.7) / 0.3 : 0;
    const col = f < 0.3 ? SH.hullT : f < 0.7 ? SH.hull : SH.hullB;
    px(x0 + bow, deckY + i * rh, (x1 - stern) - (x0 + bow), rh + 0.6, hz(col));
  }
  px(x0 + uh * 0.2, deckY, len - uh * 0.55, Math.max(1, uh * 0.18), hz(SH.deck));   // cubierta
  px(x0 + uh * 0.2, deckY, len - uh * 0.55, 1, rim);                                // canto contra el cielo
  if (uh > 4.5) {   // regueros de oxido bajo los imbornales: rompen la plancha lisa
    for (let i = 0; i < 4; i++) px(x0 + len * (0.24 + i * 0.17), deckY + uh * 0.35, 1, uh * 0.45, hz(SH.rust));
  }
  px(x0 + uh * 1.2, deckY + hullH - Math.max(1, uh * 0.22), len - uh * 1.7, Math.max(1, uh * 0.22), hz(SH.boot));

  // ---- SUPERESTRUCTURA escalonada (ver SUPER): masa oscura, cara izquierda al sol, canto claro
  for (const [a, b, h] of SUPER) {
    const bh = uh * h;
    if (bh < 1.6) continue;                                   // a esta escala ya seria ruido
    const bx0 = x0 + len * a, bw = Math.max(1, len * (b - a));
    px(bx0, deckY - bh, bw, bh, hz(SH.sup));
    px(bx0, deckY - bh, Math.max(1, bw * 0.34), bh, hz(SH.supL));
    px(bx0 + bw - Math.max(1, bw * 0.14), deckY - bh, Math.max(1, bw * 0.14), bh, hz(SH.supD));
    px(bx0, deckY - bh, bw, 1, rim);
  }
  // VENTANALES del puente: la unica luz calida del buque — a contraluz es lo que dice "hay gente
  // adentro" y de paso ancla el ojo en la torre, que es donde despues caen las zonas criticas.
  if (uh > 3.5) px(x0 + len * 0.365, deckY - uh * 2.4, len * 0.13, Math.max(1, uh * 0.26), hz(SH.win));
  // CHIMENEA: sombrerete oscuro y humo derivando hacia popa (tres motas, no una nube)
  const fx = x0 + len * 0.56, fw = len * 0.08;
  if (uh > 2.5) px(fx - fw * 0.1, deckY - uh * 2.5, fw * 1.2, Math.max(1, uh * 0.22), hz(SH.metal));
  if (uh > 4) {
    ctx.globalAlpha = 0.26;
    for (let i = 1; i < 4; i++) {
      px(fx + fw + i * uh * 0.6 + Math.sin(t * 0.9 + i) * uh * 0.3,
        deckY - uh * (2.5 + i * 0.55), Math.max(1, uh * 0.4 * i), Math.max(1, uh * 0.32), hz('#7d868c'));
    }
    ctx.globalAlpha = 1;
  }
  // MASTIL con cruceta y el RADAR girando: el ancho de la barra late (cos) — a esta escala es lo
  // unico que puede contar que el buque esta VIVO y ya nos esta viendo.
  const mx = x0 + len * 0.53, mh = uh * 4.6;
  px(mx, deckY - mh, Math.max(1, len * 0.008), mh, hz(SH.metal));
  px(mx - len * 0.03, deckY - mh * 0.78, len * 0.065, Math.max(1, uh * 0.14), hz(SH.metal));
  const rw = Math.max(1, len * 0.045 * Math.abs(Math.cos(t * 1.1)));
  px(mx - rw / 2, deckY - mh, rw, Math.max(1, uh * 0.18), hz(SH.metal));
  // CAÑONES de las dos torretas, apuntando alto: el buque no esta esperando, esta tirando
  if (uh > 3) {
    for (const a of [0.24, 0.875]) {
      px(x0 + len * a, deckY - uh * 1.55, Math.max(1, len * 0.01), uh * 0.75, hz(SH.metal));
    }
  }
  // ---- AGUA: bigote de proa y la flotacion picoteada (lo mas claro de todo el buque)
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 7; i++) {
    px(x0 + uh + (i / 7) * len * 0.95 + Math.sin(t * 2.4 + i * 1.7) * uh * 0.35,
      deckY + hullH - 1, uh * 0.9, 1, hz(P.foam));
  }
  ctx.globalAlpha = 0.75;
  px(x0 + uh * 0.95, deckY + hullH - Math.max(1, uh * 0.3), uh * 1.7, Math.max(1, uh * 0.3), hz(P.foam));
  ctx.globalAlpha = 1;
}

/** EL BUQUE DE PROA — la silueta que ve el pasillo cuando el climax es la PASADA (R3).
 *
 *  Es OTRO dibujo y no el mismo casco girado, por una razon de escala: de proa, a la distancia a
 *  la que se corta (`ENTRY_D`), el buque mide siete pixeles de manga. El casco lateral tiene
 *  perfil, torretas y ventanales; a siete pixeles nada de eso existe. Lo que un buque de proa te
 *  entrega a esa distancia es exactamente lo que se dibuja aca, y en este orden de importancia:
 *  la COLUMNA DE HUMO (lo unico alto, y lo primero que se ve de verdad en el mar), el BIGOTE DE
 *  PROA (lo unico claro), y recien despues la mancha oscura del casco con su palo.
 *
 *  `bw` es la MANGA en pixeles y `hTop` la altura de la perilla del palo sobre la flotacion: los
 *  dos los calcula el pasillo con la escala aparente de la camara del climax, no a ojo.
 */
export function drawBargeBow(cx, bw, waterY, hTop, t, haze, sky) {
  const SKY = sky || '#7d6a4e';
  const hz = c => mixHex(c, SKY, haze || 0);
  const w = Math.max(1, bw), half = w / 2;
  const hullH = Math.max(1, hTop * 0.24);
  // CASCO: de proa es un tronco que se ABRE hacia arriba (el lanzamiento de las amuras). Dos o
  // tres filas alcanzan; lo que hace que se lea como buque y no como boya es que la fila de abajo
  // sea mas angosta que la cubierta.
  const rows = Math.max(2, Math.min(6, Math.round(hullH)));
  for (let i = 0; i < rows; i++) {
    const f = i / (rows - 1);                       // 0 = cubierta, 1 = flotacion
    const rw = Math.max(1, w * (1 - f * 0.42));
    px(cx - rw / 2, waterY - hullH + (hullH / rows) * i, rw, hullH / rows + 0.6,
      hz(f < 0.5 ? SH.hullT : SH.hull));
  }
  px(cx - half, waterY - hullH, w, 1, hz(mixHex(SH.deck, SKY, 0.55)));   // canto de cubierta
  // SUPERESTRUCTURA en tres pisos que se angostan: es la escalera del SUPER lateral, vista de
  // frente. Con el buque cabeceando, todo el bloque sube y baja junto con el casco.
  const sup = [[0.62, 0.46], [0.40, 0.68], [0.24, 0.80]];
  for (const [fw, fh] of sup) {
    const sw = Math.max(1, w * fw), sh = hTop * fh - hullH;
    if (sh < 1) continue;
    px(cx - sw / 2, waterY - hullH - sh, sw, sh, hz(SH.sup));
    px(cx - sw / 2, waterY - hullH - sh, Math.max(1, sw * 0.4), sh, hz(SH.supL));
  }
  px(cx - 0.5, waterY - hTop, 1, hTop - hullH, hz(SH.metal));            // el palo, hasta la perilla
  if (hTop > 14) {   // ya cerca: la cruceta y el radar girando, lo unico que dice que esta VIVO
    const rw = Math.max(1, w * 0.5 * Math.abs(Math.cos(t * 1.1)));
    px(cx - rw / 2, waterY - hTop, rw, 1, hz(SH.metal));
  }
  // EL BIGOTE DE PROA: lo mas claro del cuadro y lo que dice que el buque VIENE NAVEGANDO. Se abre
  // mas ancho que la manga porque eso es lo que hace la ola de proa, y late para no quedar muerto.
  ctx.globalAlpha = 0.62;
  const fw = w * (1.5 + Math.sin(t * 2.2) * 0.18);
  px(cx - fw / 2, waterY - 1, fw, Math.max(1, hullH * 0.3), hz(P.foam));
  ctx.globalAlpha = 0.3;
  px(cx - fw * 0.8, waterY, fw * 1.6, 1, hz(P.foam));
  ctx.globalAlpha = 1;
  // LA COLUMNA DE HUMO. A esta distancia es LA lectura: sube desde la chimenea, deriva con el
  // viento y se ensancha al subir. Va mas alta que el palo a proposito — un buque en el mar se ve
  // por el humo mucho antes que por el casco, y eso es lo que sostiene el ultimo tramo del pasillo
  // ahora que el casco ya no ocupa media pantalla.
  ctx.globalAlpha = 0.34;
  const col = hz('#8b949a');
  for (let i = 0; i < 9; i++) {
    const u = i / 8;
    const sw = Math.max(1, w * (0.34 + u * 1.5));
    px(cx - sw / 2 + Math.sin(t * 0.5 + i * 0.8) * w * 0.5 + u * u * w * 1.6,
      waterY - hTop * (0.8 + u * 1.5), sw, Math.max(1, hTop * 0.16), col);
  }
  ctx.globalAlpha = 1;
}

/** La cabina. `w.yOff` la baja N pixeles: lo usa la fase ARENA para que el VISOR PINTADO del PNG
 *  caiga sobre la mira del juego. El ARENA VIEJO no lo pasa (0) porque alla la mira es la que se
 *  clava al visor (MOM_AY), al reves — mover el PNG lo desalinearia. */
// ---------- SAL EN EL PARABRISAS (SPEC_AGUA_OLAS F3.3) ----------
// Cuando pasas MUY bajo sobre el agua, el mar te salpica el vidrio. Son gotas QUIETAS —pegadas al
// parabrisas, no al mundo— que se secan en algo mas de un segundo.
//
// POR QUE ES DEL VIDRIO Y NO DEL MUNDO: es lo unico del juego que te recuerda que hay una cabina
// entre vos y el Atlantico. El resto de los efectos de agua pasan alla afuera; este pasa de este
// lado, y por eso va en la unica funcion que dibuja el vidrio (la comparten ARENA, PASADA y PULSO).
//
// POSICION DETERMINISTA por gota (trampa §1.3): con Math.random() por cuadro serian gotas nuevas
// cada frame, o sea ruido blanco, no salpicaduras. Nacen una vez y se quedan donde cayeron.
const SAL_DUR = 1.5;
const sal = [];
let salT = 0;

/** Salpica el parabrisas. `f` 0..1 es la fuerza (cuanta agua y que tan grande). La llaman las
 *  fases que tienen cabina Y agua debajo — hoy la PASADA y el ARENA (ver render/pasada.js). */
export function salpicar(f) {
  if (salT > SAL_DUR * 0.55) return;         // ya hay una salpicada fresca: no se apilan
  salT = SAL_DUR;
  sal.length = 0;
  const n = 6 + Math.round(Math.min(1, f) * 4);   // 6..10 gotas (§F3.3)
  for (let i = 0; i < n; i++) {
    sal.push({
      x: 20 + Math.random() * (W - 40),
      y: 18 + Math.random() * (H * 0.62),
      r: Math.random() < 0.3 ? 2 : 1,
      a: 0.5 + Math.random() * 0.5,
    });
  }
}

/** Las gotas que ya estan, secandose. La llama drawCockpit al final: van SOBRE el vidrio.
 *
 *  Recibe el reloj ABSOLUTO y saca el dt sola: los tres que dibujan cabina (ARENA, PASADA,
 *  PULSO) ya pasan `t` y ninguno pasa `dt`. Pedirles un campo nuevo a los tres para esto seria
 *  cambiar tres firmas por una gota de agua. */
let salLastT = 0;
function drawSal(t) {
  const dt = Math.max(0, Math.min(0.1, t - salLastT));   // el clamp cubre el salto entre fases
  salLastT = t;
  if (salT <= 0) return;
  salT -= dt;
  if (salT <= 0) { sal.length = 0; return; }
  const f = salT / SAL_DUR;                   // 1 recien salpicado · 0 seco
  // DOS TONOS POR GOTA, y no es adorno: el fondo del parabrisas es cielo CLARO arriba y cabina
  // OSCURA abajo. Una gota de un solo tono claro desaparecia contra el cielo — se vio en la
  // primera captura. Con un cuerpo oscuro y un brillo encima la gota se lee sobre los dos.
  for (const g of sal) {
    ctx.globalAlpha = g.a * f;
    px(g.x, g.y, g.r + 1, g.r + 1, '#5d7280');          // cuerpo: la gota tiene sombra propia
    ctx.globalAlpha = g.a * f * 1.1;
    px(g.x, g.y, g.r, g.r, '#f2fbff');                  // brillo arriba a la izquierda
    ctx.globalAlpha = g.a * f * 0.5;                    // el reguero: corre un pelo hacia abajo
    px(g.x + 1, g.y + g.r + 1, 1, 1 + g.r, '#8aa6b5');
  }
  ctx.globalAlpha = 1;
}

// ---------- LA GEOMETRIA DE LA CABINA ----------
// UNA sola medida del asset, y todo lo demas se deriva. Antes habia tres constantes a mano en tres
// archivos (MOM_AY, y un COCKPIT_Y en arena.js y otro en pulso.js) que decian lo mismo desde dos
// lados; cambiar el PNG obligaba a re-tunear las tres y la que no se miraba quedaba mintiendo.
//
// V_VISOR / V_VIDRIO — las dos medidas del asset, publicadas. Viven en `COCKPIT` (arriba, pegadas
// al `src`) y salen por aca porque las usan otros modulos; lo que NO puede volver a pasar es que se
// editen sin mirar de que PNG son.
export const V_VISOR = COCKPIT.visor;

// MEDIDO, NO ESTIMADO — y la diferencia ya se pago una vez. Se puso `vidrio` en 0.503 mirando el
// PNG y pareciendo razonable ("ahi arranca la visera"); el alfa decia 0.4016. Con 0.503 la ventana
// quedaba 28 px mas abajo de donde termina el vidrio de verdad, asi que todo lo que se encuadra
// contra ella —el buque del premio— se dibujaba con el casco DETRAS del tablero.
//
// V_VIDRIO lo necesita cualquiera que quiera pegar algo AL VIDRIO —sal seca, agua corriendo, hielo,
// sangre— para no terminar pintandolo sobre el tablero o afuera del cuadro. Antes cada uno se lo
// estimaba contra `top`, y cuando la cabina cambio de encuadre los dos que lo hacian (la sal y el
// agua del PULSO) quedaron dibujando arriba del borde de arriba: invisibles, sin fallar.
export const V_VIDRIO = COCKPIT.vidrio;

// LA CABINA ENTERA, SIEMPRE — y de que depende que se pueda.
//
// ANCHO PLENO (pedido de Matias, 8/2026). `cockpitv2` es 1.748:1 contra el 1.778:1 de la pantalla:
// por primera vez el PNG es MAS ANGOSTO que el cuadro, asi que anclado por el alto dejaba una
// franja de mundo de 4 px a cada lado — y una cabina con mundo a los costados se lee como una
// calcomania, que es justo lo que el resto de este bloque se propone evitar. La regla nueva es un
// PISO, no un reemplazo: la cabina nunca puede quedar mas angosta que la pantalla (`altoAncho`).
// El precio, medido: 4,6 px de arco de canopy que se van por arriba. Se paga sin dudar.
//
// El PNG anterior era 1.833:1 y la pantalla 1.778:1: casi la misma proporcion, o sea que no habia margen para
// elegir. Anclandola por el ANCHO —que es lo que hacia el viejo `COCKPIT_FILL`— el alto cae donde
// cae, y con una mira baja lo que se va del cuadro es EL PANEL: quedaba el arco del canopy
// flotando sobre nada. Se ancla al reves: **el ALTO es el que no puede desbordar** —arriba se
// pierde el arco, abajo el panel, y esas dos son justamente las que hacen que se lea como una
// cabina— y el ancho sale de el. Que termine siendo MAS ancha que la pantalla no cuesta nada: lo
// que se va por los costados son los rieles.
//
// LA INVARIANTE, entonces: la cabina NUNCA se recorta. Lo unico que cambia entre modos es DONDE
// APUNTA, y el tamaño es la consecuencia — no una perilla aparte que alguien tenga que re-tunear.
// el alto que hace que el PNG mida EXACTO el ancho de la pantalla: el piso de la cuenta de abajo
const altoAncho = im => (im && im.naturalWidth ? W * im.naturalHeight / im.naturalWidth : 0);
const altoDe = mira => Math.min(mira / V_VISOR, (H - mira) / (1 - V_VISOR));

// LA MIRA PLENA: la UNICA Y en que la cabina sale entera Y de borde a borde. Sale de despejar
// `altoDe(mira) = H`, que solo se cumple cuando el visor cae donde el PNG lo tiene — a `V_VISOR`
// de los 270. Cualquier mira mas baja obliga a achicarla, y achicarla la DESPEGA de los bordes:
// una cabina con mundo a los costados se lee como una calcomania, no como estar adentro.
//
// O sea: un modo puede apuntar donde quiera, pero el precio de apuntar lejos de aca es esa
// despegada. Es la cuenta que hay que tener a mano el dia que se recambie el PNG.
export const MIRA_PLENA = V_VISOR * H;

/** La cabina.
 *
 *  `mira` es la Y de pantalla donde tiene que caer el VISOR PINTADO — o sea, donde cada modo pone
 *  su punteria (el arena y la PASADA, en H/2; el PULSO, en su centro util). La cabina se acomoda
 *  sola: no hay un offset por modo que alguien tenga que re-tunear.
 *
 *  `yOff` es un corrimiento EXTRA y animado, encima de la posicion derivada. Lo usa el director
 *  del PULSO para bajar la cabina en el premio y abrir cielo.
 *
 *  `esc` (1 por omision) es CUANTO DE LA PANTALLA se come, como fraccion del maximo que entra sin
 *  recortarse. En 1 la cabina llena el cuadro; abajo de 1 se apoya en el borde de ABAJO y todo lo
 *  que libera se lo queda el mundo, arriba. OJO CON LA MIRA: mientras `esc` es 1 el visor cae
 *  clavado donde el modo pidio, pero al achicar gana el anclaje de abajo y el visor SUBE. Es a
 *  proposito — una cabina flotando sobre una franja de mar no es una cabina mas chica, es una
 *  calcomania— y por eso la mira se lee como "donde apunta a tamaño pleno". */
/** DONDE VA A CAER LA CABINA este cuadro, sin dibujar nada: `{ bx, by, top, h, vidrio }`.
 *
 *  Existe separada porque hay cosas que se dibujan ANTES que la cabina —son mundo, y el canopy
 *  tiene que poder taparlas— pero necesitan saber donde termina el vidrio: la ristra de bombas del
 *  PULSO sale de abajo del morro, y "abajo del morro" es el borde de abajo del parabrisas, no un
 *  numero. Sin esto habia que elegir entre dibujarla tarde (y que el canopy no la tape) o adivinar
 *  la geometria en dos lados, que es como se desincronizan las cosas.
 *
 *  Es la MISMA cuenta que usa drawCockpit — la usa llamando aca, no copiandola. */
export function cajaCabina(w) {
  // `yOff` NO corre el dibujo: corre LA MIRA, y el tamaño se vuelve a derivar de ahi. Bajar el
  // PNG a secas dejaba el panel afuera del cuadro (104 px de corrimiento en el premio del PULSO =
  // un arco de canopy flotando). Bajando la mira, la cabina baja Y SE ACHICA — que ademas es lo
  // que hace de verdad un encuadre que se abre— pero sigue estando ENTERA.
  const mira = (w.mira == null ? H / 2 : w.mira) + (w.yOff || 0);
  // solo bob de vuelo: la cabina es la trompa del avion, va clavada a la pantalla
  // (apuntar mueve el MUNDO detras del vidrio, no la cabina)
  const bx = Math.sin(w.mom.t * 1.4) * 1.5;
  const by = Math.sin(w.mom.t * 2.2) * 2;
  const im = COCKPIT_ASSET.img;
  if (!(COCKPIT_ASSET.ready && im.naturalWidth)) return { bx, by, top: by, h: H, vidrio: by + V_VIDRIO * H, dw: W + 12 };
  // ESCALA UNIFORME y ALTO PRIMERO (ver altoDe/MIRA_PLENA arriba): el mayor alto que no se sale
  // por ninguno de los dos bordes, y el ancho detras por la proporcion real del PNG. La cabina
  // no se deforma nunca y no se recorta nunca; si algun dia se re-exporta a otra proporcion,
  // esto la sigue solo.
  // …con el PISO de ancho pleno: la cabina no puede quedar accidentalmente mas angosta que la
  // pantalla. `cockpitv2` es 1.748:1 contra 1.778:1, asi que anclada por el alto deja 4 px de mundo
  // a cada lado — una sliver que se lee como calcomania y que nadie pidio.
  //
  // EL PISO VA ANTES DE `esc`, Y ESO IMPORTA. Aplicado despues, vetaba la unica perilla con la que
  // un modo puede decir "quiero MENOS cabina y mas mundo": el PULSO la tenia en 0.74 por pedido
  // expreso y el piso se la comia entera, sin fallar y sin avisar. Son dos cosas distintas — el
  // piso evita un descuido de 4 px, `esc` es una decision de encuadre— y una no puede pisar a la
  // otra. Sobre el tamaño natural manda el piso; sobre el tamaño natural manda despues quien
  // encuadra.
  const dibH = Math.max(altoDe(mira), altoAncho(im)) * (w.esc || 1);
  const dw = dibH * im.naturalWidth / im.naturalHeight;
  // …y SIN HUECO ABAJO. El visor clavado en la mira es la regla, pero achicar la cabina la
  // despega del borde de abajo y ahi aparece una franja de mundo POR DEBAJO del tablero: eso no
  // es una cabina mas chica, es una calcomania de cabina. Estas sentado adentro — el panel y las
  // rodillas se van por el borde y no terminan en el aire. Con `esc` en 1 las dos cuentas dan lo
  // mismo (altoDe ya se apoya en el borde de abajo), asi que esto solo actua al achicar.
  const dibY = by + Math.max(mira - V_VISOR * dibH, H - dibH);
  return { bx, by, top: dibY, h: dibH, vidrio: dibY + V_VIDRIO * dibH, dw };
}

export function drawCockpit(w) {
  const { mom, t } = w;
  const caja = cajaCabina(w);
  const bx = caja.bx, by = caja.by;
  const im = COCKPIT_ASSET.img;
  let dibY = caja.top, dibH = caja.h;      // la caja REAL del dibujo (el fallback vectorial la llena)
  if (COCKPIT_ASSET.ready && im.naturalWidth) {
    // ESCALA UNIFORME y ALTO PRIMERO (ver altoDe/MIRA_PLENA arriba): el mayor alto que no se sale
    // por ninguno de los dos bordes, y el ancho detras por la proporcion real del PNG. La cabina
    // no se deforma nunca y no se recorta nunca; si algun dia se re-exporta a otra proporcion,
    // esto la sigue solo.
    ctx.drawImage(im, bx + (W - caja.dw) / 2, dibY, caja.dw, dibH);
  } else {
    ctx.save();
    ctx.translate(bx, by);
    // parantes laterales del canopy (diagonales)
    ctx.fillStyle = '#10151a';
    ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(28, -8); ctx.lineTo(4, H - 28); ctx.lineTo(-8, H - 28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W + 8, -8); ctx.lineTo(W - 28, -8); ctx.lineTo(W - 4, H - 28); ctx.lineTo(W + 8, H - 28); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2a343c';
    ctx.beginPath(); ctx.moveTo(28, -8); ctx.lineTo(4, H - 28); ctx.moveTo(W - 28, -8); ctx.lineTo(W - 4, H - 28); ctx.stroke();
    // capo / panel de instrumentos abajo
    ctx.fillStyle = '#0e1317';
    ctx.beginPath(); ctx.moveTo(-8, H + 8); ctx.lineTo(-8, H - 24); ctx.lineTo(W * 0.30, H - 33); ctx.lineTo(W * 0.70, H - 33); ctx.lineTo(W + 8, H - 24); ctx.lineTo(W + 8, H + 8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#39434b';
    ctx.beginPath(); ctx.moveTo(-8, H - 24); ctx.lineTo(W * 0.30, H - 33); ctx.lineTo(W * 0.70, H - 33); ctx.lineTo(W + 8, H - 24); ctx.stroke();
    // instrumentos placeholder: dos diales + luz de armamento
    px(W * 0.36, H - 28, 11, 9, '#1a2126'); px(W * 0.375, H - 25, 6, 1, P.accent);
    px(W * 0.53, H - 28, 11, 9, '#1a2126'); px(W * 0.55, H - 23, 5, 1, P.warn);
    px(W * 0.70, H - 30, 3, 3, mom.hitFx ? P.warn : '#3a2a1a');    // luz de canon
    // reflejo del vidrio (sutil)
    ctx.globalAlpha = 0.05; ctx.strokeStyle = '#eaf6ff'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(W * 0.20, 8); ctx.lineTo(W * 0.46, H - 42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.30, 4); ctx.lineTo(W * 0.54, H - 46); ctx.stroke();
    ctx.globalAlpha = 1; ctx.lineWidth = 1;
    ctx.restore();
  }
  // (los canones estan en las alas, FUERA de la vista: las trazadoras se dibujan antes
  // de la cabina en drawMomentum y el marco las tapa — aca no va ningun fogonazo)
  drawSal(t);   // la sal va SOBRE el vidrio: ultima, despues del marco
  // la caja dibujada sale por la puerta: el PULSO reparte su sal contra el vidrio de verdad
  // y no contra un offset que hacia de proxy.
  // la caja dibujada sale por la puerta, y con ella LA FRANJA DE VIDRIO ya en coordenadas de
  // pantalla: quien pega algo al parabrisas no tiene que saber nada del PNG ni re-medirlo.
  return caja;
}

// MOMENTUM: barcaza a lo largo, zonas criticas resaltadas, mira y ventana de tiempo
export function drawMomentum(w) {
  const { mom, momPhase, phases, msl, objectiveShip, t, is3D, parts, popups, mouse,
          momCam, momShipGeom, momZoneRect } = w;
  const ph = phases[momPhase], g = momShipGeom();
  // NOTA: seguimos en espacio-MUNDO ROTADO por el alabeo (aplicado en draw): el barco, las
  // zonas, los fx y las particulas giran con el mundo — al rolar ves la barcaza inclinarse

  // tinte de camara lenta sobre el fondo (extendido: la camara panea con la punteria, momCam)
  ctx.fillStyle = '#0a121a'; ctx.globalAlpha = 0.28; ctx.fillRect(-80, -80, W + 160, H + 160); ctx.globalAlpha = 1;

  // ---- barcaza (casco compartido; crece LENTO durante la pasada via momShipGeom) ----
  // en momentum-3D el barco lo pone three.js (blit de draw); el 2D queda de fallback
  if (!is3D) drawBargeHull(g.cx, g.len, g.deckY, g.uh, t);
  // zonas ya destruidas (de esta pasada): chamuscado + humo
  for (const z of mom.zones) {
    if (z.hp > 0) continue;
    const r = momZoneRect(z);
    px(r.x, r.y, r.w, r.h, '#16191c');
    if (Math.random() < 0.3) parts.push({
      x: r.x + Math.random() * r.w, y: r.y, vx: (Math.random() - 0.5) * 8,
      vy: -(12 + Math.random() * 14), life: 0.8, c: '#3a3f43', r: 1.5
    });
  }
  // nombre de la barcaza sobre el barco
  ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = P.warn; ctx.fillText(objectiveShip, g.cx, g.deckY - g.uh * 4.6);

  // ---- zonas activas: corchetes titilantes + etiqueta + barra de HP ----
  for (const z of mom.zones) {
    if (z.hp <= 0) continue;
    const r = momZoneRect(z), blink = Math.sin(mom.t * 7) > -0.4;
    if (blink) {
      ctx.strokeStyle = P.warn; ctx.lineWidth = 1; ctx.globalAlpha = 0.9;
      const c = Math.max(2, r.w * 0.22);
      ctx.beginPath();
      ctx.moveTo(r.x, r.y + c); ctx.lineTo(r.x, r.y); ctx.lineTo(r.x + c, r.y);
      ctx.moveTo(r.x + r.w - c, r.y); ctx.lineTo(r.x + r.w, r.y); ctx.lineTo(r.x + r.w, r.y + c);
      ctx.moveTo(r.x, r.y + r.h - c); ctx.lineTo(r.x, r.y + r.h); ctx.lineTo(r.x + c, r.y + r.h);
      ctx.moveTo(r.x + r.w - c, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h - c);
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.font = '6px monospace'; ctx.fillStyle = P.warn;
    ctx.fillText(T(z.label), r.x + r.w / 2, r.y - 3);
    px(r.x, r.y + r.h + 2, r.w, 2, '#2e3c45');                       // barra de HP
    px(r.x, r.y + r.h + 2, r.w * (z.hp / z.maxHp), 2, P.warn);
  }

  // FX de camara lenta (mundo): trazadoras AA con estela, flak expandiendose y rocio derivando
  for (const f of mom.fx) {
    const a = Math.min(1, f.life);
    if (f.k === 'tr') {
      const L = 3 + f.T * 9;                                    // la estela se alarga al acercarse
      const dl = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / dl, uy = f.vy / dl;
      ctx.globalAlpha = a * 0.35; ctx.strokeStyle = P.warn;
      ctx.beginPath(); ctx.moveTo(f.x - ux * L * 1.8, f.y - uy * L * 1.8); ctx.lineTo(f.x, f.y); ctx.stroke();
      ctx.globalAlpha = a * 0.85;
      ctx.beginPath(); ctx.moveTo(f.x - ux * L, f.y - uy * L); ctx.lineTo(f.x, f.y); ctx.stroke();
      px(f.x - 1, f.y - 1, 2, 2, P.accent);
    } else if (f.k === 'sh') {                                // rafaga de canon: trazo grueso glow + nucleo
      const dl = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / dl, uy = f.vy / dl;
      const L = 8 + Math.min(8, f.T * 6);
      ctx.globalAlpha = 0.35; ctx.strokeStyle = P.warn; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(f.x - ux * L, f.y - uy * L); ctx.lineTo(f.x, f.y); ctx.stroke();
      ctx.globalAlpha = 0.95; ctx.strokeStyle = P.accent; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(f.x - ux * L * 0.6, f.y - uy * L * 0.6); ctx.lineTo(f.x, f.y); ctx.stroke();
      ctx.lineWidth = 1;
    } else if (f.k === 'ms') {                                // misil del jugador: cuerpo + llama
      const dl = Math.hypot(f.vx, f.vy) || 1, ux = f.vx / dl, uy = f.vy / dl;
      ctx.globalAlpha = 1;
      px(f.x - ux * 3 - 1, f.y - uy * 3 - 1, 3, 3, P.ink);
      px(f.x - 1, f.y - 1, 2, 2, P.foam);
      px(f.x - ux * 6 - 1, f.y - uy * 6 - 1, 2, 2, P.accent);
    } else if (f.k === 'st') {
      ctx.globalAlpha = a * 0.4;
      px(f.x, f.y, f.len, 1, P.foam);
    } else {                                                  // 'fk': fogonazo breve → humo lento
      const r = 1 + f.vr * f.T;
      ctx.globalAlpha = a * (f.T < 0.14 ? 0.9 : 0.45);
      ctx.fillStyle = f.T < 0.14 ? P.warn : '#7c838a';
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, 7); ctx.fill();
      if (f.T >= 0.14) { ctx.fillStyle = '#565c63'; ctx.beginPath(); ctx.arc(f.x - r * 0.3, f.y + r * 0.2, r * 0.55, 0, 7); ctx.fill(); }
    }
  }
  ctx.globalAlpha = 1;

  // particulas y popups en espacio-MUNDO (anclados al barco/zonas), antes de la cabina
  for (const p of parts) { ctx.globalAlpha = Math.min(1, p.life * 2); px(p.x, p.y, p.r, p.r, p.c); }
  ctx.globalAlpha = 1;
  ctx.font = '7px monospace'; ctx.textAlign = 'center';
  for (const p of popups) { ctx.globalAlpha = Math.min(1, p.life); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y); }
  ctx.globalAlpha = 1;

  // de aca en adelante espacio-PANTALLA: se deshace el ROLL y el paneo de camara —
  // la cabina, la mira y el letterbox van NIVELADOS (vos rolas, tu marco no)
  const cm = momCam();
  {
    const rcx = W / 2 + cm.x, rcy = H / 2 + cm.y;
    ctx.translate(rcx, rcy); ctx.rotate(mom.roll); ctx.translate(-rcx, -rcy);
  }
  ctx.translate(cm.x, cm.y);

  // (las rafagas del canon ya no son lineas fijas: son proyectiles fx 'sh' que viajan
  // LENTOS por el mundo desde las alas — se dibujan arriba, antes de la cabina, y el
  // marco/panel los tapa al nacer)

  // ---- cabina en primer plano (camara desde adentro) ----
  drawCockpit({ ...w, mira: MOM_AY });

  // ---- RESPLANDOR de disparo en los bordes: feedback INSTANTANEO al apretar fuego ----
  // (la bala tarda ~1.3s en cruzar el vidrio; sin esto parece que no responde)
  // PLACEHOLDER: cuadrados blancos — se reemplazara por asset (ver docs/UPDATE_ANIMATIONS.md)
  if (mom.flashL > 0) {
    ctx.globalAlpha = Math.min(1, mom.flashL * 9);
    px(0, 56, 9, 15, '#ffffff'); px(9, 60, 5, 8, '#ffffff'); px(14, 63, 3, 4, '#ffffff');
    ctx.globalAlpha = Math.min(0.5, mom.flashL * 4);
    px(0, 50, 20, 27, '#ffffff');                       // halo suave
    ctx.globalAlpha = 1;
  }
  if (mom.flashR > 0) {
    ctx.globalAlpha = Math.min(1, mom.flashR * 9);
    px(W - 9, 56, 9, 15, '#ffffff'); px(W - 14, 60, 5, 8, '#ffffff'); px(W - 17, 63, 3, 4, '#ffffff');
    ctx.globalAlpha = Math.min(0.5, mom.flashR * 4);
    px(W - 20, 50, 20, 27, '#ffffff');                  // halo suave
    ctx.globalAlpha = 1;
  }

  // ---- mira sobre el vidrio: LIBRE con mouse (PC) o fija al visor (tactil) + chispa ----
  const ax = mouse.on ? mouse.x : MOM_AX, ay = mouse.on ? mouse.y : MOM_AY;
  if (mom.hitFx) px(ax - 1, ay - 1, 2, 2, P.foam);
  const mc = mom.hitFx ? P.accent : P.ink;
  ctx.strokeStyle = mc; ctx.globalAlpha = 0.9;
  ctx.strokeRect(ax - 5, ay - 5, 10, 10);
  ctx.globalAlpha = 1;
  px(ax - 7, ay, 3, 1, mc); px(ax + 5, ay, 3, 1, mc);
  px(ax, ay - 7, 1, 3, mc); px(ax, ay + 5, 1, 3, mc);

  // ---- letterbox + titulo + ventana de tiempo ----
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, 13); ctx.fillRect(0, H - 13, W, 13);
  ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = P.warn;
  ctx.fillText(T('mom_title') + '  ·  ' + T('mom_pass', { n: momPhase + 1, m: phases.length })
    + (mom.pass > 1 ? '  ·  ' + T('mom_pass_n', { n: mom.pass }) : ''), W / 2, 9);
  const tw = 90;
  px(W / 2 - tw / 2, H - 9, tw, 3, '#2e3c45');
  if (mom.turn > 0) {
    // VIRAJE: la barra se rellena al reves — es lo que falta para volver a tener el blanco
    const tp = 1 - Math.max(0, mom.turn) / REATTACK_DUR;
    px(W / 2 - tw / 2, H - 9, tw * tp, 3, P.foam);
  } else {
    const tfrac = Math.max(0, mom.timer / ph.time);
    px(W / 2 - tw / 2, H - 9, tw * tfrac, 3, tfrac < 0.3 ? P.warn : P.accent);   // roja cuando queda poco
  }
  // municion de misiles [Z] a la izquierda de la barra de tiempo
  ctx.font = '6px monospace'; ctx.textAlign = 'right'; ctx.fillStyle = P.dim;
  ctx.fillText('Z', W / 2 - tw / 2 - 26, H - 4);
  for (let i = 0; i < MSL_MAX; i++)
    px(W / 2 - tw / 2 - 22 + i * 6, H - 9, 4, 3, i < msl ? P.accent : '#2e3c45');
  ctx.textAlign = 'center';
  if (mom.doneT <= 0 && mom.t < 2.5) {
    ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
    ctx.fillText(T('mom_hint'), W / 2, 21);   // bajo el titulo, para no pisar el avion en primer plano
  }
}
