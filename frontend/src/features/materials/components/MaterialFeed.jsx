import { useEffect, useMemo, useRef } from 'react';
import { useFiltrosStore } from '@/features/materials/store/filtrosStore';
import { useApuntesFeed } from '@/features/materials/hooks/useApuntes';
import FeedTopbar from '@/features/materials/components/FeedTopbar';
import QuickUploadBox from '@/features/materials/components/QuickUploadBox';
import MaterialCard from '@/features/materials/components/MaterialCard';

export default function MaterialFeed({
  carreraId,
  hashtag = null,
  onAbrirSubida,
}) {
  const filtrosStore = useFiltrosStore((s) => s.filtros);
  const filtros = useMemo(
    () => ({ ...filtrosStore, hashtag }),
    [filtrosStore, hashtag],
  );

  const hayOtrosFiltros = !!(filtros.ramo_id || filtros.tipo_archivo);
  const textoVacio = hashtag
    ? {
        titulo: `No hay materiales con #${hashtag}`,
        detalle: hayOtrosFiltros
          ? 'Prueba quitando algún filtro.'
          : 'Nadie ha usado este hashtag en materiales de tu carrera.',
      }
    : hayOtrosFiltros
      ? {
          titulo: 'No hay materiales con estos filtros',
          detalle: 'Prueba quitando algún filtro.',
        }
      : {
          titulo: 'No hay materiales todavía',
          detalle: 'Sé el primero en compartir algo con la comunidad.',
        };

  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useApuntesFeed(filtros);

  const apuntes = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages.at(-1)?.meta?.total;

  const centinelaRef = useRef(null);
  useEffect(() => {
    const el = centinelaRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className='flex-1 overflow-y-auto p-4'>
      <FeedTopbar
        carreraId={carreraId}
        onAbrirSubida={onAbrirSubida}
      />
      {onAbrirSubida && <QuickUploadBox onClick={onAbrirSubida} />}

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

      {!isPending && !error && apuntes.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
          <i className='ti ti-mood-empty mb-3 block text-5xl text-neutral-700' />
          <p className='text-sm font-semibold text-neutral-300'>
            {textoVacio.titulo}
          </p>
          <p className='mt-1.5 text-xs text-neutral-600'>
            {textoVacio.detalle}
          </p>
        </div>
      )}

      {apuntes.map((apunte) => (
        <MaterialCard
          key={apunte.id}
          apunte={apunte}
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

      {!hasNextPage && apuntes.length > 0 && (
        <p className='py-4 text-center text-[11.5px] text-neutral-700'>
          Llegaste al final — {total} materiales en total
        </p>
      )}
    </div>
  );
}
