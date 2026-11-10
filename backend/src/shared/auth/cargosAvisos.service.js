import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import { enviarCorreo } from '../../lib/email/email.service.js';
import { plantillaCargoPorVencer } from '../../lib/email/cargo.plantilla.js';
import { notificar } from '../notifications/notifications.service.js';
import { hoyEnChile, filtroCargoVigente } from './cargos.js';

const DIA_MS = 24 * 60 * 60 * 1000;
const DIAS_AVISO = 7;
const ETIQUETA_CARGO = { cee: 'CEE', tutor: 'Tutor' };

function textoPlazo(dias) {
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'mañana';
  return `en ${dias} días`;
}

// `hasta` es una fecha de calendario guardada a medianoche UTC: se formatea en
// UTC para que no retroceda un día por la zona horaria.
function formatearFechaCargo(fecha) {
  return new Date(fecha).toLocaleDateString('es-CL', {
    dateStyle: 'long',
    timeZone: 'UTC',
  });
}

// Avisa (campana y correo) los cargos vigentes que vencen en DIAS_AVISO días o
// menos y aún no fueron avisados. Idempotente: cada asignación se avisa una
// sola vez (aviso_enviado_en). Ignora cuentas inactivas y cargos revocados.
async function enviarAvisosVencimiento() {
  const hoy = hoyEnChile();
  const limite = new Date(hoy.getTime() + DIAS_AVISO * DIA_MS);

  const pendientes = await prisma.asignacionRol.findMany({
    where: {
      ...filtroCargoVigente(hoy),
      hasta: { gte: hoy, lte: limite },
      aviso_enviado_en: null,
      usuario: { esta_activo: true },
    },
    select: {
      id: true,
      tipo: true,
      hasta: true,
      usuario: { select: { id: true, correo: true } },
      carrera: { select: { nombre: true } },
    },
  });

  let avisados = 0;
  for (const a of pendientes) {
    try {
      const etiqueta = ETIQUETA_CARGO[a.tipo] ?? a.tipo;
      const dias = Math.round((a.hasta.getTime() - hoy.getTime()) / DIA_MS);
      const plazo = textoPlazo(dias);
      const fecha = formatearFechaCargo(a.hasta);

      const notificacion = await notificar({
        usuarioId: a.usuario.id,
        tipo: 'cargo_por_vencer',
        titulo: `Tu cargo de ${etiqueta} vence ${plazo}`,
        mensaje: `Tu cargo de ${etiqueta} en ${a.carrera.nombre} vence el ${fecha}. Para continuar, deberás enviar una nueva solicitud.`,
      });
      // si la campana falló no se marca: se reintenta en la próxima revisión
      if (!notificacion) continue;

      // se marca antes del correo: si el correo falla no se duplica la campana
      await prisma.asignacionRol.update({
        where: { id: a.id },
        data: { aviso_enviado_en: new Date() },
      });
      avisados++;

      const correo = plantillaCargoPorVencer({
        etiqueta,
        carrera: a.carrera.nombre,
        fecha,
        plazo,
      });
      // enviarCorreo ya registra en el log si el envío falla
      await enviarCorreo({ para: a.usuario.correo, ...correo });
    } catch (error) {
      logger.error('No se pudo avisar el vencimiento de un cargo', {
        asignacion_id: a.id,
        error: error.message,
      });
    }
  }
  return avisados;
}

export { enviarAvisosVencimiento };