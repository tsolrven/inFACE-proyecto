import express from 'express';
import {
  listar,
  crear,
  editar,
  eliminar,
} from '../controllers/comentario.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import {
  crearComentarioSchema,
  editarComentarioSchema,
  apunteIdParamSchema,
  comentarioIdParamSchema,
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
router.patch(
  '/comentario/:comentario_id',
  autenticar,
  validate(comentarioIdParamSchema, 'params'),
  validate(editarComentarioSchema),
  editar,
);
router.delete(
  '/comentario/:comentario_id',
  autenticar,
  validate(comentarioIdParamSchema, 'params'),
  eliminar,
);

export default router;
