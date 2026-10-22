import { useEffect, useRef, useState } from 'react';
import { COMENTARIO_MAX } from '@/shared/post/comments/constants';

export default function CommentComposer({
  initialValue = '',
  placeholder = 'Escribe un comentario...',
  submitLabel = 'Comentar',
  pending = false,
  autoFocus = false,
  rows = 3,
  onSubmit,
  onCancel,
}) {
  const [texto, setTexto] = useState(initialValue);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!autoFocus || !textareaRef.current) return;
    const el = textareaRef.current;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [autoFocus]);

  const vacio = texto.trim().length === 0;
  const cercaDelLimite = texto.length >= COMENTARIO_MAX * 0.9;

  async function enviar() {
    if (vacio || pending) return;
    try {
      await onSubmit(texto.trim());
      setTexto('');
    } catch {
      // el toast de error ya lo muestra el hook; el texto se conserva
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <div className='flex flex-col gap-2 rounded-[10px] border border-white/[0.06] bg-[#111114] p-2.5 focus-within:border-pink-500/40'>
      <textarea
        ref={textareaRef}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={COMENTARIO_MAX}
        rows={rows}
        placeholder={placeholder}
        aria-label={placeholder}
        className='w-full resize-none bg-transparent text-[13px] text-neutral-100 outline-none placeholder-neutral-600'
      />
      <div className='flex items-center justify-between gap-2'>
        <span className='flex items-center gap-2 text-[11px] text-neutral-600'>
          <span className={cercaDelLimite ? 'text-amber-400' : ''}>
            {texto.length}/{COMENTARIO_MAX}
          </span>
          <span className='hidden sm:inline'>· Ctrl + Enter para enviar</span>
        </span>
        <div className='flex items-center gap-2'>
          {onCancel && (
            <button
              type='button'
              onClick={onCancel}
              disabled={pending}
              className='rounded-md px-2.5 py-1 text-[11.5px] text-neutral-500 hover:text-neutral-200 disabled:opacity-50'
            >
              Cancelar
            </button>
          )}
          <button
            type='button'
            onClick={enviar}
            disabled={pending || vacio}
            className='rounded-md bg-pink-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#D43E56] disabled:opacity-50'
          >
            {pending ? 'Enviando...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
