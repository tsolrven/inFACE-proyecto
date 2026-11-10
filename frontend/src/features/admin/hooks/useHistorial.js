import { useInfiniteQuery } from '@tanstack/react-query';
import { listarHistorial } from '@/features/admin/api/historial.api';

export const historialKeys = {
  lista: (filtros) => ['admin', 'historial', filtros],
};
// ────────────────────────────────────────────────────────────────────────────────────────
export function useHistorial(filtros) {
  return useInfiniteQuery({
    queryKey: historialKeys.lista(filtros),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listarHistorial({ ...filtros, pagina: pageParam, signal }),
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
    staleTime: 0,
  });
}