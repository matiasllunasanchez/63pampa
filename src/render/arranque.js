// EL ARRANQUE DEL FICHIN (pedido del autor, 3/10/2026). Al abrir el programa:
//
//   1. NEGRO, y se FUNDE el gabinete con el tubo apagado.
//      Ya desde aca suena el BOOTING de la PC (autor, 16/10): fuerte bajo el BIOS, bajito desde INSERTE
//      FICHA, y se va con la portada.
//   2. El tubo SE PRENDE como un televisor (la animacion es de styles.css, el sonido de audio.js).
//   3. Texto de BIOS, "como cuando arrancaba una PC vieja", tipeandose.
//   4. La pantalla vacia, y INSERTE FICHA bien grande en el medio, SOLO. Despues suena el insert coin
//      (el mp3, `alCargado`), y cuando termina el cartel CAMBIA por PRESIONE CUALQUIER TECLA PARA
//      CONTINUAR, en el mismo lugar (autor, 4/10: primero el cartel, despues el sonido).
//   6. La tecla ES la ficha (autor, 3/10: "que el sonido de ficha suene cuando presiono enter"):
//      suena la moneda, aparece CREDITO 1, y enseguida la portada de siempre, con su musica.
//
// Es DOM y un canvas propio (#bios, encima del juego y adentro de su caja), no el canvas del juego:
// el juego ya corre debajo desde el primer cuadro y esto solo decide que se ve. El #bios se dibuja en
// la grilla de diseño (320x180) pero a RES veces su tamaño (autor, 4/10: "la resolucion de las letras
// es muy baja"): las cuentas siguen en 320x180 y las letras salen nitidas. El estado vive en clases del <body> que ya vienen puestas desde el HTML,
// asi el primer pintado ya es negro:
//   arranque-negro    el telon negro (#arranque) tapa todo
//   arranque-apagado  el tubo esta apagado: no se ve nada adentro del gabinete
//   arranque-bios     el #bios tapa al juego
//
// SOLO EN EL JUEGO DE VERDAD. La pantalla espera una tecla y se queda con todas mientras corre, asi
// que trabaria a cualquier prueba que apriete teclas apenas carga (tools/smoke.js y los fixtures).
// El preload de Electron marca `RASANTE_APP`, y las pruebas abren el juego sin preload. En el
// navegador se puede forzar con `?intro`. Sin ninguno de los dos, termina en el acto.
//
// NO SE SALTEA (autor, 4/10: "no se puede adelantar, hay que esperar; recien se toma cualquier tecla
// cuando la pantalla diga presionar cualquier tecla"): antes una tecla adelantaba hasta el aviso; ahora
// solo cuenta EN el aviso, y ahi es la ficha. Las teclas, los clics y los botones del mando no llegan
// al juego mientras esto corre.
import { cv, avisoFont } from './ctx.js';
import { SFX_DEF } from '../data/sfx.js';
import { PLANES } from '../data/planes.js';
import { T } from '../core/i18n.js';
/** Cuantos ARCHIVOS de sonido distintos tiene el catalogo (lo que dice el BIOS que cargo). */
const N_SONIDOS = new Set(Object.values(SFX_DEF).flatMap(d => d.f || [])).size;

/** Los tiempos, en segundos. FUNDE es el de styles.css (#arranque): si se cambia uno, el otro. */
export const ARRANQUE = {
  NEGRO: 0.4, FUNDE: 1.4, ESPERA: 0.45,   // telon, fundido del gabinete, tubo apagado a la vista
  PRENDE: 0.8,                            // la animacion del tubo
  BIOS_DESDE: 0.5,                        // desde que prende el tubo hasta la primera letra
  LINEA: 0.2, MEMORIA: 0.7, CARGA: 0.9,   // cada renglon, el conteo de memoria, los puntos de CARGANDO
  VACIO: 0.7,                             // el BIOS se borra y queda negro antes del cartel
  SUENA: 0.45,                            // INSERTE FICHA solo, hasta que suena el insert coin
  FICHA: 0.45 + 1.25,                     // …y lo que dura el sonido (1,23 s): ahi cambia al aviso
  CREDITO: 0.9,                           // de la ficha a la portada: lo que dura la moneda
  APAGA: 0.3,                             // el fundido del #bios al continuar (styles.css)
};

