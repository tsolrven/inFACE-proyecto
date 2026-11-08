import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/shared/components/ui/Button';
import ProductoCard from '@/features/marketplace/components/ProductoCard';
import { useProductosFeed } from '@/features/marketplace/hooks/useProductos';
import { useRetardo } from '@/features/marketplace/hooks/useRetardo';
import { useCentinela } from '@/shared/hooks/useCentinela';
import { rutas } from '@/features/marketplace/utils/catalogo';

function aParametros(f) {
  const num = (v) => (v === '' || Number.isNaN(Number(v)) ? null : Number(v));
  return {
    categoria: f.categoria,
    condicion: f.condicion || null,
    estado: f.estado || null,
    orden: f.orden,
    precio_min: num(f.precio_min),
    precio_max: num(f.precio_max),
    busqueda: f.busqueda.trim() || null,
  };
}

export default function MarketplaceFeed({ filtros, soloMios = false }) {
  const navigate = useNavigate();
  const retardados = useRetardo(filtros);
  const parametros = useMemo(
    () => ({ ...aParametros(retardados), solo_mios: soloMios }),
    [retardados, soloMios],
  );

  const rangoInvalido =
    parametros.precio_min !== null &&
    parametros.precio_max !== null &&
    parametros.precio_min > parametros.precio_max;

  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProductosFeed(parametros, { enabled: !rangoInvalido });

  const productos = rangoInvalido
    ? []
    : (data?.pages.flatMap((p) => p.items) ?? []);
  const total = data?.pages.at(-1)?.meta?.total;
  const centinelaRef = useCentinela({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const hayFiltros = !!(
    parametros.categoria ||
    parametros.condicion ||
    parametros.estado ||
    parametros.busqueda ||
    parametros.precio_min !== null ||
    parametros.precio_max !== null
  );

  return (
    <>
      {error && (
        <div className='mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          {error.message}
        </div>
      )}

      {isPending && !rangoInvalido && (
        <div className='flex items-center justify-center py-16 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {(rangoInvalido || (!isPending && !error)) && productos.length === 0 && (
        <div className='flex select-none flex-col items-center justify-center py-16 text-center'>
          <i className='ti ti-shopping-bag-x mb-3 block text-5xl text-neutral-700' />
          <p className='text-sm font-semibold text-neutral-300'>
            {soloMios && !hayFiltros
              ? 'Aún no has publicado productos'
              : hayFiltros
                ? 'No hay productos con estos filtros'
                : 'Todavía no hay productos'}
          </p>
          <p className='mt-1.5 text-xs text-neutral-600'>
            {rangoInvalido
              ? 'El precio mínimo es mayor que el máximo.'
              : hayFiltros
                ? 'Prueba quitando algún filtro.'
                : 'Publica lo que ya no uses y dale una segunda vida.'}
          </p>
          {!hayFiltros && (
            <Button
              variant='primary'
              icon='ti-plus'
              className='mt-4'
              onClick={() => navigate(rutas.nuevo)}
            >
              Publicar un producto
            </Button>
          )}
        </div>
      )}

      {productos.length > 0 && (
        <>
          {typeof total === 'number' && (
            <p className='mb-2 text-[11.5px] text-neutral-600'>
              {total} {total === 1 ? 'producto' : 'productos'}
            </p>
          )}
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
            {productos.map((p) => (
              <ProductoCard
                key={p.id}
                producto={p}
              />
            ))}
          </div>
        </>
      )}

      <div
        ref={centinelaRef}
        className='h-6'
      />
      {isFetchingNextPage && (
        <div className='flex justify-center py-4 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-xl' />
        </div>
      )}
    </>
  );
}
