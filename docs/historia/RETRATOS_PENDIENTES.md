# RETRATOS PENDIENTES — personaje por personaje

Todos los retratos que **no existen** en `assets/portraits/`, agrupados por quién es.
Los cuadros de escena y las placas están en [IMAGENES_PENDIENTES.md](IMAGENES_PENDIENTES.md).

**Medida**: 108×108 px (36 de diseño × 3), PNG. **Referencia de físico y cara**:
`characters_examples/final/` y `team.png` mandan sobre cualquier descripción escrita.

**La regla que hace falta este archivo**: un `cara:` que no existe **no da error**. Cae al
placeholder y en pantalla se ve exactamente igual que si el asset simplemente faltara.

## Cómo leer las tablas

- **🔴 BLOQUEANTE** — `story.js` ya lo pide. La escena está escrita y sale con placeholder.
- **· propuesto** — no lo pide nadie todavía. Marcá `[x]` los que quieras que se hagan.

## El problema de nombres, antes de generar nada

Los ids mezclan **emoción** (`_roto`, `_ceno`) con **contexto** (`_piloto`, `_casco`,
`_auriculares`, `_espaldas`), y algunos las dos cosas juntas: `gitano_gritando_llorando_piloto`.
Así cada emoción nueva se multiplica por cada contexto y la lista no cierra nunca.

**Convención propuesta:**

```
<personaje>_<emocion>        en tierra, busto de frente        → el 80% del juego
<personaje>_p_<emocion>      en cabina, casco y máscara        → sólo los 5 pilotos
```

Quedan afuera de la grilla, porque no son emociones: `condor_reposo`, `condor_radio`,
`condor_telefono`, `pichon_auriculares`, `*_espaldas`, `gitano_thankyou`.

- [ ] adoptar la convención `_p_` · [ ] dejar los nombres como están

---

# LOS CINCO PILOTOS

## TERO / Esteban

**Existen (6)**: `casco` · `ceno` · `neutro` · `preocupado` · `roto` · `sonrisa`

| id | estado | dónde / por qué |
| --- | --- | --- |
| `tero_llorando_aterrado` | 🔴 **BLOQUEANTE** | `M8_EPI` — la muerte del Pichón. Renombrar a `tero_p_roto`: está en cabina |
| `tero_p_neutro` | · propuesto | es el protagonista y vuela catorce misiones con una sola cara de casco |
| `tero_p_ceno` | · propuesto | |
| `tero_p_gritando` | · propuesto | M14: «¡Llegué, Mateo!» |
| `tero_risa` | · propuesto | no tiene ninguna. Se ríe en M1, M2 y M3 |
| `tero_orgullo` | · propuesto | el sobrevuelo de M8 |
| `tero_viejo_neutro` | · propuesto | **Final B**, décadas después: hoy sale con la cara de 1982 |
| `tero_viejo_roto` | · propuesto | «¿Sabés que nunca supe si me vio?» |
| `tero_viejo_emocionado` | · propuesto | «¡Me vio! ¡NORMA! ¡Mateo ese día me vio!» |

## PUMA

**Existen (6)**: `ceno` · `duda` · `neutro` · `preocupado` · `roto` · `sonrisa`

| id | estado | dónde / por qué |
| --- | --- | --- |
| `puma_enojado` | 🔴 **BLOQUEANTE** | `M03_BURRADA` — «FACUNDO… / ¿QUÉ? / **NO.**» |
| `puma_espaldas` | 🔴 **BLOQUEANTE** | `M6_LOCKER2` — no contesta y no da la cara |
| `puma_piloto_neutro` | 🔴 **BLOQUEANTE** | `M7_SOBREVUELO` → `puma_p_neutro` |
| `puma_piloto_triste` | 🔴 **BLOQUEANTE** | `M6_EPI`, la muerte del Vasco → `puma_p_roto` |
| `puma_p_ceno` | · propuesto | |
| `puma_p_gritando` | · propuesto | M14: «¡MANDALE, TERO!» |
| `puma_risa` | · propuesto | M14, la única vez que se lo ve humano: «Qué quilombo, che» |

## GITANO — el que más caras necesita y el que menos tiene

**Existen (6)**: `ceno` · `neutro` · `preocupado` · `risa_apagada` · `roto` · `sonrisa`

Es el alivio cómico del juego y hoy tiene el mismo repertorio que el Vasco, que casi no habla.
**Quince faltantes**, y siete de ellas son de una sola escena.

