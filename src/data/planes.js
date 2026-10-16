// AVIONES jugables: datos y precarga de sus imagenes.
import { capasAvion } from './cargas.js';
import { HORNO_VIEJO } from './horno.js';
//
// Cada avion tiene DOS imagenes: `src` es la ilustracion grande del menu de seleccion, y
// `sheet` el sprite sheet que se usa en vuelo (9 columnas de alabeo x 3 filas de cabeceo,
// SHEET_* de abajo). Las genera tools/bake_planes.html desde modelos 3D low-poly; si el arte
// final lo dibuja una persona, tiene que respetar ese mismo layout.
//
// La precarga corre al importar el modulo: los <img> se piden apenas arranca el juego y cada
// uno marca su propio flag (ready/sheetOk) al cargar, asi el render nunca dibuja una imagen
// a medio cargar.
// `src`: LA ILUSTRACION DEL SELECTOR (CICLO DE MUERTE / POR LA PATRIA). Desde el 4/10 sale del horno de
// Blender (tools/blender/armar_seleccion.py): el mismo modelo y el mismo contorno que las hojas, a 390 px
// de ancho — el menu la dibuja sin suavizar. Los dibujos viejos (preview.*) quedan en su carpeta.
// `nombre` (16/10): el nombre COMPLETO, el que va en la pantalla del avion (`name` sigue siendo el corto del
// HUD y los carteles). `ficha`: de donde salio, que se le hizo y como se uso en la guerra — la FICHA DEL
// AVION de esa pantalla. Sale de docs/historia/AVIONES_CATALOGO.md (lo verificado); el TC-68, de su nota
// de abajo. Un dato nuevo se verifica antes de entrar aca (PREGUNTAS_HISTORICAS).
export const PLANES = [
  { key: 'sky', nombre: { es: 'DOUGLAS A-4B SKYHAWK', en: 'DOUGLAS A-4B SKYHAWK' },
    ficha: { es: 'Fuerza Aérea, Grupo 5 de Caza, desde Río Gallegos. Diseño norteamericano de los años 50: sin radar, sin contramedidas y sin misiles aire-aire — bombas y dos cañones de 20 mm que se trababan. El chaff era casero, cortado con una máquina de hacer fideos. Se reabastecía en vuelo del KC-130. Fue el caballo de tiro de la guerra y pagó con bajas altas.',
      en: 'Air Force, 5th Fighter Group, from Río Gallegos. A 1950s American design: no radar, no countermeasures and no air-to-air missiles — bombs and two 20 mm guns that jammed. The chaff was homemade, cut with a pasta machine. It refuelled in flight from the KC-130. The workhorse of the war, and it paid with heavy losses.' },
    name: 'A-4 SKYHAWK', src: '../assets/planes/a4-skyhawk/seleccion.png', sheet: '../assets/planes/a4-skyhawk/sheet.png', sheet2: '../assets/planes/a4-skyhawk/sheet2.png', sheet3: '../assets/planes/a4-skyhawk/sheet3.png', desc: { es: 'Equilibrado - protagonista de la campaña', en: 'Balanced - the campaign workhorse' } },
  // `sonda: false` (12/10, el autor: "no tenian reabastecimiento los Dagger"): sin sonda no hay Chancha —
  // el alcance es solo lo que lleva colgado (por eso volaban con tres tanques). Sin el campo, tiene sonda.
  { key: 'dagger', nombre: { es: 'IAI DAGGER (NESHER)', en: 'IAI DAGGER (NESHER)' },
    ficha: { es: 'El Nesher israelí, derivado del Mirage 5, comprado por la Argentina y rebautizado Dagger. Fuerza Aérea, Grupo 6 de Caza. Mucho más rápido que el Skyhawk, con dos cañones DEFA de 30 mm y misiles Shafrir 2. Sin radar ni contramedidas, y sin sonda: salía del continente con pocos minutos sobre el blanco. Sufrió bajas severas frente a los Sea Harrier.',
      en: 'The Israeli Nesher, derived from the Mirage 5, bought by Argentina and renamed Dagger. Air Force, 6th Fighter Group. Much faster than the Skyhawk, with two 30 mm DEFA guns and Shafrir 2 missiles. No radar, no countermeasures and no refuelling probe: it left the mainland with a few minutes over the target. It took severe losses against the Sea Harriers.' },
    sonda: false, name: 'IAI DAGGER', src: '../assets/planes/iai-dagger/seleccion.png', sheet: '../assets/planes/iai-dagger/sheet.png', sheet2: '../assets/planes/iai-dagger/sheet2.png', sheet3: '../assets/planes/iai-dagger/sheet3.png', desc: { es: 'Mas rapido y con mas fuego - dificil de controlar', en: 'Faster, harder-hitting - tricky to control' } },
  { key: 'supere', nombre: { es: 'DASSAULT SUPER ÉTENDARD', en: 'DASSAULT SUPER ÉTENDARD' },
    ficha: { es: 'Armada, 2ª Escuadrilla Aeronaval de Caza y Ataque, desde Río Grande. Se habían encargado catorce; llegaron cinco antes de que Francia cortara la entrega, y con ellos cinco Exocet AM39. Volaba al ras con el radar apagado y lo prendía unos segundos para marcar el blanco. Hundió el HMS Sheffield y el Atlantic Conveyor. No se perdió ninguno.',
      en: 'Navy, 2nd Naval Fighter and Attack Squadron, from Río Grande. Fourteen had been ordered; five arrived before France cut the delivery, along with five AM39 Exocets. It flew at wave height with its radar off and switched it on for a few seconds to mark the target. It sank HMS Sheffield and the Atlantic Conveyor. None was lost.' },
    name: 'SUPER ETENDARD', src: '../assets/planes/super-etendard/seleccion.png', sheet: '../assets/planes/super-etendard/sheet.png', sheet2: '../assets/planes/super-etendard/sheet2.png', sheet3: '../assets/planes/super-etendard/sheet3.png', desc: { es: 'Misiones especiales - misiles Exocet', en: 'Special missions - Exocet missiles' } },
  { key: 'a4q', nombre: { es: 'DOUGLAS A-4Q SKYHAWK', en: 'DOUGLAS A-4Q SKYHAWK' },
    ficha: { es: 'La versión de la Armada: 3ª Escuadrilla Aeronaval de Caza y Ataque. Embarcada en el portaaviones ARA 25 de Mayo; cuando el portaaviones volvió a puerto, la escuadrilla siguió operando desde tierra, en Río Grande. Participó de los ataques que hundieron la HMS Ardent el 21 de mayo.',
      en: 'The Navy version: 3rd Naval Fighter and Attack Squadron. Embarked on the carrier ARA 25 de Mayo; when the carrier returned to port, the squadron kept flying from land, at Río Grande. It took part in the attacks that sank HMS Ardent on 21 May.' },
    name: 'A-4Q', src: '../assets/planes/a4q/seleccion.png', sheet: '../assets/planes/a4q/sheet.png', sheet2: '../assets/planes/a4q/sheet2.png', sheet3: '../assets/planes/a4q/sheet3.png', desc: { es: 'Variante naval - similar al A-4B/C', en: 'Naval variant - similar to the A-4B/C' } },
  // PAMPA 63 — FUERA DE SELECCION POR AHORA (no borrar: los assets estan horneados y el
  // modelo vive en tools/bake_planes.html).
  // El FMA IA-63 Pampa volo por primera vez en OCTUBRE DE 1984, dos años despues de la
  // guerra: es el unico anacronismo del roster. Vuelve como DESBLOQUEABLE, con la misma
  // placa honesta que usa el Mirage 5P en M10 — nombrar el hecho y despues ofrecer el
  // juego, sin fingir que una cosa es la otra. Ver docs/historia/AVIONES_CATALOGO.md.
  // { key: 'pampa', name: 'PAMPA 63', src: '../assets/planes/pampa-63/seleccion.png', sheet: '../assets/planes/pampa-63/sheet.png', sheet2: '../assets/planes/pampa-63/sheet2.png', sheet3: '../assets/planes/pampa-63/sheet3.png', desc: { es: 'Entrenador biplaza IA-63', en: 'IA-63 two-seat trainer' } },
  // MIRAGE 5P «MARA»: los diez que mando el PERU. Llegaron a Tandil el 5/6/1982 con la
  // escarapela argentina ya pintada y NUNCA entraron en combate (GUION_3 M10, verificado).
  // Por eso su lugar en el juego es el desbloqueo de M10, con la placa que lo dice de frente:
  // "Nunca llegaron a combatir. Aca, si." Ver docs/historia/AVIONES_CATALOGO.md.
  // EL HERCULES BOMBARDERO (16/10, el autor: "quiero agregar al Hercules como jugable en POR LA PATRIA y
  // CICLO DE MUERTE… este Hercules modificado"): el TC-68, el C-130H de la FAA al que le colgaron dos afustes
  // bajo la raiz del ala (un MER de 6 bombas cada uno) y bombardeo el British Wye (29/5) y el Hercules (8/6). OTRO modelo que la
  // Chancha (tools/blender/modelos_hercules.py), que queda como esta.
  //   vuelo   `vel` multiplica la velocidad objetivo, `acel` lo rapido que llega a ella, `turbo` cuanto
  //           del turbo le queda ("vuela mas lento, levanta mucha menos velocidad"); `carga: false`: lo
  //           que cuelga no lo frena (12 bombas de 250 kg son el 4% de lo que levanta)
  //   canon   un solo cañon DESDE EL CENTRO, lento y potente: `cad` tiros/s, `dano` golpes por tiro,
  //           `vel` de la bala (300 la de siempre), `gordo` el tamaño de la trazadora
  //   sinTobera  turbohelice: no hay llama de turbina · sinVariantes: el escuadron vuela la misma hoja
  //   escala / px  se dibuja al DOBLE que un caza ("tiene que ser mas grande"), con las hojas horneadas al
  //           doble de resolucion (cuadro de 168): las proporciones son las del C-130 de verdad
  { key: 'herc', sinPiruetas: true, nombre: { es: 'LOCKHEED C-130H HERCULES (TC-68)', en: 'LOCKHEED C-130H HERCULES (TC-68)' },
    ficha: { es: 'El TC-68: un C-130H de transporte de la Fuerza Aérea al que le colgaron dos afustes bajo la raíz del ala, con seis bombas cada uno. Un carguero convertido en bombardero. Atacó al buque británico British Wye el 29 de mayo y al petrolero Hercules el 8 de junio.',
      en: 'The TC-68: an Air Force C-130H transport fitted with two racks under the wing roots, six bombs each. A cargo plane turned bomber. It attacked the British ship British Wye on 29 May and the tanker Hercules on 8 June.' },
    name: 'HERCULES BOMBARDERO', sonda: false, sinTobera: true, sinVariantes: true, escala: 2, px: 2,
    vuelo: { vel: 0.66, acel: 0.35, turbo: 0.4, carga: false },
    canon: { cad: 2.4, dano: 4, vel: 230, gordo: 2.4 },
    src: '../assets/planes/hercules-bombardero/seleccion.png', sheet: '../assets/planes/hercules-bombardero/sheet.png', sheet2: '../assets/planes/hercules-bombardero/sheet2.png', sheet3: '../assets/planes/hercules-bombardero/sheet3.png',
    desc: { es: 'TC-68 - 12 bombas, lento y pesado, cañon central', en: 'TC-68 - 12 bombs, slow and heavy, centre gun' } },
  { key: 'mirage', nombre: { es: 'DASSAULT MIRAGE 5P «MARA»', en: 'DASSAULT MIRAGE 5P «MARA»' },
    ficha: { es: 'Diez Mirage 5P que mandó el Perú. Salieron de La Joya, hicieron escala en Jujuy y aterrizaron en Tandil el 5 de junio de 1982, con la escarapela argentina ya pintada. Los pilotos peruanos volvieron a su país ese mismo día. Nunca entraron en combate. Acá, sí.',
      en: 'Ten Mirage 5Ps sent by Peru. They left La Joya, stopped in Jujuy and landed at Tandil on 5 June 1982, already wearing the Argentine roundel. The Peruvian pilots flew home that same day. They never saw combat. Here, they do.' },
    name: 'MIRAGE 5P MARA', src: '../assets/planes/mirage-5p/seleccion.png', sheet: '../assets/planes/mirage-5p/sheet.png', sheet2: '../assets/planes/mirage-5p/sheet2.png', sheet3: '../assets/planes/mirage-5p/sheet3.png', desc: { es: 'El regalo del Peru - rapido, con poca autonomia', en: 'Peru\'s gift - fast, short legs' } },

  // LOS AVIONES DE LAS MISIONES SECUNDARIAS (16/10, el autor: "nos faltan los aviones de vuelos de diversion
  // para elegir… hagamos todos los que falten, seleccionables al menos para CICLO DE MUERTE y POR LA PATRIA").
  // Salen de docs/historia/misiones/MISIONES_SUELTAS.md; los modelos, de tools/blender/modelos_aviones.py.
  // Todos argentinos (FAA, Armada o civiles del Fenix con la bandera). Los que no tenian armas llevan un
  // cañon liviano DE LICENCIA (`canon`), como el Hercules; las bombas de la tecla son las de todos.
  // Y EL PAMPA, que vuelve al roster con su placa honesta: no existia en 1982.
  { key: 'pampa', nombre: { es: 'FMA IA-63 PAMPA', en: 'FMA IA-63 PAMPA' },
    ficha: { es: 'Entrenador a reacción diseñado en Córdoba por la Fábrica Militar de Aviones, con Dornier. Voló por primera vez en octubre de 1984, dos años después de la guerra: no estuvo en Malvinas. Acá, sí.',
      en: 'Jet trainer designed in Córdoba by the Fábrica Militar de Aviones, with Dornier. It first flew in October 1984, two years after the war: it was never in the Falklands. Here, it is.' },
    name: 'PAMPA 63', sonda: false,
    src: '../assets/planes/pampa-63/seleccion.png', sheet: '../assets/planes/pampa-63/sheet.png', sheet2: '../assets/planes/pampa-63/sheet2.png', sheet3: '../assets/planes/pampa-63/sheet3.png',
    desc: { es: 'Entrenador biplaza IA-63 - no llegó a la guerra', en: 'IA-63 two-seat trainer - too late for the war' } },
  { key: 'pucara', nombre: { es: 'FMA IA-58 PUCARÁ', en: 'FMA IA-58 PUCARÁ' },
    ficha: { es: 'Avión de ataque a tierra diseñado y fabricado en Córdoba por la Fábrica Militar de Aviones. Biplaza en tándem, dos turbohélices, dos cañones de 20 mm y cuatro ametralladoras. Fuerza Aérea, Grupo 3 de Ataque: operó desde las islas, en Pradera del Ganso (BAM Cóndor) y Puerto Argentino, en pistas cortas y de pasto. Muchos se perdieron en tierra y en combate.',
      en: 'Ground-attack aircraft designed and built in Córdoba by the Fábrica Militar de Aviones. Tandem two-seater, two turboprops, two 20 mm guns and four machine guns. Air Force, 3rd Attack Group: it flew from the islands themselves, at Goose Green (BAM Cóndor) and Stanley, off short grass strips. Many were lost on the ground and in combat.' },
    name: 'IA-58 PUCARA', sonda: false, sinTobera: true, sinVariantes: true, vuelo: { vel: 0.72, acel: 0.6, turbo: 0.55 },
    src: '../assets/planes/ia58-pucara/seleccion.png', sheet: '../assets/planes/ia58-pucara/sheet.png', sheet2: '../assets/planes/ia58-pucara/sheet2.png', sheet3: '../assets/planes/ia58-pucara/sheet3.png',
    desc: { es: 'Ataque a tierra argentino - lento, duro y con cañones', en: 'Argentine ground attack - slow, tough, heavy guns' } },
  { key: 'mb339', nombre: { es: 'AERMACCHI MB-339A', en: 'AERMACCHI MB-339A' },
    ficha: { es: 'Entrenador y ataque liviano italiano de la Armada, 1ª Escuadrilla de Ataque, desde Puerto Argentino. En abril cambió el blanco y rojo de escuela por camuflaje arena y verde. El 21 de mayo el teniente Owen Crippa, en el 4-A-115, se encontró solo con el desembarco en San Carlos, atacó con cohetes y cañones y volvió a contar lo que había visto.',
      en: 'Italian trainer and light attack jet of the Navy, 1st Attack Squadron, from Stanley. In April its red-and-white trainer paint gave way to tan and green camouflage. On 21 May Lt. Owen Crippa, in 4-A-115, came across the San Carlos landing alone, attacked with rockets and guns and flew back to report what he had seen.' },
    name: 'MB-339A', sonda: false, sinVariantes: true, vuelo: { vel: 0.85, acel: 0.75, turbo: 0.8 },
    src: '../assets/planes/mb-339a/seleccion.png', sheet: '../assets/planes/mb-339a/sheet.png', sheet2: '../assets/planes/mb-339a/sheet2.png', sheet3: '../assets/planes/mb-339a/sheet3.png',
    desc: { es: 'Entrenador de la Armada - liviano, cohetes y cañones', en: 'Navy trainer - light, rockets and guns' } },
  { key: 'neptune', nombre: { es: 'LOCKHEED SP-2H NEPTUNE', en: 'LOCKHEED SP-2H NEPTUNE' },
    ficha: { es: 'El patrullero marítimo de la Armada, Escuadrilla Aeronaval de Exploración: dos motores a pistón, dos turbinas de apoyo y el radar bajo la panza. Buscó a la flota británica para guiar a los Super Étendard, y buscó en el mar a los náufragos del General Belgrano. Gastados y sin repuestos por el embargo, se retiraron a mediados de mayo. No llevaba armas: el cañón liviano es licencia del juego.',
      en: 'The Navy maritime patrol aircraft, Naval Reconnaissance Squadron: two piston engines, two boost jets and the radar under the belly. It hunted the British fleet to guide the Super Étendards, and searched the sea for the General Belgrano survivors. Worn out and short of spares under the embargo, they were retired in mid-May. It carried no weapons: the light gun is a game licence.' },
    name: 'SP-2H NEPTUNE', sonda: false, sinTobera: true, sinVariantes: true, sinPiruetas: true, escala: 1.8, px: 2,
    vuelo: { vel: 0.6, acel: 0.35, turbo: 0.4, carga: false }, canon: { cad: 4, dano: 1, vel: 300, gordo: 1.2 },
    src: '../assets/planes/sp2h-neptune/seleccion.png', sheet: '../assets/planes/sp2h-neptune/sheet.png', sheet2: '../assets/planes/sp2h-neptune/sheet2.png', sheet3: '../assets/planes/sp2h-neptune/sheet3.png',
    desc: { es: 'Patrullero de la Armada - enorme, lento, radar', en: 'Navy patrol plane - huge, slow, radar' } },
  { key: 'learjet', nombre: { es: 'LEARJET 35A', en: 'LEARJET 35A' },
    ficha: { es: 'Escuadrón Fénix: pilotos civiles y militares que volaban aviones ejecutivos —muchos prestados por empresas privadas— para la Fuerza Aérea. Iban hacia las islas para que el radar británico los viera y lanzara a los Sea Harrier detrás de ellos, guiaban a las escuadrillas de ataque y hacían de puente de radio para que los A-4 volaran callados. El Learjet 35A era de la Fuerza Aérea (Grupo 1 Aerofotográfico). El 7 de junio, en una misión de fotografía a gran altura, el T-24 fue derribado por un Sea Dart de la HMS Exeter; murieron sus cinco tripulantes, entre ellos el vicecomodoro Rodolfo de la Colina. No llevaba armas: el cañón liviano es licencia del juego.',
      en: 'Escuadrón Fénix: civilian and military pilots flying business aircraft —many lent by private companies— for the Air Force. They flew toward the islands so British radar would see them and send the Sea Harriers after them, guided the attack flights and relayed radio so the A-4s could fly silent. The Learjet 35A belonged to the Air Force (1st Aerial Photography Group). On 7 June, on a high-altitude photo mission, T-24 was shot down by a Sea Dart from HMS Exeter; its five crew died, among them Vice-Commodore Rodolfo de la Colina. It carried no weapons: the light gun is a game licence.' },
    name: 'LEARJET 35A', sonda: false, sinTobera: true, sinVariantes: true, vuelo: { vel: 0.92, acel: 0.7, turbo: 0.7 }, canon: { cad: 4, dano: 1, vel: 300, gordo: 1.2 },
    src: '../assets/planes/learjet-35a/seleccion.png', sheet: '../assets/planes/learjet-35a/sheet.png', sheet2: '../assets/planes/learjet-35a/sheet2.png', sheet3: '../assets/planes/learjet-35a/sheet3.png',
    desc: { es: 'Escuadrón Fénix - rápido, sin armas de verdad', en: 'Fénix Squadron - fast, no real weapons' } },
  { key: 'citation', nombre: { es: 'CESSNA CITATION', en: 'CESSNA CITATION' },
    ficha: { es: 'Escuadrón Fénix: pilotos civiles y militares que volaban aviones ejecutivos —muchos prestados por empresas privadas— para la Fuerza Aérea. Iban hacia las islas para que el radar británico los viera y lanzara a los Sea Harrier detrás de ellos, guiaban a las escuadrillas de ataque y hacían de puente de radio para que los A-4 volaran callados. El Citation, un jet ejecutivo civil prestado por su empresa. No llevaba armas: el cañón liviano es licencia del juego.',
      en: 'Escuadrón Fénix: civilian and military pilots flying business aircraft —many lent by private companies— for the Air Force. They flew toward the islands so British radar would see them and send the Sea Harriers after them, guided the attack flights and relayed radio so the A-4s could fly silent. The Citation, a civilian business jet lent by its company. It carried no weapons: the light gun is a game licence.' },
    name: 'CITATION', sonda: false, sinTobera: true, sinVariantes: true, vuelo: { vel: 0.85, acel: 0.65, turbo: 0.65 }, canon: { cad: 4, dano: 1, vel: 300, gordo: 1.2 },
    src: '../assets/planes/cessna-citation/seleccion.png', sheet: '../assets/planes/cessna-citation/sheet.png', sheet2: '../assets/planes/cessna-citation/sheet2.png', sheet3: '../assets/planes/cessna-citation/sheet3.png',
    desc: { es: 'Escuadrón Fénix - jet ejecutivo civil', en: 'Fénix Squadron - civilian business jet' } },
  { key: 'merlin', nombre: { es: 'SWEARINGEN MERLIN', en: 'SWEARINGEN MERLIN' },
    ficha: { es: 'Escuadrón Fénix: pilotos civiles y militares que volaban aviones ejecutivos —muchos prestados por empresas privadas— para la Fuerza Aérea. Iban hacia las islas para que el radar británico los viera y lanzara a los Sea Harrier detrás de ellos, guiaban a las escuadrillas de ataque y hacían de puente de radio para que los A-4 volaran callados. El Merlin, un turbohélice ejecutivo civil. No llevaba armas: el cañón liviano es licencia del juego.',
      en: 'Escuadrón Fénix: civilian and military pilots flying business aircraft —many lent by private companies— for the Air Force. They flew toward the islands so British radar would see them and send the Sea Harriers after them, guided the attack flights and relayed radio so the A-4s could fly silent. The Merlin, a civilian turboprop. It carried no weapons: the light gun is a game licence.' },
    name: 'MERLIN', sonda: false, sinTobera: true, sinVariantes: true, vuelo: { vel: 0.72, acel: 0.55, turbo: 0.5 }, canon: { cad: 4, dano: 1, vel: 300, gordo: 1.2 },
    src: '../assets/planes/swearingen-merlin/seleccion.png', sheet: '../assets/planes/swearingen-merlin/sheet.png', sheet2: '../assets/planes/swearingen-merlin/sheet2.png', sheet3: '../assets/planes/swearingen-merlin/sheet3.png',
    desc: { es: 'Escuadrón Fénix - turbohélice civil', en: 'Fénix Squadron - civilian turboprop' } },
  { key: 'mu2', nombre: { es: 'MITSUBISHI MU-2', en: 'MITSUBISHI MU-2' },
    ficha: { es: 'Escuadrón Fénix: pilotos civiles y militares que volaban aviones ejecutivos —muchos prestados por empresas privadas— para la Fuerza Aérea. Iban hacia las islas para que el radar británico los viera y lanzara a los Sea Harrier detrás de ellos, guiaban a las escuadrillas de ataque y hacían de puente de radio para que los A-4 volaran callados. El MU-2, un turbohélice japonés de ala alta. No llevaba armas: el cañón liviano es licencia del juego.',
      en: 'Escuadrón Fénix: civilian and military pilots flying business aircraft —many lent by private companies— for the Air Force. They flew toward the islands so British radar would see them and send the Sea Harriers after them, guided the attack flights and relayed radio so the A-4s could fly silent. The MU-2, a high-wing Japanese turboprop. It carried no weapons: the light gun is a game licence.' },
    name: 'MU-2', sonda: false, sinTobera: true, sinVariantes: true, vuelo: { vel: 0.74, acel: 0.6, turbo: 0.5 }, canon: { cad: 4, dano: 1, vel: 300, gordo: 1.2 },
    src: '../assets/planes/mitsubishi-mu2/seleccion.png', sheet: '../assets/planes/mitsubishi-mu2/sheet.png', sheet2: '../assets/planes/mitsubishi-mu2/sheet2.png', sheet3: '../assets/planes/mitsubishi-mu2/sheet3.png',
    desc: { es: 'Escuadrón Fénix - turbohélice de ala alta', en: 'Fénix Squadron - high-wing turboprop' } },
  { key: 'aerostar', nombre: { es: 'AEROSTAR 601', en: 'AEROSTAR 601' },
    ficha: { es: 'Escuadrón Fénix: pilotos civiles y militares que volaban aviones ejecutivos —muchos prestados por empresas privadas— para la Fuerza Aérea. Iban hacia las islas para que el radar británico los viera y lanzara a los Sea Harrier detrás de ellos, guiaban a las escuadrillas de ataque y hacían de puente de radio para que los A-4 volaran callados. El Aerostar, un bimotor a pistón chico y rápido. No llevaba armas: el cañón liviano es licencia del juego.',
      en: 'Escuadrón Fénix: civilian and military pilots flying business aircraft —many lent by private companies— for the Air Force. They flew toward the islands so British radar would see them and send the Sea Harriers after them, guided the attack flights and relayed radio so the A-4s could fly silent. The Aerostar, a small, fast piston twin. It carried no weapons: the light gun is a game licence.' },
    name: 'AEROSTAR', sonda: false, sinTobera: true, sinVariantes: true, vuelo: { vel: 0.7, acel: 0.65, turbo: 0.5 }, canon: { cad: 4, dano: 1, vel: 300, gordo: 1.2 },
    src: '../assets/planes/aerostar-601/seleccion.png', sheet: '../assets/planes/aerostar-601/sheet.png', sheet2: '../assets/planes/aerostar-601/sheet2.png', sheet3: '../assets/planes/aerostar-601/sheet3.png',
    desc: { es: 'Escuadrón Fénix - bimotor chico', en: 'Fénix Squadron - small piston twin' } },
  { key: 'commander', nombre: { es: 'ROCKWELL TURBO COMMANDER', en: 'ROCKWELL TURBO COMMANDER' },
    ficha: { es: 'Escuadrón Fénix: pilotos civiles y militares que volaban aviones ejecutivos —muchos prestados por empresas privadas— para la Fuerza Aérea. Iban hacia las islas para que el radar británico los viera y lanzara a los Sea Harrier detrás de ellos, guiaban a las escuadrillas de ataque y hacían de puente de radio para que los A-4 volaran callados. El Commander, un turbohélice ejecutivo de ala alta. No llevaba armas: el cañón liviano es licencia del juego.',
      en: 'Escuadrón Fénix: civilian and military pilots flying business aircraft —many lent by private companies— for the Air Force. They flew toward the islands so British radar would see them and send the Sea Harriers after them, guided the attack flights and relayed radio so the A-4s could fly silent. The Commander, a high-wing business turboprop. It carried no weapons: the light gun is a game licence.' },
    name: 'COMMANDER', sonda: false, sinTobera: true, sinVariantes: true, vuelo: { vel: 0.72, acel: 0.55, turbo: 0.5 }, canon: { cad: 4, dano: 1, vel: 300, gordo: 1.2 },
    src: '../assets/planes/turbo-commander/seleccion.png', sheet: '../assets/planes/turbo-commander/sheet.png', sheet2: '../assets/planes/turbo-commander/sheet2.png', sheet3: '../assets/planes/turbo-commander/sheet3.png',
    desc: { es: 'Escuadrón Fénix - turbohélice ejecutivo', en: 'Fénix Squadron - business turboprop' } },
  { key: 'guarani', nombre: { es: 'FMA IA-50 GUARANÍ II', en: 'FMA IA-50 GUARANÍ II' },
    ficha: { es: 'Transporte liviano diseñado y fabricado en Córdoba por la Fábrica Militar de Aviones, de la Fuerza Aérea. Figura en la flota del Escuadrón Fénix, que volaba hacia las islas para distraer al radar británico, guiar a las escuadrillas y hacer de puente de radio. No llevaba armas: el cañón liviano es licencia del juego.',
      en: 'Light transport designed and built in Córdoba by the Fábrica Militar de Aviones, flown by the Air Force. It appears in the Fénix Squadron fleet, which flew toward the islands to decoy British radar, guide the attack flights and relay radio. It carried no weapons: the light gun is a game licence.' },
    name: 'GUARANI II', sonda: false, sinTobera: true, sinVariantes: true, escala: 1.3, px: 2, sinPiruetas: true,
    vuelo: { vel: 0.66, acel: 0.45, turbo: 0.45, carga: false }, canon: { cad: 4, dano: 1, vel: 300, gordo: 1.2 },
    src: '../assets/planes/ia50-guarani/seleccion.png', sheet: '../assets/planes/ia50-guarani/sheet.png', sheet2: '../assets/planes/ia50-guarani/sheet2.png', sheet3: '../assets/planes/ia50-guarani/sheet3.png',
    desc: { es: 'Escuadrón Fénix - transporte hecho en Córdoba', en: 'Fénix Squadron - transport made in Córdoba' } },
];
// 84x48 por cuadro (antes 56x32): se re-hornearon a 1.5x al subir la grilla del juego a 480x270.
// Con el buffer 2x del juego, el sprite cae a 2x EXACTO en pantalla — pixel art nitido.
// 9 cols (alabeo) x 3 filas (cabeceo: trepa/nivel/pica); tambien spec para arte manual.
// FRAME CUADRADO: el alto subio de 48 a 84 porque al alabear 60° la envergadura se para y las
// puntas de ala quedaban cortadas. El avion NO cambio de tamaño — lo que se agrego es aire
// transparente arriba y abajo, y el sprite se dibuja centrado.
export const SHEET_FW = 84, SHEET_FH = 84, SHEET_NF = 9, SHEET_ROWS = 3;
// LA HOJA DEL PODER va al DOBLE de resolucion de fuente y NO cambia nada en pantalla: durante el
// poder el sprite se dibuja a 142,8 px de mundo, o sea 3,4 px de pantalla por pixel horneado con
// la hoja de 84. Con 168 vuelve a 1,7 — exactamente la nitidez que el avion tiene en el pasillo.
// Lo unico que cambia en el render es el RECTANGULO DE ORIGEN del recorte; el tamaño dibujado no.
export const SHEET3_FW = 168, SHEET3_FH = 168;
// HOJA 4 (LA COBRA, el freno): 9 alabeos x 3 cabeceos de 40/75/100°, cuadro de 126. Vertical el avion
// mide su LARGO y no entraba en 84, asi que se horneo con la camara abierta x1,5: el avion tiene los
// mismos pixeles que en la hoja base, y el render dibuja el cuadro x1,5 (SHEET4_K) para que calce.
export const SHEET4_FW = 126, SHEET4_FH = 126, SHEET4_K = 1.5;
// ALTO DEL AVION dentro del frame. El frame es cuadrado (84) pero el avion sigue ocupando los
// mismos 48 px de siempre: el resto es aire transparente, arriba y abajo, para que quepa girado.
// Todo lo que se dibuje PEGADO al avion (llama de la turbina, fogonazos) tiene que medirse contra
// ESTO y no contra SHEET_FH — si no, queda flotando a 18 px de la cola.
export const SHEET_BODY_H = 48;
PLANES.forEach(pl => {
  // EL HORNO VIEJO (data/horno.js): con `?horno=three` las hojas son las que horneaba three.js,
  // guardadas en <carpeta>/three/. Las capas de carga lo siguen solas: se piden de la carpeta de
  // `sheet`. (La carpeta sale de la hoja y no de un literal: tools/build_web.py re-embebe cada
  // '../assets/…' que encuentra, y una ruta armada a medias lo hace fallar.)
  if (HORNO_VIEJO && pl.sheet) {
    const viejo = r => r && r.slice(0, r.lastIndexOf('/') + 1) + 'three/' + r.slice(r.lastIndexOf('/') + 1);
    pl.sheet = viejo(pl.sheet); pl.sheet2 = viejo(pl.sheet2); pl.sheet3 = viejo(pl.sheet3);
  }
  // LA HOJA 4 sale de la misma carpeta que la base. three.js nunca la horneo: con el horno viejo no
  // hay cobra dibujada y el render cae a la trepada de la hoja 2 (fallback real, como las otras).
  if (pl.sheet && !pl.sheet4 && !HORNO_VIEJO) pl.sheet4 = pl.sheet.replace(/sheet\.png$/, 'sheet4.png');
  pl.img = new Image(); pl.ready = false; pl.w = 977; pl.h = 471;
  pl.img.onload = () => { pl.ready = true; pl.w = pl.img.naturalWidth; pl.h = pl.img.naturalHeight; };
  pl.img.src = pl.src;
  // la hoja es OPCIONAL: un avion sin `sheet` vuela con la ilustracion. Sin este guard se pediria
  // una imagen inexistente y quedaria un 404 en la consola.
  pl.sheetOk = false;
  if (pl.sheet) {
    pl.sheetImg = new Image();
    pl.sheetImg.onload = () => { pl.sheetOk = true; };
    pl.sheetImg.src = pl.sheet;
    // HOJA 2 (cabeceos EMPINADOS ±32°, para las piruetas): misma carpeta, 9 cols x 2 filas
    // (fila 0 = trepada fuerte, fila 1 = picada fuerte). Es OPCIONAL con fallback real: el build
    // web la descarta (limite de 16 MB) y el render cae a las filas normales de la hoja base.
    pl.sheet2Ok = false;
    if (pl.sheet2) {
      pl.sheet2Img = new Image();
      pl.sheet2Img.onload = () => { pl.sheet2Ok = true; };
      pl.sheet2Img.src = pl.sheet2;
    }
    // HOJA 3 (el PODER RASANTE): la misma grilla de 9x3 pero vista desde 35,5° AL COSTADO y 10°
    // por DEBAJO — que es de donde la mira la camara del poder, y no de donde la mira la del
    // pasillo. Frame al doble (168) porque durante el poder el sprite se dibuja al doble de
    // tamaño. Tambien es OPCIONAL con fallback real: si no cargo se sigue usando la hoja base,
    // que es lo que se venia usando hasta ahora.
    pl.sheet3Ok = false;
    if (pl.sheet3) {
      pl.sheet3Img = new Image();
      pl.sheet3Img.onload = () => { pl.sheet3Ok = true; };
      pl.sheet3Img.src = pl.sheet3;
    }
    pl.sheet4Ok = false;
    if (pl.sheet4) {
      pl.sheet4Img = new Image();
      pl.sheet4Img.onload = () => { pl.sheet4Ok = true; };
      pl.sheet4Img.src = pl.sheet4;
    }
    // LAS CAPAS DE CARGA (tanques y bombas), una por pieza y por vista — ver data/cargas.js. Viven
    // en la misma carpeta que las hojas y llevan el mismo sufijo: '' / '2' / '3'. Si una capa no
    // cargo, simplemente no se pinta: el avion vuela limpio, que es el fallback natural.
    const dir = pl.sheet.slice(0, pl.sheet.lastIndexOf('/') + 1);
    pl.capas = {};
    for (const nom of capasAvion(pl.key)) {
      // (la '5' es la de la HOJA FINA; el horno viejo no la tiene)
      pl.capas[nom] = ['', '2', '3', '4', ...(!HORNO_VIEJO ? ['5'] : [])].map(suf => { const im = new Image(); im.src = dir + nom + suf + '.png'; return im; });
    }
    // LAS VARIANTES DEL ESCUADRON (autor, 8/10: "todos tienen el mismo avion — deberian tener
    // variantes"): cuatro hojas base por avion, una por numeral — otro reparto y tono del camuflaje,
    // y dos con las bandas amarillas de identificacion (tools/blender/modelos.py, `_variantes`).
    // Las dibuja render/squad.js para los numerales fuera de campaña; si no cargan (build web, horno
    // viejo) los numerales vuelan con la hoja de siempre.
    // EL TREN DE ATERRIZAJE horneado (9/10): una capa con la grilla de la hoja base (render/plane.js
    // drawTren). Sin ella —build web, horno viejo— el tren se dibuja como antes.
    pl.tren = null;
    if (!HORNO_VIEJO) { pl.tren = new Image(); pl.tren.src = dir + 'tren.png'; }
    // LA HOJA FINA (14/10, probada en el A-4 y pasada a todos): 13 alabeos x 5 cabeceos — sheet5.png y su
    // tren. La usa render/plane.js en lugar de la base cuando cargo (`?fino=0` para comparar).
    pl.sheet5Ok = false; pl.tren5 = null;
    if (!HORNO_VIEJO) {
      pl.sheet5Img = new Image();
      pl.sheet5Img.onload = () => { pl.sheet5Ok = true; };
      pl.sheet5Img.src = dir + 'sheet5.png';
      pl.tren5 = new Image(); pl.tren5.src = dir + 'tren5.png';
    }
    // (EL SELECTOR ANIMADO, 16/10: las hojas seleccion_anim / seleccion_tonel siguen en cada carpeta, pero el
    // menu dibuja la ilustracion quieta — "deja de moverlos, que floten nomas" — y ya no se piden)
    pl.variantes = HORNO_VIEJO || pl.sinVariantes ? [] : [1, 2, 3, 4].map(n => { const im = new Image(); im.src = dir + 'variante' + n + '.png'; return im; });
  }
});
