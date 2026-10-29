import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  commentKeys,
  useComentarioContexto,
  useComments,
  useMasRespuestas,
} from '@/shared/post/comments/useComments';
import { useCommentActions } from '@/shared/post/comments/useCommentActions';
import useMaxIndent from '@/shared/post/comments/useMaxIndent';
import { buscarNodo } from '@/shared/post/comments/commentTree';
import CommentItem from '@/shared/post/comments/CommentItem';
import CommentComposer from '@/shared/post/comments/CommentComposer';
import CommentSortSelect from '@/shared/post/comments/CommentSortSelect';
import { mostrarToast } from '@/shared/stores/toastStore';

// Al abrir un enlace a un comentario (?comentario=ID) se muestran hasta tantos
// ancestros por encima, y el resaltado dura este tiempo.
const ANCESTROS_VISIBLES = 2;
const MS_RESALTADO = 4000;

/**
 * Props opcionales (el contenido que no las usa funciona como siempre):
 * - fijado: { raiz, clave, encabezado } un comentario raíz destacado arriba (ej:
 *   respuesta aceptada). `raiz` puede ser null mientras carga; `clave` es la
 *   clave de caché donde vive su árbol; no se repite en la lista normal.
 * - accionExtra: (comentario) => nodo, botón extra junto a "Responder".
 * - alEliminarComentario: (comentarioId, resultado) tras eliminar con éxito.
 *
 * Si la URL trae ?comentario=ID, se muestra ese comentario con su contexto
 * (como el enlace permanente de Reddit) en lugar de la lista.
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
  const [resaltadoApagadoId, setResaltadoApagadoId] = useState(null);
  const seccionRef = useRef(null);
  const avisadoRef = useRef(null);
  const maxIndent = useMaxIndent();

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const objetivoId = searchParams.get('comentario');

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

  // ── comentario enlazado (?comentario=ID) ──────────────────────────────────
  const contexto = useComentarioContexto(
    tipoContenido,
    contenidoId,
    objetivoId,
  );
  // las respuestas del contexto se guardan en SU caché, siempre en orden 'mejores'
  const masRespuestasContexto = useMasRespuestas(
    tipoContenido,
    contenidoId,
    'mejores',
    objetivoId
      ? commentKeys.contexto(tipoContenido, contenidoId, objetivoId)
      : undefined,
  );
  const accionesContexto = {
    ...acciones,
    masRespuestas: masRespuestasContexto,
  };

  const datosContexto = contexto.data ?? null;
  // el comentario debe pertenecer a ESTA publicación
  const contextoValido =
    !!datosContexto?.raiz &&
    datosContexto.contenido.tipo_contenido === tipoContenido &&
    datosContexto.contenido.contenido_id === contenidoId;
  const raizContexto = contextoValido ? datosContexto.raiz : null;

  // se parte unos ancestros más arriba del comentario, no desde la raíz de la conversación
  let nodoInicio = null;
  if (raizContexto) {
    const { ruta } = datosContexto;
    const ancestros = Math.min(ANCESTROS_VISIBLES, maxIndent - 1);
    const desde = Math.max(0, ruta.length - 1 - ancestros);
    nodoInicio =
      desde === 0 ? raizContexto : buscarNodo([raizContexto], ruta[desde]);
  }
  const inicioId = nodoInicio?.id ?? null;
  const resaltadoId =
    objetivoId && resaltadoApagadoId !== objetivoId ? objetivoId : null;

  // quita ?comentario=ID conservando location.state: sin él se pierde el
  // backgroundLocation y el modal se convertiría en página completa
  const salirDelContexto = useCallback(() => {
    setSearchParams(
      (prev) => {
        const siguiente = new URLSearchParams(prev);
        siguiente.delete('comentario');
        return siguiente;
      },
      { replace: true, state: location.state },
    );
  }, [setSearchParams, location.state]);

  // comentario inexistente, eliminado o de otra publicación: aviso y lista normal
  useEffect(() => {
    if (!objetivoId || contexto.isPending) return;
    if (!contexto.isError && contextoValido) return;
    if (avisadoRef.current !== objetivoId) {
      avisadoRef.current = objetivoId;
      mostrarToast('Ese comentario ya no está disponible');
    }
    salirDelContexto();
  }, [
    objetivoId,
    contexto.isPending,
    contexto.isError,
    contextoValido,
    salirDelContexto,
  ]);

  // se centra el comentario en pantalla y se apaga el resaltado al rato
  useEffect(() => {
    if (!objetivoId || !inicioId) return;
    const idScroll = setTimeout(() => {
      seccionRef.current
        ?.querySelector(`[data-comentario-id="${CSS.escape(objetivoId)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    const idApagar = setTimeout(
      () => setResaltadoApagadoId(objetivoId),
      MS_RESALTADO,
    );
    return () => {
      clearTimeout(idScroll);
      clearTimeout(idApagar);
    };
  }, [objetivoId, inicioId]);

  // ── lista normal ──────────────────────────────────────────────────────────
  const raizFijada = fijado?.raiz ?? null;
  // el fijado se muestra arriba: no se repite en la lista normal
  const raices = (data?.raices ?? []).filter((r) => r.id !== raizFijada?.id);

  // si el comentario enfocado desaparece (se eliminó), se vuelve a la lista
  function buscarFoco() {
    if (!focoId) return null;
    if (raizContexto) {
      const nodo = buscarNodo([raizContexto], focoId);
      if (nodo) return { nodo, acciones: accionesContexto };
    }
    if (raizFijada) {
      const nodo = buscarNodo([raizFijada], focoId);
      if (nodo) return { nodo, acciones: accionesFijado };
    }
    const nodo = buscarNodo(raices, focoId);
    return nodo ? { nodo, acciones } : null;
  }
  const foco = buscarFoco();
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

      {objetivoId && !nodoFoco ? (
        <div>
          <div className='mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-pink-500/25 bg-pink-500/[0.05] px-3 py-2 text-[12px] text-neutral-300'>
            <span className='flex items-center gap-1.5'>
              <i className='ti ti-link text-pink-400' />
              Estás viendo un comentario de esta conversación
            </span>
            <button
              type='button'
              onClick={salirDelContexto}
              className='font-medium text-blue-400 hover:underline'
            >
              Ver todos los comentarios
            </button>
          </div>

          {contexto.isPending && (
            <div className='flex items-center justify-center py-6 text-neutral-600'>
              <i className='ti ti-loader-2 animate-spin text-xl' />
            </div>
          )}

          {nodoInicio && (
            <CommentItem
              key={nodoInicio.id}
              comentario={nodoInicio}
              acciones={accionesContexto}
              profundidad={0}
              maxIndent={maxIndent}
              onEnfocar={enfocar}
              resaltadoId={resaltadoId}
            />
          )}
        </div>
      ) : nodoFoco ? (
        <div>
          <button
            type='button'
            onClick={() => setFocoId(null)}
            className='mb-3 flex items-center gap-1 text-[12px] font-medium text-blue-400 hover:underline'
          >
            <i className='ti ti-arrow-left' />{' '}
            {objetivoId
              ? 'Volver al comentario'
              : 'Volver a todos los comentarios'}
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
