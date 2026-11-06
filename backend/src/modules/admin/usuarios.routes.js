import express from 'express';
import validate from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import {
  buscarUsuariosQuerySchema,
  reportesUsuarioQuerySchema,
} from './usuarios.validation.js';
import { buscar, obtenerFicha, listarReportes } from './usuarios.controller.js';

// Se monta bajo /api/admin/usuarios. La protección (autenticar + superadmin)
// la pone el router de /api/admin; acá no se repite.
const router = express.Router();

router.get('/', validate(buscarUsuariosQuerySchema, 'query'), buscar);
router.get('/:id', validate(idParamSchema, 'params'), obtenerFicha);
router.get(
  '/:id/reportes',
  validate(idParamSchema, 'params'),
  validate(reportesUsuarioQuerySchema, 'query'),
  listarReportes,
);

export default router;