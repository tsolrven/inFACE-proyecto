import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import { registrarOyenteInteraccion } from '../../shared/content/contentRegistry.js';

async function registrarServidas(usuario_id, items) {
    if (items.length === 0) return;
    try {
        await prisma.recomendacionLog.createMany({
            data: items.map((i) => ({ usuario_id, ...i })),
            skipDuplicates: true,
        });
    } catch (err) {
        logger.warn('No se pudo registrar la recomendación', {
            usuario_id,
            error: err.message,
        });
    }
}

async function registrarEvento(usuario_id, proyecto_id, tipo) {
    try {
        await prisma.interaccionProyecto.create({
            data: { usuario_id, proyecto_id, tipo },
        });
    } catch (err) {
        logger.warn('No se pudo registrar la interacción', {
            usuario_id,
            proyecto_id,
            tipo,
            error: err.message,
        });
    }
}

registrarOyenteInteraccion('proyecto', async ({ clase, usuario_id, contenido_id, estado }) => {
    if (clase === 'voto') {
        const tipo = estado === 'up' ? 'like' : estado === 'down' ? 'dislike' : 'voto_quitado';
        await registrarEvento(usuario_id, contenido_id, tipo);
    } else if (clase === 'comentario') {
        await registrarEvento(usuario_id, contenido_id, 'comentario');
    }
});

export { registrarServidas, registrarEvento };