import express from 'express';
import {
  listarComentariosApunte,
  crearComentarioApunte,
  editar,
  eliminar,
} from './comments.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  crearComentarioSchema,
  editarComentarioSchema,
  apunteIdParamSchema,
  comentarioIdParamSchema,
} from './comments.validation.js';

const router = express.Router();

router.get(
  '/material/:apunte_id',
  autenticar,
  validate(apunteIdParamSchema, 'params'),
  listarComentariosApunte,
);
router.post(
  '/material/:apunte_id',
  autenticar,
  validate(apunteIdParamSchema, 'params'),
  validate(crearComentarioSchema),
  crearComentarioApunte,
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
