// EL TEATRO AEREO — los tiros de utileria y la coreografia que los ordena
// (docs/sistemas/PLAN_TEATRO_AEREO.md, fases TA0 EL REPARTO · TA1 LA ESQUIVADA · TA2 EL DERRIBO).
//
// POR QUE EXISTE UNA LISTA APARTE, que es toda la idea del teatro.
//
// `core/world.js` tiene cinco listas y cada una es un CONTRATO DE DAÑO: con `obstacles` chocas y te
// matas, `missiles` te mata, a `soldiers` los atropellas, `bullets` es el cañon. **Estos tiros no
// estan en ninguna.** La rutina de colision ni siquiera los ve: no hay un `if` que decida
// perdonarte, no hay una distancia minima bien elegida, no hay una bandera que alguien pueda apagar
// sin querer dentro de seis meses.
//
// **No hay daño porque no hay codigo de daño.** Es una garantia de otra naturaleza que "el daño
// esta en cero" — un numero en cero lo sube cualquiera; una rutina que no mira la lista, no.
//
// El precedente es el Harrier de LA COLA (`systems/caza.js`), que dispara y erra por el mismo
// motivo y con la misma honestidad: errar ES el contenido.
//
// LA REGLA DE LA ESQUIVADA (TA1), que es la unica decision de diseño con filo de todo esto: **el
// tiro apunta a donde el Fiel YA NO VA A ESTAR** — al punto que ocupaba al arrancar la pirueta, con
// el tiempo de vuelo calculado para llegar cuando la figura ya lo desplazo. Se lee como esquivada
// SIEMPRE y no puede pegar NUNCA, porque no le esta apuntando a el. La alternativa —apuntarle y
// confiar en que la pirueta lo salve— es una moneda al aire, y en una escena que se mira la moneda
// sale mal la mitad de las veces.
//
// DISCIPLINA DE SEÑALES (convencion 2 de ARQUITECTURA): esto muta su propio store y no llama a
// nadie hacia arriba. El orquestador lo actualiza y el render lo dibuja; nada mas.
// Y no importa NADA del render (lo vigila `npm run lint:layers`): las distancias del teatro son
// numeros de puesta en escena, en `data/teatro.js`.
import { TEATRO } from '../data/teatro.js';
import { MOVES } from '../data/moves.js';
import { explodeAt } from '../core/fx.js';
import { actores, entra, sacar, limpiar as limpiarActores } from './wingmv.js';

// LOS TIROS EN ESCENA. Store de identidad estable (convencion 1): se MUTA, nunca se reasigna — el
// render lo lee por referencia.
export const tiros = [];
// LAS BOLAS DE FUEGO de los derribos. Van en lista PROPIA y no por `explodeAt` entera: esa empuja
// su bola a `obstacles`, y meter algo del teatro en una lista del juego seria romper la regla justo
// en el unico lugar donde nadie la estaria mirando. Las chispas si son las de siempre (van a
// `parts`, que no es un contrato de daño: es humo).
export const bolas = [];
// CUANTOS CAYERON en la escena en curso. No es un puntaje —el teatro no acredita nada, y eso lo
// vigila `npm run maniobras`— es la unica forma de que un fixture distinga un DERRIBO de un blanco
// que simplemente se fue de escena cuando se le acabo el crucero. Sin este numero, la asercion
// "cayo" se cumplia sola: el blanco desaparecia igual.
let derribos = 0;
// …y CUANTOS SE TIRARON, por bando. Mismo motivo que `derribos`: un tiro rapido que acierta vive
// menos que un cuadro, asi que contarlos MUESTREANDO la escena mide el reloj del que mira y no lo
// que paso. (Le costo un falso negativo al fixture: el misil del Fiel derribaba al blanco y la
// prueba decia que el Fiel no habia contestado.)
const disparos = { blanco: 0, fiel: 0 };

