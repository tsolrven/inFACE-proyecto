import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import {
  enviarCorreo,
  smtpConfigurado,
} from '../../lib/email/email.service.js';
import { plantillaReporte } from '../../lib/email/reporte.plantilla.js';
import {
  obtenerEntradaRegistro,
  obtenerPreviewsContenido,
} from '../content/contentRegistry.js';
import {
  ESTADOS_NOTIFICACION,
  ETIQUETAS_MOTIVO,
} from './reports.constants.js';

// un envío que lleva más de esto en `enviando` se considera atascado (el
// proceso murió a medio camino) y puede reclamarse de nuevo
const MINUTOS_ENVIO_ATASCADO = 10;
const MAX_ERROR = 300;
const MAX_CONTEXTO = 100;

function recortar(texto, max) {
  const caracteres = Array.from(texto ?? '');
  if (caracteres.length <= max) return caracteres.join('');
  return `${caracteres.slice(0, max - 1).join('')}…`;
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Título que identifica el contenido en el correo: el snapshot si el contenido
// ya no existe, la vista previa en vivo si todavía existe.
async function obtenerContexto(reporte) {
  const guardado = reporte.contenido_snapshot?.titulo;
  if (guardado) return recortar(guardado, MAX_CONTEXTO);

  try {
    const previews = await obtenerPreviewsContenido(reporte.tipo_contenido, [
      reporte.contenido_id,
    ]);
    const vivo = previews.get(reporte.contenido_id);
    return vivo ? recortar(vivo, MAX_CONTEXTO) : null;
  } catch {
    return null;
  }
}
// ────────────────────────────────────────────────────────────────────────────────────────
// Envía el correo de UN reporte y registra el resultado. Nunca lanza por un
// fallo de envío: queda en `fallida`. Devuelve el estado final, o null si otro
// proceso ya reclamó el reporte (o no hay nada que enviar).
async function enviarNotificacion(reporte_id) {
  const atascadoDesde = new Date(
    Date.now() - MINUTOS_ENVIO_ATASCADO * 60 * 1000,
  );

  // reclamo exclusivo: solo un proceso puede pasar el reporte a `enviando`
  const reclamo = await prisma.reporte.updateMany({
    where: {
      id: reporte_id,
      OR: [
        {
          notificacion_estado: {
            in: [ESTADOS_NOTIFICACION.PENDIENTE, ESTADOS_NOTIFICACION.FALLIDA],
          },
        },
        {
          notificacion_estado: ESTADOS_NOTIFICACION.ENVIANDO,
          revisado_en: { lt: atascadoDesde },
        },
      ],
    },
    data: {
      notificacion_estado: ESTADOS_NOTIFICACION.ENVIANDO,
      notificacion_intentos: { increment: 1 },
    },
  });
  if (reclamo.count === 0) return null;

  let resultado;
  try {
    const reporte = await prisma.reporte.findUnique({
      where: { id: reporte_id },
      select: {
        tipo_contenido: true,
        contenido_id: true,
        motivo: true,
        estado: true,
        nota_resolucion: true,
        contenido_snapshot: true,
        reportador: { select: { correo: true, esta_activo: true } },
      },
    });

    if (!reporte.nota_resolucion) {
      throw new Error('El reporte no tiene mensaje de respuesta');
    }

    if (!reporte.reportador.esta_activo) {
      resultado = {
        estado: ESTADOS_NOTIFICACION.OMITIDA,
        error: 'El usuario que reportó está desactivado',
      };
    } else {
      const { asunto, html, texto } = plantillaReporte({
        estado: reporte.estado,
        mensaje: reporte.nota_resolucion,
        tipo: obtenerEntradaRegistro(reporte.tipo_contenido).label,
        motivo: ETIQUETAS_MOTIVO[reporte.motivo] ?? reporte.motivo,
        contexto: await obtenerContexto(reporte),
      });

      const ok = await enviarCorreo({
        para: reporte.reportador.correo,
        asunto,
        html,
        texto,
      });

      resultado = ok
        ? { estado: ESTADOS_NOTIFICACION.ENVIADA }
        : {
          estado: ESTADOS_NOTIFICACION.FALLIDA,
          error: smtpConfigurado()
            ? 'No se pudo enviar el correo (ver registros del servidor)'
            : 'SMTP sin configurar',
        };
    }
  } catch (err) {
    resultado = {
      estado: ESTADOS_NOTIFICACION.FALLIDA,
      error: recortar(err.message, MAX_ERROR),
    };
  }

  await prisma.reporte.update({
    where: { id: reporte_id },
    data: {
      notificacion_estado: resultado.estado,
      notificacion_error: resultado.error ?? null,
      notificacion_enviada_en:
        resultado.estado === ESTADOS_NOTIFICACION.ENVIADA ? new Date() : null,
    },
  });

  return resultado.estado;
}
// ────────────────────────────────────────────────────────────────────────────────────────
async function procesarEnvios(ids) {
  for (const id of ids) {
    try {
      await enviarNotificacion(id);
    } catch (err) {
      // el reporte queda en `enviando`: se reclama de nuevo pasados 10 minutos
      logger.error('No se pudo registrar el resultado del correo de un reporte', {
        reporte_id: id,
        error: err.message,
      });
    }
  }
}

// Se llama DESPUÉS del commit del cierre. No se espera: el cierre ya está
// confirmado y el correo no debe retrasar ni romper la respuesta. Un correo
// por reporte, en orden.
function notificarReportesCerrados(ids) {
  if (!ids?.length) return;
  procesarEnvios(ids).catch((err) => {
    logger.error('Fallo inesperado al notificar reportes', {
      error: err.message,
    });
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export { enviarNotificacion, notificarReportesCerrados };