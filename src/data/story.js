// EL GUION, ESCENA POR ESCENA. Contenido puro: aca no hay logica (data/ no importa nada del
// juego, ver ARQUITECTURA). El que las interpreta es core/dialogue.js.
//
// ESTE ARCHIVO ES LA FUENTE DE VERDAD DEL MODO HISTORIA, y esa es toda la idea. Antes, definir una
// escena pedia tocar tres archivos: el texto en data/strings.js, la placa de fondo en
// data/placas.js y la cara de cada hablante en core/dialogue.js. Cambiar una escena era acordarse
// de los tres, y los tres se desincronizaban en silencio — un id de cara que no existe no da
// error, cae al placeholder, y la pantalla se ve igual que si el asset simplemente faltara.
//
// Ahora cada escena trae lo suyo junto: su registro, su placa, su titulo y sus lineas, y cada
// linea su hablante, su cara y su hold. Se edita ACA.
//
// Reglas de datos que NO se negocian (SISTEMA_DIALOGO):
//   - el `id` de linea es inmutable aunque el texto cambie, y no se reutiliza jamas;
//   - se numera de 10 en 10 para poder intercalar sin renumerar;
//   - `en` vacio cae a `es` — el guion todavia es solo castellano;
//   - `hold` son los segundos de SILENCIO despues de la linea. Es actuacion, no delay tecnico:
//     el 4.0 de "El Vasco tenia quince años" ES la escena. El guion migrado viene en 0 porque no
//     se inventan: se ponen escena por escena, y esa es la mejora que habilita este archivo.
//
// TIPOS: 'VN' caja de dialogo con busto · 'TARJETA' la placa de nivel · 'TIERRA' el cuaderno de
// Mateo (birome) · 'CARTA' el block del padre · 'VUELO' la CHARLA EN VUELO
// (SPEC_CHARLAS_VUELO): las mismas lineas, los mismos holds y las mismas caras, pero SIN PLACA —
// el fondo es el juego, que sigue corriendo debajo. Una escena 'VUELO' no se dispara desde una
// secuencia de campaña sino desde un tramo (`charla:` en data/missions.js), y no la avanza el
// jugador: corre en auto. Por eso vale una regla propia — TIENE QUE ENTRAR EN `CHV_MAX_S`
// segundos, y la cuenta es `max(1.6, caracteres/12) + hold` por linea. La escena que no entra no
// se recorta: se parte en dos, y se cuelga de dos tramos seguidos.

