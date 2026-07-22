// MISIONES de la campaña (y del ciclo de muerte, que las juega al azar). Datos puros.
// Agregar una mision = agregar una entrada aca. Ver GOALS en game.js para los tipos de
// objetivo disponibles (ship / distance); el epilogo y el briefing son claves de STRINGS.
// barcazas/buques británicos reales (objetivo del vuelo).
export const SHIPS = ['HMS SHEFFIELD', 'HMS COVENTRY', 'HMS ARDENT', 'HMS ANTELOPE', 'RFA SIR GALAHAD', 'ATLANTIC CONVEYOR'];

// config por defecto de campaña (misma para todos los niveles POR AHORA — a futuro, una por nivel)
export const CAMPAIGN_CFG = { sky: 'dusk', water: 'sea', wind: true, obstacles: 1, coast: 230 };

// ---------- MISIONES ----------
// Una entrada por objetivo real. La CAMPAÑA las juega en orden cronologico; el CICLO DE
// MUERTE elige una al azar. Cada mision trae su propio contexto y desenlace, asi que el
// epilogo siempre corresponde al blanco que realmente destruiste.
//   par   → puntaje de referencia para las estrellas (★ completar, ★★ par, ★★★ par×1.5)
//   story → secuencia larga de historia (SOLO campaña; opcional)
//   brief → tarjeta corta de 2-3 lineas (ciclo de muerte)
//   epi   → desenlace historico, se muestra en ambos modos
export const MISSIONS = [
  {
    id: 'sheffield', name: 'HMS SHEFFIELD', date: '4 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS SHEFFIELD', dist: 2600 },
    cfg: CAMPAIGN_CFG, par: 7000, story: 'storyIntro', brief: 'briefSheffield', epi: 'epiSheffield',
  },
  {
    id: 'ardent', name: 'HMS ARDENT', date: '21 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS ARDENT', dist: 2600 },
    cfg: CAMPAIGN_CFG, par: 8000, story: 'storyL1', brief: 'briefArdent', epi: 'epiArdent',
  },
  {
    id: 'antelope', name: 'HMS ANTELOPE', date: '23 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS ANTELOPE', dist: 2800 },
    cfg: CAMPAIGN_CFG, par: 8500, brief: 'briefAntelope', epi: 'epiAntelope',
  },
  {
    id: 'coventry', name: 'HMS COVENTRY', date: '25 de mayo de 1982',
    goal: { kind: 'ship', ship: 'HMS COVENTRY', dist: 2800 },
    cfg: CAMPAIGN_CFG, par: 9000, brief: 'briefCoventry', epi: 'epiCoventry',
  },
  {
    id: 'conveyor', name: 'ATLANTIC CONVEYOR', date: '25 de mayo de 1982',
    goal: { kind: 'ship', ship: 'ATLANTIC CONVEYOR', dist: 3000 },
    cfg: CAMPAIGN_CFG, par: 9500, brief: 'briefConveyor', epi: 'epiConveyor',
  },
  {
    id: 'galahad', name: 'RFA SIR GALAHAD', date: '8 de junio de 1982',
    goal: { kind: 'ship', ship: 'RFA SIR GALAHAD', dist: 3000 },
    cfg: CAMPAIGN_CFG, par: 10000, brief: 'briefGalahad', epi: 'epiGalahad',
  },
];
