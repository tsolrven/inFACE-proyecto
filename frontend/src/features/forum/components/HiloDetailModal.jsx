import { useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import CommentsSection from '@/shared/post/comments/CommentsSection';
import { colorPorRamo } from '@/shared/lib/courseColors';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useAuthStore } from '@/shared/auth/authStore';
import { useVotar } from '@/shared/post/votes/useVotar';
import { parchearContenido } from '@/shared/post/cache';
import VotePill from '@/shared/post/votes/VotePill';
import ShareButton from '@/shared/post/share/ShareButton';
import HiloMenu from '@/features/forum/components/HiloMenu';
import {
  useHilo,
  useRespuestaAceptada,
  useAceptarRespuesta,
  useDesmarcarRespuesta,
  claveRespuestaAceptada,
} from '@/features/forum/hooks/useHilos';

export default function HiloDetailModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const usuario = useAuthStore((s) => s.usuario);
  const comentariosRef = useRef(null);

  const { data: hilo, isPending, isPlaceholderData, error } = useHilo(id);
  const votarMut = useVotar('hilo');
  const aceptarMut = useAceptarRespuesta(id);
  const desmarcarMut = useDesmarcarRespuesta(id);

  // mientras se muestra el dato recortado de la lista no se pide el árbol aparte
  const aceptadaId = isPlaceholderData
    ? null
    : (hilo?.respuesta_aceptada_id ?? null);
  const { data: raizAceptada } = useRespuestaAceptada(id, aceptadaId);

  const esAutorHilo = !!usuario && usuario.id === hilo?.autor?.id;

  function handleClose() {
    if (location.state?.backgroundLocation) navigate(-1);
    else navigate('/foro-por-ramos', { replace: true });
  }

  function handleVotar(e, tipo) {
    e?.stopPropagation?.();
    votarMut.mutate({ id, tipo });
  }

  // Si se elimina la respuesta aceptada, el backend ya limpió la aceptación:
  // se refleja en el caché sin esperar a recargar.
  function alEliminarComentario(comentarioId) {
    if (comentarioId === hilo?.respuesta_aceptada_id) {
      parchearContenido(qc, 'hilo', id, {
        respuesta_aceptada_id: null,
        resuelto: false,
      });
    }
  }

  // Solo el autor del hilo, solo comentarios raíz vivos y no el ya aceptado
  // (el backend valida lo mismo: aquí solo se evita mostrar un botón inútil).
  function accionExtra(comentario) {
    if (
      !esAutorHilo ||
      comentario.nivel !== 0 ||
      comentario.eliminado ||
      comentario.id === hilo?.respuesta_aceptada_id
    ) {
      return null;
    }
    return (
      <button
        type='button'
        onClick={() => aceptarMut.mutate(comentario.id)}
        disabled={aceptarMut.isPending}
        className='flex items-center gap-1 text-[11.5px] text-neutral-600 transition-colors hover:text-emerald-400 disabled:opacity-50'
      >
        <i className='ti ti-circle-check' /> Marcar como respuesta
      </button>
    );
  }

  const fijado = aceptadaId
    ? {
        raiz: raizAceptada ?? null,
        clave: claveRespuestaAceptada(id, aceptadaId),
        encabezado: (
          <div className='mb-2 flex items-center gap-2 text-[11.5px] font-bold text-emerald-400'>
            <i className='ti ti-circle-check text-sm' /> Respuesta aceptada
            {esAutorHilo && (
              <button
                type='button'
                onClick={() => desmarcarMut.mutate()}
                disabled={desmarcarMut.isPending}
                className='ml-auto text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-200 disabled:opacity-50'
              >
                Quitar
              </button>
            )}
          </div>
        ),
      }
    : null;

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

      {hilo && (
        <>
          <ModalHeader
            onClose={handleClose}
            rightContent={
              <HiloMenu
                hilo={hilo}
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
            <span
              className='rounded-full px-2 py-0.5 text-[10px] font-bold'
              style={{
                background: `${colorPorRamo(hilo.ramo?.id)}22`,
                color: colorPorRamo(hilo.ramo?.id),
              }}
            >
              {hilo.ramo?.nombre}
            </span>
            {hilo.resuelto && (
              <span className='flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400'>
                <i className='ti ti-circle-check text-[11px]' /> Resuelto
              </span>
            )}
          </ModalHeader>

          <div className='px-6 pb-4 pt-5'>
            <h2 className='mb-3 break-words text-[18px] font-bold leading-snug text-neutral-100'>
              {hilo.titulo}
            </h2>

            <div className='mb-4 flex items-center gap-2 text-[12.5px] text-neutral-600'>
              <Link
                to={`/perfil/usuario/${hilo.autor?.nombre_usuario}`}
                className='flex items-center gap-2 transition hover:opacity-80'
              >
                <div className='flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-[9px] font-bold text-pink-500'>
                  {hilo.autor?.nombre_usuario?.slice(0, 2).toUpperCase()}
                </div>
                <span>
                  por{' '}
                  <b className='text-neutral-400 hover:text-neutral-100 hover:underline'>
                    u/{hilo.autor?.nombre_usuario}
                  </b>
                </span>
              </Link>
              <span>·</span>
              <span>{formatearTiempoRelativo(hilo.creado_en)}</span>
              {hilo.editado_en && (
                <span className='text-neutral-700'>
                  · editado {formatearTiempoRelativo(hilo.editado_en)}
                </span>
              )}
            </div>

            {/* TEMPORAL (F2): texto plano. En F3 se reemplaza por el renderizador seguro de Markdown */}
            {isPlaceholderData && hilo.contenido_truncado ? (
              <div className='mb-4 flex items-center gap-2 text-[12px] text-neutral-600'>
                <i className='ti ti-loader-2 animate-spin' /> Cargando
                contenido...
              </div>
            ) : (
              hilo.contenido && (
                <div className='mb-4 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-neutral-300'>
                  {hilo.contenido}
                </div>
              )
            )}

            {hilo.archivos?.length > 0 && (
              <div className='mb-4 flex items-center gap-1 text-[12px] text-neutral-500'>
                <i className='ti ti-photo text-[14px]' />
                {hilo.archivos.length}{' '}
                {hilo.archivos.length === 1
                  ? 'imagen adjunta'
                  : 'imágenes adjuntas'}
              </div>
            )}

            {hilo.hashtags?.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-1.5'>
                {hilo.hashtags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/hashtag/${tag}`}
                    className='text-[11.5px] text-blue-400 hover:underline'
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className='flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 text-[11.5px] text-neutral-500'>
              <VotePill
                miVoto={hilo.mi_voto}
                votosNeto={hilo.votos_neto}
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
                {hilo.comentarios_count ?? 0}
              </button>

              <ShareButton
                path={`/foro-por-ramos/${hilo.id}`}
                titulo={hilo.titulo}
              />
            </div>
          </div>

          <div
            ref={comentariosRef}
            className='border-t border-white/[0.06] bg-[rgba(23,23,27,0.4)] p-6'
          >
            <CommentsSection
              tipoContenido='hilo'
              contenidoId={id}
              total={hilo.comentarios_count ?? 0}
              titulo='Respuestas'
              placeholder='Escribe una respuesta...'
              textoVacio='Todavía no hay respuestas. ¡Sé el primero en ayudar!'
              fijado={fijado}
              accionExtra={accionExtra}
              alEliminarComentario={alEliminarComentario}
            />
          </div>
        </>
      )}
    </Modal>
  );
}
