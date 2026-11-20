# EL TEATRO DE MALVINAS — las islas pobladas (prototipo I1)

> 19/11/2026, el autor: "un buen plan de Malvinas… enemigos en las islas, bases britanicas y bases argentinas, mas
> o menos en el medio del conflicto y cuando empezaron a desembarcar, pero era dificil encontrarlos… nosotros
> teniamos Puerto Argentino y quiza Pradera del Ganso, con patrullas de a 2 Harriers volando en circulos u ochos,
> algunos antiaereos, bases con edificios, antiaereos, vehiculos y los soldados del pasillo dando vueltas… Rellena
> el mapa para dar una vuelta de reconocimiento. Que los enemigos te ataquen. Llena de buques o fragatas, mas que
> nada en Bahia San Carlos."

Construye sobre el prototipo I0 (`docs/proyecto/ANALISIS_ISLAS_REALES.md`): el motor del PASILLO volado sobre el
mapa real. Se entra igual: PRUEBAS → LAS ISLAS.

## 1. El momento: 24 de mayo de 1982

El tercer dia de la cabeza de playa de San Carlos. Por que ese dia:

- **Los britanicos ya bajaron, pero no salieron.** El desembarco empezo la madrugada del 21. Al 24 estan en la
  cabeza de playa: Puerto San Carlos, el asentamiento de San Carlos, Bahia Ajax (el frigorifico, hospital y
  depositos) y las alturas que la rodean (Monte Sussex al sur). Teal Inlet, Monte Kent y Pradera del Ganso son
  despues (28–31 de mayo).
- **La Bahia San Carlos esta llena.** Es "el callejon de las bombas": fragatas de escolta en la boca y en el
  Estrecho, buques logisticos y de desembarco fondeados adentro, y Rapier en los cerros. El 23 fue atacada la
  HMS Antelope (exploto esa noche, adentro de la bahia) y el 24 cuatro buques de desembarco recibieron bombas.
- **Nosotros tenemos el resto.** Puerto Argentino y su aeropuerto (BAM Malvinas), Pradera del Ganso y Darwin
  (BAM Condor, los Pucara), las guarniciones de la Gran Malvina (Puerto Yapeyu y Bahia Fox), los montes al oeste
  de Puerto Argentino y la pista de Isla Borbon (con los restos del ataque SAS del 15).
- **Encontrarlos es dificil.** El britanico esta escondido en los cerros de San Carlos; afuera de ahi casi no hay
  nada suyo en tierra. La amenaza que se ve es la del aire (las PAC de Harriers) y la del mar.

⚠ A VERIFICAR (van a `docs/historia/PREGUNTAS_HISTORICAS.md`): que buques estaban EXACTAMENTE en la bahia el 24
(los nombres van como ejemplo, no como registro); las posiciones son aproximadas (~1 km) y se ajustan al terreno.

## 2. Que hay y donde (data/islas_teatro.js)

| Lugar | Bando | Que |
|---|---|---|
| Puerto San Carlos | GB | carpas, deposito, puesto, Rapier ×2, camion, soldados |
| San Carlos (asentamiento) | GB | carpas, deposito, radar, Rapier, soldados |
| Bahia Ajax | GB | deposito grande (el frigorifico), carpas, Rapier, camiones, soldados |
| Monte Sussex | GB | puestos, misil al hombro ×2, soldados |
| Cabo Fanning | GB | puesto, misil al hombro, Rapier |
| Bahia San Carlos (agua) | GB | 2 fragatas Tipo 21, 1 destructor Tipo 42, 4 logisticos/desembarco fondeados |
| Boca del Estrecho | GB | 2 fragatas Tipo 21 de piquete |
| Puerto Argentino + BAM Malvinas | ARG | edificios, depositos, radar, antiaereos (cañon), camiones, soldados, Pucara/Hercules en la pista |
| Pradera del Ganso + Darwin | ARG | edificios, antiaereos, Pucara en la pista, soldados |
| Puerto Yapeyu, Bahia Fox | ARG | guarnicion: carpas, puesto, antiaereo, soldados |
| Monte Kent, Longdon, Dos Hermanas | ARG | puestos y soldados |
| Isla Borbon | ARG | la pista con restos |

