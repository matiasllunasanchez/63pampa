const { app, BrowserWindow } = require('electron');
app.commandLine.appendSwitch('mute-audio');
const path = require('path'), sleep = ms => new Promise(r => setTimeout(r, ms));
let win; const js = s => win.webContents.executeJavaScript(s);
const key = (k, d) => win.webContents.sendInputEvent({ type: d ? 'keyDown' : 'keyUp', keyCode: k });
app.whenReady().then(async () => {
  win = new BrowserWindow({ width: 1280, height: 760, show: false, webPreferences: { backgroundThrottling: false, partition: 'a' + Date.now() } });
  await win.loadURL('file://' + path.join(__dirname, '..', 'src', 'index.html'));
  await sleep(4000);
  console.log(await js("window.__prb('idayvuelta')"));
  for (let i = 0; i < 30; i++) { const e = JSON.parse(await js('window.__estado()')); if (e.st === 'play') break; key('Return', 1); key('Return', 0); await sleep(400); }
  await sleep(1500);
  for (let i = 0; i < 16; i++) {
    const m = await js('window.__miradbg()'); const a = JSON.parse(await js('window.__agudbg()'));
    const alt = await js('window.__alto ? 0 : 0');
    console.log(i * 0.5 + 's', m.st, 'carga', a.carga, 'on', a.on, JSON.stringify(a).slice(0, 160));
    // mantener bajo: tocar gas si cae
    await sleep(500);
  }
  app.exit(0);
});
