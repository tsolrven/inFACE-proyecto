import express from 'express';
import validate from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import { revocarCargoSchema } from './cargosAdmin.validation.js';
import { revocar } from './cargosAdmin.controller.js';

// Se monta bajo /api/admin/cargos. La protección (autenticar + superadmin)
// la pone el router de /api/admin; acá no se repite.
const router = express.Router();

router.post(
  '/:id/revocar',
  validate(idParamSchema, 'params'),
  validate(revocarCargoSchema, 'body'),
  revocar,
);

export default router;