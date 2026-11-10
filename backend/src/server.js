import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/configDb.js';
import { PORT } from './config/configEnv.js';
import logger from './lib/logger.js';
import { iniciarLimpiezaCuentas } from './jobs/limpiezaCuentas.job.js';
import { sincronizarModeradores } from './modules/identity/moderadores.sync.js';

connectDB().then(async () => {
  try {
    await sincronizarModeradores();
  } catch (error) {
    logger.error('No se pudo sincronizar a los moderadores', {
      error: error.message,
    });
  }
  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  });
  iniciarLimpiezaCuentas();
});