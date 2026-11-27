const { app, BrowserWindow } = require('electron');
app.commandLine.appendSwitch('mute-audio');
const path = require('path'), fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1280, height: 800, show: false, webPreferences: { backgroundThrottling: false } });
  win.webContents.setAudioMuted(true);
  await win.loadURL('file://' + path.join(__dirname, '..', 'src', 'index.html'));
  await sleep(2600);
  const u = await win.webContents.executeJavaScript("__TMPmando()");
  fs.writeFileSync('/private/tmp/claude-501/-Users-matymun-personal-games-63pampa/518d3dff-35bf-4fa3-a9aa-83e7dcf9452d/scratchpad/mando.png', Buffer.from(u.split(',')[1], 'base64'));
  app.quit();
}).catch(e => { console.log('ERR', e); app.quit(); });
