export const claveArchivo = (f) => `${f.name}-${f.size}-${f.lastModified}`;

export function agregarArchivosSinDuplicar(actuales, nuevos) {
  const vistas = new Set(actuales.map(claveArchivo));
  const unicos = [];
  for (const f of nuevos) {
    const k = claveArchivo(f);
    if (vistas.has(k)) continue;
    vistas.add(k);
    unicos.push(f);
  }
  return [...actuales, ...unicos];
}

// '.png' (en minúsculas) o '' si no tiene extensión
export function extensionDe(nombre = '') {
  const i = nombre.lastIndexOf('.');
  return i === -1 ? '' : nombre.slice(i).toLowerCase();
}

// '340.0 KB', '2.1 MB', '512 B'; '' si no hay tamaño
export function formatearTamanio(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
