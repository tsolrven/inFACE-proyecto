import { useAuthStore } from '@/shared/auth/authStore';
import { esStaff, puedeEditar, puedeEliminar } from '@/shared/auth/roles';
import BookmarkIcon from '@/shared/post/bookmarks/BookmarkIcon';
import PostActionsMenu from '@/shared/post/actions/PostActionsMenu';

export default function CommentActions({
  comentario,
  acciones,
  puedeResponder,
  onResponder,
  onEditar,
  onEliminar,
  onReportar,
}) {
  const usuario = useAuthStore((s) => s.usuario);
  const esAutor = puedeEditar(usuario, comentario.autor?.id);
  const puedeBorrar = puedeEliminar(usuario, comentario.autor?.id);
  const esModerador = esStaff(usuario?.rol);
  const guardado = comentario.esta_guardado;

  function votar(tipo) {
    acciones.votar.mutate({ id: comentario.id, tipo });
  }

  const items = [
    {
      key: 'guardar',
      label: guardado ? 'Quitar de guardados' : 'Guardar',
      icon: (
        <BookmarkIcon
          filled={guardado}
          className={`text-[13px] ${guardado ? 'text-white' : ''}`}
        />
      ),
      onClick: () =>
        acciones.guardar.mutate({ id: comentario.id, guardar: !guardado }),
    },
    {
      key: 'editar',
      label: 'Editar',
      icon: <i className='ti ti-edit text-[13px]' />,
      onClick: onEditar,
      hidden: !esAutor,
    },
    {
      key: 'eliminar',
      label: esAutor ? 'Eliminar' : 'Eliminar (moderación)',
      icon: <i className='ti ti-trash text-[13px]' />,
      onClick: onEliminar,
      danger: true,
      hidden: !puedeBorrar,
    },
    {
      key: 'reportar',
      label: 'Reportar',
      icon: <i className='ti ti-flag text-[13px]' />,
      onClick: onReportar,
      danger: true,
      hidden: esAutor || esModerador,
    },
  ];

  return (
    <div className='flex items-center gap-3'>
      <div className='flex items-center gap-1'>
        <button
          type='button'
          onClick={() => votar('up')}
          aria-label='Votar a favor'
          aria-pressed={comentario.mi_voto === 'up'}
          className={`flex items-center transition-colors hover:text-[#FF6B35] ${
            comentario.mi_voto === 'up' ? 'text-[#FF6B35]' : 'text-neutral-600'
          }`}
        >
          <i className='ti ti-arrow-big-up text-[13px]' />
        </button>
        <span className='min-w-[14px] text-center text-[11.5px] font-semibold text-neutral-400'>
          {comentario.votos_neto}
        </span>
        <button
          type='button'
          onClick={() => votar('down')}
          aria-label='Votar en contra'
          aria-pressed={comentario.mi_voto === 'down'}
          className={`flex items-center transition-colors hover:text-[#7B8CDE] ${
            comentario.mi_voto === 'down'
              ? 'text-[#7B8CDE]'
              : 'text-neutral-600'
          }`}
        >
          <i className='ti ti-arrow-big-down text-[13px]' />
        </button>
      </div>

      {puedeResponder && (
        <button
          type='button'
          onClick={onResponder}
          className='flex items-center gap-1 text-[11.5px] text-neutral-600 transition-colors hover:text-neutral-200'
        >
          <i className='ti ti-message-reply' /> Responder
        </button>
      )}

      {usuario && (
        <PostActionsMenu
          items={items}
          label='Más acciones del comentario'
        />
      )}
    </div>
  );
}
