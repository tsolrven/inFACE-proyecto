import { prisma } from '../../config/configDb.js';
import { ForbiddenError, NotFoundError } from '../../errors/appError.js';

/*
 * Verifica que el usuario sea el creador del proyecto. El superadmin no tiene
 * acceso especial: solo elimina por moderación (eso lo valida el servicio).
 */
export async function verificarCreador(req, res, next) {
  try {
    const proyectoId = req.params.id;
    const usuarioId = req.usuario.id;

    // Buscar el proyecto
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
      select: { creador_id: true },
    });

    if (!proyecto) {
      throw new NotFoundError('Proyecto no encontrado');
    }

    // Verificar si es el creador
    if (proyecto.creador_id !== usuarioId) {
      throw new ForbiddenError('No tienes permiso para realizar esta acción');
    }

    next();
  } catch (error) {
    next(error);
  }
}
