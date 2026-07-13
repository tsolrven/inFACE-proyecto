import express from 'express';
import { listar } from '../controllers/etiqueta.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', autenticar, listar); // GET /api/etiquetas?q=texto

export default router;