import BotonVolver from '@/features/creative-space/components/BotonVolver';
import { useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CommentsSection from '@/shared/post/comments/CommentsSection';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useVotar } from '@/shared/post/votes/useVotar';
import VotePill from '@/shared/post/votes/VotePill';
import MarkdownView from '@/shared/markdown/MarkdownView';
import ObraMenu from '@/features/creative-space/components/ObraMenu';
import MediaObra from '@/features/creative-space/components/MediaObra';
import ElencoYGuion from '@/features/creative-space/components/ElencoYGuion';
import GuionViewer from '@/features/creative-space/components/GuionViewer';
import HistoriaReader from '@/features/creative-space/components/HistoriaReader';
import MusicaDetalle from '@/features/creative-space/components/MusicaDetalle';
import CompartirObra from '@/features/creative-space/components/CompartirObra';
import GuardarObraButton from '@/features/creative-space/components/GuardarObraButton';
import InsigniaBorrador from '@/features/creative-space/components/InsigniaBorrador';
import ComentariosParrafos from '@/features/creative-space/components/ComentariosParrafos';
import PoemaView from '@/features/creative-space/components/PoemaView';
import ImagenObra from '@/features/creative-space/components/ImagenObra';
import { parsearEnlace } from '@/features/creative-space/utils/embed';
import { useObra } from '@/features/creative-space/hooks/useObras';
import { TIPO_POR_ID } from '@/features/creative-space/utils/tipos';
import {
  ESPACIO_DE_TIPO,
  rutas,
} from '@/features/creative-space/utils/espacios';

const Cargando = () => (
  <div className='mb-4 flex items-center gap-2 text-[12px] text-neutral-600'>
    <i className='ti ti-loader-2 animate-spin' /> Cargando contenido...
  </div>
);

