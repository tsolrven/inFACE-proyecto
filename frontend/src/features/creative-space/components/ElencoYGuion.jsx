import { Link } from 'react-router-dom';
import { rutas } from '@/features/creative-space/utils/espacios';

export default function ElencoYGuion({ obra }) {
  const participantes = obra.personajes ?? [];
  if (!obra.guion && participantes.length === 0) return null;

  return (
    <div className='mb-4 flex flex-col gap-3'>
      {obra.guion && (
        <Link
          to={rutas.obra(obra.guion.id)}
          className='flex items-center gap-2 rounded-[10px] border border-emerald-400/25 bg-emerald-400/5 px-3 py-2.5 text-[12.5px] text-neutral-200 transition-colors hover:border-emerald-400/50'
        >
          <i className='ti ti-book-2 text-emerald-400' />
          <span className='text-neutral-400'>Basada en la obra de teatro</span>
          <b className='min-w-0 flex-1 truncate'>{obra.guion.titulo}</b>
          <i className='ti ti-arrow-right text-neutral-500' />
        </Link>
      )}

      {participantes.length > 0 && (
        <div>
          <h3 className='mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-neutral-500'>
            <i className='ti ti-users' /> Elenco y participantes
          </h3>
          <div className='grid gap-2 sm:grid-cols-2'>
            {participantes.map((p) => (
              <div
                key={p.id}
                className='rounded-[10px] border border-white/[0.07] bg-[#17171B] px-3 py-2'
              >
                <div className='text-[13px] font-semibold text-neutral-100'>
                  {p.nombre}
                </div>
                {p.descripcion && (
                  <p className='mt-0.5 break-words text-[12px] text-neutral-400'>
                    {p.descripcion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
