// EL MOTOR DE PASOS DEL TUTORIAL (docs/sistemas/PLAN_TUTORIAL.md §3; los pasos, en data/tutorial.js).
//
// Un paso pasa por cuatro momentos:
//   espera    un respiro entre paso y paso (el mundo corre)
//   intro     sus lineas, UNA POR VEZ: `tick` devuelve { tipo: 'decir' } y game.js congela el mundo
//             con esa linea (la pausa de las lecciones). La siguiente sale recien cuando el jugador
//             la acepta — game.js no llama a `tick` mientras el dialogo esta congelado.
//   practica  las condiciones de `sigue`, en orden. Cumplida una, queda tildada OK_T segundos y pasa
//             a la que sigue (la consigna de arriba muestra el tilde)
//   remate    la linea de radio del final, sin pausa
// Un paso con `cuando` no arranca su intro hasta que llega ese momento del vuelo (el buque cerca, la vuelta,
// la aproximacion final): asi la etapa 3 sigue a la mision y no al reves.
// Al terminar el ultimo paso devuelve { tipo: 'fin' }.
//
// No sabe nada del juego: le llega una foto (`s`) con lo que necesita leer, y devuelve que hay que
// hacer. Asi se prueba en Node (tools/unit.js) sin abrir una ventana.

const ESPERA = 1.4;       // segundos entre un paso y el siguiente
const ESPERA_0 = 0;       // …y antes del primero: NINGUNO (21/11, el autor: "el juego deberia arrancar en pausa")
const OK_T = 1.1;         // el tilde de una consigna cumplida, antes de pasar a la siguiente

let tp = 0;   // segundos de practica del paso en curso
let trabaL = 0;   // lineas ya dichas de `alTrabar` en el paso en curso
let pasos = [], i = 0, fase = 'espera', t = 0, linea = 0, sub = 0, okT = 0, acum = 0, vistos = {}, base = {}, fin = true;

/** Arranca una lista de pasos (vacia = apagado), desde el primero — o desde `desde` (25/11: al reintentar despues de
 *  morir, se retoma en el paso donde se cayo). */
export function empezar(lista, desde = 0) {
  pasos = lista || []; i = Math.max(0, Math.min(desde | 0, Math.max(0, pasos.length - 1))); fin = !pasos.length;
  entrar();
}
function entrar() { trabaL = 0; fase = 'espera'; t = 0; linea = 0; sub = 0; okT = 0; acum = 0; vistos = {}; }

/** ¿Hay un tutorial corriendo y sin terminar? */
export const activo = () => !fin;

/** Los blancos de practica del paso en curso mientras se practica (game.js los siembra), o null. */
export const blancos = () => (!fin && fase === 'practica' && okT <= 0 && pasos[i] && (pasos[i].sigue || [])[sub] ? pasos[i].blancos || null : null);
/** EL MISIL DE PRACTICA del paso en curso ('frente' | 'cola') mientras se practica (game.js lo tira), o null. */
/** EL MISIL QUE LLEGA ANTES DE LA CHARLA (`misilPrimero`, 26/11): mientras el paso espera su intro, el misil del paso ya
 *  viene — la pausa lo explica con el misil a la vista (`cuando: { misil: true }`). */
export const misilAntes = () => (!fin && fase === 'espera' && pasos[i] && pasos[i].misilPrimero ? pasos[i].misil || null : null);
/** ¿TODAVIA NO SE ENSEÑO LA NAFTA? (27/11, el autor: "se me gasta la nafta apenas entro en radar y la chancha no viene
 *  a recargar"): mientras falte el paso con `nafta`, game.js no deja que el tanque baje de un piso. */
/** ¿EL AVION ESPERA EN LA CABECERA? (27/11, el autor: "el primer despegue siempre se erra porque desde que te dicen que
 *  presiones el gas hasta que se acaba la pista nunca llegas"): hasta que se PRACTICA el paso del despegue (`despega`), la
 *  carrera no rueda — antes se comia la pista a paso de hombre durante el saludo y los mandos. */
