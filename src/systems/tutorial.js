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
const ESPERA_0 = 1.0;     // …y antes del primero (recien termina el despegue)
const OK_T = 1.1;         // el tilde de una consigna cumplida, antes de pasar a la siguiente

let pasos = [], i = 0, fase = 'espera', t = 0, linea = 0, sub = 0, okT = 0, acum = 0, vistos = {}, base = {}, fin = true;

/** Arranca una lista de pasos (vacia = apagado), siempre desde el primero. */
export function empezar(lista) {
  pasos = lista || []; i = 0; fin = !pasos.length;
  entrar();
}
function entrar() { fase = 'espera'; t = 0; linea = 0; sub = 0; okT = 0; acum = 0; vistos = {}; }

/** ¿Hay un tutorial corriendo y sin terminar? */
export const activo = () => !fin;

/** Los blancos de practica del paso en curso mientras se practica (game.js los siembra), o null. */
export const blancos = () => (!fin && fase === 'practica' && okT <= 0 && pasos[i] && (pasos[i].sigue || [])[sub] ? pasos[i].blancos || null : null);

/** Lo que el jugador tiene que hacer AHORA, o null: { clave, n, prog, hecho }. `n` es el numero de la
 *  condicion (la altura, los segundos, los obstaculos) y `prog` cuanto lleva, si es de las que se cuentan. */
export function consigna() {
  if (fin || fase !== 'practica') return null;
  const c = (pasos[i].sigue || [])[sub];
  if (!c) return null;
  const n = c.altSobre ?? c.altBajo ?? c.bajoTecho ?? c.pasa ?? c.rompe ?? c.aciertos ?? c.esquiva ?? (c.usa ? c.usa.length : null);
  const prog = c.bajoTecho != null ? Math.min(c.bajoTecho, acum)
    : c.pasa != null ? Math.min(c.pasa, acum)
    : c.rompe != null ? Math.min(c.rompe, acum)
    : c.aciertos != null ? Math.min(c.aciertos, acum)
    : c.esquiva != null ? Math.min(c.esquiva, acum)
    : c.usa ? c.usa.filter(k => vistos[k]).length : null;
  return { clave: c.consigna, n, prog, hecho: okT > 0, teclas: pasos[i].teclas || [] };
}

/** ¿Faltan pasos ANTES de la aproximacion final? Mientras si, game.js no deja empezar el aterrizaje: la vuelta
 *  sigue hasta que se dijo y se practico todo lo que va en ella (el tonel, las piruetas). */
export function antesDeAterrizar() {
  if (fin) return false;
  const k = pasos.findIndex(p => p.cuando && p.cuando.aterrizando);
  return k >= 0 && i < k;
}

/** Para las sondas y los fixtures. */
export const estado = () => ({ paso: i, id: pasos[i] ? pasos[i].dice : null, fase, sub, fin, n: pasos.length });

