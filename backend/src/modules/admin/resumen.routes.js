import express from 'express';
import { resumen } from './resumen.controller.js';

// Se monta bajo /api/admin/resumen. La protección (autenticar + superadmin)
// la pone el router de /api/admin.
const router = express.Router();

router.get('/', resumen);

export default router;