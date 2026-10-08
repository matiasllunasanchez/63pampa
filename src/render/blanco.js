// LA SUELTA SOBRE EL BUQUE — el dibujo (docs en data/blanco.js).
//
// Dos piezas: el BUQUE, que es mundo (va en el pase del mundo, con la proyeccion de todo lo demas
// y la MISMA hoja horneada que el buque de la aproximacion), y el HUD de la suelta, que es cabina
// (va nivelado, sobre el avion). Ninguna de las dos decide nada: el HUD recibe su foto ya
// calculada por systems/blanco.js (convencion 4 — el render no importa sistemas).
import { ctx, px, W, PZ } from './ctx.js';
import { proj } from '../core/fx.js';
import { run } from '../core/run.js';
import { cfg } from '../core/state.js';
import { blanco, altoEn, zVista } from '../core/blanco.js';
import { BL } from '../data/blanco.js';
import { P } from '../data/palette.js';
import { drawCascoDelBuque } from './world.js';
import { estructura } from '../data/estructuras.js';
import { PERFIL } from '../data/blanco.js';
import { mez } from './paredes.js';
import { flechaIn } from './rotulo.js';
import * as enemyArt from './enemies.js';
import { drawMira } from './miras.js';
import * as fuego from './fuego.js';
import { nocheDe, luzNoche } from './noche.js';
// EL VERDE DE LA SUELTA, el mismo que titila en el tablero (SUELTA_COL de render/hud.js).
const VERDE_SUELTA = '#7fe07a';

