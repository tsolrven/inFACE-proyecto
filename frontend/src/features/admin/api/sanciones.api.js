import { apiFetch } from '@/shared/api/client';

export async function listarSancionesDeUsuario(usuarioId, { signal } = {}) {
  const res = await apiFetch(`/admin/usuarios/${usuarioId}/sanciones`, {
    signal,
  });
  return res.data;
}

export async function aplicarSancion(usuarioId, payload) {
  const res = await apiFetch(`/admin/usuarios/${usuarioId}/sanciones`, {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function revocarSancion(usuarioId, sancionId, payload = {}) {
  const res = await apiFetch(
    `/admin/usuarios/${usuarioId}/sanciones/${sancionId}/revocar`,
    { method: 'POST', body: payload },
  );
  return res.data;
}