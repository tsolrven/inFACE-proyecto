import express from 'express';
import validate from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import { listarSolicitudesAdminQuerySchema } from './solicitudesAdmin.validation.js';
import { listar, detalle } from './solicitudesAdmin.controller.js';

// Se monta bajo /api/admin/solicitudes-cargo. La protección (autenticar +
// superadmin) la pone el router de /api/admin; acá no se repite.
const router = express.Router();

router.get('/', validate(listarSolicitudesAdminQuerySchema, 'query'), listar);
router.get('/:id', validate(idParamSchema, 'params'), detalle);

export default router;