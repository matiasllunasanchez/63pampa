// LA CARGA DEL PROGRAMA (pedido del autor, 16/10/2026): la entrada a la mision despues de la
// tarjeta. No es el tubo que se prende —eso es el arranque del fichin, una sola vez al abrir el
// juego— sino "una carga de programa viejo": la de las computadoras de casete de los 80.
//
//   1. EL TONO GUIA: el borde entero hace franjas anchas rojo/cian que suben, y en el papel negro
//      del medio el cartel del programa. El juego todavia no se ve.
//   2. LOS DATOS: el borde pasa a franjas finitas azul/amarillo, al azar en cada cuadro, y el papel
//      se va revelando por renglones EN EL ORDEN EN QUE CARGABA LA PANTALLA de esas maquinas: por
//      tercios, y adentro de cada tercio de a una fila de pixel por renglon de caracteres — por eso
//      la imagen aparece "peinada" y no de arriba a abajo.
//   3. Fin: el borde se va de golpe y queda el juego, que venia corriendo abajo todo el tiempo.
//
// Se dibuja AL FINAL de draw, encima de todo, en la grilla de MUNDO (480x270), como el fundido que
// reemplaza. El reloj lo lleva game.js (`cargaProgT`); el sonido es sonidoCarga en systems/audio.js
// y usa los MISMOS dos tiempos de aca, asi el chillido y las franjas cambian juntos.
import { ctx, W, H } from './ctx.js';
import { T } from '../core/i18n.js';

export const CARGA = { GUIA: 0.6, DATOS: 1.5 };
export const CARGA_T = CARGA.GUIA + CARGA.DATOS;

const BORDE = 22;                                         // ancho del borde de franjas, en mundo
const PAPEL = { x: BORDE, y: BORDE, w: W - BORDE * 2, h: H - BORDE * 2 };
const FILA = 2;                                           // alto de una "fila de pixel" del papel
const FILAS = Math.floor(PAPEL.h / FILA);
const TERCIO = Math.ceil(FILAS / 3), RENG = 8;            // tercios y renglones de 8 filas

// el orden de carga de cada fila: tercio, despues la fila dentro del renglon, despues el renglon.
// Se guarda el PUESTO (0..FILAS-1) de cada fila en ese orden, asi el avance lineal las cubre todas.
const ORDEN = new Array(FILAS);
{
  const clave = f => {
    const t = Math.floor(f / TERCIO), dentro = f - t * TERCIO;
    return [t, dentro % RENG, Math.floor(dentro / RENG)];
  };
  const filas = [...Array(FILAS).keys()].sort((a, b) => {
    const ka = clave(a), kb = clave(b);
    return ka[0] - kb[0] || ka[1] - kb[1] || ka[2] - kb[2];
  });
  filas.forEach((f, puesto) => { ORDEN[f] = puesto; });
}

/** Un cuadro de la carga. `t` = segundos desde que empezo (0..CARGA_T). `nombre` va en el cartel. */
export function drawCarga(t, nombre) {
  if (t >= CARGA_T) return;
  ctx.save();
  const guia = t < CARGA.GUIA;
  // EL BORDE: solo el marco alrededor del papel (recorte par-impar: pantalla menos papel). Adentro
  // del papel no se pinta nada que no sea negro, asi lo ya cargado deja ver el juego tal cual.
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(PAPEL.x, PAPEL.y, PAPEL.w, PAPEL.h); ctx.clip('evenodd');
  if (guia) {
    const alto = 9, sube = (t * 60) % (alto * 2);
    for (let y = -alto * 2 + sube; y < H; y += alto * 2) {
      ctx.fillStyle = '#c8282a'; ctx.fillRect(0, y, W, alto);
      ctx.fillStyle = '#22c4c8'; ctx.fillRect(0, y + alto, W, alto);
    }
  } else {
    for (let y = 0; y < H;) {
      const h = 1 + ((Math.random() * 4) | 0);
      ctx.fillStyle = Math.random() < 0.5 ? '#2a3ad0' : '#e8d02a';
      ctx.fillRect(0, y, W, h); y += h;
    }
  }
  ctx.restore();
  // EL PAPEL: negro donde todavia no cargo; donde ya cargo se deja ver el juego
  const listo = guia ? 0 : Math.floor(FILAS * Math.min(1, (t - CARGA.GUIA) / CARGA.DATOS));
  ctx.fillStyle = '#000';
  for (let f = 0; f < FILAS; f++)
    if (ORDEN[f] >= listo) ctx.fillRect(PAPEL.x, PAPEL.y + f * FILA, PAPEL.w, FILA);
  if (FILAS * FILA < PAPEL.h && listo < FILAS) ctx.fillRect(PAPEL.x, PAPEL.y + FILAS * FILA, PAPEL.w, PAPEL.h - FILAS * FILA);
  // EL CARTEL del programa, arriba a la izquierda del papel, como lo imprimia la maquina
  if (guia || listo < TERCIO) {
    ctx.font = 'bold 10px monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = '#e8eef0';
    ctx.fillText(T('carga_prog', { n: nombre || 'RASANTE' }), PAPEL.x + 8, PAPEL.y + 8);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();
}
