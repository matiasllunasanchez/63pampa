# LA ESCALERA DE APRENDIZAJE

*Qué mecánica aparece en qué misión. Decidido por el autor el 4/10/2026.*

> **Esto manda sobre lo anterior** en todo lo que toque a qué se enseña y cuándo: sobre las
> lecturas, sobre los cambios viejos de M1 a M4, y sobre el código. Cada `M#_CAMBIOS.md` tiene su
> parte asentada y apunta acá.

---

## La regla en una línea

**Las cuatro primeras misiones enseñan todo. De la cinco en adelante no aparece ninguna mecánica
nueva:** cambian el terreno, los enemigos y su cantidad, la distancia y el blanco — nunca lo que
hace el jugador.

---

## La escalera

| | Qué es | Qué se aprende | Qué NO hay todavía |
|---|---|---|---|
| **M1** | **Misión de diversión.** Distancia **más corta** | Volar en rasante · algunos controles · altímetros · **el radar y las estrellas**: subir para que te vean, juntar las cuatro, bajar y perderlas de a una | Momentum · turbo · Chancha · bombas · enemigos |
| **M2** | **Misión de diversión 2, más lejos.** Sin objetivo | **Momentum · turbo · la Chancha** (y su control, que recién acá aparece) · **enemigos**: cada estrella trae un Harrier | Bombas · objetivo |
| **M3** | **Primera misión con objetivo**, probablemente el puesto de una isla. Distancia **mucho más larga, "real"** | **Las bombas**: lanzar, errar, reintentar, oportunidad por oportunidad · con bombas **el avión va más lento** · al terminar, **la primera mejora** | — |
| **M4** | **Todo junto. Se ataca al buque** | Nada nuevo: se usa todo | — |
| **M5 → M14** | Varían terreno, enemigos, cantidades, distancias y blancos | **Ninguna mecánica nueva** | — |

---

## Las reglas que salen de acá

**La Chancha.** Desde M2 está **al inicio de cada misión, antes de entrar a la zona de radar**: se
carga nafta para hacer la zona de radar y la vuelta. Y **se la puede volver a llamar al final de la
zona de radar.** El control para llamarla **no aparece hasta M2.** **Desde M7** ya no se la puede
llamar dentro del radar: sólo aparece en la ida, antes de entrar, porque no puede ir lejos. *(Era
desde M10; el autor lo adelantó a M7 el 4/10 — ver abajo.)*

**Los Harriers.** Desde la primera estrella vienen al rato, y **se reponen**: si uno muere y las
estrellas siguen, viene otro. **Cuántos por estrella:** en **M1, ninguno** (nunca llegan) · en
**M2, uno** · **en todas las demás, dos.** *(Autor, 4/10: *"Para M2, esta bien, qe lleguen 2 por alarma entonces en el resto de las misiones qe no sean la 2"*)*

**La radio.** **En M1 y M2 se habla:** son diversión y son tutorial, y que el escuadrón hable es lo
que deja enseñar. *(Autor, 4/10: *"M1 y M2 se habla y es tutorial ayuda a eso."*)* **El silencio de radio en zona de radar arranca en
M3**, la primera misión con objetivo.

**Las bombas y la velocidad.** M1 y M2 se vuelan **sin bombas, y más rápido.** Desde M3 se llevan
bombas y **el avión es más lento.** *(Coincide con lo aprobado en `../../sistemas/PLAN_CARGA_Y_CHANCHA.md`:
sin bombas el avión va más rápido.)*

**Las mejoras.** **M1 y M2: ninguna.** Al terminar **M3** se gana **una, servida**: *"Pichón
encontró una mejora para tu avión y Turco la aplicó."* **De M4 en adelante, al final de cada
misión, se elige una entre dos.** *(El autor marcó: **REVISAR las mejoras** — queda pendiente.)*

---

## El pedido del autor, textual y completo

