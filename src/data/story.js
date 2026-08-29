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
        es: 'Esa noche, la sala de radio. El Pichón con los auriculares puestos, escribiendo en la libreta. Sabe inglés técnico de leer manuales de aviación robados: nadie se lo enseñó, lo aprendió solo para entender los planos.', en: '' },
      { id: 'M5_ESCUCHA_020', personaje: 'PICHÓN', cara: 'pichon_auriculares', hold: 1.0,
        es: 'Capitán… están hablando de nosotros.', en: '' },
      { id: 'M5_ESCUCHA_030', personaje: 'PUMA', cara: 'puma_neutro', hold: 0.6,
        es: '¿Qué dicen.', en: '' },
      { id: 'M5_ESCUCHA_040', personaje: 'PICHÓN', cara: 'pichon_auriculares', hold: 1.5,
        es: 'Dice… "si estás en guerra con Argentina y escuchás el ruido de las turbinas de un avión…"', en: '' },
      { id: 'M5_ESCUCHA_050', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.5,
        es: '¿Y? Seguí, pibe.', en: '' },
      // LA UNICA VEZ EN TODO EL JUEGO en que estos tipos se enteran de que no estan perdiendo.
      // Dura una frase. El hold largo es para que el jugador la escuche igual que ellos.
      { id: 'M5_ESCUCHA_060', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 4.0,
        es: '"…no mires al cielo. Porque la muerte viene a ras del suelo."', en: '' },
      { id: 'M5_ESCUCHA_070', personaje: 'EL TURCO', cara: 'turco_orgullo', hold: 1.5,
        es: 'Escribila, changuito. Esa escribila.', en: '' },
      { id: 'M5_ESCUCHA_080', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 1.2,
        es: '…A ras del suelo. ¿Escuchaste, Tero? Somos eso.', en: '' },
      // y a Esteban el orgullo se le va en una silaba: del otro lado del mar les tienen miedo,
      // y del lado de aca hay un chico de dieciocho que escucha lo mismo y no sabe quien pasa
      { id: 'M5_ESCUCHA_090', personaje: 'ESTEBAN', cara: 'tero_preocupado', hold: 3.5,
        es: '…Sí.', en: '' },
    ],
  },
  M2_MATE: {
    id: 'M2_MATE', tipo: 'VN', titulo: 'LA RONDA', placa: 'linea_amanecer',
    lineas: [
      { id: 'M2_MATE_010', personaje: null, cara: null, hold: 1.2,
        es: 'Antes de subir. El Turco ceba y el mate arranca la ronda en la línea de vuelo. Le llega al Gitano.', en: '' },
      // EL GUIÑO GAMER, canal 1 (GUION_3 §9c): la reverencia entera, ridicula, para nadie. En
      // pantalla no se nombra ningun juego ni ninguna marca — es un piloto de veintipico
      // haciendo una payasada antes de volar. El que lo reconoce lo reconoce.
      { id: 'M2_MATE_020', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 1.5,
        accion: 'Agarra el mate con las dos manos, toma. Lo deja, y hace un gesto similar al saludo de un soldado.',
        es: 'THANK YOU.', en: '' },
      { id: 'M2_MATE_030', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 0.6,
        es: '¿Y por qué en inglés?', en: '' },
      { id: 'M2_MATE_040', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.8,
        es: 'Porque si digo gracias me sacan de la ronda, pibe. Y yo de la ronda no me voy.', en: '' },
      { id: 'M2_MATE_050', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 2.0,
        es: 'De la ronda no se va nadie.', en: '' },
      // el Pichon escuchando la chapa: el pibe que oye a los aviones. Se paga en M9.
      { id: 'M2_MATE_060', personaje: null, cara: null, hold: 2.5,
        es: 'Y mientras los otros terminan el mate, el Pichón ya está al lado de su avión con la mano abierta apoyada en la chapa y la cabeza gacha, escuchando. No dice nada. Después la saca y se seca la palma en el mameluco.', en: '' },
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
    id: 'M10_TARJETA', tipo: 'TARJETA', titulo: 'MISIÓN 10 — LOS PRIMOS',
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
    id: 'M10_CUADERNO', tipo: 'TIERRA', titulo: 'CARTA DE MATEO', placa: 'p1c_cuaderno', img: 'carta11_m10',
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
        es: 'Bajate de ahí, chango. Eso no se toca ni en pedo.', en: '' },
      { id: 'M03_INVENTO_030', personaje: 'PICHÓN', cara: 'pichon_sonrisa', hold: 0.5,
        es: 'Es que mire... si le corremos la toma dos dedos y le sacamos este peso muerto de acá, en la salida del rasante gana empuje. Lo vi en la salida de ayer, el suyo se quedaba y el del capitán no, y la única diferencia es...', en: '' },
      { id: 'M03_INVENTO_040', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 1.0,
        es: 'Changuito... Eso no se puede.', en: '' },
      // la vergüenza del Pichón es su cara propia: se frena a mitad de frase y se le nota
      { id: 'M03_INVENTO_050', personaje: 'PICHÓN', cara: 'pichon_preocupado', hold: 2.0,
        es: '…Perdón. Ya me bajo.', en: '' },
      // EL HOLD MAS LARGO DE LA ESCENA, y es el que la hace: el Turco mira el fuselaje, mira al
      // pibe, y recien ahi afloja. Sin el silencio, "mostrame" es una linea mas.
      { id: 'M03_INVENTO_060', personaje: 'EL TURCO', cara: 'turco_sonrisa', hold: 3.0,
        es: '…A ver. Mostrame.', en: '' },
      { id: 'M03_INVENTO_070', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.6,
        es: 'Diez mil pesos a que el Turco lo manda a cagar antes del mediodía.', en: '' },
      { id: 'M03_INVENTO_080', personaje: 'PUMA', cara: 'puma_neutro', hold: 1.2,
        es: 'Veinte mil a que después lo prueba igual.', en: '' },
    ],
  },
  M03_TARJETA: {
    id: 'M03_TARJETA', tipo: 'TARJETA', titulo: 'MISIÓN 3 — EL INVENTO',
    lineas: [
      { id: 'M03_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: 'Primeros días de mayo de 1982 · Patrulla costera', en: '' },
    ],
  },
  M03_ARANDELA: {
    id: 'M03_ARANDELA', tipo: 'VN', titulo: 'EL PRIMER FRACASO GLORIOSO', placa: 'hangar_dia',
    lineas: [
      { id: 'M03_ARANDELA_010', personaje: null, cara: null, hold: 2.0,
        es: 'Prueban el segundo invento del pibe: algo con un carenado y mucha cinta aisladora. Hace un ruido espantoso, tira una pieza que sale volando, y se apaga con humo. Le vuela el gorro al Turco.', en: '' },
      { id: 'M03_ARANDELA_020', personaje: 'EL TURCO', cara: 'turco_neutro', hold: 1.0,
        es: 'No sirve ni en pedo, changuito.', en: '' },
      { id: 'M03_ARANDELA_030', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 1.5,
        es: '…Interesante.', en: '' },
      { id: 'M03_ARANDELA_040', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 1.0,
        es: '"Interesante", dice el culiao. Casi me mata una arandela voladora... Ajá... "interesante".', en: '' },
    ],
  },
  // LA BURRADA: el guiño gamer de GUION_3 §9c. La coreografia va EN ESTE ORDEN —vertical, salto,
  // disparo en caida, tirar el caño, reingreso— porque el orden ES el chiste para el que lo
  // reconoce. En pantalla no se nombra ningun juego, ninguna marca y ningun año.
  M03_BURRADA: {
    id: 'M03_BURRADA', tipo: 'VN', titulo: 'LA BURRADA DEL GITANO', placa: 'hangar_dia',
    lineas: [
      { id: 'M03_BURRADA_010', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.5,
        es: 'Turco, pará. Escuchame una cosa que la tengo pensada hace como una semana. Te vienen dos atrás, ¿sí? Dos. No les ganás de velocidad, no les ganás de nada.', en: '' },
      { id: 'M03_BURRADA_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.6,
        es: 'Entonces no jugás a eso. Ponés la trompa para arriba. Derechito al cielo, hasta que el avión se queda sin nada.', en: '' },
      { id: 'M03_BURRADA_030', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 0.5,
        es: '…Ahí entrás en pérdida.', en: '' },
      { id: 'M03_BURRADA_040', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 1.0,
        es: 'Ahí entrás en pérdida. Perfecto. Y ahí te bajás.', en: '' },
      { id: 'M03_BURRADA_050', personaje: 'VASCO', cara: 'vasco_neutro', hold: 0.8,
        es: '¿Cómo que te bajás.', en: '' },
      { id: 'M03_BURRADA_060', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.6,
        es: 'Te bajás, Vasco. Te salís. Y los dos que te venían siguiendo le siguen yendo al avión, y vos ya no estás adentro. Y mientras caés… le metés uno.', en: '' },
      { id: 'M03_BURRADA_070', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 2.0,
        es: 'Tirás el caño, seguís cayendo tranquilo, acomodás el cuerpo, y le apuntás a tu propio avión, que viene bajando por el otro lado. Te metés adentro, cerrás la cúpula, y seguís volando como si nada.', en: '' },
      { id: 'M03_BURRADA_080', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 0.6,
        es: '¿Y a qué velocidad estarías vos cuando saltás?', en: '' },
      { id: 'M03_BURRADA_090', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.8,
        es: 'Y… despacito.', en: '' },
      { id: 'M03_BURRADA_100', personaje: 'VASCO', cara: 'vasco_rezo', hold: 1.2,
        es: 'Diosito.', en: '' },
      { id: 'M03_BURRADA_110', personaje: 'EL TURCO', cara: 'turco_ceno', hold: 1.0,
        es: 'A ver, m\'hijo. ¿Vos te pensás que el aire es una vereda? Te bajás vos de ese avión, y a los treinta segundos te junto con la pala en la loma del fondo.', en: '' },
      { id: 'M03_BURRADA_120', personaje: 'PUMA', cara: 'puma_neutro', hold: 0.4,
        es: 'Facundo.', en: '' },
      { id: 'M03_BURRADA_130', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.4,
        es: '¿Qué.', en: '' },
      // el remate es una palabra y un silencio. Y el Pichon NO tacha lo que anoto: se paga en M9.
      { id: 'M03_BURRADA_140', personaje: 'PUMA', cara: 'puma_neutro', hold: 2.5,
        es: 'No.', en: '' },
    ],
  },
  M03_CUADERNO: {
    id: 'M03_CUADERNO', tipo: 'TIERRA', titulo: 'CARTA DE MATEO', placa: 'p1c_cuaderno', img: 'carta4_m3',
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
      { id: 'M03_BELGRANO_010', personaje: 'PICHÓN', cara: 'pichon_preocupado', hold: 2.5,
        es: '…Hundieron al Belgrano.', en: '' },
      { id: 'M03_BELGRANO_020', personaje: 'GITANO', cara: 'gitano_risa_apagada', hold: 1.0,
        es: '¿Al crucero? Pero si el crucero está afuera de la zona, Pichón. Está navegando para el otro lado.', en: '' },
      { id: 'M03_BELGRANO_030', personaje: 'PICHÓN', cara: 'pichon_preocupado', hold: 1.2,
        es: 'Ya sé. Un submarino. Dos torpedos.', en: '' },
      { id: 'M03_BELGRANO_040', personaje: 'PUMA', cara: 'puma_ceno', hold: 0.6,
        es: '¿Cuántos.', en: '' },
      { id: 'M03_BELGRANO_050', personaje: 'PICHÓN', cara: 'pichon_roto', hold: 2.5,
        es: 'No se sabe todavía. Se está hundiendo con la gente adentro y hay temporal. Dicen que hay balsas en el agua desde hace horas.', en: '' },
      { id: 'M03_BELGRANO_060', personaje: 'GITANO', cara: 'gitano_ceno', hold: 1.5,
        es: 'Estaba yéndose. Estaba yéndose, Puma.', en: '' },
      { id: 'M03_BELGRANO_070', personaje: 'PUMA', cara: 'puma_roto', hold: 1.5,
        es: 'Sí.', en: '' },
      { id: 'M03_BELGRANO_080', personaje: 'GITANO', cara: 'gitano_roto', hold: 0.5,
        es: '¿Y entonces qué carajo—', en: '' },
      { id: 'M03_BELGRANO_090', personaje: 'PUMA', cara: 'puma_roto', hold: 3.0,
        es: 'Y entonces nada, Facundo. Entonces mañana volamos.', en: '' },
      { id: 'M03_BELGRANO_100', personaje: null, cara: null, hold: 4.0,
        es: '323 muertos. Casi la mitad de todos los caídos argentinos de la guerra, en una sola tarde.', en: '' },
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
        es: 'Se caen los que le tienen miedo a la tierra. …Salió mejor el avión que yo, ¿eh?', en: '' },
    ],
  },
  P2_3: {
    id: 'P2_3', tipo: 'VN', titulo: 'LA COCINA · 2 DE ABRIL DE 1982', placa: 'p2_cocina',
    lineas: [
      { id: 'P2_3_010', personaje: null, cara: null, hold: 1.5, tipo: 'NARRADOR',
        es: 'Viernes a la tarde. Mateo, 18, rapado de colimba, de franco: llegó hace un rato y el bolso todavía está en la puerta. Esteban enfrente. Norma de espaldas, sirviendo.', en: '' },
      { id: 'P2_3_020', personaje: 'MATEO', cara: 'mateo_sonrisa', hold: 0.6,
        es: 'Me quedan dos meses de instrucción, pá. Después es puro marchar. Y para fin de año estoy de vuelta arreglándote el Rastrojero.', en: '' },
      { id: 'P2_3_030', personaje: 'ESTEBAN', cara: 'tero_sonrisa', hold: 0.8,
        es: 'Vos al Rastrojero lo rompés más de lo que lo arreglás.', en: '' },
      // EL CHISTE DEL SORTEO. Dura cuatro segundos y NO SE VUELVE A MENCIONAR NUNCA en todo el
      // juego (nota de tratamiento de GUION_3): el jugador se acuerda solo. No se dice ninguna
      // cifra a proposito — los cortes del sorteo variaban año a año.
      { id: 'P2_3_040', personaje: 'MATEO', cara: 'mateo_sonrisa', hold: 0.6,
        es: 'Ah, y sabés que por un pelo no me tocaba la tuya. Un poco más arriba el número y en vez de al Ejército me mandaban a la Fuerza Aérea.', en: '' },
      { id: 'P2_3_050', personaje: 'ESTEBAN', cara: 'tero_sonrisa', hold: 1.5,
        es: 'Te salvaste por poco, entonces.', en: '' },
      { id: 'P2_3_055', personaje: null, cara: null, hold: 1.0, tipo: 'NARRADOR',
        es: 'Suena el teléfono.', en: '' },
      { id: 'P2_3_060', personaje: 'NORMA', cara: 'norma_calida', hold: 0.8,
        accion: 'se levanta y atiende',
        es: '¿Para quién?... ¿Tero?... Tomá amor. Es para vos.', en: '' },
      { id: 'P2_3_070', personaje: 'MATEO', cara: 'mateo_neutro', hold: 0.5,
        es: '¿Tero?', en: '' },
      // de donde sale el indicativo, dicho por la madre y de pasada: es el nombre del juego
      { id: 'P2_3_080', personaje: 'NORMA', cara: 'norma_calida', hold: 1.2,
        es: 'A tu padre le dicen Tero. Se lo pusieron hace casi veinte años durante la colimba y le quedó para siempre. En el trabajo le dicen así.', en: '' },
      { id: 'P2_3_090', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'Esteban corta el teléfono. Queda pálido y en silencio.', en: '' },
      { id: 'P2_3_100', personaje: 'MATEO', cara: 'mateo_preocupado', hold: 1.0,
        es: '¿Qué pasa, pá?', en: '' },
      { id: 'P2_3_110', personaje: null, cara: null, hold: 3.0, tipo: 'NARRADOR',
        es: 'Prende la radio sin responder. «...tropas argentinas desembarcaron esta madrugada en las Islas Malvinas...». Los tres quietos. La pava chifla y nadie la saca del fuego.', en: '' },
      { id: 'P2_3_120', personaje: null, cara: null, hold: 3.5,
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
        es: 'Decidí comenzar a escribirte, para contarte todo con lujo de detalles, y porque creo que me distrae un poco. Cuando vuelva, te lo doy en la mano. Te lo leo y me río con vos.', en: '' },
      { id: 'P4_1_030', personaje: null, cara: null, hold: 0,
        es: 'Me acuerdo lo que me enseñaste del sapito. Sé que vos estás arriba. Mientras yo sigo bancándola acá, vos me ves desde arriba, chiquito pero seguro. Contame vos cómo se ve todo desde arriba...', en: '' },
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
      { id: 'M1_3_010', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Bienvenido al escuadrón, Tero. Primera regla: siempre pegado al agua, el radar de ellos no te ve. Hay que volar tan bajo que tenés que volver con sal en las alas. Segunda regla: no hay. Con la primera alcanza.', en: '' },
      { id: 'M1_3_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'Tercera regla: el mate lo cebo yo. Y si no volvés... te lo cebo igual. Pero solo. Cebar solo es tristísimo, así que volvé.', en: '' },
      { id: 'M1_3_030', personaje: 'PICHÓN', cara: 'pichon_neutro', hold: 0.6,
        es: '¿Siempre van a hacer estos chistes?', en: '' },
      { id: 'M1_3_035', personaje: 'VASCO', cara: 'vasco_neutro', hold: 2.0,
        accion: 'sin levantar la vista de la escalerilla',
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
      { id: 'M1_5B_005', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'El vestuario, media hora antes de subir. El Vasco cierra su locker rápidamente y se aparta. Pichón logra ver la foto de una mujer.', en: '' },
      { id: 'M1_5B_010', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.6,
        accion: 'lo ve mirando y le habla desde el otro lado del banco',
        es: 'Andá, mirala, Pichón. Está pegada adentro del locker.', en: '' },
      { id: 'M1_5B_005', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'Una foto blanco y negro denota una bella mujer sonriente. Pichón se queda mirándola.', en: '' },
      { id: 'M1_5B_020', personaje: 'PICHÓN', cara: 'pichon_sonrisa', hold: 1.5,
        accion: 'sin sacarle los ojos de encima',
        es: '...es hermosa.', en: '' },
      { id: 'M1_5B_010', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.6,
        es: 'Le decimos “La Casada”. No sabemos quién es, pero es seguro que ese minón tiene dueño.', en: '' },
      { id: 'M1_5B_030', personaje: null, cara: null, hold: 2.0, tipo: 'NARRADOR',
        es: 'El Vasco se persigna, sube la escalerilla y no acota nada.', en: '' },
      { id: 'M1_5B_010', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.6,
        accion: 'se acerca al locker, junto a Pichón',
        es: 'Creíamos que era la mujer del Vasco. Pero él nunca dice nada… de nada. Debe ser algún amorío del pasado... Y ya debe estar casada... con alguien de poder. Como un político... o un mafioso... o ambas.', en: '' },
        { id: 'M1_5B_040', personaje: 'CÓNDOR', cara: 'condor_reposo', hold: 0, 
        accion: 'Shhh, crrr... zkk',
        es: 'Escuadrilla CAUQUÉN, acá Cóndor. Solicitud de vuelo de adaptación sobre mar abierto autorizado, rumbo sudeste. Recomendamos cautela, mantenerse rasantes al agua durante todo el trayecto, prestar atencion al radar. Autorizada pista dos para despegue, buen vuelo.', en: '' },
    ],
  },
  STORYM1_TARJETA: {
    id: 'STORYM1_TARJETA', tipo: 'TARJETA',
    titulo: 'MISIÓN 1 — SAL EN LAS ALAS',
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
        es: 'El escuadrón aterriza. Mientras el equipo baja de sus aviones, el Turco se acerca con un pincel finito y pintura. Tiene la costumbre de pintarles estrellitas, una por cada vez que se vuelve a salvo.', en: '' },
      { id: 'M1_7_020', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        es: 'Esta estrellita te pertenece. A vos, no al avión.', en: '' },
      { id: 'M1_7_030', personaje: null, cara: null, hold: 2.5, tipo: 'NARRADOR',
        es: 'Al menos por un ratito, esto parece una aventura.', en: '' },
    ],
  },
  M1_9: {
    id: 'M1_9', tipo: 'TIERRA',
    titulo: 'CARTA DE MATEO', placa: 'p1c_cuaderno', img: 'carta2_m1',
    lineas: [
      { id: 'M1_9_010', personaje: null, cara: null, hold: 0,
        es: 'Viejo: hoy conocí a un tipo, el cabo Correa. Correntino. Le dicen el Colorado. Me vió tiritando y me tiró un cacho de lana de oveja sin decir nada, como quien no quiere la cosa.', en: '' },
      { id: 'M1_9_020', personaje: null, cara: null, hold: 0,
        es: 'No sé por qué, pero con él cerca tengo menos miedo. ¿Vos lo mandaste, no? No me mientas que te conozco, viejo. Gracias.', en: '' },
      { id: 'M1_9_030', personaje: null, cara: null, hold: 0,
        es: 'Lo dibujé con una capa (de lana), como un superhéroe. Te lo guardo para cuando vuelva. Te vas a reír. Mateo.', en: '' },
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
        es: 'No. Pero es lo que hay, y lo que hay lo volamos con todo. Como en el potrero, Tero: cuando el rival tiene botines y vos estás descalzo, gambeteás más pegado al piso.', en: '' },
    ],
  },
  STORYM2_TARJETA: {
    id: 'STORYM2_TARJETA', tipo: 'TARJETA',
    titulo: 'MISIÓN 2 — BAUTISMO DE FUEGO',
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
        es: '¿Ves? Esa no es del avión. Es tuya.', en: '' },
    ],
  },
  M2_8: {
    id: 'M2_8', tipo: 'TIERRA', titulo: 'CARTA DE MATEO', placa: 'p1c_cuaderno', img: 'carta3_m2',
    lineas: [
      { id: 'M2_8_010', personaje: null, cara: null, hold: 0,
        es: 'Pá: hoy comimos una vez. En todo el día. La comida está —la mandan del continente— pero no llega a nosotros. El Colorado me pasó la mitad de su lata jurando que él ya había comido, mentira grande como una casa porque le escuché las tripas toda la noche.', en: '' },
      { id: 'M2_8_020', personaje: null, cara: null, hold: 0,
        es: 'Hay un subteniente, Bordón. Tiene la carpa llena de cajas. Nosotros afuera, las cajas adentro. Nadie dice nada: acá el que abre la boca la pasa mal.', en: '' },
      { id: 'M2_8_030', personaje: null, cara: null, hold: 0,
        es: 'Igual te cuento una linda: como prohibieron pasar música en inglés, la radio pasa rock nacional todo el día. Anoche los pibes cantaban en el pozo, pá. Cantábamos para no llorar y al final era lo mismo, pero cantado.', en: '' },
      { id: 'M2_8_040', personaje: null, cara: null, hold: 1.5,
        es: 'Unas ganas de comer el guiso de mamá... Apenas termine esto le pedimos que lo prepare. Anotalo vos también, que yo acá lo tengo escrito. Mateo.', en: '' },
    ],
  },
  M3_1: {
    id: 'M3_1', tipo: 'VN', titulo: '4 DE MAYO', placa: 'linea_amanecer',
    lineas: [
      { id: 'M3_1_010', personaje: null, cara: null, hold: 1.5,
        es: 'El día que el mundo se enteró de que la flota más poderosa podía sangrar: un misil argentino alcanza a un destructor británico.', en: '' },
      { id: 'M3_1_020', personaje: 'GITANO', cara: 'gitano_sonrisa', hold: 0.8,
        es: '¡Le dimos! ¡A la Royal Navy le dimos, muchachos! ¡Que se enteren en Londres que acá abajo hay gente con huevos! ¡Argentina, carajo!', en: '' },
      { id: 'M3_1_030', personaje: 'PUMA', cara: 'puma_ceno', hold: 1.5,
        es: 'Veinte marinos, Gitano.', en: '' },
      // la caida de la sonrisa tiene su propia linea Y su propia cara: es el beat que enseña
      // en que registro esta parado el juego, y aplastarlo en la linea de arriba lo borraria
      { id: 'M3_1_040', personaje: 'GITANO', cara: 'gitano_risa_apagada', hold: 2.0,
        es: '…veinte marinos.', en: '' },
      { id: 'M3_1_050', personaje: 'PUMA', cara: 'puma_ceno', hold: 3.0,
        es: 'Del otro lado hay pibes iguales a nosotros que hoy no vuelven. Alegrate de que nosotros sí. Y callate un minuto por los que no.', en: '' },
    ],
  },
  M3_2: {
    id: 'M3_2', tipo: 'VN', titulo: 'LA GAMBETA', placa: 'hangar_dia',
    lineas: [
      // LA PROFECIA. Se dice en voz baja y nadie la subraya — es el unico momento del juego que
      // mira mas alla de la guerra, y funciona porque el jugador sabe como termina.
      { id: 'M3_2_010', personaje: 'GITANO', cara: 'gitano_neutro', hold: 1.5,
        es: 'Algún día le vamos a ganar en algo que no mate a nadie. Algún pibe nuestro va a agarrar una pelota y los va a gambetear a todos. A TODOS, Puma. Y ese día va a ser más grande que éste.', en: '' },
      { id: 'M3_2_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 2.5,
        es: 'Ojalá la única guerra que nos quede sea esa.', en: '' },
      // el terito: el gesto de Esteban antes de cada salida. No se explica nunca.
      { id: 'M3_2_030', personaje: null, cara: null, hold: 2.0,
        es: 'Camino a los aviones, Esteban se para un segundo delante del suyo, estira dos dedos y toca el terito. Sigue caminando.', en: '' },
    ],
  },
  STORYM3_TARJETA: {
    id: 'STORYM3_TARJETA', tipo: 'TARJETA',
    titulo: 'MISIÓN 4 — EL DÍA QUE SANGRÓ EL MAR',
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
    id: 'M3_8', tipo: 'TIERRA', titulo: 'CARTA DE MATEO', placa: 'p1c_cuaderno', img: 'carta5_m4',
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
        es: 'Fue el primer buque de guerra británico perdido en acción desde la Segunda Guerra Mundial.', en: '' },
    ],
  },
  M4_1: {
    id: 'M4_1', tipo: 'VN',
    titulo: 'SAN CARLOS', placa: 'linea_amanecer', img: 'M4_1',
    lineas: [
      { id: 'M4_1_010', personaje: null, cara: null, hold: 0,
        es: 'Los británicos desembarcan. El estrecho se vuelve una trampa de fuego antiaéreo que los propios pilotos bautizan, con humor de velorio, el Callejón de las Bombas. Hay que entrar ahí. Todos los días.', en: '' },
      { id: 'M4_1_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Es la boca del lobo. Entramos, soltamos, salimos. Nadie se hace el héroe: los héroes no llegan a cebar el mate de la tarde.', en: '' },
    ],
  },
  M4_2: {
    id: 'M4_2', tipo: 'VN', titulo: 'POR EL HIJO DE ALGUIEN', placa: 'hangar_dia',
    lineas: [
      { id: 'M4_2_010', personaje: 'ESTEBAN', cara: 'tero_preocupado', hold: 1.5,
        es: 'Puma. Mi hijo está en tierra. Cerca de acá.', en: '' },
      // LA FRASE QUE MATEO VA A CONTESTAR SIN SABERLO, en su carta de esta misma mision:
      // «el que cayó también era el hijo de alguien». Padre e hijo llegan a la misma frase por
      // caminos opuestos y ninguno se entera. NO SEPARAR ESTAS DOS ESCENAS.
      { id: 'M4_2_020', personaje: 'PUMA', cara: 'puma_ceno', hold: 2.5,
        es: 'Lo sé, Tero. Todos tenemos a alguien abajo. Cada barco que tocamos es una bomba menos cayéndole a los pibes. Volás por tu hijo. Volamos todos por ese hijo de alguien.', en: '' },
      { id: 'M4_2_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0.8,
        es: '¿Vieron que hicieron un festival allá en Buenos Aires? Juntaron montañas de cosas para los pibes de las islas. Chocolates, cigarrillos, abrigo…', en: '' },
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
    titulo: 'MISIÓN 5 — EL CALLEJÓN DE LAS BOMBAS',
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
    id: 'M4_CARTA', tipo: 'TIERRA', titulo: 'CARTA DE MATEO', placa: 'p1c_cuaderno', img: 'carta6_m5',
    lineas: [
      { id: 'M4_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Pá: hoy vi caer un avión nuestro a lo lejos. Recé para que no fueras vos y después me sentí una basura, porque el que cayó también era el hijo de alguien, el viejo de alguien.', en: '' },
      { id: 'M4_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'El Colorado me encontró llorando y no me dijo "sé hombre" ni ninguna de esas pavadas. Se sentó al lado mío en el barro y esperó que se me pase. Sabe esperar como nadie, debe ser de tanto pescar en el Paraná.', en: '' },
      { id: 'M4_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'Bordón hizo estaquear a dos pibes por "robar" comida. La comida era nuestra, pá. Uno era el jujeño de la radio. ¿Esto es la guerra o es otra cosa? Porque contra los ingleses todavía no disparé un tiro, pero contra el frío, el hambre y Bordón peleamos todos los días.', en: '' },
      // EL HAMBRE EN CRUDO. La carta no pide lastima y por eso pega: lo cuenta como un trabajo.
      { id: 'M4_CARTA_040', personaje: null, cara: null, hold: 0,
        es: 'Anoche carneamos una oveja, pá. A escondidas, con el Colorado y dos más. La comimos hasta los huesos: los partimos con piedras para sacarles el caracú. Yo, que en casa le sacaba la grasa a la milanesa. Nadie hizo un chiste ni pidió perdón. Lo hicimos rápido y en silencio, como un trabajo.', en: '' },
      { id: 'M4_CARTA_050', personaje: null, cara: null, hold: 2.5,
        es: 'No sé qué me asusta más, pá: el hambre, o lo tranquilo que me estoy volviendo para aguantarla. Mateo.', en: '' },
    ],
  },
  M4_HIST: {
    id: 'M4_HIST', tipo: 'VN',
    titulo: 'HMS ARDENT · 21 MAYO 1982', placa: 'radio', img: 'M4_HIST',
    lineas: [
      { id: 'M4_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'La fragata fue atacada en oleadas sucesivas mientras cubría el desembarco en San Carlos.', en: '' },
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
        es: 'A ver si entendí. ¿Le pego, le pego BIEN, en el medio del casco... y no explota?', en: '' },
      { id: 'M5_1_030', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Para que arme, tenés que soltarla más alto. Y si soltás más alto, te bajan a vos.', en: '' },
      { id: 'M5_1_040', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: '(mirando la bomba bajo el ala) Es como el sapito. La piedra va tan pegada al agua que no se hunde. El problema es que nosotros necesitamos que se hunda.', en: '' },
    ],
  },
  M5_2: {
    id: 'M5_2', tipo: 'VN',
    titulo: 'EL CHISTE DE SIEMPRE', placa: 'hangar_dia', img: 'M5_2',
    lineas: [
      { id: 'M5_2_010', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'Entonces elijo pegarle y volver a cebar el mate. Que la bomba haga lo que pueda. Y si no vuelvo, Vasco, le avisás vos a tu casada, que con el coronel ya tiene práctica en dar malas noticias.', en: '' },
      { id: 'M5_2_020', personaje: 'VASCO', cara: 'vasco_neutro', hold: 0,
        es: '...Callate, cordobés. (pero casi se ríe. Casi.)', en: '' },
    ],
  },
  STORYM5_TARJETA: {
    id: 'STORYM5_TARJETA', tipo: 'TARJETA',
    titulo: 'MISIÓN 6 — LA BOMBA QUE NO DESPERTÓ',
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
        es: 'El Antelope explota de noche: una bomba dormida despierta mientras un artificiero británico intentaba desactivarla para salvar a su barco.', en: '' },
      { id: 'M5_EPI_020', personaje: null, cara: null, hold: 0,
        es: 'Del otro lado, un hombre murió tratando de salvar a los suyos. Coraje inglés. El mismo coraje.', en: '' },
      { id: 'M5_EPI_030', personaje: 'VASCO', cara: 'vasco_neutro', hold: 0,
        es: '(mirando el resplandor lejano) Que Dios lo tenga. Al de allá también.', en: '' },
    ],
  },
  M5_CHANCHA: {
    id: 'M5_CHANCHA', tipo: 'VN',
    titulo: 'LA CHANCHA', placa: 'hangar_noche', img: 'M5_CHANCHA',
    lineas: [
      { id: 'M5_CHANCHA_010', personaje: null, cara: null, hold: 0,
        es: 'En el regreso, a Gitano no le cierra la cuenta de combustible. Viento de frente, tanque picado, la aguja bajando.', en: '' },
      { id: 'M5_CHANCHA_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '(por primera vez sin humor) Muchachos... no me da. No me da la nafta.', en: '' },
      { id: 'M5_CHANCHA_030', personaje: null, cara: null, hold: 0,
        es: 'Y de la nada, gorda, lenta, hermosa, aparece la Chancha: el Hércules reabastecedor que se mete donde no debe para darle de comer a un caza moribundo.', en: '' },
      { id: 'M5_CHANCHA_040', personaje: 'LA CHANCHA', cara: null, hold: 0,
        es: 'Tranquilo, cordobés. La Chancha no abandona a nadie. Tomá, servite.', en: '' },
      { id: 'M5_CHANCHA_050', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '(la voz quebrada) Te amo, gorda. Cuando volvamos te pinto entera de dorado.', en: '' },
    ],
  },
  M5_CARTA: {
    id: 'M5_CARTA', tipo: 'TIERRA',
    titulo: 'CARTA DE MATEO', placa: 'p1c_cuaderno', img: 'carta7_m6',
    lineas: [
      { id: 'M5_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Viejo: ¿te acordás del festival para juntar cosas para nosotros? Acá no llegó ni un chocolate. Llegó una revista vieja que decía "Estamos ganando". La usamos para taparnos del viento.', en: '' },
      { id: 'M5_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'El Colorado me mostró la foto de la hermana, toda gastada de tanto mirarla. "Cuando salgamos de ésta te la presento", me dijo. Me reí, pá. Hacía diez días que no me reía.', en: '' },
      { id: 'M5_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'Le pedí que cuando termine esto venga a casa. Asado en el fondo, vos contando mentiras de aviador, él contando mentiras de pescador. Tengo un amigo, pá. En el peor lugar del mundo, tengo un amigo. Mateo.', en: '' },
    ],
  },
  M5_HIST: {
    id: 'M5_HIST', tipo: 'VN',
    titulo: 'HMS ANTELOPE · 23 MAYO 1982', placa: 'radio', img: 'M5_HIST',
    lineas: [
      { id: 'M5_HIST_010', personaje: null, cara: null, hold: 0,
        es: 'Dos bombas impactaron la fragata, pero no detonaron.', en: '' },
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
        es: 'En la base alguien consiguió facturas, Dios sabe cómo, y el Turco preparó chocolate caliente en un tacho de aceite lavado. Hoy un barco cae de regalo para un país que allá lejos ni sabe sus nombres.', en: '' },
      { id: 'M6_1_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: 'Hoy es 25, muchachos. Hoy le dedicamos uno a la Patria.', en: '' },
      { id: 'M6_1_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'A la Patria patria, ¿eh? La de los pibes y las facturas. No a la de los despachos, que esos se consigan su propio barco.', en: '' },
    ],
  },
  M6_2: {
    id: 'M6_2', tipo: 'VN',
    titulo: 'EL VASCO HABLA', placa: 'vestuario', img: 'M6_2',
    lineas: [
      { id: 'M6_2_010', personaje: null, cara: null, hold: 0,
        es: 'El Vasco habla más que en las cinco misiones anteriores juntas. Del chocolate, del frío, de una anécdota de la escuela de aviación que nadie le pidió.', en: '' },
      { id: 'M6_2_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '(sorprendido) Vasco. ¿Vos estás bien?', en: '' },
      { id: 'M6_2_030', personaje: 'VASCO', cara: 'vasco_neutro', hold: 0,
        es: '(se queda pensando la respuesta demasiado tiempo) ...Sí. Vamos, que el chocolate se enfría.', en: '' },
      { id: 'M6_2_040', personaje: null, cara: null, hold: 0,
        es: 'Nadie le da importancia.', en: '' },
    ],
  },
  STORYM6_TARJETA: {
    id: 'STORYM6_TARJETA', tipo: 'TARJETA',
    titulo: 'MISIÓN 7 — 25 DE MAYO',
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
      { id: 'M6_EPI_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '¡Vasco! ¡Eyectate! ¡SALTÁ, VASCO, SALTÁ!', en: '' },
      { id: 'M6_EPI_030', personaje: null, cara: null, hold: 0,
        es: 'Un ruido corto, ni una palabra: el sonido de alguien que va a decir algo y no llega. Estática.', en: '' },
      { id: 'M6_EPI_040', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: '(después de mucho, la voz quebrada) Plata Fiel... a casa. Volvemos a casa.', en: '' },
    ],
  },
  M6_LOCKER1: {
    id: 'M6_LOCKER1', tipo: 'VN',
    titulo: 'EL LOCKER', placa: 'm13_carta_locker', img: 'M6_LOCKER1',
    lineas: [
      { id: 'M6_LOCKER1_010', personaje: null, cara: null, hold: 0,
        es: 'Esa noche el Turco junta las cosas del Vasco en una caja de cartón, solo, sin que nadie se lo pida. En la puerta del locker, la foto de siempre: la que vieron cien veces.', en: '' },
      { id: 'M6_LOCKER1_020', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '(con una ternura triste) La casada... Turco, dejámela ver una última vez.', en: '' },
      { id: 'M6_LOCKER1_030', personaje: null, cara: null, hold: 0,
        es: 'El Turco la despega con un cuidado de cirujano. Y al ir a envolverla en el pañuelo, la da vuelta. Seis misiones de chistes y nadie, nunca, había hecho ese gesto.', en: '' },
    ],
  },
  M6_LOCKER2: {
    id: 'M6_LOCKER2', tipo: 'VN',
    titulo: 'EL DORSO', placa: 'm7_foto_dorso', img: 'M6_LOCKER2',
    lineas: [
      { id: 'M6_LOCKER2_010', personaje: null, cara: null, hold: 0,
        es: 'Rosa Elena Arrieta. 1926 – 1961. "Te amo, mamá. Perdoname."', en: '' },
      { id: 'M6_LOCKER2_020', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: '(bajo, casi para sí) Sesenta y uno.', en: '' },
      { id: 'M6_LOCKER2_030', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: 'El Vasco tenía quince años.', en: '' },
      { id: 'M6_LOCKER2_040', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '(la voz rota) Toda la guerra lo cargamos con la casada. Y estaba muerta. Y el tipo nunca dijo nada. Nos dejó reír. Nos regaló el chiste para que tuviéramos de qué reírnos.', en: '' },
      { id: 'M6_LOCKER2_050', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        es: '(guardándola en el bolsillo del mameluco) Me la quedo yo hasta que vuelva a su casa. Señora: su hijo fue el mejor de todos nosotros.', en: '' },
    ],
  },
  M6_CARTA: {
    id: 'M6_CARTA', tipo: 'TIERRA',
    titulo: 'CARTA DE MATEO', placa: 'p1c_cuaderno', img: 'carta8_m7',
    lineas: [
      { id: 'M6_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Pá: perdí a alguien hoy. Ramírez, el jujeño de la radio. Dieciocho, como yo. Estábamos hablando de qué íbamos a comer primero al volver y en la mitad de la palabra "tamales" dejó de estar. Así de rápido, pá. Así de nada.', en: '' },
      { id: 'M6_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'El Colorado me dijo "llorá todo hoy, pibe, que mañana no va a haber tiempo". Lloré todo, viejo.', en: '' },
      { id: 'M6_CARTA_030', personaje: null, cara: null, hold: 0,
        es: '¿Vos también perdés gente ahí arriba? ¿Cómo se hace? Contame cómo se hace, porque yo no sé. Mateo.', en: '' },
    ],
  },
  M6_PADRE: {
    id: 'M6_PADRE', tipo: 'CARTA',
    titulo: 'LA CARTA DEL PADRE · I', placa: 'p3b_papeles', img: 'M6_PADRE',
    lineas: [
      { id: 'M6_PADRE_010', personaje: null, cara: null, hold: 0,
        es: 'Hijo: me preguntaste cómo se hace cuando se te muere alguien al lado. Estuve seis horas pensando la respuesta y todavía no la tengo.', en: '' },
      { id: 'M6_PADRE_020', personaje: null, cara: null, hold: 0,
        es: 'Hoy perdí a un amigo. Se llamaba Iñaki y resulta que la foto que llevaba era de la madre.', en: '' },
      { id: 'M6_PADRE_030', personaje: null, cara: null, hold: 0,
        es: 'La verdad es que no se hace nada. No hay truco. Uno se sube al avión al otro día porque...', en: '' },
      { id: 'M6_PADRE_040', personaje: null, cara: null, hold: 0,
        es: '(Tacha la última línea entera. Dobla la hoja en cuatro sin terminarla y se la guarda en el bolsillo del pecho. Apaga la luz.)', en: '' },
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
        es: '(lo mira largo; sabe exactamente lo que le está pidiendo) ...Tenés treinta segundos de desvío y ni uno más. Y si me preguntan, yo no vi nada.', en: '' },
      { id: 'M7_2_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'Nadie vio nada. Andá a saludar al pibe, Tero.', en: '' },
    ],
  },
  STORYM7_TARJETA: {
    id: 'STORYM7_TARJETA', tipo: 'TARJETA',
    titulo: 'MISIÓN 8 — EL BATIR DE ALAS',
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
      { id: 'M7_SOBREVUELO_040', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: '(radio, suave) Vamos, Tero. Vamos a casa.', en: '' },
    ],
  },
  M7_CARTA: {
    id: 'M7_CARTA', tipo: 'TIERRA',
    titulo: 'LA CARTA DEL CIELO', placa: 'p1c_cuaderno', img: 'carta9_m8',
    lineas: [
      { id: 'M7_CARTA_010', personaje: null, cara: null, hold: 0,
        es: '¡¡PÁ!! TE VI. Hoy pasó un Skyhawk tan bajo que la turba tembló, y batió las alas, UNA A CADA LADO, y yo GRITÉ, pá, grité tu nombre delante de todos y no me importó nada.', en: '' },
      { id: 'M7_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'Los pibes saltaban y me abrazaban a mí, "¡es el viejo del flaco!", y por un minuto entero acá abajo NADIE tuvo frío.', en: '' },
      { id: 'M7_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'Hoy dibujé la mejor página del cuaderno: el monte entero desde arriba, como lo habrás visto vos, y todos nosotros chiquitos saludando. Ésta te la doy en la mano cuando vuelvas.', en: '' },
      { id: 'M7_CARTA_040', personaje: null, cara: null, hold: 0,
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
        es: 'Murieron 12 hombres, entre ellos su capitán, Ian North, que murió ayudando a evacuar a su tripulación.', en: '' },
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
        es: '(honesto, porque el pibe merece la verdad) No sé, Pichón. Pero sirvió. Cada vez que entramos, allá abajo hay un pibe que respira un día más. Para eso sirve. No para la bandera del mástil: para el pibe. Siempre fue por el pibe.', en: '' },
      { id: 'M8_2_020', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: '(pensando en un cuaderno agitándose contra el cielo) ...por el pibe.', en: '' },
    ],
  },
  STORYM8_TARJETA: {
    id: 'STORYM8_TARJETA', tipo: 'TARJETA',
    titulo: 'MISIÓN 9 — EL PIBE',
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
        es: '(sorprendido, casi un nene) ...ah. Me dieron. ¿Capitán? Me dieron. No quiero... todavía no quiero—', en: '' },
      { id: 'M8_EPI_030', personaje: null, cara: null, hold: 0,
        es: 'Estática. El mar.', en: '' },
      { id: 'M8_EPI_040', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '¡Era un pibe, Puma! ¡Lo trajimos a la guerra y era un PIBE!', en: '' },
      { id: 'M8_EPI_050', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: 'Venía para mí. Ese fierro venía para mí y se lo comió él.', en: '' },
    ],
  },
  M8_LIBRETA: {
    id: 'M8_LIBRETA', tipo: 'VN',
    titulo: 'LA LIBRETA', placa: 'm9_libreta', img: 'M8_LIBRETA',
    lineas: [
      { id: 'M8_LIBRETA_010', personaje: null, cara: null, hold: 0,
        es: 'Esa noche el Turco junta las cosas del Pichón. Debajo del catre, una libreta de tapas de hule: hojas cuadriculadas llenas de flechitas, cortes de fuselaje, cálculos al margen, aviones imposibles.', en: '' },
      { id: 'M8_LIBRETA_020', personaje: null, cara: null, hold: 0,
        es: 'Página tras página de ideas que nadie va a escuchar en el "eso no se puede / a ver, mostrame". La guarda en el bolsillo del mameluco. El otro bolsillo.', en: '' },
      { id: 'M8_LIBRETA_030', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        es: '(a la libreta, bajito) ...Vos y yo tenemos trabajo, pibe.', en: '' },
    ],
  },
  M8_CARTA: {
    id: 'M8_CARTA', tipo: 'TIERRA',
    titulo: 'CARTA DE MATEO · CLARIBEL', placa: 'p1c_cuaderno', img: 'carta10_m9',
    lineas: [
      { id: 'M8_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Pá: repartieron cartas de escuelas, "para un soldado argentino", de pibes que no nos conocen. A mí me tocó la de una nena de nueve años, Claribel, de Villa Mercedes, San Luis.', en: '' },
      { id: 'M8_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'Me dice: "Querido soldado: no te conozco pero te quiero. Mi seño dice que estás cuidando algo nuestro. Cuidate vos también. Cuando seas viejito contame cómo era el mar de ahí."', en: '' },
      { id: 'M8_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'Lloré como un tonto, pá. Una nena que no me conoce me pidió que llegue a viejo. Le voy a contestar que sí. Es la única orden que pienso cumplir a rajatabla.', en: '' },
      { id: 'M8_CARTA_040', personaje: null, cara: null, hold: 0,
        es: 'Tengo miedo, te lo digo por primera vez. Pero si pasa algo, quiero que sepas que no te guardo nada. Sé que moviste todo. Un padre no puede más que todo. Mateo.', en: '' },
    ],
  },
  M8_PADRE: {
    id: 'M8_PADRE', tipo: 'CARTA',
    titulo: 'LA CARTA DEL PADRE · II', placa: 'p3b_papeles', img: 'M8_PADRE',
    lineas: [
      { id: 'M8_PADRE_010', personaje: null, cara: null, hold: 0,
        es: 'Hijo: te escribo de nuevo porque la primera no me salió. Hoy se me murió otro. Tomás, veintidós años, le decíamos Pichón. Se comió un fierro que venía para mí.', en: '' },
      { id: 'M8_PADRE_020', personaje: null, cara: null, hold: 0,
        es: 'Decís que un padre no puede más que todo. Yo no hice todo, Mateo. Hice lo que me animé.', en: '' },
      { id: 'M8_PADRE_030', personaje: null, cara: null, hold: 0,
        es: 'Vos me pediste que te mienta, que te diga que desde arriba es lindo. Y yo agarré el papel para mentirte, te juro. Pero si te miento con esto, ¿para qué carajo sirve que sea tu padre.', en: '' },
      { id: 'M8_PADRE_040', personaje: null, cara: null, hold: 0,
        es: '(Sin signo de pregunta. La frase se corta ahí. Dobla la hoja.)', en: '' },
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
        es: '(como quien informa el clima) No. Se te suma otro y otro y otro, y un día te das cuenta de que ya no te entra más, y seguís volando igual. Eso es todo el secreto, Tero. No hay más secreto que ese.', en: '' },
    ],
  },
  STORYM9_TARJETA: {
    id: 'STORYM9_TARJETA', tipo: 'TARJETA',
    titulo: 'MISIÓN 11 — LO QUE NO SE DICE',
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
    titulo: 'CARTA DE MATEO', placa: 'p1c_cuaderno', img: 'carta12_m11',
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
    titulo: 'MISIÓN 12 — EL ÁNGEL DE CORRIENTES',
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
        es: '¡Abajo, correntino! ¡ABAJO!', en: '' },
      { id: 'M10_TIERRA_030', personaje: null, cara: null, hold: 0,
        es: 'Correa empuja a Mateo al fondo del pozo y le pone el cuerpo encima. Blanco. Humo. Tierra que llueve. Mateo abajo, entero. Correa arriba, no.', en: '' },
      { id: 'M10_TIERRA_040', personaje: 'CORREA', cara: null, hold: 0,
        es: '(apenas, buscándole la mano) ...andá a Corrientes igual, pibe. Presentate solo. Decile a mi hermana que su hermano cuidó a un pibe hasta el final. Que no fue en vano. Que no fue...', en: '' },
    ],
  },
  M10_PISTA: {
    id: 'M10_PISTA', tipo: 'VN',
    titulo: 'SIN CARTA', placa: 'pista_lluvia', img: 'M10_PISTA',
    lineas: [
      { id: 'M10_PISTA_010', personaje: null, cara: null, hold: 0,
        es: 'Esteban vuelve sin saber nada. En la pista pregunta si hay carta. No hay. Es la primera vez que no hay.', en: '' },
      { id: 'M10_PISTA_020', personaje: null, cara: null, hold: 0,
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
        es: 'Ahora entiendo algo horrible, pá. Acá siempre hubo dos clases de conscripto: los que tienen un ángel y los que no. Yo tuve el mejor. Se me murió el ángel, viejo.', en: '' },
      { id: 'M10_CARTA_030', personaje: null, cara: null, hold: 0,
        es: 'Un pibe de acá talló VOLVEREMOS en la culata del fusil. Yo lo único que quiero es que volvamos nosotros.', en: '' },
      { id: 'M10_CARTA_040', personaje: null, cara: null, hold: 0,
        es: 'Vení a buscarme. Ya sé que no se puede. Vení igual. Sos lo único que me queda. Mateo.', en: '' },
    ],
  },
  M10_PADRE: {
    id: 'M10_PADRE', tipo: 'CARTA',
    titulo: 'LA CARTA DEL PADRE · III', placa: 'p3b_papeles', img: 'M10_PADRE',
    lineas: [
      { id: 'M10_PADRE_010', personaje: null, cara: null, hold: 0,
        es: 'Mateo: se me murió el hombre que yo mandé para que no te murieras vos. Lo elegí yo. Lo puse yo ahí. Un padre mueve lo que puede y después tiene que vivir con lo que movió.', en: '' },
      { id: 'M10_PADRE_020', personaje: null, cara: null, hold: 0,
        es: 'Vos me pedís que vaya a buscarte y yo te tengo que decir que no se puede, y no te lo voy a decir, porque no pienso escribir esa frase.', en: '' },
      { id: 'M10_PADRE_030', personaje: null, cara: null, hold: 0,
        es: 'Así que voy a ir.', en: '' },
      { id: 'M10_PADRE_040', personaje: null, cara: null, hold: 0,
        es: '(Es lo único que escribió sin tachar en toda la carta. Cuatro palabras. Dobla la hoja.)', en: '' },
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
        es: 'Es un viaje de ida, Tero. Y la Chancha está en tierra, rota. Sin Chancha no hay nafta de vuelta. ¿Entendés lo que te digo? No hay vuelta.', en: '' },
      { id: 'M11_2_030', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: 'Entonces no me pidas que vuelva. Pedime que llegue.', en: '' },
      { id: 'M11_2_040', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: '(sin un solo chiste) No va solo. Ni en pedo va solo. Cuarenta días le cebé mate a este tipo.', en: '' },
      { id: 'M11_2_050', personaje: 'PUMA', cara: 'puma_neutro', hold: 0,
        es: '(sonríe por primera vez en tres misiones) ...Plata Fiel completa, entonces. Una vez más. La última.', en: '' },
    ],
  },
  STORYM11_TARJETA: {
    id: 'STORYM11_TARJETA', tipo: 'TARJETA',
    titulo: 'MISIÓN 13 — LA ÚLTIMA MESA',
    lineas: [
      { id: 'STORYM11_TARJETA_010', personaje: null, cara: null, hold: 0,
        es: '11 de junio de 1982 · HMS BROADSWORD', en: '' },
    ],
  },
  M11_ASADO1: {
    id: 'M11_ASADO1', tipo: 'VN',
    titulo: 'EL ÚLTIMO ASADO', placa: 'fogon', img: 'M11_ASADO1',
    lineas: [
      { id: 'M11_ASADO1_010', personaje: null, cara: null, hold: 0,
        es: 'Detrás del hangar, un medio tambor con brasas. El Turco consiguió carne, nadie pregunta cómo. Gitano canta bajito una zamba, desafinando con dignidad.', en: '' },
      { id: 'M11_ASADO1_020', personaje: null, cara: null, hold: 0,
        es: 'Sobre la mesa, contra la damajuana, la foto de la vieja del Vasco. Al lado, la libreta del Pichón. Los que no están en la mesa, en la mesa.', en: '' },
      { id: 'M11_ASADO1_030', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'Che, ¿saben que mañana debuta Argentina en el Mundial? Acá también juega Argentina mañana. Pero este partido no lo pasan por la tele.', en: '' },
    ],
  },
  M11_ASADO2: {
    id: 'M11_ASADO2', tipo: 'VN',
    titulo: 'LA ÚNICA VEZ QUE EL GITANO HABLA EN SERIO', placa: 'fogon', img: 'M11_ASADO2',
    lineas: [
      { id: 'M11_ASADO2_010', personaje: 'GITANO', cara: 'gitano_neutro', hold: 0,
        es: 'El "perdoname" del Vasco no me lo puedo sacar. Yo sé lo que es tener algo que pedirle perdón a la vieja de uno. Mi viejo pegaba. Y un día decidí que yo iba a ser exactamente lo contrario de eso. Así que no, muchachos: no soy gracioso. Soy lo contrario de mi viejo. Es distinto. Cuesta más.', en: '' },
      { id: 'M11_ASADO2_020', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        es: '(después de un rato largo) Te salió bien, cordobés.', en: '' },
      { id: 'M11_ASADO2_030', personaje: 'ESTEBAN', cara: 'tero_neutro', hold: 0,
        es: '(mirando la foto) ¿Me la prestás mañana? Que la vieja vuele una vez con la escuadrilla del hijo.', en: '' },
      { id: 'M11_ASADO2_040', personaje: 'EL TURCO', cara: 'turco_ternura', hold: 0,
        es: '(alzando el vaso de vino en tetra) Por los que no están en la mesa.', en: '' },
      { id: 'M11_ASADO2_050', personaje: 'TODOS', cara: null, hold: 0,
        es: 'Por los que no están.', en: '' },
    ],
  },
  M11_CARTA: {
    id: 'M11_CARTA', tipo: 'TIERRA',
    titulo: 'LA ÚLTIMA CARTA · SIN COPIAR', placa: 'p1c_cuaderno',
    lineas: [
      { id: 'M11_CARTA_010', personaje: null, cara: null, hold: 0,
        es: 'Viejo: no sé si esta carta va a salir. Ya casi no sale nada de acá. La escribo igual, porque escribirte es la única costumbre buena que me queda.', en: '' },
      { id: 'M11_CARTA_020', personaje: null, cara: null, hold: 0,
        es: 'Quedamos los pibes solos, cuidándonos entre nosotros. Nos tapamos, nos repartimos, nos aguantamos. En el peor lugar del mundo todavía hay pibes tapando a otros pibes. Eso también es la Patria, pá. Eso, y no los discursos.', en: '' },
      { id: 'M11_CARTA_030', personaje: null, cara: null, hold: 0,
        es: '¿Sabés qué me sostiene? La página del cuaderno del día que batiste las alas. Cuando pega el miedo la abro y me digo: mi viejo me vio. No estoy solo ni aunque esté solo.', en: '' },
    ],
  },
  M11_CARTA2: {
    id: 'M11_CARTA2', tipo: 'TIERRA',
    titulo: 'LA ÚLTIMA CARTA · II', placa: 'p1c_cuaderno', img: 'carta14_m13',
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
  M11_PADRE: {
    id: 'M11_PADRE', tipo: 'CARTA',
    titulo: 'LA CARTA DEL PADRE · IV', placa: 'p3b_papeles', img: 'M11_PADRE',
    lineas: [
      { id: 'M11_PADRE_010', personaje: null, cara: null, hold: 0,
        es: 'Hijo: mañana salgo a buscarte. Te debo dos respuestas y te las pago las dos juntas antes de subirme, porque después no sé.', en: '' },
      { id: 'M11_PADRE_020', personaje: null, cara: null, hold: 0,
        es: 'Cómo se ve desde arriba: se ve chiquito todo. No es lindo, Mateo. Me pediste que te mintiera y no puedo. Lo único lindo que vi desde arriba en toda esta guerra fue a vos, con el cuaderno, saludando.', en: '' },
      { id: 'M11_PADRE_030', personaje: null, cara: null, hold: 0,
        es: 'Y cómo se hace cuando se te muere alguien al lado: no se hace. Se aguanta. Y se va a buscar al que queda.', en: '' },
      { id: 'M11_PADRE_040', personaje: null, cara: null, hold: 0,
        es: 'Perdoname por no haberte podido sacar de ahí. Lo intenté todo. Resulta que todo era poco.', en: '' },
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
    titulo: 'MISIÓN 14 — EL TERO',
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
      { id: 'M12_FINAL_020', personaje: null, cara: null, hold: 0,
        es: 'El avión enfila a casa, obediente. Y entonces —fuera de toda orden, porque hay cosas que un padre no delega— el motor se apaga.', en: '' },
      { id: 'M12_FINAL_030', personaje: null, cara: null, hold: 0,
        es: 'Tenía el combustible justo para volver. No tenía las ganas. Un padre no vuelve de algunos lugares.', en: '' },
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
  EPI_MESA2: {
    id: 'EPI_MESA2', tipo: 'VN',
    titulo: 'LAS DOS ENCOMIENDAS', placa: 'mesa_dos_papeles', img: 'EPI_MESA2',
    lineas: [
      { id: 'EPI_MESA2_010', personaje: null, cara: null, hold: 0,
        es: 'Meses después llegan dos encomiendas. En la del Ejército, un cuaderno Rivadavia hinchado de humedad: un arroyo, un Rastrojero, un padre y un nene tirando piedritas. El Colorado con capa. El monte visto desde arriba.', en: '' },
      { id: 'EPI_MESA2_020', personaje: null, cara: null, hold: 0,
        es: 'En la de la Fuerza Aérea: un pincel finito manchado de blanco, la foto de una mujer joven que Norma no conoce —la da vuelta, porque una madre siempre da vuelta las fotos— y una hoja llena de tachones, sin firmar y sin sobre.', en: '' },
      { id: 'EPI_MESA2_030', personaje: null, cara: null, hold: 0,
        es: 'Pone el cuaderno abierto de un lado de la mesa y la carta abierta del otro. Derechitos, uno frente al otro, como los dos platos.', en: '' },
      { id: 'EPI_MESA2_040', personaje: null, cara: null, hold: 0,
        es: 'Nunca se leyeron. Vos los leíste a los dos.', en: '' },
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
  storyM1: ['P1_2', 'P2_3', 'P3_4', 'P4_1', 'M1_3', 'M1_5B', 'STORYM1_TARJETA'],
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
  epiM7: ['M6_EPI', 'M6_LOCKER1', 'M6_LOCKER2', 'M6_CARTA', 'M6_PADRE', 'M6_HIST'],
  storyM8: ['M7_1', 'M7_2', 'STORYM7_TARJETA'],
  epiM8: ['M7_SOBREVUELO', 'M7_CARTA', 'M7_HIST'],
  storyM9: ['M8_1', 'M8_2', 'STORYM8_TARJETA'],
  epiM9: ['M8_EPI', 'M8_LIBRETA', 'M8_CARTA', 'M8_PADRE'],
  storyM10: ['M10_HUECO', 'M10_TARJETA'],
  epiM10: ['M10_TANDIL', 'M10_NOTICIA', 'M10_CUADERNO', 'M10_MIRAGE'],
  storyM11: ['M9_1', 'STORYM9_TARJETA'],
  epiM11: ['M9_EPI', 'M9_CARTA', 'M9_HIST'],
  storyM12: ['M10_1', 'STORYM10_TARJETA'],
  epiM12: ['M10_TIERRA', 'M10_PISTA', 'M10_CARTA', 'M10_PADRE', 'M10_HIST'],
  storyM13: ['M11_1', 'M11_2', 'STORYM11_TARJETA'],
  epiM13: ['M11_ASADO1', 'M11_ASADO2', 'M11_CARTA', 'M11_CARTA2', 'M11_PADRE'],
  storyM14: ['M12_1', 'M12_2', 'STORYM12_TARJETA'],
  epiM14: ['M12_GITANO', 'M12_PUMA', 'M12_TARDE', 'M12_FINAL', 'EPI_MESA1', 'EPI_MESA2', 'M12_HIST'],
};