/** ¿Se cumple la condicion `c` con la foto `s`? Las que se cuentan acumulan en `acum`. */
function cumple(c, s, dt) {
  if (c.despega) return !!s.enVuelo;
  if (c.altSobre != null) return s.alt > c.altSobre;
  if (c.altBajo != null) return s.alt < c.altBajo;
  if (c.bajoTecho != null) {
    if (s.roza) acum = 0;
    else if (s.alt <= s.techo) acum += dt;
    return acum >= c.bajoTecho;
  }
  if (c.usa) {
    for (const k of c.usa) if (s.inp && s.inp[k]) vistos[k] = true;
    return c.usa.every(k => vistos[k]);
  }
  if (c.pasa != null) { acum = s.pasados - base.pasados; return acum >= c.pasa; }
  if (c.rompe != null) { acum = s.rotos - base.rotos; return acum >= c.rompe; }
  if (c.esquiva != null) { acum = (s.esquivados || 0) - (base.esquivados || 0); return acum >= c.esquiva; }
  // EL CALOR: hay que trabarlo (overheat) y esperar a que se destrabe
  if (c.calienta) { if (s.overheat) vistos.over = true; return !!vistos.over && !s.overheat; }
  // LA ETAPA 3: una pirueta hecha (run.mv), una bomba en el aire, el buque hundido, el tren abajo, las ruedas
  // en la pista, y la pausa guiada cerrada (el motor no corre con la pausa abierta: si corre, se cerro)
  if (c.maniobra) { if (s.mv === c.maniobra) vistos.mv = true; return !!vistos.mv && !s.mv; }
  if (c.suelta) return s.bombasVuelo > 0;
  if (c.hunde) return !!s.climaxHecho;
  if (c.tren) return !!s.tren;
  if (c.aterriza) return !!s.aterrizo;
  if (c.cierra) return !s.pausado;
  if (c.secundaria) return s.secundaria === c.secundaria;
  if (c.momentum) return !!s.momentum;
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
  if (c.salBajo != null) return (s.sal || 0) <= c.salBajo;
  if (c.chancha) return !!s.chancha;
  return true;
}

/** ¿Llego el MOMENTO del paso? (`cuando`: su intro espera a que pase algo en el vuelo, no solo el respiro) */
function llego(q, s) {
  if (!q) return true;
  // (si el momento ya paso —el buque quedo atras—, el paso arranca igual: nunca se queda esperando)
  if (q.faltan != null) return !!s.climaxHecho || s.faltan <= q.faltan;   // (fraccion del camino al blanco)
  if (q.vuelta) return !!s.climaxHecho && s.enVuelo;
  if (q.aterrizando) return !!s.aterrizando;
  return true;
}

/** Un cuadro. `s` = { alt, techo, roza, inp, pasados }; `escenas` = SCENES (para leer las lineas).
 *  Devuelve null o una accion: { tipo: 'decir', linea, foco, teclas } · { tipo: 'mundo', paso } ·
 *  { tipo: 'radio', linea } · { tipo: 'fin', linea }. */
export function tick(dt, s, escenas) {
  if (fin) return null;
  const p = pasos[i];
  if (fase === 'espera') {
    t += dt;
    if (t < (i === 0 ? ESPERA_0 : ESPERA) || !llego(p.cuando, s)) return null;
    fase = 'intro'; linea = 0;
  }
  // UNO A LA VEZ (19/11): mientras la radio en vuelo esta diciendo algo (el remate, un aviso), la
  // pausa de dialogo espera a que se calle — si no, la congelada le pisa la linea a mitad de leer
  if (fase === 'intro' && s.radio) return null;
  if (fase === 'intro') {
    const ls = (escenas[p.dice] || {}).lineas || [];
    if (linea < ls.length) return { tipo: 'decir', linea: ls[linea++], foco: p.foco || [], teclas: p.teclas || [] };
    fase = 'practica'; sub = 0; acum = 0; vistos = {}; okT = 0; base = { pasados: s.pasados, rotos: s.rotos, esquivados: s.esquivados || 0 };
    return { tipo: 'mundo', paso: p };
  }
  if (fase === 'practica') {
    const c = (p.sigue || [])[sub];
    if (c) {
      if (okT > 0) {
        okT -= dt;
        if (okT <= 0) { sub++; acum = 0; vistos = {}; base = { pasados: s.pasados, rotos: s.rotos, esquivados: s.esquivados || 0 }; }
        return null;
      }
      if (cumple(c, s, dt)) okT = OK_T;
      return null;
    }
    // sin (mas) condiciones: el remate y al paso siguiente
    const rem = p.remate && escenas[p.remate] ? escenas[p.remate].lineas[0] : null;
    i++;
    if (i >= pasos.length) { fin = true; return { tipo: 'fin', linea: rem }; }
    entrar();
    return rem ? { tipo: 'radio', linea: rem } : null;
  }
  return null;
}
