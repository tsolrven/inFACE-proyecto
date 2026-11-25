import { Link } from 'react-router-dom';
import {
  listarProyectosRecomendados,
  listarProyectos,
} from '@/features/project-match';
import {
  getInitials,
  avatarColor,
  ModalidadChip,
  EstadoChip,
} from '@/shared/lib/matchHelpers';
import {
  SeccionError,
  SeccionHeader,
  SeccionVacia,
  SkeletonCard,
} from '@/features/home/components/SeccionInicio';
import { useVistaPrevia } from '@/features/home/hooks/useVistaPrevia';

async function cargarProyectos() {
  const recomendados = await listarProyectosRecomendados({ limite: 3 });
  if (recomendados.datos.length > 0) return recomendados.datos.slice(0, 3);
  const { datos } = await listarProyectos({ estado: 'abierto', limite: 3 });
  return datos.slice(0, 3);
}

export default function PreviewMatchProyectos({ embebida = false }) {
  const {
    items: proyectos,
    cargando,
    error,
  } = useVistaPrevia(['proyectos'], cargarProyectos);

  return (
    <section>
      {!embebida && (
        <SeccionHeader
          icon='ti-puzzle'
          iconColor='text-pink-400'
          iconBg='bg-pink-500/10 border-pink-500/25'
          title='Match de proyectos'
          subtitle='Equipos y proyectos afines a tus intereses'
          to='/match-proyectos'
        />
      )}

      {cargando ? (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <SeccionError />
      ) : proyectos.length === 0 ? (
        <SeccionVacia
          icon='ti-puzzle-off'
          mensaje='Todavía no hay proyectos abiertos para mostrar.'
        />
      ) : (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          {proyectos.map((p) => (
            <MiniProyectoCard
              key={p.id}
              proyecto={p}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MiniProyectoCard({ proyecto: p }) {
  const av = avatarColor(p.creador?.id);
  const pct = p.porcentaje_match;
  const cupos = p.maximo_integrantes
    ? p.maximo_integrantes - p.total_integrantes
    : null;

  return (
    <Link
      to={`/match-proyectos?proyecto=${p.id}`}
      className='group flex flex-col gap-2.5 rounded-2xl border border-white/[0.06] bg-[#1E1E24] p-4 transition hover:-translate-y-0.5 hover:border-pink-500/30'
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='flex flex-wrap gap-1.5'>
          <ModalidadChip modalidad={p.modalidad} />
          <EstadoChip estado={p.estado} />
        </div>
        {typeof pct === 'number' && (
          <span className='flex-shrink-0 rounded-full bg-pink-500/10 px-2 py-0.5 text-[11px] font-bold text-pink-400'>
            {pct}%
          </span>
        )}
      </div>

      <h3 className='line-clamp-2 text-[13.5px] font-bold leading-snug text-neutral-100 group-hover:text-pink-300'>
        {p.titulo}
      </h3>

      <p className='line-clamp-2 flex-1 text-[12px] leading-relaxed text-neutral-500'>
        {p.descripcion}
      </p>

      <div className='flex items-center justify-between border-t border-white/[0.06] pt-2.5'>
        <div className='flex min-w-0 items-center gap-1.5'>
          <div
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${av.bg} ${av.text}`}
          >
            {getInitials(p.creador?.nombre_usuario)}
          </div>
          <span className='truncate text-[11px] text-neutral-500'>
            u/{p.creador?.nombre_usuario}
          </span>
        </div>
        {p.maximo_integrantes != null && (
          <span className='flex-shrink-0 text-[11px] text-neutral-600'>
            {cupos > 0 ? cupos : 0}/{p.maximo_integrantes} cupos
          </span>
        )}
      </div>
    </Link>
  );
}