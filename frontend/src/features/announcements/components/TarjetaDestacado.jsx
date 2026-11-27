import { useLocation, useNavigate } from 'react-router-dom';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useImagenAutenticada } from '@/shared/post/images/useImagenAutenticada';
import FlairChip from '@/features/announcements/components/FlairChip';
import { INSIGNIA_ROL } from '@/features/announcements/utils/insigniaRol';

const ICONO_CARGO = { cee: 'ti-users-group', tutor: 'ti-school' };

// Tarjeta cuadrada del carrusel de destacados. Con imagen, la primera cubre
// toda la tarjeta (con degradado para leer el texto); sin imagen, fondo normal.
export default function TarjetaDestacado({ anuncio }) {
  const navigate = useNavigate();
  const location = useLocation();
  const imagen = (anuncio.archivos ?? []).find((a) =>
    a.tipo_mime?.startsWith('image/'),
  );
  const { data: urlImagen } = useImagenAutenticada(imagen?.id, {
    enabled: !!imagen,
  });

  return (
    <button
      type='button'
      onClick={() =>
        navigate(`/anuncios-oficiales/${anuncio.id}`, {
          state: { backgroundLocation: location },
        })
      }
      className='group relative flex h-[170px] w-[210px] flex-shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#1E1E24] bg-cover bg-center p-3 text-left transition-colors hover:border-amber-400/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400'
      style={urlImagen ? { backgroundImage: `url(${urlImagen})` } : undefined}
    >
      {urlImagen && (
        <span
          aria-hidden='true'
          className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10'
        />
      )}

      {anuncio.flair && (
        <span className='relative mb-auto'>
          <FlairChip flair={anuncio.flair} />
        </span>
      )}

      <span className='relative line-clamp-3 break-words text-[13.5px] font-semibold leading-snug text-neutral-50 group-hover:text-amber-200'>
        {anuncio.titulo}
      </span>

      <span className='relative mt-1.5 flex items-center gap-1 text-[10.5px] text-neutral-400'>
        <i
          className={`ti ${ICONO_CARGO[anuncio.autor?.cargo] ?? 'ti-speakerphone'} text-[12px] text-amber-400`}
        />
        {INSIGNIA_ROL[anuncio.autor?.cargo] ?? 'Anuncio'} ·{' '}
        {formatearTiempoRelativo(anuncio.creado_en)}
      </span>
    </button>
  );
}