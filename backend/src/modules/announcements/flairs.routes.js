import express from 'express';
import { listar, crear, actualizar, eliminar } from './flairs.controller.js';
import { autenticar, exigirCargo } from '../../middlewares/auth.middleware.js';
import { exigirSinRestriccion } from '../../middlewares/restriction.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  crearFlairSchema,
  actualizarFlairSchema,
  listarFlairsQuerySchema,
} from './flairs.validation.js';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import { publicacionLimiter } from '../../middlewares/rateLimiter.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const router = express.Router();

router.get('/', autenticar, validate(listarFlairsQuerySchema, 'query'), listar);

// `autorizar` rechaza al estudiante de entrada; la regla por carrera la aplica el servicio.
router.post(
  '/',
  autenticar,
  exigirCargo(),
  exigirSinRestriccion,
  publicacionLimiter,
  validate(crearFlairSchema),
  crear,
);
router.patch(
  '/:id',
  autenticar,
  exigirCargo(),
  exigirSinRestriccion,
  validate(idParamSchema, 'params'),
  validate(actualizarFlairSchema),
  actualizar,
);
router.delete(
  '/:id',
  autenticar,
  exigirCargo({ permitirStaff: true }),
  validate(idParamSchema, 'params'),
  eliminar,
);
// ────────────────────────────────────────────────────────────────────────────────────────
export default router;
