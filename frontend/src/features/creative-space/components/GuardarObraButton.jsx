import { useGuardar } from '@/shared/post/bookmarks/useGuardar';
import BookmarkIcon from '@/shared/post/bookmarks/BookmarkIcon';

export default function GuardarObraButton({ obra }) {
  const guardarMut = useGuardar('obra');
  const guardado = !!obra.esta_guardado;

  return (
    <button
      type='button'
      aria-pressed={guardado}
      disabled={guardarMut.isPending}
      onClick={(e) => {
        e.stopPropagation();
        guardarMut.mutate({ id: obra.id, guardar: !guardado });
      }}
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
