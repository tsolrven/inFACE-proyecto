import { Router } from 'express';
import authRoutes from './auth.routes.js';
import proyectoRoutes from './matchingProyecto.routes.js';
import etiquetaRoutes from './etiqueta.routes.js';
import perfilRoutes from './perfil.routes.js';

function routerApi(app) {
  const router = Router();

  app.use('/api', router);

  router.use('/auth', authRoutes);
  router.use('/proyecto', proyectoRoutes);
  router.use('/etiquetas', etiquetaRoutes);
  router.use('/perfil', perfilRoutes);
}

export { routerApi };
