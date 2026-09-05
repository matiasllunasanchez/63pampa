// FIXTURE DE ACEPTACION de EL PROGRAMA DE MANIOBRAS (docs/sistemas/PLAN_MANIOBRAS_FASES.md).
//   npm run maniobras                    ·  MV_SHOTS=/tmp/x npm run maniobras   (deja capturas)
//   MV_ONLY=splits,barrel npm run maniobras                                     (una o dos sueltas)
//
// ES LA RED DE REGRESION DE LAS PIRUETAS, y existe ANTES que cualquier maniobra nueva a proposito
// (M0 es la primera fase del plan). El motor de piruetas es dueño del avion mientras la maniobra
// dura: escribe vx/vy, el alabeo, el cabeceo y la velocidad, y flight.js le cede el turno. Una
// maniobra que sale mal no da error — deja el avion volando con la velocidad en cero, o el cabeceo
// colgado, o clavado contra el techo. Eso no se descubre jugando: se descubre midiendo.
//
// QUE MIDE, por maniobra:
//   1. DISPARA            la sonda `__mv('<id>')` la lanza y `run.mv` queda en ella
//   2. DURA LO DECLARADO  el reloj de la maniobra llega cerca de su `dur` de catalogo y TERMINA
//   3. RESPETA EL CONTRATO `fire`/`turbo` del catalogo == lo que contestan mvAllowsFire/Turbo
//   4. SE MUEVE           el avion recorre altura o carril: una pirueta que no mueve nada es una
//                         animacion del sprite (misma vara que `npm run cine` para el director)
//   5. SALE SANA          nada de NaN, adentro del carril y del techo, con velocidad de vuelo
//
// …y ademas LA GRAMATICA DE LOS COMBOS (§3.3 del plan), leyendo el dispatcher de game.js: 3 o 4
// toques, ninguno prefijo de otro, ninguno que se pueda producir bombeando una sola direccion.
// Va aca y no en `npm run unit` porque es la misma pregunta que el resto del fixture —"¿el
// catalogo de maniobras esta sano?"— y partirla en dos comandos es partir la respuesta.
//
// SE DISPARA POR SONDA y no tecleando el combo: los combos son de 3 toques a menos de 0.28 s uno
// del otro, y un fixture que dependa de esa ventana mide el foco del teclado, no la maniobra.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.MV_SHOTS || '';
const ONLY = (process.env.MV_ONLY || '').split(',').filter(Boolean);
// ENTRA + SALE de data/moves.js (WINGMV): lo que un actor tarda en escena ademas de la maniobra.
// Se escribe aca y no se lee del modulo porque el fixture corre en node y el catalogo es del
// bundle; si cambian alla, lo unico que pasa es que este margen queda holgado.
const WINGMV_T = 1.5 + 1.4;   // ENTRA_ATRAS (la mas larga) + SALE
// LA BANDA DE LA ESQUIVADA (TEATRO AEREO TA1), en unidades de MUNDO. Debajo de TA_CERCA el tiro le
// paso por encima y la esquivada no ocurrio; por arriba de TA_LEJOS nadie le apunto y no se lee.
// Se escriben aca —y no se leen de data/teatro.js— por el mismo motivo que WINGMV_T: el fixture
// corre en node y el catalogo es del bundle. Es una VARA, no una copia: si el sistema cambia sus
// numeros, esto sigue preguntando lo mismo.
const TA_CERCA = 3.5, TA_LEJOS = 40;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const inf = m => console.log('     ' + m);
const js = s => win.webContents.executeJavaScript(s);
const D = async () => JSON.parse(await js('String(window.__mvdbg())') || 'null');
const estado = () => js('JSON.parse(__pausedbg()).state');
async function shot(n) {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}

