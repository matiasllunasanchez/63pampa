# PLAN — Migración a Electron + publicación en Steam

Documento vivo de ejecución **periódica**: se hace **una fase por sesión**, y cada fase deja
el juego **jugable** al terminar (nunca un estado a medio romper). Al cerrar cada fase se
actualiza la tabla de progreso de acá abajo y se anota el cambio en `ESTADO.md`.

> Objetivo final: `index.html` autocontenido → **app de escritorio Electron** empaquetada y
> **publicada en Steam**. Beneficio transversal: desaparece el límite de 16 MB del Artifact,
> se recupera audio de calidad original y se habilita three.js. Ver memoria del proyecto.

---

## ▶ RETOMAR ACÁ (si se cortó el servicio, leer esto primero)

- **Rama de trabajo:** `feature/electron` (hacé `git checkout feature/electron`).
- **Última acción completada:** Fase 0 completa (rama, `.gitignore`, `package.json`) —
  commiteada. Fecha: 2026-07-19.
- **PRÓXIMO PASO:** **Fase 1, paso 1.1** — crear la estructura de carpetas `src/` y `assets/img`,
  `assets/audio` (todavía sin mover nada, solo las carpetas). Ver detalle en Fase 1.
- **Cómo verificar dónde estás:** `git log --oneline -5` en `feature/electron` y mirá la
  Bitácora al final de este archivo.

---

## Estado global

| Fase | Título | Estado | Sesión |
|------|--------|--------|--------|
| 0 | Preparación y rama de trabajo | ✅ hecho | 2026-07-19 |
| 1 | Reestructuración (des-embeber assets + split de archivos) | 🔄 en curso | — |
| 2 | Shell de Electron (corre en ventana) | ⬜ pendiente | — |
| 3 | Empaquetado con electron-builder (.exe) | ⬜ pendiente | — |
| 4 | Integración Steamworks (SDK) | ⬜ pendiente | — |
| 5 | Pipeline de release a Steam (SteamPipe) | ⬜ pendiente | — |
| 6 | Mejoras desbloqueadas (three.js, audio, assets) | ⬜ pendiente | — |

Leyenda: ⬜ pendiente · 🔄 en curso · ✅ hecho

---

## Reparto de responsabilidades

**Lo hago yo (código, config, scripts, pruebas):** todo lo técnico de las Fases 0-3, 6 y la
parte de código de la 4-5.

**Lo hacés vos (gates externos, no puedo por vos):**
- Crear la cuenta de **Steamworks** y pagar el **Steam Direct (~USD 100 por app)**.
- Firmar el acuerdo de partner y completar los datos fiscales/bancarios.
- Obtener el **App ID** (te lo asigna Steam al crear la app) — lo necesito para la Fase 4.
- El **submit final** a la store y apretar "publicar".
- Arte de la página de Steam (capsule, screenshots, tráiler) — puedo ayudar a generarlo pero
  lo subís vos.

---

## Principios de ejecución

1. **Una fase por sesión.** Cada fase es autocontenida y termina con el juego corriendo.
2. **Todo en la rama `feature/electron`**, con commits por fase. `main` queda intacto hasta
   que el port esté estable.
3. **Doble build.** El escritorio usa archivos sueltos; mantenemos `tools/build_web.py` para
   re-inlinear todo y seguir teniendo el **Artifact web como demo/playtest**. No perdemos la
   URL que ya usás para probar.
4. **Verificación por fase** con el harness y capturas, como venimos haciendo.

---

## FASE 0 — Preparación y rama de trabajo

**Objetivo:** dejar el terreno listo sin tocar el juego todavía.

- [ ] Crear rama `feature/electron` desde `main`.
- [ ] `.gitignore` para `node_modules/`, `dist/`, `dist-web/`, `out/`, `*.log`.
- [ ] Decidir y anotar la estructura de carpetas objetivo (ver Fase 1).
- [ ] `npm init` → `package.json` base (nombre `rasante`, versión `0.1.0`, sin deps aún).
- [ ] Fijar versiones: Node 23 / npm 10 (ya instalados). Anotar en el README de dev.

**Hecho cuando:** existe la rama, `package.json` y `.gitignore`; el juego sigue abriendo igual
(`index.html` sin cambios).
**Esfuerzo:** ½ sesión. **Depende de:** nada.

---

## FASE 1 — Reestructuración: des-embeber assets + split de archivos

Es el paso más grande y el que **también servía para la web**. Hoy hay embebidos como data URI:
**6 audios** (`m4a`: lobby, game, story, adr1-3) + **6 imágenes** (`cockpit_sky.png` +
5 `webp`: aviones e iconos). Los originales ya viven en `assets/`.

