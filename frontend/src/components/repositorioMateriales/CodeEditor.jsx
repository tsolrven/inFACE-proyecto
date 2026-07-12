import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import {
  LENGUAJES_SNIPPET,
  extensionParaLenguaje,
} from '../../utils/codeLanguages';
import { codeEditorTheme } from '../../utils/codeEditorTheme';

export default function CodeEditor({
  value,
  onChange,
  lenguaje,
  onLenguajeChange,
  placeholder = 'Pega o escribe tu código aquí...',
}) {
  const extensions = useMemo(
    () => [...extensionParaLenguaje(lenguaje), EditorView.lineWrapping],
    [lenguaje],
  );

  return (
    <div className='overflow-hidden rounded-[10px] border border-white/[0.07] bg-[#111114] transition-colors focus-within:border-pink-500/40'>
      <div className='flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5'>
        <div className='flex items-center gap-1.5'>
          <i className='ti ti-code text-[12px] text-neutral-600' />
          <select
            value={lenguaje}
            onChange={(e) => onLenguajeChange(e.target.value)}
            className='cursor-pointer rounded-md bg-transparent py-0.5 text-[11.5px] font-medium text-neutral-400 outline-none hover:text-neutral-200'
          >
            {LENGUAJES_SNIPPET.map((l) => (
              <option
                key={l.value}
                value={l.value}
                className='bg-[#1E1E24] text-neutral-200'
              >
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <CodeMirror
        value={value}
        onChange={onChange}
        theme={codeEditorTheme}
        extensions={extensions}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
        height='220px'
        className='text-[12.5px]'
      />
    </div>
  );
}
