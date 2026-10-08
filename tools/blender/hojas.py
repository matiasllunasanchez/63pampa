# LAS HOJAS DE ENEMIGOS QUE HORNEA BLENDER — el mismo catalogo que SHEETS de tools/bake_enemies.html,
# numero por numero (el por que de cada encuadre esta explicado alla). Lo lee hornear_hoja.py.
#
# Cada hoja: fw x fh (el cuadro), cols, dist/fov/lookY/elev (la camara), baseYaw/quarter (el volteo
# hacia la camara) y `frames`, una pose por cuadro en el orden de la hoja:
#   modelo  'puente:<archivo>'   el modelo de three.js tal cual (tools/blender/out/puente/, lo vuelca
#                                exportar_run.js)
#           'bl:<funcion>[:arg]' un modelo hecho en Blender (tools/blender/modelos_enemigos.py)
#   yaw, roll  en radianes
#
# FASE 2 (3/10/2026): los aviones enemigos — el helicoptero, los cinco britanicos, la Chancha, el
# caza del pasillo y las tres hojas del Sea Harrier.
# FASE 3 (3/10/2026): los buques — las cuatro clases de costado, de proa y hundiendose (buques.js),
# el casco de la fragata del mastil de mar y la barcaza.
# FASE 4 (3/10/2026): tierra — el Rapier, el equipo de misil al hombro, el camion AA, el radar, el
# deposito, el puesto, la carpa y el globo.
# FASE 5 (4/10/2026): los RESTOS (tools/models/restos.js, con la camara de su version viva), las
# PARTES del despiece (la hoja de piezas, tools/bake_partes.html) y la MUNICION (bomba, misil y el
# Sidewinder, tools/bake_ammo.html). Estas dos ultimas no son de assets/world/enemies: llevan
# `destino` (donde va la hoja) y `cajas=False` (no se miden: su grilla la sabe el render).
import math

R = math.pi / 180

def _helo(fuente):
    """8 yaws (de frente a perfil, cola a la derecha) x 2 fases del rotor."""
    return [dict(modelo=fuente % ph, yaw=i / 7 * math.pi / 2) for ph in (0, 1) for i in range(8)]

# LA CHANCHA: los cuatro conos de helice y la boca de los dos pods de manguera, estribor (ancla 4) y
# babor (ancla 5). CH_MOT y CH_POD son los de tools/blender/modelos_enemigos.py
CH_MOT = [2.9, 5.9]
CH_POD = (8.0, 0.80, 1.15)
_conos = sorted(x for mx in CH_MOT for x in (-mx, mx))

