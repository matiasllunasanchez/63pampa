# PLAN — Medidas antipiratería para la publicación en Steam

Complementa a [PLAN_ELECTRON_STEAM.md](PLAN_ELECTRON_STEAM.md) (Fases 4 y 5, hoy pausadas por
decisión del usuario). Mismo formato: fases autocontenidas, gates marcados, y lo que hace falta de
vos separado de lo que se puede hacer por código.

> **ESTO ES UN PLAN BASE, no un cronograma.** El juego **todavía no está terminado**: nada de acá
> se ejecuta ahora. Sirve para tener las decisiones tomadas y los gates identificados desde
> temprano — sobre todo los que cuestan plata o tiempo de terceros (App ID, certificados de firma),
> que son los que aparecen justo cuando querés publicar y te frenan semanas.
>
> **Revisar este documento cuando el juego esté terminado y la publicación en Steam sea real.**
> Para entonces algunas versiones y APIs habrán cambiado, y probablemente haya contenido nuevo
> (campaña completa, más aviones) que cambie qué tiene sentido recortar en una demo.

---

## ▶ La conclusión incómoda, primero

**RASANTE es una app Electron: el juego viaja como JavaScript.** El `app.asar` no es cifrado —
es un contenedor tipo tar que se abre con un comando (`npx asar extract`). Cualquier medida que
implementemos se apoya sobre eso.

Eso significa que **el objetivo realista NO es "que no se pueda piratear"**. Es otro, y sí es
alcanzable:

1. **Que no se copie por comodidad.** El grueso de la pérdida de un indie no es el grupo que
   crackea: es "pasame la carpeta". Eso se corta con una medida de una línea.
2. **Que el crack llegue tarde.** Para un indie, las primeras 2-4 semanas son la mayor parte de
   las ventas. Encarecer el crack no lo evita: lo demora, que es donde está el dinero.
3. **Que el que pagó no sufra nada.** La mayoría de los desastres de DRM en juegos chicos no
   vienen del pirata: vienen del comprador legítimo que no pudo jugar offline, o cuyo antivirus
   borró el ejecutable.

Todo lo que sigue está ordenado por **relación costo/beneficio real**, no por cuán sofisticado suena.

---

## ⚠ FASE 0 — El build web: herramienta interna, no canal de distribución

**El dato:** `dist-web/index.html` pesa 14,4 MB y es el **juego completo en un solo archivo
autocontenido**, sin ningún tipo de protección. Lo genera `tools/build_web.py` embebiendo código y
assets como data URI. Publicado en una URL pública, **cualquiera hace "Guardar como" y se queda con
el juego entero** — sin crackear nada, sin pasar por Steam.

**Por qué existe todavía, si el target es Electron + Steam.** No es una estrategia de distribución:
es un remanente útil de antes de la migración, y hoy cumple dos funciones internas:

1. **Es parte de la red de tests.** `npm run check` corre `build:web` **y un segundo smoke sobre el
   HTML generado**. Ese camino de empaquetado distinto detecta bugs que el de Electron no ve —
   típicamente assets que no quedaron bien embebidos. **Sacarlo debilitaría el gate**, así que el
   build se queda.
2. **Playtest rápido:** abrir el juego en cualquier máquina o pasarle un link a alguien sin que
   instale nada.

**La regla, entonces, es de publicación y no de código:**

- [ ] **El build completo NO va a una URL pública.** Queda como herramienta interna y para
      playtesters concretos. Cero trabajo: es dejar de publicarlo.
- [ ] Antes de publicar en Steam, **revisar que no haya quedado colgado** ningún Artifact viejo con
      el juego completo (los publicados siguen vivos aunque no los uses).
- [ ] **Decisión diferida a cuando el juego esté terminado:** si querés una demo pública, se hace
      **entonces** y con el contenido definitivo a la vista.

**Si más adelante hacés demo pública, la clave técnica es esta:** el recorte tiene que ser **por
ausencia, no por bandera**. Un `if (DEMO)` en JavaScript se borra en diez segundos con el inspector.
`build_web.py` tiene que **no embeber** las misiones y assets que no van: lo que no está en el
archivo no se puede desbloquear. (Steam además soporta la demo como app aparte, que es el camino
natural una vez que estés publicando ahí.)

**Hecho cuando:** no hay ninguna URL pública con el juego completo. **Esfuerzo:** ninguno hoy.
**Depende de:** nada.

---

## FASE 1 — Baseline de Steam (lo estándar, barato y efectivo)

