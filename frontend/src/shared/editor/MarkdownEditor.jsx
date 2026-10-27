import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import CharCounter from '@/shared/components/ui/CharCounter';
import {
  EXTENSIONES_EDITOR,
  normalizarEnlace,
} from '@/shared/editor/editorExtensions';
import '@/shared/markdown/markdown.css';

const LENGUAJES = [
  ['javascript', 'JavaScript'],
  ['typescript', 'TypeScript'],
  ['python', 'Python'],
  ['java', 'Java'],
  ['c', 'C'],
  ['cpp', 'C++'],
  ['csharp', 'C#'],
  ['sql', 'SQL'],
  ['xml', 'HTML / XML'],
  ['css', 'CSS'],
  ['json', 'JSON'],
  ['php', 'PHP'],
  ['rust', 'Rust'],
  ['go', 'Go'],
  ['bash', 'Bash'],
  ['markdown', 'Markdown'],
];

function Boton({ icono, titulo, activo = false, disabled = false, onClick }) {
  return (
    <button
      type='button'
      title={titulo}
      aria-label={titulo}
      aria-pressed={activo}
      disabled={disabled}
      // evita que el botón le quite el foco al editor
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-md text-[15px] transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        activo
          ? 'bg-white/[0.12] text-neutral-100'
          : 'text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-100'
      }`}
    >
      <i className={`ti ${icono}`} />
    </button>
  );
}

function Separador() {
  return <span className='mx-1 h-4 w-px bg-white/10' />;
}

/**
 * Editor visual (Tiptap) que entrega MARKDOWN. Reutilizable en cualquier módulo.
 * - valorInicial: markdown con el que arranca. Se lee solo al montar: para
 *   cargar otro contenido, el padre cambia la `key` del componente.
 * - onChange(markdown): se llama en cada cambio con el markdown ya recortado.
 * - max: límite de caracteres del markdown (el padre decide si bloquea el envío).
 */
export default function MarkdownEditor({
  valorInicial = '',
  onChange,
  max,
  disabled = false,
}) {
  const [markdown, setMarkdown] = useState(valorInicial.trim());
  const [enlace, setEnlace] = useState(null); // null = cerrado; texto = URL en edición
  const [errorEnlace, setErrorEnlace] = useState('');

  // onUpdate se fija al crear el editor: la ref evita usar un onChange viejo
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const editor = useEditor({
    extensions: EXTENSIONES_EDITOR,
    content: valorInicial,
    contentType: 'markdown',
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'md-view md-editor-contenido',
        'aria-label': 'Contenido del hilo',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const md = ed.getMarkdown().trim();
      setMarkdown(md);
      onChangeRef.current?.(md);
    },
  });

  // En Tiptap 3 el componente no se re-renderiza en cada transacción:
  // el estado de los botones se lee aquí.
  const estado = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) return null;
      return {
        negrita: ed.isActive('bold'),
        cursiva: ed.isActive('italic'),
        tachado: ed.isActive('strike'),
        codigo: ed.isActive('code'),
        h2: ed.isActive('heading', { level: 2 }),
        h3: ed.isActive('heading', { level: 3 }),
        vinetas: ed.isActive('bulletList'),
        numerada: ed.isActive('orderedList'),
        cita: ed.isActive('blockquote'),
        bloque: ed.isActive('codeBlock'),
        enlace: ed.isActive('link'),
        seleccionVacia: ed.state.selection.empty,
        lenguaje: ed.getAttributes('codeBlock').language ?? '',
        puedeDeshacer: ed.can().undo(),
        puedeRehacer: ed.can().redo(),
      };
    },
  });

  if (!editor || !estado) return null;

  const run = () => editor.chain().focus();
  const excedido = max != null && markdown.length > max;

  function abrirEnlace() {
    setErrorEnlace('');
    setEnlace(editor.getAttributes('link').href ?? '');
  }

  function aplicarEnlace() {
    const href = normalizarEnlace(enlace);
    if (!href) {
      setErrorEnlace('Usa un enlace http://, https:// o mailto:');
      return;
    }
    run().extendMarkRange('link').setLink({ href }).run();
    setEnlace(null);
  }

  function quitarEnlace() {
    run().extendMarkRange('link').unsetLink().run();
    setEnlace(null);
  }

  return (
    <div
      className={`overflow-hidden rounded-[10px] border bg-[#17171B] transition-colors focus-within:border-white/[0.25] ${
        excedido ? 'border-red-500/50' : 'border-white/[0.09]'
      }`}
    >
      <div className='flex flex-wrap items-center gap-0.5 border-b border-white/[0.07] px-2 py-1.5'>
        <Boton
          icono='ti-bold'
          titulo='Negrita'
          activo={estado.negrita}
          disabled={disabled}
          onClick={() => run().toggleBold().run()}
        />
        <Boton
          icono='ti-italic'
          titulo='Cursiva'
          activo={estado.cursiva}
          disabled={disabled}
          onClick={() => run().toggleItalic().run()}
        />
        <Boton
          icono='ti-strikethrough'
          titulo='Tachado'
          activo={estado.tachado}
          disabled={disabled}
          onClick={() => run().toggleStrike().run()}
        />
        <Boton
          icono='ti-code'
          titulo='Código en línea'
          activo={estado.codigo}
          disabled={disabled}
          onClick={() => run().toggleCode().run()}
        />
        <Boton
          icono='ti-link'
          titulo='Enlace (selecciona texto primero)'
          activo={estado.enlace}
          disabled={disabled || (estado.seleccionVacia && !estado.enlace)}
          onClick={abrirEnlace}
        />

        <Separador />

        <Boton
          icono='ti-h-2'
          titulo='Título grande (H2)'
          activo={estado.h2}
          disabled={disabled}
          onClick={() => run().toggleHeading({ level: 2 }).run()}
        />
        <Boton
          icono='ti-h-3'
          titulo='Título mediano (H3)'
          activo={estado.h3}
          disabled={disabled}
          onClick={() => run().toggleHeading({ level: 3 }).run()}
        />

        <Separador />

        <Boton
          icono='ti-list'
          titulo='Lista con viñetas'
          activo={estado.vinetas}
          disabled={disabled}
          onClick={() => run().toggleBulletList().run()}
        />
        <Boton
          icono='ti-list-numbers'
          titulo='Lista numerada'
          activo={estado.numerada}
          disabled={disabled}
          onClick={() => run().toggleOrderedList().run()}
        />
        <Boton
          icono='ti-blockquote'
          titulo='Cita'
          activo={estado.cita}
          disabled={disabled}
          onClick={() => run().toggleBlockquote().run()}
        />
        <Boton
          icono='ti-source-code'
          titulo='Bloque de código'
          activo={estado.bloque}
          disabled={disabled}
          onClick={() => run().toggleCodeBlock().run()}
        />
        <Boton
          icono='ti-separator-horizontal'
          titulo='Línea horizontal'
          disabled={disabled}
          onClick={() => run().setHorizontalRule().run()}
        />

        <Separador />

        <Boton
          icono='ti-arrow-back-up'
          titulo='Deshacer'
          disabled={disabled || !estado.puedeDeshacer}
          onClick={() => run().undo().run()}
        />
        <Boton
          icono='ti-arrow-forward-up'
          titulo='Rehacer'
          disabled={disabled || !estado.puedeRehacer}
          onClick={() => run().redo().run()}
        />

        {estado.bloque && (
          <select
            aria-label='Lenguaje del bloque de código'
            value={estado.lenguaje}
            disabled={disabled}
            onChange={(e) =>
              run()
                .updateAttributes('codeBlock', {
                  language: e.target.value || null,
                })
                .run()
            }
            className='ml-auto h-7 rounded-md border border-white/[0.09] bg-[#1E1E24] px-2 text-[11.5px] text-neutral-300 outline-none'
          >
            <option value=''>Sin lenguaje</option>
            {LENGUAJES.map(([valor, etiqueta]) => (
              <option
                key={valor}
                value={valor}
              >
                {etiqueta}
              </option>
            ))}
          </select>
        )}
      </div>

      {enlace !== null && (
        <div className='border-b border-white/[0.07] bg-white/[0.02] px-3 py-2'>
          <div className='flex items-center gap-2'>
            <input
              autoFocus
              value={enlace}
              onChange={(e) => {
                setEnlace(e.target.value);
                setErrorEnlace('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  aplicarEnlace();
                }
                if (e.key === 'Escape') setEnlace(null);
              }}
              placeholder='https://...'
              aria-label='Dirección del enlace'
              className='h-7 min-w-0 flex-1 rounded-md border border-white/[0.09] bg-[#1E1E24] px-2 text-[12px] text-neutral-200 outline-none focus:border-white/[0.25]'
            />
            <button
              type='button'
              onClick={aplicarEnlace}
              className='text-[12px] font-medium text-blue-400 hover:underline'
            >
              Aplicar
            </button>
            {estado.enlace && (
              <button
                type='button'
                onClick={quitarEnlace}
                className='text-[12px] text-neutral-500 hover:text-red-400'
              >
                Quitar
              </button>
            )}
            <button
              type='button'
              onClick={() => setEnlace(null)}
              className='text-[12px] text-neutral-500 hover:text-neutral-200'
            >
              Cancelar
            </button>
          </div>
          {errorEnlace && (
            <p className='mt-1 text-[11px] text-red-400'>{errorEnlace}</p>
          )}
        </div>
      )}

      <EditorContent editor={editor} />

      {max != null && (
        <div className='flex items-center justify-end gap-2 border-t border-white/[0.05] px-3 py-1.5'>
          {excedido && (
            <span className='text-[11px] text-red-400'>
              Supera el máximo permitido
            </span>
          )}
          <CharCounter
            value={markdown}
            max={max}
          />
        </div>
      )}
    </div>
  );
}
