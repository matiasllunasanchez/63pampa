// LAS ESTRUCTURAS — los blancos que NO son buques (pedido del autor, 29/9/2026).
//
// "A futuro quizá haya otros objetivos que no sean buques, sino bases o edificios… El objetivo es el
// mismo, una estructura a la cual se le tira una bomba." Es la MISMA suelta (data/blanco.js): se
// encara, se elige la altura, se suelta y se le pasa por encima. Lo que cambia es QUE hay al final
// del pasillo y SOBRE QUE esta: una estructura va en tierra, en la explanada que la geografia le
// aplana debajo (`blanco:` de la forma en km, core/geografia.js — `alturaBlanco()`).
//
// Una mision la pide con `goal: { kind: 'estructura', nombre, dist }`. El nombre es el renglon de
// esta tabla y el rotulo del objetivo en la barra del HUD.
//
// CADA ESTRUCTURA ES UNA CLASE (`clase`, la llave de su perfil en PERFIL de data/blanco.js) y una
// lista de PIEZAS: que hay en cada tramo de columnas del perfil, para dibujarlo. El perfil decide la
// altura —y por lo tanto donde pega la bomba—; las piezas, solo la pinta.
//   tipo:  'cerco' | 'tanque' | 'barraca' | 'deposito' | 'hangar' | 'torre' | 'antena'
//   de, a: columnas del perfil (0..19, de izquierda a derecha), inclusive
//
// HORNEARLA (pedido del autor 29/9: "puede hornearse a futuro mejor, y variar segun queramos"): una
// estructura puede traer `hoja: '<nombre>'` —una hoja de assets/world/enemies/, como las de los
// buques— y entonces se dibuja con esa hoja en vez de con las piezas. Dos reglas para que la bomba
// siga pegando donde se ve edificio:
//   1. el PERFIL de su clase se RE-MIDE de la hoja, igual que el de los buques (data/blanco.js: alfa
//      > 40 por columna, del borde de abajo al pixel mas alto, en 20 franjas, frame 0);
//   2. la hoja ocupa la eslora entera (BL.LEN) con la base apoyada en el piso.
// Variar: cada estructura nueva es un renglon (su clase, sus piezas o su hoja). Varias pueden
// compartir clase si comparten silueta.

export const ESTRUCTURAS = {
  'BASE COSTERA': {
    clase: 'base',
    piezas: [
      { tipo: 'cerco', de: 0, a: 0 },
      { tipo: 'tanque', de: 1, a: 2 },
      { tipo: 'cerco', de: 3, a: 3 },
      { tipo: 'barraca', de: 4, a: 5 },
      { tipo: 'deposito', de: 6, a: 6 },
      { tipo: 'hangar', de: 7, a: 9 },
      { tipo: 'torre', de: 10, a: 11 },
      { tipo: 'hangar', de: 12, a: 12 },
      { tipo: 'deposito', de: 13, a: 13 },
      { tipo: 'barraca', de: 14, a: 15 },
      { tipo: 'antena', de: 16, a: 16 },
      { tipo: 'cerco', de: 17, a: 17 },
      { tipo: 'tanque', de: 18, a: 18 },
      { tipo: 'cerco', de: 19, a: 19 },
    ],
  },
};

/** La estructura de ese nombre, o null (el nombre no es una estructura: es un buque). */
export const estructura = nombre => ESTRUCTURAS[nombre] || null;
