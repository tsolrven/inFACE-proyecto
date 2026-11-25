import { prisma } from '../../config/configDb.js';
import { ESTADOS_REPORTE } from '../../shared/moderation/reports.constants.js';
import { ESTADOS_SOLICITUD } from '../cargos/solicitudes.constants.js';

// Conteos para el panel de administración del Inicio. Los reportes se cuentan
// por CONTENIDO (como la cola de moderación agrupa), no por reporte suelto.
async function obtenerResumen() {
  const [contenidosReportados, solicitudesPendientes] = await Promise.all([
    prisma.reporte.groupBy({
      by: ['tipo_contenido', 'contenido_id'],
      where: { estado: ESTADOS_REPORTE.PENDIENTE },
    }),
    prisma.solicitudRol.count({
      where: { estado: ESTADOS_SOLICITUD.PENDIENTE },
    }),
  ]);

  return {
    reportes_pendientes: contenidosReportados.length,
    solicitudes_pendientes: solicitudesPendientes,
  };
}

export { obtenerResumen };