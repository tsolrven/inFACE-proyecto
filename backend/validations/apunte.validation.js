import { z } from 'zod';
// ─────────────────────────────────────────────────────────────────────────────
const TIPOS_APUNTE = ['apunte', 'codigo', 'guia', 'ejercicio', 'otro'];
// catálogo de badges/logos que el usuario puede marcar manualmente para el apunte
// (independiente de los archivos reales que suba; ver fileMeta.js en el frontend)
const BADGES_VISUALES = [
  'pdf',
  'doc',
  'ppt',
  'excel',
  'zip',
  'imagen',
  'codigo',
  'github',
];
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
    invalid: 'Cada link debe ser una URL válida',
    max_cantidad: 'No puedes agregar más de 5 links',
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
  etiquetas_visuales: {
    invalid: `Cada badge debe ser uno de: ${BADGES_VISUALES.join(', ')}`,
    max_cantidad: 'No puedes marcar más de 8 badges',
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

const linksSchema = z
  .array(z.string().trim().url(ERROR_MESSAGES.links.invalid))
  .max(5, ERROR_MESSAGES.links.max_cantidad)
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

const etiquetasVisualesSchema = z
  .array(z.enum(BADGES_VISUALES, ERROR_MESSAGES.etiquetas_visuales.invalid))
  .max(8, ERROR_MESSAGES.etiquetas_visuales.max_cantidad)
  .optional();
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
  etiquetas_visuales: etiquetasVisualesSchema,
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
  etiquetas_visuales: etiquetasVisualesSchema,
});
// ─────────────────────────────────────────────────────────────────────────────
const apunteIdParamSchema = z.object({
  id: z.string().uuid('El id del apunte no es válido'),
});
// ─────────────────────────────────────────────────────────────────────────────
export { crearApunteSchema, actualizarApunteSchema, apunteIdParamSchema };
