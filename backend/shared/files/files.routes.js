import express from 'express';
import { subir, eliminar, descargar } from './files.controller.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import { upload } from './multer.helper.js';
import { validarContenidoReal } from './fileSignature.helper.js';

const router = express.Router();

router.post(
  '/:apunte_id',
  autenticar,
  upload.single('archivo'),
  validarContenidoReal,
  subir,
);
router.delete('/:id', autenticar, eliminar);
router.get('/:id/descargar', autenticar, descargar);

export default router;
