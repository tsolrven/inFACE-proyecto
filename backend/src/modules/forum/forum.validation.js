import { z } from 'zod';
import { paginacionQuerySchema } from '../../shared/validation/common.schemas.js';
import {
  hashtagsSchema,
  hashtagFiltroSchema,
} from '../../shared/hashtags/hashtags.validation.js';
import { crearMarkdownSchema } from '../../shared/validation/markdown.validation.js';
// ─────────────────────────────────────────────────────────────────────────────
const TITULO_MIN = 3;
const TITULO_MAX = 150;
const CONTENIDO_MAX = 10000; // debe coincidir con frontend/features/forum/utils/limites.js

const ERROR_MESSAGES = {
  ramo: {
    invalid: 'El ramo seleccionado no es válido',
    required: 'Debes seleccionar un ramo',
  },
  titulo: {
    min: `El título debe tener al menos ${TITULO_MIN} caracteres`,
    max: `El título no puede superar ${TITULO_MAX} caracteres`,
    required: 'El título es requerido',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
const tituloSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? ERROR_MESSAGES.titulo.required : undefined,
  })
  .trim()
  .min(TITULO_MIN, ERROR_MESSAGES.titulo.min)
  .max(TITULO_MAX, ERROR_MESSAGES.titulo.max);

const contenidoSchema = crearMarkdownSchema(CONTENIDO_MAX);
// ─────────────────────────────────────────────────────────────────────────────
const crearHiloSchema = z.object({
  ramo_id: z
    .string({
      error: (issue) =>
        issue.input === undefined ? ERROR_MESSAGES.ramo.required : undefined,
    })
    .uuid(ERROR_MESSAGES.ramo.invalid),
  titulo: tituloSchema,
  contenido: contenidoSchema,
  hashtags: hashtagsSchema,
});
// ─────────────────────────────────────────────────────────────────────────────
// El ramo no se puede cambiar: z.object descarta `ramo_id` si llega en el PATCH.
const actualizarHiloSchema = z.object({
  titulo: tituloSchema.optional(),
  contenido: contenidoSchema,
  hashtags: hashtagsSchema,
});
// ─────────────────────────────────────────────────────────────────────────────
const listarHilosQuerySchema = paginacionQuerySchema.extend({
  carrera_id: z.string().uuid('El id de la carrera no es válido').optional(),
  ramo_id: z.string().uuid('El id del ramo no es válido').optional(),
  hashtag: hashtagFiltroSchema.optional(),
  orden: z
    .enum(['recientes', 'populares'], { error: 'Orden inválido' })
    .optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
const aceptarRespuestaSchema = z.object({
  comentario_id: z
    .string({
      error: (issue) =>
        issue.input === undefined ? 'El comentario es requerido' : undefined,
    })
    .uuid('El id del comentario no es válido'),
});
// ─────────────────────────────────────────────────────────────────────────────
export {
  TITULO_MIN,
  TITULO_MAX,
  CONTENIDO_MAX,
  crearHiloSchema,
  actualizarHiloSchema,
  listarHilosQuerySchema,
  aceptarRespuestaSchema,
};
