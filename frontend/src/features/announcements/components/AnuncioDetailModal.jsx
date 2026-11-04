import { useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import CommentsSection from '@/shared/post/comments/CommentsSection';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useAuthStore } from '@/shared/auth/authStore';
import { useVotar } from '@/shared/post/votes/useVotar';
import VotePill from '@/shared/post/votes/VotePill';
import ShareButton from '@/shared/post/share/ShareButton';
import GaleriaImagenes from '@/shared/post/images/GaleriaImagenes';
import MarkdownView from '@/shared/markdown/MarkdownView';
import { rutaHashtag } from '@/shared/lib/hashtags';
import { useAnuncio } from '@/features/announcements/hooks/useAnuncios';
import { INSIGNIA_ROL } from '@/features/announcements/utils/insigniaRol';
import FlairChip from '@/features/announcements/components/FlairChip';
import AdjuntosPdf from '@/features/announcements/components/AdjuntosPdf';
import AnuncioMenu from '@/features/announcements/components/AnuncioMenu';

export default function AnuncioDetailModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const carreraUsuario = useAuthStore((s) => s.usuario?.carrera_id ?? null);
  const comentariosRef = useRef(null);

  const { data: anuncio, isPending, isPlaceholderData, error } = useAnuncio(id);
  const votarMut = useVotar('anuncio');

  function handleClose() {
    if (location.state?.backgroundLocation) navigate(-1);
    else navigate('/anuncios-oficiales', { replace: true });
  }

  function handleVotar(e, tipo) {
    e?.stopPropagation?.();
    votarMut.mutate({ id, tipo });
  }

  const insignia = INSIGNIA_ROL[anuncio?.autor?.rol];
  const deOtraCarrera = !!anuncio && anuncio.carrera?.id !== carreraUsuario;

  return (
    <Modal
      open
      onClose={handleClose}
      maxWidth='740px'
    >
      {isPending && (
        <div className='flex items-center justify-center py-20'>
          <i className='ti ti-loader-2 animate-spin text-2xl text-neutral-600' />
        </div>
      )}

      {error && !isPending && (
        <div className='p-8 text-center text-sm text-red-400'>
          {error.message}
        </div>
      )}

      {anuncio && (
        <>
          <ModalHeader
            onClose={handleClose}
            rightContent={
              <AnuncioMenu
                anuncio={anuncio}
                triggerClassName='flex h-[30px] w-[30px] items-center justify-center rounded-lg text-base text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
                onEliminado={handleClose}
              />
            }
          >
            <button
              type='button'
              onClick={handleClose}
              title='Volver'
              className='flex h-[30px] w-[30px] items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
            >
              <i className='ti ti-arrow-left text-base' />
            </button>
            {anuncio.flair && <FlairChip flair={anuncio.flair} />}
            {deOtraCarrera && anuncio.carrera && (
              <span className='rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-neutral-400'>
                {anuncio.carrera.nombre}
              </span>
            )}
          </ModalHeader>

          <div className='px-6 pb-4 pt-5'>
            <h2 className='mb-3 break-words text-[18px] font-bold leading-snug text-neutral-100'>
              {anuncio.titulo}
            </h2>

            <div className='mb-4 flex flex-wrap items-center gap-2 text-[12.5px] text-neutral-600'>
              <Link
                to={`/perfil/usuario/${anuncio.autor?.nombre_usuario}`}
                className='flex items-center gap-2 transition hover:opacity-80'
              >
                <div className='flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-[9px] font-bold text-pink-500'>
                  {anuncio.autor?.nombre_usuario?.slice(0, 2).toUpperCase()}
                </div>
                <span>
                  por{' '}
                  <b className='text-neutral-400 hover:text-neutral-100 hover:underline'>
                    u/{anuncio.autor?.nombre_usuario}
                  </b>
                </span>
              </Link>
              {insignia && (
                <span className='rounded-full bg-amber-400/10 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-400'>
                  {insignia}
                </span>
              )}
              <span>·</span>
              <span>{formatearTiempoRelativo(anuncio.creado_en)}</span>
              {anuncio.editado_en && (
                <span className='text-neutral-700'>
                  · editado {formatearTiempoRelativo(anuncio.editado_en)}
                </span>
              )}
            </div>

            {isPlaceholderData && anuncio.contenido_truncado ? (
              <div className='mb-4 flex items-center gap-2 text-[12px] text-neutral-600'>
                <i className='ti ti-loader-2 animate-spin' /> Cargando
                contenido...
              </div>
            ) : (
              anuncio.contenido && (
                <div className='mb-4'>
                  <MarkdownView contenido={anuncio.contenido} />
                </div>
              )
            )}

            {anuncio.archivos?.length > 0 && (
              <div className='mb-4 flex flex-col gap-3'>
                <GaleriaImagenes archivos={anuncio.archivos} />
                <AdjuntosPdf archivos={anuncio.archivos} />
              </div>
            )}

            {anuncio.hashtags?.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-1.5'>
                {anuncio.hashtags.map((tag) => (
                  <Link
                    key={tag}
                    to={rutaHashtag(tag, 'anuncios')}
                    className='text-[11.5px] text-blue-400 hover:underline'
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className='flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 text-[11.5px] text-neutral-500'>
              <VotePill
                miVoto={anuncio.mi_voto}
                votosNeto={anuncio.votos_neto}
                onVotar={handleVotar}
              />

              <button
                type='button'
                onClick={() =>
                  comentariosRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
                className='flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200'
              >
                <i className='ti ti-message-circle-2 text-[13px]' />{' '}
                {anuncio.comentarios_count ?? 0}
              </button>

              <ShareButton
                path={`/anuncios-oficiales/${anuncio.id}`}
                titulo={anuncio.titulo}
              />
            </div>
          </div>

          <div
            ref={comentariosRef}
            className='border-t border-white/[0.06] bg-[rgba(23,23,27,0.4)] p-6'
          >
            <CommentsSection
              tipoContenido='anuncio'
              contenidoId={id}
              total={anuncio.comentarios_count ?? 0}
              titulo='Comentarios'
              placeholder='Escribe un comentario...'
              textoVacio='Todavía no hay comentarios en este anuncio.'
            />
          </div>
        </>
      )}
    </Modal>
  );
}
