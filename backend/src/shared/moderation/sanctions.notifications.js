import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import { enviarCorreo } from '../../lib/email/email.service.js';
import { plantillaSancion } from '../../lib/email/sancion.plantilla.js';
import { TIPOS_SANCION } from './sanctions.constants.js';
import { notificar } from '../notifications/notifications.service.js';

// Qué tipos avisan y con qué texto. Los demás tipos se agregan acá cuando se
// decida su canal (S1-4 restricción, S1-5 suspensión).
const NOTIFICACION_POR_TIPO = {
  [TIPOS_SANCION.ADVERTENCIA]: {
    titulo: 'Recibiste una advertencia',
    enlace: '/reglas',
  },
};
// ────────────────────────────────────────────────────────────────────────────────────────
// Se llama DESPUÉS del commit y sin esperarla: un fallo acá (BD o SMTP) nunca
// revierte ni retrasa la sanción. Nunca lanza.
async function notificarSancion(sancion) {
  try {
    const config = NOTIFICACION_POR_TIPO[sancion.tipo];
    if (!config) return;

    const usuario = await prisma.usuario.findUnique({
      where: { id: sancion.usuario_id },
      select: { correo: true, esta_activo: true },
    });
    // misma regla que los correos de reportes: cuenta inactiva = sin avisos
    if (!usuario?.esta_activo) return;

    // notificar() nunca lanza: si falla, lo registra en el log
    await notificar({
      usuarioId: sancion.usuario_id,
      tipo: 'sancion',
      titulo: config.titulo,
      mensaje: sancion.motivo,
      enlace: config.enlace,
    });

    const correo = plantillaSancion({
      tipo: sancion.tipo,
      motivo: sancion.motivo,
    });
    if (correo) {
      // enviarCorreo ya registra en el log si el envío falla
      await enviarCorreo({ para: usuario.correo, ...correo });
    }
  } catch (error) {
    logger.error('Fallo inesperado al notificar una sanción', {
      sancion_id: sancion?.id,
      error: error.message,
    });
  }
}

export { notificarSancion };