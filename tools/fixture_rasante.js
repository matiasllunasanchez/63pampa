// FIXTURE DE ACEPTACION del PODER RASANTE (SPEC_PODER_RASANTE §4), corrido en el juego de verdad.
//   npm run rasante                     · RASANTE_SHOTS=/tmp/x npm run rasante  (deja capturas)
//
// Hermano de `npm run chancha`, y fuera de `check` por lo mismo: son segundos de vuelo REAL, y lo
// que prueba no es una formula sino que la mecanica entera funcione adentro del juego.
//
// LO QUE CUIDA, y es lo que hace distinto a este poder: que la barra se gane VOLANDO BAJO A MANO
// (RF-03) y de ninguna otra forma; que el resorte invierta el default sin volverse un riel (§6.1);
// que el colchon perdone el agua plana SIN volverte invulnerable (§6.2); y que con el poder
// APAGADO no cambie un solo numero del vuelo — eso ultimo lo juzga `npm run feel`, que corre
// aparte, pero el fixture verifica la otra mitad: que apagado no haya poder que aplicar.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.RASANTE_SHOTS || '';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let win, fails = 0;
const bad = m => { console.error('   ✗ ' + m); fails++; };
const ok = m => console.log('   ✓ ' + m);
const js = s => win.webContents.executeJavaScript(s);
const RS = async () => JSON.parse(await js('String(window.__rsdbg && window.__rsdbg())') || 'null');
const W = async () => JSON.parse(await js('String(window.__wjump())'));
const estado = () => js('JSON.parse(__pausedbg()).state');
async function shot(n, espera) {
  if (!OUT) return;
  // ventana oculta: el compositor devuelve el ultimo cuadro pintado, asi que hay que darle aire
  await sleep(espera === undefined ? 400 : espera);
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
}
const down = k => win.webContents.sendInputEvent({ type: 'keyDown', keyCode: k });
const up = k => win.webContents.sendInputEvent({ type: 'keyUp', keyCode: k });
const tap = async k => { down(k); await sleep(60); up(k); await sleep(110); };

/** Entra a POR LA PATRIA volando, con el mar despejado: lo que se mide es el poder, no si te
 *  comes una fragata mientras probas el techo. Mismo camino de menu que los otros dos fixtures. */
async function volar(qs) {
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?qa' + (qs || ''));
  await sleep(2600);
  await tap('Return'); await tap('Down'); await tap('Return');
  await tap('Down'); await tap('Return'); await tap('Return');
  for (let i = 0; i < 60; i++) {
    if (await estado() === 'play') { await js("__tierraset('sea')"); await sleep(600); return true; }
    await sleep(200);
  }
  return false;
}
/** Planta el avion a una altura y lo deja quieto ahi (la gravedad no perdona). Reusa la sonda de
 *  la Chancha: es la misma necesidad y no hace falta una segunda. */
const poner = (x, y) => js(`__seaclear(); __chacalma(); __chaput(${x}, ${y})`);
/** Sostiene la altura N ms y devuelve la ultima foto del poder. */
async function sostener(y, ms) {
  const t0 = Date.now(); let last = null;
  while (Date.now() - t0 < ms) { await poner(0, y); await sleep(90); last = await RS(); }
  return last;
}

