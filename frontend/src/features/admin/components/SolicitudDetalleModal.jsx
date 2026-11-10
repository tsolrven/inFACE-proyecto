import Modal, { ModalHeader, ModalBody } from '@/shared/components/ui/Modal';
import { descargarArchivo } from '@/shared/api/archivos.api';
import { formatearTamanio } from '@/shared/lib/archivos';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import PanelResolucion from '@/features/admin/components/PanelResolucion';
import { useSolicitudAdmin } from '@/features/admin/hooks/useSolicitudesAdmin';
import {
  ESTADO_UI,
  ETIQUETA_TIPO,
  formatearFechaCargo,
  formatearFechaHora,
} from '@/features/cargos';

function Seccion({ titulo, children }) {
  return (
    <div className='mb-4'>
      <h3 className='mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500'>
        {titulo}
      </h3>
      {children}
    </div>
  );
}

// Detalle de una solicitud; si está pendiente, permite aprobarla o rechazarla.
export default function SolicitudDetalleModal({ id, onClose }) {
  const { data: s, isPending, isError, error } = useSolicitudAdmin(id);

  async function descargar(archivo) {
    try {
      await descargarArchivo(archivo);
    } catch (err) {
      mostrarToast(mensajeDeError(err, 'No se pudo descargar el archivo.'));
    }
  }

  const ui = s ? ESTADO_UI[s.estado] : null;
  const nombre = s
    ? s.solicitante.nombre_completo || s.solicitante.nombre_usuario || 'Usuario'
    : '';

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth='560px'
    >
      <ModalHeader
        title={
          s
            ? `${ETIQUETA_TIPO[s.tipo] ?? s.tipo} · ${s.carrera.nombre}`
            : 'Solicitud de cargo'
        }
        subtitle={
          s
            ? `${nombre}${s.solicitante.nombre_usuario ? ` (@${s.solicitante.nombre_usuario})` : ''}`
            : undefined
        }
        onClose={onClose}
      />
      <ModalBody>
        {isPending && (
          <div className='flex items-center justify-center py-10 text-neutral-600'>
            <i className='ti ti-loader-2 animate-spin text-2xl' />
          </div>
        )}

        {isError && (
          <p className='text-[12.5px] text-red-400'>
            {mensajeDeError(error, 'No se pudo cargar la solicitud.')}
          </p>
        )}

        {s && (
          <>
            <div className='mb-4 flex flex-wrap items-center gap-2'>
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${ui?.clase ?? ''}`}
              >
                {ui?.etiqueta ?? s.estado}
              </span>
              <span className='text-[11.5px] text-neutral-500'>
                Enviada el {formatearFechaHora(s.creado_en)}
              </span>
              {s.es_propia && (
                <span className='rounded-full bg-white/[0.05] px-2 py-0.5 text-[10.5px] font-semibold text-neutral-400'>
                  Tuya
                </span>
              )}
            </div>

            <Seccion titulo='Mensaje'>
              <p className='whitespace-pre-wrap break-words text-[13px] leading-relaxed text-neutral-200'>
                {s.mensaje}
              </p>
            </Seccion>

            <Seccion titulo='Respaldos'>
              {s.archivos.length > 0 ? (
                <div className='flex flex-wrap gap-1.5'>
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
              ) : (
                <p className='text-[12.5px] text-neutral-500'>
                  {s.archivos_borrados_en
                    ? `Los respaldos se eliminaron el ${formatearFechaHora(s.archivos_borrados_en)}.`
                    : 'No adjuntó respaldos.'}
                </p>
              )}
            </Seccion>

            {s.vigencia_propuesta && (
              <Seccion titulo='Vigencia si se aprueba'>
                <p className='text-[13px] text-neutral-200'>
                  Del {formatearFechaCargo(s.vigencia_propuesta.desde)} al{' '}
                  {formatearFechaCargo(s.vigencia_propuesta.hasta)}
                  {s.vigencia_propuesta.renovacion && (
                    <span className='text-neutral-500'> (renovación)</span>
                  )}
                </p>
              </Seccion>
            )}

            {s.resuelta_en && (
              <Seccion titulo='Resolución'>
                <p className='text-[12.5px] text-neutral-400'>
                  {formatearFechaHora(s.resuelta_en)}
                  {s.resuelta_por?.nombre_usuario &&
                    ` · por @${s.resuelta_por.nombre_usuario}`}
                </p>
                {s.estado === 'rechazada' && s.motivo_rechazo && (
                  <p className='mt-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12px] text-red-300'>
                    Motivo del rechazo: {s.motivo_rechazo}
                  </p>
                )}
              </Seccion>
            )}
            {s.estado === 'pendiente' && (
              <PanelResolucion
                solicitud={s}
                onTerminar={onClose}
              />
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
}