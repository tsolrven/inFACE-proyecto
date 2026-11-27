import { useAnunciosFiltrosStore } from '@/features/announcements/store/anunciosFiltrosStore';
import { useFlairs } from '@/features/announcements/hooks/useFlairs';
import { clasesFlair } from '@/features/announcements/utils/flairColors';
import RpFiltrosPlegable, {
  GrupoFiltro,
} from '@/shared/components/layout/RpFiltrosPlegable';
import {
  PILDORA,
  PILDORA_NEUTRA,
  PILDORA_NEUTRA_ACTIVA,
} from '@/shared/components/layout/pildorasFiltro';

// `valor` debe existir en el enum `cargo` de listarAnunciosQuerySchema
// (backend). Íconos: los del sello del anuncio (EncabezadoOficial).
const AUTORES = [
  { valor: null, label: 'Todos' },
  { valor: 'cee', label: 'CEE', icono: 'ti-users-group' },
  { valor: 'tutor', label: 'Tutores', icono: 'ti-school' },
];

const AMBAR_ACTIVA = 'border-amber-400/30 bg-amber-400/10 text-amber-400';

// Filtros del feed de anuncios en el panel derecho (Anuncios oficiales y la
// pestaña Anuncios de cada comunidad). Usa el mismo store que las tarjetas y
// las píldoras de la barra: lo que se elige aquí se refleja allá y al revés.
export default function FiltrosAnunciosCard({ carreraId }) {
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
    <RpFiltrosPlegable
      color='amber'
      activos={activos}
      onLimpiar={limpiar}
    >
      <GrupoFiltro titulo='Autor'>
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
              className={`${PILDORA} ${activo
                  ? a.valor
                    ? AMBAR_ACTIVA
                    : PILDORA_NEUTRA_ACTIVA
                  : PILDORA_NEUTRA
                }`}
            >
              {a.icono && <i className={`ti ${a.icono} text-[13px]`} />}
              {a.label}
            </button>
          );
        })}
      </GrupoFiltro>

      {flairs.length > 0 && (
        <GrupoFiltro titulo='Flair'>
          <button
            type='button'
            aria-pressed={!flairId}
            onClick={() => setFiltro('flair_id', null)}
            className={`${PILDORA} ${!flairId ? PILDORA_NEUTRA_ACTIVA : PILDORA_NEUTRA}`}
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
        </GrupoFiltro>
      )}
    </RpFiltrosPlegable>
  );
}