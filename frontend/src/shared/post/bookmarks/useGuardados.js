import { useInfiniteQuery } from '@tanstack/react-query';
import { listarGuardados } from '@/shared/post/bookmarks/bookmarks.api';

export const guardadosKeys = {
  list: (tipo) => ['guardados', tipo, 'list'],
};

export function useGuardados(tipo) {
  return useInfiniteQuery({
    queryKey: guardadosKeys.list(tipo),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listarGuardados({ tipo, pagina: pageParam, signal }),
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
  });
}
