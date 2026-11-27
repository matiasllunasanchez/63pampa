// SUBIR RASANTE A STEAM (24/11). Dos pasos, los dos leen steam/config.json:
//   npm run steam:build   empaqueta la version FULL para Windows (x64) y Mac (universal) con el App ID
//                         adentro, copia cada una a su depot (steam/contenido/windows y /mac) y escribe
//                         los scripts de SteamPipe (steam/generado/*.vdf)
//   npm run steam:subir   corre steamcmd con esos scripts: sube el build y, si `rama` no esta vacia, lo
//                         deja puesto en esa rama (beta). La rama publica (default) se pasa A MANO en
//                         Steamworks: nunca desde aca.
// Guia completa en steam/LEEME.md.
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const STEAM = path.join(RAIZ, 'steam');
const CONTENIDO = path.join(STEAM, 'contenido');
const GENERADO = path.join(STEAM, 'generado');
const SALIDA = path.join(RAIZ, 'dist', 'steam');

const cfg = JSON.parse(fs.readFileSync(path.join(STEAM, 'config.json'), 'utf8'));
const version = require('../package.json').version;

function falta(msg) { console.error('\n  ✗ ' + msg + '\n    (ver steam/LEEME.md)\n'); process.exit(1); }
function correr(cmd) { console.log('\n$ ' + cmd); execSync(cmd, { cwd: RAIZ, stdio: 'inherit' }); }
function chequearIds() {
  for (const k of ['appId', 'depotWindows', 'depotMac'])
    if (!Number(cfg[k])) falta('falta `' + k + '` en steam/config.json');
}

// el VDF de la app: descripcion, rama y los dos depots
function appVdf() {
  return `"AppBuild"
{
\t"AppID" "${cfg.appId}"
\t"Desc" "RASANTE ${version} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}"
\t"ContentRoot" "${CONTENIDO}"
\t"BuildOutput" "${path.join(GENERADO, 'salida')}"
\t"SetLive" "${cfg.rama || ''}"
\t"Depots"
\t{
\t\t"${cfg.depotWindows}" "${path.join(GENERADO, 'depot_windows.vdf')}"
\t\t"${cfg.depotMac}" "${path.join(GENERADO, 'depot_mac.vdf')}"
\t}
}
`;
}
// un depot = una carpeta de steam/contenido entera
function depotVdf(id, carpeta) {
  return `"DepotBuild"
{
\t"DepotID" "${id}"
\t"FileMapping"
\t{
\t\t"LocalPath" "${carpeta}/*"
\t\t"DepotPath" "."
\t\t"Recursive" "1"
\t}
\t"FileExclusion" "*.pdb"
}
`;
}

function build() {
  chequearIds();
  if (process.platform !== 'darwin') falta('el build de Mac (universal) solo se arma desde una Mac');
  const meta = `-c.extraMetadata.rasanteFull=true -c.extraMetadata.rasanteSteam=${cfg.appId}`;
  fs.rmSync(SALIDA, { recursive: true, force: true });
  correr('node tools/webp.js --exigir');
  correr('npm run -s build:game');
  correr(`npx electron-builder --win dir --x64 ${meta} -c.directories.output=dist/steam/win`);
  correr(`npx electron-builder --mac dir --universal ${meta} -c.directories.output=dist/steam/mac`);

  fs.rmSync(CONTENIDO, { recursive: true, force: true });
  fs.mkdirSync(path.join(CONTENIDO, 'windows'), { recursive: true });
  fs.mkdirSync(path.join(CONTENIDO, 'mac'), { recursive: true });
  correr(`ditto "${path.join(SALIDA, 'win', 'win-unpacked')}" "${path.join(CONTENIDO, 'windows')}"`);
  const app = fs.readdirSync(path.join(SALIDA, 'mac')).map(d => path.join(SALIDA, 'mac', d, 'RASANTE.app')).find(fs.existsSync);
  if (!app) falta('no aparecio RASANTE.app en dist/steam/mac');
  correr(`ditto "${app}" "${path.join(CONTENIDO, 'mac', 'RASANTE.app')}"`);   // ditto respeta los symlinks del .app

  fs.mkdirSync(GENERADO, { recursive: true });
  fs.writeFileSync(path.join(GENERADO, 'app_build.vdf'), appVdf());
  fs.writeFileSync(path.join(GENERADO, 'depot_windows.vdf'), depotVdf(cfg.depotWindows, 'windows'));
  fs.writeFileSync(path.join(GENERADO, 'depot_mac.vdf'), depotVdf(cfg.depotMac, 'mac'));
  console.log(`\n  ✓ listo para subir: steam/contenido/windows (RASANTE.exe) y steam/contenido/mac (RASANTE.app)`);
  console.log(`    siguiente: npm run steam:subir\n`);
}

function subir() {
  chequearIds();
  if (!cfg.usuario) falta('falta `usuario` (tu usuario de Steam) en steam/config.json');
  const vdf = path.join(GENERADO, 'app_build.vdf');
  if (!fs.existsSync(vdf)) falta('primero npm run steam:build');
  fs.writeFileSync(vdf, appVdf());   // la descripcion con la hora de ahora
  // primero el de Valve bajado a mano en ~/steamcmd (el de Homebrew lo traba el Gatekeeper de macOS)
  const aMano = path.join(require('os').homedir(), 'steamcmd', 'steamcmd.sh');
  const steamcmd = fs.existsSync(aMano) ? aMano : spawnSync('which', ['steamcmd']).stdout.toString().trim();
  if (!steamcmd) falta('no esta steamcmd (ver steam/LEEME.md)');
  // la contraseña y el codigo de Steam Guard los pide steamcmd en la terminal: no pasan por aca
  const r = spawnSync(steamcmd, ['+login', cfg.usuario, '+run_app_build', vdf, '+quit'], { stdio: 'inherit' });
  process.exit(r.status || 0);
}

const que = process.argv[2];
if (que === 'build') build();
else if (que === 'subir') subir();
else falta('uso: node tools/steam.js build | subir');