HOJAS = {
    # LOS HELICOPTEROS, HECHOS EN BLENDER (4/10/2026, tools/blender/modelos_helos.py): el de siempre
    # es el Sea King HC.4 verde de los comandos
    'helo': dict(fw=64, fh=48, dist=15, lookY=0.15, cols=8, frames=_helo('bl:seaKingVerde:%d')),
    **{'helo_' + m.lower(): dict(fw=128, fh=96, dist=19, lookY=0.3, cols=8, frames=_helo('bl:' + m + ':%d'))
       for m in ('seaKing', 'wessex', 'seaLynx', 'gazelle', 'scout')},
    'chancha': dict(fw=160, fh=112, dist=40, elev=12, lookY=2.8, baseYaw=0, cols=3, nivelado=1,
                    frames=[dict(modelo='bl:hercules', roll=a) for a in (-0.10, 0, 0.10)],
                    puntos=[(x, 1.10, -4.35) for x in _conos] + [(sg * CH_POD[0], CH_POD[1], CH_POD[2]) for sg in (1, -1)]),
    'jet': dict(fw=128, fh=96, dist=16, lookY=0.2, cols=5, nivelado=2,
                frames=[dict(modelo='bl:caza', roll=a * R) for a in (-30, -15, 0, 15, 30)]),
    'harrier': dict(fw=128, fh=96, dist=16, lookY=0.2, cols=5, nivelado=2,
                    frames=[dict(modelo='bl:harrier', roll=a * R) for a in (-30, -15, 0, 15, 30)]),
    'harrier_rear': dict(fw=128, fh=96, dist=16, lookY=0.2, baseYaw=0, cols=5, nivelado=2,
                         frames=[dict(modelo='bl:harrier:atras', roll=a * R) for a in (-30, -15, 0, 15, 30)]),
    'harrier_turn': dict(fw=128, fh=96, dist=18, lookY=0.2, baseYaw=0, cols=5,
                         frames=[dict(modelo='bl:harrier', yaw=d * R, roll=r * R)
                                 for d, r in zip((0, 40, 90, 140, 180), (0, -25, -35, -25, 0))]),
    # ---------------- FASE 3: LOS BUQUES ----------------
    # (remodelados en Blender el 4/10/2026: tools/blender/modelos_buques.py)
    # El teleobjetivo casi ortografico (2,42° a 90 unidades) y `clipY: 0`: nada bajo la flotacion,
    # asi el borde de abajo del contenido ES la linea de agua (ver bake_enemies.html).
    **{('buque_' + c): dict(fw=240, fh=72, dist=90, fov=2.42, lookY=1.76, clipY=0, baseYaw=0, quarter=math.pi / 2,
                            cols=3, nivelado=1, frames=[dict(modelo='bl:' + c, roll=a) for a in (-0.04, 0, 0.04)])
       for c in ('t42', 't21', 'log', 'cv')},
    **{('proa_' + c): dict(fw=56, fh=72, dist=90, fov=2.42, lookY=1.64, clipY=0, baseYaw=0, quarter=0,
                           cols=3, nivelado=1, frames=[dict(modelo='bl:' + c, roll=a) for a in (-0.05, 0, 0.05)])
       for c in ('t42', 't21', 'log', 'cv')},
    **{('hundido_' + c): dict(fw=240, fh=72, dist=90, fov=3.15, lookY=2.0, clipY=0, baseYaw=0, quarter=math.pi / 2,
                              cols=2, frames=[dict(modelo='bl:hundido:%s:%d' % (c, n)) for n in (1, 2)])
       for c in ('t42', 't21', 'log', 'cv')},
    # LA FRAGATA DEL MAR ABIERTO (el obstaculo `mast`), DE COSTADO desde el 4/10: cruza el pasillo
    # navegando de lado, y vista casi de proa era un bulto gris ("¿estos barquitos estan horneados bien?"
    # — no). Es el Tipo 21, con la PROA A LA DERECHA (el juego la espeja cuando navega a la izquierda).
    # Y los CIVILES que salen en su lugar cada tanto: el pesquero y el costero de las islas.
    **{k: dict(fw=64, fh=48, dist=16, lookY=1.3, clipY=0, baseYaw=0, quarter=-math.pi / 2, cols=1, frames=[dict(modelo=m)])
       for k, m in (('fragata', 'bl:t21'), ('pesquero', 'bl:pesquero'), ('costero', 'bl:costero'))},
    'lcu': dict(fw=72, fh=48, dist=17, lookY=0.9, quarter=-0.55, cols=3, nivelado=1,
                frames=[dict(modelo='bl:lcu', roll=a) for a in (-0.09, 0, 0.09)]),
    # ---------------- FASE 4: TIERRA ----------------
    # TODO LO DEL TERRENO VA SIN CONTORNO (el autor, 4/10: "a todo lo del terreno conviene quitarle
    # contorno"): las instalaciones, sus restos y la vegetacion se asientan en el suelo en vez de
    # recortarse encima. Lo que vuela o flota lo conserva.
    # (remodelado en Blender el 4/10/2026: tools/blender/modelos_tierra.py)
    # todos en 3/4 (`quarter`): de frente los caños y los misiles apuntan a la camara y son palitos
    'radar': dict(contorno=False, fw=48, fh=48, dist=17, lookY=1.7, quarter=0.5, cols=4,
                  frames=[dict(modelo='bl:radar:%r' % (i * math.pi / 4)) for i in range(4)]),
    'aatruck': dict(contorno=False, fw=56, fh=48, dist=16, lookY=1.3, quarter=0.5, cols=3,
                    frames=[dict(modelo='bl:camion_aa:%r' % a) for a in (-0.5, 0, 0.5)]),
    'balloon': dict(fw=48, fh=48, dist=11, lookY=0, quarter=0.4, cols=3,
                    frames=[dict(modelo='bl:globo', roll=a) for a in (-0.12, 0, 0.12)]),
    'aa': dict(contorno=False, fw=48, fh=48, dist=14, lookY=1.2, quarter=0.45, cols=2,
               frames=[dict(modelo='bl:nido_rapier:%r' % a) for a in (0.55, 0.8)]),
    'manpad': dict(contorno=False, fw=48, fh=48, dist=9, lookY=0.7, quarter=0.45, cols=2,
                   frames=[dict(modelo='bl:manpad:%r' % a) for a in (0.7, 1.0)]),
    'tent': dict(contorno=False, fw=48, fh=48, dist=12, lookY=0.6, quarter=0.35, cols=1, frames=[dict(modelo='bl:carpa')]),
    'depot': dict(contorno=False, fw=64, fh=48, dist=15, lookY=1.0, quarter=0.4, cols=1, frames=[dict(modelo='bl:deposito')]),
    'bldg': dict(contorno=False, fw=64, fh=48, dist=14, lookY=1.4, quarter=0.35, cols=1, frames=[dict(modelo='bl:puesto')]),
    # ---------------- FASE 5: LOS RESTOS ----------------
    # (remodelados en Blender el 4/10/2026: tools/blender/modelos_restos.py, con los modelos nuevos; cuatro
    # con la camara un paso mas atras: el resto desparramado es mas ancho que el vivo, y el `wu` los empareja)
    'resto_aa': dict(contorno=False, fw=48, fh=48, dist=18, lookY=0.8, quarter=0.45, cols=1, frames=[dict(modelo='bl:restoAA')]),
    'resto_manpad': dict(contorno=False, fw=48, fh=48, dist=13, lookY=0.4, quarter=0.45, cols=1, frames=[dict(modelo='bl:restoManpad')]),
    'resto_aatruck': dict(contorno=False, fw=56, fh=48, dist=16, lookY=0.9, quarter=0.5, cols=1, frames=[dict(modelo='bl:restoAATruck')]),
    'resto_radar': dict(contorno=False, fw=48, fh=48, dist=18, lookY=1.0, quarter=0.5, cols=1, frames=[dict(modelo='bl:restoRadar')]),
    'resto_depot': dict(contorno=False, fw=64, fh=48, dist=15, lookY=0.8, quarter=0.4, cols=1, frames=[dict(modelo='bl:restoDepot')]),
    'resto_bldg': dict(contorno=False, fw=64, fh=48, dist=14, lookY=1.0, quarter=0.35, cols=3,
                       frames=[dict(modelo='bl:restoBldg:%d' % n) for n in range(3)]),
    'resto_tent': dict(contorno=False, fw=48, fh=48, dist=12, lookY=0.25, quarter=0.35, cols=1, frames=[dict(modelo='bl:restoTent')]),
    'resto_helo': dict(contorno=False, fw=64, fh=48, dist=16.5, lookY=1.15, quarter=0.4, cols=1, frames=[dict(modelo='bl:restoHelo')]),
    'resto_jet': dict(contorno=False, fw=64, fh=48, dist=16, lookY=0.6, quarter=0.35, cols=1, frames=[dict(modelo='bl:restoJet')]),
    'resto_lcu': dict(fw=72, fh=48, dist=17, lookY=0.5, quarter=-0.55, cols=2,
                      frames=[dict(modelo='bl:restoLcu:%d' % n) for n in range(2)]),
    'resto_balloon': dict(fw=48, fh=48, dist=13, lookY=-0.6, quarter=0.4, cols=1, frames=[dict(modelo='bl:restoBalloon')]),
    # ---------------- FASE 5: LAS PARTES DEL DESPIECE ----------------
    # (remodeladas en Blender el 4/10/2026, como la municion: tools/blender/modelos_partes.py)
    # una fila por pieza EN EL ORDEN DE data/despiece.js (PARTES_HOJA), ocho giros por fila; la pieza
    # volcada en 3/4 (x 0.42, z 0.2) y girando adentro — los grupos de bake_partes.html
    'partes': dict(fw=48, fh=48, pos=(0, 1.5, 5.9), fov=26, lookY=0, cols=8, cajas=False,
                   destino='assets/world/explosions/partes.png',
                   frames=[dict(modelo='bl:parte:' + n, rots=[('X', 0.42), ('Z', 0.2), ('Y', y * R)])
                           for n in ('ala', 'deriva', 'estab', 'morro', 'cola', 'fuselaje', 'cabina', 'tanque', 'tren', 'panel',
                                     'rotor', 'botalon', 'plato', 'canon', 'motor', 'tambor', 'rueda', 'rampa', 'funda', 'cable')
                           for y in (0, 45, 90, 135, 180, 225, 270, 315)]),
    # ---------------- FASE 5: LA MUNICION ----------------
    # SIN CONTORNO: a este tamaño el cuerpo es todo borde (ver armar_enemigos.py)
    'municion': dict(fw=16, fh=16, pos=(0, 0.55, 6.4), fov=26, lookY=0, cols=6, cajas=False, contorno=False,
                     destino='assets/ammo/municion.png',
                     frames=[dict(modelo='bl:municion_' + m, rots=[('X', v * R)]) for m in ('bomba', 'misil')
                             for v in (0, 15, 30, 45, 62, 80)]),
    'aim9': dict(fw=32, fh=32, pos=(0, 0.3, 7.4), fov=26, lookY=0, cols=10, cajas=False, contorno=False,
                 destino='assets/ammo/aim9.png',
                 frames=[dict(modelo='bl:municion_aim9', rots=[('X', v * R)]) for v in range(0, 181, 20)]),
    # LAS CHAFITAS (8/10/2026, el autor: "en Blender tienen que estar horneados tambien, son cilindros de
    # 16 cm"): el tubo que larga cada carga, nuevo y solo de Blender. Seis vistas como la municion —de
    # punta (0) a de costado (5)—; el giro en el plano y el destello los pone el juego (game.js
    # drawChapitas, render/chafita.js). Sin contorno: a este tamaño el tubo es todo borde.
    'chafita': dict(nueva=True, fw=16, fh=16, pos=(0, 0.0, 6.4), fov=26, lookY=0, cols=6, cajas=False, contorno=False,
                    destino='assets/ammo/chafita.png',
                    frames=[dict(modelo='bl:municion_chafita', rots=[('X', v * R)]) for v in (0, 18, 36, 54, 72, 90)]),
    # ---------------- EL FUEGO Y EL HUMO (4/10/2026, tools/blender/modelos_fuego.py) ----------------
    # HOJAS NUEVAS: hasta hoy el fuego y el humo se dibujaban por codigo con rectangulos. De frente y sin
    # volteo (`rots` vacio), sin contorno (el fuego no tiene borde oscuro) y sin caja (la grilla la sabe
    # render/fuego.js).
    # LA LLAMA: 8 cuadros de parpadeo x 2 variantes (filas), la base al pie del cuadro
    'fuego': dict(nueva=True, fw=32, fh=48, pos=(0, 1.42, 10), fov=18, lookY=1.42, cols=8, cajas=False, contorno=False,
                  destino='assets/world/explosions/fuego.png',
                  frames=[dict(modelo='bl:llama:%d:%d' % (f, v), rots=[]) for v in (0, 1) for f in range(8)]),
    # LAS BOCANADAS DE HUMO: 8 formas x 2 tonos (fila 0 negro de incendio, fila 1 gris). Con luz: si.
    'humo': dict(nueva=True, fw=32, fh=32, pos=(0, 0.1, 10), fov=15, lookY=0.1, cols=8, cajas=False, contorno=False,
                 destino='assets/world/explosions/humo.png',
                 frames=[dict(modelo='bl:bocanada:%d:%s' % (v, t), rots=[]) for t in ('negro', 'gris') for v in range(8)]),
    # ---------------- EL HARRIER, HORNEADO COMO TU AVION (4/10/2026) ----------------
    # Pedido del autor: "hornea a los Harrier de la misma forma que esta horneado mi avion, porque va a
    # verse detras y tiene que tener la misma movilidad". LA MISMA CAMARA que tools/blender/hornear.py
    # usa para las hojas de los aviones jugables (cola, (0, 2.4, 12.5) mirando a 0.15, 24° recalculados
    # para el cuadro cuadrado de 84 → 40.81° verticales), los MISMOS 9 alabeos (-60..+60) y los cabeceos
    # de las dos hojas del jugador en una sola: filas 0-2 = +14, 0, -14 (sheet.png) y 3-4 = +32, -32
    # (sheet2.png, las piruetas). La pose como en hornear.py: cabeceo en X y alabeo en Z, sin volteo.
    'harrier_cola': dict(fw=84, fh=84, pos=(0, 2.4, 12.5), fov=40.8078, lookY=0.15, cols=9,
                         frames=[dict(modelo='bl:harrier:atras', rots=[('X', p * R), ('Z', a * R)])
                                 for p in (14, 0, -14, 32, -32) for a in (-60, -45, -30, -15, 0, 15, 30, 45, 60)]),
    # ---------------- FASE 6: LOS SOLDADOS Y LA EYECCION (4/10/2026, tools/blender/modelos_soldados.py) ----------------
    # LA INFANTERIA: el encuadre de tools/bake_soldiers.html — la celda es una VENTANA FIJA de 2,9 unidades
    # con el suelo en la fila 20 (el juego ancla por la celda, no por una caja), de perfil mirando a la
    # izquierda. 7 columnas (6 del paso + cuerpo a tierra) x 2 filas (guarnicion / desembarco con bergen).
    # Con EL CONTORNO DE DOS TONOS de bake_common.js (claro arriba-izquierda, oscuro abajo-derecha): el
    # soldado tiene que leerse sobre turba, arena y nieve en la misma partida.
    'soldados': dict(fw=24, fh=24, pos=(0, 0.9667, 6.8217), fov=24, lookY=0.9667, cols=7, cajas=False, contorno=False,
                     contorno2=('#a8aa78', '#12150c'), destino='assets/world/soldats/soldados.png',
                     # fila 2: EL CONSCRIPTO ARGENTINO (casco M1, oliva liso, 90 % de alto), sin bergen
                     frames=[dict(modelo=m, rots=[]) for b, bando in ((0, 'brit'), (1, 'brit'), (0, 'arg'))
                             for m in ['bl:soldado_corre:%d:%d:%s' % (i, b, bando) for i in range(6)] + ['bl:soldado_tierra:%d:%s' % (b, bando)]]),
    # LA EYECCION: el encuadre de bake_enemies.html. Filas 0 (el argentino) y 1 (el britanico): 4 cuadros
    # del asiento dando tumbos y 3 bajo la cupula hamacandose; fila 2, el asiento VACIO cayendo aparte.
    # El punto 0 es EL ARNES (el origen del modelo): el juego ancla los dos actos ahi.
    'eyectado': dict(fw=48, fh=76, dist=22, lookY=1.5, quarter=0.3, cols=7, puntos=[(0, 0, 0)],
                     frames=[f for b in ('arg', 'brit') for f in
                             [dict(modelo='bl:asiento:' + b, roll=n * math.pi / 2) for n in range(4)] +
                             [dict(modelo='bl:cupula:' + b, roll=a) for a in (-0.1, 0, 0.1)]] +
                            [dict(modelo='bl:asientoSolo', roll=n * math.pi / 2) for n in range(4)]),
    # ---------------- LA VEGETACION (4/10/2026, tools/blender/modelos_vegetacion.py) ----------------
    # HOJA NUEVA, sin caja (la grilla la sabe render/vegetacion.js). SIN ARBOLES: en las islas casi no
    # hay (el autor). 32x32 con la camara cerca y el suelo al pie; 6 variantes por fila:
    #   0 el pasto blanco / tussac   1 la murtilla   2 el tojo   — los tres EN GRIS: los tiñe el juego,
    #   entre verdes, amarillos y marrones claros segun el dia y la luz
    #   3 las FLORES del tojo solas (la mata de oclusor), en su amarillo, para dibujar encima sin teñir
    #   4 la cortadera (en gris)     5 las piedras blancas de cuarcita, en su color
    'matas': dict(contorno=False, nueva=True, fw=32, fh=32, pos=(0, 1.7, 8), fov=20, lookY=1.2, cols=6, cajas=False,
                  destino='assets/world/elements/matas.png',
                  frames=[dict(modelo='bl:%s:%d%s' % (m, v, x), rots=[('Y', v * 1.1)])
                          for m, x in (('pasto', ''), ('murtilla', ''), ('tojo', ':0'), ('tojo', ':1'), ('cortadera', ''), ('piedra', ''))
                          for v in range(6)]),
    # EL PASTO DEL SUELO (4/10/2026, brizna() en modelos_vegetacion.py): 8 matojos x 3 estados de viento
    # (fila 0 parado, 1 doblado, 2 acostado), en gris — los tiñe render/world.js con los tonos de pasto
    # del clima. 24x24 con el suelo al pie; la camara apenas por arriba, como se ve el campo volando.
    'pasto': dict(contorno=False, nueva=True, fw=24, fh=24, pos=(0, 0.62, 4), fov=15.6, lookY=0.45, cols=8, cajas=False,
                  destino='assets/world/elements/pasto.png',
                  frames=[dict(modelo='bl:brizna:%d:%d' % (v, w), rots=[]) for w in range(3) for v in range(8)]),
    # ---------------- LOS CRESTONES (4/10/2026, creston() en modelos_vegetacion.py) ----------------
    # El obstaculo `cliff` (se esquiva): tres hojas por FORMA (baja / media / alta: el juego elige por la
    # proporcion del obstaculo), 4 variantes x 2 filas (0 tierra adentro: cuarcita; 1 costa: arenisca).
    # Con caja medida: el juego estira el CONTENIDO al rectangulo de choque, asi que la caja importa.
    # Sin contorno (es terreno). De frente y apenas por arriba.
    **{'roca_' + f: dict(fw=96, fh=64, pos=(0, 3.2, 26), fov=15.5, lookY=2.15, cols=4, contorno=False, nueva=True,
                         frames=[dict(modelo='bl:creston:%s:%d:%d' % (f, v, c), rots=[]) for c in (0, 1) for v in range(4)])
       for f in ('baja', 'media', 'alta')},
}
