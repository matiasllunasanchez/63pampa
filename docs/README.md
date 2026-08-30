# Documentación de RASANTE

El punto de entrada del proyecto es el [`README.md`](../README.md) de la raíz (qué es el
juego y cómo se juega). Acá vive el resto, **separado por contexto — una carpeta, un tipo
de trabajo**:

| carpeta | contexto | empezar por |
|---|---|---|
| **[historia/](historia/)** | la campaña "El cuaderno de Mateo": guion, storyboard, personajes, aviones, música, diálogo, referencias de arte | [GUION_3.md](historia/GUION_3.md) |
| **[produccion/](produccion/)** | producción audiovisual: teaser, video IA (Kling), herramientas | [TEASER.md](produccion/TEASER.md) |
| **[sistemas/](sistemas/)** | specs de gameplay: maniobras, velocidad, combustible, alturas, escuadrón, ARENA | [PLAN_MINUTOS_SAGRADOS.md](sistemas/PLAN_MINUTOS_SAGRADOS.md) |
| **[proyecto/](proyecto/)** | gestión: roadmap, estado, inventario de arte, plan de campaña | [ROADMAP.md](proyecto/ROADMAP.md) |
| **[publicacion/](publicacion/)** | salida al mundo: Electron/Steam, antipiratería | [PLAN_ELECTRON_STEAM.md](publicacion/PLAN_ELECTRON_STEAM.md) |
| **[ARQUITECTURA.md](ARQUITECTURA.md)** *(raíz)* | el mapa del código — el único doc suelto, porque es la puerta de todo lo demás | — |
| [_archivo/](_archivo/) | históricos y supersedidos — se consultan, no se borran | — |

**Vocabulario rápido:** todo run combina dos FASES — **PASILLO** (el vuelo rasante, estado
`'play'`) y **ARENA** (el asalto al buque, volado en 3D). Los MODOS del menú son
combinaciones de las dos; **MINUTOS SAGRADOS** es el modo que juega solo ARENA.

**El juego se llama RASANTE. La campaña principal: "El cuaderno de Mateo"** (GUION_3).
La segunda campaña, a futuro: *"El fantasma del mar"*.

---

## 📖 historia/ — sincronizados con GUION_3 (3.5)

| documento | qué es |
|---|---|
| [GUION_3.md](historia/GUION_3.md) | **EL GUION VIGENTE (3.7).** 14 misiones, prólogo **P.1–P.4** (⚠ el marco de la encomienda está OCULTO hasta el final — P.0 NO abre el juego), dos finales, post-créditos. Incluye **§9 dialectos + §9b el tucumano del Turco**. Marcas: 🟥 nuevo / 🟨 cambió / sin marca = igual a 2.3 |
| [GUION_LECTURA.md](historia/GUION_LECTURA.md) | 🟥 **parte 1 — el guion para compartir.** Solo la historia: prólogo, 14 misiones, dos finales, post-créditos. Sin marcas de cambio, sin notas de producción y **sin nada que spoilee** (ni siquiera en los títulos de escena) |
| [GUION_LECTURA_APENDICE.md](historia/GUION_LECTURA_APENDICE.md) | 🟥 **parte 2 — cómo está armado.** Personajes, tesis, marco narrativo, indicativos, mapa emocional. **Se manda DESPUÉS de que el lector terminó la parte 1**, porque adelanta quién muere y cómo termina |

