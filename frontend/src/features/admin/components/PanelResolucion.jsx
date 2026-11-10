import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import { inputClasses } from '@/shared/components/form/inputClasses';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import {
  useAprobarSolicitud,
  useRechazarSolicitud,
} from '@/features/admin/hooks/useSolicitudesAdmin';
import {
  ETIQUETA_TIPO,
  MOTIVO_MAX,
  MOTIVO_MIN,
  formatearFechaCargo,
} from '@/features/cargos';

// Aprobar o rechazar una solicitud pendiente. `onTerminar` cierra el detalle.
export default function PanelResolucion({ solicitud, onTerminar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const aprobar = useAprobarSolicitud();
  const rechazar = useRechazarSolicitud();

  // un superadmin no resuelve su propia solicitud (el backend responde 403)
  if (solicitud.es_propia) {
    return (
      <p className='rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-[12.5px] text-neutral-400'>
        Es tu propia solicitud: debe resolverla otro moderador.
      </p>
    );
  }

  const limpio = motivo.trim();
  const motivoValido =
    limpio.length >= MOTIVO_MIN && limpio.length <= MOTIVO_MAX;
  const vigencia = solicitud.vigencia_propuesta;
  const nombre =
    solicitud.solicitante.nombre_completo ||
    solicitud.solicitante.nombre_usuario ||
    'el solicitante';

  async function confirmarAprobacion() {
    try {
      await aprobar.mutateAsync(solicitud.id);
      mostrarToast('Solicitud aprobada');
      onTerminar();
    } catch (err) {
      setConfirmando(false);
      mostrarToast(mensajeDeError(err, 'No se pudo aprobar la solicitud.'));
    }
  }

  async function confirmarRechazo() {
    try {
      await rechazar.mutateAsync({ id: solicitud.id, motivo: limpio });
      mostrarToast('Solicitud rechazada');
      onTerminar();
    } catch {
      // el error se muestra abajo (rechazar.error)
    }
  }

  function cancelarRechazo() {
    rechazar.reset();
    setRechazando(false);
    setMotivo('');
  }

  return (
    <div className='border-t border-white/[0.06] pt-4'>
      {!rechazando ? (
        <div className='flex justify-end gap-2'>
          <Button
            variant='danger'
            icon='ti-x'
            onClick={() => setRechazando(true)}
          >
            Rechazar
          </Button>
          <Button
            variant='primary'
            icon='ti-check'
            onClick={() => setConfirmando(true)}
          >
            Aprobar
          </Button>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          <p className='text-[12px] font-semibold text-neutral-400'>
            Motivo del rechazo
          </p>
          <textarea
            rows={3}
            maxLength={MOTIVO_MAX}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder='Lo verá la persona que hizo la solicitud.'
            className={`${inputClasses} resize-none`}
          />
          <div className='flex items-center justify-between'>
            <span className='text-[11px] text-neutral-600'>
              Mínimo {MOTIVO_MIN} caracteres.
            </span>
            <CharCounter
              value={motivo}
              max={MOTIVO_MAX}
            />
          </div>

          {rechazar.isError && (
            <div className='rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
              {mensajeDeError(
                rechazar.error,
                'No se pudo rechazar la solicitud.',
              )}
            </div>
          )}

          <div className='flex justify-end gap-2'>
            <Button
              variant='ghost'
              disabled={rechazar.isPending}
              onClick={cancelarRechazo}
            >
              Cancelar
            </Button>
            <Button
              variant='danger'
              loading={rechazar.isPending}
              disabled={!motivoValido}
              onClick={confirmarRechazo}
            >
              Confirmar rechazo
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmando}
        title='Aprobar solicitud'
        message={
          vigencia
            ? `Se otorgará el cargo de ${ETIQUETA_TIPO[solicitud.tipo] ?? solicitud.tipo} en ${solicitud.carrera.nombre} a ${nombre}, del ${formatearFechaCargo(vigencia.desde)} al ${formatearFechaCargo(vigencia.hasta)}.`
            : `Se otorgará el cargo a ${nombre}.`
        }
        confirmLabel='Aprobar'
        cancelLabel='Volver'
        loading={aprobar.isPending}
        onConfirm={confirmarAprobacion}
        onCancel={() => setConfirmando(false)}
      />
    </div>
  );
}