/** Lanza un tiro de utileria.
 *
 *  `o` = { x, y, z, vx, vy, vz, tipo, de }. `tipo` es 'canon' (seco, sin estela) o 'misil' (mas
 *  lento y con humo). `de` dice quien lo tiro ('blanco' | 'fiel'): no cambia nada de la fisica,
 *  es para que el render lo pinte del color de su bando y para que un fixture pueda contarlos.
 *
 *  Devuelve el tiro (nunca null: un tiro que no sale dejaria una escena a medias sin decirlo). */
export function tirar(o) {
  const t = {
    tipo: o.tipo === 'misil' ? 'misil' : 'canon', de: o.de || 'blanco',
    x: o.x || 0, y: o.y || 0, z: o.z || 0,
    vx: o.vx || 0, vy: o.vy || 0, vz: o.vz || 0,
    // `mata` SOLO lo lleva el tiro del Fiel contra un blanco (TA2), y por omision NO: un tiro de
    // utileria no derriba nada salvo que la escena lo pida. Es tambien el campo que este
    // constructor se habia olvidado de copiar — y como `tirar` arma el objeto campo por campo en
    // vez de quedarse con el que le pasan, el misil llegaba encima del blanco y lo atravesaba sin
    // que nadie dijera nada. El fixture lo destapo recien cuando dejo de creerle a "el blanco ya
    // no esta" y empezo a contar derribos de verdad.
    mata: !!o.mata,
    vida: 0, humoT: 0, humo: [],
  };
  tiros.push(t);
  disparos[t.de] = (disparos[t.de] || 0) + 1;
  return t;
}

// ---------------- APUNTAR (TA1) ----------------

/** Lanza un tiro que **llega a `punto` en `tv` segundos**. La velocidad se DERIVA del tiempo de
 *  vuelo, no al reves: lo que importa de un tiro de utileria es llegar a horario, porque el momento
 *  en que cruza es todo su contenido. Queda acotada a la banda de `TEATRO` — fuera de ella deja de
 *  leerse como un tiro. */
export function apuntaA(desde, punto, tv, o) {
  const dx = punto.x - desde.x, dy = punto.y - desde.y, dz = punto.z - desde.z;
  const d = Math.hypot(dx, dy, dz) || 0.001;
  const t = Math.max(d / TEATRO.V_MAX, Math.min(d / TEATRO.V_MIN, Math.max(0.08, tv)));
  return tirar(Object.assign({
    x: desde.x, y: desde.y, z: desde.z,
    vx: dx / t, vy: dy / t, vz: dz / t,
  }, o));
}

