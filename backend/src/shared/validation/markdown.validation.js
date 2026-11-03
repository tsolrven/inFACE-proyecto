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

// Mensaje por tipo de token que no está en la lista cerrada del preset.
const MENSAJE_POR_TIPO = {
  table: 'No se permiten tablas',
  blockquote: 'No se permiten citas en este campo',
  code: 'No se permiten bloques de código en este campo',
  hr: 'No se permiten líneas horizontales en este campo',
  def: 'No se permiten definiciones de enlaces por referencia',
};

// Lista CERRADA de lo que el backend acepta (tipos de token de marked).
// Todo lo que no esté aquí se rechaza. Cada preset corresponde a una barra del
// editor (shared/editor/editorExtensions.js): el preset del editor es
// comodidad, esta lista es la garantía.
// Incluye 'link' en ambos: marked convierte una URL escrita como texto en
// enlace; igualmente se valida el protocolo. Incluye 'del' (tachado) en ambos
// porque no es peligroso y evita rechazar texto literal con ~~.
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
  // Foro: barra completa del editor.
  completo: {
    tipos: new Set([...TIPOS_BASE, 'blockquote', 'code', 'hr']),
    nivelesTitulo: [2, 3],
  },
  // Descripciones cortas (Materiales): barra reducida.
  reducido: {
    tipos: new Set(TIPOS_BASE),
    nivelesTitulo: [],
  },
};
// ─────────────────────────────────────────────────────────────────────────────
// Recorre el árbol del markdown (no usa regex: los bloques de código quedan fuera
// solos, y `<div>` o `![` dentro de un bloque de código son texto y se permiten).
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
// `preset`: 'completo' (por defecto) o 'reducido'.
// `mensajeMax` (opcional) reemplaza el mensaje por defecto del límite de caracteres.
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
