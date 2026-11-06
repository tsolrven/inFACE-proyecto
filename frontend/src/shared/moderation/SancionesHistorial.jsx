import {
  ESTADO_SANCION_BADGE,
  ESTADO_SANCION_LABEL,
  ETIQUETA_SANCION,
  ICONO_SANCION,
  TIPO_SANCION_BADGE,
  descripcionTermino,
  formatearFechaSancion,
} from '@/shared/moderation/sancionUi';

// `acciones` (opcional): función (sancion) => nodo que se dibuja al final de
// cada sanción, p. ej. el botón «Revocar» de Administración.
export default function SancionesHistorial({ sanciones, acciones }) {
  if (sanciones.length === 0) {
    return (
      <p className='text-[12.5px] text-neutral-500'>
        Este usuario no tiene sanciones.
      </p>
    );
  }

  return (
    <ul className='flex flex-col gap-2'>
      {sanciones.map((s) => {
        const termino = descripcionTermino(s);
        return (
          <li
            key={s.id}
            className='rounded-lg border border-white/[0.06] bg-white/[0.02] p-3'
          >
            <div className='mb-1.5 flex flex-wrap items-center gap-2'>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TIPO_SANCION_BADGE[s.tipo]}`}
              >
                <i className={`ti ${ICONO_SANCION[s.tipo]}`} />
                {ETIQUETA_SANCION[s.tipo]}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ESTADO_SANCION_BADGE[s.estado]}`}
              >
                {ESTADO_SANCION_LABEL[s.estado]}
              </span>
              <span className='text-[11.5px] text-neutral-500'>
                {formatearFechaSancion(s.creado_en)}
              </span>
            </div>
            <p className='whitespace-pre-line text-[12.5px] leading-relaxed text-neutral-200'>
              {s.motivo}
            </p>
            {termino && (
              <p className='mt-1.5 text-[11.5px] text-neutral-500'>{termino}</p>
            )}
            {s.revocada_en && (
              <p className='mt-1.5 text-[11.5px] text-neutral-500'>
                Revocada el {formatearFechaSancion(s.revocada_en)}
                {s.motivo_revocacion ? ` · ${s.motivo_revocacion}` : ''}
              </p>
            )}
            {acciones?.(s)}
          </li>
        );
      })}
    </ul>
  );
}