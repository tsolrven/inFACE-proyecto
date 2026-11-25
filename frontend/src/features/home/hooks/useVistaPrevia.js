import { useQuery } from '@tanstack/react-query';

// Datos de una sección del Inicio, con caché: volver al Inicio dentro del
// minuto no repite la petición. Las claves van bajo 'inicio' para no mezclarse
// con las de los feeds de cada módulo.
export function useVistaPrevia(clave, cargar, { enabled = true } = {}) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['inicio', ...clave],
    queryFn: cargar,
    enabled,
    staleTime: 60 * 1000,
  });
  return {
    items: data ?? [],
    cargando: enabled && isPending,
    error: isError,
  };
}