import { z } from 'zod';

const estadisticasQuerySchema = z.object({
  carrera_id: z.string().uuid('El id de la carrera no es válido').optional(),
});

export { estadisticasQuerySchema };
