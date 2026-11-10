import { Router } from 'express';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { ROLES } from '../shared/auth/permissions.js';
import sancionRoutes from '../shared/moderation/sanctions.routes.js';
import usuariosRoutes from '../modules/admin/usuarios.routes.js';
import historialRoutes from '../modules/admin/historial.routes.js';
import solicitudesCargoRoutes from '../modules/cargos/solicitudesAdmin.routes.js';
import cargosAdminRoutes from '../modules/cargos/cargosAdmin.routes.js';

// Todo /api/admin es solo del superadmin: se protege una vez acá.
// Los apartados nuevos de Administración se montan debajo.
const router = Router();

router.use(autenticar, autorizar(ROLES.SUPERADMIN));

router.use('/usuarios', usuariosRoutes);
router.use('/usuarios', sancionRoutes);
router.use('/historial', historialRoutes);
router.use('/solicitudes-cargo', solicitudesCargoRoutes);
router.use('/cargos', cargosAdminRoutes);

export default router;