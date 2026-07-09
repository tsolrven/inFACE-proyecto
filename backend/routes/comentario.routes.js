import express from 'express';
import { listar, crear } from '../controllers/comentario.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import {
  crearComentarioSchema,
  apunteIdParamSchema,
} from '../validations/comentario.validation.js';

const router = express.Router();

router.get(
  '/:apunte_id',
  autenticar,
  validate(apunteIdParamSchema, 'params'),
  listar,
);
router.post(
  '/:apunte_id',
  autenticar,
  validate(apunteIdParamSchema, 'params'),
  validate(crearComentarioSchema),
  crear,
);

export default router;
