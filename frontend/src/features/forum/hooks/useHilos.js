import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listarHilos,
  obtenerHilo,
  crearHilo,
  actualizarHilo,
  eliminarHilo,
  aceptarRespuesta,
  desmarcarRespuesta,
} from '@/features/forum/api/forum.api';
import { eliminarArchivo, subirArchivos } from '@/shared/api/archivos.api';
import { commentKeys } from '@/shared/post/comments/useComments';
import {
  buscarContenido,
  parchearContenido,
  quitarContenido,
} from '@/shared/post/cache';
import { mostrarToast } from '@/shared/stores/toastStore';

// La clave empieza con 'hilo': así votos y guardados (shared/post/cache.js)
// actualizan estas listas sin código extra.
export const hiloKeys = {
  list: (filtros) => ['hilo', 'list', filtros],
  detail: (id) => ['hilo', 'detail', id],
};

// Clave del árbol de la respuesta aceptada. Empieza con la clave de comentarios
// del hilo: votar, editar, responder y eliminar también la actualizan.
// Lleva el id del comentario: si se acepta otra, no se reutiliza la anterior.
export function claveRespuestaAceptada(hiloId, comentarioId) {
  return [...commentKeys.contenido('hilo', hiloId), 'aceptada', comentarioId];
}
// ────────────────────────────────────────────────────────────────────────────────────────
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
// ────────────────────────────────────────────────────────────────────────────────────────
export function useHilo(id) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: hiloKeys.detail(id),
    queryFn: ({ signal }) => obtenerHilo(id, { signal }),
    // al abrir desde la lista se muestra al instante lo que ya se conoce
    // (OJO: en la lista el contenido viene recortado, ver contenido_truncado)
    placeholderData: () => buscarContenido(qc, 'hilo', id) ?? undefined,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
const envolver = (raiz) => ({
  pages: [{ items: raiz ? [raiz] : [], meta: {} }],
  pageParams: [null],
});

// Devuelve el comentario raíz aceptado (con respuestas precargadas) o null.
// comentarioId null = no hay respuesta aceptada: la consulta no se hace.
export function useRespuestaAceptada(hiloId, comentarioId) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: claveRespuestaAceptada(hiloId, comentarioId),
    enabled: !!comentarioId,
    queryFn: async ({ signal }) => {
      const hilo = await obtenerHilo(hiloId, { signal });
      return envolver(hilo.respuesta_aceptada);
    },
    // el detalle del hilo ya trae este árbol: se aprovecha en la primera carga
    // (solo si es el mismo comentario que se pide)
    initialData: () => {
      const detalle = qc.getQueryData(hiloKeys.detail(hiloId));
      return detalle?.respuesta_aceptada?.id === comentarioId
        ? envolver(detalle.respuesta_aceptada)
        : undefined;
    },
    initialDataUpdatedAt: () =>
      qc.getQueryState(hiloKeys.detail(hiloId))?.dataUpdatedAt,
    select: (data) => data.pages[0].items[0] ?? null,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useCrearHilo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, archivos }) => crearHilo(payload, archivos),
    onSuccess: (hilo) => {
      // la respuesta tiene la misma forma que el detalle
      qc.setQueryData(hiloKeys.detail(hilo.id), hilo);
      qc.invalidateQueries({ queryKey: ['hilo', 'list'] });
    },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// `quitar`: ids de archivos a eliminar. `nuevos`: File[] a subir.
// Devuelve { hilo, fallos: { quitar, subir } }: cuántas operaciones de archivos
// fallaron (el texto ya quedó guardado, ver orden abajo).
export function useEditarHilo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload, quitar = [], nuevos = [] }) => {
      // 1. Texto: si falla, no se toca nada más
      const actualizado = await actualizarHilo(id, payload);

      // 2. Quitar ANTES de subir: el backend compara contra el máximo de archivos
      const resultadoQuitar = await Promise.allSettled(
        quitar.map((archivoId) => eliminarArchivo(archivoId)),
      );
      const fallosQuitar = resultadoQuitar.filter(
        (r) => r.status === 'rejected',
      ).length;

      // 3. Subir (secuencial)
      const { fallidos } =
        nuevos.length > 0
          ? await subirArchivos('hilo', id, nuevos)
          : { fallidos: [] };

      // 4. Si cambiaron los archivos, la lista real se pide de nuevo
      const hilo =
        quitar.length > 0 || nuevos.length > 0
          ? await obtenerHilo(id)
          : actualizado;

      return { hilo, fallos: { quitar: fallosQuitar, subir: fallidos.length } };
    },
    onSuccess: ({ hilo }, { id }) => {
      // el árbol de la respuesta aceptada no cambia al editar: no se copia a las listas
      const { respuesta_aceptada: _arbol, ...resto } = hilo;
      parchearContenido(qc, 'hilo', id, resto);
    },
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
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
// ────────────────────────────────────────────────────────────────────────────────────────
export function useAceptarRespuesta(hiloId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comentarioId) => aceptarRespuesta(hiloId, comentarioId),
    onSuccess: ({ respuesta_aceptada_id, resuelto }) => {
      // el detalle y la lista (chip "Resuelto") se actualizan juntos; el árbol
      // de la nueva respuesta se pide solo, porque su clave es nueva
      parchearContenido(qc, 'hilo', hiloId, {
        respuesta_aceptada_id,
        resuelto,
      });
    },
    onError: (err) =>
      mostrarToast(err.message || 'No se pudo marcar la respuesta'),
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useDesmarcarRespuesta(hiloId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => desmarcarRespuesta(hiloId),
    onSuccess: ({ respuesta_aceptada_id, resuelto }) => {
      parchearContenido(qc, 'hilo', hiloId, {
        respuesta_aceptada_id,
        resuelto,
      });
      // el comentario vuelve a la lista normal: se recarga la lista activa
      qc.invalidateQueries({ queryKey: commentKeys.contenido('hilo', hiloId) });
    },
    onError: (err) =>
      mostrarToast(err.message || 'No se pudo desmarcar la respuesta'),
  });
}
