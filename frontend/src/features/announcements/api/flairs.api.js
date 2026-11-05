import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarFlairs(carreraId, { signal } = {}) {
  const qs = buildQuery({ carrera_id: carreraId });
  const res = await apiFetch(`/flairs${qs ? `?${qs}` : ''}`, { signal });
  return res.data; // [{ id, carrera_id, nombre, color }]
}

// La carrera no se envía: el backend usa la del usuario.
export async function crearFlair(payload) {
  const res = await apiFetch('/flairs', { method: 'POST', body: payload });
  return res.data;
}

// Solo viajan los campos modificados (nombre y/o color).
export async function actualizarFlair(id, payload) {
  const res = await apiFetch(`/flairs/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.data;
}

export async function eliminarFlair(id) {
  return apiFetch(`/flairs/${id}`, { method: 'DELETE' });
}