#!/usr/bin/env bash
# Arma los PDF y los .docx de las dos partes de la versión de lectura.
#
#   bash produccion/hacer_pdf_lectura.sh
#
# Antes hay que correr:  python3 produccion/hacer_guion_lectura.py
#
# Dependencias:
#   pip install weasyprint markdown --break-system-packages
#   apt install pandoc            (para los .docx)
set -e
cd "$(dirname "$0")/.."
OUT="${1:-../guion_lectura}"
mkdir -p "$OUT"

# --- referencia de estilo para los .docx (se genera una vez) ---
if [ ! -f produccion/_ref.docx ]; then
  pandoc --print-default-data-file reference.docx > produccion/_ref.docx
fi

# --- HTML → PDF (weasyprint) ---
python3 produccion/_lectura_html.py historia/GUION_LECTURA.md \
  "Nota para el que lee" /tmp/g1.html "Guion de la campaña" $'\n# PRÓLOGO'
python3 produccion/_lectura_html.py historia/GUION_LECTURA_APENDICE.md \
  "Antes de empezar" /tmp/g2.html "Segunda parte · cómo está armado" $'\n## La idea'

python3 - "$OUT" << 'PY'
import sys
try:
    from weasyprint import HTML
except ImportError:
    sys.exit("\n  Falta weasyprint. Instalalo con:\n"
             "      pip install weasyprint markdown --break-system-packages\n"
             "  (los HTML ya quedaron en /tmp/g1.html y /tmp/g2.html si querés verlos)\n")
o = sys.argv[1]
HTML('/tmp/g1.html').write_pdf(o + '/RASANTE - El cuaderno de Mateo - 1 GUION.pdf')
HTML('/tmp/g2.html').write_pdf(o + '/RASANTE - El cuaderno de Mateo - 2 COMO ESTA ARMADO.pdf')
print("PDF listos en " + o)
PY

# --- .docx (pandoc) ---
if command -v pandoc > /dev/null; then
  pandoc historia/GUION_LECTURA.md -o "$OUT/RASANTE - El cuaderno de Mateo - 1 GUION.docx" \
    --reference-doc=produccion/_ref.docx --toc --toc-depth=2 -M toc-title="Índice" -V lang=es
  pandoc historia/GUION_LECTURA_APENDICE.md -o "$OUT/RASANTE - El cuaderno de Mateo - 2 COMO ESTA ARMADO.docx" \
    --reference-doc=produccion/_ref.docx -V lang=es
  echo "docx listos en $OUT"
else
  echo "pandoc no está instalado — se generaron solo los PDF"
fi
