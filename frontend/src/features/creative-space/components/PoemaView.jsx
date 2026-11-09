import { useEffect } from 'react';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import MarkdownView from '@/shared/markdown/MarkdownView';
import {
  cargarFuente,
  familiaDe,
  ESTILO_POEMA_INICIAL,
} from '@/features/creative-space/utils/fuentes';

export default function PoemaView({ obra }) {
  const estilo = obra.estilo ?? ESTILO_POEMA_INICIAL;
  useEffect(() => cargarFuente(estilo.fuente), [estilo.fuente]);

  const centro = estilo.alineacion === 'centro';
  return (
    <div className='relative overflow-hidden rounded-[14px] border border-white/[0.07] bg-[#17171B]'>
      {obra.portada_id && (
        <>
          <div className='absolute inset-0'>
            <ImagenObra
              archivoId={obra.portada_id}
              className='h-full w-full'
            />
          </div>
          <div className='absolute inset-0 bg-black/60' />
        </>
      )}
      <div
        className={`relative px-4 py-8 sm:px-12 sm:py-10 ${centro ? 'text-center' : 'text-left'}`}
        style={{ fontFamily: familiaDe(estilo.fuente) }}
      >
        <h3 className='mb-6 break-words text-[22px] font-semibold sm:text-[26px] leading-tight text-neutral-50'>
          {obra.titulo}
        </h3>
        <div className='[&_p]:mb-5 text-[16px] leading-[1.9] sm:text-[17px] text-neutral-100'>
          <MarkdownView contenido={obra.texto ?? ''} />
        </div>
        {obra.firma && (
          <p className='mt-8 text-[15px] italic text-neutral-300'>
            — {obra.firma}
          </p>
        )}
      </div>
    </div>
  );
}
