# IMÁGENES PENDIENTES — retratos y cuadros

Todo el arte que `story.js` pide y todavía no existe, más el que hace falta para que la caja de
diálogo tenga con qué actuar. **Nada de acá está a discusión**: son assets a generar.

Cuando estén los prompts, van a `PROMPTS_RETRATOS_LISTOS.md` (retratos) y `PROMPTS_PLACAS_LISTOS.md`
/ `PROMPTS_TIERRA_LISTOS.md` (cuadros), como el resto.

**Referencia de personajes**: `characters_examples/final/` y `team.png` mandan sobre físico y cara.
**Medidas**: retrato **108×108** (36 px de diseño × 3). Cuadro de escena 960×540, en `.webp`.
**Regla que duele**: un `cara:` que no existe **no da error** — cae al placeholder y se ve igual que
si el asset simplemente faltara. Por eso esta lista existe.

---

## 0. El problema de fondo: dos ejes mezclados

Los ids que hay hoy mezclan **emoción** (`_roto`, `_ceno`) con **contexto** (`_piloto`, `_casco`,
`_auriculares`, `_espaldas`), y algunos mezclan las dos cosas en un solo nombre
(`gitano_gritando_llorando_piloto`). Así, cada emoción nueva multiplica por cada contexto y la lista
no cierra nunca.

**Convención propuesta, y con esto alcanza para todo el juego:**

```
<personaje>_<emocion>            en tierra, busto de frente          → el 80% del juego
<personaje>_p_<emocion>          en cabina, con casco y máscara      → sólo los 5 pilotos
```

Casos aparte, que no son emociones y por eso no entran en la grilla: `condor_reposo`,
`condor_radio`, `condor_telefono`, `pichon_auriculares`, `*_espaldas`, `gitano_thankyou`.

---

## 1. LOS 28 QUE FALTAN HOY — bloquean escenas escritas

| id | dónde se usa | nota |
| --- | --- | --- |
| `turco_ternura` | **M1_7, M2_5, M6_LOCKER2, M8_LIBRETA, M11_ASADO2, M12_2** | 🔴 **el más urgente**: son los seis momentos tiernos del Turco y los seis salen con placeholder desde siempre |
| `condor_telefono` | P3_4 | el único Cóndor que no es un parlante: un tipo en una oficina |
| `gitano_thankyou` | M2_MATE | ya generado como `gitano_saludo.jpg` en `campaigns/c1/portraits_news/` — **falta instalarlo y renombrarlo** |
| `gitano_ansioso` | M03_BURRADA | → unificar, ver §2 |
| `gitano_delirante` | M03_BURRADA | |
| `gitano_emocionado` | M03_BURRADA | → unificar |
| `gitano_expectante` | M03_BURRADA | → unificar |
| `gitano_explicando_mira_arriba` | M03_BURRADA | |
| `gitano_imaginando` | M03_BURRADA | → unificar |
| `gitano_volando` | M03_BURRADA | → unificar |
| `gitano_pensativo` | M03_BURRADA | |
| `gitano_llorando` | M5_CHANCHA | |
| `gitano_panico` | M5_CHANCHA | |
| `gitano_sorprendido` | M6_2 | |
| `gitano_serio_triste` | M7_2 | |
| `gitano_piloto_gritando` | M6_EPI | → `gitano_p_gritando` |
| `gitano_gritando_llorando_piloto` | M8_EPI | → `gitano_p_roto` |
| `pichon_pensante` | M03_BURRADA | |
| `puma_enojado` | M03_BURRADA | |
| `puma_espaldas` | M6_LOCKER2 | de espaldas: no contesta y no da la cara |
| `puma_piloto_neutro` | M7_SOBREVUELO | → `puma_p_neutro` |
| `puma_piloto_triste` | M6_EPI | → `puma_p_roto` |
| `turco_enojado` | M03_BURRADA | |
| `turco_pensante` | M03_BURRADA | |
| `tero_llorando_aterrado` | M8_EPI | → `tero_p_roto` (está en cabina) |
| `vasco_espalda` | M03_BURRADA | se va de la escena |
| `vasco_piloto` | M6_EPI | → `vasco_p_neutro`. **Es el último plano del Vasco vivo** |
| `vasco_sorprendido` | M03_BURRADA | |

