import { useQuery } from '@tanstack/react-query';
import {
  buscarUsuarios,
  obtenerFichaUsuario,
} from '@/features/admin/api/usuarios.api';
import { BUSQUEDA_MIN } from '@/features/admin/utils/usuarioUi';

// Raíz 'usuario': invalidar ['usuario'] alcanza búsquedas y fichas.
export const usuarioKeys = {
  busqueda: (q) => ['usuario', 'busqueda', q],
  ficha: (usuarioId) => ['usuario', 'ficha', usuarioId],
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