import { z } from 'zod';
import { tieneEstadisticas } from '../content/contentRegistry.js';

// El tipo se valida contra el registro al momento de la petición (los módulos
// se registran al importarse), igual que `padre` en guardados.
const estadisticasParamsSchema = z.object({
  tipo: z
    .string()
    .refine((tipo) => tieneEstadisticas(tipo), 'Tipo de contenido sin estadísticas'),
});

const estadisticasQuerySchema = z.object({
  carrera_id: z.string().uuid('El id de la carrera no es válido').optional(),
});

export { estadisticasParamsSchema, estadisticasQuerySchema };