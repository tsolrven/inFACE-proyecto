import { apiFetch } from '@/shared/api/client';

export async function guardarContenido(tipoContenido, id) {
  const res = await apiFetch(`/guardados/${tipoContenido}/${id}`, {
    method: 'PUT',
  });
  return res.data;
}

export async function quitarGuardado(tipoContenido, id) {
  const res = await apiFetch(`/guardados/${tipoContenido}/${id}`, {
    method: 'DELETE',
  });
  return res.data;
}

// `padre`: solo con tipo='comentario'; filtra por el tipo de contenido al que
// pertenece el comentario ('apunte', 'hilo'…).
export async function listarGuardados({
  tipo = 'apunte',
  padre,
  pagina = 1,
  limite = 20,
  signal,
} = {}) {
  const qs = new URLSearchParams({ tipo, pagina, limite });
  if (padre) qs.set('padre', padre);
  const res = await apiFetch(`/guardados?${qs.toString()}`, { signal });
  return { items: res.data, meta: res.meta };
}
