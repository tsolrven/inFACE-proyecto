import { useFiltrosStore } from '@/features/materials/store/filtrosStore';
import { TIPOS_ARCHIVO_FILTRO } from '@/features/materials/utils/fileMeta';
import FiltroRamo from '@/shared/components/FiltroRamo';
import RpFiltrosPlegable, {
  GrupoFiltro,
} from '@/shared/components/layout/RpFiltrosPlegable';
import {
  PILDORA,
  PILDORA_NEUTRA,
  PILDORA_NEUTRA_ACTIVA,
} from '@/shared/components/layout/pildorasFiltro';

// Filtros del repositorio en el panel derecho (Repositorio de materiales y la
// pestaña Materiales de cada comunidad). Mismo store que las tarjetas y la
// barra del feed. Cada tipo usa su color (el de los chips de la tarjeta).
export default function FiltrosMaterialesCard({ carreraId }) {
  const ramoId = useFiltrosStore((s) => s.filtros.ramo_id);
  const tipo = useFiltrosStore((s) => s.filtros.tipo_archivo);
  const setFiltro = useFiltrosStore((s) => s.setFiltro);

  const activos = (ramoId ? 1 : 0) + (tipo ? 1 : 0);

  function limpiar() {
    setFiltro('ramo_id', null);
    setFiltro('tipo_archivo', null);
  }

  return (
    <RpFiltrosPlegable
      color='blue'
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
          colorActivo='text-blue-400'
        />
      </GrupoFiltro>

      <GrupoFiltro titulo='Tipo'>
        {TIPOS_ARCHIVO_FILTRO.map((t) => {
          const activo = tipo === t.value;

          if (!t.value) {
            return (
              <button
                key='todos'
                type='button'
                aria-pressed={activo}
                onClick={() => setFiltro('tipo_archivo', null)}
                className={`${PILDORA} ${activo ? PILDORA_NEUTRA_ACTIVA : PILDORA_NEUTRA}`}
              >
                Todos
              </button>
            );
          }

          return (
            <button
              key={t.value}
              type='button'
              aria-pressed={activo}
              // otro clic sobre el tipo activo lo quita
              onClick={() => setFiltro('tipo_archivo', activo ? null : t.value)}
              className={`${PILDORA} ${activo ? 'border-transparent' : PILDORA_NEUTRA}`}
              style={activo ? { background: t.bg, color: t.color } : undefined}
            >
              <i
                className={`ti ${t.icon} text-[13px]`}
                style={activo ? undefined : { color: t.color }}
              />
              {t.label}
            </button>
          );
        })}
      </GrupoFiltro>
    </RpFiltrosPlegable>
  );
}