// ---------------- LA GRAMATICA DE LOS COMBOS ----------------
// Las secuencias viven como `case '<toques>':` adentro del dispatcher `combo` de game.js. Se leen
// de ahi —del codigo que corre— y no de una tabla copiada: una tabla copiada se desincroniza el
// dia que alguien agrega una maniobra, y lo hace sin avisar.
//
// LAS TRES REGLAS (data/moves.js las escribe en prosa; aca se ejecutan):
//   a. 3 o 4 toques. Con dos, los 16 pares posibles quedaban ocupados y el avion parecia manejarse
//      solo — no habia forma de tocar dos direcciones seguidas sin lanzar algo.
//   b. NINGUNA es prefijo de otra: la corta dispararia antes de que la larga se complete. (El caso
//      inverso —una corta que es el FINAL de una larga— lo resuelve el match por sufijo mas largo
//      de core/input.js, y por eso NO es una falla.)
//   c. NINGUNA del STICK IZQUIERDO es un mismo toque repetido: es lo que hace que bombear gas
//      ('↑↑↑↑↑') o corregir el rumbo no disparen nada. El matiz importa dos veces:
//        · 'udd' SI tiene una repeticion adentro, y esta bien — lo que no puede existir es una
//          secuencia PRODUCIBLE apretando una sola direccion.
//        · 'LLL'/'RRR' (el TONEL) SI son un toque repetido, y tambien esta bien: son del stick
//          DERECHO, que es una tecla dedicada a rolar. Volando no se aprieta sin querer — el
//          peligro que la regla evita es que las teclas de VOLAR produzcan maniobras solas, y el
//          stick derecho no vuela. Por eso la regla mira las minusculas y no todo el alfabeto.
function gramatica() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'game.js'), 'utf8');
  const i0 = src.indexOf('LOS DOS STICKS: EL ASCENSOR');
  const ini = src.lastIndexOf('switch', i0), fin = src.indexOf('launchMissile', i0);
  if (i0 < 0 || ini < 0 || fin < 0) { bad('no se encontro el dispatcher de combos en game.js'); return; }
  const seqs = [...src.slice(ini, fin).matchAll(/case '([lrudLRUD]{2,5})'/g)].map(m => m[1]);
  if (seqs.length < 12) { bad(`se leyeron solo ${seqs.length} combos del dispatcher (¿cambio de forma?)`); return; }
  let malos = 0;
  for (const a of seqs) {
    if (a.length < 3 || a.length > 4) { bad(`combo '${a}': ${a.length} toques (la regla es 3 o 4)`); malos++; }
    if (/^[lrud]+$/.test(a) && /^(.)\1*$/.test(a)) { bad(`combo '${a}': un toque de VOLAR repetido — bombear esa direccion lo dispararia solo`); malos++; }
    for (const b of seqs) if (a !== b && b.startsWith(a)) { bad(`combo '${a}' es PREFIJO de '${b}': dispararia antes`); malos++; }
  }
  if (!malos) ok(`la gramatica se cumple en los ${seqs.length} combos: 3-4 toques, ninguno prefijo de otro, ninguno bombeable con las teclas de volar`);
  inf(seqs.join(' · '));
}

// ---------------- UNA MANIOBRA ----------------
/** Lanza `id`, la sigue cuadro a cuadro y devuelve la traza + el estado de salida. */
async function correr(id, dur) {
  // SE LIMPIA EL PASILLO, y no es comodidad: el fixture vuela POR LA PATRIA quince segundos
  // seguidos, con spawns de verdad. Tarde o temprano el avion choca algo — y cuando choca, el
  // juego pasa a 'relevo', flight.js deja de correr, `movesSystem` no se llama mas y la maniobra
  // que estaba corriendo se queda colgada para siempre. Sintoma: el reloj clavado en 0 y "NO
  // TERMINA". Costo media hora y dos hipotesis equivocadas antes de mirar el estado. Lo que se
  // mide aca son las CURVAS de la maniobra, no la habilidad de esquivar mientras se las mide.
  gas(); await limpiar();
  // SE ESPERA LA PRECONDICION, no un tiempo. `__mvreset` limpia la maniobra y el cooldown, pero
  // entre que se pide y que el cuadro siguiente lo aplica hay un hueco: dormir "lo que suele
  // alcanzar" convierte al fixture en una moneda. Se pregunta hasta que el avion ESTE limpio.
  for (let k = 0; k < 40; k++) {
    gas();
    await js('window.__mvreset()');
    const d = await D();
    if (!d.mv && d.cd <= 0) break;
    await sleep(50);
  }
  const r = JSON.parse(await js(`String(window.__mv(${JSON.stringify(id)}))`));
  const tr = [];
  let visto = false, fin = null;
  // margen generoso sobre `dur`: el reloj de la maniobra corre con el dt DEL MUNDO y el fixture
  // muestrea con el de pared. Lo que se afirma es que TERMINA, no cuanto tarda el reloj de pared.
  const topeMs = dur * 1000 + 1600;
  for (let t0 = Date.now(); Date.now() - t0 < topeMs;) {
    gas(); await limpiar();
    const d = await D();
    tr.push(d);
    const activa = d.mv === id;
    if (activa) visto = true;
    if (visto && !activa) { fin = d; break; }
    // …y si el juego se fue de 'play' (choque, relevo, muerte) se corta y se dice: una maniobra
    // que "no termina" porque el avion se murio no es un bug de la maniobra, y confundir las dos
    // cosas es lo que hace que un fixture rojo no signifique nada.
    if (d.estado !== 'play') return { r, tr, visto, fin: null, muerto: d.estado, salida: d };
    await sleep(55);
  }
  return { r, tr, visto, fin, salida: fin || tr[tr.length - 1] };
}

