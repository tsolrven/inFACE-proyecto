import { prisma } from '../config/configDb.js';
import { ForbiddenError, NotFoundError } from '../errors/appError.js';

/*
 * Verifica que el usuario sea el creador del proyecto o superadmin
 */
export async function verificarCreador(req, res, next) {
    try {
        const proyectoId = req.params.id;
        const usuarioId = req.usuario.id;
        const rol = req.usuario.rol;

        // Buscar el proyecto
        const proyecto = await prisma.proyecto.findUnique({
            where: { id: proyectoId },
            select: { creador_id: true }
        });

        if (!proyecto) {
            throw new NotFoundError('Proyecto no encontrado');
        }

        // Verificar si es el creador o superadmin
        if (proyecto.creador_id !== usuarioId && rol !== 'superadmin') {
            throw new ForbiddenError('No tienes permiso para realizar esta acción');
        }

        next();
    } catch (error) {
        next(error);
    }
}