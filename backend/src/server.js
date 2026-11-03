import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/configDb.js';
import { PORT } from './config/configEnv.js';
import logger from './lib/logger.js';
import { iniciarLimpiezaCuentas } from './jobs/limpiezaCuentas.job.js';

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  });
  iniciarLimpiezaCuentas();
});