// EL PASILLO, VACIO. Se llama antes de cada maniobra Y en cada muestra: lo que hay adelante se
// SIEMBRA y llega solo, asi que limpiar una vez deja el carril libre medio segundo y despues
// vuelve a haber. Y limpia TAMBIEN los proyectiles en vuelo (`__pasilloLimpio`, no `__seaclear`):
// un misil lanzado antes sigue viajando y mata en el medio de la medicion.
const limpiar = () => js('window.__pasilloLimpio && window.__pasilloLimpio()');

// EL GAS, PUESTO. «W: gas — si soltás, el avión cae» esta escrito en la barra de ayuda del propio
// juego, y este fixture lo aprendio por las malas: sin tocar nada, el avion se hundia y chocaba el
// mar a los cinco segundos, en el medio de una maniobra. El sintoma era desconcertante —el reloj de
// la pirueta clavado en cero y "NO TERMINA"— porque al morir el juego pasa a 'relevo', flight.js
// deja de correr y `movesSystem` no se llama nunca mas. Dos hipotesis equivocadas (el cooldown, los
// obstaculos) antes de mirar lo unico que habia que mirar: que el avion venia CAYENDO.
//
// Se manda el flanco de tecla en cada muestra en vez de una vez: es barato y no depende de que el
// juego mantenga el estado de la tecla entre eventos sinteticos.
const gas = () => { win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }); };