// EL BIOS. Ficticio y de la casa: "TALLER DEL TURCO" es el mecanico de la escuadrilla (M1). Cada
// renglon dice que es: `cab` cabecera, `ok` chequeo con OK al final, `mem` el conteo de memoria,
// `carga` CARGANDO con puntos, `''` un renglon en blanco.
// (16/10, el autor: "RASANTE BIOS sacamos, pongamos solo BIOS o algo de la epoca; abajo una maquina
// configurada por el Pichon, y algun detalle de MATYMUN"; "voces no tiene, sonidos cargados; modelos algo
// mas"; y "TODO con su traduccion en ingles"): una BIOS de las de antes, sin marca, la maquina armada por el
// Pichon y el numero de serie con la firma. Los textos son CLAVES de data/strings.js; las cuentas son de
// verdad — los archivos de sonido del catalogo (data/sfx.js) y los aviones del roster (data/planes.js).
const BIOS = [
  ['bios_rom', 'cab'],
  ['bios_maq', 'cab'],
  ['', ''],
  ['bios_cpu', 'ok'],
  ['bios_mem', 'mem'],
  ['bios_video', 'ok'],
  ['bios_sonido', 'ok'],
  ['bios_modelos', 'ok'],
  ['bios_monedero', 'ok'],
  ['bios_config', 'ok'],
  ['bios_mandos', 'ok'],
  ['', ''],   // (16/10, el autor: "dale espacios") la firma, separada de los chequeos
  ['bios_ns', 'cab'],
  ['bios_ig', 'cab'],   // (16/10, el autor: la cuenta del juego)
  ['', ''],
  ['bios_carga', 'carga'],
];
/** El texto de un renglon del BIOS, en el idioma activo (con las cuentas puestas). */
const biosTxt = k => (k ? T(k, { n: k === 'bios_sonido' ? N_SONIDOS : PLANES.length }) : '');
// LA CALIDAD DE CADA PANTALLA (veces la grilla de 320x180; todas pedidas por el autor el 4/10). RES: el BIOS,
// a 1x — la grilla del juego, tosco a proposito ("bajale la calidad a la primera pantalla", "menos
// calidad"). RES_FICHA y RES_AVISO: los dos carteles — subieron a 8 ("un poquito menos borroso") y
// despues bajaron ("a INSERTE FICHA bajarle un poco mas de calidad, y a presione cualquier tecla un
// poco tambien"). A pantalla completa el tubo estira el canvas, asi que menos es mas tosco.
const BW = 320, BH = 180, RES = 1, RES_FICHA = 3, RES_AVISO = 4;
const COL = { texto: '#aab8bc', cab: '#e8eef0', ok: '#7fe07f', ficha: '#e8a33d', aviso: '#e8eef0' };

let activo = false;
/** ¿Esta corriendo? Mientras si, el mando no le llega al juego (core/input.js). */
export const arranqueActivo = () => activo;

/** Corre la secuencia. `alPrender` (el tubo), `alCargado` (el insert coin: INSERTE FICHA ya esta
 *  en pantalla), `alFicha` (la moneda) y `alTerminar` (ya se ve la
 *  portada) son los ganchos de sonido y musica de game.js. */
