import { Router } from 'express';
import authRoutes from './auth.routes.js';

function routerApi(app) {
  const router = Router();

  app.use('/api', router);

  router.use('/auth', authRoutes);
}

export { routerApi };
