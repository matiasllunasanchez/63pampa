// HOJAS DE SPRITES DE LOS ENEMIGOS — helicoptero, caza, radar movil, camion AA, barcaza y globo.
//
// Las hornea tools/bake_enemies.html desde modelos low-poly (npx electron tools/bake_enemies_run.js),
// igual que las hojas de los aviones jugables. El dibujo a mano de render/world.js QUEDA como
// respaldo: si una hoja no cargo (o el build web la vacio), el juego sigue mostrando lo de antes.
//
// `box` es el rectangulo de CONTENIDO dentro del frame (el frame tiene aire alrededor para que
// el helo pueda girar el rotor sin cortarse). Se usa para anclar: los vehiculos apoyan el BORDE
// INFERIOR del contenido en el suelo, no el del frame. NO SE MIDE A MANO: lo mide el horneador
// sobre el alfa y lo escribe en src/data/cajas.js, que es lo que se importa aca. Re-hornear y
// listo — no hay nada que volver a contar.
//
// `wu` = cuantas unidades de MUNDO abarca el ancho del CONTENIDO. Es la perilla de tamaño por
// enemigo: subirla agranda al bicho en pantalla sin tocar la colision (los hitboxes viven en
// core/hitbox.js y no leen nada de aca). Esa SI es a mano, porque no es una medida.
import { CAJAS } from '../data/cajas.js';

// Rutas como LITERALES SUELTOS: tools/build_web.py re-embebe buscando el literal exacto
// '../assets/...' — un `BASE + nombre` armado en runtime no lo encontraria y el build fallaria.
const FILES = {
  helo: '../assets/world/enemies/helo.png',
  jet: '../assets/world/enemies/jet.png',
  harrier: '../assets/world/enemies/harrier.png',
  harrier_rear: '../assets/world/enemies/harrier_rear.png',
  harrier_turn: '../assets/world/enemies/harrier_turn.png',
  radar: '../assets/world/enemies/radar.png',
  aatruck: '../assets/world/enemies/aatruck.png',
  lcu: '../assets/world/enemies/lcu.png',
  balloon: '../assets/world/enemies/balloon.png',
  aa: '../assets/world/enemies/aa.png',
  tent: '../assets/world/enemies/tent.png',
  depot: '../assets/world/enemies/depot.png',
  bldg: '../assets/world/enemies/bldg.png',
  fragata: '../assets/world/enemies/fragata.png',
  chancha: '../assets/world/enemies/chancha.png',
  // LOS RESTOS (B1): el estado roto de cada cosa. Mismas rutas literales, mismo motivo.
  resto_aa: '../assets/world/enemies/resto_aa.png',
  resto_aatruck: '../assets/world/enemies/resto_aatruck.png',
  resto_radar: '../assets/world/enemies/resto_radar.png',
  resto_depot: '../assets/world/enemies/resto_depot.png',
  resto_bldg: '../assets/world/enemies/resto_bldg.png',
  resto_tent: '../assets/world/enemies/resto_tent.png',
  resto_helo: '../assets/world/enemies/resto_helo.png',
  resto_jet: '../assets/world/enemies/resto_jet.png',
  resto_lcu: '../assets/world/enemies/resto_lcu.png',
  resto_balloon: '../assets/world/enemies/resto_balloon.png',
  // LOS BUQUES (B2): tres clases x tres vistas (costado / proa / hundiendose).
  buque_t42: '../assets/world/enemies/buque_t42.png',
  buque_t21: '../assets/world/enemies/buque_t21.png',
  buque_log: '../assets/world/enemies/buque_log.png',
  proa_t42: '../assets/world/enemies/proa_t42.png',
  proa_t21: '../assets/world/enemies/proa_t21.png',
  proa_log: '../assets/world/enemies/proa_log.png',
  hundido_t42: '../assets/world/enemies/hundido_t42.png',
  hundido_t21: '../assets/world/enemies/hundido_t21.png',
  hundido_log: '../assets/world/enemies/hundido_log.png',
};