export const SCENES = {
  M5_ESCUCHA: {
    id: 'M5_ESCUCHA', tipo: 'VN', titulo: 'LA ESCUCHA', placa: 'radio',
    lineas: [
      { id: 'M5_ESCUCHA_010', personaje: null, cara: null, hold: 1.5,
        es: 'Esa noche, en la sala de radio, el Pichón estaba con los auriculares puestos, escribiendo en la libreta. Sabe inglés técnico de leer manuales de aviación robados, lo aprendió sólo para entender los planos.', en: '' },
      { id: 'M5_ESCUCHA_020', personaje: 'PICHÓN', cara: 'pichon_auriculares', hold: 1.0,
        accion: 'Se intercepta una conversación en inglés. Pichón escucha atentamente.',
        es: 'Capitán… están hablando de nosotros.', en: '' },
      { id: 'M5_ESCUCHA_030', personaje: 'PUMA', cara: 'puma_neutro', hold: 0.6,
        es: '¿Qué dicen?', en: '' },
      { id: 'M5_ESCUCHA_040', personaje: 'PICHÓN', cara: 'pichon_auriculares', hold: 1.5,
        es: 'Dicen... "si estás en guerra... con Argentina... y escuchás el ruido de... de las turbinas de un avión..."', en: '' },
      { id: 'M5_ESCUCHA_050', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.5,
        es: '¿Y?', en: '' },
      // LA UNICA VEZ EN TODO EL JUEGO en que estos tipos se enteran de que no estan perdiendo.
      // Dura una frase. El hold largo es para que el jugador la escuche igual que ellos.
      { id: 'M5_ESCUCHA_060', personaje: 'PICHÓN', cara: 'pichon_auriculares', hold: 4.0,
        es: ' ..."no mires al cielo. Porque la muerte viene a ras del suelo."', en: '' },
      { id: 'M5_ESCUCHA_070', personaje: 'EL TURCO', cara: 'turco_orgullo', hold: 1.5,
        accion: 'Bajito, desde la puerta, sin entrar.',
        es: 'Escribila, changuito. Esa escribila.', en: '' },
      { id: 'M5_ESCUCHA_080', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 1.2,
        es: 'Al ras del suelo... ¿Escuchaste, Tero? Nos tienen miedo.', en: '' },
      // y a Esteban el orgullo se le va en una silaba: del otro lado del mar les tienen miedo,
      // y del lado de aca hay un chico de dieciocho que escucha lo mismo y no sabe quien pasa
      { id: 'M5_ESCUCHA_090', personaje: 'ESTEBAN', cara: 'tero_preocupado', hold: 3.5,
        es: 'Sí...', en: '' },
      // EL ORGULLO DURA UNA FRASE Y SE TERMINA. Sin este cierre la escena se lee como arenga: es la
      // unica vez en todo el juego que se enteran de que no estan perdiendo, y dura eso.
      { id: 'M5_ESCUCHA_100', personaje: null, cara: null, hold: 3.0,
        es: 'Y ahí se corta. Nadie festeja. El orgullo dura lo que dura una frase.', en: '' },
    ],
  },
  M2_MATE: {
    id: 'M2_MATE', tipo: 'VN', titulo: 'LA RONDA', placa: 'linea_amanecer',
    lineas: [
      { id: 'M2_MATE_010', personaje: null, cara: null, hold: 1.2,
        es: 'Antes de subir, el Turco ceba el mate y arranca la ronda con el Gitano.', en: '' },
      // EL GUIÑO GAMER, canal 1 (GUION_3 §9c): la reverencia entera, ridicula, para nadie. En
      // pantalla no se nombra ningun juego ni ninguna marca — es un piloto de veintipico
      // haciendo una payasada antes de volar. El que lo reconoce lo reconoce.
      { id: 'M2_MATE_020', personaje: 'GITANO', cara: 'gitano_thankyou', hold: 1.5,
        accion: 'Toma el mate, lo deja y hace un saludo “como de soldado”.',
        es: 'THANK YOU.', en: '' },
      { id: 'M2_MATE_030', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 0.6,
        es: '¿Y por qué en inglés?', en: '' },
      { id: 'M2_MATE_040', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.8,
        es: 'Porque si digo gracias me sacan de la ronda, culiau.', en: '' },
      { id: 'M2_MATE_050', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 2.0,
        es: 'De la ronda no se va nadie, Ura.', en: '' },
      // el Pichon escuchando la chapa: el pibe que oye a los aviones. Se paga en M9.
      { id: 'M2_MATE_060', personaje: null, cara: null, hold: 2.5,
        es: 'Mientras la ronda de mate sigue, el Pichón ya está al lado de su avión con la mano abierta apoyada en la chapa y la cabeza gacha, escuchando. No dice nada. Luego de un momento la saca y se seca la palma en el mameluco.', en: '' },
    ],
  },
  M3_FOTO: {
    id: 'M3_FOTO', tipo: 'VN', titulo: 'LA CASADA · SEGUNDA VEZ', placa: 'm7_foto_frente',
    lineas: [
      // LA SEGUNDA APARICION DE LA FOTO, en silencio y sin comentario. El jugador cree ver a un
      // hombre extrañando a su amante. En M7 se entera de quien es, y esta escena cambia de
      // significado hacia atras — por eso acá nadie dice una palabra.
      { id: 'M3_FOTO_010', personaje: null, cara: null, hold: 4.0,
        es: 'El Vasco abre el locker. Mira la foto dos segundos, se besa la mano y toca el papel. Después cierra la puerta.', en: '' },
    ],
  },
  // ---------- M10 "LOS PRIMOS" (GUION_3 M10) — la primera con tres ----------
  M10_HUECO: {
    id: 'M10_HUECO', tipo: 'VN', titulo: 'EL LUGAR VACÍO', placa: 'linea_amanecer',
    lineas: [
      { id: 'M10_HUECO_010', personaje: null, cara: null, hold: 2.0,
        es: 'La línea de vuelo, antes del amanecer. Tres aviones listos. Y un cuarto abierto en canal: el del Pichón, los paneles en el piso, el motor a la vista, el Turco metido adentro hasta los hombros. Lo está desarmando.', en: '' },
      { id: 'M10_HUECO_020', personaje: 'GITANO', cara: 'gitano_ceno', hold: 0.8,
        es: '…Turco. ¿Qué hacés?', en: '' },
      { id: 'M10_HUECO_030', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 0.6,
        es: 'Le saco lo que sirve.', en: '' },
      { id: 'M10_HUECO_040', personaje: 'GITANO', cara: 'gitano_roto', hold: 0.5,
        es: 'Turco—', en: '' },
      { id: 'M10_HUECO_050', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 1.5,
        es: 'La bomba de nafta va al tuyo, que viene fallando hace una semana. El equipo de radio al de Tero. Los frenos me los llevo para repuesto. No hay de dónde sacar, cordobés. No baja un tornillo al sur desde hace veinte días.', en: '' },
      // el hold largo es el que convierte una linea de logistica en una linea de duelo
      { id: 'M10_HUECO_060', personaje: 'EL TURCO', cara: 'turco_roto', hold: 3.5,
        es: 'A él ya no le hace falta, m\'hijo. A ustedes sí. Así el changuito sale igual. En los tres.', en: '' },
      { id: 'M10_HUECO_070', personaje: 'PUMA', cara: 'puma_neutro', hold: 0.6,
        es: 'Reconocimiento armado sobre las islas. Salimos, miramos, si hay algo lo tocamos, y volvemos.', en: '' },
      { id: 'M10_HUECO_080', personaje: 'GITANO', cara: 'gitano_preocupado', hold: 0.5,
        es: '¿Con este tiempo?', en: '' },
      { id: 'M10_HUECO_090', personaje: 'PUMA', cara: 'puma_neutro', hold: 1.0,
        es: 'Con este tiempo. Y hoy la nafta se cuida. La Chancha no baja más al sur. Lo que llevamos es lo que hay.', en: '' },
      { id: 'M10_HUECO_100', personaje: 'ESTEBAN', cara: 'tero_preocupado', hold: 0.5,
        es: '¿Y si no alcanza?', en: '' },
      { id: 'M10_HUECO_110', personaje: 'PUMA', cara: 'puma_ceno', hold: 1.5,
        es: 'Alcanza si volvés cuando te digo que vuelvas. Cuando te digo, Aldao.', en: '' },
      { id: 'M10_HUECO_120', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 2.5,
        es: 'Plata Fiel, aquí Cóndor. Techo bajo, visibilidad nula al sur, frente cerrado sobre las islas. Reconocimiento armado, vuelen bajito y a casa. Buena suerte, muchachos.', en: '' },
    ],
  },
  M10_TARJETA: {
    id: 'M10_TARJETA', tipo: 'TARJETA', titulo: 'LOS PRIMOS', capitulo: 10,
    lineas: [
      { id: 'M10_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '5 de junio de 1982 · El enemigo es el clima', en: '' },
    ],
  },
  // TANDIL: la segunda y ultima vez que el juego rompe su regla de montaje (la otra es M12).
  // El jugador ve llegar el regalo; la escuadrilla esta a dos mil kilometros, adentro de un frente
  // cerrado. Es la asimetria de siempre — aca, con ternura en lugar de dolor.
  M10_TANDIL: {
    id: 'M10_TANDIL', tipo: 'VN', titulo: 'TANDIL · LA MISMA MADRUGADA', placa: 'tandil',
    lineas: [
      { id: 'M10_TANDIL_010', personaje: null, cara: null, hold: 3.0,
        es: 'Otra parte del país. Amanecer helado, pasto escarchado. Y aterrizan diez Mirage nuevos, uno atrás del otro, prolijos, brillantes, sin una marca de uso.', en: '' },
      // el mecanico de Tandil no tiene retrato Y NO LO NECESITA: aparece dos veces en todo el
      // juego y su gracia es que podria ser cualquiera. La caja sin busto ya lo dice.
      { id: 'M10_TANDIL_020', personaje: 'MECÁNICO', cara: null, hold: 1.5,
        es: '…Todavía está tierna.', en: '' },
      { id: 'M10_TANDIL_030', personaje: 'PILOTO PERUANO', cara: 'peruano_neutro', hold: 2.5,
        es: 'La pintamos allá, antes de salir. Para que nadie pueda decir nunca que estos aviones fueron de otro. Salieron del Perú siendo de ustedes.', en: '' },
      { id: 'M10_TANDIL_040', personaje: 'MECÁNICO', cara: null, hold: 0.6,
        es: '…¿Y ustedes cómo se vuelven?', en: '' },
      { id: 'M10_TANDIL_050', personaje: 'PILOTO PERUANO', cara: 'peruano_cortes', hold: 1.0,
        es: 'En ése.', en: '' },
      { id: 'M10_TANDIL_060', personaje: 'PILOTO PERUANO', cara: 'peruano_cortes', hold: 2.0,
        accion: 'Antes de subir a la rampa se da vuelta, busca al mecánico entre los otros y le hace un saludo corto con dos dedos en la sien.',
        es: 'Cuídenlos, hermano.', en: '' },
      // el Hercules bate las alas al irse: el MISMO saludo que un padre le hizo a un hijo once
      // dias atras. Nadie lo subraya, y por eso funciona.
      { id: 'M10_TANDIL_070', personaje: null, cara: null, hold: 4.0,
        es: 'El Hércules despega con el amanecer. Y al irse, gordo, lento, torpe, bate las alas: una a la izquierda, una a la derecha.', en: '' },
      { id: 'M10_TANDIL_080', personaje: null, cara: null, hold: 3.0,
        es: 'Los diez Mirage estacionados en fila, las turbinas enfriándose, las cúpulas vacías.', en: '' },
    ],
  },
  M10_NOTICIA: {
    id: 'M10_NOTICIA', tipo: 'VN', titulo: 'LA NOTICIA LLEGA DE REBOTE', placa: 'hangar_dia',
    lineas: [
      { id: 'M10_NOTICIA_010', personaje: null, cara: null, hold: 1.5,
        es: 'Vuelven los tres, con la aguja abajo y sin haber disparado un tiro.', en: '' },
      { id: 'M10_NOTICIA_020', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 0.8,
        es: 'Llegaron aviones. En Tandil. Diez.', en: '' },
      { id: 'M10_NOTICIA_030', personaje: 'GITANO', cara: 'gitano_preocupado', hold: 0.5,
        es: '¿Diez? ¿De dónde?', en: '' },
      { id: 'M10_NOTICIA_040', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 0.8,
        es: 'Los mandó el Perú.', en: '' },
      { id: 'M10_NOTICIA_050', personaje: 'GITANO', cara: 'gitano_preocupado', hold: 0.6,
        es: '¿El Perú? ¿Y a ellos qué les va en esto?', en: '' },
      { id: 'M10_NOTICIA_060', personaje: 'EL TURCO', cara: 'turco_sonrisa', hold: 2.0,
        es: 'Nada, m\'hijo. Ésa es la cuestión. Dicen que vinieron con la escarapela nuestra ya pintada. Que se la pintaron ellos, allá, antes de salir. Para que nadie pudiera decir nada.', en: '' },
      { id: 'M10_NOTICIA_070', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 3.0,
        es: 'Nadie del otro lado del mundo movió un dedo, m\'hijo. El que movió fue el vecino. Es siempre igual: el que te da una mano es el que también tiene frío.', en: '' },
      { id: 'M10_NOTICIA_080', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.8,
        es: 'Bueno. Entonces mañana volamos en Mirage, muchachos.', en: '' },
      { id: 'M10_NOTICIA_090', personaje: 'PUMA', cara: 'puma_neutro', hold: 3.0,
        es: '…Tandil.', en: '' },
    ],
  },
  M10_CUADERNO: {
    id: 'M10_CUADERNO', tipo: 'TIERRA', titulo: 'EL CUADERNO', placa: 'p1c_cuaderno', img: 'carta11_m10',
    lineas: [
      { id: 'M10_CUADERNO_010', personaje: null, cara: null, hold: 0,
        es: 'Pá: corrió una bolilla rarísima hoy: que llegaron aviones nuevos. Que los mandó Perú. Así, de regalo, como quien te presta la cortadora de pasto. El Colorado dice que los correntinos y los peruanos se entienden porque los dos saben lo que es que te miren de arriba.', en: '' },
      { id: 'M10_CUADERNO_020', personaje: null, cara: null, hold: 0,
        es: 'Yo no sé si será verdad lo de los aviones. Pero me gustó pensarlo: que en algún lado hay gente que no nos conoce y nos manda ayuda. Como Claribel con su carta, pero en grande.', en: '' },
      { id: 'M10_CUADERNO_030', personaje: null, cara: null, hold: 1.0,
        es: 'Dibujé un avión con un poncho. No me salió. Te lo dejo igual para que te rías. Mateo.', en: '' },
    ],
  },
  M10_MIRAGE: {
    id: 'M10_MIRAGE', tipo: 'TARJETA', titulo: 'MIRAGE 5P «MARA» — DESBLOQUEADO', placa: 'm10_mirage_fila',
    lineas: [
      { id: 'M10_MIRAGE_010', personaje: null, cara: null, hold: 3.0,
        es: 'Diez llegaron del Perú el 5 de junio de 1982. Nunca llegaron a combatir. Acá, sí.', en: '' },
    ],
  },

  // ---------- M3 "EL INVENTO" (GUION_3 M3) — la mision que enseña el sistema de mejoras ----------
  M03_INVENTO: {
    id: 'M03_INVENTO', tipo: 'VN', titulo: 'EL INVENTO', placa: 'hangar_dia',
    lineas: [
      { id: 'M03_INVENTO_010', personaje: null, cara: null, hold: 1.5,
        es: 'El Pichón está trepado a una escalera contra el avión de Esteban, con la manga sucia de grasa hasta el codo. El Turco abajo, con los brazos cruzados y cara de tribunal.', en: '' },
      { id: 'M03_INVENTO_020', personaje: 'EL TURCO', cara: 'turco_ceno', hold: 0.8,
        es: 'Bajate de ahí, chango. Va a hace\' cagada.', en: '' },
      { id: 'M03_INVENTO_030', personaje: 'PICHÓN', cara: 'pichon_sonrisa', hold: 0.5,
        es: 'Es que mire... si le corremos la toma dos dedos y le sacamos este peso muerto de acá, en la salida del rasante gana empuje. Lo vi en la salida de ayer, Tero se quedaba y el del capitán no, y la única diferencia es...', en: '' },
      { id: 'M03_INVENTO_040', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 1.0,
        es: 'No, changuito... Bajate.', en: '' },
      // la vergüenza del Pichón es su cara propia: se frena a mitad de frase y se le nota
      { id: 'M03_INVENTO_050', personaje: 'PICHÓN', cara: 'pichon_preocupado', hold: 2.0,
        es: 'Perdón... Ya me bajo...', en: '' },
      // EL HOLD MAS LARGO DE LA ESCENA, y es el que la hace: el Turco mira el fuselaje, mira al
      // pibe, y recien ahi afloja. Sin el silencio, "mostrame" es una linea mas.
      { id: 'M03_INVENTO_060', personaje: 'EL TURCO', cara: 'turco_sonrisa', hold: 3.0,
        accion: 'Mientras Pichón baja, El Turco se queda pensativo mirando el avión.',
        es: 'A ver... mostrame...', en: '' },
      { id: 'M03_INVENTO_070', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.6, 
        accion: 'Mientras ambos murmuran cosas técnicas mirando el avión y unos papeles, Gitano se acerca a Puma.',
        es: 'Una caja de puchos a que el Turco lo manda a cagar antes del mediodía.', en: '' },
      { id: 'M03_INVENTO_080', personaje: 'PUMA', cara: 'puma_neutro', hold: 1.2,
        es: 'Dos cajas a que después lo prueba igual.', en: '' },
    ],
  },
  M03_TARJETA: {
    id: 'M03_TARJETA', tipo: 'TARJETA', titulo: 'EL INVENTO', capitulo: 3,
    lineas: [
      { id: 'M03_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: 'Primeros días de mayo de 1982 · Patrulla costera', en: '' },
    ],
  },
  M03_ARANDELA: {
    id: 'M03_ARANDELA', tipo: 'VN', titulo: 'EL PRIMER FRACASO GLORIOSO', placa: 'hangar_dia',
    lineas: [
      // EL GESTO DEL TURCO (§9d, M3): reconoce los aviones por el ruido, antes de verlos. NADIE LE
      // PREGUNTA COMO SABE, ni aca ni nunca. Es su unica aparicion hasta M13.
      { id: 'M03_ARANDELA_010', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 4.0,
        accion: 'De espaldas al cielo, con las manos adentro de un motor. Levanta la cabeza. Pasan cuatro segundos largos hasta que el punto aparece sobre el mar.',
        es: 'Ahí viene el capitán.', en: '' },
      { id: 'M03_ARANDELA_020', personaje: null, cara: null, hold: 2.0,
        es: 'Prueban el invento del pibe: algo con una tapa y mucha cinta aislante. Hace un ruido espantoso. Una pieza de metal al rojo vivo sale volando, y se apaga con humo. Le vuela el gorro al Turco y le roza la oreja al Gitano.', en: '' },
      { id: 'M03_ARANDELA_030', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 1.0,
        accion: 'Levanta el gorro del piso y le sopla el polvo, muy tranquilo.',
        es: 'No sirve, changuito. Te dije que no sirve.', en: '' },
      { id: 'M03_ARANDELA_040', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 1.5,
        es: 'Mmmm... interesante.', en: '' },
      { id: 'M03_ARANDELA_050', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 1.0,
        accion: 'Se acerca frotandose la oreja y ríe.',
        es: 'Interesante dice el culiao... Casi me vuela la oreja con una arandela... Ajá... interesante.', en: '' },
    ],
  },
  // LA BURRADA: el guiño gamer de GUION_3 §9c. La coreografia va EN ESTE ORDEN —vertical, salto,
  // disparo en caida, tirar el caño, reingreso— porque el orden ES el chiste para el que lo
  // reconoce. En pantalla no se nombra ningun juego, ninguna marca y ningun año.
  M03_BURRADA: {
    id: 'M03_BURRADA', tipo: 'VN', titulo: 'LA BURRADA DEL GITANO', placa: 'hangar_dia',
    lineas: [
      { id: 'M03_BURRADA_010', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.5,
        accion: 'El Turco empuja un carrito con un misil hacia el otro avión. El Gitano se le cruza adelante y le apoya la mano encima, como quien apoya la mano en el hombro de un amigo.',
        es: 'Turco, cuchá. Tengo una idea tremenda y quería saber si es posible.', en: '' },
      { id: 'M03_BURRADA_020', personaje: 'EL TURCO', cara: 'turco_pensante', hold: 1.0,
        es: 'Escucho.', en: '' },
      { id: 'M03_BURRADA_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.6,
        es: 'Venís volando, y aparecen dos atrás, ¿sí? Ellos más veloces que nosotros y no son fáciles de perder. Además su armamento es mucho mejor que el nuestro.', en: '' },
      { id: 'M03_BURRADA_040', personaje: 'EL TURCO', cara: 'turco_pensante', hold: 1.0,
        es: 'Si, obvio... ¿y?', en: '' },
      { id: 'M03_BURRADA_050', personaje: 'GITANO', cara: 'gitano_explicando_mira_arriba', hold: 0.5,
        accion: 'El Vasco, que caminaba por ahí, se detiene a escuchar debido al entusiasmo del Gitano.',
        es: 'Entonces, en vez intentar escapar, tirás la trompa hacia arriba. Derechito al cielo, completamente vertical.', en: '' },
      { id: 'M03_BURRADA_060', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 0.5,
        es: 'Ahí entrás en pérdida. Estás más expuesto.', en: '' },
      { id: 'M03_BURRADA_070', personaje: 'GITANO', cara: 'gitano_expectante', hold: 1.0,
        es: 'Perfecto. Y ahí... te... TE BAJÁS.', en: '' },
      { id: 'M03_BURRADA_080', personaje: 'VASCO', cara: 'vasco_sorprendido', hold: 0.8,
        es: '¿Te bajás? ¿Cómo que te bajás?', en: '' },
      { id: 'M03_BURRADA_090', personaje: 'GITANO', cara: 'gitano_imaginando', hold: 0.6,
        es: 'Te bajás, Vasco. Abrís la cabina y te tirás. Con paracaídas obviamente, por las dudas. ', en: '' },
      { id: 'M03_BURRADA_100', personaje: 'VASCO', cara: 'vasco_rezo', hold: 1.2,
        es: 'Diosito.', en: '' },
      { id: 'M03_BURRADA_110', personaje: 'GITANO', cara: 'gitano_imaginando', hold: 0.6,
        es: 'Los que te siguen, le siguen yendo al avión, pero vos ya no estás adentro. Y mientras caés… LES DISPARÁS.', en: '' },
      { id: 'M03_BURRADA_120', personaje: 'PICHÓN', cara: 'pichon_pensante', hold: 0.6,
        es: '¿Y con qué?', en: '' },
      { id: 'M03_BURRADA_130', personaje: 'GITANO', cara: 'gitano_emocionado', hold: 2.0,
        es: 'Con lo que sea que te lleves encima. Un revolver, una ametralladora, un lanzacohetes... lo que sea.', en: '' },
      { id: 'M03_BURRADA_140', personaje: 'VASCO', cara: 'vasco_espalda', hold: 1.2,
        accion: 'El Vasco se da media vuelta y se aleja.',
        es: 'Buenas tardes, muchachos.', en: '' },
      { id: 'M03_BURRADA_150', personaje: 'GITANO', cara: 'gitano_emocionado', hold: 2.0,
        accion: 'Gitano sigue completamente emocionado contando. El Puma ve la situación y se acerca.',
        es: 'Vos estás en un estado de locura e inconciencia temporal. ¿Me explico? No le tirás un tiro, porque si le pifiás te comés un garrón de la gran flauta. Les vaciás el cargador, los reventás a balazos.', en: '' },
      { id: 'M03_BURRADA_160', personaje: 'GITANO', cara: 'gitano_volando', hold: 2.0,
        es: 'Ya aseguradas las bajas, acomodás el cuerpo en caída libre, y le apuntás a tu propio avión, que viene bajando por el otro lado. Te metés adentro, cerrás la cúpula, y seguís volando como si nada.', en: '' },
      { id: 'M03_BURRADA_170', personaje: 'PICHÓN', cara: 'pichon_pensante', hold: 0.6,
        es: '¿Y a qué velocidad estarías vos cuando saltás? ¿Usarías el eyector?', en: '' },
      { id: 'M03_BURRADA_180', personaje: 'GITANO', cara: 'gitano_pensativo', hold: 0.8,
        es: 'Y... yo calculo...', en: '' },
      { id: 'M03_BURRADA_190', personaje: 'EL TURCO', cara: 'turco_enojado', hold: 1.0,
        accion: 'Le saca el misil de las manos.',
        es: 'A ver, m\'hijo. ¿Vos te pensás que el aire es una vereda? Vos te bajás de ese avión en el aire y a los treinta segundos te junto con pala.', en: '' },
      { id: 'M03_BURRADA_200', personaje: 'GITANO', cara: 'gitano_ansioso', hold: 0.8,
        es: 'Pero el paracaídas...', en: '' },
      { id: 'M03_BURRADA_210', personaje: 'PUMA', cara: 'puma_enojado', hold: 0.4,
        es: 'FACUNDO...', en: '' },
      { id: 'M03_BURRADA_220', personaje: 'GITANO', cara: 'gitano_delirante', hold: 0.4,
        es: '¿QUÉ?', en: '' },
      // el remate es una palabra y un silencio. Y el Pichon NO tacha lo que anoto: se paga en M9.
      { id: 'M03_BURRADA_230', personaje: 'PUMA', cara: 'puma_enojado', hold: 2.5,
        es: 'NO.', en: '' },
    ],
  },
  M03_CUADERNO: {
    id: 'M03_CUADERNO', tipo: 'TIERRA', titulo: 'EL CUADERNO', placa: 'p1c_cuaderno', img: 'carta4_m3',
    lineas: [
      { id: 'M03_CUADERNO_010', personaje: null, cara: null, hold: 0,
        es: 'Pá: hoy el Colorado me regaló una navaja. Así nomás, sin cumpleaños ni nada. Un cortaplumas viejo, con el cabo de asta gastadito de años de mano. "Era de mi abuelo", me dijo. "En el campo, un hombre sin navaja no es nadie, chamigo."', en: '' },
      { id: 'M03_CUADERNO_020', personaje: null, cara: null, hold: 0,
        es: 'Le dije que no podía aceptarla y me contestó que un regalo rechazado trae mala suerte, y que acá de mala suerte estamos completos.', en: '' },
      { id: 'M03_CUADERNO_030', personaje: null, cara: null, hold: 1.0,
        es: 'La llevo en el bolsillo de arriba, con la birome. Mis dos herramientas, pá: una para contar y otra para lo que venga. La dibujé abajo, mirá. Le hice hasta las marquitas del cabo. Mateo.', en: '' },
    ],
  },
  // LA NOTICIA DEL BELGRANO. Va al final del epilogo de M3 a proposito: la risa del hangar se
  // corta a la mitad. El juego da los hechos y nada mas — la bronca la ponen los personajes.
  M03_BELGRANO: {
    id: 'M03_BELGRANO', tipo: 'VN', titulo: '2 DE MAYO', placa: 'radio',
    lineas: [
      // VIENE DE LA CARCAJADA DEL HANGAR. El Pichon entra SIN CORRER, y el Gitano todavia tiene
      // media sonrisa puesta: por eso la risa se corta a la mitad en vez de terminarse.
      { id: 'M03_BELGRANO_010', personaje: null, cara: null, hold: 2.0,
        es: 'Todavía se están riendo de la arandela cuando el Pichón entra desde la sala de radio. Sin correr, con la libreta en la mano y la cara de alguien que no sabe cómo decir lo que va a decir.', en: '' },
      { id: 'M03_BELGRANO_020', personaje: 'PICHÓN', cara: 'pichon_preocupado', hold: 2.5,
        es: 'Huuuu... hundieron al Belgrano.', en: '' },
      { id: 'M03_BELGRANO_030', personaje: 'GITANO', cara: 'gitano_risa_apagada', hold: 1.0,
        es: '¿Al crucero? Pero si el crucero está afuera de la zona, Pichón. Está navegando para el otro lado.', en: '' },
      { id: 'M03_BELGRANO_040', personaje: 'PICHÓN', cara: 'pichon_preocupado', hold: 1.2,
        es: 'Sí, ya sé... El ataque fue desde un submarino. Dos torpedos.', en: '' },
      { id: 'M03_BELGRANO_050', personaje: 'PUMA', cara: 'puma_ceno', hold: 0.6,
        es: '¿Cuántos?', en: '' },
      { id: 'M03_BELGRANO_060', personaje: 'PICHÓN', cara: 'pichon_roto', hold: 2.5,
        es: 'No se sabe... No se sabe todavía. Se está hundiendo... con la gente adentro. Además hay temporal. Y dicen que hay balsas en el agua desde hace horas.', en: '' },
      // M3-12: EL GORRO. Es el mismo que le volo la arandela dos escenas antes, y por eso ata la
      // risa con el corte sin una sola palabra. Nadie lo comenta.
      { id: 'M03_BELGRANO_070', personaje: null, cara: null, hold: 3.0,
        es: 'Silencio largo. El Turco deja el gorro sobre el banco y no lo levanta más.', en: '' },
      { id: 'M03_BELGRANO_080', personaje: 'GITANO', cara: 'gitano_ceno', hold: 1.5,
        es: 'Pero no estaba en la zona... estaba yéndose, Puma.', en: '' },
      { id: 'M03_BELGRANO_090', personaje: 'PUMA', cara: 'puma_roto', hold: 1.5,
        es: 'Sí.', en: '' },
      { id: 'M03_BELGRANO_100', personaje: 'GITANO', cara: 'gitano_roto', hold: 0.5,
        es: '¿Y entonces qué carajo...?', en: '' },
      { id: 'M03_BELGRANO_110', personaje: 'PUMA', cara: 'puma_roto', hold: 3.0,
        es: 'Y entonces nada, Facundo. Esto es así. Mañana volamos.', en: '' },
      // los otros dos gestos: el Vasco reza con la mano y el Turco ordena porque no sabe que otra
      // cosa hacer. Ninguno de los dos se explica — es el §9d otra vez.
      { id: 'M03_BELGRANO_120', personaje: null, cara: null, hold: 3.5,
        es: 'Se va. Nadie se mueve. El Vasco se toca la cruz. El Turco, al rato, junta las herramientas de a una, muy despacio, como si ordenar sirviera para algo.', en: '' },
      { id: 'M03_BELGRANO_130', personaje: null, cara: null, hold: 4.0,
        es: 'El Belgrano se hundió con 323 muertos... Casi la mitad de todos los argentinos caídos en la guerra. En una sola tarde... ', en: '' },
    ],
  },


  M07_LOCKER: {
    id: 'M07_LOCKER',
    tipo: 'VN',
    placa: 'vestuario',            // assets/plates/vestuario.png — TODAVIA NO EXISTE (cae a negro)
    ambiente: 'locker_noche',      // capa de audio de la escena — todavia no existe (silencio)
    lineas: [
      // acotacion: sin personaje, se muestra sin nombre y respeta el hold igual (regla D5)
      { id: 'M07_LOCKER_010', personaje: null, cara: null, hold: 2.0,
        es: 'El Turco junta las cosas del Vasco en una caja.', en: '' },
      { id: 'M07_LOCKER_020', personaje: 'GITANO', cara: 'gitano_roto', hold: 1.0,
        es: 'La casada… Turco, dejámela ver una última vez.', en: '' },
      // EL DORSO DE LA FOTO: la imagen ES el contenido, asi que esta linea sola cambia de registro
      // a CUADRO sin cortar la escena (decision documentada en el spec §9).
      { id: 'M07_LOCKER_030', personaje: null, cara: null, hold: 2.5,
        tipo: 'CUADRO', img: 'M7_FOTO_DORSO',
        es: 'La da vuelta. Nada más que eso.', en: '' },
      { id: 'M07_LOCKER_040', personaje: 'PUMA', cara: 'puma_roto', hold: 1.5,
        es: 'Sesenta y uno.', en: '' },
      // el hold mas largo de la escena: aca no se avanza por 4 segundos, y eso es el juego
      { id: 'M07_LOCKER_050', personaje: 'ESTEBAN', cara: 'tero_roto', hold: 4.0,
        es: 'El Vasco tenía quince años.', en: '' },
      { id: 'M07_LOCKER_060', personaje: 'GITANO', cara: 'gitano_roto', hold: 2.0,
        es: 'Tres años le cebé mate a este culiao. Tres años…', en: '' },
    ],
  },
  P1_2: {
    id: 'P1_2', tipo: 'VN', titulo: 'AÑOS ANTES · UN ARROYO', placa: 'p1a_arroyo',
    // DOS CUADROS EN UNA ESCENA. La 010 planta el lugar —el campo, el Rastrojero, el arroyo— y de
    // la 020 en adelante el padre esta MOSTRANDO el sapito: la piedra picando sobre el agua es
    // otra imagen, y es LA imagen que el juego entero recoge despues ("volar rasante es el
    // sapito"). Con un solo cuadro, la frase que da nombre a todo se dice sobre un plano general.
    // El `img` por linea lo soporta el motor desde siempre (render/screens.js: `ln.img || sc.img`).
    lineas: [
      { id: 'P1_2_010', personaje: null, cara: null, hold: 1.5, tipo: 'NARRADOR',
        es: 'Un campo en la provincia. Un Rastrojero oxidado. Esteban joven revolea una piedra chata: pica una, dos, tres veces. Mateo, ocho años, dibuja el arroyo con el cuaderno en las rodillas.', en: '' },
      { id: 'P1_2_020', personaje: 'ESTEBAN', cara: 'esteban_joven_calido', hold: 1.0, img: 'P1_2B',
        es: '¿Ves? Sapito. La piedra no se hunde si va rápido y pegada al agua. Con los aviones es igual: abajo de todo, rapidito, donde nadie te espera. Los valientes vuelan abajo, Mateo.', en: '' },
      { id: 'P1_2_030', personaje: 'MATEO', cara: 'mateo_nene_asombro', hold: 0.6, img: 'P1_2B',
        es: '¿Y no se caen?', en: '' },
      // el remate cambio en el guion 3.0: ya no es una advertencia, es el padre mirando el dibujo.
      // Y ahi se planta, sin subrayar, que el pibe dibuja mejor de lo que nadie le dijo nunca.
      { id: 'P1_2_040', personaje: 'ESTEBAN', cara: 'esteban_joven_risa', hold: 2.5, img: 'P1_2B',
        es: 'Se caen los que le tienen miedo a la tierra... Salió mejor el avión que yo, ¿eh?', en: '' },
    ],
  },
  P2_3: {
    id: 'P2_3', tipo: 'VN', titulo: 'LA COCINA · 2 DE ABRIL DE 1982', placa: 'p2_cocina',
    lineas: [
      { id: 'P2_3_010', personaje: null, cara: null, hold: 1.5, tipo: 'NARRADOR',
        es: 'Viernes a la tarde. Mateo, 18, rapado de colimba, de franco: llegó hace un rato y el bolso todavía está en la puerta. Esteban y Norma preparando el mate y la merienda.', en: '' },
      { id: 'P2_3_020', personaje: 'MATEO', cara: 'mateo_sonrisa', hold: 0.6,
        es: 'En dos meses se termina la instrucción, pá. Después es puro marchar hasta fin de año. Cuando te quieras dar cuenta ya estoy de vuelta arreglándote el Rastrojero.', en: '' },
      { id: 'P2_3_030', personaje: 'ESTEBAN', cara: 'tero_sonrisa', hold: 0.8,
        es: 'Vos al rastrojero lo rompés más de lo que lo arreglás.', en: '' },
      // EL CHISTE DEL SORTEO. Dura cuatro segundos y NO SE VUELVE A MENCIONAR NUNCA en todo el
      // juego (nota de tratamiento de GUION_3): el jugador se acuerda solo. No se dice ninguna
      // cifra a proposito — los cortes del sorteo variaban año a año.
      { id: 'P2_3_040', personaje: 'MATEO', cara: 'mateo_sonrisa', hold: 0.6,
        es: 'Sabés que en el sorteo de la colimba casi me toca Aeronáutica. Un poco más arriba el número y en vez de al Ejército me mandaban con vos.', en: '' },
      { id: 'P2_3_050', personaje: 'ESTEBAN', cara: 'tero_sonrisa', hold: 1.5,
        es: 'Te salvaste por poco, entonces.', en: '' },
      // P-04: el unico momento del juego en que la familia esta entera y riendose. Va justo antes
      // del telefono a proposito — el corte no corta nada si no hubo risa.
      { id: 'P2_3_060', personaje: null, cara: null, hold: 1.2, tipo: 'NARRADOR',
        es: 'Se ríen los tres.', en: '' },
      { id: 'P2_3_070', personaje: null, cara: null, hold: 1.0, tipo: 'NARRADOR',
        es: 'Suena el teléfono.', en: '' },
      { id: 'P2_3_080', personaje: 'NORMA', cara: 'norma_calida', hold: 0.8,
        accion: 'se levanta y atiende',
        es: '¿Para quién?... ¿Tero?... Tomá amor. Es para vos.', en: '' },
      { id: 'P2_3_090', personaje: null, cara: null, hold: 1.0, tipo: 'NARRADOR',
        es: 'Esteban toma el teléfono.', en: '' },
      { id: 'P2_3_100', personaje: 'MATEO', cara: 'mateo_neutro', hold: 0.5,
        es: '¿Tero?', en: '' },
      // de donde sale el indicativo, dicho por la madre y de pasada: es el nombre del juego
      { id: 'P2_3_110', personaje: 'NORMA', cara: 'norma_calida', hold: 1.2,
        es: 'A tu padre le dicen Tero. Se lo pusieron hace casi veinte años durante la colimba y le quedó para siempre. En el trabajo le dicen así.', en: '' },
      { id: 'P2_3_120', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'Esteban corta el teléfono. Queda pálido y en silencio.', en: '' },
      { id: 'P2_3_130', personaje: 'MATEO', cara: 'mateo_preocupado', hold: 1.0,
        es: '¿Qué pasa, pá?', en: '' },
      { id: 'P2_3_140', personaje: null, cara: null, hold: 3.0, tipo: 'NARRADOR',
        es: 'Prende la radio sin responder. «...tropas argentinas desembarcaron esta madrugada en las Islas Malvinas...». Los tres quietos. La pava chifla y nadie la saca del fuego.', en: '' },
      { id: 'P2_3_150', personaje: null, cara: null, hold: 3.5,
        tipo: 'NARRADOR',
        es: 'El 2 de abril la Plaza se llenó de gente festejando. En esa cocina, un padre que realmente conocía las consecuencias de una guerra no festejó.', en: '' },
    ],
  },
  P3_4: {
    id: 'P3_4', tipo: 'VN', titulo: 'LO QUE UN PADRE PUEDE Y LO QUE NO', placa: 'p3a_telefono',
    lineas: [
      { id: 'P3_4_010', personaje: null, cara: null, hold: 1.2, tipo: 'NARRADOR',
        es: 'El teléfono de la base, papeles, un despacho, una puerta que se cierra.', en: '' },
      { id: 'P3_4_020', personaje: 'ESTEBAN', cara: 'tero_roto', hold: 2.5,
        es: 'Llamé a todos. A todos mis contactos en Corrientes. Creí que podía sacarlo... No pude.', en: '' },
      // POR TELEFONO, no por radio: el parlante militar es del hangar y de las misiones. Aca
      // Condor es una voz del otro lado de una linea, en una oficina. Falta el asset.
      { id: 'P3_4_030', personaje: 'CÓNDOR', cara: 'condor_telefono', hold: 3.0,
        es: 'Aldao. Su hijo ya está embarcado. Está en las islas. Lo siento.', en: '' },
    ],
  },
  P4_1: {
    id: 'P4_1', tipo: 'TIERRA', titulo: 'LA PRIMERA PÁGINA DEL CUADERNO', placa: 'p1c_cuaderno', img: 'carta1_p4',
    lineas: [
      { id: 'P4_1_010', personaje: null, cara: null, hold: 0,
        es: 'Viejo: llegamos. Hace un frío que no tiene nombre. Somos pibes de todo el país. Hay uno de Jujuy que nunca había visto el mar y no puede parar de mirarlo. Hay un porteño que extraña el colectivo, ¿podés creer? Extrañar el 60, pá.', en: '' },
      { id: 'P4_1_020', personaje: null, cara: null, hold: 0,
        es: 'Decidí comenzar a escribirte, para contarte todo con lujo de detalles, y porque creo que me distrae un poco. Cuando vuelva, te lo doy en la mano. Te lo leo y me río con vos. Mientras tanto te sigo contando, como si estuvieras acá.', en: '' },
      { id: 'P4_1_030', personaje: null, cara: null, hold: 0,
        es: 'Le estuve enseñando a hacer sapito al jujeño. Me acuerdo lo que me enseñaste... Sé que vos estás arriba. Mientras yo sigo bancándola acá, vos me ves desde arriba, chiquito pero seguro. Contame vos cómo se ve todo desde arriba...', en: '' },
      // LA MENTIRA COMPARTIDA, que es el pacto entre padre e hijo y vuelve en cada carta
      { id: 'P4_1_040', personaje: null, cara: null, hold: 2.0,
        es: 'A mamá, cuando volvamos, le decimos que acá había guiso y pan. Los dos la misma mentira, ¿eh? Que para eso somos los hombres de la casa. Mateo.', en: '' },
      // NO LO ESCRIBE MATEO. Sin `tipo: NARRADOR` salia con la tinta azul de su birome y se leia
      // como si el pibe lo hubiera predicho.
      { id: 'P4_1_050', personaje: null, cara: null, hold: 3.0, tipo: 'NARRADOR',
        es: 'Esa misma semana, empezaba la guerra.', en: '' },
    ],
  },
  M1_3: {
    id: 'M1_3', tipo: 'VN',
    titulo: 'RÍO GALLEGOS · LA LÍNEA DE VUELO', placa: 'linea_amanecer', img: 'M1_3',
    lineas: [
      { id: 'M1_3_010', personaje: null, cara: null, hold: 3.0, tipo: 'NARRADOR',
        es: 'Esteban llega al nuevo escuadrón al que fue asignado. Uno de los pilotos, de pelo rizado, ceba mates para el resto de la ronda. Uno de ellos, con bigote, se acerca a recibirlo.', en: '' },
      { id: 'M1_3_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Bienvenido al escuadrón, Tero. Primera regla: siempre pegado al agua, el radar de ellos no te ve. Hay que volar tan bajo que tenés que volver con sal en las alas. Segunda regla: no hay. Con la primera alcanza.', en: '' },
      { id: 'M1_3_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'Tercera regla: el mate lo cebo yo. Y si no volvés... te lo cebo igual. Pero solo. Cebar solo es tristísimo, así que volvé.', en: '' },
      { id: 'M1_3_040', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 0.6,
        es: '¿Siempre van a hacer estos chistes?', en: '' },
      { id: 'M1_3_050', personaje: 'VASCO', cara: 'vasco_neutro', hold: 2.0,
        accion: 'sin levantar la vista',
        es: 'Es la manera que tienen de rezar.', en: '' },
    ],
  },
  M1_5B: {
    id: 'M1_5B', tipo: 'VN',
    titulo: 'LA CASADA', placa: 'm7_foto_frente', img: 'M1_5B',
    lineas: [
      // LA ESCENA SE EXPLICA SOLA O NO SE ENTIENDE. Antes el Gitano arrancaba diciendole al
      // Pichon que fuera a ver una foto, sin que nadie hubiera dicho donde estaban, de quien era
      // el locker ni por que habia una foto ahi. El jugador leia un chiste sin el chiste.
      { id: 'M1_5B_010', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'Media hora antes de salir de misión, en el vestuario, el Vasco cierra su locker rápidamente y se aparta. Se alcanza a ver la foto de una mujer.', en: '' },
      { id: 'M1_5B_020', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.6,
        accion: 'lo ve mirando y le habla desde el otro lado del banco',
        es: 'Andá, mirala, Pichón. Está pegada adentro del locker.', en: '' },
      { id: 'M1_5B_030', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'Una foto blanco y negro denota una bella mujer sonriente. Pichón se queda mirándola.', en: '' },
      { id: 'M1_5B_040', personaje: 'PICHÓN', cara: 'pichon_sonrisa', hold: 1.5,
        accion: 'sin sacarle los ojos de encima',
        es: '...es hermosa.', en: '' },
      { id: 'M1_5B_050', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.6,
        es: 'Le decimos “La Casada”. No sabemos quién es, pero es seguro que ese minón tiene dueño.', en: '' },
      { id: 'M1_5B_060', personaje: null, cara: null, hold: 2.0, tipo: 'NARRADOR',
        es: 'El Vasco se persigna, sube la escalerilla y no acota nada.', en: '' },
      { id: 'M1_5B_070', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.6,
        accion: 'se acerca al locker, junto a Pichón',
        es: 'Creíamos que era la mujer del Vasco. Pero él nunca dice nada… de nada.', en: '' },
      { id: 'M1_5B_080', personaje: 'PICHÓN', cara: 'pichon_sonrisa', hold: 1.5,
        es: '...es hermosa.', en: '' },
      { id: 'M1_5B_090', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.6,
        es: 'Debe ser algún amorío del pasado... Y ya debe estar casada... con alguien de poder. ', en: '' },
      { id: 'M1_5B_100', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.6,
        es: 'Como un político... o un mafioso... o ambas.', en: '' },
      { id: 'M1_5B_110', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.6,
        es: 'Debe ser por eso que nunca habla. Además, se dice que tiene una historia compleja y tiene un hermano preso.', en: '' }, 
      { id: 'M1_5B_120', personaje: 'PICHÓN', cara: 'pichon_sonrisa', hold: 0.6,
        es: 'A mí me dijeron que él estuvo preso.', en: '' },
      { id: 'M1_5B_130', personaje: 'PUMA', cara: 'puma_neutro', hold: 0.6,
        es: 'A mí me dijeron que ustedes dos hablan mucho.', en: '' },
      { id: 'M1_5B_140', personaje: 'CÓNDOR', cara: 'condor_reposo', hold: 0, 
        accion: 'Shhh, crrr... zkk',
        es: 'Escuadrilla CAUQUÉN, aquí Cóndor. Autorizada adaptación sobre mar abierto, rumbo sudeste. Recomendamos mantenerse rasantes al agua durante todo el trayecto y prestar especial atención al radar. Pista dos autorizada. Buen vuelo.', en: '' },
    ],
  },
  // EL TERITO (GUION_3, M1). Es la raiz de tres sistemas y por eso no se puede caer: el gesto de
  // Tero de §9d (tocar el terito antes de subir, que se cobra en M14), la mecanica de las
  // estrellitas del Turco, y la referencia del asset del pajaro pintado en el fuselaje. Antes de
  // esta escena el terito aparecia por primera vez en M4, tocado por alguien, sin que nadie lo
  // hubiera nombrado nunca.
  M1_TERITO: {
    id: 'M1_TERITO', tipo: 'VN', titulo: 'SU PÁJARO', placa: 'linea_amanecer',
    lineas: [
      { id: 'M1_TERITO_010', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'En el fuselaje del avión de Esteban, bajo la cabina, hay pintura fresca: un terito chiquito recortado en blanco, de perfil, quieto y alerta. Cuello finito, pecho compacto, y la cresta larga barriendo hacia atrás desde la nuca.', en: '' },
      { id: 'M1_TERITO_020', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 1.0,
        accion: 'Toca la pintura fresca con un dedo.',
        es: '…¿Y esto?', en: '' },
      { id: 'M1_TERITO_030', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 1.5,
        accion: 'Sin darle importancia, acomodando la escalerilla.',
        es: 'Su pájaro, Teniente. Acá los aviones van con nombre.', en: '' },
      { id: 'M1_TERITO_040', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0.8,
        accion: 'Mira los otros aviones.',
        es: '…¿Y el resto tienen estrellas?', en: '' },
      { id: 'M1_TERITO_050', personaje: 'EL TURCO', cara: 'turco_sonrisa', hold: 0.8,
        es: 'Sí. Tengo la costumbre de pintarles una estrella a cada uno por cada vuelta.', en: '' },
      // el gesto del Turco: le habla al avion como a un caballo, y la ultima frase no es sobre el
      // avion. Nadie lo comenta, aca ni despues (§9d, la regla que hace que no sea cursi).
      { id: 'M1_TERITO_060', personaje: 'EL TURCO', cara: 'turco_orgullo', hold: 3.0,
        accion: 'Golpea el fuselaje como a un caballo.',
        es: 'Traémela entera, Tero, eh. Y traete vos adentro, que la estrellita la pinto por vos, no por ella.', en: '' },
    ],
  },
  // EL RITUAL DE LOS CINCO (GUION_3 §3.11). SIN MUSICA Y SIN NARRACION: solo el ruido de la pista.
  // Cinco gestos distintos en diez segundos, y NADIE EXPLICA NINGUNO — ni aca ni despues. El
  // jugador los va a reconocer solo, mision tras mision, y recien en M14 va a entender que los
  // estuvo aprendiendo: alli el ritual vuelve, son tres, y esta roto.
  //
  // La unica voz de la escena es el Gitano, y ese es el chiste: en la escena donde no habla nadie,
  // el habla igual. De paso planta que le pone nombre al avion y se lo cambia en cada mision.
  M1_CINCO: {
    id: 'M1_CINCO', tipo: 'VN', titulo: 'EL RITUAL DE LOS CINCO', placa: 'linea_amanecer',
    lineas: [
      { id: 'M1_CINCO_010', personaje: null, cara: null, hold: 2.0, tipo: 'NARRADOR',
        es: 'Los cinco caminan hacia los aviones. No habla nadie.', en: '' },
      { id: 'M1_CINCO_020', personaje: null, cara: null, hold: 2.0, tipo: 'NARRADOR',
        es: 'Puma no mira a nadie: da la vuelta al suyo y toca tres cosas, en orden, sin apurarse. Las mismas tres de hace veinte años.', en: '' },
      { id: 'M1_CINCO_030', personaje: null, cara: null, hold: 2.0, tipo: 'NARRADOR',
        es: 'El Vasco apoya la cruz que lleva al cuello contra el fuselaje, la deja dos segundos, se persigna y sube.', en: '' },
      { id: 'M1_CINCO_040', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 1.5,
        accion: 'Le señala su avión al Turco con el pulgar, y sube antes de que le contesten.',
        es: 'Turco, a ésta hoy le decimos «el Colectivo». Anotá.', en: '' },
      { id: 'M1_CINCO_050', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'El Pichón no sube todavía: apoya la mano abierta en la chapa, al lado de la toma, con el motor ya girando. Se queda quieto, escuchando. Después mira al Turco y le hace que sí con la cabeza.', en: '' },
      { id: 'M1_CINCO_060', personaje: null, cara: null, hold: 2.0, tipo: 'NARRADOR',
        es: 'Tero se para un segundo delante del suyo. Estira dos dedos y toca el terito recién pintado. No dice nada.', en: '' },
      { id: 'M1_CINCO_070', personaje: null, cara: null, hold: 3.0, tipo: 'NARRADOR',
        es: 'El Turco los mira subir a los cinco desde atrás, con el trapo en el hombro. Cuando el último cierra la cúpula, le dice al avión más cercano algo que no se escucha.', en: '' },
    ],
  },
  STORYM1_TARJETA: {
    id: 'STORYM1_TARJETA', tipo: 'TARJETA',
    titulo: 'CON SAL EN LAS ALAS', capitulo: 1,
    lineas: [
      { id: 'STORYM1_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: 'Mar abierto · Objetivo: dominar el vuelo rasante', en: '' },
    ],
  },
  M1_7: {
    id: 'M1_7', tipo: 'VN',
    titulo: 'TODOS VUELVEN', placa: 'linea_atardecer', img: 'M1_7',
    lineas: [
      { id: 'M1_7_010', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'El escuadrón aterriza. Vuelven los cinco. El Turco va de avión en avión con un pincel finito y la lengua afuera: cinco estrellitas, una en cada uno.', en: '' },
      { id: 'M1_7_020', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        es: 'Esta estrellita te pertenece. A vos, no al avión.', en: '' },
      { id: 'M1_7_030', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'Al menos por un ratito, esto parece una aventura.', en: '' },
    ],
  },
  M1_9: {
    id: 'M1_9', tipo: 'TIERRA',
    titulo: 'EL CUADERNO', placa: 'p1c_cuaderno', img: 'carta2_m1',
    lineas: [
      // EL CUERO DE OVEJA, no "un cacho de lana": es un objeto y vuelve en M12 tapando a Mateo
      // hasta el final. Tiene que ser reconocible desde aca.
      { id: 'M1_9_010', personaje: null, cara: null, hold: 0,
        es: 'Viejo: hoy conocí a un tipo, el cabo Correa. Correntino. Le dicen el Colorado. Me vio tiritando y me tiró un cuero de oveja sin decir nada — de una que carnearon los pibes acá, me dijo, con la lana para adentro. Abriga como estufa.', en: '' },
      { id: 'M1_9_020', personaje: null, cara: null, hold: 0,
        es: 'Parece un poncho de oveja, pá: me lo pongo y quedo hecho un gaucho. Después me enseñó a armar el pozo mirando de dónde viene el viento. Tiene una hermana de mi edad allá en Corrientes y unos mates que te levantan de la tumba.', en: '' },
      { id: 'M1_9_030', personaje: null, cara: null, hold: 0,
        es: 'No sé por qué, pero con él cerca tengo menos miedo. ¿Vos lo mandaste, no? No me mientas que te conozco, viejo. Gracias.', en: '' },
      // LA CAPA ES EL CUERO DE OVEJA. Lo que a Mateo lo abriga es lo que hace heroe al otro, y el
      // pibe lo dibuja sin darse cuenta de lo que esta diciendo. Nadie lo dice nunca.
      { id: 'M1_9_040', personaje: null, cara: null, hold: 0,
        es: 'Lo dibujé con capa, como un superhéroe, y abajo le puse "el Colorado". Te vas a reír cuando lo veas.', en: '' },
      // DE DONDE SALE EL APODO, contado por la madre y de rebote. Cierra con P2_3_080, donde Norma
      // se lo cuenta a Mateo en la cocina: el pibe lo repite sin saber que el jugador ya lo oyo.
      { id: 'M1_9_050', personaje: null, cara: null, hold: 2.0,
        es: 'Anoche en el pozo los pibes hablaban de los viejos. Conté que el mío vuela y no me creían. Y me acordé de mamá, de cuando era chico y vos no estabas nunca: ella me contaba que en la Fuerza te dicen Tero desde antes de que yo naciera. Mateo.', en: '' },
    ],
  },
  M2_1: {
    id: 'M2_1', tipo: 'VN', titulo: 'LA BRECHA', placa: 'linea_amanecer',
    lineas: [
      { id: 'M2_1_010', personaje: null, cara: null, hold: 1.5,
        es: 'Ellos tienen misiles que piensan solos, radares que ven de noche, Sea Harriers de última generación. Los Fieles tienen aviones con más horas que un colectivo del interior, bombas de otra década y coraje.', en: '' },
      { id: 'M2_1_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 1.0,
        es: 'Ellos tienen la máquina. Nosotros tenemos las manos. Vamos a volar tan bajo que la máquina no va a poder creer que alguien esté tan loco. Esa incredulidad es toda nuestra ventaja.', en: '' },
      { id: 'M2_1_030', personaje: 'ESTEBAN', cara: 'tero_preocupado', hold: 1.5,
        es: '¿Y alcanza?', en: '' },
      // la pausa larga antes del "No" es la linea: contestar rapido lo volveria arenga
      { id: 'M2_1_040', personaje: 'PUMA', cara: 'puma_ceno', hold: 2.0,
        es: 'No, pero es lo que hay. Y lo que hay lo volamos con todo. Como en el potrero, si el rival tiene botines y vos estás descalzo, tenés que gambetear más pegado al piso.', en: '' },
    ],
  },
  STORYM2_TARJETA: {
    id: 'STORYM2_TARJETA', tipo: 'TARJETA',
    titulo: 'EL BAUTISMO DE FUEGO', capitulo: 2,
    lineas: [
      { id: 'STORYM2_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '1 de mayo de 1982 · Costa', en: '' },
    ],
  },
  M2_5: {
    id: 'M2_5', tipo: 'VN',
    titulo: 'RASPADOS', placa: 'hangar_noche', img: 'M2_5',
    lineas: [
      { id: 'M2_5_010', personaje: null, cara: null, hold: 0,
        es: 'Vuelven todos, pero raspados. El Pichón aterriza con el avión agujereado y las manos temblándole.', en: '' },
      { id: 'M2_5_020', personaje: null, cara: null, hold: 0,
        es: 'El Turco lo abraza sin decir nada y se pasa la noche remendando chapa a la luz de un farol. A la mañana, el avión tiene los agujeros parchados y una estrellita nueva.', en: '' },
      { id: 'M2_5_030', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        es: '¿Ves? Esa no es del avión. Es tuya. Te la ganaste, changuito.', en: '' },
    ],
  },
  M2_8: {
    id: 'M2_8', tipo: 'TIERRA', titulo: 'EL CUADERNO', placa: 'p1c_cuaderno', img: 'carta3_m2',
    lineas: [
      { id: 'M2_8_010', personaje: null, cara: null, hold: 0,
        es: 'Pá: hoy comimos una vez. En todo el día. La comida está —la mandan del continente— pero nunca llega a nosotros. El Colorado me pasó la mitad de su lata, jurando que él ya había comido. Una mentira grande como una casa. Le escuché las tripas toda la noche.', en: '' },
      { id: 'M2_8_020', personaje: null, cara: null, hold: 0,
        es: 'Hay un subteniente, Bordón. Tiene su carpa custodiada y llena de cajas. Estamos convencidos de que son las raciones y demás cosas que nos mandan. Pero nadie dice nada acá. El que abre la boca, la pasa mal.', en: '' },
      { id: 'M2_8_030', personaje: null, cara: null, hold: 0,
        es: 'Igual, te cuento una linda: como prohibieron pasar música en inglés, la radio pasa rock nacional todo el día. Pasamos toda la noche con los pibes cantando en el pozo, pá. Tratábamos de distraernos, pero nos ganaron las ganas de llorar. Igualmente cantábamos.', en: '' },
      { id: 'M2_8_040', personaje: null, cara: null, hold: 1.5,
        es: 'Unas ganas de comer el guiso de mamá... Apenas termine esto le pedimos que lo prepare. Anotalo vos también, que yo acá lo tengo escrito. Mateo.', en: '' },
    ],
  },
  M3_1: {
    id: 'M3_1', tipo: 'VN', titulo: '4 DE MAYO', placa: 'linea_amanecer',
    lineas: [
      { id: 'M3_1_010', personaje: null, cara: null, hold: 1.5,
        es: 'El 4 de mayo de 1982, el mundo se enteró que la flota más poderosa podía sangrar. Un misil Exocet alcanzó al destructor británico HMS Sheffield.', en: '' },
      { id: 'M3_1_020', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.8,
        es: '¡Le dimos, muchachos! ¡Le dimos! ¡A la Royal Navy! ¡Que se enteren en Londres que acá abajo hay gente con huevos! ¡Vamos Argentina, CARAJO!', en: '' },
      { id: 'M3_1_030', personaje: 'PUMA', cara: 'puma_ceno', hold: 1.5,
        es: 'Veinte marinos, Gitano.', en: '' },
      // la caida de la sonrisa tiene su propia linea Y su propia cara: es el beat que enseña
      // en que registro esta parado el juego, y aplastarlo en la linea de arriba lo borraria
      { id: 'M3_1_040', personaje: 'GITANO', cara: 'gitano_risa_apagada', hold: 2.0,
        es: '...veinte marinos... veinte...', en: '' },
      { id: 'M3_1_050', personaje: 'PUMA', cara: 'puma_ceno', hold: 3.0,
        es: 'Del otro lado hay padres e hijos. Pibes iguales a nosotros que hoy no vuelven. Alegrate de que nosotros sí. Y guardá silencio por los que no.', en: '' },
    ],
  },
  M3_2: {
    id: 'M3_2', tipo: 'VN', titulo: 'LA GAMBETA', placa: 'linea_amanecer',
    lineas: [
      // LA PROFECIA. Se dice en voz baja y nadie la subraya — es el unico momento del juego que
      // mira mas alla de la guerra, y funciona porque el jugador sabe como termina.
      { id: 'M3_2_010', personaje: 'GITANO', cara: 'gitano_neutro', hold: 1.5,
        es: 'Algún día les vamos a ganar en algo que no mate a nadie. Algún pibe nuestro va a agarrar una pelota y los va a gambetear a todos, Puma. ¡A TODOS! Y ese día va a ser más grande que éste.', en: '' },
      { id: 'M3_2_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 2.5,
        es: 'Ojalá la única guerra que nos quede sea esa.', en: '' },
      // el terito: el gesto de Esteban antes de cada salida. No se explica nunca.
      { id: 'M3_2_030', personaje: null, cara: null, hold: 2.0,
        es: 'Camino a los aviones, Esteban se para un segundo delante del suyo, estira dos dedos y toca el terito. Luego sigue caminando.', en: '' },
    ],
  },
  STORYM3_TARJETA: {
    id: 'STORYM3_TARJETA', tipo: 'TARJETA',
    titulo: 'EL DÍA QUE SANGRÓ EL MAR', capitulo: 4,
    lineas: [
      { id: 'STORYM3_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '4 de mayo de 1982 · HMS SHEFFIELD', en: '' },
    ],
  },
  M3_6: {
    id: 'M3_6', tipo: 'VN',
    titulo: 'PRIMERA GRAN VICTORIA', placa: 'linea_atardecer', img: 'M3_6',
    lineas: [
      { id: 'M3_6_010', personaje: null, cara: null, hold: 0,
        es: 'En la base hay abrazos, alguien descorcha algo. En la radio quedó grabado el pánico inglés: "Low level! Low level! Here they come again!"', en: '' },
      { id: 'M3_6_020', personaje: null, cara: null, hold: 0,
        es: 'Puma se aparta y se queda mirando el mar, sin sonreír. Cuando Puma no sonríe, hay que preocuparse.', en: '' },
    ],
  },
  M3_8: {
    id: 'M3_8', tipo: 'TIERRA', titulo: 'EL CUADERNO', placa: 'p1c_cuaderno', img: 'carta5_m4',
    lineas: [
      { id: 'M3_8_010', personaje: null, cara: null, hold: 0,
        es: '¡Viejo! Llegó la noticia del Sheffield y por primera vez vi a los pibes levantar la cabeza. El Colorado me apretó el hombro y me dijo "tu viejo anda ahí arriba, pibe. Seguro anda por ahí".', en: '' },
      { id: 'M3_8_020', personaje: null, cara: null, hold: 0,
        es: '¿Eras vos? Elijo creer que sí.', en: '' },
      { id: 'M3_8_030', personaje: null, cara: null, hold: 0,
        es: 'Lo dibujé: un avioncito plateado y un barco enorme, y el avioncito gana. Salió medio chueco el barco. Los barcos son difíciles.', en: '' },
      // EL ANUNCIO. Desde aca, cada vuelo de Esteban es tambien el vuelo que Mateo no va a hacer.
      { id: 'M3_8_040', personaje: null, cara: null, hold: 0,
        es: 'Y te cuento algo que no te dije en la despedida porque me daba no sé qué: cuando salga de acá me anoto en la escuela de aviación, pá. Lo tengo decidido hace rato. Quiero volar con vos. Quiero que un día la escuadrilla sea "Aldao y Aldao" y que el Turco ese nos putee a los dos juntos.', en: '' },
      { id: 'M3_8_050', personaje: null, cara: null, hold: 2.0,
        es: 'Cuidate mucho. Volá bajo, como me enseñaste. Yo te espero acá, pegadito a la tierra. Mateo.', en: '' },
    ],
  },
  M3_HIST: {
    id: 'M3_HIST', tipo: 'VN',
    titulo: 'HMS SHEFFIELD · 4 MAYO 1982', placa: 'radio', img: 'M3_HIST',
    lineas: [
      { id: 'M3_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'Un Super Etendard de la Armada Argentina lanzó un misil Exocet que impactó el casco del destructor.', en: '' },
      { id: 'M3_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Murieron 20 tripulantes. El fuego obligó a abandonar el buque.', en: '' },
      { id: 'M3_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Fue el primer buque de guerra británico perdido en acción desde la Segunda Guerra Mundial... Y fuimos nosotros.', en: '' },
    ],
  },
  M4_1: {
    id: 'M4_1', tipo: 'VN',
    titulo: 'SAN CARLOS', placa: 'linea_amanecer', img: 'M4_1',
    lineas: [
      { id: 'M4_1_010', personaje: null, cara: null, hold: 0,
        es: 'Los británicos desembarcan. El estrecho se vuelve una trampa de fuego antiaéreo que los propios pilotos bautizan, con humor de velorio, el Callejón de las Bombas. Hay que entrar ahí. Todos los días.', en: '' },
      { id: 'M4_1_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Muchachos... es la boca del lobo. Entramos, soltamos, salimos. Nadie se hace el héroe. Los héroes no llegan al mate de la tarde.', en: '' },
    ],
  },
  M4_2: {
    id: 'M4_2', tipo: 'VN', titulo: 'POR EL HIJO DE ALGUIEN', placa: 'hangar_dia',
    lineas: [
      { id: 'M4_2_010', personaje: 'ESTEBAN', cara: 'tero_preocupado', hold: 1.5,
        es: 'Puma... mi hijo está en tierra. Cerca de ahí.', en: '' },
      // LA FRASE QUE MATEO VA A CONTESTAR SIN SABERLO, en su carta de esta misma mision:
      // «el que cayó también era el hijo de alguien». Padre e hijo llegan a la misma frase por
      // caminos opuestos y ninguno se entera. NO SEPARAR ESTAS DOS ESCENAS.
      { id: 'M4_2_020', personaje: 'PUMA', cara: 'puma_ceno', hold: 2.5,
        es: 'Lo sé, Tero. Todos tenemos a alguien abajo. Cada barco que tocamos es una bomba menos cayéndole a los pibes. Todos nosotros volamos por ese hijo de alguien.', en: '' },
      { id: 'M4_2_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.8,
        accion: 'Acomodando la cabina para subirse al avión',
        es: '¿Vieron que hicieron un festival allá en Buenos Aires? Juntaron un montón de cosas para los pibes de las islas. Chocolates, cigarrillos, abrigo…', en: '' },
      { id: 'M4_2_040', personaje: 'VASCO', cara: 'vasco_neutro', hold: 0.6,
        es: '¿Y?', en: '' },
      // el remate es lo que NO pasa: juntaron, y no llegó. Se dice cerrando la cupula, sin drama.
      { id: 'M4_2_050', personaje: 'GITANO', cara: 'gitano_ceno', hold: 2.0,
        es: 'Y nada. Eso digo. Juntaron.', en: '' },
      { id: 'M4_2_060', personaje: null, cara: null, hold: 2.5,
        es: 'Y atrás, sin que lo vea nadie, el Vasco apoya la cruz contra el fuselaje. La deja ahí dos segundos más de lo que la deja siempre.', en: '' },
    ],
  },
  STORYM4_TARJETA: {
    id: 'STORYM4_TARJETA', tipo: 'TARJETA',
    titulo: 'EL CALLEJÓN DE LAS BOMBAS', capitulo: 5,
    lineas: [
      { id: 'STORYM4_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '21 de mayo de 1982 · HMS ARDENT', en: '' },
    ],
  },
  M4_EPI: {
    id: 'M4_EPI', tipo: 'VN',
    titulo: 'EL PRECIO', placa: 'linea_atardecer', img: 'M4_EPI',
    lineas: [
      { id: 'M4_EPI_010', personaje: null, cara: null, hold: 0,
        es: 'El Ardent arde. Victoria. Pero el avión del Vasco vuelve rozando el mar, con el tren de aterrizaje colgando como una pata quebrada. Toca pista de milagro.', en: '' },
      { id: 'M4_EPI_020', personaje: null, cara: null, hold: 0,
        es: 'Esa noche nadie hace chistes. El Turco no pinta la estrellita del Vasco hasta el otro día, porque le temblaba el pulso.', en: '' },
    ],
  },
  M4_CARTA: {
    id: 'M4_CARTA', tipo: 'TIERRA', titulo: 'EL CUADERNO', placa: 'p1c_cuaderno', img: 'carta6_m5',
    lineas: [
      { id: 'M4_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Pá: hoy vi caer un avión nuestro a lo lejos. Recé para que no fueras vos y después me sentí una basura, porque el que cayó también era el hijo de alguien, el viejo de alguien.', en: '' },
      { id: 'M4_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'El Colorado me encontró llorando y no me dijo "sé hombre" ni ninguna de esas pavadas. Se sentó al lado mío en el barro y esperó que se me pase. Sabe esperar como nadie, debe ser de tanto pescar en el Paraná.', en: '' },
      { id: 'M4_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'Bordón hizo estaquear a dos pibes por "robar" comida de las cajas. La comida es nuestra, pá. Uno era el jujeño de la radio. ¿Esto es la guerra? ¿O es otra cosa? Porque contra los ingleses todavía no disparé un tiro, pero contra el frío, el hambre y Bordón peleamos todos los días.', en: '' },
      // EL HAMBRE EN CRUDO. La carta no pide lastima y por eso pega: lo cuenta como un trabajo.
      { id: 'M4_CARTA_040', personaje: null, cara: null, hold: 0,
        es: 'Anoche carneamos una oveja, pá. A escondidas, con el Colorado y dos más. La comimos hasta los huesos: los partimos con piedras para sacarles el caracú. Yo, que en casa le sacaba la grasa al churrasco. Nadie hizo un chiste ni pidió perdón. Lo hicimos rápido y en silencio, como un trabajo.', en: '' },
      { id: 'M4_CARTA_050', personaje: null, cara: null, hold: 2.5,
        es: 'No sé qué me da más miedo, pá: el hambre, o en lo que me estoy convirtiendo aguantándola. Mateo.', en: '' },
    ],
  },
  M4_HIST: {
    id: 'M4_HIST', tipo: 'VN',
    titulo: 'HMS ARDENT · 21 MAYO 1982', placa: 'radio', img: 'M4_HIST',
    lineas: [
      { id: 'M4_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'La fragata HMS Ardent fue atacada en oleadas sucesivas mientras cubría el desembarco en San Carlos.', en: '' },
      { id: 'M4_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Murieron 22 tripulantes. Se hundió al día siguiente.', en: '' },
      { id: 'M4_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Su comandante fue el último en abandonarla.', en: '' },
    ],
  },
  M5_1: {
    id: 'M5_1', tipo: 'VN',
    titulo: 'LAS BOMBAS QUE NO DESPIERTAN', placa: 'linea_amanecer', img: 'M5_1',
    lineas: [
      { id: 'M5_1_010', personaje: null, cara: null, hold: 0,
        es: 'Muchas bombas argentinas no explotan: se lanzan TAN bajo que no llegan a armarse en el aire. La espoleta necesita caída, y los pilotos no pueden dársela sin regalarse.', en: '' },
      { id: 'M5_1_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '¿A ver si entendí? Le pegó. Le pegó BIEN. En el medio del casco... ¿Y no explota?', en: '' },
      { id: 'M5_1_030', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Para que arme la bomba, tenés que soltarla más alto. Y si la soltás más alto, te bajan a vos.', en: '' },
      { id: 'M5_1_040', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        accion: 'Mirando la bomba bajo el ala.',
        es: 'Es como el sapito. La piedra va tan pegada al agua que no se hunde. El problema es que nosotros necesitamos que se hunda.', en: '' },
    ],
  },
  M5_2: {
    id: 'M5_2', tipo: 'VN',
    titulo: 'EL CHISTE DE SIEMPRE', placa: 'hangar_dia', img: 'M5_2',
    lineas: [
      { id: 'M5_2_010', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'Entonces, elijo pegarle y volver a cebar el mate. Que la bomba haga lo que pueda. Y si no vuelvo... Mandale un saludo a tu casada de mi parte, Vasco.', en: '' },
      { id: 'M5_2_020', personaje: 'VASCO', cara: 'vasco_neutro', hold: 0,
        accion: 'Sacude la cabeza, por primera vez casi riéndose.',
        es: '...cerrá la boca, cordobés.', en: '' },
    ],
  },
  STORYM5_TARJETA: {
    id: 'STORYM5_TARJETA', tipo: 'TARJETA',
    titulo: 'LA BOMBA QUE NO DESPERTÓ', capitulo: 6,
    lineas: [
      { id: 'STORYM5_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '23 de mayo de 1982 · HMS ANTELOPE', en: '' },
    ],
  },
  M5_EPI: {
    id: 'M5_EPI', tipo: 'VN',
    titulo: 'EL DE ALLÁ TAMBIÉN', placa: 'linea_atardecer', img: 'M5_EPI',
    lineas: [
      { id: 'M5_EPI_010', personaje: null, cara: null, hold: 0,
        es: 'El barco inglés Antelope, explota durante la noche. Una bomba dormida despierta mientras un artificiero británico intentaba desactivarla.', en: '' },
      { id: 'M5_EPI_020', personaje: null, cara: null, hold: 0,
        es: 'Del otro lado, un hombre murió tratando de salvar a los suyos.', en: '' },
      { id: 'M5_EPI_030', personaje: 'VASCO', cara: 'vasco_neutro', hold: 0,
        accion: 'Mirando el lejano resplandor, casi murmurando.',
        es: 'Que Dios lo tenga en la gloria. Al de allá también.', en: '' },
    ],
  },
  M5_CHANCHA: {
    id: 'M5_CHANCHA', tipo: 'VN',
    titulo: 'LA CHANCHA', placa: 'hangar_noche', img: 'M5_CHANCHA',
    lineas: [
      { id: 'M5_CHANCHA_010', personaje: null, cara: null, hold: 0,
        es: 'En el regreso, a Gitano no le cierra la cuenta de combustible. Viento de frente, tanque picado, la aguja bajando.', en: '' },
      { id: 'M5_CHANCHA_020', personaje: 'GITANO', cara: 'gitano_panico', hold: 0,
        accion: 'Por primera vez sin humor.',
        es: 'Muchachos... no me da eh... No me da la nafta.', en: '' },
      { id: 'M5_CHANCHA_030', personaje: 'CÓNDOR', cara: 'condor_reposo', hold: 0,
        es: 'Plata 2, mantenga rumbo. La Chancha va a buscarlo.', en: '' },
      { id: 'M5_CHANCHA_040', personaje: null, cara: null, hold: 0,
        es: 'Y de la nada, de noche y a metros del mar, aparece la Chancha: el Hércules reabastecedor de combustible. La manguera se conecta en el aire al avión del Gitano.', en: '' },
      { id: 'M5_CHANCHA_050', personaje: 'LA CHANCHA', cara: null, hold: 0,
        es: 'Tranquilo, cordobés. La Chancha no abandona. Servite.', en: '' },
      { id: 'M5_CHANCHA_060', personaje: 'GITANO', cara: 'gitano_llorando', hold: 0,
        accion: 'Con los ojos llorosos y la voz quebrada',
        es: 'Cuando volvamos me vuelvo vegetariano en tu honor.', en: '' },
      // M6-04: EL SEGUNDO MOVIMIENTO, que es donde pasa lo importante. La Chancha NO SE DESCONECTA:
      // aguanta el antiaereo con la manguera puesta hasta que el Gitano termina de cargar. La
      // maquina hace lo que hace un ser querido — se pone adelante — y por eso se rompe.
      { id: 'M5_CHANCHA_070', personaje: null, cara: null, hold: 1.5,
        es: 'Y entonces, con la manguera todavía conectada, la costa los ilumina: un reflector, y enseguida el fuego antiaéreo.', en: '' },
      { id: 'M5_CHANCHA_080', personaje: null, cara: null, hold: 3.0,
        es: 'La Chancha no se desconecta. Aguanta, enorme y lenta, hasta que el Gitano termina de cargar. Recién ahí rompe: un impacto le arranca un pedazo de ala. Se va al oeste, tosiendo, escoltada por los insultos de amor del Gitano.', en: '' },
      // M6-05: el epilogo del epilogo. De aca sale `chancha: false` en m7 y m8 (data/missions.js),
      // y de aca sale el «sin Chancha no hay nafta de vuelta» de M13. El Gitano lo sabe mejor que
      // nadie: se rompio por el.
      { id: 'M5_CHANCHA_090', personaje: null, cara: null, hold: 2.5,
        es: 'En la base, la Chancha llegó. Está rota. Los mecánicos la rodean como a un animal herido. El Turco le pasa la mano por el ala agujereada y no dice nada.', en: '' },
      { id: 'M5_CHANCHA_100', personaje: null, cara: null, hold: 3.0,
        es: 'Desde esta noche vuela corto. Sirve para trabajos cerca. No baja más al sur.', en: '' },
    ],
  },
  M5_CARTA: {
    id: 'M5_CARTA', tipo: 'TIERRA',
    titulo: 'EL CUADERNO', placa: 'p1c_cuaderno', img: 'carta7_m6',
    lineas: [
      { id: 'M5_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Viejo: ¿es verdad que allá hicieron un festival para juntar cosas para nosotros? Porque acá no llegó ni un chocolate. Ah, si. Llegó una revista que decía "Estamos ganando". ¿Ganando?', en: '' },
      { id: 'M5_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'Cambiando de tema, el Colorado me mostró la foto de la hermana, toda gastada de tanto mirarla. "Cuando volvamos, te la presento", me dijo. Me reí, pá. Hacía días que no me reía.', en: '' },
      { id: 'M5_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'Le pedí que cuando termine esto venga a casa. Hacemos un asado en el fondo, vos contando las mentiras de aviador, y él contando mentiras de pescador. Tengo un amigo, pá. En el peor lugar del mundo, tengo un amigo. Mateo.', en: '' },
    ],
  },
  M5_HIST: {
    id: 'M5_HIST', tipo: 'VN',
    titulo: 'HMS ANTELOPE · 23 MAYO 1982', placa: 'radio', img: 'M5_HIST',
    lineas: [
      { id: 'M5_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'Dos bombas impactaron la fragata HMS Antelope, pero no detonaron.', en: '' },
      { id: 'M5_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Al intentar desactivar una, la bomba estalló. Murió el artificiero James Prescott.', en: '' },
      { id: 'M5_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'El incendio llegó a la santabárbara y el buque se partió en dos. Su silueta ardiendo se volvió una de las imágenes del conflicto.', en: '' },
    ],
  },
  M6_1: {
    id: 'M6_1', tipo: 'VN',
    titulo: 'FIESTA PATRIA', placa: 'linea_amanecer', img: 'M6_1',
    lineas: [
      { id: 'M6_1_010', personaje: null, cara: null, hold: 0,
        es: 'En la base alguien consiguió pastelitos, Dios sabe cómo, y el Turco preparó chocolate caliente en un tacho de aceite lavado. Hoy un barco cae de regalo para un país que allá lejos ni sabe sus nombres.', en: '' },
      { id: 'M6_1_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Hoy es 25, muchachos. Hoy le dedicamos uno a la Patria.', en: '' },
      { id: 'M6_1_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'A la Patria patria, ¿eh? La de los pibes y los pastelitos. No a la de los despachos, que esos se consigan su propio barco.', en: '' },
    ],
  },
  M6_2: {
    id: 'M6_2', tipo: 'VN',
    titulo: 'EL VASCO HABLA', placa: 'vestuario', img: 'M6_2',
    lineas: [
      // SE LO ESCUCHA HABLAR DE MAS, no se cuenta que hablo de mas. Y la anecdota NO SE TERMINA:
      // el «¿vos estas bien?» cae en la mitad de la frase, que es donde se nota.
      { id: 'M6_2_010', personaje: null, cara: null, hold: 1.2,
        es: 'El Vasco habla más que en las cinco misiones anteriores juntas. Del chocolate, del frío, de una anécdota de la escuela de aviación que nadie le pidió.', en: '' },
      { id: 'M6_2_020', personaje: 'VASCO', cara: 'vasco_neutro', hold: 0.4,
        es: '…y el tipo me hace repetir el aterrizaje cuatro veces. Cuatro. Yo tenía diecinueve años y—', en: '' },
      { id: 'M6_2_030', personaje: 'GITANO', cara: 'gitano_sorprendido', hold: 0,
        accion: 'Escuchando sorprendido.',
        es: ' Vasco. ¿Vos estás bien?', en: '' },
      { id: 'M6_2_040', personaje: 'VASCO', cara: 'vasco_sonrisa', hold: 0,
        accion: 'Se queda pensando la respuesta demasiado tiempo',
        es: 'Sí, ¿por? Se te enfría el chocolate.', en: '' },
      // EL GESTO DEL VASCO POR ULTIMA VEZ (§9d). Va como CUADRO y no como linea de narrador: la
      // idea es que el jugador MIRE la cruz, no que lea que el Vasco la beso. Mismo recurso que el
      // dorso de la foto. Nadie lo ve dentro de la ficcion, y nadie lo comenta nunca.
      { id: 'M6_2_050', personaje: null, cara: null, hold: 3.5,
        tipo: 'CUADRO', img: 'M7_CRUZ',
        es: 'Camino al avión hace lo de siempre: apoya la cruz en el fuselaje, la deja dos segundos, se persigna. Lo que no ve nadie es que esta vez, antes de guardarla, la besa.', en: '' },
    ],
  },
  STORYM6_TARJETA: {
    id: 'STORYM6_TARJETA', tipo: 'TARJETA',
    titulo: 'PASTELITOS', capitulo: 7,
    lineas: [
      { id: 'STORYM6_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '25 de mayo de 1982 · HMS COVENTRY', en: '' },
    ],
  },
  M6_EPI: {
    id: 'M6_EPI', tipo: 'VN',
    titulo: 'LA SALIDA DEL BLANCO', placa: 'linea_noche', img: 'M6_EPI',
    lineas: [
      { id: 'M6_EPI_010', personaje: null, cara: null, hold: 0,
        es: 'El Coventry cae. En la salida, un Sea Harrier engancha al Vasco. Lo tenés al lado. Lo ves. No podés hacer nada.', en: '' },
      { id: 'M6_EPI_020', personaje: 'GITANO', cara: 'gitano_piloto_gritando', hold: 0,
        es: '¡Vasco! ¡Eyectate! ¡SALTÁ, VASCO, SALTÁ!', en: '' },
      { id: 'M6_EPI_030', personaje: 'VASCO', cara: 'vasco_piloto', hold: 0,
        accion: 'Un ruido corto, el sonido de alguien que va a decir algo y no llega. Estática.',
        es: '...', en: '...' },
      { id: 'M6_EPI_040', personaje: null, cara: null, hold: 4.0,
        es: 'Silencio total. Cuatro aviones donde había cinco.', en: '' },
      { id: 'M6_EPI_050', personaje: 'PUMA', cara: 'puma_piloto_triste', hold: 0,
        accion: 'Se le quiebra la voz.',
        es: 'Hm... Plata Fiel... a casa. Volvemos a casa.', en: '' },
      // EL COBRO DE LAS CINCO ESTRELLITAS DE M1. El jugador vio al Turco pintarlas con la lengua
      // afuera; ahora ve el tarrito abierto y a nadie pintando. No se subraya.
      { id: 'M6_EPI_060', personaje: null, cara: null, hold: 4.0,
        es: 'En la base, el Turco agarra el pincel. Lo deja. Hay una estrellita que hoy no se pinta. El tarrito queda abierto toda la noche.', en: '' },
    ],
  },
  M6_LOCKER1: {
    id: 'M6_LOCKER1', tipo: 'VN',
    titulo: 'EL LOCKER', placa: 'm13_carta_locker', img: 'M6_LOCKER1',
    lineas: [
      { id: 'M6_LOCKER1_010', personaje: null, cara: null, hold: 0,
        es: 'Esa noche el Turco junta las cosas del Vasco en una caja de cartón. Solo, sin que nadie se lo pida. En la puerta del locker, la foto de siempre: la que vieron mil veces.', en: '' },
      { id: 'M6_LOCKER1_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        accion: 'Se acerca triste.',
        es: 'La casada... Turco, dejámela ver una última vez.', en: '' },
      { id: 'M6_LOCKER1_030', personaje: null, cara: null, hold: 0,
        es: 'El Turco la despega con un cuidado de cirujano. Y al ir a envolverla en el pañuelo, la da vuelta.', en: '' },
    ],
  },
  M6_LOCKER2: {
    id: 'M6_LOCKER2', tipo: 'VN',
    titulo: 'EL DORSO', placa: 'm7_foto_dorso', img: 'M6_LOCKER2',
    lineas: [
      { id: 'M6_LOCKER2_010', personaje: null, cara: null, hold: 0,
        es: 'Rosa Elena Arrieta. 1926 – 1961. "Te amo, mamá. Perdoname."', en: '' },
      { id: 'M6_LOCKER2_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        accion: 'Mira la foto y murmura', 
        es: 'Sesenta y uno.', en: '' },
      { id: 'M6_LOCKER2_030', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: 'El Vasco tenía... ¿quince?', en: '' },
      { id: 'M6_LOCKER2_040', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        accion: 'Se le quiebra la voz.',
        es: 'Toda la guerra lo cargamos con la morocha esta. Toda la guerra, Turco. Y resulta que no sólo está muerta, sino que era la vieja... ¡La vieja! Y el tipo nunca dijo nada. Nos dejó reír. Nos regaló el chiste para que tuviéramos de qué reírnos.', en: '' },
      { id: 'M6_LOCKER2_050', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '¿Y el "perdoname"? ¿Perdoname de qué?', en: '' },
      { id: 'M6_LOCKER2_060', personaje: null, cara: null, tipo: 'NARRADOR', hold: 0,
        es: 'Todos se mantienen en silencio.', en: '' },
      { id: 'M6_LOCKER2_070', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'Che, Puma. Vos que lo conocías de antes. Lo del puerto, lo del hermano preso… ¿era verdad algo de eso?', en: '' },
      { id: 'M6_LOCKER2_080', personaje: 'PUMA', cara: 'puma_espaldas', hold: 0,
        es: 'No sé, Facundo.', en: '' },
      { id: 'M6_LOCKER2_090', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '¿Cómo que no sabés?', en: '' },
      { id: 'M6_LOCKER2_100', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        accion: 'Mientras mira la foto.',
        es: 'No sé. Nunca se lo pregunté. Un tipo que volaba como él no me tiene que explicar de dónde vino. Y ya nunca lo sabremos.', en: '' },
      { id: 'M6_LOCKER2_110', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'Tres años le cebé mate a ese culiao. Tres años, desde que éramos unos giles en la escuela de aviación. Y nunca me dijo ni de qué cuadro era. Ni de qué cuadro era, Turco.', en: '' },
     
      { id: 'M6_LOCKER2_120', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        accion: 'Guarda la foto en el bolsillo del mameluco y murmura.',
        es: 'Me la quedo hasta que vuelva donde pertenece. Señora: su hijo fue el mejor de todos nosotros.', en: '' },
    ],
  },
  M6_CARTA: {
    id: 'M6_CARTA', tipo: 'TIERRA',
    titulo: 'EL CUADERNO', placa: 'p1c_cuaderno', img: 'carta8_m7',
    lineas: [
      { id: 'M6_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Pá: perdí a alguien hoy. Ramírez, el jujeño de la radio. Tenía dieciocho, como yo. Estábamos hablando de lo qué íbamos a comer primero al volver. Yo le dije milanesas, y en la mitad de la palabra "tamales" dejó de existir. Así de rápido, pá. De la nada.', en: '' },
      { id: 'M6_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'Nadie nos preparó para esto, viejo. Ni terminamos la etapa de instrucción básica, pá. Aprendí a marchar y a tender la cama. No a que el de al lado se apague en la mitad de una palabra.', en: '' },
      { id: 'M6_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'El Colorado me dijo "llorá todo hoy, pibe, que mañana no va a haber tiempo". Lloré todo, viejo.', en: '' },
      { id: 'M6_CARTA_040', personaje: null, cara: null, hold: 0,
        es: '¿Vos también perdés gente ahí arriba? ¿Cómo se hace? Ya sé que no me vas a contestar. Igual te lo pregunto. A alguien se lo tengo que preguntar.', en: '' },
      { id: 'M6_CARTA_050', personaje: null, cara: null, hold: 0,
        es: 'En el cuaderno dibujé la radio del jujeño sola en el pozo. No me salió dibujar más nada hoy. Mateo.', en: '' },
    ],
  },
  M6_HIST: {
    id: 'M6_HIST', tipo: 'VN',
    titulo: 'HMS COVENTRY · 25 MAYO 1982', placa: 'radio', img: 'M6_HIST',
    lineas: [
      { id: 'M6_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'A-4 Skyhawk de la Fuerza Aérea Argentina atacaron volando tan bajo que el radar no lograba separarlos de la costa.', en: '' },
      { id: 'M6_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Tres bombas impactaron sobre la línea de flotación. Murieron 19 tripulantes.', en: '' },
      { id: 'M6_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'El destructor volcó y se hundió en menos de veinte minutos.', en: '' },
    ],
  },
  M7_1: {
    id: 'M7_1', tipo: 'VN',
    titulo: 'EL DUELO NO ESPERA', placa: 'linea_amanecer', img: 'M7_1',
    lineas: [
      { id: 'M7_1_010', personaje: null, cara: null, hold: 0,
        es: 'La escuadrilla está de duelo, pero la guerra no espera a que termines de llorar. El Atlantic Conveyor trae los helicópteros pesados que le cambian la logística a los británicos. Hundirlo es obligarlos a cruzar las islas a pie.', en: '' },
      { id: 'M7_1_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Por el Vasco. Sin gritos, sin euforia. Lo hacemos y volvemos. Todos. ¿Me oyeron? Todos.', en: '' },
    ],
  },
  M7_2: {
    id: 'M7_2', tipo: 'VN',
    titulo: 'TREINTA SEGUNDOS', placa: 'cabina_dia', img: 'M7_2',
    lineas: [
      { id: 'M7_2_010', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: 'Puma... la vuelta pasa cerca de los montes. Del monte de Mateo.', en: '' },
      { id: 'M7_2_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        accion: 'Lo mira fijamente en silencio. Sabe exactamente lo que le está pidiendo.',
        es: 'Tenés treinta segundos de desvío y ni uno más. Y si me preguntan, yo no vi nada.', en: '' },
      { id: 'M7_2_030', personaje: 'GITANO', cara: 'gitano_serio_triste', hold: 0,
        es: 'Nadie vio nada. Andá a saludar al pibe, Tero.', en: '' },
      // EL GESTO DE PUMA (§9d, M8). Su cariño es un procedimiento: las mismas tres cosas, en el
      // mismo orden, hace veinte años. Hoy, el dia despues de la muerte del Vasco, las toca DOS
      // VECES CADA UNA. Nadie lo comenta.
      { id: 'M7_2_040', personaje: null, cara: null, hold: 3.0,
        es: 'Y Puma, que no dijo una palabra más, da la vuelta a su avión y toca las tres cosas de siempre. Hoy las toca dos veces cada una.', en: '' },
    ],
  },
  STORYM7_TARJETA: {
    id: 'STORYM7_TARJETA', tipo: 'TARJETA',
    titulo: 'EL BATIR DE LAS ALAS', capitulo: 8,
    lineas: [
      { id: 'STORYM7_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '25 de mayo de 1982 · ATLANTIC CONVEYOR', en: '' },
    ],
  },
  M7_SOBREVUELO: {
    id: 'M7_SOBREVUELO', tipo: 'VN',
    titulo: 'EL SOBREVUELO', placa: 'linea_atardecer', img: 'M7_SOBREVUELO',
    lineas: [
      { id: 'M7_SOBREVUELO_010', personaje: null, cara: null, hold: 0,
        es: 'En el regreso, Esteban se descuelga de la formación. Baja. Baja más. El monte de Mateo aparece adelante: pozos, casquitos, barro.', en: '' },
      { id: 'M7_SOBREVUELO_020', personaje: null, cara: null, hold: 0,
        es: 'Cruza el monte a altura de árbol, tan bajo que los pibes sienten el trueno en el pecho, y bate las alas: una a la izquierda, una a la derecha. El saludo más viejo de la aviación. Te veo. Estoy acá.', en: '' },
      { id: 'M7_SOBREVUELO_030', personaje: null, cara: null, hold: 0,
        es: 'Decenas de casquitos mirando para arriba, brazos en alto, gorros revoleados. Y un pibe flaco, parado sobre el borde del pozo, agitando un cuaderno contra el cielo.', en: '' },
      // LA MITAD DE LA ASIMETRIA (nota 8a-bis). Mateo lo reconocio —vio el terito— y el jugador lo
      // sabe por el cuaderno. El que no lo sabe es Tero, y esta linea es la pregunta con la que se
      // queda: en el Final A se muere con ella, en el Final B la respuesta le llega de viejo.
      // LA PRUEBA. La carta de Mateo afirma «le vi EL TERITO, TU pajaro» — y el jugador tiene que
      // haberlo visto una vez. Va como CUADRO: la imagen ES la escena. El asset todavia no existe
      // (ver IMAGENES_PENDIENTES) y hasta entonces cae a la placa.
      { id: 'M7_SOBREVUELO_040', personaje: null, cara: null, hold: 3.0,
        tipo: 'CUADRO', img: 'M8_TERITO',
        es: 'Desde el pozo: el Skyhawk pasando enorme, y en el fuselaje, un segundo apenas, nítido para el que sabe mirar, el terito pintado. Corte a la cara de Mateo: la boca abriéndose. Él sabe.', en: '' },
      { id: 'M7_SOBREVUELO_050', personaje: 'ESTEBAN', cara: 'tero_casco', hold: 3.5,
        accion: 'Busca con los ojos, pero el monte es una multitud de casquitos iguales y la velocidad no perdona.',
        es: '¿Estás ahí, Mateo? ¿Alguno de esos sos vos? Tenías que ser vos... Alguno tenías que ser vos...', en: '' },
      { id: 'M7_SOBREVUELO_060', personaje: 'PUMA', cara: 'puma_piloto_neutro', hold: 0,
        accion: 'Suena radio. Estática.',
        es: 'Vamos, Tero. Vamos a casa.', en: '' },
    ],
  },
  // LA FRASE DE LA TESIS, dicha por un personaje y no por una placa. El jugador la vuelve a leer
  // antes de los creditos, firmada por un veterano de verdad — y esta es la unica vez que alguien
  // la dice en pantalla. Va sobre un ENEMIGO que murio siendo bueno, no sobre el Peru: el Peru no
  // es «el otro lado», es el vecino.
  M7_TESIS: {
    id: 'M7_TESIS', tipo: 'VN', titulo: 'EL CAPITÁN DEL BARCO QUE HUNDIMOS', placa: 'hangar_dia',
    lineas: [
      { id: 'M7_TESIS_010', personaje: null, cara: null, hold: 1.5,
        es: 'En la base, cuando llega el dato del Conveyor. El Turco lo escucha con el trapo en la mano.', en: '' },
      { id: 'M7_TESIS_020', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 2.0,
        accion: 'Después de un rato. Deja el trapo.',
        es: 'Se quedó sacando a los suyos. Ese hombre, si lo cruzabas en un puerto, te convidaba un cigarrillo.', en: '' },
      { id: 'M7_TESIS_030', personaje: 'GITANO', cara: 'gitano_ceno', hold: 0.8,
        es: 'Turco, era el enemigo.', en: '' },
      { id: 'M7_TESIS_040', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 1.5,
        es: 'Era el capitán del barco que hundimos, m\'hijo. El enemigo es otra cosa.', en: '' },
      { id: 'M7_TESIS_050', personaje: 'EL TURCO', cara: 'turco_roto', hold: 4.0,
        es: 'Hay gente buena en todos lados, ¿viste? Lo que pasa es que no nos dejan conocernos.', en: '' },
    ],
  },
  M7_CARTA: {
    id: 'M7_CARTA', tipo: 'TIERRA',
    titulo: 'LA PÁGINA DEL CIELO', placa: 'p1c_cuaderno', img: 'carta9_m8',
    lineas: [
      // EL TERITO ES LA PRUEBA. Sin el, «te vi» es una corazonada; con el, Mateo TIENE la certeza
      // que su padre no va a tener nunca. Esta pagina vuelve en M13, en M14 y en el Final B.
      { id: 'M7_CARTA_010', personaje: null, cara: null, hold: 0,
        es: '¡¡PÁ!! TE VI. Hoy pasó un Skyhawk tan bajo que la turba tembló, y vi el TERO, pá. El terito pintado abajo de la cabina, TU pájaro, y batió las alas UNA A CADA LADO, y yo grité tu nombre delante de todos y no me importó nada.', en: '' },
      { id: 'M7_CARTA_020', personaje: null, cara: null, hold: 0,
        es: '"¡Es mi viejo! ¡El del terito es MI VIEJO!", y los pibes saltaban y te saludaban y me abrazaban a mí, y por un minuto entero acá abajo NADIE tuvo frío.', en: '' },
      { id: 'M7_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'El Colorado dice que un avión que bate las alas te está diciendo "te veo". ¿Me viste, pá? Éramos un montón de cascos iguales ahí abajo. No importa. Yo sí te vi. Te vi el pájaro y te vi a vos.', en: '' },
      { id: 'M7_CARTA_040', personaje: null, cara: null, hold: 0,
        es: 'Hoy dibujé la mejor página del cuaderno: el monte entero desde arriba, como lo habrás visto vos, todos nosotros chiquitos saludando, y el avión con su terito batiendo las alas. Ésta te la doy en la mano cuando vuelvas. "¿Viste que te reconocí?", te voy a decir. Ya quiero ver la cara que vas a poner.', en: '' },
      { id: 'M7_CARTA_050', personaje: null, cara: null, hold: 2.0,
        es: 'Volá bajo. TE VI. Mateo.', en: '' },
    ],
  },
  M7_HIST: {
    id: 'M7_HIST', tipo: 'VN',
    titulo: 'ATLANTIC CONVEYOR · 25 MAYO 1982', placa: 'radio', img: 'M7_HIST',
    lineas: [
      { id: 'M7_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'El carguero fue alcanzado por misiles Exocet lanzados desde Super Etendard.', en: '' },
      { id: 'M7_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Murieron 12 hombres, entre ellos su capitán, Ian North.', en: '' },
      { id: 'M7_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Con él se perdieron los helicópteros pesados Chinook. Sin ese transporte, la infantería británica cruzó la isla a pie.', en: '' },
    ],
  },
  M8_1: {
    id: 'M8_1', tipo: 'VN',
    titulo: 'LA MURALLA', placa: 'linea_amanecer', img: 'M8_1',
    lineas: [
      { id: 'M8_1_010', personaje: null, cara: null, hold: 0,
        es: 'El corazón del desembarco británico: la misión más defendida de la guerra, una muralla de fuego continua. Puma no quiere llevar al Pichón, pero necesitan todos los aviones.', en: '' },
      { id: 'M8_1_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Pichón, vos pegado a mí. No te separás ni para respirar.', en: '' },
      { id: 'M8_1_030', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 0,
        es: 'Capitán... ¿usted cree que sirvió de algo? Todo esto. ¿Vamos a ganar?', en: '' },
    ],
  },
  M8_2: {
    id: 'M8_2', tipo: 'VN',
    titulo: 'POR EL PIBE', placa: 'hangar_dia', img: 'M8_2',
    lineas: [
      { id: 'M8_2_010', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        accion: 'Suspira profundo.',
        es: 'No sé, Pichón. Pero pensá que cada vez que entramos, allá abajo hay un pibe que respira un día más. Para eso sirve. No para la bandera del mástil: para el pibe. Siempre fue por los pibes.', en: '' },
      { id: 'M8_2_020', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        accion: 'Continua pensando en los casquitos agitando los brazos contra el cielo.',
        es: '...por el pibe.', en: '' },
      // EL GESTO DEL PICHON POR ULTIMA VEZ (§9d, M9). Escucha mas de lo que se queda nunca. Y el
      // remate es la unica linea del juego que dice que el gesto NO LO SALVO — sin subrayarlo.
      { id: 'M8_2_030', personaje: null, cara: null, hold: 2.5,
        es: 'El Pichón apoya la mano en la chapa antes de subir, como siempre, y se queda escuchando más de lo que se queda nunca. Después le hace que sí con la cabeza al Turco.', en: '' },
      { id: 'M8_2_040', personaje: null, cara: null, hold: 3.5,
        es: 'El avión estaba bien. El avión estaba perfecto.', en: '' },
    ],
  },
  STORYM8_TARJETA: {
    id: 'STORYM8_TARJETA', tipo: 'TARJETA',
    titulo: 'EL PIBE', capitulo: 9,
    lineas: [
      { id: 'STORYM8_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: 'Cruzar el fuego de San Carlos · Centro logístico', en: '' },
    ],
  },
  M8_EPI: {
    id: 'M8_EPI', tipo: 'VN',
    titulo: 'LA BISAGRA', placa: 'linea_atardecer', img: 'M8_EPI',
    lineas: [
      { id: 'M8_EPI_010', personaje: null, cara: null, hold: 0,
        es: 'A la salida, con el blanco ya atrás, un misil que venía para Esteban pierde su firma, gira... y engancha al Pichón, que venía justo detrás, cubriéndole la cola.', en: '' },
      { id: 'M8_EPI_020', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 0,
        accion: 'Sorprendido, casi como un nene.',
        es: '...ah. Me dieron. ¿Capitán? Me dieron.', en: '' },
      { id: 'M8_EPI_030', personaje: null, cara: null, hold: 0,
        accion: 'Comienza la estática.',
        es: '..toda..vía.. skk..tda..skkk..quiero, no. Todavksskkk..  ', en: '' },
      { id: 'M8_EPI_040', personaje: 'GITANO', cara: 'gitano_gritando_llorando_piloto', hold: 0,
        es: '¡Era un pibe, Puma! ¡Lo trajimos a la guerra y era un PIBE!', en: '' },
      { id: 'M8_EPI_050', personaje: 'ESTEBAN', cara: 'tero_llorando_aterrado', hold: 0,
        es: 'Venía para mí. Ese fierro venía para mí y se lo comió él.', en: '' },
    ],
  },
  M8_LIBRETA: {
    id: 'M8_LIBRETA', tipo: 'VN',
    titulo: 'LA LIBRETA', placa: 'm9_libreta', img: 'M8_LIBRETA',
    lineas: [
      { id: 'M8_LIBRETA_010', personaje: null, cara: null, hold: 0,
        es: 'Esa noche el Turco junta las cosas del Pichón. Debajo del catre, una libreta de tapas de hule: hojas llenas de flechitas y anotaciones, cortes de fuselaje, cálculos al margen, aviones imposibles.', en: '' },
      { id: 'M8_LIBRETA_020', personaje: null, cara: null, hold: 0,
        es: 'Página tras página de ideas atrevidas y extraordinarias. La guarda en el bolsillo del mameluco. El otro bolsillo.', en: '' },
      // LA CUENTA QUE NADIE LE PIDIO. Es lo que convierte la libreta de recuerdo en tragedia: el
      // pibe no era un ayudante con ideas, y nadie se dio cuenta a tiempo. Ni el.
      { id: 'M8_LIBRETA_030', personaje: null, cara: null, hold: 3.5,
        es: 'Vuelve una página, la compara con lo que tienen puesto los aviones ahí nomás, y hace la cuenta que nadie le pidió: todo lo que llegaron a probar juntos es un cuarto de lo que hay acá adentro. El pibe no era un ayudante con ideas. Era un ingeniero entero, y nadie se dio cuenta a tiempo. Ni él.', en: '' },
      // EL COBRO DE LA BURRADA DE M3. El calculo va sobre EL REINGRESO —volver a meterse en el
      // propio avion en el aire—, que es imposible con paracaidas y sin paracaidas. El pibe lo
      // calculo, le dio que no, y lo guardo igual.
      { id: 'M8_LIBRETA_040', personaje: null, cara: null, hold: 3.0,
        es: 'Y en una hoja suelta, casi al final, con la letra más chica y más prolija de todas: un A-4 chiquito con la trompa apuntando al cielo, y debajo un monigote cayendo. Tres flechitas: la subida, la caída, y el reingreso.', en: '' },
      { id: 'M8_LIBRETA_050', personaje: null, cara: null, hold: 3.5,
        es: 'Al costado, la cuenta hecha en serio: velocidad de caída, velocidad del avión bajando, segundos en que los dos pasan por el mismo punto. Y abajo de todo, subrayado dos veces: «NO. Se muere.»', en: '' },
      { id: 'M8_LIBRETA_060', personaje: null, cara: null, hold: 4.0,
        es: 'El Turco se ríe una vez, corto, sin querer. Y esa risa es lo peor de toda la noche.', en: '' },
      { id: 'M8_LIBRETA_070', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        accion: 'Mira la libreta, y murmura.',
        es: 'Vos y yo tenemos trabajo, pibe.', en: '' },
    ],
  },
  M8_CARTA: {
    id: 'M8_CARTA', tipo: 'TIERRA',
    titulo: 'EL CUADERNO · CLARIBEL', placa: 'p1c_cuaderno', img: 'carta10_m9',
    lineas: [
      { id: 'M8_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Pá: repartieron cartas de escuelas, "para un soldado argentino", de pibes que no nos conocen. A mí me tocó la de una nena de nueve años, Claribel, de Villa Mercedes, San Luis.', en: '' },
      { id: 'M8_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'Me dice: "Querido soldado: no te conozco pero te quiero. Mi seño dice que estás cuidando algo nuestro. Cuidate vos también. Cuando seas viejito contame cómo era el mar de ahí."', en: '' },
      { id: 'M8_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'Lloré como un tonto, pá. Una nena que no me conoce me pidió que llegue a viejo. Le voy a contestar que sí. Es la única orden que pienso cumplir a rajatabla.', en: '' },
      { id: 'M8_CARTA_040', personaje: null, cara: null, hold: 0,
        es: 'Tengo miedo, te lo digo por primera vez. Mucho miedo. Pero no del frío ni del hambre: miedo de no verte más. Si pasa algo, quiero que sepas que no te guardo nada. Sé que moviste todo. Un padre no puede más que todo. Mateo.', en: '' },
    ],
  },
  M9_1: {
    id: 'M9_1', tipo: 'VN',
    titulo: 'TRES DONDE HUBO CINCO', placa: 'linea_amanecer', img: 'M9_1',
    lineas: [
      { id: 'M9_1_010', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Pegados, muchachos. Por el Vasco. Por el Pichón. Hoy volvemos todos. TODOS.', en: '' },
      { id: 'M9_1_020', personaje: null, cara: null, hold: 0,
        es: 'Silencio en la radio. Gitano tiene el mate en la mano y no lo ceba: se le enfría entero durante todo el briefing y nadie se lo dice.', en: '' },
      { id: 'M9_1_030', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: 'Puma. ¿Se te fue alguna vez esto de acá? (se toca el pecho)', en: '' },
      { id: 'M9_1_040', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: '(como quien informa el clima) No. Se te suma otro y otro y otro, y un día te das cuenta de que ya no te entra más, y seguís volando igual. Eso es todo el secreto, Tero. No hay más secreto que ese. Simplemente vivís con ese dolor todos los días.', en: '' },
      // EL GESTO DEL GITANO EN M11 (§9d): el mismo de M6, vaciado de comedia. Le pone nombre al
      // avion igual, pero lo dice para adentro. Y el Turco, que no lo escucho, IGUAL LO ANOTA.
      { id: 'M9_1_050', personaje: null, cara: null, hold: 3.0,
        es: 'Subiendo, el Gitano dice el nombre del día. Pero lo dice para adentro, sin señalarle nada a nadie, y el Turco no llega a escucharlo. Igual lo anota.', en: '' },
    ],
  },
  STORYM9_TARJETA: {
    id: 'STORYM9_TARJETA', tipo: 'TARJETA',
    titulo: 'LO QUE NO SE DICE', capitulo: 11,
    lineas: [
      { id: 'STORYM9_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '8 de junio de 1982 · RFA SIR GALAHAD', en: '' },
    ],
  },
  M9_EPI: {
    id: 'M9_EPI', tipo: 'VN',
    titulo: 'VUELVEN LOS TRES', placa: 'hangar_noche', img: 'M9_EPI',
    lineas: [
      { id: 'M9_EPI_010', personaje: null, cara: null, hold: 0,
        es: 'Cumplís. Volvés. Vuelven los tres. Una victoria limpia justo cuando ya no confiabas en ninguna.', en: '' },
      { id: 'M9_EPI_020', personaje: null, cara: null, hold: 0,
        es: 'El Turco pinta tres estrellitas. Al terminar se queda quieto un segundo y se toca el bolsillo del mameluco — ese gesto que viene haciendo desde la noche del Vasco y que nadie le pregunta.', en: '' },
    ],
  },
  M9_CARTA: {
    id: 'M9_CARTA', tipo: 'TIERRA',
    titulo: 'EL CUADERNO', placa: 'p1c_cuaderno', img: 'carta12_m11',
    lineas: [
      { id: 'M9_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Viejo: nos mueven a los montes que rodean Puerto Argentino. Dicen que los ingleses vienen por tierra. El Colorado no se me despega: "vos y yo salimos juntos de acá, correntino de adopción".', en: '' },
      { id: 'M9_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'Anoche me contó todo el plan: llegamos, comemos un asado en tu casa, después nos tomamos el micro a Corrientes y me presenta a la hermana. Lo tiene pensado hasta el detalle del micro, pá.', en: '' },
      { id: 'M9_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'Qué manía la de este tipo de planear cosas lindas en el peor lugar del mundo.', en: '' },
      { id: 'M9_CARTA_040', personaje: null, cara: null, hold: 0,
        es: 'A mamá seguile diciendo que comemos bien. Yo sé que lo hacés. Gracias. Mateo.', en: '' },
    ],
  },
  M9_HIST: {
    id: 'M9_HIST', tipo: 'VN',
    titulo: 'RFA SIR GALAHAD · 8 JUNIO 1982', placa: 'radio', img: 'M9_HIST',
    lineas: [
      { id: 'M9_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'Skyhawks argentinos atacaron el buque logístico fondeado en Bahía Agradable, cargado de tropa.', en: '' },
      { id: 'M9_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Murieron 48 personas entre tripulantes y soldados. Fue la mayor pérdida de vidas británicas en una sola acción durante el conflicto.', en: '' },
      { id: 'M9_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'El casco fue hundido mar afuera y declarado cementerio de guerra.', en: '' },
    ],
  },
  M10_1: {
    id: 'M10_1', tipo: 'VN',
    titulo: 'SEGUNDA SALIDA', placa: 'pista_lluvia', img: 'M10_1',
    lineas: [
      { id: 'M10_1_010', personaje: null, cara: null, hold: 0,
        es: 'Misma tarde. El segundo buque de Fitzroy. Briefing de treinta segundos: ya no hay nada que decir que no se haya dicho.', en: '' },
      { id: 'M10_1_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Otra vez. Ahora.', en: '' },
      { id: 'M10_1_030', personaje: null, cara: null, hold: 0,
        es: 'Nada más. Se suben.', en: '' },
    ],
  },
  STORYM10_TARJETA: {
    id: 'STORYM10_TARJETA', tipo: 'TARJETA',
    titulo: 'ÁNGEL DE CORRIENTES', capitulo: 12,
    lineas: [
      { id: 'STORYM10_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '8 de junio de 1982 · RFA SIR TRISTRAM', en: '' },
    ],
  },
  M10_TIERRA: {
    id: 'M10_TIERRA', tipo: 'VN',
    titulo: 'EN EL MONTE, MIENTRAS VOLABAS', placa: 'final_monte', img: 'M10_TIERRA',
    lineas: [
      { id: 'M10_TIERRA_010', personaje: null, cara: null, hold: 0,
        es: 'El monte. Bombardeo naval. Mateo y Correa en el mismo pozo. Un silbido que crece.', en: '' },
      { id: 'M10_TIERRA_020', personaje: 'CORREA', cara: 'colorado_neutro', hold: 0,
        es: '¡Abajo, Mateo! ¡ABAJO!', en: '' },
      { id: 'M10_TIERRA_030', personaje: null, cara: null, hold: 0,
        es: 'Correa empuja a Mateo al fondo del pozo y le pone el cuerpo encima. Blanco. Humo. Tierra que llueve. Mateo abajo, entero. Correa arriba, no.', en: '' },
      { id: 'M10_TIERRA_040', personaje: 'MATEO', cara: 'mateo_roto', hold: 1.5,
        es: '¡Colorado! ¡No, no, no! ¡Dijiste que salíamos juntos! ¡DIJISTE QUE SALÍAMOS JUNTOS!', en: '' },
      // HABLA DANDO POR HECHO QUE MATEO SOBREVIVE, y eso es lo que parte al medio. Por eso va
      // partida: primero el «vos salis seguro» y el silencio, y recien despues el encargo.
      { id: 'M10_TIERRA_050', personaje: 'CORREA', cara: 'colorado_roto', hold: 3.0,
        accion: 'Apenas, buscándole la mano. Se la aprieta.',
        es: '…Vos salís, chamigo. Vos salís seguro.', en: '' },
      { id: 'M10_TIERRA_060', personaje: 'CORREA', cara: 'colorado_roto', hold: 1.5,
        es: 'Escuchame que es importante. Cuando la veas a la Teresa, decile que la quiero. Y llevale jazmines. Le gustan los jazmines. Regalale jazmines la primera vez.', en: '' },
      { id: 'M10_TIERRA_070', personaje: 'CORREA', cara: 'colorado_roto', hold: 4.0,
        accion: 'Casi sonriendo.',
        es: '…Vas a quedar como un señor, angá. Vos… vos me la vas a cuidar como yo te—', en: '' },
      // EL INVENTARIO. Cobra el cuero de oveja de la carta 2, mete la foto de Teresa DENTRO del
      // cuaderno —que es lo que despues llega en la encomienda— y planta la navaja del final.
      { id: 'M10_TIERRA_080', personaje: null, cara: null, hold: 4.0,
        es: 'Un cuadro quieto: la mochila del Colorado volcada. La foto gastada de la hermana. El mate. Todo el inventario de un hombre bueno. Y sobre los hombros de Mateo, el cuero de oveja que le dio en abril, tapándolo hasta el final.', en: '' },
      { id: 'M10_TIERRA_090', personaje: null, cara: null, hold: 3.5,
        es: 'Mateo, con la mano que le queda libre, saca la foto de la mochila y se la guarda en el cuaderno. Donde van las cosas que hay que devolver en persona.', en: '' },
    ],
  },
  M10_PISTA: {
    id: 'M10_PISTA', tipo: 'VN',
    titulo: 'LO QUE NO SABE', placa: 'pista_lluvia', img: 'M10_PISTA',
    lineas: [
      { id: 'M10_PISTA_010', personaje: null, cara: null, hold: 1.5,
        es: 'Esteban vuelve sin saber nada. En la pista, el Turco le comenta al pasar, sin darle importancia.', en: '' },
      { id: 'M10_PISTA_020', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 1.0,
        es: 'Abajo los están moliendo a bombardeo naval, m\'hijo. Los montes. Anoche y hoy.', en: '' },
      // EL MAPA: lo tiene subrayado desde M8 y nadie sabe por que. Esteban no contesta — y esa es
      // toda la escena. Se planta aca y se cobra en M14, cuando la coordenada del parte de Condor
      // es la misma que su dedo esta tocando.
      { id: 'M10_PISTA_030', personaje: null, cara: null, hold: 3.0,
        es: 'Esteban mira el mapa de la pared, el punto que tiene subrayado hace semanas. No dice nada.', en: '' },
      { id: 'M10_PISTA_040', personaje: null, cara: null, hold: 0,
        es: 'Vos sí sabés por qué. Y no podés avisarle.', en: '' },
    ],
  },
  M10_CARTA: {
    id: 'M10_CARTA', tipo: 'TIERRA',
    titulo: 'LA QUE CASI NO PUEDE ESCRIBIR', placa: 'p1c_cuaderno', img: 'carta13_m12',
    lineas: [
      { id: 'M10_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Viejo: se me murió el Colorado. Me tapó con el cuerpo. Estoy vivo porque él ya no.', en: '' },
      { id: 'M10_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'Ahora entiendo algo horrible, pá. Todo este tiempo yo estuve protegido y no lo sabía del todo. El Colorado era mi techo. Acá siempre hubo dos clases de conscripto: los que tienen un ángel y los que no. Yo tuve el mejor. Se me murió el ángel, viejo.', en: '' },
      { id: 'M10_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'Hoy agarré su navaja —la del abuelo, la que me regaló— y tallé en la viga del pozo, bien grande, para que lo lea cualquiera que caiga en este agujero después de nosotros: VAMOS A VOLVER. LOS PIBES DE MALVINAS.', en: '' },
      { id: 'M10_CARTA_040', personaje: null, cara: null, hold: 0,
        es: 'Me salió torcido y me importa nada. Lo tallé con la navaja de un correntino que cumplió. Que quede acá clavado aunque nosotros no quedemos.', en: '' },
      { id: 'M10_CARTA_050', personaje: null, cara: null, hold: 0,
        es: 'Necesito salir de acá, pa. No aguanto más. Estoy solo. Me quiero ir a casa, pa. Me quiero ir a casa. Mateo.', en: '' },
    ],
  },
  M10_HIST: {
    id: 'M10_HIST', tipo: 'VN',
    titulo: 'RFA SIR TRISTRAM · 8 JUNIO 1982', placa: 'radio', img: 'M10_HIST',
    lineas: [
      { id: 'M10_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'El buque logístico fue alcanzado por bombas en Fitzroy, en el mismo ataque que castigó al Sir Galahad.', en: '' },
      { id: 'M10_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Murieron 2 tripulantes. El buque quedó fuera de combate.', en: '' },
      { id: 'M10_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Aquel 8 de junio fue uno de los días más duros del conflicto, para los dos lados.', en: '' },
    ],
  },
  M11_1: {
    id: 'M11_1', tipo: 'VN',
    titulo: 'APOYO A LOS MONTES', placa: 'linea_amanecer', img: 'M11_1',
    lineas: [
      { id: 'M11_1_010', personaje: null, cara: null, hold: 0,
        es: 'La superioridad tecnológica ya inclinó la guerra. De noche, las fragatas se acercan a la costa a martillar las posiciones argentinas antes de cada asalto. Por primera vez, los Fieles van a volar sobre las cabezas de los suyos.', en: '' },
      { id: 'M11_1_020', personaje: null, cara: null, hold: 0,
        es: 'Y llega el dato que arma el final: el regimiento de Mateo quedó en primera línea, bajo ese bombardeo naval.', en: '' },
    ],
  },
  M11_2: {
    id: 'M11_2', tipo: 'VN',
    titulo: 'PEDIME QUE LLEGUE', placa: 'cabina_dia', img: 'M11_2',
    lineas: [
      { id: 'M11_2_010', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: 'Puma. Mi hijo está en ese monte, y le están tirando desde el mar con todo lo que tienen. Si nadie calla esos cañones esta noche, a la madrugada no hay monte.', en: '' },
      { id: 'M11_2_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Es un viaje de ida, Tero. Esa flota tiene encima toda la defensa antiaérea que les queda. Y la Chancha está rota desde la noche del cordobés: vuela corto, no llega al sur. Sin Chancha no hay nafta de vuelta. ¿Entendés lo que te digo? No hay vuelta... asegurada.', en: '' },
      { id: 'M11_2_030', personaje: 'PUMA', cara: 'puma_neutro', hold: 2.0,
        es: 'Hay vuelta si sale todo perfecto. Nunca sale todo perfecto.', en: '' },
      { id: 'M11_2_040', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: 'Entonces no me pidas que vuelva. Pedime que llegue.', en: '' },
      // POR UNICA VEZ LA TONADA NO TRAE CHISTE, TRAE FUEGO. Y cobra la Chancha de M6: se rompio
      // por el, y el lo sabe mejor que nadie.
      { id: 'M11_2_050', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        accion: 'Se para. Por única vez la tonada no trae chiste.',
        es: '¿Solo? ¿Vos estás en pedo, culiao? Seis veces me trajiste vivo a casa. SEIS. Y la Chancha se rompió por traerme a MÍ. Hoy te toca cobrar. Hoy el cielo te lo abrimos nosotros, aunque haya que empujar los misiles con la mano.', en: '' },
      { id: 'M11_2_060', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        accion: 'Los mira. Mira la foto del Vasco y la gorra del Pichón colgadas en la pared. Sonríe por primera vez en tres misiones.',
        es: '...Plata Fiel completa, entonces. Una vez más. La última.', en: '' },
    ],
  },
  STORYM11_TARJETA: {
    id: 'STORYM11_TARJETA', tipo: 'TARJETA',
    titulo: 'LA CENA', capitulo: 13,
    lineas: [
      { id: 'STORYM11_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '11 de junio de 1982 · HMS BROADSWORD', en: '' },
    ],
  },
  M11_ASADO1: {
    id: 'M11_ASADO1', tipo: 'VN',
    titulo: 'EL ÚLTIMO ASADO', placa: 'fogon', img: 'M11_ASADO1',
    lineas: [
      // EL GESTO DEL TURCO (§9d, M13). Les habla bajito a los aviones, como a caballos antes de la
      // tormenta. NO LO CUENTA: se va al fuego y no dice nada. Es la ultima vez que los tres estan
      // enteros, y el unico que lo sabe es el.
      { id: 'M11_ASADO1_010', personaje: null, cara: null, hold: 3.0,
        es: 'Antes de sentarse, el Turco pasa por la línea de vuelo. Los tres aviones están cargados y quietos bajo la luna. Les pasa la mano por el ala, de uno en uno, y a cada uno le dice algo bajito. Después se va al fuego y no lo cuenta.', en: '' },
      { id: 'M11_ASADO1_020', personaje: null, cara: null, hold: 0,
        es: 'Detrás del hangar, un medio tambor con brasas. El Turco consiguió carne, nadie pregunta cómo. Gitano canta bajito una zamba, desafinando con dignidad.', en: '' },
      { id: 'M11_ASADO1_030', personaje: null, cara: null, hold: 0,
        es: 'Sobre la mesa, contra la damajuana, la foto de la vieja del Vasco. Al lado, la libreta del Pichón. Los que no están en la mesa, en la mesa.', en: '' },
      // LA FECHA IMPORTA: el asado es el 11 y el debut fue el 13. «Mañana» era un error de hecho.
      // Y la linea de Puma en el medio deja respirar el remate.
      { id: 'M11_ASADO1_040', personaje: 'GITANO', cara: 'gitano_neutro', hold: 1.0,
        es: 'Che, ¿saben que pasado mañana debuta Argentina en el Mundial? En España. Contra Bélgica.', en: '' },
      { id: 'M11_ASADO1_050', personaje: 'PUMA', cara: 'puma_neutro', hold: 1.5,
        accion: 'Mirando el fuego.',
        es: 'Mirá vos. Argentina juega.', en: '' },
      { id: 'M11_ASADO1_060', personaje: 'GITANO', cara: 'gitano_neutro', hold: 3.0,
        es: 'Acá también juega Argentina. Todos los días. Pero estos partidos no los pasan por la tele.', en: '' },
      // EL COBRO DE M2. Alla el Gitano dijo THANK YOU y explico por que: «si digo gracias me sacan
      // de la ronda, y yo de la ronda no me voy». Era una promesa. Acá la rompe, en castellano, sin
      // levantarse, la noche antes de la ultima mision.
      //
      // NADIE SE LO HACE NOTAR, y eso es todo el peso de la escena: los tres en esa mesa saben
      // exactamente que acaba de decir, y ninguno tiene ganas de decirlo en voz alta. Es el puente
      // a la unica vez que el Gitano habla en serio, que es la escena siguiente.
      { id: 'M11_ASADO1_070', personaje: null, cara: null, hold: 1.5,
        es: 'El Turco ceba y le alcanza el mate al Gitano.', en: '' },
      { id: 'M11_ASADO1_080', personaje: 'GITANO', cara: 'gitano_neutro', hold: 3.0,
        accion: 'Lo agarra con una sola mano, sin levantarse.',
        es: 'Gracias.', en: '' },
      { id: 'M11_ASADO1_090', personaje: null, cara: null, hold: 4.0,
        es: 'Lo dijo en castellano. El Turco no levanta la vista del fuego. Nadie corrige nada, nadie se lo hace notar. El mate sigue la ronda, y la próxima vez le pasa por al lado y él ni lo mira.', en: '' },
    ],
  },
  M11_ASADO2: {
    id: 'M11_ASADO2', tipo: 'VN',
    titulo: 'LA ÚNICA VEZ QUE EL GITANO HABLA EN SERIO', placa: 'fogon', img: 'M11_ASADO2',
    lineas: [
      // LA UNICA VEZ QUE EL GITANO HABLA EN SERIO. Va en tres tiempos con el mate en el medio, no
      // en un bloque: el silencio entre una y otra es lo que la hace confesion y no discurso.
      { id: 'M11_ASADO2_010', personaje: 'GITANO', cara: 'gitano_neutro', hold: 2.5,
        es: 'El "perdoname" del Vasco no me lo puedo sacar. Yo sé lo que es tener algo que pedirle perdón a la vieja de uno.', en: '' },
      { id: 'M11_ASADO2_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 2.0,
        accion: 'Ceba y pasa el mate.',
        es: 'Mi viejo pegaba. Fuerte... Seguido... A todos... Yo me crié adivinando de qué humor venía por cómo sonaba la puerta al llegar.', en: '' },
      { id: 'M11_ASADO2_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 3.0,
        accion: 'Mira el fuego.',
        es: 'Y un día decidí que yo iba a ser exactamente lo contrario de eso. Todo lo contrario, todo el tiempo, aunque me costara. Así que no, muchachos: no soy gracioso. Soy lo contrario de mi viejo. Es distinto. Cuesta más.', en: '' },
      { id: 'M11_ASADO2_040', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 2.0,
        accion: 'Después de un rato largo.',
        es: 'Te salió bien, cordobés.', en: '' },
      { id: 'M11_ASADO2_050', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 1.5,
        accion: 'La sonrisa volviendo.',
        es: 'Bueno, basta que me emociono.', en: '' },
      { id: 'M11_ASADO2_060', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: '(mirando la foto) ¿Me la prestás mañana? Que la vieja vuele una vez con la escuadrilla del hijo.', en: '' },
      { id: 'M11_ASADO2_070', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        es: '(alzando el vaso de vino en tetra) Por los que no están en la mesa.', en: '' },
      { id: 'M11_ASADO2_080', personaje: 'TODOS', cara: null, hold: 0,
        es: 'Por los que no están.', en: '' },
    ],
  },
  M11_CARTA: {
    id: 'M11_CARTA', tipo: 'TIERRA',
    titulo: 'LA ÚLTIMA PÁGINA', placa: 'p1c_cuaderno',
    lineas: [
      { id: 'M11_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Viejo: ya casi no queda nada acá. Te escribo igual, porque escribirte es la única costumbre buena que me queda. Aunque nunca lo leas. Aunque te lo lea yo cuando vuelva.', en: '' },
      { id: 'M11_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'Quedamos los pibes solos, cuidándonos entre nosotros. Nos tapamos, nos repartimos, nos aguantamos. En el peor lugar del mundo todavía hay pibes tapando a otros pibes. Eso también es la Patria, pá. Eso, y no los discursos.', en: '' },
      { id: 'M11_CARTA_030', personaje: null, cara: null, hold: 0,
        es: '¿Sabés qué me sostiene? La página del cuaderno del día que batiste las alas. Cuando pega el miedo la abro y me digo: mi viejo me vio. No estoy solo ni aunque esté solo.', en: '' },
    ],
  },
  M11_CARTA2: {
    id: 'M11_CARTA2', tipo: 'TIERRA',
    titulo: 'LA ÚLTIMA PÁGINA · II', placa: 'p1c_cuaderno', img: 'carta14_m13',
    lineas: [
      { id: 'M11_CARTA2_010', personaje: null, cara: null, hold: 0,
        es: 'Si no nos vemos: gracias por el cielo. Por el sapito, por el Rastrojero, por enseñarme a mirar para arriba. Si escucho un motor bien bajo, bien rasante, voy a saber que sos vos, y voy a estar tranquilo.', en: '' },
      { id: 'M11_CARTA2_020', personaje: null, cara: null, hold: 0,
        es: 'Cuidámela a mamá. Y perdón por las mentiras del guiso, pero decíselas igual.', en: '' },
      { id: 'M11_CARTA2_030', personaje: null, cara: null, hold: 0,
        es: 'Ser valiente no es no tener miedo, pá. Es escribirte igual, con la mano temblando.', en: '' },
      { id: 'M11_CARTA2_040', personaje: null, cara: null, hold: 0,
        es: 'Te quiero, viejo. Volá bajo. Mateo.', en: '' },
    ],
  },
  M12_1: {
    id: 'M12_1', tipo: 'VN',
    titulo: 'DENEGADA', placa: 'radio', img: 'M12_1',
    lineas: [
      { id: 'M12_1_010', personaje: 'CÓNDOR', cara: 'condor_reposo', hold: 0,
        es: 'Plata Fiel, la misión está DENEGADA. No hay indicativo asignado. Sin reabastecedor no hay margen de combustible para el regreso. Repito: DENEGADA.', en: '' },
      { id: 'M12_1_020', personaje: null, cara: null, hold: 0,
        es: 'Todas las misiones tuvieron su pájaro de código: Cauquén, Chimango, Hornero, Chajá. Esta noche el comando no asigna ninguno. Esta noche no los manda nadie: vuelan con el nombre propio.', en: '' },
      { id: 'M12_1_030', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: '(apaga la radio con dos dedos, tranquilo) Que me perdone el abuelo.', en: '' },
    ],
  },
  M12_2: {
    id: 'M12_2', tipo: 'VN',
    titulo: 'EL PAGO DEL APODO', placa: 'linea_amanecer', img: 'M12_2',
    lineas: [
      { id: 'M12_2_010', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: '¿Sabés por qué te pusieron Tero? El tero grita lejos del nido. Se hace el herido, arma escándalo, se ofrece al zorro para que el zorro lo corra a él. Da la vida distrayendo, y el nido queda a salvo.', en: '' },
      { id: 'M12_2_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Esta noche los teros somos nosotros: gritamos, brillamos, hacemos el escándalo. Vos pasás por abajo, calladito, y llegás al nido. ¿Estamos?', en: '' },
      { id: 'M12_2_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '(la última sonrisa) Escuchame, Tero: llegá. Por el Vasco, por el Pichón, por todos los que no llegamos a nada: LLEGÁ.', en: '' },
      { id: 'M12_2_040', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        es: '(le mete el pincel de las estrellitas en el bolsillo del traje) Me lo devolvés mañana. ¿Me oíste? Me lo trae usted personalmente, Primer Teniente, o lo voy a buscar yo a nado.', en: '' },
    ],
  },
  STORYM12_TARJETA: {
    id: 'STORYM12_TARJETA', tipo: 'TARJETA',
    titulo: 'EL TERO', capitulo: 14,
    lineas: [
      { id: 'STORYM12_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: 'Madrugada del 12 de junio · HMS GLAMORGAN', en: '' },
    ],
  },
  M12_GITANO: {
    id: 'M12_GITANO', tipo: 'VN',
    titulo: 'PRIMER TERO', placa: 'cabina_noche', img: 'M12_GITANO',
    lineas: [
      { id: 'M12_GITANO_010', personaje: null, cara: null, hold: 0,
        es: 'Un enjambre de misiles se cierra sobre la formación. Gitano rompe hacia arriba, enciende todo lo que se puede encender, se vuelve el blanco más luminoso del cielo.', en: '' },
      { id: 'M12_GITANO_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '¡Acá estoy, ingleses! ¡Miren qué lindo brillo cordobés! ¡Vengan todos que hay para todos! ¡TERO, ANDÁ! ¡Viva la Patria... la de los pibes, carajo, la de los pibes—!', en: '' },
    ],
  },
  M12_PUMA: {
    id: 'M12_PUMA', tipo: 'VN',
    titulo: 'SEGUNDO TERO', placa: 'cabina_noche', img: 'M12_PUMA',
    lineas: [
      { id: 'M12_PUMA_010', personaje: null, cara: null, hold: 0,
        es: 'Queda la última línea antiaérea, la que no se puede cruzar y disparar a la vez. Puma se adelanta, se mete de frente en el fuego, y apaga las baterías con el único fierro que le queda: su propio avión.', en: '' },
      { id: 'M12_PUMA_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Plata Fiel... misión cumplida. Tero: era verdad lo que dijo el Pichón. No es la bandera. Nunca fue la bandera. Es el pibe. Andá a buscar a tu pibe.', en: '' },
      { id: 'M12_PUMA_030', personaje: null, cara: null, hold: 0,
        es: 'Quedás solo en el cielo negro. Delante, la costa. El Glamorgan escupiendo fuego. Y detrás del fuego, el monte.', en: '' },
    ],
  },
  M12_TARDE: {
    id: 'M12_TARDE', tipo: 'VN',
    titulo: 'LLEGAR TARDE', placa: 'final_monte', img: 'M12_TARDE',
    lineas: [
      { id: 'M12_TARDE_010', personaje: null, cara: null, hold: 0,
        es: 'Rompés la última defensa. Tenés el blanco adelante. Vas a llegar. Estás llegando. Llegás.', en: '' },
      { id: 'M12_TARDE_020', personaje: null, cara: null, hold: 0,
        es: 'Y entonces, antes de que sueltes, el monte recibe la salva completa. El lugar donde está Mateo estalla en una sola luz blanca. Y se apaga.', en: '' },
      { id: 'M12_TARDE_030', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: '(un susurro) ...llegué. Llegué, hijo. Estoy acá arriba. Mirame. Estoy volando bajo. Mirame como aquella vez. MIRAME, MATEO.', en: '' },
      { id: 'M12_TARDE_040', personaje: null, cara: null, hold: 0,
        es: 'Ninguna respuesta de tierra. Nunca más una respuesta de tierra.', en: '' },
    ],
  },
  M12_FINAL: {
    id: 'M12_FINAL', tipo: 'VN',
    titulo: 'EL COMBUSTIBLE JUSTO', placa: 'linea_noche', img: 'M12_FINAL',
    lineas: [
      { id: 'M12_FINAL_010', personaje: 'CÓNDOR', cara: 'condor_reposo', hold: 0,
        es: '(casi con lástima) Tero... está en reserva. Si sale AHORA, llega. Repito: si quiere volver, es ahora.', en: '' },
      { id: 'M12_FINAL_020', personaje: null, cara: null, hold: 2.0,
        es: 'Sobre el sector humeante aparece la última oleada. De frente. El mar abierto queda a la izquierda, y el HUD marca la ruta a casa.', en: '' },
      // LA DECISION, SIN MENU (GUION_3 nota 7). No hay cartel, no hay opciones en pantalla y no hay
      // final correcto: lo que el jugador haga con el timon ES la decision. Por eso la escena
      // TERMINA ACA, sin remate: el narrador se calla y no vuelve hasta el epilogo que toque.
    ],
  },
  EPI_MESA1: {
    id: 'EPI_MESA1', tipo: 'VN',
    titulo: 'LOS DOS PLATOS', placa: 'cocina_gris', img: 'EPI_MESA1',
    lineas: [
      { id: 'EPI_MESA1_010', personaje: null, cara: null, hold: 0,
        es: 'La cocina del principio. Golpean la puerta: un uniformado, dos telegramas. Norma los deja sobre la mesa, uno al lado del otro, como dos cubiertos.', en: '' },
      { id: 'EPI_MESA1_020', personaje: null, cara: null, hold: 0,
        es: 'Pone la pava. Sirve la mesa para dos. Se sienta. Espera. La pava chifla y esta vez tampoco nadie la saca.', en: '' },
      { id: 'EPI_MESA1_030', personaje: null, cara: null, hold: 0,
        es: 'El 13 de junio, el país miró el debut de Argentina en el Mundial de España. El 14, la guerra terminó. Los televisores estaban prendidos en otra cosa.', en: '' },
    ],
  },
  // ---------- FINAL A · QUEDARSE ----------
  // Esteban vira hacia la oleada y lo bajan sobre el nido. MUERE SIN SABER si Mateo lo vio: el
  // jugador tiene la respuesta —la leyo en el cuaderno, en M8— y no puede darsela. Esa es la
  // asimetria del juego entero, y aca se cobra por ultima vez.
  EPI_A1: {
    id: 'EPI_A1', tipo: 'VN', titulo: 'EL LOCKER DE ESTEBAN', placa: 'm13_carta_locker',
    lineas: [
      { id: 'EPI_A1_010', personaje: null, cara: null, hold: 2.5,
        es: 'La base, vacía. El locker de Esteban abierto, y el Turco con la cara de piedra sacando las cosas de a una.', en: '' },
      { id: 'EPI_A1_020', personaje: null, cara: null, hold: 3.0,
        es: 'Contra la pared del fondo, parada, hay una carta. En el frente, escrito con la letra apretada de un tipo que no escribe nunca, un solo nombre: Norma.', en: '' },
    ],
  },
  // LA UNICA CARTA DEL JUEGO. Esteban no le escribe a Mateo nunca — le escribe a Norma, una sola
  // vez, POR LAS DUDAS, la noche del asado y sin saber que al otro dia hay salida. El jugador la
  // ve escribir en M13 y no la puede leer. Recien la lee acá, y solo en este final.
  EPI_A2: {
    id: 'EPI_A2', tipo: 'CARTA', titulo: 'NORMA', placa: 'p3b_papeles',
    lineas: [
      { id: 'EPI_A2_010', personaje: null, cara: null, hold: 1.5,
        es: 'Norma: si estás leyendo esto es porque el Turco cumplió, así que primero: no te enojes con él, que él sólo cumple.', en: '' },
      { id: 'EPI_A2_020', personaje: null, cara: null, hold: 1.5,
        es: 'No pasó nada, quedate tranquila. Te escribo por las dudas, nada más. Acá ya despedimos a varios amigos y aprendí que el momento de uno no avisa.', en: '' },
      { id: 'EPI_A2_030', personaje: null, cara: null, hold: 2.0,
        es: 'Hace unos días un pibe de veintidós años se comió un fierro que venía para mí: si estoy escribiendo esta carta, es gracias a él. Y si vos la estás leyendo… quiere decir que a mí también me llegó. Quiero que sepas que la peleé hasta el final para volver.', en: '' },
      { id: 'EPI_A2_040', personaje: null, cara: null, hold: 2.0,
        es: 'Al nene no lo pude sacar de esto con mis contactos. Lo cuido desde el aire, que es el único idioma que hablo bien. Vos siempre decís que no sé decir las cosas, que todo lo digo arreglando el Rastrojero o cebando mate. Tenés razón. Por eso esta carta es corta.', en: '' },
      { id: 'EPI_A2_050', personaje: null, cara: null, hold: 2.5,
        es: 'Te elegí a los veinte y te volvería a elegir ahora mismo, en esta pista helada, con el casco puesto. Al pibe lo hicimos bien, Norma. Lo hicimos tan bien que se puso la patria al hombro sin que nadie le enseñe. Eso es tuyo. Lo mejor de él es gracias a vos.', en: '' },
      { id: 'EPI_A2_060', personaje: null, cara: null, hold: 3.5,
        es: 'Viví, amor. No vivas en pausa. No te quedes de guardia en esa ventana esperando. Vos me enseñaste todo lo que sé de amar a alguien. Viví por los tres. Y cuando pase un avión volando bajo, miralo con ese orgullo tuyo que asusta. Somos nosotros, yendo a verte. Esteban.', en: '' },
    ],
  },
  // LA MESA. Norma pone los dos papeles enfrentados como dos cubiertos, y abre el cuaderno en la
  // primera pagina: el mismo dibujo con el que abrio el juego. Sostener el plano. Ella es la unica
  // que los lee a los dos — Esteban no leyo el cuaderno, y Mateo no leyo la carta.
  EPI_A3: {
    id: 'EPI_A3', tipo: 'VN', titulo: 'LOS DOS PAPELES', placa: 'mesa_dos_papeles',
    lineas: [
      { id: 'EPI_A3_010', personaje: null, cara: null, hold: 2.5,
        es: 'Años después, golpean una puerta. Una cocina en penumbra. Norma —más canas— firma y recibe un paquete del Ejército, pesado como un chico dormido. Adentro, el cuaderno Rivadavia hinchado de humedad.', en: '' },
      { id: 'EPI_A3_020', personaje: null, cara: null, hold: 2.0,
        es: 'Va al aparador y trae la carta, blanda de tanto doblarse, la que llegó hace años. Pone los dos papeles uno frente al otro, derechitos, como dos cubiertos.', en: '' },
      { id: 'EPI_A3_030', personaje: null, cara: null, hold: 4.0,
        es: 'Abre el cuaderno en la primera página: un arroyo, un Rastrojero, un padre y un nene tirando piedritas.', en: '' },
      // ACA NO VA NINGUNA LINEA MAS. GUION_3: «Sostener el plano. El jugador hace el resto solo».
      // Esteban murio sin saber si el pibe lo vio; la respuesta esta en una de esas hojas y el ya
      // no puede darla vuelta. Decirlo lo arruina.
    ],
  },

  // ---------- FINAL B · VOLVER (el oculto) ----------
  // Esteban vira al mar y llega. Y es el UNICO camino en el que alguna vez se entera: el cuaderno
  // le llega a el, y la respuesta se la da el Turco leyendo en voz alta, decadas tarde.
  EPI_B1: {
    id: 'EPI_B1', tipo: 'VN', titulo: 'LA MISMA COCINA', placa: 'cocina_calida',
    lineas: [
      { id: 'EPI_B1_010', personaje: null, cara: null, hold: 2.5,
        es: 'Años después. La misma cocina. Golpean la puerta con la encomienda y esta vez abre Esteban: más viejo, más flaco, la mano que firma temblando apenas.', en: '' },
      { id: 'EPI_B1_020', personaje: null, cara: null, hold: 2.0,
        es: 'La mesa. El cuaderno. Lo abre en la primera página: el arroyo, el Rastrojero, el sapito. Y ahí se queda, con la mano apoyada en la hoja, sin animarse a pasarla.', en: '' },
      { id: 'EPI_B1_030', personaje: 'ESTEBAN', cara: 'tero_roto', hold: 3.0,
        accion: 'Lo cierra despacio.',
        es: '…No sé si estoy preparado hoy para ver esto.', en: '' },
    ],
  },
  EPI_B2: {
    id: 'EPI_B2', tipo: 'VN', titulo: 'EL MATE', placa: 'cocina_calida',
    lineas: [
      { id: 'EPI_B2_010', personaje: null, cara: null, hold: 2.5,
        es: 'El Turco no contesta. Estira la mano, agarra el cuaderno como quien recibe una pieza delicada, y lo hojea él: el Colorado con capa, el barco chueco, la radio sola en el pozo, el sol de Claribel, la página del monte con el avión batiendo las alas.', en: '' },
      { id: 'EPI_B2_020', personaje: null, cara: null, hold: 2.5,
        es: 'Viejo, de civil, la gorra en la rodilla, ceba. Norma les deja la pava llena, apoya un plato de bizcochitos y sale al patio. Se la ve por la ventana, de espaldas, quieta, mirando el jazminero. Ella ya lloró lo suyo. Esto es de ellos.', en: '' },
      { id: 'EPI_B2_030', personaje: 'EL TURCO', cara: 'turco_sonrisa', hold: 1.5,
        accion: 'Le alcanza el mate sin dejar de hojear.',
        es: '…El pibe dibujaba bien, ¿eh?', en: '' },
      { id: 'EPI_B2_040', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 3.5,
        es: 'Mejor que yo para todo.', en: '' },
      // la pausa larga del guion ES la linea: sin ella, la pregunta suena a conversacion.
      { id: 'EPI_B2_050', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 3.0,
        es: '¿Sabés que nunca supe si me vio? Ese día. Nunca supe.', en: '' },
      { id: 'EPI_B2_060', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 3.0,
        accion: 'Ceba, tranquilo.',
        es: '…¿Y eso qué importa, m\'hijo? Vos lo viste a él. Con eso alcanza para toda una vida.', en: '' },
      { id: 'EPI_B2_070', personaje: null, cara: null, hold: 3.0,
        es: 'Esteban asiente. Toma el mate. Afuera, el jazminero. Sobre la mesa, la navaja del Colorado, que vino en la encomienda, apoyada contra la azucarera.', en: '' },
    ],
  },
  // EL COBRO DE TODO. La pagina del monte (M8) vuelve por ultima vez, y la contesta el Turco
  // leyendo en voz alta. Es la UNICA vez en los dos finales en que Esteban se entera.
  EPI_B3: {
    id: 'EPI_B3', tipo: 'VN', titulo: 'ACÁ DICE QUE TE VIO', placa: 'cocina_calida',
    lineas: [
      { id: 'EPI_B3_010', personaje: null, cara: null, hold: 3.0,
        es: 'Y entonces el Turco se frena en una página. La lee. La vuelve a leer.', en: '' },
      { id: 'EPI_B3_020', personaje: 'EL TURCO', cara: 'turco_orgullo', hold: 2.5,
        accion: 'La voz cambiada. Da vuelta el cuaderno para que lo vea.',
        es: '…M\'hijo. Acá dice que te vio.', en: '' },
      { id: 'EPI_B3_030', personaje: 'ESTEBAN', cara: 'tero_roto', hold: 3.5,
        accion: 'Se le llenan los ojos.',
        es: '¿Me vio?… ¡Me vio! ¡NORMA! ¡Mateo ese día me vio!', en: '' },
      { id: 'EPI_B3_040', personaje: null, cara: null, hold: 4.0,
        es: 'Sin cartel. El mate quieto, el cuaderno abierto en la página del cielo. El Turco mira a Esteban abrazar a Norma, que entró corriendo secándose las manos. La cámara se aleja.', en: '' },
    ],
  },
  M12_HIST: {
    id: 'M12_HIST', tipo: 'VN',
    titulo: 'HMS GLAMORGAN · 12 JUNIO 1982', placa: 'radio', img: 'M12_HIST',
    lineas: [
      { id: 'M12_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'En la madrugada del 12 de junio, mientras daba fuego naval sobre los montes, el Glamorgan fue alcanzado por un Exocet lanzado desde una rampa improvisada en tierra.', en: '' },
      { id: 'M12_HIST_020', personaje: null, cara: null, hold: 0,
        es: 'Murieron 14 tripulantes. Fue el último buque británico alcanzado en la guerra.', en: '' },
      { id: 'M12_HIST_030', personaje: null, cara: null, hold: 0,
        es: 'Al barco que castigaba el monte le pegaron desde tierra y desde el aire a la vez.', en: '' },
      { id: 'M12_HIST_040', personaje: null, cara: null, hold: 0,
        es: 'El 14 de junio de 1982, tras 74 días, cesaron los combates.', en: '' },
    ],
  },

  // ---------- CHARLAS EN VUELO (tipo 'VUELO', SPEC_CHARLAS_VUELO RF-05) ----------
  // Se cuelgan de un TRAMO, no de una secuencia: ver el campo `charla:` en data/missions.js.

  // EL RITUAL DE CONDOR (GUION_3, M1). En el guion escrito esto se decia en tierra, antes de
  // subir; dicho EN VUELO es otra cosa — la voz entra por la radio con el avion ya volando y el
  // mar pasando abajo, que es como los pilotos la escuchaban de verdad. Es la formula que se va
  // a repetir doce veces y que en M14 se corta por la mitad: cuanto mas reconocible sea acá,
  // mas caro sale alla.
  //
  // CONDOR NO TIENE CARA a proposito (`condor_reposo` es el parlante, no un hombre): del otro
  // lado de la radio hay un comando, no un amigo. Es la unica voz de la campaña que se escucha
  // sin saber a quien se le esta escuchando.
  M01_RITUAL: {
    id: 'M01_RITUAL', tipo: 'VUELO', titulo: 'EL RITUAL',
    lineas: [
      { id: 'M01_RITUAL_010', personaje: 'CÓNDOR', cara: 'condor_reposo', hold: 0.6,
        es: 'Plata Fiel, Plata Fiel. Aquí Cóndor.', en: '' },
      { id: 'M01_RITUAL_020', personaje: 'CÓNDOR', cara: 'condor_reposo', hold: 0.5,
        es: 'Cielo despejado al sur. Viento en la cola.', en: '' },
      { id: 'M01_RITUAL_030', personaje: 'CÓNDOR', cara: 'condor_reposo', hold: 0.8,
        es: 'Reconocimiento de zona: vuelen bajito y a casa.', en: '' },
      // el hold mas largo de la escena, y es el unico que importa: la formula termina, la radio
      // queda abierta un segundo, y lo unico que hay en pantalla son los aviones volando juntos
      { id: 'M01_RITUAL_040', personaje: 'CÓNDOR', cara: 'condor_reposo', hold: 1.2,
        es: 'Buena suerte, muchachos.', en: '' },
    ],
  },
  // LA CONTESTACION DEL GITANO, y es una ESCENA APARTE por la regla de arriba: las seis lineas
  // juntas dan ~23 s contra un tope de 25, y una charla que roza el tope es una charla que el
  // dia que alguien alargue una linea se va a cortar sola. Partida en dos tramos, cada mitad
  // respira — y ademas el chiste llega DESPUES del silencio, que es donde funciona.
  // EL NARWAL (GUION_3 M4/M5, §3.9) COMO CHARLA EN VUELO. Antes esto vivia en `data/strings.js`
  // como 23 lineas de radio en mayusculas, una por tramo. Como escena de story.js gana tres cosas
  // que la radio no puede dar: HOLDS (los tres segundos de radio abierta de M5 son una linea con
  // su silencio, no un renglon que dice «...»), CARAS por linea, y el texto en el mismo archivo
  // que el resto del guion.
  //
  // Va partida en cinco (M4) y tres (M5) porque una escena VUELO tiene que entrar en CHV_MAX_S:
  // la cuenta es `max(1.6, caracteres/12) + hold` por linea, y ninguna de las ocho pasa de 23 s.
  // Cada pedazo se cuelga de un tramo consecutivo en data/missions.js.
  //
  // LA PLANTACION Y EL COBRO: en m4 los tramos van con `marcas: true` y el HUD marca las unidades
  // que Condor dicta; en m5 van con `marcas: false` y no marca nada. Esa es toda la explicacion
  // que el juego da de que el Narwal no esta mas, y no hace falta ninguna otra.
  M4_NARWAL_A: {
    id: 'M4_NARWAL_A', tipo: 'VUELO', titulo: 'LAS POSICIONES',
    lineas: [
      { id: 'M4_NARWAL_A_010', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 0.6,
        es: 'Plata Fiel, anoto posiciones. Dos unidades al noreste, rumbo sur, velocidad diez.', en: '' },
      { id: 'M4_NARWAL_A_020', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 0.8,
        es: 'Una tercera más atrás, sin confirmar.', en: '' },
      { id: 'M4_NARWAL_A_030', personaje: 'PUMA', cara: 'puma_neutro', hold: 1.2,
        es: 'Copiado, Cóndor.', en: '' },
    ],
  },
  M4_NARWAL_B: {
    id: 'M4_NARWAL_B', tipo: 'VUELO', titulo: 'DE DÓNDE SALEN',
    lineas: [
      { id: 'M4_NARWAL_B_010', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.4,
        es: 'Cóndor, una pregunta de curioso nomás. ¿De dónde sacás vos todo eso?', en: '' },
      { id: 'M4_NARWAL_B_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.8,
        es: 'Porque nosotros acá no vemos un carajo hasta que lo tenemos encima.', en: '' },
      { id: 'M4_NARWAL_B_030', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 1.2,
        accion: 'sin ningún énfasis, como quien lee una planilla',
        es: 'De un barco pesquero llamado Narwal.', en: '' },
      { id: 'M4_NARWAL_B_040', personaje: 'GITANO', cara: 'gitano_ceno', hold: 1.0,
        es: '…¿Un pesquero?', en: '' },
    ],
  },
  M4_NARWAL_C: {
    id: 'M4_NARWAL_C', tipo: 'VUELO', titulo: 'SETENTA METROS',
    lineas: [
      { id: 'M4_NARWAL_C_010', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 0.4,
        es: 'Un pesquero. Setenta metros. Tira la red, la levanta, la vuelve a tirar.', en: '' },
      { id: 'M4_NARWAL_C_020', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 1.0,
        es: 'Y mientras tanto anota todo lo que le pasa al lado.', en: '' },
      { id: 'M4_NARWAL_C_030', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.8,
        es: '¡Pará! ¿Me estás diciendo que la flota inglesa le está pasando por adelante a unos tipos que están pescando?', en: '' },
    ],
  },
  M4_NARWAL_D: {
    id: 'M4_NARWAL_D', tipo: 'VUELO', titulo: 'TRES SEMANAS',
    lineas: [
      { id: 'M4_NARWAL_D_010', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 1.0,
        es: 'Por adelante, por atrás y por arriba. Hace tres semanas.', en: '' },
      { id: 'M4_NARWAL_D_020', personaje: 'GITANO', cara: 'gitano_risa_apagada', hold: 0.8,
        accion: 'la risa se le apaga sola',
        es: '…Tres semanas ahí adentro. ¿Y esos tipos qué son? ¿Marina?', en: '' },
      { id: 'M4_NARWAL_D_030', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 0.6,
        es: 'Un oficial a bordo. El resto, pescadores.', en: '' },
      { id: 'M4_NARWAL_D_040', personaje: 'GITANO', cara: 'gitano_ceno', hold: 0.5,
        es: '¿Pescadores pescadores?', en: '' },
      { id: 'M4_NARWAL_D_050', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 1.5,
        es: 'Pescadores pescadores.', en: '' },
    ],
  },
  M4_NARWAL_E: {
    id: 'M4_NARWAL_E', tipo: 'VUELO', titulo: 'SIN NADA PARA TIRAR',
    lineas: [
      { id: 'M4_NARWAL_E_010', personaje: 'VASCO', cara: 'vasco_neutro', hold: 1.0,
        es: 'Sin nada para tirar.', en: '' },
      { id: 'M4_NARWAL_E_020', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 2.0,
        es: 'Sin nada para tirar.', en: '' },
      { id: 'M4_NARWAL_E_030', personaje: 'PUMA', cara: 'puma_neutro', hold: 3.0,
        accion: 'casi para sí mismo, y es lo único que dice en todo el tramo',
        es: 'No son militares, Gitano. Y están más adentro que nosotros.', en: '' },
    ],
  },
  M5_NARWAL_A: {
    id: 'M5_NARWAL_A', tipo: 'VUELO', titulo: 'POSICIONES',
    lineas: [
      { id: 'M5_NARWAL_A_010', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 1.5,
        es: 'Plata Fiel, posiciones.', en: '' },
      { id: 'M5_NARWAL_A_020', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 0.8,
        es: 'Actividad en San Carlos. Varias unidades.', en: '' },
      { id: 'M5_NARWAL_A_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.6,
        es: '¿Varias cuántas, Cóndor?', en: '' },
      { id: 'M5_NARWAL_A_040', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 1.2,
        es: 'Varias. No tengo número.', en: '' },
    ],
  },
  M5_NARWAL_B: {
    id: 'M5_NARWAL_B', tipo: 'VUELO', titulo: 'PREGUNTALE AL PESQUERO',
    lineas: [
      { id: 'M5_NARWAL_B_010', personaje: 'GITANO', cara: 'gitano_ceno', hold: 1.0,
        es: '¿Cómo que no tenés número? La otra vez me diste hasta la velocidad.', en: '' },
      { id: 'M5_NARWAL_B_020', personaje: 'GITANO', cara: 'gitano_ceno', hold: 0.5,
        es: 'Cóndor. Preguntale al pesquero.', en: '' },
      { id: 'M5_NARWAL_B_030', personaje: null, cara: null, hold: 3.0,
        accion: 'tres segundos de radio abierta: el ruido de fondo y nada más',
        es: '…', en: '' },
      { id: 'M5_NARWAL_B_040', personaje: 'GITANO', cara: 'gitano_preocupado', hold: 1.0,
        es: 'Cóndor. El pesquero.', en: '' },
      { id: 'M5_NARWAL_B_050', personaje: 'CÓNDOR', cara: 'condor_radio', hold: 3.0,
        es: 'Hace doce días que no transmite.', en: '' },
    ],
  },
  M5_NARWAL_C: {
    id: 'M5_NARWAL_C', tipo: 'VUELO', titulo: 'ENTRAMOS',
    lineas: [
      { id: 'M5_NARWAL_C_010', personaje: 'GITANO', cara: 'gitano_roto', hold: 2.5,
        accion: 'sin nada arriba, la voz plana',
        es: '…Copiado.', en: '' },
      { id: 'M5_NARWAL_C_020', personaje: 'PUMA', cara: 'puma_ceno', hold: 1.5,
        es: 'Formación cerrada. Entramos.', en: '' },
    ],
  },
  M01_GANSOS: {
    id: 'M01_GANSOS', tipo: 'VUELO', titulo: 'LOS GANSOS',
    lineas: [
      { id: 'M01_GANSOS_010', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.5,
        es: '¿Viste? Para el comando somos gansos.', en: '' },
      { id: 'M01_GANSOS_020', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.8,
        es: 'Por lo menos eligieron uno que vuela.', en: '' },
    ],
  },
};

/** QUE ESCENAS, Y EN QUE ORDEN, juega cada momento de la campaña.
 *
 *  Las claves son las mismas de siempre (`storyM1`, `epiM4`…) porque es lo que pide game.js: una
 *  secuencia se arranca por nombre. Separar el ORDEN del CONTENIDO es lo que permite reordenar la
 *  campaña —o intercalar una escena nueva— moviendo un id de lista en vez de cortar y pegar texto.
 */
export const SECUENCIAS = {
  storyM1: ['P1_2', 'P2_3', 'P3_4', 'P4_1', 'M1_3', 'M1_5B', 'M1_TERITO', 'M1_CINCO', 'STORYM1_TARJETA'],
  epiM1: ['M1_7', 'M1_9'],
  storyM2: ['M2_1', 'M2_MATE', 'STORYM2_TARJETA'],
  epiM2: ['M2_5', 'M2_8'],
  storyM3: ['M03_INVENTO', 'M03_TARJETA'],
  epiM3: ['M03_ARANDELA', 'M03_BURRADA', 'M03_CUADERNO', 'M03_BELGRANO'],
  storyM4: ['M3_1', 'M3_2', 'STORYM3_TARJETA'],
  epiM4: ['M3_6', 'M3_FOTO', 'M3_8', 'M3_HIST'],
  storyM5: ['M4_1', 'M4_2', 'STORYM4_TARJETA'],
  epiM5: ['M4_EPI', 'M5_ESCUCHA', 'M4_CARTA', 'M4_HIST'],
  storyM6: ['M5_1', 'M5_2', 'STORYM5_TARJETA'],
  epiM6: ['M5_EPI', 'M5_CHANCHA', 'M5_CARTA', 'M5_HIST'],
  storyM7: ['M6_1', 'M6_2', 'STORYM6_TARJETA'],
  epiM7: ['M6_EPI', 'M6_LOCKER1', 'M6_LOCKER2', 'M6_CARTA', 'M6_HIST'],
  storyM8: ['M7_1', 'M7_2', 'STORYM7_TARJETA'],
  epiM8: ['M7_SOBREVUELO', 'M7_TESIS', 'M7_CARTA', 'M7_HIST'],
  storyM9: ['M8_1', 'M8_2', 'STORYM8_TARJETA'],
  epiM9: ['M8_EPI', 'M8_LIBRETA', 'M8_CARTA'],
  storyM10: ['M10_HUECO', 'M10_TARJETA'],
  epiM10: ['M10_TANDIL', 'M10_NOTICIA', 'M10_CUADERNO', 'M10_MIRAGE'],
  storyM11: ['M9_1', 'STORYM9_TARJETA'],
  epiM11: ['M9_EPI', 'M9_CARTA', 'M9_HIST'],
  storyM12: ['M10_1', 'STORYM10_TARJETA'],
  epiM12: ['M10_TIERRA', 'M10_PISTA', 'M10_CARTA', 'M10_HIST'],
  storyM13: ['M11_1', 'M11_2', 'STORYM11_TARJETA'],
  epiM13: ['M11_ASADO1', 'M11_ASADO2', 'M11_CARTA', 'M11_CARTA2'],
  storyM14: ['M12_1', 'M12_2', 'STORYM12_TARJETA'],
  // EL VUELO Y LA DECISION. Termina en `M12_FINAL`, que ya no remata: el timon es del jugador.
  epiM14: ['M12_GITANO', 'M12_PUMA', 'M12_TARDE', 'M12_FINAL'],
  // LOS DOS FINALES (GUION_3 nota 7). No hay final correcto y no hay menu: el jugador viro a la
  // oleada o viro al mar, y eso ES la decision. QUIEN ELIGE CUAL DE LAS DOS SECUENCIAS CORRE
  // TODAVIA NO EXISTE — es trabajo de motor, no de datos (ver PENDIENTES_GUION, M14-12).
  epiM14A: ['EPI_A1', 'EPI_A2', 'EPI_MESA1', 'EPI_A3', 'M12_HIST'],
  epiM14B: ['EPI_B1', 'EPI_B2', 'EPI_B3', 'M12_HIST'],
};
