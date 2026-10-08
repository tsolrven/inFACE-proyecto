import { z } from 'zod';
import { admiteComentarios } from '../content/contentRegistry.js';
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
  tipo: {
    invalid: 'Este tipo de contenido no admite comentarios',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
// Params de /:tipo/:id para listar o crear comentarios de un contenido
const contenidoComentableParamSchema = z.object({
  tipo: z.string().refine(admiteComentarios, ERROR_MESSAGES.tipo.invalid),
  id: z.string().uuid('El id no es válido'),
});
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
export {
  contenidoComentableParamSchema,
  crearComentarioSchema,
  editarComentarioSchema,
};
