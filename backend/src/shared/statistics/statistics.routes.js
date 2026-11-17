import express from 'express';
import {
  topColaboradores,
  hashtagsPopulares,
} from './statistics.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  estadisticasParamsSchema,
  estadisticasQuerySchema,
} from './statistics.validation.js';

// /api/estadisticas/:tipo/...  (tipo: apunte | hilo | anuncio)
const router = express.Router();

router.get(
  '/:tipo/top-colaboradores',
  autenticar,
  validate(estadisticasParamsSchema, 'params'),
  validate(estadisticasQuerySchema, 'query'),
  topColaboradores,
);
router.get(
  '/:tipo/hashtags-populares',
  autenticar,
  validate(estadisticasParamsSchema, 'params'),
  validate(estadisticasQuerySchema, 'query'),
  hashtagsPopulares,
);

export default router;