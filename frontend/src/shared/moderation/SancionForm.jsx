import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import { inputClasses } from '@/shared/components/form/inputClasses';
import { ETIQUETA_TIPO } from '@/shared/moderation/reportUi';
import {
  DIAS_SANCION_MAX,
  DIAS_SANCION_MIN,
  ICONO_SANCION,
  MOTIVO_SANCION_MAX,
  MOTIVO_SANCION_MIN,
  TIPOS_SANCION,
} from '@/shared/moderation/sancionUi';

const OPCIONES = [
  {
    id: TIPOS_SANCION.ADVERTENCIA,
    titulo: 'Advertencia',
    detalle: 'Se registra y se avisa al usuario. No limita su cuenta.',
  },
  {
    id: TIPOS_SANCION.RESTRICCION,
    titulo: 'Restricción temporal',
    detalle:
      'No puede crear ni editar contenido; sí leer, votar, guardar y reportar.',
  },
  {
    id: TIPOS_SANCION.SUSPENSION,
    titulo: 'Suspensión',
    detalle: 'No puede iniciar sesión ni usar la plataforma.',
    peligro: true,
  },
];

// `referencia` = { tipo, id } del contenido reportado (opcional): permite
// asociar la sanción a ese contenido. No apunta al reporte.
export default function SancionForm({
  referencia = null,
  enviando = false,
  error = null,
  onSubmit,
  onCancel,
}) {
  const [tipo, setTipo] = useState(TIPOS_SANCION.ADVERTENCIA);
  const [dias, setDias] = useState('');
  const [permanente, setPermanente] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [asociar, setAsociar] = useState(true);

  const conDuracion = tipo !== TIPOS_SANCION.ADVERTENCIA;
  const puedePermanente = tipo === TIPOS_SANCION.SUSPENSION;
  const motivoLimpio = motivo.trim();
  const diasNumero = Number(dias);
  const duracionValida =
    !conDuracion ||
    (puedePermanente && permanente) ||
    (dias.trim() !== '' &&
      Number.isInteger(diasNumero) &&
      diasNumero >= DIAS_SANCION_MIN &&
      diasNumero <= DIAS_SANCION_MAX);
  const puedeEnviar =
    !enviando &&
    duracionValida &&
    motivoLimpio.length >= MOTIVO_SANCION_MIN &&
    motivoLimpio.length <= MOTIVO_SANCION_MAX;

  function elegirTipo(id) {
    setTipo(id);
    if (id !== TIPOS_SANCION.SUSPENSION) setPermanente(false);
  }

  function handleEnviar() {
    const payload = { tipo, motivo: motivoLimpio };
    if (conDuracion) {
      if (permanente) payload.permanente = true;
      else payload.dias = diasNumero;
    }
    if (referencia && asociar) {
      payload.contenido_tipo = referencia.tipo;
      payload.contenido_id = referencia.id;
    }
    onSubmit(payload);
  }

  return (
    <div className='flex flex-col gap-4 border-t border-white/[0.07] pt-4'>
      <div className='flex flex-col gap-2'>
        {OPCIONES.map((op) => {
          const activo = tipo === op.id;
          return (
            <button
              key={op.id}
              type='button'
              aria-pressed={activo}
              onClick={() => elegirTipo(op.id)}
              className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${activo
                  ? op.peligro
                    ? 'border-red-500/50 bg-red-500/[0.06]'
                    : 'border-pink-500/50 bg-pink-500/[0.06]'
                  : 'border-white/[0.07] hover:border-white/[0.18]'
                }`}
            >
              <i
                className={`ti ${ICONO_SANCION[op.id]} mt-0.5 text-[16px] ${op.peligro ? 'text-red-400' : 'text-neutral-400'
                  }`}
              />
              <span>
                <span className='block text-[13px] font-semibold text-neutral-100'>
                  {op.titulo}
                </span>
                <span className='block text-[12px] text-neutral-500'>
                  {op.detalle}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {conDuracion && (
        <div>
          <p className='mb-1.5 text-[12px] font-semibold text-neutral-400'>
            Duración
          </p>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='flex items-center gap-2'>
              <div className='w-24'>
                <input
                  type='number'
                  min={DIAS_SANCION_MIN}
                  max={DIAS_SANCION_MAX}
                  step={1}
                  value={dias}
                  disabled={permanente}
                  onChange={(e) => setDias(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <span className='text-[12.5px] text-neutral-500'>días</span>
            </div>
            {puedePermanente && (
              <label className='flex items-center gap-2 text-[12.5px] text-neutral-300'>
                <input
                  type='checkbox'
                  checked={permanente}
                  onChange={(e) => setPermanente(e.target.checked)}
                  className='h-4 w-4 accent-pink-500'
                />
                Permanente
              </label>
            )}
          </div>
          <p className='mt-1 text-[11px] text-neutral-600'>
            De {DIAS_SANCION_MIN} a {DIAS_SANCION_MAX} días.
          </p>
        </div>
      )}

      <div>
        <p className='mb-1.5 text-[12px] font-semibold text-neutral-400'>
          Motivo
        </p>
        <textarea
          rows={4}
          maxLength={MOTIVO_SANCION_MAX}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder='Escribe el motivo que verá el usuario…'
          className={`${inputClasses} resize-none`}
        />
        <div className='mt-1 flex items-start justify-between gap-3'>
          <span className='text-[11px] leading-snug text-neutral-600'>
            Este texto lo verá el usuario. No incluyas datos personales de
            terceros ni quién reportó. Mínimo {MOTIVO_SANCION_MIN} caracteres.
          </span>
          <CharCounter
            value={motivo}
            max={MOTIVO_SANCION_MAX}
          />
        </div>
      </div>

      {referencia && (
        <label className='flex items-center gap-2 text-[12.5px] text-neutral-300'>
          <input
            type='checkbox'
            checked={asociar}
            onChange={(e) => setAsociar(e.target.checked)}
            className='h-4 w-4 accent-pink-500'
          />
          Asociar al contenido reportado (
          {(ETIQUETA_TIPO[referencia.tipo] ?? 'contenido').toLowerCase()})
        </label>
      )}

      {error && (
        <div className='rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12.5px] text-red-400'>
          {error}
        </div>
      )}

      <div className='flex justify-end gap-2'>
        <Button
          variant='ghost'
          disabled={enviando}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          variant={tipo === TIPOS_SANCION.SUSPENSION ? 'danger' : 'primary'}
          disabled={!puedeEnviar}
          onClick={handleEnviar}
        >
          Aplicar sanción
        </Button>
      </div>
    </div>
  );
}