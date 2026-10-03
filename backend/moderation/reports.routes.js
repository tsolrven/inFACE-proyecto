import express from 'express';
import {
  reportarApunte,
  reportarComentario,
  listarMisReportes,
} from './reports.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import {
  crearReporteSchema,
  apunteIdParamSchema,
  comentarioIdParamSchema,
} from './reports.validation.js';

const router = express.Router();

router.get('/me', autenticar, listarMisReportes);

router.post(
  '/apunte/:apunte_id',
  autenticar,
  validate(apunteIdParamSchema, 'params'),
  validate(crearReporteSchema),
  reportarApunte,
);
router.post(
  '/comentario/:comentario_id',
  autenticar,
  validate(comentarioIdParamSchema, 'params'),
  validate(crearReporteSchema),
  reportarComentario,
);

export default router;