export function arrancar({ alEmpezar, alPrender, alFinBios, alCargado, alFicha, alTerminar } = {}) {
  const b = typeof document !== 'undefined' && document.body, stage = cv && cv.parentElement;
  const bios = b && document.getElementById('bios');
  // (en MODO DEV no hay arranque: directo al juego — 8/10, ver core/dev.js)
  const deVerdad = typeof window !== 'undefined' && !window.RASANTE_DEV && (window.RASANTE_APP || /[?&]intro\b/.test(location.search));
  if (!b || !stage || !bios || !deVerdad) {
    if (b) b.classList.remove('arranque-negro', 'arranque-apagado', 'arranque-bios');
    if (alTerminar) alTerminar();
    return;
  }
  activo = true;
  // EL BOOTING DE LA PC (autor, 16/10): suena desde el negro, antes de que prenda el tubo
  if (alEmpezar) alEmpezar();
  b.classList.add('arranque-bios');
  bios.width = BW * RES; bios.height = BH * RES;
  const g = bios.getContext('2d');

  // EL RELOJ: `fase` y el momento en que empezo, en segundos de pared
  const ahora = () => performance.now() / 1000;
  let fase = 'espera', desde = ahora(), prendido = false, ficha = false, padPrev = true;
  let cargado = false;
  const pasarA = f => {
    fase = f; desde = ahora();
    // el cartel, mas nitido: el canvas se agranda una sola vez al entrar a la ficha (o a lo que siga,
    // si una tecla salteo el BIOS)
    const res = f === 'ficha' ? RES_FICHA : f === 'aviso' || f === 'credito' ? RES_AVISO : RES;
    if (bios.width !== BW * res) { bios.width = BW * res; bios.height = BH * res; }
  };
  const relojes = [];
  const despues = (s, fn) => relojes.push(setTimeout(fn, s * 1000));

  const prender = () => {
    if (prendido) return;
    prendido = true;
    b.classList.remove('arranque-negro', 'arranque-apagado');
    stage.classList.add('tubo-prende');
    setTimeout(() => stage.classList.remove('tubo-prende'), ARRANQUE.PRENDE * 1000);
    if (alPrender) alPrender();
    pasarA('bios');
  };
  const echarFicha = () => {
    if (ficha) return;
    ficha = true;
    if (alFicha) alFicha();
    pasarA('credito');
    despues(ARRANQUE.CREDITO, terminar);
  };
  const terminar = () => {
    if (!activo) return;
    activo = false;
    relojes.forEach(clearTimeout);
    ['keydown', 'pointerdown'].forEach(ev => window.removeEventListener(ev, tecla, true));
    b.classList.add('arranque-sale');
    setTimeout(() => b.classList.remove('arranque-bios', 'arranque-sale'), ARRANQUE.APAGA * 1000);
    if (alTerminar) alTerminar();
  };
  // CUALQUIER TECLA: solo en el aviso ("PRESIONE CUALQUIER TECLA"), y ahi ES LA FICHA. Antes de eso se
  // traga y no hace nada — la secuencia no se adelanta. No llega al juego: si no, la misma tecla
  // saltearia tambien la portada.
  const avanzar = () => {
    if (fase === 'aviso') echarFicha();
  };
  function tecla(e) {
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.type === 'keydown' && e.repeat) return;
    avanzar();
  }
  ['keydown', 'pointerdown'].forEach(ev => window.addEventListener(ev, tecla, true));

  despues(ARRANQUE.NEGRO, () => b.classList.remove('arranque-negro'));
  despues(ARRANQUE.NEGRO + ARRANQUE.FUNDE + ARRANQUE.ESPERA, prender);

  // el largo del BIOS: cada renglon dura LINEA, y los de memoria y carga lo suyo
  const durRenglon = tipo => tipo === 'mem' ? ARRANQUE.MEMORIA : tipo === 'carga' ? ARRANQUE.CARGA : ARRANQUE.LINEA;
  const BIOS_T = BIOS.reduce((s, [, tipo]) => s + durRenglon(tipo), 0);

  const cuadro = () => {
    if (!activo) return;
    // EL MANDO: cualquier boton, en el flanco (el que venia apretado de antes no cuenta)
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(p => p && p.connected) : [];
    const algun = pads.some(p => p.buttons.some(x => x.pressed));
    if (algun && !padPrev) avanzar();
    padPrev = algun;

    const t = ahora() - desde;
    if (fase === 'bios' && t > ARRANQUE.BIOS_DESDE + BIOS_T + 0.5) { pasarA('vacio'); if (alFinBios) alFinBios(); }
    else if (fase === 'vacio' && t > ARRANQUE.VACIO) pasarA('ficha');
    else if (fase === 'ficha' && t > ARRANQUE.SUENA && !cargado) { cargado = true; if (alCargado) alCargado(); }
    if (fase === 'ficha' && t > ARRANQUE.FICHA) pasarA('aviso');
    dibujar(g, fase, ahora() - desde, durRenglon);
    if (activo) requestAnimationFrame(cuadro);
  };
  requestAnimationFrame(cuadro);
}

