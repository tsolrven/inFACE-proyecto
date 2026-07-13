import { Router } from 'express';
import authRoutes from './auth.routes.js';
import apunteRoutes from './apunte.routes.js';
import archivoRoutes from './archivo.routes.js';
import votoRoutes from './voto.routes.js';
import comentarioRoutes from './comentario.routes.js';
import guardadoRoutes from './guardado.routes.js';
import ramoRoutes from './ramo.routes.js';
import estadisticasRoutes from './estadisticas.routes.js';
import reporteRoutes from './reporte.routes.js';
import proyectoRoutes from './matchingProyecto.routes.js';
import etiquetaRoutes from './etiqueta.routes.js';
import perfilRoutes from './perfil.routes.js';

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
