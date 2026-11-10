import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  listarSolicitudesAdmin,
  obtenerSolicitudAdmin,
} from '@/features/admin/api/solicitudes.api';

// La raíz 'solicitudCargo' es la misma de «Mis solicitudes» del estudiante:
// una invalidación por ['solicitudCargo'] alcanza también a Administración.
export const solicitudesAdminKeys = {
  lista: (filtros) => ['solicitudCargo', 'admin', 'lista', filtros],
  detalle: (id) => ['solicitudCargo', 'admin', 'detalle', id],
};
// ────────────────────────────────────────────────────────────────────────────────────────
export function useColaSolicitudes(filtros) {
  return useInfiniteQuery({
    queryKey: solicitudesAdminKeys.lista(filtros),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listarSolicitudesAdmin({ ...filtros, pagina: pageParam, signal }),
    getNextPageParam: (ultima) =>
      ultima.meta?.hasNext ? ultima.meta.page + 1 : undefined,
    staleTime: 0,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useSolicitudAdmin(id) {
  return useQuery({
    queryKey: solicitudesAdminKeys.detalle(id),
    queryFn: ({ signal }) => obtenerSolicitudAdmin(id, { signal }),
    enabled: !!id,
    staleTime: 0,
  });
}