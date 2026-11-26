import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarAnuncios({
  carrera_id,
  flair_id,
  cargo,
  hashtag,
  busqueda,
  orden,
  sin_fijado,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = buildQuery({
    carrera_id,
    flair_id,
    cargo,
    hashtag,
    busqueda,
    orden,
    sin_fijado,
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

// Los destacados de la carrera (máximo 5). Sin carrera_id, la del usuario.
export async function obtenerAnunciosFijados(carrera_id, { signal } = {}) {
  const qs = buildQuery({ carrera_id });
  const res = await apiFetch(`/anuncios/fijados${qs ? `?${qs}` : ''}`, {
    signal,
  });
  return res.data;
}

export async function fijarAnuncio(id, fijado) {
  const res = await apiFetch(`/anuncios/${id}/fijar`, {
    method: 'PATCH',
    body: { fijado },
  });
  return res.data;
}