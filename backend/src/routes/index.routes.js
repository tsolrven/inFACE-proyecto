import { Router } from 'express';
import authRoutes from '../modules/identity/auth.routes.js';
import apunteRoutes from '../modules/materials/materials.routes.js';
import archivoRoutes from '../shared/files/files.routes.js';
import votoRoutes from '../shared/votes/votes.routes.js';
import comentarioRoutes from '../shared/comments/comments.routes.js';
import guardadoRoutes from '../shared/bookmarks/bookmarks.routes.js';
import ramoRoutes from '../modules/catalog/courses.routes.js';
import estadisticasRoutes from '../modules/materials/statistics.routes.js';
import reporteRoutes from '../shared/moderation/reports.routes.js';
import proyectoRoutes from '../modules/project-match/matchingProyecto.routes.js';
import etiquetaRoutes from '../modules/identity/etiqueta.routes.js';
import perfilRoutes from '../modules/identity/perfil.routes.js';

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
  router.use('/guardados', guardadoRoutes);
  router.use('/repositorio', ramoRoutes);
  router.use('/repositorio', estadisticasRoutes);

  // moderación (transversal a todos los módulos)
  router.use('/reportes', reporteRoutes);

  router.use('/proyecto', proyectoRoutes);
  router.use('/etiquetas', etiquetaRoutes);
  router.use('/perfil', perfilRoutes);
}

export { routerApi };
