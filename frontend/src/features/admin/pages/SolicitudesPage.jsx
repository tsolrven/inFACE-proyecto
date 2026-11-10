import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import FilaSolicitud from '@/features/admin/components/FilaSolicitud';
import SolicitudDetalleModal from '@/features/admin/components/SolicitudDetalleModal';
import { useColaSolicitudes } from '@/features/admin/hooks/useSolicitudesAdmin';

const FILTROS = [
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'aprobada', label: 'Aprobadas' },
  { id: 'rechazada', label: 'Rechazadas' },
  { id: 'cancelada', label: 'Canceladas' },
  { id: 'todas', label: 'Todas' },
];

const VACIO = {
  pendiente: {
    titulo: 'No hay solicitudes pendientes',
    detalle: 'Cuando alguien solicite un cargo, va a aparecer acá.',
  },
  aprobada: { titulo: 'No hay solicitudes aprobadas' },
  rechazada: { titulo: 'No hay solicitudes rechazadas' },
  cancelada: { titulo: 'No hay solicitudes canceladas' },
  todas: { titulo: 'Todavía no hay solicitudes' },
};

export default function SolicitudesPage() {
  const [estado, setEstado] = useState('pendiente');
  const [abierta, setAbierta] = useState(null);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useColaSolicitudes({ estado });

  const solicitudes = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.meta?.total ?? 0;

  return (
    <div className='mx-auto w-full max-w-[820px] px-6 py-10'>
      <h1 className='mb-1.5 text-xl font-bold text-neutral-100'>
        Solicitudes de cargo
      </h1>
      <p className='mb-6 text-[13.5px] leading-relaxed text-neutral-400'>
        Revisa las solicitudes de CEE y tutor de la comunidad.
      </p>

      <div className='mb-4 flex flex-wrap items-center gap-1.5'>
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type='button'
            aria-pressed={estado === f.id}
            onClick={() => setEstado(f.id)}
            className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${estado === f.id
                ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                : 'border-white/[0.07] text-neutral-400 hover:border-white/[0.18] hover:text-neutral-100'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isError && (
        <div className='mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          <span>
            {error?.message || 'No se pudieron cargar las solicitudes.'}
          </span>
          <button
            type='button'
            onClick={() => refetch()}
            className='flex-shrink-0 font-semibold underline-offset-2 hover:underline'
          >
            Reintentar
          </button>
        </div>
      )}

      {isPending && (
        <div className='flex items-center justify-center py-16 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {!isPending && !isError && solicitudes.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
          <i className='ti ti-mood-empty mb-3 block text-5xl text-neutral-700' />
          <p className='text-sm font-semibold text-neutral-300'>
            {VACIO[estado].titulo}
          </p>
          {VACIO[estado].detalle && (
            <p className='mt-1.5 text-xs text-neutral-600'>
              {VACIO[estado].detalle}
            </p>
          )}
        </div>
      )}

      {solicitudes.length > 0 && (
        <>
          <p className='mb-2.5 text-[11.5px] text-neutral-500'>
            {total} solicitud{total === 1 ? '' : 'es'}
          </p>
          <div className='flex flex-col gap-2.5'>
            {solicitudes.map((s) => (
              <FilaSolicitud
                key={s.id}
                solicitud={s}
                onAbrir={() => setAbierta(s.id)}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className='mt-4 flex justify-center'>
              <Button
                variant='secondary'
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                Ver más
              </Button>
            </div>
          )}
        </>
      )}

      {abierta && (
        <SolicitudDetalleModal
          id={abierta}
          onClose={() => setAbierta(null)}
        />
      )}
    </div>
  );
}