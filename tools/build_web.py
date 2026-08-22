#!/usr/bin/env python3
"""Genera dist-web/index.html AUTOCONTENIDO (todo inline) desde src/ + assets/.

Se usa para publicar el Artifact web (demo/playtest): re-embebe CSS, JS y todos los
assets como data URI, produciendo un único archivo sin dependencias externas —
necesario porque el CSP del Artifact bloquea pedidos a archivos externos.

El desarrollo (y Electron) usan src/ con archivos sueltos; esto es solo el build web.

Uso:
    python3 tools/build_web.py        # escribe dist-web/index.html
"""
import base64, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
ASSETS = ROOT / 'assets'
OUT = ROOT / 'dist-web' / 'index.html'

# AVIONES: cada uno vive en assets/planes/<slug>/ con sus archivos siempre igual nombrados
# (preview.webp|png, sheet.png, y cockpit.png el que lo tenga). Antes estaban todos sueltos en
# assets/img/ con el nombre embebido en el archivo, y agregar un avion tocaba tres listas.
# 'pampa' sigue en la lista aunque su entrada este COMENTADA en data/planes.js: los assets
# existen y se hornean igual, y dejarlo aca hace que descomentarlo sea de verdad una sola linea.
PLANE_DIRS = {'sky': 'a4-skyhawk', 'dagger': 'iai-dagger', 'supere': 'super-etendard',
              'a4q': 'a4q', 'pampa': 'pampa-63', 'mirage': 'mirage-5p'}
PLANE_PREVIEW_EXT = {'mirage': 'png'}     # el resto es webp
# El juego usa mp3 originales; para la web se re-embebe la m4a comprimida de assets/music/web/.
# Las pistas de adrenaline que no entran en el límite de 16 MB se DESCARTAN del build web ('').
WEB_AUDIO = {
    'lobby.mp3': 'lobby.m4a',
    'game.mp3': 'game.m4a',
    'story.mp3': 'story.m4a',
    'pmetal_himno.mp3': 'pmetal_himno.m4a',
    'pmetal_sanmartin.mp3': 'pmetal_sanmartin.m4a',
}
WEB_DROP = [
    # 'soy_hincha' SALE del pool web (26/7): el codigo del ARENA (el climax 3D de vuelo libre)
    # dejo el bundle 800 bytes SOBRE el tope de 16 MB del Artifact. Con la pista afuera quedan
    # ~2 MB de margen para lo que falta del arena. Prioridad declarada por el autor: Electron
    # primero, la web pierde si hay que elegir (ver docs/PROMPT_ARENA_VUELO_LIBRE.md).
    'pmetal_soy_hincha.mp3',
    'pmetal_acero_blanco.mp3', 'pmetal_aundepie.mp3', 'pmetal_aurora.mp3',
    'pmetal_malvinas.mp3', 'pmetal_malvinas_2triumph.mp3', 'pmetal_revolucion_mayo.mp3',
    'pmetal_sangre_albiceleste.mp3', 'pmetal_soldado.mp3',
]


