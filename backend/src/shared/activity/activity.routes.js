import express from 'express';
import { listar } from './activity.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  actividadParamsSchema,
  actividadQuerySchema,
} from './activity.validation.js';

// /api/actividad/:usuarioId?tipo=hilo&lista=publicaciones&carrera_id=…
const router = express.Router();

router.get(
  '/:usuarioId',
  autenticar,
  validate(actividadParamsSchema, 'params'),
  validate(actividadQuerySchema, 'query'),
  listar,
);

export default router;