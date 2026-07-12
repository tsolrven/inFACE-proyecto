import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal, { ModalHeader } from '../ui/Modal';
import CommentThread from './CommentThread';
import { obtenerApunte } from '../../services/repositorioMateriales/apunte.service';
import {
  listarComentarios,
  crearComentario,
} from '../../services/repositorioMateriales/comentario.service';
import { colorPorRamo } from '../../utils/ramoColors';
import {
  metaDeArchivo,
  metaDeBadge,
  metaDeLink,
  formatearTamanio,
} from '../../utils/fileMeta';
import { formatearTiempoRelativo } from '../../utils/formatRelativeTime';
import {
  useRepositorioStore,
  calcularDeltaVoto,
} from '../../stores/repositorioStore';
import { useAuthStore } from '../../stores/authStore';
import { descargarArchivo } from '../../services/repositorioMateriales/archivo.service';
import { votarApunte } from '../../services/repositorioMateriales/voto.service';
import { alternarGuardadoApunte } from '../../services/repositorioMateriales/guardado.service';
import { mostrarToast } from '../../stores/toastStore';
import EditApunteModal from './EditApunteModal';
import ConfirmDialog from '../ui/ConfirmDialog';
import ReportModal from '../reportes/ReportModal';
import VotePill from './VotePill';
import CodeViewer from './CodeViewer';
import { fueEditado } from '../../utils/fueEditado';

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
      acc + 1 + (c.respuestas?.length ? contarComentarios(c.respuestas) : 0),
    0,
  );
}