**Objetivo:** que el juego lea assets desde archivos sueltos por ruta relativa, y que el
`<script>` gigante salga a un `game.js` externo.

**Estructura objetivo:**
```
src/index.html      (shell: <head> + <canvas> + <script src="game.js">)
src/game.js         (el IIFE actual, extraído)
src/styles.css      (los estilos inline actuales)
assets/img/         (cockpit_sky.png, aviones .webp, iconos obj_*)
assets/audio/       (música + las 11 pistas adrenaline en calidad ORIGINAL)
```

**Inventario de assets embebidos hoy** (a extraer): 6 audios `m4a` (lobby, game, story,
adr1-3) + 6 imágenes (cockpit_sky.png + 5 `webp` de aviones/iconos). Originales ya en `assets/`.

**Micro-pasos (cada uno es un commit chico y verificable):**

- [ ] **1.1** Crear carpetas `src/`, `assets/img/`, `assets/audio/` (vacías). Commit.
- [ ] **1.2** Copiar los originales de imagen a `assets/img/` (cockpit_sky.png + los 5 webp).
      Todavía sin tocar el código. Commit.
- [ ] **1.3** Copiar los originales de audio a `assets/audio/` (música + las 11 adrenaline en
      calidad original). Commit.
- [ ] **1.4** Extraer el `<script>` de `index.html` a `src/game.js` y el CSS a `src/styles.css`;
      crear `src/index.html` que los referencie. Probar que corre **idéntico** (aún con data
      URIs adentro de game.js). Commit.
- [ ] **1.5** Reemplazar data URI de **imágenes** por rutas relativas (`COCKPIT_ASSET.src`,
      `PLANES[i].src`, iconos `obj_*`). Probar imágenes. Commit.
- [ ] **1.6** Reemplazar data URI de **audio** por rutas (`MUSIC_*`, `MUSIC_ADR*`) y sumar las
      8 pistas adrenaline que no entraban. Probar música. Commit.
- [ ] **1.7** Crear `tools/build_web.py`: inline de `src/` + `assets/` → `dist-web/index.html`
      autocontenido para el Artifact. Verificar que el inlineado corre igual. Commit.
- [ ] **1.8** Republicar el Artifact desde `dist-web/index.html`. Adaptar/retirar
      `tools/embed_asset.py` (ya no se embebe en dev). Commit.

**Hecho cuando:** el juego corre desde `src/` con assets sueltos **y** `build_web.py` genera un
`dist-web/index.html` idéntico en comportamiento. Republicar el Artifact desde ese build.
**Esfuerzo:** 1-2 sesiones (cortable en cualquier micro-paso). **Depende de:** Fase 0.

---

## FASE 2 — Shell de Electron (corre en ventana)

**Objetivo:** el juego abre en una ventana de escritorio nativa.

- [ ] `npm i -D electron`.
- [ ] `electron/main.js`: crea `BrowserWindow` (tamaño fijo con aspecto 16:9, p. ej. 1280×720,
      redimensionable, fullscreen con F11), carga `src/index.html`, sin menú nativo.
- [ ] `electron/preload.js` (por ahora vacío; hook para IPC de Steam en Fase 4).
- [ ] `contextIsolation: true`, `nodeIntegration: false` (seguridad estándar).
- [ ] Script `npm start` → `electron .`.
- [ ] Icono de ventana provisorio (✈️ / el logo de RASANTE).
- [ ] Ajustar el canvas al tamaño de ventana manteniendo el pixel-perfect (integer scaling).
- [ ] Verificar: audio, teclado (flechas/V/turbo), mouse (mira), fullscreen.

**Hecho cuando:** `npm start` abre RASANTE en ventana y es jugable con teclado+mouse.
**Esfuerzo:** 1 sesión. **Depende de:** Fase 1.

---

## FASE 3 — Empaquetado con electron-builder (.exe)

**Objetivo:** un instalable/portable de Windows que corre sin Node.

- [ ] `npm i -D electron-builder`.
- [ ] Config `build` en `package.json`: `appId`, `productName: "RASANTE"`, target Windows
      **nsis** (instalador) + **portable** (exe suelto para pruebas).
- [ ] Iconos `.ico` (256×256) desde el arte del juego.
- [ ] `npm run dist` → genera `dist/RASANTE Setup x.y.z.exe` y el portable.
- [ ] Probar el `.exe` en limpio (idealmente otra máquina/VM Windows).
- [ ] (Opcional) target macOS/Linux si querés multiplataforma.

**Hecho cuando:** existe un `.exe` que instala y corre el juego jugable en Windows limpio.
**Esfuerzo:** 1 sesión. **Depende de:** Fase 2. **Nota:** firma de código Windows es opcional
al principio (SmartScreen puede advertir; se resuelve con un cert EV más adelante).

