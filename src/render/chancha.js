// EL DIBUJO DE LA CHANCHA (SPEC_PODER_CHANCHA RF-03/RF-08). El estado vive en
// systems/chancha.js; aca solo se LEE su snapshot y se pinta (convencion 4 de ARQUITECTURA).
//
// SILUETA PROCEDURAL, cero assets (RNF-01): cuatro turbohelices, ala alta, cola en T y la
// manguera con la canasta colgando del ala derecha. Cuando llegue la hoja horneada se enchufa
// como en render/enemies.js —si cargo, sprite; si no, esto— y no hay que tocar nada mas.

import { ctx, px, W, H, HOR, F } from './ctx.js';
import { proj } from '../core/fx.js';
import { P } from '../data/palette.js';
import { run } from '../core/run.js';
import { CH_BOX, CH_DERIVA_V } from '../data/tuning.js';
import { snapshot } from '../systems/chancha.js';
import * as enemyArt from './enemies.js';

/** El Hercules, la manguera y la canasta. Se llama desde draw() en 'play', despues del mundo. */
export function drawChancha() {
  const c = snapshot();
  if (!c || c.fase === 'eta') return;                       // en el ETA todavia no esta a la vista
  const s = proj(c.x, c.y, c.z);
  const k = F / c.z;
  const w = 26 * k, h = 3.4 * k;                            // el KC-130 es GRANDE: se lee de lejos
  const bodyY = s.y - h / 2;

  // EL AIRFRAME: la hoja horneada si esta (tools/bake_enemies.html -> modelHercules), y si no el
  // dibujo procedural de siempre. Es el enchufe que este archivo ya tenia previsto en su cabecera.
  //
  // EL ALABEO NO ES DECORACION: SE LO SACA A LA DERIVA. La Chancha se hamaca CH_DERIVA metros a
  // los costados mientras esperas, y hasta ahora se hamacaba SIN INCLINARSE — un avion que se
  // traslada de costado con las alas a nivel, que es lo que hace una calcomania y no un avion.
  // La columna sale de la MISMA formula con la que systems/chancha.js calcula esa deriva
  // (`x = sin(t·V)`), asi que la banda es su VELOCIDAD lateral: cuando arranca para la derecha
  // baja el ala derecha, y al llegar al extremo pasa por nivel. No hay un seno nuevo ni un estado
  // nuevo — es el mismo dato leido una vez mas, que es la regla de este repo.
  const deriva = Math.cos(c.t * CH_DERIVA_V);          // > 0: se va hacia +x (la derecha)
  const bank = deriva > 0.25 ? 0 : deriva < -0.25 ? 2 : 1;
  const hoja = enemyArt.ready('chancha');
  if (hoja) {
    enemyArt.drawFrame(ctx, 'chancha', bank, 0, s.x, { centerY: s.y }, k, false, false, 0);
  } else {
    // ALA ALTA de punta a punta (el Hercules es un ala arriba del fuselaje, y esa es su silueta)
    px(s.x - w / 2, bodyY - h * 0.35, w, Math.max(1, h * 0.34), '#5a6a63');
    for (const f of [-0.34, -0.19, 0.19, 0.34]) {
      px(s.x + w * f - Math.max(1, w * 0.022), bodyY - h * 0.35, Math.max(1, w * 0.045), Math.max(1, h * 0.7), '#41504a');
    }
    // fuselaje, morro y la cola
    px(s.x - w * 0.16, bodyY, Math.max(2, w * 0.32), Math.max(1, h * 0.6), '#6b7a72');
    px(s.x - w * 0.2, bodyY + h * 0.12, Math.max(1, w * 0.05), Math.max(1, h * 0.36), '#8a9992');
    px(s.x + w * 0.14, bodyY - h * 0.95, Math.max(1, w * 0.035), Math.max(1, h * 1.0), '#5a6a63');
    px(s.x + w * 0.06, bodyY - h * 1.05, Math.max(1, w * 0.17), Math.max(1, h * 0.22), '#5a6a63');
  }
  // LAS HELICES VAN SIEMPRE POR CODIGO, con hoja o sin ella: un disco horneado se ve MUERTO, y lo
  // que dice que este avion esta volando —y no pegado en el cielo— es que las cuatro giren.
  //
  // DONDE VAN LO DICE EL HORNO. Con la hoja puesta, la posicion de cada disco sale de `anclaje()`:
  // el horneador proyecta el cono de cada helice del modelo con la MISMA camara con la que horneo
  // y escribe el pixel en src/data/cajas.js. Antes eran cuatro fracciones del ancho puestas a ojo
  // —±0.19 y ±0.34—, y estaban atadas a que los motores del modelo no se movieran nunca: cuando se
  // corrigieron a su posicion real (estaban un 50 % afuera) las cuatro helices habrian quedado
  // flotando al lado de sus gondolas, y no hay error de runtime que avise de eso.
  // Sin hoja, se cae a las fracciones de siempre, que es lo que el dibujo procedural necesita.
  //
  // EL DISCO SE VE DE CANTO. La hoja se hornea desde 12° por debajo, asi que el circulo de 4,1 m de
  // la helice se proyecta casi de perfil: ancho entero, alto una fraccion. Dibujarlo redondo la
  // haria parecer de frente. La proporcion exacta seria sen(12°) = 0,21 —tres pixeles, o sea nada—
  // y va en 0,30: una helice girando se ve como una banda BORROSA, mas gorda que el plano
  // geometrico que barre. Es de las pocas veces que el dibujo le gana a la cuenta.
  const HEL_D = 2.64;                                  // diametro del disco, en unidades de mundo
  for (let i = 0; i < 4; i++) {
    const a = hoja ? enemyArt.anclaje('chancha', i, s.x, { centerY: s.y }, k) : null;
    const f = [-0.34, -0.19, 0.19, 0.34][i];
    const hx = a ? a.x : s.x + w * f;
    const hy = a ? a.y : bodyY - h * 0.62;
    const dw = Math.max(2, HEL_D * k), dh = Math.max(1, dw * 0.30);
    ctx.globalAlpha = 0.30 + 0.22 * Math.sin(run.t * 30 + i * 2.2);
    px(hx - dw / 2, hy - dh / 2, dw, dh, P.dim);
    ctx.globalAlpha = 0.5;
    px(hx - dw / 2, hy - dh / 2, dw, Math.max(1, dh * 0.22), P.dim);   // el filo del disco
    ctx.globalAlpha = 1;
  }

  // LA MANGUERA: sale del POD del ala derecha, cuelga y termina en la canasta. Se dibuja como una
  // cadena de puntos con panza —no una recta— porque una manguera tensa se lee como un palo.
  //
  // DE DONDE SALE, HASTA HOY, ERA EL CENTRO DEL FUSELAJE: la cadena arrancaba en `s`, o sea que la
  // manguera nacia en la panza del Hercules y no en un pod. Nadie lo habia notado porque el
  // airframe tampoco tenia pod donde nacer. Ahora el modelo lleva uno y el horno dice en que pixel
  // quedo (`anclaje` indice 4), asi que la manguera sale de donde tiene que salir.
  const pod = hoja ? enemyArt.anclaje('chancha', 4, s.x, { centerY: s.y }, k) : null;
  const ox = pod ? pod.x : s.x, oy = pod ? pod.y : s.y;
  const b = proj(c.bx, c.by, c.bz);
  const cuelga = Math.abs(b.y - oy) * 0.25;
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const hx = ox + (b.x - ox) * u, hy = oy + (b.y - oy) * u + Math.sin(u * Math.PI) * cuelga;
    px(hx, hy, Math.max(1, k * 0.16), Math.max(1, k * 0.16), '#2c332f');
  }
  // LA CANASTA: el aro. Es lo que hay que ir a buscar, asi que se dibuja MAS claro que el resto
  // del avion — es el unico punto de toda la pantalla que importa mientras dura la cita.
  const bw = Math.max(2, k * 1.5);
  px(b.x - bw / 2, b.y - bw / 2, bw, Math.max(1, bw * 0.25), c.conn ? P.accent : P.foam);
  px(b.x - bw / 2, b.y + bw / 4, bw, Math.max(1, bw * 0.25), c.conn ? P.accent : P.foam);
  px(b.x - bw / 2, b.y - bw / 2, Math.max(1, bw * 0.22), bw, c.conn ? P.accent : P.foam);
  px(b.x + bw / 2, b.y - bw / 2, Math.max(1, bw * 0.22), bw, c.conn ? P.accent : P.foam);

  // LA CAJA, dibujada solo mientras NO estas conectado: es la ayuda de punteria, y una vez
  // adentro estorba. Se ve donde hay que meterse, que es la mitad de poder meterse.
  if (!c.conn && c.fase === 'cita') {
    const c0 = proj(c.bx - CH_BOX, c.by + CH_BOX, c.bz), c1 = proj(c.bx + CH_BOX, c.by - CH_BOX, c.bz);
    ctx.globalAlpha = 0.35 + 0.2 * Math.sin(run.t * 5);
    const bw2 = c1.x - c0.x, bh2 = c1.y - c0.y, esq = Math.max(2, bw2 * 0.22);
    for (const [ex, ey] of [[c0.x, c0.y], [c1.x - esq, c0.y], [c0.x, c1.y - 1], [c1.x - esq, c1.y - 1]]) {
      px(ex, ey, esq, 1, P.crest);
    }
    for (const [ex, ey] of [[c0.x, c0.y], [c1.x - 1, c0.y], [c0.x, c1.y - esq], [c1.x - 1, c1.y - esq]]) {
      px(ex, ey, 1, esq, P.crest);
    }
    ctx.globalAlpha = 1;
  }

  // EL RUMBO: mientras la cita este en el aire y el avion no la tenga a tiro, una flecha en el
  // borde de la pantalla dice para donde esta. Sin esto, la Chancha esta arriba y el jugador
  // mirando el suelo — y la ventana se vence sin que nadie sepa que empezo.
  // (RF-03: mientras este EN EL AIRE. Antes pedia ademas estar 14 m por debajo, y esa condicion
  // apagaba la flecha justo en el tramo en que mas sirve — cuando ya subiste y la estas buscando
  // de costado. Se apaga sola al enganchar, que es cuando estorba.)
  if (c.fase === 'cita' && !c.conn) {
    const mx = Math.max(12, Math.min(W - 12, s.x));
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(run.t * 6);
    for (let i = 0; i < 4; i++) px(mx - (3 - i), HOR + 12 + i * 2, 2 * (i + 1) - 1, 2, P.accent);
    ctx.globalAlpha = 1;
  }
}
