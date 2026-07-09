import express from 'express';
import {
    obtenerMiPerfil,
    actualizarMiPerfil,
    actualizarMisEtiquetasExport,
} from '../controllers/perfil.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.js';
import { actualizarPerfilSchema, actualizarEtiquetasSchema } from '../validations/perfil.validation.js';

const router = express.Router();

router.get('/me', autenticar, obtenerMiPerfil); // GET /api/perfil/me
router.put('/me', autenticar, validate(actualizarPerfilSchema), actualizarMiPerfil); // PUT /api/perfil/me
router.put(
    '/me/etiquetas',
    autenticar,
    validate(actualizarEtiquetasSchema),
    actualizarMisEtiquetasExport,
); // PUT /api/perfil/me/etiquetas

export default router;