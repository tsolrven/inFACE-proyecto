import { Link } from 'react-router-dom';
import Button from '@/shared/components/ui/Button';
import ObraCard from '@/features/creative-space/components/ObraCard';
import { useObrasFeed } from '@/features/creative-space/hooks/useObras';
import { rutas } from '@/features/creative-space/utils/espacios';

export default function PerfilCreativo({ usuarioId, esPropio = false }) {
  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useObrasFeed({ autor_id: usuarioId, orden: 'recientes' });

  const obras = data?.pages.flatMap((p) => p.items) ?? [];

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
  if (obras.length === 0) {
    return (
      <div className='flex flex-col items-center py-14 text-center'>
        <i className='ti ti-palette mb-3 text-4xl text-neutral-700' />
        <p className='max-w-xs text-[12.5px] leading-relaxed text-neutral-500'>
          {esPropio
            ? 'Aún no has compartido obras en el espacio creativo.'
            : 'Aún no ha compartido obras en el espacio creativo.'}
        </p>
        {esPropio && (
          <Link to={rutas.nueva(null)}>
            <Button
              variant='primary'
              icon='ti-plus'
              className='mt-4'
            >
              Compartir mi arte
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      {obras.map((obra) => (
        <ObraCard
          key={obra.id}
          obra={obra}
        />
      ))}
      {hasNextPage && (
        <div className='flex justify-center pt-2'>
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
