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

# LA CHANCHA: los cuatro conos de helice y la boca del pod de estribor (CH_MOT de tools/models/enemies.js)
CH_MOT = [2.9, 5.9]
_conos = sorted(x for mx in CH_MOT for x in (-mx, mx))

HOJAS = {
    # LOS HELICOPTEROS, HECHOS EN BLENDER (4/10/2026, tools/blender/modelos_helos.py): el de siempre
    # es el Sea King HC.4 verde de los comandos
    'helo': dict(fw=64, fh=48, dist=15, lookY=0.15, cols=8, frames=_helo('bl:seaKingVerde:%d')),
    **{'helo_' + m.lower(): dict(fw=128, fh=96, dist=19, lookY=0.3, cols=8, frames=_helo('bl:' + m + ':%d'))
       for m in ('seaKing', 'wessex', 'seaLynx', 'gazelle', 'scout')},
    'chancha': dict(fw=160, fh=112, dist=40, elev=12, lookY=2.8, baseYaw=0, cols=3, nivelado=1,
                    frames=[dict(modelo='bl:hercules', roll=a) for a in (-0.10, 0, 0.10)],
                    puntos=[(x, 1.10, -4.35) for x in _conos] + [(CH_MOT[0], 0.10, 2.30)]),
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
    # El teleobjetivo casi ortografico (2,42° a 90 unidades) y `clipY: 0`: nada bajo la flotacion,
    # asi el borde de abajo del contenido ES la linea de agua (ver bake_enemies.html).
    **{('buque_' + c): dict(fw=240, fh=72, dist=90, fov=2.42, lookY=1.76, clipY=0, baseYaw=0, quarter=math.pi / 2,
                            cols=3, nivelado=1, frames=[dict(modelo='puente:' + c, roll=a) for a in (-0.04, 0, 0.04)])
       for c in ('t42', 't21', 'log', 'cv')},
    **{('proa_' + c): dict(fw=56, fh=72, dist=90, fov=2.42, lookY=1.64, clipY=0, baseYaw=0, quarter=0,
                           cols=3, nivelado=1, frames=[dict(modelo='puente:' + c, roll=a) for a in (-0.05, 0, 0.05)])
       for c in ('t42', 't21', 'log', 'cv')},
    **{('hundido_' + c): dict(fw=240, fh=72, dist=90, fov=3.15, lookY=2.0, clipY=0, baseYaw=0, quarter=math.pi / 2,
                              cols=2, frames=[dict(modelo='puente:hundido_%s_%d' % (c, n)) for n in (1, 2)])
       for c in ('t42', 't21', 'log', 'cv')},
    'fragata': dict(fw=64, fh=48, dist=16, lookY=1.0, quarter=0.15, cols=1, frames=[dict(modelo='puente:modelFragata')]),
    'lcu': dict(fw=72, fh=48, dist=17, lookY=0.9, quarter=-0.55, cols=3, nivelado=1,
                frames=[dict(modelo='puente:modelLcu', roll=a) for a in (-0.09, 0, 0.09)]),
    # ---------------- FASE 4: TIERRA ----------------
    # todos en 3/4 (`quarter`): de frente los caños y los misiles apuntan a la camara y son palitos
    'radar': dict(fw=48, fh=48, dist=16, lookY=1.6, quarter=0.5, cols=4,
                  frames=[dict(modelo='puente:modelRadar_%r' % (i * math.pi / 4)) for i in range(4)]),
    'aatruck': dict(fw=56, fh=48, dist=16, lookY=1.3, quarter=0.5, cols=3,
                    frames=[dict(modelo='puente:modelAATruck_%r' % a) for a in (-0.5, 0, 0.5)]),
    'balloon': dict(fw=48, fh=48, dist=11, lookY=0, quarter=0.4, cols=3,
                    frames=[dict(modelo='puente:modelBalloon', roll=a) for a in (-0.12, 0, 0.12)]),
    'aa': dict(fw=48, fh=48, dist=14, lookY=1.2, quarter=0.45, cols=2,
               frames=[dict(modelo='puente:modelAA_%r' % a) for a in (0.55, 0.8)]),
    'manpad': dict(fw=48, fh=48, dist=9, lookY=0.7, quarter=0.45, cols=2,
                   frames=[dict(modelo='puente:modelManpad_%r' % a) for a in (0.7, 1.0)]),
    'tent': dict(fw=48, fh=48, dist=12, lookY=0.6, quarter=0.35, cols=1, frames=[dict(modelo='puente:modelTent')]),
    'depot': dict(fw=64, fh=48, dist=15, lookY=1.0, quarter=0.4, cols=1, frames=[dict(modelo='puente:modelDepot')]),
    'bldg': dict(fw=64, fh=48, dist=14, lookY=1.4, quarter=0.35, cols=1, frames=[dict(modelo='puente:modelBldg')]),
    # ---------------- FASE 5: LOS RESTOS ----------------
    'resto_aa': dict(fw=48, fh=48, dist=16, lookY=0.8, quarter=0.45, cols=1, frames=[dict(modelo='puente:restoAA')]),
    'resto_manpad': dict(fw=48, fh=48, dist=9, lookY=0.4, quarter=0.45, cols=1, frames=[dict(modelo='puente:restoManpad')]),
    'resto_aatruck': dict(fw=56, fh=48, dist=16, lookY=0.9, quarter=0.5, cols=1, frames=[dict(modelo='puente:restoAATruck')]),
    'resto_radar': dict(fw=48, fh=48, dist=16, lookY=1.0, quarter=0.5, cols=1, frames=[dict(modelo='puente:restoRadar')]),
    'resto_depot': dict(fw=64, fh=48, dist=15, lookY=0.8, quarter=0.4, cols=1, frames=[dict(modelo='puente:restoDepot')]),
    'resto_bldg': dict(fw=64, fh=48, dist=14, lookY=1.0, quarter=0.35, cols=3,
                       frames=[dict(modelo='puente:restoBldg_%d' % n) for n in range(3)]),
    'resto_tent': dict(fw=48, fh=48, dist=12, lookY=0.25, quarter=0.35, cols=1, frames=[dict(modelo='puente:restoTent')]),
    'resto_helo': dict(fw=64, fh=48, dist=16.5, lookY=1.15, quarter=0.4, cols=1, frames=[dict(modelo='puente:restoHelo')]),
    'resto_jet': dict(fw=64, fh=48, dist=16, lookY=0.6, quarter=0.35, cols=1, frames=[dict(modelo='puente:restoJet')]),
    'resto_lcu': dict(fw=72, fh=48, dist=17, lookY=0.5, quarter=-0.55, cols=2,
                      frames=[dict(modelo='puente:restoLcu_%d' % n) for n in range(2)]),
    'resto_balloon': dict(fw=48, fh=48, dist=11, lookY=-0.6, quarter=0.4, cols=1, frames=[dict(modelo='puente:restoBalloon')]),
    # ---------------- FASE 5: LAS PARTES DEL DESPIECE ----------------
    # una fila por pieza EN EL ORDEN DE data/despiece.js (PARTES_HOJA), ocho giros por fila; la pieza
    # volcada en 3/4 (x 0.42, z 0.2) y girando adentro — los grupos de bake_partes.html
    'partes': dict(fw=48, fh=48, pos=(0, 1.5, 5.9), fov=26, lookY=0, cols=8, cajas=False,
                   destino='assets/world/explosions/partes.png',
                   frames=[dict(modelo='puente:parte-' + n, rots=[('X', 0.42), ('Z', 0.2), ('Y', y * R)])
                           for n in ('ala', 'deriva', 'estab', 'morro', 'cola', 'fuselaje', 'cabina', 'tanque', 'tren', 'panel',
                                     'rotor', 'botalon', 'plato', 'canon', 'motor', 'tambor', 'rueda', 'rampa', 'funda', 'cable')
                           for y in (0, 45, 90, 135, 180, 225, 270, 315)]),
    # ---------------- FASE 5: LA MUNICION ----------------
    # SIN CONTORNO: a este tamaño el cuerpo es todo borde (ver armar_enemigos.py)
    'municion': dict(fw=16, fh=16, pos=(0, 0.55, 6.4), fov=26, lookY=0, cols=6, cajas=False, contorno=False,
                     destino='assets/ammo/municion.png',
                     frames=[dict(modelo='puente:' + m, rots=[('X', v * R)]) for m in ('bomba', 'misil')
                             for v in (0, 15, 30, 45, 62, 80)]),
    'aim9': dict(fw=32, fh=32, pos=(0, 0.3, 7.4), fov=26, lookY=0, cols=10, cajas=False, contorno=False,
                 destino='assets/ammo/aim9.png',
                 frames=[dict(modelo='puente:aim9', rots=[('X', v * R)]) for v in range(0, 181, 20)]),
}