**LAS PAC (patrullas aereas de combate):** parejas de Sea Harrier dando vueltas, en circulo o en ocho, a 300 m:
sobre el Estrecho de San Carlos (norte y sur de la boca), sobre la Gran Malvina (entre Puerto Yapeyu e Isla
Borbon) y al norte de la Soledad. Los portaaviones estan fuera del mapa, al este.

Cada pieza nace en su lugar del mapa y **se acomoda al terreno**: lo de tierra busca suelo plano cerca de su
punto; los buques, agua honda.

## 3. Como se juega

- **Ver**: todo se dibuja en 3D sobre el mapa, en las tres camaras (las mallas de Blender, las mismas familias
  que el pasillo: `tools/blender/modelos_*`, exportadas con `exportar_malla.py --modulo`). De lejos se apagan
  (los soldados primero).
- **Que te ataquen** (solo los britanicos):
  - **Antiaereo de tierra y de buque**: si estas adelante y en su alcance, tiran con las armas del pasillo —
    el Rapier y el misil al hombro, misiles; el cañon del buque y el puesto, trazadoras—. Entran al carril del
    pasillo, asi que se esquivan y pegan IGUAL que en el pasillo (collision.js).
  - **Las PAC**: si te acercas a una pareja (≈3 km), rompe el circulo y te toma la cola: es el DUELO DEL
    PASILLO (systems/caza.js, dos Harriers de patrulla con sus Sidewinder). Si los bajas, esa PAC no vuelve; si
    se van, vuelven a su circulo un rato despues.
- **Las zonas de radar** (20/11, `RADARES`): la nuestra (Puerto Argentino) y las de ellos (el Coventry, el
  Broadsword, la bahia). Adentro de una britanica y arriba de 45 m te ven: la PAC mas cercana (hasta 30 km) sale
  de su circulo a buscarte y, si el radar te pierde 10 s, vuelve. Adentro de la nuestra los Harriers no entran
  —los que te perseguian se van— y el radar te avisa de la PAC que sale. Los Harriers del duelo tiran rafagas de
  cañon de 6 tiros al punto donde estabas (se esquivan moviendose en el aviso) ademas de sus Sidewinder. El mapa
  de la pausa dibuja los circulos.
- **Atacar**: el cañon (las balas sobre el mapa) y las bombas rompen piezas: cada una revienta con la explosion
  3D. Lo argentino tambien se rompe — y no suma.
- **Los argentinos** son decorado vivo: sus soldados caminan, sus antiaereos no te tiran.
- **Mision**: por ahora la de I0 (la BASE COSTERA a bombardear) mas la vuelta de reconocimiento libre. El
  MAPA de la pausa marca las bases conocidas (las argentinas siempre; las britanicas, cuando las pasaste cerca).

## 4. Fases

- **T1 (esta)**: los datos, las mallas, el dibujo, las PAC, el antiaereo que tira, romper piezas, el mapa.
- **T2**: misiones sobre el teatro (bombardear la bahia, escoltar, buscar la cabeza de playa con niebla).
- **T3**: ajustar alcances y cadencias jugando; sonido de cada arma en el mapa; Sea Dart/Sea Wolf propios del
  buque (systems/seawolf.js) en vez de la trazadora generica.

## 5. Donde vive

- `src/data/islas_teatro.js` — el orden de batalla (lugares, piezas, PAC, buques).
- `src/systems/islas/teatro.js` — arma el teatro sobre el mapa, mueve las PAC y los soldados, decide los tiros,
  recibe balas y bombas.
- `src/systems/islas/teatro3d.js` — lo dibuja (mallas en metros, con su medida real).
- `assets/mallas/` — harrier, t21, t42, log, nido_rapier, manpad, camion_aa, radar, carpa, deposito, puesto,
  soldado_corre.
