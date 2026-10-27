import express from 'express';
import { subir, eliminar, descargar, ver } from './files.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import { upload } from './multer.helper.js';
import { validarContenidoReal } from './fileSignature.helper.js';
import { subidaLimiter } from '../../middlewares/rateLimiter.js';
import validate from '../../middlewares/validate.js';
import {
  idParamSchema,
  contenidoParamSchema,
} from '../validation/common.schemas.js';
import { obtenerConfigAdjuntos } from '../content/contentRegistry.js';

const router = express.Router();

// rechaza antes de que multer escriba nada en disco si el tipo no admite adjuntos
function exigirAdjuntos(req, res, next) {
  try {
    obtenerConfigAdjuntos(req.params.tipo);
    next();
  } catch (err) {
    next(err);
  }
}

router.post(
  '/:tipo/:id',
  autenticar,
  validate(contenidoParamSchema, 'params'),
  exigirAdjuntos,
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
router.get('/:id/ver', autenticar, validate(idParamSchema, 'params'), ver);

export default router;
