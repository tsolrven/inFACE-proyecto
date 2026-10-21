import express from 'express';
import { votarContenido } from './votes.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import { votarSchema } from './votes.validation.js';
import { contenidoParamSchema } from '../validation/common.schemas.js';
import { interaccionLimiter } from '../../middlewares/rateLimiter.js';

const router = express.Router();

router.post(
  '/:tipo/:id', // :tipo = tipo de contenido (apunte, comentario, etc) - :id = id del contenido
  autenticar,
  interaccionLimiter,
  validate(contenidoParamSchema, 'params'),
  validate(votarSchema),
  votarContenido,
);

export default router;
