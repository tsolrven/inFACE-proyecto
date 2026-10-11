// Borra todo lo que "cuelga" de un contenido en tablas polimórficas (sin FK).
// Recibe `tx` para ejecutarse dentro de la misma transacción que el borrado.
async function eliminarInteracciones(tx, tipo_contenido, ids) {
  if (ids.length === 0) return;

  const where = { tipo_contenido, contenido_id: { in: ids } };

  await tx.voto.deleteMany({ where });
  await tx.guardado.deleteMany({ where });
  await tx.reporte.deleteMany({ where });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Borra todo lo que cuelga de un contenido (comentarios, archivos y las
// interacciones de ambos). Debe llamarse DENTRO de una transacción.
// NO borra la fila del contenido en sí (apunte, hilo, anuncio): eso lo hace
// cada módulo, porque cada uno tiene su propio modelo.
// Devuelve los archivos para borrarlos del disco DESPUÉS del commit.
async function eliminarContenido(tx, tipo_contenido, id) {
  const [comentarios, archivos] = await Promise.all([
    tx.comentario.findMany({
      where: { tipo_contenido, contenido_id: id },
      select: { id: true },
    }),
    tx.archivo.findMany({ where: { tipo_contenido, contenido_id: id } }),
  ]);

  await eliminarInteracciones(
    tx,
    'comentario',
    comentarios.map((c) => c.id),
  );
  await eliminarInteracciones(tx, tipo_contenido, [id]);

  await tx.comentario.deleteMany({
    where: { tipo_contenido, contenido_id: id },
  });
  await tx.archivo.deleteMany({ where: { tipo_contenido, contenido_id: id } });

  return { archivos };
}

export { eliminarInteracciones, eliminarContenido };
