import { z } from 'zod';
import { marked } from 'marked';
// ─────────────────────────────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  imagen: 'No se permiten imágenes dentro del texto: usa los adjuntos',
  html: 'No se permite HTML dentro del texto',
  enlace: 'Los enlaces deben empezar con http://, https:// o mailto:',
  max: (n) => `El contenido no puede superar ${n} caracteres`,
};
// ─────────────────────────────────────────────────────────────────────────────
// Recorre el árbol del markdown (no usa regex: los bloques de código quedan fuera
// solos, y `<div>` o `![` dentro de un bloque de código son texto y se permiten).
function tokensProhibidos(markdown) {
  const encontrados = new Set();
  marked.walkTokens(marked.lexer(markdown), (token) => {
    if (token.type === 'image') encontrados.add('imagen');
    else if (token.type === 'html') encontrados.add('html');
    else if (
      token.type === 'link' &&
      !/^(https?:\/\/|mailto:)/i.test(token.href)
    ) {
      encontrados.add('enlace');
    }
  });
  return encontrados;
}
// ─────────────────────────────────────────────────────────────────────────────
// `mensajeMax` (opcional) reemplaza el mensaje por defecto del límite de caracteres.
function crearMarkdownSchema(max, { mensajeMax } = {}) {
  return z
    .string()
    .trim()
    .max(max, mensajeMax ?? ERROR_MESSAGES.max(max))
    .superRefine((markdown, ctx) => {
      for (const tipo of tokensProhibidos(markdown)) {
        ctx.addIssue({ code: 'custom', message: ERROR_MESSAGES[tipo] });
      }
    })
    .transform((markdown) => (markdown === '' ? null : markdown))
    .optional()
    .nullable();
}
// ─────────────────────────────────────────────────────────────────────────────
export { crearMarkdownSchema };
