# DE DÓNDE SACO CADA PROMPT

**Regla corta: si el archivo tiene llaves `{ASI}`, NO es para copiar.**

## Los dos archivos que se usan

| Querés generar… | Archivo | Qué trae |
|---|---|---|
| Cualquier imagen **a color, pixel art** (fondos de escena y caras) | **`PROMPTS_AIRE_LISTOS.md`** | 18 placas (prólogo, M1, M2, M3) + 10 retratos + 6 figuras del P.2 |
| Cualquier imagen **de cuaderno, birome azul** (los dibujos de Mateo) | **`PROMPTS_TIERRA_LISTOS.md`** | P.1a arroyo, P.1b sapito (mano de Mateo a los 8) + **las 14 páginas del cuaderno**, una por misión (mano de los 18) |
| La **hoja de rostros completa** de un personaje (seis celdas, misma grilla) | `PROMPTS_RETRATOS_LISTOS.md` | 8 hojas, una por personaje |

En los tres, **el prompt es el bloque de código entero**: se selecciona de la primera a la
última línea, se copia y se pega. No hay que agregarle estilo, ni época, ni formato — ya está
todo adentro. Debajo de cada título está el **nombre de archivo exacto** con el que hay que
guardar la imagen (`carta1_p4.png`, `vestuario.png`…): el motor las busca por ese nombre.

## Archivos que NO se copian

- `PROMPTS_VN_PROLOGO.md` y `PROMPTS_VN_M1_M3.md` — son **de trabajo**. Tienen `{HOJA}`,
  `{MANO_DE_MATEO}`, `{TERITO}`, `{BIROME}`: son piezas que el generador arma. Sirven para
  discutir el criterio, no para producir.
- `STORYBOARD_1.md` — los `{TOKEN}` son referencias de personajes y objetos.
- `PROMPTS_PLACAS_LISTOS.md` y `PROMPTS_VN_PROLOGO_LISTOS.md` — **viejos**, anteriores a las
  correcciones de agosto (copete del tero, una estrella por avión por vuelta, el Colorado con
  retrato, dibujos sueltos y sin repetir, la mano de Mateo chico).

## Si algo hay que corregir

Los dos archivos LISTOS **se generan**, no se editan a mano:

```bash
python3 produccion/hacer_prompts_listos.py
```

Los bloques de estilo viven una sola vez adentro de ese script (`AIRE`, `EPOCA`, `HOJA`,
`MANO_DE_MATEO`, `SINREP`…), así que un arreglo entra una vez y baja a todos los prompts que
lo usan. Si me decís “el tero salió mal”, toco el script y te devuelvo los dos archivos
regenerados.
