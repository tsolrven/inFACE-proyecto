import { prisma } from '../../config/configDb.js';
import { registrarOyenteInteraccion } from '../../shared/content/contentRegistry.js';
import { avisarComentario } from '../../shared/notifications/notificarComentario.js';
import { notificarVarios } from '../../shared/notifications/notifications.service.js';
import logger from '../../lib/logger.js';

const rutaProducto = (id) => `/marketplace/producto/${id}`;

registrarOyenteInteraccion(
  'producto',
  async ({ clase, usuario_id, contenido_id, comentario_id, padre_id }) => {
    if (clase !== 'comentario' || !comentario_id) return;
    try {
      const producto = await prisma.producto.findUnique({
        where: { id: contenido_id },
        select: { titulo: true, vendedor_id: true },
      });
      if (!producto) return;
      await avisarComentario({
        actorId: usuario_id,
        comentarioId: comentario_id,
        padreId: padre_id,
        duenoId: producto.vendedor_id,
        nombreContenido: producto.titulo,
        ruta: rutaProducto(contenido_id),
        dueno: {
          tipo: 'producto_pregunta',
          titulo: 'Nueva pregunta en tu producto',
          verbo: 'preguntó en',
        },
        respuesta: {
          tipo: 'respuesta_recibida',
          titulo: 'Respondieron tu comentario',
          verbo: 'respondió tu comentario en',
        },
        respuestaDelDueno: {
          tipo: 'vendedor_respondio',
          titulo: 'El vendedor respondió tu pregunta',
          verbo: '(vendedor) respondió tu pregunta en',
        },
      });
    } catch (error) {
      logger.warn('No se pudo notificar el comentario de un producto', {
        error: error.message,
      });
    }
  },
);

const TEXTO_ESTADO = {
  reservado: 'quedó reservado',
  vendido: 'se vendió',
  disponible: 'volvió a estar disponible',
};

async function notificarCambioDeEstado({ producto, estadoNuevo, actorId }) {
  try {
    const texto = TEXTO_ESTADO[estadoNuevo];
    if (!texto) return;
    const guardados = await prisma.guardado.findMany({
      where: { tipo_contenido: 'producto', contenido_id: producto.id },
      select: { usuario_id: true },
    });
    await notificarVarios({
      usuarioIds: guardados.map((g) => g.usuario_id),
      actorId,
      tipo: 'producto_estado',
      titulo: `Un producto que guardaste ${texto}`,
      mensaje: `«${producto.titulo}» ${texto}.`,
      enlace: rutaProducto(producto.id),
    });
  } catch (error) {
    logger.warn('No se pudo notificar el cambio de estado', {
      error: error.message,
    });
  }
}

export { notificarCambioDeEstado };
