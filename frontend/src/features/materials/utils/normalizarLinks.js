export function normalizarLinks(links = []) {
  return [...new Set(links.map((l) => l.trim()).filter(Boolean))];
}
