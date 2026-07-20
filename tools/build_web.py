#!/usr/bin/env python3
"""Genera dist-web/index.html AUTOCONTENIDO (todo inline) desde src/ + assets/.

Se usa para publicar el Artifact web (demo/playtest): re-embebe CSS, JS y todos los
assets como data URI, produciendo un único archivo sin dependencias externas —
necesario porque el CSP del Artifact bloquea pedidos a archivos externos.

El desarrollo (y Electron) usan src/ con archivos sueltos; esto es solo el build web.

Uso:
    python3 tools/build_web.py        # escribe dist-web/index.html
"""
import base64, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'src'
ASSETS = ROOT / 'assets'
OUT = ROOT / 'dist-web' / 'index.html'

# (ruta relativa como aparece en game.js, archivo real, mime)   — mismo mapeo que extract_assets.py
IMG = [('cockpit_sky.png', 'image/png')]
PLANES = ['sky', 'dagger', 'supere', 'a4q', 'pampa']
# El juego usa mp3 originales; para la web se re-embebe la m4a comprimida de assets/audio/web/.
# Las pistas de adrenaline que no entran en el límite de 16 MB se DESCARTAN del build web ('').
WEB_AUDIO = {
    'lobby.mp3': 'lobby.m4a',
    'game.mp3': 'game.m4a',
    'story.mp3': 'story.m4a',
    'pmetal_himno.mp3': 'pmetal_himno.m4a',
    'pmetal_sanmartin.mp3': 'pmetal_sanmartin.m4a',
    'pmetal_soy_hincha.mp3': 'pmetal_soy_hincha.m4a',
}
WEB_DROP = [
    'pmetal_acero_blanco.mp3', 'pmetal_aundepie.mp3', 'pmetal_aurora.mp3',
    'pmetal_malvinas.mp3', 'pmetal_malvinas_2triumph.mp3', 'pmetal_revolucion_mayo.mp3',
    'pmetal_sangre_albiceleste.mp3', 'pmetal_soldado.mp3',
]


def uri(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()


def main():
    js = (SRC / 'game.js').read_text(encoding='utf-8')
    n = 0

    # re-embeber imagenes
    for fname, mime in IMG:
        old = f"'../assets/img/{fname}'"
        js2 = js.replace(old, "'" + uri(ASSETS / 'img' / fname, mime) + "'")
        n += (js2 != js); js = js2
    for key in PLANES:
        old = f'"../assets/img/plane_{key}.webp"'
        js2 = js.replace(old, '"' + uri(ASSETS / 'img' / f'plane_{key}.webp', 'image/webp') + '"')
        n += (js2 != js); js = js2
    # re-embeber audio: mp3 del juego -> m4a comprimida (o '' para las que no entran en la web)
    for mp3, m4a in WEB_AUDIO.items():
        old = f"'../assets/audio/{mp3}'"
        js2 = js.replace(old, "'" + uri(ASSETS / 'audio' / 'web' / m4a, 'audio/mp4') + "'")
        n += (js2 != js); js = js2
    for mp3 in WEB_DROP:
        js2 = js.replace(f"'../assets/audio/{mp3}'", "''")
        n += (js2 != js); js = js2

    # SFX con samples (assets/new_sounds/): NO entran en el bundle web — se vacia SFXB y el
    # sistema de sfx del juego se apaga solo (quedan los beeps procedurales de fallback)
    js2 = js.replace("const SFXB = '../assets/new_sounds/';", "const SFXB = '';   // web: sin samples, beeps de fallback")
    if js2 == js:
        raise SystemExit('ERROR: no encontre la constante SFXB en game.js (¿cambio el codigo?)')
    js = js2
    # normal map del agua: solo hace falta si MIRROR_SEA esta activo (hoy: apagado) — no se embebe
    js = js.replace("'../assets/img/waternormals.jpg'", "''")
    # fondos por clima (terrain_back): pesados para el bundle web — se apagan (cielo procedural)
    js = js.replace("const TBACK = '../assets/images/terrain_back/';", "const TBACK = '';   // web: cielo procedural")

    if '../assets/' in js:
        raise SystemExit('ERROR: quedaron rutas ../assets/ sin re-embeber en game.js')

    css = (SRC / 'styles.css').read_text(encoding='utf-8')
    three = (SRC / 'vendor' / 'three.global.js').read_text(encoding='utf-8')
    html = (SRC / 'index.html').read_text(encoding='utf-8')
    html = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css}</style>')
    html = html.replace('<script src="vendor/three.global.js"></script>', f'<script>\n{three}</script>')
    html = html.replace('<script src="game.js"></script>', f'<script>\n{js}</script>')

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
