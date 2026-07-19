#!/usr/bin/env python3
"""Extrae los assets embebidos como data URI en index.html a archivos sueltos.

Es la operación INVERSA de embed_asset.py: garantiza comportamiento byte-idéntico al
juego actual porque escribe exactamente los mismos bytes que hoy están inline.

Uso:
    python3 tools/extract_assets.py            # extrae todo a assets/img y assets/audio
    python3 tools/extract_assets.py --check    # solo reporta qué encontraría, sin escribir

Salida:
    assets/img/cockpit_sky.png
    assets/img/plane_<key>.webp   (sky, dagger, supere, a4q, pampa)
    assets/audio/<name>.m4a       (lobby, game, story, adr1, adr2, adr3)
"""
import base64, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / 'index.html'
IMG = ROOT / 'assets' / 'img'
AUD = ROOT / 'assets' / 'audio'


def decode_to(uri, dest):
    b64 = uri.split('base64,', 1)[1]
    dest.parent.mkdir(parents=True, exist_ok=True)
    data = base64.b64decode(b64)
    dest.write_bytes(data)
    return len(data)


def main():
    check = '--check' in sys.argv
    html = INDEX.read_text(encoding='utf-8')
    jobs = []   # (nombre legible, destino, uri)

    # cockpit (PNG)
    m = re.search(r"const COCKPIT_ASSET = \{ src: '(data:image/png;base64,[^']*)'", html)
    if m:
        jobs.append(('cockpit', IMG / 'cockpit_sky.png', m.group(1)))

    # aviones (webp) — cada entrada de PLANES tiene key + src
    for km in re.finditer(r"\{ key: '(\w+)', name: '[^']*', src: \"(data:image/webp;base64,[^\"]*)\"", html):
        jobs.append((f'plane_{km.group(1)}', IMG / f'plane_{km.group(1)}.webp', km.group(2)))

    # musica (m4a / audio-mp4) — MUSIC_LOBBY, GAME, STORY, ADR1..N (ignora las vacias '')
    for mm in re.finditer(r"const MUSIC_(\w+) = '(data:audio/mp4;base64,[^']*)'", html):
        name = mm.group(1).lower()
        jobs.append((f'music_{name}', AUD / f'{name}.m4a', mm.group(2)))

    if not jobs:
        sys.exit('ERROR: no se encontro ningun asset embebido (¿cambió el formato del código?)')

    for name, dest, uri in jobs:
        if check:
            kb = (len(uri) * 3 // 4) // 1024
            print(f'  [check] {name:16} -> {dest.relative_to(ROOT)} (~{kb} KB)')
        else:
            kb = decode_to(uri, dest) // 1024
            print(f'  OK {name:16} -> {dest.relative_to(ROOT)} ({kb} KB)')

    print(f'\n{"Encontrados" if check else "Extraídos"}: {len(jobs)} assets.')


if __name__ == '__main__':
    main()
