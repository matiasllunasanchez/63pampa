# ARENA 2.0 — el juego en dos modos: PASILLO y LAS ISLAS

> 20/11/2026, el autor: "el juego va a tener dos modos, el pasillo que es el de toda la vida… y ARENA 2.0… este
> que esta funcionando hoy como Las Islas-Prototipo. El resto, pulso y demas, lo dejamos oculto."

Construye sobre `ANALISIS_ISLAS_REALES.md` (I0: el motor del pasillo sobre el mapa real) y
`PLAN_TEATRO_MALVINAS.md` (I1: el 24 de mayo poblado, las PAC y los radares).

## 1. Los dos modos

| Modo | Que es | Para que |
|---|---|---|
| **PASILLO** | el de toda la vida | los viajes: CONTINENTE → MALVINAS, HACIA UN BUQUE, y la VUELTA |
| **ARENA 2.0 (LAS ISLAS)** | el motor del pasillo volado sobre el mapa real (hoy PRUEBAS → LAS ISLAS) | la mision en si, en una zona de la isla |

- El **arena viejo** (`three-arena.js` como climax del buque) se apaga. Se OCULTA primero; se borra recien cuando
  ninguna mision lo use (hoy las misiones con buque cierran ahi).
- **Pulso, persecucion, pasadas mortales y minutos sagrados**: ocultos (la cuarentena de `data/cuarentena.js`, una
  linea de dato por modo). El codigo queda.

## 2. La mision PASILLO + ARENA

1. **Ida**: el pasillo de siempre, "algo derecho", del continente a las islas.
2. **Transicion**: cinematica o FUNDIDO A NEGRO (fade out / fade in).
3. **Arena**: arrancas en el punto de la mision sobre la isla, dentro de su **zona de mision** (un circulo de
   radio propio, para que la mision no se vaya a la otra punta del mapa). La zona se VE (en el mundo y en el
   mapa).
4. **Vuelta**: VOLVER AL CONTINENTE te pone en el **pasillo de regreso**, que es el de ida invertido en terreno.
   La mision termina bien o mal segun lo que hiciste.

## 3. Las reglas del arena

**Salir de la zona de mision**: aparece un velo con **VUELVE A LA MISION** y una cuenta de 4 s. Si no volves,
fundido a negro y la mision se reinicia. *(A confirmar: si la cuenta es para volver, o si reinicia siempre.)*

**Los bordes del mapa real** (hoy una correa te gira solo hacia el centro; se va):
- **Los costados** (y el norte y el sur del mapa): el avion SE APAGA. Las agujas caen, los controles no
  responden, cae y se estrella.
- **El techo** (la altura maxima): se apaga y baja planeando hasta una altura segura para maniobrar; ahi vuelve
  el motor.

**VOLVER AL CONTINENTE**: un cartel con su tecla, **VOLVER AL CONTINENTE: PRESIONA [tecla]**.
- Aparece cerca de un limite del mapa.
- Al TERMINAR la mision tambien aparece en el medio del mapa (20/11, el autor: "a veces aparece en medio del
  mapa, pero solo cuando terminas la mision").
- Se usa poco: cierra la mision y lleva al pasillo de regreso.

## 4. Fases

- **A1 — Ordenar modos**: LAS ISLAS sale de PRUEBAS a su puerta propia ("ARENA 2.0 · LAS ISLAS — PROTOTIPO");
  el arena viejo y pulso, persec, pasadas y minutos sagrados, ocultos.
- **A2 — Los bordes**: costados = apagado y choque; techo = apagado y planeo hasta la altura segura. Fuera la
  correa.
- **A3 — Volver al continente**: el cartel cerca del limite y, con la mision cumplida, en cualquier lado. Por
  ahora cierra la mision (el pasillo de regreso llega en A5).
- **A4 — La zona de mision**: el circulo (dato de la mision), visible; salir = velo, 4 s y reinicio.
- **A5 — Mision completa**: pasillo de ida → fundido → arena en su zona → volver → pasillo de regreso invertido.
- **A7 — El clima de las islas** (HECHA 20/11: data/islas_clima.js, systems/islas/clima.js, el frio en data/frio.js y systems/frio.js — tambien en el pasillo) (20/11, el autor: "a la isla quiero agregarle factores climaticos"): lluvia
  leve y fuerte, tormenta leve y fuerte, viento leve y fuerte, olas leves y fuertes. Base: lo que el pasillo ya
  tiene (`cfg.rain`, la tormenta de `data/tuning.js`, las rafagas de viento `gusts`, el estado del mar), llevado
  al mapa real; el clima como dato de la mision.
- **A6 — Hornear lo britanico** (vehiculos, buques, todo) para el arena y las misiones: con el detalle del autor.

## 5. Dudas abiertas (del autor)

- La tecla de VOLVER AL CONTINENTE (propuesta: [V] / △ mantenido).
- Las alturas: el techo (hoy `ALTO.TECHO` 1500 m) y la altura segura a la que baja (propuesta: 600 m).
- Cuanto antes del borde aparece VOLVER AL CONTINENTE (propuesta: 15 km).
- El arena viejo: ¿se borra cuando ninguna mision lo use, o queda oculto?
