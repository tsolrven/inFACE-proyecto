import { useInfiniteQuery } from '@tanstack/react-query';
import { listarGuardados } from '@/shared/post/bookmarks/bookmarks.api';

// Todas las claves empiezan con ['guardados', tipo]: así shared/post/cache.js
// las actualiza al guardar o quitar un contenido (también las de búsqueda).
export const guardadosKeys = {
  list: (tipo, padre = null, busqueda = '') => [
    'guardados',
    tipo,
    'list',
    padre,
    busqueda,
  ],
};

export function useGuardados(tipo, { padre, busqueda = '' } = {}) {
  return useInfiniteQuery({
    queryKey: guardadosKeys.list(tipo, padre, busqueda),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listarGuardados({ tipo, padre, busqueda, pagina: pageParam, signal }),
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
    // Al cambiar SOLO la búsqueda, se mantienen los resultados anteriores
    // mientras llegan los nuevos (sin parpadeo del spinner). Al cambiar de
    // pestaña (otro tipo o padre) NO: se dibujarían con la tarjeta equivocada.
    placeholderData: (anterior, consultaAnterior) => {
      const [, tipoAnterior, , padreAnterior] =
        consultaAnterior?.queryKey ?? [];
      return tipoAnterior === tipo && padreAnterior === (padre ?? null)
        ? anterior
        : undefined;
    },
  });
}