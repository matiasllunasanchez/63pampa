# Subir RASANTE a Steam

Todo está armado. Hasta que el juego esté terminado solo hace falta la **parte A**, una sola vez.
La **parte B** es para cuando haya que subir un build.

## A. Una sola vez, en Steamworks (partner.steamgames.com → RASANTE)

1. **App ID:** es el número de la app, en la URL y al lado del nombre.
2. **Depots:** en *SteamPipe → Depots*, dejá **dos**:
   - uno con *Sistema operativo: Windows*;
   - otro con *Sistema operativo: macOS*.
   Si hay uno solo, *Agregar nuevo depot*. Anotá los dos números.
3. **Rama beta:** en *SteamPipe → Builds → Administrar ramas*, creá la rama `beta`. Ponele
   contraseña si querés que solo la vean los que la tengan.
4. **Opciones de lanzamiento:** en *Instalación → General*, cargá dos:
   - *Ejecutable* `RASANTE.exe`, *Sistema operativo* Windows;
   - *Ejecutable* `RASANTE.app`, *Sistema operativo* macOS.
   En *Carpeta de instalación* poné `RASANTE`.
5. **Publicar:** en *Publicar*, publicá esos cambios. Los cambios de Steamworks no valen hasta
   que se publican.
6. **El archivo de configuración:** completá `steam/config.json` con:
   - `appId`, `depotWindows` y `depotMac`;
   - `usuario`, que es tu usuario de Steam (el de login, no el nombre visible).
7. **steamcmd** (la herramienta de Valve para subir), bajado directo de Valve a `~/steamcmd`. El de
   Homebrew no sirve en Mac: el Gatekeeper le traba `Breakpad.framework`.

   ```bash
   mkdir -p ~/steamcmd && curl -sqL https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz | tar zxvf - -C ~/steamcmd
   ```

## B. Cada vez que se sube un build

1. Subí la `version` del `package.json` si querés, por ejemplo `0.1.0` → `0.2.0`.
2. Armá los dos depots:

   ```bash
   npm run steam:build
   ```

   Empaqueta la versión FULL (sin PRÓXIMAMENTE) para Windows x64 y Mac universal, con el App ID
   adentro. Deja todo en `steam/contenido/` y escribe los scripts de SteamPipe en `steam/generado/`.
3. Subí:

   ```bash
   npm run steam:subir
   ```

   - La primera vez te pide la contraseña y el código de Steam Guard, en la terminal.
   - Con `rama` vacía (como está) sube sin ponerlo en ninguna rama, y lo ponés en `default` a mano
     (paso 5). Con `rama: "beta"` queda puesto solo en esa rama.
4. **Probar en beta (opcional):** si lo subiste a `beta`, en tu Steam andá a *Biblioteca → RASANTE →
   Propiedades → Betas*, elegí `beta` y abrilo desde Steam.
5. **Pasar a la rama pública:** cuando ande, en *SteamPipe → Builds*, poné ese build en
   `default`. Se hace siempre a mano, nunca desde el script.

## Versión cerrada para amigos y familia (Playtest)

Mientras el juego no se lanza, la prueba cerrada va por **Steam Playtest**: es una app aparte, con
su propio App ID y sus propios depots, y vos elegís quién entra. En `config.json` van los números
del **Playtest**, no los de RASANTE. Lo que sube a `default` del Playtest es lo que bajan ellos.

## Qué hace Steam dentro del juego

`electron/steam.js`:

- **Cuándo está prendido:** solo en el build de Steam. En `npm start`, `full-demo` y los builds de
  amigos no hace nada.
- **Si Steam está cerrado o algo falla:** el juego arranca igual.
- **Si se abre con doble click en vez de desde Steam:** Steam lo relanza.
- **Overlay** (Shift+Tab): apagado en Windows y en Mac, porque bajaba los FPS. En Mac el juego le
  saca a Steam la inyección del overlay antes de abrir sus procesos.
- **Logros:** la página puede llamar `window.rasanteSteam.logro('API_NAME')`. Los logros se
  definen en Steamworks (*Stats y logros*). Todavía no hay ninguno enganchado en el juego.
- **Probarlo sin empaquetar:** con Steam abierto y logueado,

  ```bash
  npm run steam:probar
  ```

  Si `config.json` no tiene App ID usa el 480 (Spacewar, la app de prueba de Valve).

## Pendiente para el lanzamiento

- **Firma y notarización de Mac:** el `.app` no está firmado con un Developer ID de Apple. Desde
  Steam suele abrir igual, porque Steam no marca la descarga como de internet. Si a alguien no le
  abre, hace falta la cuenta de Apple Developer (USD 99/año) para firmar y notarizar.
- **Precio** y **logros** (opcionales).