// ---------------- LA COREOGRAFIA (TA1 y TA2) ----------------
//
// Es REACTIVA y no una agenda con reloj, a proposito. Un segundo planificador de tiempos al lado
// del director de cinematicas serian dos relojes contando lo mismo, y el dia que uno se corra el
// otro no se entera. Aca las dos preguntas se contestan mirando el estado de los actores: "¿el Fiel
// arranco su pirueta?" y "¿ya salio de ella?". El QUE y el CUANTO siguen siendo dato de la escena
// (`a.tira`, escrito por quien la monta); esto es solo el CUANDO.
function coreografia(dt) {
  // el Fiel de la escena: el primero que este volando o saliendo de una figura
  let fiel = null;
  for (const a of actores) if (a.bando === 'fiel' && (a.fase === 'mv' || a.fase === 'sale')) { fiel = a; break; }

  for (const a of actores) {
    if (!a.tira) continue;
    a.tiroT += dt;
    const cfg = a.tira;
    const n = cfg.n === undefined ? TEATRO.RAFAGA : cfg.n;
    if (a.tirados >= n) continue;

    if (a.bando === 'blanco') {
      // LE TIRAN AL FIEL, y le tiran **al punto que acaba de dejar**. La mira es `p0` —donde estaba
      // cuando arranco la pirueta— y el tiempo de vuelo se calcula para llegar cuando la figura ya
      // lo desplazo (`TEATRO.LLEGA` de la maniobra). No puede pegarle porque no le esta apuntando.
      if (!fiel || fiel.fase !== 'mv' || !fiel.p0 || !fiel.est.mv) continue;
      const M = MOVES[fiel.est.mv];
      const p = fiel.est.mvT / M.dur;
      if (p > TEATRO.DISPARA) continue;             // tarde: la figura ya se abrio
      // …y LA DIRECCION DE ESCAPE, que es lo que hace falta para apuntar atras. Mientras el Fiel no
      // se haya despegado de su punto de partida no hay direccion que leer, y el tiro espera.
      const F = fiel.cuerpo, p0 = fiel.p0;
      const ex = F.x - p0.x, ey = F.y - p0.y, ez = F.z - p0.z;
      const e = Math.hypot(ex, ey, ez);
      if (e < TEATRO.DESPEGUE) continue;
      if (a.tirados && a.tiroT < (cfg.cada || TEATRO.CADENCIA)) continue;
      a.tiroT = 0; a.tirados++;
      const mira = miraDe(a.cuerpo, p0, ex / e, ey / e, ez / e);
      apuntaA(a.cuerpo, mira, TEATRO.LLEGA * M.dur - fiel.est.mvT,
        { tipo: cfg.tipo || 'canon', de: 'blanco' });
    } else {
      // EL FIEL CONTESTA AL SALIR (TA2): esquiva y responde, en ese orden — es lo que convierte dos
      // actos sueltos en una escena. Este SI le apunta a algo: es el unico tiro del teatro que
      // busca a alguien, y ese alguien es otro actor del teatro.
      if (a.fase !== 'sale') continue;
      let blanco = null;
      for (const b of actores) if (b.bando === 'blanco' && !b.muerto) { blanco = b; break; }
      if (!blanco) continue;
      if (a.tirados && a.tiroT < (cfg.cada || TEATRO.FIEL_CADENCIA)) continue;
      a.tiroT = 0; a.tirados++;
      // VIAJA A VELOCIDAD DE MISIL, no a la maxima: con el tiempo de vuelo minimo, el Fiel disparaba
      // y el blanco estallaba en el mismo cuadro — el "esquiva y contesta", que es toda la escena,
      // no se llegaba a ver. Un misil que se ve ir es la mitad del plano.
      const d = Math.hypot(blanco.cuerpo.x - a.cuerpo.x, blanco.cuerpo.y - a.cuerpo.y, blanco.cuerpo.z - a.cuerpo.z);
      apuntaA(a.cuerpo, blanco.cuerpo, d / TEATRO.MISIL_V,
        { tipo: cfg.tipo || 'misil', de: 'fiel', mata: cfg.mata !== false });
    }
  }
}

/** LA MIRA DE LA ESQUIVADA, y es el corazon de TA1.
 *
 *  Apuntar al punto que el Fiel vacio no alcanza, y no es una cuestion de afinar un numero: **un
 *  tiro no se detiene en su blanco, sigue**. Si la linea de fuego queda alineada con la fuga, el
 *  tiro recorre el mismo pasillo que el Fiel — yendo hacia el mismo lado lo alcanza, viniendo de
 *  frente lo choca. Con un blanco de costado y un TONEL (que se va de costado), eso es un impacto
 *  garantizado, y asi lo midio el fixture: tres de cuatro piruetas fallaban.
 *
 *  Lo que se hace entonces es correr la mira sobre **la perpendicular comun** a las dos rectas: la
 *  de la fuga (`u`) y la de la linea de fuego (`w`). Su producto vectorial es, por definicion, la
 *  direccion en la que separarlas SIRVE — y la distancia entre dos rectas que se cruzan, medida asi,
 *  vale exactamente lo que uno corra la mira. `TEATRO.MARGEN` deja de ser una constante bien
 *  elegida y pasa a ser **una cota**: ninguna pirueta nueva la puede romper, porque no depende de
 *  como sea la pirueta.
 *
 *  El termino contra `u` es aparte y es de PUESTA EN ESCENA: manda el tiro un poco hacia atras del
 *  escape, para que se lea rastrillando el lugar donde el Fiel estaba. Correr la mira a lo largo de
 *  la fuga no cambia la separacion —desliza el punto sobre la misma recta—, asi que es gratis. */
