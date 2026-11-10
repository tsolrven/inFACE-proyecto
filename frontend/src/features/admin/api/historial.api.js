import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarHistorial({
  tipo,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = buildQuery({ tipo, pagina, limite });
  const res = await apiFetch(`/admin/historial?${qs}`, { signal });
  return { items: res.data, meta: res.meta };
}