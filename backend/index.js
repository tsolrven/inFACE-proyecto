import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/configDb.js';
import { PORT } from './config/configEnv.js';
import { routerApi } from './routes/index.routes.js';
import logger from './lib/logger.js';
import requestLogger from './middlewares/requestLogger.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

const app = express();

// middlewares de parseo
app.use(cors());
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
