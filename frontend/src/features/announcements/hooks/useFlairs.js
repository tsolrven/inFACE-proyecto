import { useQuery } from '@tanstack/react-query';
import { listarFlairs } from '@/features/announcements/api/flairs.api';

export const flairKeys = {
  list: (carreraId) => ['flair', 'list', carreraId],
};

// Los flairs cambian poco: se reutilizan 5 minutos. Al crear, editar o eliminar
// uno (M3-7) se invalida esta clave.
export function useFlairs(carreraId) {
  return useQuery({
    queryKey: flairKeys.list(carreraId),
    queryFn: ({ signal }) => listarFlairs(carreraId, { signal }),
    enabled: !!carreraId,
    staleTime: 5 * 60 * 1000,
  });
}
