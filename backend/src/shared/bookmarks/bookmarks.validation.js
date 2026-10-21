import { z } from 'zod';
import { tiposContenidoValidos } from '../content/contentRegistry.js';
import { paginacionQuerySchema } from '../validation/common.schemas.js';
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  tipo: {
    invalid: 'Tipo de contenido inválido',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
const listarGuardadosQuerySchema = paginacionQuerySchema.extend({
  tipo: z
    .string()
    .refine(
      (tipo) => tiposContenidoValidos().includes(tipo),
      ERROR_MESSAGES.tipo.invalid,
    )
    .optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
export { listarGuardadosQuerySchema };
