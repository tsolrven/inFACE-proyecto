// Niveles de respuesta permitidos: 0 (raíz) hasta MAX_NIVEL_COMENTARIO.
// Debe coincidir con COMENTARIO_MAX_NIVEL del frontend (shared/post/comments/constants.js).
export const MAX_NIVEL_COMENTARIO = 10;

// Respuestas que viajan ya cargadas junto a cada comentario de una página,
// y cuántos niveles hacia abajo. Lo demás se pide con "ver más respuestas".
export const RESPUESTAS_PRECARGADAS = 3;
export const NIVELES_PRECARGADOS = 2;

export const ORDENES_COMENTARIO = ['mejores', 'nuevos', 'antiguos'];
