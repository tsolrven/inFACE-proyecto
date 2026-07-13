import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/configDb.js';
import { PORT } from './config/configEnv.js';
import { routerApi } from './routes/index.routes.js';
import logger from './lib/logger.js';
import requestLogger from './middlewares/requestLogger.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// cabeceras de seguridad HTTP 
app.use(helmet());

// middlewares de parseo
//app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
//para subida a producción:
app.use(cors({ origin: true, credentials: true }));
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
