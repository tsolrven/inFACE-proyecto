import express from 'express';
import { autenticar } from '../../middlewares/auth.middleware.js';
import {
  listar,
  leer,
  leerTodas,
  eliminar,
} from './notifications.controller.js';

const router = express.Router();

router.get('/', autenticar, listar);
router.patch('/leer-todas', autenticar, leerTodas);
router.patch('/:id/leer', autenticar, leer);
router.delete('/:id', autenticar, eliminar);

export default router;
