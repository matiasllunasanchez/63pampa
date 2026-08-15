# -*- coding: utf-8 -*-
import re, markdown

import sys
SRC, MARCA, OUT, SUB, INICIO = sys.argv[1:6]
src = open(SRC, encoding="utf-8").read()

# ---------- separar portada / nota / cuerpo ----------
i_nota  = src.index("## " + MARCA)
i_body  = src.index(INICIO, i_nota)
nota_md = src[i_nota:i_body].replace("## " + MARCA + "\n", "", 1)
body_md = src[i_body:]

MD = lambda s: markdown.markdown(s, extensions=["tables", "sane_lists"])

nota_html = MD(nota_md)
body_html = MD(body_md)

# ---------- clases semánticas ----------
def clasifica(html):
    # páginas del cuaderno: blockquote
    html = html.replace("<blockquote>", '<blockquote class="cuaderno">')
    # diálogo: <p><strong>NOMBRE:</strong> ...
    html = re.sub(r'<p><strong>([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜa-záéíóúñü0-9 ,.()\'"—–-]{1,55}):</strong>',
                  r'<p class="dialogo"><span class="quien">\1</span>', html)
    # acotación: párrafo que empieza y termina en <em>
    def acot(m):
        inner = m.group(1)
        return '<p class="acotacion"><em>%s</em></p>' % inner
    html = re.sub(r'<p><em>(\(.*?\))</em></p>', acot, html, flags=re.S)
    html = re.sub(r'<p><em>(_?\(.*?\)_?)</em></p>', acot, html, flags=re.S)
    html = re.sub(r'<p>(\((?:(?!</p>).)*?\))</p>', r'<p class="acotacion"><em>\1</em></p>', html, flags=re.S)
    # cartel / cita destacada
    html = html.replace("<hr />", "")
    return html

nota_html = clasifica(nota_html)
body_html = clasifica(body_html)

# ---------- índice manual ----------
titulos = re.findall(r'(?m)^(#{1,2}) (.+)$', body_md)
idx_items = []
for lvl, txt in titulos:
    txt = txt.strip()
    if txt.startswith("MOVIMIENTO") or txt.startswith("PRÓLOGO") or txt.startswith("LOS DOS FINALES"):
        idx_items.append('<li class="idx-mov">%s</li>' % txt)
    elif txt.startswith("MISIÓN") or txt.startswith("FINAL ") or txt.startswith("Cierre común"):
        idx_items.append('<li class="idx-mis">%s</li>' % txt)
indice = "<ul class='indice'>" + "".join(idx_items) + "</ul>"

