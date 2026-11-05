import PostActionsMenu from '@/shared/post/actions/PostActionsMenu';
import usePostMenuItems from '@/shared/post/actions/usePostMenuItems';
import { useAuthStore } from '@/shared/auth/authStore';
import { puedeEscribir } from '@/shared/auth/roles';

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
  const puedeVotar = puedeEscribir(usuario);
  const items = usePostMenuItems({
    autorId: comentario.autor?.id,
    guardado: comentario.esta_guardado,
    onGuardar: () =>
      acciones.guardar.mutate({
        id: comentario.id,
        guardar: !comentario.esta_guardado,
      }),
    onEditar,
    onEliminar,
    onReportar,
  });

  function votar(tipo) {
    acciones.votar.mutate({ id: comentario.id, tipo });
  }

  return (
    <div className='flex items-center gap-3'>
      <div className='flex items-center gap-1'>
        <button
          type='button'
          disabled={!puedeVotar}
          onClick={() => votar('up')}
          aria-label='Votar a favor'
          aria-pressed={comentario.mi_voto === 'up'}
          className={`flex items-center transition-colors enabled:hover:text-[#FF6B35] disabled:cursor-not-allowed disabled:opacity-50 ${comentario.mi_voto === 'up' ? 'text-[#FF6B35]' : 'text-neutral-600'
            }`}
        >
          <i className='ti ti-arrow-big-up text-[13px]' />
        </button>
        <span className='min-w-[14px] text-center text-[11.5px] font-semibold text-neutral-400'>
          {comentario.votos_neto}
        </span>
        <button
          type='button'
          disabled={!puedeVotar}
          onClick={() => votar('down')}
          aria-label='Votar en contra'
          aria-pressed={comentario.mi_voto === 'down'}
          className={`flex items-center transition-colors enabled:hover:text-[#7B8CDE] disabled:cursor-not-allowed disabled:opacity-50 ${
            comentario.mi_voto === 'down'
              ? 'text-[#7B8CDE]'
              : 'text-neutral-600'
          }`}
        >
          <i className='ti ti-arrow-big-down text-[13px]' />
        </button>
      </div>

      {puedeResponder && puedeEscribir(usuario) && (
        <button
          type='button'
          onClick={onResponder}
          className='flex items-center gap-1 text-[11.5px] text-neutral-600 transition-colors hover:text-neutral-200'
        >
          <i className='ti ti-message-reply' /> Responder
        </button>
      )}

      {acciones.extra?.(comentario)}

      <PostActionsMenu
        items={items}
        label='Más acciones del comentario'
      />
    </div>
  );
}