**Objetivo:** que copiar la carpeta instalada y pasársela a alguien no funcione.

- [ ] `steamworks.js` en `electron/main.js`: **`restartAppIfNecessary(appId)`** antes de crear la
      ventana. Si alguien ejecuta el binario sin Steam o sin ser dueño, se relanza a través de
      Steam (y si no hay licencia, no abre). **Esta línea sola cubre el caso "pasame la carpeta"**,
      que es la mayor parte del leak real de un juego chico.
- [ ] Inicialización de la API con salida limpia y **mensaje amable** si falla (no acusatorio: el
      que ve ese cartel casi siempre es un comprador con Steam cerrado).
- [ ] **Steam DRM wrapper** (`drmwrap`) al subir por SteamPipe. Valve mismo lo describe como una
      capa fina y recomienda no depender de ella: sirve como piso, no como plan.
- [ ] Verificar que **el modo offline de Steam funciona**. Innegociable: romperlo genera reviews
      negativas y reembolsos de gente que pagó.

> ⚠ **Gate:** necesita el **App ID** de Steamworks — el mismo gate que ya frena la Fase 4 de
> [PLAN_ELECTRON_STEAM.md](PLAN_ELECTRON_STEAM.md).

**Hecho cuando:** el juego abre desde Steam, no abre copiado a otra máquina sin licencia, y anda
en modo offline. **Esfuerzo:** 1 sesión. **Depende de:** App ID.

---

## FASE 2 — Endurecer el paquete (subir el costo del crack)

**Objetivo:** que saltear la Fase 1 sea trabajo, no un rato.

- [ ] **Firma de código.** Windows Authenticode + notarización de Apple. **Doble beneficio, y el
      primero importa más:** sin firma, SmartScreen y Gatekeeper le tiran un cartel de amenaza a
      **tu comprador**; con firma, además, cualquier build modificado pierde la validez.
      ⚠ **Gate tuyo:** certificado de firma (~USD 200-400/año) + cuenta Apple Developer (USD 99/año).
- [ ] **Validación de integridad del ASAR** (fuse `EnableEmbeddedAsarIntegrityValidation` de
      Electron, configurable desde electron-builder). Impide modificar `app.asar` sin invalidar el
      binario — que es exactamente la vía por la que un crack quita el chequeo de Steam.
- [ ] **El bundle deja de viajar como texto legible:** compilar `game.bundle.js` a bytecode V8
      (bytenode) o, como mínimo, minificar y ofuscar con lo que ya tenemos (esbuild). No es
      cifrado y se puede desensamblar — pero convierte "abrir el archivo y borrar tres líneas" en
      un rato de trabajo real.
- [ ] Chequeo de integridad al arrancar (hash del bundle) en un punto que no sea un único `if`.

> ⚠ **Lo que NO hay que hacer acá:** packers/protectores comerciales tipo Themida o VMProtect.
> En apps Electron disparan **falsos positivos de antivirus** con frecuencia, y un juego que
> Windows Defender borra al instalarlo pierde más plata en reviews que la que salva en piratería.

**Hecho cuando:** el `.exe` y el `.app` están firmados, el asar no se puede tocar, y el JS no se
lee en un editor de texto. **Esfuerzo:** 2 sesiones. **Depende de:** Fase 1 + tus certificados.

---

## FASE 3 — Comportamiento ante copias no autorizadas (con criterio)

**Objetivo:** que romper la protección no dé una experiencia limpia. Acá hay que ser prolijo,
porque es donde se lastima al cliente por accidente.

- [ ] Que el resultado del chequeo de licencia **no se consuma en el mismo lugar donde se hace**
      (un solo `if` es un solo parche).
- [ ] **Degradación suave, nunca acusación.** El patrón que funcionó en varios indies no es un
      cartel de "COPIA PIRATA": es que la partida se vuelva rara de un modo que se comente
      (combustible que no rinde, radar que siempre te ve). Es legal, es tu producto, y convierte
      el crack en mala publicidad para el crack.
      ⚠ **Riesgo real que hay que aceptar antes de hacerlo:** todo falso positivo cae sobre alguien
      que pagó, y llega como review negativa de un bug que no existe. Si se implementa, tiene que
      ser **imposible de disparar sin que el chequeo de Steam haya fallado de verdad**.
- [ ] Nada de telemetría oculta, nada de requerir internet, nada de escribir fuera de la carpeta
      de datos de la app.
- [ ] **Declarar cualquier DRM de terceros en la ficha de Steam** (Valve lo exige).

