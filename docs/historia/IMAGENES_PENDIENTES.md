# IMÁGENES PENDIENTES — cuadros de escena y placas

Los cuadros de escena y las placas que `story.js` pide y todavía no existen.
**Los retratos se mudaron a [RETRATOS_PENDIENTES.md](RETRATOS_PENDIENTES.md)**, con el listado
personaje por personaje.

Cuando estén los prompts van a `PROMPTS_PLACAS_LISTOS.md` y `PROMPTS_TIERRA_LISTOS.md`.

**Medidas**: cuadro de escena 960×540 en `.webp`; la página del cuaderno es 3:4 **vertical** y el
motor la encaja centrada, nunca estirada.
**Cascada de fallbacks (RF-01)**: el cuadro propio de la línea → la placa del lugar → tarjeta negra.
Por eso una escena sin cuadro **igual se ve y se juega**; sólo pierde la imagen.

---

## CUADROS DE ESCENA

**Placas de ambiente**: las 33 existen. No falta ninguna.

**Cuadros propios (`assets/story/`)**: hay 16 y `story.js` pide **64**. Faltan 48.
De esos, los que no son opcionales porque **la imagen ES la escena**:

| cuadro | escena | por qué es bloqueante |
| --- | --- | --- |
| `M7_CRUZ` | M6_2 | va como `tipo: 'CUADRO'`: sin imagen, el beso a la cruz del Vasco se lee como texto en vez de verse |
| `M7_FOTO_DORSO` | M07_LOCKER | el dorso de la foto **es** el reveal |
| `P1_2B` | P1_2 | el sapito picando en el agua: la imagen que el juego entero recoge después |
| `M8_TERITO` | M7_SOBREVUELO | **el más importante de los cuatro.** Desde el pozo: el Skyhawk pasando enorme y, un segundo apenas, el terito pintado bajo la cabina. Es la única vez que el jugador lo ve, y sin él la carta de Mateo («le vi EL TERITO, TU pájaro») afirma algo que nadie vio |

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

## Orden sugerido para generar