CSS = """
@page {
  size: A4;
  margin: 24mm 22mm 22mm 22mm;
  @bottom-center { content: counter(page); font-family: "DejaVu Sans Condensed"; font-size: 8pt; color: #8a8a86; }
  @top-right { content: string(seccion); font-family: "DejaVu Sans Condensed"; font-size: 7.5pt;
               letter-spacing: .09em; text-transform: uppercase; color: #a9a9a4; }
}
@page :first { @bottom-center { content: ""; } @top-right { content: ""; } }
@page portada { margin: 0; @bottom-center { content: ""; } @top-right { content: ""; } }

html { font-family: "Bitstream Charter", "DejaVu Serif", serif; font-size: 10.6pt;
       line-height: 1.52; color: #1d1d1b; hyphens: auto; }
p { margin: 0 0 .62em 0; text-align: justify; }

/* ---------- portada ---------- */
.portada { page: portada; height: 297mm; display: flex; flex-direction: column;
           justify-content: center; align-items: center; text-align: center;
           background: #15202b; color: #f2efe9; page-break-after: always; }
.portada .marca { font-family: "DejaVu Sans Condensed"; font-size: 46pt; font-weight: bold;
                  letter-spacing: .22em; margin: 0 0 4mm 0; text-indent: .22em; }
.portada .rule { width: 46mm; height: 2px; background: #c08a3e; margin: 5mm 0 7mm 0; }
.portada .sub { font-size: 21pt; font-style: italic; margin: 0 0 12mm 0; color: #f2efe9; }
.portada .meta { font-family: "DejaVu Sans Condensed"; font-size: 9.5pt; letter-spacing: .16em;
                 text-transform: uppercase; color: #9fb0c0; line-height: 2.1; }

/* ---------- nota e índice ---------- */
.seccion-frente { page-break-after: always; }
h1.frente { font-family: "DejaVu Sans Condensed"; font-size: 15pt; letter-spacing: .13em;
            text-transform: uppercase; color: #15202b; border-bottom: 1.5px solid #c08a3e;
            padding-bottom: 2.5mm; margin: 0 0 7mm 0; }
.indice { list-style: none; padding: 0; margin: 0; column-count: 2; column-gap: 10mm; }
.indice li { break-inside: avoid; }
.idx-mov { font-family: "DejaVu Sans Condensed"; font-size: 9pt; letter-spacing: .1em;
           text-transform: uppercase; color: #15202b; margin: 4mm 0 1.5mm 0; }
.idx-mis { font-size: 10pt; color: #4a4a46; margin: 0 0 .9mm 3mm; }

/* ---------- cuerpo ---------- */
h1 { string-set: seccion content(); font-family: "DejaVu Sans Condensed"; font-size: 20pt;
     font-weight: bold; letter-spacing: .13em; text-transform: uppercase; color: #15202b;
     page-break-before: always; margin: 0 0 9mm 0; padding-bottom: 3mm;
     border-bottom: 2.5px solid #c08a3e; text-align: left; }
h2 { string-set: seccion content(); font-family: "DejaVu Sans Condensed"; font-size: 14pt;
     font-weight: bold; letter-spacing: .06em; color: #15202b;
     page-break-after: avoid; margin: 8mm 0 6mm 0;
     padding-bottom: 2mm; border-bottom: 1px solid #d8d4cb; }
h2.rompe { page-break-before: always; margin-top: 0; }
h2.sigue { page-break-before: auto; }

/* páginas divisorias de movimiento */
.divisor { page-break-before: always; page-break-after: always;
           height: 232mm; display: flex; flex-direction: column;
           justify-content: center; align-items: center; text-align: center; }
h1.divh { string-set: seccion content(); font-family: "DejaVu Sans Condensed";
          font-size: 26pt; font-weight: bold; letter-spacing: .18em; text-transform: uppercase;
          color: #15202b; border: none; border-top: 2.5px solid #c08a3e;
          border-bottom: 2.5px solid #c08a3e; padding: 7mm 0; margin: 0;
          page-break-before: auto; text-align: center; }
h3 { font-family: "DejaVu Sans Condensed"; font-size: 9.6pt; font-weight: bold;
     letter-spacing: .13em; text-transform: uppercase; color: #8a6a2f;
     page-break-after: avoid; margin: 7mm 0 2.6mm 0; }
h4 { font-size: 10.5pt; font-style: italic; page-break-after: avoid; margin: 5mm 0 2mm 0; }

/* diálogo */
p.dialogo { margin: 0 0 .55em 0; padding-left: 7mm; text-indent: -7mm; text-align: left; }
.quien { font-family: "DejaVu Sans Condensed"; font-weight: bold; font-size: 9.2pt;
         letter-spacing: .07em; text-transform: uppercase; color: #15202b; }
.quien::after { content: " ·"; color: #c08a3e; }

/* acotaciones */
p.acotacion { font-style: italic; color: #5c5c56; font-size: 9.9pt; margin: .35em 0 .8em 0;
              text-align: left; }

/* páginas del cuaderno */
blockquote.cuaderno { margin: 4.5mm 0 5mm 0; padding: 3.5mm 5mm 1.2mm 6mm;
                      border-left: 2.5px solid #c08a3e; background: #faf7f0;
                      page-break-inside: avoid; }
blockquote.cuaderno p { font-style: italic; font-size: 10.3pt; color: #33322e;
                        text-align: left; margin-bottom: .5em; }
blockquote.cuaderno strong { font-style: normal; }

/* tablas */
table { border-collapse: collapse; width: 100%; margin: 4mm 0 6mm 0; font-size: 8.8pt;
        page-break-inside: avoid; }
th { font-family: "DejaVu Sans Condensed"; font-size: 8pt; letter-spacing: .07em;
     text-transform: uppercase; text-align: left; background: #15202b; color: #f2efe9;
     padding: 2mm 2.5mm; }
td { padding: 1.7mm 2.5mm; border-bottom: .5px solid #ddd9d0; vertical-align: top; }
tr:nth-child(even) td { background: #faf9f6; }

ul, ol { margin: 0 0 .7em 0; padding-left: 6mm; }
li { margin-bottom: .3em; text-align: left; }
strong { font-weight: bold; }
em { font-style: italic; }
"""

PORTADA = """
<div class="portada">
  <div class="marca">RASANTE</div>
  <div class="rule"></div>
  <div class="sub">El cuaderno de Mateo</div>
  <div class="meta">
    %s<br/>
    Malvinas &middot; 1982<br/>
    Versión de lectura
  </div>
</div>
"""

html = """<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<style>%s</style></head><body>
%s
<div class="seccion-frente"><h1 class="frente">{MARCA}</h1>%s</div>
<div class="seccion-frente"><h1 class="frente">Índice</h1>%s</div>
%s
</body></html>""" % (CSS, PORTADA % SUB, nota_html, indice, body_html)

# salto de página SOLO en misiones, finales y cierre; el resto fluye
def h2class(m):
    txt = m.group(1)
    rompe = txt.startswith("MISI") or txt.startswith("FINAL ") or txt.startswith("Cierre com")
    return '<h2 class="%s">%s</h2>' % ("rompe" if rompe else "sigue", txt)
html = re.sub(r'<h2>(.*?)</h2>', h2class, html, flags=re.S)

# páginas divisorias de movimiento
def h1div(m):
    txt = m.group(1)
    if txt.startswith("MOVIMIENTO") or txt.startswith("LOS DOS FINALES"):
        return '<div class="divisor"><h1 class="divh">%s</h1></div>' % txt
    return '<h1>%s</h1>' % txt
html = re.sub(r'<h1>(.*?)</h1>', h1div, html, flags=re.S)

html = html.replace("{MARCA}", MARCA)
open(OUT, "w", encoding="utf-8").write(html)
print("HTML listo:", len(html), "bytes ·", len(idx_items), "entradas de índice")
