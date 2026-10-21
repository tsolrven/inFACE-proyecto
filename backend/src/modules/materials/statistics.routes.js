import express from 'express';
import {
  topColaboradores,
  hashtagsPopulares,
} from './statistics.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import { estadisticasQuerySchema } from './statistics.validation.js';

const router = express.Router();

router.get(
  '/top-colaboradores',
  autenticar,
  validate(estadisticasQuerySchema, 'query'),
  topColaboradores,
);
router.get(
  '/hashtags-populares',
  autenticar,
  validate(estadisticasQuerySchema, 'query'),
  hashtagsPopulares,
);

export default router;
