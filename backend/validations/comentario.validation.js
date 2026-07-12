import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  contenido: {
    min: 'El comentario no puede estar vacío',
    max: 'El comentario no puede superar 2000 caracteres',
    required: 'El contenido del comentario es requerido',
  },
  padre_id: {
    invalid: 'El id del comentario padre no es válido',
  },
  apunte_id: {
    invalid: 'El id del apunte no es válido',
  },
  comentario_id: {
    invalid: 'El id del comentario no es válido',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
const crearComentarioSchema = z.object({
  contenido: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? ERROR_MESSAGES.contenido.required
          : undefined,
    })
    .trim()
    .min(1, ERROR_MESSAGES.contenido.min)
    .max(2000, ERROR_MESSAGES.contenido.max),
  padre_id: z
    .string()
    .uuid(ERROR_MESSAGES.padre_id.invalid)
    .optional()
    .nullable(),
});
// ─────────────────────────────────────────────────────────────────────────────
const editarComentarioSchema = z.object({
  contenido: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? ERROR_MESSAGES.contenido.required
          : undefined,
    })
    .trim()
    .min(1, ERROR_MESSAGES.contenido.min)
    .max(2000, ERROR_MESSAGES.contenido.max),
});
// ─────────────────────────────────────────────────────────────────────────────
const apunteIdParamSchema = z.object({
  apunte_id: z.string().uuid(ERROR_MESSAGES.apunte_id.invalid),
});

const comentarioIdParamSchema = z.object({
  comentario_id: z.string().uuid(ERROR_MESSAGES.comentario_id.invalid),
});
// ─────────────────────────────────────────────────────────────────────────────
export {
  crearComentarioSchema,
  editarComentarioSchema,
  apunteIdParamSchema,
  comentarioIdParamSchema,
};
