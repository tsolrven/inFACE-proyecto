import { useRef, useState } from 'react';
import { useComments } from '@/shared/post/comments/useComments';
import { useCommentActions } from '@/shared/post/comments/useCommentActions';
import useMaxIndent from '@/shared/post/comments/useMaxIndent';
import { buscarNodo } from '@/shared/post/comments/commentTree';
import CommentItem from '@/shared/post/comments/CommentItem';
import CommentComposer from '@/shared/post/comments/CommentComposer';
import CommentSortSelect from '@/shared/post/comments/CommentSortSelect';

/**
 * Props opcionales (el contenido que no las usa funciona como siempre):
 * - fijado: { raiz, clave, encabezado } un comentario raíz destacado arriba (ej:
 *   respuesta aceptada). `raiz` puede ser null mientras carga; `clave` es la
 *   clave de caché donde vive su árbol; no se repite en la lista normal.
 * - accionExtra: (comentario) => nodo, botón extra junto a "Responder".
 * - alEliminarComentario: (comentarioId, resultado) tras eliminar con éxito.
 */
export default function CommentsSection({
  tipoContenido,
  contenidoId,
  total = 0,
  titulo = 'Discusión y respuestas',
  placeholder = 'Escribe un comentario...',
  textoVacio = 'Todavía no hay comentarios. ¡Sé el primero en aportar!',
  fijado = null,
  accionExtra,
  alEliminarComentario,
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

  const base = useCommentActions(tipoContenido, contenidoId, orden, {
    claveFijado: fijado?.clave,
    alEliminar: alEliminarComentario,
  });
  const acciones = { ...base, extra: accionExtra };
  const accionesFijado = {
    ...acciones,
    masRespuestas: base.masRespuestasFijado,
  };

  const raizFijada = fijado?.raiz ?? null;
  // el fijado se muestra arriba: no se repite en la lista normal
  const raices = (data?.raices ?? []).filter((r) => r.id !== raizFijada?.id);

  // si el comentario enfocado desaparece (se eliminó), se vuelve a la lista
  const foco = focoId
    ? raizFijada && buscarNodo([raizFijada], focoId)
      ? { nodo: buscarNodo([raizFijada], focoId), acciones: accionesFijado }
      : { nodo: buscarNodo(raices, focoId), acciones }
    : null;
  const nodoFoco = foco?.nodo ?? null;

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
            acciones={foco.acciones}
            profundidad={0}
            maxIndent={maxIndent}
            onEnfocar={enfocar}
          />
        </div>
      ) : (
        <>
          {raizFijada && (
            <div className='mb-4 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.04] p-3'>
              {fijado.encabezado}
              <CommentItem
                key={raizFijada.id}
                comentario={raizFijada}
                acciones={accionesFijado}
                profundidad={0}
                maxIndent={maxIndent}
                onEnfocar={enfocar}
              />
            </div>
          )}

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

            {!isPending && !error && raices.length === 0 && !raizFijada && (
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