/** El buque, en el mundo. Va ANTES de los obstaculos del pasillo: casi siempre es lo mas lejano. */
export function drawBlanco() {
  if (!blanco.on) return;
  if (blanco.z > BL.VISIBLE_Z || blanco.z < PZ * 0.5) return;
  const z = zVista(blanco.z);   // se DIBUJA a la profundidad comprimida (ver zVista)
  const s = proj(BL.X, blanco.base, z), k = s.k;
  const len = BL.LEN * k;
  const uh = Math.max(0.5, BL.LEN * 0.03 * k), hullH = uh * 1.5;
  // NO SE HUNDE EN CUADRO (pedido del autor, 23/9: "no tiene que verse hundirse, tiene que empezar a
  // prenderse fuego nomas"). El negro llega antes; lo que se ve es el buque herido, a flote.
  // EL APARECER (pedido del autor, 26/9): "el barco no se ve en el horizonte; se empieza a ver con
  // fade in, y quiza niebla que va desapareciendo mientras aparece a lo lejos". Antes estaba o no
  // estaba: cruzaba VISIBLE_Z y aparecia entero de un cuadro al otro. Ahora `ap` va de 0 a 1 entre
  // VISIBLE_Z y APARECE_Z, y hace DOS cosas a la vez, que es lo que lo vuelve niebla y no un
  // fundido de pantalla: el alfa sube, y la bruma que lo cubre se levanta.
  const ap = Math.max(0, Math.min(1, (BL.VISIBLE_Z - blanco.z) / (BL.VISIBLE_Z - BL.APARECE_Z)));
  if (ap <= 0) return;
  const apE = ap * ap * (3 - 2 * ap);   // entra suave y termina suave: sin escalon en ninguna punta
  // LA BRUMA de lejos, con el mismo mecanismo que la aproximacion: oscurece conservando la forma.
  // Mientras aparece es MUCHO mas espesa — la niebla del pedido— y cae hasta la de siempre.
  const haze = Math.max(Math.max(0, Math.min(0.35, (blanco.z - 600) / BL.VISIBLE_Z)), 0.8 * (1 - apE));
  ctx.save();
  ctx.globalAlpha = apE;
  ctx.beginPath(); ctx.rect(-80, -200, W + 160, s.y + 1 + 200); ctx.clip();
  // UNA ESTRUCTURA (data/estructuras.js) se pinta desde su PERFIL: lo que se ve es lo que la bomba
  // encuentra, columna por columna. Un buque, con su hoja horneada de siempre.
  const est = blanco.tipo === 'estructura' ? estructura(blanco.nombre) : null;
  // (HORNEADA si la estructura trae `hoja` y la hoja esta cargada — como los buques; si no, desde el
  // perfil. El dia que se hornee, el perfil se re-mide de la hoja: ver data/estructuras.js)
  if (est && est.hoja && enemyArt.ready(est.hoja)) {
    enemyArt.drawFrame(ctx, est.hoja, 0, 0, s.x, { bottomY: s.y }, len, false, false);
    if (haze > 0.01) { ctx.globalAlpha = apE * haze; enemyArt.drawFrame(ctx, est.hoja, 0, 0, s.x, { bottomY: s.y }, len, false, true); ctx.globalAlpha = apE; }
  } else if (est) drawEstructura(est, s.x, len, s.y, k, haze);
  else drawCascoDelBuque(blanco.nombre, s.x, len, s.y - hullH, uh, hullH, haze, { hoja: true });
  // LA PERSPECTIVA AEREA: de lejos un buque se ve MAS CLARO, tirado al color del cielo — no mas
  // oscuro. La hoja es gris acero y el mar del pasillo es casi negro, asi que a 1 km el casco era
  // una mancha oscura sobre oscuro y solo se leia la espuma de proa. La misma silueta en blanco,
  // encima y con un alfa que se apaga al acercarse, es lo que lo separa del agua.
  const claro = Math.max(0, Math.min(0.55, (blanco.z - 350) / 1600));
  const hoja = 'buque_' + blanco.clase;
  if (!est && claro > 0.01 && enemyArt.ready(hoja)) {
    ctx.globalAlpha = claro * apE;
    enemyArt.drawFrame(ctx, hoja, 0, 0, s.x, { bottomY: s.y }, len, false, true);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  // DE NOCHE, CON LUCES (autor, 4/10: "crear luces en la barcaza final o base objetivo en noche")
  if (nocheDe(cfg.sky)) lucesNoche(z, k, apE, !!est);

  // EL FUEGO donde pegaron, y QUE SE PROPAGA: cada impacto arranca con un foco y con los segundos
  // (de mundo: en la camara lenta, despacio) se le suman llamas a los costados sobre la cubierta.
  // Nucleo que titila y humo negro que sube. Dibujado, no particulas: el render no escribe en los
  // stores del mundo.
  const u = Math.max(1.5, Math.min(6, k * 2));   // tope: encima del buque el humo era una mancha que tapaba el cuadro
  for (let i = 0; i < blanco.marcas.length; i++) {
    const m = blanco.marcas[i], tt = Math.max(0, run.t - m.t);
    const focos = 1 + Math.min(FUEGO_MAX, Math.floor(tt / FUEGO_CADA));
    for (let j = 0; j < focos; j++) {
      // alternan a un lado y al otro del impacto, cada uno un poco mas lejos; montados en la cubierta
      const lado = j === 0 ? 0 : (j % 2 ? 1 : -1) * Math.ceil(j / 2);
      const fxw = m.x + lado * BL.LEN * 0.045;
      const h = altoEn(fxw);
      if (h < 0) continue;
      const fy = j === 0 ? m.y : blanco.base + Math.min(h, BL.LEN * 0.09);
      llama(proj(fxw, fy, z), u * (j === 0 ? 1 : 0.8), i * 7 + j);
    }
  }
  // LOS MARINEROS: puntitos que corren por la cubierta, lejos del fuego, desde el primer impacto.
  // Solo cuando el buque ya esta cerca — de lejos serian ruido.
  if (blanco.marcas.length && k > 0.5) {
    const t0 = blanco.marcas[0].t, huye = blanco.marcas[0].x < BL.X ? 1 : -1;
    for (let i = 0; i < MARINEROS; i++) {
      const base = ((i * 0.618) % 1) - 0.5;                       // repartidos por la eslora
      const corre = (run.t - t0) * (0.05 + (i % 3) * 0.02) * huye;
      const xw = BL.X + Math.max(-0.47, Math.min(0.47, base + corre)) * BL.LEN;
      const h = altoEn(xw);
      if (h < 0) continue;
      const pie = proj(xw, blanco.base + Math.min(h, BL.LEN * 0.07), z);
      const alto = Math.max(2, k * 1.8), ancho = Math.max(1, k * 0.6);
      const paso = Math.sin(run.t * 18 + i) > 0 ? 1 : 0;           // el trote: sube y baja un pixel
      px(pie.x - ancho / 2, pie.y - alto - paso, ancho, alto, '#1c2226');
      px(pie.x - ancho / 2, pie.y - alto - paso, ancho, Math.max(1, ancho), '#c9a27a');   // la cara
    }
  }
}

// LAS LUCES DEL BLANCO DE NOCHE (autor, 4/10). Lo que hace que un buque o una base se lean en lo negro
// antes de la silueta, como de verdad: una fila calida de ojos de buey / ventanas (algunas apagadas,
// fijas por indice para que no titilen al azar), la luz de TOPE en lo mas alto del perfil y, en el
// buque, las de NAVEGACION en las puntas — roja y verde. En la base el tope es la BALIZA roja de la
// antena, que titila. Cada una derrama su luz (`luzNoche`): abre la oscuridad a su alrededor.
// Van montadas en el PERFIL (`altoEn`), el mismo que usa la bomba: estan donde esta la chapa.
function lucesNoche(z, k, ap, esBase) {
  let alto = 0, xAlto = BL.X;
  for (let i = 0; i < 24; i++) {
    const xw = BL.X + (i / 23 - 0.5) * BL.LEN * 0.96, h = altoEn(xw);
    if (h > alto) { alto = h; xAlto = xw; }
  }
  const r = Math.max(1, k * 0.45), N = 9;
  ctx.save();
  ctx.globalAlpha = ap;
  for (let i = 0; i < N; i++) {
    if ((i * 7) % 5 === 0) continue;                               // las apagadas
    const xw = BL.X + ((i + 0.5) / N - 0.5) * BL.LEN * 0.86, h = altoEn(xw);
    if (h < 0) continue;
    const p = proj(xw, blanco.base + Math.min(h, BL.LEN * 0.05) * 0.45, z);
    px(p.x - r / 2, p.y - r / 2, r, r, '#ffd890');
    luzNoche(ctx, p.x, p.y, 3 + k * 1.2, [255, 200, 120], 0.35 * ap);
  }
  if (!esBase || Math.sin(run.t * 4) > 0) {                         // la baliza de la base titila
    const pt = proj(xAlto, blanco.base + alto + BL.LEN * 0.01, z);
    px(pt.x - r / 2, pt.y - r, r, r, esBase ? '#ff5040' : '#f4f8ff');
    luzNoche(ctx, pt.x, pt.y, 5 + k * 1.6, esBase ? [255, 70, 50] : [230, 240, 255], 0.6 * ap);
  }
  if (!esBase) for (const [f, c, rgb] of [[-0.46, '#ff4a3a', [255, 70, 50]], [0.46, '#4aff7a', [70, 255, 120]]]) {
    const xw = BL.X + f * BL.LEN, h = altoEn(xw);
    if (h < 0) continue;
    const p = proj(xw, blanco.base + Math.min(h, BL.LEN * 0.06), z);
    px(p.x - r / 2, p.y - r / 2, r, r, c);
    luzNoche(ctx, p.x, p.y, 4 + k * 1.3, rgb, 0.5 * ap);
  }
  ctx.restore();
}

// LA PINTA DE LAS ESTRUCTURAS: hormigon y chapa militar. No sale del tema a proposito — una base no
// cambia de color con el clima como el pasto; lo que la acerca al cielo es la bruma (`haze`).
const EST = {
  cuerpo: '#6c6856', sombra: '#4a473b', techo: '#4f5a45', techoL: '#65705a',
  oscuro: '#26281f', luz: '#cfd6a2', tanque: '#8b8a7c', tanqueL: '#a9a898', bruma: '#8f999c',
};

/** UNA ESTRUCTURA en el mundo, parada sobre su piso (`baseY`, pantalla). Cada pieza ocupa sus columnas
 *  del perfil y mide lo que el perfil dice que mide ahi (el maximo de sus columnas): la altura que ve
 *  el jugador es la altura contra la que la bomba pega o pasa larga. */
function drawEstructura(est, cx, len, baseY, k, haze) {
  const p = PERFIL[est.clase];
  const n = p.length, col = len / n;
  const c = x => mez(x, EST.bruma, haze);
  for (const pz of est.piezas) {
    const x0 = cx - len / 2 + pz.de * col, w = (pz.a - pz.de + 1) * col;
    let hmax = 0;
    for (let i = pz.de; i <= pz.a; i++) hmax = Math.max(hmax, p[i]);
    const h = hmax * BL.LEN * k;
    const top = baseY - h;
    const u = Math.max(1, k * 0.5);
    switch (pz.tipo) {
      case 'cerco':   // postes y alambre, bajitos
        px(x0, baseY - h * 0.15, w, Math.max(1, u * 0.5), c(EST.oscuro));
        for (let x = x0; x < x0 + w; x += Math.max(2, col * 0.5)) px(x, top, Math.max(1, u * 0.4), h, c(EST.oscuro));
        break;
      case 'tanque': {  // cilindros de combustible
        const n2 = Math.max(1, pz.a - pz.de + 1), tw = w / n2;
        for (let j = 0; j < n2; j++) {
          const tx = x0 + j * tw + tw * 0.08;
          px(tx, top, tw * 0.84, h, c(EST.tanque));
          px(tx, top, tw * 0.84, Math.max(1, h * 0.14), c(EST.tanqueL));
          px(tx + tw * 0.6, top, tw * 0.24, h, c(EST.sombra));
        }
        break;
      }
      case 'barraca':   // cuerpo bajo y techo a dos aguas
      case 'deposito': {
        const cuerpo = pz.tipo === 'barraca' ? h * 0.62 : h * 0.8;
        px(x0 + col * 0.05, baseY - cuerpo, w - col * 0.1, cuerpo, c(EST.cuerpo));
        ctx.fillStyle = c(EST.techo);
        ctx.beginPath(); ctx.moveTo(x0, baseY - cuerpo); ctx.lineTo(x0 + w / 2, top); ctx.lineTo(x0 + w, baseY - cuerpo); ctx.closePath(); ctx.fill();
        if (pz.tipo === 'deposito') px(x0 + w * 0.35, baseY - cuerpo * 0.7, w * 0.3, cuerpo * 0.7, c(EST.oscuro));
        else for (let x = x0 + col * 0.3; x < x0 + w - col * 0.3; x += col * 0.7) px(x, baseY - cuerpo * 0.65, Math.max(1, col * 0.22), Math.max(1, cuerpo * 0.2), c(EST.luz));
        break;
      }
      case 'hangar': {  // la boveda: paredes bajas y el techo curvo
        const pared = h * 0.45;
        px(x0, baseY - pared, w, pared, c(EST.cuerpo));
        ctx.fillStyle = c(EST.techo);
        ctx.beginPath(); ctx.moveTo(x0, baseY - pared);
        ctx.quadraticCurveTo(x0 + w / 2, top - (h - pared) * 0.9, x0 + w, baseY - pared); ctx.closePath(); ctx.fill();
        px(x0 + w * 0.12, baseY - pared * 0.85, w * 0.76, pared * 0.85, c(EST.oscuro));   // el porton abierto
        break;
      }
      case 'torre': {   // la torre de control: fuste y la cabina vidriada arriba
        const fw = w * 0.45, fx = x0 + (w - fw) / 2, cab = Math.max(2, h * 0.2);
        px(fx, top + cab, fw, h - cab, c(EST.cuerpo));
        px(fx + fw * 0.7, top + cab, fw * 0.3, h - cab, c(EST.sombra));
        px(x0 + w * 0.08, top, w * 0.84, cab, c(EST.techoL));
        px(x0 + w * 0.14, top + cab * 0.3, w * 0.72, Math.max(1, cab * 0.45), c(EST.luz));
        break;
      }
      case 'antena': {  // el mastil del radar con sus travesaños
        const mx = x0 + w / 2;
        px(mx - u * 0.3, top, Math.max(1, u * 0.6), h, c(EST.oscuro));
        for (let j = 1; j <= 3; j++) px(mx - w * 0.25 * (1 - j * 0.2), top + h * j * 0.18, w * 0.5 * (1 - j * 0.2), Math.max(1, u * 0.4), c(EST.oscuro));
        break;
      }
    }
  }
  // la sombra del conjunto sobre la explanada: lo apoya en el piso
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * 0.35;
  px(cx - len / 2, baseY - 1, len, Math.max(1, k * 0.6), '#11140f');
  ctx.globalAlpha = a0;
}

const FUEGO_CADA = 0.35;   // segundos de mundo entre un foco nuevo y el siguiente
const FUEGO_MAX = 6;       // focos extra por impacto
const MARINEROS = 9;

/** Una llama con su columna de humo, en el punto de pantalla `f`. */
function llama(f, u, semilla) {
  const fl = 0.6 + 0.4 * Math.sin(run.t * 23 + semilla * 5);
  for (let j = 0; j < 5; j++) {
    const sube = ((run.t * 0.9 + j / 5 + semilla * 0.13) % 1);
    ctx.globalAlpha = (1 - sube) * 0.55;
    const r = u * (1.2 + sube * 3);
    const hx = f.x + Math.sin(run.t * 2 + j + semilla) * u, hy = f.y - u * 2 - sube * u * 14;
    // la BOCANADA horneada (render/fuego.js); el cuadrado de siempre si la hoja no esta
    if (!fuego.humo(hx, hy, r * 1.5, semilla * 3 + j)) px(hx - r / 2, hy, r, r, '#1b1a18');
  }
  ctx.globalAlpha = 1;
  // LA LLAMA horneada; los dos rectangulos de siempre si la hoja no esta
  if (fuego.llama(f.x, f.y, u * 3.6, run.t, semilla)) return;
  px(f.x - u * 1.4, f.y - u * 1.6 * fl, u * 2.8, u * 1.6 * fl, '#e8842a');
  px(f.x - u * 0.6, f.y - u * fl, u * 1.2, u * fl, '#ffd479');
}

/** EL BLANCO MARCADO: dos corchetes sobre la zona de maquinas — el "objetivo claro" del pedido.
 *
 *  VA EN LA CAPA DE CABINA, ENCIMA DEL AVION, y no en el mundo con el casco. Para embocarla hay que
 *  estar ALINEADO con el buque, y alineado quiere decir que el buque queda exactamente detras de tu
 *  propio avion en pantalla: medido en la primera prueba, a la distancia de suelta el sprite tapaba
 *  el casco entero. Es una mira de bombardeo, no un pedazo del buque: se pinta arriba de todo. */
// LOS CORCHETES Y LA FLECHA ENTRAN APENAS EL BUQUE ASOMA (pedido del autor, 26/9: "apenas aparece
// el barco en pantalla debe mostrar los indicadores de altura y de objetivo, para entender que
// tengo que ajustar la altura"). Primero los habia puesto al TERMINAR de aparecer, y era tarde:
// todo el aparecer —quince segundos a crucero— era tiempo perdido para acomodar la altura, que es
// justo lo que la flecha viene a pedir. Era 700 al principio, peor todavia.
// Entran CON el buque y no antes: siguen el mismo fundido pero tres veces mas rapido (ver
// `corchetes`), asi que ya estan enteros cuando el buque todavia es niebla — dicen "ahi" sin
// marcar un pedazo de cielo vacio.
const CORCHETES_Z = BL.VISIBLE_Z;

function corchetes(listo, alt, previa) {
  if (blanco.z > BL.VISIBLE_Z || blanco.z < PZ) return;
  const z = zVista(blanco.z);
  const s = proj(BL.X, blanco.base, z), k = s.k;
  // CON TAMAÑO MINIMO: a la distancia de suelta la zona real mide 14 x 4 px y los corchetes se
  // confundian con las marcas de la mira. Nunca mas chicos que 20 x 8: de lejos dicen "ahi", de
  // cerca abrazan la zona exacta.
  const cx = s.x, mw = Math.max(10, (proj(BL.X + BL.LEN * BL.CENTRO, blanco.base, z).x - cx));
  const xl = cx - mw, xr = cx + mw;
  const bot = s.y + 1, top = Math.min(bot - 8, proj(BL.X, blanco.base + altoEn(BL.X) * 0.55, z).y);
  // MAS GRUESOS (pedido del autor, 26/9). Eran k*0.35 con piso de 1 px, o sea una linea de un
  // pixel casi siempre: al lado de la mira verde no se leian como un marco sino como ruido.
  const t = Math.max(2, Math.round(k * 0.7)), a = Math.max(4, (xr - xl) * 0.25);
  // EN DISTANCIA DE SOLTAR, verde y titilando con el latido del tablero (render/hud.js):
  // corchetes y mira dicen "ahora" junto con la cinta, el altimetro y el estante.
  // …y ANTES, en la PREVIA (8/10): verde FIJO —llegando a la zona, corregi—; titila recien cuando es ya
  const verde = !!listo && Math.floor(performance.now() / 160) % 2 === 0;
  const COL = listo ? (verde ? '#7fe07a' : '#2e8f3a') : previa ? '#7fe07a' : P.warn;
  // EL MISMO APARECER DEL BUQUE (drawBlanco), tres veces mas rapido: enteros al primer tercio
  const apM = Math.min(1, 3 * Math.max(0, (BL.VISIBLE_Z - blanco.z) / (BL.VISIBLE_Z - BL.APARECE_Z)));
  if (apM <= 0) return;
  ctx.globalAlpha = apM * (listo || previa ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(run.t * 4)));
  // DE LEJOS, SOLO LA FLECHA: el buque es una mota en el horizonte, justo donde cae la mira, y los
  // corchetes encima lo tapaban entero (playtest 23/9: "aparece cuando ya estas demasiado cerca").
  // Los corchetes entran cuando ya hay casco que abrazar.
  const cerca = blanco.z < CORCHETES_Z;
  if (cerca) for (const [x, d] of [[xl, 1], [xr, -1]]) {
    px(x - (d < 0 ? t : 0), top, t, bot - top, COL);
    px(d > 0 ? x : x - a, top, a, t, COL);
    px(d > 0 ? x : x - a, bot - t, a, t, COL);
  }
  ctx.globalAlpha = 1;
  // …Y LA FLECHA, QUE CAMBIO DE OFICIO (pedido del autor, 26/9). Era un "IN ▼" clavado arriba del
  // buque que decia "ahi esta" — algo que el buque ya dice solo— y ahora dice lo UNICO que el
  // jugador no puede deducir mirando: que le falta para poder soltar.
  //   viene DE ARRIBA, apuntando abajo  ->  estas alto, BAJA
  //   viene DE ABAJO, apuntando arriba  ->  estas bajo, SUBI
  // Y se van las dos cuando la ventana se abre: ahi ya no hay nada que corregir, y lo que queda
  // es el corchete en verde y la mira. Que desaparezcan ES la señal.
  if (!cerca || listo || !alt) return;
  // late HACIA donde hay que ir: la flecha de bajar cabecea para abajo y la de subir para arriba.
  const late = Math.round(Math.abs(Math.sin(run.t * 5)));
  ctx.globalAlpha = apM;
  if (alt < 0) flechaIn(cx, top - 3 + late, 1, false, 1);     // arriba del buque, apuntando abajo
  else flechaIn(cx, bot + 3 - late, 1, false, -1);            // debajo del buque, apuntando arriba
  ctx.globalAlpha = 1;
}


