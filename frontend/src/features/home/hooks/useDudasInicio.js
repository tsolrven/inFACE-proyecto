import { useQuery } from '@tanstack/react-query';
import { listarHilos } from '@/features/forum/api/forum.api';

// Dudas sin resolver del Inicio: los 4 hilos más recientes y el total (el
// número de la pestaña). Lo usan Inicio (contador) y PreviewDudas (lista):
// misma clave de caché, una sola petición.
export function useDudasInicio(alcance) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['inicio', 'dudas', alcance],
    queryFn: () =>
      listarHilos({
        estado: 'sin_resolver',
        orden: 'recientes',
        limite: 4,
        alcance,
      }),
    staleTime: 60 * 1000,
  });
  return {
    items: data?.hilos ?? [],
    total: data?.meta?.total ?? 0,
    cargando: isPending,
    error: isError,
  };
}