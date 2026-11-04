import { useInfiniteQuery } from '@tanstack/react-query';
import { listarAnuncios } from '@/features/announcements/api/announcements.api';

// La clave empieza con 'anuncio': así votos y guardados (shared/post/cache.js)
// actualizan estas listas sin código extra.
export const anuncioKeys = {
  list: (filtros) => ['anuncio', 'list', filtros],
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