**Hecho cuando:** una copia sin licencia no da una experiencia completa y **ninguna ruta legítima**
puede caer ahí. **Esfuerzo:** 1 sesión. **Depende de:** Fase 1.

---

## FASE 4 — Lo no técnico (donde está la plata de verdad)

**Para un indie, el mercado gris de keys suele sacar más ingresos que la piratería** — y encima
genera contracargos que te cobran a vos.

- [ ] **Política de Steam keys restrictiva:** pedir pocas, solo prensa y creadores, entregadas por
      plataformas que verifican identidad (Keymailer, Curator Connect) en vez de repartir keys
      sueltas. Las keys revendidas suelen venir de tarjetas robadas: te llega el contracargo y la
      comisión.
- [ ] **Precios regionales coherentes** (Steam los sugiere). Los saltos grandes entre regiones son
      lo que alimenta la reventa.
- [ ] **Monitoreo + DMCA:** buscar "RASANTE" en los sitios de repacks una vez por mes y tener la
      plantilla de takedown lista. Es media hora al mes.
- [ ] **EULA y términos** en la ficha.
- [ ] **Decidir la postura pública.** A varios indies les rindió mejor no perseguir y hablar del
      tema con humor que montar una cruzada. Es una decisión de marca, y conviene tomarla antes de
      que aparezca el primer repack, no después.

**Hecho cuando:** hay política de keys escrita y una rutina de monitoreo. **Esfuerzo:** continuo.
**Depende de:** la ficha publicada.

---

## Tabla de realidad (qué frena cada cosa)

| medida | costo | frena | NO frena |
|---|---|---|---|
| No publicar el build web completo | gratis | que el juego entero esté colgado gratis | nada más |
| `restartAppIfNecessary` | 1 línea | copiar la carpeta, prestarla, subirla entera | a alguien que edite el JS |
| Steam DRM wrapper | gratis | copia directa del binario | a un grupo de crackeo (minutos) |
| Firma de código | USD/año | tampering silencioso + **el susto de SmartScreen a tu comprador** | la ejecución de un build recrackeado |
| Integridad del ASAR | 1 sesión | inyectar/parchear el paquete | extraer y rearmar el proyecto |
| Bytecode/ofuscación | 1-2 sesiones | el parche casero de 10 minutos | a quien sepa lo que hace |
| Política de keys | tiempo | reventa gris y contracargos | piratería |

**Traducción honesta:** las dos primeras filas te dan el 80% del beneficio a costo casi cero. Las
del medio compran tiempo. Ninguna hace el juego incrackeable, y perseguir eso en Electron es tirar
sesiones a un pozo.

---

## Lo que NO vamos a hacer (y por qué)

- **DRM siempre-online.** Rompe el modo offline de Steam, es la causa #1 de reviews negativas por
  DRM, y se saltea igual.
- **Denuvo.** El costo no cierra ni de cerca para un juego de este tamaño, y arrastra su propia
  mala prensa.
- **Packers comerciales.** Falsos positivos de antivirus sobre Electron.
- **Acusar en pantalla.** El que lee ese cartel suele ser un cliente con Steam cerrado.

---

## Gates tuyos (sin esto no se puede avanzar)

1. **App ID de Steamworks** (Fase 1) — el mismo que ya frena la Fase 4 del plan de Electron.
2. **Certificados de firma** (Fase 2): Authenticode (~USD 200-400/año) + Apple Developer (USD 99/año).
   **Estos tienen tiempos de terceros** (validación de identidad, papeleo): son los que conviene
   empezar semanas antes de querer publicar, no el día que el juego esté listo.
3. **Postura pública y política de keys** (Fase 4).

## Orden sugerido

**Hoy: nada de código.** Lo único vigente es la regla de la Fase 0 (no publicar el build completo)
y tener presentes los gates que cuestan tiempo de terceros.

**Cuando el juego esté terminado y Steam sea real:** releer este plan completo, verificar versiones
y APIs, y ejecutar Fase 1 → 2 → 3 enganchado a las Fases 4-5 de
[PLAN_ELECTRON_STEAM.md](PLAN_ELECTRON_STEAM.md). La Fase 4 (keys, precios, monitoreo) arranca con
la ficha publicada y no termina nunca.

> Nota de implementación: las versiones y nombres exactos de las APIs (fuses de Electron,
> `steamworks.js`, opciones de electron-builder) hay que verificarlos contra la documentación
> vigente al momento de implementar — se mueven entre versiones.