def uri(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()


def main():
    # Se lee el BUNDLE, no game.js: al modularizar, game.js pasa a ser solo el entry y el codigo
    # real vive en varios modulos. El bundle es lo unico que los tiene a todos.
    # Lo regenera 'prebuild:web' antes de llegar aca. No se minifica, asi que los literales de
    # ruta ('../assets/...') sobreviven intactos y los reemplazos de abajo siguen funcionando.
    bundle = SRC / 'game.bundle.js'
    if not bundle.exists():
        raise SystemExit('ERROR: falta src/game.bundle.js — corre: npm run build:game')
    js = bundle.read_text(encoding='utf-8')
    n = 0

    # Los reemplazos son AGNOSTICOS A COMILLAS: esbuild normaliza '...' a "..." al bundlear,
    # asi que buscar el literal exacto con comilla simple fallaba en silencio.
    def sub_path(js, rel, replacement):
        """Reemplaza un literal de ruta (con cualquier comilla) por otro literal. Devuelve (js, hubo_cambio)."""
        pat = re.compile(r"""(['"])""" + re.escape(rel) + r"""\1""")
        out, k = pat.subn(lambda m: "'" + replacement + "'", js)
        return out, k > 0

    def sub_const(js, name, replacement, why):
        """Vacia una constante de ruta base (SFXB, TBACK). Revienta si ya no existe."""
        # const|var|let: esbuild convierte los const de modulo en var al aplanarlos en el bundle
        pat = re.compile(r"((?:const|var|let)\s+" + name + r"\s*=\s*)(['\"])[^'\"]*\2")
        out, k = pat.subn(lambda m: m.group(1) + "''   // web: " + why, js)
        if not k:
            raise SystemExit(f'ERROR: no encontre la constante {name} en el bundle (2cambio el codigo?)')
        return out

    # AVIONES: preview + hoja de sprites de cada uno, desde su propia carpeta
    for key, d in PLANE_DIRS.items():
        ext = PLANE_PREVIEW_EXT.get(key, 'webp')
        js, ok = sub_path(js, f'../assets/planes/{d}/preview.{ext}',
                          uri(ASSETS / 'planes' / d / f'preview.{ext}', 'image/' + ext)); n += ok
        js, ok = sub_path(js, f'../assets/planes/{d}/sheet.png',
                          uri(ASSETS / 'planes' / d / 'sheet.png', 'image/png')); n += ok
    # HOJA 2 (cabeceos empinados de las piruetas): NO entra en la web — son ~120 KB entre las 6 y
    # el render cae solo a las filas normales de la hoja base (ver data/planes.js). Se VACIA la
    # ruta para que `new Image()` no pida un archivo inexistente.
    for key, d in PLANE_DIRS.items():
        js, _ = sub_path(js, f'../assets/planes/{d}/sheet2.png', '')
    # cabina (momentum en primera persona): hoy solo la del A-4
    js, ok = sub_path(js, '../assets/planes/a4-skyhawk/cockpit.png',
                      uri(ASSETS / 'planes' / 'a4-skyhawk' / 'cockpit.png', 'image/png')); n += ok
    # INTERFAZ: emblema de las Malvinas (4a estrella) y hoja de miras (3x3)
    js, ok = sub_path(js, '../assets/ui/malvinas.webp', uri(ASSETS / 'ui' / 'malvinas.webp', 'image/webp')); n += ok
    js, ok = sub_path(js, '../assets/ui/miras.webp', uri(ASSETS / 'ui' / 'miras.webp', 'image/webp')); n += ok
    # ILUSTRACIONES de portada y de fin (assets/photos/{ppal,win,lose}/): NO entran en
    # el build web — son ~20 fotos y el Artifact tope 16 MB. Mismo criterio que TBACK. En
    # Electron/Steam si van; aca las pantallas caen al fondo opaco (drawEndBg/drawPpalBg lo
    # contemplan y `load` no pide nada si la ruta quedo vacia).
    # Se BARREN las carpetas en vez de listar nombres: agregar una foto no debe romper el build.
    for sub in ('ppal', 'win', 'lose'):
        d = ASSETS / 'photos' / sub
        if not d.is_dir():
            continue
        for p in sorted(d.iterdir()):
            if p.is_file() and not p.name.startswith('.'):
                js, _ = sub_path(js, f'../assets/photos/{sub}/{p.name}', '')
    # HOJAS DE ENEMIGOS (assets/world/enemies/): SI entran — son ~20 KB entre todas (frames de
    # 48-72 px) y sin ellas los enemigos caen al dibujo a mano. Se barre la carpeta: agregar un
    # enemigo horneado nuevo no debe tocar este script.
    d = ASSETS / 'world' / 'enemies'
    if d.is_dir():
        for p in sorted(d.iterdir()):
            if p.suffix == '.png':
                js, ok = sub_path(js, f'../assets/world/enemies/{p.name}', uri(p, 'image/png')); n += ok
    # NUBES del objetivo (assets/world/elements/fog1.png, ~120 KB): SI entra — es el banco que
    # esconde al buque en la aproximacion de campaña; sin ella caeria al dibujo procedural.
    js, ok = sub_path(js, '../assets/world/elements/fog1.png',
                      uri(ASSETS / 'world' / 'elements' / 'fog1.png', 'image/png')); n += ok
    # HOJAS DE SOLDADOS (~450 KB): NO entran en el build web — estamos a menos de 200 KB del tope
    # de 16 MB. En Electron/Steam si van; aca los soldados caen al dibujo a mano (render/world.js),
    # que es justamente para lo que existe el fallback de render/soldiers.js.
    js, _ = sub_path(js, '../assets/world/soldats/englishsoldatv2.png', '')
    js, _ = sub_path(js, '../assets/world/explosions/bomb.png', '')
    js, _ = sub_path(js, '../assets/world/explosions/explosions_front.png', '')

    # re-embeber audio: mp3 del juego -> m4a comprimida (o '' para las que no entran en la web)
    for mp3, m4a in WEB_AUDIO.items():
        js, ok = sub_path(js, f'../assets/music/{mp3}', uri(ASSETS / 'music' / 'web' / m4a, 'audio/mp4')); n += ok
    for mp3 in WEB_DROP:
        js, ok = sub_path(js, f'../assets/music/{mp3}', ''); n += ok

    # SFX con samples (assets/sfx/): NO entran en el bundle web — se vacia SFXB y el
    # sistema de sfx del juego se apaga solo (quedan los beeps procedurales de fallback)
    js = sub_const(js, 'SFXB', '', 'sin samples, beeps de fallback')
    # fondos por clima (terrain_back): pesados para el bundle web — se apagan (cielo procedural)
    js = sub_const(js, 'TBACK', '', 'cielo procedural')
    # normal map del agua: solo hace falta si MIRROR_SEA esta activo (hoy: apagado) — no se embebe
    js, _ = sub_path(js, '../assets/world/waternormals.jpg', '')
    # LAMINAS del guion (render/screens.js: '../assets/story/' + cuadro + '.png', aun sin
    # generar): NO entran en el build web — mismo criterio que las fotos de portada, pesarian
    # demasiado. Se rompe la BASE de la ruta con un data: invalido: el onerror del Image las
    # deja ocultas sin pedir archivos a la red. Electron/Steam las carga desde disco normal.
    js, ok = sub_path(js, '../assets/story/', 'data:,story-web-off/')
    if not ok:
        raise SystemExit('ERROR: no encontre la base ../assets/story/ en el bundle (cambio screens.js?)')
    # PLACAS y RETRATOS del modo historia (assets/plates/, assets/portraits/): mismo criterio
    # mientras no existan los assets. Cuando se generen, evaluar embeberlos (los retratos son
    # bustos chicos y probablemente entren en el presupuesto de 16 MB).
    # SKINS DE LOS FIELES (data/skins.js): NO entran — son 10 archivos de ~28 KB y el techo del
    # build web son 16 MB. Igual que plates/ y portraits/, la ruta la arma el JS concatenando,
    # asi que en el bundle sobrevive SOLO la base: se reemplaza por un data: muerto. `skinOf()`
    # devuelve null y el que dibuja cae a la hoja generica — en web los cinco Fieles se ven
    # iguales, que es exactamente el fallback para el que se diseño el modulo.
    js, ok = sub_path(js, '../assets/planes/a4-skyhawk/skin_', 'data:,skins-web-off/')
    if not ok:
        raise SystemExit('ERROR: no encontre la base de skins en el bundle (cambio data/skins.js?)')
    js, ok = sub_path(js, '../assets/plates/', 'data:,plates-web-off/')
    if not ok:
        raise SystemExit('ERROR: no encontre la base ../assets/plates/ en el bundle (cambio screens.js?)')
    js, ok = sub_path(js, '../assets/portraits/', 'data:,portraits-web-off/')
    if not ok:
        raise SystemExit('ERROR: no encontre la base ../assets/portraits/ en el bundle (cambio screens.js?)')

    if '../assets/' in js:
        raise SystemExit('ERROR: quedaron rutas ../assets/ sin re-embeber en game.js')

    css = (SRC / 'styles.css').read_text(encoding='utf-8')
    # TIPOGRAFIAS. En src/ estan declaradas TODAS las candidatas de assets/fonts/ (el banco de
    # pruebas del menu las compara en pantalla), pero al build web solo van las que el juego usa
    # de verdad: cada .ttf suma ~1.3x su peso en base64 y el Artifact tope 16 MB. Mismo criterio
    # que TBACK y las fotos de portada.
    # Las descartadas se BORRAN del CSS: si quedara el @font-face sin embeber, la pagina pediria
    # un archivo que no existe. El juego no se rompe — uiFont() cae al monospace cuando la familia
    # no cargo (ver render/ctx.js), asi que en la web el banco de pruebas simplemente no se ve.
    WEB_FONTS = {'Kirana', 'OtflagSans', 'EmbolismSpark', 'GlimpRThin'}
    def keep_face(m):
        fam = re.search(r"font-family:\s*'([^']+)'", m.group(0))
        return m.group(0) if fam and fam.group(1) in WEB_FONTS else ''
    css = re.sub(r"@font-face\s*\{[^}]*\}\s*", keep_face, css)

    MIME = {'.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2', '.woff': 'font/woff'}
    d = ASSETS / 'fonts'
    # rglob: las fuentes estan en subcarpetas por papel (simple/ = las de lectura)
    for p in sorted(d.rglob('*')) if d.is_dir() else []:
        if p.is_file() and p.suffix.lower() in MIME:
            rel = p.relative_to(ASSETS).as_posix()
            css = css.replace(f"url('../assets/{rel}')", "url('" + uri(p, MIME[p.suffix.lower()]) + "')")
    # misma red de seguridad que el bundle: si aparece un asset nuevo en el CSS y nadie lo
    # embebe, el build FALLA en vez de publicar una pagina que pide un archivo que no existe.
    if '../assets/' in css:
        raise SystemExit('ERROR: quedaron rutas ../assets/ sin re-embeber en styles.css')
    three = (SRC / 'vendor' / 'three.global.js').read_text(encoding='utf-8')
    html = (SRC / 'index.html').read_text(encoding='utf-8')
    html = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css}</style>')
    html = html.replace('<script src="vendor/three.global.js"></script>', f'<script>\n{three}</script>')
    html = html.replace('<script src="game.bundle.js"></script>', f'<script>\n{js}</script>')

    # el Artifact envuelve el contenido en <!doctype><head></head><body>: sacamos esos tags
    for tag in ('<!doctype html>', '<html lang="es">', '</html>', '<head>', '</head>', '<body>', '</body>'):
        html = html.replace(tag, '')
    html = '\n'.join(l for l in html.splitlines() if l.strip() != '') + '\n'

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding='utf-8')
    mb = OUT.stat().st_size / 1024 / 1024
    print(f'OK: {OUT.relative_to(ROOT)} ({mb:.1f} MB) — {n} assets re-embebidos')
    print(f'   límite Artifact: 16 MB {"✓" if mb < 16 else "✗ EXCEDE"}')


if __name__ == '__main__':
    main()