function miraDe(desde, p0, ux, uy, uz) {
  const wx = p0.x - desde.x, wy = p0.y - desde.y, wz = p0.z - desde.z;
  const lw = Math.hypot(wx, wy, wz) || 1;
  // n = u × w, la perpendicular comun
  let nx = uy * (wz / lw) - uz * (wy / lw);
  let ny = uz * (wx / lw) - ux * (wz / lw);
  let nz = ux * (wy / lw) - uy * (wx / lw);
  let ln = Math.hypot(nx, ny, nz);
  if (ln < 0.15) {
    // FUGA Y TIRO CASI PARALELOS: el producto vectorial se degenera y no hay perpendicular comun
    // que valga. Se usa cualquier perpendicular a la fuga — sirve igual, porque lo que importa es
    // separarse de la recta del ESCAPE, y en este caso las dos rectas son casi la misma.
    nx = -uy; ny = ux; nz = 0;
    ln = Math.hypot(nx, ny, nz);
    if (ln < 1e-4) { nx = 0; ny = 0; nz = 1; ln = 1; }
  }
  const m = TEATRO.MARGEN, atras = m * 0.5;
  return {
    x: p0.x + nx / ln * m - ux * atras,
    y: p0.y + ny / ln * m - uy * atras,
    z: p0.z + nz / ln * m - uz * atras,
  };
}

/** ¿Este tiro derribo a alguien? La UNICA prueba de distancia del teatro — y sigue sin ser una
 *  colision del juego: los dos que se miden son actores del teatro, ninguno esta en las cinco
 *  listas de `core/world.js`, y el avion del jugador ni aparece en la cuenta.
 *
 *  SE MIDE CONTRA EL TRAMO RECORRIDO, no contra el punto de llegada. Un misil de utileria viaja a
 *  260 u/s: en un cuadro avanza cuatro unidades, y el radio de impacto son cinco — probando solo
 *  la posicion final, el tiro **pasaba de largo por adentro del blanco** entre dos cuadros y la
 *  escena terminaba con el enemigo intacto y nadie diciendo por que. Es el mismo problema (y la
 *  misma solucion) que el tunel de cualquier bala rapida. */
function impacto(t, ax, ay, az) {
  if (!t.mata) return false;
  const dx = t.x - ax, dy = t.y - ay, dz = t.z - az;
  const ll = dx * dx + dy * dy + dz * dz;
  for (const b of actores) {
    if (b.bando !== 'blanco' || b.muerto) continue;
    const B = b.cuerpo;
    // el punto del tramo mas cercano al blanco (proyeccion acotada a [0,1])
    let f = ll > 1e-6 ? ((B.x - ax) * dx + (B.y - ay) * dy + (B.z - az) * dz) / ll : 0;
    f = Math.max(0, Math.min(1, f));
    if (Math.hypot(ax + dx * f - B.x, ay + dy * f - B.y, az + dz * f - B.z) > TEATRO.IMPACTO) continue;
    // MUERE. Las chispas son las de siempre (`explodeAt` a `parts`), pero SIN su bola: esa se
    // empuja a `obstacles` y el teatro no entra ahi. La bola la pinta el teatro, con la suya.
    explodeAt(B.x, B.y, B.z, true, true, true);
    bolas.push({ x: B.x, y: B.y, z: B.z, t: 0 });
    b.muerto = true; derribos++;
    sacar(b);
    return true;
  }
  return false;
}

