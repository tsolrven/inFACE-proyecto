import { Router } from 'express';
import authRoutes from './auth.routes.js';
import apunteRoutes from './apunte.routes.js';
import archivoRoutes from './archivo.routes.js';
import votoRoutes from './voto.routes.js';
import comentarioRoutes from './comentario.routes.js';
import ramoRoutes from './ramo.routes.js';

function routerApi(app) {
  const router = Router();

  app.use('/api', router);

  // auth
  router.use('/auth', authRoutes);

  // módulo 1: Repositorio de materiales
  router.use('/apuntes', apunteRoutes);
  router.use('/archivos', archivoRoutes);
  router.use('/votos', votoRoutes);
  router.use('/comentarios', comentarioRoutes);
  router.use('/repositorio', ramoRoutes);
}

export { routerApi };
