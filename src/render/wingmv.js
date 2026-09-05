// RENDER DE LAS PIRUETAS DE ACTOR: el Fiel que entra a hacer una maniobra en escena.
// La logica vive en systems/wingmv.js; esto solo lo pinta.
//
// Espacio de coordenadas: MUNDO (480×270, W/H de ctx.js) — se dibuja junto al avion del jugador.
//
// POR QUE NO REUSA `drawPlane`: ese dibuja EL avion del jugador y lee `plane`/`run` directo — el
// bob de vuelo, el cono transonico, la rociada, la sangre, el tren, el turbo. Un actor no tiene
// nada de eso y forzarlo a pasar por ahi convertiria una funcion ya larga en una con dos dueños.
// El precedente del repo es `render/squad.js`, que dibuja la formacion con estas mismas cuatro
// lineas de hoja de sprite por el mismo motivo. Lo que SI se comparte es lo que de verdad es
// comun: la sombra y la escala (`drawShadow`, `PLANE_SCALE` de render/plane.js) — dos rutinas de
// sombra serian dos aviones distintos, y la que no se mira se pudre.
import { ctx, PZ, U } from './ctx.js';
import { proj } from '../core/fx.js';
import { PLANES, SHEET_FW, SHEET_FH, SHEET_NF } from '../data/planes.js';
import { PLANE_SCALE, drawShadow } from './plane.js';
import * as enemyArt from './enemies.js';

/** Los actores en escena, del mas lejano al mas cercano (pintor correcto: uno puede pasar por
 *  delante de otro). `selPlane` es el avion elegido — los Fieles vuelan el mismo modelo.
 *
 *  `lista` es la FOTO que publica `systems/wingmv.js` (`state()`), pasada por parametro: un render
 *  no importa un sistema (convencion 4 de ARQUITECTURA, y lo vigila `npm run lint:layers`). */
export function drawActores(selPlane, lista) {
  if (!lista || !lista.length) return;
  const pl = PLANES[selPlane];
  const kRef = proj(0, 0, PZ).k;
  const smooth = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  const orden = lista.slice().sort((a, b) => b.z - a.z);
  for (const B of orden) {
    const s = proj(B.x, B.y, B.z);
    const f = s.k / kRef;                       // escala por distancia: lejos, chico
    drawShadow(B.x, B.y, B.z, f);
    // UN BLANCO DEL TEATRO usa la hoja del caza enemigo y no el modelo propio. Es el mismo actor
    // —misma entrada, misma maquinaria de vida, mismas curvas si vuela una pirueta— y lo unico que
    // cambia es de quien es. Sale por arriba porque `drawFrame` ya resuelve su propia escala y su
    // propio anclaje: meterlo en el bloque de abajo seria pelearle a dos sistemas de medida.
    if (B.bando === 'blanco') {
      if (enemyArt.ready('jet')) {
        const col = Math.round((Math.max(-1, Math.min(1, -B.bank)) * 0.5 + 0.5) * (enemyArt.SHEETS.jet.cols - 1));
        enemyArt.drawFrame(ctx, 'jet', col, 0, s.x, { centerY: s.y - B.pitch * 1.8 * f }, s.k, false, false);
      }
      continue;
    }
    ctx.save();
    ctx.translate(s.x, s.y - B.pitch * 1.8 * f);
    // EL ROLIDO DE LA MANIOBRA gira el sprite entero (el modelo es vista trasera), igual que en el
    // avion del jugador: es lo que hace que un tonel barril se lea como un tonel y no como un
    // avion trasladandose en circulo. `mvRoll` lo escribe el MISMO motor de piruetas.
    if (B.roll) ctx.rotate(B.roll);
    ctx.scale(U * f, U * f);
    const hoja = pl.sheetOk ? pl.sheetImg : null;
    if (hoja) {
      // COLUMNA por alabeo y FILA por cabeceo: la misma pose que usa el jugador. Rolando, columna
      // central — el giro lo trae la rotacion de arriba y no los frames, o se sumarian dos veces.
      const col = B.roll ? (SHEET_NF - 1) / 2
        : Math.round((1 - Math.max(-1, Math.min(1, B.bank))) / 2 * (SHEET_NF - 1));
      const pc = Math.max(-1, Math.min(1, B.pitch));
      const row = pc > 0.33 ? 0 : pc < -0.33 ? 2 : 1;
      const w = SHEET_FW / U * PLANE_SCALE, h = SHEET_FH / U * PLANE_SCALE;
      ctx.drawImage(hoja, col * SHEET_FW, row * SHEET_FH, SHEET_FW, SHEET_FH, -w / 2, -h / 2, w, h);
    } else if (pl.ready) {
      const w = 76 / U * PLANE_SCALE, h = w * pl.h / pl.w;
      ctx.drawImage(pl.img, -w / 2, -h / 2, w, h);
    }
    ctx.restore();
  }
  ctx.imageSmoothingEnabled = smooth;
}
