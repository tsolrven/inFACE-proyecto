import express from 'express';
import {
  reportarContenido,
  listarMisReportes,
  ocultarMiReporte,
} from './reports.controller.js';
import {
  respuestasPredeterminadas,
  listarParaModeracion,
  detalleDeContenido,
  cerrarContenido,
  reintentarCorreo,
} from './reports.moderation.controller.js';
import { autenticar, autorizar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  crearReporteSchema,
  listarReportesQuerySchema,
  cerrarReporteSchema,
} from './reports.validation.js';
import {
  contenidoParamSchema,
  idParamSchema,
} from '../validation/common.schemas.js';
import { reporteLimiter } from '../../middlewares/rateLimiter.js';
import { ROLES } from '../auth/permissions.js';

const router = express.Router();

// Solo el superadmin gestiona reportes (cola, cierre, correo). Crear un
// reporte (POST /:tipo/:id) puede hacerlo cualquier usuario autenticado.
const soloSuperadmin = [autenticar, autorizar(ROLES.SUPERADMIN)];

router.get('/me', autenticar, listarMisReportes);

router.post(
  '/me/:id/ocultar',
  autenticar,
  validate(idParamSchema, 'params'),
  ocultarMiReporte,
);

// ── moderación (solo superadmin). Antes de /:tipo/:id para que no se confundan.
router.get(
  '/',
  ...soloSuperadmin,
  validate(listarReportesQuerySchema, 'query'),
  listarParaModeracion,
);
router.get('/respuestas', ...soloSuperadmin, respuestasPredeterminadas);
router.get(
  '/contenido/:tipo/:id',
  ...soloSuperadmin,
  validate(contenidoParamSchema, 'params'),
  detalleDeContenido,
);
router.post(
  '/contenido/:tipo/:id/cerrar',
  ...soloSuperadmin,
  validate(contenidoParamSchema, 'params'),
  validate(cerrarReporteSchema),
  cerrarContenido,
);
router.post(
  '/:id/correo/reintentar',
  ...soloSuperadmin,
  validate(idParamSchema, 'params'),
  reintentarCorreo,
);

// ── crear un reporte (todos menos el superadmin)
router.post(
  '/:tipo/:id',
  autenticar,
  reporteLimiter,
  validate(contenidoParamSchema, 'params'),
  validate(crearReporteSchema),
  reportarContenido,
);

export default router;