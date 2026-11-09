import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import { registrarOyenteInteraccion } from '../../shared/content/contentRegistry.js';
import { avisarComentario } from '../../shared/notifications/notificarComentario.js';

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

async function notificarComentarioDeProyecto({
  usuario_id,
  contenido_id,
  comentario_id,
  padre_id,
}) {
  if (!comentario_id) return;
  try {
    const proyecto = await prisma.proyecto.findUnique({
      where: { id: contenido_id },
      select: { titulo_proyecto: true, creador_id: true },
    });
    if (!proyecto) return;
    await avisarComentario({
      actorId: usuario_id,
      comentarioId: comentario_id,
      padreId: padre_id,
      duenoId: proyecto.creador_id,
      nombreContenido: proyecto.titulo_proyecto,
      ruta: `/match-proyectos?proyecto=${contenido_id}`,
      dueno: {
        tipo: 'proyecto_comentado',
        titulo: 'Comentaron tu proyecto',
        verbo: 'comentó en',
      },
      respuesta: {
        tipo: 'respuesta_recibida',
        titulo: 'Respondieron tu comentario',
        verbo: 'respondió tu comentario en',
      },
    });
  } catch (err) {
    logger.warn('No se pudo notificar el comentario de un proyecto', {
      error: err.message,
    });
  }
}

registrarOyenteInteraccion(
  'proyecto',
  async ({
    clase,
    usuario_id,
    contenido_id,
    estado,
    comentario_id,
    padre_id,
  }) => {
    if (clase === 'voto') {
      const tipo =
        estado === 'up'
          ? 'like'
          : estado === 'down'
            ? 'dislike'
            : 'voto_quitado';
      await registrarEvento(usuario_id, contenido_id, tipo);
    } else if (clase === 'comentario') {
      await registrarEvento(usuario_id, contenido_id, 'comentario');
      await notificarComentarioDeProyecto({
        usuario_id,
        contenido_id,
        comentario_id,
        padre_id,
      });
    }
  },
);

export { registrarServidas, registrarEvento };