> **Los dos son DERIVADOS de GUION_3.md y no se editan a mano.** Se regeneran con
> `python3 produccion/hacer_guion_lectura.py`. Los textos de apertura y cierre de la parte 1
> viven en `produccion/_lectura_front.md` y `_lectura_cierre.md`; la portada de la parte 2
> está dentro del script. **Cada vez que se toca GUION_3 hay que volver a correrlo** y
> rehacer los PDF/docx.
| [MISION_FINAL.md](historia/MISION_FINAL.md) | diseño de nivel de la M14: fases, contrarreloj, muertes, el momento del misil, las dos salidas |
| [STORYBOARD_1.md](historia/STORYBOARD_1.md) | guion visual con prompts + sección **ACTUALIZACIÓN 3.0** al final (tabla obligatoria M4–M14 + post-créditos). ⚠ La primera mitad tiene tablas marcadas **⛔ SUPERSEDIDA** con la numeración vieja de 12 misiones — **la fuente de verdad es la tabla 3.0 del final** |
| [**PROMPTS_INDICE.md**](historia/PROMPTS_INDICE.md) | ⭐ **EMPEZAR ACÁ si vas a generar imágenes.** Una página: qué archivo abrir para cada cosa y cuáles NO se copian (los que tienen `{llaves}`) |
| [**PROMPTS_AIRE_LISTOS.md**](historia/PROMPTS_AIRE_LISTOS.md) | ⭐ **TODOS los prompts a color YA ARMADOS** — 18 placas (prólogo · M1 · M2 · M3) + 10 retratos + 6 figuras del P.2. Estilo, época y formato ya adentro de cada bloque: se copia entero y se pega. **Generado**: `python3 produccion/hacer_prompts_listos.py` |
| [**PROMPTS_TIERRA_LISTOS.md**](historia/PROMPTS_TIERRA_LISTOS.md) | ⭐ **TODOS los prompts de cuaderno YA ARMADOS** — P.1a arroyo y P.1b sapito con la mano de **Mateo a los 8**, y **las 14 páginas del cuaderno** (P.4 y M1–M13, una por misión) con la mano de los 18, cuaderno abierto 16:9, dibujos sueltos y sin repetir. **Generado**: mismo script |
| [PROMPTS_PLACAS.md](historia/PROMPTS_PLACAS.md) | 🟩 **las placas de TODA la campaña**: los 16 lugares reutilizables + los cuadros propios, con el mapa de qué placa usa cada misión. La clave: no son 14×3 escenas, son **16 lugares que se repiten** |
| [PROMPTS_PLACAS_LISTOS.md](historia/PROMPTS_PLACAS_LISTOS.md) | 🕰 **VIEJO — reemplazado por PROMPTS_AIRE_LISTOS.md.** Los 25 prompts de placas ensamblados, pero anteriores a las correcciones de agosto. **Generado**: `python3 tools/hacer_prompts_prologo.py` |
| [PROMPTS_VN_PROLOGO.md](historia/PROMPTS_VN_PROLOGO.md) | ⛔ **de trabajo, NO se copia** (tiene `{llaves}`). La bajada operativa del prólogo: placas + figuras + retratos, con el sistema de TRES NIVELES (placa vacía / compuesta por el motor / horneada) y las cuatro reglas de las figuras |
| [PROMPTS_VN_PROLOGO_LISTOS.md](historia/PROMPTS_VN_PROLOGO_LISTOS.md) | 🕰 **VIEJO — reemplazado por PROMPTS_AIRE_LISTOS.md.** Los 24 prompts del prólogo ensamblados — bloque de estilo adentro, nombre de archivo por asset, se copia y se pega. **Generado**: `python3 tools/hacer_prompts_prologo.py` |
| [PROMPTS_VN_M1_M3.md](historia/PROMPTS_VN_M1_M3.md) | ⛔ **de trabajo, NO se copia** (tiene `{llaves}`). Prompts VN — M1, M2, M3: 16 placas literales a la descripción del guion, **sin personajes** (se componen encima). 🟥 **Las cartas de Mateo pasan a 16:9 pantalla completa** |
| [PROMPTS_HOJAS_PERSONAJE.md](historia/PROMPTS_HOJAS_PERSONAJE.md) | hojas modelo de los 9 personajes + props + marcas personales. ✅ Norma corregida (3.4: **sí se le ve la cara**) · 🟥 faltan 4 hojas nuevas listadas al final (piloto peruano, mecánico de Tandil, Claribel, el pibe de la 10) |
| [AVIONES_ESCUADRON.md](historia/AVIONES_ESCUADRON.md) | los 5 A-4B personalizados + marcas personales + regla: el terito es el ÚNICO animal pintado. 🟩 **Por qué A-4B y no Super Étendard** (la decisión, escrita) + hoja de avión con **Nano Banana** (regenerar a partir de imágenes, con rol por imagen y prompts de corrección) |
| [ESTILO_VISUAL.md](historia/ESTILO_VISUAL.md) | 🟩 **la biblia de estilo — fuente única.** El bloque canónico de pixel art Neo Geo/Metal Slug (se cita, no se reescribe), el period lock, la regla de "sin texto", la paleta, el método de los tres roles (forma / estilo / encuadre), cómo corregir sin regenerar, y **los tamaños 1:1 de cada asset** calculados con `U × SC = 3` |
| [AVIONES_CATALOGO.md](historia/AVIONES_CATALOGO.md) | 🟩 **el roster jugable entero**: qué fue cada avión de verdad, en qué canasto de época cae (CANON / DE ÉPOCA / FUERA DE ÉPOCA) y qué perilla lo hace distinto. Incluye los prompts de **preview** y de **CABINA** de los seis (la del A-4B primero: es la campaña entera). Destapa que el **Pampa 63 es de 1984** y que el Mirage del guion (5P) no es el de `planes.js` (IIIEA) |
| [SISTEMA_DIALOGO.md](historia/SISTEMA_DIALOGO.md) | texto-primero: IDs estables, 4 registros, `hold`, timing. **El juego funciona sin voces por diseño.** ✅ ejemplos renumerados a `M07_LOCKER_*` (14 misiones) |
| [RETRATOS.md](historia/RETRATOS.md) | escenas estáticas estilo VN: **~16 placas** de ambiente + **72 retratos** con expresiones + la lista de cuadros sagrados que exigen escena completa |
| [MISIONES_01_04.md](historia/MISIONES_01_04.md) | dossier por misión: ficha, perillas del mapa, distancia y tiempo medidos, composición, clímax, mejoras y guion. 🔴 **numeración vieja de 12** — la campaña ya es de 14 |
| [story.js](../src/data/story.js) | 🟩 **la fuente de verdad del modo historia**: 95 escenas, cada una con su texto, su placa, la cara de cada hablante y su hold. Se edita ahí, no en `strings.js` |
| [PROMPTS_RETRATOS_LISTOS.md](historia/PROMPTS_RETRATOS_LISTOS.md) | 🟩 **los 72 prompts de retratos YA ENSAMBLADOS** — 16 hojas, una por personaje, todas con la misma grilla. Se copia y se pega. **Generado**: `python3 tools/hacer_prompts_retratos.py` (`--ids` lista los nombres válidos) |
| [RETRATOS_CANON.md](historia/RETRATOS_CANON.md) | el canon de los personajes **medido** sobre `team.png`: alturas, caras a resolución real, y la intención leída de las poses de cada lámina |
| [MEJORAS_PICHON.md](historia/MEJORAS_PICHON.md) | 🟥 **el armamento artesanal REAL como mejoras del Pichón**: chaff de máquina de fideos, bengalas caseras, espoletas de 12 s, KEMA, la ITB. Con fuentes, precio de cada mejora y la regla de atribución | catálogo ✅ · sin implementar |
| [REFERENCIAS.md](historia/REFERENCIAS.md) | tipografías y capas de foto — ⚠ *falta el 4º registro (DIALOGO); vive por ahora en SISTEMA_DIALOGO §"Los cuatro registros"* |
| [SOUNDTRACK.md](historia/SOUNDTRACK.md) | ✅ **v4.0 — 36 pistas** al guion 3.0, cada una con referencia real de emoción (material privado, no se publica). **Toda pista cantada trae su LETRA completa** en español argentino, escrita con frases del guion, y el prompt describe cómo debe sonar la voz. 6 pistas nuevas: la Chancha (M6) · el reverso de la foto (M7) · el relevo de escuadrón · el desbloqueo del Mirage (M10) · la carta (M13) · **el cierre común** (narración sobre fotos reales). Los 4 silencios están documentados como partitura, no como huecos |
| [PREGUNTAS_HISTORICAS.md](historia/PREGUNTAS_HISTORICAS.md) | ✅ Mirage peruanos **verificado** (Tandil, 5/6, nunca combatieron) · ovejas/caracú · Mundial. ⚠ *pendientes: países, dialectos, correo, matrículas C-2xx* |
| `characters_examples/` | renders de referencia ya generados |