| id | estado | dónde / por qué |
| --- | --- | --- |
| `gitano_thankyou` | 🔴 **BLOQUEANTE** | `M2_MATE`. **Ya está generado**: `campaigns/c1/portraits_news/gitano_saludo.jpg` — falta instalarlo y renombrarlo |
| `gitano_entusiasmado` | 🔴 **BLOQUEANTE** | `M03_BURRADA`. **Unifica** `emocionado` + `expectante` + `ansioso` |
| `gitano_imaginando` | 🔴 **BLOQUEANTE** | `M03_BURRADA`. **Unifica** `imaginando` + `volando` |
| `gitano_explicando` | 🔴 **BLOQUEANTE** | `M03_BURRADA`. Era `explicando_mira_arriba`; el «mira arriba» lo dice la `accion:` |
| `gitano_delirante` | 🔴 **BLOQUEANTE** | `M03_BURRADA`, el remate |
| `gitano_pensativo` | 🔴 **BLOQUEANTE** | `M03_BURRADA` — «Y… yo calculo…» |
| `gitano_panico` | 🔴 **BLOQUEANTE** | `M5_CHANCHA` — «no me da la nafta» |
| `gitano_llorando` | 🔴 **BLOQUEANTE** | `M5_CHANCHA` — «me vuelvo vegetariano en tu honor» |
| `gitano_sorprendido` | 🔴 **BLOQUEANTE** | `M6_2` — «Vasco, ¿vos estás bien?» |
| `gitano_serio_triste` | 🔴 **BLOQUEANTE** | `M7_2` |
| `gitano_p_gritando` | 🔴 **BLOQUEANTE** | `M6_EPI` — «¡SALTÁ, VASCO, SALTÁ!». Era `piloto_gritando` |
| `gitano_p_roto` | 🔴 **BLOQUEANTE** | `M8_EPI` — «¡Era un pibe, Puma!». Era `gritando_llorando_piloto` |
| `gitano_p_neutro` | · propuesto | |
| `gitano_carcajada` | · propuesto | tiene `risa_apagada` pero **no tiene una risa entera**, y es su registro base |
| `gitano_fuego` | · propuesto | M13: «¿Vos estás en pedo, culiao? SEIS veces me trajiste vivo». Por única vez la tonada no trae chiste |

> **De 15 a 12** si se aceptan las dos unificaciones. Los siete matices del Gitano entusiasmado que
> pide la burrada son la misma actuación: a 108 px no se distinguen.

## VASCO — el que casi no habla

**Existen (6)**: `ceno` · `neutro` · `preocupado` · `rezo` · `roto` · `sonrisa`

| id | estado | dónde / por qué |
| --- | --- | --- |
| `vasco_espalda` | 🔴 **BLOQUEANTE** | `M03_BURRADA` — se va de la escena. *(era `vazco_espalda`, con z)* |
| `vasco_sorprendido` | 🔴 **BLOQUEANTE** | `M03_BURRADA` — «¿Cómo que te bajás?» |
| `vasco_piloto` | 🔴 **BLOQUEANTE** | `M6_EPI` → `vasco_p_neutro`. **Es el último plano del Vasco vivo** |
| `vasco_besa_cruz` | · propuesto | M7. Puede resolverse con el CUADRO `M7_CRUZ` en vez de un retrato — decidir cuál |

## PICHÓN

**Existen (6)**: `auriculares` · `ceno` · `neutro` · `preocupado` · `roto` · `sonrisa`

| id | estado | dónde / por qué |
| --- | --- | --- |
| `pichon_pensante` | 🔴 **BLOQUEANTE** | `M03_BURRADA` — «¿Y con qué?», «¿usarías el eyector?» |
| `pichon_p_neutro` | · propuesto | |
| `pichon_p_roto` | · propuesto | M9: «…ah. Me dieron. ¿Capitán? Me dieron.» **Su muerte no tiene cara** |
| `pichon_entusiasmado` | · propuesto | M3: habla rapidísimo cuando se entusiasma (§9) y hoy usa `sonrisa` |
| `pichon_avergonzado` | · propuesto | M3: se frena a mitad de frase. Hoy usa `preocupado` |

---

# TIERRA

## EL TURCO — el que más habla en todo el juego

**Existen (6)**: `ceno` · `neutro` · `orgullo` · `preocupado` · `roto` · `sonrisa`

