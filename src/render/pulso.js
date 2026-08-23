// EL PULSO — el overlay de la prueba de destreza (docs/sistemas/PLAN_EL_PULSO.md).
//
// Se dibuja ENCIMA del mundo 2D congelado: el mar, el horizonte y el buque creciendo son los del
// pasillo (drawApproachBarge) — este modulo NO los pinta. Lo que agrega es la cabina y la
// autopista de la secuencia.
//
// LA REGLA 3 DEL PLAN mandando en el layout: lo que viene SE VE VENIR. La secuencia entera esta
// en pantalla desde el primer cuadro y el cursor avanza sobre ella; nunca aparece un simbolo
// sorpresa de a uno. El jugador lee adelante, igual que lee el pasillo.
//
// Espacio de coordenadas: MUNDO (480×270, W/H de ctx.js) — es la capa donde vive la cabina.
import { ctx, W, H, PZ, px } from './ctx.js';
import { plane } from '../core/state.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';
import { run } from '../core/run.js';
import { TOK_GLIFO, PULSO_CINE, PULSO_TEATRO } from '../data/pulso.js';
import { padInfo } from '../core/input.js';
import { bargeGeom } from './world.js';
import * as momRender from '../legacy/momentum_render.js';
import { nuevoReguero, humear, MISIL } from './reguero.js';

// DONDE APUNTA EL PULSO. Mismo contrato que el arena: es la mira del modo, y la cabina se acomoda
// sola para que su visor pintado caiga aca.
//
// APUNTA A LA MIRA PLENA (legacy/momentum_render.js): la unica Y en que la cabina sale ENTERA y de borde
// a borde. Estuvo en 150 —«el PULSO apunta mas abajo porque la autopista de tokens vive en la
// mitad de abajo»— y esa razon se murio sin que el numero se enterara: la autopista se mudo al
// CIELO (LANE_Y, aca abajo) y lo unico que quedaba de aquel 150 era una cabina achicada, despegada
// de los bordes y con el panel a medio salir del cuadro.
const COCKPIT_MIRA = momRender.MIRA_PLENA;

/** El glifo de un token. Los direccionales son FLECHAS: valen igual para una tecla y para un stick.
 *  El REMATE no — es un boton, y su nombre depende de con que estas jugando. Decia 'Z' siempre, asi
 *  que con joystick la prueba pedia una tecla que no ibas a apretar. `padInfo.id` esta vacio hasta
 *  que se toca un mando, y ahi vuelve a decir 'Z'. */
function glifo(k) {
  if (k !== 'Z' || !padInfo.id) return TOK_GLIFO[k] || k;
  return padInfo.kind === 'xbox' ? 'LB' : 'L1';
}
// La autopista de compases va EN EL CIELO, arriba del buque. Probado a media altura (74) se leia
// bien pero quedaba ESCRITA ENCIMA del blanco: la secuencia y el buque son las dos cosas que hay
// que mirar, y no pueden pelearse el mismo pixel. El cielo esta vacio y es lo que sobra.
const LANE_Y = 34;
// el buque arranca alrededor de y=56 en el mundo: todo lo de la prueba vive por encima de eso
const SKY_BOT = 60;

/** Un compas: su rotulo diegetico (regla 2) y sus tokens como glifos. `st` 0=hecho 1=activo 2=por venir */
function drawCompas(cx, y, bar, st, ti, t) {
  const on = st === 1;
  ctx.textAlign = 'center';
  // ROTULO: el nombre de la maniobra. Es lo que convierte "abajo-izquierda-izquierda" en volar.
  ctx.font = on ? 'bold 8px monospace' : '7px monospace';
  ctx.fillStyle = st === 0 ? '#4a5b61' : on ? P.accent : P.dim;
  ctx.fillText(bar.label, cx, y - 10);
  // TOKENS
  const gs = bar.toks.map(glifo);
  const step = 15;
  const x0 = cx - (gs.length - 1) * step / 2;
  for (let i = 0; i < gs.length; i++) {
    const hecho = st === 0 || (on && i < ti);
    const activo = on && i === ti;
    const gx = x0 + i * step;
    if (activo) {   // el cursor: caja que late — donde estan los ojos
      const pulse = 0.5 + Math.sin(t * 9) * 0.5;
      ctx.globalAlpha = 0.25 + pulse * 0.35;
      px(gx - 7, y - 8, 14, 14, P.accent);
      ctx.globalAlpha = 1;
    }
    ctx.font = activo ? 'bold 11px monospace' : '10px monospace';
    ctx.fillStyle = hecho ? '#5f7a72' : activo ? '#0a0e11' : st === 2 ? P.dim : P.ink;
    ctx.fillText(gs[i], gx, y + 4);
  }
}

/** LOS PARAMETROS DE LA CABINA de este cuadro. Una sola vez, en un solo lado: los pide el dibujo
 *  y los pide `ventana()` (que corre ANTES, cuando todavia no se dibujo nada). Escritos dos veces
 *  se desincronizan en cuanto alguien mueva la mira o el `esc`. */
