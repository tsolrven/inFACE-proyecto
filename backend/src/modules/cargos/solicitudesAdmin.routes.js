import express from 'express';
import validate from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import {
  listarSolicitudesAdminQuerySchema,
  rechazarSolicitudSchema,
} from './solicitudesAdmin.validation.js';
import {
  listar,
  detalle,
  aprobar,
  rechazar,
} from './solicitudesAdmin.controller.js';

// Se monta bajo /api/admin/solicitudes-cargo. La protección (autenticar +
// superadmin) la pone el router de /api/admin; acá no se repite.
const router = express.Router();

router.get('/', validate(listarSolicitudesAdminQuerySchema, 'query'), listar);
router.get('/:id', validate(idParamSchema, 'params'), detalle);
router.post('/:id/aprobar', validate(idParamSchema, 'params'), aprobar);
router.post(
  '/:id/rechazar',
  validate(idParamSchema, 'params'),
  validate(rechazarSolicitudSchema, 'body'),
  rechazar,
);

export default router;