## 🎬 produccion/ — teaser y video IA

| documento | qué es |
|---|---|
| [TEASER.md](produccion/TEASER.md) | **plan de rodaje del teaser** (~45 s): 5 planos, prompts A/B/movimiento, presupuesto 620 créditos, checklists |
| [PLAN_CINEMATICAS.md](produccion/PLAN_CINEMATICAS.md) | qué lleva video IA y qué va como láminas fijas con sonido (la mayoría) |
| [TEST_KLING_CINEMATICAS.md](produccion/TEST_KLING_CINEMATICAS.md) | protocolo de tests de Kling 3.0 + tabla de modelos + orden de gasto |
| [PROMPTS_TEST4.md](produccion/PROMPTS_TEST4.md) | prompts expandidos del test "Tero sube al avión" |
| [pixelrefine.py](produccion/pixelrefine.py) | herramienta: recupera el pixel art de video IA (`--native WxH --colors N`) |
| [COMPARTIR_EL_GUION.md](produccion/COMPARTIR_EL_GUION.md) | 🟥 **cómo pasarle la historia a alguien para que opine sin que se le arruine**: las dos partes, qué se le saca al guion de trabajo, cómo se regenera todo y las preguntas que se le hacen al lector |
| `hacer_guion_lectura.py` · `hacer_pdf_lectura.sh` · `_lectura_html.py` · `_lectura_front.md` · `_lectura_cierre.md` | el pipeline de la versión de lectura — ver COMPARTIR_EL_GUION.md |

