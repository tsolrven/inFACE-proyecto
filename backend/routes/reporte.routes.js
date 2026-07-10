import express from 'express';
import {
  reportarApunte,
  reportarComentario,
} from '../controllers/reporte.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import {
  crearReporteSchema,
  apunteIdParamSchema,
  comentarioIdParamSchema,
} from '../validations/reporte.validation.js';

const router = express.Router();

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
