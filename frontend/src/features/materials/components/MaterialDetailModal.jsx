import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Modal, { ModalHeader } from '@/shared/components/ui/Modal';
import CommentThread from '@/shared/post/comments/CommentThread';
import {
  listarComentarios,
  crearComentario,
} from '@/shared/post/comments/comments.api';
import { COMENTARIO_MAX } from '@/shared/post/comments/constants';
import { colorPorRamo } from '@/shared/lib/courseColors';
import {
  metaDeArchivo,
  metaDeBadge,
  metaDeLink,
  formatearTamanio,
  badgesDeApunte,
} from '@/features/materials/utils/fileMeta';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useAuthStore } from '@/shared/auth/authStore';
import { descargarArchivo } from '@/features/materials/api/files.api';
import {
  useApunte,
  useEliminarApunte,
} from '@/features/materials/hooks/useApuntes';
import { useVotar } from '@/shared/post/votes/useVotar';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import { parchearContenido } from '@/shared/post/cache';
import { mostrarToast } from '@/shared/stores/toastStore';
import EditApunteModal from '@/features/materials/components/EditApunteModal';
import ConfirmDialog from '@/shared/components/ui/ConfirmDialog';
import ReportModal from '@/shared/moderation/ReportModal';
import VotePill from '@/shared/post/votes/VotePill';
import ShareButton from '@/shared/post/share/ShareButton';
import CodeViewer from '@/features/materials/components/CodeViewer';
import BookmarkIcon from '@/shared/post/bookmarks/BookmarkIcon';
import { esStaff, puedeEditar, puedeEliminar } from '@/shared/auth/roles';

const comentariosKey = (id) => ['comentario', 'list', 'apunte', id];

function insertarRespuesta(comentarios, padreId, nueva) {
  return comentarios.map((c) => {
    if (c.id === padreId) {
      return { ...c, respuestas: [...(c.respuestas ?? []), nueva] };
    }
    if (c.respuestas?.length) {
      return {
        ...c,
        respuestas: insertarRespuesta(c.respuestas, padreId, nueva),
      };
    }
    return c;
  });
}

function eliminarNodoDelArbol(comentarios, comentarioId) {
  return comentarios
    .filter((c) => c.id !== comentarioId)
    .map((c) =>
      c.respuestas?.length
        ? { ...c, respuestas: eliminarNodoDelArbol(c.respuestas, comentarioId) }
        : c,
    );
}

function marcarComoEliminado(comentarios, comentarioId) {
  return comentarios.map((c) => {
    if (c.id === comentarioId) {
      return { ...c, eliminado: true, contenido: null, autor: null };
    }
    if (c.respuestas?.length) {
      return {
        ...c,
        respuestas: marcarComoEliminado(c.respuestas, comentarioId),
      };
    }
    return c;
  });
}

function contarComentarios(comentarios) {
  return comentarios.reduce(
    (acc, c) =>
      acc +
      (c.eliminado ? 0 : 1) +
      (c.respuestas?.length ? contarComentarios(c.respuestas) : 0),
    0,
  );
}

