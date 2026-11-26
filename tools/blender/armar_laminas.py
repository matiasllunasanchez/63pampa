# LAS LAMINAS DEL LIBRO DE VUELO (23/11/2026) — el paso final: de los renders crudos de Freestyle
# (hornear_laminas.py) a la lamina del monitor de fosforo: linea verde #5ef58a, un relleno apenas
# insinuado, el RESPLANDOR (el mismo dibujo, desenfocado, a baja opacidad) y fondo transparente, a
# 480x270. Ademas dibuja el MAPA (la costa del DEM real de src/data/islas_dem.js) y la hoja de contacto.
#
#   .venv-art/bin/python3 tools/blender/armar_laminas.py                 # todas (corre Blender)
#   .venv-art/bin/python3 tools/blender/armar_laminas.py kc130 mapa_invincible
#   .venv-art/bin/python3 tools/blender/armar_laminas.py --sin-blender   # rearma desde los crudos
#   .venv-art/bin/python3 tools/blender/armar_laminas.py --hoja /ruta/hoja.png
#
# Salida: assets/libro/<lamina>.png. Los crudos quedan en tools/blender/out/laminas/ (ignorado por git).
# Sin texto horneado: los rotulos los pone el juego.
import base64, math, os, re, subprocess, sys, zlib
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
CRUDOS = os.path.join(AQUI, 'out', 'laminas')
SALIDA = os.path.join(RAIZ, 'assets', 'libro')
BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'
W, H = 480, 270
ESC = 3
VERDE = (0x5e, 0xf5, 0x8a)
MODELOS = ['supere_exocet', 'a4c', 'kc130', 'exocet', 'invincible', 'belgrano', 'sheffield', 'neptune', 'balsas', 'balsas_humo']
# LOS MAPAS: (lon, lat) del reabastecimiento (esquematico) y del blanco, y cuanto rodea la ruta por el sur (px)
# · EL SHEFFIELD (26/11): tocado en ≈52°45'S 57°15'O (naval-history.net: «52¾S, 57¼»), unas 60-70 millas al SE de
#   Puerto Argentino, de piquete por delante de los portaaviones. La cita con el Hercules (50°30'S 65°30'O) cae fuera
#   de cuadro, al oeste: la cruz va en el borde, como en la del Invincible.
MAPAS = {
    'mapa_invincible': dict(cruz=(-61.2, -53.0), blanco=(-56.0, -52.45), rodeo=34),
    'mapa_sheffield': dict(cruz=(-61.2, -53.0), blanco=(-57.25, -52.75), rodeo=22),
}
TODAS = MODELOS + list(MAPAS)

# ============================ EL FOSFORO ============================
def fosforo(linea, relleno=None, k_relleno=0.07, k_brillo=0.55, radio=3.5):
    """linea/relleno: arrays 0..1 de HxW. Devuelve la imagen RGBA en verde con el resplandor."""
    lin = np.clip(linea, 0, 1)
    halo = np.asarray(Image.fromarray((lin * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radio)), np.float32) / 255
    halo2 = np.asarray(Image.fromarray((lin * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radio * 3)), np.float32) / 255
    a = 1 - (1 - lin) * (1 - np.clip(halo * k_brillo * 1.6, 0, 1)) * (1 - np.clip(halo2 * k_brillo, 0, 1))
    if relleno is not None:
        a = 1 - (1 - a) * (1 - np.clip(relleno, 0, 1) * k_relleno)
    rgba = np.zeros((lin.shape[0], lin.shape[1], 4), np.uint8)
    # el nucleo de la linea, un poco mas blanco (el fosforo quemado); el halo en el verde puro
    nucleo = np.clip(lin, 0, 1)[..., None] * 0.25
    col = np.array(VERDE, np.float32)[None, None, :] * (1 - nucleo) + 255 * nucleo
    rgba[..., :3] = np.clip(col, 0, 255).astype(np.uint8)
    rgba[..., 3] = np.clip(a * 255, 0, 255).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')

