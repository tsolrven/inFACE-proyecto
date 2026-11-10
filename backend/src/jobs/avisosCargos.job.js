//! tarea programada: avisa por campana y correo los cargos (CEE, tutor) que
//! vencen en 7 días o menos. Corre al arrancar y luego cada 6 horas; cada
//! asignación se avisa una sola vez (es idempotente).
import logger from '../lib/logger.js';
import { enviarAvisosVencimiento } from '../shared/auth/cargosAvisos.service.js';

const CADA_6_HORAS = 6 * 60 * 60 * 1000;

async function ejecutar() {
  try {
    const n = await enviarAvisosVencimiento();
    if (n > 0) logger.info('Avisos de vencimiento de cargos', { avisados: n });
  } catch (error) {
    logger.error('Fallaron los avisos de vencimiento de cargos', {
      error: error.message,
    });
  }
}

function iniciarAvisosCargos() {
  setTimeout(ejecutar, 90 * 1000).unref();
  setInterval(ejecutar, CADA_6_HORAS).unref();
}

export { iniciarAvisosCargos };