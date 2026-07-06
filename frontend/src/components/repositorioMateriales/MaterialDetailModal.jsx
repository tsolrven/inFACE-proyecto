import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal, { ModalHeader } from '../ui/Modal';
import CommentThread from './CommentThread';
import { obtenerApunte } from '../../services/repositorioMateriales/apunte.service';
import {
  listarComentarios,
  crearComentario,
} from '../../services/repositorioMateriales/comentario.service';
import { colorPorRamo } from '../../utils/ramoColors';
import { metaDeArchivo, formatearTamanio, urlArchivo } from '../../utils/fileMeta';
import { formatearTiempoRelativo } from '../../utils/formatRelativeTime';
import { useRepositorioStore } from '../../stores/repositorioStore';

// inserta una respuesta nueva dentro del árbol de comentarios, sin importar
// a qué profundidad esté el padre (recorre recursivamente)
function insertarRespuesta(comentarios, padreId, nueva) {
  return comentarios.map((c) => {
    if (c.id === padreId) {
      return { ...c, respuestas: [...(c.respuestas ?? []), nueva] };
    }
    if (c.respuestas?.length) {
      return { ...c, respuestas: insertarRespuesta(c.respuestas, padreId, nueva) };
    }
    return c;
  });
}

function contarComentarios(comentarios) {
  return comentarios.reduce(
    (acc, c) => acc + 1 + (c.respuestas?.length ? contarComentarios(c.respuestas) : 0),
    0,
  );
}

export default function MaterialDetailModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const actualizarApunteEnFeed = useRepositorioStore((s) => s.actualizarApunteEnFeed);

  const [apunte, setApunte] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [textoNuevo, setTextoNuevo] = useState('');
  const [enviando, setEnviando] = useState(false);

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

  function handleClose() {
    navigate(-1); // vuelve a donde estaba (el feed sigue detrás gracias al backgroundLocation)
  }

  function handleNuevaRespuesta(padreId, nueva) {
    setComentarios((prev) => insertarRespuesta(prev, padreId, nueva));
  }

  async function handleEnviarComentario() {
    if (!textoNuevo.trim()) return;
    setEnviando(true);
    try {
      const nuevo = await crearComentario(id, { contenido: textoNuevo });
      const actualizados = [...comentarios, nuevo];
      setComentarios(actualizados);
      actualizarApunteEnFeed(id, { comentarios_count: contarComentarios(actualizados) });
      setTextoNuevo('');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal open onClose={handleClose} maxWidth='740px'>
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
          <ModalHeader onClose={handleClose}>
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

            <div className='mb-4 flex items-center gap-2 text-[12.5px] text-neutral-600'>
              <div className='flex h-[22px] w-[22px] items-center justify-center rounded-full bg-pink-500/10 text-[9px] font-bold text-pink-500'>
                {apunte.autor?.nombre_usuario?.slice(0, 2).toUpperCase()}
              </div>
              <span>
                por <b className='text-neutral-400'>u/{apunte.autor?.nombre_usuario}</b>
              </span>
              <span>·</span>
              <span>{formatearTiempoRelativo(apunte.creado_en)}</span>
            </div>

            {apunte.descripcion && (
              <p className='mb-4 text-[13.5px] leading-relaxed text-neutral-400'>
                {apunte.descripcion}
              </p>
            )}

            <DetalleArchivos apunte={apunte} />

            {apunte.hashtags?.length > 0 && (
              <div className='flex flex-wrap gap-1.5'>
                {apunte.hashtags.map((tag) => (
                  <span key={tag} className='text-[11.5px] text-blue-400'>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className='border-t border-white/[0.06] bg-[rgba(23,23,27,0.4)] p-6'>
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
                  Todavía no hay comentarios. ¡Sé el primero en preguntar o aportar!
                </p>
              )}
              {comentarios.map((comentario) => (
                <CommentThread
                  key={comentario.id}
                  comentario={comentario}
                  apunteId={id}
                  onNuevaRespuesta={handleNuevaRespuesta}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

function DetalleArchivos({ apunte }) {
  if (apunte.link_repositorio) {
    return (
      <a
        href={apunte.link_repositorio}
        target='_blank'
        rel='noreferrer'
        className='mb-4 flex items-center gap-2 rounded-md border border-[rgba(129,140,248,0.18)] bg-[rgba(129,140,248,0.05)] px-3 py-2 text-[12.5px] font-medium text-[#818CF8] hover:underline'
      >
        <i className='ti ti-brand-github text-base' /> {apunte.link_repositorio}
      </a>
    );
  }

  if (apunte.codigo_snippet) {
    return (
      <pre className='mb-4 max-h-72 overflow-auto rounded-lg border border-white/[0.07] bg-black/30 p-3 text-[12px] text-emerald-300'>
        <code>{apunte.codigo_snippet}</code>
      </pre>
    );
  }

  if (!apunte.archivos?.length) return null;

  return (
    <div className='mb-4 flex flex-col gap-2'>
      {apunte.archivos.map((archivo) => {
        const meta = metaDeArchivo(archivo);
        return (
          <div
            key={archivo.id}
            className='flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5'
          >
            <i className={`ti ${meta.icon} flex-shrink-0 text-lg`} style={{ color: meta.color }} />
            <span className='flex-1 truncate text-[12.5px] font-medium text-neutral-300'>
              {archivo.nombre_archivo}
            </span>
            <span className='flex-shrink-0 text-[10.5px] text-neutral-600'>
              {formatearTamanio(archivo.tamanio)}
            </span>
            <a
              href={urlArchivo(archivo)}
              download
              className='flex flex-shrink-0 items-center gap-1 text-[12px] font-semibold text-blue-400 hover:opacity-75'
            >
              <i className='ti ti-download' /> Descargar
            </a>
          </div>
        );
      })}
    </div>
  );
}
