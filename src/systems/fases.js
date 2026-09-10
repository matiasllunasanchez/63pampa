// FASES — el estado de la corrida (docs/sistemas/PLAN_MISION_CINCO_FASES.md §11).
//
// La MATEMATICA vive en core/fases.js, que es puro y lo prueba `npm run unit`. Aca vive lo que
// tiene estado: que lista de fases trae la mision en curso, cual es su objetivo, y en cual estaba
// parada el cuadro anterior. Es la misma division que core/tramos.js ↔ systems/tramos.js, y esta
// copiada a proposito: dos items hermanos que se leen distinto son dos items que alguien va a
// tener que volver a entender.
//
// COMO SE LEE: `val('radar', RADAR_ALT)` RESUELVE en el momento, contra `run.dist`. No se cachea
// la fase vigente una vez por cuadro porque eso le agrega al item un orden obligatorio adentro de
// `update()` — y el dia que alguien mueva una llamada, el lector tomaria la fase del cuadro
// anterior sin que nada se queje.
//
// NADIE ESCRIBE cfg. Las fases se leen y el cfg queda intacto, que es lo que permite que salir de
// la mision no te deje el techo de radar del ultimo filo pegado al modo siguiente.
import { faseAt, validarFases } from '../core/fases.js';
import { run } from '../core/run.js';
import { FILO_RAMPA_M } from '../data/tuning.js';

let lista = null;        // las fases de la mision en curso (null = mision sin fases: todas las de hoy)
let objetivo = 0;        // la distancia meta contra la que se miden las fracciones
let ultima = -1;         // el indice de la fase vigente en el cuadro anterior (para el flanco)

/** Le pasa a la corrida las fases de la mision. Lo llama `setRunObjective()` en game.js, al lado
 *  de `setTramos()` y por el mismo motivo: es donde ya se calcula `objectiveDist`, y las
 *  fracciones no significan nada sin su objetivo. Atarlo ahi garantiza que la fraccion y su
 *  objetivo son SIEMPRE del mismo run. */
export function setFases(f, obj) {
  lista = Array.isArray(f) && f.length ? f : null;
  objetivo = obj > 0 ? obj : 0;
  ultima = -1;
  return lista;
}

/** Sin fases: el estado normal de TODAS las misiones de hoy y de todos los modos infinitos. */
export const hayFases = () => !!lista && objetivo > 0;

/** La fase vigente ahora mismo, o null (= manda el cfg plano). */
export const vigente = () => faseAt(run.dist, objetivo, lista);

/** ¿ESTA MISION SIGUE DESPUES DEL BUQUE? Es la pregunta que decide si el climax cierra la mision
 *  o si todavia falta volver, y por eso vive aca y no en game.js: la contesta la DATA.
 *
 *  Es "alguna fase pasa de 1" y no "hay una fase llamada 'vuelta'" a proposito. Lo que importa no
 *  es como se llama el tramo sino donde termina el vuelo — una mision podria cerrar con otro tipo
 *  y el regreso tendria que existir igual. Preguntar por el nombre seria el `if (fase === ...)`
 *  que la convencion del repo prohibe; preguntar por la geometria es leer el dato. */
export const hayVuelta = () => hayFases() && lista[lista.length - 1].hasta > 1;

/** ¿YA SE VOLO TODO? Cierto cuando la corrida paso el ultimo `hasta` de una mision con vuelta: no
 *  queda fase, y eso quiere decir que llegaste a casa. En una mision sin fases es SIEMPRE falso —
 *  ahi el final lo sigue decidiendo el objetivo, como siempre. */
export const llegaste = () => hayVuelta() && run.dist > objetivo * lista[lista.length - 1].hasta;

/** El TIPO vigente, o null. Es lo que preguntan los que solo quieren saber "¿esto es un filo?"
 *  sin pedir un valor — el HUD y las sondas, no los sistemas de juego. */
export const tipo = () => { const f = vigente(); return f ? f.tipo : null; };

/** EL TECHO DEL RADAR AHORA, CON LA RAMPA DE ENTRADA (PLAN_MISION_CINCO_FASES §11.1).
 *
 *  Un techo que cae de golpe de 20 a 9 obliga a una picada de panico, y una picada con turbo
 *  contra el agua deja dos decimas de margen: el primer playtest lo reporto como "yendo con turbo
 *  al querer bajar rapido el avion me rebota y se me hace pelota". Con la rampa el techo BAJA a lo
 *  largo de `FILO_RAMPA_M` metros desde el borde de la fase, asi que cuando muerde ya venis
 *  bajando y la decision deja de ser un reflejo.
 *
 *  SOLO BAJANDO. Al salir de un filo el techo vuelve a subir de una: recuperar el cielo no es una
 *  maniobra que haya que preparar, y hacerla gradual solo lograria que el jugador no se entere de
 *  que ya puede respirar.
 *
 *  Sin fases devuelve `base` y no hay rampa que valga — la campaña entra y sale por el mismo
 *  camino de siempre. */
