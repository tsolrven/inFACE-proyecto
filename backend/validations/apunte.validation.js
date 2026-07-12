import { z } from 'zod';
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
  link_repositorio: {
    invalid: 'El link del repositorio debe ser una URL válida',
  },
  codigo_snippet: {
    max: 'El snippet no puede superar 20000 caracteres',
  },
  lenguaje_snippet: {
    invalid: 'El lenguaje seleccionado no es válido',
  },
  hashtags: {
    max_cantidad: 'No puedes agregar más de 10 hashtags',
    pattern: 'Los hashtags solo pueden tener letras, números y guiones bajos',
    max_largo: 'Cada hashtag no puede superar 30 caracteres',
  },
};
// ─────────────────────────────────────────────────────────────────────────────
const hashtagsSchema = z
  .array(
    z
      .string()
      .min(1)
      .max(30, ERROR_MESSAGES.hashtags.max_largo)
      .regex(/^[a-zA-Z0-9_]+$/, ERROR_MESSAGES.hashtags.pattern),
  )
  .max(10, ERROR_MESSAGES.hashtags.max_cantidad)
  .optional();

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
  .max(2000, ERROR_MESSAGES.descripcion.max)
  .optional()
  .nullable();

const tipoSchema = z.enum(TIPOS_APUNTE, { error: ERROR_MESSAGES.tipo.invalid });

const linkRepositorioSchema = z
  .string()
  .trim()
  .url(ERROR_MESSAGES.link_repositorio.invalid)
  .optional()
  .nullable();

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
  link_repositorio: linkRepositorioSchema,
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
  link_repositorio: linkRepositorioSchema,
  codigo_snippet: codigoSnippetSchema,
  lenguaje_snippet: lenguajeSnippetSchema,
  hashtags: hashtagsSchema,
});
// ─────────────────────────────────────────────────────────────────────────────
const apunteIdParamSchema = z.object({
  id: z.string().uuid('El id del apunte no es válido'),
});
// ─────────────────────────────────────────────────────────────────────────────
export { crearApunteSchema, actualizarApunteSchema, apunteIdParamSchema };
