// EL MONTAJE DEL TRAILER DE ACCESO ANTICIPADO — los textos de cada bloque encima del video filmado, el sonido del
// juego y la musica.
//
//   npm run trailer -- --guion tools/trailer_guion_ea.js --sonido --out trailer/ea/crudo.mp4   (filmar)
//   electron tools/trailer_montaje.js                                                           (montar)
//
// Lee trailer/ea/crudo.mp4 y crudo_sonido.wav (lo que filmo tools/trailer.js) y saca:
//   trailer/ea/rasante_trailer_ea.mp4          con zona_rasante y el sonido del juego debajo
//   trailer/ea/rasante_trailer_ea_sfx.mp4      solo el sonido del juego (para ponerle otra musica)
//
// LOS TEXTOS se dibujan con las letras del juego (assets/fonts, las mismas de src/styles.css) en un canvas de
// Electron y salen como PNG transparentes: el ffmpeg de la maquina no trae drawtext. Cada bloque arranca en un
// plano del guion (`desde`), y los tiempos salen de las duraciones del guion, asi que si un plano cambia de largo
// el texto lo sigue solo.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'trailer', 'ea');
const GUION = require('./trailer_guion_ea.js');
const MUSICA = path.join(ROOT, 'assets', 'music', 'soundtrack', 'zona_rasante.m4a');
const W = 1920, H = 1080;

// los textos: en que plano arranca cada uno y cuanto se queda
const TEXTOS = [
  { desde: 'aviones', dur: 3.4, lineas: ['JUGÁ CON LOS AVIONES QUE VOLARON'] },
  { desde: 'mejoras', dur: 2.7, lineas: ['MEJORAS REALES', 'DE NUESTROS PILOTOS E INGENIEROS'] },
  { desde: 'libro', dur: 3.2, lineas: ['VIVÍ LAS MISIONES REALES'] },
  { desde: 'cabina', dur: 3.2, lineas: ['VOLÁ RASANTE.', 'QUE NO TE VEA EL RADAR.'] },
  { desde: 'piruetas', dur: 3.4, lineas: ['LA FEROCIDAD DE LOS', 'PILOTOS ARGENTINOS'] },
  { desde: 'cierre', dur: 99, lineas: ['ACCESO ANTICIPADO EN STEAM'], cierre: true },
];

// cuando arranca cada plano en el video
const inicio = {};
{ let t = 0; for (const p of GUION) { inicio[p.id] = t; t += p.dur; } inicio.__fin = t; }

const HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'OtflagSans'; src: url('../assets/fonts/OtflagSans-Medium.otf'); }
@font-face { font-family: 'Kirana'; src: url('../assets/fonts/KIRANAlight.ttf'); }
</style></head><body style="margin:0;background:transparent">
<div style="font-family:OtflagSans">.</div><div style="font-family:Kirana">.</div></body></html>`;

async function textos() {
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = path.join(ROOT, 'src', '.trailer_textos.html');   // (en src/ para que las urls de las letras anden)
  fs.writeFileSync(tmp, HTML);
  const win = new BrowserWindow({ show: false, width: 400, height: 200, webPreferences: { offscreen: true } });
  await win.loadFile(tmp);
  const salidas = [];
  for (const [i, t] of TEXTOS.entries()) {
    const png = await win.webContents.executeJavaScript(`(async () => {
      await document.fonts.load('80px OtflagSans'); await document.fonts.load('80px Kirana'); await document.fonts.ready;
      const W = ${W}, H = ${H}, L = ${JSON.stringify(t.lineas)}, cierre = ${!!t.cierre};
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      // la franja de abajo: un degrade a negro que deja leer sobre cualquier plano (y tapa el APRETA UNA TECLA del
      // titulo en el cierre)
      const alto = cierre ? 230 : 330, g = x.createLinearGradient(0, H - alto, 0, H);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.45, 'rgba(0,0,0,0.72)'); g.addColorStop(1, 'rgba(0,0,0,0.9)');
      x.fillStyle = g; x.fillRect(0, H - alto, W, alto);
      const tam = cierre ? 54 : 86, sep = tam * 1.12;
      x.font = tam + 'px OtflagSans'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      if ('letterSpacing' in x) x.letterSpacing = (cierre ? 8 : 4) + 'px';
      const y0 = H - 70 - (L.length - 1) * sep;
      L.forEach((l, k) => {
        const y = y0 + k * sep;
        x.lineJoin = 'round'; x.strokeStyle = 'rgba(0,0,0,0.85)'; x.lineWidth = 10; x.strokeText(l, W / 2, y);
        x.fillStyle = cierre ? '#e8eef0' : '#e8a33d'; x.fillText(l, W / 2, y);
      });
      return c.toDataURL('image/png').slice(22);
    })()`);
    const f = path.join(DIR, `.texto${i}.png`);
    fs.writeFileSync(f, Buffer.from(png, 'base64'));
    salidas.push(f);
  }
  win.destroy(); fs.unlinkSync(tmp);
  return salidas;
}

function ff(args) {
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status) { console.error(r.stderr.slice(-3000)); throw new Error('ffmpeg ' + r.status); }
}

(async () => {
  await app.whenReady();
  const video = path.join(DIR, 'crudo.mp4'), sfx = path.join(DIR, 'crudo_sonido.wav');
  if (!fs.existsSync(video)) { console.error('falta ' + video + ' (filmar primero)'); app.exit(1); return; }
  const pngs = await textos();
  const fin = inicio.__fin, corte = inicio.cierre;   // la musica se corta en seco al titulo

  // ---- el video con los textos ----
  const ins = ['-i', video], fl = [];
  let prev = '0:v';
  TEXTOS.forEach((t, i) => {
    const a = inicio[t.desde] + (t.cierre ? 0.5 : 0.25), b = Math.min(fin, a + t.dur), d = b - a;
    ins.push('-loop', '1', '-t', fin.toFixed(2), '-i', pngs[i]);
    const fo = t.cierre ? '' : `,fade=t=out:st=${(b - 0.3).toFixed(2)}:d=0.3:alpha=1`;
    fl.push(`[${i + 1}:v]format=rgba,fade=t=in:st=${a.toFixed(2)}:d=0.3:alpha=1${fo}[t${i}]`);
    fl.push(`[${prev}][t${i}]overlay=0:0:enable='between(t,${a.toFixed(2)},${b.toFixed(2)})'[v${i}]`);
    prev = `v${i}`;
  });
  // el final: un fundido a negro en el ultimo segundo
  fl.push(`[${prev}]fade=t=out:st=${(fin - 0.8).toFixed(2)}:d=0.8[vf]`);
  const conTextos = path.join(DIR, '.con_textos.mp4');
  ff([...ins, '-filter_complex', fl.join(';'), '-map', '[vf]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
    '-pix_fmt', 'yuv420p', '-r', '60', '-t', fin.toFixed(3), conTextos]);

  // ---- el sonido ----
  // el del juego, parejo (-19 LUFS) y con un fundido corto al final; la musica a -16 y cortada en seco al titulo
  const hay = fs.existsSync(sfx);
  const juego = hay ? '[1:a]loudnorm=I=-19:TP=-2:LRA=11,aresample=48000' : null;
  const salSfx = path.join(DIR, 'rasante_trailer_ea_sfx.mp4'), salTodo = path.join(DIR, 'rasante_trailer_ea.mp4');
  if (hay) {
    ff(['-i', conTextos, '-i', sfx, '-filter_complex', `${juego},afade=t=out:st=${(fin - 1).toFixed(2)}:d=1[a]`,
      '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-t', fin.toFixed(3), '-movflags', '+faststart', salSfx]);
  }
  const mus = `[2:a]atrim=0:${corte.toFixed(3)},asetpts=PTS-STARTPTS,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,afade=t=out:st=${(corte - 0.06).toFixed(3)}:d=0.06,apad[m]`;
  const mezcla = hay
    ? `${mus};${juego},volume=-3dB[j];[m][j]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.94,atrim=0:${fin.toFixed(3)}[a]`
    : `${mus};[m]atrim=0:${fin.toFixed(3)}[a]`;
  ff(['-i', conTextos, ...(hay ? ['-i', sfx] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']), '-i', MUSICA,
    '-filter_complex', mezcla, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
    '-t', fin.toFixed(3), '-movflags', '+faststart', salTodo]);
  fs.unlinkSync(conTextos); for (const p of pngs) fs.unlinkSync(p);
  console.log(`listo: ${fin.toFixed(1)} s\n   ${salTodo}` + (hay ? `\n   ${salSfx}` : ''));
  app.exit(0);
})().catch(e => { console.error(e); app.exit(1); });
