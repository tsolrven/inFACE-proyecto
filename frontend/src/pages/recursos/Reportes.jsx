import { useEffect, useState } from 'react';
import { listarMisReportes } from '../../services/reportes/reporte.service';
import { obtenerMotivo } from '../../constants/reportMotivos';
import { formatearTiempoRelativo } from '../../utils/formatRelativeTime';

const ICONO_POR_TIPO = {
  apunte: 'ti-file-text',
  comentario: 'ti-message-circle-2',
};

const ESTADO_BADGE = {
  pendiente: 'bg-amber-400/10 text-amber-400',
  resuelto: 'bg-emerald-400/10 text-emerald-400',
  descartado: 'bg-neutral-500/10 text-neutral-500',
};

const ESTADO_LABEL = {
  pendiente: 'En revisión',
  resuelto: 'Resuelto',
  descartado: 'Descartado',
};

export default function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    listarMisReportes()
      .then((data) => !cancelado && setReportes(data))
      .catch(
        (err) =>
          !cancelado &&
          setError(err.message || 'No se pudieron cargar tus reportes.'),
      )
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div className='mx-auto w-full max-w-[720px] px-6 py-10'>
      <h1 className='mb-1.5 text-xl font-bold text-neutral-100'>
        Mis reportes
      </h1>
      <p className='mb-8 text-[13.5px] leading-relaxed text-neutral-400'>
        Acá puedes hacer seguimiento a los reportes que has enviado y su estado
        actual.
      </p>

      {error && (
        <div className='mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          {error}
        </div>
      )}

      {cargando && (
        <div className='flex items-center justify-center py-16 text-neutral-600'>
          <i className='ti ti-loader-2 animate-spin text-2xl' />
        </div>
      )}

      {!cargando && !error && reportes.length === 0 && (
        <div className='flex flex-col items-center justify-center py-16 text-center select-none'>
          <i className='ti ti-mood-empty mb-3 block text-5xl text-neutral-700' />
          <p className='text-sm font-semibold text-neutral-300'>
            No has enviado reportes todavía
          </p>
          <p className='mt-1.5 text-xs text-neutral-600'>
            Cuando reportes un post o comentario, va a aparecer acá.
          </p>
        </div>
      )}

      {!cargando && !error && reportes.length > 0 && (
        <div className='flex flex-col gap-2.5'>
          {reportes.map((reporte) => {
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
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                      ESTADO_BADGE[reporte.estado] ?? ESTADO_BADGE.pendiente
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
                      Este contenido ya no está disponible (fue eliminado).
                    </span>
                  )}
                </p>

                <div className='flex items-center justify-between text-[11px] text-neutral-600'>
                  <span className='capitalize'>{reporte.tipo_contenido}</span>
                  <span>{formatearTiempoRelativo(reporte.creado_en)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
