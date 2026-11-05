import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarAnuncios({
  carrera_id,
  flair_id,
  hashtag,
  orden,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = buildQuery({
    carrera_id,
    flair_id,
    hashtag,
    orden,
    pagina,
    limite,
  });
  const res = await apiFetch(`/anuncios${qs ? `?${qs}` : ''}`, { signal });
  return { anuncios: res.data, meta: res.meta };
}

export async function obtenerAnuncio(id, { signal } = {}) {
  const res = await apiFetch(`/anuncios/${id}`, { signal });
  return res.data;
}

export async function crearAnuncio(payload, archivos = []) {
  const formData = new FormData();
  formData.append('datos', JSON.stringify(payload));
  archivos.forEach((f) => formData.append('archivos', f));
  const res = await apiFetch('/anuncios', { method: 'POST', body: formData });
  return res.data;
}

export async function actualizarAnuncio(id, payload) {
  const res = await apiFetch(`/anuncios/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.data;
}

export async function eliminarAnuncio(id) {
  return apiFetch(`/anuncios/${id}`, { method: 'DELETE' });
}