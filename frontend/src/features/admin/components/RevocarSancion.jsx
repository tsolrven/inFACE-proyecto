import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import { inputClasses } from '@/shared/components/form/inputClasses';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import { useRevocarSancion } from '@/features/admin/hooks/useSanciones';
import {
  MOTIVO_SANCION_MAX,
  MOTIVO_SANCION_MIN,
} from '@/shared/moderation/sancionUi';

// Solo se revoca lo que sigue en pie (igual que el backend)
const REVOCABLES = ['vigente', 'registrada'];

export default function RevocarSancion({ usuarioId, sancion }) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState('');
  const revocar = useRevocarSancion();

  if (!REVOCABLES.includes(sancion.estado)) return null;

  const limpio = motivo.trim();
  // el motivo es opcional; si se escribe, debe cumplir el mínimo
  const motivoValido =
    limpio.length === 0 ||
    (limpio.length >= MOTIVO_SANCION_MIN &&
      limpio.length <= MOTIVO_SANCION_MAX);

  function cerrar() {
    revocar.reset();
    setAbierto(false);
    setMotivo('');
  }

  // mutateAsync y no el callback de mutate(): al terminar, el historial se
  // refresca y esta sanción pasa a «revocada», lo que desmonta este componente
  async function confirmar() {
    try {
      await revocar.mutateAsync({
        usuarioId,
        sancionId: sancion.id,
        payload: limpio ? { motivo_revocacion: limpio } : {},
      });
      mostrarToast('Sanción revocada');
    } catch {
      // el error se muestra abajo (revocar.error)
    }
  }

  if (!abierto) {
    return (
      <div className='mt-2 flex justify-end'>
        <Button
          size='sm'
          variant='danger'
          icon='ti-arrow-back-up'
          onClick={() => setAbierto(true)}
        >
          Revocar
        </Button>
      </div>
    );
  }

  return (
    <div className='mt-3 flex flex-col gap-2 border-t border-white/[0.06] pt-3'>
      <p className='text-[12px] font-semibold text-neutral-400'>
        Motivo de la revocación (opcional)
      </p>
      <textarea
        rows={3}
        maxLength={MOTIVO_SANCION_MAX}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder='Queda en el historial; el usuario no recibe aviso.'
        className={`${inputClasses} resize-none`}
      />
      <div className='flex items-center justify-between'>
        <span className='text-[11px] text-neutral-600'>
          Si lo escribes, mínimo {MOTIVO_SANCION_MIN} caracteres.
        </span>
        <CharCounter
          value={motivo}
          max={MOTIVO_SANCION_MAX}
        />
      </div>

      {revocar.isError && (
        <div className='rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          {mensajeDeError(revocar.error, 'No se pudo revocar la sanción.')}
        </div>
      )}

      <div className='flex justify-end gap-2'>
        <Button
          variant='ghost'
          disabled={revocar.isPending}
          onClick={cerrar}
        >
          Cancelar
        </Button>
        <Button
          variant='primary'
          loading={revocar.isPending}
          disabled={!motivoValido}
          onClick={confirmar}
        >
          Confirmar revocación
        </Button>
      </div>
    </div>
  );
}