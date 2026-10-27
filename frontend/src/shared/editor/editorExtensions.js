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

// Se crea una sola vez: useEditor no debe recibir extensiones nuevas en cada render.
export const EXTENSIONES_EDITOR = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    underline: false, // no existe en Markdown estándar
    codeBlock: false, // lo reemplaza CodeBlockLowlight
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      isAllowedUri: (url) => PROTOCOLO_PERMITIDO.test(url),
    },
  }),
  CodeBlockLowlight.configure({ lowlight, defaultLanguage: null }),
  Markdown,
];
