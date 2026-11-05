import express from 'express';
import { listar, crear, actualizar, eliminar } from './flairs.controller.js';
import { autenticar, autorizar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  crearFlairSchema,
  actualizarFlairSchema,
  listarFlairsQuerySchema,
} from './flairs.validation.js';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import { publicacionLimiter } from '../../middlewares/rateLimiter.js';
import { ROLES, ROLES_ANUNCIANTES } from '../../shared/auth/permissions.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const router = express.Router();

router.get('/', autenticar, validate(listarFlairsQuerySchema, 'query'), listar);

// `autorizar` rechaza al estudiante de entrada; la regla por carrera la aplica el servicio.
router.post(
  '/',
  autenticar,
  autorizar(...ROLES_ANUNCIANTES),
  publicacionLimiter,
  validate(crearFlairSchema),
  crear,
);
router.patch(
  '/:id',
  autenticar,
  autorizar(...ROLES_ANUNCIANTES),
  validate(idParamSchema, 'params'),
  validate(actualizarFlairSchema),
  actualizar,
);
router.delete(
  '/:id',
  autenticar,
  autorizar(...ROLES_ANUNCIANTES, ROLES.SUPERADMIN),
  validate(idParamSchema, 'params'),
  eliminar,
);
// ────────────────────────────────────────────────────────────────────────────────────────
export default router;
