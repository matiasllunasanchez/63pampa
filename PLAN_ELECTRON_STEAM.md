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
- **Última acción completada:** **Fase 2 COMPLETA** — shell de Electron funcionando. El juego
  carga en ventana nativa (verificado con smoke-test headless: canvas + assets + layout OK).
  Último commit `2209388`. Fecha: 2026-07-19.
- **PODÉS VERLO AHORA:** en tu Mac, `npm start` abre RASANTE en ventana. (Yo lo verifiqué
  headless porque no puedo abrir GUI en este entorno; la confirmación visual es tuya.)
- **PRÓXIMO PASO:** **Fase 3** — empaquetado con `electron-builder` → generar el `.exe` de
  Windows (`npm i -D electron-builder`, config `build` en package.json, iconos, `npm run dist`).
- **Pendiente no bloqueante:** icono de app (va con el empaquetado en Fase 3); warning de CSP
  de dev (hardening en Fase 3); republicar Artifact; sumar 8 adrenaline + audio original.
- **Cómo verificar dónde estás:** `git log --oneline -5` en `feature/electron` y mirá la
  Bitácora al final de este archivo.

---

## Estado global

| Fase | Título | Estado | Sesión |
|------|--------|--------|--------|
| 0 | Preparación y rama de trabajo | ✅ hecho | 2026-07-19 |
| 1 | Reestructuración (des-embeber assets + split de archivos) | ✅ hecho | 2026-07-19 |
| 2 | Shell de Electron (corre en ventana) | ✅ hecho | 2026-07-19 |
| 3 | Empaquetado con electron-builder (.exe) | ⬜ pendiente ← **SIGUIENTE** | — |
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

- [x] **1.1** Crear carpetas `src/`, `assets/img/`, `assets/audio/`. ✅ `25ecffe`
- [x] **1.2** Extraer imágenes embebidas → `assets/img/` (cockpit_sky.png + 5 aviones webp).
      Vía `tools/extract_assets.py` (bytes idénticos, sin tocar código). ✅ `25ecffe`
- [x] **1.3** Extraer audio embebido → `assets/audio/` (6 m4a: lobby/game/story/adr1-3). ✅ `25ecffe`
      NOTA: se extrajeron los m4a actuales para garantizar comportamiento idéntico. El upgrade a
      calidad original + las 8 pistas adrenaline que faltan se hace en un paso aparte (ver 1.6).
- [x] **1.4** Split de `index.html` → `src/index.html` + `src/styles.css` + `src/game.js`.
      Corre idéntico desde server local, sin errores de consola. ✅ `fe810ef`
- [x] **1.5** Imágenes por ruta relativa (`COCKPIT_ASSET.src`, 5 `PLANES[i].src`) →
      `../assets/img/*`. 0 data:image restantes; 6 assets HTTP 200. ✅ `f846ff1`
- [x] **1.6** Audio por ruta relativa (`MUSIC_LOBBY/GAME/STORY/ADR1-3`) → `../assets/audio/*.m4a`.
      0 data:audio; game.js 13.4 MB → 153 KB; lobby decodifica OK. ✅ `3771f41`
      (Las 8 pistas adrenaline + audio original quedan como feature aparte.)
- [x] **1.7** `tools/build_web.py`: `src/` + `assets/` → `dist-web/index.html` autocontenido
      (14.0 MB, bajo el límite de 16). Corre sin peticiones externas. ✅ `dbbbe9e`
- [x] **1.8** `src/` = única fuente: borrado `index.html` raíz y `tools/embed_asset.py`;
      `check_syntax.py` ahora chequea `src/game.js`. ✅ `c8b5663`
      NOTA: republicar el Artifact quedó pendiente (no urge, comportamiento idéntico).

**Hecho cuando:** el juego corre desde `src/` con assets sueltos **y** `build_web.py` genera un
`dist-web/index.html` idéntico en comportamiento. Republicar el Artifact desde ese build.
**Esfuerzo:** 1-2 sesiones (cortable en cualquier micro-paso). **Depende de:** Fase 0.

---

## FASE 2 — Shell de Electron (corre en ventana)

**Objetivo:** el juego abre en una ventana de escritorio nativa.

- [x] `npm i -D electron` (43.1.1). ✅ `2209388`
- [x] `electron/main.js`: BrowserWindow 1280×720 (16:9), sin menú, F11 fullscreen / Esc salir,
      `contextIsolation: true` / `nodeIntegration: false`, `loadFile(src/index.html)`. ✅
- [x] `electron/preload.js`: marca `body.electron` (hook para IPC de Steam en Fase 4). ✅
- [x] Script `npm start` → `electron .` (+ `build:web`). ✅
- [x] Canvas pixel-perfect que llena la ventana: `body.electron` letterbox 16:9, sin
      header/footer (regla scopeada; la web queda igual). Stage 1223×688 en ventana 1280×720. ✅
- [x] Verificado headless (smoke-test, ventana oculta): canvas bootea (640×360), 0 fallos de
      carga de assets, preload aplica la clase. ✅
- [ ] **PENDIENTE (visual, tuyo):** `npm start` en tu Mac y confirmar teclado/mouse/fullscreen.
- [ ] Icono de app → se hace en Fase 3 (con el empaquetado, `.ico`/`.icns`).
- [ ] Warning de CSP de dev → hardening en Fase 3 (meta CSP; verificar que no rompa el juego).

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
| 2026-07-19 | 2.1-2.4 | **Fase 2:** Electron 43.1.1; `electron/main.js` (BrowserWindow 1280×720, F11, sin menú, contextIsolation) + `preload.js` (body.electron); `npm start`; CSS fullscreen letterbox. Smoke-test headless RESULT OK (canvas + assets + layout). Falta confirmación visual con `npm start` (tuya). | `2209388` |
| 2026-07-19 | 1.8 | `src/` única fuente: borrado `index.html` raíz + `embed_asset.py`; `check_syntax.py` → `src/game.js`. **Fase 1 completa.** | `c8b5663` |
| 2026-07-19 | 1.7 | `tools/build_web.py` → `dist-web/index.html` autocontenido (14.0 MB). | `dbbbe9e` |
| 2026-07-19 | 1.6 | Audio → rutas `../assets/audio/*.m4a`. game.js 13.4 MB → 153 KB. | `3771f41` |
| 2026-07-19 | 1.5 | Imágenes → rutas `../assets/img/*`. 0 data:image. | `f846ff1` |
| 2026-07-19 | 1.4 | Split `index.html` → `src/` (html+css+js). Corre idéntico. | `fe810ef` |
| 2026-07-19 | 1.1-1.3 | Carpetas `src/`, `assets/img`, `assets/audio`. `tools/extract_assets.py` decodifica los data URI embebidos → 6 imágenes + 6 audios en archivos sueltos (bytes idénticos). Código aún usa los data URI inline. | `25ecffe` |
| 2026-07-19 | 0.1-0.4 | Rama `feature/electron`, `.gitignore`, `package.json` base (sin deps). Antes se commiteó en `main` el trabajo pendiente (cámaras, afterburner, fix frenazo). | `f6cbb40` |

