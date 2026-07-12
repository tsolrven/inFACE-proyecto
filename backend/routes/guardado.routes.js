import express from 'express';
import {
  guardarApunte,
  guardarComentario,
  listar,
} from '../controllers/guardado.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import {
  apunteIdParamSchema,
  comentarioIdParamSchema,
  listarGuardadosQuerySchema,
} from '../validations/guardado.validation.js';

const router = express.Router();

router.get(
  '/',
  autenticar,
  validate(listarGuardadosQuerySchema, 'query'),
  listar,
);
router.post(
  '/apunte/:apunte_id',
  autenticar,
  validate(apunteIdParamSchema, 'params'),
  guardarApunte,
);
router.post(
  '/comentario/:comentario_id',
  autenticar,
  validate(comentarioIdParamSchema, 'params'),
  guardarComentario,
);

export default router;
