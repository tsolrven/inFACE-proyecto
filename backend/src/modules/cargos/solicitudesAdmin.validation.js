import { z } from 'zod';
import { paginacionQuerySchema } from '../../shared/validation/common.schemas.js';
import { ESTADOS_SOLICITUD } from './solicitudes.constants.js';

// 'todas' no filtra por estado. Por defecto se listan las pendientes.
const FILTROS_ESTADO = [...Object.values(ESTADOS_SOLICITUD), 'todas'];

const listarSolicitudesAdminQuerySchema = paginacionQuerySchema.extend({
  estado: z
    .enum(FILTROS_ESTADO, { error: 'El estado no es válido' })
    .default(ESTADOS_SOLICITUD.PENDIENTE),
});

export { listarSolicitudesAdminQuerySchema };