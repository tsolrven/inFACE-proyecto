import { Link, useLocation } from 'react-router-dom';
import { listarApuntes } from '@/features/materials';
import { colorPorRamo } from '@/shared/lib/courseColors';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import {
  ChipCarreras,
  SeccionError,
  SeccionHeader,
  SeccionVacia,
  SkeletonCard,
} from '@/features/home/components/SeccionInicio';
import { useVistaPrevia } from '@/features/home/hooks/useVistaPrevia';

// alcance: 'carrera' (la del usuario) o 'facultad' (docente: las 5 carreras)
export default function PreviewMateriales({
  alcance = 'carrera',
  embebida = false,
}) {
  const facultad = alcance === 'facultad';
  const {
    items: apuntes,
    cargando,
    error,
  } = useVistaPrevia(['apuntes', alcance], async () => {
    const { apuntes } = await listarApuntes({
      limite: 3,
      orden: 'recientes',
      alcance,
    });
    return apuntes;
  });

  return (
    <section>
      {!embebida && (
        <SeccionHeader
          icon='ti-books'
          iconColor='text-blue-400'
          iconBg='bg-blue-400/10 border-blue-400/25'
          title={
            facultad
              ? 'Materiales recientes en la facultad'
              : 'Materiales recientes'
          }
          subtitle={
            facultad
              ? 'Lo último que se compartió en las cinco carreras'
              : 'Lo último que compartió tu carrera'
          }
          to={facultad ? undefined : '/repositorio-materiales'}
        />
      )}

      {cargando ? (
        <div className='flex flex-col gap-2.5'>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <SeccionError />
      ) : apuntes.length === 0 ? (
        <SeccionVacia
          icon='ti-mood-empty'
          mensaje='Aún no hay materiales publicados.'
        />
      ) : (
        <div className='flex flex-col gap-2.5'>
          {apuntes.map((a) => (
            <MiniApunteCard
              key={a.id}
              apunte={a}
              conCarrera={facultad}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MiniApunteCard({ apunte: a, conCarrera }) {
  const location = useLocation();
  const ramoColor = colorPorRamo(a.ramo?.id);

  return (
    <Link
      to={`/repositorio-materiales/${a.id}`}
      state={{ backgroundLocation: location }}
      className='flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#1E1E24] px-4 py-3 transition hover:border-white/[0.14]'
    >
      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex flex-wrap items-center gap-1.5'>
          {conCarrera && <ChipCarreras carreras={a.ramo?.carreras} />}
          <span
            className='rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide'
            style={{ background: `${ramoColor}22`, color: ramoColor }}
          >
            {a.ramo?.nombre}
          </span>
          <span className='text-[11px] text-neutral-600'>
            u/{a.autor?.nombre_usuario} · {formatearTiempoRelativo(a.creado_en)}
          </span>
        </div>
        <h3 className='truncate text-[13px] font-semibold text-neutral-100'>
          {a.titulo}
        </h3>
      </div>

      <div className='flex flex-shrink-0 items-center gap-3 text-[11.5px] text-neutral-500'>
        <span className='flex items-center gap-1'>
          <i className='ti ti-arrow-big-up text-[13px]' /> {a.votos_neto ?? 0}
        </span>
        <span className='flex items-center gap-1'>
          <i className='ti ti-message-circle-2 text-[13px]' />{' '}
          {a.comentarios_count ?? 0}
        </span>
      </div>
    </Link>
  );
}