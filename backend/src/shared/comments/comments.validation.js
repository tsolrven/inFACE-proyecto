import { z } from 'zod';
import { admiteComentarios } from '../content/contentRegistry.js';
import { paginacionQuerySchema } from '../validation/common.schemas.js';
import { ORDENES_COMENTARIO } from './comments.constants.js';
// ─────────────────────────────────────────────────────────────────────────────
const MAX_LONGITUD_COMENTARIO = 2000;

const ERROR_MESSAGES = {
  contenido: {
    min: 'El comentario no puede estar vacío',
    max: `El comentario no puede superar ${MAX_LONGITUD_COMENTARIO} caracteres`,
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
// El texto es opcional si viene una imagen. Esa regla (texto o imagen) la
// aplica crearComentario: Zod no ve el archivo, que llega por multer.
const crearComentarioSchema = z.object({
  contenido: z
    .string()
    .trim()
    .max(MAX_LONGITUD_COMENTARIO, ERROR_MESSAGES.contenido.max)
    .default(''),
  padre_id: z
    .string()
    .uuid(ERROR_MESSAGES.padre_id.invalid)
    .optional()
    .nullable(),
});
// ─────────────────────────────────────────────────────────────────────────────
// `contenido` sigue siendo obligatorio (el cliente siempre manda el texto
// completo), pero puede quedar vacío si el comentario conserva su imagen.
// Esa regla la aplica editarComentario, que sabe si hay imagen.
const editarComentarioSchema = z.object({
  contenido: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? ERROR_MESSAGES.contenido.required
          : undefined,
    })
    .trim()
    .max(MAX_LONGITUD_COMENTARIO, ERROR_MESSAGES.contenido.max),
  quitar_imagen: z.boolean().optional().default(false),
});
// ─────────────────────────────────────────────────────────────────────────────
// Query de los listados de comentarios (raíces y "más respuestas").
const listarComentariosQuerySchema = paginacionQuerySchema
  .pick({ limite: true })
  .extend({
    orden: z
      .enum(ORDENES_COMENTARIO, {
        error: 'Orden inválido: usa mejores, nuevos o antiguos',
      })
      .default('mejores'),
    cursor: z.string().max(300, 'Cursor inválido').optional(),
  });
// ─────────────────────────────────────────────────────────────────────────────
export {
  MAX_LONGITUD_COMENTARIO,
  contenidoComentableParamSchema,
  crearComentarioSchema,
  editarComentarioSchema,
  listarComentariosQuerySchema,
};
