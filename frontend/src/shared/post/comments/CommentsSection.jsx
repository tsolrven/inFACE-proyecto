import { useRef, useState } from 'react';
import { useComments } from '@/shared/post/comments/useComments';
import { useCommentActions } from '@/shared/post/comments/useCommentActions';
import useMaxIndent from '@/shared/post/comments/useMaxIndent';
import { buscarNodo } from '@/shared/post/comments/commentTree';
import CommentItem from '@/shared/post/comments/CommentItem';
import CommentComposer from '@/shared/post/comments/CommentComposer';
import CommentSortSelect from '@/shared/post/comments/CommentSortSelect';

export default function CommentsSection({
  tipoContenido,
  contenidoId,
  total = 0,
  titulo = 'Discusión y respuestas',
  placeholder = 'Escribe un comentario...',
  textoVacio = 'Todavía no hay comentarios. ¡Sé el primero en aportar!',
}) {
  const [orden, setOrden] = useState('mejores');
  const [focoId, setFocoId] = useState(null);
  const seccionRef = useRef(null);
  const maxIndent = useMaxIndent();

  const {
    data,
    isPending,
    isPlaceholderData,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useComments(tipoContenido, contenidoId, orden);
  const acciones = useCommentActions(tipoContenido, contenidoId, orden);

  const raices = data?.raices ?? [];
  // si el comentario enfocado desaparece (se eliminó), se vuelve a la lista
  const nodoFoco = focoId ? buscarNodo(raices, focoId) : null;

  function cambiarOrden(nuevoOrden) {
    setFocoId(null);
    setOrden(nuevoOrden);
  }

  function enfocar(id) {
    setFocoId(id);
    seccionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section
      ref={seccionRef}
      aria-label={titulo}
    >
      <h3 className='mb-4 flex items-center gap-1.5 text-sm font-semibold text-neutral-100'>
        <i className='ti ti-messages text-base text-pink-500' />
        {titulo} ({total})
      </h3>

      <div className='mb-4'>
        <CommentComposer
          placeholder={placeholder}
          pending={acciones.crear.isPending}
          onSubmit={(texto) => acciones.crear.mutateAsync({ contenido: texto })}
        />
      </div>

      {nodoFoco ? (
        <div>
          <button
            type='button'
            onClick={() => setFocoId(null)}
            className='mb-3 flex items-center gap-1 text-[12px] font-medium text-blue-400 hover:underline'
          >
            <i className='ti ti-arrow-left' /> Volver a todos los comentarios
          </button>
          <CommentItem
            key={nodoFoco.id}
            comentario={nodoFoco}
            acciones={acciones}
            profundidad={0}
            maxIndent={maxIndent}
            onEnfocar={enfocar}
          />
        </div>
      ) : (
        <>
          <div className='mb-4'>
            <CommentSortSelect
              value={orden}
              onChange={cambiarOrden}
            />
          </div>

          <div
            className={`flex flex-col gap-4 transition-opacity ${
              isPlaceholderData ? 'opacity-60' : ''
            }`}
          >
            {isPending && (
              <div className='flex items-center justify-center py-6 text-neutral-600'>
                <i className='ti ti-loader-2 animate-spin text-xl' />
              </div>
            )}

            {error && (
              <p className='text-center text-[12.5px] text-red-400'>
                {error.message}
              </p>
            )}

            {!isPending && !error && raices.length === 0 && (
              <p className='text-center text-[12.5px] text-neutral-600'>
                {textoVacio}
              </p>
            )}

            {raices.map((comentario) => (
              <CommentItem
                key={comentario.id}
                comentario={comentario}
                acciones={acciones}
                profundidad={0}
                maxIndent={maxIndent}
                onEnfocar={enfocar}
              />
            ))}

            {hasNextPage && (
              <button
                type='button'
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className='self-center rounded-full bg-white/[0.06] px-4 py-1.5 text-[12px] font-medium text-neutral-300 transition-colors hover:bg-white/[0.1] disabled:opacity-50'
              >
                {isFetchingNextPage ? 'Cargando...' : 'Cargar más comentarios'}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