// EL `wu` DE LOS JETS ESTABA MAL, y era la mitad del problema. Medido: el contenido del sprite
// del A-4 del jugador ocupa 52 de los 84 px del frame y se dibuja a 0.85, o sea 44 px de pantalla
// a z=14 -> 4.6 UNIDADES DE MUNDO de envergadura. El Harrier declaraba 10.5: mas del DOBLE que el
// avion del jugador, cuando un Sea Harrier tiene MENOS envergadura que un A-4 (7,7 m contra 8,4).
// Con 4.2 (los mismos 4.6 por la relacion real de envergaduras) el Harrier queda a escala: sigue
// viendose mas grande que vos porque esta MAS CERCA de la camara (z=6 contra tu z=14), que es lo
// correcto, pero deja de ser un avion de juguete gigante. Pasa de ocupar el 49% del ancho de
// pantalla al 20%.
//
// EL JET Y LAS TRES HOJAS DEL HARRIER van al DOBLE de resolucion que el resto (128x96 contra
// 64x48), y `wu` NO cambia:
// el mundo no se entera, solo deja de verse el pixel gordo. El motivo esta medido — el Harrier es
// el unico enemigo que se te pone a z=6, mas cerca de la camara que tu propio avion (z=14), y ahi
// su sprite se ampliaba 5.4x mientras el tuyo se dibuja a 0.85x.
// LAS CAJAS LAS MIDE EL HORNO Y SE IMPORTAN (PLAN_HORNEADO B0). `fw/fh/cols/rows/box` salen de
// src/data/cajas.js, que escribe `npx electron tools/bake_enemies_run.js` escaneando el alfa de
// la hoja recien horneada. Antes se contaban a ojo y se pegaban aca a mano: un numero mal copiado
// dejaba al bicho flotando o enterrado, sin ninguna prueba que lo agarrara.
//
// LO QUE QUEDA A MANO ES LO QUE NO SE PUEDE MEDIR. `wu` (cuantas unidades de MUNDO abarca el
// ancho del contenido) y `href` (la altura de referencia de los que se escalan por alto) son
// PERILLAS DE ARTE: dicen que tan grande se ve el bicho, no que tan grande es el dibujo. El horno
// mide hechos; el tamaño en pantalla lo decide un humano.
//
// EL `wu` DE LOS JETS ESTABA MAL, y era la mitad del problema. Medido: el contenido del sprite
// del A-4 del jugador ocupa 52 de los 84 px del frame y se dibuja a 0.85, o sea 44 px de pantalla
// a z=14 -> 4.6 UNIDADES DE MUNDO de envergadura. El Harrier declaraba 10.5: mas del DOBLE que el
// avion del jugador, cuando un Sea Harrier tiene MENOS envergadura que un A-4 (7,7 m contra 8,4).
// Con 4.2 (los mismos 4.6 por la relacion real de envergaduras) el Harrier queda a escala.
//
// EL JET Y LAS TRES HOJAS DEL HARRIER van al DOBLE de resolucion que el resto (128x96 contra
// 64x48), y `wu` NO cambia:
// el mundo no se entera, solo deja de verse el pixel gordo. El motivo esta medido — el Harrier es
// el unico enemigo que se te pone a z=6, mas cerca de la camara que tu propio avion (z=14), y ahi
// su sprite se ampliaba 5.4x mientras el tuyo se dibuja a 0.85x.
const ARTE = {
  helo: { wu: 11.5 },
  jet: { wu: 4.2 },
  // EL SEA HARRIER (B3) hereda el `wu` del jet al que reemplaza, y a proposito: cambiarlo seria
  // cambiar cuanto ocupa el perseguidor en pantalla, o sea el juego. Esto es arte.
  harrier: { wu: 4.2 },
  harrier_rear: { wu: 4.2 },
  harrier_turn: { wu: 4.2 },
  radar: { wu: 6.2 },
  aatruck: { wu: 6.6 },
  // lcu y balloon llevan 3 POSES DE ROLIDO (izq/centro/der): el render las cicla con un seno
  // lento por objeto — el tambaleo en el lugar que hace que no parezcan imagenes fijas
  lcu: { wu: 8.6 },
  balloon: { wu: 5.6 },
  aa: { wu: 5.2 },
  tent: { wu: 5.4 },
  // depot y bldg se escalan por ALTURA al dibujar (o.h varia por spawn): wu es el ancho a la
  // altura de referencia y drawFrame recibe el k ya multiplicado por (o.h / href)
  depot: { wu: 8.2, href: 5.5 },
  bldg: { wu: 6.8, href: 9.5 },
  fragata: { wu: 11 },
  // LA CHANCHA: el unico avion AMIGO horneado, y el objeto mas grande del juego. `wu` 26 es
  // el mismo ancho que ya usaba su dibujo procedural, asi que la cita no se re-ajusta.
  chancha: { wu: 26 },

  // ---------------- LOS RESTOS (PLAN_HORNEADO B1) ----------------
  // Cada resto lleva el `wu` DE SU VIVO, no uno propio, y no es pereza: el resto tiene que caer
  // exactamente donde estaba la cosa y medir lo mismo. Si el camion volcado fuera mas chico que el
  // camion, el momento de la muerte se leeria como un salto de escala en vez de como una muerte.
  // Los unicos que se apartan son los que de verdad cambian de tamaño al romperse: el globo, que
  // desinflado ocupa mas piso del que ocupaba en el aire, y la carpa, que caida se desparrama.
  resto_aa: { wu: 5.2 },
  resto_aatruck: { wu: 6.6 },
  resto_radar: { wu: 6.2 },
  resto_depot: { wu: 8.2, href: 5.5 },
  resto_bldg: { wu: 6.8, href: 9.5 },
  resto_tent: { wu: 6.2 },
  resto_helo: { wu: 9.0 },
  resto_jet: { wu: 5.4 },
  resto_lcu: { wu: 8.6 },
  resto_balloon: { wu: 6.4 },

  // ---------------- LOS BUQUES (PLAN_HORNEADO B2) ----------------
  // `wu: 1` NO es un tamaño olvidado: es lo que convierte la escala de `drawFrame` en PIXELES.
  // Todo el resto del roster vive en unidades de mundo y se proyecta con el `k` de la camara del
  // pasillo; el buque de la aproximacion no — su tamaño sale de una cuenta larga y muy afinada
  // (la compresion contra el tope del encuadre, el `grow` del PULSO, la ventana de la cabina) que
  // vive en `drawApproachBarge` y termina en una ESLORA EN PIXELES. Con wu = 1, pasarle esa eslora
  // como escala hace que el contenido mida exactamente eso. Es la unica familia de hojas que se
  // dibuja asi, y es a proposito: la alternativa era duplicar la cuenta.
  buque_t42: { wu: 1 }, buque_t21: { wu: 1 }, buque_log: { wu: 1 },
  proa_t42: { wu: 1 }, proa_t21: { wu: 1 }, proa_log: { wu: 1 },
  hundido_t42: { wu: 1 }, hundido_t21: { wu: 1 }, hundido_log: { wu: 1 },
};

