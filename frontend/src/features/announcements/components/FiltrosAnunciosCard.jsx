import { useState } from 'react';
import { useAnunciosFiltrosStore } from '@/features/announcements/store/anunciosFiltrosStore';
import { useFlairs } from '@/features/announcements/hooks/useFlairs';
import { clasesFlair } from '@/features/announcements/utils/flairColors';

// `valor` debe existir en el enum `cargo` de listarAnunciosQuerySchema
// (backend). Íconos: los del sello del anuncio (EncabezadoOficial).
const AUTORES = [
  { valor: null, label: 'Todos' },
  { valor: 'cee', label: 'CEE', icono: 'ti-building-community' },
  { valor: 'tutor', label: 'Tutores', icono: 'ti-school' },
];

// el color del borde va en cada variante (no en la base) para que no choquen
const PILDORA =
  'flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors';
const NEUTRA_ACTIVA = 'border-transparent bg-white/[0.12] text-neutral-100';
const NEUTRA =
  'border-transparent bg-white/[0.04] text-neutral-500 hover:text-neutral-200';
const AMBAR_ACTIVA = 'border-amber-400/30 bg-amber-400/10 text-amber-400';

function Grupo({ titulo, children }) {
  return (
    <div>
      <p className='mb-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-neutral-500'>
        {titulo}
      </p>
      <div className='flex flex-wrap gap-1.5'>{children}</div>
    </div>
  );
}

// Filtros del feed de anuncios en el panel derecho (Anuncios oficiales y la
// pestaña Anuncios de cada comunidad). Usa el mismo store que las tarjetas y
// las píldoras de la barra: lo que se elige aquí se refleja allá y al revés.
// Estilo de RpCard, con el título como botón para plegar.
export default function FiltrosAnunciosCard({ carreraId }) {
  const [abierto, setAbierto] = useState(true);
  const flairId = useAnunciosFiltrosStore((s) => s.filtros.flair_id);
  const cargo = useAnunciosFiltrosStore((s) => s.filtros.cargo);
  const setFiltro = useAnunciosFiltrosStore((s) => s.setFiltro);
  const { data: flairs = [] } = useFlairs(carreraId);

  const activos = (cargo ? 1 : 0) + (flairId ? 1 : 0);

  function limpiar() {
    setFiltro('cargo', null);
    setFiltro('flair_id', null);
  }

  return (
    <div className='rounded-[14px] border border-white/[0.06] bg-[#1E1E24] p-3'>
      <button
        type='button'
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className='flex w-full items-center gap-1.5 text-left'
      >
        <i className='ti ti-filter text-sm text-amber-400' />
        <span className='text-[11.5px] font-bold uppercase tracking-[0.6px] text-neutral-400'>
          Filtros
        </span>
        {/* plegada, igual se nota que hay filtros puestos */}
        {activos > 0 && (
          <span className='rounded-full bg-amber-400/15 px-1.5 text-[10px] font-bold text-amber-400'>
            {activos}
          </span>
        )}
        <i
          className={`ti ti-chevron-down ml-auto text-xs text-neutral-500 transition-transform ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        <div className='mt-2.5 flex flex-col gap-3'>
          <Grupo titulo='Autor'>
            {AUTORES.map((a) => {
              const activo = cargo === a.valor;
              return (
                <button
                  key={a.valor ?? 'todos'}
                  type='button'
                  aria-pressed={activo}
                  // otro clic sobre CEE o Tutores activo lo quita
                  onClick={() =>
                    setFiltro('cargo', activo && a.valor ? null : a.valor)
                  }
                  className={`${PILDORA} ${activo ? (a.valor ? AMBAR_ACTIVA : NEUTRA_ACTIVA) : NEUTRA
                    }`}
                >
                  {a.icono && <i className={`ti ${a.icono} text-[13px]`} />}
                  {a.label}
                </button>
              );
            })}
          </Grupo>

          {flairs.length > 0 && (
            <Grupo titulo='Flair'>
              <button
                type='button'
                aria-pressed={!flairId}
                onClick={() => setFiltro('flair_id', null)}
                className={`${PILDORA} ${!flairId ? NEUTRA_ACTIVA : NEUTRA}`}
              >
                Todos
              </button>
              {flairs.map((f) => (
                <button
                  key={f.id}
                  type='button'
                  aria-pressed={flairId === f.id}
                  onClick={() =>
                    setFiltro('flair_id', flairId === f.id ? null : f.id)
                  }
                  className={`${PILDORA} border-transparent ${clasesFlair(f.color)} ${flairId && flairId !== f.id
                      ? 'opacity-40 hover:opacity-80'
                      : 'ring-1 ring-current/40'
                    }`}
                >
                  {f.nombre}
                </button>
              ))}
            </Grupo>
          )}

          {activos > 0 && (
            <button
              type='button'
              onClick={limpiar}
              className='flex items-center gap-1 self-start text-[11.5px] font-medium text-neutral-500 transition-colors hover:text-neutral-200'
            >
              <i className='ti ti-x text-[12px]' />
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}