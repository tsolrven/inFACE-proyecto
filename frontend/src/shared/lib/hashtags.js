// Deben coincidir con backend/src/shared/hashtags/hashtags.validation.js
export const HASHTAGS_MAX = 10;
export const HASHTAG_MAX_LARGO = 30;

// Forma canónica de un hashtag: sin '#', en minúsculas y sin tildes, pero
// conservando la ñ. Debe dar el mismo resultado que normalizarHashtag del backend.
export function normalizarHashtag(valor = '') {
  return valor
    .trim()
    .replace(/^#+/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/n\u0303/g, '\u00f1')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizarHashtags(texto = '') {
  return [
    ...new Set(
      texto
        .split(/[\s,]+/)
        .map(normalizarHashtag)
        .filter(Boolean),
    ),
  ];
}

// Mismo patrón y mensajes que backend/src/shared/hashtags/hashtags.validation.js
const HASHTAG_PATRON = /^[a-z0-9_\u00f1]+$/;

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

// Ruta de la página de un hashtag. `pestana`: 'materiales' (por defecto) o 'foro'.
export function rutaHashtag(tag, pestana = 'materiales') {
  const base = `/hashtag/${encodeURIComponent(tag)}`;
  return pestana === 'materiales' ? base : `${base}?pestana=${pestana}`;
}
