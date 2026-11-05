import { useState } from 'react';
import {
  useMisReportes,
  useOcultarReporte,
} from '@/features/reports/hooks/useReportes';
import Pestanas from '@/shared/components/ui/Pestanas';
import { obtenerMotivo } from '@/shared/moderation/reportReasons';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import {
  ICONO_POR_TIPO,
  ESTADO_BADGE,
} from '@/shared/moderation/reportUi';

const ESTADO_LABEL = {
  pendiente: 'En revisión',
  resuelto: 'Resuelto',
  descartado: 'Descartado',
  contenido_eliminado: 'Contenido eliminado',
};

const PESTANAS = [
  { id: 'revision', label: 'En revisión', icono: 'ti-clock' },
  { id: 'resueltos', label: 'Resueltos', icono: 'ti-circle-check' },
  { id: 'descartados', label: 'Descartados', icono: 'ti-circle-x' },
];

const PESTANA_POR_ESTADO = {
  pendiente: 'revision',
  resuelto: 'resueltos',
  contenido_eliminado: 'resueltos',
  descartado: 'descartados',
};

const VACIO = {
  revision: {
    titulo: 'No tienes reportes en revisión',
    detalle: 'Cuando reportes un post o comentario, va a aparecer acá.',
  },
  resueltos: {
    titulo: 'No tienes reportes resueltos',
    detalle: 'Los reportes que se resuelvan o terminen con el contenido eliminado van a aparecer acá.',
  },
  descartados: {
    titulo: 'No tienes reportes descartados',
    detalle: 'Los reportes en los que no se encontraron incumplimientos van a aparecer acá.',
  },
};

export default function MisReportesPage() {
  const {
    data: reportes = [],
    isPending,
    isError,
    error,
    refetch,
  } = useMisReportes();
  const ocultar = useOcultarReporte();
  const [vista, setVista] = useState('revision');

  const porPestana = { revision: [], resueltos: [], descartados: [] };
  for (const r of reportes) {
    porPestana[PESTANA_POR_ESTADO[r.estado] ?? 'revision'].push(r);
  }
  const pestanas = PESTANAS.map((p) => ({
    ...p,
    label: `${p.label} (${porPestana[p.id].length})`,
  }));
  const visibles = porPestana[vista];

  return (
    <div className='mx-auto w-full max-w-[720px] px-6 py-10'>
      <h1 className='mb-1.5 text-xl font-bold text-neutral-100'>
        Mis reportes
      </h1>
      <p className='mb-6 text-[13.5px] leading-relaxed text-neutral-400'>
        Acá puedes hacer seguimiento a los reportes que has enviado y su estado
        actual.
      </p>

      {isError && (
        <div className='mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          <span>{error?.message || 'No se pudieron cargar tus reportes.'}</span>
          <button
            type='button'
            onClick={() => refetch()}
            className='flex-shrink-0 font-semibold underline-offset-2 hover:underline'
          >
            Reintentar
          </button>
        </div>
      )}

      {ocultar.isError && (
        <p className='mb-4 text-[12.5px] text-red-400'>
          {ocultar.error?.message || 'No se pudo quitar el reporte.'}
        </p>
      )}

      {isPending && (
        <div className='flex items-center justify-center py-16 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {!isPending && !isError && (
        <>
          <div className='-mx-4 mb-4'>
            <Pestanas
              pestanas={pestanas}
              activa={vista}
              onCambiar={setVista}
            />
          </div>

          {visibles.length === 0 && (
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

          {visibles.length > 0 && (
            <div className='flex flex-col gap-2.5'>
              {visibles.map((reporte) => {
                const motivo = obtenerMotivo(reporte.motivo);
                return (
                  <div
                    key={reporte.id}
                    className='rounded-[12px] border border-white/[0.06] bg-[#1E1E24] p-4'
                  >
                    <div className='mb-1.5 flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-2'>
                        <i
                          className={`ti ${ICONO_POR_TIPO[reporte.tipo_contenido] ?? 'ti-flag'} text-[13px] text-neutral-500`}
                        />
                        <span className='text-[13px] font-semibold text-neutral-100'>
                          {motivo?.label ?? reporte.motivo}
                        </span>
                      </div>
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${ESTADO_BADGE[reporte.estado] ?? ESTADO_BADGE.pendiente
                          }`}
                      >
                        {ESTADO_LABEL[reporte.estado] ?? reporte.estado}
                      </span>
                    </div>

                    <p className='mb-2 line-clamp-2 text-[12.5px] leading-relaxed text-neutral-400'>
                      {reporte.contenido_existe ? (
                        reporte.contenido_preview || 'Sin vista previa disponible.'
                      ) : (
                        <span className='italic text-neutral-600'>
                          El contenido ya no está disponible
                        </span>
                      )}
                    </p>

                    {reporte.estado !== 'pendiente' && reporte.nota_resolucion && (
                      <div className='mb-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2'>
                        <p className='mb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-neutral-500'>
                          Respuesta de moderación
                        </p>
                        <p className='whitespace-pre-line text-[12.5px] leading-relaxed text-neutral-300'>
                          {reporte.nota_resolucion}
                        </p>
                      </div>
                    )}

                    <div className='flex items-center justify-between text-[11px] text-neutral-600'>
                      <span className='capitalize'>{reporte.tipo_contenido}</span>
                      <div className='flex items-center gap-3'>
                        {reporte.estado !== 'pendiente' && (
                          <button
                            type='button'
                            onClick={() => ocultar.mutate(reporte.id)}
                            disabled={
                              ocultar.isPending &&
                              ocultar.variables === reporte.id
                            }
                            className='font-semibold text-neutral-500 transition-colors hover:text-neutral-200 disabled:opacity-50'
                          >
                            Quitar de mi lista
                          </button>
                        )}
                        <span>{formatearTiempoRelativo(reporte.creado_en)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}