export default function MaterialDetailModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const usuario = useAuthStore((s) => s.usuario);

  const { data: apunte, isPending: cargando, error } = useApunte(id);
  const { data: comentarios = [] } = useQuery({
    queryKey: comentariosKey(id),
    queryFn: () => listarComentarios('apunte', id),
  });
  const votarMut = useVotar('apunte');
  const guardarMut = useGuardar('apunte');
  const eliminarMut = useEliminarApunte();

  const [textoNuevo, setTextoNuevo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);
  const [reportando, setReportando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);
  const comentariosRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const esAutor = puedeEditar(usuario, apunte?.autor?.id);
  const puedeBorrar = puedeEliminar(usuario, apunte?.autor?.id);
  const esModerador = esStaff(usuario?.rol);

  function handleClose() {
    if (location.state?.backgroundLocation) navigate(-1);
    else navigate('/repositorio-materiales', { replace: true });
  }

  function handleVotar(e, tipo) {
    e?.stopPropagation?.();
    votarMut.mutate({ id, tipo });
  }

  function handleGuardar() {
    setMenuAbierto(false);
    guardarMut.mutate({ id });
  }

  // un solo lugar para tocar el árbol de comentarios y mantener el contador
  function actualizarComentarios(fn) {
    const nuevos = fn(qc.getQueryData(comentariosKey(id)) ?? []);
    qc.setQueryData(comentariosKey(id), nuevos);
    parchearContenido(qc, 'apunte', id, {
      comentarios_count: contarComentarios(nuevos),
    });
  }

  function handleNuevaRespuesta(padreId, nueva) {
    actualizarComentarios((prev) => insertarRespuesta(prev, padreId, nueva));
  }

  function handleComentarioEliminado(comentarioId, eliminadoPermanente) {
    actualizarComentarios((prev) =>
      eliminadoPermanente
        ? eliminarNodoDelArbol(prev, comentarioId)
        : marcarComoEliminado(prev, comentarioId),
    );
  }

  async function handleEnviarComentario() {
    const texto = textoNuevo.trim();
    if (!texto) return;
    setEnviando(true);
    try {
      const nuevo = await crearComentario('apunte', id, { contenido: texto });
      actualizarComentarios((prev) => [...prev, nuevo]);
      setTextoNuevo('');
    } catch (err) {
      mostrarToast(err.message || 'No se pudo publicar el comentario');
    } finally {
      setEnviando(false);
    }
  }

  async function handleEliminar() {
    setErrorEliminar(null);
    try {
      await eliminarMut.mutateAsync(id);
      handleClose();
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar el material.');
    }
  }

  return (
    <Modal
      open
      onClose={handleClose}
      maxWidth='740px'
    >
      {cargando && (
        <div className='flex items-center justify-center py-20'>
          <i className='ti ti-loader-2 animate-spin text-2xl text-neutral-600' />
        </div>
      )}

      {error && !cargando && (
        <div className='p-8 text-center text-sm text-red-400'>
          {error.message}
        </div>
      )}

      {apunte && !cargando && (
        <>
          <ModalHeader
            onClose={handleClose}
            rightContent={
              <div
                ref={menuRef}
                className='relative'
              >
                <button
                  type='button'
                  onClick={() => setMenuAbierto((abierto) => !abierto)}
                  className='flex h-[30px] w-[30px] items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/[0.06] hover:text-neutral-100'
                >
                  <i className='ti ti-dots text-base' />
                </button>

                {menuAbierto && (
                  <div className='absolute right-0 top-[36px] w-[168px] overflow-hidden rounded-xl border border-white/10 bg-[#1E1E24] shadow-[0_12px_40px_rgba(0,0,0,0.5)]'>
                    <button
                      type='button'
                      onClick={handleGuardar}
                      className='flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.5px] text-neutral-300 transition-colors hover:bg-white/[0.05] hover:text-neutral-100'
                    >
                      <BookmarkIcon
                        filled={apunte.esta_guardado}
                        className={`text-[14px] ${apunte.esta_guardado ? 'text-white' : ''}`}
                      />{' '}
                      {apunte.esta_guardado ? 'Quitar de guardados' : 'Guardar'}
                    </button>

                    {esAutor && (
                      <button
                        type='button'
                        onClick={() => {
                          setMenuAbierto(false);
                          setEditando(true);
                        }}
                        className='flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.5px] text-neutral-300 transition-colors hover:bg-white/[0.05] hover:text-neutral-100'
                      >
                        <i className='ti ti-edit text-[14px]' /> Editar
                      </button>
                    )}

                    {puedeBorrar && (
                      <button
                        type='button'
                        onClick={() => {
                          setMenuAbierto(false);
                          setConfirmandoEliminar(true);
                        }}
                        className='flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.5px] text-red-400 transition-colors hover:bg-red-500/[0.08]'
                      >
                        <i className='ti ti-trash text-[14px]' />{' '}
                        {esAutor ? 'Eliminar' : 'Eliminar (moderación)'}
                      </button>
                    )}

                    {usuario && !esAutor && !esModerador && (
                      <button
                        type='button'
                        onClick={() => {
                          setMenuAbierto(false);
                          setReportando(true);
                        }}
                        className='flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.5px] text-red-400 transition-colors hover:bg-red-500/[0.08]'
                      >
                        <i className='ti ti-flag text-[14px]' /> Reportar
                      </button>
                    )}
                  </div>
                )}
              </div>
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
                background: `${colorPorRamo(apunte.ramo?.id)}22`,
                color: colorPorRamo(apunte.ramo?.id),
              }}
            >
              {apunte.ramo?.nombre}
            </span>
          </ModalHeader>

          <div className='px-6 pb-4 pt-5'>
            <h2 className='mb-3 text-[18px] font-bold leading-snug text-neutral-100'>
              {apunte.titulo}
            </h2>

            <BadgesPrincipales etiquetas={badgesDeApunte(apunte)} />

            <div className='mb-4 flex items-center gap-2 text-[12.5px] text-neutral-600'>
              <Link
                to={`/perfil/usuario/${apunte.autor?.nombre_usuario}`}
                className='flex items-center gap-2 transition hover:opacity-80'
              >
                <div className='flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-[9px] font-bold text-pink-500'>
                  {apunte.autor?.nombre_usuario?.slice(0, 2).toUpperCase()}
                </div>
                <span>
                  por{' '}
                  <b className='text-neutral-400 hover:text-neutral-100 hover:underline'>
                    u/{apunte.autor?.nombre_usuario}
                  </b>
                </span>
              </Link>
              <span>·</span>
              <span>{formatearTiempoRelativo(apunte.creado_en)}</span>
              {apunte.editado_en && (
                <span className='text-neutral-700'>
                  · editado {formatearTiempoRelativo(apunte.editado_en)}
                </span>
              )}
            </div>

            {apunte.descripcion && (
              <p className='mb-4 text-[13.5px] leading-relaxed text-neutral-400'>
                {apunte.descripcion}
              </p>
            )}

            <DetalleArchivos apunte={apunte} />

            {apunte.hashtags?.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-1.5'>
                {apunte.hashtags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() =>
                      navigate(`/repositorio-materiales/tag/${tag}`)
                    }
                    className='cursor-pointer text-[11.5px] text-blue-400 hover:underline'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className='flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3 text-[11.5px] text-neutral-500'>
              <VotePill
                miVoto={apunte.mi_voto}
                votosNeto={apunte.votos_neto}
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
                {contarComentarios(comentarios)}
              </button>

              <ShareButton
                path={`/repositorio-materiales/${apunte.id}`}
                titulo={apunte.titulo}
              />

              <span className='ml-auto flex items-center gap-1'>
                <i className='ti ti-download text-[13px]' />{' '}
                {apunte.descargas ?? '—'} descargas
              </span>
            </div>
          </div>

          <div
            ref={comentariosRef}
            className='border-t border-white/[0.06] bg-[rgba(23,23,27,0.4)] p-6'
          >
            <h3 className='mb-4 flex items-center gap-1.5 text-sm font-semibold text-neutral-100'>
              <i className='ti ti-messages text-base text-pink-500' />
              Discusión y Respuestas ({contarComentarios(comentarios)})
            </h3>

            <div className='mb-6 flex flex-col gap-2 rounded-[10px] border border-white/[0.06] bg-[#111114] p-2.5'>
              <textarea
                value={textoNuevo}
                onChange={(e) => setTextoNuevo(e.target.value)}
                maxLength={COMENTARIO_MAX}
                rows={3}
                placeholder='Escribe un comentario o duda sobre este material...'
                className='w-full resize-none bg-transparent text-[13px] text-neutral-100 outline-none placeholder-neutral-600'
              />
              <div className='flex items-center justify-between'>
                <span className='text-[11px] text-neutral-600'>
                  {textoNuevo.length}/{COMENTARIO_MAX}
                </span>
                <button
                  type='button'
                  onClick={handleEnviarComentario}
                  disabled={enviando || !textoNuevo.trim()}
                  className='rounded-md bg-pink-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#D43E56] disabled:opacity-50'
                >
                  {enviando ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </div>

            <div className='flex flex-col gap-4'>
              {comentarios.length === 0 && (
                <p className='text-center text-[12.5px] text-neutral-600'>
                  Todavía no hay comentarios. ¡Sé el primero en preguntar o
                  aportar!
                </p>
              )}
              {comentarios.map((comentario) => (
                <CommentThread
                  key={comentario.id}
                  comentario={comentario}
                  tipoContenido='apunte'
                  contenidoId={id}
                  onNuevaRespuesta={handleNuevaRespuesta}
                  onComentarioEliminado={handleComentarioEliminado}
                />
              ))}
            </div>
          </div>

          {esAutor && (
            <EditApunteModal
              open={editando}
              onClose={() => setEditando(false)}
              apunte={apunte}
              carreraId={usuario?.carrera_id}
            />
          )}

          {puedeBorrar && (
            <ConfirmDialog
              open={confirmandoEliminar}
              title='Eliminar material'
              message={
                errorEliminar ||
                'Esta acción no se puede deshacer. Se eliminarán también sus archivos, comentarios y votos.'
              }
              confirmLabel='Eliminar'
              danger
              loading={eliminarMut.isPending}
              onConfirm={handleEliminar}
              onCancel={() => {
                setConfirmandoEliminar(false);
                setErrorEliminar(null);
              }}
            />
          )}

          {!esAutor && !esModerador && (
            <ReportModal
              open={reportando}
              onClose={() => setReportando(false)}
              tipoContenido='apunte'
              contenidoId={id}
            />
          )}
        </>
      )}
    </Modal>
  );
}

