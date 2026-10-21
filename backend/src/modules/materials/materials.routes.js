import express from 'express';
import {
  listar,
  detalle,
  crear,
  actualizar,
  eliminar,
} from './materials.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  crearApunteSchema,
  actualizarApunteSchema,
  listarApuntesQuerySchema,
} from './materials.validation.js';
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

const MAX_ARCHIVOS = obtenerConfigAdjuntos('apunte').max;

const comoApunte = (req, _res, next) => {
  req.tipoContenido = 'apunte'; // lo lee fileFilter de multer
  next();
};
// ────────────────────────────────────────────────────────────────────────────────────────
router.get(
  '/',
  autenticar,
  validate(listarApuntesQuerySchema, 'query'),
  listar,
);
router.get('/:id', autenticar, validate(idParamSchema, 'params'), detalle);
router.post(
  '/',
  autenticar,
  publicacionLimiter,
  comoApunte,
  limpiarArchivosSiFalla,
  upload.array('archivos', MAX_ARCHIVOS),
  validarContenidoReal,
  parsearDatosMultipart,
  validate(crearApunteSchema),
  crear,
);
router.patch(
  '/:id',
  autenticar,
  validate(idParamSchema, 'params'),
  validate(actualizarApunteSchema),
  actualizar,
);
router.delete('/:id', autenticar, validate(idParamSchema, 'params'), eliminar);
// ────────────────────────────────────────────────────────────────────────────────────────
export default router;
