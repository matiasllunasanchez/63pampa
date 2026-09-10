// FIXTURE DE ACEPTACION de las FASES y de la mision t15 IDA Y VUELTA.
// docs/sistemas/PLAN_MISION_CINCO_FASES.md §5 y §11.
//   npm run fases
//
// LO QUE CUIDA:
//   1. SIN FASES, NADA CAMBIA — la regla suprema, hermana de la de los tramos: una mision de
//      campaña reporta `idx: null` y lo RESUELTO es identico al cfg. Mientras esto valga, la
//      campaña no puede haber cambiado.
//   2. t15 EXISTE Y ES JUGABLE — se abre por la misma puerta que cualquier mision, arranca en
//      PISTA (termina aterrizando: tiene que empezar con las ruedas) y llega a 'play'.
//   3. LAS FASES GOBIERNAN — parado en cada fraccion, `__fsdbg` contesta la fase que corresponde
//      y con sus valores RESUELTOS (el techo del filo, el silencio, la nafta).
//   4. LA VUELTA VIVE PASADO EL BUQUE — la unica cosa que un TRAMO no puede hacer, y la razon de
//      que el item exista aparte.
//   5. PUNTA A PUNTA — la mision desemboca en su climax y termina en el RECUENTO, y NO en la
//      pantalla de victoria de la campaña (que es donde caia antes de la guarda del epilogo).
//   6. CERO ERRORES DE CONSOLA.
//
// Corre APARTE de `npm run check`, como tramos / caza / chancha / agua.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// una promesa que revienta no puede colgar la prueba (mismo cerrojo que el fixture de tramos)
process.on('unhandledRejection', e => { console.error('   ✗ REVENTO: ' + (e && e.message)); app.exit(1); });

const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const FS = async () => JSON.parse(await js('String(window.__fsdbg && window.__fsdbg())') || 'null');
const estado = async () => JSON.parse(await js('__pausedbg()'));

/** Entra a una mision y la deja volando, nivelada y sin teclas apretadas.
 *  El gas se da a pulsos porque una tecla SOSTENIDA es `anyPress` treinta veces por segundo, y
 *  eso adelanta solo las pantallas de fin (lo aprendio el fixture del selector). */
async function volar(id, o) {
  await js(`__mision('${id}'${o ? ', ' + JSON.stringify(o) : ''})`);
  const gas = setInterval(() => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'w' }), 40);
  let s = '';
  for (let i = 0; i < 120; i++) { s = (await estado()).state; if (s === 'play') break; await sleep(150); }
  clearInterval(gas);
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'w' });
  if (s !== 'play') return false;
  await js('__czalto(9); __czspd(74)');
  return true;
}

/** Se para en la fraccion `p` y contesta que fase rige ahi. */
async function fasePorFraccion(p) {
  await js(`__wjump(${p})`);
  await sleep(120);
  return FS();
}

