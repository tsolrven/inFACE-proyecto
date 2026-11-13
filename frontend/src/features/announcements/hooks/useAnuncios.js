import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listarAnuncios,
  obtenerAnuncio,
  crearAnuncio,
  actualizarAnuncio,
  eliminarAnuncio,
} from '@/features/announcements/api/announcements.api';
import { sincronizarArchivos } from '@/shared/api/archivos.api';
import {
  buscarContenido,
  parchearContenido,
  quitarContenido,
} from '@/shared/post/cache';

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
    // al cambiar la búsqueda o un filtro se mantienen los resultados
    // anteriores mientras llegan los nuevos (sin parpadeo del spinner)
    placeholderData: keepPreviousData,
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
export function useCrearAnuncio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, archivos }) => crearAnuncio(payload, archivos),
    onSuccess: (anuncio) => {
      // la respuesta tiene la misma forma que el detalle
      qc.setQueryData(anuncioKeys.detail(anuncio.id), anuncio);
      qc.invalidateQueries({ queryKey: ['anuncio', 'list'] });
    },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// `quitar`: ids de archivos a eliminar. `nuevos`: File[] a subir.
// `payload` null = solo cambian los archivos (el PATCH marca "editado", así que
// no se llama si no cambió ningún campo). En el payload solo viajan los campos
// modificados; `flair_id: null` quita el flair.
// Devuelve { anuncio, fallos: { quitar, subir } }: cuántas operaciones de
// archivos fallaron (los campos ya quedaron guardados, ver orden abajo).
export function useEditarAnuncio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload = null, quitar = [], nuevos = [] }) => {
      // 1. Campos: si falla, no se toca nada más
      const actualizado = payload ? await actualizarAnuncio(id, payload) : null;

      // 2. Archivos: quitar ANTES de subir (ver sincronizarArchivos)
      const { fallidosQuitar, fallidosSubir } = await sincronizarArchivos(
        'anuncio',
        id,
        { quitar, nuevos },
      );

      // 3. Si cambiaron los archivos, la lista real se pide de nuevo.
      // Si esto falla no es grave: los cambios ya están guardados.
      let anuncio = actualizado;
      if (!actualizado || quitar.length > 0 || nuevos.length > 0) {
        try {
          anuncio = await obtenerAnuncio(id);
        } catch {
          // se recarga al invalidar (onSuccess)
        }
      }

      return {
        anuncio,
        fallos: { quitar: fallidosQuitar.length, subir: fallidosSubir.length },
      };
    },
    onSuccess: ({ anuncio }, { id, payload }) => {
      if (!anuncio) {
        qc.invalidateQueries({ queryKey: ['anuncio'] });
        return;
      }
      parchearContenido(qc, 'anuncio', id, anuncio);
      // un feed filtrado por flair podría quedar con un anuncio que ya no cumple
      if (payload && 'flair_id' in payload) {
        qc.invalidateQueries({ queryKey: ['anuncio', 'list'] });
      }
    },
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