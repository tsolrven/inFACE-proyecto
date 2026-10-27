import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import '@/shared/markdown/markdown.css';

// Mismos protocolos que acepta el backend (shared/validation/markdown.validation.js).
const PROTOCOLO_SEGURO = /^(https?:|mailto:)/i;

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [
  [rehypeHighlight, { detect: false, ignoreMissing: true }],
];

// Imágenes: solo como adjuntos. Tablas y checkboxes: fuera de alcance por ahora.
const ELEMENTOS_BLOQUEADOS = [
  'img',
  'input',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

// Se aplica a TODA url (href, src...) antes de renderizar. '' = sin enlace.
function urlSegura(url) {
  return PROTOCOLO_SEGURO.test(url.trim()) ? url : '';
}

const COMPONENTS = {
  a: ({ href, children }) =>
    href ? (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer nofollow ugc'
      >
        {children}
      </a>
    ) : (
      <span>{children}</span>
    ),
};

/**
 * Renderiza Markdown de usuario de forma segura. Reutilizable en cualquier módulo.
 * No interpreta HTML crudo (no hay rehype-raw) y no muestra imágenes embebidas.
 */
export default function MarkdownView({ contenido }) {
  if (!contenido) return null;

  return (
    <div className='md-view'>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        urlTransform={urlSegura}
        disallowedElements={ELEMENTOS_BLOQUEADOS}
        unwrapDisallowed
        components={COMPONENTS}
      >
        {contenido}
      </ReactMarkdown>
    </div>
  );
}
