import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { listarActividad } from '@/shared/post/activity/actividad.api';

// La clave empieza con el tipo de lo que se lista ('hilo', 'apunte', 'anuncio'
// o 'comentario'): así shared/post/cache.js actualiza estas listas al votar,
// guardar o eliminar, igual que los feeds.
export const actividadKeys = {
  lista: (tipo, lista, usuarioId, carreraId) => [
    lista === 'comentarios' ? 'comentario' : tipo,
    'actividad',
    tipo,
    lista,
    usuarioId,
    carreraId ?? null,
  ],
};

export function useActividad({ usuarioId, tipo, lista, carreraId }) {
  return useInfiniteQuery({
    queryKey: actividadKeys.lista(tipo, lista, usuarioId, carreraId),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listarActividad({
        usuarioId,
        tipo,
        lista,
        carreraId,
        pagina: pageParam,
        signal,
      }),
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
    enabled: !!usuarioId,
  });
}

// Total de publicaciones de una persona en un módulo (cifras del perfil).
// Pide una sola fila: basta con meta.total. Clave con prefijo de tipo: al
// publicar o eliminar, las invalidaciones del módulo la refrescan.
export function useTotalPublicaciones(usuarioId, tipo) {
  return useQuery({
    queryKey: [tipo, 'actividad', 'total', usuarioId],
    queryFn: async ({ signal }) => {
      const { meta } = await listarActividad({
        usuarioId,
        tipo,
        lista: 'publicaciones',
        limite: 1,
        signal,
      });
      return meta?.total ?? 0;
    },
    enabled: !!usuarioId,
  });
}