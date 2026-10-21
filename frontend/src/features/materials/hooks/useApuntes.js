import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listarApuntes,
  obtenerApunte,
  actualizarApunte,
  eliminarApunte,
} from '@/features/materials/api/materials.api';
import {
  buscarContenido,
  parchearContenido,
  quitarContenido,
} from '@/shared/post/cache';

export const apunteKeys = {
  list: (filtros) => ['apunte', 'list', filtros],
  detail: (id) => ['apunte', 'detail', id],
};

export function useApuntesFeed(filtros) {
  return useInfiniteQuery({
    queryKey: apunteKeys.list(filtros),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { apuntes, meta } = await listarApuntes({
        ...filtros,
        pagina: pageParam,
        signal,
      });
      return { items: apuntes, meta };
    },
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
  });
}

export function useApunte(id) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: apunteKeys.detail(id),
    queryFn: ({ signal }) => obtenerApunte(id, { signal }),
    // al abrir desde el feed se muestra al instante lo que ya se conoce
    placeholderData: () => buscarContenido(qc, 'apunte', id) ?? undefined,
  });
}

export function useEditarApunte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => actualizarApunte(id, payload),
    onSuccess: (actualizado, { id }) => {
      parchearContenido(qc, 'apunte', id, actualizado);
    },
  });
}

export function useEliminarApunte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => eliminarApunte(id),
    onSuccess: (_data, id) => {
      quitarContenido(qc, 'apunte', id);
      // marca el detalle como viejo sin pedirlo de nuevo
      qc.invalidateQueries({
        queryKey: apunteKeys.detail(id),
        refetchType: 'none',
      });
      qc.invalidateQueries({ queryKey: ['guardados', 'apunte'] });
    },
  });
}
