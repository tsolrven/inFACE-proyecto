import express from 'express';
import {
  obtenerMiPerfil,
  obtenerPerfilPublicoExport,
  actualizarMiPerfil,
  actualizarMisEtiquetasExport,
} from './perfil.controller.js';
import {
  solicitarEliminacion,
  cancelarEliminacion,
  cambiarContrasena,
  cambiarConsentimiento,
} from './cuenta.controller.js';
import {
  cambiarContrasenaSchema,
  consentimientoSchema,
} from './cuenta.validation.js';
import { autenticar } from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import {
  actualizarPerfilSchema,
  actualizarEtiquetasSchema,
} from './perfil.validation.js';

const router = express.Router();

router.get('/me', autenticar, obtenerMiPerfil); // GET /api/perfil/me
router.put(
  '/me',
  autenticar,
  validate(actualizarPerfilSchema),
  actualizarMiPerfil,
); // PUT /api/perfil/me
router.put(
  '/me/etiquetas',
  autenticar,
  validate(actualizarEtiquetasSchema),
  actualizarMisEtiquetasExport,
); // PUT /api/perfil/me/etiquetas

router.put(
  '/me/contrasena',
  autenticar,
  validate(cambiarContrasenaSchema),
  cambiarContrasena,
); // PUT    /api/perfil/me/contrasena  { actual, nueva }
router.put(
  '/me/consentimiento',
  autenticar,
  validate(consentimientoSchema),
  cambiarConsentimiento,
); // PUT    /api/perfil/me/consentimiento  { consentimiento_investigacion }

router.post('/me/eliminacion', autenticar, solicitarEliminacion); // POST   /api/perfil/me/eliminacion  { contrasena }
router.delete('/me/eliminacion', autenticar, cancelarEliminacion); // DELETE /api/perfil/me/eliminacion

router.get('/usuario/:nombre_usuario', autenticar, obtenerPerfilPublicoExport); // GET /api/perfil/usuario/:nombre_usuario

export default router;