// CAPTURAS DEL DUOTONO DE MISION (PLAN_MEJORAS_3D P3/D2) — herramienta de calibracion, no fixture.
//   DUO_SHOTS=/tmp/duo electron tools/shot_duo.js
//
// Entra a la PASADA, planta el avion SIEMPRE en el mismo lugar (__pset: misma distancia, misma
// altura, mismo angulo) y saca dos capturas por clima: sin duotono y con duotono. Las ocho
// parejas se miran juntas y de ahi sale la decision del default. QUITAR junto con la sonda
// __duo3d cuando el look quede cerrado.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const OUT = process.env.DUO_SHOTS || '';
const FUERZA = +(process.env.DUO_FUERZA || 0.45);
const CLIMAS = ['dusk', 'night', 'storm', 'clear', 'cloudy', 'sun', 'moon', 'dawn'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let win;
const js = s => win.webContents.executeJavaScript(s);
const shot = async n => {
  if (!OUT) return;
  fs.writeFileSync(path.join(OUT, n + '.png'), (await win.webContents.capturePage()).toPNG());
};

app.whenReady().then(async () => {
  if (OUT && !fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false } });
  await win.loadURL('file://' + path.join(ROOT, 'src', 'index.html') + '?pasada=1');
  await sleep(2500);
  if (!await js('String(window.__pdbg && window.__pdbg())')) { console.error('no entro a la pasada'); app.exit(1); return; }
  await js('window.__pdef(0), window.__pinv(1)');            // ni defensa ni muerte: esto es una foto
  // el agua en AUTO: la calibracion tiene que ver el clima ENTERO (cielo + mar), que es como se
  // juega en campaña. Con un mar fijo la sombra del duotono no se movia de una mision a otra.
  await js("window.__cfgset('water', 'auto')");
  // TERCERA PERSONA (tecla V): el duotono se juzga sobre el BUQUE y sobre el avion, y desde la
  // cabina el buque a 200 m son doce pixeles. Es el mismo encuadre del A/B del agua (P1/W2).
  win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'V' });
  win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'V' });
  await sleep(200);
  for (const c of CLIMAS) {
    await js(`window.__cfgset('sky', ${JSON.stringify(c)})`);
    for (const f of [0, FUERZA]) {
      await js(`window.__duo3d(${f})`);
      await js('window.__pset(160, 48, 0.42)');
      await sleep(60);
      await shot(`${c}_${f ? 'duo' : 'sin'}`);
    }
    console.log('  ·', c, await js('String(window.__duo3d())'));
  }
  console.log('\nCAPTURAS EN', OUT || '(sin DUO_SHOTS: no se guardo nada)');
  app.exit(0);
});
