import express from 'express';
import validate from '../../middlewares/validate.js';
import { idParamSchema } from '../validation/common.schemas.js';
import {
  crearSancionSchema,
  revocarSancionSchema,
  sancionParamSchema,
} from './sanctions.validation.js';
import {
  listarSanciones,
  aplicarSancion,
  revocarSancionDeUsuario,
} from './sanctions.controller.js';

// Se monta bajo /api/admin/usuarios. La protección (autenticar + superadmin)
// la pone el router de /api/admin; acá no se repite.
const router = express.Router();

router.get(
  '/:id/sanciones',
  validate(idParamSchema, 'params'),
  listarSanciones,
);
router.post(
  '/:id/sanciones',
  validate(idParamSchema, 'params'),
  validate(crearSancionSchema),
  aplicarSancion,
);
router.post(
  '/:id/sanciones/:sancionId/revocar',
  validate(sancionParamSchema, 'params'),
  validate(revocarSancionSchema),
  revocarSancionDeUsuario,
);

export default router;