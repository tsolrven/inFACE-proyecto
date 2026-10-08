import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/configDb.js';
import { PORT, CORS_ORIGINS } from './config/configEnv.js';
import { routerApi } from './routes/index.routes.js';
import logger from './lib/logger.js';
import requestLogger from './middlewares/requestLogger.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

const app = express();

// cabeceras de seguridad HTTP
app.use(helmet());

// middlewares de parseo
// solo los orígenes listados en CORS_ORIGIN pueden llamar a la API con cookies
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// middleware de logging
app.use(requestLogger);

app.get('/', (req, res) => {
  res.send('Backend funcionando :3');
});

routerApi(app);

// 404 y manejo de errores
app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en puerto ${PORT}`);
  });
});
