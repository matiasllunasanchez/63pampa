#!/usr/bin/env python3
"""Chequea la sintaxis del <script> de index.html.

Neutraliza los data URIs (base64 gigantes) y corre `node --check` sobre el resto.
Uso:  python3 tools/check_syntax.py
"""
import pathlib, re, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / 'index.html').read_text(encoding='utf-8')
m = re.search(r'<script>(.*)</script>', html, re.S)
if not m:
    sys.exit('ERROR: no encontre el <script> en index.html')
js = re.sub(r'"data:[^"]*"', '""', m.group(1))

with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
    f.write(js); tmp = f.name
r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
print(r.stderr or 'SINTAXIS OK')
sys.exit(r.returncode)