app.whenReady().then(async () => {
  win = new BrowserWindow({ width: 960, height: 540, show: false, webPreferences: { offscreen: true } });
  // el aviso de CSP es de Electron en modo dev, no del juego: lo filtran los nueve fixtures
  win.webContents.on('console-message', (_e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  await win.loadFile(path.join(ROOT, 'src', 'index.html'));
  await sleep(1200);

  // ---------- 1. SIN FASES, NADA CAMBIA ----------
  console.log('\n1. la regla suprema — una mision de campaña no tiene fases:');
  if (!await volar('m4')) bad('m4 no llego a volar');
  else {
    await js('__wjump(0.4)'); await sleep(150);
    const f = await FS();
    if (f && f.idx === null && f.n === 0) ok('m4 reporta idx null: no hay fase, manda el cfg plano');
    else bad(`m4 reporta ${JSON.stringify(f && { idx: f.idx, n: f.n })}`);
    // …Y LO RESUELTO ES EL CFG. Es la unica forma de comprobar desde afuera que el fallback no se
    // desvio: sin fases, los dos numeros tienen que ser EL MISMO.
    if (f && f.cfg && f.obstacles === f.cfg.obstacles && f.caza === f.cfg.caza && f.bombs === f.cfg.bombs)
      ok(`lo resuelto ES el cfg (obstacles ${f.obstacles}, caza ${f.caza}, bombs ${f.bombs})`);
    else bad(`lo resuelto se desvio del cfg: ${JSON.stringify(f)}`);
  }

  // ---------- 2. t15 EXISTE Y ES JUGABLE ----------
  console.log('\n2. t15 IDA Y VUELTA se abre y se vuela:');
  const abierta = JSON.parse(await js(`__mision('t15', {"cfg":{"start":"runway"},"volver":"pruebas"})`) || 'null');
  if (abierta && abierta.id === 't15') ok(`la mision existe y se resuelve (indice ${abierta.i}, test ${abierta.test})`);
  else bad(`__mision('t15') contesto ${JSON.stringify(abierta)}`);
  // ARRANCA EN PISTA: es la unica prueba del catalogo que termina aterrizando, asi que tiene que
  // empezar con las ruedas. Si esto se rompe, el momento pierde la mitad de lo que viene a medir.
  if (abierta && abierta.state === 'takeoff') ok('arranca en la pista, no en el aire');
  else bad(`arranco en '${abierta && abierta.state}' y deberia ser 'takeoff'`);

  if (!await volar('t15', { cfg: { start: 'runway' }, volver: 'pruebas' })) { bad('t15 no llego a volar'); }
  else {
    ok('despega y llega al pasillo');

    // ---------- 3. LAS FASES GOBIERNAN ----------
    console.log('\n3. cada fraccion contesta su fase, con los valores resueltos:');
    const esperado = [
      [0.03, 'transito'], [0.08, 'filo'], [0.13, 'transito'],
      [0.18, 'descenso'], [0.50, 'rasante'], [0.84, 'filo'], [0.95, 'blanco'],
    ];
    for (const [p, tipo] of esperado) {
      const f = await fasePorFraccion(p);
      if (f && f.tipo === tipo) ok(`p=${p} → ${tipo} (radar ${f.radar}, voces ${f.voces}, nafta x${f.nafta})`);
      else bad(`p=${p} deberia ser '${tipo}' y es '${f && f.tipo}'`);
    }
    // EL FILO ESTRANGULA DE VERDAD, y el segundo mas que el primero: el primero enseña la banda,
    // el segundo la cobra. Sin esa diferencia son dos veces la misma prueba.
    const f1 = await fasePorFraccion(0.08), f2 = await fasePorFraccion(0.84);
    const transito = await fasePorFraccion(0.03);
    if (f1.radar < transito.radar) ok(`el filo baja el techo de ${transito.radar} a ${f1.radar}`);
    else bad(`el filo no estrangula: techo ${f1.radar} contra ${transito.radar} del transito`);
    if (f2.radar < f1.radar) ok(`y el segundo filo aprieta mas que el primero (${f2.radar} < ${f1.radar})`);
    else bad(`el segundo filo no aprieta mas: ${f2.radar} contra ${f1.radar}`);
    // EL SILENCIO Y LA NAFTA, que son las otras dos mitades de la fase
    if (transito.voces === true && f1.voces === false) ok('el transito habla y el filo esta mudo');
    else bad(`voces transito=${transito.voces} filo=${f1.voces}`);
    if (f1.nafta === 2) ok('el filo quema al doble: es el regimen rasante');
    else bad(`la nafta del filo es x${f1.nafta}`);

    // ---------- 4. LA VUELTA VIVE PASADO EL BUQUE ----------
    console.log('\n4. la vuelta — lo que un tramo no puede hacer:');
    const v = await fasePorFraccion(1.5);
    if (v && v.tipo === 'vuelta') ok(`a p=1.5, pasado el buque, sigue habiendo fase: ${v.tipo}`);
    else bad(`pasado el objetivo la fase es '${v && v.tipo}' y deberia ser 'vuelta'`);
    if (v && v.voces === true) ok('y las voces VUELVEN: es el pase de lista, gratis');
    else bad(`la vuelta reporta voces=${v && v.voces}`);
    if (v && v.nafta === 0.85) ok('y quema menos: venis liviano, sin bombas');
    else bad(`la nafta de la vuelta es x${v && v.nafta}`);
    // …y pasada la ULTIMA fase ya no hay nada: aterrizaste
    const fin = await fasePorFraccion(2.6);
    if (fin && fin.idx === null) ok('pasada la ultima fase no hay fase: se acabo la mision');
    else bad(`a p=2.6 todavia reporta ${JSON.stringify(fin && fin.tipo)}`);
  }

  // ---------- 4b. LO QUE CADA FASE CAMBIA DE VERDAD (paso 3) ----------
  // Hasta aca se comprobo que la fase CONTESTA lo que corresponde. Esto mide que ademas GOBIERNE:
  // que el sembrador, el radar y el tanque lean lo resuelto y no el cfg plano.
  console.log('\n4b. los lectores — que lo resuelto gobierne, no solo que se reporte:');
  if (!await volar('t15', { cfg: { start: 'runway' }, volver: 'pruebas' })) bad('t15 no llego a volar (lectores)');
  else {
    // LA SIEMBRA. El transito promete CERO enemigos y la vuelta es el pasillo de siempre. El
    // segundo numero es el que importa: antes de destrabar el cordon final, pasado el buque no
    // nacia NADA nunca mas — la fase podia declarar lo que quisiera y el `return` estaba antes.
    const contar = async (p, ms) => {
      await js(`__wjump(${p})`); await sleep(200);
      await js(`__wjump(${p}); __trclear()`);
      const t0 = Date.now();
      while (Date.now() - t0 < ms) { await sleep(300); await js(`__wjump(${p})`); }
      return JSON.parse(await js('String(__trcount())'));
    };
    // LA CALMA PUESTA PARA CONTAR. `__trcount` cuenta NACIMIENTOS, no poblacion, asi que limpiar
    // el mundo por cuadro no toca la medicion — y evita que el avion se muera a mitad de la cuenta,
    // que es lo que pasaba desde que la vuelta subio a `caza: 2`.
    await js('__czcalma(1)');
    const enTransito = await contar(0.03, 4000);
    const enCordon = await contar(0.85, 4000);
    if (enTransito.n === 0) ok('transito: CERO enemigos, "sin un solo enemigo en pantalla"');
    else bad(`nacieron ${enTransito.n} enemigos en un transito que tiene que estar limpio`);
    // EL CORDON FINAL SIGUE MANDANDO antes del buque, que es la mitad que NO tenia que cambiar:
    // destrabarlo para la vuelta no puede aflojarlo ni un metro en la aproximacion.
    if (enCordon.n === 0) ok('el cordon final sigue vaciando la aproximacion: 0 spawns pasado 0.74');
    else bad(`nacieron ${enCordon.n} enemigos pasado el corte del cordon final`);
    // LA SIEMBRA DE LA VUELTA. Para medirla hay que estar DE VERDAD en el regreso: pararse pasado
    // el buque con `__wjump` a secas entra al climax en el acto (`readyToEnter` es `dist >=
    // objetivo`). `run.climaxHecho` es la marca que dice "el climax ya se jugo", y es la misma que
    // pone el juego al salir del blanco, asi que esto reproduce el estado real y no uno inventado.
    await js('__vuelta()');
    const enVuelta = await contar(1.5, 4000);
    if (enVuelta.n > 0) ok(`la VUELTA siembra: ${enVuelta.n} enemigos pasado el buque (el cordon ya no la ahoga)`);
    else bad('pasado el buque no nacio nadie: el corte del cordon final sigue trabado');

    // EL TECHO DE RADAR. Se mide donde duele: a una altura que es SEGURA en el transito y te
    // PINTA en el filo. Si el umbral no fuera el de la fase, los dos darian igual.
    await js('__czcalma(0)');
    const detEn = async (p, alt, ms) => {
      // UNA PULSADA DE CALMA ANTES DE MEDIR: pone `run.detection` en cero y barre los misiles que
      // dejo la medicion anterior. Sin esto la barra llegaba cargada de un bloque al siguiente y el
      // transito "detectaba" a una altura que es segura — y encima los misiles viejos mataban al
      // avion en mitad de la cuenta siguiente.
      await js('__czcalma(1)'); await sleep(450); await js('__czcalma(0)');
      // NO SE BAJA A RAS PARA RESETEAR LA BARRA. La primera version lo hacia con `__czalto(1)`, y
      // ahi el avion ROZA el agua: se le agota el margen de SCRAPE y se muere en mitad de la
      // medicion. Con el vuelo detenido la deteccion se queda en cero, asi que el filo daba un
      // falso negativo perfecto. Y no hace falta: por debajo del techo la barra se descarga sola
      // (dt/0.9), y la medicion del transito ya deja el avion con la barra en cero para la del filo.
      await js(`__wjump(${p}); __czalto(${alt}); __psnafta()`);
      const t0 = Date.now();
      let d = 0;
      while (Date.now() - t0 < ms) { await sleep(250); await js(`__wjump(${p})`); d = JSON.parse(await js('String(__charadar())')).det; }
      return d;
    };
    const altPrueba = 13;  // debajo de RADAR_ALT=20 (seguro en transito) y encima de FILO_RADAR=9
    const dTransito = await detEn(0.03, altPrueba, 1500);
    const dFilo = await detEn(0.084, altPrueba, 1500);
    if (dTransito === 0) ok(`a ${altPrueba} de altura el transito no te ve (deteccion ${dTransito})`);
    else bad(`el transito detecto a ${altPrueba} de altura: ${dTransito}`);
    if (dFilo > 0) ok(`…y a LA MISMA altura el filo si te pinta (deteccion ${dFilo}): el techo es de la fase`);
    else bad(`el filo no detecto a ${altPrueba} de altura teniendo el techo en 9`);

    // EL TANQUE. La misma ventana de vuelo en dos fases con multiplicador distinto tiene que
    // gastar distinto. Se compara transito (x1) contra filo (x2).
    // SE MIDE A ALTURA 3, POR DEBAJO DEL TECHO DE LAS DOS FASES, y la razon la enseño la primera
    // version de esta prueba: midiendo a 9 el avion volaba SOBRE el techo del filo (6), el radar lo
    // pintaba, la oleada de misiles lo bajaba y la ventana terminaba en 'relevo' — o sea que la
    // medicion del gasto se comia media fase muerta y daba 5.84%/s donde tenia que dar 6.40. Es un
    // lindo recordatorio de que el filo funciona, pero para medir el TANQUE hay que sobrevivirlo.
    // Se devuelve la TASA (%/s) y no el total: asi el numero es comparable contra FUEL_RATE.
    // …Y CON LA CALMA PUESTA. La prueba del techo, dos parrafos arriba, deja el radar cargado y
    // una oleada de misiles en el aire: sin esto los que se lanzaron durante la medicion del FILO
    // alcanzaban al avion durante la del TRANSITO, y la ventana terminaba en 'relevo'. `__czcalma`
    // limpia misiles y deteccion por cuadro sin tocar el tanque, que es exactamente lo que hace
    // falta para medir consumo y nada mas.
    await js('__czcalma(1)');
    const gasto = async p => {
      await js(`__wjump(${p}); __czalto(3); __psnafta()`);
      const f0 = +(await js('__chanafta()'));
      const t0 = Date.now();
      for (let i = 0; i < 12; i++) { await sleep(250); await js(`__wjump(${p})`); }
      const ms = Date.now() - t0;
      const st = JSON.parse(await js('__pausedbg()')).state;
      return { tasa: (f0 - +(await js('__chanafta()'))) / (ms / 1000), st };
    };
    const gT = await gasto(0.03), gF = await gasto(0.084);
    // LA REFERENCIA LLEVA LA ESCALA DE LA MISION. t15 declara `fuelScale: 0.08` porque el modelo
    // de nafta esta calibrado contra pasillos de medio minuto (100 de tanque a 3.2 %/s son 31 s de
    // vuelo) y esta mision dura cinco minutos. Asi que lo esperado no es FUEL_RATE pelado sino
    // FUEL_RATE x escala: 0.256 %/s de crucero y el doble en el filo.
    // SE AFIRMAN LAS DOS COSAS —el numero Y la razon— a proposito: el numero atrapa que la escala
    // se aplique, y la razon atrapa que el multiplicador de FASE siga diciendo lo que dice. Con una
    // sola de las dos, bajar la escala a cero daria verde en la razon y romper el x2 daria verde en
    // el numero si alguien ajusta la escala para compensar.
    const ESPERADO_CRUCERO = 3.2 * 0.065, ESPERADO_FILO = ESPERADO_CRUCERO * 2;
    const cerca = (a, b) => Math.abs(a - b) < 0.05;
    if (gT.st !== 'play' || gF.st !== 'play') bad(`la medicion no sobrevivio: transito '${gT.st}', filo '${gF.st}'`);
    // contra el NUMERO, no contra una razon: 3.2 %/s de crucero y 6.4 en el filo son FUEL_RATE x1
    // y x2. Una razon sola no distingue "el multiplicador anda" de "las dos fases estan mal".
    else if (cerca(gT.tasa, ESPERADO_CRUCERO) && cerca(gF.tasa, ESPERADO_FILO)
             && Math.abs(gF.tasa / gT.tasa - 2) < 0.15)
      ok(`el tanque obedece a la fase: ${gT.tasa.toFixed(3)}%/s en transito y ${gF.tasa.toFixed(3)}%/s en filo (x${(gF.tasa / gT.tasa).toFixed(2)})`);
    else bad(`tasas transito ${gT.tasa.toFixed(3)}%/s (esperada ${ESPERADO_CRUCERO.toFixed(3)}) y filo ${gF.tasa.toFixed(3)}%/s (esperada ${ESPERADO_FILO.toFixed(3)})`);
    await js('__czcalma(0)');   // la calma es PEGAJOSA: se apaga o contamina lo que venga despues
  }

  // ---------- 5. PUNTA A PUNTA ----------
  // El paso 2 del plan pide que la mision se pueda jugar ENTERA. Lo que se comprueba aca es que
  // desemboca en su climax y que TERMINA EN EL RECUENTO — y no en la pantalla de VICTORIA, que es
  // donde caia antes de la guarda del epilogo (una mision sin `epi` iba a `advanceCampaign`, y sin
  // campaña siguiente eso es el final del juego entero por haber volado una prueba).
  console.log('\n5. punta a punta — desemboca en el climax y termina en el recuento:');
  if (!await volar('t15', { cfg: { start: 'runway' }, volver: 'pruebas' })) bad('t15 no llego a volar (segunda pasada)');
  else {
    await js('__wjump(0.999)');
    let s = '';
    for (let i = 0; i < 60; i++) { s = (await estado()).state; if (s !== 'play') break; await sleep(200); }
    if (['pulso', 'pasada', 'arena', 'momentum'].includes(s)) ok(`la aproximacion desemboca en el climax ('${s}')`);
    else bad(`tras llegar al buque el estado es '${s}'`);

    // EL CLIMAX SE GANA TECLEANDO, no apretando cualquier cosa: EL PULSO es un examen de piruetas
    // y a los tres errores te derriba. Se juega con las MISMAS sondas que usa `npm run pulso`
    // (`__qdbg` para leer que espera, `__qtap` para contestarlo), porque lo que este paso tiene
    // que probar es EL CAMINO DE SALIDA de la mision, no la destreza del fixture.
    if (s === 'pulso') {
      for (let k = 0; k < 40; k++) {
        const d = JSON.parse(await js('String(window.__qdbg && window.__qdbg())') || 'null');
        if (!d || d.fase !== 'prueba') break;
        const e = d.zi < 0 ? d.esperado[0] : d.esperado;
        if (!e) break;
        await js(`window.__qtap(${JSON.stringify(e)})`);
      }
      // la cinematica del premio corre en camara lenta: sus ~6 s de pelicula son ~9 de reloj
      for (let k = 0; k < 110; k++) { s = (await estado()).state; if (s !== 'pulso') break; await sleep(150); }
    }
    // EL BUQUE YA NO ES EL FINAL (§11). Salir del climax devuelve AL PASILLO, no al recuento:
    // lo que sigue es la vuelta. Esta es la afirmacion central del paso 4.
    if (s === 'play') ok('el climax NO cierra la mision: devuelve al pasillo, y lo que sigue es la vuelta');
    else if (s === 'results') bad('el climax cerro la mision en el buque: la vuelta no se esta jugando');
    else if (s === 'victory') bad('termino en la pantalla de VICTORIA: la guarda del epilogo no esta actuando');
    else bad(`tras el climax quedo en '${s}'`);

    // …Y LA VUELTA SI TERMINA. Pasado el ultimo `hasta` llegaste a casa y ahi si cierra la mision.
    if (s === 'play') {
      const fv = await FS();
      if (fv && fv.tipo === 'vuelta') ok(`y al volver al pasillo la fase vigente es '${fv.tipo}' (voces ${fv.voces})`);
      else bad(`tras el climax la fase es '${fv && fv.tipo}' y deberia ser 'vuelta'`);
      await js('__wjump(2.1)');       // pasado el ultimo hasta de t15 (2.0): llegaste
      for (let i = 0; i < 40; i++) { s = (await estado()).state; if (s !== 'play') break; await sleep(200); }
      if (s === 'landing') ok('pasada la ultima fase arranca LA CORTA FINAL, no el recuento');
      else bad(`pasada la ultima fase el estado es '${s}' y deberia ser 'landing'`);
    }

    // ---------- 5b. EL ATERRIZAJE (paso 4) ----------
    // La regla del §4 puesta a prueba: un mal aterrizaje CUESTA y NUNCA hace perder la mision. Se
    // vuela el peor caso a proposito —sin tocar nada, sin sacar el tren— y se exige que igual
    // termine en el RECUENTO. Si esto alguna vez cae en 'dead', el item se rompio.
    if (s === 'landing') {
      console.log('\n5b. la corta final — el peor aterrizaje posible tiene que TERMINAR igual:');
      for (let i = 0; i < 90; i++) { s = (await estado()).state; if (s !== 'landing') break; await sleep(200); }
      if (s === 'results') ok('sin tocar una tecla toca igual y la mision se COMPLETA (nunca se pierde)');
      else if (s === 'dead') bad('un mal aterrizaje mato al jugador: el §4 dice que eso no puede pasar');
      else bad(`tras tocar el estado es '${s}'`);
      const lr = JSON.parse(await js('String(JSON.stringify((window.__lastRun && window.__lastRun()) || null))') || 'null');
      const fila = lr && lr.rows && lr.rows.find(r => r.k === 'res_land');
      if (fila) ok(`y el recuento trae la fila del aterrizaje: ${fila.n} medidas, ${fila.v} puntos`);
      else bad('el recuento no trae la fila del aterrizaje');
    }

    // …Y DEL RECUENTO, AL CATALOGO. Es la mitad que importa: t15 no lleva `epi`, y sin la guarda
    // caia en `advanceCampaign()` — que sin campaña siguiente muestra la VICTORIA del juego entero.
    if (s === 'results') {
      for (let i = 0; i < 40; i++) {
        s = (await estado()).state;
        if (s !== 'results') break;   // se paro en algun lado: sea el que sea, se reporta abajo
        win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Space' });
        await sleep(40);
        win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Space' });
        await sleep(250);
      }
      if (s === 'pruebas') ok('y del recuento vuelve al catalogo de PRUEBAS, sin pasar por la campaña');
      else bad(`del recuento fue a '${s}' en vez de volver al catalogo`);
    }
  }

  // ---------- 6. CONSOLA ----------
  console.log('\n6. consola:');
  if (errors.length) { bad(`${errors.length} error(es):`); errors.slice(0, 8).forEach(e => console.error('     ' + e)); }
  else ok('sin errores');

  console.log(fails ? `\nFASES: ${fails} FALLA(S)\n` : '\nFASES: OK\n');
  app.exit(fails ? 1 : 0);
});
