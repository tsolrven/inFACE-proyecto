import { useQuery } from '@tanstack/react-query';
import {
  listarTopColaboradores,
  listarHashtagsPopulares,
} from '@/shared/statistics/statistics.api';

// Las estadísticas cambian lento (votos y tags de 30-90 días): no vale la
// pena pedirlas cada vez que se entra a la página.
const FRESCURA_MS = 5 * 60_000;

export const estadisticasKeys = {
  top: (tipo, carreraId) => ['estadisticas', tipo, 'top', carreraId],
  tags: (tipo, carreraId) => ['estadisticas', tipo, 'tags', carreraId],
};

export function useTopColaboradores(tipo, carreraId) {
  return useQuery({
    queryKey: estadisticasKeys.top(tipo, carreraId),
    queryFn: () => listarTopColaboradores(tipo, carreraId),
    enabled: !!carreraId,
    staleTime: FRESCURA_MS,
  });
}

export function useHashtagsPopulares(tipo, carreraId) {
  return useQuery({
    queryKey: estadisticasKeys.tags(tipo, carreraId),
    queryFn: () => listarHashtagsPopulares(tipo, carreraId),
    enabled: !!carreraId,
    staleTime: FRESCURA_MS,
  });
}