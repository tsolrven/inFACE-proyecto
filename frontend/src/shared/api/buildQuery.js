// Convierte un objeto de filtros en query string, omitiendo null/undefined/''.
export function buildQuery(params = {}) {
  const filtrados = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  );
  return new URLSearchParams(filtrados).toString();
}
