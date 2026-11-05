import { Router } from 'express';
import { autenticar, autorizar } from '../middlewares/auth.middleware.js';
import { ROLES } from '../shared/auth/permissions.js';
import sancionRoutes from '../shared/moderation/sanctions.routes.js';

// Todo /api/admin es solo del superadmin: se protege una vez acá.
// Los apartados nuevos de Administración se montan debajo.
const router = Router();

router.use(autenticar, autorizar(ROLES.SUPERADMIN));

router.use('/usuarios', sancionRoutes);

export default router;