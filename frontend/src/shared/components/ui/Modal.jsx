//! MODAL GENÉRICO, SE USA EN CUALQUIER MÓDULO

import { createPortal } from 'react-dom';
import useModalBehavior from '@/shared/hooks/useModalBehavior';

export default function Modal({ open, onClose, children, maxWidth = '520px' }) {
  useModalBehavior(open, onClose);

  if (!open) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10 backdrop-blur-sm'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className='w-full overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_20px_60px_rgba(0,0,0,0.55)]'
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

// encabezado: con `title` (y `subtitle` opcional) muestra el formato estándar;
// sin `title` renderiza `children`, para encabezados personalizados
export function ModalHeader({
  title,
  subtitle,
  children,
  onClose,
  rightContent,
}) {
  return (
    <div
      className={`flex justify-between gap-4 border-b border-white/[0.07] px-5 py-4 ${
        title ? 'items-start' : 'items-center'
      }`}
    >
      <div className='flex flex-1 items-center gap-2'>
        {title ? (
          <div>
            <h2 className='text-[15px] font-bold text-neutral-100'>{title}</h2>
            {subtitle && (
              <p className='mt-0.5 text-[12px] text-neutral-500'>{subtitle}</p>
            )}
          </div>
        ) : (
          children
        )}
      </div>
      <div className='ml-auto flex-shrink-0'>
        {rightContent ?? (
          <button
            type='button'
            onClick={onClose}
            className='flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/[0.06] hover:text-neutral-100'
          >
            <i className='ti ti-x text-base' />
          </button>
        )}
      </div>
    </div>
  );
}

export function ModalBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
