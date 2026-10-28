import { apiFetch } from '@/shared/api/client';

export async function reportar(tipoContenido, contenidoId, payload) {
  const res = await apiFetch(`/reportes/${tipoContenido}/${contenidoId}`, {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function listarMisReportes() {
  const res = await apiFetch('/reportes/me');
  return res.data;
}