/** Un cuadro de todos los tiros. Lo llama el orquestador en el PASILLO. */
export function update(dt) {
  coreografia(dt);
  for (let i = bolas.length - 1; i >= 0; i--) {
    bolas[i].t += dt;
    if (bolas[i].t >= TEATRO.BOLA) bolas.splice(i, 1);
  }
  for (let i = tiros.length - 1; i >= 0; i--) {
    const t = tiros[i];
    t.vida += dt;
    const ax = t.x, ay = t.y, az = t.z;      // de donde venia: el tramo es lo que se prueba
    t.x += t.vx * dt; t.y += t.vy * dt; t.z += t.vz * dt;

    // ESTELA del misil: muestras que quedan atras y se apagan. Es del tiro y no del render porque
    // el rastro es POSICION en el mundo — el render lo unico que hace es pintarlo.
    if (t.tipo === 'misil') {
      t.humoT += dt;
      if (t.humoT >= TEATRO.ESTELA_T) {
        t.humoT = 0;
        t.humo.push({ x: t.x, y: t.y, z: t.z, v: TEATRO.ESTELA_VIDA });
      }
      for (let j = t.humo.length - 1; j >= 0; j--) {
        t.humo[j].v -= dt;
        if (t.humo[j].v <= 0) t.humo.splice(j, 1);
      }
    }

    // …Y SE VA SOLO. Dos puertas: salirse de la caja del mundo, y el TOPE DURO DE VIDA. El tope no
    // es redundante: un tiro con velocidad casi nula se quedaria adentro de la caja para siempre.
    const fuera = Math.abs(t.x) > TEATRO.X_MAX || t.y < TEATRO.Y_MIN || t.y > TEATRO.Y_MAX
      || t.z < TEATRO.Z_MIN || t.z > TEATRO.Z_MAX;
    if (fuera || t.vida > TEATRO.VIDA || impacto(t, ax, ay, az)) tiros.splice(i, 1);
  }
}

/** Saca todos los tiros (cambio de fase, muerte, reinicio). Los stores se MUTAN. */
export function limpiar() {
  tiros.length = 0; bolas.length = 0; derribos = 0;
  disparos.blanco = 0; disparos.fiel = 0;
}
export const cuantos = () => tiros.length;
export const derribados = () => derribos;

// ---------------- MONTAR UNA ESCENA ----------------

/** LA ESCENA COMPLETA: un blanco que le tira al Fiel, el Fiel que lo esquiva con una pirueta y —si
 *  la escena lo pide— que le contesta al salir.
 *
 *  `o` = { mv, lado, blanco, tiros, derriba }. `derriba` es DATO y no una decision de este modulo:
 *  0 deja irse al blanco, 1 o mas lo bajan. El pedido era "algunos (o todos)", y eso es una perilla.
 *
 *  Es la puerta que TA3 va a llamar desde un beat del director: la coreografia ya vive aca, asi que
 *  el verbo `teatro:` no tiene que reimplementar nada. */
export function escena(o) {
  o = o || {};
  const mv = o.mv || TEATRO.ESQUIVAS[(Math.random() * TEATRO.ESQUIVAS.length) | 0];
  const M = MOVES[mv]; if (!M) return null;
  const derriba = o.derriba === undefined ? 1 : o.derriba;
  // LA GEOMETRIA DE LA ESCENA, que es lo que hace legible la esquivada y no una cuenta:
  // **el que tira se queda de su lado y el que esquiva se va para el otro**. Si el blanco cruza el
  // cuadro termina del mismo lado hacia el que el Fiel escapa, y entonces el tiro y la esquivada
  // van al mismo lugar — que fue exactamente lo que midio el fixture la primera vez (tres de cuatro
  // piruetas daban impacto). El `dir` del Fiel sale de ahi: para el lado contrario al del blanco.
  const lado = o.blanco === 'izq' ? 'izq' : 'der';
  const s = lado === 'der' ? 1 : -1;
  const fiel = entra(mv, o.lado, Object.assign({ dir: -s },
    derriba ? { tira: { n: TEATRO.FIEL_RAFAGA, tipo: 'misil', mata: true } } : null));
  if (!fiel) return null;
  // EL BLANCO SE QUEDA MIRANDO todo lo que dura la escena del Fiel: su entrada, su figura y un
  // margen. Con el crucero de siempre se iba justo cuando tenia que estar tirando.
  const blanco = entra(null, lado, {
    bando: 'blanco', cruza: false, crucero: fiel.dur + M.dur + 1.2,
    tira: { n: o.tiros === undefined ? TEATRO.RAFAGA : o.tiros, tipo: 'canon' },
  });
  return { mv, fiel, blanco, derriba };
}

