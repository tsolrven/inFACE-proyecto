import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import {
  ESTADO_UI,
  ETIQUETA_TIPO,
  formatearFechaHora,
} from '@/features/cargos';

// Una fila de la cola: una solicitud de cargo.
export default function FilaSolicitud({ solicitud, onAbrir }) {
  const {
    tipo,
    carrera,
    solicitante,
    mensaje,
    estado,
    creado_en,
    resuelta_en,
    resuelta_por,
    cantidad_respaldos,
    es_propia,
  } = solicitud;
  const ui = ESTADO_UI[estado];

  return (
    <button
      type='button'
      onClick={onAbrir}
      className='w-full rounded-[12px] border border-white/[0.06] bg-[#1E1E24] p-4 text-left transition-colors hover:border-white/[0.16]'
    >
      <div className='mb-1.5 flex items-start justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <i className='ti ti-id-badge-2 flex-shrink-0 text-[13px] text-neutral-500' />
          <span className='truncate text-[11px] font-semibold uppercase tracking-wide text-neutral-500'>
            {ETIQUETA_TIPO[tipo] ?? tipo} · {carrera.nombre}
          </span>
        </div>
        <div className='flex flex-shrink-0 flex-wrap justify-end gap-1.5'>
          {es_propia && (
            <span className='rounded-full bg-white/[0.05] px-2 py-0.5 text-[10.5px] font-semibold text-neutral-400'>
              Tuya
            </span>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${ui?.clase ?? ''}`}
          >
            {ui?.etiqueta ?? estado}
          </span>
        </div>
      </div>

      <p className='mb-1 text-[13px] font-medium text-neutral-100'>
        {solicitante.nombre_completo || solicitante.nombre_usuario || 'Usuario'}
        {solicitante.nombre_usuario && solicitante.nombre_completo && (
          <span className='font-normal text-neutral-500'>
            {' '}
            @{solicitante.nombre_usuario}
          </span>
        )}
      </p>

      <p className='mb-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-neutral-400'>
        {mensaje}
      </p>

      <div className='flex items-center justify-between gap-3 text-[11px] text-neutral-600'>
        <span className='flex items-center gap-1'>
          <i className='ti ti-paperclip' />
          {cantidad_respaldos} respaldo{cantidad_respaldos === 1 ? '' : 's'}
        </span>
        <span className='truncate'>
          {resuelta_en
            ? `${resuelta_por?.nombre_usuario ? `@${resuelta_por.nombre_usuario} · ` : ''}${formatearFechaHora(resuelta_en)}`
            : formatearTiempoRelativo(creado_en)}
        </span>
      </div>
    </button>
  );
}