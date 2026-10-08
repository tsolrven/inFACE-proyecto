// Borra todo lo que "cuelga" de un contenido en tablas polimórficas (sin FK).
// Recibe `tx` para ejecutarse dentro de la misma transacción que el borrado.
async function eliminarInteracciones(tx, tipo_contenido, ids) {
  if (ids.length === 0) return;

  const where = { tipo_contenido, contenido_id: { in: ids } };

  await tx.voto.deleteMany({ where });
  await tx.guardado.deleteMany({ where });
  await tx.reporte.deleteMany({ where });
}

export { eliminarInteracciones };
