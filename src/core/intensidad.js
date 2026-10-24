// LA INTENSIDAD DEL JUEGO, de 0 a 1 — lo que la MUSICA EN CAPAS sigue (docs/produccion/MUSICA_CAPAS.md).
//
// Pedido del autor (23/10/2026): "que la musica sincronice con la intensidad del juego". La musica no
// marca el ritmo del nivel —los niveles van por distancia y la velocidad cambia: un nivel coreografiado
// sobre una cancion se desfasa al primer minuto, y spawnear al compas haria que la dificultad dependa
// de la pista que toco—: el juego dice cuanta tension hay y la musica la acompaña.
//
// Puro y sin estado propio (convencion de core/): entra una FOTO del juego, sale un numero. El
// suavizado (entra rapido, se va despacio) tambien es una funcion pura sobre el valor anterior. Asi
// tools/unit.js lo prueba en Node y los pesos se ajustan en data/musica_capas.js (INTENSIDAD).
import { INTENSIDAD as I } from '../data/musica_capas.js';

const c01 = v => Math.max(0, Math.min(1, v));

/** LA FOTO → la intensidad CRUDA (sin suavizar). `f`:
 *    estrellas   nivel de alerta (0..EST_MAX)        detection  la barra del radar (0..1)
 *    misiles     misiles enemigos viniendo hacia vos  hostiles   enemigos cerca en el pasillo
 *    buqueZ      distancia al buque de la suelta (null sin buque) · defensas: lanzadores vivos
 *    clímax      el final filmado de la suelta (camara lenta, impacto)
 *    escape      escapando del buque tras pegarle    salud      integridad 0..100
 *  Cada fuente aporta hasta su peso; se suman y se acota. No es un promedio a proposito: dos cosas
 *  pasando a la vez TIENEN que sonar mas que una. */
export function intensidadCruda(f) {
  if (f.climax) return 1;
  let v = I.base;
  v += I.estrellas * c01((f.estrellas || 0) / I.estrellasMax);
  v += I.radar * c01(f.detection || 0);
  v += I.misiles * c01((f.misiles || 0) / I.misilesTope);
  v += I.hostiles * c01((f.hostiles || 0) / I.hostilesTope);
  if (f.buqueZ != null && f.buqueZ > 0) {
    // EL BUQUE se acerca: la tension crece con la cercania (de BUQUE_LEJOS a la ventana), y las defensas
    // vivas suman — un buque que ya no tira sigue siendo el blanco, pero pesa menos
    const cerca = c01(1 - (f.buqueZ - I.buqueVentana) / (I.buqueLejos - I.buqueVentana));
    v += I.buque * cerca * (f.defensas > 0 ? 1 : 0.6);
  }
  if (f.escape) v = Math.max(v, I.escape);
  // LA SALUD BAJA no sube la musica: la pone ANSIOSA (la tension minima con la chapa rota)
  if (f.salud != null && f.salud < 50) v = Math.max(v, I.herido);
  return c01(v);
}

/** EL SUAVIZADO: sube en `I.sube` s y baja en `I.baja` s (el misil que pasa no corta la musica en el
 *  acto; la calma vuelve de a poco). `prev` es el valor anterior, `dt` el cuadro. */
export function suavizar(prev, cruda, dt) {
  const T = cruda > prev ? I.sube : I.baja;
  return prev + (cruda - prev) * Math.min(1, dt / Math.max(0.01, T));
}

/** CUANTO SUENA CADA CAPA para una intensidad `v`: la rampa de la capa entre `desde` y `hasta` (0 antes,
 *  1 despues), con su piso `min`. La tabla vive en data/musica_capas.js, por pista. */
export function nivelCapa(capa, v) {
  if (capa.siempre) return 1;
  const u = c01((v - capa.desde) / Math.max(0.001, capa.hasta - capa.desde));
  return (capa.min || 0) + (1 - (capa.min || 0)) * u;
}

/** EL PROXIMO COMPAS: el instante (en segundos de la pista) del siguiente borde de compas despues de
 *  `t`, con la grilla `bpm`, `offset` (primer tiempo fuerte) y `compas` tiempos por compas. Los cambios
 *  de capa caen ahi y no a mitad de frase. */
export function proximoCompas(t, bpm, offset, compas) {
  const dur = 60 / bpm * compas;
  if (t < offset) return offset;
  return offset + Math.ceil((t - offset) / dur + 1e-6) * dur;
}
