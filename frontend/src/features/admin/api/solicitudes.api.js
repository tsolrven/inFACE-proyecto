import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

// GET /admin/solicitudes-cargo?estado=pendiente|aprobada|rechazada|cancelada|todas
export async function listarSolicitudesAdmin({
  estado,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = buildQuery({ estado, pagina, limite });
  const res = await apiFetch(`/admin/solicitudes-cargo?${qs}`, { signal });
  return { items: res.data, meta: res.meta };
}

export async function obtenerSolicitudAdmin(id, { signal } = {}) {
  const res = await apiFetch(`/admin/solicitudes-cargo/${id}`, { signal });
  return res.data;
}