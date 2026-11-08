//! Notificaciones del Espacio creativo. Se registran al arrancar el servidor
//! (import desde creative.routes.js).
//!   - comentan tu obra
//!   - responden tu comentario en una obra
//!   - comentan un párrafo de tu historia
import { prisma } from '../../config/configDb.js';
import { registrarOyenteInteraccion } from '../../shared/content/contentRegistry.js';
import { avisarComentario } from '../../shared/notifications/notificarComentario.js';
import logger from '../../lib/logger.js';

const rutaObra = (id) => `/espacio-creativo/obra/${id}`;

const AVISO_OBRA = {
  tipo: 'obra_comentada',
  titulo: 'Comentaron tu obra',
  verbo: 'comentó en',
};
const AVISO_RESPUESTA = {
  tipo: 'respuesta_recibida',
  titulo: 'Respondieron tu comentario',
  verbo: 'respondió tu comentario en',
};

registrarOyenteInteraccion(
  'obra',
  async ({ clase, usuario_id, contenido_id, comentario_id, padre_id }) => {
    if (clase !== 'comentario' || !comentario_id) return;
    try {
      const obra = await prisma.obra.findUnique({
        where: { id: contenido_id },
        select: { titulo: true, autor_id: true },
      });
      if (!obra) return;
      await avisarComentario({
        actorId: usuario_id,
        comentarioId: comentario_id,
        padreId: padre_id,
        duenoId: obra.autor_id,
        nombreContenido: obra.titulo,
        ruta: rutaObra(contenido_id),
        dueno: AVISO_OBRA,
        respuesta: AVISO_RESPUESTA,
      });
    } catch (error) {
      logger.warn('No se pudo notificar el comentario de una obra', {
        error: error.message,
      });
    }
  },
);

// comentarios por párrafo de una historia: el contenido es el párrafo, pero el
// aviso y el enlace apuntan a la obra
registrarOyenteInteraccion(
  'parrafo',
  async ({ clase, usuario_id, contenido_id, comentario_id, padre_id }) => {
    if (clase !== 'comentario' || !comentario_id) return;
    try {
      const parrafo = await prisma.capituloParrafo.findUnique({
        where: { id: contenido_id },
        select: {
          capitulo: {
            select: {
              obra: { select: { id: true, titulo: true, autor_id: true } },
            },
          },
        },
      });
      const obra = parrafo?.capitulo?.obra;
      if (!obra) return;
      await avisarComentario({
        actorId: usuario_id,
        comentarioId: comentario_id,
        padreId: padre_id,
        duenoId: obra.autor_id,
        nombreContenido: obra.titulo,
        ruta: rutaObra(obra.id),
        dueno: {
          tipo: 'parrafo_comentado',
          titulo: 'Comentaron un párrafo de tu historia',
          verbo: 'comentó un párrafo de',
        },
        respuesta: AVISO_RESPUESTA,
      });
    } catch (error) {
      logger.warn('No se pudo notificar el comentario de un párrafo', {
        error: error.message,
      });
    }
  },
);
