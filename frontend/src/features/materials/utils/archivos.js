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