> Ya corregidos y fuera de la lista: `vazco_espalda` (era con z) y `vasco_sonriente`
> (renombrado a `vasco_sonrisa`, que ya existía).

---

## 2. Unificaciones — de 28 a 21

`M03_BURRADA` sola pide **siete caras distintas del Gitano entusiasmado**. Son la misma actuación
con matices que a 108 px no se van a leer. Propuesta:

| se unifican | en | por qué |
| --- | --- | --- |
| `gitano_emocionado` · `gitano_expectante` · `gitano_ansioso` | **`gitano_entusiasmado`** | los tres son «se le van los ojos contando la idea» |
| `gitano_imaginando` · `gitano_volando` | **`gitano_imaginando`** | los dos son él viéndolo en el aire |
| `gitano_explicando_mira_arriba` | **`gitano_explicando`** | el «mira arriba» lo dice la `accion:`, no la cara |

Quedan tres del Gitano en esa escena —`entusiasmado`, `imaginando`, `explicando`— más
`delirante` para el remate y `pensativo` para el «Y… yo calculo…». **Cinco en vez de siete.**

---

## 3. FALTAN Y NADIE LOS PIDIÓ TODAVÍA: los viejos de los epílogos

Los dos finales pasan **años después**, y hoy usan las caras de 1982.

| id | quién | dónde |
| --- | --- | --- |
| `tero_viejo_neutro` · `tero_viejo_roto` · `tero_viejo_emocionado` | Esteban, más viejo y más flaco, la mano temblando apenas | EPI_B1, EPI_B2, EPI_B3 |
| `turco_viejo_neutro` · `turco_viejo_sonrisa` · `turco_viejo_orgullo` | el Turco de civil, la gorra en la rodilla | EPI_B2, EPI_B3 |
| `norma_vieja_neutro` · `norma_vieja_rota` | Norma con más canas, firmando la encomienda | EPI_A3, EPI_B2 |

`turco_viejo_orgullo` es el del remate del juego entero: **«…M'hijo. Acá dice que te vio.»**

---

## 4. EL ROSTER COMPLETO — las variantes que hacen falta

La grilla mínima para que la caja de diálogo pueda actuar. **✓** existe · **·** falta.

### Los cinco pilotos — en tierra

| | neutro | sonrisa | risa | ceño | preocupado | roto | sorprendido | pensativo | gritando | orgullo |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **tero** | ✓ | ✓ | · | ✓ | ✓ | ✓ | · | · | · | · |
| **puma** | ✓ | ✓ | · | ✓ | ✓ | ✓ | · | ✓ *(duda)* | · | · |
| **gitano** | ✓ | ✓ | ✓ *(risa_apagada)* | ✓ | ✓ | ✓ | · | · | · | · |
| **vasco** | ✓ | ✓ | · | ✓ | ✓ | ✓ | · | · | — | — |
| **pichon** | ✓ | ✓ | · | ✓ | ✓ | ✓ | · | · | · | · |

### Los cinco pilotos — en cabina (`_p_`)

Ninguno existe salvo `tero_casco`. Hacen falta los cinco en **neutro · ceño · gritando · roto**:
son las cuatro caras de una misión. Veinte retratos, y con eso queda cubierto todo el vuelo del
juego, incluidas las dos muertes de M14.

### El Turco — el que más habla y el que menos caras tiene

✓ `neutro` `ceno` `sonrisa` `orgullo` `preocupado` `roto` · faltan **`ternura`** *(bloqueante)*,
**`enojado`**, **`pensante`**, y **`riendo`** *(no tiene ninguna cara de reírse y se ríe todo el
tiempo)*.

### Mateo — el que sostiene la mitad del juego

✓ `neutro` `sonrisa` `preocupado` `ceno` `frio` `roto` · faltan **`emocionado`** *(la página del
cielo, «¡TE VI!»)*, **`llorando`**, **`agotado`**, **`asustado`**.
De nene: ✓ `asombro` `risa` `serio` · falta **`dibujando`** *(es lo que hace todo el prólogo)*.