function BadgesPrincipales({ etiquetas }) {
  if (!etiquetas?.length) return null;

  return (
    <div className='mb-3 flex flex-wrap gap-1.5'>
      {etiquetas.map((valor) => {
        const meta = metaDeBadge(valor);
        if (!meta) return null;
        return (
          <span
            key={valor}
            className='flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold'
            style={{ background: meta.bg, color: meta.color }}
          >
            <i className={`ti ${meta.icon} text-[13px]`} />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

function DetalleArchivos({ apunte }) {
  const tieneLinks = apunte.links?.length > 0;
  const tieneSnippet = !!apunte.codigo_snippet;
  const tieneArchivos = apunte.archivos?.length > 0;

  if (!tieneLinks && !tieneSnippet && !tieneArchivos) return null;

  return (
    <div className='mb-4 flex flex-col gap-3'>
      {tieneLinks &&
        apunte.links.map((link, i) => {
          const meta = metaDeLink(link);
          return (
            <a
              key={i}
              href={link}
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-2 rounded-md border border-[rgba(129,140,248,0.18)] bg-[rgba(129,140,248,0.05)] px-3 py-2 text-[12.5px] font-medium text-[#818CF8] hover:underline'
            >
              <i
                className={`ti ${meta.icon} text-base`}
                style={{ color: meta.color }}
              />{' '}
              {link}
            </a>
          );
        })}

      {tieneSnippet && (
        <CodeViewer
          codigo={apunte.codigo_snippet}
          lenguaje={apunte.lenguaje_snippet}
          maxHeight='420px'
        />
      )}

      {tieneArchivos && (
        <div className='flex flex-col gap-2'>
          {apunte.archivos.map((archivo) => {
            const meta = metaDeArchivo(archivo);
            return (
              <div
                key={archivo.id}
                className='flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5'
              >
                <i
                  className={`ti ${meta.icon} flex-shrink-0 text-lg`}
                  style={{ color: meta.color }}
                />
                <span className='flex-1 truncate text-[12.5px] font-medium text-neutral-300'>
                  {archivo.nombre_archivo}
                </span>
                <span className='flex-shrink-0 text-[10.5px] text-neutral-600'>
                  {formatearTamanio(archivo.tamanio)}
                </span>
                <button
                  type='button'
                  onClick={() => descargarArchivo(archivo)}
                  className='flex flex-shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-400 hover:opacity-75'
                >
                  <i className='ti ti-download' /> Descargar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
