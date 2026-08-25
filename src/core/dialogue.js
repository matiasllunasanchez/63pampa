// MOTOR DE LINEAS del modo historia (SPEC_MODO_HISTORIA §4, RF-02/03/07).
//
// La unidad de presentacion es LA LINEA, no la pantalla: una linea = lo que se muestra de una vez
// = un futuro archivo de voz (SISTEMA_DIALOGO §3). El motor tipea esa linea letra a letra, la
// completa si el jugador aprieta, y despues respeta su `hold` — el silencio obligatorio, que es
// ACTUACION y no se puede saltear (RF-07).
//
// PURO A PROPOSITO: no importa canvas, audio ni i18n. Solo `util.js` (tambien puro). Asi lo prueba
// `npm run unit` con node, sin navegador — la parte de la historia que tiene que ser exacta (los
// holds) es justamente la que se puede medir sin mirar la pantalla.
//   - el que dibuja lee este store (render/screens.js)
//   - el que suena y el que decide a donde ir despues los maneja game.js con las señales que
//     devuelven stepDialogue()/pressDialogue() — los sistemas no llaman "hacia arriba".
import { wrapChars } from './util.js';

// Velocidad del tipeo. El spec pide ~30 cps (RF-02); el motor viejo de pantallas usaba 19, pero
// ahi se tipeaba la PANTALLA entera de una vez y hacia falta que fuera ceremonioso. Con una linea
// por vez, 19 se siente lento de mas.
export const TYPE_CPS = 30;
// AUTO-AVANCE (RF-03, apagado por defecto): segundos que queda una linea si nadie toca nada.
// La formula es de SISTEMA_DIALOGO: 12 caracteres por segundo es LENTO a proposito (el estandar
// de subtitulado tolera 17) y el minimo evita que un "Sesenta y uno." pase como un parpadeo.
export const AUTO_MIN = 1.6, AUTO_CPS = 12;
// ancho de renglon en caracteres (espacio de DISEÑO 320x180, ver ARQUITECTURA)
export const WRAP_BODY = 52;

/** EL STORE de la historia. Identidad estable: se MUTA, nunca se reasigna (convencion 1). */
export const dlg = {
  seq: [],        // escenas de la secuencia en curso
  si: 0,          // indice de escena
  li: 0,          // indice de linea DENTRO de la escena
  t: 0,           // reloj de la linea actual (se reinicia en cada linea)
  tDone: 0,       // instante de `t` en que la linea quedo completa (arranca el hold)
  seqT: 0,        // reloj de la secuencia entera (lo usa la gracia anti-salteo de game.js)
  sceneT: 0,      // reloj de la ESCENA en curso: anima la entrada de la caja VN (sube de abajo)
  typed: 0,       // caracteres ya tipeados de la linea
  done: false,    // la linea termino de tipearse
  wrap: [],       // la linea partida en renglones, para el render
  lang: 'es',
  auto: false,    // auto-avance (RF-03): apagado por defecto
};

/** Escena actual, o null si la secuencia esta vacia / terminada. */
export function scene() { return dlg.seq[dlg.si] || null; }
/** Linea actual, o null (una escena puede no tener ninguna: la tarjeta de nivel sin objetivo). */
export function line() { const s = scene(); return s && s.lineas ? s.lineas[dlg.li] || null : null; }

/** Texto de una linea en el idioma activo. `en` vacio cae a `es` (regla D3, ya existente en el
 *  juego); `txt` es el atajo del adaptador de pantallas viejas, que ya viene resuelto. */
export function txtOf(ln) {
  if (!ln) return '';
  if (ln.txt != null) return ln.txt;
  return ln[dlg.lang] || ln.es || '';
}

/** Segundos que faltan de silencio obligatorio. > 0 = el avance esta cerrado (RF-07). */
export function holdLeft() {
  const ln = line();
  if (!dlg.done || !ln) return 0;
  return Math.max(0, (ln.hold || 0) - (dlg.t - dlg.tDone));
}
/** ¿Se puede avanzar? Es tambien lo que decide si se dibuja la flecha de "seguir". */
export function canAdvance() { return dlg.done && holdLeft() <= 0; }

/** Cuanto dura una linea sola, con auto-avance encendido (RF-03). */
export function autoSecs(chars, hold) { return Math.max(AUTO_MIN, chars / AUTO_CPS) + (hold || 0); }

