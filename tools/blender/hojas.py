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
import math

R = math.pi / 180

def _helo(fuente):
    """8 yaws (de frente a perfil, cola a la derecha) x 2 fases del rotor."""
    return [dict(modelo=fuente % ph, yaw=i / 7 * math.pi / 2) for ph in (0, 1) for i in range(8)]

# LA CHANCHA: los cuatro conos de helice y la boca del pod de estribor (CH_MOT de tools/models/enemies.js)
CH_MOT = [2.9, 5.9]
_conos = sorted(x for mx in CH_MOT for x in (-mx, mx))

HOJAS = {
    'helo': dict(fw=64, fh=48, dist=15, lookY=0.15, cols=8, frames=_helo('puente:modelHelo_%d')),
    **{'helo_' + m.lower(): dict(fw=128, fh=96, dist=19, lookY=0.3, cols=8, frames=_helo('puente:' + m + '_%d'))
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
}
