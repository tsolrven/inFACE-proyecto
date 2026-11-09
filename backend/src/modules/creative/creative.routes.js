import express from 'express';
import {
  listar,
  detalle,
  crear,
  actualizar,
  eliminar,
  subirImagen,
  quitarImagen,
  parrafosDeCapitulo,
  resolver,
  comentariosDeParrafos,
  hashtagsPopulares,
} from './creative.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import { exigirSinRestriccion } from '../../middlewares/restriction.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  crearObraSchema,
  actualizarObraSchema,
  listarObrasQuerySchema,
  hashtagsPopularesQuerySchema,
} from './creative.validation.js';
import { z } from 'zod';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import { publicacionLimiter } from '../../middlewares/rateLimiter.js';
import { upload } from '../../shared/files/multer.helper.js';
import { validarContenidoReal } from '../../shared/files/fileSignature.helper.js';
import {
  limpiarArchivosSiFalla,
  parsearDatosMultipart,
} from '../../shared/files/multipart.helper.js';
import { obtenerConfigAdjuntos } from '../../shared/content/contentRegistry.js';
import './creative.notifications.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const router = express.Router();

const MAX_ARCHIVOS = obtenerConfigAdjuntos('obra').max;

const comoObra = (req, _res, next) => {
  req.tipoContenido = 'obra'; 
  next();
};
// ────────────────────────────────────────────────────────────────────────────────────────
router.get('/', autenticar, validate(listarObrasQuerySchema, 'query'), listar);
router.get(
  '/hashtags',
  autenticar,
  validate(hashtagsPopularesQuerySchema, 'query'),
  hashtagsPopulares,
);
router.get('/:id', autenticar, validate(idParamSchema, 'params'), detalle);
router.get(
  '/:id/comentarios-parrafos',
  autenticar,
  validate(idParamSchema, 'params'),
  comentariosDeParrafos,
);
router.post(
  '/',
  autenticar,
  exigirSinRestriccion,
  publicacionLimiter,
  comoObra,
  limpiarArchivosSiFalla,
  upload.array('archivos', MAX_ARCHIVOS),
  validarContenidoReal,
  parsearDatosMultipart,
  validate(crearObraSchema),
  crear,
);
router.patch(
  '/:id',
  autenticar,
  exigirSinRestriccion,
  validate(idParamSchema, 'params'),
  validate(actualizarObraSchema),
  actualizar,
);
router.delete('/:id', autenticar, validate(idParamSchema, 'params'), eliminar);
// ────────────────────────────────────────────────────────────────────────────────────────
const imagenParams = z.object({
  id: z.string().uuid('El id no es válido'),
  personajeId: z.string().uuid('El id no es válido').optional(),
  pistaId: z.string().uuid('El id no es válido').optional(),
});
const subirUnaImagen = [
  autenticar,
  exigirSinRestriccion,
  publicacionLimiter,
  comoObra,
  limpiarArchivosSiFalla,
  upload.array('archivos', 1),
  validarContenidoReal,
  validate(imagenParams, 'params'),
  subirImagen,
];
router.put('/:id/portada', ...subirUnaImagen);
router.delete(
  '/:id/portada',
  autenticar,
  validate(imagenParams, 'params'),
  quitarImagen,
);
router.put('/:id/personajes/:personajeId/imagen', ...subirUnaImagen);
router.put('/:id/pistas/:pistaId/audio', ...subirUnaImagen);
router.delete(
  '/:id/pistas/:pistaId/audio',
  autenticar,
  validate(imagenParams, 'params'),
  quitarImagen,
);
router.delete(
  '/:id/personajes/:personajeId/imagen',
  autenticar,
  validate(imagenParams, 'params'),
  quitarImagen,
);
// ────────────────────────────────────────────────────────────────────────────────────────
const parrafoParams = z.object({
  id: z.string().uuid('El id no es válido'),
  indice: z.coerce.number().int().min(0).max(5000),
});
router.get(
  '/capitulos/:id/parrafos',
  autenticar,
  validate(idParamSchema, 'params'),
  parrafosDeCapitulo,
);
router.post(
  '/capitulos/:id/parrafos/:indice',
  autenticar,
  validate(parrafoParams, 'params'),
  resolver,
);
// ────────────────────────────────────────────────────────────────────────────────────────
export default router;