// La union de las dos mitades: lo medido y lo decidido. Si el horno agrega una hoja sin entrada
// en ARTE, el juego lo dice en voz alta al arrancar en vez de dibujarla del tamaño de un pixel.
export const SHEETS = {};
for (const k in CAJAS) {
  const c = CAJAS[k], a = ARTE[k];
  if (!a) { console.warn(`enemies: la hoja '${k}' no tiene wu en ARTE — no se dibuja`); continue; }
  SHEETS[k] = { fw: c.fw, fh: c.fh, cols: c.cols, rows: c.rows, box: c.box, ...a };
}

for (const k in SHEETS) {
  const s = SHEETS[k];
  s.img = new Image();
  if (FILES[k]) s.img.src = FILES[k];   // build web sin hoja: src vacio, ready() da false y listo
}

/** ¿La hoja de `k` esta lista para dibujar? Si no, world.js cae a su dibujo a mano. */
export const ready = k => { const s = SHEETS[k]; return s.img.complete && s.img.naturalWidth > 0; };

// FLASH DE IMPACTO: para pintar el sprite de blanco un instante se lo pasa por un canvas
// auxiliar (dibujar frame → 'source-in' blanco → estampar encima). Antes el flash era un
// RECTANGULO blanco sobre el enemigo, y con las hojas horneadas se leia como si parpadeara el
// hitbox de depuracion — el destello tiene que tener LA FORMA del bicho, no la de su caja.
const tint = document.createElement('canvas');
const tintCtx = tint.getContext('2d');

