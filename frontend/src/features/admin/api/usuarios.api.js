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