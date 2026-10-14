import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToastStore } from '../../stores/toastStore';

const DURACION_MS = 3000;

function ToastItem({ id, mensaje, onCerrar }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const timeout = setTimeout(() => handleCerrar(), DURACION_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCerrar() {
    setVisible(false);
    setTimeout(() => onCerrar(id), 200);
  }

  return (
    <div
      className={`pointer-events-auto flex min-w-[220px] max-w-[360px] items-center justify-between gap-3 rounded-full bg-neutral-100 px-4 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-all duration-200 ease-out ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
    >
      <span className='text-[13px] font-medium text-neutral-900'>
        {mensaje}
      </span>
      <button
        type='button'
        onClick={handleCerrar}
        className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-black/[0.06] hover:text-neutral-900'
      >
        <i className='ti ti-x text-[13px]' />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const cerrarToast = useToastStore((s) => s.cerrarToast);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className='pointer-events-none fixed top-4 left-1/2 z-[10000] flex -translate-x-1/2 flex-col items-center gap-2'>
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          id={t.id}
          mensaje={t.mensaje}
          onCerrar={cerrarToast}
        />
      ))}
    </div>,
    document.body,
  );
}
