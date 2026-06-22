import express from 'express';
import { listarCarreras, listarRamos } from '../controllers/ramo.controller.js';

const router = express.Router();

router.get('/carreras', listarCarreras);
router.get('/carreras/:carrera_id', listarRamos);

export default router;
