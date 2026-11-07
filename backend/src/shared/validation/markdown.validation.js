import { z } from 'zod';
import { marked } from 'marked';
// ─────────────────────────────────────────────────────────────────────────────
const PROTOCOLO_ENLACE = /^(https?:\/\/|mailto:)/i;

const ERROR_MESSAGES = {
  imagen: 'No se permiten imágenes dentro del texto: usa los adjuntos',
  html: 'No se permite HTML dentro del texto',
  enlace: 'Los enlaces deben empezar con http://, https:// o mailto:',
  tarea: 'No se permiten listas de tareas',
  titulos: 'Solo se permiten títulos de nivel 2 y 3',
  sinTitulos: 'No se permiten títulos en este campo',
  generico: 'El texto contiene un formato no permitido',
  max: (n) => `El contenido no puede superar ${n} caracteres`,
};

const MENSAJE_POR_TIPO = {
  table: 'No se permiten tablas',
  blockquote: 'No se permiten citas en este campo',
  code: 'No se permiten bloques de código en este campo',
  hr: 'No se permiten líneas horizontales en este campo',
  def: 'No se permiten definiciones de enlaces por referencia',
};

const TIPOS_BASE = [
  'paragraph',
  'text',
  'space',
  'escape',
  'strong',
  'em',
  'codespan',
  'del',
  'br',
  'link',
  'list',
  'list_item',
];

const PRESETS = {
  completo: {
    tipos: new Set([...TIPOS_BASE, 'blockquote', 'code', 'hr']),
    nivelesTitulo: [2, 3],
  },
  creativo: {
    tipos: new Set([
      ...TIPOS_BASE.filter((t) => t !== 'codespan'),
      'blockquote',
      'hr',
    ]),
    nivelesTitulo: [2, 3],
  },
  reducido: {
    tipos: new Set(TIPOS_BASE),
    nivelesTitulo: [],
  },
};
// ─────────────────────────────────────────────────────────────────────────────
function mensajesProhibidos(markdown, preset) {
  const { tipos, nivelesTitulo } = PRESETS[preset];
  const mensajes = new Set();

  marked.walkTokens(marked.lexer(markdown), (token) => {
    switch (token.type) {
      case 'image':
        mensajes.add(ERROR_MESSAGES.imagen);
        break;
      case 'html':
        mensajes.add(ERROR_MESSAGES.html);
        break;
      case 'link':
        if (!PROTOCOLO_ENLACE.test(token.href)) {
          mensajes.add(ERROR_MESSAGES.enlace);
        }
        break;
      case 'heading':
        if (!nivelesTitulo.includes(token.depth)) {
          mensajes.add(
            nivelesTitulo.length
              ? ERROR_MESSAGES.titulos
              : ERROR_MESSAGES.sinTitulos,
          );
        }
        break;
      case 'checkbox':
        mensajes.add(ERROR_MESSAGES.tarea);
        break;
      default:
        if (token.type === 'list_item' && token.task) {
          mensajes.add(ERROR_MESSAGES.tarea);
        } else if (!tipos.has(token.type)) {
          mensajes.add(MENSAJE_POR_TIPO[token.type] ?? ERROR_MESSAGES.generico);
        }
    }
  });

  return mensajes;
}
// ─────────────────────────────────────────────────────────────────────────────
function crearMarkdownSchema(max, { mensajeMax, preset = 'completo' } = {}) {
  if (!PRESETS[preset]) {
    throw new Error(`Preset de Markdown desconocido: ${preset}`);
  }

  return z
    .string()
    .trim()
    .max(max, mensajeMax ?? ERROR_MESSAGES.max(max))
    .superRefine((markdown, ctx) => {
      for (const message of mensajesProhibidos(markdown, preset)) {
        ctx.addIssue({ code: 'custom', message });
      }
    })
    .transform((markdown) => (markdown === '' ? null : markdown))
    .optional()
    .nullable();
}
// ─────────────────────────────────────────────────────────────────────────────
export { crearMarkdownSchema };