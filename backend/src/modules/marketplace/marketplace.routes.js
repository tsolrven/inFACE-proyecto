import express from 'express';
import {
  listar,
  detalle,
  crear,
  actualizar,
  eliminar,
} from './marketplace.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  crearProductoSchema,
  actualizarProductoSchema,
  listarProductosQuerySchema,
} from './marketplace.validation.js';
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

const MAX_ARCHIVOS = obtenerConfigAdjuntos('producto').max;

const comoProducto = (req, _res, next) => {
  req.tipoContenido = 'producto'; 
  next();
};
// ────────────────────────────────────────────────────────────────────────────────────────
router.get(
  '/',
  autenticar,
  validate(listarProductosQuerySchema, 'query'),
  listar,
);
router.get('/:id', autenticar, validate(idParamSchema, 'params'), detalle);
router.post(
  '/',
  autenticar,
  publicacionLimiter,
  comoProducto,
  limpiarArchivosSiFalla,
  upload.array('archivos', MAX_ARCHIVOS),
  validarContenidoReal,
  parsearDatosMultipart,
  validate(crearProductoSchema),
  crear,
);
router.patch(
  '/:id',
  autenticar,
  validate(idParamSchema, 'params'),
  validate(actualizarProductoSchema),
  actualizar,
);
router.delete('/:id', autenticar, validate(idParamSchema, 'params'), eliminar);

export default router;
