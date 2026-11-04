import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarFlairs(carreraId, { signal } = {}) {
  const qs = buildQuery({ carrera_id: carreraId });
  const res = await apiFetch(`/flairs${qs ? `?${qs}` : ''}`, { signal });
  return res.data; // [{ id, carrera_id, nombre, color }]
}
