import { prisma } from '../../config/configDb.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/appError.js';
import { hoyEnChile } from '../../shared/auth/cargos.js';
import {
  TIPOS_ACCION_ADMIN,
  registrarAccionAdmin,
} from '../../shared/moderation/adminActions.js';
import { notificar } from '../../shared/notifications/notifications.service.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const ETIQUETA_CARGO = { cee: 'CEE', tutor: 'tutor' };

// 'YYYY-MM-DD' de una fecha @db.Date (viene a medianoche UTC).
const aDia = (fecha) => fecha.toISOString().slice(0, 10);

// Revoca un cargo antes de su vencimiento. El motivo se guarda en la
// asignación (lo ven solo los superadmins); NO se copia al historial.
async function revocarCargo(id, adminId, motivo) {
  const asignacion = await prisma.$transaction(async (tx) => {
    const filas = await tx.$queryRaw`SELECT id FROM "asignaciones_rol" WHERE id = ${id} FOR UPDATE`;
    if (filas.length === 0) throw new NotFoundError('Cargo');

    const actual = await tx.asignacionRol.findUnique({
      where: { id },
      include: { carrera: { select: { id: true, nombre: true } } },
    });

    if (actual.usuario_id === adminId) {
      throw new ForbiddenError(
        'No puedes revocar tu propio cargo: debe hacerlo otro moderador',
      );
    }
    if (actual.revocada_en) {
      throw new ConflictError('El cargo ya fue revocado');
    }
    if (actual.hasta < hoyEnChile()) {
      throw new ConflictError('El cargo ya venció');
    }

    const revocada = await tx.asignacionRol.update({
      where: { id },
      data: {
        revocada_en: new Date(),
        revocada_por: adminId,
        motivo_revocacion: motivo,
      },
      include: { carrera: { select: { id: true, nombre: true } } },
    });

    await registrarAccionAdmin(tx, {
      admin_id: adminId,
      tipo: TIPOS_ACCION_ADMIN.CARGO_REVOCADO,
      entidad_tipo: 'asignacion_rol',
      entidad_id: id,
      afectado_id: actual.usuario_id,
      detalle: {
        tipo: actual.tipo,
        carrera_id: actual.carrera_id,
        desde: aDia(actual.desde),
        hasta: aDia(actual.hasta),
      },
    });

    return revocada;
  });

  // Después del commit; notificar() no lanza. No se muestra el motivo al
  // afectado: es información de moderación.
  await notificar({
    usuarioId: asignacion.usuario_id,
    actorId: adminId,
    tipo: 'cargo_revocado',
    titulo: 'Tu cargo fue revocado',
    mensaje: `Tu cargo de ${ETIQUETA_CARGO[asignacion.tipo]} en ${asignacion.carrera.nombre} fue revocado por la administración.`,
    enlace: '/solicitar-cargo',
  });

  return {
    id: asignacion.id,
    tipo: asignacion.tipo,
    carrera: asignacion.carrera,
    desde: asignacion.desde,
    hasta: asignacion.hasta,
    revocada_en: asignacion.revocada_en,
    motivo_revocacion: asignacion.motivo_revocacion,
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { revocarCargo };