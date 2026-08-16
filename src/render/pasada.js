// RENDER de la fase PASADA: la capa 2D que va ENCIMA del mundo 3D (systems/three-arena.js, la
// MISMA escena que usa el arena). Todo en espacio de PANTALLA (grilla 480x270).
//
// Lo que se puede compartir con el arena se IMPORTA, no se copia (SPEC_MODO_PASADA §3): el avion en
// 3a persona, la flecha al buque, la cabina y la mira son los mismos. Lo que NO se comparte son los
// indicadores de sistemas que la pasada no tiene (pintado de misiles, stagger, reparto de energia):
// dibujar barras de algo que no existe seria mentirle al jugador.
//
// ESTA ES LA FASE P0: tablero minimo. La banda de armado en el HUD, los corchetes calientes de la
// ventana y los avisos por capa llegan en P5 (legibilidad), que es su fase.
import { ctx, W, H, px } from './ctx.js';
import { P } from '../data/palette.js';
import { T } from '../core/i18n.js';
import { run } from '../core/run.js';
import { cfg } from '../core/state.js';
import { drawMira } from './miras.js';
import { drawCockpit } from './momentum.js';
import { drawThirdPlane, shipArrow, COCKPIT_Y } from './arena.js';
import * as world3D from '../systems/three-arena.js';
import { PS } from '../data/pasada.js';
import { shown as dmgShown } from '../systems/damage.js';

/** ¿El efecto esta lo bastante ADELANTE como para dibujarlo?
 *
 *  `project().vis` no contesta esto: un punto que quedo atras proyecta igual, con las coordenadas
 *  dadas vuelta, y se veian columnas y chapoteos flotando en el cielo sobre el horizonte. El
 *  margen NO es cero sino MARGEN_M metros: la camara va DETRAS del avion, asi que algo "apenas
 *  adelante del morro" puede estar atras del ojo — medido en captura, con margen cero seguia
 *  saliendo un rectangulo palido arriba a la izquierda.
 */
const MARGEN_M = 45;
function adelante(f, A) {
  return (f.x - A.pos.x) * A.fwd.x + (f.z - A.pos.z) * A.fwd.z > MARGEN_M;
}

