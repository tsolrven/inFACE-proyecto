import { Link } from 'react-router-dom';
import { listarObras } from '@/features/creative-space/api/creative.api';
import { TIPO_POR_ID } from '@/features/creative-space/utils/tipos';
import { rutas as rutasCreativo } from '@/features/creative-space/utils/espacios';
import {
  SeccionError,
  SeccionHeader,
  SeccionVacia,
  SkeletonCard,
} from '@/features/home/components/SeccionInicio';
import { useVistaPrevia } from '@/features/home/hooks/useVistaPrevia';

async function cargarObras() {
  const { obras } = await listarObras({ limite: 4 });
  return obras.slice(0, 4);
}

export default function PreviewEspacioCreativo() {
  const {
    items: obras,
    cargando,
    error,
  } = useVistaPrevia(['obras'], cargarObras);

  return (
    <section>
      <SeccionHeader
        icon='ti-palette'
        iconColor='text-violet-400'
        iconBg='bg-violet-400/10 border-violet-400/25'
        title='Espacio creativo'
        subtitle='Música, escritura y artes de la comunidad'
        to={rutasCreativo.inicio}
      />

      {cargando ? (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <SeccionError />
      ) : obras.length === 0 ? (
        <SeccionVacia
          icon='ti-palette'
          mensaje='Aún no hay obras. ¡Comparte la primera!'
        />
      ) : (
        <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
          {obras.map((o) => (
            <MiniObraCard
              key={o.id}
              obra={o}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MiniObraCard({ obra: o }) {
  const tipo = TIPO_POR_ID[o.tipo];
  const color = tipo?.color ?? '#a78bfa';

  return (
    <Link
      to={rutasCreativo.obra(o.id)}
      className='group flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-4 transition hover:-translate-y-0.5 hover:border-violet-400/30'
    >
      <div
        className='flex h-9 w-9 items-center justify-center rounded-xl'
        style={{ background: `${color}22`, color }}
      >
        <i className={`ti ${tipo?.icono ?? 'ti-palette'} text-[17px]`} />
      </div>
      <h3 className='line-clamp-2 text-[13px] font-semibold leading-snug text-neutral-100 group-hover:text-violet-300'>
        {o.titulo}
      </h3>
      <div className='mt-auto flex items-center justify-between gap-2 text-[10.5px] text-neutral-600'>
        <span style={{ color }}>{tipo?.label ?? 'Obra'}</span>
        <span className='truncate'>u/{o.autor?.nombre_usuario}</span>
      </div>
    </Link>
  );
}