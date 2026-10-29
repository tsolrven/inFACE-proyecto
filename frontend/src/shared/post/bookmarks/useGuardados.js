import { useInfiniteQuery } from '@tanstack/react-query';
import { listarGuardados } from '@/shared/post/bookmarks/bookmarks.api';

// Todas las claves empiezan con ['guardados', tipo]: así shared/post/cache.js
// las actualiza al guardar o quitar un contenido.
export const guardadosKeys = {
  list: (tipo, padre = null) => ['guardados', tipo, 'list', padre],
};

export function useGuardados(tipo, { padre } = {}) {
  return useInfiniteQuery({
    queryKey: guardadosKeys.list(tipo, padre),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listarGuardados({ tipo, padre, pagina: pageParam, signal }),
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
  });
}
