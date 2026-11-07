import IconoPlay from '@/features/creative-space/components/IconoPlay';
import InsigniaBorrador from '@/features/creative-space/components/InsigniaBorrador';
import { useNavigate } from 'react-router-dom';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import { parsearEnlace } from '@/features/creative-space/utils/embed';
import { rutas } from '@/features/creative-space/utils/espacios';

export default function MusicaTile({ obra }) {
  const navigate = useNavigate();
  const esAlbum = obra.tipo === 'album';

  return (
    <button
      type='button'
      onClick={() => navigate(rutas.obra(obra.id))}
      className='group flex flex-col text-left'
    >
      <ImagenObra
        archivoId={obra.portada_id}
        fallbackSrc={
          obra.enlace_url
            ? (parsearEnlace(obra.enlace_url)?.miniatura ?? null)
            : null
        }
        icono={esAlbum ? 'ti-disc' : 'ti-music'}
        alt={`Portada de ${obra.titulo}`}
        className='aspect-square w-full rounded-[12px] border border-white/[0.07] bg-[#17171B]'
        imgClassName='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]'
      >
        <span className='absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-pink-500 text-lg text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100'>
          <IconoPlay />
        </span>
        {esAlbum && (
          <span className='absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10.5px] font-semibold text-neutral-100'>
            <i className='ti ti-disc text-[12px]' />
            Álbum · {obra.pistas_count}
          </span>
        )}
      </ImagenObra>
      {obra.borrador && <InsigniaBorrador className='mt-1.5 self-start' />}
      <div className='mt-1.5 truncate text-[13px] font-semibold text-neutral-100 group-hover:text-pink-400'>
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