function cabinaW(c, t) {
  // `c` es la foto DEL DIRECTOR (systems/cine.js), no la del PULSO. Estuvo leyendose como `Q.cine`
  // y ese campo no existe —el snapshot del PULSO es el store, y la cinematica llega aparte, por
  // parametro— asi que `yOff` valia 0 SIEMPRE: el verbo `cam` del director bajaba la cabina en el
  // premio y no bajaba nada. Otra perilla muerta sin dar error.
  return { mom: { t: run.t }, t, mira: COCKPIT_MIRA, esc: PULSO_TEATRO.CABINA_ESC,
           yOff: c ? c.cam.off : 0 };
}

/** LA VENTANA: la Y en que termina el parabrisas — o sea, el alto de mundo que la cabina deja ver.
 *
 *  Existe porque el BUQUE se dibuja antes que la cabina (es mundo) y necesita saber contra que se
 *  esta encuadrando. Con la cabina a ancho pleno esto dejo de ser un detalle: la ventana bajo de
 *  170 a 136 px, y un buque dimensionado contra la PANTALLA queda medio metido abajo del tablero.
 *  Lo pide game.js y se lo pasa al sistema, que decide cuanto de ella llenar. */
export const ventana = (c, t) => momRender.cajaCabina(cabinaW(c, t)).vidrio;

// QUITAR — la caja REAL de la cabina del PULSO este cuadro. Sin esto, "la cabina sale chica" es
// una impresion sobre una captura y no un numero, y ya me hizo perder dos vueltas.
if (typeof window !== 'undefined') window.__cabdbg = () => {
  const w = window.__cabW;
  if (!w) return JSON.stringify({ error: 'todavia no se dibujo una cabina' });
  const c = momRender.cajaCabina(w);
  return JSON.stringify({ mira: w.mira, yOff: +(w.yOff || 0).toFixed(1), esc: w.esc,
    top: +c.top.toFixed(1), h: +c.h.toFixed(1), dw: +c.dw.toFixed(1), vidrio: +c.vidrio.toFixed(1) });
};

/** DONDE PEGO, en pantalla. Sale de la geometria que publico el que dibujo el buque
 *  (render/world.js) y no de una copia de la cuenta: si el buque escora o se hunde, el fuego
 *  escora y se hunde con el. Devuelve null si el buque no esta dibujado (no deberia pasar). */
function puntoImpacto(z) {
  const g = bargeGeom(); if (!g) return null;
  const x = g.bx + (g.len / 2) * (z.hitU || 0);
  const y = g.by + g.uh * (z.hitV || 0);
  // el punto viaja con la ESCORA: misma rotacion que aplico world.js, alrededor de la flotacion
  const c = Math.cos(g.tilt || 0), s = Math.sin(g.tilt || 0);
  const dx = x - g.bx, dy = y - g.waterY;
  return { x: g.bx + dx * c - dy * s, y: g.waterY + dx * s + dy * c, uh: g.uh, g };
}

// CUANTOS. Son perillas de teatro y por eso viven aca y no en data/: no cambian ninguna regla, y
// el dia que haya una hoja de sprites para esto se reemplaza el dibujo sin tocar los numeros.
const FOCOS = 7, SOLDADOS = 9;

/** Un estallido: nucleo claro, bola caliente y esquirlas. Crece y se apaga con `p` (0..1).
 *
 *  LA BOLA VA POR FILAS de ancho variable — un circulo DENTADO, como todo lo redondo del juego.
 *  El primer intento la dibujaba con dos rectangulos grandes y a esta escala (el buque crece 2.4×)
 *  se veia literalmente un cuadrado naranja tapando media pantalla. */
function estallido(x, y, r0, p) {
  const r = Math.max(2, r0 * (0.3 + p * 1.15));
  const a = Math.max(0, 1 - p);
  const rows = 9;
  for (let i = 0; i < rows; i++) {
    const f = (i / (rows - 1)) * 2 - 1;                       // -1..1 de arriba a abajo
    const w = Math.sqrt(Math.max(0, 1 - f * f)) * r;
    ctx.globalAlpha = a * (0.5 + 0.5 * (1 - Math.abs(f)));
    px(x - w, y + f * r * 0.85, w * 2, Math.max(1, r * 0.26), i % 2 ? '#e8842a' : '#c85a1e');
  }
  const cr = r * 0.42 * (1 - p * 0.5);                        // nucleo: lo ultimo en apagarse
  ctx.globalAlpha = a;
  px(x - cr, y - cr * 0.8, cr * 2, cr * 1.6, '#ffd479');
  if (p < 0.35) px(x - cr * 0.5, y - cr * 0.4, cr, cr * 0.8, '#fff6e0');
  ctx.globalAlpha = Math.max(0, 0.75 - p);
  for (let i = 0; i < 11; i++) {         // esquirlas: reparto fijo, sin azar (mismo cuadro siempre)
    const an = i * 2.399, d = r * (1.05 + (i % 3) * 0.45) * (0.4 + p);
    const s = Math.max(1, r * 0.09);
    px(x + Math.cos(an) * d, y + Math.sin(an) * d * 0.7, s, s, i % 2 ? '#ffd479' : '#c8a06a');
  }
  ctx.globalAlpha = 1;
}

