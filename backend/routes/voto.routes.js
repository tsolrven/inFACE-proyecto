import express from 'express';
import {
  votarApunte,
  votarComentario,
} from '../controllers/voto.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/apunte/:apunte_id', autenticar, votarApunte);
router.post('/comentario/:comentario_id', autenticar, votarComentario);

export default router;
