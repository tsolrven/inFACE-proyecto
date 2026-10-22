import express from 'express';
import {
  listarDeContenido,
  listarRespuestasDeComentario,
  crearEnContenido,
  editar,
  eliminar,
} from './comments.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  contenidoComentableParamSchema,
  crearComentarioSchema,
  editarComentarioSchema,
  listarComentariosQuerySchema,
} from './comments.validation.js';
import { comentarioIdParamSchema } from '../validation/common.schemas.js';
import { publicacionLimiter } from '../../middlewares/rateLimiter.js';

const router = express.Router();

// respuestas directas de UN comentario (va antes de /:tipo/:id)
router.get(
  '/:comentario_id/respuestas',
  autenticar,
  validate(comentarioIdParamSchema, 'params'),
  validate(listarComentariosQuerySchema, 'query'),
  listarRespuestasDeComentario,
);

// comentarios raíz DE un contenido (apunte hoy; hilo y anuncio mañana)
router.get(
  '/:tipo/:id',
  autenticar,
  validate(contenidoComentableParamSchema, 'params'),
  validate(listarComentariosQuerySchema, 'query'),
  listarDeContenido,
);
router.post(
  '/:tipo/:id',
  autenticar,
  publicacionLimiter,
  validate(contenidoComentableParamSchema, 'params'),
  validate(crearComentarioSchema),
  crearEnContenido,
);

// UN comentario
router.patch(
  '/:comentario_id',
  autenticar,
  validate(comentarioIdParamSchema, 'params'),
  validate(editarComentarioSchema),
  editar,
);
router.delete(
  '/:comentario_id',
  autenticar,
  validate(comentarioIdParamSchema, 'params'),
  eliminar,
);

export default router;
