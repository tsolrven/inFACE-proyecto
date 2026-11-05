import { useMemo } from 'react';
import { useAnunciosFiltrosStore } from '@/features/announcements/store/anunciosFiltrosStore';
import { useAnunciosFeed } from '@/features/announcements/hooks/useAnuncios';
import { useCentinela } from '@/shared/hooks/useCentinela';
import AnnouncementsTopbar from '@/features/announcements/components/AnnouncementsTopbar';
import AnuncioCard from '@/features/announcements/components/AnuncioCard';

export default function AnnouncementsFeed({
  carreraId,
  hashtag = null,
  permitirCrear = true,
}) {
  const flairId = useAnunciosFiltrosStore((s) => s.filtros.flair_id);
  const orden = useAnunciosFiltrosStore((s) => s.filtros.orden);

  const filtros = useMemo(
    () => ({ carrera_id: carreraId, flair_id: flairId, orden, hashtag }),
    [carreraId, flairId, orden, hashtag],
  );

  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useAnunciosFeed(filtros);

  const anuncios = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages.at(-1)?.meta?.total;
  const centinelaRef = useCentinela({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const hayOtrosFiltros = !!filtros.flair_id;
  const textoVacio = hashtag
    ? {
        titulo: `No hay anuncios con #${hashtag}`,
        detalle: hayOtrosFiltros
          ? 'Prueba quitando el filtro de flair.'
          : 'Nadie ha usado este hashtag en los anuncios de tu carrera.',
      }
    : hayOtrosFiltros
      ? {
          titulo: 'No hay anuncios con estos filtros',
          detalle: 'Prueba quitando algún filtro.',
        }
      : {
          titulo: 'No hay anuncios todavía',
          detalle: 'Aquí aparecerán los comunicados oficiales de la carrera.',
        };

  return (
    <div className='flex-1 overflow-y-auto p-4'>
      <div className='mx-auto w-full max-w-[720px]'>
        <AnnouncementsTopbar
          carreraId={carreraId}
          permitirCrear={permitirCrear}
        />

        {error && (
          <div className='mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
            {error.message}
          </div>
        )}

        {isPending && !!carreraId && (
          <div className='flex items-center justify-center py-16 text-neutral-600'>
            <i className='ti ti-loader-2 animate-spin text-2xl' />
          </div>
        )}

        {!isPending && !error && anuncios.length === 0 && (
          <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
            <i className='ti ti-speakerphone mb-3 block text-5xl text-neutral-700' />
            <p className='text-sm font-semibold text-neutral-300'>
              {textoVacio.titulo}
            </p>
            <p className='mt-1.5 text-xs text-neutral-600'>
              {textoVacio.detalle}
            </p>
          </div>
        )}

        {anuncios.map((anuncio) => (
          <AnuncioCard
            key={anuncio.id}
            anuncio={anuncio}
          />
        ))}

        <div
          ref={centinelaRef}
          className='h-1'
        />

        {isFetchingNextPage && (
          <div className='flex items-center justify-center py-4 text-neutral-600'>
            <i className='ti ti-loader-2 animate-spin text-xl' />
          </div>
        )}

        {!hasNextPage && anuncios.length > 0 && (
          <p className='py-4 text-center text-[11.5px] text-neutral-700'>
            Llegaste al final — {total} anuncios en total
          </p>
        )}
      </div>
    </div>
  );
}
