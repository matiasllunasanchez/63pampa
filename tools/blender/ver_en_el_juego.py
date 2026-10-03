# VER EN EL JUEGO — renderiza el avion COMO LO VE EL JUEGO, desde adentro de Blender.
#
# Va EMBEBIDO en el .blend que arma tools/blender/hornear.py (`--guardar`): en la pestaña
# "Scripting", con este texto abierto, el boton ▶ (o Alt+P) lo corre.
#
# Que hace, en orden:
#   1. renderiza por la CAMARA ACTIVA al tamaño exacto de la hoja del juego — 84x84 la de cola,
#      168x168 la del poder RASANTE —, sin antialias y con fondo transparente;
#   2. le pone EL CONTORNO DE LAS HOJAS (el de tools/blender/armar_hoja.py: el borde se oscurece con
#      su propio color, y una linea donde se separan dos piezas) si la perilla `contorno` esta en 1.
#      El casco oscuro del visor se apaga para este render: a este tamaño es mas fino que un pixel;
#   3. lo apoya sobre el gris del pasillo, lo AMPLIA x4 sin suavizar y lo muestra en un editor de
#      imagen. Tambien queda guardado al lado del .blend: vista_juego.png.
import bpy, os, tempfile
import numpy as np

AMPLIAR = 4
FONDO = (0x34, 0x40, 0x4a)

def contorno(rgb, alfa, lineas=True):
    """El contorno de armar_hoja.py, en numpy. `rgb` en 0..255 (sRGB), `alfa` booleano."""
    out = rgb.copy()
    pad = np.pad(alfa, 1, constant_values=False)
    vecinos_llenos = pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]
    borde = alfa & ~vecinos_llenos
    out[borde] = rgb[borde] * 0.45
    if lineas:
        lum = rgb @ np.array([0.3, 0.59, 0.11])
        interior = alfa & ~borde
        for dy, dx in ((0, 1), (1, 0)):
            v = np.roll(np.roll(lum, -dy, 0), -dx, 1)
            va = np.roll(np.roll(alfa, -dy, 0), -dx, 1)
            marca = interior & va & (np.abs(lum - v) > 70) & (lum < v)
            out[marca] = rgb[marca] * 0.55
    return out

def main():
    sc = bpy.context.scene
    cam = sc.camera
    poder = 'RASANTE' in cam.name
    px = 168 if poder else 84
    r = sc.render
    guardado = (r.resolution_x, r.resolution_y, r.resolution_percentage, r.film_transparent,
                r.filepath, r.filter_size, sc.eevee.taa_render_samples, sc.get('contorno', 1))
    con_contorno = bool(sc.get('contorno', 1))
    tmp = os.path.join(tempfile.gettempdir(), 'rasante_vista_cruda.png')
    try:
        r.resolution_x = r.resolution_y = px
        r.resolution_percentage = 100
        r.film_transparent = True
        r.filter_size = 0.0
        sc.eevee.taa_render_samples = 1
        sc['contorno'] = 0                    # el casco del visor no: a este tamaño es medio pixel
        sc.frame_set(sc.frame_current)        # que los drivers lo lean
        r.filepath = tmp
        bpy.ops.render.render(write_still=True)
    finally:
        (r.resolution_x, r.resolution_y, r.resolution_percentage, r.film_transparent,
         r.filepath, r.filter_size, sc.eevee.taa_render_samples, sc['contorno']) = guardado
        sc.frame_set(sc.frame_current)
    cruda = bpy.data.images.load(tmp, check_existing=False)
    a = np.array(cruda.pixels[:], dtype=np.float32).reshape(px, px, 4)[::-1]   # filas de arriba a abajo
    bpy.data.images.remove(cruda)
    rgb, alfa = a[..., :3] * 255.0, a[..., 3] > 0.5
    if con_contorno:
        rgb = contorno(rgb, alfa)
    fondo = np.empty_like(rgb); fondo[:] = FONDO
    img = np.where(alfa[..., None], rgb, fondo)
    img = np.repeat(np.repeat(img, AMPLIAR, 0), AMPLIAR, 1)                  # x4 SIN suavizar
    h, w = img.shape[:2]
    rgba = np.concatenate([img / 255.0, np.ones((h, w, 1))], axis=2)[::-1]   # de vuelta, de abajo a arriba
    nombre = 'VISTA JUEGO'
    vista = bpy.data.images.get(nombre)
    if vista and (vista.size[0] != w or vista.size[1] != h):
        bpy.data.images.remove(vista); vista = None
    if not vista:
        vista = bpy.data.images.new(nombre, w, h, alpha=True)
    vista.pixels[:] = rgba.astype(np.float32).ravel()
    vista.update()
    ruta = bpy.path.abspath('//vista_juego.png') if bpy.data.filepath else os.path.join(tempfile.gettempdir(), 'vista_juego.png')
    vista.filepath_raw = ruta; vista.file_format = 'PNG'; vista.save()
    mostrar(vista)
    print('VISTA JUEGO:', ruta, '(%dx%d, x%d)' % (px, px, AMPLIAR))

def mostrar(vista):
    """La muestra en un editor de imagen: el primero que haya abierto, o una ventana nueva."""
    wm = bpy.context.window_manager
    def poner():
        for win in wm.windows:
            for area in win.screen.areas:
                if area.type == 'IMAGE_EDITOR':
                    area.spaces.active.image = vista
                    return True
        return False
    try:
        if poner(): return
        bpy.ops.render.view_show('INVOKE_DEFAULT')    # la ventana del render (un editor de imagen)
        poner()
    except Exception as e:                            # sin interfaz (en segundo plano) no hay donde
        print('sin ventana para mostrarla:', e)

main()
