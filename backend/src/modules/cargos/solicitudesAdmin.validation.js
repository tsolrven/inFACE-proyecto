import { z } from 'zod';
import { paginacionQuerySchema } from '../../shared/validation/common.schemas.js';
import {
  ESTADOS_SOLICITUD,
  MOTIVO_MIN,
  MOTIVO_MAX,
} from './solicitudes.constants.js';

// 'todas' no filtra por estado. Por defecto se listan las pendientes.
const FILTROS_ESTADO = [...Object.values(ESTADOS_SOLICITUD), 'todas'];

const listarSolicitudesAdminQuerySchema = paginacionQuerySchema.extend({
  estado: z
    .enum(FILTROS_ESTADO, { error: 'El estado no es válido' })
    .default(ESTADOS_SOLICITUD.PENDIENTE),
});

const rechazarSolicitudSchema = z.object({
  motivo: z
    .string({ error: 'El motivo es requerido' })
    .trim()
    .min(MOTIVO_MIN, `El motivo debe tener al menos ${MOTIVO_MIN} caracteres`)
    .max(MOTIVO_MAX, `El motivo no puede superar ${MOTIVO_MAX} caracteres`),
});

export { listarSolicitudesAdminQuerySchema, rechazarSolicitudSchema };