import { useEffect, useRef, useState } from 'react';
import { useAnunciosFiltrosStore } from '@/features/announcements/store/anunciosFiltrosStore';

// `valor` debe existir en el enum `cargo` de listarAnunciosQuerySchema
// (backend). Color: el ámbar de la insignia del autor (AnuncioCard).
const CARGOS = [
  { valor: null, label: 'Todos los autores', icono: 'ti-users' },
  { valor: 'cee', label: 'CEE', icono: 'ti-users-group', color: '#FBBF24' },
  { valor: 'tutor', label: 'Tutores', icono: 'ti-school', color: '#FBBF24' },
];

export default function FiltroCargoAnuncio() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cargo = useAnunciosFiltrosStore((s) => s.filtros.cargo);
  const setFiltro = useAnunciosFiltrosStore((s) => s.setFiltro);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const actual = CARGOS.find((c) => c.valor === cargo) ?? CARGOS[0];

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
          style={{ color: cargo ? actual.color : undefined }}
        />
        {actual.label}
        <i
          className={`ti ti-chevron-down text-xs transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className='absolute left-0 top-[calc(100%+6px)] z-[450] w-[190px] overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_14px_40px_rgba(0,0,0,0.5)]'>
          {CARGOS.map((c) => (
            <button
              key={c.valor ?? 'todos'}
              type='button'
              onClick={() => {
                setFiltro('cargo', c.valor);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12.5px] transition-colors hover:bg-white/[0.04] ${cargo === c.valor ? 'text-pink-500' : 'text-neutral-300'
                }`}
            >
              <i
                className={`ti ${c.icono} text-[15px]`}
                style={{ color: c.color }}
              />
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}