/** EL HUD DE LA SUELTA. `h` es la foto de systems/blanco.js `hud()`, o null. Coordenadas de mundo
 *  (480x270), sin el giro del horizonte.
 *
 *  QUEDO SOLO LA MARCA DEL BLANCO (playtest 23/9: "el texto de arriba, con metros y pasada y que se
 *  yo, quitalo"). La distancia, las bombas y la luz de SOLTA se fueron: el momento de soltar lo
 *  dicen Puma por radio y el tablero titilando en verde (render/hud.js), y la altura el altimetro. */
export function drawBlancoHud(h) {
  if (!h || !h.enAtaque) return;
  corchetes(h.listo, h.alt, h.previa);
  // LA MIRA SOLO EN VERDE: en la ventana de distancia Y a buena altura. Antes adentro de los
  // corchetes iba tambien una cuenta atras en numeros; el autor los saco el 26/9 ("quitemos los
  // numeros dentro"), asi que lo que queda es binario y se lee de un golpe: o hay mira, o no hay.
  if (h.listo) mira();
}

/** LA MIRA SOBRE EL BUQUE: la MISMA que usa el avion — la que cada uno eligio en OPCIONES
 *  (`cfg.mira`)— un poco mas grande y en verde. Decirlo con la mira y no con una palabra es
 *  decirlo en el idioma que el jugador viene leyendo todo el vuelo: la mira encima de algo
 *  significa "esto es el blanco, ahora". */
