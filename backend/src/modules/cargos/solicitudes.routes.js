import express from 'express';
import { crear, listarMias, cancelar } from './solicitudes.controller.js';
import { autenticar, autorizar } from '../../middlewares/auth.middleware.js';
import { exigirSinRestriccion } from '../../middlewares/restriction.middleware.js';
import validate from '../../middlewares/validate.js';
import { crearSolicitudSchema } from './solicitudes.validation.js';
import {
  idParamSchema,
  paginacionQuerySchema,
} from '../../shared/validation/common.schemas.js';
import { publicacionLimiter } from '../../middlewares/rateLimiter.js';
import { ROLES } from '../../shared/auth/permissions.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const router = express.Router();

// Solicitan estudiantes y superadmins (el rol 'docente' no está en ROLES y
// autorizar lo deniega). La carrera y las demás reglas las valida el servicio.
router.post(
  '/',
  autenticar,
  autorizar(ROLES.ESTUDIANTE, ROLES.SUPERADMIN),
  exigirSinRestriccion,
  publicacionLimiter,
  validate(crearSolicitudSchema),
  crear,
);
// va antes de /:id/cancelar para que 'mias' no se confunda con un id
router.get(
  '/mias',
  autenticar,
  validate(paginacionQuerySchema, 'query'),
  listarMias,
);
// retirar una solicitud propia no es crear ni editar: sin exigirSinRestriccion
router.post(
  '/:id/cancelar',
  autenticar,
  validate(idParamSchema, 'params'),
  cancelar,
);
// ────────────────────────────────────────────────────────────────────────────────────────
export default router;