import express from 'express';
import {
  listar,
  detalle,
  crear,
  actualizar,
  eliminar,
  aceptar,
  desmarcar,
} from './forum.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  crearHiloSchema,
  actualizarHiloSchema,
  listarHilosQuerySchema,
  aceptarRespuestaSchema,
} from './forum.validation.js';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import { publicacionLimiter } from '../../middlewares/rateLimiter.js';
import { upload } from '../../shared/files/multer.helper.js';
import { validarContenidoReal } from '../../shared/files/fileSignature.helper.js';
import {
  limpiarArchivosSiFalla,
  parsearDatosMultipart,
} from '../../shared/files/multipart.helper.js';
import { obtenerConfigAdjuntos } from '../../shared/content/contentRegistry.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const router = express.Router();

const MAX_ARCHIVOS = obtenerConfigAdjuntos('hilo').max;

const comoHilo = (req, _res, next) => {
  req.tipoContenido = 'hilo'; // lo lee fileFilter de multer (solo imágenes)
  next();
};
// ────────────────────────────────────────────────────────────────────────────────────────
router.get('/', autenticar, validate(listarHilosQuerySchema, 'query'), listar);
router.get('/:id', autenticar, validate(idParamSchema, 'params'), detalle);
router.post(
  '/',
  autenticar,
  publicacionLimiter,
  comoHilo,
  limpiarArchivosSiFalla,
  upload.array('archivos', MAX_ARCHIVOS),
  validarContenidoReal,
  parsearDatosMultipart,
  validate(crearHiloSchema),
  crear,
);
router.patch(
  '/:id',
  autenticar,
  validate(idParamSchema, 'params'),
  validate(actualizarHiloSchema),
  actualizar,
);
router.delete('/:id', autenticar, validate(idParamSchema, 'params'), eliminar);
router.put(
  '/:id/respuesta-aceptada',
  autenticar,
  validate(idParamSchema, 'params'),
  validate(aceptarRespuestaSchema),
  aceptar,
);
router.delete(
  '/:id/respuesta-aceptada',
  autenticar,
  validate(idParamSchema, 'params'),
  desmarcar,
);
// ────────────────────────────────────────────────────────────────────────────────────────
export default router;
