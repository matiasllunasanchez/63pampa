// PALETA y presets visuales. Datos puros: sin imports, sin estado.
// P = colores base del juego; SKY_PRESETS/WATER_STYLES = variantes por clima (menu [M]);
// LAND = turba malvinense (terreno de tierra).
export const P = {
  skyTop: '#242f3a', skyMid: '#3a4650', horizon: '#7d6a4e', sunGlow: '#b06a35', sun: '#e8c07a',
  sea: '#2e4a4e', sea2: '#33545a', seaDeep: '#22383c', crest: '#7fa3a0', foam: '#cfe3df',
  body: '#93a7ab', bodyDark: '#4c5b60', canopy: '#cfe8f2',
  accent: '#e8a33d', warn: '#d94f30', ink: '#e8eef0', dim: '#8a9ba1',
  cloud: '#4a5761', island: '#1b2429'
};
// EL AGUA (SPEC_AGUA_OLAS F5). Cada estilo son SIETE tonos y siempre los mismos siete, porque el
// render del mar los usa por NOMBRE: base0/1/2 son las tres bandas del raster por distancia, deep
// el valle y la cara de la ola, mid el cuerpo, crest la cresta y spark el destello y la espuma.
//
// LOS CUATRO NUEVOS son de CLIMA, no de gusto: el mar de una tormenta no es el mar de siempre con
// menos brillo, es verde plomo; el de noche es azul tinta; el de sol pleno es turquesa; el del
// amanecer tiene el oro del sol adentro. Con `cfg.water = 'auto'` los elige el cielo (ver
// applyTheme en render/theme.js), que es como pasa afuera: el agua es el cielo mojado.
export const WATER_STYLES = {
  sea: { base0: '#122123', base1: '#182a2d', base2: '#203438', deep: '#3a5f63', mid: '#6f9a95', crest: '#aed2cc', spark: '#e8f4f0' },
  violet: { base0: '#0d0a1e', base1: '#171034', base2: '#241a52', deep: '#3a2f7a', mid: '#6a54d6', crest: '#a99cf5', spark: '#eae6ff' },
  storm: { base0: '#151d1c', base1: '#1c2624', base2: '#25302c', deep: '#41564e', mid: '#6f8a7a', crest: '#b8c9bd', spark: '#eef4ee' },
  night: { base0: '#0a0f16', base1: '#101823', base2: '#16202e', deep: '#2a3a52', mid: '#4a5f80', crest: '#8ba0bd', spark: '#dfe9f5' },
  sun: { base0: '#0e2a30', base1: '#144049', base2: '#1b5560', deep: '#2a7a80', mid: '#4aada8', crest: '#9fdcd2', spark: '#f2fffa' },
  dawn: { base0: '#1d1a18', base1: '#2a2320', base2: '#3a2e26', deep: '#5c4632', mid: '#8f6b45', crest: '#d8a86a', spark: '#ffe9c2' },
};
// QUE AGUA LE TOCA A CADA CIELO cuando el agua esta en AUTO. Es DATA y vive aca, al lado de los
// dos diccionarios que relaciona: agregar un cielo nuevo y olvidarse de su agua es un renglon que
// falta en esta tabla, no un `if` escondido en el render.
export const WATER_AUTO = {
  storm: 'storm', cloudy: 'storm',      // el mar plomo del temporal
  night: 'night', moon: 'night',        // azul tinta
  sun: 'sun', clear: 'sun',             // turquesa
  dawn: 'dawn',                         // el oro del sol posado en el agua
  // ATARDECER NO ESTA, y es deliberado. Fue el primer mapeo (dusk → dawn) y se vio en la captura
  // del ARENA: el atardecer es el cielo POR DEFECTO del juego, asi que mandaba el mar dorado a
  // todas partes y el Atlantico quedaba color barro. El agua de siempre (`sea`) es el default
  // justamente porque es la que define como se ve RASANTE; el oro se reserva para el amanecer,
  // que es cuando de verdad pasa. Todo cielo que no este en esta tabla cae en `sea`.
};
export const SKY_PRESETS = {
  dusk: { skyTop: '#242f3a', skyMid: '#3a4650', horizon: '#7d6a4e', sunGlow: '#b06a35', sun: '#e8c07a' },
  night: { skyTop: '#0d141f', skyMid: '#1a2636', horizon: '#2c3652', sunGlow: '#3a4a72', sun: '#aebbd8' },
  storm: { skyTop: '#1c2026', skyMid: '#333a42', horizon: '#4a5052', sunGlow: '#586066', sun: '#8b9298' },
  clear: { skyTop: '#294060', skyMid: '#4d6a8e', horizon: '#c48a4c', sunGlow: '#e0a252', sun: '#ffe6ac' },
  cloudy: { skyTop: '#57646f', skyMid: '#7e8a93', horizon: '#a3aaa6', sunGlow: '#b5bab2', sun: '#e6eae2' },   // dia nublado (desembarco)
  // --- los tres marinos (fondos day_sun / night_2 / sunrise_2) ---
  // El TONO sale de medir la franja de cada imagen que realmente se ve en pantalla; los valores
  // estan bajados en saturacion desde ahi, como los cinco de arriba, porque el promedio crudo de
  // la foto se sale de la paleta del juego. `horizon` es el que mas importa aunque la imagen tape
  // el degrade: lo usan la BRUMA de las filas lejanas del terreno (groundHaze) y la niebla del
  // telon 3D, asi que si no acompaña a la imagen se ve el corte contra el mar.
  sun:  { skyTop: '#3f7fb4', skyMid: '#6fabd8', horizon: '#a6cbe2', sunGlow: '#dfeaf0', sun: '#fff6cf' },   // sol pleno sobre mar turquesa
  moon: { skyTop: '#1d2a4d', skyMid: '#38507e', horizon: '#4d6c93', sunGlow: '#7f97b8', sun: '#e6f0e8' },   // luna llena sobre el manto de nubes
  dawn: { skyTop: '#39464e', skyMid: '#6b5c56', horizon: '#b0764a', sunGlow: '#e0a054', sun: '#ffe6a8' },   // sol posado en el agua, tormenta encima
};
// CIELOS CON ASTRO A LA VISTA (SPEC_AGUA_OLAS F6): los unicos que dejan CAMINO DE LUZ sobre el
// agua. En un temporal o con el cielo tapado no hay columna que reflejar, y dibujarla igual seria
// el error de siempre — el efecto lindo puesto donde no corresponde.
export const SKY_ASTRO = { sun: 1, clear: 1, dawn: 1, moon: 1 };
// LA TURBA (PLAN_TIERRA_COSTA T1). Igual que el agua: el suelo NO puede ser el mismo verde bajo
// una tormenta, de noche y con sol pleno. Cada estilo son los mismos seis tonos —far/mid/near son
// las tres bandas del raster por distancia, `tuft` el pasto base, `rock` la piedra y `furrow` el
// surco— asi que agregar un clima es agregar una fila, no tocar el render.
//
// `LAND` es el de siempre (ATARDECER) y sigue siendo el default: es el que define como se ve
// RASANTE, y cambiarlo seria repetir el error que el agua ya cometio una vez (SPEC_AGUA_OLAS §24).
export const LAND = { far: '#2f3527', mid: '#3c4330', near: '#4a5138', tuft: '#6d7748', rock: '#524d3e', furrow: '#262b1e' };
export const LAND_STYLES = {
  land: LAND,
  // EMPAPADA: la turba con agua encima se OSCURECE y se enfria — pierde el amarillo, que es lo
  // primero que se va cuando el pasto esta mojado.
  storm: { far: '#232a20', mid: '#2c3427', near: '#363f2e', tuft: '#54603c', rock: '#3f3c33', furrow: '#1a1e15' },
  // DE NOCHE EL OJO NO VE COLOR: todo tira a azul y la saturacion se cae. Pintar la turba verde de
  // noche es el error clasico — se ve a pleno sol con un filtro oscuro encima.
  night: { far: '#1e2430', mid: '#262d3a', near: '#2f3745', tuft: '#465064', rock: '#3a3f4a', furrow: '#151a23' },
  // QUEMADA: el verano de la turba es amarillo, no verde. Mas clara y mas seca.
  sun: { far: '#494a2c', mid: '#5c5b36', near: '#6f6c41', tuft: '#95914f', rock: '#6b6450', furrow: '#3a3a22' },
  // EL ORO RASANTE del amanecer pegandole de costado a las lomas.
  dawn: { far: '#3a3325', mid: '#4c412c', near: '#5f5034', tuft: '#8a7143', rock: '#63563f', furrow: '#2a2419' },
};
// COSTA: tierra arenosa y seca (menos verde que LAND — es la franja castigada del desembarco)
export const CLAND = { far: '#57503c', mid: '#685e46', near: '#786c50', furrow: '#463f2f' };
// La arena de la COSTA con los mismos cuatro climas. Cambia MENOS que la turba y es correcto: la
// arena mojada se oscurece pero no cambia de color, y de noche sigue siendo lo mas claro del mapa.
export const CLAND_STYLES = {
  coast: CLAND,
  storm: { far: '#43402f', mid: '#524b39', near: '#605741', furrow: '#332f24' },
  night: { far: '#3a3c47', mid: '#474a56', near: '#555865', furrow: '#2a2c35' },
  sun: { far: '#6e6547', mid: '#847754', near: '#9a8b62', furrow: '#584f39' },
  dawn: { far: '#5d4e35', mid: '#71603f', near: '#87724b', furrow: '#463a28' },
};
// QUE SUELO LE TOCA A CADA CIELO. Misma forma y mismo motivo que WATER_AUTO, y por eso van
// pegadas: son la misma decision tomada dos veces, una para el agua y otra para la tierra.
// El ATARDECER no esta a proposito — cae en el default y el juego se sigue viendo como se ve.
export const LAND_AUTO = {
  storm: 'storm', cloudy: 'storm',
  night: 'night', moon: 'night',
  sun: 'sun', clear: 'sun',
  dawn: 'dawn',
};
