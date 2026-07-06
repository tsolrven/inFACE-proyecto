import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Modal genérico. Se usa en cualquier módulo (subida de material, detalle,
// confirmaciones, etc). No sabe nada del contenido, solo maneja:
// overlay, click afuera para cerrar, tecla ESC, y bloqueo de scroll del body.
//
// Uso:
//   <Modal open={open} onClose={() => setOpen(false)} maxWidth="740px">
//     ...tu contenido...
//   </Modal>
export default function Modal({ open, onClose, children, maxWidth = '520px' }) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-[rgba(11,11,13,0.85)] p-5 pt-10 backdrop-blur-sm'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className='mb-10 w-full overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#1E1E24] shadow-[0_24px_70px_rgba(0,0,0,0.7)]'
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

// Header estándar para el contenido de un Modal: título/badges a la
// izquierda, botón de cerrar a la derecha.
export function ModalHeader({ children, onClose }) {
  return (
    <div className='flex items-center border-b border-white/[0.06] bg-white/[0.02] px-5 py-4'>
      <div className='flex flex-1 items-center gap-2'>{children}</div>
      <button
        type='button'
        onClick={onClose}
        className='ml-auto flex h-[30px] w-[30px] items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
      >
        <i className='ti ti-x' />
      </button>
    </div>
  );
}