// UN REGUERO POR BOMBA. Viven aca y no en la bomba porque la ristra no son objetos: se recalcula
// entera cada cuadro desde el avance del tramo. El humo, en cambio, ES memoria — y esa memoria hay
// que guardarla en algun lado.
const REGS = [];
const regDe = i => (REGS[i] || (REGS[i] = nuevoReguero()));
/** Se tiran al entrar y al salir de la suelta: humo de la corrida anterior colgado en el aire es
 *  basura de otra vida, igual que el `salto` del propio reguero. */
const limpiarRegs = () => { REGS.length = 0; };

/** LO QUE PASA AFUERA DEL VIDRIO durante el premio: la ristra, el estallido y el buque ardiendo.
 *  Se dibuja ANTES de la cabina — es mundo, y el canopy tiene que poder taparlo. */
function drawCineMundo(Q, c, t, cab) {
  const z = Q.premio.zona;
  const im = puntoImpacto(z); if (!im) return;
  const uh = Math.max(2, im.uh);

  // ---- LA RISTRA (plan §3: el arma son las bombas, no un misil). Salen de abajo del cuadro —de
  // la panza del avion, que esta detras de la cabina— y se ALEJAN hacia el buque: encogen. Es el
  // unico tramo del modo en que el jugador no hace nada, y es a proposito: es el silencio.
  if (c.parte !== 'suelta') limpiarRegs();
  else {
    // DE DONDE SALEN. En tercera, DEL AVION. En cabina salen de DEBAJO DEL MORRO — y "debajo del
    // morro" es el borde de abajo del parabrisas, no el borde de abajo de la pantalla: naciendo
    // ahi la ristra aparecia ya lanzada, de atras del tablero, y el playtest pidio verla SALIR.
    // Por eso la caja de la cabina se calcula antes de dibujar nada (momRender.cajaCabina).
    const chase = c.cam.modo === 'chase';
    const sp = chase ? proj(plane.x, plane.y, PZ)
      : { x: W / 2, y: (cab ? cab.vidrio : H) - 2 };
    // LA TRAYECTORIA de la bomba `i` en su avance `p`, para poder pedirsela tambien a la estela.
    const vuelo = (i, p) => {
      const x0 = sp.x + (i - (PULSO_CINE.BOMBAS - 1) / 2) * 8;
      return {
        x: x0 + (im.x - x0) * p,
        // parabola: la bomba sube un pelo al salir y despues cae sobre el blanco
        y: sp.y + (im.y - sp.y) * (p * p * 0.65 + p * 0.35),
        // ARRANCAN GRANDES: salen de al lado tuyo. Con 4 px la ristra nacia ya del tamaño que
        // tiene a medio camino y no se leia como algo que sale — se leia como algo que aparece.
        s: Math.max(1, PULSO_CINE.BOMBA_R * (1 - p * 0.86)),
      };
    };
    for (let i = 0; i < PULSO_CINE.BOMBAS; i++) {
      // el avance del tramo lo da el director (`fParte`): el render no necesita saber cuanto dura
      const p = Math.max(0, Math.min(1, c.fParte * 1.35 - i * 0.11));
      if (p <= 0) continue;
      // LA ESTELA, primero (va DEBAJO de la bomba): el humo que deja al salir. Es EL REGUERO —
      // la misma mecanica que el humo de tobera y los vortices de punta del avion (render/
      // reguero.js), en su version de misil: mas grande y blanca.
      //
      // Estuvo muestreando la trayectoria hacia atras cuadro a cuadro y se veia bien, pero era una
      // cuarta estela hecha a mano en un cuarto archivo. El reguero, ademas, deja el humo DONDE EL
      // ARMA PASO en vez de recalcularlo desde donde esta ahora: por eso se abre y se deshilacha
      // como humo en vez de acompañar rigido al proyectil.
      const b = vuelo(i, p);
      humear(regDe(i), b.x, b.y, Object.assign({ t, f: 1 - p * 0.4, on: p < 0.97, corta: true }, MISIL));
      px(b.x - b.s / 2, b.y - b.s, b.s, b.s * 2, '#232a2f');
      px(b.x - b.s / 2, b.y - b.s, b.s, Math.max(1, b.s * 0.45), '#7c8b94');
      // EL MOTOR, mientras dura: el fogonazo que la empuja los primeros metros. Es lo que convierte
      // "un punto que se aleja" en "algo que acaba de salir de abajo tuyo".
      if (p < 0.3) {
        const fl = (1 - p / 0.3) * b.s;
        ctx.globalAlpha = 0.9 - p / 0.4;
        px(b.x - fl * 0.4, b.y + b.s * 0.6, fl * 0.8, fl * 1.5, '#ffd479');
        px(b.x - fl * 0.22, b.y + b.s * 0.6, fl * 0.44, fl, '#fff6e0');
        ctx.globalAlpha = 1;
      }
    }
  }

  // ---- EL IMPACTO y lo que sigue: el fuego no se apaga cuando termina el compas del estallido,
  // se queda ardiendo toda la muerte.
  if (c.parte === 'impacto' || c.parte === 'muerte') {
    const pi = c.parte === 'impacto' ? c.fParte : 1;
    if (pi < 1) estallido(im.x, im.y, uh * 0.95 * z.blast * Q.clase.blast, pi);
    // FOGONAZO a pantalla completa en los primeros cuadros: la pantalla se lava, como en la
    // cabina de verdad. Dura poquisimo — es un golpe, no un fundido.
    if (c.parte === 'impacto' && c.tParte < 0.13) {
      ctx.globalAlpha = 0.75 * (1 - c.tParte / 0.13);
      ctx.fillStyle = '#fff6e0'; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
  if (c.parte === 'muerte') {
    const humo = z.humo * Q.clase.humo;
    // ---- REVIENTA POR DENTRO (pedido de Matias, 8/2026) ----
    // El buque NO se parte ni se va a pique: se llena de estallidos. Varios focos repartidos a lo
    // largo del casco CERCA del impacto, cada uno con su retardo — la misma lectura que la cadena
    // de D4: uno por vez y no todos juntos, que se leeria como una sola explosion mas grande.
    //
    // TODO DETERMINISTA (trampa §1.3 del repo): las posiciones y los retardos salen del INDICE con
    // aritmetica de primos, no de `Math.random()` por cuadro. Con azar por cuadro los focos
    // saltarian de lugar en cada frame y seria ruido, no una nave reventando.
    for (let i = 0; i < FOCOS; i++) {
      const t0 = 0.10 + i * 0.26 + ((i * 53) % 7) / 55;          // cuando le toca a este foco
      const pf = (c.tParte - t0) / 0.7;
      if (pf <= 0 || pf >= 1) continue;
      // repartidos a lo largo del casco, con mas densidad CERCA del impacto (el sesgo al cubo)
      const u = (((i * 37) % 13) / 13 - 0.5) * 2;
      const fx2 = im.x + u * u * u * im.g.len * 0.30;
      const fy2 = im.y + (((i * 29) % 5) / 5 - 0.5) * uh * 0.85;
      // RECORTADO EN LA FLOTACION, como el casco: sin esto los focos bajos se pintan mar adentro
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, im.g.waterY + uh * 0.5); ctx.clip();
      // EL TAMAÑO: comparable al estallido del impacto (0.95·uh), no un poperío. Con 0.34-0.61 se
      // veian pops chiquitos contra un buque que en el premio llena la ventana — y lo que se pide
      // aca es que el barco REVIENTE, no que chisporrotee.
      estallido(fx2, fy2, uh * (0.58 + ((i * 17) % 4) * 0.13) * z.blast, pf);
      ctx.restore();
    }
    // ---- LOS QUE SALEN DESPEDIDOS ----
    // Es lo que convierte una explosion en una tripulacion. Van chiquitos y en silueta: a esta
    // escala una figura de tres pixeles tumbando dice "habia gente" sin volverse un gag.
    for (let i = 0; i < SOLDADOS; i++) {
      const t0 = 0.22 + ((i * 41) % 9) / 9 * 0.9;
      const ps = (c.tParte - t0) / 1.25;
      if (ps <= 0 || ps >= 1) continue;
      const lado = i % 2 ? 1 : -1;
      const sx = im.x + (((i * 23) % 11) / 11 - 0.5) * im.g.len * 0.34;
      // ARCO: sale para arriba y para afuera, y la gravedad lo baja. Cae AL AGUA, que es donde
      // termina cualquiera que sale volando de un barco.
      const vy0 = uh * (1.5 + ((i * 13) % 5) * 0.28);
      const x = sx + lado * ps * uh * (1.1 + ((i * 7) % 3) * 0.35);
      const y = im.y - vy0 * ps + uh * 4.6 * ps * ps;
      if (y > im.g.waterY + uh * 0.3) continue;               // ya se lo trago el mar
      ctx.globalAlpha = 0.9;
      const sw = Math.max(1, uh * 0.13), sh2 = Math.max(1, uh * 0.3);
      // TUMBA: gira mientras cae — un cuerpo que cae derecho se lee como un poste
      const gir = ps * 9 * lado;
      ctx.save(); ctx.translate(x, y); ctx.rotate(gir);
      px(-sw / 2, -sh2 / 2, sw, sh2, '#3d4436');                    // cuerpo
      px(-sw / 2, -sh2 / 2, sw, Math.max(1, sh2 * 0.3), '#5a6350');  // casco/espalda al sol
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    // EL SEGUNDO ESTALLIDO (solo el polvorin): mas grande que el primero y desde la flotacion
    // la MARCA que dejo la timeline al volar la santabarbara: cuanto hace que estallo
    const tSec = c.marcas.sec === undefined ? -1 : c.t - c.marcas.sec;
    if (tSec >= 0) {
      const ps = Math.min(1, tSec / 0.9);
      if (ps < 1) {
        // RECORTADO EN LA FLOTACION, igual que el casco: sin esto la bola se pintaba mar adentro
        // y a esta escala quedaba una plancha naranja abajo del agua.
        ctx.save();
        ctx.beginPath(); ctx.rect(0, 0, W, im.g.waterY + uh * 0.7); ctx.clip();
        estallido(im.x, im.g.waterY - uh * 0.5, uh * 1.55 * z.blast, ps);
        ctx.restore();
      }
    }
    // FUEGO: lengua que titila en el punto de impacto (y en la flotacion si volo la carga)
    const fw = uh * (0.7 + humo * 0.5);
    for (let i = 0; i < 7; i++) {
      const fl = Math.abs(Math.sin(t * (7 + i) + i * 1.7));
      ctx.globalAlpha = 0.5 + fl * 0.4;
      px(im.x - fw / 2 + (i / 7) * fw, im.y - uh * 0.8 * fl - 1,
        Math.max(1, fw / 6), Math.max(1, uh * (0.5 + fl * 0.9)), i % 2 ? '#e8842a' : '#ffd479');
    }
    ctx.globalAlpha = 1;
    // COLUMNA DE HUMO: sube y deriva. Es lo que se ve de un buque tocado a kilometros, y lo que
    // hace que la muerte del logistico (humo 1.7) no se confunda con la del radar (0.55).
    //
    // VA NEGRA Y OPACA. El primer intento fue gris al 34% y sobre el cielo encapotado del
    // Atlantico no se veia NADA: el humo de un buque ardiendo es lo mas oscuro del cuadro, no una
    // veladura. La transparencia se guarda para la punta de la columna, que es donde se deshace.
    const n = Math.round(11 * humo);
    for (let i = 0; i < n; i++) {
      const f = i / Math.max(1, n - 1);
      const sube = Math.min(1, c.tParte * (0.9 + humo * 0.5)) * f;
      const sw = uh * (0.8 + f * 3.2) * humo;
      ctx.globalAlpha = 0.92 - f * 0.62;
      px(im.x - sw / 2 + Math.sin(t * 0.7 + i * 1.3) * uh * 1.1 + sube * uh * 3.4,
        im.y - sube * uh * 13 - uh, sw, Math.max(2, sw * 0.85), i % 3 ? '#171b1f' : '#2b3238');
    }
    ctx.globalAlpha = 1;
  }
}

/** El PREMIO escrito: que se le pego, como se muere, y lo que se cobra. Va sobre la cabina — es
 *  recuento, no mundo. Cada cosa tiene SU renglon fijo: probado con popups, los tres textos caian
 *  en la misma `y` y se leian encimados. */
function drawCinePremio(Q, c) {
  const pr = Q.premio;
  ctx.textAlign = 'center';
  // LA ZONA que se eligio, desde el estallido: es la respuesta a la unica decision del modo
  if (c.parte === 'impacto' || c.parte === 'muerte') {
    ctx.globalAlpha = Math.min(1, (c.parte === 'impacto' ? c.tParte : 1) / 0.2);
    ctx.font = 'bold 9px monospace'; ctx.fillStyle = P.warn;
    ctx.fillText(T(pr.zona.str), W / 2, 11);
  }
  if (c.parte !== 'muerte') { ctx.globalAlpha = 1; return; }
  // LA LINEA DE LA CLASE: lo unico de la cinematica que el jugador va a recordar textualmente
  ctx.globalAlpha = Math.min(1, c.tParte / 0.5);
  ctx.font = '8px monospace'; ctx.fillStyle = P.foam;
  ctx.fillText(T(Q.clase.str), W / 2, 22);

  const ap = Math.min(1, Math.max(0, c.tParte - 0.5) / 0.4);
  ctx.globalAlpha = ap;
  ctx.textAlign = 'left';
  const sellos = [
    [pr.sellos.limpio, 'pulso_s_limpio'],
    [pr.sellos.rapido, 'pulso_s_rapido'],
    [pr.sellos.bravo, 'pulso_s_bravo'],
  ];
  let y = 38;   // debajo de los dos renglones de arriba: la cuenta se lee al final, no compite
  for (const [on, k] of sellos) {
    if (!on) continue;                       // los que no se ganaron no se nombran: no es un checklist
    px(20, y - 5, 4, 4, P.foam);
    ctx.font = '7px monospace'; ctx.fillStyle = P.ink;
    ctx.fillText(T(k), 28, y);
    y += 10;
  }
  ctx.font = 'bold 12px monospace'; ctx.fillStyle = P.accent;
  ctx.fillText('+' + pr.pts, 20, y + 6);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
}

/** SAL SECA EN EL VIDRIO (Q5). Volaste dos mil metros a ras del Atlantico: el canopy tiene el mar
 *  encima. Va DESPUES de la cabina —esta del lado de adentro del vidrio, entre el ojo y el mundo—
 *  y con posiciones FIJAS: si titilara seria nieve, y la sal esta seca y quieta.
 *
 *  Es teatro puro: no informa nada. Justamente por eso es de Q5 (§5: «tension sin leer nada»). */
function drawSal(y0, y1) {
  const alto = Math.max(6, y1 - y0 - 8);
  for (let i = 0; i < PULSO_TEATRO.SAL; i++) {
    // reparto determinista (dos primos y el modulo): la misma sal toda la prueba, y la misma en
    // cada partida — es una marca del avion, no un efecto que se re-sortea
    const fx = ((i * 97) % 101) / 101, fy = ((i * 37) % 53) / 53;
    // DENTRO DE LA FRANJA DE VIDRIO, y acumulada ARRIBA, que es donde seca el viento. Estuvo
    // medida contra el borde de arriba de la cabina y nada mas — cuando la cabina paso a arrancar
    // en y=0 toda la sal se apilo en un renglon de un pixel. Un efecto que no falla, solo
    // desaparece, es el que mas tarda en descubrirse.
    const y = y0 + 4 + Math.pow(fy, 1.6) * alto;
    const x = 14 + fx * (W - 28);
    ctx.globalAlpha = 0.09 + (i % 3) * 0.045;
    px(x, y, 1 + (i % 2), 1, '#dfe8ee');
  }
  ctx.globalAlpha = 1;
}

/** EL AGUA EN EL VIDRIO. Volando a ras el mar SALTA: el canopy se llena de gotas que el viento
 *  estira hacia atras y hacia los costados. Es lo que separa "vuelo bajo" de RASANTE, y es la mitad
 *  del modo — el juego se llama asi.
 *
 *  Va en la cabina (no hay vidrio en tercera) y su densidad sale de la ALTURA: a 2 m es un manto,
 *  a 7 no queda nada. El reparto es determinista y lo que se mueve es la FASE — el agua corre por
 *  el vidrio, no titila (misma regla que la sal seca: `Math.random()` por cuadro es nieve).
 */
// SONDA (QUITAR antes de publicar): cuantas gotas quedaron DENTRO del cuadro el ultimo cuadro
// dibujado. Existe porque este efecto ya se murio dos veces en silencio —una porque nadie lo
// llamaba y otra porque quedo apuntando a una geometria de cabina que ya no existia, dibujando
// arriba del borde de arriba— y las dos veces se descubrio jugando, no midiendo. Un efecto que no
// falla y solo DESAPARECE necesita que alguien lo cuente.
let aguaN = 0;
if (typeof window !== 'undefined') window.__vidrio = () => aguaN;
// …y LA CAJA de la cabina tal como quedo este cuadro. Tres cosas dependen ya de esta geometria —el
// agua del vidrio, la ristra que sale de abajo del morro y el encuadre del buque— y ninguna se
// puede discutir sin poder leerla.
let cajaUlt = null;
if (typeof window !== 'undefined') window.__cabina = () => JSON.stringify(cajaUlt);

function drawAguaVidrio(y0, y1, alt, t) {
  aguaN = 0;
  const d = Math.max(0, 1 - alt / PULSO_TEATRO.AGUA_ALT);   // 0 arriba del techo, 1 pegado al agua
  if (d <= 0.02) return;
  const alto = Math.max(10, y1 - y0 - 6);
  const n = Math.round(PULSO_TEATRO.AGUA * d);
  for (let i = 0; i < n; i++) {
    const fa = ((i * 61) % 97) / 97, fb = ((i * 43) % 71) / 71, fc = ((i * 29) % 59) / 59;
    // CADA GOTA TIENE SU LUGAR EN EL VIDRIO. El primer intento las hacia salir todas de un punto
    // en el centro y abrirse en abanico: a esa altura el centro del cuadro es JUSTO donde esta el
    // buque, asi que el agua se leia como si la escupiera el blanco. Mismo error que las lineas de
    // velocidad naciendo en el punto de fuga, y misma correccion — repartidas de entrada.
    const x0 = 8 + fa * (W - 16);
    const lado = (x0 - W / 2) / (W / 2);          // -1 izquierda · 1 derecha
    // CORREN hacia arriba y hacia afuera: el agua pega abajo del parabrisas y el aire la arrastra
    // por encima del canopy. La fase avanza con el tiempo y se envuelve; las de los costados corren
    // mas rapido, que es donde el viento pega de lleno.
    const v = 0.5 + Math.abs(lado) * 0.8 + fc * 0.45;
    const p = (fb + t * v) % 1;                   // 0 recien salpicada · 1 llegando al borde
    const x = x0 + lado * p * 44;
    // TODO adentro de la franja de vidrio que publica la cabina: fuera de ahi no hay vidrio donde
    // pegarse, hay tablero — o directamente el borde del cuadro.
    const y = y1 - 2 - p * alto;
    const L = 2 + p * 7 * (0.4 + Math.abs(lado));
    // DOS TONOS, misma razon que las gotas de lluvia de la cabina: el parabrisas tiene cielo CLARO
    // arriba y mar OSCURO abajo, y un reguero de un solo tono claro desaparece contra el cielo.
    ctx.globalAlpha = (0.30 + (i % 3) * 0.13) * d * (1 - p * 0.45);
    if (y >= 0 && y <= H && x > -L && x < W) aguaN++;
    px(x, y + 1, Math.max(1, L), 1, '#41707f');       // sombra: la gota tiene cuerpo
    px(x, y, Math.max(1, L), 1, '#cfe6f0');
    if (i % 2 === 0) px(x + L, y, 2, 1, '#eaf6ff');   // la cabeza de la gota, mas clara
  }
  ctx.globalAlpha = 1;
}

/** `w` = snapshot: { Q, cine, t }.
 *  `Q` es la foto del sistema (systems/pulso.js) y `cine` la del DIRECTOR (systems/cine.js): el
 *  premio ya no tiene reloj propio, lo lleva la timeline. Los dos llegan por parametro y no por
 *  import (convencion 4): el que dibuja no toca el estado, y menos el de otro sistema. */
export function drawPulso(w) {
  const Q = w.Q; if (!Q) return;
  const t = w.t;
  const cine = Q.fase === 'cine' ? w.cine : null;

  // VIÑETA: el tunel de vision del que esta concentrado. Ademas apaga los bordes para que la
  // secuencia y el buque sean lo unico que compite por la mirada.
  // EN EL PREMIO SE ABRE: la concentracion se suelta junto con el tiempo (ver timeScale) — el
  // tunel era el esfuerzo, y el esfuerzo ya paso.
  const vg = 0.72 * (cine ? Math.max(0.25, 1 - cine.t / 1.1) : 1);
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vg.toFixed(3)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // EL FLAK, CONGELADO. Cada fallo lo trae un grado mas cerca — y en tiempo casi detenido el
  // peligro no se mueve: se QUEDA ahi colgado. Estar quieto en el medio del fuego es la imagen del
  // modo. No mata (nada colisiona en la prueba): es la cuenta del fallo hecha visible.
  //
  // Va ANTES de la cabina a proposito: los estallidos estan AFUERA del vidrio, asi que el canopy
  // los tapa. Dibujados encima parecian mugre en la pantalla.
  if (Q.flak > 0) {
    for (let i = 0; i < Q.flak * 7; i++) {
      const a = i * 2.399;                                     // reparto sin azar: mismo cuadro siempre
      const r = 120 - Q.flak * 22 + (i % 3) * 11;
      const fx = W / 2 + Math.cos(a) * r * 1.6, fy = 54 + Math.sin(a) * r * 0.34;
      ctx.globalAlpha = 0.3 + (i % 3) * 0.08;
      px(fx - 4, fy - 3, 9, 7, '#4a4038');
      px(fx - 2, fy - 5, 5, 11, '#4a4038');
      px(fx - 1, fy - 1, 3, 3, '#c8a06a');
      ctx.globalAlpha = 1;
    }
  }

  // EL PREMIO, lo que pasa AFUERA: la ristra, el estallido, el buque ardiendo. Antes de la cabina
  // por la misma razon que el flak — el canopy tiene que poder taparlo.
  // LA CAJA DE LA CABINA, calculada ANTES de dibujar nada: la necesita la ristra (sale de abajo
  // del morro) y despues la usa el propio dibujo de la cabina. Es la misma cuenta, pedida una vez.
  const cabW = cabinaW(cine, t);
  const caja = momRender.cajaCabina(cabW);
  cajaUlt = { top: +caja.top.toFixed(1), h: +caja.h.toFixed(1), ancho: +caja.dw.toFixed(1), vidrio: +caja.vidrio.toFixed(1), off: +cabW.yOff.toFixed(1) };
  if (cine) drawCineMundo(Q, cine, t, caja);

  // LA CABINA. Se reusa tal cual la del climax 2D (con su `yOff`, igual que el ARENA): es el mismo
  // avion y el mismo vidrio — no hay una cabina distinta por modo.
  // …y en el premio la BAJA EL DIRECTOR (verbo `cam`): se abre cielo para el buque justo cuando la
  // autopista ya no esta y no hay nada mas que leer. Es la misma cabina corrida, no otra cabina, y
  // el offset viene ya interpolado en el snapshot — el render no mantiene una rampa propia.
  //
  // EN TERCERA (`cam: 'chase'`) NO SE DIBUJA NI LA CABINA NI LA SAL: las dos son dispositivos de
  // primera persona. La sal esta entre el ojo y el mundo, y desde afuera del avion no hay vidrio
  // donde pegarse. Ahi el avion lo dibuja el orquestador, con el sprite de siempre.
  if (!cine || cine.cam.modo !== 'chase') {
    if (typeof window !== 'undefined') window.__cabW = cabW;   // QUITAR con __cabdbg
    const cab = momRender.drawCockpit(cabW);
    drawSal(cab.top, cab.vidrio);
    // …Y EL AGUA CORRIENDO, encima de la sal. Las dos estan del lado de adentro del vidrio y la
    // diferencia entre una y otra es toda la idea: la sal esta seca y quieta —una marca vieja del
    // avion— y el agua CORRE, porque es el mar de ahora. Sale de `plane.y`: a ras es un manto y
    // arriba del techo no queda ninguna, asi que la trepada la seca sola.
    //
    // ES EL AGUA QUE SE VE. El rocio de la cama de vuelo (`estelaVuelo`) SALE del agua a la altura
    // del morro, o sea abajo del cuadro: en el pasillo se ve porque no hay cabina, pero en primera
    // persona lo tapa entero el tablero. Volar rasante DESDE ADENTRO es esto — el mar en el vidrio.
    drawAguaVidrio(cab.top, cab.vidrio, plane.y, t);
  }

  // EL LATIDO, VISTO. El mismo golpe que se escucha oscurece los bordes un instante: es lo que
  // hace que la viñeta deje de ser un filtro y pase a ser el tunel de vision de alguien que tiene
  // el corazon en la garganta. Solo aparece cuando el corazon ya esta acelerado — si latiera
  // siempre igual, no diria nada.
  if (!cine && Q.hbT > 0.25) {
    const golpe = Math.max(0, 1 - Q.hb / 0.2);
    if (golpe > 0) {
      const hg = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.8);
      hg.addColorStop(0, 'rgba(0,0,0,0)');
      hg.addColorStop(1, `rgba(12,4,4,${(golpe * 0.22 * Q.hbT).toFixed(3)})`);
      ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
    }
  }

  if (cine) {
    drawCinePremio(Q, cine);
    return;   // en el premio no hay autopista ni intentos que mostrar: no queda nada que decidir
  }

  if (Q.fase === 'prueba' && Q.zi < 0) {
    // ELEGIR BLANCO (plan §3): las zonas del buque, cada una con SU secuencia. No hay cursor de
    // menu — elegir ES empezar a teclear, asi que las tres estan vivas a la vez y el primer toque
    // decide. La brava pide una secuencia mas larga y paga el doble.
    ctx.textAlign = 'left';
    ctx.font = '7px monospace'; ctx.fillStyle = P.dim;
    ctx.fillText(T('pulso_elegi'), 26, 12);
    for (let i = 0; i < Q.carriles.length; i++) {
      const c = Q.carriles[i], ly = 24 + i * 13;
      ctx.textAlign = 'left';
      ctx.font = 'bold 7px monospace'; ctx.fillStyle = P.ink;
      ctx.fillText(T(c.zona.str), 26, ly + 3);
      ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
      ctx.fillText(c.zona.pts + '', 84, ly + 3);
      // la secuencia de la zona, sin cursor: todavia no se esta tecleando ninguna. La PRIMERA
      // tecla va en acento — es la que elige este carril, y es lo unico que hay que decidir.
      ctx.textAlign = 'center';
      let gx = 118, first = true;
      for (const b of c.bars) {
        for (const k of b.toks) {
          ctx.font = first ? 'bold 10px monospace' : '9px monospace';
          ctx.fillStyle = first ? P.accent : P.ink;
          ctx.fillText(glifo(k), gx, ly + 3);
          gx += 12; first = false;
        }
        gx += 6;
      }
    }
    // el margen tambien corre mientras se elige: dudar cuesta
    const fr = Math.max(0, 1 - Q.beatT / Q.beatMax);
    px(26, SKY_BOT, 120, 2, '#22303a');
    px(26, SKY_BOT, 120 * fr, 2, fr < 0.3 ? P.warn : P.accent);
  } else if (Q.fase === 'prueba') {
    // LA AUTOPISTA (regla 3): la secuencia ENTERA visible, el cursor avanzando sobre ella.
    ctx.textAlign = 'left';
    ctx.font = '7px monospace'; ctx.fillStyle = P.dim;
    ctx.fillText(T(Q.carriles[Q.zi].zona.str), 26, 12);
    const n = Q.bars.length;
    const cw = Math.min(150, (W - 60) / n);
    const x0 = W / 2 - (n - 1) * cw / 2;
    for (let i = 0; i < n; i++)
      drawCompas(x0 + i * cw, LANE_Y, Q.bars[i], i < Q.bi ? 0 : i === Q.bi ? 1 : 2, Q.ti, t);

    // EL MARGEN del compas: barra fina que se consume. No lleva numeros — es presion, no un dato.
    const b = Q.bars[Q.bi];
    if (b) {
      const fr = Math.max(0, 1 - Q.beatT / Q.beatMax);
      const bw = 120;
      // pegada a la autopista y no al borde del cielo: con un solo carril hay lugar, y asi no se
      // le monta al nombre del buque
      px(W / 2 - bw / 2, LANE_Y + 14, bw, 2, '#22303a');
      px(W / 2 - bw / 2, LANE_Y + 14, bw * fr, 2, fr < 0.3 ? P.warn : P.accent);
    }
  } else {
    // FALLO: se dice QUE paso y que se vuelve — el fallo es drama, no una pantalla de derrota
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px monospace'; ctx.fillStyle = P.warn;
    ctx.fillText(T(Q.motivo || 'pulso_pasaste'), W / 2, H / 2 - 18);
    if (Q.tries < 3 && Math.sin(t * 5) > -0.4) {
      ctx.font = '8px monospace'; ctx.fillStyle = P.ink;
      ctx.fillText(T('pulso_otra'), W / 2, H / 2 - 4);
    }
  }

  // INTENTOS: pips en la esquina — cuantas vueltas te quedan (plan §3: el fallo CUESTA)
  for (let i = 0; i < 3; i++)
    px(10 + i * 7, H - 12, 5, 5, i < 3 - Q.tries ? P.accent : '#2e3c45');
  ctx.textAlign = 'left';
  ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
  ctx.fillText(T('pulso_pasadas'), 10, H - 15);
  // EL PERDON de los primeros niveles: un punto que se gasta con el primer error. Se dibuja solo
  // cuando existe — que no aparezca es la señal de que ya no hay margen para la mano.
  for (let i = 0; i < Q.perdon; i++)
    px(W - 14 - i * 7, H - 12, 5, 5, i < Q.perdon - Q.errs ? P.foam : '#2e3c45');
  ctx.textAlign = 'center';
}
