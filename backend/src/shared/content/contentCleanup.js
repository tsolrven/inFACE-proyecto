import { cerrarReportesPorEliminacion } from '../moderation/reports.closure.js';

// Borra los votos y guardados que "cuelgan" de un contenido en tablas
// polimórficas (sin FK). Los reportes NO se borran: se cierran con
// cerrarReportesPorEliminacion para conservar el historial de moderación.
// Recibe `tx` para ejecutarse dentro de la misma transacción que el borrado.
async function eliminarInteracciones(tx, tipo_contenido, ids) {
  if (ids.length === 0) return;

  const where = { tipo_contenido, contenido_id: { in: ids } };

  await tx.voto.deleteMany({ where });
  await tx.guardado.deleteMany({ where });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Borra todo lo que cuelga de un contenido (comentarios, archivos y las
// interacciones de ambos) y cierra sus reportes. Debe llamarse DENTRO de una
// transacción.
// NO borra la fila del contenido en sí (apunte, hilo, anuncio): eso lo hace
// cada módulo, porque cada uno tiene su propio modelo. Tampoco debe borrarse
// antes de llamar aquí: el snapshot de los reportes lee esa fila.
//
// `por_moderacion`: true si elimina el staff, false si elimina el autor.
// Devuelve los archivos para borrarlos del disco DESPUÉS del commit, y los
// reportes cuyo correo hay que enviar también después del commit.
async function eliminarContenido(
  tx,
  tipo_contenido,
  id,
  {
    por_moderacion,
    por_arrastre = false,
    revisor_id = null,
    respuesta = null,
  },
) {
  const [comentarios, archivos] = await Promise.all([
    tx.comentario.findMany({
      where: { tipo_contenido, contenido_id: id },
      select: { id: true },
    }),
    tx.archivo.findMany({ where: { tipo_contenido, contenido_id: id } }),
  ]);
  const idsComentarios = comentarios.map((c) => c.id);

  // reportes del contenido: lo que decida la moderación o el autor
  const { reportes_a_notificar } = await cerrarReportesPorEliminacion(tx, {
    tipo_contenido,
    ids: [id],
    por_moderacion,
    por_arrastre,
    revisor_id,
    respuesta,
  });
  // reportes de sus comentarios: caen por arrastre, nadie los revisó (sin correo)
  await cerrarReportesPorEliminacion(tx, {
    tipo_contenido: 'comentario',
    ids: idsComentarios,
    por_moderacion: false,
    por_arrastre: true,
  });

  await eliminarInteracciones(tx, 'comentario', idsComentarios);
  await eliminarInteracciones(tx, tipo_contenido, [id]);

  await tx.comentario.deleteMany({
    where: { tipo_contenido, contenido_id: id },
  });
  await tx.archivo.deleteMany({ where: { tipo_contenido, contenido_id: id } });

  return { archivos, reportes_a_notificar };
}

export { eliminarInteracciones, eliminarContenido };