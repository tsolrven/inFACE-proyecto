import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  tipo: {
    invalid: 'Tipo de voto inválido, debe ser "up" o "down"',
    required: 'El tipo de voto es requerido',
  },
  apunte_id: {
    invalid: 'El id del apunte no es válido',
  },
  comentario_id: {
    invalid: 'El id del comentario no es válido',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
const votarSchema = z.object({
  tipo: z.enum(['up', 'down'], {
    error: (issue) =>
      issue.input === undefined
        ? ERROR_MESSAGES.tipo.required
        : ERROR_MESSAGES.tipo.invalid,
  }),
});
// ─────────────────────────────────────────────────────────────────────────────
const apunteIdParamSchema = z.object({
  apunte_id: z.string().uuid(ERROR_MESSAGES.apunte_id.invalid),
});

const comentarioIdParamSchema = z.object({
  comentario_id: z.string().uuid(ERROR_MESSAGES.comentario_id.invalid),
});
// ─────────────────────────────────────────────────────────────────────────────
export { votarSchema, apunteIdParamSchema, comentarioIdParamSchema };
