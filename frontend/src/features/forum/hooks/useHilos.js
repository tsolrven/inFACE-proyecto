import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { listarHilos, eliminarHilo } from '@/features/forum/api/forum.api';
import { quitarContenido } from '@/shared/post/cache';

// La clave empieza con 'hilo': así votos y guardados (shared/post/cache.js)
// actualizan estas listas sin código extra.
export const hiloKeys = {
  list: (filtros) => ['hilo', 'list', filtros],
  detail: (id) => ['hilo', 'detail', id],
};

export function useHilosFeed(filtros) {
  return useInfiniteQuery({
    queryKey: hiloKeys.list(filtros),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { hilos, meta } = await listarHilos({
        ...filtros,
        pagina: pageParam,
        signal,
      });
      return { items: hilos, meta };
    },
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
  });
}

export function useEliminarHilo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => eliminarHilo(id),
    onSuccess: (_data, id) => {
      quitarContenido(qc, 'hilo', id);
      qc.invalidateQueries({
        queryKey: hiloKeys.detail(id),
        refetchType: 'none',
      });
      qc.invalidateQueries({ queryKey: ['guardados', 'hilo'] });
    },
  });
}
