import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarReportesModeracion({
  vista,
  tipo,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = buildQuery({ vista, tipo, pagina, limite });
  const res = await apiFetch(`/reportes?${qs}`, { signal });
  return { items: res.data, meta: res.meta };
}

export async function obtenerRespuestasPredeterminadas({ signal } = {}) {
  const res = await apiFetch('/reportes/respuestas', { signal });
  return res.data;
}

export async function obtenerReportesDeContenido(
  tipo,
  id,
  { signal } = {},
) {
  const res = await apiFetch(`/reportes/contenido/${tipo}/${id}`, { signal });
  return res.data;
}

export async function cerrarReportesDeContenido(tipo, id, payload) {
  const res = await apiFetch(`/reportes/contenido/${tipo}/${id}/cerrar`, {
    method: 'POST',
    body: payload,
  });
  return res.data;
}

export async function reintentarCorreoReporte(id) {
  const res = await apiFetch(`/reportes/${id}/correo/reintentar`, {
    method: 'POST',
  });
  return res.data;
}

export async function listarReportesDeUsuario(
  usuarioId,
  lista,
  { signal } = {},
) {
  const res = await apiFetch(
    `/admin/usuarios/${usuarioId}/reportes?lista=${encodeURIComponent(lista)}`,
    { signal },
  );
  return res.data;
}