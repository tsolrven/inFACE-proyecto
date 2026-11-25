import { Link, useLocation } from 'react-router-dom';
import { listarAnuncios } from '@/features/announcements/api/announcements.api';
import FlairChip from '@/features/announcements/components/FlairChip';
import { INSIGNIA_ROL } from '@/features/announcements/utils/insigniaRol';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import {
  SeccionError,
  SeccionHeader,
  SeccionVacia,
  SkeletonCard,
} from '@/features/home/components/SeccionInicio';
import { useVistaPrevia } from '@/features/home/hooks/useVistaPrevia';

// sin carrera_id el backend usa la carrera del usuario
async function cargarAnuncios() {
  const { anuncios } = await listarAnuncios({ limite: 3, orden: 'recientes' });
  return anuncios;
}

export default function PreviewAnuncios({ embebida = false }) {
  const {
    items: anuncios,
    cargando,
    error,
  } = useVistaPrevia(['anuncios'], cargarAnuncios);

  return (
    <section>
      {!embebida && (
        <SeccionHeader
          icon='ti-speakerphone'
          iconColor='text-rose-400'
          iconBg='bg-rose-400/10 border-rose-400/25'
          title='Anuncios de tu carrera'
          subtitle='Lo último del CEE y los tutores'
          to='/anuncios-oficiales'
        />
      )}

      {cargando ? (
        <div className='flex flex-col gap-2.5'>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <SeccionError />
      ) : anuncios.length === 0 ? (
        <SeccionVacia
          icon='ti-speakerphone'
          mensaje='Tu carrera aún no tiene anuncios.'
        />
      ) : (
        <div className='flex flex-col gap-2.5'>
          {anuncios.map((a) => (
            <MiniAnuncioCard
              key={a.id}
              anuncio={a}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function MiniAnuncioCard({ anuncio: a }) {
  const location = useLocation();
  const insignia = INSIGNIA_ROL[a.autor?.cargo];

  return (
    <Link
      to={`/anuncios-oficiales/${a.id}`}
      state={{ backgroundLocation: location }}
      className='block rounded-2xl border border-white/[0.06] bg-[#1E1E24] px-4 py-3 transition hover:border-rose-400/30'
    >
      <div className='mb-1 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-600'>
        {a.flair && <FlairChip flair={a.flair} />}
        {insignia && (
          <span className='rounded border border-rose-400/30 bg-rose-400/10 px-1.5 py-px text-[9.5px] font-bold text-rose-300'>
            {insignia}
          </span>
        )}
        <span>
          u/{a.autor?.nombre_usuario} · {formatearTiempoRelativo(a.creado_en)}
        </span>
      </div>
      <h3 className='truncate text-[13.5px] font-semibold text-neutral-100'>
        {a.titulo}
      </h3>
    </Link>
  );
}