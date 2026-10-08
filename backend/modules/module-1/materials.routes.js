import express from 'express';
import {
  listar,
  detalle,
  crear,
  actualizar,
  eliminar,
} from './materials.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  crearApunteSchema,
  actualizarApunteSchema,
  listarApuntesQuerySchema,
} from './materials.validation.js';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import { publicacionLimiter } from '../../middlewares/rateLimiter.js';

const router = express.Router();

router.get(
  '/',
  autenticar,
  validate(listarApuntesQuerySchema, 'query'),
  listar,
);
router.get('/:id', autenticar, validate(idParamSchema, 'params'), detalle);
router.post(
  '/',
  autenticar,
  publicacionLimiter,
  validate(crearApunteSchema),
  crear,
);
router.patch(
  '/:id',
  autenticar,
  validate(idParamSchema, 'params'),
  validate(actualizarApunteSchema),
  actualizar,
);
router.delete('/:id', autenticar, validate(idParamSchema, 'params'), eliminar);

export default router;