export function techoRadar(base) {
  const f = vigente();
  if (!f) return base;
  const techo = f.val('radar', base);
  const anterior = f.idx > 0 ? faseAt(objetivo * (lista[f.idx - 1].hasta - 1e-9), objetivo, lista) : null;
  const techoAnt = anterior ? anterior.val('radar', base) : base;
  if (!(techo < techoAnt)) return techo;                 // no baja: nada que rampear
  const desde = f.idx > 0 ? lista[f.idx - 1].hasta * objetivo : 0;
  const t = Math.max(0, Math.min(1, (run.dist - desde) / FILO_RAMPA_M));
  return techoAnt + (techo - techoAnt) * t;
}

/** EL LECTOR. `fallback` es lo que rige sin fases — normalmente `cfg.loQueSea` o la constante de
 *  tuning de siempre, que este modulo no importa a proposito: quien pregunta ya sabe cual es su
 *  default, y asi el item no se convierte en un segundo dueño de la configuracion del mapa. */
export function val(clave, fallback) {
  const f = vigente();
  return f ? f.val(clave, fallback) : fallback;
}

/** Inyecta fases al run EN CURSO (sonda `__fsset`). Devuelve los errores del validador: una lista
 *  mal formada se rechaza entera y la corrida sigue con lo que tenia. */
export function setFasesProbe(f, obj) {
  const e = validarFases(f);
  if (e.length) return e;
  setFases(f, obj > 0 ? obj : objetivo);
  return [];
}

export function resetFases() { setFases(null, 0); }

/** UN CUADRO del item, y lo unico que hace es CONTESTAR: `{ idx, tipo, radio }` cuando se acaba de
 *  ENTRAR a una fase, o null. Quien la anuncia es el orquestador — un sistema no llama hacia
 *  arriba (convencion 2 de ARQUITECTURA).
 *
 *  Mismo flanco que `stepTramos()`, y las mismas tres reglas caen solas de la misma forma: una vez
 *  por entrada · solo en 'play', porque es el unico lugar desde donde game.js lo llama y `ultima`
 *  no se mueve mientras tanto · y sin coro tras un salto de sonda, porque las fases que el salto se
 *  llevo por delante nunca llegaron a ser vigentes.
 *
 *  A DIFERENCIA DE LA RADIO DE TRAMO, no lleva lista de dichas: una fase no puede repetirse en una
 *  corrida (las fracciones son estrictamente crecientes), asi que el flanco alcanza. */
export function stepFases() {
  const f = vigente();
  const i = f ? f.idx : -1;
  if (i === ultima) return null;
  ultima = i;
  if (!f) return null;
  return { idx: i, tipo: f.tipo, radio: f.val('radio', null) };
}

/** Foto del estado para la sonda `__fsdbg`. Los valores son los RESUELTOS: lo que los lectores van
 *  a ver este cuadro, no lo que dice la data — que es la unica forma de comprobar desde afuera que
 *  la fase esta rigiendo de verdad y no que la mision tiene esos valores de casualidad.
 *
 *  Reporta TAMBIEN el cfg del que se cae, con el mismo criterio que `__trdbg`: sin eso, la regla
 *  suprema ("sin fases, lo resuelto ES el cfg") no se puede comprobar sin abrir el bundle. */
export function dbg(cfg, radarAlt) {
  const f = vigente();
  return {
    idx: f ? f.idx : null,
    tipo: f ? f.tipo : null,
    hasta: f ? f.hasta : null,
    n: lista ? lista.length : 0,
    p: objetivo > 0 ? +(run.dist / objetivo).toFixed(3) : null,
    dist: Math.round(run.dist), obj: Math.round(objetivo),
    cfg: cfg ? { obstacles: cfg.obstacles, caza: cfg.caza, bombs: cfg.bombs } : null,
    obstacles: val('obstacles', cfg ? cfg.obstacles : null),
    caza: val('caza', cfg ? cfg.caza : null),
    bombs: val('bombs', cfg ? cfg.bombs : null),
    radar: +techoRadar(radarAlt).toFixed(2),   // el RESUELTO, con la rampa aplicada
    agua: val('agua', 1),
    voces: val('voces', true),
    nafta: val('nafta', 1),
    pinta: val('pinta', 'cap'),
    radio: val('radio', null),
  };
}
