import { Link, useNavigate, useLocation } from 'react-router-dom';
import PortadaImagen from '@/shared/post/images/PortadaImagen';
import QuitarGuardadoButton from '@/shared/post/bookmarks/QuitarGuardadoButton';
import BookmarkIcon from '@/shared/post/bookmarks/BookmarkIcon';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import BotonCompartir from '@/shared/post/share/BotonCompartir';
import { extractoPlano } from '@/shared/markdown/extractoPlano';
import { useRutaHashtag } from '@/shared/hooks/useRutaHashtag';
import FlairChip from '@/features/announcements/components/FlairChip';
import AnuncioMenu from '@/features/announcements/components/AnuncioMenu';
import EncabezadoOficial from '@/features/announcements/components/EncabezadoOficial';
import BotonEnterado from '@/features/announcements/components/BotonEnterado';
import BotonAdjuntos from '@/features/announcements/components/BotonAdjuntos';
import { compartirAnuncio } from '@/features/announcements/utils/compartir';

const PILDORA =
  'flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200';

export default function AnuncioCard({
  anuncio,
  enGuardados = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const rutaHashtag = useRutaHashtag();
  const guardarMut = useGuardar('anuncio');

  const extracto = extractoPlano(
    anuncio.contenido ?? '',
    anuncio.contenido_truncado,
  );

  function abrirDetalle() {
    navigate(`/anuncios-oficiales/${anuncio.id}`, {
      state: { backgroundLocation: location },
    });
  }

  return (
    <article
      data-publicacion
      onClick={abrirDetalle}
      className='relative mb-3 cursor-pointer overflow-hidden rounded-[16px] border border-white/[0.06] bg-[#1E1E24] transition-colors hover:border-amber-400/25'
    >
      {enGuardados ? (
        <QuitarGuardadoButton
          tipo='anuncio'
          id={anuncio.id}
          className='absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/[0.08]'
        />
      ) : (
        <AnuncioMenu
          anuncio={anuncio}
          className='absolute right-2 top-2 z-10'
          triggerClassName='flex h-7 w-7 items-center justify-center rounded-full text-base text-neutral-500 transition-colors hover:bg-white/[0.08] hover:text-neutral-200'
        />
      )}

      <div className='p-4'>

        <div className='mb-3 pr-8'>
          <EncabezadoOficial anuncio={anuncio} />
        </div>

        {anuncio.flair && (
          <div className='mb-1.5'>
            <FlairChip flair={anuncio.flair} />
          </div>
        )}

        <h3
          className='mb-1.5 break-words text-[15.5px] font-bold leading-snug text-neutral-50'
        >
          {anuncio.titulo}
        </h3>

        {extracto && (
          <p
            className='mb-3 line-clamp-3 break-words text-[12.5px] leading-relaxed text-neutral-400'
          >
            {extracto}
          </p>
        )}

        <PortadaImagen archivos={anuncio.archivos} />

        <div className='mb-3 empty:hidden'>
          <BotonAdjuntos archivos={anuncio.archivos} />
        </div>

        {anuncio.hashtags?.length > 0 && (
          <div className='mb-3 flex flex-wrap gap-1.5'>
            {anuncio.hashtags.map((tag) => (
              <Link
                key={tag}
                to={rutaHashtag(tag, 'anuncios')}
                onClick={(e) => e.stopPropagation()}
                className='text-[11px] text-blue-400 hover:underline'
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className='flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-3 text-[11.5px] text-neutral-500'>
          <BotonEnterado anuncio={anuncio} />

          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              abrirDetalle();
            }}
            className={PILDORA}
          >
            <i className='ti ti-message-circle-2 text-[13px]' />{' '}
            {anuncio.comentarios_count}
          </button>

          {!enGuardados && (
            <button
              type='button'
              aria-pressed={anuncio.esta_guardado}
              onClick={(e) => {
                e.stopPropagation();
                guardarMut.mutate({
                  id: anuncio.id,
                  guardar: !anuncio.esta_guardado,
                });
              }}
              className={PILDORA}
            >
              <BookmarkIcon
                filled={anuncio.esta_guardado}
                style={{ fontSize: 13 }}
              />
              {anuncio.esta_guardado ? 'Guardado' : 'Guardar'}
            </button>
          )}

          <BotonCompartir {...compartirAnuncio(anuncio)} />
        </div>
      </div>
    </article>
  );
}