| id | estado | dónde / por qué |
| --- | --- | --- |
| `turco_ternura` | 🔴 **BLOQUEANTE · el más urgente** | **seis escenas**: `M1_7` `M2_5` `M6_LOCKER2` `M8_LIBRETA` `M11_ASADO2` `M12_2`. Nunca existió: los seis momentos tiernos del Turco salen con placeholder |
| `turco_enojado` | 🔴 **BLOQUEANTE** | `M03_BURRADA` — «¿Vos te pensás que el aire es una vereda?» |
| `turco_pensante` | 🔴 **BLOQUEANTE** | `M03_BURRADA` — «Escucho.» |
| `turco_risa` | · propuesto | se ríe todo el tiempo y no tiene una sola cara de reírse |
| `turco_puteando` | · propuesto | §9b: «putea todo el día, y cuando deja de putear se te congela la sangre». Sin esta cara, la mitad de esa regla no se ve |
| `turco_viejo_neutro` | · propuesto | **Final B**: de civil, la gorra en la rodilla |
| `turco_viejo_sonrisa` | · propuesto | «…El pibe dibujaba bien, ¿eh?» |
| `turco_viejo_orgullo` | · propuesto | **el remate del juego entero**: «…M'hijo. Acá dice que te vio.» |

## CÓNDOR — no es una persona, es un parlante

**Existen (2)**: `radio` · `reposo`

| id | estado | dónde / por qué |
| --- | --- | --- |
| `condor_telefono` | 🔴 **BLOQUEANTE** | `P3_4`. Es **la única vez que Cóndor es un tipo en una oficina** y no la voz del comando: no le habla a un piloto, le avisa a un padre |

## MATEO

**Existen (6)**: `ceno` · `frio` · `neutro` · `preocupado` · `roto` · `sonrisa`
**De nene (3)**: `asombro` · `risa` · `serio`

| id | estado | dónde / por qué |
| --- | --- | --- |
| `mateo_emocionado` | · propuesto | la página del cielo: «¡¡PÁ!! TE VI» |
| `mateo_llorando` | · propuesto | M12, la muerte del Colorado. Hoy usa `roto` |
| `mateo_agotado` | · propuesto | M13, la última página |
| `mateo_nene_dibujando` | · propuesto | es lo que hace todo el prólogo y no hay cara para eso |

## NORMA

**Existen (4)**: `calida` · `neutro` · `rota` · `seria`

| id | estado | dónde / por qué |
| --- | --- | --- |
| `norma_asustada` | · propuesto | P.2, el teléfono |
| `norma_vieja_neutro` | · propuesto | **Final A**, firmando la encomienda años después |
| `norma_vieja_rota` | · propuesto | leyendo la carta |

## COLORADO / Correa

**Existen (6)**: `ceno` · `neutro` · `ofreciendo` · `preocupado` · `roto` · `sonrisa`

| id | estado | dónde / por qué |
| --- | --- | --- |
| `colorado_muriendo` | · propuesto | M12, los jazmines. Es **su escena** y hoy va con `roto` |

## Los que ya están completos

- **Esteban joven** (3): `calido` `risa` `serio` — el prólogo entero.
- **Claribel** (6) y **el pibe de la 10** (3): se cobran en la post-créditos, que todavía no está escrita.
- **Peruano** (3): M10 completa.
- **Mecánico de Tandil**: no tiene ni necesita. La caja sin busto ya dice que podría ser cualquiera.

---

# RESUMEN

| | |
| --- | --- |
| Existen hoy | **72** |
| 🔴 Bloqueantes | **28** *(→ **25** con las dos unificaciones del Gitano)* |
| Propuestos | **31** |

**Orden sugerido**, de mayor a menor rendimiento:

1. **`turco_ternura`** solo — un archivo, seis escenas.
2. **Instalar `gitano_saludo`** como `gitano_thankyou` — ya está generado.
3. **La hoja de `M03_BURRADA`** — las cinco del Gitano unificadas + `turco_enojado` `turco_pensante` `puma_enojado` `pichon_pensante` `vasco_sorprendido` `vasco_espalda`. Once, y M3 queda entera.
4. **La hoja de cabina** — los cinco pilotos × `neutro` `ceno` `gritando` `roto`. Veinte, y cubre todo el vuelo del juego incluidas las tres muertes de M14.
5. **La hoja de los viejos** — Esteban, el Turco y Norma décadas después. Ocho, y cierran los dos finales.
6. **Los sueltos**: `condor_telefono` `gitano_panico` `gitano_llorando` `gitano_sorprendido` `gitano_serio_triste` `puma_espaldas` `colorado_muriendo`.
7. El resto de los propuestos, según lo que marques.