/** Arranca una secuencia de escenas. `lang` resuelve es/en por linea sin importar i18n. */
export function startSeq(scenes, lang) {
  dlg.seq.length = 0;
  for (const s of scenes || []) dlg.seq.push(s);
  dlg.si = 0; dlg.seqT = 0; dlg.lang = lang || 'es';
  startScene();
}
function startScene() { dlg.li = 0; dlg.sceneT = 0; startLine(); }
function startLine() {
  const ln = line(), txt = txtOf(ln);
  dlg.t = 0; dlg.tDone = 0; dlg.typed = 0;
  dlg.done = !txt;                  // una linea vacia (o una escena sin lineas) ya esta "completa"
  dlg.wrap.length = 0;
  for (const w of wrapChars(txt, (ln && ln.wrap) || WRAP_BODY)) dlg.wrap.push(w);
}

/** Avanza el reloj. Devuelve 'auto' el cuadro en que el auto-avance pide pasar de linea (game.js
 *  decide: es el mismo camino que un toque del jugador). */
export function stepDialogue(dt) {
  dlg.seqT += dt; dlg.t += dt; dlg.sceneT += dt;
  const ln = line(), n = txtOf(ln).length;
  if (!dlg.done) {
    dlg.typed = Math.min(n, Math.floor(dlg.t * TYPE_CPS));
    if (dlg.typed >= n) { dlg.done = true; dlg.tDone = dlg.t; }
    return null;
  }
  if (holdLeft() > 0) return null;                       // el silencio corre: nada mas pasa aca
  if (dlg.auto && dlg.t >= autoSecs(n, ln && ln.hold)) return 'auto';
  return null;
}

/** Un toque del jugador. Devuelve que hizo:
 *   'complete' = termino el tipeo de golpe · 'next' = paso a la linea siguiente
 *   'scene'    = paso a la escena siguiente · 'end' = se acabo la secuencia (lo resuelve game.js)
 *   null       = SE IGNORO, porque esta corriendo un `hold` (RF-07: el silencio no se saltea). */
export function pressDialogue() {
  if (!dlg.done) {                                       // completar, NUNCA saltear (RF-02)
    dlg.typed = txtOf(line()).length; dlg.done = true; dlg.tDone = dlg.t;
    return 'complete';
  }
  if (holdLeft() > 0) return null;
  return advance();
}

/** Pasa a la linea/escena siguiente sin pedir permiso (lo usa el auto-avance y lo usara el skip). */
export function advance() {
  const s = scene();
  if (s && s.lineas && dlg.li + 1 < s.lineas.length) { dlg.li++; startLine(); return 'next'; }
  if (dlg.si + 1 < dlg.seq.length) { dlg.si++; startScene(); return 'scene'; }
  return 'end';
}

// ---------- adaptador de las pantallas VIEJAS de strings.js ----------
// La campaña ya escrita vive como {title, paras[], img, style, level, obj} (v0.0.1). El motor no
// entiende ese formato — lo traduce este adaptador, asi el guion existente sigue andando sin
// tocar una sola linea de texto y sin dos motores en paralelo. El contenido nuevo se escribe
// directamente en el modelo de escena (data/story.js).