export function drawPasada(w) {
  const { pasada: A, zones, objectiveShip, parts, popups, selPlane } = w;
  const enEje = w.eje >= PS.AXIS_OK;

  // ---- EL EJE DE ATAQUE: el pasillo de aproximacion, pintado sobre el agua (P1) ----
  // Es LA respuesta a "no entiendo la idea del nivel". El buque tiene la eslora sobre X, y entrar
  // por ahi da una ventana de suelta CUATRO VECES mas larga que cruzando la manga (1,2 s contra
  // 0,3 a 110 m/s, medido). Ese hecho decide la fase entera y hasta P1 no estaba dicho en ningun
  // lado: el jugador entraba de costado, fallaba, y no tenia como saber que el error fue el rumbo.
  //
  // Se dibuja como una PISTA — marcas separadas sobre el mar, no una linea — porque eso es lo que
  // es: por donde se entra. Se enciende cuando VENIS por ella, asi el acierto se ve antes de
  // soltar y no despues de errar. Salteando el casco, que ya se dibuja solo.
  // NO SON DOS LINEAS. Lo fueron, y el autor las mando sacar en el playtest del 16/8: "hay 2 lineas
  // a los costados en el piso, quitar; de ultima marcar con otra cosa, como bruma, y que solo sea
  // un FOCO VISIBLE del piloto". Tenia razon — dos rayas sobre el mar se leen como una pista de
  // aeropuerto, que es una cosa que en el Atlantico Sur no existe.
  //
  // Lo que quedo es un CARRIL DE AGUA MAS CLARA: la misma informacion (por aca se entra) dicha por
  // el mar y no por una marca de HUD tirada al piso. Sin bordes, sin contorno: solo el agua un
  // poco mas viva por donde conviene venir, y mas viva todavia cuando VENIS por ahi.
  {
    ctx.fillStyle = enEje ? P.accent : P.foam;
    for (let d = 100; d <= PS.AXIS_LEN_M; d += PS.AXIS_STEP_M) {
      for (const sx of [-1, 1]) {
        const a0 = world3D.project(sx * d, 1, -PS.AXIS_W_M);
        const a1 = world3D.project(sx * d, 1, PS.AXIS_W_M);
        const b1 = world3D.project(sx * (d + PS.AXIS_STEP_M), 1, PS.AXIS_W_M);
        const b0 = world3D.project(sx * (d + PS.AXIS_STEP_M), 1, -PS.AXIS_W_M);
        if (!a0.vis || !a1.vis || !b0.vis || !b1.vis) continue;
        if (Math.max(a0.x, a1.x, b0.x, b1.x) < -60 || Math.min(a0.x, a1.x, b0.x, b1.x) > W + 60) continue;
        // los tramos LEJANOS se desvanecen: el carril nace cerca del buque y se va perdiendo en la
        // bruma, que es lo que hace que se lea como agua y no como una senda pintada
        const lej = Math.max(0, Math.min(1, 1 - d / PS.AXIS_LEN_M));
        ctx.globalAlpha = (enEje ? 0.17 : 0.09) * (0.35 + lej * 0.65);
        ctx.beginPath();
        ctx.moveTo(a0.x, a0.y); ctx.lineTo(a1.x, a1.y);
        ctx.lineTo(b1.x, b1.y); ctx.lineTo(b0.x, b0.y);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---- LA PUERTA DE RE-ENCARE: donde girar para volver a entrar por el eje (P1) ----
  // Solo existe si sobrevolaste sin soltar. Sin ella "dar otra vuelta" es deambular hasta que el
  // buque vuelva a estar adelante; con ella es una maniobra con principio y fin — y como el tanque
  // es de UNA corrida (RF-10), la vuelta tiene precio y conviene que se vea cuanto falta.
  if (A.gate) {
    const gp = world3D.project(A.gate.x, 26, A.gate.z);
    if (gp.vis) {
      const par = Math.sin(A.t * 5) > -0.3;
      ctx.globalAlpha = par ? 0.9 : 0.45;
      ctx.strokeStyle = P.foam; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(gp.x, gp.y, 7, 0, 7); ctx.stroke();
      px(gp.x - 1, gp.y - 11, 2, 4, P.foam);
      ctx.globalAlpha = 1;
      ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.foam;
      const dg = Math.hypot(A.gate.x - A.pos.x, A.gate.z - A.pos.z) | 0;
      ctx.fillText(T('pasada_gate') + ' ' + dg + ' m', gp.x, gp.y + 16);
    }
  }

  // ---- LA OLEADA (P7): los Fieles en su corrida ----
  // Se dibujan CHICOS y con estela: a 1000 metros un A-4 es un punto que se mueve, y lo que tiene
  // que leerse no es el avion sino que HAY ALGUIEN MAS ahi haciendo lo mismo que vos. La estela es
  // lo que cuenta la historia — entra a ras, salta sobre el buque, sale del otro lado.
  for (const f of w.oleada || []) {
    if (!adelante(f, A)) continue;
    const sp = world3D.project(f.x, f.y, f.z);
    if (!sp.vis) continue;
    const k = Math.max(1, Math.min(4, 260 / Math.max(60, Math.hypot(f.x - A.pos.x, f.z - A.pos.z))));
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = P.foam; ctx.lineWidth = 1;
    const tp = world3D.project(f.x - (f.x > 0 ? 1 : -1) * 60, f.y, f.z);
    if (tp.vis) { ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(sp.x, sp.y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    px(sp.x - k / 2, sp.y - k / 2, k, k, P.foam);
  }

  // ---- zonas: corchetes + etiqueta + HP (vivas); humo (muertas) ----
  // Version simple a proposito: sin arco de pintado ni barra de stagger, que son sistemas del
  // arena. Acá el blanco no se "marca": se le pasa por encima.
  //
  // SOLO DESDE LA VENTANA (POPUP_DIST_M). Es RF-05 —el salto es lo que habilita la mira sobre las
  // zonas— y ademas resuelve lo que se ve a 1200 m: cinco etiquetas apiladas sobre un buque que
  // mide diez pixeles. De lejos se ve UN buque, que es lo que se ve de lejos.
  const cerca = Math.hypot(A.pos.x, A.pos.z) < PS.POPUP_DIST_M;
  for (const z of zones) {
    if (!cerca) break;
    const r = world3D.zoneRect3D(z.id);
    if (!r || r.w > W * 1.6) continue;                  // del lado ciego, fuera de cuadro o encima
    if (z.hp <= 0) {
      if (Math.random() < 0.25) parts.push({
        x: r.x + Math.random() * r.w, y: r.y, vx: (Math.random() - 0.5) * 8,
        vy: -(10 + Math.random() * 12), life: 0.8, c: '#3a3f43', r: 1.5,
      });
      continue;
    }
    if (Math.sin(A.t * 7) > -0.4) {
      ctx.strokeStyle = P.warn; ctx.lineWidth = 1; ctx.globalAlpha = 0.9;
      const c = Math.max(2, Math.min(r.w, r.h) * 0.28);
      ctx.beginPath();
      ctx.moveTo(r.x, r.y + c); ctx.lineTo(r.x, r.y); ctx.lineTo(r.x + c, r.y);
      ctx.moveTo(r.x + r.w - c, r.y); ctx.lineTo(r.x + r.w, r.y); ctx.lineTo(r.x + r.w, r.y + c);
      ctx.moveTo(r.x, r.y + r.h - c); ctx.lineTo(r.x, r.y + r.h); ctx.lineTo(r.x + c, r.y + r.h);
      ctx.moveTo(r.x + r.w - c, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h); ctx.lineTo(r.x + r.w, r.y + r.h - c);
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    // EL NOMBRE SOLO CUANDO LA ZONA YA ES UN LUGAR. A 500 metros las cinco zonas ocupan unos
    // pocos pixeles cada una y los cinco carteles se apilan en un borron ilegible sobre el buque
    // —se ve en las capturas—, que es peor que no poner nada: parece un error del juego. Debajo de
    // 14 px de ancho queda el corchete solo, que ya dice "aca hay algo". El nombre aparece cuando
    // sirve para ELEGIR entre una zona y otra, que es para lo unico que hace falta.
    if (r.w >= 14) {
      ctx.font = '6px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn;
      ctx.fillText(T(z.label), r.x + r.w / 2, r.y - 3);
    }
    const bw = Math.min(r.w, 40), bx0 = r.x + (r.w - bw) / 2;
    px(bx0, r.y + r.h + 2, bw, 2, '#2e3c45');
    px(bx0, r.y + r.h + 2, bw * (z.hp / z.maxHp), 2, P.warn);
  }

  // ---- efectos del mundo: bombas en vuelo, columnas de agua, el hundimiento ----
  for (const f of A.fx) {
    if (f.k === 'bomb') {
      // LA BOMBA: un punto con estela corta hacia atras. Se la ve CAER — que es de donde sale toda
      // la lectura de la suelta: si la ves pasar larga, soltaste tarde.
      const hp = world3D.project(f.x, f.y, f.z);
      if (!hp.vis) continue;
      const tp = world3D.project(f.x - f.vx * 0.12, f.y - f.vy * 0.12, f.z - f.vz * 0.12);
      ctx.globalAlpha = 0.5; ctx.strokeStyle = f.sapito ? P.accent : '#c9ccc7'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(hp.x, hp.y); ctx.stroke();
      ctx.globalAlpha = 1;
      px(hp.x - 1, hp.y - 1, 3, 3, f.sapito ? P.accent : '#e8e4d8');
      continue;
    }
    // ---- COLUMNA DE AGUA (RF-04) ----
    // Antes de reventar se ve la MARCA sobre el agua: es el telegrafo, y es lo que hace que la
    // salva sea esquivable en vez de injusta. Despues, la columna sube — y mientras sube, mata.
    if (f.k === 'col') {
      // DELANTE DEL MORRO O NO SE DIBUJA. `project().vis` no alcanza: un punto que quedo ATRAS
      // igual proyecta, y con las coordenadas dadas vuelta — se veian columnas flotando en el
      // cielo, sobre el horizonte (primera captura de P3). El producto escalar contra el morro es
      // la pregunta que `vis` no contesta.
      if (!adelante(f, A)) continue;
      const wp = world3D.project(f.x, 0, f.z);
      if (!wp.vis) continue;
      const dt0 = f.T - f.wait;
      if (dt0 < 0) {
        // el aviso: un circulito que se cierra sobre el punto donde va a caer
        const k = Math.max(0, Math.min(1, -dt0 / (PS.COL_GAP_S * PS.COL_N)));
        ctx.strokeStyle = P.warn; ctx.globalAlpha = 0.5;
        ctx.beginPath(); ctx.arc(wp.x, wp.y, 2 + k * 9, 0, 7); ctx.stroke();
        ctx.globalAlpha = 1;
        continue;
      }
      // la columna: alta, blanca y fea. Se dibuja en el MUNDO (el tope tambien se proyecta) para
      // que la altura sea de verdad y no un rectangulo pegado a la pantalla.
      //
      // Y SE ACOTA, que no es prolijidad: una columna que revienta pegada a la camara proyecta un
      // alto enorme y el rectangulo tapaba MEDIA PANTALLA con un bloque gris — se ve en la primera
      // captura de P3. Proyectar no garantiza un tamaño razonable; dibujar, si.
      const h = Math.min(1, dt0 * 3.2) * 46 * Math.max(0, 1 - dt0 / PS.COL_LIFE);
      const tp = world3D.project(f.x, h, f.z);
      if (!tp.vis || wp.x < -60 || wp.x > W + 60) continue;
      const hpx = wp.y - tp.y;
      if (!(hpx > 0) || hpx > H * 1.2) continue;
      const w2 = Math.max(1, Math.min(22, hpx * 0.16));
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      px(wp.x - w2 / 2, tp.y, w2, hpx, '#c9ccc7');
      px(wp.x - w2, tp.y - 2, w2 * 2, 3, '#e8e4d8');
      ctx.globalAlpha = 1;
      continue;
    }

    // ---- SEA DART (RF-03): la estela que sale del buque y viene ----
    if (f.k === 'dart') {
      if (!adelante(f, A)) continue;                        // idem: atras no se dibuja
      const hp = world3D.project(f.x, f.y, f.z);
      if (!hp.vis) continue;
      const tp = world3D.project(f.x - f.vx * 90, f.y - f.vy * 90, f.z - f.vz * 90);
      ctx.globalAlpha = 0.65; ctx.strokeStyle = '#c9ccc7'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(hp.x, hp.y); ctx.stroke();
      ctx.globalAlpha = 1;
      px(hp.x - 1, hp.y - 1, 3, 3, Math.sin(A.t * 30) > 0 ? P.warn : '#e8e4d8');
      continue;
    }

    if (f.k === 'splash') {
      // COLUMNA DE AGUA / hongo del impacto, en el mundo
      if (!adelante(f, A)) continue;                        // atras no se dibuja (ver 'col')
      const wp = world3D.project(f.x, f.y, f.z);
      if (!wp.vis) continue;
      const a = Math.min(1, f.life), r2 = 3 + f.vr * f.T;
      ctx.globalAlpha = a * (f.T < 0.12 ? 0.95 : 0.5);
      ctx.fillStyle = f.T < 0.12 ? P.warn : '#8d949a';
      ctx.beginPath(); ctx.arc(wp.x, wp.y, r2, 0, 7); ctx.fill();
      if (f.T >= 0.12) { ctx.fillStyle = '#c9ccc7'; ctx.beginPath(); ctx.arc(wp.x, wp.y - r2 * 0.5, r2 * 0.5, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      continue;
    }
    const a = Math.min(1, f.life), r2 = 2 + f.vr * f.T;
    ctx.globalAlpha = a * (f.T < 0.12 ? 0.95 : 0.45);
    ctx.fillStyle = f.T < 0.12 ? P.warn : '#7c838a';
    ctx.beginPath(); ctx.arc(f.x, f.y, r2, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // particulas y popups
  for (const p of parts) { ctx.globalAlpha = Math.min(1, p.life * 2); px(p.x, p.y, p.r, p.r, p.c); }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center';
  for (const p of popups) {
    ctx.font = p.big ? 'bold 10px monospace' : '7px monospace';
    ctx.globalAlpha = Math.min(1, p.life); ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y);
  }
  ctx.globalAlpha = 1;

  // ---- el avion: cabina (1a) o sprite (3a) ----
  if (w.view === 1) drawCockpit({ mom: { t: A.t, hitFx: A.hitFx }, t: w.t, yOff: COCKPIT_Y });
  else drawThirdPlane(A, selPlane);

  // ---- MIRA: proyectada desde el MUNDO, sobre el punto adonde apunta el morro ----
  const app = world3D.project(A.pos.x + A.fwd.x * 400, A.pos.y + A.fwd.y * 400, A.pos.z + A.fwd.z * 400);
  const ax = app.vis ? app.x : W / 2, ay = app.vis ? app.y : H / 2;
  if (!drawMira(cfg.mira, ax, ay, 16, A.hitFx ? 1 : 0.85)) {
    const mc = A.hitFx ? P.accent : P.ink;
    ctx.strokeStyle = mc; ctx.globalAlpha = 0.9;
    ctx.strokeRect(ax - 5, ay - 5, 10, 10);
    ctx.globalAlpha = 1;
    px(ax - 7, ay, 3, 1, mc); px(ax + 5, ay, 3, 1, mc);
    px(ax, ay - 7, 1, 3, mc); px(ax, ay + 5, 1, 3, mc);
  }

  // ---- MIRA DE SUELTA: donde va a caer la bomba si la soltas AHORA ----
  // La bomba hereda 100 m/s y cae con gravedad real: a 35 m de altura el adelanto son ~270 metros.
  // Sin esta marca la suelta es adivinar. Es la unica asistencia que el modo se permite
  // (PROPUESTAS §3.4) y por eso es DISCRETA: dice donde cae, no si esta bien.
  // Y DESAPARECE EN EL RAS: abajo de SAPITO_ALT_M no hay marca (RF-07, "sin asistencia de mira: es
  // a ojo"). El sapito es el premio del que sabe, y con la mira puesta dejaba de ser un premio.
  const ip = A.pos.y >= PS.SAPITO_ALT_M ? w.impact : null;
  if (ip) {
    const bp = world3D.project(ip.x, ip.y, ip.z);
    if (bp.vis) {
      // ENCIMA DEL BUQUE la marca se pone CALIENTE y crece: es el mismo instante que canta el
      // contador de abajo y que toca el tic-tac. Tres sentidos diciendo lo mismo — el que mira el
      // mar lo ve, el que mira el tablero lo lee y el que mira nada lo escucha.
      const abierta = A.cue === 0;
      const dulce = A.banda === 'dulce';
      ctx.strokeStyle = abierta ? P.warn : dulce ? P.accent : P.dim;
      ctx.globalAlpha = abierta ? 1 : dulce ? 0.9 : 0.55;
      ctx.beginPath(); ctx.arc(bp.x, bp.y, abierta ? 6 : 4, 0, 7); ctx.stroke();
      px(bp.x - 6, bp.y, 3, 1, ctx.strokeStyle); px(bp.x + 4, bp.y, 3, 1, ctx.strokeStyle);
      if (abierta && Math.sin(A.t * 18) > -0.2) {
        ctx.beginPath(); ctx.arc(bp.x, bp.y, 9, 0, 7); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---- LA ESCALERA DE ARMADO: la altura de suelta, dibujada ----
  // La palabra sola (DULCE / DORMIDA / ALTA) no dice CUANTO falta ni PARA DONDE. Esto es la misma
  // regla como regla de medir: la franja clara es la banda que arma, la marca sos vos, y de un
  // vistazo se ve si hay que bajar o aguantar. Es lo que convierte los tres resultados de la
  // suelta —que hasta ahora eran magia— en una decision de palanca.
  if (A.doneT <= 0 && !A.spent) {
    const lx = 8, ly0 = 30, lh = H - 62;             // de arriba del tablero hasta debajo del titulo
    const ALT_TOP = 90;                              // tope de la regla en metros (arriba de ALTA)
    const my = a => ly0 + lh * (1 - Math.max(0, Math.min(1, a / ALT_TOP)));
    px(lx, ly0, 1, lh, '#2e3c45');
    const yA = my(PS.BAND_SWEET_MAX), yB = my(PS.BAND_ARM_MIN);
    px(lx - 1, yA, 3, yB - yA, '#1d3a3f');           // la franja que ARMA
    px(lx - 2, yA, 5, 1, P.accent); px(lx - 2, yB, 5, 1, P.accent);
    // el TECHO DE RADAR es otra linea de decision en el mismo eje (RF-03), asi que va en la misma
    // regla: abajo de ella el Sea Dart no te ve. Punteada para no competir con la banda.
    const yR = my(PS.RADAR_CEIL_M);
    for (let i = 0; i < 6; i += 2) px(lx + 4 + i, yR, 1, 1, P.foam);
    const yMe = my(A.pos.y);
    const col = A.banda === 'dulce' ? P.accent : A.banda === 'dormida' ? '#ff5340' : P.dim;
    px(lx - 4, yMe - 1, 4, 3, col);                  // la marca del avion, del color de su banda
  }

  // ---- EL CONTADOR DE SUELTA: cuantos metros faltan volar para tirar ----
  // El pedido del autor, literal: "al volar no se cuando disparar". Este es el renglon que lo
  // contesta, y contesta DOS cosas con un solo numero:
  //   hay numero  → tu rumbo cruza el buque, y faltan tantos metros
  //   AHORA       → la bomba pega si soltas en este instante
  //   SIN LINEA   → no estas encarado; soltar es tirarle al mar
  // Va bajo el centro y no en el tablero porque en la corrida los ojos estan en el mar, no abajo.
  // Y NO aparece en el ras del sapito: RF-07 pide que esa suelta sea a ojo, y un contador la
  // convertiria en apretar cuando lo dice el cartel.
  // (RF-15: con la pasada ya gastada no hay nada que decidir — el renglon se apaga y deja ver
  // el veredicto, que es lo unico que importa en esos ultimos segundos)
  if (A.doneT <= 0 && !A.spent && A.bombs > 0 && A.pos.y >= PS.SAPITO_ALT_M) {
    // ARRIBA, en la franja de cielo bajo el letterbox. Abajo del centro se leia SOBRE EL TABLERO
    // de la cabina —medido en captura, ilegible— y esa franja es la unica que esta despejada en
    // las DOS camaras: en 1a persona la ocupa el parabrisas y en 3a, el cielo.
    const cy = 27;
    ctx.textAlign = 'center';
    if (A.cue === 0) {
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = Math.sin(A.t * 18) > -0.2 ? P.warn : P.accent;
      ctx.fillText(T('pasada_now'), W / 2, cy);
    } else if (A.gate) {
      // volviendo: "SIN LINEA" seria una obviedad — claro que no estas encarado, estas dando la
      // vuelta. Lo que hace falta saber ahi es que ESTO es una maniobra, que tiene nombre, y
      // CUANTO falta para virar.
      //
      // El numero va acá y no solo en la marca del mundo porque la marca se pierde: en la
      // geometria del egreso (salis a 1150 m y la puerta esta a 1360) queda casi encima tuyo y un
      // poco por debajo, o sea tapada por el tablero — medido en captura, no se veia. Un renglon
      // no se pierde nunca, y la pregunta que contesta es la unica de esa parte de la corrida.
      ctx.font = '7px monospace'; ctx.fillStyle = P.foam; ctx.globalAlpha = 0.8;
      ctx.fillText(T('pasada_reencare'), W / 2, cy);
      ctx.globalAlpha = 1;
      const gx = A.gate.x - A.pos.x, gz = A.gate.z - A.pos.z;
      const yendo = gx * A.vel.x + gz * A.vel.z > 0;      // ¿la puerta todavia esta adelante?
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = yendo ? P.foam : P.warn;
      ctx.fillText(yendo ? T('pasada_turn_in') + '  ' + (Math.hypot(gx, gz) | 0) + ' m'
        : T('pasada_turn_now'), W / 2, cy + 10);
    } else if (A.cue === null) {
      ctx.font = '7px monospace'; ctx.fillStyle = P.dim; ctx.globalAlpha = 0.7;
      ctx.fillText(T('pasada_noline'), W / 2, cy);
      ctx.globalAlpha = 1;
    } else {
      // el numero, y debajo la BARRA que se llena: el numero se lee, la barra se ve de reojo —
      // que es como se mira un tablero en una corrida de verdad
      ctx.font = 'bold 9px monospace'; ctx.fillStyle = P.foam;
      ctx.fillText(T('pasada_cue') + '  ' + (Math.round(A.cue / 5) * 5) + ' m', W / 2, cy);
      const CUE_VIEW = 600, bw = 78;
      const k = Math.max(0, Math.min(1, 1 - A.cue / CUE_VIEW));
      px(W / 2 - bw / 2, cy + 4, bw, 2, '#2e3c45');
      px(W / 2 - bw / 2, cy + 4, bw * k, 2, k > 0.8 ? P.warn : P.foam);
    }
  }

  // ---- flecha al buque si quedo fuera de cuadro ----
  const sp = world3D.project(0, 20, 0);
  if (!sp.vis || sp.x < 8 || sp.x > W - 8 || sp.y < 16 || sp.y > H - 16) shipArrow(sp);

  // ---- letterbox + tablero ----
  ctx.fillStyle = '#05080b'; ctx.fillRect(0, 0, W, 13); ctx.fillRect(0, H - 13, W, 13);
  ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = P.warn;
  ctx.fillText(T('pasada_title') + '  ·  ' + objectiveShip, W / 2, 9);

  if (dmgShown()) {
    const iv = Math.max(0, Math.min(1, run.integ / 100));
    px(6, 5, 44, 3, '#2e3c45');
    px(6, 5, 44 * iv, 3, iv <= 0.25 ? (Math.sin(A.t * 10) > 0 ? '#ff5340' : P.warn) : iv <= 0.5 ? P.warn : P.foam);
  }

  // ---- LA NAFTA, EL RELOJ DE TU CORRIDA (RF-10 + RF-15) ----
  // Tiene que estar A LA VISTA desde que secar el tanque cuesta un avion: un final que el jugador
  // no vio venir no enseña nada, enseña que el juego hace trampa. Va arriba a la derecha, en
  // espejo de la integridad, porque las dos contestan lo mismo — cuanto te queda de ESTE avion.
  // Se apaga entera con [M] COMBUSTIBLE: NO, igual que en el resto del juego.
  if (cfg.fuelOn) {
    const fv = Math.max(0, Math.min(1, run.fuel / PS.PASS_TANK));
    px(W - 50, 5, 44, 3, '#2e3c45');
    // el ultimo cuarto PARPADEA: es el aviso de que se te viene el peor de los finales — perder
    // el avion sin haber tirado. Que el jugador tire "como venga" a esa altura es lo buscado.
    px(W - 50, 5, 44 * fv, 3, fv <= 0.25 ? (Math.sin(A.t * 9) > 0 ? '#ff5340' : P.warn) : fv <= 0.5 ? P.warn : P.foam);
    ctx.font = '6px monospace'; ctx.textAlign = 'right'; ctx.fillStyle = fv <= 0.25 ? '#ff5340' : P.dim;
    ctx.fillText(T('pasada_fuel'), W - 52, 8);
  }

  // ALTURA con el TECHO DE RADAR como referencia: es el unico numero que en esta fase decide algo
  // por si solo (RF-03 — abajo del techo el Sea Dart no existe), asi que se pinta distinto cuando
  // estas a ras. El indicador completo de la banda de armado llega en P5.
  ctx.font = '6px monospace'; ctx.textAlign = 'left';
  const bajo = A.pos.y < PS.RADAR_CEIL_M;
  ctx.fillStyle = bajo ? P.foam : P.dim;
  ctx.fillText('ALT ' + (A.pos.y | 0) + ' m', 6, H - 4);
  // BANDA DE ARMADO al lado de la altura: es la MISMA información leída de otra manera, y sin ella
  // los tres resultados de la suelta son magia. (El indicador grande es P5; esto es la palabra.)
  const bandaCol = A.banda === 'dulce' ? P.accent : A.banda === 'dormida' ? '#ff5340' : P.dim;
  ctx.fillStyle = bandaCol;
  ctx.fillText(T('pasada_band_' + (A.banda || 'dormida')), 52, H - 4);
  ctx.fillStyle = P.dim;
  ctx.fillText('VEL ' + ((A.spd * 3.6) | 0) + ' km/h', 100, H - 4);
  ctx.fillText(T('pasada_run') + ' ' + A.corrida, 156, H - 4);
  // LA RISTRA: una casilla por bomba, pegada al numero de corrida — las dos cuentan lo mismo,
  // cuanto te queda de ESTA pasada. El renglon es de 480 px y esta medido: ALT 6 · banda 52 ·
  // VEL 100 · CORRIDA 156 · ristra 196 · zonas al centro (223) · INTENTOS 265 y sus casillas a
  // +40 del bloque de zonas. Si se agrega algo, se mide de nuevo: acá ya se encimo dos veces —
  // la ultima, la etiqueta contra sus propias casillas (medido en captura, 3 px).
  for (let i = 0; i < PS.BOMBS_N; i++)
    px(196 + i * 6, H - 8, 4, 3, i < A.bombs ? P.warn : '#2e3c45');

  // DISTANCIA AL BUQUE, al ras del borde derecho: el otro numero que el autor pidio. Es la que
  // ordena la corrida entera —cuando cortan los spawns, cuando salta la ventana, cuando se repone
  // la ristra— y hasta ahora habia que adivinarla mirando el tamaño del barco.
  ctx.textAlign = 'right'; ctx.fillStyle = A.rad < PS.POPUP_DIST_M ? P.foam : P.dim;
  ctx.fillText(T('pasada_ship') + ' ' + (A.rad | 0) + ' m', W - 6, H - 4);
  ctx.textAlign = 'left';

  // zonas como casillas (progreso del asalto) + escuadron
  const zw = zones.length * 7;
  for (let i = 0; i < zones.length; i++)
    px(W / 2 - zw / 2 + i * 7, H - 9, 5, 3, zones[i].hp <= 0 ? P.warn : '#2e3c45');
  if (run.squad > 1) {
    ctx.textAlign = 'left'; ctx.fillText(T('pasada_tries'), W / 2 + zw / 2 + 8, H - 4);
    for (let i = 0; i < run.squad; i++)
      px(W / 2 + zw / 2 + 40 + i * 6, H - 9, 4, 3, i < run.lives ? P.accent : '#2e3c45');
  }

  // ---- AVISO DE MAR: la contracara de volar a ras. El mar puede matar, no puede matar en silencio ----
  if (A.lowT > 0 && A.doneT <= 0) {
    ctx.globalAlpha = 0.28 + 0.22 * Math.sin(A.t * 16);
    const g = ctx.createLinearGradient(0, H - 46, 0, H);
    g.addColorStop(0, '#ff534000'); g.addColorStop(1, '#ff5340');
    ctx.fillStyle = g; ctx.fillRect(0, H - 46, W, 46);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.font = 'bold 9px monospace';
    ctx.fillStyle = Math.sin(A.t * 16) > 0 ? '#ff5340' : P.warn;
    ctx.fillText(T('arena_low'), W / 2, H - 24);
  }

  // ---- la correa de la zona: aviso y piloto automatico ----
  // (los dos bajaron de 30 y 21 a 44 y 54: arriba ahora vive el contador de suelta, que se mira
  // mil veces por corrida — estos dos son avisos de a ratos y ceden el lugar)
  ctx.textAlign = 'center';
  if (A.auto) {
    ctx.font = 'bold 8px monospace'; ctx.fillStyle = P.warn;
    ctx.fillText(T('arena_auto'), W / 2, 44);
  } else if (A.outT > 0) {
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = Math.sin(A.t * 14) > 0 ? P.warn : P.dim;
    ctx.fillText(T('arena_out'), W / 2, 44);
  }
  if (A.doneT <= 0 && A.t < 4) {
    ctx.font = '6px monospace'; ctx.fillStyle = P.dim;
    ctx.fillText(T('pasada_hint'), W / 2, 54);
  }
}
