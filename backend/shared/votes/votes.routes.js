import express from 'express';
import { votarApunte, votarComentario } from './votes.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  votarSchema,
  apunteIdParamSchema,
  comentarioIdParamSchema,
} from './votes.validation.js';

const router = express.Router();

router.post(
  '/apunte/:apunte_id',
  autenticar,
  validate(apunteIdParamSchema, 'params'),
  validate(votarSchema),
  votarApunte,
);
router.post(
  '/comentario/:comentario_id',
  autenticar,
  validate(comentarioIdParamSchema, 'params'),
  validate(votarSchema),
  votarComentario,
);

export default router;
