import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatearTiempoRelativo } from '../../shared/lib/formatRelativeTime';
import { alternarGuardadoComentario } from '../../shared/post/bookmarks/bookmarks.api';
import { mostrarToast } from '../../shared/stores/toastStore';

// Tipo de contenido -> ruta. Cuando exista el foro o los anuncios, se agrega una línea acá.
const RUTAS_CONTENIDO = {
  apunte: (id) => `/repositorio-materiales/${id}`,
};

export default function SavedCommentCard({ comentario, onQuitarDeGuardados }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [quitando, setQuitando] = useState(false);

  const padre = comentario.contenido_padre;

  function irAlPost() {
    const ruta = padre && RUTAS_CONTENIDO[padre.tipo_contenido];
    if (!ruta) return;
    navigate(ruta(padre.id), {
      state: { backgroundLocation: location },
    });
  }

  async function handleQuitar(e) {
    e.stopPropagation();
    setQuitando(true);
    try {
      await alternarGuardadoComentario(comentario.id);
      mostrarToast('Quitado de guardados');
      onQuitarDeGuardados?.(comentario.id);
    } catch {
      setQuitando(false);
    }
  }

  return (
    <div
      onClick={irAlPost}
      className={`mb-2 flex flex-col gap-1.5 rounded-[14px] border border-white/[0.06] bg-[#1E1E24] p-3 transition-colors hover:border-white/[0.12] ${
        padre ? 'cursor-pointer' : 'cursor-default opacity-70'
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
          disabled={quitando}
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

      <p className='text-[13px] leading-relaxed text-neutral-100'>
        {comentario.eliminado ? (
          <span className='italic text-neutral-600'>
            Comentario eliminado por el usuario
          </span>
        ) : (
          comentario.contenido
        )}
      </p>
    </div>
  );
}
