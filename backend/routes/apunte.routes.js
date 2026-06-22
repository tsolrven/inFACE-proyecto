import express from 'express';
import {
  listar,
  detalle,
  crear,
  actualizar,
  eliminar,
} from '../controllers/apunte.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', listar);
router.get('/:id', detalle);
router.post('/', autenticar, crear);
router.patch('/:id', autenticar, actualizar);
router.delete('/:id', autenticar, eliminar);

export default router;
