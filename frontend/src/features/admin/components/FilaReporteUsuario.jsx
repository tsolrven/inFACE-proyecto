import { obtenerMotivo } from '@/shared/moderation/reportReasons';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import {
  ETIQUETA_TIPO,
  ICONO_POR_TIPO,
  ESTADO_BADGE,
  ESTADO_LABEL_MODERACION,
  etiquetaEliminacion,
} from '@/shared/moderation/reportUi';

const MAX_MOTIVOS_VISIBLES = 3;

const ETIQUETA_FECHA = {
  recibidos: 'Último reporte',
  realizados: 'Reportado',
  eliminados: 'Eliminado',
};

// Una fila de las listas de la ficha. «recibidos» y «eliminados» llegan
// agrupados por contenido; «realizados» es un ítem por reporte.
// No muestra reportantes ni detalle: el backend no los envía.
export default function FilaReporteUsuario({ item, lista, onAbrir }) {
  const { tipo_contenido, titulo, contenido_existe, eliminado_por } = item;
  const agrupado = lista !== 'realizados';

  // «eliminados» son, por definición, los que borró la moderación (también
  // los reportes anteriores al campo eliminado_por)
  const mostrarEliminado = lista === 'eliminados' || !contenido_existe;
  const origen = eliminado_por ?? (lista === 'eliminados' ? 'moderacion' : null);

  // en «eliminados» todos están en el mismo estado: la insignia no informa; y
  // la de «Contenido eliminado» la reemplaza la etiqueta de quién lo eliminó
  const estados = (
    lista === 'eliminados'
      ? []
      : agrupado
        ? Object.keys(item.estados)
        : [item.estado]
  ).filter((e) => !(mostrarEliminado && e === 'contenido_eliminado'));
  const fecha = agrupado ? item.ultimo_en : item.creado_en;

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
          {mostrarEliminado && (
            <span className='rounded-full bg-neutral-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-neutral-500'>
              {etiquetaEliminacion(origen)}
            </span>
          )}
          {estados.map((estado) => (
            <span
              key={estado}
              className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${ESTADO_BADGE[estado] ?? ''}`}
            >
              {ESTADO_LABEL_MODERACION[estado] ?? estado}
            </span>
          ))}
        </div>
      </div>

      <p className='mb-2.5 line-clamp-2 text-[13px] font-medium leading-relaxed text-neutral-100'>
        {titulo || (
          <span className='font-normal italic text-neutral-600'>
            Sin vista previa disponible
          </span>
        )}
      </p>

      <div className='flex flex-wrap items-center gap-1.5'>
        {agrupado ? (
          <>
            <span className='rounded-full bg-pink-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-pink-400'>
              {item.total_reportes} reporte
              {item.total_reportes === 1 ? '' : 's'}
            </span>
            {item.motivos
              .slice(0, MAX_MOTIVOS_VISIBLES)
              .map(({ motivo, cantidad }) => (
                <span
                  key={motivo}
                  className='rounded-full bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-neutral-400'
                >
                  {obtenerMotivo(motivo)?.label ?? motivo}
                  {cantidad > 1 && ` ×${cantidad}`}
                </span>
              ))}
            {item.motivos.length > MAX_MOTIVOS_VISIBLES && (
              <span className='text-[10.5px] text-neutral-600'>
                +{item.motivos.length - MAX_MOTIVOS_VISIBLES} más
              </span>
            )}
          </>
        ) : (
          <span className='rounded-full bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-neutral-400'>
            {obtenerMotivo(item.motivo)?.label ?? item.motivo}
          </span>
        )}
        {fecha && (
          <span className='ml-auto text-[11px] text-neutral-600'>
            {ETIQUETA_FECHA[lista]} {formatearTiempoRelativo(fecha)}
          </span>
        )}
      </div>
    </button>
  );
}