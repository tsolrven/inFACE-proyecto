import { Link } from 'react-router-dom';
import { useHashtagsPopulares } from '@/features/creative-space/hooks/useObras';
import { rutas } from '@/features/creative-space/utils/espacios';

export default function HashtagsPopulares({ grande = false }) {
  const { data = [], isPending } = useHashtagsPopulares();

  if (isPending) {
    return (
      <p className='flex items-center gap-2 text-[12px] text-neutral-600'>
        <i className='ti ti-loader-2 animate-spin' /> Cargando...
      </p>
    );
  }
  if (data.length === 0) {
    return (
      <p className='text-[12px] text-neutral-600'>
        Aún no hay hashtags. Agrega alguno al publicar tu obra.
      </p>
    );
  }

  return (
    <div className='flex flex-wrap gap-1.5'>
      {data.map((h) => (
        <Link
          key={h.nombre}
          to={rutas.hashtag(h.nombre)}
          className={`rounded-full bg-blue-400/10 font-semibold text-blue-300 transition-colors hover:bg-blue-400/20 ${
            grande ? 'px-3.5 py-1.5 text-[13px]' : 'px-2.5 py-1 text-[11.5px]'
          }`}
        >
          #{h.nombre}
          <span className='ml-1.5 font-normal text-neutral-500'>{h.total}</span>
        </Link>
      ))}
    </div>
  );
}
