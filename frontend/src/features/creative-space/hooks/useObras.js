import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listarObras,
  obtenerObra,
  crearObra,
  actualizarObra,
  eliminarObra,
  obtenerHashtagsPopulares,
  obtenerComentariosParrafos,
} from '@/features/creative-space/api/creative.api';
import { sincronizarArchivos } from '@/shared/api/archivos.api';
import {
  buscarContenido,
  parchearContenido,
  quitarContenido,
} from '@/shared/post/cache';

export const obraKeys = {
  list: (filtros) => ['obra', 'list', filtros],
  detail: (id) => ['obra', 'detail', id],
};
// ────────────────────────────────────────────────────────────────────────────────────────
export function useObrasFeed(filtros) {
  return useInfiniteQuery({
    queryKey: obraKeys.list(filtros),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { obras, meta } = await listarObras({
        ...filtros,
        pagina: pageParam,
        signal,
      });
      return { items: obras, meta };
    },
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useTotalObras(usuarioId) {
  return useQuery({
    queryKey: ['obra', 'total', usuarioId],
    queryFn: async ({ signal }) => {
      const { meta } = await listarObras({
        autor_id: usuarioId,
        limite: 1,
        signal,
      });
      return meta?.total ?? 0;
    },
    enabled: !!usuarioId,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useObra(id) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: obraKeys.detail(id),
    queryFn: ({ signal }) => obtenerObra(id, { signal }),
    placeholderData: () => buscarContenido(qc, 'obra', id) ?? undefined,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useHashtagsPopulares() {
  return useQuery({
    queryKey: ['obra', 'hashtags'],
    queryFn: ({ signal }) => obtenerHashtagsPopulares({ signal }),
    staleTime: 60_000,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useComentariosParrafos(obraId, enabled = true) {
  return useQuery({
    queryKey: ['obra', 'comentarios-parrafos', obraId],
    queryFn: ({ signal }) => obtenerComentariosParrafos(obraId, { signal }),
    enabled,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useCrearObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, archivos }) => crearObra(payload, archivos),
    onSuccess: (obra) => {
      qc.setQueryData(obraKeys.detail(obra.id), obra);
      qc.invalidateQueries({ queryKey: ['obra', 'list'] });
    },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useEditarObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload = null, quitar = [], nuevos = [] }) => {
      const { fallidosQuitar, fallidosSubir } = await sincronizarArchivos(
        'obra',
        id,
        { quitar, nuevos },
      );
      const actualizada = payload ? await actualizarObra(id, payload) : null;

      let obra = actualizada;
      if (!actualizada || quitar.length > 0 || nuevos.length > 0) {
        try {
          obra = await obtenerObra(id);
        } catch {
        }
      }
      return {
        obra,
        fallos: { quitar: fallidosQuitar.length, subir: fallidosSubir.length },
      };
    },
    onSuccess: ({ obra }, { id }) => {
      if (!obra) {
        qc.invalidateQueries({ queryKey: ['obra'] });
        return;
      }
      parchearContenido(qc, 'obra', id, obra);
    },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useEliminarObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => eliminarObra(id),
    onSuccess: (_data, id) => {
      quitarContenido(qc, 'obra', id);
      qc.invalidateQueries({
        queryKey: obraKeys.detail(id),
        refetchType: 'none',
      });
      qc.invalidateQueries({ queryKey: ['guardados', 'obra'] });
    },
  });
}