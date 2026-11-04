import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useVotar } from '@/shared/post/votes/useVotar';
import VotePill from '@/shared/post/votes/VotePill';
import ShareButton from '@/shared/post/share/ShareButton';
import PortadaImagen from '@/shared/post/images/PortadaImagen';
import QuitarGuardadoButton from '@/shared/post/bookmarks/QuitarGuardadoButton';
import { extractoPlano } from '@/shared/markdown/extractoPlano';
import { rutaHashtag } from '@/shared/lib/hashtags';
import FlairChip from '@/features/announcements/components/FlairChip';
import AnuncioMenu from '@/features/announcements/components/AnuncioMenu';
import { INSIGNIA_ROL } from '@/features/announcements/utils/insigniaRol';

export default function AnuncioCard({ anuncio, enGuardados = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const votarMut = useVotar('anuncio');
  const carreraUsuario = useAuthStore((s) => s.usuario?.carrera_id ?? null);

  const extracto = extractoPlano(
    anuncio.contenido ?? '',
    anuncio.contenido_truncado,
  );
  const pdfs = (anuncio.archivos ?? []).filter(
    (a) => a.tipo_mime === 'application/pdf',
  ).length;
  const insignia = INSIGNIA_ROL[anuncio.autor?.rol];
  // En Guardados pueden mezclarse carreras: se indica la de cada anuncio
  const deOtraCarrera = anuncio.carrera?.id !== carreraUsuario;

  // El detalle (M3-6) se abre como modal sobre la lista, igual que en foro y materiales.
  function abrirDetalle() {
    navigate(`/anuncios-oficiales/${anuncio.id}`, {
      state: { backgroundLocation: location },
    });
  }

  function handleVotar(e, tipo) {
    e.stopPropagation();
    votarMut.mutate({ id: anuncio.id, tipo });
  }

  return (
    <div
      onClick={abrirDetalle}
      className='relative mb-2 flex cursor-pointer overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#1E1E24] transition-colors hover:border-white/[0.12]'
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

      <div className='min-w-0 flex-1 p-3'>
        <div className='mb-1.5 flex flex-wrap items-center gap-1.5 pr-8'>
          {anuncio.flair && <FlairChip flair={anuncio.flair} />}
          {deOtraCarrera && anuncio.carrera && (
            <span className='rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-neutral-400'>
              {anuncio.carrera.codigo}
            </span>
          )}
          <span className='text-[11.5px] text-neutral-600'>
            por{' '}
            <Link
              to={`/perfil/usuario/${anuncio.autor?.nombre_usuario}`}
              onClick={(e) => e.stopPropagation()}
              className='font-bold text-neutral-400 transition hover:text-neutral-100 hover:underline'
            >
              u/{anuncio.autor?.nombre_usuario}
            </Link>
          </span>
          {insignia && (
            <span className='rounded-full bg-amber-400/10 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-400'>
              {insignia}
            </span>
          )}
          <span className='text-[11px] text-neutral-600'>
            · {formatearTiempoRelativo(anuncio.creado_en)}
          </span>
          {anuncio.editado_en && (
            <span className='text-[11px] text-neutral-700'>
              · editado {formatearTiempoRelativo(anuncio.editado_en)}
            </span>
          )}
        </div>

        <div className='mb-1 text-sm font-semibold leading-snug text-neutral-100 hover:text-blue-400'>
          {anuncio.titulo}
        </div>

        {extracto && (
          <p className='mb-1.5 line-clamp-3 break-words text-xs leading-relaxed text-neutral-400'>
            {extracto}
          </p>
        )}

        <PortadaImagen archivos={anuncio.archivos} />

        {pdfs > 0 && (
          <div className='mb-1.5'>
            <span className='inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-neutral-400'>
              <i className='ti ti-file-type-pdf text-[13px]' />
              {pdfs} {pdfs === 1 ? 'PDF adjunto' : 'PDF adjuntos'}
            </span>
          </div>
        )}

        {anuncio.hashtags?.length > 0 && (
          <div className='mb-1.5 flex flex-wrap gap-1.5'>
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

        <div className='flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-2 text-[11.5px] text-neutral-500'>
          <VotePill
            miVoto={anuncio.mi_voto}
            votosNeto={anuncio.votos_neto}
            onVotar={handleVotar}
          />

          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              abrirDetalle();
            }}
            className='flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200'
          >
            <i className='ti ti-message-circle-2 text-[13px]' />{' '}
            {anuncio.comentarios_count}
          </button>

          <ShareButton
            path={`/anuncios-oficiales/${anuncio.id}`}
            titulo={anuncio.titulo}
          />
        </div>
      </div>
    </div>
  );
}
