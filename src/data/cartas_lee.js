// LO QUE SE LEE DE CADA CARTA DEL BANCO — POR LA PATRIA y CICLO DE MUERTE. Datos puros.
//
// Las cartas del banco suelto (data/banco_suelto.js `CARTAS`, con las piruetas, CHAFITAS, METRALLA, CINTA
// y la BRP de data/upgrades.js) son verticales: la cara muestra el nombre, la linea corta (`desc`) y la
// voz (`quote`). Bajando (ABAJO sobre la carta) se lee esto. Lo dibuja render/menus.js `drawBanco`.
//
// El autor: "EXPLICAR Y QUE SE APRENDA con cada carta pero sin ser aburrido". Tres campos por carta:
//   que       QUE HACE EN EL JUEGO: la mecanica en criollo, con el precio y la tecla (~170 caracteres)
//   dato      UN numero o un hecho, en grande y en mayusculas (~38 caracteres)
//   historia  EN 1982 (en las piruetas, EN EL AIRE): lo real detras de la carta (~300 caracteres).
//             Si la carta es invento del juego, lo dice en una linea y cuenta la idea real que evoca.
//
// ⚠ LA REGLA: lo que no esta verificado no entra. Las fuentes son las del repo (docs/historia/
// ARMAMENTO_1982.md, AVIONES_CATALOGO.md, MEJORAS_PICHON.md, PREGUNTAS_HISTORICAS.md, docs/sistemas/
// FALLAS_1982.md y los comentarios de data/bombas.js, upgrades.js, banco_suelto.js). Lo dudoso se escribe
// en general, sin numeros ni nombres ni citas inventadas. Y la regla de atribucion de MEJORAS_PICHON.md:
// ningun personaje del juego invento nada de esto — los nombres reales van a la placa del cierre.
//
// Sin tildes (como el resto de los textos de datos); la Ñ si.

