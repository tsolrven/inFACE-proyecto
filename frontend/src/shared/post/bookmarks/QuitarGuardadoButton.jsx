import { useGuardar } from '@/shared/post/bookmarks/useGuardar';

// Marcador "Quitar de guardados" para las tarjetas de las listas de Guardados.
// tipo: 'apunte' | 'hilo' | 'comentario'
export default function QuitarGuardadoButton({ tipo, id, className = '' }) {
  const guardarMut = useGuardar(tipo);

  function handleQuitar(e) {
    e.stopPropagation(); // la tarjeta completa abre el detalle
    guardarMut.mutate({ id, guardar: false });
  }

  return (
    <button
      type='button'
      onClick={handleQuitar}
      disabled={guardarMut.isPending}
      title='Quitar de guardados'
      aria-label='Quitar de guardados'
      className={`flex-shrink-0 text-neutral-600 transition-colors hover:text-pink-400 disabled:opacity-50 ${className}`}
    >
      <i className='ti ti-bookmark-off text-[14px]' />
    </button>
  );
}
