import { useQuery } from '@tanstack/react-query';
import {
  buscarUsuarios,
  obtenerFichaUsuario,
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