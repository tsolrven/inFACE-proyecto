import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listarComentarios,
  listarRespuestas,
} from '@/shared/post/comments/comments.api';
import {
  aplanarRaices,
  fusionarRespuestas,
} from '@/shared/post/comments/commentTree';
import { mostrarToast } from '@/shared/stores/toastStore';

// La clave empieza con 'comentario': así useVotar('comentario') y
// useGuardar('comentario') (shared/post/cache.js) también actualizan este árbol.
export const commentKeys = {
  contenido: (tipoContenido, contenidoId) => [
    'comentario',
    'list',
    tipoContenido,
    contenidoId,
  ],
  list: (tipoContenido, contenidoId, orden) => [
    ...commentKeys.contenido(tipoContenido, contenidoId),
    orden,
  ],
};

// función fuera del hook para que TanStack Query pueda memoizar el resultado
const seleccionarRaices = (data) => ({ ...data, raices: aplanarRaices(data) });
// ────────────────────────────────────────────────────────────────────────────────────────
export function useComments(tipoContenido, contenidoId, orden) {
  return useInfiniteQuery({
    queryKey: commentKeys.list(tipoContenido, contenidoId, orden),
    initialPageParam: null,
    queryFn: ({ pageParam, signal }) =>
      listarComentarios({
        tipoContenido,
        contenidoId,
        orden,
        cursor: pageParam ?? undefined,
        signal,
      }),
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.nextCursor : undefined,
    // al cambiar de orden se sigue viendo la lista anterior mientras llega la nueva
    placeholderData: keepPreviousData,
    select: seleccionarRaices,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useMasRespuestas(
  tipoContenido,
  contenidoId,
  orden,
  // dónde se guardan las respuestas que llegan; por defecto, la lista principal
  claveCache = commentKeys.list(tipoContenido, contenidoId, orden),
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ comentarioId, cursor }) =>
      listarRespuestas({ comentarioId, orden, cursor }),

    onSuccess: ({ items, meta }, { comentarioId }) => {
      qc.setQueryData(claveCache, (data) =>
        fusionarRespuestas(data, comentarioId, items, meta.nextCursor),
      );
    },

    onError: (err) =>
      mostrarToast(err.message || 'No se pudieron cargar las respuestas'),
  });
}