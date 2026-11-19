import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import { inputClasses } from '@/shared/components/form/inputClasses';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import { useAuthStore } from '@/shared/auth/authStore';
import { useRevocarCargo } from '@/features/admin/hooks/useUsuarios';
import {
  ETIQUETA_TIPO,
  MOTIVO_MAX,
  MOTIVO_MIN,
  formatearFechaCargo,
} from '@/features/cargos';

// estado lo calcula el backend (estadoDeCargo en admin/usuarios.service.js)
const ESTADO_CARGO = {
  vigente: { label: 'Vigente', clase: 'bg-emerald-400/10 text-emerald-400' },
  futuro: { label: 'Por comenzar', clase: 'bg-blue-400/10 text-blue-400' },
  vencido: { label: 'Vencido', clase: 'bg-neutral-500/10 text-neutral-500' },
  revocado: { label: 'Revocado', clase: 'bg-red-500/10 text-red-400' },
};

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CL', { dateStyle: 'medium' });
}

// Mismo patrón que RevocarSancion, pero el motivo es OBLIGATORIO (el backend
// lo exige: queda en el historial; el afectado recibe aviso sin el motivo).
function RevocarCargo({ usuarioId, cargo }) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState('');
  const revocar = useRevocarCargo();

  const limpio = motivo.trim();
  const motivoValido =
    limpio.length >= MOTIVO_MIN && limpio.length <= MOTIVO_MAX;

  function cerrar() {
    revocar.reset();
    setAbierto(false);
    setMotivo('');
  }

  // mutateAsync: al terminar, la ficha se refresca y el cargo pasa a
  // «revocado», lo que desmonta este componente
  async function confirmar() {
    try {
      await revocar.mutateAsync({ usuarioId, cargoId: cargo.id, motivo: limpio });
      mostrarToast('Cargo revocado');
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
        Motivo de la revocación
      </p>
      <textarea
        rows={3}
        maxLength={MOTIVO_MAX}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        placeholder='Queda en el historial. El usuario recibe un aviso, pero sin el motivo.'
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

      {revocar.isError && (
        <div className='rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          {mensajeDeError(revocar.error, 'No se pudo revocar el cargo.')}
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

// Cargos de CEE y tutor del usuario (el más reciente primero, como los
// entrega el backend). No se ofrece revocar los propios: el backend lo rechaza.
export default function CargosUsuario({ usuarioId, cargos }) {
  const yoId = useAuthStore((s) => s.usuario?.id);

  return (
    <section className='mb-6'>
      <h2 className='mb-2.5 text-[13px] font-semibold text-neutral-300'>
        Cargos
      </h2>

      {cargos.length === 0 ? (
        <p className='text-[12px] text-neutral-500'>
          Sin cargos de CEE ni tutor.
        </p>
      ) : (
        <div className='flex flex-col gap-2'>
          {cargos.map((c) => {
            const estado = ESTADO_CARGO[c.estado] ?? ESTADO_CARGO.vencido;
            return (
              <div
                key={c.id}
                className='rounded-xl border border-white/[0.06] bg-[#111114] p-3.5'
              >
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <p className='text-[13px] font-semibold text-neutral-100'>
                    {ETIQUETA_TIPO[c.tipo] ?? c.tipo} · {c.carrera.nombre}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${estado.clase}`}
                  >
                    {estado.label}
                  </span>
                </div>
                <p className='mt-1 text-[12px] text-neutral-500'>
                  {formatearFechaCargo(c.desde)} –{' '}
                  {formatearFechaCargo(c.hasta)}
                </p>

                {c.estado === 'revocado' && (
                  <p className='mt-1.5 text-[12px] leading-relaxed text-neutral-400'>
                    Revocado el {formatearFecha(c.revocada_en)}
                    {c.revocada_por?.nombre_usuario &&
                      ` por @${c.revocada_por.nombre_usuario}`}
                    {c.motivo_revocacion && `: «${c.motivo_revocacion}»`}
                  </p>
                )}

                {c.revocable && usuarioId !== yoId && (
                  <RevocarCargo
                    usuarioId={usuarioId}
                    cargo={c}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}