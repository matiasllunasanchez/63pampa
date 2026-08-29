# misiones/ — el relevamiento de playtest, misión por misión

Un documento por misión (numeración canon de 14; el id de código adentro). El circuito:

1. **Jugar** por el selector (menú → MISIONES) o `?mision=<id>`. Con **[H]** se elige CÓMO se
   abre la misión — son tres cosas distintas de medir:
   · **MISIÓN** — derecho al vuelo, sin pantallas (lo que más se usa al ajustar jugabilidad)
   · **CINEMÁTICAS** — el guion y el epílogo seguidos, sin volar (para medir el ritmo del relato)
   · **CINE + MISIÓN** — la misión entera, como la vive un jugador de campaña
2. **Anotar** en el archivo de la misión (sección NOTAS DE PLAYTEST, formato fijo).
3. **Sesión de ajuste**: una IA toma SOLO las notas + el bloque §4 del
   [PLAN_MISIONES_FASES](../PLAN_MISIONES_FASES.md), implementa, corre
   `npm run misiones` + `npm run check`, tilda "Ajustes derivados" y devuelve.

**La libreta:** cada misión se vuela con las mejoras que un jugador REAL tendría al llegar ahí
(las primeras del orden causal — `loadoutAt` en `data/upgrades.js`); el selector las muestra al
pie antes de entrar. M1 vuela con el avión de fábrica, M6 con cinco, M12 con once. Para medir el
loadout hay que jugar por el SELECTOR o por CAMPAÑA: en CICLO/PATRIA salen las doce.

M03 y M10 no existen en código hasta el remapeo (R). El clímax de todas las de buque es
**PULSO interino** (decisión 19/8 — PLAN_MISIONES_FASES §1b).
