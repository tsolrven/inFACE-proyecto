import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '@/features/marketplace/api/marketplace.api';
import { sincronizarArchivos } from '@/shared/api/archivos.api';
import {
  buscarContenido,
  parchearContenido,
  quitarContenido,
} from '@/shared/post/cache';

export const productoKeys = {
  list: (filtros) => ['producto', 'list', filtros],
  detail: (id) => ['producto', 'detail', id],
};
// ────────────────────────────────────────────────────────────────────────────────────────
export function useProductosFeed(filtros, { enabled = true } = {}) {
  return useInfiniteQuery({
    enabled,
    queryKey: productoKeys.list(filtros),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { productos, meta } = await listarProductos({
        ...filtros,
        pagina: pageParam,
        signal,
      });
      return { items: productos, meta };
    },
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useTotalProductos(usuarioId) {
  return useQuery({
    queryKey: ['producto', 'total', usuarioId],
    queryFn: async ({ signal }) => {
      const { meta } = await listarProductos({
        vendedor_id: usuarioId,
        limite: 1,
        signal,
      });
      return meta?.total ?? 0;
    },
    enabled: !!usuarioId,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useProducto(id) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: productoKeys.detail(id),
    queryFn: ({ signal }) => obtenerProducto(id, { signal }),
    placeholderData: () => buscarContenido(qc, 'producto', id) ?? undefined,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useCrearProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, fotos }) => crearProducto(payload, fotos),
    onSuccess: (producto) => {
      qc.setQueryData(productoKeys.detail(producto.id), producto);
      qc.invalidateQueries({ queryKey: ['producto', 'list'] });
    },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useEditarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload = null, quitar = [], nuevos = [] }) => {
      const { fallidosQuitar, fallidosSubir } = await sincronizarArchivos(
        'producto',
        id,
        { quitar, nuevos, subirPrimero: true },
      );
      const actualizado = payload
        ? await actualizarProducto(id, payload)
        : null;

      let producto = actualizado;
      if (!actualizado || quitar.length > 0 || nuevos.length > 0) {
        try {
          producto = await obtenerProducto(id);
        } catch {
        }
      }
      return {
        producto,
        fallos: { quitar: fallidosQuitar.length, subir: fallidosSubir.length },
      };
    },
    onSuccess: ({ producto }, { id }) => {
      if (!producto) {
        qc.invalidateQueries({ queryKey: ['producto'] });
        return;
      }
      parchearContenido(qc, 'producto', id, producto);
    },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useCambiarEstado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }) => actualizarProducto(id, { estado }),
    onSuccess: (producto, { id }) => {
      parchearContenido(qc, 'producto', id, producto);
    },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useEliminarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => eliminarProducto(id),
    onSuccess: (_data, id) => {
      quitarContenido(qc, 'producto', id);
      qc.invalidateQueries({
        queryKey: productoKeys.detail(id),
        refetchType: 'none',
      });
      qc.invalidateQueries({ queryKey: ['guardados', 'producto'] });
    },
  });
}