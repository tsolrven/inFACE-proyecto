import { useState } from 'react';
import Pestanas from '@/shared/components/ui/Pestanas';
import Button from '@/shared/components/ui/Button';
import FilaCola from '@/features/reports/components/FilaCola';
import { useColaReportes } from '@/features/reports/hooks/useReportes';
import { ETIQUETA_TIPO } from '@/features/reports/utils/reportUi';

const PESTANAS = [
  { id: 'pendientes', label: 'Pendientes', icono: 'ti-flag' },
  { id: 'historial', label: 'Historial', icono: 'ti-history' },
];

const TIPOS = Object.keys(ETIQUETA_TIPO);

const VACIO = {
  pendientes: {
    titulo: 'No hay reportes pendientes',
    detalle: 'Cuando alguien reporte contenido, va a aparecer acá.',
  },
  historial: {
    titulo: 'Todavía no hay reportes cerrados',
    detalle: 'Los reportes que cierres van a quedar registrados acá.',
  },
};

function textoTotal(vista, total) {
  const contenidos = `${total} contenido${total === 1 ? '' : 's'}`;
  return vista === 'pendientes'
    ? `${contenidos} con reportes pendientes`
    : `${contenidos} con reportes cerrados`;
}

export default function ModeracionPage() {
  const [vista, setVista] = useState('pendientes');
  const [tipo, setTipo] = useState(null);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useColaReportes({ vista, tipo });

  const grupos = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.meta?.total ?? 0;

  return (
    <div className='mx-auto w-full max-w-[820px] px-6 py-10'>
      <h1 className='mb-1.5 text-xl font-bold text-neutral-100'>Reportes</h1>
      <p className='mb-6 text-[13.5px] leading-relaxed text-neutral-400'>
        Revisa los reportes de la comunidad, agrupados por contenido.
      </p>

      <div className='-mx-4 mb-4'>
        <Pestanas
          pestanas={PESTANAS}
          activa={vista}
          onCambiar={setVista}
        />
      </div>

      <div className='mb-4 flex flex-wrap items-center gap-1.5'>
        {[null, ...TIPOS].map((t) => (
          <button
            key={t ?? 'todos'}
            type='button'
            aria-pressed={tipo === t}
            onClick={() => setTipo(t)}
            className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${tipo === t
                ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                : 'border-white/[0.07] text-neutral-400 hover:border-white/[0.18] hover:text-neutral-100'
              }`}
          >
            {t ? ETIQUETA_TIPO[t] : 'Todos'}
          </button>
        ))}
      </div>

      {isError && (
        <div className='mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          <span>{error?.message || 'No se pudieron cargar los reportes.'}</span>
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

      {!isPending && !isError && grupos.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
          <i className='ti ti-mood-empty mb-3 block text-5xl text-neutral-700' />
          <p className='text-sm font-semibold text-neutral-300'>
            {VACIO[vista].titulo}
          </p>
          <p className='mt-1.5 text-xs text-neutral-600'>
            {VACIO[vista].detalle}
          </p>
        </div>
      )}

      {grupos.length > 0 && (
        <>
          <p className='mb-2.5 text-[11.5px] text-neutral-500'>
            {textoTotal(vista, total)}
          </p>
          <div className='flex flex-col gap-2.5'>
            {grupos.map((grupo) => (
              <FilaCola
                key={`${grupo.tipo_contenido}:${grupo.contenido_id}`}
                grupo={grupo}
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
    </div>
  );
}