### Los de tierra

- **Colorado**: ✓ 6. Falta **`colorado_muriendo`** — la escena de los jazmines no tiene cara propia y hoy va sin retrato.
- **Norma**: ✓ 4. Falta **`norma_asustada`** *(el teléfono de P.2)*.
- **Claribel**: ✓ 6, sin uso todavía. Se cobran en la post-créditos (M14-20).
- **Peruano**: ✓ 3. Completo.
- **Pibe de la 10**: ✓ 3, sin uso. Se cobran en la post-créditos.
- **Esteban joven**: ✓ 3. Completo.
- **Mecánico de Tandil**: no tiene ni necesita — la caja sin busto ya dice que podría ser cualquiera.

---

## 5. CUADROS DE ESCENA

**Placas de ambiente**: las 33 existen. No falta ninguna.

**Cuadros propios (`assets/story/`)**: hay 16 y `story.js` pide **64**. Faltan 48.
De esos, los que no son opcionales porque **la imagen ES la escena**:

| cuadro | escena | por qué es bloqueante |
| --- | --- | --- |
| `M7_CRUZ` | M6_2 | va como `tipo: 'CUADRO'`: sin imagen, el beso a la cruz del Vasco se lee como texto en vez de verse |
| `M7_FOTO_DORSO` | M07_LOCKER | el dorso de la foto **es** el reveal |
| `P1_2B` | P1_2 | el sapito picando en el agua: la imagen que el juego entero recoge después |

**Escenas nuevas sin cuadro asignado**, que además son plantados de sistemas:

| escena | qué es |
| --- | --- |
| `M1_TERITO` | plano cerrado del fuselaje con **el terito recién pintado**, blanco sobre el camuflaje. Es el asset maestro: de acá salen el descriptor `{TERITO}` y el pájaro que en M8 tiene que verse desde tierra |
| `M1_CINCO` | los cinco caminando hacia los aviones, de espaldas, la línea de vuelo de madrugada. Casi el encuadre de `ppal01` |
| `EPI_A1` | el locker de Esteban abierto y la carta parada contra la pared del fondo |
| `EPI_A2` | la hoja de block militar con la letra apretada — la única carta del juego |
| `EPI_A3` | los dos papeles enfrentados sobre la mesa, como dos cubiertos |
| `EPI_B1` `EPI_B2` `EPI_B3` | la cocina cálida años después: el cuaderno abierto, el mate, el jazminero por la ventana, la navaja del Colorado contra la azucarera |
| `M03_INVENTO` `M03_ARANDELA` `M03_BURRADA` `M03_BELGRANO` | toda M3 está sin cuadros |
| `M10_HUECO` `M10_TANDIL` `M10_NOTICIA` | toda M10 está sin cuadros |
| `M4_NARWAL_*` `M5_NARWAL_*` | las charlas en vuelo no llevan placa por diseño: el fondo es el juego corriendo |

Los otros 45 son los `M1_3`, `M2_5`, `M4_EPI`… — el storyboard entero, que ya está listado en
`PROMPTS_PLACAS.md` y `STORYBOARD_1.md`.

---

## 6. Orden sugerido para generar

1. **`turco_ternura`** solo. Seis escenas rotas, un archivo.
2. **Instalar `gitano_saludo`** como `gitano_thankyou`. Ya está generado.
3. **La hoja de M03_BURRADA**: las cinco del Gitano unificadas + `turco_enojado` `turco_pensante` `puma_enojado` `pichon_pensante` `vasco_sorprendido` `vasco_espalda`. Once en una hoja y M3 queda entera.
4. **La hoja de cabina**: los cinco pilotos × cuatro estados. Veinte, y cubre todo el vuelo.
5. **La hoja de los viejos**: Esteban, el Turco y Norma décadas después. Ocho, y cierran los dos finales.
6. **`condor_telefono`**, `gitano_llorando`, `gitano_panico`, `gitano_sorprendido`, `gitano_serio_triste`, `puma_espaldas`.
7. El resto del roster de §4.
