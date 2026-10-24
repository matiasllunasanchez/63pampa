"""LA MUSICA EN CAPAS — prepara una pista para systems/capas.js (docs/produccion/MUSICA_CAPAS.md).

Dos pasos, los dos una sola vez por pista:
  1. MIDE la grilla de la mezcla con librosa: el BPM, el primer tiempo (offset) y la energia por compas.
     Eso va a data/musica_capas.js (bpm/offset/dur). A oido no: el malambo y el carnavalito van en 6/8
     y un detector se puede equivocar al doble o a la mitad — por eso se imprime tambien la curva de
     energia, para mirar si los compases caen donde la musica cambia.
  2. CODIFICA los stems (los WAV de Demucs o de Suno) a .m4a en assets/music/capas/<id>/, con los
     nombres que espera el catalogo (bateria, bajo, resto, voces — o los que se pasen).

Uso (con el entorno del arte, que tiene librosa y demucs):
  .venv-art/bin/python3 tools/musica_capas.py <id> <mezcla> <carpeta_de_stems> [compas=4]

  <carpeta_de_stems> es la salida de Demucs (drums.wav, bass.wav, other.wav, vocals.wav) o una carpeta
  de Suno; los nombres se traducen con NOMBRES. Si un stem no existe, se saltea.
"""
import json
import os
import subprocess
import sys

import librosa
import numpy as np

# Demucs y Suno (Get Stems) nombran en ingles → los nombres de las capas del juego. Suno separa hasta 12:
# los que cumplen el mismo papel se juntan en una capa (dos stems con el mismo destino se MEZCLAN).
NOMBRES = {'drums': 'bateria', 'bass': 'bajo', 'other': 'resto', 'vocals': 'voces',
           'percussion': 'percusion', 'melody': 'lider', 'lead': 'lider', 'pad': 'colchon',
           'guitar': 'lider', 'brass': 'lider', 'woodwinds': 'lider',
           'keyboard': 'colchon', 'strings': 'colchon', 'synth': 'colchon',
           'fx': 'efectos', 'backing vocals': 'voces', 'backing_vocals': 'voces', 'instrumental': 'resto'}

# LA ESCALERA POR PAPEL: con que intensidad entra cada capa (data/musica_capas.js). Es la propuesta de
# arranque; se afina volando con el medidor de SMALL CON MUSICA.
ESCALERA = {'bajo': {'siempre': True}, 'colchon': {'desde': 0.0, 'hasta': 0.4, 'min': 0.45},
            'resto': {'desde': 0.0, 'hasta': 0.45, 'min': 0.35}, 'bateria': {'desde': 0.25, 'hasta': 0.6},
            'lider': {'desde': 0.45, 'hasta': 0.75}, 'percusion': {'desde': 0.5, 'hasta': 0.8},
            'voces': {'desde': 0.7, 'hasta': 0.95}, 'efectos': {'desde': 0.8, 'hasta': 1.0}}

ROOT = os.path.join(os.path.dirname(__file__), '..')


