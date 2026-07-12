import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { php } from '@codemirror/lang-php';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { csharp } from '@codemirror/legacy-modes/mode/clike';

// catálogo de lenguajes soportados por el editor de snippets.
// `value` es lo que se guarda en la BD (apunte.lenguaje_snippet).
// `extension` entrega la extensión de CodeMirror que colorea la sintaxis;
// null = texto plano, sin resaltado.
export const LENGUAJES_SNIPPET = [
  { value: 'texto', label: 'Texto plano', extension: null },
  {
    value: 'javascript',
    label: 'JavaScript',
    extension: () => javascript({ jsx: true }),
  },
  {
    value: 'typescript',
    label: 'TypeScript',
    extension: () => javascript({ jsx: true, typescript: true }),
  },
  { value: 'python', label: 'Python', extension: () => python() },
  { value: 'java', label: 'Java', extension: () => java() },
  { value: 'c', label: 'C', extension: () => cpp() },
  { value: 'cpp', label: 'C++', extension: () => cpp() },
  {
    value: 'csharp',
    label: 'C#',
    extension: () => StreamLanguage.define(csharp),
  },
  { value: 'html', label: 'HTML', extension: () => html() },
  { value: 'css', label: 'CSS', extension: () => css() },
  { value: 'json', label: 'JSON', extension: () => json() },
  { value: 'sql', label: 'SQL', extension: () => sql() },
  { value: 'php', label: 'PHP', extension: () => php() },
  { value: 'rust', label: 'Rust', extension: () => rust() },
  {
    value: 'go',
    label: 'Go',
    extension: () => StreamLanguage.define(go),
  },
  {
    value: 'bash',
    label: 'Bash',
    extension: () => StreamLanguage.define(shell),
  },
  { value: 'markdown', label: 'Markdown', extension: () => markdown() },
];

export function obtenerLenguaje(value) {
  return (
    LENGUAJES_SNIPPET.find((l) => l.value === value) ?? LENGUAJES_SNIPPET[0]
  );
}

export function extensionParaLenguaje(value) {
  const lenguaje = obtenerLenguaje(value);
  return lenguaje.extension ? [lenguaje.extension()] : [];
}
