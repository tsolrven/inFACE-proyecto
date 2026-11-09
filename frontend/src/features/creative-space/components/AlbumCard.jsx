import InsigniaBorrador from '@/features/creative-space/components/InsigniaBorrador';
import { useNavigate } from 'react-router-dom';
import useEnPantalla from '@/shared/hooks/useEnPantalla';
import { useImagenAutenticada } from '@/shared/post/images/useImagenAutenticada';
import { rutas } from '@/features/creative-space/utils/espacios';

export default function AlbumCard({ obra }) {
  const navigate = useNavigate();
  const imagenes = (obra.archivos ?? []).filter((a) =>
    a.tipo_mime?.startsWith('image/'),
  );
  const portada = imagenes[0];
  const [ref, visible] = useEnPantalla();
  const { data: url } = useImagenAutenticada(portada?.id, {
    enabled: visible && !!portada,
  });

  return (
    <button
      type='button'
      onClick={() => navigate(rutas.obra(obra.id))}
      className='group flex flex-col text-left'
    >
      <div
        ref={ref}
        className='relative aspect-square w-full overflow-hidden rounded-[12px] border border-white/[0.07] bg-[#17171B]'
      >
        {url ? (
          <img
            src={url}
            alt={obra.titulo}
            decoding='async'
            draggable={false}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center text-neutral-700'>
            <i className='ti ti-photo text-3xl' />
          </div>
        )}
        {obra.es_galeria && (
          <span className='absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-neutral-100'>
            <i className='ti ti-photo-plus text-[12px]' />
            {imagenes.length}
          </span>
        )}
      </div>
      {obra.borrador && <InsigniaBorrador className='mt-1.5 self-start' />}
      <div className='mt-1.5 truncate text-[13px] font-semibold text-neutral-100 group-hover:text-blue-400'>
        {obra.titulo}
      </div>
      <div className='flex items-center gap-2 text-[11.5px] text-neutral-500'>
        <span className='truncate'>u/{obra.autor?.nombre_usuario}</span>
        <span className='ml-auto flex flex-shrink-0 items-center gap-2'>
          <span className='flex items-center gap-0.5'>
            <i className='ti ti-arrow-big-up' />
            {obra.votos_neto}
          </span>
          <span className='flex items-center gap-0.5'>
            <i className='ti ti-message-circle-2' />
            {obra.comentarios_count}
          </span>
        </span>
      </div>
    </button>
  );
}
