import { Link } from 'react-router-dom';
import Button from '@/shared/components/ui/Button';
import ProductoCard from '@/features/marketplace/components/ProductoCard';
import { useProductosFeed } from '@/features/marketplace/hooks/useProductos';
import { rutas } from '@/features/marketplace/utils/catalogo';

export default function PerfilMarketplace({ usuarioId, esPropio = false }) {
  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProductosFeed({ vendedor_id: usuarioId, orden: 'recientes' });

  const productos = data?.pages.flatMap((p) => p.items) ?? [];

  if (isPending) {
    return (
      <p className='py-10 text-center text-[13px] text-neutral-500'>
        Cargando…
      </p>
    );
  }
  if (error) {
    return (
      <p className='py-10 text-center text-[13px] text-red-400'>
        {error.message}
      </p>
    );
  }
  if (productos.length === 0) {
    return (
      <div className='flex flex-col items-center py-14 text-center'>
        <i className='ti ti-shopping-bag mb-3 text-4xl text-neutral-700' />
        <p className='max-w-xs text-[12.5px] leading-relaxed text-neutral-500'>
          {esPropio
            ? 'Aún no has publicado productos ni servicios.'
            : 'Aún no ha publicado productos ni servicios.'}
        </p>
        {esPropio && (
          <Link to={rutas.nuevo}>
            <Button
              variant='primary'
              icon='ti-plus'
              className='mt-4'
            >
              Publicar producto
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {productos.map((p) => (
          <ProductoCard
            key={p.id}
            producto={p}
          />
        ))}
      </div>
      {hasNextPage && (
        <div className='flex justify-center pt-4'>
          <Button
            variant='secondary'
            loading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Ver más
          </Button>
        </div>
      )}
    </div>
  );
}
