import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listarSancionesDeUsuario,
  aplicarSancion,
  revocarSancion,
} from '@/features/admin/api/sanciones.api';

// Raíz 'sancion': invalidar ['sancion'] alcanza todo el historial cargado.
export const sancionKeys = {
  usuario: (usuarioId) => ['sancion', 'usuario', usuarioId],
};
// ────────────────────────────────────────────────────────────────────────────────────────
// staleTime 0: el estado de una sanción cambia solo (vence) y la decide
// otro moderador; al abrir el panel siempre se pide de nuevo.
export function useSancionesDeUsuario(usuarioId, { enabled = true } = {}) {
  return useQuery({
    queryKey: sancionKeys.usuario(usuarioId),
    queryFn: ({ signal }) => listarSancionesDeUsuario(usuarioId, { signal }),
    enabled: !!usuarioId && enabled,
    staleTime: 0,
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
// onSettled y no onSuccess: si da 409 (ya tiene una vigente, cuenta
// anonimizada) la pantalla se refresca con el estado real.
export function useAplicarSancion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, payload }) => aplicarSancion(usuarioId, payload),
    onSettled: (_data, _error, { usuarioId }) =>
      qc.invalidateQueries({ queryKey: sancionKeys.usuario(usuarioId) }),
  });
}
// ────────────────────────────────────────────────────────────────────────────────────────
export function useRevocarSancion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, sancionId, payload }) =>
      revocarSancion(usuarioId, sancionId, payload),
    onSettled: (_data, _error, { usuarioId }) =>
      qc.invalidateQueries({ queryKey: sancionKeys.usuario(usuarioId) }),
  });
}