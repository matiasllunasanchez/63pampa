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
AUDIO = ['lobby', 'game', 'story', 'adr1', 'adr2', 'adr3']


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
    # re-embeber audio
    for name in AUDIO:
        old = f"'../assets/audio/{name}.m4a'"
        js2 = js.replace(old, "'" + uri(ASSETS / 'audio' / f'{name}.m4a', 'audio/mp4') + "'")
        n += (js2 != js); js = js2

    if '../assets/' in js:
        raise SystemExit('ERROR: quedaron rutas ../assets/ sin re-embeber en game.js')

    css = (SRC / 'styles.css').read_text(encoding='utf-8')
    html = (SRC / 'index.html').read_text(encoding='utf-8')
    html = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css}</style>')
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
