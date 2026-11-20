//! tarea programada: elimina los respaldos de las solicitudes de cargo 30 días
//! después de resueltas o canceladas (RF-T-22). Corre al arrancar y luego cada
//! 6 horas; es idempotente.
import logger from '../lib/logger.js';
import { eliminarRespaldosVencidos } from '../modules/cargos/respaldos.service.js';

const CADA_6_HORAS = 6 * 60 * 60 * 1000;

async function ejecutar() {
  try {
    const n = await eliminarRespaldosVencidos();
    if (n > 0) logger.info('Limpieza de respaldos de solicitudes', { solicitudes: n });
  } catch (error) {
    logger.error('Falló la limpieza de respaldos', { error: error.message });
  }
}

function iniciarLimpiezaRespaldos() {
  // 2 minutos después de arrancar (las otras tareas corren al minuto y al
  // minuto y medio): no compiten al inicio
  setTimeout(ejecutar, 120 * 1000).unref();
  setInterval(ejecutar, CADA_6_HORAS).unref();
}

export { iniciarLimpiezaRespaldos };