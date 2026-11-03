import { useMemo } from 'react';
import { useForumFiltrosStore } from '@/features/forum/store/forumFiltrosStore';
import { useHilosFeed } from '@/features/forum/hooks/useHilos';
import { useCentinela } from '@/shared/hooks/useCentinela';
import ForumTopbar from '@/features/forum/components/ForumTopbar';
import HiloCard from '@/features/forum/components/HiloCard';

export default function ForumFeed({
  carreraId,
  hashtag = null,
  permitirCrear = true,
}) {
  const filtrosStore = useForumFiltrosStore((s) => s.filtros);
  const filtros = useMemo(
    () => ({ ...filtrosStore, hashtag }),
    [filtrosStore, hashtag],
  );

  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useHilosFeed(filtros);

  const hilos = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages.at(-1)?.meta?.total;
  const centinelaRef = useCentinela({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const hayOtrosFiltros = !!filtros.ramo_id;
  const textoVacio = hashtag
    ? {
        titulo: `No hay hilos con #${hashtag}`,
        detalle: hayOtrosFiltros
          ? 'Prueba quitando el filtro de ramo.'
          : 'Nadie ha usado este hashtag en el foro de tu carrera.',
      }
    : hayOtrosFiltros
      ? {
          titulo: 'No hay hilos con estos filtros',
          detalle: 'Prueba quitando algún filtro.',
        }
      : {
          titulo: 'No hay hilos todavía',
          detalle: 'Sé el primero en abrir una conversación.',
        };

  return (
    <div className='flex-1 overflow-y-auto p-4'>
      <div className='mx-auto w-full max-w-[720px]'>
        <ForumTopbar
          carreraId={carreraId}
          permitirCrear={permitirCrear}
        />

        {error && (
          <div className='mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
            {error.message}
          </div>
        )}

        {isPending && (
          <div className='flex items-center justify-center py-16 text-neutral-600'>
            <i className='ti ti-loader-2 animate-spin text-2xl' />
          </div>
        )}

        {!isPending && !error && hilos.length === 0 && (
          <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
            <i className='ti ti-message-off mb-3 block text-5xl text-neutral-700' />
            <p className='text-sm font-semibold text-neutral-300'>
              {textoVacio.titulo}
            </p>
            <p className='mt-1.5 text-xs text-neutral-600'>
              {textoVacio.detalle}
            </p>
          </div>
        )}

        {hilos.map((hilo) => (
          <HiloCard
            key={hilo.id}
            hilo={hilo}
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

        {!hasNextPage && hilos.length > 0 && (
          <p className='py-4 text-center text-[11.5px] text-neutral-700'>
            Llegaste al final — {total} hilos en total
          </p>
        )}
      </div>
    </div>
  );
}
