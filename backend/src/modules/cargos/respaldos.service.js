import { prisma } from '../../config/configDb.js';
import logger from '../../lib/logger.js';
import { borrarArchivosFisicos } from '../../shared/files/files.service.js';
import {
  DIAS_CONSERVACION_RESPALDOS,
  ESTADOS_SOLICITUD,
} from './solicitudes.constants.js';

const TIPO_CONTENIDO = 'solicitud_rol';
const DIA_MS = 24 * 60 * 60 * 1000;
const LOTE = 200; // solicitudes por pasada; el resto, en la siguiente

// En desarrollo se puede acortar con RESPALDOS_DIAS_CONSERVACION (ej. 0, para
// probar sin esperar 30 días). En producción SIEMPRE rige la constante.
function diasConservacion() {
  if (process.env.NODE_ENV === 'production') return DIAS_CONSERVACION_RESPALDOS;
  const crudo = process.env.RESPALDOS_DIAS_CONSERVACION;
  if (crudo === undefined || crudo.trim() === '') {
    return DIAS_CONSERVACION_RESPALDOS;
  }
  const dias = Number(crudo);
  return Number.isInteger(dias) && dias >= 0 ? dias : DIAS_CONSERVACION_RESPALDOS;
}

// RF-T-22: borra los respaldos (registro y archivo físico) de las solicitudes
// resueltas o canceladas hace más del plazo, y marca archivos_borrados_en.
// La solicitud se conserva (historial). Idempotente: una solicitud marcada no
// se vuelve a procesar, y las que nunca tuvieron respaldos no se marcan.
async function eliminarRespaldosVencidos() {
  const limite = new Date(Date.now() - diasConservacion() * DIA_MS);

  // solo solicitudes que aún tienen respaldos
  const conArchivos = await prisma.archivo.findMany({
    where: { tipo_contenido: TIPO_CONTENIDO },
    select: { contenido_id: true },
    distinct: ['contenido_id'],
  });
  if (conArchivos.length === 0) return 0;

  const vencidas = await prisma.solicitudRol.findMany({
    where: {
      id: { in: conArchivos.map((a) => a.contenido_id) },
      estado: { not: ESTADOS_SOLICITUD.PENDIENTE },
      resuelta_en: { not: null, lte: limite },
      archivos_borrados_en: null,
    },
    select: { id: true },
    take: LOTE,
  });

  let procesadas = 0;
  for (const { id } of vencidas) {
    try {
      // registros y marca en una transacción; los archivos físicos, después
      // del commit (como al eliminar contenido): si falla el disco, la BD
      // queda coherente y el error va al log
      const archivos = await prisma.$transaction(async (tx) => {
        const archivos = await tx.archivo.findMany({
          where: { tipo_contenido: TIPO_CONTENIDO, contenido_id: id },
        });
        await tx.archivo.deleteMany({
          where: { id: { in: archivos.map((a) => a.id) } },
        });
        await tx.solicitudRol.update({
          where: { id },
          data: { archivos_borrados_en: new Date() },
        });
        return archivos;
      });
      await borrarArchivosFisicos(archivos);
      procesadas++;
    } catch (error) {
      logger.error('No se pudieron eliminar los respaldos de una solicitud', {
        solicitud_id: id,
        error: error.message,
      });
    }
  }
  return procesadas;
}

export { eliminarRespaldosVencidos };