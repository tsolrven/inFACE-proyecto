import { useEffect } from 'react';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import MarkdownView from '@/shared/markdown/MarkdownView';
import {
  cargarFuente,
  familiaDe,
  ESTILO_POEMA_INICIAL,
} from '@/features/creative-space/utils/fuentes';

export default function PoemaTile({ obra, className = 'aspect-square' }) {
  const estilo = obra.estilo ?? ESTILO_POEMA_INICIAL;
  useEffect(() => cargarFuente(estilo.fuente), [estilo.fuente]);
  const conFondo = !!obra.portada_id;
  const centro = estilo.alineacion === 'centro';

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[12px] border border-white/[0.07] ${className}`}
      style={{
        fontFamily: familiaDe(estilo.fuente),
        background: conFondo
          ? '#17171B'
          : 'linear-gradient(160deg, #26263a 0%, #17171B 70%)',
      }}
    >
      {conFondo ? (
        <>
          <div className='absolute inset-0'>
            <ImagenObra
              archivoId={obra.portada_id}
              className='h-full w-full'
            />
          </div>
          <div className='absolute inset-0 bg-black/45' />
          <div
            className={`relative flex h-full w-full flex-col items-center justify-center gap-1.5 p-4 ${centro ? 'text-center' : 'items-start text-left'}`}
          >
            <h3 className='line-clamp-4 break-words text-[21px] font-semibold leading-tight text-neutral-50 drop-shadow'>
              {obra.titulo}
            </h3>
            <p className='text-[12px] italic text-neutral-200 drop-shadow'>
              — {obra.firma || `u/${obra.autor?.nombre_usuario}`}
            </p>
          </div>
        </>
      ) : (
        <div
          className={`relative flex h-full w-full flex-col gap-2 overflow-hidden p-4 ${centro ? 'text-center' : 'text-left'}`}
        >
          <h3 className='break-words text-[17px] font-semibold leading-tight text-neutral-50'>
            {obra.titulo}
          </h3>
          <div className='min-h-0 flex-1 overflow-hidden text-[12.5px] leading-relaxed text-neutral-300 [&_p]:mb-2'>
            <MarkdownView contenido={obra.texto ?? ''} />
          </div>
          {obra.firma && (
            <p className='text-[11.5px] italic text-neutral-400'>
              — {obra.firma}
            </p>
          )}
          <div className='pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#17171B] to-transparent' />
        </div>
      )}
    </div>
  );
}
