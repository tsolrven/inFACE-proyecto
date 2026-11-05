//! tarea programada: anonimiza las cuentas cuyo plazo de eliminación ya venció.
//! Sin dependencias extra: corre al arrancar y luego cada 6 horas (es idempotente).
import logger from '../lib/logger.js';
import { procesarEliminacionesVencidas } from '../modules/identity/cuentaEliminacion.service.js';

const CADA_6_HORAS = 6 * 60 * 60 * 1000;

async function ejecutar() {
  try {
    const n = await procesarEliminacionesVencidas();
    if (n > 0) logger.info('Limpieza de cuentas', { anonimizadas: n });
  } catch (error) {
    logger.error('Falló la limpieza de cuentas', { error: error.message });
  }
}

function iniciarLimpiezaCuentas() {
  setTimeout(ejecutar, 60 * 1000).unref();
  setInterval(ejecutar, CADA_6_HORAS).unref();
}

export { iniciarLimpiezaCuentas };
