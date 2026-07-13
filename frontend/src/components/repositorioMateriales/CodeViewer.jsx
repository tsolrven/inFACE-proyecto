import { useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import {
  obtenerLenguaje,
  extensionParaLenguaje,
} from '../../utils/codeLanguages';
import { codeEditorTheme } from '../../utils/codeEditorTheme';

export default function CodeViewer({
  codigo,
  lenguaje,
  interactivo = true,
  maxHeight,
}) {
  const [copiado, setCopiado] = useState(false);

  const extensions = useMemo(
    () => [
      ...extensionParaLenguaje(lenguaje),
      EditorView.lineWrapping,
      EditorState.readOnly.of(true),
    ],
    [lenguaje],
  );

  async function handleCopiar(e) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // portapapeles no disponible, no se hace nada
    }
  }

  return (
    <div
      onClick={(e) => interactivo && e.stopPropagation()}
      className={`overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#111114] ${
        interactivo ? '' : 'pointer-events-none'
      }`}
    >
      <div className='flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5'>
        <span className='text-[11px] font-medium text-neutral-500'>
          {obtenerLenguaje(lenguaje).label}
        </span>
        {interactivo && (
          <button
            type='button'
            onClick={handleCopiar}
            className='flex items-center gap-1 text-[11px] text-neutral-500 transition-colors hover:text-neutral-200'
          >
            <i
              className={`ti ${copiado ? 'ti-check text-emerald-400' : 'ti-copy'} text-[12px]`}
            />
            {copiado ? 'Copiado' : 'Copiar'}
          </button>
        )}
      </div>

      <div
        style={
          maxHeight
            ? { maxHeight, overflow: interactivo ? 'auto' : 'hidden' }
            : undefined
        }
      >
        <CodeMirror
          value={codigo}
          theme={codeEditorTheme}
          extensions={extensions}
          editable={false}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
          }}
          className='text-[12px]'
        />
      </div>
    </div>
  );
}