## ⚙️ sistemas/ — specs de gameplay

| documento | qué es | estado |
|---|---|---|
| [SPEC_MODO_HISTORIA.md](sistemas/SPEC_MODO_HISTORIA.md) | 🟥 **análisis funcional del modo historia (pantallas VN)** para IA implementadora: 12 RF con criterios de aceptación, fixture del locker, 6 fases. Incluye las **divergencias** entre el spec y el código real | **F1 construida** (motor de líneas: tipeo + `hold` + fallback a negro; `npm run story`). **La mitad TIERRA de F2 cerrada el 29/8**: el cuaderno de Mateo tiene pantalla propia — texto manuscrito en la hoja izquierda, sin velo, controles en las esquinas (`npm run cuaderno`, divergencias D-19…D-26). Falta el resto de F2 y F3–F6 |
| [PLAN_MINUTOS_SAGRADOS.md](sistemas/PLAN_MINUTOS_SAGRADOS.md) | la fase ARENA como pelea de boss, etapas E0–E9 | **vigente** |
| [SPEC_MODO_PASADA.md](sistemas/SPEC_MODO_PASADA.md) | 🟥 **análisis funcional del modo PASADA** para IA implementadora: 14 RF con criterios de aceptación, defaults elegidos, sondas (`?pasada=`, `__pdbg`), fixture y plan P0–P7 | ⏳ **pendiente, en cuarentena (18/8)** — el clímax es EL PULSO; se revisa a fondo en otro momento |
| [SPEC_PODER_CHANCHA.md](sistemas/SPEC_PODER_CHANCHA.md) | 🟥 **el poder LA CHANCHA** (reabastecimiento en vuelo, ROADMAP #15): llamar al KC-130 — hermano caro del MOMENTUM, una vez por run, cita jugable detrás de la canasta. 9 RF + defaults + fixture + plan H0–H5, y la ROTURA del guion como gate narrativo | ✅ **implementado entero (H0–H5, 18/8/2026)** · fixture `npm run chancha` · divergencias en §9 |
| [SPEC_TRAMOS.md](sistemas/SPEC_TRAMOS.md) | 🟥 **TRAMOS**: el guion de spawn por misión — segmentos por fracción con densidad, mezcla (`favor`), bidones y radio propios. 5 RF, sondas (`__trdbg`/`__trset`), fixture `npm run tramos`, fases T0–T4 (T4 = el tránsito del Narwal en M4) | ✅ **implementado entero (T0–T4, 19/8/2026)** · fixture `npm run tramos` · la misión piloto (m3) vuela su tránsito mudo · 12 divergencias en §8 |
| [PASADA_ADRENALINA.md](sistemas/PASADA_ADRENALINA.md) | 🟥 **análisis de adrenalina del modo construido** (el Sea Dart mata sin lectura — 3 s, un popup y un punto de 3px de frente; la transición teletransporta al buque: de costado y grande → de proa y a 1280 m; 11,6 s de mar vacío por corrida) + **el plan de rescate R0–R6** con criterios medibles y el gate final del ultimátum | ⏸️ **en pausa (18/8): el clímax pasa a ser EL PULSO** |
| [PROPUESTAS_PASADA.md](sistemas/PROPUESTAS_PASADA.md) | 🟥 el clímax de una sola pasada: base histórica, mentiras permitidas, las tres propuestas con referencias (juegos y cine) y **§8b: la decisión — el modo compuesto** (A entrada + B suelta + C oleada) | **decidido 15/8 — el plan ejecutable es el SPEC** |
| [PROMPT_ARENA_VUELO_LIBRE.md](sistemas/PROMPT_ARENA_VUELO_LIBRE.md) | ARENA como vuelo 3D libre en ring acotado | **vigente** |
| [SPEC_AGUA_OLAS.md](sistemas/SPEC_AGUA_OLAS.md) | 🟥 **plan ejecutable del agua y las olas** en 9 fases (F0 cimiento `core/sea.js` → F8 mar 3D), escrito prescriptivo para implementador de esfuerzo MEDIO: fórmulas de partida, perillas con valores finales, trampas conocidas del repo, sonda `__ola` y fixture `npm run agua` | **spec — listo para implementar** |
| [PLAN_MANIOBRAS_FASES.md](sistemas/PLAN_MANIOBRAS_FASES.md) | 🟥 **EL PROGRAMA DE MANIOBRAS**: cimientos M0–M2 (fixture `maniobras` + PIRUETAS DE ACTOR + presentación CABINA — las 12 existentes ganan las tres vistas de una vez) y después las nuevas una por fase (M3 voltereta piloto → immelmann → rulo → batir de alas → la caída → VIFF → barrena) | **plan — listo para Opus medio** |
| [PROMPTS_MANIOBRAS.md](sistemas/PROMPTS_MANIOBRAS.md) | 🟥 **17 maniobras triadas** (las seis clásicas + la tarjeta del F-22 Demo Team) contra el código real: **9 ya existen o están cubiertas** (tonel, barril, split-S, media vuelta, re-encares de la PASADA, la Chancha, la VOLTERETA) y **8 llevan prompt pegable** (Immelmann, rulo, pasada de homenaje de m8, VIFF del Harrier, pedal turn, la caída, Hoover, barrena) | **herramienta + triage** |
| [PROMPT_MANIOBRA.md](sistemas/PROMPT_MANIOBRA.md) | 🟥 **prompt reusable**: pegás un link de video (reel/YouTube) y la IA estudia la maniobra cuadro por cuadro, la traduce al canon del A-4 y entrega un PLAN_PIRUETA_* con el modelo de la voltereta | **herramienta** |
| [PLAN_PIRUETA_VOLTERETA.md](sistemas/PLAN_PIRUETA_VOLTERETA.md) | 🟥 **la pirueta del backflip** (estudio cuadro por cuadro del reel del F-22 Demo Team), su traducción honesta al A-4 (hammerhead/loop cerrado; vapor en vez de bengalas; la maniobra "que no se puede" de la libreta del Pichón), los 4 tiempos, el precio de salida, los ganchos (contra LA COLA, super-salto, EL PULSO) y fases V0–V5 | **plan — sin implementar** |
| [PLAN_DIRECTOR_CINEMATICAS.md](sistemas/PLAN_DIRECTOR_CINEMATICAS.md) | 🟥 **cómo generar cinemáticas con el motor**: las 6 opciones (láminas · director 2D · estudio 3D · video · machinima · casi-cinemática con control) con costo y límite, qué escena del guion va con cuál, y **EL DIRECTOR** (timelines en data sobre verbos existentes: piruetas, actores, tempo, fx, radio) en fases C0–C5 | **opciones + plan — sin implementar** |
| [PLAN_DESTRUCCION.md](sistemas/PLAN_DESTRUCCION.md) | 🟥 **la destrucción**: el despiece generalizado (el sistema de pedazos del derribo, para TODOS los destructibles), la destrucción MUTUA al chocar, explosiones con carácter por tipo, onda expansiva y encadenamientos. Etapas D0–D5 | ✅ **implementado entero (D0–D5, 16/8/2026)** · fixture `npm run romper` |
| [SPEC_CHARLAS_VUELO.md](sistemas/SPEC_CHARLAS_VUELO.md) | 🟥 **las charlas en vuelo**: diálogo DURANTE la misión sin pausar el mundo — el odómetro se desacopla del scroll (la física sigue, la distancia no acredita), el sembrador calla, la UI se va, letterbox + chip de retrato + auto-avance con holds sagrados, el numeral se acerca a volar al lado. Disparadas por TRAMO (`charla:`). 6 RF + fases C0–C3 + `npm run charlas` | **spec — listo para implementar** |
| [SPEC_PODER_RASANTE.md](sistemas/SPEC_PODER_RASANTE.md) | 🟥 **el poder RASANTE (tecla 6)** — el juego activando su propio nombre: el default vertical invertido (resorte al ras), colchón sin invulnerabilidad, carga por volar bajo a mano, 12 s, dos cámaras a elegir, y la identidad por el silencio + la radio + el reflejo + la lección del sapito. 7 RF + fases RA0–RA4 + fixture `npm run rasante` | **spec — listo para implementar** |
| [PLAN_HORNEADO.md](sistemas/PLAN_HORNEADO.md) | 🟥 **el horneado**: todo lo que conviene pasar por low poly → sprite. B0 el horno unificado (luz/cámara/paleta + cajas medidas solas), B1 los restos, B2 los buques del pasillo (builders compartidos con `ship3d`), B3 el Harrier propio, B4 props de terreno, B5 partes v2, B6 aviones, B7 soldados y munición. Relevamiento del pipeline real (modelos procedurales, 4 horneadores) | **B0, B1, B2, B3 y B5 ✅ implementados · B4, B6 y B7 pendientes** (B2 con dos puntos bloqueados por la cuarentena de `ship3d`/PASADA — ver §5) |
| [PLAN_DESTRUCCION_V2.md](sistemas/PLAN_DESTRUCCION_V2.md) | 🟥 **variantes de muerte** por peso, momento, lado y azar: el acta de la muerte + selector determinista, 4 formas de morir del Harrier (+ eyección), clases de masa en tierra, helo/globo/barcos, el derribo del jugador por causa. Etapas V0–V6 + **la lista de hojas PNG pedidas** | **plan — sin implementar** |
| [PLAN_EL_PULSO.md](sistemas/PLAN_EL_PULSO.md) | 🟥 **el clímax como prueba de pulso** (cabina + tiempo casi congelado + secuencia de teclas rotulada contra reloj + cinemática de recompensa variable): análisis del género QTE (5 reglas), reuso casi total (tempo, combos de piruetas, cabina, aproximación 2D — sin 3D ni transición), fases Q0–Q5 | ✅ **implementado entero (Q0–Q5, 16/8/2026)** · fixture `npm run pulso` · se juega por sonda `?pulso=<n>`; **ninguna misión lo pide todavía** (§6.5: es plan C del boss — se enchufa con `climax: 'pulso'`) |
| [PLAN_HARRIERS_PERSECUCION.md](sistemas/PLAN_HARRIERS_PERSECUCION.md) | 🟩 **los Harrier en la cola** (estilo After Burner: presión → sobrepaso → ventana de contraataque) + **el modo PERSECUCIÓN** (volar de numeral: mantener la banda con un líder). Tres planes por fases (A/B/C) | **A completo (H0–H5, arte incluido) · B completo (N0–N3, N5) · C sin empezar.** Falta **el playtest** — ver §11 «Qué sigue» |
| [PLAN_TIERRA_COSTA.md](sistemas/PLAN_TIERRA_COSTA.md) | 🟥 **la tierra y la costa alcanzan al agua**: la auditoría de lo que el ítem del agua NO les dejó y seis fases (T1 turba por clima · T2 el viento peina el pasto · T3 relieve `core/tierra.js` — la fase de juego · T4 la costa rompe · T5 pedreros/turbales/alambrados · T6 la lluvia moja el suelo) | ✅ **implementado entero (T1–T6, 18/8/2026)** · fixture `npm run tierra` |
| [PLAN_AGUA_OLAS.md](sistemas/PLAN_AGUA_OLAS.md) | 🟥 **el agua**: programa visual (espuma/viento, camino del sol, agua por clima, mar 3D) + **las OLAS como obstáculo** (esquive vertical, roce generoso, 3 variantes por clima) — concreta ROADMAP #8 e integra VISUAL_UPGRADES E0.2/E0.3 | **decidido — el plan ejecutable es el SPEC** |
| [CONTROLES.md](sistemas/CONTROLES.md) | **qué tecla y qué botón hace qué, modo por modo** (pasillo · arena · pasada · barcaza · pulso), teclado + joystick + táctil, el eje Y unificado y los huecos conocidos | ✅ **normativo** — leído del código el 22/8/2026 |
| [PIRUETAS.md](sistemas/PIRUETAS.md) · [VELOCIDAD_MACH.md](sistemas/VELOCIDAD_MACH.md) | maniobras y escalones de velocidad | ⚠ *la tabla misión→mejora quedó desacoplada: las mejoras son roguelike (2 opciones desde M3), el guion no fija cuál va cuándo* |
| [PROMPT_ALTURAS.md](sistemas/PROMPT_ALTURAS.md) · [PROMPT_COMBUSTIBLE.md](sistemas/PROMPT_COMBUSTIBLE.md) · [PROMPT_ESCUADRON.md](sistemas/PROMPT_ESCUADRON.md) | alturas, combustible, escuadrón | specs |

## 📋 proyecto/ — gestión

| documento | qué es | estado |
|---|---|---|
| [ROADMAP.md](proyecto/ROADMAP.md) | backlog de ideas y features (numeradas, referenciables) | vivo |
| [PLAN_NIVEL_COMPLETO.md](proyecto/PLAN_NIVEL_COMPLETO.md) | 🟥 **el plan de GAMEPLAY del nivel completo** (no es el refactor): PASILLO → LA BARRA (persecución por tramo) → EL PULSO → cinemática. Fases chicas E0–E7 (ocultar ARENA/PASADA → pulso en todas → cinemática de recompensa → la barra como tramo → misiones con barra → la vitrina → el hacha → PRUEBAS al día), ~5–7 sesiones. Incluye el mini-spec de LA BARRA | **listo para implementar — arrancar por E0** |
| [PROMPTS_REFACTOR.md](proyecto/PROMPTS_REFACTOR.md) | 🟥 **los prompts listos para pegar**, uno por paso del calendario del refactor (encabezado común + 10 bloques, con modelo y esfuerzo por fase) | listo |
| [PLAN_REFACTOR.md](proyecto/PLAN_REFACTOR.md) | 🟥 **el refactor de desacople** — diagnóstico medido (game.js 3.382 líneas, 24 estados en cadenas if/else, 85 switches por tipo, 34 violaciones de capas, 33 fallbacks de audio copiados, 37 claves sueltas de localStorage) + arquitectura objetivo (registros de fases, modos, entidades, acciones, persistencia, dev) + fases RF0–RF9 con lints custodios y métricas | ⏸️ **STANDBY — versión 2 (§4b) con ARENA/PASADA en cuarentena (pendientes, sin borrar), ~11–12 sesiones, LISTA para cuando se pueda frenar el desarrollo; arranca por RF-A** |
| [COMO_PROBAR.md](proyecto/COMO_PROBAR.md) | 🟥 **el catálogo de features con la forma más corta de probar cada una** (los fixtures npm, ~80 sondas, 9 parámetros de URL — todo relevado) + **el plan del modo PRUEBAS** (fila del menú: catálogo de momentos elegibles, sin ensuciar récords ni saves, fases PR0–PR4) | **modo PRUEBAS: PR0 + PR1 hechos (19/8) — 20 momentos elegibles; PR3 la cerró el selector (S2); faltan PR2 y PR4** |
| [PLAN_VISUAL_FASES.md](proyecto/PLAN_VISUAL_FASES.md) | 🟥 **EL plan visual por fases**: 9 tandas delegables (luz · aire/sensaciones · agua · armas · enemigos vivos · avión · buque 3D · cierre 3D · post-pro) + carril de producción de arte en paralelo. Integra VISUAL_UPGRADES, SPEC_AGUA_OLAS y los frentes del 16/8 | **vivo — arrancar por T1 + producción** |
| [ANALISIS_ROADMAP.md](proyecto/ANALISIS_ROADMAP.md) | análisis de cada ítem: facilidad, dependencias, orden | análisis |
| [ESTADO.md](proyecto/ESTADO.md) | bitácora del estado del proyecto — **arriba de todo, la DIRECCIÓN del 18/8: PASILLO → BARRA → PULSO** | vivo |
| [PENDIENTES_DE_REDISENO.md](proyecto/PENDIENTES_DE_REDISENO.md) | inventario de unidades/objetos con estado de arte y specs de sprite | vivo |
| [PLAN_CAMPANA_001.md](proyecto/PLAN_CAMPANA_001.md) | mapeo guion → `missions.js` | ✅ **sincronizado con GUION_3 3.7**: 14 misiones, IDs m1–m14 estables, roguelike real, m10 reescrita (Tandil), **§7 desbloqueo del Mirage Mara fuera de campaña**, final de dos rumbos + post-créditos |
| [DISENO_MISIONES.md](proyecto/DISENO_MISIONES.md) | 🟥 **el armado de las 14 misiones**: relevamiento guion↔código, tabla maestra de la campaña, propuesta por misión (tramos, enemigos, clímax, poderes), el flujo de mejoras, la ventana nueva de la Chancha, la nafta como arco y el veredicto de brechas priorizado | **plan — 10 de 14 armables ya; brechas en §8** |
| [PLAN_MISIONES_FASES.md](proyecto/PLAN_MISIONES_FASES.md) | 🟥 **el plan de ejecución del armado**: el SELECTOR de misiones dev (S0–S3, `?mision=`, `npm run misiones`), los prerrequisitos transversales (remapeo, tramos, chancha+nafta, mejoras, marcas, escena por evento), el tablero de orden y las 14 misiones con fases y criterio de cierre cada una | 🟡 **FASE 0 CERRADA (S0–S3, 19/8/2026)**: fila MISIONES en el menú, `?mision=<id>` / `__mision`, higiene sin rastro y `npm run misiones` recorriendo la campaña entera. Sigue **R**, el remapeo 12→14 |
| [misiones/](proyecto/misiones/) | 🟥 **el relevamiento de playtest por misión** (M01–M14): estado en código, checklist de medición y NOTAS DE PLAYTEST de Matías — el insumo de las sesiones de ajuste | **en uso — se llena jugando** |

## 🚀 publicacion/

| documento | qué es |
|---|---|
| [PLAN_ELECTRON_STEAM.md](publicacion/PLAN_ELECTRON_STEAM.md) | migración a Electron y publicación en Steam (con bloque "RETOMAR ACÁ") |
| [PLAN_ANTIPIRATERIA.md](publicacion/PLAN_ANTIPIRATERIA.md) | plan antipiratería |

## 🗄 _archivo/ — históricos y supersedidos

**GUION.md** (1.0) · **GUION_2.md** (2.3 — el texto extenso de las escenas sin cambios vive
acá) · **GUION_3_CAMBIOS.md** (spec fundida en GUION_3) · **NIVELES.md** (campaña pre-guion,
12 misiones) · **PLAN_VOCES.md** (el juego sale sin voces; retomar si algún día se agregan)
· **UPDATE_ANIMATIONS.md** (notas de julio, trabajo volcado) · **PROMPT_MOMENTUM_3D.md**
(implementado y rechazado).

---

**Nota sobre links internos:** los documentos se movieron de carpeta; algún link relativo
viejo entre contextos (p. ej. el guion apuntando a PIRUETAS.md) puede estar roto. Este
índice es la fuente de verdad de dónde vive cada cosa.

Para tocar el código: **[ARQUITECTURA.md](ARQUITECTURA.md)**.
Para la historia: **[historia/GUION_3.md](historia/GUION_3.md)**.
Para rodar el teaser: **[produccion/TEASER.md](produccion/TEASER.md)**.
