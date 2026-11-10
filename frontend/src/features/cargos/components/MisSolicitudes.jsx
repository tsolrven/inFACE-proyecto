import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { descargarArchivo } from '@/shared/api/archivos.api';
import { formatearTamanio } from '@/shared/lib/archivos';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import {
  useMisSolicitudes,
  useCancelarSolicitud,
} from '@/features/cargos/hooks/useSolicitudesCargo';
import {
  ESTADO_UI,
  ETIQUETA_TIPO,
  formatearFechaHora,
} from '@/features/cargos/utils/cargosUi';

export default function MisSolicitudes() {
  const { data, isPending, isError, error } = useMisSolicitudes();
  const cancelar = useCancelarSolicitud();
  const [aCancelar, setACancelar] = useState(null);

  async function confirmarCancelacion() {
    try {
      await cancelar.mutateAsync(aCancelar.id);
      mostrarToast('Solicitud cancelada');
    } catch (err) {
      mostrarToast(mensajeDeError(err, 'No se pudo cancelar la solicitud.'));
    } finally {
      setACancelar(null);
    }
  }

  async function descargar(archivo) {
    try {
      await descargarArchivo(archivo);
    } catch (err) {
      mostrarToast(mensajeDeError(err, 'No se pudo descargar el archivo.'));
    }
  }

  if (isPending) {
    return <p className='text-[12.5px] text-neutral-500'>Cargando…</p>;
  }
  if (isError) {
    return (
      <p className='text-[12.5px] text-red-400'>
        {mensajeDeError(error, 'No se pudieron cargar tus solicitudes.')}
      </p>
    );
  }

  const solicitudes = data.solicitudes;
  if (solicitudes.length === 0) {
    return (
      <p className='text-[12.5px] text-neutral-500'>
        Todavía no has enviado solicitudes.
      </p>
    );
  }

  return (
    <>
      <ul className='flex flex-col gap-3'>
        {solicitudes.map((s) => {
          const estado = ESTADO_UI[s.estado];
          return (
            <li
              key={s.id}
              className='rounded-[10px] border border-white/[0.07] bg-[#111114] p-3'
            >
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='min-w-0'>
                  <div className='text-[13px] font-semibold text-neutral-100'>
                    {ETIQUETA_TIPO[s.tipo] ?? s.tipo} · {s.carrera.nombre}
                  </div>
                  <div className='text-[11px] text-neutral-600'>
                    Enviada el {formatearFechaHora(s.creado_en)}
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${estado?.clase ?? ''}`}
                >
                  {estado?.etiqueta ?? s.estado}
                </span>
              </div>

              <p className='mt-2 whitespace-pre-wrap break-words text-[12.5px] text-neutral-400'>
                {s.mensaje}
              </p>

              {s.estado === 'rechazada' && s.motivo_rechazo && (
                <p className='mt-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12px] text-red-300'>
                  Motivo del rechazo: {s.motivo_rechazo}
                </p>
              )}

              {s.archivos.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-1.5'>
                  {s.archivos.map((a) => (
                    <button
                      key={a.id}
                      type='button'
                      onClick={() => descargar(a)}
                      className='inline-flex max-w-full items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[11.5px] text-neutral-300 transition hover:bg-white/[0.06]'
                    >
                      <i className='ti ti-download text-[13px] text-neutral-500' />
                      <span className='truncate'>{a.nombre_archivo}</span>
                      {a.tamanio > 0 && (
                        <span className='text-neutral-600'>
                          {formatearTamanio(a.tamanio)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {s.archivos_borrados_en && (
                <p className='mt-2 text-[11px] text-neutral-600'>
                  Los respaldos se eliminaron el{' '}
                  {formatearFechaHora(s.archivos_borrados_en)}.
                </p>
              )}

              {s.estado === 'pendiente' && (
                <div className='mt-3 flex justify-end'>
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={() => setACancelar(s)}
                  >
                    Cancelar solicitud
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={!!aCancelar}
        title='Cancelar solicitud'
        message='La solicitud dejará de estar pendiente. Podrás enviar una nueva cuando quieras.'
        confirmLabel='Cancelar solicitud'
        cancelLabel='Volver'
        danger
        loading={cancelar.isPending}
        onConfirm={confirmarCancelacion}
        onCancel={() => setACancelar(null)}
      />
    </>
  );
}