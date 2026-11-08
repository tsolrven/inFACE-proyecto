import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import BookmarkIcon from '@/shared/post/bookmarks/BookmarkIcon';

export default function GuardarProductoButton({
  producto,
  variante = 'pildora',
}) {
  const guardarMut = useGuardar('producto');
  const guardado = !!producto.esta_guardado;

  function alternar(e) {
    e.stopPropagation();
    guardarMut.mutate({ id: producto.id, guardar: !guardado });
  }

  if (variante === 'icono') {
    return (
      <button
        type='button'
        aria-pressed={guardado}
        aria-label={guardado ? 'Quitar de guardados' : 'Guardar producto'}
        title={guardado ? 'Quitar de guardados' : 'Guardar'}
        disabled={guardarMut.isPending}
        onClick={alternar}
        className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-colors ${
          guardado
            ? 'bg-pink-500 text-white'
            : 'bg-black/55 text-neutral-100 hover:bg-black/75'
        }`}
      >
        <BookmarkIcon
          filled={guardado}
          className='text-[14px]'
        />
      </button>
    );
  }

  return (
    <button
      type='button'
      aria-pressed={guardado}
      disabled={guardarMut.isPending}
      onClick={alternar}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-white/[0.1] ${
        guardado
          ? 'bg-pink-500/15 text-pink-300'
          : 'bg-white/[0.06] hover:text-neutral-200'
      }`}
    >
      <BookmarkIcon
        filled={guardado}
        className='text-[13px]'
      />
      {guardado ? 'Guardado' : 'Guardar'}
    </button>
  );
}