/** Dibuja el frame (col,row) de la hoja `k`.
 *  `cx` = centro horizontal en pantalla. `bottomY` o `centerY`: los de TIERRA anclan el pie del
 *  contenido al suelo, los del AIRE centran el contenido en su altura de vuelo. `k2` = escala de
 *  proyeccion (k de proj, ya con el zoom de cercania si aplica). `flip` espeja en horizontal.
 *  `flash` = true pinta el sprite de blanco (impacto no letal — ver `tint` arriba).
 *  `dark` (0..1) lo OSCURECE conservando su forma: mismo mecanismo que el flash pero con
 *  'source-atop' y azul de sombra. Nacio para el Harrier de cola (PLAN_HARRIERS_PERSECUCION H1)
 *  y se queda como respaldo si `harrier_rear` no cargo. Sirve para cualquier bicho a contraluz. */
export function drawFrame(ctx, k, col, row, cx, { bottomY, centerY }, k2, flip, flash, dark) {
  const s = SHEETS[k], b = s.box;
  const cw = b.x1 - b.x0 + 1, ch = b.y1 - b.y0 + 1;
  const scale = s.wu * k2 / cw;                    // px de pantalla por px de hoja
  const W = s.fw * scale, H = s.fh * scale;
  // origen del frame tal que el CONTENIDO quede anclado donde corresponde
  const top = bottomY !== undefined
    ? bottomY - (b.y1 + 1) * scale
    : centerY - (b.y0 + ch / 2) * scale;
  const cxf = (b.x0 + cw / 2) * scale;             // centro del contenido dentro del frame escalado
  let img = s.img, sx = col * s.fw, sy = row * s.fh;
  if (flash) {
    tint.width = s.fw; tint.height = s.fh;         // asignar el tamaño ya limpia el canvas
    tintCtx.globalCompositeOperation = 'source-over';
    tintCtx.drawImage(s.img, sx, sy, s.fw, s.fh, 0, 0, s.fw, s.fh);
    tintCtx.globalCompositeOperation = 'source-in';
    tintCtx.fillStyle = '#f2f6f4';
    tintCtx.fillRect(0, 0, s.fw, s.fh);
    img = tint; sx = 0; sy = 0;
  } else if (dark > 0) {
    tint.width = s.fw; tint.height = s.fh;
    tintCtx.globalCompositeOperation = 'source-over';
    tintCtx.drawImage(s.img, sx, sy, s.fw, s.fh, 0, 0, s.fw, s.fh);
    tintCtx.globalCompositeOperation = 'source-atop';   // solo donde HAY sprite: la caja no se pinta
    tintCtx.fillStyle = 'rgba(13,18,22,' + Math.min(1, dark) + ')';
    tintCtx.fillRect(0, 0, s.fw, s.fh);
    img = tint; sx = 0; sy = 0;
  }
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(cx, 0);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, sx, sy, s.fw, s.fh, -cxf, top, W, H);
  ctx.restore();
}
