import express from 'express';
import { listarCarreras, listarRamos } from '../controllers/ramo.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/carreras', listarCarreras);
router.get('/carreras/:carrera_id', autenticar, listarRamos);

export default router;
