#!/usr/bin/env python3
"""Chequea la sintaxis del juego con `node --check` sobre src/game.js.

Desde la migración a src/ (Fase 1), el juego vive en src/game.js como JS plano
(sin wrapper HTML ni data URIs), así que se chequea directo.
Uso:  python3 tools/check_syntax.py
"""
import pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
js = ROOT / 'src' / 'game.js'
if not js.is_file():
    sys.exit(f'ERROR: no existe {js}')

r = subprocess.run(['node', '--check', str(js)], capture_output=True, text=True)
print(r.stderr or 'SINTAXIS OK')
sys.exit(r.returncode)