def medir(mezcla, compas):
    y, sr = librosa.load(mezcla, sr=22050, mono=True)
    dur = len(y) / sr
    _, beats = librosa.beat.beat_track(y=y, sr=sr, units='time')
    # EL TEMPO, POR AJUSTE Y NO POR EL ESTIMADOR (23/10): librosa da el tempo en escalones — a la pista
    # de Suno pedida a 120 le dio 117,45, y a Balas 89,1 contra 88,54 reales: 0,6 % que en tres minutos
    # son mas de un segundo de grilla corrida. Se ajusta una RECTA a todos los tiempos detectados
    # (tiempo n = offset + n·periodo), descartando los que caen lejos (golpes mal detectados), y la
    # pendiente es el periodo de verdad.
    k = np.arange(len(beats))
    usar = np.ones(len(beats), bool)
    for _ in range(4):
        p = np.polyfit(k[usar], beats[usar], 1)
        res = np.abs(beats - np.polyval(p, k))
        usar = res < max(0.06, 2.5 * np.median(res[usar]))
    periodo, fase = p[0], p[1]
    bpm = 60.0 / periodo
    fase = fase % periodo
    # EL PRIMER TIEMPO FUERTE: de las `compas` fases posibles del compas, la de mas ataque PROMEDIADO
    # sobre toda la pista (con un solo compas se equivocaba: el primer golpe no siempre es el uno)
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    times = librosa.times_like(onset, sr=sr)
    def fuerza(t0):
        ts = np.arange(t0, dur, periodo * compas)
        idx = np.clip(np.searchsorted(times, ts), 0, len(onset) - 1)
        return float(onset[idx].mean()) if len(idx) else 0.0
    candidatas = [fase + i * periodo for i in range(compas)]
    offset = max(candidatas, key=fuerza)
    ajuste = float(np.max(np.abs(beats[usar] - np.polyval(p, k[usar])))) if usar.any() else 0.0
    # LA ENERGIA POR COMPAS (RMS, normalizada a 0..1): donde la pista sube y donde baja
    rms = librosa.feature.rms(y=y)[0]
    rt = librosa.times_like(rms, sr=sr)
    dc = periodo * compas
    energia = []
    t = offset
    while t < dur:
        sel = rms[(rt >= t) & (rt < t + dc)]
        energia.append(float(sel.mean()) if len(sel) else 0.0)
        t += dc
    mx = max(energia) or 1.0
    energia = [round(e / mx, 2) for e in energia]
    return {'bpm': round(bpm, 3), 'offset': round(offset, 3), 'compas': compas, 'dur': round(dur, 2),
            'compases': len(energia), 'tiempos_usados': f'{int(usar.sum())}/{len(beats)}',
            'error_max_ms': round(ajuste * 1000), 'energia': energia}


def capa_de(archivo):
    """El nombre de capa de un archivo de stem. Suno los llama '<cancion> (Drums).wav' o 'Drums.wav'."""
    base = os.path.splitext(archivo)[0].lower()
    if '(' in base and base.endswith(')'):
        base = base[base.rindex('(') + 1:-1]
    base = base.strip().replace('-', ' ')
    for k in sorted(NOMBRES, key=len, reverse=True):
        if base.endswith(k):
            return NOMBRES[k]
    return base.replace(' ', '_')


def codificar(pid, carpeta):
    destino = os.path.join(ROOT, 'assets', 'music', 'capas', pid)
    os.makedirs(destino, exist_ok=True)
    grupos = {}
    for f in sorted(os.listdir(carpeta)):
        if os.path.splitext(f)[1].lower() not in ('.wav', '.flac', '.mp3'):
            continue
        grupos.setdefault(capa_de(f), []).append(os.path.join(carpeta, f))
    for nombre, archivos in grupos.items():
        out = os.path.join(destino, nombre + '.m4a')
        ent = sum((['-i', a] for a in archivos), [])
        mezcla = ['-filter_complex', f'amix=inputs={len(archivos)}:normalize=0'] if len(archivos) > 1 else []
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *ent, *mezcla, '-c:a', 'aac', '-b:a', '160k', out], check=True)
    return sorted(grupos)


if __name__ == '__main__':
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)
    pid, mezcla, carpeta = sys.argv[1], sys.argv[2], sys.argv[3]
    compas = int(sys.argv[4]) if len(sys.argv) > 4 else 4
    m = medir(mezcla, compas)
    capas = codificar(pid, carpeta)
    print(json.dumps({'id': pid, 'capas': capas, **m}, ensure_ascii=False))
    # LA ENTRADA PROPUESTA para data/musica_capas.js, lista para pegar
    lineas = [f"  {pid}: {{", f"    nombre: '{pid.upper()}', origen: 'suno',",
              f"    bpm: {m['bpm']}, offset: {m['offset']}, compas: {compas}, dur: {m['dur']},", "    capas: {"]
    for c in capas:
        e = ESCALERA.get(c, {'desde': 0.5, 'hasta': 0.85})
        attrs = ', '.join(f"{k}: {'true' if v is True else v}" for k, v in e.items())
        lineas.append(f"      {c}: {{ archivo: '{pid}/{c}.m4a', {attrs} }},")
    lineas += ["    },", "    filtro: { cerrado: 900, abre: 0.5 },", "  },"]
    print('\n'.join(lineas))