---

## FASE 4 — Integración Steamworks (SDK)

**Objetivo:** el juego "habla" con Steam (overlay, y opcional logros/cloud).

> ⚠️ **Gate:** necesito de vos el **App ID** (Fase de tu cuenta Steamworks) antes de arrancar.

- [ ] `npm i steamworks.js` (binding mantenido del Steamworks SDK).
- [ ] `steam_appid.txt` con el App ID en la raíz (solo para correr en dev).
- [ ] Inicializar Steam en `main.js`; exponer al renderer vía `preload.js` + IPC.
- [ ] Verificar que **abre el overlay de Steam** (Shift+Tab) sobre el juego.
- [ ] (Opcional) Definir **logros** (p. ej. "Primer derribo de barcaza", "Afterburner ×5",
      "Nivel 12 completado") y dispararlos desde el game loop.
- [ ] (Opcional) **Cloud saves** para el récord local (`localStorage` → archivo sincronizado).

**Hecho cuando:** el juego levanta con Steam corriendo, muestra el overlay y (si se hizo)
desbloquea un logro de prueba.
**Esfuerzo:** 1-2 sesiones. **Depende de:** Fase 3 + App ID tuyo.

---

## FASE 5 — Pipeline de release a Steam (SteamPipe)

**Objetivo:** poder subir builds a Steam de forma repetible.

> ⚠️ **Gate:** cuenta Steamworks activa, Steam Direct pagado, app creada, depots configurados.

- [ ] Instalar `steamcmd` y configurar los scripts de **SteamPipe** (`app_build.vdf`,
      `depot_build.vdf`).
- [ ] Script `npm run steam:build` → `electron-builder` + copia a la carpeta de contenido del depot.
- [ ] Subir a la rama **`beta`** de Steam primero (no `default`), probar el download desde el
      cliente de Steam.
- [ ] Checklist de store: capsule art, screenshots, descripción, tráiler, tags, edad, precio.
- [ ] Pasar el build de `beta` → `default` y **publicar** (lo apretás vos).

**Hecho cuando:** el juego se instala y corre **desde el cliente de Steam** (primero en beta).
**Esfuerzo:** 1-2 sesiones (+ tiempo de review de Steam). **Depende de:** Fase 4 + gates tuyos.

---

## FASE 6 — Mejoras desbloqueadas (post-migración)

Ya sin límite de tamaño ni de CSP. Se hacen **a demanda**, no en orden fijo:

- [ ] **three.js en el clímax del momentum**: barco 3D real + cabina, render a target de baja
      resolución y pixelado para respetar el estilo. (La charla que motivó todo esto.)
- [ ] Audio de calidad original en todo (ya recuperado en Fase 1).
- [ ] Sumar sprites que faltaban (soldados, aviones banking, explosiones, barcaza lateral) —
      ver `UPDATE_ANIMATIONS.md`.
- [ ] Soporte de **joystick** (Gamepad API) — ya estaba en el backlog.
- [ ] Resto de cinemáticas/niveles 2-12 (`NIVELES.md`).

**Depende de:** Fase 2 en adelante (con tener el shell de escritorio ya se puede empezar).

---

## Riesgos y notas

- **Pixel-perfect en ventana redimensionable:** usar integer scaling; si la ventana no es
  múltiplo exacto, dejar barras (letterbox) en vez de escalar borroso.
- **Firma de código Windows:** sin cert, SmartScreen advierte al instalar. Aceptable para un
  early access; cert EV cuesta y se puede sumar después.
- **steamworks.js vs greenworks:** vamos con `steamworks.js` (mantenido); `greenworks` está
  algo abandonado.
- **No perder el Artifact:** `build_web.py` mantiene la demo web viva en paralelo.
- **Tamaño del build:** ~150-250 MB (Chromium empaquetado). Normal en Steam, no es problema.

---

## Comandos de referencia (se irán llenando por fase)

```bash
# dev web (Fase 1)
python3 -m http.server 8475          # servir src/ para probar

# dev escritorio (Fase 2)
npm start                            # abre Electron

# build (Fase 3)
npm run dist                         # genera dist/*.exe

# build web para el Artifact (Fase 1)
python3 tools/build_web.py           # dist-web/index.html autocontenido
```

---

## Bitácora de ejecución

Registro append-only de cada micro-paso, para retomar tras un corte. El más reciente arriba.

| Fecha | Paso | Qué se hizo | Commit |
|-------|------|-------------|--------|
| 2026-07-19 | 0.1-0.4 | Rama `feature/electron`, `.gitignore`, `package.json` base (sin deps). Antes se commiteó en `main` el trabajo pendiente (cámaras, afterburner, fix frenazo). | (Fase 0) |

