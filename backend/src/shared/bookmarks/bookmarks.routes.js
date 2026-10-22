import express from 'express';
import { guardar, quitar, listar } from './bookmarks.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import { listarGuardadosQuerySchema } from './bookmarks.validation.js';
import { contenidoParamSchema } from '../validation/common.schemas.js';
import { interaccionLimiter } from '../../middlewares/rateLimiter.js';

const router = express.Router();

router.get(
  '/',
  autenticar,
  validate(listarGuardadosQuerySchema, 'query'),
  listar,
);
router.put(
  '/:tipo/:id',
  autenticar,
  interaccionLimiter,
  validate(contenidoParamSchema, 'params'),
  guardar,
);
router.delete(
  '/:tipo/:id',
  autenticar,
  interaccionLimiter,
  validate(contenidoParamSchema, 'params'),
  quitar,
);

export default router;
