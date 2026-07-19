# UPDATE ANIMATIONS — RASANTE

Documento de trabajo para la mejora de animaciones. Estado, plan y **pedido de sprite sheets**.
Fecha: 18 de julio de 2026.

---

## 1. Qué ya está hecho (por código, sin assets)

Mejoras de "juice" aplicadas en `index.html` para que el vuelo deje de sentirse duro. **No requieren arte** y conviven con los sprite sheets futuros (cuando lleguen los frames, el foreshortening por código se apaga solo).

| Mejora | Dónde | Detalle |
|---|---|---|
| **Banking suavizado** | `update()` play + `reset()` | Nueva var `plane.bank` (-1..+1), *ease-in/out* mezclando intención de giro (input) + velocidad real. Perilla: `dt*9`. |
| **Cabeceo (pitch)** | `update()` play | `plane.pitch` (-1..+1) atado a `vy`; el morro sube al trepar, baja al caer. Perilla: `dt*6`. |
| **Foreshortening 3D falso** | `drawPlaneSprite()` | `ctx.scale(1 - |bank|*0.26, …)`: al inclinar, el ancho del sprite se comprime → lee como ala rolando hacia cámara. **Se desactiva al usar sprite sheet de banking.** |
| **Sub-pixel** | `drawPlaneSprite()` | Se sacó `Math.round()` del avión: desliza en vez de saltar pixel a pixel. |
| **Bob de vuelo + micro-wobble** | `drawPlaneSprite()` | Oscilación sutil `sin(t*3.1)` para que nunca quede congelado. |

**Perillas para tunear** (todas en `index.html`):
- Rotación máxima de alabeo: `bank*0.42` en `drawPlaneSprite()`.
- Compresión del foreshortening: `0.26`.
- Suavizado del bank/pitch: `dt*9` / `dt*6` en `update()`.
- Amplitud del bob: `Math.sin(t*3.1)*0.5 + Math.sin(t*1.7)*0.3`.

---

## 2. Etapa siguiente — Sprite sheets (arte)

Todo lo NO-jugador se dibuja hoy con rects (`px()`), placeholder. El objetivo es reemplazar por sprite sheets. El motor ya está listo para enchufarlos.

### Cómo se enchufa un sheet de banking (avión)
`plane.bank` ya va de -1 a +1. El mapeo es trivial:
```js
const N = 5;                                   // frames del sheet
const fi = Math.round((plane.bank + 1) / 2 * (N - 1));   // 0..N-1
ctx.drawImage(sheet, fi*fw, 0, fw, fh, -PW/2, -PH/2, PW, PH);
```
Al usar el sheet, se apaga el `ctx.scale()` de foreshortening (el frame ya trae la inclinación real).

### Cómo se enchufa un sheet animado (soldado, explosión, rotor)
Animación por tiempo: `const fi = Math.floor(t*fps) % N;` y `drawImage` del recorte `fi`.

---

## 3. PEDIDO DE SPRITE SHEETS  ✅ = lo que falta que me pases

Specs generales para **todos**:
- **Formato:** PNG-32 con transparencia (canal alpha). Pixel art, bordes duros (sin anti-alias en el contorno) para que matchee el resto.
- **Layout:** una sola tira **horizontal**, todos los frames del **mismo tamaño**, en fila, sin padding (o padding uniforme — avisame cuál).
- **Anclaje:** el sujeto **centrado** en cada frame (mismo centro en todos), así el swap de frame no "salta".
- **Resolución:** al tamaño que aparece en pantalla (pixel art 1×). Los tamaños de abajo son sugeridos; si me pasás otro, leo el real del archivo y ajusto el código.

---

### 3.1 ✅ SOLDADOS — (dijiste que casi los tenés) **PRIORIDAD**

Corren sobre la tierra hacia/entre el jugador; se los mata con metralleta, misil o **atropellándolos** en rasante. Hoy son un rect gris de ~9px de alto cuando están cerca.

Necesito, idealmente 3 sheets (o uno combinado, avisame):

| Sheet | Frames | Tamaño sugerido x frame | Nota |
|---|---|---|---|
| **`soldado_run.png`** | 4–6 | 16 × 24 px | Ciclo de corrida. Vista **de frente o 3/4** (corren hacia cámara en el eje de profundidad). |
| **`soldado_muerte.png`** | 3–4 | 24 × 24 px | Desintegración / caída con sangre (para metralleta y misil). |
| **`soldado_atropellado.png`** | 2–3 | 32 × 24 px | Impacto de avión: salpicón / vuelo de cuerpo. Si no, uso el de muerte. |

- Si tenés **2–3 variantes** de soldado (distinto casco/color) mejor, para dar variedad. Nombralas `soldado_run_a.png`, `_b.png`, etc.
- Paleta: verde oliva / marrón tierra (matchea el terreno `LAND`).

---

### 3.2 AVIONES JUGABLES — sheet de banking (los 5)

Sube el vuelo a inclinación 3D real (tipo After Burner). Reemplaza los webp estáticos actuales.

- **1 sheet por avión:** `pampa_bank.png`, `a4_bank.png`, `dagger_bank.png`, `supere_bank.png`, `a4q_bank.png`.
- **Frames:** **5** mínimo (alabeo fuerte-izq · izq · centro · der · fuerte-der).
  Ideal **7**: agregar 2 de cabeceo (morro-arriba / morro-abajo).
