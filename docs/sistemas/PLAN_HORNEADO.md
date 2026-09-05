# PLAN — EL HORNEADO: todo lo que conviene pasar por low poly → sprite

> **Estado (relevado sobre el repo el 5/9/2026 — ver §6): B0, B1, B2, B3, B5, B6 y B7 implementados;
> B4 pendiente y recortado por el callejón.** De B7 quedan afuera Sea Cat y Sea Dart, bloqueados
> por la cuarentena de la PASADA (§6.2). Los soldados se hornearon el 5/9 — ver §7. Pedido de Matías (16/8): hornear todo lo
> que convenga. Regla que lo ordena (de la charla "runtime vs horneado"): **cámara libre →
> 3D en runtime (ARENA/PASADA); cámara del pasillo → low poly horneado a sprite.**
>
> **El pipeline real, relevado:** cuatro horneadores (`tools/bake_planes.html`,
> `bake_enemies.html`, `bake_ammo.html`, `bake_partes.html`) con runners Electron. Los
> modelos **no son GLB: son ensamblajes procedurales de primitivas de three.js** (cajas,
> cilindros, conos) escritos adentro de cada HTML. Cada horneador repite luz, cámara y
> paleta, y las cajas de las hojas resultantes se **midieron a mano sobre el alfa**
> (`render/enemies.js`). Horneado hoy: 6 aviones jugables (con skins por piloto y `sheet2`
> de ±32°), 14 enemigos/props (`aa aatruck balloon bldg chancha depot fragata helo jet
> jet_rear jet_turn lcu radar tent`), trazadoras y partes.
> *(B3 reemplazo `jet_rear`/`jet_turn` por `harrier`/`harrier_rear`/`harrier_turn`.)*
>
> **Lo que B0 cambió de ese relevé:** ya no hay cuatro copias de la luz, la cámara y las
> primitivas — están en `tools/bake_common.js` (EL HORNO) y los cuatro horneadores lo cargan.
> Los modelos salieron del HTML a `tools/models/{planes,enemies,ammo,partes}.js`. Las cajas
> **ya no se miden a mano**: las escanea el horneador y las escribe en
> `assets/world/enemies/cajas.json` + `src/data/cajas.js`, que es lo que importa
> `render/enemies.js`. Las dos filas viejas de PENDIENTES (Harrier y C-130) están corregidas.
>
> Leer antes: `docs/ARQUITECTURA.md` (manda) · `ESTILO_VISUAL.md` (la biblia: los tamaños
> 1:1 con `U × SC = 3`, la paleta, "sin texto") · `PENDIENTES_DE_REDISENO.md` (el
> inventario) · el `bake_enemies.html` actual (el patrón que se extiende).

## 1. Las reglas del horno

1. **Una luz, una cámara, una paleta** para TODO lo horneado: la familia visual es una.
2. **El builder se comparte con el runtime cuando exista**: `ship3d.js` ya recibe `THREE`
   por parámetro — ese es el patrón. Un modelo, dos usos (3D en el clímax, sprite en el
   pasillo). Si `file://` bloquea el import en el horneador, se bundlea con esbuild como
   el juego.
3. **Las cajas se miden solas**: el horneador escanea el alfa de cada celda y escribe un
   JSON al lado de la hoja. Nunca más medir a mano.
4. **Nada se dibuja a mano si se puede hornear** (los props de terreno por código pasan
   al horno) — pero lo que es MATERIA (humo, fuego, agua, polvo) sigue siendo código.
5. **Contenido adentro de la celda con 2 px de margen** (la lección de `explosions_front`).
6. Sobriedad y period lock de ESTILO_VISUAL en cada modelo nuevo.

## 2. Etapas

