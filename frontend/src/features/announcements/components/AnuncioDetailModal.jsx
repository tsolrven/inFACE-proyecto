import { useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import CommentsSection from '@/shared/post/comments/CommentsSection';
import { useAuthStore } from '@/shared/auth/authStore';
import { compartirAnuncio } from '@/features/announcements/utils/compartir';
import GaleriaImagenes from '@/shared/post/images/GaleriaImagenes';
import MarkdownView from '@/shared/markdown/MarkdownView';
import { useRutaHashtag } from '@/shared/hooks/useRutaHashtag';
import { useAnuncio } from '@/features/announcements/hooks/useAnuncios';
import FlairChip from '@/features/announcements/components/FlairChip';
import AdjuntosPdf from '@/features/announcements/components/AdjuntosPdf';
import AnuncioMenu from '@/features/announcements/components/AnuncioMenu';
import BotonCompartir from '@/shared/post/share/BotonCompartir';
import EncabezadoOficial from '@/features/announcements/components/EncabezadoOficial';
import BotonEnterado from '@/features/announcements/components/BotonEnterado';

export default function AnuncioDetailModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const rutaHashtag = useRutaHashtag();
  const carreraUsuario = useAuthStore((s) => s.usuario?.carrera_id ?? null);
  const comentariosRef = useRef(null);

  const { data: anuncio, isPending, isPlaceholderData, error } = useAnuncio(id);

  function handleClose() {
    if (location.state?.backgroundLocation) navigate(-1);
    else navigate('/anuncios-oficiales', { replace: true });
  }

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
            <div className='mb-4 flex flex-wrap items-center gap-2'>
              <EncabezadoOficial
                anuncio={anuncio}
                grande
              />
              {anuncio.fijado_en && (
                <span className='inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-amber-300'>
                  <i className='ti ti-pin text-[12px]' /> Destacado
                </span>
              )}
            </div>
            <h2 className='mb-3 break-words text-[18px] font-bold leading-snug text-neutral-100'>
              {anuncio.titulo}
            </h2>

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
              <BotonEnterado anuncio={anuncio} />

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

              <BotonCompartir {...compartirAnuncio(anuncio)} />
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
