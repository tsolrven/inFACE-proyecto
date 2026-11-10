import { z } from 'zod';
import { paginacionQuerySchema } from '../../shared/validation/common.schemas.js';
import { TIPOS_ACCION_ADMIN } from '../../shared/moderation/adminActions.js';

const listarHistorialQuerySchema = paginacionQuerySchema.extend({
  tipo: z
    .enum(Object.values(TIPOS_ACCION_ADMIN), {
      error: 'El tipo de acción no es válido',
    })
    .optional(),
});

export { listarHistorialQuerySchema };