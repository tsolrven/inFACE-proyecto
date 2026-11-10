import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  listarSolicitudesAdmin,
  aprobarSolicitud,
  obtenerSolicitudAdmin,
  rechazarSolicitud,
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

// ────────────────────────────────────────────────────────────────────────────────────────
// Resolver una solicitud cambia varias pantallas: la cola, el detalle, la ficha
// del solicitante (sus cargos) y el historial de acciones.
function invalidarTrasResolver(qc) {
  qc.invalidateQueries({ queryKey: ['solicitudCargo'] });
  qc.invalidateQueries({ queryKey: ['usuario'] });
  qc.invalidateQueries({ queryKey: ['admin', 'historial'] });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useAprobarSolicitud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => aprobarSolicitud(id),
    onSuccess: () => invalidarTrasResolver(qc),
    // si falla (p. ej. 409 porque otro moderador ya resolvió), la pantalla se
    // actualiza con el estado real
    onError: () => qc.invalidateQueries({ queryKey: ['solicitudCargo'] }),
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useRechazarSolicitud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }) => rechazarSolicitud(id, motivo),
    onSuccess: () => invalidarTrasResolver(qc),
    onError: () => qc.invalidateQueries({ queryKey: ['solicitudCargo'] }),
  });
}