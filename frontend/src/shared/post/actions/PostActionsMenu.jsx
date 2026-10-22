import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ANCHO_MENU = 168;
const ALTO_ITEM = 36;

const TRIGGER_POR_DEFECTO =
  'flex items-center text-[11.5px] text-neutral-600 transition-colors hover:text-neutral-200';

/**
 * items: [{ key, label, icon (nodo), onClick, danger?, hidden? }]
 * El menú no se muestra si todas las acciones están ocultas.
 */
export default function PostActionsMenu({
  items,
  label = 'Más acciones',
  triggerClassName = TRIGGER_POR_DEFECTO,
}) {
  const visibles = items.filter((item) => !item.hidden);
  const [pos, setPos] = useState(null); // null = cerrado
  const botonRef = useRef(null);
  const menuRef = useRef(null);
  const abierto = pos !== null;

  useEffect(() => {
    if (!abierto) return;

    function cerrar() {
      setPos(null);
    }
    function handleMouseDown(e) {
      const dentro =
        botonRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target);
      if (!dentro) cerrar();
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        cerrar();
        botonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', cerrar, true);
    window.addEventListener('resize', cerrar);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', cerrar, true);
      window.removeEventListener('resize', cerrar);
    };
  }, [abierto]);

  if (visibles.length === 0) return null;

  function alternar() {
    if (abierto) {
      setPos(null);
      return;
    }
    const rect = botonRef.current.getBoundingClientRect();
    const altoMenu = visibles.length * ALTO_ITEM + 8;
    const haciaArriba = window.innerHeight - rect.bottom < altoMenu + 8;
    setPos({
      top: haciaArriba ? rect.top - 4 : rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - ANCHO_MENU - 8),
      haciaArriba,
    });
  }

  function elegir(item) {
    setPos(null);
    item.onClick();
  }

  return (
    <>
      <button
        ref={botonRef}
        type='button'
        onClick={alternar}
        aria-label={label}
        aria-haspopup='menu'
        aria-expanded={abierto}
        className={triggerClassName}
      >
        <i className='ti ti-dots' />
      </button>

      {abierto &&
        createPortal(
          <div
            ref={menuRef}
            role='menu'
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              width: ANCHO_MENU,
              transform: pos.haciaArriba ? 'translateY(-100%)' : 'none',
            }}
            className='z-[9999] overflow-hidden rounded-xl border border-white/10 bg-[#1E1E24] shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
          >
            {visibles.map((item) => (
              <button
                key={item.key}
                type='button'
                role='menuitem'
                onClick={() => elegir(item)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] transition-colors ${
                  item.danger
                    ? 'text-red-400 hover:bg-red-500/[0.08]'
                    : 'text-neutral-300 hover:bg-white/[0.05] hover:text-neutral-100'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
