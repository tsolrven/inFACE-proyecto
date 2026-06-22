import express from 'express';
import { listar, crear } from '../controllers/comentario.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:apunte_id', listar);
router.post('/:apunte_id', autenticar, crear);

export default router;
