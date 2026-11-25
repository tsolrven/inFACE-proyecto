import { Link, useLocation } from 'react-router-dom';
import { listarHilos } from '@/features/forum/api/forum.api';
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
export default function PreviewDudas({ alcance = 'carrera' }) {
  const facultad = alcance === 'facultad';
  const {
    items: hilos,
    cargando,
    error,
  } = useVistaPrevia(['dudas', alcance], async () => {
    const { hilos } = await listarHilos({
      estado: 'sin_resolver',
      orden: 'recientes',
      limite: 4,
      alcance,
    });
    return hilos;
  });

  return (
    <section>
      <SeccionHeader
        icon='ti-message-question'
        iconColor='text-emerald-400'
        iconBg='bg-emerald-400/10 border-emerald-400/25'
        title={
          facultad ? 'Dudas sin resolver en la facultad' : 'Dudas sin resolver'
        }
        subtitle={
          facultad
            ? 'Preguntas de estudiantes que esperan respuesta'
            : 'Ayuda a tus compañeros de carrera'
        }
        to={facultad ? undefined : '/foro-por-ramos'}
      />

      {cargando ? (
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <SeccionError />
      ) : hilos.length === 0 ? (
        <SeccionVacia
          icon='ti-circle-check'
          mensaje='¡Todo al día! No hay dudas sin resolver.'
        />
      ) : (
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
          {hilos.map((h) => (
            <MiniHiloCard
              key={h.id}
              hilo={h}
              conCarrera={facultad}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MiniHiloCard({ hilo: h, conCarrera }) {
  const location = useLocation();
  const ramoColor = colorPorRamo(h.ramo?.id);
  const sinRespuestas = (h.comentarios_count ?? 0) === 0;

  return (
    <Link
      to={`/foro-por-ramos/${h.id}`}
      state={{ backgroundLocation: location }}
      className='flex flex-col gap-1.5 rounded-2xl border border-white/[0.06] bg-[#1E1E24] px-4 py-3 transition hover:border-emerald-400/30'
    >
      <div className='flex flex-wrap items-center gap-1.5'>
        {conCarrera && <ChipCarreras carreras={h.ramo?.carreras} />}
        <span
          className='truncate rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide'
          style={{ background: `${ramoColor}22`, color: ramoColor }}
        >
          {h.ramo?.nombre}
        </span>
      </div>
      <h3 className='line-clamp-2 text-[13px] font-semibold leading-snug text-neutral-100'>
        {h.titulo}
      </h3>
      <div className='mt-auto flex items-center justify-between gap-2 text-[11px] text-neutral-600'>
        <span className='truncate'>
          u/{h.autor?.nombre_usuario} · {formatearTiempoRelativo(h.creado_en)}
        </span>
        <span
          className={`flex flex-shrink-0 items-center gap-1 ${sinRespuestas ? 'font-semibold text-emerald-400' : ''}`}
        >
          <i className='ti ti-message-circle-2 text-[13px]' />
          {sinRespuestas ? 'Sin respuestas' : h.comentarios_count}
        </span>
      </div>
    </Link>
  );
}