export function despegueEspera() {
  if (fin) return false;
  const k = pasos.findIndex(p => (p.sigue || []).some(c => c.despega));
  return k >= 0 && (i < k || (i === k && fase !== 'practica'));
}
/** ¿Esta etapa enseña la nafta? (la 3; en las otras la nafta solo baja de adorno, con un piso alto — 27/11) */
export const ensenaNafta = () => pasos.some(p => p.nafta != null);
export const naftaPendiente = () => !fin && pasos.slice(i).some(p => p.nafta != null);
export const misilPractica = () => (!fin && fase === 'practica' && okT <= 0 && pasos[i] && (pasos[i].sigue || [])[sub] ? pasos[i].misil || null : null);

/** Lo que el jugador tiene que hacer AHORA, o null: { clave, n, prog, hecho }. `n` es el numero de la
 *  condicion (la altura, los segundos, los obstaculos) y `prog` cuanto lleva, si es de las que se cuentan. */
export function consigna() {
  if (fin || fase !== 'practica') return null;
  const c = (pasos[i].sigue || [])[sub];
  if (!c) return null;
  const n = c.altSobre ?? c.altBajo ?? c.bajoTecho ?? c.pasa ?? c.rompe ?? c.despeja ?? c.aciertos ?? c.esquiva ?? (c.misil ? c.n || 1 : null) ?? (c.usa ? c.usa.length : null);
  const prog = c.bajoTecho != null ? Math.min(c.bajoTecho, acum)
    : c.pasa != null ? Math.min(c.pasa, acum)
    : c.rompe != null ? Math.min(c.rompe, acum)
    : c.despeja != null ? Math.min(c.despeja, acum)
    : c.aciertos != null ? Math.min(c.aciertos, acum)
    : c.esquiva != null ? Math.min(c.esquiva, acum)
    : c.misil ? Math.min(c.n || 1, acum)
    : c.usa ? c.usa.filter(k => vistos[k]).length : null;
  return { clave: c.consigna, n, prog, hecho: okT > 0, ok: okT > 0 ? okT / OK_T : 0, tp, teclas: pasos[i].teclas || [], segs: c.bajoTecho != null };
}

/** ¿Faltan pasos ANTES de la aproximacion final? Mientras si, game.js no deja empezar el aterrizaje: la vuelta
 *  sigue hasta que se dijo y se practico todo lo que va en ella (el tonel, las piruetas). */
export function antesDeAterrizar() {
  if (fin) return false;
  const k = pasos.findIndex(p => p.cuando && p.cuando.aterrizando);
  return k >= 0 && i < k;
}

/** ¿Falta llegar al paso que espera el BUQUE (`cuando.faltan`)? Mientras si, game.js no deja que el buque salga de la
 *  bruma: el radar y el secundario se enseñan antes, y "ahi esta el buque" no puede llegar cuando ya lo pasaste
 *  (21/11, el autor: "ya lo pase, ya le di, ya aparecio escapa, y Pichon dice ahi esta el buque"). */
export function esperaBlanco() {
  if (fin) return false;
  const k = pasos.findIndex(p => p.cuando && p.cuando.faltan != null);
  return k >= 0 && i < k;
}

/** Para las sondas y los fixtures. */
/** La linea de la intro que se esta mostrando (1, 2, 3…), o 0 — la lamina del RASANTE enfoca su paso (27/11). */
export const lineaIntro = () => (fase === 'intro' ? linea : 0);
export const estado = () => ({ paso: i, id: pasos[i] ? pasos[i].dice : null, fase, sub, fin, n: pasos.length });
/** ¿El paso actual es la PRACTICA LIBRE (se termina desde la pausa)? */
export const libre = () => !fin && fase === 'practica' && !!(pasos[i] && pasos[i].libre);