- **Tamaño x frame:** ~**64 × 32 px** (o el aspect nativo de tu avión; el juego lo dibuja a 54px de ancho, así que 64 da margen).
- Vista **trasera/picada** (lo vemos desde atrás-arriba), coherente con la cámara actual.
- Postquemador: puede venir en el sprite o lo dejo por código (ya hay fogonazo con turbo).

### 3.2b ✅ COCKPIT del MOMENTUM — ENTREGADO Y EMBEBIDO

**Hecho**: `assets/original/cockpit_sky.png` (1024×559) embebido con
`tools/embed_asset.py cockpit`. El vidrio ya venía con transparencia correcta (alpha 0) y el visor
HUD central semitransparente (alpha 107). La cámara del momentum corrige verticalmente
(`momYOff()`) para que el barco quede en el parabrisas. Para reemplazarlo a futuro, specs originales:

- **`cockpit.png`** — proporción de pantalla **320 × 180** (ideal **640 × 360** para nitidez 2×).
- **Centro TRANSPARENTE** (el vidrio: por ahí se ve el barco y se apunta — dejá libre el centro,
  aprox. desde y=15 hasta y=145 en coords 320×180).
- Pintado: **parantes laterales** del canopy (diagonales), **panel de instrumentos** abajo
  (podés incluir diales pintados; la luz de cañón la animo por código encima), y si querés un
  leve marco superior (los 13px de arriba y abajo los tapan las barras de letterbox).
- **Para enchufarlo alcanza un comando** (pipeline listo y probado):
  `python3 tools/embed_asset.py cockpit assets/cockpit.png` — y para volver al placeholder:
  `python3 tools/embed_asset.py cockpit --clear`. Verificar con `python3 tools/check_syntax.py`.
- Opcional futuro: un cockpit por avión (array como `PLANES`); por ahora uno genérico.

### 3.2c ✅→pendiente RESPLANDOR DE DISPARO (muzzle flash) — placeholder listo, falta asset

Al disparar (cañón o misil) aparece un **resplandor en el borde del vidrio** del lado del ala que
disparó (feedback instantáneo — la bala tarda ~1.3s en verse). Hoy son **cuadrados blancos por
código** (`mom.flashL/flashR` en `drawMomentum`, después de `drawCockpit`).

- **`muzzle_flash.png`** — imagen única ~**24 × 32 px**, fogonazo lateral (luz que entra por el
  borde del canopy). Se dibuja en (0, 50) y espejado en (W-20, 50), con alpha decayendo 0.14s
  (cañón) / 0.22s (misil). Con una sola imagen sirve (la espejo por código).

(La idea anterior de side-camera con sprite de perfil queda descartada por ahora — el cockpit es más barato y más inmersivo.)

---

### 3.3 EXPLOSIÓN genérica (reutilizable)

Para: choque del avión, impacto en barcaza, y como remate de muerte de soldado. Hoy son partículas por código.

- **`explosion.png`** — **5–6 frames**, ~**48 × 48 px**. Naranja/humo, estilo pixel.
- Con una sola sirve para todo (la escalo según el caso).

---

### 3.4 HELICÓPTERO enemigo (opcional, mejora clara)

Hoy es rect con rotor fingido por `sin()`. Un sprite con blur de rotor queda mucho mejor.

- **`helo.png`** — **2 frames** (rotor en 2 posiciones/blur), ~**28 × 20 px**. Vista de frente.

---

### 3.5 FRAGATA / BARCO (mast) — estático, no sheet

Hoy es rect. Overlap con el asset de la **barcaza** de la barra objetivo (ya pendiente).

- **`fragata.png`** — imagen única, ~**64 × 40 px**, vista de frente/proa. Sirve para el obstáculo y como barcaza objetivo.

### 3.5b ⭐ BARCAZA DEL MOMENTUM — vista LATERAL grande (nueva, importante)

El minijuego **MOMENTUM** muestra la barcaza **horizontal a lo largo de la pantalla** (hoy dibujada por
rects en `drawMomentum`). Necesita su propio asset **de perfil**:

- **`barcaza_lateral.png`** — imagen única, ~**280 × 70 px** (se escala 0.55×/0.75×/1× según la pasada).
  Vista **lateral completa**: casco, puente/superestructura al centro, chimenea, mástil con radar,
  torretas AA a proa y popa. Dejá esas piezas **reconocibles y separadas** porque el juego les dibuja
  encima los recuadros de zona crítica y el estado "destruido/chamuscado" por zona.
- Opcional: versión **dañada** (`barcaza_lateral_dmg.png`) para el final, o por partes (yo chamusco por código).

---

### 3.6 Barra de objetivo (YA PENDIENTE de antes)

No son sheets, imágenes únicas. Recordatorio:
- **`obj_puerto.png`** (Puerto Argentino, extremo izq).
- **`obj_barcaza.png`** (barcaza inglesa, extremo der) — puede ser la misma `fragata.png`.
- **`obj_avion.png`** (marcador del avión que avanza por la línea).

---

### 3.7 Baja prioridad / se quedan por código
- Salpicadura y estela de agua (`drawSea`/`drawWake`): el código actual funciona bien.
- Fogonazo de cañón y postquemador: por código.
- Balas / misiles / trazadoras: por código.

---

## 4. Orden sugerido de entrega
1. **Soldados** (los tenés casi listos) → los enchufo primero.
2. **Sheet de banking del Pampa** (el avión estrella) para validar el pipeline; después el resto de los aviones.
3. **Explosión** genérica.
4. Helicóptero / fragata / barra objetivo.

Cuando me pases cualquier tira, decime **cuántos frames** trae y **el tamaño de cada frame** (o lo leo del archivo) y la enchufo.
