import { useEffect, useRef, useState } from 'react';
import { useForumFiltrosStore } from '@/features/forum/store/forumFiltrosStore';

// `valor` debe existir en el enum `estado` de listarHilosQuerySchema (backend)
const ESTADOS = [
  { valor: null, label: 'Todos los hilos', icono: 'ti-list' },
  {
    valor: 'resueltos',
    label: 'Resueltos',
    icono: 'ti-circle-check',
    color: '#34D399', // mismo verde que el chip "Resuelto" (emerald-400)
  },
  {
    valor: 'sin_resolver',
    label: 'Sin resolver',
    icono: 'ti-help-circle',
    color: '#FBBF24', // amber-400
  },
];

export default function FiltroEstadoHilo() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const estado = useForumFiltrosStore((s) => s.filtros.estado);
  const setFiltro = useForumFiltrosStore((s) => s.setFiltro);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const actual = ESTADOS.find((e) => e.valor === estado) ?? ESTADOS[0];

  return (
    <div
      className='relative'
      ref={ref}
    >
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        className='flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-white/[0.07] bg-white/[0.04] px-3 text-[12.5px] font-medium text-neutral-400 transition-colors hover:border-white/[0.18] hover:text-neutral-100'
      >
        <i
          className={`ti ${actual.icono} text-sm`}
          style={{ color: estado ? actual.color : undefined }}
        />
        {actual.label}
        <i
          className={`ti ti-chevron-down text-xs transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className='absolute left-0 top-[calc(100%+6px)] z-[450] w-[190px] overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_14px_40px_rgba(0,0,0,0.5)]'>
          {ESTADOS.map((e) => (
            <button
              key={e.valor ?? 'todos'}
              type='button'
              onClick={() => {
                setFiltro('estado', e.valor);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12.5px] transition-colors hover:bg-white/[0.04] ${estado === e.valor ? 'text-pink-500' : 'text-neutral-300'
                }`}
            >
              <i
                className={`ti ${e.icono} text-[15px]`}
                style={{ color: e.color }}
              />
              {e.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}