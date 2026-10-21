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
