//! determina si un contenido fue editado comparando su fecha de creación vs actualización

export function fueEditado(creado_en, actualizado_en) {
  if (!actualizado_en) return false;
  const creado = new Date(creado_en).getTime();
  const actualizado = new Date(actualizado_en).getTime();
  return actualizado - creado > 2000;
}
