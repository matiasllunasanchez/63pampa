# PLAN — EL HORNEADO: todo lo que conviene pasar por low poly → sprite

> **Estado: plan por etapas, sin implementar.** Pedido de Matías (16/8): hornear todo lo
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
> jet_rear jet_turn lcu radar tent`), trazadoras y partes. **PENDIENTES_DE_REDISENO está
> viejo en dos filas**: el Harrier y el C-130 dicen "no existe" y existen (`jet_rear`/
> `jet_turn`, `chancha.png`) — se corrige en B0.
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
| **B0 · El horno unificado** | Infra, no arte: módulo compartido de luz/cámara/paleta cuantizada (`tools/bake_common.js`), **autobox** (JSON de cajas por celda escaneando el alfa), catálogo de modelos como módulos `(THREE) => Group` en `tools/models/`. Los cuatro horneadores migran a usarlo. **Re-hornear lo existente tiene que dar hojas idénticas** (o mejores con diff aprobado). Corregir las filas viejas de PENDIENTES | `render/enemies.js` lee las cajas del JSON en vez de constantes a mano | diff visual de las 14 hojas actuales: igual o aprobado; `check` verde |
| **B1 · Los restos** *(mayor valor / menor costo)* | **El estado ROTO de cada cosa**, con los mismos modelos en configuración de naufragio: AA volcada · camión volcado · radar sin plato · depósito = carcasa negra · edificio en 3 estados de derrumbe · carpa caída · helo estrellado · jet estrellado · lcu encallada/escorada · globo desinflado | `despiece()` / DESTRUCCION v2: **los restos que quedan** dejan de ser solo chunks y tienen silueta propia | `__romperTodas` muestra cada resto; la regla "el pasillo detrás tuyo es la historia de tu corrida" se ve |
| **B2 · Los buques del pasillo** | Las tres clases (t42 / t21 / log) **de proa** (para la aproximación sin teleport, PASADA R3) y **de costado**, más dos estados de hundimiento (escorado de proa / de popa). **Builders compartidos con `ship3d.js`** — son los mismos cascos que T7 pone en 3D | `drawApproachBarge` (reemplaza el casco lateral genérico del momentum) + el clímax 2D | la continuidad pasillo→PASADA usa el MISMO objeto en dos medios; captura del handoff |
| **B3 · El Harrier propio** | Un **Sea Harrier FRS.1** de verdad (tomas de aire grandes, ala anhedra, tobera vectorial — la silueta se reconoce) en 3 poses: frente, cola, viraje — reemplaza al jet genérico que hoy hace de Harrier en LA COLA. + skin de jet enemigo genérico para los cazas del gate | `render/enemies.js` (las poses de LA COLA), `systems/caza.js` no cambia | en captura se distingue el Harrier del jet genérico sin leyenda |
| **B4 · Props de terreno y base** | Lo que hoy se dibuja por código o falta: torre de radio, postes con cable, árbol/mata, acantilado (`cliff`), búnker, tambores (tutorial m1), boyas, y la **pista/hangar de BAM Cóndor** (ROADMAP #26.1) | `render/world.js` (`drawObstacle` por tipo) con fallback al dibujo actual si la hoja no carga (patrón existente) | misión de costa/tierra con los props horneados; `check` verde |
| **B5 · Las partes v2** | Piezas para las variantes de muerte (DESTRUCCION v2): ala suelta, cola, proa y motor de jet/Harrier; rotor y cola de helo; plato de radar; tanque de depósito; rueda/caño de AA | `data/despiece.js` (las recetas referencian piezas horneadas) | `__romperTodas('jet')` con piezas reales |
| **B6 · Los aviones** | **Rolidos intermedios** (más columnas de alabeo en `sheet`), el **Mirage 5P peruano** como variante del modelo Mirage (los líderes de m10), y opcionalmente Pucará / MB-339 si se confirman jugables (PENDIENTES §1) | `data/planes.js` (`SHEET_NF`), `render/plane.js`, el líder de PERSECUCIÓN | alabeo más fino en captura; m10 con Mirage 5P |
| **B7 · Soldados y munición** | Soldados desde rig low poly (5 poses × 2 naciones: correr, cuerpo a tierra, disparar, saludar, caer) — reemplaza los PNG generados por IA y los pone en la misma luz que los enemigos. Munición: misil del jugador, Sea Cat y Sea Dart como **billboards** para la escena 3D (el punto de 3 px de la PASADA pasa a tener cuerpo), bombas de la ristra | `render/soldiers.js`, `render/pasada.js` | soldados y enemigos comparten luz en captura; el Dart se ve |

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

- *(vacío)*
