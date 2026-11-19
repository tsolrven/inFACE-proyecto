import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  buscarUsuarios,
  obtenerFichaUsuario,
  revocarCargo,
} from '@/features/admin/api/usuarios.api';
import { listarReportesDeUsuario } from '@/features/admin/api/moderacion.api';
import { BUSQUEDA_MIN } from '@/features/admin/utils/usuarioUi';

// Raíz 'usuario': invalidar ['usuario'] alcanza búsquedas y fichas.
export const usuarioKeys = {
  busqueda: (q) => ['usuario', 'busqueda', q],
  ficha: (usuarioId) => ['usuario', 'ficha', usuarioId],
  reportes: (usuarioId, lista) => ['usuario', 'reportes', usuarioId, lista],
};
// ────────────────────────────────────────────────────────────────────────────────────────
export function useBuscarUsuarios(q) {
  return useQuery({
    queryKey: usuarioKeys.busqueda(q),
    queryFn: ({ signal }) => buscarUsuarios(q, { signal }),
    enabled: q.length >= BUSQUEDA_MIN,
    staleTime: 0,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useFichaUsuario(usuarioId) {
  return useQuery({
    queryKey: usuarioKeys.ficha(usuarioId),
    queryFn: ({ signal }) => obtenerFichaUsuario(usuarioId, { signal }),
    enabled: !!usuarioId,
    staleTime: 0,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useReportesDeUsuario(usuarioId, lista) {
  return useQuery({
    queryKey: usuarioKeys.reportes(usuarioId, lista),
    queryFn: ({ signal }) =>
      listarReportesDeUsuario(usuarioId, lista, { signal }),
    enabled: !!usuarioId,
    staleTime: 0,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// onSettled y no onSuccess: si da 409 (ya revocado o vencido) la ficha se
// refresca con el estado real. También el historial: queda la acción registrada.
export function useRevocarCargo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cargoId, motivo }) => revocarCargo(cargoId, motivo),
    onSettled: (_data, _error, { usuarioId }) => {
      qc.invalidateQueries({ queryKey: usuarioKeys.ficha(usuarioId) });
      qc.invalidateQueries({ queryKey: ['admin', 'historial'] });
    },
  });
}
