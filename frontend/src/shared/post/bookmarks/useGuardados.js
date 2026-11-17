import { useInfiniteQuery } from '@tanstack/react-query';
import { listarGuardados } from '@/shared/post/bookmarks/bookmarks.api';

// Todas las claves empiezan con ['guardados', tipo]: así shared/post/cache.js
// las actualiza al guardar o quitar un contenido (también las filtradas).
export const guardadosKeys = {
  list: (tipo, padre = null, busqueda = '', carreraId = null) => [
    'guardados',
    tipo,
    'list',
    padre,
    busqueda,
    carreraId,
  ],
};

export function useGuardados(
  tipo,
  { padre, busqueda = '', carreraId = null } = {},
) {
  return useInfiniteQuery({
    queryKey: guardadosKeys.list(tipo, padre, busqueda, carreraId),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listarGuardados({
        tipo,
        padre,
        busqueda,
        carreraId,
        pagina: pageParam,
        signal,
      }),
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