// 'PUMA: pegado al agua...' → habla PUMA. Solo cuenta como nombre un prefijo CORTO y EN MAYUSCULAS:
// asi "Viejo: llegamos" (el cuaderno de Mateo, que es narracion) no se confunde con un hablante.
const SPEAKER = /^([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ0-9 .'-]{0,15}):\s+/;
export function splitSpeaker(raw) {
  const m = SPEAKER.exec(raw || '');
  if (!m) return { personaje: null, txt: raw || '' };
  return { personaje: m[1].trim(), txt: raw.slice(m[0].length) };
}

// `style` de las pantallas viejas → tipo de escena del spec (§2). Sin estilo es una pantalla de
// dialogo/narracion = VN; la tarjeta previa al nivel no es ninguno de los cuatro tipos y se marca
// TARJETA (ver "Divergencias" del spec).
const STYLE_TIPO = { tierra: 'TIERRA', carta: 'CARTA' };

// CARA por defecto de cada hablante (el retrato neutro de RETRATOS §4) para el guion viejo, que
// no trae `cara` por linea. Con la cara puesta la caja VN dibuja el busto: el retrato real si
// existe assets/portraits/<cara>.png, y si no un placeholder de silueta (el MOCK pedido el 6/8 —
// asi la caja se ve completa hoy, sin un solo asset). Los que por canon NO llevan cara (Norma,
// el Colorado en aire, la radio, la Chancha) no estan en el mapa → cara null → solo nombre (D4).
// Cuando el guion se pase al modelo de escena con `cara` por linea, este mapa deja de decidir.
// LOS IDS SALEN DE tools/hacer_prompts_retratos.py, que es quien nombra los archivos que se
// generan. `python3 tools/hacer_prompts_retratos.py --ids` lista los 72 validos.
//
// ⚠ ESTE MAPA SE DESINCRONIZA EN SILENCIO. Un id que no existe no da error: portraitImg() no
// encuentra el archivo, cae al placeholder de silueta, y la caja se ve igual de "bien" que si
// faltara el asset. Ya paso una vez —cinco de estas doce entradas apuntaban a nombres viejos
// (puma_reglamentario, vasco_cerrado, turco_grunon, condor_parlante)— y no se noto hasta mirar
// la pantalla y preguntarse por que no aparecian los retratos. Si se toca el generador, se
// vuelve a correr `--ids` y se compara contra esta lista.
const CARA_NEUTRA = {
  'TERO': 'tero_neutro', 'ESTEBAN': 'tero_neutro',
  'PUMA': 'puma_neutro',
  'GITANO': 'gitano_neutro',                                  // su neutro ES la sonrisa (celda 1)
  'VASCO': 'vasco_neutro',
  'PICHON': 'pichon_neutro', 'PICHÓN': 'pichon_neutro',
  'TURCO': 'turco_neutro', 'EL TURCO': 'turco_neutro',
  'MATEO': 'mateo_neutro',
  'CONDOR': 'condor_reposo', 'CÓNDOR': 'condor_reposo',       // el parlante: la maquina no tiene cara
  'NORMA': 'norma_neutro',
  'COLORADO': 'colorado_neutro', 'EL COLORADO': 'colorado_neutro',
  'CLARIBEL': 'claribel_neutro',
};

// (Aca vivia CARA_ESCENA, la tabla de excepciones por escena — «en el arroyo, Esteban tiene
// treinta y Mateo ocho». Se fue el 24/8 cuando el guion se mudo a data/story.js: ahora la cara
// va escrita en la linea, al lado del texto que la necesita, y una excepcion deja de ser una
// excepcion. Este mapa de abajo queda SOLO para el adaptador del guion viejo.)

// numeracion de linea: de 10 en 10 y a tres digitos (010, 020…), como manda la regla D1 — asi
// entra una linea nueva en el medio sin renumerar ni pisar un ID que ya se uso.
const lineNo = i => String((i + 1) * 10).padStart(3, '0');

/** Convierte UNA pantalla vieja en una escena del modelo nuevo. `id` es el que le toca en la
 *  secuencia (STORYM1_3): los IDs `MNN_ESCENA_###` de verdad llegan cuando el guion se reescriba
 *  en el modelo de escena — estos son estables mientras el orden de las pantallas no cambie. */
export function sceneFromScreen(sc, id) {
  if (!sc) return { id, tipo: 'VN', lineas: [] };
  if (sc.level) {
    // TARJETA de nivel: el titulo es el nombre de la mision (fijo arriba) y el objetivo es la
    // unica linea tipeable. Sin objetivo queda una escena de cero lineas, que el motor banca.
    return { id, tipo: 'TARJETA', titulo: sc.level, img: sc.img,
             lineas: sc.obj ? [{ id: `${id}_${lineNo(0)}`, personaje: null, cara: null, txt: sc.obj, hold: 0 }] : [] };
  }
  const lineas = (sc.paras || []).map((p, i) => {
    const { personaje, txt } = splitSpeaker(p);
    // FALTA `hold` en todo el guion viejo: no se inventa (spec §8.3) — cae a 0 y queda anotado
    // en "Divergencias". Los holds de verdad llegan al pasar cada escena al modelo nuevo.
    const cara = personaje ? CARA_NEUTRA[personaje] || null : null;
    return { id: `${id}_${lineNo(i)}`, personaje, cara, txt, hold: 0 };
  });
  return { id, tipo: STYLE_TIPO[sc.style] || 'VN', titulo: sc.title, img: sc.img, style: sc.style, lineas };
}

/** Toda una secuencia vieja (`STRINGS.es.storyM1`) al modelo de escena. */
export function seqFromScreens(list, key) {
  return (list || []).map((sc, i) => sceneFromScreen(sc, (key || 'SEQ').toUpperCase() + '_' + (i + 1)));
}
