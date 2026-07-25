// HOJAS DE SPRITES DE LOS ENEMIGOS — helicoptero, caza, radar movil, camion AA, barcaza y globo.
//
// Las hornea tools/bake_enemies.html desde modelos low-poly (npx electron tools/bake_enemies_run.js),
// igual que las hojas de los aviones jugables. El dibujo a mano de render/world.js QUEDA como
// respaldo: si una hoja no cargo (o el build web la vacio), el juego sigue mostrando lo de antes.
//
// `box` es el rectangulo de CONTENIDO dentro del frame, MEDIDO SOBRE EL ALFA de la hoja horneada
// (el frame tiene aire alrededor para que el helo pueda girar el rotor sin cortarse). Se usa para
// anclar: los vehiculos apoyan el BORDE INFERIOR del contenido en el suelo, no el del frame.
// ⚠ Si se rehornea con otros modelos/camara, RE-MEDIR (ver el probe de alfa en la conversacion
// de tools/bake_enemies.html — un scan que busca el bbox del alfa por hoja).
//
// `wu` = cuantas unidades de MUNDO abarca el ancho del CONTENIDO. Es la perilla de tamaño por
// enemigo: subirla agranda al bicho en pantalla sin tocar la colision (los hitboxes viven en
// core/hitbox.js y no leen nada de aca).

// Rutas como LITERALES SUELTOS: tools/build_web.py re-embebe buscando el literal exacto
// '../assets/...' — un `BASE + nombre` armado en runtime no lo encontraria y el build fallaria.
const FILES = {
  helo: '../assets/world/enemies/helo.png',
  jet: '../assets/world/enemies/jet.png',
  radar: '../assets/world/enemies/radar.png',
  aatruck: '../assets/world/enemies/aatruck.png',
  lcu: '../assets/world/enemies/lcu.png',
  balloon: '../assets/world/enemies/balloon.png',
  aa: '../assets/world/enemies/aa.png',
  tent: '../assets/world/enemies/tent.png',
  depot: '../assets/world/enemies/depot.png',
  bldg: '../assets/world/enemies/bldg.png',
  fragata: '../assets/world/enemies/fragata.png',
};

export const SHEETS = {
  helo: { fw: 64, fh: 48, cols: 8, rows: 2, box: { x0: 6, y0: 16, x1: 57, y1: 36 }, wu: 11.5 },
  jet: { fw: 64, fh: 48, cols: 5, rows: 1, box: { x0: 14, y0: 10, x1: 49, y1: 31 }, wu: 10.5 },
  radar: { fw: 48, fh: 48, cols: 4, rows: 1, box: { x0: 10, y0: 7, x1: 43, y1: 40 }, wu: 6.2 },
  aatruck: { fw: 56, fh: 48, cols: 3, rows: 1, box: { x0: 13, y0: 12, x1: 48, y1: 39 }, wu: 6.6 },
  lcu: { fw: 72, fh: 48, cols: 1, rows: 1, box: { x0: 10, y0: 11, x1: 51, y1: 32 }, wu: 8.6 },
  balloon: { fw: 48, fh: 48, cols: 1, rows: 1, box: { x0: 9, y0: 11, x1: 37, y1: 33 }, wu: 5.6 },
  aa: { fw: 48, fh: 48, cols: 2, rows: 1, box: { x0: 8, y0: 7, x1: 39, y1: 35 }, wu: 5.2 },
  tent: { fw: 48, fh: 48, cols: 1, rows: 1, box: { x0: 7, y0: 16, x1: 43, y1: 33 }, wu: 5.4 },
  // depot y bldg se escalan por ALTURA al dibujar (o.h varia por spawn): wu es el ancho a la
  // altura de referencia y drawFrame recibe el k ya multiplicado por (o.h / href)
  depot: { fw: 64, fh: 48, cols: 1, rows: 1, box: { x0: 11, y0: 14, x1: 55, y1: 34 }, wu: 8.2, href: 5.5 },
  bldg: { fw: 64, fh: 48, cols: 1, rows: 1, box: { x0: 16, y0: 11, x1: 49, y1: 37 }, wu: 6.8, href: 9.5 },
  fragata: { fw: 64, fh: 48, cols: 1, rows: 1, box: { x0: 14, y0: 13, x1: 52, y1: 35 }, wu: 11 },
};
for (const k in SHEETS) {
  const s = SHEETS[k];
  s.img = new Image();
  if (FILES[k]) s.img.src = FILES[k];   // build web sin hoja: src vacio, ready() da false y listo
}

/** ¿La hoja de `k` esta lista para dibujar? Si no, world.js cae a su dibujo a mano. */
export const ready = k => { const s = SHEETS[k]; return s.img.complete && s.img.naturalWidth > 0; };

/** Dibuja el frame (col,row) de la hoja `k`.
 *  `cx` = centro horizontal en pantalla. `bottomY` o `centerY`: los de TIERRA anclan el pie del
 *  contenido al suelo, los del AIRE centran el contenido en su altura de vuelo. `k2` = escala de
 *  proyeccion (k de proj, ya con el zoom de cercania si aplica). `flip` espeja en horizontal. */
export function drawFrame(ctx, k, col, row, cx, { bottomY, centerY }, k2, flip) {
  const s = SHEETS[k], b = s.box;
  const cw = b.x1 - b.x0 + 1, ch = b.y1 - b.y0 + 1;
  const scale = s.wu * k2 / cw;                    // px de pantalla por px de hoja
  const W = s.fw * scale, H = s.fh * scale;
  // origen del frame tal que el CONTENIDO quede anclado donde corresponde
  const top = bottomY !== undefined
    ? bottomY - (b.y1 + 1) * scale
    : centerY - (b.y0 + ch / 2) * scale;
  const cxf = (b.x0 + cw / 2) * scale;             // centro del contenido dentro del frame escalado
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(cx, 0);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(s.img, col * s.fw, row * s.fh, s.fw, s.fh, -cxf, top, W, H);
  ctx.restore();
}
