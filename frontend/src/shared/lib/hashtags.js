// Deben coincidir con backend/src/shared/hashtags/hashtags.validation.js
export const HASHTAGS_MAX = 10;
export const HASHTAG_MAX_LARGO = 30;

export function normalizarHashtags(texto = '') {
  return [
    ...new Set(
      texto
        .split(/[\s,]+/)
        .map((t) => t.trim().replace(/^#+/, '').toLowerCase())
        .filter(Boolean),
    ),
  ];
}

// Mismo patrón y mensajes que backend/src/shared/hashtags/hashtags.validation.js
const HASHTAG_PATRON = /^[a-zA-Z0-9_]+$/;

// Recibe la lista ya normalizada. Devuelve el mensaje de error o null.
export function validarHashtags(lista) {
  if (lista.length > HASHTAGS_MAX) {
    return `No puedes agregar más de ${HASHTAGS_MAX} hashtags`;
  }
  if (lista.some((t) => t.length > HASHTAG_MAX_LARGO)) {
    return `Cada hashtag no puede superar ${HASHTAG_MAX_LARGO} caracteres`;
  }
  if (lista.some((t) => !HASHTAG_PATRON.test(t))) {
    return 'Los hashtags solo pueden tener letras, números y guiones bajos';
  }
  return null;
}