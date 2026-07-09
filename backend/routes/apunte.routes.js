import express from 'express';
import {
  listar,
  detalle,
  crear,
  actualizar,
  eliminar,
} from '../controllers/apunte.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import {
  crearApunteSchema,
  actualizarApunteSchema,
  apunteIdParamSchema,
} from '../validations/apunte.validation.js';

const router = express.Router();

router.get('/', autenticar, listar);
router.get(
  '/:id',
  autenticar,
  validate(apunteIdParamSchema, 'params'),
  detalle,
);
router.post('/', autenticar, validate(crearApunteSchema), crear);
router.patch(
  '/:id',
  autenticar,
  validate(apunteIdParamSchema, 'params'),
  validate(actualizarApunteSchema),
  actualizar,
);
router.delete(
  '/:id',
  autenticar,
  validate(apunteIdParamSchema, 'params'),
  eliminar,
);

export default router;
