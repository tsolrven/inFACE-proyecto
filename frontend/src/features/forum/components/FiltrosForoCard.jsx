import { useForumFiltrosStore } from '@/features/forum/store/forumFiltrosStore';
import FiltroRamo from '@/shared/components/FiltroRamo';
import RpFiltrosPlegable, {
  GrupoFiltro,
} from '@/shared/components/layout/RpFiltrosPlegable';
import {
  PILDORA,
  PILDORA_NEUTRA,
  PILDORA_NEUTRA_ACTIVA,
} from '@/shared/components/layout/pildorasFiltro';

// `valor` debe existir en el enum `estado` de listarHilosQuerySchema
// (backend). Colores: verde como el chip "Resuelto", ámbar para sin resolver.
const ESTADOS = [
  { valor: null, label: 'Todos' },
  {
    valor: 'resueltos',
    label: 'Resueltos',
    icono: 'ti-circle-check',
    activa: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400',
  },
  {
    valor: 'sin_resolver',
    label: 'Sin resolver',
    icono: 'ti-help-circle',
    activa: 'border-amber-400/30 bg-amber-400/10 text-amber-400',
  },
];

// Filtros del foro en el panel derecho (Foro por ramos y la pestaña Foro de
// cada comunidad). Mismo store que las tarjetas y la barra del feed.
export default function FiltrosForoCard({ carreraId }) {
  const ramoId = useForumFiltrosStore((s) => s.filtros.ramo_id);
  const estado = useForumFiltrosStore((s) => s.filtros.estado);
  const setFiltro = useForumFiltrosStore((s) => s.setFiltro);

  const activos = (ramoId ? 1 : 0) + (estado ? 1 : 0);

  function limpiar() {
    setFiltro('ramo_id', null);
    setFiltro('estado', null);
  }

  return (
    <RpFiltrosPlegable
      color='emerald'
      activos={activos}
      onLimpiar={limpiar}
    >
      <GrupoFiltro
        titulo='Ramo'
        fila={false}
      >
        <FiltroRamo
          carreraId={carreraId}
          ramoId={ramoId}
          onCambiar={(id) => setFiltro('ramo_id', id)}
          colorActivo='text-emerald-400'
        />
      </GrupoFiltro>

      <GrupoFiltro titulo='Estado'>
        {ESTADOS.map((e) => {
          const activo = estado === e.valor;
          return (
            <button
              key={e.valor ?? 'todos'}
              type='button'
              aria-pressed={activo}
              // otro clic sobre un estado activo lo quita
              onClick={() =>
                setFiltro('estado', activo && e.valor ? null : e.valor)
              }
              className={`${PILDORA} ${activo ? (e.activa ?? PILDORA_NEUTRA_ACTIVA) : PILDORA_NEUTRA
                }`}
            >
              {e.icono && <i className={`ti ${e.icono} text-[13px]`} />}
              {e.label}
            </button>
          );
        })}
      </GrupoFiltro>
    </RpFiltrosPlegable>
  );
}