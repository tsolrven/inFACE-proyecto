import { z } from 'zod';
import { paginacionQuerySchema } from '../../shared/validation/common.schemas.js';
import {
  hashtagsSchema,
  hashtagFiltroSchema,
} from '../../shared/hashtags/hashtags.validation.js';
import { crearMarkdownSchema } from '../../shared/validation/markdown.validation.js';
import { busquedaQuerySchema } from '../../shared/search/busqueda.validation.js';
// ─────────────────────────────────────────────────────────────────────────────
const TITULO_MIN = 3;
const TITULO_MAX = 150;
const CONTENIDO_MAX = 10000; // deben coincidir con frontend/features/announcements/utils/limites.js

const ERROR_MESSAGES = {
  carrera: { invalid: 'La carrera seleccionada no es válida' },
  flair: { invalid: 'El flair seleccionado no es válido' },
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

// null = quitar el flair
const flairIdSchema = z
  .string()
  .uuid(ERROR_MESSAGES.flair.invalid)
  .nullable()
  .optional();
// ─────────────────────────────────────────────────────────────────────────────
// La carrera no viaja en el body: es la del usuario (z.object descarta cualquier `carrera_id`).
const crearAnuncioSchema = z.object({
  titulo: tituloSchema,
  contenido: contenidoSchema,
  flair_id: flairIdSchema,
  hashtags: hashtagsSchema,
});
// ─────────────────────────────────────────────────────────────────────────────
// La carrera no se puede cambiar: z.object descarta `carrera_id` en el PATCH.
const actualizarAnuncioSchema = z.object({
  titulo: tituloSchema.optional(),
  contenido: contenidoSchema,
  flair_id: flairIdSchema,
  hashtags: hashtagsSchema,
});
// ─────────────────────────────────────────────────────────────────────────────
const listarAnunciosQuerySchema = paginacionQuerySchema.extend({
  carrera_id: z.string().uuid(ERROR_MESSAGES.carrera.invalid).optional(),
  flair_id: z.string().uuid(ERROR_MESSAGES.flair.invalid).optional(),
  hashtag: hashtagFiltroSchema.optional(),
  busqueda: busquedaQuerySchema,
  orden: z
    .enum(['recientes', 'populares'], { error: 'Orden inválido' })
    .optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
export {
  TITULO_MIN,
  TITULO_MAX,
  CONTENIDO_MAX,
  crearAnuncioSchema,
  actualizarAnuncioSchema,
  listarAnunciosQuerySchema,
};
