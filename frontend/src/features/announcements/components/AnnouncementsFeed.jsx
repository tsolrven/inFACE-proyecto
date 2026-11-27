import { useEffect, useId, useMemo } from 'react';
import { useAnunciosFiltrosStore } from '@/features/announcements/store/anunciosFiltrosStore';
import {
  useAnunciosFijados,
  useAnunciosFeed,
} from '@/features/announcements/hooks/useAnuncios';
import DestacadosAnuncios from '@/features/announcements/components/DestacadosAnuncios';
import { useCentinela } from '@/shared/hooks/useCentinela';
import AnnouncementsTopbar from '@/features/announcements/components/AnnouncementsTopbar';
import AnuncioCard from '@/features/announcements/components/AnuncioCard';
import useMediaQuery from '@/shared/hooks/useMediaQuery';
import ColumnasMasonry from '@/shared/components/ColumnasMasonry';
import { useDestacadosPlegado } from '@/features/announcements/hooks/useDestacadosPlegado';
import BotonDestacados from '@/features/announcements/components/BotonDestacados';

// `busqueda` (opcional): texto ya filtrado por useBusqueda
export default function AnnouncementsFeed({
  carreraId,
  hashtag = null,
  busqueda = '',
  permitirCrear = true,
}) {
  const flairId = useAnunciosFiltrosStore((s) => s.filtros.flair_id);
  const cargo = useAnunciosFiltrosStore((s) => s.filtros.cargo);
  const orden = useAnunciosFiltrosStore((s) => s.filtros.orden);
  const alinearCarrera = useAnunciosFiltrosStore((s) => s.alinearCarrera);

  // los flairs pertenecen a una carrera: al cambiar de comunidad se reinician
  useEffect(() => {
    alinearCarrera(carreraId);
  }, [carreraId, alinearCarrera]);

  // el destacado va arriba solo en la vista "limpia": con filtros o búsqueda,
  // el fijado aparece en la lista como uno más (si coincide)
  const vistaLimpia = !flairId && !cargo && !hashtag && !busqueda;
  const { data: fijados = [] } = useAnunciosFijados(carreraId, {
    enabled: vistaLimpia,
  });
  // "Destacados (n)" va en la barra; la fila, debajo (solo en la vista limpia)
  const idDestacados = useId();
  const destacados = useDestacadosPlegado(carreraId, fijados);
  const mostrarDestacados = vistaLimpia && fijados.length > 0;

  const filtros = useMemo(
    () => ({
      carrera_id: carreraId,
      flair_id: flairId,
      cargo,
      orden,
      hashtag,
      busqueda,
      sin_fijado: vistaLimpia ? 'true' : undefined,
    }),
    [carreraId, flairId, cargo, orden, hashtag, busqueda, vistaLimpia],
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
  // 2 columnas solo en pantallas muy anchas (2xl de Tailwind = 96rem)
  const dosColumnas = useMediaQuery('(min-width: 96rem)');
  const centinelaRef = useCentinela({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const hayOtrosFiltros = !!(filtros.flair_id || filtros.cargo);
  const autoresFiltro = { cee: 'del CEE', tutor: 'de tutores' }[filtros.cargo];
  // vacío cuando el único motivo son los filtros (cargo y/o flair)
  const tituloFiltros = autoresFiltro
    ? `No hay anuncios ${autoresFiltro}${filtros.flair_id ? ' con este flair' : ''}`
    : 'No hay anuncios con estos filtros';
  const textoVacio = busqueda
    ? {
      titulo: `Sin resultados para «${busqueda}»`,
      detalle: hayOtrosFiltros
        ? 'Prueba con otras palabras o quitando algún filtro.'
        : 'Prueba con otras palabras.',
    }
    : hashtag
    ? {
        titulo: `No hay anuncios con #${hashtag}`,
        detalle: hayOtrosFiltros
          ? 'Prueba quitando algún filtro.'
          : 'Nadie ha usado este hashtag en los anuncios de tu carrera.',
      }
    : hayOtrosFiltros
      ? {
          titulo: tituloFiltros,
          detalle: 'Prueba quitando algún filtro.',
        }
      : {
          titulo: 'No hay anuncios todavía',
          detalle: 'Aquí aparecerán los comunicados oficiales de la carrera.',
        };

  return (
    <div className='flex-1 overflow-y-auto p-4'>
      <div className='mx-auto w-full max-w-[720px] 2xl:max-w-[1180px]'>
        <AnnouncementsTopbar
          carreraId={carreraId}
          permitirCrear={permitirCrear}
          inicio={
            mostrarDestacados && (
              <BotonDestacados
                total={fijados.length}
                abierto={destacados.abierto}
                onAlternar={destacados.alternar}
                idFila={idDestacados}
              />
            )
          }
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

        {!isPending && !error && anuncios.length === 0 && fijados.length === 0 && (
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

        {mostrarDestacados && destacados.abierto && (
          <DestacadosAnuncios
            anuncios={fijados}
            idFila={idDestacados}
          />
        )}

        {dosColumnas ? (
          <ColumnasMasonry
            key={JSON.stringify(filtros)}
            items={anuncios}
            renderItem={(anuncio) => (
              <AnuncioCard
                anuncio={anuncio}
                filtrable
              />
            )}
          />
        ) : (
          <div className='grid grid-cols-1 items-start'>
            {anuncios.map((anuncio) => (
              <AnuncioCard
                key={anuncio.id}
                anuncio={anuncio}
                filtrable
              />
            ))}
          </div>
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

        {!hasNextPage && anuncios.length > 0 && (
          <p className='py-4 text-center text-[11.5px] text-neutral-700'>
            {busqueda
              ? `Llegaste al final — ${total} resultados`
              : `Llegaste al final — ${total} anuncios en total`}
          </p>
        )}
      </div>
    </div>
  );
}
