import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Markdown } from '@tiptap/markdown';
import { common, createLowlight } from 'lowlight';

const PROTOCOLO_PERMITIDO = /^(https?:|mailto:)/i;

export function normalizarEnlace(entrada = '') {
  const url = entrada.trim();
  if (!url || /\s/.test(url)) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    return PROTOCOLO_PERMITIDO.test(url) ? url : null;
  }
  return `https://${url}`;
}

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

export const EXTENSIONES_EDITOR = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    underline: false,
    codeBlock: false,
    link: LINK,
  }),
  BLOQUE_CODIGO,
  Markdown,
];

export const EXTENSIONES_EDITOR_CREATIVO = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    underline: false,
    code: false,
    codeBlock: false,
    link: LINK,
  }),
  Markdown,
];

export const EXTENSIONES_EDITOR_REDUCIDO = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    horizontalRule: false,
    strike: false,
    underline: false,
    codeBlock: false,
    link: false,
  }),
  Markdown,
];