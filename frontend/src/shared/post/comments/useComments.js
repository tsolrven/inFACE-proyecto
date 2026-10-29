import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listarComentarios,
  listarRespuestas,
  obtenerContextoComentario,
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
  // El contexto vive bajo el prefijo del contenido: crear, editar, votar o
  // eliminar comentarios también lo actualizan (igual que la respuesta aceptada).
  contexto: (tipoContenido, contenidoId, comentarioId) => [
    ...commentKeys.contenido(tipoContenido, contenidoId),
    'contexto',
    comentarioId,
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
// El árbol se guarda con la misma forma que las listas ({ pages: [{ items, meta }] })
// para que useMasRespuestas y las mutaciones lo actualicen sin código especial.
// Se busca la raíz por id, no por posición: crear un comentario raíz inserta
// elementos al principio de toda consulta con este prefijo de clave.
const seleccionarContexto = (data) => {
  const { items, meta } = data.pages[0];
  return {
    raiz: items.find((c) => c.id === meta.ruta[0]) ?? null,
    ruta: meta.ruta,
    contenido: meta.contenido,
  };
};

export function useComentarioContexto(
  tipoContenido,
  contenidoId,
  comentarioId,
) {
  return useQuery({
    queryKey: commentKeys.contexto(tipoContenido, contenidoId, comentarioId),
    enabled: !!comentarioId,
    retry: false, // un 404 no mejora al reintentar
    queryFn: async ({ signal }) => {
      const { raiz, ruta, contenido } = await obtenerContextoComentario({
        comentarioId,
        signal,
      });
      return {
        pages: [{ items: raiz ? [raiz] : [], meta: { ruta, contenido } }],
        pageParams: [null],
      };
    },
    select: seleccionarContexto,
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