| etapa | qué se hornea | consumidor en código | criterio de cierre |
|---|---|---|---|
| **B0 · El horno unificado** ✅ | Infra, no arte: módulo compartido de luz/cámara/paleta cuantizada (`tools/bake_common.js`), **autobox** (JSON de cajas por celda escaneando el alfa), catálogo de modelos como módulos `(THREE) => Group` en `tools/models/`. Los cuatro horneadores migran a usarlo. **Re-hornear lo existente tiene que dar hojas idénticas** (o mejores con diff aprobado). Corregir las filas viejas de PENDIENTES | `render/enemies.js` lee las cajas del JSON en vez de constantes a mano | diff visual de las 14 hojas actuales: igual o aprobado; `check` verde |
| **B1 · Los restos** ✅ *(mayor valor / menor costo)* | **El estado ROTO de cada cosa**, con los mismos modelos en configuración de naufragio: AA volcada · camión volcado · radar sin plato · depósito = carcasa negra · edificio en 3 estados de derrumbe · carpa caída · helo estrellado · jet estrellado · lcu encallada/escorada · globo desinflado | `despiece()` / DESTRUCCION v2: **los restos que quedan** dejan de ser solo chunks y tienen silueta propia | `__restosTodos()` los pone los diez en fila (el nombre `__romperTodas` ya estaba tomado por las variantes de v2); `npm run romper` §4 lo mide |
| **B2 · Los buques del pasillo** ⚠️✅ | Las tres clases (t42 / t21 / log) **de proa** (para la aproximación sin teleport, PASADA R3) y **de costado**, más dos estados de hundimiento (escorado de proa / de popa). **Builders compartidos con `ship3d.js`** — son los mismos cascos que T7 pone en 3D | `drawApproachBarge` (reemplaza el casco lateral genérico del momentum) + el clímax 2D | la continuidad pasillo→PASADA usa el MISMO objeto en dos medios; captura del handoff |
| **B3 · El Harrier propio** ✅ | Un **Sea Harrier FRS.1** de verdad (tomas de aire grandes, ala anhedra, tobera vectorial — la silueta se reconoce) en 3 poses: frente, cola, viraje — reemplaza al jet genérico que hoy hace de Harrier en LA COLA. + skin de jet enemigo genérico para los cazas del gate | `render/enemies.js` (las poses de LA COLA), `systems/caza.js` no cambia | en captura se distingue el Harrier del jet genérico sin leyenda |
| **B4 · Props de terreno y base** ⚠️ *(recortado, ver §6.1)* | Lo que sigue dibujado por código: torre de radio (`tower`), postes con cable (`poles`), árbol/mata (`tree`), mástil (`mast`), bandera (`flag`), trinchera (`trench`), tambores (`fuel`), y la **pista/hangar de BAM Cóndor** (ROADMAP #26.1). **El acantilado (`cliff`) SALE del alcance**: el callejón lo convirtió en sistema (`render/paredes.js` + `core/zigzag.js`), no en prop | `render/world.js` (`drawObstacle` por tipo) con fallback al dibujo actual si la hoja no carga (patrón existente) | misión de costa/tierra con los props horneados; `check` verde |
| **B5 · Las partes v2** ✅ | Piezas para las variantes de muerte (DESTRUCCION v2): ala suelta, cola, proa y motor de jet/Harrier; rotor y cola de helo; plato de radar; tanque de depósito; rueda/caño de AA | `data/despiece.js` (las recetas referencian piezas horneadas) | `__romperTodas('jet')` con piezas reales |
| **B6 · Los aviones** ✅ *(salvo una decisión de diseño)* | **Rolidos intermedios** (más columnas de alabeo en `sheet`), el **Mirage 5P peruano** como variante del modelo Mirage (los líderes de m10), y opcionalmente Pucará / MB-339 si se confirman jugables (PENDIENTES §1) | `data/planes.js` (`SHEET_NF`), `render/plane.js`, el líder de PERSECUCIÓN | **cerrado**: `SHEET_NF = 9` (−60..+60 cada 15°) y el Mirage 5P horneado (`tools/models/planes.js` → `mirage`) y jugable en el roster. Pucará / MB-339 no son deuda de horno: siguen sin confirmarse jugables |
| **B7 · Soldados y munición** ✅ *(salvo lo bloqueado, ver §6.2 y §7)* | **Munición ✅**: bomba y misil horneados en `assets/ammo/municion.png` (`tools/models/ammo.js`), consumidos por la ristra del PULSO, el pasillo y el HUD. **Soldados**: rig low poly con **las poses que el juego dibuja** —correr y cuerpo a tierra— × dos equipos (guarnición / desembarco con bergen); reemplaza el PNG generado por IA y los pone en la misma luz que los enemigos. **Sea Cat y Sea Dart: BLOQUEADOS** — son billboards de la PASADA, que está en cuarentena | `render/soldiers.js`, `render/pasada.js` | soldados y enemigos comparten luz en captura; el Dart se ve *(pendiente de que caiga la cuarentena)* |

## 3. Orden y esfuerzo

**B0 → B1 → B2 → B3 → B5 → B4 → B6 → B7.** B0 es infraestructura y paga todo lo demás
(el autobox solo ya justifica la etapa). B1 y B2 son el retorno visual más alto. B3 es
el único modelo "de autor" nuevo y difícil (la silueta tiene que reconocerse): conviene en
esfuerzo ALTO. Todo lo demás rinde en MEDIO.

| etapa | modelo | est. |
|---|---|---|
| B0 | alto | 2–3 d |
| B1, B2, B5 | medio | 1–2 d c/u |
| B3 | **alto** | 1–2 d |
| B4, B6, B7 | medio | 1–2 d c/u |

Dependencias: B2 conviene ANTES o JUNTO a T7 (plan visual) para compartir builders ·
B5 alimenta DESTRUCCION v2 (V1 puede arrancar con fallback por código) · B1 alimenta
DESTRUCCION v2 V2 · B3 la pide LA COLA H5 (hoy placeholder aprobado).

## 4. Qué NO hornear

- **Materia en movimiento** (humo, fuego, agua, polvo, escombro chico): es código y queda
  código. Las hojas de explosión que lleguen son de la familia PNG, no del horno.
- **Las cabinas y las pantallas VN**: familia de generación IA con biblia de estilo.
- **Nada en runtime 3D del pasillo**: el horno existe justamente para no hacer eso.
- Sin texturas en los modelos: flat shaded + paleta cuantizada es el look.

## 5. Divergencias *(completar durante la implementación)*

**B0 — las cuatro cosas que salieron distinto de como las pedía el plan, y por qué.**

1. **La luz es una, la exposición no.** La regla 1 dice "una luz para todo lo horneado" y ahora
   lo es: un solo rig (`BAKE.escena`), los mismos tres focos, los mismos colores, las mismas
   direcciones. Lo que quedó como perilla por familia es el **ambiente**: 1.5 en aviones,
   munición y partes; 1.8 en enemigos; 2.6 en las poses de cola, que además suman un relleno
   frontal. No es otra luz, es otra exposición — a los enemigos se los ve **de frente, con el sol
   detrás**, así que la cara que mira a la cámara es la que está en sombra. Unificar también ese
   número habría cambiado las 14 hojas, y el criterio de cierre de B0 era justamente que salieran
   idénticas. Si algún día se decide una exposición única, es un cambio de arte con diff aprobado,
   no un refactor.

2. **La paleta se comparte, pero todavía no se cuantiza.** `BAKE.PAL` reúne los tonos que estaban
   repetidos en los cuatro archivos (los tres focos, el vidrio, la bandera de la deriva, los
   grises del despiece, las tres capas de la turbina) y ningún hex cambió. La **cuantización** del
   render —el paso de posterizado que el plan nombra al pasar— **no se hizo**: mueve todos los
   píxeles de todas las hojas, o sea es exactamente lo que B0 no podía hacer. Queda anotado como
   candidato de una etapa de arte propia.

3. **Los módulos de modelos son scripts clásicos, no módulos ES.** El plan pide el catálogo como
   módulos `(THREE) => Group`. La firma real es
   `BAKE.modelos(familia, (THREE, K) => ({ nombre: (…) => Group }))`, donde `K` es el kit de
   primitivas. Dos motivos: los horneadores se abren con `file://` (el runner de Electron hace
   `loadFile`) y ahí el navegador **bloquea `import` por CORS**, y meter esbuild en las
   herramientas por esto sería un build para no ganar nada. Lo importante del pedido se cumple:
   los modelos viven en archivos propios, reciben `THREE` por parámetro (el patrón de `ship3d.js`)
   y no saben nada del encuadre — que es lo que va a permitir que B2 comparta cascos con el 3D.

4. **La caja medida viaja en dos archivos, no en uno.** El plan pide "JSON al lado de cada hoja,
   que `render/enemies.js` pasa a leer". El JSON existe y está al lado de las hojas
   (`assets/world/enemies/cajas.json`), pero lo que el juego **importa** es `src/data/cajas.js`,
   el mismo dato como módulo ES. Un `fetch` de JSON no sobrevive ni a `file://` ni al build web de
   una sola página. Los dos los escribe el mismo runner en el mismo instante, así que no pueden
   divergir por accidente; y `npm run unit` los compara igual, por si alguien edita uno a mano.
   Detalle deliberado: **`wu` y `href` NO están en el JSON**. No son medidas, son perillas de arte
   (dicen qué tan grande se **ve** el bicho, no qué tan grande es el dibujo) y siguen a mano en
   `render/enemies.js`. El horno mide hechos.

**B1 — lo que salió distinto, y una cosa que el plan daba por sentada y no era cierta.**

5. **El resto no dura "más que el humo": dura hasta que el pasillo lo pasa.** El plan lo enuncia
   como permanencia y la primera prueba lo escribió así — "la carcasa sigue ahí 7 s después" — y
   falló, con razón. A 90 u/s el pasillo se come 630 unidades en 7 s y `SPAWN_Z` es 320: **nada**
   sobrevive tanto tiempo delante tuyo, ni debería. Lo que B1 cambia no es una duración, es una
   **causa de muerte**: la columna de humo se apaga sola aunque la estés mirando; la carcasa solo
   se va cuando el pasillo la deja atrás. Así está escrita la prueba ahora, y así está escrito el
   comentario en `render/world.js` — para que nadie vuelva a "arreglar" el resto poniéndole vida.

6. **Y por lo tanto la frase del §1 hay que leerla con cuidado.** "El pasillo detrás tuyo es la
   historia de tu corrida" suena a que uno vuelve a mirar, y en RASANTE no se mira atrás nunca: la
   cámara va clavada adelante. La ventana real en la que una carcasa se ve son los **~3 segundos**
   que tarda en venirte encima desde que la rompiste a distancia — que es tiempo de sobra para
   leer una silueta, pero no es un museo. Lo que B1 compra de verdad es que **matar algo lejos
   deje una marca en el suelo por la que después volás**, en vez de que la cosa desaparezca. Vale
   la etapa igual; lo que no vale es prometer más de eso. B4 (props de terreno) y una eventual
   pasada de vuelta sobre el mismo mapa son las que podrían cobrar el resto de la promesa.

7. **El hollín no se pone bajando el brillo.** Los diez restos salieron de la primera horneada
   como manchas oscuras: quemados de 0,4 a 0,75 sobre las superficies grandes, el camión volcado no
   se distinguía de una piedra. Es la lección que ya estaba escrita en el modelo de la bomba ("el
   verde oliva real no se ve") y hubo que aprenderla de nuevo. El método correcto está en
   `tools/models/restos.js`: las masas grandes se queman **poco** (0,12–0,3, solo para bajarles el
   tono) y el negro se gasta entero en **manchas chicas** — `tizne()` — encima. Un resto se lee
   quemado por el CONTRASTE entre lo tiznado y lo que conserva color, no por ser oscuro.

8. **El autobox de B0 se pagó solo en la primera horneada de B1.** De los diez restos, tres
   violaban la regla de los 2 px de margen sin que nada se viera raro en la vista previa: el plato
   del radar tirado demasiado lejos, la lona de la carpa desparramada de más y la pala del helo
   asomando por arriba. Los tres salieron por consola como `⚠ MARGEN 0 px` antes de que nadie
   mirara la hoja. Con las cajas medidas a mano eso se habría descubierto en el juego, meses
   después, como "al helicóptero roto le falta un pedazo de arriba".

**B2 — una parte del pedido no se puede hacer hoy, y hay que decirlo antes que nada.**

9. **Compartir los cascos con `ship3d.js` está BLOQUEADO por la cuarentena.** El plan lo pide como
   deliverable ("son los mismos cascos que T7 pone en 3D") y su criterio de cierre es "la
   continuidad pasillo→PASADA usa el MISMO objeto en dos medios; captura del handoff". Nada de eso
   se puede entregar: `systems/ship3d.js` está **en cuarentena desde el 18/8** (ver
   `data/cuarentena.js` y PLAN_REFACTOR §4b) y su propia cabecera dice *"NO se pule ni se
   refactoriza más allá de lo mecánico"*; y la PASADA también lo está (`CLIMAX_EN_CUARENTENA`
   incluye `'pasada'`, y el suplente es EL PULSO), así que el handoff no ocurre en ninguna partida.
   Lo que sí se hizo es dejarlo **preparado**: los builders de `tools/models/buques.js` reciben
   `THREE` por parámetro, no importan nada del juego y no saben nada del horno — exactamente el
   contrato que `ship3d.js` necesita para adoptarlos el día que la cuarentena caiga. El cableado y
   la captura del handoff quedan pendientes de esa decisión, que no es de esta etapa.

10. **La vista DE PROA se horneó y NO se cableó, y el número dice por qué.** Medido sobre el
    pasillo real (m3, con `?pasada=3` que fuerza el climax PASADA), la manga del buque de proa va
    de **1,8 px al asomar a 7,5 px en el corte**, con 8,8 px de alto. Un sprite de 28×60 reducido a
    eso es puré; el dibujo a mano de `drawBargeBow` en cambio tiene un piso explícito para la
    columna de humo —lo único que de verdad se ve de un buque lejano en el mar— y a esa escala es
    estrictamente mejor. Así que las tres hojas de proa quedan horneadas (1 KB cada una) como el
    arte que B2 debía entregar, y esperan su consumidor real: el handoff a la PASADA del punto
    anterior. Cablearlas hoy sería cambiar algo bueno por algo peor para poder tildar una casilla.

11. **Lo que SÍ cambió, que era el agujero grande.** Hasta B2 los tres buques del juego se
    dibujaban con **el mismo casco**: `drawBargeHull` pinta un perfil de destructor genérico, y el
    SHEFFIELD, el ARDENT y el SIR GALAHAD —un destructor, una fragata y un buque de carga— se veían
    idénticos. `data/ships.js` ya sabía de qué clase era cada uno y le daba a cada clase sus zonas
    críticas propias; sólo faltaba que se parecieran a lo que son. Ahora EL PULSO —el único clímax
    fuera de cuarentena— muestra la clase correcta, y los dos hundimientos (de proa / de popa) son
    silueta propia en vez del casco intacto rotado.

12. **El dibujo a mano no se va, y no es prudencia.** La hoja entra a partir de **40 px de
    eslora**; por debajo manda `drawBargeHull`, que tiene un modo propio de tres trazos con perfil
    de barco para cuando el buque mide tres píxeles. Un sprite de 216 px reducido a 3 es una
    mancha. Es el patrón del repo (fallback si la hoja no cargó) pero acá además es la decisión
    correcta por tramo de distancia.

13. **Dos capacidades nuevas del horno, que son generales y no parches de esta etapa.**
    · **`clipY` — no se hornea lo que el juego ya tapa.** El mar recorta en la flotación y el
    anclaje del sprite es el borde de abajo del contenido; una obra viva que asome un píxel corre
    al buque entero hacia arriba y lo deja flotando sobre el agua. Con el plano de recorte, el
    borde de abajo del contenido **es** la línea de flotación y el anclaje sale gratis. Es también
    lo que permite que el buque hundiéndose tenga la proa de verdad bajo el agua en vez de estar
    "inclinado pero flotando alto", que es la silueta de un barco en una ola.
    · **`fov` por hoja — la distancia focal es perilla, igual que la exposición.** Los buques se
    hornean con **2,4° a 90 unidades**, el teleobjetivo más largo del proyecto, contra los 24° de
    todo lo demás. Un destructor mide 130 m: con teleobjetivo corto la popa queda 40 unidades
    detrás de la proa, la proa sale un 30 % más grande y el casco parece un cono. El casco 2D que
    estas hojas reemplazan es ortográfico puro; si el horneado no lo fuera, el sprite y su respaldo
    no empalmarían. Sigue siendo el mismo rig — misma altura relativa, mismo `lookAt`.

14. **La bruma del sprite no es la del 2D, y es una diferencia visible.** `drawBargeHull` mezcla
    cada color **hacia el color del horizonte** (perspectiva atmosférica de manual); el sprite usa
    el `dark` de `drawFrame`, que oscurece conservando la forma. Hace el trabajo que importa —que
    el buque lejano no compita en contraste con los obstáculos del pasillo— pero el tono es otro.
    Un `haze` que mezclara hacia el horizonte pediría un tercer modo de tinte en `render/enemies.js`
    y no parecía pagar; queda anotado por si en captura se nota el salto en el umbral de los 40 px.

15. **El agua sigue siendo código, y por eso el buque se ve navegando.** El bigote de proa y la
    flotación picoteada NO se hornean (§4 del plan: la materia en movimiento es código) — se pintan
    encima del sprite. Es lo que separa un buque en marcha de un buque fondeado, y además fue el
    único trozo de `drawBargeHull` que hubo que copiar al camino nuevo.

**B3 — el hallazgo de esta etapa no es el avión: es que había arte muerto y roto.**

16. **`jet_turn` se horneaba desde el 17/8 y NINGÚN archivo del juego la dibujaba.** Se comprobó
    con un grep sobre `src/`: fuera de la tabla de rutas de `render/enemies.js`, la hoja no
    aparecía en ninguna parte. El propio [PLAN_HARRIERS_PERSECUCION](PLAN_HARRIERS_PERSECUCION.md)
    afirmaba —dos veces— que el render usaba una cascada `jet_turn` → `jet_rear` → `jet`. La
    primera rama nunca existió: la recola se dibujaba con un **cambio de sprite de un cuadro al
    otro** (el Harrier se iba de cola y de golpe venía de frente). B3 la cableó de verdad, atada al
    avance de la fase `recola`.

17. **Y al cablearla salió que además estaba MAL HORNEADA.** Lo vio Matías en la lámina: el frame
    del medio tenía al Harrier apuntando al cielo. Causa: el horneador aplicaba `yaw` y `roll`
    sobre el **mismo objeto** (`pose.rotation.y` y `pose.rotation.z`), y con el avión ya girado 90°
    el eje Z deja de ser su eje longitudinal — rotar ahí no lo alabea, lo **encabrita**. Es
    literalmente la trampa que la cabecera de `bake_enemies.html` advertía desde que se escribió
    ("encadenar dos rotaciones sobre el mismo objeto compone un euler que no es el que uno
    espera"). Arreglado anidando los grupos (yaw afuera, alabeo adentro); **ninguna otra hoja
    cambió** — era la única que pedía las dos rotaciones juntas, y por eso el error nunca se vio.

18. **La lección, que no es sobre el Harrier.** Un asset que se hornea y no se dibuja no está
    "listo para cuando haga falta": está roto y nadie lo sabe. `jet_turn` pasó meses así, con un
    documento afirmando que funcionaba. Desde B3 hay una prueba que lo impide —
    *"toda hoja horneada tiene consumidor en el juego"*— que recorre `cajas.js` y exige que cada
    hoja esté en la tabla de rutas de `render/enemies.js`. Es barata y habría ahorrado esto.

19. **Qué hace que un Harrier se lea como un Harrier**, en orden de lo que sobrevive a 70 px:
    las **tomas de aire** (dos barriles pegados al fuselaje detrás de la cabina — es la firma y no
    hay segunda), las **cuatro toberas vectoriales** (dos frías en la cintura, dos calientes atrás:
    bultos donde ningún otro avión tiene nada), el **ala alta y ANHEDRA** (las puntas caen: lo
    contrario de casi todo lo que vuela), que es **panzón y corto** (el motor va en el medio, así
    que la cintura es lo más gordo y la silueta es de rana, no de flecha), y los **balancines** de
    punta de ala. La cabina va **adelante** de las tomas, no encima: puesta al medio la burbuja
    queda encajada entre los dos barriles y el avión se lee como un fuselaje con tres bultos
    iguales; adelantada se lee la secuencia correcta —nariz, piloto, tomas—.

20. **El jet del pasillo volvió a ser genérico.** Hacía dos trabajos: era el caza anónimo del
    pasillo Y era el Harrier, así que llevaba las señas del Harrier sin ser ninguno de los dos.
    Ahora es un caza de línea y se diferencia **punto por punto**: fuselaje fino (no panzón), ala
    al medio con diedro positivo (no alta y caída), tomas chatas pegadas al costado (no barriles) y
    UNA tobera atrás (no cuatro en la cintura). Los dos pueden aparecer en el mismo cuadro.

**B5 — había DOS sistemas de escombro, y sólo uno estaba horneado.**

21. **`parte` estaba horneada; `pieza` no.** Un pedazo puede llevar dos cosas: `parte`, que es una
    fila de la hoja de piezas (ala, morro, tren…) y se reparte por índice entre todos los pedazos;
    y `pieza`, que es **LA firma del tipo** — la que sale entera y girando, la que hace que a 200 m
    se sepa que lo que cae era un helicóptero. Las diez `parte` se hornearon con D0. Las `pieza`
    **nunca**: `render/world.js` las dibujaba con **tres recetas a mano para todas** — una BARRA
    (rotor, ala, cable, cañón), una ELIPSE (plato) y un BULTO para el resto (tanque, cabina, rampa,
    funda). O sea que el rotor de un helicóptero y el cable de un poste eran **el mismo
    rectángulo**, y lo único que los separaba era el color. Es exactamente el problema que las diez
    piezas de D0 vinieron a arreglar para el avión, sin terminar de arreglarlo para todo lo demás.

22. **Diez piezas nuevas, y dos recetas que apuntaban a la pieza equivocada.** Al darle modelo a
    `pieza`, la palabra pasó a importar — y dos estaban mal desde siempre, tapadas por el hecho de
    que todas se dibujaban igual: el **depósito** declaraba `tanque`, que en la hoja es el tanque
    subalar de un AVIÓN (fino, con puntas cónicas); un depósito de combustible larga **tambores**.
    Y el **camión AA** declaraba `cabina`, que es la BURBUJA DE VIDRIO de un avión — un camión no
    tiene eso; larga una **rueda**. Ahora hay una prueba que exige que dos tipos no compartan firma,
    que es la regla de D2 llevada a las piezas.

23. **El orden de la hoja se mudó a `data/`.** Vivía en `render/partes.js` con una nota que decía
    que tenía que coincidir con el horneador, y la única custodia era que alguien mirara la salida
    del runner al hornear. Ahora vive en `data/despiece.js` (lo leen el render **y** `core/fx.js`,
    así que una copia local sería la tercera) y hay una prueba que **lee el modelo y compara el
    orden**. Si alguien mete una pieza en el medio, el ala del avión se dibuja como una deriva y no
    hay error en runtime que lo delate — ahora salta en `npm run unit`.

24. **Y el helo estrenó su otra mitad.** `botalón` — el tubo de cola con la deriva y el rotorcito —
    es la pieza que dice que se partió en dos, y no puede venir de ninguna otra cosa del roster. El
    jet y el avión del jugador estrenaron `motor`: un cilindro con la **cara del compresor** a la
    vista, que es lo único que lo separa de un tacho a esta escala.

25. **Y B5 destapó un bug viejo en la sonda del despiece.** El fixture pasaba `helo` y `radar` y
    fallaba en los otros seis — con el mundo vacío las ocho firmas salían bien y con el mundo lleno
    seis aparecían como `null`. La causa no estaba en las piezas: `__romper` medía la muerte con
    `const antes = obstacles.length` y después `obstacles.slice(antes)`, y esa ventana **miente en
    cuanto entra a jugar el cap de pedazos**. `capParts()` saca a los más viejos SPLICEÁNDOLOS del
    array, así que todo se corre a la izquierda y `slice(antes)` empieza tantos lugares más
    adelante como pedazos se hayan sacado — se pierde el pedazo 0, que es justo el que lleva la
    firma. Arreglado midiendo por **identidad** (`new Set(obstacles)` + `filter`), que es inmune al
    splice.
    **El error es viejo y venía ensuciando en silencio TODAS las medidas de esa sonda** —cuántos
    pedazos, tamaños, colores, la pieza especial— cada vez que una prueba corría con escombro
    encima, que es la mitad de las veces. Nadie lo había visto porque las aserciones son de forma
    ("hay al menos N pedazos", "los colores son distintos") y una ventana corrida las sigue
    cumpliendo casi siempre.

**Lo que B0 verificó, con números.** Las 48 hojas del proyecto (32 de aviones, 14 de enemigos,
munición y partes) re-horneadas después de cada paso de la migración: **byte-idénticas, 48/48**.
Las 14 cajas medidas por el escáner **coinciden exactamente** con las 14 que estaban contadas a
mano — el autobox no cambió ningún anclaje, solo dejó de depender de que alguien copiara bien.
`npm run feel` idéntico y `npm run check` en verde.

**Lo que B1 verificó, con números.** Diez tipos declaran carcasa y los diez la dejan; **diez hojas
distintas, ninguna repetida**; seis tipos NO dejan nada y eso también se afirma (`plane` entre
ellos: lo que se desintegra no deja carcasa); ninguna carcasa tiene `hp`, así que no colisiona —
romper cosas no te va cerrando el pasillo; las diez siguen enteras 2,6 s después mientras las
columnas cortas ya se apagaron solas. Todo eso lo mide `npm run romper` (sección 4) con la sonda
`__restosTodos()`; el arte se mira con la lámina de contacto vivo/roto. Tres pruebas unitarias más
cierran lo que no se puede ver: que toda receta que promete carcasa tenga la hoja horneada, que
ninguna se comparta, y que la ausencia siga siendo una elección.

**Lo que B2 verificó, con números.** Tres clases × tres vistas = **nueve hojas, cero avisos de
margen**. Las tres clases dibujadas en el MISMO momento del pasillo (m3, p=0.86, eslora 177 px) se
distinguen sin leyenda: el destructor por su palo con radomos y la masa repartida, la fragata por
ser corta con la isla adelante y la popa vacía, el logístico por los contenedores y la isla a popa.
Tres pruebas unitarias cierran lo que no se ve: que cada clase tenga sus tres vistas, que ningún
buque del juego se quede sin clase declarada (un `SIR TRISTRAM` sin clase se dibujaría como Tipo 42
— un carguero con radomos), y que las tres hojas de costado terminen en la **misma fila**, que es
la firma de que el recorte bajo la flotación sigue puesto.

**Lo que B3 verificó, con números.** Tres hojas nuevas, cero avisos de margen; `npm run caza` (13
secciones) en verde tras el cambio; **una sola hoja cambió** al arreglar el euler del horneador
(`jet.png`, y por el rediseño del genérico, no por el arreglo) — las otras once quedaron
byte-idénticas, que es la prueba de que el bug afectaba solo a la hoja de viraje. Tres pruebas
unitarias nuevas: que las tres poses existan con sus 5 columnas y que `jet_rear`/`jet_turn` **no**
se re-horneen, que `harrier_turn` esté efectivamente atada a la fase `recola` en el render, y la
general de que ninguna hoja horneada se quede sin consumidor.

---

## 6. Relevé del 5/9/2026 — qué queda, medido contra el repo y no contra el papel

Entre agosto y hoy el proyecto se movió bastante (el **callejón**, las tres capas del 3D, el telón
del horizonte reemplazado por imágenes), y el encabezado de este plan había quedado mintiendo en
dos direcciones a la vez: daba por pendiente algo ya hecho y por pendiente entero algo que el
juego se comió por otro lado. Esto es lo que hay, verificado archivo por archivo.

### 6.1 B4 se achicó, y no por falta de ganas

El plan pedía hornear el **acantilado** como un prop más de la lista. Eso ya no aplica: el relieve
dejó de ser un objeto y pasó a ser un **sistema**. `render/paredes.js` dibuja las laderas del
callejón como una tira de columnas a lo largo de `z`, y la altura la evalúa `paredH()` de
`core/zigzag.js` — **la misma función con la que choca el avión**, que es la regla del repo desde
`core/sea.js`: lo que ves es lo que te mata. Un sprite no puede cumplir ese contrato. Hornear un
`cliff` hoy sería meter un prop suelto adentro de un terreno que ya tiene forma propia, y encima
uno que no colisionaría igual que lo que dibuja.

Lo que **sí** sigue dibujado a mano en `render/world.js` y califica para B4:
`tower` · `poles` · `tree` · `mast` · `flag` · `trench` · `fuel`, más la pista y el hangar de
BAM Cóndor (hoy código en `drawRunway`, con los estilos en `data/runways.js`).

La moraleja, que no es sobre el acantilado: **un plan de horneado se pudre**. Enumera props, y los
props son justamente lo que un rediseño de terreno se lleva puesto. Conviene releer B4 contra el
código antes de cada tanda, no confiar en la lista.

### 6.2 B7 no era una etapa, eran tres cosas con destinos distintos

- **Munición: hecha.** `assets/ammo/municion.png` (bomba y misil, 6 vistas × 2 filas de 16×16),
  modelo en `tools/models/ammo.js`, consumida por `render/municion.js` desde la ristra del PULSO,
  el pasillo y el HUD.
- **Sea Cat y Sea Dart: bloqueados**, y no por esfuerzo. Son billboards de la escena 3D de la
  PASADA, y la PASADA está en cuarentena (`CLIMAX_EN_CUARENTENA = ['arena', 'pasada']`). Hornearlos
  hoy sería exactamente el error que B3 dejó documentado en la divergencia 18 — arte que nadie
  dibuja no está "listo para cuando haga falta", está roto y nadie lo sabe. Esperan la misma
  decisión que las hojas de proa de B2.
- **Soldados: lo único de B7 que se podía hacer, y es lo que se hizo.** Ver §7.

### 6.3 B6 estaba cerrada y el plan no se había enterado

`SHEET_NF = 9` en `data/planes.js`: los rolidos intermedios que pedía el plan ya están (−60 a +60
cada 15°). Y el **Mirage 5P** no es una variante pendiente: es un modelo del horno
(`tools/models/planes.js` → `mirage`), horneado a `assets/planes/mirage-5p/` y **jugable en el
roster** como `MIRAGE 5P MARA`. Lo que queda —Pucará y MB-339— no es deuda de horneado: es una
decisión de diseño sin tomar sobre si son aviones jugables.

---

## 7. B7 · los soldados — lo que salió distinto

**26. El plan pedía cinco poses y se hornearon dos, a propósito.** "Correr, cuerpo a tierra,
disparar, saludar, caer" — el juego dibuja exactamente **dos** de esas: `drawRunBack` y
`drawProne`, y nada más. Hornear las otras tres sería repetir el error que B3 dejó escrito en la
divergencia 18: `jet_turn` se horneó durante meses sin que ningún archivo la dibujara, y no estaba
"lista para cuando hiciera falta" — estaba rota y nadie lo sabía. Las tres poses que faltan se
hornean el día que haya un soldado que dispare; el modelo (`tools/models/soldiers.js`) ya está
armado por huesos, así que agregar una pose es una función, no una etapa.

**27. Y pedía dos NACIONES, que es una distinción que el juego no tiene.** Los soldados que uno
ametralla son todos del mismo bando; lo que `systems/spawn.js` sí distinguía desde antes es
`coast` — si el grupo acaba de bajar de una lancha o si ya estaba ahí. Eso no es una nación, es un
**equipo**, y da una diferencia mucho más honesta: el que desembarca lleva el **bergen**, la mochila
enorme del yomp, y el de guarnición no. A 12 px de alto no se lee un uniforme ni una insignia; se
lee la silueta de la espalda, y esa es justamente la que cambia. Dos filas en la hoja, un `!!coast`
en el spawn, cero datos nuevos.

**28. LA MEJOR CAJA ES LA QUE NO HACE FALTA.** Esto es lo que más cambió y no es de arte. La lámina
generada por IA traía cada pose en un rectángulo distinto —seis frames de carrera de 55 a 68 px de
ancho y un cuerpo a tierra de 113×92—, así que `render/soldiers.js` guardaba **trece números
medidos a mano sobre el alfa**, con la nota "si se cambia la hoja hay que volver a medirlas".
Trece números que ninguna prueba custodiaba.

La hoja horneada no los necesita: todas las poses salen de la MISMA cámara, así que la celda es una
**ventana fija al mundo** —2,9 unidades de lado— con el suelo siempre en la misma fila. Dibujar es
una sola cuenta: la celda entera, escalada por `k`, apoyada por su línea de suelo. El soldado
corriendo y el tendido comparten el piso *por construcción*, no porque dos cajas coincidan. Es la
regla 3 ("las cajas se miden solas") llevada un paso más allá — y el único número que queda por
custodiar es que el horneador y el render declaren el mismo encuadre, que es lo que hace la prueba
nueva.

**29. El contorno: el problema no era el color del modelo, era que NO HAY color que sirva.** La
primera horneada se veía perfecta sobre la arena, sobre el mar y sobre la nieve — y **desaparecía
sobre la turba del atardecer** (`#4a5138`), que es del mismo verde oliva oscuro que el uniforme.
Es la cuarta vez que este proyecto tropieza con lo mismo (la bomba en verde oliva real, el humo
gris casco sobre el mar gris, los restos de B1 quemados de más): **lo verídico no sirve si
desaparece**. Pero esta vez aclarar el uniforme no arreglaba nada, porque el soldado tiene que
estar sobre turba, sobre arena y sobre nieve **en la misma partida**.

La solución no la inventó el horno: la tenía el dibujo a mano de `render/world.js`, que llegó a
ella por el mismo camino y lo dejó anotado. Un **filo de 1 px de DOS tonos** —claro arriba y a la
izquierda, oscuro abajo y a la derecha— nunca falla contra todos los fondos a la vez: el claro
salva los oscuros y el oscuro salva los claros. Ahora es una capacidad general del horno
(`BAKE.contorno`, al lado de `clipY` y `simetrizaCentro`) y no un parche de esta hoja, porque el
filo depende de la SILUETA —lo único que el horno sabe y el render no— y no del fondo. Hacerlo en
el juego sería redibujar el sprite cuatro veces por soldado y por cuadro para sacar un dato que no
cambia nunca. De yapa, el filo oscuro de abajo cae en la fila `SUELO + 1` y hace de **sombra de
contacto** justo donde el render apoya la celda.

**30. La rodilla sale de la VELOCIDAD del muslo, no de su posición.** La primera versión ataba la
flexión a `sin` —o sea a dónde está la pierna— y el resultado era que en los dos cuadros de paso
cruzado las dos piernas quedaban rectas y paralelas: el soldado parecía **parado**. La flexión va
con `cos`: la rodilla se dobla en la *recuperación* (la pierna que viene de atrás sin tocar el
piso) y se estira en la que lleva el peso. Es la diferencia entre seis frames y un ciclo de carrera.

**31. Y el build web ganó los soldados, que estaban afuera.** La lámina de IA pesaba ~450 KB y
`tools/build_web.py` la dejaba fuera del bundle por el tope de 16 MB, así que **en la web los
soldados caían al dibujo a mano** — una plataforma entera sin el asset. La hoja horneada pesa
**1,8 KB**: 250 veces menos, porque un rig low poly a 24 px no tiene que guardar el ruido de una
imagen generada. Ahora entra, y el respaldo de `render/world.js` volvió a ser lo que dice ser: un
respaldo.

**Lo que B7 verificó, con números.** Una hoja de **7×2 frames de 24×24** (1,8 KB) contra los ~450 KB
que reemplaza · margen medido **2 px** con el contorno ya puesto, y el contenido llega exactamente
hasta `SUELO + 1` (la sombra de contacto) y ni una fila más · las **48 hojas existentes se
re-hornearon byte-idénticas** después de tocar `bake_common.js`, que era la condición para agregarle
una capacidad · lámina de contacto del soldado a `k` = 3, 5, 7 y 10 sobre los cuatro fondos que de
verdad tiene abajo (turba, arena, mar, nieve): antes del contorno era ilegible sobre turba, después
se despega de los cuatro · `npm run feel` idéntico y `npm run check` en verde con **136** unitarias,
tres de ellas nuevas: que el encuadre del horno y el del render sean el mismo, que la grilla del PNG
sea la que el render recorta, y que el equipo (`bergen`) siga naciendo en el spawn y llegando al
dibujo — si ese dato se pierde, las dos filas horneadas se vuelven una sola y nadie lo nota.
