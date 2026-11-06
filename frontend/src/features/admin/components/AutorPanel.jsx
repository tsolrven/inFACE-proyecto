import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import SancionesHistorial from '@/shared/moderation/SancionesHistorial';
import { useSancionesDeUsuario } from '@/features/admin/hooks/useSanciones';
import { nombreDeUsuario } from '@/shared/moderation/reportUi';
import {
  ETIQUETA_SANCION,
  ICONO_SANCION,
  TIPO_SANCION_BADGE,
  descripcionTermino,
  resumirSanciones,
} from '@/shared/moderation/sancionUi';

function ChipVigente({ sancion }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TIPO_SANCION_BADGE[sancion.tipo]}`}
    >
      <i className={`ti ${ICONO_SANCION[sancion.tipo]}`} />
      {ETIQUETA_SANCION[sancion.tipo]} vigente · {descripcionTermino(sancion)}
    </span>
  );
}

export default function AutorPanel({ autor }) {
  const [verHistorial, setVerHistorial] = useState(false);
  const { data, isPending, isError, refetch } = useSancionesDeUsuario(
    autor?.id,
  );

  // contenido sin autor identificable: no hay a quién consultar
  if (!autor?.id) {
    return (
      <section className='rounded-xl border border-white/[0.06] bg-[#111114] p-3.5'>
        <p className='text-[12px] text-neutral-500'>Autor: Usuario</p>
      </section>
    );
  }

  const resumen = resumirSanciones(data);

  return (
    <section className='rounded-xl border border-white/[0.06] bg-[#111114] p-3.5'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-[11px] font-semibold uppercase tracking-wide text-neutral-500'>
            Autor
          </p>
          <p className='truncate text-[13px] font-semibold text-neutral-100'>
            {nombreDeUsuario(autor)}
          </p>
        </div>
        <Button
          size='sm'
          icon={verHistorial ? 'ti-chevron-up' : 'ti-history'}
          onClick={() => setVerHistorial((v) => !v)}
        >
          {verHistorial ? 'Ocultar historial' : 'Ver historial'}
        </Button>
      </div>

      <div className='mt-2.5 flex flex-wrap items-center gap-2'>
        {isPending && (
          <i className='ti ti-loader-2 animate-spin text-base text-neutral-600' />
        )}
        {isError && !data && (
          <span className='flex items-center gap-2 text-[12px] text-red-400'>
            No se pudo cargar el historial.
            <button
              type='button'
              onClick={() => refetch()}
              className='font-semibold underline-offset-2 hover:underline'
            >
              Reintentar
            </button>
          </span>
        )}
        {data && (
          <>
            {resumen.suspension && <ChipVigente sancion={resumen.suspension} />}
            {resumen.restriccion && (
              <ChipVigente sancion={resumen.restriccion} />
            )}
            <span className='text-[12px] text-neutral-500'>
              {resumen.total === 0
                ? 'Sin sanciones'
                : `${resumen.total} ${resumen.total === 1 ? 'sanción' : 'sanciones'} en total`}
            </span>
          </>
        )}
      </div>

      {verHistorial && data && (
        <div className='mt-3'>
          <SancionesHistorial sanciones={data} />
        </div>
      )}
    </section>
  );
}