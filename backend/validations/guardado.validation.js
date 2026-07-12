import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  apunte_id: {
    invalid: 'El id del apunte no es válido',
  },
  comentario_id: {
    invalid: 'El id del comentario no es válido',
  },
  tipo: {
    invalid: 'El tipo debe ser "apunte" o "comentario"',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
const apunteIdParamSchema = z.object({
  apunte_id: z.string().uuid(ERROR_MESSAGES.apunte_id.invalid),
});

const comentarioIdParamSchema = z.object({
  comentario_id: z.string().uuid(ERROR_MESSAGES.comentario_id.invalid),
});
// ─────────────────────────────────────────────────────────────────────────────
const listarGuardadosQuerySchema = z.object({
  tipo: z
    .enum(['apunte', 'comentario'], {
      error: () => ERROR_MESSAGES.tipo.invalid,
    })
    .optional(),
  pagina: z.string().optional(),
  limite: z.string().optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
export {
  apunteIdParamSchema,
  comentarioIdParamSchema,
  listarGuardadosQuerySchema,
};