export const LEE = {
  // ---------------- ARMAS ----------------
  metralla2: {
    que: 'Duplica la cadencia del cañon: el doble de tiros por segundo con X o ESPACIO. Ojo que la cinta se gasta igual de rapido: recalienta antes si no soltas el gatillo.',
    dato: 'MIL TIROS POR MINUTO, EL COLT MK 12',
    historia: 'Los A-4 llevaban dos cañones Colt Mk 12 de 20 mm. Tiraban rapido pero eran caprichosos: se cargaban con un sistema neumatico y se trababan. Hay un piloto que conto que se le callaron despues de dos tiros. El cañon era el ultimo recurso, no el arma del ataque.',
  },
  metralla3: {
    que: 'Tres veces y media la cadencia de fabrica, pero tarda un segundo en girar antes de escupir. Apreta antes de tener el blanco en la mira, no cuando ya lo tenes encima.',
    dato: 'NINGUN AVION ARGENTINO LA TENIA',
    historia: 'Licencia del juego. El cañon de caños giratorios existe —el tipo Gatling, que usaban aviones estadounidenses—, pero en 1982 ningun avion argentino lo llevaba. Lo que si es real es su maña: los caños tienen que tomar vuelta antes de tirar en serio.',
  },
  cinta2: {
    que: 'La rafaga aguanta una vez y media mas antes de recalentar. Mismo cañon, misma cadencia: solo podes mantener apretado mas tiempo. Sirve con cualquier metralla.',
    dato: '100 TIROS POR CAÑON EN EL A-4',
    historia: 'Cien tiros por cañon, a mil por minuto: unos seis segundos de fuego en toda la salida. No era una barra de balas, eran tres o cuatro rafagas cortas. El piloto que apretaba de mas volvia sin nada para defenderse a la vuelta, que era la parte mas peligrosa.',
  },
  cinta3: {
    que: 'El doble de rafaga que la cinta de fabrica antes de que el cañon recaliente. Junto con la metralla de oro es la que te deja barrer una fila entera sin soltar.',
    dato: 'SEIS SEGUNDOS DE FUEGO, Y SE ACABO',
    historia: 'En el A-4 la cinta no se alargaba: lo que entraba en el avion era lo que habia. Por eso la cuenta de los pilotos era en segundos, no en balas. Aca la cinta crece porque es un juego; alla se volvia con los cañones vacios o trabados, y nadie los destrababa en vuelo.',
  },
  canon: {
    que: 'A los aviones que no traen cañon (el Neptune, los del Fenix) les monta uno: aparece la metralla con X o ESPACIO, y recien ahi se ofrecen sus mejoras.',
    dato: 'LICENCIA DEL JUEGO',
    historia: 'Invento del juego: el Neptune y los jets civiles del Escuadron Fenix no llevaban armas. Su guerra era otra: buscar, guiar, engañar. La carta existe para que puedas volarlos igual, pero sabe que en 1982 esos tripulantes iban desarmados adentro de la zona de combate.',
  },
  potencia2: {
    que: 'Cada bala rompe una vez y media. El precio: cada tiro calienta un poco mas el cañon, asi que la rafaga se corta antes. Pega menos veces, pero mas fuerte.',
    dato: 'MAS GOLPE, MENOS RAFAGA',
    historia: 'La municion perforante existe: un nucleo duro que entra antes de romperse. Que tipo de municion cargaban los cañones argentinos en cada salida no lo tenemos verificado, asi que la carta es del juego. La idea es real: no todas las balas son iguales.',
  },
  potencia3: {
    que: 'El doble de daño por tiro que la de fabrica. Recalienta todavia mas: con la cinta corta, la rafaga dura un suspiro. Combinala con CINTA LARGA o ENTERA.',
    dato: 'EL DOBLE POR TIRO',
    historia: 'Licencia del juego, como la anterior. Lo que evoca: el piloto de ataque no iba a pelear con el cañon. Iba a tirar una bomba y volver. Cada bala que gastaba era una bala menos para la vuelta, cuando aparecian los Sea Harrier.',
  },
  brp: {
    que: 'Cambia la MK-17 por la BRP-250 (Z / L1): arma rapido y casi siempre explota. El precio: pesa la mitad, asi que si pegas en la punta del buque rompe menos.',
    dato: 'DESDE EL 25 DE MAYO, EXPLOTARON',
    historia: 'Bomba española de 250 kg. A las argentinas les rehicieron las espoletas en pocas semanas, con armeros y la Fabrica Militar de Aviones de Cordoba. Desde el 25 de mayo, practicamente todas las bombas de la Fuerza Aerea explotaron. Ese dia se hundio el Coventry.',
  },
  snakeye: {
    que: 'La MK-82 frenada (Z / L1): las aletas la frenan, arma enseguida y casi siempre detona. Es la mas chica y se queda atras: hay que soltarla bien encima del blanco.',
    dato: 'LA DEL A-4Q DE LA ARMADA',
    historia: 'La Snakeye trae aletas que se abren al soltarla: la bomba frena y el avion se aleja antes de que explote. Por eso se podia tirar bajo. La usaban los A-4Q de la Armada. El 21 de mayo, con ellas, hundieron a la fragata Ardent.',
  },
  espoletas1: {
    que: 'La bomba que lleves arma antes al caer y detona mas seguido. Sirve con la MK-17, la BRP o la Snakeye: menos bombas que pegan y se quedan dormidas.',
    dato: 'TIRAR BAJO DESARMABA LA BOMBA',
    historia: 'La espoleta se arma cayendo: necesita tiempo de caida. Pero subir para darselo era morir, asi que se tiraba muy bajo y muchas bombas pegaban sin explotar. Ya en mayo, armeros argentinos tocaban espoletas a mano y bajaban el tiempo de armado.',
  },
  espoletas2: {
    que: 'Arma casi al soltarla: la que pega, explota. Con la MK-17 cambia todo; con la BRP o la Snakeye, ya no se te duerme ninguna.',
    dato: 'DOCE SEGUNDOS DE RETARDO',
    historia: 'Las bombas españolas recibieron espoletas rehechas con un retardo de doce segundos despues del golpe. Asi se podia soltar bien bajo: la bomba se metia adentro del buque y reventaba cuando el avion ya estaba lejos.',
  },
  soporte1: {
    que: 'Una bomba mas colgada (Z / L1): dos pasadas antes de quedarte sin nada. El precio es el peso: el avion acelera menos con la carga puesta.',
    dato: 'SIN CHANCHA, UNA SOLA BOMBA',
    historia: 'El A-4 tenia tres puntos para colgar. Sin reabastecer iban dos tanques y una sola bomba. Con el Hercules en el camino se podian llevar tres de 250 kg. Los A-4Q de la Armada colgaban soportes multiples para las Snakeye. Cada bomba era nafta que no se llevaba.',
  },
  soporte2: {
    que: 'Otra bomba mas (Z / L1): tres en el estante. El avion se pone pesado y lento para salir del pozo despues de cada pasada.',
    dato: 'TRES DE 250 KG POR AVION',
    historia: 'Con reabastecimiento, los A-4 llegaron a salir con tres bombas de 250 kg, como en el ataque del 8 de junio en Bahia Agradable. Mas bombas era mas peso, y mas peso era menos alcance: todo dependia de que el Hercules estuviera donde tenia que estar.',
  },
  exocet: {
    que: 'Solo Super Etendard. Cuelga un Exocet (Z / L1): adentro de las 30 millas lo lanzas, cargas las coordenadas en la prueba, y bien hecho siempre pega. Mal hecho, se va al mar.',
    dato: 'CINCO AM39 EN TODA LA GUERRA',
    historia: 'Llegaron cinco Super Etendard y cinco Exocet AM39 antes de que Francia cortara la entrega. Volaban al ras, subian un momento, prendian el radar, y lanzaban. El 4 de mayo uno pego en el HMS Sheffield; el 25 de mayo hundieron al Atlantic Conveyor.',
  },

  // ---------------- DEFENSA ----------------
  chafitas1: {
    que: 'Una carga (H / circulo): una nube de aluminio que desvia los misiles de radar y una bengala para los de calor. Se suelta abriendo el freno: perdes velocidad.',
    dato: 'HECHAS CON UNA MAQUINA DE FIDEOS',
    historia: 'Los aviones argentinos no tenian chaff ni bengalas de fabrica. En la II Brigada cortaron aluminio, primero a tijera —lo hicieron unos pibes de escuela— y despues con una maquina de tallarines prestada por una fabrica de pastas. El aluminio salio de los rollos de los escapes de los Canberra.',
  },
  chafitas2: {
    que: 'Otro cartucho: dos cargas por avion (H / circulo). Cada carga es una nube y una bengala. Usalas cuando el misil ya salio, no antes.',
    dato: 'EN EL FRENO, CON PAPEL HIGIENICO',
    historia: 'En los Mirage y los Dagger, el chaff iba en cartuchos envueltos en papel higienico, cerrados con cinta y metidos en el freno aerodinamico. Para soltarlo, el piloto abria el freno: justo cuando mas necesitaba la velocidad, la perdia.',
  },
  chafitas3: {
    que: 'Tres cargas por avion (H / circulo). Con tres podes gastar una contra el Sea Dart al entrar y te quedan para la vuelta, donde esperan los Harrier.',
    dato: 'BENGALA: 500 GRADOS, 15 SEGUNDOS',
    historia: 'Las bengalas tambien eran caseras: polvora que ardia a unos 500 grados durante quince segundos, colgada de un paracaidita. Mas caliente que el escape del motor, asi el Sidewinder se iba detras de ella. En los Canberra salian de cartuchos de arranque de motor ya usados.',
  },
  chafitas4: {
    que: 'El maximo: cuatro cargas por avion (H / circulo). Mas no entran. Sigue costando velocidad cada vez que abris el freno para soltar una.',
    dato: 'UNA CADA 15 SEGUNDOS, EL 1 DE MAYO',
    historia: 'El 1 de mayo, un piloto argentino esquivo misiles Sidewinder soltando bengalas y chaff cada quince segundos, y es posible que eso le haya salvado la vida. Si sirvieron en general es dificil de medir; los que las fabricaron decian que se notaba.',
  },
  chafRecarga: {
    que: 'Una carga de chafitas se repone sola cada 25 segundos, hasta el tope que tenga tu avion. No suma cargas: rellena las que gastaste.',
    dato: '24 HORAS POR DIA, CASI UNA SEMANA',
    historia: 'La maquina de tallarines no paraba: le dieron a la manivela las veinticuatro horas, durante casi una semana, para que hubiera chaff en las bases del sur. Hoy esa maquina esta en la Sala Historica de la II Brigada Aerea, en Parana.',
  },
  chafPotencia: {
    que: 'La nube de chafitas dura una vez y media mas y engaña a los misiles desde mas lejos. Las mismas cargas, mejor aprovechadas.',
    dato: 'TIRAS DE 7 CM, A LA MEDIDA',
    historia: 'El chaff funciona si las tiras tienen la medida justa para la onda del radar que se quiere engañar. Para el radar que guiaba al Sea Dart salieron de siete centimetros. El ancho lo daba la maquina: era el de un tallarin.',
  },
  escudo1: {
    que: 'El escudo del avion se recarga el doble de rapido despues de un golpe. No aguanta mas: vuelve antes, asi el segundo golpe te encuentra entero.',
    dato: 'LICENCIA DEL JUEGO',
    historia: 'No hay registro de que se blindaran los A-4 a mano: la chapa extra es del juego. Lo real es lo de alrededor: aviones que volvian con agujeros de esquirlas y mecanicos que los dejaban listos para salir otra vez.',
  },
  escudo2: {
    que: 'El escudo se recarga tres veces mas rapido que el de fabrica. Entre golpe y golpe, casi siempre llegas cubierto.',
    dato: 'SE VOLVIA CON AGUJEROS',
    historia: 'Invento del juego, como la primera. Lo que evoca: el A-4 tenia fama de aguantador. Lo que si es real: aviones que volvian con impactos encima y que, si se podian arreglar, volvian a la fila.',
  },
  veterano: {
    que: 'Cuando cae el avion que vuela, el siguiente de la escuadrilla entra en la mitad de tiempo. No es una vida mas: es menos tiempo sin nadie en el aire.',
    dato: 'SECCIONES DE TRES O CUATRO',
    historia: 'Se atacaba en secciones de pocos aviones, uno detras de otro. Si caia el que iba adelante, el numeral siguiente seguia la corrida: no habia tiempo de pensarlo. Volar de numeral, pegado al lider, era leer el terreno un segundo antes que el.',
  },
  reparacion: {
    que: 'De uso: la chapa del avion que vuela queda entera otra vez, y el escudo lleno. Solo se ofrece si estas golpeado.',
    dato: 'REMACHES, CINTA Y UNA NOCHE',
    historia: 'En las bases del sur se reparaba con lo que habia. De los ocho A-4Q de la Armada, al empezar solo volaban tres: los demas tenian fisuras en las alas. Con mantenimiento a destajo llegaron a tener los ocho en condiciones.',
  },
  amigo: {
    que: 'De uso: vuelve un avion a la escuadrilla, una vida mas en la fila. Solo se ofrece si te falta alguno.',
    dato: 'LAS BASES, A MAS DE 700 KM',
    historia: 'Los aviones salian de bases en el continente, a mas de setecientos kilometros del blanco. Habia varias bases y varios escuadrones repartidos por la costa patagonica. Con el embargo no llegaban aviones nuevos: lo que habia al empezar era lo que habia.',
  },
  rescate: {
    que: 'Si un piloto se eyecta (Q+E / L1+R1, cayendo), al rato su avion vuelve a la escuadrilla. Sin la carta, eyectarse salva la vida pero no el lugar en la fila.',
    dato: 'EN EL AGUA HELADA, MINUTOS',
    historia: 'Eyectarse sobre el Atlantico Sur era otra pelea: en esa agua se aguanta minutos. Sobre tierra habia mas chances de que alguien te encontrara. Y los asientos eyectables de los A-4Q tenian los cartuchos vencidos y no siempre funcionaban.',
  },

  // ---------------- EL TALLER ----------------
  tallerLiv: {
    que: 'De uso: arregla las fallas leves y medias (carga lenta, se traba a veces, recalienta…) de hasta tres aviones de la escuadrilla.',
    dato: 'UNO DE CADA TRES SE VOLVIA',
    historia: 'En los relatos de la guerra, cerca de uno de cada tres aviones que salian se volvia antes de llegar, casi siempre por problemas para cargar combustible en vuelo. No eran los misiles: era el desgaste. Los mecanicos trabajaban de noche para que a la mañana salieran.',
  },
  tallerPes: {
    que: 'De uso: repara la falla grave de un avion (sonda rota, bombas que no se desprenden, cañones mudos, altimetro muerto). Una sola, la peor.',
    dato: 'BOMBAS QUE NO SE DESPRENDIAN',
    historia: 'En varios ataques, aviones que llegaban hasta el buque no pudieron soltar: las bombas se trababan en el soporte. Hacer toda la ida, pasar adentro de la antiaerea y volver con la bomba colgada. Eso tambien era la guerra.',
  },
  vuelta: {
    que: 'De uso: los aviones que mandaste a la base con [R] vuelven ya, reparados y llenos, sin esperar los 90 segundos.',
    dato: 'CARGAR, REVISAR Y SALIR',
    historia: 'El avion que volvia sano no descansaba: lo cargaban de combustible y bombas, lo revisaban y volvia a la fila para la salida siguiente. El tiempo en tierra era tan parte de la guerra como el vuelo.',
  },
  municion: {
    que: 'De uso: bombas y chafitas al tope en toda la escuadrilla, la que vuela y la que espera en la fila.',
    dato: 'LLEGO EL CAMION DE LA ARMERIA',
    historia: 'Cada salida empezaba en tierra, con los armeros colgando bombas y revisando espoletas a mano. Muchos de los arreglos que hicieron funcionar a las bombas salieron de ellos, no de una fabrica.',
  },

  // ---------------- ALCANCE ----------------
  tanques: {
    que: 'Dos tanques externos: mas nafta, mas alcance. Pesan y frenan; los soltas con B. Si los tiras llenos, esa nafta se va al mar.',
    dato: 'DOS TANQUES Y UNA BOMBA',
    historia: 'Sin reabastecer, un A-4 salia con dos tanques en las alas y una sola bomba abajo. Mas de setecientos kilometros hasta el blanco, cinco a diez minutos sobre la zona, y combustible para una sola pasada. La vuelta era la parte mas larga.',
  },
  chancha1: {
    que: 'De uso: una llamada al Hercules cisterna (J) sin pagarla con puntos. Subis, te enganchas a la canasta y cargas. Solo aviones con sonda.',
    dato: 'DOS KC-130H EN TODA LA FUERZA',
    historia: 'Habia solo dos Hercules cisterna. Los A-4 y los Super Etendard tenian sonda y podian cargar en vuelo; los Dagger, no. La cita se hacia lejos de la flota y alto, donde el radar britanico no llegaba, para que los aviones llegaran al blanco y pudieran volver.',
  },
  kc130: {
    que: 'Con la carta, la Chancha (J) llega en la mitad de tiempo y carga mas rapido una vez enganchado. Solo aviones con sonda.',
    dato: 'DOS CISTERNAS, Y SE RESERVARON LAS DOS',
    historia: 'Con dos cisternas en toda la guerra, cuantos aviones podian atacar lejos dependia de ellos. Para el ataque al Invincible del 30 de mayo se reservaron los dos. Sin los Hercules, buena parte de los ataques no habrian llegado.',
  },

  // ---------------- PODERES ----------------
  momentum1: {
    que: 'El tiempo partido (4) se carga en 17 segundos en vez de 20 y dura 3,6 en vez de 3. El mundo va a un tercio; vos apuntas a velocidad normal.',
    dato: 'LICENCIA DEL JUEGO',
    historia: 'Invento del juego: nadie frena el tiempo. Lo que evoca es lo que cuentan los pilotos de la corrida final: a ras del agua y a cientos de kilometros por hora, todo dura un segundo, y en ese segundo se ve todo.',
  },
  momentum2: {
    que: 'El tiempo partido (4) se recarga en 14 segundos y dura 4,2. Mas seguido, mas largo.',
    dato: '420 NUDOS A 30 METROS',
    historia: 'Licencia del juego. La corrida final real era a unos 420 nudos —casi 780 km/h— a treinta metros del agua o menos. A esa velocidad, el buque pasaba de punto en el horizonte a estar encima en segundos.',
  },
  momentum3: {
    que: 'El maximo: el tiempo partido (4) se recarga en 11 segundos y dura 4,8.',
    dato: 'CINCO A DIEZ MINUTOS SOBRE EL BLANCO',
    historia: 'Licencia del juego. El tiempo real tambien era corto: horas de vuelo para tener cinco a diez minutos sobre la zona y una sola pasada. Todo se jugaba en esos minutos.',
  },
  rasante1: {
    que: 'La banda azul del RASANTE (5) es un 40% mas ancha: mas facil de sostener al ras y de cobrar el bonus de volar bajo.',
    dato: 'HAY RELATOS DE PASADAS A 3 METROS',
    historia: 'Para no ser vistos por el radar de los buques, los pilotos argentinos volaban pegados al agua: quince a treinta metros, y hay relatos de pasadas a tres. La costra de sal en el parabrisas, despues de horas al ras, dificultaba el aterrizaje.',
  },
  radar1: {
    que: 'Prender el radar propio (Y) no cuesta puntos y se recarga el doble de rapido. Sigue delatandote mientras esta prendido. Solo Super Etendard.',
    dato: 'PRENDERLO ERA DELATARSE',
    historia: 'El 4 de mayo los Super Etendard volaron al ras con el radar Agave apagado. Cerca del blanco subieron, lo prendieron unos segundos para encontrar al buque, bajaron y lanzaron. Los buques escuchaban las emisiones: el radar prendido era una bengala.',
  },

  // ---------------- INTELIGENCIA Y TACTICA ----------------
  radarMalvinas: {
    que: 'Cada vez que una pareja de Harrier entra a buscarte, salta el aviso RADAR DE PUERTO ARGENTINO. No los saca: te da el segundo para prepararte.',
    dato: 'UN TPS-43 EN PUERTO ARGENTINO',
    historia: 'La Fuerza Aerea tenia un radar TPS-43 en Puerto Argentino. Desde ahi se seguian los movimientos britanicos y se avisaba a los aviones que entraban o salian de las islas. Lo buscaron con misiles antirradar y siguio funcionando hasta el final.',
  },
  neptune: {
    que: 'Solo CICLO: el blanco ya esta ubicado, asi que la primera parte de cada aproximacion viene mas tranquila. La presion sube recien al acercarte.',
    dato: 'UN AVION VIEJO BUSCANDO LA FLOTA',
    historia: 'La Armada tenia dos SP-2H Neptune, patrulleros viejos y sin armas. Con el radar bajo la panza buscaban a la flota britanica para guiar a los Super Etendard. Gastados y sin repuestos por el embargo, se retiraron a mediados de mayo.',
  },
  tracker: {
    que: 'Bajando al ras, la barra de alarma del radar enemigo se vacia el doble de rapido. Premia lo que el juego ya pide: volar abajo.',
    dato: '18 RADARES BRITANICOS IDENTIFICADOS',
    historia: 'Tripulaciones de la Armada adaptaron un Tracker para escuchar las emisiones britanicas, volando bajisimo para que no los vieran. Identificaron dieciocho radares, anotaron sus frecuencias y con eso se armaron rutas de aproximacion mas seguras.',
  },
  guerraElec: {
    que: 'La barra de alarma del radar enemigo se carga mas lento: tardan una vez y media mas en encontrarte. Se suma con EL TRACKER.',
    dato: 'ESCUCHAR SIN SER ESCUCHADO',
    historia: 'El Ejercito monto interceptacion y radiolocalizacion desde Rio Gallegos y Puerto Santa Cruz, con procedimientos manuales y operadores entrenados. Saber que buscaba el enemigo, y donde, era tambien una forma de esconderse.',
  },
  mirage: {
    que: 'De uso: por los proximos 5 km no entra ninguna pareja nueva de Harrier. Las que ya estan, siguen.',
    dato: 'ALTOS, PARA QUE LOS MIREN A ELLOS',
    historia: 'Despues de los combates del 1 de mayo, los Mirage IIIEA casi no bajaron a pelear. Su trabajo paso a ser otro: volar alto y hacerse ver, para atraer a los Sea Harrier mientras los aviones de ataque entraban por abajo.',
  },
  fenix: {
    que: 'De uso: la proxima vez que la barra de alarma se llene, la oleada se va detras del Learjet y la barra baja. Se gasta una vez.',
    dato: 'JETS CIVILES EN LA ZONA DE GUERRA',
    historia: 'El Escuadron Fenix junto aviones civiles —Learjet y otros ejecutivos— con pilotos voluntarios. Guiaban a los A-4 como navegantes y hacian de señuelo en las pantallas britanicas. El 7 de junio, un Learjet de la Fuerza Aerea en mision de fotografia cayo derribado por un Sea Dart.',
  },
  coordinado: {
    que: 'Los antiaereos y las defensas del buque tiran mas lento: su recarga corre a un 60%. Todo lo que te dispara desde abajo duda mas.',
    dato: 'DOS A LA VEZ, NO SABEN A QUIEN',
    historia: 'Entrar de a varios y por distintos rumbos dividia las defensas del buque. El 25 de mayo, el sistema Sea Wolf de la Broadsword no pudo resolver a dos A-4 que se cruzaban, y no disparo. Ese ataque termino con el Coventry hundido.',
  },
  terreno: {
    que: 'Rozar la tierra perdona mas: el margen de roce sobre el suelo dura casi el doble (1,8). Sobre el agua sigue igual.',
    dato: 'EL RADAR NO VE DETRAS DE UNA LOMA',
    historia: 'El radar mira en linea recta. Sobre las islas, los pilotos usaban las lomas y los valles para esconderse: entraban por detras del terreno y aparecian encima del estrecho sin aviso. Hacia falta conocer cada cerro de memoria.',
  },
  itb: {
    que: 'Solo CICLO: cada blanco te espera sin Sea Cat ni Sea Wolf, porque el Exocet de tierra ya le pego. Y la prueba del ataque te perdona un error mas.',
    dato: 'UN EXOCET DE BARCO, EN UN TRAILER',
    historia: 'Un capitan ingeniero y dos tecnicos bajaron un Exocet MM38 de un destructor, lo montaron en un carro y lo armaron con valvulas, porque no habia tiempo de programar nada. El 12 de junio, desde tierra, le pegaron al HMS Glamorgan en la popa.',
  },

  // ---------------- PIRUETAS (EN EL AIRE) ----------------
  mask: {
    que: 'Abajo, abajo-abajo: clava el avion al ras, congela el roce y vacia la barra del radar enemigo. Mientras dura, podes disparar y usar turbo.',
    dato: 'ABAJO DEL HORIZONTE DEL RADAR',
    historia: 'Terrain masking: volar tan bajo que el terreno, o la curva del mar, queda entre vos y el radar. La onda viaja recta y no dobla. Es la base de todo el ataque a ras: el radar del buque te ve recien cuando ya estas cerca.',
  },
  splits: {
    que: 'Arriba, abajo, abajo con el avion alto: medio tonel y picada. Pierde altura y gana velocidad de golpe. Dejas el eje lateral y podes tirar.',
    dato: 'MEDIO TONEL Y MEDIO LOOP',
    historia: 'El Split-S: el avion rola hasta quedar invertido y tira hacia abajo, cerrando medio loop. Sale en sentido contrario, mas bajo y mas rapido. Es la forma clasica de irse para abajo YA, pero pide altura: hecha bajo, termina en el suelo.',
  },
  breakt: {
    que: 'Abajo, izquierda, izquierda (o derecha): tiron lateral violento, alas de canto. El avion se achica y esquiva de costado. Te deja el eje vertical.',
    dato: 'VIRAR HACIA EL QUE TE TIRA',
    historia: 'El break turn es el viraje de defensa a todo lo que da el avion, cuando te estan por disparar. Se tira hacia el atacante para cambiarle el angulo y arruinarle el tiro. Cuesta velocidad: se sale vivo, pero lento.',
  },
  loyo: {
    que: 'Abajo, arriba, abajo: pica y remonta, convierte altura en velocidad. Es la unica pirueta que acelera, y el turbo sigue andando.',
    dato: 'ALTURA ES VELOCIDAD GUARDADA',
    historia: 'El low yo-yo es de combate aereo: el avion baja la nariz adentro del viraje para ganar velocidad y cortar camino. La regla de los pilotos: la altura es energia guardada, y se gasta bajando.',
  },
  sturn: {
    que: 'Izquierda, derecha, izquierda: se abre a un lado y vuelve. Esquiva sin perder el carril, y te deja corregir la altura mientras dura.',
    dato: 'IR Y VOLVER AL MISMO RUMBO',
    historia: 'Las S son virajes alternados de un lado al otro, sin salirse del rumbo general. Se usan para acomodar la distancia con el de adelante, perder un poco de tiempo o no ser un blanco que va derecho y parejo.',
  },
  popup: {
    que: 'Abajo, arriba, arriba volando bajo: trepada brusca desde el ras. Sirve para pasar por encima de lo que viene y mirar. Arriba te ven.',
    dato: 'SUBIR, VER, Y VOLVER A BAJAR',
    historia: 'El pop-up es el ataque desde el ras: se llega bajo, se sube de golpe para ver el blanco y apuntar, y se vuelve a bajar. Asi encontraron los Super Etendard a su blanco el 4 de mayo: subieron, miraron unos segundos con el radar, y bajaron.',
  },
  hiyo: {
    que: 'Arriba, abajo, arriba: sube, cuelga y recae. Esquive vertical: lo que venia pasa por abajo. Te cuesta velocidad.',
    dato: 'SUBIR PARA NO PASARSE',
    historia: 'El high yo-yo: el avion sube fuera del viraje para no pasarse de largo de uno mas lento, cambia velocidad por altura y despues recae sobre el. Colgarse arriba y dejar que el otro pase.',
  },
  jink: {
    que: 'Arriba, izquierda, derecha: cuatro quiebres secos, rumbo imposible de adivinar. No controlas nada mientras dura, pero el avion se achica.',
    dato: 'NUNCA DERECHO DOS SEGUNDOS',
    historia: 'Jinking: cambios bruscos y desparejos de rumbo y altura para que el artillero no pueda calcular donde vas a estar. Contra el cañon y la antiaerea, lo peor que podes hacer es volar derecho y parejo.',
  },
  spin: {
    que: 'Picar y rolar: rola sobre su eje mientras pica. No se controla nada; el avion se achica y se corre un poco hacia el lado del rolido.',
    dato: 'LICENCIA DEL JUEGO',
    historia: 'Como esta, la maniobra es del juego. Lo que evoca es real: rolar mientras se baja hace dificil seguirte, porque tus alas cambian de lado todo el tiempo. Ojo: no es la barrena, que es perder la sustentacion y caer girando.',
  },
  climb: {
    que: 'Mirar arriba y arriba, arriba: trepa sola hasta el techo del radar y lo sostiene. La altura maxima sin que te pinten.',
    dato: 'JUSTO DEBAJO DE LO QUE TE VE',
    historia: 'El radar tiene un horizonte: abajo de cierta altura, a cierta distancia, no ve. Volar justo debajo de esa linea es ganar un poco de vista y de margen sin ser detectado. Pasarse un metro es aparecer en la pantalla del buque.',
  },
  climbmax: {
    que: 'El mismo combo, ya contra el radar: cruza el techo. Expuesto: la alarma se carga. Pero llegas a donde abajo no se pasa.',
    dato: 'IDA ALTA, ATAQUE BAJO',
    historia: 'Volar alto gasta mucho menos combustible que volar al ras. Por eso la ida se hacia alta, y se bajaba recien al acercarse a la flota. Todo el tiempo arriba era tiempo en las pantallas britanicas.',
  },
  barrel: {
    que: 'Rolar: abajo, derecha, arriba, izquierda. La O grande: sube, pasa invertido y vuelve al punto exacto. No se controla, y el avion se achica.',
    dato: 'UN ROLIDO ALREDEDOR DE UN PUNTO',
    historia: 'El tonel barril combina un rolido con un loop: el avion dibuja un espiral y termina en la misma linea en la que entro. En combate sirve para frenar en el camino sin perder altura y dejar que el que te persigue se pase de largo.',
  },
};

export const leeDe = id => LEE[id] || null;
