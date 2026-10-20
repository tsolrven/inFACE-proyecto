import { apiFetch } from '@/shared/api/client';

function buildQuery(params = {}) {
  const filtrados = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== '',
  );
  return new URLSearchParams(filtrados).toString();
}

export async function listarApuntes({
  carrera_id,
  ramo_id,
  tipo,
  tipo_archivo,
  hashtag,
  orden,
  pagina = 1,
  limite = 20,
} = {}) {
  const qs = buildQuery({
    carrera_id,
    ramo_id,
    tipo,
    tipo_archivo,
    hashtag,
    orden,
    pagina,
    limite,
  });
  const res = await apiFetch(`/apuntes${qs ? `?${qs}` : ''}`);
  return { apuntes: res.data, meta: res.meta };
}

export async function obtenerApunte(id) {
  const res = await apiFetch(`/apuntes/${id}`);
  return res.data;
}

export async function crearApunte(payload) {
  const res = await apiFetch('/apuntes', { method: 'POST', body: payload });
  return res.data;
}

export async function actualizarApunte(id, payload) {
  const res = await apiFetch(`/apuntes/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.data;
}

export async function eliminarApunte(id) {
  return apiFetch(`/apuntes/${id}`, { method: 'DELETE' });
}
