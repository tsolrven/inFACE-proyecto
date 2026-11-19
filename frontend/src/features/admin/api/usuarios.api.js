import { apiFetch } from '@/shared/api/client';

export async function buscarUsuarios(q, { signal } = {}) {
  const res = await apiFetch(`/admin/usuarios?q=${encodeURIComponent(q)}`, {
    signal,
  });
  return res.data;
}

export async function obtenerFichaUsuario(usuarioId, { signal } = {}) {
  const res = await apiFetch(`/admin/usuarios/${usuarioId}`, { signal });
  return res.data;
}

// Revoca un cargo de CEE o tutor (motivo obligatorio; ver cargosAdmin.validation.js)
export async function revocarCargo(cargoId, motivo) {
  const res = await apiFetch(`/admin/cargos/${cargoId}/revocar`, {
    method: 'POST',
    body: { motivo },
  });
  return res.data;
}