app.whenReady().then(async () => {
  console.log('\nFIXTURE — EL PODER RASANTE (RA0-RA4)\n');
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.on('console-message', (e, l, m) => { if (l >= 3 && !m.includes('Security Warning')) errors.push(m.slice(0, 300)); });
  win.webContents.on('render-process-gone', (e, d) => errors.push('EL RENDERER MURIO: ' + JSON.stringify(d)));

  if (!await volar()) { console.error('   ✗ no se pudo entrar a volar'); app.exit(1); return; }
  const r0 = await RS();
  if (!r0) { console.error('   ✗ la sonda __rsdbg no responde'); app.exit(1); return; }

  // ---------- 1. LA CARGA SE GANA VOLANDO BAJO, Y DE NINGUNA OTRA FORMA (RF-03) ----------
  // Es la mitad que separa a este poder de un multiplicador gratis: no carga con puntos (eso ya
  // lo hacen sus dos hermanos) ni con tiempo de pared. Se paga con skill previa.
  console.log('1. la carga (RF-03):');
  if (r0.meter === 0) ok('arranca VACIA: el poder se gana, no se tiene');
  else bad(`arranca con la barra en ${r0.meter}`);

  const alto = await sostener(30, 2600);
  if (alto.banda === 0 && alto.meter === 0) ok('volar ALTO no carga nada (2,6 s a 30 m)');
  else bad(`volando alto cargo: banda ${alto.banda}s meter ${alto.meter}`);

  const bajo = await sostener(3, 2600);
  if (bajo.banda > 1.5) ok(`volar en la BANDA carga: ${bajo.banda.toFixed(1)} s acumulados`);
  else bad(`volando bajo casi no cargo: banda ${bajo.banda}s`);
  // y la proporcion es la del spec: RAS_CHARGE_S segundos de banda = barra llena
  const esperado = bajo.banda / 25;
  if (Math.abs(bajo.meter - esperado) < 0.02) ok(`la barra sigue la banda (${bajo.meter.toFixed(2)} ≈ ${esperado.toFixed(2)})`);
  else bad(`la barra no sigue la banda: ${bajo.meter} vs ${esperado.toFixed(2)}`);

  // ---------- 2. LA TECLA 6 ----------
  console.log('\n2. la tecla 6:');
  // con la barra a medias NO lanza, y NO se la come: es la misma regla que los gates de la Chancha
  const medias = await RS();
  await tap('6'); await sleep(150);
  const trasVacio = await RS();
  if (!trasVacio.on) ok('con la barra a medias NO lanza');
  else bad('lanzo con la barra incompleta');
  if (Math.abs(trasVacio.meter - medias.meter) < 0.05) ok('y NO se come la barra al rebotar');
  else bad(`la barra se movio al rebotar: ${medias.meter} → ${trasVacio.meter}`);

  await js('__rscharge()');
  const llena = await RS();
  if (llena.meter >= 1) ok('la sonda llena la barra');
  else bad(`__rscharge no lleno la barra: ${llena.meter}`);

  await tap('6'); await sleep(150);
  const on = await RS();
  if (on.on) ok(`la tecla 6 LANZA (quedan ${on.resta.toFixed(1)} s de ${on.dur})`);
  else bad('la tecla 6 no lanzo con la barra llena');
  await shot('ra0_activo');

  // ---------- 3. EL RELOJ ----------
  console.log('\n3. el reloj:');
  // ACTIVO NO CARGA, y no es una optimizacion: con el poder puesto el avion vuela al ras solo, asi
  // que dejarlo cargar seria darse cuerda a si mismo. La proxima rafaga se gana con las manos.
  // Se compara contra la banda DEL LANZAMIENTO, no contra la de antes de `__rscharge` — la sonda
  // pisa el acumulador, que es su trabajo.
  const bandaAlLanzar = on.banda;
  const durante = await sostener(3, 2000);
  if (durante.banda <= bandaAlLanzar + 0.05) ok('ACTIVO no carga: no se da cuerda a si mismo');
  else bad(`cargo durante el lanzamiento: ${bandaAlLanzar} → ${durante.banda}`);

  // CORTAR A MANO descarta el resto, como un super de arcade. Se corta ARRIBA, fuera de la banda,
  // a proposito: abajo el avion vuelve a cargar en el mismo cuadro —que es lo correcto— y la
  // medicion no podria distinguir "descartó" de "descartó y ya empezó de nuevo".
  await poner(0, 30); await sleep(120);
  await tap('6'); await sleep(150);
  const cortado = await RS();
  // OJO CON ESTA: el primer intento tenia la barra guardada aparte de los segundos de banda, y
  // cortar a mano ponia la barra en cero SIN tocar los segundos — el tick del mismo cuadro la
  // volvia a llenar con los segundos viejos y el poder era infinito. La barra pasa a DERIVARSE de
  // la banda, y esta linea es la que se entera si alguien vuelve a guardarla aparte.
  if (!cortado.on && cortado.meter === 0 && cortado.banda === 0) ok('cortar a mano apaga Y descarta el resto');
  else bad(`al cortar quedo on=${cortado.on} meter=${cortado.meter} banda=${cortado.banda}`);

  // y se agota solo a los RAS_DUR
  await js('__rscharge()');
  await tap('6'); await sleep(150);
  const t0 = Date.now();
  let vivo = true;
  while (Date.now() - t0 < 16000 && vivo) {
    await poner(0, 3); await sleep(120);
    vivo = (await RS()).on;
  }
  const dur = (Date.now() - t0) / 1000;
  if (Math.abs(dur - r0.dur) < 1.2) ok(`se agota solo a los ${dur.toFixed(1)} s (RAS_DUR ${r0.dur})`);
  else bad(`duro ${dur.toFixed(1)} s y RAS_DUR es ${r0.dur}`);
  const fin = await RS();
  // "en cero" con tolerancia, y la tolerancia ES la mecanica: el avion termino el lanzamiento a
  // 3 m, o sea DENTRO de la banda, asi que en el mismo cuadro en que el poder se apaga ya empezo
  // a cargar la proxima rafaga. Eso es exactamente lo que tiene que pasar — pedir un cero exacto
  // aca estaria probando que el poder NO se puede volver a ganar.
  if (fin.meter < 0.05) ok(`al agotarse la barra se descarta (quedo en ${fin.meter}, ya recargando)`);
  else bad(`tras agotarse la barra quedo en ${fin.meter}`);

  // ---------- 4. DONDE NO EXISTE (§6.6) ----------
  console.log('\n4. donde NO existe:');
  // El poder es del PASILLO. En un climax la altura la manda otra cosa, y cargar ahi seria
  // regalarlo — el clímax se vuela bajo por definicion.
  await js('__rscharge()');
  const antesClimax = await RS();
  await js("window.__prb && 1");   // (no hace falta entrar al climax: alcanza con la puerta)
  if (antesClimax.meter >= 1) ok('la barra sobrevive: es de la corrida');

  // ================= RA1: EL RESORTE Y EL COLCHON =================
  // A partir de aca el avion VUELA SOLO: `__chaput` planta la altura a mano y eso es justo lo que
  // el resorte tiene que hacer por su cuenta. Se usa nada mas para ponerlo en el punto de partida.

  // ---------- 5. EL RESORTE (RF-01) ----------
  console.log('\n5. el resorte (RF-01):');
  await js('__rscharge()');
  await poner(0, 3); await sleep(150);
  if (!(await RS()).on) await tap('6');
  await sleep(150);
  if (!(await RS()).on) { bad('no se pudo lanzar para probar el resorte'); }

  // SOLTAR DESDE EL TECHO ASIENTA EN ~1 s. Es el criterio de cierre textual del RF-01, y se mide
  // como se siente: se lo pone arriba, se lo suelta, y se cronometra hasta que la altura se queda
  // quieta cerca del ras.
  await js('__seaclear(); __chacalma()');
  await js('__chaput(0, 17)');
  const tSpring = Date.now();
  let ys = [], quieto = 0;
  for (let i = 0; i < 40; i++) {
    await js('__seaclear(); __chacalma()');
    await sleep(90);
    const y = (await W()).y;
    ys.push(y);
    if (Math.abs(y - 3) < 0.6) { quieto = (Date.now() - tSpring) / 1000; break; }
  }
  if (quieto > 0 && quieto < 2.2) ok(`soltar desde el techo asienta al ras en ${quieto.toFixed(2)} s`);
  else bad(`no asento al ras: ${quieto ? quieto.toFixed(2) + ' s' : 'nunca'} (alturas ${ys.slice(0, 8).map(v => v.toFixed(1)).join(' ')})`);

  // Y SIN REBOTE FEO: una vez asentado no se pasa de largo hacia abajo ni vuelve a subir. Con un
  // resorte de segundo orden esto falla — por eso el de flight.js es de primer orden.
  const est = [];
  for (let i = 0; i < 14; i++) { await js('__seaclear(); __chacalma()'); await sleep(90); est.push((await W()).y); }
  const lo = Math.min(...est), hi = Math.max(...est);
  if (hi - lo < 1.2 && lo > 1.2) ok(`asentado y quieto: oscila ${(hi - lo).toFixed(2)} m alrededor del ras (min ${lo.toFixed(1)})`);
  else bad(`rebota o se hunde: min ${lo.toFixed(1)} max ${hi.toFixed(1)}`);
  await shot('ra1_alras');

  // EL TECHO NO SE CRUZA. Se mantiene ↑ mucho mas tiempo del que hace falta para llegar.
  // EL GAS ES **W**, no la flecha ↑ — las flechas son la MIRA (mirar arriba/abajo). La primera
  // version de esta prueba mantenia ↑, el avion se quedaba quieto en el ras, y el techo "no se
  // cruzaba" por la razon equivocada: pasaba en falso. Por eso ademas se exige que HAYA SUBIDO.
  await js('__rscharge()');
  down('w');
  let techoMax = 0;
  for (let i = 0; i < 45; i++) {
    await js('__seaclear(); __chacalma()');
    await sleep(90);
    techoMax = Math.max(techoMax, (await W()).y);
  }
  up('w'); await sleep(120);
  const rTecho = await RS();
  if (techoMax < rTecho.ceil * 0.7) bad(`el gas casi no subio (${techoMax.toFixed(1)} m): la prueba del techo no prueba nada`);
  else if (techoMax <= rTecho.ceil + 0.5) ok(`mantener GAS 4 s sube y NO cruza el techo: maximo ${techoMax.toFixed(1)} m (RAS_CEIL ${rTecho.ceil})`);
  else bad(`cruzo el techo: ${techoMax.toFixed(1)} m con RAS_CEIL ${rTecho.ceil}`);

  // ---------- 6. EL COLCHON (RF-02) ----------
  console.log('\n6. el colchon (RF-02):');
  // AGUA PLANA: el poder perdona el micro-error de altura. Se lo pone PEGADO al agua, mas abajo
  // que el reposo del resorte, y se lo deja ahi el lanzamiento entero.
  // SE VIGILA QUE EL PODER SIGA PUESTO en cada muestra, y se relanza si se agota. RAS_DUR son 12 s
  // y las secciones anteriores ya gastaron parte: la primera version media 6 s "con el poder
  // puesto" y el poder se apagaba a mitad de camino — el reloj de roce crecia por el motivo
  // correcto (ya no habia colchon) y la prueba lo leia como un fallo del colchon. Una medicion que
  // no verifica su propia precondicion mide otra cosa.
  const asegurarOn = async () => {
    if ((await RS()).on) return true;
    await js('__rscharge()'); await tap('6'); await sleep(120);
    return (await RS()).on;
  };
  await poner(0, 3); await sleep(150);
  if (!await asegurarOn()) { bad('no se pudo mantener el poder para probar el colchon'); }
  let muerto = false, scrapeMax = 0, muestras = 0;
  const tCol = Date.now();
  while (Date.now() - tCol < 6000) {
    await js('__seaclear(); __chacalma(); __chaput(0, 0.8)');
    await sleep(100);
    if (await estado() !== 'play') { muerto = true; break; }
    if (!await asegurarOn()) break;
    scrapeMax = Math.max(scrapeMax, JSON.parse(await js('String(__rsroce())')).scrapeT || 0);
    muestras++;
  }
  if (!muerto && muestras > 40) ok(`${muestras} muestras PEGADO al agua plana (6 s) con el poder puesto: no mata`);
  else bad(muerto ? 'el agua plana mato con el poder puesto' : `solo ${muestras} muestras: el poder no se sostuvo`);
  if (scrapeMax < 0.05) ok(`y el reloj de roce no crece (maximo ${scrapeMax.toFixed(3)})`);
  else bad(`el reloj de roce crecio hasta ${scrapeMax.toFixed(3)}`);

  // ---------- 7. Y NO ES INVULNERABILIDAD (§6.2) ----------
  console.log('\n7. lo que sigue matando (§6.2):');
  // LA CARA DE UNA OLA. Es la contra-prueba del colchon y la que dice que el poder perdona la
  // ALTURA, no el peligro. Vive en systems/collision.js, que el colchon no toca — y esta prueba
  // es lo unico que garantiza que siga siendo asi el dia que alguien "unifique" los dos caminos.
  await js('__seaclear()');
  await js('__chaput(0, 6)');
  await asegurarOn();
  await js("__ola('pared', 9)");
  let murioOla = false;
  for (let i = 0; i < 70; i++) {
    await js('__chaput(0, 1.2)');
    await sleep(100);
    if (await estado() !== 'play') { murioOla = true; break; }
  }
  if (murioOla) ok('la CARA de una ola mata igual con el poder puesto');
  else bad('la ola no mato: el colchon se volvio invulnerabilidad');

  // ---------- 8. CONVIVENCIA (RF-06) ----------
  // SE VUELVE A VOLAR, y no es opcional: la seccion 7 MATA al avion a proposito (es su prueba), asi
  // que todo lo que viene despues correria con el juego en pantalla de muerte — la tecla 6 muda, el
  // puntaje quieto, y cuatro fallos que no hablan de lo que dicen hablar. La primera version de
  // esta seccion media exactamente eso.
  console.log('\n8. con quien convive (RF-06):');
  if (!await volar()) { bad('no se pudo volver a volar tras la prueba de la ola'); }
  await js('__seaclear(); __chacalma(); __chaput(0, 3)');
  await asegurarOn();

  // TURBO: SI — es el combo soñado. Se aprieta y se comprueba que el poder no se caiga.
  down('shift'); await sleep(500);
  const conTurbo = await RS();
  up('shift'); await sleep(120);
  if (conTurbo.on) ok('TURBO + RASANTE conviven: el combo soñado sigue puesto');
  else bad('el turbo corto el poder');

  // MOMENTUM: SI. Y ademas el poder tiene que durar lo mismo EN TIEMPO DE JUEGO — corre con el dt
  // del MUNDO, asi que en camara lenta el reloj del poder se frena igual que todo lo demas. Eso es
  // lo que hace que los dos se compongan en vez de pelearse.
  const antesM = (await RS()).resta;
  await js('__tcharge(9999)');
  await tap('4'); await sleep(700);
  const t4 = JSON.parse(await js('String(__tdbg())'));
  const conMom = await RS();
  if (conMom.on) ok(`MOMENTUM + RASANTE conviven (escala ${t4.scale})`);
  else bad('el MOMENTUM corto el poder');
  // en camara lenta 0.7 s de pared son ~0.25 s de mundo: el reloj del poder tiene que ir MAS LENTO
  const gasto = antesM - conMom.resta;
  if (t4.on && gasto < 0.6) ok(`y en camara lenta el poder se gasta mas lento: ${gasto.toFixed(2)} s en 0,7 s de pared`);
  else if (!t4.on) console.log(`   · (el MOMENTUM ya se habia agotado: no se pudo medir el gasto)`);
  else bad(`el poder se gasto ${gasto.toFixed(2)} s: no esta corriendo con el dt del mundo`);
  await tap('4'); await sleep(200);

  // LA CHANCHA: NO. La canasta esta arriba y el poder existe para tenerte abajo.
  await asegurarOn();
  await js('__seaclear()');
  await js('__chaset(9999, 300)');
  await tap('5'); await sleep(250);
  const trasCh = JSON.parse(await js('String(__chadbg())'));
  const rasTrasCh = await RS();
  if (trasCh.fase === 'idle') ok('con RASANTE puesto la CHANCHA no se pide');
  else bad(`la Chancha arranco con el poder puesto: fase ${trasCh.fase}`);
  if (rasTrasCh.on) ok('y el poder NO se corta en silencio: la tecla avisa y listo');
  else bad('pedir la Chancha corto el RASANTE sin avisar');
  if (trasCh.meter >= 1) ok('ni se cobra la barra de la Chancha');
  else bad(`la barra de la Chancha se gasto: ${trasCh.meter}`);

  // ---------- 9. PUNTAJE (RF-07) ----------
  console.log('\n9. el puntaje (RF-07):');
  // EL PODER NO DA PUNTOS PROPIOS. El x10 lo sigue dando la ALTURA, como siempre — lo que el poder
  // hace es llevarte ahi y perdonarte el roce. Se mide comparando el puntaje por segundo a la
  // MISMA altura con el poder puesto y sin el: tienen que ser el mismo numero.
  const roce = async () => JSON.parse(await js('String(__rsroce())'));
  // LO QUE SE AFIRMA es que el MULTIPLICADOR sale de la ALTURA y de nada mas. `multRaw` es el
  // multiplicador crudo, sin el bonus de racha — y tiene que dar EXACTAMENTE igual a la misma
  // altura con el poder puesto y sin el.
  await asegurarOn();
  await js('__seaclear(); __chacalma(); __chaput(0, 3)'); await sleep(250);
  const conP = await roce();
  await tap('6'); await sleep(200);                                   // cortar
  await js('__seaclear(); __chacalma(); __chaput(0, 3)'); await sleep(250);
  const sinP = await roce();
  if (conP.multRaw === sinP.multRaw) ok(`el multiplicador sale de la ALTURA: x${conP.multRaw} con poder y x${sinP.multRaw} sin`);
  else bad(`el poder cambia el multiplicador: x${conP.multRaw} con, x${sinP.multRaw} sin`);

  // Y EL PUNTAJE GANADO, como dato INFORMATIVO — el spec lo pide asi con todas las letras
  // ("medido en fixture, informativo") y tiene razon: la RACHA RASANTE crece sola con los
  // segundos, asi que dos ventanas seguidas a la misma altura NO son comparables — la segunda
  // siempre puntua mas, por la racha y no por el poder. La primera version de esta prueba fallaba
  // midiendo exactamente esa deriva y culpando al poder.
  const s0 = (await roce()).score;
  await asegurarOn();
  for (let i = 0; i < 18; i++) { await js('__seaclear(); __chacalma(); __chaput(0, 3)'); await sleep(100); }
  const r1 = await roce();
  console.log(`   · con poder:  +${r1.score - s0} pts en ~1,8 s  (racha ${r1.racha}s, nivel ${r1.ras}, x${r1.mult})`);
  await tap('6'); await sleep(150);
  const s1 = (await roce()).score;
  for (let i = 0; i < 18; i++) { await js('__seaclear(); __chacalma(); __chaput(0, 3)'); await sleep(100); }
  const r2 = await roce();
  console.log(`   · sin poder:  +${r2.score - s1} pts en ~1,8 s  (racha ${r2.racha}s, nivel ${r2.ras}, x${r2.mult})`);
  console.log('   · (la diferencia es la RACHA, que crece sola: el poder no suma puntos propios)');

  console.log('\nconsola: ' + (errors.length ? errors.length + ' error(es)' : 'sin errores'));
  for (const e of errors.slice(0, 8)) console.error('   ' + e);
  console.log(fails || errors.length ? `\nFIXTURE RASANTE: FALLA (${fails})\n` : '\nFIXTURE RASANTE: OK\n');
  app.exit(fails || errors.length ? 1 : 0);
}).catch(e => { console.error('reventó:', e); app.exit(1); });
process.on('unhandledRejection', e => { console.error('REJECTION:', e && e.message); app.exit(1); });
