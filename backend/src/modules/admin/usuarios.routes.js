import express from 'express';
import validate from '../../middlewares/validate.js';
import { idParamSchema } from '../../shared/validation/common.schemas.js';
import { buscarUsuariosQuerySchema } from './usuarios.validation.js';
import { buscar, obtenerFicha } from './usuarios.controller.js';

// Se monta bajo /api/admin/usuarios. La protección (autenticar + superadmin)
// la pone el router de /api/admin; acá no se repite.
const router = express.Router();

router.get('/', validate(buscarUsuariosQuerySchema, 'query'), buscar);
router.get('/:id', validate(idParamSchema, 'params'), obtenerFicha);

export default router;