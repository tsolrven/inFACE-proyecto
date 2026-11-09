import { useEffect, useMemo, useState } from 'react';
import { useObrasFeed } from '@/features/creative-space/hooks/useObras';
import { useCreativeFiltrosStore } from '@/features/creative-space/store/creativeFiltrosStore';
import { useCentinela } from '@/shared/hooks/useCentinela';
import CreativeTopbar from '@/features/creative-space/components/CreativeTopbar';
import ObraCard from '@/features/creative-space/components/ObraCard';
import AlbumCard from '@/features/creative-space/components/AlbumCard';
import MusicaTile from '@/features/creative-space/components/MusicaTile';
import EscrituraTile from '@/features/creative-space/components/EscrituraTile';

function useRetardo(valor, ms = 350) {
  const [retardado, setRetardado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setRetardado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return retardado;
}

export default function CreativeFeed({
  soloMias = false,
  tipos = null,
  tiposFiltro = null,
  crearTipos = null,
  textoCrear,
  espacioId = null,
  hashtagFijo = null,
  album = false,
  portadas = false,
  musica = false,
}) {
  const filtrosStore = useCreativeFiltrosStore((s) => s.filtros);
  const busqueda = useRetardo(filtrosStore.busqueda.trim());
  const filtros = useMemo(() => {
    const lista = filtrosStore.tipo ? [filtrosStore.tipo] : tipos;
    return {
      ...filtrosStore,
      tipo: lista?.length ? lista.join(',') : null,
      busqueda,
      solo_mias: soloMias,
      ...(hashtagFijo && { hashtag: hashtagFijo }),
    };
  }, [filtrosStore, busqueda, soloMias, tipos, hashtagFijo]);

  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useObrasFeed(filtros);

  const obras = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages.at(-1)?.meta?.total;
  const centinelaRef = useCentinela({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const hayFiltros = !!(
    filtrosStore.tipo ||
    filtros.hashtag ||
    filtros.busqueda
  );

  return (
    <div className='flex-1 overflow-y-auto p-3 sm:p-4'>
      <div
        className={`mx-auto w-full ${album || portadas || musica ? 'max-w-[1200px]' : 'max-w-[1000px]'}`}
      >
        <CreativeTopbar
          tiposFiltro={tiposFiltro}
          crearTipos={crearTipos}
          textoCrear={textoCrear}
          espacioId={espacioId}
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

        {!isPending && !error && obras.length === 0 && (
          <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
            <i className='ti ti-palette-off mb-3 block text-5xl text-neutral-700' />
            <p className='text-sm font-semibold text-neutral-300'>
              {soloMias
                ? 'Aún no has publicado obras'
                : hayFiltros
                  ? 'No hay obras con estos filtros'
                  : 'No hay obras todavía'}
            </p>
            <p className='mt-1.5 text-xs text-neutral-600'>
              {soloMias
                ? 'Usa el botón de arriba para compartir tu primera creación.'
                : hayFiltros
                  ? 'Prueba quitando algún filtro.'
                  : 'Sé el primero en compartir tu arte.'}
            </p>
          </div>
        )}

        {musica ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            {obras.map((obra) => (
              <MusicaTile
                key={obra.id}
                obra={obra}
              />
            ))}
          </div>
        ) : portadas ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            {obras.map((obra) => (
              <EscrituraTile
                key={obra.id}
                obra={obra}
              />
            ))}
          </div>
        ) : album ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {obras.map((obra) => (
              <AlbumCard
                key={obra.id}
                obra={obra}
              />
            ))}
          </div>
        ) : (
          obras.map((obra) => (
            <ObraCard
              key={obra.id}
              obra={obra}
            />
          ))
        )}

        <div
          ref={centinelaRef}
          className='h-1'
        />

        {isFetchingNextPage && (
          <div className='flex items-center justify-center py-4 text-neutral-600'>
            <i className='ti ti-loader-2 animate-spin text-xl' />
          </div>
        )}

        {!hasNextPage && obras.length > 0 && (
          <p className='py-4 text-center text-[11.5px] text-neutral-700'>
            Llegaste al final — {total} {total === 1 ? 'obra' : 'obras'} en
            total
          </p>
        )}
      </div>
    </div>
  );
}