export default function ObraDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const comentariosRef = useRef(null);

  const { data: obra, isPending, isPlaceholderData, error } = useObra(id);
  const votarMut = useVotar('obra');
  const tipo = obra ? TIPO_POR_ID[obra.tipo] : null;
  const esAlbum = obra?.tipo === 'album';
  const miniatura = obra?.enlace_url
    ? (parsearEnlace(obra.enlace_url)?.miniatura ?? null)
    : null;
  const cancionConPortada =
    obra?.tipo === 'musica' && !!(obra.portada_id || miniatura);

  function handleClose() {
    if (window.history.state?.idx > 0) navigate(-1);
    else {
      const espacio = obra ? ESPACIO_DE_TIPO[obra.tipo] : null;
      navigate(espacio ? rutas.espacio(espacio.id) : rutas.inicio, {
        replace: true,
      });
    }
  }

  function handleVotar(e, v) {
    e?.stopPropagation?.();
    votarMut.mutate({ id, tipo: v });
  }

  const cargandoCompleto = isPlaceholderData;

  return (
    <div
      className={`mx-auto w-full overflow-hidden bg-[#1A1A1F] sm:rounded-[14px] sm:border sm:border-white/[0.07] ${obra && ['historia', 'guion', 'poema'].includes(obra.tipo)
          ? 'max-w-[1180px]'
          : 'max-w-[900px]'
        }`}
    >
      {isPending && (
        <div className='flex items-center justify-center py-20'>
          <i className='ti ti-loader-2 animate-spin text-2xl text-neutral-600' />
        </div>
      )}

      {error && !isPending && (
        <div className='p-4'>
          <BotonVolver />
          <p className='p-6 text-center text-sm text-red-400'>
            {error.message}
          </p>
        </div>
      )}

      {obra && (
        <>
          <div className='flex items-center gap-2 border-b border-white/[0.06] px-4 py-3'>
            <button
              type='button'
              onClick={handleClose}
              title='Volver'
              className='flex h-[30px] w-[30px] items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
            >
              <i className='ti ti-arrow-left text-base' />
            </button>
            {tipo && (
              <span
                className='flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold'
                style={{ background: `${tipo.color}22`, color: tipo.color }}
              >
                <i className={`ti ${tipo.icono} text-[11px]`} /> {tipo.label}
              </span>
            )}
            {obra.borrador && <InsigniaBorrador />}
            <div className='ml-auto'>
              <ObraMenu
                obra={obra}
                triggerClassName='flex h-[30px] w-[30px] items-center justify-center rounded-lg text-base text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
                onEliminado={handleClose}
              />
            </div>
          </div>

          <div className='px-3 pb-4 pt-4 sm:px-6 sm:pt-5'>
            {obra.borrador && (
              <div className='mb-4 flex flex-wrap items-center gap-2 rounded-[10px] border border-amber-400/25 bg-amber-400/5 px-3 py-2 text-[12.5px] text-amber-200'>
                <i className='ti ti-lock' />
                <span className='flex-1'>
                  Es un borrador: solo tú puedes verlo. Edítalo para publicarlo.
                </span>
                <Link
                  to={rutas.editar(obra.id)}
                  className='font-semibold underline'
                >
                  Editar y publicar
                </Link>
              </div>
            )}

            {esAlbum && (
              <MusicaDetalle
                obra={obra}
                cargando={cargandoCompleto}
              />
            )}

            {!esAlbum && (
              <h2 className='mb-3 break-words text-[20px] font-bold leading-snug text-neutral-100'>
                {obra.titulo}
              </h2>
            )}

            <div
              className={`mb-4 flex items-center gap-2 text-[12.5px] text-neutral-600 ${esAlbum ? 'hidden' : ''}`}
            >
              <Link
                to={`/perfil/usuario/${obra.autor?.nombre_usuario}`}
                className='flex items-center gap-2 transition hover:opacity-80'
              >
                <div className='flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-[9px] font-bold text-pink-500'>
                  {obra.autor?.nombre_usuario?.slice(0, 2).toUpperCase()}
                </div>
                <span>
                  por{' '}
                  <b className='text-neutral-400 hover:text-neutral-100 hover:underline'>
                    u/{obra.autor?.nombre_usuario}
                  </b>
                </span>
              </Link>
              <span>·</span>
              <span>{formatearTiempoRelativo(obra.creado_en)}</span>
              {obra.editado_en && (
                <span className='text-neutral-700'>
                  · editado {formatearTiempoRelativo(obra.editado_en)}
                </span>
              )}
            </div>

            {obra.tipo === 'poema' ? (
              cargandoCompleto && obra.texto_truncado ? (
                <Cargando />
              ) : (
                <div className='mb-4'>
                  <PoemaView obra={obra} />
                  {obra.descripcion && !obra.descripcion_truncada && (
                    <div className='mt-3'>
                      <MarkdownView contenido={obra.descripcion} />
                    </div>
                  )}
                </div>
              )
            ) : (
              <>
                {(obra.tipo === 'historia' || obra.tipo === 'guion') && (
                  <div className='mb-4 flex gap-4'>
                    <ImagenObra
                      natural
                      archivoId={obra.portada_id}
                      icono='ti-book-2'
                      alt={`Portada de ${obra.titulo}`}
                      className='w-[112px] flex-shrink-0 self-start rounded-[10px] border border-white/[0.07] bg-[#17171B] shadow-lg sm:w-[230px]'
                    />
                    <div className='min-w-0 flex-1'>
                      <div className='mb-2 flex flex-wrap gap-1.5 text-[11.5px] text-neutral-400'>
                        <span className='flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1'>
                          <i className='ti ti-list-details' />
                          {obra.capitulos_count} cap.
                        </span>
                        {obra.personajes_count > 0 && (
                          <span className='flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1'>
                            <i className='ti ti-users' />
                            {obra.personajes_count} personajes
                          </span>
                        )}
                      </div>
                      {obra.descripcion && !obra.descripcion_truncada && (
                        <MarkdownView contenido={obra.descripcion} />
                      )}
                    </div>
                  </div>
                )}

                {cancionConPortada ? (
                  <>
                    <div className='mb-4 flex items-stretch gap-4'>
                      <ImagenObra
                        archivoId={obra.portada_id}
                        fallbackSrc={miniatura}
                        icono='ti-music'
                        alt={`Portada de ${obra.titulo}`}
                        className='aspect-square w-[112px] flex-shrink-0 rounded-[10px] border border-white/[0.07] bg-[#17171B] shadow-lg sm:w-[230px]'
                      />
                      <div className='min-w-0 flex-1'>
                        <MediaObra
                          obra={obra}
                          llenar
                        />
                      </div>
                    </div>
                    {obra.descripcion && !obra.descripcion_truncada && (
                      <div className='mb-4'>
                        <MarkdownView contenido={obra.descripcion} />
                      </div>
                    )}
                  </>
                ) : (
                  !esAlbum && (
                    <div className='mb-4'>
                      <MediaObra obra={obra} />
                    </div>
                  )
                )}

                {obra.tipo === 'audiovisual' && <ElencoYGuion obra={obra} />}

                {obra.tipo !== 'historia' &&
                  obra.tipo !== 'guion' &&
                  !esAlbum &&
                  !cancionConPortada &&
                  obra.descripcion &&
                  !obra.descripcion_truncada && (
                    <div className='mb-4'>
                      <MarkdownView contenido={obra.descripcion} />
                    </div>
                  )}

                {(obra.tipo === 'historia' || obra.tipo === 'guion') &&
                  (cargandoCompleto ? (
                    <Cargando />
                  ) : (
                    <div className='mb-4'>
                      {obra.tipo === 'historia' ? (
                        <HistoriaReader
                          key={obra.id}
                          obra={obra}
                        />
                      ) : (
                        <GuionViewer
                          key={obra.id}
                          obra={obra}
                        />
                      )}
                    </div>
                  ))}
              </>
            )}

            {obra.hashtags?.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-1.5'>
                {obra.hashtags.map((tag) => (
                  <Link
                    key={tag}
                    to={rutas.hashtag(tag)}
                    className='text-[11.5px] text-blue-400 hover:underline'
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className='flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 text-[11.5px] text-neutral-500'>
              <VotePill
                miVoto={obra.mi_voto}
                votosNeto={obra.votos_neto}
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
                {obra.comentarios_count ?? 0}
              </button>
              <GuardarObraButton obra={obra} />
              <CompartirObra obra={obra} />
            </div>
          </div>

          <div
            ref={comentariosRef}
            className='border-t border-white/[0.06] bg-[rgba(23,23,27,0.4)] p-4 sm:p-6'
          >
            <ComentariosParrafos obra={obra} />
            <CommentsSection
              tipoContenido='obra'
              contenidoId={id}
              total={obra.comentarios_count ?? 0}
              titulo='Comentarios'
              placeholder='Deja un comentario para el autor...'
              textoVacio='Todavía no hay comentarios. ¡Sé el primero en opinar!'
            />
          </div>
        </>
      )}
    </div>
  );
}