const rango = (tr, k) => {
  const v = tr.map(x => x[k]).filter(x => typeof x === 'number' && isFinite(x));
  return v.length ? Math.max(...v) - Math.min(...v) : 0;
};
const sano = d => ['x', 'y', 'vx', 'vy', 'bank', 'pitch', 'spd'].every(k => typeof d[k] === 'number' && isFinite(d[k]));

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL PROGRAMA DE MANIOBRAS (M0: la vara del catalogo)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  // ---------- 0. la gramatica (no necesita el juego corriendo) ----------
  console.log('0. la gramatica de los combos:');
  gramatica();

  // ---------- entrar a volar ----------
  // POR LA PATRIA: PASILLO infinito. Es el modo correcto para medir piruetas por la misma razon
  // que lo es para medir olas — no se acaba a mitad de una medicion ni desemboca en un climax.
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa');
  await sleep(2600);
  const tap = async k => {
    win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
    await sleep(60);
    win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
    await sleep(110);
  };
  await tap('Return'); await tap('Down'); await tap('Return');
  await tap('Down'); await tap('Return'); await tap('Return');
  let volando = false;
  for (let i = 0; i < 60 && !volando; i++) { volando = await estado() === 'play'; if (!volando) await sleep(200); }
  if (!volando) { console.error('   ✗ no se llego a volar'); app.exit(1); return; }
  // el primer cuadro de vuelo trae la resaca del despegue (tren, formacion saliendo, un dt largo
  // por la carga): medir una pirueta ahi adentro es medir eso. Con el gas puesto, ademas, el avion
  // sube a una altura de trabajo en vez de arrancar la primera pirueta cayendo.
  for (let i = 0; i < 14; i++) { gas(); await sleep(50); }
  console.log('\n1. el catalogo, una por una:');

  const CAT = JSON.parse(await js('String(window.__mvcat())'));
  // EL TONEL YA NO ENTRA A MANO: se mudo a MOVES y sale del catalogo como las demas. Mientras
  // estuvo afuera, esta lista lo agregaba a mano y la seccion 2 (los actores) no podia probarlo —
  // que es exactamente el agujero por el que la primera fila del menu MANIOBRAS no hacia nada.
  const IDS = Object.keys(CAT).filter(id => !ONLY.length || ONLY.includes(id));
  const FLY_X = 38, FLY_TOP = 68;
  let pasaron = 0;

  for (const id of IDS) {
    const M = CAT[id];
    const { r, tr, visto, fin, salida, muerto } = await correr(id, M.dur);
    const nom = `${id} (${M.name})`;
    let mal = 0;
    const falla = m => { bad(`${nom}: ${m}`); mal++; };

    if (muerto) falla(`el juego se fue de 'play' a '${muerto}' en el medio (choque/relevo): la medicion no vale`);
    if (!r.ok) falla('no arranco (¿cooldown, cfg.moves apagado, id inexistente?)');
    else if (!visto) falla('arranco pero nunca se vio activa: termino en el mismo cuadro');
    if (!fin && visto) falla(`NO TERMINA: sigue activa despues de ${(M.dur + 1.6).toFixed(1)} s`);

    // 2. dura lo declarado — el reloj de la maniobra tiene que ACERCARSE a su `dur`
    const tMax = Math.max(0, ...tr.map(x => x.t || 0));
    if (visto && tMax < M.dur * 0.5)
      falla(`se corto a la mitad: el reloj llego a ${tMax.toFixed(2)} s de ${M.dur} declarados`);

    // 3. el contrato del catalogo == lo que el juego pregunta
    const act = tr.filter(x => x.mv === id);
    if (act.length) {
      if (act.some(x => x.puedeFuego !== !!M.fire)) falla(`fire declarado ${!!M.fire} y mvAllowsFire dice lo contrario`);
      if (act.some(x => x.puedeTurbo !== !!M.turbo)) falla(`turbo declarado ${!!M.turbo} y mvAllowsTurbo dice lo contrario`);
    }

    // 4. se mueve (o rola): una pirueta que no mueve nada es una animacion
    const my = rango(tr, 'y'), mx = rango(tr, 'x'), mr = rango(tr, 'roll');
    if (my < 0.4 && mx < 0.4 && mr < 0.2) falla('no movio NADA: ni altura, ni carril, ni rolido');

    // 5. sale sana
    if (!sano(salida)) falla('el avion salio con algun valor no finito (NaN/Infinity)');
    else {
      if (salida.y < -0.1 || salida.y > FLY_TOP + 0.1) falla(`salio fuera del techo/piso (y = ${salida.y})`);
      if (Math.abs(salida.x) > FLY_X + 0.1) falla(`salio fuera del carril (x = ${salida.x})`);
      if (salida.spd <= 1) falla(`salio sin velocidad (${salida.spd})`);
    }

    if (!mal) {
      pasaron++;
      ok(`${nom} · ${tMax.toFixed(2)}/${M.dur}s · altura ${my.toFixed(1)} · carril ${mx.toFixed(1)} · rolido ${mr.toFixed(2)} · sale a ${salida.spd} y ${salida.y} m`);
    }
    await shot('mv_' + id);
  }

  console.log('');
  if (pasaron === IDS.length) ok(`las ${IDS.length} piruetas del catalogo pasan la vara`);
  else bad(`${IDS.length - pasaron} de ${IDS.length} piruetas fallaron`);

  // ---------- 2. LAS MISMAS, VOLADAS POR UN ACTOR (M1) ----------
  // El criterio de cierre de M1: un Fiel entra de costado, vuela la maniobra EN ESCENA y se va,
  // sin tocar el control ni la fisica del jugador. Lo ultimo es lo que de verdad hay que
  // defender —un actor es puesta en escena, no gameplay (regla §3.7)— y por eso se mide en cada
  // muestra y no al final: que el jugador quede igual DESPUES no prueba que no lo empujaron en el
  // medio.
  //
  console.log('\n2. las mismas, volando un actor (M1):');
  let actOk = 0;
  const ACT = Object.keys(CAT).filter(id => !ONLY.length || ONLY.includes(id));
  for (const id of ACT) {
    const M = CAT[id];
    await js('window.__mvreset()');
    gas(); await limpiar();
    const lado = ['izq', 'der', 'atras'][ACT.indexOf(id) % 3];   // los tres lados, repartidos
    const r = JSON.parse(await js(`String(window.__mvactor(${JSON.stringify(id)}, ${JSON.stringify(lado)}))`));
    let fases = [], mvVisto = false, tocoAlJugador = null, vidaMax = 0, seFue = false;
    const rx = [], ry = [], rr = [];
    for (let t0 = Date.now(); Date.now() - t0 < (WINGMV_T + M.dur) * 1000 + 1800;) {
      gas(); await limpiar();
      const A = JSON.parse(await js('String(window.__mvactordbg())'));
      if (!A.length) { seFue = true; break; }
      const a = A[0];
      if (fases[fases.length - 1] !== a.fase) fases.push(a.fase);
      if (a.mv === id) mvVisto = true;
      vidaMax = Math.max(vidaMax, a.vida);
      rx.push(a.x); ry.push(a.y); rr.push(a.roll);
      // EL JUGADOR, INTACTO: no puede haber entrado en ninguna maniobra por culpa del actor.
      if (a.pj.mv) tocoAlJugador = a.pj.mv;
      await sleep(70);
    }
    let mal = 0;
    const falla = m => { bad(`actor ${id} (${M.name}): ${m}`); mal++; };
    if (!r.id) falla('no entro en escena');
    if (!mvVisto) falla('entro pero nunca volo la maniobra');
    if (!seFue) falla(`NO SE FUE de escena (vida ${vidaMax.toFixed(1)} s): un actor sin salida se queda para siempre`);
    if (tocoAlJugador) falla(`le metio una maniobra AL JUGADOR ('${tocoAlJugador}'): un actor es escena, no gameplay`);
    if (fases.join('>') !== 'entra>mv>sale' && seFue)
      falla(`no compuso entrada-maniobra-salida: ${fases.join('>')}`);
    const mx = rx.length ? Math.max(...rx) - Math.min(...rx) : 0;
    const my = ry.length ? Math.max(...ry) - Math.min(...ry) : 0;
    const mr = rr.length ? Math.max(...rr) - Math.min(...rr) : 0;
    if (mx < 1 && my < 1 && mr < 0.2) falla('no movio nada en escena');
    if (!mal) { actOk++; ok(`${id} (${M.name}) por ${lado} · ${fases.join(' → ')} · recorre x ${mx.toFixed(0)} · y ${my.toFixed(0)} · rola ${mr.toFixed(2)} rad`); }
    await shot('act_' + id);
  }
  console.log('');
  if (actOk === ACT.length) ok(`las ${ACT.length} del catalogo tambien se vuelan COMO ACTOR, y el jugador no se entera`);
  else bad(`${ACT.length - actOk} de ${ACT.length} fallaron como actor`);

  // ---------- 3. EL SOBREPASO: la entrada de casa ----------
  // Un actor sin lado tiene que entrar POR ATRAS, y "por atras" no es un rotulo: es que NACE MAS
  // CERCA DE LA CAMARA QUE EL JUGADOR y termina MAS LEJOS. Eso es lo que se mide — que la
  // profundidad CRUCE la del avion propio (PZ = 14). Sin este guardian, cambiar un numero de
  // puesta en escena podia dejar al Fiel apareciendo delante, y el fixture no se enteraba.
  console.log('\n3. la entrada por omision (sobrepaso):');
  {
    await js('window.__mvreset()');
    gas(); await limpiar();
    const r = JSON.parse(await js("String(window.__mvactor('barrel'))"));
    const zs = [], xs = [];
    let lado = r.lado;
    for (let t0 = Date.now(); Date.now() - t0 < 4200;) {
      gas(); await limpiar();
      const A = JSON.parse(await js('String(window.__mvactordbg())'));
      if (!A.length) break;
      zs.push(A[0].z); xs.push(A[0].x);
      await sleep(60);
    }
    const PZ = 14;
    let mal = 0;
    const falla = m => { bad('sobrepaso: ' + m); mal++; };
    if (lado !== 'atras') falla(`sin lado entro por '${lado}' y no por atras (WINGMV.LADO)`);
    if (!zs.length) falla('no se lo vio en escena');
    else {
      if (zs[0] >= PZ) falla(`nacio DELANTE del jugador (z ${zs[0]} ≥ ${PZ}): eso no es un sobrepaso`);
      if (Math.max(...zs) <= PZ) falla(`nunca paso al jugador (z maxima ${Math.max(...zs)} ≤ ${PZ})`);
      // y no le pasa por encima: en el cuadro mas cercano tiene que estar a un costado
      if (Math.abs(xs[0]) < 4) falla(`paso por encima del jugador (x ${xs[0]}): tiene que pasar por un hombro`);
    }
    if (!mal) ok(`sin decir lado entra por ATRAS y sobrepasa: z ${zs[0]} → ${Math.max(...zs).toFixed(0)} (el jugador esta en ${PZ}), por el hombro ${xs[0] > 0 ? 'derecho' : 'izquierdo'}`);
    await shot('act_sobrepaso');
  }

  // ---------- 4. LA VALLA: el TEATRO AEREO no puede lastimar a nadie ----------
  // (docs/sistemas/PLAN_TEATRO_AEREO.md, TA0.)
  //
  // La promesa del teatro no es "el daño esta en cero": es que **no hay codigo de daño**, porque
  // nada del teatro entra en las cinco listas de core/world.js —los cinco contratos de daño del
  // juego—. Eso no se prueba leyendo una bandera adentro: se prueba CONTANDO desde afuera.
  //
  // LA MEDICION ES ATOMICA, y es la unica forma en que sirve. Se lee, se hace el acto del teatro y
  // se vuelve a leer DENTRO DE UNA SOLA EVALUACION de JavaScript: el bucle del juego no corre entre
  // dos sentencias, asi que el delta es del acto y de nada mas. Medido con un sleep en el medio, lo
  // que se mide es el sembrador del pasillo y el puntaje que sube solo con la distancia — el primer
  // intento afirmaba `missiles === 0` y `score === 0` y fallaba por eso, midiendo el juego en vez
  // del teatro.
  console.log('\n4. la valla del TEATRO AEREO (TA0):');
  {
    await js('window.__mvreset()');
    gas(); await limpiar();
    // el delta de las cinco listas + lo que se acredita, alrededor de un acto del teatro
    const valla = async actos => JSON.parse(await js(`String((() => {
      const a = JSON.parse(window.__listas());
      ${actos}
      const b = JSON.parse(window.__listas());
      const d = {}; for (const k in a) d[k] = b[k] - a[k];
      return JSON.stringify(d);
    })())`));
    let mal = 0;
    const falla = m => { bad('valla: ' + m); mal++; };
    const sucio = (d, que) => {
      const ks = Object.keys(d).filter(k => d[k] !== 0);
      if (ks.length) falla(`${que} movio ${ks.map(k => k + ' ' + (d[k] > 0 ? '+' : '') + d[k]).join(', ')} — el teatro toco algo del JUEGO`);
    };

    sucio(await valla(`
      window.__mvblanco(null, 'der');
      window.__teatrotiro({ x: 14, y: 24, z: 60, vz: -120 });
      window.__teatrotiro({ x: -14, y: 22, z: 60, vz: -110, tipo: 'misil' });
      window.__mvactor('barrel');
    `), 'montar la escena entera (blanco + 2 tiros + Fiel)');

    let vivos = 0, tirosVistos = 0, blancoVisto = false, estadoMalo = null, medioHecho = false;
    for (let t0 = Date.now(); Date.now() - t0 < 8000;) {
      gas(); await limpiar();
      const A = JSON.parse(await js('String(window.__mvactordbg())'));
      const T = JSON.parse(await js('String(window.__teatrodbg())'));
      if (A.some(a => a.bando === 'blanco')) blancoVisto = true;
      tirosVistos = Math.max(tirosVistos, T.length);
      if (A.some(a => a.pj.mv)) falla('un actor le metio una maniobra AL JUGADOR');
      const st = await estado();
      if (st !== 'play') { estadoMalo = st; break; }
      // …y OTRA VEZ EN EL MEDIO de la escena: que el primer cuadro este limpio no dice nada de los
      // que siguen. Un tiro que se registrara al morir, o un blanco que se anotara al llegar a su
      // marca, se veria aca y no arriba.
      if (!medioHecho && T.length) {
        medioHecho = true;
        sucio(await valla(`window.__teatrotiro({ x: 0, y: 26, z: 70, vz: -140 });`), 'tirar en medio de la escena');
      }
      vivos = A.length + T.length;
      if (!vivos) break;
      await sleep(80);
    }
    if (estadoMalo) falla(`el juego se fue de 'play' a '${estadoMalo}': el teatro no puede terminar nada`);
    if (!blancoVisto) falla('el BLANCO no llego a verse en escena');
    if (!tirosVistos) falla('los tiros de utileria no llegaron a verse');
    if (!medioHecho) falla('no se llego a medir la valla en el medio de la escena');
    if (vivos) falla(`quedaron ${vivos} en escena: los topes duros de vida no se cumplieron`);

    if (!mal) ok(`la escena entera no toco ninguna de las 5 listas del juego, no acredito nada y se fue sola · ${tirosVistos} tiros vistos a la vez`);
    await shot('valla');
  }

  // ---------- 5. LA ESQUIVADA Y EL DERRIBO (TA1 · TA2) ----------
  //
  // LA REGLA de TA1: el tiro apunta a donde el Fiel YA NO VA A ESTAR. Eso no se afirma leyendo el
  // codigo que apunta —seria preguntarle a la respuesta— sino **midiendo la distancia minima entre
  // cada tiro y el Fiel, cuadro a cuadro**, y exigiendo que caiga en una BANDA:
  //   · demasiado cerca  → es un impacto: la esquivada no ocurrio y el tiro lo atraveso
  //   · demasiado lejos  → nadie le apunto: no se lee como esquivada, se lee como ruido de fondo
  // Un numero, no una impresion. Y de paso: los tiros del BLANCO no pueden matar (`mata` en false),
  // asi que ni siquiera existe el codigo con el que podrian.
  console.log('\n5. la esquivada y el derribo (TA1 · TA2):');
  for (const mv of ['tonel', 'barrel', 'breakt', 'splits']) {
    await js('window.__mvreset()');
    gas(); await limpiar();
    const r = JSON.parse(await js(`String(window.__teatro(${JSON.stringify(mv)}))`));
    let mal = 0;
    const falla = m => { bad(`esquiva ${mv}: ${m}`); mal++; };
    if (r.error) { falla(r.error); continue; }

    let dMin = 1e9, lecturas = 0, huboBlanco = false, mvVisto = false;
    let derribo = false, matadores = 0, tocoAlJugador = null, marca = { tiroBlanco: 0, tiroFiel: 0 };
    for (let t0 = Date.now(); Date.now() - t0 < 11000;) {
      gas(); await limpiar();
      const A = JSON.parse(await js('String(window.__mvactordbg())'));
      const T = JSON.parse(await js('String(window.__teatrodbg())'));
      const fiel = A.find(a => a.bando === 'fiel');
      if (A.some(a => a.bando === 'blanco')) huboBlanco = true;
      if (fiel && fiel.mv === mv) mvVisto = true;
      if (A.some(a => a.pj.mv)) tocoAlJugador = true;
      for (const t of T) {
        if (t.de !== 'blanco') continue;
        if (t.mata) matadores++;
        lecturas++;
        // la distancia se mide contra el FIEL, que es a quien supuestamente le estan tirando
        if (fiel) dMin = Math.min(dMin, Math.hypot(t.x - fiel.x, t.y - fiel.y, t.z - fiel.z));
      }
      // EL DERRIBO se lee del marcador del teatro y no de "el blanco ya no esta": un blanco que se
      // va solo cuando se le acaba el crucero desaparece igual, y con esa vara la asercion se
      // cumplia sola. Se descubrio mirando una traza: el misil erraba y el fixture decia que si.
      // LOS CONTEOS SALEN DEL MARCADOR y no de las muestras: un tiro rapido que acierta vive menos
      // que un cuadro, y muestreando se cuenta el reloj del que mira. La DISTANCIA si se muestrea,
      // porque es lo unico que solo existe cuadro a cuadro.
      marca = JSON.parse(await js('String(window.__teatromarca())'));
      if (marca.derribos) derribo = true;
      if (!A.length && !T.length) break;
      await sleep(70);
    }
    if (!huboBlanco) falla('el blanco no llego a escena');
    if (!mvVisto) falla('el Fiel no llego a volar la pirueta');
    if (!marca.tiroBlanco) falla('el blanco NO TIRO: sin tiro no hay esquivada que mirar');
    if (matadores) falla(`${matadores} tiros del blanco venian marcados como capaces de matar`);
    if (tocoAlJugador) falla('un actor le metio una maniobra AL JUGADOR');
    if (!lecturas) falla('los tiros del blanco no llegaron a verse en ninguna muestra');
    else if (dMin < TA_CERCA) falla(`el tiro le paso a ${dMin.toFixed(1)} (minimo ${TA_CERCA}): eso es un impacto, no una esquivada`);
    else if (dMin > TA_LEJOS) falla(`el tiro mas cercano paso a ${dMin.toFixed(1)} (maximo ${TA_LEJOS}): nadie le apunto`);
    if (!marca.tiroFiel) falla('el Fiel no contesto al salir (TA2)');
    if (!derribo) falla('el blanco no cayo: la escena pedia derribarlo');
    if (!mal) ok(`${mv} · el tiro le paso a ${dMin.toFixed(1)} del Fiel (banda ${TA_CERCA}-${TA_LEJOS}) · ${marca.tiroBlanco} tiros enemigos, ${marca.tiroFiel} del Fiel · lo bajo`);
    await shot('esquiva_' + mv);
  }

  // ---------- 6. LA COREOGRAFIA COMO DATO (TA3) ----------
  // La misma escena, montada por EL DIRECTOR desde un beat (`teatro:` en data/cines.js). Lo que se
  // afirma es que **el verbo alcanza**: la timeline no describe ni un tiro ni una pirueta, dice
  // "aca va una escena del teatro" y la escena se monta sola.
  console.log('\n6. la coreografia como dato (TA3):');
  {
    await js('window.__mvreset()');
    gas(); await limpiar();
    const r = JSON.parse(await js("String(window.__teatrofilm('barrel'))"));
    let mal = 0;
    const falla = m => { bad('teatro filmado: ' + m); mal++; };
    if (!r.ok) falla('la timeline no arranco');
    let lbMax = 0, huboBlanco = false, huboTiro = false, apagado = false;
    for (let t0 = Date.now(); Date.now() - t0 < 14000;) {
      gas(); await limpiar();
      const c = JSON.parse(await js('String(window.__cdbg())') || 'null');
      const A = JSON.parse(await js('String(window.__mvactordbg())'));
      const T = JSON.parse(await js('String(window.__teatrodbg())'));
      if (A.some(a => a.bando === 'blanco')) huboBlanco = true;
      if (T.length) huboTiro = true;
      if (c && c.id) lbMax = Math.max(lbMax, c.letterbox || 0);
      else if (huboBlanco) { apagado = true; break; }
      await sleep(80);
    }
    if (!huboBlanco) falla('el beat `teatro` no monto la escena');
    if (!huboTiro) falla('la escena montada por el director no llego a tirar');
    if (!apagado) falla('el director no se apago solo despues de la escena');
    if (!mal) ok(`el beat \`teatro:\` monto blanco, tiros y derribo — y las bandas negras se fueron solas (letterbox max ${lbMax.toFixed(2)})`);
    await shot('teatro_film');
  }

  console.log('\nconsola:');
  if (errors.length) { for (const e of errors.slice(0, 6)) bad(e); }
  else ok('sin errores');

  console.log('\n' + (fails ? `FIXTURE MANIOBRAS: ${fails} FALLO(S)` : 'FIXTURE MANIOBRAS: OK') + '\n');
  app.exit(fails ? 1 : 0);
});
