import { createPortal } from 'react-dom';
import useModalBehavior from '@/shared/hooks/useModalBehavior';

// diálogo de confirmación reutilizable, reemplaza los confirm()/alert() nativos del navegador
export default function ConfirmDialog({
  open,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  soloConfirmar = false, // true = modo "aviso": solo un botón, para reemplazar alert()
  onConfirm,
  onCancel,
}) {
  // mientras carga no se puede cerrar ni con Esc ni haciendo clic fuera
  const handleClose = loading
    ? undefined
    : soloConfirmar
      ? onConfirm
      : onCancel;

  useModalBehavior(open, handleClose);

  if (!open) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-4'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose?.();
      }}
    >
      <div className='w-full max-w-[380px] rounded-2xl border border-white/10 bg-[#1E1E24] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'>
        <div className='mb-3 flex items-center gap-2.5'>
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
              danger
                ? 'bg-red-500/10 text-red-400'
                : 'bg-pink-500/10 text-pink-400'
            }`}
          >
            <i
              className={`ti ${danger ? 'ti-alert-triangle' : 'ti-help-circle'} text-[18px]`}
            />
          </div>
          <h3 className='text-[14.5px] font-bold text-neutral-100'>{title}</h3>
        </div>

        <p className='mb-5 whitespace-pre-line text-[13px] leading-relaxed text-neutral-400'>
          {message}
        </p>

        <div className='flex justify-end gap-2'>
          {!soloConfirmar && (
            <button
              type='button'
              onClick={onCancel}
              disabled={loading}
              className='rounded-[10px] border border-white/[0.07] px-4 py-2 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {cancelLabel}
            </button>
          )}
          <button
            type='button'
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[12.5px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-pink-500 hover:bg-pink-600'
            }`}
          >
            {loading && <i className='ti ti-loader-2 animate-spin' />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