const USA_T = 0.4;   // s que hay que sostener cada mando de un paso `usa`
/** ¿Se cumple la condicion `c` con la foto `s`? Las que se cuentan acumulan en `acum`. */
function cumple(c, s, dt) {
  if (c.despega) return !!s.enVuelo;
  if (c.altSobre != null) return s.alt > c.altSobre;
  if (c.altBajo != null) return s.alt < c.altBajo;
  if (c.bajoTecho != null) {
    if (s.roza) acum = 0;
    // (`techo` propio del paso: el rasante del tutorial, 5 m). (25/11, el autor: "estaba a 5 y no contaba"): el altimetro
    // REDONDEA (render/hud.js), asi que con techo propio vale todo lo que se lee como 5 o menos: hasta 5,5
    else if (s.alt < (c.techo != null ? c.techo + 0.5 : s.techo + 1e-9)) acum += dt;
    return acum >= c.bajoTecho;
  }
  if (c.usa) {
    // (21/11, el autor: "rolar no toma bien: toma cualquier pirueta o movimiento para los lados"): antes alcanzaba UN
    // cuadro con el mando tocado —un toque al pasar, una pirueta en curso—. Ahora hay que SOSTENERLO `USA_T` s, y lo
    // que se hace durante una pirueta (`s.mv`) no cuenta: es la pirueta la que mueve el avion, no el mando pedido
    for (const k of c.usa) {
      const on = s.inp && s.inp[k] && !s.mv;
      vistos['t_' + k] = on ? (vistos['t_' + k] || 0) + dt : 0;
      if (vistos['t_' + k] >= USA_T) vistos[k] = true;
    }
    return c.usa.every(k => vistos[k]);
  }
  if (c.pasa != null) { acum = s.pasados - base.pasados; return acum >= c.pasa; }
  if (c.rompe != null) { acum = s.rotos - base.rotos; return acum >= c.rompe; }
  // DESPEJAR (26/11, el autor: "en etapa 2 esquive y/o dispare globos"): cuenta igual romperlo o esquivarlo
  if (c.despeja != null) { acum = (s.rotos - base.rotos) + ((s.esquivados || 0) - (base.esquivados || 0)); return acum >= c.despeja; }
  if (c.esquiva != null) { acum = (s.esquivados || 0) - (base.esquivados || 0); return acum >= c.esquiva; }
  // EL SIDEWINDER ESQUIVADO (23/11, el autor: "el tutorial debe explicarme como esquivar un misil de frente con piruetas, o
  // desde atras; tiene que tener ambas cosas"): `misil: 'frente' | 'cola'`, `n` cuantos (1 si no dice)
  if (c.misil) { acum = ((s.misEsq || {})[c.misil] || 0) - ((base.misEsq || {})[c.misil] || 0); return acum >= (c.n || 1); }
  // EL CALOR: hay que trabarlo (overheat) y esperar a que se destrabe
  if (c.calienta) { if (s.overheat) vistos.over = true; return !!vistos.over && !s.overheat; }
  // LA ETAPA 3: una pirueta hecha (run.mv), una bomba en el aire, el buque hundido, el tren abajo, las ruedas
  // en la pista, y la pausa guiada cerrada (el motor no corre con la pausa abierta: si corre, se cerro)
  if (c.maniobra) { if (s.mv === c.maniobra) vistos.mv = true; return !!vistos.mv && !s.mv; }
  if (c.suelta) return s.bombasVuelo > 0;
  if (c.hunde) return !!s.climaxHecho;
  // la practica libre: el jugador eligio TERMINAR ETAPA en la pausa
  if (c.termina) return !!s.termina;
  // la bomba ya pego en el blanco (el buque tiene daño)
  if (c.pega) return !!s.pego;
  if (c.tren) return !!s.tren;
  if (c.aterriza) return !!s.aterrizo;
  if (c.cierra) return !s.pausado;
  if (c.secundaria) return s.secundaria === c.secundaria;
  if (c.momentum) return !!s.momentum;
  // la barra del MOMENTUM se volvio a llenar sola (y no esta lanzado)
  if (c.momentumLleno) return !!s.momentumLleno;
  // EL RASANTE (19/11, el autor: "tiene que enseñarme como funciona"): entrar al estado (4 s de PERFECTO),
  // acertar el azul de la barrita (se suman entre entradas: perder el estado no borra lo hecho) y soltarlo
  if (c.aguante) return !!s.aguante;
  if (c.aciertos != null) {
    const k = s.aguante ? s.aguN || 0 : 0;
    if (k > (vistos.aguN || 0)) acum += k - (vistos.aguN || 0);
    vistos.aguN = k;
    return acum >= c.aciertos;
  }
  if (c.rasante) return !!s.rasante;
  if (c.salSobre != null) return (s.sal || 0) >= c.salSobre;     // LA SAL: juntarla volando al ras…
  if (c.salBajo != null) return (s.sal || 0) <= c.salBajo;
  // (25/11, el autor: "llegas a -1° y te podes quedar arriba para siempre, nada te dice que bajes"): el paso se cumple con
  // el TERMOMETRO en `frio` grados (lo que dice la consigna) o con el hielo ya pegado, lo que llegue primero
  if (c.frio != null) return (s.temp != null && Math.round(s.temp) <= c.frio) || (s.hielo || 0) >= (c.hieloSobre ?? 0.15);
  // …y para cerrarlo hay que BAJAR al ras con el hielo derretido (sin hielo juntado, bajar igual: si no se cumplia arriba)
  if (c.deshiela) return (s.hielo || 0) <= c.deshiela.hielo && s.alt < c.deshiela.alt;
  if (c.hieloSobre != null) return (s.hielo || 0) >= c.hieloSobre;   // EL HIELO (systems/frio.js): juntarlo en la nube…
  if (c.hieloBajo != null) return (s.hielo || 0) <= c.hieloBajo;     // …y sacarselo al ras del mar
  if (c.marca) return !!s.marca;                                     // LAS ISLAS: un punto marcado en el MAPA de la pausa
  if (c.objIslas) return !!s.objIslas;                               // …y la BASE COSTERA rota
  // LEJOS DEL BUQUE (25/11): `pasado` = fraccion del camino al blanco recorrida MAS ALLA de el, ya en la vuelta
  if (c.pasado != null) return !!s.climaxHecho && 1 - s.faltan >= 1 + c.pasado;
  if (c.chancha) return !!s.chancha;
  if (c.chafitas) return !!s.chafitas;                               // LAS CHAFITAS: una nube en el aire
  return true;
}