/** Foto de solo lectura para el render (convencion 4: el que dibuja no toca el estado). */
export const state = () => ({
  tiros: tiros.map(t => ({
    tipo: t.tipo, de: t.de, x: t.x, y: t.y, z: t.z, vx: t.vx, vy: t.vy, vz: t.vz,
    humo: t.humo.map(h => ({ x: h.x, y: h.y, z: h.z, f: h.v / TEATRO.ESTELA_VIDA })),
  })),
  bolas: bolas.map(b => ({ x: b.x, y: b.y, z: b.z, f: b.t / TEATRO.BOLA })),
});

// ---------------- SONDAS (QUITAR antes de publicar) ----------------
// La puerta para ver un tiro de utileria sin que exista todavia una coreografia que lo pida — que
// es justo lo que TA0 necesita para poder AFIRMAR la valla antes de construir nada encima.
if (typeof window !== 'undefined') window.__teatrotiro = (o) => {
  const t = tirar(Object.assign({ x: 0, y: 20, z: 19, vx: 0, vy: 0, vz: 60, tipo: 'canon' }, o || {}));
  return JSON.stringify({ tipo: t.tipo, de: t.de, x: +t.x.toFixed(1), y: +t.y.toFixed(1), z: +t.z.toFixed(1), n: tiros.length });
};
// QUITAR — la foto de los tiros vivos, con su vida: es lo que deja afirmar desde un fixture que
// TODOS se fueron y que ninguno se quedo colgado en escena.
if (typeof window !== 'undefined') window.__teatrodbg = () => JSON.stringify(tiros.map(t => ({
  tipo: t.tipo, de: t.de, mata: !!t.mata, vida: +t.vida.toFixed(2),
  x: +t.x.toFixed(2), y: +t.y.toFixed(2), z: +t.z.toFixed(2), humo: t.humo.length,
})));
// QUITAR — el marcador de la escena: cuantos cayeron de verdad. Es lo que deja afirmar un DERRIBO
// y no "el blanco ya no esta", que se cumple igual cuando simplemente se fue.
if (typeof window !== 'undefined') window.__teatromarca = () => JSON.stringify({
  derribos, bolas: bolas.length, tiros: tiros.length,
  tiroBlanco: disparos.blanco, tiroFiel: disparos.fiel,
});
// QUITAR — LA ESCENA ENTERA por una puerta: `__teatro('barrel')` monta blanco + Fiel + coreografia.
// Es la cuarta presentacion del menu MANIOBRAS («ESQUIVANDO») y lo que mide `npm run maniobras` §5.
if (typeof window !== 'undefined') window.__teatro = (mv, lado, derriba) => {
  // ARRANCA DE CERO. La escena no limpia por su cuenta —una timeline puede querer encadenar dos—,
  // pero pedirla A MANO es siempre "quiero ver ESTA": con lo anterior todavia en escena, el
  // marcador venia sumado del pedido anterior y un fixture podia dar por buena una escena en la
  // que no paso nada.
  limpiarActores(); limpiar();
  const e = escena({ mv: mv || undefined, lado, derriba: derriba === undefined ? 1 : +derriba });
  return JSON.stringify(e ? { mv: e.mv, derriba: e.derriba, blanco: !!e.blanco } : { error: 'no existe la maniobra ' + mv });
};
