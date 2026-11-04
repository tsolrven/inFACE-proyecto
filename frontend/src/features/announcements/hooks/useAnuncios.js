import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listarAnuncios,
  obtenerAnuncio,
  eliminarAnuncio,
} from '@/features/announcements/api/announcements.api';
import { buscarContenido, quitarContenido } from '@/shared/post/cache';

// Las claves empiezan con 'anuncio': así votos y guardados (shared/post/cache.js)
// actualizan listas y detalle sin código extra.
export const anuncioKeys = {
  list: (filtros) => ['anuncio', 'list', filtros],
  detail: (id) => ['anuncio', 'detail', id],
};
// ────────────────────────────────────────────────────────────────────────────────────────
export function useAnunciosFeed(filtros) {
  return useInfiniteQuery({
    queryKey: anuncioKeys.list(filtros),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { anuncios, meta } = await listarAnuncios({
        ...filtros,
        pagina: pageParam,
        signal,
      });
      return { items: anuncios, meta };
    },
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useAnuncio(id) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: anuncioKeys.detail(id),
    queryFn: ({ signal }) => obtenerAnuncio(id, { signal }),
    // al abrir desde la lista se muestra al instante lo que ya se conoce
    // (OJO: en la lista el contenido viene recortado, ver contenido_truncado)
    placeholderData: () => buscarContenido(qc, 'anuncio', id) ?? undefined,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useEliminarAnuncio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => eliminarAnuncio(id),
    onSuccess: (_data, id) => {
      quitarContenido(qc, 'anuncio', id);
      qc.invalidateQueries({
        queryKey: anuncioKeys.detail(id),
        refetchType: 'none',
      });
      qc.invalidateQueries({ queryKey: ['guardados', 'anuncio'] });
    },
  });
}