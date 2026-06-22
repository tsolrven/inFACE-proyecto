import express from 'express';
import { subir, eliminar } from '../controllers/archivo.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import { upload } from '../helpers/multer.helper.js';

const router = express.Router();

router.post('/:apunte_id', autenticar, upload.single('archivo'), subir);
router.delete('/:id', autenticar, eliminar);

export default router;
