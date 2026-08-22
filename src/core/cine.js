// EL DIRECTOR — la matematica PURA de una timeline (docs/sistemas/PLAN_DIRECTOR_CINEMATICAS.md).
//
// Mismo lugar y misma razon que core/pulso.js y core/squad.js: cero dependencias, cero estado, y
// por eso se prueba en node (`npm run unit`). systems/cine.js es el que tiene efectos —sonido,
// piruetas, fundidos— y esto es solo el CALENDARIO: que beat cae en que segundo, en que parte
// estamos, y cuando se termino.
//
// Se parte en dos por una razon concreta: systems/cine.js importa moves.js y audio.js, que tocan
// `document` y `AudioContext`. Un calendario que no se puede probar sin abrir una ventana es
// exactamente el tipo de cosa que se rompe en silencio: una cinematica desfasada medio segundo no
// da error, solo se ve mal, y eso se descubre mirando.
//
// UNA TIMELINE es una lista de BEATS `{ t, ...verbos }` con `t` en segundos REALES desde que
// arranco. Nada de esto sabe que verbos existen: para el calendario, un beat es un instante.

/** Resuelve un valor con LIGADURA: '$loQueSea' sale de `vars`, el resto pasa tal cual.
 *
 *  Es el unico mecanismo de "parametro" de las timelines, y cubre todo lo que una cinematica
 *  necesita saber en runtime y no puede estar escrito en data: cual pirueta se tecleo, que tan
 *  grande es el estallido de ESTA zona, cuanto tarda en hundirse ESTE buque. Sin esto, la mitad
 *  de las cinematicas tendrian que vivir en codigo (plan §6.5). */
export function lig(v, vars) {
  if (typeof v !== 'string' || v[0] !== '$') return v;
  return (vars || {})[v.slice(1)];
}

/** EL INSTANTE de un beat. Tres formas, de menor a mayor: un numero, una ligadura, o una SUMA
 *  (array de numeros y ligaduras).
 *
 *  La suma existe por un motivo concreto: **un compas tiene que poder durar lo que dura la cosa
 *  que muestra.** El de la pirueta duraba 1,15 s fijos y el SPLIT-S 1,15 — pero el BREAK TURN dura
 *  0,7, y el compas seguia durando lo mismo: medio segundo de avion nivelado sin nada que pase.
 *  Con `['$tPir', 0.85]` el instante se lee "0,85 s despues de que termine LA maniobra", y toda la
 *  escalera se corre sola sin que los tiempos se vuelvan codigo (PLAN_CINE_PESO P3).
 *
 *  SI ALGUN TERMINO QUEDA SIN LIGAR, la suma entera queda sin resolver — y el beat no ocurre. Es
 *  la misma regla de siempre, que es lo que deja escribir "esto pasa solo a veces" en data. */
export function tiempo(v, vars) {
  if (!Array.isArray(v)) return lig(v, vars);
  let n = 0;
  for (const x of v) {
    const r = lig(x, vars);
    if (typeof r !== 'number' || !isFinite(r)) return undefined;
    n += r;
  }
  return n;
}

/** Resuelve los `$` de UN beat, un nivel adentro de sus verbos (que es lo que hay). */
function ligBeat(b, vars) {
  const o = {};
  for (const k in b) {
    const v = b[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const sub = {};
      for (const k2 in v) sub[k2] = lig(v[k2], vars);
      o[k] = sub;
    } else o[k] = lig(v, vars);
  }
  return o;
}

/** El CALENDARIO de una timeline: beats con `t` numerico, ordenados, listos para disparar.
 *
 *  UN BEAT CUYO `t` NO SE PUDO RESOLVER SE CAE. No es un error: es como se escribe "esto pasa
 *  solo a veces" sin un `if` en el interprete. El segundo estallido del PULSO —el unico que
 *  tiene la zona brava— es exactamente eso: el beat existe en la timeline y sin la ligadura
 *  `$tSec` no ocurre. Lo mismo un beat cuyo verbo quedo sin ligar (`move: '$pirueta'` cuando no
 *  se aprendio ninguna): el instante no tiene nada que hacer y no se agenda.  */
export function armar(tl, vars) {
  const beats = ((tl && tl.beats) || [])
    .map(b => Object.assign(ligBeat(b, vars), { t: tiempo(b.t, vars) }))
    .filter(b => typeof b.t === 'number' && isFinite(b.t))
    .sort((a, b) => a.t - b.t);
  // el orden ESTABLE importa: dos beats en el mismo instante se aplican en el orden en que fueron
  // escritos, y eso es lo que deja poner `parte` antes que el `fx` que la abre
  return beats;
}

/** Los beats que caen en la ventana (t0, t1]. Abierta abajo y cerrada arriba para que ninguno se
 *  dispare dos veces ni se pierda entre cuadros, incluso con un dt grande (una pestaña que vuelve
 *  del fondo puede traer medio segundo de golpe: ahi se disparan varios juntos, que es lo correcto
 *  — la cinematica no se saltea, se pone al dia). */
export const enVentana = (beats, t0, t1) => beats.filter(b => b.t > t0 && b.t <= t1);

/** El instante en que la timeline se termina: el beat `fin`, o el ultimo que haya. */
export function finDe(beats) {
  const f = beats.filter(b => b.fin);
  if (f.length) return f[f.length - 1].t;
  return beats.length ? beats[beats.length - 1].t : 0;
}

/** La PARTE vigente en el segundo `t` (el ultimo beat con `parte` que ya paso), y su ventana.
 *  Devuelve `{ id, t0, t1 }` — `t1` es donde arranca la parte siguiente (o el fin). */
export function parteEn(beats, t) {
  const ps = beats.filter(b => b.parte);
  let cur = null;
  for (const p of ps) { if (p.t <= t) cur = p; else break; }
  if (!cur) return null;
  const sig = ps.find(p => p.t > cur.t);
  return { id: cur.parte, t0: cur.t, t1: sig ? sig.t : finDe(beats) };
}

/** Avance 0..1 dentro de una parte. Es lo que leen los renders que dibujan una curva durante un
 *  tramo (la ristra cayendo, el estallido creciendo) sin tener que saber cuanto dura. */
export function fParte(p, t) {
  if (!p || p.t1 <= p.t0) return 0;
  const f = (t - p.t0) / (p.t1 - p.t0);
  return f < 0 ? 0 : f > 1 ? 1 : f;
}

// LAS CURVAS de las rampas. Una rampa lineal empieza y termina de golpe: el instante en que
// arranca y el instante en que para se NOTAN, y eso es la mitad de lo que hace que una cinematica
// se sienta dura. Son las mismas cuatro que usa cualquier motor de animacion, con nombre en
// castellano porque se escriben en data y las lee gente, no maquinas.
const EASE = {
  lineal: f => f,
  suave: f => f * f * (3 - 2 * f),   // smoothstep: entra y sale sin golpe
  entra: f => f * f,                 // arranca despacio y acelera
  sale: f => 1 - (1 - f) * (1 - f),  // arranca rapido y se asienta
};

/** Interpolacion de una RAMPA: de `a` a `b` en `dur` segundos, ya arrancada hace `t`.
 *  `ease` es el nombre de la curva ('lineal' por defecto — lo que ya estaba escrito no cambia). */
export function rampa(a, b, dur, t, ease) {
  if (!(dur > 0)) return b;
  const f = t / dur;
  if (f <= 0) return a;
  if (f >= 1) return b;
  return a + (b - a) * (EASE[ease] || EASE.lineal)(f);
}
