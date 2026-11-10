import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import { mensajeDeError } from '@/shared/lib/errores';
import { nombreDeUsuario } from '@/shared/moderation/reportUi';
import { formatearFechaSancion } from '@/shared/moderation/sancionUi';
import { useHistorial } from '@/features/admin/hooks/useHistorial';
import {
  TIPOS_HISTORIAL,
  describirAccion,
} from '@/features/admin/utils/historialUi';

const TIPOS = Object.keys(TIPOS_HISTORIAL);

export default function HistorialPage() {
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
  } = useHistorial({ tipo });

  const acciones = data?.pages.flatMap((p) => p.items) ?? [];
  const total = data?.pages[0]?.meta?.total ?? 0;

  return (
    <div className='mx-auto w-full max-w-[820px] px-6 py-10'>
      <h1 className='mb-1.5 text-xl font-bold text-neutral-100'>Historial</h1>
      <p className='mb-6 text-[13.5px] leading-relaxed text-neutral-400'>
        Decisiones de moderación: quién las tomó y cuándo. Solo lo ven los
        administradores.
      </p>

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
            {t ? TIPOS_HISTORIAL[t].chip : 'Todas'}
          </button>
        ))}
      </div>

      {isError && (
        <div className='mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          <span>
            {mensajeDeError(error, 'No se pudo cargar el historial.')}
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

      {!isPending && !isError && acciones.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
          <i className='ti ti-mood-empty mb-3 block text-5xl text-neutral-700' />
          <p className='text-sm font-semibold text-neutral-300'>
            Todavía no hay acciones registradas
          </p>
          <p className='mt-1.5 text-xs text-neutral-600'>
            Las sanciones, cierres de reportes y eliminaciones por moderación
            aparecerán acá.
          </p>
        </div>
      )}

      {acciones.length > 0 && (
        <>
          <p className='mb-2.5 text-[11.5px] text-neutral-500'>
            {total} acción{total === 1 ? '' : 'es'} registrada
            {total === 1 ? '' : 's'}
          </p>
          <ul className='flex flex-col gap-2.5'>
            {acciones.map((accion) => {
              const meta = TIPOS_HISTORIAL[accion.tipo];
              return (
                <li
                  key={accion.id}
                  className='rounded-[12px] border border-white/[0.06] bg-[#1E1E24] p-4'
                >
                  <div className='mb-1.5 flex items-center gap-2'>
                    <i
                      className={`ti ${meta?.icono ?? 'ti-history'} text-[13px] text-neutral-500`}
                    />
                    <span className='text-[11px] font-semibold uppercase tracking-wide text-neutral-500'>
                      {meta?.titulo ?? accion.tipo}
                    </span>
                  </div>
                  <p className='line-clamp-3 text-[13px] leading-relaxed text-neutral-100'>
                    {describirAccion(accion)}
                  </p>
                  <p className='mt-2 text-[11.5px] text-neutral-500'>
                    {meta?.quien ?? 'Acción de'}:{' '}
                    <span className='font-medium text-neutral-300'>
                      {nombreDeUsuario(accion.admin)}
                    </span>
                    {` · ${formatearFechaSancion(accion.creado_en)}`}
                  </p>
                </li>
              );
            })}
          </ul>

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