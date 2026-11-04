import express from 'express';
import {
  listar,
  detalle,
  crear,
  actualizar,
  eliminar,
} from './announcements.controller.js';
import { autenticar, autorizar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  crearAnuncioSchema,
  actualizarAnuncioSchema,
  listarAnunciosQuerySchema,
} from './announcements.validation.js';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import { publicacionLimiter } from '../../middlewares/rateLimiter.js';
import { upload } from '../../shared/files/multer.helper.js';
import { validarContenidoReal } from '../../shared/files/fileSignature.helper.js';
import {
  limpiarArchivosSiFalla,
  parsearDatosMultipart,
} from '../../shared/files/multipart.helper.js';
import { obtenerConfigAdjuntos } from '../../shared/content/contentRegistry.js';
import { ROLES_ANUNCIANTES } from '../../shared/auth/permissions.js';
// ────────────────────────────────────────────────────────────────────────────────────────
const router = express.Router();

const MAX_ARCHIVOS = obtenerConfigAdjuntos('anuncio').max;

const comoAnuncio = (req, _res, next) => {
  req.tipoContenido = 'anuncio'; // lo lee fileFilter de multer (imágenes y PDF)
  next();
};
// ────────────────────────────────────────────────────────────────────────────────────────
router.get(
  '/',
  autenticar,
  validate(listarAnunciosQuerySchema, 'query'),
  listar,
);
router.get('/:id', autenticar, validate(idParamSchema, 'params'), detalle);
// `autorizar` va ANTES de subir archivos: un estudiante recibe 403 sin que se
// escriba nada en disco. La regla por carrera la aplica el servicio.
router.post(
  '/',
  autenticar,
  autorizar(...ROLES_ANUNCIANTES),
  publicacionLimiter,
  comoAnuncio,
  limpiarArchivosSiFalla,
  upload.array('archivos', MAX_ARCHIVOS),
  validarContenidoReal,
  parsearDatosMultipart,
  validate(crearAnuncioSchema),
  crear,
);
router.patch(
  '/:id',
  autenticar,
  validate(idParamSchema, 'params'),
  validate(actualizarAnuncioSchema),
  actualizar,
);
router.delete('/:id', autenticar, validate(idParamSchema, 'params'), eliminar);
// ────────────────────────────────────────────────────────────────────────────────────────
export default router;
