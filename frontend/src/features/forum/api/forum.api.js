import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarHilos({
  carrera_id,
  ramo_id,
  hashtag,
  orden,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = buildQuery({
    carrera_id,
    ramo_id,
    hashtag,
    orden,
    pagina,
    limite,
  });
  const res = await apiFetch(`/hilos${qs ? `?${qs}` : ''}`, { signal });
  return { hilos: res.data, meta: res.meta };
}

export async function crearHilo(payload, archivos = []) {
  const formData = new FormData();
  formData.append('datos', JSON.stringify(payload));
  archivos.forEach((f) => formData.append('archivos', f));
  const res = await apiFetch('/hilos', { method: 'POST', body: formData });
  return res.data;
}

export async function actualizarHilo(id, payload) {
  const res = await apiFetch(`/hilos/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.data;
}

export async function eliminarHilo(id) {
  return apiFetch(`/hilos/${id}`, { method: 'DELETE' });
}

export async function obtenerHilo(id, { signal } = {}) {
  const res = await apiFetch(`/hilos/${id}`, { signal });
  return res.data;
}

export async function aceptarRespuesta(hiloId, comentarioId) {
  const res = await apiFetch(`/hilos/${hiloId}/respuesta-aceptada`, {
    method: 'PUT',
    body: { comentario_id: comentarioId },
  });
  return res.data; // { respuesta_aceptada_id, resuelto }
}

export async function desmarcarRespuesta(hiloId) {
  const res = await apiFetch(`/hilos/${hiloId}/respuesta-aceptada`, {
    method: 'DELETE',
  });
  return res.data; // { respuesta_aceptada_id: null, resuelto: false }
}
