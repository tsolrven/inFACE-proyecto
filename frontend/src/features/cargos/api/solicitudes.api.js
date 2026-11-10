import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

// GET /solicitudes-cargo/mias: las solicitudes del usuario, de la más nueva a
// la más antigua, cada una con sus respaldos.
export async function listarMisSolicitudes({
  pagina = 1,
  limite = 50,
  signal,
} = {}) {
  const qs = buildQuery({ pagina, limite });
  const res = await apiFetch(`/solicitudes-cargo/mias${qs ? `?${qs}` : ''}`, {
    signal,
  });
  return { solicitudes: res.data, meta: res.meta };
}

// payload: { tipo, carrera_id, mensaje }
export async function crearSolicitud(payload) {
  const res = await apiFetch('/solicitudes-cargo', {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function cancelarSolicitud(id) {
  const res = await apiFetch(`/solicitudes-cargo/${id}/cancelar`, {
    method: 'POST',
  });
  return res.data;
}