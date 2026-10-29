import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatearTiempoRelativo } from '@/shared/lib/formatRelativeTime';
import { useGuardar } from '@/shared/post/bookmarks/useGuardar';

// `rutaDe(padre)` la define cada módulo: recibe la publicación a la que pertenece
// el comentario ({ id, tipo_contenido, titulo }) y devuelve su ruta, o null.
export default function SavedCommentCard({ comentario, rutaDe }) {
  const navigate = useNavigate();
  const location = useLocation();
  const guardarMut = useGuardar('comentario');

  const padre = comentario.contenido_padre;
  const ruta = padre ? (rutaDe?.(padre) ?? null) : null;

  function irAlPost() {
    if (!ruta) return;
    navigate(ruta, { state: { backgroundLocation: location } });
  }

  function handleQuitar(e) {
    e.stopPropagation();
    guardarMut.mutate({ id: comentario.id, guardar: false });
  }

  return (
    <div
      onClick={irAlPost}
      className={`mb-2 flex flex-col gap-1.5 rounded-[14px] border border-white/[0.06] bg-[#1E1E24] p-3 transition-colors hover:border-white/[0.12] ${
        ruta ? 'cursor-pointer' : 'cursor-default opacity-70'
      }`}
    >
      <div className='flex items-center justify-between gap-2'>
        <span className='truncate text-[11.5px] text-neutral-600'>
          en{' '}
          <b className='text-neutral-400'>
            {padre?.titulo ?? 'una publicación eliminada'}
          </b>
        </span>
        <button
          type='button'
          onClick={handleQuitar}
          disabled={guardarMut.isPending}
          title='Quitar de guardados'
          className='flex-shrink-0 text-neutral-600 transition-colors hover:text-pink-400 disabled:opacity-50'
        >
          <i className='ti ti-bookmark-off text-[14px]' />
        </button>
      </div>

      <div className='flex items-center gap-1.5 text-[11.5px] text-neutral-600'>
        {comentario.autor?.nombre_usuario ? (
          <Link
            to={`/perfil/usuario/${comentario.autor.nombre_usuario}`}
            onClick={(e) => e.stopPropagation()}
            className='font-semibold text-neutral-400 transition hover:text-neutral-100 hover:underline'
          >
            u/{comentario.autor.nombre_usuario}
          </Link>
        ) : (
          <span className='font-semibold text-neutral-400'>[eliminado]</span>
        )}
        <span>· {formatearTiempoRelativo(comentario.creado_en)}</span>
      </div>

      <p className='whitespace-pre-wrap break-words text-[13px] leading-relaxed text-neutral-100'>
        {comentario.eliminado ? (
          <span className='italic text-neutral-600'>
            {comentario.eliminado_por === 'moderacion'
              ? 'Comentario eliminado por moderación'
              : 'Comentario eliminado por el usuario'}
          </span>
        ) : (
          comentario.contenido
        )}
      </p>
    </div>
  );
}
