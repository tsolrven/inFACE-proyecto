import { useEffect, useRef, useState } from 'react';
import { TIPOS_ARCHIVO_FILTRO } from '../../utils/fileMeta';
import { useRepositorioStore } from '../../stores/repositorioStore';

export default function FiltroTipoArchivo() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const tipoArchivo = useRepositorioStore((s) => s.filtros.tipo_archivo);
  const setFiltro = useRepositorioStore((s) => s.setFiltro);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const actual = TIPOS_ARCHIVO_FILTRO.find((t) => t.value === tipoArchivo) ?? TIPOS_ARCHIVO_FILTRO[0];

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        className='flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-white/[0.07] bg-white/[0.04] px-3 text-[12.5px] font-medium text-neutral-400 transition-colors hover:border-white/[0.18] hover:text-neutral-100'
      >
        <i className={`ti ${actual.icon} text-sm`} style={{ color: tipoArchivo ? actual.color : undefined }} />
        {actual.label}
        <i className={`ti ti-chevron-down text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className='absolute left-0 top-[calc(100%+6px)] z-[450] w-[210px] overflow-hidden rounded-2xl border border-white/10 bg-[#1E1E24] shadow-[0_14px_40px_rgba(0,0,0,0.5)]'>
          {TIPOS_ARCHIVO_FILTRO.map((tipo) => (
            <button
              key={tipo.value ?? 'todos'}
              type='button'
              onClick={() => {
                setFiltro('tipo_archivo', tipo.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12.5px] transition-colors hover:bg-white/[0.04] ${
                tipoArchivo === tipo.value ? 'text-pink-500' : 'text-neutral-300'
              }`}
            >
              <i className={`ti ${tipo.icon} text-[15px]`} style={{ color: tipo.value ? tipo.color : undefined }} />
              {tipo.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
