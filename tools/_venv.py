"""Entra solo al venv de arte cuando hace falta. Se importa PRIMERO, antes que PIL.

EL PROBLEMA QUE RESUELVE. Las herramientas de arte necesitan Pillow, que no esta en el python
del sistema: vive en .venv-art/. Pero toda la documentacion del proyecto —y la que se escriba
manana— dice `python3 tools/loquesea.py`, porque es lo natural de escribir. El resultado era un
ModuleNotFoundError: No module named 'PIL' que no dice que hacer.

Se podria haber arreglado corrigiendo los renglones de la documentacion. No alcanza: el proximo
que escriba un comando en un README va a poner `python3` otra vez, y el error vuelve. Asi que se
arregla del lado de la herramienta — que es el unico lado que no se olvida.

COMO. Si PIL no esta y existe el interprete del venv, el proceso se REEMPLAZA por el mismo script
corriendo con ese interprete (os.execv, no un subproceso: no queda un python de mas colgado y el
codigo de salida es el de verdad). Si el venv no existe, se corta con la linea exacta que hay que
correr para crearlo, en vez de con un stack trace.

Es idempotente: adentro del venv PIL importa, y esta funcion no hace nada.
"""
import os
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
VENV = RAIZ / '.venv-art' / 'bin' / 'python'


def asegurar():
    try:
        import PIL  # noqa: F401
        return
    except ModuleNotFoundError:
        pass
    # ¿YA ESTAMOS ADENTRO DEL VENV? Se pregunta por sys.prefix, NO comparando ejecutables.
    #
    # El intento obvio —`Path(sys.executable).resolve() == VENV.resolve()`— ESTA MAL y falla
    # justo en el caso comun: .venv-art/bin/python es un SYMLINK al interprete base, asi que
    # resolve() los vuelve el mismo path y la guarda da True aunque estemos afuera. Entonces
    # nunca se re-ejecutaba y el error de PIL salia igual. Con el python de Apple los paths no
    # coinciden y el bug no se ve — por eso hay que probar esto con el python3 del PATH, que es
    # el de Homebrew, y no con /usr/bin/python3.
    #
    # sys.prefix es lo correcto porque un venv lo reescribe apuntando a SU carpeta, symlink o no.
    if Path(sys.prefix) == (RAIZ / '.venv-art'):
        return                      # adentro y aun asi falta PIL: que hable el import de verdad
    if os.environ.get('RASANTE_VENV_REEXEC'):
        return                      # ya reintentamos una vez: no entrar en un bucle de exec
    if VENV.exists():
        os.environ['RASANTE_VENV_REEXEC'] = '1'
        os.execv(str(VENV), [str(VENV), *sys.argv])
    sys.exit(
        'ERROR: falta Pillow, y el venv de arte no existe todavia.\n\n'
        'Crealo una sola vez con:\n'
        '    python3 -m venv .venv-art && ./.venv-art/bin/pip install Pillow\n\n'
        'Despues volve a correr este mismo comando.'
    )


asegurar()
