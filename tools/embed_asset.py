#!/usr/bin/env python3
"""Embebe un asset como data URI dentro de index.html (juego autocontenido, sin build).

Uso:
    python3 tools/embed_asset.py cockpit assets/cockpit.png     # embebe/reemplaza el cockpit
    python3 tools/embed_asset.py cockpit --clear                # vuelve al placeholder por codigo

Claves disponibles (una por asset configurable del juego):
    cockpit   -> COCKPIT_ASSET.src   (marco de cabina del MOMENTUM; centro transparente)
    obj_port  -> OBJ_ASSETS.port.src  (icono del puerto en la barra de objetivo)
    obj_barge -> OBJ_ASSETS.barge.src (icono de la barcaza en la barra de objetivo)
    obj_plane -> OBJ_ASSETS.plane.src (avioncito que avanza por la barra de objetivo)

El script es idempotente: correrlo de nuevo reemplaza el data URI anterior.
Formatos: .png / .webp / .gif / .jpg (PNG o WebP con transparencia recomendado).
"""
import base64, mimetypes, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / 'index.html'

# clave -> regex que captura (prefijo)src:'...'  dentro de la definicion correcta.
# Cada patron ancla en el nombre de la constante para no pisar otro asset.
MARKERS = {
    'cockpit':     r"(const COCKPIT_ASSET = \{ src:)'[^']*'",
    'obj_port':    r"(port:\s*\{ src:)'[^']*'",
    'obj_barge':   r"(barge:\s*\{ src:)'[^']*'",
    'obj_plane':   r"(plane:\s*\{ src:)'[^']*'",
    # musica: comillas tolerantes (['\"]) porque el embebido original usaba dobles y el tool escribe simples
    'music_story': r"(const MUSIC_STORY = )[\"'][^\"']*[\"']",   # pista de las pantallas de HISTORIA
    'music_lobby': r"(const MUSIC_LOBBY = )[\"'][^\"']*[\"']",   # musica del lobby
    'music_game':  r"(const MUSIC_GAME = )[\"'][^\"']*[\"']",    # musica de juego base (campaña)
    'adr1': r"(const MUSIC_ADR1 = )[\"'][^\"']*[\"']",           # pool ADRENALINA (supervivencia/ciclo, m4a AAC)
    'adr2': r"(const MUSIC_ADR2 = )[\"'][^\"']*[\"']",
    'adr3': r"(const MUSIC_ADR3 = )[\"'][^\"']*[\"']",
    'adr4': r"(const MUSIC_ADR4 = )[\"'][^\"']*[\"']",
}

def main():
    if len(sys.argv) < 3 or sys.argv[1] not in MARKERS:
        print(__doc__); sys.exit(1)
    key, arg = sys.argv[1], sys.argv[2]

    if arg == '--clear':
        uri = ''
    else:
        f = pathlib.Path(arg)
        if not f.is_file():
            sys.exit(f'ERROR: no existe {f}')
        # audio: mime FIJO por extension — guess_type devuelve 'audio/mp4a-latm' para .m4a,
        # que los browsers NO reconocen en <audio> (bug que dejo mudo al juego el 19/7)
        AUDIO_MIME = {'.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav'}
        mime = AUDIO_MIME.get(f.suffix.lower()) or mimetypes.guess_type(f.name)[0] or 'image/png'
        uri = f'data:{mime};base64,' + base64.b64encode(f.read_bytes()).decode()

    html = INDEX.read_text(encoding='utf-8')
    pat = re.compile(MARKERS[key])
    if not pat.search(html):
        sys.exit(f'ERROR: no encontre el marcador de "{key}" en index.html (cambio el codigo?)')
    html = pat.sub(lambda m: m.group(1) + f"'{uri}'", html, count=1)
    INDEX.write_text(html, encoding='utf-8')

    kb = len(uri) // 1024
    print(f'OK: {key} {"limpiado (placeholder por codigo)" if not uri else f"embebido ({kb} KB base64) desde {arg}"}')
    print('Verifica con:  python3 tools/check_syntax.py')

if __name__ == '__main__':
    main()
