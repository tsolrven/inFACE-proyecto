import express from 'express';
import {
  listarDeContenido,
  listarRespuestasDeComentario,
  crearEnContenido,
  editar,
  eliminar,
  obtenerContexto,
} from './comments.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import { exigirSinRestriccion } from '../../middlewares/restriction.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  contenidoComentableParamSchema,
  crearComentarioSchema,
  editarComentarioSchema,
  listarComentariosQuerySchema,
} from './comments.validation.js';
import { comentarioIdParamSchema } from '../validation/common.schemas.js';
import { publicacionLimiter } from '../../middlewares/rateLimiter.js';
import { subirUnoPara } from '../files/multer.helper.js';
import { validarContenidoReal } from '../files/fileSignature.helper.js';
import {
  limpiarArchivosSiFalla,
  parsearDatosMultipart,
} from '../files/multipart.helper.js';

const router = express.Router();

const comoComentario = (req, _res, next) => {
  req.tipoContenido = 'comentario';
  next();
};

// respuestas directas de UN comentario (va antes de /:tipo/:id)
router.get(
  '/:comentario_id/respuestas',
  autenticar,
  validate(comentarioIdParamSchema, 'params'),
  validate(listarComentariosQuerySchema, 'query'),
  listarRespuestasDeComentario,
);

// un comentario con el camino hasta su raíz
router.get(
  '/:comentario_id/contexto',
  autenticar,
  validate(comentarioIdParamSchema, 'params'),
  validate(listarComentariosQuerySchema, 'query'),
  obtenerContexto,
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
  exigirSinRestriccion,
  publicacionLimiter,
  validate(contenidoComentableParamSchema, 'params'),
  comoComentario,
  limpiarArchivosSiFalla,
  subirUnoPara('comentario', 'imagen'),
  validarContenidoReal,
  parsearDatosMultipart,
  validate(crearComentarioSchema),
  crearEnContenido,
);

// UN comentario
router.patch(
  '/:comentario_id',
  autenticar,
  exigirSinRestriccion,
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
