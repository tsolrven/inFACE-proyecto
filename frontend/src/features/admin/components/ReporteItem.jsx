import { obtenerMotivo } from '@/shared/moderation/reportReasons';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { formatearFechaSancion } from '@/shared/moderation/sancionUi';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import Button from '@/shared/components/ui/Button';
import { useReintentarCorreo } from '@/features/admin/hooks/useModeracion';
import {
  ESTADO_BADGE,
  ESTADO_LABEL_MODERACION,
  nombreDeUsuario,
} from '@/shared/moderation/reportUi';

const CORREO = {
  pendiente: {
    label: 'Correo pendiente',
    clase: 'text-amber-400',
    icono: 'ti-mail-forward',
  },
  enviando: {
    label: 'Enviando correo…',
    clase: 'text-amber-400',
    icono: 'ti-loader-2 animate-spin',
  },
  enviada: {
    label: 'Correo enviado',
    clase: 'text-emerald-400',
    icono: 'ti-mail-check',
  },
  fallida: {
    label: 'Correo fallido',
    clase: 'text-red-400',
    icono: 'ti-mail-exclamation',
  },
  omitida: {
    label: 'Sin correo',
    clase: 'text-neutral-500',
    icono: 'ti-mail-off',
  },
};

const RESULTADO_REINTENTO = {
  enviada: 'Correo enviado',
  fallida: 'El envío volvió a fallar',
  omitida: 'El correo se omitió',
};

// el backend decide si el reintento procede (409 si ya se envió o está en curso)
const REINTENTABLES = ['pendiente', 'enviando', 'fallida'];

export default function ReporteItem({ reporte }) {
  const reintentar = useReintentarCorreo();
  const motivo = obtenerMotivo(reporte.motivo);
  const correo = CORREO[reporte.notificacion_estado];
  const cerrado = reporte.estado !== 'pendiente';

  function handleReintentar() {
    reintentar.mutate(reporte.id, {
      onSuccess: (r) =>
        mostrarToast(
          RESULTADO_REINTENTO[r.notificacion_estado] ?? 'Reintento realizado',
        ),
      onError: (err) =>
        mostrarToast(mensajeDeError(err, 'No se pudo reintentar el envío')),
    });
  }

  return (
    <div className='rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5'>
      <div className='mb-1.5 flex items-center justify-between gap-2'>
        <div className='flex min-w-0 items-center gap-2 text-[12.5px]'>
          <span className='truncate font-semibold text-neutral-100'>
            {nombreDeUsuario(reporte.reportador)}
          </span>
          <span className='flex-shrink-0 text-neutral-600'>
            {formatearTiempoRelativo(reporte.creado_en)}
          </span>
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${ESTADO_BADGE[reporte.estado] ?? ''
            }`}
        >
          {ESTADO_LABEL_MODERACION[reporte.estado] ?? reporte.estado}
        </span>
      </div>

      <p className='text-[12.5px] font-medium text-neutral-300'>
        {motivo?.label ?? reporte.motivo}
      </p>
      {reporte.detalle && (
        <p className='mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-neutral-400'>
          {reporte.detalle}
        </p>
      )}

      {cerrado && reporte.nota_resolucion && (
        <div className='mt-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2'>
          <p className='mb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-neutral-500'>
            Respuesta
            {reporte.respuesta_personalizada ? ' (personalizada)' : ''}
            {reporte.revisado_en &&
              ` · ${formatearTiempoRelativo(reporte.revisado_en)}`}
          </p>
          <p className='whitespace-pre-line text-[12.5px] leading-relaxed text-neutral-300'>
            {reporte.nota_resolucion}
          </p>
          {reporte.revisor && (
            <p className='mt-1.5 text-[11.5px] text-neutral-500'>
              Decisión tomada por:{' '}
              <span className='font-medium text-neutral-300'>
                {nombreDeUsuario(reporte.revisor)}
              </span>
              {reporte.revisado_en &&
                ` · ${formatearFechaSancion(reporte.revisado_en)}`}
            </p>
          )}
        </div>
      )}

      {correo && (
        <div className='mt-2.5 flex items-center justify-between gap-3'>
          <div className={`min-w-0 text-[11.5px] ${correo.clase}`}>
            <span className='flex items-center gap-1'>
              <i className={`ti ${correo.icono}`} />
              {correo.label}
              {reporte.notificacion_intentos > 1 &&
                ` · ${reporte.notificacion_intentos} intentos`}
            </span>
            {reporte.notificacion_error && (
              <span className='mt-0.5 block text-[11px] text-neutral-500'>
                {reporte.notificacion_error}
              </span>
            )}
          </div>
          {REINTENTABLES.includes(reporte.notificacion_estado) && (
            <Button
              size='sm'
              icon='ti-refresh'
              loading={reintentar.isPending}
              onClick={handleReintentar}
            >
              Reintentar correo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}