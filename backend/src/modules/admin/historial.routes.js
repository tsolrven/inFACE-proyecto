import express from 'express';
import validate from '../../middlewares/validate.js';
import { listarHistorialQuerySchema } from './historial.validation.js';
import { listar } from './historial.controller.js';

// Se monta bajo /api/admin/historial. La protección (autenticar + superadmin)
// la pone el router de /api/admin.
const router = express.Router();

router.get('/', validate(listarHistorialQuerySchema, 'query'), listar);

export default router;