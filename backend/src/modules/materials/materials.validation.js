import { z } from 'zod';
import { MIME_MAP } from './fileType.helper.js';
import { paginacionQuerySchema } from '../../shared/validation/common.schemas.js';
import {
  hashtagsSchema,
  hashtagFiltroSchema,
} from '../../shared/hashtags/hashtags.validation.js';
// ─────────────────────────────────────────────────────────────────────────────
const TIPOS_APUNTE = ['apunte', 'codigo', 'guia', 'ejercicio', 'otro'];
const LENGUAJES_SNIPPET = [
  'texto',
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'html',
  'css',
  'json',
  'sql',
  'php',
  'rust',
  'go',
  'bash',
  'markdown',
];
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  ramo: {
    invalid: 'El ramo seleccionado no es válido',
    required: 'Debes seleccionar un ramo',
  },
  titulo: {
    min: 'El título debe tener al menos 3 caracteres',
    max: 'El título no puede superar 150 caracteres',
    required: 'El título es requerido',
  },
  descripcion: {
    max: 'La descripción no puede superar 2000 caracteres',
  },
  tipo: {
    invalid: `El tipo debe ser uno de: ${TIPOS_APUNTE.join(', ')}`,
  },
  links: {
    invalid:
      'Cada link debe ser una URL válida que empiece con http:// o https://',
    max_cantidad: 'No puedes agregar más de 5 links',
    max_largo: 'Cada link no puede superar 2048 caracteres',
  },
  codigo_snippet: {
    max: 'El snippet no puede superar 20000 caracteres',
  },
  lenguaje_snippet: {
    invalid: 'El lenguaje seleccionado no es válido',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
const tituloSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? ERROR_MESSAGES.titulo.required : undefined,
  })
  .trim()
  .min(3, ERROR_MESSAGES.titulo.min)
  .max(150, ERROR_MESSAGES.titulo.max);

const descripcionSchema = z
  .string()
  .trim()
  .max(2000, ERROR_MESSAGES.descripcion.max)
  .transform((d) => (d === '' ? null : d))
  .optional()
  .nullable();

const tipoSchema = z.enum(TIPOS_APUNTE, { error: ERROR_MESSAGES.tipo.invalid });

const linksSchema = z
  .array(
    z
      .string()
      .trim()
      .max(2048, ERROR_MESSAGES.links.max_largo)
      .pipe(
        z.url({
          protocol: /^https?$/,
          error: ERROR_MESSAGES.links.invalid,
        }),
      ),
  )
  .max(5, ERROR_MESSAGES.links.max_cantidad)
  .transform((links) => [...new Set(links)])
  .optional();

const codigoSnippetSchema = z
  .string()
  .max(20000, ERROR_MESSAGES.codigo_snippet.max)
  .optional()
  .nullable();

const lenguajeSnippetSchema = z
  .enum(LENGUAJES_SNIPPET, { error: ERROR_MESSAGES.lenguaje_snippet.invalid })
  .optional()
  .nullable();

// ─────────────────────────────────────────────────────────────────────────────
const crearApunteSchema = z.object({
  ramo_id: z
    .string({
      error: (issue) =>
        issue.input === undefined ? ERROR_MESSAGES.ramo.required : undefined,
    })
    .uuid(ERROR_MESSAGES.ramo.invalid),
  titulo: tituloSchema,
  descripcion: descripcionSchema,
  tipo: tipoSchema.optional(),
  links: linksSchema,
  codigo_snippet: codigoSnippetSchema,
  lenguaje_snippet: lenguajeSnippetSchema,
  hashtags: hashtagsSchema,
});
// ─────────────────────────────────────────────────────────────────────────────
const actualizarApunteSchema = z.object({
  ramo_id: z.string().uuid(ERROR_MESSAGES.ramo.invalid).optional(),
  titulo: tituloSchema.optional(),
  descripcion: descripcionSchema,
  tipo: tipoSchema.optional(),
  links: linksSchema,
  codigo_snippet: codigoSnippetSchema,
  lenguaje_snippet: lenguajeSnippetSchema,
  hashtags: hashtagsSchema,
});
// ─────────────────────────────────────────────────────────────────────────────
const listarApuntesQuerySchema = paginacionQuerySchema.extend({
  carrera_id: z.string().uuid('El id de la carrera no es válido').optional(),
  ramo_id: z.string().uuid('El id del ramo no es válido').optional(),
  tipo: z.enum(TIPOS_APUNTE, { error: 'Tipo de material inválido' }).optional(),
  tipo_archivo: z
    .enum(Object.keys(MIME_MAP), { error: 'Tipo de archivo inválido' })
    .optional(),
  hashtag: hashtagFiltroSchema.optional(),
  orden: z
    .enum(['recientes', 'populares'], { error: 'Orden inválido' })
    .optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
export { crearApunteSchema, actualizarApunteSchema, listarApuntesQuerySchema };
