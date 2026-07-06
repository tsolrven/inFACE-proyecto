import express from 'express';
import { listarCarreras, listarRamos } from '../controllers/ramo.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = express.Router();

// pública a propósito: es un catálogo estático (nombre/código de carrera),
// no contenido de usuario. Register.jsx la necesita para el select de
// carrera ANTES de tener token (todavía no existe la cuenta).
router.get('/carreras', listarCarreras);
router.get('/carreras/:carrera_id', autenticar, listarRamos);

export default router;