def reducir(arr):
    """De ESC x a 1x promediando (antialias)."""
    h, w = arr.shape
    return arr[:h - h % ESC, :w - w % ESC].reshape(h // ESC, ESC, w // ESC, ESC).mean(axis=(1, 3))

def desde_crudo(nombre):
    im = np.asarray(Image.open(os.path.join(CRUDOS, nombre + '.png')).convert('RGBA'), np.float32) / 255
    alfa = im[..., 3]
    linea = im[..., 0] * alfa
    relleno = np.clip(alfa - linea, 0, 1)
    return fosforo(reducir(linea), reducir(relleno))

def hornear(nombre):
    os.makedirs(CRUDOS, exist_ok=True)
    r = subprocess.run([BLENDER, '--background', '--factory-startup', '--python', os.path.join(AQUI, 'hornear_laminas.py'),
                        '--', '--lamina', nombre, '--esc', str(ESC), '--out', os.path.join(CRUDOS, nombre + '.png')],
                       capture_output=True, text=True)
    if 'LAMINA ' + nombre not in r.stdout:
        print(r.stdout[-3000:], r.stderr[-3000:]); raise SystemExit('fallo Blender: ' + nombre)

# ============================ EL MAPA ============================
def dem():
    """src/data/islas_dem.js -> alturas (m). Lo mismo que systems/islas/mundo.js decodeDEM (sin EXAG)."""
    txt = open(os.path.join(RAIZ, 'src', 'data', 'islas_dem.js')).read()
    cab = {k: float(v) for k, v in re.findall(r'(\w+):\s*(-?[\d.]+)', txt.split('data:')[0].split('ISLAS_DEM')[1])}
    data = re.search(r"data:\s*'([^']+)'", txt).group(1)
    raw = np.frombuffer(zlib.decompress(base64.b64decode(data)), np.uint8)
    nx, nz = int(cab['nx']), int(cab['nz']); n = nx * nz
    zz = raw[:n].astype(np.int32) | (raw[n:2 * n].astype(np.int32) << 8)
    r = np.where(zz & 1, -((zz + 1) >> 1), zz >> 1).reshape(nz, nx)
    # la prediccion 2D (l + u - ul) se deshace con dos sumas acumuladas
    V = np.cumsum(np.cumsum(r, axis=0), axis=1)
    return V.astype(np.float32) * cab['q'], cab

def contornos(Hm, nivel=0.0):
    """Marching squares: segmentos ((x0, y0), (x1, y1)) en celdas de la grilla, en el nivel dado."""
    a = Hm > nivel
    tl, tr, br, bl = a[:-1, :-1], a[:-1, 1:], a[1:, 1:], a[1:, :-1]
    caso = tl * 8 + tr * 4 + br * 2 + bl * 1
    segs = []
    def interp(v0, v1):
        d = v1 - v0
        return np.where(np.abs(d) < 1e-9, 0.5, (nivel - v0) / np.where(np.abs(d) < 1e-9, 1, d))
    js, is_ = np.nonzero((caso != 0) & (caso != 15))
    h00, h01 = Hm[js, is_], Hm[js, is_ + 1]
    h11, h10 = Hm[js + 1, is_ + 1], Hm[js + 1, is_]
    top = np.stack([is_ + interp(h00, h01), js + 0.0], 1)
    right = np.stack([is_ + 1.0, js + interp(h01, h11)], 1)
    bottom = np.stack([is_ + interp(h10, h11), js + 1.0], 1)
    left = np.stack([is_ + 0.0, js + interp(h00, h10)], 1)
    P = {'t': top, 'r': right, 'b': bottom, 'l': left}
    TABLA = {1: ['lb'], 2: ['br'], 3: ['lr'], 4: ['tr'], 5: ['tl', 'br'], 6: ['tb'], 7: ['tl'],
             8: ['tl'], 9: ['tb'], 10: ['tr', 'lb'], 11: ['tr'], 12: ['lr'], 13: ['br'], 14: ['lb']}
    c = caso[js, is_]
    for k in range(len(js)):
        for par in TABLA[int(c[k])]:
            segs.append((tuple(P[par[0]][k]), tuple(P[par[1]][k])))
    return segs

def mapa(cruz_ll=(-61.2, -53.0), blanco_ll=(-56.0, -52.45), rodeo=34):
    Hm, cab = dem()
    nx, nz, cell = int(cab['nx']), int(cab['nz']), cab['cell']
    # suavizado leve y a la mitad de resolucion: la costa como trazo, no como serrucho
    from scipy.ndimage import gaussian_filter, label
    # la tierra sin los islotes chicos (en la lamina serian puntos) y la costa SUAVIZADA: se contornea la
    # mascara desenfocada en 0,5 — un trazo de carta, no el serrucho del DEM
    paso = 4
    tierra = Hm > 0
    et, n = label(tierra)
    areas = np.bincount(et.ravel())
    grandes = areas >= 1500                  # celdas de 125 m: ~23 km2
    grandes[0] = False
    tierra = grandes[et]
    Hs = gaussian_filter(tierra.astype(np.float32), 2.2)[::paso, ::paso] - 0.5
    S = ESC * 2
    img = Image.new('L', (W * S, H * S), 0)
    dr = ImageDraw.Draw(img)
    # el encuadre: las islas a la DERECHA-centro (310 km de DEM en ~250 px) y lugar al este para la flota
    km_px = 1.45
    ox, oy = 128, 40                         # esquina noroeste del DEM en la lamina (px)
    def a_px(i, j):                          # celda (de la grilla reducida) -> px de la lamina (x S)
        return ((ox + i * paso * cell / 1000 / km_px) * S, (oy + j * paso * cell / 1000 / km_px) * S)
    segs = contornos(Hs, 0.0)
    ancho = int(1.5 * S)
    for (p, q) in segs:
        dr.line([a_px(*p), a_px(*q)], fill=255, width=ancho)
    # lon/lat -> px: proyeccion sinusoidal local en (lon0, lat0), como el DEM (px0/pz0: esquina NO en m)
    R = 6371.0
    def ll(lon, lat):
        x = math.radians(lon - cab['lon0']) * R * math.cos(math.radians(lat)) * 1000 - cab['px0']
        z = -math.radians(lat - cab['lat0']) * R * 1000 - cab['pz0']
        return ((ox + x / 1000 / km_px) * S, (oy + z / 1000 / km_px) * S)
    # LA RUTA (esquematica): de Rio Grande (oeste, fuera de cuadro) por el SUR de las islas, la carga
    # de los KC-130 y la vuelta hacia el grupo de portaaviones al este-sudeste
    cruz = ll(*cruz_ll)
    blanco = ll(*blanco_ll)
    ruta = [(-6 * S, 214 * S), (40 * S, 212 * S), cruz]
    # curva suave del reabastecimiento al blanco, rodeando por el sur
    c0, c1 = cruz, blanco
    ctrl = ((c0[0] + c1[0]) / 2, max(c0[1], c1[1]) + rodeo * S)
    for k in range(1, 41):
        t = k / 40
        ruta.append(((1 - t) ** 2 * c0[0] + 2 * (1 - t) * t * ctrl[0] + t * t * c1[0],
                     (1 - t) ** 2 * c0[1] + 2 * (1 - t) * t * ctrl[1] + t * t * c1[1]))
    punteada(dr, ruta, 7 * S, 5 * S, int(1.6 * S), radio_blanco=14 * S, blanco=blanco)
    # la CRUZ del reabastecimiento y el CIRCULO del blanco (con su mira)
    r = 7 * S
    dr.line([(cruz[0] - r, cruz[1] - r), (cruz[0] + r, cruz[1] + r)], fill=255, width=int(2 * S))
    dr.line([(cruz[0] - r, cruz[1] + r), (cruz[0] + r, cruz[1] - r)], fill=255, width=int(2 * S))
    rb = 11 * S
    dr.ellipse([blanco[0] - rb, blanco[1] - rb, blanco[0] + rb, blanco[1] + rb], outline=255, width=int(2 * S))
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        dr.line([(blanco[0] + dx * rb * 0.45, blanco[1] + dy * rb * 0.45), (blanco[0] + dx * rb * 1.5, blanco[1] + dy * rb * 1.5)],
                fill=255, width=int(1.6 * S))
    lin = np.asarray(img, np.float32) / 255
    lin = lin.reshape(H, S, W, S).mean(axis=(1, 3))
    return fosforo(lin)

def punteada(dr, pts, guion, hueco, ancho, radio_blanco=0, blanco=None):
    """Una polilinea en guiones (corta antes del circulo del blanco)."""
    resto, pinta = guion, True
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L = math.hypot(x1 - x0, y1 - y0); t = 0.0
        while t < L:
            d = min(resto, L - t)
            a = (x0 + (x1 - x0) * t / L, y0 + (y1 - y0) * t / L)
            b = (x0 + (x1 - x0) * (t + d) / L, y0 + (y1 - y0) * (t + d) / L)
            lejos = blanco is None or math.hypot(b[0] - blanco[0], b[1] - blanco[1]) > radio_blanco
            if pinta and lejos: dr.line([a, b], fill=255, width=ancho)
            t += d; resto -= d
            if resto <= 1e-6:
                pinta = not pinta; resto = guion if pinta else hueco

# ============================ LA HOJA DE CONTACTO ============================
def hoja(ruta):
    cols, filas, pad = 2, (len(TODAS) + 1) // 2, 16
    im = Image.new('RGBA', (cols * W + (cols + 1) * pad, filas * H + (filas + 1) * pad), (0, 0, 0, 255))
    for k, n in enumerate(TODAS):
        lam = Image.open(os.path.join(SALIDA, n + '.png'))
        x, y = pad + (k % cols) * (W + pad), pad + (k // cols) * (H + pad)
        ImageDraw.Draw(im).rectangle([x - 1, y - 1, x + W, y + H], outline=(20, 50, 30, 255))
        im.alpha_composite(lam, (x, y))
    # el barrido del monitor, como lo pone el juego (solo para mirar)
    a = np.asarray(im).copy(); a[1::3, :, :3] = (a[1::3, :, :3] * 0.72).astype(np.uint8)
    Image.fromarray(a).save(ruta)
    print('HOJA', ruta)

if __name__ == '__main__':
    args = [a for a in sys.argv[1:]]
    ruta_hoja = None
    if '--hoja' in args:
        i = args.index('--hoja'); ruta_hoja = args[i + 1]; del args[i:i + 2]
    sin_blender = '--sin-blender' in args
    args = [a for a in args if not a.startswith('--')]
    pedidas = args or TODAS
    os.makedirs(SALIDA, exist_ok=True)
    for n in pedidas:
        if n in MAPAS:
            q = MAPAS[n]
            im = mapa(q['cruz'], q['blanco'], q['rodeo'])
        else:
            if not sin_blender: hornear(n)
            im = desde_crudo(n)
        im.save(os.path.join(SALIDA, n + '.png'))
        print('OK', n)
    if ruta_hoja: hoja(ruta_hoja)
