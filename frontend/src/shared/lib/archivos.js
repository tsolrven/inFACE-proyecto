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
