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
