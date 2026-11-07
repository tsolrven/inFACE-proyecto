import { apiFetch } from '@/shared/api/client';
import { buildQuery } from '@/shared/api/buildQuery';

export async function listarObras({
  tipo,
  hashtag,
  orden,
  solo_mias,
  busqueda,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = buildQuery({
    tipo,
    hashtag,
    orden,
    solo_mias: solo_mias ? 'true' : null,
    busqueda,
    pagina,
    limite,
  });
  const res = await apiFetch(`/obras${qs ? `?${qs}` : ''}`, { signal });
  return { obras: res.data, meta: res.meta };
}

export async function obtenerObra(id, { signal } = {}) {
  const res = await apiFetch(`/obras/${id}`, { signal });
  return res.data;
}

export async function crearObra(payload, archivos = []) {
  const formData = new FormData();
  formData.append('datos', JSON.stringify(payload));
  archivos.forEach((f) => formData.append('archivos', f));
  const res = await apiFetch('/obras', { method: 'POST', body: formData });
  return res.data;
}

export async function actualizarObra(id, payload) {
  const res = await apiFetch(`/obras/${id}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.data;
}

export async function eliminarObra(id) {
  return apiFetch(`/obras/${id}`, { method: 'DELETE' });
}

function formDeImagen(file) {
  const fd = new FormData();
  fd.append('archivos', file);
  return fd;
}

export async function subirPortada(obraId, file) {
  const res = await apiFetch(`/obras/${obraId}/portada`, {
    method: 'PUT',
    body: formDeImagen(file),
  });
  return res.data;
}

export function quitarPortada(obraId) {
  return apiFetch(`/obras/${obraId}/portada`, { method: 'DELETE' });
}

export async function subirImagenPersonaje(obraId, personajeId, file) {
  const res = await apiFetch(
    `/obras/${obraId}/personajes/${personajeId}/imagen`,
    { method: 'PUT', body: formDeImagen(file) },
  );
  return res.data;
}

export function quitarImagenPersonaje(obraId, personajeId) {
  return apiFetch(`/obras/${obraId}/personajes/${personajeId}/imagen`, {
    method: 'DELETE',
  });
}

export async function obtenerParrafos(capituloId, { signal } = {}) {
  const res = await apiFetch(`/obras/capitulos/${capituloId}/parrafos`, {
    signal,
  });
  return res.data; 
}

export async function resolverParrafo(capituloId, indice) {
  const res = await apiFetch(
    `/obras/capitulos/${capituloId}/parrafos/${indice}`,
    { method: 'POST' },
  );
  return res.data;
}

export async function subirAudioPista(obraId, pistaId, file) {
  const res = await apiFetch(`/obras/${obraId}/pistas/${pistaId}/audio`, {
    method: 'PUT',
    body: formDeImagen(file),
  });
  return res.data;
}

export function quitarAudioPista(obraId, pistaId) {
  return apiFetch(`/obras/${obraId}/pistas/${pistaId}/audio`, {
    method: 'DELETE',
  });
}

export async function obtenerComentariosParrafos(obraId, { signal } = {}) {
  const res = await apiFetch(`/obras/${obraId}/comentarios-parrafos`, {
    signal,
  });
  return res.data;
}

export async function obtenerHashtagsPopulares({ signal } = {}) {
  const res = await apiFetch('/obras/hashtags?limite=40', { signal });
  return res.data; 
}