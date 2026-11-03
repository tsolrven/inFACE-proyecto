import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Markdown } from '@tiptap/markdown';
import { common, createLowlight } from 'lowlight';

// Mismos protocolos que acepta el backend (markdown.validation.js).
const PROTOCOLO_PERMITIDO = /^(https?:|mailto:)/i;

// Devuelve la URL lista para guardar, o null si no es válida.
// "ejemplo.cl" -> "https://ejemplo.cl"; "javascript:..." -> null
export function normalizarEnlace(entrada = '') {
  const url = entrada.trim();
  if (!url || /\s/.test(url)) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    return PROTOCOLO_PERMITIDO.test(url) ? url : null;
  }
  return `https://${url}`;
}

// 'common' trae los ~35 lenguajes habituales (el paquete completo pesa mucho más).
const lowlight = createLowlight(common);

const LINK = {
  openOnClick: false,
  autolink: true,
  defaultProtocol: 'https',
  isAllowedUri: (url) => PROTOCOLO_PERMITIDO.test(url),
};

const BLOQUE_CODIGO = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: null,
});

// Se crean una sola vez: useEditor no debe recibir extensiones nuevas en cada render.

// Barra completa: foro y cualquier módulo con contenido largo.
export const EXTENSIONES_EDITOR = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    underline: false, // no existe en Markdown estándar
    codeBlock: false, // lo reemplaza CodeBlockLowlight
    link: LINK,
  }),
  BLOQUE_CODIGO,
  Markdown,
];

// Barra reducida (descripciones cortas, ej. Materiales, que ya tiene campos
// propios para links y código): además de ocultar los botones, se desactivan
// las extensiones, para que ni los atajos de teclado, ni escribir "## ", "> ",
// "---" o "```", ni pegar contenido, ni escribir una URL puedan crearlos.
// Sin BLOQUE_CODIGO ni enlaces: esa sintaxis queda como texto plano.
// El código en línea se conserva.
export const EXTENSIONES_EDITOR_REDUCIDO = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    codeBlock: false,
    link: false, // verificado en @tiptap/starter-kit 3.32.0: acepta false
  }),
  Markdown,
];