/** Un cuadro del #bios. */
function dibujar(g, fase, t, durRenglon) {
  const k = g.canvas.width / BW;
  g.setTransform(k, 0, 0, k, 0, 0);
  g.fillStyle = '#000'; g.fillRect(0, 0, BW, BH);
  g.textBaseline = 'top';
  const parpadeo = periodo => (t % periodo) < periodo * 0.6;
  if (fase === 'bios') {
    g.font = 'bold 7px monospace'; g.textAlign = 'left';
    // AIRE ENTRE LETRAS (16/10, el autor: "esta todo muy encimado y no se lee, separa las letras"): a 7 px y a
    // la resolucion baja del BIOS las letras se pegaban; un pixel de mas entre cada una
    if ('letterSpacing' in g) g.letterSpacing = '1px';
    let tt = t - ARRANQUE.BIOS_DESDE, y = 10, cursorY = 10, cursorX = 12;
    for (const [clave, tipo] of BIOS) {
      const txt = biosTxt(clave);
      if (tt < 0) break;
      const dur = durRenglon(tipo), u = Math.min(1, tt / dur);
      g.fillStyle = tipo === 'cab' ? COL.cab : COL.texto;
      // los renglones normales se tipean; los demas aparecen enteros y lo que corre es su numero
      const visible = tipo === 'ok' || tipo === 'cab' ? txt.slice(0, Math.ceil(txt.length * Math.min(1, u * 1.6))) : txt;
      g.fillText(visible, 12, y);
      let fin = 12 + g.measureText(visible).width;
      if (tipo === 'ok' && u >= 1) { g.fillStyle = COL.ok; g.fillText('OK', 216, y); fin = 230; }
      if (tipo === 'mem') {
        const k = Math.round(640 * u), num = String(k).padStart(4, '0') + 'K';
        g.fillText(num, 70, y);
        if (u >= 1) { g.fillStyle = COL.ok; g.fillText('OK', 216, y); }
        fin = 70 + g.measureText(num).width;
      }
      if (tipo === 'carga') {
        const puntos = '.'.repeat(Math.floor(u * 6));
        g.fillText(puntos, 12 + g.measureText(txt).width + 2, y);
        fin += 2 + g.measureText(puntos).width;
      }
      cursorY = y; cursorX = fin + 2;
      tt -= dur; y += 10;
    }
    if (parpadeo(0.5)) { g.fillStyle = COL.texto; g.fillRect(cursorX, cursorY + 6, 5, 1); }
    if ('letterSpacing' in g) g.letterSpacing = '0px';
  } else if (fase === 'ficha' || fase === 'aviso' || fase === 'credito') {
    // EL CARTEL, UNO SOLO Y EN EL MEDIO: INSERTE FICHA fijo mientras suena el insert coin; al
    // terminar el sonido lo REEMPLAZA la invitacion, del mismo porte y titilando. Cuando cae la
    // ficha la invitacion queda quieta y aparece el credito.
    g.textAlign = 'center'; g.fillStyle = COL.ficha;
    if (fase === 'ficha') { g.font = avisoFont(30); g.fillText(T('bios_ficha'), BW / 2, BH / 2 - 22); }
    else if (fase === 'credito' || parpadeo(1.0)) {
      g.font = avisoFont(16);
      g.fillText(T('bios_tecla'), BW / 2, BH / 2 - 20, BW - 16);
      g.fillText(T('bios_continuar'), BW / 2, BH / 2 + 2, BW - 16);
    }
    g.font = 'bold 7px monospace';
    // CREDITO 1 apenas aparece PRESIONE CUALQUIER TECLA (autor, 16/10), no recien con la ficha
    if (fase === 'aviso' || fase === 'credito') { g.textAlign = 'right'; g.fillStyle = COL.texto; g.fillText(T('bios_credito'), BW - 10, BH - 14); }
  }
}
