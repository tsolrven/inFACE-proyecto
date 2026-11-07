import InsigniaBorrador from '@/features/creative-space/components/InsigniaBorrador';
import { useNavigate } from 'react-router-dom';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import PoemaTile from '@/features/creative-space/components/PoemaTile';
import { TIPO_POR_ID } from '@/features/creative-space/utils/tipos';
import { rutas } from '@/features/creative-space/utils/espacios';

export default function EscrituraTile({ obra }) {
  const navigate = useNavigate();
  const tipo = TIPO_POR_ID[obra.tipo];
  const esPoema = obra.tipo === 'poema';

  return (
    <button
      type='button'
      onClick={() => navigate(rutas.obra(obra.id))}
      className='group flex flex-col text-left'
    >
      {esPoema ? (
        <PoemaTile
          obra={obra}
          className='aspect-[2/3]'
        />
      ) : (
        <ImagenObra
          archivoId={obra.portada_id}
          icono='ti-book-2'
          alt={`Portada de ${obra.titulo}`}
          className='aspect-[2/3] w-full rounded-[12px] border border-white/[0.07] bg-[#17171B]'
          imgClassName='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]'
        >
          {tipo && (
            <span
              className='absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold'
              style={{ background: `${tipo.color}dd`, color: '#0b0b0e' }}
            >
              {tipo.label}
            </span>
          )}
        </ImagenObra>
      )}
      {obra.borrador && <InsigniaBorrador className='mt-1.5 self-start' />}
      <div className='mt-1.5 line-clamp-2 text-[13px] font-semibold text-neutral-100 group-hover:text-blue-400'>
        {obra.titulo}
      </div>
      <div className='flex items-center gap-2 text-[11.5px] text-neutral-500'>
        <span className='truncate'>u/{obra.autor?.nombre_usuario}</span>
        <span className='ml-auto flex flex-shrink-0 items-center gap-2'>
          {obra.capitulos_count > 0 && (
            <span className='flex items-center gap-0.5'>
              <i className='ti ti-list-details' />
              {obra.capitulos_count}
            </span>
          )}
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
