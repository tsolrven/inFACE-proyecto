import express from 'express';
import { subir, eliminar, descargar } from './files.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import { upload } from './multer.helper.js';
import { validarContenidoReal } from './fileSignature.helper.js';
import { subidaLimiter } from '../../middlewares/rateLimiter.js';
import validate from '../../middlewares/validate.js';
import { idParamSchema } from '../validation/common.schemas.js';

const router = express.Router();

router.post(
  '/:apunte_id',
  autenticar,
  subidaLimiter,
  upload.single('archivo'),
  validarContenidoReal,
  subir,
);
router.delete('/:id', autenticar, validate(idParamSchema, 'params'), eliminar);
router.get(
  '/:id/descargar',
  autenticar,
  validate(idParamSchema, 'params'),
  descargar,
);

export default router;