function mira() {
  if (blanco.z > BL.VISIBLE_Z || blanco.z < PZ) return;
  const z = zVista(blanco.z);
  const s = proj(BL.X, blanco.base, z);
  // la MISMA caja que `corchetes` — misma proyeccion, mismo top, mismo bot— en vez de a ojo: el
  // dia que los corchetes se muevan, la mira se muda con ellos.
  const bot = s.y + 1, top = Math.min(bot - 8, proj(BL.X, blanco.base + altoEn(BL.X) * 0.55, z).y);
  // EL LATIDO DEL TABLERO, el mismo reloj que los corchetes, el altimetro y el estante: o el
  // rincon se lee como tres avisos distintos. Va en el ALFA y no en el color porque la mira es un
  // dibujo tenido de un solo tono: apagarla a medias late igual y no la despinta.
  const late = Math.floor(performance.now() / 160) % 2 === 0;
  // MIRA_SIZE del avion es 17: 22 es "un poco mas grande" sin taparle el casco que hay que ver.
  drawMira(cfg.mira, s.x, Math.round((top + bot) / 2), 22, late ? 1 : 0.55, VERDE_SUELTA);
}


/** LA CUENTA ATRAS, ENCIMA DEL BUQUE (pedido del autor, 26/9/2026). `c` son los segundos que faltan
 *  para que la ventana se abra, y 0 es que YA esta abierta. Ver BL.VENTANA en data/blanco.js para
 *  que es y, sobre todo, para que NO es: la ventana no se agranda, lo que se estira es el aviso.
 *
 *  VA DONDE MIRAS Y NO EN UN RINCON. El momento de soltar se decide mirando el buque —no el
 *  tablero—, asi que el numero se dibuja pegado a la flecha que ya apunta ahi. Es la misma razon
 *  por la que los corchetes abrazan el casco en vez de vivir en la cabina.
 *
 *  3, 2, 1 — y despues YA. Se redondea HACIA ARRIBA para que el ultimo numero visible sea el 1 y
 *  no un 0 que se lee como "ya fue": mientras veas un numero, todavia es temprano. */
