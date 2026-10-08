import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  tipo: {
    invalid: 'Tipo de voto inválido, debe ser "up" o "down"',
    required: 'El tipo de voto es requerido',
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
export { votarSchema };