export default function MaterialDetailModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const actualizarApunteEnFeed = useRepositorioStore(
    (s) => s.actualizarApunteEnFeed,
  );
  const editarApunte = useRepositorioStore((s) => s.editarApunte);
  const eliminarApunteDelFeed = useRepositorioStore(
    (s) => s.eliminarApunteDelFeed,
  );
  const usuario = useAuthStore((s) => s.usuario);

  const [apunte, setApunte] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [textoNuevo, setTextoNuevo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
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

  const esDueno =
    usuario &&
    apunte &&
    (apunte.autor?.id === usuario.id ||
      usuario.rol === 'admin' ||
      usuario.rol === 'moderador');

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    Promise.all([obtenerApunte(id), listarComentarios(id)])
      .then(([apunteData, comentariosData]) => {
        if (cancelado) return;
        setApunte(apunteData);
        setComentarios(comentariosData);
      })
      .catch((err) => !cancelado && setError(err.message))
      .finally(() => !cancelado && setCargando(false));
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function handleVotar(e, tipo) {
    e?.stopPropagation?.();
    const anterior = apunte;
    const mismoVoto = apunte.mi_voto === tipo;
    const delta = calcularDeltaVoto(apunte.mi_voto, tipo);
    const actualizado = {
      ...apunte,
      mi_voto: mismoVoto ? null : tipo,
      votos_neto: apunte.votos_neto + delta,
    };
    setApunte(actualizado);
    actualizarApunteEnFeed(id, {
      mi_voto: actualizado.mi_voto,
      votos_neto: actualizado.votos_neto,
    });
    try {
      await votarApunte(id, tipo);
    } catch (err) {
      setApunte(anterior);
      actualizarApunteEnFeed(id, {
        mi_voto: anterior.mi_voto,
        votos_neto: anterior.votos_neto,
      });
    }
  }

  function handleClose() {
    navigate(-1);
  }

  async function handleGuardar() {
    setMenuAbierto(false);
    const anterior = apunte.esta_guardado;
    setApunte((prev) => ({ ...prev, esta_guardado: !anterior }));
    actualizarApunteEnFeed(id, { esta_guardado: !anterior });
    try {
      const { guardado } = await alternarGuardadoApunte(id);
      setApunte((prev) => ({ ...prev, esta_guardado: guardado }));
      actualizarApunteEnFeed(id, { esta_guardado: guardado });
      mostrarToast(guardado ? 'Publicación guardada' : 'Quitado de guardados');
    } catch {
      setApunte((prev) => ({ ...prev, esta_guardado: anterior }));
      actualizarApunteEnFeed(id, { esta_guardado: anterior });
    }
  }

  function handleNuevaRespuesta(padreId, nueva) {
    setComentarios((prev) => insertarRespuesta(prev, padreId, nueva));
  }

  function handleComentarioEliminado(comentarioId, eliminadoPermanente) {
    setComentarios((prev) => {
      const actualizados = eliminadoPermanente
        ? eliminarNodoDelArbol(prev, comentarioId)
        : marcarComoEliminado(prev, comentarioId);
      actualizarApunteEnFeed(id, {
        comentarios_count: contarComentarios(actualizados),
      });
      return actualizados;
    });
  }

  async function handleEnviarComentario() {
    if (!textoNuevo.trim()) return;
    setEnviando(true);
    try {
      const nuevo = await crearComentario(id, { contenido: textoNuevo });
      const actualizados = [...comentarios, nuevo];
      setComentarios(actualizados);
      actualizarApunteEnFeed(id, {
        comentarios_count: contarComentarios(actualizados),
      });
      setTextoNuevo('');
    } finally {
      setEnviando(false);
    }
  }

  function handleEdicionGuardada(actualizado) {
    const {
      titulo,
      descripcion,
      ramo,
      hashtags,
      links,
      codigo_snippet,
      etiquetas_visuales,
      actualizado_en,
      archivos,
      descargas,
    } = actualizado;
    setApunte((prev) => ({
      ...prev,
      titulo,
      descripcion,
      etiquetas_visuales,
      ramo,
      hashtags,
      links,
      codigo_snippet,
      actualizado_en,
      archivos,
      descargas,
    }));
  }

  async function handleEliminar() {
    setEliminando(true);
    setErrorEliminar(null);
    try {
      await eliminarApunteDelFeed(id);
      navigate(-1);
    } catch (err) {
      setErrorEliminar(err.message || 'No se pudo eliminar el material.');
      setEliminando(false);
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
        <div className='p-8 text-center text-sm text-red-400'>{error}</div>
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
                      <i
                        className={`ti ${apunte.esta_guardado ? 'ti-bookmark-filled text-pink-500' : 'ti-bookmark'} text-[14px]`}
                      />{' '}
                      {apunte.esta_guardado ? 'Quitar de guardados' : 'Guardar'}
                    </button>
                    {esDueno ? (
                      <>
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
                        <button
                          type='button'
                          onClick={() => {
                            setMenuAbierto(false);
                            setConfirmandoEliminar(true);
                          }}
                          className='flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[12.5px] text-red-400 transition-colors hover:bg-red-500/[0.08]'
                        >
                          <i className='ti ti-trash text-[14px]' /> Eliminar
                        </button>
                      </>
                    ) : (
                      !esDueno &&
                      usuario && (
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
                      )
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

            <BadgesPrincipales etiquetas={apunte.etiquetas_visuales} />

            <div className='mb-4 flex items-center gap-2 text-[12.5px] text-neutral-600'>
              <div className='flex h-[22px] w-[22px] items-center justify-center rounded-full bg-pink-500/10 text-[9px] font-bold text-pink-500'>
                {apunte.autor?.nombre_usuario?.slice(0, 2).toUpperCase()}
              </div>
              <span>
                por{' '}
                <b className='text-neutral-400'>
                  u/{apunte.autor?.nombre_usuario}
                </b>
              </span>
              <span>·</span>
              <span>{formatearTiempoRelativo(apunte.creado_en)}</span>
              {fueEditado(apunte.creado_en, apunte.actualizado_en) && (
                <span className='text-neutral-700'>
                  · editado {formatearTiempoRelativo(apunte.actualizado_en)}
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

              <button
                type='button'
                className='flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 transition-colors hover:bg-white/[0.1] hover:text-neutral-200'
              >
                <i className='ti ti-share-3 text-[13px]' /> Compartir
              </button>

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
                rows={3}
                placeholder='Escribe un comentario o duda sobre este material...'
                className='w-full resize-none bg-transparent text-[13px] text-neutral-100 outline-none placeholder-neutral-600'
              />
              <div className='flex justify-end'>
                <button
                  type='button'
                  onClick={handleEnviarComentario}
                  disabled={enviando}
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
                  apunteId={id}
                  onNuevaRespuesta={handleNuevaRespuesta}
                  onComentarioEliminado={handleComentarioEliminado}
                />
              ))}
            </div>
          </div>

          {esDueno && (
            <>
              <EditApunteModal
                open={editando}
                onClose={() => setEditando(false)}
                apunte={apunte}
                carreraId={usuario?.carrera_id}
                onSaved={handleEdicionGuardada}
              />
              <ConfirmDialog
                open={confirmandoEliminar}
                title='Eliminar material'
                message={
                  errorEliminar ||
                  'Esta acción no se puede deshacer. Se eliminarán también sus archivos, comentarios y votos.'
                }
                confirmLabel='Eliminar'
                danger
                loading={eliminando}
                onConfirm={handleEliminar}
                onCancel={() => {
                  setConfirmandoEliminar(false);
                  setErrorEliminar(null);
                }}
              />
            </>
          )}

          <ReportModal
            open={reportando}
            onClose={() => setReportando(false)}
            tipoContenido='apunte'
            contenidoId={id}
          />
        </>
      )}
    </Modal>
  );
}

// badges que el usuario marcó manualmente al subir/editar el material.
// Es independiente de los archivos reales adjuntos (esos siguen mostrando
// su propio ícono automático más abajo, en DetalleArchivos).
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