function cuentaAtras(c) {
  if (blanco.z > BL.VISIBLE_Z || blanco.z < PZ) return;
  const z = zVista(blanco.z);
  const s = proj(BL.X, blanco.base, z);
  // ADENTRO DE LOS CORCHETES (pedido del autor, 26/9), y por eso la caja se calcula IGUAL que en
  // `corchetes` — misma proyeccion, mismo `top`, mismo `bot`— en vez de a ojo: el dia que los
  // corchetes se muevan, el numero se muda con ellos.
  const bot = s.y + 1, top = Math.min(bot - 8, proj(BL.X, blanco.base + altoEn(BL.X) * 0.55, z).y);
  const y = Math.round((top + bot) / 2);
  // EL LATIDO DEL TABLERO, el mismo reloj: la cuenta, los corchetes, el altimetro y el estante
  // titilan JUNTOS o el rincon se lee como cuatro avisos distintos (ver `corchetes`).
  const late = Math.floor(performance.now() / 160) % 2 === 0;
  // LA MIRA, TODO EL CONTEO (pedido del autor, 26/9): "el conteo permite disparar, asi que durante
  // el conteo la mira debe estar; cuando termina el conteo ya paso". Es la MISMA que usa el avion
  // —la que cada uno eligio en OPCIONES, `cfg.mira`— un poco mas grande y en verde. Decirlo con la
  // mira y no con una palabra es decirlo en el idioma que el jugador viene leyendo todo el vuelo:
  // la mira encima de algo significa "esto es el blanco, ahora".
  // MIRA_SIZE del avion es 17: 22 es "un poco mas grande" sin taparle el casco que hay que ver. El
  // latido va en el ALFA y no en el color porque la mira es un dibujo tenido de un solo tono:
  // apagarla a medias late igual y no la despinta.
  drawMira(cfg.mira, s.x, y, 22, late ? 1 : 0.55, VERDE_SUELTA);
  // …Y EL NUMERO ADENTRO. El cuerpo sale de la caja, asi que crece con el buque igual que los
  // corchetes que lo contienen: piso de 7 para que de lejos se siga leyendo —ahi la caja mide 8 px
  // de alto— y techo de 13 para no tapar el casco.
  const cuerpo = Math.max(7, Math.min(13, Math.round((bot - top) * 0.9)));
  ctx.font = 'bold ' + cuerpo + 'px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const txt = String(Math.max(1, Math.ceil(c)));
  // sombra dura de un pixel: el numero cae sobre el casco, que es gris acero, y sin esto se pierde
  // justo cuando mas se lo mira
  ctx.fillStyle = '#0a0e11';
  ctx.fillText(txt, s.x + 1, y + 1);
  ctx.fillStyle = late ? '#b6ffb0' : VERDE_SUELTA;
  ctx.fillText(txt, s.x, y);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