/** ¿Llego el MOMENTO del paso? (`cuando`: su intro espera a que pase algo en el vuelo, no solo el respiro) */
function llego(q, s) {
  if (!q) return true;
  // (si el momento ya paso —el buque quedo atras—, el paso arranca igual: nunca se queda esperando)
  if (q.faltan != null) return !!s.climaxHecho || s.faltan <= q.faltan;   // (fraccion del camino al blanco)
  if (q.vuelta) return !!s.climaxHecho && s.enVuelo;
  if (q.aterrizando) return !!s.aterrizando;
  if (q.misil) return !!s.misilVivo;
  if (q.rasanteFin) return !s.rasante;   // (el poder RASANTE ya se termino: 27/11)   // (el misil del paso ya viene: misilAntes)
  return true;
}

/** Un cuadro. `s` = { alt, techo, roza, inp, pasados }; `escenas` = SCENES (para leer las lineas).
 *  Devuelve null o una accion: { tipo: 'decir', linea, foco, teclas } · { tipo: 'mundo', paso } ·
 *  { tipo: 'radio', linea } · { tipo: 'fin', linea }. */
export function tick(dt, s, escenas) {
  if (fin) return null;
  const p = pasos[i];
  // EL PASO DE UN SOLO MODO (`vert`, 23/11: el sostén de SUAVE): con otro GAS MODO se saltea entero
  if (fase === 'espera' && p.vert && !p.vert.includes(s.vert)) {
    i++;
    if (i >= pasos.length) { fin = true; return { tipo: 'fin', linea: null }; }
    entrar(); return null;
  }
  if (fase === 'espera') {
    t += dt;
    if (t < (i === 0 ? ESPERA_0 : ESPERA) || !llego(p.cuando, s)) return null;
    // EL PASO QUE MARCA INDICADORES ESPERA AL TABLERO (21/11, el autor: "no muestres dialogo que marque un indicador que
    // todavia no se esta mostrando"): en el despegue automatico de las etapas 2 y 3 el tablero entra recien al tomar
    // el control, con un fundido (game.js `hudEntra`) — `s.hud` dice si ya esta entero en pantalla
    if (p.foco && p.foco.length && s.hud === false) return null;
    fase = 'intro'; linea = 0;
  }
  // UNO A LA VEZ (19/11): mientras la radio en vuelo esta diciendo algo (el remate, un aviso), la
  // pausa de dialogo espera a que se calle — si no, la congelada le pisa la linea a mitad de leer
  // (27/11, el autor: "mientras habla el Turco… los segundos de volar cercano al mar bajo los 5 metros"): si ya no quedan
  // lineas —la ultima fue radio en vuelo—, la practica y su contador arrancan mientras habla
  if (fase === 'intro' && s.radio && linea < ((escenas[p.dice] || {}).lineas || []).length) return null;
  if (fase === 'intro') {
    const ls = (escenas[p.dice] || {}).lineas || [];
    if (linea < ls.length) {
      const ln = ls[linea++];
      // (la charla que no enseña va por la radio en vuelo y no frena: data/tutorial.js `B`)
      if (ln.ingame) return { tipo: 'radio', linea: ln };
      return { tipo: 'decir', linea: ln, foco: p.foco || [], teclas: p.teclas || [], mando: !!p.mando, demo: p.demo || null };
    }
    fase = 'practica'; tp = 0; sub = 0; acum = 0; vistos = {}; okT = 0; base = { pasados: s.pasados, rotos: s.rotos, esquivados: s.esquivados || 0, misEsq: { ...(s.misEsq || {}) } };
    return { tipo: 'mundo', paso: p };
  }
  if (fase === 'practica') {
    tp += dt;
    // AL TRABARSE EL CAÑON (26/11, el autor: "que lo de trabar la metralleta ocurra dentro de esa eliminacion de 10
    // globos"): `alTrabar` = la escena que va por radio, sin frenar, la primera vez que se recalienta en este paso
    if (p.alTrabar && (trabaL > 0 || s.overheat) && !s.radio) {
      const ls = (escenas[p.alTrabar] || {}).lineas || [];
      if (trabaL < ls.length) return { tipo: 'radio', linea: ls[trabaL++] };
    }
    const c = (p.sigue || [])[sub];
    if (c) {
      if (okT > 0) {
        okT -= dt;
        if (okT <= 0) { sub++; acum = 0; vistos = {}; base = { pasados: s.pasados, rotos: s.rotos, esquivados: s.esquivados || 0, misEsq: { ...(s.misEsq || {}) } }; }
        return null;
      }
      if (cumple(c, s, dt)) okT = OK_T;
      return null;
    }
    // sin (mas) condiciones: el remate y al paso siguiente
    // (21/11, el autor: "pajarracos hecho pingo quedo cortado"): si la ultima linea del paso fue de radio en vuelo (`B`),
    // el remate la pisaba en el mismo cuadro. El remate espera a que la radio se calle
    if (p.remate && s.radio) return null;
    const rem = p.remate && escenas[p.remate] ? escenas[p.remate].lineas[0] : null;
    i++;
    if (i >= pasos.length) { fin = true; return { tipo: 'fin', linea: rem }; }
    entrar();
    return rem ? { tipo: 'radio', linea: rem } : null;
  }
  return null;
}

// SONDA (21/11): saltar al paso que dice `id` (p. ej. 'TUT1_ROLAR'), para mirarlo sin volar todo lo de antes
if (typeof window !== 'undefined') window.__tutIr = (id, practica) => { const k = pasos.findIndex(p => p.dice === id); if (k < 0) return false; i = k; entrar();
  if (practica) { fase = 'practica'; sub = 0; acum = 0; vistos = {}; okT = 0; base = { pasados: 0, rotos: 0, esquivados: 0, misEsq: {} }; } return true; };
