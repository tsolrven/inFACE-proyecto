import { obtenerMotivo } from '@/shared/moderation/reportReasons';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import {
  ETIQUETA_TIPO,
  ICONO_POR_TIPO,
  ESTADO_BADGE,
  etiquetaEliminacion,
} from '@/shared/moderation/reportUi';

const ESTADO_LABEL = {
  resuelto: 'Resuelto',
  descartado: 'Descartado',
  contenido_eliminado: 'Contenido eliminado',
};

const MAX_MOTIVOS_VISIBLES = 3;

// Una fila de la cola: un contenido con todos sus reportes de esa vista.
export default function FilaCola({ grupo, onAbrir }) {
  const {
    tipo_contenido,
    titulo,
    contenido_existe,
    eliminado_por,
    total_reportes,
    motivos,
    estados,
    correos_con_problema,
    correos_enviados,
    ultimo_en,
  } = grupo;

  // en la vista Pendientes todos son "pendiente": solo se muestra el resultado
  // la insignia de «contenido eliminado» la reemplaza la etiqueta de quién lo eliminó
  const resultados = Object.keys(estados).filter(
    (e) =>
      e !== 'pendiente' && !(e === 'contenido_eliminado' && !contenido_existe),
  );

  return (
    <button
      type='button'
      onClick={onAbrir}
      className='w-full rounded-[12px] border border-white/[0.06] bg-[#1E1E24] p-4 text-left transition-colors hover:border-white/[0.16]'
    >
      <div className='mb-1.5 flex items-start justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <i
            className={`ti ${ICONO_POR_TIPO[tipo_contenido] ?? 'ti-flag'} flex-shrink-0 text-[13px] text-neutral-500`}
          />
          <span className='flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide text-neutral-500'>
            {ETIQUETA_TIPO[tipo_contenido] ?? tipo_contenido}
          </span>
        </div>

        <div className='flex flex-shrink-0 flex-wrap justify-end gap-1.5'>
          {!contenido_existe && (
            <span className='rounded-full bg-neutral-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-neutral-500'>
              {etiquetaEliminacion(eliminado_por)}
            </span>
          )}
          {resultados.map((estado) => (
            <span
              key={estado}
              className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${ESTADO_BADGE[estado] ?? ''}`}
            >
              {ESTADO_LABEL[estado] ?? estado}
            </span>
          ))}
        </div>
      </div>

      <p className='mb-2.5 line-clamp-2 text-[13px] font-medium leading-relaxed text-neutral-100'>
        {titulo || (
          <span className='italic font-normal text-neutral-600'>
            Sin vista previa disponible
          </span>
        )}
      </p>

      <div className='mb-2.5 flex flex-wrap items-center gap-1.5'>
        <span className='rounded-full bg-pink-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-pink-400'>
          {total_reportes} reporte{total_reportes === 1 ? '' : 's'}
        </span>
        {motivos.slice(0, MAX_MOTIVOS_VISIBLES).map(({ motivo, cantidad }) => (
          <span
            key={motivo}
            className='rounded-full bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-neutral-400'
          >
            {obtenerMotivo(motivo)?.label ?? motivo}
            {cantidad > 1 && ` ×${cantidad}`}
          </span>
        ))}
        {motivos.length > MAX_MOTIVOS_VISIBLES && (
          <span className='text-[10.5px] text-neutral-600'>
            +{motivos.length - MAX_MOTIVOS_VISIBLES} más
          </span>
        )}
      </div>

      <div className='flex items-center justify-between text-[11px] text-neutral-600'>
        {correos_con_problema > 0 ? (
          <span
            className='flex items-center gap-1 text-amber-400'
            title='Hay correos a reportantes sin confirmar. Revisa el detalle.'
          >
            <i className='ti ti-mail-exclamation' /> Correo sin confirmar
          </span>
        ) : correos_enviados > 0 ? (
          <span className='flex items-center gap-1 text-emerald-400'>
            <i className='ti ti-mail-check' />
            {correos_enviados === total_reportes
              ? total_reportes === 1
                ? 'Correo enviado'
                : 'Correos enviados'
              : `Correo enviado (${correos_enviados}/${total_reportes})`}
          </span>
        ) : (
          <span />
        )}
        <span>{formatearTiempoRelativo(ultimo_en)}</span>
      </div>
    </button>
  );
}