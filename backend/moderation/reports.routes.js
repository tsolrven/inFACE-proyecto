import express from 'express';
import { reportarContenido, listarMisReportes } from './reports.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import { crearReporteSchema } from './reports.validation.js';
import { contenidoParamSchema } from '../shared/validation/common.schemas.js';
import { reporteLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.get('/me', autenticar, listarMisReportes);

router.post(
  '/:tipo/:id',
  autenticar,
  reporteLimiter,
  validate(contenidoParamSchema, 'params'),
  validate(crearReporteSchema),
  reportarContenido,
);

export default router;