> *"en mision 2 vamos a aprender el concepto de chancha seguramente, qe va a estar al inicio de
> cada mision, en la parte previa a entrar al radar, para arrancar la zona de radar y vuelta con
> nafta cargada, y aprender el concepto de qe podemos llamar a la chancha llegando al final de la
> zona de radar. mostrando el control correspondiente, qe hasta esta mision no apareceria.*
>
> *Mision 1 distancia mas corta, aprender a volar en rasante, concepto de radar y algunos
> controles, no momentum no turbo.*
>
> *Mision 2 mas larga, momentum, turbo, chancha (no podnria objetivo, haria mision de difversion 2
> pero mas lejos y por eso aparece chancha) Aparecen ya enemigos a partir de la alarma 1 viene un
> harrier al ratito, cada alarma trae un harrier. Y si el harrier muere pero la cantidad de alamras
> sigue vuelve a aparecer otro al ratito.*
>
> *Mision 3: Ya hay objetivo, se aprende concepto de bombas, en las otras dos misiones no llevamos
> bombas, la velocidad era mas rapida, ahora es mas lento, El obejtivo es el puesto de una isla
> quiza, aprendemos el concepto de lanzar bomba y secuencia uno a uno de diferents oportunidades,
> la distancia es mucho mas larga, "real". Se suma la chancha y demas. Al finalizar la mision 3 se
> aprenden los conceptos de MEJORAS DE PICHON, se gana una mejora del estilo "Pichón encontró una
> mejora para tu avion y Turco la aplicó"*
>
> *Cada cierto tiempo pichón y turco te sugerirán mejoras qe podrás elegir, bla bla bla, roguelike.*
>
> *(REVISAR las mejoras) A partir de cada fin de mision de todas las qe siguen hay mejoras
> seleccionables, el usuario selecciona entre 2 mejoras.*
>
> *M4: Todo junto, se ataca al buque.*
>
> *El resto de niveles ya no variarán en jugador, solo la chancha deja de poder llamarse dentro del
> radar en rasante a partir de la mision 10 qe solo aparece a la ida y se vuelve porqe no puede ir
> mucho.*
>
> *A partir de estos niveles ya desde el 5 en adelante, variarán terrenos, enemigos, cantidades de
> enemigos, distancias, buques o objetivos finales, terrenos, pero no mecanicas de juego. Ya se
> presentarian todas las mecanicas posibles"*

---

## ⚠ Lo que esto cambia de lo que ya estaba

**En el código (M1 ya implementada):**

- **M1 tiene turbo.** Hay una lección `LEC_M1_TURBO`, y el combustible de M1 (`fuelScale: 0.25`)
  se calibró el 23/9 *para el turbo*. Con esta escalera **el turbo sale de M1** y se enseña en M2:
  sale la lección y **hay que recalibrar la nafta de M1**.
- **El calendario de mejoras** (`upgrades.js`) hoy es *M1 nada, M2 una servida (TERRAIN MASKING),
  M3 en adelante a elegir.* Pasa a ser *M1 y M2 nada, M3 una servida, M4 en adelante a elegir.*

**En lo que se había decidido el 3/10 para M2** (`M2_CAMBIOS.md`, segunda ronda):

- **La bomba (pedido 9) y el islote (pedido 10) se mudan a M3.** M2 no tiene objetivo ni bombas.
- **"Si hay objetivo, hay cinemática" (pedido 3)** ya no arranca en M2: arranca en M3.
- **La Chancha (pedido 5)** queda resuelta: debuta en M2.

**En la lectura de M3:** M3 deja de ser *"la misión más liviana de la campaña, sin enemigos"*.
Pasa a ser la de las bombas, larga y real. **Las escenas del hangar no dependen de esto** y no hay
que tocarlas: de hecho, *El invento* —el Pichón tocándole el avión a Esteban y el Turco diciendo
"a ver, mostrame"— **es exactamente el anuncio de la primera mejora** que ahora se gana al final de
esa misma misión.

---

## Lo que quedó para que decida el autor

1. ✅ **El silencio de radio en M2** — resuelto: en M2 se habla.
2. ✅ **Un Harrier por estrella** — resuelto: uno en M2, dos en el resto.
3. ✅ **Cuándo deja de bajar la Chancha** — respuesta del autor (4/10), textual:

> *"La chancha esta bien para viajes cortos, significa llega hasta el radar y vuelve"* ·
> *"No se extiende al radar"* · *"al gitano lo salva dentro de la vuelta en rasante"* · *"dentro del
> radar"*

   **La escena de M6 queda como está.** El rescate del Gitano pasa **dentro del radar, en la
   vuelta, en rasante** — es la última vez que la Chancha entra a la zona de radar, y ahí la
   rompen. *"Vuela corto"* quiere decir: **llega hasta el borde del radar y vuelve; no entra.**

   **Y el autor cerró la regla (4/10), textual:**

   > *"Cuando lo salva al gitano ya no se puiede llamar dentro del rdar, y movamosla a la 7 sino"*

   ✅ **Queda en dos escalones:**

   | | Dónde se puede llamar a la Chancha |
   |---|---|
   | **M2 a M6** | Al principio, antes del radar · **y al final de la zona de radar, adentro** |
   | **M7 en adelante** | **Sólo en la ida, antes de entrar al radar.** Adentro, nunca más |

   **La regla que antes empezaba en M10 se mudó a M7**, porque es la escena de M6 la que la
   explica: la rompen rescatando al Gitano adentro del radar, y desde esa noche vuela corto. La
   tarjeta de M10 (*"La Chancha no baja más al sur"*) ya no marca el cambio: lo recuerda.
